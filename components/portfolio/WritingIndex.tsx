'use client'

import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { PostMeta } from '@/lib/writing'
import { SectionHeader } from '@/components/ui/section-header'
import { sectionItemVariants, sectionListVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

// ─── WritingIndex ─────────────────────────────────────────────────────────────
// The /writing list. Same hand as ProjectsGrid / Lab: a SectionHeader eyebrow,
// then hairline-separated rows — a mono "coordinate" row (index · date · tags),
// a substantial mono title, a body-sans summary. No cards, sharp corners. The
// row hovers as a unit; the title shifts toward cyan and a → arrow nudges in to
// signal navigation, echoing the ContactRow/repo-link affordance.

export function WritingIndex({ posts }: { posts: PostMeta[] }) {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : sectionItemVariants
  const variantsList = reduceMotion ? undefined : sectionListVariants

  return (
    <section aria-labelledby="writing-heading">
      <SectionHeader
        headingId="writing-heading"
        index="01"
        title="Writing"
        reduceMotion={!!reduceMotion}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75 sm:text-xs">
          field notes · engineering log
        </div>
      </SectionHeader>

      {posts.length === 0 ? (
        <p className="mt-12 font-mono text-[13px] text-muted-foreground">
          No posts yet.
        </p>
      ) : (
        <motion.ol
          variants={variantsList}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-12 border-y border-border/40 md:mt-16"
        >
          {posts.map((post, i) => (
            <PostRow
              key={post.slug}
              post={post}
              index={i + 1}
              variants={variantsItem}
              isLast={i === posts.length - 1}
            />
          ))}
        </motion.ol>
      )}
    </section>
  )
}

function PostRow({
  post,
  index,
  variants,
  isLast,
}: {
  post: PostMeta
  index: number
  variants: Variants | undefined
  isLast: boolean
}) {
  const idx = index.toString().padStart(2, '0')

  return (
    <motion.li
      variants={variants}
      className={cn('group relative', !isLast && 'border-b border-border/40')}
    >
      <Link
        href={`/writing/${post.slug}`}
        className="block py-8 outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background lg:grid lg:grid-cols-12 lg:gap-x-10 lg:py-10"
      >
        {/* Coordinate row — index · date · tags. */}
        <div className="lg:col-span-3 lg:pt-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
            <span className="num text-muted-foreground/55">{idx}</span>
            {post.date ? (
              <>
                <span aria-hidden="true" className="h-2.5 w-px bg-border" />
                <time dateTime={post.date} className="num text-muted-foreground/85">
                  {post.date}
                </time>
              </>
            ) : null}
          </div>

          {/* Tags — border-only mono chips, sharp corners (ProjectsGrid stack). */}
          {post.tags && post.tags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <li key={t}>
                  <span className="inline-flex items-center border border-border/60 px-1.5 py-[1.5px] font-mono text-[9.5px] uppercase tracking-[0.18em] text-foreground/65">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Title + summary. */}
        <div className="mt-4 lg:col-span-9 lg:mt-0">
          <h2 className="flex items-start gap-2 text-balance font-mono text-xl font-medium leading-snug tracking-[-0.015em] text-foreground/95 transition-colors group-hover:text-foreground sm:text-[22px] md:text-2xl">
            <span>{post.title}</span>
            <span
              aria-hidden="true"
              className="mt-1.5 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[color:var(--primary)] group-focus-visible:text-[color:var(--primary)]"
            >
              →
            </span>
          </h2>
          {post.summary ? (
            <p className="mt-3 max-w-[52ch] text-pretty text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15px]">
              {post.summary}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.li>
  )
}
