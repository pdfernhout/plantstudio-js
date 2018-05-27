// PdPlant was unit Uplant

import { PdStreamableObject, ExportFormats, messageForExceptionType, boundForString, DebugPrint } from "./temporary";
import { short, float, double, long, intround, TColorRef, int, ShowMessage, TColor, ColorDefs, StrToIntDef, IntToStr } from "./common";
import { KfObject3D } from "./KfObject3D";
import { TPoint } from "./TPoint";
import { TRect } from "./TRect";
import { KfTurtle } from "./KfTurtle";
import { SCurveStructure, intMin, intMax, safedivExcept, min, stringToSCurve } from "./umath";
import { KfPoint3D } from "./KfPoint3D";
import { PdRandom } from "./PdRandom";
import { domain, DrawMode } from "./PdDomain";

/* Remove unused imports
from conversion_common import *
import ubmpsupport
import ucursor
import utimeser
import usection
import uclasses
import utransfr
import uintern
import umerist
import upart
import utravers
import u3dexport
import umain
import udomain
import udebug
import uamendmt
import usupport
import ubitmap
import uparams
import ufiler
import uturtle
import umath
import ucollect
import urandom
import utdo
import delphi_compatability
*/

// const
const kGenderMale = 0
const kGenderFemale = 1
const kCompoundLeafPinnate = 0
const kCompoundLeafPalmate = 1
const kArrangementAlternate = 0
const kArrangementOpposite = 1
const kStageFlowerBud = 1
const kStageOpenFlower = 2
const kStageUnripeFruit = 3
const kStageRipeFruit = 4
const kPartTypeNone = 0
const kPartTypeFlowerFruit = 1
const kPartTypeInflorescence = 2
const kPartTypeMeristem = 3
const kPartTypePhytomer = 4
const kPartTypeLeaf = 5
const kDirectionLeft = 0
const kDirectionRight = 1
const kGetField = 0
const kSetField = 1
const kPlantNameLength = 80
const kCheckForUnreadParams = true
const kDontCheckForUnreadParams = false
const kConsiderDomainScale = true
const kDontConsiderDomainScale = false
const kDrawNow = true
const kDontDrawNow = false
const kMutation = 0
const kWeight = 1
const kMaxBreedingSections = 20
const kFromFirstPlant = 0
const kFromSecondPlant = 1
const kFromProbabilityBasedOnWeightsForSection = 2
const kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant = 3
const kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant = 4
const kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly = 5
const kPlantAsTextStartString = "start PlantStudio plant"
const kPlantAsTextEndString = "end PlantStudio plant"
const kStartNoteString = "=== start note"
const kEndNoteString = "=== end note"
const kInMainWindow = true
const kNotInMainWindow = false
const kBud = 0
const kPistils = 1
const kStamens = 2
const kFirstPetals = 3
const kSecondPetals = 4
const kThirdPetals = 5
const kFourthPetals = 6
const kFifthPetals = 7
const kSepals = 8
const kHighestFloralPartConstant = kSepals
const kDrawNoBud = 0
const kDrawSingleTdoBud = 1
const kDrawOpeningFlower = 2
const kNotExactAge = false
const kExactAge = true


// record
export class BreedingAndTimeSeriesOptionsStructure {
    mutationStrengths: short[] /* kMaxBreedingSections + 1 */
    firstPlantWeights: short[] /* kMaxBreedingSections + 1 */
    getNonNumericalParametersFrom: short
    mutateAndBlendColorValues: boolean
    chooseTdosRandomlyFromCurrentLibrary: boolean
    percentMaxAge: short
    plantsPerGeneration: short
    variationType: short
    thumbnailWidth: short
    thumbnailHeight: short
    maxGenerations: short
    numTimeSeriesStages: short
}

// v2.0
// record
export class TdoParamsStructure {
    object3D: KfObject3D
    xRotationBeforeDraw: float
    yRotationBeforeDraw: float
    zRotationBeforeDraw: float
    faceColor: TColorRef
    backfaceColor: TColorRef
    alternateFaceColor: TColorRef
    alternateBackfaceColor: TColorRef
    scaleAtFullSize: float
    repetitions: short
    radiallyArranged: boolean
    pullBackAngle: float
}

// alternate colors used only for fruit, so far - ripe vs. unripe
// params->start 
// access->pGeneral 
// record
export class ParamsGeneral {
    randomSway: float
    startingSeedForRandomNumberGenerator: short
    numApicalInflors: short
    numAxillaryInflors: short
    lineDivisions: short
    isDicot: boolean
    maleFlowersAreSeparate: boolean
    ageAtMaturity: short
    growthSCurve: SCurveStructure
    ageAtWhichFloweringStarts: short
    fractionReproductiveAllocationAtMaturity_frn: float
    wiltingPercent: float
    phyllotacticRotationAngle: float
}

// was longint, but want it in a param panel
// NA
// not using yet
// access->pLeaf 
// record
export class ParamsLeaf {
    leafTdoParams: TdoParamsStructure
    stipuleTdoParams: TdoParamsStructure
    sCurveParams: SCurveStructure
    petioleColor: TColorRef
    optimalBiomass_pctMPB: float
    optimalFractionOfOptimalBiomassAtCreation_frn: float
    minDaysToGrow: short
    maxDaysToGrow: short
    petioleLengthAtOptimalBiomass_mm: float
    petioleWidthAtOptimalBiomass_mm: float
    petioleAngle: float
    compoundRachisToPetioleRatio: float
    compoundPinnateOrPalmate: short
    compoundNumLeaflets: short
    compoundCurveAngleAtStart: float
    compoundCurveAngleAtFullSize: float
    fractionOfLiveBiomassWhenAbscisses_frn: float
    petioleTaperIndex: short
    compoundPinnateLeafletArrangement: short
}

// ENUM
// access->pSeedlingLeaf 
// record
export class ParamsSeedlingLeaf {
    leafTdoParams: TdoParamsStructure
    nodesOnStemWhenFallsOff: short
}

// access->pInternode 
// record
export class ParamsInternode {
    faceColor: TColorRef
    backfaceColor: TColorRef
    curvingIndex: float
    firstInternodeCurvingIndex: float
    minFractionOfOptimalInitialBiomassToCreateInternode_frn: float
    minDaysToCreateInternode: short
    maxDaysToCreateInternodeIfOverMinFraction: short
    optimalFinalBiomass_pctMPB: float
    canRecoverFromStuntingDuringCreation: boolean
    minDaysToAccumulateBiomass: short
    maxDaysToAccumulateBiomass: short
    minDaysToExpand: short
    maxDaysToExpand: short
    lengthAtOptimalFinalBiomassAndExpansion_mm: float
    lengthMultiplierDueToBiomassAccretion: float
    lengthMultiplierDueToExpansion: float
    widthAtOptimalFinalBiomassAndExpansion_mm: float
    widthMultiplierDueToBiomassAccretion: float
    widthMultiplierDueToExpansion: float
    lengthMultiplierDueToBolting: float
    minDaysToBolt: short
    maxDaysToBolt: short
}

// creation 
// growth and expansion 
// bolting 
// access->pFlower 
// kBud = 0; kPistil = 1; kStamens = 2; kFirstPetals = 3; kSecondPetals = 4; kThirdPetals = 5; kSepals = 6;
// record
export class ParamsFlower {
    tdoParams: TdoParamsStructure[] /* kSepals + 1 */
    budDrawingOption: short
    optimalBiomass_pctMPB: float
    minFractionOfOptimalInitialBiomassToCreateFlower_frn: float
    minDaysToCreateFlowerBud: short
    maxDaysToCreateFlowerBudIfOverMinFraction: short
    minFractionOfOptimalBiomassToOpenFlower_frn: float
    minDaysToOpenFlower: short
    minDaysToGrow: short
    maxDaysToGrowIfOverMinFraction: short
    minDaysBeforeSettingFruit: short
    daysBeforeDrop: short
    minFractionOfOptimalBiomassToCreateFruit_frn: float
    numPistils: short
    styleLength_mm: float
    styleWidth_mm: float
    styleTaperIndex: short
    styleColor: TColorRef
    numStamens: short
    filamentLength_mm: float
    filamentWidth_mm: float
    filamentTaperIndex: short
    filamentColor: TColorRef
}

// access->pInflor 
// record
export class ParamsInflorescence {
    bractTdoParams: TdoParamsStructure
    optimalBiomass_pctMPB: float
    minFractionOfOptimalBiomassToCreateInflorescence_frn: float
    minDaysToCreateInflorescence: short
    maxDaysToCreateInflorescenceIfOverMinFraction: short
    minFractionOfOptimalBiomassToMakeFlowers_frn: float
    minDaysToGrow: short
    maxDaysToGrow: short
    peduncleLength_mm: float
    internodeLength_mm: float
    internodeWidth_mm: float
    pedicelLength_mm: float
    pedicelAngle: float
    branchAngle: float
    angleBetweenInternodes: float
    peduncleAngleFromVegetativeStem: float
    apicalStalkAngleFromVegetativeStem: float
    terminalStalkLength_mm: float
    numFlowersPerBranch: short
    numFlowersOnMainBranch: short
    daysToAllFlowersCreated: short
    numBranches: short
    branchesAreAlternate: boolean
    isHead: boolean
    isTerminal: boolean
    flowersDrawTopToBottom: boolean
    flowersSpiralOnStem: boolean
    stalkColor: TColorRef
    pedicelColor: TColorRef
    pedicelTaperIndex: short
}

// access->pAxillaryBud 
// record
export class ParamsAxillaryBud {
    tdoParams: TdoParamsStructure
}

// access->pMeristem 
// record
export class ParamsMeristem {
    branchingIndex: float
    branchingDistance: float
    branchingAngle: float
    determinateProbability: float
    branchingIsSympodial: boolean
    branchingAndLeafArrangement: short
    secondaryBranchingIsAllowed: boolean
}

// access->pFruit 
// record
export class ParamsFruit {
    tdoParams: TdoParamsStructure
    sCurveParams: SCurveStructure
    optimalBiomass_pctMPB: float
    minDaysToGrow: short
    maxDaysToGrow: short
    stalkStrengthIndex: float
    daysToRipen: short
}

// access->pRoot 
// record
export class ParamsRoot {
    tdoParams: TdoParamsStructure
    showsAboveGround: boolean
}

// const
const kExtraForRootTopProblem = 2


function cancelOutOppositeAmounts(amountAdded: float, amountTakenAway: float): [float, float] {
    if ((amountAdded > 0.0) && (amountTakenAway > 0.0)) {
        if (amountAdded === amountTakenAway) {
            amountAdded = 0.0
            amountTakenAway = 0.0
        } else if (amountAdded > amountTakenAway) {
            amountAdded = amountAdded - amountTakenAway
            amountTakenAway = 0.0
        } else {
            amountTakenAway = amountTakenAway - amountAdded
            amountAdded = 0.0
        }
    }
    return [amountAdded, amountTakenAway]
}


// aspects->stop 
export class PdPlant extends PdStreamableObject {
    name: string = ""
    age: short = 0
    basePoint_mm: SinglePoint = new SinglePoint()
    xRotation: float = 0.0
    yRotation: float = 0.0
    zRotation: float = 0.0
    drawingScale_PixelsPerMm: float = 0.0
    previewCache: PdBitmap = new PdBitmap()
    drawingIntoPreviewCache: boolean = false
    previewCacheUpToDate: boolean = false
    randomNumberGenerator: PdRandom = new PdRandom()
    breedingGenerator: PdRandom = new PdRandom()
    pGeneral: ParamsGeneral = new ParamsGeneral()
    pMeristem: ParamsMeristem = new ParamsMeristem()
    pInternode: ParamsInternode = new ParamsInternode()
    pLeaf: ParamsLeaf = new ParamsLeaf()
    pSeedlingLeaf: ParamsSeedlingLeaf = new ParamsSeedlingLeaf()
    pAxillaryBud: ParamsAxillaryBud = new ParamsAxillaryBud()
    pInflor: ParamsInflorescence[] /* 1 + 1 */ = Array(1+ 1)
    pFlower: ParamsFlower[] /* 1 + 1 */ = Array(1+ 1)
    pFruit: ParamsFruit = new ParamsFruit()
    pRoot: ParamsRoot = new ParamsRoot()
    selectedWhenLastSaved: boolean = false
    hidden: boolean = false
    computeBounds: boolean = false
    fixedPreviewScale: boolean = false
    justCopiedFromMainWindow: boolean = false
    fixedDrawPosition: boolean = false
    drawPositionIfFixed: TPoint = new TPoint()
    normalBoundsRect_pixels: TRect = new TRect()
    indexWhenRemoved: short = 0
    selectedIndexWhenRemoved: short = 0
    needToRecalculateColors: boolean = false
    ageOfYoungestPhytomer: short = 0
    writingToMemo: boolean = false
    readingFromMemo: boolean = false
    readingMemoLine: long = 0
    useBestDrawingForPreview: boolean = false
    turtle: KfTurtle | null = null
    firstPhytomer: TObject = new TObject()
    totalBiomass_pctMPB: float = 0.0
    reproBiomass_pctMPB: float = 0.0
    shootBiomass_pctMPB: float = 0.0
    changeInShootBiomassToday_pctMPB: float = 0.0
    changeInReproBiomassToday_pctMPB: float = 0.0
    ageAtWhichFloweringStarted: short = 0
    floweringHasStarted: boolean = false
    totalPlantParts: long = 0
    partsCreated: long = 0
    total3DExportPoints: long = 0
    total3DExportTriangles: long = 0
    total3DExportMaterials: long = 0
    unallocatedNewVegetativeBiomass_pctMPB: float = 0.0
    unremovedDeadVegetativeBiomass_pctMPB: float = 0.0
    unallocatedNewReproductiveBiomass_pctMPB: float = 0.0
    unremovedDeadReproductiveBiomass_pctMPB: float = 0.0
    unremovedStandingDeadBiomass_pctMPB: float = 0.0
    numApicalActiveReproductiveMeristemsOrInflorescences: long = 0
    numAxillaryActiveReproductiveMeristemsOrInflorescences: long = 0
    numApicalInactiveReproductiveMeristems: long = 0
    numAxillaryInactiveReproductiveMeristems: long = 0
    wholePlantUpdateNeeded: boolean = false
    plantPartsDrawnAtStart: long = 0
    changingWholeSCurves: boolean = false
    noteLines: TStringList = new TStringList()
    amendments: TListCollection = new TListCollection()
    totalMemoryUsed_K: double = 0.0
    
    // graphical 
    // parameters 
    // all vars following don't need to be saved in the plant file (but should be copied when streaming) 
    // pointers 
    // biomass and flowering 
    // v1.6b1
    // accounting variables 
    // used in parameter changes 
    // -------------------------------------------------------------------------------------- creation/destruction 
    create(): void {
        PdStreamableObject.prototype.create.call(this)
        this.turtle = null
        this.firstPhytomer = null
        this.previewCache = ubitmap.PdBitmap().Create()
        this.initializeCache(this.previewCache)
        this.randomNumberGenerator = new PdRandom()
        this.breedingGenerator = new PdRandom()
        this.amendments = ucollect.TListCollection().Create()
        this.breedingGenerator.setSeed(this.breedingGenerator.randomSeedFromTime())
        this.noteLines = delphi_compatability.TStringList.create
        this.initialize3DObjects()
        this.drawingScale_PixelsPerMm = 1.0
        // not using the internode water expansion code this version, meaningless, no water stress, need these
        // these twos mean internodes are hard-coded to increase in width and height twice (from defaults in params.tab)
        this.pInternode.lengthMultiplierDueToBiomassAccretion = 2.0
        this.pInternode.widthMultiplierDueToBiomassAccretion = 2.0
        this.pInternode.lengthMultiplierDueToExpansion = 1.0
        this.pInternode.widthMultiplierDueToExpansion = 1.0
        // v1.6b1
        this.partsCreated = 0
    }
    
