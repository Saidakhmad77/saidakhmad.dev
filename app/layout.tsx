import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { profile } from "@/lib/portfolio-data"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const SITE_URL = "https://saidakhmad.dev"

const META_DESCRIPTION =
  "Autonomous-driving simulation engineer building production extensions on NVIDIA Isaac Sim at Maum.ai — USD, PhysX, OmniGraph, ROS 2. Full-stack background, F1 watcher. Based in Seoul."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.title}`,
    template: `%s · ${profile.name}`,
  },
  description: META_DESCRIPTION,
  keywords: [
    "Saidakhmad Nuriddinov",
    "Autonomous Driving Simulation",
    "NVIDIA Isaac Sim",
    "Omniverse",
    "USD",
    "PhysX",
    "ROS 2",
    "Robotics Engineer",
    "Maum.ai",
    "WoRV",
    "Korea",
    "Full-Stack Developer",
  ],
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${profile.name} · ${profile.title}`,
    description: META_DESCRIPTION,
    siteName: "saidakhmad.dev",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.title}`,
    description: META_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
}

// Tiny synchronous script — runs before React hydrates so the html.theme-light
// class is applied before paint. Prevents a "dark flash" for users whose last
// choice was light mode.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('theme-light');}catch(e){}})();`

// Force a clean top-of-page scroll on F5/refresh — disables the browser's
// default scrollRestoration so the user always lands at the hero on reload.
// Also handles the Safari BFCache restore via pageshow.
const SCROLL_TOP_SCRIPT = `(function(){try{if('scrollRestoration' in history){history.scrollRestoration='manual';}window.addEventListener('pageshow',function(e){if(e.persisted)window.scrollTo(0,0);});}catch(e){}})();`

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  givenName: profile.nickname,
  additionalName: profile.nickname,
  jobTitle: profile.title,
  url: SITE_URL,
  email: `mailto:${profile.contact.email}`,
  telephone: profile.contact.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Seoul",
    addressCountry: "KR",
  },
  worksFor: {
    "@type": "Organization",
    name: "Maum.ai",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Gachon University",
  },
  sameAs: [profile.contact.githubUrl, profile.contact.linkedinUrl],
  knowsAbout: [
    "NVIDIA Isaac Sim",
    "Omniverse",
    "USD",
    "PhysX",
    "OmniGraph",
    "ROS 2",
    "Autonomous Driving Simulation",
    "Backend Development",
    "TypeScript",
    "Python",
    "C++",
  ],
  knowsLanguage: ["en", "ko", "uz"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Synchronous theme init — applies html.theme-light before paint so
            users who chose light mode don't see a flash of dark. Has to be
            inline + before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCROLL_TOP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  )
}
