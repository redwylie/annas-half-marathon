import { defineConfig, type Preset } from '@vite-pwa/assets-generator/config'

/**
 * Custom preset: our source SVG already includes the emerald rounded-square
 * background, so we want NO extra padding and a solid emerald fill behind
 * any transparent area. Without this, iOS adds a white box around the rabbit
 * when the icon is added to the home screen, because the asset generator's
 * default preset pads with white.
 */
const EMERALD = '#1D9E75'

const preset: Preset = {
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[48, 'favicon.ico']],
    padding: 0,
    resizeOptions: { background: EMERALD, fit: 'contain' },
  },
  maskable: {
    sizes: [512],
    padding: 0,
    resizeOptions: { background: EMERALD, fit: 'contain' },
  },
  apple: {
    sizes: [180],
    padding: 0,
    resizeOptions: { background: EMERALD, fit: 'contain' },
  },
}

export default defineConfig({
  preset,
  images: ['public/icon-source.svg'],
})
