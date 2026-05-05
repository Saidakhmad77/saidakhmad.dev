'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  experience,
  education,
  certificates,
  languages,
  type Experience,
  type Certificate,
  type Language,
  type Education,
} from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

// ─── Motion grammar — matches Hero / NowBlock / ProjectsGrid. ────────────────
const EASE = [0.16, 1, 0.3, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
}

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

// ─── Period formatting — "Feb 2026 — Present" → "2026.02 → NOW". ─────────────
const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function formatPeriod(period: string): string {
  const parts = period.split('—').map((s) => s.trim())
  const start = parts[0]
  const end = parts[1] ?? ''
  const m = start.match(/(\w+)\s+(\d{4})/)
  const fmtStart = m && MONTHS[m[1]] ? `${m[2]}.${MONTHS[m[1]]}` : start
  const fmtEnd = /present/i.test(end) ? 'NOW' : (() => {
    const me = end.match(/(\w+)\s+(\d{4})/)
    return me && MONTHS[me[1]] ? `${me[2]}.${MONTHS[me[1]]}` : end
  })()
  return end ? `${fmtStart} → ${fmtEnd}` : fmtStart
}

// Compact period for the section eyebrow summary.
function spanSummary(): string | null {
  const years = experience
    .flatMap((e) => e.period.match(/\d{4}/g) ?? [])
    .map(Number)
    .sort((a, b) => a - b)
  if (years.length === 0) return null
  const min = years[0]
  const max = experience.some((e) => e.current)
    ? new Date().getFullYear()
    : years[years.length - 1]
  return min === max ? `${min}` : `${min}–${max}`
}

// ─── Top-level ───────────────────────────────────────────────────────────────

export function ExperienceTimeline() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : itemVariants
  const variantsList = reduceMotion ? undefined : listVariants

  const span = spanSummary()
  const roleCount = experience.length

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        {/* Header row — § 03 / TRAJECTORY. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="text-muted-foreground/50">§</span>
            <span>03</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <h2 id="experience-heading" className="text-foreground/80">
              Trajectory
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            {span ? <span>{span}</span> : null}
            <span aria-hidden="true" className="text-border">·</span>
            <span>{roleCount} roles</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>1 degree</span>
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

        {/* (a) Timeline of roles. */}
        <motion.ol
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-12 md:mt-16"
        >
          {experience.map((role, i) => (
            <RoleEntry
              key={role.company}
              role={role}
              index={i + 1}
              variants={variantsItem}
              reduceMotion={!!reduceMotion}
              isLast={i === experience.length - 1}
            />
          ))}
        </motion.ol>

        {/* (b) Education. */}
        <SubBlockHeader label="Education" delay={0.05} reduceMotion={!!reduceMotion} />
        <motion.div
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-6"
        >
          <EducationStrip ed={education} />
        </motion.div>

        {/* (c) Languages + Credentials. */}
        <SubBlockHeader label="Credentials" delay={0.05} reduceMotion={!!reduceMotion} />
        <motion.div
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-8 grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0"
        >
          {/* Languages — narrower column. */}
          <motion.div variants={variantsItem} className="lg:col-span-4">
            <ColumnLabel>Languages</ColumnLabel>
            <ul className="mt-4 space-y-px">
              {languages.map((lang, i) => (
                <LanguageRow key={lang.name} lang={lang} isLast={i === languages.length - 1} />
              ))}
            </ul>
          </motion.div>

          {/* Certificates — wider column, two-up at sm+. */}
          <motion.div variants={variantsItem} className="lg:col-span-8">
            <ColumnLabel>Certificates &amp; awards</ColumnLabel>
            <ul className="mt-4 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {certificates.map((c, i) => (
                <CertificateRow
                  key={`${c.name}-${c.date}`}
                  cert={c}
                  index={i}
                  total={certificates.length}
                />
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Role entry ──────────────────────────────────────────────────────────────
// Two-column at lg+: period rail (left, fixed) | content (right). Hairline rule
// between roles. Period rail acts as visual spine without needing a real spine
// graphic. Current role gets a live status dot in the rail (the only at-rest
// cyan in the role timeline).

