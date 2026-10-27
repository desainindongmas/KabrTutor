# KabrTutor — Demo interaktif v1.0

Demo operasional Lentera English Studio, lembaga fiktif. Implementasi mengacu pada blueprint di `docs/KabrTutor_Blueprint_Demo_v1.0.md`, dengan logo source asli dan dataset relasional yang disertakan.

## Menjalankan lokal

Node.js 22.12+ (disarankan Node 22 LTS).

```sh
npm install
npm run dev
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run dev` menjalankan frontend. Untuk frontend dan Worker lokal gunakan `npm run preview:cloudflare`. Rahasia runtime berada di `.dev.vars`, jangan commit. Frontend tetap dapat dijelajahi tanpa Supabase/Zoho; pengajuan sungguhan tidak akan menampilkan sukses jika backend belum tersedia.

Pemeriksaan invariant tanpa mengunduh dependensi, menggunakan Node 22.13+/24:

```sh
node scripts/check-engine.mjs
```

## Alur demo

Masuk tanpa login sebagai Owner. Pilih **Ikuti demo** untuk perjalanan Alya, atau gunakan tab Owner/Admin/Tutor/Portal untuk eksplorasi. Semua perubahan kursus tersimpan hanya di `kabrtutor_demo_v1`. Reset mengembalikan seed, bukan menghapus permintaan penerapan sungguhan.

Baseline: 40 peserta aktif, kapasitas 40/51, kas Rp44.920.000, piutang Rp4.280.000, kontribusi ilustratif Rp14.390.000. Jalur Alya menggunakan INV041: bayar Rp300.000, lalu Rp500.000, jalankan O01-F26 dengan tujuh peserta, submit dan publish evaluasi. Hasil: 41 peserta, kas Rp45.720.000, saldo Alya 7, 26 sesi selesai, kontribusi Rp14.890.000.

Role switcher hanya alat simulasi. Pembatasan UI ini bukan sistem otorisasi tenant produksi. Tidak ada pembayaran, pesan peserta, checkout platform, atau pencairan honor nyata.

## Deploy Cloudflare Pages, DNS tetap di Netlify

Nameserver dan pengelolaan DNS domain induk tetap di Netlify. Frontend dan API menggunakan Cloudflare Pages Functions; email diproses Worker Cron terpisah. Tidak perlu menambahkan zona domain induk ke Cloudflare.

1. Cloudflare → Workers & Pages → Create → **Pages** → Connect to Git. Pilih repo `desainindongmas/KabrTutor`, branch `main`.
2. Nama proyek `kabrtutor-demo` (atau nama tersedia), build `npm run build`, output `dist`, root repo `/`, build variable `NODE_VERSION=22`. Git-integrated Pages tidak memerlukan deploy command Worker.
3. Tunggu deployment berhasil dan uji URL `.pages.dev` yang diberikan Cloudflare. Functions pada folder `functions/` ikut dibangun otomatis. Konfigurasi `nodejs_compat` ada di `wrangler.jsonc`.
4. Pages → Custom domains → Set up a domain: masukkan `kabrtutor.desainindongmas.my.id` terlebih dahulu.
5. Netlify → pengelolaan DNS `desainindongmas.my.id`: ubah hanya record hostname `kabrtutor` menjadi CNAME ke **hostname `.pages.dev` aktual proyek** (tanpa https atau path). Jika record NETLIFY/NETLIFYv6 dikelola otomatis untuk hostname tersebut, lepaskan assignment subdomain itu dari situs Netlify lama dahulu; pertahankan zona DNS Netlify. Jangan ubah nameserver, record domain utama, MX, atau TXT.
6. Kembali ke Pages dan tunggu validasi domain serta sertifikat Active. Jangan gunakan URL Worker lama sebagai target CNAME.

### Database dan email: dua tempat konfigurasi

