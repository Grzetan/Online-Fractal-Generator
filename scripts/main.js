import { CONSTS, settings, setSettings } from './config.js';
import { formula2Code } from './formula-processing.js'
import { renderer } from './renderer.js';
import { getFragmentShaderWithFormula, setupParamsForms } from './utils.js';

setupParamsForms();

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
  settings.variables.push({ name: curr, type: CONSTS.TYPES.RELATIVE });
  curr = String.fromCharCode(curr.charCodeAt() + 1);
  setupParamsForms();
})

color_input.addEventListener('input', e => {
  settings.color = Number(color_input.value);
  renderer.updateParam('u_color_method', Number(color_input.value));
  renderer.render();
})

operation_input.addEventListener('input', e => {
  settings.iteration = operation_input.value;
  generateFractal();
})

escape_type_input.addEventListener('input', e => {
  settings.escape_type = escape_type_input.value;
  generateFractal();
})

escape_value_input.addEventListener('input', e => {
  settings.escape_value = escape_value_input.value;
  generateFractal();
})

max_iterations_input.addEventListener('input', e => {
  settings.max_iterations = Number(max_iterations_input.value);
  renderer.updateParam('max_iterations', settings.max_iterations);
  renderer.render();
})

button_submit.addEventListener('click', (e) => {
  settings.formula = formula_input.value;
  generateFractal();
});

// Scroll & drag
window.addEventListener('wheel', e => {
  const zoom_dir = (e.deltaY > 0) ? 1 : -1;

  const zoom_diff_x = settings.plane_length.x * CONSTS.ZOOM_POWER;
  const zoom_diff_y = settings.plane_length.y * CONSTS.ZOOM_POWER;
  settings.plane_length.x += zoom_diff_x * zoom_dir;
  settings.plane_length.y += zoom_diff_y * zoom_dir;
  settings.plane_start.x -= zoom_diff_x * zoom_dir / 2;
  settings.plane_start.y -= zoom_diff_y * zoom_dir / 2;

  renderer.updateVariable(
    'plane_start', settings.plane_start.x, settings.plane_start.y);
  renderer.updateVariable(
    'plane_length', settings.plane_length.x, settings.plane_length.y);
  renderer.render();
});

// Buttons
document.getElementById('toggle-form-button')
  .addEventListener('click', function () {
    var container = document.getElementById('container');
    container.style.display =
      container.style.display === 'none' ? 'flex' : 'none';
  });

let curr_img = 0;
document.getElementById('save').addEventListener('click', e => {
  var image = canvas.toDataURL('image/png')
    .replace(
      'image/png',
      'image/octet-stream');  // here is the most important part
  // because if you dont replace you
  // will get a DOM 18 exception.
  window.location.href = image;               // it will save locally
})

document.getElementById('save-settings').addEventListener('click', e => {
  const link = document.createElement("a");
  const file = new Blob([JSON.stringify(settings)], { type: 'text/plain' });
  link.href = URL.createObjectURL(file);
  link.download = "fractal.json";
  link.click();
  URL.revokeObjectURL(link.href);
})

const file = document.getElementById('load-settings-file');

document.getElementById('load-settings').addEventListener('click', e => {
  file.click();
})

file.addEventListener("change", e => {
  var reader = new FileReader();
  reader.readAsText(file.files[0], "UTF-8");
  reader.onload = function (evt) {
    console.log(evt.target.result);
    setSettings(JSON.parse(evt.target.result));
    setupParamsForms();
    generateFractal();
  }
  reader.onerror = function (evt) {
    alert("There was an error with loading the file");
  }
})


let last_pos = null;
let allow_drag = false;

document.getElementById('canvas').addEventListener('mousedown', e => {
  allow_drag = true;
})

window.addEventListener("mouseup", e => {
  allow_drag = false;
})

window.addEventListener('mousemove', e => {
  if (e.buttons != 1 || !allow_drag) {
    last_pos = null;
    return;
  }

  if (last_pos == null) {
    last_pos = { x: e.clientX, y: e.clientY };
    return;
  }

  const moved_x_ratio = (e.clientX - last_pos.x) / window.innerWidth;
  const moved_y_ratio = (e.clientY - last_pos.y) / window.innerHeight;
  settings.plane_start.x -= moved_x_ratio * settings.plane_length.x;
  settings.plane_start.y += moved_y_ratio * settings.plane_length.y;
  renderer.updateVariable(
    'plane_start', settings.plane_start.x, settings.plane_start.y);
  renderer.render();

  last_pos.x = e.clientX;
  last_pos.y = e.clientY;
})

export function generateFractal() {
  const fractalCode = formula2Code(settings.formula);
  const fragmentShader = getFragmentShaderWithFormula(fractalCode);
  console.log(fragmentShader);
  renderer.updateFragmentShader(fragmentShader);

  settings.variables.filter(a => a.type == CONSTS.TYPES.STATIC).forEach(e => {
    renderer.updateVariable(e.name, e.real, e.imaginary);
  });

  renderer.updateParam('u_color_method', settings.color);
  renderer.updateParam('max_iterations', settings.max_iterations);
  renderer.updateVariable(
    'plane_start', settings.plane_start.x, settings.plane_start.y);
  renderer.updateVariable(
    'plane_length', settings.plane_length.x, settings.plane_length.y);

  renderer.render();
}

generateFractal();
