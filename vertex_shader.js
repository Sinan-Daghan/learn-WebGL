
export const shader_vertex_source= (

// position of the point, X and Y coordinates
'   attribute vec2 position;                   \n'+
// color of the point in the RGB format
'   attribute vec3 color;                      \n'+
// variable used to send a color to the fragment shader
'   varying vec3 vColor;                       \n'+
'                                              \n'+
'   void main(void) {                          \n'+
// here the vec4 take (x, y, z, w);
'       gl_Position = vec4(position, 0., 1.);  \n'+
// vColor is declared per point here. Since it is a varying variable it will be automatically
// interpolated per pixel between triangle points. And it will make a color gradient on the triangle
'       vColor = color;                        \n'+
'   }                                          \n'

)