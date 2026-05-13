import type { ReactNode } from 'react'
import type { ResumeData } from '../types/resume'
import {
  hasCertificationsContent,
  hasEducationContent,
  hasExperienceContent,
  hasProjectsContent,
  hasSkillsContent,
  hasSkillsExcludingLanguagesContent,
  hasSummaryContent,
} from '../lib/resumeVisibility'

type Variant = 'sheet' | 'public'

function doc(variant: Variant) {
  /* Screen: min height = one A4 sheet for preview. Print/PDF: height follows content so short résumés aren’t half empty. */
  const printSize = 'print:min-h-0 print:h-auto print:max-h-none print:overflow-visible'
  /* min-w-0 + break-words prevent flex/grid children from forcing overflow past 210mm */
  const box = 'min-w-0 w-full max-w-[210mm] box-border break-words [overflow-wrap:anywhere]'
  return variant === 'sheet'
    ? `${box} min-h-[297mm] text-gray-900 shadow-xl ring-1 ring-black/8 print:shadow-none print:ring-0 ${printSize}`
    : `${box} min-h-[297mm] text-gray-900 shadow-xl ring-1 ring-black/8 rounded-xl overflow-hidden ${printSize}`
}

function pSize() {
  return 'text-[16px] leading-[1.6]'
}

function contacts(d: ResumeData) {
  return [d.email, d.phone, d.location].filter(Boolean).join('  ·  ')
}

