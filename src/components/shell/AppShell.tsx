import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { navByRole } from '../../nav'
import { RoleSwitcher } from './RoleSwitcher'
import { Avatar } from '../ui/Avatar'
import { IconBell, IconLogout, IconMenu, IconX } from '../icons'

export function AppShell() {
  const { currentUser, logout } = useAuth()
  const { notificationPermission, requestNotificationPermission, getTotalUnreadCount } = useChat()
  const location = useLocation()
  const navigate = useNavigate()
  const outlet = useOutlet()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Close the drawer automatically whenever the route changes (tapping a
  // nav link navigates but doesn't itself close the overlay).
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  if (!currentUser) return null

  const items = navByRole[currentUser.role]
  const canChat = currentUser.role !== 'admin'
  const unreadCount = canChat ? getTotalUnreadCount() : 0

  return (
    <div className="flex min-h-screen w-full bg-paper">
      {/* Desktop left rail */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-fog bg-ink text-paper md:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal font-display text-base font-semibold text-paper">
            L
          </span>
          <span className="font-display text-lg font-medium tracking-tight">Ledger</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper/90',
                )
              }
            >
              <item.icon width={18} height={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-paper/60 transition-colors hover:bg-white/5 hover:text-paper/90"
          >
            <IconLogout width={18} height={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-fog bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="flex items-center gap-2 md:hidden"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-signal text-paper">
              <IconMenu width={16} height={16} />
            </span>
            <span className="font-display text-base font-medium">Ledger</span>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {canChat && (
              <button
                onClick={() => notificationPermission === 'default' && requestNotificationPermission()}
                title={
                  notificationPermission === 'granted'
                    ? 'Notifications enabled'
                    : notificationPermission === 'denied'
                      ? 'Notifications blocked in browser settings'
                      : 'Enable notifications for new messages'
                }
                className={clsx(
                  'relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-colors',
                  notificationPermission === 'default'
                    ? 'border-signal/40 text-signal hover:bg-signal-soft'
                    : 'border-fog text-slate-soft hover:border-signal/40 hover:text-signal',
                )}
              >
                <IconBell width={17} height={17} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[9px] font-semibold text-paper">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            <RoleSwitcher />
            <Avatar name={currentUser.name} color={currentUser.initialColor} size={34} />
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 pt-6 md:px-8 md:pt-8">
          {/* No `mode="wait"` here on purpose: it holds the outgoing page on
              screen until its exit animation reports complete before the
              next route mounts. If that callback ever fails to fire (e.g. a
              child component's cleanup runs into trouble), navigation looks
              like it silently does nothing — clicks work, the route changes,
              but the screen never swaps. Letting enter/exit run concurrently
              removes that failure mode entirely. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile nav drawer — portalled to <body> so it isn't trapped inside
          the header's backdrop-blur containing block (fixed/absolute
          descendants of a filter/backdrop-filter element are positioned
          relative to that element, not the viewport). Replaces a bottom
          tab bar, which couldn't fit every item on roles with a long nav
          (e.g. admin) without squeezing or scrolling. */}
      {createPortal(
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                className="fixed inset-0 z-40 bg-ink/40 md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[80vw] flex-col bg-ink text-paper md:hidden"
              >
                <div className="flex items-center justify-between px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal font-display text-base font-semibold text-paper">
                      L
                    </span>
                    <span className="font-display text-lg font-medium tracking-tight">Ledger</span>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-paper/60 transition-colors hover:bg-white/5 hover:text-paper/90"
                  >
                    <IconX width={18} height={18} />
                  </button>
                </div>
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
                  {items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive ? 'bg-white/10 text-paper' : 'text-paper/60 hover:bg-white/5 hover:text-paper/90',
                        )
                      }
                    >
                      <item.icon width={18} height={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="border-t border-white/10 px-3 py-4">
                  <button
                    onClick={() => {
                      setMobileNavOpen(false)
                      logout()
                      navigate('/')
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-paper/60 transition-colors hover:bg-white/5 hover:text-paper/90"
                  >
                    <IconLogout width={18} height={18} />
                    Sign out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
