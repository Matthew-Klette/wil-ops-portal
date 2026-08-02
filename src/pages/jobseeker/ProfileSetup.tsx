import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { supabase } from '../../lib/supabase'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { IconFile, IconTrash } from '../../components/icons'

export function ProfileSetup() {
  const { currentUser } = useAuth()
  const { updateProfile } = useData()

  const [headline, setHeadline] = useState(currentUser?.headline ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [skills, setSkills] = useState<string[]>(currentUser?.skills ?? [])
  const [skillDraft, setSkillDraft] = useState('')
  const [resumeUrl, setResumeUrl] = useState(currentUser?.resumeUrl ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  if (!currentUser) return null

  function addSkill() {
    const value = skillDraft.trim()
    if (!value || skills.includes(value)) {
      setSkillDraft('')
      return
    }
    setSkills((s) => [...s, value])
    setSkillDraft('')
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  function removeSkill(value: string) {
    setSkills((s) => s.filter((sk) => sk !== value))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      let nextResumeUrl = resumeUrl || undefined
      if (file) {
        const path = `${currentUser!.id}/profile-${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('application-documents').upload(path, file)
        if (uploadError) throw uploadError
        nextResumeUrl = supabase.storage.from('application-documents').getPublicUrl(path).data.publicUrl
      }
      await updateProfile(currentUser!.id, {
        headline: headline.trim(),
        bio: bio.trim(),
        skills,
        resumeUrl: nextResumeUrl ?? null,
      })
      setResumeUrl(nextResumeUrl ?? '')
      setFile(null)
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
        subtitle="Recruiters see this when you apply — keep it up to date."
        crumbs={[{ label: 'Dashboard', to: '/job_seeker' }, { label: 'Profile' }]}
      />

      <Card className="mb-5 flex items-center gap-4 p-5">
        <Avatar name={currentUser.name} color={currentUser.initialColor} size={52} />
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-base font-medium text-ink">{currentUser.name}</span>
          <span className="text-sm text-slate-soft">{currentUser.email}</span>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="headline" className="text-sm font-medium text-ink">
              Headline
            </label>
            <input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Frontend developer & recent CS graduate"
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
              placeholder="A short summary of your background and what you're looking for."
              rows={4}
              className="resize-none rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="skills" className="text-sm font-medium text-ink">
              Skills
            </label>
            <input
              id="skills"
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              onBlur={addSkill}
              placeholder="Type a skill and press Enter"
              className="rounded-lg border border-fog bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-soft focus:border-signal"
            />
            {skills.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full bg-fog-soft px-3 py-1 text-xs font-medium text-slate"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-slate-soft transition-colors hover:text-signal"
                    >
                      <IconTrash width={11} height={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cv" className="text-sm font-medium text-ink">
              CV / résumé
            </label>
            <label
              htmlFor="cv"
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-fog bg-paper px-3.5 py-3 text-sm text-slate-soft transition-colors hover:border-signal/40"
            >
              <IconFile width={16} height={16} />
              {file ? file.name : resumeUrl ? 'Replace uploaded CV' : 'Upload a PDF, image, or document'}
            </label>
            <input id="cv" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {resumeUrl && !file && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-signal hover:text-signal/80">
                View current CV
              </a>
            )}
          </div>

          {error && <p className="text-sm text-signal">{error}</p>}

          <div className="flex items-center justify-between border-t border-fog pt-5">
            <span className="text-xs text-slate-soft">{saved ? 'Saved.' : 'Recruiters see this when you apply.'}</span>
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
