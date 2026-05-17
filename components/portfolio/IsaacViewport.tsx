'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── IsaacViewport ───────────────────────────────────────────────────────────
// A small "Isaac Sim viewport" mockup: faint stage-floor grid, REC indicator,
// stage path label, a side-view 3-segment robot arm running a 4-phase
// pick-and-place cycle on loop. Phase + joint readouts mono-caps below.
//
// Why this exists: the Lab section's previous /know-more deck talked about
// the work in text. This component shows the work — an articulated rig in
// motion, the kind of thing the WoRV team builds against every day. Different
// from the hero Spline (decorative 3D) and from the JoystickNudge in HowIThink
// (interactive, top-down, wheeled). Side-view manipulator + autoplay loop.
//
// All animation is via framer-motion keyframes on nested SVG <motion.g>
// groups — no JS rAF loop, no per-frame React re-renders. The phase indicator
// runs on a low-frequency setInterval that's loosely synced to the cycle.

const CYCLE_MS = 4_000 // 1 second per phase × 4 phases
const PHASES = ['HOME', 'REACH', 'GRASP', 'LIFT'] as const
type Phase = (typeof PHASES)[number]

// Joint angles (degrees) per phase. Three joints, side-view, kinematics are
// illustrative not physically accurate — what reads as "arm doing the thing"
// matters more than UR5 fidelity.
const POSES: Record<Phase, { j1: number; j2: number; j3: number }> = {
  HOME:  { j1: -55, j2: -100, j3:  10 },
  REACH: { j1:  20, j2:  -55, j3: -25 },
  GRASP: { j1:  30, j2:  -50, j3: -30 },
  LIFT:  { j1: -10, j2:  -80, j3: -15 },
}

// Keyframe arrays in the order framer-motion walks them. End equals start so
// the loop closes smoothly back to HOME.
const J1_FRAMES = [POSES.HOME.j1, POSES.REACH.j1, POSES.GRASP.j1, POSES.LIFT.j1, POSES.HOME.j1]
const J2_FRAMES = [POSES.HOME.j2, POSES.REACH.j2, POSES.GRASP.j2, POSES.LIFT.j2, POSES.HOME.j2]
const J3_FRAMES = [POSES.HOME.j3, POSES.REACH.j3, POSES.GRASP.j3, POSES.LIFT.j3, POSES.HOME.j3]
const TIMES = [0, 0.25, 0.5, 0.75, 1]
const CYCLE_SEC = CYCLE_MS / 1000

