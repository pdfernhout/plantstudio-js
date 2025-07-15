// unit uppanel

import * as m from "mithril"
import { float, int, long, TColor } from "./common"
import { PdParameter } from "./PdParameter"
import { PdPlant, PdPlantUpdateEvent } from "./PdPlant"
import { TRect } from "./TRect"
import { intMax } from "./umath"
import { digitValueString } from "./usupport"

// from conversion_common import *
// import upp_hed
// import udebug
// import udomain
// import usupport
// import uunits
// import umath
// import updcom
// import umain
// import uplant
// import ucollect
// import usection
// import uparams
// import delphi_compatability

// const
const kBetweenGap = 3
const kTopBottomGap = 4
const kLeftRightGap = 6
const kRadioButtonLeftGap = 10
const kRadioButtonWidth = 10
const kRadioButtonBetweenGap = 10
const kRadioButtonBeforeTextGap = 5
const kSliderSpaceGap = 10
const kEditMaxWidth = 100
const kEditMinWidth = 50
const kNotSelectedString = "(not selected)"
const kGraphHeight = 100
const kMaxDisplayDigitsToLeftOfDecimal = 7
const kMaxDisplayDigitsToRightOfDecimal = 6
const kMaxDisplayDigits = 9
const kArrowPictureSize = 13
const kOverridePictureSize = 0
const kItemNone = -1
const kItemLabel = 0



//200;
//150;
//150;
// 13
export class PdParameterPanel {
    plant: PdPlant = new PdPlant()
    param: PdParameter = new PdParameter()
    readOnly: boolean = false
    labelWidth: int = 0
    textHeight: int = 0
    labelRect: TRect = new TRect()
    pictureRect: TRect = new TRect()
    overrideRect: TRect = new TRect()
    wrappedLabelHeight: int = 0
    longestLabelWordWidth: int = 0
    selectedItemIndex: int = 0
    PdParameterPanel.prototype = new TPanel()
    PdParameterPanel.prototype.constructor = PdParameterPanel
    
    create(anOwner: TComponent): void {
        TPanel.prototype.create.call(this, anOwner)
        this.plant = null
        this.ParentFont = true
        this.OnMouseDown = this.doMouseDown
        this.OnMouseMove = this.doMouseMove
        this.OnMouseUp = this.doMouseUp
        this.OnKeyDown = this.doKeyDown
        this.OnEnter = this.doOnEnter
        this.OnExit = this.doOnExit
        this.TabStop = true
        this.Enabled = true
        if (umain.MainForm !== null) {
            this.PopupMenu = umain.MainForm.paramPopupMenu
        }
    }
    
    createForParameter(anOwner: TComponent, aParameter: PdParameter): void {
        this.create(anOwner)
        this.param = aParameter
        this.readOnly = this.param.readOnly
        this.Caption = this.param.getName()
        this.initialize()
        this.updateDisplay()
        this.updateEnabling()
        this.selectedItemIndex = -1
        this.BevelInner = UNRESOLVED.bvRaised
        this.BevelOuter = UNRESOLVED.bvNone
    }
    
    formTextHeight(): long {
        let result = 0
        let theForm: TCustomForm
        let oldSize: int
        
        theForm = UNRESOLVED.getParentForm(this)
        if (theForm === null) {
            //default
            result = 16
        } else if (theForm.Canvas === null) {
            //default
            result = 16
        } else {
            result = 16
            theForm.Canvas.Font = theForm.Font
            result = theForm.Canvas.TextHeight("W")
        }
        return result
    }
    
    formTextWidth(aString: string): long {
        let result = 0
        let theForm: TCustomForm
        
        theForm = UNRESOLVED.getParentForm(this)
        if (theForm === null) {
            //default
            result = 50
        } else if (theForm.Canvas === null) {
            //default
            result = 50
        } else {
            result = len(aString) * 8
            theForm.Canvas.Font = theForm.Font
            result = theForm.Canvas.TextWidth(aString)
        }
        return result
    }
    
