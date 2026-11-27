# Katalog Fitur

Dokumen ini mencatat fitur yang tersedia di aplikasi, route-nya, status implementasi, dan sumber data.

Dokumen terkait:

- [`PRD.md`](./PRD.md) — kebutuhan produk dan prioritas.
- [`system_architecture_technical_specification.md`](./system_architecture_technical_specification.md) — arsitektur dan detail teknis.

---

## 1. Legenda status

| Status | Arti |
|---|---|
| **Terhubung** | UI memakai Supabase dan operasi utama membaca/menulis database |
| **Parsial** | Sebagian alur memakai Supabase, sebagian masih data contoh atau simulasi |
| **Prototipe** | UI berjalan, tetapi data berasal dari `frontend/src/mocks` atau simulasi lokal |
| **Statis** | Konten tetap, tanpa data bisnis |
| **Belum** | Belum tersedia di aplikasi |

Status menunjukkan kondisi kode saat dokumen dibuat, bukan target akhir.

---

## 2. Matriks akses per peran

| Area | Siswa | Guru | Wali | Kepala Sekolah | Tata Usaha |
|---|---:|---:|---:|---:|---:|
| Beranda per peran | Ya | Ya | Ya | Ya | Ya |
| Kelas | Ya | Ya | Ya | Tidak | Ya |
| Materi | Ya | Ya | Tidak | Tidak | Tidak |
| Tugas | Ya | Ya | Tidak | Tidak | Tidak |
| Kuis | Ya | Ya | Tidak | Tidak | Tidak |
| Presensi | Tidak | Ya | Rekap | Tidak | Tidak |
| Nilai | Ya | Ya | Rekap | Statistik | Tidak |
| Jadwal | Ya | Ya | Tidak | Tidak | Ya |
| Pengumuman | Ya | Ya | Ya | Ya | Tidak |
| Notifikasi | Ya | Ya | Ya | Ya | Ya |
| Akun | Ya | Ya | Ya | Ya | Ya |
| Data master | Tidak | Tidak | Tidak | Tidak | Ya |
| Pengguna dan hak akses | Tidak | Tidak | Tidak | Tidak | Ya |
| Log aktivitas | Tidak | Tidak | Tidak | Tidak | Ya |
| Laporan | Tidak | Rekap | Rekap | Ya | Tidak |

---

## 3. Autentikasi dan akun

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| AUTH-01 | Login email dan kata sandi | `/login` | Terhubung | Supabase Auth | Memetakan role dari `profiles` |
| AUTH-02 | Pemulihan sesi | Semua halaman | Terhubung | Supabase Auth + `localStorage` | Cache role diverifikasi saat aplikasi dimuat |
| AUTH-03 | Logout | Menu akun | Terhubung | Supabase Auth | Menghapus cache role dan profil |
| AUTH-04 | Lupa kata sandi | `/lupa-sandi` | Prototipe | Simulasi | Belum mengirim email reset |
| AUTH-05 | Ganti kata sandi | `/ganti-sandi` | Prototipe | Simulasi | Belum memanggil `supabase.auth.updateUser` |
| AUTH-06 | Halaman 404 | Route tidak dikenal | Statis | — | Tautan kembali ke login |
| AUTH-07 | Pembatasan route per peran | Semua route per peran | Terhubung | `RoleGate` + cache role | Otorisasi data tetap bergantung pada RLS |

---

## 4. Fitur siswa

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| SISWA-01 | Beranda siswa | `/siswa/beranda` | Parsial | Supabase + data contoh | Kelas dan pengumuman dari Supabase; sebagian kartu memakai fallback |
| SISWA-02 | Kelas saya | `/siswa/kelas` | Prototipe | `mocks` | Daftar dan kartu kelas |
| SISWA-03 | Detail kelas | `/siswa/kelas/:id` | Prototipe | `mocks` | Materi, tugas, kuis, pengumuman kelas |
| SISWA-04 | Pratinjau materi | `/siswa/kelas/:id/materi/:mid` | Prototipe | `mocks` | Dukungan video dan tautan |
| SISWA-05 | Daftar tugas dan kuis | `/siswa/tugas` | Prototipe | `mocks` | Tab tugas dan kuis |
| SISWA-06 | Detail tugas | `/siswa/tugas/:id` | Prototipe | `mocks` | Form pengumpulan belum menyimpan berkas ke database |
| SISWA-07 | Instruksi kuis | `/siswa/kuis/:id` | Prototipe | `mocks` | Menampilkan aturan dan tombol mulai |
| SISWA-08 | Mengerjakan kuis | `/siswa/kuis/:id/kerjakan` | Prototipe | `mocks` + `sessionStorage` | Jawaban sementara di browser |
| SISWA-09 | Hasil kuis | `/siswa/kuis/:id/hasil` | Prototipe | `sessionStorage` | Skor dihitung di klien |
| SISWA-10 | Nilai dan kehadiran | `/siswa/nilai` | Prototipe | `mocks` | Ringkasan nilai dan persentase hadir |
| SISWA-11 | Jadwal pelajaran | `/siswa/jadwal` | Prototipe | `mocks` | Tampilan mingguan |
| SISWA-12 | Pengumuman | `/siswa/pengumuman` | Terhubung | `pengumuman` | Filter target role |
| SISWA-13 | Detail pengumuman | `/siswa/pengumuman/:id` | Terhubung | `pengumuman` | — |
| SISWA-14 | Notifikasi | `/siswa/notifikasi` | Prototipe | `mocks` | Tabel `notifikasi` belum dipakai |
| SISWA-15 | Akun | `/siswa/akun` | Terhubung | `profiles` | Ubah nama, HP, alamat |
| SISWA-16 | Panduan | `/siswa/panduan` | Statis | — | Panduan penggunaan |
| SISWA-17 | Pengaturan | `/siswa/pengaturan` | Prototipe | Lokal | Preferensi tampilan |