function socials(d: ResumeData) {
  return [d.linkedin, d.github, d.website]
    .filter(Boolean)
    .map((l) => l!.replace(/^https?:\/\//, ''))
    .join('  ·  ')
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  const a = p[0]?.[0] ?? ''
  const b = p.length > 1 ? p[p.length - 1][0] : p[0]?.[1] ?? ''
  return (a + b).toUpperCase()
}

function Exp({ data, disc = true }: { data: ResumeData; disc?: boolean }) {
  return (
    <ul className="space-y-3.5">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 font-semibold">
            <span>{ex.role} <span className="font-normal opacity-80">— {ex.company}</span></span>
            <span className="shrink-0 text-[15px] opacity-70">{ex.start} – {ex.end}</span>
          </div>
          <ul className={`mt-1 space-y-1 pl-3 ${disc ? 'list-disc' : ''}`}>
            {ex.bullets.filter(Boolean).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

function Edu({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-2">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <span className="font-semibold">{ed.degree}</span>
          <span className="opacity-80"> — {ed.school}</span>
          <span className="text-[15px] opacity-70"> ({ed.year})</span>
        </li>
      ))}
    </ul>
  )
}

function SkillsFlat({ data, columns = 2 }: { data: ResumeData; columns?: 1 | 2 | 3 }) {
  const flat = data.skills.flatMap((s) =>
    s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean),
  )
  const col =
    columns === 3 ? 'grid-cols-3' : columns === 1 ? 'grid-cols-1' : 'grid-cols-2'
  return (
    <ul className={`grid min-w-0 gap-x-4 gap-y-1 ${col}`}>
      {flat.map((s, i) => (
        <li key={i} className="list-disc list-inside text-[16px]">{s}</li>
      ))}
    </ul>
  )
}

function SkillsGrouped({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-2">
      {data.skills.map((s) => (
        <li key={s.id}><span className="font-semibold">{s.title}: </span>{s.skills}</li>
      ))}
    </ul>
  )
}

function SkillBars({ data }: { data: ResumeData }) {
  const rows = data.skills
    .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
    .slice(0, 8)
  return (
    <div className="space-y-2 text-emerald-900">
      {rows.map((skill, i) => {
        const filled = 2 + (i % 4)
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-[15px]">{skill}</span>
            <div className="flex shrink-0 gap-px">
              {[1, 2, 3, 4, 5].map((b) => (
                <span
                  key={b}
                  className={`h-2 w-3 rounded-[2px] ${b <= filled ? 'bg-emerald-600' : 'bg-emerald-200'}`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SkillDots({ data }: { data: ResumeData }) {
  const rows = data.skills
    .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
    .slice(0, 8)
  return (
    <div className="space-y-1.5">
      {rows.map((skill, i) => {
        const filled = 3 + (i % 4)
        return (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-[16px]">{skill}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <span
                  key={d}
                  className={`h-2 w-2 rounded-full ${d <= filled ? 'bg-stone-700' : 'bg-stone-300'}`}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Photo({ data }: { data: ResumeData }) {
  return (
    <div className="flex h-[5.25rem] w-[4.5rem] shrink-0 items-center justify-center rounded-sm border border-stone-300 bg-stone-100 text-xl font-bold text-stone-500">
      {initials(data.fullName)}
    </div>
  )
}

function Certs({ data }: { data: ResumeData }) {
  if (!hasCertificationsContent(data)) return null
  return (
    <ul className="space-y-1">
      {data.certifications.map((c) => (
        <li key={c.id} className="text-[16px]"><span className="font-semibold">{c.name}</span> — {c.issuer}</li>
      ))}
    </ul>
  )
}

function Projects({ data }: { data: ResumeData }) {
  if (!hasProjectsContent(data)) return null
  return (
    <section>
      <h2 className="mb-1 text-[16px] font-bold uppercase tracking-wider">Projects</h2>
      <ul className="space-y-1">
        {data.projects.map((p) => (
          <li key={p.id} className="text-[16px]"><span className="font-semibold">{p.name}: </span>{p.description}</li>
        ))}
      </ul>
    </section>
  )
}

function extraColumnActive(d: ResumeData): boolean {
  return Boolean(d.extraColumnEnabled && (d.extraColumnTitle?.trim() || d.extraColumnBody?.trim()))
}

function ExtraColumnAside({ data, className }: { data: ResumeData; className?: string }) {
  if (!extraColumnActive(data)) return null
  return (
    <aside
      className={`min-w-0 space-y-2 border-l border-stone-200/90 bg-stone-50/95 px-3 py-4 text-[15px] leading-snug ${className ?? ''}`}
      style={{ overflowWrap: 'anywhere' }}
    >
      {data.extraColumnTitle.trim() !== '' ? (
        <h3 className="border-b border-stone-300 pb-1.5 text-[14px] font-bold uppercase tracking-wide text-stone-800">
          {data.extraColumnTitle}
        </h3>
      ) : null}
      {data.extraColumnBody.trim() !== '' ? (
        <div className="whitespace-pre-wrap text-stone-700">{data.extraColumnBody}</div>
      ) : null}
    </aside>
  )
}

/* ─── Shared row primitives (must be module-scoped for React compiler) ─── */
function LabelRowSky({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-4 border-b border-sky-200 py-3">
      <h2 className="text-[14px] font-bold uppercase leading-tight text-sky-800">{label}</h2>
      <div className="min-w-0 text-[16px] text-stone-700">{children}</div>
    </div>
  )
}

function LabelRowSerifGold({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.25rem_minmax(0,1fr)] gap-4 py-2.5">
      <h2 className="font-serif text-[14px] font-bold uppercase leading-tight text-amber-800">{label}</h2>
      <div className="min-w-0 font-serif text-[16px] text-stone-800">{children}</div>
    </div>
  )
}

function LabelRowTeal({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9.25rem_minmax(0,1fr)] gap-4 border-b border-teal-100 py-3">
      <h2 className="text-[14px] font-bold uppercase leading-tight text-teal-600">{label}</h2>
      <div className="min-w-0 text-[16px] text-stone-700">{children}</div>
    </div>
  )
}

function LabelRowBlush({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-2">
      <h2 className="mb-1 inline-block border-b border-pink-300 pr-8 text-[16px] font-bold uppercase text-stone-900">{label}</h2>
      <div className="mt-1 text-[16px] text-stone-700">{children}</div>
    </div>
  )
}

function LabelRowTealPlain({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.25rem_minmax(0,1fr)] gap-4 py-2.5">
      <h2 className="text-[14px] font-bold uppercase leading-tight text-teal-600">{label}</h2>
      <div className="min-w-0 text-[16px] text-stone-700">{children}</div>
    </div>
  )
}

/* ─── tpl-00 Cream split (Karry Maine style) ─── */
function Tpl00({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <aside className={`${x ? 'w-[30%]' : 'w-[38%]'} shrink-0 space-y-4 bg-stone-200/80 px-5 py-6`}>
        <h1 className="text-[25px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
        <div className="space-y-1 text-[15px] text-stone-700">
          {data.email && <p>✉ {data.email}</p>}
          {data.phone && <p>☎ {data.phone}</p>}
          {data.location && <p>📍 {data.location}</p>}
        </div>
        {hasSummaryContent(data) && (
          <div>
            <h2 className="mb-1 border-b border-stone-400 pb-0.5 text-[14px] font-bold uppercase text-stone-800">Summary of qualifications</h2>
            <p className="text-[15px] text-stone-700">{data.summary}</p>
          </div>
        )}
        {hasEducationContent(data) && (
          <div>
            <h2 className="mb-1 border-b border-stone-400 pb-0.5 text-[14px] font-bold uppercase text-stone-800">Education</h2>
            <Edu data={data} />
          </div>
        )}
      </aside>
      <main className="min-w-0 flex-1 space-y-4 bg-white px-6 py-6">
        {hasSummaryContent(data) && (
          <div>
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Professional summary</h2>
            <p className="text-[16px] text-stone-700">{data.summary}</p>
          </div>
        )}
        {hasSkillsContent(data) && (
        <div>
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Relevant skills</h2>
          <SkillsGrouped data={data} />
        </div>
        )}
        {hasExperienceContent(data) && (
        <div>
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
          <Exp data={data} />
        </div>
        )}
        <Projects data={data} />
        <Certs data={data} />
      </main>
      {x ? <ExtraColumnAside data={data} className="w-[23%] self-stretch border-stone-300 bg-stone-100/90 py-6" /> : null}
    </div>
  )
}

/* ─── tpl-01 Sage sidebar + bars ─── */
function Tpl01({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <aside className={`${x ? 'w-[30%]' : 'w-[36%]'} shrink-0 space-y-4 bg-emerald-100/90 px-5 py-6 text-stone-800`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-700/30 bg-white text-2xl font-bold text-emerald-800">
          {initials(data.fullName)}
        </div>
        <h1 className="text-center text-[26px] font-bold text-stone-900">{data.fullName}</h1>
        {data.headline && <p className="text-center text-[14px] font-medium text-stone-600">{data.headline}</p>}
        <div className="space-y-0.5 text-center text-[14px] text-stone-600">
          {data.email && <p>{data.email}</p>}
          {data.phone && <p>{data.phone}</p>}
          {data.location && <p>{data.location}</p>}
        </div>
        {hasSkillsContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase tracking-wider text-emerald-900">Skills</h2>
          <SkillBars data={data} />
        </div>
        )}
        {hasCertificationsContent(data) && (
          <div>
            <h2 className="mb-1 text-[14px] font-bold uppercase text-emerald-900">Certifications</h2>
            <Certs data={data} />
          </div>
        )}
        {hasEducationContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-emerald-900">Education</h2>
          <Edu data={data} />
        </div>
        )}
      </aside>
      <main className="min-w-0 flex-1 space-y-4 px-6 py-6">
        {hasSummaryContent(data) && (
          <div>
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Professional summary</h2>
            <p className="text-[16px] text-stone-700">{data.summary}</p>
          </div>
        )}
        {hasExperienceContent(data) && (
        <div>
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
          <Exp data={data} />
        </div>
        )}
        {hasProjectsContent(data) && (
          <div>
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Accomplishments</h2>
            <ul className="list-disc pl-4 text-[16px]">
              {data.projects.map((pr) => (
                <li key={pr.id}>{pr.description}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
      {x ? <ExtraColumnAside data={data} className="w-[23%] self-stretch border-stone-300 bg-white py-6" /> : null}
    </div>
  )
}

/* ─── tpl-02 Beige bands + photo + dots ─── */
function Tpl02({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} border border-stone-200 bg-white ${p}`}>
      <div className="bg-amber-100/80 px-6 py-2.5 text-center text-[15px] text-stone-700">
        {contacts(data)}
      </div>
      <header className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-5">
        <h1 className="text-[34px] font-bold uppercase tracking-tight text-stone-900">{data.fullName}</h1>
        <Photo data={data} />
      </header>
      <div className={x ? 'flex items-stretch' : ''}>
        <div className={x ? 'min-w-0 flex-1 space-y-4 px-6 py-5' : 'space-y-4 px-6 py-5'}>
          {hasSummaryContent(data) && (
            <section>
              <h2 className="mb-1 border-b border-stone-300 pb-0.5 text-[16px] font-bold uppercase text-stone-900">Resume objective</h2>
              <p className="text-[16px] text-stone-700">{data.summary}</p>
            </section>
          )}
          {hasEducationContent(data) && (
          <section>
            <h2 className="mb-1 border-b border-stone-300 pb-0.5 text-[16px] font-bold uppercase text-stone-900">Education</h2>
            <Edu data={data} />
          </section>
          )}
          {hasSkillsContent(data) && (
          <section>
            <h2 className="mb-1 border-b border-stone-300 pb-0.5 text-[16px] font-bold uppercase text-stone-900">Skills</h2>
            <SkillDots data={data} />
          </section>
          )}
          {hasExperienceContent(data) && (
          <section>
            <h2 className="mb-1 border-b border-stone-300 pb-0.5 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
            <Exp data={data} />
          </section>
          )}
          <Projects data={data} />
          <Certs data={data} />
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[26%] self-stretch border-t-0 bg-amber-50/40" /> : null}
      </div>
      <div className="h-2 bg-amber-100/80" />
    </div>
  )
}

/* ─── tpl-03 Blue ribbon + label rail ─── */
function Tpl03({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} bg-white ${p}`}>
      <div className="bg-sky-100 px-6 py-2.5 text-center text-[15px] font-medium text-sky-900">
        {contacts(data)}
      </div>
      <h1 className="py-5 text-center text-[37px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
      <div className={x ? 'flex items-stretch' : ''}>
        <div className={x ? 'min-w-0 flex-1 px-6 pb-5' : 'px-6 pb-5'}>
          {hasSummaryContent(data) && <LabelRowSky label="Professional summary">{data.summary}</LabelRowSky>}
          {hasSkillsContent(data) && <LabelRowSky label="Skills"><SkillsFlat data={data} columns={3} /></LabelRowSky>}
          {hasExperienceContent(data) && <LabelRowSky label="Work history"><Exp data={data} /></LabelRowSky>}
          {hasEducationContent(data) && <LabelRowSky label="Education"><Edu data={data} /></LabelRowSky>}
          {hasCertificationsContent(data) && <LabelRowSky label="Certifications"><Certs data={data} /></LabelRowSky>}
          {hasProjectsContent(data) && (
            <LabelRowSky label="Projects">
              <ul className="space-y-1">{data.projects.map((pr) => <li key={pr.id}><span className="font-semibold">{pr.name}</span> — {pr.description}</li>)}</ul>
            </LabelRowSky>
          )}
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch bg-sky-50/50" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-04 Ice header + 2/3 + 1/3 ─── */
function Tpl04({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} bg-white ${p}`}>
      <div className="flex items-center gap-3 bg-sky-200/70 px-6 py-3">
        <span className="text-3xl font-bold text-sky-950">{initials(data.fullName)}</span>
        <h1 className="text-[29px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
      </div>
      <p className="border-b border-stone-200 px-6 py-2 text-center text-[15px] text-stone-600">{contacts(data)}</p>
      <div className="flex min-w-0 gap-0">
        <main className={`${x ? 'flex-[1.35]' : 'flex-[2]'} min-w-0 space-y-4 border-r border-stone-200 px-6 py-5`}>
          {hasSummaryContent(data) && (
            <section>
              <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Professional summary</h2>
              <p className="text-[16px] text-stone-700">{data.summary}</p>
            </section>
          )}
          {hasSkillsContent(data) && (
          <section>
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Relevant skills</h2>
            <ul className="list-disc space-y-0.5 pl-4 text-[16px]">
              {data.skills.flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean)).slice(0, 6).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
          )}
          {hasExperienceContent(data) && (
          <section>
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
            <Exp data={data} />
          </section>
          )}
        </main>
        <aside className="min-w-0 flex-1 space-y-4 bg-stone-50/80 px-5 py-5">
          {hasSkillsContent(data) && (
          <section>
            <h2 className="mb-1 text-[14px] font-bold uppercase text-stone-800">Professional skills</h2>
            <SkillsFlat data={data} columns={1} />
          </section>
          )}
          {hasEducationContent(data) && (
          <section>
            <h2 className="mb-1 text-[14px] font-bold uppercase text-stone-800">Education</h2>
            <Edu data={data} />
          </section>
          )}
          {hasCertificationsContent(data) && (
            <section>
              <h2 className="mb-1 text-[14px] font-bold uppercase text-stone-800">Certifications</h2>
              <Certs data={data} />
            </section>
          )}
        </aside>
        {x ? <ExtraColumnAside data={data} className="w-[21%] self-stretch bg-white" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-05 Tan banner ─── */
function Tpl05({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <div className={`${x ? 'w-[30%]' : 'w-[36%]'} shrink-0 space-y-4 bg-amber-100/90 px-5 py-6`}>
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-amber-950">Contact</h2>
          <div className="space-y-0.5 text-[15px] text-stone-800">
            {data.location && <p>{data.location}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.email && <p>{data.email}</p>}
          </div>
        </div>
        {hasSkillsContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-amber-950">Skills</h2>
          <ul className="list-disc space-y-0.5 pl-3 text-[15px]">
            {data.skills.flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean)).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        )}
        {hasEducationContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-amber-950">Education</h2>
          <Edu data={data} />
        </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="bg-amber-800 px-6 py-4">
            <h1 className="text-[31px] font-bold uppercase tracking-wide text-white">{data.fullName}</h1>
          </div>
          <div className="space-y-4 px-6 py-5">
            {hasSummaryContent(data) && (
              <section>
                <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Professional summary</h2>
                <p className="text-[16px] text-stone-700">{data.summary}</p>
              </section>
            )}
            {hasExperienceContent(data) && (
            <section>
              <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
              <Exp data={data} />
            </section>
            )}
            <Projects data={data} />
            <Certs data={data} />
          </div>
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch border-stone-200 bg-amber-50/60" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-06 Gold monogram + serif labels ─── */
function Tpl06({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex bg-white px-7 py-6 ${p}`}>
      <div className="min-w-0 flex-1">
        <header className="mb-4 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-amber-600 font-serif text-2xl font-bold text-amber-800">
            {initials(data.fullName)}
          </div>
          <div>
            <h1 className="font-serif text-[34px] font-bold uppercase tracking-wide text-stone-800">{data.fullName}</h1>
            <p className="mt-1 text-[15px] text-stone-600">{contacts(data)}</p>
          </div>
        </header>
        {hasSummaryContent(data) && <LabelRowSerifGold label="Professional summary">{data.summary}</LabelRowSerifGold>}
        {hasSkillsContent(data) && <LabelRowSerifGold label="Skills"><SkillsFlat data={data} columns={2} /></LabelRowSerifGold>}
        {hasExperienceContent(data) && <LabelRowSerifGold label="Work history"><Exp data={data} /></LabelRowSerifGold>}
        {hasEducationContent(data) && <LabelRowSerifGold label="Education"><Edu data={data} /></LabelRowSerifGold>}
        {hasCertificationsContent(data) && <LabelRowSerifGold label="Certifications"><Certs data={data} /></LabelRowSerifGold>}
        {hasProjectsContent(data) && (
          <LabelRowSerifGold label="Projects">
            <ul className="space-y-1">{data.projects.map((pr) => <li key={pr.id}>{pr.name}: {pr.description}</li>)}</ul>
          </LabelRowSerifGold>
        )}
      </div>
      {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch border-stone-200 font-serif" /> : null}
    </div>
  )
}

/* ─── tpl-07 Teal square + nav rail ─── */
function Tpl07({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex bg-white ${p}`}>
      <div className="min-w-0 flex-1">
        <header className="flex items-start gap-3 px-6 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-teal-500 text-lg font-bold text-teal-600">
            {initials(data.fullName)}
          </div>
          <div>
            <h1 className="text-[31px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
            <p className="mt-1 text-[15px] text-stone-600">{contacts(data)}</p>
          </div>
        </header>
        <div className="px-6 pb-5">
          {hasSummaryContent(data) && <LabelRowTeal label="Professional summary">{data.summary}</LabelRowTeal>}
          {hasSkillsContent(data) && <LabelRowTeal label="Summary of skills"><SkillsGrouped data={data} /></LabelRowTeal>}
          {hasExperienceContent(data) && <LabelRowTeal label="Work history"><Exp data={data} /></LabelRowTeal>}
          {hasEducationContent(data) && <LabelRowTeal label="Education"><Edu data={data} /></LabelRowTeal>}
          {hasCertificationsContent(data) && <LabelRowTeal label="Certifications"><Certs data={data} /></LabelRowTeal>}
        </div>
      </div>
      {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch bg-teal-50/40" /> : null}
    </div>
  )
}

/* ─── tpl-08 Clinical teal block header ─── */
function Tpl08({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <aside className={`${x ? 'w-[28%]' : 'w-[34%]'} shrink-0 space-y-4 bg-teal-50 px-5 py-6`}>
        {hasSkillsContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-teal-900">Skills</h2>
          <ul className="list-disc space-y-0.5 pl-3 text-[15px] text-stone-800">
            {data.skills.flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean)).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        )}
        {hasEducationContent(data) && (
        <div>
          <h2 className="mb-1 text-[14px] font-bold uppercase text-teal-900">Education</h2>
          <Edu data={data} />
        </div>
        )}
        {hasCertificationsContent(data) && (
          <div>
            <h2 className="mb-1 text-[14px] font-bold uppercase text-teal-900">Certifications</h2>
            <Certs data={data} />
          </div>
        )}
      </aside>
      <div className="flex min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="bg-teal-600 px-6 py-5 text-white">
            <h1 className="text-[29px] font-bold uppercase tracking-wide">{data.fullName}</h1>
            <div className="mt-2 space-y-0.5 text-[14px] opacity-95">
              {data.email && <p>✉ {data.email}</p>}
              {data.phone && <p>☎ {data.phone}</p>}
              {data.location && <p>📍 {data.location}</p>}
            </div>
          </div>
          <div className="space-y-4 px-6 py-5">
            {hasSummaryContent(data) && (
              <section>
                <h2 className="mb-1 text-[16px] font-bold uppercase text-teal-900">Professional summary</h2>
                <p className="text-[16px] text-stone-700">{data.summary}</p>
              </section>
            )}
            {hasExperienceContent(data) && (
            <section>
              <h2 className="mb-1 text-[16px] font-bold uppercase text-teal-900">Work history</h2>
              <Exp data={data} />
            </section>
            )}
          </div>
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[22%] self-stretch bg-stone-50" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-09 Timeline ─── */
function Tpl09({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const sections: { title: string; node: ReactNode }[] = []
  if (hasSummaryContent(data)) sections.push({ title: 'Professional summary', node: <p>{data.summary}</p> })
  if (hasExperienceContent(data)) sections.push({ title: 'Work history', node: <Exp data={data} /> })
  if (hasSkillsContent(data)) sections.push({ title: 'Skills', node: <SkillsFlat data={data} columns={2} /> })
  if (hasEducationContent(data)) sections.push({ title: 'Education', node: <Edu data={data} /> })
  if (hasCertificationsContent(data)) sections.push({ title: 'Certifications', node: <Certs data={data} /> })

  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} bg-white px-7 py-6 ${p}`}>
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-600 text-xl font-bold text-blue-700">
          {initials(data.fullName)}
        </div>
        <div>
          <h1 className="text-[34px] font-bold text-blue-700">{data.fullName}</h1>
          <p className="text-[15px] text-stone-600">{contacts(data)}{socials(data) ? ` · ${socials(data)}` : ''}</p>
        </div>
      </header>
      <div className={x ? 'flex items-stretch gap-2' : ''}>
        <div className={x ? 'min-w-0 flex-1' : ''}>
          <div className="relative pl-8">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-slate-300" />
            <div className="space-y-5">
              {sections.map((s) => (
                <div key={s.title} className="relative">
                  <span className="absolute -left-8 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white" />
                  <h2 className="text-[14px] font-bold uppercase tracking-wider text-blue-700">{s.title}</h2>
                  <div className="mt-1 text-[16px] text-stone-700">{s.node}</div>
                </div>
              ))}
            </div>
          </div>
          <Projects data={data} />
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch bg-slate-50/90" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-10 Minimal gray ─── */
function Tpl10({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex bg-white px-8 py-7 ${p}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-[34px] font-bold uppercase text-stone-900">{data.fullName}</h1>
        <p className="mt-1 text-[16px] text-stone-600">{contacts(data)}</p>
        {hasSummaryContent(data) && (
          <section className="mt-4">
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Professional summary</h2>
            <p className="text-[16px] text-stone-700">{data.summary}</p>
          </section>
        )}
        {hasExperienceContent(data) && (
        <section className="mt-4">
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Work history</h2>
          <Exp data={data} />
        </section>
        )}
        {hasSkillsContent(data) && (
        <section className="mt-4">
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Skills</h2>
          <SkillsFlat data={data} columns={2} />
        </section>
        )}
        {hasEducationContent(data) && (
        <section className="mt-4">
          <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Education</h2>
          <Edu data={data} />
        </section>
        )}
        {hasCertificationsContent(data) && (
          <section className="mt-4">
            <h2 className="mb-1 text-[16px] font-bold uppercase text-stone-900">Certifications</h2>
            <Certs data={data} />
          </section>
        )}
        <Projects data={data} />
      </div>
      {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch" /> : null}
    </div>
  )
}

/* ─── tpl-11 Blush top bar ─── */
function Tpl11({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} bg-white ${p}`}>
      <div className="bg-pink-400 px-6 py-2.5 text-center text-[15px] font-medium text-white">
        {contacts(data)}
      </div>
      <h1 className="py-6 text-center text-[34px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
      <div className={x ? 'flex items-stretch' : ''}>
        <div className={x ? 'min-w-0 flex-1 space-y-2 px-6 pb-7' : 'space-y-2 px-6 pb-7'}>
          {hasSummaryContent(data) && <LabelRowBlush label="Professional summary">{data.summary}</LabelRowBlush>}
          {hasExperienceContent(data) && <LabelRowBlush label="Work history"><Exp data={data} /></LabelRowBlush>}
          {hasSkillsContent(data) && <LabelRowBlush label="Skills"><SkillsFlat data={data} columns={3} /></LabelRowBlush>}
          {hasEducationContent(data) && <LabelRowBlush label="Education"><Edu data={data} /></LabelRowBlush>}
          {hasCertificationsContent(data) && <LabelRowBlush label="Certifications"><Certs data={data} /></LabelRowBlush>}
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch bg-pink-50/50" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-12 Turquoise frame initials + rail ─── */
function Tpl12({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex border border-slate-200 bg-white px-7 py-6 ${p}`}>
      <div className="min-w-0 flex-1">
        <header className="mb-4 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-teal-500 text-xl font-bold text-teal-600">
            {initials(data.fullName)}
          </div>
          <div>
            <h1 className="text-[31px] font-bold uppercase text-stone-900">{data.fullName}</h1>
            <p className="mt-1 text-[15px] text-stone-500">{contacts(data)}</p>
          </div>
        </header>
        {hasSummaryContent(data) && <LabelRowTealPlain label="Professional summary">{data.summary}</LabelRowTealPlain>}
        {hasExperienceContent(data) && <LabelRowTealPlain label="Work history"><Exp data={data} /></LabelRowTealPlain>}
        {hasSkillsContent(data) && <LabelRowTealPlain label="Skills"><SkillsFlat data={data} columns={2} /></LabelRowTealPlain>}
        {hasEducationContent(data) && <LabelRowTealPlain label="Education"><Edu data={data} /></LabelRowTealPlain>}
        {hasCertificationsContent(data) && <LabelRowTealPlain label="Certifications"><Certs data={data} /></LabelRowTealPlain>}
        {hasProjectsContent(data) && (
          <LabelRowTealPlain label="Projects">
            <ul className="space-y-1">{data.projects.map((pr) => <li key={pr.id}>{pr.name}: {pr.description}</li>)}</ul>
          </LabelRowTealPlain>
        )}
      </div>
      {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch border-teal-100 bg-teal-50/30" /> : null}
    </div>
  )
}

/* ─── tpl-13 Sky line timeline (reference: minimal vertical rail + hollow nodes) ─── */
function ProfileLinks({ data }: { data: ResumeData }) {
  const items: { label: string; url: string }[] = []
  if (data.website.trim()) items.push({ label: 'Website', url: data.website.replace(/^https?:\/\//, '') })
  if (data.linkedin.trim()) items.push({ label: 'LinkedIn', url: data.linkedin.replace(/^https?:\/\//, '') })
  if (data.github.trim()) items.push({ label: 'GitHub', url: data.github.replace(/^https?:\/\//, '') })
  if (items.length === 0) return null
  return (
    <ul className="list-disc space-y-1 pl-5 text-[16px] text-stone-700">
      {items.map((item) => (
        <li key={item.label}>
          <span className="font-medium text-stone-800">{item.label}: </span>
          {item.url}
        </li>
      ))}
    </ul>
  )
}

function ExpSkyLine({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[16px] font-bold text-stone-900">
              {ex.role}
              <span className="font-normal text-stone-600"> | {ex.company}</span>
            </span>
            <span className="shrink-0 text-[15px] text-stone-600">{ex.start} – {ex.end}</span>
          </div>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[16px] leading-relaxed text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function EduSkyLine({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-3">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[16px] text-stone-800">{ed.school}</span>
            <span className="shrink-0 text-[15px] text-stone-600">{ed.year}</span>
          </div>
          <p className="mt-0.5 text-[16px] font-bold text-stone-900">{ed.degree}</p>
        </li>
      ))}
    </ul>
  )
}

function Tpl13({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  const profiles = ProfileLinks({ data })
  const sections: { title: string; node: ReactNode }[] = []

  if (profiles) {
    sections.push({ title: 'Websites, portfolios, profiles', node: profiles })
  }
  if (hasSummaryContent(data)) {
    sections.push({
      title: 'Professional summary',
      node: <p className="text-justify leading-relaxed text-stone-800">{data.summary}</p>,
    })
  }
  if (hasSkillsContent(data)) sections.push({ title: 'Skills', node: <SkillsFlat data={data} columns={2} /> })
  if (hasExperienceContent(data)) sections.push({ title: 'Experience', node: <ExpSkyLine data={data} /> })
  if (hasEducationContent(data)) sections.push({ title: 'Education', node: <EduSkyLine data={data} /> })
  if (hasProjectsContent(data)) {
    sections.push({
      title: 'Projects',
      node: (
        <ul className="list-disc space-y-1 pl-5 text-[16px] text-stone-700">
          {data.projects.map((pr) => (
            <li key={pr.id}>
              <span className="font-semibold text-stone-900">{pr.name}: </span>
              {pr.description}
            </li>
          ))}
        </ul>
      ),
    })
  }
  if (hasCertificationsContent(data)) {
    sections.push({ title: 'Certifications', node: <Certs data={data} /> })
  }

  return (
    <div className={`${doc(variant)} bg-white ${p}`}>
      <div className={x ? 'flex items-stretch' : ''}>
        <div className={x ? 'min-w-0 flex-1 px-8 py-7' : 'px-8 py-7'}>
          <header className="mb-6">
            <h1 className="text-[29px] font-bold uppercase tracking-tight text-stone-800">{data.fullName}</h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{contacts(data)}</p>
          </header>

          <div className="relative pl-10">
            <div className="absolute bottom-0 left-[15px] top-0 w-px bg-sky-400 print:bg-sky-500" aria-hidden />
            <div className="space-y-6">
              {sections.map((s) => (
                <section key={s.title} className="relative">
                  <span
                    className="absolute -left-10 top-[5px] h-2.5 w-2.5 shrink-0 rounded-full border-2 border-sky-500 bg-white print:border-sky-600"
                    aria-hidden
                  />
                  <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] text-sky-500 print:text-sky-600">
                    {s.title}
                  </h2>
                  <div className="mt-2 text-[16px] text-stone-700">{s.node}</div>
                </section>
              ))}
            </div>
          </div>
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[24%] self-stretch border-sky-100 bg-sky-50/40" /> : null}
      </div>
    </div>
  )
}

function languagesBlock(data: ResumeData): ReactNode | null {
  const langGroups = data.skills.filter((s) => /language/i.test(s.title))
  const items = langGroups.flatMap((s) =>
    s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean),
  )
  if (items.length === 0) return null
  return (
    <ul className="list-disc space-y-1 pl-4 text-[16px] text-stone-800">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  )
}

function SidebarRuleTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase tracking-wide text-stone-900">
      {children}
    </h2>
  )
}

function MainRuleTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase tracking-wide text-stone-900">
      {children}
    </h2>
  )
}

function ExpKellyStyle({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <p className="text-[15px] text-stone-600">
            {ex.start} — {ex.end}
          </p>
          <p className="font-bold text-stone-900">{ex.role}</p>
          <p className="text-[16px] text-stone-700">{ex.company}</p>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[16px] text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function ExpTravisStyle({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <p className="text-[15px] font-bold uppercase leading-snug text-stone-900">
            {ex.role} at {ex.company}
          </p>
          <p className="text-[15px] font-bold text-stone-800">
            {ex.company}
            {', '}
            {ex.start} - {ex.end}
          </p>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[16px] text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function RowTravis({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.25rem_minmax(0,1fr)] gap-4 border-b border-stone-900 py-3">
      <div className="relative pt-1">
        <div className="absolute left-0 top-0 h-0.5 w-7 bg-pink-400" />
        <h2 className="text-[14px] font-bold uppercase leading-tight text-stone-900">{label}</h2>
      </div>
      <div className="min-w-0 text-[16px] text-stone-800">{children}</div>
    </div>
  )
}

function ExpHarbor({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <p className="font-bold text-stone-900">
            {ex.role} — {ex.company}
          </p>
          <p className="text-[15px] italic text-stone-600">
            {ex.start} · {ex.end}
          </p>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[16px] text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function EduHarbor({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-3">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <p className="font-bold text-stone-900">{ed.school}</p>
          <p className="text-[15px] italic text-stone-600">{ed.year}</p>
          <p className="font-bold text-stone-900">{ed.degree}</p>
        </li>
      ))}
    </ul>
  )
}

function ExpMiller({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-bold text-stone-900">
              {ex.role}, {ex.company}
            </span>
            <span className="shrink-0 text-[15px] text-stone-600">
              {ex.start} — {ex.end}
            </span>
          </div>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[16px] text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function EduMiller({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-3">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-bold text-stone-900">
              {ed.degree}, {ed.school}
            </span>
            <span className="shrink-0 text-[15px] text-stone-600">{ed.year}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ExpSerifClassic({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-4">
      {data.experience.map((ex) => (
        <li key={ex.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[16px] font-bold italic text-stone-900">{ex.role}</span>
            <span className="shrink-0 text-[15px] font-bold italic text-stone-800">
              {ex.start} — {ex.end}
            </span>
          </div>
          <p className="text-[16px] text-stone-800">{ex.company}</p>
          {ex.bullets.filter(Boolean).length > 0 ? (
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[16px] text-stone-700">
              {ex.bullets.filter(Boolean).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function EduSerifClassic({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-3">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[16px] font-bold italic text-stone-900">{ed.school}</span>
            <span className="shrink-0 text-[15px] font-bold italic text-stone-800">{ed.year}</span>
          </div>
          <p className="text-[16px] text-stone-800">
            {ed.degree}
          </p>
        </li>
      ))}
    </ul>
  )
}

function EduKellyRight({ data }: { data: ResumeData }) {
  return (
    <ul className="space-y-3">
      {data.education.map((ed) => (
        <li key={ed.id}>
          <p className="text-[15px] text-stone-600">{ed.year}</p>
          <p className="font-bold text-stone-900">{ed.degree}</p>
          <p className="text-[16px] text-stone-700">{ed.school}</p>
        </li>
      ))}
    </ul>
  )
}

function skillsFlatExcludingLang(data: ResumeData) {
  return data.skills
    .filter((s) => !/language/i.test(s.title))
    .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
}

/* ─── tpl-14 Kelly-style gray sidebar ─── */
function Tpl14({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <aside className={`${x ? 'w-[30%]' : 'w-[34%]'} shrink-0 space-y-4 bg-stone-200/95 px-5 py-6`}>
        <div>
          <h1 className="text-[24px] font-bold uppercase leading-tight tracking-tight text-stone-800">{data.fullName}</h1>
          {data.headline && <p className="mt-1 text-[15px] text-stone-700">{data.headline}</p>}
        </div>
        <div>
          <SidebarRuleTitle>Details</SidebarRuleTitle>
          <ul className="space-y-2 text-[15px] text-stone-800">
            {data.email && (
              <li className="flex gap-2">
                <span className="shrink-0 opacity-70" aria-hidden>✉</span>
                <span className="break-all">{data.email}</span>
              </li>
            )}
            {data.phone && (
              <li className="flex gap-2">
                <span className="shrink-0 opacity-70" aria-hidden>☎</span>
                <span>{data.phone}</span>
              </li>
            )}
            {data.location && (
              <li className="flex gap-2">
                <span className="shrink-0 opacity-70" aria-hidden>📍</span>
                <span>{data.location}</span>
              </li>
            )}
          </ul>
        </div>
        {hasSkillsContent(data) && (
        <div>
          <SidebarRuleTitle>Skills</SidebarRuleTitle>
          <ul className="list-disc space-y-1 pl-4 text-[16px] text-stone-800">
            {data.skills
              .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
              .map((s, i) => (
                <li key={i}>{s}</li>
              ))}
          </ul>
        </div>
        )}
      </aside>
      <main className="min-w-0 flex-1 space-y-4 bg-white px-6 py-6">
        {hasSummaryContent(data) && (
          <section>
            <MainRuleTitle>Summary</MainRuleTitle>
            <p className="text-[16px] leading-relaxed text-stone-800">{data.summary}</p>
          </section>
        )}
        {hasExperienceContent(data) && (
        <section>
          <MainRuleTitle>Experience</MainRuleTitle>
          <ExpKellyStyle data={data} />
        </section>
        )}
        {hasEducationContent(data) && (
        <section>
          <MainRuleTitle>Education</MainRuleTitle>
          <EduKellyRight data={data} />
        </section>
        )}
        <Projects data={data} />
        {hasCertificationsContent(data) ? (
          <section>
            <MainRuleTitle>Certifications</MainRuleTitle>
            <Certs data={data} />
          </section>
        ) : null}
      </main>
      {x ? <ExtraColumnAside data={data} className="w-[22%] self-stretch border-stone-200 bg-stone-50/90" /> : null}
    </div>
  )
}

/* ─── tpl-15 Travis-style pink accents ─── */
function Tpl15({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  return (
    <div className={`${doc(variant)} bg-white ${p}`}>
      <div className="bg-pink-200 px-6 py-2.5 text-center text-[15px] leading-relaxed text-stone-900">
        {data.location && <p>{data.location}</p>}
        {(data.phone || data.email) && (
          <p>{[data.phone, data.email].filter(Boolean).join(' | ')}</p>
        )}
      </div>
      <h1 className="px-6 pt-6 text-center text-[31px] font-bold uppercase tracking-wide text-stone-900">{data.fullName}</h1>
      {data.headline && <p className="pb-5 text-center text-[16px] text-stone-700">{data.headline}</p>}
      <div className={x ? 'flex items-stretch' : ''}>
        <div className={x ? 'min-w-0 flex-1 px-6 pb-6' : 'px-6 pb-6'}>
          {hasSummaryContent(data) && <RowTravis label="Summary"><p className="leading-relaxed">{data.summary}</p></RowTravis>}
          {hasSkillsContent(data) && (
          <RowTravis label="Skills">
            <SkillsFlat data={data} columns={2} />
          </RowTravis>
          )}
          {hasExperienceContent(data) && (
          <RowTravis label="Experience">
            <ExpTravisStyle data={data} />
          </RowTravis>
          )}
          {hasEducationContent(data) && (
          <RowTravis label="Education">
            <EduSerifClassic data={data} />
          </RowTravis>
          )}
          {hasCertificationsContent(data) && (
            <RowTravis label="Certs">
              <Certs data={data} />
            </RowTravis>
          )}
        </div>
        {x ? <ExtraColumnAside data={data} className="w-[22%] self-stretch bg-pink-50/60" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-16 Blue-grey header + split body ─── */
function Tpl16({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  const asideEduSkills = hasEducationContent(data) || hasSkillsContent(data)
  return (
    <div className={`${doc(variant)} flex flex-col bg-white ${p}`}>
      <div className={`grid min-w-0 gap-5 bg-slate-200/90 px-6 py-5 ${hasSummaryContent(data) ? 'md:grid-cols-2 md:gap-8' : ''}`}>
        <div className="min-w-0">
          <h1 className="text-[29px] font-bold text-stone-900">{data.fullName}</h1>
          {data.headline && <p className="mt-0.5 text-[16px] font-medium text-stone-700">{data.headline}</p>}
          <ul className="mt-3 space-y-1 text-[15px] text-stone-800">
            {data.email && (
              <li className="flex gap-2">
                <span className="opacity-70">✉</span>
                {data.email}
              </li>
            )}
            {data.phone && (
              <li className="flex gap-2">
                <span className="opacity-70">☎</span>
                {data.phone}
              </li>
            )}
            {data.location && (
              <li className="flex gap-2">
                <span className="opacity-70">📍</span>
                {data.location}
              </li>
            )}
          </ul>
        </div>
        {hasSummaryContent(data) && (
          <div className="min-w-0">
            <h2 className="mb-2 border-b border-slate-400/80 pb-1 text-[14px] font-bold uppercase tracking-wide text-stone-900">
              Summary
            </h2>
            <p className="text-[16px] leading-relaxed text-stone-800">{data.summary}</p>
          </div>
        )}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1">
        {asideEduSkills ? (
        <aside className="w-[34%] shrink-0 border-r border-stone-300 px-5 py-5">
          {hasEducationContent(data) && (
            <>
              <h2 className="mb-2 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase text-stone-900">Education</h2>
              <EduHarbor data={data} />
            </>
          )}
          {hasSkillsContent(data) && (
            <>
              <h2 className={`mb-2 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase text-stone-900 ${hasEducationContent(data) ? 'mt-5' : ''}`}>Skills</h2>
              <ul className="list-disc space-y-1 pl-4 text-[16px] text-stone-800">
                {data.skills
                  .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
                  .map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
              </ul>
            </>
          )}
        </aside>
        ) : null}
        <main className="min-w-0 flex-1 px-6 py-5">
          {hasExperienceContent(data) && (
            <>
              <h2 className="mb-2 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase text-stone-900">Experience</h2>
              <ExpHarbor data={data} />
            </>
          )}
          <Projects data={data} />
          {hasCertificationsContent(data) ? (
            <>
              <h2 className="mb-2 mt-5 border-b border-stone-300 pb-1 text-[14px] font-bold uppercase text-stone-900">
                Certifications
              </h2>
              <Certs data={data} />
            </>
          ) : null}
        </main>
        {x ? <ExtraColumnAside data={data} className="w-[20%] shrink-0 self-stretch border-l border-stone-200 bg-slate-50/80" /> : null}
      </div>
    </div>
  )
}

/* ─── tpl-17 James Miller: grey rail + navy band ─── */
function Tpl17({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  const langs = languagesBlock(data)
  return (
    <div className={`${doc(variant)} flex ${p}`}>
      <aside className={`${x ? 'w-[28%]' : 'w-[30%]'} shrink-0 space-y-4 bg-stone-200/95 px-5 py-6`}>
        <Photo data={data} />
        <div>
          <SidebarRuleTitle>Details</SidebarRuleTitle>
          <ul className="space-y-2 text-[15px] text-stone-800">
            {data.email && (
              <li className="flex gap-2">
                <span className="opacity-70">✉</span>
                <span className="break-all">{data.email}</span>
              </li>
            )}
            {data.location && (
              <li className="flex gap-2">
                <span className="opacity-70">📍</span>
                <span>{data.location}</span>
              </li>
            )}
            {data.phone && (
              <li className="flex gap-2">
                <span className="opacity-70">☎</span>
                <span>{data.phone}</span>
              </li>
            )}
          </ul>
        </div>
        {hasSkillsExcludingLanguagesContent(data) && (
        <div>
          <SidebarRuleTitle>Skills</SidebarRuleTitle>
          <ul className="list-disc space-y-1 pl-4 text-[16px] text-stone-800">
            {skillsFlatExcludingLang(data)
              .slice(0, 10)
              .map((s, i) => (
                <li key={i}>{s}</li>
              ))}
          </ul>
        </div>
        )}
        {langs ? (
          <div>
            <SidebarRuleTitle>Languages</SidebarRuleTitle>
            {langs}
          </div>
        ) : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="bg-[#001f3f] px-8 py-6 text-white">
          <h1 className="text-[30px] font-bold uppercase tracking-tight">{data.fullName}</h1>
          {data.headline && <p className="mt-1 text-[16px] font-normal text-blue-100">{data.headline}</p>}
        </div>
        <div className="space-y-4 px-8 py-6">
          {hasSummaryContent(data) && (
            <section>
              <MainRuleTitle>Summary</MainRuleTitle>
              <p className="text-[16px] leading-relaxed text-stone-800">{data.summary}</p>
            </section>
          )}
          {hasExperienceContent(data) && (
          <section>
            <MainRuleTitle>Experience</MainRuleTitle>
            <ExpMiller data={data} />
          </section>
          )}
          {hasEducationContent(data) && (
          <section>
            <MainRuleTitle>Education</MainRuleTitle>
            <EduMiller data={data} />
          </section>
          )}
          <Projects data={data} />
        </div>
      </div>
      {x ? <ExtraColumnAside data={data} className="w-[18%] shrink-0 self-stretch border-stone-200 bg-stone-100/80" /> : null}
    </div>
  )
}

/* ─── tpl-18 Beige header + serif columns ─── */
function Tpl18({ data, variant }: { data: ResumeData; variant: Variant }) {
  const p = pSize()
  const x = extraColumnActive(data)
  const asideSummarySkills = hasSummaryContent(data) || hasSkillsContent(data)
  return (
    <div className={`${doc(variant)} bg-white font-serif ${p}`}>
      <header className="flex gap-4 bg-amber-100/85 px-6 py-5">
        <Photo data={data} />
        <div className="min-w-0">
          <h1 className="text-[29px] font-bold text-stone-900">{data.fullName}</h1>
          {data.headline && <p className="mt-0.5 text-[16px] font-bold text-stone-800">{data.headline}</p>}
          <div className="mt-2 space-y-0.5 text-[15px] text-stone-800">
            {data.location && <p>{data.location}</p>}
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
          </div>
        </div>
      </header>
      <div className="flex items-stretch">
        {asideSummarySkills ? (
        <aside className="w-[38%] shrink-0 border-r border-stone-300 px-5 py-5">
          {hasSummaryContent(data) && (
            <section className="mb-5">
              <h2 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-stone-900 underline decoration-stone-900 underline-offset-4">
                Summary
              </h2>
              <p className="text-[16px] leading-relaxed text-stone-800">{data.summary}</p>
            </section>
          )}
          {hasSkillsContent(data) && (
          <section>
            <h2 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-stone-900 underline decoration-stone-900 underline-offset-4">
              Skills
            </h2>
            <ul className="list-disc space-y-1 pl-4 text-[16px] text-stone-800">
              {data.skills
                .flatMap((s) => s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean))
                .map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
            </ul>
          </section>
          )}
        </aside>
        ) : null}
        <main className="min-w-0 flex-1 px-6 py-5">
          {hasExperienceContent(data) && (
          <section className="mb-5">
            <h2 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-stone-900 underline decoration-stone-900 underline-offset-4">
              Experience
            </h2>
            <ExpSerifClassic data={data} />
          </section>
          )}
          {hasEducationContent(data) && (
          <section>
            <h2 className="mb-2 text-[14px] font-bold uppercase tracking-wide text-stone-900 underline decoration-stone-900 underline-offset-4">
              Education
            </h2>
            <EduSerifClassic data={data} />
          </section>
          )}
          <div className="mt-5">
            <Projects data={data} />
          </div>
        </main>
        {x ? <ExtraColumnAside data={data} className="w-[18%] shrink-0 self-stretch border-l border-amber-200/60 bg-amber-50/40" /> : null}
      </div>
    </div>
  )
}

const TEMPLATES = [Tpl00, Tpl01, Tpl02, Tpl03, Tpl04, Tpl05, Tpl06, Tpl07, Tpl08, Tpl09, Tpl10, Tpl11, Tpl12, Tpl13, Tpl14, Tpl15, Tpl16, Tpl17, Tpl18] as const

/**
 * Reference layouts (tpl-00 … tpl-18).
 */
export function GalleryResume({ data, variant, index }: { data: ResumeData; variant: Variant; index: number }) {
  const max = TEMPLATES.length - 1
  const i = Math.min(max, Math.max(0, index))
  const Cmp = TEMPLATES[i] ?? Tpl00
  return <Cmp data={data} variant={variant} />
}
