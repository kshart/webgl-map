import Element from './Element'
import Viewport from './Viewport'

export default abstract class Layer<ChildType extends Element> extends Element {
  viewport: Viewport
  childs: ChildType[]

  x = 0
  y = 0
  z = 0

  constructor (viewport: Viewport) {
    super()
    this.viewport = viewport
    this.childs = []
  }

  render (): void {
    for (const child of this.childs) {
      child.render()
    }
  }

  loadShader (type: number, source: string): WebGLShader {
    const gl = this.viewport.gl
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

  addChilds (childs: ChildType[]) {
    for (const child of childs) {
      // element.layer = this
      this.childs.push(child)
      child.init()
    }
  }

  abstract updateView (): void
}
