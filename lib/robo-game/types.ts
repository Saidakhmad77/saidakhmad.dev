import { CELL } from './grid'

export type Mode = 'IDLE' | 'MANUAL' | 'AUTO'

export interface GameState {
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

export const TARGET_COUNT  = 4
export const COLLECT_DIST  = CELL * 0.65   // pixels — how close to collect

export const INITIAL_STATE: GameState = {
  x: CELL * 1.5, y: CELL * 1.5,
  angle: 0, speed: 0,
  mode: 'IDLE',
  path: [], pathIdx: 0,
  wptGx: null, wptGy: null,
  score: 0,
  targets: [],
}

export const SPEED = 2.8
export const TURN  = 0.09
