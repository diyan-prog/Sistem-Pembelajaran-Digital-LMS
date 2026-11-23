-- =========================================================================
-- LMS AKADEMIK TABLES & RLS
-- =========================================================================

-- Enable extension if not already enabled
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. CORE AKADEMIK TABLES
-- =========================================================================

-- Classes (Kelas)
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade int,
  major text,
  created_at timestamptz default now()
);

-- Subjects (Mata Pelajaran)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  created_at timestamptz default now()
);

-- Pengampu (Teacher-Class-Subject Assignment)
create table if not exists public.pengampu (
  id_pengampu uuid primary key default gen_random_uuid(),
  id_kelas uuid references public.classes(id) on delete cascade,
  id_mapel uuid references public.subjects(id) on delete cascade,
  id_guru uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- Pertemuan (Meeting/Session per class-subject)
create table if not exists public.pertemuan (
  id_pertemuan uuid primary key default gen_random_uuid(),
  id_pengampu uuid references public.pengampu(id_pengampu) on delete cascade,
  no_pertemuan int not null,
  judul text not null,
  tanggal date,
  created_at timestamptz default now()
);

-- =========================================================================
-- 2. MATERI & TUGAS
-- =========================================================================

-- Materi
create table if not exists public.materi (
  id_materi uuid primary key default gen_random_uuid(),
  id_pengampu uuid references public.pengampu(id_pengampu) on delete cascade,
  id_pertemuan uuid references public.pertemuan(id_pertemuan) on delete cascade,
  judul text not null,
  deskripsi text,
  file_materi text,
  link_video text,
  tanggal_upload date,
  tampil boolean default true,
  created_at timestamptz default now()
);

-- Tugas
create table if not exists public.tugas (
  id_tugas uuid primary key default gen_random_uuid(),
  id_pengampu uuid references public.pengampu(id_pengampu) on delete cascade,
  judul text not null,
  instruksi text,
  deadline timestamptz,
  created_at timestamptz default now()
);

-- Pengumpulan Tugas
create table if not exists public.pengumpulan_tugas (
  id_pengumpulan uuid primary key default gen_random_uuid(),
  id_tugas uuid references public.tugas(id_tugas) on delete cascade,
  id_siswa uuid references public.profiles(id) on delete cascade,
  file_jawaban text,
  status text default 'Dikumpulkan',
  nilai int,
  feedback_guru text,
  created_at timestamptz default now()
);

-- =========================================================================
-- 3. KUIS
-- =========================================================================

-- Kuis
create table if not exists public.kuis (
  id_kuis uuid primary key default gen_random_uuid(),
  id_pengampu uuid references public.pengampu(id_pengampu) on delete cascade,
  judul text not null,
  durasi_menit int,
  waktu_mulai timestamptz,
  waktu_selesai timestamptz,
  status text default 'Aktif',
  created_at timestamptz default now()
);

-- Soal Kuis
create table if not exists public.soal_kuis (
  id_soal uuid primary key default gen_random_uuid(),
  id_kuis uuid references public.kuis(id_kuis) on delete cascade,
  pertanyaan text not null,
  pilihan_a text,
  pilihan_b text,
  pilihan_c text,
  pilihan_d text,
  kunci_jawaban text,
  created_at timestamptz default now()
);

-- Hasil Kuis
create table if not exists public.hasil_kuis (
  id_hasil uuid primary key default gen_random_uuid(),
  id_kuis uuid references public.kuis(id_kuis) on delete cascade,
  id_siswa uuid references public.profiles(id) on delete cascade,
  nilai int,
  jawaban jsonb,
  created_at timestamptz default now()
);

-- =========================================================================
-- 4. PRESENSI & CHAT
-- =========================================================================

-- Presensi
create table if not exists public.presensi (
  id_presensi uuid primary key default gen_random_uuid(),
  id_pengampu uuid references public.pengampu(id_pengampu) on delete cascade,
  id_siswa uuid references public.profiles(id) on delete cascade,
  tanggal date not null,
  status text default 'Hadir',
  created_at timestamptz default now()
);

-- Chat Messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  sender text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Siswa Kelas (Assignment Siswi ke Kelas)
create table if not exists public.siswa_kelas (
  id_siswa uuid references public.profiles(id) on delete cascade,
  id_kelas uuid references public.classes(id) on delete cascade,
  nis varchar(20),
  status varchar(20) default 'Aktif',
  created_at timestamptz default now(),
  primary key (id_siswa, id_kelas)
);

create index if not exists idx_siswa_kelas_kelas on public.siswa_kelas(id_kelas);

-- =========================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =========================================================================

alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.pengampu enable row level security;
alter table public.pertemuan enable row level security;
alter table public.materi enable row level security;
alter table public.tugas enable row level security;
alter table public.pengumpulan_tugas enable row level security;
alter table public.kuis enable row level security;
alter table public.soal_kuis enable row level security;
alter table public.hasil_kuis enable row level security;
alter table public.presensi enable row level security;
alter table public.chat_messages enable row level security;

-- =========================================================================
-- 6. RLS POLICIES
-- =========================================================================

-- Classes: Public read, authenticated write
drop policy if exists "Public Read Classes" on public.classes;
create policy "Public Read Classes" on public.classes for select using (true);
drop policy if exists "Authenticated Write Classes" on public.classes;
create policy "Authenticated Write Classes" on public.classes for all using (auth.role() = 'authenticated');

-- Subjects: Public read, authenticated write
drop policy if exists "Public Read Subjects" on public.subjects;
create policy "Public Read Subjects" on public.subjects for select using (true);
drop policy if exists "Authenticated Write Subjects" on public.subjects;
create policy "Authenticated Write Subjects" on public.subjects for all using (auth.role() = 'authenticated');

-- Pengampu: Public read, authenticated write
drop policy if exists "Public Read Pengampu" on public.pengampu;
create policy "Public Read Pengampu" on public.pengampu for select using (true);
drop policy if exists "Authenticated Write Pengampu" on public.pengampu;
create policy "Authenticated Write Pengampu" on public.pengampu for all using (auth.role() = 'authenticated');

-- Pertemuan: Public read, authenticated write
drop policy if exists "Public Read Pertemuan" on public.pertemuan;
create policy "Public Read Pertemuan" on public.pertemuan for select using (true);
drop policy if exists "Authenticated Write Pertemuan" on public.pertemuan;
create policy "Authenticated Write Pertemuan" on public.pertemuan for all using (auth.role() = 'authenticated');

-- Materi: Public read, authenticated write
drop policy if exists "Public Read Materi" on public.materi;
create policy "Public Read Materi" on public.materi for select using (true);
drop policy if exists "Authenticated Write Materi" on public.materi;
create policy "Authenticated Write Materi" on public.materi for all using (auth.role() = 'authenticated');

-- Tugas: Public read, authenticated write
drop policy if exists "Public Read Tugas" on public.tugas;
create policy "Public Read Tugas" on public.tugas for select using (true);
drop policy if exists "Authenticated Write Tugas" on public.tugas;
create policy "Authenticated Write Tugas" on public.tugas for all using (auth.role() = 'authenticated');

-- Pengumpulan Tugas: Siswa can insert own, guru can update
drop policy if exists "Public Read Pengumpulan" on public.pengumpulan_tugas;
create policy "Public Read Pengumpulan" on public.pengumpulan_tugas for select using (true);
drop policy if exists "Siswa Insert Own Pengumpulan" on public.pengumpulan_tugas;
create policy "Siswa Insert Own Pengumpulan" on public.pengumpulan_tugas for insert 
  with check (auth.uid() = id_siswa);
drop policy if exists "Guru Update Pengumpulan" on public.pengumpulan_tugas;
create policy "Guru Update Pengumpulan" on public.pengumpulan_tugas for update 
  using (exists (select 1 from public.pengampu where id_guru = auth.uid()));

-- Kuis: Public read, authenticated write
drop policy if exists "Public Read Kuis" on public.kuis;
create policy "Public Read Kuis" on public.kuis for select using (true);
drop policy if exists "Authenticated Write Kuis" on public.kuis;
create policy "Authenticated Write Kuis" on public.kuis for all using (auth.role() = 'authenticated');

-- Soal Kuis: Public read, authenticated write
drop policy if exists "Public Read Soal Kuis" on public.soal_kuis;
create policy "Public Read Soal Kuis" on public.soal_kuis for select using (true);
drop policy if exists "Authenticated Write Soal Kuis" on public.soal_kuis;
create policy "Authenticated Write Soal Kuis" on public.soal_kuis for all using (auth.role() = 'authenticated');

-- Hasil Kuis: Siswa can insert own, public read
drop policy if exists "Public Read Hasil Kuis" on public.hasil_kuis;
create policy "Public Read Hasil Kuis" on public.hasil_kuis for select using (true);
drop policy if exists "Siswa Insert Own Hasil" on public.hasil_kuis;
create policy "Siswa Insert Own Hasil" on public.hasil_kuis for insert 
  with check (auth.uid() = id_siswa);

-- Presensi: Guru can insert/update, siswa read own
drop policy if exists "Public Read Presensi" on public.presensi;
create policy "Public Read Presensi" on public.presensi for select using (true);
drop policy if exists "Guru Write Presensi" on public.presensi;
create policy "Guru Write Presensi" on public.presensi for all 
  using (exists (select 1 from public.pengampu where id_guru = auth.uid()));

-- Chat Messages: Authenticated can all
drop policy if exists "Authenticated Chat Messages" on public.chat_messages;
create policy "Authenticated Chat Messages" on public.chat_messages for all 
  using (auth.role() = 'authenticated');

-- =========================================================================
-- 7. PROFILES: Add missing columns if not exists + RLS
-- =========================================================================

alter table public.profiles add column if not exists hp text;
alter table public.profiles add column if not exists alamat text;
alter table public.profiles add column if not exists preferensi jsonb default '{}'::jsonb;

-- Ensure UPDATE policy for own profile exists
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update 
  using (auth.uid() = id) 
  with check (auth.uid() = id);

-- =========================================================================
-- 8. NOTIFY POSTGREST TO RELOAD SCHEMA
-- =========================================================================

notify pgrst, 'reload schema';