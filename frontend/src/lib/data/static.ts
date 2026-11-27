// Konstanta tampilan dan konten statis yang tidak bersumber dari database.
// Semua nilai dinamis ada di '@/lib/data' (entities, academic, stats).

export const TODAY = new Date()
export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const HARI_S = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export const fmtTgl = (d: Date) => `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN_S[d.getMonth()]} ${d.getFullYear()}`
export const fmtTglPendek = (d: Date) => `${d.getDate()} ${BULAN_S[d.getMonth()]} ${d.getFullYear()}`
export const fmtBatas = (iso: string) => `${fmtTgl(new Date(iso))}, ${new Date(iso).getHours().toString().padStart(2, '0')}.${new Date(iso).getMinutes().toString().padStart(2, '0')}`
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const weekDays = () => {
  const mon = addDays(TODAY, -3)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

export const SEMESTER = 'Semester Ganjil 2026/2027'

export type Slot = { hari: number; mulai: string; selesai: string; ruang: string; mode: string; sesi: number }
export const fmtSlot = (s: Slot) => `${HARI[s.hari] ?? ''}, ${s.mulai} - ${s.selesai}`

export const jamPelajaran = [['1', '07.00 - 07.45'], ['2', '07.45 - 08.30'], ['3', '08.30 - 09.15'], ['4', '09.15 - 10.00'], ['5', '10.20 - 11.05'], ['6', '11.05 - 11.50'], ['7', '12.40 - 13.25'], ['8', '13.25 - 14.10']]

export const KATEGORI_KOMENTAR = [
  'Pekerjaan sudah sangat baik, pertahankan!',
  'Perhatikan kerapian dan kelengkapan jawaban.',
  'Mohon lengkapi sumber referensi pada laporan.',
  'Perlu perbaikan pada bagian analisis, silakan revisi.',
]

export const kalender = [
  { tgl: '2026-10-05', akhir: '2026-10-09', judul: 'Ujian Tengah Semester (UTS) Ganjil', jenis: 'UTS' },
  { tgl: '2026-10-28', akhir: '2026-10-28', judul: 'Peringatan Hari Sumpah Pemuda', jenis: 'Kegiatan' },
  { tgl: '2026-11-10', akhir: '2026-11-10', judul: 'Upacara Hari Pahlawan', jenis: 'Kegiatan' },
  { tgl: '2026-11-14', akhir: '2026-11-14', judul: 'Pembagian Rapor Tengah Semester', jenis: 'Kegiatan' },
  { tgl: '2026-12-07', akhir: '2026-12-11', judul: 'Penilaian Akhir Semester (UAS) Ganjil', jenis: 'UAS' },
  { tgl: '2026-12-19', akhir: '2027-01-03', judul: 'Libur Semester Ganjil', jenis: 'Libur' },
  { tgl: '2026-12-25', akhir: '2026-12-25', judul: 'Hari Raya Natal', jenis: 'Libur' },
  { tgl: '2027-01-04', akhir: '2027-01-04', judul: 'Awal Semester Genap 2026/2027', jenis: 'Kegiatan' },
]

export const mediaFiles = [
  { id: 'f1', nama: 'Modul-HTML-Dasar.pdf', tipe: 'dokumen', ukuran: '2,4 MB', tgl: '12 Okt 2026' },
  { id: 'f2', nama: 'Infografis-Flexbox.png', tipe: 'gambar', ukuran: '860 KB', tgl: '15 Okt 2026' },
  { id: 'f3', nama: 'Slide-CSS-Selector.pdf', tipe: 'dokumen', ukuran: '1,8 MB', tgl: '14 Okt 2026' },
  { id: 'f4', nama: 'Tutorial HTML Crash Course', tipe: 'youtube', ukuran: 'Tautan', tgl: '10 Okt 2026' },
  { id: 'f5', nama: 'Diagram-ERD-Contoh.png', tipe: 'gambar', ukuran: '540 KB', tgl: '20 Okt 2026' },
  { id: 'f6', nama: 'Panduan-JavaScript.pdf', tipe: 'dokumen', ukuran: '3,1 MB', tgl: '22 Okt 2026' },
  { id: 'f7', nama: 'Video: Responsive Design', tipe: 'youtube', ukuran: 'Tautan', tgl: '23 Okt 2026' },
  { id: 'f8', nama: 'Mockup-Landing-Page.png', tipe: 'gambar', ukuran: '1,3 MB', tgl: '24 Okt 2026' },
  { id: 'f9', nama: 'Soal-Latihan-PHP.pdf', tipe: 'dokumen', ukuran: '980 KB', tgl: '26 Okt 2026' },
]

export const logs: { id: number; user: string; role: string; aksi: string; modul: string; waktu: string; ip: string }[] = []

export const notifikasiContoh = [
  { id: 'n1', judul: 'Tugas baru: Tugas Responsive Layout dengan Flexbox', waktu: '08.15', grup: 'Hari Ini', jenis: 'Tugas', ikon: 'tugas' },
  { id: 'n2', judul: 'Kuis Basis Data Bab 3 ditutup besok pukul 23.59', waktu: '07.30', grup: 'Hari Ini', jenis: 'Kuis', ikon: 'kuis' },
  { id: 'n3', judul: 'Pengumuman: Jadwal Penilaian Akhir Semester', waktu: '06.45', grup: 'Hari Ini', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n4', judul: 'Nilai Job Application Letter telah dipublikasikan', waktu: '16.20', grup: 'Kemarin', jenis: 'Nilai', ikon: 'nilai' },
]

export const notifGuru = [
  { id: 'n1', judul: 'Pengumpulan tugas baru menunggu penilaian', waktu: '08.20', grup: 'Hari Ini', jenis: 'Tugas', ikon: 'tugas' },
  { id: 'n2', judul: 'Jadwal mengajar hari ini telah tersedia', waktu: '06.00', grup: 'Hari Ini', jenis: 'Jadwal', ikon: 'info' },
  { id: 'n3', judul: 'Kuis sedang berlangsung di kelas yang Anda ampu', waktu: '15.30', grup: 'Kemarin', jenis: 'Kuis', ikon: 'kuis' },
]

export const notifUmum = [
  { id: 'n1', judul: 'Rekap kehadiran bulan ini telah diperbarui', waktu: '08.00', grup: 'Hari Ini', jenis: 'Laporan', ikon: 'info' },
  { id: 'n2', judul: 'Pengumuman sekolah terbaru tersedia', waktu: '06.45', grup: 'Hari Ini', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n3', judul: 'Laporan nilai tengah semester telah dipublikasikan', waktu: '15.00', grup: 'Kemarin', jenis: 'Laporan', ikon: 'nilai' },
]

export const tahunAjaran = [
  { id: 'ta1', nama: '2026/2027', semester: 'Ganjil', mulai: '13 Jul 2026', selesai: '19 Des 2026', aktif: true },
  { id: 'ta2', nama: '2025/2026', semester: 'Genap', mulai: '5 Jan 2026', selesai: '27 Jun 2026', aktif: false },
  { id: 'ta3', nama: '2025/2026', semester: 'Ganjil', mulai: '14 Jul 2025', selesai: '20 Des 2025', aktif: false },
]
