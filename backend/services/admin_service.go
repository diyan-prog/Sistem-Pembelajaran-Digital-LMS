package services

import (
	"context"
	"fmt"
)

type AdminRepository interface {
	Dashboard(ctx context.Context) (map[string]int, error)
	List(ctx context.Context, resource, filter string) ([]map[string]interface{}, error)
	Create(ctx context.Context, resource string, payload interface{}) (map[string]interface{}, error)
	Update(ctx context.Context, resource, id string, payload interface{}) (map[string]interface{}, error)
	Delete(ctx context.Context, resource, id string) (map[string]interface{}, error)
}

type AdminService struct {
	repo AdminRepository
}

func NewAdminService(repo AdminRepository) *AdminService {
	return &AdminService{repo: repo}
}

var allowedResources = map[string]bool{
	"classes": true, "jurusan": true, "mapel": true, "siswa": true,
	"guru": true, "jadwal": true, "log": true,
}

func checkResource(resource string) error {
	if !allowedResources[resource] {
		return Validation(fmt.Sprintf("resource tidak dikenal: %s", resource))
	}
	return nil
}

func (s *AdminService) Dashboard(ctx context.Context) (map[string]int, error) {
	return s.repo.Dashboard(ctx)
}

func (s *AdminService) List(ctx context.Context, resource, filter string) ([]map[string]interface{}, error) {
	if err := checkResource(resource); err != nil {
		return nil, err
	}
	return s.repo.List(ctx, resource, filter)
}

func (s *AdminService) Create(ctx context.Context, resource string, payload interface{}) (map[string]interface{}, error) {
	if err := checkResource(resource); err != nil {
		return nil, err
	}
	return s.repo.Create(ctx, resource, payload)
}

func (s *AdminService) Update(ctx context.Context, resource, id string, payload interface{}) (map[string]interface{}, error) {
	if err := checkResource(resource); err != nil {
		return nil, err
	}
	return s.repo.Update(ctx, resource, id, payload)
}

func (s *AdminService) Delete(ctx context.Context, resource, id string) (map[string]interface{}, error) {
	if err := checkResource(resource); err != nil {
		return nil, err
	}
	return s.repo.Delete(ctx, resource, id)
}
