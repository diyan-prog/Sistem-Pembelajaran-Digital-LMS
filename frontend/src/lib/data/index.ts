// Titik impor tunggal data akademik. Menggantikan '@/mocks' untuk semua nilai
// yang bersumber dari database (snapshot /api/v1/akademik/bootstrap).
//
// Bentuk ekspor dibuat kompatibel dengan pemakaian lama:
// - fungsi untuk akses per-id dan peran (`offeringById`, `studentsOf`, ...)
// - array hidup untuk daftar (`tugas`, `kuis`, `bankSoal`, `students`, ...)
//   sehingga `tugas.filter(...)` tetap bekerja tanpa menyalin data.
import {
  BULAN, BULAN_S, HARI, HARI_S, SEMESTER, TODAY, addDays, fmtBatas, fmtSlot, fmtTgl, fmtTglPendek, weekDays,
  KATEGORI_KOMENTAR, jamPelajaran, kalender, logs, mediaFiles, notifGuru, notifUmum, tahunAjaran, notifikasiContoh,
} from './static'
import { derived, getSnapshot, useStore, type Row } from '@/lib/store'
import { group, lower, str } from './entities'
import {
  offeringById, offeringTitle, pct, scheduleOf,
  offerings as offeringList, archived as archivedList, myOfferings,
  siswaOfferings, guruOfferings,
  tugas as tugasList, tugasById, myTugas, subSiswa, waitingCount,
  kuis as kuisList, kuisById, myKuis, kuisSoalOf,
  bankSoal as bankSoalList,
} from './academic'
import {
  teachers as teacherList, teacherById, sapaanOf, isTeacherRole,
  jurusan as jurusanList, jurusanNama,
  subjects as subjectList, subjectById,
  kelas as kelasList, kelasById,
  students as studentList, studentsOf, studentById, meSiswa, currentUserId, myKelasId,
} from './entities'
import {
  nilaiSiswa, absensiSiswa, nilaiKelas, predikat, seedStat,
  rekapHadirKelas,
  kelasStat as kelasStatList, distribusiNilai as distribusiNilaiList,
  bulanHadir as bulanHadirList, trenNilaiBulan as trenNilaiBulanList, keaktifanGuru as keaktifanGuruList,
} from './stats'
import { live } from './live'

export * from './static'
export type {
  Slot, Siswa, Teacher, Subject, Kelas, Jurusan, Offering, TStatus, Tugas, Soal, Kuis,
} from './entities'
export { semesterOf, sapaanOf, isTeacherRole } from './entities'
export type { Submission } from './academic'
export type { KeaktifanGuru } from './stats'

export {
  offeringById, offeringTitle, pct, scheduleOf, myOfferings, siswaOfferings, guruOfferings,
  tugasById, myTugas, subSiswa, waitingCount,
  kuisById, myKuis, kuisSoalOf,
  teacherById, jurusanNama, subjectById, kelasById, studentsOf, studentById, meSiswa,
  nilaiSiswa, absensiSiswa, nilaiKelas, predikat, seedStat,
  currentUserId, myKelasId, rekapHadirKelas,
}

export const offerings = live(offeringList)
export const archived = live(archivedList)
export const tugas = live(tugasList)
export const kuis = live(kuisList)
export const bankSoal = live(bankSoalList)
export const kuisSoal = live(() => bankSoalList().slice(0, 10))
export const teachers = live(teacherList)
export const jurusan = live(jurusanList)
export const subjects = live(subjectList)
export const kelas = live(kelasList)
export const students = live(studentList)
export const siswa = live(studentList)
export const kelasStat = live(kelasStatList)
export const distribusiNilai = live(distribusiNilaiList)
export const bulanHadir = live(bulanHadirList)
export const trenNilaiBulan = live(trenNilaiBulanList)
export const keaktifanGuru = live(keaktifanGuruList)

// Konten statis yang tidak punya tabel di database.
export {
  BULAN, BULAN_S, HARI, HARI_S, SEMESTER, TODAY, addDays, fmtBatas, fmtSlot, fmtTgl, fmtTglPendek, weekDays,
  KATEGORI_KOMENTAR, jamPelajaran, kalender, logs, mediaFiles, notifGuru, notifUmum, tahunAjaran, notifikasiContoh,
}

