import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { useData } from '../../context/DataContext'
import { RequestDetailTabs } from '../../components/requests/RequestDetailTabs'
import { Card } from '../../components/ui/Card'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { StatusThread } from '../../components/ui/StatusThread'
import { formatDate } from '../../lib/status'
import type { RequestStatus } from '../../data/types'

const nextActions: Record<RequestStatus, { label: string; next: RequestStatus }[]> = {
  submitted: [{ label: 'Start review', next: 'in_review' }],
  in_review: [{ label: 'Begin work', next: 'in_progress' }],
  in_progress: [
    { label: 'Request client input', next: 'awaiting_client' },
    { label: 'Mark resolved', next: 'resolved' },
  ],
  awaiting_client: [{ label: 'Resume work', next: 'in_progress' }],
  resolved: [{ label: 'Close request', next: 'closed' }],
  closed: [],
}

export function StaffRequestDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getRequest, setStatus, assignRequest } = useRequests()
  const { users, getClientOrgById, getUserById } = useData()
  const [note, setNote] = useState('')

  const staffUsers = users.filter((u) => u.role === 'staff')

  const request = getRequest(id ?? '')
  if (!request) return <Navigate to="/staff/requests" replace />

  const org = getClientOrgById(request.clientOrgId)
  const requester = getUserById(request.requestedBy)
  const assignee = request.assignedTo ? getUserById(request.assignedTo) : null
  const actions = nextActions[request.status]

  function handleAction(next: RequestStatus) {
    if (!currentUser) return
    setStatus(request!.id, next, currentUser.name, note.trim() || undefined)
    setNote('')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <RequestDetailTabs
        title={request.title}
        code={request.code}
        crumbs={[{ label: 'Dashboard', to: '/staff' }, { label: 'Requests', to: '/staff/requests' }, { label: request.code }]}
        status={request.status}
        baseUrl={`/staff/requests/${request.id}`}
        messageCount={request.messages.length}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-soft">
        <span>{org?.name}</span>
        <span>·</span>
        <span>{request.category}</span>
        <span>·</span>
        <span>Requested by {requester?.name}</span>
        <span>·</span>
        <span>Submitted {formatDate(request.createdAt)}</span>
        <PriorityBadge priority={request.priority} />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="flex flex-col p-5">
          <h2 className="mb-2 font-display text-base font-medium text-ink">Details</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{request.description}</p>
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Progress</h2>
          <StatusThread events={request.statusHistory} />
        </Card>

        <Card className="flex flex-col p-5">
          <h2 className="mb-3 font-display text-base font-medium text-ink">Assignment</h2>
          <select
            value={request.assignedTo ?? ''}
            onChange={(e) => assignRequest(request.id, e.target.value)}
            className="w-full rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
          >
            <option value="" disabled>
              Unassigned
            </option>
            {staffUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.title}
              </option>
            ))}
          </select>
          {assignee && <p className="mt-2 text-xs text-slate-soft">Currently assigned to {assignee.name}.</p>}
        </Card>

        {actions.length > 0 && (
          <Card className="flex flex-col p-5">
            <h2 className="mb-3 font-display text-base font-medium text-ink">Update status</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note — the client will see this on their timeline"
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
