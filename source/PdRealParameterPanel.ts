// unit upp_rea

import * as m from "mithril"
import { float, int, short } from "./common"
import { TRect } from "./TRect"
import { PdParameterPanel } from "./PdParameterPanel"
import { FieldType } from "./PdParameter"
import { TransferDirection } from "./PdPlant"
import { PdChangeRealValueCommand } from "./updcom"

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
const kItemSlider = 1
const kItemValueText = 2
const kItemUnitText = 3

export class PdRealParameterPanel extends PdParameterPanel {
    currentValue: float = 0.0
    currentValueWhileSliding: float = 0.0
    minValue: float = 0.0
    maxValue: float = 0.0
    // slider: KfSlider = new KfSlider()
    currentUnitIndex: int = 0
    valueTextRect: TRect = new TRect()
    unitTextRect: TRect = new TRect()
    minTextRect: TRect = new TRect()
    maxTextRect: TRect = new TRect()
    drawWithoutBounds: boolean = false
    arrayIndex: short = 0
    
    // initialize(): void {
    //     //assuming slider will be deleted automatically by owner - self - otherwise would have destructor
    //     this.slider = usliders.KfSlider().create(this)
    //     this.slider.Parent = this
    //     this.slider.FOnMouseDown = this.sliderMouseDown
    //     this.slider.FOnMouseMove = this.sliderMouseMove
    //     this.slider.FOnMouseUp = this.sliderMouseUp
    //     this.slider.FOnKeyDown = this.sliderKeyDown
    //     // make it a percentage move 
    //     this.slider.maxValue = 100
    //     this.slider.minValue = 0
    //     this.slider.readOnly = this.param.readOnly
    //     this.slider.useDefaultSizeAndDraggerSize()
    //     this.arrayIndex = uparams.kNotArray
    //     if (udomain.domain.options.useMetricUnits) {
    //         this.currentUnitIndex = this.param.unitMetric
    //     } else {
    //         this.currentUnitIndex = this.param.unitEnglish
    //     }
    //     this.minValue = this.param.lowerBound()
    //     this.maxValue = this.param.upperBound()
    // }
    
    // adjustValue(): void {
    //     let newString: ansistring
    //     let oldValueInCurrentUnit: float
    //     let newValue: float
    //     let newValueInPlantUnit: float
    //     let oldString: string
    //     let prompt: string
    //     let nameString: string
    //     let unitString: string
    //     let minString: string
    //     let maxString: string
    //     let outOfRange: boolean
        
