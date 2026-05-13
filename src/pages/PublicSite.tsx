import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ResumePreview } from '../components/ResumePreview'
import { withExtraColumnDefaults } from '../lib/defaultResume'
import { loadPublished } from '../lib/storage'

export function PublicSite() {
  const { slug } = useParams()
  const published = slug ? loadPublished(slug) : null

  useEffect(() => {
    if (published?.data.fullName) {
      document.title = `${published.data.fullName} — Resume`
    } else {
      document.title = 'Resume — Resume Studio'
    }
  }, [published?.data.fullName])

  if (!published) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 font-sans text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Resume Studio</p>
        <h1 className="mt-4 font-display text-3xl text-slate-900">Page not found</h1>
        <p className="mt-3 max-w-md text-slate-600">
          This slug has not been published in this browser yet, or it was removed from local storage.
        </p>
        <Link to="/builder" className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Go to builder
        </Link>
      </div>
    )
  }

  const { data, templateId } = published

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-100 to-slate-50 font-sans text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Personal resume site</p>
            <p className="text-lg font-semibold text-slate-900">{data.fullName}</p>
            <p className="text-sm text-slate-600">{data.headline}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {data.email && (
              <a href={`mailto:${data.email}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium hover:border-indigo-200">
                Email
              </a>
            )}
            {data.linkedin && (
              <a
                href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium hover:border-indigo-200"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            )}
            {data.website && (
              <a href={data.website} className="rounded-full bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-800" target="_blank" rel="noreferrer">
                Website
              </a>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <ResumePreview templateId={templateId} data={withExtraColumnDefaults(data)} variant="public" />
      </main>
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          Create your own with Resume Studio
        </Link>
      </footer>
    </div>
  )
}
