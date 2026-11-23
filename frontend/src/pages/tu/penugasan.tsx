import { useEffect, useState } from 'react'
import { DataTable, PageHeader, Select, useCrumbs } from '@/components/ui'
import { useApp } from '@/context'
import { fetchKelas, fetchPengampu, fetchUsers, updatePengampu } from '@/services/akademik'

export function PenugasanGuru() {
  const { toast } = useApp();
  const [offerings, setOfferings] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [kl, setKl] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, t, k] = await Promise.all([fetchPengampu(), fetchUsers('guru'), fetchKelas()]);
      setOfferings(p);
      setTeachers(t);
      setClassList(k);
    } catch (err: any) {
      toast(err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateAsg = async (id: string, guruId: string) => {
    try {
      await updatePengampu(id, { id_guru: guruId });
      setOfferings(offerings.map(o => o.id_pengampu === id ? { ...o, id_guru: guruId } : o));
      toast('Penugasan guru diperbarui');
    } catch (err: any) {
      toast(err.message, 'err');
    }
  };

  const rows = offerings.filter((o) => kl === 'Semua' || o.kelas?.name === kl);

  return (
    <div><PageHeader crumbs={useCrumbs({ l: 'Penugasan Guru' })} title="Penugasan Guru" subtitle="Tetapkan guru pengampu untuk setiap mata pelajaran dan kelas" />
      <DataTable rows={rows} pageSize={10} loading={loading} searchText={(o) => (o.mapel?.name || '') + (o.kelas?.name || '')} searchPlaceholder="Cari mata pelajaran atau kelas"
        filters={<Select aria-label="Kelas" value={kl} onChange={(e) => setKl(e.target.value)} options={['Semua', ...classList.map((k) => k.name)]} className="!w-40 !h-11" />}
        cols={[{ key: 'm', header: 'Mata Pelajaran', render: (o: any) => <b>{o.mapel?.name}</b> }, { key: 'k', header: 'Kelas', render: (o: any) => o.kelas?.name }, { key: 'g', header: 'Guru Pengampu', render: (o: any) => <select aria-label="Guru pengampu" value={o.id_guru} onChange={(e) => updateAsg(o.id_pengampu, e.target.value)} className="h-10 rounded-xl border border-line px-3 text-sm bg-white">{teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select> }]} />
    </div>
  )
}
