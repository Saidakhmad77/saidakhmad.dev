'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// ── HelloWave ────────────────────────────────────────────────────────────────
// A small "hi 👋" badge that appears once on initial Hero load. The hand
// wobbles three times like a wave, then the whole badge fades out so it
// doesn't compete with the Spline robot's mouse-tracking behaviour. Lives
// inside the Spline container; positioned top-left of the 3D viewport.

const SHOW_MS  = 3600    // total time the badge stays on screen
const FADE_MS  = 400     // fade-in + fade-out duration
const EASE     = [0.16, 1, 0.3, 1] as const

export function HelloWave() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), SHOW_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -6 }}
      transition={{ duration: FADE_MS / 1000, ease: EASE, delay: visible ? 0.5 : 0 }}
      className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 border border-border/60 bg-background/60 px-2.5 py-1 backdrop-blur-sm sm:left-6 sm:top-6"
    >
      <motion.span
        role="img"
        aria-label="waving hand"
        className="inline-block origin-[70%_80%] text-[15px] leading-none"
        // Three small back-and-forth tilts, then settle. Triggered once
        // 0.9s after mount so the badge has finished fading in.
        animate={reduceMotion ? undefined : { rotate: [0, 16, -10, 16, -10, 0] }}
        transition={{
          duration: 1.3,
          delay: 0.9,
          repeat: 0,
          ease: 'easeInOut',
        }}
      >
        👋
      </motion.span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70">
        / hi
      </span>
    </motion.div>
  )
}
