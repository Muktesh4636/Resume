import type { PublishedResume, TemplateId } from '../types/resume'
import type { ResumeData } from '../types/resume'

const DRAFT_KEY = 'resume-studio:draft'
const PUBLISH_PREFIX = 'resume-studio:site:'

export function loadDraft(): { templateId: TemplateId; data: ResumeData } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { templateId: TemplateId; data: ResumeData }
  } catch {
    return null
  }
}

export function saveDraft(templateId: TemplateId, data: ResumeData): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId, data }))
}

export function publishResume(slug: string, templateId: TemplateId, data: ResumeData): PublishedResume {
  const payload: PublishedResume = {
    slug,
    templateId,
    data,
    publishedAt: new Date().toISOString(),
  }
  localStorage.setItem(PUBLISH_PREFIX + slug.toLowerCase(), JSON.stringify(payload))
  return payload
}

export function loadPublished(slug: string): PublishedResume | null {
  try {
    const raw = localStorage.getItem(PUBLISH_PREFIX + slug.toLowerCase())
    if (!raw) return null
    return JSON.parse(raw) as PublishedResume
  } catch {
    return null
  }
}

export function listPublishedSlugs(): string[] {
  const slugs: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PUBLISH_PREFIX)) {
      slugs.push(key.slice(PUBLISH_PREFIX.length))
    }
  }
  return slugs.sort()
}

export function slugAvailable(slug: string): boolean {
  return loadPublished(slug) === null
}
