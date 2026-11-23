import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { StatusBadge, cn } from '@/components/ui'
import { offeringById, offeringTitle, type Tugas } from '@/data'
import { shortBatas } from './deadline'

const tugasIcon = (s: string) => s === 'Dinilai' ? 'bg-primary-light text-primary-dark' : s === 'Terlambat' ? 'bg-orange-100 text-orange-700' : s === 'Dikumpulkan' ? 'bg-blue-100 text-accent' : 'bg-gray-100 text-muted'

export function TugasRow({ t }: { t: Tugas }) {
  const o = offeringById(t.off)
  return <Link to={`/siswa/tugas/${t.id}`} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50 border-b border-line last:border-0"><span className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', tugasIcon(t.status))}><ClipboardList size={20} /></span><div className="flex-1 min-w-[200px]"><div className="font-bold">{t.judul}</div><div className="text-xs text-muted uppercase mt-0.5">{offeringTitle(o)}</div></div><div className="text-sm text-muted w-52">{shortBatas(t.batas)}</div><StatusBadge s={t.status} /><div className="w-16 text-right font-extrabold">{t.nilai ?? '-'}</div></Link>
}
