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
	ProfileKind  string                 `json:"profile_kind"`
	Nis          string                 `json:"nis"`
	Nip          string                 `json:"nip"`
	KelasID      string                 `json:"kelas_id"`
	JenisKelamin string                 `json:"jenis_kelamin"`
	Status       string                 `json:"status"`
}

// CreateLinkedProfilePayload dipakai setelah user Auth dibuat agar baris
// siswa/guru memiliki profile_id yang sama.
type CreateLinkedProfilePayload struct {
	ProfileID    string
	Kind         string
	Nis          string
	Nip          string
	KelasID      string
	JenisKelamin string
	Status       string
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
