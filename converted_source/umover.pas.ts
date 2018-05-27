// unit Umover

from conversion_common import *
import ubmpsupport
import uturtle
import umath
import usupport
import ucursor
import umain
import udomain
import updform
import updcom
import ucommand
import uplant
import uplantmn
import delphi_compatability

// const
const kLeft = 0
const kRight = 1
const kNewPlantFileName = "untitled.pla"
const kThisManager = true
const kOtherManager = false


// var
let MoverForm: TMoverForm


// const
const kBetweenGap = 4



export class TMoverForm {
    leftPlantFileNameEdit: TEdit = new TEdit()
    leftOpenClose: TButton = new TButton()
    rightPlantFileNameEdit: TEdit = new TEdit()
    rightOpenClose: TButton = new TButton()
    newFile: TButton = new TButton()
    transfer: TButton = new TButton()
    close: TButton = new TButton()
    previewImage: TImage = new TImage()
    undo: TButton = new TButton()
    redo: TButton = new TButton()
    cut: TButton = new TButton()
    copy: TButton = new TButton()
    paste: TButton = new TButton()
    rename: TButton = new TButton()
    duplicate: TButton = new TButton()
    delete: TButton = new TButton()
    leftPlantFileChangedIndicator: TImage = new TImage()
    rightPlantFileChangedIndicator: TImage = new TImage()
    leftPlantList: TDrawGrid = new TDrawGrid()
    rightPlantList: TDrawGrid = new TDrawGrid()
    helpButton: TSpeedButton = new TSpeedButton()
    leftPlantFileName: string = ""
    rightPlantFileName: string = ""
    leftManager: PdPlantManager = new PdPlantManager()
    rightManager: PdPlantManager = new PdPlantManager()
    leftPlantFileChanged: boolean = false
    rightPlantFileChanged: boolean = false
    lastLeftSingleClickPlantIndex: int = 0
    lastRightSingleClickPlantIndex: int = 0
    leftOrRight: short = 0
    changedCurrentPlantFile: boolean = false
    commandList: PdCommandList = new PdCommandList()
    selectedPlants: TList = new TList()
    untitledDomainFileSavedAs: string = ""
    dragItemsY: int = 0
    justDoubleClickedOnLeftGrid: boolean = false
    justDoubleClickedOnRightGrid: boolean = false
    TMoverForm.prototype = new PdForm()
    TMoverForm.prototype.constructor = TMoverForm
    
    //$R *.DFM
    // -------------------------------------------------------------------------------------------- *creation/destruction 
    create(AOwner: TComponent): void {
        PdForm.prototype.create.call(this, AOwner)
        MoverForm = this
        this.leftManager = uplantmn.PdPlantManager().create()
        this.rightManager = uplantmn.PdPlantManager().create()
        this.commandList = ucommand.PdCommandList().create()
        this.selectedPlants = delphi_compatability.TList().Create()
        this.commandList.setNewUndoLimit(udomain.domain.options.undoLimit)
        this.commandList.setNewObjectUndoLimit(udomain.domain.options.undoLimitOfPlants)
        this.updateButtonsForUndoRedo()
        if (len(udomain.domain.plantFileName) > 0) {
            // load current plant file into left side to start 
            this.openPlantFileForManager(this.leftManager, udomain.domain.plantFileName)
        } else {
            this.closePlantFileForManager(this.leftManager)
        }
        // right side is empty to start 
        this.closePlantFileForManager(this.rightManager)
        this.updatePasteButtonForClipboardContents()
    }
    
    FormCreate(Sender: TObject): void {
        this.leftPlantList.DragCursor = ucursor.crDragPlant
        this.rightPlantList.DragCursor = ucursor.crDragPlant
    }
    
    destroy(): void {
        this.leftManager.free
        this.leftManager = null
        this.rightManager.free
        this.rightManager = null
        this.selectedPlants.free
        this.selectedPlants = null
        this.commandList.free
        this.commandList = null
        PdForm.prototype.destroy.call(this)
    }
    
    FormClose(Sender: TObject, Action: TCloseAction): void {
        if (this.ModalResult === mrOK) {
            return
        }
        // same as exit, but can't call exit because we have to set the action flag 
        Action = delphi_compatability.TCloseAction.caNone
        if (!this.askToSaveManagerAndProceed(this.leftManager)) {
            return
        }
        if (!this.askToSaveManagerAndProceed(this.rightManager)) {
            return
        }
        Action = delphi_compatability.TCloseAction.caFree
    }
    
    FormKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DELETE:
                this.deleteClick(this)
                break
        }
        if (!(delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
            return Key
        }
        switch (String.fromCharCode(Key)) {
            case "C":
                this.copyClick(this)
                Key = 0
                break
            case "c":
                this.copyClick(this)
                Key = 0
                break
            case "X":
                this.cutClick(this)
                Key = 0
                break
            case "x":
                this.cutClick(this)
                Key = 0
                break
            case "V":
                this.pasteClick(this)
                Key = 0
                break
            case "v":
                this.pasteClick(this)
                Key = 0
                break
            case "Z":
                if (delphi_compatability.TShiftStateEnum.ssShift in Shift) {
                    this.redoClick(this)
                } else {
                    this.undoClick(this)
                }
                Key = 0
                break
            case "z":
                if (delphi_compatability.TShiftStateEnum.ssShift in Shift) {
                    this.redoClick(this)
                } else {
                    this.undoClick(this)
                }
                Key = 0
                break
        }
        return Key
    }
    
    // ----------------------------------------------------------------------------------------- *buttons 
    undoClick(Sender: TObject): void {
        this.commandList.undoLast()
        this.updateButtonsForUndoRedo()
        this.updateForChangeToSelectedPlants()
    }
    
    redoClick(Sender: TObject): void {
        this.commandList.redoLast()
        this.updateButtonsForUndoRedo()
        this.updateForChangeToSelectedPlants()
    }
    
    cutClick(Sender: TObject): void {
        let manager: PdPlantManager
        let newCommand: PdCommand
        
        manager = this.selectedManager(kThisManager)
        if ((manager === null) || (this.selectedPlants.Count <= 0)) {
            return
        }
        newCommand = PdMoverRemoveCommand().createWithListOfPlantsManagerAndClipboardFlag(this.selectedPlants, manager, updcom.kCopyToClipboard)
        this.doCommand(newCommand)
    }
    
    copyClick(Sender: TObject): void {
        this.copySelectedPlantsToClipboard()
    }
    
    pasteClick(Sender: TObject): void {
        let manager: PdPlantManager
        let newCommand: PdCommand
        let newPlants: TList
        
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return
        }
        newPlants = delphi_compatability.TList().Create()
        udomain.domain.plantManager.pastePlantsFromPrivatePlantClipboardToList(newPlants)
        newCommand = PdMoverPasteCommand().createWithListOfPlantsAndManager(newPlants, manager)
        this.doCommand(newCommand)
        //command has its own list, so we need to free this one
        newPlants.free
    }
    
    closeClick(Sender: TObject): void {
        if (!this.askToSaveManagerAndProceed(this.leftManager)) {
            return
        }
        if (!this.askToSaveManagerAndProceed(this.rightManager)) {
            return
        }
        // cannot cancel 
        this.ModalResult = mrOK
    }
    
    leftOpenCloseClick(Sender: TObject): void {
        if (this.haveLeftFile()) {
            //file open
            //no file
            this.closePlantFileForManager(this.leftManager)
        } else {
            this.openPlantFileForManager(this.leftManager, "")
        }
    }
    
    rightOpenCloseClick(Sender: TObject): void {
        if (this.haveRightFile()) {
            //file open
            //no file
            this.closePlantFileForManager(this.rightManager)
        } else {
            this.openPlantFileForManager(this.rightManager, "")
        }
    }
    
    newFileClick(Sender: TObject): void {
        this.newPlantFileForManager(this.rightManager)
    }
    
    transferClick(Sender: TObject): void {
        let manager: PdPlantManager
        let otherManager: PdPlantManager
        let newCommand: PdCommand
        let newPlants: TList
        let plant: PdPlant
        let newPlant: PdPlant
        let i: short
        
        manager = this.selectedManager(kThisManager)
        otherManager = this.selectedManager(kOtherManager)
        if ((manager === null) || (otherManager === null) || (this.selectedPlants.Count <= 0)) {
            return
        }
        if (this.selectedPlants.Count > 0) {
            //command will free
            newPlants = delphi_compatability.TList().Create()
            for (i = 0; i <= this.selectedPlants.Count - 1; i++) {
                plant = uplant.PdPlant(this.selectedPlants.Items[i])
                newPlant = uplant.PdPlant().create()
                plant.copyTo(newPlant)
                newPlants.Add(newPlant)
            }
            newCommand = PdMoverPasteCommand().createWithListOfPlantsAndManager(newPlants, otherManager)
            (newCommand).isTransfer = true
            this.doCommand(newCommand)
            //command has its own list, so we need to free this one
            newPlants.free
        }
    }
    
    duplicateClick(Sender: TObject): void {
        let manager: PdPlantManager
        let newCommand: PdCommand
        
        manager = this.selectedManager(kThisManager)
        if ((manager === null) || (this.selectedPlants.Count <= 0)) {
            return
        }
        newCommand = PdMoverDuplicateCommand().createWithListOfPlantsAndManager(this.selectedPlants, manager)
        this.doCommand(newCommand)
    }
    
    renameClick(Sender: TObject): void {
        let plant: PdPlant
        let manager: PdPlantManager
        let newName: ansistring
        let newCommand: PdCommand
        
        // can only rename one plant at a time 
        manager = this.selectedManager(kThisManager)
        plant = this.focusedPlant()
        if ((plant === null) || (manager === null)) {
            return
        }
        newName = plant.getName()
        if (!InputQuery("Enter new name", "Type a new name for " + newName + ".", newName)) {
            return
        }
        newCommand = PdMoverRenameCommand().createWithPlantNewNameAndManager(plant, newName, manager)
        this.doCommand(newCommand)
    }
    
    deleteClick(Sender: TObject): void {
        let manager: PdPlantManager
        let newCommand: PdCommand
        
        manager = this.selectedManager(kThisManager)
        if ((manager === null) || (this.selectedPlants.Count <= 0)) {
            return
        }
        newCommand = PdMoverRemoveCommand().createWithListOfPlantsManagerAndClipboardFlag(this.selectedPlants, manager, updcom.kDontCopyToClipboard)
        this.doCommand(newCommand)
    }
    
    // -------------------------------------------------------------------------------------- *list box actions 
    leftPlantListDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
        this.drawLineInGrid(this.leftPlantList, this.leftManager, Row, Rect, State)
    }
    
    rightPlantListDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
        this.drawLineInGrid(this.rightPlantList, this.rightManager, Row, Rect, State)
    }
    
    drawLineInGrid(grid: TDrawGrid, manager: PdPlantManager, index: int, rect: TRect, state: TGridDrawState): void {
        let plant: PdPlant
        let selected: boolean
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        grid.Canvas.Brush.Color = grid.Color
        grid.Canvas.FillRect(Rect)
        if ((manager.plants.Count <= 0) || (index < 0) || (index > manager.plants.Count - 1)) {
            return
        }
        // set up plant pointer 
        plant = uplant.PdPlant(manager.plants.Items[index])
        if (plant === null) {
            return
        }
        selected = this.selectedPlants.IndexOf(plant) >= 0
        grid.Canvas.Font = grid.Font
        if (selected) {
            grid.Canvas.Brush.Color = UNRESOLVED.clHighlight
            grid.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            grid.Canvas.Brush.Color = grid.Color
            grid.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        grid.Canvas.FillRect(Rect)
        UNRESOLVED.strPCopy(cText, plant.getName())
        // margin for text 
        Rect.left = Rect.left + 2
        UNRESOLVED.winprocs.drawText(grid.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
        if (plant === this.focusedPlant()) {
            // put back 
            Rect.left = Rect.left - 2
            UNRESOLVED.drawFocusRect(Rect)
        }
    }
    
    // left list mouse handling
    leftPlantListMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int
        
        if (this.justDoubleClickedOnLeftGrid) {
            this.justDoubleClickedOnLeftGrid = false
            return
        } else {
            this.justDoubleClickedOnLeftGrid = false
        }
        if (this.leftManager.plants.Count > 0) {
            if (this.leftOrRight === kRight) {
                this.selectedPlants.Clear()
                this.lastRightSingleClickPlantIndex = -1
                this.rightPlantList.Invalidate()
            }
            this.leftOrRight = kLeft
            col, row = this.leftPlantList.MouseToCell(X, Y, col, row)
            this.selectPlantAtIndex(Shift, row)
            this.updateForChangeToSelectedPlants()
            this.leftPlantList.BeginDrag(false)
        }
    }
    
    leftPlantListDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null)
        if (Source === this.rightPlantList) {
            Accept = Accept && this.haveLeftFile()
        } else {
            Accept = Accept && (Source === Sender)
        }
        return Accept
    }
    
    leftPlantListEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        if ((Target === this.rightPlantList)) {
            this.transferClick(this)
        }
    }
    
    leftPlantListDblClick(Sender: TObject): void {
        this.renameClick(this)
        this.leftPlantList.endDrag(false)
        this.justDoubleClickedOnLeftGrid = true
    }
    
    // right list mouse handling
    rightPlantListMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int
        
        if (this.justDoubleClickedOnRightGrid) {
            this.justDoubleClickedOnRightGrid = false
            return
        } else {
            this.justDoubleClickedOnRightGrid = false
        }
        if (this.rightManager.plants.Count > 0) {
            if (this.leftOrRight === kLeft) {
                this.selectedPlants.Clear()
                this.lastLeftSingleClickPlantIndex = -1
                this.leftPlantList.Invalidate()
            }
            this.leftOrRight = kRight
            col, row = this.rightPlantList.MouseToCell(X, Y, col, row)
            this.selectPlantAtIndex(Shift, row)
            this.updateForChangeToSelectedPlants()
            this.rightPlantList.BeginDrag(false)
        }
    }
    
    rightPlantListDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null)
        if (Source === this.leftPlantList) {
            Accept = Accept && this.haveRightFile()
        } else {
            Accept = Accept && (Source === Sender)
        }
        return Accept
    }
    
    rightPlantListEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        if ((Target === this.leftPlantList)) {
            this.transferClick(this)
        }
    }
    
    rightPlantListDblClick(Sender: TObject): void {
        this.renameClick(this)
        this.rightPlantList.endDrag(false)
        this.justDoubleClickedOnRightGrid = true
    }
    
    selectPlantAtIndex(Shift: TShiftState, index: int): void {
        let i: short
        let plant: PdPlant
        let manager: PdPlantManager
        let lastSingleClickPlantIndex: int
        let lastRow: int
        let grid: TDrawGrid
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return
        }
        if ((index < 0)) {
            this.selectedPlants.Clear()
            this.redrawSelectedGrid()
            return
        }
        plant = uplant.PdPlant(manager.plants.Items[index])
        if (plant === null) {
            return
        }
        if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
            if (this.selectedPlants.IndexOf(plant) >= 0) {
                this.selectedPlants.Remove(plant)
            } else {
                this.selectedPlants.Add(plant)
            }
        } else if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
            if (this.leftOrRight === kLeft) {
                lastSingleClickPlantIndex = this.lastLeftSingleClickPlantIndex
            } else {
                lastSingleClickPlantIndex = this.lastRightSingleClickPlantIndex
            }
            if ((lastSingleClickPlantIndex >= 0) && (lastSingleClickPlantIndex <= manager.plants.Count - 1) && (lastSingleClickPlantIndex !== index)) {
                if (lastSingleClickPlantIndex < index) {
                    for (i = lastSingleClickPlantIndex; i <= index; i++) {
                        if (this.selectedPlants.IndexOf(manager.plants.Items[i]) < 0) {
                            this.selectedPlants.Add(manager.plants.Items[i])
                        }
                    }
                } else if (lastSingleClickPlantIndex > index) {
                    for (i = lastSingleClickPlantIndex; i >= index; i--) {
                        if (this.selectedPlants.IndexOf(manager.plants.Items[i]) < 0) {
                            this.selectedPlants.Add(manager.plants.Items[i])
                        }
                    }
                }
            }
            // just a click
        } else {
            if (this.selectedPlants.IndexOf(plant) <= 0) {
                this.selectedPlants.Clear()
                this.redrawSelectedGrid()
                this.selectedPlants.Add(plant)
                if (this.leftOrRight === kLeft) {
                    this.lastLeftSingleClickPlantIndex = index
                } else {
                    this.lastRightSingleClickPlantIndex = index
                }
                grid = this.gridForManager(manager)
                if (grid === null) {
                    return
                }
                lastRow = grid.TopRow + grid.VisibleRowCount - 1
                if (index > lastRow) {
                    grid.TopRow = grid.TopRow + (index - lastRow)
                }
                if (index < grid.TopRow) {
                    grid.TopRow = index
                }
            }
        }
        this.redrawSelectedGrid()
    }
    
    leftPlantListKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        Key = this.listKeyDown(Key, Shift)
        return Key
    }
    
    rightPlantListKeyDown(Sender: TObject, Key: byte, shift: TShiftState): void {
        Key = this.listKeyDown(Key, shift)
        return Key
    }
    
    listKeyDown(Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DOWN:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedPlantsDown()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedPlantIndexInManager() + 1)
                }
                break
            case delphi_compatability.VK_RIGHT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedPlantsDown()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedPlantIndexInManager() + 1)
                }
                break
            case delphi_compatability.VK_UP:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedPlantsUp()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedPlantIndexInManager() - 1)
                }
                break
            case delphi_compatability.VK_LEFT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedPlantsUp()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedPlantIndexInManager() - 1)
                }
                break
            case delphi_compatability.VK_RETURN:
                Key = 0
                this.renameClick(this)
                break
        }
        return Key
    }
    
    moveUpOrDownWithKey(indexAfterMove: short): void {
        let manager: PdPlantManager
        
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return
        }
        if (indexAfterMove > manager.plants.Count - 1) {
            // loop around 
            indexAfterMove = 0
        }
        if (indexAfterMove < 0) {
            indexAfterMove = manager.plants.Count - 1
        }
        if ((indexAfterMove >= 0) && (indexAfterMove <= manager.plants.Count - 1)) {
            this.deselectAllPlants()
            //no shift
            this.selectPlantAtIndex({}, indexAfterMove)
            this.drawPreview(this.focusedPlant())
        }
    }
    
    moveSelectedPlantsDown(): void {
        let manager: PdPlantManager
        let i: short
        let plant: PdPlant
        
        if (this.selectedPlants.Count <= 0) {
            return
        }
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return
        }
        if (manager.plants.Count > 1) {
            // start at next to last one because you can't move last one down any more 
            i = manager.plants.Count - 2
            while (i >= 0) {
                plant = uplant.PdPlant(manager.plants.Items[i])
                if (this.selectedPlants.IndexOf(plant) >= 0) {
                    manager.plants.Move(i, i + 1)
                }
                i -= 1
            }
        }
        this.redrawSelectedGrid()
        // reordering makes change flag true
        this.setChangedFlagForPlantManager(true, this.selectedManager(kThisManager))
    }
    
    moveSelectedPlantsUp(): void {
        let manager: PdPlantManager
        let i: short
        let plant: PdPlant
        
        if (this.selectedPlants.Count <= 0) {
            return
        }
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return
        }
        if (manager.plants.Count > 1) {
            // start at 1 because you can't move first one up any more 
            i = 1
            while (i <= manager.plants.Count - 1) {
                plant = uplant.PdPlant(manager.plants.Items[i])
                if (this.selectedPlants.IndexOf(plant) >= 0) {
                    manager.plants.Move(i, i - 1)
                }
                i += 1
            }
        }
        this.redrawSelectedGrid()
        // reordering makes change flag true
        this.setChangedFlagForPlantManager(true, this.selectedManager(kThisManager))
    }
    
    redrawSelectedGrid(): void {
        if (this.leftOrRight === kLeft) {
            this.leftPlantList.Invalidate()
        } else {
            this.rightPlantList.Invalidate()
        }
    }
    
    // -------------------------------------------------------------------------------------------- *updating 
    updateForNewFile(newFileName: string, manager: PdPlantManager): void {
        this.clearCommandList()
        this.setFileNameForManager(newFileName, manager)
        this.updatePlantListForManager(manager)
        this.setChangedFlagForPlantManager(false, manager)
        this.deselectAllPlants()
        if (newFileName !== "") {
            if (manager === this.leftManager) {
                this.leftOrRight = kLeft
            } else {
                this.leftOrRight = kRight
            }
        }
        this.updateForChangeToSelectedPlants()
    }
    
    deselectAllPlants(): void {
        this.selectedPlants.Clear()
        this.redrawSelectedGrid()
    }
    
    updatePasteButtonForClipboardContents(): void {
        this.paste.Enabled = (udomain.domain.plantManager.privatePlantClipboard.Count > 0)
    }
    
    leftRightString(leftString: string, rightString: string): string {
        let result = ""
        if (this.leftOrRight === kLeft) {
            result = leftString
        } else {
            result = rightString
        }
        return result
    }
    
    updateForChangeToSelectedPlants(): void {
        let atLeastOnePlantSelected: boolean
        let atLeastOneFile: boolean
        
        this.leftPlantList.Invalidate()
        this.rightPlantList.Invalidate()
        if (this.leftOrRight === kLeft) {
            if (this.haveLeftFile()) {
                this.leftOpenClose.Caption = "&Close"
            } else {
                this.leftOpenClose.Caption = "&Open..."
            }
            this.leftPlantFileNameEdit.Color = delphi_compatability.clAqua
            this.leftPlantFileNameEdit.Refresh()
            this.rightPlantFileNameEdit.Color = UNRESOLVED.clBtnFace
            this.rightPlantFileNameEdit.Refresh()
            this.drawPreview(this.focusedPlant())
        } else {
            if (this.haveRightFile()) {
                this.rightOpenClose.Caption = "&Close"
            } else {
                this.rightOpenClose.Caption = "&Open..."
            }
            this.leftPlantFileNameEdit.Color = UNRESOLVED.clBtnFace
            this.leftPlantFileNameEdit.Refresh()
            this.rightPlantFileNameEdit.Color = delphi_compatability.clAqua
            this.rightPlantFileNameEdit.Refresh()
            this.drawPreview(this.focusedPlant())
        }
        atLeastOneFile = this.haveLeftFile() || this.haveRightFile()
        atLeastOnePlantSelected = (this.selectedPlants.Count > 0)
        this.transfer.Enabled = this.haveLeftFile() && this.haveRightFile() && atLeastOnePlantSelected
        this.transfer.Caption = this.leftRightString("&Transfer >>", "<< &Transfer")
        this.cut.Enabled = atLeastOneFile && atLeastOnePlantSelected
        this.copy.Enabled = atLeastOneFile && atLeastOnePlantSelected
        this.duplicate.Enabled = atLeastOneFile && atLeastOnePlantSelected
        this.delete.Enabled = atLeastOneFile && atLeastOnePlantSelected
        this.rename.Enabled = atLeastOneFile && atLeastOnePlantSelected
    }
    
    updateButtonsForUndoRedo(): void {
        if (this.commandList.isUndoEnabled()) {
            this.undo.Enabled = true
            this.undo.Caption = "Undo " + this.commandList.undoDescription()
        } else {
            this.undo.Enabled = false
            this.undo.Caption = "Can't undo"
        }
        if (this.commandList.isRedoEnabled()) {
            this.redo.Enabled = true
            this.redo.Caption = "Redo " + this.commandList.redoDescription()
        } else {
            this.redo.Enabled = false
            this.redo.Caption = "Can't redo"
        }
    }
    
    updatePlantListForManager(manager: PdPlantManager): void {
        let grid: TDrawGrid
        
        grid = this.gridForManager(manager)
        if (grid === null) {
            return
        }
        grid.RowCount = manager.plants.Count
        grid.Invalidate()
    }
    
    drawPreview(plant: PdPlant): void {
        if (plant === null) {
            this.previewImage.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            this.previewImage.Canvas.Brush.Color = delphi_compatability.clWindow
        } else {
            if (!plant.previewCacheUpToDate) {
                try {
                    ucursor.cursor_startWait()
                    plant.drawPreviewIntoCache(Point(this.previewImage.Width, this.previewImage.Height), uplant.kDontConsiderDomainScale, umain.kDrawNow)
                } finally {
                    ucursor.cursor_stopWait()
                }
            }
            plant.previewCache.Transparent = false
            ubmpsupport.copyBitmapToCanvasWithGlobalPalette(plant.previewCache, this.previewImage.Canvas, Rect(0, 0, 0, 0))
            UNRESOLVED.realizePalette(this.previewImage.Canvas.Handle)
            this.previewImage.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        }
        this.previewImage.Canvas.Pen.Color = UNRESOLVED.clBtnText
        this.previewImage.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.previewImage.Canvas.Rectangle(0, 0, this.previewImage.Width, this.previewImage.Height)
    }
    
    // ------------------------------------------------------------------------------------------ *selecting 
    focusedPlant(): PdPlant {
        let result = new PdPlant()
        result = null
        if (this.selectedPlants.Count > 0) {
            result = uplant.PdPlant(this.selectedPlants.Items[0])
        }
        return result
    }
    
    focusedPlantIndexInManager(): short {
        let result = 0
        let manager: PdPlantManager
        
        result = -1
        manager = this.selectedManager(kThisManager)
        if (manager === null) {
            return result
        }
        if (this.selectedPlants.Count > 0) {
            result = manager.plants.IndexOf(this.selectedPlants.Items[0])
        }
        return result
    }
    
    haveLeftFile(): boolean {
        let result = false
        result = len(this.leftPlantFileName) !== 0
        return result
    }
    
    haveRightFile(): boolean {
        let result = false
        result = len(this.rightPlantFileName) !== 0
        return result
    }
    
    selectedManager(thisManager: boolean): PdPlantManager {
        let result = new PdPlantManager()
        result = null
        if (this.leftOrRight === kLeft) {
            if (thisManager) {
                result = this.leftManager
            } else {
                result = this.rightManager
            }
        } else {
            if (thisManager) {
                result = this.rightManager
            } else {
                result = this.leftManager
            }
        }
        return result
    }
    
    getFileNameForManager(manager: PdPlantManager): string {
        let result = ""
        if (manager === this.leftManager) {
            result = this.leftPlantFileName
        } else {
            result = this.rightPlantFileName
        }
        return result
    }
    
    getFileNameForOtherManager(manager: PdPlantManager): string {
        let result = ""
        if (manager === this.rightManager) {
            result = this.leftPlantFileName
        } else {
            result = this.rightPlantFileName
        }
        return result
    }
    
    setFileNameForManager(newName: string, manager: PdPlantManager): void {
        if (manager === this.leftManager) {
            this.leftPlantFileName = newName
            this.leftPlantFileNameEdit.Text = newName
            this.leftPlantFileNameEdit.SelStart = len(newName)
        } else {
            this.rightPlantFileName = newName
            this.rightPlantFileNameEdit.Text = newName
            this.rightPlantFileNameEdit.SelStart = len(newName)
        }
    }
    
    gridForManager(manager: PdPlantManager): TDrawGrid {
        let result = new TDrawGrid()
        result = null
        if (manager === this.leftManager) {
            result = this.leftPlantList
        } else if (manager === this.rightManager) {
            result = this.rightPlantList
        }
        return result
    }
    
    managerHasChanged(manager: PdPlantManager): boolean {
        let result = false
        if (manager === this.leftManager) {
            result = this.leftPlantFileChanged
        } else {
            result = this.rightPlantFileChanged
        }
        return result
    }
    
    setChangedFlagForPlantManager(value: boolean, manager: PdPlantManager): void {
        if (manager === this.leftManager) {
            this.leftPlantFileChanged = value
            if (this.leftPlantFileChanged) {
                this.leftPlantFileChangedIndicator.Picture = umain.MainForm.fileChangedImage.Picture
            } else {
                this.leftPlantFileChangedIndicator.Picture = umain.MainForm.fileNotChangedImage.Picture
            }
        } else {
            this.rightPlantFileChanged = value
            if (this.rightPlantFileChanged) {
                this.rightPlantFileChangedIndicator.Picture = umain.MainForm.fileChangedImage.Picture
            } else {
                this.rightPlantFileChangedIndicator.Picture = umain.MainForm.fileNotChangedImage.Picture
            }
        }
    }
    
    // ------------------------------------------------------------------------------------------- *copying 
    copyPlantToPlantManager(plant: PdPlant, toPlantManager: PdPlantManager): PdPlant {
        let result = new PdPlant()
        if (plant === null) {
            result = null
        } else {
            result = toPlantManager.copyFromPlant(plant)
        }
        return result
    }
    
    copySelectedPlantsToClipboard(): void {
        if (this.selectedPlants.Count <= 0) {
            return
        }
        udomain.domain.plantManager.copyPlantsInListToPrivatePlantClipboard(this.selectedPlants)
        this.updatePasteButtonForClipboardContents()
    }
    
    // ------------------------------------------------------------------------ *opening, closing and saving 
    openPlantFileForManager(manager: PdPlantManager, fileNameToStart: string): void {
        let fileNameWithPath: string
        
        if (!this.askToSaveManagerAndProceed(manager)) {
            return
        }
        if (fileNameToStart === "") {
            fileNameWithPath = usupport.getFileOpenInfo(usupport.kFileTypePlant, usupport.kNoSuggestedFile, "Choose a plant file")
        } else {
            fileNameWithPath = fileNameToStart
        }
        if (fileNameWithPath === "") {
            this.updateForNewFile(fileNameWithPath, manager)
        } else {
            if (fileNameWithPath === this.getFileNameForOtherManager(manager)) {
                ShowMessage("The file you chose is already open on the other side.")
                return
            }
            try {
                ucursor.cursor_startWait()
                if (FileExists(fileNameWithPath)) {
                    manager.loadPlantsFromFile(fileNameWithPath, udomain.kInPlantMover)
                } else {
                    this.newPlantFileForManager(manager)
                }
                // PDF PORT -- added semicolon
                this.updateForNewFile(fileNameWithPath, manager)
            } finally {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    closePlantFileForManager(manager: PdPlantManager): void {
        if (!this.askToSaveManagerAndProceed(manager)) {
            return
        }
        manager.plants.clear()
        this.updateForNewFile("", manager)
    }
    
    newPlantFileForManager(manager: PdPlantManager): void {
        if (!this.askToSaveManagerAndProceed(manager)) {
            return
        }
        manager.plants.clear()
        this.updateForNewFile(kNewPlantFileName, manager)
    }
    
    managerSaveOrSaveAs(manager: PdPlantManager, askForFileName: boolean): void {
        let fileInfo: SaveFileNamesStructure
        let fileName: string
        let askForFileNameConsideringUntitled: boolean
        
        fileName = this.getFileNameForManager(manager)
        if (fileName === kNewPlantFileName) {
            askForFileNameConsideringUntitled = true
        } else {
            askForFileNameConsideringUntitled = askForFileName
        }
        if (!usupport.getFileSaveInfo(usupport.kFileTypePlant, askForFileNameConsideringUntitled, fileName, fileInfo)) {
            return
        }
        try {
            ucursor.cursor_startWait()
            manager.savePlantsToFile(fileInfo.tempFile, udomain.kInPlantMover)
            fileInfo.writingWasSuccessful = true
        } finally {
            ucursor.cursor_stopWait()
            usupport.cleanUpAfterFileSave(fileInfo)
            this.updateForNewFile(kNewPlantFileName, manager)
            if ((fileInfo.newFile === udomain.domain.plantFileName)) {
                this.changedCurrentPlantFile = true
            }
            if ((fileName === kNewPlantFileName) && (udomain.domain.plantFileName === kNewPlantFileName)) {
                // deal with case of: started mover with untitled file, changed file, returned
                this.changedCurrentPlantFile = true
                this.untitledDomainFileSavedAs = fileInfo.newFile
            }
        }
    }
    
    askToSaveManagerAndProceed(manager: PdPlantManager): boolean {
        let result = false
        let response: byte
        let prompt: string
        
        // returns false if user cancelled action 
        result = true
        if (!this.managerHasChanged(manager)) {
            return result
        }
        prompt = "Save changes to " + ExtractFileName(this.getFileNameForManager(manager)) + "?"
        response = MessageDialog(prompt, mtConfirmation, mbYesNoCancel, 0)
        switch (response) {
            case mrYes:
                this.managerSaveOrSaveAs(manager, usupport.kDontAskForFileName)
                break
            case mrNo:
                result = true
                break
            case mrCancel:
                result = false
                break
        }
        return result
    }
    
    // ------------------------------------------------------------------------------------------ *resizing 
    FormResize(Sender: TObject): void {
        let midWidth: short
        let listBoxWidth: short
        let listBoxTop: short
        let openCloseTop: short
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.leftManager === null) {
            return
        }
        if (this.rightManager === null) {
            return
        }
        if (this.selectedPlants === null) {
            return
        }
        midWidth = this.ClientWidth / 2
        //same as right
        listBoxWidth = this.leftPlantList.Width
        listBoxTop = kBetweenGap + this.leftPlantFileNameEdit.Height + kBetweenGap + this.leftOpenClose.Height + kBetweenGap
        // list boxes 
        this.leftPlantList.SetBounds(kBetweenGap, listBoxTop, listBoxWidth, umath.intMax(0, this.ClientHeight - listBoxTop - kBetweenGap))
        this.leftPlantList.DefaultColWidth = this.leftPlantList.ClientWidth
        this.rightPlantList.SetBounds(umath.intMax(0, this.ClientWidth - listBoxWidth - kBetweenGap), listBoxTop, listBoxWidth, umath.intMax(0, this.ClientHeight - listBoxTop - kBetweenGap))
        this.rightPlantList.DefaultColWidth = this.rightPlantList.ClientWidth
        // edits and buttons at top 
        this.leftPlantFileNameEdit.SetBounds(kBetweenGap, kBetweenGap, listBoxWidth - kBetweenGap * 2, this.leftPlantFileNameEdit.Height)
        this.leftPlantFileChangedIndicator.SetBounds(kBetweenGap, this.leftPlantFileNameEdit.Top + this.leftPlantFileNameEdit.Height + kBetweenGap, this.leftPlantFileChangedIndicator.Width, this.leftPlantFileChangedIndicator.Height)
        this.rightPlantFileNameEdit.SetBounds(this.rightPlantList.Left, kBetweenGap, listBoxWidth - kBetweenGap * 2, this.rightPlantFileNameEdit.Height)
        this.rightPlantFileChangedIndicator.SetBounds(this.rightPlantList.Left, this.rightPlantFileNameEdit.Top + this.rightPlantFileNameEdit.Height + kBetweenGap, this.rightPlantFileChangedIndicator.Width, this.rightPlantFileChangedIndicator.Height)
        openCloseTop = this.leftPlantFileNameEdit.Top + this.leftPlantFileNameEdit.Height + kBetweenGap
        this.leftOpenClose.SetBounds(this.leftPlantFileChangedIndicator.Left + this.leftPlantFileChangedIndicator.Width + kBetweenGap, openCloseTop, this.leftOpenClose.Width, this.leftOpenClose.Height)
        this.rightOpenClose.SetBounds(this.rightPlantFileChangedIndicator.Left + this.rightPlantFileChangedIndicator.Width + kBetweenGap, openCloseTop, this.rightOpenClose.Width, this.rightOpenClose.Height)
        this.newFile.SetBounds(this.rightOpenClose.Left + this.rightOpenClose.Width + kBetweenGap, openCloseTop, this.newFile.Width, this.newFile.Height)
        // buttons in middle 
        this.close.SetBounds(midWidth - this.close.Width / 2, umath.intMax(0, this.ClientHeight - this.close.Height - kBetweenGap), this.close.Width, this.close.Height)
        this.helpButton.SetBounds(this.close.Left, umath.intMax(0, this.close.Top - this.helpButton.Height - kBetweenGap), this.helpButton.Width, this.helpButton.Height)
        this.redo.SetBounds(this.close.Left, umath.intMax(0, this.helpButton.Top - this.redo.Height - kBetweenGap), this.redo.Width, this.redo.Height)
        this.undo.SetBounds(this.close.Left, umath.intMax(0, this.redo.Top - this.undo.Height - kBetweenGap), this.undo.Width, this.undo.Height)
        this.rename.SetBounds(this.close.Left, umath.intMax(0, this.undo.Top - this.rename.Height - kBetweenGap), this.rename.Width, this.rename.Height)
        this.delete.SetBounds(this.close.Left, umath.intMax(0, this.rename.Top - this.delete.Height - kBetweenGap), this.delete.Width, this.delete.Height)
        this.duplicate.SetBounds(this.close.Left, umath.intMax(0, this.delete.Top - this.duplicate.Height - kBetweenGap), this.duplicate.Width, this.duplicate.Height)
        this.paste.SetBounds(this.close.Left, umath.intMax(0, this.duplicate.Top - this.paste.Height - kBetweenGap), this.paste.Width, this.paste.Height)
        this.copy.SetBounds(this.close.Left, umath.intMax(0, this.paste.Top - this.copy.Height - kBetweenGap), this.copy.Width, this.copy.Height)
        this.cut.SetBounds(this.close.Left, umath.intMax(0, this.copy.Top - this.cut.Height - kBetweenGap), this.cut.Width, this.cut.Height)
        this.transfer.SetBounds(this.close.Left, umath.intMax(0, this.cut.Top - this.transfer.Height - kBetweenGap), this.transfer.Width, this.transfer.Height)
        this.previewImage.SetBounds(listBoxWidth + kBetweenGap * 2, kBetweenGap, umath.intMax(0, this.ClientWidth - listBoxWidth * 2 - kBetweenGap * 4), this.transfer.Top - kBetweenGap * 2)
        this.resizePreviewImage()
    }
    
    resizePreviewImage(): void {
        let i: short
        let manager: PdPlantManager
        
        try {
            this.previewImage.Picture.Bitmap.Height = this.previewImage.Height
            this.previewImage.Picture.Bitmap.Width = this.previewImage.Width
        } catch (e) {
            this.previewImage.Picture.Bitmap.Height = 1
            this.previewImage.Picture.Bitmap.Width = 1
        }
        // must invalidate preview cache for both sets of plants
        manager = this.selectedManager(kThisManager)
        if (manager.plants.Count > 0) {
            for (i = 0; i <= manager.plants.Count - 1; i++) {
                uplant.PdPlant(manager.plants.Items[i]).previewCacheUpToDate = false
            }
        }
        manager = this.selectedManager(kOtherManager)
        if (manager.plants.Count > 0) {
            for (i = 0; i <= manager.plants.Count - 1; i++) {
                uplant.PdPlant(manager.plants.Items[i]).previewCacheUpToDate = false
            }
        }
        this.drawPreview(this.focusedPlant())
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 400
        UNRESOLVED.ptMinTrackSize.y = 420
    }
    
    // ----------------------------------------------------------------------------------------- command list 
    clearCommandList(): void {
        this.commandList.free
        this.commandList = null
        this.commandList = ucommand.PdCommandList().create()
        this.updateButtonsForUndoRedo()
    }
    
    doCommand(command: PdCommand): void {
        this.commandList.doCommand(command)
        this.updateButtonsForUndoRedo()
        this.updateForChangeToSelectedPlants()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Using_the_plant_mover")
    }
    
}

export class PdMoverRenameCommand {
    plant: PdPlant = new PdPlant()
    oldName: string = ""
    newName: string = ""
    manager: PdPlantManager = new PdPlantManager()
    managerChangedBeforeCommand: boolean = false
    PdMoverRenameCommand.prototype = new PdCommand()
    PdMoverRenameCommand.prototype.constructor = PdMoverRenameCommand
    
    // ------------------------------------------------------------------------------ *commands 
    // ------------------------------------------------------------------- PdMoverRenameCommand 
    createWithPlantNewNameAndManager(aPlant: PdPlant, aNewName: string, aManager: PdPlantManager): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.plant = aPlant
        this.oldName = this.plant.getName()
        this.newName = aNewName
        this.manager = aManager
        this.managerChangedBeforeCommand = MoverForm.managerHasChanged(this.manager)
    }
    
    doCommand(): void {
        //not redo
        PdCommand.prototype.doCommand.call(this)
        this.plant.setName(this.newName)
        MoverForm.setChangedFlagForPlantManager(true, this.manager)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        this.plant.setName(this.oldName)
        MoverForm.setChangedFlagForPlantManager(this.managerChangedBeforeCommand, this.manager)
    }
    
    description(): string {
        let result = ""
        result = "rename"
        return result
    }
    
}

