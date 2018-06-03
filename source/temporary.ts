// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { float, ColorDefs, short, int, StrToFloat, byte, long, TColorRef } from "./common"
import { TRect } from "./TRect"
import { PdTraverser } from "./PdTraverser"
import { PdPlant } from "./PdPlant"
import { PdPlantPart } from "./PdPlantPart"
import { SinglePoint, support_rgb } from "./usupport"
import { PdCommand } from "./PdCommand";
import { TPoint } from "./TPoint";

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
    streamByte(value: any): any {
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

// TODO: Fix FIX_sizeof with alternate approach to object size measurement
export function FIX_sizeof(object: Object): number {
    return 0
}

// TODO: Fix DebugPrint from udebug that should have result stored somewhere
export function DebugPrint(aMessage: string): void {
    console.log("DebugPrint: " + aMessage)
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
    focusedPlant: (): PdPlant | null => null,
    plantsAsTextMemo: <string[]>[],
    updateParameterValuesWithUpdateListForPlant: (something: any, updateList: any[]) => {},
    showDrawProgress: (value: number) => {},
    selectedPlantPartID: null,
    plantFileChanged: false,
    setPlantFileChanged: (changed: boolean) => {},
    doCommand: (command: PdCommand) => {},
    updateMenusForUndoRedo: () => {},
    MenuEditUndoClick: (Sender: any) => {},
    MenuEditRedoClick: (Sender: any) => {},
    updatePasteMenuForClipboardContents: () => {},
    standardPastePosition: () => new TPoint(),
}

// TODO: Fix PdBitmap stub
export class PdBitmap extends PdStreamableObject {
    canvas = document.createElement("canvas")

    Transparent = true
    TransparentMode = <any>null // delphi_compatability.TTransparentMode.tmFixed
    TransparentColor = ColorDefs.clBlack // domain.options.backgroundColor

    bitmapMemorySize() {
        return 0
    }

    getPixel(x: int, y: int): TColorRef {
        const context = this.Context
        if (!context) return 0
        const data = context.getImageData(x, y, 1, 1).data
        const color = support_rgb(data[0], data[1], data[2])
        return color
    }

    get Context(): CanvasRenderingContext2D | null {
        return this.canvas.getContext("2d")
    }

    get Width(): int {
        return this.canvas.width
    }

    set Width(width: int) {
        this.canvas.width = width
    }

    get Height(): int {
        return this.canvas.height
    }

    set Height(height: int) {
        this.canvas.height = height
    }
}

// TODO: Fix fillBitmap stub
export function fillBitmap(bitmap: PdBitmap, color: TColorRef) {
}

// TODO: Fix TTransparentMode stub
export enum TTransparentMode {
    tmFixed = 1
}

// TODO: Fix TFPBrushStyle stub
export enum TFPBrushStyle {
    bsSolid = 1
}

// TODO: Fix TFPBrushStyle stub
export enum TFPPenStyle {
    psSolid = 1
}

// TODO: Fix or remove setPixelFormatBasedOnScreenForBitmap stub from ubmpsupport
export function setPixelFormatBasedOnScreenForBitmap(bitmap: PdBitmap) {
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


// TODO: Fix CursorMode enum from umain
export enum CursorMode {
    kCursorModeSelectDrag = 0,
    kCursorModeMagnify = 1,
    kCursorModeScroll = 2,
    kCursorModeRotate = 3,
    kCursorModePosingSelect = 4,
}

// TODO: Implement TimeSeriesForm from utmimeser
export const TimeSeriesForm = {
    updatePlantsFromParent(plant: PdPlant) {
    }
}

export class PdPlantManager {
    plantDrawScale_PixelsPerMm: number = 1.0
}
