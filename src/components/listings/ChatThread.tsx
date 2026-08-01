import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { formatDateTime } from '../../lib/status'
import { IconSend, IconTrash } from '../icons'
import { useChat } from '../../context/ChatContext'
import { supabase } from '../../lib/supabase'
import type { Role } from '../../data/types'

const TYPING_IDLE_MS = 2500

export function ChatThread({
  applicationId,
  currentUserId,
  currentUserName,
  currentUserRole,
  otherPartyLabel,
  allowClear = false,
  readOnly = false,
}: {
  applicationId: string
  currentUserId: string
  currentUserName: string
  currentUserRole: Role
  otherPartyLabel: string
  allowClear?: boolean
  readOnly?: boolean
}) {
  const { getMessagesForApplication, sendMessage, clearChat, notificationPermission, requestNotificationPermission, setActiveApplicationId } =
    useChat()
  const [body, setBody] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const messages = getMessagesForApplication(applicationId)

  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<number | undefined>(undefined)
  const otherTypingTimeoutRef = useRef<number | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  // Let ChatContext know this thread is the one on screen, so an incoming
  // message here doesn't also trigger a browser notification.
  useEffect(() => {
    setActiveApplicationId(applicationId)
    return () => setActiveApplicationId(null)
  }, [applicationId, setActiveApplicationId])

  useEffect(() => {
    if (readOnly) return
    const channel = supabase
      .channel(`typing-${applicationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === currentUserId) return
        setOtherTyping(true)
        window.clearTimeout(otherTypingTimeoutRef.current)
        otherTypingTimeoutRef.current = window.setTimeout(() => setOtherTyping(false), TYPING_IDLE_MS)
      })
      .subscribe()

    typingChannelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      window.clearTimeout(typingTimeoutRef.current)
      window.clearTimeout(otherTypingTimeoutRef.current)
    }
  }, [applicationId, currentUserId, readOnly])

  function handleBodyChange(value: string) {
    setBody(value)
    typingChannelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: currentUserId } })
    window.clearTimeout(typingTimeoutRef.current)
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    const outgoing = body.trim()
    setBody('')
    setSendError(null)
    try {
      await sendMessage({ applicationId, senderId: currentUserId, senderRole: currentUserRole, body: outgoing })
    } catch (err) {
      console.error('Failed to send message', err)
      setBody(outgoing)
      setSendError("Couldn't send that — check your connection and try again.")
    }
  }

  async function handleClear() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }
    setClearing(true)
    try {
      await clearChat(applicationId)
    } catch (err) {
      console.error('Failed to clear chat', err)
    } finally {
      setClearing(false)
      setConfirmingClear(false)
    }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-soft">Thread with {otherPartyLabel}</p>
        {allowClear && messages.length > 0 && (
          <button
            onClick={handleClear}
            onBlur={() => setConfirmingClear(false)}
            disabled={clearing}
            className={
              confirmingClear
                ? 'flex items-center gap-1.5 rounded-full bg-signal px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-signal/90'
                : 'flex items-center gap-1.5 rounded-full border border-fog px-3 py-1.5 text-xs font-medium text-slate-soft transition-colors hover:border-signal/40 hover:text-signal'
            }
          >
            <IconTrash width={13} height={13} />
            {clearing ? 'Clearing…' : confirmingClear ? 'Click to confirm' : 'Clear chat'}
          </button>
        )}
      </div>

      {!readOnly && notificationPermission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-fog bg-fog-soft/60 px-3.5 py-2.5 text-left text-xs text-slate transition-colors hover:border-signal/40"
        >
          <span>Get notified here when {otherPartyLabel} replies, even if you're on another page.</span>
          <span className="flex-shrink-0 font-medium text-signal">Enable</span>
        </button>
      )}

      <div ref={scrollRef} className="flex max-h-[50vh] min-h-[160px] flex-col gap-4 overflow-y-auto pr-1">
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

      {!readOnly && (
        <>
          <div className="min-h-[20px] pt-3">
            <AnimatePresence>
              {otherTyping && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs italic text-slate-soft"
                >
                  {otherPartyLabel} is typing…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {sendError && <p className="mb-2 text-xs text-signal">{sendError}</p>}

          <form onSubmit={handleSend} className="mt-2 flex items-center gap-2 border-t border-fog pt-4">
            <input
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
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
        </>
      )}
    </Card>
  )
}
