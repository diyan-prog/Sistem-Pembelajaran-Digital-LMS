import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Crown, GraduationCap, HelpCircle, ImageIcon, LogOut, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Settings, UserCog, BookMarked, X, ChevronUp, Info, ClipboardList, Award, FileText, CheckCircle2 } from 'lucide-react'
import { Avatar, Badge, Dropdown, IconBtn, Modal, PageSkeleton, cn } from '@/components/ui'
import { ROLES, SIDE_GROUPS, type Role } from '@/lib/roles'
import { useApp } from '@/context'
import { kalender } from '@/data'
import { Chatbot } from '@/components/Chatbot'
import { HeroBannerOmbak } from '@/components/ui'

export const Logo = ({ size = 44 }: { size?: number }) => (
  <span className="rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ width: size, height: size }}>
    <img src={`${import.meta.env.BASE_URL}SMK_Negeri_2_Indramayu.png`} alt="Logo SMKN 2 Indramayu" className="w-[85%] h-[85%] object-contain" />
  </span>
)

const seen = new Set<string>()
function Page() {
  const { pathname } = useLocation()
  const [ready, setReady] = useState(pathname)
  const loading = !seen.has(pathname) && ready !== pathname
  useEffect(() => {
    window.scrollTo(0, 0)
    if (seen.has(pathname)) return
    const t = setTimeout(() => { seen.add(pathname); setReady(pathname) }, 450)
    return () => clearTimeout(t)
  }, [pathname])
  return loading ? <PageSkeleton /> : <div key={pathname} className="fade"><Outlet /></div>
}

