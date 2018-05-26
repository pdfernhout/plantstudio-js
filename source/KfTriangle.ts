import { long, float, TColor, short } from "./common"
import { KfPoint3D } from "./KfPoint3D"
import { darkerColorWithSubtraction } from "./temporary"

// these can only be triangular
export class KfTriangle {
    foreColor: TColor
    backColor: TColor
    lineColor: TColor
    zForSorting: float = 0.0
    backFacing: boolean = false
    lineWidth: float = 0.0
    isLine: boolean = false
    points: KfPoint3D[] = [new KfPoint3D(), new KfPoint3D(), new KfPoint3D()]
    tdo: { zForSorting: number } | null // TODO: Should be: KfObject3D when that is defined and importable
    plantPartID: long = 0
    
    // ---------------------------------------------------------------------------------- KfTriangle updating 
    updateGeometry(): void {
        this.computeBackFacing()
        this.computeZ()
    }
    
    computeBackFacing(): void {
        this.backFacing = false
        if (this.isLine) {
            return
        }
        const point0 = this.points[0]
        const point1 = this.points[1]
        const point2 = this.points[2]
        const backfacingResult = ((point1.x - point0.x) * (point2.y - point0.y)) - ((point1.y - point0.y) * (point2.x - point0.x))
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
