/**
 * @class MatrixAnimation
 * @description Класс для создания анимации падающих букв в стиле "Матрицы" с плавным эффектом вспышки.
 */
export class MatrixAnimation {
  /**
   * @constructor
   * @param {HTMLElement} container - HTML элемент, в который будет вставлен канвас.
   * @param {Object} [options] - Настройки анимации.
   */
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#000000',
      symbolColor: '#00FF00',
      glowColor: '#00FF00',
      symbol: 'き',
      normalGlowIntensity: 0,  // Обычное свечение
      flashGlowIntensity: 30,  // Интенсивность свечения при вспышке
      flashDuration: 200,      // Длительность вспышки (в миллисекундах)
      flashInterval: 800,     // Интервал между вспышками (в миллисекундах)
      ...options
    }

    this.initCanvas()
    this.startFlashing() // Запуск анимации вспышек
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

    this.drawSymbol(this.options.normalGlowIntensity)
  }

  /**
   * @method drawSymbol
   * @description Отрисовка символа с заданной интенсивностью свечения.
   * @param {number} glowIntensity - Интенсивность свечения символа.
   */
  drawSymbol(glowIntensity) {
    const { width, height, symbolColor, symbol, glowColor } = this.options
    const { context } = this

    // Очищаем канвас перед отрисовкой
    context.clearRect(0, 0, width, height)

    context.fillStyle = symbolColor
    context.font = '48px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Настройка свечения
    context.shadowBlur = glowIntensity
    context.shadowColor = glowColor

    // Отрисовка символа
    context.fillText(symbol, width / 2, height / 2)
  }

  /**
   * @method animateFlash
   * @description Анимация плавного увеличения и уменьшения интенсивности свечения.
   */
  animateFlash() {
    const { flashGlowIntensity, normalGlowIntensity, flashDuration } = this.options
    const startTime = performance.now()

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = elapsed / flashDuration

      if (progress < 1) {
        // Линейная интерполяция для плавного увеличения свечения
        const currentGlow = normalGlowIntensity + (flashGlowIntensity - normalGlowIntensity) * progress
        this.drawSymbol(currentGlow)
        requestAnimationFrame(animate)
      } else {
        // Вернуть к обычной интенсивности
        this.drawSymbol(normalGlowIntensity)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * @method startFlashing
   * @description Запуск анимации вспышек.
   */
  startFlashing() {
    const { flashInterval } = this.options

    setInterval(() => {
      this.animateFlash()
    }, flashInterval)
  }

  /**
   * @method updateOptions
   * @description Обновление настроек анимации.
   * @param {Object} newOptions - Новые настройки для обновления.
   */
  updateOptions(newOptions) {
    this.options = {
      ...this.options,
      ...newOptions
    }

    this.drawSymbol(this.options.normalGlowIntensity) // Перерисовка символа с новыми настройками
  }
}