//use for cut and delete
export class PdMoverRemoveCommand {
    removedPlants: TList = new TList()
    copyToClipboard: boolean = false
    manager: PdPlantManager = new PdPlantManager()
    managerChangedBeforeCommand: boolean = false
    PdMoverRemoveCommand.prototype = new PdCommandWithListOfPlants()
    PdMoverRemoveCommand.prototype.constructor = PdMoverRemoveCommand
    
    // ----------------------------------------------------------------------- PdMoverRemoveCommand 
    createWithListOfPlantsManagerAndClipboardFlag(aList: TList, aManager: PdPlantManager, aCopyToClipboard: boolean): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.commandChangesPlantFile = false
        this.manager = aManager
        this.managerChangedBeforeCommand = MoverForm.managerHasChanged(this.manager)
        this.copyToClipboard = aCopyToClipboard
        this.removedPlants = delphi_compatability.TList().Create()
    }
    
    destroy(): void {
        let i: short
        
        if ((this.done) && (this.removedPlants !== null) && (this.removedPlants.Count > 0)) {
            for (i = 0; i <= this.removedPlants.Count - 1; i++) {
                // free copies of cut plants if change was done 
                this.plant = uplant.PdPlant(this.removedPlants.Items[i])
                this.plant.free
            }
        }
        this.removedPlants.free
        this.removedPlants = null
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count <= 0) {
            return
        }
        if (this.copyToClipboard) {
            // copy plants 
            MoverForm.copySelectedPlantsToClipboard()
        }
        // save copy of plants before deleting 
        this.removedPlants.Clear()
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            // don't remove plants from manager until all indexes have been recorded 
            this.plant = uplant.PdPlant(this.plantList.Items[i])
            this.removedPlants.Add(this.plant)
            this.plant.indexWhenRemoved = this.manager.plants.IndexOf(this.plant)
            this.plant.selectedIndexWhenRemoved = MoverForm.selectedPlants.IndexOf(this.plant)
        }
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            this.manager.plants.Remove(uplant.PdPlant(this.plantList.Items[i]))
        }
        for (i = 0; i <= this.plantList.Count - 1; i++) {
            MoverForm.selectedPlants.Remove(uplant.PdPlant(this.plantList.Items[i]))
        }
        MoverForm.updatePlantListForManager(this.manager)
        MoverForm.setChangedFlagForPlantManager(true, this.manager)
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (this.removedPlants.Count > 0) {
            for (i = 0; i <= this.removedPlants.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.removedPlants.Items[i])
                if ((this.plant.indexWhenRemoved >= 0) && (this.plant.indexWhenRemoved <= this.manager.plants.Count - 1)) {
                    this.manager.plants.Insert(this.plant.indexWhenRemoved, this.plant)
                } else {
                    this.manager.plants.Add(this.plant)
                }
                if ((this.plant.selectedIndexWhenRemoved >= 0) && (this.plant.selectedIndexWhenRemoved <= MoverForm.selectedPlants.Count - 1)) {
                    // all removed plants must have been selected, so also add them to the selected list 
                    MoverForm.selectedPlants.Insert(this.plant.selectedIndexWhenRemoved, this.plant)
                } else {
                    MoverForm.selectedPlants.Add(this.plant)
                }
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(this.managerChangedBeforeCommand, this.manager)
        }
    }
    
    description(): string {
        let result = ""
        if (this.copyToClipboard) {
            result = "cut"
        } else {
            result = "delete"
        }
        return result
    }
    
}

