import type { ResumeData } from '../types/resume'

export function hasSummaryContent(d: ResumeData): boolean {
  return Boolean(d.summary?.trim())
}

export function hasExperienceContent(d: ResumeData): boolean {
  return d.experience.some(
    (ex) =>
      ex.role.trim() ||
      ex.company.trim() ||
      ex.start.trim() ||
      ex.end.trim() ||
      ex.bullets.some((b) => b.trim()),
  )
}

export function hasEducationContent(d: ResumeData): boolean {
  return d.education.some((ed) => ed.school.trim() || ed.degree.trim() || ed.year.trim())
}

function skillTokensFromGroups(groups: ResumeData['skills']): string[] {
  return groups.flatMap((s) =>
    s.skills.split(/[,·|]/).map((x) => x.trim()).filter(Boolean),
  )
}

export function hasSkillsContent(d: ResumeData): boolean {
  return skillTokensFromGroups(d.skills).length > 0
}

/** Skills excluding groups whose title looks like “languages” (sidebar split in some templates). */
export function hasSkillsExcludingLanguagesContent(d: ResumeData): boolean {
  const groups = d.skills.filter((s) => !/language/i.test(s.title))
  return skillTokensFromGroups(groups).length > 0
}

export function hasCertificationsContent(d: ResumeData): boolean {
  return d.certifications.some((c) => c.name.trim() || c.issuer.trim())
}

export function hasProjectsContent(d: ResumeData): boolean {
  return d.projects.some((p) => p.name.trim() || p.description.trim() || p.url.trim())
}
