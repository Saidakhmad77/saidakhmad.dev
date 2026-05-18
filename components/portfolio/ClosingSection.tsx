'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import {
  profile,
  skills,
  uses,
  aboutCover,
  education,
  languages,
  certificates,
  type SkillCategory,
  type Uses,
  type Education,
  type Language,
  type Certificate,
} from '@/lib/portfolio-data'
import { EASE, sectionItemVariants, sectionListVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Year for the footer copyright. Rendered server-side from `new Date()` would
// hydration-mismatch on the boundary; computing once at module load is fine —
// the page is built fresh on each deploy and the copyright moves with it.
const COPY_YEAR = new Date().getFullYear()

// Build version pulled from package.json shape — we hardcode the literal here
// rather than importing JSON to avoid a Next config concern. Update on release.
const BUILD_VERSION = 'v0.1.0'

// ─── Top-level section ──────────────────────────────────────────────────────
// One section, four sub-blocks: Stack → About → Closing Contact → Footer.
// The footer lives inside this section's <section> wrapper rather than as a
// page-level <footer>: it reads as the closing exhalation of the contact
// section, not as page chrome. The hairline above it carries the separation.

export function ClosingSection() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : sectionItemVariants
  const variantsList = reduceMotion ? undefined : sectionListVariants

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-16 md:px-10 md:pt-32 md:pb-20">
        <SectionHeader
          headingId="contact-heading"
          index="05"
          title="Contact"
          reduceMotion={!!reduceMotion}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <LiveDot reduceMotion={!!reduceMotion} />
            <span>Open to work</span>
          </div>
        </SectionHeader>

        {/* (a) About — single column, full prose width. Pulled out of the
            previous side-by-side grid with Stack so the light zone below can
            cleanly wrap Stack + Uses without splitting on the diagonal. About
            stays on the dark surface — it's personal voice, not capability
            inventory, and reads better against the engineered-dark backdrop. */}
        <AboutBlock variants={variantsItem} reduceMotion={!!reduceMotion} />

        {/* Stack + /uses — single dark surface like the rest of the site.
            Hairline borders top and bottom carry the separation; no surface
            flip. The negative inset breaks out of the section padding so the
            hairlines run edge-to-edge of the viewport. */}
        <div className="mt-16 -mx-6 border-y border-border/60 px-6 pt-16 pb-20 md:-mx-10 md:mt-20 md:px-10 md:pt-20 md:pb-24">
          <StackBlock
            variantsList={variantsList}
            variantsItem={variantsItem}
            reduceMotion={!!reduceMotion}
          />
          <UsesBlock
            variantsList={variantsList}
            variantsItem={variantsItem}
            reduceMotion={!!reduceMotion}
          />
        </div>

        {/* (d) Closing contact — the final ask. Larger type than the hero's
            ContactRow, separated by a "Reach out" manifest divider. */}
        <ClosingContact
          variants={variantsItem}
          variantsList={variantsList}
          reduceMotion={!!reduceMotion}
        />

        {/* (d) Footer — page metadata. */}
        <Footer reduceMotion={!!reduceMotion} />
      </div>
    </section>
  )
}

// ─── About block ─────────────────────────────────────────────────────────────
// Two short paragraphs. Same column rhythm as NowBlock's "Mandate" — small mono
// label followed by body prose. No headshot, no bio-page sprawl.

function AboutBlock({
  variants,
  reduceMotion,
}: {
  variants: Variants | undefined
  reduceMotion: boolean
}) {
  return (
    <motion.div
      variants={variants}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-15%' }}
      className="mt-12 grid grid-cols-1 gap-x-12 gap-y-12 md:mt-16 lg:grid-cols-12"
    >
      {/* Left column — the prose. Cover-letter voice. */}
      <div className="lg:col-span-7">
        {/* Bilingual "self-introduction" header — small but unmistakable
            personality signal that wasn't on the old site at all. */}
        <div className="flex items-baseline gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            About
          </p>
          <span aria-hidden="true" className="h-px w-6 bg-border/50" />
          <p
            className="font-hangul text-[14.5px] text-muted-foreground/85"
            lang="ko"
          >
            {aboutCover.greeting}
          </p>
        </div>

        <div className="mt-6 max-w-[38rem] space-y-4 text-pretty text-[15px] leading-relaxed text-foreground/85 sm:text-base">
          <p>{aboutCover.arc}</p>
          <p className="border-l border-[color:var(--primary)]/65 pl-4 text-foreground/80">
            {aboutCover.philosophy}
          </p>
          <p className="font-mono text-[12.5px] text-foreground/60">
            Seoul · D-10 · TOPIK 4 · IELTS 7
          </p>
        </div>
      </div>

      {/* Right column — Credentials right-rail. Education, languages,
          certificates. The old ExperienceTimeline section's tail-end content
          relocated here so it earns its keep without dominating its own
          section. */}
      <aside className="lg:col-span-5">
        <CredentialsRail />
      </aside>
    </motion.div>
  )
}