//use for transfer and paste
export class PdMoverPasteCommand {
    isTransfer: boolean = false
    manager: PdPlantManager = new PdPlantManager()
    managerChangedBeforeCommand: boolean = false
    PdMoverPasteCommand.prototype = new PdCommandWithListOfPlants()
    PdMoverPasteCommand.prototype.constructor = PdMoverPasteCommand
    
    // ------------------------------------------------------------------ PdMoverPasteCommand 
    createWithListOfPlantsAndManager(aList: TList, aManager: PdPlantManager): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.commandChangesPlantFile = false
        this.manager = aManager
        this.managerChangedBeforeCommand = MoverForm.managerHasChanged(this.manager)
    }
    
    destroy(): void {
        let i: short
        
        if ((!this.done) && (this.plantList !== null) && (this.plantList.Count > 0)) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                // free copies of pasted plants if change was undone 
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.plant.free
            }
        }
        //will free plantList
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count > 0) {
            MoverForm.deselectAllPlants()
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.manager.plants.Add(this.plant)
                MoverForm.selectedPlants.Add(this.plant)
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(true, this.manager)
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (this.plantList.Count > 0) {
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                this.manager.plants.Remove(this.plant)
                MoverForm.selectedPlants.Remove(this.plant)
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(this.managerChangedBeforeCommand, this.manager)
        }
    }
    
    description(): string {
        let result = ""
        if (this.isTransfer) {
            result = "transfer"
        } else {
            result = "paste"
        }
        return result
    }
    
}

