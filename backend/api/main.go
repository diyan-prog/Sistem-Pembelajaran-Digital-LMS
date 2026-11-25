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

			// Tembak endpoint Supabase Auth buat validasi token
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on port %s\n", port)
	e.Logger.Fatal(e.Start(":" + port))
}