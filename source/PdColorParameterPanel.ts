// unit upp_col

import * as m from "mithril"
import { int } from "./common"
import { FieldType, kNotArray } from "./PdParameter"
import { PdParameterPanel } from "./PdParameterPanel"
import { TransferDirection } from "./PdPlant"
import { TRect } from "./TRect"
import { colorForRGB, ColorMap, convertColorNoCache, rgbForColor } from "./KfDrawingSurface"
import { PdChangeColorValueCommand } from "./updcom"

// from conversion_common import *
// import ubmpsupport
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
const kItemColorRect = 1
const kItemRedSlider = 2
const kItemGreenSlider = 3
const kItemBlueSlider = 4
const kColorRectSize = 40
const kMinSliderLength = 30

export class PdColorParameterPanel extends PdParameterPanel {
    currentColor: number = 0 // TColorRef = new TColorRef()
    // colorWhileDragging: TColorRef = new TColorRef()
    // redSlider: KfSlider = new KfSlider()
    // greenSlider: KfSlider = new KfSlider()
    // blueSlider: KfSlider = new KfSlider()
    // colorRect: TRect = new TRect()
    
    // initialize(): void {
    //     //assuming sliders will be deleted automatically by owner - self - otherwise would have destructor
    //     this.redSlider = usliders.KfSlider().create(this)
    //     this.initSlider(this.redSlider)
    //     this.greenSlider = usliders.KfSlider().create(this)
    //     this.initSlider(this.greenSlider)
    //     this.blueSlider = usliders.KfSlider().create(this)
    //     this.initSlider(this.blueSlider)
    //     this.OnMouseUp = this.doMouseUp
    // }
    
