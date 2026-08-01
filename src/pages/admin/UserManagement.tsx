import { useState, type FormEvent } from 'react'
import clsx from 'clsx'
import { useData } from '../../context/DataContext'
import type { Role } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconEdit, IconPlus, IconTrash } from '../../components/icons'
import { formatDate } from '../../lib/status'

const roleLabel: Record<Role, string> = { admin: 'Admin', recruiter: 'Recruiter', job_seeker: 'Job Seeker' }
const palette = ['#D9642C', '#3F6B54', '#3D4552']

export function UserManagement() {
  const { users: userList, companies, getCompanyById, createUser, updateUser, toggleUserActive, deleteUser } = useData()
  const [showForm, setShowForm] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<Role>('recruiter')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftRole, setDraftRole] = useState<Role>('recruiter')
  const [draftCompanyId, setDraftCompanyId] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = roleFilter === 'all' ? userList : userList.filter((u) => u.role === roleFilter)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    await createUser({
      name: name.trim(),
      email: email.trim(),
      role,
      title: title.trim() || roleLabel[role],
      initialColor: palette[userList.length % palette.length],
    })
    setName('')
    setEmail('')
    setTitle('')
    setRole('recruiter')
    setShowForm(false)
  }

  function startEditing(id: string) {
    const u = userList.find((x) => x.id === id)
    if (!u) return
    setDraftName(u.name)
    setDraftEmail(u.email)
    setDraftTitle(u.title)
    setDraftRole(u.role)
    setDraftCompanyId(u.companyId ?? '')
    setEditingId(id)
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingId || !draftName.trim() || !draftEmail.trim()) return
    await updateUser(editingId, {
      name: draftName.trim(),
      email: draftEmail.trim(),
      title: draftTitle.trim() || roleLabel[draftRole],
      role: draftRole,
      companyId: draftRole === 'recruiter' && draftCompanyId ? draftCompanyId : undefined,
    })
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      setDeleteError(null)
      return
    }
    try {
      await deleteUser(id)
      setConfirmDeleteId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete user.')
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Invite teammates and manage access across the platform."
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'User Management' }]}
        actions={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            <IconPlus width={16} height={16} />
            New user
          </button>
        }
      />

      {showForm && (
        <Card className="mb-5 p-5">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Patel"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi.patel@example.com"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Talent Recruiter"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              >
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="job_seeker">Job Seeker</option>
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal"
              >
                Create user
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

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'admin', 'recruiter', 'job_seeker'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={clsx(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              roleFilter === r ? 'border-ink bg-ink text-paper' : 'border-fog bg-paper-raised text-slate hover:border-signal/40',
            )}
          >
            {r === 'all' ? 'All' : roleLabel[r]}
          </button>
        ))}
      </div>

      {deleteError && <p className="mb-4 text-sm text-signal">{deleteError}</p>}

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try a different role filter." />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-fog px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-soft md:grid">
            <span>Name</span>
            <span>Role</span>
            <span>Company</span>
            <span>Last active</span>
            <span className="text-right">Status</span>
          </div>
          <div className="flex flex-col divide-y divide-fog">
            {filtered.map((u) =>
              editingId === u.id ? (
                <form key={u.id} onSubmit={handleSaveEdit} className="flex flex-col gap-3 px-5 py-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Name"
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    />
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      placeholder="Email"
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    />
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="Title"
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    />
                    <select
                      value={draftRole}
                      onChange={(e) => setDraftRole(e.target.value as Role)}
                      className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal"
                    >
                      <option value="admin">Admin</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="job_seeker">Job Seeker</option>
                    </select>
                    {draftRole === 'recruiter' && (
                      <select
                        value={draftCompanyId}
                        onChange={(e) => setDraftCompanyId(e.target.value)}
                        className="rounded-lg border border-fog bg-paper px-3.5 py-2 text-sm outline-none focus:border-signal sm:col-span-2"
                      >
                        <option value="">No company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
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
                <div
                  key={u.id}
                  className="flex flex-col gap-3 px-5 py-4 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.initialColor} size={34} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{u.name}</span>
                      <span className="text-xs text-slate-soft">{u.title}</span>
                    </div>
                  </div>
                  <span className="text-sm text-slate">{roleLabel[u.role]}</span>
                  <span className="text-sm text-slate-soft">
                    {u.companyId ? getCompanyById(u.companyId)?.name : '—'}
                  </span>
                  <span className="font-mono text-xs text-slate-soft">{formatDate(u.lastActive)}</span>
                  <div className="flex items-center gap-2 md:justify-end">
                    <span
                      className={clsx(
                        'rounded-full px-2.5 py-1 text-[11px] font-medium',
                        u.active ? 'bg-pine-soft text-pine' : 'bg-fog-soft text-slate-soft',
                      )}
                    >
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className="text-xs font-medium text-signal transition-colors hover:text-signal/70"
                    >
                      {u.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => startEditing(u.id)}
                      aria-label={`Edit ${u.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-soft transition-colors hover:bg-fog-soft hover:text-signal"
                    >
                      <IconEdit width={14} height={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      onBlur={() => setConfirmDeleteId(null)}
                      aria-label={`Delete ${u.name}`}
                      className={clsx(
                        'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                        confirmDeleteId === u.id ? 'bg-signal text-paper' : 'text-slate-soft hover:bg-fog-soft hover:text-signal',
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
