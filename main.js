/** Importing the Shaders
 *
 *  Shaders are pieces of code compiled by WebGL
 *  written in `GLSL` and executed on the GPU
 *  We have a `vertex shader` and a `fragment shader` both declared as strings.
 */
import { shader_fragment_source } from "./fragment_shader.js";
import { shader_vertex_source } from "./vertex_shader.js";


/** Utility functions
 */import {
    create_control_panel,
    create_btn,
    create_checkbox
  } from "./utils.js";


/** Boolean for exiting the rendering_loop
 */ let isRendering = true;
/** Boolean for enabling anitaliasing
 */ let isAntialiasing = false;

function main() {

    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight;

    /** WebGL context
     *
     *  First we create a WebGL context that the canvas will use to draw WebGL.
     *  We cant use both the `2d` and `webgl` contexts at the same time.
     *  When a canvas is linked with a context we can't release the context,
     *  or link another context to that canvas.
     */

    /** We anotate using JSDoc the GL variable to help the IDE provide autocompletion for the WebGL context.
     * @type {WebGL2RenderingContext} */
    let GL;
    try {
        /**
         * We try to create a `webgl` context the second parameter is an
         * object containing the `contextAttributes` here we tell webgl
         * to not perform antialiasing.
         */
          GL = canvas.getContext('webgl', {antialias: isAntialiasing});
    } catch (e) {
        alert('WebGL context cannot be initialized')
        return false;
    }


/** Shaders compilation
 *
 *  We create a function to compile the shaders, that will use some methods of the WebGL context to do that.
 */ let compile_shader = function(source, type, typeString) {
      // Create a `WebGLShader` named `shader` can be either `fragment` or `vertex` shader.
      let shader = GL.createShader(type);
      // Set the source code of a `WebGLShader`.
      GL.shaderSource(shader, source);
      // Compile a GLSL shader into binary data that can be used by a `WebGLProgram`.
      GL.compileShader(shader);

  /** Test if an error has occurred
   *
   *  `getShaderParameter()` take a `WebGLShader` and a `GLenum` specifying the information to query
   *  it returns a `GLboolean` indicating whether or not the shader compilation was successful.
   */ if( ! GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
          alert('Error in ' + typeString + ' Shader: '+ GL.getShaderInfoLog(shader));
          return false;
      }
      return shader;
    }

/** We compile the shaders using the previous function.
 */ let shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, 'VERTEX');
    let shader_fragment = compile_shader(shader_fragment_source, GL.FRAGMENT_SHADER, 'FRAGMENT');


/** We first create and initialize a `WebGLProgram` object which is a combination of 2 compiled `WebGLShader`.
 */ let SHADER_PROGRAM = GL.createProgram();

/** Then we attach the compiled shaders to `SHADER_PROGRAM`
 */ GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

/** We link the shader program thus completing the process of preparing the GPU code
 *  for the program's `fragment` and `vertex` shaders.
 */ GL.linkProgram(SHADER_PROGRAM);

/** Test to see if any errors have occurred
 */ if (! GL.getProgramParameter(SHADER_PROGRAM, GL.LINK_STATUS)) {
      const info = GL.getProgramInfoLog(SHADER_PROGRAM);
      throw new Error(`Could not compile ${SHADER_PROGRAM}. \n\n ${info}`);
    }

  /** We link the `GLSL` `position` variable to the JavScript `_position` variable.
   *  getAttribLocation() return the location of an attribute variable in a given `WebGLProgram`
   *  the returned value is a `GLint`
   *  We do the same for `_color`
   */
  let _position = GL.getAttribLocation(SHADER_PROGRAM, 'position');
  console.log( '🛟 _position 🛟', _position );

  let _color = GL.getAttribLocation(SHADER_PROGRAM, 'color');
  console.log( '🛟 _color 🛟', _color );

  /** `enableVertexAttribArray()`
   *
   *  https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
   *  This function enable each vertex attribute so that they can be used by the program.
   *  Attributes are referenced by an index number into the list of attributes maintained by the GPU.
   *  Attributes are GLSL variables which are only available to the vertex shader (as variables) and the JavaScript code.
   */
  GL.enableVertexAttribArray(_position);
  GL.enableVertexAttribArray(_color);


  /** We set `SHADER_PROGRAM` which is a `WebGLProgram` as part of the current rendering state.
   */ GL.useProgram(SHADER_PROGRAM);

  /** The Triangle
   *
   *  The total screen is represendted by those coordinates:
   *
   *  ------(0, 1)-----
   *  (-1,0)(0, 0)(1,0)
   *  ------(0,-1)-----
   *
   * (0,0) is the center of the screen
   *
   * Now we define the triangle vertices
   */
let triangle_vertex = [
// Vertex 1
    -1,  1,  // X and Y
     0,0,1,  // RGB blue
// Vertex 2
     1, -1,  // X and Y
     1,1,0,  // RGB Yellow
// Vertex 3
     1,  1,  // X and Y
     1,0,0   // RGB Red
  ]


/** VBO - Vertex Buffer Object
 *  We first create a buffer named `TRIANGLE_VERTEX`
 */ let TRIANGLE_VERTEX = GL.createBuffer();

