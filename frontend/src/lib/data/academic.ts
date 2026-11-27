import { derived, getSnapshot, type Row } from '@/lib/store'
import {
  countBy, group, hariIndex, lower, num, str, subjectById, kelasById, semesterOf, studentsOf,
  type Offering, type Slot, type TStatus, type Tugas, type Kuis, type Soal,
} from './entities'

export type { Offering, Slot, Tugas, Kuis, Soal, TStatus }

const meId = (): string => {
  const snap = getSnapshot()
  return str(snap.scope.user_id || snap.me?.id)
}

const clock = (v: unknown): string => {
  // Postgres time dikirim sebagai HH:MM:SS; UI memakai HH.MM.
  const s = str(v)
  if (!s) return ''
  return s.slice(0, 5).replace(':', '.')
}

const nilaiOf = (rows: Row[], key: string): number[] =>
  rows.map((r) => r[key]).filter((n) => typeof n === 'number') as number[]

const avg = (list: number[]): number => (list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0)

// ==================== PENAWARAN KELAS ====================
const buildOfferings = (): Offering[] =>
  derived('offerings:raw', () => {
    const snap = getSnapshot()
    const uid = meId()
    const jadwal = group(snap.jadwal, 'penugasan_id')
    const pertemuan = countBy(snap.pertemuan, 'id_pengampu')
    const presensi = group(snap.presensi, 'id_pengampu')
    const tugasByOff = group(snap.tugas, 'id_pengampu')
    const kuisByOff = group(snap.kuis, 'id_pengampu')
    const pengByTugas = group(snap.pengumpulan, 'id_tugas')
    const hasilByKuis = group(snap.hasil_kuis, 'id_kuis')
    const aktif = str(snap.tahun_ajaran.find((t) => t.is_active)?.nama)

    const rows: Offering[] = []
    for (const p of snap.pengampu) {
      const id = str(p.id_pengampu)
      const mapel = subjectById(str(p.id_mapel))
      const kelasRow = kelasById(str(p.id_kelas))
      const slots: Slot[] = (jadwal[id] ?? []).map((j) => ({
        hari: hariIndex(j.hari),
        mulai: clock(j.jam_mulai),
        selesai: clock(j.jam_selesai),
        ruang: str(j.ruangan, '-'),
        mode: 'Offline',
        sesi: (pertemuan[id] ?? 0) + 1,
      }))
      const done = pertemuan[id] ?? 0
      const pres = presensi[id] ?? []
      const hadir = uid && lower(snap.role) === 'siswa'
        ? pres.filter((x) => str(x.id_siswa) === uid && lower(x.status) === 'hadir').length
        : pres.filter((x) => lower(x.status) === 'hadir').length
      const tugasIds = new Set((tugasByOff[id] ?? []).map((t) => str(t.id_tugas)))
      const nilaiTugas = nilaiOf(snap.pengumpulan.filter((x) => tugasIds.has(str(x.id_tugas))), 'nilai')
      const hasil = (kuisByOff[id] ?? []).flatMap((k) => nilaiOf(hasilByKuis[str(k.id_kuis)] ?? [], 'nilai'))
      // Guru pengampu lain pada kelas dan mata pelajaran yang sama.
      const co = snap.pengampu
        .filter((x) => str(x.id_kelas) === str(p.id_kelas) && str(x.id_mapel) === str(p.id_mapel) && str(x.id_guru) !== str(p.id_guru))
        .map((x) => str(x.id_guru))
      const tahun = str(p.tahun_ajaran)
      rows.push({
        id,
        kelasId: str(p.id_kelas),
        subjectId: str(p.id_mapel),
        kode: mapel.kode,
        guru: str(p.id_guru),
        co: [...new Set(co)],
        jadwal: slots,
        done,
        total: Math.max(done, 0),
        hadir,
        rata: avg([...nilaiTugas, ...hasil]),
        semester: semesterOf(tahun),
        arsip: Boolean(aktif && tahun && tahun !== aktif),
      })
    }
    return rows
  })

