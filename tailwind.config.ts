import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1a1a2e',
          circle: '#16213e',
          stroke: '#0f3460',
          pin: '#e94560',
          success: '#00ff88',
        }
      },
    },
  },
  plugins: [],
} satisfies Config
