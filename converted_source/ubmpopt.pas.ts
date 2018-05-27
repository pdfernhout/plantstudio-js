// unit ubmpopt

from conversion_common import *
import udebug
import uborders
import umain
import umath
import usupport
import updform
import udomain
import delphi_compatability

// const
const kCopyingDrawing = 0
const kPrintingDrawing = 1
const kSavingDrawingToBmp = 2
const kSavingDrawingToJpeg = 3


// const
const kTransferLoad = 1
const kTransferSave = 2
const kSpinNone = 0
const kSpinUp = 1
const kSpinDown = -1
const kEditIsInteger = 0
const kEditIsFloat = 1
const kWidthWasChanged = 0
const kHeightWasChanged = 1
const kHeightAndWidthWereChanged = 2
const kEditBoxHasInteger = 0
const kEditBoxHasFloat = 1
const kTooManyMegabytesOfMemory = 10.0


//$R *.DFM
function floatStr(value: float): string {
    let result = ""
    result = FloatToStrF(value, UNRESOLVED.ffFixed, 7, 2)
    return result
}


export class TBitmapOptionsForm {
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    printBox: TGroupBox = new TGroupBox()
    outputBox: TGroupBox = new TGroupBox()
    resolutionLabel: TLabel = new TLabel()
    sizePixelsLabel: TLabel = new TLabel()
    sizeInchesLabel: TLabel = new TLabel()
    inchWidthEdit: TEdit = new TEdit()
    inchHeightEdit: TEdit = new TEdit()
    colorType: TComboBox = new TComboBox()
    colorsLabel: TLabel = new TLabel()
    printSetup: TButton = new TButton()
    printPreserveAspectRatio: TCheckBox = new TCheckBox()
    plantsBox: TGroupBox = new TGroupBox()
    useSelectedPlants: TRadioButton = new TRadioButton()
    useAllPlants: TRadioButton = new TRadioButton()
    useDrawingAreaContents: TRadioButton = new TRadioButton()
    useVisiblePlants: TRadioButton = new TRadioButton()
    resolutionEdit: TEdit = new TEdit()
    pixelWidthEdit: TEdit = new TEdit()
    pixelHeightEdit: TEdit = new TEdit()
    resolutionSpin: TSpinButton = new TSpinButton()
    pixelWidthSpin: TSpinButton = new TSpinButton()
    pixelHeightSpin: TSpinButton = new TSpinButton()
    inchHeightSpin: TSpinButton = new TSpinButton()
    inchWidthSpin: TSpinButton = new TSpinButton()
    PrintDialog: TPrintDialog = new TPrintDialog()
    preserveAspectRatio: TCheckBox = new TCheckBox()
    inchHeightLabel: TLabel = new TLabel()
    pixelWidthLabel: TLabel = new TLabel()
    pixelHeightLabel: TLabel = new TLabel()
    borders: TButton = new TButton()
    currentStuffPanel: TPanel = new TPanel()
    selectedImageInfoLabel: TLabel = new TLabel()
    screenInfoLabel: TLabel = new TLabel()
    printerOrFileTypeInfoLabel: TLabel = new TLabel()
    sizeLabel: TLabel = new TLabel()
    printWidthLabel: TLabel = new TLabel()
    printWidthEdit: TEdit = new TEdit()
    printWidthSpin: TSpinButton = new TSpinButton()
    printHeightLabel: TLabel = new TLabel()
    printHeightEdit: TEdit = new TEdit()
    printHeightSpin: TSpinButton = new TSpinButton()
    marginsLabel: TLabel = new TLabel()
    printLeftMarginLabel: TLabel = new TLabel()
    printTopMarginLabel: TLabel = new TLabel()
    printLeftMarginEdit: TEdit = new TEdit()
    printTopMarginEdit: TEdit = new TEdit()
    printLeftMarginSpin: TSpinButton = new TSpinButton()
    printTopMarginSpin: TSpinButton = new TSpinButton()
    printRightMarginLabel: TLabel = new TLabel()
    printBottomMarginLabel: TLabel = new TLabel()
    printRightMarginEdit: TEdit = new TEdit()
    printBottomMarginEdit: TEdit = new TEdit()
    printRightMarginSpin: TSpinButton = new TSpinButton()
    printBottomMarginSpin: TSpinButton = new TSpinButton()
    printCenter: TButton = new TButton()
    printUseWholePage: TButton = new TButton()
    suggestPrintSize: TButton = new TButton()
    printImagePanel: TPanel = new TPanel()
    wholePageImage: TImage = new TImage()
    inchWidthLabel: TLabel = new TLabel()
    helpButton: TSpeedButton = new TSpeedButton()
    memoryUseInfoLabel: TLabel = new TLabel()
    jpgCompressionLabel: TLabel = new TLabel()
    jpgCompressionEdit: TEdit = new TEdit()
    jpgCompressionSpin: TSpinButton = new TSpinButton()
    options: BitmapOptionsStructure = new BitmapOptionsStructure()
    transferDirection: short = 0
    optionsChanged: boolean = false
    copySavePrintType: short = 0
    startingUp: boolean = false
    sideEffect: boolean = false
    selectionRectFromMainWindow: TRect = new TRect()
    printPageWidth_in: float = 0.0
    printPageHeight_in: float = 0.0
    wholePageWidth_in: float = 0.0
    wholePageHeight_in: float = 0.0
    printMinMarginLeft_in: float = 0.0
    printMinMarginTop_in: float = 0.0
    printMinMarginRight_in: float = 0.0
    printMinMarginBottom_in: float = 0.0
    pictureWidth_px: float = 0.0
    pictureHeight_px: float = 0.0
    pictureResolution_pxPin: float = 0.0
    smallestPrintResolution_pxPin: float = 0.0
    pictureWidth_in: float = 0.0
    pictureHeight_in: float = 0.0
    printWidth_in: float = 0.0
    printHeight_in: float = 0.0
    printLeftMargin_in: float = 0.0
    printTopMargin_in: float = 0.0
    printRightMargin_in: float = 0.0
    printBottomMargin_in: float = 0.0
    jpegCompression: float = 0.0
    aspectRatio: float = 0.0
    megabytesOfMemoryNeeded: float = 0.0
    TBitmapOptionsForm.prototype = new PdForm()
    TBitmapOptionsForm.prototype.constructor = TBitmapOptionsForm
    
