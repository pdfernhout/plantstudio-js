import * as o from "ospec"
import { fastTrigCos } from "../source/U3dsupport"

o.spec("U3dsupport", () => {

    o("FastTrig", () => {
        // Angles for fast trig go from 0 to 255, where an angle of 128 equals Pi radians
        const result = fastTrigCos(128)
        o(result).equals(Math.cos(Math.PI))
    })

})
