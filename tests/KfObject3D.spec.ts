import * as o from "ospec"
import { KfObject3D } from "../source/KfObject3D"

const exampleTDOMemo = `
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
`.split("\n")

o.spec("KfObject3D", () => {

    o("parse", () => {
        const tdo = new KfObject3D()
        tdo.readFromMemo(exampleTDOMemo, 1)
        console.log("tdo", tdo)
        o(tdo).equals("TODO")
    })

})
