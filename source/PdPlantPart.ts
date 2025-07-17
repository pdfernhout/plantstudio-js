// PdPlantPart from unit upart

import { PdPlant, Gender, PartType } from "./PdPlant"
import { float, short, long, IntToStr, int, TColorRef } from "./common"
import { TRect } from "./TRect"
import { PdPlantDrawingAmendment } from "./PdPlantDrawingAmendment"
import { MainForm } from "./temporary"
import { PdTraverser, Activity, PdPlantStatistics } from "./PdTraverser"
import { safedivExcept } from "./umath"
import { KfObject3D } from "./KfObject3D"
import { KfTurtle } from "./KfTurtle"
import { KfTriangle } from "./KfTriangle"
import { KfPoint3D } from "./KfPoint3D"
import { domain } from "./PdDomain"
import { ClassId } from "./uclasses"
import { TPoint } from "./TPoint"
import { messageForExceptionType, darkerColor } from "./usupport"
import { ExportFormats, ExportPart, longNameForDXFPartType, shortNameForDXFPartType } from "./U3dexport"
import { PdStreamableObject } from "./PdStreamableObject"
import { PdClassAndVersionInformationRecord, PdFiler } from "./PdFiler"
import { DebugPrint } from "./udebug"

// const
const kAddingBiomassToPlant = true
const kRemovingBiomassFromPlant = false

export const kDontTaper = -1.0

export const kUseAmendment = true
export const kDontUseAmendment = false

// const
const kDrawingTdo = true
const kDrawingLine = false
const kRotateX = 0
const kRotateY = 1
const kRotateZ = 2

// const
const kMaxLineOutputPoints = 200

export class PdPlantPart extends PdStreamableObject {
    plant: PdPlant = new PdPlant()
    liveBiomass_pctMPB: float = 0.0
    deadBiomass_pctMPB: float = 0.0
    biomassDemand_pctMPB: float = 0.0
    gender: short = 0
    age: long = 0
    randomSwayIndex: float = 0.0
    hasFallenOff: boolean = false
    isSeedlingLeaf: boolean = false
    partID: long = 0
    boundsRect: TRect = new TRect()
    amendment: PdPlantDrawingAmendment | null = null
    parentAmendment: PdPlantDrawingAmendment | null = null
    biomassOfMeAndAllPartsAboveMe_pctMPB: float = 0.0
    
    // ---------------------------------------------------------------------------------- initialize 
    initialize(thePlant: PdPlant): void {
        //initialize generic plant part
        this.plant = thePlant
        // v1.6b1
        this.plant.partsCreated += 1
        this.partID = this.plant.partsCreated
        this.age = 0
        this.gender = Gender.kGenderFemale
        this.hasFallenOff = false
        this.randomSwayIndex = this.plant.randomNumberGenerator.zeroToOne()
    }
    
    nextDay(): void {
        //next day procedure for generic plant part
        this.age += 1
    }
    
    getName(): string {
        // subclasses should override
        return "plant part"
    }
    
    getFullName(): string {
        return "part " + IntToStr(this.partID) + " (" + this.getName() + ")"
    }
    
