'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ── Grid ─────────────────────────────────────────────────────────────────────
const COLS = 22
const ROWS = 16
const CELL = 30

// Warehouse-yard obstacle layout — crates + barriers
const OBSTACLE_KEYS = new Set([
  '3,2','4,2','3,3',
  '8,1','9,1',
  '14,2','15,2','14,3',
  '19,1','20,1',
  '2,6','3,6','2,7',
  '6,5','7,5','6,6','7,6',
  '11,4','12,4','11,5',
  '16,5','17,5','16,6',
  '20,4','21,4',
  '1,10','2,10','1,11',
  '5,9','5,10','6,9',
  '9,8','10,8','9,9','10,9',
  '14,7','15,7','14,8',
  '18,8','19,8','18,9',
  '3,13','4,13','3,14',
  '8,12','9,12',
  '13,11','14,11','13,12',
  '17,12','18,12','17,13',
  '20,11','21,11',
])

function isWall(gx: number, gy: number): boolean {
  return gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || OBSTACLE_KEYS.has(`${gx},${gy}`)
}

// ── A* pathfinding ────────────────────────────────────────────────────────────
type ANode = { x: number; y: number; g: number; f: number; parent: ANode | null }

function aStar(sx: number, sy: number, ex: number, ey: number): [number, number][] {
  const open: ANode[] = [{ x: sx, y: sy, g: 0, f: Math.abs(sx - ex) + Math.abs(sy - ey), parent: null }]
  const visited = new Map<string, number>()

  while (open.length) {
    open.sort((a, b) => a.f - b.f)
    const cur = open.shift()!
    const key = `${cur.x},${cur.y}`
    if (visited.has(key)) continue
    visited.set(key, cur.g)
    if (cur.x === ex && cur.y === ey) {
      const path: [number, number][] = []
      let n: ANode | null = cur
      while (n) { path.unshift([n.x, n.y]); n = n.parent }
      return path
    }
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const nx = cur.x + dx, ny = cur.y + dy
      if (isWall(nx, ny)) continue
      const nkey = `${nx},${ny}`
      const g = cur.g + (dx && dy ? 1.414 : 1)
      if ((visited.get(nkey) ?? Infinity) <= g) continue
      open.push({ x: nx, y: ny, g, f: g + Math.abs(nx - ex) + Math.abs(ny - ey), parent: cur })
    }
  }
  return []
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = 'IDLE' | 'MANUAL' | 'AUTO'

interface GameState {
  x: number; y: number
  angle: number
  speed: number
  mode: Mode
  path: [number, number][]
  pathIdx: number
  wptGx: number | null
  wptGy: number | null
  score: number
  targets: [number, number][]  // grid coords of collectible targets
}

const TARGET_COUNT  = 4
const COLLECT_DIST  = CELL * 0.65   // pixels — how close to collect

function randomOpenCell(exclude?: [number, number][]): [number, number] {
  for (let i = 0; i < 200; i++) {
    const gx = 1 + Math.floor(Math.random() * (COLS - 2))
    const gy = 1 + Math.floor(Math.random() * (ROWS - 2))
    if (isWall(gx, gy)) continue
    if (exclude?.some(([ex, ey]) => ex === gx && ey === gy)) continue
    return [gx, gy]
  }
  return [5, 5]
}

const INITIAL_STATE: GameState = {
  x: CELL * 1.5, y: CELL * 1.5,
  angle: 0, speed: 0,
  mode: 'IDLE',
  path: [], pathIdx: 0,
  wptGx: null, wptGy: null,
  score: 0,
  // Seeded after mount so reset can reuse the same baseline state.
  targets: [],
}

const SPEED = 2.8
const TURN  = 0.09

// Canvas draw colors — hex for max browser compat with canvas 2d
const C = {
  bg:         '#0d0e10',
  grid:       'rgba(255,255,255,0.032)',
  obstFill:   '#1c1808',
  obstStroke: '#a86018',
  obstCross:  'rgba(168,96,24,0.28)',
  robot:      '#00cec0',
  robotGlow:  'rgba(0,206,192,0.45)',
  lidarFill:  'rgba(0,206,192,0.10)',
  lidarEdge:  'rgba(0,206,192,0.22)',
  path:       'rgba(0,206,192,0.18)',
  wpt:        'rgba(0,206,192,0.55)',
  coord:      'rgba(0,206,192,0.55)',
  scanline:   'rgba(0,0,0,0.07)',
  target:     '#c97d20',
  targetGlow: 'rgba(201,125,32,0.5)',
  targetFill: 'rgba(201,125,32,0.12)',
}

