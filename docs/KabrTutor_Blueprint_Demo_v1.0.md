# KabrTutor — Blueprint Demo v1.0

Tanggal: 25 Oktober 2026 · Bahasa: Indonesia · Zona waktu: Asia/Jakarta · Mata uang: IDR.

Status: spesifikasi demo untuk implementasi, hasil langkah 1–4. Belum website yang dibangun atau diuji pengguna. Aturan demo yang dipilih di sini adalah konfigurasi lembaga contoh, bukan kontrak universal semua pelanggan KabrTutor. Harga komersial mengikuti source subscription v1.0 yang sudah dikunci.

## 1. Keputusan produk dan tujuan demo

KabrTutor adalah sistem operasional bisnis pendidikan nonformal, terpisah dari Kabar Kelas untuk sekolah formal. Target pembeli demo: owner bimbel, kursus, les, atau akademi. Contoh awal memakai kursus Bahasa Inggris; core produk tetap lintas jenis lembaga.

Pesan utama: **Pegang kendali bisnis kursus Anda.**

Penjelasan: Pantau pendaftaran, keterisian kelas, pembayaran, dan pelaksanaan sesi dalam satu sistem, lengkap dengan tindak lanjut untuk tim.

Tiga bukti yang harus dialami calon pembeli:

1. Owner menemukan peluang dan masalah bisnis beserta data penyebabnya.
2. Tim memproses tindakan; perubahan terlihat konsisten antar-role.
3. Owner memahami hasil transaksi dan layanan, lalu bisa mengirim permintaan penerapan.

Pusat dashboard adalah **Prioritas Bisnis**: temuan → alasan → tindakan → penanggung jawab → hasil. Retention Radar menjadi bagian dari prioritas kelanjutan paket. Progress Passport mendukung bukti layanan, evaluasi, dan percakapan kelanjutan belajar; keduanya bukan pembuka seluruh pengalaman.

Jangan menjanjikan kenaikan laba, penghematan waktu, keberhasilan renewal, atau prediksi churn yang belum tervalidasi. Tidak ada probabilitas churn buatan, testimoni fiktif yang disajikan sebagai nyata, atau hitungan mundur urgensi palsu.

## 2. Rekonsiliasi seluruh source

Urutan acuan: instruksi terbaru pengguna untuk tujuan demo dan konversi → subscription v1.0 untuk harga → domain/B untuk invariant → C/C1 untuk UI → C2 sebagai deskripsi prototype lama. Pengecualian demo dijelaskan di tabel, tidak mengubah source asli.

| Source yang dibaca | Dipertahankan | Penyesuaian untuk demo v1.0 |
|---|---|---|
| KabarKelas_PRD_Universal_v0.1.md | Core universal, pemisahan enrollment/order/entitlement/invoice/payment | Nama lama adalah jejak historis dokumen; UI dan identitas baru seluruhnya KabrTutor. Portal mengikuti spesifikasi B/C yang lebih baru meskipun PRD lama menaruhnya P1. |
| KabrTutor_Domain_Model_ERD_v0.2.md | Program ≠ kelas ≠ sesi; saldo ledger; guardianship; policy/rubric berversi | Relasi core dijadikan kontrak dataset. Simulasi client tidak diklaim sebagai implementasi keamanan multi-tenant. |
| KabrTutor_Tahap_B_User_Flows_Business_Rules_v0.3.md | B01–B08, aturan kapasitas, pembayaran, sesi, publikasi | B08 menjadi pembuka, B02 menjadi cerita utama. Pilihan B-DEC untuk demo dijelaskan di bagian 4. |
| KabrTutor_Tahap_C_UI_UX_Blueprint_v0.4.md | ID layar, navigasi role, state, responsif, akses | Tambah pipeline lead ringkas, tugas bisnis, ringkasan honor perkiraan, serta funnel permintaan demo. Tidak menjanjikan CRM atau payroll lanjutan sebagai fitur produk yang sudah tersedia. |
| KabrTutor_Tahap_C1_High_Fidelity_UI_v0.5.md | Navy/biru/teal, hierarki, kartu KPI, mobile tutor/portal | Gunakan token C1 bila berbeda dengan C. Grafik sepenuhnya diturunkan dari seed, bukan menyalin angka mockup. |
| KabrTutor_Tahap_C2_Prototype_Spec_v0.6.md | Pola role switch dan skenario bentrok/absensi/portal | Prototype HTML yang disebut tidak terlampir. V1 baru mensyaratkan overlap interval, ledger, pembayaran simulasi dan state lokal persisten; kemampuan ini tidak diasumsikan sudah ada. |
| KabrTutor_Subscription_Billing_Blueprint_v1.0(1).md | Harga locked, seat unik, trial, dua ledger terpisah | Koreksi pernyataan percakapan lama bahwa harga belum final. Tambahkan informasi harga sekunder; lifecycle/grace/refund yang masih proposal tidak dijadikan janji. |
| Logo PNG dari source | Figur tutor–peserta dan wordmark KabrTutor biru/teal | Gunakan aset asli dengan proporsi benar. Tidak menyebut PNG ini sebagai SVG/vector master. |

### Konflik dan keputusan penting

