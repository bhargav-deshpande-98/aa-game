// Game state types
export type GameState = 'idle' | 'playing' | 'gameover' | 'levelComplete'

// Game configuration
export interface GameConfig {
  width: number
  height: number
  centerX: number
  centerY: number
  circleRadius: number
  pinLength: number
  pinRadius: number
  pinSpeed: number
  baseRotationSpeed: number
  maxRotationSpeed: number
}

// Level configuration
export interface Level {
  levelNum: number
  startingPins: number
  pinsToPlace: number
  rotationSpeed: number
  directionChanges: number
  speedChanges: number
  startingAngles: number[]
}

// Flying pin
export interface FlyingPin {
  x: number
  y: number
}

// Particle for effects
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
}

// Complete game state
export interface GameData {
  state: GameState
  config: GameConfig
  level: Level
  rotation: number
  rotationDirection: number
  rotationSpeed: number
  attachedPins: number[] // Angles of attached pins relative to rotation
  flyingPin: FlyingPin | null
  pinsRemaining: number
  particles: Particle[]
  directionChangeTimer: number
  speedChangeTimer: number
  levelCompleteTimer: number
}
