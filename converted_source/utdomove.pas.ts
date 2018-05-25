// unit utdomove

from conversion_common import *
import utdoedit
import uturtle
import umath
import usupport
import ucursor
import umain
import udomain
import ucollect
import updform
import updcom
import ucommand
import utdo
import uplantmn
import delphi_compatability

// const
const kLeft = 0
const kRight = 1
const kNewTdoFileName = "untitled.tdo"
const kThisList = true
const kOtherList = false


// var
let TdoMoverForm: TTdoMoverForm


// const
const kBetweenGap = 4



export class TTdoMoverForm {
    leftTdoFileNameEdit: TEdit = new TEdit()
    leftOpenClose: TButton = new TButton()
    rightTdoFileNameEdit: TEdit = new TEdit()
    rightOpenClose: TButton = new TButton()
    newFile: TButton = new TButton()
    transfer: TButton = new TButton()
    close: TButton = new TButton()
    previewImage: TImage = new TImage()
    undo: TButton = new TButton()
    redo: TButton = new TButton()
    rename: TButton = new TButton()
    duplicate: TButton = new TButton()
    delete: TButton = new TButton()
    leftTdoFileChangedIndicator: TImage = new TImage()
    rightTdoFileChangedIndicator: TImage = new TImage()
    leftTdoList: TDrawGrid = new TDrawGrid()
    rightTdoList: TDrawGrid = new TDrawGrid()
    editTdo: TButton = new TButton()
    helpButton: TSpeedButton = new TSpeedButton()
    leftTdoFileName: string = ""
    rightTdoFileName: string = ""
    leftList: TListCollection = new TListCollection()
    rightList: TListCollection = new TListCollection()
    leftTdoFileChanged: boolean = false
    rightTdoFileChanged: boolean = false
    lastLeftSingleClickTdoIndex: int = 0
    lastRightSingleClickTdoIndex: int = 0
    leftOrRight: short = 0
    commandList: PdCommandList = new PdCommandList()
    selectedTdos: TList = new TList()
    dragItemsY: int = 0
    justDoubleClickedOnLeftGrid: boolean = false
    justDoubleClickedOnRightGrid: boolean = false
    TTdoMoverForm.prototype = new PdForm()
    TTdoMoverForm.prototype.constructor = TTdoMoverForm
    
    //$R *.DFM
    // -------------------------------------------------------------------------------------------- *creation/destruction 
    create(AOwner: TComponent): void {
        PdForm.prototype.create.call(this, AOwner)
        TdoMoverForm = this
        this.leftList = ucollect.TListCollection().Create()
        this.rightList = ucollect.TListCollection().Create()
        this.commandList = ucommand.PdCommandList().create()
        this.selectedTdos = delphi_compatability.TList().Create()
        this.commandList.setNewUndoLimit(udomain.domain.options.undoLimit)
        this.commandList.setNewObjectUndoLimit(udomain.domain.options.undoLimitOfPlants)
        this.updateButtonsForUndoRedo()
        if (len(udomain.domain.defaultTdoLibraryFileName) > 0) {
            // load current tdo file into left side to start 
            this.openTdoFileForList(this.leftList, udomain.domain.defaultTdoLibraryFileName)
        } else {
            this.closeTdoFileForList(this.leftList)
        }
        // right side is empty to start 
        this.closeTdoFileForList(this.rightList)
    }
    
    FormCreate(Sender: TObject): void {
        this.leftTdoList.DragCursor = ucursor.crDragTdo
        this.rightTdoList.DragCursor = ucursor.crDragTdo
    }
    
    destroy(): void {
        this.leftList.free
        this.leftList = null
        this.rightList.free
        this.rightList = null
        this.selectedTdos.free
        this.selectedTdos = null
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
        if (!this.askToSaveListAndProceed(this.leftList)) {
            return
        }
        if (!this.askToSaveListAndProceed(this.rightList)) {
            return
        }
        Action = delphi_compatability.TCloseAction.caFree
    }
    
    FormKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DELETE:
                this.deleteClick(this)
                break
        if (!(delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
            return Key
        }
        switch (String.fromCharCode(Key)) {
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
        return Key
    }
    
    // ----------------------------------------------------------------------------------------- *buttons 
    undoClick(Sender: TObject): void {
        this.commandList.undoLast()
        this.updateButtonsForUndoRedo()
        this.updateForChangeToSelectedTdos()
    }
    
    redoClick(Sender: TObject): void {
        this.commandList.redoLast()
        this.updateButtonsForUndoRedo()
        this.updateForChangeToSelectedTdos()
    }
    
    closeClick(Sender: TObject): void {
        if (!this.askToSaveListAndProceed(this.leftList)) {
            return
        }
        if (!this.askToSaveListAndProceed(this.rightList)) {
            return
        }
        // cannot cancel 
        this.ModalResult = mrOK
    }
    
    leftOpenCloseClick(Sender: TObject): void {
        if (this.haveLeftFile()) {
            //file open
            //no file
            this.closeTdoFileForList(this.leftList)
        } else {
            this.openTdoFileForList(this.leftList, "")
        }
    }
    
    rightOpenCloseClick(Sender: TObject): void {
        if (this.haveRightFile()) {
            //file open
            //no file
            this.closeTdoFileForList(this.rightList)
        } else {
            this.openTdoFileForList(this.rightList, "")
        }
    }
    
    newFileClick(Sender: TObject): void {
        this.newTdoFileForList(this.rightList)
    }
    
    transferClick(Sender: TObject): void {
        let list: TListCollection
        let otherList: TListCollection
        let newCommand: PdCommand
        let newTdos: TList
        let tdo: KfObject3D
        let newTdo: KfObject3D
        let i: short
        
        list = this.selectedList(kThisList)
        otherList = this.selectedList(kOtherList)
        if ((list === null) || (otherList === null) || (this.selectedTdos.Count <= 0)) {
            return
        }
        if (this.selectedTdos.Count > 0) {
            //command will free
            newTdos = delphi_compatability.TList().Create()
            for (i = 0; i <= this.selectedTdos.Count - 1; i++) {
                tdo = utdo.KfObject3D(this.selectedTdos.Items[i])
                newTdo = utdo.KfObject3D().create()
                tdo.copyTo(newTdo)
                newTdos.Add(newTdo)
            }
            newCommand = PdTdoMoverTransferCommand().createWithSelectedTdosAndList(newTdos, otherList)
            this.doCommand(newCommand)
            //command has its own list, so we need to free this one
            newTdos.free
        }
    }
    
    duplicateClick(Sender: TObject): void {
        let list: TListCollection
        let newCommand: PdCommand
        
        list = this.selectedList(kThisList)
        if ((list === null) || (this.selectedTdos.Count <= 0)) {
            return
        }
        newCommand = PdTdoMoverDuplicateCommand().createWithSelectedTdosAndList(this.selectedTdos, list)
        this.doCommand(newCommand)
    }
    
    renameClick(Sender: TObject): void {
        let tdo: KfObject3D
        let list: TListCollection
        let newName: ansistring
        let newCommand: PdCommand
        
        // can only rename one tdo at a time 
        list = this.selectedList(kThisList)
        tdo = this.focusedTdo()
        if ((tdo === null) || (list === null)) {
            return
        }
        newName = tdo.getName()
        if (!InputQuery("Enter new name", "Type a new name for " + newName + ".", newName)) {
            return
        }
        newCommand = PdTdoMoverRenameCommand().createWithTdoNewNameAndList(tdo, newName, list)
        this.doCommand(newCommand)
    }
    
    deleteClick(Sender: TObject): void {
        let list: TListCollection
        let newCommand: PdCommand
        
        list = this.selectedList(kThisList)
        if ((list === null) || (this.selectedTdos.Count <= 0)) {
            return
        }
        newCommand = PdTdoMoverRemoveCommand().createWithSelectedTdosAndList(this.selectedTdos, list)
        this.doCommand(newCommand)
    }
    
    editTdoClick(Sender: TObject): void {
        let tdoEditorForm: TTdoEditorForm
        let response: int
        let newCommand: PdCommand
        let tempTdo: KfObject3D
        
        if (this.focusedTdo() === null) {
            return
        }
        tdoEditorForm = utdoedit.TTdoEditorForm().create(this)
        if (tdoEditorForm === null) {
            throw new GeneralException.create("Problem: Could not create 3D object editor window.")
        }
        tempTdo = utdo.KfObject3D().create()
        try {
            tempTdo.copyFrom(this.focusedTdo())
            tdoEditorForm.initializeWithTdo(tempTdo)
            response = tdoEditorForm.ShowModal()
            if (response === mrOK) {
                // v1.6b1
                tempTdo.copyFrom(tdoEditorForm.tdo)
                newCommand = PdTdoMoverEditCommand().createWithTdoNewTdoAndList(this.focusedTdo(), tempTdo, this.selectedList(kThisList))
                this.doCommand(newCommand)
            }
        } finally {
            tdoEditorForm.free
            tdoEditorForm = null
            tempTdo.free
            tempTdo = null
        }
    }
    
    sortListClick(Sender: TObject): void {
    }
    
    // -------------------------------------------------------------------------------------- *list box actions 
    leftTdoListDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
        this.drawLineInGrid(this.leftTdoList, this.leftList, Row, Rect, State)
    }
    
    rightTdoListDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
        this.drawLineInGrid(this.rightTdoList, this.rightList, Row, Rect, State)
    }
    
    drawLineInGrid(grid: TDrawGrid, list: TListCollection, index: int, rect: TRect, state: TGridDrawState): void {
        let tdo: KfObject3D
        let selected: boolean
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        grid.Canvas.Brush.Color = grid.Color
        grid.Canvas.FillRect(Rect)
        if ((list.Count <= 0) || (index < 0) || (index > list.Count - 1)) {
            return
        }
        // set up tdo pointer 
        tdo = utdo.KfObject3D(list.Items[index])
        if (tdo === null) {
            return
        }
        selected = (list === this.selectedList(kThisList)) && (this.selectedTdos.IndexOf(tdo) >= 0)
        grid.Canvas.Font = grid.Font
        if (selected) {
            grid.Canvas.Brush.Color = UNRESOLVED.clHighlight
            grid.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            grid.Canvas.Brush.Color = grid.Color
            grid.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        grid.Canvas.FillRect(Rect)
        UNRESOLVED.strPCopy(cText, tdo.getName())
        // margin for text 
        Rect.left = Rect.left + 2
        UNRESOLVED.winprocs.drawText(grid.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
        if (tdo === this.focusedTdo()) {
            // put back 
            Rect.left = Rect.left - 2
            UNRESOLVED.drawFocusRect(Rect)
        }
    }
    
    // left list mouse handling
    leftTdoListMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int
        
        if (this.justDoubleClickedOnLeftGrid) {
            this.justDoubleClickedOnLeftGrid = false
            return
        } else {
            this.justDoubleClickedOnLeftGrid = false
        }
        if (this.leftList.Count > 0) {
            if (this.leftOrRight === kRight) {
                this.selectedTdos.Clear()
                this.lastRightSingleClickTdoIndex = -1
                this.rightTdoList.Invalidate()
            }
            this.leftOrRight = kLeft
            col, row = this.leftTdoList.MouseToCell(X, Y, col, row)
            this.selectTdoAtIndex(Shift, row)
            this.leftTdoList.Invalidate()
            this.updateForChangeToSelectedTdos()
            this.leftTdoList.BeginDrag(false)
        }
    }
    
    leftTdoListDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null)
        if (Source === this.rightTdoList) {
            Accept = Accept && this.haveLeftFile()
        } else {
            Accept = Accept && (Source === Sender)
        }
        return Accept
    }
    
    leftTdoListEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        if ((Target === this.rightTdoList)) {
            this.transferClick(this)
        }
    }
    
    leftTdoListDblClick(Sender: TObject): void {
        this.renameClick(this)
        this.leftTdoList.endDrag(false)
        this.justDoubleClickedOnLeftGrid = true
    }
    
    // right list mouse handling
    rightTdoListMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int
        
        if (this.justDoubleClickedOnRightGrid) {
            this.justDoubleClickedOnRightGrid = false
            return
        } else {
            this.justDoubleClickedOnRightGrid = false
        }
        if (this.rightList.Count > 0) {
            if (this.leftOrRight === kLeft) {
                this.selectedTdos.Clear()
                this.lastLeftSingleClickTdoIndex = -1
                this.leftTdoList.Invalidate()
            }
            this.leftOrRight = kRight
            col, row = this.rightTdoList.MouseToCell(X, Y, col, row)
            this.selectTdoAtIndex(Shift, row)
            this.rightTdoList.Invalidate()
            this.updateForChangeToSelectedTdos()
            this.rightTdoList.BeginDrag(false)
        }
    }
    
    rightTdoListDragOver(Sender: TObject, Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null)
        if (Source === this.leftTdoList) {
            Accept = Accept && this.haveRightFile()
        } else {
            Accept = Accept && (Source === Sender)
        }
        return Accept
    }
    
    rightTdoListEndDrag(Sender: TObject, Target: TObject, X: int, Y: int): void {
        if ((Target === this.leftTdoList)) {
            this.transferClick(this)
        }
    }
    
    rightTdoListDblClick(Sender: TObject): void {
        this.renameClick(this)
        this.rightTdoList.endDrag(false)
        this.justDoubleClickedOnRightGrid = true
    }
    
    selectTdoAtIndex(Shift: TShiftState, index: int): void {
        let i: short
        let tdo: KfObject3D
        let list: TListCollection
        let lastSingleClickTdoIndex: int
        let lastRow: int
        let grid: TDrawGrid
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        list = this.selectedList(kThisList)
        if (list === null) {
            return
        }
        if ((index < 0)) {
            this.selectedTdos.Clear()
            return
        }
        tdo = utdo.KfObject3D(list.Items[index])
        if (tdo === null) {
            return
        }
        if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
            if (this.selectedTdos.IndexOf(tdo) >= 0) {
                this.selectedTdos.Remove(tdo)
            } else {
                this.selectedTdos.Add(tdo)
            }
        } else if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
            if (this.leftOrRight === kLeft) {
                lastSingleClickTdoIndex = this.lastLeftSingleClickTdoIndex
            } else {
                lastSingleClickTdoIndex = this.lastRightSingleClickTdoIndex
            }
            if ((lastSingleClickTdoIndex >= 0) && (lastSingleClickTdoIndex <= list.Count - 1) && (lastSingleClickTdoIndex !== index)) {
                if (lastSingleClickTdoIndex < index) {
                    for (i = lastSingleClickTdoIndex; i <= index; i++) {
                        if (this.selectedTdos.IndexOf(list.Items[i]) < 0) {
                            this.selectedTdos.Add(list.Items[i])
                        }
                    }
                } else if (lastSingleClickTdoIndex > index) {
                    for (i = lastSingleClickTdoIndex; i >= index; i--) {
                        if (this.selectedTdos.IndexOf(list.Items[i]) < 0) {
                            this.selectedTdos.Add(list.Items[i])
                        }
                    }
                }
            }
            // just a click
        } else {
            if (this.selectedTdos.IndexOf(tdo) <= 0) {
                this.selectedTdos.Clear()
                this.selectedTdos.Add(tdo)
                if (this.leftOrRight === kLeft) {
                    this.lastLeftSingleClickTdoIndex = index
                } else {
                    this.lastRightSingleClickTdoIndex = index
                }
            }
            grid = this.gridForList(list)
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
    
    leftTdoListKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        Key = this.listKeyDown(Key, Shift)
        return Key
    }
    
    rightTdoListKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        Key = this.listKeyDown(Key, Shift)
        return Key
    }
    
    listKeyDown(Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DOWN:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedTdosDown()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedTdoIndexInList() + 1)
                }
                break
            case delphi_compatability.VK_RIGHT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedTdosDown()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedTdoIndexInList() + 1)
                }
                break
            case delphi_compatability.VK_UP:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedTdosUp()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedTdoIndexInList() - 1)
                }
                break
            case delphi_compatability.VK_LEFT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.moveSelectedTdosUp()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKey(this.focusedTdoIndexInList() - 1)
                }
                break
            case delphi_compatability.VK_RETURN:
                Key = 0
                this.renameClick(this)
                break
        return Key
    }
    
    moveUpOrDownWithKey(indexAfterMove: short): void {
        let list: TListCollection
        
        list = this.selectedList(kThisList)
        if (list === null) {
            return
        }
        if (indexAfterMove > list.Count - 1) {
            // loop around 
            indexAfterMove = 0
        }
        if (indexAfterMove < 0) {
            indexAfterMove = list.Count - 1
        }
        if ((indexAfterMove >= 0) && (indexAfterMove <= list.Count - 1)) {
            this.deselectAllTdos()
            //no shift
            this.selectTdoAtIndex({}, indexAfterMove)
            this.drawPreview(this.focusedTdo())
        }
    }
    
    moveSelectedTdosDown(): void {
        let list: TListCollection
        let i: short
        let tdo: KfObject3D
        
        if (this.selectedTdos.Count <= 0) {
            return
        }
        list = this.selectedList(kThisList)
        if (list === null) {
            return
        }
        if (list.Count > 1) {
            // start at next to last one because you can't move last one down any more 
            i = list.Count - 2
            while (i >= 0) {
                tdo = utdo.KfObject3D(list.Items[i])
                if (this.selectedTdos.IndexOf(tdo) >= 0) {
                    list.Move(i, i + 1)
                }
                i -= 1
            }
        }
        this.redrawSelectedGrid()
        // reordering makes change flag true
        this.setChangedFlagForTdoList(true, this.selectedList(kThisList))
    }
    
    moveSelectedTdosUp(): void {
        let list: TListCollection
        let i: short
        let tdo: KfObject3D
        
        if (this.selectedTdos.Count <= 0) {
            return
        }
        list = this.selectedList(kThisList)
        if (list === null) {
            return
        }
        if (list.Count > 1) {
            // start at 1 because you can't move first one up any more 
            i = 1
            while (i <= list.Count - 1) {
                tdo = utdo.KfObject3D(list.Items[i])
                if (this.selectedTdos.IndexOf(tdo) >= 0) {
                    list.Move(i, i - 1)
                }
                i += 1
            }
        }
        this.redrawSelectedGrid()
        // reordering makes change flag true
        this.setChangedFlagForTdoList(true, this.selectedList(kThisList))
    }
    
    redrawSelectedGrid(): void {
        if (this.leftOrRight === kLeft) {
            this.leftTdoList.Invalidate()
        } else {
            this.rightTdoList.Invalidate()
        }
    }
    
    // -------------------------------------------------------------------------------------------- *updating 
    updateForNewFile(newFileName: string, list: TListCollection): void {
        this.clearCommandList()
        this.setFileNameForList(newFileName, list)
        this.updateTdoListForList(list)
        this.setChangedFlagForTdoList(false, list)
        this.deselectAllTdos()
        if (newFileName !== "") {
            if (list === this.leftList) {
                this.leftOrRight = kLeft
            } else {
                this.leftOrRight = kRight
            }
        }
        this.updateForChangeToSelectedTdos()
    }
    
    deselectAllTdos(): void {
        this.selectedTdos.Clear()
        this.leftTdoList.Invalidate()
        this.rightTdoList.Invalidate()
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
    
    updateForChangeToSelectedTdos(): void {
        let atLeastOneTdoSelected: boolean
        let atLeastOneFile: boolean
        
        this.leftTdoList.Invalidate()
        this.rightTdoList.Invalidate()
        if (this.leftOrRight === kLeft) {
            if (this.haveLeftFile()) {
                this.leftOpenClose.Caption = "&Close"
            } else {
                this.leftOpenClose.Caption = "&Open..."
            }
            this.leftTdoFileNameEdit.Color = delphi_compatability.clAqua
            this.leftTdoFileNameEdit.Refresh()
            this.rightTdoFileNameEdit.Color = UNRESOLVED.clBtnFace
            this.rightTdoFileNameEdit.Refresh()
            this.drawPreview(this.focusedTdo())
        } else {
            if (this.haveRightFile()) {
                this.rightOpenClose.Caption = "&Close"
            } else {
                this.rightOpenClose.Caption = "&Open..."
            }
            this.leftTdoFileNameEdit.Color = UNRESOLVED.clBtnFace
            this.leftTdoFileNameEdit.Refresh()
            this.rightTdoFileNameEdit.Color = delphi_compatability.clAqua
            this.rightTdoFileNameEdit.Refresh()
            this.drawPreview(this.focusedTdo())
        }
        atLeastOneFile = this.haveLeftFile() || this.haveRightFile()
        atLeastOneTdoSelected = (this.selectedTdos.Count > 0)
        this.transfer.Enabled = this.haveLeftFile() && this.haveRightFile() && atLeastOneTdoSelected
        this.transfer.Caption = this.leftRightString("&Transfer >>", "<< &Transfer")
        this.duplicate.Enabled = atLeastOneFile && atLeastOneTdoSelected
        this.delete.Enabled = atLeastOneFile && atLeastOneTdoSelected
        this.rename.Enabled = atLeastOneFile && atLeastOneTdoSelected
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
    
    updateTdoListForList(list: TListCollection): void {
        let grid: TDrawGrid
        
        grid = this.gridForList(list)
        if (grid === null) {
            return
        }
        grid.RowCount = list.Count
        grid.Invalidate()
    }
    
    drawPreview(tdo: KfObject3D): void {
        let turtle: KfTurtle
        let xScale: float
        let yScale: float
        let tdoBoundsRect: TRect
        let currentPosition: TPoint
        let currentScale: float
        
        this.previewImage.Picture.Bitmap.Canvas.Brush.Color = delphi_compatability.clWindow
        this.previewImage.Picture.Bitmap.Canvas.FillRect(Rect(0, 0, this.previewImage.Width, this.previewImage.Height))
        this.previewImage.Picture.Bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        if (tdo !== null) {
            turtle = uturtle.KfTurtle.defaultStartUsing()
            try {
                currentScale = 100.0
                currentPosition = Point(this.previewImage.Width / 2, this.previewImage.Height - this.previewImage.Height / 10)
                turtle.drawingSurface.pane = this.previewImage.Picture.Bitmap.Canvas
                turtle.setDrawOptionsForDrawingTdoOnly()
                turtle.drawOptions.draw3DObjects = false
                // draw first to get new scale
                // must be after pane and draw options set 
                turtle.reset()
                turtle.xyz(currentPosition.X, currentPosition.Y, 0)
                turtle.drawingSurface.recordingStart()
                tdo.draw(turtle, currentScale, "", "", 0, 0)
                turtle.drawingSurface.recordingStop()
                turtle.drawingSurface.recordingDraw()
                turtle.drawingSurface.clearTriangles()
                // calculate new scale to fit
                tdoBoundsRect = turtle.boundsRect()
                xScale = umath.safedivExcept(0.95 * currentScale * this.previewImage.Width, usupport.rWidth(tdoBoundsRect), 0.1)
                yScale = umath.safedivExcept(0.95 * currentScale * this.previewImage.Height, usupport.rHeight(tdoBoundsRect), 0.1)
                currentScale = umath.min(xScale, yScale)
                currentPosition = tdo.bestPointForDrawingAtScale(turtle, Point(0, 0), Point(this.previewImage.Width, this.previewImage.Height), currentScale)
                // draw second time for real
                turtle.drawOptions.draw3DObjects = true
                // must be after pane and draw options set 
                turtle.reset()
                turtle.xyz(currentPosition.X, currentPosition.Y, 0)
                turtle.drawingSurface.recordingStart()
                tdo.draw(turtle, currentScale, "", "", 0, 0)
                turtle.drawingSurface.recordingStop()
                turtle.drawingSurface.recordingDraw()
                turtle.drawingSurface.clearTriangles()
            } finally {
                uturtle.KfTurtle.defaultStopUsing()
            }
        }
        this.previewImage.Picture.Bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.previewImage.Picture.Bitmap.Canvas.Pen.Color = UNRESOLVED.clBtnText
        this.previewImage.Picture.Bitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.previewImage.Picture.Bitmap.Canvas.Rectangle(0, 0, this.previewImage.Width, this.previewImage.Height)
    }
    
    previewImageMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    }
    
    // ------------------------------------------------------------------------------------------ *selecting 
    focusedTdo(): KfObject3D {
        let result = new KfObject3D()
        result = null
        if (this.selectedTdos.Count > 0) {
            result = utdo.KfObject3D(this.selectedTdos.Items[0])
        }
        return result
    }
    
    focusedTdoIndexInList(): short {
        let result = 0
        let list: TListCollection
        
        result = -1
        list = this.selectedList(kThisList)
        if (list === null) {
            return result
        }
        if (this.selectedTdos.Count > 0) {
            result = list.IndexOf(this.selectedTdos.Items[0])
        }
        return result
    }
    
    haveLeftFile(): boolean {
        let result = false
        result = len(this.leftTdoFileName) !== 0
        return result
    }
    
    haveRightFile(): boolean {
        let result = false
        result = len(this.rightTdoFileName) !== 0
        return result
    }
    
    selectedList(thisList: boolean): TListCollection {
        let result = new TListCollection()
        result = null
        if (this.leftOrRight === kLeft) {
            if (thisList) {
                result = this.leftList
            } else {
                result = this.rightList
            }
        } else {
            if (thisList) {
                result = this.rightList
            } else {
                result = this.leftList
            }
        }
        return result
    }
    
    getFileNameForList(list: TListCollection): string {
        let result = ""
        if (list === this.leftList) {
            result = this.leftTdoFileName
        } else {
            result = this.rightTdoFileName
        }
        return result
    }
    
    getFileNameForOtherList(list: TListCollection): string {
        let result = ""
        if (list === this.rightList) {
            result = this.leftTdoFileName
        } else {
            result = this.rightTdoFileName
        }
        return result
    }
    
    setFileNameForList(newName: string, list: TListCollection): void {
        if (list === this.leftList) {
            this.leftTdoFileName = newName
            this.leftTdoFileNameEdit.Text = newName
            this.leftTdoFileNameEdit.SelStart = len(newName)
        } else {
            this.rightTdoFileName = newName
            this.rightTdoFileNameEdit.Text = newName
            this.rightTdoFileNameEdit.SelStart = len(newName)
        }
    }
    
    gridForList(list: TListCollection): TDrawGrid {
        let result = new TDrawGrid()
        result = null
        if (list === this.leftList) {
            result = this.leftTdoList
        } else if (list === this.rightList) {
            result = this.rightTdoList
        }
        return result
    }
    
    listHasChanged(list: TListCollection): boolean {
        let result = false
        if (list === this.leftList) {
            result = this.leftTdoFileChanged
        } else {
            result = this.rightTdoFileChanged
        }
        return result
    }
    
    setChangedFlagForTdoList(value: boolean, list: TListCollection): void {
        if (list === this.leftList) {
            this.leftTdoFileChanged = value
            if (this.leftTdoFileChanged) {
                this.leftTdoFileChangedIndicator.Picture = umain.MainForm.fileChangedImage.Picture
            } else {
                this.leftTdoFileChangedIndicator.Picture = umain.MainForm.fileNotChangedImage.Picture
            }
        } else {
            this.rightTdoFileChanged = value
            if (this.rightTdoFileChanged) {
                this.rightTdoFileChangedIndicator.Picture = umain.MainForm.fileChangedImage.Picture
            } else {
                this.rightTdoFileChangedIndicator.Picture = umain.MainForm.fileNotChangedImage.Picture
            }
        }
    }
    
    // ------------------------------------------------------------------------ *opening, closing and saving 
    openTdoFileForList(list: TListCollection, fileNameToStart: string): void {
        let fileNameWithPath: string
        
        if (!this.askToSaveListAndProceed(list)) {
            return
        }
        if (fileNameToStart === "") {
            fileNameWithPath = usupport.getFileOpenInfo(usupport.kFileTypeTdo, usupport.kNoSuggestedFile, "Choose a tdo file")
        } else {
            fileNameWithPath = fileNameToStart
        }
        if (fileNameWithPath === "") {
            this.updateForNewFile(fileNameWithPath, list)
        } else {
            if (fileNameWithPath === this.getFileNameForOtherList(list)) {
                ShowMessage("The file you chose is already open on the other side.")
                return
            }
            try {
                ucursor.cursor_startWait()
                if (FileExists(fileNameWithPath)) {
                    this.loadTdosFromFile(list, fileNameWithPath)
                } else {
                    this.newTdoFileForList(list)
                }
                // PDF PORT -- added semicolon
                this.updateForNewFile(fileNameWithPath, list)
            } finally {
                ucursor.cursor_stopWait()
            }
        }
    }
    
    closeTdoFileForList(list: TListCollection): void {
        if (!this.askToSaveListAndProceed(list)) {
            return
        }
        list.clear()
        this.updateForNewFile("", list)
    }
    
    newTdoFileForList(list: TListCollection): void {
        if (!this.askToSaveListAndProceed(list)) {
            return
        }
        list.clear()
        this.updateForNewFile(kNewTdoFileName, list)
    }
    
    loadTdosFromFile(list: TListCollection, fileName: string): void {
        let newTdo: KfObject3D
        let inputFile: TextFile
        
        if (list === null) {
            return
        }
        list.clear()
        if (fileName === "") {
            return
        }
        if (!FileExists(fileName)) {
            return
        }
        AssignFile(inputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Reset(inputFile)
            while (!UNRESOLVED.eof(inputFile)) {
                newTdo = utdo.KfObject3D().create()
                newTdo.readFromFileStream(inputFile, utdo.kInTdoLibrary)
                list.Add(newTdo)
            }
        } finally {
            CloseFile(inputFile)
        }
    }
    
    saveTdosToFile(list: TListCollection, fileName: string): void {
        let outputFile: TextFile
        let i: short
        let tdo: KfObject3D
        
        if (list === null) {
            return
        }
        // assume caller has already verified file name
        AssignFile(outputFile, fileName)
        try {
            // v1.5
            usupport.setDecimalSeparator()
            Rewrite(outputFile)
            if (list.Count > 0) {
                for (i = 0; i <= list.Count - 1; i++) {
                    tdo = UNRESOLVED.TObject(list.Items[i])
                    if (tdo === null) {
                        continue
                    }
                    tdo.writeToFileStream(outputFile, utdo.kInTdoLibrary)
                }
            }
        } finally {
            CloseFile(outputFile)
        }
    }
    
    listSaveOrSaveAs(list: TListCollection, askForFileName: boolean): void {
        let fileInfo: SaveFileNamesStructure
        let fileName: string
        let askForFileNameConsideringUntitled: boolean
        
        fileName = this.getFileNameForList(list)
        if (fileName === kNewTdoFileName) {
            askForFileNameConsideringUntitled = true
        } else {
            askForFileNameConsideringUntitled = askForFileName
        }
        if (!usupport.getFileSaveInfo(usupport.kFileTypeTdo, askForFileNameConsideringUntitled, fileName, fileInfo)) {
            return
        }
        try {
            ucursor.cursor_startWait()
            this.saveTdosToFile(list, fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            ucursor.cursor_stopWait()
            usupport.cleanUpAfterFileSave(fileInfo)
            this.updateForNewFile(kNewTdoFileName, list)
        }
    }
    
    askToSaveListAndProceed(list: TListCollection): boolean {
        let result = false
        let response: byte
        let prompt: string
        
        // returns false if user cancelled action 
        result = true
        if (!this.listHasChanged(list)) {
            return result
        }
        prompt = "Save changes to " + ExtractFileName(this.getFileNameForList(list)) + "?"
        response = MessageDialog(prompt, mtConfirmation, mbYesNoCancel, 0)
        switch (response) {
            case mrYes:
                this.listSaveOrSaveAs(list, usupport.kDontAskForFileName)
                break
            case mrNo:
                result = true
                break
            case mrCancel:
                result = false
                break
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
        if (this.leftList === null) {
            return
        }
        if (this.rightList === null) {
            return
        }
        if (this.selectedTdos === null) {
            return
        }
        midWidth = this.ClientWidth / 2
        //same as right
        listBoxWidth = this.leftTdoList.Width
        listBoxTop = kBetweenGap + this.leftTdoFileNameEdit.Height + kBetweenGap + this.leftOpenClose.Height + kBetweenGap
        // list boxes 
        this.leftTdoList.SetBounds(kBetweenGap, listBoxTop, listBoxWidth, umath.intMax(0, this.ClientHeight - listBoxTop - kBetweenGap))
        this.leftTdoList.DefaultColWidth = this.leftTdoList.ClientWidth
        this.rightTdoList.SetBounds(umath.intMax(0, this.ClientWidth - listBoxWidth - kBetweenGap), listBoxTop, listBoxWidth, umath.intMax(0, this.ClientHeight - listBoxTop - kBetweenGap))
        this.rightTdoList.DefaultColWidth = this.rightTdoList.ClientWidth
        // edits and buttons at top 
        this.leftTdoFileNameEdit.SetBounds(kBetweenGap, kBetweenGap, listBoxWidth - kBetweenGap * 2, this.leftTdoFileNameEdit.Height)
        this.leftTdoFileChangedIndicator.SetBounds(kBetweenGap, this.leftTdoFileNameEdit.Top + this.leftTdoFileNameEdit.Height + kBetweenGap, this.leftTdoFileChangedIndicator.Width, this.leftTdoFileChangedIndicator.Height)
        this.rightTdoFileNameEdit.SetBounds(this.rightTdoList.Left, kBetweenGap, listBoxWidth - kBetweenGap * 2, this.rightTdoFileNameEdit.Height)
        this.rightTdoFileChangedIndicator.SetBounds(this.rightTdoList.Left, this.rightTdoFileNameEdit.Top + this.rightTdoFileNameEdit.Height + kBetweenGap, this.rightTdoFileChangedIndicator.Width, this.rightTdoFileChangedIndicator.Height)
        openCloseTop = this.leftTdoFileNameEdit.Top + this.leftTdoFileNameEdit.Height + kBetweenGap
        this.leftOpenClose.SetBounds(this.leftTdoFileChangedIndicator.Left + this.leftTdoFileChangedIndicator.Width + kBetweenGap, openCloseTop, this.leftOpenClose.Width, this.leftOpenClose.Height)
        this.rightOpenClose.SetBounds(this.rightTdoFileChangedIndicator.Left + this.rightTdoFileChangedIndicator.Width + kBetweenGap, openCloseTop, this.rightOpenClose.Width, this.rightOpenClose.Height)
        this.newFile.SetBounds(this.rightOpenClose.Left + this.rightOpenClose.Width + kBetweenGap, openCloseTop, this.newFile.Width, this.newFile.Height)
        // buttons in middle 
        this.close.SetBounds(midWidth - this.close.Width / 2, umath.intMax(0, this.ClientHeight - this.close.Height - kBetweenGap), this.close.Width, this.close.Height)
        this.helpButton.SetBounds(this.close.Left, umath.intMax(0, this.close.Top - this.helpButton.Height - kBetweenGap), this.helpButton.Width, this.helpButton.Height)
        this.editTdo.SetBounds(this.close.Left, umath.intMax(0, this.helpButton.Top - this.editTdo.Height - kBetweenGap), this.editTdo.Width, this.editTdo.Height)
        this.redo.SetBounds(this.close.Left, umath.intMax(0, this.editTdo.Top - this.redo.Height - kBetweenGap), this.redo.Width, this.redo.Height)
        this.undo.SetBounds(this.close.Left, umath.intMax(0, this.redo.Top - this.undo.Height - kBetweenGap), this.undo.Width, this.undo.Height)
        this.rename.SetBounds(this.close.Left, umath.intMax(0, this.undo.Top - this.rename.Height - kBetweenGap), this.rename.Width, this.rename.Height)
        this.delete.SetBounds(this.close.Left, umath.intMax(0, this.rename.Top - this.delete.Height - kBetweenGap), this.delete.Width, this.delete.Height)
        this.duplicate.SetBounds(this.close.Left, umath.intMax(0, this.delete.Top - this.duplicate.Height - kBetweenGap), this.duplicate.Width, this.duplicate.Height)
        this.transfer.SetBounds(this.close.Left, umath.intMax(0, this.duplicate.Top - this.transfer.Height - kBetweenGap), this.transfer.Width, this.transfer.Height)
        this.previewImage.SetBounds(listBoxWidth + kBetweenGap * 2, kBetweenGap, umath.intMax(0, this.ClientWidth - listBoxWidth * 2 - kBetweenGap * 4), this.transfer.Top - kBetweenGap * 2)
        this.resizePreviewImage()
    }
    
    resizePreviewImage(): void {
        try {
            this.previewImage.Picture.Bitmap.Height = this.previewImage.Height
            this.previewImage.Picture.Bitmap.Width = this.previewImage.Width
        } catch (Exception e) {
            this.previewImage.Picture.Bitmap.Height = 1
            this.previewImage.Picture.Bitmap.Width = 1
        }
        this.drawPreview(this.focusedTdo())
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 400
        UNRESOLVED.ptMinTrackSize.y = 315
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
        this.updateForChangeToSelectedTdos()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Using_the_3D_object_mover")
    }
    
}

export class PdTdoMoverRenameCommand {
    tdo: KfObject3D = new KfObject3D()
    oldName: string = ""
    newName: string = ""
    list: TListCollection = new TListCollection()
    listChangedBeforeCommand: boolean = false
    PdTdoMoverRenameCommand.prototype = new PdCommand()
    PdTdoMoverRenameCommand.prototype.constructor = PdTdoMoverRenameCommand
    
    // ------------------------------------------------------------------------------ *commands 
    // ------------------------------------------------------------------- PdTdoMoverRenameCommand 
    createWithTdoNewNameAndList(aTdo: KfObject3D, aNewName: string, aList: TListCollection): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.tdo = aTdo
        this.oldName = this.tdo.getName()
        this.newName = aNewName
        this.list = aList
        this.listChangedBeforeCommand = TdoMoverForm.listHasChanged(this.list)
    }
    
    doCommand(): void {
        //not redo
        PdCommand.prototype.doCommand.call(this)
        this.tdo.setName(this.newName)
        TdoMoverForm.setChangedFlagForTdoList(true, this.list)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        this.tdo.setName(this.oldName)
        TdoMoverForm.setChangedFlagForTdoList(this.listChangedBeforeCommand, this.list)
    }
    
    description(): string {
        let result = ""
        result = "rename"
        return result
    }
    
}

export class PdTdoMoverEditCommand {
    tdo: KfObject3D = new KfObject3D()
    oldTdo: KfObject3D = new KfObject3D()
    newTdo: KfObject3D = new KfObject3D()
    list: TListCollection = new TListCollection()
    listChangedBeforeCommand: boolean = false
    PdTdoMoverEditCommand.prototype = new PdCommand()
    PdTdoMoverEditCommand.prototype.constructor = PdTdoMoverEditCommand
    
    // ----------------------------------------------------------------------- PdTdoMoverEditCommand 
    createWithTdoNewTdoAndList(aTdo: KfObject3D, aNewTdo: KfObject3D, aList: TListCollection): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.tdo = aTdo
        this.oldTdo = utdo.KfObject3D().create()
        this.oldTdo.copyFrom(aTdo)
        this.newTdo = utdo.KfObject3D().create()
        this.newTdo.copyFrom(aNewTdo)
        this.list = aList
        this.listChangedBeforeCommand = TdoMoverForm.listHasChanged(this.list)
    }
    
    destroy(): void {
        this.oldTdo.free
        this.oldTdo = null
        this.newTdo.free
        this.newTdo = null
        PdCommand.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        //not redo
        PdCommand.prototype.doCommand.call(this)
        this.tdo.copyFrom(this.newTdo)
        TdoMoverForm.updateTdoListForList(this.list)
        TdoMoverForm.setChangedFlagForTdoList(true, this.list)
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        this.tdo.copyFrom(this.oldTdo)
        TdoMoverForm.updateTdoListForList(this.list)
        TdoMoverForm.setChangedFlagForTdoList(this.listChangedBeforeCommand, this.list)
    }
    
    description(): string {
        let result = ""
        result = "edit"
        return result
    }
    
}

