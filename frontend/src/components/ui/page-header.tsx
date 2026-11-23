import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useRole } from '@/context'

export function PageHeader({ crumbs, title, subtitle, actions }: { crumbs?: { l: string; to?: string }[]; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-muted mb-2">{crumbs.map((c, i) => <span key={i} className="flex items-center gap-1">{c.to ? <Link to={c.to} className="hover:text-primary-dark hover:underline">{c.l}</Link> : <span className="font-semibold text-ink">{c.l}</span>}{i < crumbs.length - 1 && <ChevronRight size={12} />}</span>)}</nav>}
        <h1 className="text-[28px] leading-9 font-extrabold">{title}</h1>
        {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
export const useCrumbs = (...rest: { l: string; to?: string }[]) => { const { cfg } = useRole(); return [{ l: 'Beranda', to: cfg.base + (cfg.base === '/tu' ? '/dashboard' : '/beranda') }, ...rest] }
