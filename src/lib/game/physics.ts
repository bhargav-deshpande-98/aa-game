import type { GameConfig, FlyingPin } from './types'

// Normalize angle to [0, 2π)
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2
  while (angle >= Math.PI * 2) angle -= Math.PI * 2
  return angle
}

// Calculate angular distance between two angles
export function angularDistance(a1: number, a2: number): number {
  const diff = Math.abs(normalizeAngle(a1) - normalizeAngle(a2))
  return Math.min(diff, Math.PI * 2 - diff)
}

// Update flying pin position
export function updateFlyingPin(
  pin: FlyingPin,
  config: GameConfig,
  deltaTime: number
): FlyingPin {
  const dt = deltaTime / 16.67
  return {
    ...pin,
    y: pin.y - config.pinSpeed * dt,
  }
}

// Check if flying pin has reached the circle
export function hasReachedCircle(
  pin: FlyingPin,
  config: GameConfig
): boolean {
  const distToCenter = Math.sqrt(
    Math.pow(pin.x - config.centerX, 2) +
    Math.pow(pin.y - config.centerY, 2)
  )
  return distToCenter <= config.circleRadius + config.pinLength * 0.5
}

// Calculate attachment angle for a pin
export function calculateAttachmentAngle(
  pin: FlyingPin,
  config: GameConfig,
  currentRotation: number
): number {
  const attachAngle = Math.atan2(
    pin.y - config.centerY,
    pin.x - config.centerX
  )
  // Convert to relative angle (subtract current rotation)
  return normalizeAngle(attachAngle - currentRotation)
}

// Check collision with existing pins
export function checkPinCollision(
  newPinAngle: number,
  existingPins: number[],
  config: GameConfig
): boolean {
  // Minimum angular distance between pins (based on pin head size)
  const minAngularDist = (config.pinRadius * 2.5) / (config.circleRadius + config.pinLength)
  
  for (const existingAngle of existingPins) {
    if (angularDistance(newPinAngle, existingAngle) < minAngularDist) {
      return true
    }
  }
  return false
}

// Get position of an attached pin
export function getAttachedPinPosition(
  angle: number,
  rotation: number,
  config: GameConfig
): { startX: number; startY: number; endX: number; endY: number } {
  const totalAngle = angle + rotation
  const startX = config.centerX + Math.cos(totalAngle) * config.circleRadius
  const startY = config.centerY + Math.sin(totalAngle) * config.circleRadius
  const endX = config.centerX + Math.cos(totalAngle) * (config.circleRadius + config.pinLength)
  const endY = config.centerY + Math.sin(totalAngle) * (config.circleRadius + config.pinLength)
  
  return { startX, startY, endX, endY }
}
