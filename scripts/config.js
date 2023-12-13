export const CONSTS = {
  TYPES: { STATIC: 'const', RELATIVE: 'relative' },

  ITERATION_METHOD: {
    RECURSION: 'recursion',
    ADDITION: 'addition',
    SUBTRACTION: 'subtraction'
  },

  COLOR_METHOD: { ROOTS: 1, ITERATIONS: 2 },

  ESCAPE_TYPE: { GREATER_THAN: '>', LESS_THAN: '<' },

  OPERATORS: {
    '-': { code: 'subtract(', associativity: 'left', precedence: 1 },
    '+': { code: 'add(', associativity: 'left', precedence: 1 },
    '/': { code: 'div(', associativity: 'left', precedence: 2 },
    '*': { code: 'mul(', associativity: 'left', precedence: 2 },
    '^': { code: 'power(', associativity: 'right', precedence: 3 }
  },

  FUNCTIONS: {
    'len': { code: 'len' },
    'abs': { code: 'cabs' },
    'sin': { code: 'csin' },
    'cos': { code: 'ccos' },
    'sinh': { code: 'csinh' },
    'cosh': { code: 'ccosh' },

    // 'conj': { code: 'conjugate' },
    // 'neg': { code: 'neg' },
    // 'inv': { code: 'inverse' }
  },

  SHADER_STRINGS: {
    CONST_PARAMS: '//PASTE CONST VARIABLES HERE',
    RELATIVE_PARAMS: '//PASTE RELATIVE VARIABLES HERE',
    RELATIVE_VALUE: '=getRelativeValue(uv),',
    MAIN_PARAM: 'vec(0.0) //PASTE MAIN VARIABLE HERE',
    MAIN_OPERATION: '//PASTE MAIN OPERATION HERE',
    ESCAPE_CONDITION: '/*PASTE ESCAPE HERE*/',
    FORMULA: 'vec2(0.0) //PASTE FORMULA HERE'
  },

  ZOOM_POWER: 0.05
}

export let settings = {
  formula: '(z^3-1)/(3*z^2)',
  iteration: CONSTS.ITERATION_METHOD.SUBTRACTION,
  color: CONSTS.COLOR_METHOD.ROOTS,
  escape_type: CONSTS.ESCAPE_TYPE.LESS_THAN,
  escape_value: 1e-6,
  max_iterations: 400,
  plane_start: { x: -2, y: -1.5 },
  plane_length: { x: 4, y: 3 },
  variables: [{ name: 'z', type: CONSTS.TYPES.RELATIVE, main: true }]
}

export function setSettings(new_settings) {
  settings = new_settings;
}

function adjustProportions() {
  const starting_width = 6;

  const plane_start_y = -(window.innerHeight / window.innerWidth) * starting_width / 2;
  settings.plane_length = { x: starting_width, y: (window.innerHeight / window.innerWidth) * starting_width };
  settings.plane_start = { x: -starting_width / 2, y: plane_start_y };
}

adjustProportions()
