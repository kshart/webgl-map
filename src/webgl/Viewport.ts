import Layer from './Layer'

export default abstract class Viewport {
  canvas: HTMLCanvasElement
  gl: WebGLRenderingContext
  layers: Layer[]

  x = 0
  y = 0
  z = 0

  viewLeft = -1
  viewRight = 1
  viewTop = -1
  viewBottom = 1

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
    this.resizeObserver.observe(this.canvas)
  }

  setViewport (left: number, right: number, top: number, bottom: number) {
    this.viewLeft = left
    this.viewRight = right
    this.viewTop = top
    this.viewBottom = bottom
    this.updateViewJob = true
  }

  private updateView () {
    const gl = this.gl
    const canvas = this.canvas
    const bbox = canvas.getBoundingClientRect()
    this.canvas.width = bbox.width * window.devicePixelRatio
    this.canvas.height = bbox.height * window.devicePixelRatio
    this.viewLeft = -180 * canvas.width / canvas.height
    this.viewRight = 180 * canvas.width / canvas.height
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
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
      this.render()
      requestAnimationFrame(render)
    }
    render(0)
  }
}
