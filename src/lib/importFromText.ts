import { newId } from './id'
import type { Certification, EducationItem, ExperienceItem, ProjectItem, ResumeData, SkillGroup } from '../types/resume'

/** Normalize PDF-extracted noise: line endings, NBSP, markdown-ish bullets. */
function normalizeRaw(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+$/gm, '')
}

/**
 * If PDF text still has section titles glued to prior text on one line, insert breaks so
 * header-based parsing can find experience / education / skills blocks.
 */
function splitGluedSectionHeadings(text: string): string {
  const t = text.replace(
    /(\s+|\n)((?:Work|Employment|Career)\s+History|(?:Professional|Work)\s+Experience|Relevant\s+Experience|Positions\s+Held|Professional\s+Background|Academic\s+Background|Core\s+Competencies|Technical\s+Skills|Key\s+Skills|Areas\s+of\s+Expertise|Professional\s+Summary|Career\s+Summary|Tools\s*&\s*Technologies)\b/gi,
    '\n$2',
  )
  return t.replace(/\n{3,}/g, '\n\n')
}

/** Strip common decoration from heading / title lines. */
function cleanLine(s: string): string {
  return s
    .replace(/^[*#_\s•-]+/g, '')
    .replace(/[*#_\s]+$/g, '')
    .trim()
}

/**
 * Normalize a line to compare against known resume section headers (PDFs vary a lot).
 */
function headerKeyFromLine(line: string): string | null {
  let s = cleanLine(line)
    .replace(/\uFEFF/g, '')
    .replace(/[\u200B-\u200D]/g, '')
    .replace(/[:：.·]+$/g, '')
    .replace(/^[\d.)]+\s+/u, '')
    .trim()
    .toLowerCase()
  s = s.replace(/\s+/g, ' ')
  if (s.length > 72) return null
  return s || null
}

/** Headers that END the current section (any section start). */
const ALL_SECTION_HEADERS = new Set([
  'summary',
  'professional summary',
  'executive summary',
  'career summary',
  'profile',
  'objective',
  'career objective',
  'overview',
  'about me',
  'highlights',
  'experience',
  'work experience',
  'professional experience',
  'employment',
  'employment history',
  'work history',
  'career history',
  'relevant experience',
  'positions held',
  'professional background',
  'employment experience',
  'industry experience',
  'education',
  'academic background',
  'academics',
  'academic qualifications',
  'qualifications',
  'university',
  'skills',
  'technical skills',
  'core competencies',
  'key skills',
  'core skills',
  'skills & tools',
  'skills and tools',
  'expertise',
  'competencies',
  'tools & technologies',
  'strengths',
  'areas of expertise',
  'technical proficiencies',
  'computer skills',
  'software',
  'projects',
  'portfolio',
  'selected projects',
  'personal projects',
  'key projects',
  'certifications',
  'certificates',
  'licenses',
  'licences',
  'awards',
  'honors',
  'honours',
  'achievements',
  'languages',
  'volunteer',
  'leadership',
  'publications',
  'references',
  'contact',
])

const SUMMARY_HEADERS = new Set([
  'summary',
  'professional summary',
  'executive summary',
  'career summary',
  'profile',
  'objective',
  'career objective',
  'overview',
  'about me',
  'highlights',
])

const EXPERIENCE_HEADERS = new Set([
  'experience',
  'work experience',
  'professional experience',
  'employment',
  'employment history',
  'work history',
  'career history',
  'relevant experience',
  'positions held',
  'professional background',
  'employment experience',
  'industry experience',
])

const EDUCATION_HEADERS = new Set([
  'education',
  'academic background',
  'academics',
  'academic qualifications',
  'qualifications',
  'university',
])

const SKILLS_HEADERS = new Set([
  'skills',
  'technical skills',
  'core competencies',
  'key skills',
  'core skills',
  'skills & tools',
  'skills and tools',
  'expertise',
  'competencies',
  'tools & technologies',
  'strengths',
  'areas of expertise',
  'technical proficiencies',
  'computer skills',
  'software',
])

const PROJECTS_HEADERS = new Set([
  'projects',
  'portfolio',
  'selected projects',
  'personal projects',
  'key projects',
])

const CERT_HEADERS = new Set([
  'certifications',
  'certificates',
  'licenses',
  'licences',
  'professional certifications',
])

const AWARDS_HEADERS = new Set(['awards', 'honors', 'honours', 'achievements'])

/** Slice body after a known header line until another known section header. */
function extractSectionByHeaders(text: string, startHeaders: Set<string>): string {
  const lines = text.split('\n')
  let i = 0
  while (i < lines.length) {
    const key = headerKeyFromLine(lines[i] ?? '')
    if (key && startHeaders.has(key)) {
      i++
      const buf: string[] = []
      while (i < lines.length) {
        const k2 = headerKeyFromLine(lines[i] ?? '')
        if (k2 && ALL_SECTION_HEADERS.has(k2) && !startHeaders.has(k2)) break
        buf.push(lines[i] ?? '')
        i++
      }
      return buf.join('\n').trim()
    }
    i++
  }
  return ''
}

/** "Loose" extract: heading may appear mid-line in mangled PDFs */
function extractSectionRegexBlock(text: string, startPattern: RegExp, stopPattern: RegExp): string {
  const m = startPattern.exec(text)
  if (!m || m.index === undefined) return ''
  const from = m.index + m[0].length
  const rest = text.slice(from)
  const stopM = stopPattern.exec(rest)
  const end = stopM && stopM.index !== undefined ? stopM.index : rest.length
  return rest.slice(0, end).trim()
}

/** Any standard section title (for stopping & fallbacks). */
const SECTION_STOP =
  /^(experience|work\s*experience|employment(?:\s+history)?|professional\s*experience|work\s*history|career(?:\s*history)?|education|academic|skills|technical\s*skills|core\s*competencies|key\s*skills|projects|portfolio|certifications?|licen[sc]es?|awards?|honou?rs|publications?|summary|profile|objective|professional\s*summary|overview|about\s*me|languages?|volunteer|volunteering|leadership|interests|references?|contact)\b/i

const EXPERIENCE_START =
  /^(experience|work\s*experience|employment(?:\s+history)?|professional\s*experience|work\s*history|career(\s*history)?|relevant\s*experience|positions\s*held|professional\s*background)\b/i

const EDUCATION_START =
  /^(education|academic(\s*background)?|qualifications|academic\s*qualifications|university)\b/i

/** Next section boundary for regex-based extraction (mangled PDFs). */
const RX_STOP_MAJOR =
  /\n\s*(?:(?:work\s*)?experience|employment(?:\s+history)?|work\s+history|career\s+history|professional\s+background|education|academics?|university|skills|technical\s+skills|core\s+competencies|expertise|competencies|strengths|projects|portfolio|certifications?|licen[sc]es?|summary|professional\s+summary|profile|objective|overview|about\s+me|awards?|languages?|references?|contact|qualifications?)\b/i

/** Month + year, year ranges, Present / Current */
const DATE_RANGE_IN_LINE =
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b(?:0?[1-9]|1[0-2])[/-]\d{4}\b|\b(19|20)\d{2}\b)\s*[-–—]\s*(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|(?:0?[1-9]|1[0-2])[/-]\d{4}|\d{4})/i

function extractSummary(text: string): string {
  let body = extractSectionByHeaders(text, SUMMARY_HEADERS)
  if (body.length < 25) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,40}\b(?:(?:professional\s*)?summary|profile|objective|overview|about\s*me)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  if (body.length >= 15) return body.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()

  const m = text.match(
    /(?:summary|profile|objective|about\s*me|professional\s*summary)\s*[:\s]*\n([\s\S]+?)(?=\n\s*(?:EXPERIENCE|WORK|EDUCATION|SKILLS|PROJECTS|CERT)\b|\n{3,}|$)/i,
  )
  if (m?.[1]) return m[1].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()

  /* Prose before first major section (common one-column PDFs) */
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  let start = 0
  while (start < lines.length && start < 15) {
    const L = cleanLine(lines[start])
    if (SECTION_STOP.test(L) && L.length < 90) break
    if (/^https?:\/\//i.test(L) || /@/.test(L)) {
      start++
      continue
    }
    if (/^[A-Za-z .'’-]{3,70}$/.test(L) && L.split(/\s+/).length <= 8 && start === 0) {
      start++
      continue /* skip name */
    }
    if (/^[A-Za-z .'’|/&+()-]{5,90}$/.test(L) && start === 1) {
      start++
      continue /* skip headline */
    }
    break
  }
  const buf: string[] = []
  for (let i = start; i < Math.min(lines.length, start + 14); i++) {
    const L = cleanLine(lines[i])
    if (SECTION_STOP.test(L) && L.length < 90) break
    if (L.length < 400) buf.push(L)
    else break
  }
  const joined = buf.join(' ').trim()
  if (joined.length >= 40 && !EXPERIENCE_START.test(joined)) return joined

  return ''
}

function extractLocation(full: string): string {
  const labeled = full.match(/(?:^|\n)\s*(?:address|location)\s*[:,-]\s*(.+?)(?:\n|$)/i)
  if (labeled) return labeled[1].trim()

  const lines = full.split('\n').slice(0, 18)
  for (const line of lines) {
    const t = line.trim()
    /* City, ST, ZIP (US) */
    if (/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2},?\s*(?:\d{5}(?:-\d{4})?)?\b/.test(t)) {
      const m = t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}(?:,\s*\d{5}(?:-\d{4})?)?)\b/)
      if (m) return m[1]
    }
    /* India pincode */
    if (/\b\d{6}\b/.test(t) && /[A-Za-z]/.test(t)) {
      const m = t.match(/(.+?)\s*[-–,]\s*\d{6}/)
      if (m) return m[1].trim().slice(0, 120)
    }
    /* City, Country */
    if (/\b[a-z]+,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/.test(t) && !/@/.test(t)) {
      const m = t.match(/\b([A-Za-z .'-]+,\s*[A-Za-z .'-]+)\b/)
      if (m && m[1].length < 80) return m[1]
    }
  }
  return ''
}

