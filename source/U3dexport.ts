import { short, int, float, long, TColorRef, IntToStr, TextFile, writeln, ExtractFileName, ExtractFilePath, byte, write, getBValue, getRValue, getGValue, ColorDefs, odd, TFileStream } from "./common"
import { KfPoint3D } from "./KfPoint3D"
import { FileType, valueString, stringUpTo, replacePunctuationWithUnderscores, support_rgb, SaveFileNamesStructure } from "./usupport"
import { domain } from "./PdDomain"
import { intMin } from "./umath"
import { KfTriangle } from "./KfTriangle"
import { KfDrawingSurface } from "./KfDrawingSurface"

// unit U3dexport

export enum ExportPart {
    kExportPartMeristem = 0,
    kExportPartInternode = 1,
    kExportPartSeedlingLeaf = 2,
    kExportPartLeaf = 3,
    kExportPartFirstPetiole = 4,
    kExportPartPetiole = 5,
    kExportPartLeafStipule = 6,
    kExportPartInflorescenceStalkFemale = 7,
    kExportPartInflorescenceInternodeFemale = 8,
    kExportPartInflorescenceBractFemale = 9,
    kExportPartInflorescenceStalkMale = 10,
    kExportPartInflorescenceInternodeMale = 11,
    kExportPartInflorescenceBractMale = 12,
    kExportPartPedicelFemale = 13,
    kExportPartFlowerBudFemale = 14,
    kExportPartStyleFemale = 15,
    kExportPartStigmaFemale = 16,
    kExportPartFilamentFemale = 17,
    kExportPartAntherFemale = 18,
    kExportPartFirstPetalsFemale = 19,
    kExportPartSecondPetalsFemale = 20,
    kExportPartThirdPetalsFemale = 21,
    kExportPartFourthPetalsFemale = 22,
    kExportPartFifthPetalsFemale = 23,
    kExportPartSepalsFemale = 24,
    kExportPartPedicelMale = 25,
    kExportPartFlowerBudMale = 26,
    kExportPartFilamentMale = 27,
    kExportPartAntherMale = 28,
    kExportPartFirstPetalsMale = 29,
    kExportPartSepalsMale = 30,
    kExportPartUnripeFruit = 31,
    kExportPartRipeFruit = 32,
    kExportPartRootTop = 33,
    kExportPartLast = 33,
}

const kLastDxfColorIndex = 10
const dxfColors = [ColorDefs.clRed, ColorDefs.clYellow, ColorDefs.clLime, ColorDefs.clAqua, ColorDefs.clBlue, ColorDefs.clPurple, ColorDefs.clBlack, ColorDefs.clOlive, ColorDefs.clFuchsia, ColorDefs.clTeal, ColorDefs.clGray, ]

const kColorDXFFromPlantPartType = 0
const kColorDXFFromRGB = 1
const kColorDXFFromOneColor = 3

export enum NestingType {
    kNestingTypeInflorescence = 0,
    kNestingTypeLeafAndPetiole = 1,
    kNestingTypeCompoundLeaf = 2,
    kNestingTypePedicelAndFlowerFruit = 3,
    kNestingTypeFloralLayers = 4,
}

const kMaxPOVPlants = 1000
const kMaxStoredMaterials = 1000

const kVRMLVersionOne = 0
const kVRMLVersionTwo = 1

// TODO: Fix constants copied from U3dexport
export enum ExportFormats {
    kScreen = 0,
    kDXF = 1,
    kPOV = 2,
    k3DS = 3,
    kOBJ = 4,
    kVRML = 5,
    kLWO = 6,
    k3DExportTypeLast = 6
}

const kLayerOutputAllTogether = 0
const kLayerOutputByTypeOfPlantPart = 1
const kLayerOutputByPlantPart = 2

const kWriteColor = true
const kDontWriteColor = false

const kMax3DPoints = 65536
const kMax3DFaces = 65536

export enum Axis {
    kX = 0,
    kY = 1,
    kZ = 2,
}


// export part types
// meristem
// internode
// leaf
// no stipule on first leaves
// inflorescence female
// inflorescence male
// flower female
// flower male
// fruit
// root top
// DXF
// POV
// can't imagine anyone would save more than that
// 3DS
// OBJ, LWO
// VRML
// general
// record
export interface Vertex {
    x: float
    y: float
    z: float
}

// record
export interface Triangle {
    vertex1: int
    vertex2: int
    vertex3: int
    surfaceID: int
}

// generic
// record
export class FileExport3DOptionsStructure {
    exportType: short = 0
    layeringOption: short = 0
    stemCylinderFaces: short = 0
    translatePlantsToWindowPositions: boolean = false
    lengthOfShortName: short = 0
    writePlantNumberInFrontOfName: boolean = false
    writeColors: boolean = false
    overallScalingFactor_pct: short = 0
    fileSize: float = 0
    xRotationBeforeDraw: short = 0
    pressPlants: boolean = false
    directionToPressPlants: short = 0
    makeTrianglesDoubleSided: boolean = false
    dxf_whereToGetColors: short = 0
    dxf_wholePlantColorIndex: short = 0
    dxf_plantPartColorIndexes: short[] = Array(ExportPart.kExportPartLast + 1)
    pov_minLineLengthToWrite: float = 0
    pov_minTdoScaleToWrite: float = 0
    pov_commentOutUnionAtEnd: boolean = false
    nest_Inflorescence: boolean = false
    nest_LeafAndPetiole: boolean = false
    nest_CompoundLeaf: boolean = false
    nest_PedicelAndFlowerFruit: boolean = false
    nest_FloralLayers: boolean = false
    vrml_version: short = 0
}

// const
const kNumVRMLPointsPerLine = 4


// record
export interface SingleOverlay {
}

// ------------------------------------------------------------------------------------------ index functions 
export function fileTypeFor3DExportType(outputType: short): short {
    let result = 0
    switch (outputType) {
        case ExportFormats.kDXF:
            result = FileType.kFileTypeDXF
            break
        case ExportFormats.kPOV:
            result = FileType.kFileTypeINC
            break
        case ExportFormats.k3DS:
            result = FileType.kFileType3DS
            break
        case ExportFormats.kOBJ:
            result = FileType.kFileTypeOBJ
            break
        case ExportFormats.kVRML:
            result = FileType.kFileTypeVRML
            break
        case ExportFormats.kLWO:
            result = FileType.kFileTypeLWO
            break
        default:
            throw new Error("Problem: Invalid export type in TMainForm.fileTypeFor3DExportType.")
    }
    return result
}

export function nameFor3DExportType(anOutputType: short): string {
    let result = ""
    switch (anOutputType) {
        case ExportFormats.kDXF:
            result = "DXF"
            break
        case ExportFormats.kPOV:
            result = "POV"
            break
        case ExportFormats.k3DS:
            result = "3DS"
            break
        case ExportFormats.kOBJ:
            result = "OBJ"
            break
        case ExportFormats.kVRML:
            result = "VRML"
            break
        case ExportFormats.kLWO:
            result = "LWO"
            break
        default:
            throw new Error("Problem: Invalid type in PdDomain.sectionNumberFor3DExportType.")
    }
    return result
}

export function longNameForDXFPartType(index: short): string {
    let longName: string
    let shortName: string
    
    [longName, shortName] = getInfoForDXFPartType(index)
    return longName
}

export function shortNameForDXFPartType(index: short): string {
    let longName: string
    let shortName: string
    
    [longName, shortName] = getInfoForDXFPartType(index)
    return shortName
}

