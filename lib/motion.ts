import type { Variants } from 'framer-motion'

export const EASE = [0.16, 1, 0.3, 1] as const

// Tight stagger: with the hero's six children the last one starts at
// 0.05 + 5·0.07 = 0.40s, so everything is on screen inside ~450ms. Enough
// cascade to read as sequenced, not enough to make a visitor wait.
export const heroContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

export const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
}

export const sectionListVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

export const thinkingItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
}

export const thinkingListVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}
