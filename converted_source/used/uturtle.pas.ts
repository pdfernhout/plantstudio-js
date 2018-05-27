// unit Uturtle

from conversion_common import *
import udebug
import umain
import utravers
import umath
import usupport
import u3dexport
import u3dsupport
import udrawingsurface
import utdo
import ucollect
import delphi_compatability

// const
const kInitialTurtleMatrixStackDepth = 250


//OpenGL,
//if this is defined - turtle will draw axis marks for each line segment
//put spaces before and after the $ to disable
// $ DEFINE DEBUG_TURTLE
// general options 
// record
export interface PlantDrawOptionsStructure {
    sortPolygons: boolean
    drawLines: boolean
    lineContrastIndex: short
    wireFrame: boolean
    straightLinesOnly: boolean
    simpleLeavesOnly: boolean
    drawStems: boolean
    draw3DObjects: boolean
    draw3DObjectsAsRects: boolean
    circlePoints: boolean
    circlePointRadius: short
    sortTdosAsOneItem: boolean
    drawingToMainWindow: boolean
    drawBoundsRectsOnPlantParts: boolean
}

// var
let gDefaultTurtle: KfTurtle
let gDefaultTurtleInUse: boolean


//if the DEBUG_TURTLE flag is defined then draw axis information
// PDF PORT Issue
function debugDrawInMillimeters(turtle: KfTurtle, mm: float): void {
    let oldPosition: KfPoint3d
    let newPosition: KfPoint3d
    
    oldPosition = turtle.currentMatrix.position
    turtle.currentMatrix.move(turtle.millimetersToPixels(mm))
    newPosition = turtle.currentMatrix.position
    turtle.addToRealBoundsRect(newPosition)
}

function debugDrawAxis(turtle: KfTurtle, pixels: float): void {
    let oldPosition: KfPoint3d
    let newPosition: KfPoint3d
    
    oldPosition = turtle.currentMatrix.position
    turtle.currentMatrix.move(pixels)
    newPosition = turtle.currentMatrix.position
    if (turtle.drawOptions.drawStems) {
        turtle.drawingSurface.drawLineFromTo(oldPosition, newPosition)
    }
}


// speed optimizations 
//PDF FIX - may want to think about size of recorded points
export class KfTurtle {
    matrixStack: TListCollection = new TListCollection()
    numMatrixesUsed: long = 0
    currentMatrix: KfMatrix = new KfMatrix()
    recordedPoints: KfPoint3d[] /* kMaximumRecordedPoints + 1 */ = Array(kMaximumRecordedPoints + 1)
    recordedPointsInUse: long = 0
    scale_pixelsPerMm: float = 0.0
    drawingSurface: KfDrawingSurface = new KfDrawingSurface()
    tempPosition: KfPoint3d = new KfPoint3d()
    realBoundsRect: TRealRect = new TRealRect()
    drawOptions: PlantDrawOptionsStructure = new PlantDrawOptionsStructure()
    writingTo: short = 0
    
    //for darkerColor
    //temp
    // ---------------------------------------------------------------------------------- *KfTurtle creating/destroying 
    create(): void {
        let i: long
        
        TObject.prototype.create.call(this)
        // v1.60final looked at giving hint with plant part name again; still has problem
        // that what you record is only points, and what you need to record is rects
        // it can be done, but the plant parts have to change to record rects, and they
        // have to deal with all their different ways of drawing. not worth doing at this time.
        this.matrixStack = ucollect.TListCollection().Create()
        this.currentMatrix = u3dsupport.KfMatrix.create
        this.currentMatrix.initializeAsUnitMatrix()
        this.matrixStack.Add(this.currentMatrix)
        this.numMatrixesUsed = 1
        for (i = 0; i <= kInitialTurtleMatrixStackDepth; i++) {
            //start with a bunch of matrixes
            this.matrixStack.Add(u3dsupport.KfMatrix.create)
        }
        this.recordedPointsInUse = 0
        this.drawingSurface = udrawingsurface.KfDrawingSurface().create()
        this.scale_pixelsPerMm = 1.0
    }
    
