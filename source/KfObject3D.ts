// KfObject3D was unit Utdo

import { float, long, ColorDefs, int, IntToStr, short, StrToFloat, intround, arrayRemove, compareTextIgnoreCase, StrToIntDef, MessageDialog } from "./common"
import { PdStreamableObject, PdClassAndVersionInformationRecord, PdFiler, ExportFormats } from "./temporary";
import { KfPoint3D, KfPoint3D_matchXYZ, KfPoint3D_setXYZ, KfPoint3D_addPointToBoundsRect, KfPoint3D_subtract } from "./KfPoint3D";
import { KfIndexTriangle } from "./KfIndexTriangle";
import { KfTriangle } from "./KfTriangle";
import { TRect } from "./TRect";
import { TPoint } from "./TPoint";
import { KfTurtle } from "./KfTurtle";
import { KfStringStream } from "./KfStringStream";

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
export const kEmbeddedInPlant = true
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

// const
const kPointAllocationIncrement = 8


function betweenBrackets(aString: string): string {
    // lose letter and [ on front, lose ] on back 
    return aString.substring(2, aString.length - 2)
}

export class KfObject3D extends PdStreamableObject {
    points: KfPoint3D[] = [] // delphi_compatability.MaxListSize ??
    pointsInUse: long = 0
    pointsAllocated: long = 0
    originPointIndex: long = 0
    triangles: KfIndexTriangle[] = []
    name: string = ""
    originalIfCopy: KfObject3D | null = null
    inUse: boolean = false
    zForSorting: float = 0.0
    indexWhenRemoved: short = 0
    selectedIndexWhenRemoved: short = 0
    boundsRect: TRect = new TRect()
    
    // doesn't need to be streamed, only used while drawing

    ensureEnoughSpaceForNewPointData(totalNumberOfPointsToBeUsed: long): void {
        if (this.pointsAllocated >= totalNumberOfPointsToBeUsed) {
            return
        }
        while (this.points.length < totalNumberOfPointsToBeUsed) {
            this.points.push(new KfPoint3D())
        }
        this.pointsAllocated = totalNumberOfPointsToBeUsed
    }
    
    getPoint(index: int): KfPoint3D {
        return this.points[index]
    }
    
    setPoint(index: int, aPoint: KfPoint3D): void {
        if (this.points === null) {
            throw new Error("Problem: Nil pointer in method KfObject3D.setPoint.")
        }
        this.points[index] = aPoint
    }
    
    clear(): void {
        this.clearPoints()
        this.name = ""
    }
    
    clearPoints(): void {
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles = []
    }
    
    copyFrom(original: KfObject3D): void { 
        if (original === null) {
            return
        }
        this.setName(original.name)
        this.ensureEnoughSpaceForNewPointData(original.pointsInUse)
        if (original.pointsInUse > 0) {
            for (let i = 0; i < original.pointsInUse; i++) {
                this.points[i] = original.points[i]
            }
        }
        this.pointsInUse = original.pointsInUse
        this.originPointIndex = original.originPointIndex
        this.triangles = []
        if (original.triangles.length > 0) {
            for (let i = 0; i < original.triangles.length; i++) {
                const theTriangle: KfIndexTriangle = original.triangles[i]
                this.addTriangle(new KfIndexTriangle().createABC(theTriangle.pointIndexes[0], theTriangle.pointIndexes[1], theTriangle.pointIndexes[2]))
            }
        }
        this.inUse = original.inUse
    }
    
