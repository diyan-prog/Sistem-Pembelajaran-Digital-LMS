package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/supabase-community/supabase-go"
)

// Role-based middleware
type RoleKey string

const (
	RoleAdminAll   RoleKey = "admin_all"
	RoleAdmin      RoleKey = "admin"
	RoleTu         RoleKey = "tu"
	RoleKepsek     RoleKey = "kepsek"
	RoleAdminAllAll RoleKey = "admin_all_all"
)

func RoleMiddleware(allowed ...RoleKey) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get role from JWT token (assume "role" claim)
			roleClaim, ok := c.Get("role").(string)
			if !ok {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing role claim"})
			}
			for _, allowedRole := range allowed {
				if strings.EqualFold(string(allowedRole), roleClaim) {
					return next(c)
				}
			}
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden"})
		}
	}
	}
}

// Helper to get role from request context (placeholder)
func dbRoleFromClaim(ok bool, dbRole string) string {
	if !ok {
		return "unknown"
	}
	return dbRole
}

// Generic CRUD handlers

// GET /admin/profiles -> list profiles (optionally filter by role)
func GetAdminProfiles(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT id, full_name, email, role, status, nip_nis FROM profiles"
	if role != "" {
		query += " WHERE role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var profiles []map[string]interface{}
	for rows.Next() {
		var p map[string]interface{}
		if err := rows.Scan(&p["id"], &p["full_name"], &p["email"], &p["role"], &p["status"], &p["nip_nis"]); err != nil {
			continue
		}
		profiles = append(profiles, p)
	}
	return c.JSON(http.StatusOK, profiles)
}

// POST /admin/profiles -> create profile
func CreateAdminProfile(c echo.Context) error {
	var payload struct {
		full_name string `json:"full_name"`
		email     string `json:"email"`
		role      string `json:"role"`
		status    string `json:"status"`
		nip_nis   string `json:"nip_nis"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO profiles (full_name, email, role, status, nip_nis) VALUES ($1, $2, $3, $4, $5)",
		payload.full_name, payload.email, payload.role, payload.status, payload.nip_nis)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "profile created"})
}

// PUT /admin/profiles/:id -> update profile
func UpdateAdminProfile(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		full_name string `json:"full_name"`
		email     string `json:"email"`
		role      string `json:"role"`
		status    string `json:"status"`
		nip_nis   string `json:"nip_nis"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE profiles SET full_name = $1, email = $2, role = $3, status = $4, nip_nis = $5 WHERE id = $6",
		payload.full_name, payload.email, payload.role, payload.status, payload.nip_nis, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "profile updated"})
}

// DELETE /admin/profiles/:id -> delete profile
func DeleteAdminProfile(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM profiles WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "profile deleted"})
}

// GET /admin/classes -> list classes with jurusan
func GetAdminClasses(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT id, name, grade, major, tingkat, jurusan_id, jurusan_name FROM classes"
	if role != "" {
		query += " WHERE role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var classes []map[string]interface{}
	for rows.Next() {
		var cl map[string]interface{}
		if err := rows.Scan(&cl["id"], &cl["name"], &cl["grade"], &cl["major"], &cl["tingkat"], &cl["jurusan_id"], &cl["jurusan_name"]); err != nil {
			continue
		}
		classes = append(classes, cl)
	}
	return c.JSON(http.StatusOK, classes)
}

// POST /admin/classes -> create class
func CreateAdminClass(c echo.Context) error {
	var payload struct {
		name      string `json:"name"`
		grade     int    `json:"grade"`
		major     string `json:"major"`
		tingkat   int    `json:"tingkat"`
		jurusan_id string `json:"jurusan_id"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO classes (name, grade, major, tingkat, jurusan_id) VALUES ($1, $2, $3, $4, $5)",
		payload.name, payload.grade, payload.major, payload.tingkat, payload.jurusan_id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "class created"})
}

// PUT /admin/classes/:id -> update class
func UpdateAdminClass(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		name      string `json:"name"`
		grade     int    `json:"grade"`
		major     string `json:"major"`
		tingkat   int    `json:"tingkat"`
		jurusan_id string `json:"jurusan_id"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE classes SET name = $1, grade = $2, major = $3, tingkat = $4, jurusan_id = $5 WHERE id = $6",
		payload.name, payload.grade, payload.major, payload.tingkat, payload.jurusan_id, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "class updated"})
}

// DELETE /admin/classes/:id -> delete class
func DeleteAdminClass(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM classes WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "class deleted"})
}

