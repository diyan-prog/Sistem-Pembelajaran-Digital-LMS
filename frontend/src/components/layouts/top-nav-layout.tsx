import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, HelpCircle, Menu as MenuIcon, X } from 'lucide-react'
import { IconBtn, cn } from '@/components/ui'
import { ROLES } from '@/lib/roles'
import { useApp } from '@/context'
import { Logo } from './logo'
import { Page } from './page'
import { NotifMenu } from './notif-menu'
import { UserMenu } from './user-menu'
import { KalenderModal } from './kalender-modal'
import { Chatbot } from '@/components/chatbot/Chatbot'

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
