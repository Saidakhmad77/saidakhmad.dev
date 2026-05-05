'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { writingTopics, type WritingTopic } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

// ─── Motion grammar — matches Hero / NowBlock / ProjectsGrid / Trajectory. ───
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

// ─── Status formatting ──────────────────────────────────────────────────────
// The literal status string the reader sees in the markup. Keep it ALL CAPS,
// short, plain. No "Coming soon" — that's the placeholder anti-pattern this
// section is explicitly avoiding.
const STATUS_LABEL: Record<WritingTopic['status'], string> = {
  planned: 'PLANNED',
  draft: 'DRAFT',
  shipped: 'SHIPPED',
}

// ─── Top-level section ──────────────────────────────────────────────────────
// Editorial-schedule layout: stacked rows separated by hairlines, no card
// containers, no thumbnails, no "Read more →" CTAs (none of these are
// readable yet — pretending otherwise would be the lie). Each row:
//   left rail (lg+):  index  +  STATUS mono caps
//   content:          title (sans, decisive) → summary (body)
// Mobile: index/status collapse onto a coordinate row above the title, mirroring
// the rhythm RoleEntry uses in §03.
//
// At-rest cyan budget: ZERO. All entries are `planned` — there's no
// most-developed entry to mark. Focus rings remain (state, not at-rest).

export function WritingSection() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : itemVariants
  const variantsList = reduceMotion ? undefined : listVariants

  // Editorial counts for the section eyebrow — stay honest about state.
  const total = writingTopics.length
  const counts = writingTopics.reduce(
    (acc, t) => {
      acc[t.status] += 1
      return acc
    },
    { planned: 0, draft: 0, shipped: 0 } as Record<WritingTopic['status'], number>,
  )

  return (
    <section
      id="writing"
      aria-labelledby="writing-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        {/* Header row — § 04 / WRITING. Right side: editorial state.
            "WRITING" over "NOTES" because these are publication-shaped pieces
            with concrete arguments — "notes" implies fragments, and a fragment
            doesn't earn 200 lines on the JoyMapping refactor. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="text-muted-foreground/50">§</span>
            <span>04</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <h2 id="writing-heading" className="text-foreground/80">
              Writing
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <span>{counts.planned.toString().padStart(2, '0')} planned</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>{counts.shipped.toString().padStart(2, '0')} shipped</span>
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

        {/* Honest framing line. Single sentence between the rule and the list,
            so the reader understands what they're looking at *before* scanning
            three planned titles and getting the wrong impression. Treated as
            section prose, not a marketing paragraph. */}
        <motion.p
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-8 max-w-[42rem] text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]"
        >
          An editorial schedule, not an archive. Three pieces I want to write
          about specific things I&rsquo;ve shipped — once each one is past the
          headline.
        </motion.p>

        {/* Stacked rows. Top + bottom hairlines on the list itself form a
            broadsheet rule pair; per-row dividers handled by RowEntry. */}
        <motion.ol
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-12 border-y border-border/40 md:mt-16"
        >
          {writingTopics.map((topic, i) => (
            <RowEntry
              key={topic.slug}
              topic={topic}
              index={i + 1}
              variants={variantsItem}
              isLast={i === writingTopics.length - 1}
            />
          ))}
        </motion.ol>
      </div>
    </section>
  )
}

// ─── Row entry ──────────────────────────────────────────────────────────────
// Two-column at lg+: meta rail (3/12) | content (9/12). Same column rhythm as
// Trajectory's RoleEntry — keeps §03 → §04 visually continuous so readers
// understand they're seeing the same author's manifest, not a different
// website. Hairline between rows; no rounded corners, no shadows, no fills.
//
// Hover behaviour: the row is non-interactive (these aren't readable yet),
// so hover is intentionally muted — a subtle hairline-color shift is the
// only at-rest-to-hover transition. No underline-from-zero, no arrow advance.
// Promising a click on something that isn't a link is the worst kind of
// fake-blog dishonesty.

function RowEntry({
  topic,
  index,
  variants,
  isLast,
}: {
  topic: WritingTopic
  index: number
  variants: Variants | undefined
  isLast: boolean
}) {
  const idx = index.toString().padStart(2, '0')
  const status = STATUS_LABEL[topic.status]

  return (
    <motion.li
      variants={variants}
      className={cn(
        'group relative grid grid-cols-1 gap-y-5 py-10 transition-colors duration-300 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0 lg:py-12',
        !isLast && 'border-b border-border/40',
      )}
      aria-label={`${status} — ${topic.title}`}
    >
      {/* Meta rail — index + status. Mirrors the period rail in Trajectory.
          On mobile this becomes a single coordinate row above the title. */}
      <div className="lg:col-span-3 lg:pt-1">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="text-muted-foreground/55">{idx}</span>
          <span aria-hidden="true" className="h-2.5 w-px bg-border" />
          {/* Status indicator — mono caps, foreground/70 so it's clearly
              readable but quiet. Bracketed so it reads as a state marker, not
              a label. NOT a colored pill, NOT a fill, NOT a rounded badge. */}
          <span className="inline-flex items-baseline gap-1 text-foreground/70">
            <span aria-hidden="true" className="text-muted-foreground/40">[</span>
            <span>{status}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">]</span>
          </span>
          {/* Optional date display — only renders if a topic has a concrete
              date attached. None do today, but the markup honours the data
              shape so future shipped posts get a "2026.06" coordinate
              without code change. */}
          {topic.date ? (
            <>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="text-muted-foreground/85">{topic.date}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Content column. */}
      <div className="lg:col-span-9">
        {/* Title — sans, substantial. Reads as publication-quality. The
            technical terms (ROS 2, UE5, Python) carry through in the prose;
            we don't apply mono mid-title — that fragments the typography
            and starts to look like a Tailwind tutorial. */}
        <h3 className="text-balance text-xl font-medium leading-snug tracking-[-0.015em] text-foreground/95 sm:text-[22px] md:text-2xl">
          {topic.title}
        </h3>

        {/* Summary — body, muted. Generous line-height for legibility. */}
        <p className="mt-4 max-w-[44rem] text-pretty text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
          {topic.summary}
        </p>
      </div>
    </motion.li>
  )
}
