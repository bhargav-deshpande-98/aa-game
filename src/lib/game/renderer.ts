import type { GameData, GameConfig, Particle } from './types'
import { COLORS } from './constants'
import { getAttachedPinPosition } from './physics'

// Draw the background with subtle grid
export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)
  
  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  const gridSize = 30
  
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// Draw the central circle
export function drawCircle(ctx: CanvasRenderingContext2D, config: GameConfig) {
  // Outer glow
  ctx.shadowColor = COLORS.circleStroke
  ctx.shadowBlur = 20
  
  // Main circle
  ctx.fillStyle = COLORS.circle
  ctx.strokeStyle = COLORS.circleStroke
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(config.centerX, config.centerY, config.circleRadius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  
  ctx.shadowBlur = 0
}

// Draw attached pins
export function drawAttachedPins(
  ctx: CanvasRenderingContext2D,
  pins: number[],
  rotation: number,
  config: GameConfig
) {
  pins.forEach(pinAngle => {
    const { startX, startY, endX, endY } = getAttachedPinPosition(pinAngle, rotation, config)
    
    // Pin line
    ctx.strokeStyle = COLORS.pinAttached
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    
    // Pin head
    ctx.fillStyle = COLORS.pinAttached
    ctx.beginPath()
    ctx.arc(endX, endY, config.pinRadius, 0, Math.PI * 2)
    ctx.fill()
  })
}

// Draw flying pin
export function drawFlyingPin(
  ctx: CanvasRenderingContext2D,
  pin: { x: number; y: number } | null,
  config: GameConfig
) {
  if (!pin) return
  
  // Glow effect
  ctx.shadowColor = COLORS.pin
  ctx.shadowBlur = 10
  
  // Pin line
  ctx.strokeStyle = COLORS.pin
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(pin.x, pin.y)
  ctx.lineTo(pin.x, pin.y + config.pinLength)
  ctx.stroke()
  
  // Pin head
  ctx.fillStyle = COLORS.pin
  ctx.beginPath()
  ctx.arc(pin.x, pin.y, config.pinRadius, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.shadowBlur = 0
}

// Draw waiting pins indicator at bottom
export function drawWaitingPins(
  ctx: CanvasRenderingContext2D,
  count: number,
  config: GameConfig
) {
  const startY = config.height - 50
  const spacing = 20
  const startX = config.centerX - ((count - 1) * spacing) / 2
  
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = COLORS.pin
    ctx.beginPath()
    ctx.arc(startX + i * spacing, startY, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Draw particles
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

// Draw UI elements
export function drawUI(
  ctx: CanvasRenderingContext2D,
  state: GameData['state'],
  levelNum: number,
  pinsRemaining: number,
  config: GameConfig
) {
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Pins remaining in center of circle
  ctx.font = `bold ${Math.min(config.width * 0.12, 48)}px Arial`
  ctx.fillStyle = COLORS.text
  ctx.fillText(pinsRemaining.toString(), config.centerX, config.centerY)
  
  // Level indicator at top
  ctx.font = `bold ${Math.min(config.width * 0.05, 20)}px Arial`
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText(`LEVEL ${levelNum}`, config.centerX, 40)
  
  // State messages
  if (state === 'idle') {
    ctx.font = `bold ${Math.min(config.width * 0.05, 20)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('TAP TO START', config.centerX, config.height - 120)
  } else if (state === 'gameover') {
    ctx.font = `bold ${Math.min(config.width * 0.08, 32)}px Arial`
    ctx.fillStyle = COLORS.pin
    ctx.fillText('GAME OVER', config.centerX, config.height * 0.65)
    ctx.font = `bold ${Math.min(config.width * 0.05, 20)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('TAP TO RESTART', config.centerX, config.height * 0.72)
  } else if (state === 'levelComplete') {
    ctx.font = `bold ${Math.min(config.width * 0.08, 32)}px Arial`
    ctx.fillStyle = COLORS.success
    ctx.fillText('PERFECT!', config.centerX, config.height * 0.65)
  }
  
  ctx.restore()
}

// Main render function
export function renderGame(ctx: CanvasRenderingContext2D, game: GameData) {
  const { config, state, level, rotation, attachedPins, flyingPin, pinsRemaining, particles } = game
  
  // Clear and draw background
  ctx.clearRect(0, 0, config.width, config.height)
  drawBackground(ctx, config.width, config.height)
  
  // Draw game elements
  drawCircle(ctx, config)
  drawAttachedPins(ctx, attachedPins, rotation, config)
  drawFlyingPin(ctx, flyingPin, config)
  drawWaitingPins(ctx, pinsRemaining, config)
  drawParticles(ctx, particles)
  
  // Draw UI
  drawUI(ctx, state, level.levelNum, pinsRemaining, config)
}
