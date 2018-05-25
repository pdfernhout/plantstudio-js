// unit Udrawingsurface

from conversion_common import *
import u3dsupport
import utdo
import ucollect
import delphi_compatability

// const
const kInitialDrawingSurfaceTriangles = 1000



export class KfDrawingSurface {
    pane: TCanvas = new TCanvas()
    lineContrastIndex: short = 0
    drawingLines: boolean = false
    fillingTriangles: boolean = false
    circlingPoints: boolean = false
    foreColor: TColor = new TColor()
    backColor: TColor = new TColor()
    lineColor: TColor = new TColor()
    circleColor: TColor = new TColor()
    numTrianglesUsed: long = 0
    triangles: TListCollection = new TListCollection()
    recording: boolean = false
    lineWidth: float = 0.0
    circlePointRadius: short = 0
    sortTdosAsOneItem: boolean = false
    
    // ----------------------------------------------------------------------------- *KfDrawingSurface creating/destroying 
    create(): void {
        let i: long
        
        TObject.prototype.create.call(this)
        this.triangles = ucollect.TListCollection().Create()
        this.numTrianglesUsed = 0
        this.fillingTriangles = true
        this.initialize()
        for (i = 0; i <= kInitialDrawingSurfaceTriangles; i++) {
            // start with a bunch of triangles 
            this.triangles.Add(u3dsupport.KfTriangle.create)
        }
    }
    
    destroy(): void {
        this.triangles.free
        TObject.prototype.destroy.call(this)
    }
    
    initialize(): void {
        //backColor := clLtGray;
        //  foreColor := clLtGray;
        //  lineColor := clLtGray;
        this.lineWidth = 1.0
        this.recording = false
        this.clearTriangles()
        if (this.pane !== null) {
            if (this.fillingTriangles) {
                this.pane.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            } else {
                this.pane.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            }
        }
    }
    
    // ----------------------------------------------------------------------------- KfDrawingSurface managing triangles 
    clearTriangles(): void {
        let i: long
        
        for (i = 0; i <= this.numTrianglesUsed - 1; i++) {
            u3dsupport.KfTriangle(this.triangles.Items[i]).tdo = null
        }
        this.numTrianglesUsed = 0
    }
    
    plantPartIDForPoint(point: TPoint): long {
        let result = 0
        let i: long
        let triangle: KfTriangle
        let points: TPoint[] /* 2 + 1 */
        let widenedPoints: TPoint[] /* 2 + 1 */
        let width: int
        let thisDistance: float
        let closestDistanceSoFar: float
        let closestPartID: long
        let centerX: float
        let centerY: float
        let x: float
        let y: float
        
        x = point.x
        y = point.y
        result = -1
        closestDistanceSoFar = 0
        closestPartID = -1
        for (i = 0; i <= this.triangles.Count - 1; i++) {
            triangle = u3dsupport.KfTriangle(this.triangles.Items[i])
            if (triangle.isLine) {
                centerX = (triangle.points[0].x + triangle.points[1].x) / 2.0
                centerY = (triangle.points[0].y + triangle.points[1].y) / 2.0
                thisDistance = (centerX - x) * (centerX - x) + (centerY - y) * (centerY - y)
                if ((closestPartID === -1) || (thisDistance < closestDistanceSoFar)) {
                    closestDistanceSoFar = thisDistance
                    closestPartID = triangle.plantPartID
                }
            } else {
                points[0].X = intround(triangle.points[0].x)
                points[0].Y = intround(triangle.points[0].y)
                points[1].X = intround(triangle.points[1].x)
                points[1].Y = intround(triangle.points[1].y)
                points[2].X = intround(triangle.points[2].x)
                points[2].Y = intround(triangle.points[2].y)
                if (u3dsupport.pointInTriangle(point, points)) {
                    result = triangle.plantPartID
                    return result
                }
            }
        }
        result = closestPartID
        return result
    }
    
    allocateTriangle(): KfTriangle {
        let result = new KfTriangle()
        result = null
        if (this.numTrianglesUsed < this.triangles.Count) {
            result = this.triangles.Items[this.numTrianglesUsed]
        } else {
            result = u3dsupport.KfTriangle.create
            this.triangles.Add(result)
        }
        this.numTrianglesUsed += 1
        return result
    }
    
