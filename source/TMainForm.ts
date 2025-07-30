// unit Umain

import { ColorDefs, double, ExtractFileName, float, int, intround, IntToStr, long, MessageDialog, short, ShowMessage, TColorRef } from "./common"
import { PdCommand } from "./PdCommand"
import { PdCommandList } from "./PdCommandList"
import { domain, DrawMode, kAnimateByAge, kAnimateByXRotation, kIncludeAllPlants, kIncludeDrawingAreaContents, kIncludeSelectedPlants, kIncludeVisiblePlants, kMainWindowOrientationHorizontal, kMainWindowOrientationVertical } from "./PdDomain"
import { kDontConsiderDomainScale, PdPlant } from "./PdPlant"
import { ucursor } from "./temporary"
import { TPoint } from "./TPoint"
import { TRect } from "./TRect"
import { ExportFormats } from "./U3dexport"
import { max, safedivExcept } from "./umath"
import { kBringForward, kSendBackward, PdAlignPlantsCommand, PdAnimatePlantCommand, PdBreedFromParentsCommand, PdCenterDrawingCommand, PdChangeDomain3DOptionsCommand, PdChangeDomainOptionsCommand, PdChangeMagnificationCommand, PdChangeMainWindowOrientationCommand, PdChangeMainWindowViewingOptionCommand, PdChangePlantAgeCommand, PdChangeSelectedPlantsCommand, PdCreateAmendmentCommand, PdDeleteAmendmentCommand, PdDragCommand, PdDuplicateCommand, PdEditAmendmentCommand, PdEditNoteCommand, PdHideOrShowCommand, PdMakeTimeSeriesCommand, PdNewCommand, PdPackPlantsCommand, PdPasteCommand, PdRandomizeCommand, PdRemoveCommand, PdRenameCommand, PdResetRotationsCommand, PdResizePlantsCommand, PdResizePlantsToSameWidthOrHeightCommand, PdRotateCommand, PdScrollCommand, PdSelectOrDeselectAllCommand, PdSelectPosingPartCommand, PdSendBackwardOrForwardCommand } from "./updcom"
import { FileType, kDontAskForFileName, Point, pos, Rect, rHeight, rWidth, setSinglePoint, uppercase } from "./usupport"

// from conversion_common import *
// import ubmpsupport
// import uundo
// import uamendmt
// import uoptions3dexport
// import unoted
// import ucustdrw
// import uabout
// import uanimate
// import unozzle
// import uwelcome
// import utdomove
// import ubmpopt
// import udebug
// import uwizard
// import utimeser
// import uturtle
// import umover
// import uwait
// import ubreedr
// import upp_hed
// import upp_tdo
// import upp_scv
// import upp_rea
// import upp_lis
// import upp_int
// import upp_col
// import upp_boo
// import uplantmn
// import uparams
// import usplash
// import umath
// import updcom
// import uoptions
// import ucursor
// import ubitmap
// import u3dexport
// import usupport
// import udomain
// import uwinsliders
// import usection
// import ustats
// import uppanel
// import ucollect
// import usliders
// import uplant
// import ucommand
// import updform
// import delphi_compatability

// const
const kCursorModeSelectDrag = 0
const kCursorModeMagnify = 1
const kCursorModeScroll = 2
const kCursorModeRotate = 3
const kCursorModePosingSelect = 4
const kMinWidthOnScreen = 100
const kMinHeightOnScreen = 100
const kDrawNow = true
const kDontDrawYet = false
const kScaleAndMove = true
const kJustMove = false
const kAlwaysMove = true
const kOnlyMoveIfOffTheScreen = false


// var
let plantFileChanged: boolean


// var
let MainForm: TMainForm


// const
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


// var
let pictureFileSaveAttemptsThisSession: short
let nozzleFileSaveAttemptsThisSession: short
let exportTo3DFileSaveAttemptsThisSession: short[] /* k3DExportTypeLast + 1 */


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

// const
const kProgressBarColor = ColorDefs.clBlue


// const
const kScaleToFitMargin = 10
const kOffscreenMargin = 20


// const
const kSelectNoPosedPartString = "< Select None >"


