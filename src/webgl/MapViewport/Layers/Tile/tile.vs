// precision highp float;
uniform vec2 offsetTile;
uniform mat4 viewMatrix;
attribute vec2 aVertexPosition;
attribute vec2 aVertexTextureCoords;
varying vec2 vTextureCoords;

void main() {
    vec4 position = vec4(aVertexPosition, 1.0, 1.0);
    position.x = position.x + offsetTile.x;
    position.y = position.y + offsetTile.y;
    gl_Position = viewMatrix * position;
    vTextureCoords = aVertexTextureCoords;
    // vTextureCoords = vec2(((viewMatrix * position)[1] + 1.0) / 2.0, 0.0);
}
