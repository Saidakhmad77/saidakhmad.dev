import { Nav } from '@/components/portfolio/Nav'
import { Hero } from '@/components/portfolio/Hero'
import { NowBlock } from '@/components/portfolio/NowBlock'
import { ProjectsGrid } from '@/components/portfolio/ProjectsGrid'
import { HowIThink } from '@/components/portfolio/HowIThink'
import { Lab } from '@/components/portfolio/Lab'
import { ClosingSection } from '@/components/portfolio/ClosingSection'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <NowBlock />
        <ProjectsGrid />
        <HowIThink />
        <Lab />
        <ClosingSection />
      </main>
    </>
  )
}
