// unit Utdoedit

from conversion_common import *
import ubmpsupport
import uwait
import usupport
import umath
import ucursor
import updcom
import umain
import udomain
import uturtle
import updform
import uparams
import ucommand
import utdo
import delphi_compatability

// const
const kSplitterDragToTopMinPixels = 50
const kSplitterDragToBottomMinPixels = 50
const kSplitterDragToLeftMinPixels = 100
const kSplitterDragToRightMinPixels = 50
const kBetweenGap = 4
const kDrawAsLeaf = 0
const kDrawAsFlower = 1
const kDrawAsFruit = 2
const kCursorModeScroll = 0
const kCursorModeMagnify = 1
const kCursorModeRotate = 2
const kCursorModeAddTriangles = 3
const kCursorModeDeleteTriangles = 4
const kCursorModeDragPoints = 5
const kCursorModeFlipTriangles = 6
const kLineColor = delphi_compatability.clBlack
const kLightUpColor = delphi_compatability.clRed
const kConnectedPointColor = delphi_compatability.clBlue
const kUnconnectedPointColor = delphi_compatability.clGreen
const kOriginPointColor = delphi_compatability.clBlack


// var
let TdoEditorForm: TTdoEditorForm



export class PdTdoPaintBox {
    bitmap: TBitmap = new TBitmap()
    canRotate: boolean = false
    draggingIn: boolean = false
    scale: float = 0.0
    xRotation: float = 0.0
    yRotation: float = 0.0
    zRotation: float = 0.0
    drawPosition: TPoint = new TPoint()
    startDragPosition: TPoint = new TPoint()
    tdoBoundsRect: TRect = new TRect()
    PdTdoPaintBox.prototype = new TPaintBox()
    PdTdoPaintBox.prototype.constructor = PdTdoPaintBox
    
    //$R *.DFM
    // --------------------------------------------------------------------------------- PdTdoImage 
    create(anOwner: TComponent): void {
        TPaintBox.prototype.create.call(this, anOwner)
        this.bitmap = delphi_compatability.TBitmap().Create()
    }
    
    destroy(): void {
        this.bitmap.free
        this.bitmap = null
        TPaintBox.prototype.destroy.call(this)
    }
    
    magnifyOrReduce(newScale: float, clickPoint: TPoint): void {
        this.drawPosition.X = intround(clickPoint.X + (this.drawPosition.X - clickPoint.X) * newScale / this.scale)
        this.drawPosition.Y = intround(clickPoint.Y + (this.drawPosition.Y - clickPoint.Y) * newScale / this.scale)
        this.scale = newScale
        this.Paint()
    }
    
    centerTdo(): void {
        let xScale: float
        let yScale: float
        let newScale: float
        let turtle: KfTurtle
        
        xScale = umath.safedivExcept(0.75 * this.scale * this.Width, usupport.rWidth(this.tdoBoundsRect), 0.1)
        yScale = umath.safedivExcept(0.75 * this.scale * this.Height, usupport.rHeight(this.tdoBoundsRect), 0.1)
        newScale = umath.min(xScale, yScale)
        if (TdoEditorForm.tdo !== null) {
            turtle = uturtle.KfTurtle.defaultStartUsing()
            try {
                this.drawPosition = TdoEditorForm.tdo.bestPointForDrawingAtScale(turtle, Point(0, 0), Point(this.Width, this.Height), newScale)
            } finally {
                uturtle.KfTurtle.defaultStopUsing()
            }
        } else {
            this.drawPosition = Point(this.Width / 2, this.Height - 10)
        }
        this.magnifyOrReduce(newScale, this.drawPosition)
    }
    
    resetRotations(): void {
        this.xRotation = 0
        this.yRotation = 0
        this.zRotation = 0
        this.Paint()
    }
    
}

export class TTdoEditorForm {
    ok: TButton = new TButton()
    cancel: TButton = new TButton()
    undoLast: TButton = new TButton()
    redoLast: TButton = new TButton()
    toolbarPanel: TPanel = new TPanel()
    dragCursorMode: TSpeedButton = new TSpeedButton()
    magnifyCursorMode: TSpeedButton = new TSpeedButton()
    scrollCursorMode: TSpeedButton = new TSpeedButton()
    addTrianglePointsCursorMode: TSpeedButton = new TSpeedButton()
    removeTriangleCursorMode: TSpeedButton = new TSpeedButton()
    flipTriangleCursorMode: TSpeedButton = new TSpeedButton()
    rotateCursorMode: TSpeedButton = new TSpeedButton()
    optionsPanel: TPanel = new TPanel()
    fillTriangles: TCheckBox = new TCheckBox()
    plantParts: TSpinEdit = new TSpinEdit()
    drawAsLabel: TLabel = new TLabel()
    picturesPanel: TPanel = new TPanel()
    verticalSplitter: TPanel = new TPanel()
    horizontalSplitter: TPanel = new TPanel()
    drawLines: TCheckBox = new TCheckBox()
    writeToDXF: TButton = new TButton()
    renameTdo: TButton = new TButton()
    Label1: TLabel = new TLabel()
    circlePointSize: TSpinEdit = new TSpinEdit()
    helpButton: TSpeedButton = new TSpeedButton()
    mirrorTdo: TSpeedButton = new TSpeedButton()
    reverseZValues: TSpeedButton = new TSpeedButton()
    centerDrawing: TSpeedButton = new TSpeedButton()
    resetRotations: TSpeedButton = new TSpeedButton()
    writeToPOV: TButton = new TButton()
    mirrorHalf: TCheckBox = new TCheckBox()
    ReadFromDXF: TButton = new TButton()
    connectionPointLabel: TLabel = new TLabel()
    connectionPoint: TSpinEdit = new TSpinEdit()
    clearTdo: TButton = new TButton()
    tdo: KfObject3d = new KfObject3d()
    originalTdo: KfObject3d = new KfObject3d()
    param: PdParameter = new PdParameter()
    editPaintBox: PdTdoPaintBox = new PdTdoPaintBox()
    viewPaintBoxOne: PdTdoPaintBox = new PdTdoPaintBox()
    viewPaintBoxTwo: PdTdoPaintBox = new PdTdoPaintBox()
    paintBoxClickedIn: PdTdoPaintBox = new PdTdoPaintBox()
    commandList: PdCommandList = new PdCommandList()
    internalChange: boolean = false
    actionInProgress: boolean = false
    scrolling: boolean = false
    rotating: boolean = false
    startDragPoint: TPoint = new TPoint()
    scrollStartPosition: TPoint = new TPoint()
    draggingPoint: boolean = false
    pointIndexBeingDragged: short = 0
    cursorMode: short = 0
    rotateDirection: short = 0
    pointRadius: short = 0
    rotateStartAngle: float = 0.0
    lastCommandWasApply: boolean = false
    lastCommandWasUndoApply: boolean = false
    editPoints: TPoint[] /* kMaximumRecordedPoints + 1 */ = Array(kMaximumRecordedPoints + 1)
    numEditPoints: short = 0
    numNewPoints: short = 0
    newPointIndexes: short[] /* 2 + 1 */ = Array(2+ 1)
    newPoints: KfPoint3D[] /* 2 + 1 */ = Array(2+ 1)
    horizontalSplitterDragging: boolean = false
    verticalSplitterDragging: boolean = false
    horizontalSplitterNeedToRedraw: boolean = false
    verticalSplitterNeedToRedraw: boolean = false
    horizontalSplitterStartPos: int = 0
    verticalSplitterStartPos: int = 0
    horizontalSplitterLastDrawPos: int = 0
    verticalSplitterLastDrawPos: int = 0
    lastPicturesPanelWidth: int = 0
    lastPicturesPanelHeight: int = 0
    TTdoEditorForm.prototype = new PdForm()
    TTdoEditorForm.prototype.constructor = TTdoEditorForm
    
    // resizing and splitting 
    // creation/destruction 
    // -------------------------------------------------------------------------------------------- *creation/destruction 
    create(AOwner: TComponent): void {
        PdForm.prototype.create.call(this, AOwner)
        TdoEditorForm = this
        this.tdo = utdo.KfObject3D().create()
        this.commandList = ucommand.PdCommandList().create()
        this.commandList.setNewUndoLimit(udomain.domain.options.undoLimit)
        this.commandList.setNewObjectUndoLimit(udomain.domain.options.undoLimitOfPlants)
        this.editPaintBox = PdTdoPaintBox().create(this)
        this.editPaintBox.Parent = this.picturesPanel
        this.editPaintBox.OnMouseDown = this.editPaintBoxMouseDown
        this.editPaintBox.OnMouseMove = this.imagesMouseMove
        this.editPaintBox.OnMouseUp = this.imagesMouseUp
        this.editPaintBox.OnPaint = this.editPaintBoxPaint
        this.editPaintBox.scale = 1.5
        this.editPaintBox.Cursor = ucursor.crScroll
        this.viewPaintBoxOne = PdTdoPaintBox().create(this)
        this.viewPaintBoxOne.Parent = this.picturesPanel
        this.viewPaintBoxOne.OnMouseDown = this.viewPaintBoxOneMouseDown
        this.viewPaintBoxOne.OnMouseMove = this.imagesMouseMove
        this.viewPaintBoxOne.OnMouseUp = this.imagesMouseUp
        this.viewPaintBoxOne.OnPaint = this.viewPaintBoxOnePaint
        this.viewPaintBoxOne.scale = 0.5
        this.viewPaintBoxOne.Cursor = ucursor.crScroll
        this.viewPaintBoxTwo = PdTdoPaintBox().create(this)
        this.viewPaintBoxTwo.Parent = this.picturesPanel
        this.viewPaintBoxTwo.OnMouseDown = this.viewPaintBoxTwoMouseDown
        this.viewPaintBoxTwo.OnMouseMove = this.imagesMouseMove
        this.viewPaintBoxTwo.OnMouseUp = this.imagesMouseUp
        this.viewPaintBoxTwo.OnPaint = this.viewPaintBoxTwoPaint
        this.viewPaintBoxTwo.scale = 0.5
        this.viewPaintBoxTwo.Cursor = ucursor.crScroll
        this.updateButtonsForUndoRedo()
    }
    
