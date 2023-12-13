export let fragmentShaderCode = `
precision highp float;

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

vec2 len(vec2 a){
  return vec2(length(a), 0.0);
}

float abs_(float a){
  if(a >= 0.0){
    return a;
  }

  return -a;
}

vec2 cabs(vec2 a){
  return vec2(abs_(a.x), abs_(a.y));
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

float sinh(float a){
  return (exp(a) - exp(-a)) / 2.0;
}

float cosh(float a){
  return (exp(a) + exp(-a)) / 2.0;
}

vec2 csinh(vec2 a){
  return vec2(sinh(a.x) * cos(a.y), cosh(a.x) * sin(a.y));
}

vec2 ccosh(vec2 a){
  return vec2(cosh(a.x) * cos(a.y), sinh(a.x) * sin(a.y));
}

vec2 csin(vec2 a){
  return vec2(sin(a.x) * cosh(a.y), cos(a.x) * sinh(a.y));
}

vec2 ccos(vec2 a){
  return vec2(cos(a.x) * cosh(a.y), sin(a.x) * sinh(a.y));
}

uniform int u_color_method;

uniform vec2 u_resolution;

uniform int max_iterations;

uniform vec2 plane_start;
uniform vec2 plane_length;

//PASTE CONST VARIABLES HERE

vec2 getRelativeValue(vec2 uv){
  return vec2(uv.x * plane_length.x + plane_start.x, uv.y * plane_length.y + plane_start.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  //PASTE RELATIVE VARIABLES HERE

  vec2 main = vec(0.0) //PASTE MAIN VARIABLE HERE 

  bool escaped = false;

  int iterations = 0;

  for (int i = 0; i < 5000; i++) {
    if (escaped || iterations >= max_iterations){
      break;
    }
    
    vec2 delta = vec2(0.0) //PASTE FORMULA HERE
    
    iterations++;

    if (length(delta) /*PASTE ESCAPE HERE*/) {
      escaped = true;
      break;
    }

    //PASTE MAIN OPERATION HERE
  }

  // Color by root reached
  if(u_color_method == 1){
    gl_FragColor = escaped ? vec4((main.x + 2.0) / 4.0, (main.y + 2.0) / 4.0, 1.0, 1.0) : vec4(vec3(0.0), 1.0);
  }
  // Color by iterations it took to escape
  else if(u_color_method == 2){
    gl_FragColor = escaped ? vec4(vec3((float(iterations) / float(max_iterations))), 1.0) : vec4(vec3(0.0), 1.0);
  }else{
    gl_FragColor = vec4(vec3(0.0), 1.0);
  }
}
`;