import {CONSTS} from './config.js';

class Operation {
  constructor(type, first, second) {
    this.type = type;
    this.first = first;
    this.second = second;
  }

  toString() {
    return CONSTS.OPERATORS[this.type].code + this.first + ', ' + this.second +
        ')';
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
  let start, end;
  for (let i = 0; i < inputString.length; i++) {
    if (inputString[i] == '[') {
      start = i;
    } else if (inputString[i] == ']') {
      end = i;
    }
  }

  return inputString.slice(start + 1, end);
}

function RPN2Code(formula) {
  let splitted = formula.split(' ')

  for (let i = 0; i < splitted.length; i++) {
    let operation = removeAfterChar(splitted[i], '[');
    if (Object.keys(CONSTS.FUNCTIONS).includes(operation)) {
      let content = extractStringInParentheses(splitted[i]);
      splitted[i] = CONSTS.FUNCTIONS[operation].code + '(' + content + ')';
    }
  }

  let stack = [];

  for (let i = 0; i < splitted.length; i++) {
    if (Object.keys(CONSTS.OPERATORS).includes(splitted[i])) {
      let second = stack.pop();
      let first = stack.pop();
      let operation = new Operation(splitted[i], first, second);
      stack.push(operation.toString());
    } else {
      stack.push(splitted[i]);
    }
  }

  let output = stack[0].toString();

  return output;
}

function scalarsToComplex(formula) {
  for (let i = 0; i < formula.length; i++) {
    if (!isNaN(formula[i])) {
      formula[i] = 'vec2(' + Number(formula[i]).toFixed(6).toString() + ',0.0)';
    }
  }

  return formula;
}

function handleUnaryMinuses(formula){
  formula = formula.filter(i=>{return i != ""})
  let newFormula = [];
  for(let i=0; i<formula.length; i++){
    if(formula[i] == " "){
      continue
    }

    if(formula[i] == "-" && (i == 0 || CONSTS.CHARS.includes(formula[i-1]))){
      newFormula.push("(");
      newFormula.push("0");
      newFormula.push("-");
      newFormula.push(formula[i+1]);
      newFormula.push(")");
      i++;
    }else{
      newFormula.push(formula[i]);
    }
  }

  return newFormula;
}

// https://www.andreinc.net/2010/10/05/converting-infix-to-rpn-shunting-yard-algorithm
function formula2RPN(formula) {
  let splitted = formula.split(' ');
  splitted = handleUnaryMinuses(splitted);
  splitted = splitted.filter(a => a != '');
  splitted = scalarsToComplex(splitted);

  let output = [];
  let stack = [];
  for (let i = 0; i < splitted.length; i++) {
    if (Object.keys(CONSTS.OPERATORS).includes(splitted[i])) {
      while (stack.length != 0 &&
             Object.keys(CONSTS.OPERATORS).includes(stack[stack.length - 1])) {
        const curr = CONSTS.OPERATORS[splitted[i]];
        const next = CONSTS.OPERATORS[stack[stack.length - 1]];
        if ((curr.associativity == 'left' &&
             next.precedence >= curr.precedence) ||
            (curr.associativity == 'right' &&
             next.precedence > curr.precedence)) {
          output.push(stack.pop());
          continue;
        }
        break;
      }
      stack.push(splitted[i]);
    } else if (splitted[i] == '(') {
      stack.push(splitted[i]);
    } else if (splitted[i] == ')') {
      while (stack.length != 0 && stack[stack.length - 1] != '(') {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      output.push(splitted[i]);
    }
  }

  while (stack.length != 0) {
    output.push(stack.pop());
  }

  return output.join(' ');
}

export function formula2Code(formula) {
  formula = preprocessFormula(formula);
  return RPN2Code(formula2RPN(formula));
}

function preprocessFormula(formula) {
  for (let i = 0; i < CONSTS.CHARS.length; i++) {
    formula = formula.split(CONSTS.CHARS[i]).join(' ' + CONSTS.CHARS[i] + ' ');
  }

  return formula;
}