import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconArrowLeft } from '../components/icons'

export function NotFound() {
  const { currentUser } = useAuth()
  const home = currentUser ? `/${currentUser.role}` : '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="font-mono text-sm uppercase tracking-wide text-signal">404</span>
      <h1 className="font-display text-3xl font-medium text-ink">This page went missing</h1>
      <p className="max-w-sm text-sm text-slate-soft">
        We couldn't find what you were looking for. It may have moved, or the link might be out of date.
      </p>
      <Link
        to={home}
        className="mt-2 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal"
      >
        <IconArrowLeft width={16} height={16} />
        {currentUser ? 'Back to dashboard' : 'Back to sign in'}
      </Link>
    </div>
  )
}
