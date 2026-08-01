import clsx from 'clsx'
import type { RequestStatus } from '../../data/types'
import { waitingOnLabel } from '../../lib/status'

export function WaitingOn({ status, className }: { status: RequestStatus; className?: string }) {
  const label = waitingOnLabel(status)
  if (!label) return null

  return (
    <span className={clsx('inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-soft', className)}>
      <span className="h-1 w-1 flex-shrink-0 rounded-full bg-slate-soft" />
      {label}
    </span>
  )
}
