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

func Load() (*Config, error) {
	_ = godotenv.Load()

	c := &Config{
		Port:           env("PORT", "8080"),
		SupabaseURL:    os.Getenv("SUPABASE_URL"),
		ServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		JWTSecret:      os.Getenv("SUPABASE_JWT_SECRET"),
		AppOrigin:      env("APP_ORIGIN", "*"),
		TZ:             env("TZ", "Asia/Jakarta"),
		DBURL:          os.Getenv("DB_URL"),
	}

	required := []struct{ name, value string }{
		{"SUPABASE_URL", c.SupabaseURL},
		{"SUPABASE_SERVICE_ROLE_KEY", c.ServiceRoleKey},
		{"SUPABASE_JWT_SECRET", c.JWTSecret},
		{"DB_URL", c.DBURL},
	}
	missing := make([]string, 0, len(required))
	for _, item := range required {
		if item.value == "" {
			missing = append(missing, item.name)
		}
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env: %s", strings.Join(missing, ", "))
	}
	return c, nil
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
