/**
 * Layanan Data Akademik
 * Mengelola: users, classes, subjects, pengampu, siswa_kelas, jurusan
 *
 * CRUD & read sederhana sudah lewat backend Go (/api/v1/admin/*).
 * Fungsi join kompleks (fetchPengampu, fetchSiswaKelas, getSiswaByKelas,
 * createSiswa, createGuru, fetchSiswaPerJurusan) masih memakai Supabase
 * karena butuh endpoint agregasi backend yang belum tersedia.
 */
import { supabase } from '@/lib/supabase';
import { adminList, adminCreate, adminUpdate, adminDelete, adminGet, fetchSiswaGo } from './api-go';
import type { Slot } from '@/mocks';

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
  tingkat?: number | null;
  jurusan_id?: string | null;
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
  const rows = await adminGet<any[]>(`profiles${role ? `?role=${encodeURIComponent(role)}` : ''}`);
  const users = (rows || []).map((r) => ({
    id: r.id,
    email: r.email,
    full_name: r.nama_lengkap ?? r.full_name ?? '',
    role: r.role,
    status: r.status,
    nip_nis: r.nip_nis,
    avatar_url: r.foto_profil ?? r.avatar_url,
    created_at: r.created_at,
  })) as User[];
  return users.sort((a, b) => a.full_name.localeCompare(b.full_name));
};

export const fetchUserById = async (id: string) => {
  const rows = await adminGet<any[]>('profiles');
  const r = (rows || []).find((x) => x.id === id);
  if (!r) throw new Error('User tidak ditemukan');
  return {
    id: r.id,
    email: r.email,
    full_name: r.nama_lengkap ?? r.full_name ?? '',
    role: r.role,
    status: r.status,
    nip_nis: r.nip_nis,
    avatar_url: r.foto_profil ?? r.avatar_url,
    created_at: r.created_at,
  } as User;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const payload: Record<string, unknown> = {};
  if (updates.full_name !== undefined) {
    payload.nama_lengkap = updates.full_name;
    payload.full_name = updates.full_name;
  }
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.nip_nis !== undefined) payload.nip_nis = updates.nip_nis;
  await adminUpdate('profiles', id, payload);
};

export const updateUserRole = async (id: string, role: string) => {
  await updateUser(id, { role });
};

export const logActivity = async (user_id: string, aksi: string, modul?: string, entitas?: string, entitas_id?: string, detail?: Record<string, unknown>, ip_address?: string) => {
  await adminCreate('log', {
    user_id, aksi, modul, entitas, entitas_id,
    detail: detail ? JSON.stringify(detail) : '{}',
    ip_address: ip_address || null,
  });
};

// ==================== KELAS ====================
export const fetchKelas = async (tingkat?: number) => {
  const rows = await adminList<Kelas>('classes');
  const list = (rows || []).filter((k) => !tingkat || k.grade === tingkat);
  return list.sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchKelasById = async (id: string) => {
  const rows = await adminList<Kelas>('classes');
  const k = (rows || []).find((x) => x.id === id);
  if (!k) throw new Error('Kelas tidak ditemukan');
  return k;
};

export const createKelas = async (kelas: Omit<Kelas, 'id' | 'created_at'>) =>
  adminCreate<Kelas>('classes', kelas);

export const updateKelas = async (id: string, updates: Partial<Kelas>) =>
  adminUpdate('classes', id, updates);

export const deleteKelas = async (id: string) =>
  adminDelete('classes', id);

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
  const rows = await adminList<Subject>('mapel');
  const list = (rows || []).filter((m) => !category || m.category === category);
  return list.sort((a, b) => a.name.localeCompare(b.name));
};

export const fetchMapelById = async (id: string) => {
  const rows = await adminList<Subject>('mapel');
  const m = (rows || []).find((x) => x.id === id);
  if (!m) throw new Error('Mapel tidak ditemukan');
  return m;
};

export const createMapel = async (mapel: Omit<Subject, 'id' | 'created_at'>) =>
  adminCreate<Subject>('mapel', mapel);

export const updateMapel = async (id: string, updates: Partial<Subject>) =>
  adminUpdate('mapel', id, updates);

export const deleteMapel = async (id: string) =>
  adminDelete('mapel', id);

// ==================== PENGAMPU (PENUGASAN GURU) ====================
// TODO: butuh endpoint agregasi (join guru/mapel/kelas). Sementara tetap Supabase.
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

export const createPengampu = async (pengampu: Omit<Pengampu, 'id_pengampu' | 'created_at'>) =>
  adminCreate<Pengampu>('pengampu', pengampu);

export const updatePengampu = async (id: string, updates: Partial<Pengampu>) =>
  adminUpdate('pengampu', id, updates);

export const deletePengampu = async (id: string) =>
  adminDelete('pengampu', id);

// ==================== SISWA KELAS ====================
// TODO: butuh endpoint agregasi. Sementara tetap Supabase.
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
  const rows = await adminList<any>('jurusan');
  return (rows || []).sort((a, b) => (a.kode || '').localeCompare(b.kode || ''));
};

export const createJurusan = async (jurusan: any) =>
  adminCreate('jurusan', jurusan);

export const updateJurusan = async (id: string, updates: any) =>
  adminUpdate('jurusan', id, updates);

export const deleteJurusan = async (id: string) =>
  adminDelete('jurusan', id);

// TODO: create siswa/guru butuh alur pembuatan profile + siswa/guru atomik.
// Sementara tetap Supabase sampai endpoint backend tersedia.
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

export const deleteUser = async (id: string) =>
  adminDelete('profiles', id);

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
  const d = await adminGet<any>('dashboard').catch(() => null);
  return {
    siswa: d?.total_siswa ?? 0,
    guru: d?.total_guru ?? 0,
    kelas: d?.total_classes ?? 0,
    mapel: d?.total_subjects ?? 0,
  };
};

export const fetchSiswaPerJurusan = async () => {
  const [jurusan, kelas, siswa] = await Promise.all([
    adminList<any>('jurusan'),
    adminList<any>('classes'),
    fetchSiswaGo(),
  ]);
  const kelasById = new Map(kelas.map((k) => [k.id, k]));
  return jurusan.map((j) => ({
    n: j.kode,
    v: siswa.filter((s) => kelasById.get(s.kelas_id || '')?.jurusan_id === j.id).length,
  }));
};