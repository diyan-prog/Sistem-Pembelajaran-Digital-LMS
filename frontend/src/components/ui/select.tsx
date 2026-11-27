import { Field } from './field'
import { inputCls } from './input-class'
import { cn } from './cn'

export type SelectOption = string | { v: string | number; l: string | number }

// normalisasi: buang entri kosong (undefined/null) dan objek tanpa `v`,
// supaya options hasil map data API yang tidak lengkap tidak membuat
// render `o.v` gagal.
const normalizeOptions = (options: SelectOption[] = []) =>
  (options ?? []).flatMap((o): { v: string; l: string }[] => {
    if (o === null || o === undefined) return []
    if (typeof o === 'string' || typeof o === 'number') return [{ v: String(o), l: String(o) }]
    if (o.v === null || o.v === undefined) return []
    return [{ v: String(o.v), l: String(o.l ?? o.v) }]
  })

export const Select = ({ label, error, options, className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: SelectOption[] }) => (
  <Field label={label} error={error}><select {...p} className={cn(inputCls(!!error), 'pr-8', className)}>{normalizeOptions(options).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></Field>
)
