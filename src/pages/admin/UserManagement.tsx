import { useState, type FormEvent } from 'react'
import clsx from 'clsx'
import { useData } from '../../context/DataContext'
import type { Role } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { IconPlus } from '../../components/icons'
import { formatDate } from '../../lib/status'

const roleLabel: Record<Role, string> = { admin: 'Admin', staff: 'Staff', client: 'Client' }
const palette = ['#D9642C', '#3F6B54', '#3D4552']

export function UserManagement() {
  const { users: userList, getClientOrgById, createUser, toggleUserActive } = useData()
  const [showForm, setShowForm] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<Role>('staff')

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
    setRole('staff')
    setShowForm(false)
  }

  function toggleActive(id: string) {
    toggleUserActive(id)
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Invite teammates and manage access across WIL-Ops."
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
                placeholder="ravi.patel@wil-ops.com"
                className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-signal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Operations Associate"
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
                <option value="staff">Staff</option>
                <option value="client">Client</option>
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
        {(['all', 'admin', 'staff', 'client'] as const).map((r) => (
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

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try a different role filter." />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-fog px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-soft md:grid">
            <span>Name</span>
            <span>Role</span>
            <span>Client account</span>
            <span>Last active</span>
            <span className="text-right">Status</span>
          </div>
          <div className="flex flex-col divide-y divide-fog">
            {filtered.map((u) => (
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
                  {u.clientOrgId ? getClientOrgById(u.clientOrgId)?.name : '—'}
                </span>
                <span className="font-mono text-xs text-slate-soft">{formatDate(u.lastActive)}</span>
                <div className="flex items-center gap-3 md:justify-end">
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium',
                      u.active ? 'bg-pine-soft text-pine' : 'bg-fog-soft text-slate-soft',
                    )}
                  >
                    {u.active ? 'Active' : 'Deactivated'}
                  </span>
                  <button
                    onClick={() => toggleActive(u.id)}
                    className="text-xs font-medium text-signal transition-colors hover:text-signal/70"
                  >
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
