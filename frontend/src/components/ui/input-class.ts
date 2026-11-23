import { cn } from './cn'

export const inputCls = (err?: boolean) => cn('w-full h-11 rounded-xl border bg-white px-3.5 text-sm outline-none transition focus:ring-4 focus:ring-primary/20 focus:border-primary', err ? 'border-danger' : 'border-line')
