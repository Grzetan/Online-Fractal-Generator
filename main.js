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

    this.gl.attachShader(this.shaderProgram, this.vertShader);
  }

  updateFragmentShader(fragmentShader){
    if(this.fragShader != undefined){
      this.gl.detachShader(this.shaderProgram, this.fragShader);
    }
    
    // Feed GPU with FRAGMENT shader and compile
    this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.fragShader, fragmentShader);
    this.gl.compileShader(this.fragShader);
    console.log(this.gl.getShaderInfoLog(this.fragShader))
    
    // Initialize rendering program
    this.gl.attachShader(this.shaderProgram, this.fragShader);
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
    console.log("OKK")
  }

  updateVariable(name, re, im){
    const param = this.gl.getUniformLocation(this.shaderProgram, name);
    this.gl.uniform2f(param, re, im);
    console.log(re, im, name)
  }

  updateParam(name, val){
    const param = this.gl.getUniformLocation(this.shaderProgram, name);
    this.gl.uniform1i(param, val);
  }
  
}

const TYPES = {
  STATIC: 'const',
  RELATIVE: 'relative'
}

const ITERATION_METHOD = {
  RECURSION: "recursion",
  ADDITION: "addition",
  SUBTRACTION: "subtraction"
}

const COLOR_METHOD = {
  ROOTS: 1,
  ITERATIONS: 2
}

const ESCAPE_TYPE = {
  GREATER_THAN: ">",
  LESS_THAN: "<"
}

function setupParamsForms(variables){
  let params_container = document.getElementById('parameters');

  variables.forEach(e=>{
    let form = document.createElement('div');
    form.classList.add('param');

    // Name
    let name = document.createElement('span');
    name.innerText = e.name;
    form.appendChild(name);

    // Real input
    let real = document.createElement('input');
    real.type = 'number';
    real.step = 0.01;
    real.value = 0;
    real.addEventListener('input', r=>{
      e.real = Number(real.value);
      renderer.updateVariable(e.name, e.real, e.imaginary);
      renderer.render();
    })
    real.disabled = e.type == TYPES.RELATIVE;
    form.appendChild(real);

    // Imaginary input
    let imag = document.createElement('input');
    imag.type = 'number';
    imag.step = 0.01;
    imag.value = 0;
    imag.addEventListener('input', r=>{
      e.imaginary = Number(imag.value);
      renderer.updateVariable(e.name, e.real, e.imaginary);
      renderer.render();
    })
    imag.disabled = e.type == TYPES.RELATIVE;
    form.appendChild(imag);

    // Types
    let type = document.createElement('select');
    for(const key in TYPES){
      let option = document.createElement("option");
      option.value = TYPES[key];
      option.innerText = TYPES[key];
      if(TYPES[key] == e.type){
        option.selected = true;
      }
      type.appendChild(option);
    }
    type.addEventListener('input', r=>{
      e.type = type.value;
      if(e.type == TYPES.STATIC){
        e.real = Number(real.value);
        e.imaginary = Number(imag.value);
      }
      real.disabled = e.type == TYPES.RELATIVE;
      imag.disabled = e.type == TYPES.RELATIVE;
      generateFractal(settings);
    })
    form.appendChild(type);

    // Main
    let main = document.createElement('input');
    main.type = 'radio';
    main.name = 'main';
    main.checked = e.main;
    main.addEventListener('input', r=>{
      variables.forEach(t=>{
        t.main = false;
      });
      e.main = true;
      console.log(settings)
      generateFractal(settings)
    })

    form.appendChild(main);

    params_container.appendChild(form);
  })
}

let settings = {
  formula: "(z^3-1)/(3*z^2)+c",
  iteration: ITERATION_METHOD.SUBTRACTION,
  color: COLOR_METHOD.ROOTS,
  escape_type: ESCAPE_TYPE.LESS_THAN,
  escape_value: 1e-6,
  variables: [{name: 'z', type: TYPES.RELATIVE, main: true}, {name: 'c', type: TYPES.STATIC, real: 0.0, imaginary: 0.0}]
}

