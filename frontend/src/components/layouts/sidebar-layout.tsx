import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/components/ui'
import { ROLES, SIDE_GROUPS } from '@/lib/roles'
import { useApp } from '@/context'
import { Logo } from './logo'
import { Page } from './page'
import { NotifMenu } from './notif-menu'
import { UserMenu } from './user-menu'
import { Chatbot } from '@/components/chatbot/Chatbot'

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
