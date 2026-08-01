import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Message, RequestPriority, RequestStatus, StatusEvent, WorkRequest } from '../data/types'
import { statusLabels } from '../data/mock'
import { useData } from './DataContext'

interface NewRequestInput {
  title: string
  description: string
  category: string
  priority: RequestPriority
  clientOrgId: string
  requestedBy: string
  requestedByName: string
}

interface RequestsContextValue {
  loading: boolean
  requests: WorkRequest[]
  getRequest: (id: string) => WorkRequest | undefined
  addRequest: (input: NewRequestInput) => Promise<WorkRequest>
  setStatus: (requestId: string, status: RequestStatus, actor: string, note?: string) => Promise<void>
  addMessage: (requestId: string, message: Omit<Message, 'id'>) => Promise<void>
  assignRequest: (requestId: string, staffUserId: string) => Promise<void>
  updateRequestDetails: (requestId: string, updates: { title: string; description: string }) => Promise<void>
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined)

function mapRequest(row: any, events: any[], messages: any[]): WorkRequest {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    category: row.category,
    clientOrgId: row.client_org_id,
    requestedBy: row.requested_by,
    assignedTo: row.assigned_to,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    statusHistory: events
      .filter((e) => e.request_id === row.id)
      .map(
        (e): StatusEvent => ({ id: e.id, status: e.status, timestamp: e.timestamp, actor: e.actor, note: e.note ?? undefined }),
      )
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
    messages: messages
      .filter((m) => m.request_id === row.id)
      .map((m): Message => ({ id: m.id, author: m.author, authorRole: m.author_role, body: m.body, timestamp: m.timestamp }))
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
  }
}

export function RequestsProvider({ children }: { children: ReactNode }) {
  const { logActivity } = useData()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<WorkRequest[]>([])

  const refetch = useCallback(async () => {
    const [reqRes, eventsRes, messagesRes] = await Promise.all([
      supabase.from('work_requests').select('*'),
      supabase.from('status_events').select('*'),
      supabase.from('messages').select('*'),
    ])
    const rows = reqRes.data ?? []
    const events = eventsRes.data ?? []
    const messages = messagesRes.data ?? []
    setRequests(rows.map((r) => mapRequest(r, events, messages)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()

    const channel = supabase
      .channel('requests-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_requests' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_events' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refetch())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  const value = useMemo<RequestsContextValue>(
    () => ({
      loading,
      requests,
      getRequest: (id) => requests.find((r) => r.id === id),
      addRequest: async (input) => {
        const id = `req-${crypto.randomUUID()}`
        const code = `WO-${Math.floor(1000 + Math.random() * 9000)}`
        const now = new Date().toISOString()

        await supabase.from('work_requests').insert({
          id,
          code,
          title: input.title,
          description: input.description,
          category: input.category,
          client_org_id: input.clientOrgId,
          requested_by: input.requestedBy,
          assigned_to: null,
          priority: input.priority,
          status: 'submitted',
          created_at: now,
          updated_at: now,
        })
        await supabase.from('status_events').insert({
          id: `se-${crypto.randomUUID()}`,
          request_id: id,
          status: 'submitted',
          timestamp: now,
          actor: input.requestedByName,
        })
        await logActivity({
          actor: input.requestedByName,
          actorRole: 'client',
          action: 'submitted new request',
          target: `${code} · ${input.title}`,
          timestamp: now,
        })

        const newRequest: WorkRequest = {
          id,
          code,
          title: input.title,
          description: input.description,
          category: input.category,
          clientOrgId: input.clientOrgId,
          requestedBy: input.requestedBy,
          assignedTo: null,
          priority: input.priority,
          status: 'submitted',
          createdAt: now,
          updatedAt: now,
          statusHistory: [{ id: `se-${id}-1`, status: 'submitted', timestamp: now, actor: input.requestedByName }],
          messages: [],
        }
        setRequests((prev) => [newRequest, ...prev])
        return newRequest
      },
      setStatus: async (requestId, status, actor, note) => {
        const request = requests.find((r) => r.id === requestId)
        const now = new Date().toISOString()
        await supabase.from('work_requests').update({ status, updated_at: now }).eq('id', requestId)
        await supabase.from('status_events').insert({
          id: `se-${crypto.randomUUID()}`,
          request_id: requestId,
          status,
          timestamp: now,
          actor,
          note: note ?? null,
        })
        if (request) {
          await logActivity({
            actor,
            actorRole: 'staff',
            action: `moved to ${statusLabels[status]}`,
            target: `${request.code} · ${request.title}`,
            timestamp: now,
          })
        }
      },
      addMessage: async (requestId, message) => {
        await supabase.from('messages').insert({
          id: `m-${crypto.randomUUID()}`,
          request_id: requestId,
          author: message.author,
          author_role: message.authorRole,
          body: message.body,
          timestamp: message.timestamp,
        })
      },
      assignRequest: async (requestId, staffUserId) => {
        await supabase.from('work_requests').update({ assigned_to: staffUserId, updated_at: new Date().toISOString() }).eq('id', requestId)
      },
      updateRequestDetails: async (requestId, updates) => {
        await supabase
          .from('work_requests')
          .update({ title: updates.title, description: updates.description, updated_at: new Date().toISOString() })
          .eq('id', requestId)
      },
    }),
    [loading, requests, logActivity],
  )

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>
}

export function useRequests() {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider')
  return ctx
}
