// Data dummy terpusat — Sistem Pembelajaran Digital SMK Negeri 2 Indramayu
export const TODAY = new Date(2026, 9, 29)
export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const HARI_S = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const fmtTgl = (d: Date) => `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN_S[d.getMonth()]} ${d.getFullYear()}`
export const fmtTglPendek = (d: Date) => `${d.getDate()} ${BULAN_S[d.getMonth()]} ${d.getFullYear()}`
export const fmtBatas = (iso: string) => `${fmtTgl(new Date(iso))}, ${new Date(iso).getHours().toString().padStart(2, '0')}.${new Date(iso).getMinutes().toString().padStart(2, '0')}`
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const weekDays = () => { const mon = addDays(TODAY, -3); return Array.from({ length: 7 }, (_, i) => addDays(mon, i)) } // 26 Okt - 1 Nov 2026

function rng(seed: number) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)]

export const SEMESTER = 'Semester Ganjil 2026/2027'

// ---------- Guru ----------
export const teachers = [
  { id: 't1', nama: 'Sari Dewi, S.Kom.', sapaan: 'Bu Sari Dewi', nip: '198503122010012004', mapel: 'pw', email: 'sari.dewi@smkn2indramayu.sch.id', hp: '0812-3456-7801', status: 'Aktif' },
  { id: 't2', nama: 'Hendra Kurniawan, S.T.', sapaan: 'Pak Hendra', nip: '198106252009011003', mapel: 'bd', email: 'hendra.k@smkn2indramayu.sch.id', hp: '0812-3456-7802', status: 'Aktif' },
  { id: 't3', nama: 'Lestari Handayani, S.Pd.', sapaan: 'Bu Lestari', nip: '198809172012012002', mapel: 'mtk', email: 'lestari.h@smkn2indramayu.sch.id', hp: '0812-3456-7803', status: 'Aktif' },
  { id: 't4', nama: 'Budi Santoso, S.Pd.', sapaan: 'Pak Budi Santoso', nip: '197912012005011006', mapel: 'pkn', email: 'budi.s@smkn2indramayu.sch.id', hp: '0812-3456-7804', status: 'Aktif' },
  { id: 't5', nama: 'Agus Wijaya, S.Kom.', sapaan: 'Pak Agus Wijaya', nip: '198311052011011005', mapel: 'prod', email: 'agus.w@smkn2indramayu.sch.id', hp: '0812-3456-7805', status: 'Aktif' },
  { id: 't6', nama: 'Nurul Hidayah, S.Pd.', sapaan: 'Bu Nurul Hidayah', nip: '199002142015012001', mapel: 'bin', email: 'nurul.h@smkn2indramayu.sch.id', hp: '0812-3456-7806', status: 'Aktif' },
  { id: 't7', nama: 'Rudi Hartono, S.Pd.', sapaan: 'Pak Rudi Hartono', nip: '198407202010011007', mapel: 'pjok', email: 'rudi.h@smkn2indramayu.sch.id', hp: '0812-3456-7807', status: 'Aktif' },
  { id: 't8', nama: 'Dewi Anggraini, S.Pd.', sapaan: 'Bu Dewi Anggraini', nip: '199105302016012003', mapel: 'bing', email: 'dewi.a@smkn2indramayu.sch.id', hp: '0812-3456-7808', status: 'Cuti' },
]
export const teacherById = (id: string) => teachers.find((t) => t.id === id)!

export const jurusan = [
  { id: 'RPL', nama: 'Rekayasa Perangkat Lunak', kode: 'RPL', kaprodi: 'Pak Hendra Kurniawan', siswa: 0 },
  { id: 'TKJ', nama: 'Teknik Komputer dan Jaringan', kode: 'TKJ', kaprodi: 'Pak Agus Wijaya', siswa: 0 },
  { id: 'DKV', nama: 'Desain Komunikasi Visual', kode: 'DKV', kaprodi: 'Bu Dewi Anggraini', siswa: 0 },
]
export const jurusanNama = (id: string) => jurusan.find((j) => j.id === id)!.nama

export const subjects = [
  { id: 'mtk', nama: 'Matematika', kode: 'MTK', guru: 't3', jam: 4, kelompok: 'Umum', warna: '#2563EB' },
  { id: 'bin', nama: 'Bahasa Indonesia', kode: 'BIN', guru: 't6', jam: 4, kelompok: 'Umum', warna: '#DC2626' },
  { id: 'bing', nama: 'Bahasa Inggris', kode: 'BIG', guru: 't8', jam: 3, kelompok: 'Umum', warna: '#7C3AED' },
  { id: 'pkn', nama: 'Pendidikan Pancasila', kode: 'PKN', guru: 't4', jam: 2, kelompok: 'Umum', warna: '#D97706' },
  { id: 'pjok', nama: 'PJOK', kode: 'PJK', guru: 't7', jam: 2, kelompok: 'Umum', warna: '#0891B2' },
  { id: 'pw', nama: 'Pemrograman Web', kode: 'PWB', guru: 't1', jam: 6, kelompok: 'Kejuruan', warna: '#0B3D5F' },
  { id: 'bd', nama: 'Basis Data', kode: 'BDT', guru: 't2', jam: 6, kelompok: 'Kejuruan', warna: '#DB2777' },
  { id: 'prod', nama: 'Produktif RPL', kode: 'PRP', guru: 't5', jam: 8, kelompok: 'Kejuruan', warna: '#EA580C' },
]
export const subjectById = (id: string) => subjects.find((s) => s.id === id)!

export const kelas = [
  { id: 'k1', nama: 'X RPL 1', kode: 'X-RPL-1', tingkat: 'X', jurusan: 'RPL', wali: 't3', ruang: 'R.501' },
  { id: 'k2', nama: 'XI RPL 1', kode: 'XI-RPL-1', tingkat: 'XI', jurusan: 'RPL', wali: 't2', ruang: 'R.605' },
  { id: 'k3', nama: 'XI RPL 2', kode: 'XI-RPL-2', tingkat: 'XI', jurusan: 'RPL', wali: 't6', ruang: 'R.606' },
  { id: 'k4', nama: 'XII RPL 1', kode: 'XII-RPL-1', tingkat: 'XII', jurusan: 'RPL', wali: 't4', ruang: 'R.701' },
  { id: 'k5', nama: 'XI TKJ 1', kode: 'XI-TKJ-1', tingkat: 'XI', jurusan: 'TKJ', wali: 't7', ruang: 'R.607' },
  { id: 'k6', nama: 'XI DKV 1', kode: 'XI-DKV-1', tingkat: 'XI', jurusan: 'DKV', wali: 't8', ruang: 'R.608' },
]
export const kelasById = (id: string) => kelas.find((k) => k.id === id)!

