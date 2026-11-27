package models

import "strconv"

// SupabaseError membawa status dan pesan dari Supabase Auth/Gateway agar
// lapisan service bisa memetakannya ke kode error aplikasi yang tepat
// (400/404/409) dan tidak selalu berakhir sebagai 500.
type SupabaseError struct {
	Status  int
	Code    string
	Message string
}

func (e *SupabaseError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	if e.Code != "" {
		return "supabase: " + e.Code
	}
	return "supabase: status " + strconv.Itoa(e.Status)
}
