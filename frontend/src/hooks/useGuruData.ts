import { useState, useEffect } from 'react';
import { fetchPengampu, type Pengampu } from '@/services/akademik';
import { fetchTugas, fetchKuis, type Tugas, type Kuis } from '@/services/materi';
import { useApp } from '@/store';

export const useGuruData = () => {
  const { userData } = useApp();
  const [pengampu, setPengampu] = useState<Pengampu[]>([]);
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [kuis, setKuis] = useState<Kuis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;
    
    const load = async () => {
      setLoading(true);
      try {
        const p = await fetchPengampu(undefined, userData.id);
        setPengampu(p);
        
        // Fetch tugas & kuis for all pengampu
        const t = await fetchTugas();
        const k = await fetchKuis();
        
        setTugas(t.filter(item => p.some(x => x.id_pengampu === item.id_pengampu)));
        setKuis(k.filter(item => p.some(x => x.id_pengampu === item.id_pengampu)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userData?.id]);

  return { pengampu, tugas, kuis, loading };
};
