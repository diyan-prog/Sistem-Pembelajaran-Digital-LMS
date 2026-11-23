import type { ReactNode } from 'react'
import { cn } from './cn'

const tones: Record<string, string> = {
  green: 'bg-green-100 text-green-800', blue: 'bg-blue-100 text-blue-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', gray: 'bg-gray-200 text-gray-700', orange: 'bg-orange-100 text-orange-800', purple: 'bg-purple-100 text-purple-800',
}
export const Badge = ({ tone = 'gray', children, className }: { tone?: string; children: ReactNode; className?: string }) => <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap', tones[tone], className)}>{children}</span>
const statusTone: Record<string, string> = { Hadir: 'green', Izin: 'blue', Sakit: 'amber', Alpa: 'red', 'Belum Dikumpulkan': 'gray', Dikumpulkan: 'blue', Terlambat: 'orange', Dinilai: 'green', Draft: 'gray', Aktif: 'green', Ditutup: 'red', Tersedia: 'green', Selesai: 'blue', 'Belum Dibuka': 'gray', Nonaktif: 'gray', Cuti: 'amber', Berisiko: 'red', Aman: 'green', Waspada: 'amber', Berlangsung: 'green', Terjadwal: 'blue', Dibuka: 'green' }
export const StatusBadge = ({ s }: { s: string }) => <Badge tone={statusTone[s] ?? 'gray'}>{s}</Badge>
