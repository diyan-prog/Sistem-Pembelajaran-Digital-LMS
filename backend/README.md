# Backend Supabase

Konfigurasi database, migrasi, seed, dan Edge Function untuk project Supabase LMS SMK Negeri 2 Indramayu.

## Lokasi

Semua konfigurasi Supabase berada di `backend/supabase/`. Supabase CLI mencari folder `supabase/` dari direktori kerja, jadi jalankan perintah dari root repo dengan flag `--workdir backend`.

## Prasyarat

- Supabase CLI
- Akses ke project Supabase yang dituju
- Cadangan database sebelum mengubah skema remote

## Perintah

```bash
# dari root repo
supabase --workdir backend login
supabase --workdir backend link --project-ref <project-ref>

# terapkan migrasi ke database remote
supabase --workdir backend db push

# jalankan stack lokal
supabase --workdir backend start

# deploy Edge Function operasi pengguna
supabase --workdir backend functions deploy admin-users

# perbarui tipe TypeScript frontend
supabase --workdir backend gen types typescript --linked > frontend/src/types/database.types.ts
```

Seed tidak dijalankan otomatis oleh `db push`. Untuk mengisi data contoh, buka `backend/supabase/seed.sql`, lalu jalankan isinya melalui SQL Editor Supabase atau `psql`.

## Edge Function

`backend/supabase/functions/admin-users/index.ts` menangani pembuatan pengguna, perubahan role/status, dan reset kata sandi. Fungsi memverifikasi sesi pemanggil, lalu memakai service-role key di server.

Environment yang dibutuhkan:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Service-role key tidak boleh berada di frontend. Frontend memanggil fungsi ini lewat `frontend/src/services/admin.ts`.

## Peringatan

`db push` mengubah skema database remote. Tinjau migrasi terlebih dahulu dan pastikan sudah memiliki cadangan. Rotasi service-role key yang pernah tercatat di riwayat Git melalui dashboard Supabase.
