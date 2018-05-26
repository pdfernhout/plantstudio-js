import * as o from "ospec"
import { KfObject3D } from "../source/KfObject3D"
import { KfPoint3D } from "../source/KfPoint3D";

const exampleTDOMemo = `start 3D object
Name=Tutorial leaf
  Point=0 0 0
  Point=-7 -75 8
  Point=1 -77 6
  Point=-8 -117 6
  Point=1 -119 4
  Point=2 -179 2
  Point=10 -117 6
  Point=9 -75 7
  Triangle=1 2 3
  Triangle=2 4 3
  Triangle=4 5 3
  Triangle=4 6 5
  Triangle=5 6 7
  Triangle=3 5 7
  Triangle=3 7 8
  Triangle=3 8 1
end 3D object`.split("\n")

/*
const expected = {
    points:
     [ KfPoint3D { x: 0, y: 0, z: 0 },
       KfPoint3D { x: -7, y: -75, z: 8 },
       KfPoint3D { x: 1, y: -77, z: 6 },
       KfPoint3D { x: -8, y: -117, z: 6 },
       KfPoint3D { x: 1, y: -119, z: 4 },
       KfPoint3D { x: 2, y: -179, z: 2 },
       KfPoint3D { x: 10, y: -117, z: 6 },
       KfPoint3D { x: 9, y: -75, z: 7 } ],
    pointsInUse: 8,
    pointsAllocated: 8,
    originPointIndex: 0,
    triangles:
     [ KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] },
       KfIndexTriangle { pointIndexes: [Array] } ],
    name: 'Tutorial leaf',
    originalIfCopy: null,
    inUse: false,
    zForSorting: 0,
    indexWhenRemoved: 0,
    selectedIndexWhenRemoved: 0,
    boundsRect: { Left: 0, Top: 0, Right: 0, Bottom: 0 }
}
*/

o.spec("KfObject3D", () => {

    o("parse", () => {
        const tdo = new KfObject3D()
        tdo.readFromMemo(exampleTDOMemo, 0)
        o(tdo.name).equals("Tutorial leaf")
        o(tdo.points.length).equals(8)
        o(tdo.points[1].x).equals(-7)
        o(tdo.points[1].y).equals(-75)
        o(tdo.points[1].z).equals(8)
        o(tdo.triangles.length).equals(8)
    })

})
