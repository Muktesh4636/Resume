/**
 * Text-based resume strength scorer.
 * Works directly on raw extracted text — no structured data needed.
 * Mirrors the 10 checks in scoreResume.ts but uses regex heuristics.
 */

export type TextCheckResult = {
  id: string
  label: string
  points: number
  earned: number
  passed: boolean
  tip: string
}

export type TextResumeScore = {
  total: number
  category: 'excellent' | 'good' | 'fair' | 'weak'
  checks: TextCheckResult[]
  wordCount: number
}

/* ── helpers ────────────────────────────────────────────────────────── */
const SECTION_HEADINGS = {
  experience: /\b(experience|work history|employment|career|professional background)\b/i,
  education: /\b(education|academic|degree|university|college|school)\b/i,
  skills: /\b(skills|technologies|tech stack|competencies|tools|expertise)\b/i,
  summary: /\b(summary|profile|objective|about me|overview|professional summary)\b/i,
  projects: /\b(projects|portfolio|work samples|personal projects)\b/i,
  certifications: /\b(certifications?|certificates?|licen[sc]e|awards?|honours?)\b/i,
}

const IMPACT_VERBS = [
  'led', 'built', 'shipped', 'launched', 'designed', 'developed', 'improved',
  'reduced', 'increased', 'grew', 'managed', 'delivered', 'created', 'achieved',
  'drove', 'accelerated', 'optimized', 'implemented', 'architected', 'spearheaded',
  'scaled', 'streamlined', 'negotiated', 'oversaw', 'produced', 'transformed',
  'coordinated', 'executed', 'established', 'generated', 'pioneered', 'revamped',
]

function hasSectionHeading(text: string, key: keyof typeof SECTION_HEADINGS) {
  return SECTION_HEADINGS[key].test(text)
}

function countBullets(text: string): number {
  return (text.match(/^[\s•\-*►▶▸→]+\S/gm) ?? []).length
}

function countBulletsWithNumbers(text: string): number {
  const bullets = text.match(/^[\s•\-*►▶▸→]+.+$/gm) ?? []
  return bullets.filter((b) => /\d/.test(b)).length
}

function countBulletsWithImpactVerb(text: string): number {
  const bullets = text.match(/^[\s•\-*►▶▸→]+.+$/gm) ?? []
  const lower = bullets.map((b) => b.toLowerCase().trim().replace(/^[•\-*►▶▸→\s]+/, ''))
  return lower.filter((b) => IMPACT_VERBS.some((v) => b.startsWith(v))).length
}

