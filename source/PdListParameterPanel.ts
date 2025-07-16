// unit upp_lis

import * as m from "mithril"
import { int, short } from "./common"
import { FieldType, kNotArray } from "./PdParameter"
import { PdParameterPanel } from "./PdParameterPanel"
import { TransferDirection } from "./PdPlant"
import { TRect } from "./TRect"
import { PdChangeBooleanValueCommand, PdChangeSmallintValueCommand } from "./updcom"
import { PdCommand } from "./PdCommand"

// from conversion_common import *
// import udebug
// import udomain
// import usupport
// import uunits
// import umath
// import updcom
// import umain
// import uppanel
// import uparams
// import uplant
// import delphi_compatability

// const
const kItemFirstChoice = 1
const kMaxNumChoices = 20

export class PdListParameterPanel extends PdParameterPanel {
    hasRadioButtons: boolean = false
    currentChoice: int = 0
    choiceStrings: string[] = []
    choiceRects: TRect[] /* kMaxNumChoices + 1 */ = Array(kMaxNumChoices + 1)
    choiceChecks: boolean[] /* kMaxNumChoices + 1 */ = Array(kMaxNumChoices + 1)
    editEnabled: boolean = false
    
    initialize(): void {
        this.currentChoice = 0
        this.editEnabled = false
        this.choiceStrings = []
        this.hasRadioButtons = this.plant.fillEnumStringList(this.choiceStrings, this.param.fieldNumber, this.hasRadioButtons)
    }
    
    // destroy(): void {
    //     this.choiceStrings.free
    //     this.choiceStrings = null
    //     PdParameterPanel.prototype.destroy.call(this)
    // }
    
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     this.editEnabled = !((this.plant === null) || (this.readOnly))
    // }
    
    // updatePlantValues(): void {
    //     let oldChoice: int
        
    //     if (this.plant === null) {
    //         return
    //     }
    //     if (this.param.collapsed) {
    //         return
    //     }
    //     oldChoice = this.currentChoice
    //     this.updateCurrentValue(-1)
    //     if (!this.hasRadioButtons || (oldChoice !== this.currentChoice)) {
    //         this.updateDisplay()
    //         this.Invalidate()
    //     }
    // }
    
