/** Client-side SEO for the React SPA — updates title, description, and canonical when the route changes. */

const BASE = 'https://resumebuilder.fun'

const ROUTES: Record<string, { title: string; description: string }> = {
  '/': {
    title: `Resume Builder — Free Online Resume Maker & 19 Templates | ResumeBuilder.fun`,
    description:
      'Create a professional resume in minutes with ResumeBuilder.fun. Choose from 19 polished templates, fill in your details, download a print-ready PDF, run an ATS score check, and publish your own resume page — 100% free, no sign-up.',
  },
  '/builder': {
    title: `Resume Builder — Edit & Preview | ResumeBuilder.fun`,
    description:
      'Edit your resume with live preview: profile, experience, education, skills, projects, and certifications. Switch between 19 templates, download PDF, optionally add a third column, and publish a public resume page.',
  },
  '/templates': {
    title: `Resume Templates Gallery — 19 Styles | ResumeBuilder.fun`,
    description:
      'Browse 19 resume templates: split columns, sidebars, serif and sans styles, ATS-friendly layouts. Pick one in the builder — your content comes with you.',
  },
  '/ats': {
    title: `ATS Resume Score — Upload & Check Readiness | ResumeBuilder.fun`,
    description:
      'Upload a PDF or text résumé for a 0–100 ATS readiness score and clear guidance on structure, keywords, and parser-friendly formatting — processed in your browser.',
  },
  '/jobs': {
    title: `Career & Resume Insights | ResumeBuilder.fun`,
    description:
      'Explore how recruiters weigh resume sections and tips for improving your ResumeBuilder.fun draft.',
  },
}

export function applyRouteSeo(pathname: string) {
  const key = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
  const meta = ROUTES[key] ?? ROUTES['/']

  document.title = meta.title

  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', meta.description)

  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    const href = key === '/' ? `${BASE}/` : `${BASE}${key}`
    canonical.setAttribute('href', href)
  }

  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    const og = key === '/' ? `${BASE}/` : `${BASE}${key}`
    ogUrl.setAttribute('content', og)
  }

  const setMetaContent = (selector: string, content: string) => {
    const el = document.querySelector(selector)
    if (el) el.setAttribute('content', content)
  }

  setMetaContent('meta[property="og:title"]', meta.title)
  setMetaContent('meta[property="og:description"]', meta.description)
  setMetaContent('meta[name="twitter:title"]', meta.title)
  setMetaContent('meta[name="twitter:description"]', meta.description)
}
