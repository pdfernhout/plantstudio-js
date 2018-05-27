// unit Ubreedr

from conversion_common import *
import ubmpsupport
import utimeser
import updcom
import ucommand
import umain
import umath
import ucursor
import usupport
import ubrdopt
import udomain
import updform
import ugener
import uplant
import ucollect
import delphi_compatability

// var
let BreederForm: TBreederForm


// const
const kRedrawPlants = true
const kDontRedrawPlants = false
const kConsiderIfPreviewCacheIsUpToDate = true
const kDontConsiderIfPreviewCacheIsUpToDate = false


// const
const kSelectionIsInFirstColumn = true
const kSelectionIsNotInFirstColumn = false
const kFirstColumnWidth = 20
const kBetweenGap = 4
const kOptionTabSize = 0
const kOptionTabMutation = 1
const kOptionTabBlending = 2
const kOptionTabNonNumeric = 3
const kOptionTabTdos = 4



export class TBreederForm {
    plantsDrawGrid: TDrawGrid = new TDrawGrid()
    BreederMenu: TMainMenu = new TMainMenu()
    BreederMenuEdit: TMenuItem = new TMenuItem()
    BreederMenuCopy: TMenuItem = new TMenuItem()
    BreederMenuPaste: TMenuItem = new TMenuItem()
    N2: TMenuItem = new TMenuItem()
    BreederMenuPlant: TMenuItem = new TMenuItem()
    BreederMenuBreed: TMenuItem = new TMenuItem()
    BreederMenuUndo: TMenuItem = new TMenuItem()
    BreederMenuRedo: TMenuItem = new TMenuItem()
    N1: TMenuItem = new TMenuItem()
    BreederMenuDeleteRow: TMenuItem = new TMenuItem()
    BreederMenuDeleteAll: TMenuItem = new TMenuItem()
    BreederPopupMenu: TPopupMenu = new TPopupMenu()
    BreederPopupMenuBreed: TMenuItem = new TMenuItem()
    BreederPopupMenuCopy: TMenuItem = new TMenuItem()
    BreederPopupMenuPaste: TMenuItem = new TMenuItem()
    BreederPopupMenuDeleteRow: TMenuItem = new TMenuItem()
    N4: TMenuItem = new TMenuItem()
    BreederMenuRandomize: TMenuItem = new TMenuItem()
    BreederMenuRandomizeAll: TMenuItem = new TMenuItem()
    BreederMenuMakeTimeSeries: TMenuItem = new TMenuItem()
    BreederPopupMenuRandomize: TMenuItem = new TMenuItem()
    N5: TMenuItem = new TMenuItem()
    emptyWarningPanel: TPanel = new TPanel()
    Label1: TLabel = new TLabel()
    BreederPopupMenuMakeTimeSeries: TMenuItem = new TMenuItem()
    BreederMenuVariation: TMenuItem = new TMenuItem()
    BreederMenuVariationLow: TMenuItem = new TMenuItem()
    BreederMenuVariationMedium: TMenuItem = new TMenuItem()
    BreederMenuVariationHigh: TMenuItem = new TMenuItem()
    BreederMenuVariationCustom: TMenuItem = new TMenuItem()
    BreederMenuOptions: TMenuItem = new TMenuItem()
    BreederMenuOtherOptions: TMenuItem = new TMenuItem()
    MenuBreederHelp: TMenuItem = new TMenuItem()
    BreederMenuHelpOnBreeding: TMenuItem = new TMenuItem()
    BreederMenuHelpTopics: TMenuItem = new TMenuItem()
    N3: TMenuItem = new TMenuItem()
    BreederMenuOptionsDrawAs: TMenuItem = new TMenuItem()
    BreederMenuOptionsFastDraw: TMenuItem = new TMenuItem()
    BreederMenuOptionsMediumDraw: TMenuItem = new TMenuItem()
    BreederMenuOptionsBestDraw: TMenuItem = new TMenuItem()
    BreederMenuOptionsCustomDraw: TMenuItem = new TMenuItem()
    N6: TMenuItem = new TMenuItem()
    BreederMenuVaryColors: TMenuItem = new TMenuItem()
    BreederMenuVary3DObjects: TMenuItem = new TMenuItem()
    breederToolbarPanel: TPanel = new TPanel()
    variationLow: TSpeedButton = new TSpeedButton()
    variationMedium: TSpeedButton = new TSpeedButton()
    variationCustom: TSpeedButton = new TSpeedButton()
    varyColors: TSpeedButton = new TSpeedButton()
    vary3DObjects: TSpeedButton = new TSpeedButton()
    helpButton: TSpeedButton = new TSpeedButton()
    variationHigh: TSpeedButton = new TSpeedButton()
    BreederMenuVariationNone: TMenuItem = new TMenuItem()
    variationNoneNumeric: TSpeedButton = new TSpeedButton()
    BreederMenuSendCopyToMainWindow: TMenuItem = new TMenuItem()
    N7: TMenuItem = new TMenuItem()
    BreederPopupMenuSendCopytoMainWindow: TMenuItem = new TMenuItem()
    N8: TMenuItem = new TMenuItem()
    breedButton: TSpeedButton = new TSpeedButton()
    BreederMenuUndoRedoList: TMenuItem = new TMenuItem()
    selectedRow: short = 0
    generations: TListCollection = new TListCollection()
    dragPlantStartPoint: TPoint = new TPoint()
    lightUpCell: TPoint = new TPoint()
    numBreederPlantsCopiedThisSession: long = 0
    internalChange: boolean = false
    drawing: boolean = false
    needToRedrawFromChangeToDrawOptions: boolean = false
    TBreederForm.prototype = new PdForm()
    TBreederForm.prototype.constructor = TBreederForm
    
