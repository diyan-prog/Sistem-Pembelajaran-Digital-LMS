import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Sparkles, RefreshCw, ChevronRight } from 'lucide-react'
import { useApp, useRole } from '@/context'
import { supabase } from '@/lib/supabase'
import { cn } from '@/components/ui'

type Message = {
  id: string
  sender: 'bot' | 'user'
  text: string
  time: string
  options?: string[]
}

const nowTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export function Chatbot() {
  const { role } = useApp()
  const { cfg } = useRole()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timersRef = useRef<number[]>([])

  const firstCall = cfg ? cfg.nama.split(',')[0] : 'Siswa'

  const defaultWelcomeOptions = ['Daftar Mata Pelajaran', 'Daftar Kelas', 'Panduan Aplikasi']

  const welcomeMessage = useCallback(
    (text?: string): Message => ({
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text:
        text ??
        `Halo ${firstCall}! 👋 Saya **EduBot**, asisten digital SMK Negeri 2 Indramayu yang terhubung langsung ke Database Supabase. Ada yang bisa saya bantu?`,
      time: nowTime(),
      options: defaultWelcomeOptions,
    }),
    [firstCall]
  )

  const [messages, setMessages] = useState<Message[]>(() => [welcomeMessage()])

  useEffect(() => {
    setMessages([welcomeMessage()])
    setTyping(false)
    setInput('')
  }, [role, welcomeMessage])

  useEffect(() => () => timersRef.current.forEach((t) => clearTimeout(t)), [])

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!role) return null

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || typing) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: nowTime(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const lower = text.toLowerCase()
    let responseText = ''
    let options: string[] | undefined = undefined

    try {
      if (lower.includes('mapel') || lower.includes('pelajaran') || lower.includes('mata pelajaran')) {
        const { data, error } = await supabase.from('mapel').select('nama_mapel, kode_mapel')
        if (error || !data || data.length === 0) {
          responseText = 'Gagal memuat data mata pelajaran dari database Supabase.'
        } else {
          const items = data.map((m: any) => `• ${m.nama_mapel} (${m.kode_mapel})`)
          responseText = `Berikut daftar mata pelajaran dari database Supabase:\n\n${items.join('\n')}`
        }
      } else if (lower.includes('kelas') || lower.includes('rombel')) {
        const { data, error } = await supabase.from('kelas').select('nama_kelas, jurusan, tahun_ajaran')
        if (error || !data || data.length === 0) {
          responseText = 'Gagal memuat data kelas dari database Supabase.'
        } else {
          const items = data.map((k: any) => `• Kelas ${k.nama_kelas} - ${k.jurusan} (${k.tahun_ajaran})`)
          responseText = `Berikut daftar kelas dari database Supabase:\n\n${items.join('\n')}`
        }
      } else if (lower.includes('panduan') || lower.includes('bantuan') || lower.includes('halo') || lower.includes('hai')) {
        responseText = `Halo! Saya **EduBot** yang terhubung ke Supabase. Anda dapat mengetik **"mapel"** untuk melihat daftar mata pelajaran atau **"kelas"** untuk melihat daftar kelas dari database.`
        options = ['Daftar Mata Pelajaran', 'Daftar Kelas']
      } else {
        responseText = `Maaf, saya tidak menemukan informasi mengenai **"${text}"** di database Supabase. Silakan ketik **"mapel"** atau **"kelas"** untuk query data langsung.`
      }
    } catch (err) {
      responseText = 'Terjadi kesalahan saat menghubungkan ke database Supabase.'
    }

    const timer = window.setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now() + 1}`,
        sender: 'bot',
        text: responseText,
        time: nowTime(),
        options,
      }
      setMessages((prev) => [...prev, botMsg])
      setTyping(false)
    }, 400)
    timersRef.current.push(timer)
  }

  const resetChat = () => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
    setTyping(false)
    setMessages([welcomeMessage('Percakapan telah diperbarui. Ada yang bisa EduBot bantu lagi?')])
  }

  const renderRichText = (text: string) => ({
    __html: text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />'),
  })

  const lastBotId = [...messages].reverse().find((m) => m.sender === 'bot')?.id

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 no-print">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka EduBot Asisten AI"
            className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 hover:scale-105 active:scale-95 transition-transform duration-200 bg-transparent flex items-center justify-center outline-none"
            style={{ background: 'transparent' }}
          >
            <img src="/robot.png" alt="EduBot Robot" className="w-full h-full object-contain animate-float drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]" style={{ background: 'transparent' }} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="EduBot Asisten AI SMKN 2 Indramayu"
          className="pop fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[390px] h-[85dvh] sm:h-[560px] max-h-[92dvh] sm:max-h-[85dvh] bg-[#E6F0F7] rounded-t-[24px] sm:rounded-[24px] shadow-lift border border-[#0B3D5F]/10 flex flex-col overflow-hidden no-print"
        >
          <div className="bg-[#0B3D5F] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 overflow-visible flex items-center justify-center shrink-0">
                <img src="/robot.png" alt="EduBot Robot" className="w-12 h-12 object-contain animate-float drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]" style={{ background: 'transparent' }} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B3D5F]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5 text-white">
                  EduBot AI <Sparkles size={14} className="text-amber-300 fill-amber-300 shrink-0" />
                </h3>
                <p className="text-xs text-white/90 truncate">Database Supabase Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
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

          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-white/60">
            {messages.map((m) => {
              const showOptions = m.sender === 'bot' && m.options?.length && m.id === lastBotId
              return (
                <div
                  key={m.id}
                  className={cn('flex flex-col gap-1.5 max-w-[88%]', m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}
                >
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-soft',
                      m.sender === 'user'
                        ? 'bg-[#0B3D5F] text-white font-medium rounded-br-md'
                        : 'bg-white text-[#0B3D5F] border border-[#0B3D5F]/10 rounded-bl-md'
                    )}
                    {...(m.sender === 'bot' ? { dangerouslySetInnerHTML: renderRichText(m.text) } : { children: m.text })}
                  />
                  <span className="text-[10px] text-muted px-1">{m.time}</span>

                  {showOptions && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {m.options!.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSend(opt)}
                          className="text-xs bg-[#E6F0F7] border border-[#0B3D5F]/10 hover:border-[#0B3D5F] hover:bg-white text-[#0B3D5F] font-semibold px-3 py-1.5 rounded-full transition-all shadow-soft flex items-center gap-1 text-left"
                        >
                          {opt} <ChevronRight size={12} className="text-[#0B3D5F]/50" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {typing && (
              <div className="mr-auto flex flex-col gap-1">
                <div className="bg-white border border-[#0B3D5F]/10 px-4 py-3 rounded-2xl rounded-bl-md shadow-soft flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0B3D5F] animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="text-[10px] text-muted px-1">EduBot sedang query Supabase...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#E6F0F7] border-t border-[#0B3D5F]/10 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik 'mapel' atau 'kelas'..."
              aria-label="Tulis pertanyaan untuk EduBot"
              className="flex-1 h-11 px-4 rounded-full border border-[#0B3D5F]/10 bg-white text-sm text-[#0B3D5F] placeholder:text-muted outline-none focus:ring-2 focus:ring-[#0B3D5F]/20 focus:border-[#0B3D5F] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
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
