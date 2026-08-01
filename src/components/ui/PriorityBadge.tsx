import clsx from 'clsx'
import { priorityLabels } from '../../data/mock'
import type { RequestPriority } from '../../data/types'

export function PriorityBadge({ priority, className }: { priority: RequestPriority; className?: string }) {
  const urgent = priority === 'urgent'
  const high = priority === 'high'
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium',
        urgent
          ? 'bg-signal text-paper'
          : high
            ? 'bg-signal-soft text-signal'
            : 'bg-transparent text-slate-soft',
        className,
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
