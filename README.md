# Kode SPKRT 2027 (PWA)

Aplikasi web progresif (PWA) untuk mencari dan menyalin kode komoditas dan kualitas dari **Buku 5 Master Kode Komoditas dan Kualitas SPKRT 2027**. Berjalan di HP tanpa instalasi dari toko aplikasi, dan hampir semua fiturnya jalan tanpa internet.

Dokumen ini ditujukan bagi developer yang ingin menjalankan atau menyalin proyek ini dengan Gemini API dan proxy Cloudflare Worker milik sendiri.

## Fitur

- **Pencarian cerdas**: kode (7 digit komoditas atau 10 digit lengkap), nama komoditas, nama kualitas, atau merek. Ada autocomplete, koreksi salah ketik, dan alias kata sehari-hari.
- **Telusur hierarki**: kelompok, subkelompok, kelas, komoditas, kualitas, dengan deskripsi cakupan tiap kelompok.
- **Akses cepat**: favorit komoditas, favorit kualitas, 5 pencarian terakhir, 5 komoditas terakhir.
- **Salin kode satu ketuk**: format polos (`0111001155`) atau per komponen (`01 1 1 001 155`).
- **Scan daftar teks**: tempel daftar barang (maksimal 500 baris), tiap baris dicocokkan ke kode, dengan label kecocokan dan rekomendasi alternatif. Jalan tanpa internet.
- **Baca foto tulisan tangan atau nota** (JPG, PNG, HEIC) lewat Gemini. Hasilnya masuk ke kotak teks untuk diperiksa sebelum dicocokkan. Butuh internet.
- **Referensi Ikan**: foto dan nama ikan serta hasil laut yang sulit dikenali (laut dan air tawar), dengan pencarian dan tautan ke kode di master.
- Tombol kembali HP bekerja di dalam app, pop-up untuk galat dan peringatan, 4 tema, menu Panduan.

## Arsitektur

```
HP (PWA di GitHub Pages)  ──►  Cloudflare Worker (proxy)  ──►  Gemini API
   foto diperkecil di HP         menyimpan API key sebagai        membaca foto,
   data master + pencarian       secret, membatasi permintaan     mengembalikan daftar
   berjalan di browser                                            barang
```

Key Gemini **tidak pernah** ada di kode app atau di repositori. Browser hanya berbicara dengan Worker. Worker hanya melayani dua perintah, yaitu `ocr` (baca foto) dan `ping` (tes koneksi), sehingga tidak bisa dipakai sebagai relay Gemini umum.

## Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Kerangka halaman |
| `app.js` | Antarmuka, navigasi, favorit, pop-up, alur baca foto |
| `core.js` | Mesin pencarian dan pencocokan baris (tanpa dependensi) |
| `data.js` | Data master (`const D=...`) |
| `desc.js` | Deskripsi kelompok (`const DESC=...`) |
| `ikan.js` | Data referensi ikan (`const IKAN=...`), dibuat dari Excel dengan `tools/build_ikan.py` |
| `ikan/` | Foto referensi ikan, satu file `<ID>.webp` per entri |
| `tools/build_ikan.py` | Membuat `ikan.js` dari file Excel daftar ikan |
| `tools/statistik.html` | Halaman lokal untuk melihat statistik pemakaian baca foto dan menghitung batas yang disarankan (jangan diunggah ke GitHub Pages) |
| `config.js` | Alamat Worker (`const CFG={proxy:'...'}`) |
| `style.css` | Tema dan gaya |
| `sw.js` | Service worker (cache untuk offline) |
| `manifest.webmanifest`, `icon-*.png` | Manifest dan ikon PWA |
| `worker/worker.js` | Kode Cloudflare Worker (tidak ikut diunggah ke GitHub Pages) |

## Prasyarat

- Akun GitHub (untuk GitHub Pages).
- Akun Cloudflare (paket gratis cukup untuk pemakaian kecil).
- Akun Google untuk membuat API key di Google AI Studio.
- Browser Chrome di Android atau Safari di iOS untuk memasang PWA.

## Langkah 1: Siapkan API key Gemini

