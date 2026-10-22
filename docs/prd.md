# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# SIT — Self-Hosted Multi-Page Link-in-Bio Platform

```yaml
title: "SIT — Multi-Page Link-in-Bio Platform"
doc_id: "PRD-SIT-001"
version: "1.0.0"
status: "Approved Requirements — Proposed Specification"
owner: "Mas Akmal"
created_at: "2026-10-22"
last_updated: "2026-10-22"
target_release: "2026-11-05"
product_type: "Internal Multi-User Web Application"
platform: "Web — Mobile First"
deployment: "Vercel + Supabase"
```

## 1. Ringkasan Eksekutif

### 1.1 Deskripsi Produk

SIT adalah platform web link-in-bio yang memungkinkan pengguna internal membuat dan mengelola banyak halaman publik dari satu akun.

Setiap halaman memiliki URL unik, profil, koleksi tautan, konfigurasi visual, statistik penggunaan, dan QR Code independen.

SIT dikembangkan untuk menggantikan ketergantungan pada Linktree, mengurangi biaya langganan, memberikan kebebasan kustomisasi, serta menunjukkan kemampuan engineering tim IT perusahaan.

SIT menggunakan infrastruktur cloud yang dikelola secara mandiri melalui akun Vercel dan Supabase.

### 1.2 Nilai Utama Produk

- **Multi-page:** Satu akun dapat mengelola banyak halaman.
- **Custom slug:** Setiap halaman memiliki alamat yang dipilih pemiliknya.
- **Independent branding:** Masing-masing halaman mempunyai identitas visual tersendiri.
- **Centralized management:** Admin mengatur pengguna dan mengawasi seluruh halaman.
- **Public accessibility:** Pengunjung mengakses halaman tanpa login.
- **Ownership:** Data, aplikasi, dan konfigurasi berada di bawah pengelolaan internal.
- **Mobile-first:** Pengalaman penggunaan diutamakan pada perangkat mobile.

### 1.3 Contoh Penggunaan

Seorang pengguna dengan akun `akmal@perusahaan.com` dapat membuat:

| Halaman    | URL publik             | Konten                                        |
| ---------- | ---------------------- | --------------------------------------------- |
| Layanan TI | `domain.com/layananti` | Service desk, permintaan bantuan, dokumentasi |
| Karya TI   | `domain.com/karyati`   | Portofolio dan produk IT                      |
| Riset TI   | `domain.com/risetti`   | Proyek penelitian dan inovasi                 |

Ketiga halaman memiliki pengaturan masing-masing dan dapat dikelola dari dashboard yang sama.

`domain.com` merupakan placeholder domain utama yang sudah dimiliki dan akan dikonfigurasi.

### 1.4 Target Rilis

- Durasi pengembangan MVP: 14 hari kalender.
- Awal rencana: 22 Oktober 2026.
- Target rilis pilot: 5 November 2026.
- Pengguna pilot: 2–3 akun.
- Kapasitas pengguna awal: 2–10 akun.

Tanggal merupakan rencana apabila pekerjaan dimulai pada 22 Oktober 2026.

## 2. Latar Belakang & Masalah

### 2.1 Kondisi Saat Ini

Pengguna mengandalkan Linktree untuk mengelola kumpulan tautan.

Permasalahan utama:

1. Biaya langganan berulang.
2. Keterbatasan kustomisasi visual.
3. Ketergantungan pada platform eksternal.
4. Keterbatasan kendali terhadap aplikasi dan data.
5. Kebutuhan membangun produk internal yang menunjukkan kemampuan tim IT.

### 2.2 Problem Statement

Tim membutuhkan platform link-in-bio yang fleksibel, dikelola secara internal, dan memungkinkan seorang pengguna membuat berbagai halaman dengan identitas dan tujuan berbeda tanpa harus menggunakan beberapa akun atau layanan pihak ketiga.

### 2.3 Dampak Apabila Tidak Dibangun

- Ketergantungan pada layanan berlangganan berlanjut.
- Kustomisasi tetap mengikuti batasan penyedia.
- Pengelolaan berbagai halaman kurang terintegrasi.
- Peluang mengembangkan kompetensi dan portofolio internal tidak dimanfaatkan.

### 2.4 Baseline

Jumlah akun Linktree aktif, biaya berlangganan, dan statistik penggunaan saat ini belum diukur.

**Status: [PERLU KONFIRMASI]**

Baseline harus dikumpulkan sebelum klaim penghematan biaya atau keberhasilan migrasi dibuat.

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan Produk

| ID   | Tujuan                | Metrik                     | Usulan target                                    | Metode pengukuran                                  |
| ---- | --------------------- | -------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| G-01 | Menggantikan Linktree | Tingkat migrasi akun pilot | 100% dalam 30 hari setelah pilot                 | Akun pilot yang selesai migrasi / total akun pilot |
| G-02 | Meningkatkan adopsi   | Akun aktif                 | 5 akun dalam 30 hari                             | User unik yang login dan mengelola halaman         |
| G-03 | Mendukung multi-page  | Halaman per akun           | Minimal 3 halaman pada satu akun uji             | Pengujian fungsi pembuatan halaman                 |
| G-04 | Menjaga ketersediaan  | Uptime halaman publik      | ≥99,5% per bulan                                 | Monitoring HTTP publik dari luar sistem            |
| G-05 | Menjaga performa      | LCP mobile                 | ≤2,5 detik pada persentil ke-75                  | Lighthouse dan data performa aktual bila tersedia  |
| G-06 | Mengurangi biaya      | Penghematan bersih         | Positif setelah biaya operasional diperhitungkan | Biaya Linktree sebelumnya dikurangi biaya SIT      |
| G-07 | Menyelesaikan MVP     | Durasi pengerjaan          | 14 hari kalender                                 | Selisih tanggal kickoff dan rilis pilot            |

Semua angka di atas adalah **target rekomendasi awal** dan memerlukan konfirmasi pemilik produk.

### 3.2 Non-Tujuan

Untuk MVP SIT tidak ditujukan sebagai:

