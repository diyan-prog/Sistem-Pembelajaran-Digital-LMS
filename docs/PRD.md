# Product Requirements Document (PRD)

## Sistem Pembelajaran Digital SMK Negeri 2 Indramayu

| Atribut | Nilai |
|---|---|
| Versi | 1.0 |
| Status | Dokumen kerja, mengikuti kondisi implementasi saat ini |
| Tanggal | 24 November 2026 |
| Produk | LMS internal SMK Negeri 2 Indramayu |
| Platform | Aplikasi web (React SPA + Supabase) |
| Dokumen terkait | [`fitur.md`](./fitur.md), [`system_architecture_technical_specification.md`](./system_architecture_technical_specification.md) |

---

## 1. Ringkasan

Sistem Pembelajaran Digital SMK Negeri 2 Indramayu adalah aplikasi LMS berbasis web untuk mendukung kegiatan belajar mengajar harian. Aplikasi menyatukan lima pengalaman pengguna dalam satu produk:

- siswa,
- guru mata pelajaran,
- wali kelas,
- kepala sekolah,
- tata usaha.

Frontend berupa Single Page Application React. Autentikasi, database, realtime, dan fungsi server menggunakan Supabase.

Dokumen ini menetapkan masalah yang diselesaikan, kebutuhan pengguna, ruang lingkup, dan kriteria keberhasilan. Dokumen ini tidak menggantikan spesifikasi teknis; detail arsitektur ada di [`system_architecture_technical_specification.md`](./system_architecture_technical_specification.md).

---

## 2. Latar belakang dan masalah

Kegiatan akademik sekolah masih berpotensi tersebar di banyak berkas, pesan, dan aplikasi terpisah. Akibatnya:

- siswa harus mencari materi, tugas, dan pengumuman dari beberapa sumber;
- guru mencatat presensi, nilai, dan pengumpulan tugas secara manual;
- wali kelas sulit memantau kehadiran dan nilai kelas perwalian secara ringkas;
- kepala sekolah tidak memiliki gambaran aktivitas akademik yang cepat;
- tata usaha mengelola data master dan akun pengguna secara terpisah;
- data yang sama dapat berbeda antarberkas.

Produk ini bertujuan menyediakan satu pintu untuk data dan aktivitas akademik tersebut.

---

## 3. Tujuan

### 3.1 Tujuan produk

1. Menyediakan satu tempat bagi siswa untuk melihat kelas, materi, tugas, kuis, nilai, kehadiran, jadwal, dan pengumuman.
2. Membantu guru mengelola kelas, materi, tugas, kuis, presensi, dan penilaian.
3. Membantu wali kelas memantau kelas perwalian dan siswa berisiko.
4. Memberi kepala sekolah ringkasan statistik, keaktifan guru, dan laporan.
5. Membantu tata usaha mengelola data master, jadwal, penugasan guru, tahun ajaran, pengguna, dan log aktivitas.
6. Menjaga data akademik tetap terpusat di database sekolah.

### 3.2 Non-tujuan

Produk ini tidak ditujukan untuk:

- menggantikan seluruh sistem keuangan atau administrasi sekolah;
- menyediakan pembelajaran video mandiri dengan hosting media penuh;
- menjadi aplikasi chat umum atau media sosial;
- melakukan penilaian resmi tanpa pengawasan guru;
- menggantikan verifikasi manual untuk dokumen resmi sekolah.

---

## 4. Pengguna dan peran

| Peran | Kebutuhan utama |
|---|---|
| Siswa | Melihat dan mengerjakan tugas/kuis, membaca materi, memantau nilai, kehadiran, jadwal, dan pengumuman |
| Guru | Mengelola kelas yang diampu, materi, tugas, kuis, presensi, dan penilaian |
| Wali Kelas | Memantau kelas perwalian, kehadiran, nilai, dan detail siswa |
| Kepala Sekolah | Melihat ringkasan statistik, keaktifan guru, dan laporan |
| Tata Usaha | Mengelola data master, jadwal, penugasan, tahun ajaran, pengguna, dan pengaturan sistem |

### 4.1 Prinsip akses

- Setiap pengguna hanya dapat membuka area sesuai perannya.
- Pembatasan di antarmuka bukan satu-satunya kontrol; database tetap wajib memakai Row Level Security (RLS).
- Operasi pengguna istimewa dijalankan di server, bukan dari browser dengan service-role key.

