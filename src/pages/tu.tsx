import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Building2, CalendarDays, Download, Eye, FileSpreadsheet, GraduationCap, KeyRound, Pencil, Plus, Save, School, Trash2, Upload, Users, BookOpen, Database, Activity, ClipboardCheck, GripVertical, ArrowLeft, Check, UserPlus, Award } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Avatar, Badge, Btn, Card, CardTitle, Chips, DataTable, Drawer, Dropzone, Empty, Field, Input, Modal, NameCell, PageHeader, Segmented, Select, Stat, StatusBadge, Tabs, Textarea, Toggle, cn, useCrumbs, useTab, download, Progress, SearchBar } from '@/components/ui'
import { useApp } from '@/store'
import { HARI, jamPelajaran, jurusan, jurusanNama, kalender, kelas, kelasById, logs, offerings, offeringTitle, permissions, ROLE_ORDER, students, studentsOf, subjectById, subjects, tahunAjaran, teacherById, teachers, type Offering } from '@/data'
import { fetchUsers, fetchKelas, fetchMapel, fetchPengampu, createKelas, updateKelas, deleteKelas, createMapel, updateMapel, deleteMapel, createPengampu, updatePengampu, deletePengampu, fetchSiswaKelas, updateUserRole, createSiswa, updateSiswa, deleteUser, createGuru, updateGuru, fetchJurusan } from '@/services/akademik'

type F = { k: string; l: string; type?: string; options?: (string | { v: string; l: string })[]; req?: boolean; validate?: (v: string, all: Record<string, string>) => string }
type FD = { k: string; l: string; options: string[]; get: (r: any) => string }
function Crud<T extends { id: string }>({ singular, title, subtitle, rows: init, cols, fields, searchText, filterDefs, detail, toForm, fromForm, importer, onRowOpen, sidebarHint, onFetch, onCreate, onUpdate, onDelete }: {
  singular: string; title: string; subtitle: string; rows: T[]; cols: any[]; fields: F[]; searchText: (r: T) => string; filterDefs?: FD[]
  detail?: (r: T) => React.ReactNode; toForm: (r: T) => Record<string, string>; fromForm: (f: Record<string, string>, old?: T) => T; importer?: boolean; onRowOpen?: (r: T) => void; sidebarHint?: string
  onFetch?: () => Promise<T[]>; onCreate?: (data: any) => Promise<T>; onUpdate?: (id: string, data: any) => Promise<void>; onDelete?: (id: string) => Promise<void>
}) {
  const { toast, confirm } = useApp(); const [rows, setRows] = useState(init); const [flt, setFlt] = useState<Record<string, string>>({}); const [modal, setModal] = useState<null | { edit?: T }>(null); const [view, setView] = useState<T | null>(null); const [imp, setImp] = useState(false)
  const [f, setF] = useState<Record<string, string>>({}); const [e, setE] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(false)

  const load = async () => { if (!onFetch) return; setLoading(true); try { setRows(await onFetch()) } catch (err: any) { toast(err.message, 'err') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const shown = rows.filter((r) => (filterDefs ?? []).every((d) => !flt[d.k] || flt[d.k] === 'Semua' || d.get(r) === flt[d.k]))
  const open = (r?: T) => { setF(r ? toForm(r) : Object.fromEntries(fields.map((x) => [x.k, x.options ? (typeof x.options[0] === 'string' ? (x.options[0] as string) : (x.options[0] as { v: string }).v) : '']))); setE({}); setModal({ edit: r }) }
  
  const save = async () => { const x: Record<string, string> = {}; fields.forEach((d) => { const v = (f[d.k] ?? '').trim(); if (d.req && !v) x[d.k] = `${d.l} wajib diisi`; else if (d.validate && v) { const m = d.validate(v, f); if (m) x[d.k] = m } }); setE(x); if (Object.keys(x).length) return
    setBusy(true); try {
      const edit = modal!.edit;
      if (edit) {
        if (onUpdate) await onUpdate(edit.id, f);
        setRows(rows.map((r) => (r.id === edit.id ? fromForm(f, edit) : r)));
      } else {
        const newData = onCreate ? await onCreate(f) : fromForm(f);
        setRows([newData, ...rows]);
      }
      setModal(null); toast(edit ? `${singular} berhasil diperbarui` : `${singular} berhasil ditambahkan`)
    } catch (err: any) { toast(err.message, 'err') } finally { setBusy(false) } }

  const del = (r: T) => confirm({ title: `Hapus ${singular}?`, message: `Data ${singular.toLowerCase()} akan dihapus permanen dan tidak dapat dikembalikan.`, danger: true, onOk: async () => { 
    try { if (onDelete) await onDelete(r.id); setRows(rows.filter((x) => x.id !== r.id)); toast(`${singular} berhasil dihapus`) } catch (err: any) { toast(err.message, 'err') } 
  } })
  return (
    <div><PageHeader crumbs={useCrumbs({ l: title })} title={title} subtitle={subtitle} actions={<>{importer && <Btn variant="outline" icon={<Upload size={18} />} onClick={() => setImp(true)}>Import Excel</Btn>}<Btn variant="outline" icon={<Download size={18} />} onClick={() => { download(`${title}.csv`); toast('Data berhasil diekspor') }}>Ekspor</Btn><Btn icon={<Plus size={18} />} onClick={() => open()}>Tambah {singular}</Btn></>} />
      <DataTable rows={shown} cols={cols} pageSize={10} selectable searchText={searchText} searchPlaceholder={`Cari ${singular.toLowerCase()}...`} onRow={onRowOpen ?? ((r) => setView(r))} loading={loading}
        filters={filterDefs?.map((d) => <Select key={d.k} aria-label={d.l} value={flt[d.k] ?? 'Semua'} onChange={(ev) => setFlt({ ...flt, [d.k]: ev.target.value })} options={['Semua', ...d.options]} className="!w-44 !h-11" />)}
        bulk={[{ l: 'Hapus', icon: <Trash2 size={15} />, danger: true, onClick: (ids, clear) => confirm({ title: `Hapus ${ids.length} Data?`, message: 'Seluruh data terpilih akan dihapus permanen.', danger: true, onOk: () => { setRows(rows.filter((r) => !ids.includes(r.id))); clear(); toast(`${ids.length} data berhasil dihapus`) } }) }, { l: 'Ekspor', icon: <Download size={15} />, onClick: (ids, clear) => { download('terpilih.csv'); toast(`${ids.length} data diekspor`); clear() } }]}
        actions={(r) => [{ l: 'Lihat Detail', icon: <Eye size={16} />, onClick: () => (onRowOpen ? onRowOpen(r) : setView(r)) }, { l: 'Edit', icon: <Pencil size={16} />, onClick: () => open(r) }, { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => del(r) }]} />
      <Modal open={!!modal} onClose={() => setModal(null)} wide title={modal?.edit ? `Edit ${singular}` : `Tambah ${singular}`} footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn loading={busy} icon={<Save size={16} />} onClick={save}>Simpan</Btn></>}>
        <div className="grid sm:grid-cols-2 gap-4">{fields.map((d) => d.options ? <Select key={d.k} label={d.l} value={f[d.k] ?? ''} onChange={(ev) => setF({ ...f, [d.k]: ev.target.value })} options={d.options} error={e[d.k]} /> : <Input key={d.k} label={d.l} type={d.type} value={f[d.k] ?? ''} onChange={(ev) => setF({ ...f, [d.k]: ev.target.value })} error={e[d.k]} />)}</div></Modal>
      <Drawer open={!!view && !!detail} onClose={() => setView(null)} title={`Detail ${singular}`} footer={view && <><Btn variant="outline" icon={<Pencil size={16} />} onClick={() => { const r = view; setView(null); open(r) }}>Edit</Btn><Btn variant="danger" icon={<Trash2 size={16} />} onClick={() => { const r = view; setView(null); del(r) }}>Hapus</Btn></>}>{view && detail?.(view)}</Drawer>
      {importer && <ImportModal open={imp} onClose={() => setImp(false)} />}
      <span className="hidden">{sidebarHint}</span>
    </div>
  )
}
function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp(); const [done, setDone] = useState(false)
  const prev = [['2425010101', 'Alya Safitri', 'X RPL 1', 'OK'], ['2425010102', 'Bagus Prakoso', 'X RPL 1', 'OK'], ['2425010102', 'Cindy Maharani', 'XI TKJ 1', 'NIS duplikat pada baris 3'], ['2425010104', 'Doni Ramadhan', 'XI AKL 9', 'Kelas tidak ditemukan'], ['2425010105', 'Eka Fitriani', 'XI DKV 1', 'OK']]
  const close = () => { setDone(false); onClose() }
  return <Modal open={open} onClose={close} wide title="Import Data Siswa dari Excel" footer={<><Btn variant="outline" onClick={close}>Batal</Btn><Btn disabled={!done} onClick={() => { close(); toast('3 siswa berhasil diimpor, 2 baris dilewati') }}>Impor 3 Baris Valid</Btn></>}>
    <div className="flex items-center gap-3 bg-primary-light rounded-2xl p-4"><FileSpreadsheet className="text-primary-dark" /><div className="flex-1 text-sm"><b>Template Excel</b><div className="text-muted">Gunakan format kolom: NIS, Nama, Kelas, Jenis Kelamin.</div></div><Btn variant="outline" icon={<Download size={16} />} onClick={() => { download('template-siswa.csv', 'NIS,Nama,Kelas,Jenis Kelamin'); toast('Template diunduh', 'info') }}>Unduh Template</Btn></div>
    <Dropzone accept="XLSX atau CSV (maks. 5 MB)" onDone={() => setDone(true)} />
    {done && <div className="fade"><div className="flex items-center gap-2 text-sm mb-2"><AlertTriangle size={16} className="text-warn" /><b>Pratinjau: 3 baris valid, 2 baris bermasalah</b></div><div className="border border-line rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50 text-xs uppercase text-muted text-left"><tr><th className="p-2.5">NIS</th><th>Nama</th><th>Kelas</th><th>Status</th></tr></thead><tbody>{prev.map((r, i) => <tr key={i} className={cn('border-t border-line', r[3] !== 'OK' && 'bg-red-50')}><td className="p-2.5">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3] === 'OK' ? <Badge tone="green">Valid</Badge> : <span className="text-danger text-xs font-semibold">{r[3]}</span>}</td></tr>)}</tbody></table></div></div>}
  </Modal>
}
const Det = ({ items }: { items: [string, React.ReactNode][] }) => <dl className="space-y-3">{items.map(([a, b]) => <div key={a} className="flex justify-between gap-4 border-b border-line pb-2.5 text-sm"><dt className="text-muted">{a}</dt><dd className="font-bold text-right">{b}</dd></div>)}</dl>
const nm = (v: string) => (v.trim().length < 3 ? 'Nama minimal 3 karakter' : '')
const em = (v: string) => (/^\S+@\S+\.\S+$/.test(v) ? '' : 'Format email tidak valid')

