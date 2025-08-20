// PdTraverser was unit Utravers

import { float, int, short, long } from "./common"
import { max, safedivExcept, min } from "./umath"
import { PdPlant } from "./PdPlant"
import { TPoint } from "./TPoint"
import { messageForExceptionType } from "./usupport"
import { PdPlantPart } from "./PdPlantPart"
import { PdInternode } from "./PdInternode"
import { ExportPart } from "./U3dexport"
import { PdFiler } from "./PdFiler"
import { MainForm } from "./FormHolder"

export enum TraverseDirection {
    kTraverseNone = 0,
    kTraverseLeft = 1,
    kTraverseRight = 2,
    kTraverseNext = 3,
    kTraverseDone = 4,
}

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

export enum Statistics {
    kStatisticsPartTypeSeedlingLeaf = 0,
    kStatisticsPartTypeLeaf = 1,
    kStatisticsPartTypeFemaleInflorescence = 2,
    kStatisticsPartTypeMaleInflorescence = 3,
    kStatisticsPartTypeFemaleFlower = 4,
    kStatisticsPartTypeFemaleFlowerBud = 5,
    kStatisticsPartTypeMaleFlower = 6,
    kStatisticsPartTypeMaleFlowerBud = 7,
    kStatisticsPartTypeAxillaryBud = 8,
    kStatisticsPartTypeFruit = 9,
    kStatisticsPartTypeStem = 10,
    kStatisticsPartTypeUnripeFruit = 11,
    kStatisticsPartTypeFallenFruit = 12,
    kStatisticsPartTypeUnallocatedNewVegetativeBiomass = 13,
    kStatisticsPartTypeUnremovedDeadVegetativeBiomass = 14,
    kStatisticsPartTypeUnallocatedNewReproductiveBiomass = 15,
    kStatisticsPartTypeUnremovedDeadReproductiveBiomass = 16,
    kStatisticsPartTypeFallenFlower = 17,
    kStatisticsPartTypeAllVegetative = 18,
    kStatisticsPartTypeAllReproductive = 19,
    kStatisticsPartTypeLast = 19,
}

// var
export const TraverserGlobals = {
    cancelDrawing: false,
    worstNStressColor: 0,
    worstPStressColor: 0,
    worstDeadColor: 0,
}

// -------------------------------------------------------------------------- linear growth functions 
function linearGrowthWithFactorResult(current: float, optimal: float, minDays: int, growthFactor: float): float {
    let result = 0.0
    try {
        let amountNeeded = optimal - current
        const maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        result = amountNeeded * growthFactor
    } catch (e: any) {
        messageForExceptionType(e, "linearGrowthWithFactorResult")
    }
    return result
}

export function linearGrowthWithFactor(current: float, optimal: float, minDays: int, growthFactor: float): float {
    try {
        let amountNeeded = optimal - current
        const maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        current = current + amountNeeded * growthFactor
    } catch (e: any) {
        messageForExceptionType(e, "linearGrowthWithFactor")
    }
    return current
}

export function linearGrowthResult(current: float, optimal: float, minDays: int): float {
    let result = 0.0
    try {
        let amountNeeded = optimal - current
        const maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        result = amountNeeded
    } catch (e: any) {
        messageForExceptionType(e, "linearGrowthResult")
    }
    return result
}

function linearGrowth(current: float, optimal: float, minDays: int): float {
    try {
        let amountNeeded = optimal - current
        const maxPossible = safedivExcept(optimal, minDays, optimal)
        amountNeeded = max(0.0, min(amountNeeded, maxPossible))
        current = current + amountNeeded
    } catch (e: any) {
        messageForExceptionType(e, "linearGrowth")
    }
    return current
}


// meristems
export class PdPlantStatistics {
    count: long[] = Array(Statistics.kStatisticsPartTypeLast + 1)
    liveBiomass_pctMPB: float[] = Array(Statistics.kStatisticsPartTypeLast + 1)
    deadBiomass_pctMPB: float[] = Array(Statistics.kStatisticsPartTypeLast + 1)
    
    // ---------------------------------------------------------------------------------- statistics object 
    zeroAllFields(): void {   
        for (let i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
            this.count[i] = 0
            this.liveBiomass_pctMPB[i] = 0.0
            this.deadBiomass_pctMPB[i] = 0.0
        }
    }
    
    totalBiomass_pctMPB(): float {
        let result = 0.0 
        for (let i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
            result = result + this.liveBiomass_pctMPB[i]
            result = result + this.deadBiomass_pctMPB[i]
        }
        return result
    }
    
}

export class PdTraverser {
    plant: PdPlant
    filer: PdFiler | null = null
    currentPhytomer: PdInternode | null = null
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
    exportTypeCounts: long[] = Array(ExportPart.kExportPartLast + 1)
    
    // ---------------------------------------------------------------------------------- traversing object 
    constructor(thePlant: PdPlant) {
        this.plant = thePlant
    }
    
