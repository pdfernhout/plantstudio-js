// PdInflorescence was unit uinflor

import { short, float, int, intround, arrayRemove, IntToStr } from "./common";
import { PdPlantPart, kDontTaper, kDontUseAmendment, kUseAmendment } from "./PdPlantPart";
import { PdInternode } from "./PdInternode";
import { PdPlantDrawingAmendment } from "./PdPlantDrawingAmendment";
import { PdPlant, Gender, PartType } from "./PdPlant";
import { safedivExcept, min, pointsAreCloseEnough, intMin } from "./umath";
import { messageForExceptionType } from "./usupport";
import { PdTraverser, Activity, linearGrowthResult, Statistics } from "./PdTraverser";
import { PdFlowerFruit } from "./PdFlowerFruit";
import { KfTurtle } from "./KfTurtle";
import { TRect } from "./TRect";
import { NestingType, ExportPart } from "./U3dexport";
import { PdClassAndVersionInformationRecord, PdFiler, TListCollection_streamUsingFiler, DebugPrint } from "./temporary";
import { ClassId } from "./uclasses";
import { domain } from "./PdDomain";

export class PdInflorescence extends PdPlantPart {
    flowers: PdFlowerFruit[] = []
    numFlowers: short = 0
    numFlowersEachDay: short = 0
    daysBetweenFlowerAppearances: short = 0
    daysSinceLastFlowerAppeared: short = 0
    daysSinceStartedMakingFlowers: short = 0
    isApical: boolean = false
    meristemThatCreatedMe: PdPlantPart | null = null
    phytomerAttachedTo: PdInternode
    fractionOfOptimalSizeWhenCreated: float = 0.0
    
    getName(): string {
        let result = ""
        result = "inflorescence"
        return result
    }
    
    determineAmendmentAndAlsoForChildrenIfAny(): void {
        let amendmentToPass: PdPlantDrawingAmendment | null
        
        super.determineAmendmentAndAlsoForChildrenIfAny()
        if (this.amendment !== null) {
            amendmentToPass = this.amendment
        } else {
            amendmentToPass = this.parentAmendment
        }
        if (this.flowers.length > 0) {
            for (let i = 0; i < this.flowers.length; i++) {
                this.flowers[i].parentAmendment = amendmentToPass
            }
        }
    }
    
    initializeGenderApicalOrAxillary(aPlant: PdPlant, aGender: int, initAsApical: boolean, fractionOfOptimalSize: float): void {
        let daysToAllFlowers: float
        
        try {
            this.initialize(aPlant)
            this.gender = aGender
            this.isApical = initAsApical
            this.daysSinceLastFlowerAppeared = 0
            this.daysSinceStartedMakingFlowers = 0
            this.fractionOfOptimalSizeWhenCreated = min(1.0, fractionOfOptimalSize)
            //The inflorescence must know whether it produces flowers slowly (over a greater number of days than flowers)
            //  or produces many flowers in a few days.
            daysToAllFlowers = this.plant.pInflor[this.gender].daysToAllFlowersCreated
            this.numFlowers = this.plant.pInflor[this.gender].numFlowersOnMainBranch + this.plant.pInflor[this.gender].numFlowersPerBranch * this.plant.pInflor[this.gender].numBranches
            this.daysBetweenFlowerAppearances = 0
            this.numFlowersEachDay = 0
            if (this.numFlowers > 0) {
                if (this.numFlowers === 1) {
                    this.numFlowersEachDay = 1
                } else if (this.numFlowers === daysToAllFlowers) {
                    this.numFlowersEachDay = 1
                } else if (this.numFlowers > daysToAllFlowers) {
                    this.numFlowersEachDay = intround(safedivExcept(1.0 * this.numFlowers, 1.0 * daysToAllFlowers, 0))
                } else {
                    this.daysBetweenFlowerAppearances = intround(safedivExcept(1.0 * daysToAllFlowers, 1.0 * this.numFlowers, 0))
                }
            }
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.InitializeGenderApicalOrAxillary")
        }
    }
    
