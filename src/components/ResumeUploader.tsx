import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { AtsChangeSummary } from './AtsChangeSummary'
import { extractTextFromFile } from '../lib/extractText'
import { scoreResumeFromText } from '../lib/scoreFromText'
import type { TextCheckResult, TextResumeScore } from '../lib/scoreFromText'

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; score: TextResumeScore; fileName: string; text: string }
  | { status: 'error'; message: string }

type ScoreCat = TextResumeScore['category']

/* ─── colour palette (same as ResumeStrength) ────────────────────── */
const CAT: Record<
  ScoreCat,
  { label: string; ring: string; text: string; badge: string; track: string }
> = {
  excellent: { label: 'Excellent',   ring: '#16a34a', text: 'text-green-700', badge: 'bg-green-100 text-green-800', track: '#dcfce7' },
  good:      { label: 'Strong',      ring: '#2563eb', text: 'text-blue-700',  badge: 'bg-blue-100 text-blue-800',   track: '#dbeafe' },
  fair:      { label: 'Fair',        ring: '#d97706', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', track: '#fef3c7' },
  weak:      { label: 'Needs work',  ring: '#dc2626', text: 'text-red-700',   badge: 'bg-red-100 text-red-800',     track: '#fee2e2' },
}

function ScoreRing({ score, category }: { score: number; category: ScoreCat }) {
  const r = 44; const circ = 2 * Math.PI * r
  const { ring, track } = CAT[category]
  return (
    <svg width={110} height={110} viewBox="0 0 110 110" className="shrink-0">
      <circle cx="55" cy="55" r={r} fill="none" stroke={track} strokeWidth="9" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={ring} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${circ * (score / 100)} ${circ}`} strokeDashoffset={circ / 4}
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="800" fill={ring}>{score}</text>
      <text x="55" y="64" textAnchor="middle" fontSize="9" fill="#6b7280">ATS · /100</text>
    </svg>
  )
}

export function ResumeUploader() {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [showText, setShowText] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setState({ status: 'loading' })
    try {
      const text = await extractTextFromFile(file)
      if (text.trim().length < 50) throw new Error('Could not extract readable text. Try a text-selectable PDF.')
      const score = scoreResumeFromText(text)
      setState({ status: 'done', score, fileName: file.name, text })
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  /* ─── idle / drop zone ──────────────────────────────────────────── */
  if (state.status === 'idle' || state.status === 'error') {
    return (
      <div className="space-y-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={onInputChange} />
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-indigo-500">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 2v6h6M12 11v6M9 14l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800">Drop your resume here or click to browse</p>
          <p className="mt-1 text-xs text-slate-500">Supports PDF and plain-text (.txt) files</p>
        </div>
        {state.status === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Error: </span>{state.message}
          </div>
        )}
        <p className="text-center text-xs text-slate-400">
          Your file is processed entirely in your browser — nothing is uploaded to any server.
        </p>
      </div>
    )
  }

  /* ─── loading ───────────────────────────────────────────────────── */
  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
        <svg className="h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
        <p className="text-sm font-medium">Extracting text and analysing…</p>
      </div>
    )
  }

  /* ─── results ───────────────────────────────────────────────────── */
  const { score, fileName, text } = state
  const cat = CAT[score.category]
  const failed = score.checks.filter((c: TextCheckResult) => !c.passed)
  const passed = score.checks.filter((c: TextCheckResult) => c.passed)

  return (
    <div className="space-y-5">
      {/* file tag + re-upload */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-indigo-500">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span className="truncate text-xs font-medium text-slate-700">{fileName}</span>
          <span className="shrink-0 text-xs text-slate-400">{score.wordCount} words</span>
        </div>
        <button
          type="button"
          onClick={() => { setState({ status: 'idle' }) }}
          className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white"
        >
          Upload another
        </button>
      </div>

      {/* Score card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-900">ATS score</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cat.badge}`}>{cat.label}</span>
        </div>
        <div className="flex items-center gap-5">
          <ScoreRing score={score.total} category={score.category} />
          <div className="flex-1 space-y-2">
            <p className={`text-lg font-bold ${cat.text}`}>{cat.label}</p>
            <p className="text-xs text-slate-500">
              {failed.length === 0
                ? 'Outstanding resume!'
                : `Below: what to add and where — ${failed.length} area${failed.length > 1 ? 's' : ''} to address.`}
            </p>
            {/* gradient bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score.total}%`, background: cat.ring }} />
              {[45, 70, 85].map((p) => <div key={p} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${p}%` }} />)}
            </div>
          </div>
        </div>
      </div>

      {failed.length > 0 && <AtsChangeSummary failed={failed} variant="upload" />}

      {/* Passed checks */}
      {passed.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-wide text-slate-400 group-open:text-slate-600">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-open:rotate-90"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Completed · {passed.length}
            </span>
          </summary>
          <div className="mt-1.5 space-y-1.5">
            {passed.map((c: TextCheckResult) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="flex-1 text-xs font-medium text-slate-800">{c.label}</span>
                <span className="shrink-0 text-[10px] font-semibold text-green-600">{c.earned}/{c.points}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Extracted text accordion */}
      <details className="rounded-xl border border-slate-200">
        <summary
          className="cursor-pointer list-none px-4 py-3 text-xs font-medium text-slate-500 hover:text-slate-700"
          onClick={() => setShowText((v: boolean) => !v)}
        >
          {showText ? 'Hide' : 'View'} extracted text
        </summary>
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600">{text}</pre>
        </div>
      </details>
    </div>
  )
}
