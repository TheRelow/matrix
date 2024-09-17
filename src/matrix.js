/**
 * @class MatrixGrid
 * @description Класс для создания сетки символов в стиле "Матрицы" с эффектом вспышки и сменой символов.
 */
export class MatrixGrid {
  _mousePosition = null
  get mousePosition() {
    return this._mousePosition
  }
  set mousePosition(val) {
    this._mousePosition = val
  }

  grid = []
  columns = []
  width = 0
  height = 0
  gridSettings = {
    columns: 0,
    rows: 0
  }
  /**
   * @constructor
   * @param {HTMLElement} container - HTML элемент, в который будет вставлен канвас.
   * @param {Object} [options] - Настройки сетки.
   */
  constructor(container, options = {}) {
    this.container = container
    this.width = container.clientWidth
    this.height = container.clientHeight
    this.options = {
      backgroundColor: '#000000',
      symbolColor: '#00FF00',  // Обычный цвет символа
      flashColor: '#FFFFFF',   // Цвет символа во время вспышки
      glowColor: '#00FF00',    // Цвет свечения
      symbols: [
        'ラ', 'ド', 'ク', 'リ', 'フ', 'マ', 'ラ', 'ソ', 'ン', 'わ', 'た', 'し', 'ワ', 'タ', 'シ', 'ん', 'ょ', 'ン', 'ョ', 'た',
        'ば', 'こ', 'タ', 'バ', 'コ', 'と', 'う', 'き', 'ょ', 'う', 'ト', 'ウ', 'キ', 'ョ', 'ウ'
      ],                        // Список символов для случайного выбора
      normalGlowIntensity: 0,   // Обычное свечение (0 - без свечения)
      flashDuration: 150,       // Длительность вспышки (в миллисекундах)
      flashInterval: 14,        // Интервал между вспышками (в миллисекундах)
      symbolSize: 48,           // Размер символа
      symbolSpacing: 1.5,       // Расстояние между символами
      ...options
    }

    this.options.flashGlowIntensity = this.options.symbolSize / 5 // Интенсивность свечения при вспышке

    this.initCanvas()
    this.initColumns()
    const animationTimeout = this.drawSquares()

    setTimeout(() => {
      this.initHandlers()
    }, animationTimeout)

    // this.initGrid() // Инициализация сетки
    // this.startFlashAnimation() // Запуск анимации вспышки
    // container.addEventListener('click', () => {
    //   console.log("this.columns", this.columns)
    // })
  }

  /**
   * Рассчитывает позицию элемента по заданной оси.
   * @param {number} index - Индекс элемента (начиная с 0).
   * @returns {number} Позиция для данного элемента по оси.
   */
  calculatePosition(index) {
    return index * (this.options.symbolSize + this.options.symbolSize * this.options.symbolSpacing)
  }

  getElementPosition(col, row) {
    // TODO: убрал spacing
    return [this.calculatePosition(col), this.calculatePosition(row)]
  }

  /**
   * @method initCanvas
   * @description Инициализация канваса и добавление его в контейнер.
   */
  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.backgroundColor = this.options.backgroundColor

