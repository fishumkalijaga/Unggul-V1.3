/* PDF import for GitHub Pages: runs locally on the user device; PDF.js library is loaded from a pinned public CDN on first PDF import. Apache-2.0 PDF.js. Copyright © [2026] ramalabs. */
(function(global){'use strict';
const CDNS=[
 ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'],
 ['https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs','https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs']
];
let cachedLib=null;
async function loadPdfJs(){
 if(cachedLib)return cachedLib;
 const localModule=new URL('./vendor/pdf.min.mjs',document.baseURI).href;
 const localWorker=new URL('./vendor/pdf.worker.min.mjs',document.baseURI).href;
 for(const [moduleUrl,workerUrl] of [[localModule,localWorker],...CDNS]){
   try{const pdfjs=await import(moduleUrl);pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;cachedLib=pdfjs;return pdfjs;}
   catch(err){/* Try another source, without uploading any FED data. */}
 }
 throw Error('Pustaka PDF.js tidak dapat dimuat dari aset lokal maupun CDN. Pastikan deployment GitHub Actions berhasil. Alternatif: gunakan FED .docx.');
}

function linesFromTextContent(content,pageNo){
 const rows=[];
 for(const item of content.items||[]){
   const str=String(item.str||'').replace(/\s+/g,' ').trim();if(!str)continue;
   const tr=item.transform||[],x=Number(tr[4])||0,y=Number(tr[5])||0;
   let row=rows.find(r=>Math.abs(r.y-y)<2.7);
   if(!row){row={y,segments:[]};rows.push(row)}
   row.segments.push({x,text:str});
 }
 rows.sort((a,b)=>b.y-a.y);
 const out=[];
 for(let i=0;i<rows.length;i++){
   const line=rows[i].segments.sort((a,b)=>a.x-b.x).map(v=>v.text).join(' ').replace(/\s+/g,' ').trim();
   if(line.length>=3)out.push({text:line.slice(0,2000),source:`PDF hal. ${pageNo}, baris ${i+1}`,page:pageNo});
 }
 return out;
}
async function importPdf(file,rubrics,onProgress,options={}){
 if(file.size>65*1024*1024)throw Error('PDF melebihi batas 65 MB untuk pemrosesan browser. Pecah dokumen per bagian atau gunakan DOCX.');
 const pdfjs=options.pdfjs||await loadPdfJs();
 const loading=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
 let pdf;
 try{pdf=await loading.promise;const maxPages=250;if(pdf.numPages>maxPages)throw Error(`PDF memiliki ${pdf.numPages} halaman (batas ${maxPages}). Pisahkan PDF menjadi beberapa dokumen.`);
   const extracted=[];let emptyPages=0,textPages=0;
   for(let num=1;num<=pdf.numPages;num++){
     const page=await pdf.getPage(num);
     const lines=linesFromTextContent(await page.getTextContent({normalizeWhitespace:true}),num);
     const chars=lines.reduce((n,x)=>n+x.text.length,0);
     if(chars<32)emptyPages++;else textPages++;
     extracted.push(...lines);
     if(typeof onProgress==='function')onProgress(num,pdf.numPages);
     if(num%4===0)await new Promise(resolve=>setTimeout(resolve,0));
     page.cleanup?.();
   }
   const match=global.FedZipImport.matchEvidence(extracted,rubrics);
   return {...match,template:false,noReadableText:textPages===0,name:file.name,format:'PDF',pages:pdf.numPages,textPages,emptyPages,warning:emptyPages?`${emptyPages} dari ${pdf.numPages} halaman tidak memiliki teks terdeteksi. Halaman hasil pindai memerlukan OCR di luar aplikasi sebelum dapat dinilai.`:''};
 }catch(err){if(/password|Password/i.test(err.name||''))throw Error('PDF terkunci sandi. Buka kunci terlebih dahulu sebelum impor.');throw err}
 finally{try{await pdf?.destroy()}catch(e){}}
}
global.FedPdfImport={loadPdfJs,linesFromTextContent,importPdf};
})(typeof window!=='undefined'?window:globalThis);
