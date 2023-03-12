import Layer from '@/webgl/Layer'
import vsSource from './marker.vs'
import fsSource from './marker.fs'
import MarkerElement from './MarkerElement'
import matrix from '@/webgl/matrix'

export default class MarkerLayer extends Layer<MarkerElement> {
  program?: WebGLProgram

  attribs?: {
    vertex: number
  }

  uniforms?: {
    [index: string]: WebGLUniformLocation | null
  }

  buffers = {
    vertex: null as WebGLBuffer | null
  }

  mount (): void {
    const gl = this.viewport.gl
    const program = gl.createProgram()
    if (!program) {
      throw new Error('Unable to initialize the shader program.')
    }
    this.program = program
    this.attribs = {
      vertex: -1
    }
    this.uniforms = {
      offsetMarker: null,
      viewMatrix: null,
      scaleMatrix: null,
    }
    gl.attachShader(this.program, this.loadShader(gl.VERTEX_SHADER, vsSource))
    gl.attachShader(this.program, this.loadShader(gl.FRAGMENT_SHADER, fsSource))
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(`Unable to initialize the shader program.\n${gl.getProgramInfoLog(this.program)}`)
    }

    gl.useProgram(this.program)

    this.attribs.vertex = gl.getAttribLocation(this.program, 'aVertexPosition')
    for (const name in this.uniforms) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name)
    }

    gl.uniform1f(this.uniforms.opacity, 0.0)

    gl.enableVertexAttribArray(this.attribs.vertex)
    console.log(this)
    const vertexBuffer = gl.createBuffer()
    if (!vertexBuffer) {
      throw new Error('Fail create buffer')
    }

    const vertices = []
    const totalPoints = 40
    for (let i = 0; i <= totalPoints; i++) {
      const angle = 2 * Math.PI * i / totalPoints
      const x = 0.02 * Math.cos(angle)
      const y = 0.01 * Math.sin(angle)
      vertices.push(x)
      vertices.push(y)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    this.buffers.vertex = vertexBuffer

    const childs = []
    for (let x = 0; x < 256 * 8; x++) {
      childs.push(new MarkerElement(this, Math.random() * 360 - 180, Math.random() * 180 - 90))
    }
    this.addChilds(childs)
  }

  updateView (): void {
    console.log('updateView')
  }

  render (): void {
    if (!this.program || !this.uniforms || !this.attribs || !this.buffers.vertex) {
      throw new Error('Fatal Error')
    }
    const gl = this.viewport.gl
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height))
    gl.uniformMatrix4fv(this.uniforms.scaleMatrix, false, matrix.perspectiveV3(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height))
    // gl.uniformMatrix4fv(this.uniforms.scaleMatrix, false, new Float32Array([
    //   1, 0, 0, 0,
    //   0, 1, 0, 0,
    //   0, 0, 1, 0,
    //   0, 0, 0, 1,
    // ]))
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex)
    gl.vertexAttribPointer(this.attribs.vertex, 2, gl.FLOAT, false, 0, 0)

    for (const child of this.childs) {
      child.render()
    }
  }
}
