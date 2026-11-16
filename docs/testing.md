# DOKUMENTASI PENGUJIAN MEDAUDIT AI

**Nama aplikasi:** MedAudit AI – Healthcare Data Quality System  
**Versi saat pengujian:** Prototype v0.7.1  
**Target pengembangan:** v0.7.1  
**Jenis pengujian:** Pengujian fungsional manual  
**Dataset:** 8 data kunjungan sintetis (DEMO-101–DEMO-108)

---

## 1. Tujuan Pengujian

Pengujian dilakukan untuk memastikan fitur utama MedAudit AI berjalan sesuai rancangan.

Ruang lingkup pengujian:

- Pengelolaan data kunjungan.
- Pemeriksaan kelengkapan data.
- Pemeriksaan kualitas data berdasarkan DQ-01 sampai DQ-10.
- Pencarian dan penyaringan data.
- Penampilan hasil audit.
- Ekspor dan impor data.
- Validasi struktur, ukuran, jumlah record, tipe, dan panjang field pada backup JSON.
- Dashboard dan visualisasi hasil audit.
- Parser lokal WHO ICD-10 Volume 3 edisi 2016 dan pembandingan kode terhadap Tabular WHO 2019.

## 2. Lingkungan Pengujian

| Komponen | Keterangan |
|---|---|
| Perangkat | Smartphone Android |
| Browser | Browser modern |
| Platform | GitHub Pages |
| Bahasa pemrograman | HTML, CSS, JavaScript |
| Penyimpanan | Browser LocalStorage |
| Dataset | Data sintetis |
| Database server | Tidak digunakan |

## 3. Skenario Pengujian Fungsional

| No. | Fitur | Hasil yang diharapkan | Status |
|---|---|---|---|
| 1 | Dashboard | Ringkasan data dan grafik ditampilkan | Lulus |
| 2 | Tambah data | Data berhasil disimpan | Lulus |
| 3 | Edit data | Perubahan berhasil disimpan | Lulus |
| 4 | Hapus data | Data dapat dihapus | Lulus |
| 5 | Pemeriksaan audit | Temuan ditampilkan sesuai aturan | Lulus |
| 6 | Detail audit | Rincian temuan dapat dilihat | Lulus |
| 7 | Pencarian | Data ditemukan berdasarkan kata kunci | Lulus |
| 8 | Filter status | Data tersaring berdasarkan status | Lulus |
| 9 | Ekspor CSV | Data berhasil diekspor | Lulus |
| 10 | Backup JSON | Cadangan data berhasil dibuat | Lulus |
| 11 | Impor JSON | Data cadangan berhasil dipulihkan | Lulus |
| 12 | Halaman Tentang | Informasi aplikasi ditampilkan | Lulus |

**Catatan:** Status berdasarkan skenario pengujian manual yang telah dilakukan. Unit test otomatis mesin audit ditambahkan melalui Node.js test runner. Pengujian UI browser dan pengujian keamanan menyeluruh belum diklaim selesai.

## 4. Pengujian Aturan Audit

| Kode | Aturan pemeriksaan | Skenario |
|---|---|---|
| DQ-01 | Kelengkapan nomor RM dan nama | Nomor RM atau nama kosong |
| DQ-02 | Validitas tanggal masuk | Tanggal kosong, tidak valid, atau di masa depan |
| DQ-03 | Validitas tanggal keluar | Tanggal tidak valid atau lebih awal dari tanggal masuk |
| DQ-04 | Kelengkapan diagnosis utama | Diagnosis utama kosong |
| DQ-05 | Format dasar kode ICD-10 | Kode kosong atau format tidak sesuai pola dasar |
| DQ-06 | Kelengkapan kelas rawat | Kelas rawat kosong |
| DQ-07 | Kelengkapan resume medis | Resume belum ditandai lengkap |
| DQ-08 | Autentikasi DPJP | Autentikasi belum ditandai tersedia |
| DQ-09 | Duplikasi nomor RM | Dua kunjungan berbeda menggunakan nomor RM sama (case-insensitive) |
| DQ-10 | Konsistensi diagnosis-kode | Diagnosis yang termasuk daftar contoh memiliki kode berbeda dari pasangan contoh |

