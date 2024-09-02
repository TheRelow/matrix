import './style.css'
import { MatrixGrid } from "./src/matrix.js";
import { Draw } from './src/draw.js'
import { Settings } from './src/settings.js'

const container = document.querySelector('#app')
const animation = new MatrixGrid(container, {
  symbolColor: '#00d9ff',
  flashColor: '#FFFFFF',
  glowColor: '#00a6ff',
  symbolSize: 192,
  symbolSpacing: 3,
  // symbol: 'き',
  // symbols: ['1', '0'],
  flashDuration: 200,
  flashInterval: 200
})
const draw = new Draw(container, { type: 'rectangle' })
const settings = new Settings(container)

document.addEventListener('changeDrawType', (event) => {
  const { type } = event.detail
  draw.updateOptions({ type })
})