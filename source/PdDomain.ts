// unit Udomain

import { short, float, TColorRef, long, StrToInt, IntToStr, ColorDefs, ShowMessage, ExtractFileName } from "./common"
import { TPoint } from "./TPoint"
import { TRect } from "./TRect"
import { ExpandFileName, extensionForFileType, FileType, SinglePoint, stringBeyond, strToBool, strToFloatWithCommaCheck } from "./usupport"
import { PdSectionManager } from "./PdSectionManager"
import { PdParameterManager } from "./PdParameterManager"
import { ExportFormats, FileExport3DOptionsStructure, nameFor3DExportType, ExportPart, Axis } from "./U3dexport"
import { BreedingAndTimeSeriesOptionsStructure, kMaxBreedingSections } from "./PdPlant"
import { PdPlantManager } from "./PdPlantManager"
import { KfObject3D } from "./KfObject3D"
import { MainForm } from "./TMainForm"

// const
const kMaxWizardQuestions = 30
const kMaxWizardColors = 2
const kMaxWizardTdos = 3

export const kMainWindowOrientationHorizontal = 0
export const kMainWindowOrientationVertical = 1
const kMaxMainWindowOrientations = 1

export const kIncludeSelectedPlants = 0
export const kIncludeVisiblePlants = 1
export const kIncludeAllPlants = 2
export const kIncludeDrawingAreaContents = 3
const kMaxIncludeOption = 3

export enum BreederVariation {
    kBreederVariationLow = 0,
    kBreederVariationMedium = 1,
    kBreederVariationHigh = 2,
    kBreederVariationCustom = 3,
    kBreederVariationNoNumeric = 4,
}

export enum MutationRate {
    kNoMutation = 0,
    kLowMutation = 20,
    kMediumMutation = 60,
    kHighMutation = 100,
}

const kMaxColorOption = 7
const kMinResolution = 10
const kMaxResolution = 10000
const kDefaultResolution = 200
const kMinPixels = 10
const kMaxPixels = 10000
const kMinInches = 0.0
const kMaxInches = 100
const kExcludeInvisiblePlants = true
const kIncludeInvisiblePlants = false
const kExcludeNonSelectedPlants = true
const kIncludeNonSelectedPlants = false
const kMaxCustomColors = 16
export const kAnimateByXRotation = 0
export const kAnimateByAge = 1

export enum DrawMode {
    kDrawFast = 0,
    kDrawMedium = 1,
    kDrawBest = 2,
    kDrawCustom = 3,
}

const kMinOutputCylinderFaces = 3
const kMaxOutputCylinderFaces = 20

const kDefaultV1IniFileName = "PlantStudio.ini"
const kDefaultV2IniFileName = "PlantStudio2.ini"

const kV2IniAddition = "_v2"

const kMaxRecentFiles = 10

export enum ViewPlants {
    kViewPlantsInMainWindowFreeFloating = 1,
    kViewPlantsInMainWindowOneAtATime = 2,
}

const kMaxUnregExportsAllowed = 20
const kMaxUnregExportsPerSessionAfterMaxReached = 2

const kInPlantMover = true
const kNotInPlantMover = false

// TODO: Fix TPixelFormat
type TPixelFormat = number

//pf32bit 
// v1.60
// record
export class BitmapOptionsStructure {
    exportType: short = 0
    colorType: TPixelFormat = 0
    resolution_pixelsPerInch: short = 0
    width_pixels: short = 0
    height_pixels: short = 0
    width_in: float = 0
    height_in: float = 0
    preserveAspectRatio: boolean = false
    jpegCompressionRatio: short = 0
    printPreserveAspectRatio: boolean = false
    printBorderInner: boolean = false
    printBorderOuter: boolean = false
    printWidth_in: float = 0
    printHeight_in: float = 0
    printLeftMargin_in: float = 0
    printTopMargin_in: float = 0
    printRightMargin_in: float = 0
    printBottomMargin_in: float = 0
    printBorderWidthInner: short = 0
    printBorderWidthOuter: short = 0
    borderThickness: short = 0
    borderGap: short = 0
    printBorderColorInner: TColorRef = 0
    printBorderColorOuter: TColorRef = 0
}

// 1 to 100
// don't save these, they are for storing to use during printing only
// record
export class NozzleOptionsStructure {
    exportType: short = 0
    resolution_pixelsPerInch: short = 0
    colorType: TPixelFormat = 0
    backgroundColor: TColorRef = 0
    cellSize: TPoint = new TPoint()
    cellCount: short = 0
}

// don't save in settings
// don't save in settings
// record
export class NumberedAnimationOptionsStructure {
    animateBy: short = 0
    xRotationIncrement: short = 0
    ageIncrement: short = 0
    resolution_pixelsPerInch: short = 0
    colorType: TPixelFormat = 0
    frameCount: short = 0
    scaledSize: TPoint = new TPoint()
    fileSize: long = 0
}

// don't save in settings
// don't save in settings
// don't save in settings
// record
export class DomainOptionsStructure {
    hideWelcomeForm: boolean = false
    openMostRecentFileAtStart: boolean = false
    ignoreWindowSettingsInFile: boolean = false
    cachePlantBitmaps: boolean = false
    memoryLimitForPlantBitmaps_MB: short = 0
    maxPartsPerPlant_thousands: short = 0
    backgroundColor: TColorRef = 0
    transparentColor: TColorRef = 0
    showSelectionRectangle: boolean = false
    showBoundsRectangle: boolean = false
    resizeRectSize: short = 0
    pasteRectSize: short = 0
    firstSelectionRectangleColor: TColorRef = 0
    multiSelectionRectangleColor: TColorRef = 0
    draw3DObjects: boolean = false
    drawStems: boolean = false
    fillPolygons: boolean = false
    drawSpeed: short = 0
    drawLinesBetweenPolygons: boolean = false
    sortPolygons: boolean = false
    draw3DObjectsAsBoundingRectsOnly: boolean = false
    showPlantDrawingProgress: boolean = false
    useMetricUnits: boolean = false
    undoLimit: short = 0
    undoLimitOfPlants: short = 0
    rotationIncrement: short = 0
    showLongHintsForButtons: boolean = false
    showHintsForParameters: boolean = false
    pauseBeforeHint: short = 0
    pauseDuringHint: short = 0
    noteEditorWrapLines: boolean = false
    updateTimeSeriesPlantsOnParameterChange: boolean = false
    mainWindowViewMode: short = 0
    nudgeDistance: short = 0
    resizeKeyUpMultiplierPercent: short = 0
    parametersFontSize: short = 0
    mainWindowOrientation: short = 0
    lineContrastIndex: short = 0
    sortTdosAsOneItem: boolean = false
    circlePointSizeInTdoEditor: short = 0
    partsInTdoEditor: short = 0
    fillTrianglesInTdoEditor: boolean = false
    drawLinesInTdoEditor: boolean = false
    showGhostingForHiddenParts: boolean = false
    showHighlightingForNonHiddenPosedParts: boolean = false
    showPosingAtAll: boolean = false
    ghostingColor: TColorRef = 0
    nonHiddenPosedColor: TColorRef = 0
    selectedPosedColor: TColorRef = 0
    showWindowOnException: boolean = false
    logToFileOnException: boolean = false
    wizardChoices: string[] = new Array(kMaxWizardQuestions + 1) /* kMaxWizardQuestions + 1 */
    wizardColors: TColorRef[] = new Array(kMaxWizardColors + 1) /* kMaxWizardColors + 1 */
    wizardTdoNames: string[] = new Array(kMaxWizardTdos + 1) /* kMaxWizardTdos + 1 */
    wizardShowFruit: boolean = false
    customColors: TColorRef[] = new Array(kMaxCustomColors) /* kMaxCustomColors - 1 + 1 */
    recentFiles: string[] = new Array(kMaxRecentFiles)/* kMaxRecentFiles - 1 + 1 */
}

// var
export let domain: PdDomain


// const
export const kUnsavedFileName = "untitled"
const kSectionFiles = 0
const kSectionPrefs = 1
const kSectionSettings = 2
const kSectionDXF = 3
const kSectionWizard = 4
const kSectionExport = 5
const kSectionPrinting = 6
const kCustomColors = 7
const kSectionBreeding = 8
const kSectionNozzle = 9
const kSectionAnimation = 10
// const kObsolete = 11
const kSectionOverrides = 12
const kSectionPOV = 13
const kSection3DS = 14
const kSectionOBJ = 15
const kSectionVRML = 16
const kSectionLWO = 17
const kSectionOtherRecentFiles = 18
const kLastSectionNumber = 18
const iniSections = ["Files", "Preferences", "Settings", "DXF", "Wizard", "Picture export", "Printing", "Custom colors", "Breeding", "Nozzles", "Animation", "Overrides", "POV", "3DS", "OBJ", "VRML", "LWO", "Other recent files", ]
const kStandardTdoLibraryFileName = "3D object library.tdo"
const kGetKeys = true
const kGetValues = false



// v2.1
// v2.0
//seconds
//seconds
// v1.4
//cfk change length if needed
export class PdDomain {
    plantFileName: string = ""
    lastOpenedPlantFileName: string = ""
    plantFileLoaded: boolean = false
    options: DomainOptionsStructure = new DomainOptionsStructure()
    breedingAndTimeSeriesOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    bitmapOptions: BitmapOptionsStructure = new BitmapOptionsStructure()
    exportOptionsFor3D: FileExport3DOptionsStructure[] = Array(ExportFormats.k3DExportTypeLast + 1)
    nozzleOptions: NozzleOptionsStructure = new NozzleOptionsStructure()
    animationOptions: NumberedAnimationOptionsStructure = new NumberedAnimationOptionsStructure()
    plantManager: PdPlantManager = new PdPlantManager()
    parameterManager: PdParameterManager = new PdParameterManager()
    sectionManager: PdSectionManager = new PdSectionManager()
    // TODO: FIX hintManager: PdHintManager = new PdHintManager()
    iniFileName: string = ""
    iniFileBackupName: string = ""
    useIniFile: boolean = false
    defaultTdoLibraryFileName: string = ""
    defaultTdoLibrary: KfObject3D[] = []
    mainWindowRect: TRect = new TRect()
    horizontalSplitterPos: short = 0
    verticalSplitterPos: short = 0
    breederWindowRect: TRect = new TRect()
    timeSeriesWindowRect: TRect = new TRect()
    debugWindowRect: TRect = new TRect()
    undoRedoListWindowRect: TRect = new TRect()
    tdoEditorWindowRect: TRect = new TRect()
    temporarilyHideSelectionRectangles: boolean = false
    drawingToMakeCopyBitmap: boolean = false
    plantDrawScaleWhenDrawingCopy_PixelsPerMm: float = 0.0
    plantDrawOffsetWhenDrawingCopy_mm: SinglePoint = new SinglePoint()
    // TODO: FIX iniLines: TStringList = new TStringList()
    gotInfoFromV1IniFile: boolean = false
    
