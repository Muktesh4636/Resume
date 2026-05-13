import { Link } from 'react-router-dom'
import type { TemplateId } from '../types/resume'
import { TemplateThumbnail } from './TemplateThumbnail'

type Base = {
  templateId: TemplateId
  name: string
  tagline?: string
  selected?: boolean
  thumbnailSize?: 'sm' | 'md' | 'lg'
}

type LinkProps = Base & {
  mode: 'link'
  to: string
}

type ButtonProps = Base & {
  mode: 'button'
  onSelect: () => void
}

export function TemplatePreviewCard(props: LinkProps | ButtonProps) {
  const { templateId, name, tagline, selected, thumbnailSize = 'md' } = props
  const shell = `group w-full cursor-pointer overflow-hidden rounded-2xl border text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
    selected
      ? 'border-indigo-500 ring-2 ring-indigo-400/35'
      : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'
  }`

  const body = (
    <>
      <TemplateThumbnail templateId={templateId} size={thumbnailSize} />
      <div className="border-t border-slate-100 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        {tagline ? <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-600">{tagline}</p> : null}
      </div>
    </>
  )

  if (props.mode === 'link') {
    return (
      <Link to={props.to} className={`${shell} block`}>
        {body}
      </Link>
    )
  }

  return (
    <button type="button" className={shell} onClick={props.onSelect}>
      {body}
    </button>
  )
}
