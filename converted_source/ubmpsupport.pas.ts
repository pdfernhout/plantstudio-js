// unit ubmpsupport

from conversion_common import *
import umain
import delphi_compatability

function resizeBitmap(bitmap: TBitmap, newSize: TPoint): void {
    if (bitmap === null) {
        return
    }
    try {
        bitmap.Width = newSize.X
        bitmap.Height = newSize.Y
    } catch (Exception e) {
        bitmap.Width = 1
        bitmap.Height = 1
    }
}

function fillBitmap(bitmap: TBitmap, color: TColor): void {
    if (bitmap === null) {
        return
    }
    bitmap.Canvas.Brush.Color = bitmap.Canvas.Color
    bitmap.Canvas.FillRect(Rect(0, 0, bitmap.Width, bitmap.Height))
}

function copyBitmapToCanvasWithGlobalPalette(bitmap: TBitmap, aCanvas: TCanvas, aRect: TRect): void {
    let oldPalette: HPALETTE
    let wholeRect: TRect
    let needPalette: boolean
    
    oldPalette = 0
    needPalette = screenColorModeIs256ColorsOrLess()
    if (needPalette) {
        oldPalette = UNRESOLVED.selectPalette(aCanvas.Handle, umain.MainForm.paletteImage.Picture.Bitmap.Palette, false)
        UNRESOLVED.realizePalette(aCanvas.Handle)
    }
    wholeRect = Rect(0, 0, bitmap.Width, bitmap.Height)
    if ((aRect.Left !== 0) || (aRect.Right !== 0) || (aRect.Top !== 0) || (aRect.Bottom !== 0)) {
        aCanvas.CopyRect(aRect, bitmap.Canvas, wholeRect)
    } else {
        aCanvas.CopyRect(wholeRect, bitmap.Canvas, wholeRect)
    }
    if (needPalette) {
        UNRESOLVED.selectPalette(aCanvas.Handle, oldPalette, true)
        UNRESOLVED.realizePalette(aCanvas.Handle)
    }
}

function screenColorModeIs256ColorsOrLess(): boolean {
    let result = false
    let screenDC: HDC
    let screenColorBits: int
    
    result = false
    screenDC = UNRESOLVED.GetDC(0)
    try {
        screenColorBits = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
    } finally {
        UNRESOLVED.ReleaseDC(0, screenDC)
    }
    result = (screenColorBits === 1) || (screenColorBits === 4) || (screenColorBits === 8)
    return result
}

function setPixelFormatBasedOnScreenForBitmap(bitmap: TBitmap): void {
    if (bitmap === null) {
        return
    }
    if (screenColorModeIs256ColorsOrLess()) {
        bitmap.PixelFormat = delphi_compatability.TPixelFormat.pf8bit
        bitmap.Palette = UNRESOLVED.CopyPalette(umain.MainForm.paletteImage.Picture.Bitmap.Palette)
    }
}


