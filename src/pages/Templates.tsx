import { TemplatePreviewCard } from '../components/TemplatePreviewCard'
import { TEMPLATE_LIST } from '../lib/templatesMeta'

export function Templates() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Library</p>
      <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">Resume templates</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        This is where you choose a look: each card shows a sample preview only for comparison. When you open the builder from a card,{' '}
        <strong className="font-medium text-slate-800">your saved résumé</strong> appears in that layout. Replace the starter text, edit the form,
        or import a PDF — then <strong className="font-medium text-slate-800">Resume Strength</strong> scoring turns on in the builder.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATE_LIST.map((t) => (
          <TemplatePreviewCard
            key={t.id}
            mode="link"
            to={`/builder?template=${t.id}`}
            templateId={t.id}
            name={t.name}
            tagline={t.tagline}
            thumbnailSize="lg"
          />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-slate-500">
        Thumbnails above use shared sample text only to compare designs. The builder always uses your own draft from this browser.
      </p>
    </div>
  )
}
