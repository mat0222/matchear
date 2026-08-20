import { FadeIn } from './FadeIn'

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="relative overflow-hidden border-b border-neutral-100 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,75,75,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">{title}</h1>
          {description ? <p className="mt-4 text-neutral-600">{description}</p> : null}
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-brand to-brand-dark" />
        </FadeIn>
        {children ? <FadeIn delay={120}>{children}</FadeIn> : null}
      </div>
    </div>
  )
}
