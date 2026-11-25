package models

// Payload CRUD admin diselaraskan dengan skema nyata (database.types.ts).
// Catatan penting:
//   - profiles memakai kolom nama_lengkap (bukan full_name).
//   - jadwal_pelajaran memakai penugasan_id (FK ke pengampu.id_pengampu).
//   - tahun_ajaran memakai is_active (bukan aktif).
//   - tugas memakai deskripsi/file_lampiran (bukan instruksi/batas/maks).
//   - kuis memakai durasi_menit/waktu_mulai/waktu_selesai.

type ClassPayload struct {
	Name         string `json:"name"`
	Grade        int    `json:"grade"`
	Major        string `json:"major"`
	AcademicYear string `json:"academic_year"`
	Tingkat      int    `json:"tingkat"`
	JurusanID    string `json:"jurusan_id"`
	WaliKelasID  string `json:"wali_kelas_id"`
}

type JurusanPayload struct {
	Nama string `json:"nama"`
	Kode string `json:"kode"`
}

type MapelPayload struct {
	Name     string `json:"name"`
	Code     string `json:"code"`
	Category string `json:"category"`
	Grade    int    `json:"grade"`
	Kelompok string `json:"kelompok"`
}

type SiswaPayload struct {
	Nama         string `json:"nama"`
	Nis          string `json:"nis"`
	Nisn         string `json:"nisn"`
	Email        string `json:"email"`
	KelasID      string `json:"kelas_id"`
	JenisKelamin string `json:"jenis_kelamin"`
	Status       string `json:"status"`
	ProfileID    string `json:"profile_id"`
}

type GuruPayload struct {
	Nama      string `json:"nama"`
	Nip       string `json:"nip"`
	Email     string `json:"email"`
	Status    string `json:"status"`
	ProfileID string `json:"profile_id"`
}

type JadwalPayload struct {
	Hari        string `json:"hari"`
	JamMulai    string `json:"jam_mulai"`
	JamSelesai  string `json:"jam_selesai"`
	PenugasanID string `json:"penugasan_id"`
	Ruangan     string `json:"ruangan"`
}

type LogPayload struct {
	UserID    string `json:"user_id"`
	Aksi      string `json:"aksi"`
	Modul     string `json:"modul"`
	Entitas   string `json:"entitas"`
	EntitasID string `json:"entitas_id"`
	Detail    string `json:"detail"`
	IPAddress string `json:"ip_address"`
}

type PengumumanPayload struct {
	Judul         string `json:"judul"`
	Isi           string `json:"isi"`
	Kategori      string `json:"kategori"`
	Penting       bool   `json:"penting"`
	DibuatOleh    string `json:"dibuat_oleh"`
	TargetKelasID string `json:"target_kelas_id"`
	TargetRole    string `json:"target_role"`
}

type PresensiPayload struct {
	IdPengampu  string `json:"id_pengampu"`
	IdSiswa     string `json:"id_siswa"`
	Tanggal     string `json:"tanggal"`
	Status      string `json:"status"`
	DicatatOleh string `json:"dicatat_oleh"`
}

type TugasPayload struct {
	IdPengampu   string `json:"id_pengampu"`
	Judul        string `json:"judul"`
	Deskripsi    string `json:"deskripsi"`
	FileLampiran string `json:"file_lampiran"`
	Deadline     string `json:"deadline"`
}

type PengumpulanTugasPayload struct {
	IdTugas      string `json:"id_tugas"`
	IdSiswa      string `json:"id_siswa"`
	FileJawaban  string `json:"file_jawaban"`
	CatatanSiswa string `json:"catatan_siswa"`
	FeedbackGuru string `json:"feedback_guru"`
	Nilai        *int   `json:"nilai"`
	Status       string `json:"status"`
	WaktuKumpul  string `json:"waktu_kumpul"`
}

type KuisPayload struct {
	IdPengampu   string `json:"id_pengampu"`
	Judul        string `json:"judul"`
	DurasiMenit  int    `json:"durasi_menit"`
	Status       string `json:"status"`
	WaktuMulai   string `json:"waktu_mulai"`
	WaktuSelesai string `json:"waktu_selesai"`
}

type TahunAjaranPayload struct {
	Id       string `json:"id"`
	Nama     string `json:"nama"`
	Semester string `json:"semester"`
	IsActive *bool  `json:"is_active"`
}

type PengaturanPayload struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

type MateriPayload struct {
	IdPengampu   string `json:"id_pengampu"`
	Judul        string `json:"judul"`
	Deskripsi    string `json:"deskripsi"`
	FileMateri   string `json:"file_materi"`
	LinkVideo    string `json:"link_video"`
	TanggalUpload string `json:"tanggal_upload"`
}

type PertemuanPayload struct {
	IdPengampu  string `json:"id_pengampu"`
	NoPertemuan int    `json:"no_pertemuan"`
	Judul       string `json:"judul"`
	Tanggal     string `json:"tanggal"`
}

type SoalKuisPayload struct {
	IdKuis       string `json:"id_kuis"`
	Pertanyaan   string `json:"pertanyaan"`
	PilihanA     string `json:"pilihan_a"`
	PilihanB     string `json:"pilihan_b"`
	PilihanC     string `json:"pilihan_c"`
	PilihanD     string `json:"pilihan_d"`
	KunciJawaban string `json:"kunci_jawaban"`
	Poin         int    `json:"poin"`
	Urutan       *int   `json:"urutan"`
}

type HasilKuisPayload struct {
	IdKuis       string `json:"id_kuis"`
	IdSiswa      string `json:"id_siswa"`
	Nilai        int    `json:"nilai"`
	WaktuMulai   string `json:"waktu_mulai"`
	WaktuSelesai string `json:"waktu_selesai"`
}

type NotifikasiPayload struct {
	UserID string `json:"user_id"`
	Judul  string `json:"judul"`
	Isi    string `json:"isi"`
	Jenis  string `json:"jenis"`
	Link   string `json:"link"`
}

type PengampuPayload struct {
	IdGuru      string `json:"id_guru"`
	IdKelas     string `json:"id_kelas"`
	IdMapel     string `json:"id_mapel"`
	TahunAjaran string `json:"tahun_ajaran"`
}

type AdminMessage struct {
	Message string `json:"message"`
}