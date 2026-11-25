package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"classin/api/models"
)

func jsonValue(v interface{}) interface{} {
	raw, err := json.Marshal(v)
	if err != nil {
		return nil
	}
	return string(raw)
}

type AdminRepository interface {
	Dashboard(ctx context.Context) (map[string]int, error)
	List(ctx context.Context, resource, filter string) ([]map[string]interface{}, error)
	Create(ctx context.Context, resource string, payload interface{}) (map[string]interface{}, error)
	Update(ctx context.Context, resource, id string, payload interface{}) (map[string]interface{}, error)
	Delete(ctx context.Context, resource, id string) (map[string]interface{}, error)
}

type resourceSpec struct {
	list       string
	filterCol  string
	insert     string
	update     string
	remove     string
	insertArgs func(interface{}) []interface{}
	updateArgs func(interface{}, string) []interface{}
	createMsg  string
	updateMsg  string
	deleteMsg  string
}

var specs = map[string]resourceSpec{
	"classes": {
		list:      "SELECT id, name, grade, major, academic_year, tingkat, jurusan_id, wali_kelas_id FROM classes",
		filterCol: "major",
		insert:    "INSERT INTO classes (name, grade, major, academic_year, tingkat, jurusan_id, wali_kelas_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		update:    "UPDATE classes SET name = $1, grade = $2, major = $3, academic_year = $4, tingkat = $5, jurusan_id = $6, wali_kelas_id = $7 WHERE id = $8",
		remove:    "DELETE FROM classes WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.ClassPayload)
			return []interface{}{v.Name, v.Grade, v.Major, v.AcademicYear, v.Tingkat, nullable(v.JurusanID), nullable(v.WaliKelasID)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.ClassPayload)
			return []interface{}{v.Name, v.Grade, v.Major, v.AcademicYear, v.Tingkat, nullable(v.JurusanID), nullable(v.WaliKelasID), id}
		},
		createMsg: "class created", updateMsg: "class updated", deleteMsg: "class deleted",
	},
	"jurusan": {
		list:      "SELECT id, nama, kode FROM jurusan",
		filterCol: "kode",
		insert:    "INSERT INTO jurusan (nama, kode) VALUES ($1, $2)",
		update:    "UPDATE jurusan SET nama = $1, kode = $2 WHERE id = $3",
		remove:    "DELETE FROM jurusan WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.JurusanPayload)
			return []interface{}{v.Nama, v.Kode}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.JurusanPayload)
			return []interface{}{v.Nama, v.Kode, id}
		},
		createMsg: "jurusan created", updateMsg: "jurusan updated", deleteMsg: "jurusan deleted",
	},
	"mapel": {
		list:      "SELECT id, name, code, category, grade, kelompok FROM subjects",
		filterCol: "category",
		insert:    "INSERT INTO subjects (name, code, category, grade, kelompok) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE subjects SET name = $1, code = $2, category = $3, grade = $4, kelompok = $5 WHERE id = $6",
		remove:    "DELETE FROM subjects WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.MapelPayload)
			return []interface{}{v.Name, v.Code, v.Category, v.Grade, nullable(v.Kelompok)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.MapelPayload)
			return []interface{}{v.Name, v.Code, v.Category, v.Grade, nullable(v.Kelompok), id}
		},
		createMsg: "subject created", updateMsg: "subject updated", deleteMsg: "subject deleted",
	},
	"siswa": {
		list:      "SELECT s.id, s.profile_id, s.nis, s.nisn, s.status, s.jenis_kelamin, s.kelas_id, p.nama_lengkap, p.email, p.nip_nis, p.status AS status_profiles FROM siswa s JOIN profiles p ON s.profile_id = p.id",
		filterCol: "s.status",
		insert:    "INSERT INTO siswa (nis, nisn, kelas_id, jenis_kelamin, status, profile_id) VALUES ($1, $2, $3, $4, $5, $6)",
		update:    "UPDATE siswa SET nis = $1, nisn = $2, kelas_id = $3, jenis_kelamin = $4, status = $5 WHERE id = $6",
		remove:    "DELETE FROM siswa WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.SiswaPayload)
			return []interface{}{v.Nis, nullable(v.Nisn), nullable(v.KelasID), nullable(v.JenisKelamin), nullable(v.Status), nullable(v.ProfileID)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.SiswaPayload)
			return []interface{}{v.Nis, nullable(v.Nisn), nullable(v.KelasID), nullable(v.JenisKelamin), nullable(v.Status), id}
		},
		createMsg: "siswa created", updateMsg: "siswa updated", deleteMsg: "siswa deleted",
	},
	"guru": {
		list:      "SELECT g.id, g.profile_id, g.nip, g.status, p.nama_lengkap, p.email, p.nip_nis, p.status AS status_profiles FROM guru g JOIN profiles p ON g.profile_id = p.id",
		filterCol: "g.status",
		insert:    "INSERT INTO guru (nip, profile_id, status) VALUES ($1, $2, $3)",
		update:    "UPDATE guru SET nip = $1, status = $2 WHERE id = $3",
		remove:    "DELETE FROM guru WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.GuruPayload)
			return []interface{}{nullable(v.Nip), nullable(v.ProfileID), nullable(v.Status)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.GuruPayload)
			return []interface{}{nullable(v.Nip), nullable(v.Status), id}
		},
		createMsg: "guru created", updateMsg: "guru updated", deleteMsg: "guru deleted",
	},
	"jadwal": {
		list:      "SELECT j.id, j.hari, j.jam_mulai, j.jam_selesai, j.ruangan, j.penugasan_id FROM jadwal_pelajaran j",
		filterCol: "j.hari",
		insert:    "INSERT INTO jadwal_pelajaran (hari, jam_mulai, jam_selesai, penugasan_id, ruangan) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE jadwal_pelajaran SET hari = $1, jam_mulai = $2, jam_selesai = $3, penugasan_id = $4, ruangan = $5 WHERE id = $6",
		remove:    "DELETE FROM jadwal_pelajaran WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.JadwalPayload)
			return []interface{}{v.Hari, v.JamMulai, v.JamSelesai, v.PenugasanID, nullable(v.Ruangan)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.JadwalPayload)
			return []interface{}{v.Hari, v.JamMulai, v.JamSelesai, v.PenugasanID, nullable(v.Ruangan), id}
		},
		createMsg: "jadwal created", updateMsg: "jadwal updated", deleteMsg: "jadwal deleted",
	},
	"log": {
		list:      "SELECT l.id, l.user_id, COALESCE(p.nama_lengkap, 'Sistem') AS user, COALESCE(p.role, '-') AS role, l.aksi, l.modul, l.entitas, l.ip_address, l.created_at AS waktu FROM activity_log l LEFT JOIN profiles p ON l.user_id = p.id",
		filterCol: "l.modul",
		insert:    "INSERT INTO activity_log (user_id, aksi, modul, entitas, entitas_id, detail, ip_address) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)",
		remove:    "DELETE FROM activity_log WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.LogPayload)
			return []interface{}{nullable(v.UserID), v.Aksi, nullable(v.Modul), nullable(v.Entitas), nullable(v.EntitasID), nullable(v.Detail), nullable(v.IPAddress)}
		},
		createMsg: "activity logged", deleteMsg: "activity deleted",
	},
	"pengumuman": {
		list:      "SELECT id, judul, isi, kategori, penting, dibuat_oleh, target_kelas_id, target_role, created_at FROM pengumuman",
		filterCol: "kategori",
		insert:    "INSERT INTO pengumuman (judul, isi, kategori, penting, dibuat_oleh, target_kelas_id, target_role) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		update:    "UPDATE pengumuman SET judul = $1, isi = $2, kategori = $3, penting = $4, dibuat_oleh = $5, target_kelas_id = $6, target_role = $7 WHERE id = $8",
		remove:    "DELETE FROM pengumuman WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PengumumanPayload)
			return []interface{}{v.Judul, v.Isi, nullable(v.Kategori), v.Penting, nullable(v.DibuatOleh), nullable(v.TargetKelasID), nullable(v.TargetRole)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PengumumanPayload)
			return []interface{}{v.Judul, v.Isi, nullable(v.Kategori), v.Penting, nullable(v.DibuatOleh), nullable(v.TargetKelasID), nullable(v.TargetRole), id}
		},
		createMsg: "pengumuman created", updateMsg: "pengumuman updated", deleteMsg: "pengumuman deleted",
	},
	"presensi": {
		list:      "SELECT p.id_presensi, p.id_pengampu, p.id_siswa, pr.nama_lengkap AS siswa_nama, p.tanggal, p.status, p.dicatat_oleh FROM presensi p LEFT JOIN profiles pr ON p.id_siswa = pr.id",
		filterCol: "p.tanggal",
		insert:    "INSERT INTO presensi (id_pengampu, id_siswa, tanggal, status, dicatat_oleh) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE presensi SET id_pengampu = $1, id_siswa = $2, tanggal = $3, status = $4, dicatat_oleh = $5 WHERE id_presensi = $6",
		remove:    "DELETE FROM presensi WHERE id_presensi = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PresensiPayload)
			return []interface{}{v.IdPengampu, v.IdSiswa, v.Tanggal, v.Status, v.DicatatOleh}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PresensiPayload)
			return []interface{}{v.IdPengampu, v.IdSiswa, v.Tanggal, v.Status, v.DicatatOleh, id}
		},
		createMsg: "presensi created", updateMsg: "presensi updated", deleteMsg: "presensi deleted",
	},
	"tugas": {
		list:      "SELECT t.id_tugas, t.id_pengampu, t.judul, t.deskripsi, t.file_lampiran, t.deadline, t.created_at FROM tugas t",
		filterCol: "t.deadline",
		insert:    "INSERT INTO tugas (id_pengampu, judul, deskripsi, file_lampiran, deadline) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE tugas SET id_pengampu = $1, judul = $2, deskripsi = $3, file_lampiran = $4, deadline = $5 WHERE id_tugas = $6",
		remove:    "DELETE FROM tugas WHERE id_tugas = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.TugasPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.Deskripsi, nullable(v.FileLampiran), v.Deadline}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.TugasPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.Deskripsi, nullable(v.FileLampiran), v.Deadline, id}
		},
		createMsg: "tugas created", updateMsg: "tugas updated", deleteMsg: "tugas deleted",
	},
	"pengumpulan_tugas": {
		list:      "SELECT pt.id_pengumpulan, pt.id_tugas, pt.id_siswa, pt.file_jawaban, pt.catatan_siswa, pt.feedback_guru, pt.nilai, pt.status, pt.waktu_kumpul FROM pengumpulan_tugas pt",
		filterCol: "pt.status",
		insert:    "INSERT INTO pengumpulan_tugas (id_tugas, id_siswa, file_jawaban, catatan_siswa, feedback_guru, nilai, status, waktu_kumpul) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		update:    "UPDATE pengumpulan_tugas SET id_tugas = $1, id_siswa = $2, file_jawaban = $3, catatan_siswa = $4, feedback_guru = $5, nilai = $6, status = $7, waktu_kumpul = $8 WHERE id_pengumpulan = $9",
		remove:    "DELETE FROM pengumpulan_tugas WHERE id_pengumpulan = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PengumpulanTugasPayload)
			return []interface{}{v.IdTugas, v.IdSiswa, nullable(v.FileJawaban), nullable(v.CatatanSiswa), nullable(v.FeedbackGuru), v.Nilai, v.Status, nullable(v.WaktuKumpul)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PengumpulanTugasPayload)
			return []interface{}{v.IdTugas, v.IdSiswa, nullable(v.FileJawaban), nullable(v.CatatanSiswa), nullable(v.FeedbackGuru), v.Nilai, v.Status, nullable(v.WaktuKumpul), id}
		},
		createMsg: "pengumpulan created", updateMsg: "pengumpulan updated", deleteMsg: "pengumpulan deleted",
	},
	"kuis": {
		list:      "SELECT id_kuis, id_pengampu, judul, durasi_menit, status, waktu_mulai, waktu_selesai, created_at FROM kuis",
		filterCol: "status",
		insert:    "INSERT INTO kuis (id_pengampu, judul, durasi_menit, status, waktu_mulai, waktu_selesai) VALUES ($1, $2, $3, $4, $5, $6)",
		update:    "UPDATE kuis SET id_pengampu = $1, judul = $2, durasi_menit = $3, status = $4, waktu_mulai = $5, waktu_selesai = $6 WHERE id_kuis = $7",
		remove:    "DELETE FROM kuis WHERE id_kuis = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.KuisPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.DurasiMenit, v.Status, v.WaktuMulai, v.WaktuSelesai}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.KuisPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.DurasiMenit, v.Status, v.WaktuMulai, v.WaktuSelesai, id}
		},
		createMsg: "kuis created", updateMsg: "kuis updated", deleteMsg: "kuis deleted",
	},
	"tahun_ajaran": {
		list:      "SELECT id, nama, semester, is_active, created_at FROM tahun_ajaran",
		filterCol: "nama",
		insert:    "INSERT INTO tahun_ajaran (nama, semester, is_active) VALUES ($1, $2, $3)",
		update:    "UPDATE tahun_ajaran SET nama = $1, semester = $2, is_active = $3 WHERE id = $4",
		remove:    "DELETE FROM tahun_ajaran WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.TahunAjaranPayload)
			return []interface{}{v.Nama, v.Semester, v.IsActive}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.TahunAjaranPayload)
			return []interface{}{v.Nama, v.Semester, v.IsActive, id}
		},
		createMsg: "tahun ajaran created", updateMsg: "tahun ajaran updated", deleteMsg: "tahun ajaran deleted",
	},
	"pengaturan": {
		list:      "SELECT key, value, updated_at FROM pengaturan",
		filterCol: "key",
		insert:    "INSERT INTO pengaturan (key, value) VALUES ($1, $2::jsonb)",
		update:    "UPDATE pengaturan SET value = $2::jsonb WHERE key = $1",
		remove:    "DELETE FROM pengaturan WHERE key = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PengaturanPayload)
			return []interface{}{v.Key, jsonValue(v.Value)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PengaturanPayload)
			return []interface{}{id, jsonValue(v.Value)}
		},
		createMsg: "pengaturan created", updateMsg: "pengaturan updated", deleteMsg: "pengaturan deleted",
	},
	"materi": {
		list:      "SELECT id_materi, id_pengampu, judul, deskripsi, file_materi, link_video, tanggal_upload FROM materi",
		filterCol: "id_pengampu",
		insert:    "INSERT INTO materi (id_pengampu, judul, deskripsi, file_materi, link_video) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE materi SET id_pengampu = $1, judul = $2, deskripsi = $3, file_materi = $4, link_video = $5 WHERE id_materi = $6",
		remove:    "DELETE FROM materi WHERE id_materi = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.MateriPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.Deskripsi, nullable(v.FileMateri), nullable(v.LinkVideo)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.MateriPayload)
			return []interface{}{v.IdPengampu, v.Judul, v.Deskripsi, nullable(v.FileMateri), nullable(v.LinkVideo), id}
		},
		createMsg: "materi created", updateMsg: "materi updated", deleteMsg: "materi deleted",
	},
	"pertemuan": {
		list:      "SELECT id_pertemuan, id_pengampu, no_pertemuan, judul, tanggal FROM pertemuan",
		filterCol: "id_pengampu",
		insert:    "INSERT INTO pertemuan (id_pengampu, no_pertemuan, judul, tanggal) VALUES ($1, $2, $3, $4)",
		update:    "UPDATE pertemuan SET id_pengampu = $1, no_pertemuan = $2, judul = $3, tanggal = $4 WHERE id_pertemuan = $5",
		remove:    "DELETE FROM pertemuan WHERE id_pertemuan = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PertemuanPayload)
			return []interface{}{nullable(v.IdPengampu), v.NoPertemuan, v.Judul, nullable(v.Tanggal)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PertemuanPayload)
			return []interface{}{nullable(v.IdPengampu), v.NoPertemuan, v.Judul, nullable(v.Tanggal), id}
		},
		createMsg: "pertemuan created", updateMsg: "pertemuan updated", deleteMsg: "pertemuan deleted",
	},
	"soal_kuis": {
		list:      "SELECT id_soal, id_kuis, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, poin, urutan FROM soal_kuis",
		filterCol: "id_kuis",
		insert:    "INSERT INTO soal_kuis (id_kuis, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, poin, urutan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
		update:    "UPDATE soal_kuis SET id_kuis = $1, pertanyaan = $2, pilihan_a = $3, pilihan_b = $4, pilihan_c = $5, pilihan_d = $6, kunci_jawaban = $7, poin = $8, urutan = $9 WHERE id_soal = $10",
		remove:    "DELETE FROM soal_kuis WHERE id_soal = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.SoalKuisPayload)
			return []interface{}{v.IdKuis, v.Pertanyaan, v.PilihanA, v.PilihanB, v.PilihanC, v.PilihanD, v.KunciJawaban, v.Poin, v.Urutan}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.SoalKuisPayload)
			return []interface{}{v.IdKuis, v.Pertanyaan, v.PilihanA, v.PilihanB, v.PilihanC, v.PilihanD, v.KunciJawaban, v.Poin, v.Urutan, id}
		},
		createMsg: "soal created", updateMsg: "soal updated", deleteMsg: "soal deleted",
	},
	"hasil_kuis": {
		list:      "SELECT id_hasil, id_kuis, id_siswa, nilai, waktu_mulai, waktu_selesai FROM hasil_kuis",
		filterCol: "id_kuis",
		insert:    "INSERT INTO hasil_kuis (id_kuis, id_siswa, nilai, waktu_mulai, waktu_selesai) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE hasil_kuis SET id_kuis = $1, id_siswa = $2, nilai = $3, waktu_mulai = $4, waktu_selesai = $5 WHERE id_hasil = $6",
		remove:    "DELETE FROM hasil_kuis WHERE id_hasil = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.HasilKuisPayload)
			return []interface{}{v.IdKuis, v.IdSiswa, v.Nilai, v.WaktuMulai, v.WaktuSelesai}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.HasilKuisPayload)
			return []interface{}{v.IdKuis, v.IdSiswa, v.Nilai, v.WaktuMulai, v.WaktuSelesai, id}
		},
		createMsg: "hasil kuis created", updateMsg: "hasil kuis updated", deleteMsg: "hasil kuis deleted",
	},
	"notifikasi": {
		list:      "SELECT id, user_id, judul, isi, jenis, link, is_read, created_at FROM notifikasi",
		filterCol: "user_id",
		insert:    "INSERT INTO notifikasi (user_id, judul, isi, jenis, link) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE notifikasi SET user_id = $1, judul = $2, isi = $3, jenis = $4, link = $5 WHERE id = $6",
		remove:    "DELETE FROM notifikasi WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.NotifikasiPayload)
			return []interface{}{nullable(v.UserID), v.Judul, nullable(v.Isi), nullable(v.Jenis), nullable(v.Link)}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.NotifikasiPayload)
			return []interface{}{nullable(v.UserID), v.Judul, nullable(v.Isi), nullable(v.Jenis), nullable(v.Link), id}
		},
		createMsg: "notifikasi created", updateMsg: "notifikasi updated", deleteMsg: "notifikasi deleted",
	},
	"pengampu": {
		list: `SELECT p.id_pengampu, p.id_guru, p.id_kelas, p.id_mapel, p.tahun_ajaran,
			json_build_object('full_name', g.nama_lengkap, 'role', g.role) AS guru,
			json_build_object('name', m.name, 'code', m.code) AS mapel,
			json_build_object('name', k.name, 'grade', k.grade, 'major', k.major) AS kelas
			FROM pengampu p
			LEFT JOIN profiles g ON p.id_guru = g.id
			LEFT JOIN subjects m ON p.id_mapel = m.id
			LEFT JOIN classes k ON p.id_kelas = k.id`,
		filterCol: "p.tahun_ajaran",
		insert:    "INSERT INTO pengampu (id_guru, id_kelas, id_mapel, tahun_ajaran) VALUES ($1, $2, $3, $4)",
		update:    "UPDATE pengampu SET id_guru = $1, id_kelas = $2, id_mapel = $3, tahun_ajaran = $4 WHERE id_pengampu = $5",
		remove:    "DELETE FROM pengampu WHERE id_pengampu = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.PengampuPayload)
			return []interface{}{v.IdGuru, v.IdKelas, v.IdMapel, v.TahunAjaran}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.PengampuPayload)
			return []interface{}{v.IdGuru, v.IdKelas, v.IdMapel, v.TahunAjaran, id}
		},
		createMsg: "pengampu created", updateMsg: "pengampu updated", deleteMsg: "pengampu deleted",
	},
}

