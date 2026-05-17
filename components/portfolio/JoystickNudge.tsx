'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Joystick nudge ─────────────────────────────────────────────────────────
// Two-pane micro-demo. Left: a circular pad with a draggable stick (pointer
// events). Right: a top-down SVG of an articulated rig whose steer angle and
// throttle reflect the stick. Echoes the G29 teleop refactor — same
// JoyMapping idea, in toy form.
//
// All math is local, no deps. Reduced-motion → static stick + nominal rig
// pose, no input.

const PAD_RADIUS = 56
const STICK_RADIUS = 14
const MAX_STEER_DEG = 28 // realistic articulated rig

type Vec2 = { x: number; y: number }

export function JoystickNudge({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const padRef = useRef<HTMLDivElement | null>(null)
  const [stick, setStick] = useState<Vec2>({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  // Magnitudes derived from stick offset.
  const steer = Math.max(-1, Math.min(1, stick.x / (PAD_RADIUS - STICK_RADIUS))) * MAX_STEER_DEG
  const throttle = -stick.y / (PAD_RADIUS - STICK_RADIUS) // up = forward
  const throttleClamped = Math.max(-1, Math.min(1, throttle))

  useEffect(() => {
    if (!active) return
    const onMove = (e: PointerEvent) => {
      const pad = padRef.current
      if (!pad) return
      const rect = pad.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let dx = e.clientX - cx
      let dy = e.clientY - cy
      const mag = Math.hypot(dx, dy)
      const max = PAD_RADIUS - STICK_RADIUS
      if (mag > max) {
        dx = (dx / mag) * max
        dy = (dy / mag) * max
      }
      setStick({ x: dx, y: dy })
    }
    const onUp = () => {
      setActive(false)
      setStick({ x: 0, y: 0 })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [active])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    e.preventDefault()
    setActive(true)
  }

  return (
    <div
      className={cn(
        'flex flex-col items-stretch gap-6 border border-border/60 bg-foreground/[0.015] p-4 sm:flex-row sm:items-center sm:gap-8 sm:p-5',
        className,
      )}
    >
      {/* Pad. */}
      <div className="flex flex-col items-center gap-3">
        <div
          ref={padRef}
          onPointerDown={onDown}
          className={cn(
            'relative shrink-0 select-none touch-none rounded-full border border-border/70',
            !reduceMotion && (active ? 'cursor-grabbing' : 'cursor-grab'),
            reduceMotion && 'cursor-default opacity-70',
          )}
          style={{ width: PAD_RADIUS * 2, height: PAD_RADIUS * 2 }}
          aria-label="Drag to steer the tractor"
          role="application"
        >
          {/* Cross-hair lines. */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[80%] w-px -translate-x-1/2 -translate-y-1/2 bg-border/40"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2 bg-border/40"
          />
          {/* Stick. */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute rounded-full border transition-shadow',
              active
                ? 'border-primary shadow-[0_0_18px_oklch(var(--primary)/0.4)]'
                : 'border-foreground/60',
            )}
            style={{
              width: STICK_RADIUS * 2,
              height: STICK_RADIUS * 2,
              left: PAD_RADIUS - STICK_RADIUS + stick.x,
              top: PAD_RADIUS - STICK_RADIUS + stick.y,
              backgroundColor: 'oklch(var(--background) / 0.5)',
              transition: active ? 'none' : 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/65">
          drag · pad
        </p>
      </div>

      {/* Readout + tractor. */}
      <div className="min-w-0 flex-1">
        {/* Mono readout. */}
        <dl className="grid grid-cols-3 gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          <div>
            <dt className="text-muted-foreground/55">steer</dt>
            <dd className="num text-foreground/85">
              {steer >= 0 ? '+' : ''}
              {steer.toFixed(1)}°
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground/55">throttle</dt>
            <dd className="num text-foreground/85">
              {(throttleClamped * 100).toFixed(0)}%
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground/55">mode</dt>
            <dd className="text-foreground/85">
              {Math.abs(throttleClamped) < 0.05 && Math.abs(steer) < 1
                ? 'IDLE'
                : throttleClamped > 0
                  ? 'FWD'
                  : 'REV'}
            </dd>
          </div>
        </dl>

        {/* Tractor SVG — articulated cab + trailer. Rotates around the
            articulation joint as steer changes. */}
        <svg
          viewBox="0 0 200 60"
          className="mt-4 w-full max-w-[280px]"
          aria-hidden="true"
        >
          {/* Ground. */}
          <line x1="0" y1="50" x2="200" y2="50" stroke="oklch(var(--border))" strokeWidth="0.7" opacity="0.5" strokeDasharray="2 3" />
          {/* Trailer. */}
          <g transform="translate(0,0)">
            <rect x="6" y="20" width="80" height="20" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="0.9" />
            <circle cx="20" cy="44" r="4" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="0.9" />
            <circle cx="72" cy="44" r="4" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="0.9" />
            {/* Coupler. */}
            <circle cx="92" cy="30" r="1.6" fill="oklch(var(--muted-foreground)/0.8)" />
          </g>
          {/* Cab — rotates around (92, 30). */}
          <g transform={`rotate(${steer} 92 30)`}>
            <rect x="92" y="18" width="62" height="24" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.7)" strokeWidth="0.9" />
            <rect x="124" y="22" width="22" height="16" fill="oklch(var(--foreground)/0.07)" stroke="oklch(var(--foreground)/0.55)" strokeWidth="0.7" />
            <circle cx="104" cy="44" r="5" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.7)" strokeWidth="0.9" />
            <circle cx="146" cy="44" r="5" fill="var(--surface-elevated)" stroke="oklch(var(--foreground)/0.7)" strokeWidth="0.9" />
            {/* Headlight. */}
            <circle cx="152" cy="24" r="1.4" fill="var(--accent-warm)" opacity={Math.max(0.25, Math.abs(throttleClamped))} />
          </g>
        </svg>
      </div>
    </div>
  )
}
