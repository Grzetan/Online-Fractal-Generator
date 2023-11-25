export const CONSTS = {
  TYPES: {STATIC: 'const', RELATIVE: 'relative'},

  ITERATION_METHOD: {
    RECURSION: 'recursion',
    ADDITION: 'addition',
    SUBTRACTION: 'subtraction'
  },

  COLOR_METHOD: {ROOTS: 1, ITERATIONS: 2},

  ESCAPE_TYPE: {GREATER_THAN: '>', LESS_THAN: '<'},

  OPERATORS: {
    '-': {code: 'subtract(', associativity: 'left', precedence: 1},
    '+': {code: 'add(', associativity: 'left', precedence: 1},
    '/': {code: 'div(', associativity: 'left', precedence: 2},
    '*': {code: 'mul(', associativity: 'left', precedence: 2},
    '^': {code: 'power(', associativity: 'right', precedence: 3}
  },

  FUNCTIONS: {
    'len': {code: 'len()'},
    'abs': {code: 'abs()'},
    'sin': {code: 'sin()'},
    'conj': {code: 'conjugate()'},
    'neg': {code: 'neg()'},
    'inv': {code: 'inverse()'}
  },

  SHADER_STRINGS: {
    CONST_PARAMS: '//PASTE CONST VARIABLES HERE',
    RELATIVE_PARAMS: '//PASTE RELATIVE VARIABLES HERE',
    RELATIVE_VALUE: '=getRelativeValue(uv),',
    MAIN_PARAM: 'vec(0.0) //PASTE MAIN VARIABLE HERE',
    MAIN_OPERATION: '//PASTE MAIN OPERATION HERE',
    ESCAPE_CONDITION: '/*PASTE ESCAPE HERE*/',
    FORMULA: 'vec2(0.0) //PASTE FORMULA HERE'
  }
}