- Platform pendaftaran publik atau SaaS komersial.
- Marketplace atau toko online.
- Sistem pembayaran dan transaksi.
- Website builder bebas berbasis komponen tanpa batas.
- Aplikasi mobile native.
- Sistem integrasi API publik untuk pihak ketiga.
- Platform email marketing.
- Sistem kolaborasi edit bersama secara real-time.

Custom domain eksternal per halaman tidak termasuk rilis awal.

## 4. Pengguna & Skenario

### 4.1 Persona

**Persona A — Administrator**

Bertanggung jawab membuat akun, menentukan role, mengaktifkan atau menonaktifkan akun, dan mengelola seluruh halaman.

Kebutuhan: visibilitas dan kendali atas pengguna serta halaman SIT.

**Persona B — Pemilik Halaman**

Pengguna internal, anggota tim, atau penanggung jawab unit kerja yang membuat beberapa halaman dari satu akun.

Kebutuhan: membuat, mengubah, dan menerbitkan halaman tanpa membutuhkan developer untuk setiap perubahan.

**Persona C — Pengunjung Publik**

Masyarakat, karyawan, pelanggan, atau pengunjung media sosial yang membuka halaman SIT.

Kebutuhan: mendapatkan akses ke tautan yang relevan secara cepat tanpa login.

### 4.2 User Stories

| ID    | Aktor      | User story                                                                              |
| ----- | ---------- | --------------------------------------------------------------------------------------- |
| US-01 | Admin      | Saya ingin mengelola akun agar akses SIT hanya diberikan kepada pengguna internal.      |
| US-02 | User       | Saya ingin membuat banyak halaman dari satu akun untuk kebutuhan yang berbeda.          |
| US-03 | User       | Saya ingin menentukan slug sendiri agar URL halaman sesuai dengan tujuan penggunaannya. |
| US-04 | User       | Saya ingin mengatur profil dan link secara independen untuk setiap halaman.             |
| US-05 | User       | Saya ingin mengubah warna, font, dan template agar tampilan sesuai branding.            |
| US-06 | User       | Saya ingin mengatur posisi link menggunakan drag & drop.                                |
| US-07 | User       | Saya ingin melihat jumlah kunjungan dan klik per halaman.                               |
| US-08 | User       | Saya ingin membagikan halaman menggunakan QR Code.                                      |
| US-09 | Pengunjung | Saya ingin mengakses halaman publik melalui ponsel tanpa login.                         |
| US-10 | Admin      | Saya ingin menonaktifkan halaman bermasalah tanpa menghapus datanya.                    |

### 4.3 Hak Akses

| Kemampuan                   | Admin | User                | Publik |
| --------------------------- | ----- | ------------------- | ------ |
| Login ke dashboard          | Ya    | Ya                  | Tidak  |
| Membuat akun pengguna       | Ya    | Tidak               | Tidak  |
| Mengelola akun              | Semua | Profil akun sendiri | Tidak  |
| Membuat halaman             | Ya    | Ya                  | Tidak  |
| Mengedit halaman            | Semua | Milik sendiri       | Tidak  |
| Mengelola link              | Semua | Milik sendiri       | Tidak  |
| Mengatur tampilan           | Semua | Milik sendiri       | Tidak  |
| Melihat statistik           | Semua | Milik sendiri       | Tidak  |
| Mengakses halaman published | Ya    | Ya                  | Ya     |
| Menonaktifkan akun          | Ya    | Tidak               | Tidak  |

## 5. Persyaratan Fungsional

Prioritas:

- **P0:** Wajib untuk rilis MVP.
- **P1:** Pendukung; dapat dirilis sesudah fitur inti stabil.
- **P2:** Fase berikutnya.

Setiap requirement berikut merupakan satu ketentuan yang memiliki ID unik.

### 5.1 Autentikasi dan Pengguna

**FR-001 | P0 | US-01 | G-02**

Sistem harus menyediakan autentikasi email dan password menggunakan Supabase Auth.

Acceptance criteria:

- Given akun aktif, when kredensial valid dimasukkan, then user diarahkan ke dashboard.
- Given kredensial salah, when login dicoba, then sistem menolak akses tanpa mengungkap keberadaan email.

Edge case: akun terblokir, sesi kedaluwarsa, dan email belum diverifikasi sesuai konfigurasi autentikasi.

**FR-002 | P0 | US-01 | G-02**

Admin harus dapat membuat dan menonaktifkan akun pengguna internal.

Acceptance criteria:

- Given admin terautentikasi, when akun baru dibuat, then user terdaftar dengan role yang ditetapkan.
- Given akun dinonaktifkan, when user mencoba mengakses endpoint terlindungi, then akses ditolak.

Edge case: email duplikat, akun belum aktif, dan sesi aktif setelah penonaktifan.

**FR-003 | P0 | US-01 | G-02**

Sistem harus menerapkan role `admin` dan `user` pada seluruh operasi terlindungi.

Acceptance criteria:

- Given user biasa, when endpoint admin dipanggil, then server mengembalikan respons `403 Forbidden`.

Edge case: manipulasi role pada request dan akses langsung ke endpoint.

**FR-004 | P0 | US-01 | G-02**

Sistem harus membatasi operasi perubahan data berdasarkan identitas pemilik dan hak akses admin.

Acceptance criteria:

- Given user A, when mencoba mengubah halaman user B, then operasi ditolak tanpa perubahan data.

Edge case: ID halaman dimanipulasi dan permintaan dikirim langsung tanpa dashboard.

### 5.2 Manajemen Multi-Page

**FR-005 | P0 | US-02 | G-03**

Setiap akun aktif harus dapat membuat lebih dari satu halaman tanpa batas jumlah halaman yang ditetapkan oleh aturan bisnis MVP.

Acceptance criteria:

- Given akun user aktif, when user membuat tiga halaman berbeda, then seluruh halaman tersimpan dengan pemilik yang sama.

Edge case: user membuat banyak halaman secara berurutan, terjadi gangguan jaringan, atau nama halaman sama.