function getInfoForDXFPartType(index: short): [string, string] {
    let longName: string
    let shortName: string
    switch (index) {
        case ExportPart.kExportPartMeristem:
            longName = "Meristem"
            shortName = "Mrstm"
            break
        case ExportPart.kExportPartInternode:
            longName = "Internode"
            shortName = "Intrnd"
            break
        case ExportPart.kExportPartSeedlingLeaf:
            longName = "Seedling leaf"
            shortName = "1stLeaf"
            break
        case ExportPart.kExportPartLeaf:
            longName = "Leaf"
            shortName = "Leaf"
            break
        case ExportPart.kExportPartFirstPetiole:
            longName = "Seedling petiole"
            shortName = "1stPetiole"
            break
        case ExportPart.kExportPartPetiole:
            longName = "Petiole"
            shortName = "Petiole"
            break
        case ExportPart.kExportPartLeafStipule:
            longName = "Leaf stipule"
            shortName = "Stipule"
            break
        case ExportPart.kExportPartInflorescenceStalkFemale:
            longName = "Primary inflorescence stalk (peduncle)"
            shortName = "1Pdncle"
            break
        case ExportPart.kExportPartInflorescenceInternodeFemale:
            longName = "Primary inflorescence internode"
            shortName = "1InfInt"
            break
        case ExportPart.kExportPartInflorescenceBractFemale:
            longName = "Primary inflorescence bract"
            shortName = "1Bract"
            break
        case ExportPart.kExportPartInflorescenceStalkMale:
            longName = "Secondary inflorescence stalk (peduncle)"
            shortName = "2Pdncle"
            break
        case ExportPart.kExportPartInflorescenceInternodeMale:
            longName = "Secondary inflorescence internode"
            shortName = "2InfInt"
            break
        case ExportPart.kExportPartInflorescenceBractMale:
            longName = "Secondary inflorescence bract"
            shortName = "2Bract"
            break
        case ExportPart.kExportPartPedicelFemale:
            longName = "Primary flower stalk"
            shortName = "1Pdcel"
            break
        case ExportPart.kExportPartFlowerBudFemale:
            longName = "Primary flower bud"
            shortName = "1Bud"
            break
        case ExportPart.kExportPartStyleFemale:
            longName = "Flower style"
            shortName = "Style"
            break
        case ExportPart.kExportPartStigmaFemale:
            longName = "Flower stigma"
            shortName = "Stigma"
            break
        case ExportPart.kExportPartFilamentFemale:
            longName = "Primary flower filament"
            shortName = "1Flmnt"
            break
        case ExportPart.kExportPartAntherFemale:
            longName = "Primary flower anther"
            shortName = "1Anther"
            break
        case ExportPart.kExportPartFirstPetalsFemale:
            longName = "Primary flower petal, first row"
            shortName = "1Petal1"
            break
        case ExportPart.kExportPartSecondPetalsFemale:
            longName = "Flower petal, second row"
            shortName = "1Petal2"
            break
        case ExportPart.kExportPartThirdPetalsFemale:
            longName = "Flower petal, third row"
            shortName = "1Petal3"
            break
        case ExportPart.kExportPartFourthPetalsFemale:
            longName = "Flower petal, fourth row"
            shortName = "1Petal4"
            break
        case ExportPart.kExportPartFifthPetalsFemale:
            longName = "Flower petal, fifth row"
            shortName = "1Petal5"
            break
        case ExportPart.kExportPartSepalsFemale:
            longName = "Primary flower sepal"
            shortName = "1Sepal"
            break
        case ExportPart.kExportPartPedicelMale:
            longName = "Secondary flower stalk"
            shortName = "2Pdcel"
            break
        case ExportPart.kExportPartFlowerBudMale:
            longName = "Secondary flower bud"
            shortName = "2Bud"
            break
        case ExportPart.kExportPartFilamentMale:
            longName = "Secondary flower filament"
            shortName = "2Flmnt"
            break
        case ExportPart.kExportPartAntherMale:
            longName = "Secondary flower anther"
            shortName = "2Anther"
            break
        case ExportPart.kExportPartFirstPetalsMale:
            longName = "Secondary flower petal"
            shortName = "2Petal1"
            break
        case ExportPart.kExportPartSepalsMale:
            longName = "Secondary flower sepal"
            shortName = "2Sepal"
            break
        case ExportPart.kExportPartUnripeFruit:
            longName = "Unripe fruit"
            shortName = "FruitU"
            break
        case ExportPart.kExportPartRipeFruit:
            longName = "Ripe fruit"
            shortName = "FruitR"
            break
        case ExportPart.kExportPartRootTop:
            longName = "Root top"
            shortName = "Root"
            break
        default:
            throw new Error("Problem: Invalid part type in method getInfoForDXFPartType.")
    }
    return [longName, shortName]
}


// don't save in settings file
// to deal with quirks in other programs
// specific (keep in generic structure so one window can handle all of these)
export class KfFileExportSurface extends KfDrawingSurface {
    fileName: string = ""
    scale: float = 0.0
    options: FileExport3DOptionsStructure
    currentPlantNameLong: string = ""
    currentPlantNameShort: string = ""
    currentPlantIsTranslated: boolean = false
    currentPlantTranslateX: float = 0.0
    currentPlantTranslateY: float = 0.0
    currentPlantIndex: short = 0
    currentGroupingString: string = ""
    currentColor: TColorRef = 0
    plantPartCounts: short[] = Array(ExportPart.kExportPartLast + 1)
    numPoints: int = 0
    points: Vertex[] = Array(kMax3DPoints + 1)
    numFaces: int = 0
    faces: Triangle[] = Array(kMax3DFaces + 1)
     
    constructor(aFileName: string) {
        super(null)
        this.fileName = aFileName
        this.options = domain.exportOptionsFor3D[this.outputType()]
        this.scale = this.options.overallScalingFactor_pct / 100.0
    }
    
    startFile(): void {
        throw new Error("subclasses must override")
    }
    
    endFile(): void {
        throw new Error("subclasses must override")
    }
    
    startPlant(aLongName: string, aPlantIndex: short): void {
        this.currentPlantIndex = aPlantIndex
        this.currentPlantNameLong = aLongName
        this.currentPlantNameShort = this.generateShortName()
    }
    
    endPlant(): void {
        // subclasses can override
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {
        throw new Error("subclasses must override")
    }
    
    startNestedGroupOfPlantParts(groupName: string, shortName: string, nestingType: short): void {
        // subclasses can override
    }
    
    endNestedGroupOfPlantParts(nestingType: short): void {
        // subclasses can override
    }
    
    startPlantPart(aLongName: string, aShortName: string): void {
        // subclasses can override
    }
    
    endPlantPart(): void {
        // subclasses can override
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        this.setUpGroupingStringForStemSegmentOr3DObject(aShortName, index)
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        this.setUpGroupingStringForStemSegmentOr3DObject(aShortName, index)
    }
    
    startVerticesAndTriangles(): void {
        // subclasses can override
    }
    
    endVerticesAndTriangles(): void {
        // subclasses can override
    }
    
    addPoint(point: KfPoint3D): void {
        if (this.numPoints >= kMax3DPoints) {
            throw new Error("Problem: Too many points in 3D export.")
        }
        this.points[this.numPoints].x = this.pressedOrNot(this.scale * point.x, Axis.kX)
        this.points[this.numPoints].y = this.pressedOrNot(this.scale * point.y, Axis.kY)
        this.points[this.numPoints].z = this.pressedOrNot(this.scale * point.z, Axis.kZ)
        this.numPoints += 1
    }
    
    pressedOrNot(value: float, dimension: short): float {
        let result = 0.0
        if ((this.options.pressPlants) && (this.options.directionToPressPlants === dimension)) {
            result = 0
        } else {
            result = value
        }
        return result
    }
    
    addTriangle(a: int, b: int, c: int): void {
        if (this.numFaces >= kMax3DFaces) {
            throw new Error("Problem: Too many faces in 3D export.")
        }
        this.faces[this.numFaces].vertex1 = a
        this.faces[this.numFaces].vertex2 = b
        this.faces[this.numFaces].vertex3 = c
        this.numFaces += 1
    }
    
    end3DObject(): void {
        // subclasses can override
    }
    
    setUpGroupingStringForStemSegmentOr3DObject(aShortName: string, index: short): void {
        switch (this.options.layeringOption) {
            case kLayerOutputAllTogether:
                this.currentGroupingString = this.currentPlantNameShort
                break
            case kLayerOutputByTypeOfPlantPart:
                this.currentGroupingString = this.currentPlantNameShort + "_" + aShortName
                break
            case kLayerOutputByPlantPart:
                this.plantPartCounts[index] += 1
                this.currentGroupingString = this.currentPlantNameShort + "_" + IntToStr(this.plantPartCounts[index]) + "_" + aShortName
                break
        }
    }
    
    endStemSegment(): void {
        // subclasses can override
    }
    
    drawPipeFaces(startPoints: KfPoint3D[], endPoints: KfPoint3D[], faces: short, segmentNumber: short): void {
        // subclasses can override - this works for some
        const disp: long = segmentNumber * faces * 2
        for (let i = 0; i < faces; i++) {
            this.addPoint(startPoints[i])
        }
        for (let i = 0; i < faces; i++) {
            this.addPoint(endPoints[i])
        }
        for (let i = 0; i < faces; i++) {
            this.addTriangle(disp + i, disp + i + faces, disp + (i + 1) % faces)
            this.addTriangle(disp + (i + 1) % faces, disp + i + faces, disp + (i + 1) % faces + faces)
        }
    }
    
    setTranslationForCurrentPlant(isTranslated: boolean, aTranslateX: float, aTranslateY: float): void {
        this.currentPlantIsTranslated = isTranslated
        this.currentPlantTranslateX = aTranslateX
        this.currentPlantTranslateY = aTranslateY
    }
    
    outputType(): short {
        let result = -1
        if (this instanceof KfDrawingSurfaceForDXF) {
            result = ExportFormats.kDXF
        } else if (this instanceof KfDrawingSurfaceForPOV) {
            result = ExportFormats.kPOV
        } else if (this instanceof KfDrawingSurfaceFor3DS) {
            result = ExportFormats.k3DS
        } else if (this instanceof KfDrawingSurfaceForOBJ) {
            result = ExportFormats.kOBJ
        } else if (this instanceof KfDrawingSurfaceForVRML) {
            result = ExportFormats.kVRML
        } else if (this instanceof KfDrawingSurfaceForLWO) {
            result = ExportFormats.kLWO
        }
        return result
    }
    
    generateShortName(): string {
        let result = ""
        if (this.currentPlantNameLong.length <= 0) {
            return result
        }
        const shortNameLength = intMin(this.options.lengthOfShortName, this.currentPlantNameLong.length)
        for (let i = 0; i < shortNameLength; i++) {
            if (this.currentPlantNameLong[i] !== " ") {
                result = result + this.currentPlantNameLong[i]
            }
        }
        if (this.options.writePlantNumberInFrontOfName) {
            result = IntToStr(this.currentPlantIndex + 1) + result
        }
        return result
    }
    
}

export class KfTextFileExportSurface extends KfFileExportSurface {
    outputFile: TextFile = new TextFile()
    
