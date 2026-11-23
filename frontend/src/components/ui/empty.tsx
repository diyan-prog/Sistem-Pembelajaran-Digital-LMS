import type { ReactNode } from 'react'

export function EmptyIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden>
      <circle cx="80" cy="84" r="62" fill="#E8F6EC" /><rect x="40" y="48" width="80" height="62" rx="8" fill="#fff" stroke="#0B3D5F" strokeWidth="3" />
      <rect x="52" y="62" width="40" height="6" rx="3" fill="#BBE5C6" /><rect x="52" y="76" width="56" height="6" rx="3" fill="#D1D5DB" /><rect x="52" y="90" width="30" height="6" rx="3" fill="#D1D5DB" />
      <circle cx="118" cy="40" r="14" fill="#F59E0B" /><path d="M112 40l4 4 8-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 124h100" stroke="#0B3D5F" strokeWidth="3" strokeLinecap="round" /><circle cx="36" cy="40" r="5" fill="#2563EB" /><circle cx="130" cy="108" r="4" fill="#BBE5C6" />
    </svg>
  )
}
export const Empty = ({ title, text, action }: { title: string; text?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center text-center py-10 px-4"><EmptyIllustration size={130} /><h4 className="font-bold text-lg mt-2">{title}</h4>{text && <p className="text-muted text-sm mt-1 max-w-sm">{text}</p>}{action && <div className="mt-4">{action}</div>}</div>
)
