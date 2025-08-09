// unit Umain

import * as m from "mithril"
import { arrayInsert, arraySwap, caption, ColorDefs, double, ExtractFileName, float, imageDir, int, intround, IntToStr, long, mbYesNo, mbYesNoCancel, MessageDialog, MouseButton, mtConfirmation, short, ShowMessage, StrToFloat, StrToIntDef, TColorRef } from "./common"
import { PdCommand } from "./PdCommand"
import { PdCommandList } from "./PdCommandList"
import { domain, DrawMode, kAnimateByAge, kAnimateByXRotation, kExcludeInvisiblePlants, kIncludeAllPlants, kIncludeDrawingAreaContents, kIncludeNonSelectedPlants, kIncludeSelectedPlants, kIncludeVisiblePlants, kMainWindowOrientationHorizontal, kMainWindowOrientationVertical, kMaxRecentFiles, kUnsavedFileName, ViewPlants } from "./PdDomain"
import { FieldType } from "./PdParameter"
import { PdParameterPanel } from "./PdParameterPanel"
import { kCheckForUnreadParams, kDontConsiderDomainScale, kDontDrawNow, kEndNoteString, kPlantAsTextEndString, kStartNoteString, PdPlant, PdPlantUpdateEvent } from "./PdPlant"
import { PdPlantDrawingAmendment } from "./PdPlantDrawingAmendment"
import { checkVersionNumberInPlantNameLine } from "./PdPlantManager"
import { PdSection } from "./PdSection"
import { calcSCurveCoeffsWithResult, SCurveStructure, scurveWithResult } from "./SCurveStructure"
import { TPoint } from "./TPoint"
import { TRect } from "./TRect"
import { ExportFormats, fileTypeFor3DExportType } from "./U3dexport"
import { intMax, intMin, max, safedivExcept } from "./umath"
import { kBringForward, kChangeHeight, kChangeWidth, kCopyToClipboard, kDontCopyToClipboard, kDown, kHide, kLeft, kRight, kRotateX, kRotateY, kRotateZ, kSendBackward, kShow, kUp, PdAlignPlantsCommand, PdAnimatePlantCommand, PdBooleanValue, PdBreedFromParentsCommand, PdCenterDrawingCommand, PdChangeDomain3DOptionsCommand, PdChangeDomainOptionsCommand, PdChangeMagnificationCommand, PdChangeMainWindowOrientationCommand, PdChangeMainWindowViewingOptionCommand, PdChangePlantAgeCommand, PdChangeSelectedPlantsCommand, PdCreateAmendmentCommand, PdDeleteAmendmentCommand, PdDragCommand, PdDuplicateCommand, PdEditAmendmentCommand, PdEditNoteCommand, PdHideOrShowCommand, PdMakeTimeSeriesCommand, PdNewCommand, PdPackPlantsCommand, PdPasteCommand, PdRandomizeCommand, PdRemoveCommand, PdRenameCommand, PdResetRotationsCommand, PdResizePlantsCommand, PdResizePlantsToSameWidthOrHeightCommand, PdRotateCommand, PdScrollCommand, PdSelectOrDeselectAllCommand, PdSelectPosingPartCommand, PdSendBackwardOrForwardCommand, setMainFormForCommands } from "./updcom"
import { chr, cleanUpAfterFileSave, createSaveFileNamesStructure, FileType, getFileSaveInfo, IDCANCEL, IDNO, IDYES, kAskForFileName, kDontAskForFileName, len, lowercase, mrCancel, mrOK, nameStringForFileType, Point, pos, Rect, removeItem, rHeight, rWidth, SaveFileNamesStructure, setSinglePoint, startFileSave, stringBeyond, stringUpTo, trim, uppercase } from "./usupport"
import { viewMainForm } from "./TMainForm-view"
import { setMainForm } from "./TMainFormInterface"
import { convertColor } from "./KfDrawingSurface"
import { Cursor, cursor_change, cursor_getCurrentCursorAsCSS, cursor_startWait, cursor_stopWait, CursorMode } from "./ucursor"
import { customModal, ModalInputView, modalPrompt } from "./ModalInputView"
import { TSplashForm } from "./TSplashForm"

// TODO PDF for getting to compile
type TEdit = any

const Application_Title = "PlantStudio"

const kMinWidthOnScreen = 100
const kMinHeightOnScreen = 100
const kDrawNow = true
const kDontDrawYet = false
const kScaleAndMove = true
const kJustMove = false
const kAlwaysMove = true
const kOnlyMoveIfOffTheScreen = false

const kBetweenGap = 4
const kSplitterDragToTopMinPixels = 100
const kSplitterDragToBottomMinPixelsInHorizMode = 160
const kSplitterDragToBottomMinPixelsInVertMode = 60
const kSplitterDragToLeftMinPixels = 100
const kSplitterDragToRightMinPixels = 260
const kPlantListChanged = true
const kPlantListNotChanged = false
const kHintRange = 1
const kMaxHintRangeForLargeAreas = 50
const kTabRotations = 0
const kTabParameters = 1
const kTabLifeCycle = 2
const kTabPosing = 3
const kTabStatistics = 4
const kTabNote = 5
const kTabHighest = 5
const kMaxMagnificationToTypeIn = 10000
const kEnableAllForms = true
const kDisableAllForms = false
const kDrawAllPlants = true
const kDrawOnlySelectedPlants = false
const kExpand = 0
const kCollapse = 1
const kExpandOrCollapse = 2

const kProgressBarColor = ColorDefs.clBlue
const kScaleToFitMargin = 10
const kOffscreenMargin = 20
const kSelectNoPosedPartString = "< Select None >"
const kNoPartSelected = "Selected part: (none)"

let pictureFileSaveAttemptsThisSession: short = 0
let nozzleFileSaveAttemptsThisSession: short = 0
let exportTo3DFileSaveAttemptsThisSession: short[] = Array(7) // Array(ExportFormats.k3DExportTypeLast + 1)

type TShiftState = {
    isShift: boolean
    isCtrl: boolean
}

function setPlantCharacteristicsForAnimationFrame(plant: PdPlant, frame: short): void {
    if (plant === null) {
        return
    }
    if (domain.animationOptions.animateBy === kAnimateByAge) {
        if (frame <= 0) {
            plant.setAge(1)
        } else if (frame >= domain.animationOptions.frameCount - 1) {
            plant.setAge(plant.pGeneral.ageAtMaturity)
        } else {
            plant.setAge(domain.animationOptions.ageIncrement * frame)
        }
    } else if (domain.animationOptions.animateBy === kAnimateByXRotation) {
        if (domain.animationOptions.frameCount > 1) {
            plant.xRotation = domain.animationOptions.xRotationIncrement * frame
        }
    }
}

// function enableOrDisableSet(aLabel: TLabel, anEdit: TEdit, aSpin: TSpinButton, anExtraLabel: TLabel, enable: boolean): void {
//     if (aLabel !== null) {
//         aLabel.Enabled = enable
//     }
//     if (anEdit !== null) {
//         anEdit.Enabled = enable
//     }
//     if (aSpin !== null) {
//         aSpin.Visible = enable
//     }
//     if (anExtraLabel !== null) {
//         anExtraLabel.Enabled = enable
//     }
// }


export class TMainForm {

    // horizontalSplitter: TPanel = new TPanel()
    // verticalSplitter: TPanel = new TPanel()
    // visibleBitmap: TImage = new TImage()
    // PrintDialog: TPrintDialog = new TPrintDialog()
    // sectionImagesPanel: TPanel = new TPanel()
    // Sections_FlowersPrimary: TImage = new TImage()
    // Sections_General: TImage = new TImage()
    // Sections_InflorPrimary: TImage = new TImage()
    // Sections_Meristems: TImage = new TImage()
    // Sections_Leaves: TImage = new TImage()
    // Sections_RootTop: TImage = new TImage()
    // Sections_Fruit: TImage = new TImage()
    // Sections_InflorSecondary: TImage = new TImage()
    // Sections_Internodes: TImage = new TImage()
    // Sections_SeedlingLeaves: TImage = new TImage()
    // Sections_FlowersSecondary: TImage = new TImage()
    animateTimerTimeoutId: any = null
    // paramPanelOpenArrowImage: TImage = new TImage()
    // paramPanelClosedArrowImage: TImage = new TImage()
    // plantListPanel: TPanel = new TPanel()
    // progressPaintBox: TPaintBox = new TPaintBox()
    // plantFocusPanel: TPanel = new TPanel()
    // lifeCyclePanel: TPanel = new TPanel()
    // lifeCycleGraphImage: TImage = new TImage()
    // timeLabel: TLabel = new TLabel()
    // selectedPlantNameLabel: TLabel = new TLabel()
    // lifeCycleEditPanel: TPanel = new TPanel()
    // daysAndSizeLabel: TLabel = new TLabel()
    // ageAndSizeLabel: TLabel = new TLabel()
    // lifeCycleDaysEdit: TEdit = new TEdit()
    // lifeCycleDaysSpin: TSpinButton = new TSpinButton()
    // lifeCycleDragger: TPanel = new TPanel()
    // statsScrollBox: TScrollBox = new TScrollBox()
    // tabSet: TTabSet = new TTabSet()
    // parametersPanel: TPanel = new TPanel()
    // parametersScrollBox: TScrollBox = new TScrollBox()
    // maxSizeAxisLabel: TLabel = new TLabel()
    // animateGrowth: TSpeedButton = new TSpeedButton()
    // plantsAsTextMemo: TMemo = new TMemo()
    // plantBitmapsIndicatorImage: TImage = new TImage()
    // plantBitmapsGreenImage: TImage = new TImage()
    // noPlantBitmapsImage: TImage = new TImage()
    // plantBitmapsYellowImage: TImage = new TImage()
    // plantBitmapsRedImage: TImage = new TImage()
    // animatingLabel: TLabel = new TLabel()
    // rotationsPanel: TPanel = new TPanel()
    // xRotationLabel: TLabel = new TLabel()
    // xRotationEdit: TEdit = new TEdit()
    // xRotationSpin: TSpinButton = new TSpinButton()
    // yRotationLabel: TLabel = new TLabel()
    // yRotationEdit: TEdit = new TEdit()
    // yRotationSpin: TSpinButton = new TSpinButton()
    // zRotationLabel: TLabel = new TLabel()
    // zRotationEdit: TEdit = new TEdit()
    // zRotationSpin: TSpinButton = new TSpinButton()
    // resetRotations: TSpeedButton = new TSpeedButton()
    // rotationLabel: TLabel = new TLabel()
    // magnificationPercent: TComboBox = new TComboBox()
    // TODO: FIX magnificationPercent
    magnificationPercent = { Text: "100%" }
    // notePanel: TPanel = new TPanel()
    // noteMemo: TMemo = new TMemo()
    // noteLabel: TLabel = new TLabel()
    // noteEdit: TSpeedButton = new TSpeedButton()
    // Sections_FlowersPrimaryAdvanced: TImage = new TImage()
    // sizingLabel: TLabel = new TLabel()
    // drawingScaleEdit: TEdit = new TEdit()
    // drawingScaleSpin: TSpinButton = new TSpinButton()
    // drawingScalePixelsPerMmLabel: TLabel = new TLabel()
    // locationLabel: TLabel = new TLabel()
    // xLocationLabel: TLabel = new TLabel()
    // xLocationEdit: TEdit = new TEdit()
    // xLocationSpin: TSpinButton = new TSpinButton()
    // yLocationLabel: TLabel = new TLabel()
    // yLocationEdit: TEdit = new TEdit()
    // yLocationSpin: TSpinButton = new TSpinButton()
    // locationPixelsLabel: TLabel = new TLabel()
    // arrangementPlantName: TLabel = new TLabel()
    // parametersPlantName: TLabel = new TLabel()
    // posingPanel: TPanel = new TPanel()
    // posingPlantName: TLabel = new TLabel()
    // posingDetailsPanel: TPanel = new TPanel()
    // posingXRotationLabel: TLabel = new TLabel()
    // posingYRotationLabel: TLabel = new TLabel()
    // posingZRotationLabel: TLabel = new TLabel()
    // posingScaleMultiplierPercent: TLabel = new TLabel()
    // posingHidePart: TCheckBox = new TCheckBox()
    // posingXRotationEdit: TEdit = new TEdit()
    // posingXRotationSpin: TSpinButton = new TSpinButton()
    // posingYRotationEdit: TEdit = new TEdit()
    // posingYRotationSpin: TSpinButton = new TSpinButton()
    // posingZRotationEdit: TEdit = new TEdit()
    // posingZRotationSpin: TSpinButton = new TSpinButton()
    // posingAddExtraRotation: TCheckBox = new TCheckBox()
    // posingMultiplyScale: TCheckBox = new TCheckBox()
    // posingScaleMultiplierLabel: TLabel = new TLabel()
    // posingLengthMultiplierPercent: TLabel = new TLabel()
    // posingLengthMultiplierLabel: TLabel = new TLabel()
    // posingWidthMultiplierPercent: TLabel = new TLabel()
    // posingWidthMultiplierLabel: TLabel = new TLabel()
    // posingMultiplyScaleAllPartsAfter: TCheckBox = new TCheckBox()
    // posingScaleMultiplierEdit: TEdit = new TEdit()
    // posingScaleMultiplierSpin: TSpinButton = new TSpinButton()
    // posingLengthMultiplierEdit: TEdit = new TEdit()
    // posingLengthMultiplierSpin: TSpinButton = new TSpinButton()
    // posingWidthMultiplierEdit: TEdit = new TEdit()
    // posingWidthMultiplierSpin: TSpinButton = new TSpinButton()
    // sectionsComboBox: TComboBox = new TComboBox()
    // hideExtraLabel: TLabel = new TLabel()
    // rotationDegreesLabel: TLabel = new TLabel()
    // posingColorsPanel: TPanel = new TPanel()
    // posingLineColorLabel: TLabel = new TLabel()
    // posingFrontfaceColorLabel: TLabel = new TLabel()
    // posingBackfaceColorLabel: TLabel = new TLabel()
    // posingChangeColors: TCheckBox = new TCheckBox()
    // posingChangeAllColorsAfter: TCheckBox = new TCheckBox()
    // posingLineColor: TPanel = new TPanel()
    // posingFrontfaceColor: TPanel = new TPanel()
    // posingBackfaceColor: TPanel = new TPanel()
    // posedPartsLabel: TLabel = new TLabel()
    // posedPlantParts: TComboBox = new TComboBox()
    // posingHighlight: TSpeedButton = new TSpeedButton()
    // posingGhost: TSpeedButton = new TSpeedButton()
    // posingNotShown: TSpeedButton = new TSpeedButton()
    // selectedPartLabel: TLabel = new TLabel()
    // posingPosePart: TSpeedButton = new TSpeedButton()
    // posingUnposePart: TSpeedButton = new TSpeedButton()
    // posingMultiplyScaleAllPartsAfterLabel: TLabel = new TLabel()
    // Sections_Orthogonal: TImage = new TImage()
    drawingBitmap: HTMLCanvasElement = document.createElement("canvas")
    commandList: PdCommandList = new PdCommandList()
    drawingPaintBox: HTMLCanvasElement = document.createElement("canvas")
    // statsPanel: PdStatsPanel = new PdStatsPanel()
    invalidDrawingRect: TRect = new TRect()
    internalChange: boolean = false
    inFormCreation: boolean = false
    inFileOpen: boolean = false
    lastSaveProceeded: boolean = false
    // resizingAtStart: boolean = false
    plants: PdPlant[] = []
    selectedPlants: PdPlant[] = []
    // numPlantsInClipboard: short = 0
    lastSingleClickPlantIndex: int = 0
    // justDoubleClickedOnDrawGrid: boolean = false
    rubberBanding: boolean = false
    rubberBandStartDragPoint: TPoint = new TPoint()
    rubberBandLastDrawPoint: TPoint = new TPoint()
    drawing: boolean = false
    animateCommand: PdAnimatePlantCommand | null = null
    // drawProgressMax: long = 0
    cursorModeForDrawing: short = CursorMode.kCursorModeSelectDrag
    actionInProgress: boolean = false
    mouseMoveActionInProgress: boolean = false
    // lifeCycleDragging: boolean = false
    // lifeCycleDraggingNeedToRedraw: boolean = false
    // lifeCycleDraggingStartPos: short = 0
    // lifeCycleDraggingLastDrawPos: short = 0
    // cursorPosInDrawingPaintBox: TPoint = new TPoint()
    // horizontalSplitterDragging: boolean = false
    // verticalSplitterDragging: boolean = false
    // horizontalSplitterNeedToRedraw: boolean = false
    // verticalSplitterNeedToRedraw: boolean = false
    // horizontalSplitterStartPos: int = 0
    // verticalSplitterStartPos: int = 0
    // horizontalSplitterLastDrawPos: int = 0
    // verticalSplitterLastDrawPos: int = 0
    // lastWidth: int = 0
    // lastHeight: int = 0
    hintX: int = 0
    hintY: int = 0
    hintActive: boolean = false
    lastHintString: string = ""
    // backTabbingInParametersPanel: boolean = false
    selectedParameterPanel: PdParameterPanel | null = null
    selectedPlantPartID: long = 0
    mouseDownSelectedPlantPartID: long = 0
    selectedPlantPartType: string = ""
    mouseDownSelectedPlantPartType: string = ""
    // TMainForm.prototype = new PdForm()
    // TMainForm.prototype.constructor = TMainForm
    Caption: string = "PlantStudio"
    plantFileChanged = false

    constructor() {
        // Any code that replaces this.plants will need to update plantManager.plants too
        this.plants = domain.plantManager.plants
    }

    /*
    
    //$R *.DFM
    //in each direction, so box is 100 x 100
    // FormCreate(): void {
    //     let tempBoundsRect: TRect
        
    //     cursor_startWait()
    //     try {
    //         delphi_compatability.Application.helpFile = ExtractFilePath(delphi_compatability.Application.exeName) + "PlantStudio.hlp"
    //         delphi_compatability.Application.OnActivate = this.FormActivate
    //         if (domain === null) {
    //             throw new Error("Problem: Nil domain in method TMainForm.FormCreate.")
    //         }
    //         // domain must exist when this is created; use this pointer to shorten code
    //         this.plants = domain.plantManager.plants
    //         // turn off panel bevels 
    //         this.plantListPanel.BevelOuter = UNRESOLVED.bvNone
    //         this.plantFocusPanel.BevelOuter = UNRESOLVED.bvNone
    //         this.plantListDrawGrid.DragCursor = ucursor.crDragPlant
    //         // save height and width for resizing use 
    //         this.lastWidth = this.ClientWidth
    //         this.lastHeight = this.ClientHeight
    //         this.inFormCreation = true
    //         // application options 
    //         delphi_compatability.Application.OnShowHint = this.DoShowHint
    //         // cfk played with menu hints - to use menu hints, respond to this and display the hint in a window or status panel
    //         // Application.OnHint := DoMenuHint;    
    //         delphi_compatability.Application.ShowHint = true
    //         // creation of dependent objects and setting them up 
    //         this.selectedPlants = []
    //         this.commandList =  new PdCommandList()
    //         this.commandList.setNewUndoLimit(domain.options.undoLimit)
    //         this.commandList.setNewObjectUndoLimit(domain.options.undoLimitOfPlants)
    //         this.drawingPaintBox = ubitmap.PdPaintBox().Create(this)
    //         this.drawingPaintBox.Parent = this
    //         this.drawingPaintBox.OnPaint = this.drawingPaintBoxPaint
    //         this.drawingPaintBox.OnMouseDown = this.PaintBoxMouseDown
    //         this.drawingPaintBox.OnMouseMove = this.PaintBoxMouseMove
    //         this.drawingPaintBox.OnMouseUp = this.PaintBoxMouseUp
    //         this.drawingPaintBox.OnEndDrag = this.PaintBoxEndDrag
    //         this.drawingPaintBox.OnDragOver = this.PaintBoxDragOver
    //         this.drawingPaintBox.DragCursor = ucursor.crDragPlant
    //         this.drawingPaintBox.PopupMenu = this.PlantPopupMenu
    //         this.drawingBitmap = delphi_compatability.TBitmap().Create()
    //         this.statsPanel = ustats.PdStatsPanel().create(this)
    //         this.statsPanel.Parent = this.statsScrollBox
    //         this.statsPanel.ParentFont = false
    //         // hints 
    //         this.hintActive = false
    //         this.lastHintString = ""
    //         // intial settings of stored info 
    //         this.tabSet.tabIndex = kTabRotations
    //         this.dragCursorMode.Down = true
    //         // loading info 
    //         this.loadSectionsIntoListBox()
    //         this.updateMenusForUndoRedo()
    //         this.updatePasteMenuForClipboardContents()
    //         if (this.sectionsComboBox.Items.Count > 0) {
    //             this.sectionsComboBox.ItemIndex = 0
    //             this.updateParameterPanelsForSectionChange()
    //         }
    //         //v2.0
    //         this.rotationsPanel.Visible = true
    //         ubmpsupport.setPixelFormatBasedOnScreenForBitmap(this.drawingBitmap)
    //         // set size and splitters as saved in domain 
    //         // keep window on screen - left corner of title bar 
    //         tempBoundsRect = domain.mainWindowRect
    //         if ((tempBoundsRect.Left !== 0) || (tempBoundsRect.Right !== 0) || (tempBoundsRect.Top !== 0) || (tempBoundsRect.Bottom !== 0)) {
    //             if (tempBoundsRect.Left > delphi_compatability.Screen.Width - kMinWidthOnScreen) {
    //                 tempBoundsRect.Left = delphi_compatability.Screen.Width - kMinWidthOnScreen
    //             }
    //             if (tempBoundsRect.Top > delphi_compatability.Screen.Height - kMinHeightOnScreen) {
    //                 tempBoundsRect.Top = delphi_compatability.Screen.Height - kMinHeightOnScreen
    //             }
    //             this.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right, tempBoundsRect.Bottom)
    //         }
    //         if (domain.horizontalSplitterPos > 0) {
    //             this.horizontalSplitter.Top = domain.horizontalSplitterPos
    //         } else {
    //             this.horizontalSplitter.Top = this.ClientHeight / 2
    //         }
    //         if (domain.verticalSplitterPos > 0) {
    //             this.verticalSplitter.Left = domain.verticalSplitterPos
    //         } else {
    //             this.verticalSplitter.Left = this.ClientWidth / 3
    //         }
    //     } finally {
    //         cursor_stopWait()
    //     }
    // }
    
    loadPlantFileAtStartup(): void {
        cursor_startWait()
        try {
            if (domain.plantFileLoaded) {
                // if file loaded at startup, update for it, else act as if they picked new 
                startWaitMessage("Drawing...")
                try {
                    this.updateForPlantFile()
                } finally {
                    stopWaitMessage()
                }
            } else {
                this.MenuFileNewClick()
            }
            // TODO: FIXME for splashForm
            // if (usplash.splashForm !== null) {
            //     usplash.splashForm.Hide()
            // }
            this.updateForChangeToDomainOptions()
            this.updateFileMenuForOtherRecentFiles()
            this.selectedPlantPartID = -1
            this.inFormCreation = false
        } finally {
            cursor_stopWait()
        }
    }
    
    // FormActivate(): void {
    //     this.MenuEditPasteAsText.enabled = (ColorDefs.clipboard.hasFormat(UNRESOLVED.CF_TEXT)) && (domain.plantFileLoaded)
    // }
    
    // showWelcomeForm(): void {
    //     let welcomeForm: TWelcomeForm
        
    //     if (domain.options.hideWelcomeForm) {
    //         return
    //     }
    //     welcomeForm = uwelcome.TWelcomeForm().create(delphi_compatability.Application)
    //     if (welcomeForm.ShowModal() !== mrCancel) {
    //         switch (welcomeForm.whatToDo) {
    //             case uwelcome.kReadSuperSpeedTour:
    //                 delphi_compatability.Application.HelpJump("Super-Speed_Tour")
    //                 break
    //             case uwelcome.kReadTutorial:
    //                 delphi_compatability.Application.HelpJump("Tutorial")
    //                 break
    //             case uwelcome.kMakeNewPlant:
    //                 this.MenuPlantNewClick()
    //                 break
    //             case uwelcome.kOpenPlantLibrary:
    //                 if (domain.plantFileName === "") {
    //                     domain.plantFileName = ExtractFilePath(delphi_compatability.Application.exeName)
    //                 }
    //                 this.MenuFileOpenClick()
    //                 break
    //             case uwelcome.kStartUsingProgram:
    //                 break
    //         }
    //     }
    //     domain.options.hideWelcomeForm = welcomeForm.hideWelcomeForm.Checked
    // }
    
    */

    // ------------------------------------------------------------------------- *file menu 
    MenuFileNewClick(): void {
        if (!this.askForSaveAndProceed()) {
            return
        }
        domain.resetForNoPlantFile()
        this.updateForNoPlantFile()
        domain.resetForEmptyPlantFile()
        this.updateForPlantFile()
        // new v1.4 reset to 100% magnification on new file
        this.magnificationPercent.Text = "100%"
        this.changeMagnificationWithoutClick()
    }
    
    // WMDropFiles(Msg: TWMDropFiles): void {
    //     let CFileName: char[] = Array(MAX_PATH + 1)
        
    //     try {
    //         if (UNRESOLVED.DragQueryFile(Msg.Drop, 0, CFileName, UNRESOLVED.MAX_PATH) > 0) {
    //             if (pos(".PLA", uppercase(CFileName)) <= 0) {
    //                 return
    //             }
    //             if (!this.askForSaveAndProceed()) {
    //                 return
    //             }
    //             this.openFile(CFileName)
    //             Msg.Result = 0
    //         }
    //     } finally {
    //         UNRESOLVED.DragFinish(Msg.Drop)
    //     }
    // }
    
    MenuFileOpenClick(): void {
        if (!this.askForSaveAndProceed()) {
            return
        }
        const fileNameWithPath = getFileOpenInfo(FileType.kFileTypePlant, domain.plantFileName, "Choose a plant file")
        if (fileNameWithPath === "") {
            return
        }
        this.openFile(fileNameWithPath)
    }
    
    // dependent objects 
    // general 
    // plant handling 
    // selecting plants with rubber banding 
    // drawing and progress 
    // mouse movement 
    // resizing and splitting 
    // hints 
    // parameters panel 
    // posings panel
    // file menu 
    openFile(fileNameWithPath: string): void {
        domain.resetForNoPlantFile()
        this.updateForNoPlantFile()
        try {
            this.inFileOpen = true
            try {
                startWaitMessage("Opening " + ExtractFileName(fileNameWithPath))
                domain.load(fileNameWithPath)
            } catch (E: any) {
                stopWaitMessage()
                ShowMessage(E.message)
                ShowMessage("Could not load file " + fileNameWithPath)
                return
            }
            this.updateForPlantFile()
            stopWaitMessage()
        } finally {
            this.inFileOpen = false
        }
    }
    
    MenuFileCloseClick(): void {
        if (!this.askForSaveAndProceed()) {
            return
        }
        domain.resetForNoPlantFile()
        this.updateForPlantFile()
    }
    
    // returns false if user canceled leaving
    askForSaveAndProceed(): boolean {
        let result = true
        if (!this.plantFileChanged) {
            return result
        }
        //cfk fix - put help context in - for all messageDlgs 
        const messageBoxResult = MessageDialog("Save changes to " + ExtractFileName(domain.plantFileName) + "?", mtConfirmation, mbYesNoCancel, 0)
        switch (messageBoxResult) {
            case IDCANCEL:
                result = false
                break
            case IDYES:
                this.MenuFileSaveClick()
                result = this.lastSaveProceeded
                break
            case IDNO:
                result = true
                break
            default:
                ShowMessage("Error with save request dialog.")
                result = true
                break
        }
        return result
    }
    
