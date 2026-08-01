import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatTile } from '../../components/ui/StatTile'
import { RequestCard } from '../../components/requests/RequestCard'
import { EmptyState } from '../../components/ui/EmptyState'

export function StaffDashboard() {
  const { currentUser } = useAuth()
  const { requests } = useRequests()
  const { getClientOrgById } = useData()

  const mine = requests.filter((r) => r.assignedTo === currentUser?.id)
  const open = mine.filter((r) => !['resolved', 'closed'].includes(r.status))
  const awaitingClient = mine.filter((r) => r.status === 'awaiting_client')
  const unassigned = requests.filter((r) => !r.assignedTo)
  const sorted = [...open].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const firstName = currentUser?.name.split(' ')[0]

  return (
    <div>
      <PageHeader title={`Good to see you, ${firstName}`} subtitle="Here's what's on your plate today." />

      <div className="mb-8 flex flex-wrap gap-3">
        <StatTile label="Assigned to me" value={open.length} />
        <StatTile label="Awaiting client" value={awaitingClient.length} tone={awaitingClient.length > 0 ? 'signal' : 'default'} />
        <StatTile label="Unassigned" value={unassigned.length} tone={unassigned.length > 0 ? 'signal' : 'default'} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Your open requests</h2>
          <Link to="/staff/requests" className="text-sm font-medium text-signal hover:text-signal/80">
            View all requests
          </Link>
        </div>

        {sorted.length === 0 ? (
          <EmptyState title="You're all caught up" description="Nothing assigned to you needs attention right now." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {sorted.map((r) => (
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

      {unassigned.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          <h2 className="font-display text-lg font-medium text-ink">Unassigned — needs a home</h2>
          <div className="flex flex-col gap-2.5">
            {unassigned.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                to={`/staff/requests/${r.id}`}
                meta={<span>{getClientOrgById(r.clientOrgId)?.name}</span>}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
