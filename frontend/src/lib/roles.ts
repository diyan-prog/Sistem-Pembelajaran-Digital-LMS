import { BarChart3, BookOpen, CalendarDays, ClipboardCheck, ClipboardList, FileBarChart, Home, Library, LayoutDashboard, Megaphone, School, Users, GraduationCap, Award, Activity, Table2, Database, type LucideIcon } from 'lucide-react'
import { ME_SISWA } from '@/mocks'

export type Role = 'siswa' | 'guru' | 'wali' | 'kepsek' | 'tu'
export type Menu = { label: string; icon: LucideIcon; to: string }

export const ROLES: Record<Role, { label: string; chip: string; base: string; nama: string; sub: string; menus: Menu[] }> = {
  siswa: { label: 'Siswa', chip: 'SISWA', base: '/siswa', nama: ME_SISWA.nama, sub: 'XI RPL 1', menus: [
    { label: 'Beranda', icon: Home, to: '/siswa/beranda' }, { label: 'Kelas Saya', icon: BookOpen, to: '/siswa/kelas' }, { label: 'Tugas & Kuis', icon: ClipboardList, to: '/siswa/tugas' },
    { label: 'Nilai & Kehadiran', icon: Award, to: '/siswa/nilai' }, { label: 'Pengumuman', icon: Megaphone, to: '/siswa/pengumuman' }] },
  guru: { label: 'Guru', chip: 'GURU', base: '/guru', nama: 'Sari Dewi, S.Kom.', sub: 'Guru Pemrograman Web', menus: [
    { label: 'Beranda', icon: Home, to: '/guru/beranda' }, { label: 'Kelas Saya', icon: BookOpen, to: '/guru/kelas' }, { label: 'Presensi', icon: ClipboardCheck, to: '/guru/presensi' },
    { label: 'Penilaian', icon: Award, to: '/guru/penilaian' }, { label: 'Bank Soal', icon: Library, to: '/guru/bank-soal' }, { label: 'Pengumuman', icon: Megaphone, to: '/guru/pengumuman' }] },
  wali: { label: 'Wali Kelas', chip: 'WALI KELAS', base: '/wali', nama: 'Hendra Kurniawan, S.T.', sub: 'Wali Kelas XI RPL 1', menus: [
    { label: 'Beranda', icon: Home, to: '/wali/beranda' }, { label: 'Kelas Perwalian', icon: School, to: '/wali/kelas' }, { label: 'Rekap Nilai', icon: Table2, to: '/wali/rekap-nilai' }, { label: 'Rekap Kehadiran', icon: CalendarDays, to: '/wali/rekap-kehadiran' }] },
  kepsek: { label: 'Kepala Sekolah', chip: 'KEPALA SEKOLAH', base: '/kepsek', nama: 'Drs. H. Ahmad Fauzi, M.Pd.', sub: 'Kepala Sekolah', menus: [
    { label: 'Beranda', icon: Home, to: '/kepsek/beranda' }, { label: 'Statistik', icon: BarChart3, to: '/kepsek/statistik' }, { label: 'Laporan', icon: FileBarChart, to: '/kepsek/laporan' }, { label: 'Keaktifan Guru', icon: Activity, to: '/kepsek/guru' }] },
  tu: { label: 'Tata Usaha', chip: 'TATA USAHA', base: '/tu', nama: 'Winda Kartika, S.E.', sub: 'Tata Usaha', menus: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/tu/dashboard' }] },
}

export const SIDE_GROUPS: { title?: string; items: Menu[] }[] = [
  { items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/tu/dashboard' }] },
  { title: 'Master Data', items: [{ label: 'Siswa', icon: GraduationCap, to: '/tu/siswa' }, { label: 'Guru', icon: Users, to: '/tu/guru' }, { label: 'Kelas', icon: School, to: '/tu/kelas' }, { label: 'Mata Pelajaran', icon: BookOpen, to: '/tu/mapel' }, { label: 'Jurusan', icon: Database, to: '/tu/jurusan' }] },
  { title: 'Akademik', items: [{ label: 'Jadwal Pelajaran', icon: CalendarDays, to: '/tu/jadwal' }, { label: 'Penugasan Guru', icon: ClipboardCheck, to: '/tu/penugasan' }, { label: 'Tahun Ajaran', icon: Award, to: '/tu/tahun-ajaran' }] },
  { title: 'Pengguna', items: [{ label: 'Manajemen Pengguna & Hak Akses', icon: Users, to: '/tu/pengguna' }, { label: 'Log Aktivitas', icon: Activity, to: '/tu/log' }] },
  { title: 'Sistem', items: [{ label: 'Pengaturan', icon: ClipboardList, to: '/tu/pengaturan' }] },
]
