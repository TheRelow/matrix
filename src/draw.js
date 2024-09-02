/**
 * @typedef {Object} DrawOptions
 * @property {string} type - Тип фигуры для рисования: 'line', 'rectangle', 'circle'.
 */

/**
 * Класс для создания элемента рисования на канвасе.
 */
export class Draw {
  /**
   * @param {HTMLElement} container - DOM элемент, в который будет встроен канвас.
   * @param {DrawOptions} options - Опции для настройки типа рисования.
   */
  constructor(container, options = { type: 'line' }) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.isDrawing = false
    this.history = []
    this.options = options
    this.startX = 0
    this.startY = 0

    this.initializeCanvas()
    this.addEventListeners()
  }

  /**
   * Инициализация канваса, установка прозрачного фона и размеров.
   */
  initializeCanvas() {
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.width = this.container.clientWidth
    this.canvas.height = this.container.clientHeight
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.strokeStyle = '#fff'
    this.context.lineWidth = 2

    this.container.appendChild(this.canvas)
  }

  /**
   * Добавление обработчиков событий для начала и завершения рисования, а также для отмены последнего действия.
   */
  addEventListeners() {
    this.canvas.addEventListener('mousedown', (event) => this.startDrawing(event))
    this.canvas.addEventListener('mousemove', (event) => this.draw(event))
    this.canvas.addEventListener('mouseup', () => this.stopDrawing())
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing())

    document.addEventListener('keydown', (event) => this.handleUndo(event))
  }

  /**
   * Обновление параметров рисования.
   * @param {DrawOptions} options - Новые опции для настройки типа рисования.
   */
  updateOptions(options) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Начало рисования.
   * @param {MouseEvent} event - Событие мыши.
   */
  startDrawing(event) {
    this.isDrawing = true
    this.startX = event.offsetX
    this.startY = event.offsetY

    // Сохранение текущего состояния канваса для возможного отката
    this.saveState()

    if (this.options.type === 'line') {
      this.context.beginPath()
      this.context.moveTo(this.startX, this.startY)
    }
  }

  /**
   * Рисование фигуры по движению курсора.
   * @param {MouseEvent} event - Событие мыши.
   */
  draw(event) {
    if (!this.isDrawing) return

    const currentX = event.offsetX
    const currentY = event.offsetY

    // Очистка канваса и восстановление последнего состояния
    this.context.putImageData(this.history[this.history.length - 1], 0, 0)

    switch (this.options.type) {
      case 'line':
        this.context.lineTo(currentX, currentY)
        this.context.stroke()
        break

      case 'rectangle':
        const rectWidth = currentX - this.startX
        const rectHeight = currentY - this.startY
        this.context.strokeRect(this.startX, this.startY, rectWidth, rectHeight)
        break

      case 'circle':
        const radius = Math.sqrt(Math.pow(currentX - this.startX, 2) + Math.pow(currentY - this.startY, 2))
        this.context.beginPath()
        this.context.arc(this.startX, this.startY, radius, 0, 2 * Math.PI)
        this.context.stroke()
        break
    }
  }

  /**
   * Завершение рисования.
   */
  stopDrawing() {
    if (!this.isDrawing) return

    this.isDrawing = false
    this.context.closePath()
  }

  /**
   * Сохранение состояния канваса в историю.
   */
  saveState() {
    const canvasState = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.history.push(canvasState)
  }

  /**
   * Отмена последнего действия (Ctrl + Z).
   * @param {KeyboardEvent} event - Событие клавиатуры.
   */
  handleUndo(event) {
    if (event.ctrlKey && event.key === 'z') {
      if (this.history.length > 0) {
        this.history.pop()
        const lastState = this.history[this.history.length - 1]
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if (lastState) {
          this.context.putImageData(lastState, 0, 0)
        }
      }
    }
  }
}