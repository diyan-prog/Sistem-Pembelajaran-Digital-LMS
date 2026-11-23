import { supabase } from '@/lib/supabase';

// ==================== TYPES ====================
export interface Presensi {
  id_presensi: string;
  id_pengampu: string;
  id_siswa: string;
  tanggal: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  dicatat_oleh?: string;
  created_at?: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  kategori?: string;
  penting: boolean;
  dibuat_oleh?: string;
  target_role?: string;
  target_kelas_id?: string;
  created_at?: string;
}

export interface Notifikasi {
  id: string;
  user_id: string;
  judul: string;
  isi?: string;
  jenis?: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
}

// ==================== PRESENSI ====================
export const fetchPresensi = async (pengampuId: string) => {
  const { data, error } = await supabase
    .from('presensi')
    .select(`
      *,
      siswa:profiles!presensi_id_siswa_fkey(full_name, nip_nis)
    `)
    .eq('id_pengampu', pengampuId)
    .order('tanggal', { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchPresensiSiswa = async (pengampuId: string, siswaId: string) => {
  const { data, error } = await supabase
    .from('presensi')
    .select('*')
    .eq('id_pengampu', pengampuId)
    .eq('id_siswa', siswaId)
    .order('tanggal', { ascending: false });
  if (error) throw error;
  return data as Presensi[];
};

export const createPresensi = async (data: Omit<Presensi, 'id_presensi' | 'created_at'>) => {
  const { data: result, error } = await supabase.from('presensi').insert(data).select().single();
  if (error) throw error;
  return result as Presensi;
};

export const savePresensi = async (entries: Array<{ id_pengampu: string; id_siswa: string; tanggal: string; status: string; dicatat_oleh: string }>) => {
  const { error } = await supabase
    .from('presensi')
    .upsert(entries, { onConflict: 'id_pengampu,id_siswa,tanggal' });
  if (error) throw error;
};

export const deletePresensi = async (id: string) => {
  const { error } = await supabase.from('presensi').delete().eq('id_presensi', id);
  if (error) throw error;
};

// ==================== REKAP ====================
export const fetchRekapKehadiran = async (kelasId?: string) => {
  let query = supabase.from('v_rekap_kehadiran').select('*');
  if (kelasId) {
    query = supabase.from('v_rekap_kehadiran').select(`
      *,
      pengampu:pengampu!inner(id_kelas)
    `).eq('pengampu.id_kelas', kelasId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const fetchRekapNilai = async (pengampuId?: string) => {
  let query = supabase.from('v_rekap_nilai').select('*');
  if (pengampuId) query = query.eq('id_pengampu', pengampuId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ==================== PENGUMUMAN ====================
export const fetchPengumuman = async (role?: string) => {
  let query = supabase.from('pengumuman').select('*').order('created_at', { ascending: false });
  if (role) {
    query = query.or(`target_role.eq.${role},target_role.is.null`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Pengumuman[];
};

export const createPengumuman = async (pengumuman: Omit<Pengumuman, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('pengumuman').insert(pengumuman).select().single();
  if (error) throw error;
  return data as Pengumuman;
};

export const updatePengumuman = async (id: string, updates: Partial<Pengumuman>) => {
  const { error } = await supabase.from('pengumuman').update(updates).eq('id', id);
  if (error) throw error;
};

export const deletePengumuman = async (id: string) => {
  const { error } = await supabase.from('pengumuman').delete().eq('id', id);
  if (error) throw error;
};

// ==================== NOTIFIKASI ====================
export const fetchNotifikasi = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Notifikasi[];
};

export const markNotifikasiRead = async (id: string) => {
  const { error } = await supabase.from('notifikasi').update({ is_read: true }).eq('id', id);
  if (error) throw error;
};

export const markAllNotifikasiRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifikasi')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
};

export const createNotifikasi = async (notif: Omit<Notifikasi, 'id' | 'created_at' | 'is_read'>) => {
  const { error } = await supabase.from('notifikasi').insert({ ...notif, is_read: false });
  if (error) throw error;
};

// ==================== ACTIVITY LOG ====================
export const fetchActivityLog = async (limit = 100) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      user:profiles!activity_log_user_id_fkey(full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// ==================== PENGATURAN ====================
export const fetchPengaturan = async () => {
  const { data, error } = await supabase.from('pengaturan').select('*');
  if (error) throw error;
  const map: Record<string, unknown> = {};
  data?.forEach((row) => { map[row.key] = row.value; });
  return map;
};

export const savePengaturan = async (key: string, value: unknown) => {
  const { error } = await supabase
    .from('pengaturan')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
};

// ==================== TAHUN AJARAN ====================
export const fetchTahunAjaran = async () => {
  const { data, error } = await supabase
    .from('tahun_ajaran')
    .select('*')
    .order('nama', { ascending: false });
  if (error) throw error;
  return data;
};

export const createTahunAjaran = async (ta: { nama: string; semester: string; is_active?: boolean }) => {
  const { data, error } = await supabase.from('tahun_ajaran').insert(ta).select().single();
  if (error) throw error;
  return data;
};

export const setTahunAjaranAktif = async (id: string) => {
  const { error: e1 } = await supabase.from('tahun_ajaran').update({ is_active: false }).neq('id', id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('tahun_ajaran').update({ is_active: true }).eq('id', id);
  if (e2) throw e2;
};
