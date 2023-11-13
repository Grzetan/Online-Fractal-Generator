window.newtonFragmentShader = `
precision mediump float;

vec2 start = vec2(-4.0, -3.0);
vec2 plane_length = vec2(8.0, 6.0);

vec2 add(vec2 a, vec2 b){
  return a + b;
}

vec2 subtract(vec2 a, vec2 b){
  return a - b;
}

vec2 mul(vec2 a, vec2 b){
  return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x);
}

vec2 div(vec2 a, vec2 b){
  return vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)));
}

vec2 power(vec2 z, vec2 w) {
  float r = length(z);
  float theta = atan(z.y, z.x);

  float r_ = pow(r, w.x);
  float theta_ = theta * w.x;

  if (w.y != 0.0) {
    r_ *= exp(-w.y*theta);
    theta_ += w.y*log(r);
  }

  return vec2(r_*cos(theta_), r_*sin(theta_));
}

vec2 getRelativeValue(vec2 uv){
  return vec2(uv.x * plane_length.x + start.x, uv.y * plane_length.y + start.y);
}

uniform vec2 u_resolution;

//PASTE CONST VARIABLES HERE

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  //PASTE RELATIVE VARIABLES HERE

  vec2 main = vec(0.0) //PASTE MAIN PARAM HERE 

  bool escaped = false;

  for (int i = 0; i < 1000; i++) {
    if (escaped) break;

    vec2 delta = vec2(0.0) //PASTE FORMULA HERE
    
    if (length(delta) < 1e-6) {
      escaped = true;
    
      gl_FragColor = vec4((main.x + 2.0) / 4.0, (main.y + 2.0) / 4.0, 1.0, 1.0);
    }

    main -= delta;
  }
}
`;