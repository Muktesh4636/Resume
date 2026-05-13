import type { ResumeData } from '../types/resume'

export type ScoreCategory = 'excellent' | 'good' | 'fair' | 'weak'

export type CheckResult = {
  id: string
  label: string
  points: number
  earned: number
  passed: boolean
  tip: string
}

export type ResumeScore = {
  total: number        // 0–100
  earned: number
  category: ScoreCategory
  checks: CheckResult[]
}

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function hasNumbers(s: string): boolean {
  return /\d/.test(s)
}

const IMPACT_VERBS = [
  'led', 'built', 'shipped', 'launched', 'designed', 'developed', 'improved',
  'reduced', 'increased', 'grew', 'managed', 'delivered', 'created', 'achieved',
  'drove', 'accelerated', 'optimized', 'implemented', 'architected', 'spearheaded',
  'scaled', 'streamlined', 'negotiated', 'oversaw', 'produced', 'transformed',
]

function hasImpactVerb(s: string): boolean {
  const lower = s.toLowerCase()
  return IMPACT_VERBS.some((v) => lower.startsWith(v) || lower.includes(` ${v} `))
}

export function scoreResume(data: ResumeData): ResumeScore {
  const checks: CheckResult[] = []

  /* ── 1. Contact completeness (15 pts) ─────────────────────────────── */
  const contactFields = [data.fullName, data.email, data.phone, data.location, data.headline].filter(
    (f) => f && f.trim().length > 0,
  )
  const contactEarned = Math.round((contactFields.length / 5) * 15)
  checks.push({
    id: 'contact',
    label: 'Contact & headline complete',
    points: 15,
    earned: contactEarned,
    passed: contactFields.length === 5,
    tip: 'Fill in your full name, email, phone, location, and headline. Recruiters filter by these first.',
  })

  /* ── 2. Professional summary (15 pts) ─────────────────────────────── */
  const summaryWords = words(data.summary)
  const summaryEarned = data.summary.trim().length === 0 ? 0 : summaryWords >= 60 ? 15 : summaryWords >= 30 ? 10 : 5
  checks.push({
    id: 'summary',
    label: 'Professional summary (60+ words)',
    points: 15,
    earned: summaryEarned,
    passed: summaryWords >= 60,
    tip: `Your summary has ${summaryWords} word${summaryWords !== 1 ? 's' : ''}. Aim for 60–100 words covering your speciality, years of experience, and top 2–3 strengths.`,
  })

  /* ── 3. Work experience present (5 pts) ───────────────────────────── */
  const hasExp = data.experience.length > 0
  checks.push({
    id: 'exp_present',
    label: 'Work experience added',
    points: 5,
    earned: hasExp ? 5 : 0,
    passed: hasExp,
    tip: 'Add at least one work experience entry, even if it is an internship, freelance, or volunteer role.',
  })

  /* ── 4. Experience bullets (10 pts) ────────────────────────────────── */
  const totalRoles = data.experience.length
  const rolesWithBullets = data.experience.filter(
    (ex) => ex.bullets.filter((b) => b.trim().length > 0).length >= 2,
  ).length
  const bulletEarned = totalRoles === 0 ? 0 : Math.round((rolesWithBullets / totalRoles) * 10)
  checks.push({
    id: 'exp_bullets',
    label: 'Each role has 2+ bullet points',
    points: 10,
    earned: bulletEarned,
    passed: totalRoles > 0 && rolesWithBullets === totalRoles,
    tip: 'Add at least 2 bullet points per role. Three to five concrete highlights per job is ideal for most resumes.',
  })

  /* ── 5. Quantified achievements (15 pts) ──────────────────────────── */
  const allBullets = data.experience.flatMap((ex) => ex.bullets.filter((b) => b.trim().length > 0))
  const quantBullets = allBullets.filter(hasNumbers).length
  const quantRatio = allBullets.length === 0 ? 0 : quantBullets / allBullets.length
  const quantEarned = allBullets.length === 0 ? 0 : quantRatio >= 0.5 ? 15 : quantRatio >= 0.25 ? 10 : quantRatio > 0 ? 5 : 0
  checks.push({
    id: 'quantified',
    label: 'Achievements include numbers/metrics',
    points: 15,
    earned: quantEarned,
    passed: quantRatio >= 0.5,
    tip: `${quantBullets} of ${allBullets.length} bullet${allBullets.length !== 1 ? 's' : ''} contain numbers. Quantify at least 50% — e.g. "Reduced load time by 35%", "Managed $2M budget".`,
  })

  /* ── 6. Impact verbs (10 pts) ──────────────────────────────────────── */
  const impactBullets = allBullets.filter(hasImpactVerb).length
  const impactRatio = allBullets.length === 0 ? 0 : impactBullets / allBullets.length
  const impactEarned = allBullets.length === 0 ? 0 : impactRatio >= 0.6 ? 10 : impactRatio >= 0.3 ? 6 : impactRatio > 0 ? 3 : 0
  checks.push({
    id: 'impact_verbs',
    label: 'Strong action verbs in bullet points',
    points: 10,
    earned: impactEarned,
    passed: impactRatio >= 0.6,
    tip: `Start bullets with strong action verbs like "Led", "Built", "Reduced", "Grew". Currently ${impactBullets} of ${allBullets.length} do.`,
  })

  /* ── 7. Skills section (10 pts) ────────────────────────────────────── */
  const skillsFilled = data.skills.filter((s) => s.skills.trim().length > 0).length
  const skillsEarned = skillsFilled >= 3 ? 10 : skillsFilled === 2 ? 7 : skillsFilled === 1 ? 4 : 0
  checks.push({
    id: 'skills',
    label: 'Skills section has 3+ groups',
    points: 10,
    earned: skillsEarned,
    passed: skillsFilled >= 3,
    tip: 'Group your skills into categories (e.g. Languages, Tools, Practices). Three or more groups signal both depth and breadth.',
  })

  /* ── 8. Education (5 pts) ──────────────────────────────────────────── */
  const hasEdu = data.education.length > 0
  checks.push({
    id: 'education',
    label: 'Education entry added',
    points: 5,
    earned: hasEdu ? 5 : 0,
    passed: hasEdu,
    tip: 'Add your highest degree. Even if you are self-taught, include any relevant courses or bootcamps.',
  })

  /* ── 9. Online presence (10 pts) ───────────────────────────────────── */
  const links = [data.linkedin, data.github, data.website].filter((l) => l && l.trim().length > 0).length
  const linksEarned = links >= 2 ? 10 : links === 1 ? 5 : 0
  checks.push({
    id: 'links',
    label: 'LinkedIn, GitHub, or website linked',
    points: 10,
    earned: linksEarned,
    passed: links >= 2,
    tip: 'Include at least two of: LinkedIn, GitHub, or personal website. Recruiters routinely click these.',
  })

  /* ── 10. Projects (5 pts) ──────────────────────────────────────────── */
  const hasProjects = data.projects.filter((p) => p.name.trim().length > 0).length > 0
  checks.push({
    id: 'projects',
    label: 'Projects section filled in',
    points: 5,
    earned: hasProjects ? 5 : 0,
    passed: hasProjects,
    tip: 'Add at least one project with a short description. Side projects demonstrate initiative and real-world skills.',
  })

  const earned = checks.reduce((sum, c) => sum + c.earned, 0)
  const total = checks.reduce((sum, c) => sum + c.points, 0)
  const pct = Math.round((earned / total) * 100)

  const category: ScoreCategory =
    pct >= 86 ? 'excellent' : pct >= 71 ? 'good' : pct >= 46 ? 'fair' : 'weak'

  return { total: pct, earned, category, checks }
}
