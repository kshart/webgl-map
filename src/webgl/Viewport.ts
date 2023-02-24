import Layer from './Layer'

export default class Viewport {
  gl: WebGLRenderingContext
  layers: Layer[]

  constructor (gl: WebGLRenderingContext) {
    this.gl = gl
    this.layers = []
  }

  render (): void {
    for (const layer of this.layers) {
      layer.render()
    }
  }
}