// ─── Credentials right-rail ──────────────────────────────────────────────────
// Education + Languages + Certificates — used to be the bottom of the dropped
// ExperienceTimeline section. Compact, mono, hairline rows. No card frames.

function CredentialsRail() {
  return (
    <div className="space-y-10">
      <CredentialsBlock label="Education">
        <EducationStrip ed={education} />
      </CredentialsBlock>

      <CredentialsBlock label="Languages">
        <ul className="space-y-px">
          {languages.map((lang, i) => (
            <LanguageRow key={lang.name} lang={lang} isLast={i === languages.length - 1} />
          ))}
        </ul>
      </CredentialsBlock>

      <CredentialsBlock label="Certificates & awards">
        <ul className="space-y-px">
          {certificates.map((c, i) => (
            <CertificateRow
              key={`${c.name}-${c.date}`}
              cert={c}
              isLast={i === certificates.length - 1}
            />
          ))}
        </ul>
      </CredentialsBlock>
    </div>
  )
}

function CredentialsBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          {label}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function EducationStrip({ ed }: { ed: Education }) {
  return (
    <article className="space-y-1.5">
      <h3 className="text-base font-medium tracking-[-0.01em] text-foreground sm:text-[17px]">
        {ed.school}
      </h3>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11.5px]">
        <span className="text-foreground/80">{ed.degree}</span>
        <span aria-hidden="true" className="mx-2 text-border">·</span>
        <span className="num">GPA {ed.gpa}</span>
        <span aria-hidden="true" className="mx-2 text-border">·</span>
        <span>{ed.period}</span>
      </p>
    </article>
  )
}

function LanguageRow({ lang, isLast }: { lang: Language; isLast: boolean }) {
  return (
    <li
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        !isLast && 'border-b border-border/30',
      )}
    >
      <span className="font-mono text-[12px] tracking-tight text-foreground/85">
        {lang.name}
      </span>
      <span className="flex items-baseline gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>{lang.level}</span>
        {lang.cert ? (
          <>
            <span aria-hidden="true" className="text-border">·</span>
            <span className="text-foreground/65">{lang.cert}</span>
          </>
        ) : null}
      </span>
    </li>
  )
}

function CertificateRow({
  cert,
  isLast,
}: {
  cert: Certificate
  isLast: boolean
}) {
  return (
    <li
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        !isLast && 'border-b border-border/30',
      )}
    >
      <div className="min-w-0 flex-1">
        <span className="font-mono text-[12px] tracking-tight text-foreground/85">
          {cert.name}
        </span>
        {cert.issuer ? (
          <span className="ml-2 font-mono text-[10.5px] tracking-tight text-muted-foreground/75">
            {cert.issuer}
          </span>
        ) : null}
      </div>
      <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        {cert.date}
      </span>
    </li>
  )
}

// ─── Stack block ─────────────────────────────────────────────────────────────
// 6 categories rendered in a 2-column grid at md+, single column on mobile.
// Each category: small mono label, hairline, chip cluster. No card frames, no
// shadows — hairlines and inherent layout do the structuring. Chip pattern
// matches NowBlock + ProjectsGrid + Trajectory exactly: border-only mono.

function StackBlock({
  variantsList,
  variantsItem,
  reduceMotion,
}: {
  variantsList: Variants | undefined
  variantsItem: Variants | undefined
  reduceMotion: boolean
}) {
  return (
    <motion.div
      variants={variantsList}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-15%' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
        Stack
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-12">
        {skills.map((cat) => (
          <StackCategory key={cat.category} cat={cat} variants={variantsItem} />
        ))}
      </ul>
    </motion.div>
  )
}

