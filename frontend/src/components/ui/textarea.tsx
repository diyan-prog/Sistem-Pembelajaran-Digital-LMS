import { Field } from './field'
import { inputCls } from './input-class'
import { cn } from './cn'

export const Textarea = ({ label, error, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) => (
  <Field label={label} error={error}><textarea {...p} className={cn(inputCls(!!error), 'h-auto py-2.5 min-h-24 resize-y')} /></Field>
)
