# Changelog

## [0.8.1] – 2026-11-16

### Fixed
- Corrected DQ-09: a repeated medical-record number across different visits is valid and is no longer flagged by itself.
- DQ-09 now raises a review warning only when MRN, admission date, discharge date, and normalized primary diagnosis match across separate records.
- New records without an explicit internal ID receive a generated unique ID instead of reusing the MRN.
- Demo seeding now checks for a likely duplicate encounter rather than blocking any repeated MRN.

### Testing
- Added regression tests for repeated MRNs on different dates, likely duplicate encounters, and normalization of case/whitespace.
- Added a browser test that imports two visits for the same synthetic patient and confirms distinct internal IDs and no false DQ-09 finding.

### Scope
- DQ-09 is a heuristic duplicate-candidate warning, not an automatic merge/delete decision. Review the source records before taking action.
- The application remains a rule-based prototype and must use synthetic data only.

## [0.8.0] – 2026-11-16

### Added
- Validasi impor backup JSON dengan batas ukuran 5 MB, maksimum 5.000 record, pemeriksaan tipe/panjang field, dan penolakan ID ganda.
- Guardrail sumber ICD-10: PDF maksimum 50 MB dengan pemeriksaan signature `%PDF-`; Tabular TXT maksimum 20 MB dan harus memiliki struktur kode yang dikenali.
- Perlindungan agar referensi ICD-10 yang telah valid tetap tersedia ketika file pengganti tidak valid atau proses ekstraksi gagal.
- Cleanup resource setiap halaman PDF melalui blok `finally`, termasuk pada jalur kegagalan ekstraksi.

### Testing
- GitHub Actions: 34 dari 35 tes lulus, 0 gagal, 1 dilewati karena file PDF WHO penuh tidak tersedia di runner.
- Browser smoke test Chromium mencakup viewport 390×844 dan 1440×900.
- Uji manual Android sebelumnya berhasil memproses PDF WHO Volume 3 2016 (848 halaman), Tabular TXT, lima pencarian baseline, dan pemulihan cache IndexedDB.

### Limitations
- Mesin audit tetap berbasis aturan, bukan model AI/LLM.
- Pengukuran performa/memori kuantitatif dan audit keamanan independen masih menjadi pekerjaan lanjutan.
- Dataset indeks WHO tidak dibundel ke repositori; pengguna memilih file sumber sendiri. Pastikan hak penggunaan sumber sebelum distribusi.
- Jangan gunakan data pasien nyata. Keputusan klinis dan kodifikasi akhir tetap memerlukan validasi profesional.
