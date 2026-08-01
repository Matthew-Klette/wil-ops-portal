import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage, Role } from '../data/types'

interface SendMessageInput {
  applicationId: string
  senderId: string
  senderRole: Role
  body: string
}

interface ChatContextValue {
  loading: boolean
  getMessagesForApplication: (applicationId: string) => ChatMessage[]
  sendMessage: (input: SendMessageInput) => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function mapMessage(row: any, threadToApplication: Map<string, string>): ChatMessage & { applicationId: string } {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    body: row.body,
    timestamp: row.timestamp,
    applicationId: threadToApplication.get(row.thread_id) ?? '',
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<(ChatMessage & { applicationId: string })[]>([])
  const [threadByApplication, setThreadByApplication] = useState<Map<string, string>>(new Map())

  const refetch = useCallback(async () => {
    const [threadsRes, messagesRes] = await Promise.all([
      supabase.from('chat_threads').select('*'),
      supabase.from('chat_messages').select('*'),
    ])
    const threads = threadsRes.data ?? []
    const threadToApplication = new Map(threads.map((t: any) => [t.id, t.application_id]))
    const applicationToThread = new Map(threads.map((t: any) => [t.application_id, t.id]))
    setThreadByApplication(applicationToThread)
    setMessages((messagesRes.data ?? []).map((r) => mapMessage(r, threadToApplication)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()

    const channel = supabase
      .channel('chat-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_threads' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => refetch())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  const value = useMemo<ChatContextValue>(
    () => ({
      loading,
      getMessagesForApplication: (applicationId) =>
        messages.filter((m) => m.applicationId === applicationId).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
      sendMessage: async (input) => {
        let threadId = threadByApplication.get(input.applicationId)
        if (!threadId) {
          threadId = `th-${crypto.randomUUID()}`
          await supabase.from('chat_threads').insert({ id: threadId, application_id: input.applicationId, created_at: new Date().toISOString() })
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
    }),
    [loading, messages, threadByApplication],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
