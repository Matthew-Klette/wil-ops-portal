import { motion } from 'framer-motion'
import { statusLabels } from '../../data/mock'
import type { StatusEvent } from '../../data/types'
import { statusTone } from '../../lib/status'
import { formatDateTime } from '../../lib/status'

export function StatusThread({ events }: { events: StatusEvent[] }) {
  return (
    <ol className="relative flex flex-col gap-0">
      {events.map((event, i) => {
        const tone = statusTone(event.status)
        const isLast = i === events.length - 1
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-fog" aria-hidden />
            )}
            <span
              className="relative z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2"
              style={{
                borderColor: tone === 'signal' ? 'var(--color-signal)' : tone === 'pine' ? 'var(--color-pine)' : 'var(--color-slate-soft)',
                backgroundColor: 'var(--color-paper-raised)',
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    tone === 'signal' ? 'var(--color-signal)' : tone === 'pine' ? 'var(--color-pine)' : 'var(--color-slate-soft)',
                }}
              />
            </span>
            <div className="flex flex-1 flex-col gap-0.5 pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="font-display text-[15px] font-medium text-ink">{statusLabels[event.status]}</span>
                <span className="font-mono text-[11px] text-slate-soft">{formatDateTime(event.timestamp)}</span>
              </div>
              <span className="text-sm text-slate-soft">by {event.actor}</span>
              {event.note && <p className="mt-1.5 rounded-lg bg-fog-soft/60 px-3 py-2 text-sm text-ink/80">{event.note}</p>}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
