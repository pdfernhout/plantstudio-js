// unit uintern

from conversion_common import *
import uamendmt
import uclasses
import uinflor
import umerist
import umath
import utdo
import u3dexport
import uturtle
import udebug
import usupport
import utravers
import ufiler
import uleaf
import uplant
import upart
import delphi_compatability


export class PdInternode {
    leftBranchPlantPart: PdPlantPart = new PdPlantPart()
    rightBranchPlantPart: PdPlantPart = new PdPlantPart()
    nextPlantPart: PdPlantPart = new PdPlantPart()
    phytomerAttachedTo: PdInternode = new PdInternode()
    leftLeaf: PdLeaf = new PdLeaf()
    rightLeaf: PdLeaf = new PdLeaf()
    internodeColor: TColorRef = new TColorRef()
    internodeAngle: float = 0.0
    lengthExpansion: float = 0.0
    widthExpansion: float = 0.0
    boltingExpansion: float = 0.0
    fractionOfOptimalInitialBiomassAtCreation_frn: float = 0.0
    traversingDirection: byte = 0
    isFirstPhytomer: boolean = false
    newBiomassForDay_pctMPB: float = 0.0
    distanceFromFirstPhytomer: long = 0
    PdInternode.prototype = new PdPlantPart()
    PdInternode.prototype.constructor = PdInternode
    
    NewWithPlantFractionOfInitialOptimalSize(aPlant: PdPlant, aFraction: float): PdInternode {
        let result = new PdInternode()
        result = this.create()
        result.InitializeFractionOfInitialOptimalSize(aPlant, aFraction)
        return result
    }
    
