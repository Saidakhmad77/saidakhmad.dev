'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { facts, type FactCategory } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

// ─── SpinDeck ────────────────────────────────────────────────────────────────
// One personal fact at a time. Click "next" to cycle. Each fact is short by
// design — one or two sentences — so the visitor gets a steady drip of
// personality without a wall of text. Categories carry tiny SVG glyphs so the
// card has visual signal even before you read.
//
// Three accents already established (cyan / warm / fail) are reused as
// per-category color tags, but the surface itself stays neutral so the cards
// read as a single mechanic, not a rainbow.

const CATEGORY_META: Record<FactCategory, { glyph: string; accent: 'cyan' | 'warm' | 'fail' | 'neutral' }> = {
  why:         { glyph: '?', accent: 'cyan' },
  korea:       { glyph: '한', accent: 'neutral' },
  f1:          { glyph: '◯', accent: 'warm' },
  football:    { glyph: '⚽', accent: 'neutral' },
  languages:   { glyph: '⟁', accent: 'cyan' },
  debug:       { glyph: '✦', accent: 'fail' },
  source:      { glyph: '<>', accent: 'cyan' },
  arc:         { glyph: '→', accent: 'warm' },
  learning:    { glyph: '∆', accent: 'cyan' },
  origin:      { glyph: '↘', accent: 'neutral' },
  reading:     { glyph: '▤', accent: 'warm' },
  constraint:  { glyph: '◣', accent: 'warm' },
}

const ACCENT_CLASS = {
  cyan: 'text-[color:var(--primary)]',
  warm: 'text-[color:var(--accent-warm)]',
  fail: 'text-[color:var(--accent-fail)]',
  neutral: 'text-foreground/70',
} as const

const EASE = [0.16, 1, 0.3, 1] as const

export function SpinDeck() {
  const reduceMotion = useReducedMotion()
  const [i, setI] = useState(0)
  const total = facts.length
  const fact = facts[i]
  const meta = CATEGORY_META[fact.category]
  const accentClass = ACCENT_CLASS[meta.accent]

  const next = () => setI((p) => (p + 1) % total)
  const prev = () => setI((p) => (p - 1 + total) % total)
  const shuffle = () => {
    // Pick any non-current index.
    if (total <= 1) return
    let nxt = i
    while (nxt === i) nxt = Math.floor(Math.random() * total)
    setI(nxt)
  }

  return (
    <div className="relative">
      {/* Header strip — category label left, counter right. */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <span aria-hidden="true" className={cn('inline-block min-w-[1ch] text-center text-[13px] leading-none', accentClass)}>
            {meta.glyph}
          </span>
          <span>{fact.label}</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
          <span className="num text-foreground/80">{(i + 1).toString().padStart(2, '0')}</span>
          <span className="mx-1">/</span>
          <span className="num">{total.toString().padStart(2, '0')}</span>
        </span>
      </div>

      {/* Card body — single fact, animated swap. */}
      <div className="relative mt-4 min-h-[140px] overflow-hidden border border-border/60 bg-foreground/[0.02] p-6 sm:min-h-[160px] sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={fact.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="text-balance text-[18px] font-medium leading-snug tracking-[-0.01em] text-foreground/95 sm:text-[20px] md:text-[22px]"
          >
            {fact.body}
          </motion.p>
        </AnimatePresence>

        {/* Faint corner marks — same idiom as Hero's CornerMarks, scaled. */}
        <span aria-hidden="true" className="absolute left-2 top-2 h-2 w-2 border-l border-t border-muted-foreground/25" />
        <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 border-r border-t border-muted-foreground/25" />
        <span aria-hidden="true" className="absolute left-2 bottom-2 h-2 w-2 border-l border-b border-muted-foreground/25" />
        <span aria-hidden="true" className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-muted-foreground/25" />
      </div>

      {/* Controls. */}
      <div className="mt-4 flex items-center gap-3">
        <DeckButton onClick={prev} ariaLabel="Previous fact">
          <span aria-hidden="true">←</span>
          <span className="sr-only">prev</span>
        </DeckButton>
        <DeckButton onClick={next} ariaLabel="Next fact" primary>
          <span>next</span>
          <span aria-hidden="true">→</span>
        </DeckButton>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        <DeckButton onClick={shuffle} ariaLabel="Shuffle to a random fact">
          <span aria-hidden="true">↻</span>
          <span>shuffle</span>
        </DeckButton>
      </div>
    </div>
  )
}

function DeckButton({
  onClick,
  ariaLabel,
  primary = false,
  children,
}: {
  onClick: () => void
  ariaLabel: string
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'group inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background',
        primary
          ? 'border-[color:var(--primary)]/70 text-foreground hover:bg-[color:var(--primary)]/10'
          : 'border-border/70 text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