- Masa berlaku paket: percakapan sebelumnya mengusulkan sejak sesi pertama; source B memakai aktivasi. Demo memilih **60 hari sejak aktivasi pembayaran lunas**, ditampilkan sebelum pendaftaran.
- Pembayaran sebagian: invoice menjadi partial, tetapi paket baru belum aktif. Enrollment baru pending dan tidak boleh mengikuti sesi sebelum pelunasan. Paket lama yang masih aktif tetap bisa dipakai pada kasus renewal.
- Aktivasi pending tidak langsung menambah peserta aktif. Reservasi kursi sementara dicatat terpisah dari peserta aktif, berlaku 24 jam waktu simulasi dan dilepas jika habis; tidak ada reservasi permanen hanya karena invoice dibuat.
- Honor, biaya ruang dan margin adalah estimasi ilustratif tambahan demo. Source P0 belum mencakup payroll payout lengkap. Tidak ada tombol pencairan honor nyata atau klaim laba bersih.
- Pipeline lead adalah perluasan demo ringan untuk cerita penjualan, bukan klaim CRM otomatis lengkap.
- Pengiriman email permintaan demo adalah tambahan funnel penjualan KabrTutor di luar operasional lembaga. Ini tidak sama dengan kampanye otomatis ke peserta yang masih di luar P0.
- Demo hanya satu cabang. Tidak ada switcher cabang kosong, plan gating yang tidak ditunjang, atau janji fitur roadmap sudah tersedia.

## 3. Batas sistem yang harus dipisah saat build

| Ranah | Jenis data | Penyimpanan dan aksi |
|---|---|---|
| Operasional lembaga contoh | Semua fiktif: peserta, invoice kursus, pembayaran, sesi, progres | State browser per pengunjung, namespace `kabrtutor_demo_v1`; bisa direset. Tidak mengirim pesan atau menarik uang nyata. |
| Permintaan calon pelanggan | Data sungguhan yang pengunjung isi dengan sengaja | Endpoint server, database persisten, kode referensi unik, outbox email, audit pengiriman. Tidak tersimpan sebagai transaksi kursus. |
| Langganan platform | KabrTutor → lembaga | Pada demo hanya informasi harga dan kalkulasi sederhana. Tidak ada checkout, aktivasi trial nyata, atau tagihan platform sungguhan. |

Reset/refresh/ganti role tidak boleh menghapus permintaan sungguhan. Tidak ada salinan data kontak prospek ke seed. Konfigurasi SMTP dan kredensial tidak boleh berada di browser. Data kursus simulasi tidak masuk ke database lead sungguhan. Jangan menyalin isi localStorage mentah ke server.

Demo tanpa login masuk sebagai Owner. Role switcher adalah alat simulasi, bukan pemberian hak akses produk produksi. Label tetap: **Demo interaktif · Data fiktif**. Informasi bahwa form akhir mengirim permintaan sungguhan harus jelas.

## 4. Konfigurasi operasional lembaga contoh

Lembaga fiktif: **Lentera English Studio**, satu cabang, 3 program, kelas kelompok dan privat, peserta anak/remaja/dewasa. Semua program contoh memakai paket sesi agar alur awal fokus.

| Aturan | Konfigurasi demo | Hasil/penjaga |
|---|---|---|
| Paket | 8 sesi, harga snapshot sesuai kelas | Saldo hanya SUM ledger; metadata 8 tidak dijumlahkan lagi |
| Aktivasi | Pembayaran lunas yang dikonfirmasi admin | Grant +8 tepat sekali; partial belum grant |
| Masa berlaku | 60 × 24 jam sejak aktivasi, interval valid `[from, until)` | Tidak bertambah karena pause; tanggal akhir terlihat |
| Kursi pending | Hold 24 jam saat pendaftaran dikonfirmasi | Aktif + hold belum kedaluwarsa tidak melebihi kapasitas; renewal kelas sama tidak membuat hold kursi baru |
| Hadir/terlambat | Consume 1 saat sesi selesai | Tidak mendebit ketika baru menandai absensi |
| Absen kelompok | Peserta eligible dengan kursi terpesan consume 1 ketika kelas terlaksana | Alasan ditampilkan; tidak berlaku untuk peserta pending/tidak eligible |
| Privat, batal tepat waktu | ≥24 jam sebelum mulai: consume 0 | Alasan dan timestamp tercatat |
| Privat, batal terlambat/no-show | <24 jam: consume 1 sesuai policy | Tidak mendebit dua kali melalui cancel dan completion; event policy tunggal |
| Tutor/lembaga membatalkan | Consume 0 | Sesi diganti/dibatalkan dengan riwayat |
| Jadwal ulang | Admin, alasan wajib, sesi pengganti tertaut | Cek interval tutor/ruang; tidak memindahkan seluruh kelas untuk satu peserta |
| Bentrok waktu | `max(startA,startB) < min(endA,endB)` | Jam bersebelahan boleh, overlap sebagian ditolak |
| Paket kedaluwarsa | Blok booking dan penggunaan di luar validitas | Sesi lama di luar validitas masuk tinjauan admin; tidak auto-perpanjang |
| Banyak paket | Paket eligible dengan expiry paling awal dipakai dahulu | Tidak mencampur hak antar-enrollment; renewal tidak menimpa saldo lama |
| Publikasi progres | Tutor draft/submit → Admin review/publish | Wali/peserta hanya melihat versi published |
| Alert | Sisa ≤2 sesi atau expiry ≤7 hari; 2 absen beruntun; invoice overdue | Dedupe per subjek/rule/generation; tidak membuat order otomatis |
| Selesai program | Tandai completed dengan alasan | Bukan churn otomatis; histori dan hak valid tersisa tetap dijelaskan |
| Koreksi transaksi | Tidak menghapus payment, ledger, atau assessment published | V1 menampilkan riwayat; reversal/refund lanjutan diberi status di luar skenario aktif |

