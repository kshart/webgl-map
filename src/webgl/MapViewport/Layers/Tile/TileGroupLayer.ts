import Layer from '@/webgl/Layer'
import matrix from '@/webgl/matrix'
import TileLayer from './TileLayer'
import TileElement from './TileElement'

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

  /**
   * Element Cleaner
   * Максимальное колличество тайтлов во всех слоях
   * Планировщик будет ходить по слоям каждые ecTimeout и удлять лишние элименты
   */
  ecMaxElements = 64
  /**
   * Максимальное колличество тайтлов для удаления в 1 итерацию
   */
  // ecIterateMaxRemoveElements = 32
  ecTimeout = 1000
  ecTimeoutHandler = 0

  ecExecute () {
    const allTiles = []
    for (const layer of this.childs) {
      for (const tile of layer.childs) {
        allTiles.push({
          tile,
          layer,
          weight: tile.ecGetWeight(),
        })
      }
    }
    console.log('ecExecute n=' + allTiles.length)
    if (allTiles.length > this.ecMaxElements) {
      allTiles.sort((a, b) => b.weight - a.weight)
      allTiles.splice(allTiles.length - this.ecMaxElements, allTiles.length)
      const layerMap = new Map<TileLayer, Set<TileElement>>()
      for (const conf of allTiles) {
        let set = layerMap.get(conf.layer)
        if (!set) {
          set = new Set<TileElement>()
          layerMap.set(conf.layer, set)
        }
        set.add(conf.tile)
      }
      for (const [layer, set] of layerMap) {
        layer.removeChilds(Array.from(set))
      }
      console.log('ecExecute remove=' + allTiles.length)
    }
    this.ecTimeoutHandler = setTimeout(() => this.ecExecute(), this.ecTimeout)
  }

  /**
   * @override
   */
  mount (): void {
    this.setZoom(this.minZoom)
    this.ecTimeoutHandler = setTimeout(() => this.ecExecute(), this.ecTimeout)
  }

  unmount (): void {
    clearTimeout(this.ecTimeoutHandler)
    this.ecTimeoutHandler = 0
    super.unmount()
  }

  /**
   * @override
   */
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

  /**
   * @override
   */
  updateView (): void {
    for (const child of this.childs) {
      child.updateView()
    }
  }

  /**
   * @override
   */
  private setZoom (zoom: number): void {
    console.log('setZoom ' + zoom, this)
    const toRemove: TileLayer[] = []
    for (const [index, conf] of this.tileLayers) {
      if (index > zoom) {
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
