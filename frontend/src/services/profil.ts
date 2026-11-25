import { getMeGo, updateMeGo } from './api-go';

export interface Profile {
  id: string;
  full_name: string;
  role: string | null;
  avatar_url?: string | null;
  created_at?: string;
  email?: string;
  hp?: string | null;
  alamat?: string | null;
  preferensi?: Record<string, unknown> | null;
  dusun_id?: string;
  nik?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
  pekerjaan?: string;
  rt?: string;
  rw?: string;
}

const ALLOWED_UPDATE_FIELDS = ['full_name', 'hp', 'alamat', 'preferensi'] as const;

/** getProfile mengambil profil pengguna yang sedang login dari backend Go. */
export const getProfile = async (_id: string): Promise<Profile> => {
  try {
    return await getMeGo();
  } catch {
    throw new Error('Gagal memuat profil');
  }
};

/** updateProfile mengubah data diri pengguna yang sedang login lewat backend Go. */
export const updateProfile = async (_id: string, updates: Partial<Profile>): Promise<void> => {
  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('Tidak ada data yang diubah');
  }

  try {
    await updateMeGo(payload);
  } catch (err: any) {
    throw new Error(err?.message || 'Gagal menyimpan perubahan profil');
  }
};