Pemetaan B-DEC: 01 pilih lunas manual; 02/03 kebijakan di tabel; 04 earliest valid expiry; 05 period packages tidak didemokan; 06 reschedule oleh admin; 07 publisher admin; 08 wali verified + izin; 09 outreach peserta hanya simulasi/manual; 10 pisahkan kas, piutang, nilai layanan, dan estimasi kontribusi.

## 5. Identitas visual dan pengalaman masuk

- Logo: `08-file_00000000f3e881f5af44e54476b7c84c.png`; figur dan wordmark asli, background putih, jangan distorsi atau memotong wordmark. Sidebar sempit memakai teks KabrTutor bila thumbnail logo tidak terbaca.
- Token C1: primary `#155EEF`, hover `#0046C7`, teal `#13B8AA`, ink `#101C3C`, canvas `#F5F8FC`, surface putih, border `#E5EAF2`, warning `#B85C00`, danger `#B42318`.
- Font system-ui atau font berlisensi yang dibundel. Grid 8px, radius 12–16px, body 14–16px. Teal tidak otomatis dipakai sebagai teks putih tanpa cek kontras.
- Desktop ≥1200, tablet 768–1199, mobile 360–767. Kalender mobile berupa agenda harian. Form dan aksi kritis tanpa scroll horizontal; target sentuh ≥44px.
- Header memuat role aktif, status simulasi, **Ikuti demo**, **Ulangi demo**, dan **Terapkan di lembaga saya**. CTA tidak menutupi tombol simpan pada mobile.
- Langsung buka dashboard Owner; panel sambutan ringan menawarkan **Ikuti demo singkat** atau **Jelajahi sendiri**. Tidak ada form wajib sebelum mencoba dan tidak ada pemilih tipe lembaga yang menjadi penghalang.
- Target alur cepat 4–6 menit adalah hipotesis desain; belum hasil pengujian.
- Navigasi bebas boleh menghentikan panduan tanpa menghapus data. Resume memeriksa state aktual. Reset menawarkan konfirmasi dan hanya mengganti namespace simulasi ke seed.

## 6. Peta halaman dan kemampuan per role

### 6.1 Layar yang harus berfungsi

| ID / route usulan | Konten dan aksi | Akses demo |
|---|---|---|
| OWN-01 `/demo/owner` | KPI + definisi, prioritas, tren kas, kapasitas; klik ke rincian terfilter | Owner |
| OWN-02 `/demo/priorities` | Antrean temuan, alasan, assignee, due, timeline, hasil | Owner/Admin; finansial sesuai role |
| SALES-01 `/demo/leads` | 12 lead, filter tahap/level/jadwal, catatan, tugas, mulai enrollment | Owner/Admin |
| ADM-01 `/demo/enroll` | Peserta/wali → kelas/paket → aturan/harga → invoice/reservasi → pembayaran | Owner/Admin |
| ADM-02 `/demo/programs` | 3 program, 6 kelas, kapasitas, tarif paket dan policy snapshot | Owner/Admin; tutor assigned read-only |
| ADM-03 `/demo/calendar` | Minggu/hari/agenda, tutor/ruang, tambah sesi, cek overlap, reschedule/cancel | Owner/Admin |
| ADM-04 `/demo/course-invoices` | Invoice, alokasi, partial/lunas/overdue, konfirmasi pembayaran simulasi | Owner/Admin |
| ADM-05 `/demo/learners/:id` | Enrollment, paket per pembelian, saldo ledger, sesi, progres, tindak lanjut | Owner/Admin; subset assigned tutor |
| TEAM-01 `/demo/team` | Assignment, jam sesi terlaksana, tarif dan estimasi honor | Owner; Admin ringkasan operasional tanpa margin |
| REPORT-01 `/demo/reports` | Kas/piutang, keterisian, nilai layanan dan estimasi kontribusi; tabel sumber | Owner; Admin subset operasional |
| TUT-01 `/demo/tutor/today` | Jadwal assigned, catatan yang belum selesai | Tutor |
| TUT-02 `/demo/tutor/sessions/:id` | Roster eligible, absensi, preview debit, completion | Tutor assigned |
| TUT-03 `/demo/tutor/progress/:id` | Rubric, draft, submit; review/publish lewat panel admin | Tutor draft/submit; Admin publish |
| PAR-01 `/demo/portal/home` | Orang tua memilih anak tertaut; dewasa konteks diri sendiri | Orang Tua/Peserta |
| PAR-02 `/demo/portal/schedule` | Jadwal, kebijakan, paket dan ledger yang relevan | Orang Tua/Peserta |
| PAR-03 `/demo/portal/progress` | Progress Passport published; kosong bila belum ada | Orang Tua/Peserta |
| PAR-04 `/demo/portal/billing` | Invoice sesuai izin payer; riwayat pembayaran simulasi | Orang Tua/Peserta yang berhak |
| SYS-01 `/demo/settings` | Ringkasan preset/policy read-only; preview langkah setup | Owner; Admin read-only terbatas |
| PRICE-01 `/biaya` | Tiga harga locked, seat/tutor, kalkulasi biaya, CTA konsultasi | Publik; Owner dari menu bantuan |
| CONV-01 `/permintaan-demo` | Form lead sungguhan, validasi, kirim | Publik |
| CONV-02 `/permintaan-demo/selesai` | Kode referensi, ringkasan minimal, salin kode, lanjut WhatsApp | Pengaju melalui konteks sukses yang aman |