    optimalInitialBiomass_pctMPB(drawingPlant: PdPlant, gender: int): float {
        let result = 0.0
        if ((gender < 0) || (gender > 1)) {
            result = 0.0
        } else {
            result = drawingPlant.pInflor[gender].optimalBiomass_pctMPB * drawingPlant.pInflor[gender].minFractionOfOptimalBiomassToCreateInflorescence_frn
        }
        return result
    }
    
    nextDay(): void {
        let i: int
        let numFlowersToCreateToday: int
        let biomassToMakeFlowers_pctMPB: float
        
        try {
            super.nextDay()
            if (this.flowers.length > 0) {
                for (i = 0; i < this.flowers.length; i++) {
                    this.flowers[i].nextDay()
                }
            }
            //if self.age < plant.pInflor[gender].maxDaysToGrow then
            biomassToMakeFlowers_pctMPB = this.plant.pInflor[this.gender].minFractionOfOptimalBiomassToMakeFlowers_frn * this.plant.pInflor[this.gender].optimalBiomass_pctMPB
            if (this.liveBiomass_pctMPB >= biomassToMakeFlowers_pctMPB) {
                this.daysSinceStartedMakingFlowers += 1
                if ((this.flowers.length <= 0) && (this.numFlowers > 0)) {
                    // make first flower on first day
                    this.createFlower()
                } else if ((this.flowers.length < this.numFlowers)) {
                    if ((this.daysBetweenFlowerAppearances > 0)) {
                        if ((this.daysSinceLastFlowerAppeared >= this.daysBetweenFlowerAppearances)) {
                            this.createFlower()
                            this.daysSinceLastFlowerAppeared = 0
                        } else {
                            this.daysSinceLastFlowerAppeared += 1
                        }
                    } else {
                        numFlowersToCreateToday = intMin(this.numFlowersEachDay, this.numFlowers - this.flowers.length)
                        if (numFlowersToCreateToday > 0) {
                            for (i = 0; i < numFlowersToCreateToday; i++) {
                                this.createFlower()
                            }
                        }
                        this.daysSinceLastFlowerAppeared = 0
                    }
                }
            }
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.nextDay")
        }
    }
    