// ---------- Siswa ----------
const FIRST: [string, 'L' | 'P'][] = [['Aulia', 'P'], ['Bagas', 'L'], ['Citra', 'P'], ['Dafa', 'L'], ['Eka', 'P'], ['Farhan', 'L'], ['Gita', 'P'], ['Hafiz', 'L'], ['Intan', 'P'], ['Joko', 'L'], ['Kirana', 'P'], ['Lutfi', 'L'], ['Melati', 'P'], ['Naufal', 'L'], ['Octavia', 'P'], ['Putra', 'L'], ['Qonita', 'P'], ['Rafi', 'L'], ['Sekar', 'P'], ['Taufik', 'L'], ['Ulfa', 'P'], ['Vino', 'L'], ['Wulan', 'P'], ['Yoga', 'L'], ['Zahra', 'P'], ['Arif', 'L'], ['Bella', 'P'], ['Cahyo', 'L'], ['Dinda', 'P'], ['Erlangga', 'L']]
const LAST = ['Saputra', 'Lestari', 'Wahyuni', 'Ramadhan', 'Permata', 'Firmansyah', 'Kusuma', 'Maulana', 'Anggraeni', 'Hidayat', 'Setiawan', 'Safitri', 'Nugraha', 'Utami', 'Prasetyo', 'Rahmawati', 'Wibowo', 'Fitriani', 'Hakim', 'Syahputri', 'Gunawan', 'Amelia', 'Pangestu', 'Maharani', 'Kurniawan']
export type Siswa = { id: string; nis: string; nama: string; kelasId: string; jk: 'L' | 'P'; status: string; email: string; hp: string; hadir: number; rata: number; belum: number; risiko: boolean; alamat: string }
const named: Record<string, [string, 'L' | 'P'][]> = {
  k2: [['Rina Aulia', 'P'], ['Dimas Pratama', 'L'], ['Salsabila Putri', 'P'], ['Fajar Nugroho', 'L']],
  k1: [['Alya Rahma', 'P'], ['Bayu Aji', 'L']],
}
export const students: Siswa[] = []
kelas.forEach((k, ci) => {
  const r = rng(ci + 3)
  for (let i = 0; i < 25; i++) {
    const g = ci * 25 + i
    const nm = named[k.id]?.[i]
    const f = FIRST[(g * 7 + ci) % FIRST.length]
    const nama = nm ? nm[0] : `${f[0]} ${LAST[(g * 11 + Math.floor(g / 5)) % LAST.length]}`
    const jk = nm ? nm[1] : f[1]
    const hadir = Math.round(66 + r() * 34)
    const rata = Math.round(60 + r() * 36)
    const belum = Math.floor(r() * r() * 5)
    const seed = nama === 'Rina Aulia' ? { hadir: 91, rata: 85, belum: 3 } : nama === 'Dimas Pratama' ? { hadir: 72, rata: 68, belum: 4 } : { hadir, rata, belum }
    students.push({
      id: `s${g + 1}`, nis: `2425${(10000 + g * 13 + 7).toString().slice(1)}`.padEnd(10, '0').slice(0, 10), nama, kelasId: k.id, jk, status: g % 41 === 40 ? 'Nonaktif' : 'Aktif',
      email: `${nama.toLowerCase().replace(/[^a-z ]/g, '').split(' ').join('.')}@siswa.smkn2indramayu.sch.id`, hp: `0857-${1000 + ((g * 37) % 8999)}-${1000 + ((g * 71) % 8999)}`,
      ...seed, risiko: seed.hadir < 75 || seed.rata < 70 || seed.belum >= 4, alamat: `Jl. ${pick(['Jenderal Sudirman', 'Pahlawan', 'Veteran', 'Cimanuk', 'Mangga Dua'], r)} No. ${1 + (g % 90)}, Indramayu`,
    })
  }
})
jurusan.forEach((j) => (j.siswa = students.filter((s) => kelasById(s.kelasId).jurusan === j.id).length))
export const studentsOf = (kid: string) => students.filter((s) => s.kelasId === kid)
export const studentById = (id: string) => students.find((s) => s.id === id)!
export const ME_SISWA = students.find((s) => s.nama === 'Rina Aulia')!

