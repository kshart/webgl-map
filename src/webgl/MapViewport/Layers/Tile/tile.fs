precision highp float;
uniform float layerOpacity;
uniform float tileOpacity;
uniform sampler2D uSampler;
varying vec2 vTextureCoords;

void main() {
    // gl_FragColor = vec4(vTextureCoords.x, vTextureCoords.y, 1.0, 1.0);
    if (layerOpacity <= 0.0) {
        gl_FragColor = vec4(vTextureCoords.x, vTextureCoords.y, 0.0, 1.0);
    } else {
        vec4 color = texture2D(uSampler, vTextureCoords);
        color.a = color.a * layerOpacity * tileOpacity;
        gl_FragColor = color;
    }
}
