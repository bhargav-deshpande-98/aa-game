import type { GameConfig, Level } from './types'

// Create game configuration based on screen size
export const createGameConfig = (width: number, height: number): GameConfig => {
  const scale = Math.min(width / 400, height / 700)
  
  return {
    width,
    height,
    centerX: width / 2,
    centerY: height * 0.4,
    circleRadius: 70 * scale,
    pinLength: 35 * scale,
    pinRadius: 8 * scale,
    pinSpeed: 12 * scale,
    baseRotationSpeed: 0.025,
    maxRotationSpeed: 0.12,
  }
}

// Generate level configuration
export const generateLevel = (levelNum: number): Level => {
  // Starting pins increases with level
  const startingPins = Math.min(Math.floor(levelNum / 3) + 1, 8)
  // Pins to place increases faster with level (starts at 5, grows quicker)
  const pinsToPlace = Math.min(5 + Math.floor(levelNum * 0.8), 20)
  // Rotation speed increases faster (starts at 0.025, grows to max 0.12)
  const rotationSpeed = Math.min(0.025 + (levelNum * 0.005), 0.12)
  // Direction changes
  const directionChanges = levelNum > 5 ? Math.floor((levelNum - 5) / 4) : 0
  // Speed changes
  const speedChanges = levelNum > 10 ? Math.floor((levelNum - 10) / 5) : 0
  
  // Generate starting pin angles (evenly distributed with some randomness)
  const startingAngles: number[] = []
  if (startingPins > 0) {
    const baseSpacing = (Math.PI * 2) / startingPins
    for (let i = 0; i < startingPins; i++) {
      const angle = i * baseSpacing + (Math.random() * 0.3 - 0.15)
      startingAngles.push(angle)
    }
  }
  
  return {
    levelNum,
    startingPins,
    pinsToPlace,
    rotationSpeed,
    directionChanges,
    speedChanges,
    startingAngles,
  }
}

// Colors
export const COLORS = {
  // Background
  background: '#1a1a2e',
  
  // Circle
  circle: '#16213e',
  circleStroke: '#0f3460',
  
  // Pins
  pin: '#e94560',
  pinAttached: '#ffffff',
  
  // UI
  text: '#ffffff',
  textShadow: '#e94560',
  success: '#00ff88',
  
  // Effects
  needle: '#e94560',
}

// Sound configurations
export const SOUNDS = {
  shoot: { frequency: 600, duration: 0.1, type: 'sine' as OscillatorType },
  attach: { frequency: 800, duration: 0.15, type: 'sine' as OscillatorType },
  fail: { frequency: 200, duration: 0.3, type: 'sawtooth' as OscillatorType },
  win: { frequency: 523, duration: 0.1, type: 'sine' as OscillatorType },
}
