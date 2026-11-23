import { useRef, useState } from 'react'
import { CheckCircle2, FileText, Trash2, UploadCloud } from 'lucide-react'
import { IconBtn } from './button'
import { Progress } from './progress'
import { cn } from './cn'

export function Dropzone({ multiple, accept = 'PDF, DOCX, PNG, JPG, ZIP (maks. 20 MB)', onDone }: { multiple?: boolean; accept?: string; onDone?: (n: number) => void }) {
  const [files, setFiles] = useState<{ name: string; size: string; p: number }[]>([]); const [drag, setDrag] = useState(false); const input = useRef<HTMLInputElement>(null)
  const add = (list: FileList | null) => {
    if (!list || !list.length) return
    const nf = [...list].slice(0, multiple ? 10 : 1).map((f) => ({ name: f.name, size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1e3))} KB`, p: 0 }))
    setFiles(multiple ? [...files, ...nf] : nf)
    const iv = setInterval(() => setFiles((fs) => { const n = fs.map((f) => ({ ...f, p: Math.min(100, f.p + 8 + Math.random() * 14) })); if (n.every((f) => f.p >= 100)) { clearInterval(iv); onDone?.(n.length) } return n }), 220)
  }
  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }} onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        className={cn('border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition', drag ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary hover:bg-gray-50')}>
        <UploadCloud className="mx-auto text-primary" size={32} /><p className="font-bold mt-2 text-sm">Tarik dan lepas berkas di sini</p><p className="text-xs text-muted">atau klik untuk memilih berkas â€¢ {accept}</p>
        <input ref={input} type="file" multiple={multiple} hidden onChange={(e) => add(e.target.files)} />
      </div>
      {files.length > 0 && <ul className="mt-3 space-y-2">{files.map((f, i) => <li key={i} className="flex items-center gap-3 border border-line rounded-xl p-3"><FileText size={20} className="text-accent shrink-0" /><div className="flex-1 min-w-0"><div className="flex justify-between text-sm"><span className="font-semibold truncate">{f.name}</span><span className="text-muted">{f.p >= 100 ? f.size : `${Math.round(f.p)}%`}</span></div><Progress value={f.p} tone={f.p >= 100 ? 'green' : 'blue'} className="mt-1.5" /></div>
        {f.p >= 100 ? <CheckCircle2 size={18} className="text-ok" /> : null}<IconBtn label="Hapus berkas" onClick={() => setFiles(files.filter((_, j) => j !== i))}><Trash2 size={16} /></IconBtn></li>)}</ul>}
    </div>
  )
}
