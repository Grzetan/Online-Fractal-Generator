class Renderer {
  vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

  constructor (canvas_id) {
    this.canvas = document.getElementById(canvas_id);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight; 
    this.gl = canvas.getContext("webgl");

    if (!this.gl) {
      throw new Error("WebGL is not supported in this browser!");
    }

    // Create buffer
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // Feed GPU with VERTEX shader and compile
    this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.vertShader, window.vertexShader);
    this.gl.compileShader(this.vertShader);

    this.shaderProgram = this.gl.createProgram();
  }

  updateFragmentShader(fragmentShader){
    // Feed GPU with FRAGMENT shader and compile
    const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fragShader, fragmentShader);
    this.gl.compileShader(fragShader);
    console.log(this.gl.getShaderInfoLog(fragShader))
    
    // Initialize rendering program
    this.gl.attachShader(this.shaderProgram, this.vertShader);
    this.gl.attachShader(this.shaderProgram, fragShader);
    this.gl.linkProgram(this.shaderProgram);
    this.gl.useProgram(this.shaderProgram);
    
    // Bind shader attribute to buffer
    const coord = this.gl.getAttribLocation(this.shaderProgram, "coordinates");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(coord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(coord);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0,0,canvas.width,canvas.height);

    const resolution = this.gl.getUniformLocation(this.shaderProgram, "u_resolution");
    this.gl.uniform2f(resolution, this.canvas.width, this.canvas.height);
  }

  render(){
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  updateParam(name, re, im){
    const param = this.gl.getUniformLocation(this.shaderProgram, name);
    this.gl.uniform2f(param, re, im);
    this.render();
}
  
}

let button_submit = document.getElementById("formula-submit");
let formula_input = document.getElementById("formula");
let re_input = document.getElementById("x");
let imag_input = document.getElementById("y");
let re_display = document.getElementById("output_real");
let imag_display = document.getElementById("output_imaginary");

const renderer = new Renderer("canvas");

re_input.addEventListener('input', e=>{
  re_display.innerText = re_input.value;
  renderer.updateParam('c', Number(re_input.value), Number(imag_input.value));
})
imag_input.addEventListener('input', e=>{
  imag_display.innerText = imag_input.value;
  renderer.updateParam('c', Number(re_input.value), Number(imag_input.value));
})

button_submit.addEventListener('click', (e)=>{
  // generateFractal(formula_input.value, [{name: 'z', type: "relative"}, {name: 'c', real: Number(re_input.value), imaginary: Number(imag_input.value), type: 'const'}]);
});

const OPERATORS = {'-': {code: 'subtract(', associativity: 'left', precedence: 1}, 
                   '+': {code: 'add(', associativity: 'left', precedence: 1}, 
                   '/': {code: 'div(', associativity: 'left', precedence: 2}, 
                   '*': {code: 'mul(', associativity: 'left', precedence: 2}, 
                   '^': {code: 'power(', associativity: 'right', precedence: 3}};

const FUNCTIONS = {
  'len': {code: 'len()'},
  'abs': {code: 'abs()'},
  'sin': {code: 'sin()'},
  'conj': {code: 'conjugate()'},
  'neg': {code: 'neg()'},
  'inv': {code: 'inverse()'}

}

class Operation{
  constructor(type, first, second){
    this.type = type;
    this.first = first;
    this.second = second;
  }

  toString(){
    return OPERATORS[this.type].code + this.first + ', ' + this.second + ")";
  }
}

function removeAfterChar(inputString, charToRemove) {
  const charIndex = inputString.indexOf(charToRemove);
  
  if (charIndex !== -1) {
    return inputString.substring(0, charIndex);
  }
  
  return inputString;
}

function extractStringInParentheses(inputString) {
  const regex = /\(([^)]+)\)/;
  const match = inputString.match(regex);

  if (match && match.length > 1) {
    return match[1];
  }

  return null;
}

