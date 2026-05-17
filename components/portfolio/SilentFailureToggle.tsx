'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Silent-failure toggle ──────────────────────────────────────────────────
// Toggles `data-silent="true"` on <body>. The CSS in globals.css does the rest:
// every element flagged with the `.num` class renders as a struck-through ghost
// of itself + a "0" in fail-red. A short-lived banner appears at the top to
// explain what just happened. The toggle is also the same payload Cmd-K's
// `silent on/off` command runs, and what the konami code triggers.
//
// Design intent: this is the cover-letter's headline thesis (engineering for
// the surfacing of silent failures) translated into an interactive moment.
// One click reveals what "succeeded-but-wrong" actually looks like.

const BANNER_DURATION_MS = 8_000
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function SilentFailureToggle({ className }: { className?: string }) {
  const [silent, setSilent] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)

  // Single helper used by every entry point (click, konami, Cmd-K). All
  // setState calls happen in event handlers, never synchronously in an effect.
  // useCallback with empty deps → stable identity, so global listener effects
  // don't resubscribe when this component re-renders.
  const toggle = useCallback((forced?: boolean) => {
    setSilent((prev) => {
      const next = typeof forced === 'boolean' ? forced : !prev
      setBannerVisible(next) // banner shows on each true-flip, replays on retoggle
      return next
    })
  }, [])

  // Sync the silent state onto <body data-silent="..."> so CSS attribute
  // selectors flip every .num in the page. Effect only writes to the DOM.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (silent) document.body.setAttribute('data-silent', 'true')
    else document.body.removeAttribute('data-silent')
  }, [silent])

  // Auto-clear the banner after the duration. setState happens inside an
  // async setTimeout callback — the legitimate "external timer" pattern.
  useEffect(() => {
    if (!bannerVisible) return
    const t = window.setTimeout(() => setBannerVisible(false), BANNER_DURATION_MS)
    return () => window.clearTimeout(t)
  }, [bannerVisible])

  // Konami listener + Cmd-K custom event channel. `toggle` is stable from
  // useCallback, so this effect subscribes once and never resubscribes.
  useEffect(() => {
    let i = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key === 'B' ? 'b' : e.key === 'A' ? 'a' : e.key
      if (key === KONAMI[i]) {
        i++
        if (i === KONAMI.length) {
          toggle()
          i = 0
        }
      } else {
        i = key === KONAMI[0] ? 1 : 0
      }
    }
    const onEvent = (e: Event) => {
      const ce = e as CustomEvent<{ value?: boolean }>
      toggle(typeof ce.detail?.value === 'boolean' ? ce.detail.value : undefined)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('silent-failure:toggle', onEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('silent-failure:toggle', onEvent)
    }
  }, [toggle])

  return (
    <>
      <button
        type="button"
        onClick={() => toggle()}
        aria-pressed={silent}
        title="Toggle silent-failure mode — see what 'succeeded but wrong' looks like"
        className={cn(
          'group inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.22em] transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-4 focus-visible:ring-offset-background',
          silent
            ? 'border-[color:var(--accent-fail)] text-[color:var(--accent-fail)] focus-visible:ring-[color:var(--accent-fail)]'
            : 'border-border/70 text-muted-foreground hover:text-foreground focus-visible:ring-primary',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full transition-colors',
            silent
              ? 'bg-[color:var(--accent-fail)] shadow-[0_0_6px_currentColor] text-[color:var(--accent-fail)]'
              : 'bg-muted-foreground/40 group-hover:bg-foreground/70',
          )}
        />
        <span>{silent ? 'silent · on' : 'silent · off'}</span>
      </button>

      {bannerVisible ? (
        <div role="status" aria-live="polite" className="silent-banner">
          <span className="silent-banner-inner">
            <span>{'// would have succeeded — wrong result'}</span>
            <span aria-hidden="true" className="text-[color:var(--accent-fail)]/55">
              ESC to dismiss
            </span>
          </span>
        </div>
      ) : null}
    </>
  )
}
