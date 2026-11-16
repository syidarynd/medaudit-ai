# Pencarian Alphabetical Index ICD-10 di MedAudit AI

## Tujuan

Panel ini membantu petugas menelusuri istilah diagnosis pada file Alphabetical Index yang dipilih pengguna, mempertahankan konteks subistilah, dan membandingkan kode yang tercantum dengan file Tabular WHO 2019.

## Sumber yang digunakan

- Alphabetical Index: file pengguna berlabel **WHO ICD-10 Volume 3, Fifth edition 2016**.
- Tabular pembanding: `icd102019syst_codes.txt`, WHO ICD-10 2019-covid-expanded.

Kedua sumber **bukan edisi yang sama**. Hasil pembandingan tidak boleh ditafsirkan sebagai validasi kode final, validasi klinis, atau validasi standar klaim Indonesia/BPJS.

## Cara menggunakan

1. Buka tab **Indeks ICD-10**.
2. Pilih file PDF Alphabetical Index WHO Volume 3 edisi 2016 (maksimal 50 MB).
3. Pilih file `icd102019syst_codes.txt` dari paket Tabular WHO 2019 (maksimal 20 MB).
4. Tekan **Muat & proses referensi** dan tunggu ekstraksi selesai.
5. Masukkan istilah, subistilah, atau kode, lalu tekan **Cari indeks**.
6. Baca konteks, rujukan silang, kode, dan nomor halaman PDF.
7. Periksa status pembanding Tabular 2019; telusuri kembali ke Tabular resmi sebelum menetapkan kode.

## Arti status pembanding

- **Ditemukan sebagai kode terminal**: kode ditemukan pada baris terminal (`T`) di file Tabular 2019.
- **Kategori / kode non-terminal**: kode merupakan kategori atau baris non-terminal (`N`), atau kode indeks berupa wildcard seperti `.-`.
- **Tidak ditemukan**: kode tidak ditemukan secara persis pada file Tabular yang dipilih. Perbedaan edisi, format, atau pembaruan dapat menjadi penyebab; ini bukan bukti kode invalid.

## Privasi dan penyimpanan

- PDF dan TXT diproses di browser perangkat pengguna pada penyiapan pertama.
- PDF diperiksa signature awal `%PDF-` sebelum diteruskan ke PDF.js; file lebih dari 50 MB ditolak.
- Tabular TXT lebih dari 20 MB ditolak dan harus menghasilkan struktur kode yang dikenali sebelum ekstraksi PDF dimulai.
- Proses penyiapan menggunakan hasil sementara. Referensi lama tetap dipertahankan jika file pengganti tidak valid atau proses ekstraksi gagal.
- Setiap halaman PDF dibersihkan setelah diproses melalui blok `finally`; resource dokumen/loading task juga dihancurkan setelah proses selesai atau gagal.
- File sumber asli tidak dikirim ke server aplikasi dan tidak disimpan.
- Hasil ekstraksi terstruktur (entri indeks dan peta kode) disimpan di IndexedDB dengan cache schema v3. Perubahan parser akan mengabaikan cache lama sehingga file sumber perlu diproses ulang satu kali.
- Setelah halaman dimuat ulang, referensi dimuat otomatis pada browser/perangkat yang sama.
- Jika penulisan cache IndexedDB gagal (misalnya kuota penyimpanan habis), hasil ekstraksi tetap dapat dicari selama halaman masih terbuka. Antarmuka menampilkan peringatan bahwa referensi tidak tersimpan; setelah reload, file sumber perlu diproses kembali.
- Menghapus data situs/browser atau memilih tombol **Hapus referensi tersimpan** akan menghapus cache; pengguna perlu menyiapkan ulang file sumber.
- Repositori hanya menyimpan kode parser dan antarmuka, bukan salinan dataset indeks/tabular.

## Lisensi dan penggunaan

File PDF yang diunggah pengguna merupakan salinan pihak ketiga; asal dan hak distribusinya belum diverifikasi. Karena itu dataset hasil ekstraksi tidak dimasukkan ke repositori publik.

FAQ resmi WHO menyatakan WHO adalah pemegang hak cipta ICD-10 dan dapat memberikan lisensi untuk penggunaannya secara komersial maupun non-komersial. Karena file yang diunggah merupakan salinan Volume 3 edisi 2016 dari sumber pihak ketiga, ketentuan lisensi spesifik untuk salinan tersebut belum dapat dipastikan. Periksa pemberitahuan hak cipta pada edisi/publikasi sumber sebelum mendistribusikan atau membuat dataset turunan.

Rujukan:
- https://www.who.int/about/policies/publishing/copyright
- https://cdn.who.int/media/docs/default-source/publishing-policies/copyright/who-faq-licensing-icd-10.pdf

Jangan menerbitkan ulang PDF, teks hasil ekstraksi, atau dataset turunan sebelum memastikan izin dan ketentuan lisensinya.

## Batasan teknis

- Parser mengabaikan daftar isi dan pendahuluan, mulai mengekstrak saat menemukan heading Section I, melanjutkan Section II (external causes), lalu berhenti saat heading Section III ditemukan setelah Section II. Pada PDF WHO edisi 2016, Section III dimulai sekitar halaman PDF 723 dari 848 halaman. Tabel obat/kimia pada Section III tidak dimasukkan sebagai entri indeks. Matriks kecelakaan transportasi darat pada Section II juga dilewati karena bentuknya tabel multi-sumbu; meratakannya akan mencampur kode dari kolom berbeda.
- Parser memisahkan kolom berdasarkan asal teks berulang, mempertahankan spasi eksplisit pada fragmen PDF, dan mengenali indentasi dash Unicode. Struktur PDF lain dapat memiliki urutan halaman atau format teks berbeda.
- Ekstraksi PDF menggunakan PDF.js 6.5.438 dari CDN cdnjs dengan versi yang dipatok; koneksi internet diperlukan saat membuka panel indeks.
- Pencarian adalah alat bantu navigasi, bukan pengganti penelaahan klinis/kodifikasi profesional.
