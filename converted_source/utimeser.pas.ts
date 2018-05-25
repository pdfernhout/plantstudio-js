// unit utimeser

from conversion_common import *
import ubmpsupport
import ubreedr
import umain
import ucommand
import updcom
import ucursor
import usupport
import umath
import udomain
import uplant
import ucollect
import updform
import delphi_compatability

// const
const kRecalculateScale = true
const kDontRecalculateScale = false
const kMaxTimeSeriesStages = 100


// var
let TimeSeriesForm: TTimeSeriesForm


// const
const kStageNumberTextHeight = 16



export class TTimeSeriesForm {
    grid: TDrawGrid = new TDrawGrid()
    MainMenu1: TMainMenu = new TMainMenu()
    TimeSeriesMenuEdit: TMenuItem = new TMenuItem()
    TimeSeriesMenuUndo: TMenuItem = new TMenuItem()
    TimeSeriesMenuRedo: TMenuItem = new TMenuItem()
    N1: TMenuItem = new TMenuItem()
    TimeSeriesMenuCopy: TMenuItem = new TMenuItem()
    TimeSeriesMenuPaste: TMenuItem = new TMenuItem()
    TimeSeriesMenuBreed: TMenuItem = new TMenuItem()
    TimeSeriesPopupMenu: TPopupMenu = new TPopupMenu()
    TimeSeriesPopupMenuBreed: TMenuItem = new TMenuItem()
    TimeSeriesPopupMenuCopy: TMenuItem = new TMenuItem()
    TimeSeriesPopupMenuPaste: TMenuItem = new TMenuItem()
    N2: TMenuItem = new TMenuItem()
    emptyWarningPanel: TPanel = new TPanel()
    Label1: TLabel = new TLabel()
    N3: TMenuItem = new TMenuItem()
    TimeSeriesMenuDelete: TMenuItem = new TMenuItem()
    N4: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptions: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsStages: TMenuItem = new TMenuItem()
    TimeSeriesMenuHelp: TMenuItem = new TMenuItem()
    TimeSeriesMenuHelpOnTimeSeries: TMenuItem = new TMenuItem()
    TimeSeriesMenuHelpTopics: TMenuItem = new TMenuItem()
    N5: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsDrawAs: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsFastDraw: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsMediumDraw: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsBestDraw: TMenuItem = new TMenuItem()
    TimeSeriesMenuOptionsCustomDraw: TMenuItem = new TMenuItem()
    TimeSeriesMenuUndoRedoList: TMenuItem = new TMenuItem()
    TimeSeriesMenuSendCopy: TMenuItem = new TMenuItem()
    TimeSeriesPopupMenuSendCopy: TMenuItem = new TMenuItem()
    parentPlant: PdPlant = new PdPlant()
    plants: TListCollection = new TListCollection()
    numStages: short = 0
    selectedPlant: PdPlant = new PdPlant()
    dragPlantStartPoint: TPoint = new TPoint()
    numTimeSeriesPlantsCopiedThisSession: short = 0
    internalChange: boolean = false
    percentsOfMaxAge: float[] /* kMaxTimeSeriesStages + 1 */ = Array(kMaxTimeSeriesStages + 1)
    ages: short[] /* kMaxTimeSeriesStages + 1 */ = Array(kMaxTimeSeriesStages + 1)
    drawing: boolean = false
    drawProgressMax: long = 0
    resizing: boolean = false
    needToRedrawFromChangeToDrawOptions: boolean = false
    TTimeSeriesForm.prototype = new PdForm()
    TTimeSeriesForm.prototype.constructor = TTimeSeriesForm
    
