var canvas = document.getElementById("canvas");

function generateFractal(){
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
  gl.shaderSource(fragShader, window.newtonFragmentShader);
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

generateFractal();

// var ctx = canvas.getContext('2d');
// var WIDTH = canvas.width;
// var HEIGHT = canvas.height;

// ctx.fillStyle = 'black';
// ctx.fillRect(0,0, WIDTH, HEIGHT);

// let xmin = -2;
// let xmax = 2;
// let ymin = -2;
// let ymax = 2;
// let maxIterations = 20;

// const OPERATORS = {'-': {code: 'sub(', associativity: 'left', precedence: 1}, 
//                    '+': {code: 'add(', associativity: 'left', precedence: 1}, 
//                    '/': {code: 'div(', associativity: 'left', precedence: 2}, 
//                    '*': {code: 'mul(', associativity: 'left', precedence: 2}, 
//                    '^': {code: 'pow(', associativity: 'right', precedence: 3}};

// const FUNCTIONS = {
//     'len': {code: 'len()'},
//     'abs': {code: 'abs()'},
//     'sin': {code: 'sin()'},
//     'conj': {code: 'conjugate()'},
//     'neg': {code: 'neg()'},
//     'inv': {code: 'inverse()'}

// }

// class Operation{
//     constructor(type, first, second){
//         this.type = type;
//         this.first = first;
//         this.second = second;
//     }

//     toString(){
//         return OPERATORS[this.type].code + this.first + ', ' + this.second + ")";
//     }
// }

// function removeAfterChar(inputString, charToRemove) {
//   const charIndex = inputString.indexOf(charToRemove);
  
//   if (charIndex !== -1) {
//     return inputString.substring(0, charIndex);
//   }
  
//   return inputString;
// }

// function extractStringInParentheses(inputString) {
//   const regex = /\(([^)]+)\)/;
//   const match = inputString.match(regex);

//   if (match && match.length > 1) {
//     return match[1];
//   }

//   return null;
// }

// function polishNotation2Code(formula){
//     let splitted = formula.split(' ')
//     console.log(splitted);

//     for(let i=0; i<splitted.length; i++){
//         let operation = removeAfterChar(splitted[i], '(');
//         if(Object.keys(FUNCTIONS).includes(operation)){
//             let content = extractStringInParentheses(splitted[i]);
//             console.log(content);
//             splitted[i] = content + "." + FUNCTIONS[operation].code;
//         }
//     }

//     let stack = [];
//     let mainOperation = new Operation();

//     for(let i=0; i<splitted.length; i++){
//         if(Object.keys(OPERATORS).includes(splitted[i])){
//             let second = stack.pop();
//             let first = stack.pop();
//             let operation = new Operation(splitted[i], first, second);
//             stack.push(operation.toString());
//         }else{
//             stack.push(splitted[i]);
//         }
//     }

//     let output = stack[0].toString();

//     console.log(output);

//     return new Function("z", "c", "return " + output);
// }

// // https://www.andreinc.net/2010/10/05/converting-infix-to-rpn-shunting-yard-algorithm
// function formula2RPN(formula){
//     splitted = formula.split(' ');
//     output = [];
//     stack = [];
//     for(let i=0; i<splitted.length; i++){
//         if(Object.keys(OPERATORS).includes(splitted[i])){
//             while(stack.length != 0 && Object.keys(OPERATORS).includes(stack[stack.length-1])){
//                 const curr = OPERATORS[splitted[i]];
//                 const next = OPERATORS[stack[stack.length-1]];
//                 if((curr.associativity == 'left' && next.precedence >= curr.precedence) ||
//                    (curr.associativity == 'right' && next.precedence > curr.precedence)){
//                     output.push(stack.pop());
//                     continue;
//                 }
//                 break;
//             }
//             stack.push(splitted[i]);
//         }else if(splitted[i] == '('){
//             stack.push(splitted[i]);
//         }else if(splitted[i] == ')'){
//             while(stack.length != 0 && stack[stack.length-1] != '('){
//                 output.push(stack.pop());
//             }
//             stack.pop();
//         }else{
//             output.push(splitted[i]);
//         }
//     }

//     while(stack.length != 0){
//         output.push(stack.pop());
//     }

//     return output.join(' ');
// }

// let formula = "( z ^ 4.0 - vec2(1.0) ) / ( z ^ 3.0 * vec2(4.0) )";
// const RPN = formula2RPN(formula);
// console.log(RPN);
// const func = polishNotation2Code(RPN);

// // Generate mandelbrot

// // for(let y=0; y<HEIGHT;y++){
// //     for(let x=0; x<WIDTH;x++){
// //         let c = new Complex(x/WIDTH * Math.abs(xmax - xmin) + xmin, y/HEIGHT * Math.abs(ymax - ymin) + ymin);
// //         let z  = new Complex(0,0);
// //         let i = 0;

// //         while(i<maxIterations){
// //             z = func(z, c);
// //             //If z is too high (goes to infinity), break out
// //             if(z.abs() > 5){
// //                 break;
// //             }
// //             i++;
// //         }

// //         color = {red: 50, green: 50, blue: 50};
// //         if(i == maxIterations){
// //             color.red = 0;
// //             color.green = 0;
// //             color.blue = 0;
// //         }else if(i > 1){
// //             color.red = (i/maxIterations*255);
// //             color.green = 80;
// //             color.blue = 100;
// //         }
// //         ctx.fillStyle = `rgb(${color.red},${color.green},${color.blue})`;
// //         ctx.fillRect(x, y, 1, 1); // Fill a single pixel
// //     }
// // }

// // Generate netwon fractals
// function getRandomIntInclusive(min=0, max=255) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
// }

// let roots = []

// let c = new Complex(-0.3,0);
// for(let y=0; y<HEIGHT;y++){
//     console.log(y, HEIGHT)
//     for(let x=0; x<WIDTH;x++){
//         let z = new Complex(x/WIDTH * Math.abs(xmax - xmin) + xmin, y/HEIGHT * Math.abs(ymax - ymin) + ymin);
//         let i = 0;

//         while(i<100){
//             let delta = func(z, c);
//             //If z is too high (goes to infinity), break out
//             if(delta.abs() < 1e-12){
//                 let closestRoot = null;
//                 for(let j=0; j<roots.length; j++){
//                     let tmp = roots[j].root;
//                     let dist = tmp.sub(z);
//                     if(dist.abs() < 1e-8){
//                         closestRoot = roots[j];
//                         break;
//                     }
//                 }

//                 if(closestRoot == null){
//                     roots.push({root: z, color: {red: getRandomIntInclusive(), green: getRandomIntInclusive(), blue: getRandomIntInclusive()}});
//                     closestRoot = roots[roots.length-1];
//                 }

//                 ctx.fillStyle = `rgb(${closestRoot.color.red},${closestRoot.color.green},${closestRoot.color.blue})`;
//                 ctx.fillRect(x, y, 1, 1);

//                 break;
//             }
//             z = z.sub(delta);
//             i++;
//         }
//     }
// }

// console.log(roots)