function pullUrlsAndContacts(text: string): Pick<ResumeData, 'email' | 'phone' | 'linkedin' | 'github' | 'website'> {
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? ''
  const phone =
    text.match(/(?:\+\d{1,3}[-.\s()])?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/)?.[0] ??
    text.match(/(?:\+\d[\d\s().-]{8,}\d)/)?.[0] ??
    text.match(/\+?\d[\d\s\-.()]{8,}\d/)?.[0] ??
    ''

  let linkedin = ''
  let github = ''
  let website = ''
  const candidates =
    text.match(
      /https?:\/\/[^\s)\]]+|(?:www\.)?linkedin\.com\/[^\s)\]]+|(?:www\.)?github\.com\/[^\s)\]]+/gi,
    ) ?? []
  for (const rawU of candidates) {
    const u = rawU.replace(/[),.;:]+$/,'')
    const lower = u.toLowerCase()
    if (lower.includes('linkedin')) linkedin = u.replace(/^https?:\/\//i, '')
    else if (lower.includes('github')) github = u.replace(/^https?:\/\//i, '')
    else if (!website && /^https?:\/\//i.test(u)) website = u
  }
  return { email, phone, linkedin, github, website }
}

function isNoiseHeaderLine(line: string): boolean {
  const L = cleanLine(line)
  if (!L) return true
  if (L.includes('@')) return true
  if (/^https?:\/\//i.test(L) || /linkedin\.com|github\.com/i.test(L)) return true
  if (SECTION_STOP.test(L) || EXPERIENCE_START.test(L) || EDUCATION_START.test(L)) return true
  if (/^(address|phone|email|location|tel|mobile|cell|fax)\b/i.test(L)) return true
  if (/^(resume|curriculum vitae|\bcv\b)\b/i.test(L)) return true
  if (/^page\s+\d+\s*(?:of\s*\d+)?$/i.test(L)) return true
  if (/^[—\-_\s]{2,}$/.test(L)) return true
  return false
}

/** Letters + common punctuation (accented names, hyphens, apostrophes). */
function looksLikePersonName(line: string): boolean {
  const t = line.replace(/^\*+|\*+$/g, '').trim()
  if (t.length < 2 || t.length > 95) return false
  if (/\d/.test(t)) return false
  if (/[@/\\]/.test(t)) return false
  if (
    /^[\p{L}][\p{L}\s.'’-]*,\s*[\p{L}][\p{L}\s.'’-]*$/u.test(t) &&
    t.split(',').length === 2
  ) {
    return true
  }
  if (!/^[\p{L}][\p{L}\s.'’-]*$/u.test(t)) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length === 0 || words.length > 12) return false
  if (words.length === 1) return words[0].length >= 4
  if (words.length >= 6 && t === t.toLowerCase()) return false
  if (
    words.length === 2 &&
    /^(Senior|Junior|Staff|Principal|Lead|Chief|Associate|Assistant|Regional|Global)\b/i.test(t) &&
    /(Analyst|Engineer|Developer|Manager|Director|Consultant|Designer|Architect|Specialist|Coordinator)$/i.test(
      words[1] ?? '',
    )
  ) {
    return false
  }
  return true
}

function normalizeLastCommaFirst(line: string): string {
  const t = line.replace(/^\*+|\*+$/g, '').trim()
  const m = /^([\p{L}][\p{L}\s.'’-]+),\s*([\p{L}][\p{L}\s.'’-]+)$/u.exec(t)
  if (!m) return t
  return `${m[2].trim()} ${m[1].trim()}`
}

/** PDFs often output first and last name on adjacent lines. */
function tryMergeTwoLineName(lines: string[], i: number): { merged: string; consumed: number } | null {
  const a = lines[i] ?? ''
  const b = lines[i + 1] ?? ''
  if (!a || !b || isNoiseHeaderLine(a) || isNoiseHeaderLine(b)) return null
  if (DATE_RANGE_IN_LINE.test(b) || SECTION_STOP.test(b)) return null
  const wa = a.split(/\s+/).filter(Boolean)
  const wb = b.split(/\s+/).filter(Boolean)
  if (wa.length < 1 || wa.length > 2 || wb.length < 1 || wb.length > 2) return null
  if (a.length > 40 || b.length > 40) return null
  const merged = `${a} ${b}`.trim()
  if (!looksLikePersonName(merged)) return null
  return { merged, consumed: 1 }
}

function extractLabeledFullName(text: string): string {
  const patterns = [
    /(?:^|\n)\s*(?:full\s*name|candidate|applicant)\s*[:]\s*([^\n]+)/i,
    /(?:^|\n)\s*name\s*[:]\s*([^\n]+)/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const v = cleanLine(m[1])
      if (v.length >= 3 && v.length < 100 && !v.includes('@')) {
        const noPipe = v.replace(/\s*\|.*$/, '').trim()
        return normalizeLastCommaFirst(noPipe)
      }
    }
  }
  return ''
}

function extractLabeledHeadlineOrTitle(text: string): string {
  const m = text.match(
    /(?:^|\n)\s*(?:title|headline|position|role|job\s*title)\s*[:]\s*([^\n]+)/i,
  )
  if (!m) return ''
  return cleanLine(m[1]).replace(/\s*\|.*$/, '').trim().slice(0, 120)
}

function guessNameFromTextBeforeEmail(text: string, email: string): string {
  if (!email) return ''
  const idx = text.indexOf(email)
  if (idx <= 0) return ''
  const before = text.slice(Math.max(0, idx - 1600), idx)
  const lines = before.split('\n').map((l) => cleanLine(l)).filter(Boolean)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i] ?? ''
    if (isNoiseHeaderLine(line)) continue
    if (line.length > 100) continue
    if (line.includes('|') && !DATE_RANGE_IN_LINE.test(line)) {
      const left = line.split('|')[0]?.trim() ?? ''
      if (looksLikePersonName(left)) return normalizeLastCommaFirst(left)
    }
    if (looksLikePersonName(line)) return normalizeLastCommaFirst(line)
  }
  return ''
}

function guessNameAndHeadline(text: string): { fullName: string; headline: string } {
  const lines = text.split('\n').map((l) => cleanLine(l)).filter(Boolean)

  for (let i = 0; i < Math.min(22, lines.length); i++) {
    const line = lines[i] ?? ''
    if (isNoiseHeaderLine(line)) continue
    if (line.includes('|') && !DATE_RANGE_IN_LINE.test(line)) {
      const parts = line.split('|').map((p) => p.trim()).filter(Boolean)
      if (parts.length >= 2) {
        const left = parts[0] ?? ''
        const right = parts.slice(1).join(' · ')
        const nameCandidate = normalizeLastCommaFirst(left)
        if (looksLikePersonName(left) && right.length > 0 && right.length < 130) {
          return { fullName: nameCandidate, headline: right }
        }
      }
    }
  }

  let scan = 0
  while (scan < Math.min(28, lines.length) && isNoiseHeaderLine(lines[scan] ?? '')) {
    scan++
  }

  for (let i = scan; i < Math.min(scan + 20, lines.length); i++) {
    let line = lines[i] ?? ''
    if (isNoiseHeaderLine(line)) continue
    let extraSkip = 0
    if (line.length <= 45) {
      const two = tryMergeTwoLineName(lines, i)
      if (two) {
        line = two.merged
        extraSkip = two.consumed
      }
    }
    if (line.length > 100) continue
    if (!looksLikePersonName(line)) continue

    const fullName = normalizeLastCommaFirst(line)
    let headline = ''
    for (let j = i + 1 + extraSkip; j < Math.min(i + 6 + extraSkip, lines.length); j++) {
      const next = lines[j] ?? ''
      if (isNoiseHeaderLine(next)) continue
      if (!next || next.length > 120) break
      if (SECTION_STOP.test(next) && next.length < 90) break
      if (DATE_RANGE_IN_LINE.test(next)) break
      if (looksLikePersonName(next) && next.split(/\s+/).length <= 3) continue
      headline = next.replace(/^\*+|\*+$/g, '').trim()
      break
    }
    return { fullName, headline }
  }

  return { fullName: '', headline: '' }
}

function mergeNameAndHeadline(text: string, email: string): { fullName: string; headline: string } {
  const labeledName = extractLabeledFullName(text)
  const labeledTitle = extractLabeledHeadlineOrTitle(text)
  let { fullName, headline } = guessNameAndHeadline(text)

  if (!fullName || fullName.length < 2) fullName = labeledName
  else if (labeledName.length >= 3 && labeledName.length > fullName.length) fullName = labeledName

  if ((!headline || headline.length < 2) && labeledTitle) headline = labeledTitle

  if (!fullName || fullName.length < 2) {
    const fromEmail = guessNameFromTextBeforeEmail(text, email)
    if (fromEmail) fullName = fromEmail
  }

  if ((!fullName || fullName.length < 2) && email.includes('@')) {
    const local = email.split('@')[0] ?? ''
    const parts = local.split(/[._-]+/).filter((p) => /^[a-z]+$/i.test(p) && p.length > 1)
    if (parts.length >= 2) {
      fullName = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }
  }

  if (!fullName || fullName.length < 2) fullName = email ? 'Imported resume' : 'Your name'

  return { fullName, headline }
}

function parseExperienceDates(line: string): { start: string; end: string } {
  const dm = line.match(DATE_RANGE_IN_LINE)
  if (dm) {
    const full = dm[0]
    const parts = full.split(/\s*[-–—]\s*/)
    if (parts.length >= 2) return { start: parts[0].trim(), end: parts[parts.length - 1].trim() }
  }
  const yrs = line.match(/(19|20)\d{2}/g)
  if (yrs?.length) return { start: yrs[0], end: yrs[1] ?? 'Present' }
  return { start: '', end: '' }
}

/** True if line likely starts a job entry (not education). */
function looksLikeJobHeader(line: string): boolean {
  const t = cleanLine(line)
  if (!t || t.length > 180) return false
  if (/^\s*[•*►-]/.test(line)) return false
  if (/\b(bachelor|master|mba|ph\.?d|diploma|degree|university|college)\b/i.test(t)) return false
  const hasPipeDates = /\|/.test(t) && /(19|20)\d{2}|present|current/i.test(t)
  const hasDateRange = DATE_RANGE_IN_LINE.test(t)
  return hasPipeDates || hasDateRange
}

function chunkHasJobDate(lines: string[]): boolean {
  return lines.some(
    (l) => DATE_RANGE_IN_LINE.test(l) || (/\|/.test(l) && /(19|20)\d{2}/i.test(l)),
  )
}

function chunkHasBullets(lines: string[]): boolean {
  return lines.some((l) => /^\s*[•*►▶▸→\-–]/.test(l))
}

/** New role/title line — not a date, not a bullet, not education noise. */
function looksLikeStandaloneTitleLine(line: string): boolean {
  const t = cleanLine(line)
  if (!t || t.length < 3 || t.length > 92) return false
  if (/^\s*[•*►▶▸→\-–]/.test(line)) return false
  if (DATE_RANGE_IN_LINE.test(t)) return false
  if (/\b(bachelor|master|mba|ph\.?d|diploma|degree|university|college)\b/i.test(t)) return false
  return true
}

function splitExperienceBodyIntoJobs(body: string): string[] {
  const lines = body.split('\n')
  const jobs: string[] = []
  let buf: string[] = []

  const flush = () => {
    if (buf.length) {
      jobs.push(buf.join('\n').trim())
      buf = []
    }
  }

  for (const rawLine of lines) {
    const t = rawLine.trim()
    if (!t) continue

    const bufHasDate = chunkHasJobDate(buf)
    const bufHasBullets = chunkHasBullets(buf)
    const startsWithStrongJobCue = looksLikeJobHeader(t)
    const lineIsDateOnly =
      DATE_RANGE_IN_LINE.test(t) && cleanLine(t).length < 96 && !/^\s*[•*]/.test(rawLine)

    /* Next role's date line after a complete job (date and body, or multi-line stub). */
    if (lineIsDateOnly && buf.length > 0 && bufHasDate && (bufHasBullets || buf.length >= 2)) {
      flush()
      buf.push(rawLine)
      continue
    }

    if (startsWithStrongJobCue && buf.length > 0) {
      /* Date line immediately after role / company — same job. */
      if (lineIsDateOnly && !bufHasDate && !bufHasBullets) {
        buf.push(rawLine)
        continue
      }
      if (bufHasDate || bufHasBullets) {
        flush()
        buf.push(rawLine)
        continue
      }
    }

    /* Bullet-less jobs: new title after role + company + dates block. */
    if (
      buf.length >= 2 &&
      bufHasDate &&
      !bufHasBullets &&
      looksLikeStandaloneTitleLine(rawLine)
    ) {
      flush()
      buf.push(rawLine)
      continue
    }

    if (buf.length > 0 && bufHasBullets && looksLikeStandaloneTitleLine(rawLine)) {
      flush()
      buf.push(rawLine)
      continue
    }

    buf.push(rawLine)
  }
  flush()

  if (jobs.length > 0) return jobs

  /* Fallback: blank-line chunks */
  return body
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean)
}

