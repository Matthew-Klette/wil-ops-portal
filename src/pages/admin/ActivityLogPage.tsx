import { useState } from 'react'
import clsx from 'clsx'
import { useData } from '../../context/DataContext'
import type { Role } from '../../data/types'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDateTime } from '../../lib/status'

const roleLabel: Record<Role, string> = { admin: 'Admin', recruiter: 'Recruiter', job_seeker: 'Job Seeker' }

export function ActivityLogPage() {
  const { activityLog, users } = useData()
  const [filter, setFilter] = useState<'all' | Role>('all')

  const sorted = [...activityLog].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  const filtered = filter === 'all' ? sorted : sorted.filter((e) => e.actorRole === filter)

  return (
    <div>
      <PageHeader
        title="Activity Log"
        subtitle="A running record of what's happened across the portal."
        crumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Activity Log' }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'admin', 'recruiter', 'job_seeker'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={clsx(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === r ? 'border-ink bg-ink text-paper' : 'border-fog bg-paper-raised text-slate hover:border-signal/40',
            )}
          >
            {r === 'all' ? 'All activity' : roleLabel[r]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No activity" description="Nothing recorded for this filter yet." />
      ) : (
        <Card className="p-5">
          <div className="flex flex-col divide-y divide-fog">
            {filtered.map((entry) => {
              const actor = users.find((u) => u.name === entry.actor)
              return (
                <div key={entry.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                  <Avatar name={entry.actor} color={actor?.initialColor ?? '#3D4552'} size={30} />
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{entry.actor}</span>{' '}
                      <span className="text-slate-soft">({roleLabel[entry.actorRole]})</span> {entry.action}{' '}
                      <span className="text-slate">{entry.target}</span>
                    </p>
                    <span className="font-mono text-[11px] text-slate-soft">{formatDateTime(entry.timestamp)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
