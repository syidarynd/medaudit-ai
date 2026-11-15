
# MedAudit AI – Healthcare Data Quality System

**AI-Assisted Medical Records Audit & Data Quality System**

Prototipe portofolio informatika kesehatan oleh Said Ariyandi.

---

## 1. Status Proyek

| Informasi | Keterangan |
|---|---|
| Nama aplikasi | MedAudit AI |
| Status | Prototype frontend statis |
| Versi saat ini | Prototype v0.5.0 |
| Target pengembangan | v0.5.0 |
| Platform demo | GitHub Pages |
| Dataset | 8 data kunjungan sintetis |

MedAudit AI merupakan prototipe untuk mendemonstrasikan pengelolaan data kunjungan dan pemeriksaan kualitas data rekam medis berbasis aturan.

Aplikasi berjalan di browser dan menyimpan data secara lokal menggunakan LocalStorage.

> **Penting:** Aplikasi ini bukan sistem produksi atau database klinis. Jangan memasukkan data pasien nyata.

## 2. Demo Aplikasi

**Akses aplikasi:**

https://syidarynd.github.io/medaudit-ai/

## 3. Fitur yang Tersedia

- Dashboard ringkasan total kunjungan, data lolos aturan dasar, data yang perlu ditinjau, dan persentase tanpa temuan.
- Visualisasi distribusi status audit dan jumlah temuan berdasarkan kode DQ.
- Pengelolaan data kunjungan: tambah, lihat detail, edit, dan hapus.
- Pencarian berdasarkan nomor rekam medis, nama/inisial fiktif, diagnosis, dan kode.
- Filter berdasarkan status audit.
- Pemeriksaan kualitas data berbasis aturan DQ-01 sampai DQ-10.
- Pencarian istilah melalui Alphabetical Index ICD-10 dari PDF lokal.
- Pembandingan kode indeks dengan daftar kode terminal/non-terminal pada Tabular WHO 2019 yang dipilih pengguna.
- Ekspor laporan ke CSV.
- Backup dan pemulihan data melalui JSON.
- Penyimpanan lokal menggunakan LocalStorage.
- Dataset demonstrasi sintetis.

## 4. Aturan Pemeriksaan Kualitas Data

| Kode | Pemeriksaan |
|---|---|
| DQ-01 | Kelengkapan nomor rekam medis dan nama |
| DQ-02 | Validitas tanggal masuk |
| DQ-03 | Validitas tanggal keluar dan kronologi tanggal |
| DQ-04 | Kelengkapan diagnosis utama |
| DQ-05 | Kelengkapan dan format dasar kode ICD-10 |
| DQ-06 | Kelengkapan kelas rawat |
| DQ-07 | Kelengkapan resume medis |
| DQ-08 | Ketersediaan autentikasi DPJP |

DQ-09 mendeteksi nomor RM duplikat antar-kunjungan. DQ-10 membandingkan pasangan diagnosis-kode demonstrasi terbatas; keduanya bukan validasi klinis atau encoder ICD-10 resmi.

### Referensi pencarian ICD-10

- Alphabetical Index: ICD-10 2e Volume 3 (2013), dipilih dan diproses secara lokal oleh pengguna.
- Tabular pembanding: WHO ICD-10 2019, file TXT dipilih secara lokal.
- Karena edisinya berbeda, status cocok/tidak cocok hanya pembanding teknis dan tidak menetapkan validitas kode Indonesia/BPJS.
- Dataset sumber tidak disertakan dalam repositori; aplikasi tidak mengunggah atau menyimpan file referensi ke LocalStorage.

## 5. Teknologi

| Teknologi | Penggunaan |
|---|---|
| HTML5 | Struktur aplikasi |
| CSS3 | Tampilan dan responsivitas |
| Vanilla JavaScript (ES6) | Logika aplikasi |
| LocalStorage | Penyimpanan data lokal |
| Chart.js | Visualisasi dashboard |
| PDF.js 3.11.174 | Ekstraksi teks PDF di browser |
| GitHub | Manajemen repositori |
| GitHub Pages | Publikasi aplikasi |