function parseOneExperienceChunk(chunk: string): ExperienceItem | null {
  const lines = chunk
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (!lines.length) return null

  let role: string
  let company = ''
  let start = ''
  let end = ''
  const bullets: string[] = []

  const first = cleanLine(lines[0])
  let i: number

  if (first.includes('|')) {
    const parts = first.split('|').map((p) => p.trim())
    role = parts[0].replace(/\*+/g, '').trim() || 'Role'
    const tail = parts.slice(1).join(' | ')
    const d = parseExperienceDates(tail)
    start = d.start
    end = d.end
    if (!start && parts[1]) {
      const extra = parseExperienceDates(parts[1])
      start = extra.start
      end = extra.end
    }
    i = 1
  } else {
    const dateIdx = lines.findIndex((l) => DATE_RANGE_IN_LINE.test(l) || (/\d{4}/.test(l) && /[-–—]/.test(l)))
    if (dateIdx === 1) {
      role = cleanLine(lines[0]).replace(/\*+/g, '').trim()
      const d = parseExperienceDates(lines[dateIdx])
      start = d.start
      end = d.end
      i = dateIdx + 1
    } else if (dateIdx === 0) {
      const d = parseExperienceDates(lines[0])
      start = d.start
      end = d.end
      const head = lines[0].replace(DATE_RANGE_IN_LINE, '').trim()
      const at = head.split(/\s+@\s+|\s+at\s+/i)
      if (at.length >= 2) {
        role = at[0].trim()
        company = at[1].replace(/[|·].*$/, '').trim()
      } else {
        const pipe = head.split(/\s*[|·]\s*/)
        role = pipe[0]?.trim() || head || 'Role'
        company = pipe[1]?.trim() ?? ''
      }
      i = 1
    } else {
      role = cleanLine(lines[0]).replace(/\*+/g, '').trim() || 'Role'
      company = cleanLine(lines[1] ?? '').replace(/\*+/g, '').trim() || ''
      i = 2
      for (; i < lines.length; i++) {
        const d = parseExperienceDates(lines[i])
        if (d.start || d.end) {
          start = d.start
          end = d.end
          i++
          break
        }
      }
    }
  }

  /* Company line often follows role|dates: "Co. - City, ST" */
  if (i < lines.length) {
    const next = cleanLine(lines[i])
    if (next && !/^\s*[•*►-]/.test(lines[i]) && !DATE_RANGE_IN_LINE.test(next)) {
      if (!company || company.length < 2) {
        company = next.replace(/\*+/g, '').trim()
        i++
      } else if (!next.includes('|') && next.length < 120) {
        company = `${company} — ${next.replace(/\*+/g, '').trim()}`
        i++
      }
    }
  }

  for (; i < lines.length; i++) {
    const b = lines[i].replace(/^\s*[•*►▶▸→\-–]\s*/, '').trim()
    if (b) bullets.push(b)
  }

  if (!role && !company && !bullets.length) return null

  return {
    id: newId(),
    company: company || 'Company',
    role: role || 'Title',
    start,
    end,
    bullets: bullets.length ? bullets : [''],
  }
}

