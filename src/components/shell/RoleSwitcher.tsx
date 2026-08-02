import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import type { Role, User } from '../../data/types'
import { roleTitle } from '../../nav'
import { Avatar } from '../ui/Avatar'
import { IconChevronDown } from '../icons'

const roles: Role[] = ['admin', 'recruiter', 'job_seeker']

export function RoleSwitcher() {
  const { currentUser, switchToUser } = useAuth()
  const { users } = useData()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [pickerRole, setPickerRole] = useState<Role | null>(null)
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

  function candidatesForRole(role: Role): User[] {
    return users.filter((u) => u.role === role && u.active)
  }

  function handleSelectRole(role: Role) {
    const candidates = candidatesForRole(role)
    if (candidates.length === 0) return
    setOpen(false)
    if (candidates.length === 1) {
      switchToUser(candidates[0].id)
      navigate(`/${role}`)
      return
    }
    // More than one account holds this role — let the user pick which one
    // to view the app as instead of silently landing on an arbitrary match.
    setPickerRole(role)
  }

  function handlePickUser(user: User) {
    switchToUser(user.id)
    setPickerRole(null)
    navigate(`/${user.role}`)
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full border border-fog bg-paper-raised px-3 py-1.5 text-xs font-medium text-slate transition-colors hover:border-signal/40 hover:text-signal"
        >
          Viewing as {roleTitle[currentUser.role]}
          <IconChevronDown width={14} height={14} className={clsx('transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-fog bg-paper-raised shadow-raised">
            <div className="border-b border-fog px-3 py-2 text-[11px] uppercase tracking-wide text-slate-soft">Switch role</div>
            {roles.map((role) => {
              const candidates = candidatesForRole(role)
              const disabled = candidates.length === 0
              return (
                <button
                  key={role}
                  disabled={disabled}
                  onClick={() => handleSelectRole(role)}
                  className={clsx(
                    'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors',
                    disabled ? 'cursor-not-allowed text-slate-soft/40' : 'hover:bg-fog-soft',
                    !disabled && currentUser.role === role && 'text-signal',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {roleTitle[role]}
                    {candidates.length > 1 && (
                      <span className="rounded-full bg-fog-soft px-1.5 py-0.5 text-[10px] font-medium text-slate-soft">
                        {candidates.length}
                      </span>
                    )}
                  </span>
                  {currentUser.role === role && !disabled && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {pickerRole &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
            onClick={() => setPickerRole(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-fog bg-paper-raised p-5 shadow-raised"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1 font-display text-base font-medium text-ink">View as {roleTitle[pickerRole]}</h3>
              <p className="mb-4 text-xs text-slate-soft">
                Multiple {roleTitle[pickerRole].toLowerCase()} accounts are available — choose one.
              </p>
              <div className="flex flex-col gap-1">
                {candidatesForRole(pickerRole).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handlePickUser(u)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-fog-soft"
                  >
                    <Avatar name={u.name} color={u.initialColor} size={32} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{u.name}</span>
                      <span className="text-xs text-slate-soft">{u.email}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPickerRole(null)}
                className="mt-3 w-full rounded-full px-4 py-2 text-sm font-medium text-slate-soft transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
