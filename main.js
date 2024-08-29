import './style.css'
import {MatrixAnimation} from "./src/matrix.js";

const container = document.querySelector('#app')
const animation = new MatrixAnimation(container, {
  symbol: 'き'
})