export const offerings = (): Offering[] => buildOfferings().filter((o) => !o.arsip)
export const archived = (): Offering[] => buildOfferings().filter((o) => o.arsip)
export const myOfferings = (): Offering[] => offerings()
export const siswaOfferings = (kelasId: string): Offering[] => offerings().filter((o) => o.kelasId === kelasId)
export const guruOfferings = (guruId: string): Offering[] => offerings().filter((o) => o.guru === guruId || o.co.includes(guruId))

const kosong = (id = ''): Offering => ({ id, kelasId: '', subjectId: '', kode: '-', guru: '', co: [], jadwal: [], done: 0, total: 0, hadir: 0, rata: 0, semester: '', arsip: false })

export const offeringById = (id: string): Offering => buildOfferings().find((o) => o.id === id) ?? kosong(id)
export const offeringTitle = (o: Offering): string => `${subjectById(o.subjectId).nama.toUpperCase()} (${o.kode})`
export const pct = (o: Offering): number => (o.done ? Math.round((o.hadir / o.done) * 100) : 0)
export const scheduleOf = (os: Offering[], dayIdx: number) =>
  os.flatMap((o) => o.jadwal.filter((s) => s.hari === dayIdx).map((s) => ({ o, s }))).sort((a, b) => a.s.mulai.localeCompare(b.s.mulai))

// ==================== TUGAS ====================
const statusTugas = (sub: Row | undefined): TStatus => {
  if (!sub) return 'Belum Dikumpulkan'
  if (typeof sub.nilai === 'number') return 'Dinilai'
  const s = lower(sub.status)
  if (s === 'terlambat') return 'Terlambat'
  if (s === 'dikumpulkan') return 'Dikumpulkan'
  return 'Belum Dikumpulkan'
}

export const tugas = (): Tugas[] =>
  derived('tugas', () => {
    const snap = getSnapshot()
    const uid = meId()
    const perTugas = group(snap.pengumpulan, 'id_tugas')
    return snap.tugas.map((t) => {
      const subs = perTugas[str(t.id_tugas)] ?? []
      const mine = subs.find((x) => str(x.id_siswa) === uid)
      const deadline = str(t.deadline)
      const closed = deadline ? new Date(deadline).getTime() < Date.now() : false
      return {
        id: str(t.id_tugas),
        off: str(t.id_pengampu),
        judul: str(t.judul),
        batas: deadline,
        mulai: str(t.created_at),
        status: statusTugas(mine),
        nilai: typeof mine?.nilai === 'number' ? mine.nilai : undefined,
        maks: 100,
        gStatus: (closed ? 'Ditutup' : 'Aktif') as Tugas['gStatus'],
        terkumpul: subs.length,
        instruksi: str(t.deskripsi),
        lampiran: [],
        feedback: mine?.feedback_guru ? str(mine.feedback_guru) : undefined,
      } as Tugas
    })
  })

const TUGAS_KOSONG: Tugas = {
  id: '', off: '', judul: '-', batas: '', mulai: '', status: 'Belum Dikumpulkan', maks: 100,
  gStatus: 'Draft', terkumpul: 0, instruksi: '', lampiran: [],
}

export const tugasById = (id: string): Tugas => tugas().find((t) => t.id === id) ?? { ...TUGAS_KOSONG, id }
/** Tugas sudah dipersempit server sesuai peran pengguna. */
export const myTugas = (): Tugas[] => tugas()

export type Submission = { id: string; siswa: ReturnType<typeof studentsOf>[number]; status: TStatus; nilai?: number; waktu: string; berkas: string }

export const subSiswa = (tugasId: string): Submission[] => {
  const snap = getSnapshot()
  const t = snap.tugas.find((x) => str(x.id_tugas) === tugasId)
  if (!t) return []
  const off = snap.pengampu.find((p) => str(p.id_pengampu) === str(t.id_pengampu))
  const list = off ? studentsOf(str(off.id_kelas)) : []
  const subs = snap.pengumpulan.filter((p) => str(p.id_tugas) === tugasId)
  return list.map((s) => {
    const sub = subs.find((x) => str(x.id_siswa) === s.id)
    return {
      id: `${tugasId}-${s.id}`,
      siswa: s,
      status: statusTugas(sub),
      nilai: typeof sub?.nilai === 'number' ? sub.nilai : undefined,
      waktu: sub?.waktu_kumpul ? new Date(str(sub.waktu_kumpul)).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
      berkas: str(sub?.file_jawaban, '-'),
    }
  })
}

