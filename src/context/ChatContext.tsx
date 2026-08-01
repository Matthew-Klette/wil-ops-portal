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

  const refetch = useCallback(async () => {
    const [threadsRes, messagesRes] = await Promise.all([
      supabase.from('chat_threads').select('*'),
      supabase.from('chat_messages').select('*'),
    ])
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
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
        notify(message)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch, notify])

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
          await supabase.from('chat_threads').insert({ id: threadId, application_id: input.applicationId, created_at: new Date().toISOString() })
          threadToApplicationRef.current.set(threadId, input.applicationId)
          applicationToThreadRef.current.set(input.applicationId, threadId)
        }
        await supabase.from('chat_messages').insert({
          id: `cm-${crypto.randomUUID()}`,
          thread_id: threadId,
          sender_id: input.senderId,
          sender_role: input.senderRole,
          body: input.body,
          timestamp: new Date().toISOString(),
        })
      },
      setActiveApplicationId: (id) => {
        activeApplicationIdRef.current = id
      },
    }),
    [loading, messages, notificationPermission],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
