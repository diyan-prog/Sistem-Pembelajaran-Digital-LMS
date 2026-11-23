import { useApp } from '@/context'
import { Badge } from './badge'

export function Readonly() { const { role } = useApp(); return role === 'wali' || role === 'kepsek' ? <Badge tone="blue">Mode hanya-lihat</Badge> : null }
export const isRO = (r: string | null) => r === 'wali' || r === 'kepsek'
