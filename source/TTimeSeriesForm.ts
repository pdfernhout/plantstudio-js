// unit utimeser

import * as m from "mithril"
import { caption, ColorDefs, float, HelpJump, int, intround, IntToStr, long, short } from "./common"
import { TPoint } from "./TPoint"
import { kDontConsiderDomainScale, kDontDrawNow, kDrawNow, PdPlant } from "./PdPlant"
import { TRect } from "./TRect"
import { cursor_startWait, cursor_stopWait } from "./ucursor"
import { Point, rHeight, rWidth } from "./usupport"
import { PdCommand } from "./PdCommand"
import { domain, DrawMode } from "./PdDomain"
import { intMax, intMin } from "./umath"
import { kDontDrawYet } from "./TMainForm"
import { kCreateFirstGeneration, PdBreedFromParentsCommand, PdDeleteTimeSeriesCommand, PdMakeTimeSeriesCommand, PdPasteCommand } from "./updcom"
import { kOptionTabSize } from "./TBreederForm"
import { unfinished } from "./temporary"
import { activeForm, BreederForm, MainForm, setActiveForm, setTimeSeriesForm, TimeSeriesForm } from "./FormHolder"
import { resetDroppedDownMenuId, viewMainMenu } from "./menu"
import { ModalInputView } from "./ModalInputView"

// from conversion_common import *
// import ubmpsupport
// import ubreedr
// import umain
// import ucommand
// import updcom
// import ucursor
// import usupport
// import umath
// import udomain
// import uplant
// import ucollect
// import updform
// import delphi_compatability

export const kRecalculateScale = true
export const kDontRecalculateScale = false
const kMaxTimeSeriesStages = 100
const kStageNumberTextHeight = 16

export class TTimeSeriesForm {
    windowName = "Time Series"
    // grid: TDrawGrid = new TDrawGrid()
    // MainMenu1: TMainMenu = new TMainMenu()
    // TimeSeriesMenuEdit: TMenuItem = new TMenuItem()
    // TimeSeriesMenuUndo: TMenuItem = new TMenuItem()
    // TimeSeriesMenuRedo: TMenuItem = new TMenuItem()
    // N1: TMenuItem = new TMenuItem()
    // TimeSeriesMenuCopy: TMenuItem = new TMenuItem()
    // TimeSeriesMenuPaste: TMenuItem = new TMenuItem()
    // TimeSeriesMenuBreed: TMenuItem = new TMenuItem()
    // TimeSeriesPopupMenu: TPopupMenu = new TPopupMenu()
    // TimeSeriesPopupMenuBreed: TMenuItem = new TMenuItem()
    // TimeSeriesPopupMenuCopy: TMenuItem = new TMenuItem()
    // TimeSeriesPopupMenuPaste: TMenuItem = new TMenuItem()
    // N2: TMenuItem = new TMenuItem()
    // emptyWarningPanel: TPanel = new TPanel()
    // Label1: TLabel = new TLabel()
    // N3: TMenuItem = new TMenuItem()
    // TimeSeriesMenuDelete: TMenuItem = new TMenuItem()
    // N4: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptions: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsStages: TMenuItem = new TMenuItem()
    // TimeSeriesMenuHelp: TMenuItem = new TMenuItem()
    // TimeSeriesMenuHelpOnTimeSeries: TMenuItem = new TMenuItem()
    // TimeSeriesMenuHelpTopics: TMenuItem = new TMenuItem()
    // N5: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsDrawAs: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsFastDraw: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsMediumDraw: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsBestDraw: TMenuItem = new TMenuItem()
    // TimeSeriesMenuOptionsCustomDraw: TMenuItem = new TMenuItem()
    // TimeSeriesMenuUndoRedoList: TMenuItem = new TMenuItem()
    // TimeSeriesMenuSendCopy: TMenuItem = new TMenuItem()
    // TimeSeriesPopupMenuSendCopy: TMenuItem = new TMenuItem()
    parentPlant: PdPlant | null = null
    plants: PdPlant[] = []
    numStages: short = 0
    selectedPlant: PdPlant | null = null
    dragPlantStartPoint: TPoint = new TPoint()
    numTimeSeriesPlantsCopiedThisSession: short = 0
    internalChange: boolean = false
    percentsOfMaxAge: float[] = Array(kMaxTimeSeriesStages + 1)
    ages: short[] = Array(kMaxTimeSeriesStages + 1)
    drawing: boolean = false
    drawProgressMax: long = 0
    resizing: boolean = false
    needToRedrawFromChangeToDrawOptions: boolean = false