const renderer = new Renderer("canvas");

setupParamsForms(settings.variables);

let button_submit = document.getElementById("formula-submit");
let formula_input = document.getElementById("formula");
let color_input = document.getElementById('color-method');
let operation_input = document.getElementById('main-operation');
let escape_type_input = document.getElementById("escape-type");
let escape_value_input = document.getElementById("escape-value");

color_input.addEventListener('input', e=>{
  settings.color = Number(color_input.value);
  renderer.updateParam('u_color_method', Number(color_input.value));
  renderer.render();
})

operation_input.addEventListener('input', e=>{
  settings.iteration = operation_input.value;
  generateFractal(settings);
})

escape_type_input.addEventListener('input', e=>{
  settings.escape_type = escape_type_input.value;
  generateFractal(settings);
})

escape_value_input.addEventListener('input', e=>{
  settings.escape_value = escape_value_input.value;
  generateFractal(settings);
})

button_submit.addEventListener('click', (e)=>{
  settings.formula = formula_input.value;
  generateFractal(settings);
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

  // Setup const params
  let const_variables_code = "uniform vec2 ";
  variables.filter(a => a.type == TYPES.STATIC).forEach(e=>{
    const_variables_code += e.name + ",";
  });
  const_variables_code = const_variables_code.slice(0, -1) + ";";
  code = code.replaceAll("//PASTE CONST VARIABLES HERE", const_variables_code);

  // Setup relative params
  let relative_variables_code = "vec2 ";
  variables.filter(a => a.type == TYPES.RELATIVE).forEach(e=>{
    relative_variables_code += e.name + "=getRelativeValue(uv),";
  });
  relative_variables_code = relative_variables_code.slice(0, -1) + ";";
  code = code.replaceAll("//PASTE RELATIVE VARIABLES HERE", relative_variables_code);

  // Setup main param
  var main_param = variables.find(obj => {
    return obj.main
  })

  if(main_param == undefined){
    throw new Error("There is no main variable");
  }

  code = code.replaceAll("vec(0.0) //PASTE MAIN VARIABLE HERE ", main_param.name + ";");

  // Replace main param with custom name
  formula = formula.replaceAll(main_param.name, "main");

  // Replate main operation
  let operation = "";
  switch(settings.iteration){
    case ITERATION_METHOD.RECURSION:
      operation = "main = delta;";
      break;
    case ITERATION_METHOD.ADDITION:
      operation = "main += delta;";
      break;
    case ITERATION_METHOD.SUBTRACTION:
      operation = "main -= delta;";
      break;
  }

  code = code.replaceAll("//PASTE MAIN OPERATION HERE", operation);

  // Replace escape condition
  console.log(settings.escape_type + " " + settings.escape_value);
  let escape_code = settings.escape_type + " " + settings.escape_value;
  code = code.replaceAll("/*PASTE ESCAPE HERE*/", escape_code);

  return code.replaceAll("vec2(0.0) //PASTE FORMULA HERE", formula + ";");
}

function preprocessFormula(formula){
  let chars = ['(', ')', '+', '-', '*', '/', '^'];
  for(let i=0; i<chars.length; i++){
    formula = formula.split(chars[i]).join(" " + chars[i] + " ");
  }

  return formula;
}

function generateFractal(settings){
  const preprocessedFormula = preprocessFormula(settings.formula);
  const fractalCode = formula2Code(preprocessedFormula);
  const fragmentShader = getFragmentShaderWithFormula(fractalCode, settings.variables);
  console.log(fragmentShader);
  renderer.updateFragmentShader(fragmentShader);

  settings.variables.filter(a => a.type == TYPES.STATIC).forEach(e=>{
    renderer.updateVariable(e.name, e.real, e.imaginary);
  });

  renderer.updateParam("u_color_method", settings.color);

  renderer.render();
}

generateFractal(settings);
