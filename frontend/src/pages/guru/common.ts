import { currentUserId, guruOfferings, myTugas as myTugasList, subSiswa, tugas } from '@/lib/data'

/** Penawaran kelas milik guru yang sedang login. */
export const mine = () => guruOfferings(currentUserId())
export const waiting = (tid: string) => subSiswa(tid).filter((s) => s.status === 'Dikumpulkan' || s.status === 'Terlambat').length
export const myTugas = () => {
  const offs = mine()
  const list = myTugasList()
  // Snapshot sudah dipersempit per peran; saring lagi agar tugas milik guru lain tidak ikut.
  if (!offs.length) return list
  return tugas.filter((t) => offs.some((o) => o.id === t.off))
}
