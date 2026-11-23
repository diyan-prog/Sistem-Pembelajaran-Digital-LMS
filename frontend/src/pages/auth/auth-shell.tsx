import type { ReactNode } from 'react'
import { Logo } from '@/components/layouts'

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-light to-gray-100"><div className="w-full max-w-md bg-white rounded-[20px] shadow-lift border border-line p-8 pop"><div className="flex items-center gap-3 mb-6"><span className="bg-primary rounded-full"><Logo size={40} /></span><b className="text-sm leading-tight">SMK Negeri 2 Indramayu<br /><span className="text-muted font-normal">Sistem Pembelajaran Digital</span></b></div>{children}</div></div>
}