    // ---------------------------------------------------------------------------------- traversing 
    traverseActivity(mode: int, traverser: PdTraverser): void {
        let biomassToRemove_pctMPB: float
        
        if (traverser === null) {
            return
        }
        switch (mode) {
            case Activity.kActivityNone:
                break
            case Activity.kActivityNextDay:
                break
            case Activity.kActivityDemandVegetative:
                //inc(traverser.totalPlantParts)
                this.biomassDemand_pctMPB = 0.0
                break
            case Activity.kActivityDemandReproductive:
                this.biomassDemand_pctMPB = 0.0
                break
            case Activity.kActivityGrowVegetative:
                break
            case Activity.kActivityGrowReproductive:
                break
            case Activity.kActivityStartReproduction:
                break
            case Activity.kActivityFindPlantPartAtPosition:
                break
            case Activity.kActivityDraw:
                traverser.totalPlantParts += 1
                this.determineAmendmentAndAlsoForChildrenIfAny()
                break
            case Activity.kActivityReport:
                this.report()
                break
            case Activity.kActivityStream:
                break
            case Activity.kActivityFree:
                break
            case Activity.kActivityVegetativeBiomassThatCanBeRemoved:
                break
            case Activity.kActivityRemoveVegetativeBiomass:
                break
            case Activity.kActivityReproductiveBiomassThatCanBeRemoved:
                break
            case Activity.kActivityRemoveReproductiveBiomass:
                break
            case Activity.kActivityStandingDeadBiomassThatCanBeRemoved:
                traverser.total = traverser.total + this.deadBiomass_pctMPB
                break
            case Activity.kActivityRemoveStandingDeadBiomass:
                biomassToRemove_pctMPB = this.deadBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                this.deadBiomass_pctMPB = this.deadBiomass_pctMPB - biomassToRemove_pctMPB
                break
            case Activity.kActivityGatherStatistics:
                break
            case Activity.kActivityCountPlantParts:
                traverser.totalPlantParts += 1
                break
            case Activity.kActivityFindPartForPartID:
                if (traverser.partID === this.partID) {
                    traverser.foundPlantPart = this
                    traverser.finished = true
                }
                break
            case Activity.kActivityCountTotalMemoryUse:
                break
            case Activity.kActivityCalculateBiomassForGravity:
                this.biomassOfMeAndAllPartsAboveMe_pctMPB = this.totalBiomass_pctMPB()
                break
            case Activity.kActivityCountPointsAndTrianglesFor3DExport:
                traverser.totalPlantParts += 1
                break
            default:
                throw new Error("Problem: Unhandled mode in method PdPlantPart.traverseActivity.")
        }
    }
    
    // procedure fillInInfoForDXFPart(index: smallint; var realIndex: smallint; var longName: string; var shortName: string);
    position(): TPoint {
        let result = new TPoint()
        result = new TPoint(this.boundsRect.Left + (this.boundsRect.Right - this.boundsRect.Left) / 2, this.boundsRect.Top + (this.boundsRect.Bottom - this.boundsRect.Top) / 2)
        return result
    }
    
    addExportMaterial(traverser: PdTraverser, femaleIndex: short, maleIndex: short): void {        
        // remember that this is not a true count; each part only adds at LEAST one
        // if you wanted to use this for a true export-type-part count you would have to amend some code
        if (traverser === null) {
            return
        }
        if (maleIndex < 0) {
            // means to ignore gender
            traverser.exportTypeCounts[femaleIndex] += 1
        } else if (this.gender === Gender.kGenderFemale) {
            traverser.exportTypeCounts[femaleIndex] += 1
        } else {
            traverser.exportTypeCounts[maleIndex] += 1
        }
    }
    
    addToStatistics(statistics: PdPlantStatistics, partType: short): void {
        if (statistics === null) {
            return
        }
        if (this.hasFallenOff) {
            return
        }
        statistics.count[partType] = statistics.count[partType] + 1
        statistics.liveBiomass_pctMPB[partType] = statistics.liveBiomass_pctMPB[partType] + this.liveBiomass_pctMPB
        statistics.deadBiomass_pctMPB[partType] = statistics.deadBiomass_pctMPB[partType] + this.deadBiomass_pctMPB
    }
    
    totalBiomass_pctMPB(): float {
        let result = 0.0
        result = this.liveBiomass_pctMPB + this.deadBiomass_pctMPB
        return result
    }
    
    fractionLive(): float {
        let result = 0.0
        result = 0.0
        try {
            if (this.totalBiomass_pctMPB() > 0.0) {
                result = safedivExcept(this.liveBiomass_pctMPB, this.totalBiomass_pctMPB(), 0)
            } else {
                result = 0.0
            }
        } catch (e: any) {
            messageForExceptionType(e, "PdPlantPart.fractionLive")
        }
        return result
    }
    
    draw(): void {
        // implemented by subclasses 
    }
    
    isPhytomer(): boolean {
        return false
    }
    
    addOrRemove(addOrRemoveFlag: boolean): void {
        if (addOrRemoveFlag === kAddingBiomassToPlant) {
            this.hasFallenOff = false
        } else {
            this.hasFallenOff = true
        }
    }
    