    traverseActivity(mode: int, traverser: PdTraverser): void {
        let newBiomass_pctMPB: float
        let biomassToRemove_pctMPB: float
        let i: int
        let numLines: int
        
        super.traverseActivity(mode, traverser)
        if (traverser === null) {
            return
        }
        if (this.hasFallenOff && (mode !== Activity.kActivityStream) && (mode !== Activity.kActivityFree)) {
            return
        }
        try {
            if ((mode !== Activity.kActivityDraw)) {
                if (this.flowers.length > 0) {
                    for (i = 0; i < this.flowers.length; i++) {
                        this.flowers[i].traverseActivity(mode, traverser)
                    }
                }
            }
            switch (mode) {
                case Activity.kActivityNone:
                    break
                case Activity.kActivityNextDay:
                    this.nextDay()
                    break
                case Activity.kActivityDemandVegetative:
                    break
                case Activity.kActivityDemandReproductive:
                    if ((this.age > this.plant.pInflor[this.gender].maxDaysToGrow)) {
                        // no vegetative demand 
                        this.biomassDemand_pctMPB = 0.0
                        return
                    }
                    try {
                        this.biomassDemand_pctMPB = linearGrowthResult(this.liveBiomass_pctMPB, this.plant.pInflor[this.gender].optimalBiomass_pctMPB, this.plant.pInflor[this.gender].minDaysToGrow)
                        traverser.total = traverser.total + this.biomassDemand_pctMPB
                    } catch (e) {
                        messageForExceptionType(e, "PdInflorescence.traverseActivity (reproductive demand)")
                    }
                    break
                case Activity.kActivityGrowVegetative:
                    break
                case Activity.kActivityGrowReproductive:
                    if (this.age > this.plant.pInflor[this.gender].maxDaysToGrow) {
                        // no vegetative growth 
                        return
                    }
                    newBiomass_pctMPB = this.biomassDemand_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB + newBiomass_pctMPB
                    break
                case Activity.kActivityStartReproduction:
                    break
                case Activity.kActivityFindPlantPartAtPosition:
                    if (pointsAreCloseEnough(traverser.point, this.position())) {
                        // cannot switch 
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
                    break
                case Activity.kActivityFree:
                    break
                case Activity.kActivityVegetativeBiomassThatCanBeRemoved:
                    break
                case Activity.kActivityRemoveVegetativeBiomass:
                    break
                case Activity.kActivityReproductiveBiomassThatCanBeRemoved:
                    //streaming called by phytomer
                    // free called by phytomer 
                    // none 
                    // none 
                    traverser.total = traverser.total + this.liveBiomass_pctMPB
                    break
                case Activity.kActivityRemoveReproductiveBiomass:
                    biomassToRemove_pctMPB = this.liveBiomass_pctMPB * traverser.fractionOfPotentialBiomass
                    this.liveBiomass_pctMPB = this.liveBiomass_pctMPB - biomassToRemove_pctMPB
                    this.deadBiomass_pctMPB = this.deadBiomass_pctMPB + biomassToRemove_pctMPB
                    break
                case Activity.kActivityGatherStatistics:
                    if (this.gender === Gender.kGenderMale) {
                        this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeMaleInflorescence)
                    } else {
                        this.addToStatistics(traverser.statistics, Statistics.kStatisticsPartTypeFemaleInflorescence)
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
                    this.biomassOfMeAndAllPartsAboveMe_pctMPB = this.biomassOfMeAndAllPartsConnectedToMe_pctMPB()
                    break
                case Activity.kActivityCountPointsAndTrianglesFor3DExport:
                    this.countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser)
                    break
                default:
                    throw new Error("Problem: Unhandled mode in method PdInflorescence.traverseActivity.")
            }
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.traverseActivity")
        }
    }
    
    countPointsAndTrianglesFor3DExportAndAddToTraverserTotals(traverser: PdTraverser): void {
        let numLines: int
        
        if (traverser === null) {
            return
        }
        if (this.plant.pInflor[this.gender].bractTdoParams.scaleAtFullSize > 0) {
            // bracts
            traverser.total3DExportPointsIn3DObjects += this.plant.pInflor[this.gender].bractTdoParams.object3D.pointsInUse * this.plant.pInflor[this.gender].bractTdoParams.repetitions
            traverser.total3DExportTrianglesIn3DObjects += this.plant.pInflor[this.gender].bractTdoParams.object3D.triangles.length * this.plant.pInflor[this.gender].bractTdoParams.repetitions
            this.addExportMaterial(traverser, ExportPart.kExportPartInflorescenceBractFemale, ExportPart.kExportPartInflorescenceBractMale)
        }
        // pedicels and inflorescence internodes
        numLines = this.plant.pInflor[this.gender].numBranches
        if (!this.plant.pInflor[this.gender].branchesAreAlternate) {
            numLines = numLines * 2
        }
        if (this.plant.pInflor[this.gender].internodeLength_mm > 0) {
            this.addExportMaterial(traverser, ExportPart.kExportPartInflorescenceInternodeFemale, ExportPart.kExportPartInflorescenceInternodeMale)
        }
        // peduncle
        numLines += 1
        traverser.total3DExportStemSegments += numLines
        if (this.plant.pInflor[this.gender].peduncleLength_mm > 0) {
            this.addExportMaterial(traverser, ExportPart.kExportPartInflorescenceStalkFemale, ExportPart.kExportPartInflorescenceStalkMale)
        }
    }
    
