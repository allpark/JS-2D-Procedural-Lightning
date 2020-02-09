#ifdef GL_ES
	precision mediump float;
	precision mediump int;
#endif


uniform sampler2D texture;
varying vec2 uv;			
						
uniform sampler2D frameBuffer;
uniform sampler2D texnoise;
uniform float time;

#define tileX 8.0
#define tileY 8.0 

#define tileX2 2.0
#define tileY2 2.0 

#define distortStrength 0.002
#define distortStrength2 0.06

vec2 setAmplitude(vec2 noise, float amp){
	return mix(vec2(0.0, 0.0), noise, amp);
}

float getTime(){
	return time * 0.1;
}
void main() {

	vec2 uv = vec2(uv.x, 1.0 - uv.y);
	float t = getTime();
	
	
	// sample noise (high frequency)
	vec2 uv_noise  = texture2D(texnoise, vec2(mod( (uv.x * tileX) + t, 1.0), mod( (uv.y * tileY) + t, 1.0)) ).rg * 2.0 - 1.0;
	
	// sample noise (low frequency)
	vec2 uv_noise2 = texture2D(texnoise, vec2(mod(uv.x * tileX2 - t, 1.0), mod(uv.y * tileX2 + t, 1.0)) ).rg * 2.0 - 1.0;

	vec2 combined_noise = (setAmplitude(uv_noise, distortStrength) + setAmplitude(uv_noise2, distortStrength2)) * 0.5;
	
	
	vec3 tap0  = texture2D(frameBuffer, uv + combined_noise).rgb;
	vec3 tap1 = texture2D(frameBuffer, uv + combined_noise * 1.1).rgb;
	
	gl_FragColor = vec4(tap0.r, tap0.g, tap1.b, 1.0);                
	
}