---

## 5. Fitur guru

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| GURU-01 | Beranda guru | `/guru/beranda` | Prototipe | `mocks` | Ringkasan kelas, jadwal, tugas, dan kuis |
| GURU-02 | Kelas saya | `/guru/kelas` | Prototipe | `mocks` | Daftar kelas yang diampu |
| GURU-03 | Detail kelas | `/guru/kelas/:id` | Prototipe | `mocks` | Tab materi, tugas, kuis, siswa, pengumuman |
| GURU-04 | Kelola materi | `/guru/kelas/:id/materi` | Prototipe | `mocks` | Form materi dan video |
| GURU-05 | Daftar siswa kelas | `/guru/kelas/:id/siswa` | Prototipe | `mocks` | Daftar siswa |
| GURU-06 | Pilih kelas presensi | `/guru/presensi` | Prototipe | `mocks` | Kartu kelas yang diampu |
| GURU-07 | Daftar pertemuan presensi | `/guru/presensi/:offId` | Parsial | Supabase + `mocks` | Membaca presensi; pembuatan pertemuan masih simulasi |
| GURU-08 | Sesi presensi | `/guru/presensi/:offId/sesi/:n` | Parsial | `mocks` + simulasi | Simpan presensi masih simulasi |
| GURU-09 | Rekap presensi | `/guru/presensi/:offId/rekap` | Prototipe | `mocks` | Ekspor CSV dari data tampilan |
| GURU-10 | Penilaian tugas | `/guru/penilaian` | Parsial | Supabase + `mocks` | Daftar kelas dari layanan; nilai masih disimulasikan |
| GURU-11 | Daftar tugas | `/guru/tugas` | Prototipe | `mocks` | — |
| GURU-12 | Form tugas | `/guru/tugas/baru`, `/guru/tugas/:id/edit` | Prototipe | `mocks` | Belum menyimpan ke `tugas` |
| GURU-13 | Daftar kuis | `/guru/kuis` | Prototipe | `mocks` | — |
| GURU-14 | Form kuis | `/guru/kuis/baru`, `/guru/kuis/:id/edit` | Prototipe | `mocks` | Belum menyimpan ke `kuis`/`soal_kuis` |
| GURU-15 | Hasil kuis | `/guru/kuis/:id/hasil` | Prototipe | `mocks` | — |
| GURU-16 | Bank soal | `/guru/bank-soal` | Prototipe | `mocks` | Filter dan pratinjau soal |
| GURU-17 | Rekap nilai | `/guru/rekap-nilai/:offId` | Parsial | Supabase + `mocks` | Kelas dari layanan; nilai dari data contoh |
| GURU-18 | Jadwal pelajaran | `/guru/jadwal` | Prototipe | `mocks` | Sama dengan jadwal lintas peran |
| GURU-19 | Media pembelajaran | `/guru/media` | Prototipe | `mocks` | Belum memakai Supabase Storage |
| GURU-20 | Pengumuman | `/guru/pengumuman` | Terhubung | `pengumuman` | Guru dapat membuat pengumuman |
| GURU-21 | Notifikasi | `/guru/notifikasi` | Prototipe | `mocks` | — |
| GURU-22 | Akun | `/guru/akun` | Terhubung | `profiles` | — |
| GURU-23 | Panduan | `/guru/panduan` | Statis | — | — |
| GURU-24 | Pengaturan | `/guru/pengaturan` | Prototipe | Lokal | — |

