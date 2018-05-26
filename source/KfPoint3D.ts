import { float, long, intround } from "./common"
import { TRect } from "./TRect";

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

    // TODO: Remove setXYZ if not needed
    setXYZ(x: float, y: float, z: float): KfPoint3D {
        this.x = x
        this.y = y
        this.z = z
        return this
    }
}

export function KfPoint3D_setXYZ(thePoint: KfPoint3D, aX: float, aY: float, aZ: float): void {
    thePoint.x = aX
    thePoint.y = aY
    thePoint.z = aZ
}

export function KfPoint3D_addXYZ(thePoint: KfPoint3D, xOffset: float, yOffset: float, zOffset: float): void {
    // pdf - shift point by x y and z.
    thePoint.x = thePoint.x + xOffset
    thePoint.y = thePoint.y + yOffset
    thePoint.z = thePoint.z + zOffset
}

export function KfPoint3D_scaleBy(thePoint: KfPoint3D, aScale: float): void {
    // pdf - multiply point by scale.
    thePoint.x = thePoint.x * aScale
    thePoint.y = thePoint.y * aScale
    thePoint.z = thePoint.z * aScale
}

export function KfPoint3D_subtract(thePoint: KfPoint3D, aPoint: KfPoint3D): void {
    // pdf - subtract point from this point.
    thePoint.x = thePoint.x - aPoint.x
    thePoint.y = thePoint.y - aPoint.y
    thePoint.z = thePoint.z - aPoint.z
}

export function KfPoint3D_matchXYZ(pointOne: KfPoint3D, pointTwo: KfPoint3D, matchDistance: float): boolean {
    // v1.6b1 added
    const result = 
        (Math.abs(pointOne.x - pointTwo.x) <= matchDistance) &&
        (Math.abs(pointOne.y - pointTwo.y) <= matchDistance) &&
        (Math.abs(pointOne.z - pointTwo.z) <= matchDistance)
    return result
}

export function KfPoint3D_addPointToBoundsRect(boundsRect: TRect, aPoint: KfPoint3D): void {
    let x: long
    let y: long
    
    try {
        x = intround(aPoint.x)
    } catch (e) {
        x = 0
    }
    try {
        y = intround(aPoint.y)
    } catch (e) {
        y = 0
    }
    if ((boundsRect.Left === 0) && (boundsRect.Right === 0) && (boundsRect.Top === 0) && (boundsRect.Bottom === 0)) {
        // on first point entered, initialize bounds rect
        boundsRect.Left = x
        boundsRect.Right = x
        boundsRect.Top = y
        boundsRect.Bottom = y
    } else {
        if (x < boundsRect.Left) {
            boundsRect.Left = x
        } else if (x > boundsRect.Right) {
            boundsRect.Right = x
        }
        if (y < boundsRect.Top) {
            boundsRect.Top = y
        } else if (y > boundsRect.Bottom) {
            boundsRect.Bottom = y
        }
    }
}
