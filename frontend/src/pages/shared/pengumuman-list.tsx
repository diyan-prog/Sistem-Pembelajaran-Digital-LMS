import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, Badge, Btn, Card, Chips, Empty, Input, Modal, PageHeader, SearchBar, Select, Textarea, Toggle, useCrumbs } from '@/components/ui'
import { useApp, useRole } from '@/context'
import { supabase } from '@/lib/supabase'
import { createPengumuman, fetchPengumuman, type Pengumuman } from '@/services/pengumuman'

export function PengumumanList() {
  const { role, cfg } = useRole(); 
  const { toast } = useApp(); 
  const [q, setQ] = useState(''); 
  const [cat, setCat] = useState('Semua'); 
  const [add, setAdd] = useState(false); 
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await fetchPengumuman(role || undefined);
      setItems(data);
    } catch (err: any) {
      toast(err.message || 'Gagal mengambil pengumuman', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel('public:pengumuman')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pengumuman' }, () => {
        fetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  const [f, setF] = useState({ judul: '', isi: '', kategori: 'Akademik', penting: false }); 
  const [e, setE] = useState<Record<string, string>>({});
  
  const list = items.filter((p) => (cat === 'Semua' || p.kategori === cat) && (p.judul + p.isi).toLowerCase().includes(q.toLowerCase()));
  
  const save = async () => { 
    const x: Record<string, string> = {}; 
    if (!f.judul.trim()) x.judul = 'Judul wajib diisi'; 
    if (f.isi.trim().length < 10) x.isi = 'Isi pengumuman minimal 10 karakter'; 
    setE(x); 
    if (Object.keys(x).length) return; 

    try {
      await createPengumuman({
        judul: f.judul,
        isi: f.isi,
        kategori: f.kategori,
        penting: f.penting,
        dibuat_oleh: cfg.nama,
        target_role: undefined
      });
      setAdd(false); 
      setF({ judul: '', isi: '', kategori: 'Akademik', penting: false }); 
      toast('Pengumuman berhasil dipublikasikan');
      fetch();
    } catch (err: any) {
      toast(err.message || 'Gagal mengirim pengumuman', 'err');
    }
  };

  return (
    <div>
      <PageHeader crumbs={useCrumbs({ l: 'Pengumuman' })} title="Pengumuman" subtitle="Informasi resmi sekolah dan kelas. Pengumuman bersifat satu arah." actions={(role === 'guru' || role === 'tu') && <Btn icon={<Plus size={18} />} onClick={() => setAdd(true)}>Buat Pengumuman</Btn>} />
      <div className="flex flex-wrap gap-3 mb-5 items-center"><SearchBar value={q} onChange={setQ} placeholder="Cari pengumuman" className="w-80 max-w-full" /><Chips value={cat} onChange={setCat} options={['Semua', 'Akademik', 'Kegiatan', 'Sistem', 'Lomba', 'Tata Tertib'].map((k) => ({ k, l: k }))} /></div>
      
      {loading ? <div className="p-10 text-center text-muted">Memuat pengumuman...</div> : list.length === 0 ? <Card><Empty title="Pengumuman tidak ditemukan" /></Card> : <div className="grid md:grid-cols-2 gap-5">{list.map((p) => (
        <Link key={p.id} to={`${cfg.base}/pengumuman/${p.id}`}><Card hover className="h-full"><div className="flex items-center gap-2 mb-2"><Badge tone="blue">{p.kategori}</Badge>{p.penting && <Badge tone="red">Penting</Badge>}<span className="ml-auto text-xs text-muted">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span></div><h3 className="font-bold text-lg leading-snug">{p.judul}</h3><p className="text-sm text-muted mt-2 line-clamp-2">{p.isi}</p><div className="flex items-center gap-2 mt-4 text-sm"><Avatar name={p.dibuat_oleh || 'Admin'} size={28} /><span className="text-muted">{p.dibuat_oleh || 'Admin'}</span></div></Card></Link>))}</div>}
      
      <Modal open={add} onClose={() => setAdd(false)} title="Buat Pengumuman" footer={<><Btn variant="outline" onClick={() => setAdd(false)}>Batal</Btn><Btn onClick={save}>Publikasikan</Btn></>}>
        <div className="space-y-4">
          <Input label="Judul" value={f.judul} onChange={(x) => setF({ ...f, judul: x.target.value })} error={e.judul} />
          <Select label="Kategori" value={f.kategori} options={['Akademik', 'Kegiatan', 'Sistem', 'Lomba', 'Tata Tertib']} onChange={(x) => setF({ ...f, kategori: x.target.value })} />
          <div className="flex items-center gap-2">
            <Toggle label="Tandai Penting" on={f.penting} onChange={(v) => setF({ ...f, penting: v })} />
            <span className="text-sm font-medium">Tandai sebagai Penting</span>
          </div>
          <Textarea label="Isi Pengumuman" value={f.isi} onChange={(x) => setF({ ...f, isi: x.target.value })} error={e.isi} />
        </div>
      </Modal>
    </div>
  )
}