/** Berlangganan snapshot; panggil di komponen agar render ulang setelah data termuat. */
export const useData = () => useStore()

// ==================== MATERI & PERTEMUAN ====================
export type MateriItem = { id: string; judul: string; tipe: 'dokumen' | 'gambar' | 'youtube'; ukuran?: string; tanggal: string; yt?: string; ext?: string; tampil: boolean }
export type Pertemuan = { id: string; no: number; judul: string; tanggal: string; items: MateriItem[] }

const tipeMateri = (row: Row): MateriItem['tipe'] => {
  if (str(row.link_video)) return 'youtube'
  const file = lower(row.file_materi)
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(file)) return 'gambar'
  return 'dokumen'
}

const extMateri = (row: Row): string | undefined => {
  const file = str(row.file_materi)
  const m = /\.([a-z0-9]+)$/i.exec(file)
  return m ? m[1].toUpperCase() : undefined
}

const mapMateri = (row: Row): MateriItem => ({
  id: str(row.id_materi),
  judul: str(row.judul),
  tipe: tipeMateri(row),
  ukuran: str(row.ukuran) || undefined,
  tanggal: str(row.tanggal_upload) ? fmtTglPendek(new Date(str(row.tanggal_upload))) : '',
  yt: str(row.link_video) || undefined,
  ext: extMateri(row),
  tampil: row.tampil === undefined ? true : Boolean(row.tampil),
})

export const materiOf = (pengampuId: string): Pertemuan[] =>
  derived(`materi:${pengampuId}`, () => {
    const snap = getSnapshot()
    const materi = snap.materi.filter((m) => str(m.id_pengampu) === pengampuId)
    const perPertemuan = group(materi, 'id_pertemuan')
    const list: Pertemuan[] = snap.pertemuan
      .filter((p) => str(p.id_pengampu) === pengampuId)
      .sort((a, b) => Number(a.no_pertemuan) - Number(b.no_pertemuan))
      .map((p) => ({
        id: str(p.id_pertemuan),
        no: Number(p.no_pertemuan) || 0,
        judul: str(p.judul),
        tanggal: str(p.tanggal) ? fmtTglPendek(new Date(str(p.tanggal))) : '',
        items: (perPertemuan[str(p.id_pertemuan)] ?? []).map(mapMateri),
      }))
    // Materi tanpa keterkaitan pertemuan tetap ditampilkan agar tidak hilang.
    const tanpaPertemuan = materi.filter((m) => !str(m.id_pertemuan)).map(mapMateri)
    if (tanpaPertemuan.length) {
      list.unshift({ id: `${pengampuId}-materi`, no: 0, judul: 'Materi Kelas', tanggal: '', items: tanpaPertemuan })
    }
    return list
  })

