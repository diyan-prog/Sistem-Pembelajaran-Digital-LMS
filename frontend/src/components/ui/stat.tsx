import type { ReactNode } from 'react'
import { Card } from './card'
import { cn } from './cn'

export const Stat = ({ icon, label, value, trend, tone = 'green', sub }: { icon: ReactNode; label: string; value: ReactNode; trend?: string; tone?: 'green' | 'blue' | 'amber' | 'red'; sub?: string }) => (
  <Card hover className="!p-5"><div className="flex items-start justify-between"><div><div className="text-sm text-muted font-semibold">{label}</div><div className="text-[28px] font-extrabold mt-1 leading-tight">{value}</div>{sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}</div>
    <span className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', { green: 'bg-primary-light text-primary-dark', blue: 'bg-blue-100 text-accent', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-danger' }[tone])}>{icon}</span></div>
    {trend && <div className={cn('text-xs font-bold mt-2', trend.startsWith('-') ? 'text-danger' : 'text-ok')}>{trend.startsWith('-') ? '▼' : '▲'} {trend.replace(/^[+-]/, '')} <span className="text-muted font-normal">dari bulan lalu</span></div>}</Card>
)
