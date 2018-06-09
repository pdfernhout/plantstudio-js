// unit updcom

from conversion_common import *
import utimeser
import umath
import ucursor
import ubreedr
import umain
import uplantmn
import uamendmt
import u3dexport
import uturtle
import udomain
import ubrstrat
import ugener
import utdo
import uplant
import uparams
import ucommand
import usupport
import ucollect
import delphi_compatability

// const
const kRotateNotInitialized = 0
const kRotateX = 1
const kRotateY = 2
const kRotateZ = 3
const kCopyToClipboard = true
const kDontCopyToClipboard = false
const kNewPlantAge = 5
const kNewPlantPosition = 100
const kHide = true
const kShow = false
const kSendBackward = true
const kBringForward = false
const kPasteMoveDistance = 40
const kCreateFirstGeneration = true
const kDontCreateFirstGeneration = false
const kAddAtEnd = -1
const kUp = 0
const kDown = 1
const kLeft = 2
const kRight = 3
const kChangeWidth = true
const kChangeHeight = false


// var
let numPlantsCreatedThisSession: long


// ------------------------------------------------------------------------ local functions 
function plantNamesForDescription(aList: TList): string {
    let result = ""
    let firstPlant: PdPlant
    
    result = ""
    if ((aList === null) || (aList.Count <= 0)) {
        return result
    }
    firstPlant = uplant.PdPlant(aList.Items[0])
    if (firstPlant !== null) {
        result = " plant \"" + firstPlant.getName() + "\""
        if (aList.Count > 1) {
            result = result + ", others"
        }
    }
    return result
}

// const
const kGapBetweenArrangedPlants = 5


function nameForDirection(direction: short): string {
    let result = ""
    result = ""
    switch (direction) {
        case kRotateX:
            result = "X"
            break
        case kRotateY:
            result = "Y"
            break
        case kRotateZ:
            result = "Z"
            break
    }
    return result
}


// value classes to save information about each plant in list 
export class PdBooleanValue {
    saveBoolean: boolean = false
    
    // ------------------------------------------------------------------------ value objects 
    createWithBoolean(aBoolean: boolean): void {
        this.saveBoolean = aBoolean
    }
    
}

export class PdPointValue {
    savePoint: TPoint = new TPoint()
    
    createWithPoint(aPoint: TPoint): void {
        this.savePoint = aPoint
    }
    
}

export class PdSingleValue {
    saveSingle: float = 0.0
    
    createWithSingle(aSingle: float): void {
        this.saveSingle = aSingle
    }
    
}

export class PdSinglePointValue {
    x: float = 0.0
    y: float = 0.0
    
    createWithSingleXY(anX: float, aY: float): void {
        this.x = anX
        this.y = aY
    }
    
}

export class PdXYZValue {
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    
    createWithXYZ(anX: float, aY: float, aZ: float): void {
        this.x = anX
        this.y = aY
        this.z = aZ
    }
    
}

export class PdSmallintValue {
    saveSmallint: short = 0
    
    createWithSmallint(aSmallint: short): void {
        this.saveSmallint = aSmallint
    }
    
}

export class PdLongintValue {
    saveLongint: long = 0
    
    createWithLongint(aLongint: long): void {
        this.saveLongint = aLongint
    }
    
}

export class PdColorValue {
    saveColor: TColorRef = new TColorRef()
    
    createWithColor(aColor: TColorRef): void {
        this.saveColor = aColor
    }
    
}

// -------------------------------------- commands that affect only the drawing area (and domain options) 
export class PdScrollCommand {
    dragStartPoint: TPoint = new TPoint()
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffSet_mm: SinglePoint = new SinglePoint()
    PdScrollCommand.prototype = new PdCommand()
    PdScrollCommand.prototype.constructor = PdScrollCommand
    
    // ------------------------------------------------------------ PdScrollCommand 
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
            this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
            if (mouseDidMove) {
                this.newOffSet_mm.x = this.oldOffset_mm.x + (nextPoint.X - this.dragStartPoint.X) / udomain.domain.plantDrawScale_PixelsPerMm()
                this.newOffSet_mm.y = this.oldOffset_mm.y + (nextPoint.Y - this.dragStartPoint.Y) / udomain.domain.plantDrawScale_PixelsPerMm()
                udomain.domain.plantManager.plantDrawOffset_mm = this.newOffSet_mm
                umain.MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
                umain.MainForm.invalidateEntireDrawing()
            }
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
        }
        return result
    }
    
    // PdDragCommand.doCommand should do nothing
    redoCommand(): void {
        //not redo
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.plantManager.plantDrawOffset_mm = this.newOffSet_mm
        umain.MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
        umain.MainForm.invalidateEntireDrawing()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        umain.MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
        umain.MainForm.invalidateEntireDrawing()
    }
    
    description(): string {
        let result = ""
        result = "scroll in main window"
        return result
    }
    
}

export class PdChangeMagnificationCommand {
    startDragPoint: TPoint = new TPoint()
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    clickPoint: SinglePoint = new SinglePoint()
    shift: boolean = false
    PdChangeMagnificationCommand.prototype = new PdCommand()
    PdChangeMagnificationCommand.prototype.constructor = PdChangeMagnificationCommand
    
    // -------------------------------------------------------- PdChangeMagnificationCommand 
    createWithNewScaleAndPoint(aNewScale: float, aPoint: TPoint): void {
        PdCommand.prototype.create.call(this)
        this.newScale_pixelsPerMm = aNewScale
        this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
        this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
        this.clickPoint.x = aPoint.X
        this.clickPoint.y = aPoint.Y
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        let size: TPoint
        let newScaleX: float
        let newScaleY: float
        
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            this.startDragPoint = nextPoint
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            size = Point(abs(nextPoint.X - this.startDragPoint.X), abs(this.startDragPoint.Y - nextPoint.Y))
            if ((size.X > 10) && (size.Y > 10)) {
                // have min size in case they move the mouse by mistake
                this.clickPoint.x = umath.min(nextPoint.X, this.startDragPoint.X) + abs(nextPoint.X - this.startDragPoint.X) / 2
                this.clickPoint.y = umath.min(nextPoint.Y, this.startDragPoint.Y) + abs(nextPoint.Y - this.startDragPoint.Y) / 2
                newScaleX = umath.safedivExcept(udomain.domain.plantDrawScale_PixelsPerMm() * umain.MainForm.drawingPaintBox.Width, size.X, 1.0)
                newScaleY = umath.safedivExcept(udomain.domain.plantDrawScale_PixelsPerMm() * umain.MainForm.drawingPaintBox.Height, size.Y, 1.0)
                this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
                this.newScale_pixelsPerMm = umath.min(newScaleX, newScaleY)
            } else {
                this.clickPoint.x = nextPoint.X
                this.clickPoint.y = nextPoint.Y
                this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
                if (this.shift) {
                    this.newScale_pixelsPerMm = this.oldScale_PixelsPerMm * 0.75
                } else {
                    this.newScale_pixelsPerMm = this.oldScale_PixelsPerMm * 1.5
                }
            }
        }
        return result
    }
    
    doCommand(): void {
        let clickTPoint: TPoint
        
        PdCommand.prototype.doCommand.call(this)
        if (this.newScale_pixelsPerMm !== 0.0) {
            clickTPoint.X = intround(this.clickPoint.x)
            clickTPoint.Y = intround(this.clickPoint.y)
            umain.MainForm.magnifyOrReduce(this.newScale_pixelsPerMm, clickTPoint, umain.kDrawNow)
        }
        this.newOffset_mm = udomain.domain.plantDrawOffset_mm()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        if (this.oldScale_PixelsPerMm !== 0.0) {
            umain.MainForm.magnifyOrReduce(this.oldScale_PixelsPerMm, Point(0, 0), umain.kDrawNow)
        }
    }
    
    description(): string {
        let result = ""
        if (this.newScale_pixelsPerMm > this.oldScale_PixelsPerMm) {
            result = "enlarge in main window"
        } else {
            result = "reduce in main window"
        }
        return result
    }
    
}

export class PdCenterDrawingCommand {
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    PdCenterDrawingCommand.prototype = new PdCommand()
    PdCenterDrawingCommand.prototype.constructor = PdCenterDrawingCommand
    
    // -------------------------------------------------------- PdCenterDrawingCommand 
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
        this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
        umain.MainForm.fitVisiblePlantsInDrawingArea(umain.kDrawNow, umain.kScaleAndMove, umain.kAlwaysMove)
        umain.MainForm.recalculateAllPlantBoundsRects(uplant.kDontDrawNow)
        this.newScale_pixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
        this.newOffset_mm = udomain.domain.plantDrawOffset_mm()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
        if (this.oldScale_PixelsPerMm !== 0.0) {
            umain.MainForm.magnifyOrReduce(this.oldScale_PixelsPerMm, Point(0, 0), umain.kDrawNow)
        }
    }
    
    redoCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.plantManager.plantDrawOffset_mm = this.newOffset_mm
        umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
        if (this.newScale_pixelsPerMm !== 0.0) {
            umain.MainForm.magnifyOrReduce(this.newScale_pixelsPerMm, Point(0, 0), umain.kDrawNow)
        }
    }
    
    description(): string {
        let result = ""
        result = "scale to fit in main window"
        return result
    }
    
}

export class PdChangeMainWindowOrientationCommand {
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    oldWindowOrientation: short = 0
    newWindowOrientation: short = 0
    PdChangeMainWindowOrientationCommand.prototype = new PdCommand()
    PdChangeMainWindowOrientationCommand.prototype.constructor = PdChangeMainWindowOrientationCommand
    
    // ------------------------------------------------------------ PdChangeMainWindowOrientationCommand 
    createWithNewOrientation(aNewOrientation: short): void {
        PdCommand.prototype.create.call(this)
        //hidden flag not saved
        this.commandChangesPlantFile = false
        this.newWindowOrientation = aNewOrientation
        this.oldWindowOrientation = udomain.domain.options.mainWindowOrientation
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            udomain.domain.options.mainWindowOrientation = this.newWindowOrientation
            umain.MainForm.updateForChangeToOrientation()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            udomain.domain.options.mainWindowOrientation = this.oldWindowOrientation
            umain.MainForm.updateForChangeToOrientation()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        let result = ""
        result = "change top/side orientation in main window"
        return result
    }
    
}

// ------------------------------------------------------------------ commands that affect only the domain 
export class PdChangeDomainOptionsCommand {
    oldOptions: DomainOptionsStructure = new DomainOptionsStructure()
    newOptions: DomainOptionsStructure = new DomainOptionsStructure()
    PdChangeDomainOptionsCommand.prototype = new PdCommand()
    PdChangeDomainOptionsCommand.prototype.constructor = PdChangeDomainOptionsCommand
    
    // -------------------------------------------------------- PdChangeDomainOptionsCommand 
    createWithOptions(aNewOptions: DomainOptionsStructure): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.newOptions = aNewOptions
        this.oldOptions = udomain.domain.options
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.options = this.newOptions
        umain.MainForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.options = this.oldOptions
        umain.MainForm.updateForChangeToDomainOptions()
    }
    
    description(): string {
        let result = ""
        result = "change preferences"
        return result
    }
    
}

export class PdChangeDomain3DOptionsCommand {
    outputType: short = 0
    oldOptions: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    newOptions: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    PdChangeDomain3DOptionsCommand.prototype = new PdCommand()
    PdChangeDomain3DOptionsCommand.prototype.constructor = PdChangeDomain3DOptionsCommand
    
    // -------------------------------------------------------- PdChangeDomain3DOptionsCommand 
    createWithOptionsAndType(aNewOptions: FileExport3DOptionsStructure, anOutputType: short): void {
        PdCommand.prototype.create.call(this)
        this.outputType = anOutputType
        this.commandChangesPlantFile = false
        this.newOptions = aNewOptions
        this.oldOptions = udomain.domain.exportOptionsFor3D[this.outputType]
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.exportOptionsFor3D[this.outputType] = this.newOptions
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.exportOptionsFor3D[this.outputType] = this.oldOptions
    }
    
    description(): string {
        let result = ""
        result = "change " + usupport.nameStringForFileType(u3dexport.fileTypeFor3DExportType(this.outputType)) + " output options"
        return result
    }
    
}

// ------------------------------------------------------------------- commands that affect one plant only 
export class PdRenameCommand {
    plant: PdPlant = new PdPlant()
    oldName: string = ""
    newName: string = ""
    PdRenameCommand.prototype = new PdCommand()
    PdRenameCommand.prototype.constructor = PdRenameCommand
    
    // ------------------------------------------------------------ PdRenameCommand 
    createWithPlantAndNewName(aPlant: PdPlant, aNewName: string): void {
        PdCommand.prototype.create.call(this)
        this.plant = aPlant
        this.oldName = this.plant.getName()
        this.newName = aNewName
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        this.plant.setName(this.newName)
        umain.MainForm.updateForRenamingPlant(this.plant)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        this.plant.setName(this.oldName)
        umain.MainForm.updateForRenamingPlant(this.plant)
    }
    
    description(): string {
        let result = ""
        result = "rename \"" + this.oldName + "\" to \"" + this.newName + "\""
        return result
    }
    
}

export class PdEditNoteCommand {
    plant: PdPlant = new PdPlant()
    oldStrings: TStringList = new TStringList()
    newStrings: TStringList = new TStringList()
    PdEditNoteCommand.prototype = new PdCommand()
    PdEditNoteCommand.prototype.constructor = PdEditNoteCommand
    
    // ------------------------------------------------------------ PdEditNoteCommand 
    createWithPlantAndNewTStrings(aPlant: PdPlant, aNewStrings: TStrings): void {
        PdCommand.prototype.create.call(this)
        this.plant = aPlant
        this.oldStrings = this.plant.noteLines
        // we take ownership of this list and delete it if undone
        this.newStrings = aNewStrings
    }
    
    destroy(): void {
        if (this.done) {
            this.oldStrings.free
            this.oldStrings = null
        } else {
            this.newStrings.free
            this.newStrings = null
        }
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        this.plant.noteLines = this.newStrings
        umain.MainForm.updateForChangeToPlantNote(this.plant)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        this.plant.noteLines = this.oldStrings
        umain.MainForm.updateForChangeToPlantNote(this.plant)
    }
    
