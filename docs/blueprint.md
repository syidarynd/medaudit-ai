
# BLUEPRINT TEKNIS MEDAUDIT AI

**Nama aplikasi:** MedAudit AI – Healthcare Data Quality System

**Versi target:** Prototype v0.4.0

**Jenis dokumen:** Blueprint teknis dan rancangan pengembangan

**Platform:** Web statis responsif

**Teknologi:** HTML5, CSS3, Vanilla JavaScript, LocalStorage, Chart.js, GitHub Pages

---

## 1. Tujuan Pengembangan

MedAudit AI dikembangkan sebagai prototipe portofolio untuk mendemonstrasikan pengelolaan data kunjungan, pemeriksaan kualitas data rekam medis berbasis aturan, penelusuran temuan, dan penyajian ringkasan audit.

Aplikasi bukan sistem informasi rumah sakit dan tidak ditujukan untuk menyimpan data pasien nyata.

## 2. Ruang Lingkup MVP

Fitur yang sudah tersedia pada prototipe v0.3.0:

- Dashboard ringkasan data dan hasil audit.
- Tambah, lihat, ubah, dan hapus data kunjungan.
- Pencarian dan filter data.
- Pemeriksaan kualitas data dengan aturan DQ-01 sampai DQ-08.
- Detail temuan audit.
- Ekspor laporan CSV.
- Backup dan pemulihan data JSON.
- Penyimpanan lokal melalui browser LocalStorage.

Target pengembangan v0.4.0:

- Penyempurnaan dashboard berdasarkan dokumen desain.
- Penyelarasan data dashboard dengan hasil audit dan data kunjungan.
- Peningkatan validasi dan penanganan kondisi kosong atau kesalahan penyimpanan.
- Pengujian regresi untuk memastikan fitur v0.3.0 tetap berfungsi.
- Penyempurnaan dokumentasi teknis.

DQ-09 dan DQ-10 masih merupakan rencana pengembangan, bukan fitur aktif.

## 3. Arsitektur Aplikasi

Aplikasi menggunakan arsitektur frontend statis (client-side application).

| Lapisan | Komponen | Tanggung jawab |
|---|---|---|
| Presentasi | HTML dan CSS | Struktur halaman dan tampilan |
| Logika aplikasi | Vanilla JavaScript | Navigasi dan interaksi |
| Mesin audit | Fungsi pemeriksaan DQ | Menghasilkan temuan berdasarkan aturan |
| Penyimpanan | Browser LocalStorage | Menyimpan data lokal |
| Visualisasi | Chart.js | Menampilkan grafik |
| Publikasi | GitHub Pages | Menyajikan aplikasi melalui web statis |

Alur data utama:

1. Pengguna membuka aplikasi.
2. Aplikasi membaca data dari LocalStorage.
3. Data diperiksa berdasarkan aturan yang aktif.
4. Hasil pemeriksaan digunakan oleh halaman Hasil Audit dan Dashboard.
5. Perubahan data disimpan kembali ke LocalStorage.
6. Pengguna dapat mengekspor CSV atau membuat backup JSON.

Seluruh proses berjalan di browser. Tidak terdapat backend, database server, autentikasi pengguna, atau sinkronisasi cloud.

## 4. Struktur Folder

### 4.1 Struktur repositori saat ini

Implementasi aplikasi masih berpusat pada `index.html`.

File yang telah diverifikasi pada repositori:

- `index.html`
- `demo-data.js`
- `README.md`
- `docs/testing.md`
- `docs/dashboard-design.md`

### 4.2 Struktur modul yang direncanakan

Struktur berikut merupakan target pemisahan kode secara bertahap, bukan klaim bahwa seluruh file sudah tersedia.

```text
medaudit-ai/
├── index.html
├── README.md
├── demo-data.js
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── storage.js
│   ├── audit-engine.js
│   ├── icd-validator.js
│   ├── report.js
│   └── backup.js
├── docs/
│   ├── blueprint.md
│   ├── dashboard-design.md
│   └── testing.md
└── tests/
    └── audit-test-cases.md
```

