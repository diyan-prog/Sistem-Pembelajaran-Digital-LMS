import { derived, getSnapshot, type Row } from '@/lib/store'
import { lower, num, str, students, studentsOf, subjectById, teacherById, type Siswa } from './entities'
import { offerings, myTugas, myKuis } from './academic'

// Turunan statistik dari snapshot bootstrap. Tidak ada angka yang dikarang:
// bila data belum ada, nilai kembali nol sehingga tampilan menampilkan kosong.

const sum = (list: number[]): number => list.reduce((a, b) => a + b, 0)
const avg = (list: number[]): number => (list.length ? Math.round(sum(list) / list.length) : 0)

export const predikat = (n: number): string => (n >= 90 ? 'A' : n >= 80 ? 'B' : n >= 70 ? 'C' : 'D')

const nilaiDari = (rows: Row[], key: string): number[] =>
  rows.map((r) => (typeof r[key] === 'number' ? (r[key] as number) : Number.NaN)).filter((n) => Number.isFinite(n))

/** Nilai satu siswa per mata pelajaran pada kelasnya. */
export const nilaiSiswa = (sid: string) => {
  const snap = getSnapshot()
  const s = students().find((x) => x.id === sid)
  if (!s) return []
  const list = offerings().filter((o) => o.kelasId === s.kelasId)
  return list.map((o) => {
    const tugasIds = new Set(snap.tugas.filter((t) => str(t.id_pengampu) === o.id).map((t) => str(t.id_tugas)))
    const tugas = avg(nilaiDari(snap.pengumpulan.filter((p) => str(p.id_siswa) === sid && tugasIds.has(str(p.id_tugas))), 'nilai'))
    const kuisIds = new Set(snap.kuis.filter((k) => str(k.id_pengampu) === o.id).map((k) => str(k.id_kuis)))
    const kuis = avg(nilaiDari(snap.hasil_kuis.filter((h) => str(h.id_siswa) === sid && kuisIds.has(str(h.id_kuis))), 'nilai'))
    const parts = [tugas, kuis].filter((n) => n > 0)
    const rata = avg(parts)
    return { off: o, mapel: subjectById(o.subjectId).nama, tugas, kuis, uts: 0, uas: 0, rata, predikat: predikat(rata) }
  })
}

/** Rekap kehadiran satu siswa per mata pelajaran. */
export const absensiSiswa = (sid: string) => {
  const snap = getSnapshot()
  const s = students().find((x) => x.id === sid)
  if (!s) return []
  return offerings()
    .filter((o) => o.kelasId === s.kelasId)
    .map((o) => {
      const rows = snap.presensi.filter((p) => str(p.id_pengampu) === o.id && str(p.id_siswa) === sid)
      const hitung = (status: string) => rows.filter((p) => lower(p.status) === status).length
      const hadir = hitung('hadir')
      const izin = hitung('izin')
      const sakit = hitung('sakit')
      const alpa = hitung('alpa')
      const total = rows.length
      return { mapel: subjectById(o.subjectId).nama, hadir, izin, sakit, alpa, total, persen: total ? Math.round((hadir / total) * 100) : 0 }
    })
}

/** Matriks nilai seluruh siswa satu kelas pada satu penawaran. */
export const nilaiKelas = (kelasId: string, offId: string) => {
  const snap = getSnapshot()
  const tugasIds = new Set(snap.tugas.filter((t) => str(t.id_pengampu) === offId).map((t) => str(t.id_tugas)))
  const kuisIds = new Set(snap.kuis.filter((k) => str(k.id_pengampu) === offId).map((k) => str(k.id_kuis)))
  return studentsOf(kelasId).map((s: Siswa) => {
    const tugas = avg(nilaiDari(snap.pengumpulan.filter((p) => str(p.id_siswa) === s.id && tugasIds.has(str(p.id_tugas))), 'nilai'))
    const kuis = avg(nilaiDari(snap.hasil_kuis.filter((h) => str(h.id_siswa) === s.id && kuisIds.has(str(h.id_kuis))), 'nilai'))
    const parts = [tugas, kuis].filter((n) => n > 0)
    const akhir = avg(parts)
    return { id: s.id, siswa: s, tugas, kuis, uts: 0, uas: 0, akhir }
  })
}

/** Status kehadiran per pertemuan; dipakai tabel presensi guru. */
export const seedStat = (sid: string, pertemuan: number, _hadirPct?: number): 'H' | 'I' | 'S' | 'A' => {
  const snap = getSnapshot()
  const row = snap.presensi.find((p) => str(p.id_siswa) === sid && num(p.pertemuan_ke, -1) === pertemuan)
  const s = lower(row?.status)
  if (s === 'hadir') return 'H'
  if (s === 'izin') return 'I'
  if (s === 'sakit') return 'S'
  if (s === 'alpa') return 'A'
  return 'H'
}

export const kelasStat = (): { id: string; nama: string; hadir: number; nilai: number; siswa: number; berisiko: number; rank: number }[] =>
  derived('stats:kelas', () =>
    getSnapshot()
      .classes.map((k, i) => {
        const ss = students().filter((s) => s.kelasId === str(k.id))
        return {
          id: str(k.id),
          nama: str(k.name),
          hadir: avg(ss.map((s) => s.hadir)),
          nilai: avg(ss.map((s) => s.rata)),
          siswa: ss.length,
          berisiko: ss.filter((s) => s.risiko).length,
          rank: i,
        }
      })
      .sort((a, b) => a.nama.localeCompare(b.nama))
  )

