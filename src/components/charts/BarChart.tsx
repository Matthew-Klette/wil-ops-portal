import { motion } from 'framer-motion'

export interface BarDatum {
  label: string
  value: number
}

export function BarChart({ data, tone = 'signal' }: { data: BarDatum[]; tone?: 'signal' | 'pine' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const color = tone === 'signal' ? 'var(--color-signal)' : 'var(--color-pine)'

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-36 flex-shrink-0 truncate text-xs text-slate-soft" title={d.label}>
            {d.label}
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-fog-soft">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
            />
          </div>
          <span className="w-6 flex-shrink-0 text-right font-mono text-xs text-ink">{d.value}</span>
        </div>
      ))}
      <table className="sr-only">
        <caption>Chart data</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