    // initSlider(slider: KfSlider): void {
    //     slider.Parent = this
    //     slider.FOnMouseDown = this.sliderMouseDown
    //     slider.FOnMouseMove = this.sliderMouseMove
    //     slider.FOnMouseUp = this.sliderMouseUp
    //     slider.FOnKeyDown = this.sliderKeyDown
    //     slider.readOnly = this.param.readOnly
    //     slider.useDefaultSizeAndDraggerSize()
    //     slider.minValue = 0
    //     slider.maxValue = 255
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     if ((this.plant !== null) && (!this.readOnly)) {
    //         switch (key) {
    //             case delphi_compatability.VK_HOME:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_END:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_DOWN:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_LEFT:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_UP:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_RIGHT:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_NEXT:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_PRIOR:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //             case delphi_compatability.VK_RETURN:
    //                 switch (this.selectedItemIndex) {
    //                     case kItemRedSlider:
    //                         // process slider arrow keys first 
    //                         key = this.redSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemGreenSlider:
    //                         key = this.greenSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemBlueSlider:
    //                         key = this.blueSlider.doKeyDown(sender, key, shift)
    //                         return key
    //                         break
    //                     case kItemColorRect:
    //                         this.doMouseUp(this, delphi_compatability.TMouseButton.mbLeft, {}, this.colorRect.Left + 1, this.colorRect.Top + 1)
    //                         break
    //                 }
    //                 break
    //         }
    //     }
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     return key
    // }
    
    // doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
    //     let newColor: TColorRef
        
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseUp.call(this, Sender, Button, Shift, X, Y)
    //     if ((this.plant === null) || (this.readOnly)) {
    //         return
    //     }
    //     thePoint = point(X, Y)
    //     if (delphi_compatability.PtInRect(this.colorRect, thePoint)) {
    //         this.selectedItemIndex = kItemColorRect
    //         newColor = udomain.domain.getColorUsingCustomColors(this.currentColor)
    //         if (newColor !== this.currentColor) {
    //             this.currentColor = newColor
    //             umain.MainForm.doCommand(updcom.PdChangeColorValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentColor, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
    //             this.updateDisplay()
    //             this.Invalidate()
    //         }
    //     }
    // }
    
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     this.redSlider.Enabled = this.plant !== null
    //     this.greenSlider.Enabled = this.plant !== null
    //     this.blueSlider.Enabled = this.plant !== null
    //     this.redSlider.readOnly = this.readOnly
    //     this.greenSlider.readOnly = this.readOnly
    //     this.blueSlider.readOnly = this.readOnly
    // }
    
    // updatePlantValues(): void {
    //     let oldColor: TColorRef
        
    //     if (this.plant === null) {
    //         return
    //     }
    //     if (this.param.collapsed) {
    //         return
    //     }
    //     oldColor = this.currentColor
    //     this.updateCurrentValue(-1)
    //     if (oldColor !== this.currentColor) {
    //         this.updateDisplay()
    //         this.Invalidate()
    //     }
    // }
    
    updateCurrentValue(aFieldIndex: int): void {
        if ((this.plant !== null) && (this.param.fieldType === FieldType.kFieldColor)) {
            this.currentColor = this.plant.transferField(TransferDirection.kGetField, this.currentColor, this.param.fieldNumber, FieldType.kFieldColor, kNotArray, false, null)
        } else {
            // TODO: PDF Fix this: this.disableSliders()
        }
    }
    
    // disableSliders(): void {
    //     this.redSlider.currentValue = 0
    //     this.redSlider.Enabled = false
    //     this.greenSlider.currentValue = 0
    //     this.greenSlider.Enabled = false
    //     this.blueSlider.currentValue = 0
    //     this.blueSlider.Enabled = false
    // }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldColor)) {
    //         this.redSlider.currentValue = UNRESOLVED.getRValue(this.currentColor)
    //         this.greenSlider.currentValue = UNRESOLVED.getGValue(this.currentColor)
    //         this.blueSlider.currentValue = UNRESOLVED.getBValue(this.currentColor)
    //     } else {
    //         this.disableSliders()
    //     }
    // }
    
    // sliderMouseDown(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.colorWhileDragging = usupport.support_rgb(this.redSlider.currentValue, this.greenSlider.currentValue, this.blueSlider.currentValue)
    //     if (Sender === this.redSlider) {
    //         this.selectedItemIndex = kItemRedSlider
    //     } else if (Sender === this.greenSlider) {
    //         this.selectedItemIndex = kItemGreenSlider
    //     } else if (Sender === this.blueSlider) {
    //         this.selectedItemIndex = kItemBlueSlider
    //     }
    //     if (!this.Focused()) {
    //         this.SetFocus()
    //     } else {
    //         this.Invalidate()
    //     }
    //     // paint method updates unofficial focus flags in sliders 
    // }
    
    // sliderMouseMove(Sender: TObject): void {
    //     if (this.plant !== null) {
    //         this.colorWhileDragging = usupport.support_rgb(this.redSlider.currentValue, this.greenSlider.currentValue, this.blueSlider.currentValue)
    //         // don't make change permanent yet, not until mouse up 
    //         this.Repaint()
    //     } else {
    //         this.disableSliders()
    //     }
    // }
    
    // sliderMouseUp(Sender: TObject): void {
    //     if (this.plant !== null) {
    //         this.currentColor = usupport.support_rgb(this.redSlider.currentValue, this.greenSlider.currentValue, this.blueSlider.currentValue)
    //         umain.MainForm.doCommand(updcom.PdChangeColorValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentColor, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
    //         this.updateDisplay()
    //         this.Invalidate()
    //     } else {
    //         this.disableSliders()
    //     }
    // }
    
    // sliderKeyDown(sender: TOBject): void {
    //     this.sliderMouseUp(sender)
    // }
    
    // maxWidth(): int {
    //     let result = 0
    //     result = uppanel.kLeftRightGap * 2 + umath.intMax(this.labelWidth, uppanel.kEditMaxWidth)
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let minAllowed: int
        
    //     minAllowed = uppanel.kLeftRightGap * 2 + umath.intMax(this.longestLabelWordWidth, kColorRectSize + kMinSliderLength + udebug.kBetweenGap)
    //     if (requestedWidth > minAllowed) {
    //         result = -1
    //     } else {
    //         result = minAllowed
    //     }
    //     return result
    // }
    
    // uncollapsedHeight(): int {
    //     let result = 0
    //     result = this.collapsedHeight() + umath.intMax(this.redSlider.Height, this.textHeight) * 3 + udebug.kBetweenGap * 2 + uppanel.kTopBottomGap * 3
    //     return result
    // }
    
    // resizeElements(): void {
    //     this.redSlider.Left = uppanel.kLeftRightGap + kColorRectSize + this.formTextWidth("W") + uppanel.kLeftRightGap * 2
    //     this.redSlider.Width = umath.intMax(0, this.Width - this.redSlider.Left - uppanel.kLeftRightGap)
    //     this.redSlider.Top = this.collapsedHeight() + uppanel.kTopBottomGap + this.Canvas.TextHeight("r") / 2 - this.redSlider.Height / 2
    //     this.greenSlider.Left = this.redSlider.Left
    //     this.greenSlider.Width = this.redSlider.Width
    //     this.greenSlider.Top = this.redSlider.Top + this.textHeight + this.Canvas.TextHeight("r") / 2 - this.greenSlider.Height / 2
    //     this.blueSlider.Left = this.redSlider.Left
    //     this.blueSlider.Width = this.redSlider.Width
    //     this.blueSlider.Top = this.greenSlider.Top + this.textHeight + this.Canvas.TextHeight("r") / 2 - this.blueSlider.Height / 2
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.redSlider.Enabled)) {
    //         result = kItemBlueSlider
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // paint(): void {
    //     let aRect: TRect
    //     let rTextRect: TRect
    //     let gTextRect: TRect
    //     let bTextRect: TRect
    //     let collapsedColorRect: TRect

    //     // ask sliders to update themselves based on whether they are selected 
    //     this.redSlider.hasUnofficialFocus = (this.selectedItemIndex === kItemRedSlider)
    //     this.greenSlider.hasUnofficialFocus = (this.selectedItemIndex === kItemGreenSlider)
    //     this.blueSlider.hasUnofficialFocus = (this.selectedItemIndex === kItemBlueSlider)
    //     PdParameterPanel.prototype.paint.call(this)
    //     aRect = this.GetClientRect()
    //     if ((this.param.collapsed) && (this.plant !== null)) {
    //         collapsedColorRect.Left = aRect.Left + uppanel.kLeftRightGap + uppanel.kArrowPictureSize + uppanel.kOverridePictureSize + udebug.kBetweenGap + this.Canvas.TextWidth(this.Caption) + uppanel.kLeftRightGap
    //         collapsedColorRect.Right = collapsedColorRect.Left + this.textHeight * 2
    //         collapsedColorRect.Top = aRect.Top + 2
    //         collapsedColorRect.Bottom = collapsedColorRect.Top + this.textHeight
    //         UNRESOLVED.inflateRect(collapsedColorRect, -2, -2)
    //         this.fillRectWithColor(collapsedColorRect, this.currentColor)
    //         return
    //     }
    //     rTextRect.Left = aRect.Left + uppanel.kLeftRightGap + kColorRectSize + uppanel.kLeftRightGap * 2
    //     rTextRect.Right = rTextRect.Left + this.Canvas.TextWidth("W")
    //     rTextRect.Top = this.collapsedHeight() + uppanel.kTopBottomGap
    //     rTextRect.Bottom = rTextRect.Top + this.textHeight
    //     gTextRect = rTextRect
    //     gTextRect.Top = rTextRect.Bottom + udebug.kBetweenGap
    //     gTextRect.Bottom = gTextRect.Top + this.textHeight
    //     bTextRect = rTextRect
    //     bTextRect.Top = gTextRect.Bottom + udebug.kBetweenGap
    //     bTextRect.Bottom = bTextRect.Top + this.textHeight
    //     this.colorRect.Left = uppanel.kLeftRightGap * 2
    //     this.colorRect.Right = rTextRect.Left - uppanel.kLeftRightGap * 2
    //     this.colorRect.Top = this.collapsedHeight() + uppanel.kTopBottomGap
    //     this.colorRect.Bottom = this.uncollapsedHeight() - uppanel.kTopBottomGap * 2
    //     this.drawText("r", rTextRect, false, false, false)
    //     this.drawText("g", gTextRect, false, false, false)
    //     this.drawText("b", bTextRect, false, false, false)
    //     if ((this.redSlider.dragging) || (this.greenSlider.dragging) || (this.blueSlider.dragging)) {
    //         this.fillRectWithColor(this.colorRect, this.colorWhileDragging)
    //     } else if (this.plant === null) {
    //         this.fillRectWithColor(this.colorRect, UNRESOLVED.clBtnFace)
    //     } else {
    //         this.fillRectWithColor(this.colorRect, this.currentColor)
    //     }
    //     this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //     if ((this.selectedItemIndex !== kItemColorRect)) {
    //         this.Canvas.Pen.Width = 1
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //     } else {
    //         this.Canvas.Pen.Width = 3
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnHighlight
    //     }
    //     this.Canvas.Pen.Width = 1
    //     this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    //     this.Canvas.Rectangle(this.colorRect.Left - 1, this.colorRect.Top - 1, this.colorRect.Right + 1, this.colorRect.Bottom + 1)
    // }
    
    // fillRectWithColor(aRect: TRect, aColor: TColorRef): void {
    //     let bitmap: TBitmap
        
    //     bitmap = delphi_compatability.TBitmap().Create()
    //     try {
    //         try {
    //             bitmap.Width = usupport.rWidth(aRect)
    //             bitmap.Height = usupport.rHeight(aRect)
    //         } catch (e) {
    //             bitmap.Width = 1
    //             bitmap.Height = 1
    //         }
    //         ubmpsupport.setPixelFormatBasedOnScreenForBitmap(bitmap)
    //         bitmap.Canvas.Brush.Color = aColor
    //         bitmap.Canvas.FillRect(Rect(0, 0, bitmap.Width, bitmap.Height))
    //         ubmpsupport.copyBitmapToCanvas(bitmap, this.Canvas, aRect)
    //     } finally {
    //         bitmap.free
    //     }
    // }
    
    oninit(vnode: any) {
        super.oninit(vnode)
        this.updateCurrentValue(-1)
    }

    view() {
        this.updateCurrentValue(-1)
        return this.viewFrame(
            m("div", 
                m("div.mt1.mb1.flex",
                    m("div.dib.ml2.mr2.ml2", { style: {
                        width: "1rem",
                        height: "1rem", 
                        background: convertColorNoCache(this.currentColor)
                    }}),
                    m("div.dib", convertColorNoCache( this.currentColor))
                ),
                ["r", "g", "b"].map(colorComponent =>
                    m("div.ml2.mb1", 
                        m("div.dib.w1", colorComponent),
                        m("input[type=range]", {
                            min: 0,
                            max: 255,
                            value: rgbForColor(this.currentColor)[colorComponent], 
                            oninput: (event: any) => {
                                const rgb: ColorMap = rgbForColor(this.currentColor)
                                rgb[colorComponent] = parseInt(event.target.value)
                                this.currentColor = colorForRGB(rgb)
                                // TODO: PDF fix to use MainForm command list
                                // umain.MainForm.doCommand(updcom.PdChangeSmallintValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValue, this.param.fieldNumber, uparams.kNotArray, this.param.regrow))
                                const aList = [this.plant]
                                const aNewValue = this.currentColor
                                const aFieldNumber = this.param.fieldNumber
                                const anArrayIndex = 0
                                const aRegrow = true
                                new PdChangeColorValueCommand(aList, aNewValue, aFieldNumber, anArrayIndex, aRegrow).doCommand()
                            }
                        }),
                        m("span.ml2", rgbForColor(this.currentColor)[colorComponent])
                    )
                )
            )
        )
    }
}

