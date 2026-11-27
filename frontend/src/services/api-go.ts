import { supabase } from '@/lib/supabase';

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8080/api/v1';

// Vite mengisi variabel VITE_* yang tidak ada di .env dengan string kosong.
// `??` tidak menangkap kasus itu, jadi pakai `||` agar fallback benar-benar aktif.
export const DEFAULT_PASSWORD = ((import.meta as any).env?.VITE_DEFAULT_PASSWORD as string | undefined)?.trim() || 'Admin123!';

const getHeaders = async (token?: string) => {
  let authToken = token;
  if (!authToken) {
    const { data: { session } } = await supabase.auth.getSession();
    authToken = session?.access_token || '';
  }
  if (!authToken) {
    throw new Error('Sesi login tidak ditemukan atau sudah berakhir. Silakan masuk ulang.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };
};

/** request membungkus respons standar {success,data,error,meta} dan mengembalikan data. */
const request = async <T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const headers = await getHeaders(token);
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.error || `Request gagal: ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  if (res.status === 204) return null as T;
  return (body?.data ?? body) as T;
};

export const requestGo = request;

// ==================== HELPER CRUD ADMIN ====================
export const adminList = async <T = any>(resource: string, query = '', token?: string): Promise<T[]> =>
  request<T[]>(`/admin/${resource}${query}`, {}, token);

export const adminCreate = async <T = any>(resource: string, data: unknown, token?: string): Promise<T> =>
  request<T>(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(data) }, token);

export const adminUpdate = async <T = any>(resource: string, id: string, data: unknown, token?: string): Promise<T> =>
  request<T>(`/admin/${resource}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }, token);

