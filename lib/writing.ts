import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/writing");

export type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  slug: string;
  tags?: string[];
};

export type PostMeta = PostFrontmatter & {
  /** Derived from filename if not in frontmatter */
  slug: string;
};

function parsePost(filename: string): PostMeta {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const slugFromFile = filename.replace(/\.mdx?$/, "");
  return {
    title: data.title ?? slugFromFile,
    date: data.date ?? "",
    summary: data.summary ?? "",
    slug: data.slug ?? slugFromFile,
    tags: data.tags ?? [],
  };
}

/** Returns all posts sorted by date descending. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => /\.mdx?$/.test(f));
  const posts = files.map(parsePost);
  return posts.sort((a, b) =>
    a.date > b.date ? -1 : a.date < b.date ? 1 : 0,
  );
}

/** Returns frontmatter for a single post by slug (undefined if not found). */
export function getPost(slug: string): PostMeta | undefined {
  if (!fs.existsSync(CONTENT_DIR)) return undefined;
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => /\.mdx?$/.test(f));
  for (const file of files) {
    const meta = parsePost(file);
    if (meta.slug === slug) return meta;
  }
  return undefined;
}
