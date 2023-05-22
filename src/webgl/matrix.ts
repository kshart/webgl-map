const transpose = (data: Float32Array): Float32Array => {
  const result = new Float32Array(4 * 4)
  let i = 0
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      result[i++] = data[x * 4 + y]
    }
  }
  return result
}

const invert = (te: Float32Array): Float32Array => {
  // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
  const n11 = te[0]
  const n21 = te[1]
  const n31 = te[2]
  const n41 = te[3]
  const n12 = te[4]
  const n22 = te[5]
  const n32 = te[6]
  const n42 = te[7]
  const n13 = te[8]
  const n23 = te[9]
  const n33 = te[10]
  const n43 = te[11]
  const n14 = te[12]
  const n24 = te[13]
  const n34 = te[14]
  const n44 = te[15]
  const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44
  const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44
  const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44
  const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34

  const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14

  if (det === 0) {
    return new Float32Array()
  }

  const detInv = 1 / det

  te[0] = t11 * detInv
  te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv
  te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv
  te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv

  te[4] = t12 * detInv
  te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv
  te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv
  te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv

  te[8] = t13 * detInv
  te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv
  te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv
  te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv

  te[12] = t14 * detInv
  te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv
  te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv
  te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv

  return te
}

export default {
  multiply4toPoint (m1: Float32Array, point: Float32Array): Float32Array {
    const m1t = new Float32Array(invert(transpose(m1)))
    const result = new Float32Array(4)
    for (let y = 0; y < 4; y++) {
      let sum = 0
      for (let k = 0; k < 4; k++) {
        sum += m1t[y * 4 + k] * point[k]
      }
      result[y] = sum
    }
    // for (let y = 0; y < 4; ++y) {
    //   let sum = 0
    //   for (let i = 0; i < 4; ++i) {
    //     sum += a[y * 4 + i] * point[i]
    //   }
    //   result[y] = sum
    // }
    // console.log(result.toString(), point.toString())
    return result
  },
  // 0.0036815423518419266,0,0,0,
  // 0,-0.011111111380159855,0,0,
  // 0,0,1,0,
  // 0.611817479133606,0.004514672793447971,0,1

  // 0.6626776456832886,-1,1,111.5334701538086
  // 180,90,1,1
  // 0.0036815423518419266,0,0,0,0,-0.011111111380159855,0,0,0,0,1,0,0,0,0,1 0,0,1,1 0,0,1,1

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
    return transpose(new Float32Array([
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
    // z--
    // z = Math.sqrt(z)
    z = z / 2
    // z = Math.log(z)
    const zi = z - 1
    return new Float32Array([
      (2 ** zi) / (45 * aspect), 0, 0, 0,
      0, 2 ** z / 45, 0, 0,
      0, 0, 1, 0,
      (-x * 2 ** zi) / (45 * aspect), (y * 2 ** z) / -45, 0, 1
    ])
  },

  perspectiveV3 (x: number, y: number, z: number, aspect: number): Float32Array {
    // z--
    // z = Math.sqrt(z)
    z = z / 2
    // z = Math.log(z)
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
