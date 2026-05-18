'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { RoboGame } from '@/components/portfolio/RoboGame'
import { writingTopics, type WritingTopic } from '@/lib/portfolio-data'
import { EASE, sectionItemVariants, sectionListVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<WritingTopic['status'], string> = {
  planned: 'PLANNED',
  draft: 'DRAFT',
  shipped: 'SHIPPED',
}

// ─── Top-level section ──────────────────────────────────────────────────────
// Replaces the old WritingSection with the planned writing list, kept compact
// and honest.

export function Lab() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : sectionItemVariants
  const variantsList = reduceMotion ? undefined : sectionListVariants

  return (
    <section
      id="lab"
      aria-labelledby="lab-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
        <SectionHeader
          headingId="lab-heading"
          index="04"
          title="Lab"
          reduceMotion={!!reduceMotion}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75 sm:text-xs">
            notebook · not archive
          </div>
        </SectionHeader>

        {/* /nav_sim — autonomous navigation game. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
          className="mt-10 flex items-center gap-3 md:mt-12"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            /nav_sim
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
            manual · auto · a*
          </span>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          className="mt-6"
        >
          <RoboGame />
        </motion.div>

        {/* Planned writing. */}
        <PlannedWriting variantsItem={variantsItem} variantsList={variantsList} reduceMotion={!!reduceMotion} />
      </div>
    </section>
  )
}

// ─── Planned writing ────────────────────────────────────────────────────────
// Inherits the old WritingSection's row layout, but more compact.

function PlannedWriting({
  variantsItem,
  variantsList,
  reduceMotion,
}: {
  variantsItem: Variants | undefined
  variantsList: Variants | undefined
  reduceMotion: boolean
}) {
  const counts = writingTopics.reduce(
    (acc, t) => {
      acc[t.status] += 1
      return acc
    },
    { planned: 0, draft: 0, shipped: 0 } as Record<WritingTopic['status'], number>,
  )

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="mt-20 flex items-center gap-3 md:mt-24"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Planned writing
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
          <span className="num">{counts.planned.toString().padStart(2, '0')}</span> planned ·{' '}
          <span className="num">{counts.shipped.toString().padStart(2, '0')}</span> shipped
        </span>
      </motion.div>

      <motion.ol
        variants={variantsList}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-8 border-y border-border/40"
      >
        {writingTopics.map((topic, i) => (
          <WritingRow
            key={topic.slug}
            topic={topic}
            index={i + 1}
            variants={variantsItem}
            isLast={i === writingTopics.length - 1}
          />
        ))}
      </motion.ol>
    </>
  )
}

function WritingRow({
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
        'group relative grid grid-cols-1 gap-y-4 py-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0 lg:py-10',
        !isLast && 'border-b border-border/40',
      )}
    >
      <div className="lg:col-span-3 lg:pt-1">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
          <span className="num text-muted-foreground/55">{idx}</span>
          <span aria-hidden="true" className="h-2.5 w-px bg-border" />
          <span className="inline-flex items-baseline gap-1 text-foreground/70">
            <span aria-hidden="true" className="text-muted-foreground/40">[</span>
            <span>{status}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">]</span>
          </span>
          {topic.date ? (
            <>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="text-muted-foreground/85">{topic.date}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="lg:col-span-9">
        <h3 className="text-balance text-xl font-medium leading-snug tracking-[-0.015em] text-foreground/95 sm:text-[22px] md:text-2xl">
          {topic.title}
        </h3>
        <p className="mt-3 max-w-[44rem] text-pretty text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
          {topic.summary}
        </p>
      </div>
    </motion.li>
  )
}
