import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Application, ApplicationStatus, ApplicationStatusEvent, EmploymentType, JobListing, ListingStatus, Role } from '../data/types'
import { applicationStatusLabels } from '../data/mock'
import { useData } from './DataContext'

interface NewListingInput {
  title: string
  description: string
  category: string
  employmentType: EmploymentType
  location: string
  companyId: string
  postedBy: string
  postedByName: string
  imageUrl: string | null
}

interface NewApplicationInput {
  listingId: string
  applicantId: string
  applicantName: string
  coverNote?: string
  resumeUrl: string | null
}

interface ListingsContextValue {
  loading: boolean
  listings: JobListing[]
  applications: Application[]
  getListing: (id: string) => JobListing | undefined
  getApplicationsForListing: (listingId: string) => Application[]
  getApplicationsForApplicant: (applicantId: string) => Application[]
  getApplicationById: (id: string) => Application | undefined
  hasApplied: (listingId: string, applicantId: string) => boolean
  createListing: (input: NewListingInput) => Promise<JobListing>
  updateListingStatus: (listingId: string, status: ListingStatus) => Promise<void>
  updateListingDetails: (
    listingId: string,
    updates: { title: string; description: string; category: string; employmentType: EmploymentType; location: string },
  ) => Promise<void>
  deleteListing: (listingId: string) => Promise<void>
  applyToListing: (input: NewApplicationInput) => Promise<Application>
  setApplicationStatus: (applicationId: string, status: ApplicationStatus, actor: string, actorRole: Role, note?: string) => Promise<void>
  updateApplicationDetails: (applicationId: string, updates: { coverNote?: string; resumeUrl: string | null }) => Promise<void>
  deleteApplication: (applicationId: string) => Promise<void>
}

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined)