/** Tugas yang menunggu penilaian pada satu mata pelajaran (pengampu). */
export const waitingCount = (tugasId: string): number =>
  subSiswa(tugasId).filter((s) => s.status === 'Dikumpulkan' || s.status === 'Terlambat').length

// ==================== KUIS ====================
const kuisStatus = (row: Row): Kuis['status'] => {
  const s = lower(row.status)
  if (s === 'draft') return 'Ditutup'
  const now = Date.now()
  const mulai = str(row.waktu_mulai) ? new Date(str(row.waktu_mulai)).getTime() : 0
  const selesai = str(row.waktu_selesai) ? new Date(str(row.waktu_selesai)).getTime() : 0
  if (mulai && now < mulai) return 'Belum Dibuka'
  if (selesai && now > selesai) return 'Selesai'
  if (s === 'selesai') return 'Selesai'
  return 'Tersedia'
}

export const kuis = (): Kuis[] =>
  derived('kuis', () => {
    const snap = getSnapshot()
    const uid = meId()
    const soalByKuis = group(snap.soal, 'id_kuis')
    const hasilByKuis = group(snap.hasil_kuis, 'id_kuis')
    return snap.kuis.map((k) => {
      const id = str(k.id_kuis)
      const soals = (soalByKuis[id] ?? []).map((s) => str(s.id_soal))
      const hasil = hasilByKuis[id] ?? []
      const mine = hasil.filter((h) => str(h.id_siswa) === uid)
      const status = kuisStatus(k)
      const raw = lower(k.status)
      return {
        id,
        off: str(k.id_pengampu),
        judul: str(k.judul),
        durasi: num(k.durasi_menit),
        soal: soals.length,
        buka: str(k.waktu_mulai),
        tutup: str(k.waktu_selesai),
        percobaan: 1,
        dipakai: mine.length,
        status,
        skor: mine.length ? Math.max(...mine.map((h) => num(h.nilai))) : undefined,
        gStatus: (raw === 'draft' ? 'Draft' : status === 'Selesai' ? 'Ditutup' : 'Aktif') as Kuis['gStatus'],
        dikerjakan: hasil.length,
        soals,
      } as Kuis
    })
  })

const KUIS_KOSONG: Kuis = {
  id: '', off: '', judul: '-', durasi: 0, soal: 0, buka: '', tutup: '', percobaan: 1, dipakai: 0,
  status: 'Ditutup', gStatus: 'Draft', dikerjakan: 0,
}

export const kuisById = (id: string): Kuis => kuis().find((k) => k.id === id) ?? { ...KUIS_KOSONG, id }
export const myKuis = (): Kuis[] => kuis()

export const bankSoal = (): Soal[] =>
  derived('bankSoal', () => {
    const snap = getSnapshot()
    const kuisById = new Map(snap.kuis.map((k) => [str(k.id_kuis), k]))
    const offById = new Map(snap.pengampu.map((p) => [str(p.id_pengampu), p]))
    return snap.soal.map((s) => {
      const k = kuisById.get(str(s.id_kuis))
      const off = k ? offById.get(str(k.id_pengampu)) : undefined
      const mapel = off ? subjectById(str(off.id_mapel)) : undefined
      const opsi = [s.pilihan_a, s.pilihan_b, s.pilihan_c, s.pilihan_d].map((x) => str(x))
      const kunci = ['A', 'B', 'C', 'D'].indexOf(str(s.kunci_jawaban).toUpperCase())
      return {
        id: str(s.id_soal),
        q: str(s.pertanyaan),
        opsi,
        kunci: kunci < 0 ? 0 : kunci,
        mapel: mapel?.nama ?? '-',
        bab: str(k?.judul),
        level: 'Sedang' as const,
        dibuat: str(k?.created_at),
      }
    })
  })

export const kuisSoal = (): Soal[] => bankSoal().slice(0, 10)

export const kuisSoalOf = (kuisId: string): Soal[] => {
  const ids = new Set(getSnapshot().soal.filter((s) => str(s.id_kuis) === kuisId).map((s) => str(s.id_soal)))
  return bankSoal().filter((s) => ids.has(s.id))
}
