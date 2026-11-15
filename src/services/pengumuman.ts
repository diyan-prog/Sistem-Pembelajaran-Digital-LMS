import { supabase } from '@/store';

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
