'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { experience, now } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

// Match the hero's motion grammar exactly: opacity + small y, ease-out cubic-bezier, ~400ms.
const EASE = [0.16, 1, 0.3, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
}

const bulletsContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

// Compress "Feb 2026 — Present" into a coordinate-style range.
// Mirror the hero's monospace metadata convention. Tilde / arrow style.
function formatPeriod(period: string): string {
  // Replaces e.g. "Feb 2026 — Present" → "2026.02 → NOW"
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  }
  const parts = period.split('—').map((s) => s.trim())
  const start = parts[0] // "Feb 2026"
  const end = parts[1] || ''
  const m = start.match(/(\w+)\s+(\d{4})/)
  const fmtStart = m && months[m[1]] ? `${m[2]}.${months[m[1]]}` : start
  const fmtEnd = /present/i.test(end) ? 'NOW' : end
  return `${fmtStart} → ${fmtEnd}`
}

// Phrases that, when present in a bullet, get pulled into <code> for technical signal.
// Order matters: longer, more specific tokens first so they match before shorter substrings.
const TECH_TOKENS: { token: string; emphasis?: 'primary' | 'mono' }[] = [
  { token: 'worv.env.lights', emphasis: 'primary' },
  { token: 'worv.env.climate', emphasis: 'primary' },
  { token: 'worv.core.logging', emphasis: 'primary' },
  { token: 'JoyMapping dataclass', emphasis: 'primary' },
  { token: 'BaseExporter', emphasis: 'primary' },
  { token: 'PositionTracker', emphasis: 'mono' },
  { token: 'PointInstancer', emphasis: 'mono' },
  { token: 'OmniGraph', emphasis: 'mono' },
  { token: 'Ackermann', emphasis: 'mono' },
  { token: 'NavMesh', emphasis: 'mono' },
  { token: 'Nucleus', emphasis: 'mono' },
  { token: 'PhysX', emphasis: 'mono' },
  { token: 'teleop_node', emphasis: 'mono' },
]

// Render a bullet, replacing each known TECH_TOKEN with a styled <code>.
// Cyan budget: only `emphasis: 'primary'` tokens get the accent. Cap at 1 cyan per bullet
// so we don't blow the section's accent budget.
function renderBullet(text: string): React.ReactNode {
  const segments: { kind: 'text' | 'code'; value: string; emphasis?: 'primary' | 'mono' }[] = [
    { kind: 'text', value: text },
  ]

  let primaryUsed = false

  for (const { token, emphasis } of TECH_TOKENS) {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      if (seg.kind !== 'text') continue
      const idx = seg.value.indexOf(token)
      if (idx === -1) continue
      const before = seg.value.slice(0, idx)
      const after = seg.value.slice(idx + token.length)
      // Decide accent. Only one cyan per bullet — degrade to mono if budget already spent.
      let resolved: 'primary' | 'mono' = emphasis ?? 'mono'
      if (resolved === 'primary' && primaryUsed) resolved = 'mono'
      if (resolved === 'primary') primaryUsed = true

      const replacement: typeof segments = [
        { kind: 'text', value: before },
        { kind: 'code', value: token, emphasis: resolved },
        { kind: 'text', value: after },
      ].filter((s) => !(s.kind === 'text' && s.value === '')) as typeof segments

      segments.splice(i, 1, ...replacement)
      i += replacement.length - 1
    }
  }

  return segments.map((s, i) => {
    if (s.kind === 'text') return <span key={i}>{s.value}</span>
    const isPrimary = s.emphasis === 'primary'
    return (
      <code
        key={i}
        className={cn(
          'rounded-[3px] px-1 py-px font-mono text-[0.92em] tracking-tight',
          isPrimary
            ? 'bg-primary/8 text-primary'
            : 'bg-foreground/5 text-foreground/85',
        )}
      >
        {s.value}
      </code>
    )
  })
}

