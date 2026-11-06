import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Sparkles, RefreshCw, User, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react'
import { useApp, useRole } from '@/store'
import { ME_SISWA, guruOfferings, siswaOfferings, subjectById, kelasById, teacherById } from '@/data'
import { cn } from '@/components/ui'

type Message = {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
  options?: string[]
}

const FAQ_DATABASE: { keywords: string[]; answer: (role: string) => string; options?: string[] }[] = [
  {
    keywords: ['jadwal', 'pelajaran', 'jam', 'hari ini'],
    answer: (role) => {
      if (role === 'siswa') {
        const off = siswaOfferings('s1')
        const items = off.map((o) => `• ${subjectById(o.subjectId).nama} (${o.jadwal[0].hari}, ${o.jadwal[0].mulai}-${o.jadwal[0].selesai}) - Ruang ${o.jadwal[0].ruang}`)
        return `Berikut jadwal pelajaran kamu semester ini:\n\n${items.join('\n')}\n\nPastikan hadir 10 menit sebelum kelas dimulai!`
      } else if (role === 'guru') {
        const off = guruOfferings('t1')
        const items = off.map((o) => `• ${subjectById(o.subjectId).nama} (${kelasById(o.kelasId).nama}) - ${o.jadwal[0].hari}, ${o.jadwal[0].mulai}-${o.jadwal[0].selesai}`)
        return `Berikut jadwal mengajar Anda:\n\n${items.join('\n')}\n\nJangan lupa membuka sesi presensi di menu Presensi.`
      }
      return 'Anda dapat melihat Jadwal Lengkap pada menu Jadwal Pelajaran.'
    },
    options: ['Cara kumpul tugas', 'Cek rekap kehadiran', 'Kontak wali kelas'],
  },
  {
    keywords: ['tugas', 'kumpul', 'upload', 'deadline', 'kirim'],
    answer: () => 'Untuk mengumpulkan tugas:\n1. Buka menu **Tugas & Kuis**.\n2. Pilih tugas yang berstatus *Belum Dikumpulkan*.\n3. Unggah berkas (PDF/Word/ZIP maks 20MB) pada area Dropzone.\n4. Klik **Kumpulkan Tugas**.',
    options: ['Batas waktu tugas', 'Format file yang diterima', 'Cek nilai tugas'],
  },
  {
    keywords: ['presensi', 'hadir', 'absen', 'rekap', 'kehadiran'],
    answer: (role) => {
      if (role === 'siswa') {
        return `Persentase kehadiran kamu saat ini adalah **88%** (14 dari 16 sesi dihadiri).\n\nSyarat minimal mengikuti Ujian Akhir Semester adalah **75%** kehadiran.`
      } else if (role === 'guru') {
        return 'Untuk mengelola presensi:\n1. Buka menu **Presensi**.\n2. Pilih kelas dan pertemuan.\n3. Tandai status Hadir, Izin, Sakit, atau Alpa untuk setiap siswa.\n4. Klik **Simpan Presensi**.'
      }
      return 'Rekap kehadiran siswa dapat dipantau di menu Rekap Kehadiran.'
    },
    options: ['Izin / Sakit', 'Ujian Semester'],
  },
  {
    keywords: ['kuis', 'ujian', 'soal', 'kerjakan'],
    answer: () => 'Kuis online dilaksanakan di menu **Tugas & Kuis**.\n\nTips:\n• Pastikan koneksi internet stabil.\n• Perhatikan durasi pengerjaan di pojok kanan atas.\n• Jawaban tersimpan otomatis saat memilih opsi.',
    options: ['Gagal kirim kuis', 'Lihat hasil kuis'],
  },
  {
    keywords: ['nilai', 'transkrip', 'rapor', 'rekap nilai'],
    answer: () => 'Nilai tugas dan kuis diperbarui secara real-time oleh guru pengampu. Kamu bisa melihat rincian nilai di menu **Nilai & Kehadiran**.',
    options: ['Bobot nilai', 'Perbaikan nilai / Remedial'],
  },
  {
    keywords: ['sandi', 'password', 'login', 'ganti', 'akun'],
    answer: () => 'Untuk mengganti kata sandi:\n1. Klik foto profil di pojok kanan atas.\n2. Pilih **Pengaturan** atau **Kelola Akun**.\n3. Masukkan kata sandi lama dan baru, lalu klik **Simpan**.\n\nJika lupa kata sandi, hubungi bagian Tata Usaha.',
    options: ['Lupa kata sandi', 'Ubah profil'],
  },
  {
    keywords: ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'bot', 'bantuan', 'bantu'],
    answer: (role) => `Halo! Saya **EduBot**, asisten AI Sistem Pembelajaran Digital SMK Negeri 2 Indramayu. Ada yang bisa saya bantu terkait kegiatan belajar mengajar?`,
    options: ['Cek jadwal hari ini', 'Cara kumpul tugas', 'Cek rekap kehadiran', 'Tanya kata sandi'],
  },
]