    FormCreate(Sender: TObject): void {
        let tempBoundsRect: TRect
        
        // keep window on screen - left corner of title bar 
        tempBoundsRect = udomain.domain.tdoEditorWindowRect
        if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
            if (tempBoundsRect.Left > delphi_compatability.Screen.Width - umain.kMinWidthOnScreen) {
                tempBoundsRect.Left = delphi_compatability.Screen.Width - umain.kMinWidthOnScreen
            }
            if (tempBoundsRect.Top > delphi_compatability.Screen.Height - umain.kMinHeightOnScreen) {
                tempBoundsRect.Top = delphi_compatability.Screen.Height - umain.kMinHeightOnScreen
            }
            this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
        }
        this.scrollCursorMode.Down = true
        this.scrollCursorModeClick(this)
        this.internalChange = true
        this.circlePointSize.Value = udomain.domain.options.circlePointSizeInTdoEditor
        this.plantParts.Value = udomain.domain.options.partsInTdoEditor
        this.fillTriangles.Checked = udomain.domain.options.fillTrianglesInTdoEditor
        this.drawLines.Checked = udomain.domain.options.drawLinesInTdoEditor
        this.internalChange = false
        this.pointRadius = this.circlePointSize.Value / 2
        this.toolbarPanel.BevelOuter = UNRESOLVED.bvNone
        //optionsPanel.bevelOuter := bvNone;
    }
    
    initializeWithTdoAndParameter(aTdo: KfObject3D, aParam: PdParameter): void {
        this.originalTdo = aTdo
        if (this.originalTdo === null) {
            throw new GeneralException.create("Problem: Nil 3D object in method TTdoEditorForm.initializeWithTdoAndParameter.")
        }
        this.param = aParam
        if (this.param === null) {
            throw new GeneralException.create("Problem: Nil parameter in method TTdoEditorForm.initializeWithTdoAndParameter.")
        }
        this.tdo.copyFrom(this.originalTdo)
        this.updateCaptionForNewTdoName()
        this.updateForChangeToNumberOfPoints()
        //v1.6b1
        this.centerDrawingClick(this)
    }
    
    initializeWithTdo(aTdo: KfObject3D): void {
        this.originalTdo = aTdo
        if (this.originalTdo === null) {
            throw new GeneralException.create("Problem: Nil 3D object in method TTdoEditorForm.initializeWithTdo.")
        }
        this.tdo.copyFrom(this.originalTdo)
        this.updateCaptionForNewTdoName()
        this.updateForChangeToNumberOfPoints()
        //v1.6b1
        this.centerDrawingClick(this)
    }
    
    destroy(): void {
        this.tdo.free
        this.tdo = null
        this.commandList.free
        this.commandList = null
        // don't free paint boxes because we are their owner 
        PdForm.prototype.destroy.call(this)
    }
    
    // -------------------------------------------------------------------------------- *command list 
    undoLastClick(Sender: TObject): void {
        if (this.lastCommandWasApply) {
            umain.MainForm.MenuEditUndoClick(umain.MainForm)
            this.lastCommandWasUndoApply = true
            this.lastCommandWasApply = false
            this.updateButtonsForUndoRedo()
        } else {
            this.commandList.undoLast()
            this.updateButtonsForUndoRedo()
            this.updateForChangeToTdo()
        }
    }
    
    redoLastClick(Sender: TObject): void {
        if (this.lastCommandWasUndoApply) {
            umain.MainForm.MenuEditRedoClick(umain.MainForm)
            this.lastCommandWasUndoApply = false
            this.lastCommandWasApply = true
            this.updateButtonsForUndoRedo()
        } else {
            this.commandList.redoLast()
            this.updateButtonsForUndoRedo()
            this.updateForChangeToTdo()
        }
    }
    
    // updating 
    // ------------------------------------------------------------------------------- *updating 
    updateButtonsForUndoRedo(): void {
        if (this.lastCommandWasApply) {
            this.undoLast.Enabled = true
            this.undoLast.Caption = "&Undo apply"
        } else if (this.lastCommandWasUndoApply) {
            this.redoLast.Enabled = true
            this.redoLast.Caption = "&Redo apply"
        } else {
            if (this.commandList.isUndoEnabled()) {
                this.undoLast.Enabled = true
                this.undoLast.Caption = "&Undo " + this.commandList.undoDescription()
            } else {
                this.undoLast.Enabled = false
                this.undoLast.Caption = "Can't undo"
            }
            if (this.commandList.isRedoEnabled()) {
                this.redoLast.Enabled = true
                this.redoLast.Caption = "&Redo " + this.commandList.redoDescription()
            } else {
                this.redoLast.Enabled = false
                this.redoLast.Caption = "Can't redo"
            }
        }
    }
    
    updateForChangeToTdo(): void {
        this.updateButtonsForUndoRedo()
        this.updateForChangeToNumberOfPoints()
        this.updateForChangeToConnectionPointIndex()
        this.clearTdo.Enabled = (this.tdo !== null) && (this.tdo.pointsInUse > 0)
        if ((this.editPaintBox !== null) && (this.viewPaintBoxOne !== null) && (this.viewPaintBoxTwo !== null)) {
            this.editPaintBox.Paint()
            this.viewPaintBoxOne.Paint()
            this.viewPaintBoxTwo.Paint()
        }
    }
    
    updateForChangeToClickedOnPaintBox(): void {
        this.updateButtonsForUndoRedo()
        if (this.paintBoxClickedIn !== null) {
            this.paintBoxClickedIn.Paint()
        }
    }
    
    updateCaptionForNewTdoName(): void {
        this.Caption = "3D object editor - " + this.tdo.getName()
        this.Invalidate()
    }
    
    updateForChangeToNumberOfPoints(): void {
        this.internalChange = true
        this.connectionPoint.Value = this.tdo.originPointIndex + 1
        this.connectionPoint.MaxValue = this.tdo.pointsInUse
        this.connectionPointLabel.Caption = "Connection point (1-" + IntToStr(this.connectionPoint.MaxValue) + ")"
        this.internalChange = false
    }
    
    updateForChangeToConnectionPointIndex(): void {
        let oldPoint: TPoint
        let newPoint: TPoint
        
        this.internalChange = true
        this.connectionPoint.Value = this.tdo.originPointIndex + 1
        this.internalChange = false
        //
        //  // adjust drawing point so 3D object does not move
        //  if connectionPoint.value - 1 <> tdo.originPointIndex then
        //    begin
        //    if (tdo.originPointIndex >= 0) and (tdo.originPointIndex <= numEditPoints - 1) then
        //      oldPoint := editPoints[tdo.originPointIndex]
        //    else
        //      oldPoint := Point(0, 0);
        //    if (connectionPoint.value - 1 >= 0) and (connectionPoint.value - 1 <= numEditPoints - 1) then
        //      newPoint := editPoints[connectionPoint.value - 1]
        //    else
        //      newPoint := Point(0, 0);
        //    editPaintBox.drawPosition.x := editPaintBox.drawPosition.x + (newPoint.x - oldPoint.x);
        //    editPaintBox.drawPosition.y := editPaintBox.drawPosition.y + (newPoint.y - oldPoint.y);
        //    end;
        //  tdo.setOriginPointIndex(connectionPoint.value - 1);
        //  if editPaintBox <> nil then editPaintBox.paint;
        //  
    }
    
    // -------------------------------------------------------------------------------------- *buttons 
    okClick(Sender: TObject): void {
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    FormClose(Sender: TObject, Action: TCloseAction): void {
        // save settings to domain even if they clicked cancel or clicked the close box
        udomain.domain.tdoEditorWindowRect = Rect(this.Left, this.Top, this.Width, this.Height)
        udomain.domain.options.circlePointSizeInTdoEditor = this.circlePointSize.Value
        udomain.domain.options.partsInTdoEditor = this.plantParts.Value
        udomain.domain.options.fillTrianglesInTdoEditor = this.fillTriangles.Checked
        udomain.domain.options.drawLinesInTdoEditor = this.drawLines.Checked
    }
    
    applyClick(Sender: TObject): void {
        umain.MainForm.doCommand(updcom.PdChangeTdoValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.tdo, this.param.fieldNumber, this.param.regrow))
        this.lastCommandWasApply = true
        this.updateButtonsForUndoRedo()
    }
    
    renameTdoClick(Sender: TObject): void {
        let newCommand: PdCommand
        let newName: ansistring
        
        newName = this.tdo.getName()
        if (!InputQuery("Enter new name", "Type a new name for " + newName + ".", newName)) {
            return
        }
        newCommand = PdRenameTdoCommand().createWithTdoAndNewName(this.tdo, newName)
        this.doCommand(newCommand)
    }
    
    clearTdoClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        newCommand = PdClearAllPointsCommand().createWithTdo(this.tdo)
        this.doCommand(newCommand)
    }
    
    writeToDXFClick(Sender: TObject): void {
        let fileInfo: SaveFileNamesStructure
        let suggestedName: string
        
        suggestedName = "export.dxf"
        if (!usupport.getFileSaveInfo(usupport.kFileTypeDXF, usupport.kAskForFileName, suggestedName, fileInfo)) {
            return
        }
        try {
            usupport.startFileSave(fileInfo)
            this.tdo.writeToDXFFile(fileInfo.tempFile, utdo.kTdoForeColor, utdo.kTdoBackColor)
            fileInfo.writingWasSuccessful = true
        } finally {
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    ReadFromDXFClick(Sender: TObject): void {
        let fileNameWithPath: string
        let newTdo: KfObject3D
        let inputFile: TextFile
        let newCommand: PdCommand
        
        newTdo = null
        fileNameWithPath = usupport.getFileOpenInfo(usupport.kFileTypeDXF, "input.dxf", "Choose a DXF file")
        if (fileNameWithPath === "") {
            return
        }
        try {
            uwait.startWaitMessage("Reading " + ExtractFileName(fileNameWithPath))
            AssignFile(inputFile, fileNameWithPath)
            try {
                // v1.5
                usupport.setDecimalSeparator()
                Reset(inputFile)
                newTdo = utdo.KfObject3D().create()
                newTdo.readFromDXFFile(inputFile)
                // v1.6b1
                newTdo.setName(usupport.stringUpTo(ExtractFileName(fileNameWithPath), "."))
            } finally {
                CloseFile(inputFile)
            }
        } catch (Exception E) {
            uwait.stopWaitMessage()
            ShowMessage(E.message)
            ShowMessage("Could not load file " + fileNameWithPath)
            return
        }
        if (newTdo !== null) {
            newCommand = PdLoadTdoFromDXFCommand().createWithOldAndNewTdo(this.tdo, newTdo)
            this.doCommand(newCommand)
        }
        uwait.stopWaitMessage()
    }
    
    writeToPOVClick(Sender: TObject): void {
        let fileInfo: SaveFileNamesStructure
        let suggestedName: string
        
        suggestedName = usupport.replacePunctuationWithUnderscores(this.tdo.getName()) + ".inc"
        if (!usupport.getFileSaveInfo(usupport.kFileTypeINC, usupport.kAskForFileName, suggestedName, fileInfo)) {
            return
        }
        try {
            usupport.startFileSave(fileInfo)
            this.tdo.writeToPOV_INCFile(fileInfo.tempFile, utdo.kTdoForeColor, utdo.kEmbeddedInPlant, this.plantParts.Value)
            fileInfo.writingWasSuccessful = true
        } finally {
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Editing_3D_objects")
    }
    
    // mouse handling 
    // ------------------------------------------------------------------------------------- *mouse handling 
    imagesMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let newCommand: PdCommand
        let anchorPoint: TPoint
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.paintBoxClickedIn === null) {
            return
        }
        if (this.actionInProgress) {
            try {
                //error somewhere - user did weird things with mouse buttons - teminate action...
                this.imagesMouseUp(Sender, Button, Shift, X, Y)
            } finally {
                this.actionInProgress = false
            }
        }
        // makes shift-click work as right-click
        this.commandList.rightButtonDown = (Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)
        switch (this.cursorMode) {
            case kCursorModeMagnify:
                if (this.commandList.rightButtonDown) {
                    this.paintBoxClickedIn.Cursor = ucursor.crMagMinus
                }
                break
            case kCursorModeScroll:
                if (this.commandList.rightButtonDown) {
                    return
                }
                this.scrolling = true
                this.startDragPoint = Point(X, Y)
                this.scrollStartPosition = this.paintBoxClickedIn.drawPosition
                break
            case kCursorModeRotate:
                if (this.paintBoxClickedIn !== this.editPaintBox) {
                    this.rotating = true
                    this.startDragPoint = Point(X, Y)
                    this.rotateDirection = updcom.kRotateNotInitialized
                    if (this.commandList.rightButtonDown) {
                        this.paintBoxClickedIn.Cursor = delphi_compatability.crSizeWE
                    }
                }
                break
            case kCursorModeAddTriangles:
                if (this.numNewPoints >= 3) {
                    this.numNewPoints = 0
                }
                break
            default:
                if ((this.commandList.rightButtonDown) && (this.cursorMode !== kCursorModeDragPoints)) {
                    return
                }
                anchorPoint = Point(X, Y)
                this.actionInProgress = true
                newCommand = this.makeMouseCommand(anchorPoint, (delphi_compatability.TShiftStateEnum.ssShift in Shift), (delphi_compatability.TShiftStateEnum.ssCtrl in Shift))
                if (newCommand !== null) {
                    this.actionInProgress = this.commandList.mouseDown(newCommand, anchorPoint)
                } else {
                    this.actionInProgress = false
                }
                if (this.actionInProgress) {
                    this.updateForChangeToTdo()
                }
                break
    }
    
    imagesMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if ((Sender === this.editPaintBox)) {
            switch (this.cursorMode) {
                case kCursorModeAddTriangles:
                    if (this.numNewPoints === 0) {
                        this.lightUpPointAtMouse(X, Y, umain.kDrawNow)
                    }
                    break
                case kCursorModeDragPoints:
                    if (this.numNewPoints === 0) {
                        this.lightUpPointAtMouse(X, Y, umain.kDrawNow)
                    }
                    break
                case kCursorModeDeleteTriangles:
                    this.lightUpTriangleAtMouse(X, Y)
                    break
                case kCursorModeFlipTriangles:
                    this.lightUpTriangleAtMouse(X, Y)
                    break
        }
        if (this.paintBoxClickedIn === null) {
            return
        }
        if (Sender !== this.paintBoxClickedIn) {
            return
        }
        switch (this.cursorMode) {
            case kCursorModeMagnify:
                if (this.scrolling) {
                    this.scrollBy(X, Y)
                }
                break
            case kCursorModeScroll:
                if (this.scrolling) {
                    this.scrollBy(X, Y)
                }
                break
            case kCursorModeRotate:
                if (this.rotating) {
                    this.rotateBy(X, Y)
                }
                break
            case kCursorModeAddTriangles:
                if (Sender === this.editPaintBox) {
                    if ((this.numNewPoints === 1) || (this.numNewPoints === 2)) {
                        this.lightUpAddingLineAtMouse(X, Y)
                    }
                }
                break
            default:
                if (this.actionInProgress) {
                    this.commandList.mouseMove(Point(X, Y))
                    this.updateForChangeToTdo()
                }
                break
    }
    
    imagesMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let triangle: KfIndexTriangle
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.paintBoxClickedIn === null) {
            return
        }
        if (this.cursorMode !== kCursorModeAddTriangles) {
            this.numNewPoints = 0
        }
        try {
            switch (this.cursorMode) {
                case kCursorModeMagnify:
                    if ((this.commandList.rightButtonDown)) {
                        this.paintBoxClickedIn.magnifyOrReduce(this.paintBoxClickedIn.scale * 0.75, Point(X, Y))
                        if (!(delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                            this.paintBoxClickedIn.Cursor = ucursor.crMagPlus
                        }
                    } else if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                        this.paintBoxClickedIn.magnifyOrReduce(this.paintBoxClickedIn.scale * 0.75, Point(X, Y))
                    } else {
                        this.paintBoxClickedIn.magnifyOrReduce(this.paintBoxClickedIn.scale * 1.5, Point(X, Y))
                    }
                    break
                case kCursorModeScroll:
                    if (this.scrolling) {
                        this.scrollBy(X, Y)
                    }
                    break
                case kCursorModeRotate:
                    if (this.rotating) {
                        this.rotateBy(X, Y)
                    }
                    if (this.paintBoxClickedIn !== this.editPaintBox) {
                        this.paintBoxClickedIn.Cursor = ucursor.crRotate
                    }
                    break
                case kCursorModeFlipTriangles:
                    if (this.paintBoxClickedIn === this.editPaintBox) {
                        triangle = this.triangleAtMouse(X, Y)
                        if (triangle !== null) {
                            triangle.flip()
                            this.updateForChangeToTdo()
                        }
                    }
                    break
                case kCursorModeAddTriangles:
                    if (this.paintBoxClickedIn === this.editPaintBox) {
                        this.addTrianglePoints(X, Y)
                    }
                    break
                default:
                    if (this.actionInProgress) {
                        this.commandList.mouseUp(Point(X, Y))
                        this.actionInProgress = false
                        this.updateForChangeToTdo()
                    }
                    break
        } finally {
            this.scrolling = false
            this.rotating = false
            this.commandList.rightButtonDown = false
            this.actionInProgress = false
            this.draggingPoint = false
        }
    }
    
    editPaintBoxMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.paintBoxClickedIn = this.editPaintBox
        this.imagesMouseDown(Sender, Button, Shift, X, Y)
    }
    
    viewPaintBoxOneMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.paintBoxClickedIn = this.viewPaintBoxOne
        this.imagesMouseDown(Sender, Button, Shift, X, Y)
    }
    
    viewPaintBoxTwoMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.paintBoxClickedIn = this.viewPaintBoxTwo
        this.imagesMouseDown(Sender, Button, Shift, X, Y)
    }
    
    // -------------------------------------------------------------------------------- *finding and lighting up 
    lightUpPointAtMouse(x: int, y: int, immediate: boolean): void {
        let i: short
        let pointFound: short
        
        pointFound = -1
        if (this.draggingPoint) {
            if ((this.pointIndexBeingDragged >= 0) && (this.pointIndexBeingDragged <= this.numEditPoints - 1)) {
                pointFound = this.pointIndexBeingDragged
            }
        } else {
            pointFound = this.pointIndexAtMouse(x, y)
        }
        if (pointFound >= 0) {
            this.editPaintBox.bitmap.Canvas.Pen.Color = kLightUpColor
            this.editPaintBox.bitmap.Canvas.Brush.Color = kLightUpColor
            this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
            this.editPaintBox.bitmap.Canvas.Ellipse(this.editPoints[pointFound].X - this.pointRadius, this.editPoints[pointFound].Y - this.pointRadius, this.editPoints[pointFound].X + this.pointRadius, this.editPoints[pointFound].Y + this.pointRadius)
        } else {
            if (!this.draggingPoint) {
                if (this.numEditPoints > 0) {
                    for (i = 0; i <= this.numEditPoints - 1; i++) {
                        if (i === this.tdo.originPointIndex) {
                            this.editPaintBox.bitmap.Canvas.Pen.Color = kOriginPointColor
                            this.editPaintBox.bitmap.Canvas.Brush.Color = kOriginPointColor
                        } else {
                            this.editPaintBox.bitmap.Canvas.Pen.Color = kConnectedPointColor
                            this.editPaintBox.bitmap.Canvas.Brush.Color = kConnectedPointColor
                        }
                        this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
                        this.editPaintBox.bitmap.Canvas.Ellipse(this.editPoints[i].X - this.pointRadius, this.editPoints[i].Y - this.pointRadius, this.editPoints[i].X + this.pointRadius, this.editPoints[i].Y + this.pointRadius)
                    }
                }
            }
        }
        if (immediate) {
            this.drawPaintBoxBitmapOnCanvas(this.editPaintBox)
        }
    }
    
    pointIndexAtMouse(x: int, y: int): short {
        let result = 0
        let i: short
        
        result = -1
        if (this.numEditPoints > 0) {
            for (i = 0; i <= this.numEditPoints - 1; i++) {
                if ((abs(x - this.editPoints[i].X) <= this.pointRadius) && (abs(y - this.editPoints[i].Y) <= this.pointRadius)) {
                    result = i
                    return result
                }
            }
        }
        return result
    }
    
    lightUpTriangleAtMouse(x: int, y: int): void {
        let triangle: KfIndexTriangle
        let aPolygon: TPoint[] /* 2 + 1 */
        
        this.drawTdoOnTdoPaintBox(this.editPaintBox, umain.kDontDrawYet)
        triangle = this.triangleAtMouse(x, y)
        if (triangle !== null) {
            this.editPaintBox.bitmap.Canvas.Pen.Color = kLightUpColor
            this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            aPolygon[0] = this.editPoints[triangle.pointIndexes[0] - 1]
            aPolygon[1] = this.editPoints[triangle.pointIndexes[1] - 1]
            aPolygon[2] = this.editPoints[triangle.pointIndexes[2] - 1]
            this.editPaintBox.bitmap.Canvas.Polygon(aPolygon)
        }
        this.drawPaintBoxBitmapOnCanvas(this.editPaintBox)
    }
    
    triangleAtMouse(x: int, y: int): KfIndexTriangle {
        let result = new KfIndexTriangle()
        let i: short
        let triangle: KfIndexTriangle
        let polygon: TPoint[] /* 2 + 1 */
        let hPolygon: HRgn
        let inTriangle: boolean
        
        result = null
        if (this.tdo.triangles.Count > 0) {
            for (i = 0; i <= this.tdo.triangles.Count - 1; i++) {
                triangle = utdo.KfIndexTriangle(this.tdo.triangles.Items[i])
                polygon[0] = this.editPoints[triangle.pointIndexes[0] - 1]
                polygon[1] = this.editPoints[triangle.pointIndexes[1] - 1]
                polygon[2] = this.editPoints[triangle.pointIndexes[2] - 1]
                hPolygon = UNRESOLVED.createPolygonRgn(polygon, 3, delphi_compatability.ALTERNATE)
                UNRESOLVED.selectObject(this.Handle, hPolygon)
                try {
                    inTriangle = UNRESOLVED.ptInRegion(hPolygon, x, y)
                } finally {
                    UNRESOLVED.deleteObject(hPolygon)
                }
                if (inTriangle) {
                    result = utdo.KfIndexTriangle(this.tdo.triangles.Items[i])
                    return result
                }
            }
        }
        return result
    }
    
    scrollBy(x: int, y: int): void {
        this.paintBoxClickedIn.drawPosition.X = this.scrollStartPosition.X + x - this.startDragPoint.X
        this.paintBoxClickedIn.drawPosition.Y = this.scrollStartPosition.Y + y - this.startDragPoint.Y
        this.updateForChangeToClickedOnPaintBox()
    }
    
    rotateBy(x: int, y: int): void {
        if ((this.rotateDirection === updcom.kRotateNotInitialized) && ((abs(x - this.startDragPoint.X) > 5) || (abs(y - this.startDragPoint.Y) > 5))) {
            if (this.commandList.rightButtonDown) {
                // don't initialize for first few pixels so any wobbling at the start doesn't start you out
                //    in the wrong direction 
                this.rotateDirection = updcom.kRotateZ
            } else if (abs(x - this.startDragPoint.X) > abs(y - this.startDragPoint.Y)) {
                this.rotateDirection = updcom.kRotateX
            } else {
                this.rotateDirection = updcom.kRotateY
            }
            switch (this.rotateDirection) {
                case updcom.kRotateX:
                    this.rotateStartAngle = this.paintBoxClickedIn.xRotation
                    break
                case updcom.kRotateY:
                    this.rotateStartAngle = this.paintBoxClickedIn.yRotation
                    break
                case updcom.kRotateZ:
                    this.rotateStartAngle = this.paintBoxClickedIn.zRotation
                    break
        }
        switch (this.rotateDirection) {
            case updcom.kRotateX:
                this.paintBoxClickedIn.xRotation = umath.min(360, umath.max(-360, this.rotateStartAngle + (x - this.startDragPoint.X) * 0.5))
                break
            case updcom.kRotateY:
                this.paintBoxClickedIn.yRotation = umath.min(360, umath.max(-360, this.rotateStartAngle + (y - this.startDragPoint.Y) * 0.5))
                break
            case updcom.kRotateZ:
                this.paintBoxClickedIn.zRotation = umath.min(360, umath.max(-360, this.rotateStartAngle + (this.startDragPoint.X - x) * 0.5))
                break
        this.updateForChangeToClickedOnPaintBox()
    }
    
    addTrianglePoints(x: short, y: short): void {
        let pointIndex: short
        let newCommand: PdCommand
        let circleRect: TRect
        let newPoint: TPoint
        
        this.numNewPoints += 1
        pointIndex = this.pointIndexAtMouse(x, y)
        this.newPointIndexes[this.numNewPoints - 1] = pointIndex
        if (pointIndex >= 0) {
            this.newPoints[this.numNewPoints - 1] = this.tdo.points[pointIndex]
        } else {
            this.newPoints[this.numNewPoints - 1].x = (x - this.editPaintBox.drawPosition.X) / this.editPaintBox.scale
            this.newPoints[this.numNewPoints - 1].y = (y - this.editPaintBox.drawPosition.Y) / this.editPaintBox.scale
            this.newPoints[this.numNewPoints - 1].z = 0
        }
        this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.editPaintBox.bitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.editPaintBox.bitmap.Canvas.Brush.Color = kUnconnectedPointColor
        this.editPaintBox.bitmap.Canvas.Pen.Color = kUnconnectedPointColor
        newPoint.X = this.editPaintBox.drawPosition.X + intround(this.newPoints[this.numNewPoints - 1].x * this.editPaintBox.scale)
        newPoint.Y = this.editPaintBox.drawPosition.Y + intround(this.newPoints[this.numNewPoints - 1].y * this.editPaintBox.scale)
        circleRect = Rect(newPoint.X - this.pointRadius, newPoint.Y - this.pointRadius, newPoint.X + this.pointRadius, newPoint.Y + this.pointRadius)
        this.editPaintBox.bitmap.Canvas.Ellipse(circleRect.Left, circleRect.Top, circleRect.Right, circleRect.Bottom)
        if (this.numNewPoints >= 3) {
            newCommand = PdAddTdoTriangleCommand().createWithTdoAndNewPoints(this.tdo, this.newPointIndexes, this.newPoints)
            this.numNewPoints = 0
            this.newPointIndexes[0] = 0
            this.newPointIndexes[1] = 0
            this.newPointIndexes[2] = 0
            this.doCommand(newCommand)
        }
        if (this.numNewPoints < 3) {
            this.drawPaintBoxBitmapOnCanvas(this.editPaintBox)
        }
    }
    
    drawPaintBoxBitmapOnCanvas(aPaintBox: PdTdoPaintBox): void {
        if (aPaintBox !== null) {
            ubmpsupport.copyBitmapToCanvasWithGlobalPalette(aPaintBox.bitmap, aPaintBox.Canvas, Rect(0, 0, 0, 0))
        }
    }
    
    lightUpAddingLineAtMouse(x: short, y: short): void {
        let firstPoint: TPoint
        let secondPoint: TPoint
        
        this.editPaintBox.bitmap.Canvas.Brush.Color = delphi_compatability.clWindow
        this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.editPaintBox.bitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
        this.editPaintBox.bitmap.Canvas.FillRect(Rect(0, 0, this.editPaintBox.Width, this.editPaintBox.Height))
        this.drawTdoOnTdoPaintBox(this.editPaintBox, umain.kDontDrawYet)
        this.lightUpPointAtMouse(x, y, umain.kDontDrawYet)
        firstPoint.X = this.editPaintBox.drawPosition.X + intround(this.newPoints[0].x * this.editPaintBox.scale)
        firstPoint.Y = this.editPaintBox.drawPosition.Y + intround(this.newPoints[0].y * this.editPaintBox.scale)
        if (this.numNewPoints > 1) {
            secondPoint.X = this.editPaintBox.drawPosition.X + intround(this.newPoints[1].x * this.editPaintBox.scale)
            secondPoint.Y = this.editPaintBox.drawPosition.Y + intround(this.newPoints[1].y * this.editPaintBox.scale)
        }
        this.editPaintBox.bitmap.Canvas.Pen.Color = kUnconnectedPointColor
        this.editPaintBox.bitmap.Canvas.MoveTo(firstPoint.X, firstPoint.Y)
        if (this.numNewPoints > 1) {
            this.editPaintBox.bitmap.Canvas.LineTo(secondPoint.X, secondPoint.Y)
        }
        this.editPaintBox.bitmap.Canvas.LineTo(x, y)
        this.editPaintBox.bitmap.Canvas.Pen.Color = kUnconnectedPointColor
        this.editPaintBox.bitmap.Canvas.Brush.Color = kUnconnectedPointColor
        this.editPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.editPaintBox.bitmap.Canvas.Ellipse(firstPoint.X - this.pointRadius, firstPoint.Y - this.pointRadius, firstPoint.X + this.pointRadius, firstPoint.Y + this.pointRadius)
        if (this.numNewPoints > 1) {
            this.editPaintBox.bitmap.Canvas.Ellipse(secondPoint.X - this.pointRadius, secondPoint.Y - this.pointRadius, secondPoint.X + this.pointRadius, secondPoint.Y + this.pointRadius)
        }
        this.editPaintBox.bitmap.Canvas.Ellipse(x - this.pointRadius + 1, y - this.pointRadius + 1, x + this.pointRadius - 1, y + this.pointRadius - 1)
        this.drawPaintBoxBitmapOnCanvas(this.editPaintBox)
    }
    
    makeMouseCommand(point: TPoint, shift: boolean, ctrl: boolean): PdCommand {
        let result = new PdCommand()
        result = null
        if (this.paintBoxClickedIn !== this.editPaintBox) {
            return result
        }
        switch (this.cursorMode) {
            case kCursorModeAddTriangles:
                break
            case kCursorModeDeleteTriangles:
                if (this.paintBoxClickedIn === this.editPaintBox) {
                    //handled in mouse up
                    result = PdRemoveTdoTriangleCommand().createWithTdo(this.tdo)
                }
                break
            case kCursorModeDragPoints:
                if (this.paintBoxClickedIn === this.editPaintBox) {
                    result = PdDragTdoPointCommand().createWithTdoAndScale(this.tdo, this.paintBoxClickedIn.scale)
                }
                break
        return result
    }
    
    // drawing 
    // ------------------------------------------------------------------------------------- *drawing 
    editPaintBoxPaint(Sender: TObject): void {
        this.checkImageForBitmapSizeAndFill(this.editPaintBox)
        this.drawTdoOnTdoPaintBox(this.editPaintBox, umain.kDrawNow)
    }
    
    viewPaintBoxOnePaint(Sender: TObject): void {
        this.checkImageForBitmapSizeAndFill(this.viewPaintBoxOne)
        this.drawTdoOnTdoPaintBox(this.viewPaintBoxOne, umain.kDrawNow)
    }
    
    viewPaintBoxTwoPaint(Sender: TObject): void {
        this.checkImageForBitmapSizeAndFill(this.viewPaintBoxTwo)
        this.drawTdoOnTdoPaintBox(this.viewPaintBoxTwo, umain.kDrawNow)
    }
    
    checkImageForBitmapSizeAndFill(aPaintBox: PdTdoPaintBox): void {
        if ((aPaintBox.bitmap.Width !== aPaintBox.Width) || (aPaintBox.bitmap.Height !== aPaintBox.Height)) {
            try {
                aPaintBox.bitmap.Width = aPaintBox.Width
                aPaintBox.bitmap.Height = aPaintBox.Height
            } catch (Exception e) {
                aPaintBox.bitmap.Width = 1
                aPaintBox.bitmap.Height = 1
            }
        }
        aPaintBox.bitmap.Canvas.Brush.Color = delphi_compatability.clWindow
        aPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        aPaintBox.bitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
        aPaintBox.bitmap.Canvas.FillRect(Rect(0, 0, aPaintBox.Width, aPaintBox.Height))
    }
    
    drawTdoOnTdoPaintBox(aPaintBox: PdTdoPaintBox, immediate: boolean): void {
        let turtle: KfTurtle
        let i: short
        let parts: short
        let wasFillingTriangles: boolean
        let pointOfConnection: TPoint
        
        if (this.tdo === null) {
            return
        }
        turtle = uturtle.KfTurtle.defaultStartUsing()
        try {
            // set up turtle
            turtle.drawingSurface.pane = aPaintBox.bitmap.Canvas
            turtle.setDrawOptionsForDrawingTdoOnly()
            turtle.drawOptions.drawLines = this.drawLines.Checked
            turtle.drawOptions.wireFrame = !this.fillTriangles.Checked
            turtle.drawOptions.circlePoints = aPaintBox === this.editPaintBox
            if (aPaintBox === this.editPaintBox) {
                turtle.drawOptions.circlePointRadius = this.pointRadius
                turtle.drawingSurface.circleColor = kConnectedPointColor
            }
            // must be after pane and draw options set 
            turtle.reset()
            turtle.xyz(aPaintBox.drawPosition.X, aPaintBox.drawPosition.Y, 0)
            turtle.resetBoundsRect(aPaintBox.drawPosition)
            turtle.rotateX(aPaintBox.yRotation * 256 / 360)
            turtle.rotateY(aPaintBox.xRotation * 256 / 360)
            turtle.rotateZ(aPaintBox.zRotation * 256 / 360)
            // draw parts
            parts = this.plantParts.Value
            if (aPaintBox === this.editPaintBox) {
                parts = 1
            }
            if (parts === 0) {
                throw new GeneralException.create("Zero parts not allowed.")
            }
            turtle.drawingSurface.recordingStart()
            if (parts > 1) {
                turtle.rotateZ(-64)
            }
            for (i = 0; i <= parts - 1; i++) {
                if (parts > 1) {
                    turtle.rotateX(256 / parts)
                    turtle.push()
                    turtle.rotateY(64)
                    turtle.rotateX(64)
                }
                this.tdo.draw(turtle, aPaintBox.scale, "", "", 0, 0)
                if ((this.mirrorHalf.Checked) && (!(aPaintBox === this.editPaintBox))) {
                    turtle.push()
                    turtle.rotateY(256 / 2)
                    this.tdo.reverseZValues()
                    turtle.drawingSurface.foreColor = UNRESOLVED.rgb(255, 255, 200)
                    turtle.drawingSurface.backColor = UNRESOLVED.rgb(255, 255, 200)
                    turtle.drawingSurface.lineColor = delphi_compatability.clBlack
                    this.tdo.draw(turtle, aPaintBox.scale, "", "", 0, 0)
                    turtle.drawingSurface.foreColor = utdo.kTdoForeColor
                    turtle.drawingSurface.backColor = utdo.kTdoBackColor
                    this.tdo.reverseZValues()
                    turtle.pop()
                }
                if (parts > 1) {
                    turtle.pop()
                }
            }
            turtle.drawingSurface.recordingStop()
            turtle.drawingSurface.recordingDraw()
            turtle.drawingSurface.clearTriangles()
            if (aPaintBox === this.editPaintBox) {
                // if edit panel, get new locations of edit points
                this.numEditPoints = turtle.recordedPointsInUse
                if (this.numEditPoints > 0) {
                    for (i = 0; i <= this.numEditPoints - 1; i++) {
                        this.editPoints[i] = Point(intround(turtle.recordedPoints[i].x), intround(turtle.recordedPoints[i].y))
                    }
                }
                if (this.numEditPoints > 0) {
                    // draw connection point circle in black over rest
                    aPaintBox.bitmap.Canvas.Brush.Color = kOriginPointColor
                    aPaintBox.bitmap.Canvas.Pen.Color = kOriginPointColor
                    pointOfConnection = this.editPoints[this.tdo.originPointIndex]
                    aPaintBox.bitmap.Canvas.Ellipse(pointOfConnection.X - this.pointRadius, pointOfConnection.Y - this.pointRadius, pointOfConnection.X + this.pointRadius, pointOfConnection.Y + this.pointRadius)
                }
                if (this.draggingPoint) {
                    this.lightUpPointAtMouse(this.commandList.previousPoint.X, this.commandList.previousPoint.Y, umain.kDontDrawYet)
                }
            }
            // get bounds rect from turtle
            aPaintBox.tdoBoundsRect = turtle.boundsRect()
            // draw border
            aPaintBox.bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            aPaintBox.bitmap.Canvas.Pen.Color = UNRESOLVED.clBtnText
            aPaintBox.bitmap.Canvas.Rectangle(0, 0, aPaintBox.Width, aPaintBox.Height)
            if (immediate) {
                // draw
                this.drawPaintBoxBitmapOnCanvas(aPaintBox)
            }
        } finally {
            uturtle.KfTurtle.defaultStopUsing()
        }
    }
    
    centerDrawingInPaintBox(aPaintBox: PdTdoPaintBox): void {
        let newScaleX: float
        let newScaleY: float
        let centerPointOfTdoBoundsRect: TPoint
        let centerOfPaintBox: TPoint
        let offset: TPoint
        
        if (aPaintBox === null) {
            return
        }
        // set high so it will never be too small
        aPaintBox.scale = 100.0
        // 1. draw to determine new scale 
        this.drawTdoOnTdoPaintBox(aPaintBox, umain.kDontDrawYet)
        newScaleX = umath.safedivExcept(0.95 * aPaintBox.scale * aPaintBox.Width, usupport.rWidth(aPaintBox.tdoBoundsRect), 0.1)
        newScaleY = umath.safedivExcept(0.95 * aPaintBox.scale * aPaintBox.Height, usupport.rHeight(aPaintBox.tdoBoundsRect), 0.1)
        aPaintBox.scale = umath.min(newScaleX, newScaleY)
        // 2. draw to determine shift of drawPosition if any - fill in case this is last draw 
        aPaintBox.bitmap.Canvas.Brush.Color = delphi_compatability.clWhite
        aPaintBox.bitmap.Canvas.FillRect(Rect(0, 0, aPaintBox.Width, aPaintBox.Height))
        this.drawTdoOnTdoPaintBox(aPaintBox, umain.kDontDrawYet)
        // v2 improved how this is done
        centerPointOfTdoBoundsRect = Point(aPaintBox.tdoBoundsRect.Left + (aPaintBox.tdoBoundsRect.Right - aPaintBox.tdoBoundsRect.Left) / 2, aPaintBox.tdoBoundsRect.Top + (aPaintBox.tdoBoundsRect.Bottom - aPaintBox.tdoBoundsRect.Top) / 2)
        centerOfPaintBox = Point(aPaintBox.Width / 2, aPaintBox.Height / 2)
        offset = Point(centerOfPaintBox.X - centerPointOfTdoBoundsRect.X, centerOfPaintBox.Y - centerPointOfTdoBoundsRect.Y)
        aPaintBox.drawPosition.X = aPaintBox.drawPosition.X + offset.X
        aPaintBox.drawPosition.Y = aPaintBox.drawPosition.Y + offset.Y
        // 3. draw with new scale and position if position changed 
        aPaintBox.bitmap.Canvas.Brush.Color = delphi_compatability.clWhite
        aPaintBox.bitmap.Canvas.FillRect(Rect(0, 0, aPaintBox.Width, aPaintBox.Height))
        this.drawTdoOnTdoPaintBox(aPaintBox, umain.kDontDrawYet)
        this.drawPaintBoxBitmapOnCanvas(aPaintBox)
    }
    
    // ------------------------------------------------------------------------ *toolbar 
    scrollCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeScroll
        if ((this.editPaintBox !== null) && (this.viewPaintBoxOne !== null) && (this.viewPaintBoxTwo !== null)) {
            this.editPaintBox.Cursor = ucursor.crScroll
            this.viewPaintBoxOne.Cursor = ucursor.crScroll
            this.viewPaintBoxTwo.Cursor = ucursor.crScroll
        }
    }
    
    magnifyCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeMagnify
        this.editPaintBox.Cursor = ucursor.crMagPlus
        this.viewPaintBoxOne.Cursor = ucursor.crMagPlus
        this.viewPaintBoxTwo.Cursor = ucursor.crMagPlus
    }
    
    rotateCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeRotate
        //can't rotate edit picture
        this.editPaintBox.Cursor = delphi_compatability.crDefault
        this.viewPaintBoxOne.Cursor = ucursor.crRotate
        this.viewPaintBoxTwo.Cursor = ucursor.crRotate
    }
    
    addTrianglePointsCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeAddTriangles
        this.editPaintBox.Cursor = ucursor.crAddTriangle
        this.viewPaintBoxOne.Cursor = delphi_compatability.crDefault
        this.viewPaintBoxTwo.Cursor = delphi_compatability.crDefault
    }
    
    removeTriangleCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeDeleteTriangles
        this.editPaintBox.Cursor = ucursor.crDeleteTriangle
        this.viewPaintBoxOne.Cursor = delphi_compatability.crDefault
        this.viewPaintBoxTwo.Cursor = delphi_compatability.crDefault
    }
    
    dragCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeDragPoints
        this.editPaintBox.Cursor = ucursor.crDragPoint
        this.viewPaintBoxOne.Cursor = delphi_compatability.crDefault
        this.viewPaintBoxTwo.Cursor = delphi_compatability.crDefault
    }
    
    flipTriangleCursorModeClick(Sender: TObject): void {
        this.cursorMode = kCursorModeFlipTriangles
        this.editPaintBox.Cursor = ucursor.crFlipTriangle
        this.viewPaintBoxOne.Cursor = delphi_compatability.crDefault
        this.viewPaintBoxTwo.Cursor = delphi_compatability.crDefault
    }
    
    FormKeyDown(Sender: TObject, Key: byte, Shift: TShiftState): void {
        if (Key === delphi_compatability.VK_SHIFT) {
            if (this.cursorMode === kCursorModeMagnify) {
                this.editPaintBox.Cursor = ucursor.crMagMinus
                this.viewPaintBoxOne.Cursor = ucursor.crMagMinus
                this.viewPaintBoxTwo.Cursor = ucursor.crMagMinus
            }
        }
        return Key
    }
    
    FormKeyUp(Sender: TObject, Key: byte, Shift: TShiftState): void {
        if (Key === delphi_compatability.VK_SHIFT) {
            if (this.cursorMode === kCursorModeMagnify) {
                this.editPaintBox.Cursor = ucursor.crMagPlus
                this.viewPaintBoxOne.Cursor = ucursor.crMagPlus
                this.viewPaintBoxTwo.Cursor = ucursor.crMagPlus
            }
        }
        return Key
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
    magnifyPlusClick(Sender: TObject): void {
        if (this.editPaintBox !== null) {
            this.editPaintBox.magnifyOrReduce(this.editPaintBox.scale * 1.5, this.editPaintBox.drawPosition)
        }
        if (this.viewPaintBoxOne !== null) {
            this.viewPaintBoxOne.magnifyOrReduce(this.viewPaintBoxOne.scale * 1.5, this.viewPaintBoxOne.drawPosition)
        }
        if (this.viewPaintBoxTwo !== null) {
            this.viewPaintBoxTwo.magnifyOrReduce(this.viewPaintBoxTwo.scale * 1.5, this.viewPaintBoxTwo.drawPosition)
        }
    }
    
    magnifyMinusClick(Sender: TObject): void {
        if (this.editPaintBox !== null) {
            this.editPaintBox.magnifyOrReduce(this.editPaintBox.scale * 0.75, this.editPaintBox.drawPosition)
        }
        if (this.viewPaintBoxOne !== null) {
            this.viewPaintBoxOne.magnifyOrReduce(this.viewPaintBoxOne.scale * 0.75, this.viewPaintBoxOne.drawPosition)
        }
        if (this.viewPaintBoxTwo !== null) {
            this.viewPaintBoxTwo.magnifyOrReduce(this.viewPaintBoxTwo.scale * 0.75, this.viewPaintBoxTwo.drawPosition)
        }
    }
    
    centerDrawingClick(Sender: TObject): void {
        if (this.editPaintBox !== null) {
            this.centerDrawingInPaintBox(this.editPaintBox)
        }
        if (this.viewPaintBoxOne !== null) {
            this.centerDrawingInPaintBox(this.viewPaintBoxOne)
        }
        if (this.viewPaintBoxTwo !== null) {
            this.centerDrawingInPaintBox(this.viewPaintBoxTwo)
        }
    }
    
    resetRotationsClick(Sender: TObject): void {
        if (this.editPaintBox !== null) {
            this.editPaintBox.resetRotations()
        }
        if (this.viewPaintBoxOne !== null) {
            this.viewPaintBoxOne.resetRotations()
        }
        if (this.viewPaintBoxTwo !== null) {
            this.viewPaintBoxTwo.resetRotations()
        }
    }
    
    mirrorTdoClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        newCommand = PdMirrorTdoCommand().createWithTdo(this.tdo)
        this.doCommand(newCommand)
    }
    
    reverseZValuesClick(Sender: TObject): void {
        let newCommand: PdCommand
        
        newCommand = PdReverseZValuesTdoCommand().createWithTdo(this.tdo)
        this.doCommand(newCommand)
    }
    
    // --------------------------------------------------------------------------------------- *resizing and splitting 
    FormResize(Sender: TObject): void {
        let newTop: short
        let newLeft: short
        let widthBeforeButtons: short
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.tdo === null) {
            return
        }
        if (this.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            return
        }
        this.verticalSplitter.Visible = false
        this.horizontalSplitter.Visible = false
        widthBeforeButtons = umath.intMax(0, this.ClientWidth - this.ok.Width - kBetweenGap * 2)
        // pictures panel 
        this.picturesPanel.SetBounds(0, this.toolbarPanel.Height, widthBeforeButtons, umath.intMax(0, this.ClientHeight - this.optionsPanel.Height - this.toolbarPanel.Height - 4))
        if (this.lastPicturesPanelWidth !== 0) {
            // vertical splitter 
            newLeft = intround(1.0 * this.verticalSplitter.Left * this.picturesPanel.Width / this.lastPicturesPanelWidth)
        } else {
            newLeft = this.picturesPanel.Width / 2
        }
        if (newLeft >= this.picturesPanel.Width) {
            newLeft = this.picturesPanel.Width - 1
        }
        if (newLeft < 0) {
            newLeft = 0
        }
        this.verticalSplitter.SetBounds(newLeft, 0, this.verticalSplitter.Width, this.picturesPanel.Height)
        if (this.lastPicturesPanelHeight !== 0) {
            // horizontal splitter 
            newTop = intround(1.0 * this.horizontalSplitter.Top * this.picturesPanel.Height / this.lastPicturesPanelHeight)
        } else {
            newTop = this.picturesPanel.Height / 2
        }
        if (newTop >= this.picturesPanel.Height) {
            newTop = this.picturesPanel.Height - 1
        }
        if (newTop < 0) {
            newTop = 0
        }
        this.horizontalSplitter.SetBounds(this.verticalSplitter.Left + this.verticalSplitter.Width, newTop, umath.intMax(0, this.picturesPanel.Width - this.verticalSplitter.Left - this.verticalSplitter.Width), this.horizontalSplitter.Height)
        this.internalChange = true
        this.resizeImagesToVerticalSplitter()
        this.resizeImagesToHorizontalSplitter()
        this.internalChange = false
        this.setInitialDrawPositionsIfNotSet()
        // rest of window 
        this.toolbarPanel.SetBounds(0, 0, this.picturesPanel.Width, this.toolbarPanel.Height)
        this.optionsPanel.SetBounds(0, this.picturesPanel.Top + this.picturesPanel.Height + 4, this.picturesPanel.Width, this.optionsPanel.Height)
        this.ok.Left = this.ClientWidth - this.ok.Width - kBetweenGap
        this.cancel.Left = this.ok.Left
        this.undoLast.Left = this.ok.Left
        this.redoLast.Left = this.ok.Left
        this.renameTdo.Left = this.ok.Left
        this.clearTdo.Left = this.ok.Left
        this.writeToDXF.Left = this.ok.Left
        this.ReadFromDXF.Left = this.ok.Left
        this.writeToPOV.Left = this.ok.Left
        this.helpButton.Left = this.ok.Left
        this.lastPicturesPanelWidth = this.picturesPanel.Width
        this.lastPicturesPanelHeight = this.picturesPanel.Height
        this.verticalSplitter.Visible = true
        this.horizontalSplitter.Visible = true
    }
    
    resizeImagesToVerticalSplitter(): void {
        let newLeft: short
        
        if (this.editPaintBox !== null) {
            this.editPaintBox.SetBounds(0, 0, this.verticalSplitter.Left, this.picturesPanel.Height)
        }
        newLeft = this.verticalSplitter.Left + this.verticalSplitter.Width
        this.horizontalSplitter.SetBounds(newLeft, this.horizontalSplitter.Top, umath.intMax(0, this.picturesPanel.Width - newLeft), this.horizontalSplitter.Height)
        if (this.viewPaintBoxOne !== null) {
            this.viewPaintBoxOne.SetBounds(newLeft, this.viewPaintBoxOne.Top, umath.intMax(0, this.picturesPanel.Width - newLeft), this.viewPaintBoxOne.Height)
        }
        if (this.viewPaintBoxTwo !== null) {
            this.viewPaintBoxTwo.SetBounds(newLeft, this.viewPaintBoxTwo.Top, umath.intMax(0, this.picturesPanel.Width - newLeft), this.viewPaintBoxTwo.Height)
        }
        if (!this.internalChange) {
            this.updateForChangeToTdo()
        }
    }
    
    resizeImagesToHorizontalSplitter(): void {
        let newTop: short
        
        if (this.viewPaintBoxOne !== null) {
            this.viewPaintBoxOne.SetBounds(this.viewPaintBoxOne.Left, 0, this.viewPaintBoxOne.Width, this.horizontalSplitter.Top)
        }
        newTop = this.horizontalSplitter.Top + this.horizontalSplitter.Height
        if (this.viewPaintBoxTwo !== null) {
            this.viewPaintBoxTwo.SetBounds(this.viewPaintBoxTwo.Left, newTop, this.viewPaintBoxTwo.Width, umath.intMax(0, this.picturesPanel.Height - newTop))
        }
        if (!this.internalChange) {
            this.updateForChangeToTdo()
        }
    }
    
    setInitialDrawPositionsIfNotSet(): void {
        if (this.editPaintBox !== null) {
            if ((this.editPaintBox.drawPosition.X === 0) && (this.editPaintBox.drawPosition.Y === 0)) {
                this.editPaintBox.drawPosition = Point(this.editPaintBox.Width / 2, this.editPaintBox.Height - 10)
                this.editPaintBox.Paint()
            }
        }
        if (this.viewPaintBoxOne !== null) {
            if ((this.viewPaintBoxOne.drawPosition.X === 0) && (this.viewPaintBoxOne.drawPosition.Y === 0)) {
                this.viewPaintBoxOne.drawPosition = Point(this.viewPaintBoxOne.Width / 2, this.viewPaintBoxOne.Height - 10)
                this.viewPaintBoxOne.Paint()
            }
        }
        if (this.viewPaintBoxTwo !== null) {
            if ((this.viewPaintBoxTwo.drawPosition.X === 0) && (this.viewPaintBoxTwo.drawPosition.Y === 0)) {
                this.viewPaintBoxTwo.drawPosition = Point(this.viewPaintBoxTwo.Width / 2, this.viewPaintBoxTwo.Height - 10)
                this.viewPaintBoxTwo.Paint()
            }
        }
    }
    
    verticalSplitterMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.verticalSplitterDragging = true
        this.verticalSplitterStartPos = X
        this.verticalSplitterLastDrawPos = -1
        this.verticalSplitterNeedToRedraw = true
    }
    
    verticalSplitterMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        if (this.verticalSplitterDragging && (this.verticalSplitter.Left + X >= kSplitterDragToLeftMinPixels) && (this.verticalSplitter.Left + X < this.picturesPanel.Width - kSplitterDragToRightMinPixels)) {
            this.undrawVerticalSplitterLine()
            this.verticalSplitterLastDrawPos = this.drawVerticalSplitterLine(X)
        }
    }
    
    verticalSplitterMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (this.verticalSplitterDragging) {
            this.undrawVerticalSplitterLine()
            this.verticalSplitter.Left = this.verticalSplitter.Left - (this.verticalSplitterStartPos - X)
            if (this.verticalSplitter.Left < kSplitterDragToLeftMinPixels) {
                this.verticalSplitter.Left = kSplitterDragToLeftMinPixels
            }
            if (this.verticalSplitter.Left > this.picturesPanel.Width - kSplitterDragToRightMinPixels) {
                this.verticalSplitter.Left = this.picturesPanel.Width - kSplitterDragToRightMinPixels
            }
            this.resizeImagesToVerticalSplitter()
            this.verticalSplitterDragging = false
        }
    }
    
    drawVerticalSplitterLine(pos: int): int {
        let result = 0
        let theDC: HDC
        
        theDC = UNRESOLVED.getDC(0)
        result = this.ClientOrigin.X + this.verticalSplitter.Left + pos + 2
        UNRESOLVED.patBlt(theDC, result, this.ClientOrigin.Y + this.picturesPanel.Top + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.verticalSplitterNeedToRedraw = true
        return result
    }
    
    undrawVerticalSplitterLine(): void {
        let theDC: HDC
        
        if (!this.verticalSplitterNeedToRedraw) {
            return
        }
        theDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.verticalSplitterLastDrawPos, this.ClientOrigin.Y + this.picturesPanel.Top + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.verticalSplitterNeedToRedraw = false
    }
    
    horizontalSplitterMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.horizontalSplitterDragging = true
        this.horizontalSplitterStartPos = Y
        this.horizontalSplitterLastDrawPos = -1
        this.horizontalSplitterNeedToRedraw = true
    }
    
    horizontalSplitterMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        if (this.horizontalSplitterDragging && (this.horizontalSplitter.Top + Y >= kSplitterDragToTopMinPixels) && (this.horizontalSplitter.Top + Y < this.picturesPanel.Height - kSplitterDragToBottomMinPixels)) {
            this.undrawHorizontalSplitterLine()
            this.horizontalSplitterLastDrawPos = this.drawHorizontalSplitterLine(Y)
        }
    }
    
    horizontalSplitterMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (this.horizontalSplitterDragging) {
            this.undrawHorizontalSplitterLine()
            this.horizontalSplitter.Top = this.horizontalSplitter.Top - (this.horizontalSplitterStartPos - Y)
            if (this.horizontalSplitter.Top < kSplitterDragToTopMinPixels) {
                this.horizontalSplitter.Top = kSplitterDragToTopMinPixels
            }
            if (this.horizontalSplitter.Top > this.picturesPanel.Height - kSplitterDragToBottomMinPixels) {
                this.horizontalSplitter.Top = this.picturesPanel.Height - kSplitterDragToBottomMinPixels
            }
            this.resizeImagesToHorizontalSplitter()
            this.horizontalSplitterDragging = false
        }
    }
    
    // splitting 
    drawHorizontalSplitterLine(pos: int): int {
        let result = 0
        let theDC: HDC
        
        theDC = UNRESOLVED.getDC(0)
        result = this.ClientOrigin.Y + this.horizontalSplitter.Top + pos + 2
        UNRESOLVED.patBlt(theDC, this.ClientOrigin.X + this.horizontalSplitter.Left, result, this.horizontalSplitter.Width, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.horizontalSplitterNeedToRedraw = true
        return result
    }
    
    undrawHorizontalSplitterLine(): void {
        let theDC: HDC
        
        if (!this.horizontalSplitterNeedToRedraw) {
            return
        }
        theDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.ClientOrigin.X + this.horizontalSplitter.Left, this.horizontalSplitterLastDrawPos, this.horizontalSplitter.Width, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.horizontalSplitterNeedToRedraw = false
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 456
        UNRESOLVED.ptMinTrackSize.y = 260
    }
    
    fillTrianglesClick(Sender: TObject): void {
        if (!this.fillTriangles.Checked) {
            this.drawLines.Checked = true
            this.drawLines.Enabled = false
        } else {
            this.drawLines.Enabled = true
        }
        if (this.internalChange) {
            return
        }
        this.updateForChangeToTdo()
    }
    
    mirrorHalfClick(Sender: TObject): void {
        this.updateForChangeToTdo()
    }
    
    drawLinesClick(Sender: TObject): void {
        if (this.internalChange) {
            return
        }
        this.updateForChangeToTdo()
    }
    
    plantPartsChange(Sender: TObject): void {
        if (this.internalChange) {
            return
        }
        this.updateForChangeToTdo()
    }
    
    circlePointSizeChange(Sender: TObject): void {
        if (this.internalChange) {
            return
        }
        this.pointRadius = this.circlePointSize.Value / 2
        this.updateForChangeToTdo()
    }
    
    connectionPointChange(Sender: TObject): void {
        let oldPoint: TPoint
        let newPoint: TPoint
        
        if (this.internalChange) {
            return
        }
        if (this.connectionPoint.Value - 1 !== this.tdo.originPointIndex) {
            if ((this.tdo.originPointIndex >= 0) && (this.tdo.originPointIndex <= this.numEditPoints - 1)) {
                // adjust drawing point so 3D object does not move
                oldPoint = this.editPoints[this.tdo.originPointIndex]
            } else {
                oldPoint = Point(0, 0)
            }
            if ((this.connectionPoint.Value - 1 >= 0) && (this.connectionPoint.Value - 1 <= this.numEditPoints - 1)) {
                newPoint = this.editPoints[this.connectionPoint.Value - 1]
            } else {
                newPoint = Point(0, 0)
            }
            this.editPaintBox.drawPosition.X = this.editPaintBox.drawPosition.X + (newPoint.X - oldPoint.X)
            this.editPaintBox.drawPosition.Y = this.editPaintBox.drawPosition.Y + (newPoint.Y - oldPoint.Y)
        }
        this.tdo.setOriginPointIndex(this.connectionPoint.Value - 1)
        if (this.editPaintBox !== null) {
            this.editPaintBox.Paint()
        }
        this.updateForChangeToConnectionPointIndex()
    }
    
    // commands 
    // ------------------------------------------------------------------------ *commands 
    doCommand(command: PdCommand): void {
        this.commandList.doCommand(command)
        this.updateButtonsForUndoRedo()
        this.updateForChangeToTdo()
    }
    
}