// const
const kNoPartSelected = "Selected part: (none)"


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
    // MainMenu: TMainMenu = new TMainMenu()
    // MenuFile: TMenuItem = new TMenuItem()
    // MenuFileNew: TMenuItem = new TMenuItem()
    // MenuFileOpen: TMenuItem = new TMenuItem()
    // MenuFileClose: TMenuItem = new TMenuItem()
    // N1: TMenuItem = new TMenuItem()
    // MenuFileSave: TMenuItem = new TMenuItem()
    // MenuFileSaveAs: TMenuItem = new TMenuItem()
    // N2: TMenuItem = new TMenuItem()
    // MenuFileExit: TMenuItem = new TMenuItem()
    // MenuEdit: TMenuItem = new TMenuItem()
    // MenuEditUndo: TMenuItem = new TMenuItem()
    // MenuEditRedo: TMenuItem = new TMenuItem()
    // N3: TMenuItem = new TMenuItem()
    // MenuEditCut: TMenuItem = new TMenuItem()
    // MenuEditCopy: TMenuItem = new TMenuItem()
    // MenuEditPaste: TMenuItem = new TMenuItem()
    // MenuHelp: TMenuItem = new TMenuItem()
    // MenuHelpTopics: TMenuItem = new TMenuItem()
    // MenuHelpAbout: TMenuItem = new TMenuItem()
    // MenuPlant: TMenuItem = new TMenuItem()
    // MenuFilePlantMover: TMenuItem = new TMenuItem()
    // MenuPlantRename: TMenuItem = new TMenuItem()
    // MenuPlantBreed: TMenuItem = new TMenuItem()
    // MenuPlantRandomize: TMenuItem = new TMenuItem()
    // MenuPlantNew: TMenuItem = new TMenuItem()
    // N7: TMenuItem = new TMenuItem()
    // toolbarPanel: TPanel = new TPanel()
    // dragCursorMode: TSpeedButton = new TSpeedButton()
    // magnifyCursorMode: TSpeedButton = new TSpeedButton()
    // scrollCursorMode: TSpeedButton = new TSpeedButton()
    // horizontalSplitter: TPanel = new TPanel()
    // verticalSplitter: TPanel = new TPanel()
    // paletteImage: TImage = new TImage()
    // MenuEditPreferences: TMenuItem = new TMenuItem()
    // visibleBitmap: TImage = new TImage()
    // PlantPopupMenu: TPopupMenu = new TPopupMenu()
    // MenuFileSaveDrawingAs: TMenuItem = new TMenuItem()
    // MenuFilePrintDrawing: TMenuItem = new TMenuItem()
    // MenuEditCopyDrawing: TMenuItem = new TMenuItem()
    // PopupMenuCut: TMenuItem = new TMenuItem()
    // PopupMenuCopy: TMenuItem = new TMenuItem()
    // PopupMenuPaste: TMenuItem = new TMenuItem()
    // N6: TMenuItem = new TMenuItem()
    // MenuEditDelete: TMenuItem = new TMenuItem()
    // N5: TMenuItem = new TMenuItem()
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
    // PopupMenuRename: TMenuItem = new TMenuItem()
    // PopupMenuRandomize: TMenuItem = new TMenuItem()
    // PopupMenuBreed: TMenuItem = new TMenuItem()
    // rotateCursorMode: TSpeedButton = new TSpeedButton()
    // MenuPlantExportToDXF: TMenuItem = new TMenuItem()
    // MenuPlantMakeTimeSeries: TMenuItem = new TMenuItem()
    // MenuWindow: TMenuItem = new TMenuItem()
    // MenuWindowBreeder: TMenuItem = new TMenuItem()
    // MenuWindowTimeSeries: TMenuItem = new TMenuItem()
    // N12: TMenuItem = new TMenuItem()
    // MenuWindowNumericalExceptions: TMenuItem = new TMenuItem()
    // animateTimer: TTimer = new TTimer()
    // MenuPlantAnimate: TMenuItem = new TMenuItem()
    // centerDrawing: TSpeedButton = new TSpeedButton()
    // MenuOptions: TMenuItem = new TMenuItem()
    // MenuOptionsShowLongButtonHints: TMenuItem = new TMenuItem()
    // MenuOptionsShowParameterHints: TMenuItem = new TMenuItem()
    // MenuOptionsShowSelectionRectangles: TMenuItem = new TMenuItem()
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
    // PopupMenuMakeTimeSeries: TMenuItem = new TMenuItem()
    // PopupMenuAnimate: TMenuItem = new TMenuItem()
    // MenuLayout: TMenuItem = new TMenuItem()
    // MenuLayoutSelectAll: TMenuItem = new TMenuItem()
    // MenuLayoutDeselect: TMenuItem = new TMenuItem()
    // MenuLayoutHide: TMenuItem = new TMenuItem()
    // MenuLayoutHideOthers: TMenuItem = new TMenuItem()
    // MenuLayoutShow: TMenuItem = new TMenuItem()
    // N18: TMenuItem = new TMenuItem()
    // MenuLayoutBringForward: TMenuItem = new TMenuItem()
    // MenuLayoutSendBack: TMenuItem = new TMenuItem()
    // N19: TMenuItem = new TMenuItem()
    // MenuLayoutHorizontalOrientation: TMenuItem = new TMenuItem()
    // MenuLayoutVerticalOrientation: TMenuItem = new TMenuItem()
    // MenuLayoutScaleToFit: TMenuItem = new TMenuItem()
    // MenuLayoutViewOnePlantAtATime: TMenuItem = new TMenuItem()
    // MenuLayoutMakeBouquet: TMenuItem = new TMenuItem()
    // maxSizeAxisLabel: TLabel = new TLabel()
    // plantFileChangedImage: TImage = new TImage()
    // fileChangedImage: TImage = new TImage()
    // fileNotChangedImage: TImage = new TImage()
    // plantListDrawGrid: TDrawGrid = new TDrawGrid()
    // MenuEditDuplicate: TMenuItem = new TMenuItem()
    // N8: TMenuItem = new TMenuItem()
    // MenuPlantNewUsingLastWizardSettings: TMenuItem = new TMenuItem()
    // N4: TMenuItem = new TMenuItem()
    // paramPopupMenu: TPopupMenu = new TPopupMenu()
    // paramPopupMenuHelp: TMenuItem = new TMenuItem()
    // N15: TMenuItem = new TMenuItem()
    // paramPopupMenuExpand: TMenuItem = new TMenuItem()
    // paramPopupMenuCollapse: TMenuItem = new TMenuItem()
    // MenuFileTdoMover: TMenuItem = new TMenuItem()
    // animateGrowth: TSpeedButton = new TSpeedButton()
    // MenuFileMakePainterNozzle: TMenuItem = new TMenuItem()
    // MenuFileMakePainterAnimation: TMenuItem = new TMenuItem()
    // N17: TMenuItem = new TMenuItem()
    // N13: TMenuItem = new TMenuItem()
    // MenuHelpSuperSpeedTour: TMenuItem = new TMenuItem()
    // MenuHelpTutorial: TMenuItem = new TMenuItem()
    // MenuEditCopyAsText: TMenuItem = new TMenuItem()
    // plantsAsTextMemo: TMemo = new TMemo()
    // MenuEditPasteAsText: TMenuItem = new TMenuItem()
    // N16: TMenuItem = new TMenuItem()
    // MenuOptionsFastDraw: TMenuItem = new TMenuItem()
    // MenuOptionsMediumDraw: TMenuItem = new TMenuItem()
    // MenuOptionsBestDraw: TMenuItem = new TMenuItem()
    // MenuOptionsCustomDraw: TMenuItem = new TMenuItem()
    // MenuOptionsUsePlantBitmaps: TMenuItem = new TMenuItem()
    // plantBitmapsIndicatorImage: TImage = new TImage()
    // plantBitmapsGreenImage: TImage = new TImage()
    // noPlantBitmapsImage: TImage = new TImage()
    // plantBitmapsYellowImage: TImage = new TImage()
    // plantBitmapsRedImage: TImage = new TImage()
    // animatingLabel: TLabel = new TLabel()
    // N22: TMenuItem = new TMenuItem()
    // MenuPlantZeroRotations: TMenuItem = new TMenuItem()
    // PopupMenuZeroRotations: TMenuItem = new TMenuItem()
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
    // N10: TMenuItem = new TMenuItem()
    // Reconcile3DObjects1: TMenuItem = new TMenuItem()
    // notePanel: TPanel = new TPanel()
    // noteMemo: TMemo = new TMemo()
    // noteLabel: TLabel = new TLabel()
    // noteEdit: TSpeedButton = new TSpeedButton()
    // PopupMenuEditNote: TMenuItem = new TMenuItem()
    // MenuPlantEditNote: TMenuItem = new TMenuItem()
    // N25: TMenuItem = new TMenuItem()
    // paramPopupMenuCopyName: TMenuItem = new TMenuItem()
    // MenuPlantExportToPOV: TMenuItem = new TMenuItem()
    // MenuFileExport: TMenuItem = new TMenuItem()
    // Recent0: TMenuItem = new TMenuItem()
    // Recent1: TMenuItem = new TMenuItem()
    // Recent2: TMenuItem = new TMenuItem()
    // Recent3: TMenuItem = new TMenuItem()
    // Recent4: TMenuItem = new TMenuItem()
    // MenuFileReopen: TMenuItem = new TMenuItem()
    // Recent5: TMenuItem = new TMenuItem()
    // Recent6: TMenuItem = new TMenuItem()
    // Recent7: TMenuItem = new TMenuItem()
    // Recent8: TMenuItem = new TMenuItem()
    // Recent9: TMenuItem = new TMenuItem()
    // viewFreeFloating: TSpeedButton = new TSpeedButton()
    // viewOneOnly: TSpeedButton = new TSpeedButton()
    // MenuOptionsDrawAs: TMenuItem = new TMenuItem()
    // drawingAreaOnTop: TSpeedButton = new TSpeedButton()
    // drawingAreaOnSide: TSpeedButton = new TSpeedButton()
    // MenuLayoutDrawingAreaOn: TMenuItem = new TMenuItem()
    // MenuLayoutView: TMenuItem = new TMenuItem()
    // MenuLayoutViewFreeFloating: TMenuItem = new TMenuItem()
    // Sections_FlowersPrimaryAdvanced: TImage = new TImage()
    // sizingLabel: TLabel = new TLabel()
    // drawingScaleEdit: TEdit = new TEdit()
    // drawingScaleSpin: TSpinButton = new TSpinButton()
    // drawingScalePixelsPerMmLabel: TLabel = new TLabel()
    // packPlants: TSpeedButton = new TSpeedButton()
    // locationLabel: TLabel = new TLabel()
    // xLocationLabel: TLabel = new TLabel()
    // xLocationEdit: TEdit = new TEdit()
    // xLocationSpin: TSpinButton = new TSpinButton()
    // yLocationLabel: TLabel = new TLabel()
    // yLocationEdit: TEdit = new TEdit()
    // yLocationSpin: TSpinButton = new TSpinButton()
    // locationPixelsLabel: TLabel = new TLabel()
    // arrangementPlantName: TLabel = new TLabel()
    // alignTops: TSpeedButton = new TSpeedButton()
    // alignBottoms: TSpeedButton = new TSpeedButton()
    // alignLeft: TSpeedButton = new TSpeedButton()
    // alignRight: TSpeedButton = new TSpeedButton()
    // makeEqualWidth: TSpeedButton = new TSpeedButton()
    // makeEqualHeight: TSpeedButton = new TSpeedButton()
    // MenuLayoutAlign: TMenuItem = new TMenuItem()
    // MenuLayoutAlignTops: TMenuItem = new TMenuItem()
    // MenuLayoutAlignBottoms: TMenuItem = new TMenuItem()
    // MenuLayoutAlignLeftSides: TMenuItem = new TMenuItem()
    // MenuLayoutAlignRightSides: TMenuItem = new TMenuItem()
    // MenuLayoutSize: TMenuItem = new TMenuItem()
    // MenuLayoutSizeSameHeight: TMenuItem = new TMenuItem()
    // MenuLayoutSizeSameWidth: TMenuItem = new TMenuItem()
    // MenuLayoutPack: TMenuItem = new TMenuItem()
    // parametersPlantName: TLabel = new TLabel()
    // MenuPlantExportTo3DS: TMenuItem = new TMenuItem()
    // N9: TMenuItem = new TMenuItem()
    // posingPanel: TPanel = new TPanel()
    // posingPlantName: TLabel = new TLabel()
    // MenuOptionsGhostHiddenParts: TMenuItem = new TMenuItem()
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
    // MenuOptionsHighlightPosedParts: TMenuItem = new TMenuItem()
    // MenuOptionsPosing: TMenuItem = new TMenuItem()
    // N20: TMenuItem = new TMenuItem()
    // N21: TMenuItem = new TMenuItem()
    // MenuFileMove: TMenuItem = new TMenuItem()
    // posingScaleMultiplierLabel: TLabel = new TLabel()
    // posingLengthMultiplierPercent: TLabel = new TLabel()
    // posingLengthMultiplierLabel: TLabel = new TLabel()
    // posingWidthMultiplierPercent: TLabel = new TLabel()
    // posingWidthMultiplierLabel: TLabel = new TLabel()
    // posingMultiplyScaleAllPartsAfter: TCheckBox = new TCheckBox()
    // MenuOptionsShowBoundsRectangles: TMenuItem = new TMenuItem()
    // MenuOptionsDrawRectangles: TMenuItem = new TMenuItem()
    // MenuOptionsHints: TMenuItem = new TMenuItem()
    // MenuFileSaveJPEG: TMenuItem = new TMenuItem()
    // posingScaleMultiplierEdit: TEdit = new TEdit()
    // posingScaleMultiplierSpin: TSpinButton = new TSpinButton()
    // posingLengthMultiplierEdit: TEdit = new TEdit()
    // posingLengthMultiplierSpin: TSpinButton = new TSpinButton()
    // posingWidthMultiplierEdit: TEdit = new TEdit()
    // posingWidthMultiplierSpin: TSpinButton = new TSpinButton()
    // MenuOptionsHidePosing: TMenuItem = new TMenuItem()
    // UndoMenuEditUndoRedoList: TMenuItem = new TMenuItem()
    // MenuPlantExportToOBJ: TMenuItem = new TMenuItem()
    // MenuPlantExportToVRML: TMenuItem = new TMenuItem()
    // MenuPlantExportToLWO: TMenuItem = new TMenuItem()
    // sectionsComboBox: TComboBox = new TComboBox()
    // paramPopupMenuExpandAllInSection: TMenuItem = new TMenuItem()
    // paramPopupMenuCollapseAllInSection: TMenuItem = new TMenuItem()
    // N11: TMenuItem = new TMenuItem()
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
    // posingSelectionCursorMode: TSpeedButton = new TSpeedButton()
    // posedPartsLabel: TLabel = new TLabel()
    // posedPlantParts: TComboBox = new TComboBox()
    // posingHighlight: TSpeedButton = new TSpeedButton()
    // posingGhost: TSpeedButton = new TSpeedButton()
    // posingNotShown: TSpeedButton = new TSpeedButton()
    // selectedPartLabel: TLabel = new TLabel()
    // posingPosePart: TSpeedButton = new TSpeedButton()
    // posingUnposePart: TSpeedButton = new TSpeedButton()
    // posingMultiplyScaleAllPartsAfterLabel: TLabel = new TLabel()
    // sectionPopupMenuHelp: TMenuItem = new TMenuItem()
    // Sections_Orthogonal: TImage = new TImage()
    // drawingBitmap: TBitmap = new TBitmap()
    commandList: PdCommandList = new PdCommandList()
    // drawingPaintBox: PdPaintBoxWithPalette = new PdPaintBoxWithPalette()
    // statsPanel: PdStatsPanel = new PdStatsPanel()
    // invalidDrawingRect: TRect = new TRect()
    // internalChange: boolean = false
    inFormCreation: boolean = false
    inFileOpen: boolean = false
    lastSaveProceeded: boolean = false
    // resizingAtStart: boolean = false
    plants: PdPlant[] = []
    selectedPlants: PdPlant[] = []
    // numPlantsInClipboard: short = 0
    // lastSingleClickPlantIndex: int = 0
    // justDoubleClickedOnDrawGrid: boolean = false
    // rubberBanding: boolean = false
    // rubberBandNeedToRedraw: boolean = false
    // rubberBandStartDragPoint: TPoint = new TPoint()
    // rubberBandLastDrawPoint: TPoint = new TPoint()
    drawing: boolean = false
    // animateCommand: PdCommand = new PdCommand()
    // drawProgressMax: long = 0
    // cursorModeForDrawing: short = 0
    // actionInProgress: boolean = false
    // mouseMoveActionInProgress: boolean = false
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
    // hintX: int = 0
    // hintY: int = 0
    // hintActive: boolean = false
    // lastHintString: string = ""
    // backTabbingInParametersPanel: boolean = false
    // selectedParameterPanel: PdParameterPanel = new PdParameterPanel()
    selectedPlantPartID: long = 0
    // mouseDownSelectedPlantPartID: long = 0
    // selectedPlantPartType: string = ""
    // mouseDownSelectedPlantPartType: string = ""
    // TMainForm.prototype = new PdForm()
    // TMainForm.prototype.constructor = TMainForm
    
    //$R *.DFM
    //in each direction, so box is 100 x 100
    // FormCreate(): void {
    //     let tempBoundsRect: TRect
        
    //     ucursor.cursor_startWait()
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
    //         this.selectedPlants = delphi_compatability.TList().Create()
    //         this.commandList = ucommand.PdCommandList().create()
    //         this.commandList.setNewUndoLimit(domain.options.undoLimit)
    //         this.commandList.setNewObjectUndoLimit(domain.options.undoLimitOfPlants)
    //         this.drawingPaintBox = ubitmap.PdPaintBoxWithPalette().Create(this)
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
    //         switch (domain.options.drawSpeed) {
    //             case DrawMode.kDrawFast:
    //                 // updating 
    //                 this.MenuOptionsFastDraw.checked = true
    //                 break
    //             case DrawMode.kDrawMedium:
    //                 this.MenuOptionsMediumDraw.checked = true
    //                 break
    //             case DrawMode.kDrawBest:
    //                 this.MenuOptionsBestDraw.checked = true
    //                 break
    //             case DrawMode.kDrawCustom:
    //                 this.MenuOptionsCustomDraw.checked = true
    //                 break
    //         }
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
    //         ucursor.cursor_stopWait()
    //     }
    // }
    
    loadPlantFileAtStartup(): void {
        ucursor.cursor_startWait()
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
                this.MenuFileNewClick(this)
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
            ucursor.cursor_stopWait()
        }
    }
    
    // FormActivate(): void {
    //     if (delphi_compatability.Application.terminated) {
    //         return
    //     }
    //     this.MenuEditPasteAsText.enabled = (UNRESOLVED.Clipboard.hasFormat(UNRESOLVED.CF_TEXT)) && (domain.plantFileLoaded)
    // }
    
    // showWelcomeForm(): void {
    //     let welcomeForm: TWelcomeForm
        
    //     if (domain.options.hideWelcomeForm) {
    //         return
    //     }
    //     welcomeForm = uwelcome.TWelcomeForm().create(delphi_compatability.Application)
    //     try {
    //         if (welcomeForm.ShowModal() !== mrCancel) {
    //             switch (welcomeForm.whatToDo) {
    //                 case uwelcome.kReadSuperSpeedTour:
    //                     delphi_compatability.Application.HelpJump("Super-Speed_Tour")
    //                     break
    //                 case uwelcome.kReadTutorial:
    //                     delphi_compatability.Application.HelpJump("Tutorial")
    //                     break
    //                 case uwelcome.kMakeNewPlant:
    //                     this.MenuPlantNewClick(this)
    //                     break
    //                 case uwelcome.kOpenPlantLibrary:
    //                     if (domain.plantFileName === "") {
    //                         domain.plantFileName = ExtractFilePath(delphi_compatability.Application.exeName)
    //                     }
    //                     this.MenuFileOpenClick(this)
    //                     break
    //                 case uwelcome.kStartUsingProgram:
    //                     break
    //             }
    //         }
    //         domain.options.hideWelcomeForm = welcomeForm.hideWelcomeForm.Checked
    //     } finally {
    //         welcomeForm.free
    //         welcomeForm = null
    //     }
    // }
    
    // FormDestroy(): void {
    //     this.commandList.free
    //     this.commandList = null
    //     this.drawingBitmap.free
    //     this.drawingBitmap = null
    //     this.selectedPlants.free
    //     this.selectedPlants = null
    //     // don't free statsPanel because we are the owner 
    // }
    
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
    //     let CFileName: char[] /* MAX_PATH + 1 */
        
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
        let fileNameWithPath: string
        
        if (!this.askForSaveAndProceed()) {
            return
        }
        fileNameWithPath = getFileOpenInfo(FileType.kFileTypePlant, domain.plantFileName, "Choose a plant file")
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
            } catch (E) {
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
        let result = false
        let messageBoxResult: int
        
        result = true
        if (!plantFileChanged) {
            return result
        }
        //cfk fix - put help context in - for all messageDlgs 
        messageBoxResult = MessageDialog("Save changes to " + ExtractFileName(domain.plantFileName) + "?", mtConfirmation, mbYesNoCancel, 0)
        switch (messageBoxResult) {
            case delphi_compatability.IDCANCEL:
                result = false
                break
            case delphi_compatability.IDYES:
                this.MenuFileSaveClick(this)
                result = this.lastSaveProceeded
                break
            case delphi_compatability.IDNO:
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
        let fileInfo: SaveFileNamesStructure
        
        if (pos(uppercase(udomain.kUnsavedFileName), uppercase(ExtractFileName(domain.plantFileName))) > 0) {
            this.MenuFileSaveAsClick(this)
            return
        }
        this.lastSaveProceeded = usupport.getFileSaveInfo(FileType.kFileTypePlant, kDontAskForFileName, domain.plantFileName, fileInfo)
        if (!this.lastSaveProceeded) {
            return
        }
        try {
            usupport.startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            domain.save(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
            this.setPlantFileChanged(false)
            domain.updateRecentFileNames(fileInfo.newFile)
            this.clearCommandList()
        }
    }
    
    setPlantFileChanged(fileChanged: boolean): void {
        plantFileChanged = fileChanged
        if (this.plantFileChangedImage !== null) {
            if (plantFileChanged) {
                this.plantFileChangedImage.Picture = this.fileChangedImage.Picture
            } else {
                this.plantFileChangedImage.Picture = this.fileNotChangedImage.Picture
            }
            this.plantFileChangedImage.Invalidate()
            this.plantFileChangedImage.Refresh()
        }
    }
    
    MenuFileSaveAsClick(): void {
        let fileInfo: SaveFileNamesStructure
        
        this.lastSaveProceeded = usupport.getFileSaveInfo(usupport.kFileTypePlant, usupport.kAskForFileName, domain.plantFileName, fileInfo)
        if (!this.lastSaveProceeded) {
            return
        }
        try {
            usupport.startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            domain.save(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
            this.setPlantFileChanged(false)
            this.clearCommandList()
        }
        domain.plantFileName = fileInfo.newFile
        domain.lastOpenedPlantFileName = domain.plantFileName
        domain.updateRecentFileNames(domain.lastOpenedPlantFileName)
        this.Caption = this.captionForFile()
    }
    
    MenuFilePlantMoverClick(): void {
        let mover: TMoverForm
        let response: int
        
        if (plantFileChanged) {
            response = MessageDialog("Do you want to save your changes to " + ExtractFileName(domain.plantFileName) + chr(13) + "before you use the plant mover?", mtConfirmation, mbYesNoCancel, 0)
            switch (response) {
                case delphi_compatability.IDCANCEL:
                    return
                    break
                case delphi_compatability.IDYES:
                    this.MenuFileSaveClick(this)
                    break
                case delphi_compatability.IDNO:
                    break
            }
        }
        mover = umover.TMoverForm().create(this)
        if (mover === null) {
            throw new Error("Problem: Could not create plant mover window.")
        }
        try {
            mover.ShowModal()
            //in case mover copied something
            this.updatePasteMenuForClipboardContents()
            if (mover.changedCurrentPlantFile) {
                if (mover.untitledDomainFileSavedAs !== "") {
                    domain.plantFileName = mover.untitledDomainFileSavedAs
                }
                // cfk fix put help context in 
                response = MessageDialog("The current plant file has changed." + chr(13) + "Do you want to reload the changed file?", mtConfirmation, {mbYes, mbNo, }, 0)
                if (response === delphi_compatability.IDYES) {
                    try {
                        startWaitMessage("Opening " + ExtractFileName(domain.plantFileName))
                        this.updateForNoPlantFile()
                        domain.load(domain.plantFileName)
                    } catch (Exception E) {
                        stopWaitMessage()
                        ShowMessage(E.message)
                        ShowMessage("Could not load file " + domain.plantFileName + ".")
                        return
                    }
                    this.updateForPlantFile()
                    stopWaitMessage()
                }
            }
        } finally {
            mover.free
            mover = null
        }
    }
    
    MenuFileTdoMoverClick(): void {
        let mover: TTdoMoverForm
        
        mover = utdomove.TTdoMoverForm().create(this)
        if (mover === null) {
            throw new Error("Problem: Could not create 3D object mover window.")
        }
        try {
            mover.ShowModal()
        } finally {
            mover.free
            mover = null
        }
    }
    
    WMQueryEndSession(message: TWMQueryEndSession): void {
        PdForm.prototype.WMQueryEndSession.call(this)
        if (!this.askForSaveAndProceed()) {
            // prevents windows from shutting down
            message.result = 0
        } else if (!this.cleanUpBeforeExit()) {
            message.result = 0
        }
    }
    
    MenuFileExitClick(): void {
        if (!this.askForSaveAndProceed()) {
            return
        } else if (!this.cleanUpBeforeExit()) {
            return
        }
        delphi_compatability.Application.Terminate()
    }
    
    FormClose(Action: TCloseAction): void {
        if (!this.askForSaveAndProceed()) {
            // same as exit, but can't call exit because we have to set the action flag 
            Action = delphi_compatability.TCloseAction.caNone
        } else if (!this.cleanUpBeforeExit()) {
            Action = delphi_compatability.TCloseAction.caNone
        }
    }
    
    // returns false if user cancels quit
    cleanUpBeforeExit(): boolean {
        let result = false
        let response: int
        let okayToQuit: boolean
        let randomNumber: double
        let lowerLimit: double
        let upperLimit: double
        
        result = true
        domain.mainWindowRect = Rect(this.Left, this.Top, this.Width, this.Height)
        domain.horizontalSplitterPos = this.horizontalSplitter.Top
        domain.verticalSplitterPos = this.verticalSplitter.Left
        domain.breederWindowRect = Rect(ubreedr.BreederForm.Left, ubreedr.BreederForm.Top, ubreedr.BreederForm.Width, ubreedr.BreederForm.Height)
        domain.timeSeriesWindowRect = Rect(utimeser.TimeSeriesForm.Left, utimeser.TimeSeriesForm.Top, utimeser.TimeSeriesForm.Width, utimeser.TimeSeriesForm.Height)
        domain.debugWindowRect = Rect(udebug.DebugForm.Left, udebug.DebugForm.Top, udebug.DebugForm.Width, udebug.DebugForm.Height)
        if (domain.useIniFile) {
            okayToQuit = this.storeIniFile()
            if (!okayToQuit) {
                result = false
                return result
            }
        }

        // have to clear out parameter panels before leaving, for some reason was making program crash
        //    but only if tdo components existed at the time of leaving the program. this works for now,
        //    but it would be better to understand why it was happening. 
        this.sectionsComboBox.ItemIndex = -1
        this.updateParameterPanelsForSectionChange()
        delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_QUIT, 0)
        return result
    }
    
    storeIniFile(): boolean {
        let result = false
        let fileSavedOK: boolean
        let choseAnotherFileName: boolean
        let buttonPressed: byte
        let saveDialog: TSaveDialog
        
        result = true
        fileSavedOK = false
        choseAnotherFileName = false
        while (!fileSavedOK) {
            try {
                domain.storeProfileInformation()
                fileSavedOK = true
            } catch (e) {
                fileSavedOK = false
            }
            if (!fileSavedOK) {
                buttonPressed = MessageDialog("Could not save settings to " + chr(13) + chr(13) + "  " + domain.iniFileName + chr(13) + chr(13) + "Would you like to save them to another file?", delphi_compatability.TMsgDlgType.mtError, mbYesNoCancel, 0)
                switch (buttonPressed) {
                    case delphi_compatability.IDYES:
                        saveDialog = delphi_compatability.TSaveDialog().Create(delphi_compatability.Application)
                        try {
                            saveDialog.FileName = domain.iniFileName
                            saveDialog.Filter = "Ini files (*.ini)|*.ini|All files (*.*)|*.*"
                            saveDialog.DefaultExt = "ini"
                            saveDialog.Options = saveDialog.Options + {delphi_compatability.TOpenOption.ofPathMustExist, delphi_compatability.TOpenOption.ofOverwritePrompt, delphi_compatability.TOpenOption.ofHideReadOnly, delphi_compatability.TOpenOption.ofNoReadOnlyReturn, }
                            result = saveDialog.Execute()
                            if (result) {
                                domain.iniFileName = saveDialog.FileName
                                choseAnotherFileName = true
                            }
                        } finally {
                            saveDialog.free
                        }
                        if (!result) {
                            return result
                        }
                        break
                    case delphi_compatability.IDNO:
                        return result
                        break
                    case delphi_compatability.IDCANCEL:
                        result = false
                        return result
                        break
                }
            }
        }
        if (fileSavedOK && choseAnotherFileName) {
            ShowMessage("Your settings have been saved in " + chr(13) + chr(13) + "  " + domain.iniFileName + chr(13) + chr(13) + "But PlantStudio will load the original settings file again at startup." + chr(13) + "To use this settings file at startup, search in the help system" + chr(13) + "for \"alternate settings file\".")
        }
        return result
    }
    
    // ---------------------------------------------------------------------------- *edit menu 
    MenuEditUndoClick(): void {
        this.commandList.undoLast()
        // commands handle updating if it has to do with plant list, so only update drawing part here 
        this.updateForPossibleChangeToDrawing()
    }
    
    UndoMenuEditUndoRedoListClick(): void {
        let undoRedoListForm: TUndoRedoListForm
        let response: int
        let newCommand: PdCommand
        let i: int
        
        undoRedoListForm = uundo.TUndoRedoListForm().create(this)
        if (undoRedoListForm === null) {
            throw new Error("Problem: Could not create undo/redo list window.")
        }
        try {
            undoRedoListForm.initializeWithCommandList(this.commandList)
            response = undoRedoListForm.ShowModal()
            if (response === mrOK) {
                try {
                    this.enableOrDisableAllForms(kDisableAllForms)
                    startWaitMessage("Multiple undo/redo in progress; please wait...")
                    if (undoRedoListForm.undoToIndex() >= 0) {
                        for (i = 0; i <= undoRedoListForm.undoToIndex(); i++) {
                            this.commandList.undoLast()
                        }
                    } else if (undoRedoListForm.redoToIndex() >= 0) {
                        for (i = 0; i <= undoRedoListForm.redoToIndex(); i++) {
                            this.commandList.redoLast()
                        }
                    }
                } finally {
                    this.updateForPossibleChangeToDrawing()
                    stopWaitMessage()
                    this.enableOrDisableAllForms(kEnableAllForms)
                }
            }
        } finally {
            undoRedoListForm.free
        }
    }
    
    MenuEditRedoClick(): void {
        this.commandList.redoLast()
        this.updateForPossibleChangeToDrawing()
    }
    
    MenuEditCutClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdRemoveCommand(this.selectedPlants, kCopyToClipboard)
        //command calls copy, which enables paste menu item
        this.doCommand(newCommand)
    }
    
    MenuEditCopyClick(): void {
        this.copySelectedPlantsToClipboard()
    }
    
    MenuEditCopyAsTextClick(): void {
        let i: int
        let plant: PdPlant
        
        if (this.selectedPlants.length > 0) {
            UNRESOLVED.Clipboard.clear
            this.plantsAsTextMemo.Clear()
            for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                plant = this.selectedPlants[i]
                if (plant === null) {
                    continue
                }
                plant.writeToMainFormMemoAsText()
            }
            this.plantsAsTextMemo.SelectAll()
            this.plantsAsTextMemo.CutToClipboard()
        }
    }
    
    MenuEditPasteAsTextClick(): void {
        let fakeTextFile: TextFile
        let plant: PdPlant
        let newPlants: PdPlant[] = []
        let newCommand: PdCommand
        let aLine: string
        let secondLine: string
        let plantName: string
        let i: short
        let startLine: short
        let endLine: short
        
        if (!UNRESOLVED.Clipboard.hasFormat(UNRESOLVED.CF_TEXT)) {
            MessageDialog("The clipboard has no text in it.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        this.plantsAsTextMemo.Clear()
        this.plantsAsTextMemo.PasteFromClipboard()
        if (this.plantsAsTextMemo.Lines.Count <= 0) {
            MessageDialog("The clipboard has no text in it.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        startLine = -1
        endLine = -1
        for (i = 0; i <= this.plantsAsTextMemo.Lines.Count - 1; i++) {
            if (pos(uplant.kPlantAsTextStartString, this.plantsAsTextMemo.Lines.Strings[i]) > 0) {
                startLine = i
                break
            }
        }
        for (i = this.plantsAsTextMemo.Lines.Count - 1; i >= 0; i--) {
            if (pos(uplant.kPlantAsTextEndString, this.plantsAsTextMemo.Lines.Strings[i]) > 0) {
                endLine = i
                break
            }
        }
        if (startLine < 0) {
            this.plantsAsTextMemo.Clear()
            MessageDialog("The clipboard has text in it, but no plants." + chr(13) + chr(13) + "I can't find a starting line for a plant text description." + chr(13) + "It should have \"" + uplant.kPlantAsTextStartString + "\" in it." + chr(13) + chr(13) + "If you copied the text for a plant," + chr(13) + "make sure the first line is selected and copy it again.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        if (endLine < 0) {
            this.plantsAsTextMemo.Clear()
            MessageDialog("The clipboard has text in it, but no plants." + chr(13) + chr(13) + "I can't find an ending line for a plant text description." + chr(13) + "It should have \"" + uplant.kPlantAsTextEndString + "\" in it." + chr(13) + chr(13) + "If you copied the text for a plant," + chr(13) + "make sure the whole plant is selected and copy it again.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        try {
            // since startLine and endLine are comments, we can read them
            i = startLine
            while (i <= endLine) {
                aLine = this.plantsAsTextMemo.Lines.Strings[i]
                i += 1
                if (trim(aLine) === "") {
                    // v1.60final ignore blank lines
                    continue
                }
                if (pos(";", aLine) === 1) {
                    continue
                }
                if (pos("[", aLine) === 1) {
                    uplantmn.checkVersionNumberInPlantNameLine(aLine)
                    plant = new PdPlant()
                    plantName = usupport.stringBeyond(aLine, "[")
                    plantName = usupport.stringUpTo(plantName, "]")
                    plant.setName(plantName + " from text")
                    domain.parameterManager.setAllReadFlagsToFalse()
                    plant.readingFromMemo = true
                    try {
                        while ((pos(uplant.kPlantAsTextEndString, aLine) <= 0) && (i <= endLine)) {
                            // v1.60final fixed cutting off plant at blank line (was changed in file read in v1.3)
                            // aLine <> '' do
                            aLine = this.plantsAsTextMemo.Lines.Strings[i]
                            i += 1
                            if (pos(";", aLine) === 1) {
                                continue
                            }
                            if (trim(aLine) === "") {
                                continue
                            }
                            if (pos(uppercase(uplant.kStartNoteString), uppercase(aLine)) > 0) {
                                // added v1.6b1 to accommodate paste from text with note
                                plant.noteLines.Clear()
                                while (i <= this.plantsAsTextMemo.Lines.Count - 1) {
                                    aLine = this.plantsAsTextMemo.Lines.Strings[i]
                                    i += 1
                                    if ((pos(uppercase(uplant.kEndNoteString), uppercase(aLine)) > 0) && (plant.noteLines.Count < 5000)) {
                                        break
                                    } else if (pos(";", aLine) === 1) {
                                        continue
                                    } else {
                                        plant.noteLines.Add(aLine)
                                    }
                                }
                            }
                            // end added v1.6b1
                            plant.readingMemoLine = i
                            plant.readLineAndTdoFromPlantFile(aLine, fakeTextFile)
                            if (i !== plant.readingMemoLine) {
                                i = plant.readingMemoLine
                            }
                        }
                    } finally {
                        plant.readingFromMemo = false
                        plant.readingMemoLine = -1
                    }
                    plant.finishLoadingOrDefaulting(uplant.kCheckForUnreadParams)
                    // cfk change v1.3 make plant fit into 100x100 box with paste from text, because
                    // the scale always seems to be way off from what is being used; this way it always
                    // looks okay when it pastes
                    plant.drawPreviewIntoCache(Point(domain.options.pasteRectSize, domain.options.pasteRectSize), kDontConsiderDomainScale, uplant.kDontDrawNow)
                    newPlants.Add(plant)
                }
            }
            newCommand = new PdPasteCommand(newPlants, this.selectedPlants)
            this.doCommand(newCommand)
        } finally {
            //command has another list, so we need to free this one; command will free plants if paste is undone
            newPlants.free
        }
    }
    
    // export 
    getBitmapCopySavePrintOptions(copySavePrintType: short): int {
        let result = 0
        let bitmapOptionsForm: TBitmapOptionsForm
        
        result = mrCancel
        bitmapOptionsForm = ubmpopt.TBitmapOptionsForm().create(this)
        if (bitmapOptionsForm === null) {
            throw new Error("Problem: Could not create copy/save/print options window.")
        }
        try {
            bitmapOptionsForm.initializeWithTypeAndOptions(copySavePrintType, domain.bitmapOptions)
            result = bitmapOptionsForm.ShowModal()
            domain.bitmapOptions = bitmapOptionsForm.options
        } finally {
            bitmapOptionsForm.free
        }
        return result
    }
    
    MenuEditCopyDrawingClick(): void {
        let bitmapForExport: TBitmap
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.getBitmapCopySavePrintOptions(ubmpopt.kCopyingDrawing) === mrOK) {
            bitmapForExport = delphi_compatability.TBitmap().Create()
            try {
                this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
                ubitmap.CopyBitmapToClipboard(bitmapForExport)
            } finally {
                bitmapForExport.free
            }
        }
    }
    
    MenuFileSaveDrawingAsClick(): void {
        let fileInfo: SaveFileNamesStructure
        let bitmapForExport: TBitmap
        let suggestedFileName: string
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.getBitmapCopySavePrintOptions(ubmpopt.kSavingDrawingToBmp) === mrCancel) {
            return
        }
        pictureFileSaveAttemptsThisSession += 1
        suggestedFileName = "picture" + IntToStr(pictureFileSaveAttemptsThisSession) + ".bmp"
        if (!usupport.getFileSaveInfo(usupport.kFileTypeBitmap, usupport.kAskForFileName, suggestedFileName, fileInfo)) {
            return
        }
        bitmapForExport = delphi_compatability.TBitmap().Create()
        try {
            usupport.startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
            if (!ubitmap.RequiresPalette(bitmapForExport)) {
                bitmapForExport.ReleasePalette()
                bitmapForExport.ignorePalette = true
            }
            bitmapForExport.SaveToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            bitmapForExport.free
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    MenuFileSaveJPEGClick(): void {
        let fileInfo: SaveFileNamesStructure
        let bitmapForExport: TBitmap
        let jpegForExport: TJPEGImage
        let suggestedFileName: string
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.getBitmapCopySavePrintOptions(ubmpopt.kSavingDrawingToJpeg) === mrCancel) {
            return
        }
        pictureFileSaveAttemptsThisSession += 1
        suggestedFileName = "picture" + IntToStr(pictureFileSaveAttemptsThisSession) + ".jpg"
        if (!usupport.getFileSaveInfo(usupport.kFileTypeJPEG, usupport.kAskForFileName, suggestedFileName, fileInfo)) {
            return
        }
        bitmapForExport = delphi_compatability.TBitmap().Create()
        jpegForExport = UNRESOLVED.TJPEGImage.create
        try {
            usupport.startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
            if (!ubitmap.RequiresPalette(bitmapForExport)) {
                bitmapForExport.ReleasePalette()
                bitmapForExport.ignorePalette = true
            }
            jpegForExport.assign(bitmapForExport)
            // no option here
            jpegForExport.pixelFormat = UNRESOLVED.jf24Bit
            // we ask for compression, they want quality, so we switch here
            jpegForExport.compressionQuality = UNRESOLVED.TJPEGQualityRange(100 - domain.bitmapOptions.jpegCompressionRatio)
            jpegForExport.saveToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            bitmapForExport.free
            jpegForExport.free
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    MenuFilePrintDrawingClick(): void {
        let printRect_pixels: TRect
        let bitmapForExport: TBitmap
        let xResolution_pixelsPerInch: float
        let yResolution_pixelsPerInch: float
        let printOffsetX_px: int
        let printOffsetY_px: int
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.getBitmapCopySavePrintOptions(ubmpopt.kPrintingDrawing) === mrCancel) {
            return
        }
        bitmapForExport = delphi_compatability.TBitmap().Create()
        try {
            this.fillBitmapForExport(bitmapForExport, domain.bitmapOptions)
            UNRESOLVED.Printer.Title = "PlantStudio Picture"
            UNRESOLVED.Printer.beginDoc
            xResolution_pixelsPerInch = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSX)
            yResolution_pixelsPerInch = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSY)
            printOffsetX_px = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetX)
            printOffsetY_px = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetY)
            printRect_pixels.Left = intround(domain.bitmapOptions.printLeftMargin_in * xResolution_pixelsPerInch) - printOffsetX_px
            printRect_pixels.Top = intround(domain.bitmapOptions.printTopMargin_in * yResolution_pixelsPerInch) - printOffsetY_px
            printRect_pixels.Right = printRect_pixels.Left + intround(domain.bitmapOptions.printWidth_in * xResolution_pixelsPerInch)
            printRect_pixels.Bottom = printRect_pixels.Top + intround(domain.bitmapOptions.printHeight_in * yResolution_pixelsPerInch)
            UNRESOLVED.inflateRect(printRect_pixels, -domain.bitmapOptions.borderThickness, -domain.bitmapOptions.borderThickness)
            ubitmap.PrintBitmap(bitmapForExport, printRect_pixels)
            //FIX unresolved WITH expression: UNRESOLVED.Printer.Canvas
            // border
            this.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            if (domain.bitmapOptions.printBorderInner) {
                UNRESOLVED.pen.color = domain.bitmapOptions.printBorderColorInner
                UNRESOLVED.pen.width = domain.bitmapOptions.printBorderWidthInner
                UNRESOLVED.rectangle(printRect_pixels.Left, printRect_pixels.Top, printRect_pixels.Right, printRect_pixels.Bottom)
            }
            if (domain.bitmapOptions.printBorderOuter) {
                UNRESOLVED.pen.color = domain.bitmapOptions.printBorderColorOuter
                UNRESOLVED.pen.width = domain.bitmapOptions.printBorderWidthOuter
                UNRESOLVED.rectangle(printRect_pixels.Left - domain.bitmapOptions.borderGap, printRect_pixels.Top - domain.bitmapOptions.borderGap, printRect_pixels.Right + domain.bitmapOptions.borderGap, printRect_pixels.Bottom + domain.bitmapOptions.borderGap)
            }
            UNRESOLVED.Printer.endDoc
        } finally {
            bitmapForExport.free
        }
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
    
    fillBitmapForExport(bitmapForExport: TBitmap, options: BitmapOptionsStructure): void {
        let combinedBoundsRect: TRect
        let rectToDrawIn: TRect
        let unregRect: TRect
        let xMultiplier: float
        let yMultiplier: float
        let scaleMultiplier: float
        let plantPartsToDraw: long
        let plantsToDraw: PdPlant[] = []
        let excludeInvisiblePlants: boolean
        let excludeNonSelectedPlants: boolean
        
        if ((bitmapForExport === null) || (domain === null) || (delphi_compatability.Application.terminated)) {
            return
        }
        // set up according to domain options
        bitmapForExport.PixelFormat = options.colorType
        excludeInvisiblePlants = true
        excludeNonSelectedPlants = false
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
        rectToDrawIn = Rect(0, 0, options.width_pixels, options.height_pixels)
        if ((plantsToDraw === null) || (plantsToDraw.length <= 0)) {
            return
        }
        bitmapForExport.Palette = UNRESOLVED.CopyPalette(this.paletteImage.Picture.Bitmap.Palette)
        xMultiplier = safedivExcept(1.0 * rWidth(rectToDrawIn), 1.0 * rWidth(combinedBoundsRect), 1.0)
        yMultiplier = safedivExcept(1.0 * rHeight(rectToDrawIn), 1.0 * rHeight(combinedBoundsRect), 1.0)
        scaleMultiplier = umath.min(xMultiplier, yMultiplier)
        try {
            ucursor.cursor_startWait()
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
            plantPartsToDraw = 0
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
            ucursor.cursor_stopWait()
            domain.temporarilyHideSelectionRectangles = false
            domain.drawingToMakeCopyBitmap = false
            domain.plantDrawScaleWhenDrawingCopy_PixelsPerMm = 1.0
            domain.plantDrawOffsetWhenDrawingCopy_mm = setSinglePoint(0, 0)
        }
    }
    
    MenuEditPasteClick(): void {
        this.pastePlantsFromClipboard()
    }
    
    pastePlantsFromClipboard(): void {
        let newPlants: PdPlant[] = []
        let newCommand: PdCommand
        
        newPlants = null
        if (domain.plantManager.privatePlantClipboard.Count <= 0) {
            return
        }
        newPlants = delphi_compatability.TList().Create()
        try {
            domain.plantManager.pastePlantsFromPrivatePlantClipboardToList(newPlants)
            newCommand = new PdPasteCommand(newPlants, this.selectedPlants)
            this.doCommand(newCommand)
        } finally {
            //command has another list, so we need to free this one; command will free plants if paste is undone
            newPlants.free
        }
    }
    
    standardPastePosition(): TPoint {
        let result = new TPoint()
        result = Point(this.drawingPaintBox.Width / 2, 3 * this.drawingPaintBox.Height / 4)
        return result
    }
    
    MenuEditDeleteClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdRemoveCommand(this.selectedPlants, kDontCopyToClipboard)
        this.doCommand(newCommand)
    }
    
    MenuEditDuplicateClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdDuplicateCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuEditPreferencesClick(): void {
        let optionsForm: TOptionsForm
        let response: int
        let newCommand: PdCommand
        
        optionsForm = uoptions.TOptionsForm().create(this)
        if (optionsForm === null) {
            throw new Error("Problem: Could not create preferences window.")
        }
        try {
            optionsForm.options = domain.options
            response = optionsForm.ShowModal()
            if ((response === mrOK) && (optionsForm.optionsChanged)) {
                newCommand = new PdChangeDomainOptionsCommand(optionsForm.options)
                this.doCommand(newCommand)
            }
        } finally {
            optionsForm.free
            optionsForm = null
        }
    }
    
    // ---------------------------------------------------------------------------- *plant menu 
    MenuPlantNewClick(): void {
        let newCommand: PdCommand
        let wizardForm: TWizardForm
        let response: int
        let newPlantFromWizard: PdPlant
        
        try {
            ucursor.cursor_startWait()
            // on slower computer wizard takes a long time to come up
            startWaitMessage("Starting the plant wizard...")
            wizardForm = uwizard.TWizardForm().create(this)
        } finally {
            stopWaitMessage()
            ucursor.cursor_stopWait()
        }
        if (wizardForm === null) {
            throw new Error("Problem: Could not create wizard window.")
        }
        try {
            response = wizardForm.ShowModal()
            if (response === mrOK) {
                if (wizardForm.plant === null) {
                    throw new Error("Problem: New wizard plant is nil.")
                }
                newPlantFromWizard = new PdPlant()
                wizardForm.plant.copyTo(newPlantFromWizard)
                newCommand = new PdNewCommand(newPlantFromWizard, this.selectedPlants)
                this.doCommand(newCommand)
                // command will free newPlantFromWizard 
            }
        } finally {
            wizardForm.free
            wizardForm = null
        }
    }
    
    MenuPlantNewUsingLastWizardSettingsClick(): void {
        let newCommand: PdCommand
        let wizardForm: TWizardForm
        let newPlantFromWizard: PdPlant
        
        try {
            // use wizard form to make a new plant using the current settings, but don't show the form
            // this is a sloppy way of doing this, but using the settings to set plant params is embedded in the form.
            ucursor.cursor_startWait()
            startWaitMessage("Making new plant...")
            wizardForm = uwizard.TWizardForm().create(this)
        } finally {
            ucursor.cursor_stopWait()
        }
        newPlantFromWizard = new PdPlant()
        try {
            if (wizardForm === null) {
                throw new Error("Problem: Could not create plant from last wizard settings.")
            }
            if (wizardForm.plant === null) {
                throw new Error("Problem: Could not create plant from last wizard settings (nil plant).")
            }
            wizardForm.setPlantVariables()
            wizardForm.plant.copyTo(newPlantFromWizard)
            newPlantFromWizard.setAge(newPlantFromWizard.pGeneral.ageAtMaturity)
            newCommand = new PdNewCommand(newPlantFromWizard, this.selectedPlants)
            this.doCommand(newCommand)
        } finally {
            // command will free newPlantFromWizard 
            wizardForm.free
            wizardForm = null
            stopWaitMessage()
        }
    }
    
    MenuPlantRenameClick(): void {
        let newName: ansistring
        let response: boolean
        let newCommand: PdCommand
        let plant: PdPlant
        
        plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        newName = plant.getName()
        response = InputQuery("Rename plant", "Enter a new name for " + plant.getName(), newName)
        if (response) {
            newCommand = new PdRenameCommand(plant, newName)
            this.doCommand(newCommand)
        }
    }
    
    MenuPlantRandomizeClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdRandomizeCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuPlantZeroRotationsClick(): void {
        this.resetRotationsClick(this)
    }
    
    MenuPlantBreedClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        if (ubreedr.BreederForm.selectedRow >= domain.breedingAndTimeSeriesOptions.maxGenerations - 2) {
            // check if there is room in the breeder - this command will make two new generations 
            ubreedr.BreederForm.fullWarning()
        } else {
            newCommand = new PdBreedFromParentsCommand(ubreedr.BreederForm.generations, this.focusedPlant(), this.firstUnfocusedPlant(), -1, domain.breedingAndTimeSeriesOptions.percentMaxAge / 100.0, kCreateFirstGeneration)
            this.doCommand(newCommand)
        }
    }
    
    MenuPlantMakeTimeSeriesClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdMakeTimeSeriesCommand(this.focusedPlant())
        this.doCommand(newCommand)
    }
    
    //v2.1
    // v2.1 separated this out and added call in animation saving
    // it is the same otherwise except for the padding
    enoughRoomToSaveFile(tempFileName: string, fileDescriptor: string, fileSizeNeeded_MB: float): boolean {
        let result = false
        let driveLetter: string
        let driveNumber: short
        let fileMegaBytesAvailable: float
        
        result = true
        driveLetter = uppercase(UNRESOLVED.copy(UNRESOLVED.ExtractFileDrive(tempFileName), 1, 1))
        driveNumber = ord(driveLetter[1]) - ord("A") + 1
        fileMegaBytesAvailable = 1.0 * UNRESOLVED.diskFree(driveNumber) / (1024 * 1024)
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
    
    ExportToGeneric3DType(outputType: short): void {
        let fileInfo: SaveFileNamesStructure
        let optionsForm: TGeneric3DOptionsForm
        let tempOptions: FileExport3DOptionsStructure
        let response: short
        let fileType: short
        let suggestedFileName: string
        let fileDescriptor: string
        let optionsChanged: boolean
        let excludeInvisiblePlants: boolean
        let excludeNonSelectedPlants: boolean
        let newCommand: PdCommand
        
        response = mrCancel
        optionsChanged = false
        optionsForm = uoptions3dexport.TGeneric3DOptionsForm().create(this)
        if (optionsForm === null) {
            throw new Error("Problem: Could not create 3D export options window.")
        }
        try {
            optionsForm.outputType = outputType
            optionsForm.rearrangeItemsForOutputType()
            optionsForm.options = domain.exportOptionsFor3D[outputType]
            response = optionsForm.ShowModal()
            tempOptions = optionsForm.options
            optionsChanged = optionsForm.optionsChanged
        } finally {
            optionsForm.free
            optionsForm = null
        }
        if (response !== mrOK) {
            return
        }
        fileType = u3dexport.fileTypeFor3DExportType(outputType)
        fileDescriptor = usupport.nameStringForFileType(fileType)
        exportTo3DFileSaveAttemptsThisSession[outputType] += 1
        suggestedFileName = "plants" + IntToStr(exportTo3DFileSaveAttemptsThisSession[outputType]) + "." + usupport.extensionForFileType(fileType)
        if (!usupport.getFileSaveInfo(fileType, usupport.kAskForFileName, suggestedFileName, fileInfo)) {
            if (optionsChanged) {
                if (MessageDialog(fileDescriptor + " export stopped." + chr(13) + chr(13) + "Do you want to save the changes you made" + chr(13) + "to the " + fileDescriptor + " export options?", mtConfirmation, {mbYes, mbNo, }, 0) === delphi_compatability.IDYES) {
                    newCommand = new PdChangeDomain3DOptionsCommand(tempOptions, outputType)
                    this.doCommand(newCommand)
                }
            }
            return
        }
        if (!this.enoughRoomToSaveFile(fileInfo.tempFile, fileDescriptor, tempOptions.fileSize)) {
            return
        }
        if (optionsChanged) {
            newCommand = new PdChangeDomain3DOptionsCommand(tempOptions, outputType)
            this.doCommand(newCommand)
        }
        try {
            usupport.startFileSave(fileInfo)
            if (outputType === u3dexport.kPOV) {
                fileInfo.newFile = usupport.replacePunctuationWithUnderscores(usupport.stringUpTo(ExtractFileName(fileInfo.newFile), ".")) + ".inc"
            }
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            excludeInvisiblePlants = false
            excludeNonSelectedPlants = false
            switch (tempOptions.exportType) {
                case kIncludeSelectedPlants:
                    excludeInvisiblePlants = true
                    excludeNonSelectedPlants = true
                    break
                case kIncludeVisiblePlants:
                    excludeInvisiblePlants = true
                    break
            }
            domain.plantManager.write3DOutputFileToFileName(this.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants, fileInfo.tempFile, outputType)
            fileInfo.writingWasSuccessful = true
        } finally {
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
        }
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
        let fileInfo: SaveFileNamesStructure
        let bitmapForExport: TBitmap
        let suggestedFileName: string
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.getNozzleOptions() === mrCancel) {
            return
        }
        if (domain.nozzleOptions.cellCount <= 0) {
            return
        }
        nozzleFileSaveAttemptsThisSession += 1
        suggestedFileName = "nozzle" + IntToStr(nozzleFileSaveAttemptsThisSession) + " " + IntToStr(domain.nozzleOptions.cellSize.X) + "x" + IntToStr(domain.nozzleOptions.cellSize.Y) + "x" + IntToStr(domain.nozzleOptions.cellCount) + ".bmp"
        if (!usupport.getFileSaveInfo(usupport.kFileTypeBitmap, usupport.kAskForFileName, suggestedFileName, fileInfo)) {
            return
        }
        bitmapForExport = delphi_compatability.TBitmap().Create()
        try {
            usupport.startFileSave(fileInfo)
            startWaitMessage("Saving " + ExtractFileName(fileInfo.newFile) + "...")
            this.fillBitmapForPainterNozzle(bitmapForExport)
            bitmapForExport.SaveToFile(fileInfo.tempFile)
            fileInfo.writingWasSuccessful = true
        } finally {
            bitmapForExport.free
            stopWaitMessage()
            usupport.cleanUpAfterFileSave(fileInfo)
        }
    }
    
    getNozzleOptions(): int {
        let result = 0
        let nozzleOptionsForm: TNozzleOptionsForm
        
        result = mrCancel
        nozzleOptionsForm = unozzle.TNozzleOptionsForm().create(this)
        if (nozzleOptionsForm === null) {
            throw new Error("Problem: Could not create nozzle options window.")
        }
        try {
            nozzleOptionsForm.initializeWithOptions(domain.nozzleOptions)
            result = nozzleOptionsForm.ShowModal()
            domain.nozzleOptions = nozzleOptionsForm.options
        } finally {
            nozzleOptionsForm.free
        }
        return result
    }
    
    fillBitmapForPainterNozzle(bitmapForExport: TBitmap): void {
        let plantsToDraw: PdPlant[] = []
        let oldBackgroundColor: TColorRef
        let i: short
        let plant: PdPlant
        let oldPlantScale: float
        let scaleMultiplier: float
        let scaledPlantSize: TPoint
        
        if ((bitmapForExport === null) || (domain === null) || (delphi_compatability.Application.terminated)) {
            return
        }
        oldBackgroundColor = domain.options.backgroundColor
        bitmapForExport.PixelFormat = domain.nozzleOptions.colorType
        if (domain.nozzleOptions.exportType === kIncludeSelectedPlants) {
            plantsToDraw = this.selectedPlants
        } else {
            plantsToDraw = this.plants
        }
        if ((plantsToDraw === null) || (plantsToDraw.length <= 0)) {
            return
        }
        try {
            ucursor.cursor_startWait()
            ubmpsupport.resizeBitmap(bitmapForExport, Point(intround(domain.nozzleOptions.cellSize.X * plantsToDraw.length), domain.nozzleOptions.cellSize.Y))
            scaleMultiplier = safedivExcept(1.0 * domain.nozzleOptions.resolution_pixelsPerInch, 1.0 * delphi_compatability.Screen.PixelsPerInch, 1.0)
            // v1.4 changed 0.8 to 0.9 because fitting algorithm works better now
            // extra margin to make sure plants fit
            scaleMultiplier = scaleMultiplier * 0.9
            domain.options.backgroundColor = domain.nozzleOptions.backgroundColor
            ubmpsupport.fillBitmap(bitmapForExport, domain.nozzleOptions.backgroundColor)
            for (i = 0; i <= plantsToDraw.length - 1; i++) {
                plant = plantsToDraw[i]
                scaledPlantSize = Point(intround(rWidth(plant.boundsRect_pixels()) * scaleMultiplier), intround(rHeight(plant.boundsRect_pixels()) * scaleMultiplier))
                oldPlantScale = plant.drawingScale_PixelsPerMm
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
            ucursor.cursor_stopWait()
            domain.options.backgroundColor = oldBackgroundColor
        }
    }
    
    MenuFileMakePainterAnimationClick(): void {
        let saveDialog: TSaveDialog
        let sizeNeeded_MB: float
        
        if ((domain === null) || (domain.plantManager === null) || (this.plants.length <= 0)) {
            return
        }
        if (this.focusedPlant() === null) {
            return
        }
        if (this.getAnimationOptions() === mrCancel) {
            return
        }
        if (domain.animationOptions.frameCount <= 0) {
            return
        }
        saveDialog = delphi_compatability.TSaveDialog().Create(delphi_compatability.Application)
        try {
            saveDialog.Title = "Choose a file name (numbers will be added)"
            saveDialog.FileName = this.focusedPlant().getName() + ".bmp"
            saveDialog.Filter = "Bitmap files (*.bmp)|*.bmp"
            saveDialog.DefaultExt = "bmp"
            saveDialog.Options = saveDialog.Options + {delphi_compatability.TOpenOption.ofPathMustExist, delphi_compatability.TOpenOption.ofOverwritePrompt, delphi_compatability.TOpenOption.ofHideReadOnly, delphi_compatability.TOpenOption.ofNoReadOnlyReturn, }
            if (saveDialog.Execute()) {
                sizeNeeded_MB = 1.0 * domain.animationOptions.fileSize / (1024 * 1024)
                if (!this.enoughRoomToSaveFile(saveDialog.FileName, "animation", sizeNeeded_MB)) {
                    return
                }
                ucursor.cursor_startWait()
                startWaitMessage("Starting...")
                try {
                    this.writeAnimationFilesWithFileSpec(usupport.stringUpTo(saveDialog.FileName, ".") + " ")
                } finally {
                    ucursor.cursor_stopWait()
                    stopWaitMessage()
                }
            }
        } finally {
            saveDialog.free
        }
    }
    
    writeAnimationFilesWithFileSpec(startFileName: string): void {
        let plant: PdPlant
        let oldXRotation: float
        let scaleMultiplier: float
        let minScale: float
        let oldScale: float
        let oldAge: short
        let i: short
        let saveFileName: string
        let unregRect: TRect
        let bestPosition: TPoint = new TPoint()
        let widestWidth: long
        let tallestHeight: long
        
        if (this.focusedPlant() === null) {
            return
        }
        plant = this.focusedPlant()
        oldXRotation = plant.xRotation
        oldAge = plant.age
        oldScale = plant.drawingScale_PixelsPerMm
        try {
            plant.previewCache.PixelFormat = domain.animationOptions.colorType
            // draw plant for all frames, get min drawing scale
            plant.fixedPreviewScale = false
            plant.fixedDrawPosition = false
            minScale = 0
            for (i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
                setPlantCharacteristicsForAnimationFrame(plant, i)
                plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, uplant.kDontDrawNow)
                if ((i === 1) || (plant.drawingScale_PixelsPerMm < minScale)) {
                    minScale = plant.drawingScale_PixelsPerMm
                }
            }
            // draw plant for all frames, get common draw position
            plant.drawingScale_PixelsPerMm = minScale
            plant.fixedPreviewScale = true
            widestWidth = 0
            tallestHeight = 0
            for (i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
                setPlantCharacteristicsForAnimationFrame(plant, i)
                plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, uplant.kDontDrawNow)
                if ((i === 0) || (rWidth(plant.boundsRect_pixels()) > widestWidth)) {
                    widestWidth = rWidth(plant.boundsRect_pixels())
                    bestPosition.X = plant.drawPositionIfFixed.X
                }
                if ((i === 0) || (rHeight(plant.boundsRect_pixels()) > tallestHeight)) {
                    tallestHeight = rHeight(plant.boundsRect_pixels())
                    bestPosition.Y = plant.drawPositionIfFixed.Y
                }
            }
            // now really draw
            plant.drawPositionIfFixed = bestPosition
            plant.fixedDrawPosition = true
            for (i = 0; i <= domain.animationOptions.frameCount - 1; i++) {
                saveFileName = startFileName
                if (i + 1 < 100) {
                    saveFileName = saveFileName + "0"
                }
                if (i + 1 < 10) {
                    saveFileName = saveFileName + "0"
                }
                saveFileName = saveFileName + IntToStr(i + 1) + ".bmp"
                startWaitMessage("Saving " + ExtractFileName(saveFileName) + "...")
                setPlantCharacteristicsForAnimationFrame(plant, i)
                plant.drawPreviewIntoCache(domain.animationOptions.scaledSize, kDontConsiderDomainScale, kDrawNow)
                plant.previewCache.SaveToFile(saveFileName)
            }
            // clean up for next time
            plant.fixedPreviewScale = false
            plant.fixedDrawPosition = false
        } finally {
            plant.shrinkPreviewCache()
            plant.fixedPreviewScale = false
            plant.xRotation = oldXRotation
            plant.drawingScale_PixelsPerMm = oldScale
            plant.setAge(oldAge)
            plant.recalculateBounds(kDrawNow)
        }
    }
    
    getAnimationOptions(): int {
        let result = 0
        let animationOptionsForm: TAnimationFilesOptionsForm
        
        result = mrCancel
        if (this.focusedPlant() === null) {
            return result
        }
        animationOptionsForm = uanimate.TAnimationFilesOptionsForm().create(this)
        if (animationOptionsForm === null) {
            throw new Error("Problem: Could not create animation options window.")
        }
        try {
            animationOptionsForm.initializeWithOptionsAndPlant(domain.animationOptions, this.focusedPlant())
            result = animationOptionsForm.ShowModal()
            domain.animationOptions = animationOptionsForm.options
        } finally {
            animationOptionsForm.free
        }
        return result
    }
    
    MenuLayoutShowClick(): void {
        let newCommand: PdCommand
        let atLeastOnePlantIsHidden: boolean
        let i: short
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        // make sure at least one plant is hidden 
        atLeastOnePlantIsHidden = false
        for (i = 0; i <= this.selectedPlants.length - 1; i++) {
            if (this.selectedPlants[i].hidden) {
                atLeastOnePlantIsHidden = true
                break
            }
        }
        if (!atLeastOnePlantIsHidden) {
            return
        }
        newCommand = new PdHideOrShowCommand(this.selectedPlants, kShow)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHideClick(): void {
        let newCommand: PdCommand
        let atLeastOnePlantIsShowing: boolean
        let i: short
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        // make sure at least one plant is showing 
        atLeastOnePlantIsShowing = false
        for (i = 0; i <= this.selectedPlants.length - 1; i++) {
            if (!this.selectedPlants[i].hidden) {
                atLeastOnePlantIsShowing = true
                break
            }
        }
        if (!atLeastOnePlantIsShowing) {
            return
        }
        newCommand = new PdHideOrShowCommand(this.selectedPlants, kHide)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHideOthersClick(): void {
        let booleansList: TListCollection
        let newCommand: PdCommand
        let i: short
        let plant: PdPlant
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        booleansList = ucollect.TListCollection().Create()
        for (i = 0; i <= this.plants.length - 1; i++) {
            plant = this.plants[i]
            booleansList.Add(PdBooleanValue().createWithBoolean(!this.isSelected(plant)))
        }
        try {
            newCommand = new PdHideOrShowCommand(this.plants, booleansList)
            this.doCommand(newCommand)
        } finally {
            booleansList.free
        }
    }
    
    MenuLayoutMakeBouquetClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 1) {
            return
        }
        newCommand = new PdDragCommand(this.selectedPlants, this.focusedPlant().basePoint_pixels())
        this.doCommand(newCommand)
    }
    
    MenuLayoutScaleToFitClick(): void {
        this.centerDrawingClick(this)
    }
    
    // drawing 
    changeViewingOptionTo(aNewOption: short): void {
        let newCommand: PdCommand
        
        if ((aNewOption === udomain.kViewPlantsInMainWindowOneAtATime) && (this.selectedPlants.length <= 0)) {
            if (this.plants.length < 0) {
                return
            }
            this.selectedPlants.Add(this.plants[0])
            this.updateForChangeToPlantSelections()
        }
        newCommand = new PdChangeMainWindowViewingOptionCommand(this.plants, this.selectedPlants, aNewOption)
        this.doCommand(newCommand)
        this.MenuLayoutMakeBouquet.enabled = (this.selectedPlants.length > 1) && (!domain.viewPlantsInMainWindowOnePlantAtATime())
    }
    
    MenuLayoutViewOnePlantAtATimeClick(): void {
        if (domain.options.mainWindowViewMode !== udomain.kViewPlantsInMainWindowOneAtATime) {
            this.changeViewingOptionTo(udomain.kViewPlantsInMainWindowOneAtATime)
        }
    }
    
    viewOneOnlyClick(): void {
        this.MenuLayoutViewOnePlantAtATimeClick(this)
    }
    
    MenuLayoutViewFreeFloatingClick(): void {
        if (domain.options.mainWindowViewMode !== udomain.kViewPlantsInMainWindowFreeFloating) {
            this.changeViewingOptionTo(udomain.kViewPlantsInMainWindowFreeFloating)
        }
    }
    
    viewFreeFloatingClick(): void {
        this.MenuLayoutViewFreeFloatingClick(this)
    }
    
    MenuLayoutBringForwardClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        if (this.plants.IndexOf(this.firstSelectedPlantInList()) <= 0) {
            // don't do if you can't go forward any more 
            return
        }
        newCommand = new PdSendBackwardOrForwardCommand(kBringForward)
        this.doCommand(newCommand)
    }
    
    MenuLayoutSendBackClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        if (this.plants.IndexOf(this.lastSelectedPlantInList()) >= this.plants.length - 1) {
            // don't do if you can't go backward any more 
            return
        }
        newCommand = new PdSendBackwardOrForwardCommand(kSendBackward)
        this.doCommand(newCommand)
    }
    
    MenuLayoutHorizontalOrientationClick(): void {
        let newCommand: PdCommand
        
        if (domain.options.mainWindowOrientation !== kMainWindowOrientationHorizontal) {
            newCommand = new PdChangeMainWindowOrientationCommand(kMainWindowOrientationHorizontal)
            this.doCommand(newCommand)
        }
    }
    
    MenuLayoutVerticalOrientationClick(): void {
        let newCommand: PdCommand
        
        if (domain.options.mainWindowOrientation !== kMainWindowOrientationVertical) {
            newCommand = new PdChangeMainWindowOrientationCommand(kMainWindowOrientationVertical)
            this.doCommand(newCommand)
        }
    }
    
    drawingAreaOnTopClick(): void {
        this.MenuLayoutHorizontalOrientationClick(this)
    }
    
    drawingAreaOnSideClick(): void {
        this.MenuLayoutVerticalOrientationClick(this)
    }
    
    // --------------------------------------------------------------------------- *options menu 
    MenuOptionsFastDrawClick(): void {
        let oldSpeed: short
        
        oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawFast
        this.MenuOptionsFastDraw.checked = true
        ubreedr.BreederForm.BreederMenuOptionsFastDraw.checked = true
        utimeser.TimeSeriesForm.TimeSeriesMenuOptionsFastDraw.checked = true
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsMediumDrawClick(): void {
        let oldSpeed: short
        
        oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawMedium
        this.MenuOptionsMediumDraw.checked = true
        ubreedr.BreederForm.BreederMenuOptionsMediumDraw.checked = true
        utimeser.TimeSeriesForm.TimeSeriesMenuOptionsMediumDraw.checked = true
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsBestDrawClick(): void {
        let oldSpeed: short
        
        oldSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawBest
        this.MenuOptionsBestDraw.checked = true
        ubreedr.BreederForm.BreederMenuOptionsBestDraw.checked = true
        utimeser.TimeSeriesForm.TimeSeriesMenuOptionsBestDraw.checked = true
        if (oldSpeed !== domain.options.drawSpeed) {
            this.updateForChangeToDrawOptions()
        }
    }
    
    MenuOptionsCustomDrawClick(): void {
        let customDrawForm: TCustomDrawOptionsForm
        let newCommand: PdCommand
        let response: int
        let lastDrawSpeed: short
        
        lastDrawSpeed = domain.options.drawSpeed
        domain.options.drawSpeed = DrawMode.kDrawCustom
        this.MenuOptionsCustomDraw.checked = true
        ubreedr.BreederForm.BreederMenuOptionsCustomDraw.checked = true
        utimeser.TimeSeriesForm.TimeSeriesMenuOptionsCustomDraw.checked = true
        customDrawForm = ucustdrw.TCustomDrawOptionsForm().create(this)
        if (customDrawForm === null) {
            throw new Error("Problem: Could not create 3D object mover window.")
        }
        try {
            customDrawForm.options = domain.options
            response = customDrawForm.ShowModal()
            newCommand = null
            if ((response === mrOK) && (customDrawForm.optionsChanged)) {
                newCommand = new PdChangeDomainOptionsCommand(customDrawForm.options)
                this.doCommand(newCommand)
            } else {
                if (lastDrawSpeed !== DrawMode.kDrawCustom) {
                    // escape just escapes changing options in dialog, not setting to custom, should still redraw
                    // v1.4 change UNLESS it was custom before.
                    this.updateForChangeToDrawOptions()
                }
            }
        } finally {
            customDrawForm.free
            customDrawForm = null
        }
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
        if ((!domain.options.cachePlantBitmaps) && (this.MenuOptionsUsePlantBitmaps.enabled)) {
            this.MenuOptionsUsePlantBitmapsClick(this)
        }
    }
    
    MenuOptionsShowSelectionRectanglesClick(): void {
        this.MenuOptionsShowSelectionRectangles.checked = !this.MenuOptionsShowSelectionRectangles.checked
        domain.options.showSelectionRectangle = this.MenuOptionsShowSelectionRectangles.checked
        this.copyDrawingBitmapToPaintBox()
    }
    
    MenuOptionsShowBoundsRectanglesClick(): void {
        this.MenuOptionsShowBoundsRectangles.checked = !this.MenuOptionsShowBoundsRectangles.checked
        domain.options.showBoundsRectangle = this.MenuOptionsShowBoundsRectangles.checked
        this.copyDrawingBitmapToPaintBox()
    }
    
    MenuOptionsGhostHiddenPartsClick(): void {
        this.MenuOptionsGhostHiddenParts.checked = !this.MenuOptionsGhostHiddenParts.checked
        domain.options.showGhostingForHiddenParts = this.MenuOptionsGhostHiddenParts.checked
        this.internalChange = true
        this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        this.internalChange = false
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    MenuOptionsHighlightPosedPartsClick(): void {
        this.MenuOptionsHighlightPosedParts.checked = !this.MenuOptionsHighlightPosedParts.checked
        domain.options.showHighlightingForNonHiddenPosedParts = this.MenuOptionsHighlightPosedParts.checked
        this.internalChange = true
        this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        this.internalChange = false
        this.redrawAllPlantsInViewWithAmendments()
    }
    
    MenuOptionsHidePosingClick(): void {
        this.MenuOptionsHidePosing.checked = !this.MenuOptionsHidePosing.checked
        domain.options.showPosingAtAll = !this.MenuOptionsHidePosing.checked
        this.internalChange = true
        this.posingNotShown.Down = !domain.options.showPosingAtAll
        this.internalChange = false
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    posingHighlightClick(): void {
        if (this.internalChange) {
            return
        }
        domain.options.showHighlightingForNonHiddenPosedParts = !domain.options.showHighlightingForNonHiddenPosedParts
        this.MenuOptionsHighlightPosedParts.checked = domain.options.showHighlightingForNonHiddenPosedParts
        this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        this.redrawAllPlantsInViewWithAmendments()
    }
    
    posingGhostClick(): void {
        if (this.internalChange) {
            return
        }
        domain.options.showGhostingForHiddenParts = !domain.options.showGhostingForHiddenParts
        this.MenuOptionsGhostHiddenParts.checked = domain.options.showGhostingForHiddenParts
        this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    posingNotShownClick(): void {
        if (this.internalChange) {
            return
        }
        domain.options.showPosingAtAll = !domain.options.showPosingAtAll
        this.MenuOptionsHidePosing.checked = !domain.options.showPosingAtAll
        this.posingNotShown.Down = !domain.options.showPosingAtAll
        // cannot just redraw plants because bounds rects may have changed
        this.redrawEverything()
    }
    
    MenuOptionsShowLongButtonHintsClick(): void {
        this.MenuOptionsShowLongButtonHints.checked = !this.MenuOptionsShowLongButtonHints.checked
        domain.options.showLongHintsForButtons = this.MenuOptionsShowLongButtonHints.checked
        this.updateHintPauseForOptions()
        // shows different hint
        this.updateForChangeToPlantBitmaps()
    }
    
    MenuOptionsShowParameterHintsClick(): void {
        this.MenuOptionsShowParameterHints.checked = !this.MenuOptionsShowParameterHints.checked
        domain.options.showHintsForParameters = this.MenuOptionsShowParameterHints.checked
        this.updateHintPauseForOptions()
    }
    
    // --------------------------------------------------------------------------- *window menu 
    MenuWindowBreederClick(): void {
        ubreedr.BreederForm.Show()
        ubreedr.BreederForm.BringToFront()
        if (ubreedr.BreederForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            ubreedr.BreederForm.WindowState = delphi_compatability.TWindowState.wsNormal
        }
    }
    
    MenuWindowTimeSeriesClick(): void {
        utimeser.TimeSeriesForm.Show()
        utimeser.TimeSeriesForm.BringToFront()
        if (utimeser.TimeSeriesForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            utimeser.TimeSeriesForm.WindowState = delphi_compatability.TWindowState.wsNormal
        }
    }
    
    MenuWindowNumericalExceptionsClick(): void {
        udebug.DebugForm.Show()
        udebug.DebugForm.BringToFront()
        if (udebug.DebugForm.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            udebug.DebugForm.WindowState = delphi_compatability.TWindowState.wsNormal
        }
    }
    
    // ---------------------------------------------------------------------------- *help menu 
    MenuHelpTopicsClick(): void {
        delphi_compatability.Application.HelpCommand(UNRESOLVED.HELP_FINDER, 0)
    }
    
    MenuHelpAboutClick(): void {
        if (usplash.splashForm === null) {
            return
        }
        usplash.splashForm.close.Visible = true
        usplash.splashForm.supportButton.Visible = true
        usplash.splashForm.ShowModal()
    }
    
    MenuHelpSuperSpeedTourClick(): void {
        delphi_compatability.Application.HelpJump("Super-Speed_Tour")
    }
    
    MenuHelpTutorialClick(): void {
        delphi_compatability.Application.HelpJump("Tutorial")
    }
    
    // ---------------------------------------------------------------------------- *progress showing 
    progressPaintBoxPaint(): void {
        this.progressPaintBox.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        this.progressPaintBox.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
        this.progressPaintBox.Canvas.Rectangle(0, 0, this.progressPaintBox.Width, this.progressPaintBox.Height)
    }
    
    startDrawProgress(maximum: long): void {
        this.drawProgressMax = maximum
        this.progressPaintBox.Invalidate()
        this.progressPaintBox.Refresh()
    }
    
    showDrawProgress(amount: long): void {
        let progress: long
        
        if (!this.drawing) {
            return
        }
        if ((!this.animateTimer.enabled) && (!domain.options.showPlantDrawingProgress)) {
            return
        }
        if (this.animateTimer.enabled) {
            return
        }
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
    
    // plant menu 
    // help menu 
    // updating 
    // ---------------------------------------------------------------------------- *updating 
    updateForNoPlantFile(): void {
        this.selectedPlants.Clear()
        this.plantListDrawGrid.Invalidate()
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
            result = delphi_compatability.Application.Title + " - no file"
        } else {
            result = delphi_compatability.Application.Title + " - " + usupport.stringUpTo(ExtractFileName(domain.plantFileName), ".")
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
        let plant: PdPlant
        let i: int
        
        this.internalChange = true
        if (!domain.plantFileLoaded) {
            this.updateForNoPlantFile()
        } else {
            this.Caption = this.captionForFile()
            this.updateForChangeToPlantList()
            this.updateMenusForChangedPlantFile()
            this.selectedPlants.Clear()
            this.magnificationPercent.Text = IntToStr(intround(domain.plantDrawScale_PixelsPerMm() * 100.0)) + "%"
            if (domain.plantManager.mainWindowOrientation !== domain.options.mainWindowOrientation) {
                // v2.0 load and save window orientation (top or side)
                domain.options.mainWindowOrientation = domain.plantManager.mainWindowOrientation
                this.updateForChangeToOrientation()
            }
            if (this.plants.length > 0) {
                for (i = 0; i <= this.plants.length - 1; i++) {
                    // v2.0 load and save plant hidden and selected flags
                    plant = this.plants[i]
                    if (plant.selectedWhenLastSaved) {
                        this.selectedPlants.Add(plant)
                    }
                }
                if (this.selectedPlants.length <= 0) {
                    this.selectedPlants.Add(this.plants[0])
                }
                this.updateForChangeToPlantSelections()
            }
            if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                // deal with possibly changed viewing mode (one/many)
                this.showOnePlantExclusively(kDontDrawYet)
            }
            this.viewOneOnly.Down = domain.viewPlantsInMainWindowOnePlantAtATime()
            if (domain.plantManager.fitInVisibleAreaForConcentrationChange) {
                this.fitVisiblePlantsInDrawingArea(kDrawNow, kScaleAndMove, kAlwaysMove)
                domain.plantManager.fitInVisibleAreaForConcentrationChange = false
            } else {
                this.fitVisiblePlantsInDrawingArea(kDrawNow, kJustMove, kOnlyMoveIfOffTheScreen)
                this.redrawEverything()
            }
        }
        // v2.0 switch to select/drag mode - sometimes it seems to get broken - this will fix it - not unreasonable to do
        this.cursorModeForDrawing = kCursorModeSelectDrag
        this.dragCursorMode.Down = true
        this.internalChange = false
    }
    
    updateHintPauseForOptions(): void {
        delphi_compatability.Application.HintPause = domain.options.pauseBeforeHint * 1000
        if (domain.options.showLongHintsForButtons || domain.options.showHintsForParameters) {
            delphi_compatability.Application.HintHidePause = domain.options.pauseDuringHint * 1000
        } else {
            delphi_compatability.Application.HintHidePause = 2500
        }
        this.statsPanel.updateHint()
    }
    
    updateForChangedExportCount(): void {
        this.Caption = this.captionForFile()
    }
    
    updateForChangeToDomainOptions(): void {
        this.internalChange = true
        // fonts
        // v1.6b1 -- fix for large fonts problem
        this.Font.Size = domain.options.parametersFontSize
        this.parametersScrollBox.Font.Size = domain.options.parametersFontSize
        this.parametersScrollBox.Invalidate()
        // viewing option
        this.MenuLayoutMakeBouquet.enabled = (this.selectedPlants.length > 1) && (!domain.viewPlantsInMainWindowOnePlantAtATime())
        this.updateMenusForChangeToViewingOption()
        // drawing
        this.MenuOptionsUsePlantBitmaps.checked = domain.options.cachePlantBitmaps
        // showing optional things
        this.MenuOptionsShowSelectionRectangles.checked = domain.options.showSelectionRectangle
        this.MenuOptionsShowBoundsRectangles.checked = domain.options.showBoundsRectangle
        this.MenuOptionsShowLongButtonHints.checked = domain.options.showLongHintsForButtons
        this.MenuOptionsShowParameterHints.checked = domain.options.showHintsForParameters
        // posing
        this.MenuOptionsGhostHiddenParts.checked = domain.options.showGhostingForHiddenParts
        this.posingGhost.Down = domain.options.showGhostingForHiddenParts
        this.MenuOptionsHighlightPosedParts.checked = domain.options.showHighlightingForNonHiddenPosedParts
        this.posingHighlight.Down = domain.options.showHighlightingForNonHiddenPosedParts
        this.MenuOptionsHidePosing.checked = !domain.options.showPosingAtAll
        this.posingNotShown.Down = !domain.options.showPosingAtAll
        // vertical/horizontal
        this.MenuLayoutHorizontalOrientation.checked = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal
        this.MenuLayoutVerticalOrientation.checked = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical
        this.drawingAreaOnTop.Down = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal
        this.drawingAreaOnSide.Down = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical
        this.internalChange = false
        // hint, undo
        this.updateHintPauseForOptions()
        this.commandList.setNewUndoLimit(domain.options.undoLimit)
        this.commandList.setNewObjectUndoLimit(domain.options.undoLimitOfPlants)
        if (ubreedr.BreederForm !== null) {
            ubreedr.BreederForm.updateForChangeToDomainOptions()
        }
        if (utimeser.TimeSeriesForm !== null) {
            utimeser.TimeSeriesForm.updateForChangeToDomainOptions()
        }
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
        if (ubreedr.BreederForm !== null) {
            if ((ubreedr.BreederForm.Visible) && (ubreedr.BreederForm.WindowState !== delphi_compatability.TWindowState.wsMinimized)) {
                ubreedr.BreederForm.redrawPlants(ubreedr.kDontConsiderIfPreviewCacheIsUpToDate)
            } else {
                ubreedr.BreederForm.needToRedrawFromChangeToDrawOptions = true
            }
        }
        if (utimeser.TimeSeriesForm !== null) {
            if ((utimeser.TimeSeriesForm.Visible) && (utimeser.TimeSeriesForm.WindowState !== delphi_compatability.TWindowState.wsMinimized)) {
                utimeser.TimeSeriesForm.redrawPlants()
            } else {
                utimeser.TimeSeriesForm.needToRedrawFromChangeToDrawOptions = true
            }
        }
    }
    
    updateMenusForChangeToViewingOption(): void {
        this.MenuLayoutViewOnePlantAtATime.checked = domain.viewPlantsInMainWindowOnePlantAtATime()
        this.MenuLayoutViewFreeFloating.checked = domain.viewPlantsInMainWindowFreeFloating()
        this.viewOneOnly.Down = domain.viewPlantsInMainWindowOnePlantAtATime()
        this.viewFreeFloating.Down = domain.viewPlantsInMainWindowFreeFloating()
    }
    
    updateForChangeToOrientation(): void {
        this.MenuLayoutHorizontalOrientation.checked = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal
        this.MenuLayoutVerticalOrientation.checked = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical
        this.drawingAreaOnTop.Down = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal
        this.drawingAreaOnSide.Down = domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical
        this.Resize()
    }
    
    moveUpOrDownWithKeyInPlantList(indexAfterMove: short): void {
        let newList: PdPlant[] = []
        let newCommand: PdCommand
        
        if (indexAfterMove > this.plants.length - 1) {
            // loop around 
            indexAfterMove = 0
        }
        if (indexAfterMove < 0) {
            indexAfterMove = this.plants.length - 1
        }
        if ((indexAfterMove >= 0) && (indexAfterMove <= this.plants.length - 1)) {
            newList = delphi_compatability.TList().Create()
            try {
                newList.Add(this.plants[indexAfterMove])
                newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
                this.doCommand(newCommand)
            } finally {
                newList.free
            }
        }
    }
    
    updateForChangeToPlantSelections(): void {
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
        this.plantListDrawGrid.Repaint()
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
    }
    
    invalidateSelectedPlantRectangles(): void {
        let i: short
        let plant: PdPlant
        
        if (this.selectedPlants.length > 0) {
            for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                plant = this.selectedPlants[i]
                if (plant !== null) {
                    this.invalidateDrawingRect(plant.boundsRect_pixels())
                }
            }
        }
    }
    
    updateForChangeToPlantList(): void {
        let plant: PdPlant
        let i: short
        let plantsToRemove: PdPlant[] = []
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if ((domain === null) || (domain.plantManager === null)) {
            return
        }
        this.Caption = this.captionForFile()
        this.plantListDrawGrid.RowCount = this.plants.length
        this.plantListDrawGrid.Invalidate()
        // selected plants list - make sure no pointers are invalid 
        plantsToRemove = delphi_compatability.TList().Create()
        try {
            if (this.selectedPlants.length > 0) {
                for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                    plant = this.selectedPlants[i]
                    if (this.plants.IndexOf(plant) < 0) {
                        plantsToRemove.Add(plant)
                    }
                }
            }
            if (plantsToRemove.length > 0) {
                for (i = 0; i <= plantsToRemove.length - 1; i++) {
                    plant = plantsToRemove[i]
                    this.selectedPlants.Remove(plant)
                }
            }
        } finally {
            plantsToRemove.free
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
        let i: short
        let plant: PdPlant
        let showProgress: boolean
        let plantPartsToDraw: long
        let partsDrawn: long
        
        if (this.plants.length <= 0) {
            return
        }
        plantPartsToDraw = 0
        showProgress = drawNow && domain.options.cachePlantBitmaps && domain.options.showPlantDrawingProgress
        if (showProgress) {
            plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.plants, Rect(0, 0, this.drawingBitmap.Width, this.drawingBitmap.Height), udomain.kExcludeInvisiblePlants, udomain.kIncludeNonSelectedPlants)
        }
        partsDrawn = 0
        try {
            ucursor.cursor_startWait()
            this.drawing = true
            if (showProgress) {
                this.startDrawProgress(plantPartsToDraw)
            }
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                plant.plantPartsDrawnAtStart = partsDrawn
                plant.recalculateBounds(drawNow)
                partsDrawn = partsDrawn + plant.totalPlantParts
            }
        } finally {
            ucursor.cursor_stopWait()
            this.drawing = false
            if (showProgress) {
                this.finishDrawProgress()
            }
        }
    }
    
    recalculateSelectedPlantsBoundsRects(drawNow: boolean): void {
        let i: short
        let plant: PdPlant
        let showProgress: boolean
        let plantPartsToDraw: long
        let partsDrawn: long
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        plantPartsToDraw = 0
        showProgress = drawNow && domain.options.cachePlantBitmaps && domain.options.showPlantDrawingProgress
        if (showProgress) {
            plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.selectedPlants, Rect(0, 0, this.drawingBitmap.Width, this.drawingBitmap.Height), udomain.kExcludeInvisiblePlants, udomain.kIncludeNonSelectedPlants)
        }
        partsDrawn = 0
        try {
            ucursor.cursor_startWait()
            this.drawing = true
            if (showProgress) {
                this.startDrawProgress(plantPartsToDraw)
            }
            for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                plant = this.selectedPlants[i]
                plant.plantPartsDrawnAtStart = partsDrawn
                plant.recalculateBounds(drawNow)
                partsDrawn = partsDrawn + plant.totalPlantParts
            }
        } finally {
            ucursor.cursor_stopWait()
            this.drawing = false
            if (showProgress) {
                this.finishDrawProgress()
            }
        }
    }
    
    shrinkAllPlantBitmaps(): void {
        let i: short
        
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                this.plants[i].shrinkPreviewCache()
            }
        }
        this.updateForChangeToPlantBitmaps()
    }
    
    recalculateAllPlantBoundsRectsForOffsetChange(): void {
        let i: short
        let plant: PdPlant
        
        for (i = 0; i <= this.plants.length - 1; i++) {
            plant = this.plants[i]
            plant.recalculateBoundsForOffsetChange()
        }
    }
    
    updateForRenamingPlant(aPlant: PdPlant): void {
        let i: short
        
        this.plantListDrawGrid.Invalidate()
        for (i = 0; i <= kTabHighest; i++) {
            this.updatePlantNameLabel(i)
        }
    }
    
    updateForChangeToPlantNote(aPlant: PdPlant): void {
        let start: int
        
        start = this.noteMemo.SelStart
        this.noteMemo.Clear()
        if (aPlant === null) {
            return
        }
        this.internalChange = true
        if (this.focusedPlant() !== null) {
            this.noteMemo.Lines.AddStrings(aPlant.noteLines)
        }
        this.noteMemo.SelStart = start
        this.internalChange = false
    }
    
    // menu updating 
    // ---------------------------------------------------------------------------- *menu updating 
    updateMenusForUndoRedo(): void {
        if (this.commandList.isUndoEnabled()) {
            this.MenuEditUndo.enabled = true
            this.MenuEditUndo.caption = "&Undo " + this.commandList.undoDescription()
        } else {
            this.MenuEditUndo.enabled = false
            this.MenuEditUndo.caption = "Can't undo"
        }
        if (this.commandList.isRedoEnabled()) {
            this.MenuEditRedo.enabled = true
            this.MenuEditRedo.caption = "&Redo " + this.commandList.redoDescription()
        } else {
            this.MenuEditRedo.enabled = false
            this.MenuEditRedo.caption = "Can't redo"
        }
        this.UndoMenuEditUndoRedoList.enabled = (this.commandList.isUndoEnabled()) || (this.commandList.isRedoEnabled())
        if (ubreedr.BreederForm !== null) {
            ubreedr.BreederForm.BreederMenuUndo.enabled = this.MenuEditUndo.enabled
            ubreedr.BreederForm.BreederMenuUndo.caption = this.MenuEditUndo.caption
            ubreedr.BreederForm.BreederMenuRedo.enabled = this.MenuEditRedo.enabled
            ubreedr.BreederForm.BreederMenuRedo.caption = this.MenuEditRedo.caption
            ubreedr.BreederForm.BreederMenuUndoRedoList.enabled = this.UndoMenuEditUndoRedoList.enabled
        }
        if (utimeser.TimeSeriesForm !== null) {
            utimeser.TimeSeriesForm.TimeSeriesMenuUndo.enabled = this.MenuEditUndo.enabled
            utimeser.TimeSeriesForm.TimeSeriesMenuUndo.caption = this.MenuEditUndo.caption
            utimeser.TimeSeriesForm.TimeSeriesMenuRedo.enabled = this.MenuEditRedo.enabled
            utimeser.TimeSeriesForm.TimeSeriesMenuRedo.caption = this.MenuEditRedo.caption
            utimeser.TimeSeriesForm.TimeSeriesMenuUndoRedoList.enabled = this.UndoMenuEditUndoRedoList.enabled
        }
    }
    
    updateMenusForChangedPlantFile(): void {
        this.MenuFileClose.enabled = domain.plantFileLoaded
        this.MenuPlantNew.enabled = domain.plantFileLoaded
        this.MenuPlantNewUsingLastWizardSettings.enabled = domain.plantFileLoaded
        this.MenuLayoutViewFreeFloating.enabled = domain.plantFileLoaded
        this.viewFreeFloating.Enabled = domain.plantFileLoaded
        this.MenuLayoutViewOnePlantAtATime.enabled = domain.plantFileLoaded
        this.viewOneOnly.Enabled = domain.plantFileLoaded
        this.MenuLayoutHorizontalOrientation.enabled = domain.plantFileLoaded
        this.drawingAreaOnTop.Enabled = domain.plantFileLoaded
        this.MenuLayoutVerticalOrientation.enabled = domain.plantFileLoaded
        this.drawingAreaOnSide.Enabled = domain.plantFileLoaded
        this.updateMenusForChangedPlantList()
        this.updatePasteMenuForClipboardContents()
    }
    
    updateMenusForChangedPlantList(): void {
        let havePlants: boolean
        
        havePlants = (this.plants.length > 0)
        this.MenuFileSave.enabled = havePlants
        this.MenuFileSaveAs.enabled = havePlants
        this.MenuFileSaveDrawingAs.enabled = havePlants
        this.MenuFilePrintDrawing.enabled = havePlants
        this.MenuLayoutSelectAll.enabled = havePlants
        this.MenuEditCopyDrawing.enabled = havePlants
        this.MenuLayoutScaleToFit.enabled = havePlants
        this.MenuFileMakePainterNozzle.enabled = havePlants
        this.MenuPlantExportToDXF.enabled = havePlants
        this.MenuPlantExportToPOV.enabled = havePlants
        this.MenuPlantExportTo3DS.enabled = havePlants
        this.MenuFileSaveJPEG.enabled = havePlants
        this.MenuPlantExportToLWO.enabled = havePlants
        this.MenuPlantExportToOBJ.enabled = havePlants
        this.MenuPlantExportToVRML.enabled = havePlants
        if (!havePlants) {
            this.dragCursorModeClick(this)
        }
        this.toolbarPanel.Enabled = havePlants
        this.dragCursorMode.Enabled = havePlants
        this.magnifyCursorMode.Enabled = havePlants
        this.scrollCursorMode.Enabled = havePlants
        this.rotateCursorMode.Enabled = havePlants
        this.posingSelectionCursorMode.Enabled = havePlants
        this.centerDrawing.Enabled = havePlants
        this.magnificationPercent.Enabled = havePlants
        this.updateMenusForChangedSelectedPlants()
    }
    
    updateMenusForChangedSelectedPlants(): void {
        let haveSelectedPlants: boolean
        let haveMoreThanOneSelectedPlant: boolean
        
        haveSelectedPlants = (this.selectedPlants.length > 0)
        haveMoreThanOneSelectedPlant = (this.selectedPlants.length > 1)
        this.MenuEditCut.enabled = haveSelectedPlants
        this.PopupMenuCut.enabled = haveSelectedPlants
        this.MenuEditCopy.enabled = haveSelectedPlants
        this.PopupMenuCopy.enabled = haveSelectedPlants
        this.MenuEditCopyAsText.enabled = haveSelectedPlants
        this.MenuEditPasteAsText.enabled = (UNRESOLVED.Clipboard.hasFormat(UNRESOLVED.CF_TEXT)) && (domain.plantFileLoaded)
        this.MenuEditDelete.enabled = haveSelectedPlants
        this.MenuEditDuplicate.enabled = haveSelectedPlants
        this.MenuPlantRename.enabled = haveSelectedPlants
        this.PopupMenuRename.enabled = haveSelectedPlants
        this.MenuPlantEditNote.enabled = haveSelectedPlants
        // v1.4
        this.PopupMenuEditNote.enabled = haveSelectedPlants
        // v1.4
        this.noteEdit.Enabled = haveSelectedPlants
        this.MenuPlantRandomize.enabled = haveSelectedPlants
        this.PopupMenuRandomize.enabled = haveSelectedPlants
        this.MenuPlantZeroRotations.enabled = haveSelectedPlants
        this.PopupMenuZeroRotations.enabled = haveSelectedPlants
        this.MenuPlantBreed.enabled = haveSelectedPlants
        this.PopupMenuBreed.enabled = haveSelectedPlants
        this.MenuPlantMakeTimeSeries.enabled = haveSelectedPlants
        this.PopupMenuMakeTimeSeries.enabled = haveSelectedPlants
        this.MenuPlantAnimate.enabled = haveSelectedPlants
        this.PopupMenuAnimate.enabled = haveSelectedPlants
        this.MenuLayoutSelectAll.enabled = (this.plants.length > 0) && (this.selectedPlants.length < this.plants.length)
        this.MenuLayoutDeselect.enabled = haveSelectedPlants
        this.MenuFileMakePainterAnimation.enabled = haveSelectedPlants
        this.MenuLayoutHide.enabled = haveSelectedPlants
        this.MenuLayoutShow.enabled = haveSelectedPlants
        this.MenuLayoutHideOthers.enabled = (haveMoreThanOneSelectedPlant) && (!domain.viewPlantsInMainWindowOnePlantAtATime()) && (this.selectedPlants.length < this.plants.length)
        this.MenuLayoutMakeBouquet.enabled = haveMoreThanOneSelectedPlant && !domain.viewPlantsInMainWindowOnePlantAtATime()
        this.MenuLayoutBringForward.enabled = haveSelectedPlants && (this.selectedPlants.length < this.plants.length)
        this.MenuLayoutSendBack.enabled = haveSelectedPlants && (this.selectedPlants.length < this.plants.length)
        // location
        this.xLocationEdit.Enabled = haveSelectedPlants
        this.xLocationSpin.Enabled = haveSelectedPlants
        this.yLocationEdit.Enabled = haveSelectedPlants
        this.yLocationSpin.Enabled = haveSelectedPlants
        // rotation
        this.xRotationEdit.Enabled = haveSelectedPlants
        this.xRotationSpin.Enabled = haveSelectedPlants
        this.yRotationEdit.Enabled = haveSelectedPlants
        this.yRotationSpin.Enabled = haveSelectedPlants
        this.zRotationEdit.Enabled = haveSelectedPlants
        this.zRotationSpin.Enabled = haveSelectedPlants
        this.resetRotations.Enabled = haveSelectedPlants
        // drawing scale
        this.drawingScaleEdit.Enabled = haveSelectedPlants
        this.drawingScaleSpin.Enabled = haveSelectedPlants
        // alignment
        this.alignTops.Enabled = haveMoreThanOneSelectedPlant
        this.alignBottoms.Enabled = haveMoreThanOneSelectedPlant
        this.alignLeft.Enabled = haveMoreThanOneSelectedPlant
        this.alignRight.Enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutAlign.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutAlignTops.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutAlignBottoms.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutAlignLeftSides.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutAlignRightSides.enabled = haveMoreThanOneSelectedPlant
        // size
        this.makeEqualWidth.Enabled = haveMoreThanOneSelectedPlant
        this.makeEqualHeight.Enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutSize.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutSizeSameWidth.enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutSizeSameHeight.enabled = haveMoreThanOneSelectedPlant
        // pack
        this.packPlants.Enabled = haveMoreThanOneSelectedPlant
        this.MenuLayoutPack.enabled = haveMoreThanOneSelectedPlant
    }
    
    updatePasteMenuForClipboardContents(): void {
        this.MenuEditPaste.enabled = (domain.plantManager.privatePlantClipboard.Count > 0)
        this.PopupMenuPaste.enabled = this.MenuEditPaste.enabled
        if (ubreedr.BreederForm !== null) {
            ubreedr.BreederForm.updatePasteMenuForClipboardContents()
        }
        if (utimeser.TimeSeriesForm !== null) {
            utimeser.TimeSeriesForm.updatePasteMenuForClipboardContents()
        }
    }
    
    updateSectionPopupMenuForSectionChange(): void {
        let haveSection: boolean
        
        haveSection = this.currentSection() !== null
        this.sectionPopupMenuHelp.enabled = haveSection
    }
    
    updateParamPopupMenuForParamSelectionChange(): void {
        let haveSection: boolean
        let haveParam: boolean
        
        haveSection = this.currentSection() !== null
        this.paramPopupMenuExpandAllInSection.enabled = haveSection
        this.paramPopupMenuCollapseAllInSection.enabled = haveSection
        haveParam = this.selectedParameterPanel !== null
        this.paramPopupMenuHelp.enabled = haveParam
        this.paramPopupMenuExpand.enabled = haveParam
        this.paramPopupMenuCollapse.enabled = haveParam
    }
    
    // ---------------------------------------------------------------------------- *drawing 
    invalidateDrawingRect(aRect: TRect): void {
        let newRect: TRect
        
        newRect = this.invalidDrawingRect
        delphi_compatability.UnionRect(newRect, newRect, aRect)
        this.invalidDrawingRect = newRect
    }
    
    invalidateEntireDrawing(): void {
        this.invalidDrawingRect = Rect(0, 0, this.drawingBitmap.Width, this.drawingBitmap.Height)
    }
    
    paintDrawing(immediate: boolean): void {
        let plantPartsToDraw: long
        let showProgress: boolean
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        plantPartsToDraw = 0
        showProgress = domain.options.showPlantDrawingProgress && (!domain.options.cachePlantBitmaps)
        if ((this.invalidDrawingRect.Top !== 0) || (this.invalidDrawingRect.Left !== 0) || (this.invalidDrawingRect.Bottom !== 0) || (this.invalidDrawingRect.Right !== 0)) {
            try {
                if (!this.mouseMoveActionInProgress) {
                    ucursor.cursor_startWait()
                }
                UNRESOLVED.intersectClipRect(this.drawingBitmap.Canvas.Handle, this.invalidDrawingRect.Left, this.invalidDrawingRect.Top, this.invalidDrawingRect.Right, this.invalidDrawingRect.Bottom)
                ubmpsupport.fillBitmap(this.drawingBitmap, domain.options.backgroundColor)
                if (showProgress) {
                    plantPartsToDraw = domain.plantManager.totalPlantPartCountInInvalidRect(this.selectedPlants, this.invalidDrawingRect, udomain.kExcludeInvisiblePlants, udomain.kIncludeNonSelectedPlants)
                }
                try {
                    this.drawing = true
                    if (showProgress) {
                        this.startDrawProgress(plantPartsToDraw)
                    }
                    domain.plantManager.drawOnInvalidRect(this.drawingBitmap.Canvas, this.selectedPlants, this.invalidDrawingRect, udomain.kExcludeInvisiblePlants, udomain.kIncludeNonSelectedPlants)
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
                    ucursor.cursor_stopWait()
                }
                this.invalidDrawingRect = delphi_compatability.Bounds(0, 0, 0, 0)
            }
        }
    }
    
    drawingPaintBoxPaint(): void {
        this.copyDrawingBitmapToPaintBox()
    }
    
    copyDrawingBitmapToPaintBox(): void {
        let drawSelectionRects: boolean
        let drawBoundingRects: boolean
        let includePlant: boolean
        let i: short
        let plant: PdPlant
        let aRect: TRect
        let insetOneRect: TRect
        let intersection: TRect
        let intersectResult: longbool
        let oldPalette: HPALETTE
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if ((domain === null) || (this.plants === null)) {
            return
        }
        aRect = Rect(0, 0, this.drawingBitmap.Width, this.drawingBitmap.Height)
        // use an inset rect to avoid flicker in the boundary rectangle
        insetOneRect = Rect(1, 1, this.drawingBitmap.Width - 1, this.drawingBitmap.Height - 1)
        oldPalette = 0
        oldPalette = UNRESOLVED.selectPalette(this.drawingPaintBox.Canvas.Handle, MainForm.paletteImage.Picture.Bitmap.Palette, false)
        UNRESOLVED.realizePalette(this.drawingPaintBox.Canvas.Handle)
        this.drawingPaintBox.Canvas.CopyRect(insetOneRect, this.drawingBitmap.Canvas, insetOneRect)
        this.drawingPaintBox.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.drawingPaintBox.Canvas.Pen.Width = 1
        drawBoundingRects = (domain.options.showBoundsRectangle) && (!domain.viewPlantsInMainWindowOnePlantAtATime()) && (!domain.temporarilyHideSelectionRectangles)
        if ((drawBoundingRects) && (this.plants.length > 0)) {
            this.drawingPaintBox.Canvas.Pen.Color = delphi_compatability.clSilver
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (!plant.hidden) {
                    this.drawingPaintBox.Canvas.Rectangle(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right, plant.boundsRect_pixels().Bottom)
                }
            }
        }
        drawSelectionRects = (domain.options.showSelectionRectangle) && (!domain.viewPlantsInMainWindowOnePlantAtATime()) && (!domain.temporarilyHideSelectionRectangles)
        if ((drawSelectionRects) && (this.plants.length > 0)) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                includePlant = false
                intersectResult = delphi_compatability.IntersectRect(intersection, plant.boundsRect_pixels(), aRect)
                includePlant = includePlant || intersectResult
                includePlant = includePlant && !plant.hidden
                if (!includePlant) {
                    continue
                }
                if (this.isFocused(plant)) {
                    this.drawingPaintBox.Canvas.Pen.Color = domain.options.firstSelectionRectangleColor
                    this.drawingPaintBox.Canvas.Rectangle(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right, plant.boundsRect_pixels().Bottom)
                    if (this.cursorModeForDrawing === kCursorModeSelectDrag) {
                        this.drawingPaintBox.Canvas.Brush.Color = this.drawingPaintBox.Canvas.Pen.Color
                        this.drawingPaintBox.Canvas.Rectangle(plant.resizingRect().Left, plant.resizingRect().Top, plant.resizingRect().Right, plant.resizingRect().Bottom)
                        this.drawingPaintBox.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
                    }
                } else if (this.isSelected(plant)) {
                    this.drawingPaintBox.Canvas.Pen.Color = domain.options.multiSelectionRectangleColor
                    this.drawingPaintBox.Canvas.Rectangle(plant.boundsRect_pixels().Left, plant.boundsRect_pixels().Top, plant.boundsRect_pixels().Right, plant.boundsRect_pixels().Bottom)
                }
            }
        }
        this.drawingPaintBox.Canvas.Pen.Color = UNRESOLVED.clBtnText
        this.drawingPaintBox.Canvas.Rectangle(0, 0, this.drawingPaintBox.Width, this.drawingPaintBox.Height)
        UNRESOLVED.selectPalette(this.drawingPaintBox.Canvas.Handle, oldPalette, true)
        UNRESOLVED.realizePalette(this.drawingPaintBox.Canvas.Handle)
    }
    
    // plant bitmaps
    // ---------------------------------------------------------------------------- *bitmaps for plants 
    screenBytesPerPixel(): float {
        let result = 0.0
        let screenDC: HDC
        
        screenDC = UNRESOLVED.GetDC(0)
        try {
            result = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
            result = result / 8.0
        } finally {
            UNRESOLVED.ReleaseDC(0, screenDC)
        }
        return result
    }
    
    bytesInPlantBitmaps(plantToExclude: PdPlant): long {
        let result = 0
        let bytesInBitmap: long
        let bytesPerPixel: float
        let i: short
        let plant: PdPlant
        
        result = 0
        bytesPerPixel = this.screenBytesPerPixel()
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
                if (plant === plantToExclude) {
                    // plant that is asking should not be counted, since it is looking to resize and lose the old size
                    continue
                }
                bytesInBitmap = intround(plant.previewCache.Width * plant.previewCache.Height * bytesPerPixel)
                result = result + bytesInBitmap
            }
        }
        return result
    }
    
    roomForPlantBitmap(plant: PdPlant, bytesForThisPlant: long): boolean {
        let result = false
        let bytesAlreadyNotIncludingThisPlant: long
        let bytesLimit: long
        let megabytesTried: float
        
        bytesAlreadyNotIncludingThisPlant = this.bytesInPlantBitmaps(plant)
        bytesLimit = domain.options.memoryLimitForPlantBitmaps_MB * 1024 * 1024
        result = bytesAlreadyNotIncludingThisPlant + bytesForThisPlant < bytesLimit
        if (!result) {
            megabytesTried = (bytesAlreadyNotIncludingThisPlant + bytesForThisPlant) / (1024 * 1024)
            ShowMessage("The total size of plant bitmaps (" + FloatToStrF(megabytesTried, UNRESOLVED.ffFixed, 7, 1) + ") has exceeded " + "the memory limit of " + IntToStr(domain.options.memoryLimitForPlantBitmaps_MB) + " megabytes." + chr(13) + "All plant bitmaps have been dropped and plants will be drawn directly on the window." + chr(13) + "To use plant bitmaps again, choose Use Plant Bitmaps from the Options menu." + chr(13) + chr(13) + "If you have more free memory, your memory limit is set too low." + chr(13) + "To increase the memory limit, choose Preferences from the Edit menu." + chr(13) + "Click Help in the Preferences window for details.")
            this.stopUsingPlantBitmaps()
        }
        return result
    }
    
    exceptionResizingPlantBitmap(): void {
        ShowMessage("An exception occurred while resizing a plant bitmap. " + chr(13) + "All plant bitmaps have been dropped and plants will be drawn directly on the window." + chr(13) + "To use plant bitmaps again, choose Use Plant Bitmaps from the Options menu." + chr(13) + chr(13) + "This exception means that your memory limit is set too high for the available memory." + chr(13) + "To decrease the memory limit, choose Preferences from the Edit menu." + chr(13) + "Click Help in the Preferences window for details.")
        this.stopUsingPlantBitmaps()
    }
    
    updateForChangeToPlantBitmaps(): void {
        let aString: string
        let bytesInUse: long
        let megabytesInUse: float
        
        if (domain.options.showLongHintsForButtons) {
            aString = "Plant bitmaps are used to speed up drawing by caching each plant into a separate " + "bitmap in memory. Plant bitmaps are turned "
        } else {
            aString = "Plant bitmaps are turned "
        }
        bytesInUse = 0
        megabytesInUse = 0
        if (domain.options.cachePlantBitmaps) {
            bytesInUse = this.bytesInPlantBitmaps(null)
            megabytesInUse = bytesInUse / (1024 * 1024)
            aString = aString + "ON and are using " + FloatToStrF(megabytesInUse, UNRESOLVED.ffFixed, 7, 1) + " out of " + IntToStr(domain.options.memoryLimitForPlantBitmaps_MB) + " MB of memory."
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
        if (this.plantBitmapsIndicatorImage !== null) {
            if (domain.options.cachePlantBitmaps) {
                if (megabytesInUse / domain.options.memoryLimitForPlantBitmaps_MB <= 0.5) {
                    this.plantBitmapsIndicatorImage.Picture = this.plantBitmapsGreenImage.Picture
                } else if (megabytesInUse / domain.options.memoryLimitForPlantBitmaps_MB <= 0.8) {
                    this.plantBitmapsIndicatorImage.Picture = this.plantBitmapsYellowImage.Picture
                } else {
                    this.plantBitmapsIndicatorImage.Picture = this.plantBitmapsRedImage.Picture
                }
            } else {
                this.plantBitmapsIndicatorImage.Picture = this.noPlantBitmapsImage.Picture
            }
            this.plantBitmapsIndicatorImage.Hint = aString
        }
    }
    
    stopUsingPlantBitmaps(): void {
        domain.options.cachePlantBitmaps = false
        this.MenuOptionsUsePlantBitmaps.checked = domain.options.cachePlantBitmaps
        this.shrinkAllPlantBitmaps()
        this.invalidateEntireDrawing()
    }
    
    startUsingPlantBitmaps(): void {
        domain.options.cachePlantBitmaps = true
        this.MenuOptionsUsePlantBitmaps.checked = domain.options.cachePlantBitmaps
        this.recalculateAllPlantBoundsRects(kDrawNow)
        this.invalidateEntireDrawing()
    }
    
    // command list management 
    // ---------------------------------------------------------------------------- *command list management 
    clearCommandList(): void {
        this.commandList.free
        this.commandList = null
        this.commandList = ucommand.PdCommandList().create()
        this.updateMenusForUndoRedo()
    }
    
    doCommand(command: PdCommand): void {
        this.commandList.doCommand(command)
        this.updateForPossibleChangeToDrawing()
    }
    
    // called by commands 
    // ------------------------------------------------------------------------------- *called by commands 
    hideOrShowSomePlants(plantList: PdPlant[], hideList: PdPlant[], hide: boolean, drawNow: boolean): void {
        let redrawRect: TRect
        let i: short
        let plant: PdPlant
        
        if ((plantList === null) || (plantList.length <= 0)) {
            return
        }
        redrawRect = delphi_compatability.Bounds(0, 0, 0, 0)
        for (i = 0; i <= plantList.length - 1; i++) {
            plant = plantList[i]
            if ((hideList !== null) && (hideList.Count > 0)) {
                plant.hidden = PdBooleanValue(hideList[i]).saveBoolean
            } else {
                plant.hidden = hide
            }
            // magnification might have changed
            plant.recalculateBounds(kDrawNow)
            delphi_compatability.UnionRect(redrawRect, redrawRect, plant.boundsRect_pixels())
        }
        this.invalidateDrawingRect(redrawRect)
        this.plantListDrawGrid.Invalidate()
        if (drawNow) {
            this.updateForPossibleChangeToDrawing()
        }
    }
    
    fitVisiblePlantsInDrawingArea(drawNow: boolean, scaleAsWellAsMove: boolean, alwaysMove: boolean): void {
        let upperLeft_mm: TPoint
        let lowerRight_mm: TPoint
        let size_mm: TPoint
        let offScreenUpperLeft_mm: TPoint
        let offScreenLowerRight_mm: TPoint
        let xScale_pixelsPerMm: float
        let yScale_pixelsPerMm: float
        let newScale_pixelsPerMm: float
        let marginOffset_mm: float
        let i: short
        let plant: PdPlant
        let allPlantsAreOffscreen: boolean
        
        if (this.plants.length <= 0) {
            return
        }
        for (i = 0; i <= this.plants.length - 1; i++) {
            plant = this.plants[i]
            if (!plant.hidden) {
                plant.recalculateBounds(kDontDrawYet)
            }
        }
        upperLeft_mm = this.upperLeftMostPlantBoundsRectPoint_mm()
        lowerRight_mm = this.lowerRightMostPlantBoundsRectPoint_mm()
        size_mm = Point(lowerRight_mm.X - upperLeft_mm.X, lowerRight_mm.Y - upperLeft_mm.Y)
        if (alwaysMove) {
            // move domain offset so all plants begin within drawing area
            allPlantsAreOffscreen = false
        } else {
            // determine if all plants are out of the drawing area and so must be moved
            offScreenUpperLeft_mm.X = intround(kOffscreenMargin / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenUpperLeft_mm.Y = intround(kOffscreenMargin / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenLowerRight_mm.X = intround((this.drawingPaintBox.Width - kOffscreenMargin) / domain.plantManager.plantDrawScale_PixelsPerMm)
            offScreenLowerRight_mm.Y = intround((this.drawingPaintBox.Height - kOffscreenMargin) / domain.plantManager.plantDrawScale_PixelsPerMm)
            allPlantsAreOffscreen = (lowerRight_mm.X <= offScreenUpperLeft_mm.X) || (lowerRight_mm.Y <= offScreenUpperLeft_mm.Y) || (upperLeft_mm.X >= offScreenLowerRight_mm.X) || (upperLeft_mm.Y >= offScreenLowerRight_mm.Y)
        }
        if (scaleAsWellAsMove) {
            xScale_pixelsPerMm = safedivExcept(1.0 * this.drawingPaintBox.Width - 1.0 * kScaleToFitMargin * 2, size_mm.X, 0)
            yScale_pixelsPerMm = safedivExcept(1.0 * this.drawingPaintBox.Height - 1.0 * kScaleToFitMargin * 2, size_mm.Y, 0)
            newScale_pixelsPerMm = umath.min(xScale_pixelsPerMm, yScale_pixelsPerMm)
        } else {
            newScale_pixelsPerMm = 0
        }
        if (alwaysMove || allPlantsAreOffscreen) {
            marginOffset_mm = safedivExcept(1.0 * kScaleToFitMargin, newScale_pixelsPerMm, 0)
            domain.plantManager.plantDrawOffset_mm = usupport.setSinglePoint(-upperLeft_mm.X + marginOffset_mm, -upperLeft_mm.Y + marginOffset_mm)
        }
        if ((scaleAsWellAsMove) && (newScale_pixelsPerMm !== 0.0)) {
            // calculate new scale to fit all plants in drawing area and apply
            this.magnifyOrReduce(newScale_pixelsPerMm, Point(0, 0), drawNow)
        }
    }
    
    // ------------------------------------------------------------------------------- *selected plants list 
    selectPlantAtPoint(aPoint: TPoint, shift: boolean): void {
        let newCommand: PdCommand
        let newList: PdPlant[] = []
        let plant: PdPlant
        let i: short
        
        plant = domain.plantManager.findPlantAtPoint(aPoint)
        newList = delphi_compatability.TList().Create()
        try {
            if ((shift) && (this.selectedPlants.length > 0)) {
                for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                    newList.Add(this.selectedPlants[i])
                }
            }
            if (newList.IndexOf(plant) >= 0) {
                newList.Remove(plant)
            } else if (plant !== null) {
                newList.Add(plant)
            }
            if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
                newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
                this.doCommand(newCommand)
            }
        } finally {
            newList.free
        }
    }
    
    selectPlantAtIndex(Shift: TShiftState, index: int): void {
        let newCommand: PdCommand
        let newList: PdPlant[] = []
        let i: short
        let plant: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        if ((index < 0)) {
            if (this.selectedPlants.length <= 0) {
                return
            }
            newList = delphi_compatability.TList().Create()
            try {
                newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
                this.doCommand(newCommand)
            } finally {
                newList.free
            }
            return
        }
        plant = this.plants[index]
        if (plant === null) {
            return
        }
        newList = delphi_compatability.TList().Create()
        try {
            if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
                if (this.selectedPlants.length > 0) {
                    for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                        newList.Add(this.selectedPlants[i])
                    }
                }
                if (newList.IndexOf(plant) >= 0) {
                    newList.Remove(plant)
                } else {
                    newList.Add(plant)
                }
            } else if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                if (this.selectedPlants.length > 0) {
                    for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                        newList.Add(this.selectedPlants[i])
                    }
                }
                if ((this.lastSingleClickPlantIndex >= 0) && (this.lastSingleClickPlantIndex <= this.plants.length - 1) && (this.lastSingleClickPlantIndex !== index)) {
                    if (this.lastSingleClickPlantIndex < index) {
                        for (i = this.lastSingleClickPlantIndex; i <= index; i++) {
                            if (newList.IndexOf(this.plants[i]) < 0) {
                                newList.Add(this.plants[i])
                            }
                        }
                    } else if (this.lastSingleClickPlantIndex > index) {
                        for (i = this.lastSingleClickPlantIndex; i >= index; i--) {
                            if (newList.IndexOf(this.plants[i]) < 0) {
                                newList.Add(this.plants[i])
                            }
                        }
                    }
                }
            } else {
                if (this.isSelected(plant)) {
                    if (this.selectedPlants.length > 0) {
                        for (i = 0; i <= this.selectedPlants.length - 1; i++) {
                            newList.Add(this.selectedPlants[i])
                        }
                    }
                } else {
                    newList.Add(plant)
                    this.lastSingleClickPlantIndex = index
                }
            }
            if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
                newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
                this.doCommand(newCommand)
            }
        } finally {
            newList.free
        }
    }
    
    twoListsAreIdentical(firstList: PdPlant[], secondList: PdPlant[]): boolean {
        let result = false
        let i: long
        
        result = false
        if ((firstList === null) || (secondList === null)) {
            return result
        }
        if (firstList.length !== secondList.length) {
            return result
        }
        if (firstList.length <= 0) {
            return result
        }
        for (i = 0; i <= firstList.length - 1; i++) {
            if (firstList[i] !== secondList[i]) {
                return result
            }
        }
        result = true
        return result
    }
    
    deselectAllPlants(): void {
        this.selectedPlants.Clear()
        this.updateForChangeToPlantSelections()
    }
    
    deselectAllPlantsButFirst(): void {
        let firstPlant: PdPlant
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        firstPlant = this.focusedPlant()
        this.selectedPlants.Clear()
        this.selectedPlants.Add(firstPlant)
        this.updateForChangeToPlantSelections()
    }
    
    selectFirstPlantInPlantList(): void {
        if (this.plants.length <= 0) {
            return
        }
        this.selectedPlants.Clear()
        this.selectedPlants.Add(this.plants[0])
        this.updateForChangeToPlantSelections()
    }
    
    showOnePlantExclusively(drawNow: boolean): void {
        let booleansList: TListCollection
        let i: short
        let plant: PdPlant
        let firstPlant: PdPlant
        
        booleansList = null
        firstPlant = this.focusedPlant()
        try {
            ucursor.cursor_startWait()
            booleansList = ucollect.TListCollection().Create()
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (plant !== null) {
                    booleansList.Add(PdBooleanValue().createWithBoolean(!(plant === firstPlant)))
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
            booleansList.free
            ucursor.cursor_stopWait()
        }
    }
    
    redrawFocusedPlantOnly(drawNow: boolean): void {
        let firstPlant: PdPlant
        
        firstPlant = this.focusedPlant()
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
            this.selectedPlants.Insert(insertIndex, aPlant)
        } else {
            this.selectedPlants.Add(aPlant)
        }
        this.invalidateDrawingRect(aPlant.boundsRect_pixels())
    }
    
    removeSelectedPlant(aPlant: PdPlant): void {
        this.invalidateDrawingRect(aPlant.boundsRect_pixels())
        this.selectedPlants.Remove(aPlant)
    }
    
    isSelected(plant: PdPlant): boolean {
        let result = false
        result = false
        if ((this.selectedPlants === null) || (this.selectedPlants.length <= 0)) {
            return result
        }
        result = this.selectedPlants.IndexOf(plant) >= 0
        return result
    }
    
    isFocused(plant: PdPlant): boolean {
        let result = false
        result = false
        if (plant === null) {
            return result
        }
        if ((this.selectedPlants === null) || (this.selectedPlants.length <= 0)) {
            return result
        }
        result = this.selectedPlants.IndexOf(plant) === 0
        return result
    }
    
    // selected plants list 
    focusedPlant(): PdPlant {
        let result = new PdPlant()
        result = null
        if (this.selectedPlants.length > 0) {
            result = this.selectedPlants[0]
        }
        return result
    }
    
    focusedPlantIndex(): short {
        let result = 0
        result = -1
        if (this.selectedPlants.length > 0) {
            result = this.plants.IndexOf(this.selectedPlants[0]
        }
        return result
    }
    
    firstUnfocusedPlant(): PdPlant {
        let result = new PdPlant()
        result = null
        if (this.selectedPlants.length > 1) {
            result = this.selectedPlants[1]
        }
        return result
    }
    
    firstSelectedPlantInList(): PdPlant {
        let result = new PdPlant()
        let i: short
        let plant: PdPlant
        
        result = null
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (this.isSelected(plant)) {
                    result = plant
                    return result
                }
            }
        }
        return result
    }
    
    lastSelectedPlantInList(): PdPlant {
        let result = new PdPlant()
        let i: short
        let plant: PdPlant
        
        result = null
        if (this.plants.length > 0) {
            for (i = this.plants.length - 1; i >= 0; i--) {
                plant = this.plants[i]
                if (this.isSelected(plant)) {
                    result = plant
                    return result
                }
            }
        }
        return result
    }
    
    // ------------------------------------------------------------------------------------- *list of plants 
    plantListDrawGridDrawCell(Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
        let plant: PdPlant
        let selected: boolean
        let visibleRect: TRect
        let remainderRect: TRect
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        this.plantListDrawGrid.Canvas.Brush.Color = this.plantListDrawGrid.Color
        this.plantListDrawGrid.Canvas.FillRect(Rect)
        if ((this.plants.length <= 0) || (Row < 0) || (Row > this.plants.length - 1)) {
            return
        }
        // set up plant pointer 
        plant = this.plants[Row]
        if (plant === null) {
            return
        }
        selected = this.isSelected(plant)
        // set up rectangles 
        visibleRect = Rect
        visibleRect.Right = visibleRect.Left + this.plantListDrawGrid.DefaultRowHeight
        remainderRect = Rect
        remainderRect.Left = remainderRect.Left + rWidth(visibleRect)
        // fill first box with white, rest with clHighlight if selected 
        this.plantListDrawGrid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.plantListDrawGrid.Canvas.Brush.Color = this.plantListDrawGrid.Color
        this.plantListDrawGrid.Canvas.FillRect(visibleRect)
        if (!plant.hidden) {
            this.plantListDrawGrid.Canvas.Draw(visibleRect.Left + (visibleRect.Right - visibleRect.Left) / 2 - this.visibleBitmap.Picture.Bitmap.Width / 2, Rect.top, this.visibleBitmap.Picture.Bitmap)
        }
        this.plantListDrawGrid.Canvas.Font = this.plantListDrawGrid.Font
        if (selected) {
            this.plantListDrawGrid.Canvas.Brush.Color = UNRESOLVED.clHighlight
            this.plantListDrawGrid.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            this.plantListDrawGrid.Canvas.Brush.Color = this.plantListDrawGrid.Color
            this.plantListDrawGrid.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        this.plantListDrawGrid.Canvas.FillRect(remainderRect)
        UNRESOLVED.strPCopy(cText, plant.getName())
        // margin for text 
        remainderRect.Left = remainderRect.Left + 5
        UNRESOLVED.winprocs.drawText(this.plantListDrawGrid.Canvas.Handle, cText, len(cText), remainderRect, delphi_compatability.DT_LEFT)
        if (plant === this.focusedPlant()) {
            UNRESOLVED.drawFocusRect(Rect)
        }
    }
    
    plantListDrawGridMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let col: int
        let row: int
        let plant: PdPlant
        let hideList: TList
        let newCommand: PdCommand
        
        if (this.plants.length <= 0) {
            return
        }
        if (Button === delphi_compatability.TMouseButton.mbRight) {
            return
        }
        if (this.justDoubleClickedOnDrawGrid) {
            this.justDoubleClickedOnDrawGrid = false
            return
        } else {
            this.justDoubleClickedOnDrawGrid = false
        }
        col, row = this.plantListDrawGrid.MouseToCell(X, Y, col, row)
        // does updating in command
        this.selectPlantAtIndex(Shift, row)
        if ((X <= 16) && (row >= 0) && (row <= this.plants.length - 1)) {
            plant = this.plants[row]
            if (plant === null) {
                return
            }
            hideList = delphi_compatability.TList().Create()
            try {
                hideList.Add(plant)
                newCommand = new PdHideOrShowCommand(hideList, !plant.hidden)
                this.doCommand(newCommand)
            } finally {
                hideList.free
            }
        }
        if (X > 16) {
            this.plantListDrawGrid.BeginDrag(false)
        }
    }
    
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
        if (delphi_compatability.Application.terminated) {
            return
        }
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
        this.MenuPlantRenameClick(this)
        this.plantListDrawGrid.endDrag(false)
        this.justDoubleClickedOnDrawGrid = true
    }
    
    // list box 
    moveSelectedPlantsUp(): void {
        let i: short
        let plant: PdPlant
        
        if (this.plants.length > 1) {
            // start at 1 because you can't move first one up any more 
            i = 1
            while (i <= this.plants.length - 1) {
                plant = this.plants[i]
                if (this.isSelected(plant)) {
                    this.plants.Move(i, i - 1)
                }
                i += 1
            }
        }
        this.invalidateSelectedPlantRectangles()
        this.updateForPossibleChangeToDrawing()
        this.plantListDrawGrid.Invalidate()
    }
    
    moveSelectedPlantsDown(): void {
        let i: short
        let plant: PdPlant
        
        if (this.plants.length > 1) {
            // start at next to last one because you can't move last one down any more 
            i = this.plants.length - 2
            while (i >= 0) {
                plant = this.plants[i]
                if (this.isSelected(plant)) {
                    this.plants.Move(i, i + 1)
                }
                i -= 1
            }
        }
        this.invalidateSelectedPlantRectangles()
        this.updateForPossibleChangeToDrawing()
        this.plantListDrawGrid.Invalidate()
    }
    
    plantListDrawGridKeyDown(Key: byte, Shift: TShiftState): void {
        switch (Key) {
            case delphi_compatability.VK_DOWN:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutSendBackClick(this)
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() + 1)
                }
                break
            case delphi_compatability.VK_RIGHT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutSendBackClick(this)
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() + 1)
                }
                break
            case delphi_compatability.VK_UP:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutBringForwardClick(this)
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() - 1)
                }
                break
            case delphi_compatability.VK_LEFT:
                if ((delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
                    //swallow key
                    Key = 0
                    this.MenuLayoutBringForwardClick(this)
                } else {
                    Key = 0
                    this.moveUpOrDownWithKeyInPlantList(this.focusedPlantIndex() - 1)
                }
                break
            case delphi_compatability.VK_RETURN:
                Key = 0
                this.MenuPlantRenameClick(this)
                break
        }
        return Key
    }
    
    // mouse handling in drawing 
    // -------------------------------------------------------------------------- *mouse handling in drawing 
    PaintBoxMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let newCommand: PdCommand
        let anchorPoint: TPoint
        let plantClickedOn: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        if (this.actionInProgress) {
            try {
                // error somewhere - user did weird things with mouse buttons - teminate action...
                this.PaintBoxMouseUp(Sender, Button, Shift, X, Y)
            } finally {
                this.actionInProgress = false
            }
        }
        switch (this.cursorModeForDrawing) {
            case kCursorModeSelectDrag:
                if (Button === delphi_compatability.TMouseButton.mbRight) {
                    return
                }
                plantClickedOn = null
                plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
                if (plantClickedOn === null) {
                    if (domain.viewPlantsInMainWindowOnePlantAtATime()) {
                        return
                    }
                    this.rubberBanding = true
                    this.rubberBandStartDragPoint = Point(X, Y)
                    this.rubberBandLastDrawPoint = Point(X, Y)
                    this.rubberBandNeedToRedraw = true
                    // select command made in mouse up
                    return
                } else {
                    this.actionInProgress = true
                    if ((!plantClickedOn.pointIsInResizingRect(Point(X, Y))) && ((!this.isSelected(plantClickedOn)) || (delphi_compatability.TShiftStateEnum.ssShift in Shift))) {
                        this.selectPlantAtPoint(Point(X, Y), (delphi_compatability.TShiftStateEnum.ssShift in Shift) && (!(delphi_compatability.TShiftStateEnum.ssCtrl in Shift)))
                        this.updateForPossibleChangeToDrawing()
                    }
                }
                break
            case kCursorModeScroll:
                break
            case kCursorModeMagnify:
                this.rubberBanding = true
                this.rubberBandStartDragPoint = Point(X, Y)
                this.rubberBandLastDrawPoint = Point(X, Y)
                this.rubberBandNeedToRedraw = true
                break
            case kCursorModeRotate:
                break
            case kCursorModePosingSelect:
                if (domain.options.drawSpeed !== DrawMode.kDrawBest) {
                    if (MessageDialog("To pose a plant, you need the \"Draw Using\" option set to \"Solids.\"" + chr(13) + chr(13) + "Do you want to change it?", mtConfirmation, {mbYes, mbNo, }, 0) === delphi_compatability.IDYES) {
                        this.MenuOptionsBestDrawClick(this)
                    }
                    return
                }
                if (this.tabSet.tabIndex !== kTabPosing) {
                    this.tabSet.tabIndex = kTabPosing
                }
                plantClickedOn = null
                plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
                if (this.isFocused(plantClickedOn)) {
                    this.mouseDownSelectedPlantPartID, this.mouseDownSelectedPlantPartType = plantClickedOn.getInfoForPlantPartAtPoint(Point(X, Y), this.mouseDownSelectedPlantPartID, this.mouseDownSelectedPlantPartType)
                } else {
                    this.mouseDownSelectedPlantPartID = -1
                }
                if (this.mouseDownSelectedPlantPartID === this.selectedPlantPartID) {
                    return
                }
                break
        }
        anchorPoint = Point(X, Y)
        // makes shift-click work as right-click
        this.commandList.rightButtonDown = (Button === delphi_compatability.TMouseButton.mbRight) || (delphi_compatability.TShiftStateEnum.ssShift in Shift)
        newCommand = this.makeMouseCommand(anchorPoint, Shift)
        if (newCommand !== null) {
            this.actionInProgress = this.commandList.mouseDown(newCommand, anchorPoint)
        } else {
            this.actionInProgress = false
        }
        if (this.actionInProgress) {
            this.updateForPossibleChangeToDrawing()
        }
    }
    
    PaintBoxMouseMove(Shift: TShiftState, X: int, Y: int): void {
        let shouldCancelHint: boolean
        let plantClickedOn: PdPlant
        let aRect: TRect
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        if (this.cursorModeForDrawing === kCursorModeSelectDrag) {
            // show cursor that tells you you can resize plant when mouse is in resize rect, but only in select mode
            delphi_compatability.Screen.Cursor = delphi_compatability.crDefault
            plantClickedOn = domain.plantManager.findPlantAtPoint(Point(X, Y))
            if ((domain.options.showSelectionRectangle) && (plantClickedOn !== null) && (plantClickedOn === this.focusedPlant()) && (plantClickedOn.pointIsInResizingRect(Point(X, Y)))) {
                delphi_compatability.Screen.Cursor = delphi_compatability.crSizeNS
            }
        }
        if (!this.actionInProgress) {
            // show hint for plant mouse is over
            shouldCancelHint = false
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
                    delphi_compatability.Application.CancelHint()
                    this.hintActive = false
                }
            }
        }
        if (this.rubberBanding) {
            // continue rubber banding - could be done in either select or magnify mode
            this.undrawRubberBandBox()
            this.drawRubberBandBox(Point(X, Y))
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
    }
    
    PaintBoxMouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let popupPositionInScreenCoords: TPoint
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.plants.length <= 0) {
            return
        }
        if ((Button === delphi_compatability.TMouseButton.mbRight) && (this.cursorModeForDrawing === kCursorModeSelectDrag)) {
            // show popup menu but only if in select/drag mode
            popupPositionInScreenCoords = this.ClientToScreen(Point(X, Y))
            this.PlantPopupMenu.popup(popupPositionInScreenCoords.X, popupPositionInScreenCoords.Y)
            return
        }
        if (this.rubberBanding) {
            // finish rubber banding if doing that, could be in select or magnify mode
            this.rubberBanding = false
            this.undrawRubberBandBox()
            if (this.cursorModeForDrawing === kCursorModeSelectDrag) {
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
            delphi_compatability.Screen.Cursor = delphi_compatability.crDefault
            this.mouseMoveActionInProgress = false
            this.commandList.rightButtonDown = false
            this.actionInProgress = false
        }
    }
    
    PaintBoxDragOver(Source: TObject, X: int, Y: int, State: TDragState, Accept: boolean): void {
        Accept = (Source !== null) && (Sender !== null) && ((ubreedr.BreederForm !== null) && (Source === ubreedr.BreederForm.plantsDrawGrid) || (utimeser.TimeSeriesForm !== null) && (Source === utimeser.TimeSeriesForm.grid))
        return Accept
    }
    
    PaintBoxEndDrag(Target: TObject, X: int, Y: int): void {
        let plantClickedOn: PdPlant
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if ((Target !== null) && (Target instanceof delphi_compatability.TDrawGrid)) {
            plantClickedOn = null
            plantClickedOn = domain.plantManager.findPlantAtPoint(this.commandList.anchorPoint)
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
    
    makeMouseCommand(point: TPoint, shift: TShiftState): PdCommand {
        let result = new PdCommand()
        result = null
        switch (this.cursorModeForDrawing) {
            case kCursorModeSelectDrag:
                if ((delphi_compatability.TShiftStateEnum.ssShift in shift) && (delphi_compatability.TShiftStateEnum.ssCtrl in shift)) {
                    result = null
                    this.commandList.anchorPoint = point
                    this.drawingPaintBox.BeginDrag(true)
                } else if ((delphi_compatability.TShiftStateEnum.ssCtrl in shift)) {
                    result = new PdDuplicateCommand(this.selectedPlants)
                } else if ((this.focusedPlant() !== null) && (this.focusedPlant().pointIsInResizingRect(point))) {
                    delphi_compatability.Screen.Cursor = delphi_compatability.crSizeNS
                    result = new PdResizePlantsCommand(this.selectedPlants)
                } else {
                    result = new PdDragCommand(this.selectedPlants)
                }
                break
            case kCursorModeScroll:
                result = new PdScrollCommand()
                break
            case kCursorModeMagnify:
                if ((this.commandList.rightButtonDown)) {
                    // to zoom out, can do right button or shift
                    delphi_compatability.Screen.Cursor = ucursor.crMagMinus
                    result = new PdChangeMagnificationCommand()
                    (result).shift = true
                } else {
                    result = new PdChangeMagnificationCommand()
                    (result).shift = (delphi_compatability.TShiftStateEnum.ssShift in shift)
                }
                break
            case kCursorModeRotate:
                if (this.commandList.rightButtonDown) {
                    delphi_compatability.Screen.Cursor = delphi_compatability.crSizeWE
                }
                result = new PdRotateCommand(this.selectedPlants)
                break
            case kCursorModePosingSelect:
                result = new PdSelectPosingPartCommand(this.focusedPlant(), this.mouseDownSelectedPlantPartID, this.selectedPlantPartID, this.mouseDownSelectedPlantPartType, this.selectedPlantPartType)
                break
        }
        return result
    }
    
    // rubber banding 
    // ----------------------------------------------------------------------- *rubber banding 
    selectPlantsInRubberBandBox(): void {
        let rubberBandRect: TRect
        let newList: TList
        let newCommand: PdCommand
        
        newList = delphi_compatability.TList().Create()
        try {
            rubberBandRect = Rect(umath.intMin(this.rubberBandStartDragPoint.X, this.rubberBandLastDrawPoint.X), umath.intMin(this.rubberBandStartDragPoint.Y, this.rubberBandLastDrawPoint.Y), umath.intMax(this.rubberBandStartDragPoint.X, this.rubberBandLastDrawPoint.X), umath.intMax(this.rubberBandStartDragPoint.Y, this.rubberBandLastDrawPoint.Y))
            domain.plantManager.fillListWithPlantsInRectangle(rubberBandRect, newList)
            if (!this.twoListsAreIdentical(this.selectedPlants, newList)) {
                newCommand = new PdChangeSelectedPlantsCommand(this.selectedPlants, newList)
                this.doCommand(newCommand)
            }
        } finally {
            newList.free
        }
    }
    
    drawRubberBandBox(newPoint: TPoint): void {
        this.rubberBandLastDrawPoint = newPoint
        this.drawOrUndrawRubberBandBox()
        this.rubberBandNeedToRedraw = true
    }
    
    undrawRubberBandBox(): void {
        if (!this.rubberBandNeedToRedraw) {
            return
        }
        this.drawOrUndrawRubberBandBox()
        this.rubberBandNeedToRedraw = false
    }
    
    drawOrUndrawRubberBandBox(): void {
        let theDC: HDC
        let drawRect: TRect
        
        theDC = UNRESOLVED.getDC(0)
        drawRect = Rect(this.ClientOrigin.X + this.drawingPaintBox.Left + this.rubberBandStartDragPoint.X, this.ClientOrigin.Y + this.drawingPaintBox.Top + this.rubberBandStartDragPoint.Y, this.ClientOrigin.X + this.drawingPaintBox.Left + this.rubberBandLastDrawPoint.X, this.ClientOrigin.Y + this.drawingPaintBox.Top + this.rubberBandLastDrawPoint.Y)
        UNRESOLVED.patBlt(theDC, drawRect.Left, drawRect.Top, drawRect.Right - drawRect.Left, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.patBlt(theDC, drawRect.Right, drawRect.Top, 1, drawRect.Bottom - drawRect.Top, delphi_compatability.DSTINVERT)
        UNRESOLVED.patBlt(theDC, drawRect.Left, drawRect.Bottom, drawRect.Right - drawRect.Left, 1, delphi_compatability.DSTINVERT)
        UNRESOLVED.patBlt(theDC, drawRect.Left, drawRect.Top, 1, drawRect.Bottom - drawRect.Top, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
    }
    
    // hint handling 
    // ------------------------------------------------------------------------------------ *hint handling 
    DoShowHint(HintStr: ansistring, CanShow: boolean, HintInfo: THintInfo): void {
        raise "method DoShowHint had assigned to var parameter HintStr not added to return -- fixup manually"
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
        return CanShow
    }
    
    hintForPlantAtPoint(aPoint: TPoint): string {
        let result = ""
        let plant: PdPlant
        
        result = ""
        plant = null
        plant = domain.plantManager.findPlantAtPoint(aPoint)
        if (plant !== null) {
            // v1.60 final
            result = plant.getHint(aPoint)
        }
        if ((this.cursorModeForDrawing === kCursorModeSelectDrag) && (domain.options.showLongHintsForButtons) && (domain.options.showSelectionRectangle) && (plant !== null) && (plant === this.focusedPlant()) && (plant.pointIsInResizingRect(aPoint))) {
            // extra hint if over resizing rect on focused plant in select/drag mode
            result = result + ": Click here and drag up or down to resize all selected plants."
        }
        return result
    }
    
    // -------------------------------------------------------------------------------- *popup menu commands 
    PopupMenuCutClick(): void {
        this.MenuEditCutClick(this)
    }
    
    PopupMenuCopyClick(): void {
        this.MenuEditCopyClick(this)
    }
    
    PopupMenuPasteClick(): void {
        this.MenuEditPasteClick(this)
    }
    
    PopupMenuRenameClick(): void {
        this.MenuPlantRenameClick(this)
    }
    
    PopupMenuRandomizeClick(): void {
        this.MenuPlantRandomizeClick(this)
    }
    
    PopupMenuHideAllOthersClick(): void {
        this.MenuLayoutHideOthersClick(this)
    }
    
    PopupMenuBreedClick(): void {
        this.MenuPlantBreedClick(this)
    }
    
    PopupMenuHideClick(): void {
        this.MenuLayoutHideClick(this)
    }
    
    PopupMenuShowClick(): void {
        this.MenuLayoutShowClick(this)
    }
    
    PopupMenuMakeTimeSeriesClick(): void {
        this.MenuPlantMakeTimeSeriesClick(this)
    }
    
    PopupMenuZeroRotationsClick(): void {
        this.MenuPlantZeroRotationsClick(this)
    }
    
    PopupMenuAnimateClick(): void {
        this.MenuPlantAnimateClick(this)
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
        let section: PdSection
        let helpID: string
        
        section = this.currentSection()
        if (section === null) {
            return
        }
        helpID = this.sectionHelpIDForSectionName(section.getName())
        if (helpID !== "") {
            delphi_compatability.Application.HelpJump(helpID)
        }
    }
    
    // new v1.4
    paramPopupMenuCopyNameClick(): void {
        let textToCopy: string
        let newText: string
        
        if (this.selectedParameterPanel === null) {
            return
        }
        if (this.currentSection() !== null) {
            textToCopy = this.currentSection().getName() + ": "
        } else {
            textToCopy = ""
        }
        textToCopy = textToCopy + this.selectedParameterPanel.Caption
        if (usupport.found("[", textToCopy)) {
            // v2.1 deal with orthogonal sections
            newText = usupport.stringUpTo(usupport.stringBeyond(textToCopy, "["), "]")
            newText = newText + ": " + trim(usupport.stringUpTo(usupport.stringBeyond(textToCopy, ":"), "["))
            textToCopy = newText
        }
        UNRESOLVED.Clipboard.asText = textToCopy
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
    
    // ------------------------------------------------------------------------------------ *toolbar 
    dragCursorModeClick(): void {
        this.drawingPaintBox.Cursor = delphi_compatability.crArrow
        this.cursorModeForDrawing = kCursorModeSelectDrag
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    magnifyCursorModeClick(): void {
        this.drawingPaintBox.Cursor = ucursor.crMagPlus
        this.cursorModeForDrawing = kCursorModeMagnify
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    posingSelectionCursorModeClick(): void {
        this.tabSet.tabIndex = kTabPosing
        this.drawingPaintBox.Cursor = ucursor.crPosingSelect
        this.cursorModeForDrawing = kCursorModePosingSelect
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    scrollCursorModeClick(): void {
        this.drawingPaintBox.Cursor = ucursor.crScroll
        this.cursorModeForDrawing = kCursorModeScroll
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    rotateCursorModeClick(): void {
        this.drawingPaintBox.Cursor = ucursor.crRotate
        this.cursorModeForDrawing = kCursorModeRotate
        if (domain.options.showSelectionRectangle) {
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    centerDrawingClick(): void {
        let newCommand: PdCommand
        
        newCommand = new PdCenterDrawingCommand()
        this.doCommand(newCommand)
    }
    
    magnificationPercentClick(): void {
        let newScale: float
        
        newScale = this.magnifyScaleForText(this.magnificationPercent.Text)
        if ((newScale !== domain.plantDrawScale_PixelsPerMm())) {
            this.changeMagnificationWithoutClick()
        }
    }
    
    magnificationPercentExit(): void {
        let newScale: float
        
        newScale = this.magnifyScaleForText(this.magnificationPercent.Text)
        if ((newScale !== domain.plantDrawScale_PixelsPerMm())) {
            this.changeMagnificationWithoutClick()
        }
    }
    
    magnifyPlusClick(): void {
        let newCommand: PdCommand
        
        newCommand = new PdChangeMagnificationCommand(domain.plantDrawScale_PixelsPerMm() * 1.5, Point(this.drawingPaintBox.Width / 2, this.drawingPaintBox.Height / 2))
        this.doCommand(newCommand)
    }
    
    magnifyMinusClick(): void {
        let newCommand: PdCommand
        
        newCommand = new PdChangeMagnificationCommand(domain.plantDrawScale_PixelsPerMm() * 0.75, Point(this.drawingPaintBox.Width / 2, this.drawingPaintBox.Height / 2))
        this.doCommand(newCommand)
    }
    
    // popup menu commands 
    // toolbar 
    changeMagnificationWithoutClick(): void {
        let newCommand: PdCommand
        
        newCommand = new PdChangeMagnificationCommand(this.magnifyScaleForText(this.magnificationPercent.Text), Point(this.drawingPaintBox.Width / 2, this.drawingPaintBox.Height / 2))
        this.doCommand(newCommand)
    }
    
    magnifyScaleForText(aText: string): float {
        let result = 0.0
        let intResult: int
        let oldIntResult: int
        
        result = 1.0
        try {
            oldIntResult = intround(domain.plantDrawScale_PixelsPerMm() * 100.0)
            intResult = StrToIntDef(usupport.stringUpTo(aText, "%"), -1)
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
    
    magnifyOrReduce(newScale_PixelsPerMm: float, point_pixels: TPoint, drawNow: boolean): TPoint {
        let result = new TPoint()
        let oldOffset_mm: SinglePoint
        let pointInOldScale_mm: SinglePoint
        let pointInNewScale_mm: SinglePoint
        let newOffset_mm: SinglePoint
        let oldScale_PixelsPerMm: float
        
        this.recalculateAllPlantBoundsRects(kDontDrawYet)
        oldScale_PixelsPerMm = domain.plantDrawScale_PixelsPerMm()
        oldOffset_mm = domain.plantDrawOffset_mm()
        pointInOldScale_mm = usupport.setSinglePoint(intround(point_pixels.X / oldScale_PixelsPerMm), intround(point_pixels.Y / oldScale_PixelsPerMm))
        pointInNewScale_mm = usupport.setSinglePoint(intround(point_pixels.X / newScale_PixelsPerMm), intround(point_pixels.Y / newScale_PixelsPerMm))
        newOffset_mm = usupport.setSinglePoint(oldOffset_mm.x + pointInNewScale_mm.x - pointInOldScale_mm.x, oldOffset_mm.y + pointInNewScale_mm.y - pointInOldScale_mm.y)
        domain.plantManager.plantDrawScale_PixelsPerMm = intround(newScale_PixelsPerMm * 100.0) / 100.0
        domain.plantManager.plantDrawOffset_mm = newOffset_mm
        if (drawNow) {
            this.redrawEverything()
        }
        this.magnificationPercent.Text = IntToStr(intround(domain.plantDrawScale_PixelsPerMm() * 100.0)) + "%"
        return result
    }
    
    upperLeftMostPlantBoundsRectPoint_mm(): TPoint {
        let result = new TPoint()
        let plant: PdPlant
        let i: short
        let topLeft_mm: TPoint
        let initialized: boolean
        
        result = Point(0, 0)
        initialized = false
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
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
        let result = new TPoint()
        let plant: PdPlant
        let i: short
        let bottomRight_mm: TPoint
        let initialized: boolean
        
        result = Point(0, 0)
        initialized = false
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
                if (plant.hidden) {
                    continue
                }
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
        let increment: int
        let oldXLocation: int
        let newXLocation: int
        let direction: short
        
        if (this.focusedPlant() === null) {
            return
        }
        oldXLocation = this.focusedPlant().basePoint_pixels().X
        newXLocation = StrToIntDef(this.xLocationEdit.Text, oldXLocation)
        if (newXLocation !== oldXLocation) {
            increment = newXLocation - oldXLocation
            if (increment > 0) {
                direction = utdomove.kRight
            } else {
                direction = utdomove.kLeft
            }
            this.nudgeSelectedPlantsByPixelsAndDirection(increment, direction)
        }
    }
    
    yLocationEditExit(): void {
        let increment: int
        let oldYLocation: int
        let newYLocation: int
        let direction: short
        
        if (this.focusedPlant() === null) {
            return
        }
        oldYLocation = this.focusedPlant().basePoint_pixels().Y
        newYLocation = StrToIntDef(this.yLocationEdit.Text, oldYLocation)
        if (newYLocation !== oldYLocation) {
            increment = newYLocation - oldYLocation
            if (increment > 0) {
                direction = kDown
            } else {
                direction = kUp
            }
            this.nudgeSelectedPlantsByPixelsAndDirection(increment, direction)
        }
    }
    
    xLocationSpinDownClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, utdomove.kLeft)
    }
    
    xLocationSpinUpClick(): void {
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, utdomove.kRight)
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
        let newRotation: short
        let oldRotation: short
        
        if (this.internalChange) {
            return
        }
        newRotation = StrToIntDef(edit.Text, 0)
        oldRotation = newRotation
        if (newRotation < -360) {
            newRotation = 360 - (abs(newRotation) - 360)
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
        let newRotation: short
        let newCommand: PdCommand
        
        if (this.internalChange) {
            return
        }
        newRotation = StrToIntDef(edit.Text, 0) + changeInRotation
        edit.Text = IntToStr(newRotation)
        // need this? 
        this.checkRotationEditAgainstBounds(edit)
        // in case changed 
        newRotation = StrToIntDef(edit.Text, 0)
        if (this.focusedPlant() === null) {
            //should be disabled, but
            return
        }
        newCommand = new PdRotateCommand(this.selectedPlants, rotateDirection, newRotation)
        this.doCommand(newCommand)
    }
    
    resetRotationsClick(): void {
        let newCommand: PdCommand
        let i: short
        let plant: PdPlant
        let allRotationsAreZero: boolean
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        // don't do if none of the selected plants have rotations other than zero 
        allRotationsAreZero = true
        for (i = 0; i <= this.selectedPlants.length - 1; i++) {
            plant = this.selectedPlants[i]
            if ((plant.xRotation !== 0) || (plant.yRotation !== 0) || (plant.zRotation !== 0)) {
                allRotationsAreZero = false
                break
            }
        }
        if (allRotationsAreZero) {
            return
        }
        newCommand = new PdResetRotationsCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    drawingScaleEditExit(): void {
        let oldValue: float
        let newValue: float
        
        if (this.focusedPlant() === null) {
            return
        }
        oldValue = this.focusedPlant().drawingScale_PixelsPerMm
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
        let resizeMultiplier: float
        
        if (this.focusedPlant() === null) {
            return
        }
        resizeMultiplier = domain.options.resizeKeyUpMultiplierPercent / 100.0
        this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    }
    
    drawingScaleSpinDownClick(): void {
        let resizeMultiplier: float
        
        if (this.focusedPlant() === null) {
            return
        }
        resizeMultiplier = safedivExcept(1.0, domain.options.resizeKeyUpMultiplierPercent / 100.0, 0.9)
        this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    }
    
    makeEqualWidthClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdResizePlantsToSameWidthOrHeightCommand(this.selectedPlants, rWidth(this.focusedPlant().boundsRect_pixels()), 0, kChangeWidth)
        this.doCommand(newCommand)
    }
    
    makeEqualHeightClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdResizePlantsToSameWidthOrHeightCommand(this.selectedPlants, 0, rHeight(this.focusedPlant().boundsRect_pixels()), kChangeHeight)
        this.doCommand(newCommand)
    }
    
    MenuLayoutSizeSameWidthClick(): void {
        this.makeEqualWidthClick(this)
    }
    
    MenuLayoutSizeSameHeightClick(): void {
        this.makeEqualHeightClick(this)
    }
    
    alignTopsClick(): void {
        this.alignSelectedPlants(kUp)
    }
    
    alignBottomsClick(): void {
        this.alignSelectedPlants(kDown)
    }
    
    alignLeftClick(): void {
        this.alignSelectedPlants(utdomove.kLeft)
    }
    
    alignRightClick(): void {
        this.alignSelectedPlants(utdomove.kRight)
    }
    
    alignSelectedPlants(alignDirection: short): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 1) {
            return
        }
        newCommand = new PdAlignPlantsCommand(this.selectedPlants, this.focusedPlant().boundsRect_pixels(), alignDirection)
        this.doCommand(newCommand)
    }
    
    MenuLayoutAlignTopsClick(): void {
        this.alignTopsClick(this)
    }
    
    MenuLayoutAlignBottomsClick(): void {
        this.alignBottomsClick(this)
    }
    
    MenuLayoutAlignLeftSidesClick(): void {
        this.alignLeftClick(this)
    }
    
    MenuLayoutAlignRightSidesClick(): void {
        this.alignRightClick(this)
    }
    
    packPlantsClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 1) {
            return
        }
        newCommand = new PdPackPlantsCommand(this.selectedPlants, this.focusedPlant().boundsRect_pixels())
        this.doCommand(newCommand)
    }
    
    MenuLayoutPackClick(): void {
        this.packPlantsClick(this)
    }
    
    FormKeyDown(Key: byte, Shift: TShiftState): void {
        if (this.animateTimer.enabled) {
            // pressing any key will stop animation 
            Key = 0
            this.stopAnimation()
        }
        if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift) && (delphi_compatability.TShiftStateEnum.ssShift in Shift)) {
            if ((Key === delphi_compatability.VK_LEFT) || (Key === delphi_compatability.VK_RIGHT) || (Key === delphi_compatability.VK_UP) || (Key === delphi_compatability.VK_DOWN)) {
                // hold down control and shift and press arrow keys - resize current plants 
                this.resizeSelectedPlantsByKey(Key)
                Key = 0
            }
            // hold down control and press arrow keys - shift current plants 
        } else if ((delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
            if ((Key === delphi_compatability.VK_LEFT) || (Key === delphi_compatability.VK_RIGHT) || (Key === delphi_compatability.VK_UP) || (Key === delphi_compatability.VK_DOWN)) {
                this.nudgeSelectedPlantsByKey(Key)
                Key = 0
            }
            // hold down shift - do magnification as minus 
        } else if ((Key === delphi_compatability.VK_SHIFT)) {
            if (this.cursorModeForDrawing === kCursorModeMagnify) {
                this.drawingPaintBox.Cursor = ucursor.crMagMinus
            }
        }
        return Key
    }
    
    nudgeSelectedPlantsByKey(key: byte): void {
        let direction: short
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        switch (key) {
            case delphi_compatability.VK_LEFT:
                direction = utdomove.kLeft
                break
            case delphi_compatability.VK_RIGHT:
                direction = utdomove.kRight
                break
            case delphi_compatability.VK_UP:
                direction = kUp
                break
            case delphi_compatability.VK_DOWN:
                direction = kDown
                break
            default:
                return
                break
        }
        this.nudgeSelectedPlantsByPixelsAndDirection(domain.options.nudgeDistance, direction)
    }
    
    nudgeSelectedPlantsByPixelsAndDirection(pixels: int, direction: short): void {
        let newCommand: PdCommand
        let movePoint: TPoint
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        movePoint = Point(0, 0)
        switch (direction) {
            case kUp:
                movePoint.Y = -pixels
                break
            case kDown:
                movePoint.Y = pixels
                break
            case utdomove.kLeft:
                movePoint.X = -pixels
                break
            case utdomove.kRight:
                movePoint.X = pixels
                break
        }
        newCommand = new PdDragCommand(this.selectedPlants, movePoint)
        this.doCommand(newCommand)
    }
    
    resizeSelectedPlantsByKey(key: byte): void {
        let resizeMultiplier: float
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        if ((key === delphi_compatability.VK_LEFT) || (key === delphi_compatability.VK_UP)) {
            resizeMultiplier = domain.options.resizeKeyUpMultiplierPercent / 100.0
        } else if ((key === delphi_compatability.VK_RIGHT) || (key === delphi_compatability.VK_DOWN)) {
            resizeMultiplier = safedivExcept(1.0, domain.options.resizeKeyUpMultiplierPercent / 100.0, 0.9)
        } else {
            return
        }
        this.resizeSelectedPlantsWithMultiplierOrNewAmount(resizeMultiplier, 0)
    }
    
    resizeSelectedPlantsWithMultiplierOrNewAmount(multiplier: float, newAmount_pixelsPerMm: float): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        if (multiplier !== 0) {
            newCommand = new PdResizePlantsCommand(this.selectedPlants, multiplier)
        } else {
            newCommand = new PdResizePlantsCommand(this.selectedPlants, newAmount_pixelsPerMm)
        }
        this.doCommand(newCommand)
    }
    
    FormKeyPress(Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        if (this.animateTimer.enabled) {
            // pressing any key will stop animation 
            Key = chr(0)
            this.stopAnimation()
        }
        return Key
    }
    
    FormKeyUp(Key: byte, Shift: TShiftState): void {
        if (this.animateTimer.enabled) {
            // pressing any key will stop animation 
            Key = 0
            this.stopAnimation()
        }
        if ((Key === delphi_compatability.VK_SHIFT)) {
            if (this.cursorModeForDrawing === kCursorModeMagnify) {
                // let up shift or control - go back to plus magnification 
                this.drawingPaintBox.Cursor = ucursor.crMagPlus
            }
        }
        return Key
    }
    
    // tab set 
    // ------------------------------------------------------------------------------------ *tab set 
    lifeCycleShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabLifeCycle)
        return result
    }
    
    rotationsShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabRotations)
        return result
    }
    
    parametersShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabParameters)
        return result
    }
    
    statsShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabStatistics)
        return result
    }
    
    noteShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabNote)
        return result
    }
    
    posingShowing(): boolean {
        let result = false
        result = (this.tabSet.tabIndex === kTabPosing)
        return result
    }
    
    tabSetChange(NewTab: int, AllowChange: boolean): void {
        this.lifeCyclePanel.Visible = (NewTab === kTabLifeCycle)
        this.rotationsPanel.Visible = (NewTab === kTabRotations)
        this.parametersPanel.Visible = (NewTab === kTabParameters)
        this.statsScrollBox.Visible = (NewTab === kTabStatistics)
        this.notePanel.Visible = (NewTab === kTabNote)
        this.posingPanel.Visible = (NewTab === kTabPosing)
        this.updateRightSidePanelForFirstSelectedPlantWithTab(NewTab)
        return AllowChange
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
        let result = new TColorRef()
        if (this.focusedPlant() !== null) {
            if (payAttentionToMultiSelect) {
                if (this.selectedPlants.length <= 1) {
                    result = UNRESOLVED.clBtnText
                } else {
                    // v2.0  was clRed
                    result = delphi_compatability.clBlue
                }
            } else {
                result = UNRESOLVED.clBtnText
            }
        } else {
            result = delphi_compatability.clGray
        }
        return result
    }
    
    updateForChangeToPlantRotations(): void {
        let firstPlant: PdPlant
        
        firstPlant = this.focusedPlant()
        if (firstPlant !== null) {
            this.xRotationEdit.Text = IntToStr(intround(firstPlant.xRotation))
            this.yRotationEdit.Text = IntToStr(intround(firstPlant.yRotation))
            this.zRotationEdit.Text = IntToStr(intround(firstPlant.zRotation))
        } else {
            this.xRotationEdit.Text = ""
            this.yRotationEdit.Text = ""
            this.zRotationEdit.Text = ""
        }
        this.xRotationEdit.Refresh()
        this.yRotationEdit.Refresh()
        this.zRotationEdit.Refresh()
    }
    
    updateForChangeToSelectedPlantsDrawingScale(): void {
        let firstPlant: PdPlant
        
        firstPlant = this.focusedPlant()
        if (firstPlant !== null) {
            this.drawingScaleEdit.Text = usupport.digitValueString(firstPlant.drawingScale_PixelsPerMm)
        } else {
            this.drawingScaleEdit.Text = ""
        }
        this.drawingScaleEdit.Refresh()
    }
    
    updateForChangeToSelectedPlantsLocation(): void {
        let firstPlant: PdPlant
        
        firstPlant = this.focusedPlant()
        if (firstPlant !== null) {
            this.xLocationEdit.Text = usupport.digitValueString(firstPlant.basePoint_pixels().X)
            this.yLocationEdit.Text = usupport.digitValueString(firstPlant.basePoint_pixels().Y)
        } else {
            this.xLocationEdit.Text = ""
            this.yLocationEdit.Text = ""
        }
        this.xLocationEdit.Refresh()
        this.yLocationEdit.Refresh()
    }
    
    // ------------------------------------------------------- *life cycle panel drawing and mouse handling 
    updateLifeCyclePanelForFirstSelectedPlant(): void {
        let firstPlant: PdPlant
        
        this.updatePlantNameLabel(kTabLifeCycle)
        firstPlant = this.focusedPlant()
        this.lifeCycleDaysEdit.Enabled = firstPlant !== null
        this.lifeCycleDaysSpin.Enabled = firstPlant !== null
        this.lifeCycleDragger.Enabled = firstPlant !== null
        this.animateGrowth.Enabled = firstPlant !== null
        this.timeLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        this.maxSizeAxisLabel.Font.Color = this.timeLabel.Font.Color
        this.ageAndSizeLabel.Font.Color = this.timeLabel.Font.Color
        this.daysAndSizeLabel.Font.Color = this.timeLabel.Font.Color
        if (firstPlant !== null) {
            //special case
            this.lifeCycleDragger.Color = delphi_compatability.clRed
        } else {
            this.lifeCycleDragger.Color = delphi_compatability.clGray
        }
        // reset red dragger panel 
        this.placeLifeCycleDragger()
        if (firstPlant !== null) {
            // set life cycle days in edit 
            this.lifeCycleDaysEdit.Text = IntToStr(firstPlant.age)
        } else {
            this.lifeCycleDaysEdit.Text = "0"
        }
        if (firstPlant !== null) {
            // set % size label
            this.daysAndSizeLabel.Caption = "days, " + IntToStr(intround(firstPlant.totalBiomass_pctMPB)) + "% max size"
        } else {
            this.daysAndSizeLabel.Caption = ""
        }
        this.placeLifeCycleDragger()
        this.redrawLifeCycleGraph()
    }
    
    updatePlantNameLabel(tabIndex: short): void {
        let firstPlant: PdPlant
        let labelToChange: TLabel
        let payAttentionToOtherPlants: boolean
        let prefix: string
        let handlingDifferently: boolean
        
        firstPlant = this.focusedPlant()
        payAttentionToOtherPlants = true
        handlingDifferently = false
        prefix = ""
        labelToChange = null
        switch (tabIndex) {
            case kTabRotations:
                labelToChange = this.arrangementPlantName
                prefix = "Arrangement for "
                break
            case kTabParameters:
                labelToChange = this.parametersPlantName
                prefix = "Parameters for "
                break
            case kTabLifeCycle:
                labelToChange = this.selectedPlantNameLabel
                prefix = "Life cycle for "
                break
            case kTabPosing:
                labelToChange = this.posingPlantName
                payAttentionToOtherPlants = false
                prefix = "Posing for "
                break
            case kTabStatistics:
                handlingDifferently = true
                this.statsPanel.updatePlant(firstPlant)
                break
            case kTabNote:
                labelToChange = this.noteLabel
                payAttentionToOtherPlants = false
                prefix = "Note for "
                break
        }
        if ((handlingDifferently) || (labelToChange === null)) {
            return
        }
        if (firstPlant !== null) {
            labelToChange.Caption = prefix + firstPlant.getName()
            if ((payAttentionToOtherPlants) && (this.selectedPlants.length > 1)) {
                labelToChange.Caption = labelToChange.Caption + " (and other plants)"
            }
        } else {
            labelToChange.Caption = "(no plants selected)"
        }
        labelToChange.Font.Color = this.textColorToRepresentPlantSelection(payAttentionToOtherPlants)
    }
    
    animateGrowthClick(): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdAnimatePlantCommand(this.selectedPlants)
        this.doCommand(newCommand)
    }
    
    MenuPlantAnimateClick(): void {
        this.animateGrowthClick(this)
    }
    
    // animation 
    startAnimation(): void {
        // called by animate command, which also sets up the pointer for the timer to call 
        // disable all non-modal forms 
        // keeps space bar from affecting magnification
        this.ActiveControl = this.plantListDrawGrid
        this.enableOrDisableAllForms(kDisableAllForms)
        // add warning about disabled forms 
        this.animatingLabel.Visible = true
        this.tabSet.visible = false
        // start timer 
        this.animateTimer.enabled = true
    }
    
    animateTimerTimer(): void {
        if (this.animateCommand !== null) {
            PdAnimatePlantCommand(this.animateCommand).animateOneDay()
        }
    }
    
    stopAnimation(): void {
        // called by animate command or self (if user clicks in drawing area or presses a key) 
        // stop timer 
        this.animateTimer.enabled = false
        // nil out pointer 
        this.animateCommand = null
        // re-enable everything 
        this.enableOrDisableAllForms(kEnableAllForms)
        // remove warning about disabled forms 
        this.animatingLabel.Visible = false
        this.tabSet.visible = true
        if (domain.options.showSelectionRectangle) {
            // if there were selection rectangles before, put them back 
            this.copyDrawingBitmapToPaintBox()
        }
    }
    
    enableOrDisableAllForms(enable: boolean): void {
        // cfk note: put any new NON-MODAL forms here 
        this.Enabled = enable
        ubreedr.BreederForm.Enabled = enable
        utimeser.TimeSeriesForm.Enabled = enable
        udebug.DebugForm.Enabled = enable
    }
    
    lifeCycleDaysEditExit(): void {
        let newAge: short
        let plant: PdPlant
        
        plant = this.focusedPlant()
        if (plant === null) {
            return
        }
        newAge = StrToIntDef(this.lifeCycleDaysEdit.Text, 0)
        if (newAge === plant.age) {
            return
        }
        if (newAge > plant.pGeneral.ageAtMaturity) {
            newAge = this.focusedPlant().pGeneral.ageAtMaturity
            this.lifeCycleDaysEdit.Text = IntToStr(newAge)
        }
        this.changeSelectedPlantAges(newAge)
    }
    
    lifeCycleDaysSpinUpClick(): void {
        let newAge: short
        
        if (this.focusedPlant() === null) {
            return
        }
        newAge = umath.intMin(StrToIntDef(this.lifeCycleDaysEdit.Text, 0) + 1, this.focusedPlant().pGeneral.ageAtMaturity)
        newAge = umath.intMax(0, newAge)
        this.lifeCycleDaysEdit.Text = IntToStr(newAge)
        this.changeSelectedPlantAges(newAge)
    }
    
    lifeCycleDaysSpinDownClick(): void {
        let newAge: short
        
        if (this.focusedPlant() === null) {
            return
        }
        newAge = umath.intMin(StrToIntDef(this.lifeCycleDaysEdit.Text, 0) - 1, this.focusedPlant().pGeneral.ageAtMaturity)
        newAge = umath.intMax(0, newAge)
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
        let firstPlant: PdPlant
        let newAge: short
        
        if (this.lifeCycleDragging) {
            this.undrawLifeCycleDraggerLine()
            this.lifeCycleDragger.Left = this.lifeCycleDragger.Left - (this.lifeCycleDraggingStartPos - X)
            if (this.lifeCycleDragger.Left < this.lifeCycleGraphImage.Left) {
                this.lifeCycleDragger.Left = this.lifeCycleGraphImage.Left
            }
            if (this.lifeCycleDragger.Left + this.lifeCycleDragger.Width > this.lifeCycleGraphImage.Left + this.lifeCycleGraphImage.Width) {
                this.lifeCycleDragger.Left = this.lifeCycleGraphImage.Left + this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width
            }
            firstPlant = this.focusedPlant()
            if (firstPlant === null) {
                throw new Error("Problem: First plant is nil during drag in method TMainForm.lifeCycleDraggerMouseUp.")
            }
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
        let result = 0
        let theDC: HDC
        
        theDC = UNRESOLVED.getDC(0)
        result = this.ClientOrigin.X + this.plantFocusPanel.Left + this.lifeCyclePanel.Left + this.lifeCycleDragger.Left + pos + 2
        UNRESOLVED.patBlt(theDC, result, this.ClientOrigin.Y + this.plantFocusPanel.Top + this.lifeCyclePanel.Top + this.lifeCycleDragger.Top, 1, this.lifeCycleDragger.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.lifeCycleDraggingNeedToRedraw = true
        return result
    }
    
    undrawLifeCycleDraggerLine(): void {
        let theDC: HDC
        
        if (!this.lifeCycleDraggingNeedToRedraw) {
            return
        }
        theDC = UNRESOLVED.getDC(0)
        UNRESOLVED.patBlt(theDC, this.lifeCycleDraggingLastDrawPos, this.ClientOrigin.Y + this.plantFocusPanel.Top + this.lifeCyclePanel.Top + this.lifeCycleDragger.Top, 1, this.lifeCycleDragger.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.lifeCycleDraggingNeedToRedraw = false
    }
    
    changeSelectedPlantAges(newAge: short): void {
        let newCommand: PdCommand
        
        if (this.selectedPlants.length <= 0) {
            return
        }
        newCommand = new PdChangePlantAgeCommand(this.selectedPlants, newAge)
        this.doCommand(newCommand)
    }
    
    // life cycle panel drawing and mouse handling 
    redrawLifeCycleGraph(): void {
        let sCurveError: boolean
        
        this.lifeCycleGraphImage.Picture.Bitmap.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        this.lifeCycleGraphImage.Picture.Bitmap.Canvas.Rectangle(0, 0, this.lifeCycleGraphImage.ClientWidth, this.lifeCycleGraphImage.ClientHeight)
        sCurveError = this.drawSCurveOrCheckForError(this.lifeCycleGraphImage.Picture.Bitmap.Canvas, delphi_compatability.Bounds(0, 0, this.lifeCycleGraphImage.ClientWidth, this.lifeCycleGraphImage.ClientHeight), true, sCurveError)
        if (sCurveError && (this.focusedPlant() !== null)) {
            // error - do something, should be caught by parameter panel 
            // PDF PORT -- put in NIL
            null
        }
    }
    
    drawSCurveOrCheckForError(aCanvas: TCanvas, aRect: TRect, draw: boolean, failed: boolean): void {
        let firstPlant: PdPlant
        let i: int
        let x: float
        let y: float
        let thisPoint: TPoint
        let curve: SCurveStructure
        let numPoints: int
        
        firstPlant = this.focusedPlant()
        if (firstPlant === null) {
            return failed
        }
        failed = true
        numPoints = 100
        // assumes that zero does NOT fall between x1 and x2, though one of these could be zero 
        curve.x1 = firstPlant.pGeneral.growthSCurve.x1
        curve.y1 = firstPlant.pGeneral.growthSCurve.y1
        curve.x2 = firstPlant.pGeneral.growthSCurve.x2
        curve.y2 = firstPlant.pGeneral.growthSCurve.y2
        try {
            failed = umath.calcSCurveCoeffsWithResult(curve, failed)
            if (failed) {
                return failed
            }
            for (i = 0; i <= numPoints - 1; i++) {
                // delphi 2.0 wants this 
                x = 0.0
                y = 0.0
                try {
                    x = 1.0 * i / numPoints
                } catch (e) {
                    return failed
                }
                y = umath.scurveWithResult(x, curve.c1, curve.c2, failed)
                if (failed) {
                    return failed
                }
                if (draw) {
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
        let section: PdSection
        let sectionPicture: TPicture
        let selected: boolean
        let textDrawRect: TRect
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if ((this.sectionsComboBox.Items.Count <= 0) || (index < 0) || (index > this.sectionsComboBox.Items.Count - 1)) {
            return
        }
        selected = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // set up section pointer 
        section = this.sectionsComboBox.Items.Objects[index]
        if (section === null) {
            return
        }
        this.sectionsComboBox.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.sectionsComboBox.Canvas.Font = this.sectionsComboBox.Font
        if (selected) {
            this.sectionsComboBox.Canvas.Brush.Color = UNRESOLVED.clHighlight
            this.sectionsComboBox.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            this.sectionsComboBox.Canvas.Brush.Color = this.sectionsComboBox.Color
            this.sectionsComboBox.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        this.sectionsComboBox.Canvas.FillRect(Rect)
        textDrawRect = Rect
        textDrawRect.Left = textDrawRect.Left + 4
        textDrawRect.Top = textDrawRect.Top + (textDrawRect.Bottom - textDrawRect.Top) / 2 - (this.sectionsComboBox.Canvas.TextHeight("W") / 2)
        sectionPicture = this.sectionPictureForSectionName(section.getName())
        if (sectionPicture !== null) {
            this.sectionsComboBox.Canvas.Draw(Rect.left + 4, Rect.top, sectionPicture.Graphic)
        }
        textDrawRect.Left = textDrawRect.Left + 32 + 4
        UNRESOLVED.strPCopy(cText, this.sectionsComboBox.Items[index])
        UNRESOLVED.winprocs.drawText(this.sectionsComboBox.Canvas.Handle, cText, len(cText), textDrawRect, delphi_compatability.DT_LEFT)
    }
    
    sectionsComboBoxChange(): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        this.updateParameterPanelsForSectionChange()
        this.updateSectionPopupMenuForSectionChange()
    }
    
    // parameters panel 
    loadSectionsIntoListBox(): void {
        let section: PdSection
        let i: short
        let indexOfPrimaryInflors: short
        
        if ((domain === null) || (domain.sectionManager === null)) {
            return
        }
        this.sectionsComboBox.Clear()
        if (domain.sectionManager.sections.Count > 0) {
            for (i = 0; i <= domain.sectionManager.sections.Count - 1; i++) {
                section = usection.PdSection(domain.sectionManager.sections.Items[i])
                if (section.showInParametersWindow) {
                    if (section.name === "Primary flowers, advanced") {
                        // kludge to get around necessary ordering of new advanced floral section
                        // advanced floral params are at end of file, but want to show them
                        // in the list before inflorescences
                        // WATCH OUT: change this code if you change the names of the sections
                        indexOfPrimaryInflors = this.sectionsComboBox.Items.IndexOf("Primary inflorescences")
                        this.sectionsComboBox.Items.InsertObject(indexOfPrimaryInflors, section.name, section)
                    } else {
                        this.sectionsComboBox.Items.AddObject(section.name, section)
                    }
                }
            }
        }
        if (domain.sectionManager.orthogonalSections.Count > 0) {
            for (i = 0; i <= domain.sectionManager.orthogonalSections.Count - 1; i++) {
                // v2.1 add orthogonal sections
                section = usection.PdSection(domain.sectionManager.orthogonalSections.Items[i])
                if (section.showInParametersWindow) {
                    this.sectionsComboBox.Items.AddObject(section.name, section)
                }
            }
        }
    }
    
    currentSection(): PdSection {
        let result = new PdSection()
        result = null
        if ((this.sectionsComboBox.Items.Count <= 0) || (this.sectionsComboBox.ItemIndex < 0) || (this.sectionsComboBox.ItemIndex > this.sectionsComboBox.Items.Count - 1)) {
            return result
        }
        result = usection.PdSection(this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex])
        return result
    }
    
    sectionPictureForSectionName(aName: string): TPicture {
        let result = new TPicture()
        let image: TImage
        
        result = null
        if (aName === "(no section)") {
            return result
        }
        image = null
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
        result = ""
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
        let paramPanel: PdParameterPanel
        let oldParamPanel: PdParameterPanel
        let section: PdSection
        let parameter: PdParameter
        let i: short
        
        try {
            ucursor.cursor_startWait()
            // clear out any earlier panels 
            this.selectedParameterPanel = null
            if (this.parametersScrollBox.ControlCount > 0) {
                while (this.parametersScrollBox.ControlCount > 0) {
                    // this is the only valid time to free a component owned by something - after it has
                    //        been removed from the component list (owned objects) of the owner 
                    oldParamPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[0])
                    this.RemoveComponent(oldParamPanel)
                    oldParamPanel.Parent = null
                    oldParamPanel.free
                }
            }
            if (this.sectionsComboBox.ItemIndex < 0) {
                // make new panels for the current section 
                return
            }
            section = this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex]
            if (section.numSectionItems > 0) {
                for (i = 0; i <= section.numSectionItems - 1; i++) {
                    parameter = domain.parameterManager.parameterForFieldNumber(section.sectionItems[i])
                    if (parameter === null) {
                        continue
                    }
                    paramPanel = null
                    // note that the longint type is used to store plant positions, but should not be used
                    //          for parameter panels 
                    switch (parameter.fieldType) {
                        case uparams.kFieldHeader:
                            paramPanel = upp_hed.PdHeaderParameterPanel().createForParameter(this, parameter)
                            break
                        case uparams.kFieldEnumeratedList:
                            paramPanel = upp_lis.PdListParameterPanel().createForParameter(this, parameter)
                            break
                        case uparams.kFieldThreeDObject:
                            paramPanel = upp_tdo.PdTdoParameterPanel().createForParameter(this, parameter)
                            break
                        case uparams.kFieldColor:
                            paramPanel = upp_col.PdColorParameterPanel().createForParameter(this, parameter)
                            break
                        case uparams.kFieldSmallint:
                            paramPanel = upp_int.PdSmallintParameterPanel().createForParameter(this, parameter)
                            break
                        case uparams.kFieldFloat:
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
            ucursor.cursor_stopWait()
        }
    }
    
    paramHelpIDForParamPanel(panel: PdParameterPanel): string {
        let result = ""
        result = ""
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
    
    updateParametersPanelForFirstSelectedPlant(): void {
        let i: int
        let paramPanel: PdParameterPanel
        
        this.updatePlantNameLabel(kTabParameters)
        if (this.parametersScrollBox.ControlCount > 0) {
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                if (this.parametersScrollBox.Controls[i] instanceof uppanel.PdParameterPanel) {
                    paramPanel = this.parametersScrollBox.Controls[i]
                    //panels check if the new plant is different from current one
                    paramPanel.updatePlant(this.focusedPlant())
                }
            }
        }
        this.repositionParameterPanels()
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
        let i: int
        let lastPos: int
        let totalMaxWidth: int
        let panelMaxWidth: int
        let panelMinWidth: int
        let requestedWidth: int
        let windowLock: boolean
        let paramPanel: PdParameterPanel
        let oldPosition: int
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.parametersScrollBox.ControlCount > 0) {
            totalMaxWidth = 0
            lastPos = 0
            oldPosition = this.parametersScrollBox.VertScrollBar.Position
            this.parametersScrollBox.VertScrollBar.Position = 0
            windowLock = UNRESOLVED.lockWindowUpdate(this.Handle)
            requestedWidth = this.parametersScrollBox.ClientWidth
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                paramPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[i])
                paramPanel.Left = 0
                paramPanel.Top = lastPos
                paramPanel.calculateTextDimensions()
                panelMaxWidth = paramPanel.maxWidth()
                panelMinWidth = paramPanel.minWidth(requestedWidth)
                if (panelMaxWidth <= requestedWidth) {
                    paramPanel.Width = panelMaxWidth
                } else {
                    if (panelMinWidth === -1) {
                        paramPanel.Width = requestedWidth
                    } else {
                        paramPanel.Width = panelMinWidth
                    }
                }
                paramPanel.calculateHeight()
                lastPos = lastPos + paramPanel.Height
                if (paramPanel.Width > totalMaxWidth) {
                    totalMaxWidth = paramPanel.Width
                }
            }
            lastPos = 0
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                paramPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[i])
                paramPanel.Top = lastPos
                // cfk change v2.0 final - can't remember why we had a max width - looks better this way
                // paramPanel.width := totalMaxWidth;   // was this
                // changed to
                paramPanel.Width = this.parametersScrollBox.Width - 20
                paramPanel.calculateHeight()
                paramPanel.resizeElements()
                lastPos = lastPos + paramPanel.Height
            }
            this.parametersScrollBox.VertScrollBar.Position = oldPosition
            if (windowLock) {
                UNRESOLVED.lockWindowUpdate(0)
            }
        }
    }
    
    collapseOrExpandParameterPanelsUntilNextHeader(headerPanel: PdParameterPanel): void {
        let collapsing: boolean
        let paramPanel: PdParameterPanel
        let i: short
        
        collapsing = false
        this.internalChange = true
        if (this.parametersScrollBox.ControlCount > 0) {
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                paramPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[i])
                if (paramPanel === headerPanel) {
                    collapsing = true
                } else if (collapsing && (paramPanel instanceof upp_hed.PdHeaderParameterPanel)) {
                    collapsing = false
                } else if (collapsing) {
                    if (headerPanel.param.collapsed) {
                        paramPanel.expand()
                    } else {
                        paramPanel.collapse()
                    }
                }
            }
        }
        this.internalChange = false
        this.repositionParameterPanels()
    }
    
    collapseOrExpandAllParameterPanelsInCurrentSection(doWhat: short): void {
        let section: PdSection
        let paramPanel: PdParameterPanel
        let i: short
        
        this.internalChange = true
        if (this.sectionsComboBox.ItemIndex < 0) {
            return
        }
        section = this.sectionsComboBox.Items.Objects[this.sectionsComboBox.ItemIndex]
        if (section === null) {
            return
        }
        switch (doWhat) {
            case kExpand:
                section.expanded = true
                break
            case kCollapse:
                section.expanded = false
                break
            case kExpandOrCollapse:
                section.expanded = !section.expanded
                break
        }
        if (this.parametersScrollBox.ControlCount > 0) {
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                paramPanel = uppanel.PdParameterPanel(this.parametersScrollBox.Controls[i])
                if (section.expanded) {
                    paramPanel.expand()
                } else {
                    paramPanel.collapse()
                }
            }
        }
        this.internalChange = false
        this.repositionParameterPanels()
    }
    
    updateParameterValuesWithUpdateListForPlant(aPlant: PdPlant, updateList: TListCollection): void {
        let i: long
        let paramPanel: PdParameterPanel
        let updateEvent: PdPlantUpdateEvent
        let needToUpdateWholePlant: boolean
        
        if (aPlant !== this.focusedPlant()) {
            return
        }
        if (updateList.Count <= 0) {
            return
        }
        // first look to see if the whole plant needs updated - if any do, update it 
        // this is for side effects in GWI - left in just in case we need it later 
        needToUpdateWholePlant = false
        for (i = 0; i <= updateList.Count - 1; i++) {
            updateEvent = uplant.PdPlantUpdateEvent(updateList[i])
            if ((updateEvent.plant !== null) && (updateEvent.plant.wholePlantUpdateNeeded)) {
                needToUpdateWholePlant = true
                updateEvent.plant.wholePlantUpdateNeeded = false
            }
        }
        if (needToUpdateWholePlant) {
            this.updateParametersPanelForFirstSelectedPlant()
            return
        }
        if (this.parametersScrollBox.ControlCount > 0) {
            for (i = 0; i <= this.parametersScrollBox.ControlCount - 1; i++) {
                if (this.parametersScrollBox.Controls[i] instanceof uppanel.PdParameterPanel) {
                    // if not updating everything, update based on list 
                    // tell all components to look at list to see if they need updating 
                    paramPanel = this.parametersScrollBox.Controls[i]
                    // components check if use models and fields in list 
                    paramPanel.updateFromUpdateEventList(updateList)
                }
            }
        }
    }
    
    // stats panel
    updateStatisticsPanelForFirstSelectedPlant(): void {
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.statsPanel === null) {
            return
        }
        this.statsPanel.updatePlant(this.focusedPlant())
        this.statsPanel.updatePlantValues()
    }
    
    // note panel
    updateNoteForFirstSelectedPlant(): void {
        let selStart: int
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.notePanel === null) {
            return
        }
        if (this.noteMemo === null) {
            return
        }
        this.updatePlantNameLabel(kTabNote)
        this.updateForChangeToPlantNote(this.focusedPlant())
    }
    
    noteEditClick(): void {
        let newCommand: PdCommand
        let noteForm: TNoteEditForm
        let commandLines: TStringList
        
        if (this.focusedPlant() === null) {
            return
        }
        noteForm = unoted.TNoteEditForm().create(this)
        if (noteForm === null) {
            throw new Error("Problem: Could not create note edit window.")
        }
        try {
            noteForm.noteEditMemo.Lines.AddStrings(this.focusedPlant().noteLines)
            noteForm.Caption = "Edit note for " + this.focusedPlant().getName()
            if (noteForm.ShowModal() !== mrCancel) {
                // command will take ownership of this and free it if necessary
                commandLines = delphi_compatability.TStringList.create
                commandLines.AddStrings(noteForm.noteEditMemo.Lines)
                newCommand = new PdEditNoteCommand(this.focusedPlant(), commandLines)
                this.doCommand(newCommand)
            }
        } finally {
            noteForm.free
            noteForm = null
        }
    }
    
    NotePopupMenuCopyClick(): void {
        this.noteMemo.CopyToClipboard()
    }
    
    NotePopupMenuEditClick(): void {
        this.noteEditClick(this)
    }
    
    NotePopupMenuSelectAllClick(): void {
        this.noteMemo.SelectAll()
    }
    
    MenuPlantEditNoteClick(): void {
        this.noteEditClick(this)
    }
    
    PopupMenuEditNoteClick(): void {
        this.noteEditClick(this)
    }
    
    // rotations panel
    updateRotationsPanelForFirstSelectedPlant(): void {
        let color: TColorRef
        
        this.updatePlantNameLabel(kTabRotations)
        color = this.textColorToRepresentPlantSelection(false)
        // location
        this.locationLabel.Font.Color = color
        this.xLocationLabel.Font.Color = color
        this.yLocationLabel.Font.Color = color
        this.locationPixelsLabel.Font.Color = color
        // size
        this.sizingLabel.Font.Color = color
        this.drawingScalePixelsPerMmLabel.Font.Color = color
        // rotation
        this.rotationLabel.Font.Color = color
        this.xRotationLabel.Font.Color = color
        this.yRotationLabel.Font.Color = color
        this.zRotationLabel.Font.Color = color
        // other updates
        this.updateForChangeToPlantRotations()
        this.updateForChangeToSelectedPlantsDrawingScale()
        this.updateForChangeToSelectedPlantsLocation()
    }
    
    // posing panel
    // ------------------------------------------------------------------------------------- *posing - updating 
    updatePosingForFirstSelectedPlant(): void {
        let i: int
        let amendment: PdPlantDrawingAmendment
        let partString: string
        
        this.internalChange = true
        this.posedPartsLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        this.selectedPartLabel.Font.Color = this.textColorToRepresentPlantSelection(false)
        this.posingPosePart.Enabled = false
        this.posingUnposePart.Enabled = false
        // called when plant changes
        this.posedPlantParts.Clear()
        this.updatePlantNameLabel(kTabPosing)
        if (this.focusedPlant() === null) {
            this.posedPlantParts.Text = ""
            this.posedPlantParts.Enabled = false
        } else {
            this.posedPlantParts.Enabled = true
            if (this.focusedPlant().amendments.length <= 0) {
                // load list of parts with amendments
                this.selectedPlantPartID = -1
            } else {
                for (i = 0; i <= this.focusedPlant().amendments.length - 1; i++) {
                    amendment = uamendmt.PdPlantDrawingAmendment(this.focusedPlant().amendments[i])
                    partString = this.partDescriptionForIDAndType(amendment.partID, amendment.typeOfPart)
                    if (this.posedPlantParts.Items.IndexOf(partString) < 0) {
                        this.posedPlantParts.Items.Add(partString)
                    }
                }
                this.posedPlantParts.Items.Add(kSelectNoPosedPartString)
            }
        }
        this.internalChange = false
        this.updatePosingForSelectedPlantPart()
    }
    
    updatePosingForSelectedPlantPart(): void {
        let partString: string
        let index: short
        
        // PDF PORT -- removed semicolon from after begin
        this.internalChange = true
        if (this.focusedPlant() === null) {
            // called when selected part changes
            this.selectedPlantPartID = -1
            this.selectedPlantPartType = ""
            this.selectedPartLabel.Caption = kNoPartSelected
        }
        if (this.selectedPlantPartID >= 0) {
            partString = this.partDescriptionForIDAndType(this.selectedPlantPartID, this.selectedPlantPartType)
            this.selectedPartLabel.Caption = "Selected part: " + partString
            index = this.posedPlantParts.Items.IndexOf(partString)
            if (index >= 0) {
                this.posedPlantParts.ItemIndex = index
            } else {
                this.posedPlantParts.ItemIndex = -1
            }
        } else {
            this.posedPlantParts.ItemIndex = -1
            this.selectedPartLabel.Caption = kNoPartSelected
        }
        this.posingPosePart.Enabled = !(this.selectedPartLabel.Caption === kNoPartSelected)
        this.posingUnposePart.Enabled = false
        this.internalChange = false
        this.updatePoseInfo()
    }
    
    updatePoseInfo(): void {
        let amendment: PdPlantDrawingAmendment
        let partID: long
        
        this.internalChange = true
        amendment = null
        partID = this.selectedPartIDInAmendedPartsList()
        if (partID >= 0) {
            amendment = this.focusedPlant().amendmentForPartID(partID)
        }
        this.posingPosePart.Enabled = (!(this.selectedPartLabel.Caption === kNoPartSelected)) && (amendment === null)
        this.posingUnposePart.Enabled = (!(this.selectedPartLabel.Caption === kNoPartSelected)) && (!(amendment === null))
        this.posingDetailsPanel.Visible = amendment !== null
        if ((amendment !== null)) {
            this.posingHidePart.Checked = amendment.hide
            //
            //    posingChangeColors.checked := changeColors;
            //    posingFrontfaceColor.color := faceColor;
            //    posingBackfaceColor.color := BackfaceColor;
            //    posingLineColor.color := lineColor;
            //    posingChangeAllColorsAfter.checked := propagateColors;
            //    
            this.posingAddExtraRotation.Checked = amendment.addRotations
            this.posingXRotationEdit.Text = IntToStr(intround(amendment.xRotation))
            this.posingYRotationEdit.Text = IntToStr(intround(amendment.yRotation))
            this.posingZRotationEdit.Text = IntToStr(intround(amendment.zRotation))
            this.posingMultiplyScale.Checked = amendment.multiplyScale
            this.posingMultiplyScaleAllPartsAfter.Checked = amendment.propagateScale
            this.posingScaleMultiplierEdit.Text = IntToStr(amendment.scaleMultiplier_pct)
            this.posingLengthMultiplierEdit.Text = IntToStr(amendment.lengthMultiplier_pct)
            this.posingWidthMultiplierEdit.Text = IntToStr(amendment.widthMultiplier_pct)
        }
        this.internalChange = false
        this.updateForDependenciesWithinPoseInfo()
    }
    
    updateForDependenciesWithinPoseInfo(): void {
        this.internalChange = true
        this.posingChangeAllColorsAfter.Enabled = this.posingChangeColors.Checked
        this.posingMultiplyScaleAllPartsAfter.Enabled = this.posingMultiplyScale.Checked
        this.posingMultiplyScaleAllPartsAfterLabel.Enabled = this.posingMultiplyScaleAllPartsAfter.Enabled
        //
        //  posingLineColor.visible := posingChangeColors.checked;
        //  posingLineColorLabel.enabled := posingChangeColors.checked;
        //  posingFrontfaceColor.visible := posingChangeColors.checked;
        //  posingFrontfaceColorLabel.enabled := posingChangeColors.checked;
        //  posingBackfaceColor.visible := posingChangeColors.checked;
        //  posingBackfaceColorLabel.enabled := posingChangeColors.checked;
        //  
        enableOrDisableSet(this.posingXRotationLabel, this.posingXRotationEdit, this.posingXRotationSpin, null, this.posingAddExtraRotation.Checked)
        enableOrDisableSet(this.posingYRotationLabel, this.posingYRotationEdit, this.posingYRotationSpin, null, this.posingAddExtraRotation.Checked)
        enableOrDisableSet(this.posingZRotationLabel, this.posingZRotationEdit, this.posingZRotationSpin, null, this.posingAddExtraRotation.Checked)
        this.rotationDegreesLabel.Enabled = this.posingAddExtraRotation.Checked
        enableOrDisableSet(this.posingScaleMultiplierLabel, this.posingScaleMultiplierEdit, this.posingScaleMultiplierSpin, this.posingScaleMultiplierPercent, this.posingMultiplyScale.Checked)
        enableOrDisableSet(this.posingLengthMultiplierLabel, this.posingLengthMultiplierEdit, this.posingLengthMultiplierSpin, this.posingLengthMultiplierPercent, this.posingMultiplyScale.Checked)
        enableOrDisableSet(this.posingWidthMultiplierLabel, this.posingWidthMultiplierEdit, this.posingWidthMultiplierSpin, this.posingWidthMultiplierPercent, this.posingMultiplyScale.Checked)
        this.internalChange = false
    }
    
    redrawAllPlantsInViewWithAmendments(): void {
        let i: short
        let plant: PdPlant
        
        if (this.plants.length > 0) {
            for (i = 0; i <= this.plants.length - 1; i++) {
                plant = this.plants[i]
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
        let newCommand: PdCommand
        
        if (this.internalChange) {
            return
        }
        if (this.posedPlantParts.ItemIndex === this.posedPlantParts.Items.Count - 1) {
            newCommand = new PdSelectPosingPartCommand(this.focusedPlant(), -1, this.selectedPlantPartID, "", this.selectedPlantPartType)
        } else {
            newCommand = new PdSelectPosingPartCommand(this.focusedPlant(), this.selectedPartIDInAmendedPartsList(), this.selectedPlantPartID, this.selectedPartTypeInAmendedPartsList(), this.selectedPlantPartType)
        }
        this.doCommand(newCommand)
    }
    
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
        let newRotation: short
        let oldRotation: short
        
        if ((sender !== null) && (sender instanceof delphi_compatability.TEdit)) {
            newRotation = StrToIntDef((sender).text, 0)
            oldRotation = newRotation
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
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinScaleMultiplierBy((Sender).focusControl, domain.options.resizeKeyUpMultiplierPercent - 100)
        }
    }
    
    posingScaleMultiplierSpinDownClick(): void {
        if ((Sender !== null) && (Sender instanceof delphi_compatability.TSpinButton)) {
            this.spinScaleMultiplierBy((Sender).focusControl, -(domain.options.resizeKeyUpMultiplierPercent - 100))
        }
    }
    
    spinScaleMultiplierBy(amount: int): void {
        let newValue: short
        let oldValue: short
        
        if ((sender !== null) && (sender instanceof delphi_compatability.TEdit)) {
            newValue = StrToIntDef((sender).text, 0)
            oldValue = newValue
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
    
    // ------------------------------------------------------------------------------------- *posing - commands 
    changeSelectedPose(): void {
        let newCommand: PdCommand
        let newAmendment: PdPlantDrawingAmendment
        let partID: long
        let currentAmendment: PdPlantDrawingAmendment
        let field: string
        
        if (this.internalChange) {
            return
        }
        this.updateForDependenciesWithinPoseInfo()
        if (this.focusedPlant() === null) {
            return
        }
        // command will take ownership of this and free it if necessary
        newAmendment = uamendmt.PdPlantDrawingAmendment().create()
        partID = this.selectedPartIDInAmendedPartsList()
        currentAmendment = this.focusedPlant().amendmentForPartID(partID)
        if (currentAmendment === null) {
            return
        }
        if ((Sender === this.posingHidePart)) {
            field = "hide"
        } else if ((Sender === this.posingAddExtraRotation)) {
            field = "rotate"
        } else if (((Sender === this.posingXRotationEdit) || (Sender === this.posingXRotationSpin))) {
            field = "X rotation"
        } else if (((Sender === this.posingYRotationEdit) || (Sender === this.posingYRotationSpin))) {
            field = "Y rotation"
        } else if (((Sender === this.posingZRotationEdit) || (Sender === this.posingZRotationSpin))) {
            field = "Z rotation"
        } else if ((Sender === this.posingMultiplyScale)) {
            field = "scale"
        } else if ((Sender === this.posingMultiplyScaleAllPartsAfter)) {
            field = "scale above"
        } else if (((Sender === this.posingScaleMultiplierEdit) || (Sender === this.posingScaleMultiplierSpin))) {
            field = "3D object scale"
        } else if (((Sender === this.posingLengthMultiplierEdit) || (Sender === this.posingLengthMultiplierSpin))) {
            field = "line length"
        } else if (((Sender === this.posingWidthMultiplierEdit) || (Sender === this.posingWidthMultiplierSpin))) {
            field = "line width"
        } else {
            field = ""
        }
        //   cfk if bring back color finish these
        //    posingChangeColors: TCheckBox;
        //    posingChangeAllColorsAfter: TCheckBox;
        //    posingLineColor: TPanel;
        //    posingFrontfaceColor: TPanel;
        //    posingBackfaceColor: TPanel;
        //    posingLineColorLabel: TLabel;
        //    posingFrontfaceColorLabel: TLabel;
        //    posingBackfaceColorLabel: TLabel;
        //    
        newAmendment.partID = this.partIDForFullDescription(this.posedPlantParts.Text)
        newAmendment.typeOfPart = this.partTypeForFullDescription(this.posedPlantParts.Text)
        newAmendment.hide = this.posingHidePart.Checked
        //
        //    changeColors := posingChangeColors.checked;
        //    faceColor := posingFrontfaceColor.color;
        //    backfaceColor := posingBackfaceColor.color;
        //    lineColor := posingLineColor.color;
        //    propagateColors := posingChangeAllColorsAfter.checked;
        //    
        newAmendment.addRotations = this.posingAddExtraRotation.Checked
        newAmendment.xRotation = umath.intMax(-360, umath.intMin(360, StrToIntDef(this.posingXRotationEdit.Text, intround(currentAmendment.xRotation))))
        newAmendment.yRotation = umath.intMax(-360, umath.intMin(360, StrToIntDef(this.posingYRotationEdit.Text, intround(currentAmendment.yRotation))))
        newAmendment.zRotation = umath.intMax(-360, umath.intMin(360, StrToIntDef(this.posingZRotationEdit.Text, intround(currentAmendment.zRotation))))
        newAmendment.multiplyScale = this.posingMultiplyScale.Checked
        newAmendment.propagateScale = this.posingMultiplyScaleAllPartsAfter.Checked
        newAmendment.scaleMultiplier_pct = umath.intMax(0, umath.intMin(1000, StrToIntDef(this.posingScaleMultiplierEdit.Text, currentAmendment.scaleMultiplier_pct)))
        newAmendment.lengthMultiplier_pct = umath.intMax(0, umath.intMin(1000, StrToIntDef(this.posingLengthMultiplierEdit.Text, currentAmendment.lengthMultiplier_pct)))
        newAmendment.widthMultiplier_pct = umath.intMax(0, umath.intMin(1000, StrToIntDef(this.posingWidthMultiplierEdit.Text, currentAmendment.widthMultiplier_pct)))
        newCommand = new PdEditAmendmentCommand(this.focusedPlant(), newAmendment, field)
        this.doCommand(newCommand)
    }
    
    posingPosePartClick(): void {
        let newCommand: PdCommand
        let newAmendment: PdPlantDrawingAmendment
        
        if (this.focusedPlant() === null) {
            return
        }
        if (this.selectedPlantPartID < 0) {
            return
        }
        if (this.focusedPlant().amendmentForPartID(this.selectedPlantPartID) !== null) {
            // only one amendment per part id
            return
        }
        // command will take ownership of this and free it if necessary
        newAmendment = uamendmt.PdPlantDrawingAmendment().create()
        newAmendment.partID = this.selectedPlantPartID
        newAmendment.typeOfPart = this.selectedPlantPartType
        newCommand = new PdCreateAmendmentCommand(this.focusedPlant(), newAmendment)
        this.doCommand(newCommand)
    }
    
    posingUnposePartClick(): void {
        let newCommand: PdCommand
        let amendment: PdPlantDrawingAmendment
        
        if (this.focusedPlant() === null) {
            return
        }
        amendment = this.focusedPlant().amendmentForPartID(this.selectedPartIDInAmendedPartsList())
        if (amendment === null) {
            return
        }
        newCommand = new PdDeleteAmendmentCommand(this.focusedPlant(), amendment)
        this.doCommand(newCommand)
    }
    
    addAmendedPartToList(partID: long, partType: string): void {
        let newString: string
        let selectNoneIndex: short
        let indexToSave: short
        
        newString = MainForm.partDescriptionForIDAndType(partID, partType)
        this.posedPlantParts.Items.Add(newString)
        indexToSave = this.posedPlantParts.Items.Count - 1
        // add "select none" to end - move down if already there
        selectNoneIndex = this.posedPlantParts.Items.IndexOf(kSelectNoPosedPartString)
        if (selectNoneIndex >= 0) {
            this.posedPlantParts.Items.Delete(selectNoneIndex)
        }
        this.posedPlantParts.Items.Add(kSelectNoPosedPartString)
        this.posedPlantParts.ItemIndex = indexToSave
        this.updatePosingForSelectedPlantPart()
    }
    
    removeAmendedPartFromList(partID: long, partType: string): void {
        let oldString: string
        let index: int
        let oldItemIndex: int
        
        oldItemIndex = this.posedPlantParts.ItemIndex
        oldString = this.partDescriptionForIDAndType(partID, partType)
        index = this.posedPlantParts.Items.IndexOf(oldString)
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
        result = IntToStr(id) + " (" + typeName + ")"
        return result
    }
    
    partIDForFullDescription(aString: string): long {
        let result = 0
        result = StrToIntDef(usupport.stringUpTo(aString, " ("), -1)
        return result
    }
    
    partTypeForFullDescription(aString: string): string {
        let result = ""
        result = ""
        if (len(aString) <= 0) {
            return result
        }
        result = usupport.stringBeyond(aString, "(")
        result = usupport.stringUpTo(result, ")")
        return result
    }
    
    selectedPartIDInAmendedPartsList(): long {
        let result = 0
        result = -1
        if ((this.focusedPlant() === null) || (this.posedPlantParts.Items.Count <= 0) || (this.posedPlantParts.ItemIndex < 0)) {
            return result
        }
        result = this.partIDForFullDescription(this.posedPlantParts[this.posedPlantParts.ItemIndex])
        return result
    }
    
    selectedPartTypeInAmendedPartsList(): string {
        let result = ""
        result = ""
        if ((this.focusedPlant() === null) || (this.posedPlantParts.Items.Count <= 0) || (this.posedPlantParts.ItemIndex < 0)) {
            return result
        }
        result = this.partTypeForFullDescription(this.posedPlantParts[this.posedPlantParts.ItemIndex])
        return result
    }
    
    // ------------------------------------------------------------------------------------- *resizing 
    FormResize(): void {
        let newTop: short
        let newLeft: short
        let newWidth: short
        let newHeight: short
        let splitterWidthOrHeight: short
        let windowLock: boolean
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        if (this.WindowState === delphi_compatability.TWindowState.wsMinimized) {
            return
        }
        if (domain === null) {
            return
        }
        if (this.drawingBitmap === null) {
            return
        }
        if (this.selectedPlants === null) {
            return
        }
        this.horizontalSplitter.Visible = false
        this.verticalSplitter.Visible = false
        this.plantListPanel.Visible = false
        this.plantFocusPanel.Visible = false
        windowLock = UNRESOLVED.lockWindowUpdate(this.Handle)
        this.toolbarPanel.SetBounds(0, 0, this.ClientWidth, this.toolbarPanel.Height)
        //assumes they are equal, I have at 4 now
        splitterWidthOrHeight = this.verticalSplitter.Width
        if (this.lastHeight !== 0) {
            newTop = intround(1.0 * this.horizontalSplitter.Top * this.ClientHeight / this.lastHeight)
        } else {
            newTop = this.ClientHeight / 2
        }
        newTop = umath.intMax(0, umath.intMin(this.ClientHeight - 1, newTop))
        newHeight = umath.intMax(0, this.ClientHeight - newTop - splitterWidthOrHeight)
        if (this.lastWidth !== 0) {
            newLeft = intround(1.0 * this.verticalSplitter.Left * this.ClientWidth / this.lastWidth)
        } else {
            newLeft = this.ClientWidth / 2
        }
        newLeft = umath.intMax(0, umath.intMin(this.ClientWidth - 1, newLeft))
        newWidth = umath.intMax(0, this.ClientWidth - newLeft - splitterWidthOrHeight)
        if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal) {
            this.horizontalSplitter.SetBounds(0, newTop, this.ClientWidth, this.horizontalSplitter.Height)
            this.verticalSplitter.SetBounds(newLeft, newTop + this.horizontalSplitter.Height, this.verticalSplitter.Width, newHeight)
        } else if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical) {
            this.verticalSplitter.SetBounds(newLeft, this.toolbarPanel.Height, this.verticalSplitter.Width, umath.intMax(0, this.ClientHeight - this.toolbarPanel.Height))
            this.horizontalSplitter.SetBounds(newLeft + this.verticalSplitter.Width, newTop, newWidth, this.horizontalSplitter.Height)
        }
        // resize images and panels 
        this.resizePanelsToHorizontalSplitter()
        this.resizePanelsToVerticalSplitter()
        this.lastHeight = this.ClientHeight
        this.lastWidth = this.ClientWidth
        if (windowLock) {
            UNRESOLVED.lockWindowUpdate(0)
        }
        this.horizontalSplitter.Visible = true
        this.verticalSplitter.Visible = true
        this.plantListPanel.Visible = true
        this.plantFocusPanel.Visible = true
    }
    
    // resizing 
    resizePanelsToVerticalSplitter(): void {
        let newLeft: short
        let newWidth: short
        let newTop: short
        let newHeight: short
        
        newLeft = this.verticalSplitter.Left + this.verticalSplitter.Width
        newWidth = umath.intMax(0, this.ClientWidth - newLeft)
        newTop = this.horizontalSplitter.Top + this.horizontalSplitter.Height
        newHeight = umath.intMax(0, this.ClientHeight - newTop)
        if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal) {
            this.plantListPanel.SetBounds(0, newTop, this.verticalSplitter.Left, newHeight)
            this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        } else if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical) {
            this.plantListPanel.SetBounds(newLeft, this.toolbarPanel.Height, newWidth, this.horizontalSplitter.Top - this.toolbarPanel.Height)
            this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
            //don't change top here
            this.horizontalSplitter.SetBounds(newLeft, this.horizontalSplitter.Top, newWidth, this.horizontalSplitter.Height)
            this.drawingPaintBox.SetBounds(0, this.toolbarPanel.Height, newLeft, umath.intMax(0, this.ClientHeight - this.toolbarPanel.Height))
            this.resizeDrawingBitmapIfNecessary()
        }
        this.resizePlantListPanel()
        this.resizePlantFocusPanel()
    }
    
    resizePanelsToHorizontalSplitter(): void {
        let newLeft: short
        let newWidth: short
        let newTop: short
        let newHeight: short
        
        newLeft = this.verticalSplitter.Left + this.verticalSplitter.Width
        newWidth = umath.intMax(0, this.ClientWidth - newLeft)
        newTop = this.horizontalSplitter.Top + this.horizontalSplitter.Height
        newHeight = umath.intMax(0, this.ClientHeight - newTop)
        if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal) {
            this.plantListPanel.SetBounds(0, newTop, this.verticalSplitter.Left, newHeight)
            //don't change left here
            this.verticalSplitter.SetBounds(this.verticalSplitter.Left, newTop, this.verticalSplitter.Width, newHeight)
            this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
            this.drawingPaintBox.SetBounds(0, this.toolbarPanel.Height, this.ClientWidth, umath.intMax(0, this.horizontalSplitter.Top - this.toolbarPanel.Height))
            this.resizeDrawingBitmapIfNecessary()
        } else if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical) {
            this.plantListPanel.SetBounds(newLeft, this.toolbarPanel.Height, newWidth, this.horizontalSplitter.Top - this.toolbarPanel.Height)
            this.plantFocusPanel.SetBounds(newLeft, newTop, newWidth, newHeight)
        }
        this.resizePlantListPanel()
        this.resizePlantFocusPanel()
    }
    
    resizeDrawingBitmapIfNecessary(): void {
        let bitmapWasMadeBigger: boolean
        
        if ((this.drawingBitmap.Width !== this.drawingPaintBox.Width) || (this.drawingBitmap.Height !== this.drawingPaintBox.Height)) {
            // if have to make bitmap larger, redraw all plants in case some were not drawing before
            // because they were off the bitmap
            bitmapWasMadeBigger = (this.drawingPaintBox.Width > this.drawingBitmap.Width) || (this.drawingPaintBox.Height > this.drawingBitmap.Height)
            ubmpsupport.resizeBitmap(this.drawingBitmap, Point(this.drawingPaintBox.Width, this.drawingPaintBox.Height))
            if (!this.inFormCreation) {
                if (bitmapWasMadeBigger) {
                    this.recalculateAllPlantBoundsRects(kDontDrawYet)
                }
                this.invalidateEntireDrawing()
                this.updateForPossibleChangeToDrawing()
            }
        }
    }
    
    resizePlantListPanel(): void {
        this.plantListDrawGrid.SetBounds(0, 0, this.plantListPanel.Width, this.plantListPanel.Height - this.plantFileChangedImage.Height - kBetweenGap * 2)
        this.plantListDrawGrid.DefaultColWidth = this.plantListDrawGrid.ClientWidth
        this.plantFileChangedImage.SetBounds(kBetweenGap, this.plantListDrawGrid.Top + this.plantListDrawGrid.Height + kBetweenGap, this.plantFileChangedImage.Width, this.plantFileChangedImage.Height)
        this.plantBitmapsIndicatorImage.SetBounds(this.plantFileChangedImage.Left + this.plantFileChangedImage.Width + kBetweenGap, this.plantFileChangedImage.Top, this.plantBitmapsIndicatorImage.Width, this.plantBitmapsIndicatorImage.Height)
        this.progressPaintBox.SetBounds(this.plantBitmapsIndicatorImage.Left + this.plantBitmapsIndicatorImage.Width + kBetweenGap, this.plantBitmapsIndicatorImage.Top + this.plantBitmapsIndicatorImage.Height / 2 - this.progressPaintBox.Height / 2, this.plantListPanel.Width - this.plantFileChangedImage.Width - this.plantBitmapsIndicatorImage.Width - kBetweenGap * 4, this.progressPaintBox.Height)
    }
    
    resizePlantFocusPanel(): void {
        let newTop: int
        
        //FIX unresolved WITH expression: self.tabSet
        // tab set 
        this.SetBounds(0, this.plantFocusPanel.Height - this.Height, this.plantFocusPanel.Width, this.Height)
        // v1.4 change
        this.animatingLabel.SetBounds(umath.intMax(0, this.plantFocusPanel.Width - this.animatingLabel.Width - kBetweenGap), this.plantFocusPanel.Height - this.animatingLabel.Height - kBetweenGap, this.animatingLabel.Width, this.animatingLabel.Height)
        // life cycle panel 
        this.lifeCyclePanel.SetBounds(0, 0, this.plantFocusPanel.Width, umath.intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        // v1.4 change - 2
        this.lifeCycleEditPanel.Height = this.animateGrowth.Height + kBetweenGap * 2 - 2
        // v1.4 change +1, -1, -2
        this.lifeCycleEditPanel.SetBounds(1, umath.intMax(0, this.lifeCyclePanel.Height - this.lifeCycleEditPanel.Height - 1), this.lifeCyclePanel.Width - 2, this.lifeCycleEditPanel.Height)
        // rotations panel
        this.rotationsPanel.SetBounds(0, 0, this.lifeCyclePanel.Width, this.lifeCyclePanel.Height)
        // posing panel
        this.posingPanel.SetBounds(0, 0, this.lifeCyclePanel.Width, this.lifeCyclePanel.Height)
        newTop = this.posingPlantName.Top + this.posingPlantName.Height + kBetweenGap
        this.posingNotShown.SetBounds(this.posingPanel.Width - this.posingNotShown.Width - kBetweenGap, newTop, this.posingNotShown.Width, this.posingNotShown.Height)
        this.posingGhost.SetBounds(this.posingNotShown.Left - this.posingGhost.Width - kBetweenGap, newTop, this.posingGhost.Width, this.posingGhost.Height)
        this.posingHighlight.SetBounds(this.posingGhost.Left - this.posingHighlight.Width - kBetweenGap, newTop, this.posingHighlight.Width, this.posingHighlight.Height)
        newTop = this.posingNotShown.Top + this.posingNotShown.Height + kBetweenGap
        this.posedPartsLabel.SetBounds(kBetweenGap, newTop + (this.posedPlantParts.Height / 2 - this.posedPartsLabel.Height / 2), this.posedPartsLabel.Width, this.posedPartsLabel.Height)
        this.posedPlantParts.SetBounds(this.posedPartsLabel.Left + this.posedPartsLabel.Width + kBetweenGap, newTop, umath.intMax(10, this.posingPanel.Width - this.posedPartsLabel.Width - kBetweenGap * 3), this.posedPlantParts.Height)
        newTop = this.posedPlantParts.Top + this.posedPlantParts.Height + kBetweenGap
        // fix later
        this.selectedPartLabel.SetBounds(kBetweenGap, newTop + (this.posingUnposePart.Height / 2 - this.selectedPartLabel.Height / 2), this.selectedPartLabel.Width, this.selectedPartLabel.Height)
        newTop = this.selectedPartLabel.Top + this.selectedPartLabel.Height + kBetweenGap
        this.posingPosePart.SetBounds(kBetweenGap, newTop, this.posingPosePart.Width, this.posingPosePart.Height)
        this.posingUnposePart.SetBounds(this.posingPosePart.Left + this.posingPosePart.Width + kBetweenGap, newTop, this.posingUnposePart.Width, this.posingUnposePart.Height)
        newTop = this.posingUnposePart.Top + this.posingUnposePart.Height + kBetweenGap
        this.posingDetailsPanel.SetBounds(0, newTop, this.lifeCyclePanel.Width, umath.intMax(230, this.lifeCyclePanel.Height - newTop))
        // lifeCycleEditPanel 
        this.lifeCycleDaysEdit.SetBounds(this.ageAndSizeLabel.Width + kBetweenGap * 2, kBetweenGap, this.lifeCycleDaysEdit.Width, this.lifeCycleDaysEdit.Height)
        this.lifeCycleDaysSpin.SetBounds(this.lifeCycleDaysEdit.Left + this.lifeCycleDaysEdit.Width, kBetweenGap + this.lifeCycleDaysEdit.Height / 2 - this.lifeCycleDaysSpin.Height / 2, this.lifeCycleDaysSpin.Width, this.lifeCycleDaysSpin.Height)
        this.ageAndSizeLabel.SetBounds(kBetweenGap, umath.intMax(0, this.lifeCycleDaysEdit.Top + this.lifeCycleDaysEdit.Height / 2 - this.ageAndSizeLabel.Height / 2), this.ageAndSizeLabel.Width, this.ageAndSizeLabel.Height)
        this.daysAndSizeLabel.SetBounds(this.lifeCycleDaysSpin.Left + this.lifeCycleDaysSpin.Width + kBetweenGap, umath.intMax(0, this.lifeCycleDaysEdit.Top + this.lifeCycleDaysEdit.Height / 2 - this.daysAndSizeLabel.Height / 2), this.daysAndSizeLabel.Width, this.daysAndSizeLabel.Height)
        this.animateGrowth.SetBounds(this.lifeCycleEditPanel.Width - this.animateGrowth.Width - kBetweenGap, this.lifeCycleDaysEdit.Top, this.animateGrowth.Width, this.animateGrowth.Height)
        // above lifeCycleEditPanel 
        this.timeLabel.SetBounds(umath.intMax(0, this.lifeCyclePanel.Width / 2 - this.timeLabel.Width / 2), umath.intMax(0, this.lifeCycleEditPanel.Top - this.timeLabel.Height - kBetweenGap), this.timeLabel.Width, this.timeLabel.Height)
        this.lifeCycleGraphImage.SetBounds(kBetweenGap + this.maxSizeAxisLabel.Width + kBetweenGap, umath.intMax(1, this.selectedPlantNameLabel.Top + this.selectedPlantNameLabel.Height + kBetweenGap), umath.intMax(1, this.lifeCyclePanel.Width - this.maxSizeAxisLabel.Width - kBetweenGap * 3), umath.intMax(1, this.timeLabel.Top - this.selectedPlantNameLabel.Height - kBetweenGap * 2))
        this.maxSizeAxisLabel.SetBounds(kBetweenGap, umath.intMax(0, this.lifeCycleGraphImage.Top + this.lifeCycleGraphImage.Height / 2 - this.maxSizeAxisLabel.Height / 2), this.maxSizeAxisLabel.Width, this.maxSizeAxisLabel.Height)
        this.selectedPlantNameLabel.SetBounds(kBetweenGap, kBetweenGap, this.selectedPlantNameLabel.Width, this.selectedPlantNameLabel.Height)
        if ((this.lifeCycleGraphImage.Picture.Bitmap.Width !== this.lifeCycleGraphImage.Width) || (this.lifeCycleGraphImage.Picture.Bitmap.Height !== this.lifeCycleGraphImage.Height)) {
            // with selectedPlantNameLabel do setBounds(lifeCycleGraphImage.left, kBetweenGap, width, height);
            ubmpsupport.resizeBitmap(this.lifeCycleGraphImage.Picture.Bitmap, Point(this.lifeCycleGraphImage.Width, this.lifeCycleGraphImage.Height))
        }
        this.placeLifeCycleDragger()
        this.redrawLifeCycleGraph()
        this.resizeParametersPanel()
        // stats scroll box 
        this.statsScrollBox.SetBounds(0, 0, this.plantFocusPanel.Width, umath.intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        this.statsPanel.resizeElements()
        this.notePanel.SetBounds(0, 0, this.plantFocusPanel.Width, umath.intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        this.noteLabel.SetBounds(kBetweenGap, kBetweenGap, this.noteLabel.Width, this.noteLabel.Height)
        //kBetweenGap + noteEdit.height div 2 - height div 2, width, height);
        this.noteEdit.SetBounds(umath.intMax(0, this.notePanel.Width - this.noteEdit.Width - kBetweenGap), kBetweenGap, this.noteEdit.Width, this.noteEdit.Height)
        this.noteMemo.SetBounds(0, this.noteEdit.Height + kBetweenGap * 2, this.notePanel.Width, umath.intMax(0, this.notePanel.Height - this.noteEdit.Height - kBetweenGap * 2))
    }
    
    resizeParametersPanel(): void {
        let newTop: short
        
        this.parametersPanel.SetBounds(0, 0, this.plantFocusPanel.Width, umath.intMax(0, this.plantFocusPanel.Height - this.tabSet.height))
        this.parametersPlantName.SetBounds(kBetweenGap, kBetweenGap, this.parametersPlantName.Width, this.parametersPlantName.Height)
        this.sectionsComboBox.SetBounds(kBetweenGap, this.parametersPlantName.Top + this.parametersPlantName.Height + kBetweenGap, this.parametersPanel.Width - kBetweenGap * 2, this.sectionsComboBox.Height)
        newTop = this.sectionsComboBox.Top + this.sectionsComboBox.Height + kBetweenGap
        this.parametersScrollBox.SetBounds(0, this.sectionsComboBox.Top + this.sectionsComboBox.Height + kBetweenGap, this.parametersPanel.Width, this.parametersPanel.Height - newTop)
        this.repositionParameterPanels()
    }
    
    placeLifeCycleDragger(): void {
        let firstPlant: PdPlant
        let fractionOfMaxAge: float
        
        firstPlant = this.focusedPlant()
        fractionOfMaxAge = 0.0
        if (firstPlant !== null) {
            try {
                fractionOfMaxAge = firstPlant.age / firstPlant.pGeneral.ageAtMaturity
            } catch (e) {
                fractionOfMaxAge = 0.0
            }
        }
        this.lifeCycleDragger.SetBounds(this.lifeCycleGraphImage.Left + intround((this.lifeCycleGraphImage.Width - this.lifeCycleDragger.Width) * fractionOfMaxAge), this.lifeCycleGraphImage.Top + 1, this.lifeCycleDragger.Width, this.lifeCycleGraphImage.Height - 2)
    }
    
    WMGetMinMaxInfo(MSG: Tmessage): void {
        PdForm.prototype.WMGetMinMaxInfo.call(this)
        //FIX unresolved WITH expression: UNRESOLVED.PMinMaxInfo(MSG.lparam).PDF_FIX_POINTER_ACCESS
        UNRESOLVED.ptMinTrackSize.x = 300
        UNRESOLVED.ptMinTrackSize.y = 300
    }
    
    // ------------------------------------------------------------------------------------- *splitting 
    horizontalSplitterMouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.horizontalSplitterDragging = true
        this.horizontalSplitterStartPos = Y
        this.horizontalSplitterLastDrawPos = -1
        this.horizontalSplitterNeedToRedraw = true
    }
    
    horizontalSplitterMouseMove(Shift: TShiftState, X: int, Y: int): void {
        let bottomLimit: int
        
        if (domain === null) {
            return
        }
        if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal) {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        } else if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical) {
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
        let bottomLimit: int
        
        if (domain === null) {
            return
        }
        if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationHorizontal) {
            bottomLimit = kSplitterDragToBottomMinPixelsInHorizMode
        } else if (domain.options.mainWindowOrientation === udomain.kMainWindowOrientationVertical) {
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
        let result = 0
        let theDC: HDC
        
        theDC = UNRESOLVED.getDC(0)
        result = this.ClientOrigin.X + this.verticalSplitter.Left + pos + 2
        UNRESOLVED.patBlt(theDC, result, this.ClientOrigin.Y + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
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
        UNRESOLVED.patBlt(theDC, this.verticalSplitterLastDrawPos, this.ClientOrigin.Y + this.verticalSplitter.Top, 1, this.verticalSplitter.Height, delphi_compatability.DSTINVERT)
        UNRESOLVED.releaseDC(0, theDC)
        this.verticalSplitterNeedToRedraw = false
    }
    
    // palette stuff 
    // ----------------------------------------------------------------------------- *palette stuff 
    GetPalette(): HPALETTE {
        let result = new HPALETTE()
        result = this.paletteImage.Picture.Bitmap.Palette
        return result
    }
    
    //overriden because paint box will not update correctly
    //makes window take first priority for palettes
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
            if ((UNRESOLVED.realizePalette(DC) !== 0) && (!delphi_compatability.Application.terminated) && (this.drawingPaintBox !== null)) {
                // if palette changed, repaint drawing 
                ubmpsupport.setPixelFormatBasedOnScreenForBitmap(this.drawingBitmap)
                this.drawingPaintBox.Invalidate()
            }
            if (this.statsPanel !== null) {
                this.statsPanel.Invalidate()
            }
            UNRESOLVED.selectPalette(DC, oldPalette, true)
            UNRESOLVED.realizePalette(DC)
            UNRESOLVED.releaseDC(windowHandle, DC)
        }
        result = PdForm.prototype.PaletteChanged.call(this, Foreground)
        return result
    }
    
    FormShow(): void {
        UNRESOLVED.DragAcceptFiles(this.Handle, true)
    }
    
    // v1.11
    Reconcile3DObjects1Click(): void {
        let response: int
        let numTdosAdded: int
        
        numTdosAdded = 0
        if (plantFileChanged) {
            // ask if want to save file first
            response = MessageDialog("Do you want to save your changes to " + ExtractFileName(domain.plantFileName) + chr(13) + "before you reconcile its 3D objects" + chr(13) + "with those in the current 3D object file?", mtConfirmation, mbYesNoCancel, 0)
            switch (response) {
                case delphi_compatability.IDCANCEL:
                    return
                    break
                case delphi_compatability.IDYES:
                    this.MenuFileSaveClick(this)
                    break
                case delphi_compatability.IDNO:
                    break
            }
        }
        if (!domain.checkForExistingDefaultTdoLibrary()) {
            return
        }
        if (MessageDialog("You are about to add any 3D objects in the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "that are not already in the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ")" + chr(13) + chr(13) + "into that library. Do you want to go ahead?", mtConfirmation, {mbYes, mbNo, }, 0) === delphi_compatability.IDYES) {
            numTdosAdded = domain.plantManager.reconcileFileWithTdoLibrary(domain.plantFileName, domain.defaultTdoLibraryFileName)
            if (numTdosAdded <= 0) {
                MessageDialog("All the 3D objects in the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "were already in the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ").", mtInformation, {mbOK, }, 0)
            } else {
                MessageDialog(IntToStr(numTdosAdded) + " 3D objects from the current plant file" + chr(13) + chr(13) + "    (" + domain.plantFileName + ")" + chr(13) + chr(13) + "were copied to the current 3D object library" + chr(13) + chr(13) + "    (" + domain.defaultTdoLibraryFileName + ").", mtInformation, {mbOK, }, 0)
            }
        }
    }
    
    // v1.60
    // end v1.11
    // v1.60 recent files menu
    // PDF PORT removed empty parens
    updateFileMenuForOtherRecentFiles(): void {
        let i: short
        let numSet: short
        let shortcutString: string
        let atLeastOneFileNameExists: boolean
        let showThis: boolean
        
        atLeastOneFileNameExists = false
        numSet = 0
        for (i = 0; i <= udomain.kMaxRecentFiles - 1; i++) {
            if (numSet + 1 === 10) {
                shortcutString = "1&0"
            } else {
                shortcutString = "&" + IntToStr(numSet + 1)
            }
            this.MenuFileReopen.items[i].caption = shortcutString + " " + domain.options.recentFiles[udomain.kMaxRecentFiles - 1 - i]
            showThis = (domain.options.recentFiles[udomain.kMaxRecentFiles - 1 - i] !== "") && (FileExists(domain.options.recentFiles[udomain.kMaxRecentFiles - 1 - i]))
            this.MenuFileReopen.items[i].visible = showThis
            if (showThis) {
                numSet += 1
            }
            if (!atLeastOneFileNameExists) {
                atLeastOneFileNameExists = showThis
            }
        }
        this.MenuFileReopen.enabled = atLeastOneFileNameExists
    }
    
    // v1.60 recent files menu
    Recent0Click(): void {
        let index: short
        
        index = udomain.kMaxRecentFiles - 1 - this.MenuFileReopen.indexOf(Sender)
        if (!FileExists(domain.options.recentFiles[index])) {
            MessageDialog("Cannot find the file" + chr(13) + domain.options.recentFiles[index] + ".", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        if (!this.askForSaveAndProceed()) {
            return
        }
        this.openFile(domain.options.recentFiles[index])
    }
    
}

function startWaitMessage(arg0: string) {
    throw new Error("Function not implemented.")
}

function stopWaitMessage() {
    throw new Error("Function not implemented.")
}
