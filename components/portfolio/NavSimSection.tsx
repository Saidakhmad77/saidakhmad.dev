'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { RoboGame } from '@/components/portfolio/RoboGame'
import { SectionHeader } from '@/components/ui/section-header'
import { sectionItemVariants } from '@/lib/motion'

const LEGEND_ITEMS = [
  ['MANUAL', 'WASD / arrows - drive with LIDAR FOV'],
  ['AUTO',   'click open cell - A* waypoint route'],
  ['RANDOM', 'AUTO only - random reachable waypoint'],
  ['◆',      'collect target - +1 score, respawn'],
] as const

export function NavSimSection() {
  const reduceMotion = useReducedMotion()
  const variantsItem = reduceMotion ? undefined : sectionItemVariants

  return (
    <section
      id="nav-sim"
      aria-labelledby="nav-sim-heading"
      className="relative w-full scroll-mt-16"
    >
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-6 pt-24 pb-16 md:px-10 md:pt-28 md:pb-20">
        <SectionHeader
          headingId="nav-sim-heading"
          index="sim"
          title="Autonomous Navigation Playground"
          reduceMotion={!!reduceMotion}
        />

        <motion.div
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
          className="mt-8 max-w-[52rem]"
        >
          <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              The yard is a 22×16 grid with amber crate obstacles and four live amber diamond targets. Drive over a target in either mode to score; a replacement spawns immediately. In MANUAL mode, you drive the robot with WASD or the arrow keys while a rotating 120° LIDAR cone shows its field of view.
            </p>
            <p>
              In AUTO mode, click any open cell to set a waypoint; A* computes the path and the robot follows the dashed route. The RANDOM button picks a reachable open cell in AUTO, and the sidebar reports position, heading, speed, remaining path nodes, and score.
            </p>
          </div>

          <ul className="mt-6 space-y-2 border-l border-border/60 pl-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
            {LEGEND_ITEMS.map(([label, description]) => (
              <li key={label}>
                <span className="text-foreground/70">[ {label} ]</span>{' '}
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={variantsItem}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-10%' }}
        >
          <RoboGame className="mt-8" />
        </motion.div>
      </div>
    </section>
  )
}
