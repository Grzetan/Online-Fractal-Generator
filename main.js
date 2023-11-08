var canvas = document.getElementById("canvas");
let button_submit = document.getElementById("formula-submit");
let formula_input = document.getElementById("formula");

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

function getFragmentShaderWithFormula(formula){
  let code = window.newtonFragmentShader;

  return code.replaceAll("vec2(0.0) //PASTE FORMULA HERE", formula + ";");
}

function preprocessFormula(formula){
  let chars = ['(', ')', '+', '-', '*', '/', '^'];
  for(let i=0; i<chars.length; i++){
    formula = formula.split(chars[i]).join(" " + chars[i] + " ");
  }

  return formula;
}

function generateFractal(formula){
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
  gl.shaderSource(fragShader, getFragmentShaderWithFormula(fractalCode));
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

button_submit.addEventListener('click', (e)=>{
  generateFractal(formula_input.value);
});

// generateFractal("( z ^ vec2(3.0,0.0) - vec2(1.0,0.0) ) / ( vec2(3.0,0.0) * z ^ vec2(2.0,0.0) )");
generateFractal("(z^3-1)/(3*z^2)");
