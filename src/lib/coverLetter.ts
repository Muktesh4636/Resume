import type { Job } from './fetchJobs'
import type { ResumeData } from '../types/resume'

/**
 * Generates a professional, tailored cover letter for a specific job.
 * Template-driven — no external AI API required.
 */
export function generateCoverLetter(data: ResumeData, job: Job): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const topSkills = data.skills
    .flatMap((s) => s.skills.split(',').map((x) => x.trim()))
    .filter(Boolean)
    .slice(0, 5)
    .join(', ')

  const latestRole = data.experience[0]
  const latestRoleStr = latestRole
    ? `${latestRole.role} at ${latestRole.company}`
    : 'my current position'

  // Pick 1–2 highlights from latest role bullets
  const highlights = latestRole?.bullets.filter((b) => b.trim().length > 20).slice(0, 2) ?? []
  const highlightPara = highlights.length > 0
    ? `In my most recent role I ${highlights[0].replace(/^[•\-*►\s]+/, '').replace(/^\w/, (c) => c.toLowerCase())}${highlights[1] ? ` Additionally, I ${highlights[1].replace(/^[•\-*►\s]+/, '').replace(/^\w/, (c) => c.toLowerCase())}` : ''}`
    : `Throughout my career I have consistently delivered results through collaboration, technical rigor, and a focus on user impact.`

  // Match job tags to skills for the customisation paragraph
  const matchedSkills = job.tags
    .filter((tag) =>
      data.skills.some((s) => s.skills.toLowerCase().includes(tag.toLowerCase())) ||
      (data.headline ?? '').toLowerCase().includes(tag.toLowerCase()),
    )
    .slice(0, 3)

  const skillsPara = matchedSkills.length > 0
    ? `The role's focus on ${matchedSkills.join(', ')} aligns closely with my background — I have hands-on experience shipping production systems using these technologies.`
    : `The role's technical scope aligns well with my background in ${topSkills || 'software engineering'}.`

  return `${today}

Hiring Team
${job.company}

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${job.title} position at ${job.company}. As ${data.headline || `a professional with a passion for ${job.category}`}, I am excited by the opportunity to contribute to ${job.company}'s mission and growth.

Currently serving as ${latestRoleStr}, I bring a strong foundation in ${topSkills || 'the relevant technical areas'}. ${highlightPara}.

${skillsPara}

${data.summary ? `A brief overview of my background: ${data.summary}` : `I am a results-driven professional with a track record of delivering high-quality work and collaborating effectively across teams.`}

I would welcome the chance to discuss how my experience and enthusiasm can add value to ${job.company}. Thank you for your time and consideration.

Warm regards,
${data.fullName || 'Your Name'}
${data.email ? `${data.email}` : ''}${data.phone ? `  ·  ${data.phone}` : ''}${data.linkedin ? `\n${data.linkedin}` : ''}`
}
