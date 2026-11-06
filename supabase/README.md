# Supabase Local Development

Folder ini berisi konfigurasi, migrasi, dan data contoh untuk database project **LMS SMK Negeri 2 Indramayu**.

## Struktur Folder
- `config.toml`: Konfigurasi dasar Supabase CLI (port, auth, api).
- `migrations/`: Script SQL untuk membuat schema database.
- `seed.sql`: Data contoh (projects, skills, messages).

## Persiapan
Pastikan sudah install [Supabase CLI](https://supabase.com/docs/guides/cli).
Project Reference: `phtqlmidfaocacphblej`

## Perintah Penting (JANGAN dijalankan sembarangan)

### 1. Login & Inisialisasi
```bash
# Login ke akun Supabase
supabase login

# Hubungkan dengan project remote
supabase link --project-ref phtqlmidfaocacphblej
```

### 2. Sinkronisasi Schema (Migration)
```bash
# Jalankan migrasi ke project remote yang sudah di-link
# PERINGATAN: Ini akan mengubah schema di database remote.
supabase db push
```

### 3. Sinkronisasi Data (Seed)
Migrasi hanya membawa schema (tabel/fungsi). Untuk mengisi data dari `seed.sql` ke database remote:
1. Copy isi `seed.sql`.
2. Buka **Supabase Dashboard** > **SQL Editor**.
3. Paste dan jalankan query tersebut.
4. **Catatan**: Data di `seed.sql` didesain idempotent (`on conflict do nothing`).

## Penting: Cara Membuat User Admin
1. Buka **Authentication** > **Users** di Supabase Dashboard.
2. Klik **Add User** > masukkan email & password.
3. Setelah user dibuat, copy **User UUID**.
4. Buka **SQL Editor**, jalankan query berikut:
```sql
insert into public.profiles (id, full_name, role)
values ('<COPAS-UUID-USER-DI-SINI>', 'Nama Admin', 'admin');
```
5. User tersebut sekarang memiliki hak akses admin untuk CRUD Projects & Skills.

## Tabel & RLS Ringkasan
- `profiles`: User management & roles.
- `projects`: Data karya/proyek (Select: public, Manage: admin).
- `skills`: Daftar keahlian (Select: public, Manage: admin).
- `messages`: Inbox pesan kontak (Insert: anon, Select/Manage: admin).
- `message_replies`: Balasan pesan dari admin.
