// unit unozzle

from conversion_common import *
import umath
import usupport
import umain
import updform
import udomain
import delphi_compatability


export class TNozzleOptionsForm {
    GroupBox1: TGroupBox = new TGroupBox()
    cellCountLabel: TLabel = new TLabel()
    cellSizeLabel: TLabel = new TLabel()
    helpButton: TSpeedButton = new TSpeedButton()
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    ColorDialog: TColorDialog = new TColorDialog()
    fileSizeLabel: TLabel = new TLabel()
    Panel1: TPanel = new TPanel()
    Label4: TLabel = new TLabel()
    GroupBox2: TGroupBox = new TGroupBox()
    resolutionLabel: TLabel = new TLabel()
    Label3: TLabel = new TLabel()
    colorsLabel: TLabel = new TLabel()
    Label1: TLabel = new TLabel()
    backgroundColorPanel: TPanel = new TPanel()
    resolutionEdit: TSpinEdit = new TSpinEdit()
    colorType: TComboBox = new TComboBox()
    GroupBox3: TGroupBox = new TGroupBox()
    useSelectedPlants: TRadioButton = new TRadioButton()
    useVisiblePlants: TRadioButton = new TRadioButton()
    useAllPlants: TRadioButton = new TRadioButton()
    options: NozzleOptionsStructure = new NozzleOptionsStructure()
    TNozzleOptionsForm.prototype = new PdForm()
    TNozzleOptionsForm.prototype.constructor = TNozzleOptionsForm
    
    //$R *.DFM
    initializeWithOptions(anOptions: NozzleOptionsStructure): void {
        this.options = anOptions
        switch (this.options.exportType) {
            case udomain.kIncludeSelectedPlants:
                this.useSelectedPlants.Checked = true
                break
            case udomain.kIncludeVisiblePlants:
                this.useVisiblePlants.Checked = true
                break
            case udomain.kIncludeAllPlants:
                this.useAllPlants.Checked = true
                break
        }
        this.resolutionEdit.Text = IntToStr(intround(this.options.resolution_pixelsPerInch))
        this.backgroundColorPanel.Color = this.options.backgroundColor
        this.colorType.ItemIndex = ord(this.options.colorType)
        this.updateCellSizeAndCountForSelection()
    }
    
    updateCellSizeAndCountForSelection(): void {
        let excludeInvisiblePlants: boolean
        let excludeNonSelectedPlants: boolean
        let cellRect: TRect
        let scaleMultiplier: float
        let fileSize: long
        
        excludeInvisiblePlants = !this.useAllPlants.Checked
        excludeNonSelectedPlants = this.useSelectedPlants.Checked
        cellRect = udomain.domain.plantManager.largestPlantBoundsRect(umain.MainForm.selectedPlants, excludeInvisiblePlants, excludeNonSelectedPlants)
        scaleMultiplier = umath.safedivExcept(1.0 * this.options.resolution_pixelsPerInch, 1.0 * delphi_compatability.Screen.PixelsPerInch, 1.0)
        this.options.cellSize = Point(intround(usupport.rWidth(cellRect) * scaleMultiplier), intround(usupport.rHeight(cellRect) * scaleMultiplier))
        if (this.useAllPlants.Checked) {
            this.options.cellCount = udomain.domain.plantManager.plants.Count
        } else if (this.useVisiblePlants.Checked) {
            this.options.cellCount = udomain.domain.plantManager.visiblePlantCount()
        } else if (this.useSelectedPlants.Checked) {
            this.options.cellCount = umain.MainForm.selectedPlants.Count
        }
        this.cellSizeLabel.Caption = "Nozzle/tube cell width:  " + IntToStr(this.options.cellSize.X) + " height:  " + IntToStr(this.options.cellSize.Y)
        this.cellCountLabel.Caption = "Number of items:  " + IntToStr(this.options.cellCount)
        fileSize = intround(this.options.cellCount * this.options.cellSize.X * this.options.cellSize.Y * usupport.bitsPerPixelForColorType(this.options.colorType) / 8.0) + FIX_sizeof(delphi_compatability.TBitmapInfo)
        if (fileSize < 1024) {
            this.fileSizeLabel.Caption = "Estimated file size:  " + IntToStr(fileSize) + " bytes"
        } else if (fileSize < 1024 * 1024) {
            this.fileSizeLabel.Caption = "Estimated file size:  " + IntToStr(fileSize / 1024) + " KB"
        } else {
            this.fileSizeLabel.Caption = "Estimated file size:  " + FloatToStrF(fileSize / (1024 * 1024), UNRESOLVED.ffFixed, 7, 1) + " MB"
        }
        if (fileSize >= 10.0 * 1024 * 1024) {
            this.fileSizeLabel.Font.Style = {UNRESOLVED.fsBold, }
        } else {
            this.fileSizeLabel.Font.Style = {}
        }
    }
    
    changeSelection(Sender: TObject): void {
        if (Sender === this.useSelectedPlants) {
            this.options.exportType = udomain.kIncludeSelectedPlants
        } else if (Sender === this.useVisiblePlants) {
            this.options.exportType = udomain.kIncludeVisiblePlants
        } else if (Sender === this.useAllPlants) {
            this.options.exportType = udomain.kIncludeAllPlants
        }
        this.updateCellSizeAndCountForSelection()
    }
    
    backgroundColorPanelClick(Sender: TObject): void {
        this.backgroundColorPanel.Color = udomain.domain.getColorUsingCustomColors(this.backgroundColorPanel.Color)
        this.options.backgroundColor = this.backgroundColorPanel.Color
    }
    
    resolutionEditChange(Sender: TObject): void {
        this.options.resolution_pixelsPerInch = StrToIntDef(this.resolutionEdit.Text, intround(this.options.resolution_pixelsPerInch))
        this.updateCellSizeAndCountForSelection()
    }
    
    colorTypeChange(Sender: TObject): void {
        this.options.colorType = UNRESOLVED.TPixelFormat(this.colorType.ItemIndex)
        this.updateCellSizeAndCountForSelection()
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Making_a_nozzle_or_tube")
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
    CloseClick(Sender: TObject): void {
        if ((this.options.exportType === udomain.kIncludeSelectedPlants) && (umain.MainForm.selectedPlants.Count <= 0)) {
            MessageDialog("You chose \"selected\" for \"Draw which plants\", but no plants are selected." + chr(13) + "You should make another choice, or click Cancel and select some plants.", delphi_compatability.TMsgDlgType.mtError, {mbOK, }, 0)
        } else {
            this.ModalResult = mrOK
        }
    }
    
}