    // ----------------------------------------------------------------------------- KfTextFileExportSurface 
    constructor(aFileName: string) {
        super(aFileName)
        // we assume that the file name has been already okayed by whoever created us
        this.outputFile.fileName = this.fileName
    }
    
    destroy(): void {
        // nothing yet
    }
    
    startFile(): void {
        // TODO: Use or remove: Rewrite(this.outputFile)
    }
    
    endFile(): void {
        // TODO: Use or remove: CloseFile(this.outputFile)
    }
    
}

export class KfDrawingSurfaceForDXF extends KfTextFileExportSurface {
    currentColorIndex: short = 0
    
    // ----------------------------------------------------------------------------- KfDrawingSurfaceForDXF 
    startFile(): void {
        super.startFile()
        writeln(this.outputFile, "999")
        writeln(this.outputFile, "DXF created by PlantStudio http://www.kurtz-fernhout.com")
        // v2.0 moved ENTITY section from starting and ending each plant to entire file - may fix bug
        // with programs only recognizing one plant in a file
        writeln(this.outputFile, "0")
        writeln(this.outputFile, "SECTION")
        writeln(this.outputFile, "2")
        writeln(this.outputFile, "ENTITIES")
    }
    
    endFile(): void {
        // v2.0 moved ENTITY section from starting and ending each plant to entire file - may fix bug
        // with programs only recognizing one plant in a file
        writeln(this.outputFile, "0")
        writeln(this.outputFile, "ENDSEC")
        writeln(this.outputFile, "0")
        writeln(this.outputFile, "EOF")
        super.endFile()
    }
    
    startPlant(aLongName: string, aPlantIndex: short): void {
        super.startPlant(aLongName, aPlantIndex)
        if (this.options.layeringOption === kLayerOutputAllTogether) {
            this.currentGroupingString = this.currentPlantNameLong.substring(0, 16)
        }
        if (this.options.dxf_whereToGetColors === kColorDXFFromOneColor) {
            this.currentColorIndex = this.options.dxf_wholePlantColorIndex
        }
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        if (this.options.dxf_whereToGetColors === kColorDXFFromPlantPartType) {
            this.currentColorIndex = this.options.dxf_plantPartColorIndexes[index]
        } else if (this.options.dxf_whereToGetColors === kColorDXFFromRGB) {
            this.currentColor = color
        }
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        if (this.options.dxf_whereToGetColors === kColorDXFFromPlantPartType) {
            this.currentColorIndex = this.options.dxf_plantPartColorIndexes[index]
        } else if (this.options.dxf_whereToGetColors === kColorDXFFromRGB) {
            this.currentColor = color
        }
    }
    
    drawPipeFaces(startPoints: KfPoint3D[], endPoints: KfPoint3D[], faces: short, segmentNumber: short): void {
        for (let i = 0; i <= faces - 1; i++) {
            // for this don't have to worry about segment number, we are not adding points and triangles
            this.draw3DFace(startPoints[i], endPoints[i], endPoints[(i + 1) % faces], startPoints[(i + 1) % faces])
        }
    }
    
    draw3DFace(point1: KfPoint3D, point2: KfPoint3D, point3: KfPoint3D, point4: KfPoint3D): void {
        writeln(this.outputFile, "0")
        writeln(this.outputFile, "3DFACE")
        writeln(this.outputFile, "8")
        writeln(this.outputFile, this.currentGroupingString)
        if (this.options.writeColors) {
            if (this.options.dxf_whereToGetColors === kColorDXFFromRGB) {
                writeln(this.outputFile, "62")
                writeln(this.outputFile, IntToStr(this.currentColor))
            } else {
                writeln(this.outputFile, "62")
                writeln(this.outputFile, IntToStr(this.currentColorIndex + 1))
            }
        }
        writeln(this.outputFile, "10")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point1.x, Axis.kX)))
        writeln(this.outputFile, "20")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * -point1.y, Axis.kY)))
        writeln(this.outputFile, "30")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point1.z, Axis.kZ)))
        writeln(this.outputFile, "11")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point2.x, Axis.kX)))
        writeln(this.outputFile, "21")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * -point2.y, Axis.kY)))
        writeln(this.outputFile, "31")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point2.z, Axis.kZ)))
        writeln(this.outputFile, "12")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point3.x, Axis.kX)))
        writeln(this.outputFile, "22")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * -point3.y, Axis.kY)))
        writeln(this.outputFile, "32")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point3.z, Axis.kZ)))
        writeln(this.outputFile, "13")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point4.x, Axis.kX)))
        writeln(this.outputFile, "23")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * -point4.y, Axis.kY)))
        writeln(this.outputFile, "33")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * point4.z, Axis.kZ)))
    }
    
    basicDrawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): void {
        this.draw3DFace(startPoint, startPoint, endPoint, endPoint)
    }
    
    basicDrawTriangle(triangle: KfTriangle): void {
        this.draw3DFace(triangle.points[0], triangle.points[1], triangle.points[2], triangle.points[2])
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {
        this.currentGroupingString = this.currentPlantNameShort + "_rem"
        // adds one; kLastDxfColorIndex is gray
        this.currentColorIndex = kLastDxfColorIndex - 1
        this.draw3DFace(p1, p2, p3, p3)
        this.draw3DFace(p1, p3, p4, p4)
    }
    
}

export class KfDrawingSurfaceForPOV extends KfTextFileExportSurface {
    currentComment: string = ""
    currentWidth: float = 0.0
    currentIndentLevel: int = 0
    currentRotateString: string = ""
    numPlantsDrawn: short = 0
    plantNames: string[] /* kMaxPOVPlants + 1 */ = Array(kMaxPOVPlants + 1)
     
    startFile(): void {
        super.startFile()
        writeln(this.outputFile, "// INC file for Persistence of Vision (POV) raytracer")
        writeln(this.outputFile, "// created by PlantStudio http://www.kurtz-fernhout.com")
        writeln(this.outputFile)
    }
    
    endFile(): void {
        writeln(this.outputFile)
        if (this.options.pov_commentOutUnionAtEnd) {
            writeln(this.outputFile, "/* ")
        }
        writeln(this.outputFile, "#declare allPlants_" + replacePunctuationWithUnderscores(stringUpTo(ExtractFileName(this.fileName), ".")) + " = union {")
        for (let i = 0; i < this.numPlantsDrawn; i++) {
            writeln(this.outputFile, String.fromCharCode(9) + "object { " + this.plantNames[i] + " }")
        }
        writeln(this.outputFile, String.fromCharCode(9) + "}")
        if (this.options.pov_commentOutUnionAtEnd) {
            writeln(this.outputFile, "*/ ")
        }
        super.endFile()
    }
    
    startPlant(aLongName: string, aPlantIndex: short): void {
        // in POV you can't have spaces in names
        aLongName = replacePunctuationWithUnderscores(aLongName)
        super.startPlant(aLongName, aPlantIndex)
        writeln(this.outputFile, "#declare " + this.currentPlantNameLong + " = union {")
        this.currentIndentLevel = 0
        this.indent()
        this.plantNames[this.numPlantsDrawn] = this.currentPlantNameLong
        this.numPlantsDrawn += 1
    }
    
    endPlant(): void {
        if ((this.currentPlantIsTranslated) && (this.options.translatePlantsToWindowPositions)) {
            writeln(this.outputFile, "translate <" + valueString(this.currentPlantTranslateX) + ", " + valueString(this.currentPlantTranslateY) + ", 0>")
        }
        if (!this.options.writeColors) {
            write(this.outputFile, "pigment { color rgb <0.8, 0.8, 0.8> }")
        }
        writeln(this.outputFile, "} // end " + this.currentPlantNameLong)
        writeln(this.outputFile)
        this.currentIndentLevel = 0
        super.endPlant()
    }
    
    startNestedGroupOfPlantParts(groupName: string, shortName: string, nestingType: short): void {
        switch (nestingType) {
            case NestingType.kNestingTypeInflorescence:
                if (!this.options.nest_Inflorescence) {
                    return
                }
                break
            case NestingType.kNestingTypeLeafAndPetiole:
                if (!this.options.nest_LeafAndPetiole) {
                    return
                }
                break
            case NestingType.kNestingTypeCompoundLeaf:
                if (!this.options.nest_CompoundLeaf) {
                    return
                }
                break
            case NestingType.kNestingTypePedicelAndFlowerFruit:
                if (!this.options.nest_PedicelAndFlowerFruit) {
                    return
                }
                break
            case NestingType.kNestingTypeFloralLayers:
                if (!this.options.nest_FloralLayers) {
                    return
                }
                break
            default:
                throw new Error("Problem: Unrecognized nesting type in KfDrawingSurfaceForPOV.startNestedGroupOfPlantParts.")
        }
        this.startUnion(groupName)
    }
    
