import WebGLDebugUtils from '../webgl-debug.js'
import Viewport from '../Viewport'
import TileLayer from './Layers/TileLayer'

export default class MapViewport extends Viewport {
  dragData?: {
    offsetX: number
    offsetY: number
    x: number
    y: number
  }

  x = 0
  y = 0
  z = 0

  constructor (canvas: HTMLCanvasElement) {
    const bbox = canvas.getBoundingClientRect()
    canvas.width = bbox.width
    canvas.height = bbox.height
    console.log(canvas, canvas.width, canvas.height)
    // const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext('webgl'))
    const gl = canvas.getContext('webgl', {
      desynchronized: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      throw new Error('Context webgl not created')
    }
    super(gl)
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    this.layers.push(new TileLayer(gl))
    for (const layer of this.layers) {
      layer.init()
    }

    window.addEventListener('mousedown', this.mousedown.bind(this))
    window.addEventListener('mouseup', this.mouseup.bind(this))
    window.addEventListener('touchstart', this.touchstart.bind(this), false)
    window.addEventListener('touchend', this.touchend.bind(this), false)
    window.addEventListener('touchcancel', this.touchcancel.bind(this), false)
    window.addEventListener('wheel', this.wheel.bind(this))
  }

  destroy () {
    window.removeEventListener('mouseup', this.mouseup)
    window.removeEventListener('mousedown', this.mousedown)
    window.removeEventListener('mousemove', this.mousemove)
    window.removeEventListener('touchstart', this.touchstart)
    window.removeEventListener('touchend', this.touchend)
    window.removeEventListener('touchcancel', this.touchcancel)
    window.removeEventListener('touchmove', this.touchmove)
    window.removeEventListener('wheel', this.wheel)
  }

  renderStart (): void {
    const render = (timestamp: number) => {
      this.render()
      requestAnimationFrame(render)
    }
    render(0)
  }

  render (): void {
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (const layer of this.layers) {
      layer.render()
    }
  }

  wheel (event: WheelEvent) {
    this.z += event.deltaY / 1000
    console.log(this.z)
    for (const layer of this.layers) {
      layer.setPos(this.x, this.y, this.z)
    }
  }

  touchstart (event: TouchEvent) {
    this.dragStart(event.touches[0].clientX, event.touches[0].clientY)
    window.addEventListener('touchmove', this.touchmove.bind(this), false)
  }

  touchend (event: TouchEvent) {
    this.dragStop()
    window.removeEventListener('touchmove', this.touchmove)
  }

  touchcancel (event: TouchEvent) {
    this.dragStop()
    window.removeEventListener('touchmove', this.touchmove)
  }

  touchmove (event: TouchEvent) {
    // event.preventDefault()
    this.drag(event.touches[0].clientX, event.touches[0].clientY)
  }

  mousedown (event: MouseEvent) {
    this.dragStart(event.clientX, event.clientY)
    window.addEventListener('mousemove', this.mousemove.bind(this), { capture: true })
  }

  mouseup (event: MouseEvent) {
    this.dragStop()
    window.removeEventListener('mousemove', this.mousemove)
  }

  mousemove (event: MouseEvent) {
    event.preventDefault()
    this.drag(event.clientX, event.clientY)
  }

  dragStart (offsetX: number, offsetY: number) {
    this.dragData = {
      offsetX,
      offsetY,
      x: 0,
      y: 0,
    }
  }

  dragStop () {
    if (!this.dragData) {
      return
    }
    this.x = this.x + this.dragData.x
    this.y = this.y + this.dragData.y
    this.dragData = undefined
  }

  drag (x: number, y: number) {
    if (!this.dragData) {
      return
    }
    this.dragData.x = x - this.dragData.offsetX
    this.dragData.y = y - this.dragData.offsetY
    for (const layer of this.layers) {
      layer.setPos(this.x + this.dragData.x, this.y + this.dragData.y, this.z)
    }
  }
}
