// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs, short, int, StrToFloat } from "./common"

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
    streamBytes(object: any, size: number): any {
        return object
    }
    streamLongint(object: any): any {
        return object
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
