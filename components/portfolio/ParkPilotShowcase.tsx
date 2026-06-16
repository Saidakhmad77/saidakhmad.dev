'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { sectionItemVariants, sectionListVariants } from '@/lib/motion'

// ─────────────────────────────────────────────────────────────────────────────
// ParkPilot — the personal flagship. The single open-source / public-repo entry
// and the deliberate ONE exception to the site's no-raster-media rule. Framed
// with the same restraint as everything else: sharp corners, a single hairline
// border, mono caption beneath. No floating card, no shadow, no rounded-xl.
//
// Layout intent: an asymmetric broadsheet. The demo GIF leads on the left at
// lg+ (portrait, height-constrained), the readout — name, tagline, metrics,
// constraint, training-curves fig, stack, repo — runs down the right. Stacks to
// a single column below lg. Reuses the exact chip / constraint / coordinate
// hand established in ProjectsGrid so it reads as the same author.
// ─────────────────────────────────────────────────────────────────────────────

const METRICS: { value: string; label: string }[] = [
  { value: '99.5%', label: 'success · randomized start' },
  { value: '100%', label: 'success · fixed start' },
  { value: '~17', label: 'steps to park' },
]

const STACK = ['MuJoCo', 'Gymnasium', 'SAC (SB3)', 'PyTorch', 'Python', 'Apple Silicon'] as const

const REPO_URL = 'https://github.com/Saidakhmad77/parkpilot'

