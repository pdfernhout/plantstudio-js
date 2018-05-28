// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs, short, int, StrToFloat, byte, long } from "./common"
import { TRect } from "./TRect";
import { PdTraverser } from "./PdTraverser";
import { PdPlant } from "./PdPlant";

// TODO: Implement darkerColorWithSubtraction from usupport
export function darkerColorWithSubtraction(a: number, b: number) {
    return a
}

// TODO: Fix copied code from utdo
export const kMaximumRecordedPoints = 10000
export const kTdoLineContrastIndex = 10
export const kTdoForeColor = ColorDefs.clSilver
export const kTdoBackColor = ColorDefs.clGray

// TODO: Implement PdStreamableObject
export class PdStreamableObject {
    instanceSize = 0

    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        throw new Error("TODO")
    }

    streamUsingFiler(filer: PdFiler) {
        throw new Error("TODO")
    }
}

// TODO: Replace PdClassAndVersionInformationRecord from Ufiler
export interface PdClassAndVersionInformationRecord {
    classNumber: short
    versionNumber: short
    additionNumber: short
}

// TODO: Replace PdFiler from Ufiler
export class PdFiler {
    isReading() {
        return true
    }
    isWriting() {
        return false
    }
    streamBytes(bytes: any, size: number): any {
        return bytes
    }
    streamLongint(value: any): any {
        return value
    }
    streamShortString(text: string): string {
        return text
    }
    streamSmallint(value: any): any {
        return value
    }
    streamSingle(value: any): any {
        return value
    }
    streamSinglePoint(point: SinglePoint): void {
    }
    streamRect(rect: TRect): void {
    }
    streamBoolean(value: boolean): boolean {
        return value
    }
    streamColorRef(value: number): number {
        return value
    }

}

export function FIX_sizeof(object: Object): number {
    return 0
}

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

// TODO: Fix DebugPrint from udebug that should have result stored somewhere
export function DebugPrint(aMessage: string): void {
    console.log("DebugPrint: " + aMessage)
}

// TODO: Fix digitValueString stub from usupport
export function digitValueString(value: float) {
    return "" + value
}

// TODO: Fix kFieldFloat
export const kFieldFloat = 1

// TODO: Fix boundForString stub from usupport
export function boundForString(boundString: string, fieldType: int): [number, boolean] {
    return [StrToFloat(boundString), true]
}

// TODO: Fix messageForExceptionType stub from usupport
export function messageForExceptionType(e: Error, methodName: string): void {
    console.log("Exception", e);
    DebugPrint("Exception in " + methodName + " with " + e)
}

// TODO: Fix SinglePoint from usupport
export class SinglePoint {
    x: float
    y: float
    reservedZ: float

    constructor(x = 0.0, y = 0.0) {
        this.x = x
        this.y = y
    }
}

// TODO: Fix ucursor stub from ucursor
export const ucursor = {
    cursor_startWait: () => {},
    cursor_stopWait: () => {},
}

// TODO: Fix MainForm stub from umain
export const MainForm = {
    updateForChangeToPlantBitmaps: () => {},
    cursorModeForDrawing: null,
    exceptionResizingPlantBitmap: () => { throw new Error("exceptionResizingPlantBitmap") },
    screenBytesPerPixel: () => 4,
    drawingPaintBox: new TRect(),
    inFileOpen: false,
    inFormCreation: false,
    drawing: false,
    roomForPlantBitmap: (something: any, bytesThisBitmapWillBe: number) => true,
    startDrawProgress: (totalPlantParts: number) => {},
    finishDrawProgress: () => {},
    isSelected: (something: any) => false,
    focusedPlant: () => null,
    plantsAsTextMemo: [],
    updateParameterValuesWithUpdateListForPlant: (something: any, updateList: any[]) => {},
    showDrawProgress: (value: number) => {},
}

// TOFO: Fix PdBitmap stub
export class PdBitmap extends PdStreamableObject {
    Width = 1
    Height = 1
    Transparent = true
    TransparentMode = <any>null // delphi_compatability.TTransparentMode.tmFixed
    TransparentColor = ColorDefs.clBlack // domain.options.backgroundColor
}


// TODO: Fix PdPlantPart stub
export class PdPlantPart extends PdStreamableObject {
    plant: PdPlant
}

// TODO: Fix PdInternode stub
export class PdInternode extends PdPlantPart {
    traversingDirection: number
    phytomerAttachedTo: PdInternode
    leftBranchPlantPart: PdInternode | null
    rightBranchPlantPart: PdInternode | null
    nextPlantPart: PdInternode | null
    isPhytomer() { return true }
    traverseActivity(mode: number, traverser: PdTraverser) {}
}

// TODO: Fix support_rgb from usupport
export function support_rgb(R: byte, G: byte, B: byte): long {
    return R << 16 + G << 8 + B 
}

// Fix TListCollection_streamUsingFiler derived From ucollect -- not sure where to put code
export function TListCollection_streamUsingFiler(list: PdStreamableObject[], filer: PdFiler, functionForCreating: () => PdStreamableObject): void {
    let countOnStream: long = 0

    if (filer.isReading()) {
        list.length = 0
        countOnStream = filer.streamLongint(countOnStream)
        if (countOnStream > 0) {
            for (let i = 0; i < countOnStream; i++) {
                const streamableObject: PdStreamableObject = functionForCreating()
                streamableObject.streamUsingFiler(filer)
                list.push(streamableObject)
            }
        }
    } else {
        // filer is writing or counting
        countOnStream = list.length
        countOnStream = filer.streamLongint(countOnStream)
        if (countOnStream > 0) {
            for (let i = 0; i < countOnStream; i++) {
                const streamableObject: PdStreamableObject = list[i]
                streamableObject.streamUsingFiler(filer)
            }
        }
    }
}

// TODO: Fix enum from U3dexport
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
