// KfDrawingSurface -- was unit Udrawingsurface

import { TColor, short, long, float, int, intround } from "./common";
import { KfPoint3D } from "./temporary";
import { KfTriangle, pointInTriangle } from "./U3dsupport";
import { TPoint } from "./TPoint";

/* TODO: Remove these imports
from conversion_common import *
import u3dsupport
import utdo
import ucollect
import delphi_compatability
*/

// TODO: Optimize convertColor to be more efficient; maybe add cache of common colors?
function convertColor(color: number) {
    var r = (color >> 16) & 255;
    var g = (color >> 8) & 255
    var b = color & 255
    const result = "#" + hexForValue(r) + hexForValue(g) + hexForValue(b)
    console.log("convertColor", result, color)
    return result
}

function hexForValue(c: number) {
    var hex = c.toString(16)
    return hex.length == 1 ? "0" + hex : hex
}

// TODO: Determine if kInitialDrawingSurfaceTriangles shoudl really be 0 or as previously 1000 with JavaScript
const kInitialDrawingSurfaceTriangles = 0

export class KfDrawingSurface {
    pane: CanvasRenderingContext2D | null
    lineContrastIndex: short = 0
    drawingLines: boolean = false
    fillingTriangles: boolean = true
    circlingPoints: boolean = false
    foreColor: TColor
    backColor: TColor
    lineColor: TColor
    circleColor: TColor
    numTrianglesUsed: long = 0
    triangles: KfTriangle[] = []
    recording: boolean = false
    lineWidth: float = 0.0
    circlePointRadius: short = 0
    sortTdosAsOneItem: boolean = false
    
    // ----------------------- KfDrawingSurface creating/destroying 

    constructor(context: CanvasRenderingContext2D | null) {
        this.pane = context
        this.initialize()
        for (let i = 0; i <= kInitialDrawingSurfaceTriangles; i++) {
            // start with a bunch of triangles 
            this.triangles.push(new KfTriangle())
        }
    }
    
    initialize(): void {
        // backColor := clLtGray;
        //  foreColor := clLtGray;
        //  lineColor := clLtGray;
        this.lineWidth = 1.0
        this.recording = false
        this.clearTriangles()
        /* TODO: Maybe not needed as fillingTriangles is used when drawing
        if (this.pane !== null) {
            if (this.fillingTriangles) {
                this.pane.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            } else {
                this.pane.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            }
        }
        */
    }
    
    // ----------------------- KfDrawingSurface managing triangles

    clearTriangles(): void {
        for (let i = 0; i < this.numTrianglesUsed; i++) {
            this.triangles[i].tdo = null
        }
        this.numTrianglesUsed = 0
    }
    
    plantPartIDForPoint(point: TPoint): long {
        let closestDistanceSoFar = 0
        let closestPartID = -1
        for (let i = 0; i < this.triangles.length; i++) {
            const triangle = this.triangles[i]
            if (triangle.isLine) {
                const centerX = (triangle.points[0].x + triangle.points[1].x) / 2.0
                const centerY = (triangle.points[0].y + triangle.points[1].y) / 2.0
                const x = point.X
                const y = point.Y
                const thisDistance = (centerX - x) * (centerX - x) + (centerY - y) * (centerY - y)
                if ((closestPartID === -1) || (thisDistance < closestDistanceSoFar)) {
                    closestDistanceSoFar = thisDistance
                    closestPartID = triangle.plantPartID
                }
            } else {
                const points: TPoint[] = [new TPoint(), new TPoint(), new TPoint()]
                points[0].X = intround(triangle.points[0].x)
                points[0].Y = intround(triangle.points[0].y)
                points[1].X = intround(triangle.points[1].x)
                points[1].Y = intround(triangle.points[1].y)
                points[2].X = intround(triangle.points[2].x)
                points[2].Y = intround(triangle.points[2].y)
                if (pointInTriangle(point, points)) {
                    return triangle.plantPartID
                }
            }
        }
        return closestPartID
    }
    
    allocateTriangle(): KfTriangle {
        let result: KfTriangle
        if (this.numTrianglesUsed < this.triangles.length) {
            result = this.triangles[this.numTrianglesUsed]
        } else {
            result = new KfTriangle()
            this.triangles.push(result)
        }
        this.numTrianglesUsed += 1
        return result
    }
    