function StackCategory({
  cat,
  variants,
}: {
  cat: SkillCategory
  variants: Variants | undefined
}) {
  return (
    <motion.li variants={variants} className="group relative">
      {/* Category label row — mono caps, hairline extending right. */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/70">
          {cat.category}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        <span className="font-mono text-[10px] tracking-[0.05em] text-muted-foreground/55">
          {cat.items.length.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Chips — same border-only mono pattern used everywhere else. */}
      <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
        {cat.items.map((item) => (
          <li key={item}>
            <span className="inline-flex items-center border border-border/70 px-2.5 py-1 font-mono text-[11px] tracking-tight text-foreground/75">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </motion.li>
  )
}

// ─── /uses block ────────────────────────────────────────────────────────────
// Daily-driver tooling — distinct from Stack (professional capability) via:
//   1. Manifest divider eyebrow ("/uses · daily drivers") instead of a sidebar
//      "Stack" label, signaling personal-not-professional framing.
//   2. Inline category label (left column, mono caps) per row rather than a
//      stacked block, so the rhythm differs from Stack's 2-column grid.
//   3. Slightly smaller chips, slightly more muted, so they read as
//      "annotation" not "manifest of capability".
// Same chip grammar (border-only, mono, sharp corners) keeps it visually in
// the same family — these are siblings, not strangers.
// Zero new cyan elements.

function UsesBlock({
  variantsList,
  variantsItem,
  reduceMotion,
}: {
  variantsList: Variants | undefined
  variantsItem: Variants | undefined
  reduceMotion: boolean
}) {
  return (
    <motion.div
      variants={variantsList}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-10%' }}
      className="mt-16 md:mt-20"
    >
      {/* Manifest divider — same idiom as "Also shipped" / "Reach out" / "/now". */}
      <motion.div
        variants={variantsItem}
        className="flex items-center gap-3"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          /uses
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55">
          daily drivers
        </span>
      </motion.div>

      {/* Categories — single-column rows. Each row: mono caps category label
          (fixed-width column on sm+) + chip cluster. Hairline between rows. */}
      <ul className="mt-6 divide-y divide-border/30">
        {uses.map((cat) => (
          <UsesCategory key={cat.category} cat={cat} variants={variantsItem} />
        ))}
      </ul>
    </motion.div>
  )
}

function UsesCategory({
  cat,
  variants,
}: {
  cat: Uses
  variants: Variants | undefined
}) {
  return (
    <motion.li
      variants={variants}
      className="grid grid-cols-1 gap-y-3 py-5 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-x-6 sm:gap-y-0 md:grid-cols-[12rem_1fr]"
    >
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground/65">
        {cat.category}
      </span>
      <ul className="flex flex-wrap gap-x-1.5 gap-y-1.5">
        {cat.items.map((item) => (
          <li key={item}>
            <span className="inline-flex items-center border border-border/55 px-2 py-[3px] font-mono text-[10.5px] tracking-tight text-foreground/65">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </motion.li>
  )
}

// ─── Closing contact ────────────────────────────────────────────────────────
// Differentiated from the hero ContactRow by: (1) larger type, (2) each link
// on its own row at md+, (3) a framing sentence that names the ask, (4) a
// "Reach out" manifest divider above it. No buttons, no pills — same arrow +
// underline grammar used across the site, scaled up.

type ContactLink = {
  key: string
  label: string
  display: string
  href: string
  arrow: '→' | '↗' | '↓'
  external?: boolean
  download?: boolean
}

function buildContactLinks(): ContactLink[] {
  return [
    {
      key: 'email',
      label: 'Email',
      display: profile.contact.email,
      href: `mailto:${profile.contact.email}`,
      arrow: '→',
    },
    {
      key: 'github',
      label: 'GitHub',
      display: `github.com/${profile.contact.github}`,
      href: profile.contact.githubUrl,
      arrow: '↗',
      external: true,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      display: `linkedin.com/in/${profile.contact.linkedin}`,
      href: profile.contact.linkedinUrl,
      arrow: '↗',
      external: true,
    },
    {
      key: 'resume',
      label: 'Resume',
      display: 'resume.pdf',
      href: profile.resumeUrl,
      arrow: '↓',
      download: true,
    },
  ]
}

function ClosingContact({
  variants,
  variantsList,
  reduceMotion,
}: {
  variants: Variants | undefined
  variantsList: Variants | undefined
  reduceMotion: boolean
}) {
  const links = buildContactLinks()

  return (
    <>
      {/* Manifest divider — same idiom as ProjectsGrid "Also shipped" + Trajectory "Education". */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
        className="mt-24 flex items-center gap-3 md:mt-32"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Reach out
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border/40" />
      </motion.div>

      {/* Framing sentence — short, factual. Carries the "open to" signal once,
          where it's already implied by the section eyebrow. */}
      <motion.p
        variants={variants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-8 max-w-[42rem] text-balance text-2xl font-medium tracking-[-0.02em] text-foreground/90 sm:text-3xl md:text-[34px] md:leading-[1.2]"
      >
        Looking for a robotics simulation, autonomous systems, or senior backend
        seat. Quickest reply by email.
      </motion.p>

      {/* Link list — each link its own row, large mono. Stack cleanly. */}
      <motion.ul
        variants={variantsList}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-10 divide-y divide-border/40 border-y border-border/40"
      >
        {links.map((l) => (
          <ClosingContactRow key={l.key} link={l} variants={variants} />
        ))}
      </motion.ul>
    </>
  )
}

function ClosingContactRow({
  link,
  variants,
}: {
  link: ContactLink
  variants: Variants | undefined
}) {
  const isDownload = link.arrow === '↓'
  return (
    <motion.li variants={variants}>
      <a
        href={link.href}
        target={link.external ? '_blank' : undefined}
        rel={
          link.external
            ? 'noopener noreferrer'
            : link.download
              ? 'noopener'
              : undefined
        }
        download={link.download ? '' : undefined}
        className={cn(
          'group grid grid-cols-[5.5rem_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[7rem_1fr_auto] sm:gap-x-6 md:py-6',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background',
        )}
      >
        {/* Channel label — mono caps, fixed-width column reads like a manifest. */}
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/75">
          {link.label}
        </span>

        {/* Address — large mono, grows on the row, transitions on hover. */}
        <span className="truncate font-mono text-base tracking-tight text-foreground/85 transition-colors duration-200 group-hover:text-foreground sm:text-lg md:text-xl">
          {link.display}
        </span>

        {/* Arrow — sits in its own column so the row is a clean three-column
            manifest entry. Slides on hover, no color flip (cyan budget).
            Download arrow nudges down (save direction); navigation arrows
            nudge right (forward direction). */}
        <span
          aria-hidden="true"
          className={cn(
            'inline-block w-4 text-right font-mono text-base text-muted-foreground/60 transition-[color,transform] duration-200 group-hover:text-foreground/90 sm:text-lg',
            isDownload ? 'group-hover:translate-y-0.5' : 'group-hover:translate-x-0.5',
          )}
        >
          {link.arrow}
        </span>
      </a>
    </motion.li>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
// Subtle. Smaller mono than the rest. Hairline above carries the separation
// from the contact links. Three groups: identity, location, build metadata.

function Footer({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.footer
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
      className="mt-16 flex flex-col gap-y-3 border-t border-border/30 pt-6 font-mono text-[11px] tracking-tight text-muted-foreground/70 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6"
    >
      {/* Identity — copyright. */}
      <span>
        &copy; {COPY_YEAR} {profile.name}
      </span>

      {/* Location echo — mirrors the hero's "SEONGNAM · KR". */}
      <span className="hidden sm:inline">
        <span className="text-muted-foreground/50">Seoul</span>
        <span aria-hidden="true" className="mx-2 text-border">·</span>
        <span className="text-muted-foreground/50">KR</span>
      </span>

      {/* Build metadata — version + source link. */}
      <span className="flex items-center gap-x-2">
        <span className="text-muted-foreground/50">{BUILD_VERSION}</span>
        <span aria-hidden="true" className="text-border">·</span>
        <a
          href={profile.contact.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-muted-foreground/70 transition-colors hover:text-foreground/85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <span>Source on GitHub</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </a>
      </span>
    </motion.footer>
  )
}

// ─── Live dot ────────────────────────────────────────────────────────────────
// Same as Hero / NowBlock / Trajectory. Reused locally to avoid cross-component
// coupling. Reduced motion → static dot, no pulse.

function LiveDot({ reduceMotion }: { reduceMotion: boolean }) {
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
