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
export const triangle_vertex = [
    // Vertex 1
        -1, 1, 0,  // X Y Z
         0, 0, 1,  // RGB blue
    // Vertex 2
         1,-1, 0,  // X Y Z
         1, 1, 0,  // RGB Yellow
    // Vertex 3
         1, 1, 0,  // X Y Z
         1, 0, 0   // RGB Red
    ]

export const triangle_faces = [0, 1, 2];