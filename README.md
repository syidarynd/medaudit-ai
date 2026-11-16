
# MedAudit AI – Healthcare Data Quality System

**AI-Assisted Medical Records Audit & Data Quality System**

Prototipe portofolio informatika kesehatan oleh Said Ariyandi.

---

## 1. Status Proyek

| Informasi | Keterangan |
|---|---|
| Nama aplikasi | MedAudit AI |
| Status | Prototype frontend statis |
| Versi saat ini | Prototype v0.7.1 |
| Target pengembangan | v0.7.1 |
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
- Pencarian istilah melalui Alphabetical Index ICD-10 WHO Volume 3 edisi 2016 yang diekstrak di browser dengan pemisahan dua kolom, hierarki dash Unicode, dan rujukan silang.
- Referensi hasil ekstraksi disimpan di IndexedDB dan dimuat otomatis pada kunjungan berikutnya di browser/perangkat yang sama.
- Pembandingan kode indeks dengan daftar kode terminal/non-terminal pada Tabular WHO 2019.
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

- Alphabetical Index: WHO ICD-10 Volume 3, Fifth edition 2016, dipilih dan diproses secara lokal oleh pengguna.
- Parser memulai ekstraksi pada Section I, melanjutkan Section II, dan berhenti saat Section III (tabel obat/kimia) dimulai.
- Matriks kecelakaan transportasi darat WHO dilewati secara eksplisit agar kode dari kolom tabel yang berbeda tidak digabung sebagai satu entri.
- Tabular pembanding: WHO ICD-10 2019, file TXT dipilih secara lokal.
- Karena edisinya berbeda, status cocok/tidak cocok hanya pembanding teknis dan tidak menetapkan validitas kode Indonesia/BPJS.
- PDF/TXT sumber tidak disertakan dalam repositori atau diunggah ke server. Hasil ekstraksi terstruktur disimpan lokal di IndexedDB pada perangkat pengguna; tidak tersinkron antarperangkat.

## 5. Teknologi

| Teknologi | Penggunaan |
|---|---|
| HTML5 | Struktur aplikasi |
| CSS3 | Tampilan dan responsivitas |
| Vanilla JavaScript (ES6) | Logika aplikasi |
| LocalStorage | Penyimpanan data lokal |
| Chart.js | Visualisasi dashboard |
| PDF.js 6.5.438 | Ekstraksi teks PDF di browser |
| GitHub | Manajemen repositori |
| GitHub Pages | Publikasi aplikasi |

Proyek dirancang menggunakan teknologi gratis dan tidak memerlukan API key, backend, database cloud, atau layanan berbayar.

## 6. Struktur Repositori

```text
medaudit-ai/
│
├── .github/
│   └── workflows/
│       └── quality.yml
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
├── docs/
│   ├── testing.md
│   └── icd10-index.md
│
└── tests/
    ├── audit-test-cases.md
    ├── audit.test.cjs
    ├── icd10-index.test.cjs
    ├── browser-smoke.test.cjs
    └── icd10-who-pdf.test.cjs (opsional; memerlukan file PDF lokal)
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
- [Panduan Indeks ICD-10](docs/icd10-index.md)

Pengujian mencakup unit test otomatis, browser smoke test Chromium pada viewport seluler 390×844 dan desktop 1440×900, serta uji manual pada perangkat Android fisik. Pada 16 November 2026, PDF WHO 2016 (848 halaman) dan Tabular TXT berhasil diproses di Android; lima pencarian baseline (`abscess`, `diabetes`, `hypertension`, `brain`, `G06.0`) berhasil menampilkan hasil, dan referensi dimuat kembali otomatis setelah halaman dimuat ulang. Uji manual ini memverifikasi alur aplikasi dan sampel hasil, bukan validasi menyeluruh seluruh entri indeks. CI pada commit v0.7.1 menjalankan 35 tes: 34 lulus, 0 gagal, dan 1 tes impor PDF WHO penuh dilewati karena PDF tidak tersedia di runner (run #43803726998).

Unit test mesin audit dan parser indeks dijalankan melalui GitHub Actions. Pengujian UI browser lintas perangkat, keamanan menyeluruh, dan performa skala besar belum diklaim selesai.

## 9. Batasan Sistem

- DQ-05 hanya memeriksa pola format dasar. Panel indeks adalah alat bantu pencarian; pembandingan indeks 2016 dengan Tabular 2019 tidak memastikan ketepatan kode atau kesesuaian standar Indonesia.
- Mesin pemeriksaan menggunakan aturan tetap (*rule-based*), belum menggunakan model AI atau LLM. DQ-10 adalah pemeriksaan silang daftar contoh terbatas, bukan validasi ICD-10 resmi.
- Aplikasi belum memiliki autentikasi pengguna, fitur multi-user, sinkronisasi cloud, atau audit trail server-side.
- LocalStorage tidak dirancang untuk menyimpan rekam medis pasien nyata.
- Hasil audit merupakan indikator untuk ditinjau petugas berwenang, bukan keputusan klinis, penetapan kode final, atau keputusan klaim otomatis.
- Keputusan klinis dan kodifikasi akhir tetap memerlukan validasi profesional.

## 10. Roadmap Pengembangan

1. Uji langsung pada perangkat Android pengguna untuk memastikan penyiapan satu kali, penyimpanan IndexedDB, dan pemuatan otomatis referensi berjalan.
2. Uji performa dan penggunaan memori saat memproses PDF besar.
3. Perluas cakupan aksesibilitas, keamanan, dan pengujian regresi.
4. Evaluasi sumber ICD-10 dengan edisi yang seragam dan ketentuan lisensi yang jelas sebelum integrasi lebih lanjut.

## 11. Lisensi dan Penggunaan

Proyek ini dibuat untuk pembelajaran, demonstrasi, dan portofolio profesional di bidang rekam medis serta informatika kesehatan.

Seluruh data demonstrasi bersifat sintetis atau fiktif.

---

**MedAudit AI – Healthcare Data Quality System**

*Prototype untuk demonstrasi dan portofolio informatika kesehatan.*
