-- =========================================================================
-- ALIGNMENT: menyelaraskan skema nyata dengan kolom yang dipakai API Go.
-- Database live berasal dari proyek gabungan sehingga beberapa kolom/tabel
-- yang diharapkan backend (profiles.nama_lengkap, classes.academic_year,
-- tahun_ajaran.is_active, activity_log, pengaturan, pengumuman, notifikasi)
-- belum ada. Migrasi ini idempoten dan aman dijalankan berulang.
-- =========================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------------------
alter table public.profiles add column if not exists nama_lengkap text;
alter table public.profiles add column if not exists nip_nis text;
alter table public.profiles add column if not exists status text default 'Aktif';
alter table public.profiles add column if not exists foto_profil text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists created_at timestamptz default now();

update public.profiles set nama_lengkap = full_name where nama_lengkap is null;
update public.profiles set full_name = nama_lengkap where full_name is null and nama_lengkap is not null;
update public.profiles set status = 'Aktif' where status is null;

-- Jaga agar full_name (dipakai frontend/Supabase) dan nama_lengkap (dipakai
-- API Go) selalu sinkron tanpa memaksa salah satu sisi berubah.
create or replace function public.sync_profile_nama()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.nama_lengkap is null then new.nama_lengkap := new.full_name; end if;
    if new.full_name is null then new.full_name := new.nama_lengkap; end if;
  else
    if new.nama_lengkap is distinct from old.nama_lengkap
       and new.full_name is not distinct from old.full_name then
      new.full_name := new.nama_lengkap;
    elsif new.full_name is distinct from old.full_name then
      new.nama_lengkap := new.full_name;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_nama on public.profiles;
create trigger trg_sync_profile_nama
  before insert or update on public.profiles
  for each row execute function public.sync_profile_nama();

-- ---------------------------------------------------------------------
-- 2. CLASSES: academic_year dipakai API Go & halaman Data Kelas
-- ---------------------------------------------------------------------
alter table public.classes add column if not exists academic_year text;

update public.classes c
set academic_year = t.nama
from public.tahun_ajaran t
where c.tahun_ajaran_id = t.id and c.academic_year is null;

update public.classes set academic_year = '2026/2027' where academic_year is null;

-- ---------------------------------------------------------------------
-- 3. SUBJECTS: category & grade
-- ---------------------------------------------------------------------
alter table public.subjects add column if not exists category text default 'Umum';
alter table public.subjects add column if not exists grade integer default 10;

update public.subjects set category = coalesce(kelompok, 'Umum') where category is null;
update public.subjects set grade = 10 where grade is null;

-- ---------------------------------------------------------------------
-- 4. TAHUN AJARAN: is_active (API) <-> aktif (kolom lama)
-- ---------------------------------------------------------------------
alter table public.tahun_ajaran add column if not exists is_active boolean default false;

update public.tahun_ajaran set is_active = coalesce(aktif, false) where is_active is distinct from coalesce(aktif, false);

create or replace function public.sync_tahun_ajaran_active()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.aktif := coalesce(new.is_active, new.aktif, false);
    new.is_active := coalesce(new.is_active, new.aktif, false);
  else
    if new.is_active is distinct from old.is_active then
      new.aktif := new.is_active;
    elsif new.aktif is distinct from old.aktif then
      new.is_active := new.aktif;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_tahun_ajaran_active on public.tahun_ajaran;
create trigger trg_sync_tahun_ajaran_active
  before insert or update on public.tahun_ajaran
  for each row execute function public.sync_tahun_ajaran_active();

-- ---------------------------------------------------------------------
-- 5. PRESENSI: pencatat
-- ---------------------------------------------------------------------
alter table public.presensi add column if not exists dicatat_oleh uuid references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------
-- 6. TUGAS: lampiran berkas
-- ---------------------------------------------------------------------
alter table public.tugas add column if not exists file_lampiran text;

-- ---------------------------------------------------------------------
-- 7. PENGUMPULAN TUGAS: catatan & waktu kumpul
-- ---------------------------------------------------------------------
alter table public.pengumpulan_tugas add column if not exists catatan_siswa text;
alter table public.pengumpulan_tugas add column if not exists waktu_kumpul timestamptz default now();

update public.pengumpulan_tugas set waktu_kumpul = created_at where waktu_kumpul is null;

-- ---------------------------------------------------------------------
-- 8. SOAL KUIS: kolom pilihan & kunci
-- ---------------------------------------------------------------------
alter table public.soal_kuis add column if not exists pilihan_a text;
alter table public.soal_kuis add column if not exists pilihan_b text;
alter table public.soal_kuis add column if not exists pilihan_c text;
alter table public.soal_kuis add column if not exists pilihan_d text;
alter table public.soal_kuis add column if not exists kunci_jawaban text;
alter table public.soal_kuis add column if not exists poin integer default 1;
alter table public.soal_kuis add column if not exists urutan integer default 1;

-- ---------------------------------------------------------------------
-- 9. HASIL KUIS: waktu pengerjaan
-- ---------------------------------------------------------------------
alter table public.hasil_kuis add column if not exists waktu_mulai timestamptz;
alter table public.hasil_kuis add column if not exists waktu_selesai timestamptz;

-- ---------------------------------------------------------------------
-- 10. TABEL YANG BELUM ADA
-- ---------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  aksi text not null,
  modul text,
  entitas text,
  entitas_id uuid,
  detail jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);
create index if not exists idx_activity_log_modul on public.activity_log(modul);

create table if not exists public.pengaturan (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.pengumuman (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  isi text not null,
  kategori text,
  penting boolean default false,
  dibuat_oleh uuid references public.profiles(id) on delete set null,
  target_kelas_id uuid references public.classes(id) on delete set null,
  target_role text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_pengumuman_created on public.pengumuman(created_at desc);

create table if not exists public.notifikasi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  judul text not null,
  isi text,
  jenis text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifikasi_user on public.notifikasi(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 11. HAK AKSES UNTUK TABEL BARU (PostgREST / Supabase client)
-- ---------------------------------------------------------------------
grant select, insert, update, delete on public.activity_log to anon, authenticated;
grant select, insert, update, delete on public.pengaturan to anon, authenticated;
grant select, insert, update, delete on public.pengumuman to anon, authenticated;
grant select, insert, update, delete on public.notifikasi to anon, authenticated;

-- ---------------------------------------------------------------------
-- 12. MUAT ULANG SKEMA POSTGREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';