Catatan: kontrol rate limit dan kapasitas infrastruktur tetap berlaku.

**FR-006 | P0 | US-03 | G-03**

Setiap halaman harus memiliki slug unik secara global yang dipilih pengguna secara independen dari nama akun.

Acceptance criteria:

- Given slug `layananti` belum dipakai, when user menyimpan halaman, then halaman tersedia melalui `/layananti`.
- Given slug `layananti` sudah dipakai, when user lain mencoba menggunakannya, then sistem menolak penyimpanan.

Edge case: perbedaan huruf besar/kecil dan pembuatan slug bersamaan.

**FR-007 | P0 | US-03 | G-03**

Sistem harus memvalidasi slug menggunakan 3–40 karakter huruf kecil ASCII, angka, atau tanda hubung dengan karakter awal dan akhir berupa huruf atau angka.

Acceptance criteria:

- Given `Layanan TI`, when divalidasi, then sistem menawarkan `layanan-ti`.
- Given `admin`, when divalidasi, then sistem menolak slug yang dilindungi.

Edge case: slug kosong, karakter Unicode, spasi, tanda hubung berurutan, dan URL dengan karakter khusus.

**FR-008 | P0 | US-02 | G-03**

Sistem harus menyediakan daftar halaman milik pengguna beserta status dan aksi pengelolaannya.

Acceptance criteria:

- Given user memiliki tiga halaman, when dashboard dibuka, then ketiganya muncul dalam daftar.

Edge case: akun belum mempunyai halaman.

**FR-009 | P0 | US-02 | G-03**

Pemilik halaman harus dapat mengubah status halaman menjadi `draft`, `published`, atau `archived`.

Acceptance criteria:

- Given halaman `draft`, when URL publik dibuka, then sistem mengembalikan `404`.
- Given halaman `published`, when URL dibuka, then halaman ditampilkan.
- Given halaman `archived`, when URL dibuka, then konten tidak ditampilkan.

Edge case: publikasi halaman tanpa judul, perubahan status bersamaan, dan cache lama.

**FR-010 | P1 | US-02 | G-03**

Pemilik halaman harus dapat mengubah slug dengan mempertahankan identitas internal halaman.

Acceptance criteria:

- Given halaman dengan slug lama, when slug diperbarui, then URL baru menampilkan halaman yang sama.

Edge case: konflik slug dan QR Code lama yang tidak lagi valid.

Keputusan MVP yang disarankan: URL lama tidak otomatis dialihkan dan pengguna menerima peringatan sebelum menyimpan slug baru.

**FR-011 | P1 | US-02 | G-03**

Pemilik halaman harus dapat mengarsipkan dan menghapus halaman melalui langkah konfirmasi.

Acceptance criteria:

- Given halaman aktif, when pengarsipan dikonfirmasi, then halaman tidak dapat diakses publik.
- Given halaman dihapus, when proses penghapusan selesai, then halaman dan data turunannya diproses sesuai kebijakan retensi.

Edge case: penghapusan tidak sengaja dan hubungan data analytics.

### 5.3 Profil dan Link

**FR-012 | P0 | US-04 | G-03**

Setiap halaman harus mempunyai konfigurasi profil independen berupa judul, deskripsi, avatar, dan tautan media sosial.

Acceptance criteria:

- Given user memiliki dua halaman, when avatar halaman pertama diubah, then avatar halaman kedua tidak berubah.

Edge case: avatar kosong dan unggahan gambar gagal.

**FR-013 | P0 | US-04 | G-03**

Pemilik halaman harus dapat menambah, mengubah, menonaktifkan, dan menghapus link pada halaman miliknya.

Acceptance criteria:

- Given halaman tersedia, when URL link valid disimpan, then link muncul pada editor.
- Given link dinonaktifkan, when halaman publik dibuka, then link tersebut tidak ditampilkan.

Edge case: URL tidak valid, judul kosong, dan link duplikat.

**FR-014 | P0 | US-06 | G-03**

Sistem harus mendukung pengurutan link melalui drag & drop dan alternatif kontrol keyboard.

Acceptance criteria:

- Given terdapat tiga link, when urutan diubah, then urutan baru tersimpan dan ditampilkan pada halaman publik.

Edge case: dua operasi reorder bersamaan dan penggunaan tanpa perangkat pointer.

**FR-015 | P0 | US-09 | G-05**

Halaman publik harus menampilkan hanya link aktif yang diurutkan berdasarkan nilai posisi tersimpan.

Acceptance criteria:

- Given halaman memiliki lima link dan satu nonaktif, when pengunjung membuka halaman, then empat link aktif ditampilkan sesuai urutan.

Edge case: halaman tanpa link.

**FR-016 | P1 | US-04 | G-03**

Editor harus menyediakan pratinjau halaman yang memperlihatkan hasil perubahan sebelum publikasi.

Acceptance criteria:

- Given perubahan warna dan judul belum disimpan, when editor menampilkan preview, then perubahan terlihat tanpa mengubah halaman publik.

Edge case: refresh browser dan perubahan belum tersimpan.

### 5.4 Template dan Kustomisasi

**FR-017 | P0 | US-05 | G-03**

Sistem harus menyediakan minimal tiga template visual siap pakai untuk setiap halaman.

Acceptance criteria:

- Given halaman baru, when user memilih sebuah template, then konfigurasi desain awal diterapkan pada halaman tersebut.

Edge case: perpindahan template setelah penyesuaian manual.

**FR-018 | P0 | US-05 | G-03**

Pemilik halaman harus dapat menyesuaikan warna, background, font, radius tombol, dan gaya link tanpa menulis kode.

Acceptance criteria:

- Given user membuka editor desain, when konfigurasi diubah dan disimpan, then halaman publik menggunakan konfigurasi baru.

Edge case: kombinasi warna tidak terbaca dan nilai konfigurasi tidak valid.

**FR-019 | P1 | US-05 | G-05**

Sistem sebaiknya menyediakan animasi transisi morph dan microinteraction yang dapat dinonaktifkan oleh preferensi pengurangan gerakan pengguna.