    endNestedGroupOfPlantParts(nestingType: short): void {
        switch (nestingType) {
            case NestingType.kNestingTypeInflorescence:
                if (!this.options.nest_Inflorescence) {
                    return
                }
                break
            case NestingType.kNestingTypeLeafAndPetiole:
                if (!this.options.nest_LeafAndPetiole) {
                    return
                }
                break
            case NestingType.kNestingTypeCompoundLeaf:
                if (!this.options.nest_CompoundLeaf) {
                    return
                }
                break
            case NestingType.kNestingTypePedicelAndFlowerFruit:
                if (!this.options.nest_PedicelAndFlowerFruit) {
                    return
                }
                break
            case NestingType.kNestingTypeFloralLayers:
                if (!this.options.nest_FloralLayers) {
                    return
                }
                break
            default:
                throw new Error("Problem: Unrecognized nesting type in KfDrawingSurfaceForPOV.startNestedGroupOfPlantParts.")
        }
        this.endBrace(kDontWriteColor)
    }
    
    startPlantPart(aLongName: string, aShortName: string): void {
        this.startUnion(aLongName)
    }
    
    endPlantPart(): void {
        this.endBrace(kDontWriteColor)
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        this.startUnion(aLongName)
        this.setColor(color)
        this.currentWidth = width
    }
    
    endStemSegment(): void {
        // DO want to write color for this one
        this.endBrace(kWriteColor)
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        this.startMesh(color, aLongName)
        this.setColor(color)
    }
    
    end3DObject(): void {
        // DO want to write color for this one
        this.endBrace(kWriteColor)
    }
    
    indent(): void {
        this.currentIndentLevel += 1
    }
    
    unindent(): void {
        this.currentIndentLevel -= 1
        if (this.currentIndentLevel < 0) {
            this.currentIndentLevel = 0
        }
    }
    
    doIndenting(): void { 
        for (let i = 0; i < this.currentIndentLevel; i++) {
            write(this.outputFile, String.fromCharCode(9))
        }
    }
    
    startUnionOrMesh(startString: string, aColor: TColorRef, aComment: string): void {
        if (aColor >= 0) {
            this.currentColor = aColor
        }
        this.doIndenting()
        write(this.outputFile, startString + " {")
        if (aComment.length > 0) {
            writeln(this.outputFile, " // " + aComment)
        } else {
            writeln(this.outputFile, " // " + this.currentComment)
        }
        this.indent()
    }
    
    startUnion(aComment: string): void {
        this.startUnionOrMesh("union", -1, aComment)
    }
    
    startMesh(aColor: TColorRef, aComment: string): void {
        this.startUnionOrMesh("mesh", aColor, aComment)
    }
    
    setColor(aColor: TColorRef): void {
        this.currentColor = aColor
    }
    
    endBrace(writeColor: boolean): void {
        this.doIndenting()
        if ((writeColor) && (this.options.writeColors) && (this.currentColor >= 0)) {
            write(this.outputFile, "pigment { color rgb <" + valueString(getRValue(this.currentColor) / 256.0) + ", " + valueString(getGValue(this.currentColor) / 256.0) + ", " + valueString(getBValue(this.currentColor) / 256.0) + "> }")
        }
        writeln(this.outputFile, "}")
        this.unindent()
    }
    
    basicDrawLineFromTo(startPoint: KfPoint3D, endPoint: KfPoint3D): void {
        const endPointFinal: KfPoint3D = endPoint
        this.doIndenting()
        write(this.outputFile, "cylinder { ")
        writeln(this.outputFile, "<" + valueString((this.pressedOrNot(this.scale * startPoint.x, Axis.kX))) + ", " + valueString(this.pressedOrNot(this.scale * -startPoint.y, Axis.kY)) + ", " + valueString(this.pressedOrNot(this.scale * startPoint.z, Axis.kZ)) + ">, <" + valueString(this.pressedOrNot(this.scale * endPointFinal.x, Axis.kX)) + ", " + valueString(this.pressedOrNot(this.scale * -endPointFinal.y, Axis.kY)) + ", " + valueString(this.pressedOrNot(this.scale * endPointFinal.z, Axis.kZ)) + ">, " + valueString(this.scale * this.currentWidth) + " }")
    }
    
    basicDrawTriangle(triangle: KfTriangle): void {
        const p1 = triangle.points[0]
        const p2 = triangle.points[1]
        const p3 = triangle.points[2]
        this.doIndenting()
        write(this.outputFile, "triangle { <")
        // all y values must be negative because it seems our coordinate systems are different
        write(this.outputFile, valueString(this.pressedOrNot(this.scale * p1.x, Axis.kX)) + ", " + valueString(this.pressedOrNot(this.scale * -p1.y, Axis.kY)) + ", " + valueString(this.pressedOrNot(this.scale * p1.z, Axis.kZ)) + ">, <")
        write(this.outputFile, valueString(this.pressedOrNot(this.scale * p2.x, Axis.kX)) + ", " + valueString(this.pressedOrNot(this.scale * -p2.y, Axis.kY)) + ", " + valueString(this.pressedOrNot(this.scale * p2.z, Axis.kZ)) + ">, <")
        writeln(this.outputFile, valueString(this.pressedOrNot(this.scale * p3.x, Axis.kX)) + ", " + valueString(this.pressedOrNot(this.scale * -p3.y, Axis.kY)) + ", " + valueString(this.pressedOrNot(this.scale * p3.z, Axis.kZ)) + "> }")
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {
        this.startMesh(support_rgb(100, 100, 100), this.currentPlantNameShort + "_reminder")
        const triangle1 = new KfTriangle()
        const triangle2 = new KfTriangle()
        triangle1.points[0] = p1
        triangle1.points[1] = p2
        triangle1.points[2] = p3
        this.basicDrawTriangle(triangle1)
        triangle2.points[0] = p1
        triangle2.points[1] = p3
        triangle2.points[2] = p4
        this.basicDrawTriangle(triangle2)
        this.endBrace(kWriteColor)
    }
    
}

export class KfDrawingSurfaceForVRML extends KfTextFileExportSurface {
    currentIndentLevel: int = 0
    lastPlantPartName: string = ""
    lastMeshName: string = ""
    
    // ----------------------------------------------------------------------------- KfDrawingSurfaceForVRML 
    startFile(): void {
        let scaleString: string
        
        super.startFile()
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                writeln(this.outputFile, "#VRML V1.0 ascii")
                writeln(this.outputFile, "#Created by PlantStudio http://www.kurtz-fernhout.com")
                writeln(this.outputFile)
                break
            case kVRMLVersionTwo:
                writeln(this.outputFile, "#VRML V2.0 utf8")
                writeln(this.outputFile, "#Created by PlantStudio http://www.kurtz-fernhout.com")
                writeln(this.outputFile)
                break
        }
    }
    
