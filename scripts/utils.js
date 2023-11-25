import {CONSTS} from './config.js';
import {fragmentShaderCode} from './fractal.js'

export function getFragmentShaderWithFormula(formula, settings) {
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
  var main_param = settings.variables.find(obj => {return obj.main})

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
  console.log(settings.escape_type + ' ' + settings.escape_value);
  let escape_code = settings.escape_type + ' ' + settings.escape_value;
  code = code.replaceAll(CONSTS.SHADER_STRINGS.ESCAPE_CONDITION, escape_code);

  return code.replaceAll(CONSTS.SHADER_STRINGS.FORMULA, formula + ';');
}

export function setupParamsForms(variables) {
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