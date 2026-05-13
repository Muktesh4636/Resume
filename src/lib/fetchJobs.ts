export type Job = {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  jobType: string
  salary: string
  tags: string[]
  url: string
  postedAt: string
  description: string
  category: string
}

const CATEGORIES = [
  { id: 'software-dev',      label: 'Software Dev' },
  { id: 'devops-sysadmin',   label: 'DevOps' },
  { id: 'design',            label: 'Design' },
  { id: 'data',              label: 'Data' },
  { id: 'product',           label: 'Product' },
  { id: 'marketing',         label: 'Marketing' },
  { id: 'customer-support',  label: 'Support' },
  { id: 'finance-legal',     label: 'Finance / Legal' },
]

export { CATEGORIES }

/* ── Remotive API ─────────────────────────────────────────────────── */
type RemotiveJob = {
  id: number
  url: string
  title: string
  company_name: string
  company_logo: string | null
  category: string
  tags: string[]
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
}

function normaliseJob(j: RemotiveJob): Job {
  return {
    id: String(j.id),
    title: j.title,
    company: j.company_name,
    companyLogo: j.company_logo ?? '',
    location: j.candidate_required_location || 'Remote',
    jobType: j.job_type.replace(/_/g, ' '),
    salary: j.salary ?? '',
    tags: j.tags ?? [],
    url: j.url,
    postedAt: j.publication_date,
    description: j.description,
    category: j.category,
  }
}

export async function fetchJobs(search = '', category = ''): Promise<Job[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    params.set('limit', '30')
    const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('API error')
    const data = (await res.json()) as { jobs: RemotiveJob[] }
    return data.jobs.map(normaliseJob)
  } catch {
    return FALLBACK_JOBS
  }
}

/* ── Application tracker (localStorage) ──────────────────────────── */
const APPS_KEY = 'resume-studio:applications'

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer'

export type Application = {
  jobId: string
  jobTitle: string
  company: string
  jobUrl: string
  status: ApplicationStatus
  appliedAt: string
  notes: string
}

export function loadApplications(): Application[] {
  try {
    return JSON.parse(localStorage.getItem(APPS_KEY) ?? '[]') as Application[]
  } catch {
    return []
  }
}

export function saveApplication(app: Application) {
  const apps = loadApplications().filter((a) => a.jobId !== app.jobId)
  apps.unshift(app)
  localStorage.setItem(APPS_KEY, JSON.stringify(apps))
}

export function removeApplication(jobId: string) {
  const apps = loadApplications().filter((a) => a.jobId !== jobId)
  localStorage.setItem(APPS_KEY, JSON.stringify(apps))
}

export function getApplication(jobId: string): Application | undefined {
  return loadApplications().find((a) => a.jobId === jobId)
}

/* ── Fallback mock data (shown if Remotive is unreachable) ─────────── */
const FALLBACK_JOBS: Job[] = [
  {
    id: 'mock-1', title: 'Senior Frontend Engineer', company: 'Stripe', companyLogo: '',
    location: 'Remote – Worldwide', jobType: 'full time', salary: '$150k – $200k',
    tags: ['React', 'TypeScript', 'CSS', 'GraphQL'],
    url: 'https://stripe.com/jobs', postedAt: new Date().toISOString(), category: 'software-dev',
    description: 'Build the payments infrastructure used by millions of businesses. Work on React, TypeScript, and modern CSS to craft world-class UI.',
  },
  {
    id: 'mock-2', title: 'Full-Stack Engineer', company: 'Linear', companyLogo: '',
    location: 'Remote – US / EU', jobType: 'full time', salary: '$140k – $190k',
    tags: ['Node.js', 'React', 'PostgreSQL', 'TypeScript'],
    url: 'https://linear.app/careers', postedAt: new Date().toISOString(), category: 'software-dev',
    description: 'Help build the fastest issue-tracking tool. You\'ll work across the full stack in a small, focused team.',
  },
  {
    id: 'mock-3', title: 'Staff Software Engineer – Infrastructure', company: 'Vercel', companyLogo: '',
    location: 'Remote – US', jobType: 'full time', salary: '$180k – $240k',
    tags: ['Go', 'Kubernetes', 'AWS', 'Terraform', 'Distributed Systems'],
    url: 'https://vercel.com/careers', postedAt: new Date().toISOString(), category: 'devops-sysadmin',
    description: 'Scale the global edge network serving billions of requests per day. Deep systems knowledge required.',
  },
  {
    id: 'mock-4', title: 'Product Designer', company: 'Figma', companyLogo: '',
    location: 'Remote – Worldwide', jobType: 'full time', salary: '$130k – $170k',
    tags: ['Figma', 'Prototyping', 'Design Systems', 'User Research'],
    url: 'https://figma.com/careers', postedAt: new Date().toISOString(), category: 'design',
    description: 'Design tools used by every designer on the planet. Shape the future of collaborative design.',
  },
  {
    id: 'mock-5', title: 'Data Engineer', company: 'dbt Labs', companyLogo: '',
    location: 'Remote – US / Canada', jobType: 'full time', salary: '$130k – $165k',
    tags: ['Python', 'SQL', 'dbt', 'Airflow', 'Spark'],
    url: 'https://www.getdbt.com/careers', postedAt: new Date().toISOString(), category: 'data',
    description: 'Build the analytics infrastructure for the modern data stack. Work closely with product and customers.',
  },
  {
    id: 'mock-6', title: 'Backend Engineer – Python', company: 'Notion', companyLogo: '',
    location: 'Remote – US', jobType: 'full time', salary: '$145k – $195k',
    tags: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Microservices'],
    url: 'https://notion.so/careers', postedAt: new Date().toISOString(), category: 'software-dev',
    description: 'Power the next generation of collaboration tools. Work on high-scale APIs used by millions daily.',
  },
]
