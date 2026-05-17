'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── SimConsole ──────────────────────────────────────────────────────────────
// An interactive two-pane "mission console": typed terminal on the left, a
// tiny live stage on the right. Every command the visitor runs moves real
// state in the scene — move the robot, change time-of-day, spawn objects,
// toggle weather. The stage reacts in real time.
//
// Why this replaces the previous passive arm/quadruped demos: a robot that
// moves on its own is fine. A robot that moves *because the visitor told it
// to* is memorable. The whole piece runs on local React state — no backend,
// no WebGL — so it's also light enough to keep the page snappy.
//
// Aesthetic POV: instrument panel. Mono caps chrome. Hairline borders. Cyan
// caret + active-pixel feel. A subtle scanline overlay on the terminal pane
// (CSS gradient) gives it CRT character without going retro-gimmick.

const PROMPT = 'sam@worv:~/stage$'

const HELP_TEXT = [
  'commands:',
  '  help              · list commands',
  '  clear             · clear screen',
  '  whoami            · who is operating this rig',
  '  ls                · list objects in the stage',
  '  move <dir> [n]    · move robot (dir: fwd/back/left/right)',
  '  rotate [deg]      · rotate robot (default 45)',
  '  spawn <cube|sphere> · drop an object near the robot',
  '  step              · advance one physics tick',
  '  time <h>          · set time-of-day (0–23)',
  '  weather <m>       · clear | rain | snow | fog',
  '  theme             · toggle dark/light',
  '  silent            · toggle silent-failure mode',
  '  reset             · clear scene + reset robot',
  '',
  'tip: ↑/↓ recall history · tab autocompletes',
]

const COMMAND_NAMES = [
  'help','clear','whoami','ls','move','rotate','spawn',
  'step','time','weather','theme','silent','reset',
]

// ─── Scene state ────────────────────────────────────────────────────────────

type Weather = 'clear' | 'rain' | 'snow' | 'fog'
type SceneObject = { id: number; type: 'cube' | 'sphere'; x: number; y: number; falling: boolean }
type Scene = {
  robotX: number   // grid units, -5..5
  robotY: number   // grid units, -5..5
  angle: number    // degrees, 0 = east
  hour: number     // 0..23
  weather: Weather
  objects: SceneObject[]
  nextId: number
}

const INITIAL_SCENE: Scene = {
  robotX: 0,
  robotY: 0,
  angle: 0,
  hour: 12,
  weather: 'clear',
  objects: [],
  nextId: 1,
}

// ─── Output entries ─────────────────────────────────────────────────────────

type Entry = { id: number; kind: 'in' | 'out' | 'err' | 'info'; text: string }

