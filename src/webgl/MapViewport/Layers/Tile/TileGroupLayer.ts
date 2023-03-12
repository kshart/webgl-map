import Layer from '@/webgl/Layer'
import TileLayer from './TileLayer'

export default class TileGroupLayer extends Layer<TileLayer> {
  init (): void {
    this.addChilds([
      new TileLayer(this.viewport),
    ])
  }

  setPos (x: number, y: number, z: number) {
    if (z > 3) {
      const l = new TileLayer(this.viewport)
      l.tileZ = 3
      this.addChilds([l])
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
}