function parseExperienceBody(body: string): ExperienceItem[] {
  if (!body.trim()) return []
  const items: ExperienceItem[] = []
  for (const chunk of splitExperienceBodyIntoJobs(body)) {
    const item = parseOneExperienceChunk(chunk)
    if (item) items.push(item)
  }
  return items
}

function extractExperience(text: string): ExperienceItem[] {
  let body = extractSectionByHeaders(text, EXPERIENCE_HEADERS)
  if (body.length < 40) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,24}\b(?:(?:relevant\s+)?(?:work\s*)?experience|employment(?:\s*history)?|work\s*history|professional\s*experience|career\s*history|positions\s*held|professional\s*background|employment\s*experience|industry\s*experience)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  return parseExperienceBody(body)
}

function extractEducation(text: string): EducationItem[] {
  let body = extractSectionByHeaders(text, EDUCATION_HEADERS)
  if (body.length < 25) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,20}\b(?:education|academic(?:\s*background)?|qualifications?|university)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  if (!body.trim()) return []

  const items: EducationItem[] = []
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => cleanLine(l)).filter(Boolean)
    if (!lines.length) continue

    const rangeM = block.match(/((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|Present|Current)/i)
    let yearFromBlock = ''
    if (rangeM) yearFromBlock = `${rangeM[1]} – ${rangeM[2]}`
    else {
      const ys = block.match(/(19|20)\d{2}/g)
      if (ys?.length) yearFromBlock = [...new Set(ys)].join(' – ')
    }

    const singleLinePipe = lines[0].includes('|')
    if (singleLinePipe) {
      const [left, right] = lines[0].split('|').map((s) => s.trim())
      const y = right?.match(/(19|20)\d{2}/g)
      const school = left.replace(/\*+/g, '').trim()
      const degreeLine =
        lines[1] && lines[1].includes('|')
          ? lines[1]
              .split('|')
              .map((s) => s.trim())
              .filter(Boolean)
              .join(' · ')
          : (lines[1] ?? right ?? '')
      const yearStr = y?.join(' – ') || yearFromBlock
      const degreeClean = degreeLine.replace(/\*+/g, '').trim()
      items.push({
        id: newId(),
        school: school || 'School',
        degree:
          degreeClean ||
          (right && !/(19|20)\d{2}/.test(right) ? right.replace(/\*+/g, '').trim() : '') ||
          'Degree',
        year: yearStr,
      })
      continue
    }

    const yearMatch = block.match(/(19|20)\d{2}/)
    const yearSingle = yearFromBlock || (yearMatch ? yearMatch[0] : '')
    const degreeLine =
      lines.find((l) =>
        /\b(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|M\.?Sc|Ph\.?D\.?|MBA|Bachelor|Master|Associate|Diploma|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?)\b/i.test(
          l,
        ),
      ) ?? lines[0]
    const schoolLine =
      lines.find((l) => l !== degreeLine && l.length > 3 && !/^[•*]/.test(l)) ?? lines[1] ?? ''
    items.push({
      id: newId(),
      school: schoolLine.replace(/[|,].*$/, '').replace(/\*+/g, '').trim() || 'School',
      degree: degreeLine.replace(/\*+/g, '').trim(),
      year: yearSingle,
    })
  }
  return items
}

