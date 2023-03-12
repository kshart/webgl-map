import WebGLDebugUtils from '../webgl-debug.js'
import TileGroupLayer from './Layers/Tile/TileGroupLayer'
import MarkerLayer from './Layers/Marker/MarkerLayer'
import InteractiveViewport from '../InteractiveViewport'

export default class MapViewport extends InteractiveViewport {
  x = 0
  y = 0
  z = 0

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
    this.setViewport(-180, 180, -90, 90)
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    gl.clearDepth(1.0)
    gl.enable(gl.BLEND)
    // gl.colorMask(false, false, false, true)
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    this.layers.push(new TileGroupLayer(this))
    this.layers.push(new MarkerLayer(this))
    for (const layer of this.layers) {
      layer.mount()
    }
  }
}
