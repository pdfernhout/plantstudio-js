// unit U3dsupport

import { float, int, intround, byte, TColor, short, long } from "./common";
import { TPoint } from "./TPoint";
import { darkerColorWithSubtraction, KfPoint3D } from "./temporary";

/* TODO: Remove these imports
from conversion_common import *
import usupport
import utdo
import delphi_compatability
*/

// const
const kFastTrigArraySize = 256
const kDirectionClockwise = 1
const kDirectionCounterClockwise = -1
const kDirectionUnknown = 0


// var
let SinCache: float[] = new Array(kFastTrigArraySize)
let CosCache: float[]  = new Array(kFastTrigArraySize)


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
    let i: int
    
    for (i = 0; i <= kFastTrigArraySize - 1; i++) {
        // Approach: sine and cosine arrays are used for speed. Angles are 0 - 255 instead of 0 to 359
        // PDF - maybe want to expand this to 0 - 1023? - would impact rotate callers
        SinCache[i] = Math.sin(i * 2 * 3.141592654 / kFastTrigArraySize)
        CosCache[i] = Math.cos(i * 2 * 3.141592654 / kFastTrigArraySize)
    }
}

// these functions are no longer called here but are available for other uses
// they were bundled directly into rotate
// moved bounding angle into cache range into functions to decrease function overhead
// copied these functions into rotate to decrease overhead there - both of function call and of bounding angle twice
function fastTrigCos(angle: float): float {
    let result = 0.0
    let boundedAngle: int
    
    try {
        boundedAngle = intround(angle) % kFastTrigArraySize
    } catch (e) {
        boundedAngle = 0
    }
    if ((boundedAngle < 0)) {
        boundedAngle = kFastTrigArraySize + boundedAngle
    }
    result = CosCache[boundedAngle]
    return result
}

function fastTrigSin(angle: float): float {
    let result = 0.0
    let boundedAngle: int
    
    try {
        boundedAngle = intround(angle) % kFastTrigArraySize
    } catch (e) {
        boundedAngle = 0
    }
    if ((boundedAngle < 0)) {
        boundedAngle = kFastTrigArraySize + boundedAngle
    }
    result = SinCache[boundedAngle]
    return result
}