// ---------- Penawaran kelas (kelas pelajaran) ----------
export type Slot = { hari: number; mulai: string; selesai: string; ruang: string; mode: string; sesi: number }
export type Offering = { id: string; kelasId: string; subjectId: string; kode: string; guru: string; co: string[]; jadwal: Slot[]; done: number; total: number; hadir: number; rata: number; semester: string; arsip: boolean }
const SLOTS = [['07.00', '08.40'], ['08.40', '10.20'], ['10.20', '12.00'], ['12.40', '14.20']]
const common = ['mtk', 'bin', 'bing', 'pkn', 'pjok']
const subjOf = (k: (typeof kelas)[0]) => k.jurusan === 'RPL' ? [...common, 'pw', 'bd'] : k.jurusan === 'TKJ' ? [...common, 'bd', 'prod'] : [...common, 'pw', 'prod']
const k2manual: Record<string, { j: [number, string, string, string][]; done: number; hadir: number }> = {
  mtk: { j: [[1, '07.00', '08.40', 'R.201'], [4, '07.00', '08.40', 'R.201']], done: 16, hadir: 16 },
  bin: { j: [[3, '09.00', '10.40', 'R.201']], done: 15, hadir: 14 },
  bing: { j: [[2, '07.00', '08.40', 'R.203'], [5, '13.00', '14.20', 'R.203']], done: 14, hadir: 11 },
  pkn: { j: [[3, '07.00', '08.40', 'R.201']], done: 14, hadir: 10 },
  pjok: { j: [[1, '09.00', '10.40', 'Lapangan'], [6, '07.00', '08.40', 'Lapangan']], done: 12, hadir: 0 },
  pw: { j: [[4, '12.40', '14.20', 'R.605'], [5, '10.00', '11.40', 'Lab 1']], done: 17, hadir: 13 },
  bd: { j: [[2, '09.00', '11.30', 'Lab 2'], [4, '10.00', '11.40', 'Lab 2']], done: 13, hadir: 6 },
}
export const offerings: Offering[] = []
kelas.forEach((k, ci) => subjOf(k).forEach((sid, si) => {
  const s = subjectById(sid)
  const m = k.id === 'k2' ? k2manual[sid] : null
  const r = rng(ci * 10 + si + 1)
  const done = m ? m.done : 10 + ((si + ci) % 6) * 2
  const hadir = m ? m.hadir : Math.round(done * (0.72 + r() * 0.28))
  const jadwal: Slot[] = m ? m.j.map(([h, a, b, ru], i) => ({ hari: h, mulai: a, selesai: b, ruang: ru, mode: 'Offline', sesi: done + 6 + i * 0 + (i ? 1 : 0) })) : [{ hari: 1 + ((si * 2 + ci) % 6), mulai: SLOTS[(si + ci * 2) % 4][0], selesai: SLOTS[(si + ci * 2) % 4][1], ruang: sid === 'pjok' ? 'Lapangan' : sid === 'pw' || sid === 'bd' ? `Lab ${1 + ((ci + si) % 3)}` : k.ruang, mode: 'Offline', sesi: done + 1 }]
  if (m && sid === 'pw') { jadwal[0].sesi = 18; jadwal[0].ruang = 'R.605'; jadwal[1].sesi = 19 }
  offerings.push({ id: `${k.id}-${sid}`, kelasId: k.id, subjectId: sid, kode: k.kode, guru: s.guru, co: k.id === 'k2' && sid === 'pw' ? ['t5'] : k.id === 'k2' && sid === 'bd' ? ['t1'] : [], jadwal, done, total: 32, hadir, rata: Math.round(72 + r() * 20), semester: SEMESTER, arsip: false })
}))
// kelas arsip (semester lalu)
export const archived: Offering[] = [
  { ...offerings.find((o) => o.id === 'k2-mtk')!, id: 'k2-mtk-arsip', semester: 'Semester Genap 2025/2026', arsip: true, done: 32, hadir: 30, kode: 'X-RPL-1' },
  { ...offerings.find((o) => o.id === 'k2-pw')!, id: 'k2-pw-arsip', semester: 'Semester Genap 2025/2026', arsip: true, done: 32, hadir: 28, kode: 'X-RPL-1', subjectId: 'pw' },
  { ...offerings.find((o) => o.id === 'k2-bin')!, id: 'k2-bin-arsip', semester: 'Semester Genap 2025/2026', arsip: true, done: 32, hadir: 32, kode: 'X-RPL-1' },
]
export const offeringTitle = (o: Offering) => `${subjectById(o.subjectId).nama.toUpperCase()} (${o.kode})`
export const offeringById = (id: string) => [...offerings, ...archived].find((o) => o.id === id)!
export const pct = (o: Offering) => (o.done ? Math.round((o.hadir / o.done) * 100) : 0)
export const siswaOfferings = (kid = 'k2') => offerings.filter((o) => o.kelasId === kid)
export const guruOfferings = (gid = 't1') => offerings.filter((o) => o.guru === gid || o.co.includes(gid))
export const fmtSlot = (s: Slot) => `${HARI[s.hari]}, ${s.mulai} - ${s.selesai}`
export const scheduleOf = (os: Offering[], dayIdx: number) => os.flatMap((o) => o.jadwal.filter((s) => s.hari === dayIdx).map((s) => ({ o, s }))).sort((a, b) => a.s.mulai.localeCompare(b.s.mulai))

