import { newId } from './id'
import type { ResumeData } from '../types/resume'

export function createDefaultResume(): ResumeData {
  return {
    fullName: 'Alex Morgan',
    headline: 'Product engineer · UX-minded builder',
    email: 'alex.morgan@email.com',
    phone: '+1 (415) 555-0192',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    summary:
      'Hands-on engineer who ships reliable web products end-to-end. Comfortable owning discovery, delivery, and follow-up metrics with design and GTM partners.',
    experience: [
      {
        id: newId(),
        company: 'Northwind Labs',
        role: 'Senior Software Engineer',
        start: '2022',
        end: 'Present',
        bullets: [
          'Led a team of four shipping a design-system-backed admin console used by 12k weekly active admins.',
          'Cut p95 API latency by 38% through query batching, edge caching, and incremental static regeneration.',
          'Partnered with design on accessibility audits; raised WCAG conformance from AA partial to full AA on core flows.',
        ],
      },
      {
        id: newId(),
        company: 'Riverstone Health',
        role: 'Software Engineer',
        start: '2019',
        end: '2022',
        bullets: [
          'Built scheduling and telehealth features in React and TypeScript serving 400k patient accounts.',
          'Introduced feature flags and staged rollouts, reducing rollback incidents by roughly half quarter over quarter.',
        ],
      },
    ],
    education: [
      {
        id: newId(),
        school: 'University of California, Berkeley',
        degree: 'B.S. Computer Science',
        year: '2019',
      },
    ],
    skills: [
      { id: newId(), title: 'Engineering', skills: 'TypeScript, React, Node.js, PostgreSQL, GraphQL' },
      { id: newId(), title: 'Practices', skills: 'CI/CD, testing, observability, incident response' },
    ],
    projects: [
      {
        id: newId(),
        name: 'Resume Studio',
        description: 'Open toolkit for resumes and lightweight personal sites.',
        url: 'https://github.com/example/resume-studio',
      },
    ],
    certifications: [
      { id: newId(), name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services' },
    ],
    extraColumnEnabled: false,
    extraColumnTitle: '',
    extraColumnBody: '',
    fontSizePreset: 'default',
  }
}

/** Same sample profile for template gallery thumbnails (stable across previews). */
export const THUMBNAIL_RESUME: ResumeData = createDefaultResume()

/** Merge new fields for drafts saved before optional third column existed. */
export function withExtraColumnDefaults(d: ResumeData): ResumeData {
  return {
    ...d,
    extraColumnEnabled: d.extraColumnEnabled ?? false,
    extraColumnTitle: d.extraColumnTitle ?? '',
    extraColumnBody: d.extraColumnBody ?? '',
    fontSizePreset: d.fontSizePreset ?? 'default',
  }
}
