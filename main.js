/** Importing the Shaders
 *
 *  Shaders are pieces of code compiled by WebGL
 *  written in `GLSL` and executed on the GPU
 *  We have a `vertex shader` and a `fragment shader` both declared as strings.
 */
import { shader_fragment_source } from "./Shaders/fragment_shader.js";
import { shader_vertex_source } from "./Shaders/vertex_shader.js";

/** Linear Algebra Library
 */ import { LIBS } from './libs.js'

/** 3D Vertices
 */ import { triangle_vertex, triangle_faces } from "./Meshes/triangle.js";
    import { cube_vertex, cube_faces } from "./Meshes/cube.js";
    import { colored_cube_vertex, colored_cube_faces } from "./Meshes/uniformly_colored_cube.js";
    import * as polygon from './Meshes/polygon.js';

/** Utility functions
 */import {
    create_control_panel,
    create_btn,
    create_checkbox,
    create_slider,
    add_mouse_events
  } from "./utils.js";


/** Boolean for exiting the rendering_loop
 */ let isRendering = true;
/** Boolean for enabling anitaliasing
 */ let isAntialiasing = false;

let canvas;

function main() {

    canvas = document.getElementById('canvas');
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

/** We assign a javascript variable with the position of a `GLSL` variable in the `WebGLProgram`
 *  `getAttribLocation()` for `attribute` variables,
 *  and `getUniformLocation()` for `unfiform` variables.
 *  Those methods return a `GLint`
 *
 */ let _position = GL.getAttribLocation(SHADER_PROGRAM, 'position');
    let _color    = GL.getAttribLocation(SHADER_PROGRAM, 'color');

    let _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, 'Pmatrix');
    let _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, 'Vmatrix');
    let _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, 'Mmatrix');

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

let vertex_array = colored_cube_vertex;


/** VBO - Vertex Buffer Object
 *  We first create a buffer named `VERTEX_ARRAY`
 */ let VERTEX_ARRAY = GL.createBuffer();

/** We bind the buffer `VERTEX_ARRAY` to `GL.ARRAY_BUFFER`,
 *  for WebGL to know how to handle that buffer.
 *
 *  GL.ARRAY_BUFFER is the binding point (target) indicating
 *  that this is a buffer containing vertex attributes such as:
 *  - vertex coordinates
 *  - texture coordinate data
 *  - or vertex color data
 */ GL.bindBuffer(GL.ARRAY_BUFFER, VERTEX_ARRAY);


/** Intializing and creating the buffer object's data store or data buffer
 *
 *  new Float32Array(vertex_array) is used to create an array of 32bits floats from the `vertex_array` array.
 *
 *  GL.STATIC_DRAW is a `GLenum` specifying the intended usage pattern of the data store for optimization purposes.
 *  Here the enum means: The contents are intended to be specified once by the application,
 *  and used many times as the source for WebGL drawing and image specification commands.
 */ GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(vertex_array),
        GL.STATIC_DRAW
    );

/** Faces
 * 
 *  under faces_array we will specify the vertices we want to connect.
 */ let faces_array = colored_cube_faces;


/** create a buffer named FACES_ARRAY
 */ let FACES_ARRAY = GL.createBuffer();

/** We bind `FACES_ARRAY` to `GL.ELEMENT_ARRAY_BUFFER` target,
 *  for WebGL to know how to handle that buffer.
 */ GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FACES_ARRAY);

/** Now we can add to the buffer the array of indicies:
 */ GL.bufferData(
      GL.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(faces_array),
      GL.STATIC_DRAW
    );

/** Projection Matrix
 *  more details in libs.js `40` is the angle in degrees of the camera.
 *  The camera only show pixels between zMin and zMax.
 */ let PROJMATRIX = LIBS.get_projection(40, canvas.width / canvas.height, 1, 100);

/** Movement and View Matrices initialized with an identity 4*4 matrix
 */ let MOVEMATRIX = LIBS.get_I4();
    let VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -5);

let angles = {
  THETA: 0,
  PHI: 0
}
add_mouse_events(canvas, angles);

/**
 *  We specify the color used to clear the buffers,
 *  this color will be used by GL.clear()
 *  here use a transparent RGBA color.
 */ GL.clearColor(0.0, 0.0, 0.0, 0.0);

/** Enabling Depth Buffer Test
 */ GL.enable(GL.DEPTH_TEST);
/** Set the function for comparing incoming pixel depth to the current depth buffer value.
 *  GL.LEQUAL means pass if the value is Less or Equal to the depth buffer value.
 */ GL.depthFunc(GL.LEQUAL);
