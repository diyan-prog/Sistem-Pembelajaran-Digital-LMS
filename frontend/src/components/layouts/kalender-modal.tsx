import { CalendarDays } from 'lucide-react'
import { Badge, Modal } from '@/components/ui'
import { kalender } from '@/data'

export function KalenderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="Kalender Akademik 2026/2027"><ul className="space-y-2">{kalender.map((k) => <li key={k.judul} className="flex items-center gap-3 border border-line rounded-xl p-3"><span className="w-10 h-10 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center"><CalendarDays size={18} /></span><div className="flex-1"><div className="font-bold text-sm">{k.judul}</div><div className="text-xs text-muted">{new Date(k.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}{k.akhir !== k.tgl && ` - ${new Date(k.akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}</div></div><Badge tone={k.jenis === 'Libur' ? 'red' : k.jenis === 'Kegiatan' ? 'blue' : 'amber'}>{k.jenis}</Badge></li>)}</ul></Modal>
}
