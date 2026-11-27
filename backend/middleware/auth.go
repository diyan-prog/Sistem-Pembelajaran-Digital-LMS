package middleware

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type Claims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"`
	jwt.RegisteredClaims
}

// identity adalah hasil verifikasi token yang dipakai handler berikutnya.
type identity struct {
	userID string
	role   string
}

// cacheToken menyimpan hasil verifikasi jarak jauh agar satu permintaan HTTP
// tidak memanggil Supabase Auth berulang-ulang.
const tokenTTL = 60 * time.Second

var (
	cacheMu sync.Mutex
	cache   = map[string]struct {
		id   identity
		exp  time.Time
		last time.Time
	}{}
)

// Auth memverifikasi bearer token Supabase.
//
// Bila SUPABASE_JWT_SECRET berisi secret HMAC, token diverifikasi lokal tanpa
// jaringan. Bila kosong (atau berisi URL JWKS pada proyek dengan kunci
// asimetris), token diverifikasi ke Supabase Auth memakai service role key.
func Auth() echo.MiddlewareFunc {
	secret := strings.TrimSpace(os.Getenv("SUPABASE_JWT_SECRET"))
	if secret != "" && !strings.HasPrefix(secret, "http") {
		return authHMAC([]byte(secret))
	}
	return authRemote()
}

func authHMAC(secret []byte) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr, err := bearer(c)
			if err != nil {
				return unauthorized(c, err.Error())
			}
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
				return secret, nil
			}, jwt.WithValidMethods([]string{"HS256", "HS384", "HS512"}))
			if err != nil || !token.Valid {
				return unauthorized(c, "invalid token")
			}
			c.Set("user_id", claims.Sub)
			c.Set("role", claims.Role)
			return next(c)
		}
	}
}

func authRemote() echo.MiddlewareFunc {
	base := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/")
	apiKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("SUPABASE_ANON_KEY")
	}
	client := &http.Client{Timeout: 10 * time.Second}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr, err := bearer(c)
			if err != nil {
				return unauthorized(c, err.Error())
			}
			if base == "" {
				return unauthorized(c, "server belum dikonfigurasi: SUPABASE_URL kosong")
			}
			if id, ok := cacheGet(tokenStr); ok {
				c.Set("user_id", id.userID)
				c.Set("role", id.role)
				return next(c)
			}

			id, err := lookupUser(client, base, apiKey, tokenStr)
			if err != nil {
				return unauthorized(c, err.Error())
			}
			cachePut(tokenStr, id)
			c.Set("user_id", id.userID)
			c.Set("role", id.role)
			return next(c)
		}
	}
}

func bearer(c echo.Context) (string, error) {
	header := c.Request().Header.Get(echo.HeaderAuthorization)
	if !strings.HasPrefix(header, "Bearer ") {
		return "", errMissingToken
	}
	token := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
	if token == "" {
		return "", errMissingToken
	}
	return token, nil
}

type simpleError string

func (e simpleError) Error() string { return string(e) }

const errMissingToken = simpleError("missing or invalid token")

func unauthorized(c echo.Context, msg string) error {
	return c.JSON(http.StatusUnauthorized, map[string]string{"error": msg})
}

// userResponse hanya memuat bagian respons Supabase Auth yang dipakai.
type userResponse struct {
	ID           string         `json:"id"`
	Role         string         `json:"role"`
	AppMetadata  map[string]any `json:"app_metadata"`
	UserMetadata map[string]any `json:"user_metadata"`
}

func lookupUser(client *http.Client, base, apiKey, token string) (identity, error) {
	req, err := http.NewRequest(http.MethodGet, base+"/auth/v1/user", nil)
	if err != nil {
		return identity{}, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return identity{}, simpleError("gagal menghubungi Supabase Auth")
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return identity{}, simpleError("invalid token")
	}

	var body userResponse
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return identity{}, simpleError("respons token tidak valid")
	}
	if body.ID == "" {
		return identity{}, simpleError("invalid token")
	}

	role := metaRole(body.AppMetadata)
	if role == "" {
		role = metaRole(body.UserMetadata)
	}
	return identity{userID: body.ID, role: role}, nil
}

// metaRole mengambil peran aplikasi dari metadata token; nilai baku Supabase
// seperti "authenticated" tidak dipakai sebagai peran.
func metaRole(meta map[string]any) string {
	if len(meta) == 0 {
		return ""
	}
	for _, key := range []string{"role", "user_role"} {
		raw, ok := meta[key]
		if !ok {
			continue
		}
		value, ok := raw.(string)
		if !ok {
			continue
		}
		value = strings.TrimSpace(value)
		if value == "" || strings.EqualFold(value, "authenticated") || strings.EqualFold(value, "anon") {
			continue
		}
		return value
	}
	return ""
}

func cacheGet(token string) (identity, bool) {
	cacheMu.Lock()
	defer cacheMu.Unlock()
	entry, ok := cache[token]
	if !ok || time.Now().After(entry.exp) {
		return identity{}, false
	}
	return entry.id, true
}

func cachePut(token string, id identity) {
	now := time.Now()
	cacheMu.Lock()
	defer cacheMu.Unlock()
	// Bersihkan entri kedaluwarsa agar peta tidak tumbuh tanpa batas.
	for key, entry := range cache {
		if now.After(entry.exp) {
			delete(cache, key)
		}
	}
	cache[token] = struct {
		id   identity
		exp  time.Time
		last time.Time
	}{id: id, exp: now.Add(tokenTTL), last: now}
}
