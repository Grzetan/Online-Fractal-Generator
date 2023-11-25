import { CONSTS } from "./config.js";
import { fragmentShaderCode } from "./fractal.js"

export function getFragmentShaderWithFormula(formula, settings){
    let code = fragmentShaderCode;
  
    // Setup const params
    let const_variables_code = "uniform vec2 ";
    settings.variables.filter(a => a.type == CONSTS.TYPES.STATIC).forEach(e=>{
      const_variables_code += e.name + ",";
    });
    const_variables_code = const_variables_code.slice(0, -1) + ";";
    code = code.replaceAll(CONSTS.SHADER_STRINGS.CONST_PARAMS, const_variables_code);
  
    // Setup relative params
    let relative_variables_code = "vec2 ";
    settings.variables.filter(a => a.type == CONSTS.TYPES.RELATIVE).forEach(e=>{
      relative_variables_code += e.name + CONSTS.SHADER_STRINGS.RELATIVE_VALUE;
    });
    relative_variables_code = relative_variables_code.slice(0, -1) + ";";
    code = code.replaceAll(CONSTS.SHADER_STRINGS.RELATIVE_PARAMS, relative_variables_code);
  
    // Setup main param
    var main_param = settings.variables.find(obj => {
      return obj.main
    })
  
    if(main_param == undefined){
      throw new Error("There is no main variable");
    }
  
    code = code.replaceAll(CONSTS.SHADER_STRINGS.MAIN_PARAM, main_param.name + ";");
  
    // Replace main param with custom name
    formula = formula.replaceAll(main_param.name, "main");
  
    // Replate main operation
    let operation = "";
    switch(settings.iteration){
      case CONSTS.ITERATION_METHOD.RECURSION:
        operation = "main = delta;";
        break;
      case CONSTS.ITERATION_METHOD.ADDITION:
        operation = "main += delta;";
        break;
      case CONSTS.ITERATION_METHOD.SUBTRACTION:
        operation = "main -= delta;";
        break;
    }
  
    code = code.replaceAll(CONSTS.SHADER_STRINGS.MAIN_OPERATION, operation);
  
    // Replace escape condition
    console.log(settings.escape_type + " " + settings.escape_value);
    let escape_code = settings.escape_type + " " + settings.escape_value;
    code = code.replaceAll(CONSTS.SHADER_STRINGS.ESCAPE_CONDITION, escape_code);
  
    return code.replaceAll(CONSTS.SHADER_STRINGS.FORMULA, formula + ";");
  }