Proyek dirancang menggunakan teknologi gratis dan tidak memerlukan API key, backend, database cloud, atau layanan berbayar.

## 6. Struktur Repositori

```text
medaudit-ai/
│
├── index.html
├── demo-data.js
├── README.md
│
├── js/
│   ├── audit.js
│   └── icd10-index.js
│
├── css/
│
├── js/
│
├── docs/
│   ├── testing.md
│   └── icd10-index.md
│
└── tests/
    └── audit-test-cases.md
```

Struktur di atas menggambarkan file dan folder utama yang tersedia pada repositori. Logika audit dan pencarian indeks dipisahkan ke modul JavaScript di folder `js/`.

## 7. Menjalankan Aplikasi

### Melalui GitHub Pages

1. Buka tautan demo aplikasi.
2. Gunakan browser modern.
3. Gunakan data demonstrasi atau data sintetis buatan sendiri.

### Menjalankan secara lokal

1. Unduh atau clone repositori.
2. Ekstrak folder proyek.
3. Buka `index.html` melalui browser modern atau server lokal statis.

**Catatan penyimpanan:**

Data LocalStorage terikat pada origin, browser, dan perangkat yang digunakan. Data tidak otomatis tersinkronisasi antarperangkat.

Lakukan backup JSON secara berkala sebelum membersihkan data browser atau berpindah perangkat.

## 8. Dokumentasi dan Pengujian

Dokumentasi proyek:

- [Dokumentasi Pengujian](docs/testing.md)
- [Skenario Uji Aturan Audit](tests/audit-test-cases.md)

Pengujian yang didokumentasikan merupakan pengujian fungsional manual pada skenario yang telah dicoba.

Unit test mesin audit dan parser indeks dijalankan melalui GitHub Actions. Pengujian UI browser lintas perangkat, keamanan menyeluruh, dan performa skala besar belum diklaim selesai.

## 9. Batasan Sistem

- DQ-05 hanya memeriksa pola format dasar. Panel indeks adalah alat bantu pencarian; pembandingan indeks 2013 dengan Tabular 2019 tidak memastikan ketepatan kode atau kesesuaian standar Indonesia.
- Mesin pemeriksaan menggunakan aturan tetap (*rule-based*), belum menggunakan model AI atau LLM. DQ-10 adalah pemeriksaan silang daftar contoh terbatas, bukan validasi ICD-10 resmi.
- Aplikasi belum memiliki autentikasi pengguna, fitur multi-user, sinkronisasi cloud, atau audit trail server-side.
- LocalStorage tidak dirancang untuk menyimpan rekam medis pasien nyata.
- Hasil audit merupakan indikator untuk ditinjau petugas berwenang, bukan keputusan klinis, penetapan kode final, atau keputusan klaim otomatis.
- Keputusan klinis dan kodifikasi akhir tetap memerlukan validasi profesional.

## 10. Roadmap Pengembangan

1. Menguji pengalaman pencarian indeks pada berbagai browser/perangkat dan memperbaiki ekstraksi PDF bila diperlukan.
2. Memperluas cakupan unit test dan pengujian browser/regresi.
3. Menyempurnakan pemeriksaan duplikasi nomor rekam medis (DQ-09).
4. Memperluas daftar contoh DQ-10 hanya setelah ditinjau menggunakan referensi ICD-10 resmi.
5. Meningkatkan responsivitas, aksesibilitas, dan pengalaman pengguna.
6. Melengkapi dokumentasi teknis dan pengujian regresi.

## 11. Lisensi dan Penggunaan

Proyek ini dibuat untuk pembelajaran, demonstrasi, dan portofolio profesional di bidang rekam medis serta informatika kesehatan.

Seluruh data demonstrasi bersifat sintetis atau fiktif.

---

**MedAudit AI – Healthcare Data Quality System**

*Prototype untuk demonstrasi dan portofolio informatika kesehatan.*
