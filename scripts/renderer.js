import { vertexShaderCode } from './vertex.js';

export class Renderer {
vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

constructor (canvas_id) {
    this.canvas = document.getElementById(canvas_id);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight; 
    this.gl = canvas.getContext("webgl");

    if (!this.gl) {
    throw new Error("WebGL is not supported in this browser!");
    }

    // Create buffer
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    // Feed GPU with VERTEX shader and compile
    this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(this.vertShader, vertexShaderCode);
    this.gl.compileShader(this.vertShader);

    this.shaderProgram = this.gl.createProgram();

    this.gl.attachShader(this.shaderProgram, this.vertShader);
}

updateFragmentShader(fragmentShader){
    if(this.fragShader != undefined){
    this.gl.detachShader(this.shaderProgram, this.fragShader);
    }
    
    // Feed GPU with FRAGMENT shader and compile
    this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(this.fragShader, fragmentShader);
    this.gl.compileShader(this.fragShader);
    console.log(this.gl.getShaderInfoLog(this.fragShader))
    
    // Initialize rendering program
    this.gl.attachShader(this.shaderProgram, this.fragShader);
    this.gl.linkProgram(this.shaderProgram);
    this.gl.useProgram(this.shaderProgram);
    
    // Bind shader attribute to buffer
    const coord = this.gl.getAttribLocation(this.shaderProgram, "coordinates");
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(coord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(coord);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.viewport(0,0,canvas.width,canvas.height);

    const resolution = this.gl.getUniformLocation(this.shaderProgram, "u_resolution");
    this.gl.uniform2f(resolution, this.canvas.width, this.canvas.height);
}

render(){
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    console.log("OKK")
}

updateVariable(name, re, im){
    const param = this.gl.getUniformLocation(this.shaderProgram, name);
    this.gl.uniform2f(param, re, im);
    console.log(re, im, name)
}

updateParam(name, val){
    const param = this.gl.getUniformLocation(this.shaderProgram, name);
    this.gl.uniform1i(param, val);
}

}