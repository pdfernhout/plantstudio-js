// PdLeaf was unit uleaf

import { safedivExcept, max, min, pointsAreCloseEnough } from "./umath"
import { PdPlantPart, kDontTaper, kUseAmendment, kDontUseAmendment } from "./PdPlantPart"
import { float, int, odd, TColorRef } from "./common"
import { PdPlant, CompoundLeafStyle, Direction, PartType, LeafArrangement } from "./PdPlant"
import { PdTraverser, Activity, linearGrowthResult, Statistics } from "./PdTraverser"
import { ExportPart, NestingType } from "./U3dexport"
import { messageForExceptionType } from "./usupport"
import { KfObject3D } from "./KfObject3D"
import { KfTurtle } from "./KfTurtle"
import { TRect } from "./TRect"
import { ClassId } from "./uclasses"
import { PdClassAndVersionInformationRecord, PdFiler } from "./PdFiler";
import { SCurveStructure, scurve } from "./SCurveStructure"

const kNumCompoundLeafRandomSwayIndexes = 49

export class PdLeaf extends PdPlantPart {
    sCurveParams: SCurveStructure = new SCurveStructure()
    propFullSize: float = 0.0
    biomassAtCreation_pctMPB: float = 0.0
    compoundLeafRandomSwayIndexes: float[] /* kNumCompoundLeafRandomSwayIndexes + 1 */ = Array(kNumCompoundLeafRandomSwayIndexes + 1)
    
    static NewWithPlantFractionOfOptimalSize(aPlant: PdPlant, aFraction: float): PdLeaf {
        let result = new PdLeaf()
        result.initializeFractionOfOptimalSize(aPlant, aFraction)
        return result
    }
    
    initializeFractionOfOptimalSize(thePlant: PdPlant, aFraction: float): void {
        let i: int
        
        try {
            this.initialize(thePlant)
            //Plant sets this from outside on first phytomer.
            this.isSeedlingLeaf = false
            this.liveBiomass_pctMPB = aFraction * PdLeaf.optimalInitialBiomass_pctMPB(this.plant)
            this.deadBiomass_pctMPB = 0.0
            this.propFullSize = safedivExcept(this.liveBiomass_pctMPB, this.plant.pLeaf.optimalBiomass_pctMPB, 1.0)
            if (this.plant.pLeaf.compoundNumLeaflets > 1) {
                for (i = 0; i <= kNumCompoundLeafRandomSwayIndexes; i++) {
                    this.compoundLeafRandomSwayIndexes[i] = this.plant.randomNumberGenerator.zeroToOne()
                }
            }
        } catch (e: any) {
            messageForExceptionType(e, "PdLeaf.initializeFractionOfOptimalSize")
        }
    }
    
    static optimalInitialBiomass_pctMPB(drawingPlant: PdPlant): float {
        return drawingPlant.pLeaf.optimalFractionOfOptimalBiomassAtCreation_frn * drawingPlant.pLeaf.optimalBiomass_pctMPB
    }
    
    getName(): string {
        let result = ""
        result = "leaf"
        return result
    }
    
    nextDay(): void {
        try {
            super.nextDay()
            this.checkIfHasAbscissed()
        } catch (e: any) {
            messageForExceptionType(e, "PdLeaf.nextDay")
        }
    }
    