export function Chatbot() {
  const { role } = useApp()
  const { cfg } = useRole()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const defaultWelcomeOptions = role === 'guru' 
    ? ['Cek jadwal mengajar', 'Cara buat kuis', 'Buka presensi kelas']
    : role === 'tu'
    ? ['Panduan data siswa', 'Atur jadwal pelajaran', 'Manajemen akun']
    : ['Cek jadwal hari ini', 'Cara kumpul tugas', 'Cek persentase kehadiran']

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Halo ${cfg ? cfg.nama.split(',')[0] : 'Siswa'}! 👋 Saya **EduBot**, asisten digital SMK Negeri 2 Indramayu. Silakan pilih pertanyaan atau tulis kendalamu di bawah!`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      options: defaultWelcomeOptions,
    },
  ])

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, typing])

  if (!role) return null

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setTyping(true)

    setTimeout(() => {
      const lower = text.toLowerCase()
      let matched = FAQ_DATABASE.find((faq) => faq.keywords.some((k) => lower.includes(k)))

      let responseText = ''
      let options = matched?.options

      if (matched) {
        responseText = matched.answer(role)
      } else {
        responseText = `Terima kasih atas pertanyaannya. Mengenai **"${text}"**, kamu bisa memeriksa informasi lebih detail di menu **Panduan** atau menghubungi Tata Usaha SMKN 2 Indramayu pada jam kerja.`
        options = ['Cek jadwal hari ini', 'Cara kumpul tugas', 'Hubungi Tata Usaha']
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        options,
      }

      setMessages((prev) => [...prev, botMsg])
      setTyping(false)
    }, 600)
  }

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Percakapan telah diperbarui. Ada yang bisa EduBot bantu lagi?`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        options: defaultWelcomeOptions,
      },
    ])
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 no-print">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka EduBot Asisten AI"
            className="w-16 h-16 shrink-0 hover:scale-110 transition-transform duration-200 bg-transparent border-none p-0 flex items-center justify-center [&_img]:max-w-full [&_img]:max-h-full"
          >
            <img src="/logobot.png" alt="EduBot Logo" className="object-contain" />
          </button>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div
          role="dialog"
          aria-label="EduBot Asisten AI SMKN 2 Indramayu"
          className="pop fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[390px] h-[540px] max-h-[85vh] bg-[#E6F0F7] rounded-[24px] shadow-lift border border-[#0B3D5F]/10 flex flex-col overflow-hidden no-print"
        >
          {/* Header */}
          <div className="bg-[#0B3D5F] text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/30">
                <img src="/logobot.jpeg" alt="EduBot Logo" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B3D5F]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5 text-white">
                  EduBot AI <Sparkles size={14} className="text-amber-300 fill-amber-300" />
                </h3>
                <p className="text-xs text-white/90">Asisten Digital SMKN 2 Indramayu</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Bersihkan percakapan"
                title="Reset Percakapan"
                onClick={resetChat}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <RefreshCw size={16} />
              </button>
              <button
                aria-label="Tutup percakapan"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex flex-col gap-1.5 max-w-[85%]', m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}
              >
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                    m.sender === 'user'
                      ? 'bg-[#0B3D5F] text-white font-medium rounded-br-none shadow-soft'
                      : 'bg-[#E6F0F7] text-[#0B3D5F] border border-[#0B3D5F]/10 rounded-bl-none shadow-soft'
                  )}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-muted px-1">{m.time}</span>

                {/* Chips / Quick Options */}
                {m.sender === 'bot' && m.options && m.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {m.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSend(opt)}
                        className="text-xs bg-[#E6F0F7] border border-[#0B3D5F]/10 hover:border-[#0B3D5F] hover:text-[#0B3D5F] text-[#0B3D5F] font-semibold px-3 py-1.5 rounded-full transition-all shadow-soft flex items-center gap-1 text-left"
                      >
                        {opt} <ChevronRight size={12} className="text-muted" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="mr-auto items-start flex flex-col gap-1">
                <div className="bg-[#E6F0F7] border border-[#0B3D5F]/10 p-3 rounded-2xl rounded-bl-none shadow-soft flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce[0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce[0.4s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce[0.6s]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-[#E6F0F7] border-t border-[#0B3D5F]/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaanmu..."
              className="flex-1 h-11 px-4 rounded-full border border-[#0B3D5F]/10 bg-white text-sm outline-none focus:ring-2 focus:ring-[#0B3D5F]/20 focus:border-[--color-navbar-bg] focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Kirim pesan"
              className="w-11 h-11 rounded-full bg-[#0B3D5F] text-white flex items-center justify-center shrink-0 hover:bg-[#0E86C7] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