/** Skill bullets, "Category: a, b", or comma / pipe lists → skill groups. */
function parseSkillsBody(body: string): SkillGroup[] {
  const raw = body.trim()
  if (!raw || raw.length < 2) return []

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  const groups: SkillGroup[] = []

  const categoryLine = /^([\p{L}][\w\s/&+().-]{1,48})\s*[:|–—]\s*(.+)$/iu

  for (const line of lines) {
    const m = line.match(categoryLine)
    if (m && m[2].trim().length > 1) {
      groups.push({ id: newId(), title: m[1].trim(), skills: m[2].trim() })
    }
  }
  if (groups.length) return groups

  const bullets = lines.filter((l) => /^\s*[•*►▶▸→\-–]/.test(l)).map((l) => l.replace(/^\s*[•*►▶▸→\-–]+\s*/, '').trim())
  if (bullets.length) {
    return [{ id: newId(), title: 'Skills', skills: bullets.join(', ') }]
  }

  const flat = raw.replace(/\n+/g, ', ').replace(/\s*,\s*/g, ', ').trim()
  return [{ id: newId(), title: 'Skills', skills: flat }]
}

function extractSkills(text: string): SkillGroup[] {
  let body = extractSectionByHeaders(text, SKILLS_HEADERS)
  if (body.length < 15) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,24}\b(?:(?:technical\s*)?skills|expertise|core\s*competencies|key\s*skills|competencies|tools\s*&\s*technologies|strengths|areas\s*of\s*expertise|technical\s*proficiencies|computer\s*skills)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  return parseSkillsBody(body)
}

