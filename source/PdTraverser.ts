// PdTraverser was unit Utravers

import { float, int, TColorRef, short, long } from "./common";
import { max, safedivExcept, min } from "./umath";
import { messageForExceptionType, PdFiler, MainForm, PdInternode, PdPlantPart, kExportPartLast } from "./temporary";
import { PdPlant } from "./PdPlant";
import { TPoint } from "./TPoint";

/* TODO: Remove unneeded imports
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
*/

// const
const kTraverseNone = 0
const kTraverseLeft = 1
const kTraverseRight = 2
const kTraverseNext = 3
const kTraverseDone = 4

export enum Activity {
    kActivityNone = 0,
    kActivityNextDay = 1,
    kActivityDemandVegetative = 2,
    kActivityDemandReproductive = 3,
    kActivityGrowVegetative = 4,
    kActivityGrowReproductive = 5,
    kActivityStartReproduction = 6,
    kActivityFindPlantPartAtPosition = 7,
    kActivityDraw = 8,
    kActivityReport = 9,
    kActivityStream = 10,
    kActivityFree = 11,
    kActivityVegetativeBiomassThatCanBeRemoved = 12,
    kActivityRemoveVegetativeBiomass = 13,
    kActivityReproductiveBiomassThatCanBeRemoved = 14,
    kActivityRemoveReproductiveBiomass = 15,
    kActivityGatherStatistics = 16,
    kActivityStandingDeadBiomassThatCanBeRemoved = 17,
    kActivityRemoveStandingDeadBiomass = 18,
    kActivityCountPlantParts = 19,
    kActivityFindPartForPartID = 20,
    kActivityCountTotalMemoryUse = 21,
    kActivityCalculateBiomassForGravity = 22,
    kActivityCountPointsAndTrianglesFor3DExport = 23,
}


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
        maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        result = amountNeeded * growthFactor
    } catch (e) {
        messageForExceptionType(e, "linearGrowthWithFactorResult")
    }
    return result
}

function linearGrowthWithFactor(current: float, optimal: float, minDays: int, growthFactor: float): float {
    let amountNeeded: float
    let maxPossible: float
    
    try {
        amountNeeded = optimal - current
        maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        current = current + amountNeeded * growthFactor
    } catch (e) {
        messageForExceptionType(e, "linearGrowthWithFactor")
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
        maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        result = amountNeeded
    } catch (e) {
        messageForExceptionType(e, "linearGrowthResult")
    }
    return result
}

function linearGrowth(current: float, optimal: float, minDays: int): float {
    let amountNeeded: float
    let maxPossible: float
    
    try {
        amountNeeded = optimal - current
        maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        current = current + amountNeeded
    } catch (e) {
        messageForExceptionType(e, "linearGrowth")
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
        for (let i = 0; i <= kStatisticsPartTypeLast; i++) {
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
    plant: PdPlant
    filer: PdFiler
    // TODO: currentPhytomer was TObject -- is typing as PdInternode OK here?
    currentPhytomer: PdInternode
    point: TPoint = new TPoint()
    total: float = 0.0
    fractionOfPotentialBiomass: float = 0.0
    ageOfYoungestPhytomer: long = 0
    mode: short = 0
    finished: boolean = false
    foundPlantPart: PdPlantPart | null = null
    // TODO: improve typing for foundList 
    foundList: any[] = []
    statistics: PdPlantStatistics = new PdPlantStatistics()
    totalPlantParts: long = 0
    total3DExportPointsIn3DObjects: long = 0
    total3DExportTrianglesIn3DObjects: long = 0
    total3DExportStemSegments: long = 0
    showDrawingProgress: boolean = false
    plantPartsDrawnAtStart: long = 0
    partID: long = 0
    totalMemorySize: long = 0
    exportTypeCounts: long[] = Array(kExportPartLast + 1)
    
    // ---------------------------------------------------------------------------------- traversing object 
    constructor(thePlant: PdPlant) {
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
            this.currentPhytomer.traversingDirection = kTraverseLeft
            this.currentPhytomer.traverseActivity(this.mode, this)
            //reset afterwards in case read in differently
            this.currentPhytomer.traversingDirection = kTraverseLeft
        }
    }
    
    traverseWholePlant(aMode: int): void {
        this.beginTraversal(aMode)
        this.traversePlant(0)
    }
    
    traversePlant(traversalCount: long): void {
        if ((this.currentPhytomer === null)) {
            return
        }
        if (!this.plant.turtle) {
            throw new Error("null turtle in traversePlant")
        }
        let phytomerTraversing: PdInternode = this.currentPhytomer
        let i = 0
        while (i <= traversalCount) {
            if (this.finished) {
                return
            }
            switch (phytomerTraversing.traversingDirection) {
                case kTraverseLeft:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.leftBranchPlantPart !== null) {
                        if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.push()
                        }
                        phytomerTraversing.leftBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.leftBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = phytomerTraversing.leftBranchPlantPart
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseRight:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.rightBranchPlantPart !== null) {
                        if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.push()
                        }
                        phytomerTraversing.rightBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.rightBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = phytomerTraversing.rightBranchPlantPart
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseNext:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.nextPlantPart !== null) {
                        if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.push()
                            this.plant.turtle.rotateX(this.plant.pGeneral.phyllotacticRotationAngle * 256 / 360)
                        }
                        phytomerTraversing.nextPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.nextPlantPart.isPhytomer())) {
                            phytomerTraversing = phytomerTraversing.nextPlantPart
                            phytomerTraversing.traversingDirection = kTraverseLeft
                        } else if ((this.mode === Activity.kActivityDraw)) {
                            this.plant.turtle.pop()
                        }
                    }
                    break
                case kTraverseDone:
                    phytomerTraversing.traversingDirection = kTraverseNone
                    const lastPhytomer: PdInternode = phytomerTraversing
                    phytomerTraversing = phytomerTraversing.phytomerAttachedTo
                    if ((this.mode === Activity.kActivityFree)) {
                        // TODO: Use or remove: lastPhytomer.free
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
                    if ((this.mode === Activity.kActivityDraw)) {
                        //special drawing stuff - if returning from left or right branch draw, pop turtle
                        //	if (phytomerTraversing.traversingDirection = kTraverseLeft + 1)
                        //           or (phytomerTraversing.traversingDirection =  kTraverseRight + 1)  then 
                        this.plant.turtle.pop()
                    }
                    if ((this.mode === Activity.kActivityCalculateBiomassForGravity)) {
                        phytomerTraversing.traverseActivity(this.mode, this)
                    }
                    break
                case kTraverseNone:
                    throw new Error("Problem: kTraverseNone encountered in method PdTraverser.traversePlant.")
            }
            if ((traversalCount !== 0)) {
                i += 1
            }
            if ((this.mode === Activity.kActivityDraw) && (this.showDrawingProgress)) {
                if (this.totalPlantParts % 4 !== 0) {
                    continue
                }
                if ((MainForm !== null) && (MainForm.drawing)) {
                    MainForm.showDrawProgress(this.plantPartsDrawnAtStart + this.totalPlantParts)
                }
            }
        }
    }
    
}

