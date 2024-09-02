/**
 * Инициализация WebGL-контекста
 * @param {HTMLCanvasElement} canvas - HTML элемент canvas
 * @returns {WebGLRenderingContext} - WebGL контекст
 */
function initWebGL(canvas) {
  return canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
}

/**
 * Компиляция шейдера
 * @param {WebGLRenderingContext} gl - WebGL контекст
 * @param {string} source - Исходный код шейдера
 * @param {number} type - Тип шейдера (вершинный или фрагментный)
 * @returns {WebGLShader} - Скомпилированный шейдер
 */
function compileShader(gl, source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 * Создание WebGL программы
 * @param {WebGLRenderingContext} gl - WebGL контекст
 * @param {string} vsSource - Исходный код вершинного шейдера
 * @param {string} fsSource - Исходный код фрагментного шейдера
 * @returns {WebGLProgram} - WebGL программа
 */
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER)
  const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Ошибка инициализации шейдерной программы:', gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

/**
 * Основная функция для рендеринга символа с эффектами
 */
function main() {
  const canvas = document.getElementById('glCanvas')
  const gl = initWebGL(canvas)

  const vsSource = `
    attribute vec4 aVertexPosition;
    void main(void) {
      gl_Position = aVertexPosition;
    }
  `

  const fsSource = `
    precision mediump float;
    uniform float uTime;
    void main(void) {
      float glowIntensity = abs(sin(uTime)) * 0.5 + 0.5;
      float pulse = abs(sin(uTime * 0.33));
      vec3 glowColor = vec3(0.0, 1.0, 1.0) * glowIntensity;
      vec3 finalColor = mix(glowColor, vec3(1.0), pulse);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
  gl.useProgram(shaderProgram)

  const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  const uTime = gl.getUniformLocation(shaderProgram, 'uTime')

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const positions = [
    -0.5, -0.5,
    0.5, -0.5,
    0.5,  0.5,
    -0.5,  0.5
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const draw = (time) => {
    gl.clear(gl.COLOR_BUFFER_BIT)

    const timeInSeconds = time * 0.001
    gl.uniform1f(uTime, timeInSeconds)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vertexPosition)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)
}

main()