// unit Uoptions

// from conversion_common import *
// import u3dexport
// import ucustdrw
// import umath
// import usupport
// import updform
// import udomain
// import delphi_compatability

import * as m from "mithril"
import { float, int, IntToStr, short, ShowMessage, StrToFloat, StrToIntDef } from "./common"
import { chr, digitValueString } from "./usupport"
import { DomainOptionsStructure } from "./PdDomain"
import { viewOptionsForm } from "./TOptionsForm-view"

// const
const kTransferLoad = 1
const kTransferSave = 2

export class TOptionsForm {
    // Close: TButton = new TButton()
    // cancel: TButton = new TButton()
    // optionsNotebook: TTabbedNotebook = new TTabbedNotebook()
    // drawWithOpenGL: TCheckBox = new TCheckBox()
    // wholeProgramBox: TGroupBox = new TGroupBox()
    // backgroundColor: TPanel = new TPanel()
    // backgroundColorLabel: TLabel = new TLabel()
    // showPlantDrawingProgress: TCheckBox = new TCheckBox()
    // GroupBox1: TGroupBox = new TGroupBox()
    // firstSelectionRectangleColorLabel: TLabel = new TLabel()
    // multiSelectionRectangleColorLabel: TLabel = new TLabel()
    // firstSelectionRectangleColor: TPanel = new TPanel()
    // multiSelectionRectangleColor: TPanel = new TPanel()
    // GroupBox2: TGroupBox = new TGroupBox()
    // rotationIncrementLabel: TLabel = new TLabel()
    // nudgeDistanceLabel: TLabel = new TLabel()
    // rotationIncrement: TSpinEdit = new TSpinEdit()
    // nudgeDistance: TSpinEdit = new TSpinEdit()
    // GroupBox6: TGroupBox = new TGroupBox()
    // parametersFontSizeLabel: TLabel = new TLabel()
    // useMetricUnits: TCheckBox = new TCheckBox()
    // parametersFontSize: TSpinEdit = new TSpinEdit()
    // GroupBox7: TGroupBox = new TGroupBox()
    // pauseBeforeHintLabel: TLabel = new TLabel()
    // pauseDuringHintLabel: TLabel = new TLabel()
    // openMostRecentFileAtStart: TCheckBox = new TCheckBox()
    // pauseBeforeHint: TSpinEdit = new TSpinEdit()
    // pauseDuringHint: TSpinEdit = new TSpinEdit()
    // helpButton: TSpeedButton = new TSpeedButton()
    // resizeKeyUpMultiplierPercent: TSpinEdit = new TSpinEdit()
    // resizeDistanceLabel: TLabel = new TLabel()
    // mainWindowDrawingOptionsBox: TGroupBox = new TGroupBox()
    // customDrawOptions: TButton = new TButton()
    // Label1: TLabel = new TLabel()
    // transparentColor: TPanel = new TPanel()
    // transparentColorLabel: TLabel = new TLabel()
    // memoryLimitForPlantBitmaps_MB: TSpinEdit = new TSpinEdit()
    // memoryLimitLabel: TLabel = new TLabel()
    // Panel1: TPanel = new TPanel()
    // Image1: TImage = new TImage()
    // pasteRectSize: TSpinEdit = new TSpinEdit()
    // pasteRectSizeLabel: TLabel = new TLabel()
    // GroupBox4: TGroupBox = new TGroupBox()
    // Label9: TLabel = new TLabel()
    // Label10: TLabel = new TLabel()
    // ghostingColor: TPanel = new TPanel()
    // nonHiddenPosedColor: TPanel = new TPanel()
    // selectedPosedColor: TPanel = new TPanel()
    // Label3: TLabel = new TLabel()
    // GroupBox5: TGroupBox = new TGroupBox()
    // undoLimitLabel: TLabel = new TLabel()
    // undoLimitOfPlantsLabel: TLabel = new TLabel()
    // undoLimit: TSpinEdit = new TSpinEdit()
    // undoLimitOfPlants: TSpinEdit = new TSpinEdit()
    // resizeRectSize: TSpinEdit = new TSpinEdit()
    // resizeRectSizeLabel: TLabel = new TLabel()
    // ignoreWindowSettingsInFile: TCheckBox = new TCheckBox()
    transferDirection: short = 0
    options: DomainOptionsStructure = new DomainOptionsStructure()
    optionsChanged: boolean = false
    messageShown: short = 0
    // TOptionsForm.prototype = new PdForm()
    // TOptionsForm.prototype.constructor = TOptionsForm
    
