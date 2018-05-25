// unit Usliders

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
const kMinDragDistance = 1


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


export class KfSlider {
    FOnKeyDown: TNotifyEvent = new TNotifyEvent()
    FOnMouseDown: TNotifyEvent = new TNotifyEvent()
    FOnMouseMove: TNotifyEvent = new TNotifyEvent()
    FOnMouseUp: TNotifyEvent = new TNotifyEvent()
    draggerHeight: long = 0
    draggerWidth: long = 0
    minValue: long = 0
    maxValue: long = 0
    hasUnofficialFocus: boolean = false
    readOnly: boolean = false
    currentValue: long = 0
    dragging: boolean = false
    dragStart: long = 0
    originalValue: long = 0
    draggerRect: TRect = new TRect()
    KfSlider.prototype = new TGraphicControl()
    KfSlider.prototype.constructor = KfSlider
    
    //function valueForPosition(x: longint): longint;  
    // must be at least 4 more than dragger height 
    // should be odd number 
    create(AnOwner: TComponent): void {
        TGraphicControl.prototype.create.call(this, AnOwner)
        this.Width = 140
        this.Height = 35
        this.minValue = 0
        this.maxValue = 100
        this.draggerHeight = kSliderDraggerHeight
        this.draggerWidth = kSliderDraggerWidth
        this.readOnly = false
        this.currentValue = 0
        this.dragging = false
        this.useDefaultSizeAndDraggerSize()
    }
    
    useDefaultSizeAndDraggerSize(): void {
        if (this.readOnly) {
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
        TGraphicControl.prototype.CMFocusChanged.call(this)
        //repaint;  
    }
    
    WMGetDlgCode(message: TWMGetDlgCode): void {
        message.result = delphi_compatability.DLGC_WANTARROWS
    }
    
    //returns true if current value changed
    setValue(newValue: long): boolean {
        let result = false
        result = false
        if (newValue > this.maxValue) {
            newValue = this.maxValue
        }
        if (newValue < this.minValue) {
            newValue = this.minValue
        }
        if (newValue === this.currentValue) {
            return result
        }
        this.currentValue = newValue
        //repaint;   
        result = true
        return result
    }
    
    doKeyDown(sender: TObject, Key: byte, shift: TShiftState): void {
        let newValue: long
        
        if (this.readOnly) {
            return Key
        }
        switch (Key) {
            case delphi_compatability.VK_LEFT:
                newValue = this.currentValue - 1
                break
            case delphi_compatability.VK_RIGHT:
                newValue = this.currentValue + 1
                break
            default:
                newValue = this.currentValue
                break
        this.Invalidate()
        this.Refresh()
        if (this.setValue(newValue) && delphi_compatability.Assigned(this.FOnKeyDown)) {
            this.FOnKeyDown(this)
        }
        return Key
    }
    
    pointOnDragger(x: long, y: long): boolean {
        let result = false
        result = delphi_compatability.PtInRect(this.draggerRect, Point(x, y))
        return result
    }
    
    mouseDown(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        TGraphicControl.prototype.mouseDown.call(this, Button, Shift, X, Y)
        if (this.readOnly) {
            if (delphi_compatability.Assigned(this.FOnMouseDown)) {
                this.FOnMouseDown(this)
            }
            return
        }
        if ((Button === delphi_compatability.TMouseButton.mbLeft)) {
            //and (pointOnDragger(x, y))
            this.dragging = true
            this.dragStart = X
            this.originalValue = this.currentValue
            //pdf fix - may want to do more here
            this.hasUnofficialFocus = true
        }
        this.Invalidate()
        this.Refresh()
        if (delphi_compatability.Assigned(this.FOnMouseDown)) {
            this.FOnMouseDown(this)
        }
    }
    
    mouseMove(Shift: TShiftState, X: int, Y: int): void {
        let delta: long
        let newValue: long
        let lineLength: long
        
        TGraphicControl.prototype.mouseMove.call(this, Shift, X, Y)
        if (this.readOnly) {
            return
        }
        if (this.dragging) {
            delta = X - this.dragStart
            //pdf fix - won't snap to grid - will just change relative...
            lineLength = this.Width - 2 * (this.draggerWidth / 2)
            newValue = this.originalValue + intround(1.0 * delta * (this.maxValue - this.minValue) / lineLength)
            this.Invalidate()
            this.Refresh()
            if (this.setValue(newValue) && delphi_compatability.Assigned(this.FOnMouseMove)) {
                this.FOnMouseMove(this)
            }
        }
    }
    
    mouseUp(Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        TGraphicControl.prototype.mouseUp.call(this, Button, Shift, X, Y)
        if (this.readOnly) {
            return
        }
        if ((Button === delphi_compatability.TMouseButton.mbLeft) && this.dragging) {
            this.dragging = false
        }
        if (abs(X - this.dragStart) < kMinDragDistance) {
            return
        }
        this.dragStart = 0
        if (delphi_compatability.Assigned(this.FOnMouseUp)) {
            this.FOnMouseUp(this)
        }
    }
    
    xDistanceFromCurrentValue(distanceInPixels: long): long {
        let result = 0
        let proportion: float
        
        proportion = (this.currentValue - this.minValue) / (this.maxValue - this.minValue)
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
        if (!this.readOnly) {
            //draw dragger if not read only 
            KfDrawButton(this.Canvas, this.draggerRect, this.hasUnofficialFocus, this.Enabled)
        }
        if ((this.hasUnofficialFocus)) {
            this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
            this.Canvas.MoveTo(fullRect.Right - 1, fullRect.Top)
            this.Canvas.LineTo(fullRect.Left, fullRect.Top)
            this.Canvas.LineTo(fullRect.Left, fullRect.Bottom - 1)
            this.Canvas.LineTo(fullRect.Right - 1, fullRect.Bottom - 1)
            this.Canvas.LineTo(fullRect.Right - 1, fullRect.Top)
        }
    }
    
}