/** Set clear value for depth buffer
 */ GL.clearDepth(1.0);

let drawMesh = function() {GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0); };

let Xinc = 0;
let Yinc = 1;
let Zinc = 0;

 let time_prev = 0;

/** Recusive rendering function:
 */ let rendering_loop = function(time) {
      if(! isRendering  ) return;

      let dAngle = 0.0005*(time - time_prev);
      LIBS.rotateX(MOVEMATRIX, dAngle * Xinc);
      LIBS.rotateY(MOVEMATRIX, dAngle * Yinc);
      LIBS.rotateZ(MOVEMATRIX, dAngle * Zinc);

      // LIBS.set_I4(MOVEMATRIX);
      // LIBS.rotateY(MOVEMATRIX, angles.THETA);
      // LIBS.rotateX(MOVEMATRIX, angles.PHI)

      time_prev = time;

  /** We set the viewport which specifies the affine transformation of x and y from normalized device coordinates to window coordinates.
   */ GL.viewport(0, 0, canvas.width, canvas.height);
   
   /** We clear the canvas and the buffer depth
    */ GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

   /** pass the 3rd argument that represent a square matrix of `fv` floating point values
    *  to a shader variable, the location of the variable is stored in the first argument
    *  and was retrieved earlier.
    */ GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
       GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
       GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

      GL.bindBuffer(GL.ARRAY_BUFFER, VERTEX_ARRAY);

    /** GL.vertexAttribPointer(attributeIndex, size, type, normalized, stride, offset)
     *
     * `attributeIndex` specifies the index of the attribute variable in the
     * vertex shader to which the data buffer will be bound in WebGL it corresponds to
     * the location of the attribute variable as obtained using the `GL.getAttribLocation()`.
     *
     * `size` indicates the number of component per vertex attribute
     * if the attribute represent a 2D coordinates (x, y) the size would be 2.
     *
     * `type` represent the type of each component in the attribute array
     * in WebGL the most common types inclue `GL.FLOAT` `GL.INT`, or `GL.UNSIGNED_BYTE`.
     *
     * `normalized` indicated wether fixed point data should be normalized ('true')
     * or ('false') meaning that the floating-point value should be converted directly when
     * beign accessed. Often this parameter is set to 'false'.
     *
     * `stride` specifies the number of bytes between consecutive attributes.
     * The stride in the both method calls is set to `4 * (n+3)` why ?
     * because we have components of `32` bit floating point values which is equal to 4 bytes.
     * Then (n+3) is used because in the array we have (n+3) components per attribute:
     * n components for number of coordinates X, Y, ...
     * 3 components for the RGB values
     * The result is `(n+3) components * 4 bytes`.
     *
     * `offset` indicate the byte offset from the beginning of the buffer to the first
     * attribute in the buffer in the second call of the function we have this parameter set to
     * `n * 4` this means that the color attribute start `n` components into the vertex.
     * Because the first `n` components are the position attributes (X, Y, ... coordinates).
     * And why `n * 4` ? Because it is `2 components * 4 bytes`.
     */
    GL.vertexAttribPointer(_position, 3, GL.FLOAT, false, 4*(3+3), 0);
    GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(3+3), 3*4);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, FACES_ARRAY);

    /** drawMesh() call drawElements();
     *  drawElements(mode, count, type, offset) Renders primitives from an arry of data
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
     */
    drawMesh();

    /** Empties the different buffers
     */ GL.flush();

    window.requestAnimationFrame(rendering_loop);
  };
  rendering_loop(0);

  (function init_panel() {
    const panel = create_control_panel();

    const subPanel = document.createElement('div');
    subPanel.id = 'subPanel';
    panel.appendChild( subPanel );

    function setSubPanel(panel) {
      if ( !subPanel ) return;
      subPanel.innerHTML = ''
      subPanel.appendChild(panel);
    }

    function stop_loop() {
      isRendering = false;
      GL.clearColor(1.0, 1.0, 1.0, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT);
      GL.flush();
      time_prev = 0;
    }
  
    function start_loop() {
      isRendering = true;
      GL.clearColor(0.0, 0.0, 0.0, 0.0);
      rendering_loop(0);
    }

    function restart_loop() {
      stop_loop();
      start_loop();
    }

    function changeZ(value){
      LIBS.translateZ(VIEWMATRIX,-value);
    }

    function changeVfov(value) {
      PROJMATRIX = LIBS.get_projection(value, canvas.width / canvas.height, 1, 100); 
    }

    function bindBuffers() {
      GL.bufferData(
        GL.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(faces_array),
        GL.STATIC_DRAW
      );

      GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array(vertex_array),
        GL.STATIC_DRAW
      );

    }

    function setMeshTriangle() {
      vertex_array = triangle_vertex;
      faces_array = triangle_faces;
      // 6 faces * 2 triangle per face * 3 points per face.
      drawMesh = function() { GL.drawElements(GL.TRIANGLES, 3, GL.UNSIGNED_SHORT, 0) };
      bindBuffers();
    }
    function setMeshCube() {
      vertex_array = cube_vertex;
      faces_array = cube_faces;
      drawMesh = function() { GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0) };
      bindBuffers();
    }
    function setMeshColoredCube() {
      vertex_array = colored_cube_vertex;
      faces_array = colored_cube_faces;
      drawMesh = function() { GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0) };
      bindBuffers();
    }
    let mesh_div = document.createElement('div');
    create_btn(mesh_div, 'Triangle', () => {
      setMeshTriangle()
      setSubPanel(false);
    });
    create_btn(mesh_div, 'Cube', () => {
      setMeshCube();
      setSubPanel(false);
    });
    create_btn(mesh_div, 'Colored Cube', () => {
      setMeshColoredCube();
      setSubPanel(false);
    });
    panel.appendChild(mesh_div);


    //____CONE
    let cone = {
      vertices: 8,
      height: 1,
      radius: 1
    }

    function setMeshCone(obj) {
      cone = {...cone, ...obj}

      //base triangles
      const a = polygon.generate_polygon_vertices(cone.vertices, 0, cone.radius);
      //top to radius triangles
      const b = polygon.generate_polygon_vertices(cone.vertices, cone.height, cone.radius);
      vertex_array = a.concat(b);
      faces_array = polygon.generate_polygon_faces(cone.vertices * 2);
      drawMesh = function() {GL.drawElements(GL.TRIANGLES, cone.vertices*2*3, GL.UNSIGNED_SHORT, 0); };
      bindBuffers();

    }

    const cone_panel = document.createElement('div');
    create_slider(cone_panel, 3, 100, cone.vertices, 'Cone Vertices', (value) => setMeshCone( {vertices: value} ));
    create_slider(cone_panel, 1, 50, cone.height, 'Cone Height', (value) => setMeshCone( {height: value} ));
    create_slider(cone_panel, 1, 20, cone.radius, 'Cone Radius', (value) => setMeshCone( {radius: value} ));

    create_btn(mesh_div, 'Cone', () => {
      setMeshCone(cone);
      setSubPanel(cone_panel);
    });

    const polygon_panel = document.createElement('div');


    //____POLYGON
    let poly = {
      vertices: 8,
      radius: 1
    }

    function setMeshPolygon(obj) {
      poly = {...poly, ...obj};
      vertex_array = polygon.generate_polygon_vertices(poly.vertices, 0, poly.radius);
      faces_array = polygon.generate_polygon_faces(poly.vertices);
      drawMesh = function() {GL.drawElements(GL.TRIANGLES, poly.vertices*3, GL.UNSIGNED_SHORT, 0); };
      bindBuffers();
    }

    create_slider(polygon_panel, 3, 140, poly.vertices, 'Vertices', (value) => setMeshPolygon( {vertices: value} ));
    create_slider(polygon_panel, 1, 20, poly.radius, 'Radius', (value) => setMeshPolygon( {radius: value} ), 0.0001);

    create_btn(mesh_div, 'Polygon', () => {
      setMeshPolygon(poly);
      setSubPanel(polygon_panel);
    });

    //____PANEL
    create_btn(panel, 'stop loop', stop_loop);
    create_btn(panel, 'start loop', start_loop);
    create_btn(panel, 'restart loop', restart_loop);
    create_slider(panel, 0, 100, 2, 'Z-view', changeZ)
    create_slider(panel, 10, 90, 40, 'V-fov', changeVfov);
    create_slider(panel, 0, 20, 0, 'Rotation-X', (value) => Xinc = value);
    create_slider(panel, 0, 20, 1, 'Rotation-Y', (value) => Yinc = value);
    create_slider(panel, 0, 20, 0, 'Rotation-Z', (value) => Zinc = value);

    function toggle_antialiasing() {
      isAntialiasing = checkbox.checked;
    }
    const checkbox = create_checkbox(panel, 'antialiasing', 'enable antialiasing', toggle_antialiasing);

  }() );

}
window.addEventListener('load', main);
