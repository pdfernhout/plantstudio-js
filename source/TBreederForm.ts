// TBreederForm was unit Ubreedr

import * as m from "mithril"
import { TRect } from "./TRect"
import { TPoint } from "./TPoint"
import { TFPBrushStyle, unfinished } from "./temporary"
import { BreederVariation, domain, DrawMode } from "./PdDomain"
import { intround, short, long, ColorDefs, int, IntToStr, MessageDialog, arrayRemove, HelpJump, imageDir, caption } from "./common"
import { PdPlant, BreedingAndTimeSeriesOptionsStructure, kDrawNow, kDontConsiderDomainScale } from "./PdPlant"
import { PdGeneration } from "./PdGeneration"
import { PdCommand } from "./PdCommand"
import { PdBreedFromParentsCommand, PdMakeTimeSeriesCommand, PdDeleteBreederGenerationCommand, PdDeleteAllBreederGenerationsCommand, PdRandomizeCommand, PdChangeBreedingAndTimeSeriesOptionsCommand, PdPasteCommand, PdReplaceBreederPlant, kDontCreateFirstGeneration } from "./updcom"
import { cursor_startWait, cursor_stopWait } from "./ucursor"
import { activeForm, BreederForm, MainForm, setActiveForm, setBreederForm, TimeSeriesForm } from "./FormHolder"
import { resetDroppedDownMenuId, viewMainMenu } from "./menu"
import { ModalInputView } from "./ModalInputView"

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
//     plantsDrawGrid: TDrawGrid = new TDrawGrid()
    // TODO PDF: Fix -- temp for testing plantsDrawGrid
    plantsDrawGrid: any = {}
//     /*
//     BreederMenu: TMainMenu = new TMainMenu()
//     BreederMenuEdit: TMenuItem = new TMenuItem()
//     BreederMenuCopy: TMenuItem = new TMenuItem()
//     BreederMenuPaste: TMenuItem = new TMenuItem()
//     N2: TMenuItem = new TMenuItem()
//     BreederMenuPlant: TMenuItem = new TMenuItem()
//     BreederMenuBreed: TMenuItem = new TMenuItem()
//     BreederMenuUndo: TMenuItem = new TMenuItem()
//     BreederMenuRedo: TMenuItem = new TMenuItem()
//     N1: TMenuItem = new TMenuItem()
//     BreederMenuDeleteRow: TMenuItem = new TMenuItem()
//     BreederMenuDeleteAll: TMenuItem = new TMenuItem()
//     BreederPopupMenu: TPopupMenu = new TPopupMenu()
//     BreederPopupMenuBreed: TMenuItem = new TMenuItem()
//     BreederPopupMenuCopy: TMenuItem = new TMenuItem()
//     BreederPopupMenuPaste: TMenuItem = new TMenuItem()
//     BreederPopupMenuDeleteRow: TMenuItem = new TMenuItem()
//     N4: TMenuItem = new TMenuItem()
//     BreederMenuRandomize: TMenuItem = new TMenuItem()
//     BreederMenuRandomizeAll: TMenuItem = new TMenuItem()
//     BreederMenuMakeTimeSeries: TMenuItem = new TMenuItem()
//     BreederPopupMenuRandomize: TMenuItem = new TMenuItem()
//     N5: TMenuItem = new TMenuItem()
//     emptyWarningPanel: TPanel = new TPanel()
//     Label1: TLabel = new TLabel()
//     BreederPopupMenuMakeTimeSeries: TMenuItem = new TMenuItem()
//     BreederMenuVariation: TMenuItem = new TMenuItem()
//     BreederMenuVariationLow: TMenuItem = new TMenuItem()
//     BreederMenuVariationMedium: TMenuItem = new TMenuItem()
//     BreederMenuVariationHigh: TMenuItem = new TMenuItem()
//     BreederMenuVariationCustom: TMenuItem = new TMenuItem()
//     BreederMenuOptions: TMenuItem = new TMenuItem()
//     BreederMenuOtherOptions: TMenuItem = new TMenuItem()
//     MenuBreederHelp: TMenuItem = new TMenuItem()
//     BreederMenuHelpOnBreeding: TMenuItem = new TMenuItem()
//     BreederMenuHelpTopics: TMenuItem = new TMenuItem()
//     N3: TMenuItem = new TMenuItem()
//     BreederMenuOptionsDrawAs: TMenuItem = new TMenuItem()
//     BreederMenuOptionsFastDraw: TMenuItem = new TMenuItem()
//     BreederMenuOptionsMediumDraw: TMenuItem = new TMenuItem()
//     BreederMenuOptionsBestDraw: TMenuItem = new TMenuItem()
//     BreederMenuOptionsCustomDraw: TMenuItem = new TMenuItem()
//     N6: TMenuItem = new TMenuItem()
//     BreederMenuVaryColors: TMenuItem = new TMenuItem()
//     BreederMenuVary3DObjects: TMenuItem = new TMenuItem()
//     breederToolbarPanel: TPanel = new TPanel()
//     variationLow: TSpeedButton = new TSpeedButton()
//     variationMedium: TSpeedButton = new TSpeedButton()
//     variationCustom: TSpeedButton = new TSpeedButton()
//     varyColors: TSpeedButton = new TSpeedButton()
//     vary3DObjects: TSpeedButton = new TSpeedButton()
//     helpButton: TSpeedButton = new TSpeedButton()
//     variationHigh: TSpeedButton = new TSpeedButton()
//     BreederMenuVariationNone: TMenuItem = new TMenuItem()
//     variationNoneNumeric: TSpeedButton = new TSpeedButton()
//     BreederMenuSendCopyToMainWindow: TMenuItem = new TMenuItem()
//     N7: TMenuItem = new TMenuItem()
//     BreederPopupMenuSendCopytoMainWindow: TMenuItem = new TMenuItem()
//     N8: TMenuItem = new TMenuItem()
//     breedButton: TSpeedButton = new TSpeedButton()
//     BreederMenuUndoRedoList: TMenuItem = new TMenuItem()
//     */
        selectedRow: short = 0
        generations: PdGeneration[] = []
        DefaultColWidth = 200
        DefaultRowHeight = 200
