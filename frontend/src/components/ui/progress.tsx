import { cn } from './cn'

export const Progress = ({ value, tone = 'blue', className }: { value: number; tone?: 'blue' | 'green' | 'amber' | 'red'; className?: string }) => (
  <div className={cn('h-1.5 rounded-full bg-gray-200 overflow-hidden', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={cn('h-full rounded-full transition-all duration-500', { blue: 'bg-accent', green: 'bg-primary', amber: 'bg-warn', red: 'bg-danger' }[tone])} style={{ width: `${value}%` }} /></div>
)
