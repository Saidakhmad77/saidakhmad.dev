import { Nav } from '@/components/portfolio/Nav'
import { Hero } from '@/components/portfolio/Hero'
import { NowBlock } from '@/components/portfolio/NowBlock'
import { ProjectsGrid } from '@/components/portfolio/ProjectsGrid'
import { ExperienceTimeline } from '@/components/portfolio/ExperienceTimeline'
import { WritingSection } from '@/components/portfolio/WritingSection'
import { ClosingSection } from '@/components/portfolio/ClosingSection'

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative">
        <Hero />
        <NowBlock />
        <ProjectsGrid />
        <ExperienceTimeline />
        <WritingSection />
        <ClosingSection />
      </main>
    </>
  )
}
