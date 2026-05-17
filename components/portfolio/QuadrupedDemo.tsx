'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── QuadrupedDemo ───────────────────────────────────────────────────────────
// A side-view four-legged robot trotting in place. Diagonal pairs of legs
// swing in opposite phase (a true trot gait), the body bobs slightly with
// each footfall, and the ground scrolls under the feet so the robot reads
// as "moving forward" without changing screen position.
//
// Distinct from the other animated bits on the site:
//   · IsaacViewport = stationary side-view manipulator arm (pick-and-place)
//   · JoystickNudge = top-down wheeled vehicle with cursor input
//   · This = side-view legged locomotion, autoplay, no input
//
// All pure SVG + framer-motion keyframe loops; no external sprites, no rAF.

const CYCLE_SEC = 0.7 // one trot stride = 0.7s

export function QuadrupedDemo() {
  const reduceMotion = useReducedMotion()

  // Trot gait: front-left + back-right swing together (phase A), then
  // front-right + back-left swing together (phase B). Swing = leg lifts + moves
  // forward; stance = leg pushes back along the ground.
  //
  // We animate each leg's hip + knee rotations as small sinusoidal sweeps.
  // The keyframes are sampled across one stride so the motion is smooth.

  // Phase A (FL + BR) — swing 0→0.5, stance 0.5→1.0.
  const HIP_A_FRAMES   = [-18,  10,  18,   8, -18]
  const KNEE_A_FRAMES  = [ 18, -22, -10,   5,  18]
  // Phase B (FR + BL) — opposite of A, offset by half a stride.
  const HIP_B_FRAMES   = [ 18,   8, -18,  10,  18]
  const KNEE_B_FRAMES  = [-10,   5,  18, -22, -10]
  const TIMES = [0, 0.25, 0.5, 0.75, 1]

  // Body bobs down on each double-stance moment (2× per stride).
  const BODY_BOB = [0, -2, 0, -2, 0]

  const motionLoop = (frames: number[]) =>
    reduceMotion
      ? undefined
      : {
          rotate: frames,
        }
  const motionLoopY = (frames: number[]) =>
    reduceMotion
      ? undefined
      : {
          y: frames,
        }
  const transition = reduceMotion
    ? undefined
    : {
        duration: CYCLE_SEC,
        times: TIMES,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      }

  return (
    <div className="relative border border-border/60 bg-foreground/[0.02]">
      {/* Viewport chrome — matches IsaacViewport's vocabulary so the two
          demos read as siblings, not strangers. */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <span className="text-muted-foreground/50">STAGE</span>{' '}
          <span className="text-foreground/75">/World/quad_trot.usd</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <LiveDot reduceMotion={!!reduceMotion} />
          <span>LIVE</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:inline-block" />
          <span className="hidden text-muted-foreground/60 sm:inline">trot · {CYCLE_SEC.toFixed(1)}s/stride</span>
        </span>
      </div>

      {/* The viewport. */}
      <div className="relative overflow-hidden">
        <svg
          viewBox="0 0 480 240"
          role="img"
          aria-label="Side-view quadruped robot trotting in place"
          className="block w-full"
        >
          {/* Sky gradient is intentionally absent — flat dark surface lets the
              robot itself carry the visual weight. */}

          {/* Scrolling ground — two tiled hash-strokes that move right→left
              behind the robot to imply forward motion. */}
          <ScrollingGround reduceMotion={!!reduceMotion} />

          {/* Body — bobs vertically with each footfall. Origin at chassis center. */}
          <motion.g
            initial={{ y: 0 }}
            animate={motionLoopY(BODY_BOB)}
            transition={transition}
          >
            {/* Chassis. */}
            <g>
              <rect
                x="170"
                y="98"
                width="140"
                height="38"
                fill="var(--surface-elevated)"
                stroke="oklch(var(--foreground)/0.7)"
                strokeWidth="1.1"
              />
              {/* Head / sensor head. */}
              <rect
                x="295"
                y="86"
                width="32"
                height="22"
                fill="var(--surface-elevated)"
                stroke="oklch(var(--foreground)/0.7)"
                strokeWidth="1.1"
              />
              {/* Sensor eye — cyan. */}
              <circle cx="318" cy="96" r="3" fill="var(--accent-warm)" />
              <circle cx="318" cy="96" r="6" fill="var(--accent-warm)" opacity="0.18" />
              {/* Antenna. */}
              <line x1="305" y1="86" x2="305" y2="76" stroke="oklch(var(--foreground)/0.65)" strokeWidth="0.9" />
              <circle cx="305" cy="74" r="1.6" fill="var(--accent-fail)" />
              {/* Body inner highlight. */}
              <line x1="175" y1="103" x2="305" y2="103" stroke="oklch(var(--foreground)/0.25)" strokeWidth="0.5" />
              {/* "WORV" label on the side, mono. */}
              <text
                x="240"
                y="124"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="8.5"
                fill="oklch(var(--muted-foreground))"
                opacity="0.65"
                letterSpacing="2"
              >
                WORV · 04
              </text>
            </g>

            {/* Legs — four nested motion groups, one per leg. Each has a hip
                rotation around the chassis attachment point, then a knee
                rotation around the hip-end. The leg shape is drawn at the
                local frame so the rotation sequence cascades correctly.

                Hip attachment points (chassis bottom):
                  Front-left:  (200, 136)
                  Front-right: (210, 136)  (slightly offset to suggest 3D depth)
                  Back-left:   (270, 136)
                  Back-right:  (280, 136)
                Phase A = front-left + back-right
                Phase B = front-right + back-left */}

            {/* Back-right (phase A) */}
            <Leg
              hipX={280}
              hipY={136}
              hipFrames={HIP_A_FRAMES}
              kneeFrames={KNEE_A_FRAMES}
              motionLoop={motionLoop}
              transition={transition}
              depth="far"
            />
            {/* Front-right (phase B) */}
            <Leg
              hipX={210}
              hipY={136}
              hipFrames={HIP_B_FRAMES}
              kneeFrames={KNEE_B_FRAMES}
              motionLoop={motionLoop}
              transition={transition}
              depth="far"
            />
            {/* Back-left (phase B) */}
            <Leg
              hipX={270}
              hipY={136}
              hipFrames={HIP_B_FRAMES}
              kneeFrames={KNEE_B_FRAMES}
              motionLoop={motionLoop}
              transition={transition}
              depth="near"
            />
            {/* Front-left (phase A) */}
            <Leg
              hipX={200}
              hipY={136}
              hipFrames={HIP_A_FRAMES}
              kneeFrames={KNEE_A_FRAMES}
              motionLoop={motionLoop}
              transition={transition}
              depth="near"
            />
          </motion.g>
        </svg>

        {/* Bottom progress bar — one stride sweep, matches the chassis bob.
            Cyan tick to mark "this is the playhead." */}
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

      {/* Readout strip. */}
      <div className="flex flex-col gap-y-2 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em]">
          <span className="text-muted-foreground/65">GAIT</span>
          <span aria-hidden="true" className="h-2.5 w-px bg-border" />
          <span className="text-foreground/90">TROT</span>
          <span aria-hidden="true" className="text-muted-foreground/40">·</span>
          <span className="text-muted-foreground/70">diagonal pairs</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          <Read label="speed" value="0.65 m/s" />
          <Read label="freq" value="1.43 Hz" />
          <Read label="hip" value="±18°" />
        </div>
      </div>
    </div>
  )
}

// ─── Leg ────────────────────────────────────────────────────────────────────
// Two-segment leg (thigh + shank) with a foot. Hip rotates around (hipX, hipY)
// at the chassis. Knee rotates around (hipX, hipY + thighLen) in the parent's
// post-rotation frame.

function Leg({
  hipX,
  hipY,
  hipFrames,
  kneeFrames,
  motionLoop,
  transition,
  depth,
}: {
  hipX: number
  hipY: number
  hipFrames: number[]
  kneeFrames: number[]
  motionLoop: (frames: number[]) => { rotate: number[] } | undefined
  transition: object | undefined
  depth: 'near' | 'far'
}) {
  // Far legs (the "back" pair of left vs right) are drawn slightly fainter
  // so the depth reads correctly even though everything is on the same plane.
  const stroke = depth === 'far' ? 'oklch(var(--foreground)/0.45)' : 'oklch(var(--foreground)/0.7)'
  const fill = depth === 'far' ? 'oklch(var(--background))' : 'oklch(var(--background))'
  const sw = depth === 'far' ? 0.9 : 1.1

  const thighLen = 24
  const shankLen = 22
  const footW = 6

  return (
    <motion.g
      style={{ originX: hipX, originY: hipY }}
      initial={{ rotate: hipFrames[0] }}
      animate={motionLoop(hipFrames)}
      transition={transition}
    >
      {/* Thigh — drawn straight down from the hip in this group's local frame. */}
      <rect
        x={hipX - 2}
        y={hipY}
        width="4"
        height={thighLen}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />

      <motion.g
        style={{ originX: hipX, originY: hipY + thighLen }}
        initial={{ rotate: kneeFrames[0] }}
        animate={motionLoop(kneeFrames)}
        transition={transition}
      >
        {/* Shank. */}
        <rect
          x={hipX - 1.6}
          y={hipY + thighLen}
          width="3.2"
          height={shankLen}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        {/* Foot. */}
        <rect
          x={hipX - footW / 2}
          y={hipY + thighLen + shankLen}
          width={footW}
          height="3"
          fill={stroke}
          opacity="0.85"
        />
      </motion.g>

      {/* Hip joint marker. */}
      <circle cx={hipX} cy={hipY} r="1.6" fill="var(--surface-elevated)" stroke={stroke} strokeWidth={sw} />
    </motion.g>
  )
}

// ─── Scrolling ground ───────────────────────────────────────────────────────
// Two side-by-side groups of hash strokes that translate right→left and
// wrap. Gives the illusion of forward locomotion while the robot stays
// horizontally fixed in the viewport. Hairline horizon line at y=200.

function ScrollingGround({ reduceMotion }: { reduceMotion: boolean }) {
  const hashCount = 16
  const stride = 480 / hashCount
  return (
    <g>
      {/* Horizon hairline. */}
      <line x1="0" y1="200" x2="480" y2="200" stroke="oklch(var(--border))" strokeWidth="0.7" opacity="0.7" />
      <line x1="0" y1="208" x2="480" y2="208" stroke="oklch(var(--muted-foreground))" strokeWidth="0.4" opacity="0.25" />

      {/* Hash strokes. Two copies offset by viewport width; the group
          translates left by one width, then wraps. */}
      <motion.g
        initial={{ x: 0 }}
        animate={reduceMotion ? undefined : { x: -480 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: CYCLE_SEC * 1.4, repeat: Infinity, ease: 'linear' }
        }
      >
        {[0, 480].map((offset) =>
          Array.from({ length: hashCount }).map((_, i) => {
            const x = offset + i * stride + (i % 3) * 4
            return (
              <line
                key={`${offset}-${i}`}
                x1={x}
                y1={210}
                x2={x + 8}
                y2={210}
                stroke="oklch(var(--muted-foreground))"
                strokeWidth="0.7"
                opacity="0.4"
              />
            )
          }),
        )}
      </motion.g>

      {/* Distant grid lines further down — give a subtle depth band. */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`d${i}`}
          x1="0"
          y1={218 + i * 4}
          x2="480"
          y2={218 + i * 4}
          stroke="oklch(var(--muted-foreground))"
          strokeWidth="0.35"
          opacity={0.18 - i * 0.025}
        />
      ))}
    </g>
  )
}

// ─── Readout pair ──────────────────────────────────────────────────────────

function Read({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground/55">{label}</span>
      <span className="num text-foreground/85">{value}</span>
    </span>
  )
}

// ─── Live dot (same idiom as elsewhere) ─────────────────────────────────────

function LiveDot({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
      {!reduceMotion ? (
        <motion.span
          aria-hidden="true"
          className={cn('absolute inset-0 rounded-full bg-[color:var(--primary)]/40')}
          animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      ) : null}
      <span
        aria-hidden="true"
        className="relative h-1.5 w-1.5 rounded-full bg-[color:var(--primary)] shadow-[0_0_6px_currentColor] text-[color:var(--primary)]"
      />
    </span>
  )
}