    MenuFileSaveClick(): void {
        const fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        
        if (pos(uppercase(kUnsavedFileName), uppercase(ExtractFileName(domain.plantFileName))) > 0) {
            this.MenuFileSaveAsClick()
            return
        }
        this.lastSaveProceeded = getFileSaveInfo(FileType.kFileTypePlant, kDontAskForFileName, domain.plantFileName, fileInfo)
        if (!this.lastSaveProceeded) {
            return
        }
        try {
            startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            domain.save(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            stopWaitMessage()
            cleanUpAfterFileSave(fileInfo)
            this.setPlantFileChanged(false)
            domain.updateRecentFileNames(fileInfo.newFile)
            this.clearCommandList()
        }
    }
    
    setPlantFileChanged(fileChanged: boolean): void {
        this.plantFileChanged = fileChanged
    }
    
    MenuFileSaveAsClick(): void {
        const fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        
        this.lastSaveProceeded = getFileSaveInfo(FileType.kFileTypePlant, kAskForFileName, domain.plantFileName, fileInfo)
        if (!this.lastSaveProceeded) {
            return
        }
        try {
            startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            domain.save(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            stopWaitMessage()
            cleanUpAfterFileSave(fileInfo)
            this.setPlantFileChanged(false)
            this.clearCommandList()
        }
        domain.plantFileName = fileInfo.newFile
        domain.lastOpenedPlantFileName = domain.plantFileName
        domain.updateRecentFileNames(domain.lastOpenedPlantFileName)
        this.Caption = this.captionForFile()
    }
    
    MenuFilePlantMoverClick(): void {
        unfinished()
        // let mover: TMoverForm
        
        // if (this.plantFileChanged) {
        //     const response = MessageDialog("Do you want to save your changes to " + ExtractFileName(domain.plantFileName) + chr(13) + "before you use the plant mover?", mtConfirmation, mbYesNoCancel, 0)
        //     switch (response) {
        //         case IDCANCEL:
        //             return
        //             break
        //         case IDYES:
        //             this.MenuFileSaveClick()
        //             break
        //         case IDNO:
        //             break
        //     }
        // }
        // mover = TMoverForm().create(this)
        // if (mover === null) {
        //     throw new Error("Problem: Could not create plant mover window.")
        // }

        // mover.ShowModal()
        // //in case mover copied something
        // this.updatePasteMenuForClipboardContents()
        // if (mover.changedCurrentPlantFile) {
        //     if (mover.untitledDomainFileSavedAs !== "") {
        //         domain.plantFileName = mover.untitledDomainFileSavedAs
        //     }
        //     // cfk fix put help context in 
        //     const response = MessageDialog("The current plant file has changed." + chr(13) + "Do you want to reload the changed file?", mtConfirmation, mbYesNo, 0)
        //     if (response === IDYES) {
        //         try {
        //             startWaitMessage("Opening " + ExtractFileName(domain.plantFileName))
        //             this.updateForNoPlantFile()
        //             domain.load(domain.plantFileName)
        //         } catch (E: any) {
        //             stopWaitMessage()
        //             ShowMessage(E.message)
        //             ShowMessage("Could not load file " + domain.plantFileName + ".")
        //             return
        //         }
        //         this.updateForPlantFile()
        //         stopWaitMessage()
        //     }
        // }
    }
    
    MenuFileTdoMoverClick(): void {
        unfinished()
        // let mover: TTdoMoverForm
        
        // mover = TTdoMoverForm().create(this)
        // if (mover === null) {
        //     throw new Error("Problem: Could not create 3D object mover window.")
        // }
        // mover.ShowModal()
    }
    
    // WMQueryEndSession(message: TWMQueryEndSession): void {
    //     if (!this.askForSaveAndProceed()) {
    //         // prevents windows from shutting down
    //         message.result = 0
    //     } else if (!this.cleanUpBeforeExit()) {
    //         message.result = 0
    //     }
    // }
    
    MenuFileExitClick(): void {
        unfinished()
        // if (!this.askForSaveAndProceed()) {
        //     return
        // } else if (!this.cleanUpBeforeExit()) {
        //     return
        // }
        // delphi_compatability.Application.Terminate()
    }
    
    // FormClose(Action: TCloseAction): void {
    //     if (!this.askForSaveAndProceed()) {
    //         // same as exit, but can't call exit because we have to set the action flag 
    //         Action = delphi_compatability.TCloseAction.caNone
    //     } else if (!this.cleanUpBeforeExit()) {
    //         Action = delphi_compatability.TCloseAction.caNone
    //     }
    // }
    
    // returns false if user cancels quit
    cleanUpBeforeExit(): boolean {
        unfinished(); return true
        // domain.mainWindowRect = Rect(this.Left, this.Top, this.Width, this.Height)
        // domain.horizontalSplitterPos = this.horizontalSplitter.Top
        // domain.verticalSplitterPos = this.verticalSplitter.Left
        // domain.breederWindowRect = Rect(ubreedr.BreederForm.Left, ubreedr.BreederForm.Top, ubreedr.BreederForm.Width, ubreedr.BreederForm.Height)
        // domain.timeSeriesWindowRect = Rect(utimeser.TimeSeriesForm.Left, utimeser.TimeSeriesForm.Top, utimeser.TimeSeriesForm.Width, utimeser.TimeSeriesForm.Height)
        // domain.debugWindowRect = Rect(udebug.DebugForm.Left, udebug.DebugForm.Top, udebug.DebugForm.Width, udebug.DebugForm.Height)
        // if (domain.useIniFile) {
        //     const okayToQuit = this.storeIniFile()
        //     if (!okayToQuit) {
        //         return false
        //     }
        // }

        // // have to clear out parameter panels before leaving, for some reason was making program crash
        // //    but only if tdo components existed at the time of leaving the program. this works for now,
        // //    but it would be better to understand why it was happening. 
        // this.sectionsComboBox.ItemIndex = -1
        // this.updateParameterPanelsForSectionChange()
        // delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_QUIT, 0)
        // return true
    }
    
    storeIniFile(): boolean {
        unfinished(); return true
        // let result = true
        // let fileSavedOK = false
        // let choseAnotherFileName = false
        // while (!fileSavedOK) {
        //     try {
        //         storeProfileInformation()
        //         fileSavedOK = true
        //     } catch (e) {
        //         fileSavedOK = false
        //     }
        //     if (!fileSavedOK) {
        //         const buttonPressed = MessageDialog("Could not save settings to " + chr(13) + chr(13) + "  " + domain.iniFileName + chr(13) + chr(13) + "Would you like to save them to another file?", delphi_compatability.TMsgDlgType.mtError, mbYesNoCancel, 0)
        //         switch (buttonPressed) {
        //             case IDYES:
        //                 const saveDialog: TSaveDialog = TSaveDialog(delphi_compatability.Application)
        //                 saveDialog.FileName = domain.iniFileName
        //                 saveDialog.Filter = "Ini files (*.ini)|*.ini|All files (*.*)|*.*"
        //                 saveDialog.DefaultExt = "ini"
        //                 saveDialog.Options = saveDialog.Options + {TOpenOption.ofPathMustExist, TOpenOption.ofOverwritePrompt, TOpenOption.ofHideReadOnly, TOpenOption.ofNoReadOnlyReturn, }
        //                 result = saveDialog.Execute()
        //                 if (result) {
        //                     domain.iniFileName = saveDialog.FileName
        //                     choseAnotherFileName = true
        //                 }
        //                 if (!result) {
        //                     return result
        //                 }
        //                 break
        //             case IDNO:
        //                 return result
        //                 break
        //             case IDCANCEL:
        //                 result = false
        //                 return result
        //                 break
        //         }
        //     }
        // }
        // if (fileSavedOK && choseAnotherFileName) {
        //     ShowMessage("Your settings have been saved in " + chr(13) + chr(13) + "  " + domain.iniFileName + chr(13) + chr(13) + "But PlantStudio will load the original settings file again at startup." + chr(13) + "To use this settings file at startup, search in the help system" + chr(13) + "for \"alternate settings file\".")
        // }
        // return result
    }

    // ---------------------------------------------------------------------------- *edit menu 
    MenuEditUndoClick(): void {
        this.commandList.undoLast()
        // commands handle updating if it has to do with plant list, so only update drawing part here 
        this.updateForPossibleChangeToDrawing()
    }
    
    UndoMenuEditUndoRedoListClick(): void {
        unfinished()
        // const undoRedoListForm: TUndoRedoListForm = uundo.TUndoRedoListForm().create(this)
        // if (undoRedoListForm === null) {
        //     throw new Error("Problem: Could not create undo/redo list window.")
        // }
        // undoRedoListForm.initializeWithCommandList(this.commandList)
        // const response = undoRedoListForm.ShowModal()
        // if (response === mrOK) {
        //     try {
        //         this.enableOrDisableAllForms(kDisableAllForms)
        //         startWaitMessage("Multiple undo/redo in progress; please wait...")
        //         if (undoRedoListForm.undoToIndex() >= 0) {
        //             for (let i = 0; i <= undoRedoListForm.undoToIndex(); i++) {
        //                 this.commandList.undoLast()
        //             }
        //         } else if (undoRedoListForm.redoToIndex() >= 0) {
        //             for (let i = 0; i <= undoRedoListForm.redoToIndex(); i++) {
        //                 this.commandList.redoLast()
        //             }
        //         }
        //     } finally {
        //         this.updateForPossibleChangeToDrawing()
        //         stopWaitMessage()
        //         this.enableOrDisableAllForms(kEnableAllForms)
        //     }
        // }
    }
    
    MenuEditRedoClick(): void {
        this.commandList.redoLast()
        this.updateForPossibleChangeToDrawing()
    }
    
    MenuEditCutClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdRemoveCommand(this.selectedPlants, kCopyToClipboard)
        //command calls copy, which enables paste menu item
        this.doCommand(newCommand)
    }
    
    MenuEditCopyClick(): void {
        this.copySelectedPlantsToClipboard()
    }
    
    MenuEditCopyAsTextClick(): void {
        unfinished()
        // if (this.selectedPlants.length > 0) {
        //     ColorDefs.clipboard.clear
        //     this.plantsAsTextMemo.Clear()
        //     for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
        //         const plant = this.selectedPlants[i]
        //         if (plant === null) {
        //             continue
        //         }
        //         plant.writeToMainFormMemoAsText()
        //     }
        //     this.plantsAsTextMemo.SelectAll()
        //     this.plantsAsTextMemo.CutToClipboard()
        // }
    }
    
    MenuEditPasteAsTextClick(): void {
        unfinished()
        // let fakeTextFile: TextFile
        // const newPlants: PdPlant[] = []
        
        // if (!ColorDefs.clipboard.hasFormat(UNRESOLVED.CF_TEXT)) {
        //     MessageDialog("The clipboard has no text in it.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        //     return
        // }
        // this.plantsAsTextMemo.Clear()
        // this.plantsAsTextMemo.PasteFromClipboard()
        // if (this.plantsAsTextMemo.Lines.Count <= 0) {
        //     MessageDialog("The clipboard has no text in it.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        //     return
        // }
        // let startLine = -1
        // let endLine = -1
        // for (let i = 0; i <= this.plantsAsTextMemo.Lines.Count - 1; i++) {
        //     if (pos(uplant.kPlantAsTextStartString, this.plantsAsTextMemo.Lines.Strings[i]) > 0) {
        //         startLine = i
        //         break
        //     }
        // }
        // for (i = this.plantsAsTextMemo.Lines.Count - 1; i >= 0; i--) {
        //     if (pos(kPlantAsTextEndString, this.plantsAsTextMemo.Lines.Strings[i]) > 0) {
        //         endLine = i
        //         break
        //     }
        // }
        // if (startLine < 0) {
        //     this.plantsAsTextMemo.Clear()
        //     MessageDialog("The clipboard has text in it, but no plants." + chr(13) + chr(13) + "I can't find a starting line for a plant text description." + chr(13) + "It should have \"" + uplant.kPlantAsTextStartString + "\" in it." + chr(13) + chr(13) + "If you copied the text for a plant," + chr(13) + "make sure the first line is selected and copy it again.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        //     return
        // }
        // if (endLine < 0) {
        //     this.plantsAsTextMemo.Clear()
        //     MessageDialog("The clipboard has text in it, but no plants." + chr(13) + chr(13) + "I can't find an ending line for a plant text description." + chr(13) + "It should have \"" + uplant.kPlantAsTextEndString + "\" in it." + chr(13) + chr(13) + "If you copied the text for a plant," + chr(13) + "make sure the whole plant is selected and copy it again.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        //     return
        // }
        // // since startLine and endLine are comments, we can read them
        // let i = startLine
        // while (i <= endLine) {
        //     const aLine: string = this.plantsAsTextMemo.Lines.Strings[i]
        //     i += 1
        //     if (trim(aLine) === "") {
        //         // v1.60final ignore blank lines
        //         continue
        //     }
        //     if (pos(";", aLine) === 1) {
        //         continue
        //     }
        //     if (pos("[", aLine) === 1) {
        //         checkVersionNumberInPlantNameLine(aLine)
        //         const plant = new PdPlant()
        //         let plantName = stringBeyond(aLine, "[")
        //         plantName = stringUpTo(plantName, "]")
        //         plant.setName(plantName + " from text")
        //         domain.parameterManager.setAllReadFlagsToFalse()
        //         plant.readingFromMemo = true
        //         try {
        //             while ((pos(kPlantAsTextEndString, aLine) <= 0) && (i <= endLine)) {
        //                 // v1.60final fixed cutting off plant at blank line (was changed in file read in v1.3)
        //                 // aLine <> '' do
        //                 let aLine = this.plantsAsTextMemo.Lines.Strings[i]
        //                 i += 1
        //                 if (pos(";", aLine) === 1) {
        //                     continue
        //                 }
        //                 if (trim(aLine) === "") {
        //                     continue
        //                 }
        //                 if (pos(uppercase(kStartNoteString), uppercase(aLine)) > 0) {
        //                     // added v1.6b1 to accommodate paste from text with note
        //                     plant.noteLines.Clear()
        //                     while (i <= this.plantsAsTextMemo.Lines.Count - 1) {
        //                         aLine = this.plantsAsTextMemo.Lines.Strings[i]
        //                         i += 1
        //                         if ((pos(uppercase(kEndNoteString), uppercase(aLine)) > 0) && (plant.noteLines.Count < 5000)) {
        //                             break
        //                         } else if (pos(";", aLine) === 1) {
        //                             continue
        //                         } else {
        //                             plant.noteLines.Add(aLine)
        //                         }
        //                     }
        //                 }
        //                 // end added v1.6b1
        //                 plant.readingMemoLine = i
        //                 plant.readLineAndTdoFromPlantFile(aLine, fakeTextFile)
        //                 if (i !== plant.readingMemoLine) {
        //                     i = plant.readingMemoLine
        //                 }
        //             }
        //         } finally {
        //             plant.readingFromMemo = false
        //             plant.readingMemoLine = -1
        //         }
        //         plant.finishLoadingOrDefaulting(kCheckForUnreadParams)
        //         // cfk change v1.3 make plant fit into 100x100 box with paste from text, because
        //         // the scale always seems to be way off from what is being used; this way it always
        //         // looks okay when it pastes
        //         plant.drawPreviewIntoCache(Point(domain.options.pasteRectSize, domain.options.pasteRectSize), kDontConsiderDomainScale, uplant.kDontDrawNow)
        //         newPlants.push(plant)
        //     }
        // }
        // const newCommand = new PdPasteCommand(newPlants, this.selectedPlants)
        // this.doCommand(newCommand)
    }
    
    // export 
    getBitmapCopySavePrintOptions(copySavePrintType: short): int {
        unfinished(); return 0
        // let bitmapOptionsForm: TBitmapOptionsForm
        
        // let result = mrCancel
        // bitmapOptionsForm = ubmpopt.TBitmapOptionsForm().create(this)
        // if (bitmapOptionsForm === null) {
        //     throw new Error("Problem: Could not create copy/save/print options window.")
        // }
        // bitmapOptionsForm.initializeWithTypeAndOptions(copySavePrintType, domain.bitmapOptions)
        // result = bitmapOptionsForm.ShowModal()
        // domain.bitmapOptions = bitmapOptionsForm.options
        // return result
    }
    
    MenuEditCopyDrawingClick(): void {
        unfinished()
        // let bitmapForExport: TBitmap
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.getBitmapCopySavePrintOptions(ubmpopt.kCopyingDrawing) === mrOK) {
        //     bitmapForExport = delphi_compatability.TBitmap().Create()
        //     this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
        //     ubitmap.CopyBitmapToClipboard(bitmapForExport)
        // }
    }
    
    MenuFileSaveDrawingAsClick(): void {
        unfinished()
        // let fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        // let bitmapForExport: TBitmap
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.getBitmapCopySavePrintOptions(kSavingDrawingToBmp) === mrCancel) {
        //     return
        // }
        // pictureFileSaveAttemptsThisSession += 1
        // const suggestedFileName = "picture" + IntToStr(pictureFileSaveAttemptsThisSession) + ".bmp"
        // if (!getFileSaveInfo(FileType.kFileTypeBitmap, kAskForFileName, suggestedFileName, fileInfo)) {
        //     return
        // }
        // bitmapForExport = delphi_compatability.TBitmap().Create()
        // try {
        //     startFileSave(fileInfo)
        //     startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
        //     this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
        //     bitmapForExport.SaveToFile(fileInfo.tempFile)
        //     fileInfo.writingWasSuccessful = true
        // } finally {
        //     stopWaitMessage()
        //     cleanUpAfterFileSave(fileInfo)
        // }
    }
    
    MenuFileSaveJPEGClick(): void {
        unfinished()
        // let fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        // let bitmapForExport: TBitmap
        // let jpegForExport: TJPEGImage
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.getBitmapCopySavePrintOptions(ubmpopt.kSavingDrawingToJpeg) === mrCancel) {
        //     return
        // }
        // pictureFileSaveAttemptsThisSession += 1
        // const suggestedFileName = "picture" + IntToStr(pictureFileSaveAttemptsThisSession) + ".jpg"
        // if (!getFileSaveInfo(FileType.kFileTypeJPEG, kAskForFileName, suggestedFileName, fileInfo)) {
        //     return
        // }
        // bitmapForExport = delphi_compatability.TBitmap().Create()
        // jpegForExport = UNRESOLVED.TJPEGImage.create
        // try {
        //     startFileSave(fileInfo)
        //     startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
        //     this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
        //     jpegForExport.assign(bitmapForExport)
        //     // no option here
        //     jpegForExport.pixelFormat = UNRESOLVED.jf24Bit
        //     // we ask for compression, they want quality, so we switch here
        //     jpegForExport.compressionQuality = UNRESOLVED.TJPEGQualityRange(100 - domain.bitmapOptions.jpegCompressionRatio)
        //     jpegForExport.saveToFile(fileInfo.tempFile)
        //     fileInfo.writingWasSuccessful = true
        // } finally {
        //     stopWaitMessage()
        //     cleanUpAfterFileSave(fileInfo)
        // }
    }
    
    MenuFilePrintDrawingClick(): void {
        unfinished()
        // const printRect_pixels: TRect = new TRect()
        // let bitmapForExport: TBitmap
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.getBitmapCopySavePrintOptions(ubmpopt.kPrintingDrawing) === mrCancel) {
        //     return
        // }
        // bitmapForExport = delphi_compatability.TBitmap().Create()
        // this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
        // UNRESOLVED.Printer.Title = "PlantStudio Picture"
        // UNRESOLVED.Printer.beginDoc
        // const xResolution_pixelsPerInch: float = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSX)
        // const yResolution_pixelsPerInch: float = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSY)
        // const printOffsetX_px: int = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetX)
        // const printOffsetY_px: int = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetY)
        // printRect_pixels.Left = intround(domain.bitmapOptions.printLeftMargin_in * xResolution_pixelsPerInch) - printOffsetX_px
        // printRect_pixels.Top = intround(domain.bitmapOptions.printTopMargin_in * yResolution_pixelsPerInch) - printOffsetY_px
        // printRect_pixels.Right = printRect_pixels.Left + intround(domain.bitmapOptions.printWidth_in * xResolution_pixelsPerInch)
        // printRect_pixels.Bottom = printRect_pixels.Top + intround(domain.bitmapOptions.printHeight_in * yResolution_pixelsPerInch)
        // UNRESOLVED.inflateRect(printRect_pixels, -domain.bitmapOptions.borderThickness, -domain.bitmapOptions.borderThickness)
        // ubitmap.PrintBitmap(bitmapForExport, printRect_pixels)
        // //FIX unresolved WITH expression: UNRESOLVED.Printer.Canvas
        // // border
        // this.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        // if (domain.bitmapOptions.printBorderInner) {
        //     UNRESOLVED.pen.color = domain.bitmapOptions.printBorderColorInner
        //     UNRESOLVED.pen.width = domain.bitmapOptions.printBorderWidthInner
        //     UNRESOLVED.rectangle(printRect_pixels.Left, printRect_pixels.Top, printRect_pixels.Right, printRect_pixels.Bottom)
        // }
        // if (domain.bitmapOptions.printBorderOuter) {
        //     UNRESOLVED.pen.color = domain.bitmapOptions.printBorderColorOuter
        //     UNRESOLVED.pen.width = domain.bitmapOptions.printBorderWidthOuter
        //     UNRESOLVED.rectangle(printRect_pixels.Left - domain.bitmapOptions.borderGap, printRect_pixels.Top - domain.bitmapOptions.borderGap, printRect_pixels.Right + domain.bitmapOptions.borderGap, printRect_pixels.Bottom + domain.bitmapOptions.borderGap)
        // }
        // UNRESOLVED.Printer.endDoc
    }

    // edit menu 
    copySelectedPlantsToClipboard(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        domain.plantManager.copyPlantsInListToPrivatePlantClipboard(this.selectedPlants)
        domain.plantManager.setCopiedFromMainWindowFlagInClipboardPlants()
        this.updatePasteMenuForClipboardContents()
    }

    /*
    
    fillBitmapForExport(bitmapForExport: TBitmap, options: BitmapOptionsStructure): void {
        if ((bitmapForExport === null) || (domain === null)) {
            return
        }
        // set up according to domain options
        bitmapForExport.PixelFormat = options.colorType
        let combinedBoundsRect: TRect = new TRect()
        let plantsToDraw: PdPlant[] = []
        let excludeInvisiblePlants = true
        let excludeNonSelectedPlants = false
        switch (options.exportType) {
            case kIncludeSelectedPlants:
                plantsToDraw = this.selectedPlants
                excludeInvisiblePlants = true
                excludeNonSelectedPlants = true
                combinedBoundsRect = domain.plantManager.combinedPlantBoundsRects(this.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
                break
            case kIncludeVisiblePlants:
                plantsToDraw = this.plants
                excludeInvisiblePlants = true
                excludeNonSelectedPlants = false
                combinedBoundsRect = domain.plantManager.combinedPlantBoundsRects(this.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
                break
            case kIncludeAllPlants:
                plantsToDraw = this.plants
                excludeInvisiblePlants = false
                excludeNonSelectedPlants = false
                combinedBoundsRect = domain.plantManager.combinedPlantBoundsRects(this.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
                break
            case kIncludeDrawingAreaContents:
                plantsToDraw = this.plants
                excludeInvisiblePlants = true
                excludeNonSelectedPlants = false
                combinedBoundsRect = Rect(0, 0, this.drawingBitmap.Width, this.drawingBitmap.Height)
                break
        }
        const rectToDrawIn = Rect(0, 0, options.width_pixels, options.height_pixels)
        if ((plantsToDraw === null) || (plantsToDraw.length <= 0)) {
            return
        }
        const xMultiplier = safedivExcept(1.0 * rWidth(rectToDrawIn), 1.0 * rWidth(combinedBoundsRect), 1.0)
        const yMultiplier = safedivExcept(1.0 * rHeight(rectToDrawIn), 1.0 * rHeight(combinedBoundsRect), 1.0)
        const scaleMultiplier = Math.min(xMultiplier, yMultiplier)
        try {
            cursor_startWait()
            ubmpsupport.resizeBitmap(bitmapForExport, Point(intround(rWidth(combinedBoundsRect) * scaleMultiplier), intround(rHeight(combinedBoundsRect) * scaleMultiplier)))
            domain.drawingToMakeCopyBitmap = true
            domain.temporarilyHideSelectionRectangles = true
            domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm = domain.plantDrawScale_PixelsPerMm() * scaleMultiplier
            domain.plantDrawOffsetWhenDrawingCopy_mm = domain.plantDrawOffset_mm()
            if (options.exportType !== kIncludeDrawingAreaContents) {
                domain.plantDrawOffsetWhenDrawingCopy_mm.x = domain.plantDrawOffsetWhenDrawingCopy_mm.x - safedivExcept(1.0 * combinedBoundsRect.Left, domain.plantDrawScale_PixelsPerMm(), 0)
                domain.plantDrawOffsetWhenDrawingCopy_mm.y = domain.plantDrawOffsetWhenDrawingCopy_mm.y - safedivExcept(1.0 * combinedBoundsRect.Top, domain.plantDrawScale_PixelsPerMm(), 0)
            }
            ubmpsupport.fillBitmap(bitmapForExport, domain.options.backgroundColor)
            let plantPartsToDraw = 0
            if (domain.options.showPlantDrawingProgress) {
                plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(plantsToDraw, combinedBoundsRect, excludeInvisiblePlants, excludeNonSelectedPlants)
            }
            try {
                this.drawing = true
                if (domain.options.showPlantDrawingProgress) {
                    this.startDrawProgress(plantPartsToDraw)
                }
                // leave out openGL for now, put in later when you get bitmap drawing working
                domain.plantManager.drawOnInvalidRect(bitmapForExport.Canvas, plantsToDraw, combinedBoundsRect, excludeInvisiblePlants, excludeNonSelectedPlants)
            } finally {
                this.drawing = false
                if (domain.options.showPlantDrawingProgress) {
                    this.finishDrawProgress()
                }
            }
        } finally {
            cursor_stopWait()
            domain.temporarilyHideSelectionRectangles = false
            domain.drawingToMakeCopyBitmap = false
            domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm = 1.0
            domain.plantDrawOffsetWhenDrawingCopy_mm = setSinglePoint(0, 0)
        }
    }

    */
    
    MenuEditPasteClick(): void {
        this.pastePlantsFromClipboard()
    }
    
    pastePlantsFromClipboard(): void {
        unfinished()
        // if (domain.plantManager.privatePlantClipboard.Count <= 0) {
        //     return
        // }
        // const newPlants: PdPlant[] = []
        // domain.plantManager.pastePlantsFromPrivatePlantClipboardToList(newPlants)
        // const newCommand = new PdPasteCommand(newPlants, this.selectedPlants)
        // this.doCommand(newCommand)
    }

    standardPastePosition(): TPoint {
        const result = Point(this.drawingPaintBox.width / 2, 3 * this.drawingPaintBox.height / 4)
        return result
    }
    
    MenuEditDeleteClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdRemoveCommand(this.selectedPlants, kDontCopyToClipboard)
        this.doCommand(newCommand)
    }
    
    MenuEditDuplicateClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdDuplicateCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuEditPreferencesClick(): void {
        unfinished()
        // const optionsForm: TOptionsForm = uoptions.TOptionsForm().create(this)
        // if (optionsForm === null) {
        //     throw new Error("Problem: Could not create preferences window.")
        // }
        // optionsForm.options = domain.options
        // const response = optionsForm.ShowModal()
        // if ((response === mrOK) && (optionsForm.optionsChanged)) {
        //     const newCommand = new PdChangeDomainOptionsCommand(optionsForm.options)
        //     this.doCommand(newCommand)
        // }
    }
    
    // ---------------------------------------------------------------------------- *plant menu 
    MenuPlantNewClick(): void {
        // TODO PDF: Temp for testing
        const plant = new PdPlant()
        plant.defaultAllParameters()
        plant.randomize()
        plant.age = 90
        plant.name = "UUID:" + plant.uuid
        plant.basePoint_mm.x = Math.floor(Math.random() * 600)
        plant.basePoint_mm.y = 300 + Math.floor(Math.random() * 300)
        // plant.xRotation = Math.random() * 365
        // this.plants.push(plant)
        const newCommand = new PdNewCommand(plant, this.selectedPlants)
        this.doCommand(newCommand)
        //     this.doCommand(newCommand)
        // TODO PDF: Fix this
        // let wizardForm: TWizardForm

        // try {
        //     cursor_startWait()
        //     // on slower computer wizard takes a long time to come up
        //     startWaitMessage("Starting the plant wizard...")
        //     wizardForm = uwizard.TWizardForm().create(this)
        // } finally {
        //     stopWaitMessage()
        //     cursor_stopWait()
        // }
        // if (wizardForm === null) {
        //     throw new Error("Problem: Could not create wizard window.")
        // }
        // const response = wizardForm.ShowModal()
        // if (response === mrOK) {
        //     if (wizardForm.plant === null) {
        //         throw new Error("Problem: New wizard plant is nil.")
        //     }
        //     const newPlantFromWizard = new PdPlant()
        //     wizardForm.plant.copyTo(newPlantFromWizard)
        //     const newCommand = new PdNewCommand(newPlantFromWizard, this.selectedPlants)
        //     this.doCommand(newCommand)
        //     // command will free newPlantFromWizard 
        // }
    }
    
    MenuPlantNewUsingLastWizardSettingsClick(): void {
        unfinished()
        // let wizardForm: TWizardForm
        // let newPlantFromWizard: PdPlant
        
        // try {
        //     // use wizard form to make a new plant using the current settings, but don't show the form
        //     // this is a sloppy way of doing this, but using the settings to set plant params is embedded in the form.
        //     cursor_startWait()
        //     startWaitMessage("Making new plant...")
        //     wizardForm = uwizard.TWizardForm().create(this)
        // } finally {
        //     cursor_stopWait()
        // }
        // newPlantFromWizard = new PdPlant()
        // try {
        //     if (wizardForm === null) {
        //         throw new Error("Problem: Could not create plant from last wizard settings.")
        //     }
        //     if (wizardForm.plant === null) {
        //         throw new Error("Problem: Could not create plant from last wizard settings (nil plant).")
        //     }
        //     wizardForm.setPlantVariables()
        //     wizardForm.plant.copyTo(newPlantFromWizard)
        //     newPlantFromWizard.setAge(newPlantFromWizard.pGeneral.ageAtMaturity)
        //     const newCommand = new PdNewCommand(newPlantFromWizard, this.selectedPlants)
        //     this.doCommand(newCommand)
        // } finally {
        //     stopWaitMessage()
        // }
    }
    
    async MenuPlantRenameClick(): Promise<void> {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const newName = plant.getName()
        const response = await InputQuery("Rename plant", "Enter a new name for " + plant.getName(), newName)
        if (response !== null) {
            const newCommand = new PdRenameCommand(plant, response)
            this.doCommand(newCommand)
        }
    }
    
    MenuPlantRandomizeClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdRandomizeCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuPlantZeroRotationsClick(): void {
        this.resetRotationsClick()
    }
    
    MenuPlantBreedClick(): void {
        unfinished()
        // if (this.selectedPlants.length <= 0) {
        //     return
        // }
        // if (ubreedr.BreederForm.selectedRow >= domain.breedingAndTimeSeriesOptions.maxGenerations - 2) {
        //     // check if there is room in the breeder - this command will make two new generations 
        //     ubreedr.BreederForm.fullWarning()
        // } else {
        //     const newCommand = new PdBreedFromParentsCommand(ubreedr.BreederForm.generations, this.focusedPlant(), this.firstUnfocusedPlant(), -1, domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, kCreateFirstGeneration)
        //     this.doCommand(newCommand)
        // }
    }
    
    MenuPlantMakeTimeSeriesClick(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const newCommand = new PdMakeTimeSeriesCommand(plant)
        this.doCommand(newCommand)
    }
    
    /*
    
    //v2.1
    // v2.1 separated this out and added call in animation saving
    // it is the same otherwise except for the padding
    enoughRoomToSaveFile(tempFileName: string, fileDescriptor: string, fileSizeNeeded_MB: float): boolean {
        let result = true
        const driveLetter: string = uppercase(UNRESOLVED.copy(UNRESOLVED.ExtractFileDrive(tempFileName), 1, 1))
        const driveNumber: short = ord(driveLetter[1]) - ord("A") + 1
        const fileMegaBytesAvailable: float = 1.0 * UNRESOLVED.diskFree(driveNumber) / (1024 * 1024)
        if (fileMegaBytesAvailable >= 0) {
            if (fileMegaBytesAvailable < fileSizeNeeded_MB * 1.1) {
                // if there are too many bytes available, the integer wraps around and goes negative, so ignore this case
                // pad size needed in case estimate is slightly off  // v2.1
                ShowMessage("Not enough space to save " + fileDescriptor + " file(s) (" + usupport.digitValueString(fileSizeNeeded_MB) + " MB needed, " + usupport.digitValueString(fileMegaBytesAvailable) + " MB available)." + chr(13) + "Choose another option or make more space available.")
                result = false
            }
        }
        return result
    }
    
    */
    
    ExportToGeneric3DType(outputType: short): void {
        unfinished()
        // let fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        // let optionsForm: TGeneric3DOptionsForm
        // let tempOptions: FileExport3DOptionsStructure
        // let fileType: short
        // let fileDescriptor: string
        // let optionsChanged: boolean
        // let excludeInvisiblePlants: boolean
        // let excludeNonSelectedPlants: boolean
        
        // optionsChanged = false
        // optionsForm = uoptions3dexport.TGeneric3DOptionsForm().create(this)
        // if (optionsForm === null) {
        //     throw new Error("Problem: Could not create 3D export options window.")
        // }
        // optionsForm.outputType = outputType
        // optionsForm.rearrangeItemsForOutputType()
        // optionsForm.options = domain.exportOptionsFor3D[outputType]
        // const response = optionsForm.ShowModal()
        // tempOptions = optionsForm.options
        // optionsChanged = optionsForm.optionsChanged
        // if (response !== mrOK) {
        //     return
        // }
        // fileType = fileTypeFor3DExportType(outputType)
        // fileDescriptor = nameStringForFileType(fileType)
        // exportTo3DFileSaveAttemptsThisSession[outputType] += 1
        // const suggestedFileName = "plants" + IntToStr(exportTo3DFileSaveAttemptsThisSession[outputType]) + "." + usupport.extensionForFileType(fileType)
        // if (!getFileSaveInfo(fileType, kAskForFileName, suggestedFileName, fileInfo)) {
        //     if (optionsChanged) {
        //         if (MessageDialog(fileDescriptor + " export stopped." + chr(13) + chr(13) + "Do you want to save the changes you made" + chr(13) + "to the " + fileDescriptor + " export options?", mtConfirmation, mbYesNo, 0) === IDYES) {
        //             const newCommand = new PdChangeDomain3DOptionsCommand(tempOptions, outputType)
        //             this.doCommand(newCommand)
        //         }
        //     }
        //     return
        // }
        // if (!this.enoughRoomToSaveFile(fileInfo.tempFile, fileDescriptor, tempOptions.fileSize)) {
        //     return
        // }
        // if (optionsChanged) {
        //     const newCommand = new PdChangeDomain3DOptionsCommand(tempOptions, outputType)
        //     this.doCommand(newCommand)
        // }
        // try {
        //     startFileSave(fileInfo)
        //     if (outputType === FileType.kPOV) {
        //         fileInfo.newFile = usupport.replacePunctuationWithUnderscores(stringUpTo(ExtractFileName(fileInfo.newFile), ".")) + ".inc"
        //     }
        //     startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
        //     excludeInvisiblePlants = false
        //     excludeNonSelectedPlants = false
        //     switch (tempOptions.exportType) {
        //         case kIncludeSelectedPlants:
        //             excludeInvisiblePlants = true
        //             excludeNonSelectedPlants = true
        //             break
        //         case kIncludeVisiblePlants:
        //             excludeInvisiblePlants = true
        //             break
        //     }
        //     domain.plantManager.write3DOutputFileToFileName(this.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants, fileInfo.tempFile, outputType)
        //     fileInfo.writingWasSuccessful = true
        // } finally {
        //     stopWaitMessage()
        //     cleanUpAfterFileSave(fileInfo)
        // }
    }
    
    MenuPlantExportToDXFClick(): void {
        this.ExportToGeneric3DType(ExportFormats.kDXF)
    }
    
    MenuPlantExportTo3DSClick(): void {
        this.ExportToGeneric3DType(ExportFormats.k3DS)
    }
    
    MenuPlantExportToOBJClick(): void {
        this.ExportToGeneric3DType(ExportFormats.kOBJ)
    }
    
    MenuPlantExportToPOVClick(): void {
        this.ExportToGeneric3DType(ExportFormats.kPOV)
    }
    
    MenuPlantExportToVRMLClick(): void {
        this.ExportToGeneric3DType(ExportFormats.kVRML)
    }
    
    MenuPlantExportToLWOClick(): void {
        this.ExportToGeneric3DType(ExportFormats.kLWO)
    }
    