Tidak ada menu dummy yang bisa diklik tetapi tidak memiliki perilaku. Pengaturan, refund, upload media, checkout SaaS, dan payout yang di luar interaksi aktif ditampilkan sebagai informasi berbatas jelas, bukan tombol palsu. Setup bukan penghalang sebelum dashboard; tidak mengirim undangan staf sungguhan.

### 6.2 Matriks aksi

| Aksi | Owner | Admin | Tutor | Orang Tua/Peserta |
|---|---|---|---|---|
| Keuangan bisnis/margin kontribusi | Lihat | Tidak, kecuali ringkasan kas/piutang operasional | Tidak | Tidak |
| Lead/enrollment/paket | Kelola | Kelola | Baca roster assigned | Lihat milik sendiri/anak |
| Jadwal | Kelola | Kelola | Baca assigned | Baca milik sendiri/anak |
| Invoice kursus/pembayaran | Kelola | Kelola | Tidak | Baca bila payer/berizin |
| Absensi/completion | Kelola | Kelola | Assigned | Baca |
| Assessment | Review/publish | Review/publish | Draft/submit assigned | Baca published saja |
| Prioritas dan tugas | Kelola | Kelola operasional | Ringkasan sesi sendiri | Tidak |
| Biaya SaaS | Lihat harga/estimasi | Tidak mengubah | Tidak | Tidak |

Pada UI tersedia empat tombol role besar: Owner, Admin, Tutor, Portal; Portal mempunyai konteks Orang Tua/Peserta. Saat mengikuti panduan, konteks peserta dipertahankan. Mode bebas portal default ke Ibu Maya (Naya dan Fajar); peserta dewasa ke Dimas. Perubahan role tidak boleh menampilkan sekilas data role sebelumnya. Ini pembatasan simulasi; otorisasi produksi tetap wajib server-side.

## 7. Dataset dan perhitungan yang dapat direproduksi

File pendamping `KabrTutor_Demo_Seed_v1.0.json` memuat record konkret dan relasi. `build_demo_dataset.py` membangun ulang seed, menghitung ringkasan, serta menjalankan pemeriksaan konsistensi. Snapshot waktu simulasi: **26 Oktober 2026 pukul 09.00 WIB**. Label waktu ini selalu terlihat dan terpisah dari timestamp pengajuan sungguhan.

### 7.1 Kelas dan harga kursus fiktif

| ID | Kelas | Aktif / kapasitas | Harga 8 sesi | Sesi historis selesai | Honor / sesi | Ruang / sesi |
|---|---|---:|---:|---:|---:|---:|
| O01 | Kids A1 Sore | 6 / 10 | Rp800.000 | 4 | Rp150.000 | Rp50.000 |
| O02 | Kids A2 | 10 / 12 | Rp880.000 | 6 | Rp170.000 | Rp50.000 |
| O03 | Teen Conversation | 10 / 12 | Rp960.000 | 3 | Rp180.000 | Rp50.000 |
| O04 | Adult Conversation | 12 / 15 | Rp1.200.000 | 2 | Rp200.000 | Rp50.000 |
| O05 | Business English Privat Dimas | 1 / 1 | Rp2.400.000 | 6 | Rp120.000 | Rp30.000 |
| O06 | Business English Privat Sinta | 1 / 1 | Rp2.400.000 | 4 | Rp120.000 | Rp30.000 |

Jumlah 40 peserta unik, 51 kapasitas enrollment. Seluruh peserta awal memiliki pembelian paket lunas; 6 invoice renewal terpisah belum lunas. Empat renewal dibayar sebagian (L007/L008/L009 masing-masing Rp440.000, L039 Rp1.200.000); dua belum dibayar (L010/L011 masing-masing Rp880.000). Pembayaran renewal partial tidak menambah entitlement baru. Ada 5 tutor, 2 admin, 1 owner, 2 ruang, 12 lead, 25 sesi historis, 12 sesi terjadwal, dan 148 konsumsi unit historis.

Naya L001 dan Fajar L002 tertaut ke Ibu Maya. Seluruh 26 peserta anak/remaja punya relasi wali verified pada seed; orang dewasa memakai identitas sendiri. Tidak ada nomor telepon/email pelanggan fiktif yang dapat dihubungi. Kontak admin sungguhan hanya pada funnel akhir, tidak ditanam sebagai kontak wali.

### 7.2 Nilai baseline yang harus cocok

Periode transaksi Oktober 2026 sampai waktu simulasi; piutang dan kapasitas adalah snapshot pada waktu simulasi, bukan flow transaksi periode.