    destroy(): void {
        this.matrixStack.free
        this.matrixStack = null
        this.drawingSurface.free
        this.drawingSurface = null
        TObject.prototype.destroy.call(this)
    }
    
    // 3d file export
    createFor3DOutput(anOutputType: short, aFileName: string): void {
        this.create()
        //already created
        this.drawingSurface.free
        this.drawingSurface = null
        switch (anOutputType) {
            case u3dexport.kDXF:
                this.drawingSurface = u3dexport.KfDrawingSurfaceForDXF().createWithFileName(aFileName)
                break
            case u3dexport.kPOV:
                this.drawingSurface = u3dexport.KfDrawingSurfaceForPOV().createWithFileName(aFileName)
                break
            case u3dexport.k3DS:
                this.drawingSurface = u3dexport.KfDrawingSurfaceFor3DS().createWithFileName(aFileName)
                break
            case u3dexport.kOBJ:
                this.drawingSurface = u3dexport.KfDrawingSurfaceForOBJ().createWithFileName(aFileName)
                break
            case u3dexport.kVRML:
                this.drawingSurface = u3dexport.KfDrawingSurfaceForVRML().createWithFileName(aFileName)
                break
            case u3dexport.kLWO:
                this.drawingSurface = u3dexport.KfDrawingSurfaceForLWO().createWithFileName(aFileName)
                break
            default:
                throw new GeneralException.create("KfTurtle.createFor3DOutput: Unrecognized output type")
                break
        }
    }
    
    start3DExportFile(): void {
        if ((this.drawingSurface !== null) && (this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).startFile
        }
    }
    
    end3DExportFile(): void {
        if ((this.drawingSurface !== null) && (this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).endFile
        }
    }
    
    // -------------------------------------------------------------------------- KfTurtle initializing and setting values 
    reset(): void {
        this.numMatrixesUsed = 1
        this.currentMatrix = this.matrixStack.Items[0]
        this.currentMatrix.initializeAsUnitMatrix()
        this.recordedPointsInUse = 0
        this.scale_pixelsPerMm = 1.0
        if (this.drawingSurface !== null) {
            this.drawingSurface.fillingTriangles = !this.drawOptions.wireFrame
            this.drawingSurface.drawingLines = this.drawOptions.drawLines
            this.drawingSurface.circlingPoints = this.drawOptions.circlePoints
            this.drawingSurface.lineContrastIndex = this.drawOptions.lineContrastIndex
            this.drawingSurface.circlePointRadius = this.drawOptions.circlePointRadius
            this.drawingSurface.sortTdosAsOneItem = this.drawOptions.sortTdosAsOneItem
            this.drawingSurface.initialize()
        }
    }
    
    setDrawOptionsForDrawingTdoOnly(): void {
        this.drawOptions.draw3DObjects = true
        this.drawOptions.draw3DObjectsAsRects = false
        this.drawOptions.drawLines = true
        this.drawOptions.lineContrastIndex = utdo.kTdoLineContrastIndex
        this.drawOptions.wireFrame = false
        this.drawOptions.sortPolygons = true
        this.drawOptions.sortTdosAsOneItem = false
        this.drawOptions.circlePoints = false
        // when drawing a tdo all by itself, you MUST set the turtle scale to 1.0,
        //    because the tdo multiplies the turtle scale by its own scale (which you are giving it
        //    in the call to draw) 
        // self.setScale_pixelsPerMm(1.0);  actually, this gets done in the reset method
        this.drawingSurface.foreColor = utdo.kTdoForeColor
        this.drawingSurface.backColor = utdo.kTdoBackColor
        this.drawingSurface.lineColor = delphi_compatability.clBlack
    }
    
