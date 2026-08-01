import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import { Avatar } from '../ui/Avatar'
import { IconMessage } from '../icons'

export function ChatToasts() {
  const { toasts, dismissToast } = useChat()
  const navigate = useNavigate()

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => {
              dismissToast(toast.id)
              navigate(`/${toast.role}/applications/${toast.applicationId}/chat`)
            }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-fog bg-paper-raised p-3.5 text-left shadow-raised transition-colors hover:border-signal/40"
          >
            <Avatar name={toast.senderName} color={toast.senderColor} size={34} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <IconMessage width={12} height={12} className="flex-shrink-0 text-signal" />
                <span className="truncate text-sm font-medium text-ink">{toast.senderName}</span>
              </div>
              <p className="line-clamp-2 text-sm text-slate-soft">{toast.body}</p>
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation()
                dismissToast(toast.id)
              }}
              role="button"
              aria-label="Dismiss"
              className="flex-shrink-0 rounded-full px-1.5 text-xs text-slate-soft/70 transition-colors hover:text-ink"
            >
              ✕
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