export function ParkPilotShowcase() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : sectionItemVariants
  const variantsList = reduceMotion ? undefined : sectionListVariants

  return (
    <section
      id="parkpilot"
      aria-labelledby="parkpilot-heading"
      className="relative w-full scroll-mt-16 border-t border-border/60"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        <SectionHeader
          headingId="parkpilot-heading"
          index="02"
          title="Featured"
          reduceMotion={!!reduceMotion}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <span className="text-[color:var(--primary)]">Personal</span>
            <span aria-hidden="true" className="text-border">·</span>
            <span>open source</span>
          </div>
        </SectionHeader>

        {/* Broadsheet. Left-edge cyan hairline — the same at-rest featured
            signal ProjectsGrid uses, here marking the whole flagship block. */}
        <motion.div
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="group relative mt-12 md:mt-16"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-px bg-primary/70 transition-colors duration-300 group-hover:bg-primary"
          />

          <div className="grid grid-cols-1 gap-x-12 gap-y-10 pl-6 sm:pl-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
            {/* ── Demo GIF — the hero visual. Portrait, height-capped, single
                hairline, mono caption. The deliberate one raster exception. ── */}
            <motion.figure variants={variantsItem} className="lg:sticky lg:top-24">
              <div className="border border-border/55 bg-foreground/[0.02] p-2">
                {/* Plain <img>: the site uses no next/image, and Next's optimizer
                    freezes animated GIFs to the first frame — we want it moving.
                    Height-constrained so the portrait clip keeps page rhythm. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/parkpilot/parkpilot-demo.gif"
                  alt="ParkPilot: a car-like robot reverses and parks itself into a tight slot between two parked cars in a MuJoCo simulation."
                  width={480}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className="mx-auto block h-auto max-h-[26rem] w-full max-w-[20rem] object-contain"
                />
              </div>
              <figcaption className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/55">
                fig · deterministic policy, randomized start
              </figcaption>
            </motion.figure>

            {/* ── Readout column ── */}
            <div>
              {/* Coordinate row — org + category + period, ProjectsGrid idiom. */}
              <motion.div
                variants={variantsItem}
                className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-foreground/70">Personal</span>
                  <span
                    className="inline-flex items-center border border-[color:var(--primary)]/60 px-1.5 py-[1.5px] font-mono text-[9.5px] uppercase tracking-[0.22em] text-[color:var(--primary)]"
                  >
                    RL
                  </span>
                </span>
                <span className="text-muted-foreground/80">2026.06</span>
              </motion.div>

              {/* Name — mono, featured size. */}
              <motion.h3
                variants={variantsItem}
                className="mt-5 font-mono text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-[28px] md:text-3xl"
              >
                ParkPilot
              </motion.h3>

              {/* Tagline. */}
              <motion.p
                variants={variantsItem}
                className="mt-3 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-foreground/85 sm:text-base"
              >
                RL Ackermann (car-like) auto-parking in MuJoCo — SAC parks a car into a
                tight slot between two parked cars, running natively on Apple Silicon
                (no NVIDIA, no Isaac Sim).
              </motion.p>

              {/* Metrics readout — mono "coordinate" stats, NowBlock-style.
                  .num so they join the silent-failure easter egg. */}
              <motion.dl
                variants={variantsItem}
                className="mt-7 grid grid-cols-1 divide-y divide-border/30 border-y border-border/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
              >
                {METRICS.map((m) => (
                  <div key={m.label} className="py-4 sm:px-5 sm:py-4 sm:first:pl-0">
                    <dt className="font-mono text-[26px] font-medium tracking-[-0.02em] text-foreground tabular-nums sm:text-3xl">
                      <span className="num">{m.value}</span>
                    </dt>
                    <dd className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground/65">
                      {m.label}
                    </dd>
                  </div>
                ))}
              </motion.dl>

              {/* Secondary mono line — the training arc, kept as prose stat. */}
              <motion.p
                variants={variantsItem}
                className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70"
              >
                <span aria-hidden="true" className="text-muted-foreground/45">{'> '}</span>
                <span className="num text-foreground/75">398/400 across 4 seeds</span>
                <span aria-hidden="true" className="mx-2 text-border">·</span>
                <span className="num text-foreground/75">reward −1180 → +178</span>
                <span aria-hidden="true" className="mx-2 text-border">·</span>
                <span className="num text-foreground/75">~15 min on CPU</span>
              </motion.p>

              {/* Constraint row — amber left-border motif, full ConstraintRow
                  variant. The site's signature "constraint as design input." */}
              <motion.div
                variants={variantsItem}
                className="mt-7 border-l border-[color:var(--accent-warm)]/70 pl-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
                  constraint
                </p>
                <p className="mt-2 max-w-[40rem] text-pretty text-[13.5px] leading-relaxed text-foreground/80 sm:text-[14px]">
                  <span className="text-foreground/95">
                    Apple Silicon — no NVIDIA, no Isaac Sim.
                  </span>{' '}
                  <span className="text-muted-foreground">
                    Solved with MuJoCo and a pure kinematic bicycle model (mj_forward,
                    not mj_step), plus domain randomization — random start pose and
                    wheelbase — for robustness.
                  </span>
                </p>
              </motion.div>

              {/* Training curves — the secondary "fig". Smaller, landscape,
                  same hairline frame + mono caption as the demo. */}
              <motion.figure variants={variantsItem} className="mt-7">
                <div className="border border-border/55 bg-foreground/[0.02] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/parkpilot/parkpilot-curves.png"
                    alt="Two training curves over 300k steps: episode reward climbing from about -1180 to +178, and success rate rising past a 0.80 target line."
                    width={1200}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full object-contain"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/55">
                  fig · episode reward + success rate over 300k steps
                </figcaption>
              </motion.figure>

              {/* Stack chips — border-only mono, sharp corners. */}
              <motion.ul
                variants={variantsItem}
                className="mt-7 flex flex-wrap gap-x-2 gap-y-2"
              >
                {STACK.map((s) => (
                  <li key={s}>
                    <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[11px] tracking-tight text-foreground/75">
                      {s}
                    </span>
                  </li>
                ))}
              </motion.ul>

              {/* Repo link — understated, mono. The only project with a public
                  link; kept quiet rather than loud. */}
              <motion.div variants={variantsItem} className="mt-7">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/repo inline-flex items-center gap-2.5 font-mono text-[12px] tracking-tight text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 transition-colors duration-200 group-hover/repo:text-[color:var(--primary)] group-focus-visible/repo:text-[color:var(--primary)]"
                  >
                    {'↗'}
                  </span>
                  <span className="border-b border-border/50 pb-px transition-colors duration-200 group-hover/repo:border-foreground/40">
                    github.com/Saidakhmad77/parkpilot
                  </span>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
