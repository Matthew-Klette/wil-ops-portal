import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { ListingBrowseCard } from '../../components/listings/ListingBrowseCard'
import { EmptyState } from '../../components/ui/EmptyState'
import type { EmploymentType } from '../../data/types'
import { employmentTypeLabels } from '../../data/mock'

type Filter = 'all' | EmploymentType

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'full_time', label: employmentTypeLabels.full_time },
  { key: 'part_time', label: employmentTypeLabels.part_time },
  { key: 'contract', label: employmentTypeLabels.contract },
  { key: 'internship', label: employmentTypeLabels.internship },
]

export function BrowseListings() {
  const { currentUser } = useAuth()
  const { listings, hasApplied } = useListings()
  const { getCompanyById } = useData()
  const [filter, setFilter] = useState<Filter>('all')

  let filtered = listings.filter((l) => l.status === 'open')
  if (filter !== 'all') filtered = filtered.filter((l) => l.employmentType === filter)
  filtered = [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Browse Jobs"
        subtitle="Open roles from companies hiring right now."
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'Browse Jobs' }]}
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
        <EmptyState title="No open roles match" description="Try a different filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingBrowseCard
              key={l.id}
              listing={l}
              companyName={getCompanyById(l.companyId)?.name}
              to={`/job_seeker/listings/${l.id}`}
              applied={currentUser ? hasApplied(l.id, currentUser.id) : false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
