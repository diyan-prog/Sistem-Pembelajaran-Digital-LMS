import { useNavigate } from 'react-router-dom'
import { ChevronDown, Crown, HelpCircle, ImageIcon, LogOut, Settings, UserCog } from 'lucide-react'
import { Avatar, Dropdown, cn } from '@/components/ui'
import { ROLES, toRole } from '@/lib/roles'
import { useApp } from '@/context'

export function UserMenu({ dark = true }: { dark?: boolean }) {
  const { userData, logout } = useApp(); 
  const name = userData?.full_name || userData?.nama_lengkap || 'User';
  const cfg = ROLES[toRole(userData?.role)] || ROLES.tu;
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
