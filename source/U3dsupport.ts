// unit U3dsupport

import { float, int, intround, byte, TColor, short, long } from "./common"
import { TPoint } from "./TPoint"
import { KfPoint3D } from "./KfPoint3D"

export const kFastTrigArraySize = 256
const kDirectionClockwise = 1
const kDirectionCounterClockwise = -1
const kDirectionUnknown = 0

export const SinCache: float[] = new Array(kFastTrigArraySize)
export const CosCache: float[]  = new Array(kFastTrigArraySize)

// if you change this - you need to change angleX etc. functions
// record
export interface TRealRect {
    top: float
    left: float
    bottom: float
    right: float
}

// record
export interface Vertex {
    x: float
    y: float
    z: float
}

// record
export interface VertexTriangle {
    vertex1: int
    vertex2: int
    vertex3: int
}

// ------------------------------------------------------------------- global functions 
function fastTrigInitialize(): void {
    for (let i = 0; i < kFastTrigArraySize; i++) {
        // Approach: sine and cosine arrays are used for speed. Angles are 0 - 255 instead of 0 to 359
        // PDF - maybe want to expand this to 0 - 1023? - would impact rotate callers
        SinCache[i] = Math.sin(i * 2 * 3.141592654 / kFastTrigArraySize)
        CosCache[i] = Math.cos(i * 2 * 3.141592654 / kFastTrigArraySize)
    }
}

fastTrigInitialize()

// these functions are no longer called here but are available for other uses
// they were bundled directly into rotate
// moved bounding angle into cache range into functions to decrease function overhead
// copied these functions into rotate to decrease overhead there - both of function call and of bounding angle twice
export function fastTrigCos(angle: float): float {
    let boundedAngle: int
    
    try {
        boundedAngle = intround(angle) % kFastTrigArraySize
    } catch (e) {
        boundedAngle = 0
    }
    if (boundedAngle < 0) {
        boundedAngle = kFastTrigArraySize + boundedAngle
    }
    return CosCache[boundedAngle]
}

export function fastTrigSin(angle: float): float {
    let boundedAngle: int
    
    try {
        boundedAngle = intround(angle) % kFastTrigArraySize
    } catch (e) {
        boundedAngle = 0
    }
    if (boundedAngle < 0) {
        boundedAngle = kFastTrigArraySize + boundedAngle
    }
    return SinCache[boundedAngle]
}

function clockwise(point0: TPoint, point1: TPoint, point2: TPoint): int {
    let result = 0
    
    const dx1 = point1.X - point0.X
    const dy1 = point1.Y - point0.Y
    const dx2 = point2.X - point0.X
    const dy2 = point2.Y - point0.Y
    if ((dx1 * dy2) > (dy1 * dx2)) {
        result = kDirectionClockwise
    } else if ((dx1 * dy2) < (dy1 * dx2)) {
        result = kDirectionCounterClockwise
    } else if (((dx1 * dx2) < 0) || ((dy1 * dy2) < 0)) {
        result = kDirectionCounterClockwise
    } else if (((dx1 * dx1) + (dy1 * dy1)) < ((dx2 * dx2) + (dy2 * dy2))) {
        result = kDirectionClockwise
    } else {
        result = kDirectionUnknown
    }
    return result
}

export function pointInTriangle(point: TPoint, triangle: TPoint[]): boolean {
    let result = false
    if ((triangle[0].X === triangle[1].X) && (triangle[1].X === triangle[2].X) && (triangle[0].Y === triangle[1].Y) && (triangle[1].Y === triangle[2].Y)) {
        return result
    }
    const first = clockwise(point, triangle[0], triangle[1])
    const second = clockwise(point, triangle[1], triangle[2])
    const third = clockwise(point, triangle[2], triangle[0])
    result = (first === second) && (second === third)
    return result
}
