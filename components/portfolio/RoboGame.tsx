'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { drawScene, type DrawConfig } from '@/lib/robo-game/draw'
import { CELL, COLS, OBSTACLE_KEYS, ROWS, isWall, randomOpenCell } from '@/lib/robo-game/grid'
import { aStar } from '@/lib/robo-game/pathfinding'
import { COLLECT_DIST, INITIAL_STATE, SPEED, TARGET_COUNT, TURN, type GameState, type Mode } from '@/lib/robo-game/types'

// Canvas draw colors — hex for max browser compat with canvas 2d
const C = {
  bg: '#0d0e10', grid: 'rgba(255,255,255,0.032)',
  obstFill: '#1c1808', obstStroke: '#a86018', obstCross: 'rgba(168,96,24,0.28)',
  robot: '#00cec0', robotGlow: 'rgba(0,206,192,0.45)',
  lidarFill: 'rgba(0,206,192,0.10)', lidarEdge: 'rgba(0,206,192,0.22)',
  path: 'rgba(0,206,192,0.18)', wpt: 'rgba(0,206,192,0.55)', coord: 'rgba(0,206,192,0.55)',
  scanline: 'rgba(0,0,0,0.07)', target: '#c97d20', targetGlow: 'rgba(201,125,32,0.5)',
  targetFill: 'rgba(201,125,32,0.12)',
}

const DRAW_CONFIG: DrawConfig = { COLS, ROWS, CELL, OBSTACLE_KEYS, C }

export function RoboGame({ className }: { className?: string }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const gsRef        = useRef<GameState>({ ...INITIAL_STATE })
  const keysRef      = useRef(new Set<string>())
  const rafRef       = useRef(0)
  const reduceMotion = useReducedMotion()

  const [tele, setTele] = useState({ gx: 1, gy: 1, hdg: 0, spd: 0, mode: 'IDLE' as Mode, nodes: 0, score: 0 })
  const [log, setLog] = useState<string[]>(['> sys init ok', '> robot online', '> select a mode'])

  const pushLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-7), `> ${msg}`])
  }, [])

  const draw = useCallback((s: GameState) => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    drawScene(ctx, s, DRAW_CONFIG)
  }, [])

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
          s.speed = 0
        }
      }
    }

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
    const path = aStar(Math.floor(s.x / CELL), Math.floor(s.y / CELL), gx, gy, isWall)
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
      const path = aStar(Math.floor(s.x / CELL), Math.floor(s.y / CELL), gx, gy, isWall)
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

  const modeColor = tele.mode === 'MANUAL' ? 'text-[oklch(0.80_0.13_65)]' : tele.mode === 'AUTO' ? 'text-primary' : 'text-muted-foreground/50'
  const modeDot = tele.mode === 'MANUAL' ? 'bg-[oklch(0.80_0.13_65)] shadow-[0_0_6px_oklch(0.80_0.13_65)]' : tele.mode === 'AUTO' ? 'bg-primary shadow-[0_0_6px_oklch(0.78_0.16_195)]' : 'bg-muted-foreground/40'

  return (
    <div className={cn('border border-border/60 bg-foreground/[0.012] overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
          <span className="text-muted-foreground/40">/</span><span className="text-muted-foreground/80">nav_sim</span><span className="text-border">·</span>
          <span className={cn('flex items-center gap-1.5', modeColor)}><span className={cn('h-1.5 w-1.5 rounded-full', modeDot)} />{tele.mode}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground/50">score{' '}<span className="num text-primary">{tele.score.toString().padStart(2, '0')}</span></span>
          <button onClick={reset} className="border border-border/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 transition-colors hover:border-border/70 hover:text-muted-foreground">reset</button>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row">
        <div className="overflow-auto">
          <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} onClick={handleClick} className={cn('block', tele.mode === 'AUTO' ? 'cursor-crosshair' : 'cursor-default')} />
        </div>
        <div className="flex flex-col border-t border-border/40 xl:min-w-[200px] xl:max-w-[220px] xl:border-t-0 xl:border-l">
          <div className="border-b border-border/40 p-4 font-mono text-[10px] uppercase tracking-[0.15em]">
            <div className="mb-3 text-muted-foreground/45">telemetry</div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <dt className="text-muted-foreground/50">pos</dt><dd className="num text-foreground/75">[{tele.gx},{tele.gy}]</dd>
              <dt className="text-muted-foreground/50">hdg</dt><dd className="num text-foreground/75">{tele.hdg}°</dd>
              <dt className="text-muted-foreground/50">spd</dt><dd className="num text-foreground/75">{tele.spd}</dd>
              <dt className="text-muted-foreground/50">nodes</dt><dd className="num text-foreground/75">{tele.nodes}</dd>
            </dl>
          </div>
          <div className="border-b border-border/40 p-4">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/45">mode</div>
            <div className="flex flex-col gap-2">
              {(['MANUAL', 'AUTO'] as Mode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className={cn('border px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] transition-all', tele.mode === m ? m === 'MANUAL' ? 'border-[oklch(0.80_0.13_65/0.7)] bg-[oklch(0.80_0.13_65/0.06)] text-[oklch(0.80_0.13_65)]' : 'border-primary/70 bg-primary/5 text-primary' : 'border-border/40 text-muted-foreground/55 hover:border-border/70 hover:text-muted-foreground')}>{m}</button>
              ))}
              {tele.mode === 'AUTO' && <button onClick={randomWaypoint} className="border border-border/40 px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/55 transition-all hover:border-primary/40 hover:text-primary">random</button>}
            </div>
            <p className="mt-3 font-mono text-[9px] normal-case leading-relaxed tracking-normal text-muted-foreground/35">
              {tele.mode === 'MANUAL' ? 'WASD / arrows to drive' : tele.mode === 'AUTO' ? 'click grid to set waypoint' : 'select a mode above'}
            </p>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/45">log</div>
            <div className="space-y-1 font-mono text-[9px] leading-relaxed">
              {log.map((line, i) => <div key={i} className={i === log.length - 1 ? 'text-primary/80' : 'text-muted-foreground/35'}>{line}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
