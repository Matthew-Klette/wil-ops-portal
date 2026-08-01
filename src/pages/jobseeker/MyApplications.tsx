import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { ApplicationRow } from '../../components/listings/ApplicationRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconGrid } from '../../components/icons'
import type { ApplicationStatus } from '../../data/types'

const filters: { key: 'all' | 'open' | ApplicationStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'In progress' },
  { key: 'offered', label: 'Offered' },
  { key: 'rejected', label: 'Rejected' },
]

export function MyApplications() {
  const { currentUser } = useAuth()
  const { listings, getApplicationsForApplicant } = useListings()
  const { getCompanyById } = useData()
  const [filter, setFilter] = useState<(typeof filters)[number]['key']>('all')

  const mine = currentUser
    ? [...getApplicationsForApplicant(currentUser.id)].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    : []

  const filtered = mine.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'open') return !['offered', 'rejected', 'withdrawn'].includes(a.status)
    return a.status === filter
  })

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Every role you've applied to, in one place."
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'My Applications' }]}
        actions={
          <Link
            to="/job_seeker/listings"
            className="flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            <IconGrid width={16} height={16} />
            Browse jobs
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === f.key ? 'border-ink bg-ink text-paper' : 'border-fog bg-paper-raised text-slate hover:border-signal/40',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here" description="No applications match this filter right now." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((a) => {
            const listing = listings.find((l) => l.id === a.listingId)
            return (
              <ApplicationRow
                key={a.id}
                application={a}
                to={`/job_seeker/applications/${a.id}`}
                primaryLabel={listing?.title ?? 'Listing'}
                primaryColor="#3F6B54"
                meta={listing ? getCompanyById(listing.companyId)?.name : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
