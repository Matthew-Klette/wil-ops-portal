import { useRequests } from '../../context/RequestsContext'
import { useData } from '../../context/DataContext'
import { statusLabels } from '../../data/mock'
import type { RequestStatus } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { BarChart } from '../../components/charts/BarChart'

const statusOrder: RequestStatus[] = ['submitted', 'in_review', 'in_progress', 'awaiting_client', 'resolved', 'closed']

export function Reports() {
  const { requests } = useRequests()
  const { users } = useData()

  const byStatus = statusOrder.map((s) => ({ label: statusLabels[s], value: requests.filter((r) => r.status === s).length }))

  const categoryCounts = new Map<string, number>()
  requests.forEach((r) => categoryCounts.set(r.category, (categoryCounts.get(r.category) ?? 0) + 1))
  const byCategory = [...categoryCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const staffUsers = users.filter((u) => u.role === 'staff')
  const byStaff = staffUsers.map((u) => ({
    label: u.name,
    value: requests.filter((r) => r.assignedTo === u.id && (r.status === 'resolved' || r.status === 'closed')).length,
  }))

  const resolved = requests.filter((r) => r.status === 'resolved' || r.status === 'closed')
  const avgDays =
    resolved.length === 0
      ? 0
      : Math.round(
          (resolved.reduce((sum, r) => sum + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()), 0) /
            resolved.length /
            (1000 * 60 * 60 * 24)) *
            10,
        ) / 10

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="A quick read on where requests stand across the team."
        crumbs={[{ label: 'Dashboard', to: '/staff' }, { label: 'Reports' }]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <StatTile label="Total requests" value={requests.length} />
        <StatTile label="Resolved" value={resolved.length} tone="pine" />
        <StatTile label="Avg. days to resolve" value={avgDays} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Requests by status</h2>
          <BarChart data={byStatus} tone="signal" />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Requests by category</h2>
          <BarChart data={byCategory} tone="signal" />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Resolved by team member</h2>
          <BarChart data={byStaff} tone="pine" />
        </Card>
      </div>
    </div>
  )
}