export function scoreResumeFromText(raw: string): TextResumeScore {
  const text = raw.replace(/\r\n/g, '\n')
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  const checks: TextCheckResult[] = []

  /* ── 1. Contact info (15 pts) ─────────────────────────────────────── */
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
  const hasPhone = /(\+?\d[\d\s\-(.)]{7,}\d)/.test(text)
  const hasLocation = /\b([A-Z][a-z]+[\s,]+[A-Z]{2,}|Remote|[A-Z][a-z]+,\s*[A-Z][a-z]+)\b/.test(text)
  const contactCount = [hasEmail, hasPhone, hasLocation].filter(Boolean).length
  const contactEarned = Math.round((contactCount / 3) * 15)
  checks.push({
    id: 'contact',
    label: 'Contact information present',
    points: 15,
    earned: contactEarned,
    passed: contactCount >= 3,
    tip: 'Include email, phone number, and location (city/state or "Remote") near the top of your resume.',
  })

  /* ── 2. Summary / Objective (15 pts) ─────────────────────────────── */
  const hasSummaryHeading = hasSectionHeading(text, 'summary')
  // Find the paragraph following a summary heading
  const summaryMatch = text.match(
    /(?:summary|profile|objective|about me|overview|professional summary)[:\s\n]+([^\n]{60,}(?:\n[^\n]{30,}){0,3})/i,
  )
  const summaryWords = summaryMatch ? summaryMatch[1].trim().split(/\s+/).length : 0
  const summaryEarned = summaryWords >= 50 ? 15 : summaryWords >= 25 ? 10 : hasSummaryHeading ? 5 : 0
  checks.push({
    id: 'summary',
    label: 'Professional summary (50+ words)',
    points: 15,
    earned: summaryEarned,
    passed: summaryWords >= 50,
    tip: `Add a concise 50–100 word professional summary at the top. It's the first thing recruiters read.`,
  })

  /* ── 3. Work experience section (5 pts) ──────────────────────────── */
  const hasExpSection = hasSectionHeading(text, 'experience')
  // Look for date patterns (company tenure)
  const datePatterns = (text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February)\b.*?\d{4}/gi) ?? []).length
  const hasExp = hasExpSection || datePatterns >= 2
  checks.push({
    id: 'exp_present',
    label: 'Work experience section present',
    points: 5,
    earned: hasExp ? 5 : 0,
    passed: hasExp,
    tip: 'Add an "Experience" section with company names, roles, and dates for each position.',
  })

  /* ── 4. Bullet points / details (10 pts) ─────────────────────────── */
  const totalBullets = countBullets(text)
  const bulletEarned = totalBullets >= 10 ? 10 : totalBullets >= 5 ? 7 : totalBullets >= 2 ? 4 : 0
  checks.push({
    id: 'bullets',
    label: 'Uses bullet points for achievements',
    points: 10,
    earned: bulletEarned,
    passed: totalBullets >= 10,
    tip: `Found ${totalBullets} bullet point${totalBullets !== 1 ? 's' : ''}. Aim for 3–5 per role to clearly highlight responsibilities and wins.`,
  })

  /* ── 5. Quantified achievements (15 pts) ─────────────────────────── */
  const numberedBullets = countBulletsWithNumbers(text)
  const quantRatio = totalBullets === 0 ? 0 : numberedBullets / totalBullets
  const quantEarned = quantRatio >= 0.5 ? 15 : quantRatio >= 0.25 ? 10 : numberedBullets > 0 ? 5 : 0
  checks.push({
    id: 'quantified',
    label: 'Achievements include numbers / metrics',
    points: 15,
    earned: quantEarned,
    passed: quantRatio >= 0.5,
    tip: `${numberedBullets} of ${totalBullets} bullets include numbers. Add percentages, dollar amounts, team sizes, or time-to-value (e.g. "cut deploy time by 40%").`,
  })

  /* ── 6. Impact verbs (10 pts) ────────────────────────────────────── */
  const impactBullets = countBulletsWithImpactVerb(text)
  const impactRatio = totalBullets === 0 ? 0 : impactBullets / totalBullets
  const impactEarned = impactRatio >= 0.6 ? 10 : impactRatio >= 0.3 ? 6 : impactBullets > 0 ? 3 : 0
  checks.push({
    id: 'impact_verbs',
    label: 'Strong action verbs in bullet points',
    points: 10,
    earned: impactEarned,
    passed: impactRatio >= 0.6,
    tip: `Start bullets with verbs like "Led", "Built", "Reduced", "Launched". Currently ${impactBullets} of ${totalBullets} do.`,
  })

  /* ── 7. Skills section (10 pts) ─────────────────────────────────── */
  const hasSkills = hasSectionHeading(text, 'skills')
  // Count skill-like comma-separated items
  const skillLinesMatch = text.match(/(?:skills|technologies|tools)[:\s\n]+([^\n]+(?:\n[^\n]+){0,5})/i)
  const skillItems = skillLinesMatch ? skillLinesMatch[1].split(/[,·|•]/).filter((s) => s.trim().length > 1).length : 0
  const skillEarned = skillItems >= 10 ? 10 : skillItems >= 5 ? 7 : hasSkills ? 4 : 0
  checks.push({
    id: 'skills',
    label: 'Skills section with multiple skills',
    points: 10,
    earned: skillEarned,
    passed: skillItems >= 10,
    tip: `Found ~${skillItems} skill item${skillItems !== 1 ? 's' : ''}. List 10+ technical skills grouped by category (Languages, Tools, Frameworks).`,
  })

  /* ── 8. Education section (5 pts) ───────────────────────────────── */
  const hasEdu = hasSectionHeading(text, 'education')
  checks.push({
    id: 'education',
    label: 'Education section present',
    points: 5,
    earned: hasEdu ? 5 : 0,
    passed: hasEdu,
    tip: 'Add an "Education" section with your degree, institution, and graduation year.',
  })

  /* ── 9. Online links (10 pts) ───────────────────────────────────── */
  const hasLinkedIn = /linkedin\.com\/in\//i.test(text)
  const hasGitHub = /github\.com\//i.test(text)
  const hasWebsite = /https?:\/\/(?!linkedin|github)/i.test(text)
  const linkCount = [hasLinkedIn, hasGitHub, hasWebsite].filter(Boolean).length
  const linkEarned = linkCount >= 2 ? 10 : linkCount === 1 ? 5 : 0
  checks.push({
    id: 'links',
    label: 'LinkedIn or GitHub profile linked',
    points: 10,
    earned: linkEarned,
    passed: linkCount >= 2,
    tip: 'Include your LinkedIn URL and GitHub profile (or personal site). Recruiters actively click these.',
  })

  /* ── 10. Projects section (5 pts) ──────────────────────────────── */
  const hasProjects = hasSectionHeading(text, 'projects')
  checks.push({
    id: 'projects',
    label: 'Projects section present',
    points: 5,
    earned: hasProjects ? 5 : 0,
    passed: hasProjects,
    tip: 'Add a "Projects" section with 2–3 notable projects, brief descriptions, and tech used.',
  })

  const earned = checks.reduce((s, c) => s + c.earned, 0)
  const total = checks.reduce((s, c) => s + c.points, 0)
  const pct = Math.round((earned / total) * 100)
  const category =
    pct >= 86 ? 'excellent' : pct >= 71 ? 'good' : pct >= 46 ? 'fair' : 'weak'

  return { total: pct, category, checks, wordCount }
}
