import Element from '@/webgl/Element'
import TileLayer from './TileLayer'

/**
 * Тайтл
 */
export default class TileElement extends Element {
  url: string
  layer: TileLayer
  texture: WebGLTexture
  image?: HTMLImageElement
  loaded = false

  constructor (layer: TileLayer, url: string, x: number, y: number) {
    super()
    this.image = new Image()
    this.x = x
    this.y = y
    this.url = url
    this.layer = layer
    const gl = layer.viewport.gl
    const texture = gl.createTexture()
    if (!texture) {
      throw new Error('Fatal error')
    }
    this.texture = texture

    this.image.crossOrigin = 'anonymous'
    this.image.onload = () => {
      if (!this.image) {
        return
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      this.image.src = ''
      this.image.remove()
      delete this.image
      this.loaded = true
    }
    this.image.src = url
  }

  /**
   * @override
   */
  unmount () {
    if (this.image) {
      this.image.src = ''
      this.image.remove()
      delete this.image
    }
    const gl = this.layer.viewport.gl
    gl.deleteTexture(this.texture)
  }

  /**
   * @override
   */
  render (): void {
    if (!this.layer.uniforms) {
      throw new Error('Fatal Error')
    }
    const gl = this.layer.viewport.gl
    gl.uniform2f(this.layer.uniforms.offsetTile, this.x, this.y)

    if (this.loaded) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }
}
