import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useChat } from '../../context/ChatContext'
import { useData } from '../../context/DataContext'
import { ApplicationDetailTabs } from '../../components/listings/ApplicationDetailTabs'
import { Card } from '../../components/ui/Card'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { StatusThread } from '../../components/ui/StatusThread'
import { formatDate } from '../../lib/status'
import { IconEdit, IconFile, IconTrash } from '../../components/icons'

export function ApplicationDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getApplicationById, getListing, setApplicationStatus, updateApplicationDetails, deleteApplication } = useListings()
  const { getMessagesForApplication } = useChat()
  const { getCompanyById } = useData()

  const [editing, setEditing] = useState(false)
  const [draftCoverNote, setDraftCoverNote] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const application = getApplicationById(id ?? '')
  const justApplied = Boolean((location.state as { justApplied?: boolean } | null)?.justApplied)

  if (!application || application.applicantId !== currentUser?.id) {
    return <Navigate to="/job_seeker/applications" replace />
  }

  const listing = getListing(application.listingId)
  const company = listing ? getCompanyById(listing.companyId) : undefined
  const canWithdraw = !['rejected', 'withdrawn', 'offered'].includes(application.status)
  const canEdit = ['submitted', 'in_review'].includes(application.status)
  const canDelete = ['rejected', 'withdrawn'].includes(application.status)

  function handleWithdraw() {
    if (!currentUser) return
    setApplicationStatus(application!.id, 'withdrawn', currentUser.name, 'job_seeker')
  }

  function startEditing() {
    setDraftCoverNote(application!.coverNote ?? '')
    setEditing(true)
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    updateApplicationDetails(application!.id, { coverNote: draftCoverNote.trim() || undefined, resumeUrl: application!.resumeUrl })
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deleteApplication(application!.id)
      navigate('/job_seeker/applications')
    } catch (err) {
      console.error('Failed to delete application', err)
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence>
        {justApplied && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden rounded-xl border border-pine/30 bg-pine-soft px-4 py-3 text-sm font-medium text-pine"
          >
            Application submitted — we'll keep this page updated as it moves through review.
          </motion.div>
        )}
      </AnimatePresence>

      <ApplicationDetailTabs
        title={listing?.title ?? 'Application'}
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'My Applications', to: '/job_seeker/applications' }, { label: listing?.code ?? '' }]}
        status={application.status}
        baseUrl={`/job_seeker/applications/${application.id}`}
        messageCount={getMessagesForApplication(application.id).length}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wide text-slate-soft">
        <span>{company?.name}</span>
        <span>·</span>
        <span>Applied {formatDate(application.createdAt)}</span>
        {listing && <PriorityBadge employmentType={listing.employmentType} />}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-medium text-ink">Your cover note</h2>
              {!editing && canEdit && (
                <button
                  onClick={startEditing}
                  aria-label="Edit cover note"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-soft transition-colors hover:bg-fog-soft hover:text-signal"
                >
                  <IconEdit width={15} height={15} />
                </button>
              )}
            </div>
            {editing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                <textarea
                  value={draftCoverNote}
                  onChange={(e) => setDraftCoverNote(e.target.value)}
                  rows={4}
                  className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-slate outline-none focus:border-signal"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-signal px-4 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-signal/90"
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-soft transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate">
                {application.coverNote || 'No cover note submitted.'}
              </p>
            )}
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

          {canWithdraw && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-base font-medium text-ink">Not interested anymore?</h2>
              <p className="mb-3 text-sm text-slate-soft">You can withdraw your application at any time.</p>
              <button
                onClick={handleWithdraw}
                className="rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
              >
                Withdraw application
              </button>
            </Card>
          )}

          {canDelete && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-base font-medium text-ink">Remove this application</h2>
              <p className="mb-3 text-sm text-slate-soft">
                This application is {application.status} — you can permanently delete it and its chat history.
              </p>
              <button
                onClick={handleDelete}
                onBlur={() => setConfirmingDelete(false)}
                disabled={deleting}
                className={
                  confirmingDelete
                    ? 'flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-signal/90'
                    : 'flex items-center gap-1.5 rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate-soft transition-colors hover:border-signal/40 hover:text-signal'
                }
              >
                <IconTrash width={14} height={14} />
                {deleting ? 'Deleting…' : confirmingDelete ? 'Confirm delete' : 'Delete application'}
              </button>
            </Card>
          )}
        </div>

        <Card className="flex flex-col p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Progress</h2>
          <StatusThread events={application.statusHistory} />
        </Card>
      </div>
    </div>
  )
}
