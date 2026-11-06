-- =============================================================================
-- SEED DATA — SKIP IF ALREADY RUNNING
-- IMPORTANT: Do NOT insert into auth.users. Follow the steps in README.md
-- to create an admin user first, then manually set their role via SQL.
-- =============================================================================

-- -- STEP 1: Create an admin user via Supabase Dashboard first:
-- --    Go to Authentication > Users > "Add User" > enter email & password.
-- --    Then set their role via SQL (with the user's UUID from the user you just created):
--
--    insert into public.profiles (id, full_name, role)
--    values ('<YOUR-USER-UUID-HERE>', 'Admin Portfolio', 'admin');
--
-- =============================================================================

begin;

  -- =============================================================================
  -- PROJECTS
  -- =============================================================================

  insert into public.projects (id, title, slug, description, image_url, tech_stack, demo_url, repo_url, is_featured, sort_order)
  values
    (gen_random_uuid(), 'Sistem Pembelajaran Digital SMKN 2', 'lms-smkn2',
     'LMS sekolah berbasis React + Vite untuk pembelajaran daring siswa, guru, wali kelas, kepala sekolah, dan TU. Dilengkapi kuis online, presensi digital, dan chatbot AI.',
     null,
     array['React','TypeScript','Tailwind CSS','Vite','React Router'],
     'https://smkn2indramayu.sch.id',
     'https://github.com/smkn2indramayu/lms',
     true, 1),

    (gen_random_uuid(), 'Dashboard Monitoring Kelas', 'monitoring-kelas',
     'Dashboard real-time untuk guru memantau kehadiran siswa dan progres belajar per kelas. Dilengkapi visualisasi data menggunakan Recharts.',
     null,
     array['React','TypeScript','Recharts','Tailwind CSS'],
     null,
     null,
     true, 2),

    (gen_random_uuid(), 'Portal Berita Sekolah', 'portal-berita',
     'Website portal berita sekolah dengan fitur CRUD artikel, kategori, dan galeri foto. Dilengkapi sistem komentar dan notifikasi.',
     null,
     array['React','TypeScript','Tailwind CSS','Node.js','Express'],
     null,
     null,
     true, 3),

    (gen_random_uuid(), 'Sistem Informasi Perpustakaan', 'sistem-perpustakaan',
     'Aplikasi manajemen perpustakaan sekolah untuk mengelola inventaris buku, peminjaman, dan pengembalian secara digital.',
     null,
     array['React','TypeScript','Tailwind CSS','JSON Server'],
     null,
     null,
     false, 4),

    (gen_random_uuid(), 'Aplikasi Kuis Interaktif', 'kuis-interaktif',
     'Aplikasi kuis online dengan timer, randomisasi soal, dan sistem scoring otomatis. Cocok untuk evaluasi belajar siswa.',
     null,
     array['React','TypeScript','Tailwind CSS','Zustand'],
     null,
     null,
     false, 5),

    (gen_random_uuid(), 'Sistem Pendataan Alumni', 'sistem-alumni',
     'Web app untuk mengelola data alumni sekolah,Tracer Study, dan lowongan kerja. Dilengkapi dashboard analitik dan export laporan.',
     null,
     array['React','TypeScript','Tailwind CSS','Recharts'],
     null,
     null,
     false, 6)
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    tech_stack = excluded.tech_stack,
    is_featured = excluded.is_featured,
    sort_order = excluded.sort_order;

  -- =============================================================================
  -- SKILLS
  -- =============================================================================

  insert into public.skills (id, name, category, level, icon, sort_order)
  values
    -- Frontend
    (gen_random_uuid(), 'HTML & CSS', 'Frontend', 95, 'code', 1),
    (gen_random_uuid(), 'JavaScript', 'Frontend', 90, 'terminal', 2),
    (gen_random_uuid(), 'TypeScript', 'Frontend', 88, 'file-code', 3),
    (gen_random_uuid(), 'React JS', 'Frontend', 92, 'atom', 4),
    (gen_random_uuid(), 'Tailwind CSS', 'Frontend', 93, 'wind', 5),
    (gen_random_uuid(), 'Next.js', 'Frontend', 75, 'globe', 6),

    -- Tools & DevOps
    (gen_random_uuid(), 'Git & GitHub', 'Tools', 90, 'git-branch', 7),
    (gen_random_uuid(), 'Vite', 'Tools', 85, 'zap', 8),
    (gen_random_uuid(), 'Figma', 'Design', 78, 'pen-tool', 9),
    (gen_random_uuid(), 'VS Code', 'Tools', 95, 'monitor', 10)
  on conflict do nothing;

  -- =============================================================================
  -- MESSAGES (Sample contact form submissions)
  -- =============================================================================

  insert into public.messages (id, name, email, subject, message, is_read, created_at)
  values
    (gen_random_uuid(), 'Andi Wijaya', 'andi.wijaya@email.com',
     'Permintaan Kerjasama Pengembangan LMS',
     'Halo, kami dari tim IT SMKN 1 Indramayu tertarik untuk berkarya sama dalam pengembangan LMS ini. Apakah tersedia sesi demo atau dokumentasi API?',
     false, timezone('utc'::text, now()) - interval '3 days'),

    (gen_random_uuid(), 'Dewi Kartika', 'dewi.kartika@siswa.smkn2indramayu.sch.id',
     'Kendala Login Siswa',
     'Selamat pagi, saya mengalami kendala saat login menggunakan NIS. Sudah mencoba reset password tapi tetap tidak bisa. Mohon bantuannya.',
     true, timezone('utc'::text, now()) - interval '1 day'),

    (gen_random_uuid(), 'Bapak Hendra', 'hendra.ortu@email.com',
     'Akses Akun Wali Kelas',
     'Saya orang tua dari siswa atas nama Rina Aulia. Bagaimana cara mendapatkan akses akun wali kelas untuk memantau perkembangan anak saya?',
     false, timezone('utc'::text, now()) - interval '6 hours')
  on conflict do nothing;

  -- =============================================================================
  -- MESSAGE REPLIES (Admin replies — NOTE: Use a real admin profile UUID)
  -- =============================================================================

  -- First get a project id for message_replies (from above insert)
  -- Only insert if we have a message (idempotent)
  do $$
  declare
    msg_id_1 uuid;
    msg_id_2 uuid;
    admin_id uuid;
  begin
    select id into msg_id_1 from public.messages where subject = 'Permintaan Kerjasama Pengembangan LMS' limit 1;
    select id into msg_id_2 from public.messages where subject = 'Kendala Login Siswa' limit 1;
    select id into admin_id from public.profiles where role = 'admin' limit 1;

    if msg_id_1 is not null then
      insert into public.message_replies (id, message_id, reply_message, sent_by, sent_at)
      values (gen_random_uuid(), msg_id_1,
              'Halo Andi, terima kasih atas minatnya. Untuk sesi demo, silakan hubungi bagian IT sekolah langsung. Dokumentasi API dapat diminta melalui email resmi sekolah.',
              admin_id, timezone('utc'::text, now()) - interval '2 days')
      on conflict do nothing;
    end if;

    if msg_id_2 is not null then
      insert into public.message_replies (id, message_id, reply_message, sent_by, sent_at)
      values (gen_random_uuid(), msg_id_2,
              'Halo Dewi, masalah login NIS sudah kami tangani. Silakan coba login kembali. Jika masih terkendala, silakan hubungi Tata Usaha.',
              admin_id, timezone('utc'::text, now()) - interval '12 hours')
      on conflict do nothing;
    end if;
  end;
  $$;


  -- =============================================================================
  -- PROFILES (Sample — normally created via Auth trigger)
  -- =============================================================================

  -- Uncomment and fill in real UUIDs after creating users in Supabase Dashboard.
  -- Do NOT insert fake auth.users. Profiles should be created by an Auth trigger.
  --
  -- insert into public.profiles (id, full_name, role)
  -- values
  --   ('11111111-1111-1111-1111-111111111111', 'Admin Portfolio', 'admin'),
  --   ('22222222-2222-2222-2222-222222222222', 'User Contoh', 'user')
  -- on conflict do nothing;

commit;
