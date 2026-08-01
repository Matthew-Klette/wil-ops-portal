import { Navigate, useParams } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { ApplicationRow } from '../../components/listings/ApplicationRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../lib/status'

export function ListingApplicants() {
  const { id } = useParams()
  const { getListing, getApplicationsForListing, updateListingStatus } = useListings()
  const { getCompanyById, getUserById } = useData()

  const listing = getListing(id ?? '')
  if (!listing) return <Navigate to="/recruiter/listings" replace />

  const company = getCompanyById(listing.companyId)
  const applications = [...getApplicationsForListing(listing.id)].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={listing.title}
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Listings', to: '/recruiter/listings' }, { label: listing.code }]}
        actions={
          <button
            onClick={() => updateListingStatus(listing.id, listing.status === 'open' ? 'closed' : 'open')}
            className="rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
          >
            {listing.status === 'open' ? 'Close listing' : 'Reopen listing'}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-soft">
        <span>{company?.name}</span>
        <span>·</span>
        <span>{listing.location}</span>
        <span>·</span>
        <span>Posted {formatDate(listing.createdAt)}</span>
        <PriorityBadge employmentType={listing.employmentType} />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="mb-2 font-display text-base font-medium text-ink">Description</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{listing.description}</p>
      </Card>

      <h2 className="mb-3 font-display text-lg font-medium text-ink">Applicants ({applications.length})</h2>
      {applications.length === 0 ? (
        <EmptyState title="No applicants yet" description="Applications will show up here as job seekers apply." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {applications.map((a) => {
            const applicant = getUserById(a.applicantId)
            return (
              <ApplicationRow
                key={a.id}
                application={a}
                to={`/recruiter/applications/${a.id}`}
                primaryLabel={applicant?.name ?? 'Applicant'}
                primaryColor={applicant?.initialColor ?? '#3D4552'}
                meta={applicant?.headline}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
