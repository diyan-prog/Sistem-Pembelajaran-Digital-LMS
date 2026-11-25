import { adminList, adminCreate, adminUpdate, adminDelete } from '@/services/api-go';

// ==================== TYPES ====================
export interface Pertemuan {
  id_pertemuan: string;
  id_pengampu: string;
  no_pertemuan: number;
  judul: string;
  tanggal?: string;
  created_at?: string;
}

export interface Materi {
  id_materi: string;
  id_pengampu: string;
  id_pertemuan?: string;
  judul: string;
  deskripsi?: string;
  file_materi?: string;
  link_video?: string;
  tanggal_upload?: string;
  tampil?: boolean;
}

export interface Tugas {
  id_tugas: string;
  id_pengampu: string;
  judul: string;
  deskripsi?: string;
  instruksi: string;
  file_lampiran?: string;
  deadline: string;
  batas?: string;
  maks?: number;
  created_at?: string;
}

export interface PengumpulanTugas {
  id_pengumpulan: string;
  id_tugas: string;
  id_siswa: string;
  file_jawaban?: string;
  catatan_siswa?: string;
  waktu_kumpul?: string;
  status: 'Dikumpulkan' | 'Terlambat' | 'Dinilai' | 'Belum Dikumpulkan';
  nilai?: number;
  feedback_guru?: string;
}

export interface Kuis {
  id_kuis: string;
  id_pengampu: string;
  judul: string;
  durasi_menit: number;
  durasi?: number;
  waktu_mulai: string;
  waktu_selesai: string;
  batas_waktu?: string;
  status: 'Draft' | 'Aktif' | 'Ditutup';
  created_at?: string;
}

export interface SoalKuis {
  id_soal: string;
  id_kuis: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  kunci_jawaban: string;
  poin?: number;
  urutan?: number;
}

export interface HasilKuis {
  id_hasil: string;
  id_kuis: string;
  id_siswa: string;
  nilai: number;
  waktu_mulai: string;
  waktu_selesai: string;
}

// ==================== PERTEMUAN ====================
export const fetchPertemuan = async (pengampuId: string) => {
  const rows = await adminList<any>('pertemuan', pengampuId ? `?role=${pengampuId}` : '');
  return (rows || []).sort((a: any, b: any) => (a.no_pertemuan || 0) - (b.no_pertemuan || 0));
};

export const createPertemuan = async (p: Omit<Pertemuan, 'id_pertemuan' | 'created_at'>) => {
  return adminCreate<Pertemuan>('pertemuan', p);
};

export const updatePertemuan = async (id: string, updates: Partial<Pertemuan>) => {
  return adminUpdate('pertemuan', id, updates);
};

export const deletePertemuan = async (id: string) => {
  return adminDelete('pertemuan', id);
};

// ==================== MATERI ====================
export const fetchMateri = async (pengampuId: string) => {
  const rows = await adminList<any>('materi', pengampuId ? `?role=${pengampuId}` : '');
  return (rows || []).sort((a: any, b: any) => (new Date(b.tanggal_upload || '').getTime()) - (new Date(a.tanggal_upload || '').getTime()));
};

export const createMateri = async (materi: Omit<Materi, 'id_materi' | 'tanggal_upload'>) => {
  return adminCreate<Materi>('materi', materi);
};

export const updateMateri = async (id: string, updates: Partial<Materi>) => {
  return adminUpdate('materi', id, updates);
};

export const deleteMateri = async (id: string) => {
  return adminDelete('materi', id);
};

// ==================== TUGAS ====================
export const fetchTugas = async (pengampuId?: string) => {
  const rows = await adminList<any>('tugas', '');
  const list = rows || [];
  if (pengampuId) {
    return list.filter((t: any) => t.id_pengampu === pengampuId);
  }
  return list.sort((a: any, b: any) => (new Date(b.deadline || '').getTime()) - (new Date(a.deadline || '').getTime()));
};

export const fetchTugasById = async (id: string) => {
  const rows = await adminList<any>('tugas', '');
  return (rows || []).find((t: any) => t.id_tugas === id) ?? null;
};

export const createTugas = async (tugas: Omit<Tugas, 'id_tugas' | 'created_at'>) => {
  return adminCreate<Tugas>('tugas', tugas);
};

export const updateTugas = async (id: string, updates: Partial<Tugas>) => {
  return adminUpdate('tugas', id, updates);
};

export const deleteTugas = async (id: string) => {
  return adminDelete('tugas', id);
};

// ==================== PENGUMPULAN TUGAS ====================
export const fetchPengumpulanTugas = async (tugasId: string) => {
  const rows = await adminList<any>('pengumpulan_tugas', `?role=${tugasId}`);
  return rows || [];
};

export const submitTugas = async (tugasId: string, siswaId: string, fileJawaban: string, catatan?: string) => {
  return adminCreate('pengumpulan_tugas', {
    id_tugas: tugasId,
    id_siswa: siswaId,
    file_jawaban: fileJawaban,
    catatan_siswa: catatan,
    waktu_kumpul: new Date().toISOString(),
    status: 'Dikumpulkan'
  });
};

export const nilaiTugas = async (id: string, nilai: number, feedback?: string) => {
  return adminUpdate('pengumpulan_tugas', id, { nilai, feedback_guru: feedback, status: 'Dinilai' });
};

// ==================== KUIS ====================
export const fetchKuis = async (pengampuId?: string) => {
  const rows = await adminList<any>('kuis', '');
  const list = rows || [];
  if (pengampuId) {
    return list.filter((k: any) => k.id_pengampu === pengampuId);
  }
  return list.sort((a: any, b: any) => (new Date(b.waktu_mulai || '').getTime()) - (new Date(a.waktu_mulai || '').getTime()));
};

export const fetchKuisById = async (id: string) => {
  const rows = await adminList<any>('kuis', '');
  return (rows || []).find((k: any) => k.id_kuis === id) ?? null;
};

export const createKuis = async (kuis: Omit<Kuis, 'id_kuis' | 'created_at'>) => {
  return adminCreate<Kuis>('kuis', kuis);
};

export const updateKuis = async (id: string, updates: Partial<Kuis>) => {
  return adminUpdate('kuis', id, updates);
};

export const deleteKuis = async (id: string) => {
  return adminDelete('kuis', id);
};

// ==================== SOAL KUIS ====================
export const fetchSoalKuis = async (kuisId: string) => {
  const rows = await adminList<any>('soal_kuis', `?role=${kuisId}`);
  return (rows || []).sort((a: any, b: any) => (a.urutan ?? 0) - (b.urutan ?? 0));
};

export const createSoalKuis = async (soal: Omit<SoalKuis, 'id_soal'>) => {
  return adminCreate<SoalKuis>('soal_kuis', soal);
};

export const updateSoalKuis = async (id: string, updates: Partial<SoalKuis>) => {
  return adminUpdate('soal_kuis', id, updates);
};

export const deleteSoalKuis = async (id: string) => {
  return adminDelete('soal_kuis', id);
};

// ==================== HASIL KUIS ====================
export const fetchHasilKuis = async (kuisId: string) => {
  const rows = await adminList<any>('hasil_kuis', `?role=${kuisId}`);
  return (rows || []).sort((a: any, b: any) => (new Date(b.waktu_selesai || '').getTime()) - (new Date(a.waktu_selesai || '').getTime()));
};

export const submitKuis = async (hasil: Omit<HasilKuis, 'id_hasil'>) => {
  return adminCreate<HasilKuis>('hasil_kuis', hasil);
};