    beginTraversal(aMode: int): void {
        this.mode = aMode
        this.total = 0.0
        this.finished = false
        this.foundPlantPart = null
        this.totalPlantParts = 0
        if (this.plant.firstPhytomer !== null) {
            this.currentPhytomer = this.plant.firstPhytomer
            this.currentPhytomer.traversingDirection = TraverseDirection.kTraverseLeft
            this.currentPhytomer.traverseActivity(this.mode, this)
            // reset afterwards in case read in differently
            this.currentPhytomer.traversingDirection = TraverseDirection.kTraverseLeft
        }
    }
    
    traverseWholePlant(aMode: int): void {
        this.beginTraversal(aMode)
        this.traversePlant(0)
    }
    
    traversePlant(traversalCount: long): void {
        if (this.currentPhytomer === null) {
            return
        }
        if (this.mode === Activity.kActivityDraw && !this.plant.turtle) {
            throw new Error("null turtle in traversePlant for kActivityDraw")
        }
        let phytomerTraversing: PdInternode = this.currentPhytomer
        let i = 0
        loopToBreak: while (i <= traversalCount) {
            if (this.finished) {
                return
            }
            switch (phytomerTraversing.traversingDirection) {
                case TraverseDirection.kTraverseLeft:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.leftBranchPlantPart !== null) {
                        if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.push()
                        }
                        phytomerTraversing.leftBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.leftBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = <PdInternode>phytomerTraversing.leftBranchPlantPart
                            phytomerTraversing.traversingDirection = TraverseDirection.kTraverseLeft
                        } else if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.pop()
                        }
                    }
                    break
                case TraverseDirection.kTraverseRight:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.rightBranchPlantPart !== null) {
                        if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.push()
                        }
                        phytomerTraversing.rightBranchPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.rightBranchPlantPart.isPhytomer())) {
                            phytomerTraversing = <PdInternode>phytomerTraversing.rightBranchPlantPart
                            phytomerTraversing.traversingDirection = TraverseDirection.kTraverseLeft
                        } else if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.pop()
                        }
                    }
                    break
                case TraverseDirection.kTraverseNext:
                    phytomerTraversing.traversingDirection += 1
                    if (phytomerTraversing.nextPlantPart !== null) {
                        if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.push()
                            this.plant.turtle!.rotateX(this.plant.pGeneral.phyllotacticRotationAngle * 256 / 360)
                        }
                        phytomerTraversing.nextPlantPart.traverseActivity(this.mode, this)
                        if ((phytomerTraversing.nextPlantPart.isPhytomer())) {
                            phytomerTraversing = <PdInternode>phytomerTraversing.nextPlantPart
                            phytomerTraversing.traversingDirection = TraverseDirection.kTraverseLeft
                        } else if (this.mode === Activity.kActivityDraw) {
                            this.plant.turtle!.pop()
                        }
                    }
                    break
                case TraverseDirection.kTraverseDone:
                    phytomerTraversing.traversingDirection = TraverseDirection.kTraverseNone
                    const lastPhytomer: PdInternode = phytomerTraversing
                    if (phytomerTraversing.phytomerAttachedTo === null) {
                        break loopToBreak
                    }
                    phytomerTraversing = phytomerTraversing.phytomerAttachedTo
                    if (this.mode === Activity.kActivityFree) {
                        // TODO: Use or remove: lastPhytomer.free
                        if (phytomerTraversing.traversingDirection === TraverseDirection.kTraverseLeft + 1) {
                            phytomerTraversing.leftBranchPlantPart = null
                        } else if (phytomerTraversing.traversingDirection === TraverseDirection.kTraverseRight + 1) {
                            phytomerTraversing.rightBranchPlantPart = null
                        } else if (phytomerTraversing.traversingDirection === TraverseDirection.kTraverseNext + 1) {
                            phytomerTraversing.nextPlantPart = null
                        }
                    }
                    if (this.mode === Activity.kActivityDraw) {
                        //special drawing stuff - if returning from left or right branch draw, pop turtle
                        //	if (phytomerTraversing.traversingDirection = TraverseDirection.kTraverseLeft + 1)
                        //           or (phytomerTraversing.traversingDirection =  TraverseDirection.kTraverseRight + 1)  then 
                        this.plant.turtle!.pop()
                    }
                    if (this.mode === Activity.kActivityCalculateBiomassForGravity) {
                        phytomerTraversing.traverseActivity(this.mode, this)
                    }
                    break
                case TraverseDirection.kTraverseNone:
                    throw new Error("Problem: TraverseDirection.kTraverseNone encountered in method PdTraverser.traversePlant.")
            }
            if (traversalCount !== 0) {
                i += 1
            }
            if ((this.mode === Activity.kActivityDraw) && (this.showDrawingProgress)) {
                if (this.totalPlantParts % 4 !== 0) {
                    continue
                }
                if (MainForm.drawing) {
                    MainForm.showDrawProgress(this.plantPartsDrawnAtStart + this.totalPlantParts)
                }
            }
        }
    }
    
}

