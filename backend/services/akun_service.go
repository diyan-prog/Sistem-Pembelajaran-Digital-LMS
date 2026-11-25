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
	return map[string]interface{}{
		"id":    id,
		"name":  profile["full_name"],
		"email": profile["email"],
		"role":  profile["role"],
	}, nil
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

// CreateUser menggantikan aksi `create` pada Edge Function admin-users.
func (s *AkunService) CreateUser(ctx context.Context, payload models.CreateUserPayload) (map[string]interface{}, error) {
	if strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Password) == "" {
		return nil, Validation("email dan kata sandi wajib diisi")
	}
	return s.repo.CreateAuthUser(ctx, payload)
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