    setColorsToParameters(): void {
        //subclasses can override
    }
    
    genderString(): string {
        let result = ""
        if (this.gender === Gender.kGenderFemale) {
            result = "primary"
        } else {
            result = "secondary"
        }
        return result
    }
    
    report(): void {
        let partName: string
        
        switch (this.partType()) {
            case PartType.kPartTypeFlowerFruit:
                partName = "flower/fruit"
                break
            case PartType.kPartTypeInflorescence:
                partName = "inflorescence"
                break
            case PartType.kPartTypeMeristem:
                partName = "meristem"
                break
            case PartType.kPartTypePhytomer:
                partName = "internode"
                break
            case PartType.kPartTypeLeaf:
                partName = "leaf"
                break
            default:
                throw new Error("Unexpected partType: " + this.partType())
        }
        DebugPrint("Part " + IntToStr(this.partID) + ", " + partName)
    }
    
    // ---------------------------------------------------------------------------------- drawing 
    draw3DObject(tdo: KfObject3D, scale: float, faceColor: TColorRef, backfaceColor: TColorRef, dxfIndex: short): void {
        let realScale: float
        let turtle: KfTurtle
        
        if (tdo === null) {
            return
        }
        if (this.plant.turtle === null) {
            return
        }
        turtle = this.plant.turtle
        if (this.setColorsWithAmendmentAndReturnTrueIfNoOverrides(kDrawingTdo)) {
            turtle.setForeColorBackColor(faceColor, backfaceColor)
            turtle.setLineColor(darkerColor(faceColor))
        }
        realScale = scale * this.scaleMultiplierConsideringAmendments()
        turtle.setLineWidth(1.0)
        tdo.draw(turtle, realScale, this.longNameForDXFPartConsideringGenderEtc(dxfIndex), this.shortNameForDXFPartConsideringGenderEtc(dxfIndex), this.realDxfIndexForBaseDXFPart(dxfIndex), this.partID)
    }
    