// ---------- Tugas ----------
export type TStatus = 'Belum Dikumpulkan' | 'Dikumpulkan' | 'Terlambat' | 'Dinilai'
export type Tugas = { id: string; off: string; judul: string; batas: string; mulai: string; status: TStatus; nilai?: number; maks: number; gStatus: 'Draft' | 'Aktif' | 'Ditutup'; terkumpul: number; instruksi: string; lampiran: { nama: string; ukuran: string }[]; feedback?: string }
const instr = 'Kerjakan tugas secara mandiri sesuai petunjuk di bawah ini. Unggah hasil pekerjaanmu dalam format PDF, DOCX, atau ZIP sebelum batas waktu. Pastikan nama file memuat nama dan kelasmu.\n\n1. Pelajari materi pada pertemuan terkait.\n2. Kerjakan semua poin tugas dengan lengkap dan rapi.\n3. Sertakan sumber referensi bila ada.\n4. Kumpulkan sebelum batas waktu; keterlambatan dapat mengurangi nilai.'
const T = (id: string, off: string, judul: string, batas: string, status: TStatus, nilai?: number, extra: Partial<Tugas> = {}): Tugas => ({ id, off, judul, batas, mulai: '2026-10-19T07:00', status, nilai, maks: 100, gStatus: 'Aktif', terkumpul: 19, instruksi: instr, lampiran: [{ nama: `Panduan-${judul.split(' ')[0]}.pdf`, ukuran: '420 KB' }, { nama: 'Contoh-Hasil.png', ukuran: '1,2 MB' }], ...extra })
export const tugas: Tugas[] = [
  T('tg1', 'k2-pw', 'Membuat Landing Page HTML & CSS', '2026-10-22T23:59', 'Dinilai', 88, { feedback: 'Struktur HTML sudah semantik dan tampilan rapi. Perhatikan konsistensi spasi dan tambahkan atribut alt pada gambar.', gStatus: 'Ditutup', terkumpul: 25 }),
  T('tg2', 'k2-pw', 'Tugas Responsive Layout dengan Flexbox', '2026-10-31T23:59', 'Belum Dikumpulkan', undefined, { terkumpul: 14 }),
  T('tg3', 'k2-bd', 'Rancangan ERD Sistem Perpustakaan', '2026-11-02T23:59', 'Belum Dikumpulkan', undefined, { terkumpul: 8 }),
  T('tg4', 'k2-mtk', 'Latihan Soal Fungsi Kuadrat', '2026-10-30T23:59', 'Dikumpulkan', undefined, { terkumpul: 21 }),
  T('tg5', 'k2-bin', 'Menulis Teks Prosedur Kompleks', '2026-10-25T23:59', 'Terlambat', undefined, { terkumpul: 24, gStatus: 'Ditutup' }),
  T('tg6', 'k2-bing', 'Job Application Letter', '2026-10-20T23:59', 'Dinilai', 92, { feedback: 'Excellent! Grammar dan format surat sangat baik. Pertahankan.', gStatus: 'Ditutup', terkumpul: 25 }),
  T('tg7', 'k2-pkn', 'Resume Nilai-Nilai Pancasila dalam Kehidupan', '2026-11-05T23:59', 'Belum Dikumpulkan', undefined, { terkumpul: 5 }),
  T('tg8', 'k2-bd', 'Latihan Query SELECT dan JOIN', '2026-10-24T23:59', 'Dinilai', 79, { feedback: 'Query dasar sudah benar. Pelajari kembali LEFT JOIN untuk soal nomor 4 dan 5.', gStatus: 'Ditutup', terkumpul: 23 }),
  T('tg9', 'k2-pjok', 'Laporan Kebugaran Jasmani', '2026-10-28T23:59', 'Dikumpulkan', undefined, { terkumpul: 22, gStatus: 'Ditutup' }),
]
const judulGen = ['Studi Kasus dan Analisis', 'Proyek Mini Kelompok', 'Latihan Mandiri Bab 2', 'Rangkuman Materi']
offerings.filter((o) => o.kelasId !== 'k2').forEach((o, i) => {
  for (let j = 0; j < 2; j++) tugas.push(T(`tg-${o.id}-${j}`, o.id, `${judulGen[(i + j) % 4]} ${subjectById(o.subjectId).nama}`, `2026-11-0${1 + ((i + j) % 8)}T23:59`, 'Belum Dikumpulkan', undefined, { gStatus: j === 1 && i % 3 === 0 ? 'Draft' : 'Aktif', terkumpul: 6 + ((i * 3 + j * 5) % 18) }))
})
tugas.push(T('tg-k2-pw-draft', 'k2-pw', 'Proyek Akhir Website Sekolah (Draft)', '2026-11-20T23:59', 'Belum Dikumpulkan', undefined, { gStatus: 'Draft', terkumpul: 0 }))
export const tugasById = (id: string) => tugas.find((t) => t.id === id)!
export const subSiswa = (tid: string) => {
  const t = tugasById(tid); const r = rng(tid.length * 31 + t.terkumpul)
  const list = studentsOf(offeringById(t.off).kelasId)
  return list.map((s, i) => {
    const kumpul = i < t.terkumpul
    const late = kumpul && r() < 0.15
    const graded = kumpul && (t.gStatus === 'Ditutup' ? r() < 0.8 : r() < 0.3)
    const status = !kumpul ? 'Belum Dikumpulkan' : graded ? 'Dinilai' : late ? 'Terlambat' : 'Dikumpulkan'
    return { id: `${tid}-${s.id}`, siswa: s, status: status as TStatus, nilai: graded ? Math.round(65 + r() * 33) : undefined, waktu: kumpul ? `${20 + Math.floor(r() * 9)} Okt 2026, ${7 + Math.floor(r() * 14)}.${(10 + Math.floor(r() * 49)).toString()}` : '-', berkas: kumpul ? `${s.nama.split(' ')[0]}_${s.nama.split(' ').slice(-1)}.pdf` : '-' }
  })
}