export class PdCommandWithListOfTdos {
    tdoList: TList = new TList()
    values: TListCollection = new TListCollection()
    tdo: KfObject3D = new KfObject3D()
    PdCommandWithListOfTdos.prototype = new PdCommand()
    PdCommandWithListOfTdos.prototype.constructor = PdCommandWithListOfTdos
    
    //for temporary use
    // ----------------------------------------------------------------------- PdCommandWithListOfTdos 
    createWithListOfTdos(aList: TList): void {
        let i: short
        
        PdCommand.prototype.create.call(this)
        this.tdoList = delphi_compatability.TList().Create()
        if (aList.Count > 0) {
            for (i = 0; i <= aList.Count - 1; i++) {
                this.tdoList.Add(aList.Items[i])
            }
        }
        this.values = ucollect.TListCollection().Create()
    }
    
    destroy(): void {
        this.tdoList.free
        this.tdoList = null
        this.values.free
        this.values = null
        PdCommand.prototype.destroy.call(this)
    }
    
}

//use for cut and delete
export class PdTdoMoverRemoveCommand {
    removedTdos: TList = new TList()
    list: TListCollection = new TListCollection()
    listChangedBeforeCommand: boolean = false
    PdTdoMoverRemoveCommand.prototype = new PdCommandWithListOfTdos()
    PdTdoMoverRemoveCommand.prototype.constructor = PdTdoMoverRemoveCommand
    
