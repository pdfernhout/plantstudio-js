// TODO: Temporary definitions that belong elsewhere used to get code to compile

import { ColorDefs, int, long, TColorRef } from "./common"
import { support_rgb } from "./usupport"
import { PdFiler } from "./PdFiler";
import { PdStreamableObject } from "./PdStreamableObject";

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

export function unfinished() {
    alert("TODO Unfinished")
    throw new Error("Function not implemented.")
}

export const exeName = "/PlantStudio"