// ---------- Kuis ----------
export type Soal = { id: string; q: string; opsi: string[]; kunci: number; mapel: string; bab: string; level: 'Mudah' | 'Sedang' | 'Sulit'; dibuat: string }
export const bankSoal: Soal[] = ([
  { q: 'Perintah SQL yang digunakan untuk menampilkan data dari tabel adalah ...', opsi: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'], kunci: 1, level: 'Mudah' },
  { q: 'Kunci yang secara unik mengidentifikasi setiap baris dalam tabel disebut ...', opsi: ['Foreign Key', 'Composite Key', 'Primary Key', 'Candidate Key'], kunci: 2, level: 'Mudah' },
  { q: 'Klausa yang digunakan untuk memfilter data pada perintah SELECT adalah ...', opsi: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], kunci: 2, level: 'Mudah' },
  { q: 'JOIN yang hanya menampilkan data yang cocok pada kedua tabel adalah ...', opsi: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'FULL JOIN'], kunci: 1, level: 'Sedang' },
  { q: 'Fungsi agregat untuk menghitung jumlah baris data adalah ...', opsi: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], kunci: 2, level: 'Mudah' },
  { q: 'Relasi antar tabel pada ERD yang menyatakan satu siswa memiliki banyak nilai disebut ...', opsi: ['One to One', 'One to Many', 'Many to Many', 'Self Join'], kunci: 1, level: 'Sedang' },
  { q: 'Normalisasi bentuk pertama (1NF) mensyaratkan bahwa ...', opsi: ['Tidak ada ketergantungan transitif', 'Setiap atribut bernilai atomik', 'Semua tabel memiliki foreign key', 'Tidak ada duplikasi tabel'], kunci: 1, level: 'Sulit' },
  { q: 'Perintah untuk menghapus seluruh tabel beserta strukturnya adalah ...', opsi: ['DELETE', 'TRUNCATE', 'DROP TABLE', 'REMOVE'], kunci: 2, level: 'Sedang' },
  { q: 'Klausa yang digunakan untuk mengurutkan hasil query adalah ...', opsi: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE'], kunci: 1, level: 'Mudah' },
  { q: 'Tipe data yang paling tepat untuk menyimpan nama siswa pada MySQL adalah ...', opsi: ['INT', 'DATE', 'VARCHAR', 'BOOLEAN'], kunci: 2, level: 'Mudah' },
  { q: 'Tag HTML untuk membuat tautan adalah ...', opsi: ['<link>', '<a>', '<href>', '<url>'], kunci: 1, level: 'Mudah' },
  { q: 'Properti CSS untuk mengubah warna latar belakang adalah ...', opsi: ['color', 'bg', 'background-color', 'fill'], kunci: 2, level: 'Mudah' },
  { q: 'Nilai display pada CSS yang membuat tata letak fleksibel satu dimensi adalah ...', opsi: ['block', 'flex', 'inline', 'grid'], kunci: 1, level: 'Sedang' },
  { q: 'Hasil dari 2x + 6 = 14 adalah x = ...', opsi: ['2', '3', '4', '5'], kunci: 2, level: 'Mudah' },
] as Omit<Soal, 'id' | 'mapel' | 'bab' | 'dibuat'>[]).map((s, i) => ({ ...s, id: `q${i + 1}`, mapel: i < 10 ? 'Basis Data' : i < 13 ? 'Pemrograman Web' : 'Matematika', bab: i < 10 ? 'Bab 3 - SQL Dasar' : i < 13 ? 'Bab 1 - HTML & CSS' : 'Bab 2 - Persamaan Linear', dibuat: `${10 + i} Okt 2026` }))
export const kuisSoal = bankSoal.slice(0, 10)
const BQ_IDS = bankSoal.slice(0, 10).map((s: Soal) => s.id)
export const kuisSoalOf = (quizId: string): Soal[] => {
  const q = kuisById(quizId)
  return (q.soals ?? BQ_IDS)
    .map((sid: string) => bankSoal.find((b) => b.id === sid))
    .filter(Boolean) as Soal[]
}
export type Kuis = { id: string; off: string; judul: string; durasi: number; soal: number; buka: string; tutup: string; percobaan: number; dipakai: number; status: 'Tersedia' | 'Selesai' | 'Belum Dibuka' | 'Ditutup'; skor?: number; gStatus: 'Draft' | 'Aktif' | 'Ditutup'; dikerjakan: number; soals?: string[] }
export const kuis: Kuis[] = [
  { id: 'kz1', off: 'k2-bd', judul: 'Kuis Basis Data Bab 3', durasi: 20, soal: 10, buka: '2026-10-26T07:00', tutup: '2026-10-30T23:59', percobaan: 2, dipakai: 0, status: 'Tersedia', gStatus: 'Aktif', dikerjakan: 18, soals: BQ_IDS },
  { id: 'kz2', off: 'k2-pw', judul: 'Kuis HTML & CSS Dasar', durasi: 30, soal: 10, buka: '2026-10-12T07:00', tutup: '2026-10-16T23:59', percobaan: 1, dipakai: 1, status: 'Selesai', skor: 80, gStatus: 'Ditutup', dikerjakan: 25, soals: BQ_IDS },
  { id: 'kz3', off: 'k2-mtk', judul: 'Kuis Fungsi Kuadrat', durasi: 25, soal: 10, buka: '2026-11-02T07:00', tutup: '2026-11-04T23:59', percobaan: 1, dipakai: 0, status: 'Belum Dibuka', gStatus: 'Aktif', dikerjakan: 0, soals: BQ_IDS },
  { id: 'kz4', off: 'k2-bing', judul: 'Quiz Simple Present & Past Tense', durasi: 15, soal: 10, buka: '2026-10-19T07:00', tutup: '2026-10-21T23:59', percobaan: 1, dipakai: 1, status: 'Selesai', skor: 70, gStatus: 'Ditutup', dikerjakan: 24, soals: BQ_IDS },
  { id: 'kz5', off: 'k2-pkn', judul: 'Kuis Pancasila sebagai Dasar Negara', durasi: 15, soal: 10, buka: '2026-10-05T07:00', tutup: '2026-10-07T23:59', percobaan: 1, dipakai: 0, status: 'Ditutup', gStatus: 'Ditutup', dikerjakan: 22, soals: BQ_IDS },
  { id: 'kz6', off: 'k3-pw', judul: 'Kuis JavaScript Dasar', durasi: 30, soal: 10, buka: '2026-10-28T07:00', tutup: '2026-11-03T23:59', percobaan: 2, dipakai: 0, status: 'Tersedia', gStatus: 'Aktif', dikerjakan: 12, soals: BQ_IDS },
  { id: 'kz7', off: 'k4-pw', judul: 'Kuis PHP dan MySQL', durasi: 40, soal: 10, buka: '2026-11-09T07:00', tutup: '2026-11-12T23:59', percobaan: 1, dipakai: 0, status: 'Belum Dibuka', gStatus: 'Draft', dikerjakan: 0, soals: BQ_IDS },
]
export const kuisById = (id: string) => kuis.find((k) => k.id === id)!

