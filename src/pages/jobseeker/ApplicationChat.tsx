import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useChat } from '../../context/ChatContext'
import { useData } from '../../context/DataContext'
import { ApplicationDetailTabs } from '../../components/listings/ApplicationDetailTabs'
import { ChatThread } from '../../components/listings/ChatThread'

export function ApplicationChat() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getApplicationById, getListing } = useListings()
  const { getMessagesForApplication } = useChat()
  const { getUserById } = useData()

  const application = getApplicationById(id ?? '')
  if (!application || application.applicantId !== currentUser?.id) {
    return <Navigate to="/job_seeker/applications" replace />
  }

  const listing = getListing(application.listingId)
  const recruiter = listing ? getUserById(listing.postedBy) : undefined

  return (
    <div className="mx-auto max-w-2xl">
      <ApplicationDetailTabs
        title={listing?.title ?? 'Application'}
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'My Applications', to: '/job_seeker/applications' }, { label: listing?.code ?? '' }]}
        status={application.status}
        baseUrl={`/job_seeker/applications/${application.id}`}
        messageCount={getMessagesForApplication(application.id).length}
      />

      <ChatThread
        applicationId={application.id}
        currentUserId={currentUser!.id}
        currentUserName={currentUser!.name}
        currentUserRole="job_seeker"
        otherPartyLabel={recruiter?.name ?? 'the recruiter'}
      />
    </div>
  )
}
