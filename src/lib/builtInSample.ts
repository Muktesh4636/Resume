import { THUMBNAIL_RESUME } from './defaultResume'
import type { ResumeData } from '../types/resume'

/** Field is still “sample placeholder” if unchanged or cleared (empty) before typing real content. */
function eqSampleOrEmpty(value: string, sample: string): boolean {
  return value === sample || value.trim() === ''
}

/**
 * True when the draft still matches the app’s starter example used for templates
 * and first-load filler. Score is hidden until this returns false.
 */
export function isBuiltInSampleResume(d: ResumeData): boolean {
  if (d.fullName.trim() !== 'Alex Morgan') return false
  if (d.email.trim().toLowerCase() !== 'alex.morgan@email.com') return false
  if (d.experience.length < 1) return false
  const ex0 = d.experience[0]
  if (ex0.company.trim() !== 'Northwind Labs') return false
  if (ex0.role.trim() !== 'Senior Software Engineer') return false
  if (d.extraColumnTitle.trim() || d.extraColumnBody.trim()) return false
  return true
}

/**
 * Whether form fields should use muted “sample” styling and clear-on-focus behavior.
 * Stays true while each value is still either the starter text or empty, until the user types their own content.
 */
export function isSampleVisualHintsActive(d: ResumeData): boolean {
  const s = THUMBNAIL_RESUME
  if (!eqSampleOrEmpty(d.fullName, s.fullName)) return false
  if (!eqSampleOrEmpty(d.headline, s.headline)) return false
  if (!eqSampleOrEmpty(d.email, s.email)) return false
  if (!eqSampleOrEmpty(d.phone, s.phone)) return false
  if (!eqSampleOrEmpty(d.location, s.location)) return false
  if (!eqSampleOrEmpty(d.website, s.website)) return false
  if (!eqSampleOrEmpty(d.linkedin, s.linkedin)) return false
  if (!eqSampleOrEmpty(d.github, s.github)) return false
  if (!eqSampleOrEmpty(d.summary, s.summary)) return false

  if (d.experience.length !== s.experience.length) return false
  for (let i = 0; i < d.experience.length; i++) {
    const e = d.experience[i]
    const se = s.experience[i]
    if (!eqSampleOrEmpty(e.role, se.role)) return false
    if (!eqSampleOrEmpty(e.company, se.company)) return false
    if (!eqSampleOrEmpty(e.start, se.start)) return false
    if (!eqSampleOrEmpty(e.end, se.end)) return false
    if (e.bullets.length !== se.bullets.length) return false
    for (let j = 0; j < e.bullets.length; j++) {
      if (!eqSampleOrEmpty(e.bullets[j], se.bullets[j])) return false
    }
  }

  if (d.education.length !== s.education.length) return false
  for (let i = 0; i < d.education.length; i++) {
    const e = d.education[i]
    const se = s.education[i]
    if (!eqSampleOrEmpty(e.school, se.school)) return false
    if (!eqSampleOrEmpty(e.degree, se.degree)) return false
    if (!eqSampleOrEmpty(e.year, se.year)) return false
  }

  if (d.skills.length !== s.skills.length) return false
  for (let i = 0; i < d.skills.length; i++) {
    const e = d.skills[i]
    const se = s.skills[i]
    if (!eqSampleOrEmpty(e.title, se.title)) return false
    if (!eqSampleOrEmpty(e.skills, se.skills)) return false
  }

  if (d.projects.length !== s.projects.length) return false
  for (let i = 0; i < d.projects.length; i++) {
    const e = d.projects[i]
    const se = s.projects[i]
    if (!eqSampleOrEmpty(e.name, se.name)) return false
    if (!eqSampleOrEmpty(e.description, se.description)) return false
    if (!eqSampleOrEmpty(e.url, se.url)) return false
  }

  if (d.certifications.length !== s.certifications.length) return false
  for (let i = 0; i < d.certifications.length; i++) {
    const e = d.certifications[i]
    const se = s.certifications[i]
    if (!eqSampleOrEmpty(e.name, se.name)) return false
    if (!eqSampleOrEmpty(e.issuer, se.issuer)) return false
  }

  if (d.extraColumnEnabled !== s.extraColumnEnabled) return false
  if (!eqSampleOrEmpty(d.extraColumnTitle, s.extraColumnTitle)) return false
  if (!eqSampleOrEmpty(d.extraColumnBody, s.extraColumnBody)) return false

  return true
}
