// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs, short } from "./common"

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
}

export function FIX_sizeof(object: Object): number {
    return 0
}
