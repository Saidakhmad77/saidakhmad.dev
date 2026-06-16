'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import {
  projects,
  projectConstraints,
  projectMeta,
  type Project,
  type ProjectCategory,
} from '@/lib/portfolio-data'
import { EASE, sectionItemVariants, sectionListVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Slug → constraint lookup. Memoized once at module load.
const CONSTRAINT_BY_SLUG: Record<string, { label: string; body: string }> = Object.fromEntries(
  projectConstraints.map((c) => [c.slug, { label: c.label, body: c.body }]),
)

const META_BY_SLUG: Record<string, { category: ProjectCategory; metric: string }> = Object.fromEntries(
  projectMeta.map((m) => [m.slug, { category: m.category, metric: m.metric }]),
)

// Category → display label + accent color class. Three categories use the
// three established accents (cyan / warm / fail). "Tool" reuses cyan since
// it's the most-used cat and shouldn't compete with featured signal.
const CATEGORY_DISPLAY: Record<ProjectCategory, { label: string; color: string }> = {
  extension: { label: 'EXTENSION', color: 'text-[color:var(--primary)] border-[color:var(--primary)]/60' },
  patch:     { label: 'PATCH',     color: 'text-[color:var(--accent-warm)] border-[color:var(--accent-warm)]/60' },
  pipeline:  { label: 'PIPELINE',  color: 'text-foreground/70 border-border/70' },
  tool:      { label: 'TOOL',      color: 'text-foreground/70 border-border/70' },
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
  const variantsItem = reduceMotion ? undefined : sectionItemVariants
  const variantsGrid = reduceMotion ? undefined : sectionListVariants

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
      // One-color rule: the whole site uses a single surface (dark by default,
      // light when the user toggles in the nav). No warm sub-zones.
      className="relative w-full scroll-mt-16 border-t border-border/60"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        <SectionHeader
          headingId="projects-heading"
          index="03"
          title="Field Notes"
          reduceMotion={!!reduceMotion}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <span>{projects.length.toString().padStart(2, '0')} entries</span>
            {span ? (
              <>
                <span aria-hidden="true" className="text-border">·</span>
                <span>{span}</span>
              </>
            ) : null}
          </div>
        </SectionHeader>

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
            {highlights.map((p) => (
              <FeaturedEntry
                key={p.slug}
                project={p}
                index={projects.indexOf(p) + 1}
                variants={variantsItem}
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
        {/* Coordinate row — index + org + period + category badge. */}
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="flex items-center gap-3">
            <span className="num text-muted-foreground/60">{idx}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border" />
            <span className="text-foreground/70">{project.org}</span>
            <CategoryBadge slug={project.slug} />
          </span>
          <span className="text-muted-foreground/80">{period}</span>
        </div>

        {/* Visualisation panel — replaces the empty clip slot. A compact,
            opinionated SVG bar that visualises the project's signature
            metric. Aspect-locked to keep the page rhythm consistent. */}
        <ProjectViz slug={project.slug} />

        {/* Project name — mono, decisive. Featured size. */}
        <h3 className="mt-6 font-mono text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-[28px] md:text-3xl">
          {project.name}
        </h3>

        {/* Tagline — body, foreground. The longer "detail" copy that used to
            sit below this lives in the PDF resume now; the website specializes
            in identity + present-state, not full project changelogs. */}
        <p className="mt-3 max-w-[36rem] text-pretty text-[15px] leading-relaxed text-foreground/85 sm:text-base">
          {project.tagline}
        </p>

        <ConstraintRow slug={project.slug} compact={false} />

        {/* Stack chips — mono, border-only, sharp corners. */}
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

// ─── Constraint row ─────────────────────────────────────────────────────────
// "Constraints are inputs to design" surfaced on each project card. Compact
// variant collapses to a single line (constraint only, solution implied);
// the full variant shows the solution prose. Featured cards get full; the
// supporting 2×2 grid stays compact so the cells don't bloat.

function ConstraintRow({ slug, compact }: { slug: string; compact: boolean }) {
  const entry = CONSTRAINT_BY_SLUG[slug]
  if (!entry) return null
  if (compact) {
    return (
      <p className="mt-4 border-l border-[color:var(--accent-warm)]/70 pl-3 font-mono text-[11px] leading-relaxed text-muted-foreground sm:text-[11.5px]">
        <span className="uppercase tracking-[0.18em] text-muted-foreground/65">
          constraint ·
        </span>{' '}
        <span className="text-foreground/85">{entry.label}</span>
      </p>
    )
  }
  return (
    <div className="mt-5 border-l border-[color:var(--accent-warm)]/70 pl-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
        constraint
      </p>
      <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-foreground/80 sm:text-[14px]">
        <span className="text-foreground/95">{entry.label}</span>{' '}
        <span className="text-muted-foreground">{entry.body}</span>
      </p>
    </div>
  )
}

// ─── Category badge ─────────────────────────────────────────────────────────
// Tiny mono caps pill that telegraphs "what kind of thing is this" — extension
// vs patch vs pipeline vs tool. Three colors map to the three accents; the
// fourth (tool) intentionally uses the neutral palette to avoid crowding.

function CategoryBadge({ slug }: { slug: string }) {
  const meta = META_BY_SLUG[slug]
  if (!meta) return null
  const cat = CATEGORY_DISPLAY[meta.category]
  return (
    <span
      className={cn(
        'inline-flex items-center border px-1.5 py-[1.5px] font-mono text-[9.5px] uppercase tracking-[0.22em]',
        cat.color,
      )}
    >
      {cat.label}
    </span>
  )
}

// ─── Metric line ────────────────────────────────────────────────────────────
// One mono caps line directly under the project name. The "compression" of
// each project into a single signature metric: "Spencer 1971" / "+405 / −358"
// / "UE5 · 3 commits" / etc. Cheap signal, replaces a paragraph.

function MetricLine({ slug }: { slug: string }) {
  const meta = META_BY_SLUG[slug]
  if (!meta) return null
  return (
    <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
      <span aria-hidden="true" className="text-muted-foreground/45">{'> '}</span>
      <span className="num text-foreground/75">{meta.metric}</span>
    </p>
  )
}

// ─── Project visualisation ──────────────────────────────────────────────────
// Per-project decorative SVG. Bigger than an icon, smaller than a thumbnail —
// it visualises the project's signature in pure SVG so the page doesn't go
// flat between rows of text. Each slug gets a small, distinctive form.

function ProjectViz({ slug }: { slug: string }) {
  return (
    <div className="mt-5 border border-border/55 bg-foreground/[0.02] p-4 sm:p-5">
      <div className="aspect-[16/7] w-full">
        <svg viewBox="0 0 320 140" className="h-full w-full" aria-hidden="true">
          {slug === 'worv-env-lights' ? <SolarArc /> :
           slug === 'worv-env-climate' ? <ClimateBars /> :
           slug === 'worv-core-logging' ? <LoggerWave /> :
           slug === 'usd-opacity-tools' ? <OpacityStack /> :
           slug === 'g29-teleop-port' ? <ControllerPad /> :
           <ChipBlock />}
        </svg>
      </div>
      <p className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/55">
        {VIZ_CAPTION[slug] ?? 'signature'}
      </p>
    </div>
  )
}

const VIZ_CAPTION: Record<string, string> = {
  'worv-env-lights':  'fig · solar elevation across a day',
  'worv-env-climate': 'fig · per-effect bug fixes (+/−)',
  'worv-core-logging': 'fig · configurable-hz sampling',
  'usd-opacity-tools': 'fig · ue → nucleus → isaac',
  'g29-teleop-port':  'fig · joymapping abstraction',
  'ddds-admin-app':   'fig · esp32-s3 ↔ dwin dgus',
}

// ── per-project SVG signatures ──────────────────────────────────────────────

function SolarArc() {
  const tickX = (i: number) => 20 + i * (280 / 24)
  return (
    <g>
      <line x1="20" y1="118" x2="300" y2="118" stroke="oklch(var(--border))" strokeWidth="0.8" opacity="0.55" />
      {Array.from({ length: 25 }).map((_, i) => (
        <line key={i} x1={tickX(i)} y1="118" x2={tickX(i)} y2={i % 6 === 0 ? 110 : 114} stroke="oklch(var(--muted-foreground))" strokeWidth="0.6" opacity="0.45" />
      ))}
      <path d="M 22 118 Q 160 -28 298 118" stroke="oklch(var(--muted-foreground))" strokeWidth="0.9" strokeDasharray="2 3" opacity="0.55" fill="none" />
      <path d="M 22 118 Q 160 -28 298 118" stroke="var(--accent-warm)" strokeWidth="1.6" pathLength="100" strokeDasharray="60 100" fill="none" />
      <circle cx="178" cy="34" r="5" fill="var(--accent-warm)" />
      <circle cx="178" cy="34" r="11" fill="var(--accent-warm)" opacity="0.12" />
      <text x="20" y="134" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.7">06:00</text>
      <text x="148" y="134" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.7">12:00</text>
      <text x="280" y="134" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.7">18:00</text>
    </g>
  )
}

function ClimateBars() {
  // 5 bug fixes as paired +/- bars.
  const fixes = [
    { plus: 92, minus: -88, label: 'PT' },
    { plus: 76, minus: -54, label: 'RTX' },
    { plus: 88, minus: -68, label: 'TRY' },
    { plus: 70, minus: -82, label: 'SRC' },
    { plus: 79, minus: -66, label: 'EFF' },
  ]
  const max = 100
  return (
    <g>
      <line x1="20" y1="70" x2="300" y2="70" stroke="oklch(var(--border))" strokeWidth="0.8" opacity="0.55" />
      {fixes.map((f, i) => {
        const x = 36 + i * 52
        const plusH = (f.plus / max) * 45
        const minusH = (-f.minus / max) * 45
        return (
          <g key={f.label}>
            <rect x={x} y={70 - plusH} width="22" height={plusH} fill="oklch(var(--primary))" opacity="0.85" />
            <rect x={x} y="70" width="22" height={minusH} fill="var(--accent-fail)" opacity="0.7" />
            <text x={x + 11} y="132" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.75">{f.label}</text>
          </g>
        )
      })}
    </g>
  )
}

function LoggerWave() {
  // 10 Hz sampling lattice. Pulses sit on the bottom register.
  const pts: string[] = []
  for (let i = 0; i < 24; i++) {
    const x = 16 + i * 12
    const y = 70 + Math.sin(i * 0.9) * 10
    pts.push(`${x},${y}`)
  }
  return (
    <g>
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={i} x1={16 + i * 28} y1="20" x2={16 + i * 28} y2="120" stroke="oklch(var(--muted-foreground))" strokeWidth="0.45" opacity="0.18" />
      ))}
      <polyline points={pts.join(' ')} stroke="oklch(var(--primary))" strokeWidth="1.4" fill="none" />
      {pts.filter((_, i) => i % 3 === 0).map((p, i) => {
        const [x, y] = p.split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="1.6" fill="oklch(var(--primary))" />
      })}
      <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="9" fill="oklch(var(--muted-foreground))" opacity="0.7">configurable Hz</text>
      <text x="240" y="34" fontFamily="var(--font-mono)" fontSize="9" fill="oklch(var(--muted-foreground))" opacity="0.7">csv · json</text>
    </g>
  )
}

function OpacityStack() {
  // Three rectangles stacked. UE → Nucleus → Isaac.
  const stops = [
    { x: 20, label: 'UE5', color: 'var(--accent-fail)' },
    { x: 120, label: 'NUCLEUS', color: 'var(--accent-warm)' },
    { x: 220, label: 'ISAAC', color: 'oklch(var(--primary))' },
  ]
  return (
    <g>
      {stops.map((s) => (
        <g key={s.label}>
          <rect x={s.x} y="42" width="80" height="56" fill="var(--surface-elevated)" stroke={s.color} strokeWidth="1.2" />
          <text x={s.x + 40} y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="oklch(var(--foreground))" opacity="0.9">{s.label}</text>
          <text x={s.x + 40} y="118" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.7">{s.label === 'UE5' ? 'c++ plugin' : s.label === 'NUCLEUS' ? 'docker worker' : 'usd edit'}</text>
        </g>
      ))}
      {[100, 200].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="70" x2={x + 20} y2="70" stroke="oklch(var(--muted-foreground))" strokeWidth="0.9" opacity="0.7" />
          <polygon points={`${x + 20},70 ${x + 16},67 ${x + 16},73`} fill="oklch(var(--muted-foreground))" opacity="0.7" />
        </g>
      ))}
    </g>
  )
}