    // ----------------------------------------------------------------------------------------- initialize 
    initializeWithTypeAndOptions(aType: short, anOptions: BitmapOptionsStructure): void {
        let displayString: string
        
        this.startingUp = true
        this.options = anOptions
        this.copySavePrintType = aType
        displayString = this.nameForCopySavePrintType(this.copySavePrintType)
        if (this.copySavePrintType === kPrintingDrawing) {
            // must be done before transfer
            this.updateForPrinterInfo()
        }
        this.transferDirection = kTransferLoad
        this.transferFields()
        this.updateForImageSelection()
        this.maintainAspectRatioPixelsAndInches(this.pixelWidthEdit)
        this.updateBorderThickness()
        this.printSetup.Visible = this.copySavePrintType === kPrintingDrawing
        this.borders.Visible = this.copySavePrintType === kPrintingDrawing
        this.printerOrFileTypeInfoLabel.Visible = this.copySavePrintType !== kCopyingDrawing
        if (this.copySavePrintType === kSavingDrawingToJpeg) {
            this.jpgCompressionLabel.Visible = true
            this.colorsLabel.Visible = false
            this.jpgCompressionLabel.SetBounds(this.colorsLabel.Left, this.colorsLabel.Top, this.jpgCompressionLabel.Width, this.jpgCompressionLabel.Height)
            this.jpgCompressionEdit.Visible = true
            this.colorType.Visible = false
            this.jpgCompressionEdit.SetBounds(this.colorType.Left, this.colorType.Top, this.jpgCompressionEdit.Width, this.jpgCompressionEdit.Height)
            this.jpgCompressionSpin.Visible = true
            this.jpgCompressionSpin.SetBounds(this.jpgCompressionEdit.Left + this.jpgCompressionEdit.Width + 4, this.jpgCompressionEdit.Top, this.jpgCompressionSpin.Width, this.jpgCompressionSpin.Height)
        }
        if ((this.copySavePrintType === kSavingDrawingToBmp) || (this.copySavePrintType === kSavingDrawingToJpeg)) {
            if ((this.copySavePrintType === kSavingDrawingToBmp)) {
                this.printerOrFileTypeInfoLabel.Caption = "Saving to: BMP"
            } else if ((this.copySavePrintType === kSavingDrawingToJpeg)) {
                this.printerOrFileTypeInfoLabel.Caption = "Saving to: JPEG"
            }
        }
        if (this.copySavePrintType === kPrintingDrawing) {
            this.ClientHeight = this.printBox.Top + this.printBox.Height
            this.suggestPrintSizeClick(this)
        } else {
            this.ClientHeight = this.outputBox.Top + this.outputBox.Height
        }
        switch (this.copySavePrintType) {
            case kCopyingDrawing:
                this.Close.Caption = "&Copy"
                break
            case kPrintingDrawing:
                this.Close.Caption = "&Print"
                break
            case kSavingDrawingToBmp:
                this.Close.Caption = "&Save"
                break
            case kSavingDrawingToJpeg:
                this.Close.Caption = "&Save"
                break
        }
        this.helpButton.Hint = "Get help with setting " + lowercase(displayString) + " picture options."
        this.cancel.Hint = "Close this window and don't " + lowercase(displayString) + " a picture."
        this.Close.Hint = displayString + " the selected picture using the options specified in this window."
        this.startingUp = false
    }
    