    //     oldValueInCurrentUnit = this.toCurrentUnit(this.currentValue)
    //     newString = usupport.digitValueString(oldValueInCurrentUnit)
    //     oldString = newString
    //     nameString = UNRESOLVED.copy(this.Caption, 1, 30)
    //     if (len(nameString) === 30) {
    //         nameString = nameString + "..."
    //     }
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.currentUnitIndex)
    //     minString = usupport.digitValueString(this.toCurrentUnit(this.minValue))
    //     maxString = usupport.digitValueString(this.toCurrentUnit(this.maxValue))
    //     prompt = "Type a new value."
    //     if (InputQuery("Enter value", prompt, newString)) {
    //         if ((newString !== oldString) && (usupport.boundForString(newString, this.param.fieldType, newValue))) {
    //             newValueInPlantUnit = this.toPlantUnit(newValue)
    //             outOfRange = this.checkValueAgainstBounds(newValueInPlantUnit)
    //             if (!outOfRange) {
    //                 this.currentValue = newValueInPlantUnit
    //                 umain.MainForm.doCommand(updcom.PdChangeRealValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, this.arrayIndex, this.param.regrow))
    //                 this.updateDisplay()
    //                 this.Invalidate()
    //             }
    //         }
    //     }
    // }
    
    // toPlantUnit(value: float): float {
    //     let result = 0.0
    //     result = uunits.Convert(this.param.unitSet, this.currentUnitIndex, this.param.unitModel, value)
    //     return result
    // }
    
    // toCurrentUnit(value: float): float {
    //     let result = 0.0
    //     result = uunits.Convert(this.param.unitSet, this.param.unitModel, this.currentUnitIndex, value)
    //     return result
    // }
    
    // checkValueAgainstBounds(aValue: float): boolean {
    //     let result = false
    //     result = (aValue < this.minValue) || (aValue > this.maxValue)
    //     return result
    // }
    
    // selectNextUnitInSet(shift: boolean, ctrl: boolean): void {
    //     if (shift) {
    //         this.currentUnitIndex = uunits.GetPreviousUnitEnumInUnitSet(this.param.unitSet, this.currentUnitIndex)
    //     } else {
    //         this.currentUnitIndex = uunits.GetNextUnitEnumInUnitSet(this.param.unitSet, this.currentUnitIndex)
    //     }
    //     this.updateCurrentValue(-1)
    //     this.updateDisplay()
    //     this.Invalidate()
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
    //     } else if (delphi_compatability.PtInRect(this.unitTextRect, thePoint)) {
    //         this.selectedItemIndex = kItemUnitText
    //         this.Invalidate()
    //         this.selectNextUnitInSet(delphi_compatability.TShiftStateEnum.ssShift in Shift, delphi_compatability.TShiftStateEnum.ssCtrl in Shift)
    //     }
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     if (this.slider.Enabled && !this.slider.readOnly) {
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
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     if ((key === delphi_compatability.VK_RETURN)) {
    //         switch (this.selectedItemIndex) {
    //             case kItemSlider:
    //                 if (this.slider.Enabled && !this.slider.readOnly) {
    //                     key = this.slider.doKeyDown(sender, key, shift)
    //                 }
    //                 break
    //             case kItemValueText:
    //                 if (this.slider.Enabled && !this.slider.readOnly) {
    //                     this.adjustValue()
    //                 }
    //                 break
    //             case kItemUnitText:
    //                 this.selectNextUnitInSet(delphi_compatability.TShiftStateEnum.ssShift in shift, delphi_compatability.TShiftStateEnum.ssCtrl in shift)
    //                 break
    //         }
    //     }
    //     return key
    // }
    
    // sliderPositionFromValue(value: float): int {
    //     let result = 0
    //     if (this.maxValue - this.minValue === 0.0) {
    //         result = 0
    //     } else if (value <= this.minValue) {
    //         result = 0
    //     } else if (value >= this.maxValue) {
    //         result = 100
    //     } else {
    //         result = intround(100.0 * (value - this.minValue) / (this.maxValue - this.minValue))
    //     }
    //     return result
    // }
    
    // valueFromSliderPosition(): float {
    //     let result = 0.0
    //     let sliderPosition: float
        
    //     sliderPosition = this.slider.currentValue
    //     result = this.minValue + sliderPosition / 100.0 * (this.maxValue - this.minValue)
    //     return result
    // }
    
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     this.slider.Enabled = this.plant !== null
    //     this.slider.readOnly = this.readOnly
    // }
    
    // updatePlantValues(): void {
    //     let oldValue: float
        
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
    
    updateCurrentValue(aFieldIndex: int): void {
        if ((this.plant !== null) && (this.param.fieldType === FieldType.kFieldFloat)) {
            this.currentValue = this.plant.transferField(TransferDirection.kGetField, this.currentValue, this.param.fieldNumber, FieldType.kFieldFloat, this.arrayIndex, false, null)
            if (this.currentValue < this.minValue) {
                this.currentValue = this.minValue
            }
            if (this.currentValue > this.maxValue) {
                this.currentValue = this.maxValue
            }
        } else {
            this.currentValue = 0.0
        }
    }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldFloat)) {
    //         this.slider.currentValue = this.sliderPositionFromValue(this.currentValue)
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
    //     this.currentValueWhileSliding = this.valueFromSliderPosition()
    //     this.Invalidate()
    //     if (!this.Focused()) {
    //         this.SetFocus()
    //     }
    // }
    
    // sliderMouseMove(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.currentValueWhileSliding = this.valueFromSliderPosition()
    //     this.Invalidate()
    // }
    
    // sliderMouseUp(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.currentValue = this.valueFromSliderPosition()
    //     umain.MainForm.doCommand(updcom.PdChangeRealValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, this.arrayIndex, this.param.regrow))
    //     this.Invalidate()
    // }
    
    // sliderKeyDown(Sender: TObject): void {
    //     this.sliderMouseUp(Sender)
    // }
    
    // maxWidth(): int {
    //     let result = 0
    //     result = umath.intMax(uppanel.kLeftRightGap * 2 + this.labelWidth, this.minScaleWidthWithBounds(this.param.unitSet, this.param.unitModel, this.minValue, this.maxValue))
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let widthForLongestWord: int
    //     let widthWithBounds: int
    //     let widthWithoutBounds: int
        
    //     // 1. test if width given is less than labelWidth.
    //     //       if not, move on
    //     //       if so, test if width given is less than width of longest full word in labelWidth.
    //     //         if not, move on
    //     //         if so, give back width of longest full word in labelWidth as minWidth.
    //     //    2. test if width given is less than minScaleWidthWithBounds.
    //     //       if not, move on (set flag to draw bounds)
    //     //       if so, test if width given is less than minScaleWidthWithoutBounds.
    //     //         if not, move on (set flag to not draw bounds)
    //     //         if so, give back minScaleWidthWithoutBounds as minWidth.
    //     //  
    //     widthForLongestWord = uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth
    //     widthWithBounds = this.minScaleWidthWithBounds(this.param.unitSet, this.param.unitModel, this.minValue, this.maxValue)
    //     widthWithoutBounds = this.minScaleWidthWithoutBounds(this.param.unitSet, this.param.unitModel)
    //     result = -1
    //     if (requestedWidth < widthForLongestWord) {
    //         result = widthForLongestWord
    //     }
    //     if (requestedWidth < widthWithBounds) {
    //         this.drawWithoutBounds = true
    //         if (requestedWidth < widthWithoutBounds) {
    //             result = umath.intMax(result, widthWithoutBounds)
    //         }
    //     } else {
    //         this.drawWithoutBounds = false
    //     }
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
    //     this.slider.Width = umath.intMax(0, this.maxTextRect.Left - this.minTextRect.Right - uppanel.kSliderSpaceGap * 2)
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.plant !== null)) {
    //         result = kItemUnitText
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // nextSelectedItemIndex(goForward: boolean): int {
    //     let result = 0
    //     result = uppanel.kItemNone
    //     switch (this.selectedItemIndex) {
    //         case uppanel.kItemNone:
    //             result = this.selectedItemIndex
    //             break
    //         case uppanel.kItemLabel:
    //             if (goForward) {
    //                 result = kItemValueText
    //             } else {
    //                 result = uppanel.kItemNone
    //             }
    //             break
    //         case kItemSlider:
    //             if (goForward) {
    //                 result = uppanel.kItemNone
    //             } else {
    //                 result = kItemUnitText
    //             }
    //             break
    //         case kItemValueText:
    //             if (goForward) {
    //                 result = kItemUnitText
    //             } else {
    //                 result = uppanel.kItemLabel
    //             }
    //             break
    //         case kItemUnitText:
    //             if (goForward) {
    //                 result = kItemSlider
    //             } else {
    //                 result = kItemValueText
    //             }
    //             break
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
    //         this.drawExtraValueCaptionWithString(usupport.digitValueString(this.toCurrentUnit(this.currentValue)), uunits.UnitStringForEnum(this.param.unitSet, this.currentUnitIndex))
    //         return
    //     }
    //     Rect = this.GetClientRect()
    //     minString = usupport.digitValueString(this.toCurrentUnit(this.minValue))
    //     maxString = usupport.digitValueString(this.toCurrentUnit(this.maxValue))
    //     if (this.slider.dragging) {
    //         valueString = usupport.digitValueString(this.toCurrentUnit(this.currentValueWhileSliding))
    //     } else {
    //         valueString = usupport.digitValueString(this.toCurrentUnit(this.currentValue))
    //     }
    //     unitString = uunits.UnitStringForEnum(this.param.unitSet, this.currentUnitIndex)
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
    //     this.drawText(unitString, this.unitTextRect, true, (this.selectedItemIndex === kItemUnitText), false)
    //     this.drawText(maxString, this.maxTextRect, false, false, true)
    // }

    oninit(vnode: any) {
        super.oninit(vnode)
        this.minValue = this.param.lowerBound()
        this.maxValue = this.param.upperBound()
        this.updateCurrentValue(-1)
    }

    view() {
        this.updateCurrentValue(-1)
        return this.viewFrame(
            m("div", 
                m("input[type=range].ml2", {
                    min: this.minValue,
                    max: this.maxValue,
                    value: this.currentValue, 
                    oninput: (event: any) => {
                        this.currentValue = parseInt(event.target.value)
                        // TODO: PDF fix to use MainForm command list
                        // umain.MainForm.doCommand(updcom.PdChangeRealValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
                        const aList = [this.plant]
                        const aNewValue = this.currentValue
                        const aFieldNumber = this.param.fieldNumber
                        const anArrayIndex = 0
                        const aRegrow = true
                        new PdChangeRealValueCommand(aList, aNewValue, aFieldNumber, anArrayIndex, aRegrow).doCommand()
                    }
                }),
                m("span.ml2", this.currentValue)
            )
        )
    }
    
}

