import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-fog bg-paper-raised/60 px-6 py-16 text-center">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-fog-soft">
        <rect x="8" y="10" width="40" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 22h24M16 30h24M16 38h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="40" r="10" fill="#F6F4EF" stroke="currentColor" strokeWidth="2" />
        <path d="M37 40h6M40 37v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
        <p className="max-w-sm text-sm text-slate-soft">{description}</p>
      </div>
      {action}
    </div>
  )
}
