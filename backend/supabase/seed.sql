-- =========================================================================
-- SEED DATA: LMS SMK Negeri 2 Indramayu
-- =========================================================================

-- 1. Jurusan
insert into public.jurusan (id, kode, nama) values
  ('11111111-1111-1111-1111-111111111111', 'RPL', 'Rekayasa Perangkat Lunak'),
  ('22222222-2222-2222-2222-222222222222', 'TKJ', 'Teknik Komputer dan Jaringan'),
  ('33333333-3333-3333-3333-333333333333', 'AKL', 'Akuntansi dan Keuangan Lembaga'),
  ('44444444-4444-4444-4444-444444444444', 'OTKP', 'Otomatisasi dan Tata Kelola Perkantoran'),
  ('55555555-5555-5555-5555-555555555555', 'TBSM', 'Teknik dan Bisnis Sepeda Motor')
on conflict (kode) do nothing;

-- 2. Tahun Ajaran
insert into public.tahun_ajaran (id, nama, semester, tanggal_mulai, tanggal_selesai, aktif) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026/2027', 'Ganjil', '2026-07-13', '2026-12-20', true)
on conflict do nothing;

-- 3. Classes (Kelas)
insert into public.classes (id, name, grade, major, tingkat, jurusan_id, tahun_ajaran_id) values
  ('00000000-0000-0000-0000-111111111111', 'X RPL 1', 10, 'RPL', 10, '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('00000000-0000-0000-0000-222222222222', 'XI TKJ 1', 11, 'TKJ', 11, '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('00000000-0000-0000-0000-333333333333', 'XII AKL 1', 12, 'AKL', 12, '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
on conflict do nothing;

-- 4. Mata Pelajaran
insert into public.subjects (id, code, name, kelompok) values
  ('11111111-1111-1111-1111-111111111112', 'MTK', 'Matematika', 'umum'),
  ('22222222-2222-2222-2222-222222222223', 'BIND', 'Bahasa Indonesia', 'umum'),
  ('33333333-3333-3333-3333-333333333334', 'PROGDAR', 'Pemrograman Dasar', 'kejuruan'),
  ('44444444-4444-4444-4444-444444444445', 'JARKOM', 'Jaringan Komputer', 'kejuruan')
on conflict do nothing;
