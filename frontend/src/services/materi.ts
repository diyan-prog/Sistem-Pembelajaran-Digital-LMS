import { supabase } from '@/lib/supabase';

// ==================== TYPES ====================
export interface Pertemuan {
  id_pertemuan: string;
  id_pengampu: string;
  no_pertemuan: number;
  judul: string;
  tanggal?: string;
  created_at?: string;
}

export interface Materi {
  id_materi: string;
  id_pengampu: string;
  id_pertemuan?: string;
  judul: string;
  deskripsi?: string;
  file_materi?: string;
  link_video?: string;
  tanggal_upload?: string;
  tampil?: boolean;
}

export interface Tugas {
  id_tugas: string;
  id_pengampu: string;
  judul: string;
  deskripsi?: string;
  instruksi: string;
  file_lampiran?: string;
  deadline: string;
  batas?: string;
  maks?: number;
  created_at?: string;
}

export interface PengumpulanTugas {
  id_pengumpulan: string;
  id_tugas: string;
  id_siswa: string;
  file_jawaban?: string;
  catatan_siswa?: string;
  waktu_kumpul?: string;
  status: 'Dikumpulkan' | 'Terlambat' | 'Dinilai' | 'Belum Dikumpulkan';
  nilai?: number;
  feedback_guru?: string;
}

export interface Kuis {
  id_kuis: string;
  id_pengampu: string;
  judul: string;
  durasi_menit: number;
  durasi?: number;
  waktu_mulai: string;
  waktu_selesai: string;
  batas_waktu?: string;
  status: 'Draft' | 'Aktif' | 'Ditutup';
  created_at?: string;
}

export interface SoalKuis {
  id_soal: string;
  id_kuis: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban: string;
  poin?: number;
  urutan?: number;
}

export interface HasilKuis {
  id_hasil: string;
  id_kuis: string;
  id_siswa: string;
  nilai: number;
  waktu_mulai: string;
  waktu_selesai: string;
}

// ==================== PERTEMUAN ====================
export const fetchPertemuan = async (pengampuId: string) => {
  const { data, error } = await supabase
    .from('pertemuan')
    .select('*')
    .eq('id_pengampu', pengampuId)
    .order('no_pertemuan', { ascending: true });
  if (error) throw error;
  return data as Pertemuan[];
};

export const createPertemuan = async (p: Omit<Pertemuan, 'id_pertemuan' | 'created_at'>) => {
  const { data, error } = await supabase.from('pertemuan').insert(p).select().single();
  if (error) throw error;
  return data as Pertemuan;
};

export const updatePertemuan = async (id: string, updates: Partial<Pertemuan>) => {
  const { error } = await supabase.from('pertemuan').update(updates).eq('id_pertemuan', id);
  if (error) throw error;
};

export const deletePertemuan = async (id: string) => {
  const { error } = await supabase.from('pertemuan').delete().eq('id_pertemuan', id);
  if (error) throw error;
};

// ==================== MATERI ====================
export const fetchMateri = async (pengampuId: string) => {
  const { data, error } = await supabase
    .from('materi')
    .select('*')
    .eq('id_pengampu', pengampuId)
    .order('tanggal_upload', { ascending: false });
  if (error) throw error;
  return data as Materi[];
};

export const createMateri = async (materi: Omit<Materi, 'id_materi' | 'tanggal_upload'>) => {
  const { data, error } = await supabase.from('materi').insert(materi).select().single();
  if (error) throw error;
  return data as Materi;
};

export const updateMateri = async (id: string, updates: Partial<Materi>) => {
  const { error } = await supabase.from('materi').update(updates).eq('id_materi', id);
  if (error) throw error;
};

export const deleteMateri = async (id: string) => {
  const { error } = await supabase.from('materi').delete().eq('id_materi', id);
  if (error) throw error;
};