---

## 5. Ruang lingkup MVP

### 5.1 Termasuk

- Login/logout dan pemulihan sesi.
- Navigasi per peran.
- Pengumuman lintas peran.
- Data master akademik.
- Kelas, materi, tugas, kuis, presensi, dan nilai.
- Rekap untuk guru, wali, dan kepala sekolah.
- Manajemen pengguna oleh tata usaha melalui Edge Function.
- Chatbot bantuan berbasis aturan untuk daftar mata pelajaran dan kelas.

### 5.2 Belum termasuk atau masih terbatas

- Penilaian kuis resmi di server.
- Pengelolaan media melalui Supabase Storage.
- Notifikasi push atau email otomatis.
- Integrasi penuh seluruh halaman ke database.
- Audit keamanan dan pengujian beban produksi.

---

## 6. Kebutuhan fungsional

Prioritas:

- **P0** wajib untuk operasi inti.
- **P1** penting untuk pengalaman pengguna.
- **P2** peningkatan lanjutan.

### 6.1 Autentikasi dan akun

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-AUTH-01 | Pengguna dapat masuk dengan email dan kata sandi melalui Supabase Auth | P0 |
| FR-AUTH-02 | Sistem memulihkan sesi aktif saat halaman dimuat ulang | P0 |
| FR-AUTH-03 | Sistem mengambil peran pengguna dari tabel `profiles` | P0 |
| FR-AUTH-04 | Pengguna diarahkan ke beranda sesuai peran | P0 |
| FR-AUTH-05 | Pengguna dapat keluar dan sesi dihapus | P0 |
| FR-AUTH-06 | Pengguna dapat meminta bantuan reset kata sandi | P1 |
| FR-AUTH-07 | Pengguna dapat mengganti kata sandi dari dalam aplikasi | P1 |
| FR-AUTH-08 | Halaman yang tidak sesuai peran dialihkan ke beranda peran pengguna | P0 |

### 6.2 Siswa

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SISWA-01 | Melihat ringkasan kelas, jadwal, tugas, kuis, dan pengumuman | P0 |
| FR-SISWA-02 | Melihat daftar kelas dan detail kelas | P0 |
| FR-SISWA-03 | Membaca materi dan membuka pratinjau materi/video | P0 |
| FR-SISWA-04 | Melihat daftar tugas dan detail tugas | P0 |
| FR-SISWA-05 | Mengumpulkan tugas beserta berkas atau catatan | P0 |
| FR-SISWA-06 | Melihat instruksi kuis dan mengerjakan kuis | P0 |
| FR-SISWA-07 | Melihat hasil kuis | P0 |
| FR-SISWA-08 | Melihat nilai dan rekap kehadiran | P0 |
| FR-SISWA-09 | Melihat jadwal pelajaran | P1 |
| FR-SISWA-10 | Membaca pengumuman | P0 |
| FR-SISWA-11 | Melihat notifikasi | P1 |

### 6.3 Guru

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-GURU-01 | Melihat kelas yang diampu | P0 |
| FR-GURU-02 | Melihat detail kelas, daftar siswa, materi, tugas, dan kuis | P0 |
| FR-GURU-03 | Mengelola materi per kelas | P0 |
| FR-GURU-04 | Membuat dan mengubah tugas | P0 |
| FR-GURU-05 | Membuat dan mengubah kuis serta soal | P0 |
| FR-GURU-06 | Melihat hasil kuis | P0 |
| FR-GURU-07 | Mengelola bank soal | P1 |
| FR-GURU-08 | Mencatat presensi per sesi, termasuk opsi QR | P1 |
| FR-GURU-09 | Melihat rekap presensi | P0 |
| FR-GURU-10 | Menilai pengumpulan tugas dan memberi umpan balik | P0 |
| FR-GURU-11 | Melihat rekap nilai per kelas | P0 |
| FR-GURU-12 | Mengelola media pembelajaran | P2 |
| FR-GURU-13 | Membuat pengumuman untuk kelas atau peran | P1 |

### 6.4 Wali kelas

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-WALI-01 | Melihat ringkasan kelas perwalian | P0 |
| FR-WALI-02 | Melihat daftar siswa dan status risiko | P0 |
| FR-WALI-03 | Membuka detail siswa | P0 |
| FR-WALI-04 | Melihat rekap nilai kelas perwalian | P0 |
| FR-WALI-05 | Melihat rekap kehadiran kelas perwalian | P0 |

