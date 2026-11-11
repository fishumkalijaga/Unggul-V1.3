/* Deterministic assessment calculations. Criteria derived from uploaded IAPS 2.0 PDF. */
(function(){'use strict';
const R=window.FED_RUBRIC||[];
const MUST=[9,16,55,56,60];
const RULES={
 9:{unit:'IPK (skala 0–4)',hint:'Rata-rata IPK lulusan 3 tahun, bukan IPK salah satu angkatan.',fn:v=>v>=3.25?2:1,min:0,max:4},
 12:{unit:'Tahun',hint:'Masa studi rata-rata: 3,5 < MS ≤ 4,5 untuk skor 2.',fn:v=>(v>3.5&&v<=4.5)?2:((v>3&&v<=3.5)||(v>4.5&&v<=8))?1:0,min:0,max:30},
 13:{unit:'Persen (%)',hint:'Persentase lulusan tepat waktu.',fn:v=>v>=50?2:1,min:0,max:100},
 14:{unit:'Persen (%)',hint:'Persentase keberhasilan studi.',fn:v=>v>=85?2:v>=30?1:0,min:0,max:100},
 15:{unit:'Bulan',hint:'Waktu tunggu kerja pertama rata-rata. Validasi tingkat respons tracer study.',fn:v=>v<6?2:v<=18?1:0,min:0,max:240},
 16:{unit:'Persen (%)',hint:'Persentase kesesuaian bidang kerja lulusan (perlu memeriksa kecukupan responden).',fn:v=>v>=60?2:1,min:0,max:100},
 18:{unit:'Persen (%)',hint:'Rata-rata persentase “sangat baik” tujuh aspek kepuasan pengguna.',fn:v=>v>=75?2:v>=25?1:0,min:0,max:100},
 43:{unit:'Persen (%)',hint:'Persentase pembelajaran berbentuk responsi, tutorial, seminar, praktikum, dan bentuk terkait.',fn:v=>v>=20?2:v>=10?1:0,min:0,max:100},
 44:{unit:'Jumlah DPRPS',hint:'Gunakan jumlah DPRPS yang memenuhi definisi serta kesesuaian bidang.',fn:v=>v>=12?2:v>=5?1:0,min:0,max:1000},
 46:{unit:'Persen (%)',hint:'Proporsi DPRPS dengan jabatan akademik yang dipersyaratkan.',fn:v=>v>=20?2:1,min:0,max:100},
 48:{unit:'Rasio mahasiswa/DPRPS',hint:'25 ≤ RMD ≤ 35 untuk skor 2.',fn:v=>v>=25&&v<=35?2:1,min:0,max:1000},
 51:{unit:'Persen (%)',hint:'Persentase dosen tidak tetap.',fn:v=>v<=10?2:1,min:0,max:100},
 55:{unit:'Persen (%)',hint:'Persentase rata-rata publikasi internasional relevan terhadap NDPRPS.',fn:v=>v>=50?2:1,min:0,max:10000},
 56:{unit:'Persen (%)',hint:'DPRPS anggota asosiasi keilmuan yang keanggotaannya masih berlaku.',fn:v=>v>=50?2:1,min:0,max:100},
 62:{unit:'Juta rupiah/mahasiswa',hint:'Dana operasional pendidikan rata-rata per mahasiswa sesuai definisi matriks.',fn:v=>v>=10?2:v>=5?1:0,min:0,max:100000},
 63:{unit:'Juta rupiah/DPRPS',hint:'Dana penelitian per DPRPS (validasi periode dan sumber hitungan).',fn:v=>v>=5?2:1,min:0,max:100000},
 64:{unit:'Juta rupiah/DPRPS',hint:'Dana PkM per DPRPS (validasi periode dan sumber hitungan).',fn:v=>v>=5?2:1,min:0,max:100000},
 69:{unit:'Persen (%)',hint:'Persentase penelitian DPRPS yang melibatkan mahasiswa.',fn:v=>v>=25?2:1,min:0,max:100},
 71:{unit:'Persen (%)',hint:'Persentase PkM DPRPS yang melibatkan mahasiswa.',fn:v=>v>=25?2:1,min:0,max:100}
};
const nval=x=>x===null||x===undefined||x===''?null:Number(x);
function getRule(n){return RULES[n]||null;}
function suggestedScore(n,value){const r=RULES[n],v=nval(value);if(!r||v===null||!Number.isFinite(v)||v<r.min||v>r.max)return null;return r.fn(v);}
function aggregate(items){let assessed=0,total=0,zero=0,evidenced=0;const grouped={};for(const r of R){const x=items[r.no]||{},s=nval(x.score),group=grouped[r.standard]||(grouped[r.standard]={total:0,done:0,points:0,max:0});group.total++;group.max+=r.weight*2;if(s!==null&&(s===0||s===1||s===2)){assessed++;total+=s*r.weight;group.done++;group.points+=s*r.weight;if(s===0)zero++}if(String(x.evidence||'').trim())evidenced++}const mustDone=MUST.filter(n=>nval((items[n]||{}).score)===2).length;return {assessed,total,zero,evidenced,mustDone,max:282,grouped,complete:assessed===73,allRequired:mustDone===5,noZero:zero===0};}
// Klasifikasi indikatif berdasarkan Tabel 2 Lampiran 29 LAMSPAK (Program Sarjana).
// Dokumen IAPS 2.0 terbaru harus diperiksa sebelum digunakan untuk keputusan formal.
const STATUS_REFERENCE={title:'Tabel 2, Sistem dan Acuan Penilaian Akreditasi Unggul Program Studi Sarjana (Lampiran 29 LAMSPAK)',url:'https://www.lamspak.id/wp-content/uploads/2025/01/Lampiran-29-Instrumen-Akreditasi-untuk-Perolehan-Status-Terakreditasi-Unggul-Sistem-dan-Acuan-Program-Studi-Sarjana.pdf',minimumUnggul:141};
function accreditation(items){
 const a=aggregate(items),zeroItems=[],requiredOutstanding=[];
 for(const r of R){const v=nval((items[r.no]||{}).score);if(v===0)zeroItems.push(r.no);}
 for(const n of MUST){const val=nval((items[n]||{}).score);if(val!==2)requiredOutstanding.push({no:n,score:val});}
 const unverifiedDraftItems=R.filter(r=>items[r.no]?.autoDraft&&items[r.no]?.needsReview).map(r=>r.no);const complete=a.complete&&unverifiedDraftItems.length===0,requiredMet=a.allRequired,zeroFree=a.noZero,aboveThreshold=a.total>=STATUS_REFERENCE.minimumUnggul;
 let slug='pending',label='Belum Final',why='Penetapan kategori ditunda sampai seluruh 73 butir diberi skor. Skor yang belum diisi tidak dianggap nol.';
 if(!complete&&unverifiedDraftItems.length){why=`Terdapat ${unverifiedDraftItems.length} skor draf otomatis yang belum disahkan asesor (butir ${unverifiedDraftItems.join(', ')}). Hasil tetap Belum Final sampai verifikasi selesai.`;}
 if(complete){
  if(!zeroFree){slug='not-accredited';label='Tidak Terakreditasi';why=`Terdapat ${zeroItems.length} indikator bernilai 0 (butir ${zeroItems.join(', ')}). Dalam rubrik, keberadaan skor 0 menggugurkan status Terakreditasi maupun Unggul tanpa memandang nilai akreditasi.`;}
  else if(aboveThreshold&&requiredMet){slug='excellent';label='Terakreditasi Unggul';why=`Nilai akreditasi ${a.total} memenuhi ambang minimal 141; kelima syarat perlu Unggul mendapat skor 2 dan tidak ditemukan indikator bernilai 0.`;}
  else{slug='accredited';label='Terakreditasi';why=`Tidak terdapat indikator bernilai 0, tetapi ${!aboveThreshold?'NA belum mencapai 141':`syarat perlu Unggul yang belum mencapai skor 2 adalah butir ${requiredOutstanding.map(x=>x.no).join(', ')}`}.`;
  }
 }
 return {slug,label,why,complete,unverifiedDraftItems,assessed:a.assessed,missing:73-a.assessed,points:a.total,max:a.max,zeroItems,requiredOutstanding,requiredMet,zeroFree,aboveThreshold,requiredMetCount:a.mustDone,minimumUnggul:STATUS_REFERENCE.minimumUnggul,source:STATUS_REFERENCE};
}
function decisionNarrative(d){
 const base=`Kategori hasil asesmen: ${d.label}${d.complete?'':' (belum dapat ditetapkan)'}. Nilai akreditasi ${d.points}/282; ${d.assessed}/73 butir dinilai; ${d.zeroItems.length} indikator bernilai 0; ${d.requiredMetCount}/5 syarat perlu Unggul memperoleh skor 2.`;
 return `${base} ${d.why} ${d.requiredOutstanding.length?'Syarat perlu belum memenuhi skor 2 pada butir '+d.requiredOutstanding.map(x=>x.no).join(', ')+'. ':''}Hasil merupakan simulasi berdasarkan rubrik yang dirujuk, bukan keputusan resmi LAMSPAK; verifikasi bukti dan instrumen terbaru wajib dilakukan.`;
}
function clean(s,max=1500){return String(s||'').trim().replace(/[ \t]+/g,' ').slice(0,max)}
function narrative(r,item){const score=nval(item.score),evi=clean(item.evidence,1400),remarks=clean(item.notes,950),source=clean(item.source,250),val=nval(item.metric);if(score===null)return `Indikator ${r.no} belum memperoleh skor asesor. ${evi?'Calon bukti tercatat: '+evi+'. ':'Belum terdapat bukti yang disetujui asesor. '}Penilaian perlu dilakukan setelah dokumen dan data sumber diperiksa.`;
 const basis=score===2?r.r2:score===1?r.r1:r.r0;
 let res=`Butir ${r.no} dinilai dengan skor ${score} (bobot ${r.weight}; nilai berbobot ${score*r.weight}). `;
 if(evi)res+=`Berdasarkan informasi/bukti yang dicatat asesor, ${evi}${/[.!?]$/.test(evi)?'':' '}. `;
 else res+=`Bukti pendukung belum dicatat; penilaian ini masih memerlukan verifikasi sebelum digunakan sebagai kesimpulan final. `;
 if(source)res+=`Rujukan bukti: ${source}. `;
 if(val!==null&&Number.isFinite(val)&&RULES[r.no])res+=`Nilai indikator yang dicatat: ${val} (${RULES[r.no].unit}). `;
 res+=`Kriteria rubrik skor ${score}: ${basis||'Rincian kriteria tidak tersedia pada matriks.'} `;
 if(remarks)res+=`Catatan kritis/keterbatasan: ${remarks}. `;
 if(!remarks)res+=`Kecukupan, autentisitas, serta kesesuaian periode bukti tetap harus diperiksa asesor.`;
 return res.replace(/\s+/g,' ').trim();}
function statusLabel(r,item){if(item.score===null||item.score===undefined||item.score==='')return 'Belum dinilai';return Number(item.score)===2?'Melampaui SN-DIKTI':Number(item.score)===1?'Memenuhi SN-DIKTI':'Tidak memenuhi';}
function readiness(a){if(!a.complete)return 'Belum final — '+(73-a.assessed)+' butir belum dinilai';if(a.zero)return 'Memerlukan tindak lanjut — terdapat '+a.zero+' skor nol';if(!a.allRequired)return 'Syarat perlu Unggul belum terpenuhi';return 'Seluruh indikator telah dinilai dan syarat perlu Unggul terpenuhi (simulasi administratif; bukan keputusan resmi)';}
function createBlank(){return {version:2,profile:{pt:'',upps:'',ps:'',assessor:'',ts:'',date:new Date().toISOString().slice(0,10)},items:{},createdAt:new Date().toISOString()};}
window.FedCore={R,MUST,RULES,STATUS_REFERENCE,getRule,suggestedScore,aggregate,accreditation,decisionNarrative,narrative,statusLabel,readiness,createBlank};
})();
