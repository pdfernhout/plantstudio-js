// unit UWinSliders

from conversion_common import *
import delphi_compatability

// const
const kSliderHeightReadOnly = 5
const kSliderHeightNotReadOnly = 11
const kSliderDraggerHeight = 7
const kSliderDraggerWidth = 5
const kSliderGrayLineThickness = 1
const kSliderBlueLineThickness = 3
const kSliderDefaultWidth = 20


function KfDrawButton(aCanvas: TCanvas, aRect: TRect, selected: boolean, enabled: boolean): void {
    let internalRect: TRect
    
    aCanvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
    if (enabled) {
        aCanvas.Pen.Color = delphi_compatability.clBlack
        aCanvas.Brush.Color = delphi_compatability.clWhite
    } else {
        aCanvas.Brush.Color = UNRESOLVED.clBtnShadow
        aCanvas.Pen.Color = UNRESOLVED.clBtnShadow
    }
    aCanvas.Rectangle(aRect.Left, aRect.Top, aRect.Right, aRect.Bottom)
    if (selected) {
        internalRect = aRect
        UNRESOLVED.inflateRect(internalRect, -1, -1)
        aCanvas.Brush.Color = delphi_compatability.clAqua
        aCanvas.FillRect(internalRect)
    }
}

// Published declarations 
// must be at least 4 more than dragger height 
// should be odd number 
// PDF PORT -- not used anyway
function Register1(): void {
    UNRESOLVED.RegisterComponents("Samples", {KfWinSlider, })
}


export class KfWinSlider {
    draggerHeight: int = 0
    draggerWidth: int = 0
    FMinValue: int = 0
    FMaxValue: int = 0
    FReadOnly: boolean = false
    FCurrentValue: int = 0
    dragging: boolean = false
    dragStart: int = 0
    originalValue: int = 0
    draggerRect: TRect = new TRect()
    KfWinSlider.prototype = new TCustomControl()
    KfWinSlider.prototype.constructor = KfWinSlider
    
    create(AnOwner: TComponent): void {
        TCustomControl.prototype.create.call(this, AnOwner)
        this.Width = 140
        this.Height = 35
        this.MinValue = 0
        this.MaxValue = 100
        this.draggerHeight = kSliderDraggerHeight
        this.draggerWidth = kSliderDraggerWidth
        this.ReadOnly = false
        this.CurrentValue = 0
        this.dragging = false
        this.TabStop = true
        this.useDefaultSizeAndDraggerSize()
    }
    
    useDefaultSizeAndDraggerSize(): void {
        if (this.ReadOnly) {
            // assumes that readOnly is already set, and assumes that value of readOnly will not be changed
            //    unless this is called again afterward 
            this.Height = kSliderHeightReadOnly
            this.Width = kSliderDefaultWidth
            this.draggerHeight = 0
            this.draggerWidth = 0
        } else {
            this.Height = kSliderHeightNotReadOnly
            this.Width = kSliderDefaultWidth
            this.draggerHeight = kSliderDraggerHeight
            this.draggerWidth = kSliderDraggerWidth
        }
    }
    
    CMFocusChanged(message: TCMFocusChanged): void {
        TCustomControl.prototype.CMFocusChanged.call(this)
        this.Repaint()
    }
    
    WMGetDlgCode(message: TWMGetDlgCode): void {
        message.result = delphi_compatability.DLGC_WANTARROWS
    }
    
    //returns true if current value changed
    setValue(newValue: long): boolean {
        let result = false
        result = false
        if (newValue > this.MaxValue) {
            newValue = this.MaxValue
        }
        if (newValue < this.MinValue) {
            newValue = this.MinValue
        }
        if (newValue === this.CurrentValue) {
            return result
        }
        this.CurrentValue = newValue
        //repaint;   
        result = true
        return result
    }
    
