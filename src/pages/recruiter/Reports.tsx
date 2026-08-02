import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { applicationStatusLabels } from '../../data/mock'
import type { ApplicationStatus } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { BarChart } from '../../components/charts/BarChart'

const statusOrder: ApplicationStatus[] = ['submitted', 'in_review', 'interview', 'offered', 'rejected', 'withdrawn']

export function Reports() {
  const { currentUser } = useAuth()
  const { listings, applications } = useListings()
  const { users } = useData()
  const basePath = currentUser?.role === 'admin' ? '/admin' : '/recruiter'

  const byStatus = statusOrder.map((s) => ({ label: applicationStatusLabels[s], value: applications.filter((a) => a.status === s).length }))

  const categoryCounts = new Map<string, number>()
  listings.forEach((l) => categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1))
  const byCategory = [...categoryCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const recruiters = users.filter((u) => u.role === 'recruiter')
  const byRecruiter = recruiters.map((u) => ({
    label: u.name,
    value: listings.filter((l) => l.postedBy === u.id).length,
  }))

  const offered = applications.filter((a) => a.status === 'offered')
  const avgDays =
    offered.length === 0
      ? 0
      : Math.round(
          (offered.reduce((sum, a) => sum + (new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime()), 0) /
            offered.length /
            (1000 * 60 * 60 * 24)) *
            10,
        ) / 10

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="A quick read on hiring activity across the team."
        crumbs={[{ label: 'Dashboard', to: basePath }, { label: 'Reports' }]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <StatTile label="Total listings" value={listings.length} />
        <StatTile label="Total applications" value={applications.length} />
        <StatTile label="Offers made" value={offered.length} tone="pine" />
        <StatTile label="Avg. days to offer" value={avgDays} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Applications by status</h2>
          <BarChart data={byStatus} tone="signal" />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Listings by category</h2>
          <BarChart data={byCategory} tone="signal" />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Listings posted by recruiter</h2>
          <BarChart data={byRecruiter} tone="pine" />
        </Card>
      </div>
    </div>
  )
}
