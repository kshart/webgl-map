import Layer from '@/webgl/Layer'
import vsSource from './tile.vs'
import fsSource from './tile.fs'
import TileElement from './TileElement'
import matrix from '@/webgl/matrix'

export default class TileLayer extends Layer {
  program?: WebGLProgram

  attribLocations?: {
    textureCoords: number
    vertex: number
  }

  uniformLocations?: {
    [index: string]: WebGLUniformLocation | null
  }

  vertexBuffer?: WebGLBuffer
  textureCoordsBuffer?: WebGLBuffer

  tileSize = 256

  tileZ = 4
  urlBuilder = (x: number, y: number, z: number): string => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

  // 1 2x2
  //
  // x 180 : 180
  // y -90 : 90

  init (): void {
    const gl = this.gl
    const program = gl.createProgram()
    if (!program) {
      throw new Error('Unable to initialize the shader program.')
    }
    this.program = program
    this.attribLocations = {
      textureCoords: -1,
      vertex: -1
    }
    this.uniformLocations = {
      offsetTile: null,
      layerMatrix: null,
      opacity: null,
      uSampler: null,
      viewMatrix: null,
    }
    gl.attachShader(this.program, this.loadShader(gl.VERTEX_SHADER, vsSource))
    gl.attachShader(this.program, this.loadShader(gl.FRAGMENT_SHADER, fsSource))
    gl.linkProgram(this.program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(`Unable to initialize the shader program.\n${gl.getProgramInfoLog(this.program)}`)
    }

    gl.useProgram(this.program)

    this.attribLocations.textureCoords = gl.getAttribLocation(this.program, 'aVertexTextureCoords')
    this.attribLocations.vertex = gl.getAttribLocation(this.program, 'aVertexPosition')
    for (const name in this.uniformLocations) {
      this.uniformLocations[name] = gl.getUniformLocation(this.program, name)
    }

    gl.uniform1f(this.uniformLocations.opacity, 0.0)
    console.log(gl.canvas.width, gl.canvas.height)
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(2, 1, -100, 100))
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(0, gl.canvas.width, gl.canvas.height, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(0, 1000, 1000, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(0, 1000, 1000, 0, -10, 10))
    gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(180, -180, -90, 90, -10, 10))
    // gl.uniformMatrix4fv(this.uniformLocations.viewMatrix, false, matrix.perspective(-90 / 1.5, 90 / 1.5, 45 / 1.5, -45 / 1.5, 1, 10))

    const tileCount = 2 ** this.tileZ

    gl.enableVertexAttribArray(this.attribLocations.vertex)
    gl.enableVertexAttribArray(this.attribLocations.textureCoords)
    console.log(this)
    const vertexBuffer = gl.createBuffer()
    const textureCoordsBuffer = gl.createBuffer()
    if (!textureCoordsBuffer || !vertexBuffer) {
      throw new Error('Fail create buffer')
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      0.0, 180 / tileCount,
      360 / tileCount, 0.0,
      360 / tileCount, 180 / tileCount,
    ]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 1,
      0, 0,
      1, 1,
      1, 0,
    ]), gl.STATIC_DRAW)
    this.vertexBuffer = vertexBuffer
    this.textureCoordsBuffer = textureCoordsBuffer

    for (let x = 0; x < tileCount; x++) {
      for (let y = 0; y < tileCount; y++) {
        this.addElements([
          new TileElement(this, this.urlBuilder(x, y, this.tileZ), (x / tileCount) * 360 - 180, (y / tileCount) * 180 - 90),
        ])
      }
    }
    // this.addElements([ww
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/334/160.png', 0, 0),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/335/160.png', this.tileSize, 0),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/334/161.png', 0, this.tileSize),
    //   new TileElement(this, 'https://tile.openstreetmap.org/9/335/161.png', this.tileSize, this.tileSize),
    // ])
  }

  render (): void {
    if (!this.program || !this.uniformLocations || !this.attribLocations || !this.vertexBuffer || !this.textureCoordsBuffer) {
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer)
    gl.vertexAttribPointer(this.attribLocations.textureCoords, 2, gl.FLOAT, false, 0, 0)

    for (const tileElement of this.elements) {
      tileElement.render()
    }
  }
}
