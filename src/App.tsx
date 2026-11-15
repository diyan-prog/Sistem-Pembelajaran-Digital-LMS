import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppProvider, ROLES, useApp } from '@/store'
import { RoleGate, SidebarLayout, TopNavLayout } from '@/components/layouts'
import { PageHeader, useCrumbs } from '@/components/ui'
import PageLoader from '@/components/PageLoader'
import { RouteLoader } from '@/components/RouteLoader'

const GantiSandi = lazy(() => import('@/pages/auth').then(m => ({ default: m.GantiSandi })))
const LupaSandi = lazy(() => import('@/pages/auth').then(m => ({ default: m.LupaSandi })))
const NotFound = lazy(() => import('@/pages/auth').then(m => ({ default: m.NotFound })))
const Login = lazy(() => import('@/pages/login').then(m => ({ default: m.Login })))

const AkunPage = lazy(() => import('@/pages/shared').then(m => ({ default: m.AkunPage })))
const JadwalPage = lazy(() => import('@/pages/shared').then(m => ({ default: m.JadwalPage })))
const NotifikasiPage = lazy(() => import('@/pages/shared').then(m => ({ default: m.NotifikasiPage })))
const PanduanPage = lazy(() => import('@/pages/shared').then(m => ({ default: m.PanduanPage })))
const PengaturanPage = lazy(() => import('@/pages/shared').then(m => ({ default: m.PengaturanPage })))
const PengumumanDetail = lazy(() => import('@/pages/shared').then(m => ({ default: m.PengumumanDetail })))
const PengumumanList = lazy(() => import('@/pages/shared').then(m => ({ default: m.PengumumanList })))

const KelasDetailSiswa = lazy(() => import('@/pages/siswa').then(m => ({ default: m.KelasDetailSiswa })))
const KuisHasil = lazy(() => import('@/pages/siswa').then(m => ({ default: m.KuisHasil })))
const KuisInstruksi = lazy(() => import('@/pages/siswa').then(m => ({ default: m.KuisInstruksi })))
const KuisKerjakan = lazy(() => import('@/pages/siswa').then(m => ({ default: m.KuisKerjakan })))
const MateriPreview = lazy(() => import('@/pages/siswa').then(m => ({ default: m.MateriPreview })))
const NilaiKehadiran = lazy(() => import('@/pages/siswa').then(m => ({ default: m.NilaiKehadiran })))
const SiswaBeranda = lazy(() => import('@/pages/siswa').then(m => ({ default: m.SiswaBeranda })))
const SiswaKelasSaya = lazy(() => import('@/pages/siswa').then(m => ({ default: m.SiswaKelasSaya })))
const TugasDetail = lazy(() => import('@/pages/siswa').then(m => ({ default: m.TugasDetail })))
const TugasKuisPage = lazy(() => import('@/pages/siswa').then(m => ({ default: m.TugasKuisPage })))

const DaftarSiswaPage = lazy(() => import('@/pages/guru1').then(m => ({ default: m.DaftarSiswaPage })))
const GuruBeranda = lazy(() => import('@/pages/guru1').then(m => ({ default: m.GuruBeranda })))
const GuruKelasSaya = lazy(() => import('@/pages/guru1').then(m => ({ default: m.GuruKelasSaya })))
const KelasDetailGuru = lazy(() => import('@/pages/guru1').then(m => ({ default: m.KelasDetailGuru })))
const KelolaMateri = lazy(() => import('@/pages/guru1').then(m => ({ default: m.KelolaMateri })))
const KuisForm = lazy(() => import('@/pages/guru1').then(m => ({ default: m.KuisForm })))
const KuisListGuru = lazy(() => import('@/pages/guru1').then(m => ({ default: m.KuisListGuru })))
const TugasForm = lazy(() => import('@/pages/guru1').then(m => ({ default: m.TugasForm })))
const TugasListPage = lazy(() => import('@/pages/guru1').then(m => ({ default: m.TugasListPage })))