    drawStemSegment(length: float, width: float, angleZ: float, angleY: float, color: TColorRef, taperIndex: float, dxfIndex: short, useAmendment: boolean): void {
        let turtle: KfTurtle
        let turnPortionZ: float
        let turnPortionY: float
        let drawPortion: float
        let segmentLength: float
        let segmentTurnZ: float
        let segmentTurnY: float
        let realAngleX: float
        let realAngleY: float
        let realAngleZ: float
        let lineDivisions: short
        let startWidth: float
        let endWidth: float
        let startPortionWidth: float
        let endPortionWidth: float
        let isLastSegment: boolean
        let realLength: float
        let realWidth: float
        
        if (this.plant.turtle === null) {
            return
        }
        turtle = this.plant.turtle
        if (turtle.ifExporting_excludeStem(length)) {
            return
        }
        if (this.setColorsWithAmendmentAndReturnTrueIfNoOverrides(kDrawingLine)) {
            turtle.setLineColor(color)
        }
        realLength = length * this.lengthMultiplierConsideringAmendments()
        realWidth = width * this.widthMultiplierConsideringAmendments()
        // set up for export
        //for POV you want radius not diameter
        turtle.ifExporting_startStemSegment(this.longNameForDXFPartConsideringGenderEtc(dxfIndex), this.shortNameForDXFPartConsideringGenderEtc(dxfIndex), color, realWidth / 2.0, dxfIndex)
        if (turtle.drawOptions.straightLinesOnly) {
            // get number of segments
            lineDivisions = 1
        } else {
            lineDivisions = this.plant.pGeneral.lineDivisions
        }
        // figure length and turn of each segment
        realAngleX = this.rotateAngleConsideringAmendment(kRotateX, useAmendment, 0)
        realAngleY = this.rotateAngleConsideringAmendment(kRotateY, useAmendment, angleY)
        realAngleZ = this.rotateAngleConsideringAmendment(kRotateZ, useAmendment, angleZ)
        if (lineDivisions > 1) {
            turnPortionZ = realAngleZ / lineDivisions
            turnPortionY = realAngleY / lineDivisions
            drawPortion = realLength / lineDivisions
        } else {
            turnPortionZ = realAngleZ
            turnPortionY = realAngleY
            drawPortion = realLength
        }
        // figure width for tapering
        startWidth = realWidth
        if (taperIndex > 0) {
            endWidth = startWidth * taperIndex / 100.0
        } else {
            endWidth = realWidth
        }
        startPortionWidth = startWidth
        endPortionWidth = startPortionWidth
        if (realAngleX !== 0) {
            turtle.rotateX(realAngleX)
        }
        for (let i = 0; i <= lineDivisions - 1; i++) {
            isLastSegment = (i >= lineDivisions - 1)
            if (!isLastSegment) {
                // because of rounding, last segment uses leftover, not equal portion
                segmentTurnZ = turnPortionZ
                segmentTurnY = turnPortionY
                segmentLength = drawPortion
            } else {
                segmentTurnZ = (realAngleZ - (turnPortionZ * (lineDivisions - 1)))
                segmentTurnY = (realAngleY - (turnPortionY * (lineDivisions - 1)))
                segmentLength = (realLength - (drawPortion * (lineDivisions - 1)))
            }
            if ((taperIndex > 0) && (lineDivisions > 1)) {
                // figure tapering for section
                // lineDivisions part added in v1.6b3
                startPortionWidth = startWidth - (i / (lineDivisions - 1)) * (startWidth - endWidth)
                if (!isLastSegment) {
                    endPortionWidth = startWidth - ((i + 1) / (lineDivisions - 1)) * (startWidth - endWidth)
                } else {
                    endPortionWidth = endWidth
                }
            }
            // set width, rotate, draw line
            turtle.setLineWidth(startPortionWidth)
            turtle.rotateY(segmentTurnY)
            turtle.rotateZ(segmentTurnZ)
            if (turtle.exportingToFile()) {
                this.write3DExportLine(this.partID, segmentLength, startPortionWidth, endPortionWidth, i)
            } else {
                const triangleMade = turtle.drawInMillimeters(segmentLength, this.partID)
                if ((turtle.drawOptions.sortTdosAsOneItem) && (triangleMade !== null)) {
                    triangleMade.tdo = this.tdoToSortLinesWith()
                }
            }
        }
        turtle.ifExporting_endStemSegment()
    }
    
    write3DExportLine(partID: short, length: float, startWidth: float, endWidth: float, segmentNumber: short): void {
        let turtle: KfTurtle
        let angle: float
        let pipeRadius: float
        let faceWidth: float
        // TODO: Maybe do not need +1 or even entire allocation for startPOints and endPoints?
        let startPoints: KfPoint3D[] = new Array(kMaxLineOutputPoints + 1)
        let endPoints: KfPoint3D[] = new Array(kMaxLineOutputPoints + 1)
        
        if (this.plant.turtle === null) {
            return
        }
        turtle = this.plant.turtle
        if (turtle.writingToPOV()) {
            // POV draws cylinders directly, not with faces
            turtle.drawInMillimeters(length, partID)
            return
        }
        const faces = turtle.ifExporting_stemCylinderFaces()
        if (faces === 0) {
            return
        }
        if (segmentNumber <= 0) {
            // get startWidth points; if done before, copy from last endWidth points
            pipeRadius = 0.5 * startWidth
            for (let i = 0; i < faces; i++) {
                turtle.push()
                turtle.rotateX(i * 256 / faces)
                turtle.rotateZ(64)
                turtle.moveInMillimeters(pipeRadius)
                startPoints[i] = turtle.positionCopy()
                turtle.pop()
            }
        } else {
            for (let i = 0; i < faces; i++) {
                startPoints[i] = endPoints[i]
            }
        }
        turtle.moveInMillimeters(length)
        // get endWidth points
        pipeRadius = 0.5 * endWidth
        for (let i = 0; i < faces; i++) {
            turtle.push()
            turtle.rotateX(i * 256 / faces)
            turtle.rotateZ(64)
            turtle.moveInMillimeters(pipeRadius)
            endPoints[i] = turtle.positionCopy()
            turtle.pop()
        }
        // draw pipe faces from stored points
        turtle.drawFileExportPipeFaces(startPoints, endPoints, faces, segmentNumber)
    }
    
