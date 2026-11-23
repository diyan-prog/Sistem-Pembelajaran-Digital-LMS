import { useState } from 'react'
import { Award, BookMarked, CheckCheck, CheckCircle2, ClipboardList, FileText, Info } from 'lucide-react'
import { Badge, Btn, Card, Chips, Empty, PageHeader, cn, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'

// ---------- Notifikasi ----------
export function NotifikasiPage() {
  const { notifs, markRead, markAll, toast } = useApp(); const [f, setF] = useState('Semua')
  const jenis = ['Semua', 'Belum Dibaca', ...new Set(notifs.map((n) => n.jenis))]
  const list = notifs.filter((n) => f === 'Semua' || (f === 'Belum Dibaca' ? !n.read : n.jenis === f))
  const icon = (k: string) => k === 'tugas' ? <ClipboardList size={18} /> : k === 'kuis' ? <BookMarked size={18} /> : k === 'nilai' ? <Award size={18} /> : k === 'materi' ? <FileText size={18} /> : k === 'hadir' ? <CheckCircle2 size={18} /> : <Info size={18} />
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Notifikasi' })} title="Notifikasi" subtitle={`${notifs.filter((n) => !n.read).length} notifikasi belum dibaca`} actions={<Btn variant="outline" icon={<CheckCheck size={18} />} onClick={() => { markAll(); toast('Semua notifikasi ditandai sudah dibaca') }}>Tandai Semua Dibaca</Btn>} />
      <div className="mb-5"><Chips value={f} onChange={setF} options={jenis.map((k) => ({ k, l: k }))} /></div>
      {list.length === 0 ? <Card><Empty title="Tidak ada notifikasi" text="Notifikasi baru akan muncul di sini." /></Card> : ['Hari Ini', 'Kemarin'].map((g) => { const items = list.filter((n) => n.grup === g); if (!items.length) return null
        return <div key={g} className="mb-6"><h3 className="font-bold text-muted text-sm uppercase tracking-wide mb-3">{g}</h3><Card pad={false} className="divide-y divide-line overflow-hidden">{items.map((n) => <button key={n.id} onClick={() => markRead(n.id)} className={cn('w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50', !n.read && 'bg-primary-light/50')}><span className="w-10 h-10 rounded-full bg-primary-light text-primary-dark flex items-center justify-center shrink-0">{icon(n.ikon)}</span><span className="flex-1"><span className={cn('block', !n.read && 'font-bold')}>{n.judul}</span><span className="text-xs text-muted">{n.jenis} â€¢ {n.waktu}</span></span>{!n.read ? <Badge tone="blue">Baru</Badge> : <CheckCheck size={16} className="text-muted" />}</button>)}</Card></div> })}</div>
  )
}