const BankSoal = lazy(() => import('@/pages/guru2').then(m => ({ default: m.BankSoal })))
const KuisHasilGuru = lazy(() => import('@/pages/guru2').then(m => ({ default: m.KuisHasilGuru })))
const MediaLibrary = lazy(() => import('@/pages/guru2').then(m => ({ default: m.MediaLibrary })))
const Penilaian = lazy(() => import('@/pages/guru2').then(m => ({ default: m.Penilaian })))
const PresensiList = lazy(() => import('@/pages/guru2').then(m => ({ default: m.PresensiList })))
const PresensiPick = lazy(() => import('@/pages/guru2').then(m => ({ default: m.PresensiPick })))
const PresensiSesi = lazy(() => import('@/pages/guru2').then(m => ({ default: m.PresensiSesi })))
const RekapNilaiKelas = lazy(() => import('@/pages/guru2').then(m => ({ default: m.RekapNilaiKelas })))
const RekapNilaiPick = lazy(() => import('@/pages/guru2').then(m => ({ default: m.RekapNilaiPick })))
const RekapPresensi = lazy(() => import('@/pages/guru2').then(m => ({ default: m.RekapPresensi })))

const KepsekBeranda = lazy(() => import('@/pages/wali').then(m => ({ default: m.KepsekBeranda })))
const KepsekGuru = lazy(() => import('@/pages/wali').then(m => ({ default: m.KepsekGuru })))
const KepsekLaporan = lazy(() => import('@/pages/wali').then(m => ({ default: m.KepsekLaporan })))
const KepsekStatistik = lazy(() => import('@/pages/wali').then(m => ({ default: m.KepsekStatistik })))
const WaliBeranda = lazy(() => import('@/pages/wali').then(m => ({ default: m.WaliBeranda })))
const WaliKelas = lazy(() => import('@/pages/wali').then(m => ({ default: m.WaliKelas })))
const WaliRekapHadir = lazy(() => import('@/pages/wali').then(m => ({ default: m.WaliRekapHadir })))
const WaliRekapNilai = lazy(() => import('@/pages/wali').then(m => ({ default: m.WaliRekapNilai })))
const WaliSiswaDetail = lazy(() => import('@/pages/wali').then(m => ({ default: m.WaliSiswaDetail })))

const DataGuru = lazy(() => import('@/pages/tu').then(m => ({ default: m.DataGuru })))
const DataJurusan = lazy(() => import('@/pages/tu').then(m => ({ default: m.DataJurusan })))
const DataKelas = lazy(() => import('@/pages/tu').then(m => ({ default: m.DataKelas })))
const DataMapel = lazy(() => import('@/pages/tu').then(m => ({ default: m.DataMapel })))
const DataSiswa = lazy(() => import('@/pages/tu').then(m => ({ default: m.DataSiswa })))
const JadwalEditor = lazy(() => import('@/pages/tu').then(m => ({ default: m.JadwalEditor })))
const KelasDetailTU = lazy(() => import('@/pages/tu').then(m => ({ default: m.KelasDetailTU })))
const LogAktivitas = lazy(() => import('@/pages/tu').then(m => ({ default: m.LogAktivitas })))
const ManajemenPengguna = lazy(() => import('@/pages/tu').then(m => ({ default: m.ManajemenPengguna })))
const PengaturanSistem = lazy(() => import('@/pages/tu').then(m => ({ default: m.PengaturanSistem })))
const PenugasanGuru = lazy(() => import('@/pages/tu').then(m => ({ default: m.PenugasanGuru })))
const TUDashboard = lazy(() => import('@/pages/tu').then(m => ({ default: m.TUDashboard })))
const TahunAjaran = lazy(() => import('@/pages/tu').then(m => ({ default: m.TahunAjaran })))

const common = [<Route key="n" path="notifikasi" element={<NotifikasiPage />} />, <Route key="a" path="akun" element={<AkunPage />} />, <Route key="g" path="panduan" element={<PanduanPage />} />]
const pengaturan = <Route path="pengaturan" element={<PengaturanPage />} />
const pengumuman = [<Route key="p" path="pengumuman" element={<PengumumanList />} />, <Route key="pd" path="pengumuman/:id" element={<PengumumanDetail />} />]