    sortTrianglesConsideringTdos(): void {
        let i: long
        let triangle: KfTriangle
        let oldValue: float
        
        if (this.numTrianglesUsed <= 1) {
            return
        }
        if (this.sortTdosAsOneItem) {
            for (i = 0; i <= this.numTrianglesUsed - 1; i++) {
                triangle = u3dsupport.KfTriangle(this.triangles.Items[i])
                if (!triangle.isLine) {
                    oldValue = triangle.zForSorting
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
        let i: int
        let j: int
        let z: float
        
        if (right > left) {
            z = u3dsupport.KfTriangle(this.triangles.Items[right]).zForSorting
            i = left - 1
            j = right
            while (true) {
                do {
                    i = i + 1
                } while (!(!(u3dsupport.KfTriangle(this.triangles.Items[i]).zForSorting < z)))
                do {
                    j = j - 1
                } while (!((j < i) || (!(u3dsupport.KfTriangle(this.triangles.Items[j]).zForSorting > z))))
                if (i >= j) {
                    break
                }
                this.triangles.Exchange(i, j)
            }
            this.triangles.Exchange(i, right)
            this.sortTriangles(left, j)
            this.sortTriangles(i + 1, right)
        }
    }
    
    // ----------------------------------------------------------------------------- KfDrawingSurface drawing 
    trianglesDraw(): void {
        let i: int
        
        if (this.numTrianglesUsed > 0) {
            for (i = 0; i <= this.numTrianglesUsed - 1; i++) {
                this.basicDrawTriangle(this.triangles.Items[i])
            }
        }
    }
    
    drawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): KfTriangle {
        let result = new KfTriangle()
        let triangle: KfTriangle
        
        result = null
        if (this.recording) {
            //store triangle
            triangle = this.allocateTriangle()
            triangle.points[0] = startPoint
            triangle.points[1] = endPoint
            triangle.isLine = true
            //need to handle drawing surface colors
            triangle.foreColor = this.foreColor
            triangle.backColor = this.backColor
            triangle.lineColor = this.lineColor
            triangle.lineWidth = this.lineWidth
            triangle.computeZ()
            result = triangle
        } else {
            this.basicDrawLineFromTo(startPoint, endPoint)
        }
        return result
    }
    
    basicDrawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): void {
        if (this.pane === null) {
            //assuming pen color and width is saved and restored elsewhere
            return
        }
        //do nothing if rounding fails
        try {
            this.pane.Pen.Width = intround(this.lineWidth) % 1000
            this.pane.Pen.Color = this.lineColor
            this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
            this.pane.MoveTo(intround(startPoint.x) % 32767, intround(startPoint.y) % 32767)
            this.pane.LineTo(intround(endPoint.x) % 32767, intround(endPoint.y) % 32767)
        } catch (e) {
            // pass
        }
    }
    
    draw3DFace(point1: KfPoint3D, point2: KfPoint3D, point3: KfPoint3D, point4: KfPoint3D): void {
        // subclasses must override
        throw new GeneralException.create("Problem: draw3DFace method not supported in base class; in method KfDrawingSurface.draw3DFace.")
    }
    
    //terminology is different: drawing surface frontColor is pen line color 
    // and drawing surface backColor (which should be back-facing triangle) is fill color
    //drawing surface draws the last triangle allocated - and deallocates it if needed
    drawLastTriangle(): void {
        let triangle: KfTriangle
        
        //last allocated triangle
        triangle = this.triangles.Items[this.numTrianglesUsed - 1]
        triangle.isLine = false
        triangle.updateGeometry()
        //PDF FIX - maybe should scale this?
        triangle.lineWidth = this.lineWidth
        triangle.lineColor = this.lineColor
        triangle.foreColor = this.foreColor
        triangle.backColor = this.backColor
        if (this.recording) {
            //"store triangle"
            //do nothing as already stored
        } else {
            this.basicDrawTriangle(triangle)
            //deallocate it
            this.numTrianglesUsed -= 1
        }
    }
    
    //pdf - draw the triangle object - assume it is reasonably flat"
    //{can only draw triangles for now
    //needs fixed size for array - would need to allocate for variable sizes
    //or could use direct windows triangle call and larger array but pass number of points
    //terminology is different: drawing surface frontColor is pen line color
    //and drawing surface backColor (which should be back-facing triangle) is fill color"
    //restricting range of coordingates to 32767 to prevent possible out of range errors when drawing
    basicDrawTriangle(triangle: KfTriangle): void {
        let startPoint: KfPoint3D
        let endPoint: KfPoint3D
        let aPoint: KfPoint3D
        let pointArray: TPoint[] /* 3 + 1 */
        let i: int
        
        if (this.pane === null) {
            return
        }
        if ((triangle.isLine)) {
            //do nothing if round fails or assign to integer fails
            try {
                //draw line
                this.pane.Pen.Width = intround(triangle.lineWidth)
                this.pane.Pen.Color = triangle.lineColor
                this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
                startPoint = triangle.points[0]
                endPoint = triangle.points[1]
                this.pane.MoveTo(intround(startPoint.x) % 32767, intround(startPoint.y) % 32767)
                this.pane.LineTo(intround(endPoint.x) % 32767, intround(endPoint.y) % 32767)
            } catch (e) {
                // pass
            }
            return
        }
        for (i = 0; i <= 3; i++) {
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
                //maybe could test sign to put in negative big numbers? watch out for NaNs!
                pointArray[i].X = 32767
                pointArray[i].Y = 32767
            }
        }
        this.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.pane.Brush.Color = triangle.visibleSurfaceColor()
        if (this.drawingLines) {
            if (this.fillingTriangles) {
                this.pane.Pen.Color = triangle.drawLinesColor(this.lineContrastIndex)
            } else {
                this.pane.Pen.Color = triangle.visibleSurfaceColor()
            }
        } else {
            this.pane.Pen.Color = triangle.visibleSurfaceColor()
        }
        this.pane.Pen.Width = 1
        if (this.fillingTriangles) {
            this.pane.Polygon(pointArray)
        } else {
            this.pane.Polyline(pointArray)
        }
        if (this.circlingPoints) {
            this.pane.Pen.Color = this.circleColor
            this.pane.Brush.Color = this.circleColor
            for (i = 0; i <= 2; i++) {
                this.pane.Ellipse(pointArray[i].X - this.circlePointRadius, pointArray[i].Y - this.circlePointRadius, pointArray[i].X + this.circlePointRadius, pointArray[i].Y + this.circlePointRadius)
            }
        }
    }
    
    // ----------------------------------------------------------------------------- KfDrawingSurface recording 
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

