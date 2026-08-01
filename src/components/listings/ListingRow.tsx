import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { JobListing } from '../../data/types'
import { PriorityBadge } from '../ui/PriorityBadge'
import { relativeTime } from '../../lib/status'
import { IconChevronRight } from '../icons'

export function ListingRow({ listing, to, applicantCount }: { listing: JobListing; to: string; applicantCount: number }) {
  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        to={to}
        className="group flex flex-col gap-3 rounded-xl border border-fog bg-paper-raised p-4 shadow-card transition-colors hover:border-signal/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-soft">{listing.code}</span>
            <PriorityBadge employmentType={listing.employmentType} />
          </div>
          <h3 className="font-display text-[16px] font-medium leading-snug text-ink transition-colors group-hover:text-signal">
            {listing.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-soft">
            <span>{listing.location}</span>
            <span aria-hidden>·</span>
            <span>Updated {relativeTime(listing.updatedAt)}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-start gap-1.5 self-start sm:items-end sm:self-auto">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide',
                listing.status === 'open' ? 'border-pine/30 bg-pine-soft text-pine' : 'border-fog bg-fog-soft text-slate',
              )}
            >
              {listing.status === 'open' ? 'Open' : 'Closed'}
            </span>
            <IconChevronRight width={16} height={16} className="hidden text-slate-soft transition-transform group-hover:translate-x-0.5 sm:block" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft">
            {applicantCount} applicant{applicantCount === 1 ? '' : 's'}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