function ControllerPad() {
  // Top-down generic gamepad outline + the JoyMapping arrow.
  return (
    <g>
      <rect x="40" y="30" width="240" height="80" rx="20" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="1.1" />
      <circle cx="80" cy="70" r="14" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.6)" strokeWidth="1" />
      <circle cx="80" cy="70" r="5" fill="var(--accent-warm)" />
      <circle cx="240" cy="70" r="14" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.6)" strokeWidth="1" />
      <circle cx="240" cy="70" r="5" fill="oklch(var(--primary))" />
      <rect x="118" y="56" width="20" height="6" fill="oklch(var(--foreground)/0.55)" />
      <rect x="125" y="49" width="6" height="20" fill="oklch(var(--foreground)/0.55)" />
      <circle cx="178" cy="62" r="3" fill="var(--accent-fail)" />
      <circle cx="188" cy="68" r="3" fill="var(--accent-warm)" />
      <circle cx="198" cy="74" r="3" fill="oklch(var(--primary))" />
      <circle cx="188" cy="80" r="3" fill="oklch(var(--foreground)/0.6)" />
      <text x="40" y="132" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.75">XBOX · G29 · PS5 · HEADLESS</text>
    </g>
  )
}

function ChipBlock() {
  // Generic embedded chip silhouette — used for the DDDS app.
  return (
    <g>
      <rect x="100" y="34" width="120" height="72" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="1" />
      <rect x="120" y="50" width="80" height="40" fill="oklch(var(--foreground)/0.06)" stroke="oklch(var(--foreground)/0.4)" strokeWidth="0.7" />
      <text x="160" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="oklch(var(--foreground))" opacity="0.75">ESP32-S3</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={`l${i}`} x="92" y={40 + i * 8} width="8" height="4" fill="oklch(var(--foreground)/0.5)" />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={`r${i}`} x="220" y={40 + i * 8} width="8" height="4" fill="oklch(var(--foreground)/0.5)" />
      ))}
      <text x="100" y="128" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(var(--muted-foreground))" opacity="0.7">USB SERIAL · DGUS UI</text>
    </g>
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
            <span className="num text-muted-foreground/60">{idx}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border" />
            <span className="text-foreground/70">{project.org}</span>
            <CategoryBadge slug={project.slug} />
          </span>
          <span className="text-muted-foreground/80">{period}</span>
        </div>

        {/* Project name — mono, smaller than featured but still substantial. */}
        <h3 className="mt-4 font-mono text-xl font-medium tracking-[-0.01em] text-foreground/95 sm:text-[22px]">
          {project.name}
        </h3>

        {/* Metric pill below the name — tiny visual signal that survives even
            after the tagline if it gets long. */}
        <MetricLine slug={project.slug} />

        {/* Tagline — the second-line "detail" copy lives in the PDF resume. */}
        <p className="mt-2 max-w-[34rem] text-pretty text-[14.5px] leading-relaxed text-foreground/80 sm:text-[15px]">
          {project.tagline}
        </p>

        <ConstraintRow slug={project.slug} compact />

        {/* Stack chips. */}
        <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
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
