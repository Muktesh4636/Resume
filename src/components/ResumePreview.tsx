import type { ResumeData, ResumeFontSizePreset, TemplateId } from '../types/resume'
import { GalleryResume } from './resume-templates'

type Variant = 'sheet' | 'public'

/** How the preview is scaled on screen vs print/PDF. */
export type ResumePreviewMode = 'standard' | 'builder'

function presetScaleClass(preset: ResumeFontSizePreset | undefined): string | null {
  switch (preset ?? 'default') {
    case 'small':
      return 'scale-[0.9]'
    case 'big':
      return 'scale-[1.12]'
    default:
      return null
  }
}

function templateIndex(templateId: TemplateId): number {
  const m = /^tpl-(\d{2})$/i.exec(String(templateId))
  if (!m) return 0
  const n = Number.parseInt(m[1], 10)
  if (Number.isNaN(n) || n < 0 || n > 18) return 0
  return n
}

export function ResumePreview({
  templateId,
  data,
  variant,
  mode = 'standard',
}: {
  templateId: TemplateId
  data: ResumeData
  variant: Variant
  /** `builder`: smaller on-screen preview to see the whole page; print/PDF always full size. */
  mode?: ResumePreviewMode
}) {
  const idx = templateIndex(templateId)
  const inner = <GalleryResume data={data} variant={variant} index={idx} />

  if (mode === 'builder') {
    return (
      <div className="flex w-full justify-center print:inline-flex print:w-full print:justify-center">
        <div className="inline-block origin-top align-top will-change-transform scale-[0.64] sm:scale-[0.68] md:scale-[0.72] lg:scale-[0.76] xl:scale-[0.80] print:scale-100">
          {inner}
        </div>
      </div>
    )
  }

  const scaleClass = presetScaleClass(data.fontSizePreset)
  if (!scaleClass) return inner

  return (
    <div className="flex w-full justify-center print:inline-flex print:w-full print:justify-center">
      <div className={`inline-block origin-top align-top will-change-transform ${scaleClass}`}>{inner}</div>
    </div>
  )
}
