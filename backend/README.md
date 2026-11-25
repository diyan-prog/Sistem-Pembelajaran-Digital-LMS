# Backend ClassIn

Backend Go berlapis untuk ClassIn, LMS SMK Negeri 2 Indramayu. Menyimpan konfigurasi Supabase di `backend/supabase/` dan API di dalam folder ini.

## Setup

```bash
cd backend
cp .env.example .env
```

Isi `.env` dengan nilai dari dashboard Supabase. Jangan mencatat `SUPABASE_SERVICE_ROLE_KEY` atau `DB_URL` ke git, log, response, maupun frontend. `config.Load()` gagal cepat bila `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, atau `DB_URL` kosong.

Variabel env:

| Nama | Wajib | Keterangan |
|---|---|---|
| `PORT` | tidak | Default `8080` |
| `SUPABASE_URL` | ya | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | Hanya dipakai backend |
| `SUPABASE_JWT_SECRET` | ya | Verifikasi JWT Supabase (HS256/384/512) |
| `DB_URL` | ya | Koneksi PostgreSQL |
| `APP_ORIGIN` | tidak | Default `*` |
| `TZ` | tidak | Default `Asia/Jakarta` |
| `RATE_LIMIT_MAX` | tidak | Default `100` |
| `RATE_LIMIT_WINDOW` | tidak | Default `60` detik |

## Jalankan

```bash
make run     # build + jalankan
make build   # build ke bin/api
make test    # go test ./...
make vet     # go vet ./...
make lint    # golangci-lint run
make tidy    # go mod tidy
```

## Endpoint

Semua endpoint baru berada di `/api/v1`. Path lama dipertahankan sebagai alias dengan komentar `// deprecated` dan mengembalikan bentuk JSON lama (tanpa pembungkus).

| Method | Path baru | Alias lama | Hak akses |
|---|---|---|---|
| GET | `/api/v1/health` | `GET /ping` | publik |
| GET | `/api/v1/me` | `GET /api/me` | terautentikasi |
| GET | `/api/v1/admin/profiles` | `GET /api/admin/profiles` | admin_all, admin, tu, kepsek |
| POST | `/api/v1/admin/profiles` | `POST /api/admin/profiles` | sama |
| PUT | `/api/v1/admin/profiles/:id` | `PUT /api/admin/profiles/:id` | sama |
| DELETE | `/api/v1/admin/profiles/:id` | `DELETE /api/admin/profiles/:id` | sama |
| GET/POST | `/api/v1/admin/dashboard`, `/api/v1/admin/classes`, `/api/v1/admin/jurusan`, `/api/v1/admin/mapel`, `/api/v1/admin/siswa`, `/api/v1/admin/guru`, `/api/v1/admin/jadwal`, `/api/v1/admin/log` | `/api/admin/...` | sama |
| PUT/DELETE | `/api/v1/admin/classes/:id`, `.../jurusan/:id`, `.../mapel/:id`, `.../siswa/:id`, `.../guru/:id`, `.../jadwal/:id` | `/api/admin/...` | sama |
| POST | `/api/v1/admin/users` | - | super_admin, tata_usaha, tu |

`POST /api/v1/admin/users` menerima `action`: `create`, `update-role`, `update-status`, `reset-password`. Endpoint ini menggantikan logika `supabase/functions/admin-users/index.ts` di sisi Go. Edge Function masih dipertahankan sampai frontend dialihkan.

Respons baru:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": null
}
```

Error: `400` validasi, `401` tidak login, `403` bukan haknya, `404` tidak ditemukan, `409` konflik, `500` internal.

Wali kelas bukan role; penugasan wali kelas tersimpan di tabel `wali_kelas`.

## Alur request

```
Request
  -> CORS
  -> RateLimit
  -> Logger/Recover
  -> Auth (verifikasi JWT Supabase; set user_id + role)
  -> RBAC (RequireRole)
  -> Controller (binding + validasi ringan + status HTTP)
  -> Service (aturan bisnis; tidak mengimpor HTTP)
  -> Repository (pgx / Supabase Admin API)
  -> PostgreSQL / Supabase Auth
  -> views.Response
```

## Supabase

Perintah migrasi dan seed tetap dijalankan dari root repo dengan `--workdir backend`, seperti dijelaskan di `backend/supabase/README.md`. Jangan mengubah `migrations/`, `seed.sql`, atau skema database tanpa migrasi baru.