export const adminDelete = async <T = any>(resource: string, id: string, token?: string): Promise<T> =>
  request<T>(`/admin/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' }, token);

export const adminGet = async <T = any>(path: string, token?: string): Promise<T> =>
  request<T>(`/admin/${path}`, {}, token);

// ==================== AUTH / USER ACTION ====================
export type UserAction =
  | {
      action: 'create';
      email: string;
      password: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, unknown>;
      profile_kind?: 'siswa' | 'guru';
      nis?: string;
      nip?: string;
      kelas_id?: string;
      jenis_kelamin?: string;
      status?: string;
    }
  | { action: 'update-role' | 'update-status'; id: string; role?: string; status?: string }
  | { action: 'reset-password' | 'delete'; id: string; password?: string };

export const userAction = async <T = any>(payload: UserAction, token?: string): Promise<T> =>
  request<T>('/admin/users', { method: 'POST', body: JSON.stringify(payload) }, token);

const createdUserID = (result: any): string => {
  const user = result?.user ?? result;
  return user?.id ?? '';
};

// ==================== PROFILES ====================
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

export interface UserGo {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  status: string;
  nip_nis: string | null;
  avatar_url: string | null;
  created_at: string;
}

/** Daftar akun untuk halaman Manajemen Pengguna (bentuk sama dengan fetchUsers lama). */
export const fetchUsersGo = async (role?: string, token?: string): Promise<UserGo[]> => {
  const profiles = await fetchProfilesGo(role, token);
  return profiles
    .map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      status: p.status,
      nip_nis: p.nip_nis,
      avatar_url: p.foto_profil,
      created_at: p.created_at,
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
};

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

export const updateProfileGo = async (
  id: string,
  data: Partial<{ nama: string; email: string; role: string; status: string; nip_nis: string }>,
  token?: string,
): Promise<void> => {
  const current = (await fetchProfilesGo(undefined, token)).find((p) => p.id === id);
  await adminUpdate('profiles', id, {
    full_name: data.nama ?? current?.full_name ?? '',
    email: data.email ?? current?.email ?? '',
    role: data.role ?? current?.role ?? 'siswa',
    status: data.status ?? current?.status ?? 'aktif',
    nip_nis: data.nip_nis ?? current?.nip_nis ?? '',
  }, token);
};

export const deleteUserGo = async (id: string, token?: string): Promise<void> => {
  await userAction({ action: 'delete', id }, token);
};

// ==================== SISWA ====================
export interface SiswaGo {
  id: string;
  profile_id: string;
  nama: string;
  nis: string;
  email: string;
  status: string;
  kelas_id?: string | null;
  nisn?: string | null;
  jenis_kelamin?: string | null;
  nip_nis?: string | null;
  foto_profil?: string | null;
}

export interface SiswaInput {
  nama?: string;
  nis?: string;
  nisn?: string;
  email?: string;
  kelas_id?: string;
  jenis_kelamin?: string;
  status?: string;
}

export const fetchSiswaGo = async (token?: string): Promise<SiswaGo[]> =>
  adminList<SiswaGo>('siswa', '', token);

export const fetchSiswaByIdGo = async (id: string, token?: string): Promise<SiswaGo | null> => {
  const list = await fetchSiswaGo(token);
  return list.find((s) => s.id === id) ?? null;
};

/** Membuat akun Auth + profile + baris siswa dalam satu aksi backend. */
export const createSiswaGo = async (data: SiswaInput, token?: string): Promise<{ id: string }> => {
  if (!data.email) throw new Error('Email wajib diisi untuk membuat akun siswa');
  const res = await userAction({
    action: 'create',
    email: data.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { nama_lengkap: data.nama ?? data.email, role: 'siswa' },
    profile_kind: 'siswa',
    nis: data.nis,
    kelas_id: data.kelas_id,
    jenis_kelamin: data.jenis_kelamin,
    status: data.status ?? 'aktif',
  }, token);
  const id = createdUserID(res);
  const created = (await fetchSiswaGo(token)).find((s) => s.profile_id === id);
  return { id: created?.id ?? id };
};

export const updateSiswaGo = async (id: string, data: SiswaInput, token?: string): Promise<void> => {
  const current = await fetchSiswaByIdGo(id, token);
  if (!current) throw new Error('Data siswa tidak ditemukan');
  await adminUpdate('siswa', id, {
    nis: data.nis ?? current.nis,
    nisn: data.nisn ?? current.nisn ?? '',
    kelas_id: data.kelas_id ?? current.kelas_id ?? '',
    jenis_kelamin: data.jenis_kelamin ?? current.jenis_kelamin ?? '',
    status: data.status ?? current.status ?? 'aktif',
  }, token);
  if (data.nama || data.email) {
    await updateProfileGo(current.profile_id, { nama: data.nama, email: data.email }, token);
  }
};

export const deleteSiswaGo = async (id: string, token?: string): Promise<void> => {
  const current = await fetchSiswaByIdGo(id, token);
  if (!current) throw new Error('Data siswa tidak ditemukan');
  await userAction({ action: 'delete', id: current.profile_id }, token);
};

// ==================== GURU ====================
export interface GuruGo {
  id: string;
  profile_id: string;
  nip: string | null;
  nama: string;
  email: string | null;
  status: string | null;
  foto_profil: string | null;
}

export interface GuruInput {
  nip?: string;
  nama?: string;
  email?: string;
  status?: string;
  foto_profil?: string;
}

export const fetchGuruGo = async (token?: string): Promise<GuruGo[]> =>
  adminList<GuruGo>('guru', '', token);

export const fetchGuruByIdGo = async (id: string, token?: string): Promise<GuruGo | null> => {
  const list = await fetchGuruGo(token);
  return list.find((g) => g.id === id) ?? null;
};

export const createGuruGo = async (data: GuruInput, token?: string): Promise<{ id: string }> => {
  if (!data.email) throw new Error('Email wajib diisi untuk membuat akun guru');
  const res = await userAction({
    action: 'create',
    email: data.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { nama_lengkap: data.nama ?? data.email, role: 'guru' },
    profile_kind: 'guru',
    nip: data.nip,
    status: data.status ?? 'aktif',
  }, token);
  return { id: createdUserID(res) };
};

export const updateGuruGo = async (id: string, data: GuruInput, token?: string): Promise<void> => {
  await updateProfileGo(id, { nama: data.nama, email: data.email, status: data.status, nip_nis: data.nip }, token);
  if (data.nip || data.status) {
    const row = (await fetchGuruGo(token)).find((g) => g.profile_id === id || g.id === id);
    if (row) {
      await adminUpdate('guru', row.id, {
        nip: data.nip ?? row.nip ?? '',
        status: data.status ?? row.status ?? 'aktif',
      }, token);
    }
  }
};

export const deleteGuruGo = async (id: string, token?: string): Promise<void> => {
  await userAction({ action: 'delete', id }, token);
};

// ==================== MAPEL ====================
export interface MapelGo {
  id: string;
  name: string;
  code: string;
  category: string;
  grade: number;
  kelompok: string | null;
}

export const fetchMapelGo = async (token?: string): Promise<MapelGo[]> =>
  adminList<MapelGo>('mapel', '', token);

export const fetchMapelByIdGo = async (id: string, token?: string): Promise<MapelGo | null> => {
  const list = await fetchMapelGo(token);
  return list.find((m) => m.id === id) ?? null;
};

export const createMapelGo = async (
  data: { name: string; code: string; category?: string; grade?: number; kelompok?: string },
  token?: string,
): Promise<MapelGo> =>
  adminCreate<MapelGo>('mapel', { grade: 10, category: 'Umum', ...data }, token);

export const updateMapelGo = async (id: string, data: Partial<MapelGo>, token?: string): Promise<void> => {
  const current = await fetchMapelByIdGo(id, token);
  if (!current) throw new Error('Mata pelajaran tidak ditemukan');
  await adminUpdate('mapel', id, {
    name: data.name ?? current.name,
    code: data.code ?? current.code,
    category: data.category ?? current.category,
    grade: data.grade ?? current.grade,
    kelompok: data.kelompok ?? current.kelompok ?? '',
  }, token);
};

export const deleteMapelGo = async (id: string, token?: string): Promise<void> => {
  await adminDelete('mapel', id, token);
};

// ==================== KELAS ====================
export interface KelasGo {
  id: string;
  name: string;
  grade: number;
  major: string;
  academic_year: string | null;
  tingkat: number;
  jurusan_id: string | null;
  wali_kelas_id: string | null;
}

export interface KelasInput {
  name?: string;
  grade?: number;
  major?: string;
  tingkat?: number;
  jurusan_id?: string | null;
  wali_kelas_id?: string | null;
  academic_year?: string;
}

export const fetchKelasGo = async (jurusan_id?: string, token?: string): Promise<KelasGo[]> => {
  const list = await adminList<KelasGo>('classes', '', token);
  if (!jurusan_id) return list;
  return list.filter((c) => c.jurusan_id === jurusan_id);
};

export const fetchKelasGoById = async (id: string, token?: string): Promise<KelasGo | null> => {
  const list = await fetchKelasGo(undefined, token);
  return list.find((k) => k.id === id) ?? null;
};

export const createKelasGo = async (payload: KelasInput, token?: string): Promise<KelasGo> =>
  adminCreate<KelasGo>('classes', {
    grade: 10,
    major: '',
    academic_year: '2026/2027',
    tingkat: 10,
    ...payload,
  }, token);

export const updateKelasGo = async (id: string, data: KelasInput, token?: string): Promise<void> => {
  const current = await fetchKelasGoById(id, token);
  if (!current) throw new Error('Kelas tidak ditemukan');
  await adminUpdate('classes', id, {
    name: data.name ?? current.name,
    grade: data.grade ?? current.grade,
    major: data.major ?? current.major,
    academic_year: data.academic_year ?? current.academic_year ?? '2026/2027',
    tingkat: data.tingkat ?? current.tingkat,
    jurusan_id: data.jurusan_id ?? current.jurusan_id ?? '',
    wali_kelas_id: data.wali_kelas_id ?? current.wali_kelas_id ?? '',
  }, token);
};

export const deleteKelasGo = async (id: string, token?: string): Promise<void> => {
  await adminDelete('classes', id, token);
};

// ==================== JURUSAN ====================
export interface JurusanGo {
  id: string;
  kode: string;
  nama: string;
}

export const fetchJurusanGo = async (token?: string): Promise<JurusanGo[]> =>
  adminList<JurusanGo>('jurusan', '', token);

export const fetchJurusanByIdGo = async (id: string, token?: string): Promise<JurusanGo | null> => {
  const list = await fetchJurusanGo(token);
  return list.find((j) => j.id === id) ?? null;
};

export const createJurusanGo = async (data: { kode: string; nama: string }, token?: string): Promise<JurusanGo> =>
  adminCreate<JurusanGo>('jurusan', data, token);

export const updateJurusanGo = async (id: string, data: Partial<JurusanGo>, token?: string): Promise<void> => {
  const current = await fetchJurusanByIdGo(id, token);
  if (!current) throw new Error('Jurusan tidak ditemukan');
  await adminUpdate('jurusan', id, {
    kode: data.kode ?? current.kode,
    nama: data.nama ?? current.nama,
  }, token);
};

export const deleteJurusanGo = async (id: string, token?: string): Promise<void> => {
  await adminDelete('jurusan', id, token);
};

// ==================== JADWAL ====================
export interface JadwalGo {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  penugasan_id: string | null;
  ruangan: string | null;
}

export const fetchJadwalGo = async (token?: string): Promise<JadwalGo[]> =>
  adminList<JadwalGo>('jadwal', '', token);

export const createJadwalGo = async (
  data: { hari: string; jam_mulai: string; jam_selesai: string; penugasan_id?: string | null; ruangan?: string },
  token?: string,
): Promise<JadwalGo> => adminCreate<JadwalGo>('jadwal', data, token);

export const updateJadwalGo = async (id: string, data: Partial<JadwalGo>, token?: string): Promise<void> => {
  const list = await fetchJadwalGo(token);
  const current = list.find((j) => j.id === id);
  if (!current) throw new Error('Jadwal tidak ditemukan');
  await adminUpdate('jadwal', id, {
    hari: data.hari ?? current.hari,
    jam_mulai: data.jam_mulai ?? current.jam_mulai,
    jam_selesai: data.jam_selesai ?? current.jam_selesai,
    penugasan_id: data.penugasan_id ?? current.penugasan_id ?? '',
    ruangan: data.ruangan ?? current.ruangan ?? '',
  }, token);
};

export const deleteJadwalGo = async (id: string, token?: string): Promise<void> => {
  await adminDelete('jadwal', id, token);
};

// ==================== PENGAMPU ====================
export interface PengampuGo {
  id_pengampu: string;
  id_guru: string;
  id_kelas: string;
  id_mapel: string;
  tahun_ajaran: string;
  guru: { full_name: string; role: string } | null;
  mapel: { name: string; code: string } | null;
  kelas: { name: string; grade: number; major: string } | null;
}

export const fetchPengampuGo = async (token?: string): Promise<PengampuGo[]> =>
  adminList<PengampuGo>('pengampu', '', token);

export const updatePengampuGo = async (id: string, data: Partial<Record<'id_guru' | 'id_kelas' | 'id_mapel' | 'tahun_ajaran', string>>, token?: string): Promise<void> => {
  const list = await fetchPengampuGo(token);
  const current = list.find((p) => p.id_pengampu === id);
  if (!current) throw new Error('Penugasan tidak ditemukan');
  await adminUpdate('pengampu', id, {
    id_guru: data.id_guru ?? current.id_guru,
    id_kelas: data.id_kelas ?? current.id_kelas,
    id_mapel: data.id_mapel ?? current.id_mapel,
    tahun_ajaran: data.tahun_ajaran ?? current.tahun_ajaran,
  }, token);
};

// ==================== SISWA PENGAMPU ====================
export const fetchSiswaPengampuGo = async (siswaId: string, token?: string): Promise<PengampuGo[]> =>
  request<PengampuGo[]>(`/siswa/${encodeURIComponent(siswaId)}/pengampu`, {}, token);

// ==================== LOG ====================
export interface LogGo {
  id: string;
  user_id: string | null;
  user: string | null;
  role: string | null;
  aksi: string;
  modul: string | null;
  entitas: string | null;
  entitas_id: string | null;
  ip_address: string | null;
  waktu: string;
}

export const fetchLogGo = async (token?: string): Promise<LogGo[]> =>
  adminList<LogGo>('log', '', token);

// ==================== TUGAS ====================
export interface TugasGo {
  id_tugas: string;
  id_pengampu: string;
  judul: string;
  deskripsi: string | null;
  file_lampiran: string | null;
  deadline: string;
  created_at: string | null;
  pengampu: { subjects: { name: string } } | null;
}

export const fetchTugasGo = async (token?: string): Promise<TugasGo[]> =>
  adminList<TugasGo>('tugas', '', token);

// ==================== PENGUMPULAN TUGAS ====================
export interface PengumpulanTugasGo {
  id_pengumpulan: string;
  id_tugas: string;
  id_siswa: string;
  file_jawaban: string | null;
  catatan_siswa: string | null;
  feedback_guru: string | null;
  nilai: number | null;
  status: string;
  waktu_kumpul: string | null;
}

export const fetchPengumpulanGo = async (token?: string): Promise<PengumpulanTugasGo[]> =>
  adminList<PengumpulanTugasGo>('pengumpulan_tugas', '', token);

// ==================== KUIS ====================
export interface KuisGo {
  id_kuis: string;
  id_pengampu: string;
  judul: string;
  durasi_menit: number;
  status: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  created_at: string | null;
  pengampu: { subjects: { name: string } } | null;
}

export const fetchKuisGo = async (token?: string): Promise<KuisGo[]> =>
  adminList<KuisGo>('kuis', '', token);

// ==================== SOAL KUIS ====================
export interface SoalKuisGo {
  id_soal: string;
  id_kuis: string;
  pertanyaan: string;
  pilihan_a: string | null;
  pilihan_b: string | null;
  pilihan_c: string | null;
  pilihan_d: string | null;
  kunci_jawaban: string | null;
  poin: number;
  urutan: number | null;
}

export const fetchSoalKuisGo = async (token?: string): Promise<SoalKuisGo[]> =>
  adminList<SoalKuisGo>('soal_kuis', '', token);

// ==================== HASIL KUIS ====================
export interface HasilKuisGo {
  id_hasil: string;
  id_kuis: string;
  id_siswa: string;
  nilai: number;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
}

export const fetchHasilGo = async (token?: string): Promise<HasilKuisGo[]> =>
  adminList<HasilKuisGo>('hasil_kuis', '', token);

// ==================== NOTIFIKASI ====================
export interface NotifikasiGo {
  id: string;
  user_id: string | null;
  judul: string;
  isi: string | null;
  jenis: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const fetchNotifikasiGo = async (token?: string): Promise<NotifikasiGo[]> =>
  adminList<NotifikasiGo>('notifikasi', '', token);

// ==================== MATERI ====================
export interface MateriGo {
  id_materi: string;
  id_pengampu: string;
  judul: string;
  deskripsi: string | null;
  file_materi: string | null;
  link_video: string | null;
  tanggal_upload: string;
}

export const fetchMateriGo = async (token?: string): Promise<MateriGo[]> =>
  adminList<MateriGo>('materi', '', token);

// ==================== PERTEMUAN ====================
export interface PertemuanGo {
  id_pertemuan: string;
  id_pengampu: string | null;
  no_pertemuan: number;
  judul: string;
  tanggal: string | null;
}

export const fetchPertemuanGo = async (token?: string): Promise<PertemuanGo[]> =>
  adminList<PertemuanGo>('pertemuan', '', token);

// ==================== TAHUN AJARAN ====================
export interface TahunAjaranGo {
  id: string;
  nama: string;
  semester: string;
  is_active: boolean | null;
  created_at: string | null;
}

export const fetchTahunAjaranGo = async (token?: string): Promise<TahunAjaranGo[]> =>
  adminList<TahunAjaranGo>('tahun_ajaran', '', token);

export const createTahunAjaranGo = async (
  data: { nama: string; semester: string; is_active?: boolean | null },
  token?: string,
): Promise<TahunAjaranGo> => adminCreate<TahunAjaranGo>('tahun_ajaran', data, token);

export const updateTahunAjaranGo = async (id: string, data: Partial<TahunAjaranGo>, token?: string): Promise<void> => {
  const current = (await fetchTahunAjaranGo(token)).find((t) => t.id === id);
  if (!current) throw new Error('Tahun ajaran tidak ditemukan');
  await adminUpdate('tahun_ajaran', id, {
    nama: data.nama ?? current.nama,
    semester: data.semester ?? current.semester,
    is_active: data.is_active ?? current.is_active ?? false,
  }, token);
};

export const deleteTahunAjaranGo = async (id: string, token?: string): Promise<void> => {
  await adminDelete('tahun_ajaran', id, token);
};

// ==================== PENGATURAN ====================
export interface PengaturanGo {
  key: string;
  value: any;
  updated_at: string | null;
}

export const fetchPengaturanGo = async (token?: string): Promise<PengaturanGo[]> =>
  adminList<PengaturanGo>('pengaturan', '', token);

export const setPengaturanGo = async (key: string, value: unknown, token?: string): Promise<void> => {
  const rows = await fetchPengaturanGo(token);
  if (rows.some((r) => r.key === key)) {
    await adminUpdate('pengaturan', key, { key, value }, token);
    return;
  }
  await adminCreate('pengaturan', { key, value }, token);
};

// ==================== DASHBOARD ====================
export interface StatsGo {
  siswa: number;
  guru: number;
  kelas: number;
  mapel: number;
  users: number;
}

export const fetchStatsGo = async (token?: string): Promise<StatsGo> => {
  const row = await adminGet<any>('dashboard', token);
  const r = row || {};
  return {
    siswa: r.total_siswa ?? 0,
    guru: r.total_guru ?? 0,
    kelas: r.total_classes ?? 0,
    mapel: r.total_subjects ?? 0,
    users: r.total_users ?? 0,
  };
};

export const fetchSiswaPerJurusanGo = async (token?: string) => {
  const [jurusan, kelas, siswa] = await Promise.all([
    fetchJurusanGo(token),
    fetchKelasGo(undefined, token),
    fetchSiswaGo(token),
  ]);
  const kelasById = new Map(kelas.map((k) => [k.id, k]));
  return jurusan.map((j) => ({
    n: j.kode,
    v: siswa.filter((s) => kelasById.get(s.kelas_id || '')?.jurusan_id === j.id).length,
  }));
};

// ==================== HELPER ====================
export const normalizeStatus = (value?: string) =>
  value?.toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif';