    resetBoundsRect(basePoint: TPoint): void {
        this.realBoundsRect.left = basePoint.X
        this.realBoundsRect.right = basePoint.X
        this.realBoundsRect.top = basePoint.Y
        this.realBoundsRect.bottom = basePoint.Y
    }
    
    xyz(x: float, y: float, z: float): void {
        this.currentMatrix.position.x = x
        this.currentMatrix.position.y = y
        this.currentMatrix.position.z = z
    }
    
    setForeColorBackColor(frontColor: TColor, backColor: TColor): void {
        this.drawingSurface.foreColor = frontColor
        this.drawingSurface.backColor = backColor
    }
    
    setLineColor(aColor: TColor): void {
        this.drawingSurface.lineColor = aColor
    }
    
    setLineWidth(aWidth: float): void {
        this.drawingSurface.lineWidth = aWidth * this.scale_pixelsPerMm
        if (this.drawingSurface.lineWidth > 16000) {
            this.drawingSurface.lineWidth = 16000
        }
    }
    
    setScale_pixelsPerMm(newScale_pixelsPerMm: float): void {
        this.scale_pixelsPerMm = newScale_pixelsPerMm
    }
    
    newTriangleTriangle(aPointIndex: long, bPointIndex: long, cPointIndex: long): KfTriangle {
        let result = new KfTriangle()
        result = u3dsupport.KfTriangle.create
        result.points[0] = this.recordedPoints[aPointIndex]
        result.points[1] = this.recordedPoints[bPointIndex]
        result.points[2] = this.recordedPoints[cPointIndex]
        return result
    }
    
    positionCopy(): KfPoint3D {
        let result = new KfPoint3D()
        //suspicious things that call this may not clean up copy
        result = this.currentMatrix.position
        return result
    }
    
    exportingToFile(): boolean {
        let result = false
        // cfk update this if create any mode that is NOT screen and NOT file
        result = this.writingTo !== u3dexport.kScreen
        return result
    }
    
    writingToDXF(): boolean {
        let result = false
        result = this.writingTo === u3dexport.kDXF
        return result
    }
    
    writingToPOV(): boolean {
        let result = false
        result = this.writingTo === u3dexport.kPOV
        return result
    }
    
    writingTo3DS(): boolean {
        let result = false
        result = this.writingTo === u3dexport.k3DS
        return result
    }
    
    writingToOBJ(): boolean {
        let result = false
        result = this.writingTo === u3dexport.kOBJ
        return result
    }
    
    writingToVRML(): boolean {
        let result = false
        result = this.writingTo === u3dexport.kVRML
        return result
    }
    
    writingToLWO(): boolean {
        let result = false
        result = this.writingTo === u3dexport.kLWO
        return result
    }
    
