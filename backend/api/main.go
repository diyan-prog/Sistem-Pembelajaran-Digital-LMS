package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Siswa struct {
	ID      string  `json:"id"`
	Nama    *string `json:"nama"`
	NIS     *string `json:"nis"`
	Email   *string `json:"email"`
	Status  *string `json:"status"`
	KelasID *string `json:"kelas_id"`
	Kelas   *string `json:"kelas"`
}

type Guru struct {
	ID      string  `json:"id"`
	Nama    *string `json:"nama"`
	NIP     *string `json:"nip"`
	Email   *string `json:"email"`
	Status  *string `json:"status"`
}

type Mapel struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
	Kode string `json:"kode"`
}

type PengumumanGo struct {
	ID             string   `json:"id"`
	Judul          string   `json:"judul"`
	Isi            string   `json:"isi"`
	Kategori       *string  `json:"kategori"`
	Penting        bool     `json:"penting"`
	DibuatOleh     *string  `json:"dibuat_oleh"`
	DibuatOlehNama *string  `json:"dibuat_oleh_nama"`
	TargetRole     *string  `json:"target_role"`
	CreatedAt      string   `json:"created_at"`
}

type SiswaPengampuGo struct {
	IDPengampu    string  `json:"id_pengampu"`
	MapelName     string  `json:"mapel_name"`
	MapelCode     string  `json:"mapel_code"`
	GuruName      *string `json:"guru_name"`
	KelasName     string  `json:"kelas_name"`
	TahunAjaran   *string `json:"tahun_ajaran"`
}

type Kelas struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
}

type SupabaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

func SupabaseAuth() echo.MiddlewareFunc {
	sbURL := os.Getenv("SUPABASE_URL")
	anonKey := os.Getenv("SUPABASE_ANON_KEY")

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing token"})
			}

			token := strings.TrimPrefix(authHeader, "Bearer ")

			req, _ := http.NewRequest("GET", sbURL+"/auth/v1/user", nil)
			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("apikey", anonKey)

			resp, err := http.DefaultClient.Do(req)
			if err != nil || resp.StatusCode != 200 {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
			}
			defer resp.Body.Close()

			var user SupabaseUser
			json.NewDecoder(resp.Body).Decode(&user)

			c.Set("user", user)
			return next(c)
		}
	}
}

