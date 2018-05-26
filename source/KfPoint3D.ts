import { float } from "./common"

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

export function KfPoint3D_scaleBy(thePoint: KfPoint3D, aScale: float): void {
    // pdf - multiply point by scale.
    thePoint.x = thePoint.x * aScale
    thePoint.y = thePoint.y * aScale
    thePoint.z = thePoint.z * aScale
}
