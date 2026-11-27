package services

import (
	"context"
	"errors"
	"net/http"
	"strings"

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

type AkunService struct {
	repo AkunRepository
}

func NewAkunService(repo AkunRepository) *AkunService {
	return &AkunService{repo: repo}
}

func (s *AkunService) GetProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	return s.repo.GetProfile(ctx, id)
}

func (s *AkunService) Me(ctx context.Context, id string) (map[string]interface{}, error) {
	if strings.TrimSpace(id) == "" {
		return nil, Validation("user_id tidak ditemukan")
	}
	profile, err := s.repo.GetProfile(ctx, id)
	if err != nil {
		return nil, err
	}
	if profile == nil {
		return nil, NotFound("profile tidak ditemukan")
	}
	// name dipertahankan untuk klien lama; full_name dipakai frontend baru.
	profile["id"] = id
	profile["name"] = profile["full_name"]
	return profile, nil
}

func (s *AkunService) UpdateMe(ctx context.Context, id string, payload models.SelfProfilePayload) (map[string]interface{}, error) {
	if strings.TrimSpace(id) == "" {
		return nil, Validation("user_id tidak ditemukan")
	}
	return s.repo.UpdateSelfProfile(ctx, id, payload)
}

func (s *AkunService) ListProfiles(ctx context.Context, role string) ([]map[string]interface{}, error) {
	return s.repo.ListProfiles(ctx, role)
}

func (s *AkunService) CreateProfile(ctx context.Context, payload models.CreateProfilePayload) (map[string]interface{}, error) {
	return s.repo.CreateProfile(ctx, payload)
}

func (s *AkunService) UpdateProfile(ctx context.Context, id string, payload models.UpdateProfilePayload) (map[string]interface{}, error) {
	return s.repo.UpdateProfile(ctx, id, payload)
}

func (s *AkunService) DeleteProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	return s.repo.DeleteProfile(ctx, id)
}

// linkedProfileCreator diimplementasikan akunRepo untuk membuat baris
// siswa/guru setelah user Auth berhasil dibuat.
type linkedProfileCreator interface {
	CreateLinkedProfile(ctx context.Context, payload models.CreateLinkedProfilePayload) error
}

type authUserDeleter interface {
	DeleteAuthUser(ctx context.Context, id string) error
}

// allowedRole daftar slug peran yang cocok constraint profiles_role_check.
func allowedRole(role string) bool {
	switch role {
	case "super_admin", "kepala_sekolah", "guru", "siswa", "wali_kelas":
		return true
	}
	return false
}

// mapSupabase menerjemahkan galat Supabase Auth menjadi galat domain supaya
// respons HTTP memakai 4xx yang informatif, bukan 500.
func mapSupabase(err error) error {
	var se *models.SupabaseError
	if !errors.As(err, &se) {
		return err
	}
	switch se.Code {
	case "email_exists", "user_already_exists":
		return Conflict("email sudah terdaftar, gunakan email lain")
	case "weak_password":
		return Validation("kata sandi terlalu lemah, minimal 6 karakter")
	case "validation_failed", "email_address_invalid":
		return Validation(se.Error())
	}
	if strings.Contains(strings.ToLower(se.Message), "already been registered") {
		return Conflict("email sudah terdaftar, gunakan email lain")
	}
	switch {
	case se.Status == http.StatusConflict || se.Status == http.StatusUnprocessableEntity:
		return Conflict(se.Error())
	case se.Status >= 400 && se.Status < 500:
		return Validation(se.Error())
	}
	return err
}

// CreateUser menggantikan aksi `create` pada Edge Function admin-users.
func (s *AkunService) CreateUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error) {
	if strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Password) == "" {
		return nil, Validation("email dan kata sandi wajib diisi")
	}
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	if err := validateCreate(payload); err != nil {
		return nil, err
	}
	result, err := s.repo.CreateAuthUser(ctx, payload)
	if err != nil {
		return nil, mapSupabase(err)
	}
	profileID := authUserID(result)
	if profileID == "" {
		return nil, Validation("ID user Auth tidak ditemukan")
	}
	if err := s.applyProfileExtras(ctx, profileID, payload); err != nil {
		// User Auth sudah terlanjur dibuat; hapus lagi supaya tidak ada akun
		// yatim yang bisa login dengan peran default 'siswa'.
		if deleter, ok := s.repo.(authUserDeleter); ok {
			_ = deleter.DeleteAuthUser(ctx, profileID)
		}
		return nil, err
	}
	return result, nil
}

