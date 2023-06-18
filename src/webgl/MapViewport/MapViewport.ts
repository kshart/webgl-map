import matrix from '@/webgl/matrix'
import WebGLDebugUtils from '../webgl-debug.js'
import TileGroupLayer from './Layers/Tile/TileGroupLayer'
import MarkerLayer from './Layers/Marker/MarkerLayer'
import InteractiveViewport from '../InteractiveViewport'

export default class MapViewport extends InteractiveViewport {
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
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    gl.clearDepth(1.0)
    gl.enable(gl.BLEND)

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

  public setPos (x: number, y: number, z: number): void {
    if (x < -180) {
      x = -180
    } else if (x > 180) {
      x = 180
    }
    if (y < -90) {
      y = -90
    } else if (y > 90) {
      y = 90
    }
    super.setPos(x, y, z)
  }
}