    startPlant(aLongName: string, aPlantIndex: short): void {
        // in VRML you can't have spaces in names
        aLongName = replacePunctuationWithUnderscores(aLongName)
        super.startPlant(aLongName, aPlantIndex)
        this.currentIndentLevel = 0
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.writeThenIndent("DEF " + this.currentPlantNameShort + " Group {")
                break
            case kVRMLVersionTwo:
                this.writeThenIndent("DEF " + this.currentPlantNameShort + " Group {")
                this.writeThenIndent("children [")
                break
        }
    }
    
    endPlant(): void {
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.endBrace("plant " + this.currentPlantNameLong)
                writeln(this.outputFile)
                break
            case kVRMLVersionTwo:
                this.endBracket("children")
                this.endBrace("plant " + this.currentPlantNameLong)
                writeln(this.outputFile)
                break
        }
        this.currentIndentLevel = 0
        super.endPlant()
    }
    
    startNestedGroupOfPlantParts(groupName: string, shortName: string, nestingType: short): void {
        shortName = this.currentPlantNameShort + "_" + shortName
        switch (nestingType) {
            case NestingType.kNestingTypeInflorescence:
                if (!this.options.nest_Inflorescence) {
                    return
                }
                break
            case NestingType.kNestingTypeLeafAndPetiole:
                if (!this.options.nest_LeafAndPetiole) {
                    return
                }
                break
            case NestingType.kNestingTypeCompoundLeaf:
                if (!this.options.nest_CompoundLeaf) {
                    return
                }
                break
            case NestingType.kNestingTypePedicelAndFlowerFruit:
                if (!this.options.nest_PedicelAndFlowerFruit) {
                    return
                }
                break
            case NestingType.kNestingTypeFloralLayers:
                if (!this.options.nest_FloralLayers) {
                    return
                }
                break
            default:
                throw new Error("Problem: Unrecognized nesting type in KfDrawingSurfaceForVRML.startNestedGroupOfPlantParts.")
        }
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.writeThenIndent("DEF " + shortName + " Group {")
                break
            case kVRMLVersionTwo:
                this.writeThenIndent("DEF " + shortName + " Group {")
                this.writeThenIndent("children [")
                break
        }
    }
    
    endNestedGroupOfPlantParts(nestingType: short): void {
        switch (nestingType) {
            case NestingType.kNestingTypeInflorescence:
                if (!this.options.nest_Inflorescence) {
                    return
                }
                break
            case NestingType.kNestingTypeLeafAndPetiole:
                if (!this.options.nest_LeafAndPetiole) {
                    return
                }
                break
            case NestingType.kNestingTypeCompoundLeaf:
                if (!this.options.nest_CompoundLeaf) {
                    return
                }
                break
            case NestingType.kNestingTypePedicelAndFlowerFruit:
                if (!this.options.nest_PedicelAndFlowerFruit) {
                    return
                }
                break
            case NestingType.kNestingTypeFloralLayers:
                if (!this.options.nest_FloralLayers) {
                    return
                }
                break
            default:
                throw new Error("Problem: Unrecognized nesting type in KfDrawingSurfaceForVRML.endNestedGroupOfPlantParts.")
        }
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.endBrace("nested group")
                writeln(this.outputFile)
                break
            case kVRMLVersionTwo:
                this.endBracket("children")
                this.endBrace("nested group")
                writeln(this.outputFile)
                break
        }
    }
    
    startPlantPart(aLongName: string, aShortName: string): void {
        let shortName: string
        
        shortName = this.currentPlantNameShort + "_" + aShortName
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.writeThenIndent("DEF " + shortName + " Group {")
                break
            case kVRMLVersionTwo:
                this.writeThenIndent("DEF " + shortName + " Group {")
                this.writeThenIndent("children [")
                break
        }
        this.lastPlantPartName = shortName
    }
    
    endPlantPart(): void {
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.endBrace("plant part " + this.lastPlantPartName)
                writeln(this.outputFile)
                break
            case kVRMLVersionTwo:
                this.endBracket("children")
                this.endBrace("plant part " + this.lastPlantPartName)
                writeln(this.outputFile)
                break
        }
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        this.setColor(color)
        this.startMesh()
    }
    
    endStemSegment(): void {
        this.endMesh()
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        this.setColor(color)
        this.startMesh()
    }
    
    end3DObject(): void {
        this.endMesh()
    }
    
    startMesh(): void {
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.writeThenIndent("DEF " + this.currentGroupingString + " Group {")
                break
            case kVRMLVersionTwo:
                this.writeConsideringIndenting("DEF " + this.currentGroupingString + " Shape {")
                this.indent()
                if (this.options.writeColors) {
                    this.writeConsideringIndenting("appearance Appearance { material Material { diffuseColor " + valueString(getRValue(this.currentColor) / 256.0) + " " + valueString(getGValue(this.currentColor) / 256.0) + " " + valueString(getBValue(this.currentColor) / 256.0) + " } }")
                }
                break
        }
        this.lastMeshName = this.currentGroupingString
    }
    
    endMesh(): void {
        this.writePointsAndTriangles()
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                this.endBrace("mesh " + this.lastMeshName)
                writeln(this.outputFile)
                break
            case kVRMLVersionTwo:
                this.endBrace("shape " + this.lastMeshName)
                writeln(this.outputFile)
                break
        }
    }
    
    writePointsAndTriangles(): void {
        let i: short
        
        switch (this.options.vrml_version) {
            case kVRMLVersionOne:
                // shape hints
                this.writeThenIndent("ShapeHints {")
                this.writeConsideringIndenting("vertexOrdering COUNTERCLOCKWISE")
                this.writeConsideringIndenting("shapeType SOLID")
                this.writeConsideringIndenting("faceType CONVEX")
                this.endBrace("ShapeHints")
                if (this.options.writeColors) {
                    // color
                    this.writeConsideringIndenting("Material { diffuseColor [ " + valueString(getRValue(this.currentColor) / 256.0) + " " + valueString(getGValue(this.currentColor) / 256.0) + " " + valueString(getBValue(this.currentColor) / 256.0) + " ] }")
                }
                // coordinate points
                this.writeThenIndent("Coordinate3 {")
                this.writeThenIndent("point [")
                this.doIndenting()
                for (i = 0; i <= this.numPoints - 1; i++) {
                    write(this.outputFile, valueString(this.pressedOrNot(this.scale * this.points[i].x, Axis.kX)) + " " + valueString(this.pressedOrNot(this.scale * -this.points[i].y, Axis.kY)) + " " + valueString(this.pressedOrNot(this.scale * this.points[i].z, Axis.kZ)))
                    if (i < this.numPoints - 1) {
                        write(this.outputFile, ", ")
                    }
                    if ((i % kNumVRMLPointsPerLine === 0) || (i === this.numPoints - 1)) {
                        writeln(this.outputFile)
                        if (i < this.numPoints - 1) {
                            this.doIndenting()
                        }
                    }
                }
                this.endBracket("point")
                this.endBrace("Coordinate3")
                // faces
                //'DEF ' + self.currentGroupingString +
                this.writeThenIndent("IndexedFaceSet {")
                this.writeThenIndent("coordIndex [")
                this.doIndenting()
                for (i = 0; i <= this.numFaces - 1; i++) {
                    write(this.outputFile, IntToStr(this.faces[i].vertex1) + ", " + IntToStr(this.faces[i].vertex2) + ", " + IntToStr(this.faces[i].vertex3) + ", -1")
                    if (i < this.numFaces - 1) {
                        write(this.outputFile, ", ")
                    }
                    if ((i % kNumVRMLPointsPerLine === 0) || (i === this.numFaces - 1)) {
                        writeln(this.outputFile)
                        if (i < this.numFaces - 1) {
                            this.doIndenting()
                        }
                    }
                }
                this.endBracket("coordIndex")
                this.endBrace("IndexedFaceSet")
                break
            case kVRMLVersionTwo:
                this.writeThenIndent("geometry IndexedFaceSet {")
                this.writeThenIndent("coord Coordinate {")
                this.writeThenIndent("point [")
                this.doIndenting()
                for (i = 0; i <= this.numPoints - 1; i++) {
                    write(this.outputFile, valueString(this.pressedOrNot(this.scale * this.points[i].x, Axis.kX)) + " " + valueString(this.pressedOrNot(this.scale * -this.points[i].y, Axis.kY)) + " " + valueString(this.pressedOrNot(this.scale * this.points[i].z, Axis.kZ)))
                    if (i < this.numPoints - 1) {
                        write(this.outputFile, ", ")
                    }
                    if ((i % kNumVRMLPointsPerLine === 0) || (i === this.numPoints - 1)) {
                        writeln(this.outputFile)
                        if (i < this.numPoints - 1) {
                            this.doIndenting()
                        }
                    }
                }
                this.endBracket("point")
                this.endBrace("Coordinate")
                this.writeConsideringIndenting("ccw TRUE")
                this.writeConsideringIndenting("colorPerVertex FALSE")
                this.writeThenIndent("coordIndex [")
                this.doIndenting()
                for (i = 0; i <= this.numFaces - 1; i++) {
                    write(this.outputFile, IntToStr(this.faces[i].vertex1) + ", " + IntToStr(this.faces[i].vertex2) + ", " + IntToStr(this.faces[i].vertex3) + ", -1")
                    if (i < this.numFaces - 1) {
                        write(this.outputFile, ", ")
                    }
                    if ((i % kNumVRMLPointsPerLine === 0) || (i === this.numFaces - 1)) {
                        writeln(this.outputFile)
                        if (i < this.numFaces - 1) {
                            this.doIndenting()
                        }
                    }
                }
                this.endBracket("coordIndex")
                this.writeConsideringIndenting("creaseAngle 0.5")
                this.writeConsideringIndenting("normalPerVertex TRUE")
                this.writeConsideringIndenting("solid FALSE")
                this.endBrace("IndexedFaceSet")
                break
        }
        this.numPoints = 0
        this.numFaces = 0
    }
    
    setColor(aColor: TColorRef): void {
        this.currentColor = aColor
    }
    
    endBrace(comment: string): void {
        this.doIndenting()
        writeln(this.outputFile, "} # " + comment)
        this.unindent()
    }
    
    endBracket(comment: string): void {
        this.doIndenting()
        writeln(this.outputFile, "] # " + comment)
        this.unindent()
    }
    
    indent(): void {
        this.currentIndentLevel += 1
    }
    
    unindent(): void {
        this.currentIndentLevel -= 1
        if (this.currentIndentLevel < 0) {
            this.currentIndentLevel = 0
        }
    }
    
    doIndenting(): void {
        for (let i = 0; i < this.currentIndentLevel; i++) {
            // String.fromCharCode(9));
            write(this.outputFile, "  ")
        }
    }
    
    writeConsideringIndenting(aString: string): void {
        this.doIndenting()
        writeln(this.outputFile, aString)
    }
    
    indentThenWrite(aString: string): void {
        this.indent()
        this.doIndenting()
        writeln(this.outputFile, aString)
    }
    
    writeThenIndent(aString: string): void {
        this.doIndenting()
        writeln(this.outputFile, aString)
        this.indent()
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void { 
        this.setColor(support_rgb(100, 100, 100))
        this.currentGroupingString = this.currentPlantNameShort + "_reminder"
        this.startMesh()
        const numPointsAtStart = this.numPoints
        this.addPoint(p1)
        this.addPoint(p2)
        this.addPoint(p3)
        this.addPoint(p4)
        this.addTriangle(numPointsAtStart, numPointsAtStart + 1, numPointsAtStart + 3)
        this.addTriangle(numPointsAtStart + 1, numPointsAtStart + 2, numPointsAtStart + 3)
        this.writePointsAndTriangles()
        this.endMesh()
    }
    
}