const BANNER: Entry[] = [
  { id: -3, kind: 'info', text: '──  WORV  SIM  CONSOLE  ·  v0.1  ──' },
  { id: -2, kind: 'info', text: 'stage loaded · 1 robot · 0 objects · 12:00 · clear' },
  { id: -1, kind: 'info', text: "type `help` to begin." },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function SimConsole() {
  const reduceMotion = useReducedMotion()
  const [scene, setScene] = useState<Scene>(INITIAL_SCENE)
  const [entries, setEntries] = useState<Entry[]>(BANNER)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number | null>(null)
  const nextEntryId = useRef(1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const outputRef = useRef<HTMLDivElement | null>(null)

  // Autoscroll the output pane to bottom on each new entry.
  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  // Append helpers — stable identity so they can live outside React's render.
  const push = useCallback((kind: Entry['kind'], text: string) => {
    setEntries((prev) => [...prev, { id: nextEntryId.current++, kind, text }])
  }, [])
  const pushMany = useCallback((lines: { kind: Entry['kind']; text: string }[]) => {
    setEntries((prev) => [
      ...prev,
      ...lines.map((l) => ({ id: nextEntryId.current++, ...l })),
    ])
  }, [])

  // ─── Command execution ──────────────────────────────────────────────────
  const exec = useCallback(
    (raw: string) => {
      const line = raw.trim()
      push('in', `${PROMPT} ${line}`)
      if (!line) return
      const tokens = line.split(/\s+/)
      const cmd = tokens[0].toLowerCase()
      const args = tokens.slice(1)

      switch (cmd) {
        case 'help':
          pushMany(HELP_TEXT.map((t) => ({ kind: 'out' as const, text: t })))
          break

        case 'clear':
          setEntries([])
          nextEntryId.current = 1
          break

        case 'whoami':
          pushMany([
            { kind: 'out', text: 'saidakhmad nuriddinov · autonomous-driving sim engineer' },
            { kind: 'out', text: 'maum.ai · worv team · seoul, korea' },
            { kind: 'out', text: 'beliefs: simulators should fail honestly.' },
          ])
          break

        case 'ls':
          if (scene.objects.length === 0) {
            push('out', `/World/robot           [pose ${fmtVec(scene.robotX, scene.robotY)} · ${scene.angle}°]`)
            push('out', `(no objects — try \`spawn cube\`)`)
          } else {
            push('out', `/World/robot           [pose ${fmtVec(scene.robotX, scene.robotY)} · ${scene.angle}°]`)
            scene.objects.forEach((o) =>
              push('out', `/World/${o.type}_${o.id.toString().padStart(2,'0')}       [pose ${fmtVec(o.x, o.y)}]`),
            )
          }
          break

        case 'move': {
          const dir = (args[0] || '').toLowerCase()
          const n = clamp(parseInt(args[1] || '1', 10) || 1, 1, 10)
          const map: Record<string, [number, number]> = {
            fwd: [1, 0], forward: [1, 0],
            back: [-1, 0], backward: [-1, 0],
            left: [0, -1],
            right: [0, 1],
          }
          if (!(dir in map)) {
            push('err', `move: unknown direction \`${dir || '(missing)'}\`. try fwd|back|left|right`)
            break
          }
          const [dx, dy] = map[dir]
          setScene((s) => {
            const nx = clamp(s.robotX + dx * n, -5, 5)
            const ny = clamp(s.robotY + dy * n, -5, 5)
            return { ...s, robotX: nx, robotY: ny }
          })
          push('out', `robot → ${dir} ${n} unit${n > 1 ? 's' : ''}`)
          break
        }

        case 'rotate': {
          const deg = parseInt(args[0] || '45', 10) || 45
          setScene((s) => ({ ...s, angle: (s.angle + deg) % 360 }))
          push('out', `robot rotated +${deg}° (yaw → ${(scene.angle + deg) % 360}°)`)
          break
        }

        case 'spawn': {
          const type = (args[0] || '').toLowerCase()
          if (type !== 'cube' && type !== 'sphere') {
            push('err', `spawn: type must be \`cube\` or \`sphere\``)
            break
          }
          setScene((s) => {
            // Place near robot, with a small offset so it doesn't overlap.
            const x = clamp(s.robotX + 1, -5, 5)
            const y = clamp(s.robotY + 0, -5, 5)
            return {
              ...s,
              objects: [...s.objects, { id: s.nextId, type, x, y, falling: false }],
              nextId: s.nextId + 1,
            }
          })
          push('out', `/World/${type}_${scene.nextId.toString().padStart(2, '0')} spawned at ${fmtVec(scene.robotX + 1, scene.robotY)}`)
          break
        }

        case 'step':
          // Physics tick: nothing complex — objects drift toward the floor
          // origin (0,0) by one cell. Reads as "things settle."
          setScene((s) => ({
            ...s,
            objects: s.objects.map((o) => ({
              ...o,
              x: o.x > 0 ? o.x - 1 : o.x < 0 ? o.x + 1 : o.x,
              y: o.y > 0 ? o.y - 1 : o.y < 0 ? o.y + 1 : o.y,
              falling: false,
            })),
          }))
          push('out', `physics: 1 tick · ${scene.objects.length} object${scene.objects.length === 1 ? '' : 's'} integrated`)
          break

        case 'time': {
          const h = parseInt(args[0] || '', 10)
          if (Number.isNaN(h) || h < 0 || h > 23) {
            push('err', `time: hour must be 0–23 (got \`${args[0]}\`)`)
            break
          }
          setScene((s) => ({ ...s, hour: h }))
          push('out', `time-of-day → ${h.toString().padStart(2, '0')}:00 (${phaseFor(h)})`)
          break
        }

        case 'weather': {
          const mode = (args[0] || '').toLowerCase()
          if (mode !== 'clear' && mode !== 'rain' && mode !== 'snow' && mode !== 'fog') {
            push('err', `weather: must be clear|rain|snow|fog`)
            break
          }
          setScene((s) => ({ ...s, weather: mode }))
          push('out', `weather → ${mode}`)
          break
        }

        case 'theme':
          if (typeof document !== 'undefined') {
            const isLight = document.documentElement.classList.toggle('theme-light')
            try { window.localStorage.setItem('theme', isLight ? 'light' : 'dark') } catch {}
            push('out', `theme → ${isLight ? 'light' : 'dark'}`)
          }
          break

        case 'silent':
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('silent-failure:toggle'))
            push('out', `silent-failure mode toggled — every .num goes to its zero state`)
          }
          break

        case 'reset':
          setScene(INITIAL_SCENE)
          push('info', `scene reset · 1 robot · 0 objects · 12:00 · clear`)
          break

        case 'sudo':
          push('err', `${PROMPT.replace(':~/stage$', '')} is not in the sudoers file. this incident will be reported.`)
          break

        case 'coffee':
          push('out', `brewing… (this is a static portfolio. you brew your own.)`)
          break

        case 'cat':
          if (args[0] === 'resume' || args[0] === 'resume.pdf') {
            push('out', `→ /resume_saidakhmad.pdf  (click footer's resume link to download)`)
          } else if (args[0]) {
            push('err', `cat: ${args[0]}: no such file. try \`cat resume\`.`)
          } else {
            push('err', `cat: missing operand. try \`cat resume\`.`)
          }
          break

        default:
          push('err', `command not found: \`${cmd}\`. try \`help\`.`)
      }
    },
    [scene, push, pushMany],
  )

  // ─── Submit / keyboard ──────────────────────────────────────────────────

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = input
      setHistory((h) => (value.trim() ? [...h, value] : h))
      setHistoryIdx(null)
      setInput('')
      exec(value)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = historyIdx === null ? history.length - 1 : Math.max(0, historyIdx - 1)
      setHistoryIdx(next)
      setInput(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.length === 0 || historyIdx === null) return
      const next = historyIdx + 1
      if (next >= history.length) {
        setHistoryIdx(null)
        setInput('')
      } else {
        setHistoryIdx(next)
        setInput(history[next])
      }
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const head = input.trim()
      if (!head) return
      const matches = COMMAND_NAMES.filter((c) => c.startsWith(head))
      if (matches.length === 1) setInput(matches[0] + ' ')
      else if (matches.length > 1) push('info', matches.join('  '))
      return
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  const objectsCount = scene.objects.length
  const lineCount = entries.length

  return (
    <div className="relative border border-border/60 bg-foreground/[0.025]">
      {/* Top chrome — viewport label + telemetry. */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <span className="text-muted-foreground/50">STAGE</span>{' '}
          <span className="text-foreground/75">/World/sim_console.usd</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          <LiveDot reduceMotion={!!reduceMotion} />
          <span>LIVE</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:inline-block" />
          <span className="hidden text-muted-foreground/60 sm:inline">
            <span className="num">{lineCount.toString().padStart(2, '0')}</span> lines
            <span aria-hidden="true" className="mx-1.5 text-border">·</span>
            <span className="num">{objectsCount.toString().padStart(2, '0')}</span> obj
          </span>
        </span>
      </div>

      {/* Two-pane body — terminal left, stage right. Stacks vertically on
          mobile so neither pane crushes the other. */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* Terminal pane. */}
        <div
          className="relative border-b border-border/50 lg:border-b-0 lg:border-r"
          onClick={() => inputRef.current?.focus()}
          // Scanline overlay applied via ::before in a child div so we don't
          // need any extra DOM.
        >
          {/* Scanline texture — repeating horizontal lines at 3px pitch.
              Mix-blend-mode screen so it lifts subtly on dark and dims
              subtly on light without inversion. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.05]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, oklch(var(--foreground)) 0px, oklch(var(--foreground)) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* Output + input column. */}
          <div className="relative z-[2] flex h-[300px] flex-col p-4 sm:h-[340px] sm:p-5">
            <div
              ref={outputRef}
              role="log"
              aria-live="polite"
              className="flex-1 overflow-y-auto pr-1 font-mono text-[12px] leading-relaxed sm:text-[12.5px]"
            >
              {entries.map((e) => (
                <Line key={e.id} entry={e} />
              ))}
            </div>

            {/* Prompt row. */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-2 flex items-center gap-2 border-t border-border/40 pt-2.5 font-mono text-[12.5px] leading-none sm:text-[13px]"
            >
              <span className="shrink-0 text-[color:var(--primary)]/80 select-none">
                {PROMPT}
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  aria-label="Sim console input"
                  className="w-full bg-transparent text-foreground caret-[color:var(--primary)] outline-none placeholder:text-muted-foreground/40"
                  placeholder="type a command — try `help`"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Stage pane. */}
        <StagePane scene={scene} reduceMotion={!!reduceMotion} />
      </div>

      {/* Footer telemetry. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Read label="pose" value={fmtVec(scene.robotX, scene.robotY)} />
          <Read label="yaw" value={`${scene.angle}°`} />
          <Read label="t" value={`${scene.hour.toString().padStart(2,'0')}:00`} />
          <Read label="weather" value={scene.weather} accent={scene.weather === 'rain' ? 'cyan' : scene.weather === 'snow' ? 'neutral' : scene.weather === 'fog' ? 'warm' : 'neutral'} />
        </div>
        <span className="text-muted-foreground/55">↑/↓ history · tab autocomplete</span>
      </div>
    </div>
  )
}

// ─── Terminal line ──────────────────────────────────────────────────────────

function Line({ entry }: { entry: Entry }) {
  const color = {
    in: 'text-foreground/90',
    out: 'text-foreground/75',
    err: 'text-[color:var(--accent-fail)]/90',
    info: 'text-[color:var(--accent-warm)]/85',
  }[entry.kind]
  return (
    <pre
      className={cn('whitespace-pre-wrap break-words font-mono', color)}
      style={{ fontFamily: 'inherit' }}
    >
      {entry.text}
    </pre>
  )
}

// ─── Stage pane ─────────────────────────────────────────────────────────────
// Top-down view: 10×10 grid, robot triangle, scene objects, weather particles,
// time-of-day tint. The stage is its own ambient world that reacts to commands.

function StagePane({ scene, reduceMotion }: { scene: Scene; reduceMotion: boolean }) {
  // Scene → svg mapping. 10×10 grid spans 200×200 px. Cell = 20px. Origin at
  // (100, 100), +x right, +y down (svg convention; we negate Y when plotting).
  const cellSize = 20
  const cx = (gx: number) => 100 + gx * cellSize
  const cy = (gy: number) => 100 - gy * cellSize // invert Y so +y = up in stage

  // Time-of-day → ambient tint. Three keyframes: dawn (warm), noon (cool),
  // dusk (warm), night (deep). Lerp between them.
  const ambient = useMemo(() => ambientFor(scene.hour), [scene.hour])
  const sunPos = useMemo(() => sunPosFor(scene.hour), [scene.hour])

  // Stable particle layout — deterministic seeded PRNG so values are
  // identical on SSR + client and across re-renders (React strict purity
  // forbids Math.random in render). Movement is CSS-only.
  const particles = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: prand(i * 3) * 220 - 10,
      delay: prand(i * 3 + 1) * 3,
      drift: (prand(i * 3 + 2) - 0.5) * 14,
    }))
  }, [])

  return (
    <div className="relative">
      <div className="relative aspect-square w-full overflow-hidden">
        <svg
          viewBox="0 0 200 200"
          className="block h-full w-full"
          role="img"
          aria-label="Stage viewport showing robot and scene objects"
        >
          {/* Ambient backdrop — gradient that shifts with time-of-day. */}
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={ambient.sun} stopOpacity={ambient.sunOpacity} />
              <stop offset="60%" stopColor={ambient.sun} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="sky-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ambient.top} stopOpacity={ambient.topOpacity} />
              <stop offset="100%" stopColor={ambient.bottom} stopOpacity={ambient.bottomOpacity} />
            </linearGradient>
          </defs>

          {/* Surface elevated base so the stage doesn't blend into the page. */}
          <rect x="0" y="0" width="200" height="200" fill="var(--surface-elevated)" />
          <rect x="0" y="0" width="200" height="200" fill="url(#sky-tint)" />
          {/* Sun spot — moves with hour. */}
          <circle cx={sunPos.x} cy={sunPos.y} r="50" fill="url(#sun-glow)" />

          {/* Grid lines — every cell. */}
          <Grid cellSize={cellSize} />

          {/* Origin crosshair. */}
          <g opacity="0.5">
            <line x1="98" y1="100" x2="102" y2="100" stroke="oklch(var(--muted-foreground))" strokeWidth="0.5" />
            <line x1="100" y1="98" x2="100" y2="102" stroke="oklch(var(--muted-foreground))" strokeWidth="0.5" />
          </g>

          {/* Scene objects. */}
          {scene.objects.map((o) => (
            <g
              key={o.id}
              transform={`translate(${cx(o.x)}, ${cy(o.y)})`}
              opacity="0.95"
            >
              {o.type === 'cube' ? (
                <rect
                  x="-6" y="-6" width="12" height="12"
                  fill="var(--surface-elevated)"
                  stroke="oklch(var(--foreground)/0.85)"
                  strokeWidth="1"
                />
              ) : (
                <circle
                  r="7"
                  fill="var(--surface-elevated)"
                  stroke="var(--accent-warm)"
                  strokeWidth="1"
                />
              )}
              <text
                x="0" y="22"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize="6.5"
                fill="oklch(var(--muted-foreground))"
                opacity="0.65"
              >
                {o.type}_{o.id.toString().padStart(2, '0')}
              </text>
            </g>
          ))}

          {/* Robot — triangle pointing in the angle direction. Smooth-animates
              between poses via the parent <motion.g>. */}
          <motion.g
            animate={{
              x: cx(scene.robotX),
              y: cy(scene.robotY),
              rotate: scene.angle,
            }}
            initial={{
              x: cx(scene.robotX),
              y: cy(scene.robotY),
              rotate: scene.angle,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {/* Outer chassis — small square frame so the robot reads as a
                vehicle, not just an arrow. */}
            <rect
              x="-9" y="-7" width="18" height="14"
              fill="var(--surface-elevated)"
              stroke="oklch(var(--primary))"
              strokeWidth="1.2"
            />
            {/* Heading triangle. */}
            <polygon
              points="9,0 3,-4 3,4"
              fill="oklch(var(--primary))"
            />
            {/* Sensor dot. */}
            <circle cx="0" cy="0" r="1.6" fill="var(--accent-warm)" />
          </motion.g>

          {/* Weather particles — rendered only when a non-clear mode is set.
              Animation is CSS keyframes via inline style. */}
          {scene.weather !== 'clear' && !reduceMotion ? (
            <g aria-hidden="true">
              {particles.map((p) => {
                if (scene.weather === 'rain') {
                  return (
                    <line
                      key={p.id}
                      x1={p.x}
                      y1={-10}
                      x2={p.x - 4}
                      y2={6}
                      stroke="oklch(var(--primary))"
                      strokeWidth="0.8"
                      opacity="0.55"
                      style={{
                        animation: `sim-rain 1.6s linear ${p.delay}s infinite`,
                      }}
                    />
                  )
                }
                if (scene.weather === 'snow') {
                  return (
                    <circle
                      key={p.id}
                      cx={p.x}
                      cy={-10}
                      r="1.2"
                      fill="oklch(var(--foreground)/0.7)"
                      style={{
                        animation: `sim-snow 4.5s linear ${p.delay}s infinite`,
                        ['--drift' as string]: `${p.drift}px`,
                      } as React.CSSProperties}
                    />
                  )
                }
                return null
              })}
            </g>
          ) : null}

          {/* Fog overlay. */}
          {scene.weather === 'fog' ? (
            <rect x="0" y="0" width="200" height="200" fill="oklch(var(--foreground)/0.25)" />
          ) : null}
        </svg>
      </div>

      {/* Stage chrome strip — small caption + pose. */}
      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/65 sm:px-5">
        <span>
          <span className="text-muted-foreground/50">VIEW</span>{' '}
          <span className="text-foreground/70">top-down · 10×10</span>
        </span>
        <span>{phaseFor(scene.hour)}</span>
      </div>
    </div>
  )
}

// ─── Stage helpers ──────────────────────────────────────────────────────────

function Grid({ cellSize }: { cellSize: number }) {
  const lines: React.ReactElement[] = []
  for (let i = 0; i <= 10; i++) {
    const v = i * cellSize
    const isMajor = i === 5
    lines.push(
      <line
        key={`v${i}`}
        x1={v} y1={0} x2={v} y2={200}
        stroke={isMajor ? 'oklch(var(--muted-foreground))' : 'oklch(var(--muted-foreground))'}
        strokeWidth={isMajor ? '0.5' : '0.3'}
        opacity={isMajor ? '0.4' : '0.18'}
      />,
      <line
        key={`h${i}`}
        x1={0} y1={v} x2={200} y2={v}
        stroke={isMajor ? 'oklch(var(--muted-foreground))' : 'oklch(var(--muted-foreground))'}
        strokeWidth={isMajor ? '0.5' : '0.3'}
        opacity={isMajor ? '0.4' : '0.18'}
      />,
    )
  }
  return <g>{lines}</g>
}

// Ambient color stops by hour. Three day phases + night.
function ambientFor(hour: number) {
  if (hour >= 5 && hour < 8) {
    return {
      top: 'oklch(0.55 0.10 50)',
      bottom: 'oklch(0.45 0.08 80)',
      topOpacity: 0.32,
      bottomOpacity: 0.18,
      sun: 'oklch(0.78 0.16 65)',
      sunOpacity: 0.4,
    }
  }
  if (hour >= 8 && hour < 17) {
    return {
      top: 'oklch(0.65 0.06 210)',
      bottom: 'oklch(0.55 0.04 220)',
      topOpacity: 0.22,
      bottomOpacity: 0.10,
      sun: 'oklch(0.85 0.10 90)',
      sunOpacity: 0.3,
    }
  }
  if (hour >= 17 && hour < 20) {
    return {
      top: 'oklch(0.50 0.14 40)',
      bottom: 'oklch(0.35 0.10 30)',
      topOpacity: 0.40,
      bottomOpacity: 0.25,
      sun: 'oklch(0.70 0.18 35)',
      sunOpacity: 0.5,
    }
  }
  return {
    top: 'oklch(0.18 0.04 240)',
    bottom: 'oklch(0.08 0.02 240)',
    topOpacity: 0.55,
    bottomOpacity: 0.65,
    sun: 'oklch(0.55 0.08 240)',
    sunOpacity: 0.15,
  }
}

// Sun position by hour. East rise → south at noon → west set.
function sunPosFor(hour: number) {
  // hour 6 → x=20 (east), hour 12 → x=100 (south, high), hour 18 → x=180 (west)
  const t = clamp((hour - 6) / 12, 0, 1)
  const x = 20 + t * 160
  const y = 40 + Math.sin(t * Math.PI) * -25 + 25 // arc
  return { x, y }
}

function phaseFor(hour: number): string {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

// Mulberry32-style pseudo-random — deterministic, stateless. Used to lay out
// weather particles with a "random-looking" but reproducible distribution.
function prand(seed: number): number {
  let t = (seed + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function fmtVec(x: number, y: number) {
  return `(${x.toString().padStart(2, ' ')}, ${y.toString().padStart(2, ' ')})`
}

// ─── Readout pair ──────────────────────────────────────────────────────────

function Read({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: string
  accent?: 'default' | 'cyan' | 'warm' | 'neutral'
}) {
  const color =
    accent === 'cyan'
      ? 'text-[color:var(--primary)]'
      : accent === 'warm'
        ? 'text-[color:var(--accent-warm)]'
        : 'text-foreground/85'
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-muted-foreground/55">{label}</span>
      <span className={cn('num', color)}>{value}</span>
    </span>
  )
}

// ─── Live dot (same idiom as elsewhere) ────────────────────────────────────

function LiveDot({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
      {!reduceMotion ? (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[color:var(--primary)]/40"
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
