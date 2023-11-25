import {CONSTS} from './config.js';
import {formula2Code} from './formula-processing.js'
import {Renderer} from './renderer.js';
import {getFragmentShaderWithFormula, setupParamsForms} from './utils.js';

let settings = {
  formula: 'abs[z]^2+a',
  iteration: CONSTS.ITERATION_METHOD.RECURSION,
  color: CONSTS.COLOR_METHOD.ITERATIONS,
  escape_type: CONSTS.ESCAPE_TYPE.GREATER_THAN,
  escape_value: 2,
  max_iterations: 400,
  plane_start: {x: -2, y: -1.5},
  plane_length: {x: 4, y: 3},
  variables: [{name: 'z', type: CONSTS.TYPES.STATIC, real: 0, imaginary: 0, main: true}, {name: "a", type: CONSTS.TYPES.RELATIVE}]
}

const renderer = new Renderer('canvas');

setupParamsForms(settings, renderer);

let button_submit = document.getElementById('formula-submit');
let formula_input = document.getElementById('formula');
let color_input = document.getElementById('color-method');
let operation_input = document.getElementById('main-operation');
let escape_type_input = document.getElementById('escape-type');
let escape_value_input = document.getElementById('escape-value');
let max_iterations_input = document.getElementById('max-iterations');
let add_param_btn = document.getElementById('add-param');

// Current param name.
// TODO Change param naming to user defined
let curr = 'a';

// Setup defaults
formula_input.value = settings.formula;
color_input.value = settings.color;
operation_input.value = settings.iteration;
escape_type_input.value = settings.escape_type;
escape_value_input.value = settings.escape_value;
max_iterations_input.value = settings.max_iterations;

// Form events
add_param_btn.addEventListener('click', e => {
  settings.variables.push({name: curr, type: CONSTS.TYPES.RELATIVE});
  curr = String.fromCharCode(curr.charCodeAt() + 1);
  setupParamsForms(settings);
})

color_input.addEventListener('input', e => {
  settings.color = Number(color_input.value);
  renderer.updateParam('u_color_method', Number(color_input.value));
  renderer.render();
})

operation_input.addEventListener('input', e => {
  settings.iteration = operation_input.value;
  generateFractal(settings);
})

escape_type_input.addEventListener('input', e => {
  settings.escape_type = escape_type_input.value;
  generateFractal(settings);
})

escape_value_input.addEventListener('input', e => {
  settings.escape_value = escape_value_input.value;
  generateFractal(settings);
})

max_iterations_input.addEventListener('input', e => {
  settings.max_iterations = Number(max_iterations_input.value);
  renderer.updateParam('max_iterations', settings.max_iterations);
  renderer.render();
})

button_submit.addEventListener('click', (e) => {
  settings.formula = formula_input.value;
  generateFractal(settings);
});

// Scroll & drag
window.addEventListener('wheel', e=>{
  const zoom_dir = (e.deltaY > 0) ? 1 : -1;

  const zoom_diff_x = settings.plane_length.x * CONSTS.ZOOM_POWER;
  const zoom_diff_y = settings.plane_length.y * CONSTS.ZOOM_POWER;
  settings.plane_length.x += zoom_diff_x * zoom_dir;
  settings.plane_length.y += zoom_diff_y * zoom_dir;
  settings.plane_start.x -= zoom_diff_x * zoom_dir / 2;
  settings.plane_start.y -= zoom_diff_y * zoom_dir / 2;

  renderer.updateVariable('plane_start', settings.plane_start.x, settings.plane_start.y);
  renderer.updateVariable('plane_length', settings.plane_length.x, settings.plane_length.y);
  renderer.render();
});

function generateFractal(settings) {
  const fractalCode = formula2Code(settings.formula);
  const fragmentShader = getFragmentShaderWithFormula(fractalCode, settings);
  console.log(fragmentShader);
  renderer.updateFragmentShader(fragmentShader);

  settings.variables.filter(a => a.type == CONSTS.TYPES.STATIC).forEach(e => {
    renderer.updateVariable(e.name, e.real, e.imaginary);
  });

  renderer.updateParam('u_color_method', settings.color);
  renderer.updateParam('max_iterations', settings.max_iterations);
  renderer.updateVariable('plane_start', settings.plane_start.x, settings.plane_start.y);
  renderer.updateVariable('plane_length', settings.plane_length.x, settings.plane_length.y);

  renderer.render();
}

generateFractal(settings);
