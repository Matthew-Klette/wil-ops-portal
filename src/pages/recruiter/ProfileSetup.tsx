import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'

export function ProfileSetup() {
  const { currentUser } = useAuth()
  const { getCompanyById, updateProfile, updateCompany } = useData()

  const company = currentUser?.companyId ? getCompanyById(currentUser.companyId) : undefined

  const [headline, setHeadline] = useState(currentUser?.headline ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [companyName, setCompanyName] = useState(company?.name ?? '')
  const [industry, setIndustry] = useState(company?.industry ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!currentUser) return null

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateProfile(currentUser!.id, { headline: headline.trim(), bio: bio.trim() })
      if (company && companyName.trim() && industry.trim()) {
        await updateCompany(company.id, { name: companyName.trim(), industry: industry.trim(), since: company.since })
      }
      setSaved(true)
    } catch {
      setError('Something went wrong saving your profile — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Your profile"
        subtitle="Job seekers see your organisation details on every listing you post."
        crumbs={[{ label: 'Dashboard', to: '/recruiter' }, { label: 'Profile' }]}
      />

      <Card className="mb-5 flex items-center gap-4 p-5">
        <Avatar name={currentUser.name} color={currentUser.initialColor} size={52} />
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-base font-medium text-ink">{currentUser.name}</span>
          <span className="text-sm text-slate-soft">{currentUser.email}</span>
        </div>
      </Card>

      <Card className="mb-5 p-5 sm:p-7">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="headline" className="text-sm font-medium text-ink">
              Title
            </label>
            <input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Talent Acquisition Lead"
              className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-ink">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short summary of your role and what you're hiring for."
              rows={4}
              className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
          </div>

          {company ? (
            <div className="grid grid-cols-1 gap-4 border-t border-fog pt-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-ink">Organisation details</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="companyName" className="text-xs font-medium text-slate-soft">
                  Company name
                </label>
                <input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-signal"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="industry" className="text-xs font-medium text-slate-soft">
                  Industry
                </label>
                <input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-signal"
                />
              </div>
            </div>
          ) : (
            <div className="border-t border-fog pt-5">
              <EmptyState title="No company assigned" description="Ask an admin to assign you to a company before editing organisation details." />
            </div>
          )}

          {error && <p className="text-sm text-signal">{error}</p>}

          <div className="flex items-center justify-between border-t border-fog pt-5">
            <span className="text-xs text-slate-soft">{saved ? 'Saved.' : 'Job seekers see this on your listings.'}</span>
            <button
              type="submit"
              disabled={saving}
              className="flex-shrink-0 rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-fog disabled:text-slate-soft"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
