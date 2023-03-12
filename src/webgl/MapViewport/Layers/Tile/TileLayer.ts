import Layer from '@/webgl/Layer'
import vsSource from './tile.vs'
import fsSource from './tile.fs'
import TileElement from './TileElement'
import matrix from '@/webgl/matrix'

export default class TileLayer extends Layer<TileElement> {
  program?: WebGLProgram

  attribLocations?: {
    textureCoords: number
    vertex: number
  }

  uniforms?: {
    [index: string]: WebGLUniformLocation | null
  }

  vertexBuffer?: WebGLBuffer
  textureCoordsBuffer?: WebGLBuffer

  tileSize = 256

  tileZ = 1
  opacity = 1
  urlBuilder = (x: number, y: number, z: number): string => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

  // 1 2x2
  //
  // x 180 : 180
  // y -90 : 90

  get tileCount () {
    return 2 ** this.tileZ
  }

  mount (): void {
    const gl = this.viewport.gl
    const program = gl.createProgram()
    if (!program) {
      throw new Error('Unable to initialize the shader program.')
    }
    this.program = program
    this.attribLocations = {
      textureCoords: -1,
      vertex: -1
    }
    this.uniforms = {
      offsetTile: null,
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
    for (const name in this.uniforms) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name)
    }

    const tileCount = this.tileCount
    gl.enableVertexAttribArray(this.attribLocations.vertex)
    gl.enableVertexAttribArray(this.attribLocations.textureCoords)
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
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    ]), gl.STATIC_DRAW)
    this.vertexBuffer = vertexBuffer
    this.textureCoordsBuffer = textureCoordsBuffer
    this.loadTiles()
  }

  loadTiles () {
    const tileCount = this.tileCount
    const loadBox = {
      top: 0,
      bottom: tileCount,
      left: 0,
      right: tileCount,
    }
    const xn = (this.x + 180) / 360 * tileCount
    const yn = (this.y + 90) / 180 * tileCount

    const toLoad = []
    for (let x = loadBox.left; x < loadBox.right; x++) {
      for (let y = loadBox.top; y < loadBox.bottom; y++) {
        toLoad.push({
          x,
          y,
          length: Math.sqrt((x - xn + 0.5) ** 2 + (y - yn + 0.5) ** 2)
        })
      }
    }
    toLoad.sort((a, b) => a.length - b.length)
    for (const { x, y } of toLoad.slice(0, 100)) {
      this.addChilds([
        new TileElement(this, this.urlBuilder(x, y, this.tileZ), (x / tileCount) * 360 - 180, (y / tileCount) * 180 - 90),
      ])
    }
    // for (let x = 0; x < tileCount; x++) {
    //   for (let y = 0; y < tileCount; y++) {
    //     this.addChilds([
    //       new TileElement(this, this.urlBuilder(x, y, this.tileZ), (x / tileCount) * 360 - 180, (y / tileCount) * 180 - 90),
    //     ])
    //   }
    // }
  }

  updateView (): void {
    if (!this.program || !this.uniforms) {
      throw new Error('Fatal Error')
    }
    const gl = this.viewport.gl
    gl.useProgram(this.program)
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(2, 1, -100, 100))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(0, gl.canvas.width, gl.canvas.height, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(0, 1000, 1000, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(0, 1000, 1000, 0, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(this.viewport.viewRight, this.viewport.viewLeft, this.viewport.viewTop, this.viewport.viewBottom, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height))
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(-90 / 1.5, 90 / 1.5, 45 / 1.5, -45 / 1.5, 1, 10))
  }

  render (): void {
    if (!this.program || !this.uniforms || !this.attribLocations || !this.vertexBuffer || !this.textureCoordsBuffer) {
      throw new Error('Fatal Error')
    }
    const gl = this.viewport.gl
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height))
    gl.uniform1f(this.uniforms.opacity, this.opacity)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.attribLocations.vertex, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer)
    gl.vertexAttribPointer(this.attribLocations.textureCoords, 2, gl.FLOAT, false, 0, 0)

    for (const child of this.childs) {
      child.render()
    }
  }
}
