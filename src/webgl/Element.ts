// import Layer from './Layer'

export default abstract class Element {
  x = 0
  y = 0
  z = 0
  // offset
  // parent
  // layer: Layer

  // constructor (layer: Layer) {
  //   this.layer = layer
  // }

  setPos (x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  mount (): void {
    //
  }

  unmount (): void {
    //
  }

  abstract render (): void
}