Acceptance criteria:

- Given perangkat mengaktifkan `prefers-reduced-motion`, when halaman dibuka, then animasi dekoratif dikurangi atau dinonaktifkan.

Edge case: browser tidak mendukung fitur animasi tertentu.

**FR-020 | P0 | US-09 | G-05**

Tampilan halaman publik harus responsif pada lebar viewport 320–1920 piksel tanpa horizontal overflow.

Acceptance criteria:

- Given viewport 320, 390, 768, dan 1440 piksel, when halaman ditampilkan, then konten utama dapat dibaca tanpa scroll horizontal.

Edge case: judul sangat panjang dan URL panjang.

### 5.5 QR Code

**FR-021 | P0 | US-08 | G-03**

Sistem harus menghasilkan QR Code unik untuk URL publik setiap halaman.

Acceptance criteria:

- Given halaman memiliki slug `risetti`, when fitur QR dibuka, then QR mengarah ke `https://domain.com/risetti`.

Edge case: perubahan slug dan halaman belum dipublikasikan.

**FR-022 | P1 | US-08 | G-03**

Pemilik halaman sebaiknya dapat mengunduh QR Code dalam format PNG dan SVG.

Acceptance criteria:

- Given QR Code tersedia, when pengguna memilih format unduhan, then file sesuai format dihasilkan.

Edge case: URL belum valid.

### 5.6 Analytics

**FR-023 | P0 | US-07 | G-02**

Sistem harus mencatat event kunjungan halaman publik beserta ID halaman, jenis event, dan waktu kejadian.

Acceptance criteria:

- Given halaman `published`, when halaman berhasil dibuka, then event `page_view` dicatat pada halaman tersebut.

Edge case: refresh berulang dan proses pencatatan gagal.

**FR-024 | P0 | US-07 | G-02**

Sistem harus mencatat event klik link melalui endpoint pelacakan milik SIT sebelum mengarahkan pengunjung ke URL tujuan.

Acceptance criteria:

- Given pengunjung menekan link aktif, when event klik diproses, then klik tercatat dan pengunjung diarahkan ke URL yang tervalidasi.

Edge case: endpoint analytics gagal dan link tujuan tidak tersedia.

**FR-025 | P0 | US-07 | G-02**

Pemilik halaman harus dapat melihat total page views dan klik link per halaman untuk periode 7 dan 30 hari terakhir.

Acceptance criteria:

- Given user memiliki tiga halaman, when statistik halaman kedua dibuka, then metrik yang ditampilkan hanya berasal dari halaman kedua.

Edge case: belum ada event dan perbedaan zona waktu.

**FR-026 | P1 | US-07 | G-02**

Dashboard analitik sebaiknya menampilkan tren harian serta peringkat link berdasarkan jumlah klik.

Acceptance criteria:

- Given tersedia event selama tujuh hari, when rentang tujuh hari dipilih, then grafik harian dan jumlah klik per link ditampilkan.

Edge case: periode tanpa data.

Ketentuan: MVP mengukur page views dan klik, bukan unique visitors yang akurat, karena identifikasi pengunjung unik memerlukan rancangan privasi dan deduplikasi tambahan.

### 5.7 Dashboard Admin

**FR-027 | P0 | US-01 | G-02**

Admin harus dapat melihat daftar akun beserta status, role, jumlah halaman, dan aksi pengelolaan.

Acceptance criteria:

- Given admin membuka daftar akun, when data tersedia, then seluruh akun yang berhak dikelola ditampilkan.

Edge case: daftar kosong dan paginasi.

**FR-028 | P0 | US-10 | G-04**

Admin harus dapat menonaktifkan halaman pengguna tanpa menghapus konten yang tersimpan.

Acceptance criteria:

- Given halaman telah diterbitkan, when admin menonaktifkannya, then URL publik tidak lagi menampilkan konten halaman.

Edge case: pengguna mencoba mempublikasikan ulang halaman yang diblokir admin.

**FR-029 | P1 | US-01 | G-02**

Admin sebaiknya dapat melihat ringkasan jumlah user, halaman aktif, total kunjungan, dan total klik pada dashboard utama.

Acceptance criteria:

- Given data sistem tersedia, when dashboard admin dibuka, then ringkasan dihitung dari data yang dapat diakses admin.

Edge case: nilai nol dan data besar.

### 5.8 Custom Domain Eksternal

**FR-030 | P2 | US-03 | G-03**

Sistem sebaiknya mendukung pemetaan domain eksternal yang telah diverifikasi ke satu halaman tertentu.

Acceptance criteria:

- Given domain eksternal berhasil diverifikasi dan dikonfigurasi, when domain tersebut diakses, then halaman yang dipetakan ditampilkan.

Edge case: DNS salah, domain telah dipakai halaman lain, SSL belum aktif, dan domain dicabut.

Fitur ini dikeluarkan dari target rilis 14 hari.

## 6. Persyaratan Non-Fungsional

Semua angka pada bagian ini merupakan **usulan target engineering** untuk diverifikasi melalui pengujian.

