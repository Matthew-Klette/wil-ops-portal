import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useListings } from '../context/ListingsContext'
import type { Role } from '../data/types'
import { IconActivity, IconChevronRight, IconGrid, IconMessage, IconShield, IconUsers } from '../components/icons'

const valueProps = [
  { icon: IconActivity, text: 'Full visibility from application to offer — no more "did anyone see this?"' },
  { icon: IconMessage, text: 'Conversation lives on the application itself, not buried in someone\'s inbox' },
  { icon: IconUsers, text: 'One shared source of truth for job seekers, recruiters, and admins alike' },
]

const roleCards: {
  role: Role
  title: string
  description: string
  icon: typeof IconGrid
  name: string
  statKey: 'admin' | 'recruiter' | 'job_seeker'
}[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'Manage users, permissions, and oversee activity across the platform.',
    icon: IconShield,
    name: 'Braeden Naidoo, Head of Engineering',
    statKey: 'admin',
  },
  {
    role: 'recruiter',
    title: 'Recruiter',
    description: 'Post job listings, review applications, and message candidates.',
    icon: IconUsers,
    name: 'Luke Page, Talent Recruiter',
    statKey: 'recruiter',
  },
  {
    role: 'job_seeker',
    title: 'Job Seeker',
    description: 'Browse open roles, apply with your documents, and track every application.',
    icon: IconGrid,
    name: 'Matt Klette, Job Seeker',
    statKey: 'job_seeker',
  },
]

export function RolePicker() {
  const { login } = useAuth()
  const { listings, applications } = useListings()
  const navigate = useNavigate()

  function handleSelect(role: Role) {
    login(role)
    navigate(`/${role}`)
  }

  const openListingsCount = listings.filter((l) => l.status === 'open').length
  const recruiterOpenCount = listings.filter((l) => l.postedBy === 'u-james' && l.status === 'open').length
  const jobSeekerApplicationCount = applications.filter((a) => a.applicantId === 'u-priya').length

  const statLine: Record<string, string> = {
    admin: `${openListingsCount} open listings across the platform`,
    recruiter: `${recruiterOpenCount} listings you're managing`,
    job_seeker: `${jobSeekerApplicationCount} applications submitted`,
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      {/* Brand / storytelling panel — desktop only */}
      <div className="bg-grain relative hidden w-full flex-col justify-center gap-14 overflow-hidden bg-ink px-10 py-10 text-paper lg:flex lg:w-[45%] xl:w-[42%] xl:px-14 xl:py-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-signal) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal font-display text-3xl font-semibold text-paper">
              L
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-display text-3xl font-medium tracking-tight">Ledger</span>
              <span className="font-mono text-xs uppercase tracking-wide text-paper/40">Job Board</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative z-10 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-3">
            <h1 className="max-w-sm font-display text-[34px] font-medium leading-[1.1] tracking-tight text-paper xl:text-[38px]">
              Every application, tracked to offer.
            </h1>
            <p className="max-w-sm text-[15px] leading-relaxed text-paper/55">
              Ledger connects job seekers with recruiters — post a listing, apply, chat, and track status
              in one shared place instead of scattered emails.
            </p>
          </div>

          <p className="max-w-sm text-[15px] leading-relaxed text-paper/55">
            Built for teams hiring without a reliable internet connection to fall back on external chat
            apps — the messaging, documents, and status live right here.
          </p>

          <ul className="flex max-w-sm flex-col gap-3.5">
            {valueProps.map((v, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-signal">
                  <v.icon width={14} height={14} />
                </span>
                <span className="text-sm leading-relaxed text-paper/70">{v.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Mobile-only compact header */}
      <div className="flex items-center gap-2.5 border-b border-fog bg-ink px-6 py-5 text-paper lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal font-display text-base font-semibold text-paper">
          L
        </span>
        <div className="flex flex-col">
          <span className="font-display text-lg font-medium tracking-tight">Ledger</span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-paper/40">Job Board</span>
        </div>
      </div>

      {/* Role selection */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-14 lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wide text-signal">Sign in to preview</span>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">Choose your view</h2>
            <p className="text-sm text-slate-soft">
              This is a design prototype — no real accounts. Pick a role to sign in as that person's mock account.
            </p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {roleCards.map((card, i) => (
              <motion.button
                key={card.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.06 }}
                whileHover={{ x: 3 }}
                onClick={() => handleSelect(card.role)}
                className="group flex items-start gap-4 rounded-2xl border border-fog bg-paper-raised p-5 text-left shadow-card transition-colors hover:border-signal/40"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-fog-soft text-ink transition-colors group-hover:bg-signal group-hover:text-paper">
                  <card.icon width={18} height={18} />
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-[17px] font-medium text-ink">{card.title}</h3>
                    <IconChevronRight
                      width={16}
                      height={16}
                      className="flex-shrink-0 text-slate-soft transition-transform group-hover:translate-x-0.5 group-hover:text-signal"
                    />
                  </div>
                  <p className="text-[13px] leading-relaxed text-slate-soft">{card.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="rounded-full bg-signal-soft px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-signal">
                      {statLine[card.statKey]}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft/70">{card.name}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex items-center border-t border-fog pt-5 text-xs text-slate-soft">
            <span>Ledger — internal tool</span>
          </div>
        </div>
      </div>
    </div>
  )
}
