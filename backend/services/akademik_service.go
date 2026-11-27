package services

import "context"

type AkademikRepository interface {
	Bootstrap(ctx context.Context, userID string) (map[string]interface{}, error)
}

type AkademikService struct {
	repo AkademikRepository
}

func NewAkademikService(repo AkademikRepository) *AkademikService {
	return &AkademikService{repo: repo}
}

func (s *AkademikService) Bootstrap(ctx context.Context, userID string) (map[string]interface{}, error) {
	return s.repo.Bootstrap(ctx, userID)
}
