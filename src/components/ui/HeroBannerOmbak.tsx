import { BookOpen, Anchor } from 'lucide-react'

export function HeroBannerOmbak() {
  return (
    <div className="relative w-full h-[180px] bg-gradient-to-r from-[#0B3D5F] via-[#0E86C7] to-[#1392D5] flex items-center px-6 lg:px-12 shadow-lift mb-8">
      {/* Wave Decorations */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
        <path d="M0,64 L80,55 C160,46, 320,28, 480,37 C640,46, 800,82, 960,91 C1120,100, 1280,82, 1440,73 L1440,120 L0,120 Z" fill="white" opacity="0.1" />
        <path d="M0,96 L80,87 C160,78, 320,60, 480,69 C640,78, 800,114, 960,123 C1120,132, 1280,114, 1440,105 L1440,120 L0,120 Z" fill="white" opacity="0.1" />
      </svg>

      {/* Background Icons */}
      <Anchor className="absolute -top-6 -right-6 text-white rotate-15 opacity-10" size={180} strokeWidth={1} />
      <BookOpen className="absolute top-10 right-40 text-white opacity-10" size={80} strokeWidth={1} />

      {/* Dot Pattern */}
      <div className="absolute top-4 right-8 grid grid-cols-4 gap-3 opacity-15">
        {[...Array(12)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-white" />)}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <h1 className="text-4xl font-bold text-white">Halo, Rina! ✨</h1>
        <p className="text-white/80 text-base mt-2 max-w-lg">
          Selamat datang kembali di ruang belajarmu. Semangat belajar hari ini.
        </p>
      </div>
    </div>
  )
}