    description(): string {
        let result = ""
        result = "change note for \"" + this.plant.getName() + "\""
        return result
    }
    
}

export class PdNewCommand {
    newPlant: PdPlant = new PdPlant()
    useWizardPlant: boolean = false
    wizardPlant: PdPlant = new PdPlant()
    oldSelectedList: TList = new TList()
    PdNewCommand.prototype = new PdCommand()
    PdNewCommand.prototype.constructor = PdNewCommand
    
    // v2.0
    // --------------------------------------------------------------------------------------------- PdNewCommand 
    createWithWizardPlantAndOldSelectedList(aPlant: PdPlant, anOldSelectedList: TList): void {
        let i: int
        
        PdCommand.prototype.create.call(this)
        this.useWizardPlant = true
        this.wizardPlant = aPlant
        // selected list is just pointers, this doesn't take control of them
        this.oldSelectedList = delphi_compatability.TList().Create()
        if ((anOldSelectedList !== null) && (anOldSelectedList.Count > 0)) {
            for (i = 0; i <= anOldSelectedList.Count - 1; i++) {
                this.oldSelectedList.Add(anOldSelectedList.Items[i])
            }
        }
    }
    
    destroy(): void {
        this.oldSelectedList.free
        this.oldSelectedList = null
        if ((!this.done) && (this.newPlant !== null)) {
            // free created plant if change was undone 
            this.newPlant.free
            this.newPlant = null
        }
        if ((this.useWizardPlant) && (this.wizardPlant !== null)) {
            this.wizardPlant.free
            this.wizardPlant = null
        }
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((!this.done) && (this.newPlant !== null)) {
            result += 1
        }
        if ((this.useWizardPlant) && (this.wizardPlant !== null)) {
            result += 1
        }
        return result
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        this.newPlant = uplant.PdPlant().create()
        try {
            ucursor.cursor_startWait()
            if ((this.useWizardPlant) && (this.wizardPlant !== null)) {
                this.wizardPlant.copyTo(this.newPlant)
            } else {
                this.newPlant.defaultAllParameters()
                this.newPlant.setName("New plant " + IntToStr(numPlantsCreatedThisSession + 1))
                numPlantsCreatedThisSession += 1
            }
            this.newPlant.randomize()
            this.newPlant.moveTo(umain.MainForm.standardPastePosition())
            this.newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
            this.newPlant.recalculateBounds(umain.kDrawNow)
            // put new plant at end of plant manager list 
            udomain.domain.plantManager.plants.Add(this.newPlant)
            // make new plant the only selected plant 
            umain.MainForm.deselectAllPlants()
            umain.MainForm.addSelectedPlant(this.newPlant, kAddAtEnd)
            umain.MainForm.updateForChangeToPlantList()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: int
        
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.plantManager.plants.Remove(this.newPlant)
        umain.MainForm.removeSelectedPlant(this.newPlant)
        if (this.oldSelectedList.Count > 0) {
            for (i = 0; i <= this.oldSelectedList.Count - 1; i++) {
                // put back selections from before new plant was added
                umain.MainForm.selectedPlants.Add(this.oldSelectedList.Items[i])
            }
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    redoCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        umain.MainForm.deselectAllPlants()
        udomain.domain.plantManager.plants.Add(this.newPlant)
        umain.MainForm.addSelectedPlant(this.newPlant, kAddAtEnd)
        umain.MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        let result = ""
        result = "create new plant"
        return result
    }
    
}

export class PdSendBackwardOrForwardCommand {
    backward: boolean = false
    PdSendBackwardOrForwardCommand.prototype = new PdCommand()
    PdSendBackwardOrForwardCommand.prototype.constructor = PdSendBackwardOrForwardCommand
    
    // ----------------------------------------------------------- PdSendBackwardOrForwardCommand 
    createWithBackwardOrForward(aBackward: boolean): void {
        PdCommand.prototype.create.call(this)
        this.backward = aBackward
    }
    
    doCommand(): void {
        if (this.backward) {
            // assumption here is that selected plants list doesn't change between this command and undo 
            umain.MainForm.moveSelectedPlantsDown()
        } else {
            umain.MainForm.moveSelectedPlantsUp()
        }
    }
    
    undoCommand(): void {
        if (this.backward) {
            umain.MainForm.moveSelectedPlantsUp()
        } else {
            umain.MainForm.moveSelectedPlantsDown()
        }
    }
    
    description(): string {
        let result = ""
        if (this.backward) {
            result = "send backward in main window"
        } else {
            result = "bring forward in main window"
        }
        return result
    }
    
}

export class PdCreateAmendmentCommand {
    plant: PdPlant = new PdPlant()
    newAmendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    PdCreateAmendmentCommand.prototype = new PdCommand()
    PdCreateAmendmentCommand.prototype.constructor = PdCreateAmendmentCommand
    
    // ------------------------------------------------------------ PdCreateAmendmentCommand 
    createWithPlantAndAmendment(aPlant: PdPlant, aNewAmendment: PdPlantDrawingAmendment): void {
        PdCommand.prototype.create.call(this)
        this.plant = aPlant
        if (aNewAmendment === null) {
            throw new GeneralException.create("Problem: Nil new amendment; in PdCreateAmendmentCommand.createWithPlantAndAmendment.")
        }
        // we take ownership of this and delete it if undone
        this.newAmendment = aNewAmendment
    }
    
    destroy(): void {
        if (!this.done) {
            this.newAmendment.free
            this.newAmendment = null
        }
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.addAmendment(this.newAmendment)
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.addAmendedPartToList(this.newAmendment.partID, this.newAmendment.typeOfPart)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.newAmendment)
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.removeAmendedPartFromList(this.newAmendment.partID, this.newAmendment.typeOfPart)
    }
    
    description(): string {
        let result = ""
        result = "pose part " + IntToStr(this.newAmendment.partID) + " in plant \"" + this.plant.getName() + "\""
        return result
    }
    
}

export class PdDeleteAmendmentCommand {
    plant: PdPlant = new PdPlant()
    amendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    PdDeleteAmendmentCommand.prototype = new PdCommand()
    PdDeleteAmendmentCommand.prototype.constructor = PdDeleteAmendmentCommand
    
    // ------------------------------------------------------------ PdDeleteAmendmentCommand 
    createWithPlantAndAmendment(aPlant: PdPlant, anAmendment: PdPlantDrawingAmendment): void {
        PdCommand.prototype.create.call(this)
        this.plant = aPlant
        if (anAmendment === null) {
            throw new GeneralException.create("Problem: Nil amendment; in PdDeleteAmendmentCommand.createWithPlantAndAmendment.")
        }
        // we take ownership of this and delete it if done
        this.amendment = anAmendment
    }
    
    destroy(): void {
        if (this.done) {
            this.amendment.free
            this.amendment = null
        }
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.amendment)
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.removeAmendedPartFromList(this.amendment.partID, this.amendment.typeOfPart)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.addAmendment(this.amendment)
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.addAmendedPartToList(this.amendment.partID, this.amendment.typeOfPart)
    }
    
    description(): string {
        let result = ""
        result = "unpose part " + IntToStr(this.amendment.partID) + " in plant \"" + this.plant.getName() + "\""
        return result
    }
    
}

export class PdEditAmendmentCommand {
    plant: PdPlant = new PdPlant()
    field: string = ""
    oldAmendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    newAmendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    PdEditAmendmentCommand.prototype = new PdCommand()
    PdEditAmendmentCommand.prototype.constructor = PdEditAmendmentCommand
    
    // ------------------------------------------------------------ PdEditAmendmentCommand 
    createWithPlantAndAmendmentAndField(aPlant: PdPlant, aNewAmendment: PdPlantDrawingAmendment, aField: string): void {
        PdCommand.prototype.create.call(this)
        this.plant = aPlant
        this.field = aField
        if (aNewAmendment === null) {
            throw new GeneralException.create("nil new amendment")
        }
        // we take ownership of this and delete it if undone
        this.newAmendment = aNewAmendment
        this.oldAmendment = this.plant.amendmentForPartID(this.newAmendment.partID)
    }
    
    destroy(): void {
        if (this.done) {
            this.oldAmendment.free
            this.oldAmendment = null
        } else {
            this.newAmendment.free
            this.newAmendment = null
        }
    }
    
    doCommand(): void {
        let index: int
        let oldItemIndex: int
        
        PdCommand.prototype.doCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        if (this.oldAmendment !== null) {
            this.plant.removeAmendment(this.oldAmendment)
        }
        this.plant.addAmendment(this.newAmendment)
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.updatePoseInfo()
    }
    
    undoCommand(): void {
        let oldString: string
        let index: int
        let oldItemIndex: int
        
        PdCommand.prototype.undoCommand.call(this)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.newAmendment)
        if (this.oldAmendment !== null) {
            this.plant.addAmendment(this.oldAmendment)
        }
        this.plant.recalculateBounds(umain.kDrawNow)
        umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        umain.MainForm.updatePoseInfo()
    }
    
    description(): string {
        let result = ""
        let fullString: string
        
        if (this.field === "hide") {
            if (this.newAmendment.hide) {
                fullString = "hide"
            } else {
                fullString = "show"
            }
        } else if (this.field === "rotate") {
            if (this.newAmendment.addRotations) {
                fullString = "rotate"
            } else {
                fullString = "remove rotation for"
            }
        } else if (this.field === "scale") {
            if (this.newAmendment.multiplyScale) {
                fullString = "scale"
            } else {
                fullString = "remove scaling for"
            }
        } else if (this.field === "scale above") {
            if (this.newAmendment.propagateScale) {
                fullString = "scale-this-part-and-above"
            } else {
                fullString = "remove scale-this-part-and-above for"
            }
        } else {
            fullString = "change " + this.field + " for"
        }
        result = "posing: " + fullString + " part " + IntToStr(this.newAmendment.partID) + " in plant \"" + this.plant.getName() + "\""
        return result
    }
    
}

export class PdSelectPosingPartCommand {
    plant: PdPlant = new PdPlant()
    newPartID: long = 0
    oldPartID: long = 0
    oldPartType: string = ""
    newPartType: string = ""
    PdSelectPosingPartCommand.prototype = new PdCommand()
    PdSelectPosingPartCommand.prototype.constructor = PdSelectPosingPartCommand
    
    // ------------------------------------------------------------ PdSelectPosingPartCommand 
    createWithPlantAndPartIDsAndTypes(aPlant: PdPlant, aNewPartID: long, anOldPartID: long, aNewPartType: string, anOldPartType: string): void {
        let i: short
        
        PdCommand.prototype.create.call(this)
        // selected posed part not saved
        this.commandChangesPlantFile = false
        this.plant = aPlant
        this.newPartID = aNewPartID
        this.oldPartID = anOldPartID
        this.newPartType = aNewPartType
        this.oldPartType = anOldPartType
    }
    
    doCommand(): void {
        // selected posed part not saved
        this.commandChangesPlantFile = false
        PdCommand.prototype.doCommand.call(this)
        umain.MainForm.selectedPlantPartID = this.newPartID
        umain.MainForm.selectedPlantPartType = this.newPartType
        umain.MainForm.updatePosingForSelectedPlantPart()
        umain.MainForm.redrawFocusedPlantOnly(umain.kDrawNow)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        umain.MainForm.selectedPlantPartID = this.oldPartID
        umain.MainForm.selectedPlantPartType = this.oldPartType
        umain.MainForm.updatePosingForSelectedPlantPart()
        umain.MainForm.redrawFocusedPlantOnly(umain.kDrawNow)
    }
    
    description(): string {
        let result = ""
        if (this.newPartID < 0) {
            result = "deselect all parts of plant " + this.plant.getName()
        } else {
            result = "select part " + IntToStr(this.newPartID) + " of plant " + this.plant.getName()
        }
        return result
    }
    
}

// ---------------------------------- commands that affect a list of plants, usually in a minor way 
export class PdCommandWithListOfPlants {
    plantList: TList = new TList()
    values: TListCollection = new TListCollection()
    plant: PdPlant = new PdPlant()
    removesPlantAmendments: boolean = false
    listOfAmendmentLists: TList = new TList()
    PdCommandWithListOfPlants.prototype = new PdCommand()
    PdCommandWithListOfPlants.prototype.constructor = PdCommandWithListOfPlants
    
    //for temporary use
    // ------------------------------------------------------------ PdCommandWithListOfPlants 
    createWithListOfPlants(aList: TList): void {
        let i: short
        
        PdCommand.prototype.create.call(this)
        this.plantList = delphi_compatability.TList().Create()
        if (aList.Count > 0) {
            for (i = 0; i <= aList.Count - 1; i++) {
                this.plantList.Add(aList.Items[i])
            }
        }
        this.values = ucollect.TListCollection().Create()
        this.listOfAmendmentLists = null
    }
    
