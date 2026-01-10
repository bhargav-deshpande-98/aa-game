import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type GameData,
  type GameState,
  createGameConfig,
  generateLevel,
  hasReachedCircle,
  calculateAttachmentAngle,
  checkPinCollision,
  updateParticles,
  createCollisionParticles,
  createSuccessParticles,
  renderGame,
  playShootSound,
  playAttachSound,
  playFailSound,
  playWinSound,
  initAudio,
} from '@/lib/game'

// Flutter Bridge type definition
declare global {
  interface Window {
    FlutterBridge?: {
      postMessage: (message: string) => void
    }
  }
}

const STORAGE_KEY = 'aa-game-level'
const HIGH_SCORE_KEY = 'aa-game-highscore'

function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '1', 10)
  } catch {
    return 1
  }
}

function saveHighScore(level: number) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, level.toString())
  } catch {
    // Storage not available
  }
}

function loadLevel(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseInt(saved, 10) : 1
  } catch {
    return 1
  }
}

function saveLevel(level: number) {
  try {
    localStorage.setItem(STORAGE_KEY, level.toString())
  } catch {
    // Storage not available
  }
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 360, height: 640 })
  const gameRef = useRef<GameData | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  
  // Initialize game state
  const initGame = useCallback((width: number, height: number, levelNum: number = 1): GameData => {
    const config = createGameConfig(width, height)
    const level = generateLevel(levelNum)
    
    return {
      state: 'idle',
      config,
      level,
      rotation: 0,
      rotationDirection: 1,
      rotationSpeed: level.rotationSpeed,
      attachedPins: [...level.startingAngles],
      flyingPin: null,
      pinsRemaining: level.pinsToPlace,
      particles: [],
      directionChangeTimer: 0,
      speedChangeTimer: 0,
      levelCompleteTimer: 0,
    }
  }, [])
  
  // Shoot a pin
  const shootPin = useCallback(() => {
    if (!gameRef.current) return
    const game = gameRef.current
    
    if (game.state !== 'playing' || game.flyingPin || game.pinsRemaining <= 0) return
    
    playShootSound()
    game.flyingPin = {
      x: game.config.centerX,
      y: game.config.height - 100,
    }
  }, [])
  
  // Handle tap/click
  const handleTap = useCallback(() => {
    if (!gameRef.current) return
    const game = gameRef.current
    
    initAudio()
    
    if (game.state === 'idle') {
      game.state = 'playing'
      shootPin()
    } else if (game.state === 'playing') {
      shootPin()
    } else if (game.state === 'gameover') {
      // Restart from level 1
      const { width, height } = game.config
      gameRef.current = initGame(width, height, 1)
      saveLevel(1)
    }
  }, [initGame, shootPin])
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    // Calculate delta time
    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16.67
    lastTimeRef.current = timestamp
    const dt = deltaTime / 16.67
    
    const game = gameRef.current
    
    // Update game state
    if (game.state === 'playing') {
      // Update rotation
      game.rotation += game.rotationSpeed * game.rotationDirection * dt
      
      // Direction changes (for higher levels)
      if (game.level.directionChanges > 0) {
        game.directionChangeTimer += deltaTime
        if (game.directionChangeTimer > 3000 / game.level.directionChanges) {
          game.rotationDirection *= -1
          game.directionChangeTimer = 0
        }
      }
      
      // Speed changes (for higher levels)
      if (game.level.speedChanges > 0) {
        game.speedChangeTimer += deltaTime
        if (game.speedChangeTimer > 2000 / game.level.speedChanges) {
          game.rotationSpeed = game.level.rotationSpeed * (0.5 + Math.random())
          game.speedChangeTimer = 0
        }
      }
      
      // Update flying pin
      if (game.flyingPin) {
        game.flyingPin.y -= game.config.pinSpeed * dt
        
        // Check if pin reached the circle
        if (hasReachedCircle(game.flyingPin, game.config)) {
          // Calculate attachment angle
          const relativeAngle = calculateAttachmentAngle(
            game.flyingPin,
            game.config,
            game.rotation
          )
          
          // Check collision with existing pins
          if (checkPinCollision(relativeAngle, game.attachedPins, game.config)) {
            // Collision! Game over
            game.state = 'gameover'
            game.particles = createCollisionParticles(game.flyingPin.x, game.flyingPin.y)
            playFailSound()

            // Update high score and notify Flutter app
            const currentLevel = game.level.levelNum
            const highScore = loadHighScore()
            if (currentLevel > highScore) {
              saveHighScore(currentLevel)
            }

            if (window.FlutterBridge) {
              window.FlutterBridge.postMessage(JSON.stringify({
                event: 'gameEnd',
                score: currentLevel,
                highScore: Math.max(currentLevel, highScore)
              }))
            }
          } else {
            // Successfully attached
            game.attachedPins.push(relativeAngle)
            game.pinsRemaining--
            playAttachSound()
            
            if (game.pinsRemaining <= 0) {
              // Level complete!
              game.state = 'levelComplete'
              game.particles = createSuccessParticles(
                game.config.centerX,
                game.config.centerY,
                game.config.circleRadius
              )
              playWinSound()
              game.levelCompleteTimer = 0
              saveLevel(game.level.levelNum + 1)
            }
          }
          
          game.flyingPin = null
        }
      }
    }
    
    // Handle level complete transition
    if (game.state === 'levelComplete') {
      game.levelCompleteTimer += deltaTime
      game.rotation += game.rotationSpeed * dt // Keep rotating during celebration
      
      if (game.levelCompleteTimer > 1500) {
        // Advance to next level
        const nextLevel = game.level.levelNum + 1
        const { width, height } = game.config
        gameRef.current = initGame(width, height, nextLevel)
        gameRef.current.state = 'playing'
      }
    }
    
    // Update particles
    game.particles = updateParticles(game.particles, deltaTime)
    
    // Render
    renderGame(ctx, game)
    
    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [canvasRef, initGame])
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth, 400)
      const height = Math.min(window.innerHeight, 700)
      setDimensions({ width, height })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Initialize game
  useEffect(() => {
    const savedLevel = loadLevel()
    gameRef.current = initGame(dimensions.width, dimensions.height, savedLevel)
  }, [dimensions, initGame])
  
  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])
  
  // Return current state for UI
  const getState = useCallback((): GameState => {
    return gameRef.current?.state || 'idle'
  }, [])
  
  const getLevel = useCallback((): number => {
    return gameRef.current?.level.levelNum || 1
  }, [])
  
  return {
    dimensions,
    handleTap,
    getState,
    getLevel,
  }
}