// GET /admin/jurusan -> list jurusan
func GetAdminJurusan(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT id, nama, kode FROM jurusan"
	if role != "" {
		query += " WHERE role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var jurusan []map[string]interface{}
	for rows.Next() {
		var j map[string]interface{}
		if err := rows.Scan(&j["id"], &j["nama"], &j["kode"]); err != nil {
			continue
		}
		jurusan = append(jurusan, j)
	}
	return c.JSON(http.StatusOK, jurusan)
}

// POST /admin/jurusan -> create jurusan
func CreateAdminJurusan(c echo.Context) error {
	var payload struct {
		nama  string `json:"nama"`
		kode  string `json:"kode"`
		role  string `json:"role"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO jurusan (nama, kode, role) VALUES ($1, $2, $3)",
		payload.nama, payload.kode, payload.role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "jurusan created"})
}

// PUT /admin/jurusan/:id -> update jurusan
func UpdateAdminJurusan(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		nama  string `json:"nama"`
		kode  string `json:"kode"`
		role  string `json:"role"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE jurusan SET nama = $1, kode = $2, role = $3 WHERE id = $4",
		payload.nama, payload.kode, payload.role, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "jurusan updated"})
}

// DELETE /admin/jurusan/:id -> delete jurusan
func DeleteAdminJurusan(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM jurusan WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "jurusan deleted"})
}

// GET /admin/mapel -> list mapel with teacher
func GetAdminMapel(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT id_mapel, kode_mapel, nama_mapel, teacher_name FROM mapel"
	if role != "" {
		query += " WHERE role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var mapel []map[string]interface{}
	for rows.Next() {
		var m map[string]interface{}
		if err := rows.Scan(&m["id_mapel"], &m["kode_mapel"], &m["nama_mapel"], &m["teacher_name"]); err != nil {
			continue
		}
		mapel = append(mapel, m)
	}
	return c.JSON(http.StatusOK, mapel)
}

// POST /admin/mapel -> create mapel
func CreateAdminMapel(c echo.Context) error {
	var payload struct {
		kode_mapel string `json:"kode_mapel"`
		nama_mapel string `json:"nama_mapel"`
		teacher_id string `json:"teacher_id"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO mapel (kode_mapel, nama_mapel, teacher_id) VALUES ($1, $2, $3)",
		payload.kode_mapel, payload.nama_mapel, payload.teacher_id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "mapel created"})
}

// PUT /admin/mapel/:id -> update mapel
func UpdateAdminMapel(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		kode_mapel string `json:"kode_mapel"`
		nama_mapel string `json:"nama_mapel"`
		teacher_id string `json:"teacher_id"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE mapel SET kode_mapel = $1, nama_mapel = $2, teacher_id = $3 WHERE id_mapel = $4",
		payload.kode_mapel, payload.nama_mapel, payload.teacher_id, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "mapel updated"})
}

// DELETE /admin/mapel/:id -> delete mapel
func DeleteAdminMapel(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM mapel WHERE id_mapel = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "mapel deleted"})
}

// GET /admin/siswa -> list siswa with profile
func GetAdminSiswa(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT s.id, s.nis, s.nisn, s.status, s.jenis_kelamin, s.cls_id, s.cls_name, p.full_name, p.email, p.role, p.status FROM siswa s JOIN profiles p ON s.profile_id = p.id"
	if role != "" {
		query += " WHERE s.role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var siswa []map[string]interface{}
	for rows.Next() {
		var s map[string]interface{}
		if err := rows.Scan(&s["id"], &s["nis"], &s["nisn"], &s["status"], &s["jenis_kelamin"], &s["cls_id"], &s["cls_name"], &s["full_name"], &s["email"], &s["role"], &s["status"]); err != nil {
			continue
		}
		siswa = append(siswa, s)
	}
	return c.JSON(http.StatusOK, siswa)
}

// POST /admin/siswa -> create siswa (requires profile_id)
func CreateAdminSiswa(c echo.Context) error {
	var payload struct {
		nis      string `json:"nis"`
		nisn     string `json:"nisn"`
		cls_id   string `json:"cls_id"`
		cls_name string `json:"cls_name"`
		status   string `json:"status"`
		full_name string `json:"full_name"`
		email    string `json:"email"`
		nip_nis  string `json:"nip_nis"`
		role     string `json:"role"`
		status_  string `json:"status_"` // status in profiles
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO siswa (nis, nisn, cls_id, cls_name, status, full_name, email, nip_nis, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)",
		payload.nis, payload.nisn, payload.cls_id, payload.cls_name, payload.status, payload.full_name, payload.email, payload.nip_nis, payload.role, payload.status_)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "siswa created"})
}

// PUT /admin/siswa/:id -> update siswa
func UpdateAdminSiswa(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		nis      string `json:"nis"`
		nisn     string `json:"nisn"`
		cls_id   string `json:"cls_id"`
		cls_name string `json:"cls_name"`
		status   string `json:"status"`
		full_name string `json:"full_name"`
		email    string `json:"email"`
		nip_nis  string `json:"nip_nis"`
		role     string `json:"role"`
		status_  string `json:"status_"` // status in profiles
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE siswa SET nis = $1, nisn = $2, cls_id = $2, cls_name = $4, status = $5, full_name = $6, email = $7, nip_nis = $7, role = $8, status = $9 WHERE id = $10",
		payload.nis, payload.nisn, payload.cls_id, payload.cls_name, payload.status, payload.full_name, payload.email, payload.nip_nis, payload.role, payload.status_, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "siswa updated"})
}

