// PdFlowerFruit was unit ufruit

import { float, short, long, int, TColorRef } from "./common"
import { PdPlantPart, kDontUseAmendment } from "./PdPlantPart"
import { PdPlant, FlowerFruitStage, Gender, FloralPart, DrawFlowerStage, PartType } from "./PdPlant"
import { Activity, PdTraverser, linearGrowthResult, Statistics } from "./PdTraverser"
import { safedivExcept, max, scurve, min, pointsAreCloseEnough } from "./umath"
import { messageForExceptionType } from "./usupport"
import { ExportPart, NestingType } from "./U3dexport"
import { KfTurtle } from "./KfTurtle"
import { TRect } from "./TRect"
import { KfObject3D } from "./KfObject3D"
import { PdClassAndVersionInformationRecord, PdFiler } from "./temporary"
import { ClassId } from "./uclasses"

// const
const kDrawFlowerAsOpening = true
const kDontDrawFlowerAsOpening = false

const kLine = true
const kNotLine = false

// const
const kDrawTDOOpen = true
const kDrawTDOClosed = false


//  kBud = 0; kPistil = 1; kStamens = 2; kFirstPetals = 3; kSecondPetals = 4; kThirdPetals = 5; kSepals = 6;
export class PdFlowerFruit extends PdPlantPart {
    propFullSize: float = 0.0
    stage: short = 0
    hasBeenDrawn: boolean = false
    daysAccumulatingFruitBiomass: long = 0
    daysOpen: long = 0
    
    initializeGender(aPlant: PdPlant, aGender: int): void {
        this.initialize(aPlant)
        this.gender = aGender
        this.propFullSize = 0.0
        this.liveBiomass_pctMPB = 0.0
        this.deadBiomass_pctMPB = 0.0
        this.biomassDemand_pctMPB = 0.0
        this.stage = FlowerFruitStage.kStageFlowerBud
        this.hasBeenDrawn = false
    }
    
    getName(): string {
        let result = ""
        result = "flower/fruit"
        return result
    }
    
