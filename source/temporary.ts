// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs, short, int, StrToFloat } from "./common"
import { TRect } from "./TRect";
import { PdTraverser } from "./PdTraverser";

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

// TODO: Fix FieldType from Uparams
export enum FieldType {
    kFieldUndefined = 0,
    kFieldFloat = 1,
    kFieldSmallint = 2,
    kFieldColor = 3,
    kFieldBoolean = 4,
    kFieldThreeDObject = 5,
    kFieldEnumeratedList = 6,
    kFieldHeader = 7,
    kFieldLongint = 8,
}

// TODO: Fix IndexType from Uparams
export enum IndexType {
    kIndexTypeUndefined = 0,
    kIndexTypeNone = 1,
    kIndexTypeSCurve = 3,
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
export class PdBitmap {
    Width = 1
    Height = 1
    Transparent = true
    TransparentMode = <any>null // delphi_compatability.TTransparentMode.tmFixed
    TransparentColor = ColorDefs.clBlack // domain.options.backgroundColor
}

// TODO: Fix PdInternode stub
export class PdInternode {
    traversingDirection: number
    phytomerAttachedTo: PdInternode
    leftBranchPlantPart: PdInternode | null
    rightBranchPlantPart: PdInternode | null
    nextPlantPart: PdInternode | null
    isPhytomer() { return true }
    traverseActivity(mode: number, traverser: PdTraverser) {}
}

// TODO: Fix PdPlantPart stub
export class PdPlantPart {
    
}

// TODO: Fix kExportPartLast copied from U3dexport
export const kExportPartLast = 33