function extractProjects(text: string): ProjectItem[] {
  let body = extractSectionByHeaders(text, PROJECTS_HEADERS)
  if (body.length < 20) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,20}\b(?:projects|portfolio|selected\s*projects)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  if (!body.trim()) return []
  const chunks = body.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean)
  return chunks.slice(0, 12).map((chunk) => {
    const lines = chunk.split('\n').map((l) => cleanLine(l)).filter(Boolean)
    const name = lines[0]?.replace(/\*+/g, '').trim() ?? 'Project'
    const urlMatch = chunk.match(/https?:\/\/[^\s)]+/)
    const description = lines.slice(1).join(' ').trim() || name
    return { id: newId(), name, description, url: urlMatch?.[0] ?? '' }
  })
}

function extractCertifications(text: string): Certification[] {
  let body = extractSectionByHeaders(text, CERT_HEADERS)
  if (body.length < 15) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,28}\b(?:certifications?|certificates?|licen[sc]es?)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  const fromCert = parseCertLines(body)
  if (fromCert.length) return fromCert

  const awardsBody = extractSectionByHeaders(text, AWARDS_HEADERS)
  return parseCertLines(awardsBody)
}

function parseCertLines(body: string): Certification[] {
  if (!body.trim()) return []
  const lines = body.split('\n').map((l) => cleanLine(l)).filter(Boolean)
  return lines.slice(0, 16).map((line) => {
    const parts = line.split(/\s*(?:\||\u2013|\u2014|-(?=\s*\w))\s*/)
    return {
      id: newId(),
      name: parts[0]?.trim() || line,
      issuer: parts.slice(1).join(' · ').trim() ?? '',
    }
  })
}

