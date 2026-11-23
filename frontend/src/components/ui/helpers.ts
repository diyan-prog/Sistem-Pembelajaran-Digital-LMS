import { useEffect, useState } from 'react'
import { SEMESTER } from '@/data'

export const SEM = SEMESTER
const BOOT = Date.now()
export const simNow = () => new Date(2026, 9, 29, 9, 30).getTime() + (Date.now() - BOOT)
export function useCountdown(target: Date) {
  const [now, setNow] = useState(simNow()); useEffect(() => { const i = setInterval(() => setNow(simNow()), 1000); return () => clearInterval(i) }, [])
  const d = Math.max(0, target.getTime() - now); return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 }
}
export const download = (name: string, content = 'Data diekspor dari Sistem Pembelajaran Digital SMK Negeri 2 Indramayu') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content])); a.download = name; a.click() }
