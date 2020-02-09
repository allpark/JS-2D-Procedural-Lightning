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
uniform float time;

void main() {
	vec4 color = vec4(0.0);
    
    vec2 dir   = vec2(direction)* 0.4;
    
    // offsets for gauss sampling 
	vec2 off1 = vec2(1.411764705882353) * dir * radius;
	vec2 off2 = vec2(3.2941176470588234) * dir * radius;
	vec2 off3 = vec2(5.176470588235294) * dir * radius;
    
	color += texture2D(frameBuffer, uv) * 0.1964825501511404;
	color += texture2D(frameBuffer, uv + (off1 / resolution)) * 0.2969069646728344;
	color += texture2D(frameBuffer, uv - (off1 / resolution)) * 0.2969069646728344;
	color += texture2D(frameBuffer, uv + (off2 / resolution)) * 0.09447039785044732;
	color += texture2D(frameBuffer, uv - (off2 / resolution)) * 0.09447039785044732;
	color += texture2D(frameBuffer, uv + (off3 / resolution)) * 0.010381362401148057;
	color += texture2D(frameBuffer, uv - (off3 / resolution)) * 0.010381362401148057;


  
	gl_FragColor = vec4(color.rgb,1.0);                
	
}


