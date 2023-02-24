// import Layer from './Layer'

export default class Element {
  x = 0
  y = 0
  z = 0
  // layer: Layer

  // constructor (layer: Layer) {
  //   this.layer = layer
  // }

  render (): void {
    console.log('render')
  }

  setPos (x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
}
