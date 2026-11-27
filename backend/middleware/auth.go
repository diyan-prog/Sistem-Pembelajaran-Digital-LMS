package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"classin/api/authz"
	"classin/api/repositories"

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

// tokenTTL adalah masa simpan hasil verifikasi token agar satu sesi tidak
// memanggil Supabase Auth pada setiap permintaan. Peran tidak ikut di-cache;
// nilainya selalu dibaca dari tabel profiles supaya perubahan hak akses
// langsung berlaku.
const tokenTTL = 5 * time.Minute

var (
	cacheMu sync.Mutex
	cache   = map[string]struct {
		userID string
		exp    time.Time
	}{}
)

// Auth memverifikasi bearer token Supabase lalu menentukan peran aplikasi.
//
// Verifikasi: bila SUPABASE_JWT_SECRET berisi secret HMAC, token divalidasi
// lokal. Bila kosong (atau berisi URL JWKS), token divalidasi ke Supabase Auth
// memakai service role key.
//
// Peran diambil berurutan: profiles.role (sumber utama), lalu
// user_metadata.role, lalu app_metadata.role. Klaim Supabase seperti
// "authenticated" diabaikan.
func Auth(db *repositories.DB) echo.MiddlewareFunc {
	secret := strings.TrimSpace(os.Getenv("SUPABASE_JWT_SECRET"))
	verify := verifier(secret)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr, err := bearer(c)
			if err != nil {
				return unauthorized(c, err.Error())
			}
			id, err := verify(tokenStr)
			if err != nil {
				return unauthorized(c, err.Error())
			}
			role := profileRole(c.Request().Context(), db, id.userID)
			if role == "" {
				role = id.role
			}
			c.Set("user_id", id.userID)
			c.Set("role", authz.CanonicalRole(role))
			return next(c)
		}
	}
}

// profileRole membaca peran dari tabel profiles.
func profileRole(ctx context.Context, db *repositories.DB, userID string) string {
	if db == nil || userID == "" {
		return ""
	}
	row, err := db.One(ctx, `SELECT role::text FROM profiles WHERE id = $1::uuid`, userID)
	if err != nil {
		return ""
	}
	if raw, ok := row["role"].(string); ok {
		return raw
	}
	return ""
}

// verifier mengembalikan fungsi verifikasi token sesuai konfigurasi.
func verifier(secret string) func(string) (identity, error) {
	if secret != "" && !strings.HasPrefix(secret, "http") {
		return func(tokenStr string) (identity, error) { return verifyHMAC([]byte(secret), tokenStr) }
	}
	base := strings.TrimRight(os.Getenv("SUPABASE_URL"), "/")
	apiKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("SUPABASE_ANON_KEY")
	}
	client := &http.Client{Timeout: 10 * time.Second}
	return func(tokenStr string) (identity, error) {
		if base == "" {
			return identity{}, simpleError("server belum dikonfigurasi: SUPABASE_URL kosong")
		}
		if id, ok := cacheGet(tokenStr); ok {
			return id, nil
		}
		id, err := lookupUser(client, base, apiKey, tokenStr)
		if err != nil {
			return identity{}, err
		}
		cachePut(tokenStr, id)
		return id, nil
	}
}

func verifyHMAC(secret []byte, tokenStr string) (identity, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return secret, nil
	}, jwt.WithValidMethods([]string{"HS256", "HS384", "HS512"}))
	if err != nil || !token.Valid {
		return identity{}, simpleError("invalid token")
	}
	if claims.Sub == "" {
		return identity{}, simpleError("invalid token")
	}
	return identity{userID: claims.Sub, role: claims.Role}, nil
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

	role := metaRole(body.UserMetadata)
	if role == "" {
		role = metaRole(body.AppMetadata)
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
	return identity{userID: entry.userID}, true
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
		userID string
		exp    time.Time
	}{userID: id.userID, exp: now.Add(tokenTTL)}
}
