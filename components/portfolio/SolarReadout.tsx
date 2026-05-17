'use client'

import { useSyncExternalStore } from 'react'
import { useReducedMotion } from 'framer-motion'

// ─── Spencer 1971 Fourier solar model (JS port) ─────────────────────────────
// Ported from the same approach Saidakhmad shipped in worv.env.lights at
// Maum.ai — Spencer (1971) Fourier expansion for solar declination + equation
// of time, then standard hour-angle → elevation math. Pure standard-library
// math, no external deps — same constraint as the Isaac Sim extension where
// pip isn't allowed.

const DEG = Math.PI / 180

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = (d.getTime() - start.getTime()) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60_000)
  return Math.floor(diff / 86_400_000)
}

function spencerDeclinationRad(n: number): number {
  // Fractional year angle Γ in radians.
  const g = (2 * Math.PI * (n - 1)) / 365
  // Spencer 1971 declination expansion (radians).
  return (
    0.006918
    - 0.399912 * Math.cos(g)
    + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g)
    + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g)
    + 0.001480 * Math.sin(3 * g)
  )
}

function equationOfTimeMin(n: number): number {
  const g = (2 * Math.PI * (n - 1)) / 365
  // Spencer 1971 equation-of-time, minutes.
  return 229.18 * (
    0.000075
    + 0.001868 * Math.cos(g)
    - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g)
    - 0.040849 * Math.sin(2 * g)
  )
}

// Tanner-Helland style Kelvin → display tag. We don't render the RGB color
// itself — Hero has a cyan-accent budget and we don't want a second light
// source. We surface just the Kelvin number, which is the value the lighting
// rig actually uses upstream.
function kelvinFromElevation(elevationDeg: number): number {
  // Below horizon: dim civil twilight ~ 1800K. Noon overhead: ~5800K.
  // Smoothstep in between for a believable arc.
  const t = Math.max(0, Math.min(1, (elevationDeg + 6) / 56))
  const smooth = t * t * (3 - 2 * t)
  return Math.round(1800 + smooth * 4000)
}

type Reading = {
  hhmm: string
  elevationDeg: number
  azimuthDeg: number
  kelvin: number
  phase: 'NIGHT' | 'TWILIGHT' | 'GOLDEN' | 'DAY' | 'GOLDEN_PM' | 'TWILIGHT_PM'
}

// Seoul, KR. Real coordinates so the readout matches the location pin in Hero.
const SEOUL_LAT = 37.5665
const SEOUL_LON = 126.9780

function compute(now: Date): Reading {
  const n = dayOfYear(now)
  const decl = spencerDeclinationRad(n)
  const eot = equationOfTimeMin(n) // minutes
  // True solar time in minutes since solar midnight.
  // Standard meridian for KST is 135°E. Longitude correction = 4 * (lon - meridian).
  const stdMeridian = 135
  const lonCorrectionMin = 4 * (SEOUL_LON - stdMeridian)
  const localMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const solarMinutes = localMinutes + eot + lonCorrectionMin
  // Hour angle: 15° per hour from solar noon.
  const hourAngle = ((solarMinutes - 720) / 60) * 15 * DEG
  const lat = SEOUL_LAT * DEG
  // Elevation.
  const sinEl = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle)
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinEl)))
  // Azimuth (from north, clockwise).
  const cosAz = (Math.sin(decl) - Math.sin(elevation) * Math.sin(lat)) / (Math.cos(elevation) * Math.cos(lat))
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)))
  if (Math.sin(hourAngle) > 0) az = 2 * Math.PI - az
  const elevationDeg = elevation / DEG
  const azimuthDeg = az / DEG
  const kelvin = kelvinFromElevation(elevationDeg)
  const phase: Reading['phase'] = (() => {
    if (elevationDeg < -6) return 'NIGHT'
    if (elevationDeg < 6) return solarMinutes < 720 ? 'TWILIGHT' : 'TWILIGHT_PM'
    if (elevationDeg < 10) return solarMinutes < 720 ? 'GOLDEN' : 'GOLDEN_PM'
    return 'DAY'
  })()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { hhmm, elevationDeg, azimuthDeg, kelvin, phase }
}

