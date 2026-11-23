import type { ReactNode } from 'react'

export function Field({ label, error, hint, children }: { label?: string; error?: string; hint?: string; children: ReactNode }) {
  return <label className="block">{label && <span className="block text-sm font-semibold mb-1.5">{label}</span>}{children}{error ? <span role="alert" className="block text-danger text-xs mt-1 font-semibold">{error}</span> : hint ? <span className="block text-muted text-xs mt-1">{hint}</span> : null}</label>
}