export function NowBlock() {
  const reduceMotion = useReducedMotion()
  const role = experience.find((e) => e.current) ?? experience[0]
  const variantsItem = reduceMotion ? undefined : itemVariants
  const variantsBullets = reduceMotion ? undefined : bulletsContainer

  const period = formatPeriod(role.period)
  const stack = role.stack

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        {/* Header row — § 01 / NOW + status pill on the right. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="text-muted-foreground/50">§</span>
            <span>01</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <h2 id="work-heading" className="text-foreground/80">
              Now
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <LiveDot reduceMotion={!!reduceMotion} />
            <span>{period}</span>
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

        {/* Title block: company (sans, large) + companyKo (muted) + role line (mono). */}
        <motion.div
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-15%' }}
          className="mt-10 md:mt-12"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-balance text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl md:text-5xl">
              {role.company}
            </h3>
            {role.companyKo ? (
              <span className="text-base text-muted-foreground/70 sm:text-lg">
                <span aria-hidden="true" className="text-muted-foreground/40">/</span>{' '}
                <span lang="ko">{role.companyKo}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
            <span className="text-foreground/85">{role.role}</span>
            {role.team ? (
              <>
                <span aria-hidden="true" className="text-border">·</span>
                <span>
                  <span className="text-muted-foreground/50">Team</span>{' '}
                  <span className="text-foreground/75">{role.team}</span>
                </span>
              </>
            ) : null}
            <span aria-hidden="true" className="text-border">·</span>
            <span>{role.location}</span>
          </div>
        </motion.div>

        {/* Two-column body on lg+: summary (left, narrower) | bullets (right, wider).
            Single-column stack on mobile/tablet so prose stays readable. */}
        <div className="mt-12 grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
          {/* Summary column. */}
          <motion.div
            variants={variantsItem}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-15%' }}
            className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Mandate
            </p>
            <p className="mt-3 max-w-[34rem] text-pretty text-base leading-relaxed text-foreground/85 lg:text-[17px]">
              {role.summary}
            </p>
          </motion.div>

          {/* Bullets column. */}
          <motion.ol
            variants={variantsBullets}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-15%' }}
            className="lg:col-span-8"
          >
            {role.bullets.map((b, i) => (
              <BulletRow
                key={i}
                index={i + 1}
                text={b}
                isLast={i === role.bullets.length - 1}
                variants={variantsItem}
              />
            ))}
          </motion.ol>
        </div>

        {/* /now sub-block — what's true *this month*. Lives between the impact bullets
            (where I work) and the Stack chips (what I work with). No new big header;
            this is metadata extending the section. Manifest divider matches the
            "Also shipped" / "Education" idiom used elsewhere. Zero new cyan. */}
        <NowSubBlock reduceMotion={!!reduceMotion} variantsItem={variantsItem} />

        {/* Stack chips — bottom row, full-width, mono caps. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-16 md:mt-20"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Stack
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
            {stack.map((s) => (
              <li key={s}>
                <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[11px] tracking-tight text-foreground/75">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function BulletRow({
  index,
  text,
  isLast,
  variants,
}: {
  index: number
  text: string
  isLast: boolean
  variants: Variants | undefined
}) {
  const idx = index.toString().padStart(2, '0')
  return (
    <motion.li
      variants={variants}
      className={cn(
        'group relative grid grid-cols-[2.25rem_1fr] gap-x-4 py-5 sm:grid-cols-[2.5rem_1fr] sm:gap-x-6',
        isLast ? '' : 'border-b border-border/40',
      )}
    >
      {/* Index — small mono, with a hairline tick that subtly extends on hover. */}
      <div className="relative flex items-start pt-[0.2rem]">
        <span className="font-mono text-[11px] tracking-[0.05em] text-muted-foreground/60">
          {idx}
        </span>
        <span
          aria-hidden="true"
          className="absolute left-7 top-[0.6rem] h-px w-3 bg-border transition-all duration-300 group-hover:w-5 group-hover:bg-primary/60 sm:left-8"
        />
      </div>

      {/* Bullet body — comfortable line-height, mid-weight foreground. */}
      <p className="text-pretty text-[15px] leading-relaxed text-foreground/85 sm:text-base">
        {renderBullet(text)}
      </p>
    </motion.li>
  )
}

// ─── /now sub-block ─────────────────────────────────────────────────────────
// Three labeled rows: LEARNING / READING / TINKERING. Manifest divider above
// matches the "Also shipped" / "Reach out" idiom. Two-column rows on sm+
// (mono caps label left, value right), single-column stack on mobile. No
// header — the divider's "/now" eyebrow does the framing.

function NowSubBlock({
  reduceMotion,
  variantsItem,
}: {
  reduceMotion: boolean
  variantsItem: Variants | undefined
}) {
  // Filter out empty rows (`tinkering` is currently []). The data layer is the
  // truth; render decides whether a row earns its keep this month.
  const rows: { label: string; render: () => React.ReactNode }[] = []

  if (now.learning.length > 0) {
    rows.push({
      label: 'Learning',
      render: () => (
        <span className="font-mono text-[13px] tracking-tight text-foreground/85">
          {now.learning.map((item, i) => (
            <span key={item}>
              {item}
              {i < now.learning.length - 1 ? (
                <span aria-hidden="true" className="text-border/80">{', '}</span>
              ) : null}
            </span>
          ))}
        </span>
      ),
    })
  }

  if (now.reading.length > 0) {
    rows.push({
      label: 'Reading',
      render: () => (
        <span className="font-mono text-[13px] tracking-tight text-foreground/85">
          {now.reading.map((book, i) => (
            <span key={book.title}>
              <em className="not-italic font-mono italic text-foreground/90">
                {book.title}
              </em>
              <span className="text-muted-foreground/70">{' — '}</span>
              <span className="text-foreground/70">{book.author}</span>
              {i < now.reading.length - 1 ? (
                <span aria-hidden="true" className="text-border/80">{', '}</span>
              ) : null}
            </span>
          ))}
        </span>
      ),
    })
  }

  if (now.tinkering.length > 0) {
    rows.push({
      label: 'Tinkering',
      render: () => (
        <span className="font-mono text-[13px] tracking-tight text-foreground/85">
          {now.tinkering.map((item, i) => (
            <span key={item}>
              {item}
              {i < now.tinkering.length - 1 ? (
                <span aria-hidden="true" className="text-border/80">{', '}</span>
              ) : null}
            </span>
          ))}
        </span>
      ),
    })
  } else {
    // Surface an honest "nothing this month" rather than dropping the row.
    // Keeps the structure visible so /now feels like a habit, not a one-shot.
    rows.push({
      label: 'Tinkering',
      render: () => (
        <span className="font-mono text-[13px] tracking-tight text-muted-foreground/55">
          (later)
        </span>
      ),
    })
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}
      className="mt-16 md:mt-20"
    >
      {/* Manifest divider — "/now" eyebrow + hairline. Same idiom as Stack below. */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          /now
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
          this month
        </span>
      </div>

      {/* Rows — small mono caps label on the left, value on the right.
          Single column on mobile, two-column at sm+. Hairline between rows
          (only between rows; not above the first or below the last). */}
      <motion.dl
        variants={variantsItem}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-6 divide-y divide-border/30"
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-y-1.5 py-3.5 sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-x-6 sm:gap-y-0"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
              {row.label}
            </dt>
            <dd className="text-pretty leading-relaxed">{row.render()}</dd>
          </div>
        ))}
      </motion.dl>
    </motion.div>
  )
}

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