| Metrik | Baseline | Definisi |
|---|---:|---|
| Peserta aktif unik | 40 | DISTINCT learner dengan enrollment active |
| Kapasitas aktif | 40 / 51 = 78,43% | Enrollment aktif / kapasitas offering aktif; private termasuk, dapat difilter group |
| Total invoice issued | Rp49.200.000 | 40 pembelian awal + 6 renewal |
| Penerimaan kas | Rp44.920.000 | Payment confirmed menurut received_at; bukan laba/pendapatan akrual |
| Piutang | Rp4.280.000 | Invoice issued dikurangi alokasi confirmed sampai cutoff; keenamnya overdue |
| Paket hampir habis | 11 | 10 peserta O02 dan 1 peserta O05 dengan saldo ≤2 |
| Sesi selesai | 25 | DISTINCT sesi completed; bukan jumlah absensi |
| Nilai layanan simulasi | Rp19.200.000 | Konsumsi eligible × snapshot harga paket/8 |
| Biaya langsung simulasi | Rp4.810.000 | Honor + biaya ruang per sesi completed; biaya kelas dihitung sekali |
| Estimasi margin kontribusi | Rp14.390.000 | Nilai layanan simulasi − biaya langsung; belum sewa tetap, marketing, admin, pajak dan biaya lain |

Nilai layanan berbasis unit termasuk reserved-seat/no-show sesuai policy contoh. Ini estimasi operasional demo, bukan implementasi pengakuan pendapatan akuntansi. Pembayaran paket masa depan tidak langsung masuk nilai layanan. Gunakan istilah tersebut pada tooltip dan laporan, hindari label “laba bersih”. Harga kursus tidak didiskon pada seed; bila diskon nanti ditambahkan, alokasi nilai unit wajib memakai net snapshot.

Penerimaan menurut waktu payment; nilai layanan dan biaya menurut waktu sesi; piutang menurut cutoff. Tampilkan basis tanggal setiap metrik. Grafik harus dapat direkonsiliasi ke tabel sumber; jangan membuat data tren bulan sebelumnya yang tidak ada. Gunakan grafik harian Oktober. Renewal rate tidak ditampilkan pada baseline karena jendela outcome belum matang; tampilkan “Peluang kelanjutan paket”.

### 7.3 Kontrak data inti

- IDs relasi eksplisit; enrollment menunjuk learner/offering; order menunjuk enrollment; invoice menunjuk order; allocation menunjuk invoice/payment; entitlement menunjuk order/enrollment.
- Ledger grant +8, konsumsi −1; saldo = SUM delta saja. Penggunaan selalu terkait sesi, policy dan kunci idempotency.
- Session participants membedakan roster eligible per sesi; peserta baru tidak masuk sesi historis.
- Honor dan biaya ruang melekat ke sesi, tidak dikalikan jumlah peserta.
- Invoice memiliki document state; payment state dan overdue dihitung, bukan diubah manual.
- Lead status tidak sama dengan enrollment status. Calon peserta yang sudah dibuat pending belum dihitung sebagai aktif.
- Seed includes `source_fingerprints` SHA-256 agar revisi baseline dapat ditelusuri, bukan klaim sertifikasi keaslian.

## 8. Skenario utama — isi kursi kosong sampai layanan tercatat

Tokoh: Alya Rahma, calon peserta Kids A1, wali Ibu Riska; level dan jadwal Senin/Kamis 16.00–17.00 sudah dikonfirmasi. Tutor Rani, Admin Dewi. Kelas O01 berisi 6 dari 10 peserta. Harga Rp800.000 untuk 8 sesi. Tidak memakai profil Naya untuk kasus pendaftaran baru.

| Langkah | Layar dan tindakan | State / hasil yang wajib terlihat |
|---|---|---|
| 1. Temukan peluang | Owner → Prioritas Bisnis → “4 kursi tersedia di Kids A1 Sore” | Alasan: 6/10 aktif; lead Alya cocok level/jadwal. Potensi biaya paket diberi label peluang, bukan kas pasti. |
| 2. Tugaskan | Buka tugas → pilih Admin Dewi → lihat detail | Satu tugas dengan due/outcome, tidak ada WA sungguhan terkirim. |
| 3. Tindak lanjuti | Switch Admin → pipeline → Alya → catat “Wali setuju jadwal dan paket” | Riwayat tugas; hasil agreed, lead belum enrolled sampai aktivasi. |
| 4. Daftar | Wizard peserta/wali/kelas/paket → konfirmasi | L041, E041 pending, ORD041 dan INV041 Rp800.000; satu hold kursi 24 jam. Aktif masih 40 dan O01 tetap6; available turun4→3 karena hold1. |
| 5. Pembayaran sebagian | Catat dan konfirmasi Rp300.000 | INV041 partial, sisa Rp500.000; kas Rp45.220.000, piutang total Rp4.780.000; belum grant, belum ikut sesi. |
| 6. Pelunasan | Catat/konfirmasi Rp500.000 | INV041 paid; grant ENT041 +8 tepat sekali; E041 active; hold menjadi active. Peserta41, O01 7/10; kas Rp45.720.000; piutang kembali Rp4.280.000. |
| 7. Tinjau Owner | Kembali ke ringkasan | Total kapasitas41/51 =80,39%; O01 70%; kas bertambah Rp800.000. Nilai layanan dan kontribusi belum berubah karena sesi baru belum terlaksana. |
| 8. Jalankan sesi | Klik “Simulasikan waktu ke sesi berikutnya” → 26 Okt16.00; switch Tutor → O01-F26 → mulai → tandai 7 peserta hadir → clock17.00 → konfirmasi selesai | 7 konsumsi unit, sesi selesai sekali; peserta lama sisa4→3, Alya8→7. Tidak mengonsumsi sesi sebelum tanggal aktivasi. |
| 9. Catat hasil layanan | Tutor → rubric/catatan Alya → submit → Admin review/publish | Draft tidak terlihat di portal; published muncul setelah persetujuan. |
| 10. Lihat portal | Switch Portal → Ibu Riska/Alya | Jadwal, saldo7, invoice lunas dan catatan published sesuai state; identitas wali simulasi diverifikasi pada proses enrollment. |
| 11. Tinjau hasil bisnis | Owner → hasil perjalanan | Sesi baru: nilai layanan7×Rp100.000 =Rp700.000; biaya Rp200.000; kontribusi Rp500.000. Total nilai layananRp19.900.000, biayaRp5.010.000, kontribusiRp14.890.000, sesi selesai26. |
| 12. Konversi | Ringkasan tindakan → “Terapkan di lembaga saya” | Form sungguhan; tidak mengirim data Alya sebagai data lembaga pengunjung. |

