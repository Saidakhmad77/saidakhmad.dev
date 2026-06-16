import { Nav } from '@/components/portfolio/Nav'
import { Hero } from '@/components/portfolio/Hero'
import { NowBlock } from '@/components/portfolio/NowBlock'
import { ParkPilotShowcase } from '@/components/portfolio/ParkPilotShowcase'
import { ProjectsGrid } from '@/components/portfolio/ProjectsGrid'
import { SkillsStrip } from '@/components/portfolio/SkillsStrip'
import { NavSimSection } from '@/components/portfolio/NavSimSection'
import { ClosingSection } from '@/components/portfolio/ClosingSection'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <NowBlock />
        <ParkPilotShowcase />
        <ProjectsGrid />
        <SkillsStrip />
        <NavSimSection />
        <ClosingSection />
      </main>
    </>
  )
}