    traverseActivity(mode: int, traverser: PdTraverser): void {
        let propFullSizeWanted: float
        let newBiomass_pctMPB: float
        let biomassToRemove_pctMPB: float
        let fractionOfMaxAge_frn: float
        let turtle: KfTurtle
        
        super.traverseActivity(mode, traverser)
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff && (mode !== Activity.kActivityStream) && (mode !== Activity.kActivityFree)) {
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
                    if (this.age > this.plant.pLeaf.maxDaysToGrow) {
                        this.biomassDemand_pctMPB = 0.0
                        return
                    }
                    fractionOfMaxAge_frn = safedivExcept(this.age + 1, this.plant.pLeaf.maxDaysToGrow, 0.0)
                    propFullSizeWanted = max(0.0, min(1.0, scurve(fractionOfMaxAge_frn, this.plant.pLeaf.sCurveParams.c1, this.plant.pLeaf.sCurveParams.c2)))
                    this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, propFullSizeWanted * this.plant.pLeaf.optimalBiomass_pctMPB, this.plant.pLeaf.minDaysToGrow)
                    traverser.total = traverser.total + this.biomassDemand_pctMPB
                    break
                case Activity.kActivityDemandReproductive:
                    break
                case Activity.kActivityGrowVegetative:
                    if (this.age > this.plant.pLeaf.maxDaysToGrow) {
                        // no repro. demand
                        return
                    }
                    newBiomass_pctMPB = this.biomassDemand_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB + newBiomass_pctMPB
                    this.propFullSize = min(1.0, safedivExcept(this.totalBiomass_pctMPB(), this.plant.pLeaf.optimalBiomass_pctMPB, 0))
                    break
                case Activity.kActivityGrowReproductive:
                     // no repro. growth
                    break
                case Activity.kActivityStartReproduction:
                    // no response 
                    break
                case Activity.kActivityFindPlantPartAtPosition:
                    if (pointsAreCloseEnough(traverser.point, this.position())) {
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
                    // phytomer will control drawing 
                    //streaming will be done by internode
                    // free will be called by phytomer 
                    traverser.total = traverser.total + this.liveBiomass_pctMPB
                    break
                case Activity.kActivityRemoveVegetativeBiomass:
                    biomassToRemove_pctMPB = this.liveBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - biomassToRemove_pctMPB
                    this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + biomassToRemove_pctMPB
                    break
                case Activity.kActivityReproductiveBiomassThatCanBeRemoved:
                    break
                case Activity.kActivityRemoveReproductiveBiomass:
                    break
                case Activity.kActivityGatherStatistics:
                    if (this.isSeedlingLeaf) {
                        // none 
                        // none 
                        this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeSeedlingLeaf)
                    } else {
                        this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeLeaf)
                    }
                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeAllVegetative)
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
                    throw new Error("Problem: Unhandled mode in method PdLeaf.traverseActivity.")
            }
        } catch (e: any) {
            messageForExceptionType(e, "PdLeaf.traverseActivity")
        }
    }
    
    checkIfHasAbscissed(): void {
        // if enough biomass removed (parameter), absciss leaf or leaves 
        // not doing anymore
        //if (self.fractionLive < plant.pLeaf.fractionOfLiveBiomassWhenAbscisses_frn) and (not self.hasFallenOff) then
        //  self.hasFallenOff := true;
    }
    
    isPhytomer(): boolean {
        return false
    }
    
    countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser: PdTraverser): void {
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff) {
            return
        }
        if (this.propFullSize <= 0) {
            return
        }
        if (this.isSeedlingLeaf) {
            if (this.plant.pSeedlingLeaf.leafTdoParams.scaleAtFullSize > 0) {
                // seedling leaf
                traverser.total3DExportPointsIn3DObjects += this.plant.pSeedlingLeaf.leafTdoParams.object3D.pointsInUse
                traverser.total3DExportTrianglesIn3DObjects += this.plant.pSeedlingLeaf.leafTdoParams.object3D.triangles.length
                this.addExportMaterial(traverser, ExportPart.kExportPartSeedlingLeaf, -1)
            }
            // not seedling leaf
        } else {
            if (this.plant.pLeaf.leafTdoParams.scaleAtFullSize > 0) {
                // leaf (considering compound leaf)
                traverser.total3DExportPointsIn3DObjects += this.plant.pLeaf.leafTdoParams.object3D.pointsInUse * this.plant.pLeaf.compoundNumLeaflets
                traverser.total3DExportTrianglesIn3DObjects += this.plant.pLeaf.leafTdoParams.object3D.triangles.length * this.plant.pLeaf.compoundNumLeaflets
                this.addExportMaterial(traverser, ExportPart.kExportPartLeaf, -1)
            }
            if (this.plant.pLeaf.stipuleTdoParams.scaleAtFullSize > 0) {
                // stipule
                traverser.total3DExportPointsIn3DObjects += this.plant.pLeaf.stipuleTdoParams.object3D.pointsInUse
                traverser.total3DExportTrianglesIn3DObjects += this.plant.pLeaf.stipuleTdoParams.object3D.triangles.length
                this.addExportMaterial(traverser, ExportPart.kExportPartLeafStipule, -1)
            }
        }
        if (this.plant.pLeaf.petioleLengthAtOptimalBiomass_mm > 0) {
            // petiole
            traverser.total3DExportStemSegments += 1
            if (this.isSeedlingLeaf) {
                this.addExportMaterial(traverser, ExportPart.kExportPartFirstPetiole, -1)
            } else {
                this.addExportMaterial(traverser, ExportPart.kExportPartPetiole, -1)
            }
            if (this.plant.pLeaf.compoundNumLeaflets > 1) {
                // petiolets + compound leaf internodes
                traverser.total3DExportStemSegments += this.plant.pLeaf.compoundNumLeaflets * 2
            }
        }
    }
    
    tdoToSortLinesWith(): KfObject3D | null {
        let result: KfObject3D | null = null
        if (this.plant === null) {
            return result
        }
        if (this.isSeedlingLeaf) {
            result = this.plant.pSeedlingLeaf.leafTdoParams.object3D
        } else {
            result = this.plant.pLeaf.leafTdoParams.object3D
        }
        return result
    }
    
    drawWithDirection(direction: float): void {
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
            // amendment rotations handled in drawStemSegment for petiole
            turtle.pop()
            return
        }
        try {
            if (this.plant.needToRecalculateColors) {
                this.calculateColors()
            }
            this.plant.turtle.push()
            if (direction === Direction.kDirectionRight) {
                turtle.rotateX(128)
            }
            let length = this.plant.pLeaf.petioleLengthAtOptimalBiomass_mm * this.propFullSize
            if (this.isSeedlingLeaf) {
                length = length / 2
            }
            const width = this.plant.pLeaf.petioleWidthAtOptimalBiomass_mm * this.propFullSize
            const angle = this.angleWithSway(this.plant.pLeaf.petioleAngle)
            turtle.ifExporting_startNestedGroupOfPlantParts("leaf, petiole and stipule", "LeafPetiole", NestingType.kNestingTypeLeafAndPetiole)
            if (this.isSeedlingLeaf) {
                this.drawStemSegment(length, width, angle, 0, this.plant.pLeaf.petioleColor, this.plant.pLeaf.petioleTaperIndex, ExportPart.kExportPartPetiole, kUseAmendment)
                const scale = (this.propFullSize * (this.plant.pSeedlingLeaf.leafTdoParams.scaleAtFullSize / 100.0)) * 1.0
                this.DrawLeafOrLeaflet(scale)
            } else {
                if (this.plant.pLeaf.stipuleTdoParams.scaleAtFullSize > 0) {
                    this.drawStipule()
                }
                if ((this.plant.pLeaf.compoundNumLeaflets <= 1) || this.plant.turtle.drawOptions.simpleLeavesOnly) {
                    this.drawStemSegment(length, width, angle, 0, this.plant.pLeaf.petioleColor, this.plant.pLeaf.petioleTaperIndex, ExportPart.kExportPartPetiole, kUseAmendment)
                    const scale = this.propFullSize * this.plant.pLeaf.leafTdoParams.scaleAtFullSize / 100.0
                    this.DrawLeafOrLeaflet(scale)
                } else {
                    this.drawStemSegment(length, width, angle, 0, this.plant.pLeaf.petioleColor, kDontTaper, ExportPart.kExportPartPetiole, kUseAmendment)
                    turtle.ifExporting_startNestedGroupOfPlantParts("compound leaf", "CompoundLeaf", NestingType.kNestingTypeCompoundLeaf)
                    if (this.plant.pLeaf.compoundPinnateOrPalmate === CompoundLeafStyle.kCompoundLeafPinnate) {
                        this.drawCompoundLeafPinnate()
                    } else {
                        this.drawCompoundLeafPalmate()
                    }
                    turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeCompoundLeaf)
                }
            }
            turtle.pop()
            turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeLeafAndPetiole)
            turtle.pop()
        } catch (e: any) {
            messageForExceptionType(e, "PdLeaf.drawWithDirection")
        }
    }
    
    wiltLeaf(): void {
        if (this.plant.turtle === null) {
            //  var
            //    angle: integer; 
            return
        }
        // angle := round(abs(plant.turtle.angleX + 32) * plant.pGeneral.wiltingPercent / 100.0);
        //  if plant.turtle.angleX > -32 then
        //    angle := -angle;
        //  plant.turtle.rotateX(angle); 
    }
    
    drawStipule(): void {
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        if (this.isSeedlingLeaf) {
            return
        }
        turtle.push()
        turtle.rotateX(this.angleWithSway(this.plant.pLeaf.stipuleTdoParams.xRotationBeforeDraw))
        turtle.rotateY(this.angleWithSway(this.plant.pLeaf.stipuleTdoParams.yRotationBeforeDraw))
        turtle.rotateZ(this.angleWithSway(this.plant.pLeaf.stipuleTdoParams.zRotationBeforeDraw))
        const scale = (this.propFullSize * (this.plant.pLeaf.stipuleTdoParams.scaleAtFullSize / 100.0)) * 1.0
        if (this.plant.pLeaf.stipuleTdoParams.repetitions > 1) {
            const turnPortion: int = 256 / this.plant.pLeaf.stipuleTdoParams.repetitions
            const leftOverDegrees: int = 256 - turnPortion * this.plant.pLeaf.stipuleTdoParams.repetitions
            let addition: float
            if (leftOverDegrees > 0) {
                addition = leftOverDegrees / this.plant.pLeaf.stipuleTdoParams.repetitions
            } else {
                addition = 0
            }
            let carryOver: float = 0
            for (let i = 1; i <= this.plant.pLeaf.stipuleTdoParams.repetitions; i++) {
                const addThisTime: int = Math.trunc(addition + carryOver)
                carryOver = carryOver + addition - addThisTime
                if (carryOver < 0) {
                    carryOver = 0
                }
                turtle.rotateY(turnPortion + addThisTime)
                if (this.plant.pLeaf.stipuleTdoParams.object3D !== null) {
                    this.draw3DObject(this.plant.pLeaf.stipuleTdoParams.object3D, scale, this.plant.pLeaf.stipuleTdoParams.faceColor, this.plant.pLeaf.stipuleTdoParams.backfaceColor, ExportPart.kExportPartLeafStipule)
                }
            }
        } else if (this.plant.pLeaf.stipuleTdoParams.object3D !== null) {
            this.draw3DObject(this.plant.pLeaf.stipuleTdoParams.object3D, scale, this.plant.pLeaf.stipuleTdoParams.faceColor, this.plant.pLeaf.stipuleTdoParams.backfaceColor, ExportPart.kExportPartLeafStipule)
        }
        turtle.pop()
    }
    
    DrawLeafOrLeaflet(aScale: float): void {
        let rotateAngle: float
        let tdo: KfObject3D
        let useFaceColor: TColorRef
        let useBackfaceColor: TColorRef
        
        //Draw leaf only. If seedling leaf (on first phytomer), draw seedling leaf 3D object and colors instead.
        //    Wilt leaf according to water stress and age.
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        if (this.isSeedlingLeaf) {
            turtle.setLineWidth(1.0)
            useFaceColor = this.plant.pSeedlingLeaf.leafTdoParams.faceColor
            useBackfaceColor = this.plant.pSeedlingLeaf.leafTdoParams.backfaceColor
        } else {
            turtle.setLineWidth(1.0)
            useFaceColor = this.plant.pLeaf.leafTdoParams.faceColor
            useBackfaceColor = this.plant.pLeaf.leafTdoParams.backfaceColor
        }
        if (this.isSeedlingLeaf) {
            //this aligns the 3D object as stored in the file to the way it should draw on the plant
            // turtle.RotateX(64)  // flip over; in 3D designer you design the leaf from the underside
            //rotateAngle := self.angleWithSway(plant.pLeaf.object3DXRotationBeforeDraw * 256 / 360);
            //turtle.rotateX(rotateAngle);
            // no longer doing this because default X rotation is 90 degrees
            turtle.rotateX(this.angleWithSway(this.plant.pSeedlingLeaf.leafTdoParams.xRotationBeforeDraw))
            turtle.rotateY(this.angleWithSway(this.plant.pSeedlingLeaf.leafTdoParams.yRotationBeforeDraw))
            turtle.rotateZ(this.angleWithSway(this.plant.pSeedlingLeaf.leafTdoParams.zRotationBeforeDraw))
        } else {
            turtle.rotateX(this.angleWithSway(this.plant.pLeaf.leafTdoParams.xRotationBeforeDraw))
            turtle.rotateY(this.angleWithSway(this.plant.pLeaf.leafTdoParams.yRotationBeforeDraw))
            turtle.rotateZ(this.angleWithSway(this.plant.pLeaf.leafTdoParams.zRotationBeforeDraw))
        }
        //pull leaf up to plane of petiole (is perpendicular)
        turtle.rotateZ(-64)
        this.wiltLeaf()
        if (this.isSeedlingLeaf) {
            tdo = this.plant.pSeedlingLeaf.leafTdoParams.object3D
        } else {
            tdo = this.plant.pLeaf.leafTdoParams.object3D
        }
        if (tdo !== null) {
            this.draw3DObject(tdo, aScale, useFaceColor, useBackfaceColor, ExportPart.kExportPartLeaf)
        }
    }
    
    drawCompoundLeafPinnate(): void {
        let scale: float
        let i: int
        
        //Draw compound leaf. Use recursion structure we used to use for whole plant, with no branching.
        //    Leaflets decrease in size as you move up the leaf, simulating a gradual appearance of leaflets.
        //    Note that seedling leaves are never compound.
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        if (this.plant.pLeaf.compoundNumLeaflets <= 0) {
            return
        }
        for (i = this.plant.pLeaf.compoundNumLeaflets; i >= 1; i--) {
            if (this.plant.pLeaf.compoundPinnateLeafletArrangement === LeafArrangement.kArrangementOpposite) {
                if ((i !== 1) && (i % 2 === 1)) {
                    // v2 added opposite leaflets
                    this.drawCompoundLeafInternode(i)
                }
            } else if (i !== 1) {
                this.drawCompoundLeafInternode(i)
            }
            turtle.push()
            scale = this.propFullSize * this.plant.pLeaf.leafTdoParams.scaleAtFullSize / 100.0
            this.DrawCompoundLeafPetioletCount(scale, i)
            this.DrawLeafOrLeaflet(scale)
            turtle.pop()
        }
    }
    
    drawCompoundLeafInternode(count: int): void {
        //Draw internode of leaflet (portion of rachis). This is almost identical to drawing the petiole, etc,
        //   but a bit of random drift is included to make the compound leaf look more single.
        const length = this.plant.pLeaf.petioleLengthAtOptimalBiomass_mm * this.propFullSize * this.plant.pLeaf.compoundRachisToPetioleRatio / 100.0
        const width = this.plant.pLeaf.petioleWidthAtOptimalBiomass_mm * this.propFullSize
        // v1.6b3
        const angleZ = this.compoundLeafAngleWithSway(this.bendAngleForCompoundLeaf(count), count)
        const angleY = this.compoundLeafAngleWithSway(0, count)
        this.drawStemSegment(length, width, angleZ, angleY, this.plant.pLeaf.petioleColor, kDontTaper, ExportPart.kExportPartPetiole, kDontUseAmendment)
    }
    
    // v1.6b3
    bendAngleForCompoundLeaf(count: int): float {
        let result = 0.0
        let leafletNumberEffect: float
        let propFullSizeThisLeaflet: float
        let difference: float
        
        result = 0
        if (this.plant === null) {
            return result
        }
        difference = Math.abs(this.plant.pLeaf.compoundCurveAngleAtFullSize - this.plant.pLeaf.compoundCurveAngleAtStart)
        leafletNumberEffect = 0.75 + 0.25 * safedivExcept(count, this.plant.pLeaf.compoundNumLeaflets - 1, 0)
        propFullSizeThisLeaflet = max(0.0, min(1.0, (0.25 + 0.75 * this.propFullSize) * leafletNumberEffect))
        if (this.plant.pLeaf.compoundCurveAngleAtFullSize > this.plant.pLeaf.compoundCurveAngleAtStart) {
            result = this.plant.pLeaf.compoundCurveAngleAtStart + difference * propFullSizeThisLeaflet
        } else {
            result = this.plant.pLeaf.compoundCurveAngleAtStart - difference * propFullSizeThisLeaflet
        }
        return result
    }
    
    DrawCompoundLeafPetioletCount(scale: float, aCount: int): void {
        // Draw petiolet, which is the leaflet stem coming off the compound leaf rachis.
        const length = scale * this.plant.pLeaf.petioleLengthAtOptimalBiomass_mm * this.propFullSize
        const width = scale * this.plant.pLeaf.petioleWidthAtOptimalBiomass_mm * this.propFullSize
        let angle: float
        if (aCount === 1) {
            angle = 0
        } else {
            if (odd(aCount)) {
                angle = 32
            } else {
                angle = -32
            }
        }
        angle = this.compoundLeafAngleWithSway(angle, aCount)
        this.drawStemSegment(length, width, 0, angle, this.plant.pLeaf.petioleColor, this.plant.pLeaf.petioleTaperIndex, ExportPart.kExportPartPetiole, kDontUseAmendment)
    }
    
    compoundLeafAngleWithSway(angle: float, count: int): float {
        let result = 0.0
        let randomNumber: float
        
        result = angle
        if (this.plant === null) {
            return result
        }
        if (count < 0) {
            count = 0
        }
        count = count % kNumCompoundLeafRandomSwayIndexes
        randomNumber = this.compoundLeafRandomSwayIndexes[count]
        result = angle + ((randomNumber - 0.5) * this.plant.pGeneral.randomSway)
        return result
    }
    
    drawCompoundLeafPalmate(): void {
        // Draw palmate compound leaf. Use recursion structure we used to use for whole plant, with no branching.
        //    In a palmate leaf, leaflets increase in size as you move toward the middle of the leaf.
        //    Note that seedling leaves are never compound.
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        const angleOne = safedivExcept(64, this.plant.pLeaf.compoundNumLeaflets, 0)
        if (this.plant.pLeaf.compoundNumLeaflets > 0) {
            for (let i = this.plant.pLeaf.compoundNumLeaflets; i >= 1; i--) {
                turtle.push()
                let angle: float
                if (i === 1) {
                    angle = 0
                } else if (odd(i)) {
                    angle = angleOne * i * -1
                } else {
                    angle = angleOne * i * 1
                }
                const length = this.plant.pLeaf.petioleLengthAtOptimalBiomass_mm * this.propFullSize * this.plant.pLeaf.compoundRachisToPetioleRatio / 100.0
                const width = this.plant.pLeaf.petioleWidthAtOptimalBiomass_mm * this.propFullSize
                this.drawStemSegment(length, width, 0, angle, this.plant.pLeaf.petioleColor, this.plant.pLeaf.petioleTaperIndex, ExportPart.kExportPartPetiole, kDontUseAmendment)
                const scale = this.propFullSize * this.plant.pLeaf.leafTdoParams.scaleAtFullSize / 100.0
                //scale := safedivExcept(scale, plant.pLeaf.compoundNumLeaflets, 0); 
                this.DrawLeafOrLeaflet(scale)
                turtle.pop()
            }
        }
    }
    
    report(): void {
        super.report()
        //debugPrint('leaf, age ' + IntToStr(age) + ' biomass ' + floatToStr(liveBiomass_pctMPB));
        //DebugForm.printNested(plant.turtle.stackSize, 'leaf, age ' + IntToStr(age));
    }
    
    partType(): int {
        return PartType.kPartTypeLeaf
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdLeaf
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)

        this.sCurveParams.streamUsingFiler(filer)
        this.propFullSize = filer.streamSingle(this.propFullSize)
        this.biomassAtCreation_pctMPB = filer.streamSingle(this.biomassAtCreation_pctMPB)
        this.isSeedlingLeaf = filer.streamBoolean(this.isSeedlingLeaf)
    }
    
}