    keyDown(Key: byte, shift: TShiftState): void {
        let newValue: long
        
        TCustomControl.prototype.keyDown.call(this)
        if (!this.ReadOnly) {
            switch (Key) {
                case delphi_compatability.VK_LEFT:
                    newValue = this.CurrentValue - 1
                    break
                case delphi_compatability.VK_RIGHT:
                    newValue = this.CurrentValue + 1
                    break
                case delphi_compatability.VK_UP:
                    newValue = this.CurrentValue + 1
                    break
                case delphi_compatability.VK_DOWN:
                    newValue = this.CurrentValue - 1
                    break
                case delphi_compatability.VK_NEXT:
                    //page up
                    newValue = this.CurrentValue - 5
                    break
                case delphi_compatability.VK_PRIOR:
                    //page down
                    newValue = this.CurrentValue + 5
                    break
                default:
                    return Key
                    break
            this.Invalidate()
            this.Refresh()
            this.setValue(newValue)
        }
        return Key
    }
    
    pointOnDragger(x: long, y: long): boolean {
        let result = false
        result = delphi_compatability.PtInRect(this.draggerRect, Point(x, y))
        return result
    }
    
    mouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        TCustomControl.prototype.mouseDown.call(this)
        this.SetFocus()
        if (!this.ReadOnly) {
            if ((Button === delphi_compatability.TMouseButton.mbLeft)) {
                //and (pointOnDragger(x, y))
                this.dragging = true
                this.dragStart = X
                this.originalValue = this.CurrentValue
            }
            this.Invalidate()
            this.Refresh()
        }
    }
    
    mouseMove(Shift: TShiftState, X: int, Y: int): void {
        let delta: long
        let newValue: long
        let lineLength: long
        
        TCustomControl.prototype.mouseMove.call(this)
        if (this.dragging) {
            delta = X - this.dragStart
            //pdf fix - won't snap to grid - will just change relative...
            lineLength = this.Width - 2 * (this.draggerWidth / 2)
            newValue = this.originalValue + intround(delta * (this.MaxValue - this.MinValue) / lineLength)
            this.Invalidate()
            this.Refresh()
            this.setValue(newValue)
        }
    }
    
    mouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        TCustomControl.prototype.mouseUp.call(this)
        if (this.dragging) {
            this.dragging = false
        }
    }
    
    xDistanceFromCurrentValue(distanceInPixels: long): long {
        let result = 0
        let proportion: float
        
        proportion = (this.CurrentValue - this.MinValue) / (this.MaxValue - this.MinValue)
        try {
            result = intround(proportion * distanceInPixels)
        } catch (Exception e) {
            result = 0
        }
        return result
    }
    
    paint(): void {
        let grayRect: TRect
        let blueRect: TRect
        let fullRect: TRect
        let lineRect: TRect
        let distance: long
        
        fullRect = this.GetClientRect()
        // start with total fill 
        this.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.Canvas.FillRect(fullRect)
        // rect for line 
        lineRect = fullRect
        lineRect.Left = lineRect.Left + this.draggerWidth / 2 + 2
        lineRect.Right = lineRect.Right - this.draggerWidth / 2 - 1
        lineRect.Top = lineRect.Top + (lineRect.Bottom - lineRect.Top) / 2 - kSliderBlueLineThickness / 2
        lineRect.Bottom = lineRect.Top + kSliderBlueLineThickness
        // rect for dragger 
        distance = this.xDistanceFromCurrentValue(lineRect.Right - lineRect.Left)
        this.draggerRect.Left = lineRect.Left + distance - this.draggerWidth / 2 - this.draggerWidth % 2
        this.draggerRect.Right = this.draggerRect.Left + this.draggerWidth
        this.draggerRect.Top = lineRect.Top - this.draggerHeight / 2 + kSliderBlueLineThickness / 2
        this.draggerRect.Bottom = this.draggerRect.Top + this.draggerHeight
        // blue rect 
        blueRect = lineRect
        blueRect.Right = blueRect.Left + distance
        // gray rect 
        grayRect = lineRect
        grayRect.Top = grayRect.Top + (grayRect.Bottom - grayRect.Top) / 2
        grayRect.Bottom = grayRect.Top + kSliderGrayLineThickness
        if (this.Enabled) {
            grayRect.Left = blueRect.Right + 1
        }
        //draw gray line
        this.Canvas.Brush.Color = UNRESOLVED.clBtnShadow
        this.Canvas.FillRect(grayRect)
        if (this.Enabled) {
            //draw blue line
            this.Canvas.Brush.Color = delphi_compatability.clBlue
            this.Canvas.FillRect(blueRect)
        }
        if (!this.ReadOnly) {
            //draw dragger if not read only 
            KfDrawButton(this.Canvas, this.draggerRect, this.Focused(), this.Enabled)
        }
        if ((this.Focused())) {
            this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
            this.Canvas.MoveTo(fullRect.Right - 1, fullRect.Top)
            this.Canvas.LineTo(fullRect.Left, fullRect.Top)
            this.Canvas.LineTo(fullRect.Left, fullRect.Bottom - 1)
            this.Canvas.LineTo(fullRect.Right - 1, fullRect.Bottom - 1)
            this.Canvas.LineTo(fullRect.Right - 1, fullRect.Top)
        }
    }
    
}