export class PdTdoCommand {
    tdo: KfObject3D = new KfObject3D()
    lastCommandWasApply: boolean = false
    lastCommandWasUndoApply: boolean = false
    PdTdoCommand.prototype = new PdCommand()
    PdTdoCommand.prototype.constructor = PdTdoCommand
    
    // ------------------------------------------------------------------------ PdTdoCommand 
    createWithTdo(aTdo: KfObject3D): void {
        PdCommand.prototype.create.call(this)
        this.commandChangesPlantFile = false
        this.tdo = aTdo
        this.lastCommandWasApply = TdoEditorForm.lastCommandWasApply
        this.lastCommandWasUndoApply = TdoEditorForm.lastCommandWasUndoApply
    }
    
    doCommand(): void {
        PdCommand.prototype.doCommand.call(this)
        TdoEditorForm.lastCommandWasApply = false
        TdoEditorForm.lastCommandWasUndoApply = false
    }
    
    undoCommand(): void {
        PdCommand.prototype.undoCommand.call(this)
        TdoEditorForm.lastCommandWasApply = this.lastCommandWasApply
        TdoEditorForm.lastCommandWasUndoApply = this.lastCommandWasUndoApply
    }
    
}

export class PdDragTdoPointCommand {
    scale: float = 0.0
    movingPointIndex: short = 0
    dragStartPoint: TPoint = new TPoint()
    oldPoint3D: KfPoint3D = new KfPoint3D()
    newPoint3D: KfPoint3D = new KfPoint3D()
    PdDragTdoPointCommand.prototype = new PdTdoCommand()
    PdDragTdoPointCommand.prototype.constructor = PdDragTdoPointCommand
    
