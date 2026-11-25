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
	DeleteProfile(ctx context.Context, id string) (map[string]interface{}, error)
	CreateAuthUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error)
	UpdateProfileRole(ctx context.Context, id, role string) error
	UpdateProfileStatus(ctx context.Context, id, status string) error
	ResetPassword(ctx context.Context, id, password string) error
}

type akunRepo struct {
	db         *DB
	supabaseURL string
	serviceKey string
	client     *http.Client
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
		"SELECT id, nama_lengkap AS full_name, email, role, status, nip_nis, foto_profil, created_at FROM profiles WHERE id = $1", id)
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
		var payload struct {
			Message string `json:"message"`
			Error   string `json:"error"`
		}
		_ = json.Unmarshal(raw, &payload)
		if payload.Message != "" {
			return nil, fmt.Errorf("supabase: %s", payload.Message)
		}
		if payload.Error != "" {
			return nil, fmt.Errorf("supabase: %s", payload.Error)
		}
		return nil, fmt.Errorf("supabase: status %d", resp.StatusCode)
	}
	var result map[string]interface{}
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &result)
	}
	return result, nil
}

func (r *akunRepo) CreateAuthUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error) {
	body := map[string]interface{}{
		"email":         payload.Email,
		"password":      payload.Password,
		"email_confirm": payload.EmailConfirm,
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
