import { Navigate, useParams } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { ChatThread } from '../../components/listings/ChatThread'

export function ConversationView() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getApplicationById, getListing } = useListings()
  const { getUserById } = useData()

  const application = getApplicationById(id ?? '')
  if (!application) return <Navigate to="/admin/conversations" replace />

  const listing = getListing(application.listingId)
  const applicant = getUserById(application.applicantId)
  const recruiter = listing ? getUserById(listing.postedBy) : undefined

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={listing?.title ?? 'Conversation'}
        subtitle={`${applicant?.name ?? 'Applicant'} & ${recruiter?.name ?? 'Recruiter'}`}
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Conversations', to: '/admin/conversations' }, { label: listing?.code ?? '' }]}
      />

      <ChatThread
        applicationId={application.id}
        currentUserId={currentUser!.id}
        currentUserName={currentUser!.name}
        currentUserRole="admin"
        otherPartyLabel="this conversation"
        allowClear
        readOnly
      />
    </div>
  )
}
