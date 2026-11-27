import { derived, getSnapshot, type Row } from '@/lib/store'

// Pemetaan baris database (snake_case) ke bentuk yang dipakai komponen.

export type Slot = { hari: number; mulai: string; selesai: string; ruang: string; mode: string; sesi: number }
export type Siswa = {
  id: string; nis: string; nama: string; kelasId: string; jk: 'L' | 'P'; status: string
  email: string; hp: string; hadir: number; rata: number; belum: number; risiko: boolean; alamat: string
}
export type Teacher = { id: string; nama: string; sapaan: string; nip: string; mapel: string; email: string; hp: string; status: string }
export type Subject = { id: string; nama: string; kode: string; guru: string; jam: number; kelompok: string; warna: string }
export type Kelas = { id: string; nama: string; kode: string; tingkat: string; jurusan: string; wali: string; ruang: string }
export type Jurusan = { id: string; nama: string; kode: string; kaprodi: string; siswa: number }
export type Offering = {
  id: string
  kelasId: string
  subjectId: string
  kode: string
  guru: string
  co: string[]
  jadwal: Slot[]
  done: number
  total: number
  hadir: number
  rata: number
  semester: string
  arsip: boolean
}
export type TStatus = 'Belum Dikumpulkan' | 'Dikumpulkan' | 'Terlambat' | 'Dinilai'
export type Tugas = {
  id: string; off: string; judul: string; batas: string; mulai: string; status: TStatus; nilai?: number
  maks: number; gStatus: 'Draft' | 'Aktif' | 'Ditutup'; terkumpul: number; instruksi: string
  lampiran: { nama: string; ukuran: string }[]; feedback?: string
}
export type Soal = { id: string; q: string; opsi: string[]; kunci: number; mapel: string; bab: string; level: 'Mudah' | 'Sedang' | 'Sulit'; dibuat: string }
export type Kuis = {
  id: string; off: string; judul: string; durasi: number; soal: number; buka: string; tutup: string
  percobaan: number; dipakai: number; status: 'Tersedia' | 'Selesai' | 'Belum Dibuka' | 'Ditutup'
  skor?: number; gStatus: 'Draft' | 'Aktif' | 'Ditutup'; dikerjakan: number; soals?: string[]
}

const PALETTE = ['#0B3D5F', '#2563EB', '#DC2626', '#7C3AED', '#D97706', '#0891B2', '#DB2777', '#EA580C']

export const str = (v: unknown, fallback = ''): string => (v === null || v === undefined ? fallback : String(v))
export const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}
export const lower = (v: unknown): string => str(v).trim().toLowerCase()

export const HARI_LIST = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const hariIndex = (nama: unknown): number => {
  const i = HARI_LIST.findIndex((h) => h.toLowerCase() === lower(nama))
  return i < 0 ? 1 : i
}

/** Kelompokkan baris berdasarkan satu kolom. */
export function group(rows: Row[], key: string): Record<string, Row[]> {
  const out: Record<string, Row[]> = {}
  for (const row of rows) {
    const k = str(row[key])
    if (!k) continue
    ;(out[k] ??= []).push(row)
  }
  return out
}

