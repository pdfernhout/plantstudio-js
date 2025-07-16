// unit Upp_hed

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


export class PdHeaderParameterPanel {
    PdHeaderParameterPanel.prototype = new PdParameterPanel()
    PdHeaderParameterPanel.prototype.constructor = PdHeaderParameterPanel
    
    collapseOrExpand(y: int): void {
        if ((this.Owner !== null)) {
            umain.TMainForm(this.Owner).collapseOrExpandParameterPanelsUntilNextHeader(this)
        }
        //don't need to change height
        this.param.collapsed = !this.param.collapsed
    }
    
    collapse(): void {
        if (this.param.collapsed) {
            return
        }
        if ((this.Owner !== null)) {
            umain.TMainForm(this.Owner).collapseOrExpandParameterPanelsUntilNextHeader(this)
        }
        this.param.collapsed = true
    }
    
    expand(): void {
        if (!this.param.collapsed) {
            return
        }
        if ((this.Owner !== null)) {
            umain.TMainForm(this.Owner).collapseOrExpandParameterPanelsUntilNextHeader(this)
        }
        this.param.collapsed = false
    }
    
    initialize(): void {
        // nothing 
    }
    
    updateEnabling(): void {
        PdParameterPanel.prototype.updateEnabling.call(this)
        // grey out if no plant, but nothing else 
    }
    
    updatePlantValues(): void {
        // nothing 
    }
    
    updateCurrentValue(aFieldIndex: int): void {
        // nothing 
    }
    
    updateDisplay(): void {
        // nothing 
    }
    
    doMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        // must always call this first because it sets the focus 
        PdParameterPanel.prototype.doMouseDown.call(this, Sender, Button, Shift, X, Y)
        // nothing else; inherited will do collapse/expand 
    }
    
    doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
        PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
        // nothing else; inherited will do collapse/expand 
        return key
    }
    
    maxWidth(): int {
        let result = 0
        result = uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth
        return result
    }
    
    minWidth(requestedWidth: int): int {
        let result = 0
        let minAllowed: int
        
        minAllowed = uppanel.kLeftRightGap * 2 + this.longestLabelWordWidth
        if (requestedWidth > minAllowed) {
            result = -1
        } else {
            result = minAllowed
        }
        return result
    }
    
    uncollapsedHeight(): int {
        let result = 0
        result = this.collapsedHeight()
        return result
    }
    
    maxSelectedItemIndex(): int {
        let result = 0
        result = uppanel.kItemLabel
        return result
    }
    
    resizeElements(): void {
        // do nothing 
    }
    
    paint(): void {
        let fullRect: TRect
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        // copied from TCustomPanel.paint and location of caption text changed 
        // can't call inherited paint because it wants to put the caption in the middle 
        this.fillWithBevels()
        fullRect = this.GetClientRect()
        this.Canvas.Font = this.Font
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        this.labelRect.Left = fullRect.Left + uppanel.kLeftRightGap + uppanel.kArrowPictureSize + udebug.kBetweenGap * 2
        this.labelRect.Right = this.labelRect.Left + this.Width - uppanel.kLeftRightGap * 2
        this.labelRect.Top = fullRect.Top + 2
        this.labelRect.Bottom = this.labelRect.Top + this.textHeight
        //  with labelRect do
        //      begin
        //      right := fullRect.right - kleftRightGap * 4;
        //      left := right - textWidth(caption);
        //      top := fullRect.top + 2;
        //      bottom := top + self.textHeight;
        //      end;  
        this.wrappedLabelHeight = this.drawText(this.Caption, this.labelRect, false, false, false)
        this.pictureRect.Left = fullRect.Left + uppanel.kLeftRightGap
        this.pictureRect.Right = this.pictureRect.Left + uppanel.kArrowPictureSize
        this.pictureRect.Top = this.labelRect.Top + 1
        this.pictureRect.Bottom = this.pictureRect.Top + uppanel.kArrowPictureSize
        if (this.plant !== null) {
            if (this.param.collapsed) {
                this.Canvas.Draw(this.pictureRect.Left, this.pictureRect.Top, umain.MainForm.paramPanelClosedArrowImage.Picture.Bitmap)
            } else {
                this.Canvas.Draw(this.pictureRect.Left, this.pictureRect.Top, umain.MainForm.paramPanelOpenArrowImage.Picture.Bitmap)
            }
        }
        if ((this.selectedItemIndex === uppanel.kItemLabel)) {
            this.Canvas.Rectangle(this.pictureRect.Left, this.pictureRect.Top, this.pictureRect.Right, this.pictureRect.Bottom)
        }
        //
        //    if plant <> nil then
        //      begin
        //      pen.width := 1;
        //      pen.color := clBlue;
        //      moveTo({pictureRect.right + kLeftRightGap * 2}labelRect.left + textWidth(caption) + kLeftRightGap * 2,
        //        labelRect.top + rHeight(labelRect) div 2 - pen.width div 2);
        //      lineTo({labelRect.left - kLeftRightGap * 2}fullRect.right - kLeftRightGap * 2,
        //        labelRect.top + rHeight(labelRect) div 2 - pen.width div 2);
        //      end;
        //      
    }
    
    fillWithBevels(): void {
        let fullRect: TRect
        let TopColor: TColor
        let BottomColor: TColor
        
        // PDF PORT -- moved nested function inline
        //procedure AdjustColors(Bevel: TPanelBevel);
        //  begin
        //  TopColor := clBtnHighlight;
        //  if Bevel = bvLowered then TopColor := clBtnShadow;
        //  BottomColor := clBtnShadow;
        //  if Bevel = bvLowered then BottomColor := clBtnHighlight;
        //  end;
        fullRect = this.GetClientRect()
        if (this.plant !== null) {
            this.Canvas.Brush.Color = delphi_compatability.clNavy
        } else {
            this.Canvas.Brush.Color = UNRESOLVED.clBtnShadow
        }
        this.Canvas.FillRect(fullRect)
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        if (this.BevelOuter !== UNRESOLVED.bvNone) {
            //AdjustColors(BevelOuter);
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
            UNRESOLVED.AdjustColors(this.BevelInner)
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
    
}