// applyProfileExtras melengkapi baris profiles yang dibuat trigger database.
// Trigger memakai nilai default 'siswa', sehingga peran dari user_metadata
// harus ditulis ulang agar sesuai constraint profiles_role_check
// (super_admin | kepala_sekolah | guru | siswa | wali_kelas).
func (s *AkunService) applyProfileExtras(ctx context.Context, profileID string, payload models.CreateUserPayload) error {
	if kind := strings.TrimSpace(payload.ProfileKind); kind != "" {
		creator, ok := s.repo.(linkedProfileCreator)
		if !ok {
			return Validation("repo tidak mendukung pembuatan profil terkait")
		}
		if err := creator.CreateLinkedProfile(ctx, models.CreateLinkedProfilePayload{
			ProfileID: profileID, Kind: kind,
			Nis: payload.Nis, Nip: payload.Nip, KelasID: payload.KelasID,
			JenisKelamin: payload.JenisKelamin, Status: payload.Status,
		}); err != nil {
			return mapDB(err)
		}
	}
	raw, ok := payload.UserMetadata["role"]
	if !ok {
		return nil
	}
	role, ok := raw.(string)
	if !ok {
		return nil
	}
	role = normalizeRole(role)
	if !allowedRole(role) {
		return Validation("peran tidak dikenal: " + role)
	}
	return s.repo.UpdateProfileRole(ctx, profileID, role)
}

// normalizeRole menyamakan label UI ("Tata Usaha", "Guru Mapel") dan slug
// database ("super_admin", "guru") menjadi slug yang lolos constraint.
func normalizeRole(role string) string {
	r := strings.ToLower(strings.TrimSpace(role))
	r = strings.ReplaceAll(r, " ", "_")
	switch r {
	case "tata_usaha", "tu", "admin", "super-admin":
		return "super_admin"
	case "guru_mapel", "teacher":
		return "guru"
	case "wali_kelas", "homeroom":
		return "wali_kelas"
	case "kepala_sekolah", "kepsek", "headmaster":
		return "kepala_sekolah"
	case "siswa", "student":
		return "siswa"
	}
	return r
}

// validateCreate memeriksa payload sebelum user Auth dibuat supaya tidak
// meninggalkan akun Auth yatim saat data profil tidak valid.
func validateCreate(payload models.CreateUserPayload) error {
	if kind := strings.TrimSpace(payload.ProfileKind); kind != "" {
		switch kind {
		case "siswa":
			if strings.TrimSpace(payload.Nis) == "" {
				return Validation("NIS wajib diisi untuk profil siswa")
			}
		case "guru":
		default:
			return Validation("profile_kind harus 'siswa' atau 'guru'")
		}
	}
	if raw, ok := payload.UserMetadata["role"]; ok {
		role, ok := raw.(string)
		if !ok {
			return Validation("user_metadata.role harus berupa teks")
		}
		if strings.TrimSpace(role) != "" && !allowedRole(normalizeRole(role)) {
			return Validation("peran tidak dikenal: " + role)
		}
	}
	return nil
}

// mapDB menerjemahkan galat constraint PostgreSQL menjadi galat domain.
func mapDB(err error) error {
	if err == nil {
		return nil
	}
	msg := strings.ToLower(err.Error())
	switch {
	case strings.Contains(msg, "23505"), strings.Contains(msg, "duplicate key"):
		if strings.Contains(msg, "nis") {
			return Conflict("NIS sudah terdaftar")
		}
		if strings.Contains(msg, "nip") {
			return Conflict("NIP sudah terdaftar")
		}
		return Conflict("data sudah terdaftar")
	case strings.Contains(msg, "23503"), strings.Contains(msg, "foreign key"):
		return Validation("kelas_id tidak ditemukan")
	}
	return err
}

func authUserID(result map[string]interface{}) string {
	user, ok := result["user"].(map[string]interface{})
	if !ok {
		return ""
	}
	id, _ := user["id"].(string)
	return id
}

// DeleteUser menghapus user Auth beserta profile terkait.
func (s *AkunService) DeleteUser(ctx context.Context, id string) error {
	if strings.TrimSpace(id) == "" {
		return Validation("ID wajib diisi")
	}
	if deleter, ok := s.repo.(authUserDeleter); ok {
		return mapSupabase(deleter.DeleteAuthUser(ctx, id))
	}
	_, err := s.repo.DeleteProfile(ctx, id)
	return err
}

func (s *AkunService) UpdateRole(ctx context.Context, payload models.UpdateFieldPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Role) == "" {
		return Validation("ID dan role wajib diisi")
	}
	role := normalizeRole(payload.Role)
	if !allowedRole(role) {
		return Validation("peran tidak dikenal: " + payload.Role)
	}
	return mapDB(s.repo.UpdateProfileRole(ctx, payload.ID, role))
}

func (s *AkunService) UpdateStatus(ctx context.Context, payload models.UpdateFieldPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Status) == "" {
		return Validation("ID dan status wajib diisi")
	}
	status := strings.ToLower(strings.TrimSpace(payload.Status))
	switch status {
	case "aktif", "active":
		status = "aktif"
	case "nonaktif", "non-aktif", "inactive":
		status = "nonaktif"
	default:
		return Validation("status harus 'aktif' atau 'nonaktif'")
	}
	return mapDB(s.repo.UpdateProfileStatus(ctx, payload.ID, status))
}

func (s *AkunService) ResetPassword(ctx context.Context, payload models.ResetPasswordPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Password) == "" {
		return Validation("ID dan kata sandi wajib diisi")
	}
	return mapSupabase(s.repo.ResetPassword(ctx, payload.ID, payload.Password))
}
