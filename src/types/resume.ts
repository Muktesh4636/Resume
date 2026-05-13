export type ExperienceItem = {
  id: string
  company: string
  role: string
  start: string
  end: string
  bullets: string[]
}

export type EducationItem = {
  id: string
  school: string
  degree: string
  year: string
}

export type SkillGroup = {
  id: string
  title: string
  skills: string
}

export type Certification = {
  id: string
  name: string
  issuer: string
}

export type ProjectItem = {
  id: string
  name: string
  description: string
  url: string
}

/** On-screen scale for the public /site page and template thumbnails (builder preview ignores this; PDF always full size). */
export type ResumeFontSizePreset = 'default' | 'small' | 'big'

export type ResumeData = {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillGroup[]
  projects: ProjectItem[]
  certifications: Certification[]
  /** Optional narrow third column on supported templates (title + body). */
  extraColumnEnabled: boolean
  extraColumnTitle: string
  extraColumnBody: string
  fontSizePreset: ResumeFontSizePreset
}

/** Reference template: tpl-00 … tpl-18 (19 professional layouts). */
export type TemplateId = `tpl-${string}`

export type PublishedResume = {
  slug: string
  templateId: TemplateId
  data: ResumeData
  publishedAt: string
}