    this.container.appendChild(this.canvas)
  }

  initColumns() {
    this.gridSettings = this.calculateGrid(this.width, this.height, this.options.symbolSize, this.options.symbolSpacing)
    this.grid = Array.from({ length: this.gridSettings.rows }, () => Array(this.gridSettings.columns).fill(0))
  }

  /**
   * Устанавливает новое значение в массиве и вызывает колбек при изменении.
   * @param {number} row - Индекс строки.
   * @param {number} column - Индекс столбца.
   * @param {number} newValue - Новое значение для установки.
   */
  setValue(row, column, newValue) {
    const oldValue = this.grid[row][column]
    if (oldValue !== newValue) {
      this.grid[row][column] = newValue
      console.log(`Изменение в ячейке [${row}, ${column}]: ${oldValue} -> ${newValue}`)
    }
  }

  generateDiagonalMatrixIndices(rows, columns) {
    const diagonalIndices = []

    for (let step = 0; step < rows + columns - 1; step++) {
      const diagonal = []

      for (let i = 0; i <= step; i++) {
        const row = i
        const col = step - i

        if (row < rows && col < columns) {
          diagonal.push([row, col])
        }
      }

      diagonalIndices.push(diagonal)
    }

    return diagonalIndices
  }

  /**
   * Анимация появления квадрата из заданной точки.
   * @param {number | array} x - Координата x левого верхнего угла квадрата. Либо массив [x, y]
   * @param {number} [y] - Координата y левого верхнего угла квадрата.
   */
  animateSquare(x, y) {
    if (Array.isArray(x)) {
      y = x[1]
      x = x[0]
    }
    const startTime = performance.now()

    const animate = (time) => {
      const elapsedTime = time - startTime
      const progress = Math.min(elapsedTime / 100, 1)
      const currentSize = this.options.symbolSize * progress

      // Рисование квадрата
      this.context.fillStyle = '#272e46'
      this.context.beginPath()
      this.context.rect(
        x, // левый верхний угол по x
        y, // левый верхний угол по y
        currentSize, // ширина квадрата
        currentSize  // высота квадрата
      )
      this.context.fill()
      this.context.closePath()

      // Если анимация ещё не завершена, запросить следующий кадр
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    // Запуск анимации
    requestAnimationFrame(animate)
  }

  /**
   * Генерация индексов для волн, расходящихся во все стороны от начальной точки.
   * @param {number} startRow - Начальная строка.
   * @param {number} startCol - Начальный столбец.
   * @param {number} rows - Общее количество строк.
   * @param {number} columns - Общее количество столбцов.
   * @returns {Array<Array<[number, number]>>} - Массив индексов по уровням от центра.
   */
  generateWaveIndices(startRow, startCol, rows, columns) {
    const waveIndices = []
    const maxDistance = Math.max(rows, columns)

    for (let distance = 0; distance <= maxDistance; distance++) {
      const waveLevel = []

      for (let rowOffset = -distance; rowOffset <= distance; rowOffset++) {
        for (let colOffset = -distance; colOffset <= distance; colOffset++) {
          const row = startRow + rowOffset
          const col = startCol + colOffset

          // Проверка границ матрицы и расстояния от начальной точки
          if (row >= 0 && row < rows && col >= 0 && col < columns && Math.abs(rowOffset) + Math.abs(colOffset) === distance) {
            waveLevel.push([row, col])
          }
        }
      }

      if (waveLevel.length > 0) {
        waveIndices.push(waveLevel)
      }
    }

    return waveIndices
  }

  drawSquares() {
    let timeout = 0
    // this.generateWaveIndices(40, 22,
    this.generateDiagonalMatrixIndices(this.gridSettings.rows, this.gridSettings.columns).forEach((step, stepIdx) => {
      timeout = 10 * stepIdx
      setTimeout(() => {
        step.forEach(i => {
          this.animateSquare(this.getElementPosition(i[1], i[0]))
        })
      }, timeout)
    })

    return timeout + 100
  }

  /**
   * Рассчитывает индекс элемента по заданной позиции по оси.
   * @param {number} position - Позиция элемента по оси.
   * @returns {number} Индекс элемента по оси.
   */
  getIndexFromPosition(position) {
    // Рассчитываем расстояние до ближайшего центра элемента
    const distance = position / (this.options.symbolSize + this.options.symbolSize * this.options.symbolSpacing)
    // Округляем до ближайшего целого числа
    return Math.round(distance)
  }

  /**
   * Рассчитывает индекс элемента на сетке по его позиции, находя ближайший центр элемента.
   * @param {number} x - Горизонтальная позиция элемента.
   * @param {number} y - Вертикальная позиция элемента.
   * @returns {[number, number]} Индексы элемента (колонка, строка).
   */
  getMatrixPosition(x, y) {
    // Находим индекс по горизонтальной позиции
    // TODO: убрал spacing
    const col = this.getIndexFromPosition(x)
    // Находим индекс по вертикальной позиции
    // TODO: убрал spacing
    const row = this.getIndexFromPosition(y)
    return [col, row]
  }

  initHandlers() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition = [e.clientX, e.clientY]
    })
  }

  /**
   * Рассчитывает отступы и количество блоков, которые можно разместить в контейнере.
   *
   * @param {number} containerWidth - Ширина контейнера
   * @param {number} containerHeight - Высота контейнера
   * @param {number} blockSize - Размер квадратного блока
   * @param {number} spacingFactor - Коэффициент для расстояния между блоками
   * @returns {{ columns: number, rows: number, fullBlockSize: number, width: number, height: number }}
   */
  calculateGrid(containerWidth, containerHeight, blockSize, spacingFactor) {
    const fullBlockSize = Math.floor(blockSize * (spacingFactor + 1))

    const columns = Math.floor(containerWidth / fullBlockSize)
    const rows = Math.floor(containerHeight / fullBlockSize)

    const width = fullBlockSize * columns
    const height = fullBlockSize * rows

    return {
      columns,
      rows,
      fullBlockSize,
      width,
      height
    }
  }

  /**
   * @method initGrid
   * @description Инициализация сетки символов.
   */
  initGrid() {
    const symbolSpacing = this.options.symbolSize * this.options.symbolSpacing
    const numColumns = Math.floor(this.width / symbolSpacing)
    const numRows = Math.floor(this.height / symbolSpacing)

    const offsetX = (this.width - (numColumns - 1) * symbolSpacing) / 2
    const offsetY = (this.height - (numRows - 1) * symbolSpacing) / 2

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

    const animate = () => {
      const column = this.columns[Math.floor(Math.random() * this.columns.length)]
      this.animateFlash(column)
      setTimeout(animate, flashInterval)
    }

    setTimeout(animate, flashInterval)
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