package services

import (
	"context"
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

// CreateUser menggantikan aksi `create` pada Edge Function admin-users.
func (s *AkunService) CreateUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error) {
	if strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Password) == "" {
		return nil, Validation("email dan kata sandi wajib diisi")
	}
	result, err := s.repo.CreateAuthUser(ctx, payload)
	if err != nil {
		return nil, err
	}
	if payload.ProfileKind == "" {
		return result, nil
	}
	creator, ok := s.repo.(linkedProfileCreator)
	if !ok {
		return nil, Validation("repo tidak mendukung pembuatan profil terkait")
	}
	profileID := authUserID(result)
	if profileID == "" {
		return nil, Validation("ID user Auth tidak ditemukan")
	}
	if err := creator.CreateLinkedProfile(ctx, models.CreateLinkedProfilePayload{
		ProfileID: profileID, Kind: payload.ProfileKind,
		Nis: payload.Nis, Nip: payload.Nip, KelasID: payload.KelasID,
		JenisKelamin: payload.JenisKelamin, Status: payload.Status,
	}); err != nil {
		return nil, err
	}
	return result, nil
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
		return deleter.DeleteAuthUser(ctx, id)
	}
	_, err := s.repo.DeleteProfile(ctx, id)
	return err
}

func (s *AkunService) UpdateRole(ctx context.Context, payload models.UpdateFieldPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Role) == "" {
		return Validation("ID dan role wajib diisi")
	}
	return s.repo.UpdateProfileRole(ctx, payload.ID, payload.Role)
}

func (s *AkunService) UpdateStatus(ctx context.Context, payload models.UpdateFieldPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Status) == "" {
		return Validation("ID dan status wajib diisi")
	}
	return s.repo.UpdateProfileStatus(ctx, payload.ID, payload.Status)
}

func (s *AkunService) ResetPassword(ctx context.Context, payload models.ResetPasswordPayload) error {
	if strings.TrimSpace(payload.ID) == "" || strings.TrimSpace(payload.Password) == "" {
		return Validation("ID dan kata sandi wajib diisi")
	}
	return s.repo.ResetPassword(ctx, payload.ID, payload.Password)
}