// ---------- Materi ----------
export type Materi = { id: string; judul: string; tipe: 'dokumen' | 'gambar' | 'youtube'; ukuran?: string; tanggal: string; yt?: string; ext?: string; tampil: boolean }
export type Pertemuan = { id: string; no: number; judul: string; tanggal: string; items: Materi[] }
const TOPIK: Record<string, string[]> = {
  pw: ['Pengenalan HTML dan Struktur Dokumen', 'Dasar CSS dan Selector', 'Layout dengan Flexbox', 'CSS Grid dan Responsive Design', 'Dasar JavaScript untuk Web', 'Manipulasi DOM'],
  bd: ['Konsep Basis Data dan DBMS', 'Entity Relationship Diagram', 'SQL Dasar: SELECT dan WHERE', 'JOIN dan Fungsi Agregat', 'Normalisasi Data', 'Stored Procedure dan View'],
  mtk: ['Persamaan Linear', 'Sistem Persamaan', 'Fungsi Kuadrat', 'Grafik Fungsi', 'Barisan dan Deret', 'Statistika Dasar'],
}
const YT = ['qz0aGYrrlhU', 'UB1O30fR-EE', 'yfoY53QXEnI', 'zJSY8tbf_ys', 'kJEsTjH5mag', 'PlxWf493en0']
export const materiOf = (offId: string): Pertemuan[] => {
  const o = offeringById(offId.replace('-arsip', '')); const tp = TOPIK[o.subjectId] ?? ['Pengantar Materi', 'Konsep Dasar', 'Praktik Terbimbing', 'Studi Kasus', 'Pendalaman', 'Evaluasi Bab']
  const r = rng(offId.length * 7 + o.done)
  return tp.map((judul, i) => ({
    id: `${offId}-p${i + 1}`, no: i + 1, judul, tanggal: fmtTglPendek(addDays(TODAY, -7 * (tp.length - i) + 3)),
    items: [
      { id: `${offId}-p${i + 1}-m1`, judul: `Modul ${judul}`, tipe: 'dokumen' as const, ukuran: `${(0.6 + r() * 3).toFixed(1).replace('.', ',')} MB`, ext: 'PDF', tanggal: fmtTglPendek(addDays(TODAY, -7 * (tp.length - i) + 2)), tampil: true },
      ...(i % 2 === 0 ? [{ id: `${offId}-p${i + 1}-m2`, judul: `Infografis ${judul}`, tipe: 'gambar' as const, ukuran: `${Math.round(200 + r() * 900)} KB`, ext: 'PNG', tanggal: fmtTglPendek(addDays(TODAY, -7 * (tp.length - i) + 2)), tampil: true }] : []),
      { id: `${offId}-p${i + 1}-m3`, judul: `Video Penjelasan: ${judul}`, tipe: 'youtube' as const, yt: YT[i % YT.length], tanggal: fmtTglPendek(addDays(TODAY, -7 * (tp.length - i) + 3)), tampil: i !== tp.length - 1 || true },
    ],
  }))
}
export const sesiOf = (offId: string) => {
  const o = offeringById(offId); const r = rng(o.id.length * 13 + o.done)
  const idx = Array.from({ length: o.done }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
  const absen = new Set(idx.slice(0, o.done - o.hadir))
  const tp = TOPIK[o.subjectId] ?? ['Pengantar Materi', 'Konsep Dasar', 'Praktik Terbimbing', 'Studi Kasus', 'Pendalaman', 'Evaluasi Bab']
  return Array.from({ length: o.done }, (_, i) => {
    const slot = o.jadwal[0]
    const tgl = addDays(TODAY, -(o.done - 1 - i) * 7 - (TODAY.getDay() - slot.hari + 7) % 7)
    const st = absen.has(i) ? (['Izin', 'Sakit', 'Alpa'] as const)[i % 3] : 'Hadir'
    return { no: i + 1, tanggal: tgl, jam: `${slot.mulai} - ${slot.selesai}`, materi: tp[i % tp.length], status: st, tgl: fmtTglPendek(tgl) }
  })
}

// ---------- Nilai ----------
export const nilaiSiswa = (sid: string) => {
  const s = studentById(sid)
  return siswaOfferings(s.kelasId).map((o, i) => {
    const r = rng(Number(sid.slice(1)) * 17 + i)
    const base = s.rata
    const tugas = Math.min(100, Math.max(40, Math.round(base + (r() - 0.5) * 16)))
    const kuis = Math.min(100, Math.max(40, Math.round(base + (r() - 0.5) * 20)))
    const uts = Math.min(100, Math.max(40, Math.round(base + (r() - 0.5) * 18)))
    const rata = Math.round(tugas * 0.3 + kuis * 0.2 + uts * 0.3 + (base) * 0.2)
    return { off: o, mapel: subjectById(o.subjectId).nama, tugas, kuis, uts, rata, predikat: predikat(rata) }
  })
}
export const predikat = (n: number) => (n >= 90 ? 'A' : n >= 80 ? 'B' : n >= 70 ? 'C' : 'D')
export const absensiSiswa = (sid: string) => {
  const s = studentById(sid); const r = rng(Number(sid.slice(1)) + 5)
  return siswaOfferings(s.kelasId).map((o) => {
    const done = o.done; const hadir = sid === ME_SISWA.id ? o.hadir : Math.round(done * (s.hadir / 100) * (0.95 + r() * 0.05))
    const rest = done - hadir; const izin = Math.round(rest * 0.4); const sakit = Math.round(rest * 0.4); const alpa = rest - izin - sakit
    return { mapel: subjectById(o.subjectId).nama, hadir, izin, sakit, alpa, total: done, persen: done ? Math.round((hadir / done) * 100) : 0 }
  })
}
export const trenNilaiBulan = [{ b: 'Jul', v: 74 }, { b: 'Agu', v: 77 }, { b: 'Sep', v: 79 }, { b: 'Okt', v: 83 }]

// ---------- Pengumuman & Notifikasi ----------
export const pengumuman = [
  { id: 'p1', judul: 'Jadwal Penilaian Akhir Semester Ganjil 2026/2027', isi: 'Penilaian Akhir Semester (PAS) Ganjil akan dilaksanakan pada 7-11 Desember 2026. Siswa diharapkan melengkapi seluruh tugas dan kuis sebelum 4 Desember 2026. Kisi-kisi dibagikan oleh guru mata pelajaran masing-masing.', oleh: 'Wakil Kepala Sekolah Bid. Kurikulum', tgl: '28 Okt 2026', kategori: 'Akademik', penting: true },
  { id: 'p2', judul: 'Peringatan Hari Sumpah Pemuda ke-98', isi: 'Upacara peringatan Hari Sumpah Pemuda dilaksanakan hari Rabu, 28 Oktober 2026 pukul 07.00 di lapangan sekolah. Seluruh siswa mengenakan seragam lengkap.', oleh: 'Kesiswaan', tgl: '27 Okt 2026', kategori: 'Kegiatan', penting: false },
  { id: 'p3', judul: 'Pemeliharaan Server Pembelajaran Digital', isi: 'Pada Sabtu, 31 Oktober 2026 pukul 22.00-24.00 WIB sistem akan mengalami pemeliharaan berkala. Harap tidak mengerjakan kuis pada rentang waktu tersebut.', oleh: 'Tim TIK Sekolah', tgl: '26 Okt 2026', kategori: 'Sistem', penting: true },
  { id: 'p4', judul: 'Pendaftaran Lomba Kompetensi Siswa (LKS) Tingkat Kabupaten', isi: 'Siswa kelas XI dan XII yang berminat mengikuti LKS bidang Web Technologies, IT Network Systems, dan Graphic Design dapat mendaftar ke guru produktif paling lambat 5 November 2026.', oleh: 'Humas', tgl: '24 Okt 2026', kategori: 'Lomba', penting: false },
  { id: 'p5', judul: 'Pembagian Rapor Tengah Semester', isi: 'Rapor tengah semester dapat dilihat pada menu Nilai & Kehadiran. Orang tua/wali murid diundang ke sekolah pada 14 November 2026 pukul 08.00.', oleh: 'Wali Kelas', tgl: '20 Okt 2026', kategori: 'Akademik', penting: false },
  { id: 'p6', judul: 'Tata Tertib Penggunaan Laboratorium Komputer', isi: 'Siswa wajib menjaga kebersihan dan keamanan perangkat laboratorium. Dilarang membawa makanan dan minuman ke dalam ruang laboratorium.', oleh: 'Kepala Laboratorium', tgl: '15 Okt 2026', kategori: 'Tata Tertib', penting: false },
]
export const notifikasi = [
  { id: 'n1', judul: 'Tugas baru: Tugas Responsive Layout dengan Flexbox', waktu: '08.15', grup: 'Hari Ini', jenis: 'Tugas', ikon: 'tugas' },
  { id: 'n2', judul: 'Kuis Basis Data Bab 3 ditutup besok pukul 23.59', waktu: '07.30', grup: 'Hari Ini', jenis: 'Kuis', ikon: 'kuis' },
  { id: 'n3', judul: 'Pengumuman: Jadwal Penilaian Akhir Semester', waktu: '06.45', grup: 'Hari Ini', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n4', judul: 'Nilai Job Application Letter telah dipublikasikan', waktu: '16.20', grup: 'Kemarin', jenis: 'Nilai', ikon: 'nilai' },
  { id: 'n5', judul: 'Materi baru ditambahkan: CSS Grid dan Responsive Design', waktu: '14.05', grup: 'Kemarin', jenis: 'Materi', ikon: 'materi' },
  { id: 'n6', judul: 'Pengingat: Pemeliharaan server Sabtu malam', waktu: '10.00', grup: 'Kemarin', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n7', judul: 'Presensi Pemrograman Web pertemuan ke-17 tercatat Hadir', waktu: '13.40', grup: 'Kemarin', jenis: 'Presensi', ikon: 'hadir' },
  { id: 'n8', judul: 'Tugas Latihan Query SELECT dan JOIN telah dinilai', waktu: '09.10', grup: 'Hari Ini', jenis: 'Nilai', ikon: 'nilai' },
]
export const notifGuru = [
  { id: 'n1', judul: 'Dimas Pratama mengumpulkan Tugas Responsive Layout', waktu: '09.05', grup: 'Hari Ini', jenis: 'Tugas', ikon: 'tugas' },
  { id: 'n2', judul: '5 pengumpulan baru menunggu penilaian di XI RPL 1', waktu: '08.20', grup: 'Hari Ini', jenis: 'Tugas', ikon: 'tugas' },
  { id: 'n3', judul: 'Jadwal mengajar hari ini: 1 kelas, mulai 12.40', waktu: '06.00', grup: 'Hari Ini', jenis: 'Jadwal', ikon: 'info' },
  { id: 'n4', judul: 'Kuis JavaScript Dasar (XI RPL 2) sedang berlangsung', waktu: '15.30', grup: 'Kemarin', jenis: 'Kuis', ikon: 'kuis' },
  { id: 'n5', judul: 'Pengumuman: Pemeliharaan server Sabtu malam', waktu: '10.00', grup: 'Kemarin', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n6', judul: 'Rekap presensi XII RPL 1 bulan Oktober siap diekspor', waktu: '08.00', grup: 'Kemarin', jenis: 'Presensi', ikon: 'hadir' },
]
export const notifUmum = [
  { id: 'n1', judul: 'Rekap kehadiran bulan Oktober telah diperbarui', waktu: '08.00', grup: 'Hari Ini', jenis: 'Laporan', ikon: 'info' },
  { id: 'n2', judul: '4 siswa masuk kategori berisiko pekan ini', waktu: '07.10', grup: 'Hari Ini', jenis: 'Peringatan', ikon: 'info' },
  { id: 'n3', judul: 'Pengumuman: Jadwal Penilaian Akhir Semester', waktu: '06.45', grup: 'Hari Ini', jenis: 'Pengumuman', ikon: 'info' },
  { id: 'n4', judul: 'Laporan nilai tengah semester telah dipublikasikan', waktu: '15.00', grup: 'Kemarin', jenis: 'Laporan', ikon: 'nilai' },
  { id: 'n5', judul: 'Data kelas XI RPL 2 diperbarui oleh Tata Usaha', waktu: '11.20', grup: 'Kemarin', jenis: 'Data', ikon: 'info' },
]

// ---------- Kalender akademik ----------
export const kalender = [
  { tgl: '2026-10-05', akhir: '2026-10-09', judul: 'Ujian Tengah Semester (UTS) Ganjil', jenis: 'UTS' },
  { tgl: '2026-10-28', akhir: '2026-10-28', judul: 'Peringatan Hari Sumpah Pemuda', jenis: 'Kegiatan' },
  { tgl: '2026-11-10', akhir: '2026-11-10', judul: 'Upacara Hari Pahlawan', jenis: 'Kegiatan' },
  { tgl: '2026-11-14', akhir: '2026-11-14', judul: 'Pembagian Rapor Tengah Semester', jenis: 'Kegiatan' },
  { tgl: '2026-12-07', akhir: '2026-12-11', judul: 'Penilaian Akhir Semester (UAS) Ganjil', jenis: 'UAS' },
  { tgl: '2026-12-19', akhir: '2027-01-03', judul: 'Libur Semester Ganjil', jenis: 'Libur' },
  { tgl: '2026-12-25', akhir: '2026-12-25', judul: 'Hari Raya Natal', jenis: 'Libur' },
  { tgl: '2027-01-04', akhir: '2027-01-04', judul: 'Awal Semester Genap 2026/2027', jenis: 'Kegiatan' },
]

// ---------- Statistik ----------
export const kelasStat = kelas.map((k, i) => { const ss = studentsOf(k.id); return { id: k.id, nama: k.nama, hadir: Math.round(ss.reduce((a, s) => a + s.hadir, 0) / ss.length), nilai: Math.round(ss.reduce((a, s) => a + s.rata, 0) / ss.length), siswa: 25, berisiko: ss.filter((s) => s.risiko).length, rank: i } })
export const bulanHadir = [{ b: 'Jul', v: 94 }, { b: 'Agu', v: 91 }, { b: 'Sep', v: 88 }, { b: 'Okt', v: 86 }]
export const distribusiNilai = [{ r: '<60', v: 1 }, { r: '60-69', v: 3 }, { r: '70-79', v: 7 }, { r: '80-89', v: 10 }, { r: '90-100', v: 4 }]
export const keaktifanGuru = teachers.map((t, i) => { const r = rng(i + 40); return { ...t, materi: Math.round(8 + r() * 24), tugas: Math.round(4 + r() * 12), kuis: Math.round(2 + r() * 7), presensi: Math.round(70 + r() * 30), terakhir: i === 0 ? 'Hari ini, 09.05' : i === 1 ? 'Hari ini, 07.40' : `${1 + i} hari lalu`, kelasN: guruOfferings(t.id).length } })

// ---------- TU ----------
export const logs = [
  ['Winda Kartika', 'Tata Usaha', 'Menambah data siswa: Bella Amelia', 'Data Siswa', '29 Okt 2026, 09.12', '192.168.1.14'],
  ['Sari Dewi', 'Guru', 'Mempublikasikan tugas: Tugas Responsive Layout', 'Tugas', '29 Okt 2026, 08.30', '192.168.1.45'],
  ['Hendra Kurniawan', 'Guru', 'Menyimpan presensi XI RPL 1 pertemuan 13', 'Presensi', '29 Okt 2026, 08.05', '192.168.1.52'],
  ['Winda Kartika', 'Tata Usaha', 'Mengubah jadwal pelajaran XI TKJ 1', 'Jadwal', '28 Okt 2026, 15.44', '192.168.1.14'],
  ['Rina Aulia', 'Siswa', 'Login ke sistem', 'Autentikasi', '28 Okt 2026, 13.01', '10.10.2.88'],
  ['Winda Kartika', 'Tata Usaha', 'Reset kata sandi pengguna: Fajar Nugroho', 'Pengguna', '28 Okt 2026, 10.20', '192.168.1.14'],
  ['Lestari Handayani', 'Guru', 'Mengunggah materi: Fungsi Kuadrat', 'Materi', '27 Okt 2026, 14.12', '192.168.1.61'],
  ['Budi Santoso', 'Guru', 'Memberi nilai tugas Resume Pancasila', 'Penilaian', '27 Okt 2026, 11.37', '192.168.1.33'],
  ['Winda Kartika', 'Tata Usaha', 'Menambah penugasan guru: Agus Wijaya - Produktif RPL', 'Penugasan', '26 Okt 2026, 09.58', '192.168.1.14'],
  ['Winda Kartika', 'Tata Usaha', 'Mengimpor data siswa dari Excel (25 baris)', 'Data Siswa', '26 Okt 2026, 08.40', '192.168.1.14'],
  ['Nurul Hidayah', 'Guru', 'Membuat pengumuman kelas XI RPL 2', 'Pengumuman', '25 Okt 2026, 16.02', '192.168.1.70'],
  ['Dimas Pratama', 'Siswa', 'Mengumpulkan tugas Rancangan ERD', 'Tugas', '25 Okt 2026, 12.19', '10.10.2.91'],
].map((l, i) => ({ id: i + 1, user: l[0], role: l[1], aksi: l[2], modul: l[3], waktu: l[4], ip: l[5] }))
export const tahunAjaran = [
  { id: 'ta1', nama: '2026/2027', semester: 'Ganjil', mulai: '13 Jul 2026', selesai: '19 Des 2026', aktif: true },
  { id: 'ta2', nama: '2025/2026', semester: 'Genap', mulai: '5 Jan 2026', selesai: '27 Jun 2026', aktif: false },
  { id: 'ta3', nama: '2025/2026', semester: 'Ganjil', mulai: '14 Jul 2025', selesai: '20 Des 2025', aktif: false },
]
export const jamPelajaran = [['1', '07.00 - 07.45'], ['2', '07.45 - 08.30'], ['3', '08.30 - 09.15'], ['4', '09.15 - 10.00'], ['5', '10.20 - 11.05'], ['6', '11.05 - 11.50'], ['7', '12.40 - 13.25'], ['8', '13.25 - 14.10']]
export const KATEGORI_KOMENTAR = ['Pekerjaan sudah sangat baik, pertahankan!', 'Perhatikan kerapian dan kelengkapan jawaban.', 'Mohon lengkapi sumber referensi pada laporan.', 'Perlu perbaikan pada bagian analisis, silakan revisi.']
export const mediaFiles = [
  { id: 'f1', nama: 'Modul-HTML-Dasar.pdf', tipe: 'dokumen', ukuran: '2,4 MB', tgl: '12 Okt 2026' }, { id: 'f2', nama: 'Infografis-Flexbox.png', tipe: 'gambar', ukuran: '860 KB', tgl: '15 Okt 2026' },
  { id: 'f3', nama: 'Slide-CSS-Selector.pdf', tipe: 'dokumen', ukuran: '1,8 MB', tgl: '14 Okt 2026' }, { id: 'f4', nama: 'Tutorial HTML Crash Course', tipe: 'youtube', ukuran: 'Tautan', tgl: '10 Okt 2026' },
  { id: 'f5', nama: 'Diagram-ERD-Contoh.png', tipe: 'gambar', ukuran: '540 KB', tgl: '20 Okt 2026' }, { id: 'f6', nama: 'Panduan-JavaScript.pdf', tipe: 'dokumen', ukuran: '3,1 MB', tgl: '22 Okt 2026' },
  { id: 'f7', nama: 'Video: Responsive Design', tipe: 'youtube', ukuran: 'Tautan', tgl: '23 Okt 2026' }, { id: 'f8', nama: 'Mockup-Landing-Page.png', tipe: 'gambar', ukuran: '1,3 MB', tgl: '24 Okt 2026' },
  { id: 'f9', nama: 'Soal-Latihan-PHP.pdf', tipe: 'dokumen', ukuran: '980 KB', tgl: '26 Okt 2026' },
]
export const ROLE_ORDER = ['Siswa', 'Guru', 'Wali Kelas', 'Kepala Sekolah', 'Tata Usaha']
export const permissions = [
  ['Lihat materi & tugas', true, true, true, true, true], ['Kumpulkan tugas & kuis', true, false, false, false, false], ['Kelola materi', false, true, false, false, true],
  ['Presensi manual', false, true, false, false, false], ['Input nilai', false, true, false, false, false], ['Lihat rekap kelas', false, true, true, true, true],
  ['Lihat statistik sekolah', false, false, false, true, true], ['Kelola data master', false, false, false, false, true], ['Kelola pengguna', false, false, false, false, true],
]

export const seedStat = (sid: string, n: number, hadirPct: number) => { const r = rng(Number(sid.slice(1)) * 53 + n * 7)(); return r < hadirPct / 100 ? 'H' : r < hadirPct / 100 + (1 - hadirPct / 100) * 0.4 ? 'I' : r < hadirPct / 100 + (1 - hadirPct / 100) * 0.75 ? 'S' : 'A' }
export const nilaiKelas = (kid: string, off: string) => studentsOf(kid).map((s, i) => { const r = rng(Number(s.id.slice(1)) * 3 + off.length + i); const j = (b: number, w: number) => Math.min(100, Math.max(45, Math.round(b + (r() - 0.5) * w))); const tugas = j(s.rata, 20), kuis = j(s.rata, 24), uts = j(s.rata, 20), uas = j(s.rata - 2, 24); return { id: s.id, siswa: s, tugas, kuis, uts, uas, akhir: Math.round(tugas * 0.3 + kuis * 0.2 + uts * 0.3 + uas * 0.2) } })
