import { supabase } from '@/lib/supabase';

const BASE_URL = 'http://localhost:8080/api/v1';

const getHeaders = async (token?: string) => {
  let authToken = token;
  if (!authToken) {
    const { data: { session } } = await supabase.auth.getSession();
    authToken = session?.access_token || '';
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
};

// request membungkus respons standar {success,data,error,meta} dan mengembalikan data.
const request = async (path: string, options: RequestInit = {}, token?: string) => {
  const headers = await getHeaders(token);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.error || `Request gagal: ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return body?.data ?? body;
};

// ==================== HELPER CRUD ADMIN ====================
// Semua resource admin berada di /admin/{resource} dan butuh role admin/tu/kepsek.
export const adminList = async <T = any>(resource: string, query = '', token?: string): Promise<T[]> =>
  request(`/admin/${resource}${query}`, {}, token);

export const adminCreate = async <T = any>(resource: string, data: unknown, token?: string): Promise<T> =>
  request(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(data) }, token);

export const adminUpdate = async <T = any>(resource: string, id: string, data: unknown, token?: string): Promise<T> =>
  request(`/admin/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);

export const adminDelete = async <T = any>(resource: string, id: string, token?: string): Promise<T> =>
  request(`/admin/${resource}/${id}`, { method: 'DELETE' }, token);

// ==================== SISWA ====================
export interface SiswaGo {
  id: string;
  nama: string;
  nis: string;
  email: string;
  status: string;
  kelas_id: string | null;
  kelas: string | null;
}

export const fetchSiswaGo = async (token?: string): Promise<SiswaGo[]> =>
  adminList<SiswaGo>('siswa', undefined, token);

export const fetchSiswaByIdGo = async (id: string, token?: string): Promise<SiswaGo | null> => {
  const list = await fetchSiswaGo(token);
  return list.find((s) => s.id === id) ?? null;
};

export const createSiswaGo = async (data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<{ id: string }> =>
  adminCreate('siswa', data, token);

export const updateSiswaGo = async (id: string, data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<{ message: string }> =>
  adminUpdate('siswa', id, data, token);

export const deleteSiswaGo = async (id: string, token?: string): Promise<{ message: string }> =>
  adminDelete('siswa', id, token);

// ==================== GURU ====================
export interface GuruGo {
  id: string;
  nama: string;
  nip: string | null;
  email: string | null;
  status: string | null;
}

export const fetchGuruGo = async (token?: string): Promise<GuruGo[]> =>
  adminList<GuruGo>('guru', undefined, token);

// ==================== MAPEL ====================
export interface MapelGo {
  id: string;
  nama: string;
  kode: string;
}

export const fetchMapelGo = async (token?: string): Promise<MapelGo[]> =>
  adminList<MapelGo>('mapel', undefined, token);

// ==================== KELAS ====================
export interface KelasGo {
  id: string;
  nama: string;
}

export const fetchKelasGo = async (token?: string): Promise<KelasGo[]> =>
  adminList<KelasGo>('classes', undefined, token);

// ==================== PENGUMUMAN ====================
export interface PengumumanGo {
  id: string;
  judul: string;
  isi: string;
  kategori: string | null;
  penting: boolean;
  dibuat_oleh: string | null;
  dibuat_oleh_nama: string | null;
  target_role: string | null;
  created_at: string;
}

export const fetchPengumumanGo = async (role?: string, token?: string): Promise<PengumumanGo[]> => {
  const list = await adminList<PengumumanGo>('pengumuman', undefined, token);
  if (!role) return list;
  return list.filter((p) => !p.target_role || p.target_role === role);
};

// ==================== SISWA KELAS (pengampu per siswa) ====================
export interface SiswaPengampuGo {
  id_pengampu: string;
  mapel_name: string;
  mapel_code: string;
  guru_name: string | null;
  kelas_name: string;
  tahun_ajaran: string | null;
}

export const fetchSiswaPengampuGo = async (id: string, token?: string): Promise<SiswaPengampuGo[]> =>
  request(`/siswa/${id}/pengampu`, {}, token);