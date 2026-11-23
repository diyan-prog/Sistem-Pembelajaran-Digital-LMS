import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Btn, Card, CardTitle, Empty, PageHeader, useCrumbs } from '@/components/ui'
import { useRole } from '@/context'
import { fetchPengumuman, type Pengumuman } from '@/services/pengumuman'

export function PengumumanDetail() {
  const { id } = useParams(); 
  const { cfg } = useRole(); 
  const [p, setP] = useState<Pengumuman | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPengumuman();
      setP(data.find((x) => x.id === id) || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <Card><Empty title="Memuat..." /></Card>;
  if (!p) return <Card><Empty title="Pengumuman tidak ditemukan" action={<Btn to={`${cfg.base}/pengumuman`}>Kembali</Btn>} /></Card>
  
  return <div><PageHeader crumbs={useCrumbs({ l: 'Pengumuman', to: `${cfg.base}/pengumuman` }, { l: 'Detail' })} title={p.judul} subtitle={`${p.dibuat_oleh} â€¢ ${p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}`} actions={<Btn variant="outline" to={`${cfg.base}/pengumuman`}>Kembali</Btn>} />
    <div className="grid lg:grid-cols-[1fr_340px] gap-6"><Card><div className="flex gap-2 mb-4"><Badge tone="blue">{p.kategori}</Badge>{p.penting && <Badge tone="red">Penting</Badge>}</div><p className="leading-7 text-[15px]">{p.isi}</p><p className="leading-7 mt-4 text-muted">Pengumuman ini bersifat satu arah. Jika ada pertanyaan, silakan hubungi wali kelas atau guru mata pelajaran terkait.</p></Card>
      <Card><CardTitle>Pengumuman Lainnya</CardTitle></Card></div></div>
}
