import { useState } from 'react'
import { Bell, Palette, Save, Type } from 'lucide-react'
import { Btn, Card, CardTitle, PageHeader, Segmented, Select, Toggle, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'

// ---------- Pengaturan ----------
export function PengaturanPage() {
  const { toast } = useApp(); const [n, setN] = useState({ tugas: true, kuis: true, nilai: true, pengumuman: true, presensi: false }); const [tema, setTema] = useState('Terang'); const [ukuran, setUkuran] = useState('Sedang'); const [bhs] = useState('Bahasa Indonesia')
  const rows: [keyof typeof n, string, string][] = [['tugas', 'Tugas baru dan pengingat batas waktu', 'Dapatkan notifikasi saat tugas baru dibuat atau mendekati batas'], ['kuis', 'Kuis dan jadwal ujian', 'Pemberitahuan saat kuis dibuka atau akan ditutup'], ['nilai', 'Nilai dan umpan balik', 'Pemberitahuan ketika nilai dipublikasikan'], ['pengumuman', 'Pengumuman', 'Informasi resmi dari sekolah dan guru'], ['presensi', 'Presensi', 'Ringkasan kehadiran setiap sesi']]
  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Pengaturan' })} title="Pengaturan" subtitle="Atur notifikasi dalam aplikasi dan tampilan" actions={<Btn icon={<Save size={18} />} onClick={() => toast('Pengaturan berhasil disimpan')}>Simpan Pengaturan</Btn>} />
      <div className="grid lg:grid-cols-2 gap-6"><Card><CardTitle icon={<Bell size={20} className="text-primary" />}>Notifikasi dalam Aplikasi</CardTitle><ul className="divide-y divide-line">{rows.map(([k, t, d]) => <li key={k} className="flex items-center gap-4 py-3.5"><div className="flex-1"><div className="font-bold text-sm">{t}</div><div className="text-xs text-muted">{d}</div></div><Toggle on={n[k]} onChange={(v) => setN({ ...n, [k]: v })} label={t} /></li>)}</ul></Card>
        <Card><CardTitle icon={<Palette size={20} className="text-primary" />}>Tampilan</CardTitle><div className="space-y-5"><div><div className="font-bold text-sm mb-2">Tema</div><Segmented value={tema} onChange={setTema} options={['Terang', 'Gelap', 'Otomatis']} />{tema !== 'Terang' && <p className="text-xs text-muted mt-2">Tema gelap akan tersedia pada pembaruan berikutnya.</p>}</div><div><div className="font-bold text-sm mb-2 flex items-center gap-2"><Type size={16} />Ukuran Teks</div><Segmented value={ukuran} onChange={setUkuran} options={['Kecil', 'Sedang', 'Besar']} /></div><Select label="Bahasa" value={bhs} options={['Bahasa Indonesia']} onChange={() => {}} /></div></Card></div></div>
  )
}
