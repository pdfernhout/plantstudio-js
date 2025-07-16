// unit upp_int

import * as m from "mithril"
import { int, intround, IntToStr, short } from "./common"
import { PdParameterPanel } from "./PdParameterPanel"
import { TRect } from "./TRect"
import { intMax } from "./umath"

// from conversion_common import *
// import udebug
// import udomain
// import usupport
// import uunits
// import umath
// import updcom
// import umain
// import usliders
// import uppanel
// import uparams
// import uplant
// import delphi_compatability

// const
const kItemValueText = 1
const kItemSlider = 2
//  kItemUnitText = 2;  
  
export class PdSmallintParameterPanel extends PdParameterPanel {
    currentValue: short = 0
    currentValueWhileSliding: short = 0
    minValue: short = 0
    maxValue: short = 0
    // slider: KfSlider = new KfSlider()
    unitIndex: short = 0
    minTextRect: TRect = new TRect()
    maxTextRect: TRect = new TRect()
    valueTextRect: TRect = new TRect()
    unitTextRect: TRect = new TRect()
    drawWithoutBounds: boolean = false
    
    // initialize(): void {
    //     //assuming slider will be deleted automatically by owner - self - otherwise would have destructor
    //     this.slider = usliders.KfSlider().create(this)
    //     this.slider.Parent = this
    //     this.slider.FOnMouseDown = this.sliderMouseDown
    //     this.slider.FOnMouseMove = this.sliderMouseMove
    //     this.slider.FOnMouseUp = this.sliderMouseUp
    //     this.slider.FOnKeyDown = this.sliderKeyDown
    //     this.slider.readOnly = this.param.readOnly
    //     this.slider.useDefaultSizeAndDraggerSize()
    //     this.minValue = intround(this.param.lowerBound())
    //     this.maxValue = intround(this.param.upperBound())
    //     this.slider.minValue = this.minValue
    //     this.slider.maxValue = this.maxValue
    // }
    
    // checkValueAgainstBounds(value: short): short {
    //     let result = 0
    //     result = value
    //     if (result < this.minValue) {
    //         result = this.minValue
    //     }
    //     if (result > this.maxValue) {
    //         result = this.maxValue
    //     }
    //     return result
    // }
    
    // doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
        
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseUp.call(this, Sender, Button, Shift, X, Y)
    //     thePoint = Point(X, Y)
    //     if (delphi_compatability.PtInRect(this.valueTextRect, thePoint)) {
    //         if (this.slider.Enabled && !this.slider.readOnly) {
    //             this.selectedItemIndex = kItemValueText
    //             this.Invalidate()
    //             this.adjustValue()
    //         }
    //     }
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     if (this.slider.Enabled) {
    //         switch (key) {
    //             case delphi_compatability.VK_HOME:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_END:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_DOWN:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_LEFT:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_UP:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_RIGHT:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_NEXT:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //             case delphi_compatability.VK_PRIOR:
    //                 if ((this.selectedItemIndex === kItemSlider)) {
    //                     // process slider arrow keys first 
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                     return key
    //                 }
    //                 break
    //         }
    //     }
    //     if ((this.selectedItemIndex === kItemValueText) && (key === delphi_compatability.VK_RETURN)) {
    //         key = 0
    //         this.Invalidate()
    //         this.adjustValue()
    //         return key
    //     }
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     if (this.slider.Enabled) {
    //         if ((key === delphi_compatability.VK_RETURN) && (this.selectedItemIndex === kItemSlider)) {
    //             key = this.slider.doKeyDown(sender, key, shift)
    //         }
    //     }
    //     return key
    // }
    
    // adjustValue(): void {
    //     let newString: string
    //     let oldValue: short
    //     let newValue: short
    //     let oldString: string
    //     let prompt: string
    //     let nameString: string
    //     let unitString: string
        
    //     oldValue = this.currentValue
    //     newString = IntToStr(this.currentValue)
    //     oldString = newString
    //     nameString = UNRESOLVED.copy(this.Caption, 1, 30)
    //     if (len(nameString) === 30) {
    //         nameString = nameString + "..."
    //     }
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.unitIndex)
    //     prompt = "Type a new value."
    //     if (InputQuery("Enter value", prompt, newString)) {
    //         if ((newString !== oldString)) {
    //             newValue = StrToIntDef(newString, 0)
    //             if (this.checkValueAgainstBounds(newValue) === newValue) {
    //                 this.currentValue = newValue
    //                 umain.MainForm.doCommand(updcom.PdChangeSmallintValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
    //                 this.updateDisplay()
    //                 this.Invalidate()
    //             }
    //         }
    //     }
    // }
    
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     this.slider.Enabled = this.plant !== null
    //     this.slider.readOnly = this.readOnly
    // }
    
    // updatePlantValues(): void {
    //     let oldValue: int
        
    //     if (this.plant === null) {
    //         return
    //     }
    //     if (this.param.collapsed) {
    //         return
    //     }
    //     oldValue = this.currentValue
    //     this.updateCurrentValue(-1)
    //     if (oldValue !== this.currentValue) {
    //         this.updateDisplay()
    //         this.Invalidate()
    //     }
    // }
    
    // updateCurrentValue(aFieldIndex: int): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldSmallint)) {
    //         this.currentValue = this.plant.transferField(umath.kGetField, this.currentValue, this.param.fieldNumber, uparams.kFieldSmallint, uparams.kNotArray, false, null)
    //         if (this.currentValue < this.minValue) {
    //             this.minValue = this.currentValue
    //             this.slider.minValue = this.minValue
    //         }
    //         if (this.currentValue > this.maxValue) {
    //             this.maxValue = this.currentValue
    //             this.slider.maxValue = this.maxValue
    //         }
    //     } else {
    //         this.currentValue = 0
    //     }
    // }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldSmallint)) {
    //         this.slider.currentValue = this.currentValue
    //     } else {
    //         this.slider.currentValue = 0
    //         this.slider.Enabled = false
    //     }
    // }
    
    // sliderMouseDown(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.selectedItemIndex = kItemSlider
    //     this.slider.hasUnofficialFocus = true
    //     this.currentValueWhileSliding = this.slider.currentValue
    //     this.Invalidate()
    //     if (!this.Focused()) {
    //         this.SetFocus()
    //     }
    // }
    
    // sliderMouseMove(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.currentValueWhileSliding = this.slider.currentValue
    //     this.Invalidate()
    // }
    
    // sliderMouseUp(Sender: TObject): void {
    //     if (this.plant !== null) {
    //         this.currentValue = this.slider.currentValue
    //         umain.MainForm.doCommand(updcom.PdChangeSmallintValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
    //         this.updateDisplay()
    //         this.Invalidate()
    //     } else {
    //         this.slider.currentValue = 0
    //         this.slider.Enabled = false
    //     }
    // }
    
    // sliderKeyDown(sender: TObject): void {
    //     this.sliderMouseUp(sender)
    // }
    
    // maxWidth(): int {
    //     let result = 0
    //     result = uppanel.kLeftRightGap * 2 + intMax(this.labelWidth, this.minScaleWidthWithBounds())
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let widthForLongestWord: int
    //     let widthWithBounds: int
    //     let widthWithoutBounds: int
        
    //     widthForLongestWord = uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth
    //     widthWithBounds = this.minScaleWidthWithBounds()
    //     widthWithoutBounds = this.minScaleWidthWithoutBounds()
    //     result = -1
    //     if (requestedWidth < widthForLongestWord) {
    //         result = widthForLongestWord
    //     }
    //     if (requestedWidth < widthWithBounds) {
    //         this.drawWithoutBounds = true
    //         if (requestedWidth < widthWithoutBounds) {
    //             result = intMax(result, widthWithoutBounds)
    //         }
    //     } else {
    //         this.drawWithoutBounds = false
    //     }
    //     return result
    // }
    
    // minScaleWidthWithBounds(): int {
    //     let result = 0
    //     let minString: string
    //     let valueString: string
    //     let unitString: string
    //     let maxString: string
        
    //     minString = IntToStr(this.minValue)
    //     valueString = IntToStr(this.currentValue) + "  "
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.unitIndex)
    //     maxString = IntToStr(this.maxValue)
    //     result = this.formTextWidth(minString + valueString + unitString + maxString) + udebug.kBetweenGap * 3
    //     return result
    // }
    
