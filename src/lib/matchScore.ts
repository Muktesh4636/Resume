import type { Job } from './fetchJobs'
import type { ResumeData } from '../types/resume'

/**
 * Computes a 0–100 keyword match between a job and the user's resume.
 * Checks tags, title keywords, and description against resume skills + headline.
 */
export function matchScore(job: Job, data: ResumeData): number {
  // Collect all resume keywords
  const resumeText = [
    data.headline,
    data.summary,
    data.extraColumnTitle,
    data.extraColumnBody,
    ...data.skills.map((s) => s.skills),
    ...data.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...data.projects.map((p) => p.description),
  ]
    .join(' ')
    .toLowerCase()

  const resumeWords = new Set(resumeText.split(/\W+/).filter((w) => w.length > 2))

  // Collect job keywords from tags + title
  const jobKeywords = [
    ...job.tags.map((t) => t.toLowerCase()),
    ...job.title.toLowerCase().split(/\W+/),
  ].filter((w) => w.length > 2)

  if (jobKeywords.length === 0) return 0

  const matched = jobKeywords.filter((kw) => {
    // Exact word match OR substring match (e.g. "typescript" matches "ts")
    return (
      resumeWords.has(kw) ||
      [...resumeWords].some((rw) => rw.includes(kw) || kw.includes(rw))
    )
  })

  return Math.min(100, Math.round((matched.length / jobKeywords.length) * 100))
}

export function matchBadge(score: number): {
  label: string
  color: string
  bg: string
} {
  if (score >= 70) return { label: 'Strong match', color: 'text-green-700', bg: 'bg-green-100' }
  if (score >= 40) return { label: 'Good match',   color: 'text-blue-700',  bg: 'bg-blue-100' }
  if (score >= 15) return { label: 'Partial match', color: 'text-amber-700', bg: 'bg-amber-100' }
  return              { label: 'Low match',       color: 'text-slate-500',  bg: 'bg-slate-100' }
}
