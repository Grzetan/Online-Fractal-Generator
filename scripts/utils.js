import { CONSTS, settings } from './config.js';
import { fragmentShaderCode } from './fractal.js'
import { generateFractal } from './main.js';
import { renderer } from './renderer.js';

export function getFragmentShaderWithFormula(formula) {
  let code = fragmentShaderCode;

  // Setup const params
  let const_variables_code = 'uniform vec2 ';
  settings.variables.filter(a => a.type == CONSTS.TYPES.STATIC).forEach(e => {
    const_variables_code += e.name + ',';
  });
  const_variables_code = const_variables_code.slice(0, -1) + ';';
  code =
    code.replaceAll(CONSTS.SHADER_STRINGS.CONST_PARAMS, const_variables_code);

  // Setup relative params
  let relative_variables_code = 'vec2 ';
  settings.variables.filter(a => a.type == CONSTS.TYPES.RELATIVE).forEach(e => {
    relative_variables_code += e.name + CONSTS.SHADER_STRINGS.RELATIVE_VALUE;
  });
  relative_variables_code = relative_variables_code.slice(0, -1) + ';';
  code = code.replaceAll(
    CONSTS.SHADER_STRINGS.RELATIVE_PARAMS, relative_variables_code);

  // Setup main param
  var main_param = settings.variables.find(obj => { return obj.main })

  if (main_param == undefined) {
    throw new Error('There is no main variable');
  }

  code =
    code.replaceAll(CONSTS.SHADER_STRINGS.MAIN_PARAM, main_param.name + ';');

  // Replace main param with custom name
  formula = formula.replaceAll(main_param.name, 'main');

  // Replate main operation
  let operation = '';
  switch (settings.iteration) {
    case CONSTS.ITERATION_METHOD.RECURSION:
      operation = 'main = delta;';
      break;
    case CONSTS.ITERATION_METHOD.ADDITION:
      operation = 'main += delta;';
      break;
    case CONSTS.ITERATION_METHOD.SUBTRACTION:
      operation = 'main -= delta;';
      break;
  }

  code = code.replaceAll(CONSTS.SHADER_STRINGS.MAIN_OPERATION, operation);

  // Replace escape condition
  let escape_code =
    settings.escape_type + ' ' + Number(settings.escape_value).toFixed(12);
  code = code.replaceAll(CONSTS.SHADER_STRINGS.ESCAPE_CONDITION, escape_code);

  return code.replaceAll(CONSTS.SHADER_STRINGS.FORMULA, formula + ';');
}

export function setupParamsForms() {
  let params_container = document.getElementById('parameters');
  params_container.innerHTML = '';

  for (let i = 0; i < settings.variables.length; i++) {
    let form = document.createElement('div');
    form.classList.add('param');

    // Name
    let name = document.createElement('span');
    name.innerText = settings.variables[i].name;
    form.appendChild(name);

    // Real input
    let real_label = document.createElement('label');
    real_label.innerText = 'real: ';
    form.appendChild(real_label);

    let real = document.createElement('input');
    real.type = 'number';
    real.step = 0.01;
    real.value = settings.variables[i].real;
    real.addEventListener('input', r => {
      settings.variables[i].real = Number(real.value);
      renderer.updateVariable(
        settings.variables[i].name, settings.variables[i].real,
        settings.variables[i].imaginary);
      renderer.render();
    })
    real.disabled = settings.variables[i].type == CONSTS.TYPES.RELATIVE;
    form.appendChild(real);

    // Imaginary input
    let imag_label = document.createElement('label');
    imag_label.innerText = 'imag: ';
    form.appendChild(imag_label);

    let imag = document.createElement('input');
    imag.type = 'number';
    imag.step = 0.01;
    imag.value = settings.variables[i].imaginary;
    imag.addEventListener('input', r => {
      settings.variables[i].imaginary = Number(imag.value);
      renderer.updateVariable(
        settings.variables[i].name, settings.variables[i].real,
        settings.variables[i].imaginary);
      renderer.render();
    })
    imag.disabled = settings.variables[i].type == CONSTS.TYPES.RELATIVE;
    form.appendChild(imag);

    // Types
    let type = document.createElement('select');
    for (const key in CONSTS.TYPES) {
      let option = document.createElement('option');
      option.value = CONSTS.TYPES[key];
      option.innerText = CONSTS.TYPES[key];
      if (CONSTS.TYPES[key] == settings.variables[i].type) {
        option.selected = true;
      }
      type.appendChild(option);
    }
    type.value = settings.variables[i].type;
    type.addEventListener('input', r => {
      settings.variables[i].type = type.value;
      if (settings.variables[i].type == CONSTS.TYPES.STATIC) {
        settings.variables[i].real = Number(real.value);
        settings.variables[i].imaginary = Number(imag.value);
      }
      real.disabled = settings.variables[i].type == CONSTS.TYPES.RELATIVE;
      imag.disabled = settings.variables[i].type == CONSTS.TYPES.RELATIVE;
      generateFractal();
    })
    form.appendChild(type);

    // Main
    let main_label = document.createElement('label');
    main_label.innerText = 'Main: ';
    form.appendChild(main_label);

    let main = document.createElement('input');
    main.type = 'radio';
    main.name = 'main';
    main.checked = settings.variables[i].main;
    main.addEventListener('input', r => {
      settings.variables.forEach(t => {
        t.main = false;
      });
      settings.variables[i].main = true;
      generateFractal();
      setupParamsForms();
    })

    form.appendChild(main);

    // Remove
    if (!settings.variables[i].main) {
      let remove = document.createElement('button');
      remove.innerText = 'Remove';
      remove.addEventListener('click', r => {
        settings.variables = settings.variables.filter(k => { return k != e });
        setupParamsForms(settings);
        generateFractal(settings);
      })
      form.append(remove);
    }

    params_container.appendChild(form);
  }
}