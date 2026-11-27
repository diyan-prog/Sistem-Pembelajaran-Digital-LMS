package repositories

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"classin/api/models"
)

type AkunRepository interface {
	GetProfile(ctx context.Context, id string) (map[string]interface{}, error)
	ListProfiles(ctx context.Context, role string) ([]map[string]interface{}, error)
	CreateProfile(ctx context.Context, payload models.CreateProfilePayload) (map[string]interface{}, error)
	UpdateProfile(ctx context.Context, id string, payload models.UpdateProfilePayload) (map[string]interface{}, error)
	UpdateSelfProfile(ctx context.Context, id string, payload models.SelfProfilePayload) (map[string]interface{}, error)
	DeleteProfile(ctx context.Context, id string) (map[string]interface{}, error)
	CreateAuthUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error)
	UpdateProfileRole(ctx context.Context, id, role string) error
	UpdateProfileStatus(ctx context.Context, id, status string) error
	ResetPassword(ctx context.Context, id, password string) error
}

type akunRepo struct {
	db          *DB
	supabaseURL string
	serviceKey  string
	client      *http.Client
}

func NewAkunRepository(db *DB, supabaseURL, serviceKey string) AkunRepository {
	return &akunRepo{
		db:          db,
		supabaseURL: strings.TrimRight(supabaseURL, "/"),
		serviceKey:  serviceKey,
		client:      &http.Client{Timeout: 10 * time.Second},
	}
}

