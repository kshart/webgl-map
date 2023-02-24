// precision highp float;
uniform vec2 offsetTile;
uniform mat4 layerMatrix;
uniform mat4 viewMatrix;
attribute vec2 aVertexPosition;
attribute vec2 aVertexTextureCoords;
varying vec2 vTextureCoords;

void main() {
    vec4 position = vec4(aVertexPosition, 0.0, 1.0);
    position.x = position.x + offsetTile.x;
    position.y = position.y + offsetTile.y;
    gl_Position = viewMatrix * layerMatrix * position;
    // gl_Position.z = 0.0;
    vTextureCoords = aVertexTextureCoords;
    // vTextureCoords = vec2(((viewMatrix * layerMatrix * position)[1] + 1.0) / 2.0, 0.0);
}
