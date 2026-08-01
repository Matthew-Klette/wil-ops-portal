import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { RequestCard } from '../../components/requests/RequestCard'
import { EmptyState } from '../../components/ui/EmptyState'

type Filter = 'all' | 'mine' | 'unassigned' | 'open'

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All requests' },
  { key: 'mine', label: 'Assigned to me' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'open', label: 'Open' },
]

export function RequestList() {
  const { currentUser } = useAuth()
  const { requests } = useRequests()
  const { clientOrgs, getClientOrgById } = useData()
  const [filter, setFilter] = useState<Filter>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')

  let filtered = requests
  if (filter === 'mine') filtered = filtered.filter((r) => r.assignedTo === currentUser?.id)
  if (filter === 'unassigned') filtered = filtered.filter((r) => !r.assignedTo)
  if (filter === 'open') filtered = filtered.filter((r) => !['resolved', 'closed'].includes(r.status))
  if (clientFilter !== 'all') filtered = filtered.filter((r) => r.clientOrgId === clientFilter)

  filtered = [...filtered].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle="Every work request across all client accounts."
        crumbs={[{ label: 'Dashboard', to: '/staff' }, { label: 'Requests' }]}
      />

      <div className="mb-3 flex flex-wrap gap-2">
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

      <div className="mb-5">
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-full border border-fog bg-paper-raised px-3.5 py-1.5 text-sm text-slate outline-none focus:border-signal"
        >
          <option value="all">All client accounts</option>
          {clientOrgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No requests match" description="Try a different filter combination." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              to={`/staff/requests/${r.id}`}
              meta={<span>{getClientOrgById(r.clientOrgId)?.name}</span>}
            />
          ))}
        </div>
      )}
    </div>
  )
}
