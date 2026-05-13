import { useEffect, useMemo, useRef, useState } from 'react'
import { generateCoverLetter } from '../lib/coverLetter'
import { saveApplication } from '../lib/fetchJobs'
import type { ApplicationStatus, Job } from '../lib/fetchJobs'
import type { ResumeData } from '../types/resume'

type Tab = 'guide' | 'cover' | 'resume' | 'track'

export function ApplyModal({
  job,
  data,
  onClose,
  onApplied,
}: {
  job: Job
  data: ResumeData
  onClose: () => void
  onApplied: () => void
}) {
  const [tab, setTab] = useState<Tab>('guide')
  const [copied, setCopied] = useState<string | null>(null)
  const [status, setStatus] = useState<ApplicationStatus>('applied')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(0) // guided steps 0-3
  const backdropRef = useRef<HTMLDivElement>(null)

  const coverLetter = useMemo(() => generateCoverLetter(data, job), [data, job])

  function onBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2500)
  }

  function handleApply() {
    saveApplication({
      jobId: job.id, jobTitle: job.title, company: job.company,
      jobUrl: job.url, status, appliedAt: new Date().toISOString(), notes,
    })
    window.open(job.url, '_blank', 'noopener,noreferrer')
    onApplied()
    onClose()
  }

  const resumeSummary = [
    data.fullName && `Name: ${data.fullName}`,
    data.headline && `Title: ${data.headline}`,
    data.email && `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`,
    data.location && `Location: ${data.location}`,
    data.linkedin && `LinkedIn: ${data.linkedin}`,
    data.github && `GitHub: ${data.github}`,
    '',
    data.summary && `SUMMARY\n${data.summary}`,
    '',
    data.experience.length > 0 && `EXPERIENCE\n${data.experience.map((ex) =>
      `${ex.role} at ${ex.company} (${ex.start} – ${ex.end})\n${ex.bullets.filter(Boolean).map((b) => `• ${b}`).join('\n')}`
    ).join('\n\n')}`,
    '',
    data.education.length > 0 && `EDUCATION\n${data.education.map((ed) => `${ed.degree} — ${ed.school} (${ed.year})`).join('\n')}`,
    '',
    data.skills.length > 0 && `SKILLS\n${data.skills.map((s) => `${s.title}: ${s.skills}`).join('\n')}`,
  ].filter(Boolean).join('\n')

  /* ─── Step definitions ──────────────────────────────────────────── */
  const STEPS = [
    {
      num: 1,
      title: 'Copy your cover letter',
      desc: 'We generate a tailored cover letter for this exact role. Copy it now.',
      action: (
        <button
          type="button"
          onClick={() => { copy(coverLetter, 'step1'); setStep(1) }}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
            copied === 'step1' || step >= 1
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {copied === 'step1' || step >= 1 ? (
            <><svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Copy Cover Letter</>
          )}
        </button>
      ),
    },
    {
      num: 2,
      title: 'Copy your resume details',
      desc: 'Copy your formatted resume — paste it into "Work History" / "Experience" fields on the application form.',
      action: (
        <button
          type="button"
          onClick={() => { copy(resumeSummary, 'step2'); setStep(Math.max(step, 2)) }}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
            copied === 'step2' || step >= 2
              ? 'bg-green-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {copied === 'step2' || step >= 2 ? (
            <><svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Copy Resume Details</>
          )}
        </button>
      ),
    },
    {
      num: 3,
      title: 'Open the application page',
      desc: `Click below to open the ${job.company} application page. Paste your cover letter and resume details into the form fields.`,
      action: (
        <button
          type="button"
          onClick={() => { setStep(Math.max(step, 3)); window.open(job.url, '_blank', 'noopener,noreferrer') }}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Open {job.company} Application →
        </button>
      ),
    },
    {
      num: 4,
      title: 'Mark as applied',
      desc: 'After submitting the form, save the application to your tracker so you can follow up.',
      action: (
        <button
          type="button"
          onClick={handleApply}
          className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-500"
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          I Applied — Save to Tracker
        </button>
      ),
    },
  ]

  return (
    <div
      ref={backdropRef}
      onClick={onBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
    >
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">Apply to</p>
            <h2 className="mt-0.5 truncate text-base font-bold text-slate-900">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
          </div>
          <button type="button" onClick={onClose} className="mt-0.5 shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          {([
            ['guide',  'How to Apply'],
            ['cover',  'Cover Letter'],
            ['resume', 'Resume Data'],
            ['track',  'Tracker'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`shrink-0 -mb-px border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── HOW TO APPLY (step-by-step) ── */}
          {tab === 'guide' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Follow these 4 steps to complete your application in under 2 minutes.</p>
              {STEPS.map((s, idx) => (
                <div
                  key={s.num}
                  className={`rounded-2xl border p-4 transition-all ${
                    idx <= step
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      idx < step ? 'bg-green-500 text-white' : idx === step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {idx < step ? '✓' : s.num}
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-600">{s.desc}</p>
                      {idx <= step && s.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── COVER LETTER ── */}
          {tab === 'cover' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Personalised to this role. Edit before sending.</p>
                <button type="button" onClick={() => copy(coverLetter, 'cover')}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied === 'cover'
                    ? <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Copy</>
                  }
                </button>
              </div>
              <pre className="min-h-[280px] whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 font-sans">{coverLetter}</pre>
            </div>
          )}

          {/* ── RESUME DATA ── */}
          {tab === 'resume' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Formatted for pasting into application forms.</p>
                <button type="button" onClick={() => copy(resumeSummary, 'resume')}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied === 'resume'
                    ? <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Copy</>
                  }
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 font-sans">{resumeSummary}</pre>
            </div>
          )}

          {/* ── TRACK ── */}
          {tab === 'track' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Application status</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {(['saved','applied','interviewing','rejected','offer'] as ApplicationStatus[]).map((val) => (
                    <button key={val} type="button" onClick={() => setStatus(val)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                        status === val ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                      }`}
                    >{val}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                  placeholder="Recruiter name, interview date, salary discussed…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15 resize-none"
                />
              </div>
              <button type="button" onClick={handleApply}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-500"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Save & Open Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
