import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { supabase } from '../../lib/supabase'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { formatDate } from '../../lib/status'
import { IconFile } from '../../components/icons'

export function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getListing, hasApplied, applyToListing } = useListings()
  const { getCompanyById } = useData()

  const [coverNote, setCoverNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listing = getListing(id ?? '')
  if (!listing) return <Navigate to="/job_seeker/listings" replace />

  const company = getCompanyById(listing.companyId)
  const alreadyApplied = currentUser ? hasApplied(listing.id, currentUser.id) : false

  async function handleApply(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !listing) return
    setSubmitting(true)
    setError(null)
    try {
      let resumeUrl: string | null = null
      if (file) {
        const path = `${currentUser.id}/${listing.id}-${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('application-documents').upload(path, file)
        if (uploadError) throw uploadError
        resumeUrl = supabase.storage.from('application-documents').getPublicUrl(path).data.publicUrl
      }
      const created = await applyToListing({
        listingId: listing.id,
        applicantId: currentUser.id,
        applicantName: currentUser.name,
        coverNote: coverNote.trim() || undefined,
        resumeUrl,
      })
      navigate(`/job_seeker/applications/${created.id}`, { state: { justApplied: true } })
    } catch {
      setError('Something went wrong submitting your application — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={listing.title}
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'Browse Jobs', to: '/job_seeker/listings' }, { label: listing.code }]}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-soft">
        <span>{company?.name}</span>
        <span>·</span>
        <span>{listing.location}</span>
        <span>·</span>
        <span>Posted {formatDate(listing.createdAt)}</span>
        <PriorityBadge employmentType={listing.employmentType} />
      </div>

      <Card className="mb-5 p-5">
        <h2 className="mb-2 font-display text-base font-medium text-ink">About this role</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{listing.description}</p>
      </Card>

      {listing.status === 'closed' ? (
        <Card className="p-5">
          <p className="text-sm text-slate-soft">This listing is no longer accepting applications.</p>
        </Card>
      ) : alreadyApplied ? (
        <Card className="p-5">
          <p className="text-sm text-slate-soft">You've already applied to this role — check your applications for status updates.</p>
        </Card>
      ) : (
        <Card className="p-5 sm:p-7">
          <h2 className="mb-4 font-display text-base font-medium text-ink">Apply for this role</h2>
          <form onSubmit={handleApply} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="coverNote" className="text-sm font-medium text-ink">
                Cover note (optional)
              </label>
              <textarea
                id="coverNote"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell them why you're a good fit for this role."
                rows={4}
                className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="resume" className="text-sm font-medium text-ink">
                Résumé / documents (optional)
              </label>
              <label
                htmlFor="resume"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-fog bg-paper px-3.5 py-3 text-sm text-slate-soft transition-colors hover:border-signal/40"
              >
                <IconFile width={16} height={16} />
                {file ? file.name : 'Attach a PDF, image, or document'}
              </label>
              <input
                id="resume"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && <p className="text-sm text-signal">{error}</p>}

            <div className="flex items-center justify-between border-t border-fog pt-5">
              <span className="text-xs text-slate-soft">The recruiter will be notified as soon as you apply.</span>
              <button
                type="submit"
                disabled={submitting}
                className="flex-shrink-0 rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-fog disabled:text-slate-soft"
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
