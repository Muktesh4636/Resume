import { Link } from 'react-router-dom'

/**
 * Plain-language list of what the user should literally add or fix (per check id).
 * Shown first so it’s obvious before scrolling into tips.
 */
const WHAT_TO_ADD: Record<string, string> = {
  contact:
    'Your full name, professional email, phone (with area/country code), city + state or country (or “Remote”), and a one-line headline that states your target role.',
  summary:
    'A “Professional summary” (or Profile) of about 60–100 words: your specialty, scope or years of experience, and two or three concrete strengths or domains.',
  exp_present:
    'At least one role under Experience: employer, job title, and dates (months/years or year range).',
  exp_bullets:
    'Under every job, at least two bullets that describe results and scope—not only a list of duties.',
  bullets:
    'More achievement bullets across your roles (aim for 10+ total; often 3–5 per recent job).',
  quantified:
    'Measurable outcomes in at least half of your bullets: percentages, dollar amounts, team size, volume, time saved, users, latency, revenue, etc.',
  impact_verbs:
    'Bullet lines that start with strong verbs (e.g. Led, Built, Delivered, Reduced, Grew, Launched)—not “Responsible for” or vague openings.',
  skills:
    'A dedicated skills area with concrete tools and technologies, grouped into three or more categories (e.g. Languages, Frameworks, Cloud, Practices).',
  education:
    'An Education section: institution, degree or program name, and graduation year—or “Expected” if still enrolled.',
  links:
    'At least two profile URLs recruiters can open—commonly LinkedIn plus GitHub or a personal portfolio/site.',
  projects:
    'At least one project with a short outcome-focused description and, if helpful, tech used or a link.',
}

/** Map each check id → where the user edits (builder) or what to fix in the file (upload). */
const WHERE_TO_EDIT: Record<string, string> = {
  contact:
    'Builder: Profile block (name, email, phone, location, headline). File: same items in the top third of page one.',
  summary:
    'Builder: “Professional summary” field. File: a Summary / Profile / Objective paragraph after contact info.',
  exp_present:
    'Builder: Work experience — add at least one role with company, title, and dates. File: an Experience / Work history section.',
  exp_bullets:
    'Builder: Under each job, add bullets in the bullet list. File: lines starting with •, -, or * under each role.',
  bullets:
    'Builder: Add bullets under each experience entry. File: more bullet lines under roles in your Experience section.',
  quantified:
    'Builder: Edit experience bullets. File: rewrite bullet text in place on your PDF/source document.',
  impact_verbs:
    'Builder: First few words of each bullet. File: same—rewrite the start of each bullet line.',
  skills:
    'Builder: Skills — add groups and comma-separated skills. File: a “Skills” heading plus lists or grouped lines.',
  education:
    'Builder: Education entries. File: “Education” with school, degree, year.',
  links:
    'Builder: LinkedIn, GitHub, Website fields. File: full URLs near contact info.',
  projects:
    'Builder: Projects section. File: “Projects” with name + short description (+ optional URL).',
}

export type AtsFailedCheck = { id: string; label: string; tip: string }

type Variant = 'builder' | 'upload'

export function AtsChangeSummary({ failed, variant = 'builder' }: { failed: AtsFailedCheck[]; variant?: Variant }) {
  if (failed.length === 0) return null

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white px-4 py-4 shadow-sm">
      <h3 className="text-base font-bold text-amber-950">What you need to add or fix</h3>
      <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
        Each item starts with the exact content to add. Use the explanation for detail, then use “Where to edit” for builder vs file.
      </p>

      <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-800">Focus on these {failed.length} areas</p>
        <p className="mt-1 text-xs font-medium leading-snug text-slate-900">
          {failed.map((c) => c.label).join(' · ')}
        </p>
      </div>

      <ol className="mt-4 list-none space-y-4">
        {failed.map((c, i) => (
          <li key={c.id} className="flex gap-3 border-b border-amber-100 pb-4 last:border-0 last:pb-0">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-sm"
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-slate-900">{c.label}</p>

              <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/90 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-800">Add or fix</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-900">{WHAT_TO_ADD[c.id] ?? c.tip}</p>
              </div>

              <div className="rounded-lg bg-white/90 px-3 py-2 ring-1 ring-slate-200/90">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Explanation</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{c.tip}</p>
              </div>

              {WHERE_TO_EDIT[c.id] && (
                <p className="text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">Where to edit: </span>
                  {WHERE_TO_EDIT[c.id]}
                  {variant === 'upload' && (
                    <span className="block pt-1 text-[11px] text-slate-500">
                      Uploaded files: change the source document (Word, Google Docs, etc.), export a new PDF, and upload again—or copy fixes into the builder.
                    </span>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-col gap-2 border-t border-amber-200/80 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        {variant === 'builder' ? (
          <Link
            to="/builder"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Open builder to add these items →
          </Link>
        ) : (
          <>
            <Link
              to="/builder"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Open builder (easiest: structured fields) →
            </Link>
            <p className="text-[11px] text-slate-600 sm:max-w-[300px]">
              Or edit the same items in your original file, then upload the updated PDF here.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