    tdoToSortLinesWith(): KfObject3D | null {
        // subclasses can override
        return null
    }
    
    partType(): int {
        // implemented by subclasses 
        return 0
    }
    
    angleWithSway(angle: float): float {
        let result = angle
        if (this.plant === null) {
            return result
        }
        result = angle + ((this.randomSwayIndex - 0.5) * this.plant.pGeneral.randomSway)
        return result
    }
    
    // ---------------------------------------------------------------------------------- amendments 
    determineAmendmentAndAlsoForChildrenIfAny(): void {
        this.amendment = this.plant.amendmentForPartID(this.partID)
    }
    
    hiddenByAmendment(): boolean {
        let result = false
        let iHaveAnAmendment: boolean
        let iDontHaveAnAmendment: boolean
        let myParentHasAnAmendment: boolean
        let myAmendmentSaysIAmHidden: boolean
        let myParentsAmendmentSaysIAmHidden: boolean
        let drawingToMainWindow: boolean
        
        result = false
        if (!domain.options.showPosingAtAll) {
            return result
        }
        if (this.plant.turtle === null) {
            return result
        }
        iHaveAnAmendment = this.amendment !== null
        iDontHaveAnAmendment = this.amendment === null
        myParentHasAnAmendment = this.parentAmendment !== null
        myAmendmentSaysIAmHidden = (this.amendment !== null) && (this.amendment.hide)
        myParentsAmendmentSaysIAmHidden = (this.parentAmendment !== null) && (this.parentAmendment.hide)
        drawingToMainWindow = (this.plant.turtle.writingTo === ExportFormats.kScreen) && (!domain.drawingToMakeCopyBitmap)
        if ((iHaveAnAmendment && myAmendmentSaysIAmHidden) || (iDontHaveAnAmendment && myParentHasAnAmendment && myParentsAmendmentSaysIAmHidden)) {
            if (drawingToMainWindow) {
                result = !domain.options.showGhostingForHiddenParts
            } else {
                result = true
            }
        }
        return result
    }
    
    applyAmendmentRotations(): void {
        if (this.plant.turtle && (this.amendment !== null) && (this.amendment.addRotations) && (domain.options.showPosingAtAll)) {
            this.plant.turtle.rotateX(this.amendment.xRotation * 256 / 360)
            this.plant.turtle.rotateY(this.amendment.yRotation * 256 / 360)
            this.plant.turtle.rotateZ(this.amendment.zRotation * 256 / 360)
        }
    }
    
    setColorsWithAmendmentAndReturnTrueIfNoOverrides(drawingTdo: boolean): boolean {
        let amendmentToUse: PdPlantDrawingAmendment
        let color: TColorRef
        let backfaceColor: TColorRef
        let lineColor: TColorRef
        let iHaveAnAmendment: boolean
        let iDontHaveAnAmendment: boolean
        let myParentHasAnAmendment: boolean
        let myAmendmentSaysIAmHidden: boolean
        let myParentsAmendmentSaysIAmHidden: boolean
        let iAmSelectedInTheMainWindow: boolean
        let showHighlights: boolean
        let result = true
        
        if (!domain.options.showPosingAtAll) {
            return result
        }
        if (this.plant.turtle === null) {
            return result
        }
        color = 0
        backfaceColor = 0
        lineColor = 0
        // TODO: PDF verify OK to check changeColors to see that it is a color ammedment (was messing up carrot color otherwise until first param change)
        iHaveAnAmendment = this.amendment !== null && this.amendment.changeColors
        iDontHaveAnAmendment = this.amendment === null
        myParentHasAnAmendment = this.parentAmendment !== null && this.parentAmendment.changeColors
        myAmendmentSaysIAmHidden = (this.amendment !== null) && (this.amendment.hide)
        myParentsAmendmentSaysIAmHidden = (this.parentAmendment !== null) && (this.parentAmendment.hide)
        iAmSelectedInTheMainWindow = (this.partID === MainForm.selectedPlantPartID) && (MainForm.focusedPlant() === this.plant)
        showHighlights = domain.options.showHighlightingForNonHiddenPosedParts && (this.plant.turtle.writingTo === ExportFormats.kScreen) && (!domain.drawingToMakeCopyBitmap) && (!this.plant.drawingIntoPreviewCache)
        if (iHaveAnAmendment || myParentHasAnAmendment) {
            result = false
            if (iHaveAnAmendment && iAmSelectedInTheMainWindow && showHighlights) {
                color = domain.options.selectedPosedColor
            } else if ((iHaveAnAmendment && myAmendmentSaysIAmHidden) || (iDontHaveAnAmendment && myParentHasAnAmendment && myParentsAmendmentSaysIAmHidden)) {
                color = domain.options.ghostingColor
            } else if (iHaveAnAmendment && showHighlights) {
                color = domain.options.nonHiddenPosedColor
            } else {
                result = true
            }
        }
        if (result === false) {
            if (backfaceColor === 0) {
                backfaceColor = color
            }
            if (lineColor === 0) {
                lineColor = color
            }
            if (drawingTdo) {
                this.plant.turtle.setForeColorBackColor(color, backfaceColor)
                this.plant.turtle.setLineColor(darkerColor(color))
            } else {
                this.plant.turtle.setLineColor(lineColor)
            }
        }
        return result
    }
    
