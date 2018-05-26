// unit Utdo

import { float, long, ColorDefs } from "./common"
import { PdStreamableObject, PdClassAndVersionInformationRecord, PdFiler } from "./temporary";
import { KfPoint3D } from "./KfPoint3D";

/* TODO: Remove unused imports 
from conversion_common import *
import u3dexport
import u3dsupport
import uplant
import udebug
import usupport
import uclasses
import uturtle
import ufiler
import usstream
import ucollect
import delphi_compatability
*/

// const
const kMaximumRecordedPoints = 10000
const kAdjustForOrigin = true
const kDontAdjustForOrigin = false
const kEmbeddedInPlant = true
const kInTdoLibrary = false
const kStandAloneFile = false
const kTdoForeColor = ColorDefs.clSilver
const kTdoBackColor = ColorDefs.clGray
const kTdoLineContrastIndex = 10
const kStartTdoString = "start 3D object"
const kEndTdoString = "end 3D object"


// v1.6b2 changed from 200 to 1000 ; v2.0 changed to 10000 (not in tdo anymore)
// v1.11 moved up here
// v1.11 moved up here

// PKfPoint3DArray = 
// TODO: Remove this if really unused: TKfPoint3DArray = KfPoint3D[] /* delphi_compatability.MaxListSize - 1 + 1 */

// const
const kPointAllocationIncrement = 8


function betweenBrackets(aString: string): string {
    // lose letter and [ on front, lose ] on back 
    return aString.substring(2, aString.length - 2)
}

export class KfObject3D {
    pointData: PKfPoint3DArray = new PKfPoint3DArray()
    pointsInUse: long = 0
    pointsAllocated: long = 0
    originPointIndex: long = 0
    triangles: TListCollection = new TListCollection()
    name: string = ""
    originalIfCopy: KfObject3D = new KfObject3D()
    inUse: boolean = false
    zForSorting: float = 0.0
    indexWhenRemoved: short = 0
    selectedIndexWhenRemoved: short = 0
    boundsRect: TRect = new TRect()
    KfObject3D.prototype = new PdStreamableObject()
    KfObject3D.prototype.constructor = KfObject3D
    
    // doesn't need to be streamed, only used while drawing
    // ---------------------------------------------------------------------------------- KfObject3D 
    create(): void {
        PdStreamableObject.prototype.create.call(this)
        this.triangles = ucollect.TListCollection().Create()
    }
    
    destroy(): void {
        this.triangles.free
        this.triangles = null
        if (this.pointData !== null) {
            UNRESOLVED.FreeMem(this.pointData)
        }
        PdStreamableObject.prototype.destroy.call(this)
    }
    
    ensureEnoughSpaceForNewPointData(totalNumberOfPointsToBeUsed: long): void {
        if (this.pointsAllocated >= totalNumberOfPointsToBeUsed) {
            return
        }
        if (this.pointData === null) {
            if (totalNumberOfPointsToBeUsed < kPointAllocationIncrement) {
                totalNumberOfPointsToBeUsed = kPointAllocationIncrement
            }
            // assuming this throws its own memory exception
            UNRESOLVED.GetMem(this.pointData, totalNumberOfPointsToBeUsed * FIX_sizeof(KfPoint3D))
        } else {
            if (totalNumberOfPointsToBeUsed % kPointAllocationIncrement !== 0) {
                totalNumberOfPointsToBeUsed = totalNumberOfPointsToBeUsed + kPointAllocationIncrement - (totalNumberOfPointsToBeUsed % kPointAllocationIncrement)
            }
            UNRESOLVED.ReallocMem(this.pointData, totalNumberOfPointsToBeUsed * FIX_sizeof(KfPoint3D))
            // assuming this throws its own memory exception
        }
        this.pointsAllocated = totalNumberOfPointsToBeUsed
    }
    
    getPoint(index: int): KfPoint3d {
        let result = new KfPoint3d()
        result = this.pointData.PDF_FIX_POINTER_ACCESS[index]
        return result
    }
    
    setPoint(index: int, aPoint: KfPoint3d): void {
        if (this.pointData === null) {
            throw new GeneralException.create("Problem: Nil pointer in method KfObject3D.setPoint.")
        }
        this.pointData.PDF_FIX_POINTER_ACCESS[index] = aPoint
    }
    
    clear(): void {
        this.clearPoints()
        this.name = ""
    }
    
    clearPoints(): void {
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles.clear()
    }
    
    copyFrom(original: KfObject3D): void {
        let i: int
        let theTriangle: KfIndexTriangle
        
        if (original === null) {
            return
        }
        this.setName(original.name)
        this.ensureEnoughSpaceForNewPointData(original.pointsInUse)
        if (original.pointsInUse > 0) {
            for (i = 0; i <= original.pointsInUse - 1; i++) {
                this.points[i] = original.points[i]
            }
        }
        this.pointsInUse = original.pointsInUse
        this.originPointIndex = original.originPointIndex
        this.triangles.clear()
        if (original.triangles.Count > 0) {
            for (i = 0; i <= original.triangles.Count - 1; i++) {
                theTriangle = original.triangles.Items[i]
                this.addTriangle(KfIndexTriangle().createABC(theTriangle.pointIndexes[0], theTriangle.pointIndexes[1], theTriangle.pointIndexes[2]))
            }
        }
        this.inUse = original.inUse
    }
    