/** We bind the buffer `TRIANGLE_VERTEX` to `GL.ARRAY_BUFFER`,
 *  for WebGL to know how to handle that buffer.
 *
 *  GL.ARRAY_BUFFER is the binding point (target) indicating
 *  that this is a buffer containing vertex attributes such as:
 *  - vertex coordinates
 *  - texture coordinate data
 *  - or vertex color data
 */ GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);


/** Intializing and creating the buffer object's data store or data buffer
 *
 *  new Float32Array(triangle_vertex) is used to create an array of 32bits floats from the `triangle_vertex` array.
 *
 *  GL.STATIC_DRAW is a `GLenum` specifying the intended usage pattern of the data store for optimization purposes.
 *  Here the enum means: The contents are intended to be specified once by the application,
 *  and used many times as the source for WebGL drawing and image specification commands.
 */ GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(triangle_vertex),
        GL.STATIC_DRAW
    );

/** Faces
 * 
 *  under triangle_faces we will specify the verticies we want to use to render a triangle.
 *  We will use the verticies 0, 1, 2 connected together to represent the triangle.
 */ let triangle_faces = [0, 1, 2];

/** create a buffer named TRIANGLE_FACES
 */ let TRIANGLE_FACES = GL.createBuffer();

/** We bind `TRIANGLE_FACES` to `GL.ELEMENT_ARRAY_BUFFER` target,
 *  for WebGL to know how to handle that buffer.
 */ GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);

/** Now we can add to the buffer the array of indicies:
 */ GL.bufferData(
      GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(triangle_faces),
      GL.STATIC_DRAW
    );

/**
 *  We specify the color used to clear the buffers,
 *  this color will be used by GL.clear()
 *  here use a transparent RGBA color.
 */ GL.clearColor(0.0, 0.0, 0.0, 0.0);


/** Recusive rendering function:
 */ let rendering_loop = function() {
      if(! isRendering  ) return;

  /** We set the viewport which specifies the affine transformation of x and y from normalized device coordinates to window coordinates.
   */ GL.viewport(0, 0, canvas.width, canvas.height);
      GL.clear(GL.COLOR_BUFFER_BIT);

      GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);

    /** GL.vertexAttribPointer(attributeIndex, size, type, normalized, stride, offset)
     *
     * `attributeIndex` specifies the index of the attribute variable in the
     * vertex shader to which the data buffer will be bound in WebGL it corresponds to
     * the location of the attribute variable as obtained using the `GL.getAttribLocation`.
     *
     * `size` indicates the number of component per vertex attribute
     * if the attribute represent a 2D coordinates (x, y) the size would be 2.
     *
     * `type` represent the type of each component in the attribute array
     * in WebGL the mose common types inclue `GL.FLOAT` `GL.INT`, or `GL.UNSIGNED_BYTE`.
     *
     * `normalized` indicated wether fixed point data should be normalized ('true')
     * or ('false') meaning that the floating-point value should be converted directly when
     * beign accessed. Often this parameter is set to 'false'.
     *
     * `stride` specifies the number of bytes between consecutive attributes.
     * The stride in the both method calls is set to `4 *(2+3)` why ?
     * because we have components of `32` bit floating point values which is equal to 4 bytes.
     * Then (2+3) is used because in the array we have 5 components per attribute:
     * 2 components for the x,and y coordinates
     * 3 component for the RGB values
     * The result is `5 components * 4 bytes`.
     *
     * `offset` indicate the byte offset from the beginning of the buffer to the first
     * attribute in the buffer in the second call of the function we have this parameter set to
     * `2 * 4` this means that the color attribute start 2 components into the vertex.
     * Because the first 2 components are the position attributes (x and y coordinates).
     * And why `2 * 4` ? Because it is `2 components * 4 bytes`.
     */
    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false, 4*(2+3), 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(2+3), 2*4);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);

    /** drawElements(mode, count, type, offset) Renders primitives from an arry of data
     *
     *  `mode` a GLenum specifying the type of primitive to render in our case:
     *  GL.TRIANGLES is triangle from a group of 3 vertices.
     *
     *  `count` a GLsizei (Signed int for sizes) specify the number of elements of the bound element array buffer to be rendered
     *  because we use `GL.TRIANGLE` we only need 3 vertices. So we set this parameter to 3.
     *
     *  `type` a GLenum specifying the type of the values in the element array buffer.
     *
     *  `offset` a GLintptr specifying a byte offset in the element array buffer.
     */ GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0);

    /** Empties the different buffers
     */ GL.flush();

    window.requestAnimationFrame(rendering_loop);
  };
  rendering_loop();

  (function init_panel() {
    const panel = create_control_panel();

    function stop_loop() {
      isRendering = false;
      GL.clearColor(1.0, 1.0, 1.0, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT);
      GL.flush();
    }
  
    function start_loop() {
      isRendering = true;
      GL.clearColor(0.0, 0.0, 0.0, 0.0);
      rendering_loop();
    }

    create_btn(panel, 'stop loop', stop_loop);
    create_btn(panel, 'start loop', start_loop);

    const checkbox = create_checkbox(panel, 'antialiasing', 'enable antialiasing', toggle_antialiasing);
  
    function toggle_antialiasing() {
      isAntialiasing = checkbox.checked;
    }

  }() );

}
window.addEventListener('load', main);