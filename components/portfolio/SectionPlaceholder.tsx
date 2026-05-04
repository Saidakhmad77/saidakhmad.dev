import { cn } from '@/lib/utils'

type Props = {
  id: string
  index: number // 1-based
  label: string
  className?: string
}

/**
 * Placeholder for an anchor section that hasn't been built yet.
 * Looks intentional — coordinate-style numbering, hairline top rule, mono metadata.
 * Sized at min-h-screen so anchor scrolling lands cleanly.
 */
export function SectionPlaceholder({ id, index, label, className }: Props) {
  const idx = index.toString().padStart(2, '0')
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        'relative flex min-h-screen w-full flex-col scroll-mt-16',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col px-6 py-24 md:px-10 md:py-32">
        {/* Section header: § 01 / WORK */}
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="text-muted-foreground/50">§</span>
          <span>{idx}</span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <h2 id={`${id}-heading`} className="text-foreground/80">
            {label}
          </h2>
        </div>

        {/* Hairline */}
        <div aria-hidden="true" className="mt-4 h-px w-full bg-border/60" />

        {/* Body — single placeholder line, low-key. */}
        <div className="mt-16 flex flex-1 items-start">
          <p className="font-mono text-sm text-muted-foreground/80">
            <span className="text-muted-foreground/50">{'// '}</span>
            Coming soon · {label}
          </p>
        </div>
      </div>
    </section>
  )
}
