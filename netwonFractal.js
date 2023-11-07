window.newtonFragmentShader = `
precision mediump float;

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

uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 z = uv * 4.0 - 2.0;

  bool escaped = false;

  for (int i = 0; i < 100; i++) {
    if (escaped) break;

    vec2 delta = vec2(0.0) //PASTE FORMULA HERE
    
    // div(subtract(power(z, vec2(3.0, 0.0)), vec2(1.0, 0.0)), mul(power(z, vec2(2.0, 0.0)), vec2(3.0, 0.0)));

    if (length(delta) < 1e-6) {
      escaped = true;
    
      gl_FragColor = vec4((z.x + 2.0) / 4.0, (z.y + 2.0) / 4.0, 1.0, 1.0);
    }

    z = z - delta;
  }
}
`;