    //$R *.DFM
    FormCreate(Sender: TObject): void {
        let tempBoundsRect: TRect
        
        this.plants = ucollect.TListCollection().Create()
        this.grid.DragCursor = ucursor.crDragPlant
        this.Position = delphi_compatability.TPosition.poDesigned
        // keep window on screen - left corner of title bar 
        tempBoundsRect = udomain.domain.timeSeriesWindowRect
        if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
            if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
                tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
            }
            if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
                tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
            }
            this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
        }
        switch (udomain.domain.options.drawSpeed) {
            case udomain.kDrawFast:
                this.TimeSeriesMenuOptionsFastDraw.checked = true
                break
            case udomain.kDrawMedium:
                this.TimeSeriesMenuOptionsMediumDraw.checked = true
                break
            case udomain.kDrawBest:
                this.TimeSeriesMenuOptionsBestDraw.checked = true
                break
            case udomain.kDrawCustom:
                this.TimeSeriesMenuOptionsCustomDraw.checked = true
                break
        //to get redo messages
        umain.MainForm.updateMenusForUndoRedo()
        this.updateForChangeToDomainOptions()
        this.updateMenusForChangeToSelectedPlant()
        this.updatePasteMenuForClipboardContents()
        this.emptyWarningPanel.SendToBack()
        this.emptyWarningPanel.Hide()
    }
    
    FormDestroy(Sender: TObject): void {
        this.plants.free
        this.plants = null
    }
    
    FormActivate(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.Count <= 0) {
            this.emptyWarningPanel.BringToFront()
            this.emptyWarningPanel.Show()
        } else if (this.needToRedrawFromChangeToDrawOptions) {
            this.redrawPlants()
            this.needToRedrawFromChangeToDrawOptions = false
        }
    }
    
    initializeWithPlant(aPlant: PdPlant, drawNow: boolean): void {
        let newPlant: PdPlant
        let i: short
        
        if (aPlant === null) {
            return
        }
        if (!this.Visible) {
            this.Show()
        }
        this.BringToFront()
        this.plants.clear()
        this.parentPlant = aPlant
        ucursor.cursor_startWait()
        try {
            for (i = 0; i <= this.numStages - 1; i++) {
                newPlant = uplant.PdPlant().create()
                this.parentPlant.copyTo(newPlant)
                this.ages[i] = intround(umath.max(0.0, umath.min(1.0, this.percentsOfMaxAge[i] / 100.0)) * newPlant.pGeneral.ageAtMaturity)
                newPlant.setAge(this.ages[i])
                this.plants.Add(newPlant)
            }
        } finally {
            ucursor.cursor_stopWait()
        }
        if (drawNow) {
            this.redrawPlants()
        }
    }
    
    // ----------------------------------------------------------------------------------- updating 
    updateForChangeToDomainOptions(): void {
        let i: short
        
        if (udomain.domain.breedingAndTimeSeriesOptions.numTimeSeriesStages !== this.numStages) {
            this.numStages = udomain.domain.breedingAndTimeSeriesOptions.numTimeSeriesStages
            for (i = 0; i <= this.numStages - 1; i++) {
                this.percentsOfMaxAge[i] = umath.intMin(100, umath.intMax(0, (i + 1) * 100 / this.numStages))
            }
            if (this.grid.ColCount !== this.numStages) {
                this.grid.ColCount = this.numStages
            }
            this.updateForNewNumberOfStages()
        }
        if (this.grid.DefaultColWidth !== udomain.domain.breedingAndTimeSeriesOptions.thumbnailWidth) {
            this.grid.DefaultColWidth = udomain.domain.breedingAndTimeSeriesOptions.thumbnailWidth
        }
        if (this.grid.DefaultRowHeight !== udomain.domain.breedingAndTimeSeriesOptions.thumbnailHeight) {
            this.grid.DefaultRowHeight = udomain.domain.breedingAndTimeSeriesOptions.thumbnailHeight
            this.grid.RowHeights[1] = kStageNumberTextHeight
        }
        this.redrawPlants()
    }
    
    updateForNewNumberOfStages(): void {
        let i: short
        let firstPlant: PdPlant
        let keepPlant: PdPlant
        
        keepPlant = null
        try {
            if (this.plants.Count > 0) {
                firstPlant = uplant.PdPlant(this.plants.Items[0])
                if (firstPlant !== null) {
                    keepPlant = uplant.PdPlant().create()
                    firstPlant.copyTo(keepPlant)
                    this.plants.clear()
                }
            }
            if (keepPlant !== null) {
                this.initializeWithPlant(keepPlant, umain.kDontDrawYet)
            }
        } finally {
            keepPlant.free
        }
        this.redrawPlants()
    }
    
    updateForChangeToPlants(recalcScale: boolean): void {
        this.selectedPlant = null
        if (this.plants.Count <= 0) {
            this.parentPlant = null
        }
        this.updateMenusForChangeToSelectedPlant()
        if (!this.Visible) {
            this.Show()
        }
        this.BringToFront()
        if (this.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            this.WindowState = delphi_compatability.TWindowState.wsNormal
        }
        this.redrawPlants()
    }
    
    updateMenusForChangeToSelectedPlant(): void {
        this.TimeSeriesMenuCopy.enabled = (this.selectedPlant !== null)
        this.TimeSeriesPopupMenuCopy.enabled = this.TimeSeriesMenuCopy.enabled
        this.TimeSeriesMenuBreed.enabled = (this.selectedPlant !== null)
        this.TimeSeriesPopupMenuBreed.enabled = this.TimeSeriesMenuBreed.enabled
    }
    
    updatePasteMenuForClipboardContents(): void {
        this.TimeSeriesMenuPaste.enabled = (udomain.domain.plantManager.privatePlantClipboard.Count > 0)
        this.TimeSeriesPopupMenuPaste.enabled = (udomain.domain.plantManager.privatePlantClipboard.Count > 0)
    }
    
    updatePlantsFromParent(aPlant: PdPlant): void {
        if ((aPlant === null) || (aPlant !== this.parentPlant) || (this.plants.Count <= 0)) {
            return
        }
        this.initializeWithPlant(aPlant, umain.kDrawNow)
    }
    
    // ----------------------------------------------------------------------------------- plants 
    plantForIndex(index: short): PdPlant {
        let result = new PdPlant()
        result = null
        if (index < 0) {
            return result
        }
        if (index > this.plants.Count - 1) {
            return result
        }
        if (this.plants.Items[index] === null) {
            return result
        }
        result = uplant.PdPlant(this.plants.Items[index])
        return result
    }
    
    plantAtMouse(x: short, y: short): PdPlant {
        let result = new PdPlant()
        let col: long
        let row: long
        
        result = null
        col, row = this.grid.MouseToCell(x, y, col, row)
        if ((col < 0) || (col > this.plants.Count - 1)) {
            return result
        }
        result = this.plantForIndex(col)
        return result
    }
    
    // -------------------------------------------------------------------------------------- drawing 
    redrawPlants(): void {
        if (this.plants.Count <= 0) {
            this.emptyWarningPanel.BringToFront()
            this.emptyWarningPanel.Show()
        } else {
            this.emptyWarningPanel.SendToBack()
            this.emptyWarningPanel.Hide()
        }
        this.recalculateCommonDrawingScaleAndPosition()
        this.grid.Invalidate()
    }
    
    recalculateCommonDrawingScaleAndPosition(): void {
        let plant: PdPlant
        let i: short
        let minScale: float
        let plantPartsToDraw: long
        let partsDrawn: long
        let bestPosition: TPoint
        let widestWidth: long
        let tallestHeight: long
        
        if (this.plants === null) {
            return
        }
        if (this.plants.Count <= 0) {
            return
        }
        // find smallest scale
        minScale = 0.0
        for (i = 0; i <= this.plants.Count - 1; i++) {
            plant = uplant.PdPlant(this.plants.Items[i])
            plant.fixedPreviewScale = false
            plant.fixedDrawPosition = false
            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), uplant.kDontConsiderDomainScale, uplant.kDontDrawNow)
            if ((i === 0) || (plant.drawingScale_PixelsPerMm < minScale)) {
                minScale = plant.drawingScale_PixelsPerMm
            }
        }
        // find common draw position
        widestWidth = 0
        tallestHeight = 0
        for (i = 0; i <= this.plants.Count - 1; i++) {
            plant = uplant.PdPlant(this.plants.Items[i])
            plant.fixedPreviewScale = true
            plant.drawingScale_PixelsPerMm = minScale
            plant.fixedDrawPosition = false
            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), uplant.kDontConsiderDomainScale, uplant.kDontDrawNow)
            if ((i === 0) || (usupport.rWidth(plant.boundsRect_pixels()) > widestWidth)) {
                widestWidth = usupport.rWidth(plant.boundsRect_pixels())
                bestPosition.X = plant.drawPositionIfFixed.X
            }
            if ((i === 0) || (usupport.rHeight(plant.boundsRect_pixels()) > tallestHeight)) {
                tallestHeight = usupport.rHeight(plant.boundsRect_pixels())
                bestPosition.Y = plant.drawPositionIfFixed.Y
            }
        }
        for (i = 0; i <= this.plants.Count - 1; i++) {
            // set draw position to use when repaint - don't draw now
            plant = uplant.PdPlant(this.plants.Items[i])
            plant.fixedPreviewScale = true
            plant.drawingScale_PixelsPerMm = minScale
            plant.fixedDrawPosition = true
            plant.drawPositionIfFixed = bestPosition
            plant.previewCacheUpToDate = false
        }
    }
    
    // -------------------------------------------------------------------------------------- grid 
    gridDrawCell(Sender: TObject, Col: long, Row: long, Rect: TRect, State: TGridDrawState): void {
        let plant: PdPlant
        let textDrawRect: TRect
        let textToDraw: string
        
        this.grid.Canvas.Brush.Color = delphi_compatability.clWhite
        this.grid.Canvas.Pen.Width = 1
        if ((this.plants.Count > 0) && (Row === 0)) {
            this.grid.Canvas.Pen.Color = delphi_compatability.clSilver
        } else {
            this.grid.Canvas.Pen.Color = delphi_compatability.clWhite
        }
        this.grid.Canvas.Rectangle(Rect.left, Rect.top, Rect.right, Rect.bottom)
        if (Row === 1) {
            if (this.plants.Count <= 0) {
                return
            }
            textToDraw = IntToStr(this.ages[Col])
            if (usupport.rWidth(Rect) > 50) {
                // 50 is fixed size
                textToDraw = textToDraw + " days"
            }
            textDrawRect.Left = Rect.left + usupport.rWidth(Rect) / 2 - this.grid.Canvas.TextWidth(textToDraw) / 2
            textDrawRect.Top = Rect.top + usupport.rHeight(Rect) / 2 - this.grid.Canvas.TextHeight("0") / 2
            this.grid.Canvas.TextOut(textDrawRect.Left, textDrawRect.Top, textToDraw)
            return
        }
        plant = null
        plant = this.plantForIndex(Col)
        if (plant === null) {
            return
        }
        if (!plant.previewCacheUpToDate) {
            // draw plant 
            // draw gray solid box to show delay for drawing plant cache
            this.grid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            this.grid.Canvas.Brush.Color = delphi_compatability.clSilver
            this.grid.Canvas.Pen.Color = delphi_compatability.clSilver
            //FIX unresolved WITH expression: Rect
            this.grid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)
            plant.drawPreviewIntoCache(Point(this.grid.DefaultColWidth, this.grid.DefaultRowHeight), uplant.kDontConsiderDomainScale, umain.kDrawNow)
        }
        plant.previewCache.Transparent = false
        ubmpsupport.copyBitmapToCanvasWithGlobalPalette(plant.previewCache, this.grid.Canvas, Rect)
        // draw selection rectangle 
        this.grid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.grid.Canvas.Pen.Width = 2
        if (plant === this.selectedPlant) {
            this.grid.Canvas.Pen.Color = udomain.domain.options.firstSelectionRectangleColor
        } else {
            this.grid.Canvas.Pen.Color = delphi_compatability.clSilver
        }
        //FIX unresolved WITH expression: Rect
        this.grid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)
    }
    
    gridMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.selectedPlant = this.plantAtMouse(X, Y)
        this.updateMenusForChangeToSelectedPlant()
        this.grid.Invalidate()
        if ((Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
            // start drag of plant
            return
        }
        if (this.selectedPlant === null) {
            return
        }
        this.dragPlantStartPoint = Point(X, Y)
        this.grid.BeginDrag(false)
    }
    
    gridDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null) && ((Source === umain.MainForm.drawingPaintBox) || (Source === umain.MainForm.plantListDrawGrid) || (Source === ubreedr.BreederForm.plantsDrawGrid))
        return Accept
    }
    
    gridEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        let plant: PdPlant
        let newCommand: PdCommand
        let newPlants: TList
        let newPlant: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (Target === null) {
            return
        }
        // get plant being dragged 
        plant = this.plantAtMouse(this.dragPlantStartPoint.X, this.dragPlantStartPoint.Y)
        if (plant === null) {
            return
        }
        if (Target === ubreedr.BreederForm.plantsDrawGrid) {
            ubreedr.BreederForm.copyPlantToPoint(plant, X, Y)
        } else if ((Target === umain.MainForm.drawingPaintBox) || (Target === umain.MainForm.plantListDrawGrid)) {
            // make paste command - wants list of plants 
            newPlant = uplant.PdPlant().create()
            plant.copyTo(newPlant)
            this.numTimeSeriesPlantsCopiedThisSession += 1
            newPlant.setName("Time series plant " + IntToStr(this.numTimeSeriesPlantsCopiedThisSession))
            if (Target === umain.MainForm.drawingPaintBox) {
                newPlant.moveTo(Point(X, Y))
            } else {
                newPlant.moveTo(umain.MainForm.standardPastePosition())
            }
            if (!udomain.domain.viewPlantsInMainWindowOnePlantAtATime()) {
                // v2.1
                newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
            }
            //to save memory - don't need it in main window
            newPlant.shrinkPreviewCache()
            newPlants = delphi_compatability.TList().Create()
            newPlants.Add(newPlant)
            newCommand = updcom.PdPasteCommand().createWithListOfPlantsAndOldSelectedList(newPlants, umain.MainForm.selectedPlants)
            updcom.PdPasteCommand(newCommand).useSpecialPastePosition = true
            try {
                //command will free plant if paste is undone
                ucursor.cursor_startWait()
                umain.MainForm.doCommand(newCommand)
            } finally {
                //command has another list, so we must free this one
                newPlants.free
                ucursor.cursor_stopWait()
            }
        }
    }
    
    copyPlantToPoint(aPlant: PdPlant, x: int, y: int): void {
        let newCommand: PdCommand
        
        newCommand = updcom.PdMakeTimeSeriesCommand().createWithNewPlant(aPlant)
        umain.MainForm.doCommand(newCommand)
    }
    
    invalidateGridCell(column: long): void {
        let cellRectOver: TRect
        
        if ((column < 0)) {
            return
        }
        cellRectOver = this.grid.CellRect(column, 0)
        UNRESOLVED.invalidateRect(this.grid.Handle, cellRectOver, true)
    }
    
    // ------------------------------------------------------------------------------- menu 
    TimeSeriesMenuUndoClick(Sender: TObject): void {
        umain.MainForm.MenuEditUndoClick(umain.MainForm)
    }
    
    TimeSeriesMenuRedoClick(Sender: TObject): void {
        umain.MainForm.MenuEditRedoClick(umain.MainForm)
    }
    
    TimeSeriesMenuUndoRedoListClick(Sender: TObject): void {
        umain.MainForm.UndoMenuEditUndoRedoListClick(umain.MainForm)
    }
    
    TimeSeriesMenuCopyClick(Sender: TObject): void {
        let plant: PdPlant
        let copyList: TList
        let saveName: string
        
        plant = this.selectedPlant
        if (plant === null) {
            return
        }
        copyList = delphi_compatability.TList().Create()
        copyList.Add(plant)
        // temporarily change plant name, position, scale to make copy, then put back 
        saveName = plant.getName()
        this.numTimeSeriesPlantsCopiedThisSession += 1
        plant.setName("Time series plant " + IntToStr(this.numTimeSeriesPlantsCopiedThisSession))
        udomain.domain.plantManager.copyPlantsInListToPrivatePlantClipboard(copyList)
        plant.setName(saveName)
        //sets our paste menu also
        umain.MainForm.updatePasteMenuForClipboardContents()
    }
    
    TimeSeriesMenuPasteClick(Sender: TObject): void {
        let newPlant: PdPlant
        let newCommand: PdCommand
        
        if (udomain.domain.plantManager.privatePlantClipboard.Count <= 0) {
            return
        }
        newPlant = uplant.PdPlant().create()
        try {
            udomain.domain.plantManager.pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant)
            newCommand = updcom.PdMakeTimeSeriesCommand().createWithNewPlant(newPlant)
            (newCommand).isPaste = true
            umain.MainForm.doCommand(newCommand)
        } finally {
            //command makes copies from plant, but we must free it
            newPlant.free
        }
    }
    
    TimeSeriesMenuSendCopyClick(Sender: TObject): void {
        this.TimeSeriesMenuCopyClick(this)
        umain.MainForm.MenuEditPasteClick(umain.MainForm)
    }
    
    TimeSeriesMenuBreedClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        if (this.selectedPlant === null) {
            return
        }
        if (ubreedr.BreederForm.selectedRow >= udomain.domain.breedingAndTimeSeriesOptions.maxGenerations - 2) {
            // check if there is room in the breeder - this command will make two new generations 
            ubreedr.BreederForm.fullWarning()
        } else {
            newCommand = updcom.PdBreedFromParentsCommand().createWithInfo(ubreedr.BreederForm.generations, this.selectedPlant, null, -1, udomain.domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, updcom.kCreateFirstGeneration)
            umain.MainForm.doCommand(newCommand)
        }
    }
    
    TimeSeriesMenuDeleteClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        newCommand = updcom.PdDeleteTimeSeriesCommand().create()
        umain.MainForm.doCommand(newCommand)
    }
    
    TimeSeriesPopupMenuCopyClick(Sender: TObject): void {
        this.TimeSeriesMenuCopyClick(this)
    }
    
    TimeSeriesPopupMenuPasteClick(Sender: TObject): void {
        this.TimeSeriesMenuPasteClick(this)
    }
    
    TimeSeriesPopupMenuBreedClick(Sender: TObject): void {
        this.TimeSeriesMenuBreedClick(this)
    }
    
    // ------------------------------------------------------------------------------- resizing 
    FormResize(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants === null) {
            return
        }
        this.grid.SetBounds(0, 0, this.ClientWidth, umath.intMax(0, this.ClientHeight))
        this.emptyWarningPanel.SetBounds(this.ClientWidth / 2 - this.emptyWarningPanel.Width / 2, this.ClientHeight / 2 - this.emptyWarningPanel.Height / 2, this.emptyWarningPanel.Width, this.emptyWarningPanel.Height)
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 280
        UNRESOLVED.ptMinTrackSize.y = 120
    }
    
    // ----------------------------------------------------------------------------- *palette stuff 
    GetPalette(): HPALETTE {
        let result = new HPALETTE()
        result = umain.MainForm.paletteImage.Picture.Bitmap.Palette
        return result
    }
    
    PaletteChanged(Foreground: boolean): boolean {
        let result = false
        let oldPalette: HPALETTE
        let palette: HPALETTE
        let windowHandle: HWnd
        let DC: HDC
        
        palette = this.GetPalette()
        if (palette !== 0) {
            DC = this.GetDeviceContext(windowHandle)
            oldPalette = UNRESOLVED.selectPalette(DC, palette, !Foreground)
            if ((UNRESOLVED.realizePalette(DC) !== 0) && (!delphi_compatability.Application.terminated) && (this.grid !== null)) {
                // if palette changed, repaint drawing 
                this.grid.Invalidate()
            }
            UNRESOLVED.selectPalette(DC, oldPalette, true)
            UNRESOLVED.realizePalette(DC)
            UNRESOLVED.releaseDC(windowHandle, DC)
        }
        result = PdForm.prototype.PaletteChanged.call(this, Foreground)
        return result
    }
    
    TimeSeriesMenuHelpTopicsClick(Sender: TObject): void {
        delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_FINDER, 0)
    }
    
    TimeSeriesMenuHelpOnTimeSeriesClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Making_time_series")
    }
    
    TimeSeriesMenuOptionsStagesClick(Sender: TObject): void {
        ubreedr.BreederForm.changeBreederAndTimeSeriesOptions(0)
    }
    
    TimeSeriesMenuOptionsFastDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsFastDrawClick(umain.MainForm)
    }
    
    TimeSeriesMenuOptionsMediumDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsMediumDrawClick(umain.MainForm)
    }
    
    TimeSeriesMenuOptionsBestDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsBestDrawClick(umain.MainForm)
    }
    
    TimeSeriesMenuOptionsCustomDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsCustomDrawClick(umain.MainForm)
    }
    
}

