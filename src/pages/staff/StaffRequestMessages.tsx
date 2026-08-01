import { useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { useData } from '../../context/DataContext'
import { RequestDetailTabs } from '../../components/requests/RequestDetailTabs'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { formatDateTime } from '../../lib/status'
import { IconSend } from '../../components/icons'

export function StaffRequestMessages() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { getRequest, addMessage } = useRequests()
  const { getClientOrgById } = useData()
  const [reply, setReply] = useState('')

  const request = getRequest(id ?? '')
  if (!request) return <Navigate to="/staff/requests" replace />

  const org = getClientOrgById(request.clientOrgId)

  function handleReply(e: FormEvent) {
    e.preventDefault()
    if (!reply.trim() || !currentUser) return
    addMessage(request!.id, {
      author: currentUser.name,
      authorRole: 'staff',
      body: reply.trim(),
      timestamp: new Date().toISOString(),
    })
    setReply('')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <RequestDetailTabs
        title={request.title}
        code={request.code}
        crumbs={[{ label: 'Dashboard', to: '/staff' }, { label: 'Requests', to: '/staff/requests' }, { label: request.code }]}
        status={request.status}
        baseUrl={`/staff/requests/${request.id}`}
        messageCount={request.messages.length}
      />

      <Card className="flex flex-col p-5">
        <p className="mb-4 text-xs text-slate-soft">Thread with {org?.name}</p>
        <div className="flex flex-col gap-4">
          {request.messages.length === 0 ? (
            <p className="text-sm text-slate-soft">No messages yet on this request.</p>
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
            placeholder={`Reply to ${org?.name ?? 'the client'}…`}
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
  )
}
