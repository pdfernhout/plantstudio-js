// unit uborders

from conversion_common import *
import usupport
import updform
import udomain
import delphi_compatability

// const
const kTransferLoad = 1
const kTransferSave = 2



export class TPrintBordersForm {
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    printBorderInner: TCheckBox = new TCheckBox()
    printBorderOuter: TCheckBox = new TCheckBox()
    printBorderColorInnerLabel: TLabel = new TLabel()
    printBorderColorInner: TPanel = new TPanel()
    printBorderColorOuter: TPanel = new TPanel()
    printBorderColorOuterLabel: TLabel = new TLabel()
    printBorderWidthInnerLabel: TLabel = new TLabel()
    printBorderWidthOuterLabel: TLabel = new TLabel()
    printBorderWidthInner: TSpinEdit = new TSpinEdit()
    printBorderWidthOuter: TSpinEdit = new TSpinEdit()
    helpButton: TSpeedButton = new TSpeedButton()
    options: BitmapOptionsStructure = new BitmapOptionsStructure()
    transferDirection: short = 0
    optionsChanged: boolean = false
    TPrintBordersForm.prototype = new PdForm()
    TPrintBordersForm.prototype.constructor = TPrintBordersForm
    
    //$R *.DFM
    initializeWithOptions(anOptions: BitmapOptionsStructure): void {
        this.options = anOptions
        this.transferDirection = kTransferLoad
        this.transferFields()
        // simple interaction, so just put it in here
        this.printBorderColorInner.Enabled = this.printBorderInner.Checked
        this.printBorderWidthInner.Enabled = this.printBorderInner.Checked
        this.printBorderColorInnerLabel.Enabled = this.printBorderInner.Checked
        this.printBorderWidthInnerLabel.Enabled = this.printBorderInner.Checked
        this.printBorderColorOuter.Enabled = this.printBorderOuter.Checked
        this.printBorderWidthOuter.Enabled = this.printBorderOuter.Checked
        this.printBorderColorOuterLabel.Enabled = this.printBorderOuter.Checked
        this.printBorderWidthOuterLabel.Enabled = this.printBorderOuter.Checked
    }
    
    transferFields(): void {
        this.options.printBorderInner = this.transferCheckBox(this.printBorderInner, this.options.printBorderInner)
        this.options.printBorderOuter = this.transferCheckBox(this.printBorderOuter, this.options.printBorderOuter)
        this.transferColor(this.printBorderColorInner, this.options.printBorderColorInner)
        this.transferColor(this.printBorderColorOuter, this.options.printBorderColorOuter)
        this.options.printBorderWidthInner = this.transferSmallintSpinEditBox(this.printBorderWidthInner, this.options.printBorderWidthInner)
        this.options.printBorderWidthOuter = this.transferSmallintSpinEditBox(this.printBorderWidthOuter, this.options.printBorderWidthOuter)
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
    
    transferColor(colorPanel: TPanel, value: TColorRef): void {
        raise "method transferColor had assigned to var parameter value not added to return -- fixup manually"
        if (this.transferDirection === kTransferLoad) {
            colorPanel.Color = value
        } else if (this.transferDirection === kTransferSave) {
            if (value !== colorPanel.Color) {
                this.optionsChanged = true
            }
            value = colorPanel.Color
        }
    }
    
    transferSmallintSpinEditBox(editBox: TSpinEdit, value: short): void {
        if (this.transferDirection === kTransferLoad) {
            editBox.Text = IntToStr(value)
        } else if (this.transferDirection === kTransferSave) {
            if (value !== StrToIntDef(editBox.Text, 0)) {
                this.optionsChanged = true
            }
            value = StrToIntDef(editBox.Text, 0)
        }
        return value
    }
    
    printBorderColorInnerMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.printBorderColorInner.Color = udomain.domain.getColorUsingCustomColors(this.printBorderColorInner.Color)
    }
    
    printBorderColorOuterMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.printBorderColorOuter.Color = udomain.domain.getColorUsingCustomColors(this.printBorderColorOuter.Color)
    }
    
    printBorderInnerClick(Sender: TObject): void {
        this.printBorderColorInner.Enabled = this.printBorderInner.Checked
        this.printBorderWidthInner.Enabled = this.printBorderInner.Checked
        this.printBorderColorInnerLabel.Enabled = this.printBorderInner.Checked
        this.printBorderWidthInnerLabel.Enabled = this.printBorderInner.Checked
    }
    
    printBorderOuterClick(Sender: TObject): void {
        this.printBorderColorOuter.Enabled = this.printBorderOuter.Checked
        this.printBorderWidthOuter.Enabled = this.printBorderOuter.Checked
        this.printBorderColorOuterLabel.Enabled = this.printBorderOuter.Checked
        this.printBorderWidthOuterLabel.Enabled = this.printBorderOuter.Checked
    }
    
    CloseClick(Sender: TObject): void {
        this.transferDirection = kTransferSave
        this.transferFields()
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Drawing_a_print_border")
    }
    
    FormKeyPress(Sender: TObject, Key: char): void {
        Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
        return Key
    }
    
}

