window.mandelbrotFractalShader = `
precision highp float;

#define add(a, b) vec2(a.x+b.x, a.y+b.x)
#define substract(a, b) vec2(a.x-b.x, a.y-b.x)
#define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define div(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))

vec2 pow(vec2 a, float n) {
  float angle = atan(a.y, a.x);
  float r = length(a);
  float real = pow(r, n) * cos(n*angle);
  float im = pow(r, n) * sin(n*angle);
  return vec2(real, im);
}

uniform vec2 u_resolution;
  
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  vec2 c = uv * 4.0 - vec2(2.0);
  vec2 z = vec2(0.0);
  bool escaped = false;
  int iterations = 0;

  for (int i = 0; i < 80; i++) {
    if (escaped) break;

    z = pow(z,2.0) + c;
    iterations = i;

    if (length(z) > 2.0) {
      escaped = true;
    }
  }
  gl_FragColor = escaped ? vec4(vec3(float(iterations)) / 80.0, 1.0) : vec4(vec3(0.0), 1.0);
}
`;