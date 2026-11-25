package models

type Profile struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	NipNis   string `json:"nip_nis"`
}

type CreateProfilePayload struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	NipNis   string `json:"nip_nis"`
}

type UpdateProfilePayload struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   string `json:"status"`
	NipNis   string `json:"nip_nis"`
}

// CreateUserPayload dipakai service role untuk membuat user Supabase Auth.
// deprecated: Edge Function admin-users masih memakai bentuk yang sama.
type CreateUserPayload struct {
	Email        string                 `json:"email"`
	Password     string                 `json:"password"`
	EmailConfirm bool                   `json:"email_confirm"`
	UserMetadata map[string]interface{} `json:"user_metadata"`
}

type UpdateFieldPayload struct {
	ID     string `json:"id"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

type ResetPasswordPayload struct {
	ID       string `json:"id"`
	Password string `json:"password"`
}
