import { Link } from 'react-router-dom'
import { listPublishedSlugs } from '../lib/storage'

export function Home() {
  const sites = listPublishedSlugs()

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Resume Studio</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-normal leading-tight tracking-tight text-slate-900 md:text-6xl">
            Beautiful resumes, many templates, and your own public page.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Draft your story with a live preview, swap between many distinct layouts, then publish a lightweight personal resume site you can
            share in seconds — stored locally in your browser for now.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/builder"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800"
            >
              Open builder
            </Link>
            <Link
              to="/ats"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100"
            >
              Check ATS score
            </Link>
            <Link
              to="/templates"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400"
            >
              Browse templates
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-center font-display text-3xl text-slate-900">Built for speed and polish</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Full resume editor',
              body: 'Profile, experience, education, skills, projects, and certifications with instant preview while you type.',
            },
            {
              title: 'Polished templates',
              body: 'Industry-style layouts — split columns, sidebars, timelines, and accent rails. Swap anytime without losing content.',
            },
            {
              title: 'ATS score check',
              body: 'Upload a PDF or résumé file for a 0–100 ATS readiness score, with clear fixes for parsers and recruiters.',
            },
            {
              title: 'Your resume website',
              body: 'Pick a URL slug and publish a dedicated page you can send to recruiters, mentors, or friends.',
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Recruiter Insights</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900">How recruiters weigh your resume</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Understand which sections carry the most impact so you can prioritise your effort.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Work Experience', weight: 40, color: 'bg-indigo-500', tip: 'Roles, responsibilities & measurable outcomes' },
              { label: 'Skills & Technologies', weight: 25, color: 'bg-violet-500', tip: 'Hard skills, tools, and tech stack' },
              { label: 'Education', weight: 20, color: 'bg-sky-500', tip: 'Degree, institution & relevant coursework' },
              { label: 'Projects', weight: 10, color: 'bg-emerald-500', tip: 'Side projects, open source & portfolio links' },
              { label: 'Certifications', weight: 5, color: 'bg-amber-500', tip: 'Industry certs and professional training' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                    <p className="mt-0.5 text-xs text-slate-500">{item.tip}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-bold text-white ${item.color}`}>
                    {item.weight}%
                  </span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${item.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Weightages are approximate industry averages and may vary by role and industry.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <h2 className="font-display text-2xl text-slate-900">Your live resume sites</h2>
        <p className="mt-2 text-sm text-slate-600">Links open your public resume page on this device (local storage).</p>
        {sites.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nothing published yet.{' '}
            <Link className="font-semibold text-indigo-600 hover:underline" to="/builder">
              Publish from the builder
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {sites.map((slug) => (
              <li key={slug}>
                <Link
                  to={`/site/${slug}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="truncate">/{slug}</span>
                  <span className="shrink-0 text-xs font-semibold text-indigo-600">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