//     dragPlantStartPoint: TPoint = new TPoint()
//     lightUpCell: TPoint = new TPoint()
    numBreederPlantsCopiedThisSession: long = 0
//     internalChange: boolean = false
//     drawing: boolean = false
//     needToRedrawFromChangeToDrawOptions: boolean = false
//     /* TODO: User or remove PdForm superclass
//     TBreederForm.prototype = new PdForm()
//     TBreederForm.prototype.constructor = TBreederForm
//     */

        Caption: string = "Breeder"

        firstSelectedPlant: PdPlant | null = null
        secondSelectedPlant: PdPlant | null = null

        selectPlant(plant: PdPlant, isMulti: boolean) {
            if (!isMulti) {
                this.firstSelectedPlant = plant
                this.secondSelectedPlant = null
            } else if (!this.firstSelectedPlant) {
                this.firstSelectedPlant = plant
                this.secondSelectedPlant = null
            } else if (!this.secondSelectedPlant) {
                this.secondSelectedPlant = plant
            } else {
                this.firstSelectedPlant = this.secondSelectedPlant
                this.secondSelectedPlant = plant
            }
        }
    
//     //$R *.DFM
//     // ---------------------------------------------------------------------------- creation/destruction 
//     FormCreate(): void {
//         this.generations = ucollect.TListCollection().Create()
//         this.plantsDrawGrid.DragCursor = ucursor.crDragPlant
//         this.Position = delphi_compatability.TPosition.poDesigned
//         // keep window on screen - left corner of title bar 
//         const tempBoundsRect: TRect = domain.breederWindowRect
//         if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
//             if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
//                 tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
//             }
//             if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
//                 tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
//             }
//             this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
//         }
//         switch (domain.options.drawSpeed) {
//             case DrawMode.kDrawFast:
//                 this.BreederMenuOptionsFastDraw.checked = true
//                 break
//             case DrawMode.kDrawMedium:
//                 this.BreederMenuOptionsMediumDraw.checked = true
//                 break
//             case DrawMode.kDrawBest:
//                 this.BreederMenuOptionsBestDraw.checked = true
//                 break
//             case DrawMode.kDrawCustom:
//                 this.BreederMenuOptionsCustomDraw.checked = true
//                 break
//         }
//         this.updateForChangeToDomainOptions()
//         this.updateMenusForChangeToGenerations()
//         //to get redo messages
//         MainForm.updateMenusForUndoRedo()
//         this.lightUpCell = new TPoint(-1, -1)
//         this.emptyWarningPanel.SendToBack()
//     }
    
//     FormActivate(): void {
//         if (this.generations.length <= 0) {
//             this.emptyWarningPanel.BringToFront()
//         } else if (this.needToRedrawFromChangeToDrawOptions) {
//             this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
//             this.needToRedrawFromChangeToDrawOptions = false
//         }
//     }
    
//     // -------------------------------------------------------------------------------------- grid 
    updateForChangeToDomainOptions(): void {
        // TODO PDF: Fix this
//         if (this.plantsDrawGrid.ColCount !== domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1) {
//             this.plantsDrawGrid.ColCount = domain.breedingAndTimeSeriesOptions.plantsPerGeneration + 1
//         }

//         if (((this.plantsDrawGrid.DefaultColWidth !== domain.breedingAndTimeSeriesOptions.thumbnailWidth) || (this.plantsDrawGrid.DefaultRowHeight !== domain.breedingAndTimeSeriesOptions.thumbnailHeight))) {
//             this.plantsDrawGrid.DefaultColWidth = domain.breedingAndTimeSeriesOptions.thumbnailWidth
//             this.plantsDrawGrid.ColWidths[0] = kFirstColumnWidth
//             this.plantsDrawGrid.DefaultRowHeight = domain.breedingAndTimeSeriesOptions.thumbnailHeight
//             this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
//         }

//         switch (domain.breedingAndTimeSeriesOptions.variationType) {
//             case BreederVariation.kBreederVariationLow:
//                 this.BreederMenuVariationLow.checked = true
//                 this.variationLow.Down = true
//                 break
//             case BreederVariation.kBreederVariationMedium:
//                 this.BreederMenuVariationMedium.checked = true
//                 this.variationMedium.Down = true
//                 break
//             case BreederVariation.kBreederVariationHigh:
//                 this.BreederMenuVariationHigh.checked = true
//                 this.variationHigh.Down = true
//                 break
//             case BreederVariation.kBreederVariationCustom:
//                 this.BreederMenuVariationCustom.checked = true
//                 this.variationCustom.Down = true
//                 break
//             case BreederVariation.kBreederVariationNoNumeric:
//                 this.BreederMenuVariationNone.checked = true
//                 this.variationNoneNumeric.Down = true
//                 break
//         }

//         this.BreederMenuVaryColors.checked = domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
//         this.varyColors.Down = domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
//         this.BreederMenuVary3DObjects.checked = domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
//         this.vary3DObjects.Down = domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
//         this.redoCaption()

//         let atLeastOnePlantHasChangedAge = false
//         if (this.generations.length > 0) {
//             for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
//                 const generation: PdGeneration = this.generations[genCount]
//                 if (generation.plants.length > 0) {
//                     for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
//                         const plant: PdPlant = generation.plants[plCount]
//                         const newAge = intround(domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0 * plant.pGeneral.ageAtMaturity)
//                         if (plant.age !== newAge) {
//                             plant.setAge(newAge)
//                             atLeastOnePlantHasChangedAge = true
//                         }
//                     }
//                 }
//             }
//         }
//         if (atLeastOnePlantHasChangedAge) {
//             this.redrawPlants(kDontConsiderIfPreviewCacheIsUpToDate)
//         }
    }
    