export function countBy(rows: Row[], key: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of rows) {
    const k = str(row[key])
    if (!k) continue
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

export const isTeacherRole = (role: unknown): boolean => /guru|wali|kepala|kepsek/i.test(str(role))

export const sapaanOf = (nama: string): string => nama.split(',')[0].trim() || nama || 'Guru'

export const semesterOf = (tahunAjaran: string): string => {
  const aktif = getSnapshot().tahun_ajaran.find((t) => str(t.nama) === tahunAjaran && t.is_active)
  const tahun = getSnapshot().tahun_ajaran.find((t) => str(t.nama) === tahunAjaran)
  const row = aktif ?? tahun
  const sem = str(row?.semester, 'Ganjil')
  return tahunAjaran ? `Semester ${sem} ${tahunAjaran}` : `Semester ${sem}`
}

// ==================== GURU ====================
export const teachers = (): Teacher[] =>
  derived('teachers', () =>
    getSnapshot()
      .profiles.filter((p) => isTeacherRole(p.role))
      .map((p) => {
        const nama = str(p.nama_lengkap ?? p.full_name)
        const mapel = getSnapshot().subjects.find((s) => str(s.guru_utama_id ?? s.teacher_id) === str(p.id))
        return {
          id: str(p.id),
          nama,
          sapaan: sapaanOf(nama),
          nip: str(p.nip_nis),
          mapel: str(mapel?.code),
          email: str(p.email),
          hp: str(p.hp),
          status: str(p.status, 'Aktif'),
        }
      })
  )

const TEACHER_FALLBACK: Teacher = { id: '', nama: '-', sapaan: '-', nip: '', mapel: '', email: '', hp: '', status: '' }

export const teacherById = (id: string): Teacher => {
  const found = teachers().find((t) => t.id === id)
  if (found) return found
  const profile = getSnapshot().profiles.find((p) => str(p.id) === id)
  if (!profile) return { ...TEACHER_FALLBACK, id }
  const nama = str(profile.nama_lengkap ?? profile.full_name)
  return { id, nama, sapaan: sapaanOf(nama), nip: str(profile.nip_nis), mapel: '', email: str(profile.email), hp: str(profile.hp), status: str(profile.status, 'Aktif') }
}

// ==================== JURUSAN ====================
export const jurusan = (): Jurusan[] =>
  derived('jurusan', () =>
    getSnapshot().jurusan.map((j) => ({
      id: str(j.id),
      nama: str(j.nama),
      kode: str(j.kode),
      kaprodi: '',
      siswa: getSnapshot().siswa.filter((s) => {
        const kelas = getSnapshot().classes.find((k) => str(k.id) === str(s.kelas_id))
        return str(kelas?.jurusan_id) === str(j.id)
      }).length,
    }))
  )

export const jurusanNama = (id: string): string => {
  if (!id) return '-'
  const list = jurusan()
  const found = list.find((j) => j.id === id || j.kode.toLowerCase() === id.toLowerCase())
  return found ? found.nama : id
}

// ==================== MATA PELAJARAN ====================
export const subjects = (): Subject[] =>
  derived('subjects', () =>
    getSnapshot().subjects.map((s, i) => ({
      id: str(s.id),
      nama: str(s.name),
      kode: str(s.code),
      guru: str(s.guru_utama_id ?? s.teacher_id),
      jam: 0,
      kelompok: lower(s.kelompok) === 'kejuruan' ? 'Kejuruan' : 'Umum',
      warna: PALETTE[i % PALETTE.length],
    }))
  )

export const subjectById = (id: string): Subject => {
  const list = subjects()
  const found = list.find((s) => s.id === id) ?? list.find((s) => s.kode.toLowerCase() === str(id).toLowerCase())
  return found ?? { id, nama: id || '-', kode: id || '-', guru: '', jam: 0, kelompok: 'Umum', warna: PALETTE[0] }
}

// ==================== KELAS ====================
export const kelas = (): Kelas[] =>
  derived('kelas', () =>
    getSnapshot().classes.map((k) => ({
      id: str(k.id),
      nama: str(k.name),
      kode: str(k.name).replace(/\s+/g, '-'),
      tingkat: str(k.tingkat ?? k.grade),
      jurusan: str(k.jurusan_id ?? k.major),
      wali: str(k.wali_kelas_id),
      ruang: '',
    }))
  )

export const kelasById = (id: string): Kelas =>
  kelas().find((k) => k.id === id) ?? { id, nama: '-', kode: '-', tingkat: '', jurusan: '', wali: '', ruang: '' }

// ==================== SISWA ====================
export const students = (): Siswa[] =>
  derived('students', () => {
    const snap = getSnapshot()
    const presensi = group(snap.presensi, 'id_siswa')
    const pengumpulan = group(snap.pengumpulan, 'id_siswa')
    const hasil = group(snap.hasil_kuis, 'id_siswa')
    return snap.siswa.map((row) => {
      const profileId = str(row.profile_id)
      const pres = presensi[profileId] ?? []
      const hadir = pres.length ? Math.round((pres.filter((p) => lower(p.status) === 'hadir').length / pres.length) * 100) : 0
      const peng = pengumpulan[profileId] ?? []
      const nilaiList = [...peng.map((p) => p.nilai), ...(hasil[profileId] ?? []).map((h) => h.nilai)].filter((n) => typeof n === 'number') as number[]
      const rata = nilaiList.length ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) : 0
      const kelasId = str(row.kelas_id)
      const offIds = snap.pengampu.filter((p) => str(p.id_kelas) === kelasId).map((p) => str(p.id_pengampu))
      const tugasKelas = snap.tugas.filter((t) => offIds.includes(str(t.id_pengampu)))
      const sudah = new Set(peng.map((p) => str(p.id_tugas)))
      const belum = tugasKelas.filter((t) => !sudah.has(str(t.id_tugas))).length
      return {
        id: profileId,
        nis: str(row.nis),
        nama: str(row.nama_lengkap ?? row.nama),
        kelasId,
        jk: lower(row.jenis_kelamin) === 'l' ? 'L' : 'P',
        status: str(row.status, 'Aktif'),
        email: str(row.email),
        hp: str(row.hp),
        hadir,
        rata,
        belum,
        risiko: (pres.length > 0 && hadir < 75) || (nilaiList.length > 0 && rata < 70) || belum >= 4,
        alamat: str(row.alamat),
      } as Siswa
    })
  })

export const studentsOf = (kelasId: string): Siswa[] => students().filter((s) => s.kelasId === kelasId)

/** ID pengguna aktif menurut snapshot bootstrap. */
export const currentUserId = (): string => {
  const snap = getSnapshot()
  return str(snap.scope.user_id || snap.me?.id)
}

/**
 * Kelas yang relevan untuk pengguna aktif:
 * siswa → kelasnya, wali → kelas perwalian, lainnya → kelas penawaran pertama.
 */
export const myKelasId = (): string => {
  const uid = currentUserId()
  const snap = getSnapshot()
  const asSiswa = snap.siswa.find((s) => str(s.profile_id) === uid)
  if (asSiswa) return str(asSiswa.kelas_id)
  const asWali = snap.classes.find((k) => str(k.wali_kelas_id) === uid)
  if (asWali) return str(asWali.id)
  return str(snap.pengampu[0]?.id_kelas)
}

const SISWA_KOSONG: Siswa = { id: '', nis: '', nama: 'Siswa', kelasId: '', jk: 'P', status: '', email: '', hp: '', hadir: 0, rata: 0, belum: 0, risiko: false, alamat: '' }

export const studentById = (id: string): Siswa => students().find((s) => s.id === id) ?? { ...SISWA_KOSONG, id }

/** Profil siswa yang sedang login; objek kosong bila data belum dimuat. */
export const meSiswa = (): Siswa => {
  const snap = getSnapshot()
  const id = str(snap.scope.user_id || snap.me?.id)
  return students().find((s) => s.id === id) ?? { ...SISWA_KOSONG, id, nama: str(snap.me?.nama_lengkap ?? snap.me?.full_name, 'Siswa') }
}
