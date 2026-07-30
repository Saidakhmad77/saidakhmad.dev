import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/writing')

export type PostFrontmatter = {
  title: string
  date: string
  summary: string
  slug: string
  tags?: string[]
}

export type PostMeta = PostFrontmatter & {
  /** Derived from filename if not in frontmatter */
  slug: string
}

function parsePost(filename: string): PostMeta {
  const filePath = path.join(CONTENT_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const slugFromFile = filename.replace(/\.mdx?$/, '')
  return {
    title: data.title ?? slugFromFile,
    date: data.date ?? '',
    summary: data.summary ?? '',
    slug: data.slug ?? slugFromFile,
    tags: data.tags ?? [],
  }
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  const files = fs.readdirSync(CONTENT_DIR).filter(f => /\.mdx?$/.test(f))
  const posts = files.map(parsePost)
  return posts.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
}

export function getPost(slug: string): PostMeta | undefined {
  return getAllPosts().find(p => p.slug === slug)
}
