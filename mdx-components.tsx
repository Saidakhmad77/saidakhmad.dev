import type { MDXComponents } from "mdx/types";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Global MDX component overrides — the prose system.
//
// Styled to the same hand as the rest of the site (ProjectsGrid /
// ParkPilotShowcase): sharp corners, hairline borders (border-border/40..60),
// mono-caps "coordinate" labels, cyan --primary reserved as the single at-rest
// accent (used on link hover only), amber --accent-warm reserved for the
// constraint / quote motif, bg-foreground/[0.02] elevated surfaces.
//
// No syntax-highlighter plugin: plain monospace inside a hairline-framed
// surface is on-brand (the site already renders code-shaped things this way),
// and it keeps next.config.ts plugin-free — no Turbopack string-plugin risk.
//
// The reading measure is held at ~68ch on the body elements so long-form text
// stays comfortable even though the article wrapper is wider for figures/tables.
// ─────────────────────────────────────────────────────────────────────────────

const MEASURE = "max-w-[68ch]";

const components: MDXComponents = {
  // ── Headings ────────────────────────────────────────────────────────────
  // The post's own title is rendered by the page header (frontmatter), so an
  // h1 inside the body is rare — style it defensively but quietly.
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-14 mb-5 font-mono text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-[28px]"
      {...props}
    />
  ),

  // h2 — the workhorse section break. Mono-caps eyebrow + the section title on
  // its own line, preceded by a short hairline tick. Generous top rhythm so
  // sections breathe; a near-flush bottom so the heading binds to its body.
  h2: ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="group/h scroll-mt-24 mt-16 mb-5 flex items-center gap-3 font-mono text-[17px] font-medium leading-tight tracking-[-0.005em] text-foreground/95 sm:text-lg"
      {...props}
    >
      <span
        aria-hidden="true"
        className="h-3 w-px shrink-0 bg-[color:var(--primary)]/60"
      />
      <span>{children}</span>
    </h2>
  ),

  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="scroll-mt-24 mt-10 mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
      {...props}
    />
  ),

  // ── Body text ───────────────────────────────────────────────────────────
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={`${MEASURE} my-5 text-pretty text-[15.5px] leading-[1.75] text-foreground/85 sm:text-base`}
      {...props}
    />
  ),

  // ── Links — understated, cyan on hover, focus-visible ring (ContactRow). ──
  a: ({ href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-medium text-foreground/90 underline decoration-border decoration-1 underline-offset-[3px] transition-colors hover:text-[color:var(--primary)] hover:decoration-[color:var(--primary)]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        {...props}
      />
    );
  },

  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),

  em: (props: HTMLAttributes<HTMLElement>) => (
    <em className="italic text-foreground/90" {...props} />
  ),

  // ── Lists ─────────────────────────────────────────────────────────────────
  // Mono caps markers feel too loud; instead a thin cyan tick for ul and
  // tabular mono counters for ol, both hung in the gutter.
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={`${MEASURE} my-5 flex flex-col gap-2.5 text-[15.5px] leading-[1.7] text-foreground/85 sm:text-base`}
      {...props}
    />
  ),

  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={`${MEASURE} my-5 flex list-none flex-col gap-2.5 text-[15.5px] leading-[1.7] text-foreground/85 sm:text-base [counter-reset:item]`}
      {...props}
    />
  ),

  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li
      className="relative pl-5 marker:text-transparent before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-[color:var(--primary)]/55 before:content-['']"
      {...props}
    />
  ),

  // ── Inline code + fenced blocks ─────────────────────────────────────────
  code: ({ className, children, ...props }: HTMLAttributes<HTMLElement>) => {
    // Block code arrives here wrapped in <pre>. @next/mdx tags fenced blocks
    // that declare a language with a `language-` class — but a fence with NO
    // language (e.g. the equations block) has no class, so we'd wrongly treat
    // it as inline. Detect block code by either the language class OR multi-line
    // content; let <pre> own the block frame and keep <code> transparent there.
    const text = typeof children === "string" ? children : "";
    const isBlock =
      (typeof className === "string" && className.includes("language-")) ||
      text.includes("\n");
    if (isBlock) {
      return (
        <code
          className={`${className ?? ""} font-mono text-[13px] leading-[1.7] text-foreground/90`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="border border-border/50 bg-foreground/[0.03] px-[0.4em] py-[0.15em] font-mono text-[0.85em] text-foreground/90"
        {...props}
      >
        {children}
      </code>
    );
  },

  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-7 overflow-x-auto border border-border/55 bg-foreground/[0.02] p-4 font-mono text-[13px] leading-[1.7] text-foreground/90 sm:p-5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      {...props}
    />
  ),

  // ── Blockquote — amber left hairline, the site's constraint motif. ───────
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={`${MEASURE} my-7 border-l border-[color:var(--accent-warm)]/70 pl-5 text-[15.5px] italic leading-[1.7] text-muted-foreground [&_p]:my-2 [&_p]:max-w-none [&_p]:not-italic [&_p]:text-foreground/80`}
      {...props}
    />
  ),

  // ── Horizontal rule — a hairline section divider, not a heavy line. ──────
  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-12 h-px border-0 bg-border/50"
      {...props}
    />
  ),

  // ── Tables — coordinate-style: mono caps header, hairline row rules, no
  //    zebra, no card. Wrapped so wide tables scroll on mobile. ────────────
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className={`${MEASURE} my-7 overflow-x-auto`}>
      <table className="w-full border-collapse text-left text-[14px]" {...props} />
    </div>
  ),

  thead: (props: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border/60" {...props} />
  ),

  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground first:pl-0"
      {...props}
    />
  ),

  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="border-b border-border/30 px-3 py-2.5 align-top text-foreground/80 first:pl-0 [&_code]:text-[0.85em]"
      {...props}
    />
  ),

  // ── Images — sharp corners, single hairline, centered in the elevated
  //    frame; alt rendered as a mono "fig ·" caption (ParkPilotShowcase). The
  //    demo GIF stays a plain animating <img> (no next/image). ──────────────
  img: ({ alt = "", src, ...props }: ImgHTMLAttributes<HTMLImageElement>) => {
    // The demo GIF is portrait — cap it like ParkPilotShowcase (~20rem) so the
    // clip keeps page rhythm instead of dominating the column. Landscape
    // figures (e.g. the training curves) fill the measure. The GIF stays a
    // plain animating <img> (no next/image, which would freeze it).
    const portrait = typeof src === "string" && /\.gif($|\?)/i.test(src);
    return (
      <figure className="my-9 flex flex-col items-center">
        <span
          className={`block border border-border/55 bg-foreground/[0.02] ${
            portrait ? "w-fit max-w-full p-2" : "w-full p-2 sm:p-3"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={
              portrait
                ? "mx-auto block h-auto max-h-[26rem] w-full max-w-[18rem] object-contain"
                : "mx-auto block h-auto w-full max-w-full object-contain"
            }
            {...props}
          />
        </span>
        {alt ? (
          <figcaption className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/55">
            fig · {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
