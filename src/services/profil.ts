import { supabase } from '@/store';

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
  email?: string;
  hp?: string;
  alamat?: string;
  preferensi?: Record<string, unknown>;
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

export const getProfile = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) {
    console.error('Get profile error:', error);
    throw new Error('Gagal memuat profil');
  }
  return data as Profile;
};

export const updateProfile = async (id: string, updates: Partial<Profile>): Promise<void> => {
  const filtered: Record<string, any> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in updates && updates[key as keyof Profile] !== undefined) {
      filtered[key] = updates[key as keyof Profile];
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new Error('Tidak ada data yang diubah');
  }

  const { error } = await supabase.from('profiles').update(filtered).eq('id', id);
  if (error) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Gagal menyimpan perubahan profil');
  }
};
