# aa Game Clone

A mobile-first clone of the popular "aa" game built with React, TypeScript, and HTML5 Canvas.

## Game Mechanics

- **Tap/Click** to shoot pins toward the rotating circle
- Pins attach to the circle when they reach it
- If your pin collides with an existing pin = **Game Over**
- Place all pins to complete the level

## Features

- 🎯 Precision-based timing gameplay
- 🔄 Rotating circle with dynamic speed and direction changes
- 📈 Progressive difficulty with 1000+ levels
- ✨ Particle effects for collisions and level completion
- 🔊 Sound effects for immersive gameplay
- 📱 Mobile-optimized touch controls
- 🎨 Clean, minimalist visual design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- HTML5 Canvas

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Controls

- **Mobile**: Tap anywhere to shoot a pin
- **Desktop**: Click anywhere or press Space to shoot

## Project Structure

```
src/
├── components/     # React components
│   ├── Game.tsx   # Main game component
│   └── ui/        # UI components
├── hooks/         # Custom React hooks
│   └── useGame.ts # Game logic hook
├── lib/           # Utilities and helpers
│   ├── game/      # Game engine modules
│   └── utils.ts   # General utilities
├── pages/         # Page components
└── App.tsx        # Root component
```

## Difficulty Progression

- **Levels 1-5**: Basic rotation, few starting pins
- **Levels 6-10**: Direction changes introduced
- **Levels 11+**: Speed variations added
- **Higher levels**: More pins to place, tighter spacing

## License

MIT