    nextDay(): void {
        let anthesisLoss_pctMPB: float
        let biomassToMakeFruit_pctMPB: float
        let minDaysWithOptimalBiomass: boolean
        let maxDaysWithMinFraction: boolean
        
        if (this.hasFallenOff) {
            return
        }
        try {
            super.nextDay()
            switch (this.stage) {
                case FlowerFruitStage.kStageFlowerBud:
                    if (((this.liveBiomass_pctMPB >= this.plant.pFlower[this.gender].minFractionOfOptimalBiomassToOpenFlower_frn * this.plant.pFlower[this.gender].optimalBiomass_pctMPB) || (this.age > this.plant.pFlower[this.gender].maxDaysToGrowIfOverMinFraction)) && (this.age > this.plant.pFlower[this.gender].minDaysToOpenFlower)) {
                        //if over required fraction of optimal or over max days to grow, open bud
                        this.stage = FlowerFruitStage.kStageOpenFlower
                        this.daysOpen = 0
                    }
                    break
                case FlowerFruitStage.kStageOpenFlower:
                    //if over optimal or over min fraction to create fruit and over max days to grow, set fruit
                    this.daysOpen += 1
                    if (this.daysOpen > this.plant.pFlower[this.gender].daysBeforeDrop) {
                        this.hasFallenOff = true
                    } else if (this.gender !== Gender.kGenderMale) {
                        if (this.age > this.plant.pFlower[this.gender].minDaysBeforeSettingFruit) {
                            // limit on time to set fruit (as opposed to grow) if want to keep flowers on plant longer
                            // upper limit on growth; must be at least as old as minDaysToGrow unless there is optimal biomass
                            minDaysWithOptimalBiomass = (this.age > this.plant.pFlower[this.gender].minDaysToGrow) && (this.liveBiomass_pctMPB >= this.plant.pFlower[this.gender].optimalBiomass_pctMPB)
                            // lower limit on growth; if don't have enough to make fruit, give up after max days and make anyway
                            biomassToMakeFruit_pctMPB = this.plant.pFlower[this.gender].minFractionOfOptimalBiomassToCreateFruit_frn * this.plant.pFlower[this.gender].optimalBiomass_pctMPB
                            maxDaysWithMinFraction = (this.age > this.plant.pFlower[this.gender].maxDaysToGrowIfOverMinFraction) || (this.liveBiomass_pctMPB >= biomassToMakeFruit_pctMPB)
                            if (maxDaysWithMinFraction || minDaysWithOptimalBiomass) {
                                this.stage = FlowerFruitStage.kStageUnripeFruit
                                this.daysAccumulatingFruitBiomass = 0
                                // flower biomass drops off, 50% goes into developing fruit (ovary) 
                                // choice of 50% is arbitrary - could be parameter in future depending on size of flower parts/ovary 
                                anthesisLoss_pctMPB = this.liveBiomass_pctMPB * 0.5
                                this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - anthesisLoss_pctMPB
                                this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + anthesisLoss_pctMPB
                                this.propFullSize = (min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pFruit.optimalBiomass_pctMPB, 0.0)))
                            }
                        }
                    }
                    break
                case FlowerFruitStage.kStageUnripeFruit:
                    if (this.daysAccumulatingFruitBiomass >= this.plant.pFruit.daysToRipen) {
                        this.stage = FlowerFruitStage.kStageRipeFruit
                    }
                    this.daysAccumulatingFruitBiomass += 1
                    break
                case FlowerFruitStage.kStageRipeFruit:
                    this.daysAccumulatingFruitBiomass += 1
                    break
            }
        } catch (e) {
            messageForExceptionType(e, "PdFlowerFruit.nextDay")
        }
    }
    
    traverseActivity(mode: int, traverser: PdTraverser): void {
        let newPropFullSize: float
        let newBiomass_pctMPB: float
        let newOptimalBiomass_pctMPB: float
        let biomassToRemove_pctMPB: float
        let fractionOfMaxAge_frn: float
        
        super.traverseActivity(mode, traverser)
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff && (mode !== Activity.kActivityStream) && (mode !== Activity.kActivityFree) && (mode !== Activity.kActivityGatherStatistics)) {
            return
        }
        try {
            switch (mode) {
                case Activity.kActivityNone:
                    break
                case Activity.kActivityNextDay:
                    this.nextDay()
                    break
                case Activity.kActivityDemandVegetative:
                    break
                case Activity.kActivityDemandReproductive:
                    switch (this.stage) {
                        case FlowerFruitStage.kStageFlowerBud:
                            // has no vegetative demand 
                            // accum. biomass for flower 
                            this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, this.plant.pFlower[this.gender].optimalBiomass_pctMPB, this.plant.pFlower[this.gender].minDaysToGrow)
                            traverser.total = traverser.total + this.biomassDemand_pctMPB
                            break
                        case FlowerFruitStage.kStageOpenFlower:
                            // has no vegetative demand 
                            // accum. biomass for flower 
                            this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, this.plant.pFlower[this.gender].optimalBiomass_pctMPB, this.plant.pFlower[this.gender].minDaysToGrow)
                            traverser.total = traverser.total + this.biomassDemand_pctMPB
                            break
                        case FlowerFruitStage.kStageUnripeFruit:
                            if (this.daysAccumulatingFruitBiomass > this.plant.pFruit.maxDaysToGrow) {
                                // accum. biomass for fruit 
                                this.biomassDemand_pctMPB = 0.0
                            } else {
                                fractionOfMaxAge_frn = safedivExcept(this.daysAccumulatingFruitBiomass + 1, this.plant.pFruit.maxDaysToGrow, 0.0)
                                newPropFullSize = max(0.0, min(1.0, scurve(fractionOfMaxAge_frn, this.plant.pFruit.sCurveParams.c1, this.plant.pFruit.sCurveParams.c2)))
                                newOptimalBiomass_pctMPB = newPropFullSize * this.plant.pFruit.optimalBiomass_pctMPB
                                this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, newOptimalBiomass_pctMPB, 1)
                                traverser.total = traverser.total + this.biomassDemand_pctMPB
                            }
                            break
                        case FlowerFruitStage.kStageRipeFruit:
                            if (this.daysAccumulatingFruitBiomass > this.plant.pFruit.maxDaysToGrow) {
                                // accum. biomass for fruit 
                                this.biomassDemand_pctMPB = 0.0
                            } else {
                                fractionOfMaxAge_frn = safedivExcept(this.daysAccumulatingFruitBiomass + 1, this.plant.pFruit.maxDaysToGrow, 0.0)
                                newPropFullSize = max(0.0, min(1.0, scurve(fractionOfMaxAge_frn, this.plant.pFruit.sCurveParams.c1, this.plant.pFruit.sCurveParams.c2)))
                                newOptimalBiomass_pctMPB = newPropFullSize * this.plant.pFruit.optimalBiomass_pctMPB
                                this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, newOptimalBiomass_pctMPB, 1)
                                traverser.total = traverser.total + this.biomassDemand_pctMPB
                            }
                            break
                    }
                    break
                case Activity.kActivityGrowVegetative:
                    break
                case Activity.kActivityGrowReproductive:
                    // cannot grow vegetatively 
                    //Allocate portion of total new biomass based on this demand over total demand.
                    newBiomass_pctMPB = this.biomassDemand_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB + newBiomass_pctMPB
                    switch (this.stage) {
                        case FlowerFruitStage.kStageFlowerBud:
                            this.propFullSize = (min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pFlower[this.gender].optimalBiomass_pctMPB, 0.0)))
                            break
                        case FlowerFruitStage.kStageOpenFlower:
                            this.propFullSize = (min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pFlower[this.gender].optimalBiomass_pctMPB, 0.0)))
                            break
                        case FlowerFruitStage.kStageUnripeFruit:
                            this.propFullSize = (min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pFruit.optimalBiomass_pctMPB, 0.0)))
                            break
                        case FlowerFruitStage.kStageRipeFruit:
                            this.propFullSize = (min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pFruit.optimalBiomass_pctMPB, 0.0)))
                            break
                    }
                    break
                case Activity.kActivityStartReproduction:
                    break
                case Activity.kActivityFindPlantPartAtPosition:
                    if (pointsAreCloseEnough(traverser.point, this.position())) {
                        // can't switch because has no vegetative mode 
                        traverser.foundPlantPart = this
                        traverser.finished = true
                    }
                    break
                case Activity.kActivityDraw:
                    break
                case Activity.kActivityReport:
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
                    // inflorescence should handle telling flowers to draw 
                    //streaming called by inflorescence
                    // free called by inflorescence 
                    // none 
                    // do nothing 
                    traverser.total = traverser.total + this.liveBiomass_pctMPB
                    break
                case Activity.kActivityRemoveReproductiveBiomass:
                    if (this.liveBiomass_pctMPB <= 0.0) {
                        return
                    }
                    biomassToRemove_pctMPB = this.liveBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - biomassToRemove_pctMPB
                    this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + biomassToRemove_pctMPB
                    if (this.liveBiomass_pctMPB <= 0.0) {
                        if ((this.stage === FlowerFruitStage.kStageUnripeFruit) || (this.stage === FlowerFruitStage.kStageRipeFruit)) {
                            this.hasFallenOff = true
                        }
                    }
                    break
                case Activity.kActivityGatherStatistics:
                    switch (this.stage) {
                        case FlowerFruitStage.kStageFlowerBud:
                            if (this.gender === Gender.kGenderMale) {
                                if (this.hasFallenOff) {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFlower)
                                } else {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeMaleFlowerBud)
                                }
                            } else {
                                if (this.hasFallenOff) {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFlower)
                                } else {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFemaleFlowerBud)
                                }
                            }
                            break
                        case FlowerFruitStage.kStageOpenFlower:
                            if (this.gender === Gender.kGenderMale) {
                                if (this.hasFallenOff) {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFlower)
                                } else {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeMaleFlower)
                                }
                            } else {
                                if (this.hasFallenOff) {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFlower)
                                } else {
                                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFemaleFlower)
                                }
                            }
                            break
                        case FlowerFruitStage.kStageUnripeFruit:
                            if (this.hasFallenOff) {
                                this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFruit)
                            } else {
                                this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeUnripeFruit)
                            }
                            break
                        case FlowerFruitStage.kStageRipeFruit:
                            if (this.hasFallenOff) {
                                this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFallenFruit)
                            } else {
                                this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFruit)
                            }
                            break
                        default:
                            throw new Error("Problem: Invalid fruit stage in method PdFlowerFruit.traverseActivity.")
                    }
                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeAllReproductive)
                    break
                case Activity.kActivityCountPlantParts:
                    break
                case Activity.kActivityFindPartForPartID:
                    break
                case Activity.kActivityCountTotalMemoryUse:
                    traverser.totalMemorySize += this.instanceSize
                    break
                case Activity.kActivityCalculateBiomassForGravity:
                    break
                case Activity.kActivityCountPointsAndTrianglesFor3DExport:
                    this.countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser)
                    break
                default:
                    throw new Error("Problem: Unhandled mode for plant draw activity in method PdFlowerFruit.traverseActivity.")
            }
        } catch (e) {
            messageForExceptionType(e, "PdFlowerFruit.traverseActivity")
        }
    }
    
    report(): void {
        super.report()
        // DebugPrint(' flower/fruit, age '  + IntToStr(age) + ' biomass '  + floatToStr(self.liveBiomass_pctMPB));
    }
    
    dxfIndexForFloralLayerType(aType: short, line: boolean): short {
        let result = 0
        result = 0
        switch (aType) {
            case FloralPart.kBud:
                result = ExportPart.kExportPartFlowerBudFemale
                break
            case FloralPart.kPistils:
                if (line) {
                    result = ExportPart.kExportPartStyleFemale
                } else {
                    result = ExportPart.kExportPartStigmaFemale
                }
                break
            case FloralPart.kStamens:
                if (line) {
                    result = ExportPart.kExportPartFilamentFemale
                } else {
                    result = ExportPart.kExportPartAntherFemale
                }
                break
            case FloralPart.kFirstPetals:
                result = ExportPart.kExportPartFirstPetalsFemale
                break
            case FloralPart.kSecondPetals:
                result = ExportPart.kExportPartSecondPetalsFemale
                break
            case FloralPart.kThirdPetals:
                result = ExportPart.kExportPartThirdPetalsFemale
                break
            case FloralPart.kFourthPetals:
                result = ExportPart.kExportPartFourthPetalsFemale
                break
            case FloralPart.kFifthPetals:
                result = ExportPart.kExportPartFifthPetalsFemale
                break
            case FloralPart.kSepals:
                result = ExportPart.kExportPartSepalsFemale
                break
        }
        return result
    }
    
    draw(): void {
        let scale: float
        let length: float
        let width: float

        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        this.boundsRect = new TRect(0, 0, 0, 0)
        if (this.hasFallenOff) {
            return
        }
        turtle.push()
        this.determineAmendmentAndAlsoForChildrenIfAny()
        if (this.hiddenByAmendment()) {
            turtle.pop()
            return
        } else {
            this.applyAmendmentRotations()
        }
        try {
            switch (this.stage) {
                case FlowerFruitStage.kStageFlowerBud:
                    // kDrawNoBud = 0; kDrawSingleTdoBud = 1; kDrawOpeningFlower = 2;
                    switch (this.plant.pFlower[this.gender].budDrawingOption) {
                        case DrawFlowerStage.kDrawNoBud:
                            return
                        case DrawFlowerStage.kDrawSingleTdoBud:
                            scale = ((this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].scaleAtFullSize / 100.0) * this.propFullSize)
                            turtle.rotateX(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].xRotationBeforeDraw))
                            turtle.rotateY(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].yRotationBeforeDraw))
                            turtle.rotateZ(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].zRotationBeforeDraw))
                            this.drawCircleOfTdos(this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].object3D, this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].faceColor, this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].backfaceColor, this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].pullBackAngle, scale, this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].repetitions, this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].radiallyArranged, kDrawTDOClosed, ExportPart.kExportPartFlowerBudFemale)
                            break
                        case DrawFlowerStage.kDrawOpeningFlower:
                            this.drawFlower(kDrawFlowerAsOpening)
                            break
                    }
                    break
                case FlowerFruitStage.kStageOpenFlower:
                    this.drawFlower(kDontDrawFlowerAsOpening)
                    break
                case FlowerFruitStage.kStageUnripeFruit:
                    // ripe color is regular color; alternate color is unripe color
                    scale = ((this.plant.pFruit.tdoParams.scaleAtFullSize / 100.0) * this.propFullSize)
                    turtle.rotateX(this.angleWithSway(this.plant.pFruit.tdoParams.xRotationBeforeDraw))
                    turtle.rotateY(this.angleWithSway(this.plant.pFruit.tdoParams.yRotationBeforeDraw))
                    turtle.rotateZ(this.angleWithSway(this.plant.pFruit.tdoParams.zRotationBeforeDraw))
                    this.drawCircleOfTdos(this.plant.pFruit.tdoParams.object3D, this.plant.pFruit.tdoParams.alternateFaceColor, this.plant.pFruit.tdoParams.alternateBackfaceColor, this.plant.pFruit.tdoParams.pullBackAngle, scale, this.plant.pFruit.tdoParams.repetitions, this.plant.pFruit.tdoParams.radiallyArranged, kDrawTDOClosed, ExportPart.kExportPartUnripeFruit)
                    break
                case FlowerFruitStage.kStageRipeFruit:
                    scale = ((this.plant.pFruit.tdoParams.scaleAtFullSize / 100.0) * this.propFullSize)
                    turtle.rotateX(this.angleWithSway(this.plant.pFruit.tdoParams.xRotationBeforeDraw))
                    turtle.rotateY(this.angleWithSway(this.plant.pFruit.tdoParams.yRotationBeforeDraw))
                    turtle.rotateZ(this.angleWithSway(this.plant.pFruit.tdoParams.zRotationBeforeDraw))
                    this.drawCircleOfTdos(this.plant.pFruit.tdoParams.object3D, this.plant.pFruit.tdoParams.faceColor, this.plant.pFruit.tdoParams.backfaceColor, this.plant.pFruit.tdoParams.pullBackAngle, scale, this.plant.pFruit.tdoParams.repetitions, this.plant.pFruit.tdoParams.radiallyArranged, kDrawTDOClosed, ExportPart.kExportPartRipeFruit)
                    break
            }
            this.hasBeenDrawn = true
            turtle.pop()
        } catch (e) {
            messageForExceptionType(e, "PdFlowerFruit.draw")
        }
    }
    
    drawFlower(drawAsOpening: boolean): void {
        let turtle: KfTurtle
        let angle: float
        let scale: float
        let layerType: short
        
        if ((this.plant.turtle === null)) {
            return
        }
        turtle = this.plant.turtle
        this.drawPistilsAndStamens(drawAsOpening)
        for (layerType = FloralPart.kFirstPetals; layerType <= FloralPart.kSepals; layerType++) {
            turtle.push()
            scale = ((this.plant.pFlower[this.gender].tdoParams[layerType].scaleAtFullSize / 100.0) * this.propFullSize)
            angle = this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[layerType].pullBackAngle)
            if (drawAsOpening) {
                angle = angle * this.propFullSize * 2
                if (angle > this.plant.pFlower[this.gender].tdoParams[layerType].pullBackAngle) {
                    angle = this.plant.pFlower[this.gender].tdoParams[layerType].pullBackAngle
                }
            }
            turtle.rotateX(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[layerType].xRotationBeforeDraw))
            turtle.rotateY(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[layerType].yRotationBeforeDraw))
            turtle.rotateZ(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[layerType].zRotationBeforeDraw))
            this.drawCircleOfTdos(this.plant.pFlower[this.gender].tdoParams[layerType].object3D, this.plant.pFlower[this.gender].tdoParams[layerType].faceColor, this.plant.pFlower[this.gender].tdoParams[layerType].backfaceColor, angle, scale, this.plant.pFlower[this.gender].tdoParams[layerType].repetitions, this.plant.pFlower[this.gender].tdoParams[layerType].radiallyArranged, kDrawTDOOpen, this.dxfIndexForFloralLayerType(layerType, kNotLine))
            turtle.pop()
        }
    }
    
    drawPistilsAndStamens(drawAsOpening: boolean): void {        
        if ((this.plant.turtle === null)) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        turtle.push()
        if ((this.plant.pFlower[this.gender].numPistils > 0)) {
            if (((this.plant.pFlower[this.gender].styleLength_mm > 0) && (this.plant.pFlower[this.gender].styleWidth_mm > 0)) || (this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].scaleAtFullSize > 0)) {
                turtle.ifExporting_startNestedGroupOfPlantParts("pistils", "Pistils", NestingType.kNestingTypeFloralLayers)
            }
            const turnPortion: int = 256 / this.plant.pFlower[this.gender].numPistils
            const leftOverDegrees: int = 256 - turnPortion * this.plant.pFlower[this.gender].numPistils
            let addition: float
            if (leftOverDegrees > 0) {
                addition = safedivExcept(leftOverDegrees, this.plant.pFlower[this.gender].numPistils, 0)
            } else {
                addition = 0
            }
            let carryOver: float = 0
            for (let i = 0; i < this.plant.pFlower[this.gender].numPistils; i++) {
                turtle.push()
                if ((this.plant.pFlower[this.gender].styleLength_mm > 0) && (this.plant.pFlower[this.gender].styleWidth_mm > 0)) {
                    const length: float = max(0.0, this.propFullSize * this.plant.pFlower[this.gender].styleLength_mm)
                    const width: float = max(0.0, this.propFullSize * this.plant.pFlower[this.gender].styleWidth_mm)
                    let angle: float = this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].pullBackAngle)
                    if (drawAsOpening) {
                        angle = angle * this.propFullSize
                    }
                    this.drawStemSegment(length, width, angle, 0, this.plant.pFlower[this.gender].styleColor, this.plant.pFlower[this.gender].styleTaperIndex, this.dxfIndexForFloralLayerType(FloralPart.kPistils, kLine), kDontUseAmendment)
                }
                const scale: float = ((this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].scaleAtFullSize / 100.0) * this.propFullSize)
                turtle.rotateX(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].xRotationBeforeDraw))
                turtle.rotateY(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].yRotationBeforeDraw))
                turtle.rotateZ(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].zRotationBeforeDraw))
                this.drawCircleOfTdos(this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].object3D, this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].faceColor, this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].backfaceColor, 0, scale, this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].repetitions, this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].radiallyArranged, kDrawTDOOpen, this.dxfIndexForFloralLayerType(FloralPart.kPistils, kNotLine))
                turtle.pop()
                const addThisTime: int = Math.trunc(addition + carryOver)
                carryOver = carryOver + addition - addThisTime
                if (carryOver < 0) {
                    carryOver = 0
                }
                turtle.rotateX(turnPortion + addThisTime)
            }
            if (((this.plant.pFlower[this.gender].styleLength_mm > 0) && (this.plant.pFlower[this.gender].styleWidth_mm > 0)) || (this.plant.pFlower[this.gender].tdoParams[FloralPart.kPistils].scaleAtFullSize > 0)) {
                turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeFloralLayers)
            }
        }
        turtle.pop()
        // stamens
        turtle.push()
        if (this.plant.pFlower[this.gender].numStamens > 0) {
            if (((this.plant.pFlower[this.gender].filamentLength_mm > 0) && (this.plant.pFlower[this.gender].filamentWidth_mm > 0)) || (this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].scaleAtFullSize > 0)) {
                if (this.gender === Gender.kGenderFemale) {
                    turtle.ifExporting_startNestedGroupOfPlantParts("primary stamens", "1Stamens", NestingType.kNestingTypeFloralLayers)
                } else {
                    turtle.ifExporting_startNestedGroupOfPlantParts("secondary stamens", "2Stamens", NestingType.kNestingTypeFloralLayers)
                }
            }
            const turnPortion = 256 / this.plant.pFlower[this.gender].numStamens
            const leftOverDegrees = 256 - turnPortion * this.plant.pFlower[this.gender].numStamens
            let addition: float
            if (leftOverDegrees > 0) {
                addition = safedivExcept(leftOverDegrees, this.plant.pFlower[this.gender].numStamens, 0)
            } else {
                addition = 0
            }
            let carryOver: float = 0
            for (let i = 0; i < this.plant.pFlower[this.gender].numStamens; i++) {
                turtle.push()
                if ((this.plant.pFlower[this.gender].filamentLength_mm > 0) && (this.plant.pFlower[this.gender].filamentWidth_mm > 0)) {
                    const length = max(0.0, this.propFullSize * this.plant.pFlower[this.gender].filamentLength_mm)
                    const width = max(0.0, this.propFullSize * this.plant.pFlower[this.gender].filamentWidth_mm)
                    let angle = this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].pullBackAngle)
                    if (drawAsOpening) {
                        angle = angle * this.propFullSize
                    }
                    this.drawStemSegment(length, width, angle, 0, this.plant.pFlower[this.gender].filamentColor, this.plant.pFlower[this.gender].filamentTaperIndex, this.dxfIndexForFloralLayerType(FloralPart.kStamens, kLine), kDontUseAmendment)
                }
                const scale = ((this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].scaleAtFullSize / 100.0) * this.propFullSize)
                turtle.rotateX(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].xRotationBeforeDraw))
                turtle.rotateY(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].yRotationBeforeDraw))
                turtle.rotateZ(this.angleWithSway(this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].zRotationBeforeDraw))
                this.drawCircleOfTdos(this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].object3D, this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].faceColor, this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].backfaceColor, 0, scale, this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].repetitions, this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].radiallyArranged, kDrawTDOOpen, this.dxfIndexForFloralLayerType(FloralPart.kStamens, kNotLine))
                turtle.pop()
                const addThisTime = Math.trunc(addition + carryOver)
                carryOver = carryOver + addition - addThisTime
                if (carryOver < 0) {
                    carryOver = 0
                }
                turtle.rotateX(turnPortion + addThisTime)
            }
            if (((this.plant.pFlower[this.gender].filamentLength_mm > 0) && (this.plant.pFlower[this.gender].filamentWidth_mm > 0)) || (this.plant.pFlower[this.gender].tdoParams[FloralPart.kStamens].scaleAtFullSize > 0)) {
                turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeFloralLayers)
            }
        }
        turtle.pop()
    }
    
    countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser: PdTraverser): void {
        let numLines: int
        
        if (traverser === null) {
            return
        }
        if (this.propFullSize <= 0) {
            return
        }
        if (this.hasFallenOff) {
            return
        }
        switch (this.stage) {
            case FlowerFruitStage.kStageFlowerBud:
                switch (this.plant.pFlower[this.gender].budDrawingOption) {
                    case DrawFlowerStage.kDrawNoBud:
                        break
                    case DrawFlowerStage.kDrawSingleTdoBud:
                        if (this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].scaleAtFullSize > 0) {
                            traverser.total3DExportPointsIn3DObjects += this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].object3D.pointsInUse * this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].repetitions
                            traverser.total3DExportTrianglesIn3DObjects += this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].repetitions
                            this.addExportMaterial(traverser, ExportPart.kExportPartFlowerBudFemale, ExportPart.kExportPartFlowerBudMale)
                        }
                        break
                    case DrawFlowerStage.kDrawOpeningFlower:
                        this.addFloralPartsCountsToTraverser(traverser)
                        break
                }
                break
            case FlowerFruitStage.kStageOpenFlower:
                this.addFloralPartsCountsToTraverser(traverser)
                break
            case FlowerFruitStage.kStageUnripeFruit:
                if (this.plant.pFruit.tdoParams.scaleAtFullSize > 0) {
                    traverser.total3DExportPointsIn3DObjects += this.plant.pFruit.tdoParams.object3D.pointsInUse * this.plant.pFruit.tdoParams.repetitions
                    traverser.total3DExportTrianglesIn3DObjects += this.plant.pFruit.tdoParams.object3D.triangles.length * this.plant.pFruit.tdoParams.repetitions
                    this.addExportMaterial(traverser, ExportPart.kExportPartUnripeFruit, -1)
                }
                break
            case FlowerFruitStage.kStageRipeFruit:
                if (this.plant.pFruit.tdoParams.scaleAtFullSize > 0) {
                    traverser.total3DExportPointsIn3DObjects += this.plant.pFruit.tdoParams.object3D.pointsInUse * this.plant.pFruit.tdoParams.repetitions
                    traverser.total3DExportTrianglesIn3DObjects += this.plant.pFruit.tdoParams.object3D.triangles.length * this.plant.pFruit.tdoParams.repetitions
                    this.addExportMaterial(traverser, ExportPart.kExportPartRipeFruit, -1)
                }
                break
        }
        // pedicel handled by inflorescence
    }
    
    addFloralPartsCountsToTraverser(traverser: PdTraverser): void {
        let partType: int
        
        for (partType = FloralPart.kPistils; partType <= FloralPart.kSepals; partType++) {
            if (this.plant.pFlower[this.gender].tdoParams[partType].scaleAtFullSize > 0) {
                if (partType === FloralPart.kPistils) {
                    traverser.total3DExportPointsIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.pointsInUse * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numPistils
                    traverser.total3DExportTrianglesIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numPistils
                    this.addExportMaterial(traverser, ExportPart.kExportPartStyleFemale, -1)
                    this.addExportMaterial(traverser, ExportPart.kExportPartStigmaFemale, -1)
                } else if (partType === FloralPart.kStamens) {
                    traverser.total3DExportPointsIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.pointsInUse * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numStamens
                    traverser.total3DExportTrianglesIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numStamens
                    this.addExportMaterial(traverser, ExportPart.kExportPartFilamentFemale, ExportPart.kExportPartFilamentMale)
                    this.addExportMaterial(traverser, ExportPart.kExportPartAntherFemale, ExportPart.kExportPartAntherMale)
                } else {
                    traverser.total3DExportPointsIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.pointsInUse * this.plant.pFlower[this.gender].tdoParams[partType].repetitions
                    traverser.total3DExportTrianglesIn3DObjects += this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions
                    switch (partType) {
                        case FloralPart.kFirstPetals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartFirstPetalsFemale, ExportPart.kExportPartFirstPetalsMale)
                            break
                        case FloralPart.kSecondPetals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartSecondPetalsFemale, -1)
                            break
                        case FloralPart.kThirdPetals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartThirdPetalsFemale, -1)
                            break
                        case FloralPart.kFourthPetals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartFourthPetalsFemale, -1)
                            break
                        case FloralPart.kFifthPetals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartFifthPetalsFemale, -1)
                            break
                        case FloralPart.kSepals:
                            this.addExportMaterial(traverser, ExportPart.kExportPartSepalsFemale, ExportPart.kExportPartSepalsMale)
                            break
                    }
                }
            }
        }
    }
    
    triangleCountInFloralParts(): int {
        let result = 0
        let partType: int
        
        result = 0
        for (partType = FloralPart.kPistils; partType <= FloralPart.kSepals; partType++) {
            if (this.plant.pFlower[this.gender].tdoParams[partType].scaleAtFullSize > 0) {
                if (partType === FloralPart.kPistils) {
                    result = result + this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numPistils
                } else if (partType === FloralPart.kStamens) {
                    result = result + this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions * this.plant.pFlower[this.gender].numStamens
                } else {
                    result = result + this.plant.pFlower[this.gender].tdoParams[partType].object3D.triangles.length * this.plant.pFlower[this.gender].tdoParams[partType].repetitions
                }
            }
        }
        return result
    }
    
    tdoToSortLinesWith(): KfObject3D | null {
        let result: KfObject3D | null = null
        if (this.plant === null) {
            return result
        }
        if (this.hasFallenOff) {
            return result
        }
        switch (this.stage) {
            case FlowerFruitStage.kStageFlowerBud:
                result = this.plant.pFlower[this.gender].tdoParams[FloralPart.kBud].object3D
                break
            case FlowerFruitStage.kStageOpenFlower:
                result = this.plant.pFlower[this.gender].tdoParams[FloralPart.kFirstPetals].object3D
                break
            case FlowerFruitStage.kStageUnripeFruit:
                result = this.plant.pFruit.tdoParams.object3D
                break
            case FlowerFruitStage.kStageRipeFruit:
                result = this.plant.pFruit.tdoParams.object3D
                break
        }
        return result
    }
    
    drawCircleOfTdos(tdo: KfObject3D, faceColor: TColorRef, backfaceColor: TColorRef, pullBackAngle: float, scale: float, numParts: int, partsArranged: boolean, open: boolean, dxfIndex: short): void {
        try {
            if ((scale <= 0.0)) {
                // v1.3
                // v1.3
                return
            }
            if (this.plant.turtle === null) {
                return
            }
            const turtle: KfTurtle = this.plant.turtle
            turtle.push()
            let minZ = 0.0
            if ((partsArranged) && (numParts > 0)) {
                turtle.ifExporting_startPlantPart(this.longNameForDXFPartConsideringGenderEtc(dxfIndex), this.shortNameForDXFPartConsideringGenderEtc(dxfIndex))
                const turnPortion: int = 256 / numParts
                const leftOverDegrees: int = 256 - turnPortion * numParts
                let addition: float
                if (leftOverDegrees > 0) {
                    addition = safedivExcept(leftOverDegrees, numParts, 0)
                } else {
                    addition = 0
                }
                let carryOver = 0.0
                for (let i = 1; i <= numParts; i++) {
                    const addThisTime: int = Math.trunc(addition + carryOver)
                    carryOver = carryOver + addition - addThisTime
                    if (carryOver < 0) {
                        carryOver = 0
                    }
                    turtle.rotateX(turnPortion + addThisTime)
                    turtle.push()
                    //aligns object as stored in the file to way should draw on plant
                    turtle.rotateZ(-64)
                    if (open) {
                        //pulls petal up to plane of stalk (is perpendicular)
                        turtle.rotateY(32)
                    }
                    turtle.rotateX(pullBackAngle)
                    if (tdo !== null) {
                        this.draw3DObject(tdo, scale, faceColor, backfaceColor, dxfIndex)
                        if (i === 1) {
                            minZ = tdo.zForSorting
                        } else if (tdo.zForSorting < minZ) {
                            minZ = tdo.zForSorting
                        }
                    }
                    turtle.pop()
                }
                if (tdo !== null) {
                    tdo.zForSorting = minZ
                }
                turtle.ifExporting_endPlantPart()
            } else {
                turtle.push()
                if ((this.stage === FlowerFruitStage.kStageUnripeFruit) || (this.stage === FlowerFruitStage.kStageRipeFruit)) {
                    turtle.rotateZ(-64)
                } else {
                    //pulls petal up to plane of stalk (is perpendicular)
                    turtle.rotateZ(-pullBackAngle)
                }
                if (tdo !== null) {
                    this.draw3DObject(tdo, scale, faceColor, backfaceColor, dxfIndex)
                }
                turtle.pop()
            }
            turtle.pop()
        } catch (e) {
            messageForExceptionType(e, "PdFlowerFruit.drawCircleOfTdos")
        }
    }
    
    partType(): int {
        return PartType.kPartTypeFlowerFruit
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdFlowerFruit
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        this.propFullSize = filer.streamSingle(this.propFullSize)
        this.stage = filer.streamSmallint(this.stage)
        this.hasBeenDrawn = filer.streamBoolean(this.hasBeenDrawn)
        this.daysAccumulatingFruitBiomass = filer.streamLongint(this.daysAccumulatingFruitBiomass)
        this.daysOpen = filer.streamLongint(this.daysOpen)
    }
    
}

// cfk remember this 
// ---------------------------------------------------------------------- wilting/falling down 
//procedure PdFlowerFruit.dragDownFromWeight;
//  begin
//  end; 
//procedure PdFlowerFruit.dragDownFromWeight;
//  var
//    fractionOfOptimalFruitWeight_frn: single;
//    angle: integer;
//  begin
//  if (plant.turtle = nil) then exit;
//  fractionOfOptimalFruitWeight_frn := safedivExcept(liveBiomass_pctMPB, plant.pFruit.optimalBiomass_pctMPB, 0.0);
//  angle := round(abs(plant.turtle.angleZ + 32) * fractionOfOptimalFruitWeight_frn
//      * min(1.0, max(0.0, 100 - plant.pFruit.stalkStrengthIndex) / 100.0));
//  angle := -angle;
//  if plant.turtle.angleZ > -32 then
//    angle := -angle;
//  plant.turtle.rotateZ(angle);
//  end;  