    // managers 
    // support files 
    // for remembering settings 
    // for temporary use while drawing 
    // for making copy bitmap with different resolution than screen 
    // ------------------------------------------------------------------------------- creation/destruction
    static createDefault(): boolean {
        let result = false
        domain = new PdDomain()
        // TODO: Moved makeParameters call from startupLoading -- is this OK? Need to remove duplicate commented code there eventually
        domain.parameterManager.makeParameters()
        // TODO: Temporary -- replace with startup loading
        domain.getProfileInformationFromFile("TODO getProfileInformationFromFile")
        // TODO: FIX result = domain.startupLoading()
        return result
    }
    
    constructor() {
        // v1.5
        // TODO: FIX usupport.setDecimalSeparator()
        // create empty managers 
        // TODO: FIX this.parameterManager = uparams.PdParameterManager().create()
        // TODO: FIX this.sectionManager = usection.PdSectionManager().create()
        // TODO: FIX this.hintManager = uhints.PdHintManager().create()
        // TODO: FIX this.iniLines = delphi_compatability.TStringList.create
        // non-standard defaults 
        this.plantManager.plantDrawScale_PixelsPerMm = 1.0
        this.plantDrawScaleWhenDrawingCopy_PixelsPerMm = 1.0

        for (let i = 0; i <= ExportFormats.k3DExportTypeLast; i++) {
            this.exportOptionsFor3D[i] = new FileExport3DOptionsStructure()
        }
    }

    // TODO: Remove stub plantDrawOffset_mm
    plantDrawOffset_mm(): SinglePoint {
        return new SinglePoint(0, 0)
    }
    
    // TODO: Remove stub plantDrawScale_PixelsPerMm
    plantDrawScale_PixelsPerMm(): float {
        return 1.0
    }
    

    /* TODO Implement PdDomain methods
    
    windowsDirectory(): string {
        let result = ""
        let cString: char[] // 255 + 1
        
        result = ""
        UNRESOLVED.getWindowsDirectory(cString, 256)
        result = UNRESOLVED.strPas(cString)
        return result
    }
    
    // ------------------------------------------------------------------------------- loading
    startupLoading(): boolean {
        let result = false
        let i: short
        let iniFileFound: boolean
        let year: byte
        let month: byte
        let day: byte
        let v1IniFileName: string
        
        result = true
        this.iniFileName = kDefaultV2IniFileName
        this.useIniFile = true
        this.plantFileName = ""
        if (usplash.splashForm !== null) {
            usplash.splashForm.showLoadingString("Starting...")
        }
        if (UNRESOLVED.ParamCount > 0) {
            for (i = 1; i <= UNRESOLVED.ParamCount; i++) {
                if (uppercase(UNRESOLVED.ParamStr(i)) === "/I=") {
                    // ============= parse command line options 
                    this.useIniFile = false
                } else if (uppercase(UNRESOLVED.ParamStr(i)) === "/I") {
                    this.useIniFile = false
                } else if (pos("/I=", uppercase(UNRESOLVED.ParamStr(i))) === 1) {
                    this.iniFileName = UNRESOLVED.copy(UNRESOLVED.ParamStr(i), 4, len(UNRESOLVED.ParamStr(i)))
                } else if (pos("/I", uppercase(UNRESOLVED.ParamStr(i))) === 1) {
                    this.iniFileName = UNRESOLVED.copy(UNRESOLVED.ParamStr(i), 3, len(UNRESOLVED.ParamStr(i)))
                } else if ((this.plantFileName === "") && (pos("/", uppercase(UNRESOLVED.ParamStr(i))) !== 1)) {
                    this.plantFileName = UNRESOLVED.ParamStr(i)
                } else {
                    ShowMessage("Improper parameter string " + UNRESOLVED.ParamStr(i))
                }
            }
        }
        // make parameters
        // TODO: Moved makeParameters call to constructor -- is this OK? Need to remove duplicate commented code eventually
        this.parameterManager.makeParameters()
        // make hints
        this.hintManager.makeHints()
        // v2.0
        // reconcile v2 and v1 ini files
        // only do this if they did NOT specify an alternate file
        // if they specified an alternate file, there is no way to know what version it is;
        // just read it as v1 and write it as v2 (do not expect this to be common use)
        // if they asked NOT to read any ini file, skip doing this
        this.gotInfoFromV1IniFile = false
        if ((this.useIniFile) && (this.iniFileName === kDefaultV2IniFileName)) {
            if (!FileExists(this.windowsDirectory() + "\\" + this.iniFileName)) {
                // if no v2 ini file but there is a v1 ini file, read the v1 ini file NOW but do not change the name for writing out
                v1IniFileName = this.windowsDirectory() + "\\" + kDefaultV1IniFileName
                if (FileExists(v1IniFileName)) {
                    this.getProfileInformationFromFile(v1IniFileName)
                    this.gotInfoFromV1IniFile = true
                }
            }
        }
        if (ExtractFilePath(this.iniFileName) !== "") {
            // find out if ini file exists now, because if it doesn't we should save the profile info when leaving
            //    even if it did not change. if iniFileName does not have a directory, use Windows directory 
            iniFileFound = FileExists(this.iniFileName)
            if (!iniFileFound) {
                ShowMessage("Could not find alternate settings file " + chr(13) + chr(13) + "  " + this.iniFileName + chr(13) + chr(13) + "Using standard settings file in Windows directory instead.")
                this.iniFileName = kDefaultV2IniFileName
                iniFileFound = FileExists(this.windowsDirectory() + "\\" + this.iniFileName)
                this.iniFileName = this.windowsDirectory() + "\\" + this.iniFileName
            }
        } else {
            iniFileFound = FileExists(this.windowsDirectory() + "\\" + this.iniFileName)
            this.iniFileName = this.windowsDirectory() + "\\" + this.iniFileName
        }
        usupport.iniFileChanged = !iniFileFound
        if (iniFileFound && this.useIniFile) {
            // ============= if ini file doesn't exist or don't want, set default options; otherwise read options from ini file 
            // if already read options from v1 ini file, don't default - v2.0
            this.getProfileInformationFromFile(this.iniFileName)
        } else if (!this.gotInfoFromV1IniFile) {
            // defaults options
            this.getProfileInformationFromFile("")
        }
        this.startTimeThisSession = UNRESOLVED.Now
        if (this.plantFileName !== "") {
            try {
                if (usplash.splashForm !== null) {
                    // ============= load plant file from command line if found 
                    usplash.splashForm.showLoadingString("Reading startup file...")
                }
                this.plantFileName = this.buildFileNameInPath(this.plantFileName)
                this.load(this.plantFileName)
            } catch (Exception E) {
                ShowMessage(E.message)
                ShowMessage("Could not open plant file from command line " + this.plantFileName)
            }
        } else if ((this.useIniFile) && (this.options.openMostRecentFileAtStart)) {
            // ============= if most recent plant file in INI try it unless -I option 
            // assume ini file has been read by now
            this.plantFileName = this.stringForSectionAndKey("Files", "Recent", this.plantFileName)
            this.plantFileName = this.buildFileNameInPath(this.plantFileName)
            if ((this.plantFileName !== "") && this.isFileInPath(this.plantFileName)) {
                try {
                    if (usplash.splashForm !== null) {
                        usplash.splashForm.showLoadingString("Reading most recent file...")
                    }
                    this.load(this.plantFileName)
                } catch (Exception E) {
                    ShowMessage(E.message)
                    ShowMessage("Could not load most recently saved plant file " + this.plantFileName)
                }
            }
        }
        return result
    }
    
    // --------------------------------------------------------------------------------- ini file methods referred to
    sectionStartIndexInIniLines(section: string): int {
        let result = 0
        let i: int
        let aLine: string
        
        result = -1
        i = 0
        while (i <= this.iniLines.length - 1) {
            aLine = trim(this.iniLines.Strings[i])
            if ("[" + section + "]" === aLine) {
                result = i
                return result
            } else {
                i += 1
            }
        }
        return result
    }
    
    stringForSectionAndKey(section: string, key: string, defaultString: string): string {
        let result = ""
        let i: int
        let aLine: string
        
        result = defaultString
        if ((this.iniLines === null) || (this.iniLines.length <= 0)) {
            return result
        }
        i = this.sectionStartIndexInIniLines(section)
        if (i < 0) {
            return result
        }
        // move to next after section
        i += 1
        while (i <= this.iniLines.length - 1) {
            // only read up until next section - don't want to get same name from different section
            aLine = trim(this.iniLines.Strings[i])
            if ((len(aLine) > 0) && (aLine[1] === "[")) {
                return result
            }
            if (key === trim(usupport.stringUpTo(aLine, "="))) {
                result = usupport.stringBeyond(this.iniLines.Strings[i], "=")
                return result
            } else {
                i += 1
            }
        }
        return result
    }
    
    setStringForSectionAndKey(section: string, key: string, newString: string): void {
        let i: int
        let found: boolean
        let aLine: string
        
        if (this.iniLines === null) {
            return
        }
        i = this.sectionStartIndexInIniLines(section)
        if (i < 0) {
            // if no section found, add section at end and add this one item to it
            this.iniLines.push("[" + section + "]")
            this.iniLines.push(key + "=" + newString)
            // section found
        } else {
            found = false
            // move to next after section
            i += 1
            while (i <= this.iniLines.length - 1) {
                // only read up until next section - don't want to get same name from different section
                aLine = trim(this.iniLines.Strings[i])
                if ((len(aLine) > 0) && (aLine[1] === "[")) {
                    break
                }
                if (key === trim(usupport.stringUpTo(this.iniLines.Strings[i], "="))) {
                    this.iniLines.Strings[i] = key + "=" + newString
                    found = true
                    break
                } else {
                    i += 1
                }
            }
            if (!found) {
                if (i <= this.iniLines.length - 1) {
                    // if there was no match for the key, ADD a line to the section
                    this.iniLines.Insert(i, key + "=" + newString)
                } else {
                    this.iniLines.push(key + "=" + newString)
                }
            }
        }
    }
    
    readSectionKeysOrValues(section: string, aList: TStringList, getKeys: boolean): void {
        let i: int
        let aLine: string
        
        if ((this.iniLines === null) || (this.iniLines.length <= 0)) {
            return
        }
        i = this.sectionStartIndexInIniLines(section)
        if (i < 0) {
            return
        }
        // move to next after section
        i += 1
        while (i <= this.iniLines.length - 1) {
            aLine = trim(this.iniLines.Strings[i])
            if ((len(aLine) > 0) && (aLine[1] === "[")) {
                break
            }
            if (getKeys) {
                // values
                aList.push(trim(usupport.stringUpTo(this.iniLines.Strings[i], "=")))
            } else {
                aList.push(usupport.stringBeyond(this.iniLines.Strings[i], "="))
            }
            i += 1
        }
    }
    
    removeSectionFromIniLines(section: string): void {
        let i: int
        let aLine: string
        
        if ((this.iniLines === null) || (this.iniLines.length <= 0)) {
            return
        }
        i = this.sectionStartIndexInIniLines(section)
        if (i < 0) {
            return
        }
        this.iniLines.Delete(i)
        while (i <= this.iniLines.length - 1) {
            aLine = trim(this.iniLines.Strings[i])
            if ((len(aLine) > 0) && (aLine[1] === "[")) {
                break
            }
            this.iniLines.Delete(i)
        }
    }
    
    */
    // --------------------------------------------------------------------------------- ini file load/save

    // TODO: Replace stub stringForSectionAndKey
    stringForSectionAndKey(section: string, key: string, defaultString: string): string {
        return defaultString
    }

