export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          aksi: string
          created_at: string | null
          detail: Json | null
          entitas: string | null
          entitas_id: string | null
          id: string
          ip_address: string | null
          modul: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          created_at?: string | null
          detail?: Json | null
          entitas?: string | null
          entitas_id?: string | null
          id?: string
          ip_address?: string | null
          modul?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          created_at?: string | null
          detail?: Json | null
          entitas?: string | null
          entitas_id?: string | null
          id?: string
          ip_address?: string | null
          modul?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string | null
          id: string
          method: string | null
          scan_time: string | null
          status: string
          student_id: string | null
          subject_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          method?: string | null
          scan_time?: string | null
          status: string
          student_id?: string | null
          subject_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          method?: string | null
          scan_time?: string | null
          status?: string
          student_id?: string | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          sender: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sender: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sender?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string | null
          grade: number
          id: string
          jurusan_id: string | null
          major: string
          name: string
          tahun_ajaran_id: string | null
          tingkat: number | null
          wali_kelas_id: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          grade: number
          id?: string
          jurusan_id?: string | null
          major: string
          name: string
          tahun_ajaran_id?: string | null
          tingkat?: number | null
          wali_kelas_id?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          grade?: number
          id?: string
          jurusan_id?: string | null
          major?: string
          name?: string
          tahun_ajaran_id?: string | null
          tingkat?: number | null
          wali_kelas_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_jurusan_id_fkey"
            columns: ["jurusan_id"]
            isOneToOne: false
            referencedRelation: "jurusan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tahun_ajaran_id_fkey"
            columns: ["tahun_ajaran_id"]
            isOneToOne: false
            referencedRelation: "tahun_ajaran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_wali_kelas_id_fkey"
            columns: ["wali_kelas_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guru: {
        Row: {
          created_at: string | null
          id: string
          nip: string | null
          profile_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nip?: string | null
          profile_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nip?: string | null
          profile_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guru_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hasil_kuis: {
        Row: {
          id_hasil: string
          id_kuis: string
          id_siswa: string
          nilai: number
          waktu_mulai: string
          waktu_selesai: string
        }
        Insert: {
          id_hasil?: string
          id_kuis: string
          id_siswa: string
          nilai: number
          waktu_mulai: string
          waktu_selesai: string
        }
        Update: {
          id_hasil?: string
          id_kuis?: string
          id_siswa?: string
          nilai?: number
          waktu_mulai?: string
          waktu_selesai?: string
        }
        Relationships: [
          {
            foreignKeyName: "hasil_kuis_id_kuis_fkey"
            columns: ["id_kuis"]
            isOneToOne: false
            referencedRelation: "kuis"
            referencedColumns: ["id_kuis"]
          },
          {
            foreignKeyName: "hasil_kuis_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jadwal_pelajaran: {
        Row: {
          created_at: string | null
          hari: string
          id: string
          jam_mulai: string
          jam_selesai: string
          penugasan_id: string
          ruangan: string | null
        }
        Insert: {
          created_at?: string | null
          hari: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          penugasan_id: string
          ruangan?: string | null
        }
        Update: {
          created_at?: string | null
          hari?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          penugasan_id?: string
          ruangan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_pelajaran_penugasan_id_fkey"
            columns: ["penugasan_id"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "jadwal_pelajaran_penugasan_id_fkey"
            columns: ["penugasan_id"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "jadwal_pelajaran_penugasan_id_fkey"
            columns: ["penugasan_id"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      jawaban_kuis: {
        Row: {
          benar: boolean
          id_hasil: string
          id_jawaban: string
          id_soal: string
          jawaban: Database["public"]["Enums"]["pilihan_jawaban"]
        }
        Insert: {
          benar: boolean
          id_hasil: string
          id_jawaban?: string
          id_soal: string
          jawaban: Database["public"]["Enums"]["pilihan_jawaban"]
        }
        Update: {
          benar?: boolean
          id_hasil?: string
          id_jawaban?: string
          id_soal?: string
          jawaban?: Database["public"]["Enums"]["pilihan_jawaban"]
        }
        Relationships: [
          {
            foreignKeyName: "jawaban_kuis_id_hasil_fkey"
            columns: ["id_hasil"]
            isOneToOne: false
            referencedRelation: "hasil_kuis"
            referencedColumns: ["id_hasil"]
          },
          {
            foreignKeyName: "jawaban_kuis_id_soal_fkey"
            columns: ["id_soal"]
            isOneToOne: false
            referencedRelation: "soal_kuis"
            referencedColumns: ["id_soal"]
          },
        ]
      }
      jurusan: {
        Row: {
          created_at: string | null
          id: string
          kode: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kode: string
          nama: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kode?: string
          nama?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          created_at: string
          id_kelas: string
          id_walikelas: string | null
          jurusan: string
          nama_kelas: string
          tahun_ajaran: string
          tingkat: Database["public"]["Enums"]["tingkat_kelas"]
        }
        Insert: {
          created_at?: string
          id_kelas?: string
          id_walikelas?: string | null
          jurusan: string
          nama_kelas: string
          tahun_ajaran: string
          tingkat: Database["public"]["Enums"]["tingkat_kelas"]
        }
        Update: {
          created_at?: string
          id_kelas?: string
          id_walikelas?: string | null
          jurusan?: string
          nama_kelas?: string
          tahun_ajaran?: string
          tingkat?: Database["public"]["Enums"]["tingkat_kelas"]
        }
        Relationships: [
          {
            foreignKeyName: "kelas_id_walikelas_fkey"
            columns: ["id_walikelas"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kuis: {
        Row: {
          created_at: string
          durasi_menit: number
          id_kuis: string
          id_pengampu: string
          judul: string
          status: Database["public"]["Enums"]["status_kuis"]
          waktu_mulai: string
          waktu_selesai: string
        }
        Insert: {
          created_at?: string
          durasi_menit: number
          id_kuis?: string
          id_pengampu: string
          judul: string
          status?: Database["public"]["Enums"]["status_kuis"]
          waktu_mulai: string
          waktu_selesai: string
        }
        Update: {
          created_at?: string
          durasi_menit?: number
          id_kuis?: string
          id_pengampu?: string
          judul?: string
          status?: Database["public"]["Enums"]["status_kuis"]
          waktu_mulai?: string
          waktu_selesai?: string
        }
        Relationships: [
          {
            foreignKeyName: "kuis_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "kuis_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "kuis_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      leave_requests: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string | null
          student_id: string | null
          type: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string | null
          student_id?: string | null
          type: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          student_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mapel: {
        Row: {
          created_at: string
          id_mapel: string
          kode_mapel: string
          nama_mapel: string
        }
        Insert: {
          created_at?: string
          id_mapel?: string
          kode_mapel: string
          nama_mapel: string
        }
        Update: {
          created_at?: string
          id_mapel?: string
          kode_mapel?: string
          nama_mapel?: string
        }
        Relationships: []
      }
      materi: {
        Row: {
          deskripsi: string
          file_materi: string | null
          id_materi: string
          id_pengampu: string
          judul: string
          link_video: string | null
          tanggal_upload: string
        }
        Insert: {
          deskripsi: string
          file_materi?: string | null
          id_materi?: string
          id_pengampu: string
          judul: string
          link_video?: string | null
          tanggal_upload?: string
        }
        Update: {
          deskripsi?: string
          file_materi?: string | null
          id_materi?: string
          id_pengampu?: string
          judul?: string
          link_video?: string | null
          tanggal_upload?: string
        }
        Relationships: [
          {
            foreignKeyName: "materi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "materi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "materi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      message_replies: {
        Row: {
          id: string
          message_id: string
          reply_message: string
          sent_at: string
          sent_by: string
        }
        Insert: {
          id?: string
          message_id: string
          reply_message: string
          sent_at?: string
          sent_by: string
        }
        Update: {
          id?: string
          message_id?: string
          reply_message?: string
          sent_at?: string
          sent_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_replies_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      notifikasi: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          isi: string | null
          jenis: string | null
          judul: string
          link: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          isi?: string | null
          jenis?: string | null
          judul: string
          link?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          isi?: string | null
          jenis?: string | null
          judul?: string
          link?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifikasi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pengampu: {
        Row: {
          created_at: string
          id_guru: string
          id_kelas: string
          id_mapel: string
          id_pengampu: string
          tahun_ajaran: string
        }
        Insert: {
          created_at?: string
          id_guru: string
          id_kelas: string
          id_mapel: string
          id_pengampu?: string
          tahun_ajaran: string
        }
        Update: {
          created_at?: string
          id_guru?: string
          id_kelas?: string
          id_mapel?: string
          id_pengampu?: string
          tahun_ajaran?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengampu_id_guru_fkey"
            columns: ["id_guru"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengampu_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
          {
            foreignKeyName: "pengampu_id_mapel_fkey"
            columns: ["id_mapel"]
            isOneToOne: false
            referencedRelation: "mapel"
            referencedColumns: ["id_mapel"]
          },
        ]
      }
      pengaturan: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      pengumpulan_tugas: {
        Row: {
          catatan_siswa: string | null
          feedback_guru: string | null
          file_jawaban: string | null
          id_pengumpulan: string
          id_siswa: string
          id_tugas: string
          nilai: number | null
          status: Database["public"]["Enums"]["status_pengumpulan"]
          waktu_kumpul: string
        }
        Insert: {
          catatan_siswa?: string | null
          feedback_guru?: string | null
          file_jawaban?: string | null
          id_pengumpulan?: string
          id_siswa: string
          id_tugas: string
          nilai?: number | null
          status?: Database["public"]["Enums"]["status_pengumpulan"]
          waktu_kumpul?: string
        }
        Update: {
          catatan_siswa?: string | null
          feedback_guru?: string | null
          file_jawaban?: string | null
          id_pengumpulan?: string
          id_siswa?: string
          id_tugas?: string
          nilai?: number | null
          status?: Database["public"]["Enums"]["status_pengumpulan"]
          waktu_kumpul?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengumpulan_tugas_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengumpulan_tugas_id_tugas_fkey"
            columns: ["id_tugas"]
            isOneToOne: false
            referencedRelation: "tugas"
            referencedColumns: ["id_tugas"]
          },
        ]
      }
      pengumuman: {
        Row: {
          created_at: string | null
          dibuat_oleh: string | null
          id: string
          isi: string
          judul: string
          kategori: string | null
          penting: boolean | null
          target_kelas_id: string | null
          target_role: string | null
        }
        Insert: {
          created_at?: string | null
          dibuat_oleh?: string | null
          id?: string
          isi: string
          judul: string
          kategori?: string | null
          penting?: boolean | null
          target_kelas_id?: string | null
          target_role?: string | null
        }
        Update: {
          created_at?: string | null
          dibuat_oleh?: string | null
          id?: string
          isi?: string
          judul?: string
          kategori?: string | null
          penting?: boolean | null
          target_kelas_id?: string | null
          target_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pengumuman_dibuat_oleh_fkey"
            columns: ["dibuat_oleh"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pengumuman_target_kelas_id_fkey"
            columns: ["target_kelas_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      pertemuan: {
        Row: {
          created_at: string | null
          id_pengampu: string | null
          id_pertemuan: string
          judul: string
          no_pertemuan: number
          tanggal: string | null
        }
        Insert: {
          created_at?: string | null
          id_pengampu?: string | null
          id_pertemuan?: string
          judul: string
          no_pertemuan: number
          tanggal?: string | null
        }
        Update: {
          created_at?: string | null
          id_pengampu?: string | null
          id_pertemuan?: string
          judul?: string
          no_pertemuan?: number
          tanggal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pertemuan_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "pertemuan_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "pertemuan_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      presensi: {
        Row: {
          created_at: string
          dicatat_oleh: string
          id_pengampu: string
          id_presensi: string
          id_siswa: string
          status: Database["public"]["Enums"]["status_presensi"]
          tanggal: string
        }
        Insert: {
          created_at?: string
          dicatat_oleh: string
          id_pengampu: string
          id_presensi?: string
          id_siswa: string
          status: Database["public"]["Enums"]["status_presensi"]
          tanggal: string
        }
        Update: {
          created_at?: string
          dicatat_oleh?: string
          id_pengampu?: string
          id_presensi?: string
          id_siswa?: string
          status?: Database["public"]["Enums"]["status_presensi"]
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "presensi_dicatat_oleh_fkey"
            columns: ["dicatat_oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presensi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "presensi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "presensi_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "presensi_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presensi_sesi: {
        Row: {
          created_at: string | null
          id: string
          jam: string | null
          pengampu_id: string | null
          pertemuan_ke: number
          status: string | null
          tanggal: string
          topik: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jam?: string | null
          pengampu_id?: string | null
          pertemuan_ke: number
          status?: string | null
          tanggal: string
          topik?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jam?: string | null
          pengampu_id?: string | null
          pertemuan_ke?: number
          status?: string | null
          tanggal?: string
          topik?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presensi_sesi_pengampu_id_fkey"
            columns: ["pengampu_id"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "presensi_sesi_pengampu_id_fkey"
            columns: ["pengampu_id"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "presensi_sesi_pengampu_id_fkey"
            columns: ["pengampu_id"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      profiles: {
        Row: {
          alamat: string | null
          created_at: string
          email: string
          foto_profil: string | null
          hp: string | null
          id: string
          must_change_password: boolean
          nama_lengkap: string
          nip_nis: string | null
          password_changed_at: string | null
          preferensi: Json | null
          role: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          username: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email: string
          foto_profil?: string | null
          hp?: string | null
          id: string
          must_change_password?: boolean
          nama_lengkap: string
          nip_nis?: string | null
          password_changed_at?: string | null
          preferensi?: Json | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string
          foto_profil?: string | null
          hp?: string | null
          id?: string
          must_change_password?: boolean
          nama_lengkap?: string
          nip_nis?: string | null
          password_changed_at?: string | null
          preferensi?: Json | null
          role?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          demo_url: string | null
          description: string
          id: string
          image_url: string | null
          is_featured: boolean
          repo_url: string | null
          slug: string
          sort_order: number
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          demo_url?: string | null
          description: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          repo_url?: string | null
          slug: string
          sort_order?: number
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          demo_url?: string | null
          description?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          repo_url?: string | null
          slug?: string
          sort_order?: number
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          created_at: string | null
          id: string
          jenis_kelamin: string | null
          kelas_id: string | null
          nis: string
          nisn: string | null
          profile_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas_id?: string | null
          nis: string
          nisn?: string | null
          profile_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jenis_kelamin?: string | null
          kelas_id?: string | null
          nis?: string
          nisn?: string | null
          profile_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siswa_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      siswa_kelas: {
        Row: {
          created_at: string
          id_kelas: string
          id_siswa: string
          tahun_ajaran: string
        }
        Insert: {
          created_at?: string
          id_kelas: string
          id_siswa: string
          tahun_ajaran: string
        }
        Update: {
          created_at?: string
          id_kelas?: string
          id_siswa?: string
          tahun_ajaran?: string
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_kelas_fkey"
            columns: ["id_kelas"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id_kelas"]
          },
          {
            foreignKeyName: "siswa_kelas_id_siswa_fkey"
            columns: ["id_siswa"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          level: number
          name: string
          sort_order: number
        }
        Insert: {
          category: string
          created_at?: string
          icon?: string | null
          id?: string
          level?: number
          name: string
          sort_order?: number
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          level?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      soal_kuis: {
        Row: {
          id_kuis: string
          id_soal: string
          kunci_jawaban: Database["public"]["Enums"]["pilihan_jawaban"]
          pertanyaan: string
          pilihan_a: string
          pilihan_b: string
          pilihan_c: string
          pilihan_d: string
          poin: number
          urutan: number | null
        }
        Insert: {
          id_kuis: string
          id_soal?: string
          kunci_jawaban: Database["public"]["Enums"]["pilihan_jawaban"]
          pertanyaan: string
          pilihan_a: string
          pilihan_b: string
          pilihan_c: string
          pilihan_d: string
          poin?: number
          urutan?: number | null
        }
        Update: {
          id_kuis?: string
          id_soal?: string
          kunci_jawaban?: Database["public"]["Enums"]["pilihan_jawaban"]
          pertanyaan?: string
          pilihan_a?: string
          pilihan_b?: string
          pilihan_c?: string
          pilihan_d?: string
          poin?: number
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "soal_kuis_id_kuis_fkey"
            columns: ["id_kuis"]
            isOneToOne: false
            referencedRelation: "kuis"
            referencedColumns: ["id_kuis"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          grade: number
          guru_utama_id: string | null
          id: string
          kelompok: string | null
          name: string
          teacher_id: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          grade: number
          guru_utama_id?: string | null
          id?: string
          kelompok?: string | null
          name: string
          teacher_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          grade?: number
          guru_utama_id?: string | null
          id?: string
          kelompok?: string | null
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_guru_utama_id_fkey"
            columns: ["guru_utama_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tahun_ajaran: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          nama: string
          semester: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nama: string
          semester: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nama?: string
          semester?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tugas: {
        Row: {
          created_at: string
          deadline: string
          deskripsi: string
          file_lampiran: string | null
          id_pengampu: string
          id_tugas: string
          judul: string
        }
        Insert: {
          created_at?: string
          deadline: string
          deskripsi: string
          file_lampiran?: string | null
          id_pengampu: string
          id_tugas?: string
          judul: string
        }
        Update: {
          created_at?: string
          deadline?: string
          deskripsi?: string
          file_lampiran?: string | null
          id_pengampu?: string
          id_tugas?: string
          judul?: string
        }
        Relationships: [
          {
            foreignKeyName: "tugas_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "pengampu"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "tugas_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_kehadiran"
            referencedColumns: ["id_pengampu"]
          },
          {
            foreignKeyName: "tugas_id_pengampu_fkey"
            columns: ["id_pengampu"]
            isOneToOne: false
            referencedRelation: "v_rekap_nilai"
            referencedColumns: ["id_pengampu"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          nip_nis: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          nip_nis?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          nip_nis?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      v_rekap_kehadiran: {
        Row: {
          alpa: number | null
          hadir: number | null
          id_pengampu: string | null
          izin: number | null
          persentase: number | null
          sakit: number | null
          siswa_id: string | null
          total_sesi: number | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_siswa_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_rekap_nilai: {
        Row: {
          id_pengampu: string | null
          nilai_sementara: number | null
          rata_kuis: number | null
          rata_tugas: number | null
          siswa_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_siswa_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      pilihan_jawaban: "A" | "B" | "C" | "D"
      status_kuis: "draft" | "aktif" | "selesai"
      status_pengumpulan: "dikumpulkan" | "terlambat" | "belum"
      status_presensi: "hadir" | "izin" | "sakit" | "alpa"
      tingkat_kelas: "X" | "XI" | "XII"
      user_role:
        | "Tata Usaha"
        | "Guru Mapel"
        | "Wali Kelas"
        | "Kepala Sekolah"
        | "Siswa"
      user_status: "aktif" | "nonaktif"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      pilihan_jawaban: ["A", "B", "C", "D"],
      status_kuis: ["draft", "aktif", "selesai"],
      status_pengumpulan: ["dikumpulkan", "terlambat", "belum"],
      status_presensi: ["hadir", "izin", "sakit", "alpa"],
      tingkat_kelas: ["X", "XI", "XII"],
      user_role: [
        "Tata Usaha",
        "Guru Mapel",
        "Wali Kelas",
        "Kepala Sekolah",
        "Siswa",
      ],
      user_status: ["aktif", "nonaktif"],
    },
  },
} as const
