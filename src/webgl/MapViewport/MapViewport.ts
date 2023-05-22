import WebGLDebugUtils from '../webgl-debug.js'
import TileGroupLayer from './Layers/Tile/TileGroupLayer'
import MarkerLayer from './Layers/Marker/MarkerLayer'
import InteractiveViewport from '../InteractiveViewport'

export default class MapViewport extends InteractiveViewport {
  x = 0
  y = 0
  z = 0

  tileGroup?: TileGroupLayer

  constructor (canvas: HTMLCanvasElement) {
    // const gl = WebGLDebugUtils.makeDebugContext(canvas.getContext('webgl'))
    const gl = canvas.getContext('webgl', {
      // desynchronized: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      throw new Error('Context webgl not created')
    }
    super(canvas, gl)
    this.setViewport(-180, 180, 90, -90)
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    gl.clearDepth(1.0)
    gl.enable(gl.BLEND)
    // gl.colorMask(false, false, false, true)
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    this.tileGroup = new TileGroupLayer(this)
    this.layers.push(this.tileGroup)
    this.layers.push(new MarkerLayer(this))
    for (const layer of this.layers) {
      layer.mount()
    }
  }

  /**
   * @override
   */
  dragStop () {
    super.dragStop()
    if (!this.tileGroup) {
      return
    }
    for (const [key, { layer }] of this.tileGroup.tileLayers) {
      layer.loadTiles()
    }
  }

  /**
   * @override
   */
  drag (x: number, y: number) {
    if (!this.dragData) {
      return
    }
    console.log(this.viewLeft, this.viewRight)
    const offsetX = ((x - this.dragData.bbox.left) / this.dragData.bbox.width - this.dragData.viewX) * Math.abs(this.viewLeft - this.viewRight)
    this.x = offsetX + this.dragData.localX
    const offsetY = ((y - this.dragData.bbox.top) / this.dragData.bbox.height - this.dragData.viewY) * Math.abs(this.viewTop - this.viewBottom)
    this.y = offsetY + this.dragData.localY
    if (this.x < this.viewLeft) {
      this.x = this.viewLeft
    } else if (this.x > this.viewRight) {
      this.x = this.viewRight
    }
    if (this.y > this.viewTop) {
      this.y = this.viewTop
    } else if (this.y < this.viewBottom) {
      this.y = this.viewBottom
    }

    for (const layer of this.layers) {
      layer.setPos(this.x, this.y, this.z)
    }
  }
}
