import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Award, BookOpen, CalendarCheck, Download, FileSpreadsheet, FileText, GraduationCap, LayoutGrid, List, Medal, TrendingUp, Trophy, Users, User as UserIcon, Crown, ArrowLeft, Mail, Phone, MapPin, StickyNote } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts'
import { Avatar, Badge, Btn, Card, CardTitle, DataTable, Drawer, Empty, NameCell, PageHeader, Progress, Segmented, Select, Stat, StatusBadge, Tabs, cn, useCrumbs, useTab, download, Chips } from '@/components/ui'
import { useApp } from '@/context'
import { absensiSiswa, bulanHadir, distribusiNilai, fmtBatas, jurusanNama, keaktifanGuru, kelas, kelasById, kelasStat, nilaiSiswa, offeringById, offeringTitle, sesiOf, siswaOfferings, studentById, studentsOf, subjectById, teacherById, tugas, subjects, trenNilaiBulan, students, type Siswa } from '@/data'
import { fetchUsers, fetchKelas, fetchSiswaKelas, type User, type Kelas } from '@/services/akademik'
import { useGuruData } from '@/hooks/useGuruData'

const KID = 'k2'
const statusOf = (s: Siswa) => (s.risiko ? 'Berisiko' : s.hadir < 80 || s.rata < 75 ? 'Waspada' : 'Aman')

// Hook for wali kelas data
const useWaliData = () => {
  const { userData } = useApp();
  const [siswa, setSiswa] = useState<any[]>([]);
  const [kelasInfo, setKelasInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userData?.id) return;
    
    const load = async () => {
      setLoading(true);
      try {
        // Fetch kelas where user is wali_kelas
        const kelasList = await fetchKelas();
        const myKelas = kelasList.find((k: any) => k.wali_kelas_id === userData.id);
        
        if (myKelas) {
          setKelasInfo(myKelas);
          const siswaList = await fetchSiswaKelas(myKelas.id);
          setSiswa(siswaList.map((s: any) => ({
            id: s.user.id,
            nama: s.user.full_name,
            nis: s.user.nip_nis,
            kelasId: s.id_kelas,
            email: s.user.email,
            hadir: 95,
            rata: 85,
            belum: Math.floor(Math.random() * 5),
            risiko: Math.random() > 0.8
          })));
        }
      } catch (e) {
        console.error('Failed to fetch wali data:', e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [userData?.id]);
  
  return { siswa, kelasInfo, loading };
};

export function WaliBeranda() {
  const nav = useNavigate(); const { siswa, kelasInfo, loading } = useWaliData(); const [f, setF] = useState('Semua')
  
  // Fallback to dummy data
  const ss = siswa.length > 0 ? siswa : studentsOf(KID);
  const avgH = Math.round(ss.reduce((a, s) => a + s.hadir, 0) / ss.length); const avgN = Math.round(ss.reduce((a, s) => a + s.rata, 0) / ss.length); const risk = ss.filter((s) => s.risiko).length
  const rows = ss.filter((s) => f === 'Semua' || statusOf(s) === f)
  
  if (loading) return <div className="p-8 text-center text-muted">Memuat data wali kelas...</div>;
  
  const kelasNama = kelasInfo?.name || 'XI RPL 1';
  const jurusan = kelasInfo?.major || 'Rekayasa Perangkat Lunak';
  
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda' }]} title={`Wali Kelas ${kelasNama}`} subtitle={`${jurusan} • Semester Ganjil 2026/2027 • Mode hanya-lihat`} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={ss.length} sub="Aktif semua" /><Stat icon={<CalendarCheck />} label="Rata-rata Kehadiran" value={`${avgH}%`} trend="-1,8%" tone="blue" /><Stat icon={<Award />} label="Rata-rata Nilai" value={avgN} trend="+2,1%" /><Stat icon={<AlertTriangle />} label="Siswa Berisiko" value={risk} tone="red" sub="Kehadiran, nilai, atau tugas" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Kehadiran per Bulan</CardTitle><div style={{ height: 250 }}><ResponsiveContainer><AreaChart data={bulanHadir}><defs><linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0B3D5F" stopOpacity={0.35} /><stop offset="100%" stopColor="#0B3D5F" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="b" tickLine={false} axisLine={false} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="v" name="Kehadiran (%)" stroke="#0B3D5F" strokeWidth={3} fill="url(#gh)" /></AreaChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Distribusi Nilai</CardTitle><div style={{ height: 250 }}><ResponsiveContainer><BarChart data={distribusiNilai}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="r" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[10, 10, 0, 0]}>{distribusiNilai.map((_, i) => <Cell key={i} fill={i < 2 ? '#F59E0B' : i % 2 ? '#2563EB' : '#0B3D5F'} />)}</Bar></BarChart></ResponsiveContainer></div></Card></div>
      <h2 className="text-[22px] font-bold mb-3">Daftar Siswa Perwalian</h2>
      <DataTable rows={rows} pageSize={10} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari nama atau NIS" onRow={(s) => nav(`/wali/siswa/${s.id}`)} filters={<Chips value={f} onChange={setF} options={['Semua', 'Aman', 'Waspada', 'Berisiko'].map((k) => ({ k, l: k }))} />}
        cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={`NIS ${s.nis}`} /> }, { key: 'hadir', header: 'Kehadiran', sort: (s) => s.hadir, render: (s) => <span className={cn('font-bold flex items-center gap-1.5', s.hadir < 75 && 'text-danger')}>{s.hadir < 75 && <AlertTriangle size={15} />}{s.hadir}%</span> }, { key: 'rata', header: 'Rata-rata Nilai', sort: (s) => s.rata, render: (s) => <span className={cn('font-bold', s.rata < 70 && 'text-danger')}>{s.rata}</span> }, { key: 'belum', header: 'Tugas Belum Dikumpulkan', sort: (s) => s.belum, render: (s) => <Badge tone={s.belum >= 3 ? 'red' : s.belum ? 'amber' : 'green'}>{s.belum} tugas</Badge> }, { key: 'st', header: 'Status', render: (s) => <StatusBadge s={statusOf(s)} /> }]} /></div>
  )
}

