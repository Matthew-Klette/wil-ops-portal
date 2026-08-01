import { Link } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatTile } from '../../components/ui/StatTile'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { relativeTime } from '../../lib/status'
import { StatusBadge } from '../../components/ui/StatusBadge'

export function AdminDashboard() {
  const { listings, applications } = useListings()
  const { activityLog, companies, getCompanyById, users } = useData()

  const openListings = listings.filter((l) => l.status === 'open')
  const activeApplications = applications.filter((a) => !['rejected', 'withdrawn'].includes(a.status))
  const activeUsers = users.filter((u) => u.active)
  const recentActivity = [...activityLog].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)).slice(0, 6)

  const byCompany = companies.map((company) => ({
    company,
    open: listings.filter((l) => l.companyId === company.id && l.status === 'open').length,
    total: listings.filter((l) => l.companyId === company.id).length,
  }))

  const needsAttention = applications
    .filter((a) => a.status === 'submitted')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6)

  return (
    <div>
      <PageHeader title="Admin Overview" subtitle="System-wide activity across every company." />

      <div className="mb-8 flex flex-wrap gap-3">
        <StatTile label="Open listings" value={openListings.length} />
        <StatTile label="Active applications" value={activeApplications.length} tone={activeApplications.length > 0 ? 'signal' : 'default'} />
        <StatTile label="Active users" value={activeUsers.length} />
        <StatTile label="Companies" value={companies.length} tone="pine" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Companies</h2>
          <div className="flex flex-col divide-y divide-fog">
            {byCompany.map(({ company, open, total }) => (
              <div key={company.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-ink">{company.name}</span>
                  <span className="text-xs text-slate-soft">{company.industry} · client since {new Date(company.since).getFullYear()}</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 text-right">
                  <span className="font-mono text-xs text-slate-soft">{total} total</span>
                  <span className="rounded-full bg-signal-soft px-2.5 py-1 font-mono text-xs font-medium text-signal">
                    {open} open
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-medium text-ink">Recent activity</h2>
            <Link to="/admin/activity" className="text-sm font-medium text-signal hover:text-signal/80">
              View log
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((entry) => {
              const actor = users.find((u) => u.name === entry.actor)
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <Avatar name={entry.actor} color={actor?.initialColor ?? '#3D4552'} size={28} />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{entry.actor}</span> {entry.action}{' '}
                      <span className="text-slate-soft">{entry.target}</span>
                    </p>
                    <span className="font-mono text-[11px] text-slate-soft">{relativeTime(entry.timestamp)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <h2 className="mb-4 font-display text-base font-medium text-ink">Needs attention</h2>
        {needsAttention.length === 0 ? (
          <p className="text-sm text-slate-soft">Nothing new awaiting review right now.</p>
        ) : (
          <div className="flex flex-col divide-y divide-fog">
            {needsAttention.map((a) => {
              const listing = listings.find((l) => l.id === a.listingId)
              return (
                <Link
                  key={a.id}
                  to={`/recruiter/applications/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm transition-colors first:pt-0 last:pb-0 hover:text-signal"
                >
                  <span>
                    <span className="font-mono text-xs text-slate-soft">{listing?.code}</span> — {listing?.title}
                    <span className="ml-2 text-xs text-slate-soft">{listing ? getCompanyById(listing.companyId)?.name : ''}</span>
                  </span>
                  <StatusBadge status={a.status} />
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