//     redrawPlants(considerIfPreviewCacheIsUpToDate: boolean): void {
//         if (!considerIfPreviewCacheIsUpToDate) {
//             for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
//                 const generation: PdGeneration = this.generations[genCount]
//                 if (generation.plants.length > 0) {
//                     for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
//                         const plant: PdPlant = generation.plants[plCount]
//                         plant.previewCacheUpToDate = false
//                     }
//                 }
//             }
//         }
//         this.plantsDrawGrid.Invalidate()
//         this.plantsDrawGrid.Update()
//     }
    
    plantsDrawGridDrawCell(context: CanvasRenderingContext2D, Col: long, Row: long /*, rect: TRect, State: TGridDrawState*/): void {        
        try {
            // this.plantsDrawGrid.Canvas.Font = this.plantsDrawGrid.Font
            // this.plantsDrawGrid.Canvas.Font.Color = ColorDefs.clBlack
            // if (Col === 0) {
            //     //if (row = selectedRow) and (generations.count > 0) then
            //     //plantsDrawGrid.canvas.brush.color := clBlue
            //     //else
            //     this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clWhite
            //     this.plantsDrawGrid.Canvas.Pen.Color = this.plantsDrawGrid.Canvas.Brush.Color
            //     this.plantsDrawGrid.Canvas.Rectangle(rect.Left, rect.Top, rect.Right, rect.Bottom)
            //     if (Row > this.generations.length - 1) {
            //         return
            //     }
            //     //if row = selectedRow then
            //     //plantsDrawGrid.canvas.font.color := clWhite;
            //     const textDrawRect: TRect = new TRect()
            //     textDrawRect.Left = rect.Left + rect.width / 2 - this.plantsDrawGrid.Canvas.TextWidth(IntToStr(Row + 1)) / 2
            //     textDrawRect.Top = rect.Top + rect.height / 2 - this.plantsDrawGrid.Canvas.TextHeight("0") / 2
            //     this.plantsDrawGrid.Canvas.TextOut(textDrawRect.Left, textDrawRect.Top, IntToStr(Row + 1))
            //     return
            // } else {
            //     this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clWhite
            //     this.plantsDrawGrid.Canvas.Pen.Width = 1
            //     this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clWhite
            //     this.plantsDrawGrid.Canvas.Rectangle(rect.Left, rect.Top, rect.Right, rect.Bottom)
            // }
            const generation = this.generationForIndex(Row)
            if (generation === null) {
                return
            }
            const plant = generation.plantForIndex(Col)
            if (plant === null) {
                return
            }
            if (!plant.previewCacheUpToDate) {
                // draw plant 
                // // draw gray solid box to show delay for drawing plant cache
                // this.plantsDrawGrid.Canvas.Brush.Style = TFPBrushStyle.bsSolid
                // this.plantsDrawGrid.Canvas.Brush.Color = ColorDefs.clSilver
                // this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
                // this.plantsDrawGrid.Canvas.Rectangle(rect.Left + 1, rect.Top + 1, rect.Right, rect.Bottom)
                // draw plant preview cache
                plant.fixedPreviewScale = false
                plant.fixedDrawPosition = false
                // Clear cache
                plant.previewCache.Width = plant.previewCache.Width
                plant.drawPreviewIntoCache(new TPoint(this.DefaultColWidth, this.DefaultRowHeight), kDontConsiderDomainScale, kDrawNow)
            }

            plant.previewCache.Transparent = false
            context.drawImage(plant.previewCache.canvas, 0, 0)

            // draw selection rectangle 
            // this.plantsDrawGrid.Canvas.Brush.Style = TFPBrushStyle.bsClear
            // this.plantsDrawGrid.Canvas.Pen.Width = 2
            // if ((Col === this.lightUpCell.X) && (Row === this.lightUpCell.Y)) {
            //     this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clAqua
            // } else if (Row === this.selectedRow) {
            //     if (plant === generation.firstSelectedPlant()) {
            //         this.plantsDrawGrid.Canvas.Pen.Color = domain.options.firstSelectionRectangleColor
            //     } else if (plant === generation.secondSelectedPlant()) {
            //         this.plantsDrawGrid.Canvas.Pen.Color = domain.options.multiSelectionRectangleColor
            //     } else {
            //         this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
            //     }
            // } else {
            //     this.plantsDrawGrid.Canvas.Pen.Color = ColorDefs.clSilver
            // }
            // this.plantsDrawGrid.Canvas.Rectangle(rect.Left + 1, rect.Top + 1, rect.Right, rect.Bottom)
            // if (plant === generation.firstParent) {
            //     // draw parent indicator 
            //     this.plantsDrawGrid.Canvas.TextOut(rect.Left + 4, rect.Top + 2, "p1")
            // } else if (plant === generation.secondParent) {
            //     this.plantsDrawGrid.Canvas.TextOut(rect.Left + 4, rect.Top + 2, "p2")
            // }
        } finally {
            cursor_stopWait()
        }
    }
    
//     invalidateGridCell(column: long, row: long): void {
//         let cellRectOver: TRect
        
//         if ((column < 0) && (row < 0)) {
//             return
//         }
//         cellRectOver = this.plantsDrawGrid.CellRect(column, row)
//         UNRESOLVED.invalidateRect(this.plantsDrawGrid.Handle, cellRectOver, true)
//     }
    
//     invalidateGridRow(row: long): void {
//         let rowRectOver: TRect
        
//         if (row < 0) {
//             return
//         }
//         rowRectOver = this.plantsDrawGrid.CellRect(0, row)
//         rowRectOver.Right = this.plantsDrawGrid.Width
//         UNRESOLVED.invalidateRect(this.plantsDrawGrid.Handle, rowRectOver, true)
//     }
    
//     plantsDrawGridMouseUp(event: any, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
//         let col: long
//         let row: long
//         let generation: PdGeneration
//         let plant: PdPlant
        
//         // had selection here, moved to mouse down because double-click makes extra mouse up, seems okay so far
//     }
    
//     plantsDrawGridDblClick(): void {
//         this.BreederMenuBreedClick()
//     }
    
//     // ------------------------------------------------------------------------ dragging 
//     plantsDrawGridMouseDown(event: any, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
//         let col: int
//         let row: int

