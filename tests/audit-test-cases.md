
# TEST CASE AUDIT MEDAUDIT AI

**Nama aplikasi:** MedAudit AI – Healthcare Data Quality System

**Versi target:** Prototype v0.4.0

**Jenis dokumen:** Daftar kasus pengujian fungsional dan regresi

**Status dokumen:** Draft Pengujian

---

## 1. Tujuan Pengujian

Dokumen ini digunakan sebagai panduan pengujian untuk memastikan seluruh fitur MedAudit AI berjalan sesuai rancangan, khususnya dalam mendeteksi ketidaksesuaian dan ketidaklengkapan data rekam medis.

## 2. Lingkup Pengujian

Pengujian mencakup:

- Dashboard.
- Data kunjungan.
- Hasil audit.
- Pemeriksaan delapan aturan Data Quality (DQ-01 sampai DQ-08).
- Pencarian dan filter data.
- Ekspor data.
- Pemulihan data.
- Validasi dan konsistensi data.

## 3. Standar Hasil Pengujian

Setiap kasus pengujian dinyatakan:

- **PASS:** Hasil aktual sesuai dengan hasil yang diharapkan.
- **FAIL:** Hasil aktual tidak sesuai dengan hasil yang diharapkan.
- **BLOCKED:** Pengujian belum dapat dilaksanakan karena kendala teknis.

Pengujian menggunakan data sintetis dan tidak menggunakan identitas pasien sebenarnya.

---

## 4. TEST CASE DATA QUALITY RULES

### 4.1 Pengujian DQ-01 – Kelengkapan Identitas Pasien

**Tujuan:** Memastikan nomor rekam medis dan nama pasien tersedia.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ01-01 | Nomor rekam medis dan nama tersedia | Tidak ada temuan DQ-01 |
| TC-DQ01-02 | Nomor rekam medis kosong | Muncul temuan DQ-01 |
| TC-DQ01-03 | Nama pasien kosong | Muncul temuan DQ-01 |

**Pesan temuan:** Identitas pasien belum lengkap.

### 4.2 Pengujian DQ-02 – Validitas Tanggal Masuk

**Tujuan:** Memastikan tanggal masuk tersedia, valid, dan tidak berada di masa depan.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ02-01 | Tanggal masuk valid | Tidak ada temuan DQ-02 |
| TC-DQ02-02 | Tanggal masuk kosong | Muncul temuan DQ-02 |
| TC-DQ02-03 | Tanggal masuk tidak valid (31/02/2026) | Muncul temuan DQ-02 |
| TC-DQ02-04 | Tanggal masuk di masa depan (12/11/2026) | Muncul temuan DQ-02 |

**Pesan temuan:** Tanggal masuk tidak valid atau berada di masa depan.

### 4.3 Pengujian DQ-03 – Validitas Tanggal Keluar

**Tujuan:** Memastikan tanggal keluar valid dan tidak lebih awal daripada tanggal masuk.

Tanggal keluar yang kosong diperbolehkan untuk kunjungan yang masih berlangsung.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ03-01 | Tanggal keluar valid dan setelah tanggal masuk | Tidak ada temuan DQ-03 |
| TC-DQ03-02 | Tanggal keluar kosong | Tidak ada temuan DQ-03 |
| TC-DQ03-03 | Tanggal keluar tidak valid (31/02/2026) | Muncul temuan DQ-03 |
| TC-DQ03-04 | Tanggal keluar lebih awal daripada tanggal masuk | Muncul temuan DQ-03 |

**Pesan temuan:** Tanggal keluar lebih awal dari tanggal masuk.

### 4.4 Pengujian DQ-04 – Kelengkapan Diagnosis Utama

**Tujuan:** Memastikan setiap data kunjungan memiliki diagnosis utama.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ04-01 | Diagnosis utama tersedia | Tidak ada temuan DQ-04 |
| TC-DQ04-02 | Diagnosis utama kosong | Muncul temuan DQ-04 |

**Pesan temuan:** Diagnosis utama belum diisi.

### 4.5 Pengujian DQ-05 – Format Kode ICD-10

**Tujuan:** Memastikan kode ICD-10 tidak kosong dan memenuhi pola format dasar.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ05-01 | Kode ICD-10 memiliki format dasar yang valid | Tidak ada temuan DQ-05 |
| TC-DQ05-02 | Kode ICD-10 kosong | Muncul temuan DQ-05 |
| TC-DQ05-03 | Format kode ICD-10 tidak sesuai pola dasar | Muncul temuan DQ-05 |

**Pesan temuan:** Format kode ICD-10 perlu diperiksa.

**Catatan:** Pemeriksaan ini merupakan validasi format dasar, bukan validasi katalog resmi ICD-10 atau kesesuaian klinis diagnosis.

### 4.6 Pengujian DQ-06 – Kelengkapan Kelas Rawat

**Tujuan:** Memastikan kelas rawat telah dipilih.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ06-01 | Kelas rawat tersedia | Tidak ada temuan DQ-06 |
| TC-DQ06-02 | Kelas rawat kosong | Muncul temuan DQ-06 |

**Pesan temuan:** Kelas rawat belum dipilih.

### 4.7 Pengujian DQ-07 – Kelengkapan Resume Medis

**Tujuan:** Memastikan status kelengkapan resume medis telah ditandai.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ07-01 | Resume medis ditandai lengkap | Tidak ada temuan DQ-07 |
| TC-DQ07-02 | Resume medis belum ditandai lengkap | Muncul temuan DQ-07 |

**Pesan temuan:** Resume medis belum ditandai lengkap.

### 4.8 Pengujian DQ-08 – Autentikasi DPJP

