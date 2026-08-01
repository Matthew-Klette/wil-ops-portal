import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useChat } from '../../context/ChatContext'
import { useData } from '../../context/DataContext'
import { ApplicationDetailTabs } from '../../components/listings/ApplicationDetailTabs'
import { Card } from '../../components/ui/Card'
import { StatusThread } from '../../components/ui/StatusThread'
import { formatDate } from '../../lib/status'
import { IconFile } from '../../components/icons'
import type { ApplicationStatus } from '../../data/types'

const nextActions: Record<ApplicationStatus, { label: string; next: ApplicationStatus }[]> = {
  submitted: [{ label: 'Start review', next: 'in_review' }],
  in_review: [
    { label: 'Schedule interview', next: 'interview' },
    { label: 'Reject', next: 'rejected' },
  ],
  interview: [
    { label: 'Make offer', next: 'offered' },
    { label: 'Reject', next: 'rejected' },
  ],
  offered: [],
  rejected: [],
  withdrawn: [],
}

export function ApplicationReview() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getApplicationById, getListing, setApplicationStatus } = useListings()
  const { getMessagesForApplication } = useChat()
  const { getCompanyById, getUserById } = useData()
  const [note, setNote] = useState('')

  const application = getApplicationById(id ?? '')
  if (!application) return <Navigate to="/recruiter/listings" replace />

  const listing = getListing(application.listingId)
  const company = listing ? getCompanyById(listing.companyId) : undefined
  const applicant = getUserById(application.applicantId)
  const actions = nextActions[application.status]

  function handleAction(next: ApplicationStatus) {
    if (!currentUser) return
    setApplicationStatus(application!.id, next, currentUser.name, 'recruiter', note.trim() || undefined)
    setNote('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ApplicationDetailTabs
        title={applicant?.name ?? 'Application'}
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Listings', to: '/recruiter/listings' }, { label: listing?.code ?? '' }]}
        status={application.status}
        baseUrl={`/recruiter/applications/${application.id}`}
        messageCount={getMessagesForApplication(application.id).length}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-soft">
        <span>{listing?.title}</span>
        <span>·</span>
        <span>{company?.name}</span>
        <span>·</span>
        <span>Applied {formatDate(application.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="flex flex-col p-5">
          <h2 className="mb-2 font-display text-base font-medium text-ink">Cover note</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate">
            {application.coverNote || 'No cover note submitted.'}
          </p>
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:text-signal/80"
            >
              <IconFile width={14} height={14} />
              View attached document
            </a>
          )}
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Progress</h2>
          <StatusThread events={application.statusHistory} />
        </Card>

        {actions.length > 0 && (
          <Card className="flex flex-col p-5 lg:col-span-2">
            <h2 className="mb-3 font-display text-base font-medium text-ink">Update status</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note — the applicant will see this on their timeline"
              rows={2}
              className="mb-3 w-full resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-soft focus:border-signal"
            />
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <button
                  key={a.next}
                  onClick={() => handleAction(a.next)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-signal"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