| ID      | Prioritas | Persyaratan terukur                                                                                                                                   | Metode verifikasi                    |
| ------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| NFR-001 | P0        | Halaman publik harus mencapai LCP ≤2,5 detik pada persentil ke-75 untuk pengujian mobile yang disepakati.                                             | Lighthouse dan RUM bila tersedia     |
| NFR-002 | P0        | Halaman publik harus memiliki CLS ≤0,1 pada persentil ke-75.                                                                                          | Lighthouse / Web Vitals              |
| NFR-003 | P0        | Semua koneksi produksi harus menggunakan HTTPS.                                                                                                       | Pengujian TLS dan redirect HTTP      |
| NFR-004 | P0        | Seluruh tabel yang memuat data privat pengguna harus menerapkan otorisasi berbasis Row Level Security atau kontrol server setara yang teruji.         | Pengujian akses lintas akun          |
| NFR-005 | P0        | Kredensial privileged seperti Supabase service-role key tidak boleh berada pada bundle browser.                                                       | Pemeriksaan build dan konfigurasi    |
| NFR-006 | P0        | Sistem harus membatasi unggahan avatar maksimal 2 MB dengan validasi tipe MIME dan isi file.                                                          | Pengujian unggahan                   |
| NFR-007 | P0        | Form dan endpoint perubahan data harus melakukan validasi input pada sisi server.                                                                     | Pengujian input tidak valid          |
| NFR-008 | P0        | Sistem harus menerapkan rate limit pada login, pembuatan halaman, dan endpoint analytics yang rentan disalahgunakan.                                  | Pengujian request berulang           |
| NFR-009 | P0        | Target ketersediaan halaman publik harus ≥99,5% per bulan dengan pengukuran dari layanan pemantauan eksternal.                                        | Laporan uptime bulanan               |
| NFR-010 | P0        | Halaman harus mempertahankan fungsi utama pada Chrome, Firefox, Safari, dan Edge versi stabil yang diuji saat rilis.                                  | Cross-browser testing                |
| NFR-011 | P0        | Kontrol interaktif utama harus dapat digunakan melalui keyboard dan memiliki label aksesibel.                                                         | Pengujian keyboard dan accessibility |
| NFR-012 | P0        | Sistem harus menghindari penyimpanan alamat IP mentah dan data pribadi pengunjung untuk analitik MVP.                                                 | Audit skema dan payload              |
| NFR-013 | P1        | Sistem sebaiknya memiliki prosedur backup dan restore yang diuji minimal satu kali sebelum perluasan pilot.                                           | Simulasi restore                     |
| NFR-014 | P0        | Semua perubahan skema database harus menggunakan migration yang tersimpan dalam version control.                                                      | Review repository                    |
| NFR-015 | P0        | Halaman publik harus tetap dapat ditampilkan ketika layanan pencatatan analytics gagal.                                                               | Fault-injection test                 |
| NFR-016 | P1        | Sistem sebaiknya mempertahankan total ukuran JavaScript awal halaman publik maksimal 200 KB terkompresi sesuai hasil analisis bundle yang disepakati. | Bundle analyzer                      |

Batas ukuran JavaScript ditetapkan sebagai anggaran awal, bukan jaminan yang sudah teruji.

## 7. Alur & Desain

### 7.1 Alur User

1. Admin membuat akun.
2. User melakukan login.
3. User masuk ke dashboard halaman.
4. User memilih Create New Page.
5. User mengisi nama dan slug.
6. Sistem memvalidasi slug.
7. User mengatur profil halaman.
8. User menambahkan dan menyusun link.
9. User memilih template dan gaya tampilan.
10. User melihat preview.
11. User mempublikasikan halaman.
12. Sistem menampilkan URL dan QR Code.
13. User memantau statistik halaman.

### 7.2 Struktur Navigasi

**Area publik**

- `/` — Landing atau root aplikasi.
- `/{slug}` — Halaman publik berdasarkan slug.

**Area autentikasi dan dashboard**

- `/login` — Login.
- `/dashboard` — Daftar halaman user.
- `/dashboard/pages/new` — Membuat halaman.
- `/dashboard/pages/[id]/edit` — Editor halaman.
- `/dashboard/pages/[id]/analytics` — Analytics halaman.
- `/dashboard/pages/[id]/qr` — QR Code halaman.
- `/dashboard/settings` — Pengaturan akun.

**Area admin**

- `/admin` — Dashboard admin.
- `/admin/users` — Manajemen akun.
- `/admin/pages` — Manajemen seluruh halaman.

Routing slug publik harus mengecualikan nama route sistem yang dilindungi.

### 7.3 Layout Dashboard

Dashboard pengguna menampilkan:

- Header dengan identitas SIT.
- Navigasi utama.
- Tombol Create Page.
- Daftar atau grid halaman.
- Judul halaman dan slug.
- Status draft/published/archived.
- Ringkasan jumlah link.
- Ringkasan view dan klik.
- Aksi Edit, Preview, Analytics, QR, dan Archive.

### 7.4 Layout Editor

Editor menggunakan dua area pada desktop:

**Panel konfigurasi**

- Identitas halaman.
- Profil.
- Link.
- Desain.
- Publikasi.

**Panel preview**

- Tampilan halaman berbasis ukuran ponsel.
- Pratinjau perubahan.
- Pengaturan ukuran preview bila diperlukan.

Pada mobile, panel konfigurasi dan preview ditampilkan secara bergantian untuk mencegah kepadatan ruang.

### 7.5 Konsep Visual

Karakter desain SIT:

- Minimalis.
- Modern.
- Ringan.
- Mobile-first.
- Radius komponen konsisten.
- Microinteraction halus.
- Animasi morph pada elemen terpilih.
- Kontras warna yang memadai.
- Tipografi mudah dibaca.

Animasi dekoratif tidak boleh menghambat klik, navigasi, atau pembacaan konten.

### 7.6 Status UI

Sistem harus memiliki rancangan untuk:

- Loading.
- Empty state.
- Success.
- Validation error.
- Permission denied.
- Not found.
- Network failure.
- Unsaved changes.

## 8. Kebutuhan Teknis & Data

### 8.1 Stack Teknologi

| Layer          | Teknologi                       | Keputusan    |
| -------------- | ------------------------------- | ------------ |
| Framework      | Next.js dengan App Router       | Disetujui    |
| Bahasa         | TypeScript                      | Disetujui    |
| Styling        | Tailwind CSS                    | Disetujui    |
| Hosting        | Vercel                          | Direncanakan |
| Database       | Supabase PostgreSQL             | Direncanakan |
| Authentication | Supabase Auth                   | Rekomendasi  |
| Storage        | Supabase Storage                | Rekomendasi  |
| UI components  | shadcn/ui                       | Rekomendasi  |
| Animation      | Motion atau CSS transitions     | Rekomendasi  |
| Drag & drop    | dnd-kit                         | Rekomendasi  |
| Validation     | Zod                             | Rekomendasi  |
| QR Code        | Library QR generator            | Rekomendasi  |
| Charts         | Recharts atau alternatif ringan | Rekomendasi  |

