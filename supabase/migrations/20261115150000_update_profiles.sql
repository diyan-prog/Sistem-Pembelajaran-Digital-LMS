alter table public.profiles add column if not exists hp text;
alter table public.profiles add column if not exists alamat text;
alter table public.profiles add column if not exists preferensi jsonb default '{}'::jsonb;
