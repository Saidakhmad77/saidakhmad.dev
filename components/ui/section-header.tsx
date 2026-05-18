'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '@/lib/motion'

type SectionHeaderProps = {
  headingId: string
  index: string
  title: string
  reduceMotion: boolean
  children?: ReactNode
}

export function SectionHeader({
  headingId,
  index,
  title,
  reduceMotion,
  children,
}: SectionHeaderProps) {
  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="text-muted-foreground/50">§</span>
          <span>{index}</span>
          <span aria-hidden="true" className="h-3 w-px bg-border" />
          <h2 id={headingId} className="text-foreground/80">
            {title}
          </h2>
        </div>

        {children}
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
    </>
  )
}