    //$R *.DFM
    // FormCreate(Sender: TObject): void {
    //     this.optionsNotebook.pageIndex = 0
    // }
    
    // FormActivate(Sender: TObject): void {
    //     this.transferDirection = kTransferLoad
    //     this.transferFields()
    // }
    
    // CloseClick(Sender: TObject): void {
    //     this.transferDirection = kTransferSave
    //     this.transferFields()
    //     this.ModalResult = mrOK
    // }
    
    // cancelClick(Sender: TObject): void {
    //     this.ModalResult = mrCancel
    // }
    
    // transferFields(): void {
    //     // DRAWING
    //     this.options.memoryLimitForPlantBitmaps_MB = this.transferSmallintSpinEditBox(this.memoryLimitForPlantBitmaps_MB, this.options.memoryLimitForPlantBitmaps_MB)
    //     this.transferColor(this.backgroundColor, this.options.backgroundColor)
    //     this.transferColor(this.transparentColor, this.options.transparentColor)
    //     this.options.showPlantDrawingProgress = this.transferCheckBox(this.showPlantDrawingProgress, this.options.showPlantDrawingProgress)
    //     // SELECTING
    //     this.transferColor(this.firstSelectionRectangleColor, this.options.firstSelectionRectangleColor)
    //     this.transferColor(this.multiSelectionRectangleColor, this.options.multiSelectionRectangleColor)
    //     this.options.resizeRectSize = this.transferSmallintSpinEditBox(this.resizeRectSize, this.options.resizeRectSize)
    //     this.transferColor(this.ghostingColor, this.options.ghostingColor)
    //     this.transferColor(this.nonHiddenPosedColor, this.options.nonHiddenPosedColor)
    //     this.transferColor(this.selectedPosedColor, this.options.selectedPosedColor)
    //     // EDITING
    //     this.options.rotationIncrement = this.transferSmallintSpinEditBox(this.rotationIncrement, this.options.rotationIncrement)
    //     this.options.nudgeDistance = this.transferSmallintSpinEditBox(this.nudgeDistance, this.options.nudgeDistance)
    //     this.options.resizeKeyUpMultiplierPercent = this.transferSmallintSpinEditBox(this.resizeKeyUpMultiplierPercent, this.options.resizeKeyUpMultiplierPercent)
    //     this.options.pasteRectSize = this.transferSmallintSpinEditBox(this.pasteRectSize, this.options.pasteRectSize)
    //     // UNDOING
    //     this.options.undoLimit = this.transferSmallintSpinEditBox(this.undoLimit, this.options.undoLimit)
    //     this.options.undoLimitOfPlants = this.transferSmallintSpinEditBox(this.undoLimitOfPlants, this.options.undoLimitOfPlants)
    //     // MISCELLANEOUS
    //     this.options.openMostRecentFileAtStart = this.transferCheckBox(this.openMostRecentFileAtStart, this.options.openMostRecentFileAtStart)
    //     // v2.1
    //     this.options.ignoreWindowSettingsInFile = this.transferCheckBox(this.ignoreWindowSettingsInFile, this.options.ignoreWindowSettingsInFile)
    //     this.options.useMetricUnits = this.transferCheckBox(this.useMetricUnits, this.options.useMetricUnits)
    //     this.options.parametersFontSize = this.transferSmallintSpinEditBox(this.parametersFontSize, this.options.parametersFontSize)
    //     this.options.pauseBeforeHint = this.transferSmallintSpinEditBox(this.pauseBeforeHint, this.options.pauseBeforeHint)
    //     this.options.pauseDuringHint = this.transferSmallintSpinEditBox(this.pauseDuringHint, this.options.pauseDuringHint)
    // }
    
