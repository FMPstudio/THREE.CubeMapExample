precision highp float;

in vec3 position;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;
out vec3 vPosition;

void main() {
  vUv = uv;
  vec4 ndc = vec4(position, 1.0);
  vPosition = ndc.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * ndc;
}
