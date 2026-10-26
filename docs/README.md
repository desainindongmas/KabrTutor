# Paket Demo KabrTutor v1.0

Mulai dari `KabrTutor_Blueprint_Demo_v1.0.md`. Paket ini menyelesaikan langkah 1–4 perencanaan demo: rekonsiliasi source, halaman/role, dataset, dan skenario interaksi. Belum berisi website atau backend yang berjalan.

## Isi

- Blueprint Markdown: keputusan demo, aturan, halaman, role, skenario, harga resmi, batas konversi dan acceptance.
- `KabrTutor_Demo_Seed_v1.0.json`: data fiktif terhubung; semua kontak peserta tidak berisi tujuan komunikasi nyata.
- `build_demo_dataset.py`: Python 3.9+ (standard library; database zona waktu Asia/Jakarta harus tersedia).
- `dataset_validation.json`: ringkasan perhitungan dan pemeriksaan konsistensi.
- `KabrTutor_Logo_Source.png`: salinan logo source tanpa modifikasi.

## Bangun ulang seed

Jalankan dari direktori mana pun:

```bash
python3 build_demo_dataset.py
```

Gunakan path lengkap script bila direktori kerja berbeda. Script menulis seed dan laporan di direktori script. Jika folder `../project_sources` tersedia, SHA-256 source dihitung ulang; jika tidak tersedia, fingerprint pada seed yang disertakan dipertahankan, bukan diklaim terverifikasi ulang.

Pemeriksaan meliputi ID unik, relasi inti, relasi wali untuk anak, batas alokasi pembayaran, saldo sesi, kapasitas, overlap interval tutor/ruang, kunci ledger, dan agregat finansial. Hasil ini bukan tes website atau backend.

## Peringatan implementasi yang penting

State demo hanya fiktif dan bisa direset. Form permintaan penerapan adalah data sungguhan yang harus disimpan server-side dan terpisah. Email ringkasan otomatis menuju admin3@desainindongmas.my.id. WhatsApp lanjutan menuju 085952839393. Paket ini tidak mengirim pesan/email.

Snapshot simulasi: 26 Oktober 2026, 09.00 WIB. Waktu ini bukan waktu pengajuan sungguhan. Gunakan aksi eksplisit untuk memajukan simulasi.

Harga SaaS mengikuti source Subscription & Billing v1.0; harga kursus dalam seed adalah ilustrasi. Jangan mencampur invoice kursus, tagihan software, dan permintaan calon pelanggan.
