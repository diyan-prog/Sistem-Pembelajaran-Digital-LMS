-- Add id_pertemuan foreign key to materi table
ALTER TABLE materi
  ADD COLUMN IF NOT EXISTS id_pertemuan UUID REFERENCES pertemuan(id_pertemuan) ON DELETE SET NULL;

-- Index untuk query join
CREATE INDEX IF NOT EXISTS idx_materi_id_pertemuan ON materi(id_pertemuan);