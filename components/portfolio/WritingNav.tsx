'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ThemeToggle } from '@/components/portfolio/ThemeToggle'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

// ─── WritingNav ───────────────────────────────────────────────────────────────
// The /writing chrome. Mirrors the homepage Nav exactly — fixed, blur-on-scroll,
// the S / N call-sign mark, the ThemeToggle — but its links resolve to REAL
// destinations from a sub-route (the homepage Nav's in-page #anchors are
// homepage-only and would dangle here). So the anchors point at /#section and
// the call-sign returns home. One extra "Writing" crumb marks the current
// surface.
//
// The active "Writing" crumb gets the same cyan underline the homepage uses for
// the active section, so the two navs read as one system.

const SCROLL_THRESHOLD = 32

export function WritingNav() {
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background,border,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-(--breakpoint-2xl) items-center justify-between px-6 md:px-10"
      >
        {/* Identity mark — call-sign, returns to the homepage top. */}
        <Link
          href="/"
          className="group inline-flex items-baseline gap-1.5 font-mono text-sm tracking-tight text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label="Saidakhmad — return to home"
        >
          <span className="text-foreground">S</span>
          <span className="text-muted-foreground/70 transition-colors group-hover:text-primary">/</span>
          <span className="text-foreground">N</span>
          <span className="ml-2 hidden text-muted-foreground/60 sm:inline">saidakhmad.dev</span>
        </Link>

        <div className="flex items-center gap-3">
          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <Link
                href="/#projects"
                className="relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/#lab"
                className="relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Lab
              </Link>
            </li>
            <li>
              <Link
                href="/writing"
                aria-current="page"
                className="relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Writing
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 -bottom-px h-px bg-primary"
                />
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                className="relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Mobile — single jump-home in front of the toggle. */}
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground md:hidden"
          >
            Home
          </Link>

          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  )
}
