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

## Deploy GitHub → Cloudflare Workers

Gunakan Workers dengan Static Assets, bukan Cloudflare Pages. `wrangler.jsonc` melayani frontend SPA, endpoint `/api/demo-requests`, serta Cron Trigger lima menit. Supabase tetap digunakan; migrasi SQL tidak berubah.

1. Cloudflare Dashboard → Workers & Pages → Create → Import a repository. Pilih `desainindongmas/KabrTutor`, branch `main`, proyek Worker bernama `kabrtutor-demo`.
2. Build command: `npm run build`. Deploy command: `npx wrangler@4 deploy`. Root directory: `/`. Gunakan Node 22 pada build. Jangan mengatur output Pages; assets sudah ditentukan sebagai `dist` di Wrangler.
3. Deploy pertama dapat dilakukan sebelum secrets tersedia untuk menguji demo. Form mengembalikan kegagalan yang jujur sampai backend siap. Cron akan gagal sampai konfigurasi lengkap; periksa Workers Logs.
4. Pada Worker → Settings → Variables and Secrets, isi variabel pada tabel di bawah. Simpan kredensial sebagai Secret, bukan build variable atau variabel `VITE_`. Deploy ulang bila diminta dashboard.
5. Jalankan SQL `supabase/migrations/202610260001_demo_requests.sql` sekali di proyek Supabase. Jika sudah pernah dijalankan, jangan ulangi CREATE TABLE.
6. Setelah URL `workers.dev` berfungsi, Worker → Settings → Domains & Routes → Add → Custom Domain: `kabrtutor.desainindongmas.my.id`. Zona `desainindongmas.my.id` harus aktif di akun Cloudflare yang sama. Jika record `kabrtutor` masih menunjuk Netlify, hapus hanya record yang konflik saat cutover lalu tambahkan custom domain melalui Worker. Cloudflare mengelola DNS/TLS binding tersebut. Jangan mengubah record MX/TXT email.
7. Setelah custom domain lolos, hentikan auto-deploy Netlify dan hapus custom domain lama di Netlify. Jangan mematikan situs lama sebelum domain baru terverifikasi.

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

`npm run preview:cloudflare` membangun frontend dan menjalankan Wrangler. Simpan runtime secrets lokal pada `.dev.vars` (diabaikan Git). `npm run deploy` membangun dan deploy melalui login Wrangler milikmu. CI menjalankan tes, TypeScript, Vite build, Wrangler dry-run, dan tes browser. Dry-run tidak memerlukan kredensial Cloudflare dan tidak menerbitkan Worker.

State simulasi browser, seluruh role, harga software, dan dataset fiktif tetap sama. Backend tenant produksi tidak termasuk demo. Database/email live hanya dianggap terverifikasi setelah konfigurasi akun dan pemeriksaan nyata.