func (r *akunRepo) GetProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	rows, err := r.db.List(ctx,
		`SELECT id, nama_lengkap AS full_name, email, role, status, nip_nis,
			foto_profil, foto_profil AS avatar_url, hp, alamat, preferensi, created_at
			FROM profiles WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return rows[0], nil
}

func (r *akunRepo) ListProfiles(ctx context.Context, role string) ([]map[string]interface{}, error) {
	query := "SELECT id, nama_lengkap AS full_name, email, role, status, nip_nis, foto_profil, created_at FROM profiles"
	if role != "" {
		query += " WHERE role = $1"
		return r.db.List(ctx, query, role)
	}
	return r.db.List(ctx, query)
}

func (r *akunRepo) CreateProfile(ctx context.Context, payload models.CreateProfilePayload) (map[string]interface{}, error) {
	err := r.db.Exec(ctx,
		"INSERT INTO profiles (nama_lengkap, email, role, status, nip_nis, username) VALUES ($1, $2, $3, $4, $5, split_part($2, '@', 1))",
		payload.FullName, payload.Email, payload.Role, payload.Status, payload.NipNis)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": "profile created"}, nil
}

func (r *akunRepo) UpdateProfile(ctx context.Context, id string, payload models.UpdateProfilePayload) (map[string]interface{}, error) {
	err := r.db.Exec(ctx,
		"UPDATE profiles SET nama_lengkap = $1, email = $2, role = $3, status = $4, nip_nis = $5 WHERE id = $6",
		payload.FullName, payload.Email, payload.Role, payload.Status, payload.NipNis, id)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": "profile updated"}, nil
}

// UpdateSelfProfile hanya mengubah field profil yang diizinkan untuk pengguna sendiri.
func (r *akunRepo) UpdateSelfProfile(ctx context.Context, id string, payload models.SelfProfilePayload) (map[string]interface{}, error) {
	sets := make([]string, 0, 5)
	args := make([]interface{}, 0, 6)
	add := func(column string, value interface{}) {
		args = append(args, value)
		sets = append(sets, fmt.Sprintf("%s = $%d", column, len(args)))
	}

	if payload.FullName != nil {
		add("nama_lengkap", *payload.FullName)
	}
	if payload.HP != nil {
		add("hp", *payload.HP)
	}
	if payload.Alamat != nil {
		add("alamat", *payload.Alamat)
	}
	if payload.FotoProfil != nil {
		add("foto_profil", *payload.FotoProfil)
	}
	if payload.Preferensi != nil {
		raw, err := json.Marshal(*payload.Preferensi)
		if err != nil {
			return nil, err
		}
		add("preferensi", string(raw))
		sets[len(sets)-1] += "::jsonb"
	}
	if len(sets) == 0 {
		return nil, fmt.Errorf("tidak ada data yang diubah")
	}

	args = append(args, id)
	query := "UPDATE profiles SET " + strings.Join(sets, ", ") + fmt.Sprintf(" WHERE id = $%d", len(args))
	if err := r.db.Exec(ctx, query, args...); err != nil {
		return nil, err
	}
	return r.GetProfile(ctx, id)
}

func (r *akunRepo) DeleteProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	err := r.db.Exec(ctx, "DELETE FROM profiles WHERE id = $1", id)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": "profile deleted"}, nil
}

func (r *akunRepo) UpdateProfileRole(ctx context.Context, id, role string) error {
	return r.db.Exec(ctx, "UPDATE profiles SET role = $1 WHERE id = $2", role, id)
}

func (r *akunRepo) UpdateProfileStatus(ctx context.Context, id, status string) error {
	return r.db.Exec(ctx, "UPDATE profiles SET status = $1 WHERE id = $2", status, id)
}

func (r *akunRepo) do(ctx context.Context, method, path string, body interface{}) (map[string]interface{}, error) {
	var reader io.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reader = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, r.supabaseURL+path, reader)
	if err != nil {
		return nil, err
	}
	// Service role key hanya dikirim sebagai header; tidak pernah dicatat ke log.
	req.Header.Set("apikey", r.serviceKey)
	req.Header.Set("Authorization", "Bearer "+r.serviceKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		// GoTrue memakai kunci "msg"/"error_description", Kong memakai
		// "message"; keduanya dipetakan ke models.SupabaseError agar service
		// bisa membedakan 4xx (kesalahan klien) dari 5xx.
		// Field `code` bisa berupa angka atau string tergantung endpoint
		// (GoTrue vs Kong), jadi diparse sebagai map lalu dinormalkan.
		var payload map[string]interface{}
		_ = json.Unmarshal(raw, &payload)
		text := func(keys ...string) string {
			for _, k := range keys {
				if v, ok := payload[k].(string); ok && strings.TrimSpace(v) != "" {
					return v
				}
			}
			return ""
		}
		code := text("error_code", "code")
		if code == "" {
			if n, ok := payload["code"].(float64); ok {
				code = fmt.Sprintf("%d", int(n))
			}
		}
		msg := text("message", "msg", "error_description", "error")
		return nil, &models.SupabaseError{
			Status:  resp.StatusCode,
			Code:    code,
			Message: msg,
		}
	}
	var result map[string]interface{}
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &result)
	}
	return result, nil
}

func (r *akunRepo) CreateAuthUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error) {
	// Akun yang dibuat admin harus bisa langsung login; email hanya
	// dikonfirmasi manual bila klien secara eksplisit meminta false.
	confirm := true
	if payload.EmailConfirm != nil {
		confirm = *payload.EmailConfirm
	}
	body := map[string]interface{}{
		"email":         payload.Email,
		"password":      payload.Password,
		"email_confirm": confirm,
		"user_metadata": payload.UserMetadata,
	}
	result, err := r.do(ctx, http.MethodPost, "/auth/v1/admin/users", body)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"user": result}, nil
}

func (r *akunRepo) ResetPassword(ctx context.Context, id, password string) error {
	_, err := r.do(ctx, http.MethodPut, "/auth/v1/admin/users/"+id, map[string]interface{}{"password": password})
	return err
}

// CreateLinkedProfile menautkan user Auth baru ke tabel siswa atau guru.
func (r *akunRepo) CreateLinkedProfile(ctx context.Context, payload models.CreateLinkedProfilePayload) error {
	switch payload.Kind {
	case "siswa":
		if strings.TrimSpace(payload.Nis) == "" {
			return fmt.Errorf("nis wajib diisi")
		}
		return r.db.Exec(ctx,
			"INSERT INTO siswa (profile_id, nis, kelas_id, jenis_kelamin, status) VALUES ($1, $2, $3, $4, $5)",
			payload.ProfileID, payload.Nis, nullable(payload.KelasID), nullable(payload.JenisKelamin), nullable(payload.Status))
	case "guru":
		return r.db.Exec(ctx,
			"INSERT INTO guru (profile_id, nip, status) VALUES ($1, $2, $3)",
			payload.ProfileID, nullable(payload.Nip), nullable(payload.Status))
	default:
		return fmt.Errorf("jenis profil tidak dikenal: %s", payload.Kind)
	}
}

// DeleteAuthUser menghapus user Supabase Auth. Baris profile ikut terhapus
// melalui ON DELETE CASCADE di database.
func (r *akunRepo) DeleteAuthUser(ctx context.Context, id string) error {
	_, err := r.do(ctx, http.MethodDelete, "/auth/v1/admin/users/"+id, nil)
	return err
}