func main() {
	godotenv.Load()

	dbURL := os.Getenv("DB_URL")
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Gagal buat pool DB: %v", err)
	}
	defer dbPool.Close()

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "Golang Backend Ready")
	})

	api := e.Group("/api")
	api.Use(SupabaseAuth())

	api.GET("/me", func(c echo.Context) error {
		return c.JSON(http.StatusOK, c.Get("user"))
	})

	// ---------- SISWA ----------
	// GET semua siswa (join ke kelas)
	api.GET("/siswa", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), `
			SELECT p.id, p.full_name, p.nip_nis, p.email, p.status, sk.id_kelas, cl.name
			FROM profiles p
			LEFT JOIN siswa_kelas sk ON sk.id_siswa = p.id
			LEFT JOIN classes cl ON cl.id = sk.id_kelas
			WHERE p.role = 'siswa'
		`)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []Siswa
		for rows.Next() {
			var s Siswa
			if err := rows.Scan(&s.ID, &s.Nama, &s.NIS, &s.Email, &s.Status, &s.KelasID, &s.Kelas); err != nil {
				continue
			}
			list = append(list, s)
		}
		return c.JSON(http.StatusOK, list)
	})

	// GET siswa by ID
	api.GET("/siswa/:id", func(c echo.Context) error {
		id := c.Param("id")
		var s Siswa
		err := dbPool.QueryRow(context.Background(), `
			SELECT p.id, p.full_name, p.nip_nis, p.email, p.status, sk.id_kelas, cl.name
			FROM profiles p
			LEFT JOIN siswa_kelas sk ON sk.id_siswa = p.id
			LEFT JOIN classes cl ON cl.id = sk.id_kelas
			WHERE p.id = $1 AND p.role = 'siswa'
		`, id).Scan(&s.ID, &s.Nama, &s.NIS, &s.Email, &s.Status, &s.KelasID, &s.Kelas)
		if err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "siswa tidak ditemukan"})
		}
		return c.JSON(http.StatusOK, s)
	})

	// POST tambah siswa
	api.POST("/siswa", func(c echo.Context) error {
		type SiswaInput struct {
			Nama    string `json:"nama"`
			NIS     string `json:"nis"`
			Email   string `json:"email"`
			KelasID string `json:"kelas_id"`
			Status  string `json:"status"`
		}

		var input SiswaInput
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}

		var siswaID string
		err := dbPool.QueryRow(context.Background(),
			"INSERT INTO profiles (full_name, email, role, status, nip_nis) VALUES ($1, $2, $3, $4, $5) RETURNING id",
			input.Nama, input.Email, "siswa", input.Status, input.NIS).Scan(&siswaID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		_, err = dbPool.Exec(context.Background(),
			"INSERT INTO siswa_kelas (id_siswa, id_kelas, tahun_ajaran) VALUES ($1, $2, $3)",
			siswaID, input.KelasID, "2026/2027")
		if err != nil {
			dbPool.Exec(context.Background(), "DELETE FROM profiles WHERE id = $1", siswaID)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusCreated, map[string]string{"id": siswaID})
	})

	// PUT update siswa
	api.PUT("/siswa/:id", func(c echo.Context) error {
		type SiswaInput struct {
			Nama    string `json:"nama"`
			NIS     string `json:"nis"`
			Email   string `json:"email"`
			KelasID string `json:"kelas_id"`
			Status  string `json:"status"`
		}

		id := c.Param("id")
		var input SiswaInput
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}

		_, err := dbPool.Exec(context.Background(),
			"UPDATE profiles SET full_name = $1, email = $2, nip_nis = $3, status = $4 WHERE id = $5",
			input.Nama, input.Email, input.NIS, input.Status, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		// Hapus kelas lama lalu insert baru (aman untuk PK majemuk)
		_, err = dbPool.Exec(context.Background(), "DELETE FROM siswa_kelas WHERE id_siswa = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		_, err = dbPool.Exec(context.Background(),
			"INSERT INTO siswa_kelas (id_siswa, id_kelas, tahun_ajaran) VALUES ($1, $2, $3)",
			id, input.KelasID, "2026/2027")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "siswa diupdate"})
	})

	// DELETE siswa
	api.DELETE("/siswa/:id", func(c echo.Context) error {
		id := c.Param("id")

		_, err := dbPool.Exec(context.Background(), "DELETE FROM siswa_kelas WHERE id_siswa = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		_, err = dbPool.Exec(context.Background(), "DELETE FROM profiles WHERE id = $1", id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "siswa dihapus"})
	})

	// ---------- GURU ----------
	api.GET("/guru", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), 
			"SELECT id, full_name, nip_nis, email, status FROM profiles WHERE role = 'guru'")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []Guru
		for rows.Next() {
			var g Guru
			if err := rows.Scan(&g.ID, &g.Nama, &g.NIP, &g.Email, &g.Status); err != nil {
				continue
			}
			list = append(list, g)
		}
		return c.JSON(http.StatusOK, list)
	})

	// ---------- MAPEL (subjects) ----------
	api.GET("/mapel", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), "SELECT id, name, code FROM subjects ORDER BY name")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []Mapel
		for rows.Next() {
			var m Mapel
			if err := rows.Scan(&m.ID, &m.Nama, &m.Kode); err != nil {
				continue
			}
			list = append(list, m)
		}
		return c.JSON(http.StatusOK, list)
	})

	// ---------- KELAS ----------
	api.GET("/kelas", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), "SELECT id, name FROM classes ORDER BY name")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []Kelas
		for rows.Next() {
			var k Kelas
			if err := rows.Scan(&k.ID, &k.Nama); err != nil {
				continue
			}
			list = append(list, k)
		}
		return c.JSON(http.StatusOK, list)
	})

	// ---------- PENGUMUMAN (siswa) ----------
	api.GET("/pengumuman", func(c echo.Context) error {
		role := c.QueryParam("role")
		rows, err := dbPool.Query(context.Background(), `
			SELECT p.id, p.judul, p.isi, p.kategori, p.penting,
			       p.dibuat_oleh, pr.nama_lengkap, p.target_role, p.created_at
			FROM pengumuman p
			LEFT JOIN profiles pr ON pr.id = p.dibuat_oleh
			WHERE p.target_role IS NULL OR p.target_role = 'all' OR p.target_role = $1
			ORDER BY p.created_at DESC
			LIMIT 20
		`, role)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []PengumumanGo
		for rows.Next() {
			var p PengumumanGo
			if err := rows.Scan(&p.ID, &p.Judul, &p.Isi, &p.Kategori, &p.Penting,
				&p.DibuatOleh, &p.DibuatOlehNama, &p.TargetRole, &p.CreatedAt); err != nil {
				continue
			}
			list = append(list, p)
		}
		return c.JSON(http.StatusOK, list)
	})

	// ---------- SISWA PENGAMPU (kelas yang diikuti siswa) ----------
	api.GET("/siswa/:id/pengampu", func(c echo.Context) error {
		id := c.Param("id")
		rows, err := dbPool.Query(context.Background(), `
			SELECT p.id_pengampu, s.name, s.code, g.full_name, cl.name, sk.tahun_ajaran
			FROM siswa_kelas sk
			JOIN classes cl ON cl.id = sk.id_kelas
			JOIN pengampu p ON p.id_kelas = sk.id_kelas
			JOIN subjects s ON s.id = p.id_mapel
			LEFT JOIN profiles g ON g.id = p.id_guru
			WHERE sk.id_siswa = $1
		`, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []SiswaPengampuGo
		for rows.Next() {
			var p SiswaPengampuGo
			if err := rows.Scan(&p.IDPengampu, &p.MapelName, &p.MapelCode, &p.GuruName, &p.KelasName, &p.TahunAjaran); err != nil {
				continue
			}
			list = append(list, p)
		}
		return c.JSON(http.StatusOK, list)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on port %s\n", port)
	e.Logger.Fatal(e.Start(":" + port))
}