    fileExportSurface(): KfFileExportSurface {
        let result = new KfFileExportSurface()
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            result = this.drawingSurface
        } else {
            result = null
        }
        return result
    }
    
    ifExporting_startNestedGroupOfPlantParts(groupName: string, shortName: string, nestingType: short): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).startNestedGroupOfPlantParts(groupName, shortName, nestingType)
        }
    }
    
    ifExporting_endNestedGroupOfPlantParts(nestingType: short): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).endNestedGroupOfPlantParts(nestingType)
        }
    }
    
    ifExporting_startPlantPart(aLongName: string, aShortName: string): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).startPlantPart(aLongName, aShortName)
        }
    }
    
    ifExporting_endPlantPart(): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).endPlantPart
        }
    }
    
    ifExporting_excludeStem(length: float): boolean {
        let result = false
        result = false
        if ((this.drawingSurface instanceof u3dexport.KfDrawingSurfaceForPOV)) {
            result = (len <= (this.drawingSurface).options.pov_minLineLengthToWrite)
        }
        return result
    }
    
    ifExporting_exclude3DObject(scale: float): boolean {
        let result = false
        result = false
        if ((this.drawingSurface instanceof u3dexport.KfDrawingSurfaceForPOV)) {
            result = (scale <= (this.drawingSurface).options.pov_minTdoScaleToWrite)
        }
        return result
    }
    
    ifExporting_startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).startStemSegment(aLongName, aShortName, color, width, index)
        }
    }
    
    ifExporting_endStemSegment(): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).endStemSegment
        }
    }
    
    ifExporting_stemCylinderFaces(): short {
        let result = 0
        result = 0
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            result = (this.drawingSurface).options.stemCylinderFaces
        }
        return result
    }
    
    drawFileExportPipeFaces(startPoints: KfPoint3D[], endPoints: KfPoint3D[], faces: short, segmentNumber: short): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).drawPipeFaces(startPoints, endPoints, faces, segmentNumber)
        }
    }
    
    ifExporting_start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).start3DObject(aLongName, aShortName, color, index)
        }
    }
    
    ifExporting_end3DObject(): void {
        if ((this.drawingSurface instanceof u3dexport.KfFileExportSurface)) {
            (this.drawingSurface).end3DObject
        }
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle returning values 
    millimetersToPixels(mm: float): float {
        let result = 0.0
        result = mm * this.scale_pixelsPerMm
        return result
    }
    
    angleX(): byte {
        let result = 0
        result = this.currentMatrix.angleX()
        return result
    }
    
    angleY(): byte {
        let result = 0
        result = this.currentMatrix.angleY()
        return result
    }
    
    angleZ(): byte {
        let result = 0
        result = this.currentMatrix.angleZ()
        return result
    }
    
    lineColor(): TColor {
        let result = new TColor()
        result = this.drawingSurface.lineColor
        return result
    }
    
    lineWidth(): float {
        let result = 0.0
        result = this.drawingSurface.lineWidth
        return result
    }
    
    position(): KfPoint3d {
        let result = new KfPoint3d()
        this.tempPosition = this.currentMatrix.position
        result = this.tempPosition
        return result
    }
    
    boundsRect(): TRect {
        let result = new TRect()
        try {
            result.Top = intround(this.realBoundsRect.top)
            result.Left = intround(this.realBoundsRect.left)
            result.Bottom = intround(this.realBoundsRect.bottom)
            result.Right = intround(this.realBoundsRect.right)
        } catch (e) {
            //might want to be more precise in assigning a rect
            result.Top = -32767
            result.Left = -32767
            result.Bottom = 32767
            result.Right = 32767
        }
        return result
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle recording 
    startRecording(): void {
        this.recordedPointsInUse = 0
        this.recordPosition()
    }
    
    clearRecording(): void {
        this.recordedPointsInUse = 0
    }
    
    recordPosition(): void {
        let newPoint: KfPoint3D
        
        if (this.recordedPointsInUse >= utdo.kMaximumRecordedPoints) {
            return
        }
        newPoint = this.currentMatrix.position
        this.recordedPoints[this.recordedPointsInUse] = newPoint
        this.recordedPointsInUse += 1
        this.addToRealBoundsRect(newPoint)
    }
    
    recordPositionPoint(aPoint: KfPoint3D): void {
        if (this.recordedPointsInUse >= utdo.kMaximumRecordedPoints) {
            return
        }
        this.recordedPoints[this.recordedPointsInUse] = aPoint
        this.recordedPointsInUse += 1
        this.addToRealBoundsRect(aPoint)
    }
    
    transformAndRecord(originalPoint3D: KfPoint3D, theScale_pixelsPerMm: float): KfPoint3d {
        let result = new KfPoint3d()
        //transform and scale point and record the new location without moving
        result = originalPoint3D
        utdo.KfPoint3D_scaleBy(result, theScale_pixelsPerMm * this.scale_pixelsPerMm)
        this.currentMatrix.transform(result)
        this.recordPositionPoint(result)
        return result
    }
    
    moveAndRecordScale(originalPoint3D: KfPoint3D, theScale_pixelsPerMm: float): void {
        let aPoint3d: KfPoint3D
        
        aPoint3d = originalPoint3D
        utdo.KfPoint3D_scaleBy(aPoint3d, theScale_pixelsPerMm * this.scale_pixelsPerMm)
        this.currentMatrix.transform(aPoint3d)
        this.currentMatrix.position = aPoint3d
        this.recordPositionPoint(aPoint3d)
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle moving 
    moveInMillimeters(mm: float): void {
        this.currentMatrix.move(this.millimetersToPixels(mm))
    }
    
    moveInMillimetersAndRecord(mm: float): void {
        this.currentMatrix.move(this.millimetersToPixels(mm))
        this.recordPosition()
    }
    
    moveInPixels(pixels: float): void {
        this.currentMatrix.move(pixels)
    }
    
    moveInPixelsAndRecord(pixels: float): void {
        this.currentMatrix.move(pixels)
        this.recordPosition()
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle drawing 
    drawInPixels(pixels: float): void {
        let oldPosition: KfPoint3d
        let newPosition: KfPoint3d
        
        oldPosition = this.currentMatrix.position
        this.currentMatrix.move(pixels)
        newPosition = this.currentMatrix.position
        if (this.drawOptions.drawStems) {
            this.drawingSurface.drawLineFromTo(oldPosition, newPosition)
        }
        this.addToRealBoundsRect(newPosition)
    }
    
    // PDF PORT added to deal with alternatives
    // PDF PORT --Alternative -- changed name of alternative function -- Will not be called
    drawInMillimeters_debug(mm: float): void {
        let oldColor: TColorRef
        let oldWidth: float
        
        oldColor = this.drawingSurface.lineColor
        oldWidth = this.drawingSurface.lineWidth
        this.drawingSurface.lineWidth = 2
        this.drawingSurface.lineColor = delphi_compatability.clRed
        this.push()
        //will flip so draw Y (sic)
        this.rotateZ(64)
        debugDrawAxis(this, 100.0)
        this.pop()
        this.drawingSurface.lineWidth = 1
        this.drawingSurface.lineColor = delphi_compatability.clBlue
        this.push()
        //will flip so draw Z (sic)
        this.rotateY(64)
        debugDrawAxis(this, 100.0)
        this.pop()
        this.drawingSurface.lineColor = oldColor
        this.drawingSurface.lineWidth = oldWidth
        debugDrawInMillimeters(this, mm)
    }
    
    drawInMillimeters(mm: float, partID: long): KfTriangle {
        let result = new KfTriangle()
        let oldPosition: KfPoint3d
        let newPosition: KfPoint3d
        
        result = null
        oldPosition = this.currentMatrix.position
        this.currentMatrix.move(this.millimetersToPixels(mm))
        newPosition = this.currentMatrix.position
        if (this.drawOptions.drawStems) {
            result = this.drawingSurface.drawLineFromTo(oldPosition, newPosition)
            if (result !== null) {
                result.plantPartID = partID
            }
        }
        this.addToRealBoundsRect(newPosition)
        return result
    }
    
    drawTriangleFromIndexes(aPointIndex: long, bPointIndex: long, cPointIndex: long, partID: long): KfTriangle {
        let result = new KfTriangle()
        //drawing surface takes over ownership of triangle
        result = this.drawingSurface.allocateTriangle()
        this.drawingSurface.lineWidth = 1.0
        result.points[0] = this.recordedPoints[aPointIndex - 1]
        result.points[1] = this.recordedPoints[bPointIndex - 1]
        result.points[2] = this.recordedPoints[cPointIndex - 1]
        result.plantPartID = partID
        this.drawingSurface.drawLastTriangle()
        return result
    }
    
    drawTrianglesFromBoundsRect(boundsRect: TRect): void {
        let aTriangle: KfTriangle
        
        //drawing surface takes over ownership of triangle
        this.drawingSurface.lineWidth = 1.0
        aTriangle = this.drawingSurface.allocateTriangle()
        aTriangle.points[0].x = boundsRect.Left
        aTriangle.points[0].y = boundsRect.Top
        aTriangle.points[1].x = boundsRect.Right
        aTriangle.points[1].y = boundsRect.Top
        aTriangle.points[2].x = boundsRect.Left
        aTriangle.points[2].y = boundsRect.Bottom
        this.drawingSurface.drawLastTriangle()
        aTriangle = this.drawingSurface.allocateTriangle()
        aTriangle.points[0].x = boundsRect.Left
        aTriangle.points[0].y = boundsRect.Bottom
        aTriangle.points[1].x = boundsRect.Right
        aTriangle.points[1].y = boundsRect.Top
        aTriangle.points[2].x = boundsRect.Right
        aTriangle.points[2].y = boundsRect.Bottom
        this.drawingSurface.drawLastTriangle()
    }
    
    drawTriangle(): void {
        let triangle: KfTriangle
        
        if (this.recordedPointsInUse !== 3) {
            throw new GeneralException.create("Problem: Triangle made without three points in method KfTurtle.drawTriangle.")
        }
        //drawing surface owns triangle
        triangle = this.drawingSurface.allocateTriangle()
        triangle.points[0] = this.recordedPoints[0]
        triangle.points[1] = this.recordedPoints[1]
        triangle.points[2] = this.recordedPoints[2]
        this.drawingSurface.drawLastTriangle()
        this.recordedPointsInUse = 0
    }
    
    addToRealBoundsRect(aPoint: KfPoint3d): void {
        if (aPoint.x < this.realBoundsRect.left) {
            this.realBoundsRect.left = aPoint.x
        } else if (aPoint.x > this.realBoundsRect.right) {
            this.realBoundsRect.right = aPoint.x
        }
        if (aPoint.y < this.realBoundsRect.top) {
            this.realBoundsRect.top = aPoint.y
        } else if (aPoint.y > this.realBoundsRect.bottom) {
            this.realBoundsRect.bottom = aPoint.y
        }
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle stack 
    push(): void {
        if (this.numMatrixesUsed >= this.matrixStack.Count) {
            this.matrixStack.Add(this.currentMatrix.deepCopy())
        } else {
            this.currentMatrix.copyTo(u3dsupport.KfMatrix(this.matrixStack.Items[this.numMatrixesUsed]))
        }
        this.numMatrixesUsed += 1
        this.currentMatrix = this.matrixStack.Items[this.numMatrixesUsed - 1]
    }
    
    pop(): void {
        if (this.numMatrixesUsed < 1) {
            return
        }
        this.numMatrixesUsed -= 1
        this.currentMatrix = this.matrixStack.Items[this.numMatrixesUsed - 1]
    }
    
    stackSize(): long {
        let result = 0
        result = this.numMatrixesUsed
        return result
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle rotating 
    rotateX(angle: float): void {
        this.currentMatrix.rotateX(angle)
    }
    
    rotateY(angle: float): void {
        this.currentMatrix.rotateY(angle)
    }
    
    rotateZ(angle: float): void {
        this.currentMatrix.rotateZ(angle)
    }
    
    // ---------------------------------------------------------------------------------- KfTurtle defaulting 
    //where the default turtle is used need a try..finally
    //to ensure defaultStopUsing is called no matter what
    defaultStartUsing(): KfTurtle {
        let result = new KfTurtle()
        if (gDefaultTurtleInUse) {
            throw new GeneralException.create("Problem: turtle is already in use; in method KfTurtle.defaultStartUsing.")
        }
        gDefaultTurtleInUse = true
        result = gDefaultTurtle
        return result
    }
    
    defaultStopUsing(): void {
        gDefaultTurtleInUse = false
    }
    
    defaultAllocate(): void {
        gDefaultTurtle = null
        gDefaultTurtle = KfTurtle().create()
        gDefaultTurtleInUse = false
    }
    
    defaultFree(): void {
        gDefaultTurtle.free
        gDefaultTurtle = null
    }
    
}

//need to default free somewhere in project