export function WaliSiswaDetail() {
  const { id } = useParams(); const s = studentById(id!); const nl = nilaiSiswa(s.id); const ab = absensiSiswa(s.id)
  const open = tugas.filter((t) => offeringById(t.off).kelasId === s.kelasId && t.gStatus === 'Aktif').slice(0, s.belum)
  const tot = ab.reduce((a, b) => ({ h: a.h + b.hadir, i: a.i + b.izin, s: a.s + b.sakit, a: a.a + b.alpa }), { h: 0, i: 0, s: 0, a: 0 })
  const pie = [{ n: 'Hadir', v: tot.h, c: '#0B3D5F' }, { n: 'Izin', v: tot.i, c: '#2563EB' }, { n: 'Sakit', v: tot.s, c: '#F59E0B' }, { n: 'Alpa', v: tot.a, c: '#DC2626' }]
  const riwayat = siswaOfferings(s.kelasId).slice(0, 3).flatMap((o) => sesiOf(o.id).slice(-4).map((x, i) => ({ id: `${o.id}-${i}`, mapel: subjectById(o.subjectId).nama, ...x, status: ((s.id.length + x.no + i) % 7 === 0 ? 'Izin' : (s.id.length + x.no) % 11 === 0 ? 'Alpa' : x.status) }))).sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Siswa' }, { l: s.nama }]} title="Detail Siswa" subtitle={`${s.nama} • ${kelasById(s.kelasId).nama}`} actions={<Btn variant="outline" icon={<ArrowLeft size={18} />} to="/wali/beranda">Kembali</Btn>} />
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start"><div className="space-y-6"><Card className="text-center"><Avatar name={s.nama} size={96} className="mx-auto" /><h3 className="text-xl font-extrabold mt-3">{s.nama}</h3><p className="text-sm text-muted">NIS {s.nis} • {kelasById(s.kelasId).nama}</p><StatusBadge s={statusOf(s)} /><dl className="text-left text-sm mt-5 space-y-2.5"><div className="flex gap-2"><Mail size={16} className="text-muted shrink-0 mt-0.5" /><span className="break-all">{s.email}</span></div><div className="flex gap-2"><Phone size={16} className="text-muted shrink-0" />{s.hp}</div><div className="flex gap-2"><MapPin size={16} className="text-muted shrink-0 mt-0.5" />{s.alamat}</div><div className="flex gap-2"><UserIcon size={16} className="text-muted" />{s.jk === 'L' ? 'Laki-laki' : 'Perempuan'}</div></dl></Card>
        <Card><CardTitle icon={<StickyNote size={19} className="text-primary" />}>Catatan Wali Kelas</CardTitle><p className="text-sm leading-6 text-muted">{s.risiko ? `${s.nama.split(' ')[0]} perlu pendampingan terkait kehadiran dan pengumpulan tugas. Sudah dilakukan pembicaraan dengan orang tua pada 20 Oktober 2026.` : `${s.nama.split(' ')[0]} menunjukkan perkembangan yang baik dan aktif mengikuti pembelajaran.`}</p><p className="text-xs text-muted mt-3">Catatan bersifat hanya-lihat.</p></Card></div>
        <div className="space-y-6 min-w-0"><div className="grid sm:grid-cols-3 gap-5"><Stat icon={<CalendarCheck />} label="Kehadiran" value={`${s.hadir}%`} tone={s.hadir < 75 ? 'red' : 'green'} /><Stat icon={<Award />} label="Rata-rata Nilai" value={s.rata} tone="blue" /><Stat icon={<FileText />} label="Tugas Belum" value={s.belum} tone={s.belum >= 3 ? 'red' : 'amber'} /></div>
          <div className="grid xl:grid-cols-[1fr_300px] gap-6"><Card><CardTitle>Nilai per Mata Pelajaran</CardTitle><div style={{ height: 250 }}><ResponsiveContainer><BarChart data={nl.map((n) => ({ m: n.mapel.split(' ')[0], rata: n.rata }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} /><Tooltip /><Bar dataKey="rata" name="Nilai Rata-rata" fill="#0B3D5F" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
            <Card><CardTitle>Kehadiran</CardTitle><div style={{ height: 200 }}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="v" nameKey="n" innerRadius={52} outerRadius={80} paddingAngle={3} cornerRadius={6}>{pie.map((p) => <Cell key={p.n} fill={p.c} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div></Card></div>
          <DataTable rows={nl.map((n) => ({ ...n, id: n.off.id }))} cols={[{ key: 'mapel', header: 'Mata Pelajaran', render: (r) => <b>{r.mapel}</b> }, { key: 'tugas', header: 'Tugas', sort: (r) => r.tugas }, { key: 'kuis', header: 'Kuis', sort: (r) => r.kuis }, { key: 'uts', header: 'UTS', sort: (r) => r.uts }, { key: 'rata', header: 'Rata-rata', sort: (r) => r.rata, render: (r) => <b>{r.rata}</b> }, { key: 'p', header: 'Predikat', render: (r) => <Badge tone={r.predikat === 'A' ? 'green' : r.predikat === 'B' ? 'blue' : r.predikat === 'C' ? 'amber' : 'red'}>{r.predikat}</Badge> }]} />
          <Card><CardTitle>Tugas Belum Dikumpulkan</CardTitle>{open.length === 0 ? <p className="text-sm text-muted">Semua tugas sudah dikumpulkan.</p> : <ul className="divide-y divide-line">{open.map((t) => <li key={t.id} className="py-3 flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center"><FileText size={17} /></span><div className="flex-1 text-sm"><b>{t.judul}</b><div className="text-xs text-muted uppercase">{offeringTitle(offeringById(t.off))}</div></div><span className="text-xs text-muted">Batas {fmtBatas(t.batas)}</span></li>)}</ul>}</Card>
          <h3 className="text-[22px] font-bold">Riwayat Kehadiran</h3><DataTable rows={riwayat} pageSize={10} cols={[{ key: 'tgl', header: 'Tanggal', sort: (r) => r.tanggal.getTime(), render: (r) => r.tgl }, { key: 'mapel', header: 'Mata Pelajaran', render: (r) => <b>{r.mapel}</b> }, { key: 'materi', header: 'Materi' }, { key: 'status', header: 'Status', render: (r) => <StatusBadge s={r.status} /> }]} /></div></div></div>
  )
}

export function WaliKelas() {
  const [v, setV] = useState<'grid' | 'list'>('grid'); const offs = siswaOfferings(KID); const k = kelasById(KID)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Kelas Perwalian' }]} title="Kelas Perwalian" subtitle={`${k.nama} • ${jurusanNama(k.jurusan)} • ${k.ruang}`} actions={<Segmented value={v} onChange={setV} options={[{ v: 'grid', l: <><LayoutGrid size={15} />Grid</> }, { v: 'list', l: <><List size={15} />Daftar</> }]} />} />
      <Card className="mb-6 flex flex-wrap gap-8 items-center"><div className="flex items-center gap-4"><span className="w-14 h-14 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center"><GraduationCap size={28} /></span><div><div className="text-xl font-extrabold">{k.nama}</div><div className="text-sm text-muted">Wali kelas: {teacherById(k.wali).sapaan}</div></div></div>{[['Siswa', 25], ['Mata Pelajaran', offs.length], ['Siswa Berisiko', studentsOf(KID).filter((s) => s.risiko).length]].map(([a, b]) => <div key={a as string}><div className="text-2xl font-extrabold">{b}</div><div className="text-xs text-muted">{a}</div></div>)}</Card>
      {v === 'grid' ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{offs.map((o) => <Card key={o.id} hover><b className="uppercase leading-snug block">{subjectById(o.subjectId).nama}</b><div className="text-sm text-muted mt-1 flex items-center gap-2"><UserIcon size={15} />{teacherById(o.guru).sapaan}</div><div className="text-sm text-muted mt-1">{o.jadwal.map((j) => `${['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][j.hari]} ${j.mulai}`).join(' • ')}</div><div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line text-sm"><div><div className="text-muted text-xs">Rata-rata nilai</div><b className="text-lg">{o.rata}</b></div><div><div className="text-muted text-xs">Pertemuan</div><b className="text-lg">{o.done}/{o.total}</b></div></div><Progress value={(o.done / o.total) * 100} className="mt-3" /></Card>)}</div>
        : <DataTable rows={offs} cols={[{ key: 'm', header: 'Mata Pelajaran', sort: (o) => subjectById(o.subjectId).nama, render: (o) => <b>{subjectById(o.subjectId).nama}</b> }, { key: 'g', header: 'Guru', render: (o) => teacherById(o.guru).nama }, { key: 'j', header: 'Jadwal', render: (o) => o.jadwal.map((j) => `${['', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][j.hari]} ${j.mulai}`).join(', ') }, { key: 'd', header: 'Pertemuan', render: (o) => `${o.done}/${o.total}` }, { key: 'r', header: 'Rata-rata Nilai', sort: (o) => o.rata, render: (o) => <b>{o.rata}</b> }]} />}</div>
  )
}

export function WaliRekapNilai() {
  const [p, setP] = useState('Semester'); const mapel = siswaOfferings(KID); const ss = studentsOf(KID); const [q, setQ] = useState(''); const { toast } = useApp()
  const rows = ss.map((s) => { const nl = nilaiSiswa(s.id); const vals = nl.map((n) => (p === 'UTS' ? n.uts : p === 'Tugas' ? n.tugas : p === 'Kuis' ? n.kuis : n.rata)); return { id: s.id, s, vals, avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) } })
  const cell = (v: number) => (v < 70 ? 'bg-red-100 text-red-800' : v >= 90 ? 'bg-green-100 text-green-800' : '')
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Rekap Nilai' }]} title="Rekap Nilai" subtitle="Matriks nilai siswa per mata pelajaran • XI RPL 1" actions={<Btn icon={<Download size={18} />} onClick={() => { download('rekap-nilai-XI-RPL-1.csv'); toast('Rekap nilai diekspor') }}>Ekspor</Btn>} />
      <Card pad={false} className="overflow-hidden"><div className="p-4 flex flex-wrap gap-3 items-center border-b border-line"><input aria-label="Cari siswa" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama siswa" className="h-11 w-72 rounded-xl border border-line px-4 text-sm outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary" /><Select aria-label="Periode" value={p} onChange={(e) => setP(e.target.value)} options={[{ v: 'Semester', l: 'Periode: Rata-rata Semester' }, { v: 'UTS', l: 'Periode: UTS' }, { v: 'Tugas', l: 'Periode: Tugas' }, { v: 'Kuis', l: 'Periode: Kuis' }]} className="w-64" /><span className="ml-auto text-xs text-muted">Merah &lt; 70 • Hijau ≥ 90</span></div>
        <div className="overflow-auto max-h-[640px]"><table className="text-sm w-full min-w-[900px]"><thead className="sticky top-0 bg-gray-50 z-10 text-xs uppercase text-muted"><tr><th className="px-4 h-12 text-left sticky left-0 bg-gray-50 min-w-[220px]">Siswa</th>{mapel.map((o) => <th key={o.id} className="px-2 text-center">{subjectById(o.subjectId).nama.split(' ').map((w) => w[0] + w.slice(1, 4)).join(' ')}</th>)}<th className="px-4 text-center">Rata-rata</th></tr></thead>
          <tbody>{rows.filter((r) => r.s.nama.toLowerCase().includes(q.toLowerCase())).map((r) => <tr key={r.id} className="border-t border-line h-12 hover:bg-primary-light/40"><td className="px-4 sticky left-0 bg-white"><Link to={`/wali/siswa/${r.id}`} className="flex items-center gap-2 font-semibold hover:text-primary-dark"><Avatar name={r.s.nama} size={28} />{r.s.nama}</Link></td>{r.vals.map((v, i) => <td key={i} className="text-center"><span className={cn('inline-block min-w-10 py-1 rounded-lg font-semibold', cell(v))}>{v}</span></td>)}<td className="text-center font-extrabold">{r.avg}</td></tr>)}</tbody></table></div></Card></div>
  )
}
export function WaliRekapHadir() {
  const [b, setB] = useState('Semua'); const [q, setQ] = useState(''); const { toast } = useApp(); const f = b === 'Semua' ? 1 : ({ Juli: 0.2, Agustus: 0.22, September: 0.28, Oktober: 0.3 } as Record<string, number>)[b]
  const rows = studentsOf(KID).map((s) => { const total = Math.round(95 * f); const h = Math.round(total * (s.hadir / 100)); const rest = total - h; const i = Math.round(rest * 0.4), sk = Math.round(rest * 0.4); return { id: s.id, s, total, h, i, sk, a: rest - i - sk, p: Math.round((h / total) * 100) } })
  const sum = (k: 'h' | 'i' | 'sk' | 'a') => rows.reduce((a, r) => a + r[k], 0)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/wali/beranda' }, { l: 'Rekap Kehadiran' }]} title="Rekap Kehadiran" subtitle="Rekap kehadiran seluruh mata pelajaran • XI RPL 1" actions={<Btn icon={<Download size={18} />} onClick={() => { download('rekap-kehadiran-XI-RPL-1.csv'); toast('Rekap kehadiran diekspor') }}>Ekspor</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">{[['Total Hadir', sum('h'), 'green'], ['Total Izin', sum('i'), 'blue'], ['Total Sakit', sum('sk'), 'amber'], ['Total Alpa', sum('a'), 'red']].map(([l, v, t]) => <Card key={l as string} className="!p-4"><Badge tone={t as string}>{l}</Badge><div className="text-3xl font-extrabold mt-2">{v}</div></Card>)}</div>
      <DataTable rows={rows} pageSize={10} searchText={(r) => r.s.nama} searchPlaceholder="Cari nama siswa" filters={<Select aria-label="Filter bulan" value={b} onChange={(e) => setB(e.target.value)} options={['Semua', 'Juli', 'Agustus', 'September', 'Oktober']} className="!w-44 !h-11" />}
        cols={[{ key: 's', header: 'Siswa', sort: (r) => r.s.nama, render: (r) => <Link to={`/wali/siswa/${r.id}`}><NameCell name={r.s.nama} sub={`NIS ${r.s.nis}`} /></Link> }, { key: 'h', header: 'Hadir', sort: (r) => r.h }, { key: 'i', header: 'Izin', sort: (r) => r.i }, { key: 'sk', header: 'Sakit', sort: (r) => r.sk }, { key: 'a', header: 'Alpa', sort: (r) => r.a }, { key: 'total', header: 'Total Sesi' }, { key: 'p', header: 'Persentase', sort: (r) => r.p, render: (r) => <div className="flex items-center gap-2 w-36"><Progress value={r.p} tone={r.p >= 75 ? 'green' : 'red'} className="flex-1" /><b className={cn(r.p < 75 && 'text-danger')}>{r.p}%</b></div> }]} /></div>
  )
}

// ================= KEPALA SEKOLAH =================
const PERIODE: Record<string, number> = { 'Bulan Ini': 0.97, 'Semester Ini': 1, 'Tahun Ajaran': 1.02 }
export function KepsekBeranda() {
  const [kl, setKl] = useState('Semua'); const [mp, setMp] = useState('Semua'); const [pr, setPr] = useState('Semester Ini'); const k = PERIODE[pr]
  const ks = kelasStat.filter((x) => kl === 'Semua' || x.nama === kl); const mf = mp === 'Semua' ? 0 : (mp.length % 5) - 2
  const avgH = Math.round((ks.reduce((a, b) => a + b.hadir, 0) / ks.length) * k); const avgN = Math.round(ks.reduce((a, b) => a + b.nilai, 0) / ks.length + mf)
  const rank = [...kelasStat].sort((a, b) => b.nilai + b.hadir - (a.nilai + a.hadir))
  const tren = ['Jul', 'Agu', 'Sep', 'Okt'].map((b, i) => ({ b, 'Rata-rata Nilai': Math.round(avgN - 6 + i * 2 + (i === 3 ? 0 : 0)), 'Kehadiran': Math.round(avgH + 4 - i * 1.5) }))
  const med = ['text-amber-500', 'text-gray-400', 'text-orange-700']
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda' }]} title="Ringkasan Sekolah" subtitle="Pantauan pembelajaran SMK Negeri 2 Indramayu • Mode hanya-lihat" actions={<><Select aria-label="Kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...kelas.map((x) => x.nama)]} className="!w-36" /><Select aria-label="Mata pelajaran" value={mp} onChange={(e) => setMp(e.target.value)} options={['Semua', ...subjects.map((s) => s.nama)]} className="!w-48" /><Select aria-label="Periode" value={pr} onChange={(e) => setPr(e.target.value)} options={Object.keys(PERIODE)} className="!w-44" /></>} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<GraduationCap />} label="Total Siswa" value="1.080" trend="+2,4%" sub="3 jurusan, 36 rombel" /><Stat icon={<Users />} label="Total Guru" value="64" trend="+1,6%" tone="blue" sub="Aktif mengajar" /><Stat icon={<CalendarCheck />} label="Rata-rata Kehadiran" value={`${avgH}%`} trend="-0,8%" tone="amber" /><Stat icon={<Award />} label="Rata-rata Nilai" value={avgN} trend="+3,2%" /></div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6"><Card><CardTitle>Presensi per Kelas</CardTitle><div style={{ height: 290 }}><ResponsiveContainer><BarChart data={ks.map((x) => ({ n: x.nama, v: Math.round(x.hadir * k) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={12} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Kehadiran (%)" radius={[10, 10, 0, 0]} fill="#0B3D5F" /></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Tren Nilai & Kehadiran</CardTitle><div style={{ height: 290 }}><ResponsiveContainer><LineChart data={tren}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="b" tickLine={false} axisLine={false} /><YAxis domain={[60, 100]} tickLine={false} axisLine={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="Rata-rata Nilai" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} /><Line type="monotone" dataKey="Kehadiran" stroke="#0B3D5F" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></div></Card></div>
      <Card><CardTitle icon={<Trophy size={20} className="text-amber-500" />} right={<Link className="text-sm font-bold text-accent" to="/kepsek/statistik">Statistik detail</Link>}>Peringkat Kelas</CardTitle><ol className="divide-y divide-line">{rank.map((x, i) => <li key={x.id} className="flex items-center gap-4 py-3"><span className="w-10 flex justify-center">{i < 3 ? <Medal className={med[i]} size={28} /> : <b className="text-muted">{i + 1}</b>}</span><div className="flex-1"><b>{x.nama}</b><div className="text-xs text-muted">{x.siswa} siswa • {x.berisiko} berisiko</div></div><div className="text-right text-sm"><div>Nilai <b>{x.nilai}</b></div><div className="text-muted">Hadir {x.hadir}%</div></div></li>)}</ol></Card></div>
  )
}
export function KepsekStatistik() {
  const [tab, setTab] = useTab('kelas'); const [dr, setDr] = useState<string | null>(null)
  const perMapel = subjects.map((s, i) => ({ id: s.id, nama: s.nama, nilai: 70 + ((i * 7) % 20), hadir: 82 + ((i * 5) % 14), guru: teacherById(s.guru).sapaan, kelasN: kelas.length, tuntas: 60 + ((i * 9) % 35) }))
  const rows = tab === 'kelas' ? kelasStat.map((k) => ({ id: k.id, nama: k.nama, nilai: k.nilai, hadir: k.hadir, ext: `${k.berisiko} berisiko`, tuntas: Math.min(98, k.nilai + 4) })) : perMapel.map((m) => ({ id: m.id, nama: m.nama, nilai: m.nilai, hadir: m.hadir, ext: m.guru, tuntas: m.tuntas }))
  const det = rows.find((r) => r.id === dr)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/kepsek/beranda' }, { l: 'Statistik' }]} title="Statistik Detail" subtitle="Bandingkan capaian per kelas dan per mata pelajaran" />
      <Tabs className="mb-6" tabs={[{ v: 'kelas', l: 'Per Kelas' }, { v: 'mapel', l: 'Per Mapel' }]} value={tab} onChange={setTab} />
      <Card className="mb-6"><CardTitle>Perbandingan Nilai dan Kehadiran</CardTitle><div style={{ height: 320 }}><ResponsiveContainer><BarChart data={rows} barGap={6}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="nama" tickLine={false} axisLine={false} fontSize={12} interval={0} angle={tab === 'mapel' ? -15 : 0} height={tab === 'mapel' ? 60 : 30} /><YAxis domain={[50, 100]} tickLine={false} axisLine={false} /><Tooltip /><Legend /><Bar dataKey="nilai" name="Rata-rata Nilai" fill="#0B3D5F" radius={[8, 8, 0, 0]} /><Bar dataKey="hadir" name="Kehadiran (%)" fill="#2563EB" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <DataTable rows={rows} onRow={(r) => setDr(r.id)} cols={[{ key: 'nama', header: tab === 'kelas' ? 'Kelas' : 'Mata Pelajaran', sort: (r) => r.nama, render: (r) => <b>{r.nama}</b> }, { key: 'nilai', header: 'Rata-rata Nilai', sort: (r) => r.nilai }, { key: 'hadir', header: 'Kehadiran', sort: (r) => r.hadir, render: (r) => `${r.hadir}%` }, { key: 'tuntas', header: 'Ketuntasan', sort: (r) => r.tuntas, render: (r) => <div className="flex gap-2 items-center w-32"><Progress value={r.tuntas} tone="green" className="flex-1" />{r.tuntas}%</div> }, { key: 'ext', header: tab === 'kelas' ? 'Catatan' : 'Guru Pengampu' }]} actions={(r) => [{ l: 'Lihat Rincian', onClick: () => setDr(r.id) }]} />
      <Drawer open={!!det} onClose={() => setDr(null)} title={`Rincian ${det?.nama ?? ''}`}>{det && <><div className="grid grid-cols-3 gap-3 text-center">{[['Nilai', det.nilai], ['Kehadiran', det.hadir + '%'], ['Ketuntasan', det.tuntas + '%']].map(([a, b]) => <div key={a as string} className="bg-gray-50 rounded-2xl py-4"><div className="text-2xl font-extrabold">{b}</div><div className="text-xs text-muted">{a}</div></div>)}</div>
        <Card pad={false} className="!border-0 !shadow-none"><h4 className="font-bold mb-2">{tab === 'kelas' ? 'Nilai per Mata Pelajaran' : 'Nilai per Kelas'}</h4><div style={{ height: 240 }}><ResponsiveContainer><BarChart data={(tab === 'kelas' ? siswaOfferings(det.id === 'k2' ? 'k2' : det.id) : kelas).map((x, i) => ({ n: 'subjectId' in x ? subjectById(x.subjectId).nama.split(' ')[0] : (x as { nama: string }).nama, v: Math.min(98, det.nilai + ((i * 5) % 11) - 4) }))}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} fontSize={11} interval={0} /><YAxis domain={[50, 100]} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Nilai" fill="#0B3D5F" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card></>}</Drawer></div>
  )
}
export function KepsekGuru() {
  const [d, setD] = useState<string | null>(null); const g = keaktifanGuru.find((x) => x.id === d)
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/kepsek/beranda' }, { l: 'Keaktifan Guru' }]} title="Keaktifan Guru" subtitle="Aktivitas guru dalam mengelola materi, tugas, kuis, dan presensi" />
      <DataTable rows={keaktifanGuru} pageSize={10} searchText={(t) => t.nama} searchPlaceholder="Cari nama guru" onRow={(t) => setD(t.id)} cols={[{ key: 'nama', header: 'Guru', sort: (t) => t.nama, render: (t) => <NameCell name={t.nama} sub={subjectById(t.mapel).nama} /> }, { key: 'materi', header: 'Materi', sort: (t) => t.materi }, { key: 'tugas', header: 'Tugas', sort: (t) => t.tugas }, { key: 'kuis', header: 'Kuis', sort: (t) => t.kuis }, { key: 'presensi', header: 'Presensi Terisi', sort: (t) => t.presensi, render: (t) => <div className="flex gap-2 items-center w-36"><Progress value={t.presensi} tone={t.presensi >= 85 ? 'green' : 'amber'} className="flex-1" /><b>{t.presensi}%</b></div> }, { key: 'terakhir', header: 'Aktivitas Terakhir' }]} actions={(t) => [{ l: 'Lihat Detail', onClick: () => setD(t.id) }]} />
      <Drawer open={!!g} onClose={() => setD(null)} title="Detail Keaktifan Guru">{g && <><NameCell name={g.nama} sub={`NIP ${g.nip}`} /><div className="grid grid-cols-2 gap-3">{[['Materi diunggah', g.materi], ['Tugas dibuat', g.tugas], ['Kuis dibuat', g.kuis], ['Presensi terisi', g.presensi + '%'], ['Kelas diampu', g.kelasN], ['Aktivitas terakhir', g.terakhir]].map(([a, b]) => <div key={a as string} className="bg-gray-50 rounded-2xl p-4"><div className="text-xs text-muted">{a}</div><div className="font-extrabold text-lg">{b}</div></div>)}</div><h4 className="font-bold">Aktivitas Terbaru</h4><ul className="space-y-2 text-sm">{['Mengunggah materi pertemuan terbaru', 'Menyimpan presensi sesi hari ini', 'Menilai 6 pengumpulan tugas', 'Membuat pengumuman kelas'].map((a, i) => <li key={a} className="flex gap-3 items-center border border-line rounded-xl p-3"><span className="w-2 h-2 rounded-full bg-primary" />{a}<span className="ml-auto text-xs text-muted">{i + 1} hari lalu</span></li>)}</ul></>}</Drawer></div>
  )
}
export function KepsekLaporan() {
  const { toast } = useApp(); const [j, setJ] = useState('Rekap Kehadiran'); const [p, setP] = useState('Oktober 2026'); const [k, setK] = useState('Semua')
  const ks = kelasStat.filter((x) => k === 'Semua' || x.nama === k)
  const last = [['Rekap Kehadiran September 2026', '30 Sep 2026', 'PDF'], ['Rekap Nilai Tengah Semester', '14 Okt 2026', 'Excel'], ['Keaktifan Guru Triwulan III', '20 Okt 2026', 'PDF']]
  return (
    <div><PageHeader crumbs={[{ l: 'Beranda', to: '/kepsek/beranda' }, { l: 'Laporan' }]} title="Laporan" subtitle="Pilih jenis laporan, lihat pratinjau, lalu ekspor" actions={<><Btn variant="outline" icon={<FileText size={18} />} onClick={() => { download('laporan.pdf'); toast('Laporan PDF diekspor') }}>Ekspor PDF</Btn><Btn icon={<FileSpreadsheet size={18} />} onClick={() => { download('laporan.csv'); toast('Laporan Excel diekspor') }}>Ekspor Excel</Btn></>} />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start"><div className="space-y-6"><Card className="space-y-4"><CardTitle>Parameter Laporan</CardTitle><Select label="Jenis Laporan" value={j} onChange={(e) => setJ(e.target.value)} options={['Rekap Kehadiran', 'Rekap Nilai', 'Keaktifan Guru', 'Siswa Berisiko']} /><Select label="Periode" value={p} onChange={(e) => setP(e.target.value)} options={['Oktober 2026', 'September 2026', 'Semester Ganjil 2026/2027']} /><Select label="Kelas" value={k} onChange={(e) => setK(e.target.value)} options={['Semua', ...kelas.map((x) => x.nama)]} /></Card>
        <Card><CardTitle>Laporan Terakhir</CardTitle><ul className="space-y-3">{last.map(([a, b, c]) => <li key={a} className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center"><FileText size={18} /></span><div className="flex-1 text-sm"><b className="block leading-snug">{a}</b><span className="text-xs text-muted">{b}</span></div><Badge tone={c === 'PDF' ? 'red' : 'green'}>{c}</Badge></li>)}</ul></Card></div>
        <Card><div className="flex items-center justify-between mb-1"><h3 className="text-lg font-bold">Pratinjau Laporan</h3><Badge tone="blue">Langsung</Badge></div><p className="text-sm text-muted mb-4">{j} • {p} • {k === 'Semua' ? 'Seluruh kelas' : k}</p>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-muted text-left"><tr><th className="p-3">Kelas</th>{j === 'Keaktifan Guru' ? <><th>Guru Aktif</th><th>Materi</th></> : j === 'Siswa Berisiko' ? <><th>Berisiko</th><th>Persentase</th></> : <><th>Jumlah Siswa</th><th>{j === 'Rekap Nilai' ? 'Rata-rata Nilai' : 'Kehadiran'}</th></>}<th>Status</th></tr></thead>
            <tbody>{ks.map((x) => { const v = j === 'Rekap Nilai' ? x.nilai : x.hadir; return <tr key={x.id} className="border-t border-line h-12"><td className="p-3 font-bold">{x.nama}</td>{j === 'Keaktifan Guru' ? <><td>{8 + x.rank}</td><td>{20 + x.rank * 3}</td></> : j === 'Siswa Berisiko' ? <><td>{x.berisiko}</td><td>{Math.round((x.berisiko / 25) * 100)}%</td></> : <><td>{x.siswa}</td><td className="font-bold">{v}{j === 'Rekap Nilai' ? '' : '%'}</td></>}<td><StatusBadge s={v >= 80 || j === 'Keaktifan Guru' ? 'Aman' : 'Waspada'} /></td></tr> })}</tbody></table></div></Card></div></div>
  )
}
export { Crown, TrendingUp, BookOpen, Empty, trenNilaiBulan, students, bulanHadir, jurusanNama, offeringTitle }
