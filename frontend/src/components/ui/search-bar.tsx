import { Search } from 'lucide-react'
import { cn } from './cn'

export const SearchBar = ({ value, onChange, placeholder, large, className }: { value: string; onChange: (v: string) => void; placeholder: string; large?: boolean; className?: string }) => (
  <div className={cn('relative', className)}><Search size={large ? 20 : 18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
    <input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn('w-full rounded-full border border-line bg-white pl-11 pr-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary text-sm', large ? 'h-12' : 'h-11')} /></div>
)
