import { profile } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

type ContactLink = {
  label: string
  href: string
  arrow: '→' | '↗' | '↓'
  external?: boolean
  download?: boolean
}

const links: ContactLink[] = [
  {
    label: profile.contact.email,
    href: `mailto:${profile.contact.email}`,
    arrow: '→',
  },
  {
    label: `github/${profile.contact.github}`,
    href: profile.contact.githubUrl,
    arrow: '↗',
    external: true,
  },
  {
    label: `linkedin/${profile.contact.linkedin}`,
    href: profile.contact.linkedinUrl,
    arrow: '↗',
    external: true,
  },
  {
    label: 'Resume.pdf',
    href: profile.resumeUrl,
    arrow: '↓',
    download: true,
  },
]

export function ContactRow({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        'flex flex-col gap-y-2 gap-x-5 font-mono text-xs sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {links.map((l, i) => (
        <li key={l.href} className="flex items-center gap-x-5">
          <a
            href={l.href}
            target={l.external ? '_blank' : undefined}
            rel={
              l.external
                ? 'noopener noreferrer'
                : l.download
                  ? 'noopener'
                  : undefined
            }
            download={l.download ? '' : undefined}
            className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block w-3 text-muted-foreground/60 transition-[color,transform] duration-200',
                // Download arrow nudges down on hover; navigation arrows nudge right.
                l.arrow === '↓'
                  ? 'group-hover:text-foreground/85 group-hover:translate-y-0.5'
                  : 'group-hover:text-primary group-hover:translate-x-0.5',
              )}
            >
              {l.arrow}
            </span>
            <span className="tracking-tight">{l.label}</span>
          </a>
          {i < links.length - 1 ? (
            <span aria-hidden="true" className="hidden text-border sm:inline">
              ·
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
