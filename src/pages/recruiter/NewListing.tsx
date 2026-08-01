import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useListings } from '../../context/ListingsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import type { EmploymentType } from '../../data/types'
import { employmentTypeLabels } from '../../data/mock'

const categories = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'Other']

const employmentTypes: EmploymentType[] = ['full_time', 'part_time', 'contract', 'internship']

export function NewListing() {
  const { currentUser } = useAuth()
  const { createListing } = useListings()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser?.companyId || !title.trim() || !description.trim() || !location.trim()) return

    setSubmitting(true)
    const created = await createListing({
      title: title.trim(),
      description: description.trim(),
      category,
      employmentType,
      location: location.trim(),
      companyId: currentUser.companyId,
      postedBy: currentUser.id,
      postedByName: currentUser.name,
      imageUrl: null,
    })
    navigate(`/recruiter/listings/${created.id}`)
  }

  const canSubmit = title.trim().length > 2 && description.trim().length > 0 && location.trim().length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Post a new job"
        subtitle="Fill in the role details — it'll go live for job seekers right away."
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Listings', to: '/recruiter/listings' }, { label: 'New' }]}
      />

      <Card className="p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-ink">
              Job title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Junior Frontend Developer"
              className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-sm font-medium text-ink">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-signal"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm font-medium text-ink">
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Cape Town"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
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
                  onClick={() => setEmploymentType(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    employmentType === t
                      ? 'border-ink bg-ink text-paper'
                      : 'border-fog bg-paper text-slate hover:border-signal/40'
                  }`}
                >
                  {employmentTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities, requirements, and anything a candidate should know before applying."
              rows={6}
              className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
          </div>

          <div className="flex items-center justify-between border-t border-fog pt-5">
            <span className="text-xs text-slate-soft">Job seekers will be able to apply as soon as this is posted.</span>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-shrink-0 rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-fog disabled:text-slate-soft"
            >
              Post listing
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