    // ----------------------------------------------------------------------- PdTdoMoverRemoveCommand 
    createWithSelectedTdosAndList(listOfTdos: TList, aList: TListCollection): void {
        PdCommandWithListOfTdos.prototype.createWithListOfTdos.call(this, listOfTdos)
        this.commandChangesPlantFile = false
        this.list = aList
        this.listChangedBeforeCommand = TdoMoverForm.listHasChanged(this.list)
        this.removedTdos = delphi_compatability.TList().Create()
    }
    
    destroy(): void {
        let i: short
        
        if ((this.done) && (this.removedTdos !== null) && (this.removedTdos.Count > 0)) {
            for (i = 0; i <= this.removedTdos.Count - 1; i++) {
                // free copies of cut tdos if change was done 
                this.tdo = utdo.KfObject3D(this.removedTdos.Items[i])
                this.tdo.free
            }
        }
        this.removedTdos.free
        this.removedTdos = null
        PdCommandWithListOfTdos.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfTdos.prototype.doCommand.call(this)
        if (this.tdoList.Count <= 0) {
            return
        }
        // save copy of tdos before deleting 
        this.removedTdos.Clear()
        for (i = 0; i <= this.tdoList.Count - 1; i++) {
            // don't remove tdos from list until all indexes have been recorded 
            this.tdo = utdo.KfObject3D(this.tdoList.Items[i])
            this.removedTdos.Add(this.tdo)
            this.tdo.indexWhenRemoved = this.list.IndexOf(this.tdo)
            this.tdo.selectedIndexWhenRemoved = TdoMoverForm.selectedTdos.IndexOf(this.tdo)
        }
        for (i = 0; i <= this.tdoList.Count - 1; i++) {
            this.list.Remove(utdo.KfObject3D(this.tdoList.Items[i]))
        }
        for (i = 0; i <= this.tdoList.Count - 1; i++) {
            TdoMoverForm.selectedTdos.Remove(utdo.KfObject3D(this.tdoList.Items[i]))
        }
        TdoMoverForm.updateTdoListForList(this.list)
        TdoMoverForm.setChangedFlagForTdoList(true, this.list)
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfTdos.prototype.undoCommand.call(this)
        if (this.removedTdos.Count > 0) {
            for (i = 0; i <= this.removedTdos.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.removedTdos.Items[i])
                if ((this.tdo.indexWhenRemoved >= 0) && (this.tdo.indexWhenRemoved <= this.list.Count - 1)) {
                    this.list.Insert(this.tdo.indexWhenRemoved, this.tdo)
                } else {
                    this.list.Add(this.tdo)
                }
                if ((this.tdo.selectedIndexWhenRemoved >= 0) && (this.tdo.selectedIndexWhenRemoved <= TdoMoverForm.selectedTdos.Count - 1)) {
                    // all removed tdos must have been selected, so also add them to the selected list 
                    TdoMoverForm.selectedTdos.Insert(this.tdo.selectedIndexWhenRemoved, this.tdo)
                } else {
                    TdoMoverForm.selectedTdos.Add(this.tdo)
                }
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(this.listChangedBeforeCommand, this.list)
        }
    }
    