    //$R *.DFM
    // ---------------------------------------------------------------------------- creation/destruction 
    FormCreate(Sender: TObject): void {
        let tempBoundsRect: TRect
        
        this.generations = ucollect.TListCollection().Create()
        this.plantsDrawGrid.DragCursor = ucursor.crDragPlant
        this.Position = delphi_compatability.TPosition.poDesigned
        // keep window on screen - left corner of title bar 
        tempBoundsRect = udomain.domain.breederWindowRect
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
                this.BreederMenuOptionsFastDraw.checked = true
                break
            case udomain.kDrawMedium:
                this.BreederMenuOptionsMediumDraw.checked = true
                break
            case udomain.kDrawBest:
                this.BreederMenuOptionsBestDraw.checked = true
                break
            case udomain.kDrawCustom:
                this.BreederMenuOptionsCustomDraw.checked = true
                break
        }
        this.updateForChangeToDomainOptions()
        this.updateMenusForChangeToGenerations()
        //to get redo messages
        umain.MainForm.updateMenusForUndoRedo()
        this.lightUpCell = Point(-1, -1)
        this.emptyWarningPanel.SendToBack()
    }
    
    FormDestroy(Sender: TObject): void {
        this.generations.free
        this.generations = null
    }
    
    FormActivate(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.generations.Count <= 0) {
            this.emptyWarningPanel.BringToFront()
        } else if (this.needToRedrawFromChangeToDrawOptions) {
            this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
            this.needToRedrawFromChangeToDrawOptions = false
        }
    }
    
    // -------------------------------------------------------------------------------------- grid 
    updateForChangeToDomainOptions(): void {
        let generation: PdGeneration
        let plant: PdPlant
        let genCount: short
        let plCount: short
        let newAge: int
        let atLeastOnePlantHasChangedAge: boolean
        
        if (this.plantsDrawGrid.ColCount !== udomain.domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1) {
            this.plantsDrawGrid.ColCount = udomain.domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1
        }
        if (((this.plantsDrawGrid.DefaultColWidth !== udomain.domain.breedingAndTimeSeriesOptions.thumbnailWidth) || (this.plantsDrawGrid.DefaultRowHeight !== udomain.domain.breedingAndTimeSeriesOptions.thumbnailHeight))) {
            this.plantsDrawGrid.DefaultColWidth = udomain.domain.breedingAndTimeSeriesOptions.thumbnailWidth
            this.plantsDrawGrid.ColWidths[0] = kFirstColumnWidth
            this.plantsDrawGrid.DefaultRowHeight = udomain.domain.breedingAndTimeSeriesOptions.thumbnailHeight
            this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
        }
        switch (udomain.domain.breedingAndTimeSeriesOptions.variationType) {
            case udomain.kBreederVariationLow:
                this.BreederMenuVariationLow.checked = true
                this.variationLow.Down = true
                break
            case udomain.kBreederVariationMedium:
                this.BreederMenuVariationMedium.checked = true
                this.variationMedium.Down = true
                break
            case udomain.kBreederVariationHigh:
                this.BreederMenuVariationHigh.checked = true
                this.variationHigh.Down = true
                break
            case udomain.kBreederVariationCustom:
                this.BreederMenuVariationCustom.checked = true
                this.variationCustom.Down = true
                break
            case udomain.kBreederVariationNoNumeric:
                this.BreederMenuVariationNone.checked = true
                this.variationNoneNumeric.Down = true
                break
        }
        this.BreederMenuVaryColors.checked = udomain.domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        this.varyColors.Down = udomain.domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        this.BreederMenuVary3DObjects.checked = udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        this.vary3DObjects.Down = udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        this.redoCaption()
        atLeastOnePlantHasChangedAge = false
        if (this.generations.Count > 0) {
            for (genCount = 0; genCount <= this.generations.Count - 1; genCount++) {
                generation = ugener.PdGeneration(this.generations.Items[genCount])
                if (generation.plants.Count > 0) {
                    for (plCount = 0; plCount <= generation.plants.Count - 1; plCount++) {
                        plant = uplant.PdPlant(generation.plants.Items[plCount])
                        newAge = intround(udomain.domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0 * plant.pGeneral.ageAtMaturity)
                        if (plant.age !== newAge) {
                            plant.setAge(newAge)
                            atLeastOnePlantHasChangedAge = true
                        }
                    }
                }
            }
        }
        if (atLeastOnePlantHasChangedAge) {
            this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
        }
    }
    
    redrawPlants(considerIfPreviewCacheIsUpToDate: boolean): void {
        let generation: PdGeneration
        let plant: PdPlant
        let genCount: short
        let plCount: short
        
        if (!considerIfPreviewCacheIsUpToDate) {
            for (genCount = 0; genCount <= this.generations.Count - 1; genCount++) {
                generation = ugener.PdGeneration(this.generations.Items[genCount])
                if (generation.plants.Count > 0) {
                    for (plCount = 0; plCount <= generation.plants.Count - 1; plCount++) {
                        plant = uplant.PdPlant(generation.plants.Items[plCount])
                        plant.previewCacheUpToDate = false
                    }
                }
            }
        }
        this.plantsDrawGrid.Invalidate()
        this.plantsDrawGrid.Update()
    }
    
    plantsDrawGridDrawCell(Sender: TObject, Col: long, Row: long, Rect: TRect, State: TGridDrawState): void {
        let generation: PdGeneration
        let plant: PdPlant
        let textDrawRect: TRect
        
        try {
            this.plantsDrawGrid.Canvas.Font = this.plantsDrawGrid.Font
            this.plantsDrawGrid.Canvas.Font.Color = delphi_compatability.clBlack
            if (Col === 0) {
                //if (row = selectedRow) and (generations.count > 0) then
                //plantsDrawGrid.canvas.brush.color := clBlue
                //else
                this.plantsDrawGrid.Canvas.Brush.Color = delphi_compatability.clWhite
                this.plantsDrawGrid.Canvas.Pen.Color = this.plantsDrawGrid.Canvas.Brush.Color
                this.plantsDrawGrid.Canvas.Rectangle(Rect.left, Rect.top, Rect.right, Rect.bottom)
                if (Row > this.generations.Count - 1) {
                    return
                }
                //if row = selectedRow then
                //plantsDrawGrid.canvas.font.color := clWhite;
                textDrawRect.Left = Rect.left + usupport.rWidth(Rect) / 2 - this.plantsDrawGrid.Canvas.TextWidth(IntToStr(Row + 1)) / 2
                textDrawRect.Top = Rect.top + usupport.rHeight(Rect) / 2 - this.plantsDrawGrid.Canvas.TextHeight("0") / 2
                this.plantsDrawGrid.Canvas.TextOut(textDrawRect.Left, textDrawRect.Top, IntToStr(Row + 1))
                return
            } else {
                this.plantsDrawGrid.Canvas.Brush.Color = delphi_compatability.clWhite
                this.plantsDrawGrid.Canvas.Pen.Width = 1
                this.plantsDrawGrid.Canvas.Pen.Color = delphi_compatability.clWhite
                this.plantsDrawGrid.Canvas.Rectangle(Rect.left, Rect.top, Rect.right, Rect.bottom)
            }
            generation = null
            generation = this.generationForIndex(Row)
            if (generation === null) {
                return
            }
            plant = null
            plant = generation.plantForIndex(Col - 1)
            if (plant === null) {
                return
            }
            if (!plant.previewCacheUpToDate) {
                // draw plant 
                // draw gray solid box to show delay for drawing plant cache
                this.plantsDrawGrid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
                this.plantsDrawGrid.Canvas.Brush.Color = delphi_compatability.clSilver
                this.plantsDrawGrid.Canvas.Pen.Color = delphi_compatability.clSilver
                //FIX unresolved WITH expression: Rect
                this.plantsDrawGrid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)
                // draw plant preview cache
                plant.fixedPreviewScale = false
                plant.fixedDrawPosition = false
                plant.drawPreviewIntoCache(Point(this.plantsDrawGrid.DefaultColWidth, this.plantsDrawGrid.DefaultRowHeight), uplant.kDontConsiderDomainScale, umain.kDrawNow)
            }
            plant.previewCache.Transparent = false
            ubmpsupport.copyBitmapToCanvasWithGlobalPalette(plant.previewCache, this.plantsDrawGrid.Canvas, Rect)
            // draw selection rectangle 
            this.plantsDrawGrid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            this.plantsDrawGrid.Canvas.Pen.Width = 2
            if ((Col === this.lightUpCell.X) && (Row === this.lightUpCell.Y)) {
                this.plantsDrawGrid.Canvas.Pen.Color = delphi_compatability.clAqua
            } else if (Row === this.selectedRow) {
                if (plant === generation.firstSelectedPlant()) {
                    this.plantsDrawGrid.Canvas.Pen.Color = udomain.domain.options.firstSelectionRectangleColor
                } else if (plant === generation.secondSelectedPlant()) {
                    this.plantsDrawGrid.Canvas.Pen.Color = udomain.domain.options.multiSelectionRectangleColor
                } else {
                    this.plantsDrawGrid.Canvas.Pen.Color = delphi_compatability.clSilver
                }
            } else {
                this.plantsDrawGrid.Canvas.Pen.Color = delphi_compatability.clSilver
            }
            //FIX unresolved WITH expression: Rect
            this.plantsDrawGrid.Canvas.Rectangle(this.Left + 1, this.Top + 1, UNRESOLVED.right, UNRESOLVED.bottom)
            if (plant === generation.firstParent) {
                // draw parent indicator 
                this.plantsDrawGrid.Canvas.TextOut(Rect.left + 4, Rect.top + 2, "p1")
            } else if (plant === generation.secondParent) {
                this.plantsDrawGrid.Canvas.TextOut(Rect.left + 4, Rect.top + 2, "p2")
            }
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    invalidateGridCell(column: long, row: long): void {
        let cellRectOver: TRect
        
        if ((column < 0) && (row < 0)) {
            return
        }
        cellRectOver = this.plantsDrawGrid.CellRect(column, row)
        UNRESOLVED.invalidateRect(this.plantsDrawGrid.Handle, cellRectOver, true)
    }
    
    invalidateGridRow(row: long): void {
        let rowRectOver: TRect
        
        if (row < 0) {
            return
        }
        rowRectOver = this.plantsDrawGrid.CellRect(0, row)
        rowRectOver.Right = this.plantsDrawGrid.Width
        UNRESOLVED.invalidateRect(this.plantsDrawGrid.Handle, rowRectOver, true)
    }
    
    plantsDrawGridMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: long
        let row: long
        let generation: PdGeneration
        let plant: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        // had selection here, moved to mouse down because double-click makes extra mouse up, seems okay so far
    }
    
    plantsDrawGridDblClick(Sender: TObject): void {
        this.BreederMenuBreedClick(this)
    }
    
    // ------------------------------------------------------------------------ dragging 
    plantsDrawGridMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let plant: PdPlant
        let col: int
        let row: int
        let oldSelectedRow: int
        let generation: PdGeneration
        
        col, row = this.plantsDrawGrid.MouseToCell(X, Y, col, row)
        if ((row >= 0) && (row <= this.generations.Count - 1)) {
            generation = ugener.PdGeneration(this.generations.Items[row])
            if (generation !== null) {
                this.selectGeneration(generation)
                if ((col >= 1) && (col - 1 <= generation.plants.Count - 1)) {
                    plant = uplant.PdPlant(generation.plants.Items[col - 1])
                    if (plant !== null) {
                        generation.selectPlant(plant, (delphi_compatability.TShiftStateEnum.ssShift in Shift))
                    } else {
                        generation.deselectAllPlants()
                    }
                    // in first column or past them on right 
                } else {
                    generation.deselectAllPlants()
                }
            } else {
                this.deselectAllGenerations()
            }
        } else {
            this.deselectAllGenerations()
        }
        this.updateForChangeToGenerations()
        if ((Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
            // start drag of plant
            return
        }
        plant = this.plantAtMouse(X, Y)
        if (plant === null) {
            return
        }
        this.dragPlantStartPoint = Point(X, Y)
        this.plantsDrawGrid.BeginDrag(false)
    }
    
    plantsDrawGridDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        let col: long
        let row: long
        let plant: PdPlant
        
        Accept = (Source !== null) && (Sender !== null) && ((Sender === Source) || (Source === umain.MainForm.drawingPaintBox) || (Source === umain.MainForm.plantListDrawGrid) || (Source === utimeser.TimeSeriesForm.grid))
        if ((Accept)) {
            plant = this.plantAtMouse(X, Y)
            if (plant === null) {
                Accept = false
                return Accept
            }
            col, row = this.plantsDrawGrid.MouseToCell(X, Y, col, row)
            if ((col !== this.lightUpCell.X) || (row !== this.lightUpCell.Y)) {
                this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
                this.lightUpCell = Point(col, row)
                this.invalidateGridCell(col, row)
            }
        }
        return Accept
    }
    
    plantsDrawGridEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        let col: long
        let row: long
        let plant: PdPlant
        let plantToReplace: PdPlant
        let newCommand: PdCommand
        let newPlants: TList
        let newPlant: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        // remove lightup on cell before resetting cell
        this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
        this.lightUpCell = Point(-1, -1)
        if (Target === null) {
            return
        }
        // get plant being dragged 
        plant = this.plantAtMouse(this.dragPlantStartPoint.X, this.dragPlantStartPoint.Y)
        if (plant === null) {
            return
        }
        if ((Target === umain.MainForm.drawingPaintBox) || (Target === umain.MainForm.plantListDrawGrid)) {
            // make paste command - wants list of plants 
            newPlant = uplant.PdPlant().create()
            plant.copyTo(newPlant)
            this.numBreederPlantsCopiedThisSession += 1
            newPlant.setName("Breeder plant " + IntToStr(this.numBreederPlantsCopiedThisSession))
            if ((Target === umain.MainForm.drawingPaintBox)) {
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
                ucursor.cursor_startWait()
                umain.MainForm.doCommand(newCommand)
            } finally {
                //command has another list, so we must free this one
                newPlants.free
                ucursor.cursor_stopWait()
            }
            //command will free plant if paste is undone
        } else if (Target === utimeser.TimeSeriesForm.grid) {
            utimeser.TimeSeriesForm.copyPlantToPoint(plant, X, Y)
        } else if (Target === Sender) {
            // get plant being replaced 
            col, row = this.plantsDrawGrid.MouseToCell(X, Y, col, row)
            if (!this.inGrid(row, col)) {
                return
            }
            plantToReplace = this.plantForRowAndColumn(row, col)
            if (plantToReplace === null) {
                return
            }
            if (plantToReplace === plant) {
                return
            }
            // make replace command 
            newCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(plant, row, col)
            try {
                ucursor.cursor_startWait()
                umain.MainForm.doCommand(newCommand)
            } finally {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    copyPlantToPoint(aPlant: PdPlant, x: int, y: int): void {
        let col: long
        let row: long
        let plant: PdPlant
        let newCommand: PdCommand
        
        col, row = this.plantsDrawGrid.MouseToCell(x, y, col, row)
        plant = this.plantForRowAndColumn(row, col)
        if (plant === null) {
            return
        }
        newCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(aPlant, row, col)
        umain.MainForm.doCommand(newCommand)
    }
    
    // ------------------------------------------------------------- responding to commands 
    replacePlantInRow(oldPlant: PdPlant, newPlant: PdPlant, row: short): void {
        let generation: PdGeneration
        
        generation = this.generationForIndex(row)
        if (generation === null) {
            throw new GeneralException.create("Problem: Invalid row in method TBreederForm.replacePlantInRow.")
        }
        generation.replacePlant(oldPlant, newPlant)
        this.updateForChangeToPlant(newPlant)
    }
    
    forgetGenerationsListBelowRow(aRow: short): void {
        while (this.generations.Count - 1 > aRow) {
            this.forgetLastGeneration()
        }
    }
    
    addGenerationsFromListBelowRow(aRow: short, aGenerationsList: TList): void {
        let i: short
        
        if (aRow + 1 <= aGenerationsList.Count - 1) {
            for (i = aRow + 1; i <= aGenerationsList.Count - 1; i++) {
                this.addGeneration(ugener.PdGeneration(aGenerationsList.Items[i]))
            }
        }
    }
    
    addGeneration(newGeneration: PdGeneration): void {
        this.generations.Add(newGeneration)
    }
    
    forgetLastGeneration(): void {
        let lastGeneration: PdGeneration
        
        if (this.generations.Count <= 0) {
            return
        }
        lastGeneration = ugener.PdGeneration(this.generations.Items[this.generations.Count - 1])
        this.generations.Remove(lastGeneration)
    }
    
    selectGeneration(aGeneration: PdGeneration): void {
        let lastFullyVisibleRow: short
        
        this.selectedRow = this.generations.IndexOf(aGeneration)
        lastFullyVisibleRow = this.plantsDrawGrid.TopRow + this.plantsDrawGrid.VisibleRowCount - 1
        if (this.selectedRow > lastFullyVisibleRow) {
            this.plantsDrawGrid.TopRow = this.plantsDrawGrid.TopRow + (this.selectedRow - lastFullyVisibleRow)
        }
        if (this.selectedRow < this.plantsDrawGrid.TopRow) {
            this.plantsDrawGrid.TopRow = this.selectedRow
        }
    }
    
    deselectAllGenerations(): void {
        let genCount: int
        let generation: PdGeneration
        
        this.selectedRow = -1
        for (genCount = 0; genCount <= this.generations.Count - 1; genCount++) {
            generation = ugener.PdGeneration(this.generations.Items[genCount])
            generation.deselectAllPlants()
        }
    }
    
    updateForChangeToGenerations(): void {
        this.updateMenusForChangeToGenerations()
        this.internalChange = true
        if (!this.Visible) {
            //calls resize
            this.Show()
        }
        this.BringToFront()
        if (this.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            this.WindowState = delphi_compatability.TWindowState.wsNormal
        }
        this.internalChange = false
        if (this.plantsDrawGrid.RowCount < this.generations.Count) {
            this.plantsDrawGrid.RowCount = this.generations.Count
        }
        this.plantsDrawGrid.Invalidate()
        this.plantsDrawGrid.Update()
        this.redoCaption()
        if (this.generations.Count <= 0) {
            this.emptyWarningPanel.BringToFront()
        } else {
            this.emptyWarningPanel.SendToBack()
        }
    }
    
    updateForChangeToPlant(aPlant: PdPlant): void {
        let genCount: int
        let plCount: int
        let generation: PdGeneration
        let plant: PdPlant
        let cellRectOver: TRect
        
        for (genCount = 0; genCount <= this.generations.Count - 1; genCount++) {
            generation = ugener.PdGeneration(this.generations.Items[genCount])
            if (generation.plants.Count > 0) {
                for (plCount = 0; plCount <= generation.plants.Count - 1; plCount++) {
                    plant = uplant.PdPlant(generation.plants.Items[plCount])
                    if (plant === aPlant) {
                        cellRectOver = this.plantsDrawGrid.CellRect(plCount + 1, genCount)
                        this.plantsDrawGridDrawCell(this, plCount + 1, genCount, cellRectOver, {UNRESOLVED.gdFocused, UNRESOLVED.gdSelected, })
                        return
                    }
                }
            }
        }
    }
    
    updateForChangeToSelections(selectionIsInFirstColumn: boolean): void {
        let i: int
        let plant: PdPlant
        
        this.updateMenusForChangeToSelection()
        //
        //  if selectedPlants.count > 0 then
        //    for i := 0 to selectedPlants.count - 1 do
        //      begin
        //      plant := PdPlant(selectedPlants.items[i]);
        //      self.updateForChangeToPlant(plant);
        //      end;
        //      
        //if selectionIsInFirstColumn then
        this.plantsDrawGrid.Invalidate()
    }
    
    //
    //procedure TBreederForm.updateForChangeToSelections;
    //  begin
    //  for genCount := 0 to generations.count - 1 do
    //    begin
    //    generation := PdGeneration(generations.items[genCount]);
    //    if generation.plants.count > 0 then for plCount := 0 to generation.plants.count - 1 do
    //      begin
    //      plant := PdPlant(generation.plants.items[plCount]);
    //      if generation.plantWasSelected(plant) then
    //        self.plantsDrawGridDrawCell(self, plCount+1, genCount, plantsDrawGrid.cellRect(plCount+1, genCount), []);
    //      if generation.plantIsSelected(plant) then
    //        self.plantsDrawGridDrawCell(self, plCount+1, genCount, plantsDrawGrid.cellRect(plCount+1, genCount), []);
    //      end;
    //    end;
    //  end;
    //    
    redoCaption(): void {
        if (this.generations.Count === 1) {
            // new v1.4
            this.Caption = "Breeder (1 generation)"
        } else {
            this.Caption = "Breeder (" + IntToStr(this.generations.Count) + " generations)"
        }
        //
        //  self.caption := self.caption + ', numbers ';
        //  case domain.breedingAndTimeSeriesOptions.variationType of
        //    kBreederVariationNoNumeric: self.caption := self.caption + none ;
        //    kBreederVariationLow:     self.caption := self.caption + 'low' ;
        //    kBreederVariationMedium:  self.caption := self.caption + 'medium' ;
        //    kBreederVariationHigh:    self.caption := self.caption + 'high' ;
        //    kBreederVariationCustom:  self.caption := self.caption + 'custom' ;
        //    end;
        //  if domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues then
        //    self.caption := self.caption + ', colors on'
        //  else
        //    self.caption := self.caption + ', colors off'
        //  if domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary then
        //    self.caption := self.caption + ', 3D objects on'
        //  else
        //    self.caption := self.caption + ', 3D objects off'
        //    
    }
    
    updateMenusForChangeToGenerations(): void {
        let havePlants: boolean
        
        havePlants = this.generations.Count > 0
        this.BreederMenuDeleteAll.enabled = havePlants
        this.BreederMenuRandomizeAll.enabled = havePlants
        this.updateMenusForChangeToSelection()
    }
    
    updateMenusForChangeToSelection(): void {
        let haveSelection: boolean
        
        haveSelection = (this.primarySelectedPlant() !== null)
        this.BreederMenuRandomize.enabled = haveSelection
        this.BreederMenuDeleteRow.enabled = haveSelection
        this.BreederPopupMenuDeleteRow.enabled = haveSelection
        this.BreederMenuBreed.enabled = haveSelection
        this.BreederMenuMakeTimeSeries.enabled = haveSelection
        this.BreederMenuCopy.enabled = haveSelection
        this.BreederPopupMenuBreed.enabled = this.BreederMenuBreed.enabled
        this.breedButton.Enabled = this.BreederMenuBreed.enabled
        this.BreederPopupMenuMakeTimeSeries.enabled = this.BreederMenuMakeTimeSeries.enabled
        this.BreederPopupMenuCopy.enabled = this.BreederMenuCopy.enabled
        this.BreederPopupMenuRandomize.enabled = this.BreederMenuRandomize.enabled
        this.updatePasteMenuForClipboardContents()
        // must paste onto a selected plant 
        this.BreederMenuPaste.enabled = this.BreederMenuPaste.enabled && haveSelection
        this.BreederPopupMenuPaste.enabled = this.BreederMenuPaste.enabled
    }
    
    updatePasteMenuForClipboardContents(): void {
        this.BreederMenuPaste.enabled = (this.primarySelectedPlant() !== null) && (udomain.domain.plantManager.privatePlantClipboard.Count > 0)
        this.BreederPopupMenuPaste.enabled = this.BreederMenuPaste.enabled
    }
    
    selectedGeneration(): PdGeneration {
        let result = new PdGeneration()
        result = null
        if ((this.selectedRow < 0) || (this.selectedRow > this.generations.Count - 1)) {
            return result
        }
        result = ugener.PdGeneration(this.generations.Items[this.selectedRow])
        return result
    }
    
    primarySelectedPlant(): PdPlant {
        let result = new PdPlant()
        let generation: PdGeneration
        
        result = null
        generation = this.selectedGeneration()
        if (generation === null) {
            return result
        }
        result = generation.firstSelectedPlant()
        return result
    }
    
    plantAtMouse(x: short, y: short): PdPlant {
        let result = new PdPlant()
        let col: long
        let row: long
        
        result = null
        col, row = this.plantsDrawGrid.MouseToCell(x, y, col, row)
        if (!this.inGrid(row, col)) {
            return result
        }
        result = this.plantForRowAndColumn(row, col)
        return result
    }
    
    // ----------------------------------------------------------------------------- menu 
    BreederMenuUndoClick(Sender: TObject): void {
        umain.MainForm.MenuEditUndoClick(Sender)
    }
    
    BreederMenuRedoClick(Sender: TObject): void {
        umain.MainForm.MenuEditRedoClick(Sender)
    }
    
    BreederMenuCopyClick(Sender: TObject): void {
        let plant: PdPlant
        let copyList: TList
        let saveName: string
        
        plant = this.primarySelectedPlant()
        if (plant === null) {
            return
        }
        copyList = delphi_compatability.TList().Create()
        copyList.Add(plant)
        // temporarily change plant name to make copy, then put back 
        saveName = plant.getName()
        this.numBreederPlantsCopiedThisSession += 1
        plant.setName("Breeder plant " + IntToStr(this.numBreederPlantsCopiedThisSession))
        udomain.domain.plantManager.copyPlantsInListToPrivatePlantClipboard(copyList)
        plant.setName(saveName)
        //sets our paste menu also
        umain.MainForm.updatePasteMenuForClipboardContents()
    }
    
    BreederMenuSendCopyToMainWindowClick(Sender: TObject): void {
        this.BreederMenuCopyClick(this)
        umain.MainForm.MenuEditPasteClick(umain.MainForm)
    }
    
    BreederMenuUndoRedoListClick(Sender: TObject): void {
        umain.MainForm.UndoMenuEditUndoRedoListClick(umain.MainForm)
    }
    
    BreederMenuPasteClick(Sender: TObject): void {
        let generation: PdGeneration
        let plant: PdPlant
        let newPlant: PdPlant
        let newCommand: PdCommand
        let column: short
        
        if (udomain.domain.plantManager.privatePlantClipboard.Count <= 0) {
            return
        }
        generation = this.selectedGeneration()
        if (generation === null) {
            return
        }
        plant = generation.firstSelectedPlant()
        if (plant === null) {
            return
        }
        column = generation.plants.IndexOf(plant) + 1
        newPlant = uplant.PdPlant().create()
        udomain.domain.plantManager.pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant)
        newCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(newPlant, this.selectedRow, column)
        umain.MainForm.doCommand(newCommand)
        //command will free plant if paste is undone
    }
    
    BreederMenuBreedClick(Sender: TObject): void {
        let generationToBreed: PdGeneration
        let newCommand: PdCommand
        
        if ((this.selectedRow < 0) || (this.selectedRow > this.generations.Count - 1)) {
            return
        }
        if (this.selectedRow >= udomain.domain.breedingAndTimeSeriesOptions.maxGenerations - 1) {
            // check if there is room in the breeder - this command will make one new generation 
            this.fullWarning()
            return
        }
        generationToBreed = ugener.PdGeneration(this.generations.Items[this.selectedRow])
        if (generationToBreed.selectedPlants.Count <= 0) {
            return
        }
        newCommand = updcom.PdBreedFromParentsCommand().createWithInfo(this.generations, generationToBreed.firstSelectedPlant(), generationToBreed.secondSelectedPlant(), this.selectedRow, udomain.domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, updcom.kDontCreateFirstGeneration)
        generationToBreed.firstParent = generationToBreed.firstSelectedPlant()
        generationToBreed.secondParent = generationToBreed.secondSelectedPlant()
        umain.MainForm.doCommand(newCommand)
    }
    
    BreederMenuMakeTimeSeriesClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        if (this.primarySelectedPlant() === null) {
            return
        }
        newCommand = updcom.PdMakeTimeSeriesCommand().createWithNewPlant(this.primarySelectedPlant())
        umain.MainForm.doCommand(newCommand)
    }
    
    fullWarning(): void {
        MessageDialog("The breeder is full. " + chr(13) + chr(13) + "You must delete some rows" + chr(13) + "(or increase the number of rows allowed in the breeder options) " + chr(13) + "before you can breed more plants.", mtWarning, {mbOK, }, 0)
    }
    
    BreederMenuDeleteRowClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        if (this.selectedGeneration() === null) {
            return
        }
        newCommand = updcom.PdDeleteBreederGenerationCommand().createWithGeneration(this.selectedGeneration())
        umain.MainForm.doCommand(newCommand)
    }
    
    BreederMenuDeleteAllClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        if (this.generations.Count <= 0) {
            return
        }
        newCommand = updcom.PdDeleteAllBreederGenerationsCommand().create()
        umain.MainForm.doCommand(newCommand)
    }
    
    BreederMenuRandomizeClick(Sender: TObject): void {
        let newCommand: PdCommand
        let randomizeList: TList
        let aGeneration: PdGeneration
        let i: short
        let plant: PdPlant
        
        aGeneration = this.selectedGeneration()
        if (aGeneration === null) {
            return
        }
        if (aGeneration.selectedPlants.Count <= 0) {
            return
        }
        randomizeList = delphi_compatability.TList().Create()
        try {
            for (i = 0; i <= aGeneration.selectedPlants.Count - 1; i++) {
                plant = uplant.PdPlant(aGeneration.selectedPlants.Items[i])
                randomizeList.Add(plant)
            }
            newCommand = updcom.PdRandomizeCommand().createWithListOfPlants(randomizeList)
            (newCommand).isInBreeder = true
            ucursor.cursor_startWait()
            umain.MainForm.doCommand(newCommand)
        } finally {
            //command has another list, so we must free this one
            randomizeList.free
            ucursor.cursor_stopWait()
        }
    }
    
    BreederMenuRandomizeAllClick(Sender: TObject): void {
        let generation: PdGeneration
        let i: short
        let j: short
        let newCommand: PdCommand
        let randomizeList: TList
        
        if (this.generations.Count <= 0) {
            return
        }
        randomizeList = null
        try {
            ucursor.cursor_startWait()
            randomizeList = delphi_compatability.TList().Create()
            if (this.generations.Count > 0) {
                for (i = 0; i <= this.generations.Count - 1; i++) {
                    generation = ugener.PdGeneration(this.generations.Items[i])
                    if (generation.plants.Count > 0) {
                        for (j = 0; j <= generation.plants.Count - 1; j++) {
                            randomizeList.Add(uplant.PdPlant(generation.plants.Items[j]))
                        }
                    }
                }
            }
            newCommand = updcom.PdRandomizeCommand().createWithListOfPlants(randomizeList)
            (newCommand).isInBreeder = true
            (newCommand).isRandomizeAllInBreeder = true
            umain.MainForm.doCommand(newCommand)
        } finally {
            randomizeList.free
            ucursor.cursor_stopWait()
        }
    }
    
    BreederMenuVariationNoneClick(Sender: TObject): void {
        udomain.domain.breedingAndTimeSeriesOptions.variationType = udomain.kBreederVariationNoNumeric
        this.BreederMenuVariationNone.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationLowClick(Sender: TObject): void {
        udomain.domain.breedingAndTimeSeriesOptions.variationType = udomain.kBreederVariationLow
        this.BreederMenuVariationLow.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationMediumClick(Sender: TObject): void {
        udomain.domain.breedingAndTimeSeriesOptions.variationType = udomain.kBreederVariationMedium
        this.BreederMenuVariationMedium.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationHighClick(Sender: TObject): void {
        udomain.domain.breedingAndTimeSeriesOptions.variationType = udomain.kBreederVariationHigh
        // this is to deal with if it was turned off by not having a library
        // v2.0 removed - this is separate now
        // domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary := true;
        this.BreederMenuVariationHigh.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationCustomClick(Sender: TObject): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabMutation)
    }
    
    BreederMenuOtherOptionsClick(Sender: TObject): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabSize)
    }
    
    BreederMenuVaryColorsClick(Sender: TObject): void {
        let newCommand: PdCommand
        let options: BreedingAndTimeSeriesOptionsStructure
        
        this.BreederMenuVaryColors.checked = !this.BreederMenuVaryColors.checked
        options = udomain.domain.breedingAndTimeSeriesOptions
        options.mutateAndBlendColorValues = this.BreederMenuVaryColors.checked
        newCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(options, udomain.domain.options)
        umain.MainForm.doCommand(newCommand)
    }
    
    BreederMenuVary3DObjectsClick(Sender: TObject): void {
        let newCommand: PdCommand
        let options: BreedingAndTimeSeriesOptionsStructure
        
        this.BreederMenuVary3DObjects.checked = !this.BreederMenuVary3DObjects.checked
        options = udomain.domain.breedingAndTimeSeriesOptions
        options.chooseTdosRandomlyFromCurrentLibrary = this.BreederMenuVary3DObjects.checked
        newCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(options, udomain.domain.options)
        umain.MainForm.doCommand(newCommand)
    }
    
    changeBreederAndTimeSeriesOptions(tabIndexToShow: short): void {
        let optionsForm: TBreedingOptionsForm
        let newCommand: PdCommand
        let domainCommand: PdCommand
        let response: int
        
        if (tabIndexToShow === kOptionTabMutation) {
            udomain.domain.breedingAndTimeSeriesOptions.variationType = udomain.kBreederVariationCustom
            this.BreederMenuVariationCustom.checked = true
            this.redoCaption()
        }
        optionsForm = ubrdopt.TBreedingOptionsForm().create(this)
        if (optionsForm === null) {
            throw new GeneralException.create("Problem: Could not create breeding options window.")
        }
        try {
            optionsForm.breedingOptions.pageIndex = tabIndexToShow
            optionsForm.initializeWithBreedingAndTimeSeriesOptionsAndDomainOptions(udomain.domain.breedingAndTimeSeriesOptions, udomain.domain.options)
            response = optionsForm.ShowModal()
            if (response === mrOK) {
                newCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(optionsForm.options, optionsForm.domainOptions)
                umain.MainForm.doCommand(newCommand)
            }
        } finally {
            optionsForm.free
            optionsForm = null
        }
    }
    
    variationLowClick(Sender: TObject): void {
        this.BreederMenuVariationLowClick(this)
    }
    
    variationNoneNumericClick(Sender: TObject): void {
        this.BreederMenuVariationNoneClick(this)
    }
    
    variationMediumClick(Sender: TObject): void {
        this.BreederMenuVariationMediumClick(this)
    }
    
    variationHighClick(Sender: TObject): void {
        this.BreederMenuVariationHighClick(this)
    }
    
    variationCustomClick(Sender: TObject): void {
        this.BreederMenuVariationCustomClick(this)
    }
    
    varyColorsClick(Sender: TObject): void {
        this.BreederMenuVaryColorsClick(this)
    }
    
    vary3DObjectsClick(Sender: TObject): void {
        this.BreederMenuVary3DObjectsClick(this)
    }
    
    BreederPopupMenuRandomizeClick(Sender: TObject): void {
        this.BreederMenuRandomizeClick(this)
    }
    
    BreederPopupMenuBreedClick(Sender: TObject): void {
        this.BreederMenuBreedClick(this)
    }
    
    breedButtonClick(Sender: TObject): void {
        this.BreederMenuBreedClick(this)
    }
    
    BreederPopupMenuMakeTimeSeriesClick(Sender: TObject): void {
        this.BreederMenuMakeTimeSeriesClick(this)
    }
    
    BreederPopupMenuCopyClick(Sender: TObject): void {
        this.BreederMenuCopyClick(this)
    }
    
    BreederPopupMenuPasteClick(Sender: TObject): void {
        this.BreederMenuPasteClick(this)
    }
    
    BreederPopupMenuSendCopytoMainWindowClick(Sender: TObject): void {
        this.BreederMenuSendCopyToMainWindowClick(this)
    }
    
    BreederPopupMenuDeleteRowClick(Sender: TObject): void {
        this.BreederMenuDeleteRowClick(this)
    }
    
    // --------------------------------------------------------------------------- utilities 
    inGrid(row: short, column: short): boolean {
        let result = false
        result = true
        if ((row < 0) || (row > this.generations.Count - 1)) {
            result = false
        }
        if ((column < 1) || (column - 1 > this.plantsDrawGrid.ColCount - 1)) {
            result = false
        }
        return result
    }
    
    generationForIndex(index: short): PdGeneration {
        let result = new PdGeneration()
        result = null
        if (index < 0) {
            return result
        }
        if (index > this.generations.Count - 1) {
            return result
        }
        if (this.generations.Items[index] === null) {
            return result
        }
        result = ugener.PdGeneration(this.generations.Items[index])
        return result
    }
    
    plantForRowAndColumn(row: short, column: short): PdPlant {
        let result = new PdPlant()
        let generation: PdGeneration
        
        result = null
        generation = this.generationForIndex(row)
        if (generation === null) {
            return result
        }
        result = generation.plantForIndex(column - 1)
        return result
    }
    
    // ---------------------------------------------------------------------------- resizing 
    FormResize(Sender: TObject): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.generations === null) {
            return
        }
        this.breederToolbarPanel.SetBounds(0, 0, this.ClientWidth, this.breederToolbarPanel.Height)
        this.helpButton.SetBounds(this.breederToolbarPanel.Width - this.helpButton.Width - 4, this.helpButton.Top, this.helpButton.Width, this.helpButton.Height)
        this.plantsDrawGrid.SetBounds(0, this.breederToolbarPanel.Height, this.ClientWidth, this.ClientHeight - this.breederToolbarPanel.Height)
        this.emptyWarningPanel.SetBounds(this.ClientWidth / 2 - this.emptyWarningPanel.Width / 2, this.ClientHeight / 2 - this.emptyWarningPanel.Height / 2, this.emptyWarningPanel.Width, this.emptyWarningPanel.Height)
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 250
        UNRESOLVED.ptMinTrackSize.y = 150
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Breeding_plants_using_the_breeder")
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
            if ((UNRESOLVED.realizePalette(DC) !== 0) && (!delphi_compatability.Application.terminated) && (this.plantsDrawGrid !== null)) {
                // if palette changed, repaint drawing 
                this.plantsDrawGrid.Invalidate()
            }
            UNRESOLVED.selectPalette(DC, oldPalette, true)
            UNRESOLVED.realizePalette(DC)
            UNRESOLVED.releaseDC(windowHandle, DC)
        }
        result = PdForm.prototype.PaletteChanged.call(this, Foreground)
        return result
    }
    
    BreederMenuHelpOnBreedingClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Breeding_plants_using_the_breeder")
    }
    
    BreederMenuHelpTopicsClick(Sender: TObject): void {
        delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_FINDER, 0)
    }
    
    BreederMenuOptionsFastDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsFastDrawClick(umain.MainForm)
    }
    
    BreederMenuOptionsMediumDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsMediumDrawClick(umain.MainForm)
    }
    
    BreederMenuOptionsBestDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsBestDrawClick(umain.MainForm)
    }
    
    BreederMenuOptionsCustomDrawClick(Sender: TObject): void {
        umain.MainForm.MenuOptionsCustomDrawClick(umain.MainForm)
    }
    
}

