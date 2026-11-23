/**
 * Layanan Data Akademik
 * Mengelola: users, classes, subjects, pengampu, siswa_kelas, jurusan
 */
import { supabase } from '@/store';
import type { Slot } from '@/data';

// ==================== TYPES ====================
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status?: string;
  nip_nis?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Kelas {
  id: string;
  name: string;
  grade: number;
  major: string;
  academic_year: string;
  wali_kelas_id?: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
  grade: number;
  teacher_id?: string;
  created_at?: string;
}

export interface Pengampu {
  id_pengampu: string;
  id_guru: string;
  id_mapel: string;
  id_kelas: string;
  tahun_ajaran: string;
  created_at?: string;
}

export interface SiswaKelas {
  id_siswa: string;
  id_kelas: string;
  tahun_ajaran: string;
  created_at?: string;
}

// ==================== USERS ====================
export const fetchUsers = async (role?: string) => {
  let query = supabase.from('profiles').select('*');
  if (role) query = query.eq('role', role);
  const { data, error } = await query.order('full_name', { ascending: true });
  if (error) {
    console.error('FetchUsers Error:', error);
    throw error;
  }
  console.log('FetchUsers Data:', data);
  return data as User[];
};

export const fetchUserById = async (id: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data as User;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
};

export const updateUserRole = async (id: string, role: string) => {
  await updateUser(id, { role });
};

export const logActivity = async (user_id: string, aksi: string, modul?: string, entitas?: string, entitas_id?: string, detail?: Record<string, unknown>, ip_address?: string) => {
  const { error } = await supabase.from('activity_log').insert({
    user_id,
    aksi,
    modul,
    entitas,
    entitas_id,
    detail,
    ip_address
  });
  if (error) throw error;
};

// ==================== KELAS ====================
export const fetchKelas = async (tingkat?: number) => {
  let query = supabase.from('classes').select('*');
  if (tingkat) query = query.eq('grade', tingkat);
  const { data, error } = await query.order('name', { ascending: true });
  if (error) throw error;
  return data as Kelas[];
};

export const fetchKelasById = async (id: string) => {
  const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Kelas;
};

export const createKelas = async (kelas: Omit<Kelas, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('classes').insert(kelas).select().single();
  if (error) throw error;
  return data as Kelas;
};