Pemisahan modul dilakukan setelah backup dan pengujian regresi. File lama tidak boleh dihapus hanya karena struktur baru direncanakan.

## 5. Rancangan Penyimpanan Data Lokal

### 5.1 Teknologi penyimpanan

Penyimpanan menggunakan browser LocalStorage. LocalStorage bukan database relasional dan tidak menyediakan transaksi, kontrol akses, atau sinkronisasi antarperangkat.

Kunci penyimpanan yang digunakan aplikasi saat ini:

`medaudit_ai_cases_v02`

Kunci tersebut harus dipertahankan selama pengembangan v0.4.0 kecuali migrasi data telah dirancang dan diuji.

### 5.2 Struktur konseptual data kunjungan

| Elemen | Keterangan |
|---|---|
| visitId | ID unik kunjungan |
| patient | Nama atau identitas demonstrasi fiktif |
| admissionDate | Tanggal masuk |
| dischargeDate | Tanggal keluar |
| diagnosis | Diagnosis utama |
| icdCode | Kode ICD-10 |
| classRoom | Kelas rawat |
| resumeComplete | Penanda kelengkapan resume |
| dpjpSigned | Penanda autentikasi DPJP |

Nama properti aktual harus mengikuti struktur kode aplikasi. Perubahan nama properti memerlukan penyesuaian pada formulir, mesin audit, dashboard, ekspor, dan impor.

### 5.3 Batasan dan keamanan data

- Hanya gunakan data sintetis atau fiktif.
- Jangan memasukkan identitas atau informasi pasien nyata.
- Data terikat pada origin, browser, dan perangkat.
- Penghapusan data browser dapat menghilangkan data aplikasi.
- Lakukan backup JSON sebelum perubahan besar.
- LocalStorage tidak boleh dianggap sebagai penyimpanan rekam medis yang aman.

## 6. Aturan Pemeriksaan Kualitas Data

| Kode | Pemeriksaan | Kondisi yang memicu temuan |
|---|---|---|
| DQ-01 | Kelengkapan nomor RM dan nama | Nomor RM atau nama kosong |
| DQ-02 | Validitas tanggal masuk | Tanggal kosong, tidak valid, atau di masa depan |
| DQ-03 | Validitas tanggal keluar | Tanggal keluar tidak valid atau lebih awal dari tanggal masuk |
| DQ-04 | Kelengkapan diagnosis utama | Diagnosis utama kosong |
| DQ-05 | Kelengkapan dan format dasar ICD-10 | Kode kosong atau tidak sesuai pola dasar |
| DQ-06 | Kelengkapan kelas rawat | Kelas rawat kosong |
| DQ-07 | Kelengkapan resume medis | Resume belum ditandai lengkap |
| DQ-08 | Ketersediaan autentikasi DPJP | Autentikasi DPJP belum ditandai tersedia |

DQ-05 hanya memeriksa pola format dasar. Aturan ini tidak membuktikan ketepatan klinis atau ketepatan pemilihan kode ICD-10.

DQ-09 (duplikasi nomor RM) dan DQ-10 (konsistensi diagnosis dan kode ICD-10) merupakan rencana pengembangan.

## 7. Alur Kerja Pengguna

1. Pengguna membuka Dashboard.
2. Pengguna membuka Data Kunjungan.
3. Pengguna menambah atau memilih data kunjungan sintetis.
4. Aplikasi menyimpan perubahan pada LocalStorage.
5. Mesin audit menjalankan aturan DQ-01 sampai DQ-08.
6. Pengguna membuka Hasil Audit untuk meninjau temuan.
7. Pengguna memperbaiki data bila diperlukan.
8. Pengguna membuka Laporan untuk mengekspor CSV.
9. Pengguna membuka Backup Data untuk membuat atau memulihkan cadangan JSON.