---

## 6. Fitur wali kelas

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| WALI-01 | Beranda wali | `/wali/beranda` | Prototipe | `mocks` | Statistik kelas dan siswa berisiko |
| WALI-02 | Kelas perwalian | `/wali/kelas` | Prototipe | `mocks` | Daftar siswa dan jadwal |
| WALI-03 | Detail siswa | `/wali/siswa/:id` | Prototipe | `mocks` | Profil, kehadiran, nilai, catatan |
| WALI-04 | Rekap nilai | `/wali/rekap-nilai` | Prototipe | `mocks` | Filter dan ekspor tampilan |
| WALI-05 | Rekap kehadiran | `/wali/rekap-kehadiran` | Prototipe | `mocks` | Ringkasan per siswa |
| WALI-06 | Pengumuman | `/wali/pengumuman` | Terhubung | `pengumuman` | — |
| WALI-07 | Notifikasi | `/wali/notifikasi` | Prototipe | `mocks` | — |
| WALI-08 | Akun | `/wali/akun` | Terhubung | `profiles` | — |
| WALI-09 | Panduan | `/wali/panduan` | Statis | — | — |
| WALI-10 | Pengaturan | `/wali/pengaturan` | Prototipe | Lokal | — |

---

## 7. Fitur kepala sekolah

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| KEPSEK-01 | Beranda kepala sekolah | `/kepsek/beranda` | Prototipe | `mocks` | Ringkasan sekolah dan tren |
| KEPSEK-02 | Statistik | `/kepsek/statistik` | Prototipe | `mocks` | Statistik kelas dan mata pelajaran |
| KEPSEK-03 | Laporan | `/kepsek/laporan` | Prototipe | `mocks` | Pratinjau dan unduh laporan tampilan |
| KEPSEK-04 | Keaktifan guru | `/kepsek/guru` | Prototipe | `mocks` | Daftar guru dan indikator aktivitas |
| KEPSEK-05 | Pengumuman | `/kepsek/pengumuman` | Terhubung | `pengumuman` | — |
| KEPSEK-06 | Notifikasi | `/kepsek/notifikasi` | Prototipe | `mocks` | — |
| KEPSEK-07 | Akun | `/kepsek/akun` | Terhubung | `profiles` | — |
| KEPSEK-08 | Panduan | `/kepsek/panduan` | Statis | — | — |
| KEPSEK-09 | Pengaturan | `/kepsek/pengaturan` | Prototipe | Lokal | — |

---

## 8. Fitur tata usaha

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| TU-01 | Dashboard | `/tu/dashboard` | Parsial | Supabase + `mocks` | Statistik nyata; log aktivitas masih contoh |
| TU-02 | Data siswa | `/tu/siswa` | Terhubung | `siswa_kelas`, `profiles` | CRUD melalui `services/akademik` |
| TU-03 | Data guru | `/tu/guru` | Terhubung | `profiles` | CRUD pengguna guru |
| TU-04 | Data kelas | `/tu/kelas` | Terhubung | `classes`, `profiles`, `jurusan` | CRUD kelas |
| TU-05 | Detail kelas | `/tu/kelas/:id` | Parsial | Supabase + `mocks` | Daftar siswa detail masih contoh |
| TU-06 | Data mata pelajaran | `/tu/mapel` | Terhubung | `subjects` | CRUD mata pelajaran |
| TU-07 | Data jurusan | `/tu/jurusan` | Terhubung | `jurusan` | CRUD jurusan |
| TU-08 | Jadwal pelajaran | `/tu/jadwal` | Prototipe | `mocks` + state lokal | Editor drag-and-drop belum tersimpan |
| TU-09 | Penugasan guru | `/tu/penugasan` | Terhubung | `pengampu` | Ubah guru pengampu |
| TU-10 | Tahun ajaran | `/tu/tahun-ajaran` | Prototipe | `mocks` | Perubahan belum tersimpan |
| TU-11 | Manajemen pengguna | `/tu/pengguna` | Terhubung | `profiles` + Edge Function | Bergantung pada deploy `admin-users` |
| TU-12 | Log aktivitas | `/tu/log` | Prototipe | `mocks` | Tabel `activity_log` belum dipakai |
| TU-13 | Pengaturan sistem | `/tu/pengaturan` | Prototipe | Lokal | Belum memakai tabel `pengaturan` |
| TU-14 | Notifikasi | `/tu/notifikasi` | Prototipe | `mocks` | — |
| TU-15 | Akun | `/tu/akun` | Terhubung | `profiles` | — |
| TU-16 | Panduan | `/tu/panduan` | Statis | — | — |

---

## 9. Fitur lintas peran