Versi dependency harus dikunci pada saat implementasi dan diuji sebelum production build.

### 8.2 Arsitektur Aplikasi

Arsitektur yang digunakan:

**Single Next.js Application + Multi-Page Data Model**

Alur permintaan:

Browser → Vercel / Next.js → Supabase

Komponen sistem:

1. Public Page Renderer.
2. Authentication Layer.
3. User Dashboard.
4. Page Editor.
5. Admin Dashboard.
6. Analytics Collector.
7. PostgreSQL Database.
8. File Storage.

Seluruh halaman menggunakan satu deployment aplikasi, bukan satu deployment per slug.

### 8.3 Entitas Database

**profiles**

| Kolom        | Tipe        | Deskripsi                       |
| ------------ | ----------- | ------------------------------- |
| id           | UUID PK     | Mengacu pada Supabase Auth user |
| email        | TEXT        | Email pengguna                  |
| display_name | TEXT        | Nama tampil                     |
| role         | TEXT        | `admin` / `user`                |
| is_active    | BOOLEAN     | Status akun                     |
| created_at   | TIMESTAMPTZ | Tanggal pembuatan               |

**pages**

| Kolom          | Tipe        | Deskripsi                |
| -------------- | ----------- | ------------------------ |
| id             | UUID PK     | Identitas halaman        |
| owner_id       | UUID FK     | Pemilik halaman          |
| slug           | TEXT UNIQUE | URL unik                 |
| title          | TEXT        | Judul halaman            |
| description    | TEXT        | Bio/deskripsi            |
| avatar_path    | TEXT        | Lokasi avatar            |
| status         | TEXT        | draft/published/archived |
| admin_disabled | BOOLEAN     | Blokir admin             |
| theme_config   | JSONB       | Pengaturan desain        |
| social_links   | JSONB       | Tautan sosial            |
| created_at     | TIMESTAMPTZ | Dibuat                   |
| updated_at     | TIMESTAMPTZ | Diubah                   |
| published_at   | TIMESTAMPTZ | Publikasi                |

**links**

| Kolom      | Tipe        | Deskripsi       |
| ---------- | ----------- | --------------- |
| id         | UUID PK     | Identitas link  |
| page_id    | UUID FK     | Halaman pemilik |
| title      | TEXT        | Label tombol    |
| url        | TEXT        | URL tujuan      |
| icon       | TEXT        | Ikon opsional   |
| sort_order | INTEGER     | Posisi          |
| is_active  | BOOLEAN     | Status          |
| created_at | TIMESTAMPTZ | Dibuat          |
| updated_at | TIMESTAMPTZ | Diubah          |

**analytics_events**

| Kolom      | Tipe         | Deskripsi            |
| ---------- | ------------ | -------------------- |
| id         | UUID PK      | Identitas event      |
| page_id    | UUID FK      | Halaman terkait      |
| link_id    | UUID FK NULL | Link terkait         |
| event_type | TEXT         | page_view/link_click |
| created_at | TIMESTAMPTZ  | Waktu event          |

**page_domains (fase P2)**

| Kolom               | Tipe        | Deskripsi         |
| ------------------- | ----------- | ----------------- |
| id                  | UUID PK     | Identitas         |
| page_id             | UUID FK     | Halaman           |
| hostname            | TEXT UNIQUE | Domain eksternal  |
| verification_status | TEXT        | Status verifikasi |
| created_at          | TIMESTAMPTZ | Dibuat            |

### 8.4 Relasi Data

- `auth.users` 1 → 1 `profiles`
- `profiles` 1 → N `pages`
- `pages` 1 → N `links`
- `pages` 1 → N `analytics_events`
- `links` 1 → N `analytics_events`
- `pages` 1 → N `page_domains` pada fase berikutnya

Setiap halaman menjadi unit pengelolaan independen di dalam akun pemilik.

### 8.5 Aturan Slug

- Slug global harus unik.
- Validasi harus dilakukan pada server.
- Database harus menggunakan unique constraint.
- Slug menggunakan huruf kecil.
- Route khusus seperti `login`, `dashboard`, `admin`, `api`, `auth`, dan `settings` harus dilindungi.
- Slug tidak boleh menentukan identitas pemilik akun.
- Slug harus tetap unik meskipun dibuat oleh user berbeda.
- Sistem harus menangani konflik transaksi saat dua user memilih slug yang sama.

### 8.6 Rekomendasi Row Level Security

Kebijakan data:

- User dapat membaca dan mengubah halaman miliknya.
- User tidak dapat mengubah halaman orang lain.
- Admin memperoleh akses berdasarkan pemeriksaan role di server yang tepercaya.
- Data halaman published dapat dibaca publik hanya melalui jalur akses yang diizinkan.
- Link publik hanya tersedia jika halaman published dan tidak diblokir.
- Event analytics tidak dapat dibaca langsung oleh pengguna lain.
- Publik tidak memperoleh izin langsung untuk memanipulasi data event.
- Operasi administratif sensitif menggunakan server-side authorization.

Admin tidak boleh mendapat privilege dengan memodifikasi parameter dari browser.

### 8.7 Strategi Analytics

Page views dicatat melalui collector ringan atau mekanisme server-side yang sesuai strategi rendering.

Klik link dicatat melalui endpoint redirect:

`/api/click/{linkId}`

Proses:

1. Validasi link dan halaman.
2. Catat event klik.
3. Redirect ke URL tujuan yang tersimpan.
4. Hindari penundaan redirect berlebihan saat collector gagal.

Endpoint tidak boleh menerima URL tujuan arbitrer dari parameter pengguna agar tidak menjadi open redirect.

Analitik MVP menyimpan data minimal tanpa fingerprinting perangkat.

Bot filtering, unique visitor tracking, retensi analytics, dan deduplikasi lanjutan menjadi pengembangan berikutnya.

