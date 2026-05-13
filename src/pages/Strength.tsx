import { Link } from 'react-router-dom'
import { ResumeUploader } from '../components/ResumeUploader'

export function Strength() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      {/* Hero */}
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">ATS &amp; analysis</p>
      <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">Check your ATS score</h1>
      <p className="mt-4 max-w-xl text-base text-slate-600">
        See how likely your resume is to pass applicant tracking systems (ATS) and recruiter screens. Upload a PDF or text resume — we check
        10 ATS-style factors and show what to add or fix.
      </p>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-slate-600">
          After you upload, you get a <span className="font-medium text-slate-800">focus list</span> and numbered steps. Each step starts with{' '}
          <span className="font-medium text-slate-800">Add or fix</span> (exact content to include), then an explanation and where to edit in
          your file or in our builder.
        </p>
        <ResumeUploader />
      </div>

      {/* Scoring guide */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">How your ATS score works</h2>
        <p className="mt-2 text-xs text-slate-500">
          This is an estimated readiness score (not affiliated with any single ATS vendor). It rewards clear structure, keywords, metrics, and
          completeness — the same patterns most parsers and recruiters look for.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Contact info', pts: 15, desc: 'Email, phone, and location present.' },
            { label: 'Professional summary', pts: 15, desc: '50–100 words covering your speciality and strengths.' },
            { label: 'Quantified achievements', pts: 15, desc: '50%+ of bullets include numbers or percentages.' },
            { label: 'Impact verbs', pts: 10, desc: 'Bullets start with strong action verbs (Led, Built, Grew…).' },
            { label: 'Bullet-point details', pts: 10, desc: '10+ bullets across all roles.' },
            { label: 'Skills section', pts: 10, desc: '10+ skills listed in a clear skills area.' },
            { label: 'Online presence', pts: 10, desc: 'LinkedIn + GitHub or website linked.' },
            { label: 'Work experience', pts: 5, desc: 'At least one experience entry.' },
            { label: 'Education', pts: 5, desc: 'At least one education entry.' },
            { label: 'Projects', pts: 5, desc: 'At least one project described.' },
          ].map((row) => (
            <div key={row.label} className="flex gap-3">
              <span className="mt-0.5 shrink-0 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">{row.pts}</span>
              <div>
                <p className="text-xs font-semibold text-slate-900">{row.label}</p>
                <p className="text-xs text-slate-500">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { range: '0–45', label: 'Weak', color: 'bg-red-100 text-red-700' },
            { range: '46–70', label: 'Fair', color: 'bg-amber-100 text-amber-700' },
            { range: '71–85', label: 'Strong', color: 'bg-blue-100 text-blue-700' },
            { range: '86–100', label: 'Excellent', color: 'bg-green-100 text-green-700' },
          ].map((band) => (
            <div key={band.label} className={`rounded-xl px-2 py-2 font-semibold ${band.color}`}>
              <p>{band.label}</p>
              <p className="font-normal opacity-80">{band.range}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/builder"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to builder to improve your resume →
        </Link>
      </div>
    </div>
  )
}
