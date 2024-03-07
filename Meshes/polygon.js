const Tau = 2 * Math.PI;

function createVertex(a, v, Z=0, radius=1) {
    const angle = Tau / v * a;
    const X = Math.sin( angle ) * radius
    const Y = Math.cos( angle ) * radius;
    return [
        parseFloat(X.toFixed(4)),
        parseFloat(Y.toFixed(4)),
        Z
    ];
}

const randomVec3Color = () => (
    [
        Math.random(),
        Math.random(),
        Math.random(),
    ]
)

function generate_polygon_faces( vertices ) {
    const array = [];
    for (let i = 0 ; i < vertices*3 ; i++) {
        array.push(i);
    }
    return array;
}
function generate_polygon_vertices( vertices, centerZ=0, radius=1 ) {
    const array = [];
    for (let i=0 ; i < vertices ; i++) {
        array.push(0,0,centerZ);
        array.push(...randomVec3Color());

        array.push(...createVertex(i, vertices, 0, radius));
        array.push(...randomVec3Color());

        if (i != vertices - 1) array.push(...createVertex(i +1, vertices, 0, radius));
        else array.push(...createVertex(0, vertices, 0, radius));

        array.push(...randomVec3Color());
    }
    return array;
}

export {
    generate_polygon_vertices,
    generate_polygon_faces
}