    setUpToRemoveAmendmentsWhenDone(): void {
        let i: int
        let j: int
        let plant: PdPlant
        let aList: TList
        
        // call this method after create method if the command should remove amendments
        this.removesPlantAmendments = true
        this.listOfAmendmentLists = delphi_compatability.TList().Create()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                plant = uplant.PdPlant(this.plantList.Items[i])
                aList = delphi_compatability.TList().Create()
                if (plant.amendments.Count > 0) {
                    for (j = 0; j <= plant.amendments.Count - 1; j++) {
                        aList.Add(uamendmt.PdPlantDrawingAmendment(plant.amendments.Items[j]))
                    }
                }
                this.listOfAmendmentLists.Add(aList)
            }
        }
    }
    
    destroy(): void {
        let i: int
        let j: int
        let amendment: PdPlantDrawingAmendment
        let aList: TList
        
        this.plantList.free
        this.plantList = null
        this.values.free
        this.values = null
        if ((this.done) && (this.removesPlantAmendments)) {
            if ((this.listOfAmendmentLists !== null) && (this.listOfAmendmentLists.Count > 0)) {
                for (i = 0; i <= this.listOfAmendmentLists.Count - 1; i++) {
                    aList = delphi_compatability.TList(this.listOfAmendmentLists.Items[i])
                    if (aList.Count > 0) {
                        for (j = 0; j <= aList.Count - 1; j++) {
                            amendment = uamendmt.PdPlantDrawingAmendment(aList.Items[j])
                            amendment.free
                        }
                    }
                    aList.free
                }
            }
        }
        this.listOfAmendmentLists.free
        this.listOfAmendmentLists = null
        PdCommand.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: int
        let atLeastOnePlantHadAmendments: boolean
        let aList: TList
        
        PdCommand.prototype.doCommand.call(this)
        if (!this.removesPlantAmendments) {
            return
        }
        atLeastOnePlantHadAmendments = false
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                aList = delphi_compatability.TList(this.listOfAmendmentLists.Items[i])
                if (aList.Count > 0) {
                    atLeastOnePlantHadAmendments = true
                    uplant.PdPlant(this.plantList.Items[i]).clearPointersToAllAmendments()
                }
            }
        }
        if (atLeastOnePlantHadAmendments) {
            umain.MainForm.updatePosingForFirstSelectedPlant()
        }
    }
    
    undoCommand(): void {
        let i: int
        let atLeastOnePlantHadAmendments: boolean
        let aList: TList
        
        PdCommand.prototype.undoCommand.call(this)
        if (!this.removesPlantAmendments) {
            return
        }
        atLeastOnePlantHadAmendments = false
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                aList = delphi_compatability.TList(this.listOfAmendmentLists.Items[i])
                if (aList.Count > 0) {
                    atLeastOnePlantHadAmendments = true
                    uplant.PdPlant(this.plantList.Items[i]).restoreAmendmentPointersToList(aList)
                }
            }
        }
        if (atLeastOnePlantHadAmendments) {
            umain.MainForm.updatePosingForFirstSelectedPlant()
        }
    }
    
    invalidateCombinedPlantRects(): void {
        let redrawRect: TRect
        let i: short
        
        redrawRect = delphi_compatability.Bounds(0, 0, 0, 0)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                delphi_compatability.UnionRect(redrawRect, redrawRect, uplant.PdPlant(this.plantList.Items[i]).boundsRect_pixels())
            }
        }
        umain.MainForm.invalidateDrawingRect(redrawRect)
    }
    
}

export class PdChangeSelectedPlantsCommand {
    newList: TList = new TList()
    PdChangeSelectedPlantsCommand.prototype = new PdCommandWithListOfPlants()
    PdChangeSelectedPlantsCommand.prototype.constructor = PdChangeSelectedPlantsCommand
    
    // ------------------------------------------------------------ PdChangeSelectedPlantsCommand 
    createWithOldListOFPlantsAndNewList(aList: TList, aNewList: TList): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        //which plants are selected not saved
        this.commandChangesPlantFile = false
        this.newList = delphi_compatability.TList().Create()
        if (aNewList.Count > 0) {
            for (i = 0; i <= aNewList.Count - 1; i++) {
                this.newList.Add(aNewList.Items[i])
            }
        }
    }
    
    destroy(): void {
        this.newList.free
        this.newList = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        //which plants are selected not saved
        this.commandChangesPlantFile = false
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        // MainForm.deselectAllPlants; // don't want this, it updates, and we will be updating soon
        umain.MainForm.selectedPlants.Clear()
        if (this.newList.Count > 0) {
            umain.MainForm.selectedPlants.Add(this.newList.Items[0])
            if (udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
                umain.MainForm.showOnePlantExclusively(umain.kDontDrawYet)
            } else {
                if (this.newList.Count > 1) {
                    for (i = 1; i <= this.newList.Count - 1; i++) {
                        umain.MainForm.selectedPlants.Add(this.newList.Items[i])
                    }
                }
            }
        }
        umain.MainForm.updateForChangeToPlantSelections()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        // MainForm.deselectAllPlants; // don't want this, it updates, and we will be updating soon
        umain.MainForm.selectedPlants.Clear()
        if (this.plantList.Count > 0) {
            umain.MainForm.selectedPlants.Add(this.plantList.Items[0])
            if (udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
                umain.MainForm.showOnePlantExclusively(umain.kDontDrawYet)
            } else {
                if (this.plantList.Count > 1) {
                    for (i = 1; i <= this.plantList.Count - 1; i++) {
                        umain.MainForm.selectedPlants.Add(this.plantList.Items[i])
                    }
                }
            }
        }
        umain.MainForm.updateForChangeToPlantSelections()
    }
    
    description(): string {
        let result = ""
        if (this.newList.Count <= 0) {
            result = "deselect all plants"
        } else {
            result = "select" + plantNamesForDescription(this.newList)
        }
        return result
    }
    
}

export class PdSelectOrDeselectAllCommand {
    deselect: boolean = false
    PdSelectOrDeselectAllCommand.prototype = new PdCommandWithListOfPlants()
    PdSelectOrDeselectAllCommand.prototype.constructor = PdSelectOrDeselectAllCommand
    
    // ------------------------------------------------------------ PdSelectOrDeselectAllCommand 
    doCommand(): void {
        let i: short
        
        //which plants are selected not saved
        this.commandChangesPlantFile = false
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.deselect) {
            // MainForm.deselectAllPlants;
            umain.MainForm.deselectAllPlants()
        } else {
            umain.MainForm.selectedPlants.Clear()
        }
        if (!this.deselect) {
            if (udomain.domain.plantManager.plants.Count > 0) {
                for (i = 0; i <= udomain.domain.plantManager.plants.Count - 1; i++) {
                    umain.MainForm.selectedPlants.Add(udomain.domain.plantManager.plants.Items[i])
                }
            }
        }
        umain.MainForm.updateForChangeToPlantSelections()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (!this.deselect) {
            // MainForm.deselectAllPlants;
            umain.MainForm.deselectAllPlants()
        } else {
            umain.MainForm.selectedPlants.Clear()
        }
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                umain.MainForm.selectedPlants.Add(this.plantList.Items[i])
            }
        }
        umain.MainForm.updateForChangeToPlantSelections()
    }
    
    description(): string {
        let result = ""
        if (this.deselect) {
            result = "deselect all plants"
        } else {
            result = "select all plants"
        }
        return result
    }
    
}

export class PdResizePlantsCommand {
    initialized: boolean = false
    doneInMouseCommand: boolean = false
    newValues: TListCollection = new TListCollection()
    oldSizes: TListCollection = new TListCollection()
    aspectRatios: TListCollection = new TListCollection()
    dragStartPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    multiplier: float = 0.0
    newValue: float = 0.0
    PdResizePlantsCommand.prototype = new PdCommandWithListOfPlants()
    PdResizePlantsCommand.prototype.constructor = PdResizePlantsCommand
    