    // transferCheckBox(checkBox: TCheckBox, value: boolean): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         checkBox.Checked = value
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== checkBox.Checked) {
    //             this.optionsChanged = true
    //         }
    //         value = checkBox.Checked
    //     }
    //     return value
    // }
    
    // transferColor(colorPanel: TPanel, value: TColorRef): void {
    //     throw new Error("method transferColor had assigned to var parameter value not added to return -- fixup manually")
    //     if (this.transferDirection === kTransferLoad) {
    //         colorPanel.Color = value
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== colorPanel.Color) {
    //             this.optionsChanged = true
    //         }
    //         value = colorPanel.Color
    //     }
    // }
    
    // transferSmallintSpinEditBox(editBox: TSpinEdit, value: short): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         editBox.Text = IntToStr(value)
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== StrToIntDef(editBox.Text, 0)) {
    //             this.optionsChanged = true
    //         }
    //         value = StrToIntDef(editBox.Text, 0)
    //     }
    //     return value
    // }
    
    // transferFloatEditBox(editBox: TEdit, value: float): void {
    //     let oldValue: float
    //     let newValue: float
        
    //     if (this.transferDirection === kTransferLoad) {
    //         editBox.Text = digitValueString(value)
    //     } else if (this.transferDirection === kTransferSave) {
    //         oldValue = value
    //         try {
    //             newValue = StrToFloat(editBox.Text)
    //         } catch (e) {
    //             newValue = oldValue
    //         }
    //         if (value !== newValue) {
    //             this.optionsChanged = true
    //         }
    //         value = newValue
    //     }
    //     return value
    // }
    
    // backgroundColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.backgroundColor.Color = udomain.domain.getColorUsingCustomColors(this.backgroundColor.Color)
    // }
    
    // transparentColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     // leave this enabled even if not using private bitmaps
    //     this.transparentColor.Color = udomain.domain.getColorUsingCustomColors(this.transparentColor.Color)
    // }
    
    // firstSelectionRectangleColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.firstSelectionRectangleColor.Color = udomain.domain.getColorUsingCustomColors(this.firstSelectionRectangleColor.Color)
    // }
    
    // multiSelectionRectangleColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.multiSelectionRectangleColor.Color = udomain.domain.getColorUsingCustomColors(this.multiSelectionRectangleColor.Color)
    // }
    
    // ghostingColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.ghostingColor.Color = udomain.domain.getColorUsingCustomColors(this.ghostingColor.Color)
    // }
    
    // nonHiddenPosedColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.nonHiddenPosedColor.Color = udomain.domain.getColorUsingCustomColors(this.nonHiddenPosedColor.Color)
    // }
    
    // selectedPosedColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.selectedPosedColor.Color = udomain.domain.getColorUsingCustomColors(this.selectedPosedColor.Color)
    // }
    
    // FormKeyPress(Sender: TObject, Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     return Key
    // }
    
    // helpButtonClick(Sender: TObject): void {
    //     delphi_compatability.Application.HelpJump("Changing_preferences")
    // }
    
    // customDrawOptionsClick(Sender: TObject): void {
    //     let customDrawForm: TCustomDrawOptionsForm
    //     let response: int
        
    //     customDrawForm = ucustdrw.TCustomDrawOptionsForm().create(this)
    //     if (customDrawForm === null) {
    //         throw new Error("Problem: Could not create 3D object mover window.")
    //     }
    //     try {
    //         customDrawForm.options = this.options
    //         response = customDrawForm.ShowModal()
    //         if ((response === mrOK) && (customDrawForm.optionsChanged)) {
    //             this.options = customDrawForm.options
    //             this.optionsChanged = true
    //         }
    //     } finally {
    //         customDrawForm.free
    //     }
    // }
    
    Image1Click(): void {
        switch (this.messageShown) {
            case 0:
                ShowMessage("We would like to take this opportunity" + chr(13) + "to say thank you to our excellent testers, " + chr(13) + "especially Ana, Joanne and Randy.")
                break
            case 1:
                ShowMessage("Thanks to our parents and families.")
                break
            case 2:
                ShowMessage("Thanks to our dogs Maize and Comet" + chr(13) + "for their many interesting suggestions.")
                break
            case 3:
                ShowMessage("Thanks to those who have graciously supported our work.")
                break
            case 4:
                ShowMessage("Thanks to everyone who sent letters.")
                break
            case 5:
                ShowMessage("Thanks to those who have spread the word about PlantStudio.")
                break
            case 6:
                ShowMessage("And thank YOU for trying PlantStudio!")
                break
        }
        this.messageShown += 1
    }

    view(vnode: any) {
        return m("div", {
            onclick: () => vnode.attrs.close()
        },
            "TOptionsForm UNFINISHED",
            viewOptionsForm()
        )
    }
    
}

