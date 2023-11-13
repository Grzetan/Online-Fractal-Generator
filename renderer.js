export default class Renderer {
    vertices = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

    constructor (canvas_id) {
        var canvas = document.getElementById(canvas_id);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight; 
        this.gl = canvas.getContext("webgl");

        if (!this.gl) {
          throw new Error("WebGL is not supported in this browser!");
        }

        // Create buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Feed GPU with VERTEX shader and compile
        this.vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, window.vertexShader);
        gl.compileShader(vertShader);

        this.shaderProgram = gl.createProgram();
    }

    updateFragmentShader(fragmentShader){
        // Feed GPU with FRAGMENT shader and compile
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        console.log(getFragmentShaderWithFormula(fractalCode, variables))
        gl.shaderSource(fragShader, fragmentShader);
        gl.compileShader(fragShader);
        console.log(gl.getShaderInfoLog(fragShader))
        
        // Initialize rendering program
        gl.attachShader(this.shaderProgram, this.vertShader);
        gl.attachShader(this.shaderProgram, fragShader);
        gl.linkProgram(this.shaderProgram);
        gl.useProgram(this.shaderProgram);
        
        // Bind shader attribute to buffer
        const coord = gl.getAttribLocation(this.shaderProgram, "coordinates");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0,0,canvas.width,canvas.height);

        const resolution = gl.getUniformLocation(shaderProgram, "u_resolution");
        gl.uniform2f(resolution, canvas.width, canvas.height);
    }

    render(){
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    updateParam(name, re, im){
        const param = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform2f(param, re, im);
    }
    
}