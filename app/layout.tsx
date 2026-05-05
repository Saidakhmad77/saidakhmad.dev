import type { Metadata, Viewport } from "next"
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.title}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.brief,
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
    description: profile.brief,
    siteName: "saidakhmad.dev",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.title}`,
    description: profile.brief,
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
  themeColor: "#0a0b0d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
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
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
