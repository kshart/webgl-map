import Element from '@/webgl/Element'
import MarkerLayer from './MarkerLayer'

export default class MarkerElement extends Element {
  layer: MarkerLayer

  constructor (layer: MarkerLayer, x: number, y: number) {
    super()
    this.x = x
    this.y = y
    this.layer = layer
  }

  render (): void {
    if (!this.layer.uniformLocations) {
      throw new Error('Fatal Error')
    }
    const gl = this.layer.gl
    gl.uniform2f(this.layer.uniformLocations.offsetMarker, this.x, this.y)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 100 * 2)
  }
}
