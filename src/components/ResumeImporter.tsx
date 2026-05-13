import { useRef, useState } from 'react'
import { extractTextFromFile } from '../lib/extractText'
import { importResumeFromPlainText } from '../lib/importFromText'
import type { ResumeData } from '../types/resume'

type State = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }

export function ResumeImporter({
  onImported,
  getDraftSnapshot,
  canUndoImport,
  onUndoImport,
}: {
  onImported: (data: ResumeData, context: { previousDraft: ResumeData }) => void
  /** Snapshot right before replace (call after extract, before confirm). Use a ref-backed getter from the parent. */
  getDraftSnapshot: () => ResumeData
  canUndoImport: boolean
  onUndoImport: () => void
}) {
  const [state, setState] = useState<State>({ status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    setState({ status: 'loading' })
    try {
      const text = await extractTextFromFile(file)
      if (text.trim().length < 80) {
        throw new Error('Not enough text found. Use a text-selectable PDF or a .txt file.')
      }
      const previousDraft = structuredClone(getDraftSnapshot())
      const ok = window.confirm(
        'Replace your current draft with text imported from this file? You can restore the previous draft afterward with “Remove import”.',
      )
      if (!ok) {
        setState({ status: 'idle' })
        return
      }
      const data = importResumeFromPlainText(text)
      onImported(data, { previousDraft })
      setState({ status: 'idle' })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
      <h2 className="text-sm font-semibold text-slate-900">Import existing resume</h2>
      <p className="mt-1 text-xs text-slate-500">
        Upload a PDF or text file. We extract text in your browser and fill the form — then review and fix any fields.
      </p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => state.status !== 'loading' && inputRef.current?.click()}
        className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50 ${state.status === 'loading' ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={onInputChange}
        />
        {state.status === 'loading' ? (
          <p className="text-sm font-medium text-slate-600">Reading file…</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-800">Drop a file here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">PDF or plain text · processed locally</p>
          </>
        )}
      </div>
      {state.status === 'error' && (
        <p className="mt-3 text-xs text-red-700">
          <span className="font-semibold">Could not import: </span>
          {state.message}
        </p>
      )}
      {canUndoImport && (
        <div className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3">
          <p className="text-xs font-medium text-amber-950">Imported resume is active</p>
          <p className="mt-1 text-xs text-amber-900/85">
            Remove the import and bring back your draft from before this upload (your file is not stored on our servers).
          </p>
          <button
            type="button"
            className="mt-3 rounded-full border border-amber-300/90 bg-white px-4 py-2 text-xs font-semibold text-amber-950 shadow-sm hover:bg-amber-100/80"
            onClick={onUndoImport}
          >
            Remove import & restore previous draft
          </button>
        </div>
      )}
    </div>
  )
}