export type Sesi = { no: number; tanggal: Date; jam: string; materi: string; status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa'; tgl: string }

export const sesiOf = (pengampuId: string): Sesi[] =>
  derived(`sesi:${pengampuId}`, () => {
    const snap = getSnapshot()
    const uid = str(snap.scope.user_id || snap.me?.id)
    const pertemuanById = new Map(snap.pertemuan.map((p) => [str(p.id_pertemuan), p]))
    const presensi = snap.presensi.filter((p) => str(p.id_pengampu) === pengampuId && str(p.id_siswa) === uid)
    const statusByTanggal = new Map(presensi.map((p) => [str(p.tanggal).slice(0, 10), lower(p.status)]))
    const rows = snap.presensi_sesi.filter((s) => str(s.pengampu_id) === pengampuId)
    const label = (v: string): Sesi['status'] => (v === 'hadir' ? 'Hadir' : v === 'izin' ? 'Izin' : v === 'sakit' ? 'Sakit' : v === 'alpa' ? 'Alpa' : 'Hadir')
    if (rows.length) {
      return rows
        .slice()
        .sort((a, b) => Number(a.pertemuan_ke) - Number(b.pertemuan_ke))
        .map((s) => {
          const tgl = str(s.tanggal) ? new Date(str(s.tanggal)) : new Date()
          const p = pertemuanById.get(str(s.topik)) ?? snap.pertemuan.find((x) => str(x.id_pengampu) === pengampuId && Number(x.no_pertemuan) === Number(s.pertemuan_ke))
          return {
            no: Number(s.pertemuan_ke) || 0,
            tanggal: tgl,
            jam: str(s.jam),
            materi: str(p?.judul ?? s.topik),
            status: label(statusByTanggal.get(str(s.tanggal).slice(0, 10)) ?? 'hadir'),
            tgl: fmtTglPendek(tgl),
          }
        })
    }
    // Tabel presensi_sesi belum terisi: pakai pertemuan yang benar-benar ada di
    // database agar daftar sesi dan rekap tidak kosong.
    const slot = getSnapshot().jadwal.find((j) => str(j.penugasan_id) === pengampuId)
    const jam = slot && slot.jam_mulai ? `${str(slot.jam_mulai).slice(0, 5)}-${str(slot.jam_selesai).slice(0, 5)}` : '-'
    return snap.pertemuan
      .filter((p) => str(p.id_pengampu) === pengampuId)
      .sort((a, b) => Number(a.no_pertemuan) - Number(b.no_pertemuan))
      .map((p) => {
        const tgl = str(p.tanggal) ? new Date(str(p.tanggal)) : new Date()
        return {
          no: Number(p.no_pertemuan) || 0,
          tanggal: tgl,
          jam,
          materi: str(p.judul),
          status: label(statusByTanggal.get(str(p.tanggal).slice(0, 10)) ?? 'hadir'),
          tgl: fmtTglPendek(tgl),
        }
      })
  })

// ==================== PENGUMUMAN & NOTIFIKASI ====================
export type Pengumuman = { id: string; judul: string; isi: string; oleh: string; tgl: string; kategori: string; penting: boolean }

const pengumumanList = (): Pengumuman[] =>
  derived('pengumuman', () => {
    const snap = getSnapshot()
    const profil = new Map(snap.profiles.map((p) => [str(p.id), str(p.nama_lengkap ?? p.full_name)]))
    return snap.pengumuman.map((p) => ({
      id: str(p.id),
      judul: str(p.judul),
      isi: str(p.isi),
      oleh: profil.get(str(p.dibuat_oleh)) ?? 'Sekolah',
      tgl: str(p.created_at) ? fmtTglPendek(new Date(str(p.created_at))) : '',
      kategori: str(p.kategori, 'Umum'),
      penting: Boolean(p.penting),
    }))
  })

export const pengumuman = live(pengumumanList)

export type NotifikasiItem = { id: string; judul: string; waktu: string; grup: string; jenis: string; ikon: string }

const ikonJenis = (jenis: string): string => {
  const j = jenis.toLowerCase()
  if (j.includes('tugas')) return 'tugas'
  if (j.includes('kuis')) return 'kuis'
  if (j.includes('nilai')) return 'nilai'
  if (j.includes('materi')) return 'materi'
  if (j.includes('presensi') || j.includes('hadir')) return 'hadir'
  return 'info'
}

const notifikasiList = (): NotifikasiItem[] =>
  derived('notifikasi', () => {
    const today = new Date()
    return getSnapshot().notifikasi.map((n) => {
      const tgl = str(n.created_at) ? new Date(str(n.created_at)) : today
      const sameDay = tgl.toDateString() === today.toDateString()
      const jenis = str(n.jenis, 'Info')
      return {
        id: str(n.id),
        judul: str(n.judul),
        waktu: tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.'),
        grup: sameDay ? 'Hari Ini' : 'Sebelumnya',
        jenis,
        ikon: ikonJenis(jenis),
      }
    })
  })

export const notifikasi = live(notifikasiList)

/** Jumlah penawaran kelas yang sudah dimuat; dipakai untuk gating tampilan. */
export const hasData = (): boolean => offerings.length > 0
