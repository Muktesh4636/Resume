import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

type PdfTextItem = {
  str?: string
  transform?: number[]
  width?: number
  height?: number
  hasEOL?: boolean
}

/**
 * Join PDF text items using geometry so section headings and bullets become real lines.
 * The naive `.join(' ')` flattens most resumes into one line per page and breaks import.
 */
function pageItemsToLines(items: PdfTextItem[]): string {
  type Span = { str: string; x: number; y: number; w: number; h: number; hasEOL: boolean }
  const spans: Span[] = []
  for (const it of items) {
    if (!it || typeof it !== 'object') continue
    if (typeof it.str !== 'string' || !it.str.trim()) continue
    const t = it.transform
    if (!Array.isArray(t) || t.length < 6) continue
    const h =
      typeof it.height === 'number' && it.height > 0 ? it.height : Math.abs(Number(t[3])) || 10
    const w = typeof it.width === 'number' && it.width >= 0 ? it.width : 0
    spans.push({
      str: it.str,
      x: Number(t[4]),
      y: Number(t[5]),
      w,
      h,
      hasEOL: Boolean(it.hasEOL),
    })
  }
  if (!spans.length) return ''

  const sortedHeights = [...spans.map((s) => s.h)].sort((a, b) => a - b)
  const medianH = sortedHeights[Math.floor(sortedHeights.length / 2)] ?? 10
  const lineTol = Math.min(14, Math.max(4.2, medianH * 0.52))

  spans.sort((a, b) => b.y - a.y || a.x - b.x)
  const lineGroups: Span[][] = []
  for (const s of spans) {
    let placed = false
    for (const g of lineGroups) {
      const refY = g[0]!.y
      if (Math.abs(s.y - refY) < lineTol) {
        g.push(s)
        placed = true
        break
      }
    }
    if (!placed) lineGroups.push([s])
  }
  lineGroups.sort((a, b) => b[0]!.y - a[0]!.y)

  const columnGap = medianH * 4.5
  const outLines: string[] = []

  for (const group of lineGroups) {
    group.sort((a, b) => a.x - b.x)
    let line = ''
    let lastEndX = -Infinity
    for (const s of group) {
      if (line && lastEndX > -Infinity) {
        const gap = s.x - lastEndX
        if (gap > columnGap) line += '\n'
        else if (gap > medianH * 0.12 && !line.endsWith('-')) line += ' '
      }
      line += s.str
      if (s.hasEOL) line += '\n'
      lastEndX = s.x + (s.w > 0 ? s.w : s.str.length * medianH * 0.32)
    }
    const chunk = line.replace(/\n+$/, '').trimEnd()
    if (chunk) outLines.push(chunk)
  }

  return outLines.join('\n')
}

/**
 * pdf.js loads the worker via dynamic `import(workerSrc)`. Browsers require a JavaScript MIME
 * type; some hosts/DNS paths still serve `.mjs` wrong. Fetching the file ourselves and
 * using a blob: URL with `application/javascript` makes `import()` succeed everywhere.
 */
async function createPdfWorkerObjectUrl(): Promise<string> {
  const res = await fetch(pdfWorkerSrc, { credentials: 'same-origin' })
  if (!res.ok) {
    throw new Error(
      `Could not load PDF helper (${res.status}). Check your connection or try a hard refresh (Ctrl+Shift+R).`,
    )
  }
  const bytes = await res.arrayBuffer()
  const blob = new Blob([bytes], { type: 'application/javascript' })
  return URL.createObjectURL(blob)
}

/**
 * Extracts plain text from an uploaded File.
 * Supports: PDF (via pdfjs-dist), plain text (.txt), and falls back for anything else.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (file.type === 'application/pdf' || ext === 'pdf') {
    return extractFromPdf(file)
  }

  // Plain text / markdown
  if (
    file.type.startsWith('text/') ||
    ['txt', 'md', 'rtf'].includes(ext)
  ) {
    return file.text()
  }

  throw new Error(
    `Unsupported file type "${file.type || ext}". Please upload a PDF or plain-text (.txt) file.`,
  )
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')
  const rawBuffer = await file.arrayBuffer()
  // Copy — pdfjs may transfer ArrayBuffers to the worker.
  const pdfData = rawBuffer.slice(0)

  const workerObjectUrl = await createPdfWorkerObjectUrl()
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerObjectUrl
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    try {
      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = pageItemsToLines(content.items as PdfTextItem[])
        pages.push(pageText)
      }
      return pages.join('\n')
    } finally {
      await pdf.destroy()
    }
  } finally {
    URL.revokeObjectURL(workerObjectUrl)
  }
}
