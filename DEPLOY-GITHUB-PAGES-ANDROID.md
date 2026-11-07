# Publikasi MedAudit AI melalui GitHub Pages (Android)

Panduan ini menggunakan GitHub melalui browser HP. Tidak ada perubahan yang dilakukan ke akun atau repository Anda oleh paket ini.

## Sebelum mulai
- Pastikan Anda masuk ke akun GitHub milik sendiri.
- Buat repository baru bernama `medaudit-ai` (disarankan Public untuk GitHub Pages gratis).
- Jangan mengunggah data pasien nyata, token, password, atau secret.
- Paket ini hanya berisi source code dan data demonstrasi sintetis.

## Cara mengunggah dari Android
1. Ekstrak ZIP ini menggunakan aplikasi Files.
2. Buka `https://github.com` di Chrome dan login.
3. Pilih **New repository**. Isi nama `medaudit-ai`, pilih **Public**, lalu buat repository.
4. Di halaman repository, pilih **Add file → Upload files**.
5. Pilih seluruh isi folder proyek hasil ekstraksi. Jika pemilih file Android tidak bisa memilih folder sekaligus, unggah bertahap: `index.html`, `README.md`, `.nojekyll`, lalu folder `css`, `js`, `docs`, dan `tests` beserta isinya. Pertahankan nama dan struktur folder.
6. Tinjau daftar file. Pastikan `index.html` berada di root repository (bukan di dalam folder proyek tambahan).
7. Tulis pesan commit, misalnya `Initial MedAudit AI MVP`, lalu tekan **Commit changes**. Ini adalah tindakan publikasi oleh Anda; jangan lanjutkan jika belum siap membuat repository publik.

## Aktifkan GitHub Pages
1. Buka tab **Settings** repository.
2. Pilih **Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Branch: `main`; folder: `/(root)`, lalu **Save**.
5. Tunggu proses deployment selesai. URL biasanya berbentuk `https://USERNAME.github.io/medaudit-ai/`.
6. Buka URL tersebut di Chrome Android. Uji juga pada browser/perangkat lain.

## Verifikasi setelah publikasi
- Dashboard tampil dengan styling CSS.
- Navigasi Dashboard / Medical Records / Audit / Settings berfungsi.
- Tambah, edit, dan hapus satu data sintetis.
- Jalankan audit DQ-01 sampai DQ-08.
- Coba pencarian dan filter.
- Uji export JSON, lalu import file backup.
- Uji reset hanya setelah membuat backup.

## Catatan
- GitHub Pages hanya meng-host file statis; tidak menyediakan database server atau sinkronisasi.
- LocalStorage terpisah untuk setiap browser/perangkat. Data tidak otomatis berpindah antarperangkat.
- Jangan gunakan data pasien nyata. Prototipe ini bukan sistem rekam medis produksi.
- Jika CSS tidak termuat saat membuka `content://` dari file manager, uji melalui URL HTTPS GitHub Pages. Jalur relatif `css/styles.css` dan `js/...` akan di-resolve berdasarkan URL aplikasi.
