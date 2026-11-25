package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/supabase-community/supabase-go"
)

type UserProfile struct {
	ID        string  `json:"id"`
	FullName  *string `json:"full_name"`
	Role      *string `json:"role"`
	Status    *string `json:"status"`
}

type Mapel struct {
	ID   string `json:"id"`
	Nama string `json:"nama"`
	Kode string `json:"kode"`
}

func main() {
	godotenv.Load()

	// Pakai Pool biar lebih stabil buat banyak request
	dbURL := os.Getenv("DB_URL")
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Gagal buat pool DB: %v", err)
	}
	defer dbPool.Close()

	// Supabase Client
	sbClient, err := supabase.NewClient(
		os.Getenv("SUPABASE_URL"),
		os.Getenv("SUPABASE_ANON_KEY"),
		nil,
	)
	if err != nil {
		log.Fatalf("Gagal inisialisasi Supabase: %v", err)
	}

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Health Check
	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "Golang Backend Ready")
	})

	// Group API
	api := e.Group("/api")

	// Endpoint Guru
	api.GET("/guru", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), 
			"SELECT id, full_name, role, status FROM profiles WHERE role = 'GURU'")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []UserProfile
		for rows.Next() {
			var u UserProfile
			if err := rows.Scan(&u.ID, &u.FullName, &u.Role, &u.Status); err != nil {
				continue
			}
			list = append(list, u)
		}
		return c.JSON(http.StatusOK, list)
	})

	// Endpoint Siswa
	api.GET("/siswa", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), 
			"SELECT id, full_name, role, status FROM profiles WHERE role = 'SISWA'")
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		defer rows.Close()

		var list []UserProfile
		for rows.Next() {
			var u UserProfile
			if err := rows.Scan(&u.ID, &u.FullName, &u.Role, &u.Status); err != nil {
				continue
			}
			list = append(list, u)
		}
		return c.JSON(http.StatusOK, list)
	})

	// Endpoint Mata Pelajaran (Mapel)
	api.GET("/mapel", func(c echo.Context) error {
		rows, err := dbPool.Query(context.Background(), "SELECT id, nama, kode FROM mata_pelajaran")
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

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	_ = sbClient // avoid unused warning
	e.Logger.Fatal(e.Start(":" + port))
}