    getProfileInformationFromFile(fileName: string): void {
        /*
        let i: short
        let j: short
        let section: string
        let typeName: string
        let timeString: string
        let key: string
        let value: string
        let sectionName: string
        let paramName: string
        let readNumber: float
        let readInt: int
        let overrideKeys: TStringList
        let overrideValues: TStringList
        let param: PdParameter
        let stream: KfStringStream
        
        if (fileName !== "") {
            this.iniLines.LoadFromFile(fileName)
        }
        // ------------------------------------------- files
        section = iniSections[kSectionFiles]
        this.defaultTdoLibraryFileName = this.stringForSectionAndKey(section, "3D object library", ExtractFilePath(delphi_compatability.Application.exeName) + "3D object library.tdo")
        // ------------------------------------------- recent files
        section = iniSections[kSectionOtherRecentFiles]
        for (i = 0; i <= kMaxRecentFiles - 1; i++) {
            this.options.recentFiles[i] = this.stringForSectionAndKey(section, "File" + IntToStr(i + 1), "")
        }

        */

        // TODO:Remove next line and get sections to work loaded from somewhere
        const section = ""

        // ------------------------------------------- preferences
        // Todo: Use or remove and replace next line: section = iniSections[kSectionPrefs]
        this.options.openMostRecentFileAtStart = strToBool(this.stringForSectionAndKey(section, "Open most recent file at start", "true"))
        this.options.ignoreWindowSettingsInFile = strToBool(this.stringForSectionAndKey(section, "Ignore window settings saved in files", "false"))
        this.options.cachePlantBitmaps = strToBool(this.stringForSectionAndKey(section, "Draw plants into separate bitmaps", "true"))
        this.options.memoryLimitForPlantBitmaps_MB = StrToInt(this.stringForSectionAndKey(section, "Memory limit for plant bitmaps (in MB)", "5"))
        this.options.maxPartsPerPlant_thousands = StrToInt(this.stringForSectionAndKey(section, "Max parts per plant (in thousands)", "10"))
        this.options.hideWelcomeForm = strToBool(this.stringForSectionAndKey(section, "Hide welcome window", "false"))
        this.options.backgroundColor = StrToInt(this.stringForSectionAndKey(section, "Background color", IntToStr(ColorDefs.clWhite)))
        this.options.transparentColor = StrToInt(this.stringForSectionAndKey(section, "Transparent color", IntToStr(ColorDefs.clWhite)))
        this.options.showSelectionRectangle = strToBool(this.stringForSectionAndKey(section, "Show selection rectangle", "true"))
        this.options.showBoundsRectangle = strToBool(this.stringForSectionAndKey(section, "Show bounding rectangle", "false"))
        this.options.resizeRectSize = StrToInt(this.stringForSectionAndKey(section, "Resizing rectangle size", "6"))
        this.options.pasteRectSize = StrToInt(this.stringForSectionAndKey(section, "Paste rectangle size", "100"))
        this.options.firstSelectionRectangleColor = StrToInt(this.stringForSectionAndKey(section, "First selection rectangle color", IntToStr(ColorDefs.clRed)))
        this.options.multiSelectionRectangleColor = StrToInt(this.stringForSectionAndKey(section, "Multi selection rectangle color", IntToStr(ColorDefs.clBlue)))
        this.options.draw3DObjects = strToBool(this.stringForSectionAndKey(section, "Draw 3D objects", "true"))
        this.options.drawStems = strToBool(this.stringForSectionAndKey(section, "Draw stems", "true"))
        this.options.fillPolygons = strToBool(this.stringForSectionAndKey(section, "Fill polygons", "true"))
        this.options.drawSpeed = StrToInt(this.stringForSectionAndKey(section, "Draw speed (boxes/frames/solids)", IntToStr(DrawMode.kDrawBest)))
        this.options.drawLinesBetweenPolygons = strToBool(this.stringForSectionAndKey(section, "Draw lines between polygons", "true"))
        this.options.sortPolygons = strToBool(this.stringForSectionAndKey(section, "Sort polygons", "true"))
        this.options.draw3DObjectsAsBoundingRectsOnly = strToBool(this.stringForSectionAndKey(section, "Draw 3D objects as squares", "false"))
        this.options.showPlantDrawingProgress = strToBool(this.stringForSectionAndKey(section, "Show drawing progress", "true"))
        this.options.useMetricUnits = strToBool(this.stringForSectionAndKey(section, "Use metric units", "true"))
        this.options.undoLimit = StrToInt(this.stringForSectionAndKey(section, "Actions to keep in undo list", "50"))
        this.options.undoLimitOfPlants = StrToInt(this.stringForSectionAndKey(section, "Plants to keep in undo list", "10"))
        this.options.rotationIncrement = StrToInt(this.stringForSectionAndKey(section, "Rotation button increment", "10"))
        this.options.showLongHintsForButtons = strToBool(this.stringForSectionAndKey(section, "Show long hints for buttons", "true"))
        this.options.showHintsForParameters = strToBool(this.stringForSectionAndKey(section, "Show hints for parameters", "true"))
        this.options.pauseBeforeHint = StrToInt(this.stringForSectionAndKey(section, "Pause before hint", "1"))
        this.options.pauseDuringHint = StrToInt(this.stringForSectionAndKey(section, "Pause during hint", "60"))
        this.options.noteEditorWrapLines = strToBool(this.stringForSectionAndKey(section, "Wrap lines in note editor", "true"))
        this.options.updateTimeSeriesPlantsOnParameterChange = strToBool(this.stringForSectionAndKey(section, "Update time series plants on parameter change", "true"))
        this.options.mainWindowViewMode = StrToInt(this.stringForSectionAndKey(section, "Main window view option (all/one)", "0"))
        this.options.nudgeDistance = StrToInt(this.stringForSectionAndKey(section, "Distance plant moves with Control-arrow key", "5"))
        this.options.resizeKeyUpMultiplierPercent = StrToInt(this.stringForSectionAndKey(section, "Percent size increase with Control-Shift-up-arrow key", "110"))
        this.options.parametersFontSize = StrToInt(this.stringForSectionAndKey(section, "Parameter panels font size", "8"))
        this.options.mainWindowOrientation = StrToInt(this.stringForSectionAndKey(section, "Main window orientation (horiz/vert)", "0"))
        this.options.lineContrastIndex = StrToInt(this.stringForSectionAndKey(section, "Contrast index for lines on polygons", "3"))
        this.options.sortTdosAsOneItem = strToBool(this.stringForSectionAndKey(section, "Sort 3D objects as one item", "true"))
        this.options.circlePointSizeInTdoEditor = StrToInt(this.stringForSectionAndKey(section, "3D object editor point size", "8"))
        this.options.partsInTdoEditor = StrToInt(this.stringForSectionAndKey(section, "3D object editor parts", "1"))
        this.options.fillTrianglesInTdoEditor = strToBool(this.stringForSectionAndKey(section, "3D object editor fill triangles", "true"))
        this.options.drawLinesInTdoEditor = strToBool(this.stringForSectionAndKey(section, "3D object editor draw lines", "true"))
        this.options.showWindowOnException = strToBool(this.stringForSectionAndKey(section, "Show numerical exceptions window on exception", "false"))
        this.options.logToFileOnException = strToBool(this.stringForSectionAndKey(section, "Log to file on exception", "false"))
        this.options.showGhostingForHiddenParts = strToBool(this.stringForSectionAndKey(section, "Ghost hidden parts", "false"))
        this.options.showHighlightingForNonHiddenPosedParts = strToBool(this.stringForSectionAndKey(section, "Highlight posed parts", "true"))
        this.options.showPosingAtAll = strToBool(this.stringForSectionAndKey(section, "Show posing", "true"))
        this.options.ghostingColor = StrToInt(this.stringForSectionAndKey(section, "Ghosting color", IntToStr(ColorDefs.clSilver)))
        this.options.nonHiddenPosedColor = StrToInt(this.stringForSectionAndKey(section, "Posed color", IntToStr(ColorDefs.clBlue)))
        this.options.selectedPosedColor = StrToInt(this.stringForSectionAndKey(section, "Posed selected color", IntToStr(ColorDefs.clRed)))
        
        /*
        // ------------------------------------------- settings
        section = iniSections[kSectionSettings]
        this.mainWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "Window position", "50 50 500 350"))
        this.horizontalSplitterPos = StrToInt(this.stringForSectionAndKey(section, "Horizontal split", "200"))
        this.verticalSplitterPos = StrToInt(this.stringForSectionAndKey(section, "Vertical split", "200"))
        this.debugWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "Numerical exceptions window position", "75 75 400 200"))
        this.undoRedoListWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "Undo/redo list window position", "100 100 400 300"))
        this.tdoEditorWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "3D object editor window position", "100 100 400 400"))
        this.breederWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "Breeder position", "100 100 400 350"))
        this.timeSeriesWindowRect = usupport.stringToRect(this.stringForSectionAndKey(section, "Time series position", "150 150 250 150"))
        */
       
        for (let i = 1; i <= ExportFormats.k3DExportTypeLast; i++) {
            // ------------------------------------------- 3d export options
            const section = iniSections[this.sectionNumberFor3DExportType(i)]
            const typeName = nameFor3DExportType(i)
            // ------------------------------------------- options in common for all
            this.exportOptionsFor3D[i].exportType = StrToInt(this.stringForSectionAndKey(section, typeName + " which plants to draw (selected/visible/all)", "0"))
            this.exportOptionsFor3D[i].layeringOption = StrToInt(this.stringForSectionAndKey(section, typeName + " layering option (all/by type/by part)", "1"))
            this.exportOptionsFor3D[i].stemCylinderFaces = StrToInt(this.stringForSectionAndKey(section, typeName + " stem cylinder sides", "5"))
            this.exportOptionsFor3D[i].translatePlantsToWindowPositions = strToBool(this.stringForSectionAndKey(section, typeName + " translate plants to match window positions", "true"))
            if (i === ExportFormats.k3DS) {
                this.exportOptionsFor3D[i].lengthOfShortName = StrToInt(this.stringForSectionAndKey(section, typeName + " length of plant name", "2"))
            } else {
                this.exportOptionsFor3D[i].lengthOfShortName = StrToInt(this.stringForSectionAndKey(section, typeName + " length of plant name", "8"))
            }
            this.exportOptionsFor3D[i].writePlantNumberInFrontOfName = strToBool(this.stringForSectionAndKey(section, typeName + " write plant number in front of name", "false"))
            this.exportOptionsFor3D[i].writeColors = strToBool(this.stringForSectionAndKey(section, typeName + " write colors", "true"))
            this.exportOptionsFor3D[i].xRotationBeforeDraw = StrToInt(this.stringForSectionAndKey(section, typeName + " X rotation before drawing", "0"))
            this.exportOptionsFor3D[i].overallScalingFactor_pct = StrToInt(this.stringForSectionAndKey(section, typeName + " scaling factor (percent)", "100"))
            this.exportOptionsFor3D[i].pressPlants = strToBool(this.stringForSectionAndKey(section, typeName + " press plants", "false"))
            this.exportOptionsFor3D[i].directionToPressPlants = StrToInt(this.stringForSectionAndKey(section, typeName + " press dimension (x/y/z)", IntToStr(Axis.kY)))
            this.exportOptionsFor3D[i].makeTrianglesDoubleSided = strToBool(this.stringForSectionAndKey(section, typeName + " double sided", "true"))
            if (i === ExportFormats.kDXF) {
                // ------------------------------------------- special options
                this.exportOptionsFor3D[i].dxf_whereToGetColors = StrToInt(this.stringForSectionAndKey(section, "DXF colors option (by type/by part/all)", "0"))
                // lime
                this.exportOptionsFor3D[i].dxf_wholePlantColorIndex = StrToInt(this.stringForSectionAndKey(section, "DXF whole plant color index", "2"))
                for (let j = 0; j <= ExportPart.kExportPartLast; j++) {
                    // lime
                    this.exportOptionsFor3D[i].dxf_plantPartColorIndexes[j] = StrToInt(this.stringForSectionAndKey(section, "DXF color indexes " + IntToStr(j + 1), "2"))
                }
            } else if (i === ExportFormats.kPOV) {
                this.exportOptionsFor3D[i].pov_minLineLengthToWrite = strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "POV minimum line length to write (mm)", "0.01"))
                this.exportOptionsFor3D[i].pov_minTdoScaleToWrite = strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "POV minimum 3D object scale to write", "0.01"))
                this.exportOptionsFor3D[i].pov_commentOutUnionAtEnd = strToBool(this.stringForSectionAndKey(section, "POV comment out union of plants at end", "false"))
            } else if (i === ExportFormats.kVRML) {
                this.exportOptionsFor3D[i].vrml_version = StrToInt(this.stringForSectionAndKey(section, "VRML version", "1"))
            }
            if ((i === ExportFormats.kPOV) || (i === ExportFormats.kVRML)) {
                this.exportOptionsFor3D[i].nest_LeafAndPetiole = strToBool(this.stringForSectionAndKey(section, typeName + " nest leaves with petioles", "true"))
                this.exportOptionsFor3D[i].nest_CompoundLeaf = strToBool(this.stringForSectionAndKey(section, typeName + " compound leaves", "true"))
                this.exportOptionsFor3D[i].nest_Inflorescence = strToBool(this.stringForSectionAndKey(section, typeName + " nest inflorescences", "true"))
                this.exportOptionsFor3D[i].nest_PedicelAndFlowerFruit = strToBool(this.stringForSectionAndKey(section, typeName + " nest flowers/fruits with pedicels", "true"))
                this.exportOptionsFor3D[i].nest_FloralLayers = strToBool(this.stringForSectionAndKey(section, typeName + " nest pistils and stamens", "true"))
            }
        }

        /*
        // ------------------------------------------- wizard
        section = iniSections[kSectionWizard]
        // meristems
        this.options.wizardChoices[uwizard.kMeristem_AlternateOrOpposite] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kMeristem_AlternateOrOpposite), "leavesAlternate")
        this.options.wizardChoices[uwizard.kMeristem_BranchIndex] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kMeristem_BranchIndex), "branchNone")
        this.options.wizardChoices[uwizard.kMeristem_SecondaryBranching] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kMeristem_SecondaryBranching), "secondaryBranchingNo")
        this.options.wizardChoices[uwizard.kMeristem_BranchAngle] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kMeristem_BranchAngle), "branchAngleSmall")
        // internodes
        this.options.wizardChoices[uwizard.kInternode_Curviness] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInternode_Curviness), "curvinessLittle")
        this.options.wizardChoices[uwizard.kInternode_Length] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInternode_Length), "internodesMedium")
        this.options.wizardChoices[uwizard.kInternode_Thickness] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInternode_Thickness), "internodeWidthThin")
        // leaves
        this.options.wizardChoices[uwizard.kLeaves_Scale] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaves_Scale), "leafScaleMedium")
        this.options.wizardChoices[uwizard.kLeaves_PetioleLength] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaves_PetioleLength), "petioleMedium")
        this.options.wizardChoices[uwizard.kLeaves_Angle] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaves_Angle), "leafAngleMedium")
        // compound leaves
        this.options.wizardChoices[uwizard.kLeaflets_Number] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaflets_Number), "leafletsOne")
        this.options.wizardChoices[uwizard.kLeaflets_Shape] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaflets_Shape), "leafletsPinnate")
        this.options.wizardChoices[uwizard.kLeaflets_Spread] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kLeaflets_Spread), "leafletSpacingMedium")
        // inflor placement
        this.options.wizardChoices[uwizard.kInflorPlace_NumApical] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorPlace_NumApical), "apicalInflorsNone")
        this.options.wizardChoices[uwizard.kInflorPlace_ApicalStalkLength] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorPlace_ApicalStalkLength), "apicalStalkMedium")
        this.options.wizardChoices[uwizard.kInflorPlace_NumAxillary] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorPlace_NumAxillary), "axillaryInflorsNone")
        this.options.wizardChoices[uwizard.kInflorPlace_AxillaryStalkLength] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorPlace_AxillaryStalkLength), "axillaryStalkMedium")
        // inflor drawing
        this.options.wizardChoices[uwizard.kInflorDraw_NumFlowers] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorDraw_NumFlowers), "inflorFlowersThree")
        this.options.wizardChoices[uwizard.kInflorDraw_Shape] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorDraw_Shape), "inflorShapeRaceme")
        this.options.wizardChoices[uwizard.kInflorDraw_Thickness] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kInflorDraw_Thickness), "inflorWidthThin")
        // flowers
        this.options.wizardChoices[uwizard.kFlowers_NumPetals] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kFlowers_NumPetals), "petalsFive")
        this.options.wizardChoices[uwizard.kFlowers_Scale] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kFlowers_Scale), "petalScaleSmall")
        this.options.wizardColors[1] = StrToInt(this.stringForSectionAndKey(section, "Wizard colors 1", IntToStr(delphi_compatability.clFuchsia)))
        // fruit
        this.options.wizardChoices[uwizard.kFruit_NumSections] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kFruit_NumSections), "fruitSectionsFive")
        this.options.wizardChoices[uwizard.kFruit_Scale] = this.stringForSectionAndKey(section, "Wizard question " + IntToStr(uwizard.kFruit_Scale), "fruitScaleSmall")
        this.options.wizardColors[2] = StrToInt(this.stringForSectionAndKey(section, "Wizard colors 2", IntToStr(delphi_compatability.clRed)))
        for (i = 1; i <= kMaxWizardTdos; i++) {
            // the wizard will default the tdo names when it comes up, we don't have to do it here
            this.options.wizardTdoNames[i] = this.stringForSectionAndKey(section, "Wizard 3D objects " + IntToStr(i), "")
        }
        this.options.wizardShowFruit = strToBool(this.stringForSectionAndKey(section, "Wizard show fruit", "false"))
        
        // ------------------------------------------- custom colors
        section = iniSections[kCustomColors]
        for (i = 0; i <= kMaxCustomColors - 1; i++) {
            this.options.customColors[i] = StrToInt(this.stringForSectionAndKey(section, "Custom color " + IntToStr(i + 1), "0"))
        }
        // with options
        
        // -------------------------------------------  export (2D)
        section = iniSections[kSectionExport]
        this.bitmapOptions.exportType = StrToInt(this.stringForSectionAndKey(section, "Which plants to draw (selected/visible/all/drawing)", IntToStr(kIncludeSelectedPlants)))
        this.bitmapOptions.colorType = UNRESOLVED.TPixelFormat(StrToInt(this.stringForSectionAndKey(section, "Colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", "6")))
        this.bitmapOptions.resolution_pixelsPerInch = StrToInt(this.stringForSectionAndKey(section, "Resolution (pixels per inch)", IntToStr(kDefaultResolution)))
        this.bitmapOptions.width_pixels = StrToInt(this.stringForSectionAndKey(section, "Picture width (pixels)", "400"))
        this.bitmapOptions.height_pixels = StrToInt(this.stringForSectionAndKey(section, "Picture height (pixels)", "400"))
        this.bitmapOptions.width_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Picture width (inches)", "2.0"))
        this.bitmapOptions.height_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Picture height (inches)", "2.0"))
        this.bitmapOptions.preserveAspectRatio = strToBool(this.stringForSectionAndKey(section, "Preserve aspect ratio", "true"))
        this.bitmapOptions.jpegCompressionRatio = StrToInt(this.stringForSectionAndKey(section, "JPEG compression quality ratio (1-100)", "50"))
        
        // -------------------------------------------  printing
        section = iniSections[kSectionPrinting]
        this.bitmapOptions.printPreserveAspectRatio = strToBool(this.stringForSectionAndKey(section, "Preserve aspect ratio", "true"))
        this.bitmapOptions.printWidth_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print width (inches)", "4.0"))
        this.bitmapOptions.printHeight_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print height (inches)", "4.0"))
        this.bitmapOptions.printLeftMargin_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print left margin (inches)", "1.0"))
        this.bitmapOptions.printTopMargin_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print top margin (inches)", "1.0"))
        this.bitmapOptions.printRightMargin_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print right margin (inches)", "1.0"))
        this.bitmapOptions.printBottomMargin_in = usupport.strToFloatWithCommaCheck(this.stringForSectionAndKey(section, "Print bottom margin (inches)", "1.0"))
        this.bitmapOptions.printBorderInner = strToBool(this.stringForSectionAndKey(section, "Print inner border", "false"))
        this.bitmapOptions.printBorderOuter = strToBool(this.stringForSectionAndKey(section, "Print outer border", "false"))
        this.bitmapOptions.printBorderWidthInner = StrToInt(this.stringForSectionAndKey(section, "Inner border width (pixels)", "1"))
        this.bitmapOptions.printBorderWidthOuter = StrToInt(this.stringForSectionAndKey(section, "Outer border width (pixels)", "1"))
        this.bitmapOptions.printBorderColorInner = StrToInt(this.stringForSectionAndKey(section, "Inner border color", "0"))
        this.bitmapOptions.printBorderColorOuter = StrToInt(this.stringForSectionAndKey(section, "Outer border color", "0"))
        */

        // -------------------------------------------  breeding
        // TODO: Use or remove: section = iniSections[kSectionBreeding]
        this.breedingAndTimeSeriesOptions.plantsPerGeneration = StrToInt(this.stringForSectionAndKey(section, "Plants per generation", "5"))
        this.breedingAndTimeSeriesOptions.percentMaxAge = StrToInt(this.stringForSectionAndKey(section, "Percent max age", "100"))
        this.breedingAndTimeSeriesOptions.variationType = StrToInt(this.stringForSectionAndKey(section, "Variation (low/med/high/custom/none)", "1"))
        this.breedingAndTimeSeriesOptions.thumbnailWidth = StrToInt(this.stringForSectionAndKey(section, "Thumbnail width", "40"))
        this.breedingAndTimeSeriesOptions.thumbnailHeight = StrToInt(this.stringForSectionAndKey(section, "Thumbnail height", "80"))
        this.breedingAndTimeSeriesOptions.maxGenerations = StrToInt(this.stringForSectionAndKey(section, "Max generations", "30"))
        this.breedingAndTimeSeriesOptions.numTimeSeriesStages = StrToInt(this.stringForSectionAndKey(section, "Time series stages", "5"))
        for (let i = 0; i <= kMaxBreedingSections - 1; i++) {
            this.breedingAndTimeSeriesOptions.mutationStrengths[i] = StrToInt(this.stringForSectionAndKey(section, "Mutation " + IntToStr(i + 1), IntToStr(MutationRate.kMediumMutation)))
        }
        for (let i = 0; i <= kMaxBreedingSections - 1; i++) {
            this.breedingAndTimeSeriesOptions.firstPlantWeights[i] = StrToInt(this.stringForSectionAndKey(section, "First plant weight " + IntToStr(i + 1), "50"))
        }
        this.breedingAndTimeSeriesOptions.getNonNumericalParametersFrom = StrToInt(this.stringForSectionAndKey(section, "Non-numeric", "5"))
        this.breedingAndTimeSeriesOptions.mutateAndBlendColorValues = strToBool(this.stringForSectionAndKey(section, "Vary colors", "false"))
        this.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary = strToBool(this.stringForSectionAndKey(section, "Vary 3D objects", "false"))
        
        /*
        // -------------------------------------------  nozzles
        section = iniSections[kSectionNozzle]
        this.nozzleOptions.exportType = StrToInt(this.stringForSectionAndKey(section, "Which plants to make nozzle from (selected/visible/all)", "0"))
        this.nozzleOptions.resolution_pixelsPerInch = StrToInt(this.stringForSectionAndKey(section, "Nozzle resolution", IntToStr(kDefaultResolution)))
        this.nozzleOptions.colorType = UNRESOLVED.TPixelFormat(StrToInt(this.stringForSectionAndKey(section, "Nozzle colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", "6")))
        this.nozzleOptions.backgroundColor = StrToInt(this.stringForSectionAndKey(section, "Nozzle background color", IntToStr(delphi_compatability.clWhite)))
        
        // -------------------------------------------  animations
        section = iniSections[kSectionAnimation]
        this.animationOptions.animateBy = StrToInt(this.stringForSectionAndKey(section, "Animate by (x rotation/age)", "0"))
        this.animationOptions.xRotationIncrement = StrToInt(this.stringForSectionAndKey(section, "X rotation increment", "10"))
        this.animationOptions.ageIncrement = StrToInt(this.stringForSectionAndKey(section, "Age increment", "5"))
        this.animationOptions.resolution_pixelsPerInch = StrToInt(this.stringForSectionAndKey(section, "Resolution", IntToStr(kDefaultResolution)))
        // 24 bit
        this.animationOptions.colorType = UNRESOLVED.TPixelFormat(StrToInt(this.stringForSectionAndKey(section, "Animation colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", "6")))
        
        // -------------------------------------------  parameter overrides
        section = iniSections[kSectionOverrides]
        overrideKeys = delphi_compatability.TStringList.create
        overrideValues = delphi_compatability.TStringList.create
        try {
            this.readSectionKeysOrValues(section, overrideKeys, kGetKeys)
            this.readSectionKeysOrValues(section, overrideValues, kGetValues)
            if (overrideKeys.length > 0) {
                for (i = 0; i <= overrideKeys.length - 1; i++) {
                    key = overrideKeys.Strings[i]
                    // v2.1 changed to require section and param name for overrides
                    sectionName = trim(usupport.stringUpTo(key, ":"))
                    paramName = trim(usupport.stringBeyond(key, ":"))
                    value = overrideValues.Strings[i]
                    value = usupport.stringBeyond(value, "=")
                    param = null
                    param = this.sectionManager.parameterForSectionAndName(sectionName, paramName)
                    if ((param === null) || (param.cannotOverride)) {
                        continue
                    }
                    stream = usstream.KfStringStream.create
                    try {
                        stream.onStringSeparator(value, " ")
                        try {
                            param.lowerBoundOverride = usupport.strToFloatWithCommaCheck(stream.nextToken())
                            param.upperBoundOverride = usupport.strToFloatWithCommaCheck(stream.nextToken())
                            param.defaultValueStringOverride = usupport.stringBetween("(", ")", stream.remainder)
                            param.isOverridden = true
                        } catch (e) {
                            param.isOverridden = false
                        }
                    } finally {
                        stream.free
                    }
                }
            }
        } finally {
            overrideKeys.free
            overrideValues.free
        }
        this.boundProfileInformation()

    */
    }

    /*
    
    storeProfileInformation(): void {
        let i: short
        let j: short
        let section: string
        let typeName: string
        let saveNumber: float
        let saveInt: int
        let param: PdParameter
        
        try {
            // v1.5
            usupport.setDecimalSeparator()
            if (this.gotInfoFromV1IniFile) {
                // remove two sections gotten rid of in v2
                this.removeSectionFromIniLines("Breeder")
                this.removeSectionFromIniLines("Time series")
            }
            // files 
            section = iniSections[kSectionFiles]
            if (pos(uppercase(kUnsavedFileName), uppercase(this.lastOpenedPlantFileName)) === 0) {
                this.setStringForSectionAndKey(section, "Recent", this.lastOpenedPlantFileName)
            } else {
                this.setStringForSectionAndKey(section, "Recent", "")
            }
            this.setStringForSectionAndKey(section, "3D object library", this.defaultTdoLibraryFileName)
            // recent files
            section = iniSections[kSectionOtherRecentFiles]
            for (i = 0; i <= kMaxRecentFiles - 1; i++) {
                if (this.options.recentFiles[i] !== "") {
                    this.setStringForSectionAndKey(section, "File" + IntToStr(i + 1), this.options.recentFiles[i])
                }
            }
            // preferences 
            section = iniSections[kSectionPrefs]
            this.setStringForSectionAndKey(section, "Hide welcome window", usupport.boolToStr(this.options.hideWelcomeForm))
            this.setStringForSectionAndKey(section, "Open most recent file at start", usupport.boolToStr(this.options.openMostRecentFileAtStart))
            this.setStringForSectionAndKey(section, "Ignore window settings saved in files", usupport.boolToStr(this.options.ignoreWindowSettingsInFile))
            this.setStringForSectionAndKey(section, "Draw plants into separate bitmaps", usupport.boolToStr(this.options.cachePlantBitmaps))
            this.setStringForSectionAndKey(section, "Memory limit for plant bitmaps (in MB)", IntToStr(this.options.memoryLimitForPlantBitmaps_MB))
            this.setStringForSectionAndKey(section, "Max parts per plant (in thousands)", IntToStr(this.options.maxPartsPerPlant_thousands))
            this.setStringForSectionAndKey(section, "Background color", IntToStr(this.options.backgroundColor))
            this.setStringForSectionAndKey(section, "Transparent color", IntToStr(this.options.transparentColor))
            this.setStringForSectionAndKey(section, "Show selection rectangle", usupport.boolToStr(this.options.showSelectionRectangle))
            this.setStringForSectionAndKey(section, "Show bounding rectangle", usupport.boolToStr(this.options.showBoundsRectangle))
            this.setStringForSectionAndKey(section, "Resizing rectangle size", IntToStr(this.options.resizeRectSize))
            this.setStringForSectionAndKey(section, "Paste rectangle size", IntToStr(this.options.pasteRectSize))
            this.setStringForSectionAndKey(section, "First selection rectangle color", IntToStr(this.options.firstSelectionRectangleColor))
            this.setStringForSectionAndKey(section, "Multi selection rectangle color", IntToStr(this.options.multiSelectionRectangleColor))
            this.setStringForSectionAndKey(section, "Draw 3D objects", usupport.boolToStr(this.options.draw3DObjects))
            this.setStringForSectionAndKey(section, "Draw stems", usupport.boolToStr(this.options.drawStems))
            this.setStringForSectionAndKey(section, "Fill polygons", usupport.boolToStr(this.options.fillPolygons))
            this.setStringForSectionAndKey(section, "Draw speed (boxes/frames/solids)", IntToStr(this.options.drawSpeed))
            this.setStringForSectionAndKey(section, "Draw lines between polygons", usupport.boolToStr(this.options.drawLinesBetweenPolygons))
            this.setStringForSectionAndKey(section, "Sort polygons", usupport.boolToStr(this.options.sortPolygons))
            this.setStringForSectionAndKey(section, "Draw 3D objects as squares", usupport.boolToStr(this.options.draw3DObjectsAsBoundingRectsOnly))
            this.setStringForSectionAndKey(section, "Show drawing progress", usupport.boolToStr(this.options.showPlantDrawingProgress))
            this.setStringForSectionAndKey(section, "Use metric units", usupport.boolToStr(this.options.useMetricUnits))
            this.setStringForSectionAndKey(section, "Actions to keep in undo list", IntToStr(this.options.undoLimit))
            this.setStringForSectionAndKey(section, "Plants to keep in undo list", IntToStr(this.options.undoLimitOfPlants))
            this.setStringForSectionAndKey(section, "Rotation button increment", IntToStr(this.options.rotationIncrement))
            this.setStringForSectionAndKey(section, "Show long hints for buttons", usupport.boolToStr(this.options.showLongHintsForButtons))
            this.setStringForSectionAndKey(section, "Show hints for parameters", usupport.boolToStr(this.options.showHintsForParameters))
            this.setStringForSectionAndKey(section, "Pause before hint", IntToStr(this.options.pauseBeforeHint))
            this.setStringForSectionAndKey(section, "Pause during hint", IntToStr(this.options.pauseDuringHint))
            this.setStringForSectionAndKey(section, "Wrap lines in note editor", usupport.boolToStr(this.options.noteEditorWrapLines))
            
            // prefs
            section = iniSections[kSectionPrefs]
            this.setStringForSectionAndKey(section, "Update time series plants on parameter change", usupport.boolToStr(this.options.updateTimeSeriesPlantsOnParameterChange))
            this.setStringForSectionAndKey(section, "Main window view option (all/one)", IntToStr(this.options.mainWindowViewMode))
            this.setStringForSectionAndKey(section, "Distance plant moves with Control-arrow key", IntToStr(this.options.nudgeDistance))
            this.setStringForSectionAndKey(section, "Percent size increase with Control-Shift-up-arrow key", IntToStr(this.options.resizeKeyUpMultiplierPercent))
            this.setStringForSectionAndKey(section, "Parameter panels font size", IntToStr(this.options.parametersFontSize))
            this.setStringForSectionAndKey(section, "Main window orientation (horiz/vert)", IntToStr(this.options.mainWindowOrientation))
            this.setStringForSectionAndKey(section, "Contrast index for lines on polygons", IntToStr(this.options.lineContrastIndex))
            this.setStringForSectionAndKey(section, "Sort 3D objects as one item", usupport.boolToStr(this.options.sortTdosAsOneItem))
            this.setStringForSectionAndKey(section, "3D object editor point size", IntToStr(this.options.circlePointSizeInTdoEditor))
            this.setStringForSectionAndKey(section, "3D object editor parts", IntToStr(this.options.partsInTdoEditor))
            this.setStringForSectionAndKey(section, "3D object editor fill triangles", usupport.boolToStr(this.options.fillTrianglesInTdoEditor))
            this.setStringForSectionAndKey(section, "3D object editor draw lines", usupport.boolToStr(this.options.drawLinesInTdoEditor))
            this.setStringForSectionAndKey(section, "Show numerical exceptions window on exception", usupport.boolToStr(this.options.showWindowOnException))
            this.setStringForSectionAndKey(section, "Log to file on exception", usupport.boolToStr(this.options.logToFileOnException))
            this.setStringForSectionAndKey(section, "Ghost hidden parts", usupport.boolToStr(this.options.showGhostingForHiddenParts))
            this.setStringForSectionAndKey(section, "Highlight posed parts", usupport.boolToStr(this.options.showHighlightingForNonHiddenPosedParts))
            this.setStringForSectionAndKey(section, "Show posing", usupport.boolToStr(this.options.showPosingAtAll))
            this.setStringForSectionAndKey(section, "Ghosting color", IntToStr(this.options.ghostingColor))
            this.setStringForSectionAndKey(section, "Posed color", IntToStr(this.options.nonHiddenPosedColor))
            this.setStringForSectionAndKey(section, "Posed selected color", IntToStr(this.options.selectedPosedColor))
            
            // settings 
            section = iniSections[kSectionSettings]
            this.setStringForSectionAndKey(section, "Window position", usupport.rectToString(this.mainWindowRect))
            this.setStringForSectionAndKey(section, "Horizontal split", IntToStr(this.horizontalSplitterPos))
            this.setStringForSectionAndKey(section, "Vertical split", IntToStr(this.verticalSplitterPos))
            this.setStringForSectionAndKey(section, "Numerical exceptions window position", usupport.rectToString(this.debugWindowRect))
            this.setStringForSectionAndKey(section, "Undo/redo list window position", usupport.rectToString(this.undoRedoListWindowRect))
            this.setStringForSectionAndKey(section, "3D object editor window position", usupport.rectToString(this.tdoEditorWindowRect))
            this.setStringForSectionAndKey(section, "Breeder position", usupport.rectToString(this.breederWindowRect))
            this.setStringForSectionAndKey(section, "Time series position", usupport.rectToString(this.timeSeriesWindowRect))
            for (i = 1; i <= u3dexport.k3DExportTypeLast; i++) {
                // 3d export options
                section = iniSections[this.sectionNumberFor3DExportType(i)]
                typeName = u3dexport.nameFor3DExportType(i)
                // options in common for all
                this.setStringForSectionAndKey(section, typeName + " which plants to draw (selected/visible/all)", IntToStr(this.exportOptionsFor3D[i].exportType))
                this.setStringForSectionAndKey(section, typeName + " layering option (all/by type/by part)", IntToStr(this.exportOptionsFor3D[i].layeringOption))
                this.setStringForSectionAndKey(section, typeName + " stem cylinder sides", IntToStr(this.exportOptionsFor3D[i].stemCylinderFaces))
                this.setStringForSectionAndKey(section, typeName + " translate plants to match window positions", usupport.boolToStr(this.exportOptionsFor3D[i].translatePlantsToWindowPositions))
                this.setStringForSectionAndKey(section, typeName + " length of plant name", IntToStr(this.exportOptionsFor3D[i].lengthOfShortName))
                this.setStringForSectionAndKey(section, typeName + " write plant number in front of name", usupport.boolToStr(this.exportOptionsFor3D[i].writePlantNumberInFrontOfName))
                this.setStringForSectionAndKey(section, typeName + " write colors", usupport.boolToStr(this.exportOptionsFor3D[i].writeColors))
                this.setStringForSectionAndKey(section, typeName + " X rotation before drawing", IntToStr(this.exportOptionsFor3D[i].xRotationBeforeDraw))
                this.setStringForSectionAndKey(section, typeName + " scaling factor (percent)", IntToStr(this.exportOptionsFor3D[i].overallScalingFactor_pct))
                this.setStringForSectionAndKey(section, typeName + " press plants", usupport.boolToStr(this.exportOptionsFor3D[i].pressPlants))
                this.setStringForSectionAndKey(section, typeName + " press dimension (x/y/z)", IntToStr(this.exportOptionsFor3D[i].directionToPressPlants))
                this.setStringForSectionAndKey(section, typeName + " double sided", usupport.boolToStr(this.exportOptionsFor3D[i].makeTrianglesDoubleSided))
                if (i === u3dexport.kDXF) {
                    // special options
                    this.setStringForSectionAndKey(section, "DXF colors option (by type/by part/all)", IntToStr(this.exportOptionsFor3D[i].dxf_whereToGetColors))
                    this.setStringForSectionAndKey(section, "DXF whole plant color index", IntToStr(this.exportOptionsFor3D[i].dxf_wholePlantColorIndex))
                    for (j = 0; j <= ExportPart.kExportPartLast; j++) {
                        this.setStringForSectionAndKey(section, "DXF color indexes " + IntToStr(j + 1), IntToStr(this.exportOptionsFor3D[i].dxf_plantPartColorIndexes[j]))
                    }
                } else if (i === u3dexport.kPOV) {
                    this.setStringForSectionAndKey(section, "POV minimum line length to write (mm)", usupport.digitValueString(this.exportOptionsFor3D[i].pov_minLineLengthToWrite))
                    this.setStringForSectionAndKey(section, "POV minimum 3D object scale to write", usupport.digitValueString(this.exportOptionsFor3D[i].pov_minTdoScaleToWrite))
                    this.setStringForSectionAndKey(section, "POV comment out union of plants at end", usupport.boolToStr(this.exportOptionsFor3D[i].pov_commentOutUnionAtEnd))
                } else if (i === u3dexport.kVRML) {
                    this.setStringForSectionAndKey(section, "VRML version", IntToStr(this.exportOptionsFor3D[i].vrml_version))
                }
                if ((i === u3dexport.kPOV) || (i === u3dexport.kVRML)) {
                    this.setStringForSectionAndKey(section, typeName + " nest leaves with petioles", usupport.boolToStr(this.exportOptionsFor3D[i].nest_LeafAndPetiole))
                    this.setStringForSectionAndKey(section, typeName + " compound leaves", usupport.boolToStr(this.exportOptionsFor3D[i].nest_CompoundLeaf))
                    this.setStringForSectionAndKey(section, typeName + " nest inflorescences", usupport.boolToStr(this.exportOptionsFor3D[i].nest_Inflorescence))
                    this.setStringForSectionAndKey(section, typeName + " nest flowers/fruits with pedicels", usupport.boolToStr(this.exportOptionsFor3D[i].nest_PedicelAndFlowerFruit))
                    this.setStringForSectionAndKey(section, typeName + " nest pistils and stamens", usupport.boolToStr(this.exportOptionsFor3D[i].nest_FloralLayers))
                }
            }
            // wizard 
            section = iniSections[kSectionWizard]
            for (i = 1; i <= kMaxWizardQuestions; i++) {
                this.setStringForSectionAndKey(section, "Wizard question " + IntToStr(i), this.options.wizardChoices[i])
            }
            for (i = 1; i <= kMaxWizardColors; i++) {
                this.setStringForSectionAndKey(section, "Wizard colors " + IntToStr(i), IntToStr(this.options.wizardColors[i]))
            }
            for (i = 1; i <= kMaxWizardTdos; i++) {
                this.setStringForSectionAndKey(section, "Wizard 3D objects " + IntToStr(i), this.options.wizardTdoNames[i])
            }
            this.setStringForSectionAndKey(section, "Wizard show fruit", usupport.boolToStr(this.options.wizardShowFruit))
            // custom colors
            section = iniSections[kCustomColors]
            for (i = 0; i <= kMaxCustomColors - 1; i++) {
                this.setStringForSectionAndKey(section, "Custom color " + IntToStr(i + 1), IntToStr(this.options.customColors[i]))
            }
            // export 
            section = iniSections[kSectionExport]
            this.setStringForSectionAndKey(section, "Which plants to draw (selected/visible/all/drawing)", IntToStr(this.bitmapOptions.exportType))
            this.setStringForSectionAndKey(section, "Colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", IntToStr(ord(this.bitmapOptions.colorType)))
            this.setStringForSectionAndKey(section, "Resolution (pixels per inch)", IntToStr(this.bitmapOptions.resolution_pixelsPerInch))
            this.setStringForSectionAndKey(section, "Picture width (pixels)", IntToStr(this.bitmapOptions.width_pixels))
            this.setStringForSectionAndKey(section, "Picture height (pixels)", IntToStr(this.bitmapOptions.height_pixels))
            this.setStringForSectionAndKey(section, "Picture width (inches)", usupport.digitValueString(this.bitmapOptions.width_in))
            this.setStringForSectionAndKey(section, "Picture height (inches)", usupport.digitValueString(this.bitmapOptions.height_in))
            this.setStringForSectionAndKey(section, "Preserve aspect ratio", usupport.boolToStr(this.bitmapOptions.preserveAspectRatio))
            this.setStringForSectionAndKey(section, "JPEG compression quality ratio (1-100)", IntToStr(this.bitmapOptions.jpegCompressionRatio))
            // printing 
            section = iniSections[kSectionPrinting]
            this.setStringForSectionAndKey(section, "Preserve aspect ratio", usupport.boolToStr(this.bitmapOptions.printPreserveAspectRatio))
            this.setStringForSectionAndKey(section, "Print width (inches)", usupport.digitValueString(this.bitmapOptions.printWidth_in))
            this.setStringForSectionAndKey(section, "Print height (inches)", usupport.digitValueString(this.bitmapOptions.printHeight_in))
            this.setStringForSectionAndKey(section, "Print left margin (inches)", usupport.digitValueString(this.bitmapOptions.printLeftMargin_in))
            this.setStringForSectionAndKey(section, "Print top margin (inches)", usupport.digitValueString(this.bitmapOptions.printTopMargin_in))
            this.setStringForSectionAndKey(section, "Print right margin (inches)", usupport.digitValueString(this.bitmapOptions.printRightMargin_in))
            this.setStringForSectionAndKey(section, "Print bottom margin (inches)", usupport.digitValueString(this.bitmapOptions.printBottomMargin_in))
            this.setStringForSectionAndKey(section, "Print inner border", usupport.boolToStr(this.bitmapOptions.printBorderInner))
            this.setStringForSectionAndKey(section, "Print outer border", usupport.boolToStr(this.bitmapOptions.printBorderOuter))
            this.setStringForSectionAndKey(section, "Inner border width (pixels)", IntToStr(this.bitmapOptions.printBorderWidthInner))
            this.setStringForSectionAndKey(section, "Outer border width (pixels)", IntToStr(this.bitmapOptions.printBorderWidthOuter))
            this.setStringForSectionAndKey(section, "Inner border color", IntToStr(this.bitmapOptions.printBorderColorInner))
            this.setStringForSectionAndKey(section, "Outer border color", IntToStr(this.bitmapOptions.printBorderColorOuter))
            section = iniSections[kSectionBreeding]
            this.setStringForSectionAndKey(section, "Plants per generation", IntToStr(this.breedingAndTimeSeriesOptions.plantsPerGeneration))
            this.setStringForSectionAndKey(section, "Variation (low/med/high/custom/none)", IntToStr(this.breedingAndTimeSeriesOptions.variationType))
            this.setStringForSectionAndKey(section, "Percent max age", IntToStr(this.breedingAndTimeSeriesOptions.percentMaxAge))
            this.setStringForSectionAndKey(section, "Thumbnail width", IntToStr(this.breedingAndTimeSeriesOptions.thumbnailWidth))
            this.setStringForSectionAndKey(section, "Thumbnail height", IntToStr(this.breedingAndTimeSeriesOptions.thumbnailHeight))
            this.setStringForSectionAndKey(section, "Max generations", IntToStr(this.breedingAndTimeSeriesOptions.maxGenerations))
            this.setStringForSectionAndKey(section, "Time series stages", IntToStr(this.breedingAndTimeSeriesOptions.numTimeSeriesStages))
            for (i = 0; i <= uplant.kMaxBreedingSections - 1; i++) {
                this.setStringForSectionAndKey(section, "Mutation " + IntToStr(i + 1), IntToStr(this.breedingAndTimeSeriesOptions.mutationStrengths[i]))
            }
            for (i = 0; i <= uplant.kMaxBreedingSections - 1; i++) {
                this.setStringForSectionAndKey(section, "First plant weight " + IntToStr(i + 1), IntToStr(this.breedingAndTimeSeriesOptions.firstPlantWeights[i]))
            }
            this.setStringForSectionAndKey(section, "Non-numeric", IntToStr(this.breedingAndTimeSeriesOptions.getNonNumericalParametersFrom))
            this.setStringForSectionAndKey(section, "Vary colors", usupport.boolToStr(this.breedingAndTimeSeriesOptions.mutateAndBlendColorValues))
            this.setStringForSectionAndKey(section, "Vary 3D objects", usupport.boolToStr(this.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary))
            section = iniSections[kSectionNozzle]
            this.setStringForSectionAndKey(section, "Which plants to make nozzle from (selected/visible/all)", IntToStr(this.nozzleOptions.exportType))
            this.setStringForSectionAndKey(section, "Nozzle resolution", IntToStr(this.nozzleOptions.resolution_pixelsPerInch))
            this.setStringForSectionAndKey(section, "Nozzle colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", IntToStr(ord(this.nozzleOptions.colorType)))
            this.setStringForSectionAndKey(section, "Nozzle background color", IntToStr(this.nozzleOptions.backgroundColor))
            section = iniSections[kSectionAnimation]
            this.setStringForSectionAndKey(section, "Animate by (x rotation/age)", IntToStr(this.animationOptions.animateBy))
            this.setStringForSectionAndKey(section, "X rotation increment", IntToStr(this.animationOptions.xRotationIncrement))
            this.setStringForSectionAndKey(section, "Age increment", IntToStr(this.animationOptions.ageIncrement))
            this.setStringForSectionAndKey(section, "Resolution", IntToStr(this.animationOptions.resolution_pixelsPerInch))
            this.setStringForSectionAndKey(section, "Animation colors (screen/2/16/256/15-bit/16-bit/24-bit/32-bit)", IntToStr(ord(this.animationOptions.colorType)))
            // write parameter overrides
            section = iniSections[kSectionOverrides]
            if (this.parameterManager.parameters.length > 0) {
                for (i = 0; i <= this.parameterManager.parameters.length - 1; i++) {
                    param = uparams.PdParameter(this.parameterManager.parameters[i])
                    if ((!param.cannotOverride) && (param.isOverridden)) {
                        // v2.1 added section name to override key
                        this.setStringForSectionAndKey(section, param.originalSectionName + ": " + param.name, usupport.digitValueString(param.lowerBoundOverride) + " " + usupport.digitValueString(param.upperBoundOverride) + " " + "(" + param.defaultValueStringOverride + ")")
                    }
                }
            }
            this.iniLines.SaveToFile(this.iniFileName)
        } finally {
            usupport.iniFileChanged = false
        }
    }
    
    boundProfileInformation(): void {
        let i: short
        let j: short
        
        this.options.resizeRectSize = umath.intMax(2, umath.intMin(20, this.options.resizeRectSize))
        this.options.pasteRectSize = umath.intMax(50, umath.intMin(500, this.options.pasteRectSize))
        this.options.memoryLimitForPlantBitmaps_MB = umath.intMax(1, umath.intMin(200, this.options.memoryLimitForPlantBitmaps_MB))
        this.options.maxPartsPerPlant_thousands = umath.intMax(1, umath.intMin(100, this.options.maxPartsPerPlant_thousands))
        this.horizontalSplitterPos = umath.intMax(50, this.horizontalSplitterPos)
        this.verticalSplitterPos = umath.intMax(30, this.verticalSplitterPos)
        this.options.nudgeDistance = umath.intMax(1, umath.intMin(100, this.options.nudgeDistance))
        this.options.resizeKeyUpMultiplierPercent = umath.intMax(100, umath.intMin(200, this.options.resizeKeyUpMultiplierPercent))
        this.options.parametersFontSize = umath.intMax(6, umath.intMin(20, this.options.parametersFontSize))
        this.options.mainWindowOrientation = umath.intMax(0, umath.intMin(kMaxMainWindowOrientations, this.options.mainWindowOrientation))
        this.options.undoLimit = umath.intMax(0, umath.intMin(1000, this.options.undoLimit))
        this.options.undoLimitOfPlants = umath.intMax(0, umath.intMin(500, this.options.undoLimitOfPlants))
        this.options.circlePointSizeInTdoEditor = umath.intMax(1, umath.intMin(30, this.options.circlePointSizeInTdoEditor))
        this.options.partsInTdoEditor = umath.intMax(1, umath.intMin(30, this.options.partsInTdoEditor))
        this.options.lineContrastIndex = umath.intMax(0, umath.intMin(10, this.options.lineContrastIndex))
        this.options.drawSpeed = umath.intMax(0, umath.intMin(kDrawCustom, this.options.drawSpeed))
        this.bitmapOptions.exportType = umath.intMax(0, umath.intMin(kMaxIncludeOption, this.bitmapOptions.exportType))
        this.bitmapOptions.colorType = UNRESOLVED.TPixelFormat(umath.intMax(0, umath.intMin(kMaxColorOption, ord(this.bitmapOptions.colorType))))
        this.bitmapOptions.resolution_pixelsPerInch = umath.intMax(kMinResolution, umath.intMin(kMaxResolution, this.bitmapOptions.resolution_pixelsPerInch))
        this.bitmapOptions.width_pixels = umath.intMax(kMinPixels, umath.intMin(kMaxPixels, this.bitmapOptions.width_pixels))
        this.bitmapOptions.height_pixels = umath.intMax(kMinPixels, umath.intMin(kMaxPixels, this.bitmapOptions.height_pixels))
        this.bitmapOptions.width_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.width_in))
        this.bitmapOptions.height_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.height_in))
        this.bitmapOptions.printWidth_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printWidth_in))
        this.bitmapOptions.printHeight_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printHeight_in))
        this.bitmapOptions.printLeftMargin_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printLeftMargin_in))
        this.bitmapOptions.printTopMargin_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printTopMargin_in))
        this.bitmapOptions.printRightMargin_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printRightMargin_in))
        this.bitmapOptions.printBottomMargin_in = umath.max(kMinInches, umath.min(kMaxInches, this.bitmapOptions.printBottomMargin_in))
        this.bitmapOptions.printBorderWidthInner = umath.intMax(0, umath.intMin(1000, this.bitmapOptions.printBorderWidthInner))
        this.bitmapOptions.printBorderWidthOuter = umath.intMax(0, umath.intMin(1000, this.bitmapOptions.printBorderWidthOuter))
        this.breedingAndTimeSeriesOptions.plantsPerGeneration = umath.intMax(1, umath.intMin(100, this.breedingAndTimeSeriesOptions.plantsPerGeneration))
        this.breedingAndTimeSeriesOptions.variationType = umath.intMax(0, umath.intMin(4, this.breedingAndTimeSeriesOptions.variationType))
        this.breedingAndTimeSeriesOptions.percentMaxAge = umath.intMax(1, umath.intMin(100, this.breedingAndTimeSeriesOptions.percentMaxAge))
        this.breedingAndTimeSeriesOptions.thumbnailWidth = umath.intMin(200, umath.intMax(30, this.breedingAndTimeSeriesOptions.thumbnailWidth))
        this.breedingAndTimeSeriesOptions.thumbnailHeight = umath.intMin(200, umath.intMax(30, this.breedingAndTimeSeriesOptions.thumbnailHeight))
        this.breedingAndTimeSeriesOptions.maxGenerations = umath.intMax(20, umath.intMin(500, this.breedingAndTimeSeriesOptions.maxGenerations))
        this.breedingAndTimeSeriesOptions.numTimeSeriesStages = umath.intMax(1, umath.intMin(100, this.breedingAndTimeSeriesOptions.numTimeSeriesStages))
        for (i = 0; i <= uplant.kMaxBreedingSections - 1; i++) {
            this.breedingAndTimeSeriesOptions.mutationStrengths[i] = umath.intMax(0, umath.intMin(100, this.breedingAndTimeSeriesOptions.mutationStrengths[i]))
        }
        for (i = 0; i <= uplant.kMaxBreedingSections - 1; i++) {
            this.breedingAndTimeSeriesOptions.firstPlantWeights[i] = umath.intMax(0, umath.intMin(100, this.breedingAndTimeSeriesOptions.firstPlantWeights[i]))
        }
        this.breedingAndTimeSeriesOptions.getNonNumericalParametersFrom = umath.intMax(0, umath.intMin(5, this.breedingAndTimeSeriesOptions.getNonNumericalParametersFrom))
        this.nozzleOptions.exportType = umath.intMax(0, umath.intMin(kIncludeAllPlants, this.nozzleOptions.exportType))
        this.nozzleOptions.resolution_pixelsPerInch = umath.intMax(kMinResolution, umath.intMin(kMaxResolution, this.nozzleOptions.resolution_pixelsPerInch))
        this.animationOptions.animateBy = umath.intMax(0, umath.intMin(kAnimateByAge, this.animationOptions.animateBy))
        this.animationOptions.xRotationIncrement = umath.intMax(-360, umath.intMin(360, this.animationOptions.xRotationIncrement))
        // will check against max plant age later
        this.animationOptions.ageIncrement = umath.intMax(0, umath.intMin(1000, this.animationOptions.ageIncrement))
        this.animationOptions.resolution_pixelsPerInch = umath.intMax(kMinResolution, umath.intMin(kMaxResolution, this.animationOptions.resolution_pixelsPerInch))
        for (i = 1; i <= u3dexport.k3DExportTypeLast; i++) {
            this.exportOptionsFor3D[i].exportType = umath.intMax(0, umath.intMin(kIncludeAllPlants, this.exportOptionsFor3D[i].exportType))
            this.exportOptionsFor3D[i].layeringOption = umath.intMax(u3dexport.kLayerOutputAllTogether, umath.intMin(u3dexport.kLayerOutputByPlantPart, this.exportOptionsFor3D[i].layeringOption))
            this.exportOptionsFor3D[i].stemCylinderFaces = umath.intMax(kMinOutputCylinderFaces, umath.intMin(kMaxOutputCylinderFaces, this.exportOptionsFor3D[i].stemCylinderFaces))
            this.exportOptionsFor3D[i].lengthOfShortName = umath.intMax(1, umath.intMin(60, this.exportOptionsFor3D[i].lengthOfShortName))
            this.exportOptionsFor3D[i].xRotationBeforeDraw = umath.intMax(-180, umath.intMin(180, this.exportOptionsFor3D[i].xRotationBeforeDraw))
            this.exportOptionsFor3D[i].overallScalingFactor_pct = umath.intMax(1, umath.intMin(10000, this.exportOptionsFor3D[i].overallScalingFactor_pct))
            this.exportOptionsFor3D[i].directionToPressPlants = umath.intMax(u3dexport.kX, umath.intMin(u3dexport.kZ, this.exportOptionsFor3D[i].directionToPressPlants))
            this.exportOptionsFor3D[i].dxf_whereToGetColors = umath.intMax(u3dexport.kColorDXFFromPlantPartType, umath.intMin(u3dexport.kColorDXFFromOneColor, this.exportOptionsFor3D[i].dxf_whereToGetColors))
            this.exportOptionsFor3D[i].dxf_wholePlantColorIndex = umath.intMax(0, umath.intMin(u3dexport.kLastDxfColorIndex, this.exportOptionsFor3D[i].dxf_wholePlantColorIndex))
            for (j = 0; j <= ExportPart.kExportPartLast; j++) {
                this.exportOptionsFor3D[i].dxf_plantPartColorIndexes[j] = umath.intMax(0, umath.intMin(u3dexport.kLastDxfColorIndex, this.exportOptionsFor3D[i].dxf_plantPartColorIndexes[j]))
            }
            this.exportOptionsFor3D[i].pov_minLineLengthToWrite = umath.max(0.0, umath.min(100.0, this.exportOptionsFor3D[i].pov_minLineLengthToWrite))
            this.exportOptionsFor3D[i].pov_minTdoScaleToWrite = umath.max(0.0, umath.min(100.0, this.exportOptionsFor3D[i].pov_minTdoScaleToWrite))
            this.exportOptionsFor3D[i].vrml_version = umath.intMax(u3dexport.kVRMLVersionOne, umath.intMin(u3dexport.kVRMLVersionTwo, this.exportOptionsFor3D[i].vrml_version))
        }
    }
    
    */

    // --------------------------------------------------------------------------- plant file i/o 
    load(fileName: string): void {
        let extension: string
        
        this.plantFileLoaded = false
        try {
            this.plantFileName = fileName
            this.plantFileName = ExpandFileName(this.plantFileName)
            // v2.1 check for file extension - when opening file on startup or send to
            extension = stringBeyond(ExtractFileName(this.plantFileName), ".").toLowerCase()
            if (extension !== "pla") {
                ShowMessage("The file (" + this.plantFileName + ") does not have the correct extension (pla).")
            } else {
                // TODO: PDF Need to get contents for plants file somehow from web
                throw new Error("Unfinished")
                this.plantManager.loadPlantsFromFile(fileName, kNotInPlantMover, "")
                this.plantFileLoaded = true
                if (MainForm !== null) {
                    MainForm.setPlantFileChanged(false)
                }
                this.lastOpenedPlantFileName = this.plantFileName
                this.lastOpenedPlantFileName = this.lastOpenedPlantFileName.trim()
                // v1.60
                this.updateRecentFileNames(this.lastOpenedPlantFileName)
            }
        } catch (e) {
            this.plantFileLoaded = false
            // callers need exception
            throw new Error("Problem loading plant file")
        }
    }
    

    save(fileName: string): void {
        this.plantManager.savePlantsToFile(fileName, kNotInPlantMover)
    }

    // v1.60
    updateRecentFileNames(aFileName: string): void {
        let i: short
        let saved: boolean
        
        for (i = 0; i <= kMaxRecentFiles - 1; i++) {
            if (this.options.recentFiles[i] === aFileName) {
                // first look to see if the file is already there, and if so don't record it twice
                return
            }
        }
        // now look for an empty spot in the array
        saved = false
        for (i = 0; i <= kMaxRecentFiles - 1; i++) {
            if (this.options.recentFiles[i] === "") {
                this.options.recentFiles[i] = aFileName
                saved = true
                break
            }
        }
        if (!saved) {
            for (i = 0; i <= kMaxRecentFiles - 1; i++) {
                if (i < kMaxRecentFiles - 1) {
                    // if there was no empty spot, shift the files up one and add it to the end
                    this.options.recentFiles[i] = this.options.recentFiles[i + 1]
                } else {
                    this.options.recentFiles[i] = aFileName
                }
            }
        }
        if (MainForm !== null) {
            // PDF PORTING -- maybe syntax error in original -- had empty parens -- unless intended as procedure or function call from pointer? Probably not
            MainForm.updateFileMenuForOtherRecentFiles()
        }
    }

    resetForEmptyPlantFile(): void {
        this.plantManager.plants = []
        this.plantFileLoaded = true
        this.plantFileName = kUnsavedFileName + "." + extensionForFileType(FileType.kFileTypePlant)
        this.lastOpenedPlantFileName = ""
        if (MainForm !== null) {
            MainForm.setPlantFileChanged(false)
        }
    }
    
    resetForNoPlantFile(): void {
        this.plantManager.plants = []
        this.plantFileLoaded = false
        this.plantFileName = ""
        this.lastOpenedPlantFileName = ""
        if (MainForm !== null) {
            MainForm.setPlantFileChanged(false)
        }
    }
    
    checkForExistingDefaultTdoLibrary(): boolean {
        return false
        /* TODO: implement checkForExistingDefaultTdoLibrary
        let result = false
        // returns false if user wants to cancel action
        result = true
        if (!FileExists(this.defaultTdoLibraryFileName)) {
            MessageDialog("No 3D object library has been chosen." + chr(13) + chr(13) + "In order to continue with what you are doing," + chr(13) + "you need to choose a 3D object library" + chr(13) + "from the dialog that follows this one.", mtWarning, {mbOK, }, 0)
            this.defaultTdoLibraryFileName = usupport.getFileOpenInfo(usupport.kFileTypeTdo, this.defaultTdoLibraryFileName, "Choose a 3D object library (tdo) file")
            result = this.defaultTdoLibraryFileName !== ""
        }
        return result
        */
    }

    /*
    
    // ------------------------------------------------------------------- file/directory utilities 
    nameIsAbsolute(fileName: string): boolean {
        let result = false
        result = ((pos("\\", fileName) === 1) || (pos(":", fileName) === 2))
        return result
    }
    
    isFileInPath(fileName: string): boolean {
        let result = false
        let qualifiedName: string
        
        result = true
        //see if file exists
        qualifiedName = fileName
        if (!FileExists(qualifiedName)) {
            if (!this.nameIsAbsolute(fileName)) {
                //this merging process could be more sophisticated in case
                //     file name has leading drive or leading slash - just not merging for now
                qualifiedName = ExtractFilePath(delphi_compatability.Application.exeName) + fileName
            }
            if (!FileExists(qualifiedName)) {
                result = false
            }
        }
        return result
    }
    
    //searches for file according to name, and then in exe directory, and then gives up
    buildFileNameInPath(fileName: string): string {
        let result = ""
        result = ExpandFileName(fileName)
        if (FileExists(result)) {
            return result
        }
        result = ExtractFilePath(delphi_compatability.Application.exeName) + ExtractFileName(fileName)
        if (FileExists(result)) {
            return result
        }
        result = fileName
        return result
    }
    
    firstUnusedUnsavedFileName(): string {
        let result = ""
        let fileNumber: short
        
        result = ""
        fileNumber = 1
        while (fileNumber < 100) {
            result = ExtractFilePath(delphi_compatability.Application.exeName) + this.unsavedFileNameForNumber(fileNumber)
            if (!FileExists(result)) {
                return result
            }
            fileNumber += 1
        }
        ShowMessage("Too many unnamed plant files. Delete some to reuse names.")
        return result
    }
    
    unsavedFileNameForNumber(aNumber: short): string {
        let result = ""
        let numberString: string
        
        numberString = IntToStr(aNumber)
        if (len(numberString) === 1) {
            numberString = "0" + numberString
        }
        result = kUnsavedFileName + numberString + ".pla"
        return result
    }
    
    getColorUsingCustomColors(originalColor: TColorRef): TColorRef {
        let result = new TColorRef()
        let colorDialog: TColorDialog
        let i: short
        let colorString: string
        let color: TColorRef
        
        // may be more efficient to do this from main window, because a colorDialog component on the form
        // would keep the custom colors between uses without having to change the domain colors
        result = originalColor
        colorDialog = delphi_compatability.TColorDialog().Create(delphi_compatability.Application)
        colorDialog.Color = originalColor
        colorDialog.customColors.clear
        for (i = 0; i <= kMaxCustomColors - 1; i++) {
            if (this.options.customColors[i] === originalColor) {
                // add new color to custom colors if not already there and there is room
                // (this assumes they don't want black as a custom color)
                break
            }
            if (this.options.customColors[i] === delphi_compatability.clBlack) {
                this.options.customColors[i] = originalColor
                break
            }
        }
        for (i = 0; i <= kMaxCustomColors - 1; i++) {
            // load our custom colors into color dialog custom colors
            colorString = "Color" + chr(ord("A") + i) + "=" + UNRESOLVED.Format("%.6x", {this.options.customColors[i], })
            colorDialog.customColors.add(colorString)
        }
        colorDialog.options = {UNRESOLVED.cdFullOpen, }
        try {
            if (colorDialog.Execute()) {
                result = colorDialog.Color
                for (i = 0; i <= colorDialog.customColors.count - 1; i++) {
                    colorString = colorDialog.customColors[i]
                    colorString = usupport.stringBeyond(colorString, "=")
                    color = StrToIntDef("$" + colorString, 0)
                    this.options.customColors[i] = color
                }
            }
        } finally {
            colorDialog.free
        }
        return result
    }

    */

    sectionNumberFor3DExportType(anOutputType: short): short {
        let result = 0
        switch (anOutputType) {
            case ExportFormats.kDXF:
                result = kSectionDXF
                break
            case ExportFormats.kPOV:
                result = kSectionPOV
                break
            case ExportFormats.k3DS:
                result = kSection3DS
                break
            case ExportFormats.kOBJ:
                result = kSectionOBJ
                break
            case ExportFormats.kVRML:
                result = kSectionVRML
                break
            case ExportFormats.kLWO:
                result = kSectionLWO
                break
            default:
                throw new Error("Problem: Invalid type in PdDomain.sectionNumberFor3DExportType.")
        }
        return result
    }

    /*
    
    plantDrawOffset_mm(): SinglePoint {
        let result = new SinglePoint()
        result = usupport.setSinglePoint(0, 0)
        if (this.plantManager === null) {
            return result
        }
        result = this.plantManager.plantDrawOffset_mm
        return result
    }
    
    plantDrawScale_PixelsPerMm(): float {
        let result = 0.0
        result = 1.0
        if (this.plantManager === null) {
            return result
        }
        result = this.plantManager.plantDrawScale_PixelsPerMm
        return result
    }

    */
    
    viewPlantsInMainWindowFreeFloating(): boolean {
        return this.options.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowFreeFloating
    }
    
    viewPlantsInMainWindowOnePlantAtATime(): boolean {
        return this.options.mainWindowViewMode === ViewPlants.kViewPlantsInMainWindowOneAtATime
    }
}

// TODO: Someone needs to call this after all files are loaded:
// PdDomain.createDefault()
