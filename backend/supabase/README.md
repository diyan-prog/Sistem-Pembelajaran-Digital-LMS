# Supabase — Database dan Edge Function

Folder ini berisi konfigurasi, migrasi, seed, dan Edge Function untuk project Supabase LMS SMK Negeri 2 Indramayu.

## Struktur

- `config.toml` — konfigurasi Supabase CLI (API, database, Studio, Auth, Storage).
- `migrations/` — skema PostgreSQL, RLS, view, fungsi, dan trigger.
- `seed.sql` — data contoh untuk jurusan, tahun ajaran, kelas, dan mata pelajaran.
- `functions/admin-users/` — Edge Function untuk operasi istimewa pengguna.

## Prasyarat

- Supabase CLI
- Akses ke project Supabase tujuan
- Cadangan database sebelum `db push`

Jalankan perintah dari root repo dengan flag `--workdir backend`.

## Perintah

```bash
supabase --workdir backend login
supabase --workdir backend link --project-ref <project-ref>

# tinjau migrasi sebelum mengubah database remote
supabase --workdir backend db push

# jalankan stack lokal
supabase --workdir backend start

# perbarui tipe TypeScript frontend
supabase --workdir backend gen types typescript --linked > frontend/src/types/database.types.ts
```

Seed tidak dijalankan otomatis oleh `db push`. Untuk mengisi data contoh, jalankan isi `seed.sql` melalui SQL Editor atau `psql`.

## Edge Function `admin-users`

Fungsi ini menangani pembuatan pengguna Auth, perubahan role, perubahan status, dan reset kata sandi. Frontend memanggilnya melalui `frontend/src/services/admin.ts`.

```bash
supabase --workdir backend functions deploy admin-users
```

Fungsi membutuhkan environment server berikut:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Service-role key hanya boleh berada di environment server. Jangan pernah memasukkannya ke `frontend/.env` atau variabel `VITE_*`.

## Peringatan

`db push` mengubah skema database remote. Tinjau migrasi dan buat cadangan terlebih dahulu. Service-role key yang pernah tercatat di riwayat Git harus dirotasi di dashboard Supabase.
