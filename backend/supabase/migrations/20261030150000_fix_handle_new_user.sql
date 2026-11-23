create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, nama_lengkap, role)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'nama_lengkap', split_part(new.email, '@', 1)),
    coalesce(
        case lower(new.raw_user_meta_data->>'role')
            when 'siswa' then 'Siswa'::public.user_role
            when 'guru mapel' then 'Guru Mapel'::public.user_role
            when 'wali kelas' then 'Wali Kelas'::public.user_role
            when 'kepala sekolah' then 'Kepala Sekolah'::public.user_role
            when 'tata usaha' then 'Tata Usaha'::public.user_role
            else 'Siswa'::public.user_role
        end,
        'Siswa'::public.user_role
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
