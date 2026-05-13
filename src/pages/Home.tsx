import { Link } from 'react-router-dom'
import { listPublishedSlugs } from '../lib/storage'

/** Curated Unsplash photos (see https://unsplash.com/license) — optimized widths via CDN params. */
const photos = {
  /** Hero: wide office / teamwork scene (not a tight face crop). */
  hero: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&q=85&auto=format&fit=crop',
  /** Laptop on desk — verified Unsplash imgix URL (some legacy photo IDs now 404). */
  showcase: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&h=875&q=85&auto=format&fit=crop',
  featureEditor: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=520&q=82&auto=format&fit=crop',
  featureTemplates: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=520&q=82&auto=format&fit=crop',
  featureAts: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=520&q=82&auto=format&fit=crop',
  featureWeb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=520&q=82&auto=format&fit=crop',
  recruiter: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&h=800&q=85&auto=format&fit=crop',
} as const

export function Home() {
  const sites = listPublishedSlugs()

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Resume Studio</p>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-normal leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
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
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-1 -z-10 rounded-[1.75rem] bg-gradient-to-br from-indigo-300/50 via-violet-200/40 to-transparent opacity-90 blur-2xl"
                aria-hidden
              />
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-indigo-950/12 ring-1 ring-slate-200/90">
                <img
                  src={photos.hero}
                  alt="Team collaborating around a table with laptops in a bright modern office"
                  width={1200}
                  height={800}
                  className="aspect-[4/3] h-auto w-full object-cover object-center md:aspect-auto md:min-h-[22rem]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">Real workspaces</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">Built for how you actually job-search</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              From a focused desk setup to print-ready PDFs — polish your story wherever you work.
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-slate-800/40 p-2 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.65)] backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                <span className="ml-2 flex-1 rounded-md bg-white/5 py-1 text-center text-[10px] text-slate-500">resumebuilder.fun</span>
              </div>
              <img
                src={photos.showcase}
                alt="MacBook on a wooden desk with design tools — focused workspace for job search"
                width={1400}
                height={875}
                className="aspect-[16/10] w-full rounded-b-lg object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
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
              src: photos.featureEditor,
              alt: 'Hands typing on a laptop next to a notebook and coffee, focused writing session',
            },
            {
              title: 'Polished templates',
              body: 'Industry-style layouts — split columns, sidebars, timelines, and accent rails. Swap anytime without losing content.',
              src: photos.featureTemplates,
              alt: 'Stacks of paper documents and office supplies on a desk',
            },
            {
              title: 'ATS score check',
              body: 'Upload a PDF or résumé file for a 0–100 ATS readiness score, with clear fixes for parsers and recruiters.',
              src: photos.featureAts,
              alt: 'Analytics dashboard and charts on a computer monitor',
            },
            {
              title: 'Your resume website',
              body: 'Pick a URL slug and publish a dedicated page you can send to recruiters, mentors, or friends.',
              src: photos.featureWeb,
              alt: 'Laptop screen showing charts and data in a modern workspace',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-44">
                <img
                  src={card.src}
                  alt={card.alt}
                  width={800}
                  height={520}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-6 pt-5">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,320px)] lg:items-start lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Recruiter Insights</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">How recruiters weigh your resume</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600 lg:mx-0">
                Understand which sections carry the most impact so you can prioritise your effort.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
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
              <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">
                Weightages are approximate industry averages and may vary by role and industry.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0 lg:max-w-none lg:pt-8">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-indigo-950/5 ring-1 ring-slate-100">
                <img
                  src={photos.recruiter}
                  alt="Team collaborating around a table with laptops in a bright office"
                  width={640}
                  height={800}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mt-3 text-center text-sm text-slate-600 lg:text-left">
                Present a resume that reads clearly to humans <span className="font-medium text-slate-800">and</span> ATS tools.
              </p>
            </div>
          </div>
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