    initialize3DObjects(): void {
        let partType: int
        
        // i think it is best to create these at plant creation, then read into existing ones. 
        this.pSeedlingLeaf.leafTdoParams.object3D = new KfObject3D()
        this.pLeaf.leafTdoParams.object3D = new KfObject3D()
        this.pLeaf.stipuleTdoParams.object3D = new KfObject3D()
        this.pInflor[kGenderFemale].bractTdoParams.object3D = new KfObject3D()
        this.pInflor[kGenderMale].bractTdoParams.object3D = new KfObject3D()
        for (partType = 0; partType <= kHighestFloralPartConstant; partType++) {
            this.pFlower[kGenderFemale].tdoParams[partType].object3D = new KfObject3D()
            this.pFlower[kGenderMale].tdoParams[partType].object3D = new KfObject3D()
        }
        this.pAxillaryBud.tdoParams.object3D = new KfObject3D()
        this.pFruit.tdoParams.object3D = new KfObject3D()
        this.pRoot.tdoParams.object3D = new KfObject3D()
    }
    
    freeAllDrawingPlantParts(): void {
        let traverser: PdTraverser
        
        if ((this.firstPhytomer !== null)) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            traverser.traverseWholePlant(utravers.kActivityFree)
            traverser.free
            this.firstPhytomer = null
            // v1.6b1
            this.partsCreated = 0
        }
    }
    
    initializeCache(cache: PdBitmap): void {
        // giving the cache a tiny size at creation forces it to create its canvas etc
        // without this there is a nil pointer at streaming which causes a problem
        cache.Width = 1
        cache.Height = 1
        cache.Transparent = true
        cache.TransparentMode = delphi_compatability.TTransparentMode.tmFixed
        cache.TransparentColor = domain.options.backgroundColor
    }
    
    getName(): string {
        let result = ""
        result = this.name
        return result
    }
    
    setName(newName: string): void {
        this.name = newName.substring(0, kPlantNameLength)
    }
    
    // ----------------------------------------------------------------------------------------- age management 
    regrow(): void {
        this.setAge(this.age)
    }
    
    reset(): void {
        this.age = 0
        this.freeAllDrawingPlantParts()
        this.totalBiomass_pctMPB = 0.0
        this.reproBiomass_pctMPB = 0.0
        this.shootBiomass_pctMPB = 0.0
        this.changeInShootBiomassToday_pctMPB = 0.0
        this.changeInReproBiomassToday_pctMPB = 0.0
        this.floweringHasStarted = false
        this.totalPlantParts = 0
        this.ageAtWhichFloweringStarted = 0
        this.numApicalActiveReproductiveMeristemsOrInflorescences = 0
        this.numAxillaryActiveReproductiveMeristemsOrInflorescences = 0
        this.numApicalInactiveReproductiveMeristems = 0
        this.numAxillaryInactiveReproductiveMeristems = 0
        this.unallocatedNewVegetativeBiomass_pctMPB = 0.0
        this.unremovedDeadVegetativeBiomass_pctMPB = 0.0
        this.unallocatedNewReproductiveBiomass_pctMPB = 0.0
        this.unremovedDeadReproductiveBiomass_pctMPB = 0.0
        this.unremovedStandingDeadBiomass_pctMPB = 0.0
        this.ageOfYoungestPhytomer = 0
        this.needToRecalculateColors = true
        this.randomNumberGenerator.setSeedFromSmallint(this.pGeneral.startingSeedForRandomNumberGenerator)
    }
    
    setAge(newAge: short): void {
        newAge = intMax(0, intMin(this.pGeneral.ageAtMaturity, newAge))
        try {
            ucursor.cursor_startWait()
            this.reset()
            while (this.age < newAge) {
                this.nextDay()
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    // ---------------------------------------------------------------------------------------  drawing and graphics 
    draw(): void {
        let traverser: PdTraverser
        
        utravers.cancelDrawing = false
        if (this.turtle === null) {
            throw new Error("Problem: Nil turtle in method PdPlant.draw.")
        }
        if (this.turtle.drawingSurface.pane !== null) {
            this.turtle.drawingSurface.pane.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            this.turtle.drawingSurface.pane.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        }
        this.turtle.setLineColor(delphi_compatability.clGreen)
        this.turtle.push()
        this.turtle.rotateZ(64)
        this.turtle.rotateX(this.xRotation * 256 / 360)
        // convert here from 360 degrees to 256 turtle degrees 
        this.turtle.rotateY(this.yRotation * 256 / 360)
        this.turtle.rotateZ(this.zRotation * 256 / 360)
        this.turtle.drawingSurface.lineColor = ColorDefs.clGreen
        if ((this.firstPhytomer !== null)) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.plantPartsDrawnAtStart = this.plantPartsDrawnAtStart
                // if not drawing 3D objects, probably drawing just to get bounds
                traverser.showDrawingProgress = this.turtle.drawOptions.draw3DObjects
                traverser.traverseWholePlant(utravers.kActivityDraw)
            } finally {
                traverser.free
                traverser = null
            }
        }
        this.turtle.pop()
        // recalculating colors occurs during drawing of leaves and internodes if necessary 
        this.needToRecalculateColors = false
    }
    
    countPlantParts(): void {
        let traverser: PdTraverser
        
        this.totalPlantParts = 0
        if ((this.firstPhytomer !== null)) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.traverseWholePlant(utravers.kActivityCountPlantParts)
                this.totalPlantParts = traverser.totalPlantParts
            } finally {
                traverser.free
                traverser = null
            }
        }
    }
    
    countPlantPartsFor3DOutput(outputType: short, stemCylinderFaces: short): void {
        let traverser: PdTraverser
        let i: short
        
        if ((this.firstPhytomer !== null)) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.traverseWholePlant(utravers.kActivityCountPointsAndTrianglesFor3DExport)
                this.totalPlantParts = traverser.totalPlantParts
                switch (outputType) {
                    case u3dexport.kPOV:
                        // POV does not use polygon cylinders for lines; it draws them directly
                        this.total3DExportPoints = traverser.total3DExportPointsIn3DObjects + traverser.total3DExportStemSegments * this.pGeneral.lineDivisions * 2
                        this.total3DExportTriangles = traverser.total3DExportTrianglesIn3DObjects
                        break
                    default:
                        // for every output type that uses cylinders made of triangles
                        this.total3DExportPoints = traverser.total3DExportPointsIn3DObjects + (traverser.total3DExportStemSegments * (this.pGeneral.lineDivisions + 1) * stemCylinderFaces)
                        this.total3DExportTriangles = traverser.total3DExportTrianglesIn3DObjects + (traverser.total3DExportStemSegments * this.pGeneral.lineDivisions * stemCylinderFaces * 2)
                        break
                }
                // this is only important for LWO and OBJ, but people will like to see it anyway
                this.total3DExportMaterials = 0
                for (i = 0; i <= u3dexport.kExportPartLast; i++) {
                    if (traverser.exportTypeCounts[i] > 0) {
                        this.total3DExportMaterials += 1
                    }
                }
            } finally {
                traverser.free
                traverser = null
            }
        }
    }
    
    calculateTotalMemorySize(): double {
        let result = 0.0
        let traverser: PdTraverser
        
        result = this.instanceSize / 1024.0
        result = result + this.hangingObjectsMemoryUse_K()
        result = result + this.tdoMemoryUse_K()
        if (this.previewCache !== null) {
            // preview cache
            result = result + ubitmap.BitmapMemorySize(this.previewCache) / 1024.0
        }
        this.totalMemoryUsed_K = result
        if ((this.firstPhytomer !== null)) {
            // plant parts
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.traverseWholePlant(utravers.kActivityCountTotalMemoryUse)
                result = result + traverser.totalMemorySize / 1024.0
                this.totalMemoryUsed_K = result
            } finally {
                traverser.free
                traverser = null
            }
        }
        return result
    }
    
    hangingObjectsMemoryUse_K(): double {
        let result = 0.0
        let i: short
        
        result = 0
        if (this.randomNumberGenerator !== null) {
            // random number generators
            result = result + this.randomNumberGenerator.instanceSize / 1024.0
        }
        if (this.breedingGenerator !== null) {
            result = result + this.breedingGenerator.instanceSize / 1024.0
        }
        if (this.noteLines !== null) {
            // note
            result = result + this.noteLines.instanceSize / 1024.0
        }
        if (this.amendments !== null) {
            // amendments
            result = result + this.amendments.instanceSize / 1024.0
            if (this.amendments.Count > 0) {
                for (i = 0; i <= this.amendments.Count - 1; i++) {
                    result = result + uamendmt.PdPlantDrawingAmendment(this.amendments.Items[i]).instanceSize / 1024.0
                }
            }
        }
        return result
    }
    
    tdoMemoryUse_K(): double {
        let result = 0.0
        let partType: short
        
        // tdos
        result = 0
        result = result + this.pSeedlingLeaf.leafTdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pLeaf.leafTdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pLeaf.stipuleTdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pInflor[kGenderFemale].bractTdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pInflor[kGenderMale].bractTdoParams.object3D.totalMemorySize() / 1024.0
        for (partType = 0; partType <= kHighestFloralPartConstant; partType++) {
            result = result + this.pFlower[kGenderFemale].tdoParams[partType].object3D.totalMemorySize() / 1024.0
            result = result + this.pFlower[kGenderMale].tdoParams[partType].object3D.totalMemorySize() / 1024.0
        }
        result = result + this.pAxillaryBud.tdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pFruit.tdoParams.object3D.totalMemorySize() / 1024.0
        result = result + this.pRoot.tdoParams.object3D.totalMemorySize() / 1024.0
        return result
    }
    
    drawOn(destCanvas: TCanvas): void {
        let realBasePoint_pixels: TPoint
        
        this.turtle = KfTurtle.defaultStartUsing()
        try {
            this.turtle.drawingSurface.pane = destCanvas
            this.setTurtleDrawOptionsForNormalDraw(this.turtle)
            // must be after pane and draw options set 
            this.turtle.reset()
            this.turtle.setScale_pixelsPerMm(this.realDrawingScale_pixelsPerMm())
            this.turtle.drawingSurface.foreColor = ColorDefs.clGreen
            this.turtle.drawingSurface.backColor = ColorDefs.clRed
            this.turtle.drawingSurface.lineColor = ColorDefs.clBlue
            realBasePoint_pixels = this.basePoint_pixels()
            this.turtle.xyz(realBasePoint_pixels.X, realBasePoint_pixels.Y, 0)
            this.turtle.resetBoundsRect(realBasePoint_pixels)
            try {
                if (this.turtle.drawOptions.sortPolygons) {
                    this.turtle.drawingSurface.recordingStart()
                    this.draw()
                    this.turtle.drawingSurface.recordingStop()
                    this.turtle.drawingSurface.recordingDraw()
                    this.turtle.drawingSurface.clearTriangles()
                } else {
                    this.draw()
                }
                if ((this.computeBounds) && (!domain.drawingToMakeCopyBitmap)) {
                    this.setBoundsRect_pixels(this.getTurtleBoundsRect())
                    this.enforceMinimumBoundsRect()
                    this.expandBoundsRectForLineWidth()
                }
            } catch (e) {
                messageForExceptionType(e, "PdPlant.drawOn")
            }
        } finally {
            KfTurtle.defaultStopUsing()
            this.turtle = null
        }
    }
    
    setTurtleDrawOptionsForNormalDraw(turtle: KfTurtle): void {
        if (turtle === null) {
            return
        }
        turtle.drawOptions.circlePoints = false
        switch (domain.options.drawSpeed) {
            case DrawMode.kDrawFast:
                turtle.drawOptions.draw3DObjects = true
                turtle.drawOptions.draw3DObjectsAsRects = true
                turtle.drawOptions.drawStems = true
                turtle.drawOptions.wireFrame = true
                turtle.drawOptions.sortPolygons = false
                turtle.drawOptions.sortTdosAsOneItem = false
                break
            case DrawMode.kDrawMedium:
                turtle.drawOptions.draw3DObjects = true
                turtle.drawOptions.draw3DObjectsAsRects = false
                turtle.drawOptions.drawStems = true
                turtle.drawOptions.wireFrame = true
                turtle.drawOptions.sortPolygons = false
                turtle.drawOptions.sortTdosAsOneItem = false
                break
            case DrawMode.kDrawBest:
                turtle.drawOptions.draw3DObjects = true
                turtle.drawOptions.draw3DObjectsAsRects = false
                turtle.drawOptions.drawStems = true
                turtle.drawOptions.wireFrame = false
                turtle.drawOptions.sortPolygons = true
                turtle.drawOptions.sortTdosAsOneItem = true
                turtle.drawOptions.drawLines = true
                turtle.drawOptions.lineContrastIndex = 3
                break
            case DrawMode.kDrawCustom:
                turtle.drawOptions.draw3DObjects = domain.options.draw3DObjects
                turtle.drawOptions.draw3DObjectsAsRects = domain.options.draw3DObjectsAsBoundingRectsOnly
                turtle.drawOptions.drawStems = domain.options.drawStems
                turtle.drawOptions.wireFrame = !domain.options.fillPolygons
                turtle.drawOptions.sortPolygons = domain.options.sortPolygons
                turtle.drawOptions.sortTdosAsOneItem = domain.options.sortTdosAsOneItem
                turtle.drawOptions.drawLines = domain.options.drawLinesBetweenPolygons
                turtle.drawOptions.lineContrastIndex = domain.options.lineContrastIndex
                break
        }
    }
    
    resizingRect(): TRect {
        let result = new TRect()
        let theRect: TRect
        
        theRect = this.boundsRect_pixels()
        result = new TRect(theRect.Right - domain.options.resizeRectSize, theRect.Top, theRect.Right, theRect.Top + domain.options.resizeRectSize)
        if (result.Left < theRect.Left) {
            result.Left = theRect.Left
        }
        if (result.Top < theRect.Top) {
            result.Top = theRect.Top
        }
        return result
    }
    
    pointIsInResizingRect(point: TPoint): boolean {
        const theRect = this.resizingRect()
        return (point.X >= theRect.Left) && (point.X <= theRect.Right) && (point.Y >= theRect.Top) && (point.Y <= theRect.Bottom)
    }
    
    recalculateBoundsForOffsetChange(): void {
        let drawingRect: TRect
        let intersectRect_pixels: TRect
        let intersectResult: boolean
        
        this.fakeDrawToGetBounds()
        if (this.hidden) {
            return
        }
        if (domain.options.cachePlantBitmaps) {
            drawingRect = new TRect(0, 0, umain.MainForm.drawingPaintBox.Width, umain.MainForm.drawingPaintBox.Height)
            intersectResult = delphi_compatability.IntersectRect(intersectRect_pixels, this.boundsRect_pixels(), drawingRect)
            if ((intersectResult) && (!this.hidden) && (this.previewCache.Width < 5)) {
                this.recalculateBounds(kDrawNow)
            }
        }
    }
    
    // procedure drawOnUsingOpenGL(turtle: KfTurtle; selected, firstSelected: boolean);
    recalculateBounds(drawNow: boolean): void {
        let oldBasePoint: TPoint
        let drawingRect: TRect
        let intersectRect_pixels: TRect
        let intersectResult: boolean
        let showProgress: boolean
        let bytesThisBitmapWillBe: long
        
        this.fakeDrawToGetBounds()
        if (!domain.options.cachePlantBitmaps) {
            if (this.previewCache.Width > 5) {
                this.shrinkPreviewCache()
                umain.MainForm.updateForChangeToPlantBitmaps()
            }
            return
        }
        if (!drawNow) {
            return
        }
        if (this.hidden) {
            this.shrinkPreviewCache()
            umain.MainForm.updateForChangeToPlantBitmaps()
            return
        }
        drawingRect = new TRect(0, 0, umain.MainForm.drawingPaintBox.Width, umain.MainForm.drawingPaintBox.Height)
        // on opening file at first, force redraw of cache because drawingPaintBox size might be wrong
        intersectResult = umain.MainForm.inFormCreation || umain.MainForm.inFileOpen || delphi_compatability.IntersectRect(intersectRect_pixels, this.boundsRect_pixels(), drawingRect)
        if (!intersectResult) {
            this.shrinkPreviewCache()
            umain.MainForm.updateForChangeToPlantBitmaps()
            return
        }
        bytesThisBitmapWillBe = intround(this.boundsRect_pixels().width * this.boundsRect_pixels().height * umain.MainForm.screenBytesPerPixel())
        if (!umain.MainForm.roomForPlantBitmap(this, bytesThisBitmapWillBe)) {
            return
        }
        oldBasePoint = this.basePoint_pixels()
        try {
            this.setBasePoint_pixels(new TPoint(this.basePoint_pixels().X - this.boundsRect_pixels().Left, this.basePoint_pixels().Y - this.boundsRect_pixels().Top))
            this.resizeCacheIfNecessary(this.previewCache, new TPoint(this.boundsRect_pixels().width, this.boundsRect_pixels().height), kInMainWindow)
            this.previewCache.TransparentColor = domain.options.transparentColor
            ubmpsupport.fillBitmap(this.previewCache, domain.options.transparentColor)
            // showing progress here is mainly for really complicated plants; most plants won't need it
            showProgress = (!umain.MainForm.drawing) && (domain.options.showPlantDrawingProgress)
            if (showProgress) {
                this.plantPartsDrawnAtStart = 0
                this.countPlantParts()
                showProgress = this.totalPlantParts > 50
                if (showProgress) {
                    umain.MainForm.startDrawProgress(this.totalPlantParts)
                }
            }
            try {
                this.computeBounds = true
                this.drawOn(this.previewCache.Canvas)
            } finally {
                this.computeBounds = false
                if (showProgress) {
                    umain.MainForm.finishDrawProgress()
                }
            }
        } finally {
            // have to fake draw again to reset bounds rect
            this.setBasePoint_pixels(oldBasePoint)
            this.fakeDrawToGetBounds()
        }
    }
    
    fakeDrawToGetBounds(): void {
        this.computeBounds = true
        this.turtle = KfTurtle.defaultStartUsing()
        try {
            this.turtle.drawingSurface.pane = null
            this.turtle.drawOptions.drawStems = false
            this.turtle.drawOptions.draw3DObjects = false
            // must be after pane and draw options set 
            this.turtle.reset()
            this.turtle.setScale_pixelsPerMm(this.realDrawingScale_pixelsPerMm())
            this.turtle.xyz(this.basePoint_pixels().X, this.basePoint_pixels().Y, 0)
            this.turtle.resetBoundsRect(this.basePoint_pixels())
            try {
                this.draw()
            } catch (e) {
                messageForExceptionType(e, "PdPlant.fakeDrawToGetBounds")
            }
            this.setBoundsRect_pixels(this.getTurtleBoundsRect())
            this.enforceMinimumBoundsRect()
            this.expandBoundsRectForLineWidth()
        } finally {
            KfTurtle.defaultStopUsing()
            this.turtle = null
            this.computeBounds = false
        }
    }
    
    drawIntoCache(cache: PdBitmap, size: TPoint, considerDomainScale: boolean, immediate: boolean): void {
        let newScaleX: float
        let newScaleY: float
        let drawPosition: TPoint
        let changed: boolean
        let drawnWidth: float
        let drawnHeight: float
        let bestLeft: long
        let bestTop: long
        
        changed = false
        this.resizeCacheIfNecessary(cache, size, kNotInMainWindow)
        if (immediate) {
            ubmpsupport.fillBitmap(cache, domain.options.backgroundColor)
        }
        this.turtle = KfTurtle.defaultStartUsing()
        try {
            // set starting values 
            this.turtle.drawingSurface.pane = cache.Canvas
            if (!this.fixedPreviewScale) {
                this.drawingScale_PixelsPerMm = 10.0
                drawPosition = new TPoint(cache.Width / 2, cache.Height - 5)
                // 1. draw to figure scale to center boundsRect in cache size 
                this.setTurtleUpForPreviewScratch(this.drawingScale_PixelsPerMm, drawPosition)
                // nothing-messes up paint
                try {
                    this.draw()
                } catch (e) {
                    // pass
                }
                this.setBoundsRect_pixels(this.getTurtleBoundsRect())
                // now change the scale to make the boundsRect fit the drawRect 
                drawnWidth = this.boundsRect_pixels().width
                drawnHeight = this.boundsRect_pixels().height
                if ((drawnWidth > 0) && (drawnHeight > 0)) {
                    newScaleX = safedivExcept(this.drawingScale_PixelsPerMm * size.X, drawnWidth, 0.1)
                    if (considerDomainScale) {
                        newScaleX = safedivExcept(newScaleX, domain.plantDrawScale_PixelsPerMm(), newScaleX)
                    } else {
                        newScaleX = newScaleX * 0.9
                    }
                    newScaleY = safedivExcept(this.drawingScale_PixelsPerMm * size.Y, drawnHeight, 0.1)
                    if (considerDomainScale) {
                        newScaleY = safedivExcept(newScaleY, domain.plantDrawScale_PixelsPerMm(), newScaleY)
                    } else {
                        newScaleY = newScaleY * 0.9
                    }
                    this.drawingScale_PixelsPerMm = min(newScaleX, newScaleY)
                    changed = this.drawingScale_PixelsPerMm !== 1.0
                }
            }
            if (!this.fixedDrawPosition) {
                // draw to find drawPosition that will center new boundsrect in cache 
                drawPosition = new TPoint(cache.Width / 2, cache.Height - 5)
                this.setTurtleUpForPreviewScratch(this.drawingScale_PixelsPerMm, drawPosition)
                // nothing-messes up paint
                try {
                    this.draw()
                } catch (e) {
                    // pass
                }
                this.setBoundsRect_pixels(this.getTurtleBoundsRect())
                bestLeft = cache.Width / 2 - this.boundsRect_pixels().width / 2
                bestTop = cache.Height / 2 - this.boundsRect_pixels().height / 2
                drawPosition.X = drawPosition.X - (this.boundsRect_pixels().Left - bestLeft)
                drawPosition.Y = drawPosition.Y - (this.boundsRect_pixels().Top - bestTop)
                this.drawPositionIfFixed = drawPosition
                // assume it will always have to be moved
                changed = true
            } else {
                drawPosition = this.drawPositionIfFixed
            }
            if ((this.fixedPreviewScale || this.fixedDrawPosition || changed) && (immediate)) {
                // final drawing 
                ubmpsupport.fillBitmap(cache, domain.options.backgroundColor)
                this.setTurtleUpForPreview(this.drawingScale_PixelsPerMm, drawPosition)
                // nothing-messes up paint
                try {
                    this.draw()
                } catch (e) {
                    // pass
                }
            }
        } finally {
            // self.previewCacheUpToDate := true;
            KfTurtle.defaultStopUsing()
            this.turtle = null
            this.useBestDrawingForPreview = false
        }
    }
    
    drawPreviewIntoCache(size: TPoint, considerDomainScale: boolean, immediate: boolean): void {
        try {
            this.drawingIntoPreviewCache = true
            this.drawIntoCache(this.previewCache, size, considerDomainScale, immediate)
            this.previewCacheUpToDate = true
        } finally {
            this.drawingIntoPreviewCache = false
        }
    }
    
    calculateDrawingScaleToFitSize(size: TPoint): void {
        this.drawPreviewIntoCache(size, kConsiderDomainScale, kDontDrawNow)
        this.shrinkPreviewCache()
    }
    
    calculateDrawingScaleToLookTheSameWithDomainScale(): void {
        this.drawingScale_PixelsPerMm = safedivExcept(this.drawingScale_PixelsPerMm, domain.plantManager.plantDrawScale_PixelsPerMm, 0)
    }
    
    shrinkPreviewCache(): void {
        if (this.previewCache === null) {
            // this is to save memory after using the preview cache 
            return
        }
        if ((this.previewCache.Width > 5) || (this.previewCache.Height > 5)) {
            this.previewCache.free
            this.previewCache = ubitmap.PdBitmap().Create()
            this.previewCache.Width = 1
            this.previewCache.Height = 1
            this.previewCache.Transparent = true
            this.previewCache.TransparentMode = delphi_compatability.TTransparentMode.tmFixed
            this.previewCache.TransparentColor = domain.options.backgroundColor
        }
    }
    
    resizeCacheIfNecessary(cache: PdBitmap, size: TPoint, inMainWindow: boolean): void {
        if ((size.X <= 0) || (size.Y <= 0)) {
            return
        }
        // special code to make sure pictures come out all right on 256-color monitors.
        // setting the bitmap pixel format to 24-bit and giving it the global palette stops
        // it from dithering and gets the nearest colors from the palette when drawing.
        // you also need to realize the palette anytime you bitblt (copyRect) from this
        // bitmap to a display surface (timage, paint box, draw grid, etc).
        // use the global function copyBitmapToCanvasWithGlobalPalette in umain.
        ubmpsupport.setPixelFormatBasedOnScreenForBitmap(cache)
        if ((cache.Width !== size.X) || (cache.Height !== size.Y)) {
            try {
                // end special code
                cache.Width = size.X
                cache.Height = size.Y
                if ((inMainWindow) && (cache === this.previewCache)) {
                    umain.MainForm.updateForChangeToPlantBitmaps()
                }
            } catch (e) {
                cache.Width = 1
                cache.Height = 1
                if ((inMainWindow) && (cache === this.previewCache)) {
                    umain.MainForm.exceptionResizingPlantBitmap()
                } else {
                    ShowMessage("Problem creating bitmap; probably not enough memory.")
                }
            }
        }
    }
    
    getTurtleBoundsRect(): TRect {
        let result = new TRect()
        if (this.turtle === null) {
            throw new Error("null turtle in PdPlant.getTurtleBoundsRect")
        }
        result = this.turtle.boundsRect()
        if (this.pRoot.showsAboveGround) {
            result.Bottom = result.Bottom + kExtraForRootTopProblem
        }
        return result
    }
    
    setTurtleUpForPreviewScratch(scale: float, drawPosition: TPoint): void {
        if (this.turtle === null) {
            return
        }
        this.turtle.drawOptions.sortPolygons = false
        this.turtle.drawOptions.drawLines = false
        this.turtle.drawOptions.wireFrame = true
        this.turtle.drawOptions.drawStems = false
        this.turtle.drawOptions.draw3DObjects = false
        this.turtle.drawOptions.circlePoints = false
        // must be after pane and draw options set 
        this.turtle.reset()
        this.turtle.setScale_pixelsPerMm(scale)
        this.turtle.xyz(drawPosition.X, drawPosition.Y, 0)
        this.turtle.resetBoundsRect(drawPosition)
    }
    
    setTurtleUpForPreview(scale: float, drawPosition: TPoint): void {
        if (this.turtle === null) {
            return
        }
        if (!this.useBestDrawingForPreview) {
            this.setTurtleDrawOptionsForNormalDraw(this.turtle)
        } else {
            // this is only for the wizard
            this.turtle.drawOptions.sortPolygons = true
            this.turtle.drawOptions.sortTdosAsOneItem = true
            this.turtle.drawOptions.drawLines = true
            this.turtle.drawOptions.lineContrastIndex = 3
            this.turtle.drawOptions.wireFrame = false
            this.turtle.drawOptions.drawStems = true
            this.turtle.drawOptions.draw3DObjects = true
            this.turtle.drawOptions.draw3DObjectsAsRects = false
            this.turtle.drawOptions.circlePoints = false
        }
        // must be after pane and draw options set 
        this.turtle.reset()
        this.turtle.drawingSurface.foreColor = ColorDefs.clGreen
        this.turtle.drawingSurface.backColor = ColorDefs.clRed
        this.turtle.drawingSurface.lineColor = ColorDefs.clBlue
        this.turtle.setScale_pixelsPerMm(scale)
        this.turtle.xyz(drawPosition.X, drawPosition.Y, 0)
        this.turtle.resetBoundsRect(drawPosition)
    }
    
    getHint(point: TPoint): string {
        let result = ""
        let plantPart: TObject
        let turtle: KfTurtle
        
        result = this.getName()
        if ((umain.MainForm.cursorModeForDrawing === umain.kCursorModePosingSelect) && (umain.MainForm.focusedPlant() === this)) {
            plantPart = null
            plantPart = this.findPlantPartAtPositionByTestingPolygons(point)
            if ((plantPart !== null) && (plantPart instanceof upart.PdPlantPart)) {
                result = (plantPart).getFullName
            }
        }
        return result
    }
    
    findPlantPartAtPositionByTestingPolygons(point: TPoint): TObject {
        let result = new TObject()
        let turtle: KfTurtle
        let partID: long
        
        result = null
        // if you give it no drawing surface pane, everything happens but the actual drawing
        this.drawOn(null)
        turtle = KfTurtle.defaultStartUsing()
        if (turtle === null) {
            return result
        }
        if (turtle.drawingSurface === null) {
            return result
        }
        try {
            partID = turtle.drawingSurface.plantPartIDForPoint(point)
            if (partID >= 0) {
                result = this.plantPartForPartID(partID)
            }
        } finally {
            KfTurtle.defaultStopUsing()
        }
        return result
    }
    
    realDrawingScale_pixelsPerMm(): float {
        let result = 0.0
        if (domain.drawingToMakeCopyBitmap) {
            result = this.drawingScale_PixelsPerMm * domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm
        } else {
            result = this.drawingScale_PixelsPerMm * domain.plantDrawScale_PixelsPerMm()
        }
        return result
    }
    
    basePoint_pixels(): TPoint {
        let result = new TPoint()
        if (!domain.drawingToMakeCopyBitmap) {
            result.X = intround((this.basePoint_mm.x + domain.plantDrawOffset_mm().x) * domain.plantDrawScale_PixelsPerMm())
            result.Y = intround((this.basePoint_mm.y + domain.plantDrawOffset_mm().y) * domain.plantDrawScale_PixelsPerMm())
        } else {
            result.X = intround((this.basePoint_mm.x + domain.plantDrawOffsetWhenDrawingCopy_mm.x) * domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm)
            result.Y = intround((this.basePoint_mm.y + domain.plantDrawOffsetWhenDrawingCopy_mm.y) * domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm)
        }
        return result
    }
    
    setBasePoint_pixels(aPoint_pixels: TPoint): void {
        this.basePoint_mm.x = safedivExcept(aPoint_pixels.X, domain.plantDrawScale_PixelsPerMm(), 0) - domain.plantDrawOffset_mm().x
        this.basePoint_mm.y = safedivExcept(aPoint_pixels.Y, domain.plantDrawScale_PixelsPerMm(), 0) - domain.plantDrawOffset_mm().y
    }
    
    setBoundsRect_pixels(aRect_pixels: TRect): void {
        this.normalBoundsRect_pixels = aRect_pixels
    }
    
    boundsRect_pixels(): TRect {
        let result = new TRect()
        result = this.normalBoundsRect_pixels
        return result
    }
    
    enforceMinimumBoundsRect(): void {
        let theRect: TRect
        
        theRect = this.boundsRect_pixels()
        if (((theRect.Right - theRect.Left) < 1)) {
            theRect.Left = this.basePoint_pixels().X
            theRect.Right = theRect.Left + 1
        }
        if (((theRect.Bottom - theRect.Top) < 1)) {
            theRect.Bottom = this.basePoint_pixels().Y
            theRect.Top = theRect.Bottom - 1
        }
    }
    
    expandBoundsRectForLineWidth(): void {
        const extra = intround(this.maximumLineWidth() * this.realDrawingScale_pixelsPerMm()) + 1
        const theRect = this.boundsRect_pixels().inflate(extra, extra)
        this.setBoundsRect_pixels(theRect)
    }
    
    maximumLineWidth(): float {
        let result = 0.0
        result = 0.0
        if (this.pLeaf.petioleWidthAtOptimalBiomass_mm > result) {
            result = this.pLeaf.petioleWidthAtOptimalBiomass_mm
        }
        if (this.pInternode.widthAtOptimalFinalBiomassAndExpansion_mm > result) {
            result = this.pInternode.widthAtOptimalFinalBiomassAndExpansion_mm
        }
        if (this.pInflor[kGenderMale].internodeWidth_mm > result) {
            result = this.pInflor[kGenderMale].internodeWidth_mm
        }
        if (this.pInflor[kGenderFemale].internodeWidth_mm > result) {
            result = this.pInflor[kGenderFemale].internodeWidth_mm
        }
        return result
    }
    
    moveBy(delta_pixels: TPoint): void {
        let delta_mm: SinglePoint
        let theRect: TRect
        
        theRect = this.boundsRect_pixels()
        theRect.Left = theRect.Left + delta_pixels.X
        theRect.Right = theRect.Right + delta_pixels.X
        theRect.Top = theRect.Top + delta_pixels.Y
        theRect.Bottom = theRect.Bottom + delta_pixels.Y
        delta_mm.x = safedivExcept(delta_pixels.X, domain.plantDrawScale_PixelsPerMm(), 0)
        delta_mm.y = safedivExcept(delta_pixels.Y, domain.plantDrawScale_PixelsPerMm(), 0)
        this.basePoint_mm.x = this.basePoint_mm.x + delta_mm.x
        this.basePoint_mm.y = this.basePoint_mm.y + delta_mm.y
    }
    
    moveTo(aPoint_pixels: TPoint): void {
        let oldBasePoint_pixels: TPoint
        let theRect: TRect
        
        oldBasePoint_pixels = this.basePoint_pixels()
        theRect = this.boundsRect_pixels()
        theRect.Left = theRect.Left + aPoint_pixels.X - oldBasePoint_pixels.X
        theRect.Right = theRect.Right + aPoint_pixels.X - oldBasePoint_pixels.X
        theRect.Top = theRect.Top + aPoint_pixels.Y - oldBasePoint_pixels.Y
        theRect.Bottom = theRect.Bottom + aPoint_pixels.Y - oldBasePoint_pixels.Y
        this.setBasePoint_pixels(aPoint_pixels)
    }
    
    includesPoint(aPoint: TPoint): boolean {
        let result = false
        result = this.boundsRectIncludesPoint(aPoint, this.boundsRect_pixels(), true)
        return result
    }
    
    boundsRectIncludesPoint(aPoint: TPoint, boundsRect: TRect, checkResizeRect: boolean): boolean {
        let result = false
        let xPixel: long
        let yPixel: long
        let i: long
        
        result = boundsRect.contains(aPoint)
        if (result && domain.options.cachePlantBitmaps) {
            if (checkResizeRect && this.resizingRect().contains(aPoint)) {
                result = true
            } else {
                xPixel = aPoint.X - boundsRect.Left
                yPixel = aPoint.Y - boundsRect.Top
                result = this.pointColorMatch(xPixel, yPixel)
                if ((!result) && (domain.options.cachePlantBitmaps)) {
                    for (i = 0; i <= 7; i++) {
                        if (this.pointColorAdjacentMatch(xPixel, yPixel, i)) {
                            result = true
                            return result
                        }
                    }
                }
            }
        }
        return result
    }
    
    pointInBoundsRect(aPoint: TPoint): boolean {
        let result = false
        result = this.normalBoundsRect_pixels.contains(aPoint)
        return result
    }
    
    pointColorMatch(xPixel: long, yPixel: long): boolean {
        let result = false
        let testPixelColor: TColor
        
        testPixelColor = this.previewCache.Canvas.Pixels[xPixel, yPixel]
        result = testPixelColor !== domain.options.transparentColor
        return result
    }
    
    pointColorAdjacentMatch(xPixel: long, yPixel: long, position: long): boolean {
        let result = false
        let testPixelColor: TColor
        let x: long
        let y: long
        
        x = xPixel
        y = yPixel
        switch (position) {
            case 0:
                // 0 1 2
                // 3 x 4
                // 5 6 7
                x = xPixel - 1
                y = yPixel - 1
                break
            case 1:
                x = xPixel + 0
                y = yPixel - 1
                break
            case 2:
                x = xPixel + 1
                y = yPixel - 1
                break
            case 3:
                x = xPixel - 1
                y = yPixel + 0
                break
            case 4:
                // point x := xPixel + 0; y := yPixel + 0; this is the point already tested
                x = xPixel + 1
                y = yPixel + 0
                break
            case 5:
                x = xPixel - 1
                y = yPixel + 1
                break
            case 6:
                x = xPixel + 0
                y = yPixel + 1
                break
            case 7:
                x = xPixel + 1
                y = yPixel + 1
                break
        }
        testPixelColor = this.previewCache.Canvas.Pixels[x, y]
        result = testPixelColor !== domain.options.transparentColor
        return result
    }
    
    saveToGlobal3DOutputFile(indexOfPlant: short, translate: boolean, rectWithAllPlants: TRect, outputType: short, aTurtle: KfTurtle): void {
        let remPoints: KfPoint3D[] = [new KfPoint3D(), new KfPoint3D(), new KfPoint3D(), new KfPoint3D()]
        let remWidth: float
        let fileExportSurface: KfFileExportSurface
        let relativeBasePoint_mm: SinglePoint
        let i: int
        let fixRotation: short
        
        if (this.firstPhytomer === null) {
            return
        }
        this.turtle = aTurtle
        if (this.turtle === null) {
            throw new Error("Problem: Nil turtle in PdPlant.saveToGlobal3DOutputFile.")
        }
        fileExportSurface = this.turtle.fileExportSurface()
        if (this.turtle === null) {
            throw new Error("Problem: Nil export surface in PdPlant.saveToGlobal3DOutputFile.")
        }
        this.setUpTurtleFor3DOutput()
        if (translate) {
            relativeBasePoint_mm.x = safedivExcept(this.basePoint_pixels().X - rectWithAllPlants.Left, domain.plantDrawScale_PixelsPerMm(), 0) - domain.plantDrawOffset_mm().x
            relativeBasePoint_mm.y = safedivExcept(this.basePoint_pixels().Y - rectWithAllPlants.Top, domain.plantDrawScale_PixelsPerMm(), 0) - domain.plantDrawOffset_mm().y
            if (outputType !== ExportFormats.kPOV) {
                // move plant to translate, except for for POV, where you translate and scale afterward
                this.turtle.xyz(relativeBasePoint_mm.x, relativeBasePoint_mm.y, 0)
            } else {
                fileExportSurface.setTranslationForCurrentPlant(translate, relativeBasePoint_mm.x, relativeBasePoint_mm.y)
            }
        }
        this.turtle.writingTo = outputType
        fileExportSurface.startPlant(this.name, indexOfPlant)
        if (outputType === ExportFormats.k3DS) {
            for (i = 0; i <= u3dexport.kExportPartLast; i++) {
                // for 3DS need to write out all colors in front especially; must be done before reminder
                (fileExportSurface).writeMaterialDescription(i, this.colorForDXFPartType(i))
            }
            if (!domain.registered) {
                (fileExportSurface).writeMaterialDescription(-1, UNRESOLVED.rgb(100, 100, 100))
            }
        }
        switch (outputType) {
            case ExportFormats.kDXF:
                // these rotations are to fix consistent misrotations - the option sits on top of them
                // comes out sideways
                fixRotation = 64
                break
            case ExportFormats.kPOV:
                // okay
                fixRotation = 0
                break
            case ExportFormats.k3DS:
                // comes out sideways
                fixRotation = 64
                break
            case ExportFormats.kOBJ:
                // okay
                fixRotation = 0
                break
            case ExportFormats.kVRML:
                // okay
                fixRotation = 0
                break
            case ExportFormats.kLWO:
                // comes out upside down
                fixRotation = 128
                break
            default:
                throw new Error("Problem: Invalid export type in PdPlant.saveToGlobal3DOutputFile.")
                break
        }
        this.turtle.rotateX(fixRotation)
        // this is a user-specified turn on top of the default
        this.turtle.rotateX(domain.exportOptionsFor3D[outputType].xRotationBeforeDraw * 256.0 / 360.0)
        if (!domain.registered) {
            remWidth = this.realDrawingScale_pixelsPerMm() * 5.0
            this.turtle.push()
            this.turtle.moveInMillimeters(remWidth / 2)
            this.turtle.rotateY(64)
            this.turtle.moveInMillimeters(remWidth / 2)
            remPoints[0] = this.turtle.position()
            this.turtle.rotateY(64)
            this.turtle.moveInMillimeters(remWidth)
            remPoints[1] = this.turtle.position()
            this.turtle.rotateY(64)
            this.turtle.moveInMillimeters(remWidth)
            remPoints[2] = this.turtle.position()
            this.turtle.rotateY(64)
            this.turtle.moveInMillimeters(remWidth)
            remPoints[3] = this.turtle.position()
            this.turtle.pop()
            fileExportSurface.writeRegistrationReminder(remPoints[0], remPoints[1], remPoints[2], remPoints[3])
        }
        this.draw()
        fileExportSurface.endPlant()
    }
    
    setUpTurtleFor3DOutput(): void {
        if (!this.turtle) throw new Error("turtle is null")
        this.turtle.drawOptions.sortPolygons = false
        this.turtle.drawOptions.drawLines = false
        this.turtle.drawOptions.lineContrastIndex = 0
        this.turtle.drawOptions.wireFrame = false
        this.turtle.drawOptions.drawStems = true
        this.turtle.drawOptions.draw3DObjects = true
        this.turtle.drawOptions.draw3DObjectsAsRects = false
        this.turtle.drawOptions.circlePoints = false
        // must be after pane and draw options set 
        this.turtle.reset()
        this.turtle.setScale_pixelsPerMm(this.realDrawingScale_pixelsPerMm())
        this.turtle.drawingSurface.foreColor = ColorDefs.clGreen
        this.turtle.drawingSurface.backColor = ColorDefs.clRed
        this.turtle.drawingSurface.lineColor = ColorDefs.clBlue
        this.turtle.xyz(0, 0, 0)
        this.turtle.resetBoundsRect(new TPoint(0, 0))
    }
    
    // ----------------------------------------------------------------------------------  i/o and data transfer 
    defaultAllParameters(): void {
        let param: PdParameter

        if (domain.parameterManager.parameters.Count > 0) {
            for (let i = 0; i < domain.parameterManager.parameters.Count; i++) {
                param = uparams.PdParameter(domain.parameterManager.parameters.Items[i])
                if (param.fieldType !== uparams.kFieldHeader) {
                    this.defaultParameter(param, kDontCheckForUnreadParams)
                }
            }
        }
        this.finishLoadingOrDefaulting(kDontCheckForUnreadParams)
    }
    
    defaultParameter(param: PdParameter, writeDebugMessage: boolean): void {
        let tempBoolean: boolean
        let tempSmallint: short
        let tempLongint: long
        let tempFloat: float
        let tempColorRef: TColorRef
        let tempSCurve: SCurveStructure
        let tempTdo: KfObject3D
        
        if (param === null) {
            return
        }
        switch (param.fieldType) {
            case uparams.kFieldBoolean:
                tempBoolean = usupport.strToBool(param.defaultValueString())
                tempBoolean = this.transferField(kSetField, tempBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldSmallint:
                tempSmallint = StrToIntDef(usupport.stringUpTo(param.defaultValueString(), " "), 0)
                tempSmallint = this.transferField(kSetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldEnumeratedList:
                tempSmallint = StrToIntDef(usupport.stringUpTo(param.defaultValueString(), " "), 0)
                tempSmallint = this.transferField(kSetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldLongint:
                tempLongint = StrToIntDef(param.defaultValueString(), 0)
                tempLongint = this.transferField(kSetField, tempLongint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldColor:
                tempColorRef = usupport.rgbStringToColor(param.defaultValueString())
                tempColorRef = this.transferField(kSetField, tempColorRef, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldFloat:
                if (param.indexType === uparams.kIndexTypeSCurve) {
                    // this is the only array
                    this.changingWholeSCurves = true
                    tempSCurve = stringToSCurve(param.defaultValueString())
                    this.transferWholeSCurve(kSetField, tempSCurve, param.fieldNumber, param.fieldType, false, null)
                    this.changingWholeSCurves = false
                } else {
                    tempFloat = boundForString(param.defaultValueString(), uparams.kFieldFloat)
                    tempFloat = this.transferField(kSetField, tempFloat, param.fieldNumber, param.fieldType, 0, false, null)
                }
                break
            case uparams.kFieldThreeDObject:
                tempTdo = new KfObject3D()
                try {
                    tempTdo.readFromInputString(param.defaultValueString(), utdo.kAdjustForOrigin)
                    tempTdo = this.transferField(kSetField, tempTdo, param.fieldNumber, param.fieldType, 0, false, null)
                } finally {
                    tempTdo.free
                    tempTdo = null
                }
                break
        }
        if (writeDebugMessage) {
            DebugPrint("Plant <" + this.name + "> parameter <" + param.name + "> defaulted to <" + param.defaultValueString() + ">")
        }
    }
    
    writeToMainFormMemoAsText(): void {
        let fakeTextFile: TextFile
        
        this.writingToMemo = true
        try {
            this.writeToPlantFile(fakeTextFile)
        } finally {
            this.writingToMemo = false
        }
    }
    
    writeLine(plantFile: TextFile, aString: string): void {
        if (this.writingToMemo) {
            umain.MainForm.plantsAsTextMemo.Lines.Add(aString)
        } else {
            writeln(plantFile, aString)
        }
    }
    
    writeToPlantFile(plantFile: TextFile): void {
        let section: PdSection
        let param: PdParameter
        let i: short
        let j: short
        let tempBoolean: boolean
        let tempSmallint: short
        let tempLongint: long
        let tempFloat: float
        let tempColorRef: TColorRef
        let tempSCurve: SCurveStructure
        let tempTdo: KfObject3D
        let start: string
        let stop: string
        
        if (umain.MainForm !== null) {
            // v2.0 saving selection state in main window
            this.selectedWhenLastSaved = umain.MainForm.isSelected(this)
        } else {
            this.selectedWhenLastSaved = false
        }
        start = " ["
        stop = "] ="
        // v2.0
        this.writeLine(plantFile, "[" + this.name + "] " + kPlantAsTextStartString + " <v2.0>")
        if (this.noteLines.Count > 0) {
            this.writeLine(plantFile, kStartNoteString)
            for (i = 0; i <= this.noteLines.Count - 1; i++) {
                this.writeLine(plantFile, this.noteLines.Strings[i])
            }
            this.writeLine(plantFile, kEndNoteString)
        }
        if (domain.sectionManager.sections.Count > 0) {
            for (i = 0; i <= domain.sectionManager.sections.Count - 1; i++) {
                section = usection.PdSection(domain.sectionManager.sections.Items[i])
                if (section === null) {
                    continue
                }
                // write out section header with name 
                this.writeLine(plantFile, "; ------------------------- " + section.getName())
                for (j = 0; j <= section.numSectionItems - 1; j++) {
                    // write out params 
                    param = domain.parameterManager.parameterForFieldNumber(section.sectionItems[j])
                    if (param === null) {
                        continue
                    }
                    switch (param.fieldType) {
                        case uparams.kFieldHeader:
                            break
                        case uparams.kFieldBoolean:
                            // skip
                            tempBoolean = this.transferField(kGetField, tempBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                            this.writeLine(plantFile, param.name + start + param.fieldID + stop + usupport.boolToStr(tempBoolean))
                            break
                        case uparams.kFieldSmallint:
                            tempSmallint = this.transferField(kGetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                            this.writeLine(plantFile, param.name + start + param.fieldID + stop + IntToStr(tempSmallint))
                            break
                        case uparams.kFieldEnumeratedList:
                            tempSmallint = this.transferField(kGetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                            this.writeLine(plantFile, param.name + start + param.fieldID + stop + IntToStr(tempSmallint))
                            break
                        case uparams.kFieldLongint:
                            tempLongint = this.transferField(kGetField, tempLongint, param.fieldNumber, param.fieldType, 0, false, null)
                            this.writeLine(plantFile, param.name + start + param.fieldID + stop + IntToStr(tempLongint))
                            break
                        case uparams.kFieldColor:
                            tempColorRef = this.transferField(kGetField, tempColorRef, param.fieldNumber, param.fieldType, 0, false, null)
                            this.writeLine(plantFile, param.name + start + param.fieldID + stop + IntToStr(tempColorRef))
                            break
                        case uparams.kFieldFloat:
                            if (param.indexType === uparams.kIndexTypeSCurve) {
                                // this is the only array
                                this.transferWholeSCurve(kGetField, tempSCurve, param.fieldNumber, param.fieldType, false, null)
                                this.writeLine(plantFile, param.name + start + param.fieldID + stop + umath.sCurveToString(tempSCurve))
                            } else {
                                tempFloat = this.transferField(kGetField, tempFloat, param.fieldNumber, param.fieldType, 0, false, null)
                                this.writeLine(plantFile, param.name + start + param.fieldID + stop + usupport.digitValueString(tempFloat))
                            }
                            break
                        case uparams.kFieldThreeDObject:
                            tempTdo = new KfObject3D()
                            try {
                                tempTdo = this.transferField(kGetField, tempTdo, param.fieldNumber, param.fieldType, 0, false, null)
                                this.writeLine(plantFile, param.name + start + param.fieldID + stop + tempTdo.name)
                                if (this.writingToMemo) {
                                    tempTdo.writeToMemo(umain.MainForm.plantsAsTextMemo)
                                } else {
                                    tempTdo.writeToFileStream(plantFile, utdo.kEmbeddedInPlant)
                                }
                            } finally {
                                tempTdo.free
                                tempTdo = null
                            }
                            break
                    }
                }
            }
        }
        if (this.amendments.Count > 0) {
            for (i = 0; i <= this.amendments.Count - 1; i++) {
                if (this.writingToMemo) {
                    uamendmt.PdPlantDrawingAmendment(this.amendments.Items[i]).writeToMemo(umain.MainForm.plantsAsTextMemo)
                } else {
                    uamendmt.PdPlantDrawingAmendment(this.amendments.Items[i]).writeToTextFile(plantFile)
                }
            }
        }
        // v2.0
        this.writeLine(plantFile, "; ------------------------- " + kPlantAsTextEndString + " " + this.getName() + " <v2.0>")
        this.writeLine(plantFile, "")
    }
    
    readLineAndTdoFromPlantFile(aLine: string, plantFile: TextFile): void {
        let tempBoolean: boolean
        let tempSmallint: short
        let tempLongint: long
        let tempFloat: float
        let tempColorRef: TColorRef
        let tempSCurve: SCurveStructure
        let i: short
        let param: PdParameter
        let secondLine: string
        let noteLine: string
        let nameAndFieldID: string
        let fieldID: string
        let paramValue: string
        let tempTdo: KfObject3d
        let found: boolean
        let newAmendment: PdPlantDrawingAmendment
        
        if (UNRESOLVED.pos(uppercase(kStartNoteString), uppercase(aLine)) > 0) {
            // read note if this line starts it
            // this only will happen if in file
            this.noteLines.Clear()
            while (!UNRESOLVED.eof(plantFile)) {
                noteLine = usupport.tolerantReadln(plantFile, noteLine)
                if ((UNRESOLVED.pos(uppercase(kEndNoteString), uppercase(noteLine)) > 0) && (this.noteLines.Count < 5000)) {
                    break
                } else {
                    this.noteLines.Add(noteLine)
                }
            }
            // added v2.0, no use reading other stuff when finished with note
            return
        }
        if (UNRESOLVED.pos(uamendmt.kStartAmendmentString, aLine) > 0) {
            // read amendment if line is an amendment - v2.0
            newAmendment = uamendmt.PdPlantDrawingAmendment().create()
            if (this.readingFromMemo) {
                this.readingMemoLine = newAmendment.readFromMemo(umain.MainForm.plantsAsTextMemo, this.readingMemoLine)
            } else {
                newAmendment.readFromTextFile(plantFile)
            }
            this.addAmendment(newAmendment)
            return
        }
        if ((UNRESOLVED.pos("[", aLine) <= 0) || (UNRESOLVED.pos("=", aLine) <= 0)) {
            if (this.readingFromMemo) {
                // v2.0 fix lines broken before [ or = (does NOT fix lines broken within strings)
                // this has to come AFTER we deal with notes and amendments; it applies to parameters only
                secondLine = umain.MainForm.plantsAsTextMemo.Lines.Strings[this.readingMemoLine]
            } else {
                secondLine = usupport.tolerantReadln(plantFile, secondLine)
            }
            this.readingMemoLine += 1
            DebugPrint("plant <" + this.name + "> line <" + aLine + "> merged with <" + secondLine + ">")
            aLine = aLine + " " + secondLine
        }
        nameAndFieldID = usupport.stringUpTo(aLine, "=")
        fieldID = usupport.stringBeyond(nameAndFieldID, "[")
        fieldID = usupport.stringUpTo(fieldID, "]")
        if (UNRESOLVED.pos("header", fieldID) > 0) {
            return
        }
        paramValue = usupport.stringBeyond(aLine, "=")
        found = false
        param = null
        if (domain.parameterManager.parameters.Count > 0) {
            for (i = 0; i <= domain.parameterManager.parameters.Count - 1; i++) {
                param = uparams.PdParameter(domain.parameterManager.parameters.Items[i])
                if (param === null) {
                    return
                }
                if (param.fieldID === fieldID) {
                    found = true
                    break
                }
            }
        }
        if (!found) {
            return
        }
        switch (param.fieldType) {
            case uparams.kFieldHeader:
                break
            case uparams.kFieldBoolean:
                // skip
                tempBoolean = usupport.strToBool(paramValue)
                tempBoolean = this.transferField(kSetField, tempBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldSmallint:
                tempSmallint = StrToIntDef(paramValue, 0)
                if ((param.lowerBound() !== 0) || (param.upperBound() !== 0)) {
                    if (tempSmallint < intround(param.lowerBound())) {
                        // if both bounds are zero, it means not to check them 
                        tempSmallint = intround(param.lowerBound())
                    }
                    if (tempSmallint > intround(param.upperBound())) {
                        tempSmallint = intround(param.upperBound())
                    }
                }
                tempSmallint = this.transferField(kSetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldEnumeratedList:
                tempSmallint = StrToIntDef(paramValue, 0)
                if ((param.lowerBound() !== 0) || (param.upperBound() !== 0)) {
                    if (tempSmallint < intround(param.lowerBound())) {
                        // if both bounds are zero, it means not to check them 
                        tempSmallint = intround(param.lowerBound())
                    }
                    if (tempSmallint > intround(param.upperBound())) {
                        tempSmallint = intround(param.upperBound())
                    }
                }
                tempSmallint = this.transferField(kSetField, tempSmallint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldLongint:
                tempLongint = StrToIntDef(paramValue, 0)
                if ((param.lowerBound() !== 0) || (param.upperBound() !== 0)) {
                    if (tempLongint < intround(param.lowerBound())) {
                        // if both bounds are zero, it means not to check them 
                        tempLongint = intround(param.lowerBound())
                    }
                    if (tempLongint > intround(param.upperBound())) {
                        tempLongint = intround(param.upperBound())
                    }
                }
                if (param.fieldNumber === utransfr.kStateBasePointY) {
                    tempLongint = tempLongint
                }
                tempLongint = this.transferField(kSetField, tempLongint, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldColor:
                tempColorRef = StrToIntDef(paramValue, 0)
                tempColorRef = this.transferField(kSetField, tempColorRef, param.fieldNumber, param.fieldType, 0, false, null)
                break
            case uparams.kFieldFloat:
                if (param.indexType === uparams.kIndexTypeSCurve) {
                    // this is the only array
                    this.changingWholeSCurves = true
                    tempSCurve = umath.stringToSCurve(paramValue)
                    if ((tempSCurve.x1 <= 0.0) || (tempSCurve.y1 <= 0.0) || (tempSCurve.x2 <= 0.0) || (tempSCurve.y2 <= 0.0) || (tempSCurve.x1 >= 1.0) || (tempSCurve.y1 >= 1.0) || (tempSCurve.x2 >= 1.0) || (tempSCurve.y2 >= 1.0)) {
                        // bound s curve
                        // all s curve values (x and y) must be between 0 and 1 EXCLUSIVE
                        // if not in this range, set whole curve to reasonable values
                        // instead of raising exception, just hard-code whole curve to acceptable values
                        // don't use Parameters.tab default in case that was read in wrong also
                        tempSCurve.x1 = 0.25
                        tempSCurve.y1 = 0.1
                        tempSCurve.x2 = 0.65
                        tempSCurve.y2 = 0.85
                    }
                    this.transferWholeSCurve(kSetField, tempSCurve, param.fieldNumber, param.fieldType, false, null)
                    this.changingWholeSCurves = false
                } else {
                    tempFloat = usupport.boundForString(paramValue, uparams.kFieldFloat, tempFloat)
                    if (UNRESOLVED.pos("Drawing scale", param.name) > 0) {
                        tempTdo = null
                    }
                    if ((param.lowerBound() !== 0) || (param.upperBound() !== 0)) {
                        if (tempFloat < param.lowerBound()) {
                            // if both bounds are zero, it means not to check them 
                            tempFloat = param.lowerBound()
                        }
                        if (tempFloat > param.upperBound()) {
                            tempFloat = param.upperBound()
                        }
                    }
                    tempFloat = this.transferField(kSetField, tempFloat, param.fieldNumber, param.fieldType, 0, false, null)
                }
                break
            case uparams.kFieldThreeDObject:
                tempTdo = new KfObject3D()
                try {
                    tempTdo.setName(usupport.trimLeftAndRight(paramValue))
                    if (this.readingFromMemo) {
                        this.readingMemoLine = tempTdo.readFromMemo(umain.MainForm.plantsAsTextMemo, this.readingMemoLine)
                    } else {
                        tempTdo.readFromFileStream(plantFile, utdo.kEmbeddedInPlant)
                    }
                    tempTdo = this.transferField(kSetField, tempTdo, param.fieldNumber, param.fieldType, 0, false, null)
                } finally {
                    tempTdo.free
                    tempTdo = null
                }
                break
        }
        param.valueHasBeenReadForCurrentPlant = true
    }
    
    finishLoadingOrDefaulting(checkForUnreadParams: boolean): void {
        let param: PdParameter
        let i: short
        
        if (checkForUnreadParams) {
            if (domain.parameterManager.parameters.Count > 0) {
                for (i = 0; i <= domain.parameterManager.parameters.Count - 1; i++) {
                    param = uparams.PdParameter(domain.parameterManager.parameters.Items[i])
                    if ((!param.valueHasBeenReadForCurrentPlant) && (param.fieldType !== uparams.kFieldHeader)) {
                        this.defaultParameter(param, checkForUnreadParams)
                    }
                }
            }
        }
        this.pGeneral.ageAtWhichFloweringStarts = umath.intMin(this.pGeneral.ageAtWhichFloweringStarts, this.pGeneral.ageAtMaturity)
        this.age = umath.intMin(this.age, this.pGeneral.ageAtMaturity)
        umath.calcSCurveCoeffs(this.pGeneral.growthSCurve)
        umath.calcSCurveCoeffs(this.pFruit.sCurveParams)
        umath.calcSCurveCoeffs(this.pLeaf.sCurveParams)
        this.regrow()
    }
    
    editTransferField(d: int, value: FIX_MISSING_ARG_TYPE, fieldID: int, fieldType: int, fieldIndex: int, regrow: boolean): void {
        let updateList: TListCollection
        
        if (fieldType === uparams.kFieldHeader) {
            return value
        }
        if ((d === kGetField)) {
            value = this.transferField(d, value, fieldID, fieldType, fieldIndex, regrow, null)
        } else {
            updateList = ucollect.TListCollection().Create()
            try {
                value = this.transferField(d, value, fieldID, fieldType, fieldIndex, regrow, updateList)
                if (updateList.Count > 0) {
                    umain.MainForm.updateParameterValuesWithUpdateListForPlant(this, updateList)
                    if ((domain.options.updateTimeSeriesPlantsOnParameterChange) && (utimeser.TimeSeriesForm !== null)) {
                        utimeser.TimeSeriesForm.updatePlantsFromParent(this)
                    }
                }
            } finally {
                updateList.free
                updateList = null
            }
        }
        if ((d === kSetField) && regrow) {
            this.regrow()
        }
        return value
    }
    
    transferField(d: int, v: FIX_MISSING_ARG_TYPE, fieldID: short, ft: short, index: short, regrow: boolean, updateList: TListCollection): void {
        if (ft === uparams.kFieldHeader) {
            return v
        }
        v = this.directTransferField(d, v, fieldID, ft, index, updateList)
        if (d === kSetField) {
            switch (fieldID) {
                case utransfr.kFruitSCurve:
                    if (!this.changingWholeSCurves) {
                        // cfk fix: should be not allowing to change these to values that don't work 
                        umath.calcSCurveCoeffs(this.pFruit.sCurveParams)
                    }
                    break
                case utransfr.kGeneralGrowthSCurve:
                    if (!this.changingWholeSCurves) {
                        umath.calcSCurveCoeffs(this.pGeneral.growthSCurve)
                    }
                    break
                case utransfr.kLeafSCurve:
                    if (!this.changingWholeSCurves) {
                        umath.calcSCurveCoeffs(this.pLeaf.sCurveParams)
                    }
                    break
                case utransfr.kGeneralAgeAtMaturity:
                    if ((this.age > v)) {
                        this.setAge(v)
                    }
                    break
            }
            if ((ft === uparams.kFieldColor)) {
                this.needToRecalculateColors = true
            }
        }
        return v
    }
    
    directTransferField(d: int, v: FIX_MISSING_ARG_TYPE, fieldID: short, ft: short, index: short, updateList: TListCollection): void {
        if (fieldID <= 200) {
            // switch-over point is hard-coded and must be identical to that set in PlantStudio Utility program
            // that generates utransfr.pas
            v = utransfr.Plant_directTransferField(this, v, d, fieldID, ft, index, updateList)
        } else {
            v = utransfr.Plant_directTransferField_SecondPart(this, v, d, fieldID, ft, index, updateList)
        }
        if (updateList !== null) {
            this.addToUpdateList(fieldID, updateList)
        }
        return v
    }
    
    addToUpdateList(fieldID: int, updateList: TListCollection): void {
        let updateEvent: PdPlantUpdateEvent
        
        if (updateList === null) {
            return
        }
        updateEvent = PdPlantUpdateEvent.create
        updateEvent.plant = this
        updateEvent.fieldID = fieldID
        updateList.Add(updateEvent)
    }
    
    fillEnumStringList(list: TStringList, fieldID: int, hasRadioButtons: boolean): void {
        switch (fieldID) {
            case utransfr.kLeafCompoundPinnateOrPalmate:
                // assumes list being given to it is empty 
                list.Add("pinnate (feather-like)")
                list.Add("palmate (hand-like)")
                hasRadioButtons = true
                break
            case utransfr.kMeristemAndLeafArrangement:
                list.Add("alternate (one per node)")
                list.Add("opposite (two per node)")
                hasRadioButtons = true
                break
            case utransfr.kLeafCompoundPinnateArrangement:
                list.Add("alternate")
                list.Add("opposite")
                hasRadioButtons = true
                break
            case utransfr.kFlowerFemaleBudOption:
                list.Add("no bud")
                list.Add("single 3D object bud (old style)")
                list.Add("unfolding flower (new style)")
                hasRadioButtons = true
                break
            case utransfr.kFlowerMaleBudOption:
                list.Add("no bud")
                list.Add("single 3D object bud (old style)")
                list.Add("unfolding flower (new style)")
                hasRadioButtons = true
                break
            default:
                throw new Error("Problem: Unknown field for plant string list " + IntToStr(fieldID) + " in method PdPlant.fillEnumStringList.")
                break
        }
        return hasRadioButtons
    }
    
    transferObject3D(direction: int, myTdo: KfObject3D, otherTdo: KfObject3D): void {
        if ((myTdo === null) || (otherTdo === null)) {
            // assumption: both tdos exist 
            throw new Error("Problem: Nil 3D object in method PdPlant.transferObject3D.")
        }
        if (direction === kSetField) {
            myTdo.copyFrom(otherTdo)
        } else {
            otherTdo.copyFrom(myTdo)
        }
    }
    
    transferWholeSCurve(direction: short, value: SCurveStructure, fieldNumber: short, fieldType: short, regrow: boolean, updateList: TListCollection): void {
        value.x1 = this.transferField(direction, value.x1, fieldNumber, fieldType, 0, regrow, updateList)
        value.y1 = this.transferField(direction, value.y1, fieldNumber, fieldType, 1, regrow, updateList)
        value.x2 = this.transferField(direction, value.x2, fieldNumber, fieldType, 2, regrow, updateList)
        value.y2 = this.transferField(direction, value.y2, fieldNumber, fieldType, 3, regrow, updateList)
    }
    
    MFD(objectValue: FIX_MISSING_ARG_TYPE, value: FIX_MISSING_ARG_TYPE, fieldType: int, direction: int): void {
        if (direction === kGetField) {
            switch (fieldType) {
                case uparams.kFieldFloat:
                    // MFD = MoveFieldData
                    value = objectValue
                    break
                case uparams.kFieldSmallint:
                    value = objectValue
                    break
                case uparams.kFieldLongint:
                    value = objectValue
                    break
                case uparams.kFieldColor:
                    delphi_compatability.TColorRef(value) = delphi_compatability.TColorRef(objectValue)
                    break
                case uparams.kFieldBoolean:
                    value = objectValue
                    break
                case uparams.kFieldEnumeratedList:
                    value = objectValue
                    break
                default:
                    throw new Error("Problem: Unsupported transfer from field " + IntToStr(fieldType) + " in method PdPlant.MFD.")
                    break
            }
        } else if (direction === kSetField) {
            switch (fieldType) {
                case uparams.kFieldFloat:
                    objectValue = value
                    break
                case uparams.kFieldSmallint:
                    objectValue = value
                    break
                case uparams.kFieldLongint:
                    objectValue = value
                    break
                case uparams.kFieldColor:
                    delphi_compatability.TColorRef(objectValue) = delphi_compatability.TColorRef(value)
                    break
                case uparams.kFieldBoolean:
                    objectValue = value
                    break
                case uparams.kFieldEnumeratedList:
                    objectValue = value
                    break
                default:
                    throw new Error("Problem: Unsupported transfer to field " + IntToStr(fieldType) + " in method PdPlant.MFD.")
                    break
            }
        }
        return objectValue, value
    }
    
    // ------------------------------------------------------------------------------- breeding 
    useBreedingOptionsAndPlantsToSetParameters(options: BreedingAndTimeSeriesOptionsStructure, firstPlant: PdPlant, secondPlant: PdPlant, tdos: TListCollection): void {
        let firstBoolean: boolean
        let secondBoolean: boolean
        let newBoolean: boolean
        let firstInteger: short
        let secondInteger: short
        let newInteger: short
        let firstFloat: float
        let secondFloat: float
        let newFloat: float
        let firstColor: TColorRef
        let secondColor: TColorRef
        let newColor: TColorRef
        let firstSCurve: SCurveStructure
        let secondSCurve: SCurveStructure
        let newSCurve: SCurveStructure
        let firstTdo: KfObject3D
        let secondTdo: KfObject3D
        let newTdo: KfObject3D
        let randomTdo: KfObject3D
        let sectionIndex: short
        let paramIndex: short
        let saveAge: short
        let weight: float
        let stdDev: float
        let param: PdParameter
        let section: PdSection
        
        if (firstPlant === null) {
            return
        }
        saveAge = this.age
        this.reset()
        if (domain.sectionManager.sections.Count > 0) {
            for (sectionIndex = 0; sectionIndex <= domain.sectionManager.sections.Count - 1; sectionIndex++) {
                section = usection.PdSection(domain.sectionManager.sections.Items[sectionIndex])
                if (section === null) {
                    continue
                }
                for (paramIndex = 0; paramIndex <= section.numSectionItems - 1; paramIndex++) {
                    param = domain.parameterManager.parameterForFieldNumber(section.sectionItems[paramIndex])
                    if ((param === null) || (param.fieldType === uparams.kFieldHeader)) {
                        continue
                    }
                    // case
                    switch (param.fieldType) {
                        case uparams.kFieldBoolean:
                            // non-numeric
                            firstBoolean = firstPlant.transferField(kGetField, firstBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                            if (secondPlant === null) {
                                newBoolean = firstBoolean
                            } else {
                                secondBoolean = secondPlant.transferField(kGetField, secondBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                                if (this.pickPlantToCopyNonNumericalParameterFrom(options, sectionIndex) === kFromFirstPlant) {
                                    newBoolean = firstBoolean
                                } else {
                                    newBoolean = secondBoolean
                                }
                            }
                            newBoolean = this.transferField(kSetField, newBoolean, param.fieldNumber, param.fieldType, 0, false, null)
                            break
                        case uparams.kFieldSmallint:
                            // numeric
                            newInteger = 0
                            firstInteger = firstPlant.transferField(kGetField, firstInteger, param.fieldNumber, param.fieldType, 0, false, null)
                            if (secondPlant === null) {
                                newInteger = firstInteger
                            } else {
                                secondInteger = secondPlant.transferField(kGetField, secondInteger, param.fieldNumber, param.fieldType, 0, false, null)
                                if (firstInteger === secondInteger) {
                                    newInteger = firstInteger
                                } else {
                                    weight = options.firstPlantWeights[sectionIndex] / 100.0
                                    newInteger = intround(firstInteger * weight + secondInteger * (1.0 - weight))
                                }
                            }
                            // extra limit on mutation to stop exceptions
                            stdDev = 0.5 * newInteger * options.mutationStrengths[sectionIndex] / 100.0
                            newInteger = intround(this.breedingGenerator.randomNormalWithStdDev(newInteger * 1.0, stdDev))
                            newInteger = intround(umath.min(param.upperBound(), umath.max(param.lowerBound(), 1.0 * newInteger)))
                            newInteger = this.transferField(kSetField, newInteger, param.fieldNumber, param.fieldType, 0, false, null)
                            break
                        case uparams.kFieldLongint:
                            break
                        case uparams.kFieldEnumeratedList:
                            // the only numeric fields so far are the plant's position x and y (which is redone anyway)
                            //            and the random number seed, which shouldn't really be bred anyway, so we will do nothing
                            //            here. if you want to add longint parameters later, you will have to copy the smallint stuff
                            //            to put here. 
                            // non-numeric
                            firstInteger = firstPlant.transferField(kGetField, firstInteger, param.fieldNumber, param.fieldType, 0, false, null)
                            if (secondPlant === null) {
                                newInteger = firstInteger
                            } else {
                                secondInteger = secondPlant.transferField(kGetField, secondInteger, param.fieldNumber, param.fieldType, 0, false, null)
                                if (this.pickPlantToCopyNonNumericalParameterFrom(options, sectionIndex) === kFromFirstPlant) {
                                    newInteger = firstInteger
                                } else {
                                    newInteger = secondInteger
                                }
                            }
                            newInteger = this.transferField(kSetField, newInteger, param.fieldNumber, param.fieldType, 0, false, null)
                            break
                        case uparams.kFieldColor:
                            // numeric if option is set, otherwise non-numeric
                            firstColor = firstPlant.transferField(kGetField, firstColor, param.fieldNumber, param.fieldType, 0, false, null)
                            if (secondPlant === null) {
                                newColor = firstColor
                            } else {
                                secondColor = secondPlant.transferField(kGetField, secondColor, param.fieldNumber, param.fieldType, 0, false, null)
                                if (!options.mutateAndBlendColorValues) {
                                    if (this.pickPlantToCopyNonNumericalParameterFrom(options, sectionIndex) === kFromFirstPlant) {
                                        newColor = firstColor
                                    } else {
                                        newColor = secondColor
                                    }
                                }
                            }
                            if (options.mutateAndBlendColorValues) {
                                newColor = this.blendAndMutateColors(options, sectionIndex, (secondPlant !== null), firstColor, secondColor)
                            }
                            newColor = this.transferField(kSetField, newColor, param.fieldNumber, param.fieldType, 0, false, null)
                            break
                        case uparams.kFieldFloat:
                            if (param.indexType === uparams.kIndexTypeSCurve) {
                                // considering s curve non-numeric, too much trouble to make sure it is all right, and there are only two 
                                this.changingWholeSCurves = true
                                firstPlant.transferWholeSCurve(kGetField, firstSCurve, param.fieldNumber, param.fieldType, false, null)
                                if (secondPlant === null) {
                                    newSCurve = firstSCurve
                                } else {
                                    secondPlant.transferWholeSCurve(kGetField, secondSCurve, param.fieldNumber, param.fieldType, false, null)
                                    if (this.pickPlantToCopyNonNumericalParameterFrom(options, sectionIndex) === kFromFirstPlant) {
                                        newSCurve = firstSCurve
                                    } else {
                                        newSCurve = secondSCurve
                                    }
                                }
                                this.transferWholeSCurve(kSetField, newSCurve, param.fieldNumber, param.fieldType, false, null)
                                this.changingWholeSCurves = false
                                // plain float - numeric
                            } else {
                                // newFloat := 0.0001;  v2.0 removed this
                                firstFloat = firstPlant.transferField(kGetField, firstFloat, param.fieldNumber, param.fieldType, 0, false, null)
                                if (secondPlant === null) {
                                    newFloat = firstFloat
                                } else {
                                    secondFloat = secondPlant.transferField(kGetField, secondFloat, param.fieldNumber, param.fieldType, 0, false, null)
                                    if (firstFloat === secondFloat) {
                                        newFloat = firstFloat
                                    } else {
                                        weight = options.firstPlantWeights[sectionIndex] / 100.0
                                        newFloat = firstFloat * weight + secondFloat * (1.0 - weight)
                                    }
                                }
                                // extra limit on mutation to stop exceptions
                                stdDev = 0.5 * newFloat * options.mutationStrengths[sectionIndex] / 100.0
                                newFloat = this.breedingGenerator.randomNormalWithStdDev(newFloat * 1.0, stdDev)
                                newFloat = umath.min(param.upperBound(), umath.max(param.lowerBound(), newFloat))
                                // for now, don't let float get to zero because it causes problems 
                                // newFloat := max(0.0001, newFloat);  v2.0 removed this to enable breeding with no variation
                                newFloat = this.transferField(kSetField, newFloat, param.fieldNumber, param.fieldType, 0, false, null)
                            }
                            break
                        case uparams.kFieldThreeDObject:
                            // non-numeric
                            firstTdo = new KfObject3D()
                            secondTdo = new KfObject3D()
                            newTdo = new KfObject3D()
                            try {
                                firstTdo = firstPlant.transferField(kGetField, firstTdo, param.fieldNumber, param.fieldType, 0, false, null)
                                if (secondPlant === null) {
                                    newTdo.copyFrom(firstTdo)
                                } else {
                                    secondTdo = secondPlant.transferField(kGetField, secondTdo, param.fieldNumber, param.fieldType, 0, false, null)
                                    if (!options.chooseTdosRandomlyFromCurrentLibrary) {
                                        if (this.pickPlantToCopyNonNumericalParameterFrom(options, sectionIndex) === kFromFirstPlant) {
                                            newTdo.copyFrom(firstTdo)
                                        } else {
                                            newTdo.copyFrom(secondTdo)
                                        }
                                    } else {
                                        randomTdo = this.tdoRandomlyPickedFromCurrentLibrary(tdos)
                                        if (randomTdo !== null) {
                                            newTdo.copyFrom(randomTdo)
                                        }
                                    }
                                }
                                if (options.chooseTdosRandomlyFromCurrentLibrary) {
                                    randomTdo = this.tdoRandomlyPickedFromCurrentLibrary(tdos)
                                    if (randomTdo !== null) {
                                        newTdo.copyFrom(randomTdo)
                                    }
                                }
                                newTdo = this.transferField(kSetField, newTdo, param.fieldNumber, param.fieldType, 0, false, null)
                            } finally {
                                firstTdo.free
                                firstTdo = null
                                secondTdo.free
                                secondTdo = null
                                newTdo.free
                                newTdo = null
                            }
                            break
                        default:
                            // note that longints are not handled here - they are used only for position information
                            //            and not for normal parameters 
                            throw new Error("Problem: Invalid parameter type in method PdPlant.useBreedingOptionsAndPlantsToSetParameters.")
                            break
                    // param loop
                    }
                }
                // section loop
            }
        }
        this.finishLoadingOrDefaulting(kDontCheckForUnreadParams)
        this.setAge(saveAge)
    }
    
    pickPlantToCopyNonNumericalParameterFrom(options: BreedingAndTimeSeriesOptionsStructure, sectionIndex: short): short {
        let result = 0
        result = kFromFirstPlant
        switch (options.getNonNumericalParametersFrom) {
            case kFromFirstPlant:
                result = kFromFirstPlant
                break
            case kFromSecondPlant:
                result = kFromSecondPlant
                break
            case kFromProbabilityBasedOnWeightsForSection:
                if (this.breedingGenerator.zeroToOne() < options.firstPlantWeights[sectionIndex] / 100.0) {
                    result = kFromFirstPlant
                } else {
                    result = kFromSecondPlant
                }
                break
            case kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant:
                if (options.firstPlantWeights[sectionIndex] >= 50) {
                    result = kFromFirstPlant
                } else {
                    result = kFromSecondPlant
                }
                break
            case kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant:
                if (options.firstPlantWeights[sectionIndex] > 50) {
                    result = kFromFirstPlant
                } else {
                    result = kFromSecondPlant
                }
                break
            case kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly:
                if (options.firstPlantWeights[sectionIndex] > 50) {
                    result = kFromFirstPlant
                } else if (options.firstPlantWeights[sectionIndex] < 50) {
                    // 50/50
                    result = kFromSecondPlant
                } else {
                    if (this.breedingGenerator.zeroToOne() <= 0.5) {
                        result = kFromFirstPlant
                    } else {
                        result = kFromSecondPlant
                    }
                }
                break
        }
        return result
    }
    
    blendAndMutateColors(options: BreedingAndTimeSeriesOptionsStructure, sectionIndex: short, haveSecondPlant: boolean, firstColor: TColorRef, secondColor: TColorRef): TColorRef {
        let result = new TColorRef()
        let weight: float
        let stdDevAsFractionOfMean: float
        let firstColorAsFloat: float
        let secondColorAsFloat: float
        let resultAsFloat: float
        let mutationStrengthToUse: float
        
        firstColorAsFloat = firstColor
        resultAsFloat = firstColorAsFloat
        if (haveSecondPlant) {
            secondColorAsFloat = secondColor
            weight = options.firstPlantWeights[sectionIndex] / 100.0
            resultAsFloat = firstColorAsFloat * weight + secondColorAsFloat * (1.0 - weight)
        }
        // v2.0 can mutate colors separately from other parameters - if other params not zero, go with that,
        // if other params zero, and mutating colors, use low mutation for colors only
        mutationStrengthToUse = 0
        if (options.mutationStrengths[sectionIndex] > 0) {
            mutationStrengthToUse = options.mutationStrengths[sectionIndex]
        } else if (options.mutateAndBlendColorValues) {
            mutationStrengthToUse = udomain.kLowMutation
        }
        stdDevAsFractionOfMean = mutationStrengthToUse / 100.0
        // for colors, reduce std dev to 10% of for other things, because the numbers are so huge 
        stdDevAsFractionOfMean = stdDevAsFractionOfMean * 0.1
        resultAsFloat = this.breedingGenerator.randomNormalWithStdDev(resultAsFloat, resultAsFloat * stdDevAsFractionOfMean)
        result = intround(resultAsFloat)
        return result
    }
    
    tdoRandomlyPickedFromCurrentLibrary(tdos: TListCollection): KfObject3D {
        let result = new KfObject3D()
        let index: short
        
        result = null
        if (tdos === null) {
            return result
        }
        if (tdos.Count <= 0) {
            return result
        }
        index = umath.intMax(0, umath.intMin(tdos.Count - 1, intround(this.breedingGenerator.zeroToOne() * tdos.Count)))
        result = tdos.Items[index]
        return result
    }
    
    // -------------------------------------------------------------------------------  data transfer for binary copy 
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdPlant
        cvir.versionNumber = 2
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        let tdoSeedlingLeaf: KfObject3d
        let tdoLeaf: KfObject3d
        let tdoStipule: KfObject3d
        let tdoAxillaryBud: KfObject3d
        let tdoInflorBractFemale: KfObject3d
        let tdoInflorBractMale: KfObject3d
        let tdoFruit: KfObject3d
        let tdoRoot: KfObject3d
        let femaleFlowerTdos: KfObject3d[] /* kHighestFloralPartConstant + 1 */
        let maleFlowerTdos: KfObject3d[] /* kHighestFloralPartConstant + 1 */
        let traverser: PdTraverser
        let hasFirstPhytomer: boolean
        let partType: int
        
        PdStreamableObject.prototype.streamDataWithFiler.call(this, filer, cvir)
        this.name = filer.streamShortString(this.name)
        this.age = filer.streamSmallint(this.age)
        filer.streamSinglePoint(this.basePoint_mm)
        this.xRotation = filer.streamSingle(this.xRotation)
        this.yRotation = filer.streamSingle(this.yRotation)
        this.zRotation = filer.streamSingle(this.zRotation)
        this.drawingScale_PixelsPerMm = filer.streamSingle(this.drawingScale_PixelsPerMm)
        filer.streamRect(this.normalBoundsRect_pixels)
        this.hidden = filer.streamBoolean(this.hidden)
        this.justCopiedFromMainWindow = filer.streamBoolean(this.justCopiedFromMainWindow)
        this.indexWhenRemoved = filer.streamSmallint(this.indexWhenRemoved)
        this.selectedIndexWhenRemoved = filer.streamSmallint(this.selectedIndexWhenRemoved)
        if (filer.isReading()) {
            // save pointers to 3d objects if reading because they will get written over during streaming of structures 
            tdoSeedlingLeaf = this.pSeedlingLeaf.leafTdoParams.object3D
            tdoLeaf = this.pLeaf.leafTdoParams.object3D
            tdoStipule = this.pLeaf.stipuleTdoParams.object3D
            tdoInflorBractFemale = this.pInflor[kGenderFemale].bractTdoParams.object3D
            tdoInflorBractMale = this.pInflor[kGenderMale].bractTdoParams.object3D
            for (partType = 0; partType <= kHighestFloralPartConstant; partType++) {
                femaleFlowerTdos[partType] = this.pFlower[kGenderFemale].tdoParams[partType].object3D
                maleFlowerTdos[partType] = this.pFlower[kGenderMale].tdoParams[partType].object3D
            }
            tdoAxillaryBud = this.pAxillaryBud.tdoParams.object3D
            tdoFruit = this.pFruit.tdoParams.object3D
            tdoRoot = this.pRoot.tdoParams.object3D
        } else {
            tdoSeedlingLeaf = null
            tdoLeaf = null
            tdoStipule = null
            tdoInflorBractFemale = null
            tdoInflorBractMale = null
            for (partType = 0; partType <= kHighestFloralPartConstant; partType++) {
                femaleFlowerTdos[partType] = null
                maleFlowerTdos[partType] = null
            }
            tdoAxillaryBud = null
            tdoFruit = null
            tdoRoot = null
        }
        this.pGeneral = filer.streamBytes(this.pGeneral, FIX_sizeof(this.pGeneral))
        this.pMeristem = filer.streamBytes(this.pMeristem, FIX_sizeof(this.pMeristem))
        this.pInternode = filer.streamBytes(this.pInternode, FIX_sizeof(this.pInternode))
        this.pLeaf = filer.streamBytes(this.pLeaf, FIX_sizeof(this.pLeaf))
        this.pSeedlingLeaf = filer.streamBytes(this.pSeedlingLeaf, FIX_sizeof(this.pSeedlingLeaf))
        this.pAxillaryBud = filer.streamBytes(this.pAxillaryBud, FIX_sizeof(this.pAxillaryBud))
        this.pInflor[kGenderMale] = filer.streamBytes(this.pInflor[kGenderMale], FIX_sizeof(this.pInflor))
        this.pInflor[kGenderFemale] = filer.streamBytes(this.pInflor[kGenderFemale], FIX_sizeof(this.pInflor))
        this.pFlower[kGenderMale] = filer.streamBytes(this.pFlower[kGenderMale], FIX_sizeof(this.pFlower))
        this.pFlower[kGenderFemale] = filer.streamBytes(this.pFlower[kGenderFemale], FIX_sizeof(this.pFlower))
        this.pFruit = filer.streamBytes(this.pFruit, FIX_sizeof(this.pFruit))
        this.pRoot = filer.streamBytes(this.pRoot, FIX_sizeof(this.pRoot))
        if (filer.isReading()) {
            // reset pointers if reading and stream 3d objects 
            this.pSeedlingLeaf.leafTdoParams.object3D = tdoSeedlingLeaf
        }
        this.pSeedlingLeaf.leafTdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pLeaf.leafTdoParams.object3D = tdoLeaf
        }
        this.pLeaf.leafTdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pLeaf.stipuleTdoParams.object3D = tdoStipule
        }
        this.pLeaf.stipuleTdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pInflor[kGenderFemale].bractTdoParams.object3D = tdoInflorBractFemale
        }
        this.pInflor[kGenderFemale].bractTdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pInflor[kGenderMale].bractTdoParams.object3D = tdoInflorBractMale
        }
        this.pInflor[kGenderMale].bractTdoParams.object3D.streamUsingFiler(filer)
        for (partType = 0; partType <= kHighestFloralPartConstant; partType++) {
            if (filer.isReading()) {
                this.pFlower[kGenderFemale].tdoParams[partType].object3D = femaleFlowerTdos[partType]
            }
            this.pFlower[kGenderFemale].tdoParams[partType].object3D.streamUsingFiler(filer)
            if (filer.isReading()) {
                this.pFlower[kGenderMale].tdoParams[partType].object3D = maleFlowerTdos[partType]
            }
            this.pFlower[kGenderMale].tdoParams[partType].object3D.streamUsingFiler(filer)
        }
        if (filer.isReading()) {
            this.pAxillaryBud.tdoParams.object3D = tdoAxillaryBud
        }
        this.pAxillaryBud.tdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pFruit.tdoParams.object3D = tdoFruit
        }
        this.pFruit.tdoParams.object3D.streamUsingFiler(filer)
        if (filer.isReading()) {
            this.pRoot.tdoParams.object3D = tdoRoot
        }
        this.pRoot.tdoParams.object3D.streamUsingFiler(filer)
        this.randomNumberGenerator.streamUsingFiler(filer)
        this.breedingGenerator.streamUsingFiler(filer)
        // biomass info 
        this.totalBiomass_pctMPB = filer.streamSingle(this.totalBiomass_pctMPB)
        this.reproBiomass_pctMPB = filer.streamSingle(this.reproBiomass_pctMPB)
        this.changeInShootBiomassToday_pctMPB = filer.streamSingle(this.changeInShootBiomassToday_pctMPB)
        this.changeInReproBiomassToday_pctMPB = filer.streamSingle(this.changeInReproBiomassToday_pctMPB)
        this.unallocatedNewVegetativeBiomass_pctMPB = filer.streamSingle(this.unallocatedNewVegetativeBiomass_pctMPB)
        this.unremovedDeadVegetativeBiomass_pctMPB = filer.streamSingle(this.unremovedDeadVegetativeBiomass_pctMPB)
        this.unallocatedNewReproductiveBiomass_pctMPB = filer.streamSingle(this.unallocatedNewReproductiveBiomass_pctMPB)
        this.unremovedDeadReproductiveBiomass_pctMPB = filer.streamSingle(this.unremovedDeadReproductiveBiomass_pctMPB)
        this.unremovedStandingDeadBiomass_pctMPB = filer.streamSingle(this.unremovedStandingDeadBiomass_pctMPB)
        this.numApicalActiveReproductiveMeristemsOrInflorescences = filer.streamLongint(this.numApicalActiveReproductiveMeristemsOrInflorescences)
        this.numAxillaryActiveReproductiveMeristemsOrInflorescences = filer.streamLongint(this.numAxillaryActiveReproductiveMeristemsOrInflorescences)
        this.numApicalInactiveReproductiveMeristems = filer.streamLongint(this.numApicalInactiveReproductiveMeristems)
        this.numAxillaryInactiveReproductiveMeristems = filer.streamLongint(this.numAxillaryInactiveReproductiveMeristems)
        this.ageOfYoungestPhytomer = filer.streamSmallint(this.ageOfYoungestPhytomer)
        this.needToRecalculateColors = filer.streamBoolean(this.needToRecalculateColors)
        this.ageAtWhichFloweringStarted = filer.streamSmallint(this.ageAtWhichFloweringStarted)
        this.floweringHasStarted = filer.streamBoolean(this.floweringHasStarted)
        this.totalPlantParts = filer.streamLongint(this.totalPlantParts)
        // plant parts 
        traverser = null
        if (filer.isReading()) {
            hasFirstPhytomer = filer.streamBoolean(hasFirstPhytomer)
            if (this.firstPhytomer !== null) {
                // don't want to create if not written
                this.freeAllDrawingPlantParts()
            }
            if (hasFirstPhytomer) {
                this.firstPhytomer = null
                this.firstPhytomer = uintern.PdInternode().create()
                if (this.firstPhytomer !== null) {
                    uintern.PdInternode(this.firstPhytomer).plant = this
                } else {
                    throw new Error("Problem: Could not create first internode in method PdPlant.streamDataWithFiler.")
                }
            }
        } else if (filer.isWriting()) {
            hasFirstPhytomer = this.firstPhytomer !== null
            hasFirstPhytomer = filer.streamBoolean(hasFirstPhytomer)
        }
        if (hasFirstPhytomer) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.filer = filer
                traverser.traverseWholePlant(utravers.kActivityStream)
            } finally {
                traverser.free
            }
        }
        this.previewCache.streamUsingFiler(filer)
        if (filer.isReading()) {
            umath.calcSCurveCoeffs(this.pFruit.sCurveParams)
            umath.calcSCurveCoeffs(this.pGeneral.growthSCurve)
            umath.calcSCurveCoeffs(this.pLeaf.sCurveParams)
        }
        this.amendments.streamUsingFiler(filer, uamendmt.PdPlantDrawingAmendment)
    }
    
    // --------------------------------------------------------------------------------  command-related 
    randomize(): void {
        let seed: short
        let breedingSeed: long
        let anXRotation: float
        
        seed = this.randomNumberGenerator.randomSmallintSeedFromTime()
        breedingSeed = this.breedingGenerator.randomSeedFromTime()
        anXRotation = this.randomNumberGenerator.zeroToOne() * 360.0
        this.randomizeWithSeedsAndXRotation(seed, breedingSeed, anXRotation)
    }
    
    randomizeWithSeedsAndXRotation(generalSeed: short, breedingSeed: long, anXRotation: float): void {
        let updateList: TListCollection
        let updateEvent: PdPlantUpdateEvent
        
        this.pGeneral.startingSeedForRandomNumberGenerator = generalSeed
        this.breedingGenerator.setSeed(breedingSeed)
        this.xRotation = anXRotation
        this.regrow()
        // tell main window to update in case showing parameter panel 
        // if this is a breeder plant, it will create the update list, but the main window won't
        // recognize the plant pointer. this is extra memory use, but i'd have to pass a boolean all
        // over to stop it, and the list only has one item
        updateList = ucollect.TListCollection().Create()
        updateEvent = PdPlantUpdateEvent.create
        try {
            updateEvent.plant = this
            // hard-coded
            updateEvent.fieldID = utransfr.kGeneralStartingSeedForRandomNumberGenerator
            updateList.Add(updateEvent)
            umain.MainForm.updateParameterValuesWithUpdateListForPlant(this, updateList)
        } finally {
            updateList.free
            updateList = null
        }
    }
    
    // ------------------------------------------------------------------------------------  next day and traverser 
    nextDay(): void {
        let traverser: PdTraverser
        let newTotalBiomass_pctMPB: float
        let changeInTotalBiomassTodayAsPercentOfMPB_pct: float
        let fractionReproBiomassToday_frn: float
        let newReproBiomass_pctMPB: float
        let newShootBiomass_pctMPB: float
        let fractionToMaturity_frn: float
        let firstMeristem: PdMeristem
        
        try {
            // calculate overall biomass change using s curve 
            fractionToMaturity_frn = safedivExcept(this.age, this.pGeneral.ageAtMaturity, 0)
            newTotalBiomass_pctMPB = umath.max(0.0, umath.min(100.0, 100.0 * umath.scurve(fractionToMaturity_frn, this.pGeneral.growthSCurve.c1, this.pGeneral.growthSCurve.c2)))
            changeInTotalBiomassTodayAsPercentOfMPB_pct = newTotalBiomass_pctMPB - this.totalBiomass_pctMPB
            this.totalBiomass_pctMPB = newTotalBiomass_pctMPB
            if (this.floweringHasStarted) {
                // divide up change into shoot and fruit, make changes to total shoot/fruit 
                fractionReproBiomassToday_frn = umath.max(0, this.pGeneral.fractionReproductiveAllocationAtMaturity_frn * safedivExcept(this.age - this.ageAtWhichFloweringStarted, this.pGeneral.ageAtMaturity - this.ageAtWhichFloweringStarted, 0))
                newReproBiomass_pctMPB = fractionReproBiomassToday_frn * this.totalBiomass_pctMPB
                this.changeInReproBiomassToday_pctMPB = newReproBiomass_pctMPB - this.reproBiomass_pctMPB
                this.reproBiomass_pctMPB = newReproBiomass_pctMPB
                // rest goes to shoots 
                newShootBiomass_pctMPB = this.totalBiomass_pctMPB - this.reproBiomass_pctMPB
                this.changeInShootBiomassToday_pctMPB = newShootBiomass_pctMPB - this.shootBiomass_pctMPB
                this.shootBiomass_pctMPB = newShootBiomass_pctMPB
            } else {
                this.changeInReproBiomassToday_pctMPB = 0.0
                this.changeInShootBiomassToday_pctMPB = changeInTotalBiomassTodayAsPercentOfMPB_pct
                this.shootBiomass_pctMPB = this.totalBiomass_pctMPB
            }
            if (this.shootBiomass_pctMPB + this.reproBiomass_pctMPB > 100.0) {
                this.shootBiomass_pctMPB = this.shootBiomass_pctMPB
            }
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                if ((this.firstPhytomer === null)) {
                    // If first day, create first phytomer. Assume seed reserves are placed into this phytomer.
                    firstMeristem = umerist.PdMeristem().newWithPlant(this)
                    this.firstPhytomer = firstMeristem.createFirstPhytomer()
                    if (this.firstPhytomer === null) {
                        // Must tell firstPhytomer to recalculate internode angle because it did not know it was the
                        //      first phytomer until after drawing plant got this pointer back.
                        return
                    }
                    uintern.PdInternode(this.firstPhytomer).setAsFirstPhytomer()
                    // reduce changeInShootBiomassToday_pctMPB for amount used to make first phytomer 
                    this.changeInShootBiomassToday_pctMPB = this.changeInShootBiomassToday_pctMPB - firstMeristem.optimalInitialPhytomerBiomass_pctMPB()
                }
                if (!this.floweringHasStarted && (this.age >= this.pGeneral.ageAtWhichFloweringStarts)) {
                    // decide if flowering has started using params 
                    this.floweringHasStarted = true
                    this.ageAtWhichFloweringStarted = this.age
                    // tell all meristems to switch over 
                    traverser.traverseWholePlant(utravers.kActivityStartReproduction)
                }
                this.allocateOrRemoveBiomassWithTraverser(traverser)
                if (this.firstPhytomer !== null) {
                    traverser.ageOfYoungestPhytomer = UNRESOLVED.maxLongInt
                } else {
                    traverser.ageOfYoungestPhytomer = 0
                }
                traverser.traverseWholePlant(utravers.kActivityNextDay)
                this.ageOfYoungestPhytomer = traverser.ageOfYoungestPhytomer
                this.age += 1
            } finally {
                traverser.free
                traverser = null
                this.needToRecalculateColors = true
            }
        } catch (e) {
            messageForExceptionType(e, "PdPlant.nextDay")
        }
    }
    
    allocateOrRemoveBiomassWithTraverser(traverserProxy: TObject): void {
        let traverser: PdTraverser
        let shootAddition_pctMPB: float
        let shootReduction_pctMPB: float
        let reproAddition_pctMPB: float
        let reproReduction_pctMPB: float
        
        if (this.firstPhytomer === null) {
            return
        }
        traverser = traverserProxy
        if (traverser === null) {
            return
        }
        if (this.changeInShootBiomassToday_pctMPB > 0) {
            // set addition and reduction from changes, and add in amounts rolled over from yesterday 
            shootAddition_pctMPB = this.changeInShootBiomassToday_pctMPB + this.unallocatedNewVegetativeBiomass_pctMPB
            this.unallocatedNewVegetativeBiomass_pctMPB = 0.0
            shootReduction_pctMPB = 0.0
        } else {
            shootReduction_pctMPB = this.changeInShootBiomassToday_pctMPB + this.unremovedDeadVegetativeBiomass_pctMPB
            this.unremovedDeadVegetativeBiomass_pctMPB = 0.0
            shootAddition_pctMPB = 0.0
        }
        if (this.changeInReproBiomassToday_pctMPB > 0) {
            reproAddition_pctMPB = this.changeInReproBiomassToday_pctMPB + this.unallocatedNewReproductiveBiomass_pctMPB
            this.unallocatedNewReproductiveBiomass_pctMPB = 0.0
            reproReduction_pctMPB = 0.0
        } else {
            reproReduction_pctMPB = this.changeInReproBiomassToday_pctMPB + this.unremovedDeadReproductiveBiomass_pctMPB
            this.unremovedDeadReproductiveBiomass_pctMPB = 0.0
            reproAddition_pctMPB = 0.0
        }
        // see if amounts can cancel out to any extent 
        shootAddition_pctMPB, shootReduction_pctMPB = cancelOutOppositeAmounts(shootAddition_pctMPB, shootReduction_pctMPB)
        reproAddition_pctMPB, reproReduction_pctMPB = cancelOutOppositeAmounts(reproAddition_pctMPB, reproReduction_pctMPB)
        if (shootAddition_pctMPB > 0.0) {
            // allocate new shoot biomass 
            this.unallocatedNewVegetativeBiomass_pctMPB = this.allocateOrRemoveParticularBiomass(shootAddition_pctMPB, this.unallocatedNewVegetativeBiomass_pctMPB, utravers.kActivityDemandVegetative, utravers.kActivityGrowVegetative, traverser)
        }
        if (shootReduction_pctMPB > 0.0) {
            // remove dead shoot biomass 
            this.unremovedDeadVegetativeBiomass_pctMPB = this.allocateOrRemoveParticularBiomass(shootReduction_pctMPB, this.unremovedDeadVegetativeBiomass_pctMPB, utravers.kActivityVegetativeBiomassThatCanBeRemoved, utravers.kActivityRemoveVegetativeBiomass, traverser)
        }
        if (reproAddition_pctMPB > 0.0) {
            // allocate new fruit biomass 
            this.unallocatedNewReproductiveBiomass_pctMPB = this.allocateOrRemoveParticularBiomass(reproAddition_pctMPB, this.unallocatedNewReproductiveBiomass_pctMPB, utravers.kActivityDemandReproductive, utravers.kActivityGrowReproductive, traverser)
        }
        if (reproReduction_pctMPB > 0.0) {
            // remove dead fruit biomass 
            this.unremovedDeadReproductiveBiomass_pctMPB = this.allocateOrRemoveParticularBiomass(reproReduction_pctMPB, this.unremovedDeadReproductiveBiomass_pctMPB, utravers.kActivityReproductiveBiomassThatCanBeRemoved, utravers.kActivityRemoveReproductiveBiomass, traverser)
        }
    }
    
    allocateOrRemoveParticularBiomass(biomassToAddOrRemove_pctMPB: float, undistributedBiomass_pctMPB: float, askingMode: int, tellingMode: int, traverserProxy: TObject): void {
        let traverser: PdTraverser
        let totalDemandOrAvailableBiomass_pctMPB: float
        
        try {
            traverser = traverserProxy
            if (traverser === null) {
                return undistributedBiomass_pctMPB
            }
            traverser.traverseWholePlant(askingMode)
            totalDemandOrAvailableBiomass_pctMPB = traverser.total
            if (totalDemandOrAvailableBiomass_pctMPB > 0.0) {
                if (biomassToAddOrRemove_pctMPB > totalDemandOrAvailableBiomass_pctMPB) {
                    undistributedBiomass_pctMPB = biomassToAddOrRemove_pctMPB - totalDemandOrAvailableBiomass_pctMPB
                    traverser.fractionOfPotentialBiomass = 1.0
                } else {
                    traverser.fractionOfPotentialBiomass = safedivExcept(biomassToAddOrRemove_pctMPB, totalDemandOrAvailableBiomass_pctMPB, 0)
                }
                traverser.traverseWholePlant(tellingMode)
            } else {
                // no demand 
                undistributedBiomass_pctMPB = undistributedBiomass_pctMPB + biomassToAddOrRemove_pctMPB
            }
        } catch (e) {
            messageForExceptionType(e, "PdPlant.allocateOrRemoveParticularBiomass")
        }
        return undistributedBiomass_pctMPB
    }
    
    getPlantStatistics(statisticsProxy: TObject): void {
        let statistics: PdPlantStatistics
        let traverser: PdTraverser
        
        statistics = utravers.PdPlantStatistics(statisticsProxy)
        if (statistics === null) {
            return
        }
        traverser = utravers.PdTraverser().createWithPlant(this)
        try {
            traverser.statistics = statistics
            traverser.traverseWholePlant(utravers.kActivityGatherStatistics)
        } finally {
            traverser.free
        }
        // set undistributed amounts in statistics 
        statistics.liveBiomass_pctMPB[utravers.kStatisticsPartTypeUnallocatedNewVegetativeBiomass] = this.unallocatedNewVegetativeBiomass_pctMPB
        statistics.deadBiomass_pctMPB[utravers.kStatisticsPartTypeUnremovedDeadVegetativeBiomass] = this.unremovedDeadVegetativeBiomass_pctMPB
        statistics.liveBiomass_pctMPB[utravers.kStatisticsPartTypeUnallocatedNewReproductiveBiomass] = this.unallocatedNewReproductiveBiomass_pctMPB
        statistics.deadBiomass_pctMPB[utravers.kStatisticsPartTypeUnremovedDeadReproductiveBiomass] = this.unremovedDeadReproductiveBiomass_pctMPB
    }
    
    report(): void {
        let traverser: PdTraverser
        
        if ((this.firstPhytomer !== null)) {
            DebugPrint("---------------------- Start plant report")
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.traverseWholePlant(utravers.kActivityReport)
            } finally {
                traverser.free
            }
            DebugPrint("---------------------- End plant report")
        }
    }
    
    // --------------------------------------------------------------------------------------------- amendments 
    amendmentForPartID(partID: long): PdPlantDrawingAmendment {
        let result = new PdPlantDrawingAmendment()
        let i: int
        let amendment: PdPlantDrawingAmendment
        
        result = null
        if (this.amendments.Count <= 0) {
            return result
        }
        for (i = 0; i <= this.amendments.Count - 1; i++) {
            amendment = uamendmt.PdPlantDrawingAmendment(this.amendments.Items[i])
            if ((amendment.partID === partID)) {
                result = amendment
                return result
            }
        }
        return result
    }
    
    addAmendment(newAmendment: PdPlantDrawingAmendment): void {
        this.amendments.Add(newAmendment)
    }
    
    removeAmendment(oldAmendment: PdPlantDrawingAmendment): void {
        this.amendments.Remove(oldAmendment)
    }
    
    removeAllAmendments(): void {
        this.amendments.free
        this.amendments = null
        this.amendments = ucollect.TListCollection().Create()
    }
    
    clearPointersToAllAmendments(): void {
        this.amendments.clearPointersWithoutDeletingObjects()
    }
    
    restoreAmendmentPointersToList(aList: TList): void {
        let i: int
        
        if ((aList !== null) && (aList.Count > 0)) {
            for (i = 0; i <= aList.Count - 1; i++) {
                this.addAmendment(uamendmt.PdPlantDrawingAmendment(aList.Items[i]))
            }
        }
    }
    
    plantPartForPartID(partID: long): TObject {
        let result = new TObject()
        let traverser: PdTraverser
        
        result = null
        if ((this.firstPhytomer !== null)) {
            traverser = utravers.PdTraverser().createWithPlant(this)
            try {
                traverser.foundPlantPart = null
                traverser.partID = partID
                traverser.traverseWholePlant(utravers.kActivityFindPartForPartID)
                result = traverser.foundPlantPart
            } finally {
                traverser.free
            }
        }
        return result
    }
    
    getInfoForPlantPartAtPoint(point: TPoint, partID: long, partType: string): void {
        let part: PdPlantPart
        
        partID = -1
        partType = ""
        part = this.findPlantPartAtPositionByTestingPolygons(Point)
        if (part === null) {
            return partID, partType
        }
        partID = part.partID
        partType = part.getName()
        return partID, partType
    }
    
    colorForDXFPartType(index: short): TColorRef {
        let result = new TColorRef()
        switch (index) {
            case u3dexport.kExportPartMeristem:
                result = this.pAxillaryBud.tdoParams.faceColor
                break
            case u3dexport.kExportPartInternode:
                result = this.pInternode.faceColor
                break
            case u3dexport.kExportPartSeedlingLeaf:
                result = this.pSeedlingLeaf.leafTdoParams.faceColor
                break
            case u3dexport.kExportPartLeaf:
                result = this.pLeaf.leafTdoParams.faceColor
                break
            case u3dexport.kExportPartFirstPetiole:
                result = this.pLeaf.petioleColor
                break
            case u3dexport.kExportPartPetiole:
                result = this.pLeaf.petioleColor
                break
            case u3dexport.kExportPartLeafStipule:
                result = this.pLeaf.stipuleTdoParams.faceColor
                break
            case u3dexport.kExportPartInflorescenceStalkFemale:
                result = this.pInflor[kGenderFemale].stalkColor
                break
            case u3dexport.kExportPartInflorescenceInternodeFemale:
                result = this.pInflor[kGenderFemale].stalkColor
                break
            case u3dexport.kExportPartInflorescenceBractFemale:
                result = this.pInflor[kGenderFemale].bractTdoParams.faceColor
                break
            case u3dexport.kExportPartInflorescenceStalkMale:
                result = this.pInflor[kGenderMale].stalkColor
                break
            case u3dexport.kExportPartInflorescenceInternodeMale:
                result = this.pInflor[kGenderMale].stalkColor
                break
            case u3dexport.kExportPartInflorescenceBractMale:
                result = this.pInflor[kGenderMale].bractTdoParams.faceColor
                break
            case u3dexport.kExportPartPedicelFemale:
                result = this.pInflor[kGenderFemale].pedicelColor
                break
            case u3dexport.kExportPartFlowerBudFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kBud].faceColor
                break
            case u3dexport.kExportPartStyleFemale:
                result = this.pFlower[kGenderFemale].styleColor
                break
            case u3dexport.kExportPartStigmaFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kPistils].faceColor
                break
            case u3dexport.kExportPartFilamentFemale:
                result = this.pFlower[kGenderFemale].filamentColor
                break
            case u3dexport.kExportPartAntherFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kStamens].faceColor
                break
            case u3dexport.kExportPartFirstPetalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kFirstPetals].faceColor
                break
            case u3dexport.kExportPartSecondPetalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kSecondPetals].faceColor
                break
            case u3dexport.kExportPartThirdPetalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kThirdPetals].faceColor
                break
            case u3dexport.kExportPartFourthPetalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kFourthPetals].faceColor
                break
            case u3dexport.kExportPartFifthPetalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kFifthPetals].faceColor
                break
            case u3dexport.kExportPartSepalsFemale:
                result = this.pFlower[kGenderFemale].tdoParams[kSepals].faceColor
                break
            case u3dexport.kExportPartPedicelMale:
                result = this.pInflor[kGenderMale].pedicelColor
                break
            case u3dexport.kExportPartFlowerBudMale:
                result = this.pFlower[kGenderMale].tdoParams[kBud].faceColor
                break
            case u3dexport.kExportPartFilamentMale:
                result = this.pFlower[kGenderMale].filamentColor
                break
            case u3dexport.kExportPartAntherMale:
                result = this.pFlower[kGenderMale].tdoParams[kStamens].faceColor
                break
            case u3dexport.kExportPartFirstPetalsMale:
                result = this.pFlower[kGenderMale].tdoParams[kFirstPetals].faceColor
                break
            case u3dexport.kExportPartSepalsMale:
                result = this.pFlower[kGenderMale].tdoParams[kSepals].faceColor
                break
            case u3dexport.kExportPartUnripeFruit:
                result = this.pFruit.tdoParams.alternateFaceColor
                break
            case u3dexport.kExportPartRipeFruit:
                result = this.pFruit.tdoParams.faceColor
                break
            case u3dexport.kExportPartRootTop:
                result = this.pRoot.tdoParams.faceColor
                break
            default:
                throw new Error("Problem: Invalid part type in method colorForDXFPartType.")
                break
        }
        return result
    }
    
}

export class PdPlantUpdateEvent {
    plant: PdPlant = new PdPlant()
    fieldID: int = 0
    fieldIndex: int = 0
    
}