/** Map award lines into certifications list (same form fields). */
function extractAwardsAsCerts(text: string): Certification[] {
  let body = extractSectionByHeaders(text, AWARDS_HEADERS)
  if (body.length < 15) {
    body = extractSectionRegexBlock(
      text,
      /(?:^|\n)\s*[^\n]{0,24}\b(?:awards?|honou?rs|achievements)\b[^\n]*\n/i,
      RX_STOP_MAJOR,
    )
  }
  return parseCertLines(body)
}

/**
 * Best-effort import from plain text (e.g. PDF extraction). User should review fields in the editor.
 */
export function importResumeFromPlainText(raw: string): ResumeData {
  const text = splitGluedSectionHeadings(normalizeRaw(raw))
  const contacts = pullUrlsAndContacts(text)
  const { fullName, headline } = mergeNameAndHeadline(text, contacts.email)
  const summary = extractSummary(text)
  let experience = extractExperience(text)
  let education = extractEducation(text)
  let skills = extractSkills(text)
  const projects = extractProjects(text)
  const certifications = extractCertifications(text)
  const location = extractLocation(text)

  const extraAwards = extractAwardsAsCerts(text)
  if (extraAwards.length) {
    const names = new Set(certifications.map((c) => c.name.toLowerCase()))
    for (const a of extraAwards) {
      if (!names.has(a.name.toLowerCase())) {
        certifications.push(a)
        names.add(a.name.toLowerCase())
      }
    }
  }

  if (experience.length === 0) {
    experience = [
      {
        id: newId(),
        company: '',
        role: '',
        start: '',
        end: '',
        bullets: [''],
      },
    ]
  }
  if (education.length === 0) {
    education = [{ id: newId(), school: '', degree: '', year: '' }]
  }
  if (skills.length === 0) {
    skills = [{ id: newId(), title: 'Skills', skills: '' }]
  }

  return {
    fullName,
    headline,
    email: contacts.email,
    phone: contacts.phone,
    location,
    website: contacts.website,
    linkedin: contacts.linkedin,
    github: contacts.github,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    extraColumnEnabled: false,
    extraColumnTitle: '',
    extraColumnBody: '',
    fontSizePreset: 'default',
  }
}
