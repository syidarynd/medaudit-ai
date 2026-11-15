# Pencarian Alphabetical Index ICD-10 di MedAudit AI

## Tujuan

Panel ini membantu petugas menelusuri istilah diagnosis pada file Alphabetical Index yang dipilih pengguna, mempertahankan konteks subistilah, dan membandingkan kode yang tercantum dengan file Tabular WHO 2019.

## Sumber yang digunakan

- Alphabetical Index: file pengguna berlabel **ICD-10 2e Volume 3 (2013)**.
- Tabular pembanding: `icd102019syst_codes.txt`, WHO ICD-10 2019-covid-expanded.

Kedua sumber **bukan edisi yang sama**. Hasil pembandingan tidak boleh ditafsirkan sebagai validasi kode final, validasi klinis, atau validasi standar klaim Indonesia/BPJS.

## Cara menggunakan

1. Buka tab **Indeks ICD-10**.
2. Pilih file PDF Alphabetical Index 2013.
3. Pilih file `icd102019syst_codes.txt` dari paket Tabular WHO 2019.
4. Tekan **Muat & proses referensi** dan tunggu ekstraksi selesai.
5. Masukkan istilah, subistilah, atau kode, lalu tekan **Cari indeks**.
6. Baca konteks, rujukan silang, kode, dan nomor halaman PDF.
7. Periksa status pembanding Tabular 2019; telusuri kembali ke Tabular resmi sebelum menetapkan kode.

## Arti status pembanding

- **Ditemukan sebagai kode terminal**: kode ditemukan pada baris terminal (`T`) di file Tabular 2019.
- **Kategori / kode non-terminal**: kode merupakan kategori atau baris non-terminal (`N`), atau kode indeks berupa wildcard seperti `.-`.
- **Tidak ditemukan**: kode tidak ditemukan secara persis pada file Tabular yang dipilih. Perbedaan edisi, format, atau pembaruan dapat menjadi penyebab; ini bukan bukti kode invalid.

## Privasi dan penyimpanan

- PDF dan TXT diproses di browser perangkat pengguna.
- File sumber tidak dikirim ke server aplikasi dan tidak disimpan ke LocalStorage.
- Setelah halaman dimuat ulang, pengguna perlu memilih ulang kedua file.
- Repositori hanya menyimpan kode parser dan antarmuka, bukan salinan dataset indeks/tabular.

## Lisensi dan penggunaan

File PDF yang diunggah pengguna merupakan salinan pihak ketiga; asal dan hak distribusinya belum diverifikasi. Karena itu dataset hasil ekstraksi tidak dimasukkan ke repositori publik.

FAQ resmi WHO menyatakan WHO adalah pemegang hak cipta ICD-10 dan dapat memberikan lisensi untuk penggunaannya secara komersial maupun non-komersial. Karena file yang diunggah merupakan salinan Volume 3 edisi 2013 dari sumber pihak ketiga, ketentuan lisensi spesifik untuk salinan tersebut belum dapat dipastikan. Periksa pemberitahuan hak cipta pada edisi/publikasi sumber sebelum mendistribusikan atau membuat dataset turunan.

Rujukan:
- https://www.who.int/about/policies/publishing/copyright
- https://cdn.who.int/media/docs/default-source/publishing-policies/copyright/who-faq-licensing-icd-10.pdf

Jangan menerbitkan ulang PDF, teks hasil ekstraksi, atau dataset turunan sebelum memastikan izin dan ketentuan lisensinya.

## Batasan teknis

- Parser memproses halaman 1–1718 dan berhenti saat menemukan judul Section III. Dengan demikian, bagian yang diproses adalah Section I (penyakit dan nature of injury) serta Section II (external causes); tabel obat/kimia pada Section III tidak dimasukkan sebagai entri indeks.
- Struktur PDF lain dapat memiliki urutan halaman atau format teks berbeda.
- Ekstraksi PDF menggunakan PDF.js 6.5.438 dari CDN cdnjs dengan versi yang dipatok; koneksi internet diperlukan saat membuka panel indeks.
- Pencarian adalah alat bantu navigasi, bukan pengganti penelaahan klinis/kodifikasi profesional.