    // posed color part > if put this back, put it AFTER ghostingColor and BEFORE nonHiddenPosedColor
    //
    //    else if ((amendment <> nil) and (amendment.changeColors))
    //        or ((parentAmendment <> nil) and (parentAmendment.changeColors) and (parentAmendment.propagateColors)) then
    //      begin
    //      // directly changed colors take precedence over highlighting
    //      if amendment <> nil then amendmentToUse := amendment else amendmentToUse := parentAmendment;
    //      color := amendmentToUse.faceColor;
    //      backFaceColor := amendmentToUse.backfaceColor;
    //      lineColor := amendmentToUse.lineColor;
    //      end
    //      
    rotateAngleConsideringAmendment(rotateWhat: short, useAmendment: boolean, angle: float): float {
        let result = 0.0
        result = angle
        if ((useAmendment) && (this.amendment !== null) && (this.amendment.addRotations) && (domain.options.showPosingAtAll)) {
            switch (rotateWhat) {
                case kRotateX:
                    result = angle + this.amendment.xRotation * 256 / 360
                    break
                case kRotateY:
                    result = angle + this.amendment.yRotation * 256 / 360
                    break
                case kRotateZ:
                    result = angle + this.amendment.zRotation * 256 / 360
                    break
            }
        }
        return result
    }
    
    scaleMultiplierConsideringAmendments(): float {
        let result = 0.0
        let amendmentToUse: PdPlantDrawingAmendment | null
        
        result = 1.0
        if (!domain.options.showPosingAtAll) {
            return result
        }
        if ((this.amendment !== null) || (this.parentAmendment !== null)) {
            if (((this.amendment !== null) && (this.amendment.multiplyScale)) || ((this.parentAmendment !== null) && (this.parentAmendment.multiplyScale) && (this.parentAmendment.propagateScale))) {
                if (this.amendment !== null) {
                    amendmentToUse = this.amendment
                } else {
                    amendmentToUse = this.parentAmendment
                }
                if (amendmentToUse) {
                    result = 1.0 * amendmentToUse.scaleMultiplier_pct / 100.0
                }
            }
        }
        return result
    }
    
    lengthMultiplierConsideringAmendments(): float {
        let amendmentToUse: PdPlantDrawingAmendment | null
        
        let result = 1.0
        if (!domain.options.showPosingAtAll) {
            return result
        }
        if ((this.amendment !== null) || (this.parentAmendment !== null)) {
            if (((this.amendment !== null) && (this.amendment.multiplyScale)) || ((this.parentAmendment !== null) && (this.parentAmendment.multiplyScale) && (this.parentAmendment.propagateScale))) {
                if (this.amendment !== null) {
                    amendmentToUse = this.amendment
                } else {
                    amendmentToUse = this.parentAmendment
                }
                if (amendmentToUse) {
                    result = 1.0 * amendmentToUse.lengthMultiplier_pct / 100.0
                }
            }
        }
        return result
    }
    
