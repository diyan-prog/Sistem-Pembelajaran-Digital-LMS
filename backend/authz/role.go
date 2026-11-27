// Package authz memuat aturan peran yang dipakai bersama oleh middleware,
// repository, dan service agar tidak ada dua sumber kebenaran.
package authz

import "strings"

// CanonicalRole menyeragamkan label role database menjadi snake_case.
// Contoh: "Tata Usaha" -> "tata_usaha", "Guru Mapel" -> "guru_mapel".
func CanonicalRole(role string) string {
	s := strings.ToLower(strings.TrimSpace(role))
	s = strings.Join(strings.Fields(s), "_")
	return s
}

// RoleMatches membandingkan peran pengguna dengan peran target (mis. target
// pengumuman) dengan sinonim yang setara.
func RoleMatches(canonical, target string) bool {
	t := CanonicalRole(target)
	switch t {
	case "guru", "guru_mapel":
		return canonical == "guru_mapel" || canonical == "guru"
	case "siswa":
		return canonical == "siswa"
	case "wali", "wali_kelas":
		return canonical == "wali_kelas"
	case "kepsek", "kepala_sekolah":
		return canonical == "kepala_sekolah" || canonical == "kepsek"
	case "tu", "tata_usaha", "admin", "admin_all", "super_admin", "super-admin":
		return canonical == "tata_usaha" || canonical == "tu" || canonical == "admin" || canonical == "admin_all" || canonical == "super_admin"
	}
	return t == canonical
}

// IsAdmin memastikan peran termasuk administrator sekolah (Tata Usaha /
// Kepala Sekolah / Admin).
func IsAdmin(canonical string) bool {
	switch canonical {
	case "tata_usaha", "tu", "kepala_sekolah", "kepsek", "admin", "admin_all", "super_admin":
		return true
	}
	return false
}
