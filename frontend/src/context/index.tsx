import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { notifGuru, notifUmum, notifikasi } from '@/lib/data'
import { ROLES, resolveRole, toRole, type Role } from '@/lib/roles'
import { supabase } from '@/lib/supabase'
import { getMeGo } from '@/services/api-go'
import { loadAkademik } from '@/services/bootstrap'
import { clearSnapshot, useStore } from '@/lib/store'

type ToastT = { id: number; msg: string; type: 'ok' | 'err' | 'info' | 'warn' }
type ConfirmT = { title: string; message: string; okLabel?: string; danger?: boolean; onOk: () => void } | null
type Ctx = {
  role: Role | null; userData: any | null; login: (r: Role, data: any) => void; logout: () => void
  toast: (msg: string, type?: ToastT['type']) => void
  confirm: (c: NonNullable<ConfirmT>) => void
  notifs: { id: string; judul: string; waktu: string; grup: string; jenis: string; ikon: string; read: boolean }[]
  markRead: (id: string) => void; markAll: () => void
  refreshUser: () => Promise<void>
}
const C = createContext<Ctx>(null as never)
export const useApp = () => useContext(C)
export const useRole = () => {
  const { role, userData } = useApp()
  const cfg = ROLES[role as Role]
  const nama = userData?.nama_lengkap ?? userData?.full_name
  return { role: role as Role, cfg: cfg ? { ...cfg, nama: String(nama ?? cfg.nama) } : cfg, userData }
}

const fallbackNotif = (r: Role | null) => (r === 'siswa' ? notifikasi : r === 'guru' ? notifGuru : notifUmum).map((n, i) => ({ ...n, read: i > 3 }))

const mapNotif = (rows: Record<string, any>[]) =>
  rows.map((n) => {
    const tgl = n.created_at ? new Date(String(n.created_at)) : new Date()
    const jenis = String(n.jenis ?? 'Info')
    const j = jenis.toLowerCase()
    return {
      id: String(n.id),
      judul: String(n.judul ?? ''),
      waktu: tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.'),
      grup: tgl.toDateString() === new Date().toDateString() ? 'Hari Ini' : 'Sebelumnya',
      jenis,
      ikon: j.includes('tugas') ? 'tugas' : j.includes('kuis') ? 'kuis' : j.includes('nilai') ? 'nilai' : j.includes('materi') ? 'materi' : j.includes('presensi') ? 'hadir' : 'info',
      read: Boolean(n.is_read),
    }
  })

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    const stored = localStorage.getItem('spd-role')
    if (!stored || stored === 'undefined') return null
    return toRole(stored)
  })
  const [userData, setUserData] = useState<any>(() => {
    const stored = localStorage.getItem('spd-user')
    if (!stored || stored === 'undefined') return null
    return JSON.parse(stored)
  })
  const [toasts, setToasts] = useState<ToastT[]>([])
  const [conf, setConf] = useState<ConfirmT>(null)
  const [notifs, setNotifs] = useState(() => fallbackNotif(role))
  const snapshot = useStore()

  // Notifikasi asli dari database menggantikan data dummy setelah bootstrap dimuat.
  useEffect(() => {
    if (snapshot.notifikasi.length) setNotifs(mapNotif(snapshot.notifikasi))
  }, [snapshot])

  const login = useCallback((r: Role, data: any) => {
    localStorage.setItem('spd-role', r);
    localStorage.setItem('spd-user', JSON.stringify(data));
    setRole(r);
    setUserData(data);
    setNotifs(fallbackNotif(r));
  }, [])

  const handleSession = useCallback(async (session: any) => {
    let profile: any = null;
    try {
      profile = await getMeGo(session?.access_token);
    } catch {
      // Backend belum tersedia: tetap coba role dari metadata sesi Supabase.
    }
    const r = resolveRole(profile, session?.user);
    if (!r) {
      // Jangan menebak role. Halaman login yang menampilkan pesan ke pengguna.
      return;
    }
    // Muat data akademik ter-scope peran; kegagalan tidak memblokir login.
    loadAkademik().catch(() => {});
    if (profile) {
      login(r, { ...profile, role: r });
      return;
    }
    const meta = session?.user?.user_metadata ?? {};
    login(r, {
      id: session.user.id,
      full_name: meta.nama_lengkap ?? session.user.email ?? 'Pengguna',
      email: session.user.email ?? null,
      role: r,
    });
  }, [login]);

  useEffect(() => {
    // Sesi tersimpan (localStorage) adalah sumber kebenaran. Bila tidak ada,
    // peran lama di localStorage harus dibuang supaya RoleGate mengarahkan
    // pengguna ke halaman login, bukan merender halaman tanpa token.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session);
        return;
      }
      localStorage.removeItem('spd-role');
      localStorage.removeItem('spd-user');
      setRole(null);
      setUserData(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('spd-role');
        localStorage.removeItem('spd-user');
        setRole(null);
        setUserData(null);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        handleSession(session);
      }
    });
    return () => subscription.unsubscribe();
  }, [handleSession]);

  const logout = () => { localStorage.removeItem('spd-role'); localStorage.removeItem('spd-user'); setRole(null); setUserData(null); clearSnapshot(); supabase.auth.signOut(); }
  const refreshUser = useCallback(async () => {
    if (!userData?.id) return;
    try {
      const profile = await getMeGo();
      setUserData(profile);
      localStorage.setItem('spd-user', JSON.stringify(profile));
      await loadAkademik(true).catch(() => undefined);
    } catch {
      // Biarkan data lokal apa adanya bila backend tidak merespons.
    }
  }, [userData?.id]);
  const toast = useCallback((msg: string, type: ToastT['type'] = 'ok') => {
    const id = Date.now() + Math.random(); setToasts((t) => [...t, { id, msg, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])
  const icons = { ok: <CheckCircle2 className="text-ok" size={20} />, err: <XCircle className="text-danger" size={20} />, info: <Info className="text-accent" size={20} />, warn: <AlertTriangle className="text-warn" size={20} /> }
  return (
    <C.Provider value={{ role, userData, login, logout, toast, confirm: setConf, notifs, markRead: (id) => setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x))), markAll: () => setNotifs((n) => n.map((x) => ({ ...x, read: true }))), refreshUser }}>
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
