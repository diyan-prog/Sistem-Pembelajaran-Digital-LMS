import { Btn } from '@/components/ui'
import { useApp } from '@/context'
import { ROLES } from '@/lib/roles'

export function NotFound() {
  const { role } = useApp()
  return <div className="min-h-screen flex items-center justify-center p-6 text-center"><div className="max-w-md"><svg viewBox="0 0 240 160" className="w-72 mx-auto" aria-hidden><circle cx="120" cy="84" r="66" fill="#E8F6EC" /><text x="120" y="100" textAnchor="middle" fontSize="64" fontWeight="800" fill="#0B3D5F">404</text><rect x="70" y="112" width="100" height="8" rx="4" fill="#BBE5C6" /><circle cx="40" cy="40" r="6" fill="#F59E0B" /><circle cx="205" cy="60" r="5" fill="#2563EB" /></svg>
    <h1 className="text-3xl font-extrabold mt-4">Halaman Tidak Ditemukan</h1><p className="text-muted mt-2">Halaman yang kamu cari mungkin sudah dipindahkan atau tidak tersedia.</p>
    <Btn to={role ? ROLES[role].base + (role === 'tu' ? '/dashboard' : '/beranda') : '/login'} className="mt-6 !px-6">Kembali ke Beranda</Btn></div></div>
}
