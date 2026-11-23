-- Migration to align schema with LMS requirements
-- Phase 2: Database Schema

-- 1. Helper function for recursive policy check
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 2. Update Profiles role constraint
alter table public.profiles drop constraint if exists profiles_role_check;

-- Fix existing roles to match new allowed roles
update public.profiles 
set role = case 
  when role = 'admin' then 'super_admin'
  when role = 'user' then 'siswa'
  when role not in ('super_admin', 'kepala_sekolah', 'guru', 'siswa', 'wali_kelas') then 'siswa'
  else role 
end;

alter table public.profiles alter column role set default 'siswa';
alter table public.profiles add constraint profiles_role_check 
  check (role in ('super_admin', 'kepala_sekolah', 'guru', 'siswa', 'wali_kelas'));

-- 3. Jurusan Table
create table if not exists public.jurusan (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  nama text not null,
  created_at timestamptz default now()
);

-- 4. Tahun Ajaran Table
create table if not exists public.tahun_ajaran (
  id uuid primary key default gen_random_uuid(),
  nama text not null, -- e.g., 2026/2027
  semester text not null check (semester in ('Ganjil', 'Genap')),
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  aktif boolean default false,
  created_at timestamptz default now()
);

-- 5. Modify Classes (Kelas)
-- Note: Existing table is 'classes'. We'll add missing columns.
alter table public.classes add column if not exists tingkat int;
alter table public.classes add column if not exists jurusan_id uuid references public.jurusan(id);
alter table public.classes add column if not exists tahun_ajaran_id uuid references public.tahun_ajaran(id);
alter table public.classes add column if not exists wali_kelas_id uuid references public.profiles(id);

-- 6. Siswa Detail Table (Extends Profile)
create table if not exists public.siswa (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  nis text not null unique,
  nisn text unique,
  kelas_id uuid references public.classes(id),
  jenis_kelamin text check (jenis_kelamin in ('L', 'P')),
  status text default 'Aktif',
  created_at timestamptz default now()
);

-- 7. Guru Detail Table (Extends Profile)
create table if not exists public.guru (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  nip text unique,
  status text default 'Aktif',
  created_at timestamptz default now()
);

-- 8. Mata Pelajaran (Updating subjects)
alter table public.subjects add column if not exists kelompok text check (kelompok in ('umum', 'kejuruan'));
alter table public.subjects add column if not exists guru_utama_id uuid references public.profiles(id);

-- 9. Jadwal Pelajaran
create table if not exists public.jadwal_pelajaran (
  id uuid primary key default gen_random_uuid(),
  penugasan_id uuid not null references public.pengampu(id_pengampu) on delete cascade,
  hari text not null, -- Senin, Selasa, etc.
  jam_mulai time not null,
  jam_selesai time not null,
  ruangan text,
  created_at timestamptz default now()
);

-- RLS & Policies
alter table public.jurusan enable row level security;
alter table public.tahun_ajaran enable row level security;
alter table public.siswa enable row level security;
alter table public.guru enable row level security;
alter table public.jadwal_pelajaran enable row level security;

-- Super Admin Policy
create policy "Super admin manage all" on public.profiles for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.classes for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.subjects for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.jurusan for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.tahun_ajaran for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.siswa for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.guru for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.pengampu for all using (public.get_my_role() = 'super_admin');
create policy "Super admin manage all" on public.jadwal_pelajaran for all using (public.get_my_role() = 'super_admin');

-- Public/Select Policy for others
create policy "Authenticated select" on public.jurusan for select using (auth.role() = 'authenticated');
create policy "Authenticated select" on public.tahun_ajaran for select using (auth.role() = 'authenticated');
create policy "Authenticated select" on public.siswa for select using (auth.role() = 'authenticated');
create policy "Authenticated select" on public.guru for select using (auth.role() = 'authenticated');
create policy "Authenticated select" on public.jadwal_pelajaran for select using (auth.role() = 'authenticated');
