package services

import (
	"context"
	"testing"

	"classin/api/models"
)

type fakeAkunRepo struct {
	profile map[string]interface{}
	err     error
}

func (f *fakeAkunRepo) GetProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	return f.profile, f.err
}
func (f *fakeAkunRepo) ListProfiles(ctx context.Context, role string) ([]map[string]interface{}, error) {
	return nil, f.err
}
func (f *fakeAkunRepo) CreateProfile(ctx context.Context, p models.CreateProfilePayload) (map[string]interface{}, error) {
	return f.profile, f.err
}
func (f *fakeAkunRepo) UpdateProfile(ctx context.Context, id string, p models.UpdateProfilePayload) (map[string]interface{}, error) {
	return f.profile, f.err
}
func (f *fakeAkunRepo) DeleteProfile(ctx context.Context, id string) (map[string]interface{}, error) {
	return f.profile, f.err
}
func (f *fakeAkunRepo) CreateAuthUser(ctx context.Context, p models.CreateUserPayload) (map[string]interface{}, error) {
	return f.profile, f.err
}
func (f *fakeAkunRepo) UpdateProfileRole(ctx context.Context, id, role string) error { return f.err }
func (f *fakeAkunRepo) UpdateProfileStatus(ctx context.Context, id, status string) error { return f.err }
func (f *fakeAkunRepo) ResetPassword(ctx context.Context, id, password string) error { return f.err }

func TestAkunServiceGetProfile(t *testing.T) {
	want := map[string]interface{}{"full_name": "Budi", "role": "guru"}
	svc := NewAkunService(&fakeAkunRepo{profile: want})

	got, err := svc.GetProfile(context.Background(), "id-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got["full_name"] != want["full_name"] {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestAkunServiceMeSuccess(t *testing.T) {
	want := map[string]interface{}{"id": "id-1", "name": "Budi", "email": "budi@example.com", "role": "guru"}
	profile := map[string]interface{}{
		"full_name": "Budi",
		"email":     "budi@example.com",
		"role":      "guru",
	}
	repo := &fakeAkunRepo{profile: profile}
	svc := NewAkunService(repo)

	got, err := svc.Me(context.Background(), "id-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got["id"] != want["id"] || got["name"] != want["name"] {
		t.Fatalf("got %v, want %v", got, want)
	}
}

// TestAkunServiceValidatesID dihapus karena validasi dihapus; error dipetakan ke controller.