export const COLS = 22
export const ROWS = 16
export const CELL = 30

// Warehouse-yard obstacle layout — crates + barriers
export const OBSTACLE_KEYS = new Set([
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

export function isWall(gx: number, gy: number): boolean {
  return gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS || OBSTACLE_KEYS.has(`${gx},${gy}`)
}

export function randomOpenCell(exclude?: [number, number][]): [number, number] {
  for (let i = 0; i < 200; i++) {
    const gx = 1 + Math.floor(Math.random() * (COLS - 2))
    const gy = 1 + Math.floor(Math.random() * (ROWS - 2))
    if (isWall(gx, gy)) continue
    if (exclude?.some(([ex, ey]) => ex === gx && ey === gy)) continue
    return [gx, gy]
  }
  return [5, 5]
}
