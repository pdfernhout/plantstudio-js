import { float, intround, byte } from "./common"
import { KfPoint3D } from "./KfPoint3D"
import { CosCache, SinCache, kFastTrigArraySize } from "./U3dsupport"

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
        result.position = new KfPoint3D(this.position)
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
        otherMatrix.position = new KfPoint3D(this.position)
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
        const x = aPoint3D.x
        const y = aPoint3D.y
        const z = aPoint3D.z
        aPoint3D.x = (x * this.a0) + (y * this.a1) + (z * this.a2) + this.position.x
        aPoint3D.y = (x * this.b0) + (y * this.b1) + (z * this.b2) + this.position.y
        aPoint3D.z = (x * this.c0) + (y * this.c1) + (z * this.c2) + this.position.z
    }
    
    // ---------------------------------------------------------------------------------- KfMatrix rotating 
    rotateX(angle: float): void {
        // bound angle and convert to index
        // not doing try except around round for speed here - could fail ...
        let boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        const cosAngle = CosCache[boundedAngleIndex]
        const sinAngle = SinCache[boundedAngleIndex]
        // moved minuses to middle to optimize
        this.a0 = this.a0
        let temp1 = (this.a1 * cosAngle) - (this.a2 * sinAngle)
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
        // bound angle and convert to index
        // not doing try except around round for speed here - could fail ...
        let boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        const cosAngle = CosCache[boundedAngleIndex]
        const sinAngle = SinCache[boundedAngleIndex]
        let temp0 = (this.a0 * cosAngle) + (this.a2 * sinAngle)
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
        let boundedAngleIndex = intround(angle) % kFastTrigArraySize
        if ((boundedAngleIndex < 0)) {
            boundedAngleIndex = kFastTrigArraySize + boundedAngleIndex
        }
        const cosAngle = CosCache[boundedAngleIndex]
        const sinAngle = SinCache[boundedAngleIndex]
        // minuses moved to middle to optimize
        let temp0 = (this.a0 * cosAngle) - (this.a1 * sinAngle)
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

        try {
            result = 0
            let temp = (this.a2 * this.a2) + (this.c2 * this.c2)
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
        
        try {
            result = 0
            let temp = (this.a0 * this.a0) + (this.c0 * this.c0)
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
 
        try {
            result = 0
            let temp = (this.a1 * this.a1) + (this.c1 * this.c1)
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