// ==================== TUGAS ====================
export const fetchTugas = async (pengampuId?: string) => {
  let query = supabase.from('tugas').select('*').order('deadline', { ascending: false });
  if (pengampuId) query = query.eq('id_pengampu', pengampuId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Tugas[];
};

export const fetchTugasById = async (id: string) => {
  const { data, error } = await supabase.from('tugas').select('*').eq('id_tugas', id).single();
  if (error) throw error;
  return data as Tugas;
};

export const createTugas = async (tugas: Omit<Tugas, 'id_tugas' | 'created_at'>) => {
  const { data, error } = await supabase.from('tugas').insert(tugas).select().single();
  if (error) throw error;
  return data as Tugas;
};

export const updateTugas = async (id: string, updates: Partial<Tugas>) => {
  const { error } = await supabase.from('tugas').update(updates).eq('id_tugas', id);
  if (error) throw error;
};

export const deleteTugas = async (id: string) => {
  const { error } = await supabase.from('tugas').delete().eq('id_tugas', id);
  if (error) throw error;
};

// ==================== PENGUMPULAN TUGAS ====================
export const fetchPengumpulanTugas = async (tugasId: string) => {
  const { data, error } = await supabase
    .from('pengumpulan_tugas')
    .select(`
      *,
      siswa:profiles!pengumpulan_tugas_id_siswa_fkey(full_name, nip_nis)
    `)
    .eq('id_tugas', tugasId)
    .order('waktu_kumpul', { ascending: false });
  if (error) throw error;
  return data;
};

export const submitTugas = async (tugasId: string, siswaId: string, fileJawaban: string, catatan?: string) => {
  const { error } = await supabase
    .from('pengumpulan_tugas')
    .upsert({
      id_tugas: tugasId,
      id_siswa: siswaId,
      file_jawaban: fileJawaban,
      catatan_siswa: catatan,
      waktu_kumpul: new Date().toISOString(),
      status: 'Dikumpulkan'
    }, { onConflict: 'id_tugas,id_siswa' });
  if (error) throw error;
};

export const nilaiTugas = async (id: string, nilai: number, feedback?: string) => {
  const { error } = await supabase
    .from('pengumpulan_tugas')
    .update({ nilai, feedback_guru: feedback, status: 'Dinilai' })
    .eq('id_pengumpulan', id);
  if (error) throw error;
};

// ==================== KUIS ====================
export const fetchKuis = async (pengampuId?: string) => {
  let query = supabase.from('kuis').select('*').order('waktu_mulai', { ascending: false });
  if (pengampuId) query = query.eq('id_pengampu', pengampuId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Kuis[];
};

export const fetchKuisById = async (id: string) => {
  const { data, error } = await supabase.from('kuis').select('*').eq('id_kuis', id).single();
  if (error) throw error;
  return data as Kuis;
};

export const createKuis = async (kuis: Omit<Kuis, 'id_kuis' | 'created_at'>) => {
  const { data, error } = await supabase.from('kuis').insert(kuis).select().single();
  if (error) throw error;
  return data as Kuis;
};

export const updateKuis = async (id: string, updates: Partial<Kuis>) => {
  const { error } = await supabase.from('kuis').update(updates).eq('id_kuis', id);
  if (error) throw error;
};

export const deleteKuis = async (id: string) => {
  const { error } = await supabase.from('kuis').delete().eq('id_kuis', id);
  if (error) throw error;
};

// ==================== SOAL KUIS ====================
export const fetchSoalKuis = async (kuisId: string) => {
  const { data, error } = await supabase
    .from('soal_kuis')
    .select('*')
    .eq('id_kuis', kuisId)
    .order('urutan', { ascending: true });
  if (error) throw error;
  return data as SoalKuis[];
};

export const createSoalKuis = async (soal: Omit<SoalKuis, 'id_soal'>) => {
  const { data, error } = await supabase.from('soal_kuis').insert(soal).select().single();
  if (error) throw error;
  return data as SoalKuis;
};

export const updateSoalKuis = async (id: string, updates: Partial<SoalKuis>) => {
  const { error } = await supabase.from('soal_kuis').update(updates).eq('id_soal', id);
  if (error) throw error;
};

export const deleteSoalKuis = async (id: string) => {
  const { error } = await supabase.from('soal_kuis').delete().eq('id_soal', id);
  if (error) throw error;
};

// ==================== HASIL KUIS ====================
export const fetchHasilKuis = async (kuisId: string) => {
  const { data, error } = await supabase
    .from('hasil_kuis')
    .select(`
      *,
      siswa:profiles!hasil_kuis_id_siswa_fkey(full_name, nip_nis)
    `)
    .eq('id_kuis', kuisId)
    .order('nilai', { ascending: false });
  if (error) throw error;
  return data;
};

export const submitKuis = async (hasil: Omit<HasilKuis, 'id_hasil'>) => {
  const { data, error } = await supabase.from('hasil_kuis').insert(hasil).select().single();
  if (error) throw error;
  return data as HasilKuis;
};