//         [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
//         if ((row >= 0) && (row <= this.generations.length - 1)) {
//             const generation: PdGeneration = this.generations[row]
//             if (generation !== null) {
//                 this.selectGeneration(generation)
//                 if ((col >= 1) && (col - 1 <= generation.plants.length - 1)) {
//                     const plant = generation.plants[col - 1]
//                     if (plant !== null) {
//                         generation.selectPlant(plant, (delphi_compatability.TShiftStateEnum.ssShift in Shift))
//                     } else {
//                         generation.deselectAllPlants()
//                     }
//                     // in first column or past them on right 
//                 } else {
//                     generation.deselectAllPlants()
//                 }
//             } else {
//                 this.deselectAllGenerations()
//             }
//         } else {
//             this.deselectAllGenerations()
//         }
//         this.updateForChangeToGenerations()
//         if ((Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
//             // start drag of plant
//             return
//         }
//         const plant = this.plantAtMouse(X, Y)
//         if (plant === null) {
//             return
//         }
//         this.dragPlantStartPoint = new TPoint(X, Y)
//         this.plantsDrawGrid.BeginDrag(false)
//     }
    
//     plantsDrawGridDragOver(Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
//         let col: long
//         let row: long

//         Accept = (Source !== null) && (Sender !== null) && ((Sender === Source) || (Source === MainForm.drawingPaintBox) || (Source === MainForm.plantListDrawGrid) || (Source === TimeSeriesForm.grid))
//         if ((Accept)) {
//             const plant = this.plantAtMouse(X, Y)
//             if (plant === null) {
//                 Accept = false
//                 return Accept
//             }
//             [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
//             if ((col !== this.lightUpCell.X) || (row !== this.lightUpCell.Y)) {
//                 this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
//                 this.lightUpCell = new TPoint(col, row)
//                 this.invalidateGridCell(col, row)
//             }
//         }
//         return Accept
//     }
    
//     plantsDrawGridEndDrag(event: any, Target: TObject, X: int, Y: int): void {
//         // remove lightup on cell before resetting cell
//         this.invalidateGridCell(this.lightUpCell.X, this.lightUpCell.Y)
//         this.lightUpCell = new TPoint(-1, -1)
//         if (Target === null) {
//             return
//         }
//         // get plant being dragged 
//         const plant = this.plantAtMouse(this.dragPlantStartPoint.X, this.dragPlantStartPoint.Y)
//         if (plant === null) {
//             return
//         }
//         if ((Target === MainForm.drawingPaintBox) || (Target === MainForm.plantListDrawGrid)) {
//             // make paste command - wants list of plants 
//             const newPlant = new PdPlant()
//             plant.copyTo(newPlant)
//             this.numBreederPlantsCopiedThisSession += 1
//             newPlant.setName("Breeder plant " + IntToStr(this.numBreederPlantsCopiedThisSession))
//             if ((Target === MainForm.drawingPaintBox)) {
//                 newPlant.moveTo(new TPoint(X, Y))
//             } else {
//                 newPlant.moveTo(MainForm.standardPastePosition())
//             }
//             if (!domain.viewPlantsInMainWindowOnePlantAtATime()) {
//                 // v2.1
//                 newPlant.calculateDrawingScaleToLookTheSameWithDomainScale()
//             }
//             //to save memory - don't need it in main window
//             newPlant.shrinkPreviewCache()
//             const newPlants: PdPlant[] = []
//             newPlants.push(newPlant)
//             const newCommand = new PdPasteCommand(newPlants, MainForm.selectedPlants)
//             newCommand.useSpecialPastePosition = true
//             try {
//                 cursor_startWait()
//                 MainForm.doCommand(newCommand)
//             } finally {
//                 cursor_stopWait()
//             }
//             // command will free plant if paste is undone
//         } else if (Target === TimeSeriesForm.grid) {
//             TimeSeriesForm.copyPlantToPoint(plant, X, Y)
//         } else if (Target === Sender) {
//             // get plant being replaced 
//             let col: long
//             let row: long    
//             [col, row] = this.plantsDrawGrid.MouseToCell(X, Y)
//             if (!this.inGrid(row, col)) {
//                 return
//             }
//             const plantToReplace = this.plantForRowAndColumn(row, col)
//             if (plantToReplace === null) {
//                 return
//             }
//             if (plantToReplace === plant) {
//                 return
//             }
//             // make replace command 
//             const newCommand: PdCommand = new PdReplaceBreederPlant(plant, row, col)
//             try {
//                 cursor_startWait()
//                 MainForm.doCommand(newCommand)
//             } finally {
//                 cursor_stopWait()
//             }
//         }
//     }
    
    copyPlantToPoint(aPlant: PdPlant, x: int, y: int): void {
        unfinished()
        // let col: long
        // let row: long

        // [col, row] = this.plantsDrawGrid.MouseToCell(x, y)
        // const plant = this.plantForRowAndColumn(row, col)
        // if (plant === null) {
        //     return
        // }
        // const newCommand: PdCommand = new PdReplaceBreederPlant(aPlant, row, col)
        // MainForm.doCommand(newCommand)
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
        // TODO PDF: Fix this
        // const lastFullyVisibleRow: short = this.plantsDrawGrid.TopRow + this.plantsDrawGrid.VisibleRowCount - 1
        // if (this.selectedRow > lastFullyVisibleRow) {
        //     this.plantsDrawGrid.TopRow = this.plantsDrawGrid.TopRow + (this.selectedRow - lastFullyVisibleRow)
        // }
        // if (this.selectedRow < this.plantsDrawGrid.TopRow) {
        //     this.plantsDrawGrid.TopRow = this.selectedRow
        // }
    }
    