export class KfDrawingSurfaceForOBJ extends KfTextFileExportSurface {
    numMaterialsStored: short = 0
    materialColors: TColorRef[] /* kMaxStoredMaterials + 1 */ = Array(kMaxStoredMaterials + 1)
    materialNames: string[] /* kMaxStoredMaterials + 1 */ = Array(kMaxStoredMaterials + 1)
    materialsFileName: string = ""
    
    // ----------------------------------------------------------------------------- KfDrawingSurfaceForOBJ 
    startFile(): void {
        super.startFile()
        writeln(this.outputFile, "# OBJ file created by PlantStudio http://www.kurtz-fernhout.com")
        if (this.options.writeColors) {
            this.materialsFileName = ExtractFilePath(this.fileName) + stringUpTo(ExtractFileName(this.fileName), ".") + ".mtl"
            writeln(this.outputFile)
            writeln(this.outputFile, "# Materials file must be in same directory")
            writeln(this.outputFile, "mtllib " + ExtractFileName(this.materialsFileName))
        }
    }
    
    endFile(): void {
        if (this.options.writeColors) {
            this.writeMaterialDescriptionsToFile()
        }
        super.endFile()
    }
    
    startPlant(aLongName: string, aPlantIndex: short): void {
        super.startPlant(aLongName, aPlantIndex)
        writeln(this.outputFile)
        writeln(this.outputFile, "# plant \"" + this.currentPlantNameLong + "\"")
        writeln(this.outputFile, "o " + this.currentPlantNameShort)
        if ((domain.registered) && (this.options.layeringOption === kLayerOutputAllTogether)) {
            this.startGroup(this.currentPlantNameShort)
        }
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        if ((this.options.layeringOption !== kLayerOutputAllTogether) && (this.currentGroupingString !== "")) {
            this.startGroup(this.currentGroupingString)
        }
        // color should always be set by the part type, no matter what grouping setting
        this.startColor(color, this.currentPlantNameShort + "_" + aShortName)
        this.startVerticesAndTriangles()
    }
    
    endStemSegment(): void {
        this.endVerticesAndTriangles()
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        if ((this.options.layeringOption !== kLayerOutputAllTogether) && (this.currentGroupingString !== "")) {
            this.startGroup(this.currentGroupingString)
        }
        // color should always be set by the part type, no matter what grouping setting
        this.startColor(color, this.currentPlantNameShort + "_" + aShortName)
    }
    
    writeMaterialDescriptionsToFile(): void {
        let materialsFile: TextFile
        let i: short
        let colorString: string
        let fileInfo: SaveFileNamesStructure
        
        if (this.numMaterialsStored <= 0) {
            return
        }
        // TODO: Unfinished writeMaterialDescriptionsToFile
        alert("TODO: Unfinished writeMaterialDescriptionsToFile")
        /*
        if (usupport.getFileSaveInfo(FileType.kFileTypeMTL, usupport.kDontAskForFileName, this.materialsFileName, fileInfo)) {
            AssignFile(materialsFile, fileInfo.tempFile)
            try {
                usupport.setDecimalSeparator()
                Rewrite(materialsFile)
                usupport.startFileSave(fileInfo)
                writeln(materialsFile, "# Materials for file " + stringUpTo(ExtractFileName(this.materialsFileName), ".") + ".obj")
                writeln(materialsFile, "# Created by PlantStudio http://www.kurtz-fernhout.com")
                writeln(materialsFile, "# These files must be in the same directory for the materials to be read correctly.")
                for (i = 0; i < this.numMaterialsStored; i++) {
                    if (this.materialNames[i] === "") {
                        //newmtl name
                        //Ka  0.1 0.0 0.0
                        //Kd  0.4 0.0 0.0
                        //Ks  0.4 0.0 0.0
                        //Ns  20
                        //d  1.0 (0 transparent 1 opaque)
                        //illum 1
                        continue
                    }
                    writeln(materialsFile, "newmtl " + this.materialNames[i])
                    colorString = valueString(getRValue(this.materialColors[i]) / 255.0) + " " + valueString(getGValue(this.materialColors[i]) / 255.0) + " " + valueString(getBValue(this.materialColors[i]) / 255.0)
                    writeln(materialsFile, "Ka  " + colorString)
                    writeln(materialsFile, "Kd  " + colorString)
                    writeln(materialsFile, "Ks  " + colorString)
                    writeln(materialsFile, "d 1.0")
                    writeln(materialsFile, "illum 1")
                    writeln(materialsFile)
                }
                fileInfo.writingWasSuccessful = true
            } finally {
                CloseFile(materialsFile)
                usupport.cleanUpAfterFileSave(fileInfo)
            }
        }
        */
    }
    
    storeMaterialDescription(aName: string, aColor: TColorRef): void {
        if (this.numMaterialsStored > 0) {
            for (let i = 0; i < this.numMaterialsStored; i++) {
                if (this.materialNames[i] === aName) {
                    return
                }
            }
        }
        if (this.numMaterialsStored >= kMaxStoredMaterials) {
            return
        }
        this.numMaterialsStored += 1
        this.materialColors[this.numMaterialsStored] = aColor
        this.materialNames[this.numMaterialsStored] = aName
    }
    
    startGroup(aName: string): void {
        writeln(this.outputFile)
        writeln(this.outputFile, "g " + aName)
        writeln(this.outputFile, "s off")
    }
    
    startColor(aColor: TColorRef, aMaterialName: string): void {
        if (!this.options.writeColors) {
            return
        }
        writeln(this.outputFile)
        writeln(this.outputFile, "usemtl " + aMaterialName)
        this.storeMaterialDescription(aMaterialName, aColor)
    }
    
    endVerticesAndTriangles(): void {
        writeln(this.outputFile)
        writeln(this.outputFile, "# " + IntToStr(this.numPoints) + " vertices")
        for (let i = 0; i < this.numPoints; i++) {
            writeln(this.outputFile, "v " + valueString(this.pressedOrNot(this.scale * this.points[i].x, Axis.kX)) + " " + valueString(this.pressedOrNot(this.scale * -this.points[i].y, Axis.kY)) + " " + valueString(this.pressedOrNot(this.scale * this.points[i].z, Axis.kZ)))
        }
        writeln(this.outputFile)
        writeln(this.outputFile, "# " + IntToStr(this.numFaces) + " faces")
        for (let i = 0; i < this.numFaces; i++) {
            writeln(this.outputFile, "f " + IntToStr(this.faces[i].vertex1 - this.numPoints) + " " + IntToStr(this.faces[i].vertex2 - this.numPoints) + " " + IntToStr(this.faces[i].vertex3 - this.numPoints) + " ")
        }
        this.numPoints = 0
        this.numFaces = 0
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {
        this.startGroup(this.currentPlantNameShort + "_reminder")
        this.startColor(support_rgb(100, 100, 100), "reminder_gray")
        const numPointsAtStart = this.numPoints
        this.startVerticesAndTriangles()
        this.addPoint(p1)
        this.addPoint(p2)
        this.addPoint(p3)
        this.addPoint(p4)
        this.addTriangle(numPointsAtStart, numPointsAtStart + 1, numPointsAtStart + 3)
        this.addTriangle(numPointsAtStart + 1, numPointsAtStart + 2, numPointsAtStart + 3)
        this.endVerticesAndTriangles()
        if (this.options.layeringOption === kLayerOutputAllTogether) {
            this.startGroup(this.currentPlantNameShort)
        }
    }
    
}

export class KfBinaryFileExportSurface extends KfFileExportSurface {
    stream: TFileStream | null = null
    chunkStartStack: int[] = []
    
    startFile(): void {
        this.stream = new TFileStream(this.fileName, TFileStream.fmCreate || TFileStream.fmShareExclusive)
    }
    
    endFile(): void {
        throw new Error("subclasses must override")
    }
    
    writeStringZ(value: string): void {
        // TODO: CONVERT: writeStringZ assumes plain ASCII characters
        let stringBuffer: byte[] = new Array(1025)

        if (value.length > 1023) {
            throw new Error("Problem: String too long in KfBinaryFileExportSurface.writeStringZ.")
        }
        for (let i = 0; i < value.length; i++) {
            stringBuffer[i] = value[i].charCodeAt(0)
        }
        stringBuffer[value.length] = 0
        this.stream!.WriteBuffer(stringBuffer, value.length + 1)
        // maybe should align on four byte boundaries for efficiency of seeks later?
    }
    