    // -------------------------------------------------------------------- PdDragTdoPointCommand 
    createWithTdoAndScale(aTdo: KfObject3D, aScale: float): void {
        PdTdoCommand.prototype.createWithTdo.call(this, aTdo)
        this.scale = aScale
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
            this.movingPointIndex = TdoEditorForm.pointIndexAtMouse(nextPoint.X, nextPoint.Y)
            TdoEditorForm.draggingPoint = true
            TdoEditorForm.pointIndexBeingDragged = this.movingPointIndex
            if (this.movingPointIndex < 0) {
                result = null
                this.free
            } else {
                this.dragStartPoint = nextPoint
                this.oldPoint3D = this.tdo.points[this.movingPointIndex]
                this.newPoint3D = this.oldPoint3D
            }
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
            if (rightButtonDown) {
                this.newPoint3D.z = this.oldPoint3D.z - (nextPoint.Y - this.dragStartPoint.Y) / this.scale
            } else {
                this.newPoint3D.x = this.oldPoint3D.x + (nextPoint.X - this.dragStartPoint.X) / this.scale
                this.newPoint3D.y = this.oldPoint3D.y + (nextPoint.Y - this.dragStartPoint.Y) / this.scale
            }
            this.tdo.points[this.movingPointIndex] = this.newPoint3D
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            if (!mouseDidMove) {
                result = null
                this.free
            }
        }
        return result
    }
    
    undoCommand(): void {
        PdTdoCommand.prototype.undoCommand.call(this)
        this.tdo.points[this.movingPointIndex] = this.oldPoint3D
    }
    
    redoCommand(): void {
        PdTdoCommand.prototype.doCommand.call(this)
        this.tdo.points[this.movingPointIndex] = this.newPoint3D
    }
    
    description(): string {
        let result = ""
        result = "drag"
        return result
    }
    
}

