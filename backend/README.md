# Backend Supabase

Konfigurasi database, migrasi, dan seed untuk project Supabase LMS SMK Negeri 2 Indramayu.

## Lokasi

Semua konfigurasi Supabase berada di `backend/supabase/`. Supabase CLI mencari folder `supabase/` dari direktori kerja, jadi jalankan perintah dari root repo dengan flag `--workdir backend`.

## Prasyarat

- Supabase CLI
- Akses ke project Supabase yang dituju

## Perintah

```bash
# dari root repo
supabase --workdir backend login
supabase --workdir backend link --project-ref <project-ref>

# terapkan migrasi ke database remote
supabase --workdir backend db push

# jalankan stack lokal
supabase --workdir backend start
```

Seed tidak dijalankan otomatis oleh `db push`. Untuk mengisi data contoh, buka `backend/supabase/seed.sql`, lalu jalankan isinya melalui SQL Editor Supabase atau `psql`.

## Peringatan

`db push` mengubah skema database remote. Tinjau migrasi terlebih dahulu dan pastikan sudah memiliki cadangan.
