/* Local ZIP reader for DOCX and XLSX; no third-party service or upload. */
(function(){'use strict';
const td=new TextDecoder('utf-8');
async function openZip(data){const buf=data instanceof ArrayBuffer?data:await data.arrayBuffer(),dv=new DataView(buf),bytes=new Uint8Array(buf);let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65558);i--){if(dv.getUint32(i,true)===0x06054b50){end=i;break;}}if(end<0)throw new Error('Bukan arsip ZIP/DOCX/XLSX yang valid.');const count=dv.getUint16(end+10,true),start=dv.getUint32(end+16,true),map=new Map();let p=start;for(let i=0;i<count;i++){if(dv.getUint32(p,true)!==0x02014b50)throw Error('Direktori ZIP rusak.');const method=dv.getUint16(p+10,true),compressed=dv.getUint32(p+20,true),nameLength=dv.getUint16(p+28,true),extraLength=dv.getUint16(p+30,true),commentLength=dv.getUint16(p+32,true),off=dv.getUint32(p+42,true),name=td.decode(bytes.subarray(p+46,p+46+nameLength));if(!name.includes('../')&&!name.startsWith('/'))map.set(name,{method,compressed,off});p+=46+nameLength+extraLength+commentLength;}async function read(name){const ent=map.get(name);if(!ent)return null;let pos=ent.off;if(dv.getUint32(pos,true)!==0x04034b50)throw Error('Header ZIP rusak: '+name);pos+=30+dv.getUint16(pos+26,true)+dv.getUint16(pos+28,true);const b=bytes.slice(pos,pos+ent.compressed);if(ent.method===0)return b;if(ent.method!==8)throw Error('Metode kompresi ZIP belum didukung.');if(typeof DecompressionStream!=='function')throw Error('Browser tidak mendukung dekompresi ZIP lokal. Gunakan Chrome/Edge/Firefox terbaru.');try{const stream=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return new Uint8Array(await new Response(stream).arrayBuffer());}catch(e){throw Error('Tidak bisa mengekstrak data ZIP dalam browser ini: '+e.message);}}
return {files:Array.from(map.keys()),read,readText:async name=>{const b=await read(name);return b?td.decode(b):null;}};}
const parse=xml=>{const d=new DOMParser().parseFromString(xml,'application/xml');if(d.getElementsByTagName('parsererror').length)throw Error('Dokumen XML tidak dapat dibaca');return d;};
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function tag(el,name){return Array.from(el.getElementsByTagName('*')).filter(n=>n.localName===name);}
function docxParagraphs(xml){const d=parse(xml),all=Array.from(d.getElementsByTagName('*'));const paras=all.filter(n=>n.localName==='p').map(p=>norm(tag(p,'t').map(n=>n.textContent).join(''))).filter(Boolean);const tableRows=[];for(const tr of all.filter(n=>n.localName==='tr')){const cells=Array.from(tr.children).filter(n=>n.localName==='tc').map(tc=>norm(tag(tc,'t').map(n=>n.textContent).join(''))).filter(Boolean);if(cells.length>=2){const row=norm(cells.join(' | '));if(row.length>=45&&row.length<=1800)tableRows.push(row);}}return [...paras,...tableRows];}
function isPrompt(p){return /^(uraikan|tuliskan|lampirkan|identitas|tabel\s*\d|formulir evaluasi diri|nama|tuliskan data|jumlah tahun|keterangan:|untuk program studi|sumber:|contoh|program studi wajib|kolom\s+\d|beri tanda|merujuk pada|data diambil dari|jumlah lulusan|.*\(program studi tidak perlu mengisi)/i.test(p)||/\b(kolom\s+\d+\s+diisi|isikan pada kolom|perlu diisi|diisi dengan tanda centang)\b/i.test(p)||/[.…]{8,}/.test(p)||p.length<38;}
const words=s=>new Set(norm(s).toLowerCase().replace(/[^a-z0-9\s]/gi,' ').split(/\s+/).filter(x=>x.length>4&&!['dalam','untuk','program','studi','tahun','dengan','yang','pada','dalam','setiap','sesuai','terakhir','berikut','kegiatan','memiliki'].includes(x)));
function similarity(a,b){const wa=words(a),wb=words(b);let hit=0;for(const x of wa)if(wb.has(x))hit++;return hit/(Math.sqrt(wa.size*wb.size)||1);}
function candidateMatches(paras,rubrics){
 const sourceRows=(paras||[]).map((raw,index)=>typeof raw==='string'?{text:raw,source:`Paragraf/baris ekstraksi ${index+1} (cek dokumen asli)`}:{text:raw.text||'',source:raw.source||`Bagian ekstraksi ${index+1}`,page:raw.page});
 const data=sourceRows.map(x=>({...x,text:norm(x.text)})).filter(p=>!isPrompt(p.text)&&p.text.length>=30&&p.text.length<=2000);
 const map={},details={};
 for(const r of rubrics){
   const a=data.map(x=>({...x,score:Math.max(similarity(r.title,x.text),.75*similarity(r.r2,x.text),.68*similarity(r.r1,x.text),window.FedAutoReview?.numericCandidate(r.no,x.text,window.FedCore)?0.82:0)})).filter(q=>q.score>=.18).sort((x,y)=>y.score-x.score).slice(0,4);
   if(a.length){map[r.no]=a.map(x=>x.text);details[r.no]=a.map(x=>({text:x.text,source:x.source,match:x.score,page:x.page}));}
 }
 return {total:sourceRows.length,substantive:data.length,candidates:map,candidatesDetailed:details};
}
async function importFed(file,rubrics){let zip=await openZip(file);if(file.name.toLowerCase().endsWith('.zip')){const doc=zip.files.find(f=>/\.docx$/i.test(f)&&!f.includes('__MACOSX')&&!f.startsWith('~'));if(!doc)throw Error('ZIP tidak memiliki berkas FED .docx.');const nested=await zip.read(doc);zip=await openZip(nested.buffer);}const data=await zip.read('word/document.xml');if(!data)throw Error('Struktur DOCX tidak ditemukan.');
 // Fingerprint of the EXACT unfilled FED template supplied with this instrument.
 // Without this guard, instruction paragraphs in the template look like false-positive evidence.
 let blankTemplate=false;
 if(data.length===3571670){
   if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',data);const hex=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');blankTemplate=hex==='bb54d80ff588426f259fc21be9c852689b6a8da4c6618cba424705032891c114';}
   else {const snippet=td.decode(data.subarray(0,100000));blankTemplate=snippet.includes('FORMULIR EVALUASI DIRI')||snippet.includes('Formulir Evaluasi Diri');}
 }
 const paragraphs=docxParagraphs(td.decode(data));
 if(blankTemplate)return {total:paragraphs.length,substantive:0,candidates:{},candidatesDetailed:{},template:true,name:file.name};
 return {...candidateMatches(paragraphs,rubrics),template:false,name:file.name};}
