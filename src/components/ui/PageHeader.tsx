import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronRight } from '../icons'

export interface Crumb {
  label: string
  to?: string
}

export function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {crumbs && crumbs.length > 0 && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-slate-soft">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <IconChevronRight width={11} height={11} />}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-signal">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
