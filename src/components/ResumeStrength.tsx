import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AtsChangeSummary } from './AtsChangeSummary'
import { scoreResume } from '../lib/scoreResume'
import type { CheckResult, ResumeScore, ScoreCategory } from '../lib/scoreResume'
import type { ResumeData } from '../types/resume'

/* ─── colour palette per category ─────────────────────────────────── */
const CAT: Record<
  ScoreCategory,
  { label: string; ring: string; text: string; badge: string; track: string }
> = {
  excellent: {
    label: 'Excellent',
    ring: '#16a34a',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    track: '#dcfce7',
  },
  good: {
    label: 'Strong',
    ring: '#2563eb',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    track: '#dbeafe',
  },
  fair: {
    label: 'Fair',
    ring: '#d97706',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    track: '#fef3c7',
  },
  weak: {
    label: 'Needs work',
    ring: '#dc2626',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    track: '#fee2e2',
  },
}

/* ─── SVG circular progress ring ──────────────────────────────────── */
function ScoreRing({ score, category }: { score: number; category: ScoreCategory }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const filled = circ * (score / 100)
  const { ring, track } = CAT[category]
  return (
    <svg width={110} height={110} viewBox="0 0 110 110" className="shrink-0">
      {/* track */}
      <circle cx="55" cy="55" r={r} fill="none" stroke={track} strokeWidth="9" />
      {/* progress */}
      <circle
        cx="55"
        cy="55"
        r={r}
        fill="none"
        stroke={ring}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="800" fill={ring}>
        {score}
      </text>
      <text x="55" y="64" textAnchor="middle" fontSize="9" fill="#6b7280">
        ATS · /100
      </text>
    </svg>
  )
}

/* ─── Single check row ─────────────────────────────────────────────── */
function CheckRow({
  check,
  open,
  onToggle,
}: {
  check: CheckResult
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
        onClick={onToggle}
      >
        {/* icon */}
        {check.passed ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        )}

        {/* label + partial points */}
        <span className="flex-1 text-xs font-medium text-slate-800">{check.label}</span>
        <span className={`shrink-0 text-[10px] font-semibold ${check.passed ? 'text-green-600' : 'text-slate-400'}`}>
          {check.earned}/{check.points}
        </span>

        {/* chevron */}
        {!check.passed && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* tip (only for failed checks) */}
      {!check.passed && open && (
        <div className="border-t border-slate-100 px-3.5 pb-3 pt-2">
          <p className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-semibold text-amber-700">Tip: </span>
            {check.tip}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Bar breakdown ────────────────────────────────────────────────── */
function ScoreBar({ score, category }: { score: ResumeScore; category: ScoreCategory }) {
  const { ring } = CAT[category]
  const sections = [
    { label: 'Weak', max: 45, color: '#ef4444' },
    { label: 'Fair', max: 70, color: '#f59e0b' },
    { label: 'Strong', max: 85, color: '#3b82f6' },
    { label: 'Excellent', max: 100, color: '#16a34a' },
  ]
  return (
    <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score.total}%`, background: ring }}
      />
      {/* tick marks */}
      {sections.slice(0, -1).map((s) => (
        <div
          key={s.max}
          className="absolute top-0 h-full w-px bg-white/70"
          style={{ left: `${s.max}%` }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════════ */
/** Shown in the builder until the user replaces sample content or imports a résumé. */
export function ResumeStrengthPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">ATS score</p>
      <p className="mt-2 text-sm text-slate-600">
        Your ATS score appears once you add <span className="font-medium text-slate-800">your own</span> details or{' '}
        <span className="font-medium text-slate-800">upload a résumé</span> on the{' '}
        <Link to="/ats" className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500">
          ATS score
        </Link>{' '}
        page. Starter sample text is only for previewing templates.
      </p>
    </div>
  )
}

export function ResumeStrength({ data }: { data: ResumeData }) {
  const score = useMemo(() => scoreResume(data), [data])
  const cat = CAT[score.category]

  const [expanded, setExpanded] = useState(true)

  const failed = score.checks.filter((c: CheckResult) => !c.passed)
  const passed = score.checks.filter((c: CheckResult) => c.passed)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setExpanded((v: boolean) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">ATS score</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.badge}`}>
            {cat.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${cat.text}`}>{score.total}%</span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 px-5 pb-5 pt-4 space-y-4">

          {/* Ring + summary */}
          <div className="flex items-center gap-5">
            <ScoreRing score={score.total} category={score.category} />
            <div className="flex-1 space-y-2">
              <div>
                <p className={`text-lg font-bold ${cat.text}`}>{cat.label}</p>
                <p className="text-xs text-slate-500">
                  {failed.length === 0
                    ? 'Outstanding — your resume is in great shape!'
                    : `Scroll down for “Add or fix” — ${failed.length} area${failed.length > 1 ? 's' : ''} to improve.`}
                </p>
              </div>
              <ScoreBar score={score} category={score.category} />
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" />Weak</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Fair</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />Strong</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" />Excellent</span>
              </div>
            </div>
          </div>

          {/* Clear change list (ATS / recruiter fixes) */}
          {failed.length > 0 && <AtsChangeSummary failed={failed} variant="builder" />}

          {/* Passed checks */}
          {passed.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-wide text-slate-400 group-open:text-slate-600">
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-open:rotate-90 transition-transform">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Completed · {passed.length}
                </span>
              </summary>
              <div className="mt-1.5 space-y-1.5">
                {passed.map((c: CheckResult) => (
                  <CheckRow key={c.id} check={c} open={false} onToggle={() => {}} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
