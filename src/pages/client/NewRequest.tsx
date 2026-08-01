import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import type { RequestPriority } from '../../data/types'

const categories = [
  'Backend & Data',
  'UI/UX',
  'Bug Fix',
  'Documentation',
  'UX / Navigation',
  'Feature Request',
  'Other',
]

const priorities: { value: RequestPriority; label: string; hint: string }[] = [
  { value: 'low', label: 'Low', hint: 'No rush — a few weeks is fine' },
  { value: 'standard', label: 'Standard', hint: 'Typical turnaround, a few days' },
  { value: 'high', label: 'High', hint: 'Needs attention this week' },
  { value: 'urgent', label: 'Urgent', hint: 'Blocking something today' },
]

export function NewRequest() {
  const { currentUser } = useAuth()
  const { addRequest } = useRequests()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [priority, setPriority] = useState<RequestPriority>('standard')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser?.clientOrgId || !title.trim() || !description.trim()) return

    setSubmitting(true)
    const created = await addRequest({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      clientOrgId: currentUser.clientOrgId,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
    })
    navigate(`/client/requests/${created.id}`, { state: { justSubmitted: true } })
  }

  const canSubmit = title.trim().length > 2 && description.trim().length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Submit a new request"
        subtitle="Tell us what you need — a WIL-Ops associate will pick it up shortly."
        crumbs={[{ label: 'Dashboard', to: '/client' }, { label: 'My Requests', to: '/client/requests' }, { label: 'New' }]}
      />

      <Card className="p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-ink">
              What do you need?
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix crash on the analytics screen"
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
              <span className="text-sm font-medium text-ink">Priority</span>
              <div className="flex flex-wrap gap-1.5">
                {priorities.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    title={p.hint}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      priority === p.value
                        ? 'border-ink bg-ink text-paper'
                        : 'border-fog bg-paper text-slate hover:border-signal/40'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-ink">
              Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give us the context we'll need — locations, deadlines, who's involved, anything you'd tell us in person."
              rows={5}
              className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
          </div>

          <div className="flex items-center justify-between border-t border-fog pt-5">
            <span className="text-xs text-slate-soft">
              {canSubmit
                ? "You'll be notified here as soon as someone picks this up."
                : 'Add a short title and some detail to submit.'}
            </span>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-shrink-0 rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-fog disabled:text-slate-soft"
            >
              Submit request
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