    updateCurrentValue(aFieldIndex: int): void {
        this.choiceStrings = []
        this.hasRadioButtons = this.plant.fillEnumStringList(this.choiceStrings, this.param.fieldNumber, this.hasRadioButtons)
        if ((this.plant === null) || (this.param.fieldType !== FieldType.kFieldEnumeratedList)) {
            this.currentChoice = 0
            this.clearChecks()
            this.editEnabled = false
        } else {
            if (this.hasRadioButtons) {
                this.currentChoice = this.plant.transferField(TransferDirection.kGetField, this.currentChoice, this.param.fieldNumber, FieldType.kFieldSmallint, kNotArray, false, null)
            } else if (this.choiceStrings.length > 0) {
                for (let i = 0; i <= this.choiceStrings.length - 1; i++) {
                    this.choiceChecks[i] = this.plant.transferField(TransferDirection.kGetField, this.choiceChecks[i], this.param.fieldNumber, FieldType.kFieldBoolean, i, false, null)
                }
            }
        }
    }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldEnumeratedList)) {
    //         this.Invalidate()
    //     } else {
    //         this.editEnabled = false
    //     }
    // }
    
    clearChecks(): void {
        let i: short
        
        for (i = 0; i <= kMaxNumChoices; i++) {
            this.choiceChecks[i] = false
        }
    }
    
    // doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let i: int
    //     let thePoint: TPoint
        
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseUp.call(this, Sender, Button, Shift, X, Y)
    //     if ((this.editEnabled)) {
    //         thePoint = Point(X, Y)
    //         if (this.choiceStrings.Count > 0) {
    //             for (i = 0; i <= this.choiceStrings.Count - 1; i++) {
    //                 if (delphi_compatability.PtInRect(this.choiceRects[i], thePoint)) {
    //                     this.setNewValue(i)
    //                     this.selectedItemIndex = kItemFirstChoice + this.currentChoice
    //                     break
    //                 }
    //             }
    //         }
    //         this.Invalidate()
    //     }
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     if ((this.editEnabled) && (key === delphi_compatability.VK_RETURN) && (this.selectedItemIndex >= kItemFirstChoice)) {
    //         this.setNewValue(this.selectedItemIndex - kItemFirstChoice)
    //         this.Invalidate()
    //     }
    //     return key
    // }
    
    setNewValue(index: int): void {
        let command: PdCommand
        const aList = [this.plant] // TODO: PDF umain.MainForm.selectedPlants
        if (this.hasRadioButtons) {
            this.currentChoice = index
            command = new PdChangeSmallintValueCommand(aList, this.currentChoice, this.param.fieldNumber, kNotArray, this.param.regrow)
        } else {
            this.choiceChecks[index] = !this.choiceChecks[index]
            command = new PdChangeBooleanValueCommand(aList, this.choiceChecks[index], this.param.fieldNumber, index, this.param.regrow)
        }
        // TODO: PDF use umain.MainForm.doCommand(
        command.doCommand()
    }
    
    // firstCheckedString(): string {
    //     let result = ""
    //     let i: short
        
    //     result = ""
    //     if (this.choiceStrings.Count > 0) {
    //         for (i = 0; i <= this.choiceStrings.Count - 1; i++) {
    //             if (this.hasRadioButtons) {
    //                 if (this.currentChoice === i) {
    //                     result = this.choiceStrings.Strings[i]
    //                     return result
    //                 }
    //             } else {
    //                 if (this.choiceChecks[i]) {
    //                     result = this.choiceStrings.Strings[i]
    //                     return result
    //                 }
    //             }
    //         }
    //     }
    //     return result
    // }
    
    // maxWidth(): int {
    //     let result = 0
    //     let i: int
    //     let maxWidth: int
        
    //     result = 0
    //     for (i = 0; i <= this.choiceStrings.Count - 1; i++) {
    //         result = umath.intMax(maxWidth, umain.TMainForm(self.Owner).Canvas.TextWidth(this.choiceStrings.Strings[i]))
    //     }
    //     result = umath.intMax(uppanel.kLeftRightGap * 2 + this.labelWidth, +uppanel.kRadioButtonLeftGap + uppanel.kRadioButtonWidth + uppanel.kRadioButtonBeforeTextGap + maxWidth + uppanel.kLeftRightGap)
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let i: int
    //     let longestWidth: int
    //     let minAllowed: int
        
    //     longestWidth = 0
    //     for (i = 0; i <= this.choiceStrings.Count - 1; i++) {
    //         longestWidth = umath.intMax(longestWidth, umain.TMainForm(self.Owner).Canvas.TextWidth(this.choiceStrings.Strings[i]))
    //     }
    //     minAllowed = umath.intMax(uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth, +uppanel.kRadioButtonLeftGap + uppanel.kRadioButtonWidth + uppanel.kRadioButtonBeforeTextGap + longestWidth + uppanel.kLeftRightGap)
    //     if (requestedWidth > minAllowed) {
    //         result = -1
    //     } else {
    //         result = minAllowed
    //     }
    //     return result
    // }
    
    // uncollapsedHeight(): int {
    //     let result = 0
    //     result = this.collapsedHeight() + this.textHeight * this.choiceStrings.Count + uppanel.kTopBottomGap
    //     return result
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.editEnabled)) {
    //         result = kItemFirstChoice + this.choiceStrings.Count - 1
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // resizeElements(): void {
    //     // do nothing 
    // }
    
    // paint(): void {
    //     let i: int
    //     let rect: TRect
    //     let circleRects: TRect[] /* kMaxNumChoices + 1 */
    //     let textRects: TRect[] /* kMaxNumChoices + 1 */
        
    //     if (delphi_compatability.Application.terminated) {
    //         return
    //     }
    //     PdParameterPanel.prototype.paint.call(this)
    //     if ((this.param.collapsed)) {
    //         this.drawExtraValueCaptionWithString(this.firstCheckedString(), "")
    //         return
    //     }
    //     Rect = this.GetClientRect()
    //     if (this.choiceStrings.Count > 0) {
    //         for (i = 0; i <= this.choiceStrings.Count - 1; i++) {
    //             circleRects[i].Left = Rect.left + uppanel.kRadioButtonLeftGap
    //             circleRects[i].Right = circleRects[i].Left + uppanel.kRadioButtonWidth
    //             circleRects[i].Top = Rect.top + this.collapsedHeight() + this.textHeight * i + (this.textHeight / 2 - uppanel.kRadioButtonWidth / 2)
    //             circleRects[i].Bottom = circleRects[i].Top + uppanel.kRadioButtonWidth
    //             textRects[i].Left = Rect.left + uppanel.kRadioButtonLeftGap + uppanel.kRadioButtonWidth + uppanel.kRadioButtonBeforeTextGap
    //             textRects[i].Right = textRects[i].Left + this.Canvas.TextWidth(this.choiceStrings.Strings[i])
    //             textRects[i].Top = Rect.top + this.collapsedHeight() + this.textHeight * i
    //             textRects[i].Bottom = textRects[i].Top + this.textHeight
    //             if (this.hasRadioButtons) {
    //                 this.drawRadioButton((this.currentChoice === i), this.editEnabled, circleRects[i])
    //             } else {
    //                 this.drawCheckBox(this.choiceChecks[i], this.editEnabled, circleRects[i])
    //             }
    //             this.drawText(this.choiceStrings.Strings[i], textRects[i], true, (this.selectedItemIndex === kItemFirstChoice + i) && (this.editEnabled), false)
    //             delphi_compatability.UnionRect(this.choiceRects[i], circleRects[i], textRects[i])
    //         }
    //     }
    // }
    
    // drawRadioButton(value: boolean, enabled: boolean, rect: TRect): void {
    //     let brushColor: TColor
        
    //     brushColor = this.Canvas.Brush.Color
    //     if (value) {
    //         if (enabled) {
    //             this.Canvas.Brush.Color = UNRESOLVED.clBtnText
    //         } else {
    //             this.Canvas.Brush.Color = UNRESOLVED.clBtnShadow
    //         }
    //     } else {
    //         this.Canvas.Brush.Color = UNRESOLVED.clBtnFace
    //     }
    //     if (enabled) {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnText
    //     } else {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //     }
    //     //FIX unresolved WITH expression: Rect
    //     this.Canvas.Ellipse(this.Left, this.Top, UNRESOLVED.right, UNRESOLVED.bottom)
    //     this.Canvas.Brush.Color = brushColor
    //     this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    // }
    
    // drawCheckBox(value: boolean, enabled: boolean, rect: TRect): void {
    //     this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    //     if (enabled) {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnText
    //     } else {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //     }
    //     //FIX unresolved WITH expression: Rect
    //     this.Canvas.Rectangle(this.Left, this.Top, UNRESOLVED.right, UNRESOLVED.bottom)
    //     if (value) {
    //         //FIX unresolved WITH expression: Rect
    //         this.Canvas.MoveTo(this.Left, this.Top)
    //         this.Canvas.LineTo(UNRESOLVED.right, UNRESOLVED.bottom)
    //         this.Canvas.MoveTo(this.Left, UNRESOLVED.bottom)
    //         this.Canvas.LineTo(UNRESOLVED.right, this.Top)
    //     }
    // }
    
    oninit(vnode: any) {
        super.oninit(vnode)
        this.initialize()
        this.updateCurrentValue(-1)
    }

    view() {
        this.updateCurrentValue(-1)
        if (!this.hasRadioButtons) throw new Error("Unfinished support for checkboxes")
        console.log("this.choiceStrings", this.choiceStrings)
        return this.viewFrame(
            m("div",
                this.choiceStrings.map((label, index) =>
                    m("div",
                        m('label.ml2.mr2',
                            m('input.mr1', {
                                type: "radio",
                                // id: label,
                                name: "Field: " + this.param.fieldID + label,
                                checked: index === this.currentChoice,
                                value: label,
                                onchange: () => {
                                    this.currentChoice = index
                                    this.setNewValue(index)
                                }
                            }),
                            label
                        )
                    )
                )
            )
        )
    }
}

