import { Field } from './field'
import { inputCls } from './input-class'
import { cn } from './cn'

export const Select = ({ label, error, options, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: (string | { v: string; l: string })[] }) => (
  <Field label={label} error={error}><select {...p} className={cn(inputCls(!!error), 'pr-8', className)}>{options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}</select></Field>
)
