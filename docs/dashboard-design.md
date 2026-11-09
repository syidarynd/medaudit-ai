# DESAIN DASHBOARD MEDAUDIT AI

**Nama aplikasi:** MedAudit AI – Healthcare Data Quality System

**Versi target:** Prototype v0.4.0

**Jenis dokumen:** Spesifikasi desain antarmuka (UI/UX)

**Platform:** Web responsif

**Teknologi:** HTML, CSS, JavaScript, Chart.js

---

## 1. Tujuan Desain

Dashboard dirancang untuk memberikan gambaran umum kualitas data rekam medis melalui tampilan yang informatif, ringkas, profesional, dan mudah digunakan.

Fokus utama:

- Memantau jumlah kunjungan.
- Menampilkan hasil pemeriksaan kualitas data.
- Mengidentifikasi data yang perlu ditinjau.
- Memvisualisasikan distribusi temuan audit.
- Mempermudah navigasi ke modul pengelolaan data.

## 2. Prinsip UI/UX

1. Minimalis dan profesional.
2. Responsif pada smartphone, tablet, dan desktop.
3. Navigasi sederhana dan konsisten.
4. Informasi penting mudah ditemukan.
5. Warna digunakan secara konsisten berdasarkan status.
6. Tabel tetap mudah dibaca pada layar kecil.
7. Mengutamakan aksesibilitas dan keterbacaan.

## 3. Struktur Dashboard

Dashboard terdiri dari enam komponen utama.

### A. Sidebar Navigasi

Menu navigasi:

- Dashboard
- Data Kunjungan
- Hasil Audit
- Laporan
- Backup Data
- Tentang Aplikasi

Pada perangkat mobile, sidebar dapat diubah menjadi menu navigasi yang lebih ringkas.

### B. Ringkasan KPI

Empat kartu indikator utama:

| Indikator | Keterangan |
|---|---|
| Total Kunjungan | Jumlah seluruh data kunjungan |
| Lolos Aturan Dasar | Data tanpa temuan audit |
| Perlu Ditinjau | Data dengan satu atau lebih temuan |
| Total Temuan | Jumlah seluruh temuan pemeriksaan |

Nilai KPI diperbarui berdasarkan data yang tersimpan.

### C. Grafik Distribusi Audit

Menggunakan Chart.js untuk menampilkan:

- Distribusi status audit.
- Jumlah temuan berdasarkan kode DQ.
- Perbandingan data lolos dan perlu ditinjau.

Grafik harus mengikuti data aktual dan diperbarui setelah perubahan data.

### D. Tabel Kunjungan Terbaru

Kolom yang direncanakan:

| Kolom | Keterangan |
|---|---|
| ID Kunjungan | Identitas kunjungan sintetis |
| Diagnosis | Diagnosis utama |
| Kode ICD-10 | Kode yang dimasukkan |
| Status Audit | Status pemeriksaan |
| Aksi | Melihat detail data |

Tabel menyediakan akses menuju detail kunjungan dan hasil pemeriksaan.

### E. Ringkasan Kualitas Data

Menampilkan ringkasan:

- Jumlah data tanpa temuan.
- Jumlah data dengan temuan.
- Jenis temuan yang paling sering muncul.
- Distribusi temuan berdasarkan aturan DQ-01 sampai DQ-08.

### F. Informasi Sistem

Menampilkan:

- Nama aplikasi.
- Versi aplikasi.
- Status penyimpanan lokal.
- Keterangan bahwa aplikasi menggunakan data sintetis.
- Peringatan bahwa aplikasi bukan sistem produksi.

## 4. Standar Warna Antarmuka

| Elemen | Warna/status |
|---|---|
| Lolos | Biru atau hijau |
| Perlu ditinjau | Merah atau oranye |
| Informasi umum | Abu-abu |
| Navigasi aktif | Warna aksen utama |
| Latar belakang | Netral |

Warna tidak boleh menjadi satu-satunya penanda status. Setiap status tetap harus memiliki label teks.

## 5. Responsivitas

### Desktop

- Sidebar terlihat di sisi kiri.
- KPI disusun dalam satu baris.
- Grafik dapat ditampilkan berdampingan.
- Tabel memiliki ruang tampilan lebih luas.

### Tablet

- Sidebar dapat diperkecil.
- KPI menggunakan dua kolom.
- Grafik menyesuaikan lebar layar.

### Smartphone

- Navigasi menggunakan menu ringkas.
- KPI ditampilkan dalam dua kolom atau satu kolom sesuai lebar layar.
- Grafik disusun vertikal.
- Tabel menggunakan tampilan responsif.
- Tombol dan area interaksi mudah disentuh.

## 6. Sumber Data

Dashboard menggunakan data dari browser LocalStorage.

Kunci penyimpanan aplikasi saat ini:

`medaudit_ai_cases_v02`

Dashboard harus membaca data yang sama dengan modul pengelolaan kunjungan dan mesin audit.

Tidak diperbolehkan membuat sumber data terpisah yang menyebabkan perbedaan angka antara dashboard dan hasil audit.

## 7. Perilaku Sistem

1. Dashboard membaca data saat aplikasi dibuka.
2. KPI dihitung berdasarkan data aktual.
3. Grafik diperbarui setelah data ditambah, diubah, atau dihapus.
4. Perubahan hasil audit tercermin pada ringkasan dashboard.
5. Jika belum ada data, dashboard menampilkan kondisi kosong yang informatif.
6. Jika data gagal dibaca, aplikasi menampilkan pesan kesalahan yang jelas.

## 8. Batasan Implementasi

- Dashboard belum terhubung dengan database server.
- Data hanya tersimpan pada browser dan perangkat yang digunakan.
- Grafik menggunakan Chart.js.
- Pemeriksaan audit masih menggunakan aturan tetap (rule-based).
- Dashboard tidak memberikan keputusan klinis atau keputusan klaim otomatis.
- Data pasien nyata tidak boleh digunakan.

## 9. Rencana Implementasi v0.4.0

Tahapan implementasi:

1. Menyempurnakan struktur dashboard.
2. Memastikan KPI membaca data aktual.
3. Mengimplementasikan grafik distribusi audit.
4. Menambahkan tabel kunjungan terbaru.
5. Menambahkan ringkasan kualitas data.
6. Memperbaiki tampilan smartphone dan desktop.
7. Menguji perubahan data terhadap seluruh komponen dashboard.
8. Melakukan pengujian regresi sebelum publikasi.

## 10. Kriteria Penerimaan

Dashboard dianggap memenuhi rancangan apabila:

- Seluruh KPI menampilkan angka yang sesuai.
- Grafik mengikuti data aktual.
- Tabel menampilkan data kunjungan yang benar.
- Navigasi menuju modul berfungsi.
- Tampilan responsif pada smartphone dan desktop.
- Kondisi data kosong ditangani dengan baik.
- Tidak ada perubahan yang merusak fitur versi sebelumnya.

---

**MedAudit AI – Healthcare Data Quality System**

*Dokumen spesifikasi desain dashboard untuk pengembangan prototype dan portofolio informatika kesehatan.*
