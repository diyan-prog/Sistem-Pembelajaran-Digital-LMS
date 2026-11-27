import { useSyncExternalStore } from 'react'

// Store snapshot data akademik dari backend Go (/api/v1/akademik/bootstrap).
// Semua nilai sudah dipersempit sesuai peran pengguna di sisi server.

export type Row = Record<string, any>

export type Scope = {
  kelas_ids: string[]
  pengampu_ids: string[]
  user_id: string
  role: string
}

export type Snapshot = {
  me: Row | null
  role: string
  profiles: Row[]
  classes: Row[]
  subjects: Row[]
  jurusan: Row[]
  siswa: Row[]
  pengampu: Row[]
  jadwal: Row[]
  tugas: Row[]
  pengumpulan: Row[]
  kuis: Row[]
  soal: Row[]
  hasil_kuis: Row[]
  materi: Row[]
  pertemuan: Row[]
  presensi: Row[]
  presensi_sesi: Row[]
  pengumuman: Row[]
  notifikasi: Row[]
  tahun_ajaran: Row[]
  scope: Scope
}

export const EMPTY_SNAPSHOT: Snapshot = {
  me: null,
  role: '',
  profiles: [],
  classes: [],
  subjects: [],
  jurusan: [],
  siswa: [],
  pengampu: [],
  jadwal: [],
  tugas: [],
  pengumpulan: [],
  kuis: [],
  soal: [],
  hasil_kuis: [],
  materi: [],
  pertemuan: [],
  presensi: [],
  presensi_sesi: [],
  pengumuman: [],
  notifikasi: [],
  tahun_ajaran: [],
  scope: { kelas_ids: [], pengampu_ids: [], user_id: '', role: '' },
}

const toArray = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : [])

let snapshot: Snapshot = EMPTY_SNAPSHOT
let loaded = false
const listeners = new Set<() => void>()

export const getSnapshot = () => snapshot
export const isSnapshotLoaded = () => loaded

export function setSnapshot(raw: Partial<Snapshot> | null | undefined) {
  if (!raw) return
  const scope = (raw.scope ?? {}) as Partial<Scope>
  snapshot = {
    me: (raw.me as Row) ?? null,
    role: String(raw.role ?? ''),
    profiles: toArray(raw.profiles),
    classes: toArray(raw.classes),
    subjects: toArray(raw.subjects),
    jurusan: toArray(raw.jurusan),
    siswa: toArray(raw.siswa),
    pengampu: toArray(raw.pengampu),
    jadwal: toArray(raw.jadwal),
    tugas: toArray(raw.tugas),
    pengumpulan: toArray(raw.pengumpulan),
    kuis: toArray(raw.kuis),
    soal: toArray(raw.soal),
    hasil_kuis: toArray(raw.hasil_kuis),
    materi: toArray(raw.materi),
    pertemuan: toArray(raw.pertemuan),
    presensi: toArray(raw.presensi),
    presensi_sesi: toArray(raw.presensi_sesi),
    pengumuman: toArray(raw.pengumuman),
    notifikasi: toArray(raw.notifikasi),
    tahun_ajaran: toArray(raw.tahun_ajaran),
    scope: {
      kelas_ids: Array.isArray(scope.kelas_ids) ? scope.kelas_ids : [],
      pengampu_ids: Array.isArray(scope.pengampu_ids) ? scope.pengampu_ids : [],
      user_id: String(scope.user_id ?? ''),
      role: String(scope.role ?? ''),
    },
  }
  loaded = true
  listeners.forEach((l) => l())
}

export function clearSnapshot() {
  snapshot = EMPTY_SNAPSHOT
  loaded = false
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Berlangganan snapshot; komponen ikut render ulang setelah data dimuat. */
export const useStore = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

// Cache hasil turunan per objek snapshot agar tidak dihitung ulang tiap render.
let cacheSnapshot: Snapshot | null = null
let cache: Record<string, unknown> = {}

function memo<T>(key: string, build: () => T): T {
  if (cacheSnapshot !== snapshot) {
    cacheSnapshot = snapshot
    cache = {}
  }
  if (!(key in cache)) cache[key] = build()
  return cache[key] as T
}

export const derived = memo
