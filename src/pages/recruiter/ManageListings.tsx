import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { ListingRow } from '../../components/listings/ListingRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconPlus } from '../../components/icons'

type Filter = 'all' | 'mine' | 'open' | 'closed'

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All listings' },
  { key: 'mine', label: 'Posted by me' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
]

export function ManageListings() {
  const { currentUser } = useAuth()
  const { listings, getApplicationsForListing } = useListings()
  const [filter, setFilter] = useState<Filter>('all')

  let filtered = listings
  if (filter === 'mine') filtered = filtered.filter((l) => l.postedBy === currentUser?.id)
  if (filter === 'open') filtered = filtered.filter((l) => l.status === 'open')
  if (filter === 'closed') filtered = filtered.filter((l) => l.status === 'closed')

  filtered = [...filtered].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Listings"
        subtitle="Every job listing posted by your team."
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Listings' }]}
        actions={
          <Link
            to="/recruiter/listings/new"
            className="flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            <IconPlus width={16} height={16} />
            Post a job
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
        <EmptyState title="No listings match" description="Try a different filter, or post a new job." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((l) => (
            <ListingRow key={l.id} listing={l} to={`/recruiter/listings/${l.id}`} applicantCount={getApplicationsForListing(l.id).length} />
          ))}
        </div>
      )}
    </div>
  )
}
