// Single source of truth for the deployed origin. saidakhmad.dev is the
// intended custom domain but currently has no DNS records — pointing this at
// the vercel.app URL keeps canonical/OG/sitemap URLs actually resolvable.
// Swap back once the custom domain's DNS is pointed at Vercel.
export const SITE_URL = 'https://saidakhmad-dev.vercel.app'
