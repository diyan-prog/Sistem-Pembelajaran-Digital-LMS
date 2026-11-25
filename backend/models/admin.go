package models

type ClassPayload struct {
	Name      string `json:"name"`
	Grade     int    `json:"grade"`
	Major     string `json:"major"`
	Tingkat   int    `json:"tingkat"`
	JurusanID string `json:"jurusan_id"`
}

type JurusanPayload struct {
	Nama string `json:"nama"`
	Kode string `json:"kode"`
	Role string `json:"role"`
}

type SiswaPayload struct {
	Nis      string `json:"nis"`
	Nisn     string `json:"nisn"`
	ClsID    string `json:"cls_id"`
	ClsName  string `json:"cls_name"`
	Status   string `json:"status"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	NipNis   string `json:"nip_nis"`
	Role     string `json:"role"`
	StatusP  string `json:"status_p"`
}

type GuruPayload struct {
	Nip       string `json:"nip"`
	ProfileID string `json:"profile_id"`
	Status    string `json:"status"`
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	StatusP   string `json:"status_p"`
}

type JadwalPayload struct {
	Hari        string `json:"hari"`
	JamMulai    string `json:"jam_mulai"`
	JamSelesai  string `json:"jam_selesai"`
	PenugasanID string `json:"penugasan_id"`
	Ruangan     string `json:"ruangan"`
}

// MapelPayload sengaja memakai field unexported seperti kode lama.
// deprecated: encoding/json tidak mengisi field ini, jadi nilainya tetap kosong.
type MapelPayload struct {
	kodeMapel string
	namaMapel string
	teacherID string
}

func (p MapelPayload) Values() []interface{} {
	return []interface{}{p.kodeMapel, p.namaMapel, p.teacherID}
}

type LogPayload struct {
	UserID      string `json:"user_id"`
	Action      string `json:"action"`
	Description string `json:"description"`
}

// Values mengembalikan nilai kosong sesuai perilaku payload lama yang memakai
// field unexported.
// deprecated: encoding/json tidak mengisi field lama tersebut.
func (p LogPayload) Values() []interface{} {
	return []interface{}{p.UserID, p.Action, p.Description}
}

type AdminMessage struct {
	Message string `json:"message"`
}
