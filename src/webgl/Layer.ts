import Element from './Element'

export default abstract class Layer {
  gl: WebGLRenderingContext
  elements: Element[]

  x = 0
  y = 0
  z = 0

  constructor (gl: WebGLRenderingContext) {
    this.gl = gl
    this.elements = []
  }

  render (): void {
    for (const element of this.elements) {
      element.render()
    }
  }

  loadShader (type: number, source: string): WebGLShader {
    const gl = this.gl
    const shader = gl.createShader(type)
    if (!shader) {
      throw new Error('Fail create shader')
    }
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)
      throw new Error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}\n${source}`)
    }

    return shader
  }

  addElements (elements: Element[]) {
    for (const element of elements) {
      // element.layer = this
      this.elements.push(element)
    }
  }

  setPos (x: number, y: number, z: number) {
    this.x = (x / this.gl.canvas.width) * 360
    this.y = (y / this.gl.canvas.height) * 180
    this.z = z
  }

  abstract init (): void
}
