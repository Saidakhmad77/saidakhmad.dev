import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/writing'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/writing`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts.map(p => ({
      url: `${SITE_URL}/writing/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : undefined,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
