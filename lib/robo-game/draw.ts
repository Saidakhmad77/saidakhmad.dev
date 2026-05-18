import type { GameState } from './types'

export interface DrawConfig {
  COLS: number
  ROWS: number
  CELL: number
  OBSTACLE_KEYS: Set<string>
  C: {
    bg: string
    grid: string
    obstFill: string
    obstStroke: string
    obstCross: string
    robot: string
    robotGlow: string
    lidarFill: string
    lidarEdge: string
    path: string
    wpt: string
    coord: string
    scanline: string
    target: string
    targetGlow: string
    targetFill: string
  }
}

export function drawScene(ctx: CanvasRenderingContext2D, state: GameState, config: DrawConfig): void {
  const s = state
  const { COLS, ROWS, CELL, OBSTACLE_KEYS, C } = config
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
}