## 5. Pengujian Referensi Indeks ICD-10

Tes impor PDF WHO penuh tersedia secara opsional pada `tests/icd10-who-pdf.test.cjs` dan memerlukan file PDF lokal melalui variabel lingkungan `WHO_ICD10_INDEX_PDF`.

Unit test parser mencakup ekstraksi kode tunggal/berpasangan/wildcard, pemisahan kolom berdasarkan asal teks berulang, preservasi spasi eksplisit PDF, hierarki dash Unicode, rujukan silang, running header, matriks transportasi, awal Section I, batas Section III, serta pembedaan jumlah baris Tabular dan jumlah kode unik. Browser smoke test otomatis menggunakan Chromium menguji viewport seluler 390×844 dan desktop 1440×900, unggah PDF fixture, pembacaan Tabular, pencarian kode, pemulihan cache, dan layout responsif. Tes PDF WHO penuh tersedia secara opsional melalui `WHO_ICD10_INDEX_PDF` dan dilewati pada CI ketika PDF tidak tersedia di runner. Pada 16 November 2026, uji manual Android berhasil memproses PDF WHO 2016 dan Tabular TXT, menjalankan lima pencarian baseline (`abscess`, `diabetes`, `hypertension`, `brain`, `G06.0`), serta memuat ulang referensi dari IndexedDB setelah reload. Validasi ini merupakan smoke/regression check berbasis sampel, bukan pemeriksaan seluruh entri secara manual. CI terbaru setelah perbaikan cache dan backup (run #43806310880) menjalankan 35 tes: 34 lulus, 0 gagal, dan 1 dilewati. Browser smoke test juga mensimulasikan kegagalan tulis IndexedDB akibat kuota, memastikan hasil pencarian tetap tersedia selama sesi aktif; menguji bahwa backup JSON yang field-nya tidak valid tidak menimpa data lokal; dan memverifikasi metadata versi backup `0.7.1`. PR #8 menambahkan validasi impor untuk file maksimal 5 MB, 5.000 record, batas panjang setiap field, serta tipe data; tes browser tambahan memastikan field terlalu panjang dan jumlah record berlebihan ditolak tanpa mengubah data lokal. Pengujian tambahan ini masih menunggu hasil CI setelah perbaikan navigasi panel backup.

**Batasan:** Alphabetical Index yang dipakai adalah WHO Volume 3 edisi 2016, sedangkan Tabular pembanding adalah WHO 2019. Kode yang tidak ditemukan pada versi pembanding tidak otomatis invalid.

## 6. Hasil Pengujian Dataset Sintetis

| ID Kunjungan | Temuan yang diharapkan | Hasil |
|---|---|---|
| DEMO-101 | Tidak ada temuan | Sesuai |
| DEMO-102 | DQ-06 | Sesuai |
| DEMO-103 | DQ-07 | Sesuai |
| DEMO-104 | DQ-08 | Sesuai |
| DEMO-105 | DQ-02 | Sesuai |
| DEMO-106 | DQ-03 | Sesuai |
| DEMO-107 | DQ-04 dan DQ-05 | Sesuai |
| DEMO-108 | DQ-05 | Sesuai |

### Ringkasan Hasil Audit

| Indikator | Jumlah |
|---|---:|
| Total kunjungan | 8 |
| Lolos aturan dasar | 1 |
| Perlu ditinjau | 7 |
| Total temuan | 8 |

## 7. Pengujian Backup dan Pemulihan Data

Langkah pengujian:

1. Membuat cadangan menggunakan fitur Backup JSON.
2. Memastikan file JSON berhasil diunduh.
3. Mengimpor file melalui fitur pemulihan data.
4. Memastikan jumlah data yang dipulihkan sesuai.
5. Memeriksa kembali data pada halaman Hasil Audit.

**Hasil:** Berhasil. Sebanyak 8 data kunjungan berhasil dimuat kembali.

## 8. Batasan Pengujian

Pengujian ini belum mencakup:

- Pengujian UI browser langsung pada perangkat pengguna.
- Pengujian keamanan secara menyeluruh.
- Pengujian multi-pengguna.
- Integrasi dengan SIMRS atau database rumah sakit.
- Validasi klinis diagnosis dan kode ICD-10 secara menyeluruh.
- Pengujian performa dengan jumlah data besar.
- Pemeriksaan konsistensi diagnosis dan kode ICD-10 berdasarkan referensi resmi.

DQ-05 hanya memeriksa pola format dasar. Panel indeks membantu penelusuran, tetapi pembandingan edisi 2016 dan 2019 bukan validasi klinis atau penetapan kode final.

## 9. Rencana Pengembangan Pengujian

1. Menjalankan pengujian manual panel indeks pada browser Android dan desktop.
2. Menguji responsivitas dan penggunaan memori saat memproses PDF besar.
3. Memperluas unit test dan pengujian regresi setelah perubahan kode.
4. Menuntaskan pengujian regresi untuk batas ukuran file 5 MB, 5.000 record, tipe/panjang field, dan preservasi data lokal pada impor gagal.
5. Menguji keamanan, aksesibilitas, dan validasi struktur file impor.

## 10. Kesimpulan

Berdasarkan skenario pengujian manual yang telah dilakukan, fitur utama prototype MedAudit AI dapat dijalankan pada lingkungan browser.

Aplikasi telah mendukung pengelolaan data kunjungan sintetis, pemeriksaan kualitas data berbasis aturan, visualisasi hasil audit, serta pencadangan dan pemulihan data lokal.

Pengembangan berikutnya difokuskan pada peningkatan aturan audit, pengujian otomatis, dokumentasi teknis, dan penyempurnaan antarmuka.

---

**MedAudit AI – Healthcare Data Quality System**

Prototype untuk demonstrasi dan portofolio informatika kesehatan.

**Peringatan:** Aplikasi ini bukan sistem produksi. Jangan memasukkan data pasien nyata. Hasil pemeriksaan tidak menggantikan keputusan klinis maupun validasi profesional kodifikasi.


## 11. Catatan versi 0.5.0

- DQ-09 membandingkan nomor RM antar-record dan mengabaikan perbedaan kapitalisasi.
- DQ-10 hanya membandingkan beberapa pasangan diagnosis-kode demonstrasi yang ditentukan secara eksplisit; diagnosis lain tidak dinilai.
- Unit test mesin audit dan parser indeks serta browser smoke test Chromium dijalankan melalui GitHub Actions.
- Perintah lokal: `npm install --no-save --no-package-lock playwright@1.58.2`, `npx playwright install chromium`, lalu `node --test tests/*.test.cjs`. Untuk mengaktifkan tes PDF WHO penuh, set `WHO_ICD10_INDEX_PDF` ke path PDF WHO Volume 3 edisi 2016.
- Pada pemeriksaan CI commit `24ababc`: 34 tes terdaftar, 33 lulus, 0 gagal, dan 1 tes impor PDF WHO penuh dilewati karena file sumber tidak tersedia di runner. Angka ini adalah hasil tes otomatis, bukan hasil validasi penuh terhadap PDF WHO.
- Browser smoke test menggunakan viewport seluler 390×844. Uji manual Android fisik sudah dilakukan untuk lima pencarian baseline dan persistensi IndexedDB; pengujian tambahan lintas perangkat tetap disarankan.
- Pengujian ini tidak membuktikan ketepatan klinis atau validitas kode ICD-10 secara menyeluruh.
