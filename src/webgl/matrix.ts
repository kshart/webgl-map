const transpose = (data: number[]): number[] => {
  const result = [] as number[]
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      result.push(data[y * 4 + x])
    }
  }
  return result
}
export default {
  /**
   * Construct a perspective matrix
   * Field of view - the angle in radians of what's in view along the Y axis
   * Aspect Ratio - the ratio of the canvas, typically canvas.width / canvas.height
   * Near - Anything before this point in the Z direction gets clipped (resultside of the clip space)
   * Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
   */
  // perspective (fieldOfViewInRadians: number, aspectRatio: number, near: number, far: number): Float32Array {
  //   const f = 1.0 / Math.tan(fieldOfViewInRadians / 2)
  //   const rangeInv = 1 / (near - far)

  //   return new Float32Array([
  //     f / aspectRatio, 0, 0, 0,
  //     0, f, 0, 0,
  //     0, 0, (near + far) * rangeInv, -1,
  //     0, 0, near * far * rangeInv * 2, 0
  //   ])
  // },

  perspective (left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
    // const f = 1.0 / Math.tan(2 / 2)
    // const rangeInv = 1 / (near - far)

    // return new Float32Array([
    //   f, 0, 0, 0,
    //   0, f, 0, 0,
    //   0, 0, (near + far) * rangeInv, -1,
    //   0, 0, near * far * rangeInv * 2, 0
    // ])

    // const x = 2 * near / (right - left)
    // const y = 2 * near / (top - bottom)
    // const a = (right + left) / (right - left)
    // const b = (top + bottom) / (top - bottom)
    // const c = -(far + near) / (far - near)
    // const d = -2 * far * near / (far - near)

    // return new Float32Array(transpose([
    //   x, 0, 0, 0,
    //   0, y, 0, 0,
    //   a, b, c, -1,
    //   0, 0, d, 0,
    // ]))
    // return new Float32Array([
    //   f, 0, 0, 0,
    //   0, f, 0, 0,
    //   0, 0, (near + far) * rangeInv, -1,
    //   0, 0, near * far * rangeInv * 2, 0
    // ])

    const height = Math.abs(bottom - top)
    const width = Math.abs(right - left)

    // return new Float32Array([
    //   near / (width / 2), 0, (left + right) / (width / 2), 0,
    //   0, near / (height / 2), (top + bottom) / (height / 2), 0,
    //   0, 0, -(far + near) / (far - near), (2 * far * near) / (far - near),
    //   0, 0, -1, 0
    // ])
    // return new Float32Array([
    //   2 * near / (right - left), 0, (right + left) / (right - left), 0,
    //   0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0,
    //   0, 0, -(far + near) / (far - near), (-2 * far * near) / (far - near),
    //   0, 0, -1, 0
    // ])
    // const rl = 1 / (right - left)
    // const tb = 1 / (top - bottom)
    // const nf = 1 / (near - far)
    // return new Float32Array(transpose([
    //   near * 2 * rl, 0, 0, 0,
    //   0, near * 2 * tb, 0, 0,
    //   (right + left) * rl, (top + bottom) * tb, (far + near) * nf, -1,
    //   0, 0, far * near * 2 * nf, 0
    // ]))
    // return new Float32Array([
    //   near * 2 * rl, 0, (right + left) * rl, 0,
    //   0, near * 2 * tb, (top + bottom) * tb, 0,
    //   0, 0, (far + near) * nf, far * near * 2 * nf,
    //   0, 0, -1, 0
    // ])

    // return new Float32Array([
    //   2 / (right - left), 0, 0, 0,
    //   0, 2 / (top - bottom), 0, 0,
    //   0, 0, 1, 0,
    //   0, 0, 0, 1,
    // ])
    return new Float32Array(transpose([
      2 * near / (right - left), 0, 0, -near * (right + left) / (right - left),
      0, 2 * near / (top - bottom), 0, -near * (top + bottom) / (top - bottom),
      0, 0, -(far + near) / (far - near), 2 * far * near / (near - far),
      0, 0, -1, 0,
    ]))
    // return new Float32Array([
    //   2 * near / (right - left), 0, 0, 0,
    //   0, 2 * near / (top - bottom), 0, 0,
    //   0, 0, -(far + near) / (far - near), -1,
    //   -near * (right + left) / (right - left), -near * (top + bottom) / (top - bottom), 2 * far * near / (near - far), 0,
    // ])
  },

  /**
   * @see https://www.wolframalpha.com/input?i2d=true&i=transpose+%7B%7BDivide%5BPower%5B2%2C%5C%2840%29z%2B1%5C%2841%29%5D%2CDivide%5B180%2Ca%5D%5D%2C0%2C0%2C0%7D%2C%7B0%2CDivide%5BPower%5B2%2Cz%2B1%5D%2C90%5D%2C0%2C0%7D%2C%7B0%2C0%2C1%2C0%7D%2C%7B0%2C0%2C0%2C1%7D%7D%7B%7B1%2C0%2C0%2C0%7D%2C%7B0%2C-1%2C0%2C0%7D%2C%7B0%2C0%2C1%2C0%7D%2C%7B0%2C0%2C0%2C1%7D%7D%7B%7B1%2C0%2C0%2Cx%7D%2C%7B0%2C1%2C0%2Cy%7D%2C%7B0%2C0%2C1%2C0%7D%2C%7B0%2C0%2C0%2C1%7D%7D
   */
  perspectiveV2 (x: number, y: number, z: number, aspect: number): Float32Array {
    z--
    const zi = z - 1
    return new Float32Array([
      (2 ** zi) / (45 * aspect), 0, 0, 0,
      0, 2 ** z / -45, 0, 0,
      0, 0, 1, 0,
      (x * 2 ** zi) / (45 * aspect), (y * 2 ** z) / -45, 0, 1
    ])
  },

  perspectiveV3 (x: number, y: number, z: number, aspect: number): Float32Array {
    z--
    const zi = z - 1
    return new Float32Array([
      45 * 2 ** (1 - z), 0, 0, 0,
      0, -45 * 2 ** (1 - z), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    // return new Float32Array([
    //   (2 ** zi) / (15 * aspect), 0, 0, 0,
    //   0, 2 ** z / -15, 0, 0,
    //   0, 0, 1, 0,
    //   3 * x, 3 * y, 0, 1
    // ])
    return new Float32Array([
      z, 0, 0, 0,
      0, z / 2, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    return new Float32Array([
      (2 ** zi) / (45 * aspect), 0, 0, 0,
      0, 2 ** z / -45, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    return new Float32Array([
      (2 ** zi) / (45 * aspect), 0, 0, 0,
      0, 2 ** z / -45, 0, 0,
      0, 0, 1, 0,
      (x * 2 ** zi) / (45 * aspect), (y * 2 ** z) / -45, 0, 1
    ])
  },

  /**
   * Each of the parameters represents the plane of the bounding box
   */
  orthographic (left: number, right: number, bottom: number, top: number, near: number, far: number): Float32Array {
    const lr = 1 / (left - right)
    const bt = 1 / (bottom - top)
    const nf = 1 / (near - far)

    const row4col1 = (left + right) * lr
    const row4col2 = (top + bottom) * bt
    const row4col3 = (far + near) * nf

    return new Float32Array([
      -2 * lr, 0, 0, 0,
      0, -2 * bt, 0, 0,
      0, 0, 2 * nf, 0,
      row4col1, row4col2, row4col3, 1
    ])
  }
}
