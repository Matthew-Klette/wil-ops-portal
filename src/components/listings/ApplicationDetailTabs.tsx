import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { PageHeader, type Crumb } from '../ui/PageHeader'
import { StatusBadge } from '../ui/StatusBadge'
import { WaitingOn } from '../ui/WaitingOn'
import type { ApplicationStatus } from '../../data/types'

export function ApplicationDetailTabs({
  title,
  crumbs,
  status,
  baseUrl,
  messageCount,
}: {
  title: string
  crumbs: Crumb[]
  status: ApplicationStatus
  baseUrl: string
  messageCount: number
}) {
  return (
    <div>
      <PageHeader
        title={title}
        crumbs={crumbs}
        actions={
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <WaitingOn status={status} />
          </div>
        }
      />
      <div className="mb-6 flex items-center gap-1 border-b border-fog">
        <NavLink
          to={baseUrl}
          end
          className={({ isActive }) =>
            clsx(
              'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
              isActive ? 'border-signal text-ink' : 'border-transparent text-slate-soft hover:text-ink',
            )
          }
        >
          Application
        </NavLink>
        <NavLink
          to={`${baseUrl}/chat`}
          className={({ isActive }) =>
            clsx(
              'ml-6 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
              isActive ? 'border-signal text-ink' : 'border-transparent text-slate-soft hover:text-ink',
            )
          }
        >
          Chat {messageCount > 0 && <span className="text-slate-soft">({messageCount})</span>}
        </NavLink>
      </div>
    </div>
  )
}
