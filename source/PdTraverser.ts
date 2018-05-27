// unit Utravers

from conversion_common import *
import ubreedr
import utimeser
import umain
import uintern
import udebug
import umath
import usupport
import u3dexport
import ufiler
import upart
import uplant
import delphi_compatability

// const
const kTraverseNone = 0
const kTraverseLeft = 1
const kTraverseRight = 2
const kTraverseNext = 3
const kTraverseDone = 4
const kActivityNone = 0
const kActivityNextDay = 1
const kActivityDemandVegetative = 2
const kActivityDemandReproductive = 3
const kActivityGrowVegetative = 4
const kActivityGrowReproductive = 5
const kActivityStartReproduction = 6
const kActivityFindPlantPartAtPosition = 7
const kActivityDraw = 8
const kActivityReport = 9
const kActivityStream = 10
const kActivityFree = 11
const kActivityVegetativeBiomassThatCanBeRemoved = 12
const kActivityRemoveVegetativeBiomass = 13
const kActivityReproductiveBiomassThatCanBeRemoved = 14
const kActivityRemoveReproductiveBiomass = 15
const kActivityGatherStatistics = 16
const kActivityStandingDeadBiomassThatCanBeRemoved = 17
const kActivityRemoveStandingDeadBiomass = 18
const kActivityCountPlantParts = 19
const kActivityFindPartForPartID = 20
const kActivityCountTotalMemoryUse = 21
const kActivityCalculateBiomassForGravity = 22
const kActivityCountPointsAndTrianglesFor3DExport = 23


// const
const kStatisticsPartTypeSeedlingLeaf = 0
const kStatisticsPartTypeLeaf = 1
const kStatisticsPartTypeFemaleInflorescence = 2
const kStatisticsPartTypeMaleInflorescence = 3
const kStatisticsPartTypeFemaleFlower = 4
const kStatisticsPartTypeFemaleFlowerBud = 5
const kStatisticsPartTypeMaleFlower = 6
const kStatisticsPartTypeMaleFlowerBud = 7
const kStatisticsPartTypeAxillaryBud = 8
const kStatisticsPartTypeFruit = 9
const kStatisticsPartTypeStem = 10
const kStatisticsPartTypeUnripeFruit = 11
const kStatisticsPartTypeFallenFruit = 12
const kStatisticsPartTypeUnallocatedNewVegetativeBiomass = 13
const kStatisticsPartTypeUnremovedDeadVegetativeBiomass = 14
const kStatisticsPartTypeUnallocatedNewReproductiveBiomass = 15
const kStatisticsPartTypeUnremovedDeadReproductiveBiomass = 16
const kStatisticsPartTypeFallenFlower = 17
const kStatisticsPartTypeAllVegetative = 18
const kStatisticsPartTypeAllReproductive = 19
const kStatisticsPartTypeLast = 19


// var
let cancelDrawing: boolean
let worstNStressColor: TColorRef
let worstPStressColor: TColorRef
let worstDeadColor: TColorRef


// -------------------------------------------------------------------------- linear growth functions 
function linearGrowthWithFactorResult(current: float, optimal: float, minDays: int, growthFactor: float): float {
    let result = 0.0
    let amountNeeded: float
    let maxPossible: float
    
    result = 0.0
    try {
        amountNeeded = optimal - current
        maxPossible = umath.safedivExcept(optimal, minDays, optimal)
        amountNeeded = umath.max(0.0, umath.min(amountNeeded, maxPossible))
        result = amountNeeded * growthFactor
    } catch (Exception e) {
        usupport.messageForExceptionType(e, "linearGrowthWithFactorResult")
    }
    return result
}

function linearGrowthWithFactor(current: float, optimal: float, minDays: int, growthFactor: float): void {
    let amountNeeded: float
    let maxPossible: float
    
    try {
        amountNeeded = optimal - current
        maxPossible = umath.safedivExcept(optimal, minDays, optimal)
        amountNeeded = umath.max(0.0, umath.min(amountNeeded, maxPossible))
        current = current + amountNeeded * growthFactor
    } catch (Exception e) {
        usupport.messageForExceptionType(e, "linearGrowthWithFactor")
    }
    return current
}

function linearGrowthResult(current: float, optimal: float, minDays: int): float {
    let result = 0.0
    let amountNeeded: float
    let maxPossible: float
    
    result = 0.0
    try {
        amountNeeded = optimal - current
        maxPossible = umath.safedivExcept(optimal, minDays, optimal)
        amountNeeded = umath.max(0.0, umath.min(amountNeeded, maxPossible))
        result = amountNeeded
    } catch (Exception e) {
        usupport.messageForExceptionType(e, "linearGrowthResult")
    }
    return result
}

function linearGrowth(current: float, optimal: float, minDays: int): void {
    let amountNeeded: float
    let maxPossible: float
    
    try {
        amountNeeded = optimal - current
        maxPossible = umath.safedivExcept(optimal, minDays, optimal)
        amountNeeded = umath.max(0.0, umath.min(amountNeeded, maxPossible))
        current = current + amountNeeded
    } catch (Exception e) {
        usupport.messageForExceptionType(e, "linearGrowth")
    }
    return current
}


// meristems
export class PdPlantStatistics {
    count: long[] /* kStatisticsPartTypeLast + 1 */ = Array(kStatisticsPartTypeLast + 1)
    liveBiomass_pctMPB: float[] /* kStatisticsPartTypeLast + 1 */ = Array(kStatisticsPartTypeLast + 1)
    deadBiomass_pctMPB: float[] /* kStatisticsPartTypeLast + 1 */ = Array(kStatisticsPartTypeLast + 1)
    