//     deselectAllGenerations(): void {
//         this.selectedRow = -1
//         for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
//             const generation: PdGeneration = this.generations[genCount]
//             generation.deselectAllPlants()
//         }
//     }
    
    updateForChangeToGenerations(): void {
        // TODO PDF: Fix this
//         this.updateMenusForChangeToGenerations()
//         this.internalChange = true
//         if (!this.Visible) {
//             //calls resize
//             this.Show()
//         }
//         this.BringToFront()
//         this.internalChange = false
//         if (this.plantsDrawGrid.RowCount < this.generations.length) {
//             this.plantsDrawGrid.RowCount = this.generations.length
//         }
//         this.plantsDrawGrid.Invalidate()
//         this.plantsDrawGrid.Update()
//         this.redoCaption()
//         if (this.generations.length <= 0) {
//             this.emptyWarningPanel.BringToFront()
//         } else {
//             this.emptyWarningPanel.SendToBack()
//         }
    }
    
    updateForChangeToPlant(aPlant: PdPlant): void {
        // TODO PDF: Fix this
//         for (let genCount = 0; genCount <= this.generations.length - 1; genCount++) {
//             const generation: PdGeneration = this.generations[genCount]
//             if (generation.plants.length > 0) {
//                 for (let plCount = 0; plCount <= generation.plants.length - 1; plCount++) {
//                     const plant: PdPlant = generation.plants[plCount]
//                     if (plant === aPlant) {
//                         const cellRectOver: TRect = this.plantsDrawGrid.CellRect(plCount + 1, genCount)
//                         this.plantsDrawGridDrawCell(this, plCount + 1, genCount, cellRectOver, { gdFocused: true, gdSelected: true })
//                         return
//                     }
//                 }
//             }
//         }
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
        this.updateMenusForChangeToSelection()
    }

    haveSelection(): boolean {
        return (this.primarySelectedPlant() !== null)
    }
    
    updateMenusForChangeToSelection(): void {
        this.updatePasteMenuForClipboardContents()
        // must paste onto a selected plant 
    }
    
    updatePasteMenuForClipboardContents(): void {
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
    BreederMenuUndoClick(): void {
        MainForm.MenuEditUndoClick()
    }
    
    BreederMenuRedoClick(): void {
        MainForm.MenuEditRedoClick()
    }
    
    BreederMenuCopyClick(): void {
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
    
    BreederMenuSendCopyToMainWindowClick(): void {
        this.BreederMenuCopyClick()
        MainForm.MenuEditPasteClick()
    }
    
    BreederMenuUndoRedoListClick(): void {
        MainForm.UndoMenuEditUndoRedoListClick()
    }
    
    BreederMenuPasteClick(): void {
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
        newCommand = new PdReplaceBreederPlant(newPlant, this.selectedRow, column)
        MainForm.doCommand(newCommand)
        //command will free plant if paste is undone
    }
    
    BreederMenuBreedClick(): void {
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
        newCommand = new PdBreedFromParentsCommand(this.generations, generationToBreed.firstSelectedPlant(), generationToBreed.secondSelectedPlant(), this.selectedRow, domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, kDontCreateFirstGeneration)
        generationToBreed.firstParent = generationToBreed.firstSelectedPlant()
        generationToBreed.secondParent = generationToBreed.secondSelectedPlant()
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuMakeTimeSeriesClick(): void {
        let newCommand: PdCommand

        const aPlant = this.primarySelectedPlant()
        if (aPlant === null) {
            return
        }
        newCommand = new PdMakeTimeSeriesCommand(aPlant)
        MainForm.doCommand(newCommand)
    }
    
    fullWarning(): void {
        MessageDialog("The breeder is full.\n\nYou must delete some rows\nor increase the number of rows allowed in the breeder options)\n\nbefore you can breed more plants.", "mtWarning", {mbOK: true, }, 0)
    }
    
    BreederMenuDeleteRowClick(): void { 
        const aGeneration = this.selectedGeneration()
        if (aGeneration === null) {
            return
        }
        const newCommand: PdCommand = new PdDeleteBreederGenerationCommand(aGeneration)
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuDeleteAllClick(): void { 
        if (this.generations.length <= 0) {
            return
        }
        const newCommand: PdCommand = new PdDeleteAllBreederGenerationsCommand()
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuRandomizeClick(): void {
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
                const plant = aGeneration.selectedPlants[i]
                randomizeList.push(plant)
            }
            const newCommand = new PdRandomizeCommand(randomizeList)
            newCommand.isInBreeder = true
            cursor_startWait()
            MainForm.doCommand(newCommand)
        } finally {
            cursor_stopWait()
        }
    }
    
    BreederMenuRandomizeAllClick(): void {
        if (this.generations.length <= 0) {
            return
        }
        try {
            cursor_startWait()
            const randomizeList: PdPlant[] = []
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
            const newCommand = new PdRandomizeCommand(randomizeList)
            newCommand.isInBreeder = true
            newCommand.isRandomizeAllInBreeder = true
            MainForm.doCommand(newCommand)
        } finally {
            cursor_stopWait()
        }
    }
    
    BreederMenuVariationNoneClick(): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationNoNumeric
        this.redoCaption()
    }
    
    BreederMenuVariationLowClick(): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationLow
        this.redoCaption()
    }
    
    BreederMenuVariationMediumClick(): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationMedium
        this.redoCaption()
    }
    
    BreederMenuVariationHighClick(): void {
        domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationHigh
        this.redoCaption()
    }
    
    BreederMenuVariationCustomClick(): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabMutation)
    }
    
    BreederMenuOtherOptionsClick(): void {
        this.changeBreederAndTimeSeriesOptions(kOptionTabSize)
    }
    
    BreederMenuVaryColorsClick(): void {
        const options: BreedingAndTimeSeriesOptionsStructure = domain.breedingAndTimeSeriesOptions
        options.mutateAndBlendColorValues = !options.mutateAndBlendColorValues
        const newCommand: PdCommand = new PdChangeBreedingAndTimeSeriesOptionsCommand(options, domain.options)
        MainForm.doCommand(newCommand)
    }
    
    BreederMenuVary3DObjectsClick(): void {
        const options: BreedingAndTimeSeriesOptionsStructure = domain.breedingAndTimeSeriesOptions
        options.chooseTdosRandomlyFromCurrentLibrary = !options.chooseTdosRandomlyFromCurrentLibrary
        const newCommand: PdCommand = new PdChangeBreedingAndTimeSeriesOptionsCommand(options, domain.options)
        MainForm.doCommand(newCommand)
    }
    
    changeBreederAndTimeSeriesOptions(tabIndexToShow: short): void {
        // PDF TODO: Fix thie
        alert("UNFINISHED")
        // if (tabIndexToShow === kOptionTabMutation) {
        //     domain.breedingAndTimeSeriesOptions.variationType = BreederVariation.kBreederVariationCustom
        //     this.BreederMenuVariationCustom.checked = true
        //     this.redoCaption()
        // }
        // const optionsForm: TBreedingOptionsForm = ubrdopt.TBreedingOptionsForm().create(this)
        // if (optionsForm === null) {
        //     throw new Error("Problem: Could not create breeding options window.")
        // }
        // optionsForm.breedingOptions.pageIndex = tabIndexToShow
        // optionsForm.initializeWithBreedingAndTimeSeriesOptionsAndDomainOptions(domain.breedingAndTimeSeriesOptions, domain.options)
        // const response: int = optionsForm.ShowModal()
        // if (response === mrOK) {
        //     const newCommand: PdCommand = new PdChangeBreedingAndTimeSeriesOptionsCommand(optionsForm.options, optionsForm.domainOptions)
        //     MainForm.doCommand(newCommand)
        // }
    }
    
    variationLowClick(): void {
        this.BreederMenuVariationLowClick()
    }
    
    variationNoneNumericClick(): void {
        this.BreederMenuVariationNoneClick()
    }
    
    variationMediumClick(): void {
        this.BreederMenuVariationMediumClick()
    }
    
    variationHighClick(): void {
        this.BreederMenuVariationHighClick()
    }
    
    variationCustomClick(): void {
        this.BreederMenuVariationCustomClick()
    }
    
    varyColorsClick(): void {
        this.BreederMenuVaryColorsClick()
    }
    
    vary3DObjectsClick(): void {
        this.BreederMenuVary3DObjectsClick()
    }
    
    BreederPopupMenuRandomizeClick(): void {
        this.BreederMenuRandomizeClick()
    }
    
    BreederPopupMenuBreedClick(): void {
        this.BreederMenuBreedClick()
    }
    
    breedButtonClick(): void {
        this.BreederMenuBreedClick()
    }
    
    BreederPopupMenuMakeTimeSeriesClick(): void {
        this.BreederMenuMakeTimeSeriesClick()
    }
    
    BreederPopupMenuCopyClick(): void {
        this.BreederMenuCopyClick()
    }
    
    BreederPopupMenuPasteClick(): void {
        this.BreederMenuPasteClick()
    }
    
    BreederPopupMenuSendCopytoMainWindowClick(): void {
        this.BreederMenuSendCopyToMainWindowClick()
    }
    
    BreederPopupMenuDeleteRowClick(): void {
        this.BreederMenuDeleteRowClick()
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
    
//     // ---------------------------------------------------------------------------- resizing 
//     FormResize(): void {
//         if (this.generations === null) {
//             return
//         }
//         this.breederToolbarPanel.SetBounds(0, 0, this.ClientWidth, this.breederToolbarPanel.Height)
//         this.helpButton.SetBounds(this.breederToolbarPanel.Width - this.helpButton.Width - 4, this.helpButton.Top, this.helpButton.Width, this.helpButton.Height)
//         this.plantsDrawGrid.SetBounds(0, this.breederToolbarPanel.Height, this.ClientWidth, this.ClientHeight - this.breederToolbarPanel.Height)
//         this.emptyWarningPanel.SetBounds(this.ClientWidth / 2 - this.emptyWarningPanel.Width / 2, this.ClientHeight / 2 - this.emptyWarningPanel.Height / 2, this.emptyWarningPanel.Width, this.emptyWarningPanel.Height)
//     }
    
//     WMGetMinMaxInfo(MSG: Tmessage): void {
//         PdForm.prototype.WMGetMinMaxInfo.call(this)
//         //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
//         UNRESOLVED.ptMinTrackSize.x = 250
//         UNRESOLVED.ptMinTrackSize.y = 150
//     }
    
    helpButtonClick(): void {
        HelpJump("Breeding_plants_using_the_breeder")
    }
    
    BreederMenuHelpOnBreedingClick(): void {
        HelpJump("Breeding_plants_using_the_breeder")
    }
    
    BreederMenuHelpTopicsClick(): void {
        HelpJump("")
    }
    
    BreederMenuOptionsFastDrawClick(): void {
        MainForm.MenuOptionsFastDrawClick()
    }
    
    BreederMenuOptionsMediumDrawClick(): void {
        MainForm.MenuOptionsMediumDrawClick()
    }
    
    BreederMenuOptionsBestDrawClick(): void {
        MainForm.MenuOptionsBestDrawClick()
    }
    
    BreederMenuOptionsCustomDrawClick(): void {
        MainForm.MenuOptionsCustomDrawClick()
    }

    viewEmptyIfNeeded(vnode: any) {
        if (this.generations.length <= 0) {
            return m("div.emptyWarningPanel.ba.bw2.b--green", 
                "The breeder is empty. To make some breeder plants, select a plant (or two plants) in the main window and choose Breed from the Plant menu.",
                !MainForm && m("button", { onclick: () => {
                    this.generations.push(new PdGeneration(vnode.attrs.plant, null, 1.0))
                }}, "Add Plant")
            )
        } else {
            return []
        }
    }

    borderIfSelected(plant: PdPlant) {
        if (plant === this.firstSelectedPlant) return ".bw2.b--green"
        if (plant === this.secondSelectedPlant) return ".bw2.b--blue"
        return ".bw2.b--black"
    }

    oninit() {
        setBreederForm(this)
    }

    backgroundForSpeedButton(buttonId: string) {
        const selected = ".bg-blue"
        switch(buttonId) {
            case "variationNoneNumeric":
                return domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationNoNumeric
                    ? selected
                    : ""
            case "variationLow":
                return domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationLow
                    ? selected
                    : ""
            case "variationMedium":
                return domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationMedium
                    ? selected
                    : ""
            case "variationHigh":
                return domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationHigh
                    ? selected
                    : ""
            case "variationCustom":
                return domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationCustom
                    ? selected
                    : ""

            case "varyColors":
                return domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
                    ? selected
                    : ""

            case "vary3DObjects":
                return domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
                    ? selected
                    : ""

            default: {
                throw new Error("Unexpected buttonId: " + buttonId)
            }
        }
    }

    havePlants(): boolean {
        return this.generations.length > 0
    }

    mainMenuSpec: any = [
        // [type = radio/checkbox, ] ID, label, items or action [, checked function][, enabled function]
        "MenuEdit", "&Edit", [
            "MenuEditUndo", () => MainForm.menuUndoCaption(), this.BreederMenuUndoClick, () => false, () => MainForm.commandList.isUndoEnabled(),
            "MenuEditRedo", () => MainForm.menuRedoCaption(), this.BreederMenuRedoClick, () => false, () => MainForm.commandList.isRedoEnabled(),
            "MenuEditUndoRedoList", "Undo/Redo &List...", this.BreederMenuUndoRedoListClick,
            "-",
            "MenuEditCopy", "C&opy", this.BreederMenuCopyClick, () => false, () => this.haveSelection(),
            "MenuEditPaste", "&Paste", this.BreederMenuPasteClick, () => false, () => MainForm.havePrivateClipboardPlants() && this.haveSelection(),
            "MenuEditSendCopy", "&Send Copy to Main Window", this.BreederMenuSendCopyToMainWindowClick, () => false, () => this.haveSelection(),
        ],
        "MenuPlant", "&Breed", [
            "MenuBreedBreed", "&Breed", this.BreederMenuBreedClick, () => false, () => this.haveSelection(),
            "MenuBreedMakeTimeSeries", "Make &Time Series", this.BreederMenuMakeTimeSeriesClick, () => false, () => this.haveSelection(),
            "-",
            "MenuBreedDeleteRow", "Delete &Generation", this.BreederMenuDeleteRowClick, () => false, () => this.haveSelection(),
            "MenuBreedDeleteAll", "Delete &All", this.BreederMenuDeleteAllClick, () => false, () => this.havePlants(),
            "-",
            "MenuBreedRandomize", "&Randomize", this.BreederMenuRandomizeClick, () => false, () => this.haveSelection(),
            "MenuBreedRandomizeAll", "Randomize A&ll", this.BreederMenuRandomizeAllClick, () => false, () => this.havePlants(),
        ],
        "MenuOptions", "&Options", [
            "MenuOptionsDrawAs", "&Draw Using", [
                "radio", "MenuOptionsFastDraw", "&Bounding Boxes", this.BreederMenuOptionsFastDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawFast,
                "radio", "MenuOptionsMediumDraw", "&Wire Frames", this.BreederMenuOptionsMediumDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawMedium,
                "radio", "MenuOptionsBestDraw", "&Solids", this.BreederMenuOptionsBestDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawBest,
                "radio", "MenuOptionsCustomDraw", "&Custom...", this.BreederMenuOptionsCustomDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawCustom,
            ],
            "MenuOptionsDrawAs", "Vary &Numbers", [
                "radio", "MenuVariationNone", "&None", this.BreederMenuVariationNoneClick, () => domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationNoNumeric,
                "radio", "MenuVariationLow", "&Low", this.BreederMenuVariationLowClick, () => domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationLow,
                "radio", "MenuVariationMedium", "&Medium", this.BreederMenuVariationMediumClick, () => domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationMedium,
                "radio", "BreederMenuVariationHigh", "&High", this.BreederMenuVariationHighClick, () => domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationHigh,
                "radio", "MenuVariationCustom", "&Custom...", this.BreederMenuVariationCustomClick, () => domain.breedingAndTimeSeriesOptions.variationType === BreederVariation.kBreederVariationCustom,
            ],
            "checkbox", "MenuVaryColors", "Vary &Colors", this.BreederMenuVaryColorsClick, () => domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues,
            "checkbox", "MenuVary3DObjects", "Vary &3D Objects", this.BreederMenuVary3DObjectsClick, () => domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary,
            "-",
            "MenuOptionsStages", "&More Options...", this.BreederMenuOtherOptionsClick,
        ],
        "MenuWindow", "&Window", [
            "radio", "MenuWindowMain", "&Main", () => setActiveForm("MainForm"), () => activeForm === "MainForm", () => MainForm !== undefined,
            "radio", "MenuWindowBreeder", "&Breeder", () => setActiveForm("BreederForm"), () => activeForm === "BreederForm", () => BreederForm !== undefined,
            "radio", "MenuWindowTimeSeries", "&Time Series", () => setActiveForm("TimeSeriesForm"), () => activeForm === "TimeSeriesForm", () => TimeSeriesForm !== undefined,
        ],
        "MenuHelp", "&Help", [
            "MenuHelpSuperSpeedTour", "Help on &Breeding", this.BreederMenuHelpOnBreedingClick,
            "-",
            "MenuHelpTopics", "&Help Topics", this.BreederMenuHelpTopicsClick,
        ],
    ]

    viewToolbar() {
        return m("div.breederToolbarPanel.TPanel",
            m("button.breedButton.TSpeedButton",
                {
                    onclick: () => this.breedButtonClick(),
                    disabled: !this.haveSelection(),
                    title: "Breed",
                },
                m("img", { src: imageDir + (this.haveSelection() ? "BreederForm_breedButton.png" :  "BreederForm_breedButton-disabled.png" )})
            ),
            m("button.variationNoneNumeric.TSpeedButton" + this.backgroundForSpeedButton("variationNoneNumeric"),
                {
                    onclick: () => this.variationNoneNumericClick(),
                    title: "Variation none",
                },
                m("img", { src: imageDir + "BreederForm_variationNoneNumeric.png" })
            ),
            m("button.variationLow.TSpeedButton" + this.backgroundForSpeedButton("variationLow"),
                {
                    onclick: () => this.variationLowClick(),
                    title: "Variation low",
                },
                m("img", { src: imageDir + "BreederForm_variationLow.png" })
            ),
            m("button.variationMedium.TSpeedButton" + this.backgroundForSpeedButton("variationMedium"),
                {
                    onclick: () => this.variationMediumClick(),
                    title: "Variation medium",
                },
                m("img", { src: imageDir + "BreederForm_variationMedium.png" })
            ),
            m("button.variationHigh.TSpeedButton" + this.backgroundForSpeedButton("variationHigh"),
                {
                    onclick: () => this.variationHighClick(),
                    title: "Variation hight",
                },
                m("img", { src: imageDir + "BreederForm_variationHigh.png" })
            ),
            m("button.variationCustom.TSpeedButton" + this.backgroundForSpeedButton("variationCustom"),
                {
                    onclick: () => this.variationCustomClick(),
                    title: "Variation custom",
                },
                m("img", { src: imageDir + "BreederForm_variationCustom.png" })
            ),
            m("button.varyColors.TSpeedButton" + this.backgroundForSpeedButton("varyColors"),
                {
                    onclick: () => this.varyColorsClick(),
                    title: "Vary colors",
                },
                m("img", { src: imageDir + "BreederForm_varyColors.png" })
            ),
            m("button.vary3DObjects.TSpeedButton" + this.backgroundForSpeedButton("vary3DObjects"),
                {
                    onclick: () => this.vary3DObjectsClick(),
                    title: "Variation 3D objects",
                },
                m("img", { src: imageDir + "BreederForm_vary3DObjects.png" })
            ),
            m("button.helpButton.TSpeedButton",
                {
                    onclick: () => this.helpButtonClick(),
                    title: "Help",
                },
                m("img", { src: imageDir + "BreederForm_helpButton.png" })
            ),
        )
    }

    view(vnode: any) {
        if (activeForm && activeForm !== "BreederForm") return []
        const self = this
        return m("div.BreederForm.relative", {
                onclick: (event: any) => {
                    resetDroppedDownMenuId()
                },
            },
            viewMainMenu(this.mainMenuSpec, this, () => this.viewToolbar()),
            m(ModalInputView),
                // m("ul.BreederPopupMenu.TPopupMenu",
                //     {
                //         // Top: "12",
                //         // Left: "396",
                //         // Height: "0",
                //         // Width: "0",
                //     },
                //     m("li.BreederPopupMenuBreed.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuBreedClick(),
                //         },
                //         caption("&Breed"),
                //     ),
                //     m("li.N5.TMenuItem",
                //         {
                //         },
                //         "-",
                //     ),
                //     m("li.BreederPopupMenuCopy.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuCopyClick(),
                //         },
                //         caption("&Copy"),
                //     ),
                //     m("li.BreederPopupMenuPaste.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuPasteClick(),
                //         },
                //         caption("&Paste"),
                //     ),
                //     m("li.BreederPopupMenuSendCopytoMainWindow.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuSendCopytoMainWindowClick(),
                //         },
                //         caption("&Send Copy to Main Window"),
                //     ),
                //     m("li.N7.TMenuItem",
                //         {
                //         },
                //         "-",
                //     ),
                //     m("li.BreederPopupMenuRandomize.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuRandomizeClick(),
                //         },
                //         caption("&Randomize"),
                //     ),
                //     m("li.BreederPopupMenuMakeTimeSeries.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuMakeTimeSeriesClick(),
                //         },
                //         caption("&Make Time Series"),
                //     ),
                //     m("li.N8.TMenuItem",
                //         {
                //         },
                //         "-",
                //     ),
                //     m("li.BreederPopupMenuDeleteRow.TMenuItem",
                //         {
                //             onclick: () => this.BreederPopupMenuDeleteRowClick(),
                //         },
                //         caption("Delete &generation"),
                //     ),
                // ),
            this.viewEmptyIfNeeded(vnode),
            m("div.TDrawGrid.plantsDrawGrid", {
                // Top: "48",
                // Left: "2",
                // Height: "141",
                // Width: "345",
                // Ctl3D: "True",
                // DefaultRowHeight: "64",
                // DefaultDrawing: "False",
                // FixedCols: "0",
                // RowCount: "30",
                // FixedRows: "0",
                // Options: "[goFixedVertLine, goFixedHorzLine, goRangeSelect]",
                // ParentCtl3D: "False",
                // PopupMenu: "BreederPopupMenu",
                // TabOrder: "0",
                // OnDblClick: "plantsDrawGridDblClick",
                // OnDragOver: "plantsDrawGridDragOver",
                // OnDrawCell: "plantsDrawGridDrawCell",
                // OnEndDrag: "plantsDrawGridEndDrag",
                // OnMouseDown: "plantsDrawGridMouseDown",
                // OnMouseUp: "plantsDrawGridMouseUp",
            },
                this.generations.map((generation: PdGeneration, row: number) => m("div.flex.flex-row",
                    generation.plants.map((plant: PdPlant, column: number) =>
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
                                self.plantsDrawGridDrawCell(context, column, row)
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
                            onclick: (event: any) => {
                                if ( event.ctrlKey && self.firstSelectedPlant == plant) {
                                    self.firstSelectedPlant = self.secondSelectedPlant
                                    self.secondSelectedPlant = null
                                    return
                                }
                                if ( event.ctrlKey && self.secondSelectedPlant == plant) {
                                    self.secondSelectedPlant = null
                                    return
                                }
                                this.selectPlant(plant, event.shiftKey || event.ctrlKey)
                                vnode.attrs.setPlant && vnode.attrs.setPlant(plant)
                            },
                            ondblclick: () => {
                                // Breed plant
                                const newGeneration = new PdGeneration(null, null, 1.0)
                                newGeneration.breedFromParents(this.firstSelectedPlant, this.secondSelectedPlant, 1.0)
                                this.generations.length = row + 1
                                this.generations.push(newGeneration)
                            }
                        })),
                    )
                )),
            )
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
}