### 6.5 Kepala sekolah

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-KEPSEK-01 | Melihat ringkasan statistik sekolah | P0 |
| FR-KEPSEK-02 | Melihat statistik akademik per kelas atau mata pelajaran | P1 |
| FR-KEPSEK-03 | Melihat keaktifan guru | P1 |
| FR-KEPSEK-04 | Mengunduh atau melihat laporan | P1 |

### 6.6 Tata usaha

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-TU-01 | Melihat dashboard administrasi | P0 |
| FR-TU-02 | Mengelola data siswa | P0 |
| FR-TU-03 | Mengelola data guru | P0 |
| FR-TU-04 | Mengelola data kelas dan wali kelas | P0 |
| FR-TU-05 | Mengelola mata pelajaran | P0 |
| FR-TU-06 | Mengelola jurusan | P0 |
| FR-TU-07 | Mengelola jadwal pelajaran | P0 |
| FR-TU-08 | Mengatur penugasan guru ke kelas dan mata pelajaran | P0 |
| FR-TU-09 | Mengelola tahun ajaran dan kalender kegiatan | P1 |
| FR-TU-10 | Mengelola pengguna, peran, status, dan reset kata sandi | P0 |
| FR-TU-11 | Melihat log aktivitas | P1 |
| FR-TU-12 | Mengubah pengaturan sistem | P1 |

### 6.7 Lintas peran dan chatbot

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-UMUM-01 | Setiap peran dapat melihat pengumuman sesuai target | P0 |
| FR-UMUM-02 | Setiap peran dapat membuka halaman akun | P1 |
| FR-UMUM-03 | Setiap peran dapat membuka jadwal | P1 |
| FR-UMUM-04 | Setiap peran dapat membuka panduan | P2 |
| FR-UMUM-05 | Setiap peran dapat membuka pengaturan tampilan | P2 |
| FR-BOT-01 | Chatbot dapat menampilkan daftar mata pelajaran | P1 |
| FR-BOT-02 | Chatbot dapat menampilkan daftar kelas | P1 |
| FR-BOT-03 | Chatbot memberi jawaban panduan ketika perintah tidak dikenali | P2 |

---

## 7. Alur pengguna utama

### 7.1 Login

1. Pengguna membuka `/login`.
2. Pengguna memasukkan email dan kata sandi.
3. Supabase Auth memvalidasi kredensial.
4. Sistem mengambil profil dan peran.
5. Pengguna diarahkan ke beranda sesuai peran.

### 7.2 Siswa mengerjakan tugas

1. Siswa membuka menu **Tugas & Kuis**.
2. Siswa memilih tugas.
3. Siswa membaca instruksi dan mengunggah jawaban atau menulis catatan.
4. Sistem menyimpan pengumpulan.
5. Guru menilai pengumpulan.
6. Siswa melihat nilai dan umpan balik.

### 7.3 Guru mencatat presensi

1. Guru membuka menu **Presensi**.
2. Guru memilih kelas yang diampu.
3. Guru membuat atau membuka sesi pertemuan.
4. Guru menandai status setiap siswa.
5. Guru menyimpan presensi.
6. Rekap diperbarui.

### 7.4 Tata usaha menambah pengguna

1. Tata usaha membuka **Manajemen Pengguna**.
2. Tata usaha mengisi email, kata sandi, dan peran.
3. Frontend memanggil Edge Function `admin-users`.
4. Fungsi memverifikasi peran pemanggil.
5. Fungsi membuat pengguna Auth dan memperbarui profil.
6. Daftar pengguna dimuat ulang.

### 7.5 Kepala sekolah melihat laporan

1. Kepala sekolah membuka **Laporan**.
2. Sistem menampilkan ringkasan per kelas dan periode.
3. Kepala sekolah memfilter atau mengunduh laporan.

---

## 8. Kebutuhan nonfungsional

| Aspek | Kebutuhan |
|---|---|
| Keamanan | Tidak ada service-role key di frontend; RLS aktif pada tabel utama; operasi istimewa lewat Edge Function |
| Kinerja | Halaman utama dimuat dengan code splitting; target waktu muat awal wajar pada jaringan sekolah |
| Responsivitas | Layout dapat dipakai pada desktop, tablet, dan ponsel |
| Aksesibilitas | Kontrol penting memiliki label; navigasi dapat digunakan dengan papan tombol |
| Keandalan | Kegagalan query ditampilkan sebagai pesan yang dapat dipahami pengguna |
| Pemeliharaan | Halaman dan komponen dipisah per domain; service layer menjadi jalur data utama |
| Kompatibilitas | Browser modern yang mendukung ES2020 |
| Privasi | Data siswa hanya dapat diakses pengguna berwenang |
| Audit | Aktivitas penting dicatat pada `activity_log` |

