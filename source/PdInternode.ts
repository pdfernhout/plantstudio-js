// PdInternode was unit uintern

import { PdPlantPart, kDontTaper, kUseAmendment } from "./PdPlantPart";
import { TColorRef, float, long, int, byte, IntToStr } from "./common";
import { PdPlant, PartType, Direction, LeafArrangement } from "./PdPlant";
import { PdPlantDrawingAmendment } from "./PdPlantDrawingAmendment";
import { PdFiler, PdClassAndVersionInformationRecord } from "./temporary";
import { max, pointsAreCloseEnough, min, safedivExcept } from "./umath";
import { messageForExceptionType, blendColors } from "./usupport";
import { Activity, Statistics, PdTraverser, TraverseDirection, linearGrowthResult, linearGrowthWithFactor } from "./PdTraverser";
import { ClassId } from "./uclasses";
import { KfTurtle } from "./KfTurtle";
import { KfObject3D } from "./KfObject3D";
import { TRect } from "./TRect";
import { ExportPart } from "./U3dexport";

export class PdInternode extends PdPlantPart {
    leftBranchPlantPart: PdPlantPart | null = null
    rightBranchPlantPart: PdPlantPart | null = null
    nextPlantPart: PdPlantPart | null = null
    phytomerAttachedTo: PdInternode | null = null
    leftLeaf: PdLeaf | null = null
    rightLeaf: PdLeaf | null = null
    internodeColor: TColorRef = 0
    internodeAngle: float = 0.0
    lengthExpansion: float = 0.0
    widthExpansion: float = 0.0
    boltingExpansion: float = 0.0
    fractionOfOptimalInitialBiomassAtCreation_frn: float = 0.0
    traversingDirection: byte = 0
    isFirstPhytomer: boolean = false
    newBiomassForDay_pctMPB: float = 0.0
    distanceFromFirstPhytomer: long = 0
    
    static NewWithPlantFractionOfInitialOptimalSize(aPlant: PdPlant, aFraction: float): PdInternode {
        let result = new PdInternode()
        result.InitializeFractionOfInitialOptimalSize(aPlant, aFraction)
        return result
    }
    
    // ???
    InitializeFractionOfInitialOptimalSize(thePlant: PdPlant, aFraction: float): void {
        this.initialize(thePlant)
        //Plant sets this from outside on first phytomer.
        this.isFirstPhytomer = false
        this.calculateInternodeAngle()
        this.lengthExpansion = 1.0
        this.widthExpansion = 1.0
        this.boltingExpansion = 1.0
        this.fractionOfOptimalInitialBiomassAtCreation_frn = aFraction
        this.liveBiomass_pctMPB = aFraction * PdInternode.optimalInitialBiomass_pctMPB(this.plant)
        this.deadBiomass_pctMPB = 0.0
        this.internodeColor = this.plant.pInternode.faceColor
        this.leftLeaf = PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        if (this.plant.pMeristem.branchingAndLeafArrangement === LeafArrangement.kArrangementOpposite) {
            this.rightLeaf = PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        }
    }
    
    getName(): string {
        let result = ""
        result = "internode"
        return result
    }
    
    makeSecondSeedlingLeaf(aFraction: float): void {
        if (this.rightLeaf === null) {
            this.rightLeaf = PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        }
        if (this.rightLeaf !== null) {
            this.rightLeaf.isSeedlingLeaf = true
        }
    }
    
    setAsFirstPhytomer(): void {
        this.isFirstPhytomer = true
        if (this.leftLeaf !== null) {
            this.leftLeaf.isSeedlingLeaf = true
        }
        if (this.rightLeaf !== null) {
            this.rightLeaf.isSeedlingLeaf = true
        }
        this.calculateInternodeAngle()
    }
    
    determineAmendmentAndAlsoForChildrenIfAny(): void {
        let amendmentToPass: PdPlantDrawingAmendment | null
        
        super.determineAmendmentAndAlsoForChildrenIfAny()
        if (this.amendment !== null) {
            amendmentToPass = this.amendment
        } else {
            amendmentToPass = this.parentAmendment
        }
        if (this.leftBranchPlantPart !== null) {
            this.leftBranchPlantPart.parentAmendment = amendmentToPass
        }
        if (this.rightBranchPlantPart !== null) {
            this.rightBranchPlantPart.parentAmendment = amendmentToPass
        }
        if (this.nextPlantPart !== null) {
            this.nextPlantPart.parentAmendment = amendmentToPass
        }
        if (this.leftLeaf !== null) {
            // amendment must be passed to leaves explicitly since they are not strictly speaking children
            this.leftLeaf.parentAmendment = amendmentToPass
        }
        if (this.rightLeaf !== null) {
            this.leftLeaf.parentAmendment = amendmentToPass
        }
    }
    
