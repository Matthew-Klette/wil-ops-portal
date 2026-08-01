import { useState, type FormEvent } from 'react'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { formatDateTime } from '../../lib/status'
import { IconSend } from '../icons'
import { useChat } from '../../context/ChatContext'
import type { Role } from '../../data/types'

export function ChatThread({
  applicationId,
  currentUserId,
  currentUserName,
  currentUserRole,
  otherPartyLabel,
}: {
  applicationId: string
  currentUserId: string
  currentUserName: string
  currentUserRole: Role
  otherPartyLabel: string
}) {
  const { getMessagesForApplication, sendMessage } = useChat()
  const [body, setBody] = useState('')
  const messages = getMessagesForApplication(applicationId)

  function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    sendMessage({ applicationId, senderId: currentUserId, senderRole: currentUserRole, body: body.trim() })
    setBody('')
  }

  return (
    <Card className="flex flex-col p-5">
      <p className="mb-4 text-xs text-slate-soft">Thread with {otherPartyLabel}</p>
      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-soft">No messages yet on this application.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <Avatar name={m.senderId === currentUserId ? currentUserName : otherPartyLabel} color={m.senderRole === 'job_seeker' ? '#D9642C' : '#3D4552'} size={30} />
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-ink">{m.senderId === currentUserId ? currentUserName : otherPartyLabel}</span>
                  <span className="font-mono text-[10px] text-slate-soft">{formatDateTime(m.timestamp)}</span>
                </div>
                <p className="text-sm text-slate">{m.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="mt-5 flex items-center gap-2 border-t border-fog pt-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Message ${otherPartyLabel}…`}
          className="flex-1 rounded-full border border-fog bg-paper px-4 py-2 text-sm outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
        />
        <button
          type="submit"
          disabled={!body.trim()}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-signal disabled:bg-fog disabled:text-slate-soft"
        >
          <IconSend width={15} height={15} />
        </button>
      </form>
    </Card>
  )
}
