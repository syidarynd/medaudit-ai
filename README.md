
# MedAudit AI – Healthcare Data Quality System

**AI-Assisted Medical Records Audit & Data Quality System**

Prototipe portofolio informatika kesehatan oleh Said Ariyandi.

---

## 1. Status Proyek

| Informasi | Keterangan |
|---|---|
| Nama aplikasi | MedAudit AI |
| Status | Prototype frontend statis |
| Versi saat ini | Prototype v0.3.0 |
| Target pengembangan | v0.4.0 |
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
- Pemeriksaan kualitas data berbasis aturan DQ-01 sampai DQ-08.
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

**Rencana pengembangan:**

- DQ-09: Pemeriksaan duplikasi nomor rekam medis.
- DQ-10: Pemeriksaan konsistensi diagnosis dan kode ICD-10.

DQ-09 dan DQ-10 belum menjadi fitur aktif.

## 5. Teknologi

| Teknologi | Penggunaan |
|---|---|
| HTML5 | Struktur aplikasi |
| CSS3 | Tampilan dan responsivitas |
| Vanilla JavaScript (ES6) | Logika aplikasi |
| LocalStorage | Penyimpanan data lokal |
| Chart.js | Visualisasi dashboard |
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
├── css/
│
├── js/
│
├── docs/
│   └── testing.md
│
└── tests/
    └── audit-test-cases.md
```

Struktur di atas menggambarkan file dan folder utama yang tersedia pada repositori. Implementasi aplikasi saat ini masih berpusat pada `index.html`. Pemisahan modul kode akan dilakukan secara bertahap setelah pengujian dan pencadangan.

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

Pengujian otomatis menyeluruh, pengujian keamanan, dan pengujian performa skala besar belum dilakukan.

## 9. Batasan Sistem

- Pemeriksaan ICD-10 saat ini hanya memeriksa pola format dasar, bukan memastikan ketepatan kode berdasarkan indeks dan tabular resmi.
- Mesin pemeriksaan menggunakan aturan tetap (*rule-based*), belum menggunakan model AI atau LLM.
- Aplikasi belum memiliki autentikasi pengguna, fitur multi-user, sinkronisasi cloud, atau audit trail server-side.
- LocalStorage tidak dirancang untuk menyimpan rekam medis pasien nyata.
- Hasil audit merupakan indikator untuk ditinjau petugas berwenang, bukan keputusan klinis, penetapan kode final, atau keputusan klaim otomatis.
- Keputusan klinis dan kodifikasi akhir tetap memerlukan validasi profesional.

## 10. Roadmap Pengembangan

1. Menyelesaikan blueprint dan dokumentasi desain dashboard v0.4.0.
2. Menambahkan pengujian otomatis untuk setiap aturan audit.
3. Mengembangkan pemeriksaan duplikasi nomor rekam medis (DQ-09).
4. Mengembangkan pemeriksaan konsistensi diagnosis dan kode ICD-10 (DQ-10) dengan referensi yang dapat dipertanggungjawabkan.
5. Meningkatkan responsivitas, aksesibilitas, dan pengalaman pengguna.
6. Melengkapi dokumentasi teknis dan pengujian regresi.

## 11. Lisensi dan Penggunaan

Proyek ini dibuat untuk pembelajaran, demonstrasi, dan portofolio profesional di bidang rekam medis serta informatika kesehatan.

Seluruh data demonstrasi bersifat sintetis atau fiktif.

---

**MedAudit AI – Healthcare Data Quality System**

*Prototype untuk demonstrasi dan portofolio informatika kesehatan.*
