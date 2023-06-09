import Layer from './Layer'
import matrix from '@/webgl/matrix'
import Element from './Element'

export default abstract class Viewport {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  layers: Layer<Element>[]

  x = 0
  y = 0
  z = 0

  public setPos (x: number, y: number, z: number): void {
    const gl = this.gl
    this.x = x
    this.y = y
    this.z = z
    this.viewMatrix = matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height)
    for (const layer of this.layers) {
      layer.setPos(this.x, this.y, this.z)
    }
  }

  viewMatrix?: Float32Array

  /**
   * Если true то отрисовка прекращается
   */
  private renderDone = false
  private updateViewJob = true
  private resizeObserver: ResizeObserver

  constructor (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    this.gl = gl
    this.canvas = canvas
    this.layers = []

    this.resizeObserver = new ResizeObserver(entries => {
      this.updateViewJob = true
    })
    this.resizeObserver.observe(this.canvas)
  }

  destroy (): void {
    this.renderDone = true
    this.resizeObserver.observe(this.canvas)
  }

  /**
   * Обновить размеры холста и матрицу проэкции
   */
  protected updateView () {
    const gl = this.gl
    const canvas = this.canvas
    const bbox = canvas.getBoundingClientRect()
    this.canvas.width = bbox.width * window.devicePixelRatio
    this.canvas.height = bbox.height * window.devicePixelRatio
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.viewMatrix = matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height)
    for (const layer of this.layers) {
      layer.updateView()
    }
  }

  private render (): void {
    const gl = this.gl
    if (this.updateViewJob) {
      this.updateView()
      this.updateViewJob = false
    }
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (const layer of this.layers) {
      layer.render()
    }
    gl.finish()
  }

  renderStart (): void {
    const render = (timestamp: number) => {
      if (this.renderDone) {
        return
      }
      this.render()
      requestAnimationFrame(render)
    }
    render(0)
  }
}