export class PdMoverDuplicateCommand {
    newPlants: TList = new TList()
    manager: PdPlantManager = new PdPlantManager()
    managerChangedBeforeCommand: boolean = false
    PdMoverDuplicateCommand.prototype = new PdCommandWithListOfPlants()
    PdMoverDuplicateCommand.prototype.constructor = PdMoverDuplicateCommand
    
    // ------------------------------------------------------------------------------ PdMoverDuplicateCommand 
    createWithListOfPlantsAndManager(aList: TList, aManager: PdPlantManager): void {
        PdCommandWithListOfPlants.prototype.createWithListOfPlants.call(this, aList)
        this.commandChangesPlantFile = false
        this.newPlants = delphi_compatability.TList().Create()
        this.manager = aManager
        this.managerChangedBeforeCommand = MoverForm.managerHasChanged(this.manager)
    }
    
    destroy(): void {
        let i: short
        
        if ((!this.done) && (this.newPlants !== null) && (this.newPlants.Count > 0)) {
            for (i = 0; i <= this.newPlants.Count - 1; i++) {
                // free copies of created plants if change was undone 
                this.plant = uplant.PdPlant(this.newPlants.Items[i])
                this.plant.free
            }
        }
        this.newPlants.free
        this.newPlants = null
        //will free plantList
        PdCommandWithListOfPlants.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        let plantCopy: PdPlant
        
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.plantList.Count > 0) {
            MoverForm.deselectAllPlants()
            for (i = 0; i <= this.plantList.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.plantList.Items[i])
                plantCopy = uplant.PdPlant().create()
                this.plant.copyTo(plantCopy)
                plantCopy.setName("Copy of " + plantCopy.getName())
                this.newPlants.Add(plantCopy)
                this.manager.plants.Add(plantCopy)
                MoverForm.selectedPlants.Add(plantCopy)
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(true, this.manager)
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfPlants.prototype.undoCommand.call(this)
        if (this.newPlants.Count > 0) {
            for (i = 0; i <= this.newPlants.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.newPlants.Items[i])
                this.manager.plants.Remove(this.plant)
                MoverForm.selectedPlants.Remove(this.plant)
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(this.managerChangedBeforeCommand, this.manager)
        }
    }
    
    redoCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfPlants.prototype.doCommand.call(this)
        if (this.newPlants.Count > 0) {
            MoverForm.deselectAllPlants()
            for (i = 0; i <= this.newPlants.Count - 1; i++) {
                this.plant = uplant.PdPlant(this.newPlants.Items[i])
                this.manager.plants.Add(this.plant)
                MoverForm.selectedPlants.Add(this.plant)
            }
            MoverForm.updatePlantListForManager(this.manager)
            MoverForm.setChangedFlagForPlantManager(true, this.manager)
        }
    }
    
    description(): string {
        let result = ""
        result = "duplicate"
        return result
    }
    
}

// tried this - big mess
//procedure TMoverForm.drawDragItemLine(listBox: TListBox; y: integer);
//  begin
//  if listBox = leftPlantList then
//    begin
//    leftDragItemLastDrawY := y;
//    self.drawOrUndrawDragItemLine(listBox, y);
//    self.leftDragItemLineNeedToRedraw := true;
//    end
//  else
//    begin
//    rightDragItemLastDrawY := y;
//    self.drawOrUndrawDragItemLine(listBox, y);
//    self.rightDragItemLineNeedToRedraw := true;
//    end;
//  end;
//
//procedure TMoverForm.undrawDragItemLine(listBox: TListBox);
//  begin
//  if listBox = leftPlantList then
//    begin
//    if not leftDragItemLineNeedToRedraw then exit;
//    self.drawOrUndrawDragItemLine(listBox, leftDragItemLastDrawY);
//    self.leftDragItemLineNeedToRedraw := false;
//    end
//  else
//    begin
//    if not rightDragItemLineNeedToRedraw then exit;
//    self.drawOrUndrawDragItemLine(listBox, rightDragItemLastDrawY);
//    self.rightDragItemLineNeedToRedraw := false;
//    end;
//  end;
//
//procedure TMoverForm.drawOrUndrawDragItemLine(listBox: TListBox; y: integer);
//  var
//    theDC: HDC;
//    drawRect: TRect;
//  begin
//  theDC := getDC(0);
//  with drawRect do
//    begin
//    left := self.clientOrigin.x + listBox.left;
//    right := self.clientOrigin.x + listBox.left + listBox.width;
//    top := self.clientOrigin.y + listBox.top + y;
//    end;
//  with drawRect do
//    patBlt(theDC, left, top, right - left, 1, dstInvert);
//  releaseDC(0, theDC);
//  end;
//
//{ -------------------------------------------------------------------------------------------- *up and down }
//procedure TMoverForm.moveItemsUpOrDown(listBox: TListBox; y: integer);
//  var
//    rows, i: integer;
//  begin
//  if self.dragItemsY <> 0 then
//    begin
//    rows := abs(y - self.dragItemsY) div listBox.itemHeight;
//    if rows > 0 then
//      begin
//      if (y - self.dragItemsY) > 0 then
//        for i := 0 to rows - 1 do self.moveItemsDown(listBox)
//      else
//        for i := 0 to rows - 1 do self.moveItemsUp(listBox);
//      end;
//    self.dragItemsY := y;
//    end;
//  end;
//
//procedure TMoverForm.moveItemsDown(listBox: TListBox);
//  var
//    i: integer;
//  begin
//  if listBox.items.count > 1 then
//    begin
//    i := listBox.items.count - 2;  { start at next to last one because you can't move last one down any more }
//    while i >= 0 do
//      begin
//      if listBox.selected[i] then
//        begin
//        listBox.items.move(i, i + 1);
//        listBox.selected[i+1] := true;
//        end;
//      dec(i);
//      end;
//    end;
//  end;
//
//procedure TMoverForm.moveItemsUp(listBox: TListBox);
//  var
//    i: integer;
//  begin
//  if listBox.items.count > 1 then
//    begin
//    i := 1;  { start at 1 because you can't move first one up any more }
//    while i <= listBox.items.count - 1 do
//      begin
//      if listBox.selected[i] then
//        begin
//        listBox.items.move(i, i - 1);
//        listBox.selected[i-1] := true;
//        end;
//      inc(i);
//      end;
//    end;
//  end;
//
//
