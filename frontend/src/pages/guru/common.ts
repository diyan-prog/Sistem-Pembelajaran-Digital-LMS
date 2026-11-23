import { guruOfferings, subSiswa, tugas } from '@/mocks'

export const mine = () => guruOfferings('t1')
export const waiting = (tid: string) => subSiswa(tid).filter((s) => s.status === 'Dikumpulkan' || s.status === 'Terlambat').length
export const myTugas = () => tugas.filter((t) => mine().some((o) => o.id === t.off))
