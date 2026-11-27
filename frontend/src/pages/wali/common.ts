import { kelasById, myKelasId, studentsOf, useData, type Kelas, type Siswa } from '@/lib/data'

// Data wali kelas dibaca langsung dari snapshot bootstrap: server sudah
// mempersempit kelas perwalian, siswa, dan penawaran kelas sesuai peran.

export const statusOf = (s: Siswa) => (s.risiko ? 'Berisiko' : s.hadir < 80 || s.rata < 75 ? 'Waspada' : 'Aman')

/** ID kelas perwalian pengguna aktif; string kosong bila belum ada. */
export const waliKelasId = (): string => myKelasId()

export type WaliData = {
  siswa: Siswa[]
  kelasInfo: Kelas | null
  kelasId: string
  loading: boolean
}

export const useWaliData = (): WaliData => {
  // Berlangganan snapshot agar render ulang setelah data termuat.
  useData()
  const kelasId = waliKelasId()
  const kelasInfo = kelasId ? kelasById(kelasId) : null
  return { siswa: kelasId ? studentsOf(kelasId) : [], kelasInfo, kelasId, loading: false }
}
