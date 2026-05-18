'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SplineScene } from '@/components/ui/splite'
import { ContactRow } from '@/components/portfolio/ContactRow'
import { SolarReadout } from '@/components/portfolio/SolarReadout'
import { profile, experience, aboutCover } from '@/lib/portfolio-data'
import { heroContainerVariants, sectionItemVariants } from '@/lib/motion'

const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

// Derive a short location string (city · country code) for the eyebrow.
// `profile.location` is "Seoul, South Korea" — convert to "SEOUL · KR".
function shortLocation(loc: string): string {
  const [city] = loc.split(',').map((s) => s.trim())
  return `${city.toUpperCase()} · KR`
}

// Pull the current employer from experience data.
const currentRole = experience.find((e) => e.current)
const currentEmployerLabel = currentRole
  ? `NOW @ ${currentRole.company.toUpperCase()}`
  : null

export function Hero() {
  const reduceMotion = useReducedMotion()
  const variantsContainer = reduceMotion ? undefined : heroContainerVariants
  const variantsItem = reduceMotion ? undefined : sectionItemVariants

  return (
    <section
      id="top"
      className="relative isolate min-h-screen w-full overflow-hidden"
    >
      {/* Faint engineering grid backdrop — barely there. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Section content */}
      <div className="relative mx-auto grid w-full max-w-(--breakpoint-2xl) grid-cols-1 gap-y-10 px-6 pt-28 pb-16 md:grid-cols-12 md:gap-x-8 md:px-10 md:pt-32 md:pb-20 lg:gap-x-12">
        {/* Left — content. Span 6 of 12 on md+, push by a column on lg for breathing room. */}
        <motion.div
          variants={variantsContainer}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          className="md:col-span-7 lg:col-span-6 flex flex-col"
        >
          {/* Eyebrow — status line. */}
          <motion.div
            variants={variantsItem}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>{shortLocation(profile.location)}</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            {currentEmployerLabel ? (
              <span className="inline-flex items-center gap-2">
                <LiveDot reduceMotion={!!reduceMotion} />
                <span>{currentEmployerLabel}</span>
              </span>
            ) : null}
          </motion.div>

          {/* Name — largest type. Weight 500: refined, not loud. */}
          <motion.h1
            variants={variantsItem}
            className="mt-6 text-balance text-5xl font-medium tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl"
          >
            {profile.name}
          </motion.h1>

          {/* Nickname — small mono callsign directly under the formal name.
              Reads as "and people call me Sam" — a personal annotation, not a
              rebrand. Same mono / tracking grammar as the eyebrow above the
              name so it ties the identity block together. The leading slash
              echoes the "/now" / "/uses" manifest idiom used elsewhere. */}
          <motion.p
            variants={variantsItem}
            aria-label={`Also known as ${profile.nickname}`}
            className="mt-3 font-mono text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground/70"
          >
            <span aria-hidden="true" className="text-muted-foreground/45">
              {'/ '}
            </span>
            <span className="text-foreground/65">a.k.a. {profile.nickname}</span>
          </motion.p>

          {/* Title — substantial but secondary. */}
          <motion.p
            variants={variantsItem}
            className="mt-4 text-balance text-xl text-muted-foreground md:text-2xl"
          >
            {profile.title}
          </motion.p>

          {/* Hook — short, pull-quote scale. The expanded narrative lives
              in §05 About; here it has to land in one breath. */}
          <motion.p
            variants={variantsItem}
            className="mt-8 max-w-[34rem] text-balance text-[22px] font-medium leading-[1.25] tracking-[-0.015em] text-foreground/95 md:text-[26px]"
          >
            {aboutCover.hook}
          </motion.p>

          {/* Beliefs — kept, but moved below the stats so it reads as a
              footer to the hero block, not a continuation of the role line. */}
          <motion.p
            variants={variantsItem}
            className="mt-4 flex max-w-[32rem] items-start gap-3 font-mono text-[12px] italic leading-relaxed text-foreground/55"
          >
            <span
              aria-hidden="true"
              className="mt-2 inline-block h-px w-5 shrink-0 bg-border"
            />
            <span>{profile.beliefs}</span>
          </motion.p>

          {/* Live Seoul solar readout. */}
          <motion.div variants={variantsItem}>
            <SolarReadout />
          </motion.div>

          {/* Contact row. */}
          <motion.div variants={variantsItem} className="mt-7">
            <ContactRow />
          </motion.div>
        </motion.div>

        {/* Right — Spline scene. Decorative. */}
        <div
          aria-hidden="true"
          className="relative md:order-last md:col-span-5 lg:col-span-6"
        >
          <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px] md:h-[560px] lg:h-[640px]">
            {/* Soft radial mask so the 3D scene fades into the page rather than feeling boxed. */}
            <div className="h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_92%)]">
              <SplineScene
                scene={SPLINE_SCENE}
                className="h-full w-full"
              />
            </div>
            {/* Corner registration marks — engineering-precision detail. */}
            <CornerMarks />
          </div>
        </div>
      </div>

      {/* Hairline rule sealing the hero off from the sections below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
    </section>
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

function CornerMarks() {
  // Four small L-shaped marks at the corners — telegraphs precision without being decorative.
  const base =
    'absolute h-3 w-3 border-muted-foreground/30'
  return (
    <>
      <span aria-hidden="true" className={`${base} left-0 top-0 border-l border-t`} />
      <span aria-hidden="true" className={`${base} right-0 top-0 border-r border-t`} />
      <span aria-hidden="true" className={`${base} left-0 bottom-0 border-l border-b`} />
      <span aria-hidden="true" className={`${base} right-0 bottom-0 border-r border-b`} />
    </>
  )
}
