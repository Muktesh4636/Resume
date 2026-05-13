import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ResumeForm } from '../components/ResumeForm'
import { ResumePreview } from '../components/ResumePreview'
import { ResumeImporter } from '../components/ResumeImporter'
import { isSampleVisualHintsActive } from '../lib/builtInSample'
import { createDefaultResume, withExtraColumnDefaults } from '../lib/defaultResume'
import { isValidSlug, normalizeSlug } from '../lib/slug'
import { loadDraft, publishResume, saveDraft, slugAvailable } from '../lib/storage'
import { parseTemplateId, TEMPLATE_LIST } from '../lib/templatesMeta'
import type { ResumeData, TemplateId } from '../types/resume'

function BuilderActionBar({
  saveStatus,
  onSaveNow,
  onDownloadPdf,
  className,
}: {
  saveStatus: 'saving' | 'saved'
  onSaveNow: () => void
  onDownloadPdf: () => void
  className?: string
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-2 sm:gap-3 print:hidden ${className ?? ''}`}
    >
      <p className="mr-auto w-full text-xs text-slate-600 sm:mr-0 sm:w-auto sm:max-w-[14rem]">
        {saveStatus === 'saving' ? (
          <span className="font-medium text-slate-700">Saving draft…</span>
        ) : (
          <span className="font-medium text-emerald-700">Saved in this browser</span>
        )}
      </p>
      <button
        type="button"
        onClick={onSaveNow}
        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
      >
        Save now
      </button>
      <button
        type="button"
        onClick={onDownloadPdf}
        className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Download PDF
      </button>
    </div>
  )
}

export function Builder() {
  const [searchParams] = useSearchParams()
  const templateFromUrl = parseTemplateId(searchParams.get('template'))
  const storedId = loadDraft()?.templateId
  const templateId: TemplateId =
    templateFromUrl ?? parseTemplateId(storedId) ?? ('tpl-00' as TemplateId)

  const [data, setData] = useState<ResumeData>(() =>
    withExtraColumnDefaults(loadDraft()?.data ?? createDefaultResume()),
  )
  const [showImportUndo, setShowImportUndo] = useState(false)
  const importUndoBaselineRef = useRef<ResumeData | null>(null)
  const [slug, setSlug] = useState('')
  const [publishMsg, setPublishMsg] = useState<string | null>(null)
  const [lastUrl, setLastUrl] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved')
  const skipSavingFlash = useRef(true)
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const templateLabel = useMemo(
    () => TEMPLATE_LIST.find((t) => t.id === templateId)?.name ?? templateId,
    [templateId],
  )

  const sampleFormHints = useMemo(() => isSampleVisualHintsActive(data), [data])

  useEffect(() => {
    let savingId: ReturnType<typeof window.setTimeout> | undefined
    if (!skipSavingFlash.current) {
      savingId = window.setTimeout(() => setSaveStatus('saving'), 0)
    }
    skipSavingFlash.current = false
    const id = window.setTimeout(() => {
      saveDraft(templateId, data)
      setSaveStatus('saved')
    }, 450)
    return () => {
      if (savingId !== undefined) window.clearTimeout(savingId)
      window.clearTimeout(id)
    }
  }, [templateId, data])

  const saveNow = useCallback(() => {
    saveDraft(templateId, data)
    setSaveStatus('saved')
  }, [templateId, data])

  const onResumeImported = useCallback(
    (imported: ResumeData, { previousDraft }: { previousDraft: ResumeData }) => {
      importUndoBaselineRef.current = withExtraColumnDefaults(structuredClone(previousDraft))
      setShowImportUndo(true)
      setData(withExtraColumnDefaults(structuredClone(imported)))
    },
    [],
  )

  const onUndoResumeImport = useCallback(() => {
    const baseline = importUndoBaselineRef.current
    if (baseline) setData(withExtraColumnDefaults(structuredClone(baseline)))
    importUndoBaselineRef.current = null
    setShowImportUndo(false)
  }, [])

  const getDraftSnapshotForImport = useCallback(
    () => withExtraColumnDefaults(structuredClone(dataRef.current)),
    [],
  )

  const downloadPdf = useCallback(() => {
    // Collect all stylesheets accessible from this origin
    const cssLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map((l) => l.href)
      .filter(Boolean)

    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.innerHTML)
      .join('\n')

    const resumeEl = document.getElementById('resume-print-root')
    if (!resumeEl) {
      window.print()
      return
    }

    const pw = window.open('', '_blank', 'width=900,height=1200')
    if (!pw) {
      // Popup blocked — fall back to whole-page print
      window.print()
      return
    }

    pw.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${cssLinks.map((h) => `<link rel="stylesheet" href="${h}">`).join('\n  ')}
  <style>
    ${inlineStyles}
    @page { size: A4 portrait; margin: 0; }
    html, body {
      margin: 0; padding: 0; background: white;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
  </style>
</head>
<body>${resumeEl.outerHTML}</body>
</html>`)
    pw.document.close()
    // Give fonts/images a moment to load, then print and close
    pw.onload = () => {
      pw.focus()
      pw.print()
      pw.close()
    }
    // Fallback if onload never fires (e.g. no external resources)
    setTimeout(() => {
      try { pw.print(); pw.close() } catch { /* already closed */ }
    }, 1200)
  }, [])

  const onPublish = useCallback(() => {
    setPublishMsg(null)
    setLastUrl(null)
    const s = normalizeSlug(slug)
    if (!isValidSlug(s)) {
      setPublishMsg('Use a slug of 3–40 characters: lowercase letters, numbers, and single hyphens between words.')
      return
    }
    if (!slugAvailable(s)) {
      setPublishMsg('That slug is already taken on this browser. Try another.')
      return
    }
    publishResume(s, templateId, data)
    const url = `${window.location.origin}/site/${s}`
    setLastUrl(url)
    setPublishMsg('Published! Share your new resume page below.')
  }, [slug, templateId, data])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 md:py-10 print:max-w-none print:p-0 print:m-0">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">Resume builder</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Edit every section on the left; preview updates on the right. Your draft saves automatically in this browser.
            </p>
            <p className="mt-3 text-sm text-slate-600 print:hidden">
              <span className="font-medium text-slate-800">Layout:</span> {templateLabel}. To try a different style,{' '}
              open{' '}
              <Link
                to="/templates"
                className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500"
              >
                Templates
              </Link>{' '}
              and click any card — your data comes with you.
            </p>
          </div>
          <BuilderActionBar
            saveStatus={saveStatus}
            onSaveNow={saveNow}
            onDownloadPdf={downloadPdf}
            className="shrink-0 border-t border-slate-200/80 pt-4 lg:border-t-0 lg:pt-0"
          />
        </div>
        <p className="text-xs text-slate-500 print:hidden">
          <span className="font-medium text-slate-700">Download PDF</span> opens the print dialog — choose “Save as PDF” to download.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] print:block">

        {/* ── Left column: import + publish + form ── */}
        <div className="space-y-5 print:hidden">

          <ResumeImporter
            getDraftSnapshot={getDraftSnapshotForImport}
            onImported={onResumeImported}
            canUndoImport={showImportUndo}
            onUndoImport={onUndoResumeImport}
          />

          {/* Publish */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Publish resume website</h2>
            <p className="mt-1 text-xs text-slate-500">
              Creates a public page at{' '}
              <span className="rounded bg-slate-100 px-1 font-mono text-slate-700">/site/your-slug</span>{' '}
              stored in this browser.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-name"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
              />
              <button
                type="button"
                onClick={onPublish}
                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Publish
              </button>
            </div>
            {publishMsg && (
              <p className={`mt-3 text-xs ${lastUrl ? 'text-green-700' : 'text-slate-600'}`}>{publishMsg}</p>
            )}
            {lastUrl && (
              <div className="mt-2 flex flex-col gap-2 rounded-xl bg-indigo-50 px-3 py-3 text-xs text-indigo-950 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-mono">{lastUrl}</span>
                <button
                  type="button"
                  className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
                  onClick={() => navigator.clipboard.writeText(lastUrl)}
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ResumeForm data={data} onChange={setData} sampleHints={sampleFormHints} />
          </div>
        </div>

        {/* ── Right column: live preview ── */}
        <div className="lg:sticky lg:top-24 lg:self-start print:static">
          <p className="mb-3 text-xs text-slate-600 print:hidden">
            <span className="font-medium text-slate-700">Preview</span> is zoomed out so you can see the full résumé.
            <span className="font-medium text-slate-700"> PDF / print</span> uses full-size text (standard layout).
          </p>
          <div className="mb-3 hidden text-center text-xs font-medium text-slate-500 print:block">
            Print preview
          </div>
          <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100/80 p-4 print:max-h-none print:overflow-visible print:border-0 print:bg-white print:p-0">
            <div id="resume-print-root">
              <ResumePreview templateId={templateId} data={data} variant="sheet" mode="builder" />
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-6 print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Draft status:</span>{' '}
            {saveStatus === 'saving' ? 'Saving your changes…' : 'Everything is saved in this browser.'} Use{' '}
            <span className="font-medium text-slate-800">Save now</span> after big edits, or{' '}
            <span className="font-medium text-slate-800">Download PDF</span> to export (print dialog → Save as PDF).
          </p>
          <BuilderActionBar saveStatus={saveStatus} onSaveNow={saveNow} onDownloadPdf={downloadPdf} />
        </div>
      </footer>
    </div>
  )
}
