export const ROLE_ORDER = ['Siswa', 'Guru', 'Wali Kelas', 'Kepala Sekolah', 'Tata Usaha'] as const

export const ROLE_OPTIONS = ['Tata Usaha', 'Guru Mapel', 'Wali Kelas', 'Kepala Sekolah', 'Siswa'] as const

export type PermissionRow = [
  label: string,
  siswa: boolean,
  guru: boolean,
  wali: boolean,
  kepsek: boolean,
  tu: boolean,
]

export const DEFAULT_PERMISSIONS: PermissionRow[] = [
  ['Lihat materi & tugas', true, true, true, true, true],
  ['Kumpulkan tugas & kuis', true, false, false, false, false],
  ['Kelola materi', false, true, false, false, true],
  ['Presensi manual', false, true, false, false, false],
  ['Input nilai', false, true, false, false, false],
  ['Lihat rekap kelas', false, true, true, true, true],
  ['Lihat statistik sekolah', false, false, false, true, true],
  ['Kelola data master', false, false, false, false, true],
  ['Kelola pengguna', false, false, false, false, true],
]

const ROLE_VALUE: Record<(typeof ROLE_OPTIONS)[number], string> = {
  Siswa: 'siswa',
  'Guru Mapel': 'guru',
  'Wali Kelas': 'wali',
  'Kepala Sekolah': 'kepsek',
  'Tata Usaha': 'tu',
}

export function roleValue(label: string): string {
  return ROLE_VALUE[label as (typeof ROLE_OPTIONS)[number]] ?? 'siswa'
}

export function roleLabel(value: unknown): string {
  const s = String(value ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')
  if (s === 'tu' || s === 'admin' || s === 'super-admin' || s === 'tata-usaha') return 'Tata Usaha'
  if (s.includes('kepala')) return 'Kepala Sekolah'
  if (s.includes('wali')) return 'Wali Kelas'
  if (s.includes('guru')) return 'Guru Mapel'
  return 'Siswa'
}

export function normalizePermissions(value: unknown): PermissionRow[] {
  if (!Array.isArray(value)) return DEFAULT_PERMISSIONS.map((row) => [...row] as PermissionRow)

  return DEFAULT_PERMISSIONS.map((fallback, i) => {
    const row = value[i]
    if (!Array.isArray(row) || typeof row[0] !== 'string') return [...fallback] as PermissionRow
    return [
      row[0],
      ...fallback.slice(1).map((_, j) => Boolean(row[j + 1])),
    ] as PermissionRow
  })
}
