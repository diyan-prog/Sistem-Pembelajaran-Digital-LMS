import { adminList, adminCreate, adminUpdate, adminDelete } from './api-go';

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
  const data = await adminList<Pengumuman>('pengumuman');
  const filtered = role
    ? data.filter((p) => !p.target_role || p.target_role === role)
    : data;
  return filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
};

export const createPengumuman = async (pengumuman: Omit<Pengumuman, 'id' | 'created_at'>) =>
  adminCreate('pengumuman', pengumuman);

export const updatePengumuman = async (id: string, updates: Partial<Pengumuman>) =>
  adminUpdate('pengumuman', id, updates);

export const deletePengumuman = async (id: string) =>
  adminDelete('pengumuman', id);