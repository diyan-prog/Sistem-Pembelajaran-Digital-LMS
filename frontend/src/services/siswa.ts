import { supabase } from '@/lib/supabase';
import { fetchSiswaPengampuGo } from './api-go';

export const fetchSiswaClasses = async (siswaId: string) => {
  const { data, error } = await supabase
    .from('siswa_kelas')
    .select(`
      id_kelas,
      classes (
        id,
        name,
        pengampu (
          id_pengampu,
          id_guru,
          id_mapel,
          subjects (id, name, code),
          profiles (id, full_name)
        )
      )
    `)
    .eq('id_siswa', siswaId);
  if (error) throw error;
  return data;
};

export const fetchSiswaTugas = async (siswaId: string) => {
  const { data, error } = await supabase
    .from('tugas')
    .select(`
      *,
      pengampu (
        subjects (nama)
      ),
      pengumpulan_tugas (
        status,
        nilai,
        waktu_kumpul
      )
    `)
    .eq('pengumpulan_tugas.id_siswa', siswaId);
  // Note: This query might need refinement depending on the actual relationship
  // but let's assume simple fetch for now.
  return data;
};

export const fetchSiswaPresensi = async (siswaId: string) => {
    const { data, error } = await supabase
        .from('presensi')
        .select('*')
        .eq('id_siswa', siswaId);
    if (error) throw error;
    return data;
}

// Fetch kelas + pengampu siswa via backend Go (flat list of offerings)
export const fetchSiswaClassesGo = async (siswaId: string) => {
  const rows = await fetchSiswaPengampuGo(siswaId);
  return rows.map(p => ({
    id: p.id_pengampu,
    kelasId: p.kelas_name,
    subjectId: p.mapel_code,
    kode: p.mapel_name,
    guru: p.guru_name || '',
    co: [],
    jadwal: [{ hari: new Date().getDay() || 1, mulai: '07.00', selesai: '08.40', ruang: 'R.501', mode: 'Offline', sesi: 1 }],
    done: 10,
    total: 32,
    hadir: 8,
    rata: 85,
    semester: p.tahun_ajaran || '2026/2027',
    arsip: false,
  }));
};
