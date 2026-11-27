import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileText, Paperclip, Send, Undo2 } from 'lucide-react'
import { Btn, Card, Dropzone, PageHeader, Ring, StatusBadge, Textarea, download, useCountdown, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { fmtBatas, offeringById, offeringTitle, subjectById, teacherById, tugasById } from '@/lib/data'

export function TugasDetail() {
  const { id } = useParams(); const t0 = tugasById(id!); const { toast, confirm } = useApp(); const o = offeringById(t0.off)
  const [status, setStatus] = useState(t0.status); const [uploaded, setUploaded] = useState(status === 'Dikumpulkan' || status === 'Dinilai' ? 1 : 0); const [note, setNote] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const batas = new Date(t0.batas); const cd = useCountdown(batas); const overdue = new Date(2026, 9, 29, 9, 30) > batas
  const submit = () => { if (!uploaded) return setErr('Unggah minimal satu berkas sebelum mengumpulkan'); setErr(''); setBusy(true); setTimeout(() => { setBusy(false); setStatus(overdue ? 'Terlambat' : 'Dikumpulkan'); toast('Tugas berhasil dikumpulkan') }, 800) }
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Tugas & Kuis', to: '/siswa/tugas' }, { l: 'Detail Tugas' })} title={t0.judul} subtitle={offeringTitle(o)} actions={<Btn variant="outline" icon={<ArrowLeft size={18} />} to="/siswa/tugas">Kembali</Btn>} />
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        <Card><div className="flex flex-wrap gap-x-8 gap-y-3 text-sm pb-5 border-b border-line"><div><div className="text-xs text-muted">Mata Pelajaran</div><b>{subjectById(o.subjectId).nama}</b></div><div><div className="text-xs text-muted">Guru</div><b>{teacherById(o.guru).sapaan}</b></div><div><div className="text-xs text-muted">Batas Pengumpulan</div><b>{fmtBatas(t0.batas)}</b></div><div><div className="text-xs text-muted">Nilai Maksimal</div><b>{t0.maks}</b></div></div>
          <h3 className="font-bold text-lg mt-5 mb-2">Instruksi</h3><p className="whitespace-pre-line leading-7 text-[15px]">{t0.instruksi}</p>
          <h3 className="font-bold text-lg mt-6 mb-3">Lampiran Guru</h3><ul className="space-y-2">{t0.lampiran.map((l) => <li key={l.nama} className="flex items-center gap-3 border border-line rounded-xl p-3"><span className="w-10 h-10 rounded-xl bg-blue-100 text-accent flex items-center justify-center"><Paperclip size={18} /></span><div className="flex-1"><div className="font-semibold text-sm">{l.nama}</div><div className="text-xs text-muted">{l.ukuran}</div></div><Btn variant="outline" className="!h-9" icon={<Download size={16} />} onClick={() => { download(l.nama); toast('Mengunduh lampiran', 'info') }}>Unduh</Btn></li>)}</ul></Card>
        <div className="space-y-5 lg:sticky lg:top-24">
          <Card><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">Status Pengumpulan</h3><StatusBadge s={status} /></div>
            {status === 'Dinilai' ? <div className="text-center"><Ring value={t0.nilai ?? 0} size={130} sub={`dari ${t0.maks}`} /><div className="text-left mt-5 bg-primary-light rounded-2xl p-4"><div className="text-xs font-bold text-primary-dark uppercase">Umpan Balik Guru</div><p className="text-sm mt-1 leading-6">{t0.feedback}</p></div></div> : (<>
              {status === 'Belum Dikumpulkan' && !overdue && <div className="grid grid-cols-4 gap-2 text-center mb-4">{[['d', 'Hari'], ['h', 'Jam'], ['m', 'Menit'], ['s', 'Detik']].map(([k, l]) => <div key={k} className="bg-gray-50 rounded-xl py-2"><div className="text-xl font-extrabold">{String(cd[k as 'd']).padStart(2, '0')}</div><div className="text-[11px] text-muted">{l}</div></div>)}</div>}
              {overdue && status === 'Belum Dikumpulkan' && <div className="flex gap-2 bg-orange-50 text-orange-800 rounded-xl p-3 text-sm mb-4"><AlertTriangle size={18} />Batas waktu sudah lewat. Pengumpulan akan ditandai terlambat.</div>}
              {(status === 'Dikumpulkan' || status === 'Terlambat') ? <div className="space-y-3"><div className="flex items-center gap-3 border border-line rounded-xl p-3"><FileText className="text-accent" /><div className="flex-1 text-sm"><b>Jawaban-Rina-Aulia.pdf</b><div className="text-xs text-muted">Dikumpulkan 29 Okt 2026, 09.30</div></div><CheckCircle2 className="text-ok" /></div>
                {!overdue && <Btn variant="outline" full icon={<Undo2 size={16} />} onClick={() => confirm({ title: 'Batalkan Pengumpulan?', message: 'Berkas yang sudah dikumpulkan akan ditarik. Kamu dapat mengumpulkan ulang sebelum batas waktu.', okLabel: 'Ya, Batalkan', danger: true, onOk: () => { setStatus('Belum Dikumpulkan'); setUploaded(0); toast('Pengumpulan dibatalkan', 'info') } })}>Batalkan Pengumpulan</Btn>}</div>
                : <div className="space-y-4"><Dropzone multiple onDone={(n) => { setUploaded(n); setErr('') }} /><Textarea label="Catatan untuk guru (opsional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan singkat..." />{err && <p role="alert" className="text-danger text-xs font-semibold">{err}</p>}<Btn full loading={busy} icon={<Send size={16} />} onClick={submit}>Kumpulkan</Btn></div>}</>)}
          </Card></div></div></div>
  )
}
