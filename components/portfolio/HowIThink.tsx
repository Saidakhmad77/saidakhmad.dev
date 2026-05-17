'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { principles, experience, type Principle } from '@/lib/portfolio-data'
import { SolarReadout } from '@/components/portfolio/SolarReadout'
import { SilentFailureToggle } from '@/components/portfolio/SilentFailureToggle'
import { JoystickNudge } from '@/components/portfolio/JoystickNudge'
import { cn } from '@/lib/utils'

// ─── Motion grammar — matches Hero / NowBlock / ProjectsGrid. ────────────────
const EASE = [0.16, 1, 0.3, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
}

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

// ─── Top-level ───────────────────────────────────────────────────────────────
// Three philosophy cards from the cover letter. This section replaces the old
// chronological "Trajectory" — instead of "where I worked," it says "how I
// work." Each card has a claim, an example from real shipped code, and a
// tiny interactive proof. Cards alternate surface: dark / light / warm-light.

export function HowIThink() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : itemVariants
  const variantsList = reduceMotion ? undefined : listVariants

  // Build the trajectory strip — earliest job → most recent → now. The
  // experience[] array is reverse-chronological (current role first, CV
  // style); reverse it for a left-to-right timeline read.
  const strip = [...experience]
    .reverse()
    .map((e) => e.company)
    .join('  →  ')

  return (
    <section
      id="how-i-think"
      aria-labelledby="how-i-think-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        {/* Header row — § 03 / HOW I THINK. */}
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
            <h2 id="how-i-think-heading" className="text-foreground/80">
              How I Think
            </h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75 sm:text-xs">
            three lessons · one cover letter
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          style={{ transformOrigin: 'left center' }}
          className="mt-4 h-px w-full bg-border/60"
        />

        {/* One-line lead. Reads as the section's argument, not a paragraph. */}
        <motion.p
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-10 max-w-[44rem] text-balance text-[22px] font-medium leading-[1.25] tracking-[-0.015em] text-foreground/95 md:text-[26px]"
        >
          In a physics engine, wrong code{' '}
          <em className="not-italic text-[color:var(--accent-fail)]">succeeds.</em>
        </motion.p>

        {/* Cards. Stacked on mobile, three across on lg+. */}
        <motion.ol
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-3 lg:gap-7"
        >
          {principles.map((p) => (
            <PrincipleCard key={p.slug} principle={p} variants={variantsItem} />
          ))}
        </motion.ol>

        {/* Chronology strip — what used to be the whole Trajectory section,
            now a single line. The "shape" of the career, not the listing. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-20 md:mt-24"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Trajectory
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
              full detail in the resume
            </span>
          </div>
          <p className="mt-5 font-mono text-[13px] tracking-tight text-foreground/80 sm:text-[14px]">
            <span className="num">2024</span>
            <span className="mx-3 text-muted-foreground/45">→</span>
            <span>{strip}</span>
            <span className="mx-3 text-muted-foreground/45">→</span>
            <span className="text-[color:var(--primary)]">now</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Principle card ─────────────────────────────────────────────────────────
// One card = one philosophy. Card 1 is dark (matches surrounding section),
// card 2 is the inverted light surface (so the silent-failure toggle has
// contrast that reads as "broken light"), card 3 is the warm light surface
// (echoes the sunrise + the joystick's headlight).

function PrincipleCard({
  principle,
  variants,
}: {
  principle: Principle
  variants: Variants | undefined
}) {
  const accentBar =
    principle.accent === 'fail'
      ? 'bg-[color:var(--accent-fail)]'
      : principle.accent === 'warm'
        ? 'bg-[color:var(--accent-warm)]'
        : 'bg-[color:var(--primary)]'

  return (
    <motion.li
      variants={variants}
      className={cn(
        'group relative flex h-full flex-col border border-border/60 p-6 md:p-7',
      )}
    >
      {/* Giant ordinal — visual anchor for the card. Outlined (text-stroke
          alternative: foreground/15 sits on a 1px border-style block) so it
          reads as architecture, not loud. The accent bar to its right is the
          per-principle color signal. */}
      <div className="flex items-end gap-4">
        <span
          aria-hidden="true"
          className="num shrink-0 font-mono font-medium leading-none tracking-[-0.06em] text-foreground/15 text-[64px] sm:text-[72px]"
        >
          {principle.ordinal}
        </span>
        <div className="min-w-0 flex-1 pb-2">
          <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65">
            principle
          </span>
          <span aria-hidden="true" className={cn('mt-2 block h-px w-full', accentBar)} />
        </div>
      </div>

      {/* Claim — the headline. The blurb is intentionally dropped; the
          claim + the field example are enough. */}
      <h3 className="mt-5 text-balance text-2xl font-medium leading-tight tracking-[-0.015em] text-foreground sm:text-[26px]">
        {principle.claim}
      </h3>

      {/* Example. */}
      <div className="mt-5 border-t border-border/40 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          From the field · {principle.exampleTitle}
        </p>
        <p className="mt-2 text-pretty text-[13.5px] leading-relaxed text-muted-foreground">
          {principle.example}
        </p>
      </div>

      {/* Proof — pushed to the bottom so all three cards line up. */}
      <div className="mt-auto pt-6">
        <Proof slug={principle.slug} kind={principle.proof} />
      </div>
    </motion.li>
  )
}

function Proof({
  slug,
  kind,
}: {
  slug: Principle['slug']
  kind: Principle['proof']
}) {
  if (kind === 'solar') {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65">
          live data
        </span>
        <SolarReadout />
      </div>
    )
  }
  if (kind === 'silent') {
    return (
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65">
          try it
        </span>
        <SilentFailureToggle />
        <p className="font-mono text-[10.5px] leading-relaxed text-muted-foreground/65">
          flips every <code className="text-foreground/70">.num</code> on the page to its silent-failure state.
        </p>
      </div>
    )
  }
  if (kind === 'joystick') {
    return (
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65">
          steer me
        </span>
        <JoystickNudge />
      </div>
    )
  }
  // 'none' is unused for now but keeps the type honest.
  void slug
  return null
}