// DELETE /admin/siswa/:id -> delete siswa
func DeleteAdminSiswa(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM siswa WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "siswa deleted"})
}

// GET /admin/guru -> list guru with profile
func GetAdminGuru(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT g.id, g.nip, g.profile_id, g.status, p.full_name, p.email, p.role, p.status FROM guru g JOIN profiles p ON g.profile_id = p.id"
	if role != "" {
		query += " WHERE g.role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var guru []map[string]interface{}
	for rows.Next() {
		var g map[string]interface{}
		if err := rows.Scan(&g["id"], &g["nip"], &g["profile_id"], &g["status"], &g["full_name"], &g["email"], &g["role"], &g["status"]); err != nil {
			continue
		}
		guru = append(guru, g)
	}
	return c.JSON(http.StatusOK, guru)
}

// POST /admin/guru -> create guru
func CreateAdminGuru(c echo.Context) error {
	var payload struct {
		nip      string `json:"nip"`
		profile_id string `json:"profile_id"`
		status   string `json:"status"`
		full_name string `json:"full_name"`
		email    string `json:"email"`
		role     string `json:"role"`
		status_  string `json:"status_"` // status in profiles
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO guru (nip, profile_id, status, full_name, email, role) VALUES ($1, $2, $3, $4, $5, $6)",
		payload.nip, payload.profile_id, payload.status, payload.full_name, payload.email, payload.role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "guru created"})
}

// PUT /admin/guru/:id -> update guru
func UpdateAdminGuru(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		nip      string `json:"nip"`
		profile_id string `json:"profile_id"`
		status   string `json:"status"`
		full_name string `json:"full_name"`
		email    string `json:"email"`
		role     string `json:"role"`
		status_  string `json:"status_"` // status in profiles
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE guru SET nip = $1, profile_id = $2, status = $3, full_name = $4, email = $5, role = $5 WHERE id = $6",
		payload.nip, payload.profile_id, payload.status, payload.full_name, payload.email, payload.role, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "guru updated"})
}

// DELETE /admin/guru/:id -> delete guru
func DeleteAdminGuru(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM guru WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "guru deleted"})
}

// GET /admin/jadwal -> list jadwal with penugasan
func GetAdminJadwal(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT j.id, j.hari, j.jam_mulai, j.jam_selesai, j.ruangan, j.penugasan_id, j.ruangan_name, p.full_name, p.nip FROM jadwal_pelajaran j JOIN profiles p ON j.penugasan_id = p.id"
	if role != "" {
		query += " WHERE j.role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var jadwal []map[string]interface{}
	for rows.Next() {
		var j map[string]interface{}
		if err := rows.Scan(&j["id"], &j["hari"], &j["jam_mulai"], &j["jam_selesai"], &j["ruangan"], &j["penugasan_id"], &j["ruangan_name"], &j["full_name"], &j["nip"]); err != nil {
			continue
		}
		jadwal = append(jadwal, j)
	}
	return c.JSON(http.StatusOK, jadwal)
}

// POST /admin/jadwal -> create jadwal
func CreateAdminJadwal(c echo.Context) error {
	var payload struct {
		hari       string `json:"hari"`
		jam_mulai  string `json:"jam_mulai"`
		jam_selesai string `json:"jam_selesai"`
		penugasan_id string `json:"penugasan_id"`
		ruangan    string `json:"ruangan"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO jadwal_pelajaran (hari, jam_mulai, jam_selesai, penugasan_id, ruangan) VALUES ($1, $2, $3, $4, $5)",
		payload.hari, payload.jam_mulai, payload.jam_selesai, payload.penugasan_id, payload.ruangan)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "jadwal created"})
}

// PUT /admin/jadwal/:id -> update jadwal
func UpdateAdminJadwal(c echo.Context) error {
	id := c.Param("id")
	var payload struct {
		hari       string `json:"hari"`
		jam_mulai  string `json:"jam_mulai"`
		jam_selesai string `json:"jam_selesai"`
		penugasan_id string `json:"penugasan_id"`
		ruangan    string `json:"ruangan"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"UPDATE jadwal_pelajaran SET hari = $1, jam_mulai = $2, jam_selesai = $3, penugasan_id = $4, ruangan = $5 WHERE id = $5",
		payload.hari, payload.jam_mulai, payload.jam_selesai, payload.penugasan_id, payload.ruangan, id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "jadwal updated"})
}

