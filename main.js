import './style.css'
import { MatrixGrid } from "./src/matrix.js";
import { Draw } from './src/draw.js'
import { Settings } from './src/settings.js'

const container = document.querySelector('#app')
const animation = new MatrixGrid(container, {
  symbolColor: '#00d9ff',
  flashColor: '#FFFFFF',
  glowColor: '#00a6ff',
  symbolSize: 20,
  // symbolSpacing: 0.5,
  // symbol: 'き',
  // symbols: ['1', '0'],
  flashDuration: 400,
  // flashInterval: 600
})
const draw = new Draw(container, { type: 'rectangle' })
const settings = new Settings(container)

document.addEventListener('changeDrawType', (event) => {
  const { type } = event.detail
  draw.updateOptions({ type })
})