    description(): string {
        let result = ""
        result = "delete"
        return result
    }
    
}

export class PdTdoMoverTransferCommand {
    isTransfer: boolean = false
    list: TListCollection = new TListCollection()
    listChangedBeforeCommand: boolean = false
    PdTdoMoverTransferCommand.prototype = new PdCommandWithListOfTdos()
    PdTdoMoverTransferCommand.prototype.constructor = PdTdoMoverTransferCommand
    
    // ------------------------------------------------------------------ PdTdoMoverTransferCommand 
    createWithSelectedTdosAndList(listOfTdos: TList, aList: TListCollection): void {
        PdCommandWithListOfTdos.prototype.createWithListOfTdos.call(this, listOfTdos)
        this.commandChangesPlantFile = false
        this.list = aList
        this.listChangedBeforeCommand = TdoMoverForm.listHasChanged(this.list)
    }
    
    destroy(): void {
        let i: short
        
        if ((!this.done) && (this.tdoList !== null) && (this.tdoList.Count > 0)) {
            for (i = 0; i <= this.tdoList.Count - 1; i++) {
                // free copies of pasted tdos if change was undone 
                this.tdo = utdo.KfObject3D(this.tdoList.Items[i])
                this.tdo.free
            }
        }
        //will free tdoList
        PdCommandWithListOfTdos.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfTdos.prototype.doCommand.call(this)
        if (this.tdoList.Count > 0) {
            TdoMoverForm.deselectAllTdos()
            for (i = 0; i <= this.tdoList.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.tdoList.Items[i])
                this.list.Add(this.tdo)
                TdoMoverForm.selectedTdos.Add(this.tdo)
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(true, this.list)
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfTdos.prototype.undoCommand.call(this)
        if (this.tdoList.Count > 0) {
            for (i = 0; i <= this.tdoList.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.tdoList.Items[i])
                this.list.Remove(this.tdo)
                TdoMoverForm.selectedTdos.Remove(this.tdo)
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(this.listChangedBeforeCommand, this.list)
        }
    }
    
    description(): string {
        let result = ""
        result = "transfer"
        return result
    }
    
}

export class PdTdoMoverDuplicateCommand {
    newTdos: TList = new TList()
    list: TListCollection = new TListCollection()
    listChangedBeforeCommand: boolean = false
    PdTdoMoverDuplicateCommand.prototype = new PdCommandWithListOfTdos()
    PdTdoMoverDuplicateCommand.prototype.constructor = PdTdoMoverDuplicateCommand
    