    // ------------------------------------------------------------ PdResizePlantsCommand 
    createWithListOfPlants(aList: TList): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newValues = ucollect.TListCollection().Create()
        this.oldSizes = ucollect.TListCollection().Create()
        this.aspectRatios = ucollect.TListCollection().Create()
    }
    
    createWithListOfPlantsAndMultiplier(aList: TList, aMultiplier: float): void {
        this.createWithListOfPlants(aList)
        this.saveInitialValues()
        this.multiplier = aMultiplier
    }
    
    createWithListOfPlantsAndNewValue(aList: TList, aNewValue: float): void {
        this.createWithListOfPlants(aList)
        this.saveInitialValues()
        this.newValue = aNewValue
    }
    
    saveInitialValues(): void {
        let i: short
        let aspectRatio: float
        
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                if (usupport.rHeight(this.plant.boundsRect_pixels()) !== 0) {
                    aspectRatio = 1.0 * usupport.rWidth(this.plant.boundsRect_pixels()) / usupport.rHeight(this.plant.boundsRect_pixels())
                } else {
                    aspectRatio = 1.0
                }
                this.aspectRatios.Add(PdSingleValue().createWithSingle(aspectRatio))
                this.values.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                this.oldSizes.Add(PdPointValue().createWithPoint(Point(usupport.rWidth(this.plant.boundsRect_pixels()), usupport.rHeight(this.plant.boundsRect_pixels()))))
            }
        }
    }
    
    destroy(): void {
        this.newValues.free
        this.newValues = null
        this.oldSizes.free
        this.oldSizes = null
        this.aspectRatios.free
        this.aspectRatios = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
        } else if ((aTrackPhase === ucommand.TrackPhase.trackMove) && (mouseDidMove)) {
            if (!this.initialized) {
                this.saveInitialValues()
                this.initialized = true
                this.doneInMouseCommand = true
                this.offset = Point(0, 0)
                PdCommandWithListOfPlants.prototype.doCommand.call(this)
                return result
            }
            if (this.initialized) {
                this.offset.X = nextPoint.X - this.dragStartPoint.X
                this.offset.Y = nextPoint.Y - this.dragStartPoint.Y
                this.doCommand()
            }
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            if ((!mouseDidMove) || (!this.initialized)) {
                result = null
                this.free
            }
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        let newSize: TPoint
        let oldSize: TPoint
        let aspectRatio: float
        let oldScale: float
        
        if (!this.doneInMouseCommand) {
            PdCommandWithListOfPlants.prototype.doCommand.call(this)
        }
        if (this.plantList.Count <= 0) {
            return
        }
        if ((this.offset.X === 0) && (this.offset.Y === 0) && (this.multiplier === 0) && (this.newValue === 0)) {
            return
        }
        try {
            if (!this.doneInMouseCommand) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            this.newValues.clear()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    if (this.multiplier !== 0) {
                        this.plant.drawingScale_PixelsPerMm = this.plant.drawingScale_PixelsPerMm * this.multiplier
                    } else if (this.newValue !== 0) {
                        this.plant.drawingScale_PixelsPerMm = this.newValue
                    } else {
                        oldSize = PdPointValue(this.oldSizes.Items[i]).savePoint
                        aspectRatio = PdSingleValue(this.aspectRatios.Items[i]).saveSingle
                        oldScale = PdSingleValue(this.values.Items[i]).saveSingle
                        // 10 pixels is arbitrary minimum
                        newSize.Y = umath.intMax(10, oldSize.Y - this.offset.Y)
                        newSize.X = intround(newSize.Y * aspectRatio)
                        this.plant.calculateDrawingScaleToFitSize(newSize)
                        if ((this.plant.drawingScale_PixelsPerMm > oldScale) && (this.offset.Y > 0)) {
                            // this is to counteract a bug that when you resize down, it resizes up the first mouse move, then down
                            // can't figure out why, just putting in this ugly fix to stop it from doing that
                            this.plant.drawingScale_PixelsPerMm = oldScale
                        }
                    }
                    this.newValues.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            if (!this.doneInMouseCommand) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.values.Items[i]).saveSingle
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        let i: short
        
        if (!this.initialized) {
            return
        }
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.newValues.Items[i]).saveSingle
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        let result = ""
        result = "resize" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdResizePlantsToSameWidthOrHeightCommand {
    newValues: TListCollection = new TListCollection()
    oldSizes: TListCollection = new TListCollection()
    newWidth: float = 0.0
    newHeight: float = 0.0
    changeWidth: boolean = false
    PdResizePlantsToSameWidthOrHeightCommand.prototype = new PdCommandWithListOfPlants()
    PdResizePlantsToSameWidthOrHeightCommand.prototype.constructor = PdResizePlantsToSameWidthOrHeightCommand
    
    // ------------------------------------------------------------ PdResizePlantsToSameWidthOrHeightCommand 
    createWithListOfPlantsAndNewWidthOrHeight(aList: TList, aNewWidth: float, aNewHeight: float, aChangeWidth: boolean): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newValues = ucollect.TListCollection().Create()
        this.oldSizes = ucollect.TListCollection().Create()
        this.saveInitialValues()
        this.newWidth = aNewWidth
        this.newHeight = aNewHeight
        this.changeWidth = aChangeWidth
    }
    
    saveInitialValues(): void {
        let i: short
        
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                this.oldSizes.Add(PdPointValue().createWithPoint(Point(usupport.rWidth(this.plant.boundsRect_pixels()), usupport.rHeight(this.plant.boundsRect_pixels()))))
            }
        }
    }
    
    destroy(): void {
        this.newValues.free
        this.newValues = null
        this.oldSizes.free
        this.oldSizes = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        let newScaleX: float
        let newScaleY: float
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            this.newValues.clear()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.recalculateBounds(umain.kDontDrawYet)
                    if (this.changeWidth) {
                        this.plant.drawingScale_PixelsPerMm = umath.safedivExcept(this.plant.drawingScale_PixelsPerMm * this.newWidth, usupport.rWidth(this.plant.boundsRect_pixels()), 0.1)
                    } else {
                        this.plant.drawingScale_PixelsPerMm = umath.safedivExcept(this.plant.drawingScale_PixelsPerMm * this.newHeight, usupport.rHeight(this.plant.boundsRect_pixels()), 0.1)
                    }
                    this.newValues.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.values.Items[i]).saveSingle
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
    }
    
    redoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.newValues.Items[i]).saveSingle
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
    }
    
    description(): string {
        let result = ""
        result = "scale" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdPackPlantsCommand {
    newScales: TListCollection = new TListCollection()
    oldSizes: TListCollection = new TListCollection()
    newPoints: TListCollection = new TListCollection()
    oldPoints: TListCollection = new TListCollection()
    focusRect: TRect = new TRect()
    PdPackPlantsCommand.prototype = new PdCommandWithListOfPlants()
    PdPackPlantsCommand.prototype.constructor = PdPackPlantsCommand
    
    // ------------------------------------------------------------ PdPackPlantsCommand 
    createWithListOfPlantsAndFocusRect(aList: TList, aFocusRect: TRect): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newScales = ucollect.TListCollection().Create()
        this.oldSizes = ucollect.TListCollection().Create()
        this.newPoints = ucollect.TListCollection().Create()
        this.oldPoints = ucollect.TListCollection().Create()
        this.saveInitialValues()
        this.focusRect = aFocusRect
    }
    
    saveInitialValues(): void {
        let i: short
        
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                this.oldPoints.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
                this.oldSizes.Add(PdPointValue().createWithPoint(Point(usupport.rWidth(this.plant.boundsRect_pixels()), usupport.rHeight(this.plant.boundsRect_pixels()))))
            }
        }
    }
    
    destroy(): void {
        this.newScales.free
        this.newScales = null
        this.oldSizes.free
        this.oldSizes = null
        this.newPoints.free
        this.newPoints = null
        this.oldPoints.free
        this.oldPoints = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        let newScaleX: float
        let newScaleY: float
        let widestBox: int
        let tallestBox: int
        let tallestHeight: int
        let offset: TPoint
        let newPoint: TPoint
        let lastPlant: PdPlant
        let totalHeight: int
        let averageHeight: int
        let remainingX: int
        let plantScaleChanged: boolean
        let newScale: float
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        this.invalidateCombinedPlantRects()
        this.newScales.clear()
        this.newPoints.clear()
        lastPlant = null
        totalHeight = 0
        tallestHeight = 0
        try {
            ucursor.cursor_startWait()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    totalHeight = totalHeight + usupport.rHeight(this.plant.boundsRect_pixels())
                }
            }
            averageHeight = totalHeight / this.plantList.Count
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.recalculateBounds(umain.kDontDrawYet)
                    plantScaleChanged = false
                    // calculate new scale (resize based on average height)
                    newScale = umath.safedivExcept(this.plant.drawingScale_PixelsPerMm * averageHeight, usupport.rHeight(this.plant.boundsRect_pixels()) * 1.0, 0.1)
                    if (abs(newScale - this.plant.drawingScale_PixelsPerMm) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        plantScaleChanged = true
                        this.plant.drawingScale_PixelsPerMm = newScale
                        this.plant.recalculateBounds(umain.kDontDrawYet)
                    }
                    this.newScales.Add(PdSingleValue().createWithSingle(this.plant.drawingScale_PixelsPerMm))
                    // calculate new position
                    offset.X = this.plant.basePoint_pixels().X - this.plant.boundsRect_pixels().Left
                    offset.Y = this.plant.basePoint_pixels().Y - this.plant.boundsRect_pixels().Top
                    remainingX = usupport.rWidth(this.plant.boundsRect_pixels()) - offset.X
                    if ((i <= 0) || (lastPlant === null)) {
                        newPoint.X = offset.X + kGapBetweenArrangedPlants
                        newPoint.Y = offset.Y + kGapBetweenArrangedPlants
                    } else {
                        newPoint.X = lastPlant.boundsRect_pixels().Right + kGapBetweenArrangedPlants + offset.X
                        newPoint.Y = lastPlant.boundsRect_pixels().Top + offset.Y
                    }
                    if (newPoint.X + remainingX > umain.MainForm.drawingPaintBox.Width) {
                        newPoint.X = offset.X + kGapBetweenArrangedPlants
                        newPoint.Y = tallestHeight + kGapBetweenArrangedPlants + offset.Y
                    }
                    this.plant.moveTo(newPoint)
                    this.newPoints.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
                    if (plantScaleChanged) {
                        this.plant.recalculateBounds(umain.kDrawNow)
                    } else {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                    lastPlant = this.plant
                    if (this.plant.boundsRect_pixels().Bottom > tallestHeight) {
                        tallestHeight = this.plant.boundsRect_pixels().Bottom
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: short
        let oldScale: float
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    oldScale = this.plant.drawingScale_PixelsPerMm
                    this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.values.Items[i]).saveSingle
                    this.plant.moveTo(PdPointValue(this.oldPoints.Items[i]).savePoint)
                    if (abs(this.plant.drawingScale_PixelsPerMm - oldScale) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        this.plant.recalculateBounds(umain.kDrawNow)
                    } else {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        let i: short
        let oldScale: float
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    oldScale = this.plant.drawingScale_PixelsPerMm
                    this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.newScales.Items[i]).saveSingle
                    this.plant.moveTo(PdPointValue(this.newPoints.Items[i]).savePoint)
                    if (abs(this.plant.drawingScale_PixelsPerMm - oldScale) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        this.plant.recalculateBounds(umain.kDrawNow)
                    } else {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        let result = ""
        result = "pack" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeMainWindowViewingOptionCommand {
    selectedList: TList = new TList()
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    oldMainWindowViewingOption: short = 0
    newMainWindowViewingOption: short = 0
    PdChangeMainWindowViewingOptionCommand.prototype = new PdCommandWithListOfPlants()
    PdChangeMainWindowViewingOptionCommand.prototype.constructor = PdChangeMainWindowViewingOptionCommand
    
    // ------------------------------------------------------------ PdChangeMainWindowViewingOptionCommand 
    createWithListOfPlantsAndSelectedPlantsAndNewOption(aList: TList, aSelectedList: TList, aNewOption: short): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        //hidden flag not saved
        this.commandChangesPlantFile = false
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdBooleanValue().createWithBoolean(uplant.PdPlant(this.plantList.Items[i]).hidden))
            }
        }
        this.selectedList = delphi_compatability.TList().Create()
        if (aSelectedList.Count > 0) {
            for (i = 0; i <= aSelectedList.Count - 1; i++) {
                this.selectedList.Add(uplant.PdPlant(aSelectedList.Items[i]))
            }
        }
        this.oldMainWindowViewingOption = udomain.domain.options.mainWindowViewMode
        this.newMainWindowViewingOption = aNewOption
    }
    
    destroy(): void {
        this.selectedList.free
        this.selectedList = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            udomain.domain.options.mainWindowViewMode = this.newMainWindowViewingOption
            switch (this.newMainWindowViewingOption) {
                case udomain.kViewPlantsInMainWindowOneAtATime:
                    this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                    this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
                    umain.MainForm.deselectAllPlantsButFirst()
                    //hides all plants but first; calls fitVisiblePlantsInDrawingArea
                    umain.MainForm.showOnePlantExclusively(umain.kDontDrawYet)
                    umain.MainForm.recalculateSelectedPlantsBoundsRects(umain.kDrawNow)
                    umain.MainForm.invalidateEntireDrawing()
                    umain.MainForm.updateForChangeToPlantSelections()
                    this.newScale_pixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                    this.newOffset_mm = udomain.domain.plantDrawOffset_mm()
                    break
                case udomain.kViewPlantsInMainWindowFreeFloating:
                    this.oldScale_PixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                    this.oldOffset_mm = udomain.domain.plantDrawOffset_mm()
                    umain.MainForm.hideOrShowSomePlants(this.plantList, null, kShow, umain.kDontDrawYet)
                    umain.MainForm.fitVisiblePlantsInDrawingArea(umain.kDontDrawYet, umain.kScaleAndMove, umain.kAlwaysMove)
                    // first drawing gets correct bounds rects so numbers get counted for progress bar - messy
                    umain.MainForm.recalculateAllPlantBoundsRects(umain.kDontDrawYet)
                    umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
                    umain.MainForm.invalidateEntireDrawing()
                    this.newScale_pixelsPerMm = udomain.domain.plantDrawScale_PixelsPerMm()
                    this.newOffset_mm = udomain.domain.plantDrawOffset_mm()
                    break
            }
            umain.MainForm.updateMenusForChangeToViewingOption()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            udomain.domain.options.mainWindowViewMode = this.oldMainWindowViewingOption
            switch (this.newMainWindowViewingOption) {
                case udomain.kViewPlantsInMainWindowOneAtATime:
                    umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
                    umain.MainForm.invalidateSelectedPlantRectangles()
                    udomain.domain.plantManager.plantDrawScale_PixelsPerMm = this.oldScale_PixelsPerMm
                    udomain.domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
                    // restore original hidden flags - all plants 
                    //not used
                    umain.MainForm.hideOrShowSomePlants(this.plantList, this.values, false, umain.kDontDrawYet)
                    umain.MainForm.fitVisiblePlantsInDrawingArea(umain.kDontDrawYet, umain.kScaleAndMove, umain.kAlwaysMove)
                    umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
                    //MainForm.invalidateSelectedPlantRectangles;
                    umain.MainForm.invalidateEntireDrawing()
                    // restore original selection - selected plants only 
                    umain.MainForm.selectedPlants.Clear()
                    if (this.selectedList.Count > 0) {
                        for (i = 0; i <= this.selectedList.Count - 1; i++) {
                            umain.MainForm.selectedPlants.Add(uplant.PdPlant(this.selectedList.Items[i]))
                        }
                    }
                    umain.MainForm.updateForChangeToPlantSelections()
                    break
                case udomain.kViewPlantsInMainWindowFreeFloating:
                    udomain.domain.plantManager.plantDrawScale_PixelsPerMm = this.oldScale_PixelsPerMm
                    udomain.domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
                    // restore original hidden flags - all plants 
                    //not used
                    umain.MainForm.hideOrShowSomePlants(this.plantList, this.values, false, umain.kDontDrawYet)
                    umain.MainForm.fitVisiblePlantsInDrawingArea(umain.kDontDrawYet, umain.kScaleAndMove, umain.kAlwaysMove)
                    umain.MainForm.recalculateAllPlantBoundsRects(umain.kDrawNow)
                    //MainForm.invalidateSelectedPlantRectangles;
                    umain.MainForm.invalidateEntireDrawing()
                    umain.MainForm.updateForChangeToPlantSelections()
                    break
            }
            umain.MainForm.updateMenusForChangeToViewingOption()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        let result = ""
        result = "change view all/one option in main window"
        return result
    }
    
}

export class PdDragCommand {
    initialized: boolean = false
    doneInMouseCommand: boolean = false
    dragAllPlantsToOnePoint: boolean = false
    dragStartPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    newPoint: TPoint = new TPoint()
    PdDragCommand.prototype = new PdCommandWithListOfPlants()
    PdDragCommand.prototype.constructor = PdDragCommand
    
