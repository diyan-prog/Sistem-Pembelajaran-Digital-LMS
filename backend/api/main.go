package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/supabase-community/supabase-go"
)

func main() {
	godotenv.Load()

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL belum diset di environment")
	}

	conn, err := pgx.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Gagal konek DB: %v", err)
	}
	defer conn.Close(context.Background())

	client, err := supabase.NewClient(
		os.Getenv("SUPABASE_URL"),
		os.Getenv("SUPABASE_ANON_KEY"),
		nil,
	)
	if err != nil {
		log.Fatalf("Gagal inisialisasi Supabase client: %v", err)
	}
	_ = client

	e := echo.New()

	e.GET("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "Pong! Golang + Supabase aktif.")
	})

	e.GET("/health", func(c echo.Context) error {
		err := conn.Ping(context.Background())
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]any{
				"status": "error",
				"db":     err.Error(),
			})
		}
		return c.JSON(http.StatusOK, map[string]any{
			"status": "ok",
			"db":     "connected",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server jalan di port %s", port)
	e.Logger.Fatal(e.Start(":" + port))
}