function clockwise(point0: TPoint, point1: TPoint, point2: TPoint): int {
    let result = 0
    let dx1: float
    let dy1: float
    let dx2: float
    let dy2: float
    
    dx1 = point1.X - point0.X
    dy1 = point1.Y - point0.Y
    dx2 = point2.X - point0.X
    dy2 = point2.Y - point0.Y
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

function pointInTriangle(point: TPoint, triangle: TPoint[]): boolean {
    let result = false
    let first: int
    let second: int
    let third: int
    
    result = false
    if ((triangle[0].X === triangle[1].X) && (triangle[1].X === triangle[2].X) && (triangle[0].Y === triangle[1].Y) && (triangle[1].Y === triangle[2].Y)) {
        return result
    }
    first = clockwise(point, triangle[0], triangle[1])
    second = clockwise(point, triangle[1], triangle[2])
    third = clockwise(point, triangle[2], triangle[0])
    result = (first === second) && (second === third)
    return result
}


export class KfMatrix {
    a0: float = 0.0
    a1: float = 0.0
    a2: float = 0.0
    b0: float = 0.0
    b1: float = 0.0
    b2: float = 0.0
    c0: float = 0.0
    c1: float = 0.0
    c2: float = 0.0
    position: KfPoint3D = new KfPoint3D()
    
    // ---------------------------------------------------------------------------------- *KfMatrix imitializing and copying 
    initializeAsUnitMatrix(): void {
        this.a0 = 1.0
        this.a1 = 0
        this.a2 = 0
        this.b0 = 0
        this.b1 = 1.0
        this.b2 = 0
        this.c0 = 0
        this.c1 = 0
        this.c2 = 1.0
        this.position.x = 0
        this.position.y = 0
        this.position.z = 0
    }
    
    deepCopy(): KfMatrix {
        let result = new KfMatrix()
        result.position = this.position
        result.a0 = this.a0
        result.a1 = this.a1
        result.a2 = this.a2
        result.b0 = this.b0
        result.b1 = this.b1
        result.b2 = this.b2
        result.c0 = this.c0
        result.c1 = this.c1
        result.c2 = this.c2
        return result
    }
    
    copyTo(otherMatrix: KfMatrix): void {
        otherMatrix.position = this.position
        otherMatrix.a0 = this.a0
        otherMatrix.a1 = this.a1
        otherMatrix.a2 = this.a2
        otherMatrix.b0 = this.b0
        otherMatrix.b1 = this.b1
        otherMatrix.b2 = this.b2
        otherMatrix.c0 = this.c0
        otherMatrix.c1 = this.c1
        otherMatrix.c2 = this.c2
    }
    
    // ---------------------------------------------------------------------------- KfMatrix moving and transforming 
    move(distance: float): void {
        // pdf - move a distance by multiplying matrix values
        //   movement is along x axis (d, 0, 0, 1);
        this.position.x = this.position.x + distance * this.a0
        this.position.y = this.position.y + distance * this.b0
        this.position.z = this.position.z + distance * this.c0
    }
    
    // pdf - transform the point, including offsetting it by the current position
    // Alters the point's contents
    transform(aPoint3D: KfPoint3D): void {
        let x: float
        let y: float
        let z: float
        
        x = aPoint3D.x
        y = aPoint3D.y
        z = aPoint3D.z
        aPoint3D.x = (x * this.a0) + (y * this.a1) + (z * this.a2) + this.position.x
        aPoint3D.y = (x * this.b0) + (y * this.b1) + (z * this.b2) + this.position.y
        aPoint3D.z = (x * this.c0) + (y * this.c1) + (z * this.c2) + this.position.z
    }
    
    // ---------------------------------------------------------------------------------- KfMatrix rotating 
    rotateX(angle: float): void {
        let cosAngle: float
        let sinAngle: float
        let temp1: float
        let boundedAngleIndex: int
        
        // bound angle and convert to index
        // not doing try except around round for speed here - could fail ...
        boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        cosAngle = CosCache[boundedAngleIndex]
        sinAngle = SinCache[boundedAngleIndex]
        // moved minuses to middle to optimize
        this.a0 = this.a0
        temp1 = (this.a1 * cosAngle) - (this.a2 * sinAngle)
        this.a2 = (this.a1 * sinAngle) + (this.a2 * cosAngle)
        this.a1 = temp1
        this.b0 = this.b0
        temp1 = (this.b1 * cosAngle) - (this.b2 * sinAngle)
        this.b2 = (this.b1 * sinAngle) + (this.b2 * cosAngle)
        this.b1 = temp1
        this.c0 = this.c0
        temp1 = (this.c1 * cosAngle) - (this.c2 * sinAngle)
        this.c2 = (this.c1 * sinAngle) + (this.c2 * cosAngle)
        this.c1 = temp1
    }
    
    rotateY(angle: float): void {
        let cosAngle: float
        let sinAngle: float
        let temp0: float
        let boundedAngleIndex: int
        
        // bound angle and convert to index
        // not doing try except around round for speed here - could fail ...
        boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        cosAngle = CosCache[boundedAngleIndex]
        sinAngle = SinCache[boundedAngleIndex]
        temp0 = (this.a0 * cosAngle) + (this.a2 * sinAngle)
        this.a1 = this.a1
        // flipped to put minus in middle
        this.a2 = (this.a2 * cosAngle) - (this.a0 * sinAngle)
        this.a0 = temp0
        temp0 = (this.b0 * cosAngle) + (this.b2 * sinAngle)
        this.b1 = this.b1
        // flipped to put minus in middle
        this.b2 = (this.b2 * cosAngle) - (this.b0 * sinAngle)
        this.b0 = temp0
        temp0 = (this.c0 * cosAngle) + (this.c2 * sinAngle)
        this.c1 = this.c1
        // flipped to put minus in middle
        this.c2 = (this.c2 * cosAngle) - (this.c0 * sinAngle)
        this.c0 = temp0
    }
    
    rotateZ(angle: float): void {
        let cosAngle: float
        let sinAngle: float
        let temp0: float
        let boundedAngleIndex: int
        
        //
        //  {bound angle and convert to index}
        //  {not doing try except around round for speed here - could fail ...}
        //  {boundedAngleIndex := round(angle) mod kFastTrigArraySize;
        //  if (boundedAngleIndex  < 0) then
        //  	boundedAngleIndex := kFastTrigArraySize + boundedAngleIndex;
        //  cosAngle := CosCache[boundedAngleIndex];
        //  sinAngle := SinCache[boundedAngleIndex];}
        //                          { cfk try at replacing rounding with using all floating point }
        //  cosAngle := cos(angle * 2.0 * 3.14159 / 256.0);
        //  sinAngle := sin(angle * 2.0 * 3.14159 / 256.0);
        //
        //  {minuses moved to middle to optimize}
        //  temp0  :=(a0 * cosAngle) - (a1 * sinAngle);
        //  a1 := (a0 * sinAngle) + (a1 * cosAngle);
        //  a2 := a2;
        //  a0 := temp0;
        //  temp0 := (b0 * cosAngle) - (b1 * sinAngle);
        //  b1 := (b0 * sinAngle) + (b1 * cosAngle);
        //  b2 := b2;
        //  b0 := temp0;
        //  temp0 := (c0 * cosAngle) - (c1 * sinAngle);
        //  c1 :=  (c0 * sinAngle) + (c1 * cosAngle);
        //  c2 := c2;
        //  c0 := temp0;    
        // bound angle and convert to index
        // not doing try except around round for speed here - could fail ...
        boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        cosAngle = CosCache[boundedAngleIndex]
        sinAngle = SinCache[boundedAngleIndex]
        // minuses moved to middle to optimize
        temp0 = (this.a0 * cosAngle) - (this.a1 * sinAngle)
        this.a1 = (this.a0 * sinAngle) + (this.a1 * cosAngle)
        this.a2 = this.a2
        this.a0 = temp0
        temp0 = (this.b0 * cosAngle) - (this.b1 * sinAngle)
        this.b1 = (this.b0 * sinAngle) + (this.b1 * cosAngle)
        this.b2 = this.b2
        this.b0 = temp0
        temp0 = (this.c0 * cosAngle) - (this.c1 * sinAngle)
        this.c1 = (this.c0 * sinAngle) + (this.c1 * cosAngle)
        this.c2 = this.c2
        this.c0 = temp0
    }
    
    // class SinCache CosCache
    // ---------------------------------------------------------------------------------- KfMatrix returning current angles 
    // PDF FIX - potential bug
    // these do not take in account kFastTrigArraySize could be different from 256
    angleX(): byte {
        let result = 0
        let temp: float
        
        try {
            result = 0
            temp = 0.0
            temp = (this.a2 * this.a2) + (this.c2 * this.c2)
            if ((temp < 0.0)) {
                temp = 0.0
            }
            temp = Math.sqrt(temp)
            if ((temp === 0.0)) {
                if ((this.b2 < 0)) {
                    result = 64
                } else {
                    result = 256 - 64
                }
            } else {
                temp = this.b2 / temp
                temp = Math.atan(temp)
                result = intround(-temp * 256 / (2 * 3.1415926))
            }
        } catch (e) {
            result = 0
        }
        return result
    }
    
    angleY(): byte {
        let result = 0
        let temp: float
        
        try {
            result = 0
            temp = 0.0
            temp = (this.a0 * this.a0) + (this.c0 * this.c0)
            if ((temp < 0.0)) {
                temp = 0.0
            }
            temp = Math.sqrt(temp)
            if ((temp === 0.0)) {
                if ((this.b0 < 0)) {
                    result = 64
                } else {
                    result = 256 - 64
                }
            } else {
                temp = this.b0 / temp
                temp = Math.atan(temp)
                result = intround(-temp * 256 / (2 * 3.1415926))
            }
        } catch (e) {
            result = 0
        }
        return result
    }
    
    angleZ(): byte {
        let result = 0
        let temp: float
        
        try {
            result = 0
            temp = 0.0
            temp = (this.a1 * this.a1) + (this.c1 * this.c1)
            if ((temp < 0.0)) {
                temp = 0.0
            }
            temp = Math.sqrt(temp)
            if ((temp === 0.0)) {
                if ((this.b1 < 0)) {
                    result = 64
                } else {
                    result = 256 - 64
                }
            } else {
                temp = this.b1 / temp
                temp = Math.atan(temp)
                result = intround(-temp * 256 / (2 * 3.1415926))
            }
        } catch (e) {
            result = 0
        }
        return result
    }
    
}

// these can only be triangular
export class KfTriangle {
    foreColor: TColor
    backColor: TColor
    lineColor: TColor
    zForSorting: float = 0.0
    backFacing: boolean = false
    lineWidth: float = 0.0
    isLine: boolean = false
    points: KfPoint3D[] /* 2 + 1 */ = Array(2+ 1)
    tdo: Object // TODO: Should be: KfObject3D when that is defined and importable
    plantPartID: long = 0
    
    // ---------------------------------------------------------------------------------- KfTriangle updating 
    updateGeometry(): void {
        this.computeBackFacing()
        this.computeZ()
    }
    
    computeBackFacing(): void {
        let point0: KfPoint3D
        let point1: KfPoint3D
        let point2: KfPoint3D
        let backfacingResult: float
        
        this.backFacing = false
        if (this.isLine) {
            return
        }
        point0 = this.points[0]
        point1 = this.points[1]
        point2 = this.points[2]
        backfacingResult = ((point1.x - point0.x) * (point2.y - point0.y)) - ((point1.y - point0.y) * (point2.x - point0.x))
        this.backFacing = (backfacingResult < 0)
    }
    
    computeZ(): void {
        let minZ: float
        
        if (this.isLine) {
            minZ = this.points[0].z
            if (this.points[1].z < minZ) {
                minZ = this.points[1].z
            }
        } else {
            minZ = this.points[0].z
            if (this.points[1].z < minZ) {
                minZ = this.points[1].z
            }
            if (this.points[2].z < minZ) {
                minZ = this.points[2].z
            }
        }
        this.zForSorting = minZ
    }
    
    visibleSurfaceColor(): TColor {
        let result: TColor
        if (this.backFacing) {
            result = this.backColor
        } else {
            result = this.foreColor
        }
        return result
    }
    
    invisibleSurfaceColor(): TColor {
        let result: TColor
        if (this.backFacing) {
            result = this.foreColor
        } else {
            result = this.backColor
        }
        return result
    }
    
    drawLinesColor(lineContrastIndex: short): TColor {
        let result: TColor
        if (this.backFacing) {
            result = this.backColor
        } else {
            result = this.foreColor
        }
        if (lineContrastIndex > 0) {
            result = darkerColorWithSubtraction(result, 10 * lineContrastIndex)
        }
        return result
    }
    
}
