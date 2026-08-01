import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { WaitingOn } from '../../components/ui/WaitingOn'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { StatusThread } from '../../components/ui/StatusThread'
import { Avatar } from '../../components/ui/Avatar'
import { formatDate, formatDateTime } from '../../lib/status'
import { IconEdit, IconSend } from '../../components/icons'

export function ClientRequestDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { getRequest, addMessage, updateRequestDetails } = useRequests()
  const [reply, setReply] = useState('')
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  const request = getRequest(id ?? '')
  const justSubmitted = Boolean((location.state as { justSubmitted?: boolean } | null)?.justSubmitted)

  if (!request || request.clientOrgId !== currentUser?.clientOrgId) {
    return <Navigate to="/client/requests" replace />
  }

  function startEditing() {
    setDraftTitle(request!.title)
    setDraftDescription(request!.description)
    setEditing(true)
  }

  function handleSaveDetails(e: FormEvent) {
    e.preventDefault()
    if (!draftTitle.trim() || !draftDescription.trim()) return
    updateRequestDetails(request!.id, { title: draftTitle.trim(), description: draftDescription.trim() })
    setEditing(false)
  }

  function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!reply.trim() || !currentUser) return
    addMessage(request!.id, {
      author: currentUser.name,
      authorRole: 'client',
      body: reply.trim(),
      timestamp: new Date().toISOString(),
    })
    setReply('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden rounded-xl border border-pine/30 bg-pine-soft px-4 py-3 text-sm font-medium text-pine"
          >
            Request submitted — we'll keep this page updated as it moves through review.
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title={request.title}
        crumbs={[{ label: 'Dashboard', to: '/client' }, { label: 'My Requests', to: '/client/requests' }, { label: request.code }]}
        actions={
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={request.status} />
            <WaitingOn status={request.status} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wide text-slate-soft">
        <span>{request.code}</span>
        <span>·</span>
        <span>{request.category}</span>
        <span>·</span>
        <span>Submitted {formatDate(request.createdAt)}</span>
        <PriorityBadge priority={request.priority} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-medium text-ink">Details</h2>
              {!editing && (
                <button
                  onClick={startEditing}
                  aria-label="Edit details"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-soft transition-colors hover:bg-fog-soft hover:text-signal"
                >
                  <IconEdit width={15} height={15} />
                </button>
              )}
            </div>
            {editing ? (
              <form onSubmit={handleSaveDetails} className="flex flex-col gap-3">
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm font-medium text-ink outline-none focus:border-signal"
                  maxLength={100}
                />
                <textarea
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  rows={4}
                  className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-slate outline-none focus:border-signal"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!draftTitle.trim() || !draftDescription.trim()}
                    className="rounded-full bg-signal px-4 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-fog disabled:text-slate-soft"
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
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{request.description}</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-medium text-ink">Progress</h2>
            <StatusThread events={request.statusHistory} />
          </Card>
        </div>

        <Card className="flex flex-col p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Messages</h2>
          <div className="flex flex-1 flex-col gap-4">
            {request.messages.length === 0 ? (
              <p className="text-sm text-slate-soft">
                No messages yet. If you have questions about this request, send one below.
              </p>
            ) : (
              request.messages.map((m) => (
                <div key={m.id} className="flex gap-3">
                  <Avatar name={m.author} color={m.authorRole === 'client' ? '#D9642C' : '#3D4552'} size={30} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-ink">{m.author}</span>
                      <span className="font-mono text-[10px] text-slate-soft">{formatDateTime(m.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate">{m.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleReply} className="mt-5 flex items-center gap-2 border-t border-fog pt-4">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Ask a question or add a note…"
              className="flex-1 rounded-full border border-fog bg-paper px-4 py-2 text-sm outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
            <button
              type="submit"
              disabled={!reply.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-signal disabled:bg-fog disabled:text-slate-soft"
            >
              <IconSend width={15} height={15} />
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
