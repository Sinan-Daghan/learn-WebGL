export const shader_fragment_source = (

'   precision mediump float;                                  \n'+
'                                                             \n'+
// vColor is the perpixel interpolated vertex shader vColor variable
// vColor in this file is bound to the vColor in the fragment shader just by using the same name
'   varying vec3 vColor;                                      \n'+
'                                                             \n'+
'   void main(void) {                                         \n'+
// gl_FragColor take a vec4 with (R,G,B,A) components, so the Alpha is set to 1 (fully opaque)
// and vColor variable passed from the vertex shader is used to set the RGB components
'       gl_FragColor = vec4(vColor, 1.);                      \n'+
'   }                                                         \n'+
'                                                             \n'

);