function RoleEntry({
  role,
  index,
  variants,
  reduceMotion,
  isLast,
}: {
  role: Experience
  index: number
  variants: Variants | undefined
  reduceMotion: boolean
  isLast: boolean
}) {
  const idx = index.toString().padStart(2, '0')
  const period = formatPeriod(role.period)
  const isMaum = role.current === true

  // No bullets in Trajectory. Maum.ai cross-references §01 / Now; the older
  // roles (ChoiceTech, STEMON) point at the PDF resume for their breakdowns.
  // The website surfaces summary + stack so the trajectory reads as a *shape*,
  // not a CV listing.

  return (
    <motion.li
      variants={variants}
      className={cn(
        'group relative grid grid-cols-1 gap-y-6 py-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0 lg:py-12',
        !isLast && 'border-b border-border/40',
      )}
    >
      {/* Period rail — left column on lg+, inline above content on mobile. */}
      <div className="lg:col-span-3 lg:pt-1">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="text-muted-foreground/55">{idx}</span>
          <span aria-hidden="true" className="h-2.5 w-px bg-border" />
          {isMaum ? <LiveDot reduceMotion={reduceMotion} /> : null}
          <span className={cn(isMaum ? 'text-foreground/85' : 'text-muted-foreground/85')}>
            {period}
          </span>
        </div>
      </div>

      {/* Content column. */}
      <div className="lg:col-span-9">
        {/* Company name + Korean rendering. */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-balance text-2xl font-medium tracking-[-0.02em] text-foreground sm:text-[28px]">
            {role.company}
          </h3>
          {role.companyKo ? (
            <span className="text-sm text-muted-foreground/65 sm:text-base">
              <span aria-hidden="true" className="text-muted-foreground/40">/</span>{' '}
              <span lang="ko">{role.companyKo}</span>
            </span>
          ) : null}
        </div>

        {/* Role + location — mono caps, single row. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11.5px]">
          <span className="text-foreground/80">{role.role}</span>
          {role.team ? (
            <>
              <span aria-hidden="true" className="text-border">·</span>
              <span>
                <span className="text-muted-foreground/55">Team</span>{' '}
                <span className="text-foreground/70">{role.team}</span>
              </span>
            </>
          ) : null}
          <span aria-hidden="true" className="text-border">·</span>
          <span>{role.location}</span>
        </div>

        {/* Summary line — body, foreground. */}
        <p className="mt-5 max-w-[42rem] text-pretty text-[14.5px] leading-relaxed text-foreground/85 sm:text-[15.5px]">
          {role.summary}
        </p>

        {/* Maum.ai branch: cross-reference to §01, no bullets, smaller stack chip
            row. The reader has already seen the depth of this role in NowBlock. */}
        {isMaum ? (
          <div className="mt-5">
            <a
              href="#work"
              className={cn(
                'group/ref inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors',
                'hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background',
              )}
            >
              <span aria-hidden="true" className="text-muted-foreground/55">↗</span>
              <span>See §01 / Now for full breakdown</span>
            </a>
          </div>
        ) : null}

        {/* Stack chips — same chip pattern as NowBlock + ProjectsGrid.
            Per-role bullet content lives in the PDF resume; this section
            surfaces the trajectory's shape, not its line items. */}
        <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-2">
          {role.stack.map((s) => (
            <li key={s}>
              <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[10.5px] tracking-tight text-foreground/75">
                {s}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  )
}

// ─── Sub-block header ────────────────────────────────────────────────────────
// "Manifest divider" — same pattern as ProjectsGrid's "Also shipped" subhead.

function SubBlockHeader({
  label,
  delay,
  reduceMotion,
}: {
  label: string
  delay: number
  reduceMotion: boolean
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4, ease: EASE, delay }}
      className="mt-20 flex items-center gap-3 md:mt-24"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
        {label}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
    </motion.div>
  )
}

function ColumnLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65">
      {children}
    </p>
  )
}

