# MedAudit AI — MVP v0.2.1

**AI-Assisted Medical Records Audit & Data Quality System**  
Prototipe portofolio profesional oleh Said Ariyandi.

## Status
MVP frontend statis untuk demonstrasi pengelolaan kunjungan dan pemeriksaan kualitas data berbasis aturan. Versi 0.2.1 berfokus pada hardening validasi data, penanganan kegagalan LocalStorage, dan dokumentasi pengujian.

## Fitur
- Dashboard KPI: total kunjungan, lulus, perlu review, dan jumlah temuan.
- CRUD data kunjungan: tambah, edit, hapus.
- Pencarian ID kunjungan, nama/inisial fiktif, diagnosis, dan kode.
- Filter status audit.
- Rule engine DQ-01 sampai DQ-08.
- Temuan audit dapat ditelusuri ke data kunjungan.
- Penyimpanan lokal melalui LocalStorage.
- Export dan import backup JSON dengan validasi struktur dan ID unik.
- Penanganan error penyimpanan dan konfirmasi reset.
- Dataset demonstrasi sintetis/fiktif.
- Layout responsif.

## Teknologi
- HTML5, CSS3, Vanilla JavaScript (ES6)
- Browser LocalStorage dan File API
- Tidak memerlukan API key, backend, database cloud, atau layanan berbayar.

## Publikasi web lintas perangkat\nUntuk menayangkan aplikasi melalui HTTPS secara gratis menggunakan GitHub Pages, ikuti [`DEPLOY-GITHUB-PAGES-ANDROID.md`](DEPLOY-GITHUB-PAGES-ANDROID.md). Panduan ini dapat diikuti melalui browser Android tanpa laptop. Setelah dipublikasikan, aplikasi dapat dibuka dari desktop, tablet, Android, dan iOS melalui browser modern.\n\n## Menjalankan aplikasi
1. Ekstrak folder proyek.
2. Buka `index.html` dengan browser modern, atau jalankan server lokal statis (misalnya Live Server di VS Code).
3. Data disimpan pada origin/browser/perangkat yang sama. Menghapus data situs/browser dapat menghapus data lokal; lakukan export backup secara berkala.

## Struktur folder
```text
MedAudit-AI-MVP-v0.2.1/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── audit.js
│   ├── demo-data.js
│   ├── storage.js
│   └── ui.js
├── docs/
│   └── TEST-PLAN.md
└── tests/
    └── unit-tests.js
```

## Aturan pemeriksaan MVP
| Kode | Pemeriksaan |
|---|---|
| DQ-01 | ID kunjungan dan/atau nama/inisial kosong |
| DQ-02 | Tanggal masuk kosong, tidak valid, atau di masa depan |
| DQ-03 | Tanggal keluar yang diisi tidak valid atau lebih awal dari tanggal masuk |
| DQ-04 | Diagnosis utama belum diisi |
| DQ-05 | Pola format kode ICD-10 perlu diperiksa |
| DQ-06 | Kelas rawat belum dipilih |
| DQ-07 | Resume medis belum ditandai lengkap |
| DQ-08 | Autentikasi DPJP belum ditandai lengkap |

## Validasi data dan backup
- Impor menerima array JSON atau objek dengan properti `records`.
- Setiap record harus memiliki `id` teks yang tidak kosong dan unik.
- Field teks harus berupa string; status kelengkapan harus berupa boolean bila disediakan.
- Field yang tidak disediakan diisi nilai default kosong/false agar tetap dapat diaudit.
- Tanggal tidak dipaksa valid saat import karena tanggal kosong/tidak valid merupakan temuan audit yang perlu ditampilkan.
- Import mengganti seluruh data lokal hanya setelah konfirmasi.
- Jika LocalStorage penuh atau gagal ditulis, aplikasi menampilkan pesan dan mempertahankan data pada memori selama halaman masih terbuka.

## Batasan penting
- Pemeriksaan ICD-10 hanya memeriksa pola format umum, bukan validitas kode terhadap indeks dan tabular resmi.
- Rule engine bersifat rule-based; **belum menggunakan model AI/LLM**.
- Tidak ada autentikasi, multi-user, sinkronisasi cloud, atau audit trail server-side.
- LocalStorage bukan database klinis dan tidak cocok untuk data pasien nyata.
- Jangan masukkan identitas atau data pasien nyata. Gunakan hanya data sintetis/fiktif.
- Temuan merupakan sinyal untuk review manusia, bukan keputusan klinis atau klaim otomatis.

## Pengujian
Lihat [`docs/TEST-PLAN.md`](docs/TEST-PLAN.md) untuk hasil pengujian yang dijalankan dan skenario yang masih perlu diuji manual pada browser pengguna.

## Roadmap
1. Lengkapi uji UI lintas browser dan perangkat.
2. Tambahkan unit test otomatis yang terpisah untuk seluruh aturan dan skenario penyimpanan.
3. Rancang audit trail lokal dan validasi checklist yang dapat dikonfigurasi.
4. Pertimbangkan backend terpisah hanya setelah kebutuhan, privasi, dan biaya dievaluasi.

## Lisensi
Proyek portofolio dan pembelajaran. Dataset contoh bersifat fiktif.
