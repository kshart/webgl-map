import Layer from '@/webgl/Layer'
import TileLayer from './TileLayer'

interface TileLayerConfig {
  visible: boolean
  layer: TileLayer
}

/**
 * Набор слоев с тайтлами, с разными зумами.
 * Отображается слой с подходящим зумом.
 * @TODO нужна ленивая выгрузка\загрузка слоев
 */
export default class TileGroupLayer extends Layer<TileLayer> {
  cachedLayers = 0
  minZoom = 3
  maxZoom = 15
  currentZoom?: number
  tileLayers = new Map<number, TileLayerConfig>()
  mount (): void {
    this.setZoom(this.minZoom)
  }

  setPos (x: number, y: number, z: number) {
    let zoom = z
    if (zoom < this.minZoom) {
      zoom = this.minZoom
    }
    if (zoom > this.maxZoom) {
      zoom = this.maxZoom
    }
    zoom = Math.round(zoom)
    if (zoom !== this.currentZoom) {
      this.setZoom(zoom)
    }

    super.setPos(x, y, z)
    for (const child of this.childs) {
      child.setPos(x, y, z)
    }
  }

  updateView (): void {
    for (const child of this.childs) {
      child.updateView()
    }
  }

  private setZoom (zoom: number): void {
    const toRemove: TileLayer[] = []
    for (const [index, conf] of this.tileLayers) {
      if (index !== zoom) {
        console.log(`remove zoom(${conf.layer.tileZ}) layer`)
        toRemove.push(conf.layer)
        this.tileLayers.delete(index)
      }
    }
    if (toRemove.length > 0) {
      this.removeChilds(toRemove)
    }
    if (!this.tileLayers.has(zoom)) {
      console.log(`add zoom(${zoom}) layer`)
      const layer = new TileLayer(this.viewport)
      layer.tileZ = zoom
      this.addChilds([layer])
      this.tileLayers.set(zoom, {
        visible: true,
        layer
      })
    }
    this.currentZoom = zoom
  }
}
