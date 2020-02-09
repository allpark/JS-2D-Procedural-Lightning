#ifdef GL_ES
	precision mediump float;
	precision mediump int;
#endif


uniform sampler2D texture;
varying vec2 uv;			
						
uniform sampler2D frameBuffer;
uniform vec2 resolution;
uniform vec2 direction;
uniform float radius;


void main() {

	gl_FragColor = vec4(texture2D(frameBuffer, vec2(uv.x, 1.0 - uv.y)).rgb,1.0);                
	
}