    // ------------------------------------------------------------ PdDragCommand 
    createWithListOfPlantsAndDragOffset(aList: TList, anOffset: TPoint): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
            }
        }
        this.offset = anOffset
        this.initialized = true
    }
    
    createWithListOfPlantsAndNewPoint(aList: TList, aNewPoint: TPoint): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.dragAllPlantsToOnePoint = true
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
            }
        }
        this.newPoint = aNewPoint
        this.initialized = true
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        let i: short
        
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
            if ((!this.initialized) && mouseDidMove) {
                if (this.plantList.Count > 0) {
                    for (i = 0; i <= this.plantList.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.plantList.Items[i])
                        this.values.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
                    }
                }
                this.initialized = true
                PdCommandWithListOfPlants.prototype.doCommand.call(this)
            }
            if (this.initialized) {
                this.offset.X = nextPoint.X - this.dragStartPoint.X
                this.offset.Y = nextPoint.Y - this.dragStartPoint.Y
                this.invalidateCombinedPlantRects()
                if (this.plantList.Count > 0) {
                    for (i = 0; i <= this.plantList.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.plantList.Items[i])
                        this.plant.moveTo(PdPointValue(this.values.Items[i]).savePoint)
                        this.plant.moveBy(this.offset)
                        if (udomain.domain.options.cachePlantBitmaps) {
                            this.plant.recalculateBoundsForOffsetChange()
                        }
                    }
                }
                umain.MainForm.updateForChangeToSelectedPlantsLocation()
                this.invalidateCombinedPlantRects()
                this.doneInMouseCommand = true
            }
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                result = null
                this.free
            }
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        
        if (this.doneInMouseCommand) {
            //only used if not done by mouse command-otherwise done in trackMouse
            return
        }
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.dragAllPlantsToOnePoint) {
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.moveTo(this.newPoint)
                    if (udomain.domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        } else {
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.moveBy(this.offset)
                    if (udomain.domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.moveTo(PdPointValue(this.values.Items[i]).savePoint)
                if (udomain.domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    redoCommand(): void {
        let i: short
        
        if (!this.initialized) {
            return
        }
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.dragAllPlantsToOnePoint) {
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.moveTo(this.newPoint)
                    if (udomain.domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        } else {
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.moveBy(this.offset)
                    if (udomain.domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        if (this.dragAllPlantsToOnePoint) {
            result = "make bouquet"
        } else {
            result = "drag" + plantNamesForDescription(this.plantList)
        }
        return result
    }
    
}

export class PdAlignPlantsCommand {
    newPoints: TListCollection = new TListCollection()
    focusRect: TRect = new TRect()
    alignDirection: short = 0
    PdAlignPlantsCommand.prototype = new PdCommandWithListOfPlants()
    PdAlignPlantsCommand.prototype.constructor = PdAlignPlantsCommand
    
    // ------------------------------------------------------------ PdAlignPlantsCommand 
    createWithListOfPlantsRectAndDirection(aList: TList, aRect: TRect, aDirection: short): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
            }
        }
        this.newPoints = ucollect.TListCollection().Create()
        this.focusRect = aRect
        this.alignDirection = aDirection
    }
    
    destroy(): void {
        this.newPoints.free
        this.newPoints = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        let newPoint: TPoint
        let offset: TPoint
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.newPoints.clear()
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                newPoint = this.plant.basePoint_pixels()
                offset.X = this.plant.basePoint_pixels().X - this.plant.boundsRect_pixels().Left
                offset.Y = this.plant.basePoint_pixels().Y - this.plant.boundsRect_pixels().Top
                switch (this.alignDirection) {
                    case kUp:
                        newPoint.Y = this.focusRect.Top + offset.Y
                        break
                    case kDown:
                        newPoint.Y = this.focusRect.Bottom - (usupport.rHeight(this.plant.boundsRect_pixels()) - offset.Y)
                        break
                    case kLeft:
                        newPoint.X = this.focusRect.Left + offset.X
                        break
                    case kRight:
                        newPoint.X = this.focusRect.Right - (usupport.rWidth(this.plant.boundsRect_pixels()) - offset.X)
                        break
                }
                this.plant.moveTo(newPoint)
                this.newPoints.Add(PdPointValue().createWithPoint(this.plant.basePoint_pixels()))
                if (udomain.domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.moveTo(PdPointValue(this.values.Items[i]).savePoint)
                if (udomain.domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    redoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.moveTo(PdPointValue(this.newPoints.Items[i]).savePoint)
                if (udomain.domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = "align" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdRotateCommand {
    rotateDirection: short = 0
    newRotation: float = 0.0
    offsetRotation: float = 0.0
    startDragPoint: TPoint = new TPoint()
    PdRotateCommand.prototype = new PdCommandWithListOfPlants()
    PdRotateCommand.prototype.constructor = PdRotateCommand
    
    // ------------------------------------------------------------ PdRotateCommand 
    createWithListOfPlantsDirectionAndNewRotation(aList: TList, aRotateDirection: short, aNewRotation: short): void {
        let i: short
        
        // create using this constructor if this is from clicking on a spinEdit 
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.rotateDirection = aRotateDirection
        this.newRotation = aNewRotation
        if (this.newRotation < -360) {
            this.newRotation = -360
        }
        if (this.newRotation > 360) {
            this.newRotation = 360
        }
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                switch (this.rotateDirection) {
                    case kRotateX:
                        this.values.Add(PdSingleValue().createWithSingle(this.plant.xRotation))
                        break
                    case kRotateY:
                        this.values.Add(PdSingleValue().createWithSingle(this.plant.yRotation))
                        break
                    case kRotateZ:
                        this.values.Add(PdSingleValue().createWithSingle(this.plant.zRotation))
                        break
                }
            }
        }
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        let i: short
        let newRotation: float
        
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            // assume that if this function is called, the command was not already initialized
            //    from clicking on a spinEdit, so we have no values and no rotateDirection 
            this.startDragPoint = nextPoint
            this.invalidateCombinedPlantRects()
            PdCommandWithListOfPlants.prototype.doCommand.call(this)
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
            if (this.rotateDirection === kRotateNotInitialized) {
                if (rightButtonDown) {
                    this.rotateDirection = kRotateZ
                } else if (abs(nextPoint.X - this.startDragPoint.X) > abs(nextPoint.Y - this.startDragPoint.Y)) {
                    this.rotateDirection = kRotateX
                } else {
                    this.rotateDirection = kRotateY
                }
                if (this.plantList.Count > 0) {
                    for (i = 0; i <= this.plantList.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.plantList.Items[i])
                        switch (this.rotateDirection) {
                            case kRotateX:
                                this.values.Add(PdSingleValue().createWithSingle(this.plant.xRotation))
                                break
                            case kRotateY:
                                this.values.Add(PdSingleValue().createWithSingle(this.plant.yRotation))
                                break
                            case kRotateZ:
                                this.values.Add(PdSingleValue().createWithSingle(this.plant.zRotation))
                                break
                        }
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            switch (this.rotateDirection) {
                case kRotateX:
                    this.offsetRotation = (nextPoint.X - this.startDragPoint.X) * 0.5
                    break
                case kRotateY:
                    this.offsetRotation = (nextPoint.Y - this.startDragPoint.Y) * 0.5
                    break
                case kRotateZ:
                    this.offsetRotation = (nextPoint.X - this.startDragPoint.X) * 0.5
                    break
            }
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    newRotation = PdSingleValue(this.values.Items[i]).saveSingle + this.offsetRotation
                    if (newRotation < -360) {
                        newRotation = 360 - (abs(newRotation) - 360)
                    }
                    if (newRotation > 360) {
                        newRotation = -360 + (newRotation - 360)
                    }
                    switch (this.rotateDirection) {
                        case kRotateX:
                            this.plant.xRotation = newRotation
                            break
                        case kRotateY:
                            this.plant.yRotation = newRotation
                            break
                        case kRotateZ:
                            this.plant.zRotation = newRotation
                            break
                    }
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToPlantRotations()
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                // if they just clicked, rotate ten degrees anyway
                this.invalidateCombinedPlantRects()
                if (this.plantList.Count > 0) {
                    for (i = 0; i <= this.plantList.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.plantList.Items[i])
                        this.values.Add(PdSingleValue().createWithSingle(this.plant.xRotation))
                    }
                }
                this.rotateDirection = kRotateX
                if (rightButtonDown) {
                    // v2.0 if they just clicked with the right mouse button, rotate -10 degrees
                    // v2.0 use the domain rotation increment instead of always 10 degrees
                    this.offsetRotation = -udomain.domain.options.rotationIncrement
                } else {
                    this.offsetRotation = udomain.domain.options.rotationIncrement
                }
                if (this.plantList.Count > 0) {
                    for (i = 0; i <= this.plantList.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.plantList.Items[i])
                        newRotation = PdSingleValue(this.values.Items[i]).saveSingle + this.offsetRotation
                        if (newRotation < -360) {
                            newRotation = 360 - (abs(newRotation) - 360)
                        }
                        if (newRotation > 360) {
                            newRotation = -360 + (newRotation - 360)
                        }
                        this.plant.xRotation = newRotation
                        this.plant.recalculateBounds(umain.kDrawNow)
                    }
                }
                this.invalidateCombinedPlantRects()
                umain.MainForm.updateForChangeToPlantRotations()
            }
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        
        if (this.done) {
            //if done in mousemove 
            return
        }
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                switch (this.rotateDirection) {
                    case kRotateX:
                        if (this.offsetRotation !== 0) {
                            this.plant.xRotation = umath.min(360, umath.max(-360, PdSingleValue(this.values.Items[i]).saveSingle + this.offsetRotation))
                        } else {
                            this.plant.xRotation = this.newRotation
                        }
                        break
                    case kRotateY:
                        if (this.offsetRotation !== 0) {
                            this.plant.yRotation = umath.min(360, umath.max(-360, PdSingleValue(this.values.Items[i]).saveSingle + this.offsetRotation))
                        } else {
                            this.plant.yRotation = this.newRotation
                        }
                        break
                    case kRotateZ:
                        if (this.offsetRotation !== 0) {
                            this.plant.zRotation = umath.min(360, umath.max(-360, PdSingleValue(this.values.Items[i]).saveSingle + this.offsetRotation))
                        } else {
                            this.plant.zRotation = this.newRotation
                        }
                        break
                }
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        umain.MainForm.updateForChangeToPlantRotations()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                switch (this.rotateDirection) {
                    case kRotateX:
                        this.plant.xRotation = PdSingleValue(this.values.Items[i]).saveSingle
                        break
                    case kRotateY:
                        this.plant.yRotation = PdSingleValue(this.values.Items[i]).saveSingle
                        break
                    case kRotateZ:
                        this.plant.zRotation = PdSingleValue(this.values.Items[i]).saveSingle
                        break
                }
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        umain.MainForm.updateForChangeToPlantRotations()
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = nameForDirection(this.rotateDirection) + " rotate" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdResetRotationsCommand {
    oldX: float = 0.0
    oldY: float = 0.0
    oldZ: float = 0.0
    PdResetRotationsCommand.prototype = new PdCommandWithListOfPlants()
    PdResetRotationsCommand.prototype.constructor = PdResetRotationsCommand
    
    // ------------------------------------------------------------ PdResetRotationsCommand 
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.values.Add(PdXYZValue().createWithXYZ(this.plant.xRotation, this.plant.yRotation, this.plant.zRotation))
                this.plant.xRotation = 0
                this.plant.yRotation = 0
                this.plant.zRotation = 0
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        umain.MainForm.updateForChangeToPlantRotations()
    }
    
    redoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.xRotation = 0
                this.plant.yRotation = 0
                this.plant.zRotation = 0
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        umain.MainForm.updateForChangeToPlantRotations()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.xRotation = PdXYZValue(this.values.Items[i]).x
                this.plant.yRotation = PdXYZValue(this.values.Items[i]).y
                this.plant.zRotation = PdXYZValue(this.values.Items[i]).z
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        umain.MainForm.updateForChangeToPlantRotations()
    }
    
    description(): string {
        let result = ""
        result = "reset rotation for" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeDrawingScaleCommand {
    newScale: float = 0.0
    PdChangeDrawingScaleCommand.prototype = new PdCommandWithListOfPlants()
    PdChangeDrawingScaleCommand.prototype.constructor = PdChangeDrawingScaleCommand
    
    // ------------------------------------------------------------ PdChangeDrawingScaleCommand 
    createWithListOfPlantsAndNewScale(aList: TList, aNewScale: float): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newScale = aNewScale
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdSingleValue().createWithSingle(uplant.PdPlant(this.plantList.Items[i]).drawingScale_PixelsPerMm))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.drawingScale_PixelsPerMm = this.newScale
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.drawingScale_PixelsPerMm = PdSingleValue(this.values.Items[i]).saveSingle
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = "change scale for" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangePlantAgeCommand {
    newAge: short = 0
    PdChangePlantAgeCommand.prototype = new PdCommandWithListOfPlants()
    PdChangePlantAgeCommand.prototype.constructor = PdChangePlantAgeCommand
    
    // ----------------------------------------------------------------------- PdChangePlantAgeCommand 
    createWithListOfPlantsAndNewAge(aList: TList, aNewAge: short): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newAge = aNewAge
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdSmallintValue().createWithSmallint(uplant.PdPlant(this.plantList.Items[i]).age))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    // if primary selected plant has longer lifespan than other selected plants, cut off age
                    //        at max for those plants 
                    this.plant.setAge(umath.intMin(this.newAge, this.plant.pGeneral.ageAtMaturity))
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            umain.MainForm.updateLifeCyclePanelForFirstSelectedPlant()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.setAge(PdSmallintValue(this.values.Items[i]).saveSmallint)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            umain.MainForm.updateLifeCyclePanelForFirstSelectedPlant()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    // redo is same as do 
    description(): string {
        let result = ""
        result = "change age to " + IntToStr(this.newAge) + " for" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdAnimatePlantCommand {
    age: short = 0
    oldestAgeAtMaturity: short = 0
    PdAnimatePlantCommand.prototype = new PdCommandWithListOfPlants()
    PdAnimatePlantCommand.prototype.constructor = PdAnimatePlantCommand
    
    // ----------------------------------------------------------------------- PdAnimatePlantCommand 
    createWithListOfPlants(aList: TList): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdSmallintValue().createWithSmallint(uplant.PdPlant(this.plantList.Items[i]).age))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        let plant: PdPlant
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        this.age = 0
        // find oldest age 
        this.oldestAgeAtMaturity = 0
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            plant = uplant.PdPlant(this.plantList.Items[i])
            if ((i === 0) || (plant.pGeneral.ageAtMaturity > this.oldestAgeAtMaturity)) {
                this.oldestAgeAtMaturity = plant.pGeneral.ageAtMaturity
            }
        }
        // reset all plants to age zero and draw them 
        udomain.domain.temporarilyHideSelectionRectangles = true
        this.invalidateCombinedPlantRects()
        try {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                plant = uplant.PdPlant(this.plantList.Items[i])
                plant.reset()
                plant.recalculateBounds(umain.kDrawNow)
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForPossibleChangeToDrawing()
        } finally {
            udomain.domain.temporarilyHideSelectionRectangles = false
        }
        umain.MainForm.animateCommand = this
        umain.MainForm.startAnimation()
    }
    
    animateOneDay(): void {
        let i: short
        let plant: PdPlant
        
        // grow all plants one day 
        udomain.domain.temporarilyHideSelectionRectangles = true
        try {
            this.invalidateCombinedPlantRects()
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                plant = uplant.PdPlant(this.plantList.Items[i])
                if (this.age < plant.pGeneral.ageAtMaturity) {
                    plant.nextDay()
                    plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            if (umain.MainForm.lifeCycleShowing()) {
                // don't want to update params, because they don't change during animation 
                umain.MainForm.updateLifeCyclePanelForFirstSelectedPlant()
            } else if (umain.MainForm.statsShowing()) {
                umain.MainForm.updateStatisticsPanelForFirstSelectedPlant()
            }
            umain.MainForm.updateForPossibleChangeToDrawing()
            this.age += 1
        } finally {
            udomain.domain.temporarilyHideSelectionRectangles = false
        }
        if (this.age >= this.oldestAgeAtMaturity) {
            umain.MainForm.stopAnimation()
        }
        umain.MainForm.updateForChangeToSelectedPlantsLocation()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.plant.setAge(PdSmallintValue(this.values.Items[i]).saveSmallint)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            umain.MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            umain.MainForm.updateLifeCyclePanelForFirstSelectedPlant()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    // redo is same as do 
    description(): string {
        let result = ""
        result = "animate" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdHideOrShowCommand {
    hide: boolean = false
    newValues: TListCollection = new TListCollection()
    PdHideOrShowCommand.prototype = new PdCommandWithListOfPlants()
    PdHideOrShowCommand.prototype.constructor = PdHideOrShowCommand
    
    // ------------------------------------------------------------ PdHideOrShowCommand 
    createWithListOfPlantsAndHideOrShow(aList: TList, aHide: boolean): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        //hidden flag not saved
        this.commandChangesPlantFile = false
        this.hide = aHide
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdBooleanValue().createWithBoolean(uplant.PdPlant(this.plantList.Items[i]).hidden))
            }
        }
    }
    
    createWithListOfPlantsAndListOfHides(aList: TList, aHideList: TListCollection): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        //hidden flag not saved
        this.commandChangesPlantFile = false
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.values.Add(PdBooleanValue().createWithBoolean(uplant.PdPlant(this.plantList.Items[i]).hidden))
            }
        }
        this.newValues = ucollect.TListCollection().Create()
        if (aHideList.Count > 0) {
            for (i = 0; i <= aHideList.Count - 1; i++) {
                this.newValues.Add(PdBooleanValue().createWithBoolean(PdBooleanValue(aHideList.Items[i]).saveBoolean))
            }
        }
    }
    
    destroy(): void {
        this.newValues.free
        this.newValues = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        umain.MainForm.hideOrShowSomePlants(this.plantList, this.newValues, this.hide, umain.kDontDrawYet)
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        umain.MainForm.hideOrShowSomePlants(this.plantList, this.values, this.hide, umain.kDontDrawYet)
    }
    
    description(): string {
        let result = ""
        if ((this.newValues !== null) && (this.newValues.Count > 0)) {
            result = "hide others"
        } else if (this.hide) {
            result = "hide" + plantNamesForDescription(this.plantList)
        } else {
            result = "show" + plantNamesForDescription(this.plantList)
        }
        return result
    }
    
}

export class PdRandomizeCommand {
    oldSeeds: TListCollection = new TListCollection()
    oldBreedingSeeds: TListCollection = new TListCollection()
    newSeeds: TListCollection = new TListCollection()
    newBreedingSeeds: TListCollection = new TListCollection()
    oldXRotations: TListCollection = new TListCollection()
    newXRotations: TListCollection = new TListCollection()
    isInBreeder: boolean = false
    isRandomizeAllInBreeder: boolean = false
    PdRandomizeCommand.prototype = new PdCommandWithListOfPlants()
    PdRandomizeCommand.prototype.constructor = PdRandomizeCommand
    
    // ----------------------------------------------------------------------- PdRandomizeCommand 
    createWithListOfPlants(aList: TList): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.oldSeeds = ucollect.TListCollection().Create()
        this.oldBreedingSeeds = ucollect.TListCollection().Create()
        this.newSeeds = ucollect.TListCollection().Create()
        this.newBreedingSeeds = ucollect.TListCollection().Create()
        this.oldXRotations = ucollect.TListCollection().Create()
        this.newXRotations = ucollect.TListCollection().Create()
        this.setUpToRemoveAmendmentsWhenDone()
    }
    
    destroy(): void {
        this.oldSeeds.free
        this.oldSeeds = null
        this.oldBreedingSeeds.free
        this.oldBreedingSeeds = null
        this.newSeeds.free
        this.newSeeds = null
        this.newBreedingSeeds.free
        this.newBreedingSeeds = null
        this.oldXRotations.free
        this.oldXRotations = null
        this.newXRotations.free
        this.newXRotations = null
    }
    
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.oldSeeds.Add(PdSmallintValue().createWithSmallint(this.plant.pGeneral.startingSeedForRandomNumberGenerator))
                    this.oldBreedingSeeds.Add(PdLongintValue().createWithLongint(this.plant.breedingGenerator.seed))
                    this.oldXRotations.Add(PdSingleValue().createWithSingle(this.plant.xRotation))
                    this.plant.randomize()
                    this.newSeeds.Add(PdSmallintValue().createWithSmallint(this.plant.pGeneral.startingSeedForRandomNumberGenerator))
                    this.newBreedingSeeds.Add(PdLongintValue().createWithLongint(this.plant.breedingGenerator.seed))
                    this.newXRotations.Add(PdSingleValue().createWithSingle(this.plant.xRotation))
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(umain.kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.Count === 1) {
                    this.plant = uplant.PdPlant(this.plantList.Items[0])
                    ubreedr.BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    ubreedr.BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                umain.MainForm.updateForChangeToPlantRotations()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let i: short
        let seed: short
        let breedingSeed: long
        let xRotation: float
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    seed = PdSmallintValue(this.oldSeeds.Items[i]).saveSmallint
                    breedingSeed = PdLongintValue(this.oldBreedingSeeds.Items[i]).saveLongint
                    xRotation = PdSingleValue(this.oldXRotations.Items[i]).saveSingle
                    this.plant.randomizeWithSeedsAndXRotation(seed, breedingSeed, xRotation)
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(umain.kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.Count === 1) {
                    this.plant = uplant.PdPlant(this.plantList.Items[0])
                    ubreedr.BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    ubreedr.BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                umain.MainForm.updateForChangeToPlantRotations()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        let i: short
        let seed: short
        let breedingSeed: long
        let xRotation: float
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    seed = PdSmallintValue(this.newSeeds.Items[i]).saveSmallint
                    breedingSeed = PdLongintValue(this.newBreedingSeeds.Items[i]).saveLongint
                    xRotation = PdSingleValue(this.newXRotations.Items[i]).saveSingle
                    this.plant.randomizeWithSeedsAndXRotation(seed, breedingSeed, xRotation)
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(umain.kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.Count === 1) {
                    this.plant = uplant.PdPlant(this.plantList.Items[0])
                    ubreedr.BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    ubreedr.BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                umain.MainForm.updateForChangeToPlantRotations()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        let result = ""
        if (this.isRandomizeAllInBreeder) {
            result = "randomize all in breeder"
        } else if (this.isInBreeder) {
            result = "randomize in breeder"
        } else {
            result = "randomize" + plantNamesForDescription(this.plantList)
        }
        return result
    }
    
}

// -------------------------------------------------------------- commands that add plants, no special superclass 
export class PdPasteCommand {
    useSpecialPastePosition: boolean = false
    oldSelectedList: TList = new TList()
    PdPasteCommand.prototype = new PdCommandWithListOfPlants()
    PdPasteCommand.prototype.constructor = PdPasteCommand
    
    // doesn't use values, but uses plantList 
    // v2.0
    // --------------------------------------------------------------------------------------------- PdPasteCommand 
    createWithListOfPlantsAndOldSelectedList(aList: TList, anOldSelectedList: TList): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        // selected list is just pointers, this doesn't take control of them
        this.oldSelectedList = delphi_compatability.TList().Create()
        if ((anOldSelectedList !== null) && (anOldSelectedList.Count > 0)) {
            for (i = 0; i <= anOldSelectedList.Count - 1; i++) {
                this.oldSelectedList.Add(anOldSelectedList.Items[i])
            }
        }
    }
    
    destroy(): void {
        let i: short
        
        this.oldSelectedList.free
        this.oldSelectedList = null
        if ((!this.done) && (this.plantList !== null) && (this.plantList.Count > 0)) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                // free copies of pasted plants if change was undone 
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.free
            }
        }
        //will free plantList TList
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((!this.done) && (this.plantList !== null)) {
            result = this.plantList.Count
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        // make new plants the only selected plants 
        umain.MainForm.deselectAllPlants()
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            this.plant = uplant.PdPlant(this.plantList.Items[i])
            // put new plants at end of plant manager list 
            udomain.domain.plantManager.plants.Add(this.plant)
            if (!this.useSpecialPastePosition) {
                if (!udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
                    this.plant.moveTo(umain.MainForm.standardPastePosition())
                    if (!this.plant.justCopiedFromMainWindow) {
                        this.plant.calculateDrawingScaleToLookTheSameWithDomainScale()
                    }
                }
            }
            this.plant.recalculateBounds(umain.kDrawNow)
            umain.MainForm.addSelectedPlant(this.plant, kAddAtEnd)
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            this.plant = uplant.PdPlant(this.plantList.Items[i])
            udomain.domain.plantManager.plants.Remove(this.plant)
            umain.MainForm.removeSelectedPlant(this.plant)
        }
        if (this.oldSelectedList.Count > 0) {
            for (i = 0; i <= this.oldSelectedList.Count - 1; i++) {
                // put back selections from before paste
                umain.MainForm.selectedPlants.Add(this.oldSelectedList.Items[i])
            }
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        let result = ""
        result = "paste" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdDuplicateCommand {
    startDragPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    newPlants: TList = new TList()
    inTrackMouse: boolean = false
    PdDuplicateCommand.prototype = new PdCommandWithListOfPlants()
    PdDuplicateCommand.prototype.constructor = PdDuplicateCommand
    
    // ------------------------------------------------------------------------ PdDuplicateCommand 
    createWithListOfPlants(aList: TList): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.newPlants = delphi_compatability.TList().Create()
    }
    
    destroy(): void {
        let i: short
        
        if ((!this.done) && (this.newPlants !== null) && (this.newPlants.Count > 0)) {
            for (i = 0; i <= this.newPlants.Count - 1; i++) {
                // free copies of created plants if change was undone 
                this.plant = uplant.PdPlant(this.newPlants.Items[i])
                this.plant.free
            }
        }
        this.newPlants.free
        this.newPlants = null
        //will free plantList
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((!this.done) && (this.newPlants !== null)) {
            result = this.newPlants.Count
        }
        return result
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        let i: short
        let originalPlant: PdPlant
        
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
            if (!this.done && mouseDidMove) {
                this.startDragPoint = nextPoint
                this.inTrackMouse = true
                this.doCommand()
            }
            if (!this.done) {
                return result
            }
            if (!delphi_compatability.PtInRect(umain.MainForm.drawingPaintBox.ClientRect, nextPoint)) {
                this.undoCommand()
                result = null
                this.free
            } else {
                this.offset.X = nextPoint.X - this.startDragPoint.X
                this.offset.Y = nextPoint.Y - this.startDragPoint.Y
                if (this.newPlants.Count > 0) {
                    for (i = 0; i <= this.newPlants.Count - 1; i++) {
                        this.plant = uplant.PdPlant(this.newPlants.Items[i])
                        if ((i <= this.plantList.Count - 1)) {
                            originalPlant = uplant.PdPlant(this.plantList.Items[i])
                            umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
                            this.plant.moveTo(originalPlant.basePoint_pixels())
                            this.plant.moveBy(this.offset)
                            // only draw if don't have picture yet
                            this.plant.recalculateBounds(this.plant.previewCache.Width < 5)
                            umain.MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
                        }
                    }
                }
            }
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                result = null
                this.free
            }
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        let plantCopy: PdPlant
        
        if (this.done) {
            // should have been done in the mouse down, unless it was done by a menu command 
            return
        }
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        // make new plants only selected plants 
        umain.MainForm.deselectAllPlants()
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            this.plant = uplant.PdPlant(this.plantList.Items[i])
            plantCopy = uplant.PdPlant().create()
            this.plant.copyTo(plantCopy)
            plantCopy.shrinkPreviewCache()
            plantCopy.setName("Copy of " + plantCopy.getName())
            if (!this.inTrackMouse) {
                plantCopy.moveBy(point(kPasteMoveDistance, 0))
            }
            plantCopy.recalculateBounds(umain.kDrawNow)
            this.newPlants.Add(plantCopy)
            udomain.domain.plantManager.addPlant(plantCopy)
            umain.MainForm.addSelectedPlant(plantCopy, kAddAtEnd)
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (this.newPlants.Count <= 0) {
            return
        }
        for (i = 0; i <= this.newPlants.Count - 1; i++) {
            this.plant = uplant.PdPlant(this.newPlants.Items[i])
            udomain.domain.plantManager.plants.Remove(this.plant)
            umain.MainForm.removeSelectedPlant(this.plant)
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    redoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.newPlants.Count <= 0) {
            return
        }
        umain.MainForm.deselectAllPlants()
        for (i = 0; i <= this.newPlants.Count - 1; i++) {
            this.plant = uplant.PdPlant(this.newPlants.Items[i])
            udomain.domain.plantManager.addPlant(this.plant)
            umain.MainForm.addSelectedPlant(this.plant, kAddAtEnd)
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        let result = ""
        result = "duplicate" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

// -------------------------------------------------------------------------------- remove command is unique 
export class PdRemoveCommand {
    removedPlants: TList = new TList()
    copyToClipboard: boolean = false
    PdRemoveCommand.prototype = new PdCommandWithListOfPlants()
    PdRemoveCommand.prototype.constructor = PdRemoveCommand
    
    // doesn't use values, but uses plantList 
    // --------------------------------------------------------------------------------------------- PdRemoveCommand 
    createWithListOfPlantsAndClipboardFlag(aList: TList, aCopyToClipboard: boolean): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.removedPlants = delphi_compatability.TList().Create()
        this.copyToClipboard = aCopyToClipboard
    }
    
    destroy(): void {
        let i: short
        
        if ((this.done) && (this.removedPlants !== null) && (this.removedPlants.Count > 0)) {
            for (i = 0; i <= this.removedPlants.Count - 1; i++) {
                // free copies of cut plants if change was done 
                this.plant = uplant.PdPlant(this.removedPlants.Items[i])
                this.plant.free
            }
        }
        this.removedPlants.free
        this.removedPlants = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((this.done) && (this.removedPlants !== null)) {
            result = this.removedPlants.Count
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        if (this.copyToClipboard) {
            // copy plants 
            umain.MainForm.copySelectedPlantsToClipboard()
        }
        // save copy of plants before deleting 
        this.removedPlants.Clear()
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            // don't remove plants from plant manager and MainForm.selectedPlants until all indexes have been recorded 
            this.plant = uplant.PdPlant(this.plantList.Items[i])
            this.removedPlants.Add(this.plant)
            this.plant.indexWhenRemoved = udomain.domain.plantManager.plants.IndexOf(this.plant)
            this.plant.selectedIndexWhenRemoved = umain.MainForm.selectedPlants.IndexOf(this.plant)
        }
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                udomain.domain.plantManager.plants.Remove(this.plant)
                umain.MainForm.removeSelectedPlant(this.plant)
            }
        }
        umain.MainForm.updateForChangeToPlantList()
        if (udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
            // if only looking at one, select first in list so you are not left with nothing
            umain.MainForm.selectFirstPlantInPlantList()
            umain.MainForm.showOnePlantExclusively(umain.kDrawNow)
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
            // remove selection if created
            umain.MainForm.deselectAllPlants()
        }
        if (this.removedPlants.Count > 0) {
            for (i = 0; i <= this.removedPlants.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.removedPlants.Items[i])
                if ((this.plant.indexWhenRemoved >= 0) && (this.plant.indexWhenRemoved <= udomain.domain.plantManager.plants.Count - 1)) {
                    udomain.domain.plantManager.plants.Insert(this.plant.indexWhenRemoved, this.plant)
                } else {
                    udomain.domain.plantManager.plants.Add(this.plant)
                }
                // all removed plants must have been selected, so also add them to the selected list 
                umain.MainForm.addSelectedPlant(this.plant, this.plant.selectedIndexWhenRemoved)
            }
        }
        umain.MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        let result = ""
        if (this.copyToClipboard) {
            result = "cut" + plantNamesForDescription(this.plantList)
        } else {
            result = "delete" + plantNamesForDescription(this.plantList)
        }
        return result
    }
    
}