export class PdRenameTdoCommand {
    oldName: string = ""
    newName: string = ""
    PdRenameTdoCommand.prototype = new PdTdoCommand()
    PdRenameTdoCommand.prototype.constructor = PdRenameTdoCommand
    
    // --------------------------------------------------------------------------- PdRenameTdoCommand 
    createWithTdoAndNewName(aTdo: KfObject3D, aName: string): void {
        PdTdoCommand.prototype.createWithTdo.call(this, aTdo)
        this.oldName = this.tdo.getName()
        this.newName = aName
    }
    
    doCommand(): void {
        this.tdo.setName(this.newName)
        TdoEditorForm.updateCaptionForNewTdoName()
        PdTdoCommand.prototype.doCommand.call(this)
    }
    
    undoCommand(): void {
        this.tdo.setName(this.oldName)
        TdoEditorForm.updateCaptionForNewTdoName()
        PdTdoCommand.prototype.undoCommand.call(this)
    }
    
    description(): string {
        let result = ""
        result = "rename"
        return result
    }
    
}

export class PdReplaceTdoCommand {
    oldTdo: KfObject3D = new KfObject3D()
    newTdo: KfObject3D = new KfObject3D()
    PdReplaceTdoCommand.prototype = new PdTdoCommand()
    PdReplaceTdoCommand.prototype.constructor = PdReplaceTdoCommand
    
