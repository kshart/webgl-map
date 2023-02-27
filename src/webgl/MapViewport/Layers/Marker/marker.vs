uniform vec2 offsetMarker;
uniform mat4 scaleMatrix;
uniform mat4 viewMatrix;
attribute vec2 aVertexPosition;

void main() {
    vec4 position = scaleMatrix * vec4(aVertexPosition, 0.0, 1.0);
    position.x = position.x + offsetMarker.x;
    position.y = position.y + offsetMarker.y;
    gl_Position = viewMatrix * position;
}
