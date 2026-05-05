'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { projects, type Project } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

// Same motion grammar as Hero / NowBlock.
const EASE = [0.16, 1, 0.3, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
}

const gridVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

// Compact period range. Mirrors NowBlock's coordinate-style metadata.
// Inputs:
//   "2026.04"             → "2026.04"
//   "2026.03 — 2026.04"   → "2026.03 → 2026.04"
//   "2025.03 — 2025.07"   → "2025.03 → 2025.07"
function formatPeriod(period: string): string {
  return period.replace(/\s*—\s*/g, ' → ')
}

// ─────────────────────────────────────────────────────────────────────────────

export function ProjectsGrid() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : itemVariants
  const variantsGrid = reduceMotion ? undefined : gridVariants

  // Split into highlights vs the rest. Order in source preserved.
  const highlights = projects.filter((p) => p.highlight)
  const rest = projects.filter((p) => !p.highlight)
  const restCount = rest.length

  // Earliest → latest project span for the section eyebrow summary.
  // Cheap parse: take the first 4 chars (year) of the earliest and the last project's tail.
  const span = (() => {
    const years = projects
      .flatMap((p) => p.period.match(/\d{4}/g) ?? [])
      .map(Number)
      .sort((a, b) => a - b)
    if (years.length === 0) return null
    const min = years[0]
    const max = years[years.length - 1]
    return min === max ? `${min}` : `${min}–${max}`
  })()

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        {/* Header row — § 02 / SELECTED  +  span summary on the right. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="text-muted-foreground/50">§</span>
            <span>02</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <h2 id="projects-heading" className="text-foreground/80">
              Field Notes
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <span>{projects.length.toString().padStart(2, '0')} entries</span>
            {span ? (
              <>
                <span aria-hidden="true" className="text-border">·</span>
                <span>{span}</span>
              </>
            ) : null}
          </div>
        </motion.div>

        {/* Hairline rule under header. */}
        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          style={{ transformOrigin: 'left center' }}
          className="mt-4 h-px w-full bg-border/60"
        />

        {/* Featured row — broadsheet. Two highlighted projects, side-by-side at lg+,
            stacked below lg. Wider/taller than the supporting cast. */}
        {highlights.length > 0 ? (
          <motion.ol
            variants={variantsGrid}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-10%' }}
            className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 md:mt-16 lg:grid-cols-2 lg:gap-x-12"
          >
            {highlights.map((p, i) => (
              <FeaturedEntry
                key={p.slug}
                project={p}
                index={projects.indexOf(p) + 1}
                variants={variantsItem}
                isLast={i === highlights.length - 1}
              />
            ))}
          </motion.ol>
        ) : null}

        {/* Subhead — separates the featured row from the supporting set.
            Reads like a manifest divider, not a marketing label. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
          className="mt-20 flex items-center gap-3 md:mt-24"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Also shipped
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        </motion.div>

        {/* Supporting grid — 2×2 at lg+, 2-col at md, 1-col at mobile. */}
        <motion.ol
          variants={variantsGrid}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 md:gap-x-10 lg:gap-x-12"
        >
          {rest.map((p, i) => (
            <SupportingEntry
              key={p.slug}
              project={p}
              index={projects.indexOf(p) + 1}
              variants={variantsItem}
              isLastInRow={(i + 1) % 2 === 0}
              isInLastRow={i >= rest.length - 2}
              isLastOverall={i === restCount - 1}
            />
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

// ─── Featured entry ─────────────────────────────────────────────────────────
// Larger panel. Left-edge cyan hairline marks it as featured (this is the only
// at-rest cyan element in the whole section — 2 panels × 1 hairline = 2 total).
// No floating cards, no shadows, no rounded-xl. Sharp top + bottom hairlines on
// the panel, content sits directly on the page surface.

function FeaturedEntry({
  project,
  index,
  variants,
}: {
  project: Project
  index: number
  variants: Variants | undefined
  isLast: boolean
}) {
  const idx = index.toString().padStart(2, '0')
  const period = formatPeriod(project.period)

  return (
    <motion.li variants={variants} className="group relative">
      {/* Left-edge cyan hairline — the featured signal. 2px wide, full-height
          of the panel content. Subtly intensifies on hover (color shift only,
          no transform). */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px bg-primary/70 transition-colors duration-300 group-hover:bg-primary"
      />

      <article className="relative pl-6 sm:pl-8">
        {/* Clip frame — reserved 16:9 slot for an upcoming muted webm of the
            extension running. Hairline border, neutral-only (no cyan), with a
            quiet centered indicator that reads as "video player not yet loaded"
            rather than a placeholder image. Aspect-locked so layout doesn't
            shift when the asset lands. */}
        <ClipFrame name={project.name} />

        {/* Coordinate row — index + org + period.
            Right-side is hairline-aligned top register. */}
        <div className="mt-6 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="flex items-center gap-3">
            <span className="text-muted-foreground/60">{idx}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border" />
            <span className="text-foreground/70">{project.org}</span>
          </span>
          <span className="text-muted-foreground/80">{period}</span>
        </div>

        {/* Project name — mono, decisive. Featured size. */}
        <h3 className="mt-5 font-mono text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-[28px] md:text-3xl">
          {project.name}
        </h3>

        {/* Tagline — body, foreground. The longer "detail" copy that used to
            sit below this lives in the PDF resume now; the website specializes
            in identity + present-state, not full project changelogs. */}
        <p className="mt-4 max-w-[36rem] text-pretty text-[15px] leading-relaxed text-foreground/85 sm:text-base">
          {project.tagline}
        </p>

        {/* Stack chips — mono, border-only, sharp corners. */}
        <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-2">
          {project.stack.map((s) => (
            <li key={s}>
              <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[11px] tracking-tight text-foreground/75">
                {s}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </motion.li>
  )
}

// ─── Supporting entry ───────────────────────────────────────────────────────
// 2×2 grid. No left-edge accent (cyan reserved for featured). Hairline borders
// between cells using border tricks so the grid reads as a continuous matrix
// rather than 4 floating cards.

function SupportingEntry({
  project,
  index,
  variants,
  isLastInRow,
  isInLastRow,
  isLastOverall,
}: {
  project: Project
  index: number
  variants: Variants | undefined
  isLastInRow: boolean
  isInLastRow: boolean
  isLastOverall: boolean
}) {
  const idx = index.toString().padStart(2, '0')
  const period = formatPeriod(project.period)

  return (
    <motion.li
      variants={variants}
      className={cn(
        'group relative',
        // Bottom hairline between rows. On mobile (single column) drop it on
        // the very last item so the section doesn't end with a dangling rule.
        // At md+ drop it for the entire last row.
        !isLastOverall && 'border-b border-border/40',
        isInLastRow && 'md:border-b-0',
        // Right hairline on the left-cell of each row at md+.
        !isLastInRow && 'md:border-r md:border-border/40',
      )}
    >
      <article
        className={cn(
          'relative py-8 md:py-10',
          // Inner padding so cells don't crash into each other.
          !isLastInRow && 'md:pr-10 lg:pr-12',
          isLastInRow && 'md:pl-10 lg:pl-12',
        )}
      >
        {/* Coordinate row. */}
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="flex items-center gap-3">
            <span className="text-muted-foreground/60">{idx}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border" />
            <span className="text-foreground/70">{project.org}</span>
          </span>
          <span className="text-muted-foreground/80">{period}</span>
        </div>

        {/* Project name — mono, smaller than featured but still substantial. */}
        <h3 className="mt-4 font-mono text-xl font-medium tracking-[-0.01em] text-foreground/95 sm:text-[22px]">
          {project.name}
        </h3>

        {/* Tagline — the second-line "detail" copy lives in the PDF resume. */}
        <p className="mt-3 max-w-[34rem] text-pretty text-[14.5px] leading-relaxed text-foreground/80 sm:text-[15px]">
          {project.tagline}
        </p>

        {/* Stack chips. */}
        <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
          {project.stack.map((s) => (
            <li key={s}>
              <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[11px] tracking-tight text-foreground/75">
                {s}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </motion.li>
  )
}

// ─── Clip frame ─────────────────────────────────────────────────────────────
// 16:9 reserved slot for an upcoming muted webm of the extension running.
// Hairline border, neutral content only — reads as a video element that
// hasn't loaded yet, not as a "PLACEHOLDER" pill. The play glyph + caption
// are mono and muted; no cyan. Aspect-locked via aspect-video so dropping in
// an actual <video> later is a swap, not a layout shift.

function ClipFrame({ name }: { name: string }) {
  return (
    <div
      role="img"
      aria-label={`${name} — clip pending`}
      className="relative aspect-video w-full overflow-hidden border border-border/70 bg-foreground/[0.015]"
    >
      {/* Faint inner registration ticks at the corners — same precision idiom
          as the hero's CornerMarks, scaled small. Anchors the frame as
          intentional, not empty. */}
      <span aria-hidden="true" className="absolute left-2 top-2 h-2 w-2 border-l border-t border-muted-foreground/25" />
      <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 border-r border-t border-muted-foreground/25" />
      <span aria-hidden="true" className="absolute left-2 bottom-2 h-2 w-2 border-l border-b border-muted-foreground/25" />
      <span aria-hidden="true" className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-muted-foreground/25" />

      {/* Centered indicator — quiet play glyph + mono caption. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span
          aria-hidden="true"
          className="font-mono text-base text-muted-foreground/40"
        >
          {'>'}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45">
          clip · pending
        </span>
      </div>
    </div>
  )
}