    // ------------------------------------------------------------------------ PdReplaceTdoCommand 
    createWithTdo(aTdo: KfObject3D): void {
        PdTdoCommand.prototype.createWithTdo.call(this, aTdo)
        this.oldTdo = utdo.KfObject3D().create()
        this.newTdo = utdo.KfObject3D().create()
        this.oldTdo.copyFrom(this.tdo)
        this.newTdo.copyFrom(this.tdo)
    }
    
    destroy(): void {
        this.oldTdo.free
        this.oldTdo = null
        this.newTdo.free
        this.newTdo = null
        PdTdoCommand.prototype.destroy.call(this)
    }
    
    undoCommand(): void {
        PdTdoCommand.prototype.undoCommand.call(this)
        this.tdo.copyFrom(this.oldTdo)
        // v1.6
        TdoEditorForm.updateForChangeToTdo()
    }
    
    redoCommand(): void {
        PdTdoCommand.prototype.doCommand.call(this)
        this.tdo.copyFrom(this.newTdo)
        // v1.6
        TdoEditorForm.updateForChangeToTdo()
    }
    
}

export class PdAddTdoTriangleCommand {
    newPoints: KfPoint3D[] /* 2 + 1 */ = Array(2+ 1)
    newPointIndexes: short[] /* 2 + 1 */ = Array(2+ 1)
    newTriangle: KfIndexTriangle = new KfIndexTriangle()
    PdAddTdoTriangleCommand.prototype = new PdReplaceTdoCommand()
    PdAddTdoTriangleCommand.prototype.constructor = PdAddTdoTriangleCommand
    
