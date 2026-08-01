import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { JobListing } from '../../data/types'
import { PriorityBadge } from '../ui/PriorityBadge'
import { relativeTime } from '../../lib/status'
import { IconChevronRight } from '../icons'

export function ListingBrowseCard({
  listing,
  companyName,
  to,
  applied,
}: {
  listing: JobListing
  companyName?: string
  to: string
  applied?: boolean
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link
        to={to}
        className="group flex flex-col overflow-hidden rounded-2xl border border-fog bg-paper-raised shadow-card transition-colors hover:border-signal/40"
      >
        <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-fog-soft">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl font-medium text-slate-soft/50">{companyName?.[0] ?? listing.title[0]}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge employmentType={listing.employmentType} />
            {applied && (
              <span className="inline-flex items-center rounded-full bg-pine-soft px-2.5 py-1 text-[11px] font-medium text-pine">
                Applied
              </span>
            )}
          </div>
          <h3 className="font-display text-[16px] font-medium leading-snug text-ink transition-colors group-hover:text-signal">
            {listing.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-soft">
            {companyName && <span>{companyName}</span>}
            {companyName && <span aria-hidden>·</span>}
            <span>{listing.location}</span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate">{listing.description}</p>
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="font-mono text-[11px] text-slate-soft">Posted {relativeTime(listing.createdAt)}</span>
            <IconChevronRight width={16} height={16} className="text-slate-soft transition-transform group-hover:translate-x-0.5 group-hover:text-signal" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
