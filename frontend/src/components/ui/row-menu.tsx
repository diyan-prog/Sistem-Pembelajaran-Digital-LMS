import type { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { Dropdown } from './dropdown'
import { cn } from './cn'

export function RowMenu({ items }: { items: { l: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[] }) {
  return <Dropdown trigger={() => <button aria-label="Aksi baris" className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-muted"><MoreVertical size={18} /></button>} className="w-48 !rounded-2xl p-1.5">
    {(close) => items.map((i) => <button key={i.l} onClick={(e) => { e.stopPropagation(); close(); i.onClick() }} className={cn('w-full flex items-center gap-2.5 px-3 h-10 rounded-xl text-sm font-semibold hover:bg-gray-50 text-left', i.danger && 'text-danger hover:bg-red-50')}>{i.icon}{i.l}</button>)}</Dropdown>
}