export function IsaacViewport() {
  const reduceMotion = useReducedMotion()
  const [phaseIdx, setPhaseIdx] = useState(0)
  const phase = PHASES[phaseIdx]
  const pose = POSES[phase]

  // Phase indicator clock. setInterval at 1 phase / second. Slight drift
  // against the framer-motion timeline is fine — the user can't perceive a
  // few hundred ms desync between text label and arm pose.
  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setPhaseIdx((p) => (p + 1) % PHASES.length)
    }, CYCLE_MS / PHASES.length)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <div className="relative border border-border/60 bg-foreground/[0.02]">
      {/* Viewport chrome — top strip. Stage path on the left, REC + status
          on the right, both in mono caps. Reads as the title bar of an
          Isaac Sim viewport without copying any logo. */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <span className="text-muted-foreground/50">STAGE</span>{' '}
          <span className="text-foreground/75">/World/arm_demo.usd</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <RecDot reduceMotion={!!reduceMotion} />
          <span>REC</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:inline-block" />
          <span className="hidden text-muted-foreground/60 sm:inline">{CYCLE_SEC.toFixed(1)}s loop</span>
        </span>
      </div>

      {/* The viewport itself. */}
      <div className="relative">
        <svg
          viewBox="0 0 480 260"
          role="img"
          aria-label="Side-view robot arm running a pick-and-place loop"
          className="block w-full"
        >
          {/* Floor grid — faint, intentionally sparse so it reads as a stage
              floor rather than graph paper. */}
          <FloorGrid />

          {/* Drop zone outline — dotted square left of base. */}
          <g opacity="0.45">
            <rect
              x="68"
              y="208"
              width="40"
              height="14"
              fill="none"
              stroke="oklch(var(--muted-foreground))"
              strokeWidth="0.6"
              strokeDasharray="2 3"
            />
            <text
              x="88"
              y="240"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              fill="oklch(var(--muted-foreground))"
              opacity="0.7"
            >
              DROP
            </text>
          </g>

          {/* Target cube — sits on floor at +200 from base. */}
          <g>
            <rect
              x="328"
              y="200"
              width="22"
              height="22"
              fill="var(--surface-elevated)"
              stroke="var(--accent-warm)"
              strokeWidth="1.1"
            />
            <text
              x="339"
              y="240"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              fill="var(--accent-warm)"
              opacity="0.85"
            >
              TARGET
            </text>
          </g>

          {/* Base block — fixed. */}
          <g>
            <rect
              x="208"
              y="190"
              width="44"
              height="32"
              fill="var(--surface-elevated)"
              stroke="oklch(var(--foreground)/0.7)"
              strokeWidth="1"
            />
            <line x1="216" y1="222" x2="244" y2="222" stroke="oklch(var(--foreground)/0.5)" strokeWidth="0.5" />
            <text x="230" y="186" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="oklch(var(--muted-foreground))" opacity="0.75">
              BASE
            </text>
          </g>

          {/* Arm chain — three nested motion.g groups rotating around their
              joint origins. Each segment is drawn at its own local origin in
              its parent's frame; the parent rotation cascades through.

              J1 origin: (230, 195)   — top of base
              J2 origin: (230, 130)   — end of upper arm segment 1 (length 65)
              J3 origin: (230, 75)    — end of upper arm segment 2 (length 55)

              The local segment shapes are translated up from the joint origin
              so a 0° rotation hangs them above. */}
          <motion.g
            style={{ originX: 230, originY: 195 }}
            animate={reduceMotion ? undefined : { rotate: J1_FRAMES }}
            initial={{ rotate: J1_FRAMES[0] }}
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: CYCLE_SEC,
                    times: TIMES,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          >
            {/* Upper segment (from J1 to J2). */}
            <Segment x={224} y={130} w={12} h={65} />

            <motion.g
              style={{ originX: 230, originY: 130 }}
              animate={reduceMotion ? undefined : { rotate: J2_FRAMES }}
              initial={{ rotate: J2_FRAMES[0] }}
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: CYCLE_SEC,
                      times: TIMES,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            >
              <Segment x={225} y={75} w={10} h={55} />

              <motion.g
                style={{ originX: 230, originY: 75 }}
                animate={reduceMotion ? undefined : { rotate: J3_FRAMES }}
                initial={{ rotate: J3_FRAMES[0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: CYCLE_SEC,
                        times: TIMES,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                {/* Wrist segment. */}
                <Segment x={226} y={45} w={8} h={30} />
                {/* End effector — two prongs forming a gripper. */}
                <g>
                  <rect x={222} y={37} width="16" height="8" fill="var(--surface-elevated)" stroke="oklch(var(--primary))" strokeWidth="1" />
                  <rect x={221} y={29} width="3" height="10" fill="oklch(var(--primary))" />
                  <rect x={236} y={29} width="3" height="10" fill="oklch(var(--primary))" />
                </g>
              </motion.g>
            </motion.g>
          </motion.g>

          {/* Joint dots — drawn after the arm chain so they sit on top. They
              don't rotate; they're at the fixed world positions of the joint
              centers. */}
          <circle cx="230" cy="195" r="3" fill="var(--surface-elevated)" stroke="var(--accent-warm)" strokeWidth="1" />
          <text x="240" y="199" fontFamily="var(--font-mono)" fontSize="7" fill="var(--accent-warm)" opacity="0.85">J1</text>
        </svg>

        {/* Cycle progress bar — bottom of viewport, thin cyan line that
            sweeps left → right over CYCLE_SEC. Reads as a timeline / playhead. */}
        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-border/40">
          <motion.div
            className="h-full bg-[color:var(--primary)]"
            animate={reduceMotion ? undefined : { scaleX: [0, 1] }}
            initial={{ scaleX: 0 }}
            style={{ transformOrigin: 'left center' }}
            transition={
              reduceMotion
                ? undefined
                : { duration: CYCLE_SEC, repeat: Infinity, ease: 'linear' }
            }
          />
        </div>
      </div>

      {/* Readout strip — phase indicator on the left, joint angles on the
          right. Updates per-phase, not per-frame, so the visual is calm. */}
      <div className="flex flex-col gap-y-3 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em]">
          <span className="text-muted-foreground/65">PHASE</span>
          <span aria-hidden="true" className="h-2.5 w-px bg-border" />
          <span className={cn('text-foreground/90', phase === 'GRASP' && 'text-[color:var(--primary)]')}>
            {phase}
          </span>
          <span aria-hidden="true" className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground/70">
            {(phaseIdx + 1).toString().padStart(2, '0')}/{PHASES.length.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          <JointReadout label="J1" value={pose.j1} />
          <JointReadout label="J2" value={pose.j2} />
          <JointReadout label="J3" value={pose.j3} />
        </div>
      </div>
    </div>
  )
}

// ─── Building blocks ────────────────────────────────────────────────────────

function Segment({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="var(--surface-elevated)"
        stroke="oklch(var(--foreground)/0.65)"
        strokeWidth="1"
      />
      {/* A subtle inner highlight line to make the segment read as a
          machined part rather than a flat block. */}
      <line
        x1={x + 2}
        y1={y + 2}
        x2={x + 2}
        y2={y + h - 2}
        stroke="oklch(var(--foreground)/0.25)"
        strokeWidth="0.5"
      />
    </g>
  )
}

function FloorGrid() {
  // 12-column × 2-row grid, lightly etched. Plus a slightly darker floor
  // baseline at y=222 (matches base block bottom).
  const cols = 12
  const stride = 480 / cols
  return (
    <g>
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * stride}
          y1={210}
          x2={i * stride}
          y2={252}
          stroke="oklch(var(--muted-foreground))"
          strokeWidth="0.4"
          opacity="0.22"
        />
      ))}
      <line x1="0" y1="222" x2="480" y2="222" stroke="oklch(var(--border))" strokeWidth="0.7" opacity="0.7" />
      <line x1="0" y1="232" x2="480" y2="232" stroke="oklch(var(--muted-foreground))" strokeWidth="0.4" opacity="0.3" />
      <line x1="0" y1="245" x2="480" y2="245" stroke="oklch(var(--muted-foreground))" strokeWidth="0.4" opacity="0.18" />
    </g>
  )
}

function JointReadout({ label, value }: { label: string; value: number }) {
  const sign = value >= 0 ? '+' : ''
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground/55">{label}</span>
      <span className="num text-foreground/85">
        {sign}
        {value.toFixed(0)}°
      </span>
    </span>
  )
}

function RecDot({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
      {!reduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[color:var(--accent-fail)]/55"
          animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--accent-fail)] shadow-[0_0_6px_currentColor] text-[color:var(--accent-fail)]"
      />
    </span>
  )
}
