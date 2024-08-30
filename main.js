import './style.css'
import {MatrixGrid} from "./src/matrix.js";

const container = document.querySelector('#app')
const animation = new MatrixGrid(container, {
  symbolColor: '#00d9ff',
  flashColor: '#FFFFFF',
  glowColor: '#00a6ff',
  symbolSize: 18,
  // symbol: 'き',
  flashGlowIntensity: 30,
  flashDuration: 200,
  flashInterval: 800
})