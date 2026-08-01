import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage, Role } from '../data/types'
import { useAuth } from './AuthContext'
import { useListings } from './ListingsContext'
import { useData } from './DataContext'

interface SendMessageInput {
  applicationId: string
  senderId: string
  senderRole: Role
  body: string
}

interface ChatContextValue {
  loading: boolean
  notificationPermission: NotificationPermission | 'unsupported'
  requestNotificationPermission: () => void
  getMessagesForApplication: (applicationId: string) => ChatMessage[]
  sendMessage: (input: SendMessageInput) => Promise<void>
  refetchApplicationMessages: (applicationId: string) => Promise<void>
  setActiveApplicationId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

type StoredMessage = ChatMessage & { applicationId: string }

function mapMessageRow(row: any, applicationId: string): StoredMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    body: row.body,
    timestamp: row.timestamp,
    applicationId,
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const { applications, getListing } = useListings()
  const { getUserById } = useData()

  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  // Refs so the realtime handlers below always see current data without
  // having to tear down and resubscribe the channel on every state change.
  const threadToApplicationRef = useRef<Map<string, string>>(new Map())
  const applicationToThreadRef = useRef<Map<string, string>>(new Map())
  const activeApplicationIdRef = useRef<string | null>(null)
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser
  const applicationsRef = useRef(applications)
  applicationsRef.current = applications

  const mergeMessages = useCallback((incoming: StoredMessage[]) => {
    if (incoming.length === 0) return
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id))
      const fresh = incoming.filter((m) => !known.has(m.id))
      return fresh.length === 0 ? prev : [...prev, ...fresh]
    })
  }, [])

  const refetch = useCallback(async () => {
    const [threadsRes, messagesRes] = await Promise.all([
      supabase.from('chat_threads').select('*'),
      supabase.from('chat_messages').select('*'),
    ])
    if (threadsRes.error) console.error('chat_threads fetch failed', threadsRes.error)
    if (messagesRes.error) console.error('chat_messages fetch failed', messagesRes.error)
    const threads = threadsRes.data ?? []
    const threadToApplication = new Map(threads.map((t: any) => [t.id, t.application_id]))
    const applicationToThread = new Map(threads.map((t: any) => [t.application_id, t.id]))
    threadToApplicationRef.current = threadToApplication
    applicationToThreadRef.current = applicationToThread
    setMessages((messagesRes.data ?? []).map((r: any) => mapMessageRow(r, threadToApplication.get(r.thread_id) ?? '')))
    setLoading(false)
  }, [])

  const notify = useCallback(
    (message: StoredMessage) => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      const me = currentUserRef.current
      if (!me || message.senderId === me.id) return
      // Don't interrupt someone actively looking at this exact conversation.
      if (document.visibilityState === 'visible' && activeApplicationIdRef.current === message.applicationId) return

      const application = applicationsRef.current.find((a) => a.id === message.applicationId)
      if (!application) return
      const listing = getListing(application.listingId)
      const isParticipant =
        (me.role === 'job_seeker' && application.applicantId === me.id) ||
        (me.role === 'recruiter' && listing?.postedBy === me.id)
      if (!isParticipant) return

      const sender = getUserById(message.senderId)
      new Notification(`New message from ${sender?.name ?? 'someone'}`, {
        body: message.body,
        tag: message.applicationId,
      })
    },
    [getListing, getUserById],
  )

  useEffect(() => {
    refetch()

    const channel = supabase
      .channel('chat-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, (payload) => {
        const row: any = payload.new ?? payload.old
        if (!row) return
        threadToApplicationRef.current.set(row.id, row.application_id)
        applicationToThreadRef.current.set(row.application_id, row.id)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const row: any = payload.new
        const applicationId = threadToApplicationRef.current.get(row.thread_id)
        if (!applicationId) {
          // Thread arrived out of order (rare) — fall back to a full refetch.
          refetch()
          return
        }
        const message = mapMessageRow(row, applicationId)
        mergeMessages([message])
        notify(message)
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('chat realtime channel failed to connect:', status)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch, notify, mergeMessages])

  const value = useMemo<ChatContextValue>(
    () => ({
      loading,
      notificationPermission,
      requestNotificationPermission: () => {
        if (typeof Notification === 'undefined') return
        Notification.requestPermission().then(setNotificationPermission)
      },
      getMessagesForApplication: (applicationId) =>
        messages.filter((m) => m.applicationId === applicationId).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
      sendMessage: async (input) => {
        let threadId = applicationToThreadRef.current.get(input.applicationId)
        if (!threadId) {
          threadId = `th-${crypto.randomUUID()}`
          const { error: threadError } = await supabase
            .from('chat_threads')
            .insert({ id: threadId, application_id: input.applicationId, created_at: new Date().toISOString() })
          if (threadError) throw threadError
          threadToApplicationRef.current.set(threadId, input.applicationId)
          applicationToThreadRef.current.set(input.applicationId, threadId)
        }

        const row = {
          id: `cm-${crypto.randomUUID()}`,
          thread_id: threadId,
          sender_id: input.senderId,
          sender_role: input.senderRole,
          body: input.body,
          timestamp: new Date().toISOString(),
        }
        const { error } = await supabase.from('chat_messages').insert(row)
        if (error) throw error

        // Apply locally right away rather than waiting on the realtime
        // round-trip — the sender should never need to refresh to see
        // their own message land.
        mergeMessages([mapMessageRow(row, input.applicationId)])
      },
      refetchApplicationMessages: async (applicationId) => {
        const threadId = applicationToThreadRef.current.get(applicationId)
        if (!threadId) return
        const { data, error } = await supabase.from('chat_messages').select('*').eq('thread_id', threadId)
        if (error) {
          console.error('chat_messages poll failed', error)
          return
        }
        mergeMessages((data ?? []).map((r: any) => mapMessageRow(r, applicationId)))
      },
      setActiveApplicationId: (id) => {
        activeApplicationIdRef.current = id
      },
    }),
    [loading, messages, notificationPermission, mergeMessages],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
