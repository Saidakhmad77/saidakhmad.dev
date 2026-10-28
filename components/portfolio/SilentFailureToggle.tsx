'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Toggles data-silent="true" on <body>; globals.css does the rest — every
// .num element renders as a struck-through ghost + a "0" in fail-red.

const BANNER_DURATION_MS = 8_000
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function SilentFailureToggle({ className }: { className?: string }) {
  const [silent, setSilent] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(false)

  // stable identity so the konami listener effect below only subscribes once
  const toggle = useCallback((forced?: boolean) => {
    setSilent((prev) => {
      const next = typeof forced === 'boolean' ? forced : !prev
      setBannerVisible(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (silent) document.body.setAttribute('data-silent', 'true')
    else document.body.removeAttribute('data-silent')
  }, [silent])

  useEffect(() => {
    if (!bannerVisible) return
    const t = window.setTimeout(() => setBannerVisible(false), BANNER_DURATION_MS)
    return () => window.clearTimeout(t)
  }, [bannerVisible])

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
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return (
    <>
      <button
        type="button"
        onClick={() => toggle()}
        aria-pressed={silent}
        title="Toggle silent-failure mode — see what 'succeeded but wrong' looks like"
        className={cn(
          'press group inline-flex items-center gap-2 border px-3 py-2 font-mono text-label uppercase tracking-[0.22em]',
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
            <span aria-hidden="true" className="text-[color:var(--accent-fail)]/85">
              ESC to dismiss
            </span>
          </span>
        </div>
      ) : null}
    </>
  )
}
