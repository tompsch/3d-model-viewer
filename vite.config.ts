import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/',
  // build: {
  //   // Importante para Three.js: evita que Vite intente procesar o inlinear archivos pequeños
  //   assetsInlineLimit: 0 
  // }
})
