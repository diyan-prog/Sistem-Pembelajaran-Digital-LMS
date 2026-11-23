import { Link, useNavigate } from 'react-router-dom'
import { Award, Bell, BookMarked, CheckCircle2, ClipboardList, FileText, Info } from 'lucide-react'
import { Dropdown, cn } from '@/components/ui'
import { ROLES } from '@/lib/roles'
import { useApp } from '@/context'

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
