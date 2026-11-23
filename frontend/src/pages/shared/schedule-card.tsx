import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCheck, Clock, MapPin } from 'lucide-react'
import { Btn, Card, Empty, cn } from '@/components/ui'
import { useRole } from '@/context'
import { HARI_S, TODAY, fmtTgl, offeringTitle, scheduleOf, weekDays, type Offering } from '@/data'

export function ScheduleCard({ offs, mode, loading }: { offs: Offering[]; mode: 'siswa' | 'guru'; loading?: boolean }) {
  const days = weekDays(); const [sel, setSel] = useState(new Date().getDay()); const nav = useNavigate(); const { cfg } = useRole()
  const list = scheduleOf(offs, sel); const selDate = days.find((d) => d.getDay() === sel) || new Date()
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <Card className="min-h-[300px]">
      <div className="flex items-start justify-between gap-2 mb-4"><h3 className="text-lg font-bold whitespace-nowrap">Jadwal Minggu Ini</h3><span className="text-xs text-muted text-right leading-tight pt-1.5 whitespace-nowrap">Hari ini: <b className="text-ink">{todayStr}</b></span></div>
      {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between gap-1">{[1,2,3,4,5,6,7].map(i => <div key={i} className="w-10 h-14 bg-gray-100 rounded-2xl" />)}</div>
            <div className="h-20 bg-gray-100 rounded-2xl" />
          </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Pilih hari">
            {days.map((d) => { const on = d.getDay() === sel; const today = d.toDateString() === TODAY.toDateString(); const has = scheduleOf(offs, d.getDay()).length > 0
              return <button key={d.getTime()} role="tab" aria-selected={on} onClick={() => setSel(d.getDay())} className={cn('flex flex-col items-center py-2 rounded-2xl gap-1 transition-colors', on && !today && 'bg-gray-100')}>
                <span className={cn('text-xs font-bold', today ? 'text-primary-dark' : 'text-muted')}>{HARI_S[d.getDay()]}</span>
                <span className={cn('w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold', today ? 'bg-primary text-white' : 'text-ink', on && !today && 'ring-2 ring-primary/40')}>{d.getDate()}</span>
                <span className={cn('w-1.5 h-1.5 rounded-full', has ? 'bg-primary' : 'bg-transparent')} /></button> })}
          </div>
          <div className="mt-4 text-sm font-bold text-muted mb-2">{fmtTgl(selDate)}</div>
          {list.length === 0 ? <Empty title="Tidak ada jadwal" text="Tidak ada kelas pada hari ini." /> : (
            <ul className="space-y-3">{list.map(({ o, s }, i) => (
              <li key={i} className="border border-line rounded-2xl p-4 hover:bg-gray-50 transition">
                <Link to={`${cfg.base}/kelas/${o.id}`} className="font-extrabold text-sm uppercase leading-snug hover:text-primary-dark block">{offeringTitle(o)}</Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13px] text-muted">
                  <span className="flex items-center gap-1.5"><BookOpen size={15} />Sesi {s.sesi}</span><span className="flex items-center gap-1.5"><Clock size={15} />{s.mulai} - {s.selesai}</span><span className="flex items-center gap-1.5"><MapPin size={15} />{s.mode} - {s.ruang}</span></div>
                {mode === 'guru' && <Btn className="mt-3 !h-9" icon={<CheckCheck size={16} />} onClick={() => nav(`/guru/presensi/${o.id}/sesi/${s.sesi}`)}>Mulai Presensi</Btn>}
              </li>))}</ul>)}
          <Link to={`${cfg.base}/jadwal`} className="block text-center text-sm font-bold text-accent mt-4 hover:underline">Lihat jadwal lengkap</Link>
        </>
      )}
    </Card>
  )
}
