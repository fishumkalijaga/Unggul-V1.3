# Unggul Prediction — ramalabs

**Aplikasi asesmen kecukupan dan review Formulir Evaluasi Diri (FED) LAMSPAK IAPS 2.0 Unggul Program Sarjana.** Satu situs web statis siap unggah ke GitHub Pages. Tidak memerlukan server aplikasi, database, token, atau API eksternal.

## Sumber materi dan ketepatan fungsi

Dibuat dari tiga berkas yang diberikan pengguna:

1. ZIP `14_IAPS-2.0-Unggul_Sarjana(1).zip`, berisi `FED_Unggul_Sarjana.docx` (template formulir, belum terisi), `14_Matriks Penilaian Unggul_Sarjana.pdf` (16 halaman, 73 butir, skor 0–2, bobot), dan `Alat Bantu Penghitungan Tabel.xlsx` (alat bantu tabel).
2. Dua XLSX contoh hasil asesmen dengan struktur `Menu`, `Kertas Kerja`, `Hasil Penilaian`, dan `Laporan`. Keduanya hanya menjadi rujukan struktur dan gaya deskripsi penilaian; **data identitas, skor, dan narasi contoh tidak disertakan dalam aplikasi yang akan dipublikasikan**.

Dari matriks: **73 butir**, jumlah bobot **141**, nilai maksimum **282**. Lima indikator syarat perlu Unggul yang ditandai pada contoh `Hasil Penilaian` adalah **9, 16, 55, 56, dan 60**. Skor terbobot tiap indikator = skor asesor × bobot. Beberapa indikator secara eksplisit tidak memiliki nilai kurang dari 1. Aplikasi menonaktifkan opsi skor 0 bagi indikator tersebut.

**Pembaruan: indikator hasil akreditasi otomatis (SIMULASI).** Setelah seluruh **73 butir** diberi skor, aplikasi menghitung kategori **Terakreditasi Unggul, Terakreditasi, atau Tidak Terakreditasi** berdasarkan Tabel 2 *Sistem dan Acuan Penilaian Akreditasi Unggul Program Studi Sarjana*, Lampiran 29 LAMSPAK (11 Oktober 2024), yang memuat ketentuan NA ≥ 141, pemenuhan 5 syarat perlu, dan larangan skor 0. Sebelum semua skor diisi, status adalah **Belum Final**, termasuk apabila sebagian skor sudah bernilai 0.

