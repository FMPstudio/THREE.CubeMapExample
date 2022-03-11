precision highp float;

uniform vec3 uCameraPos;
uniform samplerCube uCubeTexture;

in vec2 vUv;
in vec3 vPosition;

out vec4 fragColor;

const float HALF_PI = 1.5707963268;
const float viewAngle = 180.0;

void main()
{
	// Move to center
	vec2 tc = vUv * 2.0 - 1.0;
  tc *= vec2(1.5, 1.0); // @TODO use aspect ratio
	
	// Distance from center pixel
	float d = length(tc);

	// out of view?
	if (d > 1.0) discard;
    
	// spherical coords from the pixel position
  float theta = d * HALF_PI * viewAngle / 180.0;
	float phi = atan(tc.y, tc.x);
	
	// back to cartesian	
	vec3 sp = vec3(
				sin(theta) * cos(phi),
				sin(theta) * sin(phi),
				-cos(theta));

    // it's as simple as that!
	fragColor = texture(uCubeTexture, sp);
}
