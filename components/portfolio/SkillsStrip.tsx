'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { skills } from '@/lib/portfolio-data'
import { sectionListVariants, sectionItemVariants } from '@/lib/motion'

export function SkillsStrip() {
  const reduceMotion = useReducedMotion()
  const variantsList = reduceMotion ? undefined : sectionListVariants
  const variantsItem = reduceMotion ? undefined : sectionItemVariants

  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-20">
      <SectionHeader
        headingId="stack-heading"
        index="stack"
        title="tech stack"
        reduceMotion={reduceMotion ?? false}
      />

      <motion.div
        variants={variantsList}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {skills.map((group) => (
          <motion.div key={group.category} variants={variantsItem} className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              {group.category}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <span
                  key={skill}
                  className="border border-border/50 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/70 transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
      </div>
    </section>
  )
}