export function DataSiswa() {
  const [classList, setClassList] = useState<any[]>([])
  useEffect(() => { fetchKelas().then(setClassList).catch(() => {}) }, [])

  return <Crud singular="Siswa" title="Data Siswa" subtitle="Kelola data seluruh siswa SMK Negeri 2 Indramayu" rows={[]} importer 
    onFetch={async () => {
      const data = await fetchSiswaKelas();
      return (data || []).map((d: any) => ({
        id: d.id_siswa,
        nama: d.user?.full_name || 'Tanpa Nama',
        nis: d.user?.nip_nis || '-',
        email: d.user?.email || '-',
        status: d.user?.status || 'Aktif',
        kelasId: d.id_kelas,
        jk: 'L',
        hp: '-',
        alamat: 'Indramayu'
      }));
    }}
    onCreate={async (f) => {
      const res = await createSiswa(f);
      return { id: res.id, ...f };
    }}
    onUpdate={async (id, f) => {
      await updateSiswa(id, f);
    }}
    onDelete={deleteUser}
    searchText={(s) => s.nama + s.nis}
    filterDefs={[{ k: 'kelas', l: 'Kelas', options: classList.map((k) => k.name), get: (s) => classList.find(k => k.id === s.kelasId)?.name || '' }, { k: 'st', l: 'Status', options: ['Aktif', 'Nonaktif'], get: (s) => s.status }]}
    cols={[{ key: 'nama', header: 'Siswa', sort: (s: any) => s.nama, render: (s: any) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS', sort: (s: any) => s.nis }, { key: 'kelas', header: 'Kelas', sort: (s: any) => classList.find(k => k.id === s.kelasId)?.name, render: (s: any) => classList.find(k => k.id === s.kelasId)?.name }, { key: 'status', header: 'Status', render: (s: any) => <StatusBadge s={s.status} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nis', l: 'NIS', req: true }, { k: 'kelasId', l: 'Kelas', options: classList.map((k) => ({ v: k.id, l: k.name })) }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Nonaktif'] }]}
    toForm={(s) => ({ nama: s.nama, nis: s.nis, kelasId: s.kelasId, email: s.email, status: s.status })} 
    fromForm={(f, o) => ({ ...(o ?? {}), ...f } as any)}
    detail={(s) => <><div className="text-center"><Avatar name={s.nama} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{s.nama}</h3><StatusBadge s={s.status} /></div><Det items={[['NIS', s.nis], ['Kelas', classList.find(k => k.id === s.kelasId)?.name || '-'], ['Email', s.email]]} /></>} />
}
export function DataGuru() {
  return <Crud singular="Guru" title="Data Guru" subtitle="Kelola data guru dan staf pengajar" rows={[]}
    onFetch={() => fetchUsers('guru')}
    onCreate={createGuru}
    onUpdate={updateGuru}
    onDelete={deleteUser}
    searchText={(t: any) => t.full_name + (t.nip_nis || '')}
    filterDefs={[{ k: 'st', l: 'Status', options: ['Aktif', 'Cuti'], get: (t: any) => t.status || 'Aktif' }]}
    cols={[{ key: 'nama', header: 'Guru', sort: (t: any) => t.full_name, render: (t: any) => <NameCell name={t.full_name} sub={t.email} /> }, { key: 'nip', header: 'NIP', render: (t: any) => t.nip_nis }, { key: 'status', header: 'Status', render: (t: any) => <StatusBadge s={t.status || 'Aktif'} /> }]}
    fields={[{ k: 'nama', l: 'Nama Lengkap', req: true, validate: nm }, { k: 'nip', l: 'NIP', req: true }, { k: 'email', l: 'Email', req: true, validate: em }, { k: 'status', l: 'Status', options: ['Aktif', 'Cuti'] }]}
    toForm={(t: any) => ({ nama: t.full_name, nip: t.nip_nis || '', email: t.email, status: t.status || 'Aktif' })} 
    fromForm={(f, o) => ({ ...(o ?? {}), full_name: f.nama, nip_nis: f.nip, email: f.email, status: f.status } as any)}
    detail={(t: any) => <><div className="text-center"><Avatar name={t.full_name} size={80} className="mx-auto" /><h3 className="font-extrabold text-lg mt-2">{t.full_name}</h3><StatusBadge s={t.status || 'Aktif'} /></div><Det items={[['NIP', t.nip_nis], ['Email', t.email]]} /></>} />
}
export function DataKelas() {
  const nav = useNavigate(); const [teachers, setTeachers] = useState<any[]>([]); const [jurusan, setJurusan] = useState<string[]>([])
  useEffect(() => { fetchUsers('guru').then(setTeachers).catch(() => {}); fetchJurusan().then(setJurusan).catch(() => {}) }, [])
  return <Crud singular="Kelas" title="Data Kelas" subtitle="Kelola rombongan belajar, wali kelas, dan ruang" rows={[]} onRowOpen={(k) => nav(`/tu/kelas/${k.id}`)}
    onFetch={fetchKelas}
    onCreate={async (f) => {
      const res = await createKelas({ name: f.nama, grade: Number(f.tingkat), major: f.jurusan, academic_year: '2026/2027', wali_kelas_id: f.wali });
      return { ...res, id: res.id };
    }}
    onUpdate={async (id, f) => {
      await updateKelas(id, { name: f.nama, grade: Number(f.tingkat), major: f.jurusan, wali_kelas_id: f.wali });
    }}
    onDelete={deleteKelas}
    searchText={(k: any) => k.name}
    filterDefs={[{ k: 'tg', l: 'Tingkat', options: ['10', '11', '12'], get: (k: any) => String(k.grade) }, { k: 'jr', l: 'Jurusan', options: jurusan, get: (k: any) => k.major }]}
    cols={[{ key: 'nama', header: 'Kelas', sort: (k: any) => k.name, render: (k: any) => <div><b>{k.name}</b></div> }, { key: 'jurusan', header: 'Jurusan', render: (k: any) => k.major }, { key: 'wali', header: 'Wali Kelas', render: (k: any) => teachers.find(t => t.id === k.wali_kelas_id)?.full_name || '-' }, { key: 'n', header: 'Siswa', render: () => '-' }]}
    fields={[{ k: 'nama', l: 'Nama Kelas', req: true }, { k: 'tingkat', l: 'Tingkat', options: ['10', '11', '12'] }, { k: 'jurusan', l: 'Jurusan', options: jurusan }, { k: 'wali', l: 'Wali Kelas', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) }]}
    toForm={(k: any) => ({ nama: k.name, tingkat: String(k.grade), jurusan: k.major, wali: k.wali_kelas_id })} fromForm={(f, o) => ({ ...(o ?? {}), name: f.nama, grade: Number(f.tingkat), major: f.jurusan, wali_kelas_id: f.wali } as any)} />
}
export function KelasDetailTU() {
  const { id } = useParams(); const k = kelasById(id!); const { toast } = useApp()
  return <div><PageHeader crumbs={useCrumbs({ l: 'Data Kelas', to: '/tu/kelas' }, { l: k.nama })} title={`Kelas ${k.nama}`} subtitle={`${jurusanNama(k.jurusan)} • Wali: ${teacherById(k.wali).sapaan} • ${k.ruang}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to="/tu/kelas">Kembali</Btn><Btn icon={<UserPlus size={18} />} onClick={() => toast('Siswa ditambahkan ke kelas')}>Tambah Siswa</Btn></>} />
    <div className="grid sm:grid-cols-3 gap-5 mb-6"><Stat icon={<Users />} label="Jumlah Siswa" value={25} /><Stat icon={<BookOpen />} label="Mata Pelajaran" value={offerings.filter((o) => o.kelasId === k.id).length} tone="blue" /><Stat icon={<School />} label="Ruang" value={k.ruang} tone="amber" /></div>
    <DataTable rows={studentsOf(k.id)} pageSize={10} searchText={(s) => s.nama + s.nis} searchPlaceholder="Cari siswa" cols={[{ key: 'nama', header: 'Siswa', sort: (s) => s.nama, render: (s) => <NameCell name={s.nama} sub={s.email} /> }, { key: 'nis', header: 'NIS' }, { key: 'jk', header: 'Jenis Kelamin', render: (s) => (s.jk === 'L' ? 'Laki-laki' : 'Perempuan') }, { key: 'st', header: 'Status', render: (s) => <StatusBadge s={s.status} /> }]} /></div>
}
export function DataMapel() {
  const [teachers, setTeachers] = useState<any[]>([])
  useEffect(() => { fetchUsers('guru').then(setTeachers).catch(() => {}) }, [])
  return <Crud singular="Mata Pelajaran" title="Data Mata Pelajaran" subtitle="Kelola mata pelajaran umum dan kejuruan" rows={[]}
    onFetch={fetchMapel}
    onCreate={createMapel}
    onUpdate={updateMapel}
    onDelete={deleteMapel}
    searchText={(s: any) => s.name + s.code}
    filterDefs={[{ k: 'kel', l: 'Kelompok', options: ['Umum', 'Kejuruan'], get: (s: any) => s.category }]}
    cols={[{ key: 'nama', header: 'Mata Pelajaran', sort: (s: any) => s.name, render: (s: any) => <div className="flex items-center gap-3"><span className="w-3 h-8 rounded-full bg-primary-dark" /><b>{s.name}</b></div> }, { key: 'kode', header: 'Kode', sort: (s: any) => s.code }, { key: 'kelompok', header: 'Kelompok', render: (s: any) => <Badge tone={s.category === 'Umum' ? 'blue' : 'green'}>{s.category}</Badge> }, { key: 'guru', header: 'Guru Utama', render: (s: any) => teachers.find(t => t.id === s.teacher_id)?.full_name || '-' }]}
    fields={[{ k: 'nama', l: 'Nama Mata Pelajaran', req: true }, { k: 'kode', l: 'Kode', req: true, validate: (v) => (v.length > 5 ? 'Maksimal 5 karakter' : '') }, { k: 'kelompok', l: 'Kelompok', options: ['Umum', 'Kejuruan'] }, { k: 'guru', l: 'Guru Utama', options: teachers.map((t) => ({ v: t.id, l: t.full_name })) }]}
    toForm={(s: any) => ({ nama: s.name, kode: s.code, kelompok: s.category, guru: s.teacher_id })} fromForm={(f, o) => ({ ...(o ?? {}), name: f.nama, code: f.kode, category: f.kelompok, teacher_id: f.guru } as any)}
    detail={(s: any) => <><h3 className="font-extrabold text-xl">{s.name}</h3><Det items={[['Kode', s.code], ['Kelompok', s.category], ['Guru utama', teachers.find(t => t.id === s.teacher_id)?.full_name || '-']]} /></>} />
}
export function DataJurusan() {
  return <Crud singular="Jurusan" title="Data Jurusan" subtitle="Kelola program keahlian" rows={jurusan} searchText={(j) => j.nama + j.kode}
    cols={[{ key: 'nama', header: 'Program Keahlian', sort: (j: any) => j.nama, render: (j: any) => <b>{j.nama}</b> }, { key: 'kode', header: 'Kode', render: (j: any) => <Badge tone="green">{j.kode}</Badge> }, { key: 'kaprodi', header: 'Kepala Program' }, { key: 'siswa', header: 'Jumlah Siswa (data contoh)', sort: (j: any) => j.siswa }]}
    fields={[{ k: 'nama', l: 'Nama Program Keahlian', req: true }, { k: 'kode', l: 'Kode', req: true }, { k: 'kaprodi', l: 'Kepala Program', req: true }]} toForm={(j) => ({ nama: j.nama, kode: j.kode, kaprodi: j.kaprodi })} fromForm={(f, o) => ({ ...(o ?? { id: f.kode, siswa: 0 }), ...f } as any)}
    detail={(j) => <><h3 className="font-extrabold text-xl">{j.nama}</h3><Det items={[['Kode', j.kode], ['Kepala Program', j.kaprodi], ['Jumlah kelas', kelas.filter((k) => k.jurusan === j.id).length], ['Jumlah siswa', j.siswa]]} /></>} />
}

export function TUDashboard() {
  const nav = useNavigate()
  const perJ = jurusan.map((j) => ({ n: j.kode, v: j.id === 'RPL' ? 412 : j.id === 'TKJ' ? 361 : 307 })); const perT = [{ n: 'Kelas X', v: 372, c: '#0B3D5F' }, { n: 'Kelas XI', v: 361, c: '#2563EB' }, { n: 'Kelas XII', v: 347, c: '#F59E0B' }]
  const warn = [['7 siswa belum memiliki kelas', '/tu/siswa', 'Tetapkan Kelas'], ['2 kelas belum memiliki wali kelas', '/tu/kelas', 'Tetapkan Wali'], ['3 guru belum memiliki mata pelajaran', '/tu/penugasan', 'Tugaskan Guru']]
  const short = [['Tambah Siswa', <GraduationCap />, '/tu/siswa'], ['Tambah Guru', <Users />, '/tu/guru'], ['Atur Jadwal', <CalendarDays />, '/tu/jadwal'], ['Penugasan Guru', <ClipboardCheck />, '/tu/penugasan']] as const
  return (
    <div><PageHeader crumbs={[{ l: 'Dashboard' }]} title="Dashboard Tata Usaha" subtitle="Ringkasan data akademik SMK Negeri 2 Indramayu • Kamis, 29 Oktober 2026" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"><Stat icon={<GraduationCap />} label="Total Siswa" value="1.080" trend="+2,4%" /><Stat icon={<Users />} label="Total Guru" value="64" tone="blue" trend="+1,6%" /><Stat icon={<School />} label="Total Kelas" value="36" tone="amber" /><Stat icon={<BookOpen />} label="Mata Pelajaran" value="24" tone="green" /></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">{short.map(([l, i, to]) => <Card key={l} hover onClick={() => nav(to)} className="flex items-center gap-4 !p-5"><span className="w-12 h-12 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center">{i}</span><b>{l}</b></Card>)}</div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mb-6"><Card><CardTitle>Siswa per Jurusan</CardTitle><div style={{ height: 270 }}><ResponsiveContainer><BarChart data={perJ}><CartesianGrid vertical={false} stroke="#E5E7EB" /><XAxis dataKey="n" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="v" name="Jumlah Siswa" radius={[12, 12, 0, 0]} fill="#0B3D5F" barSize={64} /></BarChart></ResponsiveContainer></div></Card>
        <Card><CardTitle>Siswa per Tingkat</CardTitle><div className="relative" style={{ height: 270 }}><ResponsiveContainer><PieChart><Pie data={perT} dataKey="v" nameKey="n" innerRadius={66} outerRadius={96} paddingAngle={3} cornerRadius={8}>{perT.map((p) => <Cell key={p.n} fill={p.c} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer><div className="absolute inset-0 -mt-4 flex flex-col items-center justify-center pointer-events-none"><b className="text-2xl">1.080</b><span className="text-xs text-muted">Siswa</span></div></div></Card></div>
      <div className="grid lg:grid-cols-2 gap-6"><Card><CardTitle right={<Link className="text-sm font-bold text-accent" to="/tu/log">Lihat semua</Link>}>Log Aktivitas Terbaru</CardTitle><ul className="space-y-3">{logs.slice(0, 5).map((l) => <li key={l.id} className="flex gap-3 items-start"><Avatar name={l.user} size={34} /><div className="flex-1 text-sm"><b>{l.user}</b> <span className="text-muted">{l.aksi}</span><div className="text-xs text-muted">{l.waktu}</div></div></li>)}</ul></Card>
        <Card><CardTitle icon={<AlertTriangle size={20} className="text-warn" />}>Peringatan Data</CardTitle><ul className="space-y-3">{warn.map(([t, to, a]) => <li key={t} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5"><AlertTriangle size={18} className="text-amber-600 shrink-0" /><span className="flex-1 text-sm font-semibold">{t}</span><Link to={to} className="text-sm font-bold text-accent hover:underline whitespace-nowrap">{a}</Link></li>)}</ul></Card></div></div>
  )
}

// ---------- Penugasan ----------
const tm = (t: string) => { const [h, m] = t.split('.').map(Number); return h * 60 + m }
export function PenugasanGuru() {
  const { toast } = useApp(); const [asg, setAsg] = useState<Record<string, string>>(() => Object.fromEntries(offerings.map((o) => [o.id, o.guru]))); const [kl, setKl] = useState('Semua'); const [sem, setSem] = useState('Semester Ganjil 2026/2027'); const [bulk, setBulk] = useState<string[] | null>(null); const [bg, setBg] = useState('t1')
  const conflicts = useMemo(() => { const c: Record<string, string> = {}; offerings.forEach((a) => offerings.forEach((b) => { if (a.id < b.id && asg[a.id] === asg[b.id]) a.jadwal.forEach((x) => b.jadwal.forEach((y) => { if (x.hari === y.hari && tm(x.mulai) < tm(y.selesai) && tm(y.mulai) < tm(x.selesai)) { c[a.id] = `Bentrok dengan ${subjectById(b.subjectId).nama} ${b.kode}`; c[b.id] = `Bentrok dengan ${subjectById(a.subjectId).nama} ${a.kode}` } })) })); return c }, [asg])
  const rows = offerings.filter((o) => kl === 'Semua' || kelasById(o.kelasId).nama === kl)
  const nC = Object.keys(conflicts).length
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Penugasan Guru' })} title="Penugasan Guru" subtitle="Tetapkan guru pengampu untuk setiap mata pelajaran dan kelas per semester" actions={<Select aria-label="Semester" value={sem} onChange={(e) => setSem(e.target.value)} options={['Semester Ganjil 2026/2027', 'Semester Genap 2025/2026']} className="!w-64" />} />
      {nC > 0 && <div role="alert" className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 mb-5"><AlertTriangle className="shrink-0 mt-0.5" /><div className="text-sm"><b>Peringatan konflik jadwal.</b> Terdapat {nC} penugasan dengan jadwal yang bertabrakan. Periksa baris bertanda merah.</div></div>}
      <DataTable rows={rows} pageSize={10} selectable searchText={(o) => offeringTitle(o) + teacherById(asg[o.id]).nama} searchPlaceholder="Cari mata pelajaran, kelas, atau guru" filters={<Select aria-label="Kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...kelas.map((k) => k.nama)]} className="!w-40 !h-11" />}
        bulk={[{ l: 'Tetapkan Guru', icon: <UserPlus size={15} />, onClick: (ids) => setBulk(ids as string[]) }]}
        cols={[{ key: 'm', header: 'Mata Pelajaran', sort: (o: Offering) => subjectById(o.subjectId).nama, render: (o: Offering) => <b>{subjectById(o.subjectId).nama}</b> }, { key: 'k', header: 'Kelas', sort: (o: Offering) => kelasById(o.kelasId).nama, render: (o: Offering) => kelasById(o.kelasId).nama }, { key: 'j', header: 'Jadwal', render: (o: Offering) => o.jadwal.map((j) => `${HARI[j.hari].slice(0, 3)} ${j.mulai}`).join(', ') }, { key: 'g', header: 'Guru Pengampu', render: (o: Offering) => <div><select aria-label="Guru pengampu" value={asg[o.id]} onChange={(e) => { setAsg({ ...asg, [o.id]: e.target.value }); toast('Penugasan guru diperbarui') }} className={cn('h-10 rounded-xl border px-3 text-sm bg-white', conflicts[o.id] ? 'border-danger bg-red-50' : 'border-line')}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.sapaan}</option>)}</select>{conflicts[o.id] && <div className="text-xs text-danger font-semibold mt-1">{conflicts[o.id]}</div>}</div> }]} />
      <Modal open={!!bulk} onClose={() => setBulk(null)} title={`Tetapkan Guru untuk ${bulk?.length} Kelas`} footer={<><Btn variant="outline" onClick={() => setBulk(null)}>Batal</Btn><Btn onClick={() => { setAsg({ ...asg, ...Object.fromEntries(bulk!.map((i) => [i, bg])) }); setBulk(null); toast('Penugasan massal berhasil disimpan') }}>Terapkan</Btn></>}><Select label="Guru Pengampu" value={bg} onChange={(e) => setBg(e.target.value)} options={teachers.map((t) => ({ v: t.id, l: t.nama }))} /><p className="text-sm text-muted">Guru yang dipilih akan ditetapkan pada seluruh kelas terpilih. Sistem akan menandai bentrok jadwal jika ada.</p></Modal></div>
  )
}

// ---------- Jadwal editor ----------
const SL = [['07.00', '08.40'], ['08.40', '10.20'], ['10.20', '12.00'], ['12.40', '14.20']]
const slotIdx = (m: string) => (tm(m) < 520 ? 0 : tm(m) < 620 ? 1 : tm(m) < 740 ? 2 : 3)
export function JadwalEditor() {
  const { toast } = useApp(); const [kid, setKid] = useState('k2'); const [grid, setGrid] = useState<Record<string, Record<string, string[]>>>({})
  const g = grid[kid] ?? (() => { const m: Record<string, string[]> = {}; offerings.filter((o) => o.kelasId === kid).forEach((o) => o.jadwal.forEach((j) => { const k = `${j.hari}-${slotIdx(j.mulai)}`; m[k] = [...(m[k] ?? []), o.id] })); return m })()
  const drag = useRef<{ id: string; from: string } | null>(null); const [warn, setWarn] = useState<string | null>(null)
  const teacherBusy = (oid: string, cell: string) => { const o = offerings.find((x) => x.id === oid)!; return offerings.some((x) => x.kelasId !== kid && x.guru === o.guru && x.jadwal.some((j) => `${j.hari}-${slotIdx(j.mulai)}` === cell)) }
  const move = (to: string) => { const d = drag.current; if (!d || d.from === to) return; const ng = { ...g, [d.from]: (g[d.from] ?? []).filter((x) => x !== d.id), [to]: [...(g[to] ?? []), d.id] }; setGrid({ ...grid, [kid]: ng }); const bt = teacherBusy(d.id, to) ? 'Bentrok: guru pengampu sudah mengajar di kelas lain pada jam ini.' : (ng[to].length > 1 ? 'Bentrok: dua mata pelajaran pada jam yang sama di kelas ini.' : null); setWarn(bt); if (bt) toast(bt, 'warn'); else toast('Jadwal dipindahkan', 'info'); drag.current = null }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Jadwal Pelajaran' })} title="Jadwal Pelajaran" subtitle="Editor jadwal mingguan per kelas. Seret blok mata pelajaran ke slot lain." actions={<><Select aria-label="Kelas" value={kid} onChange={(e) => { setKid(e.target.value); setWarn(null) }} options={kelas.map((k) => ({ v: k.id, l: k.nama }))} className="!w-40" /><Btn icon={<Save size={18} />} onClick={() => toast('Jadwal berhasil disimpan')}>Simpan Jadwal</Btn></>} />
      {warn && <div role="alert" className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-5 text-sm"><AlertTriangle size={18} />{warn}</div>}
      <Card className="overflow-x-auto"><div className="min-w-[900px]"><div className="grid gap-2" style={{ gridTemplateColumns: '110px repeat(6, 1fr)' }}><div />{[1, 2, 3, 4, 5, 6].map((d) => <div key={d} className="text-center font-bold text-sm py-2">{HARI[d]}</div>)}
        {SL.map((s, si) => [<div key={'t' + si} className="text-xs text-muted font-semibold flex items-center">{s[0]} - {s[1]}</div>, ...[1, 2, 3, 4, 5, 6].map((d) => { const k = `${d}-${si}`; const items = g[k] ?? []; const bad = items.length > 1 || items.some((i) => teacherBusy(i, k))
          return <div key={k} onDragOver={(e) => e.preventDefault()} onDrop={() => move(k)} className={cn('min-h-20 rounded-xl border-2 border-dashed p-1.5 space-y-1.5', bad ? 'border-danger bg-red-50' : items.length ? 'border-transparent bg-gray-50' : 'border-line')}>{items.map((i) => { const o = offerings.find((x) => x.id === i)!; const sub = subjectById(o.subjectId); return <div key={i} draggable onDragStart={() => (drag.current = { id: i, from: k })} className="rounded-lg px-2 py-1.5 text-white text-xs cursor-grab active:cursor-grabbing shadow-soft" style={{ background: sub.warna }}><div className="flex items-center gap-1 font-bold"><GripVertical size={12} />{sub.nama}</div><div className="opacity-90">{teacherById(o.guru).sapaan}</div></div> })}</div> })])}</div></div></Card></div>
  )
}

// ---------- Tahun Ajaran ----------
export function TahunAjaran() {
  const { toast, confirm } = useApp(); const [rows, setRows] = useState(tahunAjaran); const [ev, setEv] = useState(kalender); const [modal, setModal] = useState<'ta' | 'ev' | null>(null); const [f, setF] = useState({ nama: '', semester: 'Ganjil', mulai: '', selesai: '' }); const [e, setE] = useState<Record<string, string>>({}); const [fe, setFe] = useState({ judul: '', tgl: '', jenis: 'Kegiatan' })
  const addTa = () => { const x: Record<string, string> = {}; if (!/^\d{4}\/\d{4}$/.test(f.nama)) x.nama = 'Format tahun ajaran: 2027/2028'; if (!f.mulai) x.mulai = 'Tanggal mulai wajib diisi'; if (!f.selesai || f.selesai <= f.mulai) x.selesai = 'Tanggal selesai harus setelah mulai'; setE(x); if (Object.keys(x).length) return; setRows([...rows, { id: 'ta' + Date.now(), nama: f.nama, semester: f.semester, mulai: f.mulai, selesai: f.selesai, aktif: false }]); setModal(null); toast('Tahun ajaran berhasil ditambahkan') }
  const addEv = () => { if (!fe.judul.trim() || !fe.tgl) return toast('Judul dan tanggal wajib diisi', 'err'); setEv([...ev, { tgl: fe.tgl, akhir: fe.tgl, judul: fe.judul, jenis: fe.jenis }].sort((a, b) => a.tgl.localeCompare(b.tgl))); setModal(null); setFe({ judul: '', tgl: '', jenis: 'Kegiatan' }); toast('Agenda berhasil ditambahkan') }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tahun Ajaran' })} title="Tahun Ajaran" subtitle="Kelola tahun ajaran, semester aktif, dan kalender akademik" actions={<Btn icon={<Plus size={18} />} onClick={() => { setF({ nama: '', semester: 'Ganjil', mulai: '', selesai: '' }); setE({}); setModal('ta') }}>Tambah Tahun Ajaran</Btn>} />
      <DataTable rows={rows} cols={[{ key: 'nama', header: 'Tahun Ajaran', render: (r: any) => <b>{r.nama}</b> }, { key: 'semester', header: 'Semester' }, { key: 'mulai', header: 'Mulai' }, { key: 'selesai', header: 'Selesai' }, { key: 'aktif', header: 'Status', render: (r: any) => <StatusBadge s={r.aktif ? 'Aktif' : 'Nonaktif'} /> }]} actions={(r: any) => [...(!r.aktif ? [{ l: 'Jadikan Aktif', icon: <Check size={16} />, onClick: () => confirm({ title: 'Jadikan Tahun Ajaran Aktif?', message: `${r.nama} semester ${r.semester} akan menjadi periode aktif seluruh sistem.`, okLabel: 'Ya, Aktifkan', onOk: () => { setRows(rows.map((x) => ({ ...x, aktif: x.id === r.id }))); toast('Tahun ajaran aktif diperbarui') } }) }] : []), { l: 'Hapus', icon: <Trash2 size={16} />, danger: true, onClick: () => confirm({ title: 'Hapus Tahun Ajaran?', message: 'Data tahun ajaran akan dihapus.', danger: true, onOk: () => { setRows(rows.filter((x) => x.id !== r.id)); toast('Tahun ajaran dihapus') } }) }]} />
      <div className="flex items-center justify-between mt-8 mb-3"><h2 className="text-[22px] font-bold">Kalender Akademik</h2><Btn variant="outline" icon={<Plus size={18} />} onClick={() => setModal('ev')}>Tambah Agenda</Btn></div>
      <Card pad={false} className="divide-y divide-line overflow-hidden">{ev.map((k, i) => <div key={i} className="flex items-center gap-4 p-4"><div className="w-14 text-center bg-primary-light rounded-xl py-1.5"><div className="text-xs font-bold text-primary-dark">{new Date(k.tgl).toLocaleDateString('id-ID', { month: 'short' })}</div><div className="text-xl font-extrabold">{new Date(k.tgl).getDate()}</div></div><div className="flex-1"><b>{k.judul}</b></div><Badge tone={k.jenis === 'Libur' ? 'red' : k.jenis === 'Kegiatan' ? 'blue' : 'amber'}>{k.jenis}</Badge><Btn variant="ghost" className="!px-2" aria-label="Hapus agenda" onClick={() => confirm({ title: 'Hapus Agenda?', message: `"${k.judul}" akan dihapus dari kalender.`, danger: true, onOk: () => { setEv(ev.filter((_, j) => j !== i)); toast('Agenda dihapus') } })}><Trash2 size={17} className="text-danger" /></Btn></div>)}</Card>
      <Modal open={modal === 'ta'} onClose={() => setModal(null)} title="Tambah Tahun Ajaran" footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn onClick={addTa}>Simpan</Btn></>}><Input label="Tahun Ajaran" placeholder="2027/2028" value={f.nama} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><Select label="Semester" value={f.semester} onChange={(x) => setF({ ...f, semester: x.target.value })} options={['Ganjil', 'Genap']} /><Input label="Mulai" type="date" value={f.mulai} onChange={(x) => setF({ ...f, mulai: x.target.value })} error={e.mulai} /><Input label="Selesai" type="date" value={f.selesai} onChange={(x) => setF({ ...f, selesai: x.target.value })} error={e.selesai} /></Modal>
      <Modal open={modal === 'ev'} onClose={() => setModal(null)} title="Tambah Agenda Akademik" footer={<><Btn variant="outline" onClick={() => setModal(null)}>Batal</Btn><Btn onClick={addEv}>Simpan</Btn></>}><Input label="Judul Agenda" value={fe.judul} onChange={(x) => setFe({ ...fe, judul: x.target.value })} /><Input label="Tanggal" type="date" value={fe.tgl} onChange={(x) => setFe({ ...fe, tgl: x.target.value })} /><Select label="Jenis" value={fe.jenis} onChange={(x) => setFe({ ...fe, jenis: x.target.value })} options={['UTS', 'UAS', 'Libur', 'Kegiatan']} /></Modal></div>
  )
}

// ---------- Pengguna ----------
export function ManajemenPengguna() {
  const { toast, confirm } = useApp(); const [tab, setTab] = useTab('pengguna');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [perm, setPerm] = useState(() => permissions.map(p => [...p]))

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data.map((u: any) => ({
        id: u.id,
        nama: u.full_name,
        ident: u.email,
        role: u.role || 'Siswa',
        aktif: u.status === 'Aktif'
      })));
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load() }, []);

  const updateRole = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role);
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      toast('Role pengguna berhasil diperbarui');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      toast('Email dan Nama wajib diisi', 'err');
      return;
    }
    setIsSubmitting(true);
    try {
      const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo';
      const res = await fetch('https://phtqlmidfaocacphblej.supabase.co/auth/v1/admin/users', {
        method: 'POST',
        headers: {
          'apikey': serviceRole,
          'Authorization': `Bearer ${serviceRole}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          email_confirm: true,
          user_metadata: { nama_lengkap: newName, role: newRole }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal membuat pengguna');
      toast('Pengguna dan peran baru berhasil ditambahkan');
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setNewRole('Siswa');
      setNewPassword('password123');
      fetchUsers();
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setIsSubmitting(false);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Siswa');
  const [newPassword, setNewPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Manajemen Pengguna & Hak Akses' })} title="Manajemen Pengguna & Hak Akses" subtitle="Atur peran, status akun, dan izin setiap peran (Sinkron Supabase)" actions={<Btn icon={<UserPlus size={18} />} onClick={() => setShowAddModal(true)}>Tambah Pengguna</Btn>} />
      <Tabs className="mb-6" tabs={[{ v: 'pengguna', l: 'Pengguna' }, { v: 'hak', l: 'Matriks Hak Akses' }]} value={tab} onChange={setTab} />
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengguna & Peran Baru" footer={<><Btn variant="outline" onClick={() => setShowAddModal(false)}>Batal</Btn><Btn loading={isSubmitting} icon={<Save size={16} />} onClick={handleAddUser}>Simpan Pengguna</Btn></>}>
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Contoh: Budi Santoso" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Alamat Email (Akun Login)" placeholder="budi@smkn2.sch.id" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <Select label="Peran / Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} options={['Tata Usaha', 'Guru Mapel', 'Wali Kelas', 'Kepala Sekolah', 'Siswa']} />
          <Input label="Kata Sandi Awal" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </form>
      </Modal>
      {tab === 'pengguna' ? <DataTable rows={users} pageSize={10} searchText={(u) => u.nama + u.ident} searchPlaceholder="Cari nama atau email" filters={null} cols={[{ key: 'nama', header: 'Pengguna', sort: (u: any) => u.nama, render: (u: any) => <NameCell name={u.nama} sub={u.ident} /> }, { key: 'role', header: 'Peran', render: (u: any) => <select aria-label={`Peran ${u.nama}`} value={u.role} onChange={async (e) => {
        const newRole = e.target.value;
        setUsers(users.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
        // Update Supabase
        await fetch(`https://phtqlmidfaocacphblej.supabase.co/rest/v1/profiles?id=eq.${u.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ role: newRole })
        });
        toast(`Peran ${u.nama} diubah menjadi ${newRole}`);
      }} className="h-10 rounded-xl border border-line px-3 text-sm bg-white">{['Tata Usaha', 'Guru Mapel', 'Wali Kelas', 'Kepala Sekolah', 'Siswa'].map((r) => <option key={r} value={r}>{r}</option>)}</select> }, { key: 'aktif', header: 'Status', render: (u: any) => <Toggle on={u.aktif} label={`Aktif ${u.nama}`} onChange={async (v) => {
        setUsers(users.map((x) => (x.id === u.id ? { ...x, aktif: v } : x)));
        const newStatus = v ? 'aktif' : 'nonaktif';
        await fetch(`https://phtqlmidfaocacphblej.supabase.co/rest/v1/profiles?id=eq.${u.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ status: newStatus })
        });
        toast(v ? 'Akun diaktifkan di Supabase' : 'Akun dinonaktifkan di Supabase', 'info');
      }} /> }]}
        actions={(u: any) => [{ l: 'Reset Kata Sandi', icon: <KeyRound size={16} />, onClick: () => confirm({ title: 'Reset Kata Sandi?', message: `Kata sandi ${u.nama} akan diatur ulang ke password123.`, okLabel: 'Ya, Reset', onOk: async () => {
          await fetch(`https://phtqlmidfaocacphblej.supabase.co/auth/v1/admin/users/${u.id}`, {
            method: 'PUT',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: 'password123' })
          });
          toast('Kata sandi berhasil direset ke password123', 'info');
        }}) }]} />
        : <Card pad={false} className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-gray-50 text-xs uppercase text-muted"><tr><th className="p-4 text-left">Izin</th>{ROLE_ORDER.map((r) => <th key={r} className="text-center">{r}</th>)}</tr></thead><tbody>{perm.map((p, i) => <tr key={i} className="border-t border-line h-14 hover:bg-gray-50"><td className="p-4 font-semibold">{p[0] as string}</td>{[1, 2, 3, 4, 5].map((c) => <td key={c} className="text-center"><input type="checkbox" aria-label={`${p[0]} ${ROLE_ORDER[c - 1]}`} checked={!!p[c]} onChange={() => setPerm(perm.map((x, j) => (j === i ? x.map((v, k) => (k === c ? !v : v)) : x)))} className="w-5 h-5 accent-[#0B3D5F]" /></td>)}</tr>)}</tbody></table></div><div className="p-4 border-t border-line flex justify-end"><Btn icon={<Save size={18} />} onClick={() => toast('Hak akses berhasil disimpan')}>Simpan Hak Akses</Btn></div></Card>}</div>
  )
}
export function LogAktivitas() {
  const [r, setR] = useState('Semua'); const [m, setM] = useState('Semua'); const rows = logs.filter((l) => (r === 'Semua' || l.role === r) && (m === 'Semua' || l.modul === m))
  return <div><PageHeader crumbs={useCrumbs({ l: 'Log Aktivitas' })} title="Log Aktivitas" subtitle="Rekam jejak aktivitas pengguna di dalam sistem" actions={<Btn variant="outline" icon={<Download size={18} />} onClick={() => download('log-aktivitas.csv')}>Ekspor</Btn>} />
    <DataTable rows={rows} pageSize={10} searchText={(l) => l.user + l.aksi} searchPlaceholder="Cari pengguna atau aktivitas" filters={<><Select aria-label="Peran" value={r} onChange={(e) => setR(e.target.value)} options={['Semua', 'Siswa', 'Guru', 'Tata Usaha']} className="!w-40 !h-11" /><Select aria-label="Modul" value={m} onChange={(e) => setM(e.target.value)} options={['Semua', ...new Set(logs.map((l) => l.modul))]} className="!w-44 !h-11" /></>}
      cols={[{ key: 'waktu', header: 'Waktu', sort: (l: any) => -l.id }, { key: 'user', header: 'Pengguna', sort: (l: any) => l.user, render: (l: any) => <NameCell name={l.user} sub={l.role} /> }, { key: 'aksi', header: 'Aktivitas' }, { key: 'modul', header: 'Modul', render: (l: any) => <Badge tone="blue">{l.modul}</Badge> }, { key: 'ip', header: 'Alamat IP' }]} /></div>
}
export function PengaturanSistem() {
  const { toast } = useApp(); const [f, setF] = useState({ ta: '2026/2027 - Ganjil', nama: 'SMK Negeri 2 Indramayu', npsn: '20213456', alamat: 'Jl. Raya Lohbener, Indramayu, Jawa Barat', telp: '(0234) 272 123', min: 75 }); const [b, setB] = useState({ tugas: 30, kuis: 20, uts: 30, uas: 20 }); const [jam, setJam] = useState(jamPelajaran.map((j) => [...j])); const [e, setE] = useState<Record<string, string>>({})
  const tot = b.tugas + b.kuis + b.uts + b.uas
  const save = () => { const x: Record<string, string> = {}; if (tot !== 100) x.bobot = `Total bobot harus 100% (saat ini ${tot}%)`; if (f.min < 0 || f.min > 100) x.min = 'Ambang 0 - 100'; if (!f.nama.trim()) x.nama = 'Nama sekolah wajib diisi'; setE(x); if (!Object.keys(x).length) toast('Pengaturan sistem berhasil disimpan') }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Pengaturan Sistem' })} title="Pengaturan Sistem" subtitle="Konfigurasi tahun ajaran, jam pelajaran, profil sekolah, dan penilaian" actions={<Btn icon={<Save size={18} />} onClick={save}>Simpan Pengaturan</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6"><div className="space-y-6"><Card className="space-y-4"><CardTitle icon={<Building2 size={20} className="text-primary" />}>Profil Sekolah</CardTitle><Input label="Nama Sekolah" value={f.nama} onChange={(x) => setF({ ...f, nama: x.target.value })} error={e.nama} /><div className="grid sm:grid-cols-2 gap-4"><Input label="NPSN" value={f.npsn} onChange={(x) => setF({ ...f, npsn: x.target.value })} /><Input label="Telepon" value={f.telp} onChange={(x) => setF({ ...f, telp: x.target.value })} /></div><Textarea label="Alamat" value={f.alamat} onChange={(x) => setF({ ...f, alamat: x.target.value })} /><Field label="Logo Sekolah"><Dropzone accept="PNG atau JPG (maks. 2 MB)" /></Field></Card>
        <Card className="space-y-4"><CardTitle icon={<CalendarDays size={20} className="text-primary" />}>Periode & Kehadiran</CardTitle><Select label="Tahun Ajaran Aktif" value={f.ta} onChange={(x) => setF({ ...f, ta: x.target.value })} options={['2026/2027 - Ganjil', '2026/2027 - Genap']} /><Input label="Ambang Kehadiran Minimum (%)" type="number" value={f.min} onChange={(x) => setF({ ...f, min: Number(x.target.value) })} error={e.min} hint="Siswa di bawah ambang ini ditandai berisiko." /></Card></div>
        <div className="space-y-6"><Card><CardTitle icon={<Award size={20} className="text-primary" />}>Bobot Nilai</CardTitle><div className="grid grid-cols-2 gap-4">{(['tugas', 'kuis', 'uts', 'uas'] as const).map((k) => <Input key={k} label={`${k.toUpperCase().replace('TUGAS', 'Tugas').replace('KUIS', 'Kuis')} (%)`} type="number" value={b[k]} onChange={(x) => setB({ ...b, [k]: Number(x.target.value) })} />)}</div><div className="mt-4"><div className="flex justify-between text-sm font-semibold mb-1.5"><span>Total bobot</span><span className={tot === 100 ? 'text-ok' : 'text-danger'}>{tot}%</span></div><Progress value={Math.min(100, tot)} tone={tot === 100 ? 'green' : 'red'} /></div>{e.bobot && <p role="alert" className="text-danger text-xs font-semibold mt-2">{e.bobot}</p>}</Card>
          <Card><CardTitle icon={<ClipboardCheck size={20} className="text-primary" />}>Jam Pelajaran</CardTitle><div className="space-y-2">{jam.map((j, i) => <div key={i} className="flex items-center gap-3"><span className="w-20 text-sm font-bold">Jam ke-{j[0]}</span><input aria-label={`Waktu jam ke-${j[0]}`} value={j[1]} onChange={(x) => setJam(jam.map((y, z) => (z === i ? [y[0], x.target.value] : y)))} className="flex-1 h-10 rounded-xl border border-line px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/20" /></div>)}</div></Card></div></div></div>
  )
}
export { Database, Activity, Chips, Empty, Segmented, SearchBar, Badge }
