import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatTile } from '../../components/ui/StatTile'
import { ApplicationRow } from '../../components/listings/ApplicationRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconPlus } from '../../components/icons'

export function RecruiterDashboard() {
  const { currentUser } = useAuth()
  const { listings, applications } = useListings()
  const { getUserById } = useData()

  const myListings = listings.filter((l) => l.postedBy === currentUser?.id)
  const myOpenListings = myListings.filter((l) => l.status === 'open')
  const myListingIds = new Set(myListings.map((l) => l.id))
  const myApplications = applications.filter((a) => myListingIds.has(a.listingId))
  const needsReview = myApplications.filter((a) => a.status === 'submitted' || a.status === 'in_review')
  const interviewing = myApplications.filter((a) => a.status === 'interview')
  const sorted = [...needsReview].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const firstName = currentUser?.name.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${firstName}`}
        subtitle="Here's what's on your plate today."
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

      <div className="mb-8 flex flex-wrap gap-3">
        <StatTile label="Open listings" value={myOpenListings.length} />
        <StatTile label="Needs review" value={needsReview.length} tone={needsReview.length > 0 ? 'signal' : 'default'} />
        <StatTile label="Interviewing" value={interviewing.length} tone="pine" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink">Applications needing review</h2>
          <Link to="/recruiter/listings" className="text-sm font-medium text-signal hover:text-signal/80">
            View all listings
          </Link>
        </div>

        {sorted.length === 0 ? (
          <EmptyState title="You're all caught up" description="Nothing needs your review right now." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {sorted.map((a) => {
              const listing = listings.find((l) => l.id === a.listingId)
              const applicant = getUserById(a.applicantId)
              return (
                <ApplicationRow
                  key={a.id}
                  application={a}
                  to={`/recruiter/applications/${a.id}`}
                  primaryLabel={applicant?.name ?? 'Applicant'}
                  primaryColor={applicant?.initialColor ?? '#3D4552'}
                  meta={listing?.title}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
