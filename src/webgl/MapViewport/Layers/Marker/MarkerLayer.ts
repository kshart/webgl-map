import Layer from '@/webgl/Layer'
import vsSource from './marker.vs'
import fsSource from './marker.fs'
import MarkerElement from './MarkerElement'
import matrix from '@/webgl/matrix'

export default class MarkerLayer extends Layer {
  program?: WebGLProgram

  attribLocations?: {
    vertex: number
  }

  uniformLocations?: {
    [index: string]: WebGLUniformLocation | null
  }

  vertexBuffer?: WebGLBuffer

  init (): void {
    const gl = this.gl
    const program = gl.createProgram()
    if (!program) {
      throw new Error('Unable to initialize the shader program.')
    }
    this.program = program
    this.attribLocations = {
      vertex: -1
    }
    this.uniformLocations = {
      offsetMarker: null,
      layerMatrix: null,
      viewMatrix: null,
    }
    gl.attachShader(this.program, this.loadShader(gl.VERTEX_SHADER, vsSource))
    gl.attachShader(this.program, this.loadShader(gl.FRAGMENT_SHADER, fsSource))
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(`Unable to initialize the shader program.\n${gl.getProgramInfoLog(this.program)}`)
    }

    gl.useProgram(this.program)

    this.attribLocations.vertex = gl.getAttribLocation(this.program, 'aVertexPosition')
    for (const name in this.uniformLocations) {
      this.uniformLocations[name] = gl.getUniformLocation(this.program, name)
    }

    gl.uniform1f(this.uniformLocations.opacity, 0.0)
    console.log(gl.canvas.width, gl.canvas.height)
    gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(180, -180, -90, 90, -10, 10))

    gl.enableVertexAttribArray(this.attribLocations.vertex)
    console.log(this)
    const vertexBuffer = gl.createBuffer()
    if (!vertexBuffer) {
      throw new Error('Fail create buffer')
    }

    const vertices = []
    const totalPoints = 100
    for (let i = 0; i <= totalPoints; i++) {
      const angle = 2 * Math.PI * i / totalPoints
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      vertices.push(x)
      vertices.push(y / 2)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    this.vertexBuffer = vertexBuffer

    for (let x = 0; x < 256 * 8; x++) {
      this.addElements([
        new MarkerElement(this, Math.random() * 360 - 180, Math.random() * 180 - 90),
      ])
    }
    // this.addElements([ww
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/334/160.png', 0, 0),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/335/160.png', this.tileSize, 0),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/334/161.png', 0, this.tileSize),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/335/161.png', this.tileSize, this.tileSize),
    // ])
  }

  render (): void {
    if (!this.program || !this.uniformLocations || !this.attribLocations || !this.vertexBuffer) {
      throw new Error('Fatal Error')
    }
    const gl = this.gl
    gl.useProgram(this.program)
    // this.x = 0.5
    // this.y = 0.5
    gl.uniformMatrix4fv(this.uniformLocations.layerMatrix, false, new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      this.x, this.y, this.z + 1, 1.0
    ]))
    // console.log(this.x, this.y, this.z)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.attribLocations.vertex, 2, gl.FLOAT, false, 0, 0)

    for (const element of this.elements) {
      element.render()
    }
  }
}
