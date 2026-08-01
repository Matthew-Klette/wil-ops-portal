import clsx from 'clsx'
import { applicationStatusLabels } from '../../data/mock'
import type { ApplicationStatus } from '../../data/types'
import { applicationStatusTone } from '../../lib/status'

const toneClasses: Record<string, string> = {
  neutral: 'bg-fog-soft text-slate border-fog',
  signal: 'bg-signal-soft text-signal border-signal/30',
  pine: 'bg-pine-soft text-pine border-pine/30',
}

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const tone = applicationStatusTone(status)
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={clsx('h-1.5 w-1.5 rounded-full', {
          'bg-slate-soft': tone === 'neutral',
          'bg-signal': tone === 'signal',
          'bg-pine': tone === 'pine',
        })}
      />
      {applicationStatusLabels[status]}
    </span>
  )
}