Hasil audit merupakan indikator pemeriksaan kualitas data dan tidak menggantikan validasi profesional.

## 8. Status dan Perhitungan Dashboard

Dashboard harus membaca sumber data yang sama dengan modul Data Kunjungan dan mesin audit.

Indikator utama:

- Total Kunjungan: jumlah seluruh data kunjungan.
- Lolos Aturan Dasar: jumlah data tanpa temuan.
- Perlu Ditinjau: jumlah data dengan satu atau lebih temuan.
- Total Temuan: jumlah seluruh temuan dari aturan aktif.

Prinsip perhitungan:

1. Setiap kunjungan dihitung satu kali pada Total Kunjungan.
2. Kunjungan tanpa temuan dihitung sebagai Lolos Aturan Dasar.
3. Kunjungan dengan minimal satu temuan dihitung sebagai Perlu Ditinjau.
4. Total Temuan merupakan akumulasi temuan, bukan jumlah kunjungan bermasalah.
5. KPI dan grafik diperbarui setelah data ditambah, diubah, dihapus, atau dipulihkan.
6. Kondisi data kosong harus ditampilkan secara informatif.

## 9. Backup, Impor, dan Pemulihan

- Backup dilakukan dalam format JSON.
- File backup memuat metadata versi dan kumpulan data.
- Impor harus memvalidasi struktur data sebelum mengganti data tersimpan.
- Impor tidak valid harus ditolak dengan pesan yang jelas.
- Pengguna harus memperoleh konfirmasi sebelum data lama diganti.
- Setelah pemulihan, jumlah dan isi data harus diperiksa kembali.
- Format backup tidak boleh diubah tanpa mempertimbangkan kompatibilitas versi sebelumnya.

## 10. Rencana Implementasi v0.4.0

1. Mengarsipkan backup aplikasi dan dataset yang digunakan.
2. Memeriksa struktur aktual kode dan ketergantungan antarfitur.
3. Menyelaraskan data demonstrasi dengan dataset sintetis DEMO-101 sampai DEMO-108.
4. Menyempurnakan dashboard sesuai `docs/dashboard-design.md`.
5. Memastikan KPI, grafik, dan tabel membaca data aktual.
6. Memperbaiki penanganan LocalStorage, impor, dan ekspor tanpa merusak kompatibilitas.
7. Menguji ulang skenario pada `docs/testing.md`.
8. Menguji tampilan smartphone dan desktop.
9. Memperbarui dokumentasi dan README setelah implementasi selesai.

## 11. Kriteria Penerimaan v0.4.0

Implementasi memenuhi target apabila:

- Fitur utama v0.3.0 tetap berjalan.
- Dataset sintetis dapat dimuat dan dikelola.
- Dashboard menampilkan angka yang sesuai dengan hasil audit.
- Grafik dan tabel mengikuti perubahan data.
- Backup dan pemulihan data tetap berfungsi.
- Tidak ada error kritis pada skenario uji.
- Tampilan dapat digunakan pada smartphone dan desktop.
- Dokumentasi sesuai dengan fitur yang benar-benar tersedia.

## 12. Batasan Sistem

- Aplikasi merupakan prototipe frontend statis.
- Tidak menggunakan database server atau backend.
- Tidak memiliki autentikasi dan pengaturan hak akses.
- Tidak memiliki audit trail server-side.
- Tidak terintegrasi dengan SIMRS atau BPJS.
- Belum menggunakan AI atau LLM untuk mengambil keputusan.
- Pemeriksaan ICD-10 terbatas pada pola format dasar.
- Tidak menghasilkan keputusan klinis, kodifikasi final, atau keputusan klaim otomatis.

---

**MedAudit AI – Healthcare Data Quality System**

*Blueprint teknis untuk pengembangan prototipe dan portofolio informatika kesehatan.*
