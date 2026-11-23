import { useEffect, useState } from 'react'
import { useApp } from '@/context'
import { fetchKelas, fetchSiswaKelas } from '@/services/akademik'
import type { Siswa } from '@/mocks'

export const KID = 'k2'
export const statusOf = (s: Siswa) => (s.risiko ? 'Berisiko' : s.hadir < 80 || s.rata < 75 ? 'Waspada' : 'Aman')

export const useWaliData = () => {
  const { userData } = useApp();
  const [siswa, setSiswa] = useState<any[]>([]);
  const [kelasInfo, setKelasInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const kelasList = await fetchKelas();
        const myKelas = kelasList.find((k: any) => k.wali_kelas_id === userData.id);
        if (myKelas) {
          setKelasInfo(myKelas);
          const siswaList = await fetchSiswaKelas(myKelas.id);
          setSiswa(siswaList.map((s: any) => ({ id: s.user.id, nama: s.user.full_name, nis: s.user.nip_nis, kelasId: s.id_kelas, email: s.user.email, hadir: 95, rata: 85, belum: Math.floor(Math.random() * 5), risiko: Math.random() > 0.8 })));
        }
      } catch (e) {
        console.error('Failed to fetch wali data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userData?.id]);
  return { siswa, kelasInfo, loading };
};