    // ---------------------------------------------------------------------------------- statistics object 
    zeroAllFields(): void {
        let i: short
        
        for (i = 0; i <= kStatisticsPartTypeLast; i++) {
            this.count[i] = 0
            this.liveBiomass_pctMPB[i] = 0.0
            this.deadBiomass_pctMPB[i] = 0.0
        }
    }
    
    totalBiomass_pctMPB(): float {
        let result = 0.0
        let i: short
        
        result = 0.0
        for (i = 0; i <= kStatisticsPartTypeLast; i++) {
            result = result + this.liveBiomass_pctMPB[i]
            result = result + this.deadBiomass_pctMPB[i]
        }
        return result
    }
    
}

export class PdTraverser {
    plant: PdPlant = new PdPlant()
    filer: PdFiler = new PdFiler()
    currentPhytomer: TObject = new TObject()
    point: TPoint = new TPoint()
    total: float = 0.0
    fractionOfPotentialBiomass: float = 0.0
    ageOfYoungestPhytomer: long = 0
    mode: short = 0
    finished: boolean = false
    foundPlantPart: PdPlantPart = new PdPlantPart()
    foundList: TList = new TList()
    statistics: PdPlantStatistics = new PdPlantStatistics()
    totalPlantParts: long = 0
    total3DExportPointsIn3DObjects: long = 0
    total3DExportTrianglesIn3DObjects: long = 0
    total3DExportStemSegments: long = 0
    showDrawingProgress: boolean = false
    plantPartsDrawnAtStart: long = 0
    partID: long = 0
    totalMemorySize: long = 0
    exportTypeCounts: long[] /* kExportPartLast + 1 */ = Array(kExportPartLast + 1)
    
    // ---------------------------------------------------------------------------------- traversing object 
    createWithPlant(thePlant: PdPlant): void {
        this.create
        this.plant = thePlant
    }
    
    beginTraversal(aMode: int): void {
        this.mode = aMode
        this.currentPhytomer = this.plant.firstPhytomer
        this.total = 0.0
        this.finished = false
        this.foundPlantPart = null
        this.totalPlantParts = 0
        if (this.currentPhytomer !== null) {
            uintern.PdInternode(this.currentPhytomer).traversingDirection = kTraverseLeft
            uintern.PdInternode(this.currentPhytomer).traverseActivity(this.mode, this)
            //reset afterwards in case read in differently
            uintern.PdInternode(this.currentPhytomer).traversingDirection = kTraverseLeft
        }
    }
    
    traverseWholePlant(aMode: int): void {
        this.beginTraversal(aMode)
        this.traversePlant(0)
    }
    
    traversePlant(traversalCount: long): void {
        let i: long
        let lastPhytomer: PdInternode
        let phytomerTraversing: PdInternode
        
        if ((this.currentPhytomer === null)) {
            return
        }
        phytomerTraversing = uintern.PdInternode(this.currentPhytomer)
        i = 0
        while (i <= traversalCount) {
            if (this.finished) {
                return
            }
            switch (phytomerTraversing.traversingDirection) {
                case kTraverseLeft:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.leftBranchPlantPart !== null) {
                        if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.push()
                        }
                        phytomerTraversing.leftBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.leftBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = uintern.PdInternode(phytomerTraversing.leftBranchPlantPart)
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseRight:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.rightBranchPlantPart !== null) {
                        if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.push()
                        }
                        phytomerTraversing.rightBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.rightBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = uintern.PdInternode(phytomerTraversing.rightBranchPlantPart)
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseNext:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.nextPlantPart !== null) {
                        if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.push()
                            this.plant.turtle.rotateX(this.plant.pGeneral.phyllotacticRotationAngle * 256 / 360)
                        }
                        phytomerTraversing.nextPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.nextPlantPart.isPhytomer())) {
                            phytomerTraversing = uintern.PdInternode(phytomerTraversing.nextPlantPart)
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseDone:
                    phytomerTraversing.traversingDirection = kTraverseNone
                    lastPhytomer = phytomerTraversing
                    phytomerTraversing = phytomerTraversing.phytomerAttachedTo
                    if ((this.mode === kActivityFree)) {
                        lastPhytomer.free
                        if (phytomerTraversing !== null) {
                            if ((phytomerTraversing.traversingDirection === kTraverseLeft + 1)) {
                                phytomerTraversing.leftBranchPlantPart = null
                            } else if ((phytomerTraversing.traversingDirection === kTraverseRight + 1)) {
                                phytomerTraversing.rightBranchPlantPart = null
                            } else if ((phytomerTraversing.traversingDirection === kTraverseNext + 1)) {
                                phytomerTraversing.nextPlantPart = null
                            }
                        }
                    }
                    if (phytomerTraversing === null) {
                        break
                    }
                    if ((this.mode === kActivityDraw)) {
                        //special drawing stuff - if returning from left or right branch draw, pop turtle
                        //	if (phytomerTraversing.traversingDirection = kTraverseLeft + 1)
                        //           or (phytomerTraversing.traversingDirection =  kTraverseRight + 1)  then 
                        this.plant.turtle.pop()
                    }
                    if ((this.mode === kActivityCalculateBiomassForGravity)) {
                        phytomerTraversing.traverseActivity(this.mode, this)
                    }
                    break
                case kTraverseNone:
                    throw new GeneralException.create("Problem: kTraverseNone encountered in method PdTraverser.traversePlant.")
                    break
            }
            if ((traversalCount !== 0)) {
                i += 1
            }
            if ((this.mode === kActivityDraw) && (this.showDrawingProgress)) {
                if (this.totalPlantParts % 4 !== 0) {
                    continue
                }
                if ((umain.MainForm !== null) && (umain.MainForm.drawing)) {
                    umain.MainForm.showDrawProgress(this.plantPartsDrawnAtStart + this.totalPlantParts)
                }
            }
        }
    }
    
}

