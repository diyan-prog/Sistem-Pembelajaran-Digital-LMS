package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/supabase-community/supabase-go"
)

var dbPool *pgxpool.Pool

// Auth middleware: validate Supabase JWT via REST /auth/v1/user, set "role" from profiles
func SupabaseAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		auth := c.Request().Header.Get("Authorization")
		if auth == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing Authorization header"})
		}
		token := strings.TrimPrefix(auth, "Bearer ")
		supabaseURL := os.Getenv("SUPABASE_URL")
		if supabaseURL == "" {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "SUPABASE_URL not set"})
		}
		req, err := http.NewRequest(http.MethodGet, supabaseURL+"/auth/v1/user", nil)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("apikey", os.Getenv("SUPABASE_ANON_KEY"))
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
		}
		body, _ := io.ReadAll(resp.Body)
		var user struct {
			ID    string `json:"id"`
			Email string `json:"email"`
		}
		if err := json.Unmarshal(body, &user); err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token response"})
		}
		// Lookup role from profiles table
		var role string
		err = dbPool.QueryRow(context.Background(), "SELECT role FROM profiles WHERE id = $1", user.ID).Scan(&role)
		if err != nil {
			role = "siswa"
		}
		c.Set("role", role)
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		return next(c)
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file, using system env")
	}

	var err error
	dbPool, err = pgxpool.New(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatalf("unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "pong"})
	})

	api := e.Group("/api")
	api.Use(SupabaseAuth)

	// existing student/teacher endpoints (brief)
	api.GET("/me", func(c echo.Context) error {
		userID := c.Get("user_id").(string)
		var name, email, role string
		dbPool.QueryRow(context.Background(), "SELECT full_name, email, role FROM profiles WHERE id = $1", userID).Scan(&name, &email, &role)
		return c.JSON(http.StatusOK, map[string]string{"id": userID, "name": name, "email": email, "role": role})
	})

	// admin routes
	RegisterAdminRoutes(api)

	addr := ":" + os.Getenv("PORT")
	if addr == ":" {
		addr = ":8080"
	}
	log.Printf("server running on %s", addr)
	if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