    writeByte(value: byte): void {
        this.stream!.WriteBuffer(value, 1)
    }
    
    writeWord(value: byte): void {
        let swappedBytes: byte[] = [0, 0]
        
        if (this.isLittleEndian()) {
            this.stream!.WriteBuffer(value, 2)
        } else {
            swappedBytes[1] = value && 255
            swappedBytes[0] = value >> 8
            this.stream!.WriteBuffer(swappedBytes, 2)
        }
    }
    
    writeDword(value: long): void {
        let swappedBytes: byte[] = [0, 0, 0, 0]
        
        if (this.isLittleEndian()) {
            this.stream!.WriteBuffer(value, 4)
        } else {
            swappedBytes[3] = value && 255
            swappedBytes[2] = (value >> 8) && 255
            swappedBytes[1] = (value >> 16) && 255
            swappedBytes[0] = (value >> 24) && 255
            this.stream!.WriteBuffer(swappedBytes, 4)
        }
    }
    
    writeFloat(value: float): void {
        let convert: SingleOverlay
        let swappedBytes: byte[] = [0, 0, 0, 0]
        
        if (this.isLittleEndian()) {
            this.stream!.WriteBuffer(value, 4)
        } else {
            /* TODO: PORT -- Implement writeFloat correctly for endianness
            convert.numeric = value
            swappedBytes[3] = convert.bytes[0]
            swappedBytes[2] = convert.bytes[1]
            swappedBytes[1] = convert.bytes[2]
            swappedBytes[0] = convert.bytes[3]
            this.stream.WriteBuffer(swappedBytes, 4)
            */
        }
    }
    
    isLittleEndian(): boolean {
        // subclasses should override if they need to change this
        return true
    }
    
}

export class KfDrawingSurfaceFor3DS extends KfBinaryFileExportSurface {
    currentMaterialName: string = "not defined"
    
    startFile(): void {
        super.startFile()
        // 4d4dH 	M3DMAGIC; 3DS Magic Number (.3DS file)
        this.startChunk(0x4D4D)
        // 3d3dH 	MDATA; Mesh Data Magic Number (.3DS files sub of 4d4d)
        this.startChunk(0x3D3D)
    }
    
    endFile(): void {
        // 3d3dH 	MDATA; Mesh Data Magic Number (.3DS files sub of 4d4d)
        this.finishChunk(0x3D3D)
        // 4d4dH 	M3DMAGIC; 3DS Magic Number (.3DS file)
        this.finishChunk(0x4D4D)
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        this.currentMaterialName = this.currentPlantNameShort + "_" + aShortName
        this.startVerticesAndTriangles()
    }
    
    endStemSegment(): void {
        this.endVerticesAndTriangles()
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        this.currentMaterialName = this.currentPlantNameShort + "_" + aShortName
    }
    
    startVerticesAndTriangles(): void {
        this.startMeshObject(this.currentGroupingString)
    }
    
    endVerticesAndTriangles(): void {
        // 4110H 	POINT_ARRAY short npoints; struct (float x, y, z;) points[npoints];
        this.startChunk(0x4110)
        this.writeWord(this.numPoints)
        for (let i = 0; i < this.numPoints; i++) {
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].x, Axis.kX))
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].y, Axis.kY))
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].z, Axis.kZ))
        }
        this.finishChunk(0x4110)
        // 4120H 	FACE_ARRAY may be followed by smooth_group short nfaces;
        // struct (short vertex1, vertex2, vertex3; short flags;) facearray[nfaces];
        this.startChunk(0x4120)
        this.writeWord(this.numFaces)
        for (let i = 0; i < this.numFaces; i++) {
            this.writeWord(this.faces[i].vertex1)
            this.writeWord(this.faces[i].vertex2)
            this.writeWord(this.faces[i].vertex3)
            this.writeWord(7)
        }
        if (this.options.writeColors) {
            // now set all faces to be of same material
            this.startChunk(0x4130)
            this.writeStringZ(this.currentMaterialName)
            this.writeWord(this.numFaces)
            for (let i = 0; i < this.numFaces; i++) {
                this.writeWord(i)
            }
            this.finishChunk(0x4130)
        }
        this.finishChunk(0x4120)
        // close mesh
        this.finishMeshObject()
        // zero out
        this.numFaces = 0
        this.numPoints = 0
    }
    
    startMeshObject(name: string): void {
        // 4000H 	NAMED_OBJECT cstr name;
        this.startChunk(0x4000)
        this.writeStringZ(name)
        // 4100H 	N_TRI_OBJECT named triangle object followed by point_array, point_flag_array, mesh_matrix, face_array
        this.startChunk(0x4100)
    }
    
    finishMeshObject(): void {
        // 4100H 	N_TRI_OBJECT named triangle object followed by point_array, point_flag_array, mesh_matrix, face_array
        this.finishChunk(0x4100)
        // 4000H 	NAMED_OBJECT cstr name;
        this.finishChunk(0x4000)
    }
    
    pushChunkStart(): void {
        const position: int = this.stream!.Position
        this.chunkStartStack.push(position)
    }
    
    popChunkStartAndFixupChunkSize(): void {
        const totalSize: int = this.stream!.Size
        const lastIndex: int = this.chunkStartStack.length - 1
        if (lastIndex < 0) {
            // should check if -1
            throw new Error("Problem with stack indexing for 3DS writing in method KfDrawingSurfaceFor3DS.popChunkStartAndFixupChunkSize.")
        }
        const startSize: int = this.chunkStartStack[lastIndex]
        this.chunkStartStack.length = lastIndex
        const chunkSize: int = totalSize - startSize
        // skip two to avoid overwriting chunk type
        this.stream!.Seek(startSize + 2, TFileStream.soFromBeginning)
        this.writeDword(chunkSize)
        this.stream!.Seek(0, TFileStream.soFromEnd)
    }
    
    startChunk(chunkID: int): void {
        this.pushChunkStart()
        this.writeWord(chunkID)
        // write placeholder dword that will be patched later
        this.writeDword(0)
    }
    
    finishChunk(chunkType: int): void {
        this.popChunkStartAndFixupChunkSize()
    }
    
    writeMaterialDescription(index: short, aColor: TColorRef): void {
        if (!this.options.writeColors) {
            return
        }
        if (index < 0) {
            this.writeMaterialColorChunk(this.currentPlantNameShort + "_rem", getRValue(aColor), getGValue(aColor), getBValue(aColor))
        } else {
            this.writeMaterialColorChunk(this.currentPlantNameShort + "_" + shortNameForDXFPartType(index), getRValue(aColor), getGValue(aColor), getBValue(aColor))
        }
    }
    
    writeColorChunk(r: byte, g: byte, b: byte): void {
        this.startChunk(0x0011)
        this.writeByte(r)
        this.writeByte(g)
        this.writeByte(b)
        this.finishChunk(0x0011)
    }
    
    writeMaterialColorChunk(materialName: string, r: byte, g: byte, b: byte): void {
        // Material editor chunk
        this.startChunk(0xAFFF)
        // Material name
        this.startChunk(0xA000)
        this.writeStringZ(materialName)
        this.finishChunk(0xA000)
        // Material ambient color
        this.startChunk(0xA010)
        this.writeColorChunk(r, g, b)
        this.finishChunk(0xA010)
        // Material diffuse color
        this.startChunk(0xA020)
        this.writeColorChunk(r, g, b)
        this.finishChunk(0xA020)
        this.finishChunk(0xAFFF)
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {  
        this.currentGroupingString = this.currentPlantNameShort + "_rem"
        this.currentMaterialName = this.currentPlantNameShort + "_rem"
        const numPointsAtStart = this.numPoints
        this.startVerticesAndTriangles()
        this.addPoint(p1)
        this.addPoint(p2)
        this.addPoint(p3)
        this.addPoint(p4)
        this.addTriangle(numPointsAtStart, numPointsAtStart + 1, numPointsAtStart + 3)
        this.addTriangle(numPointsAtStart + 1, numPointsAtStart + 2, numPointsAtStart + 3)
        this.endVerticesAndTriangles()
    }
    
}

export class KfDrawingSurfaceForLWO extends KfBinaryFileExportSurface {
    currentSurfaceID: short = 0
    numSurfacesStored: short = 0
    surfaceColors: TColorRef[] = Array(kMaxStoredMaterials + 1)
    surfaceNames: string[] = Array(kMaxStoredMaterials + 1)
    