    // -------------------------------------------------------------------------- *layout menu 
    MenuLayoutSelectAllClick(): void {
        const newCommand = new PdSelectOrDeselectAllCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuLayoutDeselectClick(): void {
        const newCommand = new PdSelectOrDeselectAllCommand(this.selectedPlants)
        newCommand.deselect = true
        this.doCommand(newCommand)
    }
    
    MenuFileMakePainterNozzleClick(): void {
        unfinished()
        // let fileInfo: SaveFileNamesStructure = createSaveFileNamesStructure()
        // let bitmapForExport: TBitmap
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.getNozzleOptions() === mrCancel) {
        //     return
        // }
        // if (domain.nozzleOptions.cellCount <= 0) {
        //     return
        // }
        // nozzleFileSaveAttemptsThisSession += 1
        // const suggestedFileName = "nozzle" + IntToStr(nozzleFileSaveAttemptsThisSession) + " " + IntToStr(domain.nozzleOptions.cellSize.X) + "x" + IntToStr(domain.nozzleOptions.cellSize.Y) + "x" + IntToStr(domain.nozzleOptions.cellCount) + ".bmp"
        // if (!getFileSaveInfo(FileType.kFileTypeBitmap, kAskForFileName, suggestedFileName, fileInfo)) {
        //     return
        // }
        // bitmapForExport = delphi_compatability.TBitmap().Create()
        // try {
        //     startFileSave(fileInfo)
        //     startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
        //     this.fillBitmapForPainterNozzle(bitmapForExport)
        //     bitmapForExport.SaveToFile(fileInfo.tempFile)
        //     fileInfo.writingWasSuccessful = true
        // } finally {
        //     stopWaitMessage()
        //     cleanUpAfterFileSave(fileInfo)
        // }
    }
    
    /*

    getNozzleOptions(): int {
        let result = 0
        let nozzleOptionsForm: TNozzleOptionsForm
        
        result = mrCancel
        nozzleOptionsForm = unozzle.TNozzleOptionsForm().create(this)
        if (nozzleOptionsForm === null) {
            throw new Error("Problem: Could not create nozzle options window.")
        }
        nozzleOptionsForm.initializeWithOptions(domain.nozzleOptions)
        result = nozzleOptionsForm.ShowModal()
        domain.nozzleOptions = nozzleOptionsForm.options
        return result
    }
    
    fillBitmapForPainterNozzle(bitmapForExport: TBitmap): void {
        if ((bitmapForExport === null) || (domain === null)) {
            return
        }
        const oldBackgroundColor = domain.options.backgroundColor
        bitmapForExport.PixelFormat = domain.nozzleOptions.colorType
        let plantsToDraw: PdPlant[]
        if (domain.nozzleOptions.exportType === kIncludeSelectedPlants) {
            plantsToDraw = this.selectedPlants
        } else {
            plantsToDraw = this.plants
        }
        if ((plantsToDraw === null) || (plantsToDraw.length <= 0)) {
            return
        }
        try {
            cursor_startWait()
            ubmpsupport.resizeBitmap(bitmapForExport, Point(intround(domain.nozzleOptions.cellSize.X * plantsToDraw.length), domain.nozzleOptions.cellSize.Y))
            let scaleMultiplier = safedivExcept(1.0 * domain.nozzleOptions.resolution_pixelsPerInch, 1.0 * delphi_compatability.Screen.PixelsPerInch, 1.0)
            // v1.4 changed 0.8 to 0.9 because fitting algorithm works better now
            // extra margin to make sure plants fit
            scaleMultiplier = scaleMultiplier * 0.9
            domain.options.backgroundColor = domain.nozzleOptions.backgroundColor
            ubmpsupport.fillBitmap(bitmapForExport, domain.nozzleOptions.backgroundColor)
            for (let i = 0; i <= plantsToDraw.length - 1; i++) {
                const plant = plantsToDraw[i]
                const scaledPlantSize = Point(intround(rWidth(plant.boundsRect_pixels()) * scaleMultiplier), intround(rHeight(plant.boundsRect_pixels()) * scaleMultiplier))
                const oldPlantScale = plant.drawingScale_PixelsPerMm
                try {
                    // v1.4
                    plant.fixedPreviewScale = false
                    // v1.4
                    plant.fixedDrawPosition = false
                    plant.drawPreviewIntoCache(scaledPlantSize, kDontConsiderDomainScale, kDrawNow)
                    bitmapForExport.Canvas.Draw(i * domain.nozzleOptions.cellSize.X, 0, plant.previewCache)
                    plant.shrinkPreviewCache()
                } finally {
                    plant.drawingScale_PixelsPerMm = oldPlantScale
                    plant.recalculateBounds(kDrawNow)
                }
            }
        } finally {
            cursor_stopWait()
            domain.options.backgroundColor = oldBackgroundColor
        }
    }

    */
    
    MenuFileMakePainterAnimationClick(): void {
        unfinished()
        // let saveDialog: TSaveDialog
        
        // if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
        //     return
        // }
        // if (this.focusedPlant() === null) {
        //     return
        // }
        // if (this.getAnimationOptions() === mrCancel) {
        //     return
        // }
        // if (domain.animationOptions.frameCount <= 0) {
        //     return
        // }
        // saveDialog = delphi_compatability.TSaveDialog().Create(delphi_compatability.Application)
        // saveDialog.Title = "Choose a file name (numbers will be added)"
        // saveDialog.FileName = this.focusedPlant().getName() + ".bmp"
        // saveDialog.Filter = "Bitmap files (*.bmp)|*.bmp"
        // saveDialog.DefaultExt = "bmp"
        // saveDialog.Options = saveDialog.Options + {delphi_compatability.TOpenOption.ofPathMustExist, delphi_compatability.TOpenOption.ofOverwritePrompt, delphi_compatability.TOpenOption.ofHideReadOnly, delphi_compatability.TOpenOption.ofNoReadOnlyReturn, }
        // if (saveDialog.Execute()) {
        //     const sizeNeeded_MB = 1.0 * domain.animationOptions.fileSize / (1024 * 1024)
        //     if (!this.enoughRoomToSaveFile(saveDialog.FileName, "animation", sizeNeeded_MB)) {
        //         return
        //     }
        //     cursor_startWait()
        //     startWaitMessage("Starting...")
        //     try {
        //         this.writeAnimationFilesWithFileSpec(stringUpTo(saveDialog.FileName, ".") + " ")
        //     } finally {
        //         cursor_stopWait()
        //         stopWaitMessage()
        //     }
        // }
    }
    
    writeAnimationFilesWithFileSpec(startFileName: string): void {
        unfinished()
        // const plant = this.focusedPlant()
        // if (plant === null) {
        //     return
        // }
        // const oldXRotation = plant.xRotation
        // const oldAge = plant.age
        // const oldScale = plant.drawingScale_PixelsPerMm
        // try {
        //     plant.previewCache.PixelFormat = domain.animationOptions.colorType
        //     // draw plant for all frames, get min drawing scale
        //     plant.fixedPreviewScale = false
        //     plant.fixedDrawPosition = false
        //     let minScale = 0
        //     for (let i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
        //         setPlantCharacteristicsForAnimationFrame(plant, i)
        //         plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, uplant.kDontDrawNow)
        //         if ((i === 1) || (plant.drawingScale_PixelsPerMm < minScale)) {
        //             minScale = plant.drawingScale_PixelsPerMm
        //         }
        //     }
        //     // draw plant for all frames, get common draw position
        //     plant.drawingScale_PixelsPerMm = minScale
        //     plant.fixedPreviewScale = true
        //     const bestPosition: TPoint = new TPoint()
        //     let widestWidth = 0
        //     let tallestHeight = 0
        //     for (let i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
        //         setPlantCharacteristicsForAnimationFrame(plant, i)
        //         plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, kDontDrawNow)
        //         if ((i === 0) || (rWidth(plant.boundsRect_pixels()) > widestWidth)) {
        //             widestWidth = rWidth(plant.boundsRect_pixels())
        //             bestPosition.X = plant.drawPositionIfFixed.X
        //         }
        //         if ((i === 0) || (rHeight(plant.boundsRect_pixels()) > tallestHeight)) {
        //             tallestHeight = rHeight(plant.boundsRect_pixels())
        //             bestPosition.Y = plant.drawPositionIfFixed.Y
        //         }
        //     }
        //     // now really draw
        //     plant.drawPositionIfFixed = bestPosition
        //     plant.fixedDrawPosition = true
        //     for (let i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
        //         let saveFileName = startFileName
        //         if (i + 1 < 100) {
        //             saveFileName = saveFileName + "0"
        //         }
        //         if (i + 1 < 10) {
        //             saveFileName = saveFileName + "0"
        //         }
        //         saveFileName = saveFileName + IntToStr(i + 1) + ".bmp"
        //         startWaitMessage("Saving " + ExtractFileName(saveFileName) + "...")
        //         setPlantCharacteristicsForAnimationFrame(plant, i)
        //         plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, kDrawNow)
        //         plant.previewCache.SaveToFile(saveFileName)
        //     }
        //     // clean up for next time
        //     plant.fixedPreviewScale = false
        //     plant.fixedDrawPosition = false
        // } finally {
        //     plant.shrinkPreviewCache()
        //     plant.fixedPreviewScale = false
        //     plant.xRotation = oldXRotation
        //     plant.drawingScale_PixelsPerMm = oldScale
        //     plant.setAge(oldAge)
        //     plant.recalculateBounds(kDrawNow)
        // }
    }
    
    getAnimationOptions(): int {
        unfinished(); return 0
        // let animationOptionsForm: TAnimationFilesOptionsForm
        
        // let result = mrCancel
        // const plant = this.focusedPlant()
        // if (plant === null) {
        //     return result
        // }
        // animationOptionsForm = uanimate.TAnimationFilesOptionsForm().create(this)
        // if (animationOptionsForm === null) {
        //     throw new Error("Problem: Could not create animation options window.")
        // }
        // animationOptionsForm.initializeWithOptionsAndPlant(domain.animationOptions, plant)
        // result = animationOptionsForm.ShowModal()
        // domain.animationOptions = animationOptionsForm.options
        // return result
    }
    
    MenuLayoutShowClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        // make sure at least one plant is hidden 
        let atLeastOnePlantIsHidden = false
        for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
            if (this.selectedPlants[i].hidden) {
                atLeastOnePlantIsHidden = true
                break
            }
        }
        if (!atLeastOnePlantIsHidden) {
            return
        }
        const newCommand = new PdHideOrShowCommand(this.selectedPlants, kShow)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHideClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        // make sure at least one plant is showing 
        let atLeastOnePlantIsShowing = false
        for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
            if (!this.selectedPlants[i].hidden) {
                atLeastOnePlantIsShowing = true
                break
            }
        }
        if (!atLeastOnePlantIsShowing) {
            return
        }
        const newCommand = new PdHideOrShowCommand(this.selectedPlants, kHide)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHideOthersClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const booleansList: PdBooleanValue[] = []
        for (let i = 0; i <= this.plants.length - 1; i++) {
            const plant = this.plants[i]
            booleansList.push(new PdBooleanValue(!this.isSelected(plant)))
        }
        const newCommand = new PdHideOrShowCommand(this.plants, kHide, booleansList)
        this.doCommand(newCommand)
    }
    
    MenuLayoutMakeBouquetClick(): void {
        const plant = this.focusedPlant()
        if (!plant || this.selectedPlants.length <= 1) {
            return
        }
        const newCommand = new PdDragCommand(this.selectedPlants).createWithListOfPlantsAndNewPoint(plant.basePoint_pixels())
        this.doCommand(newCommand)
    }
    
    MenuLayoutScaleToFitClick(): void {
        this.centerDrawingClick()
    }
    
    // drawing 
    changeViewingOptionTo(aNewOption: short): void {
        if ((aNewOption === ViewPlants.kViewPlantsInMainWindowOneAtATime) && (this.selectedPlants.length <= 0)) {
            // PORT: Changed from the Delphi which was maybe buggy?
            if (this.plants.length > 0) {
                this.selectedPlants.push(this.plants[0])
                this.updateForChangeToPlantSelections()
            }
        }
        const newCommand = new PdChangeMainWindowViewingOptionCommand(this.plants, this.selectedPlants, aNewOption)
        this.doCommand(newCommand)
    }
    
    MenuLayoutViewOnePlantAtATimeClick(): void {
        if (domain.options.mainWindowViewMode !== ViewPlants.kViewPlantsInMainWindowOneAtATime) {
            this.changeViewingOptionTo(ViewPlants.kViewPlantsInMainWindowOneAtATime)
        }
    }
    
    viewOneOnlyClick(): void {
        this.MenuLayoutViewOnePlantAtATimeClick()
    }
    
    MenuLayoutViewFreeFloatingClick(): void {
        if (domain.options.mainWindowViewMode !== ViewPlants.kViewPlantsInMainWindowFreeFloating) {
            this.changeViewingOptionTo(ViewPlants.kViewPlantsInMainWindowFreeFloating)
        }
    }
    
    viewFreeFloatingClick(): void {
        this.MenuLayoutViewFreeFloatingClick()
    }
    
    MenuLayoutBringForwardClick(): void {
        const plant = this.firstSelectedPlantInList()
        if (plant === null) {
            return
        }
        if (this.plants.indexOf(plant) <= 0) {
            // don't do if you can't go forward any more 
            return
        }
        const newCommand = new PdSendBackwardOrForwardCommand(kBringForward)
        this.doCommand(newCommand)
    }
    
    MenuLayoutSendBackClick(): void {
        const plant = this.lastSelectedPlantInList()
        if (plant === null) {
            return
        }
        if (this.plants.indexOf(plant) >= this.plants.length - 1) {
            // don't do if you can't go backward any more 
            return
        }
        const newCommand = new PdSendBackwardOrForwardCommand(kSendBackward)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHorizontalOrientationClick(): void {
        if (domain.options.mainWindowOrientation !== kMainWindowOrientationHorizontal) {
            const newCommand = new PdChangeMainWindowOrientationCommand(kMainWindowOrientationHorizontal)
            this.doCommand(newCommand)
        }
    }
    
    MenuLayoutVerticalOrientationClick(): void {
        if (domain.options.mainWindowOrientation !== kMainWindowOrientationVertical) {
            const newCommand = new PdChangeMainWindowOrientationCommand(kMainWindowOrientationVertical)
            this.doCommand(newCommand)
        }
    }
    
    drawingAreaOnTopClick(): void {
        this.MenuLayoutHorizontalOrientationClick()
    }
    
    drawingAreaOnSideClick(): void {
        this.MenuLayoutVerticalOrientationClick()
    }
    
    // --------------------------------------------------------------------------- *options menu 
    MenuOptionsFastDrawClick(): void {
        const oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawFast
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsMediumDrawClick(): void {
        const oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawMedium
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsBestDrawClick(): void {
        const oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawBest
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsCustomDrawClick(): void {
        const lastDrawSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawCustom
        // TODO PDF: Fix this
        // let customDrawForm: TCustomDrawOptionsForm
        // let response: int
        // customDrawForm = ucustdrw.TCustomDrawOptionsForm().create(this)
        // if (customDrawForm === null) {
        //     throw new Error("Problem: Could not create 3D object mover window.")
        // }
        // customDrawForm.options = domain.options
        // response = customDrawForm.ShowModal()
        // if ((response === mrOK) && (customDrawForm.optionsChanged)) {
        //     const newCommand = new PdChangeDomainOptionsCommand(customDrawForm.options)
        //     this.doCommand(newCommand)
        // } else {
        //     if (lastDrawSpeed !== DrawMode.kDrawCustom) {
        //         // escape just escapes changing options in dialog, not setting to custom, should still redraw
        //         // v1.4 change UNLESS it was custom before.
        //         this.updateForChangeToDrawOptions()
        //     }
        // }
    }
    
    MenuOptionsUsePlantBitmapsClick(): void {
        if (domain.options.cachePlantBitmaps) {
            this.stopUsingPlantBitmaps()
        } else {
            this.startUsingPlantBitmaps()
        }
        this.updateForChangeToPlantBitmaps()
        this.updateForPossibleChangeToDrawing()
    }
    
    plantBitmapsIndicatorImageClick(): void {
        // TODO PDF: Fix or remove  -- does not seem eneded?: if ((!domain.options.cachePlantBitmaps) {
        this.MenuOptionsUsePlantBitmapsClick()
        // }
    }
    
    MenuOptionsShowSelectionRectanglesClick(): void {
        domain.options.showSelectionRectangle = !domain.options.showSelectionRectangle
        this.copyDrawingBitmapToPaintBox()
    }
    
    MenuOptionsShowBoundsRectanglesClick(): void {
        domain.options.showBoundsRectangle = !domain.options.showBoundsRectangle
        this.copyDrawingBitmapToPaintBox()
    }
    
    MenuOptionsGhostHiddenPartsClick(): void {
        domain.options.showGhostingForHiddenParts = !domain.options.showGhostingForHiddenParts
        this.internalChange = true
        // TODO PDF make sure button uses this: this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        this.internalChange = false
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    MenuOptionsHighlightPosedPartsClick(): void {
        domain.options.showHighlightingForNonHiddenPosedParts = !domain.options.showHighlightingForNonHiddenPosedParts
        this.internalChange = true
        // TODO PDF make sure button uses this: this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        this.internalChange = false
        this.redrawAllPlantsInViewWithAmendments()
    }
    
    MenuOptionsHidePosingClick(): void {
        domain.options.showPosingAtAll = !domain.options.showPosingAtAll
        this.internalChange = true
        // TODO PDF make sure button uses this: this.posingNotShown.Down = !domain.options.showPosingAtAll
        this.internalChange = false
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    posingHighlightClick(): void {
        unfinished()
        // if (this.internalChange) {
        //     return
        // }
        // domain.options.showHighlightingForNonHiddenPosedParts = !domain.options.showHighlightingForNonHiddenPosedParts
        // this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        // this.redrawAllPlantsInViewWithAmendments()
    }
    
    posingGhostClick(): void {
        unfinished()
        // if (this.internalChange) {
        //     return
        // }
        // domain.options.showGhostingForHiddenParts = !domain.options.showGhostingForHiddenParts
        // this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        // // cannot just redraw plants because bounds rects may have changed
        // this.redrawEverything()
    }
    
    posingNotShownClick(): void {
        if (this.internalChange) {
            return
        }
        domain.options.showPosingAtAll = !domain.options.showPosingAtAll
        // TODO PDF make sure button uses this: this.posingNotShown.Down = !domain.options.showPosingAtAll
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    MenuOptionsShowLongButtonHintsClick(): void {
        domain.options.showLongHintsForButtons = !domain.options.showLongHintsForButtons
        this.updateHintPauseForOptions()
        // shows different hint
        this.updateForChangeToPlantBitmaps()
    }
    
    MenuOptionsShowParameterHintsClick(): void {
        domain.options.showHintsForParameters = !domain.options.showHintsForParameters
        this.updateHintPauseForOptions()
    }
    
    // --------------------------------------------------------------------------- *window menu 
    MenuWindowBreederClick(): void {
        unfinished()
        // ubreedr.BreederForm.Show()
        // ubreedr.BreederForm.BringToFront()
        // if (ubreedr.BreederForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
        //     ubreedr.BreederForm.WindowState = delphi_compatability.TWindowState.wsNormal
        // }
    }
    
    MenuWindowTimeSeriesClick(): void {
        unfinished()
        // utimeser.TimeSeriesForm.Show()
        // utimeser.TimeSeriesForm.BringToFront()
        // if (utimeser.TimeSeriesForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
        //     utimeser.TimeSeriesForm.WindowState = delphi_compatability.TWindowState.wsNormal
        // }
    }
    
    MenuWindowNumericalExceptionsClick(): void {
        unfinished()
        // udebug.DebugForm.Show()
        // udebug.DebugForm.BringToFront()
        // if (udebug.DebugForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
        //     udebug.DebugForm.WindowState = delphi_compatability.TWindowState.wsNormal
        // }
    }
    
    // ---------------------------------------------------------------------------- *help menu 
    MenuHelpTopicsClick(): void {
        window.open("https://www.kurtz-fernhout.com/PlantStudio/help/index.htm")
    }
    
    async MenuHelpAboutClick() {
        return customModal((resolve: any) => {
            return m(TSplashForm, { close: () => resolve(true) } )
        })
    }
    
    MenuHelpSuperSpeedTourClick(): void {
        window.open("https://www.kurtz-fernhout.com/PlantStudio/help/plantstudioSuperSpeed_Tour.html")
    }
    
    MenuHelpTutorialClick(): void {
        window.open("https://www.kurtz-fernhout.com/PlantStudio/help/plantstudioTutorial.html")
    }
    
    /*

    // ---------------------------------------------------------------------------- *progress showing 
    progressPaintBoxPaint(): void {
        this.progressPaintBox.Canvas.Brush.Color = ColorDefs.clBtnFace
        this.progressPaintBox.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
        this.progressPaintBox.Canvas.Rectangle(0, 0, this.progressPaintBox.Width, this.progressPaintBox.Height)
    }
    
    startDrawProgress(maximum: long): void {
        this.drawProgressMax = maximum
        this.progressPaintBox.Invalidate()
        this.progressPaintBox.Refresh()
    }
    
    showDrawProgress(amount: long): void {
        if (!this.drawing) {
            return
        }
        if ((!this.animateTimer.enabled) && (!domain.options.showPlantDrawingProgress)) {
            return
        }
        if (this.animateTimer.enabled) {
            return
        }
        let progress: long
        if (this.drawProgressMax !== 0) {
            progress = intround((1.0 * this.progressPaintBox.Width * amount) / (this.drawProgressMax * 1.0))
        } else {
            progress = 0
        }
        if (progress > 0) {
            this.progressPaintBox.Canvas.Brush.Color = kProgressBarColor
            this.progressPaintBox.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
            this.progressPaintBox.Canvas.Rectangle(0, 0, progress, this.progressPaintBox.Height)
        }
    }
    
    finishDrawProgress(): void {
        this.progressPaintBox.Invalidate()
        this.progressPaintBox.Refresh()
    }
    
    */

    // plant menu 
    // help menu 
    // updating 
    // ---------------------------------------------------------------------------- *updating 
    updateForNoPlantFile(): void {
        this.selectedPlants = []
        this.clearCommandList()
        this.Caption = this.captionForFile()
        this.updateRightSidePanelForFirstSelectedPlant()
        this.redrawEverything()
        this.updateMenusForChangedPlantFile()
    }
    
    redrawEverything(): void {
        this.recalculateAllPlantBoundsRects(kDrawNow)
        this.invalidateEntireDrawing()
        this.updateForPossibleChangeToDrawing()
    }
    
    captionForFile(): string {
        let result = ""
        let numLeft: short
        
        if ((!domain.plantFileLoaded) || (domain.plantFileName === "")) {
            result = Application_Title + " - no file"
        } else {
            result = Application_Title + " - " + stringUpTo(ExtractFileName(domain.plantFileName), ".")
            if (this.plants.length <= 0) {
                result = result + " (no plants)"
            } else if (this.plants.length === 1) {
                result = result + " (1 plant)"
            } else {
                result = result + " (" + IntToStr(this.plants.length) + " plants)"
            }
        }
        return result
    }
    
    updateForPlantFile(): void {
        this.internalChange = true
        if (!domain.plantFileLoaded) {
            this.updateForNoPlantFile()
        } else {
            this.Caption = this.captionForFile()
            this.updateForChangeToPlantList()
            this.updateMenusForChangedPlantFile()
            this.selectedPlants= []
            this.magnificationPercent.Text = IntToStr(intround(domain.plantDrawScale_PixelsPerMm() * 100.0)) + "%"
            if (domain.plantManager.mainWindowOrientation !== domain.options.mainWindowOrientation) {
                // v2.0 load and save window orientation (top or side)
                domain.options.mainWindowOrientation = domain.plantManager.mainWindowOrientation
            }
            if (this.plants.length > 0) {
                for (let i = 0; i <= this.plants.length - 1; i++) {
                    // v2.0 load and save plant hidden and selected flags
                    const plant = this.plants[i]
                    if (plant.selectedWhenLastSaved) {
                        this.selectedPlants.push(plant)
                    }
                }
                if (this.selectedPlants.length <= 0) {
                    this.selectedPlants.push(this.plants[0])
                }
                this.updateForChangeToPlantSelections()
            }
            if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                // deal with possibly changed viewing mode (one/many)
                this.showOnePlantExclusively(kDontDrawYet)
            }
            if (domain.plantManager.fitInVisibleAreaForConcentrationChange) {
                this.fitVisiblePlantsInDrawingArea(kDrawNow, kScaleAndMove, kAlwaysMove)
                domain.plantManager.fitInVisibleAreaForConcentrationChange = false
            } else {
                this.fitVisiblePlantsInDrawingArea(kDrawNow, kJustMove, kOnlyMoveIfOffTheScreen)
                this.redrawEverything()
            }
        }
        // v2.0 switch to select/drag mode - sometimes it seems to get broken - this will fix it - not unreasonable to do
        this.cursorModeForDrawing = CursorMode.kCursorModeSelectDrag
        this.internalChange = false
    }

    updateHintPauseForOptions(): void {
        // TODO PDF: Fix this
        // delphi_compatability.Application.HintPause = domain.options.pauseBeforeHint * 1000
        // if (domain.options.showLongHintsForButtons || domain.options.showHintsForParameters) {
        //     delphi_compatability.Application.HintHidePause = domain.options.pauseDuringHint * 1000
        // } else {
        //     delphi_compatability.Application.HintHidePause = 2500
        // }
        // this.statsPanel.updateHint()
    }

    updateForChangedExportCount(): void {
        this.Caption = this.captionForFile()
    }
    
    updateForChangeToDomainOptions(): void {
        this.internalChange = true
        // fonts
        // v1.6b1 -- fix for large fonts problem
         // TODO PDF: Fix this or remove
        // this.Font.Size = domain.options.parametersFontSize
        // this.parametersScrollBox.Font.Size = domain.options.parametersFontSize
        // this.parametersScrollBox.Invalidate()
        // // posing
        // this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        // this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        // this.posingNotShown.Down = !domain.options.showPosingAtAll
        // this.internalChange = false
        // hint, undo
        this.updateHintPauseForOptions()
        this.commandList.setNewUndoLimit(domain.options.undoLimit)
        this.commandList.setNewObjectUndoLimit(domain.options.undoLimitOfPlants)
        // TODO PDF: Fix this or remove
        // if (ubreedr.BreederForm !== null) {
        //     ubreedr.BreederForm.updateForChangeToDomainOptions()
        // }
        // if (utimeser.TimeSeriesForm !== null) {
        //     utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
        // }
        if (this.lifeCycleShowing()) {
            //because max drawing scale might have changed
            this.updateLifeCyclePanelForFirstSelectedPlant()
        }
        if (!this.inFormCreation) {
            this.redrawEverything()
        }
        // in case max changed
        this.updateForChangeToPlantBitmaps()
    }
    
    updateForChangeToDrawOptions(): void {
        this.redrawEverything()
        // TODO PDF: Fix this for other forms
        // if (ubreedr.BreederForm !== null) {
        //     if ((ubreedr.BreederForm.Visible) && (ubreedr.BreederForm.WindowState !== delphi_compatability.TWindowState.wsMinimized)) {
        //         ubreedr.BreederForm.redrawPlants(ubreedr.kDontConsiderIfPreviewCacheIsUpToDate)
        //     } else {
        //         ubreedr.BreederForm.needToRedrawFromChangeToDrawOptions = true
        //     }
        // }
        // if (utimeser.TimeSeriesForm !== null) {
        //     if ((utimeser.TimeSeriesForm.Visible) && (utimeser.TimeSeriesForm.WindowState !== delphi_compatability.TWindowState.wsMinimized)) {
        //         utimeser.TimeSeriesForm.redrawPlants()
        //     } else {
        //         utimeser.TimeSeriesForm.needToRedrawFromChangeToDrawOptions = true
        //     }
        // }
    }
    
    moveUpOrDownWithKeyInPlantList(indexAfterMove: short): void {
        if (indexAfterMove > this.plants.length - 1) {
            // loop around 
            indexAfterMove = 0
        }
        if (indexAfterMove < 0) {
            indexAfterMove = this.plants.length - 1
        }
        if ((indexAfterMove >= 0) && (indexAfterMove <= this.plants.length - 1)) {
            const newList: PdPlant[] = []
            newList.push(this.plants[indexAfterMove])
            const newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
            this.doCommand(newCommand)
        }
    }
    
    updateForChangeToPlantSelections(): void {
        // must be done BEFORE updating so it picks it up
        this.selectedPlantPartID = -1
        this.updateRightSidePanelForFirstSelectedPlant()
        this.updateMenusForChangedSelectedPlants()
        if (!this.internalChange) {
            // reset for posing because posing works only on focused plant
            // don't do if reading file in
            // if change selected plant, must redraw to remove red color
            this.redrawAllPlantsInViewWithAmendments()
        }
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
      
    invalidateSelectedPlantRectangles(): void {
        if (this.selectedPlants.length > 0) {
            for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                const plant = this.selectedPlants[i]
                if (plant !== null) {
                    this.invalidateDrawingRect(plant.boundsRect_pixels())
                }
            }
        }
    }
    
    updateForChangeToPlantList(): void {
        if ((domain === null) || (domain.plantManager === null)) {
            return
        }
        this.Caption = this.captionForFile()
        // selected plants list - make sure no pointers are invalid 
        const plantsToRemove: PdPlant[] = [] 
        if (this.selectedPlants.length > 0) {
            for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                const plant = this.selectedPlants[i]
                if (this.plants.indexOf(plant) < 0) {
                    plantsToRemove.push(plant)
                }
            }
        }
        if (plantsToRemove.length > 0) {
            for (let i = 0; i <= plantsToRemove.length - 1; i++) {
                const plant = plantsToRemove[i]
                this.selectedPlants = removeItem(this.selectedPlants, plant)
            }
        }
        if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
            this.showOnePlantExclusively(kDrawNow)
        }
        this.updateRightSidePanelForFirstSelectedPlant()
        this.updateForPossibleChangeToDrawing()
        this.updateMenusForChangedPlantList()
    }

    updateForPossibleChangeToDrawing(): void {
        this.updateMenusForUndoRedo()
        if ((this.invalidDrawingRect.Top !== 0) || (this.invalidDrawingRect.Left !== 0) || (this.invalidDrawingRect.Bottom !== 0) || (this.invalidDrawingRect.Right !== 0)) {
            this.paintDrawing(kDrawNow)
        }
    }
 
    recalculateAllPlantBoundsRects(drawNow: boolean): void {
        if (this.plants.length <= 0) {
            return
        }
        let plantPartsToDraw = 0
        let showProgress = drawNow && domain.options.cachePlantBitmaps && domain.options.showPlantDrawingProgress
        if (showProgress) {
            plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.plants, Rect(0, 0, this.drawingBitmap.width, this.drawingBitmap.height), kExcludeInvisiblePlants, kIncludeNonSelectedPlants)
        }
        let partsDrawn = 0
        try {
            cursor_startWait()
            this.drawing = true
            if (showProgress) {
                this.startDrawProgress(plantPartsToDraw)
            }
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                plant.plantPartsDrawnAtStart = partsDrawn
                plant.recalculateBounds(drawNow)
                partsDrawn = partsDrawn + plant.totalPlantParts
            }
        } finally {
            cursor_stopWait()
            this.drawing = false
            if (showProgress) {
                this.finishDrawProgress()
            }
        }
    }
    
    recalculateSelectedPlantsBoundsRects(drawNow: boolean): void {        
        if (this.selectedPlants.length <= 0) {
            return
        }
        let plantPartsToDraw = 0
        let showProgress = drawNow && domain.options.cachePlantBitmaps && domain.options.showPlantDrawingProgress
        if (showProgress) {
            plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.selectedPlants, Rect(0, 0, this.drawingBitmap.width, this.drawingBitmap.height), kExcludeInvisiblePlants, kIncludeNonSelectedPlants)
        }
        let partsDrawn = 0
        try {
            cursor_startWait()
            this.drawing = true
            if (showProgress) {
                this.startDrawProgress(plantPartsToDraw)
            }
            for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                const plant = this.selectedPlants[i]
                plant.plantPartsDrawnAtStart = partsDrawn
                plant.recalculateBounds(drawNow)
                partsDrawn = partsDrawn + plant.totalPlantParts
            }
        } finally {
            cursor_stopWait()
            this.drawing = false
            if (showProgress) {
                this.finishDrawProgress()
            }
        }
    }
    
    shrinkAllPlantBitmaps(): void {
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                this.plants[i].shrinkPreviewCache()
            }
        }
        this.updateForChangeToPlantBitmaps()
    }
    
    recalculateAllPlantBoundsRectsForOffsetChange(): void {
        for (let i = 0; i <= this.plants.length - 1; i++) {
            const plant = this.plants[i]
            plant.recalculateBoundsForOffsetChange()
        }
    }
    
    updateForRenamingPlant(aPlant: PdPlant): void {
        for (let i = 0; i <= kTabHighest; i++) {
            this.updatePlantNameLabel(i)
        }
    }
    
    updateForChangeToPlantNote(aPlant: PdPlant): void {
        // TODO PDF: Fix or remove obsolete code
        // let start: int = this.noteMemo.SelStart
        // this.noteMemo.Clear()
        // if (aPlant === null) {
        //     return
        // }
        // this.internalChange = true
        // if (this.focusedPlant() !== null) {
        //     this.noteMemo.Lines.AddStrings(aPlant.noteLines)
        // }
        // this.noteMemo.SelStart = start
        // this.internalChange = false
    }

    // menu updating 
    // ---------------------------------------------------------------------------- *menu updating 
    updateMenusForUndoRedo(): void {
        // TODO PDF: Fix this
        // this.UndoMenuEditUndoRedoList.enabled = (this.commandList.isUndoEnabled()) || (this.commandList.isRedoEnabled())
        // if (ubreedr.BreederForm !== null) {
        //     ubreedr.BreederForm.BreederMenuUndo.enabled = this.MenuEditUndo.enabled
        //     ubreedr.BreederForm.BreederMenuUndo.caption = this.MenuEditUndo.caption
        //     ubreedr.BreederForm.BreederMenuRedo.enabled = this.MenuEditRedo.enabled
        //     ubreedr.BreederForm.BreederMenuRedo.caption = this.MenuEditRedo.caption
        //     ubreedr.BreederForm.BreederMenuUndoRedoList.enabled = this.UndoMenuEditUndoRedoList.enabled
        // }
        // if (utimeser.TimeSeriesForm !== null) {
        //     utimeser.TimeSeriesForm.TimeSeriesMenuUndo.enabled = this.MenuEditUndo.enabled
        //     utimeser.TimeSeriesForm.TimeSeriesMenuUndo.caption = this.MenuEditUndo.caption
        //     utimeser.TimeSeriesForm.TimeSeriesMenuRedo.enabled = this.MenuEditRedo.enabled
        //     utimeser.TimeSeriesForm.TimeSeriesMenuRedo.caption = this.MenuEditRedo.caption
        //     utimeser.TimeSeriesForm.TimeSeriesMenuUndoRedoList.enabled = this.UndoMenuEditUndoRedoList.enabled
        // }
    }

    updateMenusForChangedPlantFile(): void {
        // TODO PDF: Fix this or remove  obsolete code
        // this.viewFreeFloating.Enabled = domain.plantFileLoaded
        // this.viewOneOnly.Enabled = domain.plantFileLoaded
        // this.drawingAreaOnTop.Enabled = domain.plantFileLoaded
        // this.drawingAreaOnSide.Enabled = domain.plantFileLoaded
        // this.updateMenusForChangedPlantList()
        // this.updatePasteMenuForClipboardContents()
    }
    
    updateMenusForChangedPlantList(): void {
        if (!this.havePlants) {
            this.dragCursorModeClick()
        }
        this.updateMenusForChangedSelectedPlants()
    }
    
    updateMenusForChangedSelectedPlants(): void {
        // TODO PDF: Fix this or remove  obsolete code
        // let haveSelectedPlants: boolean
        // let haveMoreThanOneSelectedPlant: boolean
        
        // haveSelectedPlants = (this.selectedPlants.length > 0)
        // haveMoreThanOneSelectedPlant = (this.selectedPlants.length > 1)
        // this.PopupMenuCut.enabled = haveSelectedPlants
        // this.PopupMenuCopy.enabled = haveSelectedPlants
        // this.PopupMenuRename.enabled = haveSelectedPlants
        // // v1.4
        // this.PopupMenuEditNote.enabled = haveSelectedPlants
        // // v1.4
        // this.noteEdit.Enabled = haveSelectedPlants
        // this.PopupMenuRandomize.enabled = haveSelectedPlants
        // this.PopupMenuZeroRotations.enabled = haveSelectedPlants
        // this.PopupMenuBreed.enabled = haveSelectedPlants
        // this.PopupMenuMakeTimeSeries.enabled = haveSelectedPlants
        // this.PopupMenuAnimate.enabled = haveSelectedPlants
        // // location
        // this.xLocationEdit.Enabled = haveSelectedPlants
        // this.xLocationSpin.Enabled = haveSelectedPlants
        // this.yLocationEdit.Enabled = haveSelectedPlants
        // this.yLocationSpin.Enabled = haveSelectedPlants
        // // rotation
        // this.xRotationEdit.Enabled = haveSelectedPlants
        // this.xRotationSpin.Enabled = haveSelectedPlants
        // this.yRotationEdit.Enabled = haveSelectedPlants
        // this.yRotationSpin.Enabled = haveSelectedPlants
        // this.zRotationEdit.Enabled = haveSelectedPlants
        // this.zRotationSpin.Enabled = haveSelectedPlants
        // this.resetRotations.Enabled = haveSelectedPlants
        // // drawing scale
        // this.drawingScaleEdit.Enabled = haveSelectedPlants
        // this.drawingScaleSpin.Enabled = haveSelectedPlants
    }
    
    updatePasteMenuForClipboardContents(): void {
        // TODO PDF: Fix this or remove  obsolete code
        // this.PopupMenuPaste.enabled = this.MenuEditPaste.enabled
        // if (ubreedr.BreederForm !== null) {
        //     ubreedr.BreederForm.updatePasteMenuForClipboardContents()
        // }
        // if (utimeser.TimeSeriesForm !== null) {
        //     utimeser.TimeSeriesForm.updatePasteMenuForClipboardContents()
        // }
    }
    
    updateSectionPopupMenuForSectionChange(): void {
        unfinished()
        // const haveSection = this.currentSection() !== null
        // this.sectionPopupMenuHelp.enabled = haveSection
    }
    
    updateParamPopupMenuForParamSelectionChange(): void {
        unfinished()
        // const haveSection = this.currentSection() !== null
        // this.paramPopupMenuExpandAllInSection.enabled = haveSection
        // this.paramPopupMenuCollapseAllInSection.enabled = haveSection
        // const haveParam = this.selectedParameterPanel !== null
        // this.paramPopupMenuHelp.enabled = haveParam
        // this.paramPopupMenuExpand.enabled = haveParam
        // this.paramPopupMenuCollapse.enabled = haveParam
    }

    // ---------------------------------------------------------------------------- *drawing 
    invalidateDrawingRect(aRect: TRect): void {
        const newRect = this.invalidDrawingRect
        UnionRect(newRect, newRect, aRect)
        this.invalidDrawingRect = newRect
    }
    
    invalidateEntireDrawing(): void {
        this.invalidDrawingRect = Rect(0, 0, this.drawingBitmap.width, this.drawingBitmap.height)
    }
    
    paintDrawing(immediate: boolean): void {
        let plantPartsToDraw = 0
        const showProgress = domain.options.showPlantDrawingProgress && (!domain.options.cachePlantBitmaps)
        if ((this.invalidDrawingRect.Top !== 0) || (this.invalidDrawingRect.Left !== 0) || (this.invalidDrawingRect.Bottom !== 0) || (this.invalidDrawingRect.Right !== 0)) {
            try {
                if (!this.mouseMoveActionInProgress) {
                    cursor_startWait()
                }
                // Clear the canvas section needing to be redrawn
                const context = this.drawingBitmap.getContext("2d")
                if (!context) return
                context.fillStyle = convertColor(domain.options.backgroundColor)
                context.fillRect(this.invalidDrawingRect.Left, this.invalidDrawingRect.Top, this.invalidDrawingRect.Right - this.invalidDrawingRect.Left, this.invalidDrawingRect.Bottom - this.invalidDrawingRect.Top)
                if (showProgress) {
                    plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.selectedPlants, this.invalidDrawingRect, kExcludeInvisiblePlants, kIncludeNonSelectedPlants)
                }
                try {
                    this.drawing = true
                    if (showProgress) {
                        this.startDrawProgress(plantPartsToDraw)
                    }
                    domain.plantManager.drawOnInvalidRect(this.drawingBitmap, this.selectedPlants, this.invalidDrawingRect, kExcludeInvisiblePlants, kIncludeNonSelectedPlants)
                } finally {
                    this.drawing = false
                    if (showProgress) {
                        this.finishDrawProgress()
                    }
                }
                if ((immediate)) {
                    this.copyDrawingBitmapToPaintBox()
                }
            } finally {
                if (!this.mouseMoveActionInProgress) {
                    cursor_stopWait()
                }
                this.invalidDrawingRect = Rect(0, 0, 0, 0)
            }
        }
    }
    
    drawingPaintBoxPaint(): void {
        this.copyDrawingBitmapToPaintBox()
    }
    
    copyDrawingBitmapToPaintBox(): void {
        // Copies the bitmaps with te planst and overlays selection rectangles and rubber banding
        if ((domain === null) || (this.plants === null)) {
            return
        }
        const context = this.drawingPaintBox.getContext("2d")
        if (!context) return
        this.drawingPaintBox.width = this.drawingPaintBox.width
        context.drawImage(this.drawingBitmap, 0, 0)
        
        const drawBoundingRects = (domain.options.showBoundsRectangle) && (!domain.viewPlantsInMainWindowOnePlantAtATime()) && (!domain.temporarilyHideSelectionRectangles)
        if ((drawBoundingRects) && (this.plants.length > 0)) {
            context.strokeStyle = convertColor(ColorDefs.clSilver)
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (!plant.hidden) {
                    context.strokeRect(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right - plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Bottom - plant.boundsRect_pixels().Top)
                }
            }
        }
        const intersection: TRect = new TRect()
        const aRect = Rect(0, 0, this.drawingBitmap.width, this.drawingBitmap.height)
        const drawSelectionRects = (domain.options.showSelectionRectangle) && (!domain.viewPlantsInMainWindowOnePlantAtATime()) && (!domain.temporarilyHideSelectionRectangles)
        if ((drawSelectionRects) && (this.plants.length > 0)) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                let includePlant = false
                const intersectResult = IntersectRect(intersection, plant.boundsRect_pixels(), aRect)
                includePlant = includePlant || intersectResult
                includePlant = includePlant && !plant.hidden
                if (!includePlant) {
                    continue
                }
                if (this.isFocused(plant)) {
                    context.strokeStyle = convertColor(domain.options.firstSelectionRectangleColor)
                    context.strokeRect(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right - plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Bottom - plant.boundsRect_pixels().Top)
                    if (this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag) {
                        context.strokeRect(plant.resizingRect().Left, plant.resizingRect().Top, plant.resizingRect().Right - plant.resizingRect().Left, plant.resizingRect().Bottom - plant.resizingRect().Top)
                    }
                } else if (this.isSelected(plant)) {
                    context.strokeStyle = convertColor(domain.options.multiSelectionRectangleColor)
                    context.strokeRect(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right - plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Bottom - plant.boundsRect_pixels().Top)
                }
            }
        }
        if (this.rubberBanding && !domain.temporarilyHideSelectionRectangles) {
            this.drawRubberBandBox()
        }
    }
    
    // plant bitmaps
    // ---------------------------------------------------------------------------- *bitmaps for plants 
    screenBytesPerPixel(): float {
        let result = 4
        return result
    }
    
    bytesInPlantBitmaps(plantToExclude: PdPlant | null): long {
        let result = 0
        const bytesPerPixel = this.screenBytesPerPixel()
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
                if (plant === plantToExclude) {
                    // plant that is asking should not be counted, since it is looking to resize and lose the old size
                    continue
                }
                const bytesInBitmap = intround(plant.previewCache.Width * plant.previewCache.Height * bytesPerPixel)
                result = result + bytesInBitmap
            }
        }
        return result
    }
    
    roomForPlantBitmap(plant: PdPlant, bytesForThisPlant: long): boolean {
        const bytesAlreadyNotIncludingThisPlant = this.bytesInPlantBitmaps(plant)
        const bytesLimit = domain.options.memoryLimitForPlantBitmaps_MB * 1024 * 1024
        const result = bytesAlreadyNotIncludingThisPlant + bytesForThisPlant < bytesLimit
        if (!result) {
            const megabytesTried = (bytesAlreadyNotIncludingThisPlant + bytesForThisPlant) / (1024 * 1024)
            ShowMessage("The total size of plant bitmaps (" + megabytesTried.toFixed(3) + "MB) has exceeded " + "the memory limit of " + IntToStr(domain.options.memoryLimitForPlantBitmaps_MB) + " megabytes." + chr(13) + "All plant bitmaps have been dropped and plants will be drawn directly on the window." + chr(13) + "To use plant bitmaps again, choose Use Plant Bitmaps from the Options menu." + chr(13) + chr(13) + "If you have more free memory, your memory limit is set too low." + chr(13) + "To increase the memory limit, choose Preferences from the Edit menu." + chr(13) + "Click Help in the Preferences window for details.")
            this.stopUsingPlantBitmaps()
        }
        return result
    }
    
    exceptionResizingPlantBitmap(): void {
        ShowMessage("An exception occurred while resizing a plant bitmap. " + chr(13) + "All plant bitmaps have been dropped and plants will be drawn directly on the window." + chr(13) + "To use plant bitmaps again, choose Use Plant Bitmaps from the Options menu." + chr(13) + chr(13) + "This exception means that your memory limit is set too high for the available memory." + chr(13) + "To decrease the memory limit, choose Preferences from the Edit menu." + chr(13) + "Click Help in the Preferences window for details.")
        this.stopUsingPlantBitmaps()
    }

    plantBitmapsIndicatorImage_Picture: string = "MainForm_plantBitmapsIndicatorImage.png"
    plantBitmapsIndicatorImage_Hint: string = ""
    
    updateForChangeToPlantBitmaps(): void {
        let aString: string
        if (domain.options.showLongHintsForButtons) {
            aString = "Plant bitmaps are used to speed up drawing by caching each plant into a separate " + "bitmap in memory. Plant bitmaps are turned "
        } else {
            aString = "Plant bitmaps are turned "
        }
        let bytesInUse = 0
        let megabytesInUse = 0
        if (domain.options.cachePlantBitmaps) {
            bytesInUse = this.bytesInPlantBitmaps(null)
            megabytesInUse = bytesInUse / (1024 * 1024)
            aString = aString + "ON and are using " + megabytesInUse.toFixed(3) + "MB out of " + IntToStr(domain.options.memoryLimitForPlantBitmaps_MB) + " MB of memory."
        } else {
            aString = aString + "OFF."
        }
        if (domain.options.showLongHintsForButtons) {
            if (!domain.options.cachePlantBitmaps) {
                aString = aString + " You can turn plant bitmaps on using the Options menu."
            } else {
                aString = aString + " You can change the amount of memory dedicated to plant bitmaps in the Preferences window."
            }
        }
        if (domain.options.cachePlantBitmaps) {
            if (megabytesInUse / domain.options.memoryLimitForPlantBitmaps_MB <= 0.5) {
                this.plantBitmapsIndicatorImage_Picture = "MainForm_plantBitmapsGreenImage.png"
            } else if (megabytesInUse / domain.options.memoryLimitForPlantBitmaps_MB <= 0.8) {
                this.plantBitmapsIndicatorImage_Picture = "MainForm_plantBitmapsYelloImage.png"
            } else {
                this.plantBitmapsIndicatorImage_Picture = "MainForm_plantBitmapsRedImage.png"
            }
        } else {
            this.plantBitmapsIndicatorImage_Picture = "MainForm_plantBitmapsIndicatorImage.png"
        }
        this.plantBitmapsIndicatorImage_Hint = aString
    }
    
    stopUsingPlantBitmaps(): void {
        domain.options.cachePlantBitmaps = false
        this.shrinkAllPlantBitmaps()
        this.invalidateEntireDrawing()
    }
    
    startUsingPlantBitmaps(): void {
        domain.options.cachePlantBitmaps = true
        this.recalculateAllPlantBoundsRects(kDrawNow)
        this.invalidateEntireDrawing()
    }

    // command list management 
    // ---------------------------------------------------------------------------- *command list management 
    clearCommandList(): void {
        this.commandList = new PdCommandList()
        this.updateMenusForUndoRedo()
    }
    
    doCommand(command: PdCommand): void {
        this.commandList.doCommand(command)
        this.updateForPossibleChangeToDrawing()
    }

    // called by commands 
    // ------------------------------------------------------------------------------- *called by commands 
    hideOrShowSomePlants(plantList: PdPlant[] | null, hideList: PdBooleanValue[] | null, hide: boolean, drawNow: boolean): void {
        if ((plantList === null) || (plantList.length <= 0)) {
            return
        }
        const redrawRect = new TRect(0, 0, 0, 0)
        for (let i = 0; i <= plantList.length - 1; i++) {
            const plant = plantList[i]
            if ((hideList !== null) && (hideList.length > 0)) {
                plant.hidden = hideList[i].saveBoolean
            } else {
                plant.hidden = hide
            }
            // magnification might have changed
            plant.recalculateBounds(kDrawNow)
            UnionRect(redrawRect, redrawRect, plant.boundsRect_pixels())
        }
        this.invalidateDrawingRect(redrawRect)
        if (drawNow) {
            this.updateForPossibleChangeToDrawing()
        }
    }
    
    fitVisiblePlantsInDrawingArea(drawNow: boolean, scaleAsWellAsMove: boolean, alwaysMove: boolean): void {
        if (this.plants.length <= 0) {
            return
        }
        for (let i = 0; i <= this.plants.length - 1; i++) {
            const plant = this.plants[i]
            if (!plant.hidden) {
                plant.recalculateBounds(kDontDrawYet)
            }
        }
        const upperLeft_mm = this.upperLeftMostPlantBoundsRectPoint_mm()
        const lowerRight_mm = this.lowerRightMostPlantBoundsRectPoint_mm()
        const size_mm = Point(lowerRight_mm.X - upperLeft_mm.X, lowerRight_mm.Y - upperLeft_mm.Y)
        let allPlantsAreOffscreen: boolean
        if (alwaysMove) {
            // move domain offset so all plants begin within drawing area
            allPlantsAreOffscreen = false
        } else {
            // determine if all plants are out of the drawing area and so must be moved
            const offScreenUpperLeft_mm: TPoint = new TPoint()
            const offScreenLowerRight_mm: TPoint = new TPoint()
            offScreenUpperLeft_mm.X = intround(kOffscreenMargin / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenUpperLeft_mm.Y = intround(kOffscreenMargin / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenLowerRight_mm.X = intround((this.drawingPaintBox.width - kOffscreenMargin) / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenLowerRight_mm.Y = intround((this.drawingPaintBox.height - kOffscreenMargin) / domain.plantManager.plantDrawScale_PixelsPerMm)
            allPlantsAreOffscreen = (lowerRight_mm.X <= offScreenUpperLeft_mm.X) || (lowerRight_mm.Y <= offScreenUpperLeft_mm.Y) || (upperLeft_mm.X >= offScreenLowerRight_mm.X) || (upperLeft_mm.Y >= offScreenLowerRight_mm.Y)
        }
        let newScale_pixelsPerMm: float
        if (scaleAsWellAsMove) {
            const xScale_pixelsPerMm = safedivExcept(1.0 * this.drawingPaintBox.width - 1.0 * kScaleToFitMargin * 2, size_mm.X, 0)
            const yScale_pixelsPerMm = safedivExcept(1.0 * this.drawingPaintBox.height - 1.0 * kScaleToFitMargin * 2, size_mm.Y, 0)
            newScale_pixelsPerMm = Math.min(xScale_pixelsPerMm, yScale_pixelsPerMm)
        } else {
            newScale_pixelsPerMm = 0
        }
        if (alwaysMove || allPlantsAreOffscreen) {
            const marginOffset_mm = safedivExcept(1.0 * kScaleToFitMargin, newScale_pixelsPerMm, 0)
            domain.plantManager.plantDrawOffset_mm = setSinglePoint(-upperLeft_mm.X + marginOffset_mm, -upperLeft_mm.Y + marginOffset_mm)
        }
        if ((scaleAsWellAsMove) && (newScale_pixelsPerMm !== 0.0)) {
            // calculate new scale to fit all plants in drawing area and apply
            this.magnifyOrReduce(newScale_pixelsPerMm, Point(0, 0), drawNow)
        }
    }
    
    // ------------------------------------------------------------------------------- *selected plants list 
    selectPlantAtPoint(aPoint: TPoint, shift: boolean): void {
        let newList: PdPlant[] = []
        const plant = domain.plantManager.findPlantAtPoint(aPoint)
        if (!plant) return
        if ((shift) && (this.selectedPlants.length > 0)) {
            for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                newList.push(this.selectedPlants[i])
            }
        }
        if (newList.indexOf(plant) >= 0) {
            newList = removeItem(newList, plant)
        } else if (plant !== null) {
            newList.push(plant)
        }
        if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
            const newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
            this.doCommand(newCommand)
        }
    }
    
    selectPlantAtIndex(event: MouseEvent, index: int): void {
        if (this.plants.length <= 0) {
            return
        }
        let newList: PdPlant[] = []
        if ((index < 0)) {
            if (this.selectedPlants.length <= 0) {
                return
            }
            const newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
            this.doCommand(newCommand)
            return
        }
        const plant = this.plants[index]
        if (plant === null) {
            return
        }
        if ((event.ctrlKey)) {
            if (this.selectedPlants.length > 0) {
                for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                    newList.push(this.selectedPlants[i])
                }
            }
            if (newList.indexOf(plant) >= 0) {
                newList = removeItem(newList, plant)
            } else {
                newList.push(plant)
            }
        } else if ((event.shiftKey)) {
            if (this.selectedPlants.length > 0) {
                for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                    newList.push(this.selectedPlants[i])
                }
            }
            if ((this.lastSingleClickPlantIndex >= 0) && (this.lastSingleClickPlantIndex <= this.plants.length - 1) && (this.lastSingleClickPlantIndex !== index)) {
                if (this.lastSingleClickPlantIndex < index) {
                    for (let i = this.lastSingleClickPlantIndex; i <= index; i++) {
                        if (newList.indexOf(this.plants[i]) < 0) {
                            newList.push(this.plants[i])
                        }
                    }
                } else if (this.lastSingleClickPlantIndex > index) {
                    for (let i = this.lastSingleClickPlantIndex; i >= index; i--) {
                        if (newList.indexOf(this.plants[i]) < 0) {
                            newList.push(this.plants[i])
                        }
                    }
                }
            }
        } else {
            if (this.isSelected(plant)) {
                if (this.selectedPlants.length > 0) {
                    for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
                        newList.push(this.selectedPlants[i])
                    }
                }
            } else {
                newList.push(plant)
                this.lastSingleClickPlantIndex = index
            }
        }
        if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
            const newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
            this.doCommand(newCommand)
        }
    }
    
    twoListsAreIdentical(firstList: PdPlant[], secondList: PdPlant[]): boolean {
        let result = false
        if ((firstList === null) || (secondList === null)) {
            return result
        }
        if (firstList.length !== secondList.length) {
            return result
        }
        if (firstList.length <= 0) {
            return result
        }
        for (let i = 0; i <= firstList.length - 1; i++) {
            if (firstList[i] !== secondList[i]) {
                return result
            }
        }
        result = true
        return result
    }
    
    deselectAllPlants(): void {
        this.selectedPlants= []
        this.updateForChangeToPlantSelections()
    }
    
    deselectAllPlantsButFirst(): void {
        const firstPlant = this.focusedPlant()
        if (!firstPlant) {
            return
        }
        this.selectedPlants= []
        this.selectedPlants.push(firstPlant)
        this.updateForChangeToPlantSelections()
    }
    
    selectFirstPlantInPlantList(): void {
        if (this.plants.length <= 0) {
            return
        }
        this.selectedPlants= []
        this.selectedPlants.push(this.plants[0])
        this.updateForChangeToPlantSelections()
    }
    
    showOnePlantExclusively(drawNow: boolean): void {
        const firstPlant = this.focusedPlant()
        try {
            cursor_startWait()
            const booleansList: PdBooleanValue[] = []
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant !== null) {
                    booleansList.push(new PdBooleanValue(!(plant === firstPlant)))
                }
            }
            this.hideOrShowSomePlants(this.plants, booleansList, false, kDontDrawYet)
            this.fitVisiblePlantsInDrawingArea(kDontDrawYet, kScaleAndMove, kAlwaysMove)
            if (firstPlant !== null) {
                // must draw now because bitmap could be wrong
                firstPlant.recalculateBounds(kDrawNow)
                this.invalidateDrawingRect(firstPlant.boundsRect_pixels())
            }
            if (drawNow) {
                this.updateForPossibleChangeToDrawing()
            }
        } finally {
            cursor_stopWait()
        }
    }
    
    redrawFocusedPlantOnly(drawNow: boolean): void {
        const firstPlant = this.focusedPlant()
        if (firstPlant !== null) {
            firstPlant.recalculateBounds(kDrawNow)
            this.invalidateDrawingRect(firstPlant.boundsRect_pixels())
        }
        if (drawNow) {
            this.updateForPossibleChangeToDrawing()
        }
    }
    
    addSelectedPlant(aPlant: PdPlant, insertIndex: short): void {
        if ((insertIndex >= 0) && (insertIndex <= this.selectedPlants.length - 1)) {
            arrayInsert(this.selectedPlants, insertIndex, aPlant)
        } else {
            this.selectedPlants.push(aPlant)
        }
        this.invalidateDrawingRect(aPlant.boundsRect_pixels())
    }
    
    removeSelectedPlant(aPlant: PdPlant): void {
        this.invalidateDrawingRect(aPlant.boundsRect_pixels())
        this.selectedPlants = removeItem(this.selectedPlants, aPlant)
    }
    
    isSelected(plant: PdPlant): boolean {
        let result = false
        if ((this.selectedPlants === null) || (this.selectedPlants.length <= 0)) {
            return result
        }
        result = this.selectedPlants.indexOf(plant) >= 0
        return result
    }
    
    isFocused(plant: PdPlant | null): boolean {
        let result = false
        if (plant === null) {
            return result
        }
        if ((this.selectedPlants === null) || (this.selectedPlants.length <= 0)) {
            return result
        }
        result = this.selectedPlants.indexOf(plant) === 0
        return result
    }

    // selected plants list 
    focusedPlant(): PdPlant | null {
        let result: PdPlant | null = null
        if (this.selectedPlants.length > 0) {
            result = this.selectedPlants[0]
        }
        return result
    }
    
    focusedPlantIndex(): short {
        let result = -1
        if (this.selectedPlants.length > 0) {
            result = this.plants.indexOf(this.selectedPlants[0])
        }
        return result
    }
    
    firstUnfocusedPlant(): PdPlant | null {
        let result: PdPlant | null = null
        if (this.selectedPlants.length > 1) {
            result = this.selectedPlants[1]
        }
        return result
    }
    
    firstSelectedPlantInList(): PdPlant | null {
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (this.isSelected(plant)) {
                    return plant
                }
            }
        }
        return null
    }
    
    lastSelectedPlantInList(): PdPlant | null{
        if (this.plants.length > 0) {
            for (let i = this.plants.length - 1; i >= 0; i--) {
                const plant = this.plants[i]
                if (this.isSelected(plant)) {
                    return plant
                }
            }
        }
        return null
    }

    plantListDrawGridMouseDown(event: MouseEvent, index: number, inHideShowIcon: boolean): void {
        if (!this.havePlants()) {
            return
        }
        if (event.button !== MouseButton.mbLeft) {
            return
        }
        // TODO PDF: Fix or remove obsolete code
        // if (this.justDoubleClickedOnDrawGrid) {
        //     this.justDoubleClickedOnDrawGrid = false
        //     return
        // } else {
        //     this.justDoubleClickedOnDrawGrid = false
        // }
        const hideList: PdPlant[] = []
        // does updating in command
        this.selectPlantAtIndex(event, index)
        if (inHideShowIcon) {
            const plant = this.plants[index]
            if (plant === null) {
                return
            }
            hideList.push(plant)
            const newCommand = new PdHideOrShowCommand(hideList, !plant.hidden)
            this.doCommand(newCommand)
        } else {
            // TOD PDF: Fix or remove: this.plantListDrawGrid.BeginDrag(false)
        }
    }

    /*
    
    plantListDrawGridMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let popupPositionInScreenCoords: TPoint
        
        if (Button === delphi_compatability.TMouseButton.mbRight) {
            popupPositionInScreenCoords = this.plantListDrawGrid.ClientToScreen(Point(X, Y))
            this.PlantPopupMenu.popup(popupPositionInScreenCoords.X, popupPositionInScreenCoords.Y)
        }
    }
    
    plantListDrawGridDragOver(Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null) && ((ubreedr.BreederForm !== null) && (Source === ubreedr.BreederForm.plantsDrawGrid) || (utimeser.TimeSeriesForm !== null) && (Source === utimeser.TimeSeriesForm.grid))
        return Accept
    }
    
    plantListDrawGridEndDrag(Target: TObject, X: int, Y: int): void {
        if ((Target !== null) && (Target instanceof delphi_compatability.TDrawGrid)) {
            if (this.focusedPlant() !== null) {
                if (((Target).owner instanceof ubreedr.TBreederForm)) {
                    ubreedr.BreederForm.copyPlantToPoint(this.focusedPlant(), X, Y)
                } else if (((Target).owner instanceof utimeser.TTimeSeriesForm)) {
                    utimeser.TimeSeriesForm.copyPlantToPoint(this.focusedPlant(), X, Y)
                }
            }
        }
    }
    
    plantListDrawGridDblClick(): void {
        this.MenuPlantRenameClick()
        this.plantListDrawGrid.endDrag(false)
        this.justDoubleClickedOnDrawGrid = true
    }
    
    */

    // list box 
    moveSelectedPlantsUp(): void {
        if (this.plants.length > 1) {
            // start at 1 because you can't move first one up any more 
            let i = 1
            while (i <= this.plants.length - 1) {
                const plant = this.plants[i]
                if (this.isSelected(plant)) {
                    arraySwap(this.plants, i, i - 1)
                }
                i += 1
            }
        }
        this.invalidateSelectedPlantRectangles()
        this.updateForPossibleChangeToDrawing()
    }
    
    moveSelectedPlantsDown(): void {
        if (this.plants.length > 1) {
            // start at next to last one because you can't move last one down any more 
            let i = this.plants.length - 2
            while (i >= 0) {
                const plant = this.plants[i]
                if (this.isSelected(plant)) {
                    arraySwap(this.plants, i, i + 1)
                }
                i -= 1
            }
        }
        this.invalidateSelectedPlantRectangles()
        this.updateForPossibleChangeToDrawing()
    }

    /*
    
    plantListDrawGridKeyDown(Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DOWN:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutSendBackClick()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() + 1)
                }
                break
            case delphi_compatability.VK_RIGHT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutSendBackClick()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() + 1)
                }
                break
            case delphi_compatability.VK_UP:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutBringForwardClick()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() - 1)
                }
                break
            case delphi_compatability.VK_LEFT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutBringForwardClick()
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() - 1)
                }
                break
            case delphi_compatability.VK_RETURN:
                Key = 0
                this.MenuPlantRenameClick()
                break
        }
        return Key
    }
    
    */
    
    // mouse handling in drawing 
    // -------------------------------------------------------------------------- *mouse handling in drawing 
    PaintBoxMouseDown(event: MouseEvent): void {
        const X = event.offsetX
        const Y = event.offsetY
        const isShift = event.shiftKey
        const isCtrl = event.ctrlKey
        if (this.animateCommand) { 
            this.stopAnimation()
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        if (this.actionInProgress) {
            try {
                // error somewhere - user did weird things with mouse buttons - teminate action...
                this.PaintBoxMouseUp(event)
            } finally {
                this.actionInProgress = false
            }
        }
        let plantClickedOn: PdPlant | null
        switch (this.cursorModeForDrawing) {
            case CursorMode.kCursorModeSelectDrag:
                if (event.button === MouseButton.mbRight) {
                    return
                }
                plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
                if (plantClickedOn === null) {
                    if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                        return
                    }
                    this.rubberBanding = true
                    this.rubberBandStartDragPoint = Point(X, Y)
                    this.rubberBandLastDrawPoint = Point(X, Y)
                    // select command made in mouse up
                    return
                } else {
                    this.actionInProgress = true
                    if ((!plantClickedOn.pointIsInResizingRect(Point(X, Y))) && ((!this.isSelected(plantClickedOn)) || isShift)) {
                        this.selectPlantAtPoint(Point(X, Y), isShift && !isCtrl)
                        this.updateForPossibleChangeToDrawing()
                    }
                }
                break
            case CursorMode.kCursorModeScroll:
                break
            case CursorMode.kCursorModeMagnify:
                this.rubberBanding = true
                this.rubberBandStartDragPoint = Point(X, Y)
                this.rubberBandLastDrawPoint = Point(X, Y)
                break
            case CursorMode.kCursorModeRotate:
                break
            case CursorMode.kCursorModePosingSelect:
                if (domain.options.drawSpeed !== DrawMode.kDrawBest) {
                    if (MessageDialog("To pose a plant, you need the \"Draw Using\" option set to \"Solids.\"" + chr(13) + chr(13) + "Do you want to change it?", mtConfirmation, mbYesNo, 0) === IDYES) {
                        this.MenuOptionsBestDrawClick()
                    }
                    return
                }
                if (this.tabSet.tabIndex !== kTabPosing) {
                    this.tabSet.tabIndex = kTabPosing
                }
                plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
                if (plantClickedOn && this.isFocused(plantClickedOn)) {
                    [this.mouseDownSelectedPlantPartID, this.mouseDownSelectedPlantPartType] = plantClickedOn.getInfoForPlantPartAtPoint(Point(X, Y))
                } else {
                    this.mouseDownSelectedPlantPartID = -1
                }
                if (this.mouseDownSelectedPlantPartID === this.selectedPlantPartID) {
                    return
                }
                break
        }
        const anchorPoint = Point(X, Y)
        // makes shift-click work as right-click
        this.commandList.rightButtonDown = (event.button === MouseButton.mbRight) || isShift
        const newCommand = this.makeMouseCommand(anchorPoint, {isShift, isCtrl})
        if (newCommand !== null) {
            this.actionInProgress = this.commandList.mouseDown(newCommand, anchorPoint)
        } else {
            this.actionInProgress = false
        }
        if (this.actionInProgress) {
            this.updateForPossibleChangeToDrawing()
        }
    }
    
    PaintBoxMouseMove(event: MouseEvent): void {
        const X = event.offsetX
        const Y = event.offsetY
        if (this.plants.length <= 0) {
            (event as any).redraw = false
            return
        }
        let cursorChanged = false
        if (this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag) {
            // show cursor that tells you that you can resize plant when mouse is in resize rect, but only in select mode
            const plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
            if ((domain.options.showSelectionRectangle) && (plantClickedOn !== null) && (plantClickedOn === this.focusedPlant()) && (plantClickedOn.pointIsInResizingRect(Point(X, Y)))) {
                cursorChanged = cursor_change(Cursor.crSizeNS)
            } else {
                cursorChanged = cursor_change(Cursor.crDefault)
            }
        }
        if (!this.actionInProgress) {
            // show hint for plant mouse is over
            let shouldCancelHint = false
            if (this.hintActive && ((X < this.hintX - kHintRange) || (X > this.hintX + kHintRange) || (Y < this.hintY - kHintRange) || (Y > this.hintY + kHintRange))) {
                if (this.hintForPlantAtPoint(Point(X, Y)) !== this.lastHintString) {
                    shouldCancelHint = true
                }
                if (this.actionInProgress) {
                    shouldCancelHint = true
                }
                if (((X < this.hintX - kMaxHintRangeForLargeAreas) || (X > this.hintX + kMaxHintRangeForLargeAreas) || (Y < this.hintY - kMaxHintRangeForLargeAreas) || (Y > this.hintY + kMaxHintRangeForLargeAreas))) {
                    shouldCancelHint = true
                }
                if (shouldCancelHint) {
                    this.hintActive = false
                }
            }
        }
        if (this.rubberBanding) {
            // continue rubber banding - could be done in either select or magnify mode
            this.rubberBandLastDrawPoint = Point(X, Y)
            return
        }
        if (this.actionInProgress) {
            // continue action started in mouse down
            this.commandList.mouseMove(Point(X, Y))
            if (this.commandList.didMouseMove(Point(X, Y))) {
                this.mouseMoveActionInProgress = true
            }
            this.updateForPossibleChangeToDrawing()
        }
        if (!this.rubberBanding && !this.actionInProgress && !cursorChanged) {
           (event as any).redraw = false
        }
    }
    
    PaintBoxMouseUp(event: MouseEvent): void {
        const X = event.offsetX
        const Y = event.offsetY
        if (this.plants.length <= 0) {
            return
        }
        if ((event.button === MouseButton.mbRight) && (this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag)) {
            // show popup menu but only if in select/drag mode
            unfinished()
            // const popupPositionInScreenCoords: TPoint = this.ClientToScreen(Point(X, Y))
            // this.PlantPopupMenu.popup(popupPositionInScreenCoords.X, popupPositionInScreenCoords.Y)
            return
        }
        if (this.rubberBanding) {
            // finish rubber banding if doing that, could be in select or magnify mode
            this.rubberBanding = false
            if (this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag) {
                this.selectPlantsInRubberBandBox()
                return
            }
        }
        try {
            if (this.actionInProgress) {
                // finish action in progress
                this.commandList.mouseUp(Point(X, Y))
                this.actionInProgress = false
            }
            this.mouseMoveActionInProgress = false
            this.updateForPossibleChangeToDrawing()
        } finally {
            // clear out all mouse settings
            cursor_change(Cursor.crDefault)
            this.mouseMoveActionInProgress = false
            this.commandList.rightButtonDown = false
            this.actionInProgress = false
        }
    }
    
    /*

    PaintBoxDragOver(Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null) && ((ubreedr.BreederForm !== null) && (Source === ubreedr.BreederForm.plantsDrawGrid) || (utimeser.TimeSeriesForm !== null) && (Source === utimeser.TimeSeriesForm.grid))
        return Accept
    }
    
    PaintBoxEndDrag(Target: TObject, X: int, Y: int): void {
        if ((Target !== null) && (Target instanceof delphi_compatability.TDrawGrid)) {
            const plantClickedOn = domain.plantManager.findPlantAtPoint(this.commandList.anchorPoint)
            if (plantClickedOn !== null) {
                if (((Target).owner instanceof ubreedr.TBreederForm)) {
                    ubreedr.BreederForm.copyPlantToPoint(plantClickedOn, X, Y)
                } else if (((Target).owner instanceof utimeser.TTimeSeriesForm)) {
                    utimeser.TimeSeriesForm.copyPlantToPoint(plantClickedOn, X, Y)
                }
            }
            // command undoes itself when it starts the drag 
        }
    }
    
    */

    makeMouseCommand(point: TPoint, shift: TShiftState): PdCommand | null {
        let result: PdCommand | null
        const focusedPlant = this.focusedPlant()
        switch (this.cursorModeForDrawing) {
            case CursorMode.kCursorModeSelectDrag:
                if (shift.isShift && shift.isCtrl) {
                    result = null
                    this.commandList.anchorPoint = point
                    // TODO PDF: Fix this: this.drawingPaintBox.BeginDrag(true)
                    unfinished()
                } else if (shift.isCtrl) {
                    result = new PdDuplicateCommand(this.selectedPlants)
                } else if (focusedPlant !== null && focusedPlant.pointIsInResizingRect(point)) {
                    cursor_change(Cursor.crSizeNS)
                    result = new PdResizePlantsCommand(this.selectedPlants)
                } else {
                    result = new PdDragCommand(this.selectedPlants)
                }
                break
            case CursorMode.kCursorModeScroll:
                result = new PdScrollCommand()
                break
            case CursorMode.kCursorModeMagnify:
                if ((this.commandList.rightButtonDown)) {
                    // to zoom out, can do right button or shift
                    cursor_change(Cursor.crMagMinus)
                    // TODO PDF: verify OK to use 0 here
                    const newCommand = new PdChangeMagnificationCommand(0, Point(0,0))
                    newCommand.shift = shift.isShift
                    result = newCommand
                } else {
                    // TODO PDF: verify OK to use 0 here
                    const newCommand = new PdChangeMagnificationCommand(0, Point(0,0))
                    newCommand.shift = shift.isShift
                    result = newCommand
                }
                break
            case CursorMode.kCursorModeRotate:
                if (this.commandList.rightButtonDown) {
                    cursor_change(Cursor.crSizeWE)
                }
                result = new PdRotateCommand(this.selectedPlants, 0, 0)
                break
            case CursorMode.kCursorModePosingSelect:
                if (focusedPlant !== null) {
                    result = new PdSelectPosingPartCommand(focusedPlant, this.mouseDownSelectedPlantPartID, this.selectedPlantPartID, this.mouseDownSelectedPlantPartType, this.selectedPlantPartType)
                } else {
                    throw new Error("unexpected no focused plant")
                }
                break
            default: throw new Error("unexpected cursorModeForDrawing: " + this.cursorModeForDrawing)
        }
        return result
    }

    // rubber banding 
    // ----------------------------------------------------------------------- *rubber banding 
    selectPlantsInRubberBandBox(): void {
        const newList: PdPlant[] = []
        
        const x1 = intMin(this.rubberBandStartDragPoint.X, this.rubberBandLastDrawPoint.X)
        const y1 = intMin(this.rubberBandStartDragPoint.Y, this.rubberBandLastDrawPoint.Y)
        const x2 = intMax(this.rubberBandStartDragPoint.X, this.rubberBandLastDrawPoint.X)
        const y2 = intMax(this.rubberBandStartDragPoint.Y, this.rubberBandLastDrawPoint.Y)
        const rubberBandRect = new TRect(x1, y1, x2, y2)
        
        domain.plantManager.fillListWithPlantsInRectangle(rubberBandRect, newList)
        if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
            const newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
            this.doCommand(newCommand)
        }
    }
    
    drawRubberBandBox(): void {
        const context = this.drawingPaintBox.getContext("2d")
        if (!context) return
        context.setLineDash([10, 5])
        context.strokeStyle = convertColor(ColorDefs.clBlack)
        context.strokeRect(this.rubberBandStartDragPoint.X, this.rubberBandStartDragPoint.Y, this.rubberBandLastDrawPoint.X - this.rubberBandStartDragPoint.X, this.rubberBandLastDrawPoint.Y - this.rubberBandStartDragPoint.Y)
        context.setLineDash([])
    }

    /*
    
    // hint handling 
    // ------------------------------------------------------------------------------------ *hint handling 
    DoShowHint(HintStr: ansistring, CanShow: boolean, HintInfo: THintInfo) {
        HintInfo.HintPos = HintInfo.HintControl.ClientToScreen(Point(HintInfo.CursorPos.X + 20, HintInfo.CursorPos.Y + 20))
        HintInfo.HintMaxWidth = 200
        if (HintInfo.HintControl === this.drawingPaintBox) {
            if (!this.actionInProgress) {
                HintStr = this.hintForPlantAtPoint(HintInfo.CursorPos)
                this.lastHintString = HintStr
                this.hintActive = true
                this.hintX = HintInfo.CursorPos.X
                this.hintY = HintInfo.CursorPos.Y
            }
        } else {
            if ((domain !== null) && (domain.hintManager !== null)) {
                HintStr = domain.hintManager.hintForComponentName(HintInfo, domain.options.showLongHintsForButtons, domain.options.showHintsForParameters)
            }
            if ((HintStr === "") && (HintInfo.HintControl.ShowHint)) {
                HintStr = HintInfo.HintControl.Hint
            }
        }
        return { CanShow, HintStr }
    }
    
    */

    hintForPlantAtPoint(aPoint: TPoint): string {
        let result = ""
        const plant = domain.plantManager.findPlantAtPoint(aPoint)
        if (plant !== null) {
            // v1.60 final
            result = plant.getHint(aPoint)
        }
        if ((this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag) && (domain.options.showLongHintsForButtons) && (domain.options.showSelectionRectangle) && (plant !== null) && (plant === this.focusedPlant()) && (plant.pointIsInResizingRect(aPoint))) {
            // extra hint if over resizing rect on focused plant in select/drag mode
            result = result + ": Click here and drag up or down to resize all selected plants."
        }
        return result
    }
    
    /*

    // -------------------------------------------------------------------------------- *popup menu commands 
    PopupMenuCutClick(): void {
        this.MenuEditCutClick()
    }
    
    PopupMenuCopyClick(): void {
        this.MenuEditCopyClick()
    }
    
    PopupMenuPasteClick(): void {
        this.MenuEditPasteClick()
    }
    
    PopupMenuRenameClick(): void {
        this.MenuPlantRenameClick()
    }
    
    PopupMenuRandomizeClick(): void {
        this.MenuPlantRandomizeClick()
    }
    
    PopupMenuHideAllOthersClick(): void {
        this.MenuLayoutHideOthersClick()
    }
    
    PopupMenuBreedClick(): void {
        this.MenuPlantBreedClick()
    }
    
    PopupMenuHideClick(): void {
        this.MenuLayoutHideClick()
    }
    
    PopupMenuShowClick(): void {
        this.MenuLayoutShowClick()
    }
    
    PopupMenuMakeTimeSeriesClick(): void {
        this.MenuPlantMakeTimeSeriesClick()
    }
    
    PopupMenuZeroRotationsClick(): void {
        this.MenuPlantZeroRotationsClick()
    }
    
    PopupMenuAnimateClick(): void {
        this.MenuPlantAnimateClick()
    }
    
    paramPopupMenuExpandAllInSectionClick(): void {
        if (this.currentSection() !== null) {
            this.collapseOrExpandAllParameterPanelsInCurrentSection(kExpand)
        }
    }
    
    paramPopupMenuCollapseAllInSectionClick(): void {
        if (this.currentSection() !== null) {
            this.collapseOrExpandAllParameterPanelsInCurrentSection(kCollapse)
        }
    }
    
    sectionPopupMenuHelpClick(): void {
        const section = this.currentSection()
        if (section === null) {
            return
        }
        const helpID = this.sectionHelpIDForSectionName(section.getName())
        if (helpID !== "") {
            delphi_compatability.Application.HelpJump(helpID)
        }
    }
    
    // new v1.4
    paramPopupMenuCopyNameClick(): void {
        if (this.selectedParameterPanel === null) {
            return
        }
        let textToCopy: string
        if (this.currentSection() !== null) {
            textToCopy = this.currentSection().getName() + ": "
        } else {
            textToCopy = ""
        }
        textToCopy = textToCopy + this.selectedParameterPanel.Caption
        if (usupport.found("[", textToCopy)) {
            // v2.1 deal with orthogonal sections
            let newText = stringUpTo(stringBeyond(textToCopy, "["), "]")
            newText = newText + ": " + trim(stringUpTo(stringBeyond(textToCopy, ":"), "["))
            textToCopy = newText
        }
        ColorDefs.clipboard.asText = textToCopy
    }
    
    paramPopupMenuHelpClick(): void {
        let helpID: string
        
        helpID = this.paramHelpIDForParamPanel(this.selectedParameterPanel)
        if (helpID !== "") {
            delphi_compatability.Application.HelpJump(helpID)
        }
    }
    
    paramPopupMenuExpandClick(): void {
        if (this.selectedParameterPanel !== null) {
            this.selectedParameterPanel.expand()
            this.repositionParameterPanels()
        }
    }
    
    paramPopupMenuCollapseClick(): void {
        if (this.selectedParameterPanel !== null) {
            this.selectedParameterPanel.collapse()
            this.repositionParameterPanels()
        }
    }

    */
    
    // ------------------------------------------------------------------------------------ *toolbar 
    dragCursorModeClick(): void {
        this.cursorModeForDrawing = CursorMode.kCursorModeSelectDrag
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    magnifyCursorModeClick(): void {
        this.cursorModeForDrawing = CursorMode.kCursorModeMagnify
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    posingSelectionCursorModeClick(): void {
        this.tabSet.tabIndex = kTabPosing
        this.cursorModeForDrawing = CursorMode.kCursorModePosingSelect
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    scrollCursorModeClick(): void {
        this.cursorModeForDrawing = CursorMode.kCursorModeScroll
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    rotateCursorModeClick(): void {
        this.cursorModeForDrawing = CursorMode.kCursorModeRotate
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    centerDrawingClick(): void {
        const newCommand = new PdCenterDrawingCommand()
        this.doCommand(newCommand)
    }
    
    magnificationPercentClick(): void {
        const newScale = this.magnifyScaleForText(this.magnificationPercent.Text)
        if ((newScale !== domain.plantDrawScale_PixelsPerMm())) {
            this.changeMagnificationWithoutClick()
        }
    }
    
    magnificationPercentExit(): void {
        const newScale = this.magnifyScaleForText(this.magnificationPercent.Text)
        if ((newScale !== domain.plantDrawScale_PixelsPerMm())) {
            this.changeMagnificationWithoutClick()
        }
    }
    
    magnifyPlusClick(): void {
        const newCommand = new PdChangeMagnificationCommand(domain.plantDrawScale_PixelsPerMm() * 1.5, Point(this.drawingPaintBox.width / 2, this.drawingPaintBox.height / 2))
        this.doCommand(newCommand)
    }
    
    magnifyMinusClick(): void {
        const newCommand = new PdChangeMagnificationCommand(domain.plantDrawScale_PixelsPerMm() * 0.75, Point(this.drawingPaintBox.width / 2, this.drawingPaintBox.height / 2))
        this.doCommand(newCommand)
    }
    
    // popup menu commands 
    // toolbar 
    changeMagnificationWithoutClick(): void {
        const newCommand = new PdChangeMagnificationCommand(this.magnifyScaleForText(this.magnificationPercent.Text), Point(this.drawingPaintBox.width / 2, this.drawingPaintBox.height / 2))
        this.doCommand(newCommand)
    }
    
    magnifyScaleForText(aText: string): float {
        let result = 1.0
        try {
            const oldIntResult = intround(domain.plantDrawScale_PixelsPerMm() * 100.0)
            let intResult: int = StrToIntDef(stringUpTo(aText, "%"), -1)
            if ((intResult <= 0)) {
                intResult = oldIntResult
                this.magnificationPercent.Text = IntToStr(intResult) + "%"
            }
            if (intResult > kMaxMagnificationToTypeIn) {
                intResult = kMaxMagnificationToTypeIn
                this.magnificationPercent.Text = IntToStr(intResult) + "%"
            }
            result = intResult / 100.0
        } catch (e) {
            result = 1.0
        }
        return result
    }
    
    magnifyOrReduce(newScale_PixelsPerMm: float, point_pixels: TPoint, drawNow: boolean) {
        this.recalculateAllPlantBoundsRects(kDontDrawYet)
        const oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
        const oldOffset_mm = domain.plantDrawOffset_mm()
        const pointInOldScale_mm = setSinglePoint(intround(point_pixels.X / oldScale_PixelsPerMm), intround(point_pixels.Y / oldScale_PixelsPerMm))
        const pointInNewScale_mm = setSinglePoint(intround(point_pixels.X / newScale_PixelsPerMm), intround(point_pixels.Y / newScale_PixelsPerMm))
        const newOffset_mm = setSinglePoint(oldOffset_mm.x + pointInNewScale_mm.x - pointInOldScale_mm.x, oldOffset_mm.y + pointInNewScale_mm.y - pointInOldScale_mm.y)
        domain.plantManager.plantDrawScale_PixelsPerMm = intround(newScale_PixelsPerMm * 100.0) / 100.0
        domain.plantManager.plantDrawOffset_mm = newOffset_mm
        if (drawNow) {
            this.redrawEverything()
        }
        this.magnificationPercent.Text = IntToStr(intround(domain.plantDrawScale_PixelsPerMm() * 100.0)) + "%"
    }
    
    upperLeftMostPlantBoundsRectPoint_mm(): TPoint {
        let result = Point(0, 0)
        let initialized = false
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
                const topLeft_mm = new TPoint()
                topLeft_mm.X = intround(plant.boundsRect_pixels().Left / domain.plantDrawScale_PixelsPerMm() - domain.plantDrawOffset_mm().x)
                topLeft_mm.Y = intround(plant.boundsRect_pixels().Top / domain.plantDrawScale_PixelsPerMm() - domain.plantDrawOffset_mm().y)
                if (!initialized) {
                    result = topLeft_mm
                    initialized = true
                } else {
                    if ((topLeft_mm.X < result.X)) {
                        result.X = topLeft_mm.X
                    }
                    if ((topLeft_mm.Y < result.Y)) {
                        result.Y = topLeft_mm.Y
                    }
                }
            }
        }
        return result
    }
    
    lowerRightMostPlantBoundsRectPoint_mm(): TPoint {
        let result = Point(0, 0)
        let initialized = false
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
                const bottomRight_mm = new TPoint()
                bottomRight_mm.X = intround(plant.boundsRect_pixels().Right / domain.plantDrawScale_PixelsPerMm() - domain.plantDrawOffset_mm().x)
                bottomRight_mm.Y = intround(plant.boundsRect_pixels().Bottom / domain.plantDrawScale_PixelsPerMm() - domain.plantDrawOffset_mm().y)
                if (!initialized) {
                    result = bottomRight_mm
                    initialized = true
                } else {
                    if ((bottomRight_mm.X > result.X)) {
                        result.X = bottomRight_mm.X
                    }
                    if ((bottomRight_mm.Y > result.Y)) {
                        result.Y = bottomRight_mm.Y
                    }
                }
            }
        }
        return result
    }
    
    xLocationEditExit(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const oldXLocation: int = plant.basePoint_pixels().X
        const newXLocation: int = StrToIntDef(this.xLocationEdit.Text, oldXLocation)
        if (newXLocation !== oldXLocation) {
            const increment = newXLocation - oldXLocation
            let direction: short
            if (increment > 0) {
                direction = kRight
            } else {
                direction = kLeft
            }
            this.nudgeSelectedPlantsByPixelsAndDirection(increment, direction)
        }
    }
    
    yLocationEditExit(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const oldYLocation = plant.basePoint_pixels().Y
        const newYLocation = StrToIntDef(this.yLocationEdit.Text, oldYLocation)
        if (newYLocation !== oldYLocation) {
            const increment = newYLocation - oldYLocation
            let direction: short
            if (increment > 0) {
                direction = kDown
            } else {
                direction = kUp
            }
            this.nudgeSelectedPlantsByPixelsAndDirection(increment, direction)
        }
    }

    xLocationSpinDownClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, kLeft)
    }
    
    xLocationSpinUpClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, kRight)
    }
    
    yLocationSpinDownClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, kUp)
    }
    
    yLocationSpinUpClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, kDown)
    }
    
    xRotationEditChange(): void {
        this.checkRotationEditAgainstBounds(this.xRotationEdit)
    }
    
    yRotationEditChange(): void {
        this.checkRotationEditAgainstBounds(this.yRotationEdit)
    }
    
    zRotationEditChange(): void {
        this.checkRotationEditAgainstBounds(this.zRotationEdit)
    }
    
    checkRotationEditAgainstBounds(edit: TEdit): void {
        if (this.internalChange) {
            return
        }
        let newRotation = StrToIntDef(edit.Text, 0)
        const oldRotation = newRotation
        if (newRotation < -360) {
            newRotation = 360 - (Math.abs(newRotation) - 360)
        }
        if (newRotation > 360) {
            newRotation = -360 + (newRotation - 360)
        }
        if (newRotation !== oldRotation) {
            this.internalChange = true
            edit.Text = IntToStr(newRotation)
            this.internalChange = false
        }
    }
    
    xRotationEditExit(): void {
        this.changeSelectedPlantRotations(this.xRotationEdit, kRotateX, 0)
    }
    
    xRotationSpinUpClick(): void {
        this.changeSelectedPlantRotations(this.xRotationEdit, kRotateX, domain.options.rotationIncrement)
    }
    
    xRotationSpinDownClick(): void {
        this.changeSelectedPlantRotations(this.xRotationEdit, kRotateX, -domain.options.rotationIncrement)
    }
    
    yRotationEditExit(): void {
        this.changeSelectedPlantRotations(this.yRotationEdit, kRotateY, 0)
    }
    
    yRotationSpinUpClick(): void {
        this.changeSelectedPlantRotations(this.yRotationEdit, kRotateY, domain.options.rotationIncrement)
    }
    
    yRotationSpinDownClick(): void {
        this.changeSelectedPlantRotations(this.yRotationEdit, kRotateY, -domain.options.rotationIncrement)
    }
    
    zRotationEditExit(): void {
        this.changeSelectedPlantRotations(this.zRotationEdit, kRotateZ, 0)
    }
    
    zRotationSpinUpClick(): void {
        this.changeSelectedPlantRotations(this.zRotationEdit, kRotateZ, domain.options.rotationIncrement)
    }
    
    zRotationSpinDownClick(): void {
        this.changeSelectedPlantRotations(this.zRotationEdit, kRotateZ, -domain.options.rotationIncrement)
    }
    
    changeSelectedPlantRotations(edit: TEdit, rotateDirection: short, changeInRotation: short): void {
        if (this.internalChange) {
            return
        }
        let newRotation = StrToIntDef(edit.Text, 0) + changeInRotation
        edit.Text = IntToStr(newRotation)
        // need this? 
        this.checkRotationEditAgainstBounds(edit)
        // in case changed 
        newRotation = StrToIntDef(edit.Text, 0)
        if (this.focusedPlant() === null) {
            //should be disabled, but
            return
        }
        const newCommand = new PdRotateCommand(this.selectedPlants, rotateDirection, newRotation)
        this.doCommand(newCommand)
    }

    resetRotationsClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        // don't do if none of the selected plants have rotations other than zero 
        let allRotationsAreZero = true
        for (let i = 0; i <= this.selectedPlants.length - 1; i++) {
            const plant = this.selectedPlants[i]
            if ((plant.xRotation !== 0) || (plant.yRotation !== 0) || (plant.zRotation !== 0)) {
                allRotationsAreZero = false
                break
            }
        }
        if (allRotationsAreZero) {
            return
        }
        const newCommand = new PdResetRotationsCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    drawingScaleEditExit(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const oldValue = plant.drawingScale_PixelsPerMm
        let newValue: float
        try {
            newValue = StrToFloat(this.drawingScaleEdit.Text)
        } catch (e) {
            newValue = oldValue
        }
        if (newValue !== oldValue) {
            this.resizeSelectedPlantsWithMultiplierOrNewAmount(0, newValue)
        }
    }
    
    drawingScaleSpinUpClick(): void {
        if (this.focusedPlant() === null) {
            return
        }
        const resizeMultiplier = domain.options.resizeKeyUpMultiplierPercent / 100.0
        this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    }
    
    drawingScaleSpinDownClick(): void {
        if (this.focusedPlant() === null) {
            return
        }
        const resizeMultiplier = safedivExcept(1.0, domain.options.resizeKeyUpMultiplierPercent / 100.0, 0.9)
        this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    }

    makeEqualWidthClick(): void {
        const plant = this.focusedPlant()
        if (!plant) {
            return
        }
        const newCommand = new PdResizePlantsToSameWidthOrHeightCommand(this.selectedPlants, rWidth(plant.boundsRect_pixels()), 0, kChangeWidth)
        this.doCommand(newCommand)
    }
    
    makeEqualHeightClick(): void {
        const plant = this.focusedPlant()
        if (!plant) {
            return
        }
        const newCommand = new PdResizePlantsToSameWidthOrHeightCommand(this.selectedPlants, 0, rHeight(plant.boundsRect_pixels()), kChangeHeight)
        this.doCommand(newCommand)
    }

    MenuLayoutSizeSameWidthClick(): void {
        this.makeEqualWidthClick()
    }
    
    MenuLayoutSizeSameHeightClick(): void {
        this.makeEqualHeightClick()
    }
    
    alignTopsClick(): void {
        this.alignSelectedPlants(kUp)
    }
    
    alignBottomsClick(): void {
        this.alignSelectedPlants(kDown)
    }
    
    alignLeftClick(): void {
        this.alignSelectedPlants(kLeft)
    }
    
    alignRightClick(): void {
        this.alignSelectedPlants(kRight)
    }
    
    alignSelectedPlants(alignDirection: short): void {
        const plant = this.focusedPlant()
        if (!plant || this.selectedPlants.length <= 1) {
            return
        }
        const newCommand = new PdAlignPlantsCommand(this.selectedPlants, plant.boundsRect_pixels(), alignDirection)
        this.doCommand(newCommand)
    }
    
    MenuLayoutAlignTopsClick(): void {
        this.alignTopsClick()
    }
    
    MenuLayoutAlignBottomsClick(): void {
        this.alignBottomsClick()
    }
    
    MenuLayoutAlignLeftSidesClick(): void {
        this.alignLeftClick()
    }
    
    MenuLayoutAlignRightSidesClick(): void {
        this.alignRightClick()
    }
    
    packPlantsClick(): void {
        const plant = this.focusedPlant()
        if (!plant || this.selectedPlants.length <= 1) {
            return
        }
        const newCommand = new PdPackPlantsCommand(this.selectedPlants, plant.boundsRect_pixels())
        this.doCommand(newCommand)
    }
    
    MenuLayoutPackClick(): void {
        this.packPlantsClick()
    }
    
    // FormKeyDown(Key: byte, Shift: TShiftState): void {
    //     if (this.animateTimer.enabled) {
    //         // pressing any key will stop animation 
    //         Key = 0
    //         this.stopAnimation()
    //     }
    //     if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift) && (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
    //         if ((Key === delphi_compatability.VK_LEFT) || (Key === delphi_compatability.VK_RIGHT) || (Key === delphi_compatability.VK_UP) || (Key === delphi_compatability.VK_DOWN)) {
    //             // hold down control and shift and press arrow keys - resize current plants 
    //             this.resizeSelectedPlantsByKey(Key)
    //             Key = 0
    //         }
    //         // hold down control and press arrow keys - shift current plants 
    //     } else if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
    //         if ((Key === delphi_compatability.VK_LEFT) || (Key === delphi_compatability.VK_RIGHT) || (Key === delphi_compatability.VK_UP) || (Key === delphi_compatability.VK_DOWN)) {
    //             this.nudgeSelectedPlantsByKey(Key)
    //             Key = 0
    //         }
    //         // hold down shift - do magnification as minus 
    //     } else if ((Key === delphi_compatability.VK_SHIFT)) {
    //         if (this.cursorModeForDrawing === kCursorModeMagnify) {
    //             this.drawingPaintBox.Cursor = ucursor.crMagMinus
    //         }
    //     }
    //     return Key
    // }
    
    // nudgeSelectedPlantsByKey(key: byte): void {
    //     if (this.selectedPlants.length <= 0) {
    //         return
    //     }
    //     let direction: short
    //     switch (key) {
    //         case delphi_compatability.VK_LEFT:
    //             direction = utdomove.kLeft
    //             break
    //         case delphi_compatability.VK_RIGHT:
    //             direction = utdomove.kRight
    //             break
    //         case delphi_compatability.VK_UP:
    //             direction = kUp
    //             break
    //         case delphi_compatability.VK_DOWN:
    //             direction = kDown
    //             break
    //         default:
    //             return
    //             break
    //     }
    //     this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, direction)
    // }
    
    nudgeSelectedPlantsByPixelsAndDirection(pixels: int, direction: short): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const movePoint = Point(0, 0)
        switch (direction) {
            case kUp:
                movePoint.Y = -pixels
                break
            case kDown:
                movePoint.Y = pixels
                break
            case kLeft:
                movePoint.X = -pixels
                break
            case kRight:
                movePoint.X = pixels
                break
        }
        const newCommand = new PdDragCommand(this.selectedPlants).createWithListOfPlantsAndDragOffset(movePoint)
        this.doCommand(newCommand)
    }
    
    // resizeSelectedPlantsByKey(key: byte): void {
    //     if (this.selectedPlants.length <= 0) {
    //         return
    //     }
    //     let resizeMultiplier: float
    //     if ((key === delphi_compatability.VK_LEFT) || (key === delphi_compatability.VK_UP)) {
    //         resizeMultiplier = domain.options.resizeKeyUpMultiplierPercent / 100.0
    //     } else if ((key === delphi_compatability.VK_RIGHT) || (key === delphi_compatability.VK_DOWN)) {
    //         resizeMultiplier = safedivExcept(1.0, domain.options.resizeKeyUpMultiplierPercent / 100.0, 0.9)
    //     } else {
    //         return
    //     }
    //     this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    // }
    
    resizeSelectedPlantsWithMultiplierOrNewAmount(multiplier: float, newAmount_pixelsPerMm: float): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        let newCommand: PdCommand
        if (multiplier !== 0) {
            newCommand = new PdResizePlantsCommand(this.selectedPlants).createWithMultiplier(multiplier)
        } else {
            newCommand = new PdResizePlantsCommand(this.selectedPlants).createWithNewValue(newAmount_pixelsPerMm)
        }
        this.doCommand(newCommand)
    }
    
    // FormKeyPress(Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     if (this.animateTimer.enabled) {
    //         // pressing any key will stop animation 
    //         Key = chr(0)
    //         this.stopAnimation()
    //     }
    //     return Key
    // }
    
    // FormKeyUp(Key: byte, Shift: TShiftState): void {
    //     if (this.animateTimer.enabled) {
    //         // pressing any key will stop animation 
    //         Key = 0
    //         this.stopAnimation()
    //     }
    //     if ((Key === delphi_compatability.VK_SHIFT)) {
    //         if (this.cursorModeForDrawing === kCursorModeMagnify) {
    //             // let up shift or control - go back to plus magnification 
    //             this.drawingPaintBox.Cursor = ucursor.crMagPlus
    //         }
    //     }
    //     return Key
    // }
    
    // tab set 
    // ------------------------------------------------------------------------------------ *tab set 
    lifeCycleShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabLifeCycle)
        return result
    }
    
    rotationsShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabRotations)
        return result
    }
    
    parametersShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabParameters)
        return result
    }
    
    statsShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabStatistics)
        return result
    }
    
    noteShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabNote)
        return result
    }
    
    posingShowing(): boolean {
        const result = (this.tabSet.tabIndex === kTabPosing)
        return result
    }
    
    tabSetChange(NewTab: int, AllowChange: boolean): boolean {
        unfinished(); return true
        // this.lifeCyclePanel.Visible = (NewTab === kTabLifeCycle)
        // this.rotationsPanel.Visible = (NewTab === kTabRotations)
        // this.parametersPanel.Visible = (NewTab === kTabParameters)
        // this.statsScrollBox.Visible = (NewTab === kTabStatistics)
        // this.notePanel.Visible = (NewTab === kTabNote)
        // this.posingPanel.Visible = (NewTab === kTabPosing)
        // this.updateRightSidePanelForFirstSelectedPlantWithTab(NewTab)
        // return AllowChange
    }
    
    updateRightSidePanelForFirstSelectedPlant(): void {
        // set tab font colors - pay attention to multiple selections 
        // v2.0 removed this
        //  tabSet.font.color := self.textColorToRepresentPlantSelection(true);
        //  tabSet.invalidate;
        this.updateRightSidePanelForFirstSelectedPlantWithTab(this.tabSet.tabIndex)
    }
    
    updateRightSidePanelForFirstSelectedPlantWithTab(newTab: int): void {
        switch (newTab) {
            case kTabLifeCycle:
                this.updateLifeCyclePanelForFirstSelectedPlant()
                break
            case kTabRotations:
                this.updateRotationsPanelForFirstSelectedPlant()
                break
            case kTabParameters:
                this.updateParametersPanelForFirstSelectedPlant()
                break
            case kTabStatistics:
                this.updateStatisticsPanelForFirstSelectedPlant()
                break
            case kTabNote:
                this.updateNoteForFirstSelectedPlant()
                break
            case kTabPosing:
                this.updatePosingForFirstSelectedPlant()
                break
        }
    }
    
    textColorToRepresentPlantSelection(payAttentionToMultiSelect: boolean): TColorRef {
        let result: TColorRef
        if (this.focusedPlant() !== null) {
            if (payAttentionToMultiSelect) {
                if (this.selectedPlants.length <= 1) {
                    result = ColorDefs.clBtnText
                } else {
                    // v2.0  was clRed
                    result = ColorDefs.clBlue
                }
            } else {
                result = ColorDefs.clBtnText
            }
        } else {
            result = ColorDefs.clGray
        }
        return result
    }
    
    updateForChangeToPlantRotations(): void {
        // TODO PDF: Fix this
        // const firstPlant = this.focusedPlant()
        // if (firstPlant !== null) {
        //     this.xRotationEdit.Text = IntToStr(intround(firstPlant.xRotation))
        //     this.yRotationEdit.Text = IntToStr(intround(firstPlant.yRotation))
        //     this.zRotationEdit.Text = IntToStr(intround(firstPlant.zRotation))
        // } else {
        //     this.xRotationEdit.Text = ""
        //     this.yRotationEdit.Text = ""
        //     this.zRotationEdit.Text = ""
        // }
        // this.xRotationEdit.Refresh()
        // this.yRotationEdit.Refresh()
        // this.zRotationEdit.Refresh()
    }
    
    updateForChangeToSelectedPlantsDrawingScale(): void {
        // TODO PDF: Fix this
        // const firstPlant = this.focusedPlant()
        // if (firstPlant !== null) {
        //     this.drawingScaleEdit.Text = usupport.digitValueString(firstPlant.drawingScale_PixelsPerMm)
        // } else {
        //     this.drawingScaleEdit.Text = ""
        // }
        // this.drawingScaleEdit.Refresh()
    }
    
    updateForChangeToSelectedPlantsLocation(): void {
        // TODO PDF: Fix this
        // const firstPlant = this.focusedPlant()
        // if (firstPlant !== null) {
        //     this.xLocationEdit.Text = usupport.digitValueString(firstPlant.basePoint_pixels().X)
        //     this.yLocationEdit.Text = usupport.digitValueString(firstPlant.basePoint_pixels().Y)
        // } else {
        //     this.xLocationEdit.Text = ""
        //     this.yLocationEdit.Text = ""
        // }
        // this.xLocationEdit.Refresh()
        // this.yLocationEdit.Refresh()
    }
    
    // ------------------------------------------------------- *life cycle panel drawing and mouse handling 
    updateLifeCyclePanelForFirstSelectedPlant(): void {
        // TODO PDF: Fix this or remove obsolete code
        // this.updatePlantNameLabel(kTabLifeCycle)
        // const firstPlant = this.focusedPlant()
        // this.lifeCycleDaysEdit.Enabled = firstPlant !== null
        // this.lifeCycleDaysSpin.Enabled = firstPlant !== null
        // this.lifeCycleDragger.Enabled = firstPlant !== null
        // this.animateGrowth.Enabled = firstPlant !== null
        // this.timeLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        // this.maxSizeAxisLabel.Font.Color = this.timeLabel.Font.Color
        // this.ageAndSizeLabel.Font.Color = this.timeLabel.Font.Color
        // this.daysAndSizeLabel.Font.Color = this.timeLabel.Font.Color
        // if (firstPlant !== null) {
        //     //special case
        //     this.lifeCycleDragger.Color = ColorDefs.clRed
        // } else {
        //     this.lifeCycleDragger.Color = ColorDefs.clGray
        // }
        // // reset red dragger panel 
        // this.placeLifeCycleDragger()
        // if (firstPlant !== null) {
        //     // set life cycle days in edit 
        //     this.lifeCycleDaysEdit.Text = IntToStr(firstPlant.age)
        // } else {
        //     this.lifeCycleDaysEdit.Text = "0"
        // }
        // if (firstPlant !== null) {
        //     // set % size label
        //     this.daysAndSizeLabel.Caption = "days, " + IntToStr(intround(firstPlant.totalBiomass_pctMPB)) + "% max size"
        // } else {
        //     this.daysAndSizeLabel.Caption = ""
        // }
        // this.placeLifeCycleDragger()
        // this.redrawLifeCycleGraph()
    }
    
    updatePlantNameLabel(tabIndex: short): void {
        // TODO PDF: Fix or remove obsolete code
        // let firstPlant: PdPlant
        // let labelToChange: TLabel
        // let payAttentionToOtherPlants: boolean
        // let prefix: string
        // let handlingDifferently: boolean
        
        // const firstPlant = this.focusedPlant()
        // let payAttentionToOtherPlants = true
        // let handlingDifferently = false
        // let prefix = ""
        // let labelToChange: string | null = null
        // switch (tabIndex) {
        //     case kTabRotations:
        //         labelToChange = this.arrangementPlantName
        //         prefix = "Arrangement for "
        //         break
        //     case kTabParameters:
        //         labelToChange = this.parametersPlantName
        //         prefix = "Parameters for "
        //         break
        //     case kTabLifeCycle:
        //         labelToChange = this.selectedPlantNameLabel
        //         prefix = "Life cycle for "
        //         break
        //     case kTabPosing:
        //         labelToChange = this.posingPlantName
        //         payAttentionToOtherPlants = false
        //         prefix = "Posing for "
        //         break
        //     case kTabStatistics:
        //         handlingDifferently = true
        //         this.statsPanel.updatePlant(firstPlant)
        //         break
        //     case kTabNote:
        //         labelToChange = this.noteLabel
        //         payAttentionToOtherPlants = false
        //         prefix = "Note for "
        //         break
        // }
        // if ((handlingDifferently) || (labelToChange === null)) {
        //     return
        // }
        // if (firstPlant !== null) {
        //     labelToChange.Caption = prefix + firstPlant.getName()
        //     if ((payAttentionToOtherPlants) && (this.selectedPlants.length > 1)) {
        //         labelToChange.Caption = labelToChange.Caption + " (and other plants)"
        //     }
        // } else {
        //     labelToChange.Caption = "(no plants selected)"
        // }
        // labelToChange.Font.Color = this.textColorToRepresentPlantSelection(payAttentionToOtherPlants)
    }
    
    animateGrowthClick(): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdAnimatePlantCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuPlantAnimateClick(): void {
        if (this.animateCommand) {
            this.stopAnimation()
            return
        }
        this.animateGrowthClick()
    }
    
    // animation 
    startAnimation(): void {
        // called by animate command, which also sets up the pointer for the timer to call 
        domain.temporarilyHideSelectionRectangles = true
        // disable all non-modal forms 
        // keeps space bar from affecting magnification
        // TODO PDF: Fix or remove: this.ActiveControl = this.plantListDrawGrid
        this.enableOrDisableAllForms(kDisableAllForms)
        // add warning about disabled forms 
        // TODO PDF: Fix or remove: this.animatingLabel.Visible = true
        this.tabSet.visible = false
        // start timer 
        this.animateTimerTimeoutId = setTimeout(() => this. animateTimerFired(), 100)
    }
    
     animateTimerFired(): void {
        if (this.animateCommand !== null) {
            this.animateCommand.animateOneDay()
            this.animateTimerTimeoutId = setTimeout(() => this. animateTimerFired(), 100)
        } else {
            this.animateTimerTimeoutId = null
        }
        m.redraw()
    }
    
    stopAnimation(): void {
        // called by animate command or self (if user clicks in drawing area or presses a key) 
        domain.temporarilyHideSelectionRectangles = false
        // stop timer 
        if (this.animateTimerTimeoutId !== null) {
            clearTimeout(this.animateTimerTimeoutId)
            this.animateTimerTimeoutId = null
        }
        // nil out pointer 
        this.animateCommand = null
        // re-enable everything 
        this.enableOrDisableAllForms(kEnableAllForms)
        // remove warning about disabled forms 
        // TODO PDF: Fix this: this.animatingLabel.Visible = false
        this.tabSet.visible = true
        if (domain.options.showSelectionRectangle) {
            // if there were selection rectangles before, put them back 
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    enableOrDisableAllForms(enable: boolean): void {
        // TODO PDF: Fix or remove obsolete code
        // // cfk note: put any new NON-MODAL forms here 
        // this.Enabled = enable
        // ubreedr.BreederForm.Enabled = enable
        // utimeser.TimeSeriesForm.Enabled = enable
        // udebug.DebugForm.Enabled = enable
    }
    
    /*

    lifeCycleDaysEditExit(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        let newAge = StrToIntDef(this.lifeCycleDaysEdit.Text, 0)
        if (newAge === plant.age) {
            return
        }
        if (newAge > plant.pGeneral.ageAtMaturity) {
            newAge = plant.pGeneral.ageAtMaturity
            this.lifeCycleDaysEdit.Text = IntToStr(newAge)
        }
        this.changeSelectedPlantAges(newAge)
    }
    
    lifeCycleDaysSpinUpClick(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        let newAge = intMin(StrToIntDef(this.lifeCycleDaysEdit.Text, 0) + 1, plant.pGeneral.ageAtMaturity)
        newAge = intMax(0, newAge)
        this.lifeCycleDaysEdit.Text = IntToStr(newAge)
        this.changeSelectedPlantAges(newAge)
    }
    
    lifeCycleDaysSpinDownClick(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        let newAge = intMin(StrToIntDef(this.lifeCycleDaysEdit.Text, 0) - 1, plant.pGeneral.ageAtMaturity)
        newAge = intMax(0, newAge)
        this.lifeCycleDaysEdit.Text = IntToStr(newAge)
        this.changeSelectedPlantAges(newAge)
    }
    
    lifeCycleDraggerMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (this.focusedPlant() !== null) {
            this.lifeCycleDragging = true
            this.lifeCycleDraggingStartPos = X
            this.lifeCycleDraggingLastDrawPos = -1
            this.lifeCycleDraggingNeedToRedraw = true
        }
    }
    
    lifeCycleDraggerMouseMove(Shift: TShiftState, X: int, Y: int): void {
        if (this.lifeCycleDragging && (this.lifeCycleDragger.Left + X >= this.lifeCycleGraphImage.Left) && (this.lifeCycleDragger.Left + X < this.lifeCycleGraphImage.Left + this.lifeCycleGraphImage.Width)) {
            this.undrawLifeCycleDraggerLine()
            this.lifeCycleDraggingLastDrawPos = this.drawLifeCycleDraggerLine(X)
        }
    }
    
    lifeCycleDraggerMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (this.lifeCycleDragging) {
            this.undrawLifeCycleDraggerLine()
            this.lifeCycleDragger.Left = this.lifeCycleDragger.Left - (this.lifeCycleDraggingStartPos - X)
            if (this.lifeCycleDragger.Left < this.lifeCycleGraphImage.Left) {
                this.lifeCycleDragger.Left = this.lifeCycleGraphImage.Left
            }
            if (this.lifeCycleDragger.Left + this.lifeCycleDragger.Width > this.lifeCycleGraphImage.Left + this.lifeCycleGraphImage.Width) {
                this.lifeCycleDragger.Left = this.lifeCycleGraphImage.Left + this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width
            }
            const firstPlant = this.focusedPlant()
            if (firstPlant === null) {
                throw new Error("Problem: First plant is nil during drag in method TMainForm.lifeCycleDraggerMouseUp.")
            }
            let newAge: int
            if ((this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width) !== 0) {
                newAge = intround(firstPlant.pGeneral.ageAtMaturity * (this.lifeCycleDragger.Left - this.lifeCycleGraphImage.Left) / (this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width))
            } else {
                newAge = 0
            }
            this.changeSelectedPlantAges(newAge)
            this.resizePanelsToVerticalSplitter()
            this.lifeCycleDragging = false
        }
    }
    
    drawLifeCycleDraggerLine(pos: int): int {
        const theDC: HDC = UNRESOLVED.getDC(0)
        const result = this.ClientOrigin.X + this.plantFocusPanel.Left + this.lifeCyclePanel.Left + this.lifeCycleDragger.Left + pos + 2
        UNRESOLVED.patBlt(theDC, result, this.ClientOrigin.Y + this.plantFocusPanel.Top + this.lifeCyclePanel.Top + this.lifeCycleDragger.Top, 1, this.lifeCycleDragger.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.lifeCycleDraggingNeedToRedraw = true
        return result
    }
    
    undrawLifeCycleDraggerLine(): void {
        if (!this.lifeCycleDraggingNeedToRedraw) {
            return
        }
        const theDC: HDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.lifeCycleDraggingLastDrawPos, this.ClientOrigin.Y + this.plantFocusPanel.Top + this.lifeCyclePanel.Top + this.lifeCycleDragger.Top, 1, this.lifeCycleDragger.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.lifeCycleDraggingNeedToRedraw = false
    }
    
    */

    changeSelectedPlantAges(newAge: short): void {
        if (this.selectedPlants.length <= 0) {
            return
        }
        const newCommand = new PdChangePlantAgeCommand(this.selectedPlants, newAge)
        this.doCommand(newCommand)
    }
    
    /*

    // life cycle panel drawing and mouse handling 
    redrawLifeCycleGraph(): void {
        this.lifeCycleGraphImage.Picture.Bitmap.Canvas.Brush.Color = ColorDefs.clBtnFace
        this.lifeCycleGraphImage.Picture.Bitmap.Canvas.Rectangle(0, 0, this.lifeCycleGraphImage.ClientWidth, this.lifeCycleGraphImage.ClientHeight)
        const sCurveError = this.drawSCurveOrCheckForError(this.lifeCycleGraphImage.Picture.Bitmap.Canvas, Rect(0, 0, this.lifeCycleGraphImage.ClientWidth, this.lifeCycleGraphImage.ClientHeight), true, false)
        if (sCurveError && (this.focusedPlant() !== null)) {
            // error - do something, should be caught by parameter panel 
            // PDF PORT -- put in NIL
            null
        }
    }

    drawSCurveOrCheckForError(aCanvas: TCanvas, aRect: TRect, draw: boolean, failed: boolean): boolean {
        const firstPlant = this.focusedPlant()
        if (firstPlant === null) {
            return failed
        }
        failed = true
        const numPoints = 100
        const curve: SCurveStructure = new SCurveStructure()
        // assumes that zero does NOT fall between x1 and x2, though one of these could be zero 
        curve.x1 = firstPlant.pGeneral.growthSCurve.x1
        curve.y1 = firstPlant.pGeneral.growthSCurve.y1
        curve.x2 = firstPlant.pGeneral.growthSCurve.x2
        curve.y2 = firstPlant.pGeneral.growthSCurve.y2
        try {
            failed = calcSCurveCoeffsWithResult(curve, failed)
            if (failed) {
                return failed
            }
            for (let i = 0; i <= numPoints - 1; i++) {
                // delphi 2.0 wants this 
                let x = 0.0
                let y = 0.0
                try {
                    x = 1.0 * i / numPoints
                } catch (e) {
                    return failed
                }
                y = scurveWithResult(x, curve.c1, curve.c2)
                if (failed) {
                    return failed
                }
                if (draw) {
                    const thisPoint: TPoint = new TPoint()
                    thisPoint.X = aRect.Left + intround(x * (aRect.Right - aRect.Left))
                    thisPoint.Y = aRect.Top + intround((1.0 - y) * (aRect.Bottom - aRect.Top))
                    if (i === 0) {
                        aCanvas.MoveTo(thisPoint.X, thisPoint.Y)
                    } else {
                        aCanvas.LineTo(thisPoint.X, thisPoint.Y)
                    }
                }
            }
        } catch (e) {
            return failed
        }
        failed = false
        return failed
    }
    
    // ----------------------------------------------------------------------------- *parameters panel 
    sectionsComboBoxDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        if ((this.sectionsComboBox.Items.Count <= 0) || (index < 0) || (index > this.sectionsComboBox.Items.Count - 1)) {
            return
        }
        const selected: boolean = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // set up section pointer 
        const section: PdSection = this.sectionsComboBox.Items.Objects[index]
        if (section === null) {
            return
        }
        this.sectionsComboBox.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.sectionsComboBox.Canvas.Font = this.sectionsComboBox.Font
        if (selected) {
            this.sectionsComboBox.Canvas.Brush.Color = ColorDefs.clHighlight
            this.sectionsComboBox.Canvas.Font.Color = ColorDefs.clHighlightText
        } else {
            this.sectionsComboBox.Canvas.Brush.Color = this.sectionsComboBox.Color
            this.sectionsComboBox.Canvas.Font.Color = ColorDefs.clBtnText
        }
        this.sectionsComboBox.Canvas.FillRect(Rect)
        const textDrawRect = new TRect()
        textDrawRect.Left = textDrawRect.Left + 4
        textDrawRect.Top = textDrawRect.Top + (textDrawRect.Bottom - textDrawRect.Top) / 2 - (this.sectionsComboBox.Canvas.TextHeight("W") / 2)
        const sectionPicture: TPicture = this.sectionPictureForSectionName(section.getName())
        if (sectionPicture !== null) {
            this.sectionsComboBox.Canvas.Draw(Rect.left + 4, Rect.top, sectionPicture.Graphic)
        }
        textDrawRect.Left = textDrawRect.Left + 32 + 4
        const cText = this.sectionsComboBox.Items[index]
        UNRESOLVED.winprocs.drawText(this.sectionsComboBox.Canvas.Handle, cText, len(cText), textDrawRect, delphi_compatability.DT_LEFT)
    }
    
    sectionsComboBoxChange(): void {
        this.updateParameterPanelsForSectionChange()
        this.updateSectionPopupMenuForSectionChange()
    }
    
    // parameters panel 
    loadSectionsIntoListBox(): void {
        if ((domain === null) || (domain.sectionManager === null)) {
            return
        }
        this.sectionsComboBox.Clear()
        if (domain.sectionManager.sections.Count > 0) {
            for (let i = 0; i <= domain.sectionManager.sections.Count - 1; i++) {
                const section: PdSection = usection.PdSection(domain.sectionManager.sections.Items[i])
                if (section.showInParametersWindow) {
                    if (section.name === "Primary flowers, advanced") {
                        // kludge to get around necessary ordering of new advanced floral section
                        // advanced floral params are at end of file, but want to show them
                        // in the list before inflorescences
                        // WATCH OUT: change this code if you change the names of the sections
                        const indexOfPrimaryInflors = this.sectionsComboBox.Items.indexOf("Primary inflorescences")
                        this.sectionsComboBox.Items.InsertObject(indexOfPrimaryInflors, section.name, section)
                    } else {
                        this.sectionsComboBox.Items.AddObject(section.name, section)
                    }
                }
            }
        }
        if (domain.sectionManager.orthogonalSections.Count > 0) {
            for (let i = 0; i <= domain.sectionManager.orthogonalSections.Count - 1; i++) {
                // v2.1 add orthogonal sections
                const section: PdSection = new PdSection(domain.sectionManager.orthogonalSections[i])
                if (section.showInParametersWindow) {
                    this.sectionsComboBox.Items.AddObject(section.name, section)
                }
            }
        }
    }
    
    currentSection(): PdSection {
        let result: PdSection | null = null
        if ((this.sectionsComboBox.Items.Count <= 0) || (this.sectionsComboBox.ItemIndex < 0) || (this.sectionsComboBox.ItemIndex > this.sectionsComboBox.Items.Count - 1)) {
            return result
        }
        result = new PdSection(this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex])
        return result
    }
    
    sectionPictureForSectionName(aName: string): TPicture {
        let result: TPicture | null = null
        let image: TImage | null = null
        
        if (aName === "(no section)") {
            return result
        }
        aName = lowercase(aName)
        if (usupport.found("general", aName)) {
            image = this.Sections_General
        } else if (usupport.found("meris", aName)) {
            image = this.Sections_Meristems
        } else if (usupport.found("inter", aName)) {
            image = this.Sections_Internodes
        } else if (usupport.found("seed", aName)) {
            image = this.Sections_SeedlingLeaves
        } else if (usupport.found("lea", aName)) {
            //must be below seedling leaves
            image = this.Sections_Leaves
        } else if (usupport.found("flow", aName) && usupport.found("primary", aName) && usupport.found("advanced", aName)) {
            image = this.Sections_FlowersPrimaryAdvanced
        } else if (usupport.found("flow", aName) && usupport.found("primary", aName)) {
            image = this.Sections_FlowersPrimary
        } else if (usupport.found("inflo", aName) && usupport.found("primary", aName)) {
            image = this.Sections_InflorPrimary
        } else if (usupport.found("fruit", aName)) {
            image = this.Sections_Fruit
        } else if (usupport.found("flow", aName) && usupport.found("secondary", aName)) {
            image = this.Sections_FlowersSecondary
        } else if (usupport.found("inflo", aName) && usupport.found("secondary", aName)) {
            image = this.Sections_InflorSecondary
        } else if (usupport.found("root", aName)) {
            // v2.1 otherwise assume it is an orthogonal section
            image = this.Sections_RootTop
        } else {
            image = this.Sections_Orthogonal
        }
        if (image !== null) {
            result = image.Picture
        }
        return result
    }
    
    sectionHelpIDForSectionName(aName: string): string {
        let result = ""
        if (aName === "(no section)") {
            return result
        }
        aName = lowercase(aName)
        if (usupport.found("general", aName)) {
            // trying to be flexible about possible name changes here 
            result = "General_parameters"
        } else if (usupport.found("meris", aName)) {
            result = "Meristem_parameters"
        } else if (usupport.found("inter", aName)) {
            result = "Internode_parameters"
        } else if (usupport.found("first", aName)) {
            result = "First_leaf_parameters"
        } else if (usupport.found("lea", aName)) {
            //must be below seedling leaves
            result = "Leaf_parameters"
        } else if (usupport.found("advanced", aName)) {
            // must be above flower params
            result = "Advanced_flower_parameters"
        } else if (usupport.found("flow", aName)) {
            result = "Flower_parameters"
        } else if (usupport.found("inflo", aName)) {
            result = "Inflorescence_parameters"
        } else if (usupport.found("fruit", aName)) {
            result = "Fruit_parameters"
        } else if (usupport.found("root", aName)) {
            // add more sections here if any are added to the params file 
            // v2.1 otherwise assume it is an orthogonal section
            result = "Root_top_parameters"
        } else {
            result = "Transverse_parameter_sections"
        }
        return result
    }
    
    updateParameterPanelsForSectionChange(): void {
        try {
            cursor_startWait()
            // clear out any earlier panels 
            this.selectedParameterPanel = null
            if (this.parametersScrollBox.ControlCount > 0) {
                while (this.parametersScrollBox.ControlCount > 0) {
                    // this is the only valid time to free a component owned by something - after it has
                    //        been removed from the component list (owned objects) of the owner 
                    const oldParamPanel: PdParameterPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[0])
                    this.RemoveComponent(oldParamPanel)
                    oldParamPanel.Parent = null
                }
            }
            if (this.sectionsComboBox.ItemIndex < 0) {
                // make new panels for the current section 
                return
            }
            const section: PdSection = this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex]
            if (section.numSectionItems > 0) {
                for (let i = 0; i <= section.numSectionItems - 1; i++) {
                    const parameter = domain.parameterManager.parameterForFieldNumber(section.sectionItems[i])
                    if (parameter === null) {
                        continue
                    }
                    let paramPanel: PdParameterPanel | null = null
                    // note that the longint type is used to store plant positions, but should not be used
                    //          for parameter panels 
                    switch (parameter.fieldType) {
                        case FieldType.kFieldHeader:
                            paramPanel = upp_hed.PdHeaderParameterPanel().createForParameter(this, parameter)
                            break
                        case FieldType.kFieldEnumeratedList:
                            paramPanel = upp_lis.PdListParameterPanel().createForParameter(this, parameter)
                            break
                        case FieldType.kFieldThreeDObject:
                            paramPanel = upp_tdo.PdTdoParameterPanel().createForParameter(this, parameter)
                            break
                        case FieldType.kFieldColor:
                            paramPanel = upp_col.PdColorParameterPanel().createForParameter(this, parameter)
                            break
                        case FieldType.kFieldSmallint:
                            paramPanel = upp_int.PdSmallintParameterPanel().createForParameter(this, parameter)
                            break
                        case FieldType.kFieldFloat:
                            if (parameter.indexCount() <= 1) {
                                paramPanel = upp_rea.PdRealParameterPanel().createForParameter(this, parameter)
                            } else if (parameter.indexType === uparams.kIndexTypeSCurve) {
                                paramPanel = upp_scv.PdSCurveParameterPanel().createForParameter(this, parameter)
                            }
                            break
                        case uparams.kFieldBoolean:
                            paramPanel = upp_boo.PdBooleanParameterPanel().createForParameter(this, parameter)
                            break
                        default:
                            throw new Error("Problem: Unsupported parameter type in method TMainForm.updateParameterPanelsForSectionChange.")
                            break
                    }
                    if (paramPanel !== null) {
                        paramPanel.Parent = this.parametersScrollBox
                        //9 +
                        paramPanel.TabOrder = i
                        paramPanel.calculateTextDimensions()
                        paramPanel.calculateHeight()
                        if ((parameter.originalSectionName !== section.name) && !(paramPanel instanceof upp_hed.PdHeaderParameterPanel)) {
                            // v2.1 add original section name to params in orthogonal sections
                            paramPanel.Caption = paramPanel.Caption + " [" + parameter.originalSectionName + "]"
                        }
                    }
                }
            }
            this.updateParametersPanelForFirstSelectedPlant()
            this.repositionParameterPanels()
        } finally {
            cursor_stopWait()
        }
    }
    
    paramHelpIDForParamPanel(panel: PdParameterPanel): string {
        let result = ""
        if (panel === null) {
            return result
        }
        if (panel instanceof upp_hed.PdHeaderParameterPanel) {
            result = "Using_header_parameter_panels"
        } else if ((panel instanceof upp_int.PdSmallintParameterPanel) || (panel instanceof upp_rea.PdRealParameterPanel)) {
            result = "Using_number_parameter_panels"
        } else if (panel instanceof upp_scv.PdSCurveParameterPanel) {
            result = "Using_S_curve_parameter_panels"
        } else if (panel instanceof upp_boo.PdBooleanParameterPanel) {
            result = "Using_yes/no_parameter_panels"
        } else if (panel instanceof upp_lis.PdListParameterPanel) {
            result = "Using_list_parameter_panels"
        } else if (panel instanceof upp_col.PdColorParameterPanel) {
            result = "Using_color_parameter_panels"
        } else if (panel instanceof upp_tdo.PdTdoParameterPanel) {
            result = "Using_3D_object_parameter_panels"
        }
        return result
    }
    
    */

    updateParametersPanelForFirstSelectedPlant(): void {
        unfinished()
        // this.updatePlantNameLabel(kTabParameters)
        // if (this.parametersScrollBox.ControlCount > 0) {
        //     for (let i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         if (this.parametersScrollBox.Controls[i] instanceof uppanel.PdParameterPanel) {
        //             const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //             //panels check if the new plant is different from current one
        //             paramPanel.updatePlant(this.focusedPlant())
        //         }
        //     }
        // }
        // this.repositionParameterPanels()
    }
    
    enteringAParameterPanel(aPanel: PdParameterPanel): void {
        this.selectedParameterPanel = aPanel
        // update menu items and other things 
    }
    
    leavingAParameterPanel(aPanel: PdParameterPanel): void {
        this.selectedParameterPanel = null
        // update menu items and other things 
    }
    
    repositionParameterPanels(): void {
        unfinished()
        // if (this.parametersScrollBox.ControlCount > 0) {
        //     let totalMaxWidth = 0
        //     let lastPos = 0
        //     const oldPosition: int = this.parametersScrollBox.VertScrollBar.Position
        //     this.parametersScrollBox.VertScrollBar.Position = 0
        //     const windowLock: boolean = UNRESOLVED.lockWindowUpdate(this.Handle)
        //     const requestedWidth: int = this.parametersScrollBox.ClientWidth
        //     for (let i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //         paramPanel.Left = 0
        //         paramPanel.Top = lastPos
        //         paramPanel.calculateTextDimensions()
        //         const panelMaxWidth = paramPanel.maxWidth()
        //         const panelMinWidth = paramPanel.minWidth(requestedWidth)
        //         if (panelMaxWidth <= requestedWidth) {
        //             paramPanel.Width = panelMaxWidth
        //         } else {
        //             if (panelMinWidth === -1) {
        //                 paramPanel.Width = requestedWidth
        //             } else {
        //                 paramPanel.Width = panelMinWidth
        //             }
        //         }
        //         paramPanel.calculateHeight()
        //         lastPos = lastPos + paramPanel.Height
        //         if (paramPanel.Width > totalMaxWidth) {
        //             totalMaxWidth = paramPanel.Width
        //         }
        //     }
        //     lastPos = 0
        //     for (let i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //         paramPanel.Top = lastPos
        //         // cfk change v2.0 final - can't remember why we had a max width - looks better this way
        //         // paramPanel.width := totalMaxWidth;   // was this
        //         // changed to
        //         paramPanel.Width = this.parametersScrollBox.Width - 20
        //         paramPanel.calculateHeight()
        //         paramPanel.resizeElements()
        //         lastPos = lastPos + paramPanel.Height
        //     }
        //     this.parametersScrollBox.VertScrollBar.Position = oldPosition
        //     if (windowLock) {
        //         UNRESOLVED.lockWindowUpdate(0)
        //     }
        // }
    }
    
    collapseOrExpandParameterPanelsUntilNextHeader(headerPanel: PdParameterPanel): void {
        unfinished()
        // let collapsing = false
        // this.internalChange = true
        // if (this.parametersScrollBox.ControlCount > 0) {
        //     for (let i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //         if (paramPanel === headerPanel) {
        //             collapsing = true
        //         } else if (collapsing && (paramPanel instanceof upp_hed.PdHeaderParameterPanel)) {
        //             collapsing = false
        //         } else if (collapsing) {
        //             if (headerPanel.param.collapsed) {
        //                 paramPanel.expand()
        //             } else {
        //                 paramPanel.collapse()
        //             }
        //         }
        //     }
        // }
        // this.internalChange = false
        // this.repositionParameterPanels()
    }
    
    collapseOrExpandAllParameterPanelsInCurrentSection(doWhat: short): void {
        unfinished()
        // this.internalChange = true
        // if (this.sectionsComboBox.ItemIndex < 0) {
        //     return
        // }
        // const section: PdSection = this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex]
        // if (section === null) {
        //     return
        // }
        // switch (doWhat) {
        //     case kExpand:
        //         section.expanded = true
        //         break
        //     case kCollapse:
        //         section.expanded = false
        //         break
        //     case kExpandOrCollapse:
        //         section.expanded = !section.expanded
        //         break
        // }
        // if (this.parametersScrollBox.ControlCount > 0) {
        //     for (let i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //         if (section.expanded) {
        //             paramPanel.expand()
        //         } else {
        //             paramPanel.collapse()
        //         }
        //     }
        // }
        // this.internalChange = false
        // this.repositionParameterPanels()
    }
    
    updateParameterValuesWithUpdateListForPlant(aPlant: PdPlant, updateList: PdPlantUpdateEvent[]): void {
        // TODO PDF: Fix this
        // // let i: long
        // // let paramPanel: PdParameterPanel
        // // let updateEvent: PdPlantUpdateEvent
        // // let needToUpdateWholePlant: boolean
        
        // if (aPlant !== this.focusedPlant()) {
        //     return
        // }
        // if (updateList.Count <= 0) {
        //     return
        // }
        // // first look to see if the whole plant needs updated - if any do, update it 
        // // this is for side effects in GWI - left in just in case we need it later 
        // let needToUpdateWholePlant = false
        // for (let i = 0; i <= updateList.length - 1; i++) {
        //     const updateEvent: PdPlantUpdateEvent = updateList[i]
        //     if ((updateEvent.plant !== null) && (updateEvent.plant.wholePlantUpdateNeeded)) {
        //         needToUpdateWholePlant = true
        //         updateEvent.plant.wholePlantUpdateNeeded = false
        //     }
        // }
        // if (needToUpdateWholePlant) {
        //     this.updateParametersPanelForFirstSelectedPlant()
        //     return
        // }
        // if (this.parametersScrollBox.ControlCount > 0) {
        //     for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
        //         if (this.parametersScrollBox.Controls[i] instanceof uppanel.PdParameterPanel) {
        //             // if not updating everything, update based on list 
        //             // tell all components to look at list to see if they need updating 
        //             const paramPanel: PdParameterPanel = this.parametersScrollBox.Controls[i]
        //             // components check if use models and fields in list 
        //             paramPanel.updateFromUpdateEventList(updateList)
        //         }
        //     }
        // }
    }
    
    // stats panel
    updateStatisticsPanelForFirstSelectedPlant(): void {
        unfinished()
        // if (this.statsPanel === null) {
        //     return
        // }
        // this.statsPanel.updatePlant(this.focusedPlant())
        // this.statsPanel.updatePlantValues()
    }
    
    // note panel
    updateNoteForFirstSelectedPlant(): void { 
        if (this.notePanel === null) {
            return
        }
        if (this.noteMemo === null) {
            return
        }
        const plant = this.focusedPlant()
        if (plant === null) { return }
        this.updatePlantNameLabel(kTabNote)
        this.updateForChangeToPlantNote(plant)
    }
    
    async noteEditClick(): Promise<void> {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        let note = plant.noteLines.join("\n")
        const changed = await customModal((resolve: any) => {
            return m("div",
                m("h4", "Edit note for: " + plant.getName()),
                m("textarea.pa2.w-100", { rows: 10, value: note, onchange: (event: any) => note = event.target.value }),
                m("div.ma2.flex.justify-end", 
                    m("button", { onclick: () => { resolve(false) }
                    }, "Cancel"),
                    m("button.ml2", { onclick: () => { resolve(true) }
                    }, "OK")
                )
            )
        })
        if (changed) {
            const commandLines = note.split("\n")
            const newCommand = new PdEditNoteCommand(plant, commandLines)
            this.doCommand(newCommand)
        }
    }
    
    NotePopupMenuCopyClick(): void {
        this.noteMemo.CopyToClipboard()
    }
    
    NotePopupMenuEditClick(): void {
        this.noteEditClick()
    }
    
    NotePopupMenuSelectAllClick(): void {
        this.noteMemo.SelectAll()
    }
    
    MenuPlantEditNoteClick(): void {
        this.noteEditClick()
    }
    
    PopupMenuEditNoteClick(): void {
        this.noteEditClick()
    }
    
    // rotations panel
    updateRotationsPanelForFirstSelectedPlant(): void {
        unfinished()
        // this.updatePlantNameLabel(kTabRotations)
        // const color: TColorRef = this.textColorToRepresentPlantSelection(false)
        // // location
        // this.locationLabel.Font.Color = color
        // this.xLocationLabel.Font.Color = color
        // this.yLocationLabel.Font.Color = color
        // this.locationPixelsLabel.Font.Color = color
        // // size
        // this.sizingLabel.Font.Color = color
        // this.drawingScalePixelsPerMmLabel.Font.Color = color
        // // rotation
        // this.rotationLabel.Font.Color = color
        // this.xRotationLabel.Font.Color = color
        // this.yRotationLabel.Font.Color = color
        // this.zRotationLabel.Font.Color = color
        // // other updates
        // this.updateForChangeToPlantRotations()
        // this.updateForChangeToSelectedPlantsDrawingScale()
        // this.updateForChangeToSelectedPlantsLocation()
    }
    
    // posing panel
    // ------------------------------------------------------------------------------------- *posing - updating 
    updatePosingForFirstSelectedPlant(): void {
        unfinished()
        // this.internalChange = true
        // this.posedPartsLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        // this.selectedPartLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        // this.posingPosePart.Enabled = false
        // this.posingUnposePart.Enabled = false
        // // called when plant changes
        // this.posedPlantParts = []
        // this.updatePlantNameLabel(kTabPosing)
        // if (this.focusedPlant() === null) {
        //     this.posedPlantParts.Text = ""
        //     this.posedPlantParts.Enabled = false
        // } else {
        //     this.posedPlantParts.Enabled = true
        //     if (this.focusedPlant().amendments.length <= 0) {
        //         // load list of parts with amendments
        //         this.selectedPlantPartID = -1
        //     } else {
        //         for (let i = 0; i <= this.focusedPlant().amendments.length - 1; i++) {
        //             const amendment: PdPlantDrawingAmendment = this.focusedPlant().amendments[i]
        //             const partString = this.partDescriptionForIDAndType(amendment.partID, amendment.typeOfPart)
        //             if (this.posedPlantParts.Items.indexOf(partString) < 0) {
        //                 this.posedPlantParts.Items.Add(partString)
        //             }
        //         }
        //         this.posedPlantParts.Items.Add(kSelectNoPosedPartString)
        //     }
        // }
        // this.internalChange = false
        // this.updatePosingForSelectedPlantPart()
    }
    
    updatePosingForSelectedPlantPart(): void {
        unfinished()
        // // PDF PORT -- removed semicolon from after begin
        // this.internalChange = true
        // if (this.focusedPlant() === null) {
        //     // called when selected part changes
        //     this.selectedPlantPartID = -1
        //     this.selectedPlantPartType = ""
        //     this.selectedPartLabel.Caption = kNoPartSelected
        // }
        // if (this.selectedPlantPartID >= 0) {
        //     const partString = this.partDescriptionForIDAndType(this.selectedPlantPartID, this.selectedPlantPartType)
        //     this.selectedPartLabel.Caption = "Selected part: " + partString
        //     const index = this.posedPlantParts.Items.indexOf(partString)
        //     if (index >= 0) {
        //         this.posedPlantParts.ItemIndex = index
        //     } else {
        //         this.posedPlantParts.ItemIndex = -1
        //     }
        // } else {
        //     this.posedPlantParts.ItemIndex = -1
        //     this.selectedPartLabel.Caption = kNoPartSelected
        // }
        // this.posingPosePart.Enabled = !(this.selectedPartLabel.Caption === kNoPartSelected)
        // this.posingUnposePart.Enabled = false
        // this.internalChange = false
        // this.updatePoseInfo()
    }
    
    updatePoseInfo(): void {
        unfinished()
        // this.internalChange = true
        // let amendment: PdPlantDrawingAmendment | null = null
        // const partID = this.selectedPartIDInAmendedPartsList()
        // if (partID >= 0) {
        //     amendment = this.focusedPlant().amendmentForPartID(partID)
        // }
        // this.posingPosePart.Enabled = (!(this.selectedPartLabel.Caption === kNoPartSelected)) && (amendment === null)
        // this.posingUnposePart.Enabled = (!(this.selectedPartLabel.Caption === kNoPartSelected)) && (!(amendment === null))
        // this.posingDetailsPanel.Visible = amendment !== null
        // if (amendment !== null) {
        //     this.posingHidePart.Checked = amendment.hide
        //     //
        //     //    posingChangeColors.checked := changeColors;
        //     //    posingFrontfaceColor.color := faceColor;
        //     //    posingBackfaceColor.color := BackfaceColor;
        //     //    posingLineColor.color := lineColor;
        //     //    posingChangeAllColorsAfter.checked := propagateColors;
        //     //    
        //     this.posingAddExtraRotation.Checked = amendment.addRotations
        //     this.posingXRotationEdit.Text = IntToStr(intround(amendment.xRotation))
        //     this.posingYRotationEdit.Text = IntToStr(intround(amendment.yRotation))
        //     this.posingZRotationEdit.Text = IntToStr(intround(amendment.zRotation))
        //     this.posingMultiplyScale.Checked = amendment.multiplyScale
        //     this.posingMultiplyScaleAllPartsAfter.Checked = amendment.propagateScale
        //     this.posingScaleMultiplierEdit.Text = IntToStr(amendment.scaleMultiplier_pct)
        //     this.posingLengthMultiplierEdit.Text = IntToStr(amendment.lengthMultiplier_pct)
        //     this.posingWidthMultiplierEdit.Text = IntToStr(amendment.widthMultiplier_pct)
        // }
        // this.internalChange = false
        // this.updateForDependenciesWithinPoseInfo()
    }
    
    updateForDependenciesWithinPoseInfo(): void {
        unfinished()
        // this.internalChange = true
        // this.posingChangeAllColorsAfter.Enabled = this.posingChangeColors.Checked
        // this.posingMultiplyScaleAllPartsAfter.Enabled = this.posingMultiplyScale.Checked
        // this.posingMultiplyScaleAllPartsAfterLabel.Enabled = this.posingMultiplyScaleAllPartsAfter.Enabled
        // //
        // //  posingLineColor.visible := posingChangeColors.checked;
        // //  posingLineColorLabel.enabled := posingChangeColors.checked;
        // //  posingFrontfaceColor.visible := posingChangeColors.checked;
        // //  posingFrontfaceColorLabel.enabled := posingChangeColors.checked;
        // //  posingBackfaceColor.visible := posingChangeColors.checked;
        // //  posingBackfaceColorLabel.enabled := posingChangeColors.checked;
        // //  
        // enableOrDisableSet(this.posingXRotationLabel, this.posingXRotationEdit, this.posingXRotationSpin, null, this.posingAddExtraRotation.Checked)
        // enableOrDisableSet(this.posingYRotationLabel, this.posingYRotationEdit, this.posingYRotationSpin, null, this.posingAddExtraRotation.Checked)
        // enableOrDisableSet(this.posingZRotationLabel, this.posingZRotationEdit, this.posingZRotationSpin, null, this.posingAddExtraRotation.Checked)
        // this.rotationDegreesLabel.Enabled = this.posingAddExtraRotation.Checked
        // enableOrDisableSet(this.posingScaleMultiplierLabel, this.posingScaleMultiplierEdit, this.posingScaleMultiplierSpin, this.posingScaleMultiplierPercent, this.posingMultiplyScale.Checked)
        // enableOrDisableSet(this.posingLengthMultiplierLabel, this.posingLengthMultiplierEdit, this.posingLengthMultiplierSpin, this.posingLengthMultiplierPercent, this.posingMultiplyScale.Checked)
        // enableOrDisableSet(this.posingWidthMultiplierLabel, this.posingWidthMultiplierEdit, this.posingWidthMultiplierSpin, this.posingWidthMultiplierPercent, this.posingMultiplyScale.Checked)
        // this.internalChange = false
    }
    
    redrawAllPlantsInViewWithAmendments(): void {
        if (this.plants.length > 0) {
            for (let i = 0; i <= this.plants.length - 1; i++) {
                const plant = this.plants[i]
                if ((plant !== null) && (plant.amendments !== null) && (plant.amendments.length > 0)) {
                    plant.recalculateBounds(kDrawNow)
                    this.invalidateDrawingRect(plant.boundsRect_pixels())
                }
            }
        }
        this.updateForPossibleChangeToDrawing()
    }
    
    // ------------------------------------------------------------------------------------- *posing - interface 
    posedPlantPartsChange(): void { 
        if (this.internalChange) {
            return
        }
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        let newCommand: PdCommand
        if (this.posedPlantParts.ItemIndex === this.posedPlantParts.Items.Count - 1) {
            newCommand = new PdSelectPosingPartCommand(plant, -1, this.selectedPlantPartID, "", this.selectedPlantPartType)
        } else {
            newCommand = new PdSelectPosingPartCommand(plant, this.selectedPartIDInAmendedPartsList(), this.selectedPlantPartID, this.selectedPartTypeInAmendedPartsList(), this.selectedPlantPartType)
        }
        this.doCommand(newCommand)
    }
    
    /*
    posingFrontfaceColorMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.posingFrontfaceColor.Color = domain.getColorUsingCustomColors(this.posingFrontfaceColor.Color)
        this.changeSelectedPose(this.posingFrontfaceColor)
    }
    
    posingBackfaceColorMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.posingBackfaceColor.Color = domain.getColorUsingCustomColors(this.posingBackfaceColor.Color)
        this.changeSelectedPose(this.posingBackfaceColor)
    }
    
    posingLineColorMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.posingLineColor.Color = domain.getColorUsingCustomColors(this.posingLineColor.Color)
        this.changeSelectedPose(this.posingLineColor)
    }
    
    posingRotationSpinUp(): void {
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinPoseRotationBy((Sender).focusControl, domain.options.rotationIncrement)
        }
    }
    
    posingRotationSpinDown(): void {
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinPoseRotationBy((Sender).focusControl, -domain.options.rotationIncrement)
        }
    }
    
    spinPoseRotationBy(amount: int): void {
        // TODO sender was event or component sending event
        if ((sender !== null) && (sender instanceof delphi_compatability.TEdit)) {
            let newRotation = StrToIntDef((sender).text, 0)
            const oldRotation = newRotation
            newRotation = newRotation + amount
            if (newRotation < -360) {
                newRotation = 360 - (abs(newRotation) - 360)
            }
            if (newRotation > 360) {
                newRotation = -360 + (newRotation - 360)
            }
            if (newRotation !== oldRotation) {
                (sender).text = IntToStr(newRotation)
            }
        }
    }
    
    posingScaleMultiplierSpinUpClick(): void {
        // TODO Sender was event or component sending event
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinScaleMultiplierBy((Sender).focusControl, domain.options.resizeKeyUpMultiplierPercent - 100)
        }
    }
    
    posingScaleMultiplierSpinDownClick(): void {
        // TODO Sender was event or component sending event
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinScaleMultiplierBy((Sender).focusControl, -(domain.options.resizeKeyUpMultiplierPercent - 100))
        }
    }
    
    spinScaleMultiplierBy(amount: int): void {
        // TODO sender was event or component sending event
        if ((sender !== null) && (sender instanceof delphi_compatability.TEdit)) {
            let newValue = StrToIntDef((sender).text, 0)
            const oldValue = newValue
            newValue = newValue + amount
            if (newValue < 0) {
                newValue = 0
            }
            if (newValue > 1000) {
                newValue = 1000
            }
            if (newValue !== oldValue) {
                (sender).text = IntToStr(newValue)
            }
        }
    }
    
    */
    
    // ------------------------------------------------------------------------------------- *posing - commands 
    changeSelectedPose(Sender: any): void {
        unfinished()
        // // TODO sender was event or component sending event
        // if (this.internalChange) {
        //     return
        // }
        // this.updateForDependenciesWithinPoseInfo()
        // const plant = this.focusedPlant()
        // if (plant === null) {
        //     return
        // }
        // // command will take ownership of this and free it if necessary
        // const newAmendment = new PdPlantDrawingAmendment()
        // const partID = this.selectedPartIDInAmendedPartsList()
        // const currentAmendment: PdPlantDrawingAmendment | null = plant.amendmentForPartID(partID)
        // if (currentAmendment === null) {
        //     return
        // }
        // let field: string
        // if ((Sender === this.posingHidePart)) {
        //     field = "hide"
        // } else if ((Sender === this.posingAddExtraRotation)) {
        //     field = "rotate"
        // } else if (((Sender === this.posingXRotationEdit) || (Sender === this.posingXRotationSpin))) {
        //     field = "X rotation"
        // } else if (((Sender === this.posingYRotationEdit) || (Sender === this.posingYRotationSpin))) {
        //     field = "Y rotation"
        // } else if (((Sender === this.posingZRotationEdit) || (Sender === this.posingZRotationSpin))) {
        //     field = "Z rotation"
        // } else if ((Sender === this.posingMultiplyScale)) {
        //     field = "scale"
        // } else if ((Sender === this.posingMultiplyScaleAllPartsAfter)) {
        //     field = "scale above"
        // } else if (((Sender === this.posingScaleMultiplierEdit) || (Sender === this.posingScaleMultiplierSpin))) {
        //     field = "3D object scale"
        // } else if (((Sender === this.posingLengthMultiplierEdit) || (Sender === this.posingLengthMultiplierSpin))) {
        //     field = "line length"
        // } else if (((Sender === this.posingWidthMultiplierEdit) || (Sender === this.posingWidthMultiplierSpin))) {
        //     field = "line width"
        // } else {
        //     field = ""
        // }
        // //   cfk if bring back color finish these
        // //    posingChangeColors: TCheckBox;
        // //    posingChangeAllColorsAfter: TCheckBox;
        // //    posingLineColor: TPanel;
        // //    posingFrontfaceColor: TPanel;
        // //    posingBackfaceColor: TPanel;
        // //    posingLineColorLabel: TLabel;
        // //    posingFrontfaceColorLabel: TLabel;
        // //    posingBackfaceColorLabel: TLabel;
        // //    
        // newAmendment.partID = this.partIDForFullDescription(this.posedPlantParts.Text)
        // newAmendment.typeOfPart = this.partTypeForFullDescription(this.posedPlantParts.Text)
        // newAmendment.hide = this.posingHidePart.Checked
        // //
        // //    changeColors := posingChangeColors.checked;
        // //    faceColor := posingFrontfaceColor.color;
        // //    backfaceColor := posingBackfaceColor.color;
        // //    lineColor := posingLineColor.color;
        // //    propagateColors := posingChangeAllColorsAfter.checked;
        // //    
        // newAmendment.addRotations = this.posingAddExtraRotation.Checked
        // newAmendment.xRotation = intMax(-360, intMin(360, StrToIntDef(this.posingXRotationEdit.Text, intround(currentAmendment.xRotation))))
        // newAmendment.yRotation = intMax(-360, intMin(360, StrToIntDef(this.posingYRotationEdit.Text, intround(currentAmendment.yRotation))))
        // newAmendment.zRotation = intMax(-360, intMin(360, StrToIntDef(this.posingZRotationEdit.Text, intround(currentAmendment.zRotation))))
        // newAmendment.multiplyScale = this.posingMultiplyScale.Checked
        // newAmendment.propagateScale = this.posingMultiplyScaleAllPartsAfter.Checked
        // newAmendment.scaleMultiplier_pct = intMax(0, intMin(1000, StrToIntDef(this.posingScaleMultiplierEdit.Text, currentAmendment.scaleMultiplier_pct)))
        // newAmendment.lengthMultiplier_pct = intMax(0, intMin(1000, StrToIntDef(this.posingLengthMultiplierEdit.Text, currentAmendment.lengthMultiplier_pct)))
        // newAmendment.widthMultiplier_pct = intMax(0, intMin(1000, StrToIntDef(this.posingWidthMultiplierEdit.Text, currentAmendment.widthMultiplier_pct)))
        // const newCommand = new PdEditAmendmentCommand(plant, newAmendment, field)
        // this.doCommand(newCommand)
    }
    
    posingPosePartClick(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        if (this.selectedPlantPartID < 0) {
            return
        }
        if (plant.amendmentForPartID(this.selectedPlantPartID) !== null) {
            // only one amendment per part id
            return
        }
        // command will take ownership of this and free it if necessary
        const newAmendment = new PdPlantDrawingAmendment()
        newAmendment.partID = this.selectedPlantPartID
        newAmendment.typeOfPart = this.selectedPlantPartType
        const newCommand = new PdCreateAmendmentCommand(plant, newAmendment)
        this.doCommand(newCommand)
    }
    
    posingUnposePartClick(): void {
        const plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        const amendment = plant.amendmentForPartID(this.selectedPartIDInAmendedPartsList())
        if (amendment === null) {
            return
        }
        const newCommand = new PdDeleteAmendmentCommand(plant, amendment)
        this.doCommand(newCommand)
    }
    
    addAmendedPartToList(partID: long, partType: string): void {
        const newString: string = this.partDescriptionForIDAndType(partID, partType)
        this.posedPlantParts.Items.Add(newString)
        const indexToSave: int = this.posedPlantParts.Items.Count - 1
        // add "select none" to end - move down if already there
        const selectNoneIndex: int = this.posedPlantParts.Items.indexOf(kSelectNoPosedPartString)
        if (selectNoneIndex >= 0) {
            this.posedPlantParts.Items.Delete(selectNoneIndex)
        }
        this.posedPlantParts.Items.Add(kSelectNoPosedPartString)
        this.posedPlantParts.ItemIndex = indexToSave
        this.updatePosingForSelectedPlantPart()
    }
    
    removeAmendedPartFromList(partID: long, partType: string): void {
        const oldItemIndex: int = this.posedPlantParts.ItemIndex
        const oldString = this.partDescriptionForIDAndType(partID, partType)
        const index: int = this.posedPlantParts.Items.indexOf(oldString)
        if (index >= 0) {
            this.posedPlantParts.Items.Delete(index)
        }
        if (oldItemIndex <= this.posedPlantParts.Items.Count - 1) {
            this.posedPlantParts.ItemIndex = oldItemIndex
        }
        this.updatePosingForSelectedPlantPart()
    }
    
    // ------------------------------------------------------------------------------------- *posing - supporting 
    partDescriptionForIDAndType(id: long, typeName: string): string {
        let result = ""
        return result
    }
    
    partIDForFullDescription(aString: string): long {
        let result = StrToIntDef(stringUpTo(aString, " ("), -1)
        return result
    }
    
    partTypeForFullDescription(aString: string): string {
        let  result = ""
        if (len(aString) <= 0) {
            return result
        }
        result = stringBeyond(aString, "(")
        result = stringUpTo(result, ")")
        return result
    }
    
    selectedPartIDInAmendedPartsList(): long {
        let result = -1
        if ((this.focusedPlant() === null) || (this.posedPlantParts.Items.Count <= 0) || (this.posedPlantParts.ItemIndex < 0)) {
            return result
        }
        result = this.partIDForFullDescription(this.posedPlantParts[this.posedPlantParts.ItemIndex])
        return result
    }
    
    selectedPartTypeInAmendedPartsList(): string {
        let result = ""
        if ((this.focusedPlant() === null) || (this.posedPlantParts.Items.Count <= 0) || (this.posedPlantParts.ItemIndex < 0)) {
            return result
        }
        result = this.partTypeForFullDescription(this.posedPlantParts[this.posedPlantParts.ItemIndex])
        return result
    }
    
    // ------------------------------------------------------------------------------------- *resizing 
    FormResize(): void {
        unfinished()
        // let newTop: short
        // let newLeft: short
        // let newWidth: short
        // let newHeight: short
        // let splitterWidthOrHeight: short
        // let windowLock: boolean
        
        // if (this.WindowState === delphi_compatability.TWindowState.wsMinimized) {
        //     return
        // }
        // if (domain === null) {
        //     return
        // }
        // if (this.drawingBitmap === null) {
        //     return
        // }
        // if (this.selectedPlants === null) {
        //     return
        // }
        // this.horizontalSplitter.Visible = false
        // this.verticalSplitter.Visible = false
        // this.plantListPanel.Visible = false
        // this.plantFocusPanel.Visible = false
        // windowLock = UNRESOLVED.lockWindowUpdate(this.Handle)
        // this.toolbarPanel.SetBounds(0, 0, this.ClientWidth, this.toolbarPanel.Height)
        // //assumes they are equal, I have at 4 now
        // splitterWidthOrHeight = this.verticalSplitter.Width
        // if (this.lastHeight !== 0) {
        //     newTop = intround(1.0 * this.horizontalSplitter.Top * this.ClientHeight / this.lastHeight)
        // } else {
        //     newTop = this.ClientHeight / 2
        // }
        // newTop = intMax(0, intMin(this.ClientHeight - 1, newTop))
        // newHeight = intMax(0, this.ClientHeight - newTop - splitterWidthOrHeight)
        // if (this.lastWidth !== 0) {
        //     newLeft = intround(1.0 * this.verticalSplitter.Left * this.ClientWidth / this.lastWidth)
        // } else {
        //     newLeft = this.ClientWidth / 2
        // }
        // newLeft = intMax(0, intMin(this.ClientWidth - 1, newLeft))
        // newWidth = intMax(0, this.ClientWidth - newLeft - splitterWidthOrHeight)
        // if (domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal) {
        //     this.horizontalSplitter.SetBounds(0, newTop, this.ClientWidth, this.horizontalSplitter.Height)
        //     this.verticalSplitter.SetBounds(newLeft, newTop + this.horizontalSplitter.Height, this.verticalSplitter.Width, newHeight)
        // } else if (domain.options.mainWindowOrientation === kMainWindowOrientationVertical) {
        //     this.verticalSplitter.SetBounds(newLeft, this.toolbarPanel.Height, this.verticalSplitter.Width, intMax(0, this.ClientHeight - this.toolbarPanel.Height))
        //     this.horizontalSplitter.SetBounds(newLeft + this.verticalSplitter.Width, newTop, newWidth, this.horizontalSplitter.Height)
        // }
        // // resize images and panels 
        // this.resizePanelsToHorizontalSplitter()
        // this.resizePanelsToVerticalSplitter()
        // this.lastHeight = this.ClientHeight
        // this.lastWidth = this.ClientWidth
        // if (windowLock) {
        //     UNRESOLVED.lockWindowUpdate(0)
        // }
        // this.horizontalSplitter.Visible = true
        // this.verticalSplitter.Visible = true
        // this.plantListPanel.Visible = true
        // this.plantFocusPanel.Visible = true
    }
    
    // resizing 
    resizePanelsToVerticalSplitter(): void {
        unfinished()
        // let newLeft: short
        // let newWidth: short
        // let newTop: short
        // let newHeight: short
        
        // newLeft = this.verticalSplitter.Left + this.verticalSplitter.Width
        // newWidth = intMax(0, this.ClientWidth - newLeft)
        // newTop = this.horizontalSplitter.Top + this.horizontalSplitter.Height
        // newHeight = intMax(0, this.ClientHeight - newTop)
        // if (domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal) {
        //     this.plantListPanel.SetBounds(0, newTop, this.verticalSplitter.Left, newHeight)
        //     this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        // } else if (domain.options.mainWindowOrientation === kMainWindowOrientationVertical) {
        //     this.plantListPanel.SetBounds(newLeft, this.toolbarPanel.Height, newWidth, this.horizontalSplitter.Top - this.toolbarPanel.Height)
        //     this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        //     //don't change top here
        //     this.horizontalSplitter.SetBounds(newLeft, this.horizontalSplitter.Top, newWidth, this.horizontalSplitter.Height)
        //     this.drawingPaintBox.SetBounds(0, this.toolbarPanel.Height, newLeft, intMax(0, this.ClientHeight - this.toolbarPanel.Height))
        //     this.resizeDrawingBitmapIfNecessary()
        // }
        // this.resizePlantListPanel()
        // this.resizePlantFocusPanel()
    }
    
    resizePanelsToHorizontalSplitter(): void {
        unfinished()
        // let newLeft: short
        // let newWidth: short
        // let newTop: short
        // let newHeight: short
        
        // newLeft = this.verticalSplitter.Left + this.verticalSplitter.Width
        // newWidth = intMax(0, this.ClientWidth - newLeft)
        // newTop = this.horizontalSplitter.Top + this.horizontalSplitter.Height
        // newHeight = intMax(0, this.ClientHeight - newTop)
        // if (domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal) {
        //     this.plantListPanel.SetBounds(0, newTop, this.verticalSplitter.Left, newHeight)
        //     //don't change left here
        //     this.verticalSplitter.SetBounds(this.verticalSplitter.Left, newTop, this.verticalSplitter.Width, newHeight)
        //     this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        //     this.drawingPaintBox.SetBounds(0, this.toolbarPanel.Height, this.ClientWidth, intMax(0, this.horizontalSplitter.Top - this.toolbarPanel.Height))
        //     this.resizeDrawingBitmapIfNecessary()
        // } else if (domain.options.mainWindowOrientation === kMainWindowOrientationVertical) {
        //     this.plantListPanel.SetBounds(newLeft, this.toolbarPanel.Height, newWidth, this.horizontalSplitter.Top - this.toolbarPanel.Height)
        //     this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        // }
        // this.resizePlantListPanel()
        // this.resizePlantFocusPanel()
    }
    
    resizeDrawingBitmapIfNecessary(): void {
        unfinished()
        // let bitmapWasMadeBigger: boolean
        
        // if ((this.drawingBitmap.Width !== this.drawingPaintBox.Width) || (this.drawingBitmap.Height !== this.drawingPaintBox.Height)) {
        //     // if have to make bitmap larger, redraw all plants in case some were not drawing before
        //     // because they were off the bitmap
        //     bitmapWasMadeBigger = (this.drawingPaintBox.Width > this.drawingBitmap.Width) || (this.drawingPaintBox.Height > this.drawingBitmap.Height)
        //     ubmpsupport.resizeBitmap(this.drawingBitmap, Point(this.drawingPaintBox.Width, this.drawingPaintBox.Height))
        //     if (!this.inFormCreation) {
        //         if (bitmapWasMadeBigger) {
        //             this.recalculateAllPlantBoundsRects(kDontDrawYet)
        //         }
        //         this.invalidateEntireDrawing()
        //         this.updateForPossibleChangeToDrawing()
        //     }
        // }
    }
    
    resizePlantListPanel(): void {
        unfinished()
        // this.plantListDrawGrid.SetBounds(0, 0, this.plantListPanel.Width, this.plantListPanel.Height - this.plantFileChangedImage.Height - kBetweenGap * 2)
        // this.plantListDrawGrid.DefaultColWidth = this.plantListDrawGrid.ClientWidth
        // this.plantFileChangedImage.SetBounds(kBetweenGap, this.plantListDrawGrid.Top + this.plantListDrawGrid.Height + kBetweenGap, this.plantFileChangedImage.Width, this.plantFileChangedImage.Height)
        // this.plantBitmapsIndicatorImage.SetBounds(this.plantFileChangedImage.Left + this.plantFileChangedImage.Width + kBetweenGap, this.plantFileChangedImage.Top, this.plantBitmapsIndicatorImage.Width, this.plantBitmapsIndicatorImage.Height)
        // this.progressPaintBox.SetBounds(this.plantBitmapsIndicatorImage.Left + this.plantBitmapsIndicatorImage.Width + kBetweenGap, this.plantBitmapsIndicatorImage.Top + this.plantBitmapsIndicatorImage.Height / 2 - this.progressPaintBox.Height / 2, this.plantListPanel.Width - this.plantFileChangedImage.Width - this.plantBitmapsIndicatorImage.Width - kBetweenGap * 4, this.progressPaintBox.Height)
    }
    
    resizePlantFocusPanel(): void {
        unfinished()
        // let newTop: int
        
        // //FIX unresolved WITH expression: self.tabSet
        // // tab set 
        // this.SetBounds(0, this.plantFocusPanel.Height - this.Height, this.plantFocusPanel.Width, this.Height)
        // // v1.4 change
        // this.animatingLabel.SetBounds(intMax(0, this.plantFocusPanel.Width - this.animatingLabel.Width - kBetweenGap), this.plantFocusPanel.Height - this.animatingLabel.Height - kBetweenGap, this.animatingLabel.Width, this.animatingLabel.Height)
        // // life cycle panel 
        // this.lifeCyclePanel.SetBounds(0, 0, this.plantFocusPanel.Width, intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        // // v1.4 change - 2
        // this.lifeCycleEditPanel.Height = this.animateGrowth.Height + kBetweenGap * 2 - 2
        // // v1.4 change +1, -1, -2
        // this.lifeCycleEditPanel.SetBounds(1, intMax(0, this.lifeCyclePanel.Height - this.lifeCycleEditPanel.Height - 1), this.lifeCyclePanel.Width - 2, this.lifeCycleEditPanel.Height)
        // // rotations panel
        // this.rotationsPanel.SetBounds(0, 0, this.lifeCyclePanel.Width, this.lifeCyclePanel.Height)
        // // posing panel
        // this.posingPanel.SetBounds(0, 0, this.lifeCyclePanel.Width, this.lifeCyclePanel.Height)
        // newTop = this.posingPlantName.Top + this.posingPlantName.Height + kBetweenGap
        // this.posingNotShown.SetBounds(this.posingPanel.Width - this.posingNotShown.Width - kBetweenGap, newTop, this.posingNotShown.Width, this.posingNotShown.Height)
        // this.posingGhost.SetBounds(this.posingNotShown.Left - this.posingGhost.Width - kBetweenGap, newTop, this.posingGhost.Width, this.posingGhost.Height)
        // this.posingHighlight.SetBounds(this.posingGhost.Left - this.posingHighlight.Width - kBetweenGap, newTop, this.posingHighlight.Width, this.posingHighlight.Height)
        // newTop = this.posingNotShown.Top + this.posingNotShown.Height + kBetweenGap
        // this.posedPartsLabel.SetBounds(kBetweenGap, newTop + (this.posedPlantParts.Height / 2 - this.posedPartsLabel.Height / 2), this.posedPartsLabel.Width, this.posedPartsLabel.Height)
        // this.posedPlantParts.SetBounds(this.posedPartsLabel.Left + this.posedPartsLabel.Width + kBetweenGap, newTop, intMax(10, this.posingPanel.Width - this.posedPartsLabel.Width - kBetweenGap * 3), this.posedPlantParts.Height)
        // newTop = this.posedPlantParts.Top + this.posedPlantParts.Height + kBetweenGap
        // // fix later
        // this.selectedPartLabel.SetBounds(kBetweenGap, newTop + (this.posingUnposePart.Height / 2 - this.selectedPartLabel.Height / 2), this.selectedPartLabel.Width, this.selectedPartLabel.Height)
        // newTop = this.selectedPartLabel.Top + this.selectedPartLabel.Height + kBetweenGap
        // this.posingPosePart.SetBounds(kBetweenGap, newTop, this.posingPosePart.Width, this.posingPosePart.Height)
        // this.posingUnposePart.SetBounds(this.posingPosePart.Left + this.posingPosePart.Width + kBetweenGap, newTop, this.posingUnposePart.Width, this.posingUnposePart.Height)
        // newTop = this.posingUnposePart.Top + this.posingUnposePart.Height + kBetweenGap
        // this.posingDetailsPanel.SetBounds(0, newTop, this.lifeCyclePanel.Width, intMax(230, this.lifeCyclePanel.Height - newTop))
        // // lifeCycleEditPanel 
        // this.lifeCycleDaysEdit.SetBounds(this.ageAndSizeLabel.Width + kBetweenGap * 2, kBetweenGap, this.lifeCycleDaysEdit.Width, this.lifeCycleDaysEdit.Height)
        // this.lifeCycleDaysSpin.SetBounds(this.lifeCycleDaysEdit.Left + this.lifeCycleDaysEdit.Width, kBetweenGap + this.lifeCycleDaysEdit.Height / 2 - this.lifeCycleDaysSpin.Height / 2, this.lifeCycleDaysSpin.Width, this.lifeCycleDaysSpin.Height)
        // this.ageAndSizeLabel.SetBounds(kBetweenGap, intMax(0, this.lifeCycleDaysEdit.Top + this.lifeCycleDaysEdit.Height / 2 - this.ageAndSizeLabel.Height / 2), this.ageAndSizeLabel.Width, this.ageAndSizeLabel.Height)
        // this.daysAndSizeLabel.SetBounds(this.lifeCycleDaysSpin.Left + this.lifeCycleDaysSpin.Width + kBetweenGap, intMax(0, this.lifeCycleDaysEdit.Top + this.lifeCycleDaysEdit.Height / 2 - this.daysAndSizeLabel.Height / 2), this.daysAndSizeLabel.Width, this.daysAndSizeLabel.Height)
        // this.animateGrowth.SetBounds(this.lifeCycleEditPanel.Width - this.animateGrowth.Width - kBetweenGap, this.lifeCycleDaysEdit.Top, this.animateGrowth.Width, this.animateGrowth.Height)
        // // above lifeCycleEditPanel 
        // this.timeLabel.SetBounds(intMax(0, this.lifeCyclePanel.Width / 2 - this.timeLabel.Width / 2), intMax(0, this.lifeCycleEditPanel.Top - this.timeLabel.Height - kBetweenGap), this.timeLabel.Width, this.timeLabel.Height)
        // this.lifeCycleGraphImage.SetBounds(kBetweenGap + this.maxSizeAxisLabel.Width + kBetweenGap, intMax(1, this.selectedPlantNameLabel.Top + this.selectedPlantNameLabel.Height + kBetweenGap), intMax(1, this.lifeCyclePanel.Width - this.maxSizeAxisLabel.Width - kBetweenGap * 3), intMax(1, this.timeLabel.Top - this.selectedPlantNameLabel.Height - kBetweenGap * 2))
        // this.maxSizeAxisLabel.SetBounds(kBetweenGap, intMax(0, this.lifeCycleGraphImage.Top + this.lifeCycleGraphImage.Height / 2 - this.maxSizeAxisLabel.Height / 2), this.maxSizeAxisLabel.Width, this.maxSizeAxisLabel.Height)
        // this.selectedPlantNameLabel.SetBounds(kBetweenGap, kBetweenGap, this.selectedPlantNameLabel.Width, this.selectedPlantNameLabel.Height)
        // if ((this.lifeCycleGraphImage.Picture.Bitmap.Width !== this.lifeCycleGraphImage.Width) || (this.lifeCycleGraphImage.Picture.Bitmap.Height !== this.lifeCycleGraphImage.Height)) {
        //     // with selectedPlantNameLabel do setBounds(lifeCycleGraphImage.left, kBetweenGap, width, height);
        //     ubmpsupport.resizeBitmap(this.lifeCycleGraphImage.Picture.Bitmap, Point(this.lifeCycleGraphImage.Width, this.lifeCycleGraphImage.Height))
        // }
        // this.placeLifeCycleDragger()
        // this.redrawLifeCycleGraph()
        // this.resizeParametersPanel()
        // // stats scroll box 
        // this.statsScrollBox.SetBounds(0, 0, this.plantFocusPanel.Width, intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        // this.statsPanel.resizeElements()
        // this.notePanel.SetBounds(0, 0, this.plantFocusPanel.Width, intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        // this.noteLabel.SetBounds(kBetweenGap, kBetweenGap, this.noteLabel.Width, this.noteLabel.Height)
        // //kBetweenGap + noteEdit.height div 2 - height div 2, width, height);
        // this.noteEdit.SetBounds(intMax(0, this.notePanel.Width - this.noteEdit.Width - kBetweenGap), kBetweenGap, this.noteEdit.Width, this.noteEdit.Height)
        // this.noteMemo.SetBounds(0, this.noteEdit.Height + kBetweenGap * 2, this.notePanel.Width, intMax(0, this.notePanel.Height - this.noteEdit.Height - kBetweenGap * 2))
    }
    
    resizeParametersPanel(): void {
        unfinished()
        // let newTop: short
        
        // this.parametersPanel.SetBounds(0, 0, this.plantFocusPanel.Width, intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        // this.parametersPlantName.SetBounds(kBetweenGap, kBetweenGap, this.parametersPlantName.Width, this.parametersPlantName.Height)
        // this.sectionsComboBox.SetBounds(kBetweenGap, this.parametersPlantName.Top + this.parametersPlantName.Height + kBetweenGap, this.parametersPanel.Width - kBetweenGap * 2, this.sectionsComboBox.Height)
        // const newTop = this.sectionsComboBox.Top + this.sectionsComboBox.Height + kBetweenGap
        // this.parametersScrollBox.SetBounds(0, this.sectionsComboBox.Top + this.sectionsComboBox.Height + kBetweenGap, this.parametersPanel.Width, this.parametersPanel.Height - newTop)
        // this.repositionParameterPanels()
    }
    
    placeLifeCycleDragger(): void {
        unfinished()
        // const firstPlant = this.focusedPlant()
        // let fractionOfMaxAge = 0.0
        // if (firstPlant !== null) {
        //     try {
        //         fractionOfMaxAge = firstPlant.age / firstPlant.pGeneral.ageAtMaturity
        //     } catch (e) {
        //         fractionOfMaxAge = 0.0
        //     }
        // }
        // this.lifeCycleDragger.SetBounds(this.lifeCycleGraphImage.Left + intround((this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width) * fractionOfMaxAge), this.lifeCycleGraphImage.Top + 1, this.lifeCycleDragger.Width, this.lifeCycleGraphImage.Height - 2)
    }
    
    WMGetMinMaxInfo(MSG: any): void {
        unfinished()
        // PdForm.prototype.WMGetMinMaxInfo.call(this)
        // //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        // UNRESOLVED.ptMinTrackSize.x = 300
        // UNRESOLVED.ptMinTrackSize.y = 300
    }
    
    /*

    // ------------------------------------------------------------------------------------- *splitting 
    horizontalSplitterMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        unfinished()
        this.horizontalSplitterDragging = true
        this.horizontalSplitterStartPos = Y
        this.horizontalSplitterLastDrawPos = -1
        this.horizontalSplitterNeedToRedraw = true
    }
    
    horizontalSplitterMouseMove(Shift: TShiftState, X: int, Y: int): void {
        if (domain === null) {
            return
        }
        let bottomLimit: int
        if (domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal) {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        } else if (domain.options.mainWindowOrientation === kMainWindowOrientationVertical) {
            bottomLimit = kSplitterDragToBottomMinPixelsInVertMode
        } else {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        }
        if (this.horizontalSplitterDragging && (this.horizontalSplitter.Top + Y >= kSplitterDragToTopMinPixels) && (this.horizontalSplitter.Top + Y < this.ClientHeight - bottomLimit)) {
            this.undrawHorizontalSplitterLine()
            this.horizontalSplitterLastDrawPos = this.drawHorizontalSplitterLine(Y)
        }
    }
    
    horizontalSplitterMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (domain === null) {
            return
        }
        let bottomLimit: int
        if (domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal) {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        } else if (domain.options.mainWindowOrientation === kMainWindowOrientationVertical) {
            bottomLimit = kSplitterDragToBottomMinPixelsInVertMode
        } else {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        }
        if (this.horizontalSplitterDragging) {
            this.undrawHorizontalSplitterLine()
            this.horizontalSplitter.Top = this.horizontalSplitter.Top - (this.horizontalSplitterStartPos - Y)
            if (this.horizontalSplitter.Top < kSplitterDragToTopMinPixels) {
                this.horizontalSplitter.Top = kSplitterDragToTopMinPixels
            }
            if (this.horizontalSplitter.Top > this.ClientHeight - bottomLimit) {
                this.horizontalSplitter.Top = this.ClientHeight - bottomLimit
            }
            this.resizePanelsToHorizontalSplitter()
            this.horizontalSplitterDragging = false
        }
    }
    
    // splitting 
    drawHorizontalSplitterLine(pos: int): int {
        const theDC: HDC = UNRESOLVED.getDC(0)
        const result = this.ClientOrigin.Y + this.horizontalSplitter.Top + pos + 2
        UNRESOLVED.patBlt(theDC, this.ClientOrigin.X + this.horizontalSplitter.Left, result, this.horizontalSplitter.Width, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.horizontalSplitterNeedToRedraw = true
        return result
    }
    
    undrawHorizontalSplitterLine(): void {
        if (!this.horizontalSplitterNeedToRedraw) {
            return
        }
        const theDC: HDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.ClientOrigin.X + this.horizontalSplitter.Left, this.horizontalSplitterLastDrawPos, this.horizontalSplitter.Width, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.horizontalSplitterNeedToRedraw = false
    }
    
    verticalSplitterMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.verticalSplitterDragging = true
        this.verticalSplitterStartPos = X
        this.verticalSplitterLastDrawPos = -1
        this.verticalSplitterNeedToRedraw = true
    }
    
    verticalSplitterMouseMove(Shift: TShiftState, X: int, Y: int): void {
        if (this.verticalSplitterDragging && (this.verticalSplitter.Left + X >= kSplitterDragToLeftMinPixels) && (this.verticalSplitter.Left + X < this.ClientWidth - kSplitterDragToRightMinPixels)) {
            this.undrawVerticalSplitterLine()
            this.verticalSplitterLastDrawPos = this.drawVerticalSplitterLine(X)
        }
    }
    
    verticalSplitterMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (this.verticalSplitterDragging) {
            this.undrawVerticalSplitterLine()
            this.verticalSplitter.Left = this.verticalSplitter.Left - (this.verticalSplitterStartPos - X)
            if (this.verticalSplitter.Left < kSplitterDragToLeftMinPixels) {
                this.verticalSplitter.Left = kSplitterDragToLeftMinPixels
            }
            if (this.verticalSplitter.Left > this.ClientWidth - kSplitterDragToRightMinPixels) {
                this.verticalSplitter.Left = this.ClientWidth - kSplitterDragToRightMinPixels
            }
            this.resizePanelsToVerticalSplitter()
            this.verticalSplitterDragging = false
        }
    }
    
    drawVerticalSplitterLine(pos: int): int {
        const theDC: HDC = UNRESOLVED.getDC(0)
        let result = this.ClientOrigin.X + this.verticalSplitter.Left + pos + 2
        UNRESOLVED.patBlt(theDC, result, this.ClientOrigin.Y + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.verticalSplitterNeedToRedraw = true
        return result
    }
    
    undrawVerticalSplitterLine(): void { 
        if (!this.verticalSplitterNeedToRedraw) {
            return
        }
        const theDC: HDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.verticalSplitterLastDrawPos, this.ClientOrigin.Y + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.verticalSplitterNeedToRedraw = false
    }
    
    FormShow(): void {
        UNRESOLVED.DragAcceptFiles(this.Handle, true)
    }
    
    */

    // v1.11
    Reconcile3DObjects1Click(): void {
        unfinished()
        // if (this.plantFileChanged) {
        //     // ask if want to save file first
        //     const response = MessageDialog("Do you want to save your changes to " + ExtractFileName(domain.plantFileName) + chr(13) + "before you reconcile its 3D objects" + chr(13) + "with those in the current 3D object file?", mtConfirmation, mbYesNoCancel, 0)
        //     switch (response) {
        //         case IDCANCEL:
        //             return
        //             break
        //         case IDYES:
        //             this.MenuFileSaveClick()
        //             break
        //         case IDNO:
        //             break
        //     }
        // }
        // if (!domain.checkForExistingDefaultTdoLibrary()) {
        //     return
        // }
        // if (MessageDialog("You are about to add any 3D objects in the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "that are not already in the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ")" + chr(13) + chr(13) + "into that library. Do you want to go ahead?", mtConfirmation, mbYesNo, 0) === IDYES) {
        //     const numTdosAdded = domain.plantManager.reconcileFileWithTdoLibrary(domain.plantFileName, domain.defaultTdoLibraryFileName)
        //     if (numTdosAdded <= 0) {
        //         MessageDialog("All the 3D objects in the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "were already in the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ").", mtInformation, {mbOK, }, 0)
        //     } else {
        //         MessageDialog(IntToStr(numTdosAdded) + " 3D objects from the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "were copied to the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ").", mtInformation, {mbOK, }, 0)
        //     }
        // }
    }
    
    // v1.60
    // end v1.11
    // v1.60 recent files menu
    // PDF PORT removed empty parens
    updateFileMenuForOtherRecentFiles(): void {
        unfinished()
        // let atLeastOneFileNameExists = false
        // let numSet = 0
        // for (let i = 0; i <= kMaxRecentFiles - 1; i++) {
        //     let shortcutString: string
        //     if (numSet + 1 === 10) {
        //         shortcutString = "1&0"
        //     } else {
        //         shortcutString = "&" + IntToStr(numSet + 1)
        //     }
        //     this.MenuFileReopen.items[i].caption = shortcutString + " " + domain.options.recentFiles[kMaxRecentFiles - 1 - i]
        //     const showThis = (domain.options.recentFiles[kMaxRecentFiles - 1 - i] !== "") && (FileExists(domain.options.recentFiles[kMaxRecentFiles - 1 - i]))
        //     this.MenuFileReopen.items[i].visible = showThis
        //     if (showThis) {
        //         numSet += 1
        //     }
        //     if (!atLeastOneFileNameExists) {
        //         atLeastOneFileNameExists = showThis
        //     }
        // }
        // this.MenuFileReopen.enabled = atLeastOneFileNameExists
    }
    
    // v1.60 recent files menu
    Recent0Click(): void {
        unfinished()
        // const index = kMaxRecentFiles - 1 - this.MenuFileReopen.indexOf(Sender)
        // if (!FileExists(domain.options.recentFiles[index])) {
        //     MessageDialog("Cannot find the file" + chr(13) + domain.options.recentFiles[index] + ".", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        //     return
        // }
        // if (!this.askForSaveAndProceed()) {
        //     return
        // }
        // this.openFile(domain.options.recentFiles[index])
    }

    // TODO: Temp definitions to get PdPlant  to compile
    startDrawProgress = (totalPlantParts: number) => {}
    finishDrawProgress = () => {}
    plantsAsTextMemo = <string[]>[]

    // TODO: Temp defintions used by PdTraverser
    showDrawProgress = (value: number) => {}

    // TODO: PDF fix tabSet stub
    tabSet: any = {}
    lifeCycleDaysEdit: any = {}
    xLocationEdit: any = {}
    yLocationEdit: any = {}
    xRotationEdit: any = {}
    yRotationEdit: any = {}
    zRotationEdit: any = {}
    drawingScaleEdit: any = {}
    noteMemo: any = {}
    notePanel: any = {}
    statPanel: any = {}
    posedPlantParts: any = {}

    // TODO: Other definitions uses by other modules
    // doCommand = (command: PdCommand) => {}
    // // UNNEEDED: updateMenusForUndoRedo = () => {}
    // // UNNEEDED: MenuEditUndoClick = (Sender: any) => {}
    // // UNNEEDED: MenuEditRedoClick = (Sender: any) => {}
    // // UNNEEDED: updatePasteMenuForClipboardContents = () => {}
    // standardPastePosition = () => new TPoint()
    // invalidateDrawingRect(rect: TRect) {}
    // updatePoseInfo() {}
    // updateForChangeToPlantSelections() {}
    // invalidateEntireDrawing() {}
    // recalculateAllPlantBoundsRectsForOffsetChange() {}
    // updateForChangeToSelectedPlantsDrawingScale() {}

    oninit() {
        this.drawingBitmap.width = 800
        this.drawingBitmap.height = 600
        // this.drawingPaintBox.width = 800
        // this.drawingPaintBox.height = 600
        setMainForm(this)
        setMainFormForCommands(this)
    }

    havePlants() : boolean {
        return this.plants.length > 0
    }

    haveSelectedPlants() : boolean {
        return this.selectedPlants.length > 0
    }

    haveMoreThanOnSelectedPlant(): boolean {
        return this.selectedPlants.length > 1
    }

    haveUnselectedPlants() : boolean {
        return this.selectedPlants.length < this.plants.length
    }

    haveClipboardText(): boolean {
        // TODO PDF: Fix this
        return false
    }

    havePrivateClipboardPlants(): boolean {
        // TODO PDF: Fix this
        return false
    }

    menuUndoCaption(): string {
        if (this.commandList.isUndoEnabled()) {
            return "&Undo " + this.commandList.undoDescription()
        } else {
            return "Can't undo"
        }
    }

    menuRedoCaption(): string {
        if (this.commandList.isRedoEnabled()) {
            return "&Redo " + this.commandList.redoDescription()
        } else {
            return "Can't redo"
        }
    }

    mainMenuSpec: any = [
        // [type = radio/checkbox, ] ID, label, items or action [, checked function][, enabled function]
        "MenuFile", "&File", [
            "MenuFileNew", "&New", this.MenuFileNewClick, () => false, () => domain.plantFileLoaded,
            "MenuFileOpen", "&Open...", this.MenuFileOpenClick,
            // "MenuFileReopen", "&Reopen", [
            //     "Recent0", "0", this.Recent0Click,
            //     "Recent1", "1", this.Recent0Click,
            //     "Recent2", "2", this.Recent0Click,
            //     // "Recent3", "3", this.Recent0Click,
            //     // "Recent4", "4", this.Recent0Click,
            //     // "Recent5", "5", this.Recent0Click,
            //     // "Recent6", "6", this.Recent0Click,
            //     // "Recent7", "7", this.Recent0Click,
            //     // "Recent8", "8", this.Recent0Click,
            //     // "Recent9", "9", this.Recent0Click,
            // ],
            "MenuFileClose", "&Close", this.MenuFileCloseClick, () => false, () => domain.plantFileLoaded,
            "-",
            "MenuFileSave", "&Save", this.MenuFileSaveClick, () => false, () => this.havePlants(),
            "MenuFileSaveAs", "Save &As...", this.MenuFileSaveAsClick, () => false, () => this.havePlants(),
            "-",
            "MenuFilePrintDrawing", "&Print Picture...", this.MenuFilePrintDrawingClick, () => false, () => this.havePlants(),
            "-",
            "MenuFileExit", "E&xit", this.MenuFileExitClick,
        ],
        "MenuEdit", "&Edit", [
            "MenuEditUndo", () => this.menuUndoCaption(), this.MenuEditUndoClick, () => false, () => this.commandList.isUndoEnabled(),
            "MenuEditRedo", () => this.menuRedoCaption(), this.MenuEditRedoClick, () => false, () => this.commandList.isRedoEnabled(),
            "UndoMenuEditUndoRedoList", "Undo/Redo &List...", this.UndoMenuEditUndoRedoListClick,
            "-",
            "MenuEditCut", "&Cut", this.MenuEditCutClick, () => false, () => this.haveSelectedPlants(),
            "MenuEditCopy", "C&opy", this.MenuEditCopyClick, () => false, () => this.haveSelectedPlants(),
            "MenuEditPaste", "&Paste", this.MenuEditPasteClick, () => false, () => this.havePrivateClipboardPlants(),
            "MenuEditDelete", "&Delete", this.MenuEditDeleteClick, () => false, () => this.haveSelectedPlants(),
            "MenuEditDuplicate", "Duplic&ate", this.MenuEditDuplicateClick, () => false, () => this.haveSelectedPlants(),
            "-",
            "MenuLayoutSelectAll", "Select &All", this.MenuLayoutSelectAllClick, () => false, () => this.havePlants() && this.haveUnselectedPlants(),
            "MenuLayoutDeselect", "Select &None", this.MenuLayoutDeselectClick, () => false, () => this.haveSelectedPlants(),
            "-",
            "MenuEditCopyDrawing", "Copy P&icture", this.MenuEditCopyDrawingClick, () => false, () => this.havePlants(),
            "MenuEditCopyAsText", "Copy &To Text", this.MenuEditCopyAsTextClick, () => false, () => this.haveSelectedPlants(),
            "MenuEditPasteAsText", "Paste &From Text", this.MenuEditPasteAsTextClick, () => false, () => this.haveClipboardText() && domain.plantFileLoaded,
            "-",
            "MenuEditPreferences", "Pr&eferences...", this.MenuEditPreferencesClick,
        ],
        "MenuPlant", "&Plant", [
            "MenuPlantNew", "Create &New...", this.MenuPlantNewClick,
            "MenuPlantNewUsingLastWizardSettings", "Create Same as &Last", this.MenuPlantNewUsingLastWizardSettingsClick, () => false, () => domain.plantFileLoaded,
            "-",
            "MenuPlantRandomize", "&Randomize", this.MenuPlantRandomizeClick, () => false, () => this.haveSelectedPlants(),
            "MenuPlantZeroRotations", "Re&set Rotations", this.MenuPlantZeroRotationsClick, () => false, () => this.haveSelectedPlants(),
            "-",
            "MenuPlantRename", "R&ename...", this.MenuPlantRenameClick, () => false, () => this.haveSelectedPlants(),
            "MenuPlantEditNote", "E&dit Note...", this.MenuPlantEditNoteClick, () => false, () => this.haveSelectedPlants(),
            "-",
            "MenuPlantAnimate", () => this.animateCommand ? "Stop &Animate through Life Cycle" : "&Animate through Life Cycle", this.MenuPlantAnimateClick, () => false, () => this.haveSelectedPlants(),
            "MenuPlantBreed", "&Breed", this.MenuPlantBreedClick, () => false, () => this.haveSelectedPlants(),
            "MenuPlantMakeTimeSeries", "Make &Time Series", this.MenuPlantMakeTimeSeriesClick, () => false, () => this.haveSelectedPlants(),

        ],
        "MenuLayout", "&Layout", [
            "MenuLayoutScaleToFit", "Scale to &Fit", this.MenuLayoutScaleToFitClick, () => false, () => this.havePlants(),
            "MenuLayoutAlign", "A&lign", [
                "MenuLayoutAlignTops", "&Tops", this.MenuLayoutAlignTopsClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
                "MenuLayoutAlignBottoms", "&Bottoms", this.MenuLayoutAlignBottomsClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
                "MenuLayoutAlignLeftSides", "&Left Sides", this.MenuLayoutAlignLeftSidesClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
                "MenuLayoutAlignRightSides", "&Right Sides", this.MenuLayoutAlignRightSidesClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
                "MenuLayoutMakeBouquet", "Make into Bou&quet", this.MenuLayoutMakeBouquetClick, () => false, 
                    () => this.haveMoreThanOnSelectedPlant() && !domain.viewPlantsInMainWindowOnePlantAtATime(),
            ], () => false, () => this.haveMoreThanOnSelectedPlant(),
            "MenuLayoutSize", "Si&ze", [
                "MenuLayoutSizeSameWidth", "Equal &Width", this.MenuLayoutSizeSameWidthClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
                "MenuLayoutSizeSameHeight", "Equal &Height", this.MenuLayoutSizeSameHeightClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
            ], () => false, () => this.haveMoreThanOnSelectedPlant(),
            "MenuLayoutPack", "&Pack", this.MenuLayoutPackClick, () => false, () => this.haveMoreThanOnSelectedPlant(),
            "-",
            "MenuLayoutBringForward", "Bring Fo&rward", this.MenuLayoutBringForwardClick, () => false, () => this.haveSelectedPlants() && this.haveUnselectedPlants(),
            "MenuLayoutSendBack", "Send &Back", this.MenuLayoutSendBackClick, () => false, () => this.haveSelectedPlants() && this.haveUnselectedPlants(),
            "-",
            "MenuLayoutShow", "&Show", this.MenuLayoutShowClick, () => false, () => this.haveSelectedPlants(),
            "MenuLayoutHide", "&Hide", this.MenuLayoutHideClick, () => false, () => this.haveSelectedPlants(),
            "MenuLayoutHideOthers", "Hide &Others", this.MenuLayoutHideOthersClick, () => false, () => this.haveMoreThanOnSelectedPlant() && !domain.viewPlantsInMainWindowOnePlantAtATime() && this.haveUnselectedPlants(),
        ],
        "MenuFileExport", "&Export", [
            "MenuPlantExportTo3DS", "&3DS...", this.MenuPlantExportTo3DSClick, () => false, () => this.havePlants(),
            "MenuPlantExportToLWO", "&LWO...", this.MenuPlantExportToLWOClick, () => false, () => this.havePlants(),
            "MenuPlantExportToOBJ", "&OBJ...", this.MenuPlantExportToOBJClick, () => false, () => this.havePlants(),
            "MenuPlantExportToDXF", "&DXF...", this.MenuPlantExportToDXFClick, () => false, () => this.havePlants(),
            "MenuPlantExportToPOV", "PO&V INC...", this.MenuPlantExportToPOVClick, () => false, () => this.havePlants(),
            "MenuPlantExportToVRML", "V&RML...", this.MenuPlantExportToVRMLClick, () => false, () => this.havePlants(),
            "-",
            "MenuFileSaveDrawingAs", "&Bitmap...", this.MenuFileSaveDrawingAsClick, () => false, () => this.havePlants(),
            "MenuFileSaveJPEG", "&JPEG...", this.MenuFileSaveJPEGClick, () => false, () => this.havePlants(),
            "MenuFileMakePainterNozzle", "&Nozzle/Tube Bitmap...", this.MenuFileMakePainterNozzleClick, () => false, () => this.havePlants(),
            "MenuFileMakePainterAnimation", "&Animation Files...", this.MenuFileMakePainterAnimationClick, () => false, () => this.haveSelectedPlants(),
        ],
        "MenuOptions", "&Options", [
            "MenuOptionsDrawAs", "&Draw Using", [
                "radio", "MenuOptionsFastDraw", "&Bounding Boxes", this.MenuOptionsFastDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawFast,
                "radio", "MenuOptionsMediumDraw", "&Wire Frames", this.MenuOptionsMediumDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawMedium,
                "radio", "MenuOptionsBestDraw", "&Solids", this.MenuOptionsBestDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawBest,
                "radio", "MenuOptionsCustomDraw", "&Custom...", this.MenuOptionsCustomDrawClick, () => domain.options.drawSpeed === DrawMode.kDrawCustom,
            ],
            "MenuLayoutView", "&View What Plants", [
                "radio", "MenuLayoutViewFreeFloating", "&All Plants", this.MenuLayoutViewFreeFloatingClick, () => domain.viewPlantsInMainWindowFreeFloating(), () => domain.plantFileLoaded,
                "radio", "MenuLayoutViewOnePlantAtATime", "&One Plant at a Time", this.MenuLayoutViewOnePlantAtATimeClick, () => domain.viewPlantsInMainWindowOnePlantAtATime(), () => domain.plantFileLoaded,
            ], () => false,  () => domain.plantFileLoaded,
            "MenuLayoutDrawingAreaOn", "Place Drawing &Area", [
                "radio", "MenuLayoutHorizontalOrientation", "On &Top", this.MenuLayoutHorizontalOrientationClick, () => domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal, () => domain.plantFileLoaded,
                "radio", "MenuLayoutVerticalOrientation", "On &Left Side", this.MenuLayoutVerticalOrientationClick, () => domain.options.mainWindowOrientation === kMainWindowOrientationVertical, () => domain.plantFileLoaded,
            ], () => false,  () => domain.plantFileLoaded,
            "MenuOptionsDrawRectangles", "Draw &Rectangles", [
                "checkbox", "MenuOptionsShowSelectionRectangles", "Around &Selected Plants", this.MenuOptionsShowSelectionRectanglesClick, () => domain.options.showSelectionRectangle,
                "checkbox", "MenuOptionsShowBoundsRectangles", "Around &All Plants", this.MenuOptionsShowBoundsRectanglesClick, () => domain.options.showBoundsRectangle,
            ],
            "MenuOptionsPosing", "&Posing", [
                "checkbox", "MenuOptionsHighlightPosedParts", "&Highlight Posed Parts", this.MenuOptionsHighlightPosedPartsClick, () => domain.options.showHighlightingForNonHiddenPosedParts,
                "checkbox", "MenuOptionsGhostHiddenParts", "&Ghost Hidden Parts", this.MenuOptionsGhostHiddenPartsClick, () => domain.options.showGhostingForHiddenParts,
                "checkbox", "MenuOptionsHidePosing", "&Ignore All Posing", this.MenuOptionsHidePosingClick, () => !domain.options.showPosingAtAll,
            ],
            "MenuOptionsHints", "&Hints", [
                "checkbox", "MenuOptionsShowLongButtonHints", "Show Long Button &Hints", this.MenuOptionsShowLongButtonHintsClick, () => domain.options.showLongHintsForButtons,
                "checkbox", "MenuOptionsShowParameterHints", "Show Para&meter Hints", this.MenuOptionsShowParameterHintsClick, () => domain.options.showHintsForParameters,
            ],
            "-",
            "checkbox", "MenuOptionsUsePlantBitmaps", "Use Plant &Bitmaps", this.MenuOptionsUsePlantBitmapsClick, () => domain.options.cachePlantBitmaps,
        ],
        "MenuWindow", "&Window", [
            "MenuWindowBreeder", "&Breeder", this.MenuWindowBreederClick,
            "MenuWindowTimeSeries", "&Time Series", this.MenuWindowTimeSeriesClick,
            "-",
            "MenuFileMove", "&Move", [
                "MenuFilePlantMover", "&Plant Mover...", this.MenuFilePlantMoverClick,
                "MenuFileTdoMover", "&3D Object Mover...", this.MenuFileTdoMoverClick,
                "Reconcile3DObjects1", "&Reconcile 3D Objects...", this.Reconcile3DObjects1Click,
            ],
            "-",
            "MenuWindowNumericalExceptions", "&Messages", this.MenuWindowNumericalExceptionsClick,
        ],
        "MenuHelp", "&Help", [
            "MenuHelpTopics", "Help &Topics", this.MenuHelpTopicsClick,
            "MenuHelpSuperSpeedTour", "&Super-Speed Tour", this.MenuHelpSuperSpeedTourClick,
            "MenuHelpTutorial", "T&utorial", this.MenuHelpTutorialClick,
            "-",
            "MenuHelpAbout", "&About PlantStudio", this.MenuHelpAboutClick,
        ],
    ]

    paramPopupMenuSpec = [
        // "paramPopupMenuExpand", "&Expand Panel", this.paramPopupMenuExpandClick,
        // "paramPopupMenuCollapse", "&Collapse Panel", this.paramPopupMenuCollapseClick,
        // "-",
        // "paramPopupMenuExpandAllInSection", "E&xpand All Panels in This Section", this.paramPopupMenuExpandAllInSectionClick,
        // "paramPopupMenuCollapseAllInSection", "C&ollapse All Panels in This Section", this.paramPopupMenuCollapseAllInSectionClick,
        // "-",
        // "paramPopupMenuCopyName", "Copy Parameter &Name", this.paramPopupMenuCopyNameClick,
        // "-",
        // "paramPopupMenuHelp", "Go to &Help for This Type of Parameter Panel", this.paramPopupMenuHelpClick,
        // "sectionPopupMenuHelp", "Go to Help for This Parameter &Section", this.sectionPopupMenuHelpClick,
    ]

    plantPopupMenuSpec = [
        // "PopupMenuRandomize", "&Randomize", this.PopupMenuRandomizeClick,
        // "-",
        // "PopupMenuCut", "&Cut", this.PopupMenuCutClick,
        // "PopupMenuCopy", "C&opy", this.PopupMenuCopyClick,
        // "PopupMenuPaste", "&Paste", this.PopupMenuPasteClick,
        // "-",
        // "PopupMenuRename", "Re&name...", this.PopupMenuRenameClick,
        // "PopupMenuEditNote", "&Edit Note...", this.PopupMenuEditNoteClick,
        // "PopupMenuAnimate", "&Animate", this.PopupMenuAnimateClick,
        // "PopupMenuBreed", "&Breed", this.PopupMenuBreedClick,
        // "PopupMenuMakeTimeSeries", "Make &Time Series", this.PopupMenuMakeTimeSeriesClick,
        // "PopupMenuZeroRotations", "Re&set Rotations", this.PopupMenuZeroRotationsClick,
    ]

    viewMenuItem(menuItem: MenuItem) {
        const disabled = menuItem.enabledFunction ? !menuItem.enabledFunction() : false
        switch(menuItem.type) {
            case "dash":
                return m("div.bt.mt1.mb1")
            case "menu":
                return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                    m("span.menuItem", {
                        tabindex: disabled ? undefined: "0",
                        onclick: () => menuItem.action?.call(this, menuItem),
                        onkeydown: (event: any) => {
                            if (event.key === "Enter") {
                                event.stopPropagation()
                                menuItem.action?.call(this, menuItem)
                            }
                        }
                    }, caption(menuItem.label)))
            case "checkbox":
                return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                    m("label.menuItem",
                        { tabindex: disabled ? undefined : "0" },
                        m("input[type=checkbox].mr1", {
                            checked: menuItem.checkedFunction!(),
                            disabled,
                            onchange: () => menuItem.action?.call(this, menuItem),
                        }),
                        caption(menuItem.label)
                    )
                )
            case "radio":
                return m("div.nowrap.pl1.pr1" + (disabled ? ".gray.disabled" : ".hover-bg-green"),
                    m("label.menuItem",
                        { tabindex: disabled ? undefined : "0" },
                        m("input[type=radio].mr1", {
                            checked: menuItem.checkedFunction!(),
                            disabled,
                            onchange: () => menuItem.action?.call(this, menuItem)
                        }),
                        caption(menuItem.label)
                    )
                )
            default:
                return m("div", "Unsupported MenuItem.type: " + menuItem.type)
        }
    }

    //  recursive
    viewMenu(menu: MenuItem[]): any {
        return m("div", 
            menu.map(menuItem => {
                const disabled = menuItem.enabledFunction ? !menuItem.enabledFunction() : false
                return m("div",
                    menuItem.submenu
                        ? m("div.nowrap.mt1.mb1", 
                            m("span.i.ml1"  + (disabled ? ".gray.disabled" : ""), 
                            caption(menuItem.label)), 
                            m("div.ml2", this.viewMenu(menuItem.submenu))
                        )
                        : this.viewMenuItem(menuItem)
                    )
                }
        ))
    }

    droppedDownMenuId = ""

    // TODO MAYBE: 
    // sendTabKey() {
    //     // const newEvent = new KeyboardEvent("keydown", {
    //     //     key: "Tab",
    //     //     keyCode: 9,
    //     //     code: "Tab",
    //     //     which: 9,
    //     //     bubbles: true,
    //     //     location: 0
    //     // })
    //     // document.dispatchEvent(newEvent)
    //     // const element = document.getElementById("droppedDownMenu")
    //     // if (element) {
    //     //     const child = element.getElementsByClassName(".menuItem")[0];
    //     //     (child as any).focus()
    //     // }
    //     setTimeout(() => {
    //         const elements = document.getElementsByClassName("menuItem");
    //         const element = elements[0];
    //         (element as any).focus()
    //     }, 10)
    // }

    viewMainMenu() {
        const menu = buildMenuFromSpec(this.mainMenuSpec)
        
        return m("div.sticky",
            m("div.bg-light-gray",
                m("span.green", {onclick: () => window.open("https://www.kurtz-fernhout.com/summary_plantstudio.html", "_blank") }, "PlantStudio"),
                menu.map(menuItem => 
                    m("span.relative", {
                            tabindex: "0",
                            onkeydown: (event: any) => {
                                if (event.key === "Escape") {
                                    this.droppedDownMenuId = ""
                                    event.stopPropagation()
                                } else if (event.key === "Enter") {
                                    this.droppedDownMenuId === menuItem.id
                                        ? this.droppedDownMenuId == ""
                                        : this.droppedDownMenuId = menuItem.id
                                    event.stopPropagation()
                                } else if (event.key === "ArrowDown" && this.droppedDownMenuId !== menuItem.id) {
                                    this.droppedDownMenuId = menuItem.id
                                    // event.stopPropagation()
                                    // TODO MAYBE: this.sendTabKey()
                                } else if (event.key === "ArrowDown" && this.droppedDownMenuId === menuItem.id) {
                                    // event.stopPropagation()
                                    // TODO MAYBE: this.sendTabKey()
                                // } else if (event.key === "ArrowRight") {
                                //     this.droppedDownMenuId = menuItem.id
                                //     event.stopPropagation()
                                }
                            }
                        }, 
                        m("span.hover-bg-green.b.ml2" + (this.droppedDownMenuId === menuItem.id ? ".ba" : ""), {
                            onclick: (event: any) => {
                                this.droppedDownMenuId === menuItem.id 
                                    ? this.droppedDownMenuId = ""
                                    : this.droppedDownMenuId = menuItem.id
                                event.stopPropagation()
                            }
                        }, caption(menuItem.label)),
                        menuItem.submenu ? null : "MISSING SUBMENU for: " + menuItem.label,
                        this.droppedDownMenuId === menuItem.id && m("div.absolute.ba.bg-light-gray.pb1", { id: "droppedDownMenu", style: { left: 0 } }, this.viewMenu(menuItem.submenu || []))
                    )
                ),
            ),
            this.viewToolbar(),
        )
    }

    backgroundForSpeedButton(buttonId: string) {
        const selected = ".bg-blue"
        switch(buttonId) {
            case "dragCursorMode":
                return this.cursorModeForDrawing === CursorMode.kCursorModeSelectDrag
                    ? selected
                    : ""
            case "scrollCursorMode":
                return this.cursorModeForDrawing === CursorMode.kCursorModeScroll
                    ? selected
                    : ""
            case "rotateCursorMode":
                return this.cursorModeForDrawing === CursorMode.kCursorModeRotate
                    ? selected
                    : ""
            case "magnifyCursorMode":
                return this.cursorModeForDrawing === CursorMode.kCursorModeMagnify
                    ? selected
                    : ""
            case "posingSelectionCursorMode":
                return this.cursorModeForDrawing === CursorMode.kCursorModePosingSelect
                    ? selected
                    : ""

            case "viewFreeFloating":
                return domain.options.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowFreeFloating
                    ? selected
                    : ""
            case "viewOneOnly":
                return domain.options.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowOneAtATime
                    ? selected
                    : ""
            case "drawingAreaOnTop":
                return domain.options.mainWindowOrientation === kMainWindowOrientationHorizontal
                    ? selected
                    : ""
            case "drawingAreaOnSide":
                return domain.options.mainWindowOrientation === kMainWindowOrientationVertical
                    ? selected
                    : ""

            default: {
                throw new Error("Unexpected buttonId: " + buttonId)
            }
        }
    }

    viewToolbar() {
        return m("div.bg-white",       
            m("div.toolbarPanel.TPanel",
                {
                    // Top: "3",
                    // Left: "6",
                    // Height: "33",
                    // Width: "453",
                    // BevelInner: "bvRaised",
                    // BevelOuter: "bvLowered",
                    // TabOrder: "0",
                },
                m("button.dragCursorMode.TSpeedButton" + this.backgroundForSpeedButton("dragCursorMode"),
                    {
                        onclick: () => this.dragCursorModeClick(),
                        title: "Drag cursor mode",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "6",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "1",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888800088888888888880C08888888808880CC08888888800880C08888888880C00CC08888888880CC0C088888888880CCCC000088888880CCCCCC0888888880CCCCC08888888880CCCC088888888880CCC0888888888880CC08888888888880C0888888888888800888888888888880888888888888",
                    },
                    m("img", { src: imageDir + "MainForm_dragCursorMode.png" })
                ),
                m("button.scrollCursorMode.TSpeedButton" + this.backgroundForSpeedButton("scrollCursorMode"),
                    {
                        onclick: () => this.scrollCursorModeClick(),
                        title: "Scroll cursor mode",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "31",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "1",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888800000000888888880CCCCCC0888888880CCCCCC0888888880CCCCCC088888880CCCCCCCC0888880CCCCCCCCCC088800CCCCCCCCCC08880CCCCCCCCCCC08880CC00C0C0C0C08880CC00C0C0C0C088880080C0C0C0C088888880C0C0C00888888880C0C0C0888888888808080888888888888888888888",
                    },
                    m("img", { src: imageDir + "MainForm_scrollCursorMode.png" })
                ),
                m("button.rotateCursorMode.TSpeedButton" + this.backgroundForSpeedButton("rotateCursorMode"),
                    {
                        onclick: () => this.rotateCursorModeClick(),
                        title: "Rotate cursor mode",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "56",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "1",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888880000088888888800CCCCC008888880CC88888CC088880CC8888888CC0888CC888888888C088C088888888888C08C088888888888C08C088888888888888C088888888888888C0888888880000088C0888888880CC088CC0888888880C0888CC08888800CC08888CC00000CC880888888CCCCC888888",
                        // Layout: "blGlyphTop",
                    },
                    m("img", { src: imageDir + "MainForm_rotateCursorMode.png" })
                ),
                m("button.magnifyCursorMode.TSpeedButton" + this.backgroundForSpeedButton("magnifyCursorMode"),
                    {
                        onclick: () => this.magnifyCursorModeClick(),
                        title: "Magnify cursor mode",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "81",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "1",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888888888880088888888888880C08888880000080C08888880CCCCC0C08888880C8FFE8C08888880C8FFFFE8C0888880CFEFFFFEC0888880CEEFFFFFC0888880CFEEFFFFC0888880C8EEEEF8C08888880C8FEF8C0888888880CCCCC088888888880000088888888888888888888888",
                    },
                    m("img", { src: imageDir + "MainForm_magnifyCursorMode.png" })
                ),
                m("button.posingSelectionCursorMode.TSpeedButton" + this.backgroundForSpeedButton("posingSelectionCursorMode"),
                    {
                        onclick: () => this.posingSelectionCursorModeClick(),
                        title: "Posing selection cursor mode",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "106",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "1",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008000088888888888877778888888888880CC088888888888878878888888888880CC088888888888878878888888888880CC088888888888878878888888888880CC088888888888878878888888888880CC088800000088878878887777778880CC08000CCCC088878878777888878880CC000CCCCC0088878877788888778880CC00CCCCCC0888878877888888788880CC00CCCCC00888878877888887788880CC0CCCCC008888878878888877888880CC0CCCC0088888878878888778888880CC0CCC00888888878878887788888880CC0C000888888887888877788888888000000888888888877777788888888888888888888888888888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + "MainForm_posingSelectionCursorMode.png" })
                ),
                m("select.magnificationPercent.TComboBox.w3",
                    {
                        onclick: () => this.magnificationPercentClick(),
                        disabled: !this.havePlants()
                        // Top: "6",
                        // Left: "147",
                        // Height: "22",
                        // Width: "60",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clWindowText",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // ItemHeight: "14",
                        // Items.Strings: ["12%","25%","50%","75%","100%","150%","200%","300%","400%","500%","600%","700%","800%","900%","1000%"],
                        // ParentFont: "False",
                        // TabOrder: "0",
                        // Text: "100%",
                        // OnExit: "magnificationPercentExit",
                    },
                ),
                m("button.centerDrawing.TSpeedButton",
                    {
                        onclick: () => this.centerDrawingClick(),
                        title: "Center drawing",
                        disabled: !this.havePlants()
                        // Top: "4",
                        // Left: "214",
                        // Height: "25",
                        // Width: "88",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clBtnText",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888800000000000000880FFFFFFFFFFFF0880FFF0FFFFFFFF0880FF000FFFFFFF0880F0F0F0FF000F0880FFF0FFFFF00F0880FFF0FFFF0F0F0880FFFFFFF0FF0F0880FCCCCCFFFFFF0880FCCCCCFFFFFF0880FCCCCCFFFFFF0880FCCCCCFFFFFF0880FFFFFFFFFFFF0880000000000000088888888888888888",
                        // ParentFont: "False",
                    },
                    m("img.mr1", { src: imageDir + "MainForm_centerDrawing.png" }),
                    "Scale to Fit",
                ),
                m("button.viewFreeFloating.TSpeedButton" + this.backgroundForSpeedButton("viewFreeFloating"),
                    {
                        onclick: () => this.viewFreeFloatingClick(),
                        title: "View free floating",
                        // Top: "4",
                        // Left: "319",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "5",
                        // Down: "True",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFCCCFFFF88888888877788888FFFCCCFFCCCFFFF88887778877788888FFFCCCFFCCCFFFF88887778877788888FFFCCCFFFFFFFFF88887778888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFCCCFFFF88888888877788888FFFFFFFFCCCFFFF88888888877788888FFFFFFFFCCCFFFF88888888877788888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888",
                        // Margin: "2",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + "MainForm_viewFreeFloating.png" })
                ),
                m("button.viewOneOnly.TSpeedButton" + this.backgroundForSpeedButton("viewOneOnly"),
                    {
                        onclick: () => this.viewOneOnlyClick(),
                        title: "View one only",
                        // Top: "4",
                        // Left: "346",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "5",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFCCCFFFFFF88888887778888888FFFFFFCCCFFFFFF88888887778888888FFFFFFCCCFFFFFF88888887778888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888",
                        // Margin: "2",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + "MainForm_viewOneOnly.png" })
                ),
                m("button.drawingAreaOnTop.TSpeedButton" + this.backgroundForSpeedButton("drawingAreaOnTop"),
                    {
                        onclick: () => this.drawingAreaOnTopClick(),
                        title: "Drawing area on top",
                        // Top: "4",
                        // Left: "387",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "6",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888887777777777777778777777777777777878888888888888787888888888888878787777888777787878777788877778787888888888888878788888888888887878888888888888787888888888888878787777888777787878777788877778787888888888888878788888888888887877777777777777787777777777777778FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888FFFFFFCCCFFFFFF88888887778888888FFFFFFCCCFFFFFF88888887778888888FFFFFFCCCFFFFFF88888887778888888FFFFFFFFFFFFFFF88888888888888888FFFFFFFFFFFFFFF88888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + "MainForm_drawingAreaOnTop.png" })
                ),
                m("button.drawingAreaOnSide.TSpeedButton" + this.backgroundForSpeedButton("drawingAreaOnSide"),
                    {
                        onclick: () => this.drawingAreaOnSideClick(),
                        title: "Drawing area on side",
                        // Top: "4",
                        // Left: "415",
                        // Height: "25",
                        // Width: "25",
                        // GroupIndex: "6",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888877777777777777787777777777777778FFFFFFF7888888788888888788888878FFFFFFF7877778788888888787777878FFFFFFF7888888788888888788888878FFFFFFF7888888788888888788888878FFFFFFF7877778788888888787777878FFFFFFF7888888788888888788888878FFCCCFF7888888788877788788888878FFCCCFF7877778788877788787777878FFCCCFF7888888788877788788888878FFFFFFF7888888788888888788888878FFFFFFF7877778788888888787777878FFFFFFF7888888788888888788888878FFFFFFF7888888788888888788888878FFFFFFF7777777788888888777777778",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + "MainForm_drawingAreaOnSide.png" })
                ),
                m("span", "|"),
                m("button.alignTops.TSpeedButton",
                    {
                        onclick: () => this.alignTopsClick(),
                        title: "Align tops",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "58",
                        // Left: "66",
                        // Height: "25",
                        // Width: "25",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888888888888888888888888888888888888CCCCC888CCCCC8887777788877777888CCCCC888CCCCC8887777788877777888CCCCC888CCCCC8887777788877777888CCCCC888CCCCC8887777788877777888CCCCC888CCCCC8887777788877777888CCCCC888CCCCC8887777788877777888CCCCC888888888887777788888888888CCCCC88888C888887777788888788888CCCCC88888C888887777788888788888CCCCC88888C888887777788888788888CCCCC888C8C8C8887777788878787888CCCCC8888CCC88887777788887778888CCCCC88888C8888877777888887888888888888888888888888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_alignTops.png" : "MainForm_alignTops-disabled.png") })
                ),
                m("button.alignBottoms.TSpeedButton",
                    {
                        onclick: () => this.alignBottomsClick(),
                        title: "Align bottoms",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "58",
                        // Left: "95",
                        // Height: "25",
                        // Width: "25",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0088888888888888888888888888888888888888888888888888888888888888888CCCCC88888C888888777778888878888CCCCC8888CCC88888777778888777888CCCCC888C8C8C8888777778887878788CCCCC88888C888888777778888878888CCCCC88888C888888777778888878888CCCCC88888C888888777778888878888CCCCC888888888888777778888888888CCCCC888CCCCC8888777778887777788CCCCC888CCCCC8888777778887777788CCCCC888CCCCC8888777778887777788CCCCC888CCCCC8888777778887777788CCCCC888CCCCC8888777778887777788CCCCC888CCCCC88887777788877777888888888888888888888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_alignBottoms.png" : "MainForm_alignBottoms-disabled.png") })
                ),
                m("button.alignLeft.TSpeedButton",
                    {
                        onclick: () => this.alignLeftClick(),
                        title: "Align left",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "58",
                        // Left: "123",
                        // Height: "25",
                        // Width: "25",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888C88888CCCCCC8888788888777777888C888888CCCCCC888788888877777788CCCCCC88CCCCCC8877777788777777888C888888CCCCCC88878888887777778888C88888CCCCCC8888788888777777888888888888888888888888888888888888888888888888888888888888888888CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC8877777777777777888888888888888888888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_alignLeft.png" : "MainForm_alignLeft-disabled.png") })
                ),
                m("button.alignRight.TSpeedButton",
                    {
                        onclick: () => this.alignRightClick(),
                        title: "Align right",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "58",
                        // Left: "152",
                        // Height: "25",
                        // Width: "25",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888CCCCCC88888C88887777778888878888CCCCCC888888C8887777778888887888CCCCCC88CCCCCC887777778877777788CCCCCC888888C8887777778888887888CCCCCC88888C888877777788888788888888888888888888888888888888888888888888888888888888888888888888CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC887777777777777788CCCCCCCCCCCCCC8877777777777777888888888888888888888888888888888",
                        // NumGlyphs: "2",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_alignRight.png" : "MainForm_alignRight-disabled.png")})
                ),
                m("button.packPlants.TSpeedButton",
                    {
                        onclick: () => this.packPlantsClick(),
                        title: "Pack plants",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "58",
                        // Left: "188",
                        // Height: "25",
                        // Width: "65",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clWindowText",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC888877777887777788888888888888888888888888888888888888888888888888888888888888888888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC88887777788777778888CCCCC88CCCCC888877777887777788888888888888888888888888888888888",
                        // NumGlyphs: "2",
                        // ParentFont: "False",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_packPlants.png" : "MainForm_packPlants-disabled.png")}),
                ),
                m("button.makeEqualWidth.TSpeedButton",
                    {
                        onclick: () => this.makeEqualWidthClick(),
                        title: "Make equal Width",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "128",
                        // Left: "62",
                        // Height: "25",
                        // Width: "89",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clWindowText",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC88877777777777778888888888888888888888888888888888888888888888888888888888888888888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC8887777777777777888CCCCCCCCCCCCC88877777777777778888888888888888888888888888888888",
                        // NumGlyphs: "2",
                        // ParentFont: "False",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_makeEqualWidth.png" : "MainForm_makeEqualWidth-disabled.png")}),
                ),
                m("button.makeEqualHeight.TSpeedButton",
                    {
                        onclick: () => this.makeEqualHeightClick(),
                        title: "Make equal height",
                        disabled: !this.haveMoreThanOnSelectedPlant()
                        // Top: "128",
                        // Left: "154",
                        // Height: "25",
                        // Width: "89",
                        // Font.Charset: "DEFAULT_CHARSET",
                        // Font.Color: "clWindowText",
                        // Font.Height: "-11",
                        // Font.Name: "Arial",
                        // Font.Style: "[]",
                        // Glyph.Data: "76010000424D760100000000000076000000280000002000000010000000010004000000000000010000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC887777788887777788CCCCC8888CCCCC8877777888877777888888888888888888888888888888888",
                        // NumGlyphs: "2",
                        // ParentFont: "False",
                    },
                    m("img", { src: imageDir + (this.haveMoreThanOnSelectedPlant() ? "MainForm_makeEqualHeight.png" : "MainForm_makeEqualHeight-disabled.png")}),
                ),
            ),
        )
    }

    plantListSelectionStyling(plant: PdPlant): string {
        if (this.isFocused(plant)) {
            return convertColor(domain.options.firstSelectionRectangleColor)
        } else if (this.isSelected(plant)) {
            return convertColor(domain.options.multiSelectionRectangleColor)
        } else {
            return "white"
        }
    }

    viewPlantList() {
        return m("div.plantListPanel.TPanel.ba",
            {
                // Top: "36",
                // Left: "8",
                // Height: "127",
                // Width: "147",
                // TabOrder: "4",
            },
            m("TDrawGrid.plantListDrawGrid.TDrawGrid.overflow-auto",
                {
                    style: "min-height: 4rem",
                    // Top: "4",
                    // Left: "4",
                    // Height: "103",
                    // Width: "137",
                    // ColCount: "1",
                    // DefaultColWidth: "200",
                    // DefaultRowHeight: "16",
                    // DefaultDrawing: "False",
                    // FixedCols: "0",
                    // RowCount: "10",
                    // FixedRows: "0",
                    // Font.Charset: "DEFAULT_CHARSET",
                    // Font.Color: "clWindowText",
                    // Font.Height: "-11",
                    // Font.Name: "Arial",
                    // Font.Style: "[]",
                    // GridLineWidth: "0",
                    // ParentFont: "False",
                    // ScrollBars: "ssVertical",
                    // TabOrder: "0",
                    // OnDblClick: "plantListDrawGridDblClick",
                    // OnDragOver: "plantListDrawGridDragOver",
                    // OnDrawCell: "plantListDrawGridDrawCell",
                    // OnEndDrag: "plantListDrawGridEndDrag",
                    // OnKeyDown: "plantListDrawGridKeyDown",
                    // OnMouseDown: "plantListDrawGridMouseDown",
                    // OnMouseUp: "plantListDrawGridMouseUp",
                },
                this.plants.map((plant, index) => m("div.bl.bw2", 
                    {   id: plant.uuid,
                        style: { borderColor: this.plantListSelectionStyling(plant) }
                    },
                    m("img", {
                        title: "Hide or show plant",
                        src: imageDir + (plant.hidden ? "MainForm_visibleBitmap-hidden.png" : "MainForm_visibleBitmap.png"),
                        onclick: (event: MouseEvent) => this.plantListDrawGridMouseDown(event, index, true)
                    }), m("span", { onclick: (event: MouseEvent) => this.plantListDrawGridMouseDown(event, index, false) }, plant.getName())
                ))
            ),
            m("img.plantBitmapsIndicatorImage.TImage",
                {
                    title: this.plantBitmapsIndicatorImage_Hint,
                    src: imageDir + this.plantBitmapsIndicatorImage_Picture,
                    onclick: () => this.plantBitmapsIndicatorImageClick(),
                    // Top: "107",
                    // Left: "28",
                    // Height: "16",
                    // Width: "16",
                    // AutoSize: "True",
                    // Picture.Data: "07544269746D6170F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888877777777777777887888887888888788788888788888878878888878888887887888777778888788788778787788878878878878878887887888887888888788788877777888878878877878778887887888887888888788788888788888878878888888888887887777777777777788888888888888888",
                    // Transparent: "True",
                },
            ),
            m("img.plantFileChangedImage.TImage.ml1",
                {
                    title: this.plantFileChanged ? "Plant file has changed" : "Plant file has not changed",
                    src: imageDir + (this.plantFileChanged ? "MainForm_fileChangedImage.png" : "MainForm_fileNotChangedImage.png"),
                    // Top: "108",
                    // Left: "6",
                    // Height: "16",
                    // Width: "16",
                    // AutoSize: "True",
                    // Picture.Data: "07544269746D6170F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888777888888888888788788888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888788878888888888787878888888888777878888888888788778888888888878878888888888888778888888888888",
                    // Transparent: "True",
                },
            ),
            m("TPaintBox.progressPaintBox.TPaintBox",
                {
                    // Top: "114",
                    // Left: "48",
                    // Height: "3",
                    // Width: "85",
                    // OnPaint: "progressPaintBoxPaint",
                },
            ),
        )
    }

    view() {
        const self = this
        return m("div.relative", {
                onclick: (event: any) => {
                    this.droppedDownMenuId = ""
                },
            },
            this.viewMainMenu(),
            m(ModalInputView),
            // viewMainForm() 
            m("canvas.ba", {
                width: self.drawingBitmap.width,
                height: self.drawingBitmap.height,
                onupdate(vnode: m.VnodeDOM) {
                    self.drawingPaintBox = <HTMLCanvasElement>vnode.dom
                    self.copyDrawingBitmapToPaintBox()
                    // TODO PDF: May need to rethink how hint is drawn
                    if (this.hintActive && this.lastHintString) {
                        const context = this.drawingPaintBox.getContext("2d")
                        context.fillText(this.lastHintString, this.hintX, this.hintY)
                    }
                },
                onmousedown: (event: MouseEvent) => {
                    this.PaintBoxMouseDown(event)
                },
                onmousemove: (event: MouseEvent) => {
                    this.PaintBoxMouseMove(event)
                },
                onmouseup: (event: MouseEvent) => {
                    this.PaintBoxMouseUp(event)
                },
                style: { cursor: cursor_getCurrentCursorAsCSS() }
            }),
            this.animateCommand && m("div.absolute.green.ma3", 
                { style: { bottom: 0 } },
                "Animating day " + this.animateCommand.age + " of " + this.animateCommand.oldestAgeAtMaturity + " (click anywhere to stop)"
            ),
            this.viewPlantList()
        )
    }   
}

interface MenuItem {
    type: string
    id: string
    label: string | (() => string)
    action?: (menuItem: MenuItem) => void
    submenu?: MenuItem[]
    checkedFunction?: () => boolean
    enabledFunction?: () => boolean
}

// recursive
function buildMenuFromSpec(specOriginal: any[]): MenuItem[] {
    const result: MenuItem[] = []

    const spec = specOriginal.slice()

    while (spec.length) {
        let type = spec.shift()
        if (!type) break
        if (type === "-") {
            result.push({type: "dash", id: "", label: ""})
            continue
        }
        let id
        if (!["radio", "checkbox"].includes(type)) {
            id = type
            type = "menu"
        } else {
            id = spec.shift()
        }
        const label = spec.shift()
        const actionOrMenuSpec = spec.shift()
        let checkedFunction = spec.shift()
        if (typeof checkedFunction !== "function") {
            spec.unshift(checkedFunction)
            checkedFunction = undefined
        }
        let enabledFunction = spec.shift()
        if (typeof enabledFunction !== "function") {
            spec.unshift(enabledFunction)
            enabledFunction = undefined
        }
        if (typeof actionOrMenuSpec !== "function") {
            const submenu = buildMenuFromSpec(actionOrMenuSpec)
            result.push({type, id, label, submenu, checkedFunction, enabledFunction})
        } else {
            const action = actionOrMenuSpec
            result.push({type, id, label, action, checkedFunction, enabledFunction})
        }
    }
    return result
}

/// Unfinished Stub Function

function startWaitMessage(arg0: string) {
    throw new Error("Function not implemented.")
}

function stopWaitMessage() {
    throw new Error("Function not implemented.")
}

function getFileOpenInfo(kFileTypePlant: FileType, plantFileName: string, arg2: string): string {
    throw new Error("Function not implemented.")
}

async function InputQuery(title: string, prompt: string, defaultValue: string): Promise<string | null> {
    return await modalPrompt(prompt, defaultValue)
}

const kSavingDrawingToBmp = 1

function storeProfileInformation() {
    throw new Error("Function not implemented.")
}

function UnionRect(union: TRect, r1: TRect, r2: TRect): void {
    union.Left = Math.min(r1.Left, r2.Left)
    union.Top = Math.min(r1.Top, r2.Top)
    union.Right = Math.max(r1.Right, r2.Right)
    union.Bottom = Math.max(r1.Bottom, r2.Bottom)
}

function IntersectRect(intersection: TRect, r1: TRect, r2: TRect): boolean {
    intersection.Left = Math.max(r1.Left, r2.Left)
    intersection.Top = Math.max(r1.Top, r2.Top)
    intersection.Right = Math.max(intersection.Left, Math.min(r1.Right, r2.Right))
    intersection.Bottom = Math.max(intersection.Top, Math.min(r1.Bottom, r2.Bottom))
    return intersection.Right > intersection.Left && intersection.Bottom > intersection.Top
}

function unfinished() {
    alert("TODO Unfinished")
    throw new Error("Function not implemented.")
}