export const distribusiNilai = (): { r: string; v: number }[] =>
  derived('stats:distribusi', () => {
    const ss = students()
    const bucket = (min: number, max: number) => ss.filter((s) => s.rata >= min && s.rata <= max).length
    return [
      { r: '<60', v: ss.filter((s) => s.rata > 0 && s.rata < 60).length },
      { r: '60-69', v: bucket(60, 69) },
      { r: '70-79', v: bucket(70, 79) },
      { r: '80-89', v: bucket(80, 89) },
      { r: '90-100', v: bucket(90, 100) },
    ]
  })

const BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** Persentase kehadiran per bulan dari tabel presensi. */
export const bulanHadir = (): { b: string; v: number }[] =>
  derived('stats:bulanHadir', () => {
    const per = new Map<string, { total: number; hadir: number }>()
    for (const p of getSnapshot().presensi) {
      const tgl = str(p.tanggal)
      if (!tgl) continue
      const d = new Date(tgl)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const cur = per.get(key) ?? { total: 0, hadir: 0 }
      cur.total += 1
      if (lower(p.status) === 'hadir') cur.hadir += 1
      per.set(key, cur)
    }
    return [...per.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, v]) => ({ b: BULAN_S[Number(key.split('-')[1])], v: v.total ? Math.round((v.hadir / v.total) * 100) : 0 }))
  })

/** Rata-rata nilai seluruh siswa per bulan (dari tanggal pengumpulan tugas). */
export const trenNilaiBulan = (): { b: string; v: number }[] =>
  derived('stats:trenNilai', () => {
    const per = new Map<string, number[]>()
    for (const p of getSnapshot().pengumpulan) {
      if (typeof p.nilai !== 'number') continue
      const tgl = str(p.waktu_kumpul ?? p.created_at)
      if (!tgl) continue
      const d = new Date(tgl)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${d.getMonth()}`
      ;(per.get(key) ?? per.set(key, []).get(key)!).push(p.nilai as number)
    }
    return [...per.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, v]) => ({ b: BULAN_S[Number(key.split('-')[1])], v: avg(v) }))
  })

export type KeaktifanGuru = ReturnType<typeof teacherById> & { materi: number; tugas: number; kuis: number; presensi: number; terakhir: string; kelasN: number }

export const keaktifanGuru = (): KeaktifanGuru[] =>
  derived('stats:keaktifanGuru', () => {
    const snap = getSnapshot()
    return snap.profiles
      .filter((p) => /guru|wali|kepala|kepsek/i.test(str(p.role)))
      .map((p) => {
        const id = str(p.id)
        const outs = offerings().filter((o) => o.guru === id || o.co.includes(id))
        const offIds = new Set(outs.map((o) => o.id))
        const materi = snap.materi.filter((m) => offIds.has(str(m.id_pengampu))).length
        const tugas = myTugas().filter((t) => offIds.has(t.off)).length
        const kuis = myKuis().filter((k) => offIds.has(k.off)).length
        const presensi = snap.presensi.filter((x) => offIds.has(str(x.id_pengampu))).length
        const terakhir = snap.materi
          .filter((m) => offIds.has(str(m.id_pengampu)))
          .map((m) => str(m.tanggal_upload))
          .sort()
          .pop()
        return {
          ...teacherById(id),
          materi,
          tugas,
          kuis,
          presensi,
          terakhir: terakhir ? new Date(terakhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          kelasN: outs.length,
        }
      })
  })

// ==================== REKAP KEHADIRAN PER KELAS ====================
export type RekapHadir = { id: string; siswa: Siswa; total: number; h: number; i: number; sk: number; a: number; p: number }

/**
 * Rekap kehadiran seluruh siswa satu kelas dari tabel presensi.
 * Bila `bulan` diisi (0-11), hanya baris presensi pada bulan tersebut dihitung.
 */
export const rekapHadirKelas = (kelasId: string, bulan?: number): RekapHadir[] =>
  derived(`stats:rekapHadir:${kelasId}:${bulan ?? 'all'}`, () => {
    const snap = getSnapshot()
    const ss = studentsOf(kelasId)
    const ids = new Set(ss.map((s) => s.id))
    const rows = snap.presensi.filter((p) => {
      if (!ids.has(str(p.id_siswa))) return false
      if (bulan === undefined) return true
      const d = new Date(str(p.tanggal))
      return !Number.isNaN(d.getTime()) && d.getMonth() === bulan
    })
    return ss.map((s) => {
      const mine = rows.filter((p) => str(p.id_siswa) === s.id)
      const hitung = (status: string) => mine.filter((p) => lower(p.status) === status).length
      const h = hitung('hadir')
      const i = hitung('izin')
      const sk = hitung('sakit')
      const a = hitung('alpa')
      const total = mine.length
      return { id: s.id, siswa: s, total, h, i, sk, a, p: total ? Math.round((h / total) * 100) : 0 }
    })
  })