    // Temp for testing
    grid = {
        DefaultColWidth: 32,
        DefaultRowHeight: 32,
        Invalidate() { console.log("Invalidate") },
        RowHeights: [] as any,
        ColCount: 0
    }
    
    // //$R *.DFM
    // FormCreate(): void {
    //     let tempBoundsRect: TRect
        
    //     this.plants = []
    //     this.grid.DragCursor = ucursor.crDragPlant
    //     this.Position = delphi_compatability.TPosition.poDesigned
    //     // keep window on screen - left corner of title bar 
    //     tempBoundsRect = domain.timeSeriesWindowRect
    //     if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
    //         if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
    //             tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
    //         }
    //         if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
    //             tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
    //         }
    //         this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
    //     }
    //     switch (domain.options.drawSpeed) {
    //         case DrawMode.kDrawFast:
    //             this.TimeSeriesMenuOptionsFastDraw.checked = true
    //             break
    //         case DrawMode.kDrawMedium:
    //             this.TimeSeriesMenuOptionsMediumDraw.checked = true
    //             break
    //         case DrawMode.kDrawBest:
    //             this.TimeSeriesMenuOptionsBestDraw.checked = true
    //             break
    //         case DrawMode.kDrawCustom:
    //             this.TimeSeriesMenuOptionsCustomDraw.checked = true
    //             break
    //     }
    //     //to get redo messages
    //     MainForm.updateMenusForUndoRedo()
    //     this.updateForChangeToDomainOptions()
    //     this.updateMenusForChangeToSelectedPlant()
    //     this.updatePasteMenuForClipboardContents()
    //     this.emptyWarningPanel.SendToBack()
    //     this.emptyWarningPanel.Hide()
    // }
    
    // FormActivate(): void {
    //     if (this.plants.length <= 0) {
    //         this.emptyWarningPanel.BringToFront()
    //         this.emptyWarningPanel.Show()
    //     } else if (this.needToRedrawFromChangeToDrawOptions) {
    //         this.redrawPlants()
    //         this.needToRedrawFromChangeToDrawOptions = false
    //     }
    // }
    
    initializeWithPlant(aPlant: PdPlant, drawNow: boolean): void {
        console.log("initializeWithPlant", aPlant)
        if (aPlant === null) {
            return
        }
        // TODO PDF: Fix or remove commented code on show and bring to front
        // if (!this.Visible) {
        //     this.Show()
        // }
        // this.BringToFront()
        this.plants.length = 0
        this.parentPlant = aPlant
        cursor_startWait()
        try {
            for (let i = 0; i <= this.numStages - 1; i++) {
                const newPlant = new PdPlant()
                this.parentPlant.copyTo(newPlant)
                this.ages[i] = intround(Math.max(0.0, Math.min(1.0, this.percentsOfMaxAge[i] / 100.0)) * newPlant.pGeneral.ageAtMaturity)
                newPlant.setAge(this.ages[i])
                this.plants.push(newPlant)
                console.log("adding new plant at age", newPlant.age)
            }
        } finally {
            cursor_stopWait()
        }
        if (drawNow) {
            this.redrawPlants()
        }
    }
    
