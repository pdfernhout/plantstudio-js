// unit uanimate

from conversion_common import *
import usupport
import umath
import updform
import uplant
import udomain
import delphi_compatability


export class TAnimationFilesOptionsForm {
    helpButton: TSpeedButton = new TSpeedButton()
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    Panel1: TPanel = new TPanel()
    fileNumberLabel: TLabel = new TLabel()
    animationSizeLabel: TLabel = new TLabel()
    fileSizeLabel: TLabel = new TLabel()
    Panel2: TPanel = new TPanel()
    Label4: TLabel = new TLabel()
    focusedPlantName: TLabel = new TLabel()
    Label5: TLabel = new TLabel()
    GroupBox1: TGroupBox = new TGroupBox()
    Label1: TLabel = new TLabel()
    resolutionLabel: TLabel = new TLabel()
    incrementLabel: TLabel = new TLabel()
    plantMaxAgeLabel: TLabel = new TLabel()
    colorsLabel: TLabel = new TLabel()
    animateByAge: TRadioButton = new TRadioButton()
    animateByXRotation: TRadioButton = new TRadioButton()
    incrementEdit: TSpinEdit = new TSpinEdit()
    resolution: TSpinEdit = new TSpinEdit()
    colorType: TComboBox = new TComboBox()
    options: NumberedAnimationOptionsStructure = new NumberedAnimationOptionsStructure()
    plant: PdPlant = new PdPlant()
    internalChange: boolean = false
    TAnimationFilesOptionsForm.prototype = new PdForm()
    TAnimationFilesOptionsForm.prototype.constructor = TAnimationFilesOptionsForm
    
    //$R *.DFM
    initializeWithOptionsAndPlant(anOptions: NumberedAnimationOptionsStructure, aPlant: PdPlant): void {
        this.internalChange = true
        if (aPlant === null) {
            throw new GeneralException.create("Problem: Nil plant in method TAnimationFilesOptionsForm.initializeWithOptionsAndPlant.")
        }
        this.plant = aPlant
        this.options = anOptions
        this.focusedPlantName.Caption = this.plant.getName()
        if (this.options.animateBy === udomain.kAnimateByAge) {
            this.animateByAge.Checked = true
        } else if (this.options.animateBy === udomain.kAnimateByXRotation) {
            this.animateByXRotation.Checked = true
        }
        this.changeQuestionsBasedOnAnimationType()
        this.resolution.Value = this.options.resolution_pixelsPerInch
        this.colorType.ItemIndex = ord(this.options.colorType)
        this.changeQuestionsBasedOnAnimationType()
        this.calculateNumberOfFrames()
        this.internalChange = false
    }
    
    changeQuestionsBasedOnAnimationType(): void {
        this.internalChange = true
        if (this.animateByAge.Checked) {
            this.incrementLabel.Caption = "Age increment between &frames (days)"
            this.incrementEdit.Value = this.options.ageIncrement
        } else {
            this.incrementLabel.Caption = "Rotation increment between &frames (degrees)"
            this.incrementEdit.Value = this.options.xRotationIncrement
        }
        this.internalChange = false
    }
    
    animateByAgeClick(Sender: TObject): void {
        if (this.internalChange) {
            return
        }
        if (this.animateByAge.Checked) {
            this.options.animateBy = udomain.kAnimateByAge
        } else {
            this.options.animateBy = udomain.kAnimateByXRotation
        }
        this.changeQuestionsBasedOnAnimationType()
        this.calculateNumberOfFrames()
    }
    
    animateByXRotationClick(Sender: TObject): void {
        if (this.internalChange) {
            return
        }
        if (this.animateByAge.Checked) {
            this.options.animateBy = udomain.kAnimateByAge
        } else {
            this.options.animateBy = udomain.kAnimateByXRotation
        }
        this.changeQuestionsBasedOnAnimationType()
        this.calculateNumberOfFrames()
    }
    
    incrementEditChange(Sender: TObject): void {
        let oldValue: short
        
        if (this.internalChange) {
            return
        }
        if (this.animateByAge.Checked) {
            oldValue = this.options.ageIncrement
        } else {
            oldValue = this.options.xRotationIncrement
        }
        try {
            if (this.animateByAge.Checked) {
                this.options.ageIncrement = this.incrementEdit.Value
            } else {
                this.options.xRotationIncrement = this.incrementEdit.Value
            }
        } catch (Exception e) {
            if (this.animateByAge.Checked) {
                this.options.ageIncrement = oldValue
            } else {
                this.options.xRotationIncrement = oldValue
            }
        }
        this.calculateNumberOfFrames()
    }
    
    resolutionChange(Sender: TObject): void {
        let oldValue: short
        
        if (this.internalChange) {
            return
        }
        oldValue = this.options.resolution_pixelsPerInch
        try {
            this.options.resolution_pixelsPerInch = this.resolution.Value
        } catch (Exception e) {
            this.options.resolution_pixelsPerInch = oldValue
        }
        this.calculateNumberOfFrames()
    }
    
    calculateNumberOfFrames(): void {
        let scaleMultiplier: float
        
        if (this.options.animateBy === udomain.kAnimateByAge) {
            this.plantMaxAgeLabel.Caption = "Maximum age = " + IntToStr(this.plant.pGeneral.ageAtMaturity)
            this.plantMaxAgeLabel.Visible = true
            this.options.frameCount = this.plant.pGeneral.ageAtMaturity / this.options.ageIncrement + 1
        } else if (this.options.animateBy === udomain.kAnimateByXRotation) {
            this.plantMaxAgeLabel.Visible = false
            this.options.frameCount = 360 / abs(this.options.xRotationIncrement)
        }
        this.fileNumberLabel.Caption = "Number of files:  " + IntToStr(this.options.frameCount)
        scaleMultiplier = umath.safedivExcept(1.0 * this.options.resolution_pixelsPerInch, 1.0 * delphi_compatability.Screen.PixelsPerInch, 1.0)
        this.options.scaledSize = Point(intround(usupport.rWidth(this.plant.boundsRect_pixels()) * scaleMultiplier), intround(usupport.rHeight(this.plant.boundsRect_pixels()) * scaleMultiplier))
        this.animationSizeLabel.Caption = "Animation size:  " + IntToStr(this.options.scaledSize.X) + " x " + IntToStr(this.options.scaledSize.Y)
        this.options.fileSize = intround(this.options.frameCount * this.options.scaledSize.X * this.options.scaledSize.Y * usupport.bitsPerPixelForColorType(this.options.colorType) / 8.0) + FIX_sizeof(delphi_compatability.TBitmapInfo)
        if (this.options.fileSize < 1024) {
            this.fileSizeLabel.Caption = "Estimated total size:  " + IntToStr(this.options.fileSize) + " bytes"
        } else if (this.options.fileSize < 1024 * 1024) {
            this.fileSizeLabel.Caption = "Estimated total size:  " + IntToStr(this.options.fileSize / 1024) + " KB"
        } else {
            this.fileSizeLabel.Caption = "Estimated total size:  " + FloatToStrF(this.options.fileSize / (1024 * 1024), UNRESOLVED.ffFixed, 7, 1) + " MB"
        }
        if (this.options.fileSize >= 10.0 * 1024 * 1024) {
            this.fileSizeLabel.Font.Style = {UNRESOLVED.fsBold, }
        } else {
            this.fileSizeLabel.Font.Style = {}
        }
    }
    
    colorTypeChange(Sender: TObject): void {
        this.options.colorType = UNRESOLVED.TPixelFormat(this.colorType.ItemIndex)
        this.calculateNumberOfFrames()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Making_numbered_animation_files")
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
}

