import { supabase } from '@/lib/supabase';

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