    // ----------------------------------------------------------------------------------- updating 
    updateForChangeToDomainOptions(): void {
        let i: short
        
        if (domain.breedingAndTimeSeriesOptions.numTimeSeriesStages !== this.numStages) {
            this.numStages = domain.breedingAndTimeSeriesOptions.numTimeSeriesStages
            for (i = 0; i <= this.numStages - 1; i++) {
                this.percentsOfMaxAge[i] = intMin(100, intMax(0, (i + 1) * 100 / this.numStages))
            }
            if (this.grid.ColCount !== this.numStages) {
                this.grid.ColCount = this.numStages
            }
            this.updateForNewNumberOfStages()
        }
        if (this.grid.DefaultColWidth !== domain.breedingAndTimeSeriesOptions.thumbnailWidth) {
            this.grid.DefaultColWidth = domain.breedingAndTimeSeriesOptions.thumbnailWidth
        }
        if (this.grid.DefaultRowHeight !== domain.breedingAndTimeSeriesOptions.thumbnailHeight) {
            this.grid.DefaultRowHeight = domain.breedingAndTimeSeriesOptions.thumbnailHeight
            this.grid.RowHeights[1] = kStageNumberTextHeight
        }
        this.redrawPlants()
    }
    
    updateForNewNumberOfStages(): void {
        let keepPlant: PdPlant | null = null
        if (this.plants.length > 0) {
            const firstPlant = this.plants[0]
            if (firstPlant !== null) {
                keepPlant = new PdPlant()
                firstPlant.copyTo(keepPlant)
                this.plants.length = 0
            }
        }
        if (keepPlant !== null) {
            this.initializeWithPlant(keepPlant, kDontDrawYet)
        }
        this.redrawPlants()
    }
    
    updateForChangeToPlants(recalcScale: boolean): void {
        this.selectedPlant = null
        if (this.plants.length <= 0) {
            this.parentPlant = null
        }
        this.updateMenusForChangeToSelectedPlant()
        if (!this.Visible) {
            this.Show()
        }
        this.BringToFront()
        this.redrawPlants()
    }
    
    updateMenusForChangeToSelectedPlant(): void {
        // TODO PDF: Fix or remove menu enabling
        // this.TimeSeriesMenuCopy.enabled = (this.selectedPlant !== null)
        // this.TimeSeriesPopupMenuCopy.enabled = this.TimeSeriesMenuCopy.enabled
        // this.TimeSeriesMenuBreed.enabled = (this.selectedPlant !== null)
        // this.TimeSeriesPopupMenuBreed.enabled = this.TimeSeriesMenuBreed.enabled
    }
    
    updatePasteMenuForClipboardContents(): void {
        // TODO PDF: Fix or remove menu enabling
        // this.TimeSeriesMenuPaste.enabled = (domain.plantManager.privatePlantClipboard.length > 0)
        // this.TimeSeriesPopupMenuPaste.enabled = (domain.plantManager.privatePlantClipboard.length > 0)
    }
    
    updatePlantsFromParent(aPlant: PdPlant): void {
        if ((aPlant === null) || (aPlant !== this.parentPlant) || (this.plants.length <= 0)) {
            return
        }
        this.initializeWithPlant(aPlant, kDrawNow)
    }
    
    // ----------------------------------------------------------------------------------- plants 
    plantForIndex(index: short): PdPlant | null {
        let result: PdPlant | null = null
        if (index < 0) {
            return result
        }
        if (index > this.plants.length - 1) {
            return result
        }
        if (this.plants[index] === null) {
            return result
        }
        result = this.plants[index]
        return result
    }
    
    plantAtMouse(x: short, y: short): PdPlant | null {
        let result: PdPlant | null = null
        let col: long = 0
        let row: long = 0
        
        // TODO PDF: Fix code for dealing with grid mouse position
        unfinished()
        // col, row = this.grid.MouseToCell(x, y, col, row)
        if ((col < 0) || (col > this.plants.length - 1)) {
            return result
        }
        result = this.plantForIndex(col)
        return result
    }
    
    // -------------------------------------------------------------------------------------- drawing 
    redrawPlants(): void {
        // TODO PDF: Fix or remove warning panel code
        // if (this.plants.length <= 0) {
        //     this.emptyWarningPanel.BringToFront()
        //     this.emptyWarningPanel.Show()
        // } else {
        //     this.emptyWarningPanel.SendToBack()
        //     this.emptyWarningPanel.Hide()
        // }
        this.recalculateCommonDrawingScaleAndPosition()
        this.grid.Invalidate()
    }
    
