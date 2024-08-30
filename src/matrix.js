/**
 * @class MatrixGrid
 * @description Класс для создания сетки символов в стиле "Матрицы" с эффектом вспышки и сменой символов.
 */
export class MatrixGrid {
  /**
   * @constructor
   * @param {HTMLElement} container - HTML элемент, в который будет вставлен канвас.
   * @param {Object} [options] - Настройки сетки.
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
      symbols: [
        'ラ', 'ド', 'ク', 'リ', 'フ', 'マ', 'ラ', 'ソ', 'ン', 'わ',
        'た', 'し', 'ワ', 'タ', 'シ', 'ん', 'ょ', 'ン', 'ョ', 'た',
        'ば', 'こ', 'タ', 'バ', 'コ', 'と', 'う', 'き', 'ょ', 'う',
        'ト', 'ウ', 'キ', 'ョ', 'ウ'
      ],  // Список символов для случайного выбора
      normalGlowIntensity: 0,   // Обычное свечение (0 - без свечения)
      flashGlowIntensity: 20,   // Интенсивность свечения при вспышке
      flashDuration: 150,       // Длительность вспышки (в миллисекундах)
      flashInterval: 2000,      // Интервал между вспышками (в миллисекундах)
      symbolSize: 48,           // Размер символа
      ...options
    }

    this.columns = []  // Массив столбцов
    this.initCanvas()
    this.initGrid() // Инициализация сетки
    this.startFlashAnimation() // Запуск анимации вспышки
    container.addEventListener('click', () => {
      console.log("this.columns", this.columns)
    })
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
    this.canvas.style.marginBottom = '-5px' // Добавление отступа

    this.container.appendChild(this.canvas)
  }

  /**
   * @method initGrid
   * @description Инициализация сетки символов.
   */
  initGrid() {
    const { width, height, symbolSize } = this.options
    const symbolSpacing = symbolSize * 1.5
    const numColumns = Math.floor(width / symbolSpacing)
    const numRows = Math.floor(height / symbolSpacing)

    const offsetX = (width - (numColumns - 1) * symbolSpacing) / 2
    const offsetY = (height - (numRows - 1) * symbolSpacing) / 2

    for (let i = 0; i < numColumns; i++) {
      const x = offsetX + i * symbolSpacing
      for (let j = 0; j < numRows; j++) {
        const y = offsetY + j * symbolSpacing
        this.columns.push({
          x: x,
          y: y,
          symbol: this.getRandomSymbol()
        })
      }
    }

    this.renderGrid() // Отрисовка всей сетки
  }

  /**
   * @method renderGrid
   * @description Отрисовка всех символов на сетке.
   */
  renderGrid() {
    for (let column of this.columns) {
      this.drawSymbol(column.symbol, this.options.symbolColor, column.x, column.y, 0)
    }
  }

  /**
   * @method drawSymbol
   * @description Отрисовка символа с заданным цветом и интенсивностью свечения.
   * @param {string} symbol - Символ для отрисовки.
   * @param {string} color - Цвет символа.
   * @param {number} x - Позиция X для отрисовки символа.
   * @param {number} y - Позиция Y для отрисовки символа.
   * @param {number} glowIntensity - Интенсивность свечения символа.
   */
  drawSymbol(symbol, color, x, y, glowIntensity) {
    const { context, options } = this
    const { glowColor, symbolSize } = options

    // Настройка свечения
    context.shadowColor = glowColor
    context.shadowBlur = glowIntensity

    context.fillStyle = color
    context.font = `${symbolSize}px monospace`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    context.fillText(symbol, x, y)
  }

  /**
   * @method startFlashAnimation
   * @description Запуск анимации вспышек на случайных символах сетки.
   */
  startFlashAnimation() {
    const { flashInterval } = this.options
    const animationInterval = 1 // Интервал анимации в мс

    const animate = () => {
      const column = this.columns[Math.floor(Math.random() * this.columns.length)]
      this.animateFlash(column)
      setTimeout(animate, animationInterval)
    }

    setTimeout(animate, animationInterval)
  }

  /**
   * @method animateFlash
   * @description Анимация вспышки с полным исчезновением свечения после смены символа.
   * @param {Object} column - Объект столбца с символом.
   */
  animateFlash(column) {
    const { flashColor, flashGlowIntensity, flashDuration, symbolSize } = this.options
    const startTime = performance.now()
    const symbolHalfSize = symbolSize / 2
    const maxGlow = flashGlowIntensity
    const glowArea = 0

    // Выбор нового случайного символа перед началом анимации вспышки
    column.symbol = this.getRandomSymbol()

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = elapsed / flashDuration

      const clearRadius = 10 // Фиксированный радиус очистки вокруг символа

      if (progress < 1) {
        const currentGlow = flashGlowIntensity * progress

        // Очистка области вокруг символа с фиксированным радиусом
        this.context.clearRect(column.x - symbolHalfSize - clearRadius, column.y - symbolHalfSize - clearRadius, symbolSize + clearRadius * 2, symbolSize + clearRadius * 2)

        // Отрисовка символа с текущим уровнем свечения
        this.drawSymbol(column.symbol, flashColor, column.x, column.y, currentGlow)
        requestAnimationFrame(animate)
      } else {
        // Полная очистка области с фиксированным радиусом
        this.context.clearRect(column.x - symbolHalfSize - clearRadius, column.y - symbolHalfSize - clearRadius, symbolSize + clearRadius * 2, symbolSize + clearRadius * 2)

        // Отрисовка символа с нормальным цветом и без свечения
        this.drawSymbol(column.symbol, this.options.symbolColor, column.x, column.y, 0)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * @method getRandomSymbol
   * @description Выбор случайного символа из списка.
   * @returns {string} Случайный символ.
   */
  getRandomSymbol() {
    const { symbols } = this.options
    const randomIndex = Math.floor(Math.random() * symbols.length)
    return symbols[randomIndex]
  }

  /**
   * @method updateOptions
   * @description Обновление настроек сетки.
   * @param {Object} newOptions - Новые настройки для обновления.
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    }
  }
}