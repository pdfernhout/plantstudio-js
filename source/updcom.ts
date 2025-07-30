// unit updcom

import { long, short, float, TColorRef, int, intround, IntToStr, arrayRemove, arrayInsert, getRValue, getGValue, getBValue } from "./common"
import { PdPlant, kDrawNow, kDontDrawNow, BreedingAndTimeSeriesOptionsStructure, TransferDirection } from "./PdPlant"
import { TPoint } from "./TPoint"
import { PdCommand, TrackPhase } from "./PdCommand"
import { domain, DomainOptionsStructure, ViewPlants } from "./PdDomain"
import { ucursor, kScaleAndMove, kAlwaysMove, kDontRecalculateScale, kRecalculateScale } from "./temporary"
import { SinglePoint, digitValueString, nameStringForFileType } from "./usupport";
import { FileExport3DOptionsStructure, fileTypeFor3DExportType } from "./U3dexport"
import { min, safedivExcept, intMax, max, intMin } from "./umath"
import { TRect } from "./TRect"
import { PdPlantDrawingAmendment } from "./PdPlantDrawingAmendment"
import { PdParameter, FieldType, kNotArray } from "./PdParameter"
import { KfObject3D } from "./KfObject3D"
import { PdGeneration } from "./PdGeneration"

// TODO: temporary fix MainForm and BreederForm and TimeSeriesForm
const MainForm: any = undefined
const BreederForm: any = undefined
const TimeSeriesForm: any = undefined

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

export const kSendBackward = true
export const kBringForward = false

export const kPasteMoveDistance = 40

export const kCreateFirstGeneration = true
export const kDontCreateFirstGeneration = false

const kAddAtEnd = -1

const kUp = 0
const kDown = 1
const kLeft = 2
const kRight = 3

const kChangeWidth = true
const kChangeHeight = false


export let numPlantsCreatedThisSession: long = 0
export function incrementNumPlantsCreatedThisSession(): number {
    numPlantsCreatedThisSession++
    return numPlantsCreatedThisSession
}


// ================ local functions

function plantNamesForDescription(aList: PdPlant[]): string {
    let result = ""
    if ((aList === null) || (aList.length <= 0)) {
        return result
    }
    const firstPlant = aList[0]
    if (firstPlant !== null) {
        result = " plant \"" + firstPlant.getName() + "\""
        if (aList.length > 1) {
            result = result + ", others"
        }
    }
    return result
}

// const
const kGapBetweenArrangedPlants = 5


function nameForDirection(direction: short): string {
    let result = ""
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

// ================ value objects 

// value classes to save information about each plant in list

export class PdBooleanValue {
    saveBoolean: boolean = false
    
    constructor(aBoolean: boolean) {
        this.saveBoolean = aBoolean
    }
    
}

export class PdPointValue {
    savePoint: TPoint = new TPoint()
    
    constructor(aPoint: TPoint) {
        this.savePoint = aPoint
    }
    
}

export class PdSingleValue {
    saveSingle: float = 0.0
    
    constructor(aSingle: float) {
        this.saveSingle = aSingle
    }
    
}

export class PdSinglePointValue {
    x: float = 0.0
    y: float = 0.0
    
    constructor(anX: float, aY: float) {
        this.x = anX
        this.y = aY
    }
    
}

export class PdXYZValue {
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0
    
    constructor(anX: float, aY: float, aZ: float) {
        this.x = anX
        this.y = aY
        this.z = aZ
    }
    
}

export class PdSmallintValue {
    saveSmallint: short = 0
    
    constructor(aSmallint: short) {
        this.saveSmallint = aSmallint
    }
    
}

export class PdLongintValue {
    saveLongint: long = 0
    
    constructor(aLongint: long) {
        this.saveLongint = aLongint
    }
    
}

export class PdColorValue {
    saveColor: TColorRef = 0
    
    constructor(aColor: TColorRef) {
        this.saveColor = aColor
    }
    
}

// ================ commands that affect only the drawing area (and domain options) 

export class PdScrollCommand extends PdCommand {
    dragStartPoint: TPoint = new TPoint()
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffSet_mm: SinglePoint = new SinglePoint()
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result = new PdCommand()
        result = this
        if (aTrackPhase === TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
            this.oldOffset_mm = domain.plantDrawOffset_mm()
        } else if (aTrackPhase === TrackPhase.trackMove) {
            if (mouseDidMove) {
                this.newOffSet_mm.x = this.oldOffset_mm.x + (nextPoint.X - this.dragStartPoint.X) / domain.plantDrawScale_PixelsPerMm()
                this.newOffSet_mm.y = this.oldOffset_mm.y + (nextPoint.Y - this.dragStartPoint.Y) / domain.plantDrawScale_PixelsPerMm()
                domain.plantManager.plantDrawOffset_mm = this.newOffSet_mm
                MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
                MainForm.invalidateEntireDrawing()
            }
        } else if (aTrackPhase === TrackPhase.trackRelease) {
        }
        return result
    }
    
    // PdDragCommand.doCommand should do nothing
    redoCommand(): void {
        // not redo
        super.doCommand()
        domain.plantManager.plantDrawOffset_mm = this.newOffSet_mm
        MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
        MainForm.invalidateEntireDrawing()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        MainForm.recalculateAllPlantBoundsRectsForOffsetChange()
        MainForm.invalidateEntireDrawing()
    }
    
    description(): string {
        let result = ""
        result = "scroll in main window"
        return result
    }
    
}

export class PdChangeMagnificationCommand extends PdCommand {
    startDragPoint: TPoint = new TPoint()
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    clickPoint: SinglePoint = new SinglePoint()
    shift: boolean = false
    