1. Buka [aistudio.google.com](https://aistudio.google.com) dan masuk dengan akun Google.
2. Buat API key baru. Sebaiknya **key khusus** untuk proyek ini agar mudah dicabut jika bocor.
3. Tentukan nama model. Pilih model Gemini yang mendukung input gambar dan tersedia di akun Anda. Nama model dan kuota gratisnya sering berubah, jadi cek daftar terbaru di dokumentasi Google (`ai.google.dev`) dan halaman batas penggunaan di AI Studio. Contoh nama yang dipakai saat proyek ini dibuat: `gemini-3.1-flash-lite`.
4. Catat dua hal itu. Key hanya dipakai di langkah 2 sebagai secret. **Jangan menulis key di chat, di file, atau di repositori.**

Catatan privasi: pada tier gratis, Google dapat memakai data permintaan untuk meningkatkan produknya, dan peninjau manusia dapat membacanya. Baca ketentuan terbaru sebelum dipakai untuk data sensitif. Di app, pemberitahuan ini muncul sebelum foto pertama dikirim.

## Langkah 2: Pasang Cloudflare Worker

### Lewat dashboard

1. Masuk ke [dash.cloudflare.com](https://dash.cloudflare.com), buka **Workers & Pages**, lalu **Create**.
2. Pilih **Start with Hello World!**. Beri nama, misalnya `spkrt-gemini`, lalu **Deploy**.
3. Klik **Edit code**. Hapus semua kode contoh, tempel seluruh isi `worker/worker.js`, lalu **Deploy**.
4. Buka **Settings → Variables and Secrets** dan tambahkan variabel di bawah.
5. (Disarankan) Pasang penyimpanan hitungan pemakaian. Pilihan terbaik **D1**: buat database di **Storage & Databases → D1** (nama bebas, misalnya `spkrt-usage`), lalu di Worker buka **Settings → Bindings → Add → D1 database** dengan variable name `DB`. Tabel dibuat otomatis. Alternatif **KV** (lebih sederhana tetapi hanya perkiraan, dan batas tulis harian paket gratisnya kecil): binding KV namespace dengan variable name `KV`.
6. Salin alamat Worker, bentuknya `https://spkrt-gemini.<subdomain-anda>.workers.dev`.

Nama menu di dashboard Cloudflare bisa berubah dari waktu ke waktu.

### Variabel Worker

| Nama | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `GEMINI_KEY` | Secret | Ya | API key Gemini dari langkah 1 |
| `GEMINI_MODEL` | Text | Ya | Nama model, misalnya `gemini-3.1-flash-lite` |
| `ALLOWED_ORIGIN` | Text | Disarankan | Alamat asal app, misalnya `https://username.github.io`. Hanya domain, **tanpa** nama repositori dan **tanpa** garis miring di akhir. Jika kosong, semua asal diizinkan |
| `MAX_IMAGES` | Text | Tidak | Maksimal foto per permintaan. Bawaan 5 |
| `DEVICE_LIMIT` | Text | Tidak | Maksimal proses foto per HP per hari. `0` atau kosong berarti tanpa batas (mode uji coba, hanya menghitung). Perlu `DB` atau `KV` |
| `GLOBAL_LIMIT` | Text | Tidak | Maksimal proses foto per hari untuk semua HP. Disarankan sekitar 80% dari kuota harian model. `0` atau kosong berarti tanpa batas |
| `MIN_INTERVAL` | Text | Tidak | Jeda minimal antar proses foto per HP, dalam detik. `0` atau kosong berarti tanpa jeda |
| `ADMIN_KEY` | Secret | Tidak | Kunci pengelola untuk mengambil statistik (`tools/statistik.html`) |
| `DB` | Binding D1 | Disarankan | Penyimpanan hitungan pemakaian (akurat) |
| `KV` | Binding KV | Alternatif | Penyimpanan hitungan pemakaian (perkiraan). Dipakai jika `DB` tidak ada |
| `ACCESS_CODE` | Secret | Tidak | Kode akses yang dicek lewat header `X-Access-Code`. **App bawaan tidak mengirim kode**, jadi biarkan kosong kecuali Anda menambahkan input kode di `app.js`. Jika terisi tanpa perubahan itu, semua permintaan ditolak (401) |

### Alternatif: lewat Wrangler (CLI)

```bash
npm install -g wrangler
wrangler login
mkdir spkrt-gemini && cd spkrt-gemini
cp /path/ke/worker/worker.js ./worker.js
```

Buat `wrangler.toml`:

```toml
name = "spkrt-gemini"
main = "worker.js"
compatibility_date = "2026-10-25"

[vars]
GEMINI_MODEL = "gemini-3.1-flash-lite"
ALLOWED_ORIGIN = "https://username.github.io"
MAX_IMAGES = "5"
DEVICE_LIMIT = "0"        # isi setelah masa uji coba
GLOBAL_LIMIT = "0"
MIN_INTERVAL = "0"

# Opsional: hitungan pemakaian (pilih salah satu)
# [[d1_databases]]
# binding = "DB"
# database_name = "spkrt-usage"
# database_id = "ID_D1_ANDA"
#
# [[kv_namespaces]]
# binding = "KV"
# id = "ID_KV_ANDA"
```

Lalu:

```bash
wrangler secret put GEMINI_KEY   # tempel key saat diminta
wrangler deploy
```

### Uji Worker dari terminal

```bash
curl -s -X POST https://spkrt-gemini.<subdomain>.workers.dev \
  -H "Origin: https://username.github.io" \
  -H "Content-Type: application/json" \
  -d '{"mode":"ping"}'
# hasil yang benar: {"ok":true}
```

## Langkah 3: Hubungkan app ke Worker

Edit `config.js`:

```js
const CFG = { proxy: 'https://spkrt-gemini.<subdomain>.workers.dev' };
```

Selama masih berisi `GANTI-INI`, tombol baca foto menampilkan pesan "Layanan belum diatur".

## Langkah 4: Terbitkan di GitHub Pages

1. Buat repositori **Public** di GitHub. GitHub Pages gratis hanya mendukung repositori Public.
2. Unggah semua file app (`index.html`, `app.js`, `core.js`, `data.js`, `desc.js`, `config.js`, `style.css`, `sw.js`, `manifest.webmanifest`, ikon) ke akar repositori. Jangan unggah folder `worker/` bila tidak perlu.
3. Buka **Settings → Pages**, pilih Branch `main` dan folder `/ (root)`, lalu Save.
4. Tunggu 1–2 menit. Alamatnya `https://username.github.io/nama-repositori/`.
5. Pastikan `ALLOWED_ORIGIN` di Worker sama dengan `https://username.github.io`.

Sebelum memakai domain sendiri atau mengubah nama repositori, ingat bahwa favorit dan pengaturan tersimpan per alamat, jadi tidak ikut pindah.

## Langkah 5: Uji di HP

1. Buka alamat Pages di Chrome saat ada internet.
2. Menu ⋮ → **Tambahkan ke layar utama**.
3. Buka **Scan daftar → Pengaturan layanan → Tes koneksi**. Pesan "Koneksi berhasil" berarti Worker, key, dan model sudah benar.
4. Coba satu foto nota atau tulisan tangan.

## Menjalankan di komputer sendiri

Service worker hanya aktif di `localhost` atau HTTPS, jadi gunakan server lokal:

```bash
cd folder-app
python3 -m http.server 8000
# buka http://localhost:8000
```

Agar baca foto bisa diuji dari alamat lokal, ubah sementara `ALLOWED_ORIGIN` di Worker menjadi `http://localhost:8000`, atau kosongkan variabel itu selama pengujian.

## Batas pemakaian dan masa uji coba

Baca foto memakai kuota gratis Gemini yang dipakai bersama semua pengguna, jadi perlu batas. Setiap HP membuat ID acak (tanpa nama) yang disimpan di browser dan dikirim lewat header `X-Device-Id`. Worker menghitung pemakaian per HP dan total harian, memakai "hari" menurut zona waktu Pasifik karena kuota Gemini pulih pukul 00.00 waktu Pasifik.

Alur yang disarankan:

1. **Uji coba**: pasang `DB` (atau `KV`) dan `ADMIN_KEY`, biarkan `DEVICE_LIMIT`, `GLOBAL_LIMIT`, dan `MIN_INTERVAL` kosong. Worker hanya menghitung.
2. Setelah 2–3 hari, buka `tools/statistik.html` di komputer, isi alamat Worker dan `ADMIN_KEY`, lalu lihat jumlah proses, HP aktif, serta median, p90, dan maksimum pemakaian per HP. Panel kedua di halaman itu menghitung batas yang disarankan dari kuota model, jumlah petugas, dan persen pengguna foto.
3. Isi `DEVICE_LIMIT`, `GLOBAL_LIMIT`, dan `MIN_INTERVAL` di Worker (tanpa mengubah app). Pastikan batas per HP tidak lebih kecil dari p90 hasil uji coba.
4. Setelah batas aktif, app menampilkan sisa jatah per HP, dan pesan berisi perkiraan jam pulih saat batas atau kuota habis.

Statistik lewat terminal:

```bash
curl -s -X POST https://spkrt-gemini.<subdomain>.workers.dev \
  -H "X-Admin-Key: KUNCI_PENGELOLA" -H "Content-Type: application/json" \
  -d '{"mode":"stats","days":3}'
```

Catatan: ID HP dibuat acak dan tidak mengidentifikasi orang, tetapi menghapus data browser membuat HP dihitung sebagai perangkat baru. Karena itu batas global dan batas per IP tetap berguna sebagai pengaman tambahan.

## Kontrak API Worker

`POST` ke alamat Worker, `Content-Type: application/json`.

| Permintaan | Hasil sukses |
|---|---|
| `{"mode":"ping"}` | `{"ok":true}` |
| `{"mode":"ocr","images":["<base64 JPEG>", ...]}` | `{"items":["beras IR 64","minyak goreng", ...]}` |

Foto dikirim sebagai base64 JPEG (app memperkecilnya ke sisi terpanjang 1600 px di browser). Kode galat:

| Kode | Arti |
|---|---|
| 400 | Jumlah foto kosong atau melebihi `MAX_IMAGES` |
| 401 | `ACCESS_CODE` terisi dan header tidak cocok |
| 403 | Header `Origin` tidak sama dengan `ALLOWED_ORIGIN` |
| 413 | Satu foto terlalu besar |
| 429 | Salah satu dari: batas per HP tercapai (`batas perangkat`), batas global tercapai (`kuota layanan`), terlalu cepat (`jeda`, dengan `retryAfter` detik), atau kuota Gemini habis (`gemini`). Body JSON memuat `reset` (waktu pulih, milidetik epoch) |
| 500 | `GEMINI_KEY` atau `GEMINI_MODEL` belum diatur |
| 502 | Gemini gagal atau hasilnya tidak terbaca |

## Mengganti data master

`data.js` berisi:

```js
const D = {
  G: { "01": "NAMA KELOMPOK" },            // kelompok (2 digit)
  S: { "011": "NAMA SUBKELOMPOK" },        // subkelompok (kelompok + 1 digit)
  K: { "0111": "NAMA KELAS" },             // kelas (subkelompok + 1 digit)
  C: [                                     // komoditas (kelas + 3 digit)
    ["0111001", "BERAS", [["001", "77"], ["002", "99"]]]   // [kode, nama, [[kode kualitas, nama kualitas], ...]]
  ]
};
```

Kode lengkap adalah kode komoditas (7 digit) ditambah kode kualitas (3 digit), total 10 digit. `desc.js` berisi `const DESC = { "01": "teks cakupan", "121": "..." }`, kuncinya kode kelompok atau subkelompok.

Data di repositori ini diekstrak otomatis dari PDF Buku 5 Master. Hasil ekstraksi bisa memuat nama panjang yang terpotong atau tergabung. Periksa terhadap sumber resmi sebelum dipakai untuk pekerjaan penting.

## Referensi Ikan

Data dikelola di Excel (kolom ID, Habitat, Kategori, Nama Indonesia (utama), Nama Indonesia lain, Nama ilmiah, Nama Inggris, Ukuran maks, Ukuran umum, Nama lokal, Komoditas master). Setelah mengubah Excel, buat ulang `ikan.js`:

```bash
pip install openpyxl
python3 tools/build_ikan.py daftar_referensi_ikan.xlsx app/ikan.js
```

Ketentuan kolom:

- **ID** menghubungkan baris dengan foto `app/ikan/<ID>.webp`. Jangan diubah. Baris baru membutuhkan foto baru dengan ID yang sama.
- **Habitat**: kata "tawar" berarti air tawar, selain itu dianggap laut.
- **Kategori**: `ikan`, `krustasea`, atau `moluska`.
- **Nama lain** dan **Nama lokal**: pisahkan dengan titik koma. Nama lokal ikut dicari.
- **Komoditas master**: tulis kode komoditas 7 digit di awal, misalnya `0113025 IKAN KERAPU`. Beberapa dipisah titik koma. Jika diisi dan kodenya ada di master, halaman detail menampilkan tautan ke komoditas itu.

**Saran kode SPKRT.** Halaman detail ikan menyarankan komoditas di master (kelas 0113) secara otomatis, tanpa Excel. Urutan pencocokan: nama Indonesia, nama Inggris, ikan sejenis (genus yang sama, bila mayoritas cocok ke satu komoditas), nama lokal, lalu yang hanya mirip. Jika master punya kualitas khusus untuk jenis itu (misalnya Ikan Bawal dengan kualitas Hitam atau Putih), kode kualitasnya ikut disarankan. Jika master hanya punya satu komoditas untuk banyak jenis (misalnya Ikan Tuna), komoditas itulah yang disarankan. Kolom **Komoditas master** di Excel, bila diisi, didahulukan. Produk olahan (diawetkan, asin, beku, kaleng, dan sejenisnya) tidak disarankan. Logikanya ada di `core.js` (fungsi `fishSuggest`). Di Scan daftar, baris yang tidak cocok ke master tetapi dikenali sebagai ikan di Referensi Ikan memakai saran yang sama.

Foto dikecilkan ke lebar 560 px (WebP). Semua foto disimpan di cache agar bisa dibuka tanpa internet. Setelah mengubah data atau foto, naikkan versi `spkrt-vN` di `sw.js`, dan perbarui juga daftar foto `P` di dalamnya jika ada foto baru.

## Memperbarui app yang sudah terpasang

Setiap kali file berubah, naikkan nomor versi cache di `sw.js`, misalnya `spkrt-v6` menjadi `spkrt-v7`. Tanpa itu, HP yang sudah memasang app tetap memakai cache lama. Setelah mengunggah, pengguna menutup app sepenuhnya lalu membukanya lagi saat ada internet.

## Pemecahan masalah

| Gejala | Kemungkinan penyebab dan solusi |
|---|---|
| "Layanan belum diatur" | `config.js` belum berisi alamat Worker |
| 403 Akses ditolak | `ALLOWED_ORIGIN` tidak persis sama dengan alamat asal app (periksa `https`, tanpa jalur repositori, tanpa garis miring akhir) |
| 401 Akses ditolak | Variabel `ACCESS_CODE` masih ada di Worker. Hapus |
| 429 Batas penggunaan | `DEVICE_LIMIT`, `GLOBAL_LIMIT`, jeda, atau kuota Gemini tercapai. App menampilkan pesan dan perkiraan jam pulih. Kuota harian Gemini pulih pukul 00.00 waktu Pasifik |
| 502 Layanan bermasalah | Nama model salah atau sudah dihapus Google, key salah, atau Gemini sedang bermasalah. Periksa `GEMINI_MODEL`, lalu jalankan Tes koneksi |
| Galat CORS di konsol browser | Worker belum dipasang, alamat di `config.js` salah, atau `ALLOWED_ORIGIN` tidak cocok |
| Tampilan app masih versi lama | Cache belum diperbarui. Naikkan versi di `sw.js`, unggah, lalu tutup dan buka lagi app |
| Foto HEIC gagal diproses | Konversi HEIC memuat pustaka dari internet. Pastikan ada koneksi, atau ubah foto ke JPG atau PNG |

## Keamanan dan batasan

- Pemeriksaan `Origin` hanya melindungi dari browser. Program di luar browser bisa memalsukan header itu. Pasang `DB` (atau `KV`) dan atur `DEVICE_LIMIT` serta `GLOBAL_LIMIT`, pantau kuota di AI Studio, dan ganti key jika dicurigai bocor.
- Semua pengguna berbagi satu kuota Gemini. Kuota gratis kecil dan bisa berubah.
- Repositori Public membuat semua file, termasuk data master, dapat diunduh siapa saja. Pastikan Anda berhak menerbitkan data tersebut.
- Foto responden atau data pribadi sebaiknya tidak difoto. Foto di folder `ikan/` berasal dari materi pihak lain, jadi pastikan hak penerbitannya sebelum repositori dibuat Public.
- Footer app memuat "Copyright © BPS Kabupaten Raja Ampat". Ubah teksnya di `app.js` (kata `footer class="cp"` dan `cp2`) bila instansi berbeda. Hasil baca foto selalu perlu diperiksa manual.

## Sumber data

Data berasal dari Buku 5 Master Kode Komoditas dan Kualitas SPKRT 2027. Hak atas data tetap pada penerbit aslinya. Proyek ini hanya menyajikan ulang data tersebut untuk memudahkan pencarian.
