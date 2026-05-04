'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { SplineScene } from '@/components/ui/splite'
import { ContactRow } from '@/components/portfolio/ContactRow'
import { profile, experience } from '@/lib/portfolio-data'

const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

// Stagger the hero text. Spline does not animate (it has its own).
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

// Derive a short location string (city · country code) for the eyebrow.
// `profile.location` is "Seongnam, South Korea" — convert to "SEONGNAM · KR".
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
  const variantsContainer = reduceMotion ? undefined : containerVariants
  const variantsItem = reduceMotion ? undefined : itemVariants

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

          {/* Title — substantial but secondary. */}
          <motion.p
            variants={variantsItem}
            className="mt-3 text-balance text-xl text-muted-foreground md:text-2xl"
          >
            {profile.title}
          </motion.p>

          {/* Brief — body copy. */}
          <motion.p
            variants={variantsItem}
            className="mt-7 max-w-[32rem] text-pretty text-base leading-relaxed text-foreground/75"
          >
            {profile.brief}
          </motion.p>

          {/* Contact row. */}
          <motion.div variants={variantsItem} className="mt-9">
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
