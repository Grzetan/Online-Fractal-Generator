var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let button_submit = document.getElementById("formula-submit");
let formula_input = document.getElementById("formula");
let re_input = document.getElementById("x");
let imag_input = document.getElementById("y");
let re_display = document.getElementById("output_real");
let imag_display = document.getElementById("output_imaginary");

re_input.addEventListener('input', e=>{
  re_display.innerText = re_input.value;
  generateFractal(formula_input.value, [{name: 'c', real: Number(re_input.value).toFixed(6).toString(), imaginary: Number(imag_input.value).toFixed(6).toString()}]);
})
imag_input.addEventListener('input', e=>{
  imag_display.innerText = imag_input.value;
  generateFractal(formula_input.value, [{name: 'c', real: Number(re_input.value).toFixed(6).toString(), imaginary: Number(imag_input.value).toFixed(6).toString()}]);
})

button_submit.addEventListener('click', (e)=>{
  generateFractal(formula_input.value, [{name: 'c', real: Number(re_input.value).toFixed(6).toString(), imaginary: Number(imag_input.value).toFixed(6).toString()}]);
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

  // let relative_variables_code = "vec2 "


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
  console.log(fractalCode);

  var gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL is not available in your browser.");
  }
  
  const vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  
  // Feed buffers with geometry
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // Feed GPU with VERTEX shader and compile
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, window.vertexShader);
  gl.compileShader(vertShader);
  console.log(gl.getShaderInfoLog(vertShader))
  
  // Feed GPU with FRAGMENT shader and compile
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  console.log(getFragmentShaderWithFormula(fractalCode, variables))
  gl.shaderSource(fragShader, getFragmentShaderWithFormula(fractalCode, variables));
  gl.compileShader(fragShader);
  console.log(gl.getShaderInfoLog(fragShader))
  
  // Initialize rendering program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  
  // Bind shader attribute to buffer
  const coord = gl.getAttribLocation(shaderProgram, "coordinates");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coord);
  
  // Draw
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0,0,canvas.width,canvas.height);
  
  // Set uniforms
  const resolution = gl.getUniformLocation(shaderProgram, "u_resolution");
  gl.uniform2f(resolution, canvas.width, canvas.height);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

generateFractal("(z^3-1)/(3*z^2)", [{name: 'k', type: "relative"},
                                    {name: 'c', real: "0.0", imaginary: "0.0", type: "const"}]);
