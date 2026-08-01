import { Navigate, useParams } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { useChat } from '../../context/ChatContext'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { ApplicationDetailTabs } from '../../components/listings/ApplicationDetailTabs'
import { ChatThread } from '../../components/listings/ChatThread'

export function ApplicationChat() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getApplicationById, getListing } = useListings()
  const { getMessagesForApplication } = useChat()
  const { getUserById } = useData()

  const application = getApplicationById(id ?? '')
  if (!application) return <Navigate to="/recruiter/listings" replace />

  const listing = getListing(application.listingId)
  const applicant = getUserById(application.applicantId)

  return (
    <div className="mx-auto max-w-2xl">
      <ApplicationDetailTabs
        title={applicant?.name ?? 'Application'}
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Listings', to: '/recruiter/listings' }, { label: listing?.code ?? '' }]}
        status={application.status}
        baseUrl={`/recruiter/applications/${application.id}`}
        messageCount={getMessagesForApplication(application.id).length}
      />

      <ChatThread
        applicationId={application.id}
        currentUserId={currentUser!.id}
        currentUserName={currentUser!.name}
        currentUserRole="recruiter"
        otherPartyLabel={applicant?.name ?? 'the applicant'}
      />
    </div>
  )
}