    // ----------------------------------------------------------------------------- KfDrawingSurfaceForLWO 
    endFile(): void {
        // start file
        this.startChunk("FORM")
        this.writeTagOfFourCharacters("LWOB")
        // points
        this.startChunk("PNTS")
        for (let i = 0; i < this.numPoints; i++) {
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].x, Axis.kX))
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].y, Axis.kY))
            this.writeFloat(this.pressedOrNot(this.scale * this.points[i].z, Axis.kZ))
        }
        this.finishChunk()
        if (this.options.writeColors) {
            // surfaces
            this.startChunk("SRFS")
            // TODO: Is this off by one?
            for (let i = 1; i <= this.numSurfacesStored; i++) {
                this.writeStringZ(this.surfaceNames[i])
                if (odd(this.surfaceNames[i].length + 1)) {
                    // 1 is for terminating zero
                    this.writeByte(0)
                }
            }
            this.finishChunk()
        } else {
            this.startChunk("SRFS")
            // if you change this to an odd # considering the end zero you must pad it
            this.writeStringZ("default")
            this.finishChunk()
        }
        // faces
        this.startChunk("POLS")
        for (let i = 0; i < this.numFaces; i++) {
            this.writeWord(3)
            this.writeWord(this.faces[i].vertex1)
            this.writeWord(this.faces[i].vertex2)
            this.writeWord(this.faces[i].vertex3)
            if (this.options.writeColors) {
                this.writeWord(this.faces[i].surfaceID)
            } else {
                this.writeWord(1)
            }
        }
        this.finishChunk()
        if (this.options.writeColors) {
            // TODO: Is this off by one?
            for (let i = 1; i <= this.numSurfacesStored; i++) {
                // surfaces again
                this.startChunk("SURF")
                this.writeStringZ(this.surfaceNames[i])
                if (odd(this.surfaceNames[i].length + 1)) {
                    //terminating zero
                    this.writeByte(0)
                }
                this.writeTagOfFourCharacters("COLR")
                this.writeWord(4)
                this.writeByte(getRValue(this.surfaceColors[i]))
                this.writeByte(getGValue(this.surfaceColors[i]))
                this.writeByte(getBValue(this.surfaceColors[i]))
                this.writeByte(0)
                this.writeTagOfFourCharacters("FLAG")
                this.writeWord(2)
                // double-sided flag
                this.writeWord(0x0100)
                this.writeTagOfFourCharacters("DIFF")
                this.writeWord(2)
                this.writeWord(256)
                this.finishChunk()
            }
        } else {
            this.startChunk("SURF")
            // if you change this to an odd # considering the end zero you must pad it
            this.writeStringZ("default")
            this.writeTagOfFourCharacters("COLR")
            this.writeWord(4)
            this.writeByte(200)
            this.writeByte(200)
            this.writeByte(200)
            this.writeByte(0)
            this.finishChunk()
        }
        // finishes 'FORM' chunk
        this.finishChunk()
        this.numFaces = 0
        this.numPoints = 0
    }
    
    isLittleEndian(): boolean {
        return false
    }
    
    startStemSegment(aLongName: string, aShortName: string, color: TColorRef, width: float, index: short): void {
        super.startStemSegment(aLongName, aShortName, color, width, index)
        //currentPlantNameShort + '_' + aShortName
        this.currentSurfaceID = this.lookUpSurfaceIDForName(this.currentGroupingString, color)
    }
    
    lookUpSurfaceIDForName(aName: string, color: TColorRef): short {
        for (let i = 1; i <= this.numSurfacesStored; i++) {
            if (this.surfaceNames[i] === aName) {
                return i
            }
        }
        if (this.numSurfacesStored < kMaxStoredMaterials) {
            this.numSurfacesStored += 1
            this.surfaceNames[this.numSurfacesStored] = aName
            this.surfaceColors[this.numSurfacesStored] = color
        }
        return this.numSurfacesStored
    }
    
    drawPipeFaces(startPoints: KfPoint3D[], endPoints: KfPoint3D[], faces: short, segmentNumber: short): void {  
        const firstPtIndex = this.numPoints
        for (let i = 0; i < faces; i++) {
            this.addPoint(startPoints[i])
        }
        for (let i = 0; i < faces; i++) {
            this.addPoint(endPoints[i])
        }
        for (let i = 0; i < faces; i++) {
            this.addTriangle(firstPtIndex + i, firstPtIndex + i + faces, firstPtIndex + (i + 1) % faces)
            this.addTriangle(firstPtIndex + (i + 1) % faces, firstPtIndex + i + faces, firstPtIndex + (i + 1) % faces + faces)
        }
    }
    
    start3DObject(aLongName: string, aShortName: string, color: TColorRef, index: short): void {
        super.start3DObject(aLongName, aShortName, color, index)
        //currentPlantNameShort + '_' + aShortName
        this.currentSurfaceID = this.lookUpSurfaceIDForName(this.currentGroupingString, color)
    }
    
    addTriangle(a: int, b: int, c: int): void {
        this.addTriangleWithSurface(a, b, c, this.currentSurfaceID)
    }
    
    addTriangleWithSurface(a: int, b: int, c: int, surfaceID: int): void {
        if (this.numFaces >= kMax3DFaces) {
            throw new Error("Problem: Too many faces in LWO; in method KfDrawingSurfaceFor3DS.addTriangle.")
        }
        this.faces[this.numFaces].vertex1 = a
        this.faces[this.numFaces].vertex2 = b
        this.faces[this.numFaces].vertex3 = c
        this.faces[this.numFaces].surfaceID = this.currentSurfaceID
        this.numFaces += 1
    }
    
    pushChunkStart(): void {
        const position: int = this.stream!.Position
        this.chunkStartStack.push(position)
    }
    
    popChunkStartAndFixupChunkSize(): void {
        const totalSize: int = this.stream!.Size
        const lastIndex = this.chunkStartStack.length - 1
        if (lastIndex < 0) {
            // should check if -1
            throw new Error("Problem with stack indexing for 3DS writing in method KfDrawingSurfaceFor3DS.popChunkStartAndFixupChunkSize.")
        }
        const startSize: int = this.chunkStartStack[lastIndex]
        this.chunkStartStack.length = lastIndex
        const chunkSize: int = totalSize - startSize
        // skip back four
        this.stream!.Seek(startSize - 4, TFileStream.soFromBeginning)
        // lwo chunk sizes do not include the header
        this.writeDword(chunkSize)
        this.stream!.Seek(0, TFileStream.soFromEnd)
    }
    
    startChunk(chunkName: string): void {
        this.writeTagOfFourCharacters(chunkName)
        // write placeholder dword that will be patched later
        this.writeDword(0)
        this.pushChunkStart()
    }
    
    finishChunk(): void {
        this.popChunkStartAndFixupChunkSize()
    }
    
    writeTagOfFourCharacters(aString: string): void {
        this.writeByte(aString[0].charCodeAt(0))
        this.writeByte(aString[1].charCodeAt(0))
        this.writeByte(aString[2].charCodeAt(0))
        this.writeByte(aString[3].charCodeAt(0))
    }
    
    writeRegistrationReminder(p1: KfPoint3D, p2: KfPoint3D, p3: KfPoint3D, p4: KfPoint3D): void {   
        this.currentSurfaceID = this.lookUpSurfaceIDForName(this.currentPlantNameShort + "_rem", support_rgb(100, 100, 100))
        const numPointsAtStart = this.numPoints
        this.addPoint(p1)
        this.addPoint(p2)
        this.addPoint(p3)
        this.addPoint(p4)
        this.addTriangle(numPointsAtStart, numPointsAtStart + 1, numPointsAtStart + 3)
        this.addTriangle(numPointsAtStart + 1, numPointsAtStart + 2, numPointsAtStart + 3)
    }
    
}

// VRML 1.0 spec
//
//DEF plantName Group {
//  DEF nestingName Group {
//    DEF partName Group {
//      Material { diffuseColor [ 0.19 0.39 0.19 ] }
//	    ShapeHints {
//	      vertexOrdering	COUNTERCLOCKWISE
//	      shapeType	SOLID
//	      creaseAngle	3.14159
//	      } # ShapeHints
//      Coordinate3 {
//          point [
//            49.64	304.6	117.55	,
//            56.71	312.51	123.85	,
//            ] # point
//          } # Coordinate3
//      IndexedFaceSet {
//        coordIndex [
//          0	, 1	, 2	, -1	,
//          1	, 3	, 2	, -1	,
//          ] # coordIndex
//        } # IndexedFaceSet
//      } # Group partName
//    } # Group nestingName
//  } # Group plantName
//
// VRML 2.0 spec
//
//DEF plantName Group {
//  children [
//  DEF nestingName Group {
//    children [
//      DEF partName Shape {
//        appearance Appearance { material Material { diffuseColor  0.99 0  0.5 } }
//        geometry IndexedFaceSet {
//          coord Coordinate {
//            point [
//              49.64	304.6	117.55	,
//              56.71	312.51	123.85	,
//              ] # point
//            } # Coordinate
//          ccw TRUE
//          colorPerVertex FALSE
//          coordIndex [
//            0	, 1	, 2	, -1	,
//            1	, 3	, 2	, -1	,
//            ] # coordIndex
//          creaseAngle 0.5
//          normalPerVertex TRUE
//          solid FALSE
//          } #  IndexedFaceSet
//        } # Shape
//      ] # children nestingName
//      } # Group nestingName
//    ] # children plantName
//  } # Group plantName
//