    updateForPrinterInfo(): void {
        let xResolution_pixelsPerInch: int
        let yResolution_pixelsPerInch: int
        let portraitOrLandscape: string
        let printerDC: HDC
        let printerColorBits: int
        let printerColors: int
        
        xResolution_pixelsPerInch = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSX)
        yResolution_pixelsPerInch = UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSY)
        this.smallestPrintResolution_pxPin = umath.intMin(xResolution_pixelsPerInch, yResolution_pixelsPerInch)
        this.printPageWidth_in = umath.safedivExcept(UNRESOLVED.Printer.pageWidth - 1, xResolution_pixelsPerInch, 0)
        this.printPageHeight_in = umath.safedivExcept(UNRESOLVED.Printer.pageHeight - 1, yResolution_pixelsPerInch, 0)
        this.wholePageWidth_in = umath.safedivExcept(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PHYSICALWIDTH), xResolution_pixelsPerInch, 0)
        this.wholePageHeight_in = umath.safedivExcept(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PHYSICALHEIGHT), xResolution_pixelsPerInch, 0)
        this.printMinMarginLeft_in = umath.safedivExcept(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetX), xResolution_pixelsPerInch, 0)
        this.printMinMarginTop_in = umath.safedivExcept(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, UNRESOLVED.PhysicalOffsetY), xResolution_pixelsPerInch, 0)
        this.printMinMarginRight_in = this.wholePageWidth_in - this.printPageWidth_in - this.printMinMarginLeft_in
        this.printMinMarginBottom_in = this.wholePageHeight_in - this.printPageHeight_in - this.printMinMarginTop_in
        if (UNRESOLVED.Printer.orientation === UNRESOLVED.poPortrait) {
            portraitOrLandscape = "Portrait"
        } else {
            portraitOrLandscape = "Landscape"
        }
        printerDC = UNRESOLVED.CreateCompatibleDC(UNRESOLVED.Printer.Handle)
        try {
            printerColorBits = (UNRESOLVED.GetDeviceCaps(printerDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(printerDC, delphi_compatability.PLANES))
        } finally {
            UNRESOLVED.ReleaseDC(0, printerDC)
            UNRESOLVED.DeleteDC(printerDC)
        }
        if (printerColorBits !== 32) {
            printerColors = 1 << printerColorBits
        } else {
            printerColors = intround(umath.power(2.0, printerColorBits))
        }
        this.printerOrFileTypeInfoLabel.Caption = "Printer:  " + IntToStr(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSX)) + " x " + IntToStr(UNRESOLVED.GetDeviceCaps(UNRESOLVED.Printer.Handle, delphi_compatability.LOGPIXELSY)) + " pixels/inch, " + IntToStr(printerColors) + " colors (" + IntToStr(printerColorBits) + " bits)"
        //+ portraitOrLandscape;
        //printerInfoLabel.hint := 'Printer name: ' + Printer.Printers[Printer.printerIndex];
        this.updatePrintPreview()
    }
    
    updateForImageSelection(): void {
        let pixelWidth: int
        let pixelHeight: int
        let screenColorBits: int
        let screenColors: long
        let inchWidth: float
        let inchHeight: float
        let screenDC: HDC
        let megabytesNeeded: float
        
        this.updateSelectionRectFromMainWindow()
        // fill in labels
        pixelWidth = usupport.rWidth(this.selectionRectFromMainWindow)
        pixelHeight = usupport.rHeight(this.selectionRectFromMainWindow)
        inchWidth = umath.safedivExcept(pixelWidth, delphi_compatability.Screen.PixelsPerInch, 0)
        inchHeight = umath.safedivExcept(pixelHeight, delphi_compatability.Screen.PixelsPerInch, 0)
        this.selectedImageInfoLabel.Caption = "Selection:  " + IntToStr(pixelWidth) + " x " + IntToStr(pixelHeight) + " pixels,  " + floatStr(inchWidth) + " x " + floatStr(inchHeight) + " inches"
        screenDC = UNRESOLVED.GetDC(0)
        try {
            screenColorBits = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
        } finally {
            UNRESOLVED.ReleaseDC(0, screenDC)
        }
        if (screenColorBits !== 32) {
            screenColors = 1 << screenColorBits
            this.screenInfoLabel.Caption = "Screen:  " + IntToStr(delphi_compatability.Screen.PixelsPerInch) + " pixels/inch,  " + IntToStr(screenColors) + " colors (" + IntToStr(screenColorBits) + " bits)"
        } else {
            this.screenInfoLabel.Caption = "Screen:  " + IntToStr(delphi_compatability.Screen.PixelsPerInch) + " pixels/inch,  " + "true color (" + IntToStr(screenColorBits) + " bits)"
        }
        // used to be only in suggest size button, now doing automatically
        this.setValue(this.inchWidthEdit, inchWidth)
        this.setValue(this.inchHeightEdit, inchHeight)
        this.calculatePixelsFromResolutionAndInches()
        if (this.copySavePrintType === kPrintingDrawing) {
            this.suggestPrintSizeClick(this)
            this.updatePrintPreview()
        }
        this.reportOnMemoryNeeded()
    }
    
    reportOnMemoryNeeded(): void {
        if (this.copySavePrintType === kSavingDrawingToJpeg) {
            // report memory needed -- do after calculating resolution-affected size
            // make no size estimation for JPG
            this.memoryUseInfoLabel.Visible = false
            return
        }
        this.calculatePixelsFromResolutionAndInches()
        this.calculateMegabytesOfMemoryNeededConsideringColorBitsAndResolution()
        if (this.megabytesOfMemoryNeeded < 1.0) {
            this.memoryUseInfoLabel.Caption = "Estimated memory needed: " + usupport.digitValueString(this.megabytesOfMemoryNeeded * 1024) + " K"
        } else {
            this.memoryUseInfoLabel.Caption = "Estimated memory needed: " + usupport.digitValueString(this.megabytesOfMemoryNeeded) + " MB"
        }
        if (this.megabytesOfMemoryNeeded > kTooManyMegabytesOfMemory) {
            this.memoryUseInfoLabel.Font.Style = {UNRESOLVED.fsBold, }
        } else {
            this.memoryUseInfoLabel.Font.Style = {}
        }
    }
    
    calculateMegabytesOfMemoryNeededConsideringColorBitsAndResolution(): void {
        let colorBits: short
        let screenDC: HDC
        let outputPixelWidth: float
        let outputPixelHeight: float
        
        outputPixelWidth = this.pictureWidth_in * this.pictureResolution_pxPin
        outputPixelHeight = this.pictureHeight_in * this.pictureResolution_pxPin
        colorBits = 0
        switch (this.colorType.ItemIndex) {
            case delphi_compatability.TPixelFormat.pfDevice:
                screenDC = UNRESOLVED.GetDC(0)
                try {
                    colorBits = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
                } finally {
                    UNRESOLVED.ReleaseDC(0, screenDC)
                }
                break
            case delphi_compatability.TPixelFormat.pf1bit:
                colorBits = 1
                break
            case delphi_compatability.TPixelFormat.pf4bit:
                colorBits = 4
                break
            case delphi_compatability.TPixelFormat.pf8bit:
                colorBits = 8
                break
            case delphi_compatability.TPixelFormat.pf15bit:
                colorBits = 15
                break
            case delphi_compatability.TPixelFormat.pf16bit:
                colorBits = 16
                break
            case delphi_compatability.TPixelFormat.pf24bit:
                colorBits = 24
                break
            case delphi_compatability.TPixelFormat.pf32bit:
                colorBits = 32
                break
        }
        this.megabytesOfMemoryNeeded = (1.0 * outputPixelWidth * outputPixelHeight * (colorBits / 8) + FIX_sizeof(delphi_compatability.TBitmapInfo)) / (1024 * 1024)
    }
    
    updateSelectionRectFromMainWindow(): void {
        let excludeInvisiblePlants: boolean
        let excludeNonSelectedPlants: boolean
        
        excludeInvisiblePlants = !this.useAllPlants.Checked
        excludeNonSelectedPlants = this.useSelectedPlants.Checked
        if (this.useDrawingAreaContents.Checked) {
            this.selectionRectFromMainWindow = Rect(0, 0, umain.MainForm.drawingPaintBox.Width, umain.MainForm.drawingPaintBox.Height)
        } else {
            this.selectionRectFromMainWindow = udomain.domain.plantManager.combinedPlantBoundsRects(umain.MainForm.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
        }
        this.aspectRatio = umath.safedivExcept(usupport.rWidth(this.selectionRectFromMainWindow), usupport.rHeight(this.selectionRectFromMainWindow), 1.0)
    }
    
    updatePrintPreview(): void {
        let scaleX_pxPin: float
        let scaleY_pxPin: float
        let scale_pxPin: float
        let borderThickness_in: float
        let availableWidth_px: short
        let availableHeight_px: short
        let marginRect: TRect
        
        availableWidth_px = this.sizeLabel.Left - this.wholePageImage.Left - 10
        availableHeight_px = this.printBox.Height - this.wholePageImage.Top - 10
        scaleX_pxPin = umath.safedivExcept(1.0 * availableWidth_px, this.wholePageWidth_in, 5)
        scaleY_pxPin = umath.safedivExcept(1.0 * availableHeight_px, this.wholePageHeight_in, 5)
        scale_pxPin = umath.min(scaleX_pxPin, scaleY_pxPin)
        this.wholePageImage.Width = intround(this.wholePageWidth_in * scale_pxPin)
        this.wholePageImage.Height = intround(this.wholePageHeight_in * scale_pxPin)
        if ((this.wholePageImage.Picture.Bitmap.Width !== this.wholePageImage.Width) || (this.wholePageImage.Picture.Bitmap.Height !== this.wholePageImage.Height)) {
            try {
                this.wholePageImage.Picture.Bitmap.Width = this.wholePageImage.Width
                this.wholePageImage.Picture.Bitmap.Height = this.wholePageImage.Height
            } catch (e) {
                this.wholePageImage.Picture.Bitmap.Width = 1
                this.wholePageImage.Picture.Bitmap.Height = 1
            }
        }
        marginRect.Left = intround(this.printMinMarginLeft_in * scale_pxPin)
        marginRect.Top = intround(this.printMinMarginTop_in * scale_pxPin)
        // subtract 1 from right and bottom because last pixel is not drawn
        marginRect.Right = this.wholePageImage.Width - intround(this.printMinMarginRight_in * scale_pxPin) - 1
        marginRect.Bottom = this.wholePageImage.Height - intround(this.printMinMarginBottom_in * scale_pxPin) - 1
        this.wholePageImage.Picture.Bitmap.Canvas.Brush.Color = delphi_compatability.clWindow
        this.wholePageImage.Picture.Bitmap.Canvas.FillRect(Rect(0, 0, this.wholePageImage.Width, this.wholePageImage.Height))
        this.wholePageImage.Picture.Bitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.wholePageImage.Picture.Bitmap.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
        this.wholePageImage.Picture.Bitmap.Canvas.MoveTo(0, marginRect.Top)
        this.wholePageImage.Picture.Bitmap.Canvas.LineTo(this.wholePageImage.Width, marginRect.Top)
        this.wholePageImage.Picture.Bitmap.Canvas.MoveTo(marginRect.Left, 0)
        this.wholePageImage.Picture.Bitmap.Canvas.LineTo(marginRect.Left, this.wholePageImage.Height)
        this.wholePageImage.Picture.Bitmap.Canvas.MoveTo(marginRect.Right, 0)
        this.wholePageImage.Picture.Bitmap.Canvas.LineTo(marginRect.Right, this.wholePageImage.Height)
        this.wholePageImage.Picture.Bitmap.Canvas.MoveTo(0, marginRect.Bottom)
        this.wholePageImage.Picture.Bitmap.Canvas.LineTo(this.wholePageImage.Width, marginRect.Bottom)
        this.wholePageImage.Picture.Bitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        this.wholePageImage.Picture.Bitmap.Canvas.Rectangle(0, 0, this.wholePageImage.Width, this.wholePageImage.Height)
        borderThickness_in = umath.safedivExcept(this.options.borderThickness, this.smallestPrintResolution_pxPin, 0)
        this.printImagePanel.SetBounds(intround(this.wholePageImage.Left + (this.printLeftMargin_in - borderThickness_in) * scale_pxPin), intround(this.wholePageImage.Top + (this.printTopMargin_in - borderThickness_in) * scale_pxPin), intround((this.printWidth_in + borderThickness_in * 2) * scale_pxPin), intround((this.printHeight_in + borderThickness_in * 2) * scale_pxPin))
    }
    
    updateBorderThickness(): void {
        this.options.borderThickness = 0
        this.options.borderGap = 0
        if (this.options.printBorderInner) {
            // cfk the 2.5 is arbitrary
            this.options.borderGap = intround(this.options.printBorderWidthInner * 2.5)
            this.options.borderThickness += this.options.printBorderWidthInner + this.options.borderGap
        }
        if (this.options.printBorderOuter) {
            this.options.borderThickness += this.options.printBorderWidthOuter
        }
    }
    
    // ----------------------------------------------------------------------------------------- transfer 
    transferFields(): void {
        if (this.transferDirection === kTransferLoad) {
            switch (this.options.exportType) {
                case udomain.kIncludeSelectedPlants:
                    // plantBox
                    this.useSelectedPlants.Checked = true
                    break
                case udomain.kIncludeVisiblePlants:
                    this.useVisiblePlants.Checked = true
                    break
                case udomain.kIncludeAllPlants:
                    this.useAllPlants.Checked = true
                    break
                case udomain.kIncludeDrawingAreaContents:
                    this.useDrawingAreaContents.Checked = true
                    break
            }
        } else if (this.transferDirection === kTransferSave) {
            this.options.exportType = this.currentExportOption()
        }
        if (this.copySavePrintType !== kSavingDrawingToJpeg) {
            // output
            this.transferTPixelFormatComboBox(this.colorType, this.options.colorType)
        }
        this.options.resolution_pixelsPerInch = this.transferSmallintEditBox(this.resolutionEdit, this.options.resolution_pixelsPerInch)
        this.options.width_pixels = this.transferSmallintEditBox(this.pixelWidthEdit, this.options.width_pixels)
        this.options.height_pixels = this.transferSmallintEditBox(this.pixelHeightEdit, this.options.height_pixels)
        this.options.width_in = this.transferSingleEditBox(this.inchWidthEdit, this.options.width_in)
        this.options.height_in = this.transferSingleEditBox(this.inchHeightEdit, this.options.height_in)
        this.options.preserveAspectRatio = this.transferCheckBox(this.preserveAspectRatio, this.options.preserveAspectRatio)
        if (this.copySavePrintType === kSavingDrawingToJpeg) {
            this.options.jpegCompressionRatio = this.transferSmallintEditBox(this.jpgCompressionEdit, this.options.jpegCompressionRatio)
        }
        if (this.copySavePrintType !== kPrintingDrawing) {
            // printing
            return
        }
        this.options.printPreserveAspectRatio = this.transferCheckBox(this.printPreserveAspectRatio, this.options.printPreserveAspectRatio)
        this.options.printWidth_in = this.transferSingleEditBox(this.printWidthEdit, this.options.printWidth_in)
        this.options.printHeight_in = this.transferSingleEditBox(this.printHeightEdit, this.options.printHeight_in)
        this.options.printLeftMargin_in = this.transferSingleEditBox(this.printLeftMarginEdit, this.options.printLeftMargin_in)
        this.options.printTopMargin_in = this.transferSingleEditBox(this.printTopMarginEdit, this.options.printTopMargin_in)
        this.options.printRightMargin_in = this.transferSingleEditBox(this.printRightMarginEdit, this.options.printRightMargin_in)
        this.options.printBottomMargin_in = this.transferSingleEditBox(this.printBottomMarginEdit, this.options.printBottomMargin_in)
    }
    
    // ----------------------------------------------------------------------------------------- interactions-first panel 
    selectionChoiceClick(sender: TObject): void {
        if (this.startingUp || this.sideEffect) {
            return
        }
        this.updateForImageSelection()
    }
    
    preserveAspectRatioClick(Sender: TObject): void {
        if (this.startingUp || this.sideEffect) {
            return
        }
        if (this.preserveAspectRatio.Checked) {
            // arbitrarily picked pixelWidthEdit here
            this.maintainAspectRatioPixelsAndInches(this.pixelWidthEdit)
        }
    }
    
    colorTypeChange(Sender: TObject): void {
        if (this.startingUp || this.sideEffect) {
            return
        }
        this.updateForImageSelection()
    }
    
    // ----------------------------------------------------------------------------------------- interactions-second panel 
    exitEditBox(sender: TObject): void {
        this.adjustValue(sender, kSpinNone)
    }
    
    spinUp(sender: TObject): void {
        this.adjustValue(sender, kSpinUp)
    }
    
    spinDown(sender: TObject): void {
        this.adjustValue(sender, kSpinDown)
    }
    
    adjustValue(sender: TObject, spin: short): void {
        let editBox: TEdit
        
        if (this.startingUp || this.sideEffect) {
            return
        }
        editBox = null
        if ((sender instanceof delphi_compatability.TSpinButton)) {
            // if spin button clicked, adjust corresponding edit (focusControl)
            this.adjustEditBoxValueForSpin(sender, spin)
        }
        if ((sender instanceof delphi_compatability.TEdit)) {
            // get edit box
            editBox = sender
        } else if ((sender instanceof delphi_compatability.TSpinButton)) {
            editBox = ((delphi_compatability.TSpinButton)sender).focusControl
        }
        if (editBox === null) {
            return
        }
        // use set method to check edit box entry against bounds
        this.setValue(editBox, this.getEnteredValue(editBox))
        if (this.preserveAspectRatio.Checked) {
            if ((editBox === this.inchWidthEdit) || (editBox === this.inchHeightEdit) || (editBox === this.pixelWidthEdit) || (editBox === this.pixelHeightEdit)) {
                // if image width/height changed, maintain aspect ratio
                this.maintainAspectRatioPixelsAndInches(editBox)
            }
        }
        if (this.printPreserveAspectRatio.Checked) {
            if ((editBox === this.printWidthEdit) || (editBox === this.printHeightEdit)) {
                if (editBox === this.printWidthEdit) {
                    // if print width/height changed, maintain printing aspect ratio
                    this.resizePrintBasedOnAspectRatio(kWidthWasChanged)
                } else {
                    this.resizePrintBasedOnAspectRatio(kHeightWasChanged)
                }
            }
        }
        if ((editBox === this.inchWidthEdit) || (editBox === this.inchHeightEdit) || (editBox === this.resolutionEdit)) {
            // interaction between image inches, pixels, resolution
            this.reportOnMemoryNeeded()
        } else if ((editBox === this.pixelWidthEdit) || (editBox === this.pixelHeightEdit)) {
            // interaction between print size and margins
            this.reportOnMemoryNeeded()
        } else if ((editBox === this.printWidthEdit) || (editBox === this.printHeightEdit)) {
            this.changePrintMarginsToFitPrintSize()
        } else if ((editBox === this.printLeftMarginEdit) || (editBox === this.printTopMarginEdit) || (editBox === this.printRightMarginEdit) || (editBox === this.printBottomMarginEdit)) {
            this.changePrintSizeToFitPrintMargins(editBox)
        }
    }
    
    adjustEditBoxValueForSpin(sender: TObject, spin: short): void {
        let editBox: TEdit
        let newValue: float
        
        if ((sender === null) || (!(sender instanceof delphi_compatability.TSpinButton))) {
            return
        }
        editBox = null
        editBox = ((delphi_compatability.TSpinButton)sender).focusControl
        if (editBox === null) {
            return
        }
        // edit tag is 1 if float
        // spin tag is spin increment * 100 (10 for floats (0.1), 1000 for ints (10))
        newValue = 0
        if ((sender).focusControl.tag === kEditIsFloat) {
            newValue = this.getValue(editBox) + 1.0 * (sender).tag / 100 * spin
        } else {
            newValue = this.getValue(editBox) + (sender).tag / 100 * spin
        }
        this.setValue(editBox, newValue)
    }
    
    maintainAspectRatioPixelsAndInches(editBox: TEdit): void {
        if ((editBox === this.inchWidthEdit)) {
            this.setValue(this.inchHeightEdit, this.heightForWidthAndAspectRatio(this.pictureWidth_in, this.aspectRatio))
        } else if ((editBox === this.inchHeightEdit)) {
            this.setValue(this.inchWidthEdit, this.widthForHeightAndAspectRatio(this.pictureHeight_in, this.aspectRatio))
        } else if ((editBox === this.pixelWidthEdit)) {
            this.setValue(this.pixelHeightEdit, this.heightForWidthAndAspectRatio(this.pictureWidth_px, this.aspectRatio))
        } else if ((editBox === this.pixelHeightEdit)) {
            this.setValue(this.pixelWidthEdit, this.widthForHeightAndAspectRatio(this.pictureHeight_px, this.aspectRatio))
        }
    }
    
    heightForWidthAndAspectRatio(width: float, ratio: float): float {
        let result = 0.0
        result = umath.safedivExcept(width, ratio, 0)
        return result
    }
    
    widthForHeightAndAspectRatio(height: float, ratio: float): float {
        let result = 0.0
        result = height * ratio
        return result
    }
    
    calculatePixelsFromResolutionAndInches(): void {
        this.setValue(this.pixelWidthEdit, this.pictureWidth_in * this.pictureResolution_pxPin)
        this.setValue(this.pixelHeightEdit, this.pictureHeight_in * this.pictureResolution_pxPin)
    }
    
    calculateInchesFromResolutionAndPixels(): void {
        this.setValue(this.inchWidthEdit, umath.safedivExcept(1.0 * this.pictureWidth_px, 1.0 * this.pictureResolution_pxPin, 0))
        this.setValue(this.inchHeightEdit, umath.safedivExcept(1.0 * this.pictureHeight_px, 1.0 * this.pictureResolution_pxPin, 0))
    }
    
    calculateResolutionFromInchesAndPixels(): void {
        let xRes: float
        let yRes: float
        
        xRes = umath.safedivExcept(this.pictureWidth_px, this.pictureWidth_in, delphi_compatability.Screen.PixelsPerInch)
        yRes = umath.safedivExcept(this.pictureHeight_px, this.pictureHeight_in, delphi_compatability.Screen.PixelsPerInch)
        this.setValue(this.resolutionEdit, intround(umath.min(xRes, yRes)))
        this.calculatePixelsFromResolutionAndInches()
    }
    
    suggestCopySizeClick(Sender: TObject): void {
        this.updateSelectionRectFromMainWindow()
        this.setValue(this.pixelWidthEdit, usupport.rWidth(this.selectionRectFromMainWindow))
        this.setValue(this.pixelHeightEdit, usupport.rHeight(this.selectionRectFromMainWindow))
        this.calculateInchesFromResolutionAndPixels()
    }
    
    // -------------------------------------------------------------------- calculations of print size/margins 
    changePrintMarginsToFitPrintSize(): void {
        this.setValue(this.printRightMarginEdit, umath.max(0, this.wholePageWidth_in - this.printLeftMargin_in - this.printWidth_in))
        this.setValue(this.printBottomMarginEdit, umath.max(0, this.wholePageHeight_in - this.printTopMargin_in - this.printHeight_in))
        if (this.printPreserveAspectRatio.Checked) {
            this.resizePrintBasedOnAspectRatio(kHeightAndWidthWereChanged)
        } else {
            this.updatePrintPreview()
        }
    }
    
    changePrintSizeToFitPrintMargins(editBox: TEdit): void {
        if (editBox === this.printLeftMarginEdit) {
            // keep print size same to start, just offset other margin
            this.setValue(this.printRightMarginEdit, umath.max(0, this.wholePageWidth_in - this.printLeftMargin_in - this.printWidth_in))
        } else if (editBox === this.printRightMarginEdit) {
            this.setValue(this.printLeftMarginEdit, umath.max(0, this.wholePageWidth_in - this.printRightMargin_in - this.printWidth_in))
        } else if (editBox === this.printTopMarginEdit) {
            this.setValue(this.printBottomMarginEdit, umath.max(0, this.wholePageHeight_in - this.printTopMargin_in - this.printHeight_in))
        } else if (editBox === this.printBottomMarginEdit) {
            this.setValue(this.printTopMarginEdit, umath.max(0, this.wholePageHeight_in - this.printBottomMargin_in - this.printHeight_in))
        }
        // now set print size
        this.setValue(this.printWidthEdit, umath.max(0, this.wholePageWidth_in - this.printRightMargin_in - this.printLeftMargin_in))
        this.setValue(this.printHeightEdit, umath.max(0, this.wholePageHeight_in - this.printBottomMargin_in - this.printTopMargin_in))
        if (this.printPreserveAspectRatio.Checked) {
            // now check aspect ratio
            this.resizePrintBasedOnAspectRatio(kHeightAndWidthWereChanged)
        } else {
            this.updatePrintPreview()
        }
    }
    
    resizePrintBasedOnAspectRatio(whatWasChanged: short): void {
        let newWidth_in: float
        let newHeight_in: float
        let newRight_in: float
        let newBottom_in: float
        let maxWidth_in: float
        let maxHeight_in: float
        
        newWidth_in = this.printWidth_in
        newHeight_in = this.printHeight_in
        this.updateSelectionRectFromMainWindow()
        switch (whatWasChanged) {
            case kHeightWasChanged:
                newWidth_in = newHeight_in * this.aspectRatio
                break
            case kWidthWasChanged:
                newHeight_in = umath.safedivExcept(newWidth_in, this.aspectRatio, newHeight_in)
                break
            case kHeightAndWidthWereChanged:
                if (newWidth_in > newHeight_in) {
                    newWidth_in = newHeight_in * this.aspectRatio
                } else {
                    newHeight_in = umath.safedivExcept(newWidth_in, this.aspectRatio, newHeight_in)
                }
                break
        }
        // bound size at page, using left/top margins already set
        maxWidth_in = this.wholePageWidth_in - this.printLeftMargin_in - this.printMinMarginRight_in
        maxHeight_in = this.wholePageHeight_in - this.printTopMargin_in - this.printMinMarginBottom_in
        if (newWidth_in > maxWidth_in) {
            newWidth_in = maxWidth_in
            newHeight_in = umath.safedivExcept(newWidth_in, this.aspectRatio, newHeight_in)
        }
        if (newHeight_in > maxHeight_in) {
            newHeight_in = maxHeight_in
            newWidth_in = newHeight_in * this.aspectRatio
        }
        newRight_in = umath.max(this.printMinMarginRight_in, this.wholePageWidth_in - this.printLeftMargin_in - newWidth_in)
        newBottom_in = umath.max(this.printMinMarginBottom_in, this.wholePageHeight_in - this.printTopMargin_in - newHeight_in)
        // set values in edits
        this.setValue(this.printWidthEdit, newWidth_in)
        this.setValue(this.printHeightEdit, newHeight_in)
        this.setValue(this.printRightMarginEdit, newRight_in)
        this.setValue(this.printBottomMarginEdit, newBottom_in)
        this.updatePrintPreview()
    }
    
    // -------------------------------------------------------------------- interactions - printing panel 
    printCenterClick(Sender: TObject): void {
        this.setValue(this.printLeftMarginEdit, umath.max(this.printMinMarginLeft_in, this.wholePageWidth_in / 2.0 - this.printWidth_in / 2.0))
        this.setValue(this.printRightMarginEdit, umath.max(this.printMinMarginRight_in, this.wholePageWidth_in / 2.0 - this.printWidth_in / 2.0))
        this.setValue(this.printTopMarginEdit, umath.max(this.printMinMarginTop_in, this.wholePageHeight_in / 2.0 - this.printHeight_in / 2.0))
        this.setValue(this.printBottomMarginEdit, umath.max(this.printMinMarginBottom_in, this.wholePageHeight_in / 2.0 - this.printHeight_in / 2.0))
        if (this.printPreserveAspectRatio.Checked) {
            this.resizePrintBasedOnAspectRatio(kHeightAndWidthWereChanged)
        } else {
            this.updatePrintPreview()
        }
    }
    
    suggestPrintSizeClick(Sender: TObject): void {
        let bestMargin_in: float
        let bestWidth_in: float
        let bestHeight_in: float
        let newWidth_in: float
        let newHeight_in: float
        let maxMinMargin_in: float
        
        // calculate best margin: for 10 inches, 1.0 inches, for 5 inches, 0.5 inches;
        // keep to multiples of 0.25 inches
        maxMinMargin_in = umath.max(this.printMinMarginLeft_in, umath.max(this.printMinMarginTop_in, umath.max(this.printMinMarginRight_in, this.printMinMarginBottom_in)))
        bestMargin_in = umath.max(maxMinMargin_in, intround(4.0 * umath.min(this.wholePageWidth_in, this.wholePageHeight_in) / 10.0) / 4.0)
        bestWidth_in = this.wholePageWidth_in - bestMargin_in * 2
        bestHeight_in = this.wholePageHeight_in - bestMargin_in * 2
        // preserve aspect ratio - reduce the larger dimension so it still fits on the page
        this.updateSelectionRectFromMainWindow()
        newHeight_in = bestHeight_in
        newWidth_in = bestHeight_in * this.aspectRatio
        if (newWidth_in > bestWidth_in) {
            newWidth_in = bestWidth_in
            newHeight_in = umath.safedivExcept(bestWidth_in, this.aspectRatio, bestHeight_in)
        }
        // set original picture size to fit on page using printer resolution
        this.setValue(this.inchWidthEdit, newWidth_in)
        this.setValue(this.inchHeightEdit, newHeight_in)
        this.setValue(this.resolutionEdit, this.smallestPrintResolution_pxPin)
        this.calculatePixelsFromResolutionAndInches()
        // set print size same as picture size
        this.setValue(this.printWidthEdit, newWidth_in)
        this.setValue(this.printHeightEdit, newHeight_in)
        // center picture
        this.printCenterClick(this)
    }
    
    printUseWholePageClick(Sender: TObject): void {
        let borderThickness_in: float
        
        borderThickness_in = umath.safedivExcept(this.options.borderThickness, this.smallestPrintResolution_pxPin, 0)
        this.setValue(this.printLeftMarginEdit, this.printMinMarginLeft_in + borderThickness_in)
        this.setValue(this.printRightMarginEdit, this.printMinMarginRight_in + borderThickness_in)
        this.setValue(this.printTopMarginEdit, this.printMinMarginTop_in + borderThickness_in)
        this.setValue(this.printBottomMarginEdit, this.printMinMarginBottom_in + borderThickness_in)
        this.setValue(this.printWidthEdit, this.wholePageWidth_in - this.printLeftMargin_in - this.printRightMargin_in)
        this.setValue(this.printHeightEdit, this.wholePageHeight_in - this.printTopMargin_in - this.printBottomMargin_in)
        if (this.printPreserveAspectRatio.Checked) {
            // check new size for aspect ratio (if 'preserve aspect ratio' checked)
            this.resizePrintBasedOnAspectRatio(kHeightAndWidthWereChanged)
        } else {
            this.updatePrintPreview()
        }
    }
    
    printPreserveAspectRatioClick(Sender: TObject): void {
        if (this.startingUp || this.sideEffect) {
            return
        }
        if (this.printPreserveAspectRatio.Checked) {
            this.resizePrintBasedOnAspectRatio(kHeightAndWidthWereChanged)
        }
    }
    
    // ----------------------------------------------------------------------------------------- buttons 
    bordersClick(Sender: TObject): void {
        let bordersForm: TPrintBordersForm
        
        bordersForm = uborders.TPrintBordersForm().create(this)
        if (bordersForm === null) {
            throw new GeneralException.create("Problem: Could not create print borders window.")
        }
        try {
            bordersForm.initializeWithOptions(this.options)
            if (bordersForm.ShowModal() === mrOK) {
                // just copy whole options, because you can't change this form while borders form is up
                this.options = bordersForm.options
                this.updateBorderThickness()
                this.updatePrintPreview()
            }
        } finally {
            bordersForm.free
        }
    }
    
    printSetupClick(Sender: TObject): void {
        this.PrintDialog.execute
        this.updateForPrinterInfo()
        this.suggestPrintSizeClick(this)
    }
    
    CloseClick(Sender: TObject): void {
        let insertString: string
        
        if ((this.colorType.ItemIndex === 0) && ((this.copySavePrintType === kSavingDrawingToBmp) || (this.copySavePrintType === kSavingDrawingToJpeg))) {
            // don't let them save the file as a device-dependent bitmap.
            MessageDialog("You cannot save a picture with the \"From screen\" color depth." + chr(13) + "Please change the color depth to another choice in the list.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        if ((this.useSelectedPlants.Checked) && (umain.MainForm.selectedPlants.Count <= 0)) {
            // don't let them finish with no plants
            MessageDialog("You chose \"selected\" for \"Draw which plants\", but no plants are selected." + chr(13) + "You should make another choice, or click Cancel and select some plants.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
            return
        }
        if (this.copySavePrintType !== kSavingDrawingToJpeg) {
            if (this.megabytesOfMemoryNeeded > kTooManyMegabytesOfMemory) {
                switch (this.copySavePrintType) {
                    case kCopyingDrawing:
                        // warn about a really big operation
                        insertString = "copy to the clipboard"
                        break
                    case kPrintingDrawing:
                        insertString = "print"
                        break
                    case kSavingDrawingToBmp:
                        insertString = "save"
                        break
                }
                if (MessageDialog("You are about to " + insertString + " a " + usupport.digitValueString(this.megabytesOfMemoryNeeded) + " MB bitmap." + chr(13) + "This could place stress on your system." + chr(13) + "We recommend closing any non-essential programs." + chr(13) + "Also, choosing fewer colors or a smaller picture will use less memory." + chr(13) + chr(13) + "To proceed, click OK. To go back and make changes, click Cancel.", mtWarning, {mbOK, mbCancel, }, 0) === delphi_compatability.IDCANCEL) {
                    return
                }
            }
        }
        this.transferDirection = kTransferSave
        this.transferFields()
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    // ----------------------------------------------------------- methods to get/set edit values 
    setValue(editBox: TEdit, newValue: float): void {
        let maxWidth_in: float
        let maxHeight_in: float
        
        this.sideEffect = true
        maxWidth_in = this.wholePageWidth_in - this.printMinMarginLeft_in - this.printMinMarginRight_in
        maxHeight_in = this.wholePageHeight_in - this.printMinMarginTop_in - this.printMinMarginBottom_in
        if (editBox === this.pixelWidthEdit) {
            newValue = umath.max(udomain.kMinPixels, umath.min(udomain.kMaxPixels, newValue))
            this.pictureWidth_px = newValue
        } else if (editBox === this.pixelHeightEdit) {
            newValue = umath.max(udomain.kMinPixels, umath.min(udomain.kMaxPixels, newValue))
            this.pictureHeight_px = newValue
        } else if (editBox === this.inchWidthEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(udomain.kMaxInches, newValue))
            this.pictureWidth_in = newValue
        } else if (editBox === this.inchHeightEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(udomain.kMaxInches, newValue))
            this.pictureHeight_in = newValue
        } else if (editBox === this.resolutionEdit) {
            newValue = umath.max(udomain.kMinResolution, umath.min(udomain.kMaxResolution, newValue))
            this.pictureResolution_pxPin = newValue
        } else if (editBox === this.printWidthEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxWidth_in))
            this.printWidth_in = newValue
        } else if (editBox === this.printHeightEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxHeight_in))
            this.printHeight_in = newValue
        } else if (editBox === this.printLeftMarginEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxWidth_in))
            this.printLeftMargin_in = newValue
        } else if (editBox === this.printTopMarginEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxHeight_in))
            this.printTopMargin_in = newValue
        } else if (editBox === this.printRightMarginEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxWidth_in))
            this.printRightMargin_in = newValue
        } else if (editBox === this.printBottomMarginEdit) {
            newValue = umath.max(udomain.kMinInches, umath.min(newValue, maxHeight_in))
            this.printBottomMargin_in = newValue
        } else if (editBox === this.jpgCompressionEdit) {
            newValue = umath.max(1, umath.min(100, newValue))
            this.jpegCompression = newValue
        }
        if (editBox.Tag === kEditBoxHasInteger) {
            editBox.Text = IntToStr(intround(newValue))
        } else if (editBox.Tag === kEditBoxHasFloat) {
            editBox.Text = floatStr(newValue)
        }
        this.sideEffect = false
    }
    
    getValue(editBox: TEdit): float {
        let result = 0.0
        result = 0
        if (editBox === this.pixelWidthEdit) {
            result = this.pictureWidth_px
        } else if (editBox === this.pixelHeightEdit) {
            result = this.pictureHeight_px
        } else if (editBox === this.inchWidthEdit) {
            result = this.pictureWidth_in
        } else if (editBox === this.inchHeightEdit) {
            result = this.pictureHeight_in
        } else if (editBox === this.resolutionEdit) {
            result = this.pictureResolution_pxPin
        } else if (editBox === this.printWidthEdit) {
            result = this.printWidth_in
        } else if (editBox === this.printHeightEdit) {
            result = this.printHeight_in
        } else if (editBox === this.printLeftMarginEdit) {
            result = this.printLeftMargin_in
        } else if (editBox === this.printTopMarginEdit) {
            result = this.printTopMargin_in
        } else if (editBox === this.printRightMarginEdit) {
            result = this.printRightMargin_in
        } else if (editBox === this.printBottomMarginEdit) {
            result = this.printBottomMargin_in
        } else if (editBox === this.jpgCompressionEdit) {
            result = this.jpegCompression
        }
        return result
    }
    
    getEnteredValue(editBox: TEdit): float {
        let result = 0.0
        result = 0
        try {
            if (editBox.Tag === kEditBoxHasInteger) {
                result = StrToInt(editBox.Text)
            } else if (editBox.Tag === kEditBoxHasFloat) {
                result = StrToFloat(editBox.Text)
            }
        } catch (exception e) {
            ShowMessage("Invalid value: " + e.message)
            result = 0
        }
        return result
    }
    
    // ------------------------------------------------------------------------- transfer functions 
    currentExportOption(): short {
        let result = 0
        result = udomain.kIncludeSelectedPlants
        if (this.useSelectedPlants.Checked) {
            result = udomain.kIncludeSelectedPlants
        } else if (this.useVisiblePlants.Checked) {
            result = udomain.kIncludeVisiblePlants
        } else if (this.useAllPlants.Checked) {
            result = udomain.kIncludeAllPlants
        } else if (this.useDrawingAreaContents.Checked) {
            result = udomain.kIncludeDrawingAreaContents
        }
        return result
    }
    
    nameForCopySavePrintType(aType: short): string {
        let result = ""
        result = ""
        switch (aType) {
            case kCopyingDrawing:
                result = "Copy"
                break
            case kPrintingDrawing:
                result = "Print"
                break
            case kSavingDrawingToBmp:
                result = "Save"
                break
            case kSavingDrawingToJpeg:
                result = "Save"
                break
        }
        return result
    }
    
    transferCheckBox(checkBox: TCheckBox, value: boolean): void {
        if (this.transferDirection === kTransferLoad) {
            checkBox.Checked = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== checkBox.Checked) {
                this.optionsChanged = true
            }
            value = checkBox.Checked
        }
        return value
    }
    
    transferSmallintEditBox(editBox: TEdit, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            // sets up vars at start
            this.setValue(editBox, value)
        } else if (this.transferDirection === kTransferSave) {
            if (value !== StrToIntDef(editBox.Text, 0)) {
                this.optionsChanged = true
            }
            value = StrToIntDef(editBox.Text, 0)
        }
        return value
    }
    
    transferSingleEditBox(editBox: TEdit, value: float): void {
        let newValue: float
        
        if (this.transferDirection === kTransferLoad) {
            // sets up vars at start
            this.setValue(editBox, value)
        } else if (this.transferDirection === kTransferSave) {
            try {
                newValue = StrToFloat(editBox.Text)
            } catch (e) {
                newValue = value
            }
            if (newValue !== value) {
                this.optionsChanged = true
            }
            value = newValue
        }
        return value
    }
    
    transferComboBox(comboBox: TComboBox, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            comboBox.ItemIndex = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== comboBox.ItemIndex) {
                this.optionsChanged = true
            }
            value = comboBox.ItemIndex
        }
        return value
    }
    
    transferTPixelFormatComboBox(comboBox: TComboBox, value: TPixelFormat): void {
        raise "method transferTPixelFormatComboBox had assigned to var parameter value not added to return -- fixup manually"
        if (this.transferDirection === kTransferLoad) {
            if (value === delphi_compatability.TPixelFormat.pfCustom) {
                value = delphi_compatability.TPixelFormat.pfDevice
            }
            comboBox.ItemIndex = ord(value)
        } else if (this.transferDirection === kTransferSave) {
            if (value !== UNRESOLVED.TPixelFormat(comboBox.ItemIndex)) {
                this.optionsChanged = true
            }
            value = UNRESOLVED.TPixelFormat(comboBox.ItemIndex)
        }
    }
    
    colorTypeDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        let selected: boolean
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        selected = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        this.colorType.Canvas.Font = this.colorType.Font
        if (selected) {
            this.colorType.Canvas.Brush.Color = UNRESOLVED.clHighlight
            this.colorType.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            this.colorType.Canvas.Brush.Color = this.colorType.Color
            this.colorType.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        if ((index === 0) && ((this.copySavePrintType === kSavingDrawingToBmp) || (this.copySavePrintType === kSavingDrawingToJpeg))) {
            this.colorType.Canvas.Font.Color = UNRESOLVED.clBtnShadow
        }
        this.colorType.Canvas.FillRect(Rect)
        UNRESOLVED.strPCopy(cText, this.colorType.Items[index])
        // margin for text 
        Rect.left = Rect.left + 2
        UNRESOLVED.drawText(this.colorType.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
    }
    
    helpButtonClick(Sender: TObject): void {
        switch (this.copySavePrintType) {
            case kCopyingDrawing:
                delphi_compatability.Application.HelpJump("Copying_pictures")
                break
            case kPrintingDrawing:
                delphi_compatability.Application.HelpJump("Printing_pictures")
                break
            case kSavingDrawingToBmp:
                delphi_compatability.Application.HelpJump("Saving_pictures")
                break
            case kSavingDrawingToJpeg:
                delphi_compatability.Application.HelpJump("Saving_pictures")
                break
        }
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
}

