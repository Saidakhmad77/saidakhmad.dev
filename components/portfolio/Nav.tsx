'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ThemeToggle } from '@/components/portfolio/ThemeToggle'
import { cn } from '@/lib/utils'

type SectionId = 'work' | 'projects' | 'how-i-think' | 'lab' | 'contact'

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'how-i-think', label: 'How I think' },
  { id: 'lab', label: 'Lab' },
  { id: 'contact', label: 'Contact' },
]

const SCROLL_THRESHOLD = 32

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<SectionId | null>(null)
  const reduceMotion = useReducedMotion()

  // Sticky-state on scroll past threshold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section tracking. Trigger ~ middle-of-viewport.
  useEffect(() => {
    const targets = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry most "in view" — closest to the middle.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActive(visible[0].target.id as SectionId)
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
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
        {/* Identity mark — call-sign, not a logo. */}
        <a
          href="#top"
          className="group inline-flex items-baseline gap-1.5 font-mono text-sm tracking-tight text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={`Saidakhmad — return to top`}
        >
          <span className="text-foreground">S</span>
          <span className="text-muted-foreground/70 transition-colors group-hover:text-primary">/</span>
          <span className="text-foreground">N</span>
          <span className="ml-2 hidden text-muted-foreground/60 sm:inline">saidakhmad.dev</span>
        </a>

        {/* Right side: section anchors + theme toggle. Anchors collapse on
            mobile; the theme toggle stays visible at every breakpoint. */}
        <div className="flex items-center gap-3">
          <ul className="hidden items-center gap-1 md:flex">
            {SECTIONS.map((s) => {
              const isActive = active === s.id
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      'relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {s.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-px h-px bg-primary"
                        transition={{
                          type: 'spring',
                          stiffness: 360,
                          damping: 32,
                        }}
                      />
                    ) : null}
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Mobile — single jump-to-contact in front of the toggle. */}
          <a
            href="#contact"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground md:hidden"
          >
            Contact
          </a>

          <ThemeToggle />
        </div>
      </nav>
    </motion.header>
  )
}