type adminRepo struct{ db *DB }

func NewAdminRepository(db *DB) AdminRepository { return &adminRepo{db: db} }

func (r *adminRepo) Dashboard(ctx context.Context) (map[string]int, error) {
	totalUsers, err := r.db.Count(ctx, "SELECT COUNT(*) FROM profiles")
	if err != nil {
		return nil, err
	}
	totalClasses, err := r.db.Count(ctx, "SELECT COUNT(*) FROM classes")
	if err != nil {
		return nil, err
	}
	totalSubjects, err := r.db.Count(ctx, "SELECT COUNT(*) FROM subjects")
	if err != nil {
		return nil, err
	}
	totalSiswa, err := r.db.Count(ctx, "SELECT COUNT(*) FROM siswa")
	if err != nil {
		return nil, err
	}
	totalGuru, err := r.db.Count(ctx, "SELECT COUNT(*) FROM guru")
	if err != nil {
		return nil, err
	}
	return map[string]int{
		"total_users":    totalUsers,
		"total_classes":  totalClasses,
		"total_subjects": totalSubjects,
		"total_siswa":    totalSiswa,
		"total_guru":     totalGuru,
	}, nil
}

func (r *adminRepo) List(ctx context.Context, resource, filter string) ([]map[string]interface{}, error) {
	spec, ok := specs[resource]
	if !ok {
		return nil, fmt.Errorf("unknown resource %q", resource)
	}
	if filter != "" {
		return r.db.List(ctx, spec.list+" WHERE "+spec.filterCol+" = $1", filter)
	}
	return r.db.List(ctx, spec.list)
}