Perubahan waktu selalu memerlukan aksi pengunjung dan label **Waktu simulasi**. Skenario renewal tidak dipaksakan untuk Alya yang baru memiliki 7 sesi; gunakan peserta seed yang memang tersisa 2 sesi. Ringkasan akhir didasarkan pada action log yang benar-benar dilakukan, bukan checklist sukses hardcoded.

## 9. Skenario tambahan yang dapat dicoba bebas

| ID | Entry dan urutan | Bukti hasil |
|---|---|---|
| SC02 Tagihan tertunda | Admin → RINV001 L007 → sisaRp440.000 → konfirmasi pelunasan | Kas +Rp440.000; piutang −Rp440.000; paket renewal +8 sekali. Paket lama sisa2 tetap terpisah dan dipakai dahulu; alert ditinjau ulang, bukan menghapus histori. |
| SC03 Konflik jadwal | Admin → pindahkan O01-F26 ke27 Okt15.30–16.30 | Ditolak: Rani sedang O06-F27 pada15.00–16.00 meski ruang berbeda. Alternatif27 Okt16.00–17.00 diperiksa ulang sebelum simpan; sesi lama rescheduled, pengganti tertaut. |
| SC04 Pembatalan tutor | Dari seed bersih, O06-F27 → batalkan karena tutor berhalangan → pilih pengganti bebas | Tidak mengurangi paket Sinta dan tidak membuat biaya sesi completed. Setelah pengganti selesai baru memposting sesuai policy. |
| SC05 Perhatian kehadiran | Prioritas → Sinta L040 dua no-show → catat konfirmasi kebutuhan jadwal | Status acknowledged dengan outcome; tidak otomatis “berhasil dipertahankan”. Bukti berikutnya tetap dipantau. |
| SC06 Kualitas layanan | Tutor simpan draft Fajar → Portal Ibu Maya tidak melihat → Admin publish → portal melihat | Lifecycle publikasi konsisten; ganti ke Naya menampilkan data Naya. |
| SC07 Selesai dengan berhasil | Owner/Admin tinjau paket menjelang akhir → tandai rencana selesai program | Kelanjutan dapat “lanjut / pertimbangkan / selesai sesuai tujuan”; completed tidak ditandai churn otomatis. |
| SC08 Biaya platform | Lihat tiga plan → pilih Growth +10 seat | Estimasi bulananRp199.000, kapasitas85; bukan invoice kursus atau checkout nyata. |

Panduan skenario menyarankan reset bila asumsi awal sudah berubah; tidak diam-diam mereset progres ketika pengunjung sedang mencoba. B01 onboarding cukup preview ringkasan konfigurasi; B02–B08 tercakup jalur utama dan skenario ini.

## 10. Harga KabrTutor yang sudah locked pada source

Harga ini adalah biaya software untuk lembaga; seluruh harga paket Bahasa Inggris pada bagian7 adalah harga kursus fiktif lembaga ke peserta.

| Plan | Bulanan | Tahunan, 12 bulan layanan | Seat termasuk | Batas tutor |
|---|---:|---:|---:|---:|
| Starter | Rp79.000 | Rp790.000 | 25 | 5 |
| Growth | Rp179.000 | Rp1.790.000 | 75 | 20 |
| Business | Rp399.000 | Rp3.990.000 | 200 | 50 |

