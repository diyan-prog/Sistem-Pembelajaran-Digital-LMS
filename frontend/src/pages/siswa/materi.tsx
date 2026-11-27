import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import { Accordion, Btn, Card, Empty, FileIcon, PageHeader, cn, download, fileTone, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { materiOf, offeringById, subjectById } from '@/lib/data'
import { YtThumb } from '@/pages/shared'

export function MateriList({ offId }: { offId: string }) {
  const { toast } = useApp(); const nav = useNavigate(); const ps = materiOf(offId)
  return <Accordion defaultOpen={ps.length - 1} items={ps.map((p) => ({ id: p.id, title: <span className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center text-sm font-extrabold">{p.no}</span><span><span className="block">Pertemuan {p.no}: {p.judul}</span><span className="block text-xs text-muted font-normal">{p.tanggal} • {p.items.length} materi</span></span></span>,
    body: <ul className="space-y-3 pt-3">{p.items.map((m) => m.tipe === 'youtube' ? (
      <li key={m.id} className="flex flex-col sm:flex-row gap-4 border border-line rounded-2xl p-3"><YtThumb id={m.yt!} className="w-full sm:w-48 h-28 rounded-xl shrink-0" /><div className="flex-1 flex flex-col"><div className="font-bold">{m.judul}</div><div className="text-xs text-muted mt-1 flex items-center gap-2"><FileIcon t="youtube" size={14} />Tautan YouTube • {m.tanggal}</div><div className="mt-auto pt-3"><Btn variant="outline" className="!h-9" icon={<Eye size={16} />} onClick={() => nav(`${useBase()}/kelas/${offId}/materi/${m.id}`)}>Pratinjau</Btn></div></div></li>
    ) : (
      <li key={m.id} className="flex flex-wrap items-center gap-4 border border-line rounded-2xl p-3"><span className={cn('w-11 h-11 rounded-xl flex items-center justify-center', fileTone(m.tipe))}><FileIcon t={m.tipe} /></span><div className="flex-1 min-w-[180px]"><div className="font-bold text-sm">{m.judul}</div><div className="text-xs text-muted">{m.ext} • {m.ukuran} • Diunggah {m.tanggal}</div></div>
        <Btn variant="outline" className="!h-9" icon={<Eye size={16} />} onClick={() => nav(`${useBase()}/kelas/${offId}/materi/${m.id}`)}>Pratinjau</Btn><Btn className="!h-9" icon={<Download size={16} />} onClick={() => { download(m.judul + '.txt'); toast(`Mengunduh ${m.judul}`, 'info') }}>Unduh</Btn></li>))}</ul> }))} />
}
const useBase = () => '/siswa'

export function MateriPreview() {
  const { id, mid } = useParams(); const nav = useNavigate(); const { toast } = useApp(); const base = '/siswa'
  const ps = materiOf(id!); const flat = ps.flatMap((p) => p.items.map((m) => ({ ...m, p }))); const i = flat.findIndex((m) => m.id === mid); const m = flat[i]
  const o = offeringById(id!)
  if (!m) return <Card><Empty title="Materi tidak ditemukan" action={<Btn to={`${base}/kelas/${id}`}>Kembali ke kelas</Btn>} /></Card>
  return (
    <div>
      <PageHeader crumbs={useCrumbs({ l: 'Kelas Saya', to: `${base}/kelas` }, { l: subjectById(o.subjectId).nama, to: `${base}/kelas/${id}?tab=materi` }, { l: 'Pratinjau Materi' })} title={m.judul} subtitle={`Pertemuan ${m.p.no}: ${m.p.judul}`} actions={<><Btn variant="outline" icon={<ArrowLeft size={18} />} to={`${base}/kelas/${id}?tab=materi`}>Kembali</Btn>{m.tipe !== 'youtube' && <Btn icon={<Download size={18} />} onClick={() => { download(m.judul + '.txt'); toast('Unduhan dimulai', 'info') }}>Unduh</Btn>}</>} />
      <Card pad={false} className="overflow-hidden">
        <div className="bg-gray-100 p-4 sm:p-8 flex justify-center">
          {m.tipe === 'youtube' ? <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black"><iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${m.yt}`} title={m.judul} allowFullScreen /></div>
            : m.tipe === 'gambar' ? <svg viewBox="0 0 640 400" className="w-full max-w-3xl rounded-2xl bg-white shadow-soft"><rect width="640" height="400" fill="#E8F6EC" /><rect x="60" y="60" width="200" height="120" rx="16" fill="#fff" stroke="#0B3D5F" strokeWidth="3" /><rect x="380" y="60" width="200" height="120" rx="16" fill="#fff" stroke="#2563EB" strokeWidth="3" /><rect x="220" y="240" width="200" height="100" rx="16" fill="#fff" stroke="#F59E0B" strokeWidth="3" /><path d="M260 120h120M320 180v60" stroke="#6B7280" strokeWidth="3" strokeDasharray="6" /><text x="160" y="126" textAnchor="middle" fontWeight="800" fill="#0E86C7" fontSize="20">Konsep</text><text x="480" y="126" textAnchor="middle" fontWeight="800" fill="#2563EB" fontSize="20">Praktik</text><text x="320" y="296" textAnchor="middle" fontWeight="800" fill="#B45309" fontSize="20">Evaluasi</text></svg>
              : <div className="w-full max-w-2xl bg-white rounded-xl shadow-soft p-10 min-h-[520px]"><div className="text-xs text-muted mb-6 flex justify-between"><span>SMK Negeri 2 Indramayu</span><span>Halaman 1 / 8</span></div><h2 className="text-2xl font-extrabold">{m.judul}</h2><p className="text-sm text-muted mt-1">Modul Pembelajaran • {subjectById(o.subjectId).nama}</p><div className="mt-6 space-y-3">{[100, 96, 92, 100, 70, 98, 94, 60, 100, 88].map((w, k) => <div key={k} className="h-3 rounded bg-gray-200" style={{ width: `${w}%` }} />)}</div><div className="mt-8 h-32 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark font-bold">Ilustrasi Materi</div><div className="mt-8 space-y-3">{[96, 90, 100, 74].map((w, k) => <div key={k} className="h-3 rounded bg-gray-200" style={{ width: `${w}%` }} />)}</div></div>}
        </div>
        <div className="flex items-center justify-between p-4 border-t border-line">
          <Btn variant="outline" disabled={i === 0} icon={<ChevronLeft size={18} />} onClick={() => nav(`${base}/kelas/${id}/materi/${flat[i - 1].id}`)}>Sebelumnya</Btn>
          <span className="text-sm text-muted font-semibold">Materi {i + 1} dari {flat.length}</span>
          <Btn variant="outline" disabled={i === flat.length - 1} onClick={() => nav(`${base}/kelas/${id}/materi/${flat[i + 1].id}`)}>Berikutnya<ChevronRight size={18} /></Btn></div>
      </Card>
    </div>
  )
}