    calculateTextDimensions(): void {
        // use form canvas for this because when component is first created, doesn't know what font it has 
        this.textHeight = this.formTextHeight()
        this.labelWidth = this.formTextWidth(usupport.trimLeftAndRight(this.Caption))
        this.longestLabelWordWidth = this.calculateLongestLabelWordWidth()
    }
    
    doMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if (!this.Focused()) {
            this.SetFocus()
        }
        if (X < this.pictureRect.Right) {
            this.collapseOrExpand(Y)
        }
        if (!this.Focused()) {
            this.SetFocus()
        }
        if (this.param !== null) {
            if (this.param.collapsed) {
                this.selectedItemIndex = kItemLabel
            }
        }
    }
    
    doMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        // subclasses can override 
    }
    
    doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        // subclasses can override 
    }
    
    doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
        let Form: TCustomForm
        
        if ((key === delphi_compatability.VK_TAB)) {
            if (shift === {delphi_compatability.TShiftStateEnum.ssShift, }) {
                // subclasses should override and respond to enter events when different items are selected 
                // subclasses should call inherited 
                this.tabThroughItems(false)
            } else {
                this.tabThroughItems(true)
            }
            if (this.selectedItemIndex === kItemNone) {
                Form = UNRESOLVED.getParentForm(this)
                if (Form !== null) {
                    if (shift === {delphi_compatability.TShiftStateEnum.ssShift, }) {
                        umain.TMainForm(Form).backTabbingInParametersPanel = true
                        //previous
                        Form.Perform(UNRESOLVED.wm_NextDlgCtl, 1, 0)
                    } else {
                        Form.Perform(UNRESOLVED.wm_NextDlgCtl, 0, 0)
                    }
                }
            }
        } else if ((key === delphi_compatability.VK_RETURN) && (this.selectedItemIndex === kItemLabel)) {
            //give it a y as if the label was clicked on
            this.collapseOrExpand(0)
        }
        return key
    }
    
    maxSelectedItemIndex(): int {
        let result = 0
        // subclasses should override 
        result = 0
        return result
    }
    
    tabThroughItems(goForward: boolean): void {
        // subclasses need not override this if they override maxSelectedItemIndex 
        this.selectedItemIndex = this.nextSelectedItemIndex(goForward)
        if (this.selectedItemIndex > this.maxSelectedItemIndex()) {
            this.selectedItemIndex = kItemNone
        }
        this.Invalidate()
    }
    
    nextSelectedItemIndex(goForward: boolean): int {
        let result = 0
        if (goForward) {
            result = this.selectedItemIndex + 1
        } else {
            result = this.selectedItemIndex - 1
        }
        return result
    }
    
    WMGetDlgCode(message: TWMGetDlgCode): void {
        TPanel.prototype.WMGetDlgCode.call(this)
        // want arrows allows us to pass arrow keys on to slider or combo box 
        message.Result = message.Result || delphi_compatability.DLGC_WANTTAB || delphi_compatability.DLGC_WANTARROWS
    }
    
    initialize(): void {
        // sublasses can override 
    }
    
    doOnEnter(sender: TObject): void {
        umain.TMainForm(this.Owner).enteringAParameterPanel(this)
        if (umain.TMainForm(this.Owner).backTabbingInParametersPanel) {
            this.selectedItemIndex = this.maxSelectedItemIndex()
            umain.TMainForm(this.Owner).backTabbingInParametersPanel = false
        }
        if (this.selectedItemIndex === kItemNone) {
            this.selectedItemIndex = kItemLabel
        }
        this.Invalidate()
    }
    
    doOnExit(sender: TObject): void {
        umain.TMainForm(this.Owner).leavingAParameterPanel(this)
        this.selectedItemIndex = kItemNone
        this.Invalidate()
    }
    
    //plant has changed
    updatePlant(newPlant: PdPlant): void {
        if (this.plant !== newPlant) {
            this.plant = newPlant
            this.updateEnabling()
            // -1 means update all 
            this.updateCurrentValue(-1)
            this.updateDisplay()
            this.Invalidate()
        }
    }
    
    updatePlantValues(): void {
        // subclasses should override 
    }
    
    updateEnabling(): void {
        // subclasses should call this when they do their enabling 
        this.Enabled = (this.plant !== null)
    }
    
    updateCurrentValue(aFieldIndex: int): void {
        // subclasses may override 
    }
    
    updateFromUpdateEventList(updateList: TListCollection): void {
        let i: long
        let updateEvent: PdPlantUpdateEvent
        let shouldUpdate: boolean
        
        if (updateList.Count <= 0) {
            return
        }
        if (this.plant === null) {
            return
        }
        shouldUpdate = false
        updateEvent = null
        for (i = 0; i <= updateList.Count - 1; i++) {
            updateEvent = uplant.PdPlantUpdateEvent(updateList.Items[i])
            if (updateEvent === null) {
                continue
            }
            if (updateEvent.plant === null) {
                continue
            }
            if ((updateEvent.plant === this.plant) && (updateEvent.fieldID === this.param.fieldNumber)) {
                shouldUpdate = true
                break
            }
        }
        if (shouldUpdate && (updateEvent !== null)) {
            // could put check in descendents to only update if value is different from current 
            this.updateCurrentValue(updateEvent.fieldIndex)
            this.updateDisplay()
            this.Invalidate()
        }
    }
    
    updateDisplay(): void {
        // subclasses should override 
    }
    
    minWidth(requestedWidth: int): int {
        let result = 0
        // subclasses must override 
        result = 0
        return result
    }
    
    maxWidth(): int {
        let result = 0
        // subclasses must override 
        result = 0
        return result
    }
    
    uncollapsedHeight(): int {
        let result = 0
        // subclasses must override 
        result = 0
        return result
    }
    
    resizeElements(): void {
        // subclasses must override 
    }
    
    editHeight(): int {
        let result = 0
        result = this.textHeight + 8
        return result
    }
    
    calculateLongestLabelWordWidth(): int {
        let result = 0
        let i: int
        let lastSpace: int
        let maxLength: int
        
        // o: xxxxx xxxxxxxxx xx 
        lastSpace = 3
        maxLength = 0
        for (i = 4; i <= len(this.Caption); i++) {
            if ((this.Caption[i] === " ") || (i === len(this.Caption))) {
                if (i - lastSpace > maxLength) {
                    maxLength = i - lastSpace
                }
                lastSpace = i
            }
        }
        result = this.formTextWidth("w") * maxLength
        return result
    }
    
    calculateHeight(): void {
        let fullRect: TRect
        
        fullRect = this.GetClientRect()
        this.labelRect.Left = fullRect.Left + kLeftRightGap + kArrowPictureSize + kOverridePictureSize + kBetweenGap
        this.labelRect.Right = fullRect.Right - kLeftRightGap
        this.labelRect.Top = fullRect.Top + 2
        this.labelRect.Bottom = this.labelRect.Top + this.textHeight
        this.wrappedLabelHeight = this.measureText(this.Caption, this.labelRect)
        if (this.param !== null) {
            if (this.param.collapsed) {
                this.Height = this.collapsedHeight()
            } else {
                this.Height = this.uncollapsedHeight()
            }
        }
    }
    
    collapseOrExpand(y: int): void {
        if (y > this.collapsedHeight()) {
            return
        }
        if (this.param !== null) {
            if (!this.param.collapsed) {
                this.collapse()
            } else {
                this.expand()
            }
        }
        if ((this.Owner !== null) && (!umain.TMainForm(this.Owner).internalChange)) {
            umain.TMainForm(this.Owner).repositionParameterPanels()
        }
    }
    
    collapse(): void {
        if (this.param !== null) {
            this.param.collapsed = true
        }
        this.Height = this.collapsedHeight()
    }
    
    expand(): void {
        if (this.param !== null) {
            this.param.collapsed = false
        }
        this.Height = this.uncollapsedHeight()
        //  updateCurrentValue(-1); 
        //cfk don't think i need this anymore
    }
    
    paint(): void {
        let fullRect: TRect
        
        // copied from TCustomPanel.paint and location of caption text changed 
        // can't call inherited paint because it wants to put the caption in the middle 
        this.fillWithBevels()
        fullRect = this.GetClientRect()
        this.Canvas.Font = this.Font
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.labelRect.Left = fullRect.Left + kLeftRightGap + kArrowPictureSize + kOverridePictureSize + kBetweenGap
        this.labelRect.Right = this.labelRect.Left + this.Width - kLeftRightGap * 2 - kArrowPictureSize - kOverridePictureSize
        this.labelRect.Top = fullRect.Top + 2
        this.labelRect.Bottom = this.labelRect.Top + this.textHeight
        this.wrappedLabelHeight = this.drawText(this.Caption, this.labelRect, false, false, false)
        this.pictureRect.Left = fullRect.Left + kLeftRightGap
        this.pictureRect.Right = this.pictureRect.Left + kArrowPictureSize
        this.pictureRect.Top = this.labelRect.Top + 1
        this.pictureRect.Bottom = this.pictureRect.Top + kArrowPictureSize
        if ((this.plant !== null) && (this.param !== null)) {
            if (this.param.collapsed) {
                //
                //    with overrideRect do
                //      begin
                //      left := pictureRect.right;
                //      right := left + kOverridePictureSize;
                //      top := labelRect.top + 1;
                //      bottom := top + kOverridePictureSize;
                //      end;
                //      
                this.Canvas.Draw(this.pictureRect.Left, this.pictureRect.Top, umain.MainForm.paramPanelClosedArrowImage.Picture.Bitmap)
            } else {
                this.Canvas.Draw(this.pictureRect.Left, this.pictureRect.Top, umain.MainForm.paramPanelOpenArrowImage.Picture.Bitmap)
            }
            //
            //      if (not param.cannotOverride) and (param.isOverridden) then
            //        draw(overrideRect.left, overrideRect.top, MainForm.paramOverride.picture.bitmap)
            //      else
            //        draw(overrideRect.left, overrideRect.top, MainForm.paramOverrideNot.picture.bitmap);
            //        
        }
        if ((this.selectedItemIndex === kItemLabel)) {
            this.Canvas.Rectangle(this.pictureRect.Left, this.pictureRect.Top, this.pictureRect.Right, this.pictureRect.Bottom)
        }
    }
    
    drawExtraValueCaptionWithString(valueString: string, unitString: string): void {
        let rect: TRect
        let collapsedExtraRect: TRect
        let stringToDisplay: string
        
        if ((this.wrappedLabelHeight > this.textHeight)) {
            return
        }
        stringToDisplay = ":  " + valueString
        if (unitString !== "(no unit)") {
            stringToDisplay = stringToDisplay + " " + unitString
        }
        Rect = this.GetClientRect()
        collapsedExtraRect.Left = Rect.left + kLeftRightGap + kArrowPictureSize + kOverridePictureSize + kBetweenGap + this.Canvas.TextWidth(this.Caption)
        collapsedExtraRect.Right = Rect.right
        collapsedExtraRect.Top = Rect.top + 2
        collapsedExtraRect.Bottom = collapsedExtraRect.Top + this.textHeight
        if (usupport.rWidth(collapsedExtraRect) <= this.Canvas.TextWidth(stringToDisplay)) {
            return
        }
        this.drawText(stringToDisplay, collapsedExtraRect, false, false, false)
    }
    
    fillWithBevels(): void {
        let fullRect: TRect
        let TopColor: TColor
        let BottomColor: TColor
        let theForm: TCustomForm
        
        // PDF PORT moved function inline 
        // procedure AdjustColors(Bevel: TPanelBevel);
        //  begin
        //  TopColor := clBtnHighlight;
        //  if Bevel = bvLowered then TopColor := clBtnShadow;
        //  BottomColor := clBtnShadow;
        //  if Bevel = bvLowered then BottomColor := clBtnHighlight;
        //  end;
        fullRect = this.GetClientRect()
        this.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        theForm = UNRESOLVED.getParentForm(this)
        if ((theForm !== null) && (theForm instanceof umain.TMainForm) && ((theForm).selectedParameterPanel === this)) {
            this.Canvas.Pen.Color = UNRESOLVED.clHighlight
            this.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
            // pen.width := 2; 
            this.Canvas.Rectangle(fullRect.Left + 2, fullRect.Top + 2, fullRect.Right - 1, fullRect.Bottom - 1)
        } else {
            this.Canvas.FillRect(fullRect)
        }
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        if (this.BevelOuter !== UNRESOLVED.bvNone) {
            // AdjustColors(BevelOuter);
            TopColor = UNRESOLVED.clBtnHighlight
            if (this.BevelOuter === UNRESOLVED.bvLowered) {
                TopColor = UNRESOLVED.clBtnShadow
            }
            BottomColor = UNRESOLVED.clBtnShadow
            if (this.BevelOuter === UNRESOLVED.bvLowered) {
                BottomColor = UNRESOLVED.clBtnHighlight
            }
            UNRESOLVED.Frame3D(this.Canvas, fullRect, TopColor, BottomColor, this.BevelWidth)
        }
        UNRESOLVED.Frame3D(this.Canvas, fullRect, this.Color, this.Color, this.BorderWidth)
        if (this.BevelInner !== UNRESOLVED.bvNone) {
            // AdjustColors(BevelInner);
            TopColor = UNRESOLVED.clBtnHighlight
            if (this.BevelInner === UNRESOLVED.bvLowered) {
                TopColor = UNRESOLVED.clBtnShadow
            }
            BottomColor = UNRESOLVED.clBtnShadow
            if (this.BevelInner === UNRESOLVED.bvLowered) {
                BottomColor = UNRESOLVED.clBtnHighlight
            }
            UNRESOLVED.Frame3D(this.Canvas, fullRect, TopColor, BottomColor, this.BevelWidth)
        }
    }
    
    measureText(text: string, drawRect: TRect): int {
        let result = 0
        let cText: char[] /* 255 + 1 */
        let theForm: TCustomForm
        let useRect: TRect
        
        theForm = UNRESOLVED.getParentForm(this)
        if (theForm === null) {
            //default
            result = 16
        } else {
            if (theForm.Canvas === null) {
                //default
                result = 16
            } else {
                theForm.Canvas.Font = theForm.Font
                useRect = drawRect
                UNRESOLVED.strPCopy(cText, text)
                // returns height of rectangle 
                result = UNRESOLVED.winprocs.drawText(theForm.Canvas.Handle, cText, len(cText), useRect, delphi_compatability.DT_LEFT || delphi_compatability.DT_WORDBREAK || delphi_compatability.DT_CALCRECT)
            }
        }
        // cfk change v1.6b1 -- taken out, dealt with problem by using form to get size
        // deal with large fonts by increasing label height -- kludge
        //if screen.pixelsPerInch >= 120 then // large fonts
        //  result := round(result * 1.5);
        return result
    }
    
    drawText(text: string, drawRect: TRect, isSelectable: boolean, isSelected: boolean, italicize: boolean): int {
        let result = 0
        let cText: char[] /* 255 + 1 */
        
        this.Canvas.Font = this.Font
        if (this.plant !== null) {
            if (this instanceof upp_hed.PdHeaderParameterPanel) {
                this.Canvas.Font.Color = delphi_compatability.clWhite
            } else if (text === this.Caption) {
                this.Canvas.Font.Color = delphi_compatability.clBlue
            } else {
                this.Canvas.Font.Color = UNRESOLVED.clBtnText
            }
        } else {
            if (this instanceof upp_hed.PdHeaderParameterPanel) {
                this.Canvas.Font.Color = UNRESOLVED.clBtnFace
            } else {
                this.Canvas.Font.Color = UNRESOLVED.clBtnShadow
            }
        }
        if (italicize) {
            this.Canvas.Font.Style = {UNRESOLVED.fsItalic, }
        }
        if (this instanceof upp_hed.PdHeaderParameterPanel) {
            this.Canvas.Font.Style = {UNRESOLVED.fsBold, }
        }
        UNRESOLVED.strPCopy(cText, text)
        result = UNRESOLVED.winprocs.drawText(this.Canvas.Handle, cText, len(cText), drawRect, delphi_compatability.DT_LEFT || delphi_compatability.DT_WORDBREAK || delphi_compatability.DT_NOCLIP)
        drawRect.Bottom = drawRect.Top + result
        if ((isSelected)) {
            this.drawTextSelectedBox(drawRect)
        } else if ((isSelectable)) {
            this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
            this.Canvas.MoveTo(drawRect.Left, drawRect.Bottom - 3)
            this.Canvas.LineTo(drawRect.Right, drawRect.Bottom - 3)
        }
        return result
    }
    
    drawTextSelectedBox(rect: TRect): void {
        this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
        this.Canvas.MoveTo(Rect.right + 2, Rect.top)
        this.Canvas.LineTo(Rect.left - 2, Rect.top)
        this.Canvas.LineTo(Rect.left - 2, Rect.bottom - 2)
        this.Canvas.LineTo(Rect.right + 2, Rect.bottom - 2)
        this.Canvas.LineTo(Rect.right + 2, Rect.top)
    }
    
    drawTextLabel(text: string, drawRect: TRect, drawBox: boolean): void {
        let cText: char[] /* 255 + 1 */
        
        this.Canvas.Font = this.Font
        this.Canvas.Font.Color = UNRESOLVED.clBtnText
        UNRESOLVED.strPCopy(cText, text)
        UNRESOLVED.winprocs.drawText(this.Canvas.Handle, cText, len(cText), drawRect, delphi_compatability.DT_LEFT || delphi_compatability.DT_WORDBREAK)
        if (drawBox) {
            this.drawTextSelectedBox(drawRect)
        }
    }
    
    collapsedHeight(): int {
        let result = 0
        result = this.wrappedLabelHeight + kTopBottomGap
        result = intMax(result, kArrowPictureSize + 5)
        return result
    }
    
    minScaleWidthWithBounds(unitSet: int, unitPlant: int, softMin: float, softMax: float): int {
        let result = 0
        let i: int
        let numeralChars: int
        let letterChars: int
        let maxLengthSoftMin: int
        let maxLengthSoftMax: int
        let minValue: float
        let maxValue: float
        
        // value number of chars (always use max) 
        //+ kMaxDisplayDigitsToRightOfDecimal + 1
        numeralChars = kMaxDisplayDigitsToLeftOfDecimal
        // unit string number of chars (get max for set) 
        letterChars = uunits.maxUnitStringLengthForSet(unitSet)
        // bounds number of chars (use actual bounds, but calculate max for set) 
        maxLengthSoftMin = 0
        maxLengthSoftMax = 0
        for (i = 1; i <= uunits.GetLastUnitEnumInUnitSet(unitSet) - 1; i++) {
            minValue = uunits.Convert(unitSet, unitPlant, i, softMin)
            maxValue = uunits.Convert(unitSet, unitPlant, i, softMax)
            maxLengthSoftMin = intMax(maxLengthSoftMin, len(digitValueString(minValue)))
            maxLengthSoftMax = intMax(maxLengthSoftMax, len(digitValueString(maxValue)))
        }
        numeralChars = numeralChars + maxLengthSoftMin + maxLengthSoftMax
        // calc min scale width from number of chars 
        result = this.formTextWidth("i") * letterChars + this.formTextWidth("1") * numeralChars + kBetweenGap * 3 + kLeftRightGap * 2
        return result
    }
    
    minScaleWidthWithoutBounds(unitSet: int, unitPlant: int): int {
        let result = 0
        let numeralChars: int
        let letterChars: int
        
        // value number of chars (always use max) 
        //+ kMaxDisplayDigitsToRightOfDecimal + 1
        numeralChars = kMaxDisplayDigitsToLeftOfDecimal
        // unit string number of chars (get max for set) 
        letterChars = uunits.maxUnitStringLengthForSet(unitSet)
        // calc min scale width from number of chars 
        result = this.formTextWidth("i") * letterChars + this.formTextWidth("1") * numeralChars + kBetweenGap + kLeftRightGap * 2
        return result
    }

    view() {
        return m("div", "PdParameterPanel View NOT OVERRRIDEN")
    }
    
}

