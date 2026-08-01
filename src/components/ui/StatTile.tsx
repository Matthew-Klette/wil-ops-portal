import clsx from 'clsx'

export function StatTile({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number | string
  tone?: 'default' | 'signal' | 'pine'
}) {
  return (
    <div className="flex min-w-[132px] flex-1 flex-col gap-1 rounded-2xl border border-fog bg-paper-raised px-5 py-4 shadow-card">
      <span className="font-mono text-[11px] uppercase tracking-wide text-slate-soft">{label}</span>
      <span
        className={clsx('font-display text-3xl font-medium', {
          'text-ink': tone === 'default',
          'text-signal': tone === 'signal',
          'text-pine': tone === 'pine',
        })}
      >
        {value}
      </span>
    </div>
  )
}
