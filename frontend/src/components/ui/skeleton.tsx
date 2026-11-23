import { cn } from './cn'

export const Skel = ({ className }: { className?: string }) => <div className={cn('skeleton', className)} />
export const PageSkeleton = () => (
  <div className="space-y-6" aria-busy aria-label="Memuat"><Skel className="h-8 w-72" /><Skel className="h-4 w-96" /><div className="grid md:grid-cols-3 gap-6"><Skel className="h-40" /><Skel className="h-40" /><Skel className="h-40" /></div><Skel className="h-72" /></div>
)
