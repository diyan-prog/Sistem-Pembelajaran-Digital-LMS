-- =========================================================================
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- =========================================================================

create extension if not exists "uuid-ossp";

-- Helper function: Check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Trigger function: Automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;


-- =========================================================================
-- 2. TABLES
-- =========================================================================

-- 2.1 Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 2.2 Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  tech_stack text[] default '{}'::text[],
  demo_url text,
  repo_url text,
  is_featured boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_is_featured on public.projects(is_featured);
create index if not exists idx_projects_sort_order on public.projects(sort_order);


-- 2.3 Skills Table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level integer check (level >= 0 and level <= 100) not null default 50,
  icon text,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_skills_category on public.skills(category);
create index if not exists idx_skills_sort_order on public.skills(sort_order);


-- 2.4 Messages Table (Contact Form)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_messages_is_read on public.messages(is_read);
create index if not exists idx_messages_created_at on public.messages(created_at desc);


-- 2.5 Message Replies Table
create table if not exists public.message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reply_message text not null,
  sent_by uuid not null references public.profiles(id) on delete cascade,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_message_replies_message_id on public.message_replies(message_id);


-- =========================================================================
-- 3. TRIGGERS
-- =========================================================================

drop trigger if exists on_projects_updated_at on public.projects;
create trigger on_projects_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();


-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.messages enable row level security;
alter table public.message_replies enable row level security;


-- 4.1 Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());


-- 4.2 Projects Policies
create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Only admins can insert projects"
  on public.projects for insert
  with check (public.is_admin());

create policy "Only admins can update projects"
  on public.projects for update
  using (public.is_admin());

create policy "Only admins can delete projects"
  on public.projects for delete
  using (public.is_admin());


-- 4.3 Skills Policies
create policy "Skills are viewable by everyone"
  on public.skills for select
  using (true);

create policy "Only admins can insert skills"
  on public.skills for insert
  with check (public.is_admin());

create policy "Only admins can update skills"
  on public.skills for update
  using (public.is_admin());

create policy "Only admins can delete skills"
  on public.skills for delete
  using (public.is_admin());


-- 4.4 Messages Policies
create policy "Anyone can insert messages (contact form)"
  on public.messages for insert
  with check (true);

create policy "Only admins can view messages"
  on public.messages for select
  using (public.is_admin());

create policy "Only admins can update messages"
  on public.messages for update
  using (public.is_admin());

create policy "Only admins can delete messages"
  on public.messages for delete
  using (public.is_admin());


-- 4.5 Message Replies Policies
create policy "Only admins can view message replies"
  on public.message_replies for select
  using (public.is_admin());

create policy "Only admins can insert message replies"
  on public.message_replies for insert
  with check (public.is_admin());

create policy "Only admins can update message replies"
  on public.message_replies for update
  using (public.is_admin());

create policy "Only admins can delete message replies"
  on public.message_replies for delete
  using (public.is_admin());
