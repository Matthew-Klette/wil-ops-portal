import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { ApplicationRow } from '../../components/listings/ApplicationRow'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../lib/status'
import { IconEdit, IconTrash } from '../../components/icons'
import type { EmploymentType } from '../../data/types'
import { employmentTypeLabels } from '../../data/mock'

const categories = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'Other']
const employmentTypes: EmploymentType[] = ['full_time', 'part_time', 'contract', 'internship']

export function ListingApplicants() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getListing, getApplicationsForListing, updateListingStatus, updateListingDetails, deleteListing } = useListings()
  const { getCompanyById, getUserById } = useData()
  const basePath = currentUser?.role === 'admin' ? '/admin' : '/recruiter'

  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftLocation, setDraftLocation] = useState('')
  const [draftEmploymentType, setDraftEmploymentType] = useState<EmploymentType>('full_time')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const listing = getListing(id ?? '')
  if (!listing) return <Navigate to={`${basePath}/listings`} replace />

  const company = getCompanyById(listing.companyId)
  const applications = [...getApplicationsForListing(listing.id)].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  function startEditing() {
    setDraftTitle(listing!.title)
    setDraftDescription(listing!.description)
    setDraftCategory(listing!.category)
    setDraftLocation(listing!.location)
    setDraftEmploymentType(listing!.employmentType)
    setEditing(true)
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!draftTitle.trim() || !draftDescription.trim() || !draftLocation.trim()) return
    updateListingDetails(listing!.id, {
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      category: draftCategory,
      location: draftLocation.trim(),
      employmentType: draftEmploymentType,
    })
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setDeleting(true)
    try {
      await deleteListing(listing!.id)
      navigate(`${basePath}/listings`)
    } catch (err) {
      console.error('Failed to delete listing', err)
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={editing ? 'Edit listing' : listing.title}
        crumbs={[{ label: 'Dashboard', to: basePath }, { label: 'Listings', to: `${basePath}/listings` }, { label: listing.code }]}
        actions={
          !editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
              >
                <IconEdit width={14} height={14} />
                Edit
              </button>
              <button
                onClick={() => updateListingStatus(listing.id, listing.status === 'open' ? 'closed' : 'open')}
                className="rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
              >
                {listing.status === 'open' ? 'Close listing' : 'Reopen listing'}
              </button>
              <button
                onClick={handleDelete}
                onBlur={() => setConfirmingDelete(false)}
                disabled={deleting}
                className={
                  confirmingDelete
                    ? 'flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-signal/90'
                    : 'flex items-center gap-1.5 rounded-full border border-fog px-4 py-2 text-sm font-medium text-slate-soft transition-colors hover:border-signal/40 hover:text-signal'
                }
              >
                <IconTrash width={14} height={14} />
                {deleting ? 'Deleting…' : confirmingDelete ? 'Confirm delete' : 'Delete'}
              </button>
            </div>
          )
        }
      />

      {editing ? (
        <Card className="mb-6 p-5 sm:p-7">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Job title</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-signal"
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Category</label>
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-signal"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Location</label>
                <input
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-signal"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Employment type</span>
              <div className="flex flex-wrap gap-1.5">
                {employmentTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setDraftEmploymentType(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      draftEmploymentType === t ? 'border-ink bg-ink text-paper' : 'border-fog bg-paper text-slate hover:border-signal/40'
                    }`}
                  >
                    {employmentTypeLabels[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Description</label>
              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                rows={6}
                className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-signal"
              />
            </div>
            <div className="flex items-center gap-2 border-t border-fog pt-5">
              <button
                type="submit"
                className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-soft transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-soft">
            <span>{company?.name}</span>
            <span>·</span>
            <span>{listing.location}</span>
            <span>·</span>
            <span>Posted {formatDate(listing.createdAt)}</span>
            <PriorityBadge employmentType={listing.employmentType} />
          </div>

          <Card className="mb-6 p-5">
            <h2 className="mb-2 font-display text-base font-medium text-ink">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate">{listing.description}</p>
          </Card>
        </>
      )}

      {!editing && (
        <>
          <h2 className="mb-3 font-display text-lg font-medium text-ink">Applicants ({applications.length})</h2>
          {applications.length === 0 ? (
            <EmptyState title="No applicants yet" description="Applications will show up here as job seekers apply." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {applications.map((a) => {
                const applicant = getUserById(a.applicantId)
                return (
                  <ApplicationRow
                    key={a.id}
                    application={a}
                    to={`${basePath}/applications/${a.id}`}
                    primaryLabel={applicant?.name ?? 'Applicant'}
                    primaryColor={applicant?.initialColor ?? '#3D4552'}
                    meta={applicant?.headline}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
