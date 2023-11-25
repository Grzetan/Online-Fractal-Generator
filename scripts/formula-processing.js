import { CONSTS } from "./config.js";

class Operation{
    constructor(type, first, second){
      this.type = type;
      this.first = first;
      this.second = second;
    }
  
    toString(){
      return CONSTS.OPERATORS[this.type].code + this.first + ', ' + this.second + ")";
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
      if(Object.keys(CONSTS.FUNCTIONS).includes(operation)){
        let content = extractStringInParentheses(splitted[i]);
        console.log(content);
        splitted[i] = content + "." + CONSTS.FUNCTIONS[operation].code;
      }
    }
  
    let stack = [];
  
    for(let i=0; i<splitted.length; i++){
      if(Object.keys(CONSTS.OPERATORS).includes(splitted[i])){
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
    let splitted = formula.split(' ');
    splitted = splitted.filter(a => a != "");
    splitted = scalarsToComplex(splitted);
  
    let output = [];
    let stack = [];
    for(let i=0; i<splitted.length; i++){
      if(Object.keys(CONSTS.OPERATORS).includes(splitted[i])){
        while(stack.length != 0 && Object.keys(CONSTS.OPERATORS).includes(stack[stack.length-1])){
          const curr = CONSTS.OPERATORS[splitted[i]];
          const next = CONSTS.OPERATORS[stack[stack.length-1]];
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
  
  export function formula2Code(formula){
    formula = preprocessFormula(formula);
    return RPN2Code(formula2RPN(formula));
  }

  function preprocessFormula(formula){
    let chars = ['(', ')', '+', '-', '*', '/', '^'];
    for(let i=0; i<chars.length; i++){
      formula = formula.split(chars[i]).join(" " + chars[i] + " ");
    }
  
    return formula;
  }