| ID | Fitur | Route | Status | Sumber data | Catatan |
|---|---|---|---|---|---|
| UMUM-01 | Daftar pengumuman | `/{peran}/pengumuman` | Terhubung | `pengumuman` | Tersedia untuk siswa, guru, wali, kepsek |
| UMUM-02 | Detail pengumuman | `/{peran}/pengumuman/:id` | Terhubung | `pengumuman` | — |
| UMUM-03 | Jadwal | `/{peran}/jadwal` | Prototipe | `mocks` | Tersedia untuk siswa dan guru |
| UMUM-04 | Notifikasi | `/{peran}/notifikasi` | Prototipe | `mocks` | Header dan halaman notifikasi |
| UMUM-05 | Akun | `/{peran}/akun` | Terhubung | `profiles` | Field terbatas pada nama, HP, alamat, preferensi |
| UMUM-06 | Panduan | `/{peran}/panduan` | Statis | — | — |
| UMUM-07 | Pengaturan | `/{peran}/pengaturan` | Prototipe | Lokal | — |
| UMUM-08 | Kalender | Modal header | Prototipe | `mocks` | Daftar kegiatan sekolah |
| UMUM-09 | Chatbot EduBot | Tombol mengambang | Parsial | Supabase | Membaca tabel `mapel` dan `kelas`; tabel ini tidak ada di migrasi lokal |

---

## 10. Fitur backend dan administratif

| ID | Fitur | Lokasi | Status | Catatan |
|---|---|---|---|---|
| BE-01 | Migrasi skema database | `backend/supabase/migrations` | Tersedia | Perlu tinjauan sebelum `db push` |
| BE-02 | Seed data contoh | `backend/supabase/seed.sql` | Tersedia | Tidak dijalankan otomatis |
| BE-03 | Edge Function `admin-users` | `backend/supabase/functions/admin-users` | Tersedia | Perlu deploy dan environment server |
| BE-04 | Pembuatan pengguna Auth | `admin-users` | Tersedia | Memverifikasi pemanggil sebelum membuat pengguna |
| BE-05 | Ubah role dan status | `admin-users` | Tersedia | Menulis ke `profiles` |
| BE-06 | Reset kata sandi | `admin-users` | Tersedia | Reset ke kata sandi tetap dari UI saat ini |
| BE-07 | Tipe database TypeScript | `frontend/src/types/database.types.ts` | Tersedia | Dibangkitkan dari project remote |
| BE-08 | Realtime pengumuman | `useRealtime` + halaman | Parsial | Hook tersedia; sebagian halaman memasang channel langsung |

---

## 11. Fitur yang belum tersedia

| Area | Kekurangan | Dampak |
|---|---|---|
| Reset kata sandi | Belum mengirim email reset | Pengguna harus meminta bantuan tata usaha |
| Ganti kata sandi | Belum memanggil Supabase Auth | Perubahan tidak benar-benar tersimpan |
| Kuis | Kunci jawaban di klien dan skor lokal | Nilai tidak dapat dipercaya untuk penilaian resmi |
| Pengumpulan tugas | Berkas belum diunggah ke Storage | Jawaban siswa tidak tersimpan permanen |
| Media | Belum memakai Supabase Storage | Media hanya tampilan |
| Notifikasi | Belum membaca tabel `notifikasi` | Notifikasi tidak real-time |
| Log aktivitas | Belum menulis ke `activity_log` | Audit aktivitas belum lengkap |
| Jadwal | Editor belum menyimpan | Perubahan jadwal hilang saat halaman dimuat ulang |
| Tahun ajaran | Belum tersimpan | Perubahan hanya di state lokal |
| Pengaturan sistem | Belum memakai tabel `pengaturan` | Konfigurasi tidak persisten |
| Laporan | Belum memakai data nyata | Laporan hanya pratinjau |
| Chatbot | Tabel `mapel`/`kelas` tidak ada di migrasi | Query dapat gagal |
| Pengujian | Belum ada test otomatis | Regresi tidak terdeteksi |

---

## 12. Prioritas pengembangan berikutnya

1. **Keamanan:** rotasi service-role key, audit RLS, dan pastikan tidak ada key di frontend.
2. **Operasional:** deploy `admin-users` dan atur environment server.
3. **Integritas data:** pindahkan penilaian kuis dan penyimpanan tugas ke server/Storage.
4. **Konsistensi peran:** satukan enum role UI dan database.
5. **Migrasi data contoh:** ubah halaman prioritas ke service layer.
6. **Persistensi:** jadwal, tahun ajaran, pengaturan, notifikasi, dan log.
7. **Kualitas:** unit test, integration test, dan pemantauan error.
