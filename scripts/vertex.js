export let vertexShaderCode = `
attribute vec4 coordinates;

void main(void) {
  gl_Position = coordinates;
}
`;