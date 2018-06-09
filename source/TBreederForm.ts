// TBreederForm was unit Ubreedr

import { TRect } from "./TRect"
import { TPoint } from "./TPoint"
import { MainForm, TFPBrushStyle, ucursor } from "./temporary"
import { BreederVariation, domain, DrawMode } from "./PdDomain"
import { intround, short, long, ColorDefs, int, IntToStr, MessageDialog, arrayRemove } from "./common"
import { PdPlant, BreedingAndTimeSeriesOptionsStructure } from "./PdPlant"
import { PdGeneration } from "./PdGeneration"
import { PdCommand } from "./PdCommand"
import { TDrawGrid } from "./TDrawGrid"

let BreederForm: TBreederForm

const kRedrawPlants = true
const kDontRedrawPlants = false

const kConsiderIfPreviewCacheIsUpToDate = true
const kDontConsiderIfPreviewCacheIsUpToDate = false

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
    /*
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
    */
    selectedRow: short = 0
    generations: PdGeneration[] = []
    dragPlantStartPoint: TPoint = new TPoint()
    lightUpCell: TPoint = new TPoint()
    numBreederPlantsCopiedThisSession: long = 0
    internalChange: boolean = false
    drawing: boolean = false
    needToRedrawFromChangeToDrawOptions: boolean = false
    /* TODO: User or remove PdForm superclass
    TBreederForm.prototype = new PdForm()
    TBreederForm.prototype.constructor = TBreederForm
    */
    
    //$R *.DFM
    // ---------------------------------------------------------------------------- creation/destruction 
    FormCreate(event: any): void {
        this.generations = ucollect.TListCollection().Create()
        this.plantsDrawGrid.DragCursor = ucursor.crDragPlant
        this.Position = delphi_compatability.TPosition.poDesigned
        // keep window on screen - left corner of title bar 
        const tempBoundsRect: TRect = domain.breederWindowRect
        if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
            if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
                tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
            }
            if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
                tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
            }
            this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
        }
        switch (domain.options.drawSpeed) {
            case DrawMode.kDrawFast:
                this.BreederMenuOptionsFastDraw.checked = true
                break
            case DrawMode.kDrawMedium:
                this.BreederMenuOptionsMediumDraw.checked = true
                break
            case DrawMode.kDrawBest:
                this.BreederMenuOptionsBestDraw.checked = true
                break
            case DrawMode.kDrawCustom:
                this.BreederMenuOptionsCustomDraw.checked = true
                break
        }
        this.updateForChangeToDomainOptions()
        this.updateMenusForChangeToGenerations()
        //to get redo messages
        MainForm.updateMenusForUndoRedo()
        this.lightUpCell = new TPoint(-1, -1)
        this.emptyWarningPanel.SendToBack()
    }
    
    FormActivate(event: any): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.generations.length <= 0) {
            this.emptyWarningPanel.BringToFront()
        } else if (this.needToRedrawFromChangeToDrawOptions) {
            this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
            this.needToRedrawFromChangeToDrawOptions = false
        }
    }
    
    // -------------------------------------------------------------------------------------- grid 
    updateForChangeToDomainOptions(): void {
        if (this.plantsDrawGrid.ColCount !== domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1) {
            this.plantsDrawGrid.ColCount = domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1
        }

        if (((this.plantsDrawGrid.DefaultColWidth !== domain.breedingAndTimeSeriesOptions.thumbnailWidth) || (this.plantsDrawGrid.DefaultRowHeight !== domain.breedingAndTimeSeriesOptions.thumbnailHeight))) {
            this.plantsDrawGrid.DefaultColWidth = domain.breedingAndTimeSeriesOptions.thumbnailWidth
            this.plantsDrawGrid.ColWidths[0] = kFirstColumnWidth
            this.plantsDrawGrid.DefaultRowHeight = domain.breedingAndTimeSeriesOptions.thumbnailHeight
            this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
        }

        switch (domain.breedingAndTimeSeriesOptions.variationType) {
            case BreederVariation.kBreederVariationLow:
                this.BreederMenuVariationLow.checked = true
                this.variationLow.Down = true
                break
            case BreederVariation.kBreederVariationMedium:
                this.BreederMenuVariationMedium.checked = true
                this.variationMedium.Down = true
                break
            case BreederVariation.kBreederVariationHigh:
                this.BreederMenuVariationHigh.checked = true
                this.variationHigh.Down = true
                break
            case BreederVariation.kBreederVariationCustom:
                this.BreederMenuVariationCustom.checked = true
                this.variationCustom.Down = true
                break
            case BreederVariation.kBreederVariationNoNumeric:
                this.BreederMenuVariationNone.checked = true
                this.variationNoneNumeric.Down = true
                break
        }

        this.BreederMenuVaryColors.checked = domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        this.varyColors.Down = domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        this.BreederMenuVary3DObjects.checked = domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        this.vary3DObjects.Down = domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        this.redoCaption()

        let atLeastOnePlantHasChangedAge = false
        if (this.generations.length > 0) {
            for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
                const generation: PdGeneration = this.generations[genCount]
                if (generation.plants.length > 0) {
                    for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
                        const plant: PdPlant = generation.plants[plCount]
                        const newAge = intround(domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0 * plant.pGeneral.ageAtMaturity)
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
        if (!considerIfPreviewCacheIsUpToDate) {
            for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
                const generation: PdGeneration = this.generations[genCount]
                if (generation.plants.length > 0) {
                    for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
                        const plant: PdPlant = generation.plants[plCount]
                        plant.previewCacheUpToDate = false
                    }
                }
            }
        }
        this.plantsDrawGrid.Invalidate()
        this.plantsDrawGrid.Update()
    }
    
    plantsDrawGridDrawCell(event: any, Col: long, Row: long, rect: TRect, State: TGridDrawState): void {        
        try {
            this.plantsDrawGrid.Canvas.Font = this.plantsDrawGrid.Font
            this.plantsDrawGrid.Canvas.Font.Color = ColorDefs.clBlack
            if (Col === 0) {
                //if (row = selectedRow) and (generations.count > 0) then
                //plantsDrawGrid.canvas.brush.color := clBlue
                //else
                this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clWhite
                this.plantsDrawGrid.Canvas.Pen.Color = this.plantsDrawGrid.Canvas.Brush.Color
                this.plantsDrawGrid.Canvas.Rectangle(rect.Left, rect.Top, rect.Right, rect.Bottom)
                if (Row > this.generations.length - 1) {
                    return
                }
                //if row = selectedRow then
                //plantsDrawGrid.canvas.font.color := clWhite;
                const textDrawRect: TRect = new TRect()
                textDrawRect.Left = rect.Left + rect.width / 2 - this.plantsDrawGrid.Canvas.TextWidth(IntToStr(Row + 1)) / 2
                textDrawRect.Top = rect.Top + rect.height / 2 - this.plantsDrawGrid.Canvas.TextHeight("0") / 2
                this.plantsDrawGrid.Canvas.TextOut(textDrawRect.Left, textDrawRect.Top, IntToStr(Row + 1))
                return
            } else {
                this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clWhite
                this.plantsDrawGrid.Canvas.Pen.Width = 1
                this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clWhite
                this.plantsDrawGrid.Canvas.Rectangle(rect.Left, rect.Top, rect.Right, rect.Bottom)
            }
            const generation = this.generationForIndex(Row)
            if (generation === null) {
                return
            }
            const plant = generation.plantForIndex(Col - 1)
            if (plant === null) {
                return
            }
            if (!plant.previewCacheUpToDate) {
                // draw plant 
                // draw gray solid box to show delay for drawing plant cache
                this.plantsDrawGrid.Canvas.Brush.Style = TFPBrushStyle.bsSolid
                this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clSilver
                this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
                this.plantsDrawGrid.Canvas.Rectangle(rect.Left + 1, rect.Top + 1, rect.Right, rect.Bottom)
                // draw plant preview cache
                plant.fixedPreviewScale = false
                plant.fixedDrawPosition = false
                plant.drawPreviewIntoCache(new TPoint(this.plantsDrawGrid.DefaultColWidth, this.plantsDrawGrid.DefaultRowHeight), uplant.kDontConsiderDomainScale, umain.kDrawNow)
            }
            plant.previewCache.Transparent = false
            ubmpsupport.copyBitmapToCanvasWithGlobalPalette(plant.previewCache, this.plantsDrawGrid.Canvas, rect)
            // draw selection rectangle 
            this.plantsDrawGrid.Canvas.Brush.Style = TFPBrushStyle.bsClear
            this.plantsDrawGrid.Canvas.Pen.Width = 2
            if ((Col === this.lightUpCell.X) && (Row === this.lightUpCell.Y)) {
                this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clAqua
            } else if (Row === this.selectedRow) {
                if (plant === generation.firstSelectedPlant()) {
                    this.plantsDrawGrid.Canvas.Pen.Color = domain.options.firstSelectionRectangleColor
                } else if (plant === generation.secondSelectedPlant()) {
                    this.plantsDrawGrid.Canvas.Pen.Color = domain.options.multiSelectionRectangleColor
                } else {
                    this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
                }
            } else {
                this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
            }
            this.plantsDrawGrid.Canvas.Rectangle(rect.Left + 1, rect.Top + 1, rect.Right, rect.Bottom)
            if (plant === generation.firstParent) {
                // draw parent indicator 
                this.plantsDrawGrid.Canvas.TextOut(rect.Left + 4, rect.Top + 2, "p1")
            } else if (plant === generation.secondParent) {
                this.plantsDrawGrid.Canvas.TextOut(rect.Left + 4, rect.Top + 2, "p2")
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
    
    plantsDrawGridMouseUp(event: any, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: long
        let row: long
        let generation: PdGeneration
        let plant: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        // had selection here, moved to mouse down because double-click makes extra mouse up, seems okay so far
    }
    
    plantsDrawGridDblClick(event: any): void {
        this.BreederMenuBreedClick(this)
    }
    
    // ------------------------------------------------------------------------ dragging 
    plantsDrawGridMouseDown(event: any, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int

        [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
        if ((row >= 0) && (row <= this.generations.length - 1)) {
            const generation: PdGeneration = this.generations[row]
            if (generation !== null) {
                this.selectGeneration(generation)
                if ((col >= 1) && (col - 1 <= generation.plants.length - 1)) {
                    const plant = generation.plants[col - 1]
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
        const plant = this.plantAtMouse(X, Y)
        if (plant === null) {
            return
        }
        this.dragPlantStartPoint = new TPoint(X, Y)
        this.plantsDrawGrid.BeginDrag(false)
    }
    
    plantsDrawGridDragOver(Sender: any, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        let col: long
        let row: long

        Accept = (Source !== null) && (Sender !== null) && ((Sender === Source) || (Source === MainForm.drawingPaintBox) || (Source === MainForm.plantListDrawGrid) || (Source === utimeser.TimeSeriesForm.grid))
        if ((Accept)) {
            const plant = this.plantAtMouse(X, Y)
            if (plant === null) {
                Accept = false
                return Accept
            }
            [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
            if ((col !== this.lightUpCell.X) || (row !== this.lightUpCell.Y)) {
                this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
                this.lightUpCell = new TPoint(col, row)
                this.invalidateGridCell(col, row)
            }
        }
        return Accept
    }
    
    plantsDrawGridEndDrag(event: any, Target: TObject, X: int, Y: int): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        // remove lightup on cell before resetting cell
        this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
        this.lightUpCell = new TPoint(-1, -1)
        if (Target === null) {
            return
        }
        // get plant being dragged 
        const plant = this.plantAtMouse(this.dragPlantStartPoint.X, this.dragPlantStartPoint.Y)
        if (plant === null) {
            return
        }
        if ((Target === MainForm.drawingPaintBox) || (Target === MainForm.plantListDrawGrid)) {
            // make paste command - wants list of plants 
            const newPlant = new PdPlant()
            plant.copyTo(newPlant)
            this.numBreederPlantsCopiedThisSession += 1
            newPlant.setName("Breeder plant " + IntToStr(this.numBreederPlantsCopiedThisSession))
            if ((Target === MainForm.drawingPaintBox)) {
                newPlant.moveTo(new TPoint(X, Y))
            } else {
                newPlant.moveTo(MainForm.standardPastePosition())
            }
            if (!domain.viewPlantsInMainWindowOnePlantAtATime()) {
                // v2.1
                newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
            }
            //to save memory - don't need it in main window
            newPlant.shrinkPreviewCache()
            const newPlants: PdPlant[] = []
            newPlants.push(newPlant)
            const newCommand: PdCommand = updcom.PdPasteCommand().createWithListOfPlantsAndOldSelectedList(newPlants, MainForm.selectedPlants)
            updcom.PdPasteCommand(newCommand).useSpecialPastePosition = true
            try {
                ucursor.cursor_startWait()
                MainForm.doCommand(newCommand)
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
            let col: long
            let row: long    
            [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
            if (!this.inGrid(row, col)) {
                return
            }
            const plantToReplace = this.plantForRowAndColumn(row, col)
            if (plantToReplace === null) {
                return
            }
            if (plantToReplace === plant) {
                return
            }
            // make replace command 
            const newCommand: PdCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(plant, row, col)
            try {
                ucursor.cursor_startWait()
                MainForm.doCommand(newCommand)
            } finally {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    copyPlantToPoint(aPlant: PdPlant, x: int, y: int): void {
        let col: long
        let row: long

        [col, row] = this.plantsDrawGrid.MouseToCell(x, y)
        const plant = this.plantForRowAndColumn(row, col)
        if (plant === null) {
            return
        }
        const newCommand: PdCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(aPlant, row, col)
        MainForm.doCommand(newCommand)
    }
    
    // ------------------------------------------------------------- responding to commands 
    replacePlantInRow(oldPlant: PdPlant, newPlant: PdPlant, row: short): void { 
        const generation = this.generationForIndex(row)
        if (generation === null) {
            throw new Error("Problem: Invalid row in method TBreederForm.replacePlantInRow.")
        }
        generation.replacePlant(oldPlant, newPlant)
        this.updateForChangeToPlant(newPlant)
    }
    
    forgetGenerationsListBelowRow(aRow: short): void {
        while (this.generations.length - 1 > aRow) {
            this.forgetLastGeneration()
        }
    }
    
    addGenerationsFromListBelowRow(aRow: short, aGenerationsList: PdGeneration[]): void {
        if (aRow + 1 <= aGenerationsList.length - 1) {
            for (let i = aRow + 1; i < aGenerationsList.length; i++) {
                this.addGeneration(aGenerationsList[i])
            }
        }
    }
    
    addGeneration(newGeneration: PdGeneration): void {
        this.generations.push(newGeneration)
    }
    
    forgetLastGeneration(): void { 
        if (this.generations.length <= 0) {
            return
        }
        const lastGeneration: PdGeneration = this.generations[this.generations.length - 1]
        arrayRemove(this.generations, lastGeneration)
    }
    
    selectGeneration(aGeneration: PdGeneration): void {
        this.selectedRow = this.generations.indexOf(aGeneration)
        const lastFullyVisibleRow: short = this.plantsDrawGrid.TopRow + this.plantsDrawGrid.VisibleRowCount - 1
        if (this.selectedRow > lastFullyVisibleRow) {
            this.plantsDrawGrid.TopRow = this.plantsDrawGrid.TopRow + (this.selectedRow - lastFullyVisibleRow)
        }
        if (this.selectedRow < this.plantsDrawGrid.TopRow) {
            this.plantsDrawGrid.TopRow = this.selectedRow
        }
    }
    
    deselectAllGenerations(): void {
        this.selectedRow = -1
        for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
            const generation: PdGeneration = this.generations[genCount]
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
        if (this.plantsDrawGrid.RowCount < this.generations.length) {
            this.plantsDrawGrid.RowCount = this.generations.length
        }
        this.plantsDrawGrid.Invalidate()
        this.plantsDrawGrid.Update()
        this.redoCaption()
        if (this.generations.length <= 0) {
            this.emptyWarningPanel.BringToFront()
        } else {
            this.emptyWarningPanel.SendToBack()
        }
    }
    
    updateForChangeToPlant(aPlant: PdPlant): void {
        for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
            const generation: PdGeneration = this.generations[genCount]
            if (generation.plants.length > 0) {
                for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
                    const plant: PdPlant = generation.plants[plCount]
                    if (plant === aPlant) {
                        const cellRectOver: TRect = this.plantsDrawGrid.CellRect(plCount + 1, genCount)
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
        if (this.generations.length === 1) {
            // new v1.4
            this.Caption = "Breeder (1 generation)"
        } else {
            this.Caption = "Breeder (" + IntToStr(this.generations.length) + " generations)"
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
        
        havePlants = this.generations.length > 0
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
        this.BreederMenuPaste.enabled = (this.primarySelectedPlant() !== null) && (domain.plantManager.privatePlantClipboard.length > 0)
        this.BreederPopupMenuPaste.enabled = this.BreederMenuPaste.enabled
    }
    
    selectedGeneration(): PdGeneration | null {
        if ((this.selectedRow < 0) || (this.selectedRow > this.generations.length - 1)) {
            return null
        }
        return this.generations[this.selectedRow]
    }
    
    primarySelectedPlant(): PdPlant | null {
        const generation = this.selectedGeneration()
        if (generation === null) {
            return null
        }
        return generation.firstSelectedPlant()
    }
    
    plantAtMouse(x: short, y: short): PdPlant | null {
        let col: long
        let row: long
        
        [col, row] = this.plantsDrawGrid.MouseToCell(x, y)
        if (!this.inGrid(row, col)) {
            return null
        }
        return this.plantForRowAndColumn(row, col)
    }
    
    // ----------------------------------------------------------------------------- menu 
    BreederMenuUndoClick(event: any): void {
        MainForm.MenuEditUndoClick(event)
    }
    
    BreederMenuRedoClick(event: any): void {
        MainForm.MenuEditRedoClick(event)
    }
    
    BreederMenuCopyClick(event: any): void {
        const plant = this.primarySelectedPlant()
        if (plant === null) {
            return
        }
        const copyList: PdPlant[] = []
        copyList.push(plant)
        // temporarily change plant name to make copy, then put back 
        const saveName = plant.getName()
        this.numBreederPlantsCopiedThisSession += 1
        plant.setName("Breeder plant " + IntToStr(this.numBreederPlantsCopiedThisSession))
        domain.plantManager.copyPlantsInListToPrivatePlantClipboard(copyList)
        plant.setName(saveName)
        //sets our paste menu also
        MainForm.updatePasteMenuForClipboardContents()
    }
    
    BreederMenuSendCopyToMainWindowClick(event: any): void {
        this.BreederMenuCopyClick(this)
        MainForm.MenuEditPasteClick(MainForm)
    }
    
    BreederMenuUndoRedoListClick(event: any): void {
        MainForm.UndoMenuEditUndoRedoListClick(MainForm)
    }
    
    BreederMenuPasteClick(event: any): void {
        let newPlant: PdPlant
        let newCommand: PdCommand
        let column: short
        
        if (domain.plantManager.privatePlantClipboard.length <= 0) {
            return
        }
        const generation = this.selectedGeneration()
        if (generation === null) {
            return
        }
        const plant = generation.firstSelectedPlant()
        if (plant === null) {
            return
        }
        column = generation.plants.indexOf(plant) + 1
        newPlant = new PdPlant()
        domain.plantManager.pasteFirstPlantFromPrivatePlantClipboardToPlant(newPlant)
        newCommand = updcom.PdReplaceBreederPlant().createWithPlantRowAndColumn(newPlant, this.selectedRow, column)
        MainForm.doCommand(newCommand)
        //command will free plant if paste is undone
    }
    
    BreederMenuBreedClick(event: any): void {
        let generationToBreed: PdGeneration
        let newCommand: PdCommand
        
        if ((this.selectedRow < 0) || (this.selectedRow > this.generations.length - 1)) {
            return
        }
        if (this.selectedRow >= domain.breedingAndTimeSeriesOptions.maxGenerations - 1) {
            // check if there is room in the breeder - this command will make one new generation 
            this.fullWarning()
            return
        }
        generationToBreed = this.generations[this.selectedRow]
        if (generationToBreed.selectedPlants.length <= 0) {
            return
        }
        newCommand = updcom.PdBreedFromParentsCommand().createWithInfo(this.generations, generationToBreed.firstSelectedPlant(), generationToBreed.secondSelectedPlant(), this.selectedRow, domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, updcom.kDontCreateFirstGeneration)
        generationToBreed.firstParent = generationToBreed.firstSelectedPlant()
        generationToBreed.secondParent = generationToBreed.secondSelectedPlant()
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuMakeTimeSeriesClick(event: any): void {
        let newCommand: PdCommand
        
        if (this.primarySelectedPlant() === null) {
            return
        }
        newCommand = updcom.PdMakeTimeSeriesCommand().createWithNewPlant(this.primarySelectedPlant())
        MainForm.doCommand(newCommand)
    }
    
    fullWarning(): void {
        MessageDialog("The breeder is full.\n\nYou must delete some rows\nor increase the number of rows allowed in the breeder options)\n\nbefore you can breed more plants.", "mtWarning", {mbOK: true, }, 0)
    }
    
    BreederMenuDeleteRowClick(event: any): void { 
        if (this.selectedGeneration() === null) {
            return
        }
        const newCommand: PdCommand = updcom.PdDeleteBreederGenerationCommand().createWithGeneration(this.selectedGeneration())
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuDeleteAllClick(event: any): void { 
        if (this.generations.length <= 0) {
            return
        }
        const newCommand: PdCommand = updcom.PdDeleteAllBreederGenerationsCommand().create()
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuRandomizeClick(event: any): void {
        let newCommand: PdCommand
        let plant: PdPlant
        
        const aGeneration = this.selectedGeneration()
        if (aGeneration === null) {
            return
        }
        if (aGeneration.selectedPlants.length <= 0) {
            return
        }
        const randomizeList: PdPlant[] = []
        try {
            for (let i = 0; i < aGeneration.selectedPlants.length; i++) {
                plant = aGeneration.selectedPlants[i]
                randomizeList.push(plant)
            }
            newCommand = updcom.PdRandomizeCommand().createWithListOfPlants(randomizeList)
            newCommand.isInBreeder = true
            ucursor.cursor_startWait()
            MainForm.doCommand(newCommand)
        } finally {
            // command has another list, so we must free this one
            randomizeList.free
            ucursor.cursor_stopWait()
        }
    }
    
    BreederMenuRandomizeAllClick(event: any): void {
        if (this.generations.length <= 0) {
            return
        }
        try {
            ucursor.cursor_startWait()
            const randomizeList = PdPlant[]
            if (this.generations.length > 0) {
                for (let i = 0; i <= this.generations.length - 1; i++) {
                    const generation: PdGeneration = this.generations[i]
                    if (generation.plants.length > 0) {
                        for (let j = 0; j <= generation.plants.length - 1; j++) {
                            randomizeList.push(generation.plants[j])
                        }
                    }
                }
            }
            const newCommand: PdCommand = updcom.PdRandomizeCommand().createWithListOfPlants(randomizeList)
            newCommand.isInBreeder = true
            newCommand.isRandomizeAllInBreeder = true
            MainForm.doCommand(newCommand)
        } finally {
            ucursor.cursor_stopWait()
        }
    }
    
    BreederMenuVariationNoneClick(event: any): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationNoNumeric
        this.BreederMenuVariationNone.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationLowClick(event: any): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationLow
        this.BreederMenuVariationLow.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationMediumClick(event: any): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationMedium
        this.BreederMenuVariationMedium.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationHighClick(event: any): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationHigh
        // this is to deal with if it was turned off by not having a library
        // v2.0 removed - this is separate now
        // domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary := true;
        this.BreederMenuVariationHigh.checked = true
        this.redoCaption()
    }
    
    BreederMenuVariationCustomClick(event: any): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabMutation)
    }
    
    BreederMenuOtherOptionsClick(event: any): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabSize)
    }
    
    BreederMenuVaryColorsClick(event: any): void {
        this.BreederMenuVaryColors.checked = !this.BreederMenuVaryColors.checked
        const options: BreedingAndTimeSeriesOptionsStructure = domain.breedingAndTimeSeriesOptions
        options.mutateAndBlendColorValues = this.BreederMenuVaryColors.checked
        const newCommand: PdCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(options, domain.options)
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuVary3DObjectsClick(event: any): void {
        this.BreederMenuVary3DObjects.checked = !this.BreederMenuVary3DObjects.checked
        const options: BreedingAndTimeSeriesOptionsStructure = domain.breedingAndTimeSeriesOptions
        options.chooseTdosRandomlyFromCurrentLibrary = this.BreederMenuVary3DObjects.checked
        const newCommand: PdCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(options, domain.options)
        MainForm.doCommand(newCommand)
    }
    
    changeBreederAndTimeSeriesOptions(tabIndexToShow: short): void {
        if (tabIndexToShow === kOptionTabMutation) {
            domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationCustom
            this.BreederMenuVariationCustom.checked = true
            this.redoCaption()
        }
        const optionsForm: TBreedingOptionsForm = ubrdopt.TBreedingOptionsForm().create(this)
        if (optionsForm === null) {
            throw new Error("Problem: Could not create breeding options window.")
        }
        optionsForm.breedingOptions.pageIndex = tabIndexToShow
        optionsForm.initializeWithBreedingAndTimeSeriesOptionsAndDomainOptions(domain.breedingAndTimeSeriesOptions, domain.options)
        const response: int = optionsForm.ShowModal()
        if (response === mrOK) {
            const newCommand: PdCommand = updcom.PdChangeBreedingAndTimeSeriesOptionsCommand().createWithOptionsAndDomainOptions(optionsForm.options, optionsForm.domainOptions)
            MainForm.doCommand(newCommand)
        }
    }
    
    variationLowClick(event: any): void {
        this.BreederMenuVariationLowClick(this)
    }
    
    variationNoneNumericClick(event: any): void {
        this.BreederMenuVariationNoneClick(this)
    }
    
    variationMediumClick(event: any): void {
        this.BreederMenuVariationMediumClick(this)
    }
    
    variationHighClick(event: any): void {
        this.BreederMenuVariationHighClick(this)
    }
    
    variationCustomClick(event: any): void {
        this.BreederMenuVariationCustomClick(this)
    }
    
    varyColorsClick(event: any): void {
        this.BreederMenuVaryColorsClick(this)
    }
    
    vary3DObjectsClick(event: any): void {
        this.BreederMenuVary3DObjectsClick(this)
    }
    
    BreederPopupMenuRandomizeClick(event: any): void {
        this.BreederMenuRandomizeClick(this)
    }
    
    BreederPopupMenuBreedClick(event: any): void {
        this.BreederMenuBreedClick(this)
    }
    
    breedButtonClick(event: any): void {
        this.BreederMenuBreedClick(this)
    }
    
    BreederPopupMenuMakeTimeSeriesClick(event: any): void {
        this.BreederMenuMakeTimeSeriesClick(this)
    }
    
    BreederPopupMenuCopyClick(event: any): void {
        this.BreederMenuCopyClick(this)
    }
    
    BreederPopupMenuPasteClick(event: any): void {
        this.BreederMenuPasteClick(this)
    }
    
    BreederPopupMenuSendCopytoMainWindowClick(event: any): void {
        this.BreederMenuSendCopyToMainWindowClick(this)
    }
    
    BreederPopupMenuDeleteRowClick(event: any): void {
        this.BreederMenuDeleteRowClick(this)
    }
    
    // --------------------------------------------------------------------------- utilities 
    inGrid(row: short, column: short): boolean {
        let result = true
        if ((row < 0) || (row > this.generations.length - 1)) {
            result = false
        }
        if ((column < 1) || (column - 1 > this.plantsDrawGrid.ColCount - 1)) {
            result = false
        }
        return result
    }
    
    generationForIndex(index: short): PdGeneration | null {
        if (index < 0) {
            return null
        }
        if (index > this.generations.length - 1) {
            return null
        }
        if (this.generations[index] === null) {
            return null
        }
        return this.generations[index]
    }
    
    plantForRowAndColumn(row: short, column: short): PdPlant | null {
        const generation = this.generationForIndex(row)
        if (generation === null) {
            return null
        }
        return generation.plantForIndex(column - 1)
    }
    
    // ---------------------------------------------------------------------------- resizing 
    FormResize(event: any): void {
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
    
    helpButtonClick(event: any): void {
        delphi_compatability.Application.HelpJump("Breeding_plants_using_the_breeder")
    }
    
    BreederMenuHelpOnBreedingClick(event: any): void {
        delphi_compatability.Application.HelpJump("Breeding_plants_using_the_breeder")
    }
    
    BreederMenuHelpTopicsClick(event: any): void {
        delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_FINDER, 0)
    }
    
    BreederMenuOptionsFastDrawClick(event: any): void {
        MainForm.MenuOptionsFastDrawClick(MainForm)
    }
    
    BreederMenuOptionsMediumDrawClick(event: any): void {
        MainForm.MenuOptionsMediumDrawClick(MainForm)
    }
    
    BreederMenuOptionsBestDrawClick(event: any): void {
        MainForm.MenuOptionsBestDrawClick(MainForm)
    }
    
    BreederMenuOptionsCustomDrawClick(event: any): void {
        MainForm.MenuOptionsCustomDrawClick(MainForm)
    }
    
}
