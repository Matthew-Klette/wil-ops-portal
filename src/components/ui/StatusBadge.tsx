import clsx from 'clsx'
import { statusLabels } from '../../data/mock'
import type { RequestStatus } from '../../data/types'
import { statusTone } from '../../lib/status'

const toneClasses: Record<string, string> = {
  neutral: 'bg-fog-soft text-slate border-fog',
  signal: 'bg-signal-soft text-signal border-signal/30',
  pine: 'bg-pine-soft text-pine border-pine/30',
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const tone = statusTone(status)
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
      {statusLabels[status]}
    </span>
  )
}
