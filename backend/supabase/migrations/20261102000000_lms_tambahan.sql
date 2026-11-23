-- ============================================================
-- FASE 1 (LANJUTAN): TABEL TAMBAHAN YANG BELUM ADA
-- Melengkapi tabel eksisting (users, classes, subjects, dll.)
-- ============================================================

-- 1. Tahun Ajaran
CREATE TABLE IF NOT EXISTS public.tahun_ajaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(nama, semester)
);

-- 2. Pengaturan Sistem
CREATE TABLE IF NOT EXISTS public.pengaturan (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Pengumuman
CREATE TABLE IF NOT EXISTS public.pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    kategori VARCHAR(50),
    penting BOOLEAN DEFAULT false,
    dibuat_oleh UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_role VARCHAR(30),
    target_kelas_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Notifikasi
CREATE TABLE IF NOT EXISTS public.notifikasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    judul VARCHAR(255) NOT NULL,
    isi TEXT,
    jenis VARCHAR(50),
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    aksi TEXT NOT NULL,
    entitas VARCHAR(50),
    entitas_id UUID,
    detail JSONB,
    modul VARCHAR(50),
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Presensi Sesi (Pengganti model presensi flat)
CREATE TABLE IF NOT EXISTS public.presensi_sesi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pengampu_id UUID REFERENCES public.pengampu(id_pengampu) ON DELETE CASCADE,
    pertemuan_ke INT NOT NULL,
    tanggal DATE NOT NULL,
    jam VARCHAR(30),
    topik VARCHAR(200),
    status VARCHAR(20) DEFAULT 'Berlangsung' CHECK (status IN ('Terjadwal', 'Berlangsung', 'Selesai')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. View Rekap Kehadiran (dari presensi)
CREATE OR REPLACE VIEW public.v_rekap_kehadiran AS
SELECT 
    s.id_siswa AS siswa_id,
    p.id_pengampu,
    COUNT(pr.id_presensi) AS total_sesi,
    SUM(CASE WHEN pr.status = 'hadir' THEN 1 ELSE 0 END) AS hadir,
    SUM(CASE WHEN pr.status = 'izin' THEN 1 ELSE 0 END) AS izin,
    SUM(CASE WHEN pr.status = 'sakit' THEN 1 ELSE 0 END) AS sakit,
    SUM(CASE WHEN pr.status = 'alpa' THEN 1 ELSE 0 END) AS alpa,
    CASE WHEN COUNT(pr.id_presensi) > 0 THEN 
        ROUND((SUM(CASE WHEN pr.status = 'hadir' THEN 1 ELSE 0 END)::numeric / COUNT(pr.id_presensi)) * 100)
    ELSE 0 END AS persentase
FROM public.siswa_kelas s
JOIN public.pengampu p ON p.id_kelas = s.id_kelas
LEFT JOIN public.presensi pr ON pr.id_pengampu = p.id_pengampu AND pr.id_siswa = s.id_siswa
GROUP BY s.id_siswa, p.id_pengampu;

-- 8. View Rekap Nilai (dari tugas + kuis)
CREATE OR REPLACE VIEW public.v_rekap_nilai AS
SELECT 
    s.id_siswa AS siswa_id,
    p.id_pengampu,
    COALESCE(AVG(pt.nilai), 0) AS rata_tugas,
    COALESCE(AVG(hk.nilai), 0) AS rata_kuis,
    (COALESCE(AVG(pt.nilai), 0) * 0.3 + COALESCE(AVG(hk.nilai), 0) * 0.2) / 0.5 AS nilai_sementara
FROM public.siswa_kelas s
JOIN public.pengampu p ON p.id_kelas = s.id_kelas
LEFT JOIN public.tugas t ON t.id_pengampu = p.id_pengampu
LEFT JOIN public.pengumpulan_tugas pt ON pt.id_tugas = t.id_tugas AND pt.id_siswa = s.id_siswa
LEFT JOIN public.kuis q ON q.id_pengampu = p.id_pengampu
LEFT JOIN public.hasil_kuis hk ON hk.id_kuis = q.id_kuis AND hk.id_siswa = s.id_siswa
GROUP BY s.id_siswa, p.id_pengampu;

-- 9. Indexing Tambahan
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_siswa_kelas_kelas ON public.siswa_kelas(id_kelas);
CREATE INDEX IF NOT EXISTS idx_pengampu_kelas ON public.pengampu(id_kelas);
CREATE INDEX IF NOT EXISTS idx_tugas_pengampu ON public.tugas(id_pengampu);
CREATE INDEX IF NOT EXISTS idx_presensi_pengampu ON public.presensi(id_pengampu);
CREATE INDEX IF NOT EXISTS idx_presensi_siswa ON public.presensi(id_siswa);
CREATE INDEX IF NOT EXISTS idx_pengumuman_created ON public.pengumuman(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifikasi_user ON public.notifikasi(user_id, is_read);
