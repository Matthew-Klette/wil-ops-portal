import { useState, type FormEvent } from 'react'
import clsx from 'clsx'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'

export function Companies() {
  const { companies, createCompany, updateCompany, deleteCompany } = useData()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftIndustry, setDraftIndustry] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !industry.trim()) return
    await createCompany({ name: name.trim(), industry: industry.trim(), since: new Date().toISOString().slice(0, 10) })
    setName('')
    setIndustry('')
    setShowForm(false)
  }

  function startEditing(id: string) {
    const c = companies.find((x) => x.id === id)
    if (!c) return
    setDraftName(c.name)
    setDraftIndustry(c.industry)
    setEditingId(id)
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    const company = companies.find((c) => c.id === editingId)
    if (!company || !draftName.trim() || !draftIndustry.trim()) return
    await updateCompany(editingId, { name: draftName.trim(), industry: draftIndustry.trim(), since: company.since })
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      setDeleteError(null)
      return
    }
    try {
      await deleteCompany(id)
      setConfirmDeleteId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete company.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="Every company recruiters post listings on behalf of."
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Companies' }]}
        actions={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            <IconPlus width={16} height={16} />
            New company
          </button>
        }
      />

      {showForm && (
        <Card className="mb-5 p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Company name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emeris"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Industry</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Personal Finance App (Fintech)"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal"
              >
                Create company
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-soft transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {deleteError && <p className="mb-4 text-sm text-signal">{deleteError}</p>}

      {companies.length === 0 ? (
        <EmptyState title="No companies yet" description="Create one so recruiters have somewhere to post listings from." />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col divide-y divide-fog">
            {companies.map((c) =>
              editingId === c.id ? (
                <form key={c.id} onSubmit={handleSaveEdit} className="flex flex-col gap-3 px-5 py-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Company name"
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    />
                    <input
                      value={draftIndustry}
                      onChange={(e) => setDraftIndustry(e.target.value)}
                      placeholder="Industry"
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-full bg-signal px-4 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-signal/90"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-soft transition-colors hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                    <span className="text-xs text-slate-soft">
                      {c.industry} · client since {new Date(c.since).getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(c.id)}
                      aria-label={`Edit ${c.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-soft transition-colors hover:bg-fog-soft hover:text-signal"
                    >
                      <IconEdit width={14} height={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      onBlur={() => setConfirmDeleteId(null)}
                      aria-label={`Delete ${c.name}`}
                      className={clsx(
                        'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                        confirmDeleteId === c.id ? 'bg-signal text-paper' : 'text-slate-soft hover:bg-fog-soft hover:text-signal',
                      )}
                    >
                      <IconTrash width={14} height={14} />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
