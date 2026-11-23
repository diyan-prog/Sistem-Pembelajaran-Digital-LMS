import type { InputHTMLAttributes, ReactNode } from 'react'
import { Field } from './field'
import { inputCls } from './input-class'
import { cn } from './cn'

export const Input = ({ label, error, hint, icon, ...p }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string; icon?: ReactNode }) => (
  <Field label={label} error={error} hint={hint}><div className="relative">{icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}<input {...p} className={cn(inputCls(!!error), !!icon && 'pl-10', p.className)} /></div></Field>
)