    constructor(aNewScale: float, aPoint: TPoint) {
        super()
        this.newScale_pixelsPerMm = aNewScale
        this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
        this.oldOffset_mm = domain.plantDrawOffset_mm()
        this.clickPoint.x = aPoint.X
        this.clickPoint.y = aPoint.Y
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result = new PdCommand()
        let size: TPoint
        let newScaleX: float
        let newScaleY: float
        
        result = this
        if (aTrackPhase === TrackPhase.trackPress) {
            this.startDragPoint = nextPoint
        } else if (aTrackPhase === TrackPhase.trackMove) {
        } else if (aTrackPhase === TrackPhase.trackRelease) {
            size = new TPoint(Math.abs(nextPoint.X - this.startDragPoint.X), Math.abs(this.startDragPoint.Y - nextPoint.Y))
            if ((size.X > 10) && (size.Y > 10)) {
                // have min size in case they move the mouse by mistake
                this.clickPoint.x = min(nextPoint.X, this.startDragPoint.X) + Math.abs(nextPoint.X - this.startDragPoint.X) / 2
                this.clickPoint.y = min(nextPoint.Y, this.startDragPoint.Y) + Math.abs(nextPoint.Y - this.startDragPoint.Y) / 2
                newScaleX = safedivExcept(domain.plantDrawScale_PixelsPerMm() * MainForm.drawingPaintBox.Width, size.X, 1.0)
                newScaleY = safedivExcept(domain.plantDrawScale_PixelsPerMm() * MainForm.drawingPaintBox.Height, size.Y, 1.0)
                this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                this.oldOffset_mm = domain.plantDrawOffset_mm()
                this.newScale_pixelsPerMm = min(newScaleX, newScaleY)
            } else {
                this.clickPoint.x = nextPoint.X
                this.clickPoint.y = nextPoint.Y
                this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                this.oldOffset_mm = domain.plantDrawOffset_mm()
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
        let clickTPoint: TPoint= new TPoint()
        
        super.doCommand()
        if (this.newScale_pixelsPerMm !== 0.0) {
            clickTPoint.X = intround(this.clickPoint.x)
            clickTPoint.Y = intround(this.clickPoint.y)
            MainForm.magnifyOrReduce(this.newScale_pixelsPerMm, clickTPoint, kDrawNow)
        }
        this.newOffset_mm = domain.plantDrawOffset_mm()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        if (this.oldScale_PixelsPerMm !== 0.0) {
            MainForm.magnifyOrReduce(this.oldScale_PixelsPerMm, new TPoint(0, 0), kDrawNow)
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

export class PdCenterDrawingCommand extends PdCommand {
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    
    doCommand(): void {
        super.doCommand()
        this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
        this.oldOffset_mm = domain.plantDrawOffset_mm()
        MainForm.fitVisiblePlantsInDrawingArea(kDrawNow, kScaleAndMove, kAlwaysMove)
        MainForm.recalculateAllPlantBoundsRects(kDontDrawNow)
        this.newScale_pixelsPerMm = domain.plantDrawScale_PixelsPerMm()
        this.newOffset_mm = domain.plantDrawOffset_mm()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
        MainForm.recalculateAllPlantBoundsRects(kDrawNow)
        if (this.oldScale_PixelsPerMm !== 0.0) {
            MainForm.magnifyOrReduce(this.oldScale_PixelsPerMm, new TPoint(0, 0), kDrawNow)
        }
    }
    
    redoCommand(): void {
        super.doCommand()
        domain.plantManager.plantDrawOffset_mm = this.newOffset_mm
        MainForm.recalculateAllPlantBoundsRects(kDrawNow)
        if (this.newScale_pixelsPerMm !== 0.0) {
            MainForm.magnifyOrReduce(this.newScale_pixelsPerMm, new TPoint(0, 0), kDrawNow)
        }
    }
    
    description(): string {
        let result = ""
        result = "scale to fit in main window"
        return result
    }
    
}

export class PdChangeMainWindowOrientationCommand extends PdCommand {
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    oldWindowOrientation: short = 0
    newWindowOrientation: short = 0
    
    constructor(aNewOrientation: short) {
        super()
        // hidden flag not saved
        this.commandChangesPlantFile = false
        this.newWindowOrientation = aNewOrientation
        this.oldWindowOrientation = domain.options.mainWindowOrientation
    }
    
    doCommand(): void {
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            domain.options.mainWindowOrientation = this.newWindowOrientation
            MainForm.updateForChangeToOrientation()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            domain.options.mainWindowOrientation = this.oldWindowOrientation
            MainForm.updateForChangeToOrientation()
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

// ================ commands that affect only the domain 

export class PdChangeDomainOptionsCommand extends PdCommand {
    oldOptions: DomainOptionsStructure = new DomainOptionsStructure()
    newOptions: DomainOptionsStructure = new DomainOptionsStructure()
    
    constructor(aNewOptions: DomainOptionsStructure) {
        super()
        this.commandChangesPlantFile = false
        this.newOptions = aNewOptions
        this.oldOptions = domain.options
    }
    
    doCommand(): void {
        super.doCommand()
        domain.options = this.newOptions
        MainForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.options = this.oldOptions
        MainForm.updateForChangeToDomainOptions()
    }
    
    description(): string {
        let result = ""
        result = "change preferences"
        return result
    }
    
}

export class PdChangeDomain3DOptionsCommand extends PdCommand {
    outputType: short = 0
    oldOptions: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    newOptions: FileExport3DOptionsStructure = new FileExport3DOptionsStructure()
    
    constructor(aNewOptions: FileExport3DOptionsStructure, anOutputType: short) {
        super()
        this.outputType = anOutputType
        this.commandChangesPlantFile = false
        this.newOptions = aNewOptions
        this.oldOptions = domain.exportOptionsFor3D[this.outputType]
    }
    
    doCommand(): void {
        super.doCommand()
        domain.exportOptionsFor3D[this.outputType] = this.newOptions
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.exportOptionsFor3D[this.outputType] = this.oldOptions
    }
    
    description(): string {
        return "change " + nameStringForFileType(fileTypeFor3DExportType(this.outputType)) + " output options"
    }
    
}

export class PdRenameCommand extends PdCommand {
    plant: PdPlant
    oldName: string = ""
    newName: string = ""
    
    constructor(aPlant: PdPlant, aNewName: string) {
        super()
        this.plant = aPlant
        this.oldName = this.plant.getName()
        this.newName = aNewName
    }
    
    doCommand(): void {
        super.doCommand()
        this.plant.setName(this.newName)
        MainForm.updateForRenamingPlant(this.plant)
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.plant.setName(this.oldName)
        MainForm.updateForRenamingPlant(this.plant)
    }
    
    description(): string {
        return "rename \"" + this.oldName + "\" to \"" + this.newName + "\""
    }
    
}

export class PdEditNoteCommand extends PdCommand {
    plant: PdPlant
    oldStrings: string[]
    newStrings: string[]
    
    constructor(aPlant: PdPlant, aNewStrings: string[]) {
        super()
        this.plant = aPlant
        this.oldStrings = this.plant.noteLines
        // we take ownership of this list and delete it if undone
        this.newStrings = aNewStrings
    }
    
    doCommand(): void {
        super.doCommand()
        this.plant.noteLines = this.newStrings
        MainForm.updateForChangeToPlantNote(this.plant)
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.plant.noteLines = this.oldStrings
        MainForm.updateForChangeToPlantNote(this.plant)
    }
    
    description(): string {
        return "change note for \"" + this.plant.getName() + "\""
    }
    
}

export class PdNewCommand extends PdCommand {
    newPlant: PdPlant | null = null
    useWizardPlant: boolean = false
    wizardPlant: PdPlant
    oldSelectedList: PdPlant[] = []
    
    // v2.0
    constructor(aPlant: PdPlant, anOldSelectedList: PdPlant[]) {
        super()
        this.useWizardPlant = true
        this.wizardPlant = aPlant
        // selected list is just pointers, this doesn't take control of them
        if ((anOldSelectedList !== null) && (anOldSelectedList.length > 0)) {
            for (let i = 0; i <= anOldSelectedList.length - 1; i++) {
                this.oldSelectedList.push(anOldSelectedList[i])
            }
        }
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        if ((!this.done) && (this.newPlant !== null)) {
            result += 1
        }
        if ((this.useWizardPlant) && (this.wizardPlant !== null)) {
            result += 1
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        this.newPlant = new PdPlant()
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
            this.newPlant.moveTo(MainForm.standardPastePosition())
            this.newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
            this.newPlant.recalculateBounds(kDrawNow)
            // put new plant at end of plant manager list 
            domain.plantManager.plants.push(this.newPlant)
            // make new plant the only selected plant 
            MainForm.deselectAllPlants()
            MainForm.addSelectedPlant(this.newPlant, kAddAtEnd)
            MainForm.updateForChangeToPlantList()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        arrayRemove(domain.plantManager.plants, this.newPlant)
        MainForm.removeSelectedPlant(this.newPlant)
        if (this.oldSelectedList.length > 0) {
            for (let i = 0; i <= this.oldSelectedList.length - 1; i++) {
                // put back selections from before new plant was added
                MainForm.selectedPlants.push(this.oldSelectedList[i])
            }
        }
        MainForm.updateForChangeToPlantList()
    }
    
    redoCommand(): void {
        super.doCommand()
        MainForm.deselectAllPlants()
        domain.plantManager.plants.push(this.newPlant!)
        MainForm.addSelectedPlant(this.newPlant, kAddAtEnd)
        MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        return "create new plant"
    }
    
}

export class PdSendBackwardOrForwardCommand extends PdCommand {
    backward: boolean = false
    
    constructor(aBackward: boolean) {
        super()
        this.backward = aBackward
    }
    
    doCommand(): void {
        if (this.backward) {
            // assumption here is that selected plants list doesn't change between this command and undo 
            MainForm.moveSelectedPlantsDown()
        } else {
            MainForm.moveSelectedPlantsUp()
        }
    }
    
    undoCommand(): void {
        if (this.backward) {
            MainForm.moveSelectedPlantsUp()
        } else {
            MainForm.moveSelectedPlantsDown()
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

export class PdCreateAmendmentCommand extends PdCommand {
    plant: PdPlant
    newAmendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    
    constructor(aPlant: PdPlant, aNewAmendment: PdPlantDrawingAmendment) {
        super()
        this.plant = aPlant
        if (aNewAmendment === null) {
            throw new Error("Problem: Nil new amendment; in PdCreateAmendmentCommand.createWithPlantAndAmendment.")
        }
        // we take ownership of this and delete it if undone
        this.newAmendment = aNewAmendment
    }
    
    doCommand(): void {
        super.doCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.addAmendment(this.newAmendment)
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.addAmendedPartToList(this.newAmendment.partID, this.newAmendment.typeOfPart)
    }
    
    undoCommand(): void {
        super.undoCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.newAmendment)
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.removeAmendedPartFromList(this.newAmendment.partID, this.newAmendment.typeOfPart)
    }
    
    description(): string {
        return "pose part " + IntToStr(this.newAmendment.partID) + " in plant \"" + this.plant.getName() + "\""
    }
    
}

export class PdDeleteAmendmentCommand extends PdCommand {
    plant: PdPlant
    amendment: PdPlantDrawingAmendment = new PdPlantDrawingAmendment()
    
    constructor(aPlant: PdPlant, anAmendment: PdPlantDrawingAmendment) {
        super()
        this.plant = aPlant
        if (anAmendment === null) {
            throw new Error("Problem: Nil amendment; in PdDeleteAmendmentCommand.createWithPlantAndAmendment.")
        }
        // we take ownership of this and delete it if done
        this.amendment = anAmendment
    }
    
    doCommand(): void {
        super.doCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.amendment)
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.removeAmendedPartFromList(this.amendment.partID, this.amendment.typeOfPart)
    }
    
    undoCommand(): void {
        super.undoCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.addAmendment(this.amendment)
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.addAmendedPartToList(this.amendment.partID, this.amendment.typeOfPart)
    }
    
    description(): string {
        let result = ""
        result = "unpose part " + IntToStr(this.amendment.partID) + " in plant \"" + this.plant.getName() + "\""
        return result
    }
    
}

export class PdEditAmendmentCommand extends PdCommand {
    plant: PdPlant
    field: string = ""
    oldAmendment: PdPlantDrawingAmendment | null = null
    newAmendment: PdPlantDrawingAmendment
    
    constructor(aPlant: PdPlant, aNewAmendment: PdPlantDrawingAmendment, aField: string) {
        super()
        this.plant = aPlant
        this.field = aField
        if (aNewAmendment === null) {
            throw new Error("nil new amendment")
        }
        // we take ownership of this and delete it if undone
        this.newAmendment = aNewAmendment
        this.oldAmendment = this.plant.amendmentForPartID(this.newAmendment.partID)
    }
    
    doCommand(): void {
        let index: int
        let oldItemIndex: int
        
        super.doCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        if (this.oldAmendment !== null) {
            this.plant.removeAmendment(this.oldAmendment)
        }
        this.plant.addAmendment(this.newAmendment)
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.updatePoseInfo()
    }
    
    undoCommand(): void {
        super.undoCommand()
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        this.plant.removeAmendment(this.newAmendment)
        if (this.oldAmendment !== null) {
            this.plant.addAmendment(this.oldAmendment)
        }
        this.plant.recalculateBounds(kDrawNow)
        MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
        MainForm.updatePoseInfo()
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

export class PdSelectPosingPartCommand extends PdCommand {
    plant: PdPlant
    newPartID: long = 0
    oldPartID: long = 0
    oldPartType: string = ""
    newPartType: string = ""
    
    constructor(aPlant: PdPlant, aNewPartID: long, anOldPartID: long, aNewPartType: string, anOldPartType: string) {
        super()
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
        super.doCommand()
        MainForm.selectedPlantPartID = this.newPartID
        MainForm.selectedPlantPartType = this.newPartType
        MainForm.updatePosingForSelectedPlantPart()
        MainForm.redrawFocusedPlantOnly(kDrawNow)
    }
    
    undoCommand(): void {
        super.undoCommand()
        MainForm.selectedPlantPartID = this.oldPartID
        MainForm.selectedPlantPartType = this.oldPartType
        MainForm.updatePosingForSelectedPlantPart()
        MainForm.redrawFocusedPlantOnly(kDrawNow)
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
export class PdCommandWithListOfPlants extends PdCommand {
    plantList: PdPlant[] = []
    values: any[] = []
    plant: PdPlant | null = null
    removesPlantAmendments: boolean = false
    listOfAmendmentLists: PdPlantDrawingAmendment[][] = []
    
    // for temporary use
    constructor(aList: PdPlant[]) {
        super()
        if (aList.length > 0) {
            for (let i = 0; i <= aList.length - 1; i++) {
                this.plantList.push(aList[i])
            }
        }
        this.values = []
    }
    
    setUpToRemoveAmendmentsWhenDone(): void {
        // call this method after create method if the command should remove amendments
        this.removesPlantAmendments = true
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                const plant = this.plantList[i]
                const aList: PdPlantDrawingAmendment[] = []
                if (plant.amendments.length > 0) {
                    for (let j = 0; j <= plant.amendments.length - 1; j++) {
                        aList.push(plant.amendments[j])
                    }
                }
                this.listOfAmendmentLists.push(aList)
            }
        }
    }
    
    doCommand(): void {   
        super.doCommand()
        if (!this.removesPlantAmendments) {
            return
        }
        let atLeastOnePlantHadAmendments = false
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                const aList = this.listOfAmendmentLists[i]
                if (aList.length > 0) {
                    atLeastOnePlantHadAmendments = true
                    this.plantList[i].clearPointersToAllAmendments()
                }
            }
        }
        if (atLeastOnePlantHadAmendments) {
            if (MainForm) MainForm.updatePosingForFirstSelectedPlant()
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (!this.removesPlantAmendments) {
            return
        }
        let atLeastOnePlantHadAmendments = false
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                const aList = this.listOfAmendmentLists[i]
                if (aList.length > 0) {
                    atLeastOnePlantHadAmendments = true
                    this.plantList[i].restoreAmendmentPointersToList(aList)
                }
            }
        }
        if (atLeastOnePlantHadAmendments) {
            if (MainForm) MainForm.updatePosingForFirstSelectedPlant()
        }
    }
    
    invalidateCombinedPlantRects(): void {
        let redrawRect: TRect = new TRect(0, 0, 0, 0)
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                if (i === 0) {
                    redrawRect = this.plantList[i].boundsRect_pixels()
                } else {
                    redrawRect = redrawRect.union(this.plantList[i].boundsRect_pixels())
                }
            }
        }
        // TODO: PDF Fix availability of MainForma
        if (MainForm) MainForm.invalidateDrawingRect(redrawRect)
    }
    
}

export class PdChangeSelectedPlantsCommand extends PdCommandWithListOfPlants {
    newList: PdPlant[] = []
    
    constructor(aList: PdPlant[], aNewList: PdPlant[]) {
        super(aList)
        // which plants are selected not saved
        this.commandChangesPlantFile = false
        if (aNewList.length > 0) {
            for (let i = 0; i <= aNewList.length - 1; i++) {
                this.newList.push(aNewList[i])
            }
        }
    }
    
    doCommand(): void {
        // which plants are selected not saved
        this.commandChangesPlantFile = false
        super.doCommand()
        // MainForm.deselectAllPlants; // don't want this, it updates, and we will be updating soon
        MainForm.selectedPlants.Clear()
        if (this.newList.length > 0) {
            MainForm.selectedPlants.push(this.newList[0])
            if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                MainForm.showOnePlantExclusively(kDontDrawNow)
            } else {
                if (this.newList.length > 1) {
                    for (let i = 1; i <= this.newList.length - 1; i++) {
                        MainForm.selectedPlants.push(this.newList[i])
                    }
                }
            }
        }
        MainForm.updateForChangeToPlantSelections()
    }
    
    undoCommand(): void {
        super.undoCommand()
        // MainForm.deselectAllPlants; // don't want this, it updates, and we will be updating soon
        MainForm.selectedPlants.Clear()
        if (this.plantList.length > 0) {
            MainForm.selectedPlants.push(this.plantList[0])
            if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                MainForm.showOnePlantExclusively(kDontDrawNow)
            } else {
                if (this.plantList.length > 1) {
                    for (let i = 1; i <= this.plantList.length - 1; i++) {
                        MainForm.selectedPlants.push(this.plantList[i])
                    }
                }
            }
        }
        MainForm.updateForChangeToPlantSelections()
    }
    
    description(): string {
        let result = ""
        if (this.newList.length <= 0) {
            result = "deselect all plants"
        } else {
            result = "select" + plantNamesForDescription(this.newList)
        }
        return result
    }
    
}

export class PdSelectOrDeselectAllCommand extends PdCommandWithListOfPlants {
    deselect: boolean = false
    
    doCommand(): void {
        // which plants are selected not saved
        this.commandChangesPlantFile = false
        super.doCommand()
        if (this.deselect) {
            // MainForm.deselectAllPlants;
            MainForm.deselectAllPlants()
        } else {
            MainForm.selectedPlants.Clear()
        }
        if (!this.deselect) {
            if (domain.plantManager.plants.length > 0) {
                for (let i = 0; i <= domain.plantManager.plants.length - 1; i++) {
                    MainForm.selectedPlants.push(domain.plantManager.plants[i])
                }
            }
        }
        MainForm.updateForChangeToPlantSelections()
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (!this.deselect) {
            // MainForm.deselectAllPlants;
            MainForm.deselectAllPlants()
        } else {
            MainForm.selectedPlants.Clear()
        }
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                MainForm.selectedPlants.push(this.plantList[i])
            }
        }
        MainForm.updateForChangeToPlantSelections()
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

export class PdResizePlantsCommand extends PdCommandWithListOfPlants {
    initialized: boolean = false
    doneInMouseCommand: boolean = false
    newValues: PdSingleValue[] = []
    oldSizes: PdPointValue[] = []
    aspectRatios: PdSingleValue[] = []
    dragStartPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    multiplier: float = 0.0
    newValue: float = 0.0
    
    createWithMultiplier(aMultiplier: float): PdResizePlantsCommand {
        this.saveInitialValues()
        this.multiplier = aMultiplier
        return this
    }
    
    createWithListOfPlantsAndNewValue(aNewValue: float): PdResizePlantsCommand {
        this.saveInitialValues()
        this.newValue = aNewValue
        return this
    }
    
    saveInitialValues(): void {
        let aspectRatio: float
        
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                if (this.plant.boundsRect_pixels().height !== 0) {
                    aspectRatio = 1.0 * this.plant.boundsRect_pixels().width / this.plant.boundsRect_pixels().height
                } else {
                    aspectRatio = 1.0
                }
                this.aspectRatios.push(new PdSingleValue(aspectRatio))
                this.values.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                this.oldSizes.push(new PdPointValue(new TPoint(this.plant.boundsRect_pixels().width, this.plant.boundsRect_pixels().height)))
            }
        }
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result: PdCommand | null = this
        if (aTrackPhase === TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
        } else if ((aTrackPhase === TrackPhase.trackMove) && (mouseDidMove)) {
            if (!this.initialized) {
                this.saveInitialValues()
                this.initialized = true
                this.doneInMouseCommand = true
                this.offset = new TPoint(0, 0)
                super.doCommand()
                return result
            }
            if (this.initialized) {
                this.offset.X = nextPoint.X - this.dragStartPoint.X
                this.offset.Y = nextPoint.Y - this.dragStartPoint.Y
                this.doCommand()
            }
        } else if (aTrackPhase === TrackPhase.trackRelease) {
            if ((!mouseDidMove) || (!this.initialized)) {
                result = null
            }
        }
        return result
    }
    
    doCommand(): void {
        if (!this.doneInMouseCommand) {
            super.doCommand()
        }
        if (this.plantList.length <= 0) {
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
            this.newValues.length = 0
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    if (this.multiplier !== 0) {
                        this.plant.drawingScale_PixelsPerMm = this.plant.drawingScale_PixelsPerMm * this.multiplier
                    } else if (this.newValue !== 0) {
                        this.plant.drawingScale_PixelsPerMm = this.newValue
                    } else {
                        const oldSize = this.oldSizes[i].savePoint
                        const aspectRatio = this.aspectRatios[i].saveSingle
                        const oldScale = this.values[i].saveSingle
                        const newSize: TPoint = new TPoint()
                        // 10 pixels is arbitrary minimum
                        newSize.Y = intMax(10, oldSize.Y - this.offset.Y)
                        newSize.X = intround(newSize.Y * aspectRatio)
                        this.plant.calculateDrawingScaleToFitSize(newSize)
                        if ((this.plant.drawingScale_PixelsPerMm > oldScale) && (this.offset.Y > 0)) {
                            // this is to counteract a bug that when you resize down, it resizes up the first mouse move, then down
                            // can't figure out why, just putting in this ugly fix to stop it from doing that
                            this.plant.drawingScale_PixelsPerMm = oldScale
                        }
                    }
                    this.newValues.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            if (!this.doneInMouseCommand) {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.drawingScale_PixelsPerMm = this.values[i].saveSingle
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        if (!this.initialized) {
            return
        }
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.drawingScale_PixelsPerMm = this.newValues[i].saveSingle
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    description(): string {
        return "resize" + plantNamesForDescription(this.plantList)
    }
    
}

export class PdResizePlantsToSameWidthOrHeightCommand extends PdCommandWithListOfPlants {
    newValues: PdSingleValue[] = []
    oldSizes: PdPointValue[] = []
    newWidth: float = 0.0
    newHeight: float = 0.0
    changeWidth: boolean = false
    
    constructor(aList: PdPlant[], aNewWidth: float, aNewHeight: float, aChangeWidth: boolean) {
        super(aList)
        this.saveInitialValues()
        this.newWidth = aNewWidth
        this.newHeight = aNewHeight
        this.changeWidth = aChangeWidth
    }
    
    saveInitialValues(): void {
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.values.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                this.oldSizes.push(new PdPointValue(new TPoint(this.plant.boundsRect_pixels().width, this.plant.boundsRect_pixels().height)))
            }
        }
    }
    
    doCommand(): void {
        let newScaleX: float
        let newScaleY: float
        
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            this.newValues.length = 0
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.recalculateBounds(kDontDrawNow)
                    if (this.changeWidth) {
                        this.plant.drawingScale_PixelsPerMm = safedivExcept(this.plant.drawingScale_PixelsPerMm * this.newWidth, this.plant.boundsRect_pixels().width, 0.1)
                    } else {
                        this.plant.drawingScale_PixelsPerMm = safedivExcept(this.plant.drawingScale_PixelsPerMm * this.newHeight, this.plant.boundsRect_pixels().height, 0.1)
                    }
                    this.newValues.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.drawingScale_PixelsPerMm = this.values[i].saveSingle
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        MainForm.updateForChangeToSelectedPlantsDrawingScale()
    }
    
    redoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.drawingScale_PixelsPerMm = this.newValues[i].saveSingle
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        MainForm.updateForChangeToSelectedPlantsDrawingScale()
    }
    
    description(): string {
        return "scale" + plantNamesForDescription(this.plantList)
    }
    
}

export class PdPackPlantsCommand extends PdCommandWithListOfPlants {
    newScales: PdSingleValue[] = []
    // TODO: oldSizes may not be used in this class
    oldSizes: PdPointValue[] = []
    newPoints: PdPointValue[] = []
    oldPoints: PdPointValue[] = []
    focusRect: TRect = new TRect()
    
    constructor(aList: PdPlant[]    , aFocusRect: TRect) {
        super(aList)
        this.saveInitialValues()
        this.focusRect = aFocusRect
    }
    
    saveInitialValues(): void {
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.values.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                this.oldPoints.push(new PdPointValue(this.plant.basePoint_pixels()))
                this.oldSizes.push(new PdPointValue(new TPoint(this.plant.boundsRect_pixels().width, this.plant.boundsRect_pixels().height)))
            }
        }
    }
    
