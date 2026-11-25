import { fetchSiswaPengampuGo } from './api-go';
import { adminList } from '@/services/api-go';

export const fetchSiswaClasses = async (siswaId: string) => {
  return fetchSiswaPengampuGo(siswaId);
};

export const fetchSiswaTugas = async (siswaId: string) => {
  return adminList<any>('tugas', '');
};

export const fetchSiswaPresensi = async (siswaId: string) => {
  return adminList<any>('presensi', '');
};

// Fetch kelas + pengampu siswa via backend Go (flat list of offerings)
export const fetchSiswaClassesGo = async (siswaId: string) => {
  const rows = await fetchSiswaPengampuGo(siswaId);
  return rows.map(p => ({
    id: p.id_pengampu,
    kelasId: p.kelas_name,
    subjectId: p.mapel_code,
    kode: p.mapel_name,
    guru: p.guru_name || '',
    co: [],
    jadwal: [{ hari: new Date().getDay() || 1, mulai: '07.00', selesai: '08.40', ruang: 'R.501', mode: 'Offline', sesi: 1 }],
    done: 10,
    total: 32,
    hadir: 8,
    rata: 85,
    semester: p.tahun_ajaran || '2026/2027',
    arsip: false,
  }));
};