/**
 * Класс для управления настройками и выбора типа фигуры.
 */
export class Settings {
  /**
   * @param {HTMLElement} container - DOM элемент, в который будет добавлен канвас с кнопками.
   */
  constructor(container) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.buttons = {
      line: null,
      rectangle: null,
      circle: null
    }

    this.initializeCanvas()
    this.createButtons()
    this.addEventListeners()
  }

  /**
   * Инициализация канваса для кнопок.
   */
  initializeCanvas() {
    this.canvas.width = 48
    this.canvas.height = 168
    this.canvas.style.position = 'fixed'
    this.canvas.style.top = '12px'
    this.canvas.style.left = '12px'
    this.canvas.style.backgroundColor = 'transparent' // Без фона

    this.container.appendChild(this.canvas)
  }

  /**
   * Создание кнопок и рисование на канвасе.
   */
  createButtons() {
    const buttonHeight = 48
    const buttonWidth = 48
    const buttonSpacing = 12
    const shapes = [
      { type: 'line', drawFn: this.drawLine.bind(this) },
      { type: 'rectangle', drawFn: this.drawRectangle.bind(this) },
      { type: 'circle', drawFn: this.drawCircle.bind(this) }
    ]

    shapes.forEach((shape, index) => {
      const x = 0
      const y = index * (buttonHeight + buttonSpacing)
      const radius = 8 // Скругление углов

      // Рисуем скруглённый прямоугольник для кнопки
      this.context.beginPath()
      this.context.moveTo(x + radius, y)
      this.context.arcTo(x + buttonWidth, y, x + buttonWidth, y + buttonHeight, radius)
      this.context.arcTo(x + buttonWidth, y + buttonHeight, x, y + buttonHeight, radius)
      this.context.arcTo(x, y + buttonHeight, x, y, radius)
      this.context.arcTo(x, y, x + buttonWidth, y, radius)
      this.context.closePath()

      this.context.fillStyle = '#ddd'
      this.context.fill()
      this.context.strokeStyle = '#aaa'
      this.context.stroke()

      // Нарисовать фигуру внутри кнопки
      shape.drawFn(x, y, buttonWidth, buttonHeight)
    })
  }

  /**
   * Рисование диагональной линии внутри кнопки.
   * @param {number} x - X координата начала кнопки.
   * @param {number} y - Y координата начала кнопки.
   * @param {number} width - Ширина кнопки.
   * @param {number} height - Высота кнопки.
   */
  drawLine(x, y, width, height) {
    this.context.beginPath()
    this.context.moveTo(x + 10, y + 10)
    this.context.lineTo(x + width - 10, y + height - 10)
    this.context.strokeStyle = '#000'
    this.context.lineWidth = 2
    this.context.stroke()
  }

  /**
   * Рисование прямоугольника внутри кнопки.
   * @param {number} x - X координата начала кнопки.
   * @param {number} y - Y координата начала кнопки.
   * @param {number} width - Ширина кнопки.
   * @param {number} height - Высота кнопки.
   */
  drawRectangle(x, y, width, height) {
    this.context.strokeStyle = '#000'
    this.context.lineWidth = 2
    this.context.strokeRect(x + 10, y + 10, width - 20, height - 20)
  }

  /**
   * Рисование круга внутри кнопки.
   * @param {number} x - X координата начала кнопки.
   * @param {number} y - Y координата начала кнопки.
   * @param {number} width - Ширина кнопки.
   * @param {number} height - Высота кнопки.
   */
  drawCircle(x, y, width, height) {
    const radius = Math.min(width, height) / 2 - 10
    this.context.beginPath()
    this.context.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI)
    this.context.strokeStyle = '#000'
    this.context.lineWidth = 2
    this.context.stroke()
  }

  /**
   * Добавление обработчиков событий для канваса.
   */
  addEventListeners() {
    this.canvas.addEventListener('click', (event) => this.handleButtonClick(event))
    this.canvas.addEventListener('mousedown', (event) => event.stopPropagation())
    this.canvas.addEventListener('mouseup', (event) => event.stopPropagation())
    this.canvas.addEventListener('mousemove', (event) => event.stopPropagation())
    this.canvas.addEventListener('mouseleave', (event) => event.stopPropagation())
  }

  /**
   * Обработка клика на кнопке.
   * @param {MouseEvent} event - Событие клика.
   */
  handleButtonClick(event) {
    const buttonHeight = 48
    const buttonSpacing = 12
    const buttonType = Math.floor(event.offsetY / (buttonHeight + buttonSpacing))

    switch (buttonType) {
      case 0:
        this.dispatchChangeEvent('line')
        break
      case 1:
        this.dispatchChangeEvent('rectangle')
        break
      case 2:
        this.dispatchChangeEvent('circle')
        break
      default:
        break
    }
  }

  /**
   * Диспетчеризация события 'changeDrawType'.
   * @param {string} type - Тип фигуры.
   */
  dispatchChangeEvent(type) {
    const changeEvent = new CustomEvent('changeDrawType', {
      detail: { type }
    })
    document.dispatchEvent(changeEvent)
  }
}