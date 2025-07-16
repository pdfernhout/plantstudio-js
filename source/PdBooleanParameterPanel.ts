// unit upp_boo

from conversion_common import *
import udebug
import udomain
import usupport
import uunits
import umath
import updcom
import umain
import uppanel
import uparams
import uplant
import delphi_compatability

// const
const kItemYes = 1
const kItemNo = 2



export class PdBooleanParameterPanel {
    currentValue: boolean = false
    yesRect: TRect = new TRect()
    noRect: TRect = new TRect()
    editEnabled: boolean = false
    PdBooleanParameterPanel.prototype = new PdParameterPanel()
    PdBooleanParameterPanel.prototype.constructor = PdBooleanParameterPanel
    
    initialize(): void {
        this.currentValue = false
        this.editEnabled = false
    }
    
    updateEnabling(): void {
        PdParameterPanel.prototype.updateEnabling.call(this)
        if ((this.plant === null) || (this.readOnly)) {
            this.editEnabled = false
        } else {
            this.editEnabled = true
        }
    }
    
    updatePlantValues(): void {
        if (this.plant === null) {
            return
        }
        if (this.param.collapsed) {
            return
        }
        this.updateCurrentValue(-1)
        this.updateDisplay()
        this.Invalidate()
    }
    
    updateCurrentValue(aFieldIndex: int): void {
        if (this.plant !== null) {
            if (this.param.fieldType === uparams.kFieldBoolean) {
                this.currentValue = this.plant.transferField(umath.kGetField, this.currentValue, this.param.fieldNumber, uparams.kFieldBoolean, uparams.kNotArray, false, null)
                this.updateDisplay()
            }
        } else {
            this.currentValue = false
            this.editEnabled = false
        }
    }
    
    updateDisplay(): void {
        if (this.plant !== null) {
            if (this.param.fieldType === uparams.kFieldBoolean) {
                this.Invalidate()
            }
        } else {
            this.editEnabled = false
        }
    }
    
    doMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        let thePoint: TPoint
        let newValue: boolean
        
