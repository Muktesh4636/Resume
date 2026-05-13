import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyModal } from '../components/ApplyModal'
import { createDefaultResume, withExtraColumnDefaults } from '../lib/defaultResume'
import {
  CATEGORIES,
  fetchJobs,
  getApplication,
  loadApplications,
  removeApplication,
} from '../lib/fetchJobs'
import type { Application, ApplicationStatus, Job } from '../lib/fetchJobs'
import { matchBadge, matchScore } from '../lib/matchScore'
import { loadDraft } from '../lib/storage'
import type { ResumeData } from '../types/resume'

const STATUS_META: Record<ApplicationStatus, { label: string; dot: string }> = {
  saved:        { label: 'Saved',       dot: 'bg-slate-400' },
  applied:      { label: 'Applied',     dot: 'bg-blue-500' },
  interviewing: { label: 'Interviewing', dot: 'bg-amber-500' },
  rejected:     { label: 'Rejected',    dot: 'bg-red-500' },
  offer:        { label: 'Offer 🎉',    dot: 'bg-green-500' },
}

type View = 'search' | 'tracker'

export function Jobs() {
  const [data] = useState<ResumeData>(() =>
    withExtraColumnDefaults(loadDraft()?.data ?? createDefaultResume()),
  )
  const [view, setView] = useState<View>('search')

  // Search / filters
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Tracker
  const [applications, setApplications] = useState<Application[]>(() => loadApplications())

  // Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Debounce search query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const load = useCallback(async () => {
    setLoading(true)
    setFetched(false)
    const results = await fetchJobs(debouncedQuery, category)
    setJobs(results)
    setLoading(false)
    setFetched(true)
  }, [debouncedQuery, category])

  // Re-fetch whenever query, category, or view changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (view === 'search') { void load() } }, [view, load])

  // Enrich jobs with match score and application status
  const enrichedJobs = useMemo(
    () =>
      jobs
        .map((j) => ({ job: j, score: matchScore(j, data), app: getApplication(j.id) }))
        .sort((a, b) => b.score - a.score),
    [jobs, data, applications], // eslint-disable-line react-hooks/exhaustive-deps
  )

  function onApplied() {
    setApplications(loadApplications())
  }

  function removeApp(jobId: string) {
    removeApplication(jobId)
    setApplications(loadApplications())
  }

  const hasDraft = Boolean(loadDraft())

  // Build smart deep-link URLs using resume data
  const keyword = encodeURIComponent(data.headline || 'Software Engineer')
  const location = encodeURIComponent(data.location || 'India')
  const JOB_BOARDS = [
    {
      name: 'LinkedIn',
      color: 'bg-[#0a66c2] hover:bg-[#004182]',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/jobs/search/?keywords=${keyword}&location=${location}`,
      note: 'Use Easy Apply for fastest applications',
    },
    {
      name: 'Naukri',
      color: 'bg-[#ff7555] hover:bg-[#e55c3a]',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      ),
      url: `https://www.naukri.com/${data.headline ? data.headline.toLowerCase().replace(/\s+/g, '-') + '-jobs' : 'jobs'}?k=${keyword}&l=${location}`,
      note: 'India\'s largest job portal',
    },
    {
      name: 'Indeed',
      color: 'bg-[#003a9b] hover:bg-[#002370]',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.5 5.5h1v7h-1v-7zm.5 10a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      ),
      url: `https://in.indeed.com/jobs?q=${keyword}&l=${location}`,
      note: 'Upload resume once, apply everywhere',
    },
    {
      name: 'Glassdoor',
      color: 'bg-[#0caa41] hover:bg-[#098a33]',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 110 16A8 8 0 0112 4z"/>
        </svg>
      ),
      url: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${keyword}&locT=N&locId=115&jobType=`,
      note: 'See salaries & company reviews',
    },
    {
      name: 'Internshala',
      color: 'bg-[#006bff] hover:bg-[#0050cc]',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      url: `https://internshala.com/jobs/keywords-${keyword.toLowerCase()}`,
      note: 'Great for freshers & interns',
    },
    {
      name: 'AngelList',
      color: 'bg-slate-900 hover:bg-slate-700',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      ),
      url: `https://wellfound.com/jobs?q=${keyword}`,
      note: 'Startup jobs worldwide',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-12">
      {/* Hero */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Smart Job Search</p>
          <h1 className="mt-2 font-display text-3xl text-slate-900 md:text-4xl">Find & Apply to Jobs</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Search job boards with your resume data pre-filled, or browse live listings below. Copy your cover letter and paste it into any application in seconds.
          </p>
        </div>
        {!hasDraft && (
          <Link to="/builder" className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
            Fill your resume for better matches →
          </Link>
        )}
      </div>

      {/* ── HOW TO APPLY BANNER ──────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-sm font-semibold text-blue-900">How to apply to any job in 2 minutes</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {[
            { n: '1', t: 'Find a job', d: 'Use the boards below or browse our live listings' },
            { n: '2', t: 'Copy cover letter', d: 'Click Apply → auto-generated, tailored to that job' },
            { n: '3', t: 'Paste & submit', d: 'Fill the application form using your copied data' },
            { n: '4', t: 'Track it', d: 'Mark as Applied in our tracker to follow up later' },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{s.n}</span>
              <div>
                <p className="text-xs font-semibold text-blue-900">{s.t}</p>
                <p className="text-[10px] text-blue-700">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── JOB BOARD SEARCH BUTTONS ─────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Search on Job Boards</p>
            <p className="text-xs text-slate-500">Pre-filled with: <span className="font-medium text-slate-700">"{data.headline || 'Software Engineer'}"</span> · {data.location || 'India'}</p>
          </div>
          {hasDraft && (
            <Link to="/builder" className="text-xs text-indigo-600 hover:underline">Change in builder →</Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {JOB_BOARDS.map((board) => (
            <a
              key={board.name}
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all ${board.color}`}
            >
              {board.icon}
              <div className="min-w-0">
                <p className="truncate">{board.name}</p>
                <p className="truncate text-[9px] font-normal opacity-75">{board.note}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-7 flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        <TabBtn active={view === 'search'} onClick={() => setView('search')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Browse Jobs
        </TabBtn>
        <TabBtn active={view === 'tracker'} onClick={() => setView('tracker')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          My Applications {applications.length > 0 && <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">{applications.length}</span>}
        </TabBtn>
      </div>

      {/* ── SEARCH VIEW ─────────────────────────────────────────────── */}
      {view === 'search' && (
        <div className="mt-5 space-y-4">
          {/* Search + filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, skills, companies…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <svg className="h-5 w-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
              </svg>
              <span className="text-sm">Fetching live jobs…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && fetched && enrichedJobs.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No jobs found. Try a different search or category.</p>
            </div>
          )}

          {/* Job list */}
          {!loading && enrichedJobs.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">{enrichedJobs.length} jobs · sorted by match with your resume</p>
              {enrichedJobs.map(({ job, score, app }) => {
                const badge = matchBadge(score)
                return (
                  <div
                    key={job.id}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        {/* Logo */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 overflow-hidden">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company} className="h-full w-full object-contain" />
                          ) : (
                            job.company.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug">{job.title}</p>
                          <p className="text-sm text-slate-500">{job.company}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>{job.location}</span>
                            {job.jobType && <><span>·</span><span className="capitalize">{job.jobType}</span></>}
                            {job.salary && <><span>·</span><span className="text-emerald-600 font-medium">{job.salary}</span></>}
                          </div>
                        </div>
                      </div>
                      {/* Match badge */}
                      <div className="shrink-0 text-right space-y-1">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                        <p className={`text-[11px] font-semibold ${badge.color}`}>{score}% match</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {job.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.tags.slice(0, 6).map((tag) => (
                          <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Description snippet */}
                    <p className="mt-3 line-clamp-2 text-xs text-slate-500">{job.description.replace(/<[^>]+>/g, '')}</p>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {app && (
                          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[app.status].dot}`} />
                            {STATUS_META[app.status].label}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{new Date(job.postedAt).toLocaleDateString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {app ? 'Reapply' : 'Apply'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TRACKER VIEW ────────────────────────────────────────────── */}
      {view === 'tracker' && (
        <div className="mt-5">
          {applications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">No applications tracked yet</p>
              <p className="mt-1 text-xs text-slate-500">Click "Apply" on any job and it'll appear here.</p>
              <button type="button" onClick={() => setView('search')} className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                Browse jobs
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">{applications.length} application{applications.length !== 1 ? 's' : ''} tracked</p>
              {applications.map((app) => (
                <div key={app.jobId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{app.jobTitle}</p>
                      <p className="text-sm text-slate-500">{app.company}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        app.status === 'offer' ? 'bg-green-100 text-green-700'
                        : app.status === 'interviewing' ? 'bg-amber-100 text-amber-700'
                        : app.status === 'rejected' ? 'bg-red-100 text-red-600'
                        : app.status === 'applied' ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[app.status].dot}`} />
                        {STATUS_META[app.status].label}
                      </span>
                    </div>
                  </div>
                  {app.notes && <p className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">{app.notes}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Open job
                    </a>
                    <button
                      type="button"
                      onClick={() => removeApp(app.jobId)}
                      className="rounded-full border border-red-100 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          job={selectedJob}
          data={data}
          onClose={() => setSelectedJob(null)}
          onApplied={onApplied}
        />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
