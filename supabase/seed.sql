-- ============================================================
-- SEED DATA LMS SMK NEGERI 2 INDRAMAYU
-- Development only
-- ============================================================

-- 1. Tahun Ajaran
INSERT INTO tahun_ajaran (id, nama, semester, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', '2026/2027', 'Ganjil', true),
('a0000000-0000-0000-0000-000000000002', '2025/2026', 'Genap', false)
ON CONFLICT (nama, semester) DO NOTHING;

-- 2. Jurusan
INSERT INTO jurusan (id, nama, kode, kaprodi) VALUES
('RPL', 'Rekayasa Perangkat Lunak', 'RPL', 'Pak Hendra Kurniawan'),
('TKJ', 'Teknik Komputer dan Jaringan', 'TKJ', 'Pak Agus Wijaya'),
('DKV', 'Desain Komunikasi Visual', 'DKV', 'Bu Dewi Anggraini')
ON CONFLICT (id) DO NOTHING;

-- 3. Mata Pelajaran
INSERT INTO mata_pelajaran (id, nama, kode, kelompok, jam, warna) VALUES
('mtk', 'Matematika', 'MTK', 'Umum', 4, '#2563EB'),
('bin', 'Bahasa Indonesia', 'BIN', 'Umum', 4, '#DC2626'),
('bing', 'Bahasa Inggris', 'BIG', 'Umum', 3, '#7C3AED'),
('pkn', 'Pendidikan Pancasila', 'PKN', 'Umum', 2, '#D97706'),
('pjok', 'PJOK', 'PJK', 'Umum', 2, '#0891B2'),
('pw', 'Pemrograman Web', 'PWB', 'Kejuruan', 6, '#0B3D5F'),
('bd', 'Basis Data', 'BDT', 'Kejuruan', 6, '#DB2777'),
('prod', 'Produktif RPL', 'PRP', 'Kejuruan', 8, '#EA580C')
ON CONFLICT (id) DO NOTHING;

-- 4. Pengaturan Default
INSERT INTO pengaturan (key, value) VALUES
('nama_sekolah', '"SMK Negeri 2 Indramayu"'),
('npsn', '"20213456"'),
('ambang_kehadiran', '75'),
('bobot_tugas', '30'),
('bobot_kuis', '20'),
('bobot_uts', '30'),
('bobot_uas', '20')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Contoh Pengumuman
INSERT INTO pengumuman (judul, isi, kategori, penting, dibuat_oleh) VALUES
('Jadwal PAS Ganjil 2026/2027', 'Penilaian Akhir Semester akan dilaksanakan 7-11 Desember 2026.', 'Akademik', true, 'Wakil Kepala Sekolah'),
('Peringatan Sumpah Pemuda', 'Upacara 28 Oktober 2026 pukul 07.00.', 'Kegiatan', false, 'Kesiswaan')
ON CONFLICT DO NOTHING;