        // must always call this first because it sets the focus 
        PdParameterPanel.prototype.doMouseDown.call(this, Sender, Button, Shift, X, Y)
        if ((this.editEnabled)) {
            thePoint = Point(X, Y)
            newValue = this.currentValue
            if (delphi_compatability.PtInRect(this.yesRect, thePoint)) {
                newValue = true
                this.selectedItemIndex = kItemYes
            } else if (delphi_compatability.PtInRect(this.noRect, thePoint)) {
                newValue = false
                this.selectedItemIndex = kItemNo
            }
            this.Invalidate()
            if ((newValue !== this.currentValue)) {
                this.negateValue()
            }
        }
    }
    
    doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
        let newValue: boolean
        
        PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
        if ((key === delphi_compatability.VK_RETURN) && (this.editEnabled)) {
            newValue = this.currentValue
            switch (this.selectedItemIndex) {
                case kItemYes:
                    newValue = true
                    break
                case kItemNo:
                    newValue = false
                    break
            }
            if ((newValue !== this.currentValue)) {
                this.negateValue()
            }
        }
        return key
    }
    
    negateValue(): void {
        this.currentValue = !this.currentValue
        if (this.plant !== null) {
            umain.MainForm.doCommand(updcom.PdChangeBooleanValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
        }
        this.Invalidate()
    }
    
    maxWidth(): int {
        let result = 0
        result = umath.intMax(uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth, uppanel.kRadioButtonLeftGap + (this.yesRect.Right - this.yesRect.Left) + uppanel.kRadioButtonBetweenGap + (this.noRect.Right - this.noRect.Left) + uppanel.kLeftRightGap)
        return result
    }
    
    minWidth(requestedWidth: int): int {
        let result = 0
        let minAllowed: int
        
        minAllowed = umath.intMax(uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth, uppanel.kRadioButtonLeftGap + (this.yesRect.Right - this.yesRect.Left) + uppanel.kRadioButtonBetweenGap + (this.noRect.Right - this.noRect.Left) + uppanel.kLeftRightGap)
        if (requestedWidth > minAllowed) {
            result = -1
        } else {
            result = minAllowed
        }
        return result
    }
    
    uncollapsedHeight(): int {
        let result = 0
        result = this.collapsedHeight() + this.textHeight + uppanel.kTopBottomGap
        return result
    }
    
    maxSelectedItemIndex(): int {
        let result = 0
        if ((!this.param.collapsed) && (this.editEnabled)) {
            result = kItemNo
        } else {
            result = uppanel.kItemLabel
        }
        return result
    }
    
    resizeElements(): void {
        // do nothing 
    }
    
    paint(): void {
        let rect: TRect
        let circleYesRect: TRect
        let circleNoRect: TRect
        let yesTextRect: TRect
        let noTextRect: TRect
        
        PdParameterPanel.prototype.paint.call(this)
        if ((this.param.collapsed)) {
            if (this.currentValue) {
                this.drawExtraValueCaptionWithString("yes", "")
            } else {
                this.drawExtraValueCaptionWithString("no", "")
            }
            return
        }
        Rect = this.GetClientRect()
        this.Canvas.Font = this.Font
        circleYesRect.Left = Rect.left + uppanel.kRadioButtonLeftGap
        circleYesRect.Right = circleYesRect.Left + uppanel.kRadioButtonWidth
        circleYesRect.Top = Rect.top + this.collapsedHeight() + (this.textHeight / 2 - uppanel.kRadioButtonWidth / 2)
        circleYesRect.Bottom = circleYesRect.Top + uppanel.kRadioButtonWidth
        yesTextRect.Left = Rect.left + uppanel.kRadioButtonLeftGap + uppanel.kRadioButtonWidth + uppanel.kRadioButtonBeforeTextGap
        yesTextRect.Right = yesTextRect.Left + this.Canvas.TextWidth("yes")
        yesTextRect.Top = Rect.top + this.collapsedHeight()
        yesTextRect.Bottom = yesTextRect.Top + this.textHeight
        circleNoRect = circleYesRect
        circleNoRect.Left = yesTextRect.Right + uppanel.kRadioButtonBetweenGap
        circleNoRect.Right = circleNoRect.Left + uppanel.kRadioButtonWidth
        noTextRect = yesTextRect
        noTextRect.Left = yesTextRect.Right + uppanel.kRadioButtonBetweenGap + uppanel.kRadioButtonWidth + uppanel.kRadioButtonBeforeTextGap
        noTextRect.Right = noTextRect.Left + this.Canvas.TextWidth("no")
        this.drawRadioButton(this.currentValue, this.editEnabled, circleYesRect)
        this.drawText("yes", yesTextRect, true, (this.selectedItemIndex === kItemYes) && (this.editEnabled), false)
        this.drawRadioButton(!this.currentValue, this.editEnabled, circleNoRect)
        this.drawText("no", noTextRect, true, (this.selectedItemIndex === kItemNo) && (this.editEnabled), false)
        delphi_compatability.UnionRect(this.yesRect, circleYesRect, yesTextRect)
        delphi_compatability.UnionRect(this.noRect, circleNoRect, noTextRect)
    }
    
    drawRadioButton(value: boolean, enabled: boolean, rect: TRect): void {
        let brushColor: TColor
        
        brushColor = this.Canvas.Brush.Color
        if (value) {
            if (enabled) {
                this.Canvas.Brush.Color = UNRESOLVED.clBtnText
            } else {
                this.Canvas.Brush.Color = UNRESOLVED.clBtnShadow
            }
        } else {
            this.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        }
        //FIX unresolved WITH expression: Rect
        this.Canvas.Ellipse(this.Left, this.Top, UNRESOLVED.right, UNRESOLVED.bottom)
        this.Canvas.Brush.Color = brushColor
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    }
    
}

