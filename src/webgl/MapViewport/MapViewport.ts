import WebGLDebugUtils from '../webgl-debug.js'
import TileLayer from './Layers/Tile/TileLayer'
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
      powerPreference: 'high-performance',
    })
    if (!gl) {
      throw new Error('Context webgl not created')
    }
    super(canvas, gl)
    this.setViewport(-180, 180, -90, 90)
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    gl.clearDepth(1.0)

    this.layers.push(new TileLayer(this))
    this.layers.push(new MarkerLayer(this))
    for (const layer of this.layers) {
      layer.init()
    }
  }
}
