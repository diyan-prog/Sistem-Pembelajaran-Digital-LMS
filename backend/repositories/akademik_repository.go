package repositories

import (
	"context"

	"classin/api/authz"
)

// AkademikRepository menyediakan satu snapshot data akademik yang sudah
// dipersempit sesuai peran pengguna. Semua kolom uuid dan enum di-cast ke
// text agar aman di-encode sebagai JSON.
type AkademikRepository struct {
	db *DB
}

func NewAkademikRepository(db *DB) *AkademikRepository {
	return &AkademikRepository{db: db}
}

var (
	queryProfiles = `SELECT id::text, nama_lengkap, email, role::text, status::text, nip_nis,
		foto_profil, hp, alamat, preferensi::text FROM profiles ORDER BY nama_lengkap`
	queryClasses = `SELECT id::text, name, grade, major, academic_year, tingkat,
		jurusan_id::text, wali_kelas_id::text, tahun_ajaran_id::text FROM classes ORDER BY name`
	querySubjects = `SELECT id::text, name, code, category, grade, kelompok FROM subjects ORDER BY name`
	queryJurusan  = `SELECT id::text, nama, kode FROM jurusan ORDER BY kode`
	querySiswa    = `SELECT s.id::text, s.profile_id::text, s.nis, s.nisn, s.status::text,
		s.jenis_kelamin, s.kelas_id::text, p.nama_lengkap, p.email, p.hp, p.alamat, p.foto_profil
		FROM siswa s JOIN profiles p ON s.profile_id = p.id ORDER BY p.nama_lengkap`
	queryPengampu = `SELECT id_pengampu::text, id_guru::text, id_mapel::text,
		id_kelas::text, tahun_ajaran FROM pengampu`
	queryJadwal = `SELECT id::text, hari, to_char(jam_mulai, 'HH24:MI') AS jam_mulai,
		to_char(jam_selesai, 'HH24:MI') AS jam_selesai, ruangan, penugasan_id::text
		FROM jadwal_pelajaran ORDER BY hari, jam_mulai`
	queryTugas = `SELECT id_tugas::text, id_pengampu::text, judul, deskripsi, file_lampiran,
		deadline, created_at FROM tugas ORDER BY deadline DESC`
	queryPengumpulan = `SELECT id_pengumpulan::text, id_tugas::text, id_siswa::text, file_jawaban,
		catatan_siswa, feedback_guru, nilai, status::text, waktu_kumpul FROM pengumpulan_tugas`
	queryKuis = `SELECT id_kuis::text, id_pengampu::text, judul, durasi_menit, status::text,
		waktu_mulai, waktu_selesai, created_at FROM kuis ORDER BY waktu_mulai DESC`
	querySoal = `SELECT id_soal::text, id_kuis::text, pertanyaan, pilihan_a, pilihan_b,
		pilihan_c, pilihan_d, kunci_jawaban::text, poin, urutan FROM soal_kuis ORDER BY urutan`
	queryHasil = `SELECT id_hasil::text, id_kuis::text, id_siswa::text, nilai, waktu_mulai,
		waktu_selesai FROM hasil_kuis`
	queryMateri = `SELECT id_materi::text, id_pengampu::text, judul, deskripsi, file_materi,
		link_video, tanggal_upload FROM materi ORDER BY tanggal_upload DESC`
	queryPertemuan = `SELECT id_pertemuan::text, id_pengampu::text, no_pertemuan, judul,
		tanggal FROM pertemuan ORDER BY no_pertemuan`
	queryPresensi = `SELECT id_presensi::text, id_pengampu::text, id_siswa::text, tanggal,
		status::text, dicatat_oleh::text FROM presensi ORDER BY tanggal`
	queryPresensiSesi = `SELECT id::text, pengampu_id::text, pertemuan_ke, tanggal,
		jam, topik, status FROM presensi_sesi ORDER BY pertemuan_ke`
	queryPengumuman = `SELECT id::text, judul, isi, kategori, penting, dibuat_oleh,
		target_kelas_id::text, target_role, created_at FROM pengumuman ORDER BY created_at DESC`
	queryNotifikasi = `SELECT id::text, user_id::text, judul, isi, jenis, link, is_read,
		created_at FROM notifikasi ORDER BY created_at DESC`
	queryTahunAjaran = `SELECT id::text, nama, semester, is_active FROM tahun_ajaran ORDER BY nama`
)