export const updateKelas = async (id: string, updates: Partial<Kelas>) => {
  const { error } = await supabase.from('classes').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteKelas = async (id: string) => {
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
};

// Mapping helper for offerings shape (shared with guruOfferings)
export const fromPengampu = (p: Pengampu & { guru?: User; mapel?: Subject; kelas?: Kelas }): {
  id: string; kelasId: string; subjectId: string; kode: string; guru: string; co: string[]; jadwal: Slot[]; done: number; total: number; hadir: number; rata: number; semester: string; arsip: boolean
} => ({
  id: p.id_pengampu,
  kelasId: p.id_kelas,
  subjectId: p.id_mapel,
  kode: p.kelas?.name || '',
  guru: p.id_guru,
  co: [],
  jadwal: [],
  done: 0,
  total: 32,
  hadir: 0,
  rata: 0,
  semester: p.tahun_ajaran || '2026/2027',
  arsip: false,
});

export const guruOfferings = async (guruId: string) => {
  const p = await fetchPengampu(undefined, guruId);
  return p.map(fromPengampu);
};


// ==================== SUBJECTS (MATA PELAJARAN) ====================
export const fetchMapel = async (category?: string) => {
  let query = supabase.from('subjects').select('*');
  if (category) query = query.eq('category', category);
  const { data, error } = await query.order('name', { ascending: true });
  if (error) throw error;
  return data as Subject[];
};

export const fetchMapelById = async (id: string) => {
  const { data, error } = await supabase.from('subjects').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Subject;
};

export const createMapel = async (mapel: Omit<Subject, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('subjects').insert(mapel).select().single();
  if (error) throw error;
  return data as Subject;
};

export const updateMapel = async (id: string, updates: Partial<Subject>) => {
  const { error } = await supabase.from('subjects').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteMapel = async (id: string) => {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
};

// ==================== PENGAMPU (PENUGASAN GURU) ====================
export const fetchPengampu = async (kelasId?: string, guruId?: string) => {
  let query = supabase
    .from('pengampu')
    .select(`
      *,
      guru:profiles!pengampu_id_guru_fkey(full_name, role),
      mapel:subjects!pengampu_id_mapel_fkey(name, code),
      kelas:classes!pengampu_id_kelas_fkey(name, grade, major)
    `);
  if (kelasId) query = query.eq('id_kelas', kelasId);
  if (guruId) query = query.eq('id_guru', guruId);
  const { data, error } = await query;
  if (error) throw error;
  return data as (Pengampu & { guru?: User; mapel?: Subject; kelas?: Kelas })[];
};

export const createPengampu = async (pengampu: Omit<Pengampu, 'id_pengampu' | 'created_at'>) => {
  const { data, error } = await supabase.from('pengampu').insert(pengampu).select().single();
  if (error) throw error;
  return data as Pengampu;
};

export const updatePengampu = async (id: string, updates: Partial<Pengampu>) => {
  const { error } = await supabase.from('pengampu').update(updates).eq('id_pengampu', id);
  if (error) throw error;
};

export const deletePengampu = async (id: string) => {
  const { error } = await supabase.from('pengampu').delete().eq('id_pengampu', id);
  if (error) throw error;
};

// ==================== SISWA KELAS ====================
export const fetchSiswaKelas = async (kelasId?: string) => {
  let query = supabase
    .from('siswa_kelas')
    .select(`
      *,
      user:profiles!siswa_kelas_id_siswa_fkey(full_name, email, role, status),
      kelas:classes!siswa_kelas_id_kelas_fkey(name, grade, major)
    `);
  if (kelasId) query = query.eq('id_kelas', kelasId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getSiswaByKelas = async (kelasId: string) => {
  const { data, error } = await supabase
    .from('siswa_kelas')
    .select(`
      *,
      user:profiles!siswa_kelas_id_siswa_fkey(full_name, email, role, status, nip_nis)
    `)
    .eq('id_kelas', kelasId)
    .order('user->>full_name', { ascending: true });
  if (error) throw error;
  return data;
};

// ==================== JURUSAN (dari classes.major) ====================
export const fetchJurusan = async () => {
  const { data, error } = await supabase.from('jurusan').select('*').order('kode');
  if (error) throw error;
  return data;
};

export const createJurusan = async (jurusan: any) => {
  const { data, error } = await supabase.from('jurusan').insert(jurusan).select().single();
  if (error) throw error;
  return data;
};

export const updateJurusan = async (id: string, updates: any) => {
  const { error } = await supabase.from('jurusan').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteJurusan = async (id: string) => {
  const { error } = await supabase.from('jurusan').delete().eq('id', id);
  if (error) throw error;
};

export const createSiswa = async (siswa: any) => {
  const { data: user, error: e1 } = await supabase.from('profiles').insert({
    full_name: siswa.nama,
    email: siswa.email,
    role: 'siswa',
    status: siswa.status || 'Aktif',
    nip_nis: siswa.nis
  }).select().single();
  if (e1) throw e1;

  const { error: e2 } = await supabase.from('siswa_kelas').insert({
    id_siswa: user.id,
    id_kelas: siswa.kelasId,
    tahun_ajaran: siswa.tahun_ajaran || '2026/2027'
  });
  if (e2) throw e2;

  return { ...siswa, id: user.id };
};

export const updateSiswa = async (id: string, siswa: any) => {
  const { error: e1 } = await supabase.from('profiles').update({
    full_name: siswa.nama,
    email: siswa.email,
    status: siswa.status,
    nip_nis: siswa.nis
  }).eq('id', id);
  if (e1) throw e1;

  const { error: e2 } = await supabase.from('siswa_kelas').update({
    id_kelas: siswa.kelasId
  }).eq('id_siswa', id);
  if (e2) throw e2;
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
};

export const createGuru = async (guru: any) => {
  const { data, error } = await supabase.from('profiles').insert({
    full_name: guru.nama,
    email: guru.email,
    role: 'guru',
    status: guru.status || 'Aktif',
    nip_nis: guru.nip
  }).select().single();
  if (error) throw error;
  return { ...guru, id: data.id };
};

export const updateGuru = async (id: string, guru: any) => {
  const { error } = await supabase.from('profiles').update({
    full_name: guru.nama,
    email: guru.email,
    status: guru.status,
    nip_nis: guru.nip
  }).eq('id', id);
  if (error) throw error;
};

// Mapping helper for offerings shape
export const fromPengampuToOffering = (p: Pengampu & { guru?: User; mapel?: Subject; kelas?: Kelas }): any => ({
  id: p.id_pengampu,
  kelasId: p.id_kelas,
  subjectId: p.id_mapel,
  kode: p.kelas?.name || '',
  guru: p.id_guru,
  co: [] as string[],
  jadwal: [] as any[],
  done: 0,
  total: 32,
  hadir: 0,
  rata: 0,
  semester: p.tahun_ajaran || '2026/2027',
  arsip: false,
});

export const fetchStats = async () => {
  const [siswa, guru, kelas, mapel] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'siswa'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'guru'),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true })
  ]);
  return {
    siswa: siswa.count || 0,
    guru: guru.count || 0,
    kelas: kelas.count || 0,
    mapel: mapel.count || 0
  };
};

export const fetchSiswaPerJurusan = async () => {
  const { data, error } = await supabase.rpc('get_siswa_per_jurusan');
  if (error) {
    // Fallback if RPC not exists yet
    const { data: jurusans } = await supabase.from('jurusan').select('kode, nama');
    const { data: siswas } = await supabase.from('siswa_kelas').select('id_kelas, kelas:classes(jurusan_id)');
    return (jurusans || []).map(j => ({
      n: j.kode,
      v: (siswas || []).filter((s: any) => s.kelas?.jurusan_id === (j as { id?: string }).id).length
    }));
  }
  return data;
};
