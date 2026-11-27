package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	SupabaseURL    string
	ServiceRoleKey string
	JWTSecret      string
	AppOrigin      string
	TZ             string
	DBURL          string
}

// envFiles adalah lokasi .env yang dicoba berurutan. Berkas pertama yang
// ditemukan menang karena godotenv tidak menimpa variabel yang sudah ada.
// Urutan ini membuat `go run cmd/api/main.go` tetap jalan baik dari direktori
// backend maupun dari akar repositori.
var envFiles = []string{
	".env",
	"api/.env",
	"backend/.env",
	"backend/api/.env",
	"../.env",
	"../api/.env",
}

func Load() (*Config, error) {
	loadEnv()

	c := &Config{
		Port:           env("PORT", "8080"),
		SupabaseURL:    strings.TrimRight(os.Getenv("SUPABASE_URL"), "/"),
		ServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		JWTSecret:      strings.TrimSpace(os.Getenv("SUPABASE_JWT_SECRET")),
		AppOrigin:      env("APP_ORIGIN", "*"),
		TZ:             env("TZ", "Asia/Jakarta"),
		DBURL:          os.Getenv("DB_URL"),
	}

	// SUPABASE_JWT_SECRET boleh kosong: middleware akan memverifikasi token
	// lewat Supabase Auth (/auth/v1/user) memakai service role key.
	required := []struct{ name, value string }{
		{"SUPABASE_URL", c.SupabaseURL},
		{"SUPABASE_SERVICE_ROLE_KEY", c.ServiceRoleKey},
		{"DB_URL", c.DBURL},
	}
	missing := make([]string, 0, len(required))
	for _, item := range required {
		if item.value == "" {
			missing = append(missing, item.name)
		}
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env: %s (dibaca dari %s)", strings.Join(missing, ", "), strings.Join(envFiles, ", "))
	}
	return c, nil
}

// loadEnv memuat berkas .env pertama yang ada. Nilai yang sudah diekspor di
// environment tetap dipakai (godotenv.Load tidak menimpa).
func loadEnv() {
	for _, file := range envFiles {
		if _, err := os.Stat(file); err != nil {
			continue
		}
		if err := godotenv.Load(file); err == nil {
			return
		}
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
