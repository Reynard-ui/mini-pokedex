import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub repo name so GitHub Pages serves it at
// https://Reynard-ui.github.io/mini-pokedex/
export default defineConfig({
  base: '/mini-pokedex/',
  plugins: [react()],
})