    // ------------------------------------------------------------------------------ PdTdoMoverDuplicateCommand 
    createWithSelectedTdosAndList(listOfTdos: TList, aList: TListCollection): void {
        PdCommandWithListOfTdos.prototype.createWithListOfTdos.call(this, listOfTdos)
        this.commandChangesPlantFile = false
        this.newTdos = delphi_compatability.TList().Create()
        this.list = aList
        this.listChangedBeforeCommand = TdoMoverForm.listHasChanged(this.list)
    }
    
    destroy(): void {
        let i: short
        
        if ((!this.done) && (this.newTdos !== null) && (this.newTdos.Count > 0)) {
            for (i = 0; i <= this.newTdos.Count - 1; i++) {
                // free copies of created tdos if change was undone 
                this.tdo = utdo.KfObject3D(this.newTdos.Items[i])
                this.tdo.free
            }
        }
        this.newTdos.free
        this.newTdos = null
        //will free tdoList
        PdCommandWithListOfTdos.prototype.destroy.call(this)
    }
    
    doCommand(): void {
        let i: short
        let tdoCopy: KfObject3D
        
        PdCommandWithListOfTdos.prototype.doCommand.call(this)
        if (this.tdoList.Count > 0) {
            TdoMoverForm.deselectAllTdos()
            for (i = 0; i <= this.tdoList.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.tdoList.Items[i])
                tdoCopy = utdo.KfObject3D().create()
                this.tdo.copyTo(tdoCopy)
                tdoCopy.setName("Copy of " + tdoCopy.getName())
                this.newTdos.Add(tdoCopy)
                this.list.Add(tdoCopy)
                TdoMoverForm.selectedTdos.Add(tdoCopy)
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(true, this.list)
        }
    }
    
    undoCommand(): void {
        let i: short
        
        PdCommandWithListOfTdos.prototype.undoCommand.call(this)
        if (this.newTdos.Count > 0) {
            for (i = 0; i <= this.newTdos.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.newTdos.Items[i])
                this.list.Remove(this.tdo)
                TdoMoverForm.selectedTdos.Remove(this.tdo)
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(this.listChangedBeforeCommand, this.list)
        }
    }
    
    redoCommand(): void {
        let i: short
        
        //not redo
        PdCommandWithListOfTdos.prototype.doCommand.call(this)
        if (this.newTdos.Count > 0) {
            TdoMoverForm.deselectAllTdos()
            for (i = 0; i <= this.newTdos.Count - 1; i++) {
                this.tdo = utdo.KfObject3D(this.newTdos.Items[i])
                this.list.Add(this.tdo)
                TdoMoverForm.selectedTdos.Add(this.tdo)
            }
            TdoMoverForm.updateTdoListForList(this.list)
            TdoMoverForm.setChangedFlagForTdoList(true, this.list)
        }
    }
    
    description(): string {
        let result = ""
        result = "duplicate"
        return result
    }
    
}

