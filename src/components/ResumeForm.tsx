import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { THUMBNAIL_RESUME } from '../lib/defaultResume'
import { newId } from '../lib/id'
import type { Certification, EducationItem, ExperienceItem, ProjectItem, ResumeData, SkillGroup } from '../types/resume'

type Props = {
  data: ResumeData
  onChange: (next: ResumeData) => void
  /** When true, starter text is muted; focus clears it; blur with nothing typed restores the sample. */
  sampleHints?: boolean
}

const hintInputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15'

function Field({
  label,
  className,
  sampleHints,
  sampleValue,
  value,
  onValueChange,
  ...inputProps
}: {
  label: string
  className?: string
  sampleHints?: boolean
  sampleValue?: string
  value: string
  onValueChange: (v: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const { onBlur: onBlurProp, onFocus: onFocusProp, ...restInput } = inputProps
  const hinted = Boolean(sampleHints && sampleValue !== undefined && value === sampleValue)
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={(e) => {
          if (sampleHints && sampleValue !== undefined && e.currentTarget.value === sampleValue) {
            onValueChange('')
          }
          onFocusProp?.(e)
        }}
        onBlur={(e) => {
          if (sampleHints && sampleValue !== undefined && e.currentTarget.value.trim() === '') {
            onValueChange(sampleValue)
          }
          onBlurProp?.(e)
        }}
        className={`${hintInputClass} ${hinted ? 'text-slate-400' : 'text-slate-900'} ${className ?? ''}`}
        {...restInput}
      />
    </label>
  )
}

function TextArea({
  label,
  sampleHints,
  sampleValue,
  value,
  onValueChange,
  ...props
}: {
  label: string
  sampleHints?: boolean
  sampleValue?: string
  value: string
  onValueChange: (v: string) => void
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const { onBlur: onBlurProp, onFocus: onFocusProp, ...restArea } = props
  const hinted = Boolean(sampleHints && sampleValue !== undefined && value === sampleValue)
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={(e) => {
          if (sampleHints && sampleValue !== undefined && e.currentTarget.value === sampleValue) {
            onValueChange('')
          }
          onFocusProp?.(e)
        }}
        onBlur={(e) => {
          if (sampleHints && sampleValue !== undefined && e.currentTarget.value.trim() === '') {
            onValueChange(sampleValue)
          }
          onBlurProp?.(e)
        }}
        className={`w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15 ${hinted ? 'text-slate-400' : 'text-slate-900'}`}
        {...restArea}
      />
    </label>
  )
}

function BulletInput({
  sampleHints,
  sampleValue,
  value,
  onValueChange,
}: {
  sampleHints?: boolean
  sampleValue?: string
  value: string
  onValueChange: (v: string) => void
}) {
  const hinted = Boolean(sampleHints && sampleValue !== undefined && value === sampleValue)
  return (
    <input
      className={`min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15 ${hinted ? 'text-slate-400' : 'text-slate-900'}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onFocus={(e) => {
        if (sampleHints && sampleValue !== undefined && e.currentTarget.value === sampleValue) {
          onValueChange('')
        }
      }}
      onBlur={(e) => {
        if (sampleHints && sampleValue !== undefined && e.currentTarget.value.trim() === '') {
          onValueChange(sampleValue)
        }
      }}
      placeholder="Impact line…"
    />
  )
}

export function ResumeForm({ data, onChange, sampleHints }: Props) {
  const patch = (partial: Partial<ResumeData>) => onChange({ ...data, ...partial })

  const updateExperience = (id: string, partial: Partial<ExperienceItem>) => {
    onChange({
      ...data,
      experience: data.experience.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const updateBullet = (expId: string, index: number, value: string) => {
    const exp = data.experience.find((e) => e.id === expId)
    if (!exp) return
    const bullets = [...exp.bullets]
    bullets[index] = value
    updateExperience(expId, { bullets })
  }

  const addExperience = () => {
    const row: ExperienceItem = {
      id: newId(),
      company: '',
      role: '',
      start: '',
      end: '',
      bullets: [''],
    }
    onChange({ ...data, experience: [...data.experience, row] })
  }

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter((e) => e.id !== id) })
  }

  const addEducation = () => {
    const row: EducationItem = { id: newId(), school: '', degree: '', year: '' }
    onChange({ ...data, education: [...data.education, row] })
  }

  const updateEducation = (id: string, partial: Partial<EducationItem>) => {
    onChange({
      ...data,
      education: data.education.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) })
  }

  const addSkillGroup = () => {
    const row: SkillGroup = { id: newId(), title: '', skills: '' }
    onChange({ ...data, skills: [...data.skills, row] })
  }

  const updateSkill = (id: string, partial: Partial<SkillGroup>) => {
    onChange({
      ...data,
      skills: data.skills.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter((s) => s.id !== id) })
  }

  const addProject = () => {
    const row: ProjectItem = { id: newId(), name: '', description: '', url: '' }
    onChange({ ...data, projects: [...data.projects, row] })
  }

  const updateProject = (id: string, partial: Partial<ProjectItem>) => {
    onChange({
      ...data,
      projects: data.projects.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) })
  }

  const addCert = () => {
    const row: Certification = { id: newId(), name: '', issuer: '' }
    onChange({ ...data, certifications: [...data.certifications, row] })
  }

  const updateCert = (id: string, partial: Partial<Certification>) => {
    onChange({
      ...data,
      certifications: data.certifications.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const removeCert = (id: string) => {
    onChange({ ...data, certifications: data.certifications.filter((c) => c.id !== id) })
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Full name"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.fullName}
            value={data.fullName}
            onValueChange={(v) => patch({ fullName: v })}
          />
          <Field
            label="Headline"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.headline}
            value={data.headline}
            onValueChange={(v) => patch({ headline: v })}
          />
          <Field
            label="Email"
            type="email"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.email}
            value={data.email}
            onValueChange={(v) => patch({ email: v })}
          />
          <Field
            label="Phone"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.phone}
            value={data.phone}
            onValueChange={(v) => patch({ phone: v })}
          />
          <Field
            label="Location"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.location}
            value={data.location}
            onValueChange={(v) => patch({ location: v })}
          />
          <Field
            label="Website"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.website}
            value={data.website}
            onValueChange={(v) => patch({ website: v })}
          />
          <Field
            label="LinkedIn"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.linkedin}
            value={data.linkedin}
            onValueChange={(v) => patch({ linkedin: v })}
          />
          <Field
            label="GitHub"
            sampleHints={sampleHints}
            sampleValue={THUMBNAIL_RESUME.github}
            value={data.github}
            onValueChange={(v) => patch({ github: v })}
          />
        </div>
        <TextArea
          label="Summary"
          sampleHints={sampleHints}
          sampleValue={THUMBNAIL_RESUME.summary}
          value={data.summary}
          onValueChange={(v) => patch({ summary: v })}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/35 p-4">
        <div className="flex items-start gap-3">
          <input
            id="resume-extra-column"
            type="checkbox"
            checked={data.extraColumnEnabled}
            onChange={(e) => patch({ extraColumnEnabled: e.target.checked })}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
          />
          <div className="min-w-0">
            <label htmlFor="resume-extra-column" className="cursor-pointer text-sm font-semibold text-slate-900">
              Optional third column
            </label>
            <p className="mt-1 text-xs text-slate-600">
              Turn on to add a narrow right-hand column on your chosen template. Fill the heading and/or body — line breaks are kept.
            </p>
          </div>
        </div>
        {data.extraColumnEnabled ? (
          <div className="space-y-3 border-t border-indigo-100/80 pt-4">
            <Field
              label="Column heading (e.g. Highlights, Languages)"
              sampleHints={sampleHints}
              sampleValue={THUMBNAIL_RESUME.extraColumnTitle}
              value={data.extraColumnTitle}
              onValueChange={(v) => patch({ extraColumnTitle: v })}
            />
            <TextArea
              label="Column content"
              sampleHints={sampleHints}
              sampleValue={THUMBNAIL_RESUME.extraColumnBody}
              value={data.extraColumnBody}
              onValueChange={(v) => patch({ extraColumnBody: v })}
              rows={5}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Add role
          </button>
        </div>
        <div className="space-y-6">
          {data.experience.map((ex, exIdx) => {
            const sampleEx = THUMBNAIL_RESUME.experience[exIdx]
            return (
            <div key={ex.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeExperience(ex.id)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Role"
                  sampleHints={sampleHints}
                  sampleValue={sampleEx?.role}
                  value={ex.role}
                  onValueChange={(v) => updateExperience(ex.id, { role: v })}
                />
                <Field
                  label="Company"
                  sampleHints={sampleHints}
                  sampleValue={sampleEx?.company}
                  value={ex.company}
                  onValueChange={(v) => updateExperience(ex.id, { company: v })}
                />
                <Field
                  label="Start"
                  sampleHints={sampleHints}
                  sampleValue={sampleEx?.start}
                  value={ex.start}
                  onValueChange={(v) => updateExperience(ex.id, { start: v })}
                />
                <Field
                  label="End"
                  sampleHints={sampleHints}
                  sampleValue={sampleEx?.end}
                  value={ex.end}
                  onValueChange={(v) => updateExperience(ex.id, { end: v })}
                />
              </div>
              <div className="mt-3 space-y-2">
                <span className="text-xs font-medium text-slate-500">Highlights</span>
                {ex.bullets.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <BulletInput
                      sampleHints={sampleHints}
                      sampleValue={sampleEx?.bullets[i]}
                      value={b}
                      onValueChange={(v) => updateBullet(ex.id, i, v)}
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-xl border border-slate-200 px-2 text-xs text-slate-500 hover:bg-white"
                      onClick={() => {
                        const bullets = ex.bullets.filter((_, j) => j !== i)
                        updateExperience(ex.id, { bullets: bullets.length ? bullets : [''] })
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  onClick={() => updateExperience(ex.id, { bullets: [...ex.bullets, ''] })}
                >
                  + Add bullet
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Add school
          </button>
        </div>
        <div className="space-y-4">
          {data.education.map((ed, i) => {
            const sampleEd = THUMBNAIL_RESUME.education[i]
            return (
            <div key={ed.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex justify-end">
                <button type="button" onClick={() => removeEducation(ed.id)} className="text-xs text-rose-600">
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="School"
                  sampleHints={sampleHints}
                  sampleValue={sampleEd?.school}
                  value={ed.school}
                  onValueChange={(v) => updateEducation(ed.id, { school: v })}
                />
                <Field
                  label="Degree"
                  sampleHints={sampleHints}
                  sampleValue={sampleEd?.degree}
                  value={ed.degree}
                  onValueChange={(v) => updateEducation(ed.id, { degree: v })}
                />
                <Field
                  label="Year"
                  sampleHints={sampleHints}
                  sampleValue={sampleEd?.year}
                  value={ed.year}
                  onValueChange={(v) => updateEducation(ed.id, { year: v })}
                />
              </div>
            </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Skill groups</h2>
          <button
            type="button"
            onClick={addSkillGroup}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Add group
          </button>
        </div>
        <div className="space-y-3">
          {data.skills.map((s, i) => {
            const sampleSg = THUMBNAIL_RESUME.skills[i]
            return (
            <div
              key={s.id}
              className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[minmax(0,160px)_1fr_auto] sm:items-end"
            >
              <Field
                label="Group title"
                sampleHints={sampleHints}
                sampleValue={sampleSg?.title}
                value={s.title}
                onValueChange={(v) => updateSkill(s.id, { title: v })}
              />
              <Field
                label="Skills (comma-separated ok)"
                sampleHints={sampleHints}
                sampleValue={sampleSg?.skills}
                value={s.skills}
                onValueChange={(v) => updateSkill(s.id, { skills: v })}
              />
              <button type="button" onClick={() => removeSkill(s.id)} className="text-xs text-rose-600 sm:mb-2 sm:justify-self-end">
                Remove
              </button>
            </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Projects</h2>
          <button
            type="button"
            onClick={addProject}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Add project
          </button>
        </div>
        <div className="space-y-4">
          {data.projects.map((pr, i) => {
            const samplePr = THUMBNAIL_RESUME.projects[i]
            return (
            <div key={pr.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex justify-end">
                <button type="button" onClick={() => removeProject(pr.id)} className="text-xs text-rose-600">
                  Remove
                </button>
              </div>
              <div className="grid gap-3">
                <Field
                  label="Name"
                  sampleHints={sampleHints}
                  sampleValue={samplePr?.name}
                  value={pr.name}
                  onValueChange={(v) => updateProject(pr.id, { name: v })}
                />
                <TextArea
                  label="Description"
                  sampleHints={sampleHints}
                  sampleValue={samplePr?.description}
                  value={pr.description}
                  onValueChange={(v) => updateProject(pr.id, { description: v })}
                />
                <Field
                  label="URL"
                  sampleHints={sampleHints}
                  sampleValue={samplePr?.url}
                  value={pr.url}
                  onValueChange={(v) => updateProject(pr.id, { url: v })}
                />
              </div>
            </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Certifications</h2>
          <button
            type="button"
            onClick={addCert}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Add certification
          </button>
        </div>
        <div className="space-y-3">
          {data.certifications.map((c, i) => {
            const sampleC = THUMBNAIL_RESUME.certifications[i]
            return (
            <div key={c.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-end">
              <Field
                label="Name"
                sampleHints={sampleHints}
                sampleValue={sampleC?.name}
                value={c.name}
                onValueChange={(v) => updateCert(c.id, { name: v })}
              />
              <Field
                label="Issuer"
                sampleHints={sampleHints}
                sampleValue={sampleC?.issuer}
                value={c.issuer}
                onValueChange={(v) => updateCert(c.id, { issuer: v })}
              />
              <button type="button" onClick={() => removeCert(c.id)} className="text-xs text-rose-600 sm:mb-2">
                Remove
              </button>
            </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