function Home() { const { role } = useApp(); return <Navigate to={role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login'} replace /> }

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <RouteLoader />
      <AppProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lupa-sandi" element={<LupaSandi />} />
          <Route path="/ganti-sandi" element={<GantiSandi />} />

          <Route path="/siswa" element={<RoleGate role="siswa" />}>
            <Route path="kuis/:id/kerjakan" element={<KuisKerjakan />} />
            <Route element={<TopNavLayout />}>
              <Route index element={<Navigate to="beranda" replace />} />
              <Route path="beranda" element={<SiswaBeranda />} />
              <Route path="kelas" element={<SiswaKelasSaya />} />
              <Route path="kelas/:id" element={<KelasDetailSiswa />} />
              <Route path="kelas/:id/materi/:mid" element={<MateriPreview />} />
              <Route path="tugas" element={<TugasKuisPage />} />
              <Route path="tugas/:id" element={<TugasDetail />} />
              <Route path="kuis/:id" element={<KuisInstruksi />} />
              <Route path="kuis/:id/hasil" element={<KuisHasil />} />
              <Route path="nilai" element={<NilaiKehadiran />} />
              <Route path="jadwal" element={<JadwalPage />} />
              {pengumuman}{common}{pengaturan}
            </Route>
          </Route>

          <Route path="/guru" element={<RoleGate role="guru" />}>
            <Route element={<TopNavLayout />}>
              <Route index element={<Navigate to="beranda" replace />} />
              <Route path="beranda" element={<GuruBeranda />} />
              <Route path="kelas" element={<GuruKelasSaya />} />
              <Route path="kelas/:id" element={<KelasDetailGuru />} />
              <Route path="kelas/:id/materi" element={<KelolaMateriRoute />} />
              <Route path="kelas/:id/siswa" element={<DaftarSiswaPage />} />
              <Route path="presensi" element={<PresensiPick />} />
              <Route path="presensi/:offId" element={<PresensiList />} />
              <Route path="presensi/:offId/sesi/:n" element={<PresensiSesi />} />
              <Route path="presensi/:offId/rekap" element={<RekapPresensi />} />
              <Route path="penilaian" element={<Penilaian />} />
              <Route path="tugas" element={<TugasListPage />} />
              <Route path="tugas/baru" element={<TugasForm />} />
              <Route path="tugas/:id/edit" element={<TugasForm />} />
              <Route path="kuis" element={<div><KuisListWrap /></div>} />
              <Route path="kuis/baru" element={<KuisForm />} />
              <Route path="kuis/:id/edit" element={<KuisForm />} />
              <Route path="kuis/:id/hasil" element={<KuisHasilGuru />} />
              <Route path="bank-soal" element={<BankSoal />} />
              <Route path="rekap-nilai" element={<RekapNilaiPick />} />
              <Route path="rekap-nilai/:offId" element={<RekapNilaiKelas />} />
              <Route path="jadwal" element={<JadwalPage />} />
              <Route path="media" element={<MediaLibrary />} />
              {pengumuman}{common}{pengaturan}
            </Route>
          </Route>

          <Route path="/wali" element={<RoleGate role="wali" />}>
            <Route element={<TopNavLayout />}>
              <Route index element={<Navigate to="beranda" replace />} />
              <Route path="beranda" element={<WaliBeranda />} />
              <Route path="siswa/:id" element={<WaliSiswaDetail />} />
              <Route path="kelas" element={<WaliKelas />} />
              <Route path="rekap-nilai" element={<WaliRekapNilai />} />
              <Route path="rekap-kehadiran" element={<WaliRekapHadir />} />
              {pengumuman}{common}{pengaturan}
            </Route>
          </Route>

          <Route path="/kepsek" element={<RoleGate role="kepsek" />}>
            <Route element={<TopNavLayout />}>
              <Route index element={<Navigate to="beranda" replace />} />
              <Route path="beranda" element={<KepsekBeranda />} />
              <Route path="statistik" element={<KepsekStatistik />} />
              <Route path="laporan" element={<KepsekLaporan />} />
              <Route path="guru" element={<KepsekGuru />} />
              {pengumuman}{common}{pengaturan}
            </Route>
          </Route>

          <Route path="/tu" element={<RoleGate role="tu" />}>
            <Route element={<SidebarLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TUDashboard />} />
              <Route path="siswa" element={<DataSiswa />} />
              <Route path="guru" element={<DataGuru />} />
              <Route path="kelas" element={<DataKelas />} />
              <Route path="kelas/:id" element={<KelasDetailTU />} />
              <Route path="mapel" element={<DataMapel />} />
              <Route path="jurusan" element={<DataJurusan />} />
              <Route path="jadwal" element={<JadwalEditor />} />
              <Route path="penugasan" element={<PenugasanGuru />} />
              <Route path="tahun-ajaran" element={<TahunAjaran />} />
              <Route path="pengguna" element={<ManajemenPengguna />} />
              <Route path="log" element={<LogAktivitas />} />
              <Route path="pengaturan" element={<PengaturanSistem />} />
              {common}
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  )
}
function KelolaMateriRoute() { const { id } = useParams(); return <KelolaMateri key={id} offId={id!} /> }
function KuisListWrap() { return <><PageHeader crumbs={useCrumbs({ l: 'Daftar Kuis' })} title="Daftar Kuis" subtitle="Semua kuis dari kelas yang Anda ampu" /><KuisListGuru /></> }
