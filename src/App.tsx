import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppProvider, ROLES, useApp } from '@/store'
import { RoleGate, SidebarLayout, TopNavLayout } from '@/components/layouts'
import { PageHeader, useCrumbs } from '@/components/ui'
import { GantiSandi, LupaSandi, NotFound } from '@/pages/auth'
import { Login } from '@/pages/login'
import { AkunPage, JadwalPage, NotifikasiPage, PanduanPage, PengaturanPage, PengumumanDetail, PengumumanList } from '@/pages/shared'
import { KelasDetailSiswa, KuisHasil, KuisInstruksi, KuisKerjakan, MateriPreview, NilaiKehadiran, SiswaBeranda, SiswaKelasSaya, TugasDetail, TugasKuisPage } from '@/pages/siswa'
import { DaftarSiswaPage, GuruBeranda, GuruKelasSaya, KelasDetailGuru, KelolaMateri, KuisForm, KuisListGuru, TugasForm, TugasListPage } from '@/pages/guru1'
import { BankSoal, KuisHasilGuru, MediaLibrary, Penilaian, PresensiList, PresensiPick, PresensiSesi, RekapNilaiKelas, RekapNilaiPick, RekapPresensi } from '@/pages/guru2'
import { KepsekBeranda, KepsekGuru, KepsekLaporan, KepsekStatistik, WaliBeranda, WaliKelas, WaliRekapHadir, WaliRekapNilai, WaliSiswaDetail } from '@/pages/wali'
import { DataGuru, DataJurusan, DataKelas, DataMapel, DataSiswa, JadwalEditor, KelasDetailTU, LogAktivitas, ManajemenPengguna, PengaturanSistem, PenugasanGuru, TUDashboard, TahunAjaran } from '@/pages/tu'

const common = [<Route key="n" path="notifikasi" element={<NotifikasiPage />} />, <Route key="a" path="akun" element={<AkunPage />} />, <Route key="g" path="panduan" element={<PanduanPage />} />]
const pengaturan = <Route path="pengaturan" element={<PengaturanPage />} />
const pengumuman = [<Route key="p" path="pengumuman" element={<PengumumanList />} />, <Route key="pd" path="pengumuman/:id" element={<PengumumanDetail />} />]

function Home() { const { role } = useApp(); return <Navigate to={role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login'} replace /> }

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AppProvider>
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
      </AppProvider>
    </BrowserRouter>
  )
}
function KelolaMateriRoute() { const { id } = useParams(); return <KelolaMateri key={id} offId={id!} /> }
function KuisListWrap() { return <><PageHeader crumbs={useCrumbs({ l: 'Daftar Kuis' })} title="Daftar Kuis" subtitle="Semua kuis dari kelas yang Anda ampu" /><KuisListGuru /></> }
