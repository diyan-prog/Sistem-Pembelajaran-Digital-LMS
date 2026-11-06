import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { BarChart3, BookOpen, CalendarDays, ClipboardCheck, ClipboardList, FileBarChart, Home, Library, LayoutDashboard, Megaphone, School, Users, GraduationCap, Award, Activity, Table2, Database, type LucideIcon } from 'lucide-react'
import { ME_SISWA, notifGuru, notifUmum, notifikasi } from '@/data'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

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

type ToastT = { id: number; msg: string; type: 'ok' | 'err' | 'info' | 'warn' }
type ConfirmT = { title: string; message: string; okLabel?: string; danger?: boolean; onOk: () => void } | null
type Ctx = {
  role: Role | null; userData: any | null; login: (r: Role, data: any) => void; logout: () => void
  toast: (msg: string, type?: ToastT['type']) => void
  confirm: (c: NonNullable<ConfirmT>) => void
  notifs: { id: string; judul: string; waktu: string; grup: string; jenis: string; ikon: string; read: boolean }[]
  markRead: (id: string) => void; markAll: () => void
}
const C = createContext<Ctx>(null as never)
export const useApp = () => useContext(C)
export const useRole = () => ({ role: useApp().role as Role, cfg: ROLES[useApp().role as Role], userData: useApp().userData })

const notifFor = (r: Role | null) => (r === 'siswa' ? notifikasi : r === 'guru' ? notifGuru : notifUmum).map((n, i) => ({ ...n, read: i > 3 }))

const supabase = createClient('https://phtqlmidfaocacphblej.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjI0NTksImV4cCI6MjEwNjQzODQ1OX0.8mlV5OrWgBJUWEzejGQHnVxsZqidwPwkq-tH3w_WNtg');

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem('spd-role') as Role) || null)
  const [userData, setUserData] = useState<any>(() => JSON.parse(localStorage.getItem('spd-user') || 'null'))
  const [toasts, setToasts] = useState<ToastT[]>([])
  const [conf, setConf] = useState<ConfirmT>(null)
  const [notifs, setNotifs] = useState(() => notifFor(role))
  
  const login = (r: Role, data: any) => { 
    localStorage.setItem('spd-role', r); 
    localStorage.setItem('spd-user', JSON.stringify(data));
    setRole(r); 
    setUserData(data);
    setNotifs(notifFor(r)); 
  }
  
  const handleSession = useCallback(async (session: any) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile) {
      const r = (profile.role?.toLowerCase() || 'siswa') as Role;
      login(r, profile);
    }
  }, [login]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) handleSession(session);
    });
    return () => subscription.unsubscribe();
  }, [handleSession]);

  const logout = () => { localStorage.removeItem('spd-role'); localStorage.removeItem('spd-user'); setRole(null); setUserData(null); supabase.auth.signOut(); }
  const toast = useCallback((msg: string, type: ToastT['type'] = 'ok') => {
    const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  const icons = { ok: <CheckCircle2 className="text-ok" size={20} />, err: <XCircle className="text-danger" size={20} />, info: <Info className="text-accent" size={20} />, warn: <AlertTriangle className="text-warn" size={20} /> }
  return (
    <C.Provider value={{ role, login, logout, toast, confirm: setConf, notifs, markRead: (id) => setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x))), markAll: () => setNotifs((n) => n.map((x) => ({ ...x, read: true }))) }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pop flex items-center gap-3 bg-white border border-line shadow-lift rounded-2xl pl-4 pr-3 py-3 min-w-[280px] max-w-sm">
            {icons[t.type]}<span className="text-sm font-semibold flex-1">{t.msg}</span>
            <button aria-label="Tutup" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-muted p-1"><X size={16} /></button>
          </div>
        ))}
      </div>
      {conf && (
        <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4 fade" onClick={() => setConf(null)}>
          <div role="alertdialog" aria-modal className="pop bg-white rounded-[20px] p-6 w-full max-w-md shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${conf.danger ? 'bg-red-50 text-danger' : 'bg-primary-light text-primary'}`}>{conf.danger ? <AlertTriangle /> : <Info />}</div>
            <h3 className="text-lg font-bold">{conf.title}</h3>
            <p className="text-muted mt-1 text-sm">{conf.message}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button className="h-10 px-4 rounded-xl border border-line font-semibold hover:bg-gray-50" onClick={() => setConf(null)}>Batal</button>
              <button className={`h-10 px-4 rounded-xl font-semibold text-white ${conf.danger ? 'bg-danger hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`} onClick={() => { conf.onOk(); setConf(null) }}>{conf.okLabel ?? (conf.danger ? 'Hapus' : 'Ya, Lanjutkan')}</button>
            </div>
          </div>
        </div>
      )}
    </C.Provider>
  )
}
