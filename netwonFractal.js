window.newtonFragmentShader = `
precision mediump float;

#define add(a, b) vec2(a.x+b.x, a.y+b.x)
#define substract(a, b) vec2(a.x-b.x, a.y-b.x)
#define mul(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
#define div(a, b) vec2(((a.x*b.x+a.y*b.y)/(b.x*b.x+b.y*b.y)),((a.y*b.x-a.x*b.y)/(b.x*b.x+b.y*b.y)))
#define abs(a) length(a)

vec2 power(vec2 a, float n) {
  float angle = atan(a.y, a.x);
  float r = length(a);
  float real = pow(r, n) * cos(n*angle);
  float im = pow(r, n) * sin(n*angle);
  return vec2(real, im);
}

vec2 power(vec2 z, vec2 w) {
  float r = abs(z);
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

    vec2 delta = div((power(z, 3.0) - vec2(1.0, 0.0)), (power(z, 2.0) * 3.0));

    if (abs(delta) < 1e-6) {
      escaped = true;
    
      gl_FragColor = vec4((z.x + 2.0) / 4.0, (z.y + 2.0) / 4.0, 1.0, 1.0);
    }

    z = z - delta;
  }
}
`;