function RPN2Code(formula){
  let splitted = formula.split(' ')

  for(let i=0; i<splitted.length; i++){
    let operation = removeAfterChar(splitted[i], '(');
    if(Object.keys(FUNCTIONS).includes(operation)){
      let content = extractStringInParentheses(splitted[i]);
      console.log(content);
      splitted[i] = content + "." + FUNCTIONS[operation].code;
    }
  }

  let stack = [];
  let mainOperation = new Operation();

  for(let i=0; i<splitted.length; i++){
    if(Object.keys(OPERATORS).includes(splitted[i])){
      let second = stack.pop();
      let first = stack.pop();
      let operation = new Operation(splitted[i], first, second);
      stack.push(operation.toString());
    }else{
      stack.push(splitted[i]);
    }
  }

  let output = stack[0].toString();

  return output;
}

function scalarsToComplex(formula){
  for(let i=0; i<formula.length; i++){
    if(!isNaN(formula[i])){
      formula[i] = "vec2(" + Number(formula[i]).toFixed(6).toString() + ",0.0)";
    }
  }

  return formula;
}

// https://www.andreinc.net/2010/10/05/converting-infix-to-rpn-shunting-yard-algorithm
function formula2RPN(formula){
  splitted = formula.split(' ');
  splitted = splitted.filter(a => a != "");
  splitted = scalarsToComplex(splitted);

  output = [];
  stack = [];
  for(let i=0; i<splitted.length; i++){
    if(Object.keys(OPERATORS).includes(splitted[i])){
      while(stack.length != 0 && Object.keys(OPERATORS).includes(stack[stack.length-1])){
        const curr = OPERATORS[splitted[i]];
        const next = OPERATORS[stack[stack.length-1]];
        if((curr.associativity == 'left' && next.precedence >= curr.precedence) ||
            (curr.associativity == 'right' && next.precedence > curr.precedence)){
          output.push(stack.pop());
          continue;
        }
        break;
      }
      stack.push(splitted[i]);
    }else if(splitted[i] == '('){
      stack.push(splitted[i]);
    }else if(splitted[i] == ')'){
      while(stack.length != 0 && stack[stack.length-1] != '('){
        output.push(stack.pop());
      }
      stack.pop();
    }else{
      output.push(splitted[i]);
    }
  }

  while(stack.length != 0){
    output.push(stack.pop());
  }

  return output.join(' ');
}

function formula2Code(formula){
  return RPN2Code(formula2RPN(formula));
}

function getFragmentShaderWithFormula(formula, variables){
  let code = window.newtonFragmentShader;

  let const_variables_code = "uniform vec2 ";
  variables.filter(a => a.type == 'const').forEach(e=>{
    const_variables_code += e.name + ",";
  });
  const_variables_code = const_variables_code.slice(0, -1) + ";";

  code = code.replaceAll("//PASTE CONST VARIABLES HERE", const_variables_code);

  let relative_variables_code = "vec2 ";
  variables.filter(a => a.type == 'relative').forEach(e=>{
    relative_variables_code += e.name + "=getRelativeValue(uv),";
  });
  relative_variables_code = relative_variables_code.slice(0, -1) + ";";

  code = code.replaceAll("//PASTE RELATIVE VARIABLES HERE", relative_variables_code);

  return code.replaceAll("vec2(0.0) //PASTE FORMULA HERE", formula + ";");
}

function preprocessFormula(formula){
  let chars = ['(', ')', '+', '-', '*', '/', '^'];
  for(let i=0; i<chars.length; i++){
    formula = formula.split(chars[i]).join(" " + chars[i] + " ");
  }

  return formula;
}

function generateFractal(formula, variables){
  const preprocessedFormula = preprocessFormula(formula);
  const fractalCode = formula2Code(preprocessedFormula);
  renderer.updateFragmentShader(getFragmentShaderWithFormula(fractalCode, variables));
  renderer.render();

  variables.filter(a => a.type == 'const').forEach(e=>{
    renderer.updateParam(e.name, e.real, e.imaginary);
  });
}

const variables = [{name: 'z', type: "relative"}, {name: 'c', real: 0.0, imaginary: 0.0, type: 'const'}];
generateFractal("(z^3-1)/(3*z^2)+c", variables);
