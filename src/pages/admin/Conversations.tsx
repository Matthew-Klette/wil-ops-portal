import { Link } from 'react-router-dom'
import { useListings } from '../../context/ListingsContext'
import { useChat } from '../../context/ChatContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { relativeTime } from '../../lib/status'

export function Conversations() {
  const { applications, listings } = useListings()
  const { getMessagesForApplication } = useChat()
  const { getUserById } = useData()

  const withMessages = applications
    .map((a) => ({ application: a, messages: getMessagesForApplication(a.id) }))
    .filter((row) => row.messages.length > 0)
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.timestamp ?? ''
      const bLast = b.messages[b.messages.length - 1]?.timestamp ?? ''
      return aLast < bLast ? 1 : -1
    })

  return (
    <div>
      <PageHeader
        title="Conversations"
        subtitle="Every chat thread between a recruiter and an applicant."
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Conversations' }]}
      />

      {withMessages.length === 0 ? (
        <EmptyState title="No conversations yet" description="Chats will show up here once a recruiter and applicant start messaging." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {withMessages.map(({ application, messages }) => {
            const listing = listings.find((l) => l.id === application.listingId)
            const applicant = getUserById(application.applicantId)
            const recruiter = listing ? getUserById(listing.postedBy) : undefined
            const last = messages[messages.length - 1]
            return (
              <Link key={application.id} to={`/admin/conversations/${application.id}`}>
                <Card className="flex flex-col gap-2 p-4 transition-colors hover:border-signal/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={applicant?.name ?? '?'} color={applicant?.initialColor ?? '#3D4552'} size={34} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-ink">
                        {applicant?.name ?? 'Applicant'} <span className="text-slate-soft">&amp;</span> {recruiter?.name ?? 'Recruiter'}
                      </span>
                      <span className="text-xs text-slate-soft">{listing?.title}</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3 text-xs text-slate-soft">
                    <span>{messages.length} message{messages.length === 1 ? '' : 's'}</span>
                    {last && <span>· last {relativeTime(last.timestamp)}</span>}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
