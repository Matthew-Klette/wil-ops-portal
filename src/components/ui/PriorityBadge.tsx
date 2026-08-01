import clsx from 'clsx'
import { employmentTypeLabels } from '../../data/mock'
import type { EmploymentType } from '../../data/types'

export function PriorityBadge({ employmentType, className }: { employmentType: EmploymentType; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-signal-soft px-2.5 py-1 text-[11px] font-medium text-signal',
        className,
      )}
    >
      {employmentTypeLabels[employmentType]}
    </span>
  )
}
