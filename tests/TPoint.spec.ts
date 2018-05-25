import * as o from "ospec"
import { TPoint } from "../source/TPoint"

o.spec("TPoint", () => {

    o("copy", () => {
        const point = new TPoint(1, 2)
        const copy = point.copy()
        o(copy.X).equals(1)
        o(copy.Y).equals(2)
    })

})