// ---------------------------------------------------------------------------------- domain change commands 
export class PdChangeValueCommand {
    fieldNumber: short = 0
    regrow: boolean = false
    PdChangeValueCommand.prototype = new PdCommandWithListOfPlants()
    PdChangeValueCommand.prototype.constructor = PdChangeValueCommand
    
    // ------------------------------------------------------------------------------- value change commands 
    // -------------------------------------------------------------------------------- PdChangeValueCommand 
    createCommandWithListOfPlants(aList: TList, aFieldNumber: short, aRegrow: boolean): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.fieldNumber = aFieldNumber
        this.regrow = aRegrow
        if (this.regrow) {
            this.setUpToRemoveAmendmentsWhenDone()
        }
    }
    
    description(): string {
        let result = ""
        let param: PdParameter
        
        result = ""
        param = null
        if ((udomain.domain !== null) && (udomain.domain.parameterManager !== null)) {
            // subclasses may want to call 
            param = udomain.domain.parameterManager.parameterForFieldNumber(this.fieldNumber)
            if ((param !== null)) {
                result = "\"" + param.getName() + "\""
            }
        }
        return result
    }
    
}

export class PdChangeRealValueCommand {
    newValue: float = 0.0
    arrayIndex: short = 0
    PdChangeRealValueCommand.prototype = new PdChangeValueCommand()
    PdChangeRealValueCommand.prototype.constructor = PdChangeRealValueCommand
    
