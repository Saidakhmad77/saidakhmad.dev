'use client'

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ThemeToggle } from '@/components/portfolio/ThemeToggle'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

type SectionId = 'work' | 'projects' | 'stack' | 'nav-sim' | 'contact'

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'nav-sim', label: 'Sim' },
  { id: 'contact', label: 'Contact' },
]

const SCROLL_THRESHOLD = 32
const MD_QUERY = '(min-width: 48rem)'

// Critically damped (bounce 0) springs throughout: the underline and the sheet
// settle without overshoot, and stay interruptible mid-flight.
const UNDERLINE_SPRING = { type: 'spring', bounce: 0, duration: 0.35 } as const
const SHEET_SPRING = { type: 'spring', bounce: 0, duration: 0.3 } as const

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<SectionId | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // Where the sheet pins itself: just under the trigger, right edges aligned.
  // Measured on open so the sheet grows out of the button's own corner.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null)
  const reduceMotion = useReducedMotion()

  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

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

  const closeMenu = useCallback((returnFocus = false) => {
    setMenuOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu()
      return
    }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setAnchor({ top: rect.bottom + 8, right: document.documentElement.clientWidth - rect.right })
    }
    setMenuOpen(true)
  }

  // While open: Escape closes (focus back to the trigger), a press anywhere
  // outside closes, and crossing into md+ (where the inline links return)
  // closes. Focus moves into the sheet so keyboard users land on the list.
  useEffect(() => {
    if (!menuOpen) return

    firstLinkRef.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu(true)
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (sheetRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      closeMenu()
    }
    const mq = window.matchMedia(MD_QUERY)
    const onBreakpoint = () => {
      if (mq.matches) closeMenu()
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    mq.addEventListener('change', onBreakpoint)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
      mq.removeEventListener('change', onBreakpoint)
    }
  }, [menuOpen, closeMenu])

  // Tabbing out of the trigger + sheet pair closes it (disclosure pattern,
  // not a modal — no focus trap).
  const onMenuBlur = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null
    if (!next) return
    if (sheetRef.current?.contains(next) || triggerRef.current?.contains(next)) return
    closeMenu()
  }

  const sheetMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15, ease: 'linear' as const },
      }
    : {
        initial: { opacity: 0, scale: 0.88 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.88 },
        transition: SHEET_SPRING,
      }

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
        // data-glass: globals.css swaps the material for a solid surface
        // under prefers-reduced-transparency. Only present when the bar
        // actually has a material (scrolled) — at the top it's transparent.
        data-glass={scrolled ? '' : undefined}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300',
          scrolled
            ? 'bg-background/70 backdrop-blur-xl backdrop-saturate-150'
            : 'bg-transparent',
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 w-full max-w-(--breakpoint-2xl) items-center justify-between px-6 md:px-10"
        >
          {/* Identity mark — call-sign, not a logo. */}
          <a
            href="#top"
            className={cn(
              'press group inline-flex items-baseline gap-1.5 font-mono text-sm tracking-tight text-foreground/90 hover:text-foreground',
              FOCUS_RING,
            )}
            aria-label={`Saidakhmad — return to top`}
          >
            <span className="text-foreground">S</span>
            <span className="text-muted-foreground/70 transition-colors group-hover:text-primary">/</span>
            <span className="text-foreground">N</span>
            <span className="ml-2 hidden text-muted-foreground sm:inline">saidakhmad.dev</span>
          </a>

          {/* Right side: section anchors (md+) or the menu trigger (below md),
              then the theme toggle, which stays visible at every breakpoint. */}
          <div className="flex items-center gap-3">
            <ul className="hidden items-center gap-1 md:flex">
              {SECTIONS.map((s) => {
                const isActive = active === s.id
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        'press relative inline-block px-3 py-2 font-mono text-xs uppercase tracking-widest',
                        FOCUS_RING,
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
                          transition={reduceMotion ? { duration: 0 } : UNDERLINE_SPRING}
                        />
                      ) : null}
                    </a>
                  </li>
                )
              })}
            </ul>

            {/* Mobile — menu trigger. 32px tall visually, 44px hit area via
                the ::before so it lines up with the theme toggle. */}
            <button
              ref={triggerRef}
              type="button"
              onClick={toggleMenu}
              onBlur={onMenuBlur}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className={cn(
                'press relative inline-flex h-8 items-center gap-2 px-1.5 font-mono text-xs uppercase tracking-widest md:hidden',
                'before:absolute before:-inset-x-1 before:-inset-y-1.5',
                menuOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                FOCUS_RING,
              )}
            >
              <MenuGlyph open={menuOpen} reduceMotion={!!reduceMotion} />
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>

            <ThemeToggle />
          </div>
        </nav>

        {/* Soft scroll edge — replaces the hard bottom border. A short fade of
            the bar's own surface into the page, plus a hairline that dies
            out toward both ends, so content slides under rather than being
            cut by a rule. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-full h-4 transition-opacity duration-300',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-background/60 to-transparent" />
        </div>
      </motion.header>

      {/* Mobile section sheet. Rendered as a sibling of the header (not a
          child) so its backdrop-filter samples the page — a blurred parent
          would otherwise become its backdrop root and the blur would vanish. */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            ref={sheetRef}
            id={menuId}
            key="mobile-menu"
            data-glass=""
            onBlur={onMenuBlur}
            initial={sheetMotion.initial}
            animate={sheetMotion.animate}
            exit={sheetMotion.exit}
            transition={sheetMotion.transition}
            style={{
              top: anchor?.top ?? 64,
              right: anchor?.right ?? 24,
              transformOrigin: 'top right',
            }}
            className="fixed z-50 w-56 rounded-sm border border-border/60 bg-background/85 p-1.5 shadow-[0_16px_40px_-16px_oklch(0_0_0/0.55)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
          >
            <nav aria-label="Sections">
              <p className="px-3 pb-1.5 pt-2 font-mono text-label uppercase tracking-[0.22em] text-muted-foreground">
                <span aria-hidden="true" className="text-muted-foreground/45">{'/ '}</span>
                sections
              </p>
              <ul>
                {SECTIONS.map((s, i) => {
                  const isActive = active === s.id
                  return (
                    <li key={s.id}>
                      <a
                        ref={i === 0 ? firstLinkRef : undefined}
                        href={`#${s.id}`}
                        onClick={() => closeMenu()}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'press relative flex min-h-11 items-center gap-3 px-3 font-mono text-xs uppercase tracking-widest [--press-scale:0.98]',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary',
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'num w-5 text-label tracking-[0.15em]',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s.label}
                        {isActive ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-3 left-0 w-px bg-primary"
                          />
                        ) : null}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

// Two hairlines that fold into an × — same 1px stroke weight as the rest of
// the nav's rules. Reduced motion: instant swap, no rotation in flight.
function MenuGlyph({ open, reduceMotion }: { open: boolean; reduceMotion: boolean }) {
  const transition = reduceMotion ? { duration: 0 } : SHEET_SPRING
  return (
    <span aria-hidden="true" className="relative block h-2 w-3">
      <motion.span
        className="absolute inset-x-0 top-0 h-px bg-current"
        initial={false}
        animate={open ? { y: 3.5, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        className="absolute inset-x-0 bottom-0 h-px bg-current"
        initial={false}
        animate={open ? { y: -3.5, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
    </span>
  )
}
