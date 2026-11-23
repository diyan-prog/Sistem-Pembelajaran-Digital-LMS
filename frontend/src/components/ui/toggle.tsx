import { cn } from './cn'

export const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('w-11 h-6 rounded-full relative transition-colors shrink-0', on ? 'bg-primary' : 'bg-gray-300')}><span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} /></button>
)
