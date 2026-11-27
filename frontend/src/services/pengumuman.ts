import { adminCreate, adminUpdate, adminDelete } from './api-go';
import { getSnapshot } from '@/lib/store';
import { str } from '@/lib/data/entities';

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  kategori?: string;
  penting: boolean;
  /** Nama penulis untuk tampilan (bukan UUID). */
  dibuat_oleh?: string;
  target_role?: string;
  target_kelas_id?: string;
  created_at?: string;
}

const namaProfil = (): Map<string, string> => {
  const snap = getSnapshot();
  return new Map(snap.profiles.map((p) => [str(p.id), str(p.nama_lengkap ?? p.full_name)]));
};

/**
 * Daftar pengumuman dibaca dari snapshot bootstrap (`/api/v1/akademik/bootstrap`).
 * Server sudah mempersempit baris sesuai peran pengguna, jadi siswa/guru/wali/kepsek
 * tidak perlu (dan tidak boleh) memanggil `/api/v1/admin/pengumuman` yang hanya
 * terbuka untuk admin/tu/kepsek (403 untuk peran lain).
 */
export const fetchPengumuman = (role?: string): Pengumuman[] => {
  const snap = getSnapshot();
  const profil = namaProfil();
  return snap.pengumuman
    .map((p) => ({
      id: str(p.id),
      judul: str(p.judul),
      isi: str(p.isi),
      kategori: str(p.kategori, 'Umum'),
      penting: Boolean(p.penting),
      dibuat_oleh: profil.get(str(p.dibuat_oleh)) ?? (str(p.dibuat_oleh) || undefined),
      target_role: str(p.target_role) || undefined,
      target_kelas_id: str(p.target_kelas_id) || undefined,
      created_at: str(p.created_at) || undefined,
    }))
    .filter((p) => !role || !p.target_role || p.target_role === role)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
};

/** ID pengguna aktif dari snapshot (UUID). Dibutuhkan kolom `dibuat_oleh` bertipe uuid. */
const userId = (): string => {
  const snap = getSnapshot();
  return str(snap.me?.id) || str(snap.me?.user_id) || str(snap.scope?.user_id);
};

export const createPengumuman = async (
  pengumuman: Omit<Pengumuman, 'id' | 'created_at'>
) => {
  const oleh = userId();
  return adminCreate<Pengumuman>('pengumuman', {
    judul: pengumuman.judul,
    isi: pengumuman.isi,
    kategori: pengumuman.kategori ?? 'Umum',
    penting: Boolean(pengumuman.penting),
    // `pengumuman.dibuat_oleh` dari pemanggil berisi nama, bukan UUID; abaikan.
    dibuat_oleh: oleh,
    target_role: pengumuman.target_role ?? '',
    target_kelas_id: pengumuman.target_kelas_id ?? '',
  });
};

export const updatePengumuman = async (id: string, updates: Partial<Pengumuman>) => {
  const payload: Record<string, unknown> = {};
  if (updates.judul !== undefined) payload.judul = updates.judul;
  if (updates.isi !== undefined) payload.isi = updates.isi;
  if (updates.kategori !== undefined) payload.kategori = updates.kategori;
  if (updates.penting !== undefined) payload.penting = Boolean(updates.penting);
  if (updates.target_role !== undefined) payload.target_role = updates.target_role ?? '';
  if (updates.target_kelas_id !== undefined)
    payload.target_kelas_id = updates.target_kelas_id ?? '';
  return adminUpdate<Pengumuman>('pengumuman', id, payload);
};

export const deletePengumuman = async (id: string) =>
  adminDelete<Pengumuman>('pengumuman', id);
