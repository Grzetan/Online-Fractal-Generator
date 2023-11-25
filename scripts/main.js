import {CONSTS} from './config.js';
import {formula2Code} from './formula-processing.js'
import {Renderer} from './renderer.js';
import {getFragmentShaderWithFormula} from './update-fragment-shader.js';

function setupParamsForms(variables) {
  let params_container = document.getElementById('parameters');
  params_container.innerHTML = '';

  variables.forEach(e => {
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
    real.addEventListener('input', r => {
      e.real = Number(real.value);
      renderer.updateVariable(e.name, e.real, e.imaginary);
      renderer.render();
    })
    real.disabled = e.type == CONSTS.TYPES.RELATIVE;
    form.appendChild(real);

    // Imaginary input
    let imag = document.createElement('input');
    imag.type = 'number';
    imag.step = 0.01;
    imag.value = 0;
    imag.addEventListener('input', r => {
      e.imaginary = Number(imag.value);
      renderer.updateVariable(e.name, e.real, e.imaginary);
      renderer.render();
    })
    imag.disabled = e.type == CONSTS.TYPES.RELATIVE;
    form.appendChild(imag);

    // Types
    let type = document.createElement('select');
    for (const key in CONSTS.TYPES) {
      let option = document.createElement('option');
      option.value = CONSTS.TYPES[key];
      option.innerText = CONSTS.TYPES[key];
      if (CONSTS.TYPES[key] == e.type) {
        option.selected = true;
      }
      type.appendChild(option);
    }
    type.addEventListener('input', r => {
      e.type = type.value;
      if (e.type == CONSTS.TYPES.STATIC) {
        e.real = Number(real.value);
        e.imaginary = Number(imag.value);
      }
      real.disabled = e.type == CONSTS.TYPES.RELATIVE;
      imag.disabled = e.type == CONSTS.TYPES.RELATIVE;
      generateFractal(settings);
    })
    form.appendChild(type);

    // Main
    let main = document.createElement('input');
    main.type = 'radio';
    main.name = 'main';
    main.checked = e.main;
    main.addEventListener('input', r => {
      variables.forEach(t => {
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
  formula: '(z^3-1)/(3*z^2)',
  iteration: CONSTS.ITERATION_METHOD.SUBTRACTION,
  color: CONSTS.COLOR_METHOD.ROOTS,
  escape_type: CONSTS.ESCAPE_TYPE.LESS_THAN,
  escape_value: 1e-6,
  max_iterations: 500,
  variables: [{name: 'z', type: CONSTS.TYPES.RELATIVE, main: true}]
}

const renderer = new Renderer('canvas');

setupParamsForms(settings.variables);

let button_submit = document.getElementById('formula-submit');
let formula_input = document.getElementById('formula');
let color_input = document.getElementById('color-method');
let operation_input = document.getElementById('main-operation');
let escape_type_input = document.getElementById('escape-type');
let escape_value_input = document.getElementById('escape-value');
let max_iterations_input = document.getElementById('max-iterations');
let add_param_btn = document.getElementById('add-param');

let curr = 'a';

add_param_btn.addEventListener('click', e => {
  settings.variables.push({name: curr, type: CONSTS.TYPES.RELATIVE});
  curr = String.fromCharCode(curr.charCodeAt() + 1);
  setupParamsForms(settings.variables);
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

  renderer.render();
}

generateFractal(settings);
