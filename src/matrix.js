/**
 * @class MatrixGrid
 * @description Класс для создания анимированного символа в центре экрана с эффектом вспышки.
 */
export class MatrixGrid {
  /**
   * @constructor
   * @param {HTMLElement} container - HTML элемент, в который будет вставлен канвас.
   * @param {Object} [options] - Настройки символа.
   */
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#000000',
      symbolColor: '#00FF00',  // Обычный цвет символа
      flashColor: '#FFFFFF',   // Цвет символа во время вспышки
      glowColor: '#00FF00',    // Цвет свечения
      symbol: '💬',            // Символ для отображения
      flashDuration: 150,       // Длительность вспышки (в миллисекундах)
      flashInterval: 2000,      // Интервал между вспышками (в миллисекундах)
      symbolSize: 100,           // Размер символа
      ...options
    }

    this.options.flashGlowIntensity = this.options.symbolSize / 10 // Интенсивность свечения при вспышке

    this.initCanvas()
    this.setLetter()
    // this.startAnimation() // Запуск анимации
  }

  /**
   * @method initCanvas
   * @description Инициализация канваса и добавление его в контейнер.
   */
  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.canvas.width = this.options.width
    this.canvas.height = this.options.height
    this.canvas.style.backgroundColor = this.options.backgroundColor

    this.container.appendChild(this.canvas)

    // Обработка изменения размера контейнера
    window.addEventListener('resize', () => {
      this.canvas.width = this.container.clientWidth
      this.canvas.height = this.container.clientHeight
    })
  }

  /**
   * @method drawSymbol
   * @description Отрисовка символа с заданным цветом и интенсивностью свечения.
   * @param {string} color - Цвет символа.
   * @param {number} glowIntensity - Интенсивность свечения символа.
   */
  drawSymbol(color, glowIntensity) {
    const { context, options } = this
    const { glowColor, symbolSize, symbol } = options

    // Настройка свечения
    context.shadowColor = glowColor
    context.shadowBlur = glowIntensity

    context.clearRect(0, 0, this.canvas.width, this.canvas.height) // Очистка всего канваса

    context.fillStyle = color
    context.font = `${symbolSize}px monospace`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Вычисление позиции для размещения символа в центре канваса
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2

    context.fillText(symbol, x, y)
  }

  /**
   * @method startAnimation
   * @description Запуск анимации вспышек символа.
   */
  startAnimation() {
    const { flashInterval, flashDuration, flashGlowIntensity } = this.options

    // Плавная анимация вспышек
    const animateFlash = (startTime) => {
      const now = performance.now()
      const elapsed = now - startTime
      const progress = (elapsed % flashInterval) / flashDuration
      const isFlashing = progress < 0.5 // Флаг, указывающий на текущее состояние вспышки

      const currentGlow = isFlashing ? flashGlowIntensity * Math.sin(progress * Math.PI) : 0
      const currentColor = isFlashing ? this.options.flashColor : this.options.symbolColor

      console.log("currentGlow", currentGlow)
      // Отрисовка символа с текущим цветом и свечением
      this.drawSymbol(currentColor, currentGlow)

      // Запуск следующего кадра анимации
      requestAnimationFrame(() => animateFlash(startTime))
    }

    // Запуск анимации вспышек
    requestAnimationFrame((startTime) => animateFlash(startTime))
  }

  setLetter() {
    this.drawSymbol(this.options.symbolColor, 2)
  }
}