import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Info, User } from 'lucide-react'
import { fmtSlot, offeringTitle, pct, subjectById, jurusanNama, kelasById, teacherById, useData, type Offering } from '@/lib/data'
import { Card } from './card'
import { Progress } from './progress'

export function ClassCard({ o, mode, to }: { o: Offering; mode: 'siswa' | 'guru'; to: string }) {
  useData()
  const nav = useNavigate(); const p = pct(o); const s = subjectById(o.subjectId); const k = kelasById(o.kelasId); const g = teacherById(o.guru)
  const tone = p >= 75 ? 'blue' : p >= 50 ? 'amber' : 'red'
  const slot = o.jadwal[0]
  return (
    <Card hover onClick={() => nav(to)} className="flex flex-col !p-5 group" >
      <h4 className="font-extrabold text-[17px] leading-snug uppercase group-hover:text-primary-dark">{offeringTitle(o)}</h4>
      <p className="text-sm font-semibold mt-1">{jurusanNama(k.jurusan)}</p>
      <p className="text-sm italic text-muted">{o.semester}</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2"><User size={16} className="text-muted shrink-0" /><span>{g.sapaan}</span>{o.co.length > 0 && <Link onClick={(e) => e.stopPropagation()} to={to} className="underline text-accent">dan {o.co.length} lainnya</Link>}</div>
        <div className="flex items-center gap-2"><Calendar size={16} className="text-muted shrink-0" /><span>{slot ? fmtSlot(slot) : 'Jadwal belum diatur'}</span></div>
      </div>
      <div className="border-t border-line mt-4 pt-3">
        {mode === 'siswa' ? (<>
          <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-semibold">Kehadiran: {o.hadir} dari {o.done} sesi <span title="Jumlah sesi yang kamu hadiri dibanding sesi yang sudah berlangsung"><Info size={14} className="text-muted" /></span></span><span className="font-extrabold">{p}%</span></div>
          <Progress value={p} tone={tone} className="mt-2" /></>) : (<>
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">Pertemuan: {o.done} dari {o.total} sesi</span><span className="font-extrabold">Rata-rata nilai {o.rata}</span></div>
          <Progress value={o.total ? Math.round((o.done / o.total) * 100) : 0} className="mt-2" /></>)}
      </div>
      <span className="hidden">{s.nama}</span>
    </Card>
  )
}