### 8.8 Strategi Rendering

- Halaman publik menggunakan rendering server dan caching terkontrol.
- Dashboard dan editor menggunakan akses terautentikasi.
- Perubahan konten published harus menyebabkan cache yang relevan diperbarui.
- Perubahan status atau pemblokiran admin harus segera menghentikan penyajian halaman publik yang lama.
- Pengambilan data privat tidak boleh menggunakan cache publik bersama.

## 9. Asumsi, Dependensi & Batasan

### 9.1 Asumsi

| ID   | Asumsi                                                  | Status       |
| ---- | ------------------------------------------------------- | ------------ |
| A-01 | Domain utama telah dimiliki                             | Dikonfirmasi |
| A-02 | Domain akan diarahkan ke deployment Vercel              | Direncanakan |
| A-03 | Supabase digunakan sebagai backend terkelola            | Direncanakan |
| A-04 | Pengguna awal tidak melebihi 10 akun                    | Dikonfirmasi |
| A-05 | Pembuatan akun hanya oleh admin                         | Dikonfirmasi |
| A-06 | Setiap user boleh membuat banyak halaman                | Dikonfirmasi |
| A-07 | Tidak ada batas bisnis jumlah halaman per akun pada MVP | Dikonfirmasi |
| A-08 | Satu halaman mempunyai satu slug utama                  | Rekomendasi  |
| A-09 | Custom domain eksternal ditunda                         | Dikonfirmasi |

### 9.2 Dependensi

- Akses akun Vercel.
- Akses project Supabase.
- Akses konfigurasi DNS domain utama.
- Repository Git.
- Penyedia layanan monitoring uptime.
- Library QR generator.
- Dependensi UI dan animasi.
- Proses backup dan recovery.

### 9.3 Batasan Biaya dan Infrastruktur

Anggaran proyek berorientasi pada penggunaan layanan yang sudah tersedia.

Penggunaan Vercel pribadi perlu ditinjau terhadap ketentuan penggunaan yang berlaku, terutama apabila SIT digunakan sebagai produk operasional perusahaan.

Biaya layanan cloud, kuota database, penyimpanan media, bandwidth, dan kapasitas function dapat berubah sesuai penggunaan dan paket layanan.

Status kelayakan paket produksi: **[PERLU KONFIRMASI]**

### 9.4 Batasan Waktu

Target 14 hari memerlukan pengendalian scope.

Urutan implementasi harus mengutamakan autentikasi, halaman multi-page, link, editor sederhana, publikasi, dan keamanan sebelum enhancement visual lanjutan.

## 10. Risiko & Mitigasi

| Risiko                        | Dampak                                    | Probabilitas awal | Mitigasi                                     |
| ----------------------------- | ----------------------------------------- | ----------------- | -------------------------------------------- |
| Scope terlalu besar           | Rilis terlambat                           | Tinggi            | P0 dahulu, P1 setelah inti stabil            |
| Kesalahan RLS                 | Kebocoran atau perubahan data lintas akun | Tinggi            | Test authorization otomatis                  |
| Konflik slug                  | URL tidak konsisten                       | Sedang            | Constraint unik dan transaksi                |
| Animasi terlalu berat         | Performa mobile turun                     | Sedang            | Progressive enhancement dan reduced motion   |
| Penyalahgunaan analytics      | Beban atau data tidak valid               | Sedang            | Rate limit dan validasi server               |
| Batas paket cloud             | Gangguan atau biaya tambahan              | Sedang            | Audit kuota dan ketentuan plan               |
| Cache halaman lama            | Konten tidak sinkron                      | Sedang            | Revalidation dan pengujian status publikasi  |
| Penghapusan data              | Kehilangan konten                         | Sedang            | Konfirmasi dan mekanisme backup              |
| Perubahan slug                | QR/link lama rusak                        | Sedang            | Peringatan dan opsi redirect fase berikutnya |
| Ketergantungan satu developer | Penyelesaian melambat                     | Sedang            | Dokumentasi, version control, dan test       |

## 11. Rencana Rilis

### 11.1 Roadmap 14 Hari

| Hari | Fokus             | Deliverable                               |
| ---- | ----------------- | ----------------------------------------- |
| 1    | Setup project     | Next.js, Tailwind, Supabase, environment  |
| 2    | Database & auth   | Migration, login, roles, RLS              |
| 3    | Dashboard user    | Daftar halaman, create page               |
| 4    | Multi-page & slug | CRUD page, unique slug, validasi          |
| 5    | Profil & media    | Profil, avatar, social links              |
| 6    | Manajemen link    | CRUD link, active state                   |
| 7    | Urutan & preview  | Drag & drop, preview dasar                |
| 8    | Desain            | Template, warna, font, tombol             |
| 9    | Publikasi         | Public renderer, status halaman, caching  |
| 10   | QR & analytics    | QR Code, page views, click tracking       |
| 11   | Admin panel       | Users, pages, status, permission          |
| 12   | UI polish         | Responsive, animasi ringan, accessibility |
| 13   | QA & security     | Test RLS, slug, mobile, regresi           |
| 14   | Deployment pilot  | DNS, Vercel, monitoring, uji pengguna     |

Rencana ini mengasumsikan tidak ada hambatan eksternal signifikan dan fitur P1 dapat dikurangi bila diperlukan.

### 11.2 Release Gates

SIT dinyatakan layak pilot apabila:

- Login berhasil.
- Admin dapat mengelola akun.
- User dapat membuat minimal tiga halaman independen.
- Slug unik bekerja lintas akun.
- Profil dan link tiap halaman terpisah.
- Urutan link tersimpan.
- Tiga template dasar tersedia.
- Halaman published dapat diakses publik.
- Halaman draft dan blocked tidak dapat diakses publik.
- QR Code mengarah ke halaman yang benar.
- Statistik view dan klik tercatat.
- Akses lintas akun ditolak.
- Pengujian mobile dan keamanan dasar lulus.
- Domain utama dan HTTPS berfungsi.

### 11.3 Pilot

Tahap pertama:

- 2–3 pengguna.
- Halaman nyata yang telah dibuat.
- Pemantauan penggunaan dan bug.
- Pengumpulan umpan balik editor.

Tahap kedua:

- Perluasan hingga 10 pengguna.
- Migrasi halaman Linktree yang disepakati.
- Evaluasi performa dan biaya.
- Prioritisasi P1 dan P2.

### 11.4 Fase Lanjutan

Prioritas setelah MVP:

1. Penyempurnaan animasi morph.
2. Analytics lanjutan.
3. QR Code dengan opsi styling.
4. Riwayat perubahan slug dan redirect.
5. Custom domain eksternal.
6. Template tambahan.
7. Fitur duplikasi halaman.
8. Backup dan restore yang lebih terotomasi.
9. Audit log administratif.
10. Monitoring penggunaan resource.

## 12. Pertanyaan Terbuka

| ID   | Pertanyaan                                                                                   | Status                                          |
| ---- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Q-01 | Apa nama domain produksi SIT?                                                                | Belum dicantumkan                               |
| Q-02 | Berapa jumlah akun Linktree dan biaya aktual sebelumnya?                                     | Belum diukur                                    |
| Q-03 | Apakah penggunaan Vercel pribadi sesuai dengan ketentuan penggunaan perusahaan dan penyedia? | Perlu diverifikasi                              |
| Q-04 | Apakah halaman yang diarsipkan boleh dipulihkan oleh user?                                   | Rekomendasi: ya                                 |
| Q-05 | Apakah slug lama perlu redirect ketika diganti?                                              | Rekomendasi: fase P1/P2                         |
| Q-06 | Berapa lama event analytics disimpan?                                                        | Rekomendasi awal: 90 hari                       |
| Q-07 | Apakah avatar dan gambar boleh diunggah selain melalui Supabase Storage?                     | Rekomendasi: tidak pada MVP                     |
| Q-08 | Siapa penanggung jawab backup dan pemulihan?                                                 | Belum ditetapkan                                |
| Q-09 | Apakah setiap halaman membutuhkan metadata SEO khusus?                                       | Rekomendasi: judul dan deskripsi dasar pada MVP |
| Q-10 | Apakah target metrik yang direkomendasikan sudah disetujui sebagai target resmi?             | Belum dikonfirmasi                              |

Pertanyaan terbuka tidak boleh diterjemahkan menjadi keputusan final oleh AI coding agent tanpa instruksi pemilik produk.

## 13. Glosarium

| Istilah       | Definisi                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| SIT           | Nama aplikasi link-in-bio internal                                          |
| User          | Pengguna internal yang mempunyai akun SIT                                   |
| Admin         | Pengguna dengan hak pengelolaan seluruh akun dan halaman                    |
| Page          | Halaman link-in-bio independen milik akun                                   |
| Multi-page    | Kemampuan satu akun memiliki banyak halaman                                 |
| Slug          | Bagian unik URL setelah domain utama                                        |
| Public page   | Halaman yang dapat diakses tanpa login                                      |
| Draft         | Halaman belum ditayangkan                                                   |
| Published     | Halaman yang ditayangkan                                                    |
| Archived      | Halaman yang tidak ditayangkan tetapi dapat dipertahankan dalam penyimpanan |
| Theme         | Konfigurasi visual halaman                                                  |
| Template      | Konfigurasi tampilan siap pakai                                             |
| Page view     | Event pembukaan halaman publik                                              |
| Link click    | Event pemilihan link                                                        |
| QR Code       | Kode dua dimensi yang berisi URL halaman                                    |
| RLS           | Row Level Security untuk membatasi akses data                               |
| MVP           | Minimum Viable Product                                                      |
| P0            | Kebutuhan wajib rilis                                                       |
| P1            | Kebutuhan pendukung                                                         |
| P2            | Kebutuhan fase berikutnya                                                   |
| Custom domain | Domain eksternal yang dipetakan ke halaman SIT                              |
| Custom slug   | Bagian path URL yang ditentukan user pada domain utama SIT                  |

## 14. Riwayat Revisi

| Versi | Tanggal         | Perubahan                                                                      |
| ----- | --------------- | ------------------------------------------------------------------------------ |
| 1.0.0 | 22 Oktober 2026 | Penyusunan PRD pertama berdasarkan wawancara tujuh topik                       |
| 1.0.0 | 22 Oktober 2026 | Memasukkan arsitektur multi-page per account                                   |
| 1.0.0 | 22 Oktober 2026 | Memisahkan custom slug dan custom domain eksternal                             |
| 1.0.0 | 22 Oktober 2026 | Menetapkan prioritas, acceptance criteria, model data, dan rencana MVP 14 hari |

---

## Checklist Kualitas PRD

- [x] Seluruh requirement fungsional memiliki ID unik.
- [x] Setiap requirement memiliki prioritas.
- [x] Persyaratan fungsional ditautkan ke user story dan tujuan.
- [x] Acceptance criteria menggunakan format Given–When–Then.
- [x] Edge case utama dicantumkan.
- [x] Persyaratan non-fungsional dapat diverifikasi.
- [x] Multi-page per user didukung dalam arsitektur dan skema data.
- [x] Slug independen dari username akun.
- [x] Keamanan multi-user dirancang melalui otorisasi dan RLS.
- [x] Fitur custom domain eksternal dipisahkan dari MVP.
- [x] Fakta dan rekomendasi telah dibedakan.
- [ ] Baseline biaya dan adopsi masih perlu dikumpulkan.
- [ ] Kelayakan paket cloud untuk produksi perusahaan masih perlu diverifikasi.
- [ ] Target kuantitatif rekomendasi masih menunggu persetujuan resmi.
- [ ] Rencana implementasi 14 hari masih perlu divalidasi terhadap kapasitas engineering.

**Kesimpulan review:** PRD telah cukup untuk menjadi dasar desain dan implementasi awal SIT, dengan risiko terbesar berada pada luasnya cakupan P0, batas waktu pengembangan, dan keputusan operasional hosting.