    doCommand(): void {
        let newScaleX: float
        let newScaleY: float
        let widestBox: int
        let tallestBox: int
        let tallestHeight: int
        let offset: TPoint = new TPoint()
        let newPoint: TPoint = new TPoint()
        let totalHeight: int
        let averageHeight: int
        let remainingX: int
        let plantScaleChanged: boolean
        let newScale: float
        
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        this.invalidateCombinedPlantRects()
        this.newScales.length = 0
        this.newPoints.length = 0
        let lastPlant: PdPlant | null = null
        totalHeight = 0
        tallestHeight = 0
        try {
            ucursor.cursor_startWait()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    totalHeight = totalHeight + this.plant.boundsRect_pixels().height
                }
            }
            averageHeight = totalHeight / this.plantList.length
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.recalculateBounds(kDontDrawNow)
                    plantScaleChanged = false
                    // calculate new scale (resize based on average height)
                    newScale = safedivExcept(this.plant.drawingScale_PixelsPerMm * averageHeight, this.plant.boundsRect_pixels().height * 1.0, 0.1)
                    if (Math.abs(newScale - this.plant.drawingScale_PixelsPerMm) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        plantScaleChanged = true
                        this.plant.drawingScale_PixelsPerMm = newScale
                        this.plant.recalculateBounds(kDontDrawNow)
                    }
                    this.newScales.push(new PdSingleValue(this.plant.drawingScale_PixelsPerMm))
                    // calculate new position
                    offset.X = this.plant.basePoint_pixels().X - this.plant.boundsRect_pixels().Left
                    offset.Y = this.plant.basePoint_pixels().Y - this.plant.boundsRect_pixels().Top
                    remainingX = this.plant.boundsRect_pixels().width - offset.X
                    if ((i <= 0) || (lastPlant === null)) {
                        newPoint.X = offset.X + kGapBetweenArrangedPlants
                        newPoint.Y = offset.Y + kGapBetweenArrangedPlants
                    } else {
                        newPoint.X = lastPlant.boundsRect_pixels().Right + kGapBetweenArrangedPlants + offset.X
                        newPoint.Y = lastPlant.boundsRect_pixels().Top + offset.Y
                    }
                    if (newPoint.X + remainingX > MainForm.drawingPaintBox.Width) {
                        newPoint.X = offset.X + kGapBetweenArrangedPlants
                        newPoint.Y = tallestHeight + kGapBetweenArrangedPlants + offset.Y
                    }
                    this.plant.moveTo(newPoint)
                    this.newPoints.push(new PdPointValue(this.plant.basePoint_pixels()))
                    if (plantScaleChanged) {
                        this.plant.recalculateBounds(kDrawNow)
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
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let oldScale: float
        
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    oldScale = this.plant.drawingScale_PixelsPerMm
                    this.plant.drawingScale_PixelsPerMm = this.values[i].saveSingle
                    this.plant.moveTo(this.oldPoints[i].savePoint)
                    if (Math.abs(this.plant.drawingScale_PixelsPerMm - oldScale) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        this.plant.recalculateBounds(kDrawNow)
                    } else {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        let oldScale: float
        
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    oldScale = this.plant.drawingScale_PixelsPerMm
                    this.plant.drawingScale_PixelsPerMm = this.newScales[i].saveSingle
                    this.plant.moveTo(this.newPoints[i].savePoint)
                    if (Math.abs(this.plant.drawingScale_PixelsPerMm - oldScale) > this.plant.drawingScale_PixelsPerMm / 20.0) {
                        // don't rescale and redraw plant if scale hardly changes
                        this.plant.recalculateBounds(kDrawNow)
                    } else {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsDrawingScale()
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

export class PdChangeMainWindowViewingOptionCommand extends PdCommandWithListOfPlants {
    selectedList: PdPlant[] = []
    oldScale_PixelsPerMm: float = 0.0
    newScale_pixelsPerMm: float = 0.0
    oldOffset_mm: SinglePoint = new SinglePoint()
    newOffset_mm: SinglePoint = new SinglePoint()
    oldMainWindowViewingOption: short = 0
    newMainWindowViewingOption: short = 0
    
    constructor(aList: PdPlant[], aSelectedList: PdPlant[], aNewOption: short) {
        super(aList)
        // hidden flag not saved
        this.commandChangesPlantFile = false
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.values.push(new PdBooleanValue(this.plantList[i].hidden))
            }
        }
        if (aSelectedList.length > 0) {
            for (let i = 0; i <= aSelectedList.length - 1; i++) {
                this.selectedList.push(aSelectedList[i])
            }
        }
        this.oldMainWindowViewingOption = domain.options.mainWindowViewMode
        this.newMainWindowViewingOption = aNewOption
    }
    
    doCommand(): void {
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            domain.options.mainWindowViewMode = this.newMainWindowViewingOption
            switch (this.newMainWindowViewingOption) {
                case ViewPlants.kViewPlantsInMainWindowOneAtATime:
                    this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                    this.oldOffset_mm = domain.plantDrawOffset_mm()
                    MainForm.deselectAllPlantsButFirst()
                    // hides all plants but first; calls fitVisiblePlantsInDrawingArea
                    MainForm.showOnePlantExclusively(kDontDrawNow)
                    MainForm.recalculateSelectedPlantsBoundsRects(kDrawNow)
                    MainForm.invalidateEntireDrawing()
                    MainForm.updateForChangeToPlantSelections()
                    this.newScale_pixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                    this.newOffset_mm = domain.plantDrawOffset_mm()
                    break
                case ViewPlants.kViewPlantsInMainWindowFreeFloating:
                    this.oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                    this.oldOffset_mm = domain.plantDrawOffset_mm()
                    MainForm.hideOrShowSomePlants(this.plantList, null, kShow, kDontDrawNow)
                    MainForm.fitVisiblePlantsInDrawingArea(kDontDrawNow, kScaleAndMove, kAlwaysMove)
                    // first drawing gets correct bounds rects so numbers get counted for progress bar - messy
                    MainForm.recalculateAllPlantBoundsRects(kDontDrawNow)
                    MainForm.recalculateAllPlantBoundsRects(kDrawNow)
                    MainForm.invalidateEntireDrawing()
                    this.newScale_pixelsPerMm = domain.plantDrawScale_PixelsPerMm()
                    this.newOffset_mm = domain.plantDrawOffset_mm()
                    break
            }
            MainForm.updateMenusForChangeToViewingOption()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            domain.options.mainWindowViewMode = this.oldMainWindowViewingOption
            switch (this.newMainWindowViewingOption) {
                case ViewPlants.kViewPlantsInMainWindowOneAtATime:
                    MainForm.recalculateAllPlantBoundsRects(kDrawNow)
                    MainForm.invalidateSelectedPlantRectangles()
                    domain.plantManager.plantDrawScale_PixelsPerMm = this.oldScale_PixelsPerMm
                    domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
                    // restore original hidden flags - all plants 
                    // not used
                    MainForm.hideOrShowSomePlants(this.plantList, this.values, false, kDontDrawNow)
                    MainForm.fitVisiblePlantsInDrawingArea(kDontDrawNow, kScaleAndMove, kAlwaysMove)
                    MainForm.recalculateAllPlantBoundsRects(kDrawNow)
                    // MainForm.invalidateSelectedPlantRectangles;
                    MainForm.invalidateEntireDrawing()
                    // restore original selection - selected plants only 
                    MainForm.selectedPlants.Clear()
                    if (this.selectedList.length > 0) {
                        for (let i = 0; i <= this.selectedList.length - 1; i++) {
                            MainForm.selectedPlants.push(this.selectedList[i])
                        }
                    }
                    MainForm.updateForChangeToPlantSelections()
                    break
                case ViewPlants.kViewPlantsInMainWindowFreeFloating:
                    domain.plantManager.plantDrawScale_PixelsPerMm = this.oldScale_PixelsPerMm
                    domain.plantManager.plantDrawOffset_mm = this.oldOffset_mm
                    // restore original hidden flags - all plants 
                    // not used
                    MainForm.hideOrShowSomePlants(this.plantList, this.values, false, kDontDrawNow)
                    MainForm.fitVisiblePlantsInDrawingArea(kDontDrawNow, kScaleAndMove, kAlwaysMove)
                    MainForm.recalculateAllPlantBoundsRects(kDrawNow)
                    // MainForm.invalidateSelectedPlantRectangles;
                    MainForm.invalidateEntireDrawing()
                    MainForm.updateForChangeToPlantSelections()
                    break
            }
            MainForm.updateMenusForChangeToViewingOption()
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

export class PdDragCommand extends PdCommandWithListOfPlants {
    initialized: boolean = false
    doneInMouseCommand: boolean = false
    dragAllPlantsToOnePoint: boolean = false
    dragStartPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    newPoint: TPoint = new TPoint()

    constructor(aList: PdPlant[]) {
        super(aList)
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.values.push(new PdPointValue(this.plant.basePoint_pixels()))
            }
        }
    }
    
    createWithListOfPlantsAndDragOffset(anOffset: TPoint): PdDragCommand {
        this.offset = anOffset
        this.initialized = true
        return this
    }
    
    createWithListOfPlantsAndNewPoint(aNewPoint: TPoint): PdDragCommand {
        this.dragAllPlantsToOnePoint = true
        this.newPoint = aNewPoint
        this.initialized = true
        return this
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result: PdCommand | null = this
        if (aTrackPhase === TrackPhase.trackPress) {
            this.dragStartPoint = nextPoint
        } else if (aTrackPhase === TrackPhase.trackMove) {
            if ((!this.initialized) && mouseDidMove) {
                if (this.plantList.length > 0) {
                    for (let i = 0; i <= this.plantList.length - 1; i++) {
                        this.plant = this.plantList[i]
                        this.values.push(new PdPointValue(this.plant.basePoint_pixels()))
                    }
                }
                this.initialized = true
                super.doCommand()
            }
            if (this.initialized) {
                this.offset.X = nextPoint.X - this.dragStartPoint.X
                this.offset.Y = nextPoint.Y - this.dragStartPoint.Y
                this.invalidateCombinedPlantRects()
                if (this.plantList.length > 0) {
                    for (let i = 0; i <= this.plantList.length - 1; i++) {
                        this.plant = this.plantList[i]
                        this.plant.moveTo(this.values[i].savePoint)
                        this.plant.moveBy(this.offset)
                        if (domain.options.cachePlantBitmaps) {
                            this.plant.recalculateBoundsForOffsetChange()
                        }
                    }
                }
                MainForm.updateForChangeToSelectedPlantsLocation()
                this.invalidateCombinedPlantRects()
                this.doneInMouseCommand = true
            }
        } else if (aTrackPhase === TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                result = null
            }
        }
        return result
    }
    
    doCommand(): void {
        if (this.doneInMouseCommand) {
            // only used if not done by mouse command-otherwise done in trackMouse
            return
        }
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.dragAllPlantsToOnePoint) {
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.moveTo(this.newPoint)
                    if (domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        } else {
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.moveBy(this.offset)
                    if (domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.moveTo(this.values[i].savePoint)
                if (domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    redoCommand(): void {
        if (!this.initialized) {
            return
        }
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.dragAllPlantsToOnePoint) {
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.moveTo(this.newPoint)
                    if (domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        } else {
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.moveBy(this.offset)
                    if (domain.options.cachePlantBitmaps) {
                        this.plant.recalculateBoundsForOffsetChange()
                    }
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
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

export class PdAlignPlantsCommand extends PdCommandWithListOfPlants {
    newPoints: PdPointValue[] = []
    focusRect: TRect = new TRect()
    alignDirection: short = 0
    
    constructor(aList: PdPlant[], aRect: TRect, aDirection: short) {
        super(aList)
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.values.push(new PdPointValue(this.plant.basePoint_pixels()))
            }
        }
        this.newPoints = []
        this.focusRect = aRect
        this.alignDirection = aDirection
    }
    
    doCommand(): void {
        let offset: TPoint = new TPoint()
        
        super.doCommand()
        this.newPoints.length = 0
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                const newPoint: TPoint = this.plant.basePoint_pixels()
                offset.X = this.plant.basePoint_pixels().X - this.plant.boundsRect_pixels().Left
                offset.Y = this.plant.basePoint_pixels().Y - this.plant.boundsRect_pixels().Top
                switch (this.alignDirection) {
                    case kUp:
                        newPoint.Y = this.focusRect.Top + offset.Y
                        break
                    case kDown:
                        newPoint.Y = this.focusRect.Bottom - (this.plant.boundsRect_pixels().height - offset.Y)
                        break
                    case kLeft:
                        newPoint.X = this.focusRect.Left + offset.X
                        break
                    case kRight:
                        newPoint.X = this.focusRect.Right - (this.plant.boundsRect_pixels().height - offset.X)
                        break
                }
                this.plant.moveTo(newPoint)
                this.newPoints.push(new PdPointValue(this.plant.basePoint_pixels()))
                if (domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.moveTo(this.values[i].savePoint)
                if (domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    redoCommand(): void {
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.moveTo(this.newPoints[i].savePoint)
                if (domain.options.cachePlantBitmaps) {
                    this.plant.recalculateBoundsForOffsetChange()
                }
            }
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = "align" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdRotateCommand extends PdCommandWithListOfPlants {
    rotateDirection: short = 0
    newRotation: float = 0.0
    offsetRotation: float = 0.0
    startDragPoint: TPoint = new TPoint()
    
    constructor(aList: PdPlant[], aRotateDirection: short, aNewRotation: short) {
        // create using this constructor if this is from clicking on a spinEdit
        super(aList)
        this.rotateDirection = aRotateDirection
        this.newRotation = aNewRotation
        if (this.newRotation < -360) {
            this.newRotation = -360
        }
        if (this.newRotation > 360) {
            this.newRotation = 360
        }
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                switch (this.rotateDirection) {
                    case kRotateX:
                        this.values.push(new PdSingleValue(this.plant.xRotation))
                        break
                    case kRotateY:
                        this.values.push(new PdSingleValue(this.plant.yRotation))
                        break
                    case kRotateZ:
                        this.values.push(new PdSingleValue(this.plant.zRotation))
                        break
                }
            }
        }
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result: PdCommand = this
        let newRotation: float
        
        if (aTrackPhase === TrackPhase.trackPress) {
            // assume that if this function is called, the command was not already initialized
            //    from clicking on a spinEdit, so we have no values and no rotateDirection 
            this.startDragPoint = nextPoint
            this.invalidateCombinedPlantRects()
            super.doCommand()
        } else if (aTrackPhase === TrackPhase.trackMove) {
            if (this.rotateDirection === kRotateNotInitialized) {
                if (rightButtonDown) {
                    this.rotateDirection = kRotateZ
                } else if (Math.abs(nextPoint.X - this.startDragPoint.X) > Math.abs(nextPoint.Y - this.startDragPoint.Y)) {
                    this.rotateDirection = kRotateX
                } else {
                    this.rotateDirection = kRotateY
                }
                if (this.plantList.length > 0) {
                    for (let i = 0; i <= this.plantList.length - 1; i++) {
                        this.plant = this.plantList[i]
                        switch (this.rotateDirection) {
                            case kRotateX:
                                this.values.push(new PdSingleValue(this.plant.xRotation))
                                break
                            case kRotateY:
                                this.values.push(new PdSingleValue(this.plant.yRotation))
                                break
                            case kRotateZ:
                                this.values.push(new PdSingleValue(this.plant.zRotation))
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
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    newRotation = this.values[i].saveSingle + this.offsetRotation
                    if (newRotation < -360) {
                        newRotation = 360 - (Math.abs(newRotation) - 360)
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
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToPlantRotations()
        } else if (aTrackPhase === TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                // if they just clicked, rotate ten degrees anyway
                this.invalidateCombinedPlantRects()
                if (this.plantList.length > 0) {
                    for (let i = 0; i <= this.plantList.length - 1; i++) {
                        this.plant = this.plantList[i]
                        this.values.push(new PdSingleValue(this.plant.xRotation))
                    }
                }
                this.rotateDirection = kRotateX
                if (rightButtonDown) {
                    // v2.0 if they just clicked with the right mouse button, rotate -10 degrees
                    // v2.0 use the domain rotation increment instead of always 10 degrees
                    this.offsetRotation = -domain.options.rotationIncrement
                } else {
                    this.offsetRotation = domain.options.rotationIncrement
                }
                if (this.plantList.length > 0) {
                    for (let i = 0; i <= this.plantList.length - 1; i++) {
                        this.plant = this.plantList[i]
                        newRotation = this.values[i].saveSingle + this.offsetRotation
                        if (newRotation < -360) {
                            newRotation = 360 - (Math.abs(newRotation) - 360)
                        }
                        if (newRotation > 360) {
                            newRotation = -360 + (newRotation - 360)
                        }
                        this.plant.xRotation = newRotation
                        this.plant.recalculateBounds(kDrawNow)
                    }
                }
                this.invalidateCombinedPlantRects()
                MainForm.updateForChangeToPlantRotations()
            }
        }
        return result
    }
    
    doCommand(): void {
        if (this.done) {
            // if done in mousemove 
            return
        }
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                switch (this.rotateDirection) {
                    case kRotateX:
                        if (this.offsetRotation !== 0) {
                            this.plant.xRotation = min(360, max(-360, this.values[i].saveSingle + this.offsetRotation))
                        } else {
                            this.plant.xRotation = this.newRotation
                        }
                        break
                    case kRotateY:
                        if (this.offsetRotation !== 0) {
                            this.plant.yRotation = min(360, max(-360, this.values[i].saveSingle + this.offsetRotation))
                        } else {
                            this.plant.yRotation = this.newRotation
                        }
                        break
                    case kRotateZ:
                        if (this.offsetRotation !== 0) {
                            this.plant.zRotation = min(360, max(-360, this.values[i].saveSingle + this.offsetRotation))
                        } else {
                            this.plant.zRotation = this.newRotation
                        }
                        break
                }
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        MainForm.updateForChangeToPlantRotations()
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                switch (this.rotateDirection) {
                    case kRotateX:
                        this.plant.xRotation = this.values[i].saveSingle
                        break
                    case kRotateY:
                        this.plant.yRotation = this.values[i].saveSingle
                        break
                    case kRotateZ:
                        this.plant.zRotation = this.values[i].saveSingle
                        break
                }
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        MainForm.updateForChangeToPlantRotations()
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = nameForDirection(this.rotateDirection) + " rotate" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdResetRotationsCommand extends PdCommandWithListOfPlants {
    oldX: float = 0.0
    oldY: float = 0.0
    oldZ: float = 0.0
    
    doCommand(): void {
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.values.push(new PdXYZValue(this.plant.xRotation, this.plant.yRotation, this.plant.zRotation))
                this.plant.xRotation = 0
                this.plant.yRotation = 0
                this.plant.zRotation = 0
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        MainForm.updateForChangeToPlantRotations()
    }
    
    redoCommand(): void {
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.xRotation = 0
                this.plant.yRotation = 0
                this.plant.zRotation = 0
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        MainForm.updateForChangeToPlantRotations()
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.xRotation = this.values[i].x
                this.plant.yRotation = this.values[i].y
                this.plant.zRotation = this.values[i].z
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
        MainForm.updateForChangeToPlantRotations()
    }
    
    description(): string {
        let result = ""
        result = "reset rotation for" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeDrawingScaleCommand extends PdCommandWithListOfPlants {
    newScale: float = 0.0
    
    constructor(aList: PdPlant[], aNewScale: float) {
        super(aList)
        this.newScale = aNewScale
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.values.push(new PdSingleValue(this.plantList[i].drawingScale_PixelsPerMm))
            }
        }
    }
    
    doCommand(): void {
        super.doCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.drawingScale_PixelsPerMm = this.newScale
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    undoCommand(): void {
        super.undoCommand()
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                this.plant.drawingScale_PixelsPerMm = this.values[i].saveSingle
                this.plant.recalculateBounds(kDrawNow)
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

export class PdChangePlantAgeCommand extends PdCommandWithListOfPlants {
    newAge: short = 0
    
    constructor(aList: PdPlant[], aNewAge: short) {
        super(aList)
        this.newAge = aNewAge
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.values.push(new PdSmallintValue(this.plantList[i].age))
            }
        }
    }
    
    doCommand(): void {
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    // if primary selected plant has longer lifespan than other selected plants, cut off age
                    //        at max for those plants 
                    this.plant.setAge(intMin(this.newAge, this.plant.pGeneral.ageAtMaturity))
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            MainForm.updateLifeCyclePanelForFirstSelectedPlant()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.setAge(this.values[i].saveSmallint)
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            MainForm.updateLifeCyclePanelForFirstSelectedPlant()
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

export class PdAnimatePlantCommand extends PdCommandWithListOfPlants {
    age: short = 0
    oldestAgeAtMaturity: short = 0
    
    constructor(aList: PdPlant[]) {
        super(aList)
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.values.push(new PdSmallintValue(this.plantList[i].age))
            }
        }
    }
    
    doCommand(): void {
        let plant: PdPlant
        
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        this.age = 0
        // find oldest age 
        this.oldestAgeAtMaturity = 0
        for (let i = 0; i <= this.plantList.length - 1; i++) {
            plant = this.plantList[i]
            if ((i === 0) || (plant.pGeneral.ageAtMaturity > this.oldestAgeAtMaturity)) {
                this.oldestAgeAtMaturity = plant.pGeneral.ageAtMaturity
            }
        }
        // reset all plants to age zero and draw them 
        domain.temporarilyHideSelectionRectangles = true
        this.invalidateCombinedPlantRects()
        try {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                plant = this.plantList[i]
                plant.reset()
                plant.recalculateBounds(kDrawNow)
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForPossibleChangeToDrawing()
        } finally {
            domain.temporarilyHideSelectionRectangles = false
        }
        MainForm.animateCommand = this
        MainForm.startAnimation()
    }
    
    animateOneDay(): void {
        let plant: PdPlant
        
        // grow all plants one day 
        domain.temporarilyHideSelectionRectangles = true
        try {
            this.invalidateCombinedPlantRects()
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                plant = this.plantList[i]
                if (this.age < plant.pGeneral.ageAtMaturity) {
                    plant.nextDay()
                    plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            if (MainForm.lifeCycleShowing()) {
                // don't want to update params, because they don't change during animation 
                MainForm.updateLifeCyclePanelForFirstSelectedPlant()
            } else if (MainForm.statsShowing()) {
                MainForm.updateStatisticsPanelForFirstSelectedPlant()
            }
            MainForm.updateForPossibleChangeToDrawing()
            this.age += 1
        } finally {
            domain.temporarilyHideSelectionRectangles = false
        }
        if (this.age >= this.oldestAgeAtMaturity) {
            MainForm.stopAnimation()
        }
        MainForm.updateForChangeToSelectedPlantsLocation()
    }
    
    undoCommand(): void {
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.plant.setAge(this.values[i].saveSmallint)
                    this.plant.recalculateBounds(kDrawNow)
                }
            }
            this.invalidateCombinedPlantRects()
            MainForm.updateForChangeToSelectedPlantsLocation()
            // changing age causes life cycle panel to need to redraw 
            MainForm.updateLifeCyclePanelForFirstSelectedPlant()
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

export class PdHideOrShowCommand extends PdCommandWithListOfPlants {
    hide: boolean = false
    newValues: PdBooleanValue[] | null = null
    
    constructor(aList: PdPlant[], aHide: boolean, aHideList: PdBooleanValue[] | null = null) {
        super(aList)
        // hidden flag not saved
        this.commandChangesPlantFile = false
        this.hide = aHide
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.values.push(new PdBooleanValue(this.plantList[i].hidden))
            }
        }
        if (aHideList && aHideList.length > 0) {
            this.newValues = []
            for (let i = 0; i <= aHideList.length - 1; i++) {
                this.newValues.push(new PdBooleanValue(aHideList[i].saveBoolean))
            }
        }
    }
    
    doCommand(): void {
        super.doCommand()
        MainForm.hideOrShowSomePlants(this.plantList, this.newValues, this.hide, kDontDrawNow)
    }
    
    undoCommand(): void {
        super.undoCommand()
        MainForm.hideOrShowSomePlants(this.plantList, this.values, this.hide, kDontDrawNow)
    }
    
    description(): string {
        let result = ""
        if ((this.newValues !== null) && (this.newValues.length > 0)) {
            result = "hide others"
        } else if (this.hide) {
            result = "hide" + plantNamesForDescription(this.plantList)
        } else {
            result = "show" + plantNamesForDescription(this.plantList)
        }
        return result
    }
    
}

export class PdRandomizeCommand extends PdCommandWithListOfPlants {
    oldSeeds: PdSmallintValue[] = []
    oldBreedingSeeds: PdLongintValue[] = []
    newSeeds: PdSmallintValue[] = []
    newBreedingSeeds: PdLongintValue[] = []
    oldXRotations: PdSingleValue[] = []
    newXRotations: PdSingleValue[] = []
    isInBreeder: boolean = false
    isRandomizeAllInBreeder: boolean = false
    
    constructor(aList: PdPlant[]) {
        super(aList)
        this.setUpToRemoveAmendmentsWhenDone()
    }
    
    doCommand(): void {
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.oldSeeds.push(new PdSmallintValue(this.plant.pGeneral.startingSeedForRandomNumberGenerator))
                    this.oldBreedingSeeds.push(new PdLongintValue(this.plant.breedingGenerator.seed))
                    this.oldXRotations.push(new PdSingleValue(this.plant.xRotation))
                    this.plant.randomize()
                    this.newSeeds.push(new PdSmallintValue(this.plant.pGeneral.startingSeedForRandomNumberGenerator))
                    this.newBreedingSeeds.push(new PdLongintValue(this.plant.breedingGenerator.seed))
                    this.newXRotations.push(new PdSingleValue(this.plant.xRotation))
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.length === 1) {
                    this.plant = this.plantList[0]
                    BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                MainForm.updateForChangeToPlantRotations()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let seed: short
        let breedingSeed: long
        let xRotation: float
        
        super.undoCommand()
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    seed = this.oldSeeds[i].saveSmallint
                    breedingSeed = this.oldBreedingSeeds[i].saveLongint
                    xRotation = this.oldXRotations[i].saveSingle
                    this.plant.randomizeWithSeedsAndXRotation(seed, breedingSeed, xRotation)
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.length === 1) {
                    this.plant = this.plantList[0]
                    BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                MainForm.updateForChangeToPlantRotations()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    redoCommand(): void {
        let seed: short
        let breedingSeed: long
        let xRotation: float
        
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            if (!this.isInBreeder) {
                this.invalidateCombinedPlantRects()
            }
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    seed = this.newSeeds[i].saveSmallint
                    breedingSeed = this.newBreedingSeeds[i].saveLongint
                    xRotation = this.newXRotations[i].saveSingle
                    this.plant.randomizeWithSeedsAndXRotation(seed, breedingSeed, xRotation)
                    if (this.isInBreeder) {
                        this.plant.previewCacheUpToDate = false
                    } else {
                        this.plant.recalculateBounds(kDrawNow)
                    }
                }
            }
            if (this.isInBreeder) {
                if (this.plantList.length === 1) {
                    this.plant = this.plantList[0]
                    BreederForm.updateForChangeToPlant(this.plant)
                } else {
                    BreederForm.updateForChangeToGenerations()
                }
            } else {
                this.invalidateCombinedPlantRects()
                MainForm.updateForChangeToPlantRotations()
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

// ================ commands that add plants, no special superclass 

export class PdPasteCommand extends PdCommandWithListOfPlants {
    useSpecialPastePosition: boolean = false
    oldSelectedList: PdPlant[] = []
    
    // doesn't use values, but uses plantList 
    // v2.0
    constructor(aList: PdPlant[], anOldSelectedList: PdPlant[]) {
        super(aList)
        // selected list is just pointers, this doesn't take control of them
        if ((anOldSelectedList !== null) && (anOldSelectedList.length > 0)) {
            for (let i = 0; i <= anOldSelectedList.length - 1; i++) {
                this.oldSelectedList.push(anOldSelectedList[i])
            }
        }
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        if ((!this.done) && (this.plantList !== null)) {
            result = this.plantList.length
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        // make new plants the only selected plants 
        MainForm.deselectAllPlants()
        for (let i = 0; i <= this.plantList.length - 1; i++) {
            this.plant = this.plantList[i]
            // put new plants at end of plant manager list 
            domain.plantManager.plants.push(this.plant)
            if (!this.useSpecialPastePosition) {
                if (!domain.viewPlantsInMainWindowOnePlantAtATime()) {
                    this.plant.moveTo(MainForm.standardPastePosition())
                    if (!this.plant.justCopiedFromMainWindow) {
                        this.plant.calculateDrawingScaleToLookTheSameWithDomainScale()
                    }
                }
            }
            this.plant.recalculateBounds(kDrawNow)
            MainForm.addSelectedPlant(this.plant, kAddAtEnd)
        }
        MainForm.updateForChangeToPlantList()
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (this.plantList.length <= 0) {
            return
        }
        for (let i = 0; i <= this.plantList.length - 1; i++) {
            this.plant = this.plantList[i]
            arrayRemove(domain.plantManager.plants, this.plant)
            MainForm.removeSelectedPlant(this.plant)
        }
        if (this.oldSelectedList.length > 0) {
            for (let i = 0; i <= this.oldSelectedList.length - 1; i++) {
                // put back selections from before paste
                MainForm.selectedPlants.push(this.oldSelectedList[i])
            }
        }
        MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        return "paste" + plantNamesForDescription(this.plantList)
    }
    
}

export class PdDuplicateCommand extends PdCommandWithListOfPlants {
    startDragPoint: TPoint = new TPoint()
    offset: TPoint = new TPoint()
    newPlants: PdPlant[] = []
    inTrackMouse: boolean = false
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((!this.done) && (this.newPlants !== null)) {
            result = this.newPlants.length
        }
        return result
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand | null {
        let result: PdCommand | null = this
        let originalPlant: PdPlant
        
        if (aTrackPhase === TrackPhase.trackPress) {
        } else if (aTrackPhase === TrackPhase.trackMove) {
            if (!this.done && mouseDidMove) {
                this.startDragPoint = nextPoint
                this.inTrackMouse = true
                this.doCommand()
            }
            if (!this.done) {
                return result
            }
            if (!MainForm.drawingPaintBox.ClientRect.contains(nextPoint)) {
                this.undoCommand()
                result = null
            } else {
                this.offset.X = nextPoint.X - this.startDragPoint.X
                this.offset.Y = nextPoint.Y - this.startDragPoint.Y
                if (this.newPlants.length > 0) {
                    for (let i = 0; i <= this.newPlants.length - 1; i++) {
                        this.plant = this.newPlants[i]
                        if ((i <= this.plantList.length - 1)) {
                            originalPlant = this.plantList[i]
                            MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
                            this.plant.moveTo(originalPlant.basePoint_pixels())
                            this.plant.moveBy(this.offset)
                            // only draw if don't have picture yet
                            this.plant.recalculateBounds(this.plant.previewCache.Width < 5)
                            MainForm.invalidateDrawingRect(this.plant.boundsRect_pixels())
                        }
                    }
                }
            }
        } else if (aTrackPhase === TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                result = null
            }
        }
        return result
    }
    
    doCommand(): void {
        if (this.done) {
            // should have been done in the mouse down, unless it was done by a menu command 
            return
        }
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        // make new plants only selected plants 
        MainForm.deselectAllPlants()
        for (let i = 0; i <= this.plantList.length - 1; i++) {
            this.plant = this.plantList[i]
            const plantCopy = new PdPlant()
            this.plant.copyTo(plantCopy)
            plantCopy.shrinkPreviewCache()
            plantCopy.setName("Copy of " + plantCopy.getName())
            if (!this.inTrackMouse) {
                plantCopy.moveBy(new TPoint(kPasteMoveDistance, 0))
            }
            plantCopy.recalculateBounds(kDrawNow)
            this.newPlants.push(plantCopy)
            domain.plantManager.addPlant(plantCopy)
            MainForm.addSelectedPlant(plantCopy, kAddAtEnd)
        }
        MainForm.updateForChangeToPlantList()
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (this.newPlants.length <= 0) {
            return
        }
        for (let i = 0; i <= this.newPlants.length - 1; i++) {
            this.plant = this.newPlants[i]
            arrayRemove(domain.plantManager.plants, this.plant)
            MainForm.removeSelectedPlant(this.plant)
        }
        MainForm.updateForChangeToPlantList()
    }
    
    redoCommand(): void {
        super.doCommand()
        if (this.newPlants.length <= 0) {
            return
        }
        MainForm.deselectAllPlants()
        for (let i = 0; i <= this.newPlants.length - 1; i++) {
            this.plant = this.newPlants[i]
            domain.plantManager.addPlant(this.plant)
            MainForm.addSelectedPlant(this.plant, kAddAtEnd)
        }
        MainForm.updateForChangeToPlantList()
    }
    
    description(): string {
        let result = ""
        result = "duplicate" + plantNamesForDescription(this.plantList)
        return result
    }
    
}

// remove command is unique 
export class PdRemoveCommand extends PdCommandWithListOfPlants {
    removedPlants: PdPlant[] = []
    copyToClipboard: boolean = false
    
    // doesn't use values, but uses plantList 
    constructor(aList: PdPlant[], aCopyToClipboard: boolean) {
        super(aList)
        this.copyToClipboard = aCopyToClipboard
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        if ((this.done) && (this.removedPlants !== null)) {
            result = this.removedPlants.length
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        if (this.plantList.length <= 0) {
            return
        }
        if (this.copyToClipboard) {
            // copy plants 
            MainForm.copySelectedPlantsToClipboard()
        }
        // save copy of plants before deleting 
        this.removedPlants.length = 0
        for (let i = 0; i <= this.plantList.length - 1; i++) {
            // don't remove plants from plant manager and MainForm.selectedPlants until all indexes have been recorded 
            this.plant = this.plantList[i]
            this.removedPlants.push(this.plant)
            this.plant.indexWhenRemoved = domain.plantManager.plants.indexOf(this.plant)
            this.plant.selectedIndexWhenRemoved = MainForm.selectedPlants.indexOf(this.plant)
        }
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                arrayRemove(domain.plantManager.plants, this.plant)
                MainForm.removeSelectedPlant(this.plant)
            }
        }
        MainForm.updateForChangeToPlantList()
        if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
            // if only looking at one, select first in list so you are not left with nothing
            MainForm.selectFirstPlantInPlantList()
            MainForm.showOnePlantExclusively(kDrawNow)
        }
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
            // remove selection if created
            MainForm.deselectAllPlants()
        }
        if (this.removedPlants.length > 0) {
            for (let i = 0; i <= this.removedPlants.length - 1; i++) {
                this.plant = this.removedPlants[i]
                if ((this.plant.indexWhenRemoved >= 0) && (this.plant.indexWhenRemoved <= domain.plantManager.plants.length - 1)) {
                    arrayInsert(domain.plantManager.plants, this.plant.indexWhenRemoved, this.plant)
                } else {
                    domain.plantManager.plants.push(this.plant)
                }
                // all removed plants must have been selected, so also add them to the selected list 
                MainForm.addSelectedPlant(this.plant, this.plant.selectedIndexWhenRemoved)
            }
        }
        MainForm.updateForChangeToPlantList()
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

// ================ domain change commands 

// ================ value change commands 

export class PdChangeValueCommand extends PdCommandWithListOfPlants {
    fieldNumber: short = 0
    regrow: boolean = false
    
    constructor(aList: PdPlant[], aFieldNumber: short, aRegrow: boolean) {
        super(aList)
        this.fieldNumber = aFieldNumber
        this.regrow = aRegrow
        if (this.regrow) {
            this.setUpToRemoveAmendmentsWhenDone()
        }
    }
    
    description(): string {
        let result = ""
        
        result = ""
        if ((domain !== null) && (domain.parameterManager !== null)) {
            // subclasses may want to call 
            const param: PdParameter = domain.parameterManager.parameterForFieldNumber(this.fieldNumber)
            if (param !== null) {
                result = "\"" + param.getName() + "\""
            }
        }
        return result
    }
    
}

export class PdChangeRealValueCommand extends PdChangeValueCommand {
    newValue: float = 0.0
    arrayIndex: short = 0
    
    constructor(aList: PdPlant[], aNewValue: float, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean) {
        super(aList, aFieldNumber, aRegrow)
        let oldValue: float = 0
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldValue = this.plant.editTransferField(TransferDirection.kGetField, oldValue, this.fieldNumber, FieldType.kFieldFloat, this.arrayIndex, this.regrow)
                this.values.push(new PdSingleValue(oldValue))
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.newValue = this.plant.editTransferField(TransferDirection.kSetField, this.newValue, this.fieldNumber, FieldType.kFieldFloat, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                let oldValue: float = this.values[i].saveSingle
                oldValue = this.plant.editTransferField(TransferDirection.kSetField, oldValue, this.fieldNumber, FieldType.kFieldFloat, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = super.description()
        result = "change " + result
        if (this.arrayIndex !== -1) {
            result = result + " (" + IntToStr(this.arrayIndex + 1) + ")"
        }
        result = result + " to " + digitValueString(this.newValue) + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeSCurvePointValueCommand extends PdChangeValueCommand {
    newX: float = 0.0
    newY: float = 0.0
    pointIndex: short = 0
    
    constructor(aList: PdPlant[], aNewX: float, aNewY: float, aFieldNumber: short, aPointIndex: short, aRegrow: boolean) {
        super(aList, aFieldNumber, aRegrow)
        let oldX: float = 0
        let oldY: float = 0
        
        this.newX = aNewX
        this.newY = aNewY
        this.pointIndex = aPointIndex
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldX = this.plant.editTransferField(TransferDirection.kGetField, oldX, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2, this.regrow)
                oldY = this.plant.editTransferField(TransferDirection.kGetField, oldY, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                this.values.push(new PdSinglePointValue(oldX, oldY))
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    // first time, set values without calculating
                    this.plant.changingWholeSCurves = true
                    this.newX = this.plant.editTransferField(TransferDirection.kSetField, this.newX, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2, this.regrow)
                    this.newY = this.plant.editTransferField(TransferDirection.kSetField, this.newY, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                    // second time, now that both values are set, set first one again to calc s curve
                    this.plant.changingWholeSCurves = false
                    this.newX = this.plant.editTransferField(TransferDirection.kSetField, this.newX, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldX = this.values[i].x
                oldY = this.values[i].y
                oldX = this.plant.editTransferField(TransferDirection.kSetField, oldX, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2, this.regrow)
                oldY = this.plant.editTransferField(TransferDirection.kSetField, oldY, this.fieldNumber, FieldType.kFieldFloat, this.pointIndex * 2 + 1, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = ""
        result = PdChangeValueCommand.prototype.description.call(this)
        result = "change " + result + " point " + IntToStr(this.pointIndex + 1) + " to (" + digitValueString(this.newX) + ", " + digitValueString(this.newY) + ")" + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeColorValueCommand extends PdChangeValueCommand {
    newColor: TColorRef = 0
    
    constructor(aList: PdPlant[], aNewValue: TColorRef, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean) {
        super(aList, aFieldNumber, aRegrow)
        this.newColor = aNewValue
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                let oldValue: TColorRef = 0
                oldValue = this.plant.editTransferField(TransferDirection.kGetField, oldValue, this.fieldNumber, FieldType.kFieldColor, kNotArray, this.regrow)
                this.values.push(new PdColorValue(oldValue))
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.newColor = this.plant.editTransferField(TransferDirection.kSetField, this.newColor, this.fieldNumber, FieldType.kFieldColor, kNotArray, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldValue = this.values[i].saveColor
                oldValue = this.plant.editTransferField(TransferDirection.kSetField, oldValue, this.fieldNumber, FieldType.kFieldColor, kNotArray, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = super.description()
        result = "change " + result + " to (R " + IntToStr(getRValue(this.newColor)) + ", G " + IntToStr(getGValue(this.newColor)) + ", B " + IntToStr(getBValue(this.newColor)) + ")" + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeTdoValueCommand extends PdChangeValueCommand {
    newTdo: KfObject3D = new KfObject3D()
    
    constructor(aList: PdPlant[], aNewValue: KfObject3D, aFieldNumber: short, aRegrow: boolean) {  
        super(aList, aFieldNumber, aRegrow)
        this.newTdo = new KfObject3D()
        this.newTdo.copyFrom(aNewValue)
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                let valueTdo = new KfObject3D()
                this.plant = this.plantList[i]
                valueTdo = this.plant.editTransferField(TransferDirection.kGetField, valueTdo, this.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, this.regrow)
                this.values.push(valueTdo)
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.newTdo = this.plant.editTransferField(TransferDirection.kSetField, this.newTdo, this.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldValue = this.values[i]
                oldValue = this.plant.editTransferField(TransferDirection.kSetField, oldValue, this.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = super.description()
        result = "change " + result + " to \"" + this.newTdo.getName() + "\" in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeSmallintValueCommand extends PdChangeValueCommand {
    newValue: short = 0
    arrayIndex: short = 0
    
    constructor(aList: PdPlant[], aNewValue: short, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean) {
        super(aList, aFieldNumber, aRegrow)
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                let oldValue: short = 0
                oldValue = this.plant.editTransferField(TransferDirection.kGetField, oldValue, this.fieldNumber, FieldType.kFieldSmallint, this.arrayIndex, this.regrow)
                this.values.push(new PdSmallintValue(oldValue))
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.newValue = this.plant.editTransferField(TransferDirection.kSetField, this.newValue, this.fieldNumber, FieldType.kFieldSmallint, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldValue = this.values[i].saveSmallint
                oldValue = this.plant.editTransferField(TransferDirection.kSetField, oldValue, this.fieldNumber, FieldType.kFieldSmallint, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let result = super.description()
        result = "change " + result + " to " + IntToStr(this.newValue) + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

export class PdChangeBooleanValueCommand extends PdChangeValueCommand {
    newValue: boolean = false
    arrayIndex: short = 0
    
    constructor(aList: PdPlant[], aNewValue: boolean, aFieldNumber: short, anArrayIndex: short, aRegrow: boolean) { 
        super(aList, aFieldNumber, aRegrow)
        this.newValue = aNewValue
        this.arrayIndex = anArrayIndex
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                let oldValue: boolean = false
                oldValue = this.plant.editTransferField(TransferDirection.kGetField, oldValue, this.fieldNumber, FieldType.kFieldBoolean, this.arrayIndex, this.regrow)
                this.values.push(new PdBooleanValue(oldValue))
            }
        }
    }
    
    doCommand(): void {
        PdChangeValueCommand.prototype.doCommand.call(this)
        try {
            if (this.regrow) {
                ucursor.cursor_startWait()
            }
            this.invalidateCombinedPlantRects()
            if (this.plantList.length > 0) {
                for (let i = 0; i <= this.plantList.length - 1; i++) {
                    this.plant = this.plantList[i]
                    this.newValue = this.plant.editTransferField(TransferDirection.kSetField, this.newValue, this.fieldNumber, FieldType.kFieldBoolean, this.arrayIndex, this.regrow)
                    this.plant.recalculateBounds(kDrawNow)
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
        
        PdChangeValueCommand.prototype.undoCommand.call(this)
        this.invalidateCombinedPlantRects()
        if (this.plantList.length > 0) {
            for (let i = 0; i <= this.plantList.length - 1; i++) {
                this.plant = this.plantList[i]
                oldValue = this.values[i].saveBoolean
                oldValue = this.plant.editTransferField(TransferDirection.kSetField, oldValue, this.fieldNumber, FieldType.kFieldBoolean, this.arrayIndex, this.regrow)
                this.plant.recalculateBounds(kDrawNow)
            }
        }
        this.invalidateCombinedPlantRects()
    }
    
    description(): string {
        let newValueString: string
        let result = super.description()
        if (this.newValue) {
            newValueString = "yes"
        } else {
            newValueString = "no"
        }
        result = "change " + result + " to " + newValueString + " in " + plantNamesForDescription(this.plantList)
        return result
    }
    
}

// ================ breeder commands 

export class PdBreedFromParentsCommand extends PdCommand {
    firstParent: PdPlant
    secondParent: PdPlant | null
    fractionOfMaxAge: float = 0.0
    row: short = 0
    oldGenerations: PdGeneration[] = []
    newGeneration: PdGeneration | null = null
    firstGeneration: PdGeneration | null = null
    createFirstGeneration: boolean = false
    rowSelectedAtStart: short = 0
    
    constructor(existingGenerations: PdGeneration[], aFirstParent: PdPlant | null, aSecondParent: PdPlant | null, aRow: short, aFractionOfMaxAge: float, aCreateFirstGeneration: boolean) {
        super()
        this.commandChangesPlantFile = false
        if (aFirstParent === null) {
            throw new Error("Problem: Need at least one parent in method PdBreedFromParentsCommand.createWithInfo.")
        }
        this.firstParent = aFirstParent
        this.secondParent = aSecondParent
        this.fractionOfMaxAge = aFractionOfMaxAge
        this.row = aRow
        this.createFirstGeneration = aCreateFirstGeneration
        if (this.row < 0) {
            // from main window 
            this.row = BreederForm.selectedRow
        }
        if (existingGenerations.length > 0) {
            for (let i = 0; i <= existingGenerations.length - 1; i++) {
                this.oldGenerations.push(existingGenerations[i])
            }
        }
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        let generation: PdGeneration
        
        result = 0
        if (this.done) {
            if (this.oldGenerations.length > 0) {
                for (let i = 0; i <= this.oldGenerations.length - 1; i++) {
                    generation = this.oldGenerations[i]
                    result = result + generation.plants.length
                }
            }
        } else {
            if (this.firstGeneration !== null) {
                result = this.firstGeneration.plants.length
            }
            if (this.newGeneration !== null) {
                result = this.newGeneration.plants.length
            }
        }
        return result
    }
    
    doCommand(): void {
        let generationBred: PdGeneration
        
        super.doCommand()
        try {
            ucursor.cursor_startWait()
            this.rowSelectedAtStart = BreederForm.selectedRow
            if (this.createFirstGeneration) {
                // if command created from main window, create first generation to put in breeder 
                this.firstGeneration = new PdGeneration(this.firstParent, this.secondParent, this.fractionOfMaxAge)
            }
            // create generation that is outcome of breeding and do breeding 
            this.newGeneration = new PdGeneration(null, null, 1.0)
            this.newGeneration.breedFromParents(this.firstParent, this.secondParent, this.fractionOfMaxAge)
            // tell breeder to forget about other generations below the selected row  
            BreederForm.forgetGenerationsListBelowRow(this.row)
            if (this.firstGeneration !== null) {
                BreederForm.addGeneration(this.firstGeneration)
                BreederForm.selectGeneration(this.firstGeneration)
            }
            BreederForm.updateForChangeToGenerations()
            if (this.row <= this.oldGenerations.length - 1) {
                // set the firstParent and secondParent pointers in the generation that was bred (either the firstGeneration
                //      or the generation selected in the breeder) 
                generationBred = this.oldGenerations[this.row]
                generationBred.firstParent = generationBred.firstSelectedPlant()
                generationBred.secondParent = generationBred.secondSelectedPlant()
            }
            // add and select the new generation in the breeder 
            BreederForm.addGeneration(this.newGeneration)
            BreederForm.selectGeneration(this.newGeneration)
            BreederForm.updateForChangeToGenerations()
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    undoCommand(): void {
        let generationBred: PdGeneration
        
        super.undoCommand()
        // tell the breeder to forget about the generation(s) created by this command, and if there were any generations
        //    wiped out by it, tell the breeder to restore pointers to all generations that were forgotten 
        BreederForm.forgetLastGeneration()
        if (this.firstGeneration !== null) {
            BreederForm.forgetLastGeneration()
        }
        BreederForm.updateForChangeToGenerations()
        BreederForm.addGenerationsFromListBelowRow(this.row, this.oldGenerations)
        BreederForm.selectedRow = this.rowSelectedAtStart
        if (this.row <= this.oldGenerations.length - 1) {
            // set parent pointers of generation that was bred (firstGeneration or generation selected) to nil 
            generationBred = this.oldGenerations[this.row]
            generationBred.firstParent = null
            generationBred.secondParent = null
        }
        BreederForm.updateForChangeToGenerations()
    }
    
    redoCommand(): void {
        let generationBred: PdGeneration
        
        super.doCommand()
        // tell breeder to forget about other generations below the selected row (the whole list if from the main window) 
        BreederForm.forgetGenerationsListBelowRow(this.row)
        if (this.firstGeneration !== null) {
            BreederForm.addGeneration(this.firstGeneration)
            BreederForm.selectGeneration(this.firstGeneration)
        }
        BreederForm.updateForChangeToGenerations()
        if (this.row <= this.oldGenerations.length - 1) {
            // set the firstParent and secondParent pointers in the generation that was bred (either the firstGeneration
            //    or the generation selected in the breeder) 
            generationBred = this.oldGenerations[this.row]
            generationBred.firstParent = generationBred.firstSelectedPlant()
            generationBred.secondParent = generationBred.secondSelectedPlant()
        }
        // add and select the new generation in the breeder 
        BreederForm.addGeneration(this.newGeneration)
        BreederForm.selectGeneration(this.newGeneration)
        BreederForm.updateForChangeToGenerations()
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

export class PdReplaceBreederPlant extends PdCommand {
    originalPlant: PdPlant | null = null
    newPlant: PdPlant | null = null
    plantDraggedFrom: PdPlant
    row: short = 0
    column: short = 0
    
    constructor(aPlant: PdPlant, aRow: short, aColumn: short) {
        super()
        this.commandChangesPlantFile = false
        this.plantDraggedFrom = aPlant
        if (this.plantDraggedFrom === null) {
            throw new Error("Problem: Nil plant dragged from in method PdReplaceBreederPlant.createWithPlantRowAndColumn.")
        }
        this.row = aRow
        this.column = aColumn
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        // has one plant in either case (done or undone)
        result = 1
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        this.originalPlant = BreederForm.plantForRowAndColumn(this.row, this.column)
        if (this.originalPlant === null) {
            throw new Error("Problem: Invalid row and column in method PdReplaceBreederPlant.doCommand.")
        }
        this.newPlant = new PdPlant()
        this.plantDraggedFrom.copyTo(this.newPlant)
        BreederForm.replacePlantInRow(this.originalPlant, this.newPlant, this.row)
    }
    
    undoCommand(): void {
        super.undoCommand()
        BreederForm.replacePlantInRow(this.newPlant, this.originalPlant, this.row)
    }
    
    redoCommand(): void {
        super.doCommand()
        BreederForm.replacePlantInRow(this.originalPlant, this.newPlant, this.row)
    }
    
    description(): string {
        let result = ""
        result = "replace breeder plant in row " + IntToStr(this.row + 1) + ", column " + IntToStr(this.column)
        return result
    }
    
}

export class PdMakeTimeSeriesCommand extends PdCommand {
    oldPlants: PdPlant[] = []
    newPlants: PdPlant[] = []
    newPlant: PdPlant
    isPaste: boolean = false
    
    constructor(aNewPlant: PdPlant) {
        super()
        this.commandChangesPlantFile = false
        if (aNewPlant === null) {
            throw new Error("Problem: Nil plant in method PdMakeTimeSeriesCommand.createWithNewPlant.")
        }
        this.newPlant = aNewPlant
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if (this.done) {
            if (this.oldPlants !== null) {
                result = this.oldPlants.length
            }
        } else {
            if (this.newPlants !== null) {
                result = this.newPlants.length
            }
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        if (TimeSeriesForm.plants.length > 0) {
            for (let i = 0; i <= TimeSeriesForm.plants.length - 1; i++) {
                this.oldPlants.push(TimeSeriesForm.plants[i])
            }
        }
        TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        // redraws in updateForChangeToPlants
        TimeSeriesForm.initializeWithPlant(this.newPlant, kDontDrawNow)
        if (TimeSeriesForm.plants.length > 0) {
            for (let i = 0; i <= TimeSeriesForm.plants.length - 1; i++) {
                this.newPlants.push(TimeSeriesForm.plants[i])
            }
        }
        TimeSeriesForm.updateForChangeToPlants(kRecalculateScale)
    }
    
    undoCommand(): void {
        super.undoCommand()
        TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        if (this.oldPlants.length > 0) {
            for (let i = 0; i <= this.oldPlants.length - 1; i++) {
                TimeSeriesForm.plants.push(this.oldPlants[i])
            }
        }
        TimeSeriesForm.updateForChangeToPlants(kDontRecalculateScale)
    }
    
    redoCommand(): void {
        super.doCommand()
        TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        if (this.newPlants.length > 0) {
            for (let i = 0; i <= this.newPlants.length - 1; i++) {
                TimeSeriesForm.plants.push(this.newPlants[i])
            }
        }
        TimeSeriesForm.updateForChangeToPlants(kDontRecalculateScale)
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

export class PdChangeBreedingAndTimeSeriesOptionsCommand extends PdCommand {
    oldOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    newOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    oldDomainOptions: DomainOptionsStructure = new DomainOptionsStructure()
    newDomainOptions: DomainOptionsStructure = new DomainOptionsStructure()

    constructor(anOptions: BreedingAndTimeSeriesOptionsStructure, aDomainOptions: DomainOptionsStructure) {
        super()
        this.commandChangesPlantFile = false
        this.newOptions = anOptions
        this.oldOptions = domain.breedingAndTimeSeriesOptions
        this.newDomainOptions = aDomainOptions
        this.oldDomainOptions = domain.options
    }
    
    doCommand(): void {
        super.doCommand()
        domain.breedingAndTimeSeriesOptions = this.newOptions
        domain.options = this.newDomainOptions
        BreederForm.updateForChangeToDomainOptions()
        TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.breedingAndTimeSeriesOptions = this.oldOptions
        domain.options = this.oldDomainOptions
        BreederForm.updateForChangeToDomainOptions()
        TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    // redo is same as do 
    description(): string {
        let result = ""
        result = "change breeding and time series options"
        return result
    }
    
}

export class PdDeleteBreederGenerationCommand extends PdCommand {
    generation: PdGeneration | null = null
    row: short = 0
    
    constructor(aGeneration: PdGeneration) {
        super()
        this.commandChangesPlantFile = false
        this.generation = aGeneration
        if (this.generation === null) {
            throw new Error("Problem: Nil generation in method PdDeleteBreederGenerationCommand.createWithGeneration.")
        }
        this.row = BreederForm.generations.indexOf(this.generation)
        if (this.row < 0) {
            throw new Error("Problem: Generation not in list in method PdDeleteBreederGenerationCommand.createWithGeneration.")
        }
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        result = 0
        if ((this.done) && (this.generation !== null)) {
            result = this.generation.plants.length
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        const index = BreederForm.generations.indexOf(this.generation)
        arrayRemove(BreederForm.generations, this.generation)
        if (index > 0) {
            BreederForm.selectedRow = index - 1
        }
        BreederForm.updateForChangeToGenerations()
    }
    
    undoCommand(): void {
        super.undoCommand()
        arrayInsert(BreederForm.generations, this.row, this.generation)
        BreederForm.selectedRow = BreederForm.generations.indexOf(this.generation)
        BreederForm.updateForChangeToGenerations()
    }
    
    description(): string {
        return "delete breeder generation"
    }
    
}

export class PdDeleteAllBreederGenerationsCommand extends PdCommand {
    generations: PdGeneration[] = []
    
    create(): void {
        this.generations = []
        if (BreederForm.generations.length > 0) {
            for (let i = 0; i <= BreederForm.generations.length - 1; i++) {
                this.generations.push(BreederForm.generations[i])
            }
        }
    }
    
    numberOfStoredLargeObjects(): long {  
        let result = 0
        if (this.done) {
            if (this.generations.length > 0) {
                for (let i = 0; i <= this.generations.length - 1; i++) {
                    const generation = this.generations[i]
                    result = result + generation.plants.length
                }
            }
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        BreederForm.generations.clearPointersWithoutDeletingObjects()
        BreederForm.updateForChangeToGenerations()
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (this.generations.length > 0) {
            for (let i = 0; i <= this.generations.length - 1; i++) {
                BreederForm.generations.push(this.generations[i])
            }
        }
        BreederForm.updateForChangeToGenerations()
    }
    
    // redo same as do
    description(): string {
        return "delete all breeder generations"
    }
    
}

// ================ time series

export class PdChangeNumberOfTimeSeriesStagesCommand extends PdCommand {
    newNumber: short = 0
    oldNumber: short = 0
 
    constructor(aNumber: short) {
        super()
        this.commandChangesPlantFile = false
        this.newNumber = aNumber
        this.oldNumber = domain.breedingAndTimeSeriesOptions.numTimeSeriesStages
    }
    
    doCommand(): void {
        super.doCommand()
        domain.breedingAndTimeSeriesOptions.numTimeSeriesStages = this.newNumber
        TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    undoCommand(): void {
        super.undoCommand()
        domain.breedingAndTimeSeriesOptions.numTimeSeriesStages = this.oldNumber
        TimeSeriesForm.updateForChangeToDomainOptions()
    }
    
    description(): string {
        let result = ""
        result = "change number of time series stages"
        return result
    }
    
}

export class PdDeleteTimeSeriesCommand extends PdCommand {
    plants: PdPlant[] = []
    
    create(): void {
        this.plants = []
        if (TimeSeriesForm.plants.length > 0) {
            for (let i = 0; i <= TimeSeriesForm.plants.length - 1; i++) {
                this.plants.push(TimeSeriesForm.plants[i])
            }
        }
    }
    
    numberOfStoredLargeObjects(): long {
        let result = 0
        if (this.done) {
            result = this.plants.length
        } else {
            result = 0
        }
        return result
    }
    
    doCommand(): void {
        super.doCommand()
        TimeSeriesForm.plants.clearPointersWithoutDeletingObjects()
        TimeSeriesForm.updateForChangeToPlants(kDontRecalculateScale)
    }
    
    undoCommand(): void {
        super.undoCommand()
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                TimeSeriesForm.plants.push(this.plants[i])
            }
        }
        TimeSeriesForm.updateForChangeToPlants(kDontRecalculateScale)
    }
    
    // redo same as do
    description(): string {
        let result = ""
        result = "delete time series"
        return result
    }
    
}
