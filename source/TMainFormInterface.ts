import { PdPlant, PdPlantUpdateEvent } from "./PdPlant"

export type TMainFormInterface = {
    // updateForChangeToOrientation(): void
    // recalculateAllPlantBoundsRects(kDontDrawNow: boolean): void
    // fitVisiblePlantsInDrawingArea(kDrawNow: boolean, kScaleAndMove: boolean, kAlwaysMove: boolean): unknown
    // magnifyOrReduce(newScale_pixelsPerMm: number, clickTPoint: TPoint, kDrawNow: boolean): void
    // invalidateEntireDrawing(): void
    // recalculateAllPlantBoundsRectsForOffsetChange(): void
    selectedPlantPartID: number
    screenBytesPerPixel(): number
    drawingPaintBox: HTMLCanvasElement
    inFileOpen: boolean
    inFormCreation: boolean
    roomForPlantBitmap(arg0: PdPlant, bytesThisBitmapWillBe: number): unknown
    finishDrawProgress(): unknown
    startDrawProgress(totalPlantParts: number): unknown
    exceptionResizingPlantBitmap(): void
    updateForChangeToPlantBitmaps(): void
    focusedPlant(): PdPlant | null
    cursorModeForDrawing: number
    isSelected(arg0: PdPlant): boolean
    plantsAsTextMemo: any
    updateParameterValuesWithUpdateListForPlant(plant: PdPlant, updateList: PdPlantUpdateEvent[]): void
    showDrawProgress(progress: number): void
    drawing: boolean
    plantFileChanged: boolean
    setPlantFileChanged(changed: boolean): void
    updateFileMenuForOtherRecentFiles(): void
}

// Store main form here untyped to avoid some circular depenencies with TypeScript
let MainForm: TMainFormInterface

export function getMainForm(): TMainFormInterface {
    return MainForm
}

export function setMainForm(aForm: TMainFormInterface): void {
    MainForm = aForm
}