// DELETE /admin/jadwal/:id -> delete jadwal
func DeleteAdminJadwal(c echo.Context) error {
	id := c.Param("id")
	_, err := dbPool.Exec(context.Background(), "DELETE FROM jadwal_pelajaran WHERE id = $1", id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "jadwal deleted"})
}

// GET /admin/log -> list activity log
func GetAdminLog(c echo.Context) error {
	role := c.QueryParam("role")
	query := "SELECT id, user_id, action, timestamp, description FROM log_aktivitas"
	if role != "" {
		query += " WHERE role = $1"
	}
	rows, err := dbPool.Query(context.Background(), query, role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	defer rows.Close()

	var log []map[string]interface{}
	for rows.Next() {
		var l map[string]interface{}
		if err := rows.Scan(&l["id"], &l["user_id"], &l["action"], &l["timestamp"], &l["description"]); err != nil {
			continue
		}
		log = append(log, l)
	}
	return c.JSON(http.StatusOK, log)
}

// POST /admin/log -> log activity (admin action)
func CreateAdminLog(c echo.Context) error {
	var payload struct {
		user_id string `json:"user_id"`
		action  string `json:"action"`
		description string `json:"description"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	_, err := dbPool.Exec(context.Background(),
		"INSERT INTO log_aktivitas (user_id, action, description) VALUES ($1, $2, $3)",
		payload.user_id, payload.action, payload.description)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, map[string]string{"message": "activity logged"})
}

// GET /admin/dashboard -> summary stats
func GetAdminDashboard(c echo.Context) error {
	// Simple aggregated queries for dashboard
	// total users
	var totalUsers int
	dbPool.QueryRow(context.Background(), "SELECT COUNT(*) FROM profiles").Scan(&totalUsers)

	// total classes
	var totalClasses int
	dbPool.QueryRow(context.Background(), "SELECT COUNT(*) FROM classes").Scan(&totalClasses)

	// total subjects
	var totalSubjects int
	dbPool.QueryRow(context.Background(), "SELECT COUNT(*) FROM mapel").Scan(&totalSubjects)

	return c.JSON(http.StatusOK, map[string]int{
		"total_users":    totalUsers,
		"total_classes":  totalClasses,
		"total_subjects": totalSubjects,
	})
}

// Register admin routes
func RegisterAdminRoutes(e *echo.Echo) {
	admin := e.Group("/admin")
	admin.Use(SupabaseAuth()) // reuse existing auth middleware
	admin.Use(middleware.Logger())
	admin.Use(middleware.Recover())

	// role-based middleware for admin group
	admin.Use(RoleMiddleware(RoleAdminAll, RoleAdmin, RoleTu, RoleKepsek))

	// Dashboard
	admin.GET("/dashboard", GetAdminDashboard)

	// Profiles
	admin.GET("/profiles", GetAdminProfiles)
	admin.POST("/profiles", CreateAdminProfile)
	admin.PUT("/profiles/:id", UpdateAdminProfile)
	admin.DELETE("/profiles/:id", DeleteAdminProfile)

	// Classes
	admin.GET("/classes", GetAdminClasses)
	admin.POST("/classes", CreateAdminClass)
	admin.PUT("/classes/:id", UpdateAdminClass)
	admin.DELETE("/classes/:id", DeleteAdminClass)

	// Jurusan
	admin.GET("/jurusan", GetAdminJurusan)
	admin.POST("/jurusan", CreateAdminJurusan)
	admin.PUT("/jurusan/:id", UpdateAdminJurusan)
	admin.DELETE("/jurusan/:id", DeleteAdminJurusan)

	// Mapel
	admin.GET("/mapel", GetAdminMapel)
	admin.POST("/mapel", CreateAdminMapel)
	admin.PUT("/mapel/:id", UpdateAdminMapel)
	admin.DELETE("/mapel/:id", DeleteAdminMapel)

	// Siswa
	admin.GET("/siswa", GetAdminSiswa)
	admin.POST("/siswa", CreateAdminSiswa)
	admin.PUT("/siswa/:id", UpdateAdminSiswa)
	admin.DELETE("/siswa/:id", DeleteAdminSiswa)

	// Guru
	admin.GET("/guru", GetAdminGuru)
	admin.POST("/guru", CreateAdminGuru)
	admin.PUT("/guru/:id", UpdateAdminGuru)
	admin.DELETE("/guru/:id", DeleteAdminGuru)

	// Jadwal
	admin.GET("/jadwal", GetAdminJadwal)
	admin.POST("/jadwal", CreateAdminJadwal)
	admin.PUT("/jadwal/:id", UpdateAdminJadwal)
	admin.DELETE("/jadwal/:id", DeleteAdminJadwal)

	// Log
	admin.GET("/log", GetAdminLog)
	admin.POST("/log", CreateAdminLog)
}