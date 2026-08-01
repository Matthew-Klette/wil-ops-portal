import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatTile } from '../../components/ui/StatTile'
import { RequestCard } from '../../components/requests/RequestCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconPlus } from '../../components/icons'

export function ClientDashboard() {
  const { currentUser } = useAuth()
  const { requests } = useRequests()

  const mine = requests.filter((r) => r.clientOrgId === currentUser?.clientOrgId)
  const open = mine.filter((r) => !['resolved', 'closed'].includes(r.status))
  const awaitingYou = mine.filter((r) => r.status === 'awaiting_client')
  const resolved = mine.filter((r) => r.status === 'resolved' || r.status === 'closed')
  const recent = [...mine].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 4)

  const firstName = currentUser?.name.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's where things stand on your requests with WIL-Ops."
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

      <div className="mb-8 flex flex-wrap gap-3">
        <StatTile label="Open requests" value={open.length} />
        <StatTile label="Awaiting you" value={awaitingYou.length} tone={awaitingYou.length > 0 ? 'signal' : 'default'} />
        <StatTile label="Resolved" value={resolved.length} tone="pine" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Recent activity</h2>
          <Link to="/client/requests" className="text-sm font-medium text-signal transition-colors hover:text-signal/80">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="When you submit a request, it'll show up here so you can track it through to resolution."
            action={
              <Link
                to="/client/requests/new"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal"
              >
                Submit your first request
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recent.map((r) => (
              <RequestCard key={r.id} request={r} to={`/client/requests/${r.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