    //???
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
        this.leftLeaf = uleaf.PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        if (this.plant.pMeristem.branchingAndLeafArrangement === uplant.kArrangementOpposite) {
            this.rightLeaf = uleaf.PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        }
    }
    
    getName(): string {
        let result = ""
        result = "internode"
        return result
    }
    
    makeSecondSeedlingLeaf(aFraction: float): void {
        if (this.rightLeaf === null) {
            this.rightLeaf = uleaf.PdLeaf.NewWithPlantFractionOfOptimalSize(this.plant, aFraction)
        }
        if (this.rightLeaf !== null) {
            this.rightLeaf.isSeedlingLeaf = true
        }
    }
    
    destroy(): void {
        //note that if branch parts were phytomers they will have been
        //  freed and set to nil by the traverser
        this.nextPlantPart.free
        this.nextPlantPart = null
        this.leftBranchPlantPart.free
        this.leftBranchPlantPart = null
        this.rightBranchPlantPart.free
        this.rightBranchPlantPart = null
        this.leftLeaf.free
        this.leftLeaf = null
        this.rightLeaf.free
        this.rightLeaf = null
        PdPlantPart.prototype.destroy.call(this)
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
        let amendmentToPass: PdPlantDrawingAmendment
        
        PdPlantPart.prototype.determineAmendmentAndAlsoForChildrenIfAny.call(this)
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
            PdPlantPart.prototype.nextDay.call(this)
            if (this.liveBiomass_pctMPB > 0) {
                try {
                    // length and width expansion adjustment from new biomass (always decreases because new biomass is compact) 
                    // if liveBiomass_pctMPB is extremely small, these divisions may produce an overflow 
                    // must bound these because some accounting error is causing problems that should be fixed later 
                    tryExpansion = umath.max(0.0, umath.min(500.0, umath.safedivExcept(this.liveBiomass_pctMPB - this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * this.lengthExpansion + umath.safedivExcept(this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * 1.0))
                    this.lengthExpansion = tryExpansion
                } catch (e) {
                    // pass
                }
                try {
                    tryExpansion = umath.max(0.0, umath.min(50.0, umath.safedivExcept(this.liveBiomass_pctMPB - this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * this.widthExpansion + umath.safedivExcept(this.newBiomassForDay_pctMPB, this.liveBiomass_pctMPB, 0) * 1.0))
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
                    this.boltingExpansion = utravers.linearGrowthWithFactor(this.boltingExpansion, this.plant.pInternode.lengthMultiplierDueToBolting, this.plant.pInternode.minDaysToBolt, 1.0)
                }
            }
            this.checkIfSeedlingLeavesHaveAbscissed()
            this.calculateDistanceFromFirstPhytomer()
        } catch (Exception e) {
            usupport.messageForExceptionType(e, "PdInternode.nextDay")
        }
    }
    
    optimalInitialBiomass_pctMPB(plant: PdPlant): float {
        let result = 0.0
        result = umath.safedivExcept(plant.pInternode.optimalFinalBiomass_pctMPB, plant.pInternode.lengthMultiplierDueToBiomassAccretion * plant.pInternode.widthMultiplierDueToBiomassAccretion, 0)
        return result
    }
    
    propFullLength(): float {
        let result = 0.0
        result = umath.safedivExcept(this.totalBiomass_pctMPB() * this.lengthExpansion * this.boltingExpansion, this.plant.pInternode.optimalFinalBiomass_pctMPB, 0)
        return result
    }
    
    propFullWidth(): float {
        let result = 0.0
        result = umath.safedivExcept(this.totalBiomass_pctMPB() * this.widthExpansion, this.plant.pInternode.optimalFinalBiomass_pctMPB, 0)
        return result
    }
    
    traverseActivity(mode: int, traverserProxy: TObject): void {
        let traverser: PdTraverser
        let biomassToRemove_pctMPB: float
        let targetBiomass_pctMPB: float
        
        PdPlantPart.prototype.traverseActivity.call(this, mode, traverserProxy)
        traverser = utravers.PdTraverser(traverserProxy)
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff && (mode !== utravers.kActivityStream) && (mode !== utravers.kActivityFree)) {
            return
        }
        try {
            if ((mode !== utravers.kActivityDraw)) {
                if (this.leftLeaf !== null) {
                    this.leftLeaf.traverseActivity(mode, traverser)
                }
                if (this.rightLeaf !== null) {
                    this.rightLeaf.traverseActivity(mode, traverser)
                }
            }
            switch (mode) {
                case utravers.kActivityNone:
                    break
                case utravers.kActivityNextDay:
                    this.nextDay()
                    if (this.age < traverser.ageOfYoungestPhytomer) {
                        traverser.ageOfYoungestPhytomer = this.age
                    }
                    break
                case utravers.kActivityDemandVegetative:
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
                        this.biomassDemand_pctMPB = utravers.linearGrowthResult(this.liveBiomass_pctMPB, targetBiomass_pctMPB, this.plant.pInternode.minDaysToAccumulateBiomass)
                        traverser.total = traverser.total + this.biomassDemand_pctMPB
                    } catch (Exception e) {
                        usupport.messageForExceptionType(e, "PdInternode.traverseActivity (vegetative demand)")
                    }
                    break
                case utravers.kActivityDemandReproductive:
                    break
                case utravers.kActivityGrowVegetative:
                    if (this.age > this.plant.pInternode.maxDaysToAccumulateBiomass) {
                        //Return reproductive demand recursively from all reproductive meristems and fruits connected to
                        //      this phytomer. Phytomers, inflorescences, and flowers themselves have no demands.
                        return
                    }
                    try {
                        this.newBiomassForDay_pctMPB = umath.max(0.0, this.biomassDemand_pctMPB * traverser.fractionOfPotentialBiomass)
                        this.liveBiomass_pctMPB = this.liveBiomass_pctMPB + this.newBiomassForDay_pctMPB
                    } catch (Exception e) {
                        usupport.messageForExceptionType(e, "PdInternode.traverseActivity (vegetative growth)")
                    }
                    break
                case utravers.kActivityGrowReproductive:
                    break
                case utravers.kActivityStartReproduction:
                    break
                case utravers.kActivityFindPlantPartAtPosition:
                    if (umath.pointsAreCloseEnough(traverser.point, this.position())) {
                        //Recurse available photosynthate allocated to reproductive growth to all plant parts.
                        //      Only meristems and fruits will incorporate it.
                        //Send signal to consider reproductive mode to all meristems on plant.
                        traverser.foundPlantPart = this
                        traverser.finished = true
                    }
                    break
                case utravers.kActivityDraw:
                    this.draw()
                    break
                case utravers.kActivityReport:
                    break
                case utravers.kActivityStream:
                    this.streamUsingFiler(traverser.filer)
                    break
                case utravers.kActivityFree:
                    break
                case utravers.kActivityVegetativeBiomassThatCanBeRemoved:
                    // free called by traverser 
                    traverser.total = traverser.total + this.liveBiomass_pctMPB
                    break
                case utravers.kActivityRemoveVegetativeBiomass:
                    biomassToRemove_pctMPB = this.liveBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - biomassToRemove_pctMPB
                    this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + biomassToRemove_pctMPB
                    break
                case utravers.kActivityReproductiveBiomassThatCanBeRemoved:
                    break
                case utravers.kActivityRemoveReproductiveBiomass:
                    break
                case utravers.kActivityGatherStatistics:
                    // none 
                    // none 
                    this.addToStatistics(traverser.statistics, utravers.kStatisticsPartTypeStem)
                    this.addToStatistics(traverser.statistics, utravers.kStatisticsPartTypeAllVegetative)
                    break
                case utravers.kActivityCountPlantParts:
                    break
                case utravers.kActivityFindPartForPartID:
                    break
                case utravers.kActivityCountTotalMemoryUse:
                    traverser.totalMemorySize += this.instanceSize
                    break
                case utravers.kActivityCalculateBiomassForGravity:
                    if (this.traversingDirection === utravers.kTraverseDone) {
                        // on way up, do nothing; on way down, total up accumulated biomass
                        this.biomassOfMeAndAllPartsAboveMe_pctMPB = this.biomassOfMeAndAllPartsConnectedToMe_pctMPB() + this.biomassOfPartsImmediatelyAboveMe_pctMPB()
                    }
                    break
                case utravers.kActivityCountPointsAndTrianglesFor3DExport:
                    this.countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser)
                    break
                default:
                    throw new GeneralException.create("Problem: Unhandled mode in method PdInternode.traverseActivity.")
                    break
        } catch (Exception e) {
            usupport.messageForExceptionType(e, "PdInternode.traverseActivity")
        }
    }
    
    countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser: PdTraverser): void {
        if (traverser === null) {
            return
        }
        traverser.total3DExportStemSegments += 1
        this.addExportMaterial(traverser, u3dexport.kExportPartInternode, -1)
        if (this.plant.pRoot.tdoParams.scaleAtFullSize > 0) {
            this.addExportMaterial(traverser, u3dexport.kExportPartRootTop, -1)
        }
    }
    
    isPhytomer(): boolean {
        let result = false
        result = true
        return result
    }
    
    blendColorsStrength(aColor: TColorRef, aStrength: float): void {
        if (aStrength <= 0.0) {
            return
        }
        this.internodeColor = usupport.blendColors(this.internodeColor, aColor, aStrength)
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
        let result = 0
        let aPhytomer: PdInternode
        
        //Count phytomers along this apex until you reach an apical meristem or inflorescence.
        result = 0
        if ((this.nextPlantPart.isPhytomer())) {
            aPhytomer = PdInternode(this.nextPlantPart)
        } else {
            aPhytomer = null
        }
        while (aPhytomer !== null) {
            result += 1
            if ((aPhytomer.nextPlantPart.isPhytomer())) {
                aPhytomer = PdInternode(aPhytomer.nextPlantPart)
            } else {
                aPhytomer = null
            }
        }
        return result
    }
    
    calculateDistanceFromFirstPhytomer(): void {
        let aPhytomer: PdInternode
        let result: long
        
        //Count phytomers backwards along this apex until you reach the first.
        result = 0
        if (this.isFirstPhytomer) {
            return
        }
        aPhytomer = this.phytomerAttachedTo
        while (aPhytomer !== null) {
            result += 1
            aPhytomer = aPhytomer.phytomerAttachedTo
        }
        this.distanceFromFirstPhytomer = result
    }
    
    firstPhytomerOnBranch(): PdInternode {
        let result = new PdInternode()
        result = this
        while (result !== null) {
            if ((result.phytomerAttachedTo !== null) && (result.phytomerAttachedTo.nextPlantPart === result)) {
                result = PdInternode(result.phytomerAttachedTo)
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
        let result = 0.0
        result = this.totalBiomass_pctMPB()
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
        result = 0
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
        let turtle: KfTurtle
        
        //Draw all parts of phytomer. Consider if the phytomer is the first (has the seedling leaves) and whether
        //    the leaves attached to this phytomer have abscissed (and are not drawn).
        turtle = this.plant.turtle
        if ((turtle === null)) {
            return
        }
        this.boundsRect = Rect(0, 0, 0, 0)
        if (this.hiddenByAmendment()) {
            if (this.leftLeaf !== null) {
                // if internode is hidden the leaves could still be drawn, if they are posed.
                // if they are themselves hidden, they will pop back out without drawing.
                this.leftLeaf.drawWithDirection(uplant.kDirectionLeft)
            }
            if (this.rightLeaf !== null) {
                this.rightLeaf.drawWithDirection(uplant.kDirectionRight)
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
                this.leftLeaf.drawWithDirection(uplant.kDirectionLeft)
            }
            if (this.rightLeaf !== null) {
                this.rightLeaf.drawWithDirection(uplant.kDirectionRight)
            }
        } catch (Exception e) {
            usupport.messageForExceptionType(e, "PdInternode.draw")
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
        len = umath.max(0.0, this.propFullLength() * this.plant.pInternode.lengthAtOptimalFinalBiomassAndExpansion_mm)
        width = umath.max(0.0, this.propFullWidth() * this.plant.pInternode.widthAtOptimalFinalBiomassAndExpansion_mm)
        this.drawStemSegment(len, width, zAngle, 0, this.internodeColor, upart.kDontTaper, u3dexport.kExportPartInternode, upart.kUseAmendment)
    }
    
    drawRootTop(): void {
        let turtle: KfTurtle
        let scale: float
        let numParts: int
        let tdo: KfObject3D
        let minZ: float
        let i: int
        
        //Draw top of root above ground, if it can be seen. Adjust size for heat unit index of plant. 
        //constant
        numParts = 5
        turtle = this.plant.turtle
        if ((turtle === null)) {
            return
        }
        scale = umath.safedivExcept(this.plant.age, this.plant.pGeneral.ageAtMaturity, 0) * this.plant.pRoot.tdoParams.scaleAtFullSize / 100.0
        turtle.push()
        minZ = 0
        tdo = this.plant.pRoot.tdoParams.object3D
        turtle.ifExporting_startPlantPart(this.longNameForDXFPartConsideringGenderEtc(u3dexport.kExportPartRootTop), this.longNameForDXFPartConsideringGenderEtc(u3dexport.kExportPartRootTop))
        if (numParts > 0) {
            for (i = 0; i <= numParts - 1; i++) {
                turtle.rotateX(256 / numParts)
                turtle.push()
                turtle.rotateZ(64)
                turtle.rotateY(-64)
                if (tdo !== null) {
                    turtle.rotateX(this.angleWithSway(this.plant.pRoot.tdoParams.xRotationBeforeDraw))
                    turtle.rotateY(this.angleWithSway(this.plant.pRoot.tdoParams.yRotationBeforeDraw))
                    turtle.rotateZ(this.angleWithSway(this.plant.pRoot.tdoParams.zRotationBeforeDraw))
                    this.draw3DObject(tdo, scale, this.plant.pRoot.tdoParams.faceColor, this.plant.pRoot.tdoParams.backfaceColor, u3dexport.kExportPartRootTop)
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
        PdPlantPart.prototype.report.call(this)
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
            if ((this.age < 10)) {
                return
            }
        } else {
            if ((this.distanceFromApicalMeristem() <= this.plant.pSeedlingLeaf.nodesOnStemWhenFallsOff)) {
                return
            }
        }
        if (umath.safedivExcept(this.plant.age, this.plant.pGeneral.ageAtMaturity, 0) < 0.25) {
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
        result = uplant.kPartTypePhytomer
        return result
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = uclasses.kPdInternode
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        PdPlantPart.prototype.streamDataWithFiler.call(this, filer, cvir)
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
        this.streamPlantPart(filer, upart.PdPlantPart(this.leftLeaf))
        this.streamPlantPart(filer, upart.PdPlantPart(this.rightLeaf))
    }
    
    streamPlantPart(filer: PdFiler, plantPart: PdPlantPart): void {
        raise "method streamPlantPart had assigned to var parameter plantPart not added to return -- fixup manually"
        let partType: short
        
        if (filer.isWriting()) {
            if (plantPart === null) {
                partType = uplant.kPartTypeNone
            } else {
                partType = plantPart.partType()
            }
            partType = filer.streamSmallint(partType)
            switch (partType) {
                case uplant.kPartTypeMeristem:
                    plantPart.streamUsingFiler(filer)
                    break
                case uplant.kPartTypeInflorescence:
                    plantPart.streamUsingFiler(filer)
                    break
                case uplant.kPartTypeLeaf:
                    plantPart.streamUsingFiler(filer)
                    break
        } else if (filer.isReading()) {
            partType = filer.streamSmallint(partType)
            switch (partType) {
                case uplant.kPartTypeNone:
                    plantPart = null
                    break
                case uplant.kPartTypeMeristem:
                    plantPart = umerist.PdMeristem().create()
                    plantPart.plant = this.plant
                    umerist.PdMeristem(plantPart).phytomerAttachedTo = this
                    plantPart.streamUsingFiler(filer)
                    break
                case uplant.kPartTypeInflorescence:
                    plantPart = uinflor.PdInflorescence().create()
                    plantPart.plant = this.plant
                    uinflor.PdInflorescence(plantPart).phytomerAttachedTo = this
                    plantPart.streamUsingFiler(filer)
                    break
                case uplant.kPartTypePhytomer:
                    plantPart = PdInternode().create()
                    plantPart.plant = this.plant
                    PdInternode(plantPart).phytomerAttachedTo = this
                    //will be streamed in by traverser
                    break
                case uplant.kPartTypeLeaf:
                    plantPart = uleaf.PdLeaf().create()
                    plantPart.plant = this.plant
                    plantPart.streamUsingFiler(filer)
                    // PDF PORT inserted semicolon
                    break
                default:
                    GeneralException.create("PdInternode: unknown plant part type " + IntToStr(partType))
                    break
        }
    }
    
}