    // -------------------------------------------------------------------- PdAddTdoTriangleCommand 
    createWithTdoAndNewPoints(aTdo: KfObject3D, aNewPointIndexes: short[], aNewPoints: KfPoint3D[]): void {
        let i: short
        
        PdReplaceTdoCommand.prototype.createWithTdo.call(this, aTdo)
        for (i = 0; i <= 2; i++) {
            this.newPointIndexes[i] = aNewPointIndexes[i]
            this.newPoints[i] = aNewPoints[i]
        }
    }
    
    doCommand(): void {
        let i: short
        
        PdReplaceTdoCommand.prototype.doCommand.call(this)
        for (i = 0; i <= 2; i++) {
            if (this.newPointIndexes[i] < 0) {
                this.newPointIndexes[i] = this.newTdo.addPoint(this.newPoints[i]) - 1
            }
        }
        this.newTriangle = utdo.KfIndexTriangle().createABC(this.newPointIndexes[0] + 1, this.newPointIndexes[1] + 1, this.newPointIndexes[2] + 1)
        //newTdo will free newTriangle
        this.newTdo.triangles.Add(this.newTriangle)
        this.tdo.copyFrom(this.newTdo)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    undoCommand(): void {
        PdReplaceTdoCommand.prototype.undoCommand.call(this)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    redoCommand(): void {
        PdReplaceTdoCommand.prototype.redoCommand.call(this)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    description(): string {
        let result = ""
        result = "add"
        return result
    }
    
}

export class PdRemoveTdoTriangleCommand {
    triangle: KfIndexTriangle = new KfIndexTriangle()
    PdRemoveTdoTriangleCommand.prototype = new PdReplaceTdoCommand()
    PdRemoveTdoTriangleCommand.prototype.constructor = PdRemoveTdoTriangleCommand
    
    // ----------------------------------------------------------------------- PdRemoveTdoTriangleCommand 
    doCommand(): void {
        PdReplaceTdoCommand.prototype.doCommand.call(this)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    undoCommand(): void {
        PdReplaceTdoCommand.prototype.undoCommand.call(this)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    redoCommand(): void {
        PdReplaceTdoCommand.prototype.redoCommand.call(this)
        TdoEditorForm.updateForChangeToNumberOfPoints()
    }
    
    destroy(): void {
        if (this.done) {
            // since triangle was removed from, not added to, newTdo, we must free it ourselves 
            this.triangle.free
        }
        this.triangle = null
        PdReplaceTdoCommand.prototype.destroy.call(this)
    }
    
    TrackMouse(aTrackPhase: TrackPhase, anchorPoint: TPoint, previousPoint: TPoint, nextPoint: TPoint, mouseDidMove: boolean, rightButtonDown: boolean): PdCommand {
        let result = new PdCommand()
        let triangleInTdo: KfIndexTriangle
        let index: short
        
        result = this
        if (aTrackPhase === ucommand.TrackPhase.trackPress) {
        } else if (aTrackPhase === ucommand.TrackPhase.trackMove) {
        } else if (aTrackPhase === ucommand.TrackPhase.trackRelease) {
            triangleInTdo = TdoEditorForm.triangleAtMouse(nextPoint.X, nextPoint.Y)
            index = this.tdo.triangles.IndexOf(triangleInTdo)
            if ((index >= 0) && (index <= this.newTdo.triangles.Count - 1)) {
                this.triangle = utdo.KfIndexTriangle(this.newTdo.triangles.Items[index])
                //we will free triangle
                this.newTdo.removeTriangle(this.triangle)
                this.tdo.copyFrom(this.newTdo)
            } else {
                result = null
                this.free
            }
        }
        return result
    }
    
    description(): string {
        let result = ""
        result = "delete"
        return result
    }
    
}

export class PdMirrorTdoCommand {
    PdMirrorTdoCommand.prototype = new PdReplaceTdoCommand()
    PdMirrorTdoCommand.prototype.constructor = PdMirrorTdoCommand
    
    // -------------------------------------------------------------------- PdMirrorTdoCommand 
    doCommand(): void {
        this.newTdo.makeMirrorTriangles()
        this.tdo.copyFrom(this.newTdo)
        PdReplaceTdoCommand.prototype.doCommand.call(this)
    }
    
    description(): string {
        let result = ""
        result = "mirror"
        return result
    }
    
}

export class PdReverseZValuesTdoCommand {
    PdReverseZValuesTdoCommand.prototype = new PdReplaceTdoCommand()
    PdReverseZValuesTdoCommand.prototype.constructor = PdReverseZValuesTdoCommand
    
    // -------------------------------------------------------------------- PdReverseZValuesTdoCommand 
    doCommand(): void {
        this.newTdo.reverseZValues()
        this.tdo.copyFrom(this.newTdo)
        PdReplaceTdoCommand.prototype.doCommand.call(this)
    }
    
    description(): string {
        let result = ""
        result = "reverse"
        return result
    }
    
}

export class PdClearAllPointsCommand {
    PdClearAllPointsCommand.prototype = new PdReplaceTdoCommand()
    PdClearAllPointsCommand.prototype.constructor = PdClearAllPointsCommand
    
    // -------------------------------------------------------------------- PdClearAllPointsCommand 
    doCommand(): void {
        this.newTdo.clearPoints()
        this.tdo.copyFrom(this.newTdo)
        PdReplaceTdoCommand.prototype.doCommand.call(this)
    }
    
    description(): string {
        let result = ""
        result = "clear"
        return result
    }
    
}

export class PdLoadTdoFromDXFCommand {
    PdLoadTdoFromDXFCommand.prototype = new PdReplaceTdoCommand()
    PdLoadTdoFromDXFCommand.prototype.constructor = PdLoadTdoFromDXFCommand
    
    // -------------------------------------------------------------------- PdLoadTdoFromDXFCommand 
    createWithOldAndNewTdo(anOldTdo: KfObject3D, aNewTdo: KfObject3D): void {
        PdReplaceTdoCommand.prototype.createWithTdo.call(this, anOldTdo)
        this.oldTdo = utdo.KfObject3D().create()
        this.newTdo = utdo.KfObject3D().create()
        this.oldTdo.copyFrom(anOldTdo)
        this.newTdo.copyFrom(aNewTdo)
    }
    
    doCommand(): void {
        this.tdo.copyFrom(this.newTdo)
        TdoEditorForm.updateCaptionForNewTdoName()
        //v1.6b1
        TdoEditorForm.centerDrawingClick(TdoEditorForm)
        PdReplaceTdoCommand.prototype.doCommand.call(this)
    }
    
    undoCommand(): void {
        PdReplaceTdoCommand.prototype.undoCommand.call(this)
        TdoEditorForm.updateCaptionForNewTdoName()
        //v1.6b1
        TdoEditorForm.centerDrawingClick(TdoEditorForm)
    }
    
    redoCommand(): void {
        PdReplaceTdoCommand.prototype.redoCommand.call(this)
        TdoEditorForm.updateCaptionForNewTdoName()
        //v1.6b1
        TdoEditorForm.centerDrawingClick(TdoEditorForm)
    }
    
    description(): string {
        let result = ""
        result = "DXF"
        return result
    }
    
}

