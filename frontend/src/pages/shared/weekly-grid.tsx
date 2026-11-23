import { useNavigate } from 'react-router-dom'
import { cn } from '@/components/ui'
import { useRole } from '@/context'
import { HARI, TODAY, subjectById, type Offering, type Slot } from '@/data'

const hr = (t: string) => { const [h, m] = t.split('.').map(Number); return h + m / 60 }
export function WeeklyGrid({ blocks }: { blocks: { o: Offering; s: Slot }[] }) {
  const hours = Array.from({ length: 9 }, (_, i) => 7 + i); const H = 60; const { cfg } = useRole(); const nav = useNavigate()
  return (
    <div className="overflow-x-auto"><div className="min-w-[860px]">
      <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}><div />{[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className={cn('text-center py-2 font-bold text-sm', d === TODAY.getDay() && 'text-primary-dark')}>{HARI[d]}</div>)}</div>
      <div className="grid relative" style={{ gridTemplateColumns: '56px repeat(6, 1fr)', height: hours.length * H }}>
        <div>{hours.map((h) => <div key={h} className="text-xs text-muted pr-2 text-right" style={{ height: H }}>{String(h).padStart(2, '0')}.00</div>)}</div>
        {[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className={cn('relative border-l border-line', d === TODAY.getDay() && 'bg-primary-light/40')}>
          {hours.map((h) => <div key={h} className="border-t border-line/70" style={{ height: H }} />)}
          {blocks.filter((b) => b.s.hari === d).map(({ o, s }, i) => { const sub = subjectById(o.subjectId)
            return <button key={i} onClick={() => nav(`${cfg.base}/kelas/${o.id}`)} className="absolute left-1 right-1 rounded-xl p-2 text-left text-white overflow-hidden hover:brightness-95 shadow-soft" style={{ top: (hr(s.mulai) - 7) * H + 1, height: (hr(s.selesai) - hr(s.mulai)) * H - 3, background: sub.warna }}>
              <div className="text-xs font-extrabold leading-tight">{sub.nama}</div><div className="text-[11px] opacity-90">{o.kode} â€¢ {s.ruang}</div><div className="text-[11px] opacity-90">{s.mulai}-{s.selesai}</div></button> })}</div>)}
      </div></div></div>
  )
}