    isSameAs(other: KfObject3D): boolean {
        let result = false
        let i: long
        let j: long
        let thePoint: KfPoint3d
        let theTriangle: KfIndexTriangle
        let otherPoint: KfPoint3d
        let otherTriangle: KfIndexTriangle
        
        //false if fails any test
        result = false
        if (this.name !== other.name) {
            return result
        }
        if (this.pointsInUse !== other.pointsInUse) {
            return result
        }
        if (this.originPointIndex !== other.originPointIndex) {
            return result
        }
        if (this.triangles.Count !== other.triangles.Count) {
            return result
        }
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                thePoint = this.points[i]
                otherPoint = other.points[i]
                if ((intround(thePoint.x) !== intround(otherPoint.x)) || (intround(thePoint.y) !== intround(otherPoint.y)) || (intround(thePoint.z) !== intround(otherPoint.z))) {
                    // round these because otherwise i/o inaccuracies could make a tdo seem different when it isn't,
                    // and most numbers are far enough to be integers anyway
                    return result
                }
            }
        }
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                theTriangle = this.triangles.Items[i]
                otherTriangle = other.triangles.Items[i]
                for (j = 0; j <= 2; j++) {
                    if (theTriangle.pointIndexes[j] !== otherTriangle.pointIndexes[j]) {
                        return result
                    }
                }
            }
        }
        //passed all the tests
        result = true
        return result
    }
    
    getName(): string {
        let result = ""
        result = this.name
        return result
    }
    
    setName(newName: string): void {
        this.name = UNRESOLVED.copy(newName, 1, 80)
    }
    
    addPoint(aPoint: KfPoint3d): short {
        let result = 0
        // v2.0 removed this check
        //if pointsInUse >= kMaximumRecordedPoints then
        //  raise Exception.create('Problem: Too many points in 3D object.');
        this.ensureEnoughSpaceForNewPointData(this.pointsInUse + 1)
        this.points[this.pointsInUse] = aPoint
        this.pointsInUse += 1
        result = this.pointsInUse
        return result
    }
    
    removePoint(point: short): void {
        let i: short
        
        if (point <= this.pointsInUse - 2) {
            for (i = point; i <= this.pointsInUse - 2; i++) {
                this.points[i] = this.points[i + 1]
            }
        }
        this.deletePointIndexInTriangles(point)
        // never releasing memory until entire object freed
        this.pointsInUse -= 1
        if (this.originPointIndex > this.pointsInUse - 1) {
            this.originPointIndex = this.pointsInUse - 1
        }
    }
    
    addPointIfNoMatch(aPoint: KfPoint3d, matchDistance: float): short {
        let result = 0
        let i: short
        
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                if (KfPoint3D_matchXYZ(aPoint, this.points[i], matchDistance)) {
                    //add 1 because triangle indexes start at 1
                    result = i + 1
                    return result
                }
            }
        }
        result = this.addPoint(aPoint)
        return result
    }
    
    //PDF FIX - may want to optimize this to use var to pass around result rather than assign
    pointForIndex(anIndex: long): KfPoint3D {
        let result = new KfPoint3D()
        if ((anIndex < 1) || (anIndex > this.pointsInUse)) {
            throw new GeneralException.create("Problem: Point index out of range in method KfObject3D.pointForIndex.")
        }
        result = this.points[anIndex - 1]
        return result
    }
    
    addTriangle(aTriangle: KfIndexTriangle): void {
        this.triangles.Add(aTriangle)
    }
    
    triangleForIndex(anIndex: long): KfIndexTriangle {
        let result = new KfIndexTriangle()
        if ((anIndex < 1) || (anIndex > this.triangles.Count)) {
            throw new GeneralException.create("Problem: Triangle index out of range in method KfObject3D.triangleForIndex.")
        }
        result = this.triangles.Items[anIndex - 1]
        return result
    }
    
    //adjust all points for origin, which is assumed to be at the first point
    //in terms of plant organs, this means the first point is
    //where the organ is attached to the plant
    adjustForOrigin(): void {
        let i: long
        let tempPoint: KfPoint3d
        
        if (this.pointsInUse < 1) {
            return
        }
        if (this.originPointIndex < 0) {
            this.originPointIndex = 0
        }
        if (this.originPointIndex > this.pointsInUse - 1) {
            this.originPointIndex = this.pointsInUse - 1
        }
        if (this.pointsInUse > 1) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                if (i !== this.originPointIndex) {
                    tempPoint = this.points[i]
                    KfPoint3D_subtract(tempPoint, this.points[this.originPointIndex])
                    this.points[i] = tempPoint
                }
            }
        }
        //makes the first point zero
        tempPoint = this.points[this.originPointIndex]
        KfPoint3D_setXYZ(tempPoint, 0.0, 0.0, 0.0)
        this.points[this.originPointIndex] = tempPoint
    }
    
    setOriginPointIndex(newOriginPointIndex: int): void {
        let changed: boolean
        
        changed = (this.originPointIndex !== newOriginPointIndex)
        this.originPointIndex = newOriginPointIndex
        if (changed) {
            this.adjustForOrigin()
        }
    }
    
    makeMirrorTriangles(): void {
        let triangleCountAtStart: short
        let newPointIndexes: short[] /* 2 + 1 */
        let i: short
        let j: short
        let aPoint: KfPoint3D
        let triangle: KfIndexTriangle
        
        this.adjustForOrigin()
        triangleCountAtStart = this.triangles.Count
        if (triangleCountAtStart > 0) {
            for (i = 0; i <= triangleCountAtStart - 1; i++) {
                triangle = KfIndexTriangle(this.triangles[i])
                for (j = 0; j <= 2; j++) {
                    aPoint = this.pointForIndex(triangle.pointIndexes[j])
                    aPoint.x = -1 * aPoint.x
                    newPointIndexes[j] = this.addPointIfNoMatch(aPoint, 1.0)
                }
                // reversing order of points makes triangle have correct facing for opposite side
                this.addTriangle(KfIndexTriangle().createABC(newPointIndexes[2], newPointIndexes[1], newPointIndexes[0]))
            }
        }
    }
    
    reverseZValues(): void {
        let i: short
        let tempPoint: KfPoint3d
        
        this.adjustForOrigin()
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                tempPoint = this.points[i]
                tempPoint.z = -1 * tempPoint.z
                this.points[i] = tempPoint
            }
        }
    }
    
    bestPointForDrawingAtScale(turtleProxy: TObject, origin: TPoint, bitmapSize: TPoint, scale: float): TPoint {
        let result = new TPoint()
        let i: long
        let turtle: KfTurtle
        
        turtle = uturtle.KfTurtle(turtleProxy)
        this.boundsRect = Rect(0, 0, 0, 0)
        turtle.reset()
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                KfPoint3D_addPointToBoundsRect(this.boundsRect, turtle.transformAndRecord(this.points[i], scale))
            }
        }
        result.X = origin.X + bitmapSize.X / 2 - usupport.rWidth(this.boundsRect) / 2 - this.boundsRect.Left
        result.Y = origin.Y + bitmapSize.Y / 2 - usupport.rHeight(this.boundsRect) / 2 - this.boundsRect.Top
        return result
    }
    
    draw(turtleProxy: TObject, scale: float, longName: string, shortName: string, dxfIndex: short, partID: long): TRect {
        let result = new TRect()
        let i: long
        let triangle: KfIndexTriangle
        let realTriangle: KfTriangle
        let turtle: KfTurtle
        let minZ: float
        
        result = Rect(0, 0, 0, 0)
        minZ = 0
        this.zForSorting = 0
        turtle = uturtle.KfTurtle(turtleProxy)
        if (turtle.ifExporting_exclude3DObject(scale)) {
            return result
        }
        turtle.clearRecording()
        this.boundsRect = Rect(0, 0, 0, 0)
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                KfPoint3D_addPointToBoundsRect(this.boundsRect, turtle.transformAndRecord(this.points[i], scale))
            }
        }
        result = this.boundsRect
        if (!turtle.drawOptions.draw3DObjects) {
            return result
        }
        if (turtle.drawOptions.draw3DObjectsAsRects) {
            turtle.drawTrianglesFromBoundsRect(this.boundsRect)
            return result
        }
        // prepare
        turtle.ifExporting_start3DObject(longName + " 3D object", shortName, turtle.drawingSurface.foreColor, dxfIndex)
        if (turtle.exportingToFile()) {
            // draw
            this.write3DExportElements(turtle, scale, partID)
        } else if (this.triangles.Count > 0) {
            for (i = 1; i <= this.triangles.Count; i++) {
                triangle = this.triangleForIndex(i)
                realTriangle = turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[1], triangle.pointIndexes[2], partID)
                if ((turtle.drawOptions.sortPolygons) && (turtle.drawOptions.sortTdosAsOneItem) && (realTriangle !== null)) {
                    if (i === 1) {
                        minZ = realTriangle.zForSorting
                    } else if (realTriangle.zForSorting < minZ) {
                        minZ = realTriangle.zForSorting
                    }
                    realTriangle.tdo = this
                }
            }
        }
        this.zForSorting = minZ
        turtle.ifExporting_end3DObject()
        return result
    }
    
    overlayBoundsRect(turtleProxy: TObject, scale: float): void {
        let i: long
        let turtle: KfTurtle
        let oldSetting: boolean
        
        turtle = uturtle.KfTurtle(turtleProxy)
        oldSetting = turtle.drawingSurface.fillingTriangles
        turtle.drawingSurface.fillingTriangles = false
        turtle.drawTrianglesFromBoundsRect(this.boundsRect)
        turtle.drawingSurface.fillingTriangles = oldSetting
    }
    
    write3DExportElements(turtleProxy: TObject, scale: float, partID: short): void {
        let fileExportSurface: KfFileExportSurface
        let i: short
        let turtle: KfTurtle
        let triangle: KfIndexTriangle
        let firstPtIndex: long
        
        // do NOT pass the array on because a tdo could be really big
        // some write out lists of points then triangles; some draw each triangle
        turtle = uturtle.KfTurtle(turtleProxy)
        fileExportSurface = turtle.fileExportSurface()
        if (fileExportSurface === null) {
            throw new GeneralException.create("Problem: No 3D drawing surface in method KfObject3D.write3DExportElements.")
        }
        switch (turtle.writingTo) {
            case u3dexport.k3DS:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (i = 0; i <= this.pointsInUse - 1; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (i = 1; i <= this.triangles.Count; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case u3dexport.kOBJ:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (i = 0; i <= this.pointsInUse - 1; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (i = 1; i <= this.triangles.Count; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case u3dexport.kVRML:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (i = 0; i <= this.pointsInUse - 1; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (i = 1; i <= this.triangles.Count; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case u3dexport.kLWO:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (i = 0; i <= this.pointsInUse - 1; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (i = 1; i <= this.triangles.Count; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            default:
                for (i = 1; i <= this.triangles.Count; i++) {
                    triangle = this.triangleForIndex(i)
                    turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[1], triangle.pointIndexes[2], partID)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[2], triangle.pointIndexes[1], partID)
                    }
                }
                break
    }
    
    addTriangleWithVerticesABC(a: long, b: long, c: long): void {
        this.addTriangle(KfIndexTriangle().createABC(a, b, c))
    }
    
    removeTriangle(aTriangle: KfIndexTriangle): void {
        this.triangles.Remove(aTriangle)
        this.removePointsNotInUse()
    }
    
    removePointsNotInUse(): void {
        let i: short
        let pointToRemove: short
        let done: boolean
        
        if (this.pointsInUse <= 0) {
            return
        }
        done = false
        while (!done) {
            pointToRemove = -1
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                if (!this.pointIsReallyInUse(i)) {
                    pointToRemove = i
                    break
                }
            }
            if (pointToRemove >= 0) {
                this.removePoint(pointToRemove)
            } else {
                done = true
            }
        }
    }
    
    pointIsReallyInUse(point: short): boolean {
        let result = false
        let triangle: KfIndexTriangle
        let i: short
        let j: short
        let adjustedPoint: short
        
        result = false
        // triangle indexes start at 1, not 0 
        adjustedPoint = point + 1
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles.Items[i])
                for (j = 0; j <= 2; j++) {
                    if (triangle.pointIndexes[j] === adjustedPoint) {
                        result = true
                        return result
                    }
                }
            }
        }
        return result
    }
    
    deletePointIndexInTriangles(oldPointIndex: short): void {
        let triangle: KfIndexTriangle
        let i: short
        let j: short
        let adjustedOldPointIndex: short
        
        // triangle indexes start at 1, not 0 
        adjustedOldPointIndex = oldPointIndex + 1
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles.Items[i])
                for (j = 0; j <= 2; j++) {
                    if (triangle.pointIndexes[j] > adjustedOldPointIndex) {
                        triangle.pointIndexes[j] = triangle.pointIndexes[j] - 1
                    }
                }
            }
        }
    }
    
    //parse string into xyz positions and add point to collection
    addPointString(stream: KfStringStream): void {
        let aPoint3D: KfPoint3D
        let x: int
        let y: int
        let z: int
        
        x = 0
        y = 0
        z = 0
        x = stream.nextInteger()
        y = stream.nextInteger()
        z = stream.nextInteger()
        KfPoint3D_setXYZ(aPoint3D, x, y, z)
        this.addPoint(aPoint3D)
    }
    
    //parse string into three point indexes and add triangle to collection
    addTriangleString(stream: KfStringStream): void {
        let p1: int
        let p2: int
        let p3: int
        
        p1 = 0
        p2 = 0
        p3 = 0
        p1 = stream.nextInteger()
        p2 = stream.nextInteger()
        p3 = stream.nextInteger()
        if ((p1 === 0) || (p2 === 0) || (p3 === 0) || (p1 > this.pointsInUse) || (p2 > this.pointsInUse) || (p3 > this.pointsInUse)) {
            MessageDialog("Bad triangle: " + IntToStr(p1) + " " + IntToStr(p2) + " " + IntToStr(p3) + ". Point indexes must be between 1 and " + IntToStr(this.pointsInUse) + ".", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        } else {
            this.addTriangle(KfIndexTriangle().createABC(p1, p2, p3))
        }
    }
    
    writeToFile(fileName: string): void {
        let outputFile: TextFile
        
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Rewrite(outputFile)
            this.writeToFileStream(outputFile, kStandAloneFile)
        } finally {
            CloseFile(outputFile)
        }
    }
    
    readFromFile(fileName: string): void {
        let inputFile: TextFile
        
        AssignFile(inputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Reset(inputFile)
            this.readFromFileStream(inputFile, kStandAloneFile)
        } finally {
            CloseFile(inputFile)
        }
    }
    
    writeToMemo(aMemo: TMemo): void {
        let i: short
        let triangle: KfIndexTriangle
        
        aMemo.Lines.Add("  " + kStartTdoString)
        aMemo.Lines.Add("  Name=" + this.getName())
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                aMemo.Lines.Add("  Point=" + IntToStr(intround(this.points[i].x)) + " " + IntToStr(intround(this.points[i].y)) + " " + IntToStr(intround(this.points[i].z)))
            }
        }
        aMemo.Lines.Add("; Origin=" + IntToStr(this.originPointIndex))
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles[i])
                aMemo.Lines.Add("  Triangle=" + IntToStr(triangle.pointIndexes[0]) + " " + IntToStr(triangle.pointIndexes[1]) + " " + IntToStr(triangle.pointIndexes[2]))
            }
        }
        aMemo.Lines.Add("  " + kEndTdoString)
    }
    
    writeToFileStream(outputFile: TextFile, embeddedInPlant: boolean): void {
        let i: short
        let triangle: KfIndexTriangle
        
        if (embeddedInPlant) {
            writeln(outputFile, "  " + kStartTdoString)
        }
        if (embeddedInPlant) {
            write(outputFile, "  ")
        }
        writeln(outputFile, "Name=" + this.getName())
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                writeln(outputFile, "  Point=" + IntToStr(intround(this.points[i].x)) + " " + IntToStr(intround(this.points[i].y)) + " " + IntToStr(intround(this.points[i].z)))
            }
        }
        writeln(outputFile, "; Origin=" + IntToStr(this.originPointIndex))
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles[i])
                writeln(outputFile, "  Triangle=" + IntToStr(triangle.pointIndexes[0]) + " " + IntToStr(triangle.pointIndexes[1]) + " " + IntToStr(triangle.pointIndexes[2]))
            }
        }
        if (embeddedInPlant) {
            writeln(outputFile, "  " + kEndTdoString)
        } else {
            writeln(outputFile)
        }
    }
    
    readFromFileStream(inputFile: TextFile, embeddedInPlant: boolean): void {
        let inputLine: string
        let fieldType: string
        let stream: KfStringStream
        
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles.clear()
        if (embeddedInPlant) {
            UNRESOLVED.readln(inputFile, inputLine)
            if ((embeddedInPlant) && (trim(inputLine) === "")) {
                // cfk change for v1.3 added '' case
                UNRESOLVED.readln(inputFile, inputLine)
            }
            if ((UNRESOLVED.copy(inputLine, 1, 1) === ";") && (UNRESOLVED.pos("ORIGIN", uppercase(inputLine)) <= 0)) {
                // cfk change for v1.6b2 mistake with origin, placed with comment
                UNRESOLVED.readln(inputFile, inputLine)
            }
            if (UNRESOLVED.pos(uppercase(kStartTdoString), uppercase(inputLine)) <= 0) {
                throw new GeneralException.create("Problem: Expected start of 3D object.")
            }
        }
        stream = null
        try {
            //read info for 3D object from file at current position
            stream = usstream.KfStringStream.create
            while (!UNRESOLVED.eof(inputFile)) {
                UNRESOLVED.readln(inputFile, inputLine)
                if ((embeddedInPlant) && (trim(inputLine) === "")) {
                    // cfk change v1.3 added '' case
                    continue
                }
                if ((UNRESOLVED.copy(inputLine, 1, 1) === ";") && (UNRESOLVED.pos("ORIGIN", uppercase(inputLine)) <= 0)) {
                    // cfk change for v1.6b2 mistake with origin, placed with comment
                    continue
                }
                if ((!embeddedInPlant) && (UNRESOLVED.pos("[", inputLine) === 1)) {
                    //ignore old thing in brackets
                    continue
                }
                stream.onStringSeparator(inputLine, "=")
                fieldType = stream.nextToken()
                stream.spaceSeparator()
                if (UNRESOLVED.pos("POINT", uppercase(fieldType)) > 0) {
                    this.addPointString(stream)
                } else if (UNRESOLVED.pos("ORIGIN", uppercase(fieldType)) > 0) {
                    this.setOriginPointIndex(StrToIntDef(stream.remainder, 0))
                } else if (UNRESOLVED.pos("TRIANGLE", uppercase(fieldType)) > 0) {
                    this.addTriangleString(stream)
                } else if (UNRESOLVED.pos("NAME", uppercase(fieldType)) > 0) {
                    this.setName(stream.remainder)
                } else {
                    break
                }
            }
            this.adjustForOrigin()
            if (embeddedInPlant) {
                if (UNRESOLVED.pos(uppercase(kEndTdoString), uppercase(inputLine)) <= 0) {
                    throw new GeneralException.create("Problem: Expected end of 3D object.")
                }
            }
        } finally {
            stream.free
        }
    }
    
    readFromDXFFile(inputFile: TextFile): void {
        let identifierLine: string
        let valueLine: string
        let newPoints: KfPoint3D[] /* 2 + 1 */
        let newTriangleIndexes: int[] /* 2 + 1 */
        let pointsRead: int
        
        this.pointsInUse = 0
        this.originPointIndex = 0
        pointsRead = 0
        this.triangles.clear()
        newPoints[0].x = 0
        newPoints[0].y = 0
        newPoints[0].z = 0
        newPoints[1].x = 0
        newPoints[1].y = 0
        newPoints[1].z = 0
        newPoints[2].x = 0
        newPoints[2].y = 0
        newPoints[2].z = 0
        while (!UNRESOLVED.eof(inputFile)) {
            UNRESOLVED.readln(inputFile, identifierLine)
            identifierLine = trim(identifierLine)
            UNRESOLVED.readln(inputFile, valueLine)
            valueLine = trim(valueLine)
            if (identifierLine === "10") {
                // v1.60final changed this from else to all ifs; something wrong in Delphi, I think
                // first point
                newPoints[0].x = StrToFloat(valueLine)
            }
            if (identifierLine === "20") {
                newPoints[0].y = -1 * StrToFloat(valueLine)
            }
            if (identifierLine === "30") {
                newPoints[0].z = StrToFloat(valueLine)
            }
            if (identifierLine === "11") {
                // second point
                newPoints[1].x = StrToFloat(valueLine)
            }
            if (identifierLine === "21") {
                newPoints[1].y = -1 * StrToFloat(valueLine)
            }
            if (identifierLine === "31") {
                newPoints[1].z = StrToFloat(valueLine)
            }
            if (identifierLine === "12") {
                // third point
                newPoints[2].x = StrToFloat(valueLine)
            }
            if (identifierLine === "22") {
                newPoints[2].y = -1 * StrToFloat(valueLine)
            }
            if (identifierLine === "32") {
                newPoints[2].z = StrToFloat(valueLine)
            }
            if (identifierLine === "13") {
                // end (ignoring fourth point)
                pointsRead += 3
                // make new triangle
                newTriangleIndexes[0] = this.addPointIfNoMatch(newPoints[0], 0.1)
                newTriangleIndexes[1] = this.addPointIfNoMatch(newPoints[1], 0.1)
                newTriangleIndexes[2] = this.addPointIfNoMatch(newPoints[2], 0.1)
                this.addTriangle(KfIndexTriangle().createABC(newTriangleIndexes[0], newTriangleIndexes[1], newTriangleIndexes[2]))
                // reset points for next time
                newPoints[0].x = 0
                newPoints[0].y = 0
                newPoints[0].z = 0
                newPoints[1].x = 0
                newPoints[1].y = 0
                newPoints[1].z = 0
                newPoints[2].x = 0
                newPoints[2].y = 0
                newPoints[2].z = 0
            }
        }
        this.adjustForOrigin()
    }
    
    readFromMemo(aMemo: TMemo, readingMemoLine: long): void {
        let inputLine: string
        let fieldType: string
        let stream: KfStringStream
        
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles.clear()
        inputLine = aMemo.Lines.Strings[readingMemoLine]
        readingMemoLine += 1
        if (trim(inputLine) === "") {
            // cfk change v1.60final added '' case
            // skip commented lines 
            inputLine = aMemo.Lines.Strings[readingMemoLine]
            readingMemoLine += 1
        }
        if ((UNRESOLVED.copy(inputLine, 1, 1) === ";") && (UNRESOLVED.pos("ORIGIN", uppercase(inputLine)) <= 0)) {
            // cfk change for v1.6b2 mistake with origin, placed with comment
            // skip commented lines 
            inputLine = aMemo.Lines.Strings[readingMemoLine]
            readingMemoLine += 1
        }
        if (UNRESOLVED.pos(uppercase(kStartTdoString), uppercase(inputLine)) <= 0) {
            throw new GeneralException.create("Problem: Expected start of 3D object.")
        }
        stream = null
        try {
            //read info for 3D object from file at current position
            stream = usstream.KfStringStream.create
            while (readingMemoLine <= aMemo.Lines.Count - 1) {
                inputLine = aMemo.Lines.Strings[readingMemoLine]
                readingMemoLine += 1
                if (trim(inputLine) === "") {
                    // cfk change v1.60final added '' case
                    continue
                }
                if ((UNRESOLVED.copy(inputLine, 1, 1) === ";") && (UNRESOLVED.pos("ORIGIN", uppercase(inputLine)) <= 0)) {
                    // cfk change for v1.6b2 mistake with origin, placed with comment
                    // skip commented lines 
                    continue
                }
                stream.onStringSeparator(inputLine, "=")
                fieldType = stream.nextToken()
                stream.spaceSeparator()
                if (UNRESOLVED.pos("POINT", uppercase(fieldType)) > 0) {
                    this.addPointString(stream)
                } else if (UNRESOLVED.pos("ORIGIN", uppercase(fieldType)) > 0) {
                    this.setOriginPointIndex(StrToIntDef(stream.remainder, 0))
                } else if (UNRESOLVED.pos("TRIANGLE", uppercase(fieldType)) > 0) {
                    this.addTriangleString(stream)
                } else if (UNRESOLVED.pos("NAME", uppercase(fieldType)) > 0) {
                    this.setName(stream.remainder)
                } else {
                    break
                }
            }
            this.adjustForOrigin()
            if (UNRESOLVED.pos(uppercase(kEndTdoString), uppercase(inputLine)) <= 0) {
                throw new GeneralException.create("Problem: Expected end of 3D object.")
            }
        } finally {
            stream.free
        }
        return readingMemoLine
    }
    
    readFromInputString(aString: string, doAdjustForOrigin: boolean): void {
        let part: string
        let firstLetter: string
        let stream: KfStringStream
        let partStream: KfStringStream
        
        // format is n[name],p[# # #],p[# # #],p[# # #],t[# # #],t[# # #],t[# # #] 
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles.clear()
        stream = usstream.KfStringStream.create
        partStream = usstream.KfStringStream.create
        try {
            stream.onStringSeparator(aString, ",")
            part = "none"
            while (part !== "") {
                part = stream.nextToken()
                firstLetter = UNRESOLVED.copy(part, 1, 1)
                if (uppercase(firstLetter) === "N") {
                    this.setName(betweenBrackets(part))
                } else if (uppercase(firstLetter) === "P") {
                    partStream.onStringSeparator(betweenBrackets(part), " ")
                    this.addPointString(partStream)
                } else if (uppercase(firstLetter) === "T") {
                    partStream.onStringSeparator(betweenBrackets(part), " ")
                    this.addTriangleString(partStream)
                }
            }
            if (doAdjustForOrigin) {
                this.adjustForOrigin()
            }
        } finally {
            stream.free
            partStream.free
        }
    }
    
    // ------------------------------------------------------------------------- data transfer for binary copy 
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = uclasses.kKfObject3D
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        let i: short
        let tempPoint: KfPoint3d
        
        PdStreamableObject.prototype.streamDataWithFiler.call(this, filer, cvir)
        this.name = filer.streamShortString(this.name)
        this.pointsInUse = filer.streamLongint(this.pointsInUse)
        this.originPointIndex = filer.streamLongint(this.originPointIndex)
        this.ensureEnoughSpaceForNewPointData(this.pointsInUse)
        if (this.pointsInUse > 0) {
            for (i = 0; i <= this.pointsInUse - 1; i++) {
                if (filer.isWriting()) {
                    tempPoint = this.points[i]
                }
                tempPoint = filer.streamBytes(tempPoint, FIX_sizeof(tempPoint))
                if (filer.isReading()) {
                    this.points[i] = tempPoint
                }
            }
        }
        if (filer.isReading()) {
            //may have triangles already, because we are keeping them around now
            this.triangles.clear()
        }
        this.triangles.streamUsingFiler(filer, KfIndexTriangle)
    }
    
    totalMemorySize(): long {
        let result = 0
        let i: long
        
        result = this.instanceSize
        result = result + this.triangles.instanceSize
        if (this.triangles.Count > 0) {
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                result = result + KfIndexTriangle(this.triangles.Items[i]).instanceSize
            }
        }
        result = result + this.pointsAllocated * FIX_sizeof(KfPoint3D)
        return result
    }
    
    writeToDXFFile(fileName: string, frontFaceColor: TColorRef, backFaceColor: TColorRef): void {
        let outputFile: TextFile
        let i: short
        let triangle: KfIndexTriangle
        let colorToDraw: TColorRef
        
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Rewrite(outputFile)
            writeln(outputFile, "0")
            writeln(outputFile, "SECTION")
            writeln(outputFile, "2")
            writeln(outputFile, "ENTITIES")
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles.Items[i])
                if (this.triangleIsBackFacing(triangle)) {
                    colorToDraw = backFaceColor
                } else {
                    colorToDraw = frontFaceColor
                }
                this.writeTriangleToDXFFIle(outputFile, this.points[triangle.pointIndexes[0] - 1], this.points[triangle.pointIndexes[1] - 1], this.points[triangle.pointIndexes[2] - 1], colorToDraw)
            }
            writeln(outputFile, "0")
            writeln(outputFile, "ENDSEC")
            writeln(outputFile, "0")
            writeln(outputFile, "EOF")
        } finally {
            CloseFile(outputFile)
        }
    }
    
    writeTriangleToDXFFIle(outputFile: TextFile, p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, color: TColorRef): void {
        writeln(outputFile, "0")
        writeln(outputFile, "3DFACE")
        writeln(outputFile, "8")
        writeln(outputFile, "3dObject")
        writeln(outputFile, "62")
        writeln(outputFile, IntToStr(color))
        // v1.60final changed intToStr(round(p|.|)) to digitValueString(p|.|)
        // can't see that there was ever any reason to round these; it's probably left over from
        // when I didn't understand DXF very well
        writeln(outputFile, "10")
        writeln(outputFile, usupport.digitValueString(p1.x))
        writeln(outputFile, "20")
        writeln(outputFile, usupport.digitValueString(-p1.y))
        writeln(outputFile, "30")
        writeln(outputFile, usupport.digitValueString(p1.z))
        writeln(outputFile, "11")
        writeln(outputFile, usupport.digitValueString(p2.x))
        writeln(outputFile, "21")
        writeln(outputFile, usupport.digitValueString(-p2.y))
        writeln(outputFile, "31")
        writeln(outputFile, usupport.digitValueString(p2.z))
        writeln(outputFile, "12")
        writeln(outputFile, usupport.digitValueString(p3.x))
        writeln(outputFile, "22")
        writeln(outputFile, usupport.digitValueString(-p3.y))
        writeln(outputFile, "32")
        writeln(outputFile, usupport.digitValueString(p3.z))
        writeln(outputFile, "13")
        writeln(outputFile, usupport.digitValueString(p3.x))
        writeln(outputFile, "23")
        writeln(outputFile, usupport.digitValueString(-p3.y))
        writeln(outputFile, "33")
        writeln(outputFile, usupport.digitValueString(p3.z))
    }
    
    writeToPOV_INCFile(fileName: string, frontFaceColor: TColorRef, embeddedInPlant: boolean, rotateCount: int): void {
        let outputFile: TextFile
        let i: short
        let triangle: KfIndexTriangle
        let colorToDraw: TColorRef
        let nameString: string
        
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Rewrite(outputFile)
            nameString = usupport.replacePunctuationWithUnderscores(this.getName())
            writeln(outputFile, "// POV-format INC file of PlantStudio v1.x 3D object")
            writeln(outputFile, "//     \"" + this.getName() + "\"")
            if ((!embeddedInPlant)) {
                writeln(outputFile, "// include this file in a POV file thus to use it:")
                writeln(outputFile, "//     #include \"" + usupport.stringUpTo(ExtractFileName(fileName), ".") + ".inc\"")
                writeln(outputFile, "//     object { " + nameString + " }")
                if (rotateCount > 1) {
                    writeln(outputFile, "//  or")
                    writeln(outputFile, "//     object { " + nameString + "_rotated }")
                }
                writeln(outputFile)
            }
            writeln(outputFile, "#declare " + nameString + "=mesh {")
            for (i = 0; i <= this.triangles.Count - 1; i++) {
                triangle = KfIndexTriangle(this.triangles.Items[i])
                this.writeTriangleToPOV_INCFIle(outputFile, this.points[triangle.pointIndexes[0] - 1], this.points[triangle.pointIndexes[1] - 1], this.points[triangle.pointIndexes[2] - 1])
            }
            writeln(outputFile, chr(9) + "pigment { color rgb <" + usupport.digitValueString(UNRESOLVED.getRValue(frontFaceColor) / 256.0) + ", " + usupport.digitValueString(UNRESOLVED.getGValue(frontFaceColor) / 256.0) + ", " + usupport.digitValueString(UNRESOLVED.getBValue(frontFaceColor) / 256.0) + "> }")
            writeln(outputFile, "}")
            if (rotateCount > 1) {
                writeln(outputFile)
                writeln(outputFile, "#declare " + nameString + "_rotated=union {")
                writeln(outputFile, chr(9) + "object { " + nameString + " }")
                for (i = 1; i <= rotateCount - 1; i++) {
                    writeln(outputFile, chr(9) + "object { " + nameString + " rotate " + IntToStr(i) + "*365/" + IntToStr(rotateCount) + "*y }")
                }
                writeln(outputFile, "}")
            }
        } finally {
            CloseFile(outputFile)
        }
    }
    
    writeTriangleToPOV_INCFIle(outputFile: TextFile, p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D): void {
        write(outputFile, chr(9) + "triangle { <")
        // all y values must be negative because it seems our coordinate systems are different
        write(outputFile, IntToStr(intround(p1.x)) + ", " + IntToStr(-intround(p1.y)) + ", " + IntToStr(intround(p1.z)) + ">, <")
        write(outputFile, IntToStr(intround(p2.x)) + ", " + IntToStr(-intround(p2.y)) + ", " + IntToStr(intround(p2.z)) + ">, <")
        writeln(outputFile, IntToStr(intround(p3.x)) + ", " + IntToStr(-intround(p3.y)) + ", " + IntToStr(intround(p3.z)) + "> }")
    }
    
    triangleIsBackFacing(aTriangle: KfIndexTriangle): boolean {
        let result = false
        let point0: KfPoint3d
        let point1: KfPoint3d
        let point2: KfPoint3d
        let backfacingResult: float
        
        result = false
        point0 = this.points[aTriangle.pointIndexes[0] - 1]
        point1 = this.points[aTriangle.pointIndexes[1] - 1]
        point2 = this.points[aTriangle.pointIndexes[2] - 1]
        backfacingResult = ((point1.x - point0.x) * (point2.y - point0.y)) - ((point1.y - point0.y) * (point2.x - point0.x))
        result = (backfacingResult < 0)
        return result
    }
    
}

// not using
//procedure KfObject3D.insertPoint(newPointIndex: smallint; newPoint: KfPoint3d);
//  var
//    i: smallint;
//  begin
//  inc(pointsInUse);
//  if newPointIndex <= pointsInUse - 1 then for i := newPointIndex to pointsInUse - 1 do
//    begin
//    self.changePointIndexInTriangles(i+1, i);
//    points[i+1] := points[i];
//    end;
//  points[newPointIndex] := newPoint;
//  end;
//
//
//    writeln(outputFile, '#declare camera_' + nameString + '= camera {');
//    writeln(outputFile, chr(9) + 'location  <0, 0, ' + intToStr(round(lowestZ)) + '>');
//    writeln(outputFile, chr(9) + 'look_at <'
//      + intToStr(round(totalX / (triangles.count * 3)))
//      + ', ' + intToStr(round(totalY / (triangles.count * 3)))
//      + ', ' + intToStr(round(totalZ / (triangles.count * 3))) + '>');
//    writeln(outputFile, chr(9) + 'angle 90');
//    writeln(outputFile, '}');
//    
