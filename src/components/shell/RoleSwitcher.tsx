import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../data/types'
import { roleTitle } from '../../nav'
import { IconChevronDown } from '../icons'

const roles: Role[] = ['admin', 'recruiter', 'job_seeker']

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!currentUser) return null

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-fog bg-paper-raised px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
      >
        Viewing as {roleTitle[currentUser.role]}
        <IconChevronDown width={14} height={14} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-fog bg-paper-raised shadow-raised">
          <div className="border-b border-fog px-3 py-2 text-[11px] uppercase tracking-wide text-slate-soft">
            Demo: switch role
          </div>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                switchRole(role)
                setOpen(false)
                navigate(`/${role}`)
              }}
              className={clsx(
                'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-fog-soft',
                currentUser.role === role && 'text-signal',
              )}
            >
              {roleTitle[role]}
              {currentUser.role === role && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
