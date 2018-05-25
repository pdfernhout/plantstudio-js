// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float } from "./common";

// TODO: Copied KfPoint3D from Utdo -- made into class
export class KfPoint3D {
    x: float
    y: float
    z: float

    constructor(point?: KfPoint3D) {
        if (point) {
            this.x = point.x
            this.y = point.y
            this.z = point.z
        }
    }
}

// TODO: Implement darkerColorWithSubtraction from usupport
export function darkerColorWithSubtraction(a: number, b: number) {
    return a
}
