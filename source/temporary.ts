// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs } from "./common";

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

// TODO: Fix copied code from utdo
export const kMaximumRecordedPoints = 10000
export const kTdoLineContrastIndex = 10
export const kTdoForeColor = ColorDefs.clSilver
export const kTdoBackColor = ColorDefs.clGray
export function KfPoint3D_scaleBy(thePoint: KfPoint3D, aScale: float): void {
    // pdf - multiply point by scale.
    thePoint.x = thePoint.x * aScale
    thePoint.y = thePoint.y * aScale
    thePoint.z = thePoint.z * aScale
}
