export type ANode = { x: number; y: number; g: number; f: number; parent: ANode | null }

export function aStar(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  isWall: (gx: number, gy: number) => boolean,
): [number, number][] {
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
