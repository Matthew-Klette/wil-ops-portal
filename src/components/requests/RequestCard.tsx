import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { WorkRequest } from '../../data/types'
import { StatusBadge } from '../ui/StatusBadge'
import { PriorityBadge } from '../ui/PriorityBadge'
import { WaitingOn } from '../ui/WaitingOn'
import { relativeTime } from '../../lib/status'
import { IconChevronRight } from '../icons'

export function RequestCard({ request, to, meta }: { request: WorkRequest; to: string; meta?: ReactNode }) {
  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        to={to}
        className="group flex flex-col gap-3 rounded-xl border border-fog bg-paper-raised p-4 shadow-card transition-colors hover:border-signal/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-soft">{request.code}</span>
            <PriorityBadge priority={request.priority} />
          </div>
          <h3 className="font-display text-[16px] font-medium leading-snug text-ink transition-colors group-hover:text-signal">
            {request.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-soft">
            <span>{request.category}</span>
            <span aria-hidden>·</span>
            <span>Updated {relativeTime(request.updatedAt)}</span>
            {meta}
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-start gap-1.5 self-start sm:items-end sm:self-auto">
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            <IconChevronRight width={16} height={16} className="hidden text-slate-soft transition-transform group-hover:translate-x-0.5 sm:block" />
          </div>
          <WaitingOn status={request.status} />
        </div>
      </Link>
    </motion.div>
  )
}
