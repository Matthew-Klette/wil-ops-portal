import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { RequestCard } from '../../components/requests/RequestCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconPlus } from '../../components/icons'
import type { RequestStatus } from '../../data/types'

const filters: { key: 'all' | 'open' | RequestStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'awaiting_client', label: 'Awaiting you' },
  { key: 'resolved', label: 'Resolved' },
]

export function MyRequests() {
  const { currentUser } = useAuth()
  const { requests } = useRequests()
  const [filter, setFilter] = useState<(typeof filters)[number]['key']>('all')

  const mine = requests
    .filter((r) => r.clientOrgId === currentUser?.clientOrgId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const filtered = mine.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'open') return !['resolved', 'closed'].includes(r.status)
    return r.status === filter
  })

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Every request you've submitted to WIL-Ops, in one place."
        crumbs={[{ label: 'Dashboard', to: '/client' }, { label: 'My Requests' }]}
        actions={
          <Link
            to="/client/requests/new"
            className="flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            <IconPlus width={16} height={16} />
            New request
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
              filter === f.key
                ? 'border-ink bg-ink text-paper'
                : 'border-fog bg-paper-raised text-slate hover:border-signal/40',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description="No requests match this filter right now."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} to={`/client/requests/${r.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
