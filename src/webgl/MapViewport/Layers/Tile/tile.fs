precision highp float;
uniform float opacity;
uniform sampler2D uSampler;
varying vec2 vTextureCoords;

void main() {
    // gl_FragColor = vec4(vTextureCoords.x, vTextureCoords.x, vTextureCoords.x, 1.0);
    if (opacity <= 0.0) {
        gl_FragColor = vec4(vTextureCoords.x, vTextureCoords.y, 0.0, 1.0);
    } else {
        vec4 color = texture2D(uSampler, vTextureCoords);
        color.a = color.a * opacity;
        gl_FragColor = color;
    }
}
