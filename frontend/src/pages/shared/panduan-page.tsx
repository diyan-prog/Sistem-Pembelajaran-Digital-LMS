import { Accordion, PageHeader, useCrumbs } from '@/components/ui'
import { useRole } from '@/context'

// ---------- Panduan ----------
export function PanduanPage() {
  const { role } = useRole()
  const common = [['Bagaimana cara masuk ke sistem?', 'Gunakan NIS (siswa) atau NIP (guru dan staf) beserta kata sandi yang diberikan sekolah. Jika lupa, pilih "Lupa kata sandi" pada halaman masuk.'], ['Bagaimana mengganti kata sandi?', 'Buka menu akun di kanan atas, pilih Kelola Akun, lalu tab Ganti Kata Sandi. Gunakan kombinasi huruf besar, kecil, dan angka.'], ['Bagaimana membaca notifikasi?', 'Klik ikon lonceng di bagian atas untuk melihat 5 notifikasi terbaru, atau pilih "Lihat semua" untuk daftar lengkap dan filter.'], ['Materi apa saja yang didukung?', 'Materi berupa dokumen (PDF, DOCX), gambar (PNG, JPG), dan tautan video YouTube.']]
  const spes: Record<string, string[][]> = {
    siswa: [['Bagaimana mengumpulkan tugas?', 'Buka Tugas & Kuis, pilih tugas, unggah berkas pada kartu status, lalu tekan Kumpulkan. Kamu dapat membatalkan pengumpulan selama belum melewati batas waktu.'], ['Bagaimana mengerjakan kuis?', 'Pilih kuis, baca instruksi, lalu tekan Mulai Kuis. Waktu berjalan otomatis dan jawaban terkumpul saat waktu habis.'], ['Bagaimana melihat kehadiranku?', 'Buka Nilai & Kehadiran. Presensi dicatat oleh guru dan bersifat hanya-lihat bagi siswa.']],
    guru: [['Bagaimana memulai presensi?', 'Dari Beranda atau menu Presensi pilih kelas dan pertemuan, lalu tekan Mulai Presensi. Isi status siswa secara manual dan simpan.'], ['Bagaimana menilai tugas?', 'Buka Penilaian, pilih pengumpulan siswa, isi nilai dan umpan balik pada panel samping, lalu Simpan dan Berikutnya.'], ['Bagaimana menyusun kuis?', 'Pada tab Kuis kelas pilih Buat Kuis, lengkapi pengaturan, tambah soal atau impor dari Bank Soal, lalu publikasikan.']],
    wali: [['Apa yang dapat dilihat wali kelas?', 'Wali kelas dapat memantau nilai, kehadiran, dan tugas siswa perwalian secara hanya-lihat.']],
    kepsek: [['Bagaimana membaca statistik?', 'Gunakan filter kelas, mata pelajaran, dan periode pada Beranda atau Statistik untuk membandingkan capaian.']],
    tu: [['Bagaimana menambah data siswa?', 'Buka Master Data > Siswa, tekan Tambah Siswa atau Import Excel dengan template yang tersedia.']],
  }
  const items = [...(spes[role] ?? []), ...common].map((x, i) => ({ id: 'f' + i, title: x[0], body: <p className="text-sm text-muted leading-6">{x[1]}</p> }))
  return <div><PageHeader crumbs={useCrumbs({ l: 'User Guide' })} title="User Guide" subtitle="Pertanyaan yang sering diajukan seputar penggunaan sistem" /><div className="max-w-3xl"><Accordion items={items} /></div></div>
}
