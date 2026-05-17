'use client'

import { useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── ThemeToggle ────────────────────────────────────────────────────────────
// Flips `html.theme-light` on/off and persists to localStorage. The inline
// script in layout.tsx restores the preference before React hydrates so users
// who picked light never see a dark flash on reload.
//
// State source-of-truth = the actual <html> class, observed via
// useSyncExternalStore + MutationObserver. No local useState/useEffect needed.

const STORAGE_KEY = 'theme'
const LIGHT_CLASS = 'theme-light'

function subscribeHtmlClass(notify: () => void): () => void {
  if (typeof document === 'undefined') return () => {}
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function getIsLightClient(): boolean {
  return document.documentElement.classList.contains(LIGHT_CLASS)
}

function getIsLightServer(): boolean {
  // SSR always renders the dark-default snapshot. The inline FOUC script
  // applies the user's actual preference before React hydrates, and the
  // MutationObserver will resync after.
  return false
}

export function ThemeToggle({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const light = useSyncExternalStore(subscribeHtmlClass, getIsLightClient, getIsLightServer)

  const toggle = () => {
    if (typeof document === 'undefined') return
    const next = !light
    document.documentElement.classList.toggle(LIGHT_CLASS, next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark')
    } catch {
      /* localStorage disabled — toggle still works for this session */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={light}
      className={cn(
        'group relative inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {/* Sun + moon glyphs, crossfaded. Sun visible when in light mode (so
          "you can switch back to dark" reads as "currently light"); moon
          visible when in dark mode. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: light ? 1 : 0 }
            : {
                opacity: light ? 1 : 0,
                rotate: light ? 0 : -90,
                scale: light ? 1 : 0.6,
              }
        }
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute"
      >
        <SunGlyph />
      </motion.span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: light ? 0 : 1 }
            : {
                opacity: light ? 0 : 1,
                rotate: light ? 90 : 0,
                scale: light ? 0.6 : 1,
              }
        }
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="absolute"
      >
        <MoonGlyph />
      </motion.span>
    </button>
  )
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="2.6" />
      <line x1="7" y1="1.5" x2="7" y2="2.8" />
      <line x1="7" y1="11.2" x2="7" y2="12.5" />
      <line x1="1.5" y1="7" x2="2.8" y2="7" />
      <line x1="11.2" y1="7" x2="12.5" y2="7" />
      <line x1="3.1" y1="3.1" x2="4" y2="4" />
      <line x1="10" y1="10" x2="10.9" y2="10.9" />
      <line x1="3.1" y1="10.9" x2="4" y2="10" />
      <line x1="10" y1="4" x2="10.9" y2="3.1" />
    </svg>
  )
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.4 8.4a4.6 4.6 0 0 1 -5.8 -5.8 4.6 4.6 0 1 0 5.8 5.8z" />
    </svg>
  )
}