    sortTrianglesConsideringTdos(): void {
        if (this.numTrianglesUsed <= 1) {
            return
        }
        if (this.sortTdosAsOneItem) {
            for (let i = 0; i < this.numTrianglesUsed; i++) {
                const triangle = this.triangles[i]
                if (!triangle.isLine) {
                    const oldValue = triangle.zForSorting
                    if (triangle.tdo !== null) {
                        try {
                            // the 0.01 is to keep the polygons inside the tdo in order but still (usually) separate from other tdos
                            // could produce errors if the z value is really small already
                            triangle.zForSorting = triangle.tdo.zForSorting + triangle.zForSorting * 0.01
                        } catch (e) {
                            triangle.zForSorting = oldValue
                        }
                    }
                    // have to clear out tdo pointer afterward because triangles are reused
                    triangle.tdo = null
                }
            }
        }
        this.sortTriangles(0, this.numTrianglesUsed - 1)
    }
    
    sortTriangles(left: int, right: int): void {
        function exchange(triangles: KfTriangle[], i: number, j: number) {
            const a = triangles[i]
            const b = triangles[j]
            triangles[i] = b
            triangles[j] = a
        }
        
        if (right > left) {
            const z = this.triangles[right].zForSorting
            let i = left - 1
            let j = right
            while (true) {
                do {
                    i = i + 1
                } while (!(!(this.triangles[i].zForSorting < z)))
                do {
                    j = j - 1
                } while (!((j < i) || (!(this.triangles[j].zForSorting > z))))
                if (i >= j) {
                    break
                }
                exchange(this.triangles, i, j)
            }
            exchange(this.triangles, i, right)
            this.sortTriangles(left, j)
            this.sortTriangles(i + 1, right)
        }
    }
    
    // ----------------------- KfDrawingSurface drawing

    trianglesDraw(): void {
        if (this.numTrianglesUsed > 0) {
            for (let i = 0; i < this.numTrianglesUsed; i++) {
                this.basicDrawTriangle(this.triangles[i])
            }
        }
    }
    
    drawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): KfTriangle | null {
        if (this.recording) {
            // store triangle
            const triangle = this.allocateTriangle()
            triangle.points[0] = startPoint
            triangle.points[1] = endPoint
            triangle.isLine = true
            // need to handle drawing surface colors
            triangle.foreColor = this.foreColor
            triangle.backColor = this.backColor
            triangle.lineColor = this.lineColor
            triangle.lineWidth = this.lineWidth
            triangle.computeZ()
            return triangle
        } else {
            this.basicDrawLineFromTo(startPoint, endPoint)
        }
        return null
    }
    
    basicDrawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): void {
        if (this.pane === null) {
            // assuming pen color and width is saved and restored elsewhere
            return
        }
        // do nothing if rounding fails
        try {
            this.pane.lineWidth = intround(this.lineWidth) % 1000
            this.pane.strokeStyle = convertColor(this.lineColor)
            // TODO: Use or remove: this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid

            this.pane.beginPath()
            this.pane.moveTo(intround(startPoint.x) % 32767, intround(startPoint.y) % 32767)
            this.pane.lineTo(intround(endPoint.x) % 32767, intround(endPoint.y) % 32767)
            this.pane.stroke()
        } catch (e) {
            // pass
        }
    }
    
    draw3DFace(point1: KfPoint3D, point2: KfPoint3D, point3: KfPoint3D, point4: KfPoint3D): void {
        // subclasses must override
        throw new Error("Problem: draw3DFace method not supported in base class; in method KfDrawingSurface.draw3DFace.")
    }
    
    // terminology is different: drawing surface frontColor is pen line color 
    // and drawing surface backColor (which should be back-facing triangle) is fill color
    // drawing surface draws the last triangle allocated - and deallocates it if needed
    drawLastTriangle(): void {
        // last allocated triangle
        const triangle = this.triangles[this.numTrianglesUsed - 1]
        triangle.isLine = false
        triangle.updateGeometry()
        // PDF FIX - maybe should scale this?
        triangle.lineWidth = this.lineWidth
        triangle.lineColor = this.lineColor
        triangle.foreColor = this.foreColor
        triangle.backColor = this.backColor
        if (this.recording) {
            // "store triangle"
            // do nothing as already stored
        } else {
            this.basicDrawTriangle(triangle)
            // deallocate it
            this.numTrianglesUsed -= 1
        }
    }
    
    // pdf - draw the triangle object - assume it is reasonably flat"
    // {can only draw triangles for now
    // needs fixed size for array - would need to allocate for variable sizes
    // or could use direct windows triangle call and larger array but pass number of points
    // terminology is different: drawing surface frontColor is pen line color
    // and drawing surface backColor (which should be back-facing triangle) is fill color"
    // restricting range of coordingates to 32767 to prevent possible out of range errors when drawing
    basicDrawTriangle(triangle: KfTriangle): void {
        if (this.pane === null) {
            return
        }
        if ((triangle.isLine)) {
            // do nothing if round fails or assign to integer fails
            try {
                // draw line
                this.pane.lineWidth = intround(triangle.lineWidth)
                this.pane.strokeStyle = convertColor(triangle.lineColor)
                // TODO: Use or remove: this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid

                const startPoint = triangle.points[0]
                const endPoint = triangle.points[1]
                this.pane.beginPath()
                this.pane.moveTo(intround(startPoint.x) % 32767, intround(startPoint.y) % 32767)
                this.pane.lineTo(intround(endPoint.x) % 32767, intround(endPoint.y) % 32767)
                this.pane.stroke()

            } catch (e) {
                // pass
            }
            return
        }

        // Make an array of four points
        const pointArray: TPoint[] = [new TPoint(), new TPoint(), new TPoint(), new TPoint()]

        // TODO: Can probably drop last extra duplicate point because JavaScritp drawing will close polygon

        for (let i = 0; i <= 3; i++) {
            let aPoint: KfPoint3D
            if (i < 3) {
                // make last point same as first for drawing lines around whole polygon
                aPoint = triangle.points[i]
            } else {
                aPoint = triangle.points[0]
            }
            try {
                pointArray[i].X = intround(aPoint.x) % 32767
                pointArray[i].Y = intround(aPoint.y) % 32767
            } catch (e) {
                // maybe could test sign to put in negative big numbers? watch out for NaNs!
                pointArray[i].X = 32767
                pointArray[i].Y = 32767
            }
        }
        // TODO: Use or remove: this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.pane.fillStyle = convertColor(triangle.visibleSurfaceColor())
        if (this.drawingLines) {
            if (this.fillingTriangles) {
                this.pane.strokeStyle = convertColor(triangle.drawLinesColor(this.lineContrastIndex))
            } else {
                this.pane.strokeStyle = convertColor(triangle.visibleSurfaceColor())
            }
        } else {
            this.pane.strokeStyle = convertColor(triangle.visibleSurfaceColor())
        }
        this.pane.lineWidth = 1

        // Draw polygon or polyline
        this.pane.beginPath()
        this.pane.moveTo(pointArray[0].X, pointArray[0].Y)
        // TODO: Could simplify because we know there are three points of interest in the triangle
        for (let i = 1; i < pointArray.length; i++) {
            this.pane.lineTo(pointArray[i].X, pointArray[i].Y)
        }
        this.pane.closePath()
        if (this.fillingTriangles) {
            this.pane.fill()
        } else {
            this.pane.stroke()
        }

        if (this.circlingPoints) {
            this.pane.strokeStyle = convertColor(this.circleColor)
            this.pane.fillStyle = convertColor(this.circleColor)
            for (let i = 0; i <= 2; i++) {
                this.pane.beginPath()
                this.pane.arc(pointArray[i].X, pointArray[i].Y, this.circlePointRadius, 0, 2 * Math.PI);
                this.pane.fill()
            }
        }
    }
    
    // ----------------------- KfDrawingSurface recording

    recordingStart(): void {
        this.clearTriangles()
        this.recording = true
    }
    
    recordingStop(): void {
        this.recording = false
    }
    
    recordingDraw(): void {
        this.sortTrianglesConsideringTdos()
        this.trianglesDraw()
    }
    
}