    // ------------------------------------------------------------ PdChangeRealValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewValue: float, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean): void {
        let oldValue: float
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = this.plant.editTransferField(umath.kGetField, oldValue, this.fieldNumber, uparams.kFieldFloat, this.arrayIndex, this.regrow)
                this.values.Add(PdSingleValue().createWithSingle(oldValue))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.newValue = this.plant.editTransferField(umath.kSetField, this.newValue, this.fieldNumber, uparams.kFieldFloat, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldValue: float
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = PdSingleValue(this.values.Items[i]).saveSingle
                oldValue = this.plant.editTransferField(umath.kSetField, oldValue, this.fieldNumber, uparams.kFieldFloat, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result
        if (this.arrayIndex !== -1) {
            result = result + " (" + IntToStr(this.arrayIndex + 1) + ")"
        }
        result = result + " to " + usupport.digitValueString(this.newValue) + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeSCurvePointValueCommand {
    newX: float = 0.0
    newY: float = 0.0
    pointIndex: short = 0
    PdChangeSCurvePointValueCommand.prototype = new PdChangeValueCommand()
    PdChangeSCurvePointValueCommand.prototype.constructor = PdChangeSCurvePointValueCommand
    
    // ------------------------------------------------------------ PdChangeSCurvePointValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewX: float, aNewY: float, aFieldNumber: short, aPointIndex: short, aRegrow: boolean): void {
        let oldX: float
        let oldY: float
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newX = aNewX
        this.newY = aNewY
        this.pointIndex = aPointIndex
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldX = this.plant.editTransferField(umath.kGetField, oldX, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2, this.regrow)
                oldY = this.plant.editTransferField(umath.kGetField, oldY, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                this.values.Add(PdSinglePointValue().createWithSingleXY(oldX, oldY))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    // first time, set values without calculating
                    this.plant.changingWholeSCurves = true
                    this.newX = this.plant.editTransferField(umath.kSetField, this.newX, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2, this.regrow)
                    this.newY = this.plant.editTransferField(umath.kSetField, this.newY, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                    // second time, now that both values are set, set first one again to calc s curve
                    this.plant.changingWholeSCurves = false
                    this.newX = this.plant.editTransferField(umath.kSetField, this.newX, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldX: float
        let oldY: float
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldX = PdSinglePointValue(this.values.Items[i]).x
                oldY = PdSinglePointValue(this.values.Items[i]).y
                oldX = this.plant.editTransferField(umath.kSetField, oldX, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2, this.regrow)
                oldY = this.plant.editTransferField(umath.kSetField, oldY, this.fieldNumber, uparams.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result + " point " + IntToStr(this.pointIndex + 1) + " to (" + usupport.digitValueString(this.newX) + ", " + usupport.digitValueString(this.newY) + ")" + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeColorValueCommand {
    newColor: TColorRef = new TColorRef()
    PdChangeColorValueCommand.prototype = new PdChangeValueCommand()
    PdChangeColorValueCommand.prototype.constructor = PdChangeColorValueCommand
    
    // ------------------------------------------------------------ PdChangeColorValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewValue: TColorRef, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean): void {
        let oldValue: TColorRef
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newColor = aNewValue
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = this.plant.editTransferField(umath.kGetField, oldValue, this.fieldNumber, uparams.kFieldColor, uparams.kNotArray, this.regrow)
                this.values.Add(PdColorValue().createWithColor(oldValue))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.newColor = this.plant.editTransferField(umath.kSetField, this.newColor, this.fieldNumber, uparams.kFieldColor, uparams.kNotArray, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldValue: TColorRef
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = PdColorValue(this.values.Items[i]).saveColor
                oldValue = this.plant.editTransferField(umath.kSetField, oldValue, this.fieldNumber, uparams.kFieldColor, uparams.kNotArray, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result + " to (R " + IntToStr(UNRESOLVED.getRValue(this.newColor)) + ", G " + IntToStr(UNRESOLVED.getGValue(this.newColor)) + ", B " + IntToStr(UNRESOLVED.getBValue(this.newColor)) + ")" + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeTdoValueCommand {
    newTdo: KfObject3D = new KfObject3D()
    PdChangeTdoValueCommand.prototype = new PdChangeValueCommand()
    PdChangeTdoValueCommand.prototype.constructor = PdChangeTdoValueCommand
    
    // ------------------------------------------------------------ PdChangeTdoValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewValue: KfObject3D, aFieldNumber: short, aRegrow: boolean): void {
        let valueTdo: KfObject3D
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newTdo = utdo.KfObject3D().create()
        this.newTdo.copyFrom(aNewValue)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                valueTdo = utdo.KfObject3D().create()
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                valueTdo = this.plant.editTransferField(umath.kGetField, valueTdo, this.fieldNumber, uparams.kFieldThreeDObject, uparams.kNotArray, this.regrow)
                this.values.Add(valueTdo)
            }
        }
    }
    
    destroy(): void {
        this.newTdo.free
        this.newTdo = null
        // value tdos will be freed by values listCollection 
        PdChangeValueCommand.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.newTdo = this.plant.editTransferField(umath.kSetField, this.newTdo, this.fieldNumber, uparams.kFieldThreeDObject, uparams.kNotArray, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldValue: KfObject3D
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = utdo.KfObject3D(this.values.Items[i])
                oldValue = this.plant.editTransferField(umath.kSetField, oldValue, this.fieldNumber, uparams.kFieldThreeDObject, uparams.kNotArray, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result + " to \"" + this.newTdo.getName() + "\" in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeSmallintValueCommand {
    newValue: short = 0
    arrayIndex: short = 0
    PdChangeSmallintValueCommand.prototype = new PdChangeValueCommand()
    PdChangeSmallintValueCommand.prototype.constructor = PdChangeSmallintValueCommand
    
    // ------------------------------------------------------------ PdChangeSmallintValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewValue: short, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean): void {
        let oldValue: short
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = this.plant.editTransferField(umath.kGetField, oldValue, this.fieldNumber, uparams.kFieldSmallint, this.arrayIndex, this.regrow)
                this.values.Add(PdSmallintValue().createWithSmallint(oldValue))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.newValue = this.plant.editTransferField(umath.kSetField, this.newValue, this.fieldNumber, uparams.kFieldSmallint, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldValue: short
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = PdSmallintValue(this.values.Items[i]).saveSmallint
                oldValue = this.plant.editTransferField(umath.kSetField, oldValue, this.fieldNumber, uparams.kFieldSmallint, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result + " to " + IntToStr(this.newValue) + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeBooleanValueCommand {
    newValue: boolean = false
    arrayIndex: short = 0
    PdChangeBooleanValueCommand.prototype = new PdChangeValueCommand()
    PdChangeBooleanValueCommand.prototype.constructor = PdChangeBooleanValueCommand
    
    // ------------------------------------------------------------ PdChangeBooleanValueCommand 
    createCommandWithListOfPlants(aList: TList, aNewValue: boolean, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean): void {
        let oldValue: boolean
        let i: short
        
        PdChangeValueCommand.prototype.createCommandWithListOfPlants.call(this, aList, aFieldNumber, aRegrow)
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = this.plant.editTransferField(umath.kGetField, oldValue, this.fieldNumber, uparams.kFieldBoolean, this.arrayIndex, this.regrow)
                this.values.Add(PdBooleanValue().createWithBoolean(oldValue))
            }
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.Count > 0) {
                for (i = 0; i <= this.plantList.Count - 1; i++) {
                    this.plant = uplant.PdPlant(this.plantList.Items[i])
                    this.newValue = this.plant.editTransferField(umath.kSetField, this.newValue, this.fieldNumber, uparams.kFieldBoolean, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(umain.kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
        } finally {
            if (this.regrow) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        let oldValue: boolean
        let i: short
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                oldValue = PdBooleanValue(this.values.Items[i]).saveBoolean
                oldValue = this.plant.editTransferField(umath.kSetField, oldValue, this.fieldNumber, uparams.kFieldBoolean, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(umain.kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        let newValueString: string
        
        result = PdChangeValueCommand.prototype.description.call(this)
        if (this.newValue) {
            newValueString = "yes"
        } else {
            newValueString = "no"
        }
        result = "change " + result + " to " + newValueString + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

// ---------------------------------------------------------------------------- breeder commands 
export class PdBreedFromParentsCommand {
    firstParent: PdPlant = new PdPlant()
    secondParent: PdPlant = new PdPlant()
    fractionOfMaxAge: float = 0.0
    row: short = 0
    oldGenerations: TList = new TList()
    newGeneration: PdGeneration = new PdGeneration()
    firstGeneration: PdGeneration = new PdGeneration()
    createFirstGeneration: boolean = false
    rowSelectedAtStart: short = 0
    PdBreedFromParentsCommand.prototype = new PdCommand()
    PdBreedFromParentsCommand.prototype.constructor = PdBreedFromParentsCommand
    
    // ---------------------------------------------------------------------------- PdBreedFromTwoParentsCommand 
    createWithInfo(existingGenerations: TListCollection, aFirstParent: PdPlant, aSecondParent: PdPlant, aRow: short, aFractionOfMaxAge: float, aCreateFirstGeneration: boolean): void {
        let i: short
        
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.firstParent = aFirstParent
        if (this.firstParent === null) {
            throw new GeneralException.create("Problem: Need at least one parent in method PdBreedFromParentsCommand.createWithInfo.")
        }
        this.secondParent = aSecondParent
        this.fractionOfMaxAge = aFractionOfMaxAge
        this.row = aRow
        this.createFirstGeneration = aCreateFirstGeneration
        if (this.row < 0) {
            //from main window 
            this.row = ubreedr.BreederForm.selectedRow
        }
        this.oldGenerations = delphi_compatability.TList().Create()
        if (existingGenerations.Count > 0) {
            for (i = 0; i <= existingGenerations.Count - 1; i++) {
                this.oldGenerations.Add(ugener.PdGeneration(existingGenerations.Items[i]))
            }
        }
    }
    
    destroy(): void {
        let lastGeneration: PdGeneration
        
        if (this.done) {
            while (this.oldGenerations.Count - 1 > this.row) {
                // free all generations below row 
                lastGeneration = ugener.PdGeneration(this.oldGenerations.Items[this.oldGenerations.Count - 1])
                this.oldGenerations.Remove(lastGeneration)
                lastGeneration.free
            }
            // free new generation (and first generation if created, if not it will be nil) 
        } else {
            this.firstGeneration.free
            this.firstGeneration = null
            this.newGeneration.free
            this.newGeneration = null
        }
        this.oldGenerations.free
        this.oldGenerations = null
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        let i: short
        let generation: PdGeneration
        
        result = 0
        if (this.done) {
            if (this.oldGenerations.Count > 0) {
                for (i = 0; i <= this.oldGenerations.Count - 1; i++) {
                    generation = ugener.PdGeneration(this.oldGenerations.Items[i])
                    result = result + generation.plants.Count
                }
            }
        } else {
            if (this.firstGeneration !== null) {
                result = this.firstGeneration.plants.Count
            }
            if (this.newGeneration !== null) {
                result = this.newGeneration.plants.Count
            }
        }
        return result
    }
    
    doCommand(): void {
        let generationBred: PdGeneration
        
        PdCommand.prototype.doCommand.call(this)
        try {
            ucursor.cursor_startWait()
            this.rowSelectedAtStart = ubreedr.BreederForm.selectedRow
            if (this.createFirstGeneration) {
                // if command created from main window, create first generation to put in breeder 
                this.firstGeneration = ugener.PdGeneration().createWithParents(this.firstParent, this.secondParent, this.fractionOfMaxAge)
            }
            // create generation that is outcome of breeding and do breeding 
            this.newGeneration = ugener.PdGeneration().create()
            this.newGeneration.breedFromParents(this.firstParent, this.secondParent, this.fractionOfMaxAge)
            // tell breeder to forget about other generations below the selected row  
            ubreedr.BreederForm.forgetGenerationsListBelowRow(this.row)
            if (this.firstGeneration !== null) {
                ubreedr.BreederForm.addGeneration(this.firstGeneration)
                ubreedr.BreederForm.selectGeneration(this.firstGeneration)
            }
            ubreedr.BreederForm.updateForChangeToGenerations()
            if (this.row <= this.oldGenerations.Count - 1) {
                // set the firstParent and secondParent pointers in the generation that was bred (either the firstGeneration
                //      or the generation selected in the breeder) 
                generationBred = ugener.PdGeneration(this.oldGenerations.Items[this.row])
                generationBred.firstParent = generationBred.firstSelectedPlant()
                generationBred.secondParent = generationBred.secondSelectedPlant()
            }
            // add and select the new generation in the breeder 
            ubreedr.BreederForm.addGeneration(this.newGeneration)
            ubreedr.BreederForm.selectGeneration(this.newGeneration)
            ubreedr.BreederForm.updateForChangeToGenerations()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let generationBred: PdGeneration
        
        PdCommand.prototype.undoCommand.call(this)
        // tell the breeder to forget about the generation(s) created by this command, and if there were any generations
        //    wiped out by it, tell the breeder to restore pointers to all generations that were forgotten 
        ubreedr.BreederForm.forgetLastGeneration()
        if (this.firstGeneration !== null) {
            ubreedr.BreederForm.forgetLastGeneration()
        }
        ubreedr.BreederForm.updateForChangeToGenerations()
        ubreedr.BreederForm.addGenerationsFromListBelowRow(this.row, this.oldGenerations)
        ubreedr.BreederForm.selectedRow = this.rowSelectedAtStart
        if (this.row <= this.oldGenerations.Count - 1) {
            // set parent pointers of generation that was bred (firstGeneration or generation selected) to nil 
            generationBred = ugener.PdGeneration(this.oldGenerations.Items[this.row])
            generationBred.firstParent = null
            generationBred.secondParent = null
        }
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    redoCommand(): void {
        let generationBred: PdGeneration
        
        PdCommand.prototype.doCommand.call(this)
        // tell breeder to forget about other generations below the selected row (the whole list if from the main window) 
        ubreedr.BreederForm.forgetGenerationsListBelowRow(this.row)
        if (this.firstGeneration !== null) {
            ubreedr.BreederForm.addGeneration(this.firstGeneration)
            ubreedr.BreederForm.selectGeneration(this.firstGeneration)
        }
        ubreedr.BreederForm.updateForChangeToGenerations()
        if (this.row <= this.oldGenerations.Count - 1) {
            // set the firstParent and secondParent pointers in the generation that was bred (either the firstGeneration
            //    or the generation selected in the breeder) 
            generationBred = ugener.PdGeneration(this.oldGenerations.Items[this.row])
            generationBred.firstParent = generationBred.firstSelectedPlant()
            generationBred.secondParent = generationBred.secondSelectedPlant()
        }
        // add and select the new generation in the breeder 
        ubreedr.BreederForm.addGeneration(this.newGeneration)
        ubreedr.BreederForm.selectGeneration(this.newGeneration)
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    description(): string {
        let result = ""
        if (this.createFirstGeneration) {
            // plant(s) from main window
            result = "breed"
            if (this.firstParent !== null) {
                result = result + " \"" + this.firstParent.getName() + "\""
            }
            if (this.secondParent !== null) {
                result = result + ", \"" + this.secondParent.getName() + "\""
            }
        } else {
            result = "breed from breeder row " + IntToStr(this.row + 1)
        }
        return result
    }
    
}

export class PdReplaceBreederPlant {
    originalPlant: PdPlant = new PdPlant()
    newPlant: PdPlant = new PdPlant()
    plantDraggedFrom: PdPlant = new PdPlant()
    row: short = 0
    column: short = 0
    PdReplaceBreederPlant.prototype = new PdCommand()
    PdReplaceBreederPlant.prototype.constructor = PdReplaceBreederPlant
    
    // ------------------------------------------------------------------- PdReplaceBreederPlant 
    createWithPlantRowAndColumn(aPlant: PdPlant, aRow: short, aColumn: short): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.plantDraggedFrom = aPlant
        if (this.plantDraggedFrom === null) {
            throw new GeneralException.create("Problem: Nil plant dragged from in method PdReplaceBreederPlant.createWithPlantRowAndColumn.")
        }
        this.row = aRow
        this.column = aColumn
    }
    
    destroy(): void {
        if (this.done) {
            this.originalPlant.free
            this.originalPlant = null
        } else {
            this.newPlant.free
            this.newPlant = null
        }
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        //has one plant in either case (done or undone)
        result = 1
        return result
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        this.originalPlant = ubreedr.BreederForm.plantForRowAndColumn(this.row, this.column)
        if (this.originalPlant === null) {
            throw new GeneralException.create("Problem: Invalid row and column in method PdReplaceBreederPlant.doCommand.")
        }
        this.newPlant = uplant.PdPlant().create()
        this.plantDraggedFrom.copyTo(this.newPlant)
        ubreedr.BreederForm.replacePlantInRow(this.originalPlant, this.newPlant, this.row)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        ubreedr.BreederForm.replacePlantInRow(this.newPlant, this.originalPlant, this.row)
    }
    
    redoCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        ubreedr.BreederForm.replacePlantInRow(this.originalPlant, this.newPlant, this.row)
    }
    
    description(): string {
        let result = ""
        result = "replace breeder plant in row " + IntToStr(this.row + 1) + ", column " + IntToStr(this.column)
        return result
    }
    
}

export class PdMakeTimeSeriesCommand {
    oldPlants: TList = new TList()
    newPlants: TList = new TList()
    newPlant: PdPlant = new PdPlant()
    isPaste: boolean = false
    PdMakeTimeSeriesCommand.prototype = new PdCommand()
    PdMakeTimeSeriesCommand.prototype.constructor = PdMakeTimeSeriesCommand
    
    // ------------------------------------------------------------------- PdMakeTimeSeriesCommand 
    createWithNewPlant(aNewPlant: PdPlant): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.newPlant = aNewPlant
        if (this.newPlant === null) {
            throw new GeneralException.create("Problem: Nil plant in method PdMakeTimeSeriesCommand.createWithNewPlant.")
        }
        this.oldPlants = delphi_compatability.TList().Create()
        this.newPlants = delphi_compatability.TList().Create()
    }
    
    destroy(): void {
        let i: short
        
        if (this.done) {
            if ((this.oldPlants !== null) && (this.oldPlants.Count > 0)) {
                for (i = 0; i <= this.oldPlants.Count - 1; i++) {
                    uplant.PdPlant(this.oldPlants.Items[i]).free
                }
            }
        } else {
            if ((this.newPlants !== null) && (this.newPlants.Count > 0)) {
                for (i = 0; i <= this.newPlants.Count - 1; i++) {
                    uplant.PdPlant(this.newPlants.Items[i]).free
                }
            }
        }
        this.oldPlants.free
        this.oldPlants = null
        this.newPlants.free
        this.newPlants = null
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if (this.done) {
            if (this.oldPlants !== null) {
                result = this.oldPlants.Count
            }
        } else {
            if (this.newPlants !== null) {
                result = this.newPlants.Count
            }
        }
        return result
    }
    
    doCommand(): void {
        let i: short
        
        PdCommand.prototype.doCommand.call(this)
        if (utimeser.TimeSeriesForm.plants.Count > 0) {
            for (i = 0; i <= utimeser.TimeSeriesForm.plants.Count - 1; i++) {
                this.oldPlants.Add(utimeser.TimeSeriesForm.plants.Items[i])
            }
        }
        utimeser.TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        //redraws in updateForChangeToPlants
        utimeser.TimeSeriesForm.initializeWithPlant(this.newPlant, umain.kDontDrawYet)
        if (utimeser.TimeSeriesForm.plants.Count > 0) {
            for (i = 0; i <= utimeser.TimeSeriesForm.plants.Count - 1; i++) {
                this.newPlants.Add(utimeser.TimeSeriesForm.plants.Items[i])
            }
        }
        utimeser.TimeSeriesForm.updateForChangeToPlants(utimeser.kRecalculateScale)
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommand.prototype.undoCommand.call(this)
        utimeser.TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        if (this.oldPlants.Count > 0) {
            for (i = 0; i <= this.oldPlants.Count - 1; i++) {
                utimeser.TimeSeriesForm.plants.Add(this.oldPlants.Items[i])
            }
        }
        utimeser.TimeSeriesForm.updateForChangeToPlants(utimeser.kDontRecalculateScale)
    }
    
    redoCommand(): void {
        let i: short
        
        PdCommand.prototype.doCommand.call(this)
        utimeser.TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        if (this.newPlants.Count > 0) {
            for (i = 0; i <= this.newPlants.Count - 1; i++) {
                utimeser.TimeSeriesForm.plants.Add(this.newPlants.Items[i])
            }
        }
        utimeser.TimeSeriesForm.updateForChangeToPlants(utimeser.kDontRecalculateScale)
    }
    
    description(): string {
        let result = ""
        if (this.isPaste) {
            result = "paste into time series window"
        } else {
            result = "make time series"
            if (this.newPlant !== null) {
                result = result + " for plant \"" + this.newPlant.getName() + "\""
            }
        }
        return result
    }
    
}

export class PdChangeBreedingAndTimeSeriesOptionsCommand {
    oldOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    newOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    oldDomainOptions: DomainOptionsStructure = new DomainOptionsStructure()
    newDomainOptions: DomainOptionsStructure = new DomainOptionsStructure()
    PdChangeBreedingAndTimeSeriesOptionsCommand.prototype = new PdCommand()
    PdChangeBreedingAndTimeSeriesOptionsCommand.prototype.constructor = PdChangeBreedingAndTimeSeriesOptionsCommand
    
    // -------------------------------------------------------------- PdChangeBreederOptionsCommand 
    createWithOptionsAndDomainOptions(anOptions: BreedingAndTimeSeriesOptionsStructure, aDomainOptions: DomainOptionsStructure): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.newOptions = anOptions
        this.oldOptions = udomain.domain.breedingAndTimeSeriesOptions
        this.newDomainOptions = aDomainOptions
        this.oldDomainOptions = udomain.domain.options
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.breedingAndTimeSeriesOptions = this.newOptions
        udomain.domain.options = this.newDomainOptions
        ubreedr.BreederForm.updateForChangeToDomainOptions()
        utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.breedingAndTimeSeriesOptions = this.oldOptions
        udomain.domain.options = this.oldDomainOptions
        ubreedr.BreederForm.updateForChangeToDomainOptions()
        utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    // redo is same as do 
    description(): string {
        let result = ""
        result = "change breeding and time series options"
        return result
    }
    
}

export class PdDeleteBreederGenerationCommand {
    generation: PdGeneration = new PdGeneration()
    row: short = 0
    PdDeleteBreederGenerationCommand.prototype = new PdCommand()
    PdDeleteBreederGenerationCommand.prototype.constructor = PdDeleteBreederGenerationCommand
    
    // ------------------------------------------------------------------------ PdDeleteBreederGenerationCommand 
    createWithGeneration(aGeneration: PdGeneration): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.generation = aGeneration
        if (this.generation === null) {
            throw new GeneralException.create("Problem: Nil generation in method PdDeleteBreederGenerationCommand.createWithGeneration.")
        }
        this.row = ubreedr.BreederForm.generations.IndexOf(this.generation)
        if (this.row < 0) {
            throw new GeneralException.create("Problem: Generation not in list in method PdDeleteBreederGenerationCommand.createWithGeneration.")
        }
    }
    
    destroy(): void {
        if (this.done) {
            this.generation.free
            this.generation = null
        }
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((this.done) && (this.generation !== null)) {
            result = this.generation.plants.Count
        }
        return result
    }
    
    doCommand(): void {
        let index: short
        
        PdCommand.prototype.doCommand.call(this)
        index = ubreedr.BreederForm.generations.IndexOf(this.generation)
        ubreedr.BreederForm.generations.Remove(this.generation)
        if (index > 0) {
            ubreedr.BreederForm.selectedRow = index - 1
        }
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        ubreedr.BreederForm.generations.Insert(this.row, this.generation)
        ubreedr.BreederForm.selectedRow = ubreedr.BreederForm.generations.IndexOf(this.generation)
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    description(): string {
        let result = ""
        result = "delete breeder generation"
        return result
    }
    
}

export class PdDeleteAllBreederGenerationsCommand {
    generations: TListCollection = new TListCollection()
    PdDeleteAllBreederGenerationsCommand.prototype = new PdCommand()
    PdDeleteAllBreederGenerationsCommand.prototype.constructor = PdDeleteAllBreederGenerationsCommand
    
    // ------------------------------------------------------------------- PdDeleteAllBreederGenerationsCommand 
    create(): void {
        let i: short
        
        this.generations = ucollect.TListCollection().Create()
        if (ubreedr.BreederForm.generations.Count > 0) {
            for (i = 0; i <= ubreedr.BreederForm.generations.Count - 1; i++) {
                this.generations.Add(ubreedr.BreederForm.generations.Items[i])
            }
        }
    }
    
    destroy(): void {
        if (!this.done) {
            this.generations.clearPointersWithoutDeletingObjects()
        }
        this.generations.free
        this.generations = null
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        let i: short
        let generation: PdGeneration
        
        result = 0
        if (this.done) {
            if (this.generations.Count > 0) {
                for (i = 0; i <= this.generations.Count - 1; i++) {
                    generation = ugener.PdGeneration(this.generations.Items[i])
                    result = result + generation.plants.Count
                }
            }
        }
        return result
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        ubreedr.BreederForm.generations.clearPointersWithoutDeletingObjects()
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommand.prototype.undoCommand.call(this)
        if (this.generations.Count > 0) {
            for (i = 0; i <= this.generations.Count - 1; i++) {
                ubreedr.BreederForm.generations.Add(this.generations.Items[i])
            }
        }
        ubreedr.BreederForm.updateForChangeToGenerations()
    }
    
    //redo same as do
    description(): string {
        let result = ""
        result = "delete all breeder generations"
        return result
    }
    
}

// ------------------------------------------------------------------------ time series 
export class PdChangeNumberOfTimeSeriesStagesCommand {
    newNumber: short = 0
    oldNumber: short = 0
    PdChangeNumberOfTimeSeriesStagesCommand.prototype = new PdCommand()
    PdChangeNumberOfTimeSeriesStagesCommand.prototype.constructor = PdChangeNumberOfTimeSeriesStagesCommand
    
    // -------------------------------------------------------- PdChangeNumberOfTimeSeriesStagesCommand 
    createWithNewNumberOfStages(aNumber: short): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.newNumber = aNumber
        this.oldNumber = udomain.domain.breedingAndTimeSeriesOptions.numTimeSeriesStages
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        udomain.domain.breedingAndTimeSeriesOptions.numTimeSeriesStages = this.newNumber
        utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        udomain.domain.breedingAndTimeSeriesOptions.numTimeSeriesStages = this.oldNumber
        utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    description(): string {
        let result = ""
        result = "change number of time series stages"
        return result
    }
    
}

export class PdDeleteTimeSeriesCommand {
    plants: TListCollection = new TListCollection()
    PdDeleteTimeSeriesCommand.prototype = new PdCommand()
    PdDeleteTimeSeriesCommand.prototype.constructor = PdDeleteTimeSeriesCommand
    
    // -------------------------------------------------------- PdDeleteTimeSeriesCommand 
    create(): void {
        let i: short
        
        this.plants = ucollect.TListCollection().Create()
        if (utimeser.TimeSeriesForm.plants.Count > 0) {
            for (i = 0; i <= utimeser.TimeSeriesForm.plants.Count - 1; i++) {
                this.plants.Add(utimeser.TimeSeriesForm.plants.Items[i])
            }
        }
    }
    
    destroy(): void {
        if (!this.done) {
            this.plants.clearPointersWithoutDeletingObjects()
        }
        this.plants.free
        this.plants = null
        PdCommand.prototype.destroy.call(this)
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        if (this.done) {
            result = this.plants.Count
        } else {
            result = 0
        }
        return result
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        utimeser.TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        utimeser.TimeSeriesForm.updateForChangeToPlants(utimeser.kDontRecalculateScale)
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommand.prototype.undoCommand.call(this)
        if (this.plants.Count > 0) {
            for (i = 0; i <= this.plants.Count - 1; i++) {
                utimeser.TimeSeriesForm.plants.Add(this.plants.Items[i])
            }
        }
        utimeser.TimeSeriesForm.updateForChangeToPlants(utimeser.kDontRecalculateScale)
    }
    
    //redo same as do
    description(): string {
        let result = ""
        result = "delete time series"
        return result
    }
    
}