    nextDay(): void {
        let tryExpansion: float
        
        try {
            super.nextDay()
            if (this.liveBiomass_pctMPB > 0) {
                try {
                    // length and width expansion adjustment from new biomass (always decreases because new biomass is compact) 
                    // if liveBiomass_pctMPB is extremely small, these divisions may produce an overflow 
                    // must bound these because some accounting error is causing problems that should be fixed later 
                    tryExpansion = max(0.0, min(500.0, safedivExcept(this.liveBiomass_pctMPB - this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * this.lengthExpansion + safedivExcept(this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * 1.0))
                    this.lengthExpansion = tryExpansion
                } catch (e) {
                    // pass
                }
                try {
                    tryExpansion = max(0.0, min(50.0, safedivExcept(this.liveBiomass_pctMPB - this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * this.widthExpansion + safedivExcept(this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * 1.0))
                    this.widthExpansion = tryExpansion
                } catch (e) {
                    // pass
                }
                if (this.plant.floweringHasStarted) {
                    // not using this version
                    //    { length and width expansion increase due to water uptake }
                    //    with plant.pInternode do
                    //      if self.age <= plant.pInternode.maxDaysToExpand then
                    //        begin
                    //        linearGrowthWithFactor(self.lengthExpansion,
                    //            lengthMultiplierDueToExpansion, minDaysToExpand, 1.0); {1.0 was water stress factor}
                    //        linearGrowthWithFactor(self.widthExpansion,
                    //            widthMultiplierDueToExpansion, minDaysToExpand, 1.0);
                    //        end;
                    //    
                    //and
                    //      (plant.age - plant.ageAtWhichFloweringStarted <= plant.pInternode.maxDaysToBolt)
                    this.boltingExpansion = linearGrowthWithFactor(this.boltingExpansion, this.plant.pInternode.lengthMultiplierDueToBolting, this.plant.pInternode.minDaysToBolt, 1.0)
                }
            }
            this.checkIfSeedlingLeavesHaveAbscissed()
            this.calculateDistanceFromFirstPhytomer()
        } catch (e) {
            messageForExceptionType(e, "PdInternode.nextDay")
        }
    }
    
    static optimalInitialBiomass_pctMPB(plant: PdPlant): float {
        return safedivExcept(plant.pInternode.optimalFinalBiomass_pctMPB, plant.pInternode.lengthMultiplierDueToBiomassAccretion * plant.pInternode.widthMultiplierDueToBiomassAccretion, 0)
    }
    
    propFullLength(): float {
        return safedivExcept(this.totalBiomass_pctMPB() * this.lengthExpansion * this.boltingExpansion, this.plant.pInternode.optimalFinalBiomass_pctMPB, 0)
    }
    
    propFullWidth(): float {
        return safedivExcept(this.totalBiomass_pctMPB() * this.widthExpansion, this.plant.pInternode.optimalFinalBiomass_pctMPB, 0)
    }
    
    traverseActivity(mode: int, traverser: PdTraverser): void {
        let biomassToRemove_pctMPB: float
        let targetBiomass_pctMPB: float
        
        super.traverseActivity(mode, traverser)
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff && (mode !== Activity.kActivityStream) && (mode !== Activity.kActivityFree)) {
            return
        }
        try {
            if ((mode !== Activity.kActivityDraw)) {
                if (this.leftLeaf !== null) {
                    this.leftLeaf.traverseActivity(mode, traverser)
                }
                if (this.rightLeaf !== null) {
                    this.rightLeaf.traverseActivity(mode, traverser)
                }
            }
            switch (mode) {
                case Activity.kActivityNone:
                    break
                case Activity.kActivityNextDay:
                    this.nextDay()
                    if (this.age < traverser.ageOfYoungestPhytomer) {
                        traverser.ageOfYoungestPhytomer = this.age
                    }
                    break
                case Activity.kActivityDemandVegetative:
                    if (this.age > this.plant.pInternode.maxDaysToAccumulateBiomass) {
                        this.biomassDemand_pctMPB = 0.0
                        return
                    }
                    try {
                        if (this.plant.pInternode.canRecoverFromStuntingDuringCreation) {
                            targetBiomass_pctMPB = this.plant.pInternode.optimalFinalBiomass_pctMPB
                        } else {
                            targetBiomass_pctMPB = this.plant.pInternode.optimalFinalBiomass_pctMPB * this.fractionOfOptimalInitialBiomassAtCreation_frn
                        }
                        this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, targetBiomass_pctMPB, this.plant.pInternode.minDaysToAccumulateBiomass)
                        traverser.total = traverser.total + this.biomassDemand_pctMPB
                    } catch (e) {
                        messageForExceptionType(e, "PdInternode.traverseActivity (vegetative demand)")
                    }
                    break
                case Activity.kActivityDemandReproductive:
                    break
                case Activity.kActivityGrowVegetative:
                    if (this.age > this.plant.pInternode.maxDaysToAccumulateBiomass) {
                        //Return reproductive demand recursively from all reproductive meristems and fruits connected to
                        //      this phytomer. Phytomers, inflorescences, and flowers themselves have no demands.
                        return
                    }
                    try {
                        this.newBiomassForDay_pctMPB = max(0.0, this.biomassDemand_pctMPB * traverser.fractionOfPotentialBiomass)
                        this.liveBiomass_pctMPB = this.liveBiomass_pctMPB + this.newBiomassForDay_pctMPB
                    } catch (e) {
                        messageForExceptionType(e, "PdInternode.traverseActivity (vegetative growth)")
                    }
                    break
                case Activity.kActivityGrowReproductive:
                    break
                case Activity.kActivityStartReproduction:
                    break
                case Activity.kActivityFindPlantPartAtPosition:
                    if (pointsAreCloseEnough(traverser.point, this.position())) {
                        //Recurse available photosynthate allocated to reproductive growth to all plant parts.
                        //      Only meristems and fruits will incorporate it.
                        //Send signal to consider reproductive mode to all meristems on plant.
                        traverser.foundPlantPart = this
                        traverser.finished = true
                    }
                    break
                case Activity.kActivityDraw:
                    this.draw()
                    break
                case Activity.kActivityReport:
                    break
                case Activity.kActivityStream:
                    this.streamUsingFiler(traverser.filer)
                    break
                case Activity.kActivityFree:
                    break
                case Activity.kActivityVegetativeBiomassThatCanBeRemoved:
                    // free called by traverser 
                    traverser.total = traverser.total + this.liveBiomass_pctMPB
                    break
                case Activity.kActivityRemoveVegetativeBiomass:
                    biomassToRemove_pctMPB = this.liveBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - biomassToRemove_pctMPB
                    this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + biomassToRemove_pctMPB
                    break
                case Activity.kActivityReproductiveBiomassThatCanBeRemoved:
                    // none 
                    break
                case Activity.kActivityRemoveReproductiveBiomass:
                    // none 
                    break
                case Activity.kActivityGatherStatistics: 
                    this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeStem)
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
                    if (this.traversingDirection === TraverseDirection.kTraverseDone) {
                        // on way up, do nothing; on way down, total up accumulated biomass
                        this.biomassOfMeAndAllPartsAboveMe_pctMPB = this.biomassOfMeAndAllPartsConnectedToMe_pctMPB() + this.biomassOfPartsImmediatelyAboveMe_pctMPB()
                    }
                    break
                case Activity.kActivityCountPointsAndTrianglesFor3DExport:
                    this.countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser)
                    break
                default:
                    throw new Error("Problem: Unhandled mode in method PdInternode.traverseActivity.")
            }
        } catch (e) {
            messageForExceptionType(e, "PdInternode.traverseActivity")
        }
    }
    
    countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser: PdTraverser): void {
        if (traverser === null) {
            return
        }
        traverser.total3DExportStemSegments += 1
        this.addExportMaterial(traverser, ExportPart.kExportPartInternode, -1)
        if (this.plant.pRoot.tdoParams.scaleAtFullSize > 0) {
            this.addExportMaterial(traverser, ExportPart.kExportPartRootTop, -1)
        }
    }
    
    isPhytomer(): boolean {
        return true
    }
    
    blendColorsStrength(aColor: TColorRef, aStrength: float): void {
        if (aStrength <= 0.0) {
            return
        }
        this.internodeColor = blendColors(this.internodeColor, aColor, aStrength)
    }
    
    setColorsToParameters(): void {
        //Initialize phytomer colors at those in plant parameters, before stresses are considered.
        this.internodeColor = this.plant.pInternode.faceColor
    }
    
    calculateInternodeAngle(): void {
        if (this.isFirstPhytomer) {
            if ((this.plant.pInternode.firstInternodeCurvingIndex === 0)) {
                this.internodeAngle = 0
            } else {
                this.internodeAngle = 64.0 / 100.0 * (this.plant.randomNumberGenerator.randomNormalPercent(this.plant.pInternode.firstInternodeCurvingIndex))
            }
        } else {
            if ((this.plant.pInternode.curvingIndex === 0)) {
                this.internodeAngle = 0
            } else {
                this.internodeAngle = 64.0 / 100.0 * (this.plant.randomNumberGenerator.randomNormalPercent(this.plant.pInternode.curvingIndex))
            }
        }
        this.internodeAngle = this.angleWithSway(this.internodeAngle)
    }
    
    distanceFromApicalMeristem(): long {
        let aPhytomer: PdInternode | null = null
        
        // Count phytomers along this apex until you reach an apical meristem or inflorescence.
        let result = 0
        // ORIGINAL: Maybe NPE if this.nextPlantPart is null?
        if (this.nextPlantPart && this.nextPlantPart.isPhytomer()) {
            aPhytomer = <PdInternode>this.nextPlantPart
        } else {
            aPhytomer = null
        }
        while (aPhytomer !== null) {
            result += 1
            // ORIGINAL: Maybe NPE if aPhytomer.nextPlantPart is null?
            if (aPhytomer.nextPlantPart && aPhytomer.nextPlantPart.isPhytomer()) {
                aPhytomer = <PdInternode>aPhytomer.nextPlantPart
            } else {
                aPhytomer = null
            }
        }
        return result
    }
    
    calculateDistanceFromFirstPhytomer(): void {
        // Count phytomers backwards along this apex until you reach the first.
        let result: long = 0
        if (this.isFirstPhytomer) {
            return
        }
        let aPhytomer: PdInternode | null = this.phytomerAttachedTo
        while (aPhytomer !== null) {
            result += 1
            aPhytomer = aPhytomer.phytomerAttachedTo
        }
        this.distanceFromFirstPhytomer = result
    }
    
    firstPhytomerOnBranch(): PdInternode | null {
        let result: PdInternode | null = this
        while (result !== null) {
            if ((result.phytomerAttachedTo !== null) && (result.phytomerAttachedTo.nextPlantPart === result)) {
                result = result.phytomerAttachedTo
            } else {
                break
            }
        }
        if (result === this) {
            result = null
        }
        return result
    }
    
    biomassOfMeAndAllPartsConnectedToMe_pctMPB(): float {
        let result = this.totalBiomass_pctMPB()
        if (this.leftLeaf !== null) {
            result = result + this.leftLeaf.totalBiomass_pctMPB()
        }
        if (this.rightLeaf !== null) {
            result = result + this.rightLeaf.totalBiomass_pctMPB()
        }
        return result
    }
    
    biomassOfPartsImmediatelyAboveMe_pctMPB(): float {
        let result = 0.0
        if (this.leftBranchPlantPart !== null) {
            result = result + this.leftBranchPlantPart.biomassOfMeAndAllPartsAboveMe_pctMPB
        }
        if (this.rightBranchPlantPart !== null) {
            result = result + this.rightBranchPlantPart.biomassOfMeAndAllPartsAboveMe_pctMPB
        }
        if (this.nextPlantPart !== null) {
            result = result + this.nextPlantPart.biomassOfMeAndAllPartsAboveMe_pctMPB
        }
        return result
    }
    
    draw(): void {
        //Draw all parts of phytomer. Consider if the phytomer is the first (has the seedling leaves) and whether
        //    the leaves attached to this phytomer have abscissed (and are not drawn).
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        
        this.boundsRect = new TRect(0, 0, 0, 0)
        if (this.hiddenByAmendment()) {
            if (this.leftLeaf !== null) {
                // if internode is hidden the leaves could still be drawn, if they are posed.
                // if they are themselves hidden, they will pop back out without drawing.
                this.leftLeaf.drawWithDirection(Direction.kDirectionLeft)
            }
            if (this.rightLeaf !== null) {
                this.rightLeaf.drawWithDirection(Direction.kDirectionRight)
            }
            // amendment rotations handled in drawStemSegment
            return
        }
        try {
            if (this.plant.needToRecalculateColors) {
                this.calculateColors()
            }
            if ((this.isFirstPhytomer) && (this.plant.pRoot.showsAboveGround)) {
                this.drawRootTop()
            }
            this.drawInternode()
            if (this.leftLeaf !== null) {
                this.leftLeaf.drawWithDirection(Direction.kDirectionLeft)
            }
            if (this.rightLeaf !== null) {
                this.rightLeaf.drawWithDirection(Direction.kDirectionRight)
            }
        } catch (e) {
            messageForExceptionType(e, "PdInternode.draw")
        }
    }
    
    drawInternode(): void {
        let length: float
        let width: float
        let zAngle: float
        
        if ((this.plant.turtle === null)) {
            return
        }
        zAngle = this.internodeAngle
        if ((this.phytomerAttachedTo !== null)) {
            if ((this.phytomerAttachedTo.leftBranchPlantPart === this)) {
                zAngle = zAngle + this.plant.pMeristem.branchingAngle
            } else if ((this.phytomerAttachedTo.rightBranchPlantPart === this)) {
                zAngle = zAngle + this.plant.pMeristem.branchingAngle
                this.plant.turtle.rotateX(128)
            }
        }
        length = max(0.0, this.propFullLength() * this.plant.pInternode.lengthAtOptimalFinalBiomassAndExpansion_mm)
        width = max(0.0, this.propFullWidth() * this.plant.pInternode.widthAtOptimalFinalBiomassAndExpansion_mm)
        this.drawStemSegment(length, width, zAngle, 0, this.internodeColor, kDontTaper, ExportPart.kExportPartInternode, kUseAmendment)
    }
    
    drawRootTop(): void {
        // Draw top of root above ground, if it can be seen. Adjust size for heat unit index of plant. 
        // TODO: Move numParts constant somewhere else
        const numParts = 5
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        const scale = safedivExcept(this.plant.age, this.plant.pGeneral.ageAtMaturity, 0) * this.plant.pRoot.tdoParams.scaleAtFullSize / 100.0
        turtle.push()
        let minZ = 0.0
        const tdo = this.plant.pRoot.tdoParams.object3D
        turtle.ifExporting_startPlantPart(this.longNameForDXFPartConsideringGenderEtc(ExportPart.kExportPartRootTop), this.longNameForDXFPartConsideringGenderEtc(ExportPart.kExportPartRootTop))
        if (numParts > 0) {
            for (let i = 0; i < numParts; i++) {
                turtle.rotateX(256 / numParts)
                turtle.push()
                turtle.rotateZ(64)
                turtle.rotateY(-64)
                if (tdo !== null) {
                    turtle.rotateX(this.angleWithSway(this.plant.pRoot.tdoParams.xRotationBeforeDraw))
                    turtle.rotateY(this.angleWithSway(this.plant.pRoot.tdoParams.yRotationBeforeDraw))
                    turtle.rotateZ(this.angleWithSway(this.plant.pRoot.tdoParams.zRotationBeforeDraw))
                    this.draw3DObject(tdo, scale, this.plant.pRoot.tdoParams.faceColor, this.plant.pRoot.tdoParams.backfaceColor, ExportPart.kExportPartRootTop)
                    if (i === 1) {
                        minZ = tdo.zForSorting
                    } else if (tdo.zForSorting < minZ) {
                        minZ = tdo.zForSorting
                    }
                }
                turtle.pop()
            }
        }
        if (tdo !== null) {
            tdo.zForSorting = minZ
        }
        turtle.pop()
        turtle.ifExporting_endPlantPart()
    }
    
    report(): void {
        super.report()
        //debugPrint('internode, age ' + IntToStr(age) + ' biomass ' + floatToStr(liveBiomass_pctMPB));
        //DebugForm.printNested(plant.turtle.stackSize, 'phytomer, age ' + IntToStr(age));
    }
    
    checkIfSeedlingLeavesHaveAbscissed(): void {
        if ((!this.isFirstPhytomer)) {
            //If first phytomer, only want to draw seedling leaves for some time after emergence.
            //  For monopodial plant, stop drawing seedling leaves some number of nodes after emergence (parameter).
            //  For sympodial plant, this doesn't work; use age of meristem instead; age is set as constant.
            return
        }
        if ((this.plant.pMeristem.branchingIsSympodial)) {
            if (this.age < 10) {
                return
            }
        } else {
            if (this.distanceFromApicalMeristem() <= this.plant.pSeedlingLeaf.nodesOnStemWhenFallsOff) {
                return
            }
        }
        if (safedivExcept(this.plant.age, this.plant.pGeneral.ageAtMaturity, 0) < 0.25) {
            // absolute cut-off 
            return
        }
        if (this.leftLeaf !== null) {
            // CFK FIX - should really have removed biomass in seedling leaves from model plant 
            this.leftLeaf.hasFallenOff = true
        }
        if (this.rightLeaf !== null) {
            this.rightLeaf.hasFallenOff = true
        }
    }
    
    partType(): int {
        let result = 0
        result = PartType.kPartTypePhytomer
        return result
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdInternode
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        filer.streamColorRef(this.internodeColor)
        this.internodeAngle = filer.streamSingle(this.internodeAngle)
        this.lengthExpansion = filer.streamSingle(this.lengthExpansion)
        this.widthExpansion = filer.streamSingle(this.widthExpansion)
        this.boltingExpansion = filer.streamSingle(this.boltingExpansion)
        this.fractionOfOptimalInitialBiomassAtCreation_frn = filer.streamSingle(this.fractionOfOptimalInitialBiomassAtCreation_frn)
        this.traversingDirection = filer.streamByte(this.traversingDirection)
        this.isFirstPhytomer = filer.streamBoolean(this.isFirstPhytomer)
        this.newBiomassForDay_pctMPB = filer.streamSingle(this.newBiomassForDay_pctMPB)
        //reading or writing the plant part subobject phytomers will be done by traverser
        //for now, just need to create these objects if needed and set plant and phytomerAttachedTo
        //if it is an inflorescence - read it now
        this.streamPlantPart(filer, this.leftBranchPlantPart)
        this.streamPlantPart(filer, this.rightBranchPlantPart)
        this.streamPlantPart(filer, this.nextPlantPart)
        this.streamPlantPart(filer, this.leftLeaf)
        this.streamPlantPart(filer, this.rightLeaf)
    }
    
    streamPlantPart(filer: PdFiler, plantPart: PdPlantPart | null): void {
        raise "method streamPlantPart had assigned to var parameter plantPart not added to return -- fixup manually"
        let partType: short
        
        if (filer.isWriting()) {
            if (plantPart === null) {
                partType = PartType.kPartTypeNone
            } else {
                partType = plantPart.partType()
            }
            partType = filer.streamSmallint(partType)
            if (plantPart) {
                switch (partType) {
                    case PartType.kPartTypeMeristem:
                        plantPart.streamUsingFiler(filer)
                        break
                    case PartType.kPartTypeInflorescence:
                        plantPart.streamUsingFiler(filer)
                        break
                    case PartType.kPartTypeLeaf:
                        plantPart.streamUsingFiler(filer)
                        break
                }
            }
        } else if (filer.isReading()) {
            partType = filer.streamSmallint(partType)
            switch (partType) {
                case PartType.kPartTypeNone:
                    plantPart = null
                    break
                case PartType.kPartTypeMeristem:
                    plantPart = new PdMeristem()
                    plantPart.plant = this.plant
                    ;(<PdMeristem>plantPart).phytomerAttachedTo = this
                    plantPart.streamUsingFiler(filer)
                    break
                case PartType.kPartTypeInflorescence:
                    plantPart = new PdInflorescence()
                    plantPart.plant = this.plant
                    ;(<PdInflorescence>plantPart).phytomerAttachedTo = this
                    plantPart.streamUsingFiler(filer)
                    break
                case PartType.kPartTypePhytomer:
                    plantPart = new PdInternode()
                    plantPart.plant = this.plant
                    ;(<PdInternode>plantPart).phytomerAttachedTo = this
                    // will be streamed in by traverser
                    break
                case PartType.kPartTypeLeaf:
                    plantPart = new PdLeaf()
                    plantPart.plant = this.plant
                    plantPart.streamUsingFiler(filer)
                    break
                default:
                    Error("PdInternode: unknown plant part type " + IntToStr(partType))
                    break
            }
        }
    }
    
}

