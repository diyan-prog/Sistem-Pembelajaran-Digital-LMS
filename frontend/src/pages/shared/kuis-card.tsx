import { Clock, HelpCircle, Play, Repeat, Timer, Trophy } from 'lucide-react'
import { Btn, Card, StatusBadge } from '@/components/ui'
import { fmtBatas, fmtTglPendek, offeringById, offeringTitle, type Kuis } from '@/data'

export function KuisCard({ k, base = '/siswa' }: { k: Kuis; base?: string }) {
  const o = offeringById(k.off); const can = k.status === 'Tersedia'
  return <Card hover className="!p-5 flex flex-col" onClick={() => {}}><div className="flex items-start justify-between gap-2"><div><h4 className="font-bold text-[17px]">{k.judul}</h4><p className="text-xs text-muted uppercase mt-0.5">{offeringTitle(o)}</p></div><StatusBadge s={k.status} /></div>
    <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm text-muted"><span className="flex items-center gap-1.5"><Timer size={15} />{k.durasi} menit</span><span className="flex items-center gap-1.5"><HelpCircle size={15} />{k.soal} soal</span><span className="flex items-center gap-1.5"><Repeat size={15} />{k.dipakai}/{k.percobaan} percobaan</span><span className="flex items-center gap-1.5">{k.skor != null ? <><Trophy size={15} />Skor {k.skor}</> : null}</span></div>
    <div className="text-xs text-muted mt-3 flex items-center gap-1.5"><Clock size={14} />Buka {fmtTglPendek(new Date(k.buka))} â€¢ Tutup {fmtBatas(k.tutup).split(', ').slice(1).join(', ')}</div>
    <div className="mt-4 pt-4 border-t border-line flex gap-2">{can ? <Btn to={`${base}/kuis/${k.id}`} icon={<Play size={16} />}>Mulai Kuis</Btn> : k.status === 'Selesai' ? <Btn variant="outline" to={`${base}/kuis/${k.id}/hasil`}>Lihat Hasil</Btn> : <Btn disabled>{k.status === 'Belum Dibuka' ? 'Belum Dibuka' : 'Ditutup'}</Btn>}</div></Card>
}