    // minScaleWidthWithoutBounds(): int {
    //     let result = 0
    //     let valueString: string
    //     let unitString: string
        
    //     valueString = IntToStr(this.currentValue) + "  "
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.unitIndex)
    //     result = this.formTextWidth(valueString + unitString) + udebug.kBetweenGap
    //     return result
    // }
    
    // uncollapsedHeight(): int {
    //     let result = 0
    //     result = this.collapsedHeight() + this.textHeight + uppanel.kTopBottomGap
    //     return result
    // }
    
    // resizeElements(): void {
    //     this.paint()
    //     this.slider.Left = this.minTextRect.Right + uppanel.kSliderSpaceGap
    //     this.slider.Top = this.collapsedHeight() + this.textHeight / 2 - this.slider.Height / 2
    //     this.slider.Width = intMax(0, this.maxTextRect.Left - this.minTextRect.Right - uppanel.kSliderSpaceGap * 2)
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.slider.Enabled)) {
    //         result = kItemSlider
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // paint(): void {
    //     let Rect: TRect
    //     let minString: string
    //     let valueString: string
    //     let maxString: string
    //     let unitString: string
        
    //     if (delphi_compatability.Application.terminated) {
    //         return
    //     }
    //     if ((this.selectedItemIndex === kItemSlider)) {
    //         // ask slider to update itself based on whether it is selected 
    //         this.slider.hasUnofficialFocus = true
    //     } else {
    //         this.slider.hasUnofficialFocus = false
    //     }
    //     PdParameterPanel.prototype.paint.call(this)
    //     this.slider.Visible = !this.param.collapsed
    //     if ((this.param.collapsed)) {
    //         this.drawExtraValueCaptionWithString(IntToStr(this.currentValue), uunits.UnitStringForEnum(this.param.unitSet, this.unitIndex))
    //         return
    //     }
    //     Rect = this.GetClientRect()
    //     minString = IntToStr(this.minValue)
    //     if (this.slider.dragging) {
    //         valueString = IntToStr(this.currentValueWhileSliding)
    //     } else {
    //         valueString = IntToStr(this.currentValue)
    //     }
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.unitIndex)
    //     maxString = IntToStr(this.maxValue)
    //     this.valueTextRect.Left = uppanel.kLeftRightGap
    //     this.valueTextRect.Right = this.valueTextRect.Left + this.Canvas.TextWidth(valueString)
    //     this.valueTextRect.Top = this.collapsedHeight() + 1
    //     this.valueTextRect.Bottom = this.valueTextRect.Top + this.textHeight
    //     this.unitTextRect = this.valueTextRect
    //     this.unitTextRect.Left = this.valueTextRect.Right + 5
    //     this.unitTextRect.Right = this.unitTextRect.Left + this.Canvas.TextWidth(unitString)
    //     this.minTextRect = this.valueTextRect
    //     this.minTextRect.Left = this.unitTextRect.Right + 5
    //     this.minTextRect.Right = this.minTextRect.Left + this.Canvas.TextWidth(minString)
    //     this.maxTextRect = this.valueTextRect
    //     this.maxTextRect.Right = Rect.right - uppanel.kLeftRightGap
    //     this.maxTextRect.Left = this.maxTextRect.Right - this.Canvas.TextWidth(maxString)
    //     this.drawText(minString, this.minTextRect, false, false, true)
    //     this.drawText(valueString, this.valueTextRect, !this.readOnly, (this.selectedItemIndex === kItemValueText), false)
    //     this.drawText(unitString, this.unitTextRect, false, false, false)
    //     this.drawText(maxString, this.maxTextRect, false, false, true)
    // }

    view() {
        return m("div", "PdSmallintParameterPanel UNFINISHED")
    }
    
}