    recalculateCommonDrawingScaleAndPosition(): void {
        let plant: PdPlant
        let i: short
        let minScale: float
        let plantPartsToDraw: long
        let partsDrawn: long
        let bestPosition: TPoint = new TPoint()
        let widestWidth: long
        let tallestHeight: long
        
        if (this.plants === null) {
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        // find smallest scale
        minScale = 0.0
        for (i = 0; i <= this.plants.length - 1; i++) {
            plant = this.plants[i]
            plant.fixedPreviewScale = false
            plant.fixedDrawPosition = false
            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), kDontConsiderDomainScale, kDontDrawNow)
            if ((i === 0) || (plant.drawingScale_PixelsPerMm < minScale)) {
                minScale = plant.drawingScale_PixelsPerMm
            }
        }
        // find common draw position
        widestWidth = 0
        tallestHeight = 0
        for (i = 0; i <= this.plants.length - 1; i++) {
            plant = this.plants[i]
            plant.fixedPreviewScale = true
            plant.drawingScale_PixelsPerMm = minScale
            plant.fixedDrawPosition = false
            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), kDontConsiderDomainScale, kDontDrawNow)
            if ((i === 0) || (rWidth(plant.boundsRect_pixels()) > widestWidth)) {
                widestWidth = rWidth(plant.boundsRect_pixels())
                bestPosition.X = plant.drawPositionIfFixed.X
            }
            if ((i === 0) || (rHeight(plant.boundsRect_pixels()) > tallestHeight)) {
                tallestHeight = rHeight(plant.boundsRect_pixels())
                bestPosition.Y = plant.drawPositionIfFixed.Y
            }
        }
        for (i = 0; i <= this.plants.length - 1; i++) {
            // set draw position to use when repaint - don't draw now
            plant = this.plants[i]
            plant.fixedPreviewScale = true
            plant.drawingScale_PixelsPerMm = minScale
            plant.fixedDrawPosition = true
            plant.drawPositionIfFixed = bestPosition
            plant.previewCacheUpToDate = false
        }
    }
    
    // -------------------------------------------------------------------------------------- grid 
    gridDrawCell(context: CanvasRenderingContext2D, Col: long): void {
        let textDrawRect: TRect = new TRect()
        let textToDraw: string
        
        // this.grid.Canvas.Brush.Color = ColorDefs.clWhite
        // this.grid.Canvas.Pen.Width = 1
        // if ((this.plants.length > 0) && (Row === 0)) {
        //     this.grid.Canvas.Pen.Color = ColorDefs.clSilver
        // } else {
        //     this.grid.Canvas.Pen.Color = ColorDefs.clWhite
        // }
        // this.grid.Canvas.Rectangle(Rect.Left, Rect.Top, Rect.Right, Rect.Bottom)
        // if (Row === 1) {
        //     if (this.plants.length <= 0) {
        //         return
        //     }
        //     textToDraw = IntToStr(this.ages[Col])
        //     if (rWidth(Rect) > 50) {
        //         // 50 is fixed size
        //         textToDraw = textToDraw + " days"
        //     }
        //     textDrawRect.Left = Rect.Left + rWidth(Rect) / 2 - this.grid.Canvas.TextWidth(textToDraw) / 2
        //     textDrawRect.Top = Rect.Top + rHeight(Rect) / 2 - this.grid.Canvas.TextHeight("0") / 2
        //     this.grid.Canvas.TextOut(textDrawRect.Left, textDrawRect.Top, textToDraw)
        //     return
        // }
        const plant = this.plantForIndex(Col)
        if (plant === null) {
            return
        }
        if (!plant.previewCacheUpToDate) {
            // draw plant 
            // draw gray solid box to show delay for drawing plant cache
            // this.grid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            // this.grid.Canvas.Brush.Color = ColorDefs.clSilver
            // this.grid.Canvas.Pen.Color = ColorDefs.clSilver
            // //FIX unresolved WITH expression: Rect
            // this.grid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)

            // Clear cache
            plant.previewCache.Width = plant.previewCache.Width

            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), kDontConsiderDomainScale, kDrawNow)
        }
        plant.previewCache.Transparent = false
        context.drawImage(plant.previewCache.canvas, 0, 0)
        // draw selection rectangle 
        // this.grid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        // this.grid.Canvas.Pen.Width = 2
        // if (plant === this.selectedPlant) {
        //     this.grid.Canvas.Pen.Color = domain.options.firstSelectionRectangleColor
        // } else {
        //     this.grid.Canvas.Pen.Color = ColorDefs.clSilver
        // }
        //FIX unresolved WITH expression: Rect
        // this.grid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)
    }
    
    // gridMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.selectedPlant = this.plantAtMouse(X, Y)
    //     this.updateMenusForChangeToSelectedPlant()
    //     this.grid.Invalidate()
    //     if ((Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
    //         // start drag of plant
    //         return
    //     }
    //     if (this.selectedPlant === null) {
    //         return
    //     }
    //     this.dragPlantStartPoint = Point(X, Y)
    //     this.grid.BeginDrag(false)
    // }
    
    // gridDragOver(Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
    //     Accept = (Source !== null) && (Sender !== null) && ((Source === MainForm.drawingPaintBox) || (Source === MainForm.plantListDrawGrid) || (Source === BreederForm.plantsDrawGrid))
    //     return Accept
    // }
    
    // gridEndDrag(Target: TObject, X: int, Y: int): void {
    //     let newPlants: PdPlant[] = []
    //     let newPlant: PdPlant
        
    //     if (Target === null) {
    //         return
    //     }
    //     // get plant being dragged 
    //     const plant = this.plantAtMouse(this.dragPlantStartPoint.X, this.dragPlantStartPoint.Y)
    //     if (plant === null) {
    //         return
    //     }
    //     if (Target === BreederForm.plantsDrawGrid) {
    //         BreederForm.copyPlantToPoint(plant, X, Y)
    //     } else if ((Target === MainForm.drawingPaintBox) || (Target === MainForm.plantListDrawGrid)) {
    //         // make paste command - wants list of plants 
    //         newPlant = new PdPlant()
    //         plant.copyTo(newPlant)
    //         this.numTimeSeriesPlantsCopiedThisSession += 1
    //         newPlant.setName("Time series plant " + IntToStr(this.numTimeSeriesPlantsCopiedThisSession))
    //         if (Target === MainForm.drawingPaintBox) {
    //             newPlant.moveTo(Point(X, Y))
    //         } else {
    //             newPlant.moveTo(MainForm.standardPastePosition())
    //         }
    //         if (!domain.viewPlantsInMainWindowOnePlantAtATime()) {
    //             // v2.1
    //             newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
    //         }
    //         // to save memory - don't need it in main window
    //         newPlant.shrinkPreviewCache()
    //         newPlants = []
    //         newPlants.push(newPlant)
    //         const newCommand = new PdPasteCommand(newPlants, MainForm.selectedPlants)
    //         newCommand.useSpecialPastePosition = true
    //         try {
    //             cursor_startWait()
    //             MainForm.doCommand(newCommand)
    //         } finally {
    //             cursor_stopWait()
    //         }
    //     }
    // }
    
    copyPlantToPoint(aPlant: PdPlant, x: int, y: int): void {
        let newCommand: PdCommand
        
        newCommand = new PdMakeTimeSeriesCommand(aPlant)
        MainForm.doCommand(newCommand)
    }
    
    // invalidateGridCell(column: long): void {
    //     let cellRectOver: TRect
        
    //     if ((column < 0)) {
    //         return
    //     }
    //     cellRectOver = this.grid.CellRect(column, 0)
    //     UNRESOLVED.invalidateRect(this.grid.Handle, cellRectOver, true)
    // }
    
    // ------------------------------------------------------------------------------- menu 
    TimeSeriesMenuUndoClick(): void {
        MainForm.MenuEditUndoClick()
    }
    
    TimeSeriesMenuRedoClick(): void {
        MainForm.MenuEditRedoClick()
    }
    
    TimeSeriesMenuUndoRedoListClick(): void {
        MainForm.UndoMenuEditUndoRedoListClick()
    }
    
    TimeSeriesMenuCopyClick(): void {
        let saveName: string
        
        let plant: PdPlant | null = this.selectedPlant
        if (plant === null) {
            return
        }
        const copyList: PdPlant[] = []
        copyList.push(plant)
        // temporarily change plant name, position, scale to make copy, then put back 
        saveName = plant.getName()
        this.numTimeSeriesPlantsCopiedThisSession += 1
        plant.setName("Time series plant " + IntToStr(this.numTimeSeriesPlantsCopiedThisSession))
        domain.plantManager.copyPlantsInListToPrivatePlantClipboard(copyList)
        plant.setName(saveName)
        //sets our paste menu also
        MainForm.updatePasteMenuForClipboardContents()
    }
    
    TimeSeriesMenuPasteClick(): void {
        if (domain.plantManager.privatePlantClipboard.length <= 0) {
            return
        }
        const newPlant = new PdPlant()
        domain.plantManager.pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant)
        const newCommand = new PdMakeTimeSeriesCommand(newPlant)
        newCommand.isPaste = true
        MainForm.doCommand(newCommand)
    }
    
    TimeSeriesMenuSendCopyClick(): void {
        this.TimeSeriesMenuCopyClick()
        MainForm.MenuEditPasteClick()
    }
    
    TimeSeriesMenuBreedClick(): void {
        if (this.selectedPlant === null) {
            return
        }
        if (BreederForm.selectedRow >= domain.breedingAndTimeSeriesOptions.maxGenerations - 2) {
            // check if there is room in the breeder - this command will make two new generations 
            BreederForm.fullWarning()
        } else {
            const newCommand = new PdBreedFromParentsCommand(BreederForm.generations, this.selectedPlant, null, -1, domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, kCreateFirstGeneration)
            MainForm.doCommand(newCommand)
        }
    }
    
    TimeSeriesMenuDeleteClick(): void {
        let newCommand: PdCommand
        
        newCommand = new PdDeleteTimeSeriesCommand()
        MainForm.doCommand(newCommand)
    }
    
    TimeSeriesPopupMenuCopyClick(): void {
        this.TimeSeriesMenuCopyClick()
    }
    
    TimeSeriesPopupMenuPasteClick(): void {
        this.TimeSeriesMenuPasteClick()
    }
    
    TimeSeriesPopupMenuBreedClick(): void {
        this.TimeSeriesMenuBreedClick()
    }
    
    // ------------------------------------------------------------------------------- resizing 
    // FormResize(): void {
    //     if (this.plants === null) {
    //         return
    //     }
    //     this.grid.SetBounds(0, 0, this.ClientWidth, intMax(0, this.ClientHeight))
    //     this.emptyWarningPanel.SetBounds(this.ClientWidth / 2 - this.emptyWarningPanel.Width / 2, this.ClientHeight / 2 - this.emptyWarningPanel.Height / 2, this.emptyWarningPanel.Width, this.emptyWarningPanel.Height)
    // }
    
    // WMGetMinMaxInfo(MSG: Tmessage): void {
    //     PdForm.prototype.WMGetMinMaxInfo.call(this)
    //     //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
    //     UNRESOLVED.ptMinTrackSize.x = 280
    //     UNRESOLVED.ptMinTrackSize.y = 120
    // }
    
    TimeSeriesMenuHelpTopicsClick(): void {
        HelpJump("")
    }
    
    TimeSeriesMenuHelpOnTimeSeriesClick(): void {
        HelpJump("Making_time_series")
    }
    
    TimeSeriesMenuOptionsStagesClick(): void {
        BreederForm.changeBreederAndTimeSeriesOptions(kOptionTabSize)
    }
    
    TimeSeriesMenuOptionsFastDrawClick(): void {
        MainForm.MenuOptionsFastDrawClick()
    }
    
    TimeSeriesMenuOptionsMediumDrawClick(): void {
        MainForm.MenuOptionsMediumDrawClick()
    }
    
    TimeSeriesMenuOptionsBestDrawClick(): void {
        MainForm.MenuOptionsBestDrawClick()
    }
    
    TimeSeriesMenuOptionsCustomDrawClick(): void {
        MainForm.MenuOptionsCustomDrawClick()
    }

    oninit() {
        setTimeSeriesForm(this)
        this.updateForChangeToDomainOptions()
    }

    haveSelectedPlant(): boolean {
        return this.selectedPlant !== null
    }

    mainMenuSpec: any = [
        // [type = radio/checkbox, ] ID, label, items or action [, checked function][, enabled function]
        "MenuEdit", "&Edit", [
            "MenuEditUndo", () => MainForm.menuUndoCaption(), this.TimeSeriesMenuUndoClick, () => false, () => MainForm.commandList.isUndoEnabled(),
            "MenuEditRedo", () => MainForm.menuRedoCaption(), this.TimeSeriesMenuRedoClick, () => false, () => MainForm.commandList.isRedoEnabled(),
            "MenuEditUndoRedoList", "Undo/Redo &List...", this.TimeSeriesMenuUndoRedoListClick,
            "-",
            "MenuEditCopy", "C&opy", this.TimeSeriesMenuCopyClick, () => false, () => this.haveSelectedPlant(),
            "MenuEditPaste", "&Paste", this.TimeSeriesMenuPasteClick, () => false, () => MainForm.havePrivateClipboardPlants(),
            "MenuEditSendCopy", "&Send Copy to Main Window", this.TimeSeriesMenuSendCopyClick, () => false, () => this.haveSelectedPlant(),
            "-",
            "MenuEditBreed", "&Breed", this.TimeSeriesMenuBreedClick, () => false, () => this.haveSelectedPlant(),
            "-",
            "MenuEditDelete", "&Delete Time Series", this.TimeSeriesMenuDeleteClick
        ],
        "MenuOptions", "&Options", [
            "MenuOptionsDrawAs", "&Draw Using", [
                "radio", "MenuOptionsFastDraw", "&Bounding Boxes", this.TimeSeriesMenuOptionsFastDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawFast,
                "radio", "MenuOptionsMediumDraw", "&Wire Frames", this.TimeSeriesMenuOptionsMediumDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawMedium,
                "radio", "MenuOptionsBestDraw", "&Solids", this.TimeSeriesMenuOptionsBestDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawBest,
                "radio", "MenuOptionsCustomDraw", "&Custom...", this.TimeSeriesMenuOptionsCustomDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawCustom,
            ],
            "MenuOptionsStages", "&More Options...", this.TimeSeriesMenuOptionsStagesClick,
        ],
        "MenuWindow", "&View", [
            "radio", "MenuWindowMain", "&Main", () => setActiveForm("MainForm"), () => activeForm === "MainForm", () => MainForm !== undefined,
            "radio", "MenuWindowBreeder", "&Breeder", () => setActiveForm("BreederForm"), () => activeForm === "BreederForm", () => BreederForm !== undefined,
            "radio", "MenuWindowTimeSeries", "&Time Series", () => setActiveForm("TimeSeriesForm"), () => activeForm === "TimeSeriesForm", () => TimeSeriesForm !== undefined,
        ],
        "MenuHelp", "&Help", [
            "MenuHelpSuperSpeedTour", "Help on &Time Series", this.TimeSeriesMenuHelpOnTimeSeriesClick,
            "-",
            "MenuHelpTopics", "&Help Topics", this.TimeSeriesMenuHelpTopicsClick,
        ],
    ]

    view() {
        if (activeForm && activeForm !== "TimeSeriesForm") return []
        const self = this
        return m("div.TimeSeriesForm.relative", {
                onclick: (event: any) => {
                    resetDroppedDownMenuId()
                },
            },
            viewMainMenu(this.mainMenuSpec, this, () => []),
            m(ModalInputView),
            m("TDrawGrid.grid.TDrawGrid.flex",
                {
                    // Top: "4",
                    // Left: "8",
                    // Height: "67",
                    // Width: "185",
                    // ColCount: "1",
                    // DefaultRowHeight: "64",
                    // DefaultDrawing: "False",
                    // FixedCols: "0",
                    // RowCount: "2",
                    // FixedRows: "0",
                    // Options: "[goFixedVertLine, goFixedHorzLine]",
                    // PopupMenu: "TimeSeriesPopupMenu",
                    // TabOrder: "0",
                    // OnDragOver: "gridDragOver",
                    // OnDrawCell: "gridDrawCell",
                    // OnEndDrag: "gridEndDrag",
                    // OnMouseDown: "gridMouseDown",
                },
                this.plants.map((plant: PdPlant, column: number) =>
                    m("div.ba"  + this.borderIfSelected(plant),
                        m("canvas", {
                            key: plant.uuid,
                            width: "" + self.DefaultColWidth + "px",
                            height: "" + self.DefaultColWidth + "px",
                            oncreate(vnode: m.VnodeDOM) {
                                const canvas = <HTMLCanvasElement>vnode.dom
                                canvas.width = self.DefaultColWidth
                                canvas.height = self.DefaultColWidth
                                const context = canvas.getContext("2d")
                                if (!context) return
                                self.gridDrawCell(context, column)
                                if (plant) context.drawImage(plant.previewCache.canvas, 0, 0)
                            },
                            onupdate(vnode: m.VnodeDOM) {
                                const canvas = <HTMLCanvasElement>vnode.dom
                                // Clear the canvas
                                canvas.width = canvas.width
                                const context = canvas.getContext("2d")
                                if (!context) return
                                if (plant) context.drawImage(plant.previewCache.canvas, 0, 0)
                            },
                        })
                    ),
                ),
            ),
            m("div.emptyWarningPanel.TPanel" + ((this.plants.length <= 0) ? "" : ".hidden"),
                m("div.Label1.TLabel",
                    "The time series window is empty. To fill it, select a plant in the main window and choose Make Time Series from the Plant menu.",
                ),
            ),
            // m("ul.TimeSeriesPopupMenu.TPopupMenu",
            //     {
            //         // Top: "38",
            //         // Left: "468",
            //         // Height: "0",
            //         // Width: "0",
            //     },
            //     m("li.TimeSeriesPopupMenuCopy.TMenuItem",
            //         {
            //             onclick: () => this.TimeSeriesPopupMenuCopyClick(),
            //         },
            //         caption("&Copy"),
            //     ),
            //     m("li.TimeSeriesPopupMenuPaste.TMenuItem",
            //         {
            //             onclick: () => this.TimeSeriesPopupMenuPasteClick(),
            //         },
            //         caption("&Paste"),
            //     ),
            //     m("li.TimeSeriesPopupMenuSendCopy.TMenuItem",
            //         {
            //             onclick: () => this.TimeSeriesMenuSendCopyClick(),
            //         },
            //         caption("&Send Copy to Main Window"),
            //     ),
            //     m("li.N2.TMenuItem",
            //         {
            //         },
            //         "-",
            //     ),
            //     m("li.TimeSeriesPopupMenuBreed.TMenuItem",
            //         {
            //             onclick: () => this.TimeSeriesPopupMenuBreedClick(),
            //         },
            //         "Breed",
            //     ),
            // ),
        )
    }

    // TODO PDF: Decide what to do about this deli-compatiblility window stuff
    BringToFront() {
        // TODO PDF: Fix or remove: throw new Error("Method not implemented.")
    }
    Show() {
        // TODO PDF: Fix or remove: throw new Error("Method not implemented.")
    }
    Visible = true

    DefaultColWidth = 64

    borderIfSelected(plant: PdPlant) {
        if (plant === this.selectedPlant) return ".bw2.b--green"
        return ".bw2.b--black"
    }
}