- Tambahan seat Rp2.000/seat/bulan, dibeli kelipatan5 (Rp10.000/blok/bulan). Tidak auto-charge.
- Tahunan bayar10 untuk12 bulan; bukan diskon20%. Trial14 hari. Setup mandiri gratis; bantuan onboarding opsional mulaiRp499.000 sekali bayar.
- Unique active learner dihitung satu seat walau ikut beberapa program; lead/alumni tidak dihitung. Seed memakai40/75 Growth, sesudah Alya41/75; ini berbeda dari kapasitas kelas40/51.
- Harga dasar belum termasuk pajak/biaya pemrosesan jika berlaku; jangan mengarang tarifnya.
- Kesiapan fitur tetap mengikuti delivery. Tidak membuat matriks fitur per plan yang tidak ada di source. Trial30 seat, grace7 hari, retensi90 hari, proration tahunan dan SLA onboarding masih proposal source, bukan janji publik.
- Harga diletakkan sebagai tautan sekunder dan panel setelah manfaat terlihat. CTA utama tetap permintaan penerapan. Tidak ada plan switcher yang mematikan alur sebelum owner memahami manfaat.

## 11. Kontrak funnel permintaan sungguhan untuk build berikutnya

Ini spesifikasi batas dan perilaku; belum implementasi backend atau pengiriman email.

1. CTA **Terapkan di lembaga saya** membuka form tanpa kewajiban menuntaskan seluruh demo.
2. Field wajib: nama lembaga, jenis lembaga, nama PIC, WhatsApp, rentang peserta aktif, kebutuhan utama. Field opsional: email pengunjung, catatan, referral. Referensi referral hanya disimpan jika diisi/valid; tidak mengarang komisi.
3. Teks pendek: **Dengan mengirim, Anda meminta admin KabrTutor menghubungi Anda mengenai kebutuhan lembaga.** Pengunjung tahu permintaan dikirim sungguhan; email ke admin berlangsung tanpa klik tambahan atau pop-up aplikasi email.
4. Server memvalidasi, menormalisasi nomor, membatasi abuse, lalu menyimpan permintaan dan job email dalam satu transaksi. Gunakan idempotency token per pengajuan. Kode contoh `KBT-261026-XXXXXX`, random suffix dengan unique constraint; contoh bukan kode yang sudah terbit. Kode referensi bukan nomor antrean/SLA dan bukan kredensial untuk membaca data pribadi.
5. Setelah commit sukses, server mengembalikan kode dan konteks sukses minimal. Halaman menampilkan **Permintaan berhasil diterima**, kode, ringkasan, salin kode, dan **Lanjutkan ke WhatsApp Admin**. Tidak mengklaim email sudah terkirim hanya karena record tersimpan.
6. Worker/outbox mengirim email otomatis ke **admin3@desainindongmas.my.id** melalui konfigurasi server (dapat memakai Zoho seperti Arah Jamaah). Rahasia di environment server; sender yang diizinkan dan transport diverifikasi saat build. Tidak bergantung klik WhatsApp, browser tetap terbuka, atau perangkat pengunjung.
7. Email subjek `[KabrTutor] Permintaan demo {reference} — {nama lembaga}`. Isi: kode, waktu aktual WIB, lembaga/jenis, PIC, WA, email opsional, rentang peserta, kebutuhan, catatan/referral bila ada, serta ringkasan modul demo yang dicoba jika diizinkan. Tidak mengirim data kursus fiktif, isi localStorage, atau token pribadi.
8. Tombol WhatsApp membuka `https://wa.me/6285952839393` dengan pesan URL-encoded: “Halo Admin KabrTutor, saya {PIC} dari {lembaga}. Saya sudah mengirim permintaan dengan kode {reference}. Kebutuhan utama kami: {kebutuhan}. Mohon dibantu langkah berikutnya.” Pengunjung tetap menekan kirim di WhatsApp.
9. Email status `QUEUED/SENDING/SENT/FAILED` dan attempt/timestamp terpisah dari status lead. SENT berarti diterima transport/provider, bukan bukti inbox sudah dibaca. Retry bounded dengan backoff dan kunci job unik; hindari double-job. SMTP tidak menjamin exactly-once pada timeout setelah penerimaan, sehingga gunakan Message-ID stabil dan catat hasil tak pasti.
10. Gangguan SMTP tidak menghapus lead. Gagal simpan tidak menerbitkan kode sukses. Retry submit dengan token sama menghasilkan record dan kode yang sama; pergantian payload token sama ditolak. Tombol WhatsApp tetap tersedia setelah lead tersimpan walau email tertunda.

Model data minimum: `demo_requests`, `demo_request_email_outbox`, `demo_request_email_attempts`; terpisah dari seed dan course commerce. Timestamp server aktual, bukan demo_clock. Akses daftar lead hanya admin berizin; public reference lookup tidak boleh membocorkan PIC/kontak. Form tidak menyimpan kontak di URL, analytics, atau localStorage demo. Reset simulasi tidak menyentuh tabel permintaan.

Operasional demo tidak memerlukan backend tenant penuh. Funnel permintaan sungguhan wajib backend persisten dan worker/job yang dapat berjalan di hosting terpilih. Pemilihan hosting/database dan konfigurasi rahasia diselesaikan saat build; tidak ada kebutuhan meminta password lewat chat.

## 12. State, analytics dan acceptance build

### 12.1 State dan kualitas interaksi

Semua layar aktif mempunyai loading, empty, validation error dan recovery yang relevan. Pembayaran/completion disable saat diproses dan idempotent pada state engine. Salah nilai atau konflik ditolak sebelum mutasi; data yang sudah diketik dipertahankan. Jika localStorage diblokir, tampilkan mode memori; jika schema seed berubah, migrasi sederhana atau reset dengan pemberitahuan. Simulasi tidak mengklaim keamanan produksi.

