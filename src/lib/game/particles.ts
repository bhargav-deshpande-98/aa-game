import type { Particle } from './types'
import { COLORS } from './constants'

// Create collision particles
export function createCollisionParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3
    const speed = 2 + Math.random() * 4
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      alpha: 1,
      color: Math.random() > 0.5 ? COLORS.pin : '#ffffff',
    })
  }
  
  return particles
}

// Create success/celebration particles
export function createSuccessParticles(
  centerX: number,
  centerY: number,
  radius: number
): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 30; i++) {
    const angle = (Math.PI * 2 * i) / 30
    const speed = 3 + Math.random() * 3
    
    particles.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      alpha: 1,
      color: COLORS.success,
    })
  }
  
  return particles
}

// Update all particles
export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  const dt = deltaTime / 16.67
  
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 0.1 * dt, // gravity
      alpha: p.alpha - 0.02 * dt,
    }))
    .filter(p => p.alpha > 0)
}
