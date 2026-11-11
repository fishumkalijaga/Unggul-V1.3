/* Local, conservative draft review of FED evidence. No AI model / external backend.
   It NEVER certifies compliance from text matching. Copyright © [2026] ramalabs. */
(function(global){'use strict';
const STOP=new Set('yang dan atau dengan pada untuk dari dalam karena adalah telah ini itu oleh sebagai kepada terhadap melalui dapat adanya serta suatu tidak sudah bahwa antara berdasarkan berdasarkan akan juga berupa menjadi dilakukan memiliki telah sesuai sebagaimana program studi perguruan tinggi mahasiswa lulusan dosen unit pengelola pembelajaran hasil tahun kegiatan data jumlah berupa secara harus seluruh setiap rata terkait kondisi kriteria indikator penilaian skor penerapan proses dokumen tabel informasi menunjukkan memiliki terdapat mampu dipenuhi melakukan memiliki pemenuhan dapat'.split(' '));
const trim=(s,n=350)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);
function words(s){return (String(s||'').toLowerCase().match(/[a-zÀ-ÿ0-9]+/g)||[]).filter(w=>w.length>=4&&!STOP.has(w)&&!/^20\d\d$/.test(w));}
function overlap(a,b){const x=new Set(words(a)),y=new Set(words(b));if(!x.size||!y.size)return 0;let h=0;for(const w of x)if(y.has(w))h++;return h/Math.sqrt(x.size*y.size);}
function evidenceSignal(t){return /\b(telah|ditetapkan|tercatat|dilaksanakan|tersedia|mengimplementasikan|menyelenggarakan|memiliki|mencapai|diperoleh|didokumentasikan|dilakukan|melaksanakan|memenuhi|diterapkan|menghasilkan|melibatkan|menerbitkan|dievaluasi|ditindaklanjuti|dilaporkan|disahkan|dimonitor|diterbitkan)\b/i.test(t);}
function instructional(t){return /^(?:jelaskan|uraikan|tuliskan|sebutkan|berikan|isi|deskripsikan|cantumkan|sumber\s*:|keterangan\s*:|tabel\s+[\w-]+|bagian\s+[A-Z0-9]|program studi diwajibkan|petunjuk)/i.test(t)||/\b(mohon diisi|harap dilengkapi|diisi oleh|diisi dengan|format tabel|contoh pengisian|panduan pengisian|untuk diisi)\b/i.test(t);}
const numericRules={
 9:{labels:['ipk rata-rata','rata-rata ipk','rerata ipk','ipk lulusan'],suffix:'',unit:'IPK'},
 12:{labels:['rata-rata masa studi','rerata masa studi','masa studi rata-rata'],suffix:'',unit:'tahun'},
 13:{labels:['lulusan tepat waktu','kelulusan tepat waktu'],suffix:'%',unit:'%'},
 14:{labels:['keberhasilan studi','persentase kelulusan'],suffix:'%',unit:'%'},
 15:{labels:['waktu tunggu','masa tunggu kerja'],suffix:'',unit:'bulan'},
 16:{labels:['kesesuaian bidang kerja','kesesuaian pekerjaan'],suffix:'%',unit:'%'},
 18:{labels:['kepuasan pengguna','kepuasan lulusan'],suffix:'%',unit:'%'},
 43:{labels:['persentase praktikum','pembelajaran praktikum'],suffix:'%',unit:'%'},
 44:{labels:['jumlah dprps','dosen tetap program studi'],suffix:'',unit:'orang'},
 46:{labels:['jabatan akademik'],suffix:'%',unit:'%'},
 48:{labels:['rasio mahasiswa','rasio mhs'],suffix:'',unit:'rasio'},
 51:{labels:['dosen tidak tetap'],suffix:'%',unit:'%'},
 55:{labels:['publikasi internasional','publikasi jurnal internasional'],suffix:'%',unit:'%'},
 56:{labels:['anggota asosiasi','keanggotaan asosiasi'],suffix:'%',unit:'%'},
 62:{labels:['dana operasional pendidikan per mahasiswa','dana operasional per mahasiswa'],suffix:'',unit:'juta rupiah/mahasiswa'},
 63:{labels:['dana penelitian per dprps','dana penelitian'],suffix:'',unit:'juta rupiah/DPRPS'},
 64:{labels:['dana pkm per dprps','dana pengabdian'],suffix:'',unit:'juta rupiah/DPRPS'},
 69:{labels:['penelitian melibatkan mahasiswa','penelitian dengan mahasiswa'],suffix:'%',unit:'%'},
 71:{labels:['pkm melibatkan mahasiswa','pengabdian melibatkan mahasiswa'],suffix:'%',unit:'%'}
};
function numericCandidate(no,text,core){const cfg=numericRules[no];if(!cfg||!core.getRule(no))return null;const t=String(text||'').toLowerCase();for(const label of cfg.labels){let pos=t.indexOf(label);while(pos>=0){const snippet=t.slice(pos+label.length,pos+label.length+85).split(/[.;\n]/)[0];const m=snippet.match(/^(?:[^\d]{0,22})(\d{1,5}(?:[.,]\d{1,3})?)(\s*%|\s*bulan|\s*tahun|\s*juta)?/);if(m){let raw=m[1];if(/\d{1,3}\.\d{3}$/.test(raw))return null;const val=Number(raw.replace(',','.'));const rule=core.getRule(no);const expected=cfg.suffix;const suffix=m[2]||'';const isPercent=rule.unit.includes('%');const isTime=rule.unit.toLowerCase().includes('bulan')||rule.unit.toLowerCase().includes('tahun');const isMoney=rule.unit.toLowerCase().includes('juta');const hasUnit=isPercent?/%/.test(suffix):isTime?new RegExp(rule.unit.toLowerCase().includes('bulan')?'bulan':'tahun').test(suffix):isMoney?/juta|rp\s*[\d]/.test(snippet):true;
 if((isPercent||isTime||isMoney)&&!hasUnit){pos=t.indexOf(label,pos+label.length);continue;}
 const score=core.suggestedScore(no,val);if(score!==null)return {score,value:val,label,unit:cfg.unit};}
 pos=t.indexOf(label,pos+label.length);
 }}return null;}
function analyzeItem(r,candidates,core,fileName){let src=(candidates||[]).map((x,i)=>typeof x==='string'?{text:trim(x,700),source:`${fileName} · cuplikan ${i+1}`}:x).filter(x=>x&&x.text&&!instructional(x.text));src=src.map(x=>({...x,match:Math.max(overlap(r.title,x.text),numericCandidate(r.no,x.text,core)?.score!==undefined?0.45:0)})).filter(x=>x.match>=.11).sort((a,b)=>b.match-a.match).slice(0,3);const best=src[0];let score=null,confidence='tidak cukup',basis='',numeric=null,why='Tidak ditemukan cuplikan substantif yang cukup relevan untuk mengusulkan skor. FED dapat berisi tabel/objek yang tidak terbaca oleh ekstraksi teks.';
 if(best){const measured=src.map(x=>numericCandidate(r.no,x.text,core)).find(Boolean);
  if(measured){score=measured.score;numeric=measured;confidence='indikasi numerik';basis=`Terdeteksi label “${measured.label}” dan nilai ${measured.value} ${measured.unit} di cuplikan FED. Ambang numerik menyarankan skor ${score}, tetapi periode, penyebut, dan kecukupan data belum diverifikasi.`;why=basis;}
  else if(best.match>=.26&&evidenceSignal(best.text)) {score=Math.max(1,r.minScore);confidence='rendah · kualitatif';why='Teks memuat indikasi tindakan/implementasi relevan, tetapi kelengkapan unsur rubrik dan dokumen pendukung belum diverifikasi. Skor 1 hanyalah titik awal diskusi, bukan konfirmasi kepatuhan.';basis='Kecocokan konsep dan pernyataan aktivitas dalam FED.';}
  else{confidence='bukti parsial';why='Ada kemiripan topik dengan indikator, tetapi tidak cukup untuk mengusulkan skor (belum ada nilai terlabel atau bukti implementasi yang jelas).';}
 }
 const pieces=[];
 if(score===null)pieces.push(`Butir ${r.no}: SKOR BELUM DAPAT DIUSULKAN. ${why}`);
 else pieces.push(`Butir ${r.no}: USULAN SKOR SEMENTARA ${score} (bobot ${r.weight}; potensi nilai berbobot ${score*r.weight}), tingkat keyakinan: ${confidence}. ${why}`);
 if(best)pieces.push(`Cuplikan FED yang perlu diperiksa (${best.source||fileName}): “${trim(best.text,330)}”.`);
 pieces.push(`Rubrik skor ${score??2} untuk pembanding: ${trim(r['r'+(score??2)],330)}.`);
 pieces.push('Langkah review: pastikan tabel, periode TS, sumber data, validitas dokumen, dan seluruh unsur rubrik; perbaiki skor serta narasi sebelum menjadi hasil asesmen.');
 return {no:r.no,proposedScore:score,confidence,why,basis,numeric,excerpts:src.map(x=>({text:trim(x.text,460),source:x.source||fileName,match:x.match})),draftNarrative:pieces.join(' '),status:!best?'tanpa_bukti':score===null?'perlu_tinjau':'usulan',checked:false};}
function reviewFed(imported,rubrics,core){const out={};const source=trim(imported?.name||'FED tidak disebutkan',180);for(const r of rubrics){out[r.no]=imported?.template?analyzeItem(r,[],core,source):analyzeItem(r,imported?.candidates?.[r.no]||[],core,source);}return {sourceName:source,createdAt:new Date().toISOString(),template:Boolean(imported?.template),total:rubrics.length,items:out};}
function summary(review){const values=Object.values(review?.items||{});return {all:values.length,proposed:values.filter(x=>x.proposedScore!==null).length,missing:values.filter(x=>x.status==='tanpa_bukti').length,review:values.filter(x=>x.status==='perlu_tinjau').length,numeric:values.filter(x=>x.confidence==='indikasi numerik').length};}
global.FedAutoReview={analyzeItem,reviewFed,summary,numericCandidate,overlap};
})(typeof window!=='undefined'?window:globalThis);