// ─── Education ───────────────────────────────────────────────────────────────
// Single fact, single horizontal strip. Smaller visual weight than role entries.

function EducationStrip({ ed }: { ed: Education }) {
  const period = formatPeriod(ed.period)
  return (
    <article className="grid grid-cols-1 gap-y-3 border-y border-border/40 py-6 lg:grid-cols-12 lg:items-baseline lg:gap-x-10 lg:gap-y-0">
      {/* Period — left rail, mirrors role timeline. */}
      <div className="lg:col-span-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          {period}
        </div>
      </div>
      {/* Body. */}
      <div className="lg:col-span-9">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
            {ed.school}
          </h3>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/85">
            {ed.location}
          </span>
        </div>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[12px]">
          <span className="text-foreground/80">{ed.degree}</span>
          <span aria-hidden="true" className="mx-2 text-border">·</span>
          <span>GPA {ed.gpa}</span>
        </p>
      </div>
    </article>
  )
}

// ─── Language row ────────────────────────────────────────────────────────────
// Mono row: NAME · LEVEL · CERT. Hairline between rows, no card containers.

function LanguageRow({ lang, isLast }: { lang: Language; isLast: boolean }) {
  return (
    <li
      className={cn(
        'flex items-baseline justify-between gap-4 py-2.5',
        !isLast && 'border-b border-border/30',
      )}
    >
      <span className="font-mono text-[12px] tracking-tight text-foreground/85">
        {lang.name}
      </span>
      <span className="flex items-baseline gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{lang.level}</span>
        {lang.cert ? (
          <>
            <span aria-hidden="true" className="text-border">·</span>
            <span className="text-foreground/65">{lang.cert}</span>
          </>
        ) : null}
      </span>
    </li>
  )
}

// ─── Certificate row ─────────────────────────────────────────────────────────
// Compact metadata — name (with optional issuer in muted) on the left, date on
// the right. Hairline separators. 2-column layout managed by the parent grid.

function CertificateRow({
  cert,
  index,
  total,
}: {
  cert: Certificate
  index: number
  total: number
}) {
  // Hide the bottom hairline on the last item of each column.
  // 2-column grid (sm+): the last two items are at index >= total - 2.
  // Single column (mobile): only the very last item is the bottom row.
  // We collapse to: "is this item the bottom of its column at sm+?" — by
  // index parity. Simpler: drop the rule on the final two items overall, since
  // both layouts agree the last 2 are "bottom of a column" or "final item."
  const isBottomRow = index >= total - 2
  return (
    <li
      className={cn(
        'flex items-baseline justify-between gap-4 py-2.5',
        // Hairline below — drop for the final row.
        !isBottomRow && 'border-b border-border/30',
        // On mobile the grid is 1-col, so we want the rule on every row except
        // the very last. Re-add it for the second-to-last on small screens.
        isBottomRow && index === total - 2 && 'border-b border-border/30 sm:border-b-0',
      )}
    >
      <div className="min-w-0 flex-1">
        <span className="font-mono text-[12px] tracking-tight text-foreground/85">
          {cert.name}
        </span>
        {cert.issuer ? (
          <span className="ml-2 font-mono text-[10.5px] tracking-tight text-muted-foreground/75">
            {cert.issuer}
          </span>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {cert.date}
      </span>
    </li>
  )
}

// ─── Live dot ────────────────────────────────────────────────────────────────
// Same as Hero / NowBlock. Reused locally to avoid cross-component coupling.

function LiveDot({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
      {!reduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-primary/40"
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="relative h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_currentColor] text-primary"
      />
    </span>
  )
}
