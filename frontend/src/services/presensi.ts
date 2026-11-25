import { adminList, adminCreate, adminUpdate, adminDelete } from '@/services/api-go';

// ==================== TYPES ====================
export interface Presensi {
  id_presensi: string;
  id_pengampu: string;
  id_siswa: string;
  tanggal: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  dicatat_oleh?: string;
  created_at?: string;
}

export interface Notifikasi {
  id: string;
  user_id: string;
  judul: string;
  isi?: string;
  jenis?: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
}

// ==================== PRESENSI ====================
export const fetchPresensi = async (pengampuId: string) => {
  return adminList<any>('presensi');
};

export const fetchPresensiSiswa = async (pengampuId: string, siswaId: string) => {
  return adminList<any>('presensi', `?role=${pengampuId}`);
};

export const createPresensi = async (data: Omit<Presensi, 'id_presensi' | 'created_at'>) => {
  return adminCreate<Presensi>('presensi', data);
};

export const savePresensi = async (entries: Array<{ id_pengampu: string; id_siswa: string; tanggal: string; status: string; dicatat_oleh: string }>) => {
  for (const entry of entries) {
    await adminCreate('presensi', entry);
  }
};

export const deletePresensi = async (id: string) => {
  return adminDelete('presensi', id);
};