**Tujuan:** Memastikan ketersediaan autentikasi Dokter Penanggung Jawab Pelayanan (DPJP) telah ditandai.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-DQ08-01 | Autentikasi DPJP ditandai tersedia | Tidak ada temuan DQ-08 |
| TC-DQ08-02 | Autentikasi DPJP belum ditandai tersedia | Muncul temuan DQ-08 |

**Pesan temuan:** Autentikasi DPJP belum ditandai tersedia.

---

## 5. PENGUJIAN FUNGSIONAL APLIKASI

### 5.1 Dashboard

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-FUN-001 | Membuka halaman dashboard | Dashboard tampil tanpa error |
| TC-FUN-002 | Memeriksa jumlah data kunjungan | Jumlah sesuai data tersimpan |
| TC-FUN-003 | Memeriksa jumlah temuan audit | Jumlah sesuai hasil pemeriksaan |
| TC-FUN-004 | Memeriksa ringkasan kualitas data | Informasi tampil secara konsisten |

### 5.2 Data Kunjungan

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-FUN-005 | Membuka daftar kunjungan | Data tampil dengan benar |
| TC-FUN-006 | Menambahkan data kunjungan valid | Data berhasil disimpan |
| TC-FUN-007 | Mengubah data kunjungan | Perubahan berhasil disimpan |
| TC-FUN-008 | Memeriksa data setelah disimpan | Data tetap konsisten |

### 5.3 Hasil Audit

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-FUN-009 | Menjalankan proses audit | Sistem menghasilkan temuan sesuai aturan |
| TC-FUN-010 | Membuka hasil audit | Daftar temuan tampil |
| TC-FUN-011 | Memeriksa data tanpa temuan | Data ditampilkan sebagai lolos pemeriksaan |
| TC-FUN-012 | Memeriksa data dengan temuan | Temuan dan pesan ditampilkan dengan benar |

### 5.4 Pencarian dan Filter

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-FUN-013 | Mencari nomor rekam medis | Data yang sesuai ditemukan |
| TC-FUN-014 | Mencari nama pasien sintetis | Data yang sesuai ditemukan |
| TC-FUN-015 | Menggunakan filter hasil audit | Data tersaring sesuai kriteria |
| TC-FUN-016 | Menggunakan pencarian tanpa hasil | Sistem menampilkan informasi data tidak ditemukan |

### 5.5 Ekspor dan Pemulihan Data

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-FUN-017 | Melakukan ekspor data | File berhasil dihasilkan |
| TC-FUN-018 | Memeriksa isi file ekspor | Isi sesuai data sumber |
| TC-FUN-019 | Melakukan pemulihan dari cadangan | Data berhasil dipulihkan |
| TC-FUN-020 | Memeriksa data setelah pemulihan | Data tetap konsisten |

---

## 6. PENGUJIAN REGRESI

Pengujian regresi dilakukan untuk memastikan perubahan atau perbaikan aplikasi tidak merusak fungsi yang sebelumnya berjalan.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-REG-001 | Menjalankan kembali seluruh aturan DQ-01 sampai DQ-08 | Seluruh aturan berjalan sesuai spesifikasi |
| TC-REG-002 | Menguji tanggal masuk dan keluar | Validasi tanggal tetap akurat |
| TC-REG-003 | Membuka dashboard setelah perubahan data | Ringkasan diperbarui dengan benar |
| TC-REG-004 | Melakukan pencarian setelah perubahan data | Hasil pencarian tetap akurat |
| TC-REG-005 | Melakukan ekspor setelah proses audit | Data ekspor tetap konsisten |

---

## 7. KRITERIA KEBERHASILAN

Pengujian dinyatakan berhasil apabila:

1. Seluruh aturan DQ-01 sampai DQ-08 menghasilkan temuan sesuai kondisi data.
2. Tidak terdapat kesalahan validasi tanggal.
3. Dashboard menampilkan ringkasan sesuai data aktual.
4. Data kunjungan dapat dikelola dengan benar.
5. Hasil audit dapat ditampilkan dan ditelusuri.
6. Fitur pencarian dan filter berjalan sesuai kriteria.
7. Ekspor dan pemulihan data berjalan dengan baik.
8. Tidak terdapat regresi pada fungsi utama aplikasi.

## 8. CATATAN PENGUJIAN

- Seluruh data pengujian harus menggunakan data sintetis.
- Setiap pengujian harus mencatat hasil aktual.
- Temuan yang tidak sesuai harus didokumentasikan sebagai bug.
- Perbaikan harus diuji ulang sebelum dinyatakan selesai.
- Validasi kode ICD-10 pada versi ini terbatas pada pemeriksaan format dasar.
- Pengujian ini tidak menggantikan audit klinis maupun verifikasi profesional terhadap dokumen rekam medis.

---

## 9. REKAPITULASI HASIL PENGUJIAN

| Komponen | Jumlah Kasus |
|---|---:|
| DQ-01 | 3 |
| DQ-02 | 4 |
| DQ-03 | 4 |
| DQ-04 | 2 |
| DQ-05 | 3 |
| DQ-06 | 2 |
| DQ-07 | 2 |
| DQ-08 | 2 |
| Pengujian Fungsional | 20 |
| Pengujian Regresi | 5 |
| **TOTAL** | **47** |

| Status | Jumlah |
|---|---:|
| PASS | Diisi setelah pengujian |
| FAIL | Diisi setelah pengujian |
| BLOCKED | Diisi setelah pengujian |
| Belum diuji | 47 |

---

**MedAudit AI – Healthcare Data Quality System**

*AI-Assisted Medical Records Audit & Data Quality System*

**Dokumentasi Pengujian Prototype v0.4.0**