    report(): void {
        super.report()
        DebugPrint(IntToStr(this.numFlowers) + " flowers")
        // note flowers will print first 
        // debugPrint('inflorescence, age '  + IntToStr(age));
        //DebugForm.printNested(plant.turtle.stackSize, 'inflorescence, age '  + IntToStr(age));
    }
    
    biomassOfMeAndAllPartsConnectedToMe_pctMPB(): float {
        let result = 0.0
        let i: int
        
        result = this.totalBiomass_pctMPB()
        if (this.flowers.length > 0) {
            for (i = 0; i < this.flowers.length; i++) {
                result = result + this.flowers[i].totalBiomass_pctMPB()
            }
        }
        return result
    }
    
    allFlowersHaveBeenDrawn(): boolean {
        let result = false
        let i: int
        
        result = true
        if (this.flowers.length > 0) {
            for (i = 0; i < this.flowers.length; i++) {
                if (!this.flowers[i].hasBeenDrawn) {
                    result = false
                    return result
                }
            }
        }
        return result
    }
    
    addDependentPartsToList(aList: PdPlantPart[]): void {
        if (this.flowers.length > 0) {
            for (let i = 0; i < this.flowers.length; i++) {
                aList.push(this.flowers[i])
            }
        }
    }
    
    createFlower(): void {
        let aFlowerFruit: PdFlowerFruit
        
        if (this.plant.partsCreated > domain.options.maxPartsPerPlant_thousands * 1000) {
            // create new flower/fruit object 
            // v1.6b1
            return
        }
        aFlowerFruit = new PdFlowerFruit()
        aFlowerFruit.initializeGender(this.plant, this.gender)
        this.flowers.push(aFlowerFruit)
    }
    
    deleteFlower(theFlower: PdFlowerFruit): void {
        // remove flower object from list 
        arrayRemove(this.flowers, theFlower)
    }
    
