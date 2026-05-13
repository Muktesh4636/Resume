import { THUMBNAIL_RESUME } from '../lib/defaultResume'
import type { TemplateId } from '../types/resume'
import { ResumePreview } from './ResumePreview'

const SCALE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 0.19,
  md: 0.245,
  lg: 0.34,
}

const HEIGHT: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-40',
  md: 'h-52 sm:h-56',
  lg: 'h-64 sm:h-72',
}

export function TemplateThumbnail({
  templateId,
  size = 'md',
  className,
}: {
  templateId: TemplateId
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const scale = SCALE[size]
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-b from-slate-200/90 to-slate-300/70 ${HEIGHT[size]} ${className ?? ''}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 w-[210mm] max-w-none origin-top will-change-transform"
        style={{ transform: `translateX(-50%) scale(${scale})` }}
      >
        <ResumePreview templateId={templateId} data={THUMBNAIL_RESUME} variant="sheet" />
      </div>
    </div>
  )
}