function cellValue(c,strings){const typ=c.getAttribute('t'),v=tag(c,'v').at(0);if(typ==='inlineStr')return norm(tag(c,'t').map(n=>n.textContent).join(''));if(!v)return null;if(typ==='s')return strings[Number(v.textContent)]||'';if(typ==='b')return v.textContent==='1';if(typ==='str')return v.textContent;const vnum=Number(v.textContent);return Number.isFinite(vnum)?vnum:v.textContent;}
async function importExcel(file){const zip=await openZip(file),workbookXML=await zip.readText('xl/workbook.xml');if(!workbookXML)throw Error('Berkas tidak terlihat sebagai Excel (.xlsx).');const d=parse(workbookXML);const sheetNodes=tag(d,'sheet');const ix=sheetNodes.findIndex(x=>norm(x.getAttribute('name'))==='Kertas Kerja');if(ix<0)throw Error('Lembar "Kertas Kerja" tidak ditemukan. Gunakan format Excel asesmen IAPS 2.0 yang sesuai.');let path=`xl/worksheets/sheet${ix+1}.xml`;const rels=await zip.readText('xl/_rels/workbook.xml.rels');if(rels){const rd=parse(rels),rid=sheetNodes[ix].getAttribute('r:id')||sheetNodes[ix].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');const rel=tag(rd,'Relationship').find(x=>x.getAttribute('Id')===rid);if(rel){let target=rel.getAttribute('Target')||'';path=target.startsWith('/')?target.slice(1):target.startsWith('xl/')?target:'xl/'+target.replace(/^\.\//,'');}}
 const text=await zip.readText(path);if(!text)throw Error('Tidak dapat membaca lembar Kertas Kerja.');let strings=[];const shared=await zip.readText('xl/sharedStrings.xml');if(shared){const sd=parse(shared);strings=tag(sd,'si').map(si=>tag(si,'t').map(t=>t.textContent).join(''));}
 const rows=tag(parse(text),'row'),out={},nums=new Set();let current=null;
 for(const row of rows){const cells={};for(const c of Array.from(row.children).filter(x=>x.localName==='c')){const addr=c.getAttribute('r')||'';const col=(addr.match(/^[A-Z]+/)||[])[0];cells[col]=cellValue(c,strings);}const n=Number(cells.A);if(Number.isInteger(n)&&n>=1&&n<=73){current=n;nums.add(n);out[n]={score:null,evidence:'',notes:'',source:'',metric:'',narrative:'',_fallback:null};const direct=cells.G;if(direct===0||direct===1||direct===2)out[n]._fallback=direct;out[n].narrative=String(cells.H||'').trim();out[n].evidence='';out[n].source='Diimpor dari Kertas Kerja Excel — verifikasi terhadap FED/dokumen pendukung diperlukan.';}else if(current&&/^Skor Akhir$/i.test(String(cells.C||'').trim())){const score=cells.G;out[current].score=score===0||score===1||score===2?score:out[current]._fallback;}}
 for(const n of Object.keys(out)){if(out[n].score===null)out[n].score=out[n]._fallback;delete out[n]._fallback;}
 if(nums.size<50)throw Error('Berkas tidak cocok dengan struktur 73 butir penilaian.');
 // Import non-sensitive fields into browser state only; never bundle the uploaded workbook.
 // The example XLSX has its identity on Hasil Penilaian, cells A4:B8.
 const profile={};const hi=sheetNodes.findIndex(x=>norm(x.getAttribute('name'))==='Hasil Penilaian');
 if(hi>=0){let hp=`xl/worksheets/sheet${hi+1}.xml`;
   if(rels){const rd=parse(rels),rid=sheetNodes[hi].getAttribute('r:id')||sheetNodes[hi].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');const rel=tag(rd,'Relationship').find(x=>x.getAttribute('Id')===rid);if(rel){const t=rel.getAttribute('Target')||'';hp=t.startsWith('/')?t.slice(1):t.startsWith('xl/')?t:'xl/'+t.replace(/^\.\//,'');}}
   const hxml=await zip.readText(hp);if(hxml){for(const row of tag(parse(hxml),'row')){const cell={};for(const c of Array.from(row.children).filter(x=>x.localName==='c')){const col=((c.getAttribute('r')||'').match(/^[A-Z]+/)||[])[0];cell[col]=cellValue(c,strings);}const name=norm(cell.A).toLowerCase(),value=norm(cell.B);if(!value)continue;
     if(name==='perguruan tinggi')profile.pt=value;else if(name==='upps')profile.upps=value;else if(name==='program studi')profile.ps=value;else if(name==='ts')profile.ts=value;else if(name==='tanggal penilaian'){const m=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);profile.date=m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:value;}
   }}}
 return {items:out,imported:nums.size,name:file.name,profile};}
async function importWord(file,rubrics){
 const lower=file.name.toLowerCase();
 if(/\.(docx|zip)$/.test(lower))return importFed(file,rubrics);
 if(!lower.endsWith('.doc'))throw Error('Format Word tidak dikenali.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes[0]===0x50&&bytes[1]===0x4b)return importFed(file,rubrics);
 // A number of older .doc files were saved as Word 2003 XML, HTML, or RTF.
 // Do not pretend to parse opaque OLE binary .doc files without a reliable engine.
 const prefix=new TextDecoder('utf-8').decode(bytes.slice(0,3000)).trim();
 if(/^<(\?xml|html|!doctype)/i.test(prefix)){
    const raw=new TextDecoder('utf-8').decode(bytes),cleaned=raw.replace(/<\/(?:p|tr|div|h[1-6])[^>]*>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
    const paragraphs=cleaned.split(/\n+/).map(norm).filter(Boolean);
    return {...candidateMatches(paragraphs,rubrics),template:false,name:file.name,format:'DOC berbasis XML/HTML',warning:'Dokumen Word .doc berbasis XML/HTML diekstraksi sebagai teks; tata letak tabel mungkin berubah. Periksa dokumen asli.'};
 }
 if(/^\{\\rtf/i.test(prefix)){
    const raw=new TextDecoder('windows-1252').decode(bytes);
    const cleaned=raw.replace(/\\par\b/g,'\n').replace(/\\'[0-9a-fA-F]{2}/g,' ').replace(/\\[a-zA-Z]+-?\d* ?/g,' ').replace(/[{}]/g,' ');
    return {...candidateMatches(cleaned.split(/\n+/).map(norm).filter(Boolean),rubrics),template:false,name:file.name,format:'RTF dengan ekstensi DOC',warning:'Ekstraksi teks RTF sederhana. Rumus/tabel perlu diperiksa kembali.'};
 }
 throw Error('File .doc biner Word 97–2003 tidak dapat dibaca secara andal di GitHub Pages tanpa layanan konversi. Buka berkas dengan Word/LibreOffice, pilih Simpan Sebagai .docx atau ekspor PDF berbasis teks, lalu impor kembali.');
}
window.FedZipImport={openZip,importFed,importWord,importExcel,matchEvidence:candidateMatches,similarity,isPrompt};
})();
