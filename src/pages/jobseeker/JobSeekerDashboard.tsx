import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatTile } from '../../components/ui/StatTile'
import { ListingBrowseCard } from '../../components/listings/ListingBrowseCard'
import { ApplicationRow } from '../../components/listings/ApplicationRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconGrid } from '../../components/icons'

export function JobSeekerDashboard() {
  const { currentUser } = useAuth()
  const { listings, getApplicationsForApplicant, hasApplied } = useListings()
  const { getCompanyById } = useData()

  const mine = currentUser ? getApplicationsForApplicant(currentUser.id) : []
  const awaiting = mine.filter((a) => ['submitted', 'in_review', 'interview'].includes(a.status))
  const offers = mine.filter((a) => a.status === 'offered')
  const recentApplications = [...mine].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 3)

  const openListings = listings
    .filter((l) => l.status === 'open')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 3)

  const firstName = currentUser?.name.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's what's happening with your job search."
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

      <div className="mb-8 flex flex-wrap gap-3">
        <StatTile label="Applications sent" value={mine.length} />
        <StatTile label="Awaiting response" value={awaiting.length} tone={awaiting.length > 0 ? 'signal' : 'default'} />
        <StatTile label="Offers" value={offers.length} tone="pine" />
      </div>

      <div className="mb-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Recent applications</h2>
          <Link to="/job_seeker/applications" className="text-sm font-medium text-signal transition-colors hover:text-signal/80">
            View all
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Browse open listings and apply — your applications will show up here so you can track their progress."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentApplications.map((a) => {
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Open roles</h2>
          <Link to="/job_seeker/listings" className="text-sm font-medium text-signal transition-colors hover:text-signal/80">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openListings.map((l) => (
            <ListingBrowseCard
              key={l.id}
              listing={l}
              companyName={getCompanyById(l.companyId)?.name}
              to={`/job_seeker/listings/${l.id}`}
              applied={currentUser ? hasApplied(l.id, currentUser.id) : false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