    isSameAs(other: KfObject3D): boolean { 
        // false if fails any test
        if (this.name !== other.name) {
            return false
        }
        if (this.pointsInUse !== other.pointsInUse) {
            return false
        }
        if (this.originPointIndex !== other.originPointIndex) {
            return false
        }
        if (this.triangles.length !== other.triangles.length) {
            return false
        }
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
                const thePoint = this.points[i]
                const otherPoint = other.points[i]
                if ((intround(thePoint.x) !== intround(otherPoint.x)) || (intround(thePoint.y) !== intround(otherPoint.y)) || (intround(thePoint.z) !== intround(otherPoint.z))) {
                    // round these because otherwise i/o inaccuracies could make a tdo seem different when it isn't,
                    // and most numbers are far enough to be integers anyway
                    return false
                }
            }
        }
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                const theTriangle = this.triangles[i]
                const otherTriangle = other.triangles[i]
                for (let j = 0; j <= 2; j++) {
                    if (theTriangle.pointIndexes[j] !== otherTriangle.pointIndexes[j]) {
                        return false
                    }
                }
            }
        }
        // passed all the tests
        return true
    }
    
    getName(): string {
        return this.name
    }
    
    setName(newName: string): void {
        // TODO: does name still have to be limited to 80 characters under JavaScript?
        this.name = newName.substring(0, 80)
    }
    
    addPoint(aPoint: KfPoint3D): short {
        // v2.0 removed this check
        // if pointsInUse >= kMaximumRecordedPoints then
        //  raise Exception.create('Problem: Too many points in 3D object.');
        this.ensureEnoughSpaceForNewPointData(this.pointsInUse + 1)
        this.points[this.pointsInUse] = aPoint
        this.pointsInUse += 1
        return this.pointsInUse
    }
    
    removePoint(point: short): void {
        if (point < this.pointsInUse - 1) {
            for (let i = point; i < this.pointsInUse - 1; i++) {
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
    
    addPointIfNoMatch(aPoint: KfPoint3D, matchDistance: float): short {
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
                if (KfPoint3D_matchXYZ(aPoint, this.points[i], matchDistance)) {
                    // add 1 because triangle indexes start at 1
                    return i + 1
                }
            }
        }
        return this.addPoint(aPoint)
    }
    
    // PDF FIX - may want to optimize this to use var to pass around result rather than assign
    pointForIndex(anIndex: long): KfPoint3D {
        let result = new KfPoint3D()
        if ((anIndex < 1) || (anIndex > this.pointsInUse)) {
            throw new Error("Problem: Point index out of range in method KfObject3D.pointForIndex.")
        }
        result = this.points[anIndex - 1]
        return result
    }
    
    addTriangle(aTriangle: KfIndexTriangle): void {
        this.triangles.push(aTriangle)
    }
    
    // TODO: Maybe rmeove triangleForIndex or at least adjust it to be zero-based index
    triangleForIndex(anIndex: long): KfIndexTriangle {
        if ((anIndex < 1) || (anIndex > this.triangles.length)) {
            throw new Error("Problem: Triangle index out of range in method KfObject3D.triangleForIndex.")
        }
        return this.triangles[anIndex - 1]
    }
    
    // adjust all points for origin, which is assumed to be at the first point
    // in terms of plant organs, this means the first point is
    // where the organ is attached to the plant
    adjustForOrigin(): void {
        let i: long
        let tempPoint: KfPoint3D
        
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
            for (i = 0; i < this.pointsInUse; i++) {
                if (i !== this.originPointIndex) {
                    tempPoint = this.points[i]
                    KfPoint3D_subtract(tempPoint, this.points[this.originPointIndex])
                    this.points[i] = tempPoint
                }
            }
        }
        // makes the first point zero
        tempPoint = this.points[this.originPointIndex]
        KfPoint3D_setXYZ(tempPoint, 0.0, 0.0, 0.0)
        this.points[this.originPointIndex] = tempPoint
    }
    
    setOriginPointIndex(newOriginPointIndex: int): void {
        const changed = (this.originPointIndex !== newOriginPointIndex)
        this.originPointIndex = newOriginPointIndex
        if (changed) {
            this.adjustForOrigin()
        }
    }
    
    makeMirrorTriangles(): void {
        this.adjustForOrigin()
        const triangleCountAtStart = this.triangles.length
        if (triangleCountAtStart > 0) {
            for (let i = 0; i < triangleCountAtStart; i++) {
                const triangle = this.triangles[i]
                const newPointIndexes: short[] = [0, 0, 0]
                for (let j = 0; j <= 2; j++) {
                    const aPoint = this.pointForIndex(triangle.pointIndexes[j])
                    aPoint.x = -1 * aPoint.x
                    newPointIndexes[j] = this.addPointIfNoMatch(aPoint, 1.0)
                }
                // reversing order of points makes triangle have correct facing for opposite side
                this.addTriangle(new KfIndexTriangle().createABC(newPointIndexes[2], newPointIndexes[1], newPointIndexes[0]))
            }
        }
    }
    
    reverseZValues(): void {
        let i: short
        let tempPoint: KfPoint3D
        
        this.adjustForOrigin()
        if (this.pointsInUse > 0) {
            for (i = 0; i < this.pointsInUse; i++) {
                tempPoint = this.points[i]
                tempPoint.z = -1 * tempPoint.z
                this.points[i] = tempPoint
            }
        }
    }
    
    bestPointForDrawingAtScale(turtle: KfTurtle, origin: TPoint, bitmapSize: TPoint, scale: float): TPoint {
        const result = new TPoint()
        
        this.boundsRect = new TRect(0, 0, 0, 0)
        turtle.reset()
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
                KfPoint3D_addPointToBoundsRect(this.boundsRect, turtle.transformAndRecord(this.points[i], scale))
            }
        }
        result.X = origin.X + bitmapSize.X / 2 - this.boundsRect.width / 2 - this.boundsRect.Left
        result.Y = origin.Y + bitmapSize.Y / 2 - this.boundsRect.height / 2 - this.boundsRect.Top
        return result
    }
    
    draw(turtle: KfTurtle, scale: float, longName: string, shortName: string, dxfIndex: short, partID: long): TRect {  
        let result = new TRect(0, 0, 0, 0)
        let minZ = 0
        this.zForSorting = 0

        if (turtle.ifExporting_exclude3DObject(scale)) {
            return result
        }
        turtle.clearRecording()
        this.boundsRect = new TRect(0, 0, 0, 0)
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
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
        } else if (this.triangles.length > 0) {
            for (let i = 1; i <= this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangleForIndex(i)
                const realTriangle: KfTriangle = turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[1], triangle.pointIndexes[2], partID)
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
    
    overlayBoundsRect(turtle: KfTurtle, scale: float): void {
        const oldSetting: boolean = turtle.drawingSurface.fillingTriangles
        turtle.drawingSurface.fillingTriangles = false
        turtle.drawTrianglesFromBoundsRect(this.boundsRect)
        turtle.drawingSurface.fillingTriangles = oldSetting
    }

    // TODO: Removed stub totalMemorySize
    totalMemorySize(): long {
        return 0
    }
    
    // TODO: Remove stub write3DExportElements
    write3DExportElements(turtle: KfTurtle, scale: float, partID: short): void {
    }

    /* TODO: Implement write3DExportElements

    write3DExportElements(turtle: KfTurtle, scale: float, partID: short): void {
        let fileExportSurface: KfFileExportSurface
        let triangle: KfIndexTriangle
        let firstPtIndex: long
        
        // do NOT pass the array on because a tdo could be really big
        // some write out lists of points then triangles; some draw each triangle
        fileExportSurface = turtle.fileExportSurface()
        if (fileExportSurface === null) {
            throw new Error("Problem: No 3D drawing surface in method KfObject3D.write3DExportElements.")
        }
        switch (turtle.writingTo) {
            case ExportFormats.k3DS:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (let i = 0; i < this.pointsInUse; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (let i = 1; i <= this.triangles.length; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case ExportFormats.kOBJ:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (let i = 0; i < this.pointsInUse; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (let i = 1; i <= this.triangles.length; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case ExportFormats.kVRML:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (let i = 0; i < this.pointsInUse; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (let i = 1; i <= this.triangles.length; i++) {
                    triangle = this.triangleForIndex(i)
                    fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[1] - 1, firstPtIndex + triangle.pointIndexes[2] - 1)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        fileExportSurface.addTriangle(firstPtIndex + triangle.pointIndexes[0] - 1, firstPtIndex + triangle.pointIndexes[2] - 1, firstPtIndex + triangle.pointIndexes[1] - 1)
                    }
                }
                fileExportSurface.endVerticesAndTriangles()
                // PDF PORT -- added semicolon
                break
            case ExportFormats.kLWO:
                fileExportSurface.startVerticesAndTriangles()
                if (turtle.writingToLWO()) {
                    firstPtIndex = fileExportSurface.numPoints
                } else {
                    firstPtIndex = 0
                }
                if (this.pointsInUse > 0) {
                    for (let i = 0; i < this.pointsInUse; i++) {
                        fileExportSurface.addPoint(turtle.transformAndRecord(this.points[i], scale))
                    }
                }
                for (let i = 1; i <= this.triangles.length; i++) {
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
                for (let i = 1; i <= this.triangles.length; i++) {
                    triangle = this.triangleForIndex(i)
                    turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[1], triangle.pointIndexes[2], partID)
                    if (fileExportSurface.options.makeTrianglesDoubleSided) {
                        turtle.drawTriangleFromIndexes(triangle.pointIndexes[0], triangle.pointIndexes[2], triangle.pointIndexes[1], partID)
                    }
                }
                break
            }
    }
    
    */

    addTriangleWithVerticesABC(a: long, b: long, c: long): void {
        this.addTriangle(new KfIndexTriangle().createABC(a, b, c))
    }
    
    removeTriangle(aTriangle: KfIndexTriangle): void {
        arrayRemove(this.triangles, aTriangle)
        this.removePointsNotInUse()
    }
    
    removePointsNotInUse(): void {
        if (this.pointsInUse <= 0) {
            return
        }
        let done = false
        while (!done) {
            let pointToRemove = -1
            for (let i = 0; i < this.pointsInUse; i++) {
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
        // triangle indexes start at 1, not 0 
        const adjustedPoint = point + 1
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
                for (let j = 0; j <= 2; j++) {
                    if (triangle.pointIndexes[j] === adjustedPoint) {
                        return true
                    }
                }
            }
        }
        return false
    }
    
    deletePointIndexInTriangles(oldPointIndex: short): void { 
        // triangle indexes start at 1, not 0 
        const adjustedOldPointIndex = oldPointIndex + 1
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
                for (let j = 0; j <= 2; j++) {
                    if (triangle.pointIndexes[j] > adjustedOldPointIndex) {
                        triangle.pointIndexes[j] = triangle.pointIndexes[j] - 1
                    }
                }
            }
        }
    }
    
    // parse string into xyz positions and add point to collection
    addPointString(stream: KfStringStream): void {
        let aPoint3D: KfPoint3D = new KfPoint3D()
        const x: int = stream.nextInteger()
        const y: int = stream.nextInteger()
        const z: int = stream.nextInteger()
        KfPoint3D_setXYZ(aPoint3D, x, y, z)
        this.addPoint(aPoint3D)
    }
    
    // parse string into three point indexes and add triangle to collection
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
            // TODO: Fix MessageDialog parameters
            MessageDialog("Bad triangle: " + IntToStr(p1) + " " + IntToStr(p2) + " " + IntToStr(p3) + ". Point indexes must be between 1 and " + IntToStr(this.pointsInUse) + ".", "delphi_compatability.TMsgDlgType.mtError", { mbOK: true }, 0)
        } else {
            this.addTriangle(new KfIndexTriangle().createABC(p1, p2, p3))
        }
    }
    
    /* TODO: Make import/export for for KfObject3D

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
        aMemo.Lines.Add("  " + kStartTdoString)
        aMemo.Lines.Add("  Name=" + this.getName())
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
                aMemo.Lines.Add("  Point=" + IntToStr(intround(this.points[i].x)) + " " + IntToStr(intround(this.points[i].y)) + " " + IntToStr(intround(this.points[i].z)))
            }
        }
        aMemo.Lines.Add("; Origin=" + IntToStr(this.originPointIndex))
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
                aMemo.Lines.Add("  Triangle=" + IntToStr(triangle.pointIndexes[0]) + " " + IntToStr(triangle.pointIndexes[1]) + " " + IntToStr(triangle.pointIndexes[2]))
            }
        }
        aMemo.Lines.Add("  " + kEndTdoString)
    }
    
    writeToFileStream(outputFile: TextFile, embeddedInPlant: boolean): void {
        if (embeddedInPlant) {
            writeln(outputFile, "  " + kStartTdoString)
        }
        if (embeddedInPlant) {
            write(outputFile, "  ")
        }
        writeln(outputFile, "Name=" + this.getName())
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
                writeln(outputFile, "  Point=" + IntToStr(intround(this.points[i].x)) + " " + IntToStr(intround(this.points[i].y)) + " " + IntToStr(intround(this.points[i].z)))
            }
        }
        writeln(outputFile, "; Origin=" + IntToStr(this.originPointIndex))
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
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
        this.triangles = []
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
                throw new Error("Problem: Expected start of 3D object.")
            }
        }
        stream = null
        try {
            // read info for 3D object from file at current position
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
                    // ignore old thing in brackets
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
                    throw new Error("Problem: Expected end of 3D object.")
                }
            }
        } finally {
            stream.free
        }
    }
    
    readFromDXFFile(inputFile: TextFile): void {
        let identifierLine: string
        let valueLine: string
        let newPoints: KfPoint3D[] = [new KfPoint3D(), new KfPoint3D(), new KfPoint3D()]
        let newTriangleIndexes: int[] = [0, 0, 0]
        let pointsRead: int
        
        this.pointsInUse = 0
        this.originPointIndex = 0
        pointsRead = 0
        this.triangles = []
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
                this.addTriangle(new KfIndexTriangle().createABC(newTriangleIndexes[0], newTriangleIndexes[1], newTriangleIndexes[2]))
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
    
    */

    readFromMemo(aMemo: string[], readingMemoLine: long): number {
        let stream: KfStringStream
        
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles = []
        let inputLine: string = aMemo[readingMemoLine]
        readingMemoLine += 1
        if (inputLine.trim() === "") {
            // cfk change v1.60final added '' case
            // skip commented lines 
            inputLine = aMemo[readingMemoLine]
            readingMemoLine += 1
        }
        // TODO: Seems like comparison with ORIGIN is unneeded here?
        if ((inputLine.substring(0, 1) === ";") && (!compareTextIgnoreCase("ORIGIN", inputLine))) {
            // cfk change for v1.6b2 mistake with origin, placed with comment
            // skip commented lines 
            inputLine = aMemo[readingMemoLine]
            readingMemoLine += 1
        }
        if (!compareTextIgnoreCase(kStartTdoString, inputLine)) {
            throw new Error("Problem: Expected start of 3D object." + "\nGot: " + inputLine)
        }

        // read info for 3D object from file at current position
        while (readingMemoLine < aMemo.length) {
            inputLine = aMemo[readingMemoLine]
            readingMemoLine += 1
            if (inputLine.trim() === "") {
                // cfk change v1.60final added '' case
                continue
            }
            // TODO: Seems like comparison with ORIGIN is unneeded here?
            if ((inputLine.substring(0, 1) === ";") && (!compareTextIgnoreCase("ORIGIN", inputLine))) {
                // cfk change for v1.6b2 mistake with origin, placed with comment
                // skip commented lines 
                continue
            }
            const stream = new KfStringStream(inputLine, "=")
            const fieldType: string = stream.nextToken()
            stream.spaceSeparator()
            if (compareTextIgnoreCase("POINT", fieldType)) {
                this.addPointString(stream)
            } else if (compareTextIgnoreCase("ORIGIN", fieldType)) {
                this.setOriginPointIndex(StrToIntDef(stream.remainder, 0))
            } else if (compareTextIgnoreCase("TRIANGLE", fieldType)) {
                this.addTriangleString(stream)
            } else if (compareTextIgnoreCase("NAME", fieldType)) {
                this.setName(stream.remainder)
            } else {
                break
            }
        }
        this.adjustForOrigin()
        if (!compareTextIgnoreCase(kEndTdoString, inputLine)) {
            throw new Error("Problem: Expected end of 3D object.")
        }
        
        return readingMemoLine
    }

    /*
    
    readFromInputString(aString: string, doAdjustForOrigin: boolean): void {
        let part: string
        let firstLetter: string
        let stream: KfStringStream
        let partStream: KfStringStream
        
        // format is n[name],p[# # #],p[# # #],p[# # #],t[# # #],t[# # #],t[# # #] 
        this.pointsInUse = 0
        this.originPointIndex = 0
        this.triangles = []
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
        cvir.classNumber = ClassId.kKfObject3D
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        let tempPoint: KfPoint3D = new KfPoint3D()
        
        PdStreamableObject.prototype.streamDataWithFiler.call(this, filer, cvir)
        this.name = filer.streamShortString(this.name)
        this.pointsInUse = filer.streamLongint(this.pointsInUse)
        this.originPointIndex = filer.streamLongint(this.originPointIndex)
        this.ensureEnoughSpaceForNewPointData(this.pointsInUse)
        if (this.pointsInUse > 0) {
            for (let i = 0; i < this.pointsInUse; i++) {
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
            // may have triangles already, because we are keeping them around now
            this.triangles = []
        }
        this.triangles.streamUsingFiler(filer, KfIndexTriangle)
    }
    
    totalMemorySize(): long {
        let result = 0

        result = this.instanceSize
        result = result + this.triangles.instanceSize
        if (this.triangles.length > 0) {
            for (let i = 0; i < this.triangles.length; i++) {
                result = result + this.triangles[i].instanceSize
            }
        }
        result = result + this.pointsAllocated * FIX_sizeof(KfPoint3D)
        return result
    }
    
    writeToDXFFile(fileName: string, frontFaceColor: TColorRef, backFaceColor: TColorRef): void {
        let outputFile: TextFile
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
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
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
            for (let i = 0; i < this.triangles.length; i++) {
                const triangle: KfIndexTriangle = this.triangles[i]
                this.writeTriangleToPOV_INCFile(outputFile, this.points[triangle.pointIndexes[0] - 1], this.points[triangle.pointIndexes[1] - 1], this.points[triangle.pointIndexes[2] - 1])
            }
            writeln(outputFile, chr(9) + "pigment { color rgb <" + usupport.digitValueString(UNRESOLVED.getRValue(frontFaceColor) / 256.0) + ", " + usupport.digitValueString(UNRESOLVED.getGValue(frontFaceColor) / 256.0) + ", " + usupport.digitValueString(UNRESOLVED.getBValue(frontFaceColor) / 256.0) + "> }")
            writeln(outputFile, "}")
            if (rotateCount > 1) {
                writeln(outputFile)
                writeln(outputFile, "#declare " + nameString + "_rotated=union {")
                writeln(outputFile, chr(9) + "object { " + nameString + " }")
                for (let i = 1; i < rotateCount; i++) {
                    writeln(outputFile, chr(9) + "object { " + nameString + " rotate " + IntToStr(i) + "*365/" + IntToStr(rotateCount) + "*y }")
                }
                writeln(outputFile, "}")
            }
        } finally {
            CloseFile(outputFile)
        }
    }
    
    writeTriangleToPOV_INCFile(outputFile: TextFile, p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D): void {
        write(outputFile, chr(9) + "triangle { <")
        // all y values must be negative because it seems our coordinate systems are different
        write(outputFile, IntToStr(intround(p1.x)) + ", " + IntToStr(-intround(p1.y)) + ", " + IntToStr(intround(p1.z)) + ">, <")
        write(outputFile, IntToStr(intround(p2.x)) + ", " + IntToStr(-intround(p2.y)) + ", " + IntToStr(intround(p2.z)) + ">, <")
        writeln(outputFile, IntToStr(intround(p3.x)) + ", " + IntToStr(-intround(p3.y)) + ", " + IntToStr(intround(p3.z)) + "> }")
    }
    
    triangleIsBackFacing(aTriangle: KfIndexTriangle): boolean {
        let result = false
        let point0: KfPoint3D
        let point1: KfPoint3D
        let point2: KfPoint3D
        let backfacingResult: float
        
        result = false
        point0 = this.points[aTriangle.pointIndexes[0] - 1]
        point1 = this.points[aTriangle.pointIndexes[1] - 1]
        point2 = this.points[aTriangle.pointIndexes[2] - 1]
        backfacingResult = ((point1.x - point0.x) * (point2.y - point0.y)) - ((point1.y - point0.y) * (point2.x - point0.x))
        result = (backfacingResult < 0)
        return result
    }

    */
    
}

// not using
// procedure KfObject3D.insertPoint(newPointIndex: smallint; newPoint: KfPoint3D);
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
