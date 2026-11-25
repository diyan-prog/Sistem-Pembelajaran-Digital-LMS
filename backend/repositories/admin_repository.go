package repositories

import (
	"context"
	"fmt"

	"classin/api/models"
)

type AdminRepository interface {
	Dashboard(ctx context.Context) (map[string]int, error)
	List(ctx context.Context, resource, filter string) ([]map[string]interface{}, error)
	Create(ctx context.Context, resource string, payload interface{}) (map[string]interface{}, error)
	Update(ctx context.Context, resource, id string, payload interface{}) (map[string]interface{}, error)
	Delete(ctx context.Context, resource, id string) (map[string]interface{}, error)
}

type resourceSpec struct {
	list        string
	filterCol   string
	insert      string
	update      string
	remove      string
	insertArgs  func(interface{}) []interface{}
	updateArgs  func(interface{}, string) []interface{}
	createMsg   string
	updateMsg   string
	deleteMsg   string
}

var specs = map[string]resourceSpec{
	"classes": {
		list:      "SELECT id, name, grade, major, tingkat, jurusan_id FROM classes",
		filterCol: "major",
		insert:    "INSERT INTO classes (name, grade, major, tingkat, jurusan_id) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE classes SET name = $1, grade = $2, major = $3, tingkat = $4, jurusan_id = $5 WHERE id = $6",
		remove:    "DELETE FROM classes WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.ClassPayload)
			return []interface{}{v.Name, v.Grade, v.Major, v.Tingkat, v.JurusanID}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.ClassPayload)
			return []interface{}{v.Name, v.Grade, v.Major, v.Tingkat, v.JurusanID, id}
		},
		createMsg: "class created", updateMsg: "class updated", deleteMsg: "class deleted",
	},
	"jurusan": {
		list:      "SELECT id, nama, kode FROM jurusan",
		filterCol: "kode",
		insert:    "INSERT INTO jurusan (nama, kode, role) VALUES ($1, $2, $3)",
		update:    "UPDATE jurusan SET nama = $1, kode = $2, role = $3 WHERE id = $4",
		remove:    "DELETE FROM jurusan WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.JurusanPayload)
			return []interface{}{v.Nama, v.Kode, v.Role}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.JurusanPayload)
			return []interface{}{v.Nama, v.Kode, v.Role, id}
		},
		createMsg: "jurusan created", updateMsg: "jurusan updated", deleteMsg: "jurusan deleted",
	},
	"mapel": {
		list:      "SELECT id_mapel, kode_mapel, nama_mapel, teacher_name FROM mapel",
		filterCol: "role",
		insert:    "INSERT INTO mapel (kode_mapel, nama_mapel, teacher_id) VALUES ($1, $2, $3)",
		update:    "UPDATE mapel SET kode_mapel = $1, nama_mapel = $2, teacher_id = $3 WHERE id_mapel = $4",
		remove:    "DELETE FROM mapel WHERE id_mapel = $1",
		insertArgs: func(p interface{}) []interface{} {
			return p.(models.MapelPayload).Values()
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			return append(p.(models.MapelPayload).Values(), id)
		},
		createMsg: "mapel created", updateMsg: "mapel updated", deleteMsg: "mapel deleted",
	},
	"siswa": {
		list:      "SELECT s.id, s.nis, s.nisn, s.status, s.jenis_kelamin, s.cls_id, s.cls_name, p.full_name, p.email, p.role, p.status AS status_profiles FROM siswa s JOIN profiles p ON s.profile_id = p.id",
		filterCol: "s.role",
		insert:    "INSERT INTO siswa (nis, nisn, cls_id, cls_name, status, full_name, email, nip_nis, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
		update:    "UPDATE siswa SET nis = $1, nisn = $2, cls_id = $3, cls_name = $4, status = $5, full_name = $6, email = $7, nip_nis = $8, role = $9, status = $10 WHERE id = $10",
		remove:    "DELETE FROM siswa WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.SiswaPayload)
			return []interface{}{v.Nis, v.Nisn, v.ClsID, v.ClsName, v.Status, v.FullName, v.Email, v.NipNis, v.Role, v.StatusP}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.SiswaPayload)
			return []interface{}{v.Nis, v.Nisn, v.ClsID, v.ClsName, v.Status, v.FullName, v.Email, v.NipNis, v.Role, v.StatusP, id}
		},
		createMsg: "siswa created", updateMsg: "siswa updated", deleteMsg: "siswa deleted",
	},
	"guru": {
		list:      "SELECT g.id, g.nip, g.profile_id, g.status, p.full_name, p.email, p.role, p.status AS status_p FROM guru g JOIN profiles p ON g.profile_id = p.id",
		filterCol: "g.role",
		insert:    "INSERT INTO guru (nip, profile_id, status, full_name, email, role) VALUES ($1, $2, $3, $4, $5, $6)",
		update:    "UPDATE guru SET nip = $1, profile_id = $2, status = $3, full_name = $4, email = $5, role = $5 WHERE id = $7",
		remove:    "DELETE FROM guru WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.GuruPayload)
			return []interface{}{v.Nip, v.ProfileID, v.Status, v.FullName, v.Email, v.Role}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.GuruPayload)
			return []interface{}{v.Nip, v.ProfileID, v.Status, v.FullName, v.Email, v.Role, id}
		},
		createMsg: "guru created", updateMsg: "guru updated", deleteMsg: "guru deleted",
	},
	"jadwal": {
		list:      "SELECT j.id, j.hari, j.jam_mulai, j.jam_selesai, j.ruangan, j.penugasan_id, j.ruangan_name, p.full_name, p.nip FROM jadwal_pelajaran j JOIN profiles p ON j.penugasan_id = p.id",
		filterCol: "j.role",
		insert:    "INSERT INTO jadwal_pelajaran (hari, jam_mulai, jam_selesai, penugasan_id, ruangan) VALUES ($1, $2, $3, $4, $5)",
		update:    "UPDATE jadwal_pelajaran SET hari = $1, jam_mulai = $2, jam_selesai = $3, penugasan_id = $4, ruangan = $5 WHERE id = $6",
		remove:    "DELETE FROM jadwal_pelajaran WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			v := p.(models.JadwalPayload)
			return []interface{}{v.Hari, v.JamMulai, v.JamSelesai, v.PenugasanID, v.Ruangan}
		},
		updateArgs: func(p interface{}, id string) []interface{} {
			v := p.(models.JadwalPayload)
			return []interface{}{v.Hari, v.JamMulai, v.JamSelesai, v.PenugasanID, v.Ruangan, id}
		},
		createMsg: "jadwal created", updateMsg: "jadwal updated", deleteMsg: "jadwal deleted",
	},
	"log": {
		list:      "SELECT id, user_id, action, timestamp, description FROM log_aktivitas",
		filterCol: "role",
		insert:    "INSERT INTO log_aktivitas (user_id, action, description) VALUES ($1, $2, $3)",
		remove:    "DELETE FROM log_aktivitas WHERE id = $1",
		insertArgs: func(p interface{}) []interface{} {
			return p.(models.LogPayload).Values()
		},
		createMsg: "activity logged", deleteMsg: "activity deleted",
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
	totalSubjects, err := r.db.Count(ctx, "SELECT COUNT(*) FROM mapel")
	if err != nil {
		return nil, err
	}
	return map[string]int{
		"total_users":    totalUsers,
		"total_classes":  totalClasses,
		"total_subjects": totalSubjects,
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
	if err := r.db.Exec(ctx, spec.insert, spec.insertArgs(payload)...); err != nil {
		return nil, err
	}
	return map[string]interface{}{"message": spec.createMsg}, nil
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