    draw(): void {        
        if (!this.shouldDraw()) {
            return
        }
        if (!this.plant.turtle) return
        const turtle: KfTurtle = this.plant.turtle
        this.boundsRect = new TRect(0, 0, 0, 0)
        turtle.push()
        if (this.hiddenByAmendment()) {
            // amendment rotation handled in drawStemSegment for peduncle
            turtle.pop()
            return
        }
        try {
            if (this.flowers.length > 0) {
                for (let i = 0; i < this.flowers.length; i++) {
                    this.flowers[i].hasBeenDrawn = false
                }
            }
            this.calculateColors()
            turtle.ifExporting_startNestedGroupOfPlantParts(this.genderString() + " inflorescence", this.genderString() + "Inflor", NestingType.kNestingTypeInflorescence)
            if ((this.flowers.length > 0)) {
                this.drawBracts()
                this.drawPeduncle()
                if ((this.plant.pInflor[this.gender].isHead)) {
                    this.drawHead()
                } else {
                    this.drawApex(this.plant.pInflor[this.gender].numFlowersOnMainBranch, 0, true)
                }
            }
            turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeInflorescence)
            turtle.pop()
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.draw")
        }
    }
    
    shouldDraw(): boolean {
        let result = false
        let flowerFruit: PdFlowerFruit
        
        // if inflorescence has at least one flower or non-fallen fruit, should draw 
        result = true
        if (this.flowers.length > 0) {
            for (let i = 0; i < this.flowers.length; i++) {
                flowerFruit = this.flowers[i]
                if (flowerFruit === null) {
                    continue
                }
                if (!flowerFruit.hasFallenOff) {
                    return result
                }
            }
        }
        result = false
        return result
    }
    
    drawApex(internodeCount: int, flowerIndexOffset: int, mainBranch: boolean): void {  
        //Draw inflorescence in raceme, panicle, or umbel form. This method uses the recursive algorithm
        //     we first developed to draw the entire plant.
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        let branchesDrawn = 0
        let i = 0
        if (internodeCount > 0) {
            if (mainBranch) {
                // draw the flowers on the main stem first, because if any are not going to be drawn for
                // want of available flowers, the branches should lose them.
                turtle.push()
            }
            if (mainBranch) {
                while (branchesDrawn < this.plant.pInflor[this.gender].numBranches) {
                    this.drawInternode(i)
                    branchesDrawn += 1
                }
            }
            // draw flowers on main stem first
            i = internodeCount
            while (i >= 1) {
                if (this.plant.pInflor[this.gender].flowersSpiralOnStem) {
                    //param
                    turtle.rotateX(98)
                }
                this.drawInternode(i)
                turtle.push()
                this.drawFlower(flowerIndexOffset + i)
                turtle.pop()
                i -= 1
            }
            if (mainBranch) {
                turtle.pop()
            }
        }
        branchesDrawn = 0
        if (mainBranch) {
            while (branchesDrawn < this.plant.pInflor[this.gender].numBranches) {
                if (this.plant.pInflor[this.gender].flowersSpiralOnStem) {
                    // draw branches
                    //param
                    turtle.rotateX(98)
                }
                this.drawInternode(i)
                this.drawAxillaryBud(this.plant.pInflor[this.gender].numFlowersPerBranch, this.plant.pInflor[this.gender].numFlowersOnMainBranch + branchesDrawn * this.plant.pInflor[this.gender].numFlowersPerBranch)
                branchesDrawn += 1
                if ((!this.plant.pInflor[this.gender].branchesAreAlternate) && (branchesDrawn < this.plant.pInflor[this.gender].numBranches)) {
                    turtle.push()
                    turtle.rotateX(128)
                    this.drawAxillaryBud(this.plant.pInflor[this.gender].numFlowersPerBranch, this.plant.pInflor[this.gender].numFlowersOnMainBranch + branchesDrawn * this.plant.pInflor[this.gender].numFlowersPerBranch)
                    branchesDrawn += 1
                    turtle.pop()
                }
            }
        }
    }
    
    drawBracts(): void {
        let scale: float
        let length: float
        let width: float
        let angle: float
        let propFullSize: float
        let i: short
        let turnPortion: int
        let leftOverDegrees: int
        let addThisTime: int
        let addition: float
        let carryOver: float
        
        if (this.plant.pInflor[this.gender].bractTdoParams.scaleAtFullSize <= 0) {
            return
        }
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        turtle.push()
        turtle.ifExporting_startNestedGroupOfPlantParts(this.longNameForDXFPartConsideringGenderEtc(ExportPart.kExportPartInflorescenceBractFemale), this.shortNameForDXFPartConsideringGenderEtc(ExportPart.kExportPartInflorescenceBractFemale), NestingType.kNestingTypeInflorescence)
        propFullSize = safedivExcept(this.liveBiomass_pctMPB, this.plant.pInflor[this.gender].optimalBiomass_pctMPB, 0)
        scale = ((this.plant.pInflor[this.gender].bractTdoParams.scaleAtFullSize / 100.0) * propFullSize)
        turtle.rotateX(this.angleWithSway(this.plant.pInflor[this.gender].bractTdoParams.xRotationBeforeDraw))
        turtle.rotateY(this.angleWithSway(this.plant.pInflor[this.gender].bractTdoParams.yRotationBeforeDraw))
        turtle.rotateZ(this.angleWithSway(this.plant.pInflor[this.gender].bractTdoParams.zRotationBeforeDraw))
        if ((this.plant.pInflor[this.gender].bractTdoParams.radiallyArranged) && (this.plant.pInflor[this.gender].bractTdoParams.repetitions > 0)) {
            turnPortion = 256 / this.plant.pInflor[this.gender].bractTdoParams.repetitions
            leftOverDegrees = 256 - turnPortion * this.plant.pInflor[this.gender].bractTdoParams.repetitions
            if (leftOverDegrees > 0) {
                addition = safedivExcept(leftOverDegrees, this.plant.pInflor[this.gender].bractTdoParams.repetitions, 0)
            } else {
                addition = 0
            }
            carryOver = 0
            for (i = 0; i < this.plant.pInflor[this.gender].bractTdoParams.repetitions; i++) {
                turtle.push()
                //aligns object as stored in the file to way should draw on plant
                turtle.rotateY(-64)
                // why? i don't know.
                turtle.rotateX(64)
                turtle.rotateX(this.plant.pInflor[this.gender].bractTdoParams.pullBackAngle)
                this.draw3DObject(this.plant.pInflor[this.gender].bractTdoParams.object3D, scale, this.plant.pInflor[this.gender].bractTdoParams.faceColor, this.plant.pInflor[this.gender].bractTdoParams.backfaceColor, ExportPart.kExportPartInflorescenceBractFemale)
                turtle.pop()
                addThisTime = Math.trunc(addition + carryOver)
                carryOver = carryOver + addition - addThisTime
                if (carryOver < 0) {
                    carryOver = 0
                }
                turtle.rotateX(turnPortion + addThisTime)
            }
        } else {
            turtle.push()
            //aligns object as stored in the file to way should draw on plant
            turtle.rotateY(-64)
            // why? i don't know.
            turtle.rotateX(64)
            turtle.rotateX(this.plant.pInflor[this.gender].bractTdoParams.pullBackAngle)
            this.draw3DObject(this.plant.pInflor[this.gender].bractTdoParams.object3D, scale, this.plant.pInflor[this.gender].bractTdoParams.faceColor, this.plant.pInflor[this.gender].bractTdoParams.backfaceColor, ExportPart.kExportPartInflorescenceBractFemale)
            turtle.pop()
        }
        turtle.pop()
        turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypeInflorescence)
    }
    
    drawPeduncle(): void {
        let length: float
        let width: float
        let zAngle: float
        let propFullSize: float

        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        
        try {
            //Draw peduncle, which is the primary inflorescence stalk. If the inflorescence has only one flower,
            //     this is the only part drawn. If the inflorescence is apical, the stalk may be longer (e.g. in bolting
            //     plants) and is specified by a different parameter.
            zAngle = 0
            if ((this.phytomerAttachedTo !== null)) {
                if ((this.phytomerAttachedTo.leftBranchPlantPart === this)) {
                    zAngle = this.plant.pInflor[this.gender].peduncleAngleFromVegetativeStem
                } else if ((this.phytomerAttachedTo.rightBranchPlantPart === this)) {
                    zAngle = this.plant.pInflor[this.gender].peduncleAngleFromVegetativeStem
                    turtle.rotateX(128)
                } else if (this.isApical) {
                    zAngle = this.plant.pInflor[this.gender].apicalStalkAngleFromVegetativeStem
                }
            }
            propFullSize = safedivExcept(this.liveBiomass_pctMPB, this.plant.pInflor[this.gender].optimalBiomass_pctMPB, 0)
            if (this.isApical) {
                length = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].terminalStalkLength_mm, propFullSize)
            } else {
                length = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].peduncleLength_mm, propFullSize)
            }
            width = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].internodeWidth_mm, propFullSize)
            //Use no angle here because phytomer makes the rotation before the inflorescence is drawn.
            this.drawStemSegment(length, width, zAngle, 0, this.plant.pInflor[this.gender].stalkColor, kDontTaper, ExportPart.kExportPartInflorescenceStalkFemale, kUseAmendment)
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.drawPeduncle")
        }
    }
    
    drawAxillaryBud(internodeCount: int, flowerIndexOffset: int): void {
        //This message is sent when the inflorescence is branched. The decision to create a branch is
        //     made before the message is sent. Note the check if all flowers have been drawn; this prevents
        //     scrawly lines with no flowers.
        if ((this.plant.turtle === null)) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        if ((this.allFlowersHaveBeenDrawn())) {
            return
        }
        const angle = this.angleWithSway(this.plant.pInflor[this.gender].branchAngle)
        turtle.push()
        turtle.rotateZ(angle)
        this.drawApex(internodeCount, flowerIndexOffset, false)
        turtle.pop()
    }
    
    drawFlower(internodeCount: int): void {
        let length: float
        let width: float
        let angle: float
        let propFullSize: float
        let flowerIndex: int

        if ((this.plant.turtle === null)) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        
        try {
            if ((this.allFlowersHaveBeenDrawn())) {
                //Draw one flower, remembering that internodeCount goes from flowers size down to 1,
                //  but flowers are in the order formed.
                //  If the oldest flowers on the inflorescence are at the bottom (acropetal),
                //  draw the flowers in reverse order from internodeCount (which is in the order they were formed).
                //  If the oldest flowers on the inflorescence are at the top (basipetal),
                //  draw the flowers in the order presented by internodeCount
                //     which is in reverse order to how they were formed).
                //  In most plants the older flowers are lower.
                return
            }
            propFullSize = safedivExcept(this.liveBiomass_pctMPB, this.plant.pInflor[this.gender].optimalBiomass_pctMPB, 0)
            length = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].pedicelLength_mm, propFullSize)
            width = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].internodeWidth_mm, propFullSize)
            angle = this.angleWithSway(this.plant.pInflor[this.gender].pedicelAngle)
            if ((this.plant.pInflor[this.gender].flowersDrawTopToBottom)) {
                flowerIndex = internodeCount
            } else {
                flowerIndex = this.flowers.length - internodeCount + 1
            }
            turtle.ifExporting_startNestedGroupOfPlantParts(this.genderString() + " pedicel and flower/fruit", this.genderString() + "PedicelFlower", NestingType.kNestingTypePedicelAndFlowerFruit)
            this.drawStemSegment(length, width, angle, 0, this.plant.pInflor[this.gender].pedicelColor, this.plant.pInflor[this.gender].pedicelTaperIndex, ExportPart.kExportPartPedicelFemale, kDontUseAmendment)
            if ((flowerIndex > 0) && (flowerIndex - 1 < this.flowers.length)) {
                this.flowers[flowerIndex - 1].draw()
            }
            this.plant.turtle.ifExporting_endNestedGroupOfPlantParts(NestingType.kNestingTypePedicelAndFlowerFruit)
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.drawFlower")
        }
    }
    
    drawHead(): void {
        let i: int
        let turnPortion: int
        let leftOverDegrees: int
        let addThisTime: int
        let addition: float
        let carryOver: float
        
        // v1.4
        // v1.4
        //Draw the inflorescences in a radial pattern; this is for a head such as a sunflower.
        if (this.plant.turtle === null) {
            return
        }
        const turtle: KfTurtle = this.plant.turtle
        turtle.rotateY(64)
        turtle.rotateZ(64)
        // give a little angle down to make it look more natural 
        turtle.rotateY(32)
        if (this.flowers.length > 0) {
            // new v1.4
            turnPortion = 256 / this.flowers.length
            leftOverDegrees = 256 - turnPortion * this.flowers.length
            if (leftOverDegrees > 0) {
                addition = safedivExcept(leftOverDegrees, this.flowers.length, 0)
            } else {
                addition = 0
            }
            carryOver = 0
            for (i = this.flowers.length - 1; i >= 0; i--) {
                addThisTime = Math.trunc(addition + carryOver)
                carryOver = carryOver + addition - addThisTime
                if (carryOver < 0) {
                    carryOver = 0
                }
                // was 256 / flowers.count
                turtle.rotateZ(turnPortion + addThisTime)
                turtle.push()
                // v1.4 added one, was bug, was not drawing first flower
                this.drawFlower(i + 1)
                turtle.pop()
            }
        }
    }
    
    drawInternode(internodeCount: int): void {
        let length: float
        let width: float
        let zAngle: float
        let yAngle: float
        let propFullSize: float
        
        try {
            if ((this.allFlowersHaveBeenDrawn())) {
                //Draw the inflorescence internode, which is the portion of inflorescence stem between where successive
                //  flower pedicels come off. Note that this is not drawn if all flowers have been drawn; this prevents
                //  straggly lines in branched inflorescences.
                return
            }
            if ((this.plant.pInflor[this.gender].internodeLength_mm === 0.0)) {
                return
            }
            propFullSize = safedivExcept(this.liveBiomass_pctMPB, this.plant.pInflor[this.gender].optimalBiomass_pctMPB, 0)
            length = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].internodeLength_mm, propFullSize)
            width = this.lengthOrWidthAtAgeForFraction(this.plant.pInflor[this.gender].internodeWidth_mm, propFullSize)
            zAngle = this.angleWithSway(this.plant.pInflor[this.gender].angleBetweenInternodes)
            yAngle = this.angleWithSway(0)
            this.drawStemSegment(length, width, zAngle, yAngle, this.plant.pInflor[this.gender].stalkColor, kDontTaper, ExportPart.kExportPartInflorescenceInternodeFemale, kDontUseAmendment)
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.drawInternode")
        }
    }
    
    lengthOrWidthAtAgeForFraction(starting: float, fraction: float): float {
        let result = 0.0
        let ageBounded: float
        
        result = 0.0
        try {
            ageBounded = min(this.plant.pInflor[this.gender].daysToAllFlowersCreated, this.daysSinceStartedMakingFlowers)
            if (this.plant.pInflor[this.gender].daysToAllFlowersCreated !== 0) {
                result = safedivExcept(starting * ageBounded, this.plant.pInflor[this.gender].daysToAllFlowersCreated, 0) * fraction
            } else {
                result = starting * ageBounded * fraction
            }
        } catch (e) {
            messageForExceptionType(e, "PdInflorescence.lengthOrWidthAtAgeForFraction")
        }
        return result
    }
    
    flower(index: int): PdFlowerFruit {
        return this.flowers[index]
    }
    
    partType(): int {
        return PartType.kPartTypeInflorescence
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdInflorescence
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        this.daysSinceStartedMakingFlowers = filer.streamSmallint(this.daysSinceStartedMakingFlowers)
        this.numFlowersEachDay = filer.streamSmallint(this.numFlowersEachDay)
        this.numFlowers = filer.streamSmallint(this.numFlowers)
        this.daysBetweenFlowerAppearances = filer.streamSmallint(this.daysBetweenFlowerAppearances)
        this.daysSinceLastFlowerAppeared = filer.streamSmallint(this.daysSinceLastFlowerAppeared)
        this.isApical = filer.streamBoolean(this.isApical)
        this.fractionOfOptimalSizeWhenCreated = filer.streamSingle(this.fractionOfOptimalSizeWhenCreated)
        if (filer.isReading()) {
            this.meristemThatCreatedMe = null
        }
        TListCollection_streamUsingFiler(this.flowers, filer, () => new PdFlowerFruit())
        if (filer.isReading() && (this.flowers.length > 0)) {
            for (let i = 0; i < this.flowers.length; i++) {
                // fix up plant in flowers if needed 
                this.flowers[i].plant = this.plant
            }
        }
    }
    
}

//The inflorescence is very simple; it creates a specified number of flowers over a specified period
//  of days. Each inflorescence on the plant has the same number of flowers. Since an inflorescence is
//  created by a meristem which accumulates biomass, nothing stands in the way of the inflorescence
//  producing the flowers according to schedule.
//  This method must act differently for inflorescences that produce flowers slowly (over a greater
//  number of days than flowers) than for those that produce many flowers in a few days.
//  The inflorescence can create no flowers until it reaches a specified fraction of its optimal biomass.
//Survey flowers and return true if all flowers have been drawn (they know), false if any have not been
//   drawn. This is mostly so a branched inflorescence can know if there are any flowers left to place
//   on its branched structure.
