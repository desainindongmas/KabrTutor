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

`npm run dev` menjalankan frontend. Untuk fungsi server lokal, gunakan Netlify CLI: `npx netlify dev`. Environment rahasia di `.env` lokal, jangan commit. Frontend tetap dapat dijelajahi tanpa Supabase/Zoho; pengajuan sungguhan tidak akan menampilkan sukses jika backend belum tersedia.

Pemeriksaan invariant tanpa mengunduh dependensi, menggunakan Node 22.13+/24:

```sh
node scripts/check-engine.mjs
```

## Alur demo

Masuk tanpa login sebagai Owner. Pilih **Ikuti demo** untuk perjalanan Alya, atau gunakan tab Owner/Admin/Tutor/Portal untuk eksplorasi. Semua perubahan kursus tersimpan hanya di `kabrtutor_demo_v1`. Reset mengembalikan seed, bukan menghapus permintaan penerapan sungguhan.

Baseline: 40 peserta aktif, kapasitas 40/51, kas Rp44.920.000, piutang Rp4.280.000, kontribusi ilustratif Rp14.390.000. Jalur Alya menggunakan INV041: bayar Rp300.000, lalu Rp500.000, jalankan O01-F26 dengan tujuh peserta, submit dan publish evaluasi. Hasil: 41 peserta, kas Rp45.720.000, saldo Alya 7, 26 sesi selesai, kontribusi Rp14.890.000.

Role switcher hanya alat simulasi. Pembatasan UI ini bukan sistem otorisasi tenant produksi. Tidak ada pembayaran, pesan peserta, checkout platform, atau pencairan honor nyata.

## Deploy melalui GitHub → Netlify

1. Pilih **Add new project → Import an existing project → GitHub**, lalu repo `desainindongmas/KabrTutor`, branch `main`.
2. Konfigurasi di `netlify.toml` menetapkan build `npm run build`, publish `dist`, serta Netlify Functions. Runtime Node 22.
3. Frontend dapat diterbitkan setelah build lolos. Untuk mengaktifkan pengajuan nyata, lanjutkan konfigurasi di bawah sebelum mempromosikan form ke publik.
4. Pada Domain management, tambahkan `kabrtutor.desainindongmas.my.id`. Di penyedia DNS buat CNAME `kabrtutor` menuju hostname `.netlify.app` yang Netlify berikan (jangan memakai URL GitHub atau alamat IP acak). Tunggu verifikasi dan penerbitan TLS Netlify.
5. Uji URL langsung `/demo/owner`, `/biaya`, `/permintaan-demo` dan refresh route. Pastikan redirect `/api/demo-requests` tetap mendahului fallback SPA.

## Supabase dan pengajuan nyata

1. Buat proyek Supabase PostgreSQL. Jalankan `supabase/migrations/202610260001_demo_requests.sql` sekali melalui SQL editor.
2. Di Netlify Site configuration → Environment variables, tambahkan nilai server dari `.env.example`. Jangan beri prefix `VITE_`. Scope diperlukan pada Functions/runtime; redeploy setelah berubah.
3. `SUPABASE_SERVICE_ROLE_KEY` hanya di server. Tabel menggunakan RLS tanpa public policies, dan RPC dibatasi untuk `service_role`. Tidak ada API publik untuk mencari PIC/kontak dari referensi.
4. Buat `RATE_LIMIT_SECRET` acak (minimal 32 byte); IP di-hash dengan rahasia sebelum rate limiter, maksimal lima pengajuan baru per jam per IP. Retry idempotent tidak menerbitkan lead baru.
5. Admin berizin mengakses tabel melalui Supabase dashboard. Tidak ada halaman daftar permintaan publik. Tetapkan akses tim dan kebijakan retensi data sesuai kebutuhan operasional lembaga.

API: `POST /api/demo-requests`, JSON dan header UUID `Idempotency-Key`. Field sesuai form; unknown fields ditolak. Respons sukses berisi `reference` dan `emailStatus: QUEUED`, tanpa membocorkan isi record. Penyimpanan lead dan pembuatan job email berada dalam satu transaksi. Retry token/payload sama mengembalikan referensi sama; payload berbeda ditolak 409. Kegagalan DB/config mengembalikan 503 tanpa kode sukses.

## Zoho SMTP dan outbox

- Gunakan hostname pusat data akun Zoho yang sesuai (misalnya `smtp.zoho.com`), port 465 TLS atau 587 STARTTLS. Isi `SMTP_USER`, `SMTP_PASSWORD` (app password bila diwajibkan Zoho), dan `SMTP_FROM` dengan sender yang diizinkan akun. Jangan kirim password melalui chat.
- `MAIL_MESSAGE_DOMAIN` adalah domain sender terverifikasi untuk Message-ID stabil. Pastikan SPF/DKIM domain dikonfigurasi di Zoho.
- Penerima tetap: `admin3@desainindongmas.my.id`. WhatsApp lanjutan tetap `6285952839393`; pesan hanya dikirim setelah pengunjung menekan kirim di WhatsApp.
- Netlify Scheduled Function `email-worker` berjalan setiap lima menit pada deploy produksi. Development/Deploy Preview tidak menjalankan jadwal otomatis. Periksa ketersediaan Scheduled Functions dan batas penggunaan paket Netlify yang dipakai.
- Worker mengambil maksimal tiga job dengan lock/lease dan mencoba kirim secara paralel, paling banyak lima attempt dengan backoff. Job gagal tetap tersimpan; periksa outbox dan attempts pada dashboard Supabase. `SENT` berarti transport menerima email, bukan bukti email masuk inbox atau dibaca.
- Timeout setelah SMTP menerima pesan dapat menghasilkan duplikasi; Message-ID stabil dan audit hasil tidak pasti membantu pemeriksaan. Tidak mengklaim exactly-once delivery.
- Sebelum go-live, kirim pengajuan berlabel **UJI INTERNAL** melalui form. Verifikasi satu record dan satu job pada double-submit, attempt terjadwal, penerimaan transport, serta inbox admin secara terpisah. Uji juga SMTP gagal dan DB gagal. Hapus/arsipkan data uji lewat admin setelah pengecekan.

## Verifikasi dan batas yang perlu diketahui

GitHub Actions menjalankan unit/integration tests, TypeScript, production build, dan browser tests desktop/mobile pada setiap push/PR. Test API menggunakan store/transport uji dan tidak mengirim email nyata.

Tidak ada analytics eksternal pada versi awal; action log simulasi lokal tidak memuat kontak pengunjung. Waktu simulasi mulai 26 Oktober 2026, 09.00 WIB, terpisah dari timestamp server permintaan nyata. Harga SaaS mengikuti katalog blueprint; harga kursus dan estimasi honor/margin adalah ilustrasi.

Koneksi akun Netlify, Supabase, Zoho, dan DNS perlu dikonfigurasi pemilik layanan. Adanya source code tidak membuktikan deployment atau email sungguhan telah aktif. Jangan menandai QA email/database live lulus sebelum konfigurasi dan pengujian di layanan terkait.