**Catatan penting tentang versi aturan:** Dokumen instrumen IAPS 2.0 yang diunggah pengguna memuat 73 rubrik per butir dan bobot; dokumen [LAMSPAK Buku B IAPS 2.0 yang diterbitkan Januari 2026](https://www.lamspak.id/wp-content/uploads/2026/01/B-Kriteria-Indikator-Prosedur-Asesmen-dan-Penilaian-Akreditasi-IAPS-2.0.pdf) mengonfirmasi kategori tiga status dan lima syarat perlu. Acuan Tabel 2 dengan ambang numerik **141** tersedia pada [Lampiran 29 LAMSPAK](https://www.lamspak.id/wp-content/uploads/2025/01/Lampiran-29-Instrumen-Akreditasi-untuk-Perolehan-Status-Terakreditasi-Unggul-Sistem-dan-Acuan-Program-Studi-Sarjana.pdf) (dokumen bertanggal 2024). Karena dokumen berasal dari periode berbeda, **hasil aplikasi adalah simulasi interpretasi dan bukan penetapan akreditasi resmi**. Cocokkan dengan instrumen dan peraturan LAMSPAK terbaru yang berlaku untuk jenis usulan program studi Anda.

## Fitur

- **Dashboard dan indikator status:** skor berbobot 0–282, jumlah item dinilai, kelengkapan bukti, indikator skor nol, lima syarat perlu Unggul, serta tiga kartu hasil status dengan satu kategori aktif (ketika seluruh 73 butir lengkap).
- **Asesmen per butir:** 73 indikator dengan kriteria penilaian skor 2/1/0, bobot, halaman matriks dan standar asal. Kolom bukti FED, lokasi dokumen, catatan kritis, skor asesor, narasi asesor, serta ekspor.
- **Penghitung ambang numerik:** beberapa butir numerik memiliki kalkulator sederhana untuk **saran skor bersyarat**. Hasil harus dikonfirmasi asesor setelah memverifikasi data dan kondisi khusus. Butir kompleks tetap dinilai manual.
- **Impor Excel `.xlsx`:** membaca skor dan narasi pada lembar `Kertas Kerja` dengan pola format dua file contoh. Anda dapat mengubah kembali hasil impor.
- **Baca FED `.docx` atau `.zip` berisi DOCX:** mengekstrak teks **di browser**, menampilkan calon cuplikan yang cocok dengan indikator. Template FED kosong yang sama persis dengan dokumen sumber dikenali dan tidak diperlakukan sebagai bukti. Pencocokan istilah bukan bukti validitas dan **tidak otomatis memberi skor**.
- **Backup JSON, restore JSON, CSV, Word DOCX asli, cetak atau simpan PDF A4**, termasuk kategori dan narasi alasan hasil asesmen.
- **Privasi:** data disimpan dengan `localStorage`. File DOCX/XLSX diproses pada perangkat pengguna tanpa dikirim ke server. Gunakan HTTPS GitHub Pages dan simpan backup terenkripsi secara terpisah apabila terdapat data sensitif.

### Keterbatasan

1. Dokumen FED yang terdapat di ZIP sumber merupakan **template belum terisi**. Aplikasi tidak memuat angka dan temuan program studi baru secara otomatis.
2. Penyusunan narasi bersifat **berbasis aturan** yang menggabungkan skor, kriteria matriks, dan bukti/catatan yang benar-benar dimasukkan. Aplikasi tidak dapat melakukan verifikasi substantif penuh terhadap validitas dokumen, masa berlaku, sampel, atau kepatuhan lembaga.
3. Ekstraksi FED hanya mendukung DOCX (langsung atau di dalam ZIP), bukan PDF pindai. Data kuantitatif yang menggunakan rumus gabungan perlu dicocokkan dengan alat bantu tabel dan dokumen pendukung.
4. Jika web browser tidak mendukung `DecompressionStream('deflate-raw')`, fitur impor DOCX/XLSX mungkin tidak berfungsi; gunakan browser modern atau masukkan data secara manual.
5. Jangan mengunggah file Excel/FED berisi informasi rahasia sebagai aset repository publik; lakukan **impor dari browser setelah situs diterbitkan**.

## Aturan simulasi penetapan kategori

| Kondisi setelah semua 73 butir dinilai | Status simulasi |
|---|---|
| NA ≥ 141, lima syarat perlu (butir 9, 16, 55, 56, 60) = 2, tidak ada skor 0 | **Terakreditasi Unggul** |
| Tidak ada skor 0, tetapi NA kurang dari 141 atau satu/lebih syarat perlu belum mencapai 2 | **Terakreditasi** |
| Ada satu/lebih indikator bernilai 0, terlepas dari total NA | **Tidak Terakreditasi** |
| Setidaknya satu dari 73 indikator belum dinilai | **Belum Final** — belum dinyatakan salah satu dari tiga kategori |

Meskipun kategori ditampilkan setelah seluruh skor terisi, **isi dan kualitas bukti tetap perlu diverifikasi** oleh asesor dan proses akreditasi resmi. Hal ini terutama relevan jika skor diimpor dari Excel tanpa dokumen FED pendukung.

### Kecocokan dengan dua file Excel yang diberikan

- Excel `ak-5812...20260921...xlsx` (unggahan ulang): **NA 209/282**, ada indikator nilai 0, syarat perlu belum terpenuhi → **Tidak Terakreditasi**.
- Excel `ak-8aa785...20261002...xlsx` (unggahan ulang): **NA 233/282**, tidak ada nilai 0, satu syarat perlu (butir 56) memperoleh 1 → **Terakreditasi**.

Angka diperiksa pada sel rekap `Hasil Penilaian!G4:G7` pada kedua file asli, **tidak disertakan dalam ZIP aplikasi publik**.

## Publikasikan di GitHub Pages

1. Unduh ZIP hasil, ekstrak seluruh berkas, **unggah isi ZIP** ke *root* repository GitHub (jangan unggah ZIP tunggal saja). Pastikan `index.html`, `rubric.js`, `core.js`, `app.js`, `zip-import.js`, `styles.css`, `docx-export.js`, dan folder `.github/workflows/` semuanya berada pada lokasi yang benar.
2. Buat repository publik misalnya `unggul-prediction-ramalabs` dan commit berkas ke `main`.
3. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Workflow di `.github/workflows/deploy.yml` akan memvalidasi instrumen dan perhitungan, membangun folder `dist/` secara otomatis, lalu menerbitkan **hanya berkas aplikasi** (tanpa file FED/Excel contoh). Pantau tab **Actions** sampai sukses.
5. URL: `https://USERNAME.github.io/unggul-prediction-ramalabs/`.

## Proses asesmen yang disarankan

Mulai dari mengisi identitas → unggah FED asli jika tersedia → untuk tiap item tinjau kandidat bukti, verifikasi dengan dokumen sumber/tabel/lampiran → isi catatan bukti dan keterbatasan → tetapkan skor sesuai rubrik → klik **Susun deskripsi dari bukti**, koreksi dan perjelas → lihat rekap dan syarat perlu → unduh Word/PDF/CSV serta backup JSON.

**Copyright © [2026] ramalabs. All rights reserved.**

## Pemeriksaan mandiri

Jalankan `node scripts/validate.mjs`, `node scripts/test-status.mjs`, dan `node scripts/build-pages.mjs` pada direktori proyek untuk mengecek rubrik dan menyiapkan berkas statis. Tidak diperlukan `npm install`. Setelah build, folder `dist/` berisi situs siap tayang.


## Logo ASPIKOM — sumber resmi dan cadangan lokal

- Logo utama merujuk ke aset pada **situs resmi ASPIKOM**: https://aspikom.org/wp-content/uploads/2018/09/logo-aspikom-1-300x71.png (dapat diperiksa dari halaman resmi https://aspikom.org/makna-logo-aspikom/).
- Saat halaman dibuka, logo dari `assets/logo-aspikom.png` **langsung terlihat**. Setelah logo dari situs resmi berhasil diunduh, aplikasi otomatis beralih ke gambar resmi; jika gagal, gambar lokal tetap terlihat tanpa gambar rusak. Sumber cadangan adalah gambar logo yang telah diberikan dalam percakapan.
- Logo berada di **pojok kanan atas**, sebagai tautan ke laman resmi. Ukuran mengikuti lebar perangkat dan tidak memengaruhi perhitungan asesmen.
- `scripts/build-pages.mjs` menyalin fallback logo ke `dist/assets/`, dan workflow GitHub Actions menerbitkan folder `dist`.
- Hak atas logo ASPIKOM tetap milik pemegang hak yang bersangkutan. Pencantuman logo tidak dengan sendirinya berarti bahwa aplikasi atau hasil asesmennya telah disahkan ASPIKOM/LAMSPAK.

**Copyright © [2026] ramalabs. All rights reserved.**


## Versi terbaru — Review otomatis 73 butir dari FED

Aplikasi ini menambahkan modul **Review Otomatis**. Unggah FED terisi dalam format `.docx` atau `.zip` yang memuat dokumen `.docx`. Seluruh pemrosesan berlangsung secara lokal dalam browser, tanpa mengirim dokumen ke server. Sistem menyiapkan **73 lembar draf**, satu untuk tiap butir, dengan:

- Kutipan teks yang dianggap relevan terhadap indikator dan lokasi rujukan sementara.
- **Skor usulan 0/1/2 jika ada indikasi mencukupi untuk estimasi awal**; tanpa bukti atau label numerik memadai, nilai tetap **belum dapat diusulkan**.
- Deskripsi penilaian sementara, alasan pengusulan skor, rubrik pembanding, dan masalah yang perlu ditelusuri.
- Tombol **Gunakan sebagai draf** per butir. Usulan tidak masuk rekap nilai sampai pengguna mengambil tindakan tersebut. Draf yang diterapkan tetap ditandai **perlu ditinjau ulang**.
- Ekspor khusus **Word (DOCX), PDF melalui cetak browser, CSV, dan Markdown** untuk diskusi/reviu bersama; skor sementara dan skor asesor ditampilkan terpisah.

### Batasan objektif

**Penting:** Fungsi otomatis adalah pencocokan kata, pengenalan pernyataan, dan beberapa pola angka berlabel, **bukan model bahasa AI atau validasi semantik dokumen**. Kelengkapan, kebenaran dan autentisitas bukti, serta terpenuhinya seluruh kriteria rubrik tidak dapat dibuktikan oleh fungsi tersebut. Tidak semua 73 item dapat diberi usulan skor bila FED tidak memuat data yang layak dibaca. Narasi draf selalu menandai keterbatasan ini.

Dokumen FED yang hanya berisi template instrumen tidak menghasilkan skor usulan fiktif. Dokumen scan PDF/gambar belum didukung untuk ekstraksi teks; konversikan lebih dulu menjadi `.docx` dengan teks yang dapat dipilih. Data FED dan draf penilaian disimpan dalam `localStorage` perangkat; gunakan **Backup JSON** untuk pindah komputer dan berhati-hati jika menggunakan perangkat bersama. Jangan mengunggah dokumen institusi atau identitas pribadi ke repository publik.

### Workflow untuk diskusi

1. **Data & Impor** → pilih FED `.docx` (atau ZIP berisi FED `.docx`).
2. **Review Otomatis** → periksa ringkasan dan filter *Ada skor usulan*, *Bukti belum memadai*, atau *Tanpa bukti*.
3. Buka per butir, baca rubrik dan dokumen sumber. Jika dibenarkan bukti, pilih **Gunakan sebagai draf** lalu koreksi catatan/narasi.
4. **Review Otomatis** → **Word diskusi**, **Markdown**, **CSV**, atau **PDF diskusi**. Gunakan laporan ini sebagai bahan forum tim, bukan keputusan resmi.
5. Hanya skor yang diperiksa dan dimasukkan ke kertas kerja menjadi bahan *simulasi kategori* pada dashboard.

**Copyright © [2026] ramalabs.**

**Pengaman kategori akreditasi:** Jika pengguna menyalin usulan skor otomatis ke kertas kerja, indikator akan ditandai **Belum Diverifikasi** dan kategori di dashboard tetap **Belum Final**, termasuk bila total 73 skor tampak lengkap. Setelah pemeriksaan dokumen asli dan koreksi narasi, pengguna dapat menekan **Tandai pemeriksaan bukti selesai** di tiap item untuk mengakui tanggung jawab atas review tersebut. Tindakan ini bukan verifikasi otomatis dari aplikasi.


## Pembaruan v3: FED PDF dan Word + draf massal 73 butir

- **PDF berbasis teks (`.pdf`)**: aplikasi mengekstrak per halaman melalui PDF.js 4.10.38 (Apache-2.0). Workflow GitHub Actions mengunduh dependensi dan menyertakannya sebagai aset **lokal** dalam situs; jika aset lokal tidak tersedia, aplikasi mencoba CDN sebagai cadangan. Dokumen diproses di browser dan **tidak dikirim ke server ramalabs**. Saat dipublikasikan menggunakan GitHub Actions, pembaca PDF dapat digunakan tanpa koneksi ke CDN saat runtime. Jika Anda hanya membuka `index.html` tanpa proses build, browser harus dapat mengakses CDN. Buka tab Data & Impor → Pilih FED PDF/Word.
- **Word `.docx`, `.zip` berisi DOCX**, dan **`.doc` lama yang berisi XML/HTML/RTF**: ekstraksi teks lokal. **DOC biner 97–2003 (OLE)** belum dapat diparse secara akurat di situs statis; konversikan dengan Word/LibreOffice menjadi DOCX atau PDF berbasis teks.
- **PDF pindai/gambar**: tidak ada OCR otomatis pada versi ini. Jika teks tidak tersedia, aplikasi menghitung halaman tidak terbaca dan **tidak** mengusulkan skor seolah bukti ada. Lakukan OCR secara eksternal sebelum impor.
- **73 draf sekaligus**: pada tab Review Otomatis, tekan **Isi 73 draf ke kertas kerja**. Semua butir yang belum mempunyai isian manual memperoleh draf bukti, rujukan halaman/baris, alasan, dan narasi; skor hanya terisi apabila memang ada usulan numerik atau kualitatif yang ditandai perlu verifikasi. Asesmen manual tidak ditimpa.
- **Catatan diskusi**: tersedia kolom editable per butir; diekspor ke **Word, PDF (melalui cetak browser), CSV, Markdown**. Backup JSON mencakup semua data termasuk catatan diskusi.
- **Simulasi akreditasi** tidak boleh menjadi final selama masih ada draf otomatis yang belum diverifikasi pengguna. Rubrik tetap 73 butir, bobot 141, maksimum 282.

**Catatan kerahasiaan:** Konten PDF tidak dikirim ke layanan analisis. Jika digunakan dari hasil build GitHub Actions, pustaka PDF.js sudah berada di folder `vendor/` lokal. Jika diakses langsung tanpa build, aplikasi dapat mencoba mengunduh pustaka dari CDN pihak ketiga. Tidak ada FED yang dikirim ke CDN. Penggunaan aplikasi tetap memerlukan evaluasi kebijakan privasi organisasi.


## Pembaruan: Reset rekomendasi dan review ulang FED

Pada halaman **Review Otomatis**, tersedia dua tindakan: **Analisis Ulang FED** untuk menjalankan kembali penghitungan 73 draf menggunakan dokumen yang masih dibuka pada sesi saat ini, serta **Reset & Impor FED Baru** untuk menghapus rekomendasi terdahulu dan langsung memilih berkas PDF/Word lain. Menu **Data & Impor** juga menyediakan tombol **Reset rekomendasi**.

- Reset rekomendasi menghapus 73 hasil review otomatis sebelumnya dan catatan diskusi terkait, **tetapi tidak menghapus profil program studi, skor asesor, bukti dan narasi yang sudah berada di Kertas Kerja**. Draf otomatis yang sebelumnya disalin ke Kertas Kerja **tetap berstatus perlu verifikasi** sampai diperiksa pengguna.
- Reset **berbeda** dari tombol **Reset asesmen** yang menghapus seluruh hasil penilaian lokal. Karena catatan diskusi lama akan dibersihkan, **unduh Word/CSV/PDF diskusi atau Backup JSON sebelum reset** bila ingin menyimpan arsip.
- Setelah reset, unggah FED yang telah diperbarui untuk menerima rekomendasi baru. Analisis ulang atas **file yang sama dan tanpa perubahan** dapat menghasilkan rekomendasi yang sama karena mesinnya deterministik dan berbasis aturan, bukan model AI generatif.
- Apabila browser dimuat ulang, teks asli FED tidak disimpan secara permanen. Gunakan **Impor FED** untuk mengulang analisis dokumen tersebut. Data kerja yang tersimpan di browser tetap dipertahankan.

**Copyright © [2026] ramalabs.**
