import Layer from '@/webgl/Layer'
import matrix from '@/webgl/matrix'
import vsSource from './tile.vs'
import fsSource from './tile.fs'
import TileElement from './TileElement'

/**
 * Слой с тайтлами для определенного зума.
 * @TODO ленивая загрузка только видимых тайтлов
 */
export default class TileLayer extends Layer<TileElement> {
  private program?: WebGLProgram

  private attribLocations?: {
    textureCoords: number
    vertex: number
  }

  /**
   * Для биндов тайлов
   */
  public uniforms?: {
    [index: string]: WebGLUniformLocation | null
  }

  private vertexBuffer?: WebGLBuffer
  private textureCoordsBuffer?: WebGLBuffer

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

  /**
   * @override
   */
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
      layerOpacity: null,
      tileOpacity: null,
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
      0.0, -180 / tileCount,
      360 / tileCount, 0.0,
      360 / tileCount, -180 / tileCount,
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
    setTimeout(() => this.loadTiles(), 1000)
  }

  /**
   * Загрузить тайтлы в слой
   */
  loadTiles () {
    if (!this.viewport?.viewMatrix) {
      return
    }
    const tileCount = this.tileCount
    let [left, top] = matrix.multiply4toPoint(this.viewport.viewMatrix, new Float32Array([-1, 1, 1, 1]))
    let [right, bottom] = matrix.multiply4toPoint(this.viewport.viewMatrix, new Float32Array([1, -1, 1, 1]))
    left = (left + 180) / 360 * tileCount
    right = (right + 180) / 360 * tileCount
    top = (-top + 90) / 180 * tileCount
    bottom = (-bottom + 90) / 180 * tileCount
    const offset = 0
    left = Math.min(Math.max(Math.floor(left - offset), 0), tileCount)
    right = Math.min(Math.max(Math.ceil(right + offset), 0), tileCount)
    top = Math.min(Math.max(Math.floor(top - offset), 0), tileCount)
    bottom = Math.min(Math.max(Math.ceil(bottom + offset), 0), tileCount)
    // top = 0
    // bottom = tileCount
    // left = 0
    // right = tileCount
    const loadBox = {
      top,
      bottom,
      left,
      right,
    }
    const xn = ((this.x + 180) / 360) * tileCount
    const yn = ((-this.y + 90) / 180) * tileCount

    const toLoad = []
    const loadTileUrls = new Set()
    for (let x = loadBox.left; x < loadBox.right; x++) {
      for (let y = loadBox.top; y < loadBox.bottom; y++) {
        const url = this.urlBuilder(x, y, this.tileZ)
        loadTileUrls.add(url)
        toLoad.push({
          x,
          y,
          url,
          length: Math.sqrt((x - xn + 0.5) ** 2 + (y - yn + 0.5) ** 2)
        })
      }
    }
    toLoad.sort((a, b) => a.length - b.length)

    // this.removeChilds(this.childs.filter(ch => !loadTileUrls.has(ch.url)))

    const newChilds = []
    for (const { x, y, url } of toLoad.slice(0, 256).filter(conf => !this.childs.find(ch => ch.url === conf.url))) {
      newChilds.push(new TileElement(this, url, (x / tileCount) * 360 - 180, (y / tileCount) * -180 + 90))
    }
    this.addChilds(newChilds)
  }

  /**
   * @override
   */
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
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(viewRight, viewLeft, viewTop, viewBottom, -10, 10))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspectiveV2(this.x, this.y, this.z, gl.canvas.width / gl.canvas.height))
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]))
    // gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, matrix.perspective(-90 / 1.5, 90 / 1.5, 45 / 1.5, -45 / 1.5, 1, 10))
  }

  /**
   * @override
   */
  render (): void {
    if (!this.program || !this.uniforms || !this.attribLocations || !this.vertexBuffer || !this.textureCoordsBuffer || !this.viewport?.viewMatrix) {
      throw new Error('Fatal Error')
    }
    const gl = this.viewport.gl
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, this.viewport.viewMatrix)
    gl.uniform1f(this.uniforms.layerOpacity, this.opacity)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.vertexAttribPointer(this.attribLocations.vertex, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer)
    gl.vertexAttribPointer(this.attribLocations.textureCoords, 2, gl.FLOAT, false, 0, 0)

    // gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    // gl.colorMask(false, false, false, true)
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    for (const child of this.childs) {
      child.render()
    }
  }
}
