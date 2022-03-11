precision highp float;

uniform samplerCube uCubeTexture;

in vec3 vPosition;

out vec4 fragColor;

void main() {
  vec3 color = texture(uCubeTexture, vPosition).rgb;
  fragColor = vec4(color, 1.0);
}