const PHASE_LABEL: Record<Reading['phase'], string> = {
  NIGHT: 'NIGHT',
  TWILIGHT: 'TWILIGHT · AM',
  GOLDEN: 'GOLDEN · AM',
  DAY: 'DAYLIGHT',
  GOLDEN_PM: 'GOLDEN · PM',
  TWILIGHT_PM: 'TWILIGHT · PM',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: a compact <dl> readout that updates once a minute. Tiny SVG arc
// to the left shows where the sun is right now over Seoul. Mono-only, lives
// inside the hero just under the beliefs line — same register as the eyebrow.

// External-store subscription: ticks once on mount + every 30s. Using
// useSyncExternalStore lets us derive the reading without ever calling
// setState in an effect — React handles the snapshot/subscribe contract.
function subscribeClock(notify: () => void): () => void {
  const id = window.setInterval(notify, 30_000)
  return () => window.clearInterval(id)
}
function getClockSnapshot(): number {
  // Return Date.now() rounded down to 30s so two reads within the same tick
  // get the same snapshot — useSyncExternalStore requires snapshot stability.
  return Math.floor(Date.now() / 30_000)
}
function getServerSnapshot(): number {
  // On SSR there's no clock — return a sentinel so the client paints the
  // "…" fallback until first mount. We compare !== this value to detect SSR.
  return -1
}

export function SolarReadout() {
  const reduceMotion = useReducedMotion()
  const tick = useSyncExternalStore(subscribeClock, getClockSnapshot, getServerSnapshot)
  const reading: Reading | null = tick === -1 ? null : compute(new Date())

  if (!reading) {
    return (
      <div
        aria-hidden="true"
        className="mt-7 inline-flex items-center gap-3 border border-border/50 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/60"
      >
        <span>SOLAR · SEOUL · …</span>
      </div>
    )
  }

  const { hhmm, elevationDeg, azimuthDeg, kelvin, phase } = reading
  // Map elevation to a position along the arc; AM/PM determines left vs right.
  // 64×24 viewBox; arc spans 4..60 in x, 22..2 in y.
  const elevClamped = Math.max(-10, Math.min(90, elevationDeg))
  const tNorm = Math.max(0, Math.min(1, (elevClamped + 10) / 100))
  // X position: rough mid based on AM/PM (azimuth > 180 → PM, mirror).
  const isPm = azimuthDeg > 180
  const x = isPm ? 60 - 56 * tNorm : 4 + 56 * tNorm
  const y = 22 - 20 * Math.sin(tNorm * Math.PI)
  const aboveHorizon = elevationDeg > 0

  return (
    <div
      role="group"
      aria-label={`Live Seoul solar readout — ${phase.replace('_', ' ')}, elevation ${elevationDeg.toFixed(1)} degrees, ${kelvin} kelvin`}
      className="mt-7 inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 border border-border/60 bg-foreground/[0.015] px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground sm:gap-x-5"
    >
      {/* Tiny sun-arc SVG. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 64 24"
        className="h-5 w-16 shrink-0 text-muted-foreground/45"
      >
        {/* Horizon line. */}
        <line x1="0" y1="22" x2="64" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        {/* Path of the day. */}
        <path
          d="M4 22 Q 32 -8 60 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="1.5 2"
          opacity="0.45"
        />
        {/* Sun position. */}
        <circle
          cx={x}
          cy={y}
          r={aboveHorizon ? 2.2 : 1.6}
          fill={aboveHorizon ? 'var(--accent-warm)' : 'var(--muted-foreground)'}
          opacity={aboveHorizon ? 0.95 : 0.55}
        >
          {aboveHorizon && !reduceMotion ? (
            <animate
              attributeName="opacity"
              values="0.75;1;0.75"
              dur="3.4s"
              repeatCount="indefinite"
            />
          ) : null}
        </circle>
      </svg>

      {/* Series of small key=value cells. The numeric values carry the .num
          class so the global silent-failure toggle zeros them out. */}
      <Cell label="SEOUL" value={hhmm} />
      <Cell
        label="ELEV"
        value={`${elevationDeg >= 0 ? '+' : ''}${elevationDeg.toFixed(1)}°`}
      />
      <Cell label="K" value={`${kelvin}K`} />
      <Cell
        label="PHASE"
        value={PHASE_LABEL[phase]}
        accent={phase === 'GOLDEN' || phase === 'GOLDEN_PM' ? 'warm' : 'default'}
      />
    </div>
  )
}

function Cell({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: string
  accent?: 'default' | 'warm'
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground/55">{label}</span>
      <span
        className={
          accent === 'warm'
            ? 'num text-[color:var(--accent-warm)]'
            : 'num text-foreground/85'
        }
      >
        {value}
      </span>
    </span>
  )
}
