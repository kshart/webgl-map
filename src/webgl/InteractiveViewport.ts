import Viewport from './Viewport'

export default class InteractiveViewport extends Viewport {
  dragData?: {
    localX: number
    localY: number
    viewX: number
    viewY: number
    bbox: DOMRect
  }

  private eventHandlers: {
    mousedown: (event: MouseEvent) => void
    mousemove: (event: MouseEvent) => void
    mouseup: (event: MouseEvent) => void
    touchstart: (event: TouchEvent) => void
    touchmove: (event: TouchEvent) => void
    touchend: (event: TouchEvent) => void
    touchcancel: (event: TouchEvent) => void
    wheel: (event: WheelEvent) => void
  }

  constructor (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    super(canvas, gl)
    this.eventHandlers = {
      mousedown: this.mousedown.bind(this),
      mousemove: this.mousemove.bind(this),
      mouseup: this.mouseup.bind(this),
      touchstart: this.touchstart.bind(this),
      touchmove: this.touchmove.bind(this),
      touchend: this.touchend.bind(this),
      touchcancel: this.touchcancel.bind(this),
      wheel: this.wheel.bind(this),
    }
    window.addEventListener('mousedown', this.eventHandlers.mousedown)
    window.addEventListener('mouseup', this.eventHandlers.mouseup)
    window.addEventListener('touchstart', this.eventHandlers.touchstart, false)
    window.addEventListener('touchend', this.eventHandlers.touchend, false)
    window.addEventListener('touchcancel', this.eventHandlers.touchcancel, false)
    window.addEventListener('wheel', this.eventHandlers.wheel)
  }

  destroy () {
    console.log('destroy')
    window.removeEventListener('mouseup', this.eventHandlers.mouseup)
    window.removeEventListener('mousedown', this.eventHandlers.mousedown)
    window.removeEventListener('mousemove', this.eventHandlers.mousemove)
    window.removeEventListener('touchstart', this.eventHandlers.touchstart)
    window.removeEventListener('touchend', this.eventHandlers.touchend)
    window.removeEventListener('touchcancel', this.eventHandlers.touchcancel)
    window.removeEventListener('touchmove', this.eventHandlers.touchmove)
    window.removeEventListener('wheel', this.eventHandlers.wheel)
  }

  wheel (event: WheelEvent) {
    this.z -= event.deltaY / 1000
    // console.log(this.z)
    for (const layer of this.layers) {
      layer.setPos(this.x, this.y, this.z)
    }
  }

  touchstart (event: TouchEvent) {
    console.log('touchstart')
    this.dragStart(event.touches[0].clientX, event.touches[0].clientY)
    window.addEventListener('touchmove', this.eventHandlers.touchmove, false)
  }

  touchend (event: TouchEvent) {
    console.log('touchend')
    this.dragStop()
    window.removeEventListener('touchmove', this.eventHandlers.touchmove)
  }

  touchcancel (event: TouchEvent) {
    console.log('touchcancel')
    this.dragStop()
    window.removeEventListener('touchmove', this.eventHandlers.touchmove)
  }

  touchmove (event: TouchEvent) {
    // event.preventDefault()
    console.log(event.touches[0].clientX, event.touches[0].clientY)
    this.drag(event.touches[0].clientX, event.touches[0].clientY)
  }

  mousedown (event: MouseEvent) {
    this.dragStart(event.clientX, event.clientY)
    window.addEventListener('mousemove', this.eventHandlers.mousemove, { capture: true })
  }

  mouseup (event: MouseEvent) {
    this.dragStop()
    window.removeEventListener('mousemove', this.eventHandlers.mousemove)
  }

  mousemove (event: MouseEvent) {
    event.preventDefault()
    this.drag(event.clientX, event.clientY)
  }

  dragStart (x: number, y: number) {
    const bbox = this.canvas.getBoundingClientRect()
    this.dragData = {
      viewX: (x - bbox.left) / bbox.width,
      viewY: (y - bbox.top) / bbox.height,
      localX: this.x,
      localY: this.y,
      bbox,
    }
  }

  dragStop () {
    if (!this.dragData) {
      return
    }
    this.dragData = undefined
  }

  drag (x: number, y: number) {
    if (!this.dragData) {
      return
    }
    console.log(this.viewLeft, this.viewRight)
    const offsetX = ((x - this.dragData.bbox.left) / this.dragData.bbox.width - this.dragData.viewX) * Math.abs(this.viewLeft - this.viewRight)
    this.x = offsetX + this.dragData.localX
    const offsetY = ((y - this.dragData.bbox.top) / this.dragData.bbox.height - this.dragData.viewY) * Math.abs(this.viewTop - this.viewBottom)
    this.y = offsetY + this.dragData.localY

    for (const layer of this.layers) {
      layer.setPos(this.x, this.y, this.z)
    }
  }
}
