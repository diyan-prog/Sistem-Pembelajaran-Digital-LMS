import { useState } from 'react'
import { Play } from 'lucide-react'
import { cn } from '@/components/ui'

export function YtThumb({ id, className }: { id: string; className?: string }) {
  const [ok, setOk] = useState(true)
  return <div className={cn('relative bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center overflow-hidden', className)}>{ok && <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" onError={() => setOk(false)} className="absolute inset-0 w-full h-full object-cover" />}<span className="relative w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow"><Play className="text-danger fill-danger ml-0.5" size={22} /></span></div>
}