---

## 9. Batasan dan asumsi

- Supabase menjadi backend utama; tidak ada server aplikasi terpisah untuk operasi biasa.
- Frontend di-deploy sebagai SPA statis.
- Koneksi internet diperlukan.
- Data awal dapat berasal dari data contoh ketika integrasi database belum selesai.
- Struktur peran harus diselaraskan antara UI, database, dan Edge Function.
- Kunci jawaban kuis tidak boleh dipercaya di sisi klien untuk penilaian resmi.

---

## 10. Metrik keberhasilan

Metrik berikut adalah usulan, bukan hasil pengukuran saat ini.

| Metrik | Target awal |
|---|---|
| Pengguna aktif mingguan | Minimal 80% siswa dan guru dalam satu kelas pilot |
| Tingkat penyelesaian tugas | Minimal 85% tugas terjadwal dikumpulkan tepat waktu |
| Presensi tercatat | Minimal 95% sesi pembelajaran memiliki presensi |
| Waktu muat awal | Kurang dari 3 detik pada jaringan sekolah standar |
| Kesalahan query | Kurang dari 1% permintaan pengguna |
| Penggunaan chatbot | Minimal 30% pengguna mencoba chatbot dalam satu bulan |

---

## 11. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Service-role key pernah tercatat di riwayat Git | Akses istimewa dapat disalahgunakan | Rotasi key dan audit akses |
| RLS terlalu longgar | Data akademik dapat dibaca pihak tidak berhak | Tinjau dan perketat kebijakan |
| Kunci jawaban kuis berada di klien | Nilai dapat dimanipulasi | Pindahkan penilaian ke server |
| Role UI dan database tidak konsisten | Pengguna mendapat akses salah | Satukan enum dan pemetaan |
| Banyak halaman masih memakai data contoh | Data tidak tersimpan | Migrasi bertahap ke service |
| Edge Function belum ter-deploy | Fitur pengguna gagal | Tambahkan langkah deploy dan pemantauan |
| Tidak ada test otomatis | Regresi mudah lolos | Tambahkan unit dan integration test |

---

## 12. Status implementasi dan rencana

### 12.1 Status saat ini

- Struktur frontend dan backend sudah dipisah.
- Login, pengumuman, akun, sebagian data master, penugasan, presensi baca, dan manajemen pengguna sudah memakai Supabase.
- Banyak halaman siswa, guru, wali, dan kepala sekolah masih memakai data contoh.
- Penilaian kuis masih di sisi klien.
- Edge Function `admin-users` sudah tersedia di repositori, tetapi belum tentu ter-deploy.

Rincian per fitur ada di [`fitur.md`](./fitur.md).

### 12.2 Rencana berikutnya

1. Rotasi service-role key dan audit akses.
2. Deploy `admin-users` serta atur environment server.
3. Satukan enum peran.
4. Perketat RLS.
5. Pindahkan penilaian kuis ke server.
6. Migrasikan halaman data contoh ke service layer.
7. Tambahkan notifikasi dari tabel `notifikasi`.
8. Tambahkan unit test dan integration test.
9. Tambahkan pemantauan error dan audit performa.

---

## 13. Definisi selesai

Sebuah fitur dianggap selesai apabila:

- kebutuhan fungsionalnya terpenuhi;
- data tersimpan dan terbaca dari sumber yang benar;
- kontrol akses di UI dan RLS sudah sesuai;
- tidak ada service-role key di frontend;
- alur utama diuji;
- `npx tsc --noEmit` dan `npm run build` lulus;
- dokumentasi fitur diperbarui.

---

## 14. Referensi

- [`fitur.md`](./fitur.md) — katalog fitur dan status implementasi.
- [`system_architecture_technical_specification.md`](./system_architecture_technical_specification.md) — arsitektur dan spesifikasi teknis.
- [`../README.md`](../README.md) — ringkasan arsitektur repositori.
- [`plans/`](./plans/) — catatan rencana implementasi.