    widthMultiplierConsideringAmendments(): float {
        let amendmentToUse: PdPlantDrawingAmendment | null
        
        let result = 1.0
        if (!domain.options.showPosingAtAll) {
            return result
        }
        if ((this.amendment !== null) || (this.parentAmendment !== null)) {
            if (((this.amendment !== null) && (this.amendment.multiplyScale)) || ((this.parentAmendment !== null) && (this.parentAmendment.multiplyScale) && (this.parentAmendment.propagateScale))) {
                if (this.amendment !== null) {
                    amendmentToUse = this.amendment
                } else {
                    amendmentToUse = this.parentAmendment
                }
                if (amendmentToUse) {
                    result = 1.0 * amendmentToUse.widthMultiplier_pct / 100.0
                }
            }
        }
        return result
    }
    
    // ---------------------------------------------------------------------------------- streaming 
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdPlantPart
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    //this will stream entire the entire object -
    //but the included object references need to be fixed up afterwards
    //or the objects streamed out separately afterwards - subclasses overrides
    //need to call inherited to get this behavior
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        this.liveBiomass_pctMPB = filer.streamSingle(this.liveBiomass_pctMPB)
        this.deadBiomass_pctMPB = filer.streamSingle(this.deadBiomass_pctMPB)
        this.biomassDemand_pctMPB = filer.streamSingle(this.biomassDemand_pctMPB)
        this.gender = filer.streamSmallint(this.gender)
        this.age = filer.streamLongint(this.age)
        this.hasFallenOff = filer.streamBoolean(this.hasFallenOff)
        this.isSeedlingLeaf = filer.streamBoolean(this.isSeedlingLeaf)
        this.partID = filer.streamLongint(this.partID)
        this.biomassOfMeAndAllPartsAboveMe_pctMPB = filer.streamSingle(this.biomassOfMeAndAllPartsAboveMe_pctMPB)
        this.randomSwayIndex = filer.streamSingle(this.randomSwayIndex)
    }
    
    addDependentPartsToList(aList: PdPlantPart[]): void {
        // subclasses can override 
    }
    
    blendColorsStrength(aColor: TColorRef, aStrength: float): void {
        //subclasses can override
    }
    
    calculateColors(): void {
        this.setColorsToParameters()
    }
    
    longNameForDXFPartConsideringGenderEtc(index: short): string {
        let result = ""
        result = longNameForDXFPartType(this.realDxfIndexForBaseDXFPart(index))
        return result
    }
    
    shortNameForDXFPartConsideringGenderEtc(index: short): string {
        let result = ""
        result = shortNameForDXFPartType(this.realDxfIndexForBaseDXFPart(index))
        return result
    }
    
    realDxfIndexForBaseDXFPart(index: short): short {
        let result = 0
        result = index
        switch (index) {
            case ExportPart.kExportPartLeaf:
                if (this.isSeedlingLeaf) {
                    result = ExportPart.kExportPartSeedlingLeaf
                }
                break
            case ExportPart.kExportPartPetiole:
                if (this.isSeedlingLeaf) {
                    result = ExportPart.kExportPartFirstPetiole
                }
                break
            case ExportPart.kExportPartInflorescenceStalkFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartInflorescenceStalkMale
                }
                break
            case ExportPart.kExportPartInflorescenceInternodeFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartInflorescenceInternodeMale
                }
                break
            case ExportPart.kExportPartInflorescenceBractFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartInflorescenceBractMale
                }
                break
            case ExportPart.kExportPartPedicelFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartPedicelMale
                }
                break
            case ExportPart.kExportPartFlowerBudFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartFlowerBudMale
                }
                break
            case ExportPart.kExportPartFilamentFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartFilamentMale
                }
                break
            case ExportPart.kExportPartAntherFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartAntherMale
                }
                break
            case ExportPart.kExportPartFirstPetalsFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartFirstPetalsMale
                }
                break
            case ExportPart.kExportPartSepalsFemale:
                if (this.gender === Gender.kGenderMale) {
                    result = ExportPart.kExportPartSepalsMale
                }
                break
        }
        return result
    }
    
}
