import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/writing";
import { WritingNav } from "@/components/portfolio/WritingNav";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
  };
}

export const dynamicParams = false;

export default async function WritingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Dynamic import of the MDX file. @next/mdx compiles it at build time.
  // The import path must be a string literal (no template-literal vars at top
  // level) so we enumerate known slugs via the content directory helpers.
  let PostContent: React.ComponentType;
  try {
    const mod = (await import(
      `@/content/writing/${slug}.mdx`
    )) as { default: React.ComponentType };
    PostContent = mod.default;
  } catch {
    notFound();
  }

  return (
    <>
      <WritingNav />
      <main className="relative w-full">
        {/* Outer wrapper matches the homepage section idiom; the reading column
            inside is held narrower for comfortable long-form measure. */}
        <div className="relative mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-28 pb-28 md:px-10 md:pt-36 md:pb-36">
          <article className="mx-auto w-full max-w-[44rem]">
            {/* Back link — understated mono, → reversed to ←, cyan glyph on hover. */}
            <Link
              href="/writing"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <span
                aria-hidden="true"
                className="transition-[color,transform] duration-200 group-hover:-translate-x-0.5 group-hover:text-[color:var(--primary)]"
              >
                ←
              </span>
              <span>Writing</span>
            </Link>

            {/* Post header — coordinate row (date · tags), then the title. The
                title is mono to match the project-name hand; the summary reads
                as a standfirst in body sans. */}
            <header className="mt-10 border-b border-border/40 pb-10">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
                {post.date ? (
                  <time dateTime={post.date} className="num text-muted-foreground/85">
                    {post.date}
                  </time>
                ) : null}
                {post.tags && post.tags.length > 0 ? (
                  <>
                    <span aria-hidden="true" className="h-2.5 w-px bg-border" />
                    <ul className="flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <li key={t}>
                          <span className="inline-flex items-center border border-border/60 px-1.5 py-[1.5px] text-[9.5px] tracking-[0.18em] text-foreground/65">
                            {t}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <h1 className="mt-5 text-balance font-mono text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[32px] md:text-[36px]">
                {post.title}
              </h1>

              {post.summary ? (
                <p className="mt-5 text-pretty text-[15.5px] leading-relaxed text-muted-foreground sm:text-base">
                  {post.summary}
                </p>
              ) : null}
            </header>

            {/* MDX body — typography supplied by mdx-components.tsx
                (useMDXComponents). No prose plugin classes needed. */}
            <div className="mt-2">
              <PostContent />
            </div>

            {/* Footer — symmetrical back paths, mono and quiet. */}
            <footer className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/40 pt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">
              <Link
                href="/writing"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                ← All writing
              </Link>
              <Link
                href="/"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                ← Home
              </Link>
            </footer>
          </article>
        </div>
      </main>
    </>
  );
}
