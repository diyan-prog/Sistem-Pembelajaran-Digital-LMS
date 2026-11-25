import { supabase } from '@/lib/supabase';

const BASE_URL = 'http://localhost:8080/api';

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

const request = async (path: string, options: RequestInit = {}, token?: string) => {
  const headers = await getHeaders(token);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request gagal: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

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
  request('/siswa', {}, token);

export const fetchSiswaByIdGo = async (id: string, token?: string): Promise<SiswaGo> =>
  request(`/siswa/${id}`, {}, token);

export const createSiswaGo = async (data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<{ id: string }> =>
  request('/siswa', { method: 'POST', body: JSON.stringify(data) }, token);

export const updateSiswaGo = async (id: string, data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<{ message: string }> =>
  request(`/siswa/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);

export const deleteSiswaGo = async (id: string, token?: string): Promise<{ message: string }> =>
  request(`/siswa/${id}`, { method: 'DELETE' }, token);

// ==================== GURU ====================
export interface GuruGo {
  id: string;
  nama: string;
  nip: string | null;
  email: string | null;
  status: string | null;
}

export const fetchGuruGo = async (token?: string): Promise<GuruGo[]> =>
  request('/guru', {}, token);

// ==================== MAPEL ====================
export interface MapelGo {
  id: string;
  nama: string;
  kode: string;
}

export const fetchMapelGo = async (token?: string): Promise<MapelGo[]> =>
  request('/mapel', {}, token);

// ==================== KELAS ====================
export interface KelasGo {
  id: string;
  nama: string;
}

export const fetchKelasGo = async (token?: string): Promise<KelasGo[]> =>
  request('/kelas', {}, token);

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
  const url = new URL(`${BASE_URL}/pengumuman`);
  if (role) url.searchParams.set('role', role);
  return request(url.toString(), {}, token);
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