export function NotifMenu() {
  const { notifs, markRead, markAll, role } = useApp(); const nav = useNavigate(); const unread = notifs.filter((n) => !n.read).length
  const ico = (k: string) => k === 'tugas' ? <ClipboardList size={16} /> : k === 'kuis' ? <BookMarked size={16} /> : k === 'nilai' ? <Award size={16} /> : k === 'materi' ? <FileText size={16} /> : k === 'hadir' ? <CheckCircle2 size={16} /> : <Info size={16} />
  return (
    <Dropdown trigger={() => <button aria-label={`Notifikasi, ${unread} belum dibaca`} className="relative w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center text-white"><Bell size={21} />{unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[--color-navbar-notif] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[--color-navbar-bg]">{unread}</span>}</button>} className="w-[380px] max-w-[92vw] text-ink !p-0 overflow-hidden">
      {(close) => (<div className="text-ink"><div className="flex items-center justify-between px-5 py-3 border-b border-line"><b>Notifikasi</b><button className="text-xs font-bold text-accent" onClick={markAll}>Tandai semua dibaca</button></div>
        <ul>{notifs.slice(0, 5).map((n) => <li key={n.id}><button onClick={() => { markRead(n.id); close(); nav(`${ROLES[role!].base}/notifikasi`) }} className={cn('w-full flex gap-3 px-5 py-3 text-left hover:bg-gray-50', !n.read && 'bg-primary-light/50')}><span className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center shrink-0">{ico(n.ikon)}</span><span className="flex-1 min-w-0"><span className={cn('block text-sm leading-snug', !n.read && 'font-bold')}>{n.judul}</span><span className="text-xs text-muted">{n.grup}, {n.waktu}</span></span>{!n.read && <span className="w-2 h-2 rounded-full bg-accent mt-2" />}</button></li>)}</ul>
        <Link onClick={close} to={`${ROLES[role!].base}/notifikasi`} className="block text-center py-3 text-sm font-bold text-primary-dark border-t border-line hover:bg-gray-50">Lihat semua</Link></div>)}
    </Dropdown>
  )
}

export function UserMenu({ dark = true }: { dark?: boolean }) {
  const { userData, logout } = useApp(); 
  const name = userData?.full_name || userData?.nama_lengkap || 'User';
  const cfg = ROLES[userData?.role?.toLowerCase() as Role] || ROLES.tu;
  const nav = useNavigate()
  const items = [{ l: 'Kelola Akun', i: <UserCog size={18} />, to: 'akun' }, ...(userData?.role?.toLowerCase() === 'guru' ? [{ l: 'Media Library', i: <ImageIcon size={18} />, to: 'media' }] : []), { l: 'User Guide', i: <HelpCircle size={18} />, to: 'panduan' }, { l: 'Pengaturan', i: <Settings size={18} />, to: 'pengaturan' }]
  return (
    <Dropdown trigger={(o) => <button aria-label="Menu akun" aria-expanded={o} className={cn('flex items-center gap-3 rounded-full pl-1 pr-2 py-1 text-left', dark ? 'hover:bg-white/15 text-white' : 'hover:bg-gray-100 text-ink')}>
      <Avatar name={name} size={40} className="ring-2 ring-white/70" /><span className="hidden xl:block leading-tight max-w-[150px]"><span className="block font-bold text-sm truncate">{name.split(',')[0]}</span><span className={cn('block text-xs', dark ? 'text-white/85' : 'text-muted')}>{cfg.label}</span></span><ChevronDown size={16} className={cn('transition', o && 'rotate-180')} /></button>} className="w-72 p-2 text-ink">
      {(close) => (<div>
        <div className="flex flex-col items-center pt-3 pb-3"><Avatar name={name} size={56} /><div className="font-bold mt-2 text-sm text-center px-3">{name}</div><span className="mt-2 inline-flex items-center gap-1.5 bg-primary-light text-primary-dark text-xs font-extrabold tracking-wide px-3 py-1.5 rounded-full"><Crown size={14} className="fill-primary/30" />{cfg.chip}</span></div>
        <div className="border-t border-line my-1" />
        {items.map((m) => <button key={m.l} onClick={() => { close(); nav(`${cfg.base}/${m.to}`) }} className="w-full flex items-center gap-3 h-11 px-4 rounded-xl font-semibold text-sm hover:bg-gray-50 text-left"><span className="text-muted">{m.i}</span>{m.l}</button>)}
        <div className="border-t border-line my-1" />
        <button onClick={() => { close(); logout(); nav('/login') }} className="w-full flex items-center gap-3 h-11 px-4 rounded-xl font-bold text-sm text-danger hover:bg-red-50 text-left"><LogOut size={18} />Keluar</button></div>)}
    </Dropdown>
  )
}

export function KalenderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="Kalender Akademik 2026/2027"><ul className="space-y-2">{kalender.map((k) => <li key={k.judul} className="flex items-center gap-3 border border-line rounded-xl p-3"><span className="w-10 h-10 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center"><CalendarDays size={18} /></span><div className="flex-1"><div className="font-bold text-sm">{k.judul}</div><div className="text-xs text-muted">{new Date(k.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}{k.akhir !== k.tgl && ` - ${new Date(k.akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}</div></div><Badge tone={k.jenis === 'Libur' ? 'red' : k.jenis === 'Kegiatan' ? 'blue' : 'amber'}>{k.jenis}</Badge></li>)}</ul></Modal>
}

export function RoleGate({ role }: { role: Role }) { const a = useApp(); return a.role === role ? <Outlet /> : <Navigate to={a.role ? ROLES[a.role].base + (a.role === 'tu' ? '/dashboard' : '/beranda') : '/login'} replace /> }

export function TopNavLayout() {
  const { role } = useApp(); const cfg = ROLES[role!]; const { pathname } = useLocation(); const nav = useNavigate()
  const [mob, setMob] = useState(false); const [cal, setCal] = useState(false)
  useEffect(() => setMob(false), [pathname])
  const cls = ({ isActive }: { isActive: boolean }) => cn('relative flex flex-col xl:flex-row items-center gap-0.5 xl:gap-2 px-3.5 py-1.5 rounded-xl text-white text-[13px] xl:text-sm transition-colors whitespace-nowrap', isActive ? 'bg-[--color-navbar-active] font-extrabold after:absolute after:left-3 after:right-3 after:-bottom-1.5 after:h-[3px] after:bg-white after:rounded-full' : 'font-semibold opacity-80 hover:bg-[--color-navbar-inactive-hover]')
  return (
    <div className="min-h-screen">
      <header className="wave-bg sticky top-0 z-50 h-[72px] shadow-md no-print">
        <div className="h-full max-w-[1480px] mx-auto px-4 lg:px-6 flex items-center gap-4">
          <button className="lg:hidden text-white p-2 -ml-2" aria-label="Menu" onClick={() => setMob(!mob)}>{mob ? <X /> : <MenuIcon />}</button>
          <Link to={`${cfg.base}/beranda`} className="flex items-center gap-3 text-white shrink-0"><Logo /><span className="leading-tight hidden sm:block"><span className="block font-extrabold text-[15px]">SMK Negeri 2 Indramayu</span><span className="block text-xs text-white/90">Sistem Pembelajaran Digital</span></span></Link>
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1" aria-label="Menu utama">{cfg.menus.map((m) => <NavLink key={m.to} to={m.to} className={cls}><m.icon size={19} />{m.label}</NavLink>)}</nav>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-1">
            <IconBtn label="Bantuan" onClick={() => nav(`${cfg.base}/panduan`)} className="!text-white hover:!bg-white/15 !w-10 !h-10 hidden sm:flex"><HelpCircle size={21} /></IconBtn>
            <IconBtn label="Kalender" onClick={() => (role === 'siswa' || role === 'guru' ? nav(`${cfg.base}/jadwal`) : setCal(true))} className="!text-white hover:!bg-white/15 !w-10 !h-10 hidden sm:flex"><CalendarDays size={21} /></IconBtn>
            <NotifMenu /><UserMenu />
          </div>
        </div>
      </header>
      {mob && <div className="lg:hidden fixed top-[72px] inset-x-0 z-40 bg-[--color-navbar-bg] p-3 shadow-lg pop border-t border-[--color-navbar-border]">{cfg.menus.map((m) => <NavLink key={m.to} to={m.to} className={({ isActive }) => cn('flex items-center gap-3 h-12 px-4 rounded-xl text-[--color-navbar-inactive] font-semibold', isActive && 'bg-[--color-navbar-active] font-extrabold')}><m.icon size={20} />{m.label}</NavLink>)}</div>}
      {/* HeroBannerOmbak removed */}
      <main className="max-w-[1320px] mx-auto px-4 lg:px-6 py-8"><Page /></main>
      <KalenderModal open={cal} onClose={() => setCal(false)} />
      <Chatbot />
    </div>
  )
}

export function SidebarLayout() {
  const { pathname } = useLocation();
  const { role, userData } = useApp();
  const cfg = role ? ROLES[role] : ROLES.tu;
  const [col, setCol] = useState(false); const [mob, setMob] = useState(false)
  useEffect(() => setMob(false), [pathname])
  const current = SIDE_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))).find((i) => pathname.startsWith(i.to))
  const side = (
    <aside className={cn('bg-white border-r border-line h-full flex flex-col transition-all duration-200', col ? 'w-[76px]' : 'w-[260px]')}>
      <div className="h-[72px] flex items-center gap-3 px-4 border-b border-line shrink-0"><Logo size={40} />{!col && <div className="leading-tight"><div className="font-extrabold text-sm">SMK Negeri 2</div><div className="text-xs text-muted">Indramayu • Admin</div></div>}</div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Menu Tata Usaha">
        {SIDE_GROUPS.map((g, i) => <div key={i}>{g.title && !col && <div className="text-[11px] font-extrabold tracking-wider text-muted uppercase px-3 mb-1.5">{g.title}</div>}{g.title && col && <div className="border-t border-line mx-2 mb-2" />}
          {g.items.map((m) => <NavLink key={m.to} to={m.to} title={m.label} className={({ isActive }) => cn('flex items-center gap-3 h-11 rounded-full px-3.5 text-sm mb-0.5 transition-colors', col && 'justify-center px-0', isActive ? 'bg-primary text-white font-bold shadow' : 'text-ink font-semibold hover:bg-gray-100')}><m.icon size={19} className="shrink-0" />{!col && <span className="truncate">{m.label}</span>}</NavLink>)}</div>)}
      </nav>
      <button onClick={() => setCol(!col)} className="hidden lg:flex items-center gap-3 h-12 px-6 border-t border-line text-muted hover:text-ink font-semibold text-sm">{col ? <PanelLeftOpen size={19} /> : <><PanelLeftClose size={19} />Ciutkan menu</>}</button>
    </aside>
  )
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block sticky top-0 h-screen shrink-0 no-print">{side}</div>
      {mob && <div className="lg:hidden fixed inset-0 z-[60] flex fade"><div className="h-full">{side}</div><div className="flex-1 bg-black/40" onClick={() => setMob(false)} /></div>}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-line flex items-center gap-3 px-4 lg:px-8 no-print">
          <button className="lg:hidden p-2 -ml-2" aria-label="Menu" onClick={() => setMob(true)}><MenuIcon /></button>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted"><span>Tata Usaha</span>{current?.group && <><ChevronRight size={14} /><span>{current.group}</span></>}<ChevronRight size={14} /><span className="font-bold text-ink">{current?.label ?? 'Halaman'}</span></nav>
          <div className="flex-1" /><NotifMenuDark /><UserMenu dark={false} />
        </header>
        <main className="max-w-[1320px] mx-auto px-4 lg:px-8 py-8"><Page /></main>
      </div>
      <span className="hidden">{cfg.label}</span>
      <Chatbot />
    </div>
  )
}
function NotifMenuDark() { return <div className="bg-[--color-navbar-bg] rounded-full"><NotifMenu /></div> }
export { GraduationCap, ChevronLeft }
