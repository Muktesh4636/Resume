import type { TemplateId } from '../types/resume'

/** Reference layouts from your designs (PHOTO-2026-04-26 series + blue timeline). */
export const TEMPLATE_IDS: TemplateId[] = Array.from(
  { length: 19 },
  (_, i) => `tpl-${String(i).padStart(2, '0')}` as TemplateId,
)

const IDS = new Set<string>(TEMPLATE_IDS)

export function parseTemplateId(value: string | null | undefined): TemplateId | null {
  if (!value) return null
  const v = value.toLowerCase()
  return IDS.has(v) ? (v as TemplateId) : null
}

export type TemplateMeta = {
  id: TemplateId
  name: string
  tagline: string
  palette: string
}

const REFERENCE_TEMPLATES: Omit<TemplateMeta, 'id'>[] = [
  {
    name: 'Cream Split',
    tagline: 'Warm beige left rail: contact, summary bullets, education — white body for summary, skills, work.',
    palette: 'from-stone-200 to-amber-50',
  },
  {
    name: 'Sage Sidebar',
    tagline: 'Soft green sidebar with monogram circle, contact, skill bars, certs, education.',
    palette: 'from-emerald-100 to-white',
  },
  {
    name: 'Beige Band',
    tagline: 'Sand header/footer bands, portrait circle, dot-rated skills, full single flow.',
    palette: 'from-amber-100 to-stone-100',
  },
  {
    name: 'Blue Ribbon',
    tagline: 'Sky contact banner, centered name, left rail section titles with rules.',
    palette: 'from-sky-100 to-white',
  },
  {
    name: 'Ice Header',
    tagline: 'Powder blue title band with initials, wide main column + narrow skills/edu/cert column.',
    palette: 'from-sky-200 to-white',
  },
  {
    name: 'Tan Banner',
    tagline: 'Bold tan masthead with white caps name; beige left column for contact, skills, education.',
    palette: 'from-amber-800 to-amber-100',
  },
  {
    name: 'Gold Monogram',
    tagline: 'Gold-outlined initials square, serif caps rail labels, elegant body type.',
    palette: 'from-amber-50 to-stone-100',
  },
  {
    name: 'Teal Rail',
    tagline: 'Teal-outlined initials, vertical teal section nav, clean sans body.',
    palette: 'from-teal-100 to-white',
  },
  {
    name: 'Clinical Teal',
    tagline: 'Teal header tile with contact icons; pale teal left: skills, education, certifications.',
    palette: 'from-teal-200 to-teal-50',
  },
  {
    name: 'Timeline Blue',
    tagline: 'Initials badge, blue accents, vertical timeline with hollow nodes for every section.',
    palette: 'from-blue-100 to-slate-50',
  },
  {
    name: 'Executive Gray',
    tagline: 'Minimal grayscale: strong name, date-left / content-right work history rhythm.',
    palette: 'from-slate-100 to-white',
  },
  {
    name: 'Blush Accent',
    tagline: 'Pink top contact strip, centered name, pink underline rules on sections.',
    palette: 'from-pink-100 to-white',
  },
  {
    name: 'Turquoise Frame',
    tagline: 'Teal square frame initials, teal left labels / right content for every block.',
    palette: 'from-cyan-100 to-white',
  },
  {
    name: 'Sky Line',
    tagline: 'Minimal white page with a light-blue vertical rail: hollow nodes mark Websites, Summary, Skills, Experience & Education.',
    palette: 'from-sky-50 to-white',
  },
  {
    name: 'Kelly Gray',
    tagline: 'Light gray left rail: caps name, Details with icons, dotted skills — white body for Summary, Experience & Education.',
    palette: 'from-stone-200 to-white',
  },
  {
    name: 'Travis Blush',
    tagline: 'Pink contact bar, centered caps name, two-column section rows with pink accent ticks and black rules.',
    palette: 'from-pink-200 to-white',
  },
  {
    name: 'Harbor Slate',
    tagline: 'Blue-grey header band splits contact + Summary; below, Education & Skills | Experience with a fine vertical rule.',
    palette: 'from-slate-300 to-white',
  },
  {
    name: 'Miller Navy',
    tagline: 'Grey sidebar with monogram, Details, Skills & optional Languages rail — navy band title over Summary & Experience.',
    palette: 'from-[#001f3f] to-stone-200',
  },
  {
    name: 'Williams Classic',
    tagline: 'Warm beige header with portrait tile; serif body, underlined rails, Summary & Skills | Experience & Education.',
    palette: 'from-amber-100 to-stone-50',
  },
]

export const TEMPLATE_LIST: TemplateMeta[] = TEMPLATE_IDS.map((id, i) => ({
  id,
  ...REFERENCE_TEMPLATES[i],
}))