- **Pages project → Settings → Variables and Secrets (Production):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SECRET`. Redeploy setelah mengubah konfigurasi. Jangan memakai data produksi pada preview; tanpa secrets preview tetap bisa menjalankan simulasi.
- Jalankan migrasi SQL Supabase sekali bila belum dilakukan. Endpoint tetap `/api/demo-requests` pada origin Pages yang sama.
- **Worker terpisah `kabrtutor-email`:** buat Worker dari repo yang sama; deploy command `npx wrangler@4 deploy --config wrangler.email.jsonc`, build command boleh kosong karena bundler Wrangler mengompilasi TypeScript. Atau deploy dari komputer melalui `npm run deploy:email` setelah login Wrangler.
- Pada Worker email, isi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan semua `ZOHO_*` di tabel berikut. Worker email tidak memerlukan custom domain, public URL, atau `RATE_LIMIT_SECRET`.
- **Matikan Cron Trigger Worker lama `kabrtutor` setelah worker email baru aktif**, agar hanya satu scheduler digunakan. Jangan menghapus layanan lama sebelum Pages/custom domain terverifikasi.
- Pages menerima dan menyimpan permintaan meskipun worker email belum aktif; job tetap antre, bukan bukti email terkirim. Verifikasi Cron dan inbox sebelum menyatakan funnel siap.

### Konfigurasi runtime

| Nama | Isi |
| --- | --- |
| `SUPABASE_URL` | URL proyek Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret server Supabase; jangan anon key |
| `RATE_LIMIT_SECRET` | Secret acak minimal 32 byte; misalnya hasil `openssl rand -hex 32` |
| `ZOHO_CLIENT_ID` | Client OAuth Zoho |
| `ZOHO_CLIENT_SECRET` | Secret client OAuth |
| `ZOHO_REFRESH_TOKEN` | Refresh token OAuth offline |
| `ZOHO_ACCOUNT_ID` | ID akun email pengirim dari Zoho Mail API |
| `ZOHO_FROM` | Alamat sender yang diizinkan akun Zoho |
| `ZOHO_ACCOUNTS_ORIGIN` | Accounts origin sesuai data center, default `https://accounts.zoho.com` |
| `ZOHO_MAIL_ORIGIN` | Mail API origin pada data center yang sama, default `https://mail.zoho.com` |

### Zoho: beralih dari SMTP ke HTTPS API

Worker mengirim melalui Zoho Mail API HTTPS. `SMTP_*` dan `MAIL_MESSAGE_DOMAIN` tidak digunakan lagi. Penerima tetap `admin3@desainindongmas.my.id`; WhatsApp tetap `6285952839393`.

Di Zoho API Console pada data center akunmu, buat Self Client untuk integrasi server milik sendiri. Berikan scopes `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`. Ikuti alur grant-code/OAuth Zoho untuk mendapatkan refresh token; grant code berumur pendek dan bukan refresh token. Tukarkan kode di lingkungan milikmu, lalu simpan client secret dan refresh token hanya sebagai Worker Secrets. Jangan kirim token lewat chat atau commit.

Dengan access token, `GET {ZOHO_MAIL_ORIGIN}/api/accounts` memberikan accountId akun pengirim. Pilih akun yang memiliki alamat `ZOHO_FROM`. Pastikan paket akun mendukung Mail API dan sender/domain diizinkan. Dokumentasi: https://www.zoho.com/mail/help/api/ dan https://www.zoho.com/accounts/protocol/oauth.html .

Antrean tetap persisten di Supabase, dengan claim/lease, maksimal lima attempt, dan backoff. Cron Trigger berjalan setiap lima menit; propagasi perubahan jadwal Cloudflare dapat membutuhkan beberapa menit. Email sukses berarti diterima provider, bukan bukti inbox. Zoho Mail API tidak memberi jaminan exactly-once: timeout setelah penerimaan dapat menyebabkan duplikasi pada retry. Gunakan referensi tetap pada subjek untuk memeriksa hasil yang tidak pasti; riwayat attempt tidak dihapus.

### Verifikasi setelah konfigurasi

- Uji `/demo/owner`, `/biaya`, `/permintaan-demo` melalui URL langsung dan refresh.
- Jalankan workflow **Verify public Cloudflare deployment** secara manual setelah custom domain siap. Pemeriksaan ini hanya membaca halaman dan batas metode API; tidak mengirim lead.
- Kirim satu form bertanda **UJI INTERNAL**. Pastikan satu record `demo_requests`, satu job outbox, dan kode referensi yang sama pada retry.
- Periksa Worker Cron/log serta tabel attempts. Konfirmasi email masuk inbox admin secara terpisah. Reset demo tidak boleh menghapus permintaan.
- Jangan mengaktifkan promosi form sebelum uji database dan email sungguhan selesai. Tidak ada public lookup berdasarkan kode referensi.

### Lokal dan CI

`npm run preview:cloudflare` membangun frontend dan menjalankan Wrangler. Simpan runtime secrets lokal pada `.dev.vars` (diabaikan Git). `npm run deploy` membangun dan deploy Pages melalui login Wrangler milikmu; `npm run deploy:email` menerbitkan Worker Cron terpisah. CI menjalankan tes, TypeScript, Vite build, Wrangler dry-run, dan tes browser. Dry-run tidak memerlukan kredensial Cloudflare dan tidak menerbitkan Worker.

State simulasi browser, seluruh role, harga software, dan dataset fiktif tetap sama. Backend tenant produksi tidak termasuk demo. Database/email live hanya dianggap terverifikasi setelah konfigurasi akun dan pemeriksaan nyata.
