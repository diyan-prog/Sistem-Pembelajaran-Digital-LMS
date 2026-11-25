import { supabase } from '@/lib/supabase';

const BASE_URL = 'http://localhost:8080/api/v1';

export const DEFAULT_PASSWORD = (import.meta as any).env?.VITE_DEFAULT_PASSWORD ?? '';

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
const request = async <T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
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
  if (res.status === 204) return null as T;
  return (body?.data ?? body) as T;
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

// adminGet mengambil satu endpoint admin (mis. dashboard) dan mengembalikan data.
export const adminGet = async <T = any>(path: string, token?: string): Promise<T> =>
  request(`/admin/${path}`, {}, token);

// userAction memanggil endpoint aksi pengguna (menggantikan Edge Function admin-users).
export type UserAction =
  | { action: 'create'; email: string; password: string; email_confirm?: boolean; user_metadata?: Record<string, unknown>; profile_kind?: 'siswa' | 'guru'; nis?: string; nip?: string; kelas_id?: string; jenis_kelamin?: string; status?: string }
  | { action: 'update-role' | 'update-status'; id: string; role?: string; status?: string }
  | { action: 'reset-password' | 'delete'; id: string; password?: string };

export const userAction = async <T = any>(payload: UserAction, token?: string): Promise<T> =>
  request('/admin/users', { method: 'POST', body: JSON.stringify(payload) }, token);

// ==================== PROFIL ====================
export interface ProfilGo {
  id: string;
  full_name: string;
  email: string;
  role: string | null;
  status: string;
  nip_nis: string | null;
  foto_profil: string | null;
  created_at: string;
}

export const fetchProfilesGo = async (role?: string, token?: string): Promise<ProfilGo[]> =>
  adminGet<ProfilGo[]>(`profiles${role ? `?role=${encodeURIComponent(role)}` : ''}`, token);

export interface MeGo extends ProfilGo {
  avatar_url: string | null;
  hp: string | null;
  alamat: string | null;
  preferensi: Record<string, unknown> | null;
}

export const getMeGo = async (token?: string): Promise<MeGo> => request<MeGo>('/me', {}, token);

export const updateMeGo = async (data: Partial<{
  full_name: string;
  hp: string;
  alamat: string;
  foto_profil: string;
  preferensi: Record<string, unknown>;
}>, token?: string): Promise<MeGo> =>
  request<MeGo>('/me', { method: 'PUT', body: JSON.stringify(data) }, token);

// ==================== SISWA ====================
export interface SiswaGo {
  id: string;
  profile_id: string;
  nama: string;
  nis: string;
  email: string;
  status: string;
  kelas_id: string | null;
}

export const fetchSiswaGo = async (token?: string): Promise<SiswaGo[]> =>
  adminList<SiswaGo>('siswa', undefined, token);

export const fetchSiswaByIdGo = async (id: string, token?: string): Promise<SiswaGo | null> => {
  const list = await fetchSiswaGo(token);
  return list.find((s) => s.id === id) ?? null;
};

export const createSiswaGo = async (data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<{ id: string }> => {
  const result = await userAction<{ user?: { id?: string } }>({
    action: 'create',
    email: data.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { nama_lengkap: data.nama, role: 'siswa' },
    profile_kind: 'siswa',
    nis: data.nis,
    kelas_id: data.kelas_id,
    status: normalizeStatus(data.status),
  }, token);
  const id = result?.user?.id;
  if (!id) throw new Error('Gagal membuat user siswa');
  return { id };
};

export const updateSiswaGo = async (id: string, data: {
  nama: string; nis: string; email: string; kelas_id: string; status?: string;
}, token?: string): Promise<void> => {
  await request(`/admin/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      full_name: data.nama, email: data.email,
      status: normalizeStatus(data.status),
    }),
  }, token);
  const rows = await fetchSiswaGo(token);
  const row = rows.find((s) => s.profile_id === id || s.id === id);
  if (row) {
    await adminUpdate('siswa', row.id, {
      nis: data.nis,
      kelas_id: data.kelas_id || null,
      status: normalizeStatus(data.status),
    }, token);
  }
};

export const deleteSiswaGo = async (id: string, token?: string): Promise<void> => {
  await userAction({ action: 'delete', id }, token);
};

const normalizeStatus = (value?: string) =>
  value?.toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif';

// ==================== GURU ====================
export interface GuruGo {
  id: string;
  profile_id: string;
  nama: string;
  nip: string | null;
  email: string | null;
  status: string | null;
}

export const fetchGuruGo = async (token?: string): Promise<GuruGo[]> =>
  adminList<GuruGo>('guru', undefined, token);

export const createGuruGo = async (data: {
  nama: string; nip: string; email: string; status?: string;
}, token?: string): Promise<{ id: string }> => {
  const result = await userAction<{ user?: { id?: string } }>({
    action: 'create',
    email: data.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { nama_lengkap: data.nama, role: 'guru' },
    profile_kind: 'guru',
    nip: data.nip,
    status: normalizeStatus(data.status),
  }, token);
  const id = result?.user?.id;
  if (!id) throw new Error('Gagal membuat user guru');
  return { id };
};

export const updateGuruGo = async (id: string, data: {
  nama: string; nip: string; email: string; status?: string;
}, token?: string): Promise<void> => {
  await request(`/admin/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      full_name: data.nama, email: data.email,
      status: normalizeStatus(data.status),
    }),
  }, token);
  const rows = await fetchGuruGo(token);
  const row = rows.find((g) => g.profile_id === id || g.id === id);
  if (row) {
    await adminUpdate('guru', row.id, {
      nip: data.nip || null,
      status: normalizeStatus(data.status),
    }, token);
  }
};

export const deleteGuruGo = async (id: string, token?: string): Promise<void> => {
  await userAction({ action: 'delete', id }, token);
};

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

// ==================== PENGATURAN ====================
export interface PengaturanGo {
  key: string;
  value: unknown;
  updated_at: string | null;
}

export const fetchPengaturanGo = async (token?: string): Promise<PengaturanGo[]> =>
  adminList<PengaturanGo>('pengaturan', undefined, token);

export const setPengaturanGo = async (key: string, value: unknown, token?: string): Promise<void> => {
  const rows = await fetchPengaturanGo(token);
  if (rows.some((r) => r.key === key)) {
    await adminUpdate('pengaturan', key, { key, value }, token);
  } else {
    await adminCreate('pengaturan', { key, value }, token);
  }
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