'use client'

import { motion } from 'framer-motion'

export function LiveDot({ reduceMotion }: { reduceMotion: boolean }) {
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