// Bootstrap mengembalikan data akademik yang boleh dibaca oleh pengguna.
// Peran diambil dari tabel profiles, bukan dari klaim JWT (klaim role Supabase
// bernilai "authenticated").
func (r *AkademikRepository) Bootstrap(ctx context.Context, userID string) (map[string]interface{}, error) {
	me, err := r.db.One(ctx, `SELECT id::text, nama_lengkap, email, role::text, status::text,
		nip_nis, foto_profil, hp, alamat, preferensi::text FROM profiles WHERE id = $1::uuid`, userID)
	if err != nil {
		return nil, err
	}
	role := str(me["role"])

	profiles, err := r.db.List(ctx, queryProfiles)
	if err != nil {
		return nil, err
	}
	classes, err := r.db.List(ctx, queryClasses)
	if err != nil {
		return nil, err
	}
	subjects, err := r.db.List(ctx, querySubjects)
	if err != nil {
		return nil, err
	}
	jurusan, err := r.db.List(ctx, queryJurusan)
	if err != nil {
		return nil, err
	}
	siswa, err := r.db.List(ctx, querySiswa)
	if err != nil {
		return nil, err
	}
	pengampu, err := r.db.List(ctx, queryPengampu)
	if err != nil {
		return nil, err
	}
	jadwal, err := r.db.List(ctx, queryJadwal)
	if err != nil {
		return nil, err
	}
	tugas, err := r.db.List(ctx, queryTugas)
	if err != nil {
		return nil, err
	}
	pengumpulan, err := r.db.List(ctx, queryPengumpulan)
	if err != nil {
		return nil, err
	}
	kuis, err := r.db.List(ctx, queryKuis)
	if err != nil {
		return nil, err
	}
	soal, err := r.db.List(ctx, querySoal)
	if err != nil {
		return nil, err
	}
	hasil, err := r.db.List(ctx, queryHasil)
	if err != nil {
		return nil, err
	}
	materi, err := r.db.List(ctx, queryMateri)
	if err != nil {
		return nil, err
	}
	pertemuan, err := r.db.List(ctx, queryPertemuan)
	if err != nil {
		return nil, err
	}
	presensi, err := r.db.List(ctx, queryPresensi)
	if err != nil {
		return nil, err
	}
	presensiSesi, err := r.db.List(ctx, queryPresensiSesi)
	if err != nil {
		return nil, err
	}
	pengumuman, err := r.db.List(ctx, queryPengumuman)
	if err != nil {
		return nil, err
	}
	notifikasi, err := r.db.List(ctx, queryNotifikasi)
	if err != nil {
		return nil, err
	}
	tahunAjaran, err := r.db.List(ctx, queryTahunAjaran)
	if err != nil {
		return nil, err
	}

	canonical := authz.CanonicalRole(role)
	kelasAkses := map[string]bool{}
	siswaAkses := map[string]bool{}

	switch canonical {
	case "guru_mapel", "guru":
		for _, p := range pengampu {
			if str(p["id_guru"]) == userID {
				kelasAkses[str(p["id_kelas"])] = true
			}
		}
		for _, s := range siswa {
			if kelasAkses[str(s["kelas_id"])] {
				siswaAkses[str(s["profile_id"])] = true
			}
		}
	case "wali_kelas":
		for _, k := range classes {
			if str(k["wali_kelas_id"]) == userID {
				kelasAkses[str(k["id"])] = true
			}
		}
		for _, s := range siswa {
			if kelasAkses[str(s["kelas_id"])] {
				siswaAkses[str(s["profile_id"])] = true
			}
		}
	case "siswa":
		for _, s := range siswa {
			if str(s["profile_id"]) == userID {
				kelasAkses[str(s["kelas_id"])] = true
			}
		}
		for _, s := range siswa {
			if kelasAkses[str(s["kelas_id"])] {
				siswaAkses[str(s["profile_id"])] = true
			}
		}
	case "kepala_sekolah", "kepsek", "tata_usaha", "tu", "super_admin", "admin", "admin_all":
		for _, k := range classes {
			kelasAkses[str(k["id"])] = true
		}
		for _, s := range siswa {
			siswaAkses[str(s["profile_id"])] = true
		}
	}

	// Batasi kelas dan pengampu sesuai akses.
	kelasOut := make([]map[string]interface{}, 0, len(classes))
	for _, k := range classes {
		if kelasAkses[str(k["id"])] {
			kelasOut = append(kelasOut, k)
		}
	}
	pengampuOut := make([]map[string]interface{}, 0, len(pengampu))
	pengampuAkses := map[string]bool{}
	for _, p := range pengampu {
		if kelasAkses[str(p["id_kelas"])] {
			pengampuOut = append(pengampuOut, p)
			pengampuAkses[str(p["id_pengampu"])] = true
		}
	}

	siswaOut := make([]map[string]interface{}, 0, len(siswa))
	for _, s := range siswa {
		if siswaAkses[str(s["profile_id"])] {
			siswaOut = append(siswaOut, s)
		}
	}

	jadwalOut := filterBy(jadwal, "penugasan_id", pengampuAkses)
	tugasOut := filterBy(tugas, "id_pengampu", pengampuAkses)
	kuisOut := filterBy(kuis, "id_pengampu", pengampuAkses)
	materiOut := filterBy(materi, "id_pengampu", pengampuAkses)
	pertemuanOut := filterBy(pertemuan, "id_pengampu", pengampuAkses)
	presensiOut := filterBy(presensi, "id_pengampu", pengampuAkses)
	presensiSesiOut := filterBy(presensiSesi, "pengampu_id", pengampuAkses)

	tugasAkses := idSet(tugasOut, "id_tugas")
	kuisAkses := idSet(kuisOut, "id_kuis")
	pengumpulanOut := filterBy(pengumpulan, "id_tugas", tugasAkses)
	soalOut := filterBy(soal, "id_kuis", kuisAkses)
	hasilOut := filterBy(hasil, "id_kuis", kuisAkses)

	// Siswa hanya boleh melihat data miliknya sendiri.
	if canonical == "siswa" {
		pengumpulanOut = filterBy(pengumpulanOut, "id_siswa", map[string]bool{userID: true})
		hasilOut = filterBy(hasilOut, "id_siswa", map[string]bool{userID: true})
		presensiOut = filterBy(presensiOut, "id_siswa", map[string]bool{userID: true})
	}

	pengumumanOut := make([]map[string]interface{}, 0, len(pengumuman))
	notifOut := make([]map[string]interface{}, 0, len(notifikasi))
	for _, p := range pengumuman {
		targetRole := str(p["target_role"])
		targetKelas := str(p["target_kelas_id"])
		if targetRole != "" && !authz.RoleMatches(canonical, targetRole) {
			continue
		}
		if targetKelas != "" && !kelasAkses[targetKelas] {
			continue
		}
		pengumumanOut = append(pengumumanOut, p)
	}
	for _, n := range notifikasi {
		uid := str(n["user_id"])
		if uid == "" || uid == userID {
			notifOut = append(notifOut, n)
		}
	}

	// Siswa tidak boleh menerima kunci jawaban: kuis dikerjakan di klien.
	if canonical == "siswa" {
		for _, s := range soalOut {
			delete(s, "kunci_jawaban")
		}
	}

	// Profil yang boleh dilihat: diri sendiri, siswa dalam akses, guru pengampu,
	// dan wali kelas. Peran administratif melihat seluruh profil.
	fullProfiles := false
	switch canonical {
	case "kepala_sekolah", "kepsek", "tata_usaha", "tu", "super_admin", "admin", "admin_all":
		fullProfiles = true
	}
	profilAkses := map[string]bool{userID: true}
	for _, s := range siswaOut {
		profilAkses[str(s["profile_id"])] = true
	}
	for _, p := range pengampuOut {
		profilAkses[str(p["id_guru"])] = true
	}
	for _, k := range kelasOut {
		if w := str(k["wali_kelas_id"]); w != "" {
			profilAkses[w] = true
		}
	}

	// Profil guru/teman sekelas cukup; jangan bocorkan preferensi pengguna lain.
	profilesOut := make([]map[string]interface{}, 0, len(profiles))
	for _, p := range profiles {
		if !fullProfiles && !profilAkses[str(p["id"])] {
			continue
		}
		profilesOut = append(profilesOut, map[string]interface{}{
			"id":           p["id"],
			"nama_lengkap": p["nama_lengkap"],
			"email":        p["email"],
			"role":         p["role"],
			"status":       p["status"],
			"nip_nis":      p["nip_nis"],
			"foto_profil":  p["foto_profil"],
		})
	}

	return map[string]interface{}{
		"me":            me,
		"role":          canonical,
		"profiles":      profilesOut,
		"classes":       kelasOut,
		"subjects":      subjects,
		"jurusan":       jurusan,
		"siswa":         siswaOut,
		"pengampu":      pengampuOut,
		"jadwal":        jadwalOut,
		"tugas":         tugasOut,
		"pengumpulan":   pengumpulanOut,
		"kuis":          kuisOut,
		"soal":          soalOut,
		"hasil_kuis":    hasilOut,
		"materi":        materiOut,
		"pertemuan":     pertemuanOut,
		"presensi":      presensiOut,
		"presensi_sesi": presensiSesiOut,
		"pengumuman":    pengumumanOut,
		"notifikasi":    notifOut,
		"tahun_ajaran":  tahunAjaran,
		"scope": map[string]interface{}{
			"kelas_ids":    keys(kelasAkses),
			"pengampu_ids": keys(pengampuAkses),
			"user_id":      userID,
			"role":         canonical,
		},
	}, nil
}

func str(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func index(rows []map[string]interface{}, key string) map[string]map[string]interface{} {
	out := make(map[string]map[string]interface{}, len(rows))
	for _, row := range rows {
		out[str(row[key])] = row
	}
	return out
}

func idSet(rows []map[string]interface{}, key string) map[string]bool {
	out := make(map[string]bool, len(rows))
	for _, row := range rows {
		out[str(row[key])] = true
	}
	return out
}

func filterBy(rows []map[string]interface{}, key string, allowed map[string]bool) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(rows))
	for _, row := range rows {
		if allowed[str(row[key])] {
			out = append(out, row)
		}
	}
	return out
}

func keys(m map[string]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		if k != "" {
			out = append(out, k)
		}
	}
	return out
}