// ── Component ─────────────────────────────────────────────────────────────────
export function RoboGame({ className }: { className?: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const gsRef        = useRef<GameState>({ ...INITIAL_STATE })
  const keysRef      = useRef(new Set<string>())
  const rafRef       = useRef(0)
  const reduceMotion = useReducedMotion()

  const [tele, setTele] = useState({
    gx: 1, gy: 1, hdg: 0, spd: 0,
    mode: 'IDLE' as Mode, nodes: 0, score: 0,
  })
  const [log, setLog] = useState<string[]>([
    '> sys init ok',
    '> robot online',
    '> select a mode',
  ])

  const pushLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-7), `> ${msg}`])
  }, [])

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback((s: GameState) => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const W = COLS * CELL, H = ROWS * CELL

    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = C.grid
    ctx.lineWidth = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke()
    }

    // Obstacles
    for (const k of OBSTACLE_KEYS) {
      const [gx, gy] = k.split(',').map(Number)
      const px = gx * CELL, py = gy * CELL
      ctx.fillStyle = C.obstFill
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2)
      ctx.strokeStyle = C.obstStroke
      ctx.lineWidth = 0.8
      ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4)
      ctx.strokeStyle = C.obstCross
      ctx.beginPath()
      ctx.moveTo(px + 5, py + 5); ctx.lineTo(px + CELL - 5, py + CELL - 5)
      ctx.moveTo(px + CELL - 5, py + 5); ctx.lineTo(px + 5, py + CELL - 5)
      ctx.stroke()
    }

    // Waypoint marker
    if (s.wptGx !== null && s.wptGy !== null) {
      const wx = s.wptGx * CELL + CELL / 2
      const wy = s.wptGy * CELL + CELL / 2
      ctx.strokeStyle = C.wpt
      ctx.lineWidth = 1.2
      ctx.setLineDash([2, 3])
      ctx.beginPath(); ctx.arc(wx, wy, 10, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(wx - 8, wy); ctx.lineTo(wx + 8, wy)
      ctx.moveTo(wx, wy - 8); ctx.lineTo(wx, wy + 8)
      ctx.stroke()
    }

    // Planned path
    if (s.path.length > 0 && s.pathIdx < s.path.length) {
      ctx.strokeStyle = C.path
      ctx.lineWidth = 1.5
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      for (let i = s.pathIdx; i < s.path.length; i++) {
        const [gx, gy] = s.path[i]
        ctx.lineTo(gx * CELL + CELL / 2, gy * CELL + CELL / 2)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Collectible targets — amber diamonds
    for (const [tgx, tgy] of s.targets) {
      const tx = tgx * CELL + CELL / 2, ty = tgy * CELL + CELL / 2
      const d = CELL * 0.28
      ctx.save()
      ctx.translate(tx, ty)
      ctx.rotate(Math.PI / 4)
      ctx.shadowBlur = 10
      ctx.shadowColor = C.targetGlow
      ctx.fillStyle = C.targetFill
      ctx.fillRect(-d, -d, d * 2, d * 2)
      ctx.strokeStyle = C.target
      ctx.lineWidth = 1.2
      ctx.strokeRect(-d, -d, d * 2, d * 2)
      ctx.shadowBlur = 0
      ctx.restore()
      // small centre dot
      ctx.fillStyle = C.target
      ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI * 2); ctx.fill()
    }

    // LIDAR fan
    const lidarR   = CELL * 4.5
    const halfArc  = Math.PI * 0.6
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.angle)
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, lidarR)
    grad.addColorStop(0, C.lidarFill)
    grad.addColorStop(1, 'rgba(0,206,192,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, lidarR, -halfArc, halfArc); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = C.lidarEdge
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.arc(0, 0, lidarR, -halfArc, halfArc); ctx.stroke()
    ctx.restore()

    // Robot body
    const R = CELL * 0.4
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(s.angle)
    ctx.shadowBlur = 14
    ctx.shadowColor = C.robotGlow
    ctx.fillStyle = C.robot
    ctx.beginPath()
    ctx.moveTo(R, 0)
    ctx.lineTo(-R * 0.65, -R * 0.6)
    ctx.lineTo(-R * 0.3, 0)
    ctx.lineTo(-R * 0.65, R * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = C.bg
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.restore()

    // Grid-coord label under robot
    const lgx = Math.floor(s.x / CELL), lgy = Math.floor(s.y / CELL)
    ctx.fillStyle = C.coord
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${lgx},${lgy}`, s.x, s.y + R + 12)
    ctx.textAlign = 'left'

    // Scanline overlay
    for (let y = 0; y < H; y += 2) {
      ctx.fillStyle = C.scanline
      ctx.fillRect(0, y, W, 1)
    }
  }, [])

  // ── Game tick ──────────────────────────────────────────────────────────────
  const tick = useCallback(function tickFrame() {
    const s = gsRef.current
    const k = keysRef.current

    if (s.mode === 'MANUAL') {
      if (k.has('a') || k.has('A') || k.has('ArrowLeft'))  s.angle -= TURN
      if (k.has('d') || k.has('D') || k.has('ArrowRight')) s.angle += TURN
      const spd = (k.has('w') || k.has('W') || k.has('ArrowUp'))   ? SPEED
                : (k.has('s') || k.has('S') || k.has('ArrowDown'))  ? -SPEED * 0.5
                : 0
      if (spd !== 0) {
        const nx = s.x + Math.cos(s.angle) * spd
        const ny = s.y + Math.sin(s.angle) * spd
        if (!isWall(Math.floor(nx / CELL), Math.floor(ny / CELL))) {
          s.x = Math.max(CELL * 0.5, Math.min(COLS * CELL - CELL * 0.5, nx))
          s.y = Math.max(CELL * 0.5, Math.min(ROWS * CELL - CELL * 0.5, ny))
        }
      }
      s.speed = Math.abs(spd)
    }

    if (s.mode === 'AUTO' && s.path.length > 0 && s.pathIdx < s.path.length) {
      const [tgx, tgy] = s.path[s.pathIdx]
      const tx = tgx * CELL + CELL / 2, ty = tgy * CELL + CELL / 2
      const dx = tx - s.x, dy = ty - s.y
      if (Math.hypot(dx, dy) < CELL * 0.35) {
        s.pathIdx++
        if (s.pathIdx >= s.path.length) {
          s.speed = 0; s.path = []; s.pathIdx = 0
          s.wptGx = null; s.wptGy = null
          s.score++
          pushLog(`waypoint reached · score ${s.score}`)
        }
      } else {
        let da = Math.atan2(dy, dx) - s.angle
        while (da > Math.PI)  da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        const absDA = Math.abs(da)
        s.angle += Math.sign(da) * Math.min(TURN * 2, absDA)
        if (absDA < Math.PI * 0.45) {
          s.x += Math.cos(s.angle) * SPEED
          s.y += Math.sin(s.angle) * SPEED
          s.speed = SPEED
        } else {
          // rotate in place — don't move forward
          s.speed = 0
        }
      }
    }

    // Target collection — works in any active mode
    if (s.mode !== 'IDLE') {
      for (let i = s.targets.length - 1; i >= 0; i--) {
        const [tgx, tgy] = s.targets[i]
        const tx = tgx * CELL + CELL / 2, ty = tgy * CELL + CELL / 2
        if (Math.hypot(s.x - tx, s.y - ty) < COLLECT_DIST) {
          s.targets.splice(i, 1)
          s.score++
          const fresh = randomOpenCell(s.targets)
          s.targets.push(fresh)
          pushLog(`collected · score ${s.score}`)
        }
      }
    }

    draw(s)
    rafRef.current = requestAnimationFrame(tickFrame)
  }, [draw, pushLog])

  // Seed initial targets once on mount
  useEffect(() => {
    const targets: [number, number][] = []
    for (let i = 0; i < TARGET_COUNT; i++) targets.push(randomOpenCell(targets))
    gsRef.current.targets = targets
  }, [])

  useEffect(() => {
    if (reduceMotion) { draw(gsRef.current); return }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick, draw, reduceMotion])

  // Telemetry — throttled to avoid over-rendering the sidebar
  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => {
      const s = gsRef.current
      setTele({
        gx:    Math.floor(s.x / CELL),
        gy:    Math.floor(s.y / CELL),
        hdg:   Math.round((s.angle * 180 / Math.PI + 360) % 360),
        spd:   Math.round(s.speed * 10) / 10,
        mode:  s.mode,
        nodes: s.path.length - s.pathIdx,
        score: s.score,
      })
    }, 100)
    return () => clearInterval(id)
  }, [reduceMotion])

  // Keyboard
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
    }
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key)
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  const setMode = useCallback((m: Mode) => {
    const s = gsRef.current
    s.mode = m; s.path = []; s.pathIdx = 0; s.wptGx = null; s.wptGy = null
    pushLog(m === 'MANUAL' ? 'manual override' : m === 'AUTO' ? 'auto · click to set waypoint' : 'standby')
  }, [pushLog])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = gsRef.current
    if (s.mode !== 'AUTO') return
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const gx = Math.floor((e.clientX - r.left) / CELL)
    const gy = Math.floor((e.clientY - r.top)  / CELL)
    if (isWall(gx, gy)) { pushLog('blocked — pick open cell'); return }
    const path = aStar(Math.floor(s.x / CELL), Math.floor(s.y / CELL), gx, gy)
    if (!path.length) { pushLog('no path found'); return }
    s.path = path; s.pathIdx = 0; s.wptGx = gx; s.wptGy = gy
    pushLog(`routing [${gx},${gy}] · ${path.length} nodes`)
  }, [pushLog])

  const randomWaypoint = useCallback(() => {
    const s = gsRef.current
    if (s.mode !== 'AUTO') return
    for (let i = 0; i < 60; i++) {
      const gx = Math.floor(Math.random() * COLS)
      const gy = Math.floor(Math.random() * ROWS)
      if (isWall(gx, gy)) continue
      const path = aStar(Math.floor(s.x / CELL), Math.floor(s.y / CELL), gx, gy)
      if (!path.length) continue
      s.path = path; s.pathIdx = 0; s.wptGx = gx; s.wptGy = gy
      pushLog(`random route [${gx},${gy}] · ${path.length} nodes`)
      return
    }
    pushLog('no random route found')
  }, [pushLog])

  const reset = useCallback(() => {
    const targets: [number, number][] = []
    for (let i = 0; i < TARGET_COUNT; i++) targets.push(randomOpenCell(targets))
    Object.assign(gsRef.current, { ...INITIAL_STATE, targets })
    pushLog('robot reset · targets respawned')
  }, [pushLog])

  const modeColor =
    tele.mode === 'MANUAL' ? 'text-[oklch(0.80_0.13_65)]' :
    tele.mode === 'AUTO'   ? 'text-primary' :
    'text-muted-foreground/50'

  const modeDot =
    tele.mode === 'MANUAL' ? 'bg-[oklch(0.80_0.13_65)] shadow-[0_0_6px_oklch(0.80_0.13_65)]' :
    tele.mode === 'AUTO'   ? 'bg-primary shadow-[0_0_6px_oklch(0.78_0.16_195)]' :
    'bg-muted-foreground/40'

  return (
    <div className={cn('border border-border/60 bg-foreground/[0.012] overflow-hidden', className)}>

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground/80">nav_sim</span>
          <span className="text-border">·</span>
          <span className={cn('flex items-center gap-1.5', modeColor)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', modeDot)} />
            {tele.mode}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground/50">
            score{' '}
            <span className="num text-primary">{tele.score.toString().padStart(2, '0')}</span>
          </span>
          <button
            onClick={reset}
            className="border border-border/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 transition-colors hover:border-border/70 hover:text-muted-foreground"
          >
            reset
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row">

        {/* Game canvas */}
        <div className="overflow-auto">
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            onClick={handleClick}
            className={cn('block', tele.mode === 'AUTO' ? 'cursor-crosshair' : 'cursor-default')}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col border-t border-border/40 xl:min-w-[200px] xl:max-w-[220px] xl:border-t-0 xl:border-l">

          {/* Telemetry */}
          <div className="border-b border-border/40 p-4 font-mono text-[10px] uppercase tracking-[0.15em]">
            <div className="mb-3 text-muted-foreground/45">telemetry</div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <dt className="text-muted-foreground/50">pos</dt>
              <dd className="num text-foreground/75">[{tele.gx},{tele.gy}]</dd>
              <dt className="text-muted-foreground/50">hdg</dt>
              <dd className="num text-foreground/75">{tele.hdg}°</dd>
              <dt className="text-muted-foreground/50">spd</dt>
              <dd className="num text-foreground/75">{tele.spd}</dd>
              <dt className="text-muted-foreground/50">nodes</dt>
              <dd className="num text-foreground/75">{tele.nodes}</dd>
            </dl>
          </div>

          {/* Mode controls */}
          <div className="border-b border-border/40 p-4">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/45">mode</div>
            <div className="flex flex-col gap-2">
              {(['MANUAL', 'AUTO'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'border px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] transition-all',
                    tele.mode === m
                      ? m === 'MANUAL'
                        ? 'border-[oklch(0.80_0.13_65/0.7)] bg-[oklch(0.80_0.13_65/0.06)] text-[oklch(0.80_0.13_65)]'
                        : 'border-primary/70 bg-primary/5 text-primary'
                      : 'border-border/40 text-muted-foreground/55 hover:border-border/70 hover:text-muted-foreground',
                  )}
                >
                  {m}
                </button>
              ))}
              {tele.mode === 'AUTO' && (
                <button
                  onClick={randomWaypoint}
                  className="border border-border/40 px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 transition-all hover:border-primary/40 hover:text-primary"
                >
                  random
                </button>
              )}
            </div>
            <p className="mt-3 font-mono text-[9px] normal-case leading-relaxed tracking-normal text-muted-foreground/35">
              {tele.mode === 'MANUAL' ? 'WASD / arrows to drive'
               : tele.mode === 'AUTO' ? 'click grid to set waypoint'
               : 'select a mode above'}
            </p>
          </div>

          {/* Log */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/45">log</div>
            <div className="space-y-1 font-mono text-[9px] leading-relaxed">
              {log.map((line, i) => (
                <div key={i} className={i === log.length - 1 ? 'text-primary/80' : 'text-muted-foreground/35'}>
                  {line}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