func (r *adminRepo) Create(ctx context.Context, resource string, payload interface{}) (map[string]interface{}, error) {
	spec, ok := specs[resource]
	if !ok {
		return nil, fmt.Errorf("unknown resource %q", resource)
	}
	row, err := r.db.One(ctx, spec.insert+" RETURNING *", spec.insertArgs(payload)...)
	if err != nil {
		return nil, err
	}
	row["message"] = spec.createMsg
	return row, nil
}

func (r *adminRepo) Update(ctx context.Context, resource, id string, payload interface{}) (map[string]interface{}, error) {
	spec, ok := specs[resource]
	if !ok {
		return nil, fmt.Errorf("unknown resource %q", resource)
	}
	if spec.update == "" || spec.updateArgs == nil {
		return nil, fmt.Errorf("resource %q has no update", resource)
	}
	if err := r.db.Exec(ctx, spec.update, spec.updateArgs(payload, id)...); err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": spec.updateMsg}, nil
}

func (r *adminRepo) Delete(ctx context.Context, resource, id string) (map[string]interface{}, error) {
	spec, ok := specs[resource]
	if !ok {
		return nil, fmt.Errorf("unknown resource %q", resource)
	}
	if err := r.db.Exec(ctx, spec.remove, id); err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": spec.deleteMsg}, nil
}