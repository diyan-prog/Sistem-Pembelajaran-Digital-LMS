import { useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { Badge, Btn, Card, Chips, Dropzone, Empty, FileIcon, Modal, PageHeader, SearchBar, cn, fileTone, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { mediaFiles } from '@/lib/data'
import { YtThumb } from '@/pages/shared'

export function MediaLibrary() {
  const { toast, confirm } = useApp(); const [files, setFiles] = useState(mediaFiles); const [q, setQ] = useState(''); const [t, setT] = useState('semua'); const [up, setUp] = useState(false)
  const list = files.filter((f) => (t === 'semua' || f.tipe === t) && f.nama.toLowerCase().includes(q.toLowerCase()))
  const ytMap: Record<string, string> = { f4: 'qz0aGYrrlhU', f7: 'UB1O30fR-EE' }
  
  // MediaLibrary still uses local state since file upload requires storage integration
  // which needs Supabase Storage configuration. The dummy data provides a functional UI.
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Media Library' })} title="Media Library" subtitle="Dokumen, gambar, dan tautan YouTube yang pernah Anda unggah" actions={<Btn icon={<Upload size={18} />} onClick={() => setUp(true)}>Unggah Berkas</Btn>} />
      <div className="flex flex-wrap gap-3 mb-5"><SearchBar value={q} onChange={setQ} placeholder="Cari berkas" className="w-80 max-w-full" /><Chips value={t} onChange={setT} options={[{ k: 'semua', l: 'Semua', n: files.length }, { k: 'dokumen', l: 'Dokumen' }, { k: 'gambar', l: 'Gambar' }, { k: 'youtube', l: 'YouTube' }]} /></div>
      {list.length === 0 ? <Card><Empty title="Berkas tidak ditemukan" text="Coba kata kunci atau jenis berkas lain." /></Card> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{list.map((f) => <Card key={f.id} hover pad={false} className="overflow-hidden group">
        {f.tipe === 'youtube' ? <YtThumb id={ytMap[f.id] ?? 'qz0aGYrrlhU'} className="h-36" /> : <div className={cn('h-36 flex items-center justify-center', fileTone(f.tipe))}><FileIcon t={f.tipe} size={44} /></div>}
        <div className="p-4"><div className="font-bold text-sm truncate">{f.nama}</div><div className="text-xs text-muted mt-0.5">{f.ukuran} â€¢ {f.tgl}</div><div className="flex justify-between mt-3"><Badge tone={f.tipe === 'dokumen' ? 'blue' : f.tipe === 'gambar' ? 'purple' : 'red'}>{f.tipe}</Badge><button aria-label="Hapus berkas" className="text-danger p-1 rounded-lg hover:bg-red-50" onClick={() => confirm({ title: 'Hapus Berkas?', message: `"${f.nama}" akan dihapus dari Media Library.`, danger: true, onOk: () => { setFiles(files.filter((x) => x.id !== f.id)); toast('Berkas dihapus') } })}><Trash2 size={17} /></button></div></div></Card>)}</div>}
      <Modal open={up} onClose={() => setUp(false)} title="Unggah Berkas" footer={<Btn onClick={() => { setUp(false); toast('Berkas ditambahkan ke Media Library') }}>Selesai</Btn>}><Dropzone multiple accept="PDF, DOCX, PNG, JPG (maks. 20 MB)" onDone={(n) => setFiles((s) => [{ id: 'u' + Date.now(), nama: 'Berkas-Baru-' + n + '.pdf', tipe: 'dokumen', ukuran: '1,1 MB', tgl: '29 Okt 2026' }, ...s])} /></Modal></div>
  )
}