Tidak ada confetti untuk transaksi bisnis. Toast singkat menyebut hasil dan dampak; pending tidak berwarna seperti sukses. Charts memiliki ringkasan/tabel, dialogs keyboard-accessible, focus kembali ke pemicu, prefers-reduced-motion dihormati. Validasi kontras AA, tidak mengandalkan warna untuk status. Loading/error SMTP tidak ditampilkan sebagai kegagalan pembayaran kursus.

### 12.2 Event pengukuran

`demo_started`, `guided_started`, `priority_opened`, `task_assigned`, `lead_reviewed`, `enrollment_created`, `payment_partial_recorded`, `enrollment_activated`, `session_completed`, `progress_published`, `guided_completed`, `request_form_opened`, `request_submitted`, `whatsapp_clicked`.

Event demo dikirim tanpa PII, dengan anon session dan scenario/step ID bila analytics digunakan. Request submitted dicatat server setelah commit; whatsapp_clicked hanya mengukur klik, bukan pesan terkirim. Jangan menghitung simulasi pembayaran sebagai pendapatan KabrTutor. Conversion = permintaan sungguhan valid / unique visitor yang memulai demo, periode dan dedupe jelas. Pisahkan spam/test/internal, lead valid, lead qualified, dan pelanggan berbayar; tidak menetapkan target conversion sebagai fakta sebelum data ada.

### 12.3 Checklist penerimaan saat website dibangun

| ID | Pemeriksaan | Hasil yang harus terbukti |
|---|---|---|
| QA01 | Baseline seed | Semua angka bagian7 cocok persis dengan sumber record |
| QA02 | Jalur utama payment | Rp300.000 partial, Rp500.000 final, saldo/aktif/kapasitas sesuai bagian8 |
| QA03 | Retry payment/completion | Tidak ada double-grant, double-cash atau double-consume |
| QA04 | Keterisian | Pending hold terpisah, hold expiry melepas kapasitas, aktif tidak melebihi cap |
| QA05 | Bentrok interval | Overlap15.30 ditolak, slot bersebelahan16.00 diizinkan jika bebas |
| QA06 | Pembatalan/reschedule | Riwayat tertaut, tidak mendebit saat tutor absen, tidak mengubah completed diam-diam |
| QA07 | Progres/portal | Draft tak terlihat; published muncul pada anak yang sesuai |
| QA08 | Keuangan | Cash berubah saat pembayaran; nilai layanan/biaya saat completion; biaya kelompok sekali per sesi |
| QA09 | Reload/reset/role | State demo konsisten, reset tidak menyentuh lead server |
| QA10 | Form sungguhan | Validasi, commit, kode unik; double-submit token sama satu lead |
| QA11 | Email sungguhan | Job muncul tanpa klik WA; transport dan inbox admin diuji terpisah menggunakan pengajuan uji berlabel saat implementasi diotorisasi |
| QA12 | Kegagalan email/server | SMTP gagal tidak menghapus lead; DB gagal tidak menampilkan sukses; retry tidak membuat kode baru |
| QA13 | WhatsApp | Nomor6285952839393, pesan/kode benar; membuka WhatsApp bukan auto-send |
| QA14 | Mobile/accessibility | 360/390/768/1440px, form/tombol berfungsi, keyboard, kontras dan tidak terpotong |
| QA15 | Batas data | Payload demo tidak tercampur permintaan; kontak dan SMTP tidak bocor ke URL/analytics/client |

## 13. Handoff dan batas pekerjaan saat ini

Langkah1: tujuh dokumen dan logo diperiksa; rekonsiliasi dan pengecualian ditulis. Langkah2: halaman, aksi, role, dan batas akses ditentukan. Langkah3: seed konkret beserta script pembangun dan laporan validasi disertakan. Langkah4: skenario utama, tambahan, expected changes dan acceptance dirinci.

Yang tersedia sekarang adalah spesifikasi dan dataset. Belum ada aplikasi yang dibangun/deploy, backend lead, kredensial email, atau bukti email terkirim. Pemeriksaan dataset adalah validasi konsistensi fixture, bukan tes produk, load test, bukti otorisasi server atau riset pengguna.

Urutan implementasi berikutnya: app shell/seed/state engine → dashboard/prioritas/pipeline → enrollment/payment → calendar/tutor/portal → laporan/biaya → funnel backend/email → acceptance dan publikasi. Domain demo, stack hosting/database serta sender SMTP belum ditetapkan di percakapan; pilih sesuai proyek build, dan verifikasi konfigurasi sebelum go-live. Tidak menjadi hambatan menyelesaikan spesifikasi langkah1–4.

### Isi paket pendamping

- `KabrTutor_Blueprint_Demo_v1.0.md`: dokumen ini.
- `KabrTutor_Demo_Seed_v1.0.json`: dataset konkret dan expected baseline.
- `build_demo_dataset.py`: pembangun seed yang deterministik dan pemeriksaan konsistensi.
- `dataset_validation.json`: hasil pemeriksaan saat dokumen dibuat.
- `README.md`: cara memakai dan membangun ulang dataset.