function mapListing(row: any): JobListing {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    category: row.category,
    employmentType: row.employment_type,
    location: row.location,
    companyId: row.company_id,
    postedBy: row.posted_by,
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapApplication(row: any, events: any[]): Application {
  return {
    id: row.id,
    listingId: row.listing_id,
    applicantId: row.applicant_id,
    status: row.status,
    coverNote: row.cover_note ?? undefined,
    resumeUrl: row.resume_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    statusHistory: events
      .filter((e) => e.application_id === row.id)
      .map(
        (e): ApplicationStatusEvent => ({ id: e.id, status: e.status, timestamp: e.timestamp, actor: e.actor, note: e.note ?? undefined }),
      )
      .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1)),
  }
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  const { logActivity } = useData()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<JobListing[]>([])
  const [applications, setApplications] = useState<Application[]>([])

  const refetch = useCallback(async () => {
    const [listingsRes, applicationsRes, eventsRes] = await Promise.all([
      supabase.from('job_listings').select('*'),
      supabase.from('applications').select('*'),
      supabase.from('application_status_events').select('*'),
    ])
    const events = eventsRes.data ?? []
    setListings((listingsRes.data ?? []).map(mapListing))
    setApplications((applicationsRes.data ?? []).map((r) => mapApplication(r, events)))
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()

    const channel = supabase
      .channel('listings-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_listings' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'application_status_events' }, () => refetch())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  const value = useMemo<ListingsContextValue>(
    () => ({
      loading,
      listings,
      applications,
      getListing: (id) => listings.find((l) => l.id === id),
      getApplicationsForListing: (listingId) => applications.filter((a) => a.listingId === listingId),
      getApplicationsForApplicant: (applicantId) => applications.filter((a) => a.applicantId === applicantId),
      getApplicationById: (id) => applications.find((a) => a.id === id),
      hasApplied: (listingId, applicantId) =>
        applications.some((a) => a.listingId === listingId && a.applicantId === applicantId && a.status !== 'withdrawn'),
      createListing: async (input) => {
        const id = `jl-${crypto.randomUUID()}`
        const code = `JL-${Math.floor(1000 + Math.random() * 9000)}`
        const now = new Date().toISOString()

        await supabase.from('job_listings').insert({
          id,
          code,
          title: input.title,
          description: input.description,
          category: input.category,
          employment_type: input.employmentType,
          location: input.location,
          company_id: input.companyId,
          posted_by: input.postedBy,
          image_url: input.imageUrl,
          status: 'open',
          created_at: now,
          updated_at: now,
        })
        await logActivity({
          actor: input.postedByName,
          actorRole: 'recruiter',
          action: 'posted new listing',
          target: `${code} · ${input.title}`,
          timestamp: now,
        })

        const newListing: JobListing = {
          id,
          code,
          title: input.title,
          description: input.description,
          category: input.category,
          employmentType: input.employmentType,
          location: input.location,
          companyId: input.companyId,
          postedBy: input.postedBy,
          imageUrl: input.imageUrl,
          status: 'open',
          createdAt: now,
          updatedAt: now,
        }
        setListings((prev) => [newListing, ...prev])
        return newListing
      },
      updateListingStatus: async (listingId, status) => {
        await supabase.from('job_listings').update({ status, updated_at: new Date().toISOString() }).eq('id', listingId)
      },
      updateListingDetails: async (listingId, updates) => {
        await supabase
          .from('job_listings')
          .update({
            title: updates.title,
            description: updates.description,
            category: updates.category,
            employment_type: updates.employmentType,
            location: updates.location,
            updated_at: new Date().toISOString(),
          })
          .eq('id', listingId)
      },
      deleteListing: async (listingId) => {
        const listing = listings.find((l) => l.id === listingId)
        const { error } = await supabase.from('job_listings').delete().eq('id', listingId)
        if (error) throw error
        if (listing) {
          await logActivity({
            actor: 'Recruiter',
            actorRole: 'recruiter',
            action: 'deleted listing',
            target: `${listing.code} · ${listing.title}`,
            timestamp: new Date().toISOString(),
          })
        }
      },
      applyToListing: async (input) => {
        const id = `app-${crypto.randomUUID()}`
        const now = new Date().toISOString()
        const listing = listings.find((l) => l.id === input.listingId)

        await supabase.from('applications').insert({
          id,
          listing_id: input.listingId,
          applicant_id: input.applicantId,
          status: 'submitted',
          cover_note: input.coverNote ?? null,
          resume_url: input.resumeUrl,
          created_at: now,
          updated_at: now,
        })
        await supabase.from('application_status_events').insert({
          id: `ase-${crypto.randomUUID()}`,
          application_id: id,
          status: 'submitted',
          timestamp: now,
          actor: input.applicantName,
        })
        await supabase.from('chat_threads').insert({ id: `th-${crypto.randomUUID()}`, application_id: id, created_at: now })
        await logActivity({
          actor: input.applicantName,
          actorRole: 'job_seeker',
          action: 'applied to',
          target: listing ? `${listing.code} · ${listing.title}` : input.listingId,
          timestamp: now,
        })

        const newApplication: Application = {
          id,
          listingId: input.listingId,
          applicantId: input.applicantId,
          status: 'submitted',
          coverNote: input.coverNote,
          resumeUrl: input.resumeUrl,
          createdAt: now,
          updatedAt: now,
          statusHistory: [{ id: `ase-${id}-1`, status: 'submitted', timestamp: now, actor: input.applicantName }],
        }
        setApplications((prev) => [newApplication, ...prev])
        return newApplication
      },
      setApplicationStatus: async (applicationId, status, actor, actorRole, note) => {
        const application = applications.find((a) => a.id === applicationId)
        const listing = application ? listings.find((l) => l.id === application.listingId) : undefined
        const now = new Date().toISOString()
        await supabase.from('applications').update({ status, updated_at: now }).eq('id', applicationId)
        await supabase.from('application_status_events').insert({
          id: `ase-${crypto.randomUUID()}`,
          application_id: applicationId,
          status,
          timestamp: now,
          actor,
          note: note ?? null,
        })
        await logActivity({
          actor,
          actorRole,
          action: `moved application to ${applicationStatusLabels[status]}`,
          target: listing ? `${listing.code} · ${listing.title}` : applicationId,
          timestamp: now,
        })
      },
      updateApplicationDetails: async (applicationId, updates) => {
        await supabase
          .from('applications')
          .update({ cover_note: updates.coverNote ?? null, resume_url: updates.resumeUrl, updated_at: new Date().toISOString() })
          .eq('id', applicationId)
      },
      deleteApplication: async (applicationId) => {
        const { error } = await supabase.from('applications').delete().eq('id', applicationId)
        if (error) throw error
        setApplications((prev) => prev.filter((a) => a.id !== applicationId))
      },
    }),
    [loading, listings, applications, logActivity],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
