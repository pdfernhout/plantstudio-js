// unit Ubitmap
//$R-
//for MemFree which has incorrect second param when long size

from conversion_common import *
import umain
import ufiler
import delphi_compatability

function RequiresPalette(bitmap: TBitmap): boolean {
    let result = false
    result = false
    switch (bitmap.PixelFormat) {
        case delphi_compatability.TPixelFormat.pf1bit:
            result = true
            break
        case delphi_compatability.TPixelFormat.pf4bit:
            result = true
            break
        case delphi_compatability.TPixelFormat.pf8bit:
            result = true
            break
    return result
}

function CopyBitmapToClipboard(bitmap: TBitmap): void {
    let image: pointer
    let header: pointer
    let imageHandle: THandle
    let handleSet: THandle
    let headerSize: int
    let imageSize: dword
    let clipboardOpen: boolean
    
    header = null
    image = null
    imageHandle = 0
    clipboardOpen = false
    handleSet = 0
    UNRESOLVED.GetDIBSizes(bitmap.Handle, headerSize, imageSize)
    try {
        imageHandle = UNRESOLVED.GlobalAlloc(UNRESOLVED.GMEM_MOVEABLE || UNRESOLVED.GMEM_DDESHARE, headerSize + imageSize)
        try {
            header = UNRESOLVED.GlobalLock(imageHandle)
            image = UNRESOLVED.Pointer(header + headerSize)
            if (!UNRESOLVED.GetDIB(bitmap.Handle, bitmap.Palette, header.PDF_FIX_POINTER_ACCESS, image.PDF_FIX_POINTER_ACCESS)) {
                throw new GeneralException.create("Problem creating picture for clipboard: " + UNRESOLVED.SysErrorMessage(UNRESOLVED.GetLastError))
            }
            clipboardOpen = UNRESOLVED.OpenClipboard(delphi_compatability.Application.MainForm.Handle)
            if (clipboardOpen) {
                UNRESOLVED.EmptyClipboard
                handleSet = UNRESOLVED.SetClipboardData(UNRESOLVED.CF_DIB, imageHandle)
                if (handleSet === 0) {
                    throw new GeneralException.create("Problem copying picture to clipboard: " + UNRESOLVED.SysErrorMessage(UNRESOLVED.GetLastError))
                }
                UNRESOLVED.CloseClipboard
            }
        } finally {
            // the clipboard wants the handle to be unlocked
            UNRESOLVED.GlobalUnlock(imageHandle)
        }
    } catch (Exception e) {
        // we are not supposed to free this handle unless there is a problem, because
        // the clipboard takes ownership of it
        UNRESOLVED.GlobalFree(imageHandle)
        throw new Exception()
    }
}

function BitmapMemorySize(bitmap: TBitmap): long {
    let result = 0
    let headerSize: int
    let imageSize: dword
    
    UNRESOLVED.GetDIBSizes(bitmap.Handle, headerSize, imageSize)
    result = bitmap.instanceSize + headerSize + imageSize
    return result
}

function PrintBitmap(bitmap: TBitmap, drawRect: TRect): void {
    let image: pointer
    let header: pointer
    let imageHandle: THandle
    let handleSet: THandle
    let headerSize: int
    let printResult: int
    let imageSize: dword
    let clipboardOpen: boolean
    
    header = null
    image = null
    imageHandle = 0
    clipboardOpen = false
    handleSet = 0
    UNRESOLVED.GetDIBSizes(bitmap.Handle, headerSize, imageSize)
    try {
        imageHandle = UNRESOLVED.GlobalAlloc(UNRESOLVED.GMEM_MOVEABLE || UNRESOLVED.GMEM_DDESHARE, headerSize + imageSize)
        try {
            header = UNRESOLVED.GlobalLock(imageHandle)
            image = UNRESOLVED.Pointer(header + headerSize)
            if (!UNRESOLVED.GetDIB(bitmap.Handle, bitmap.Palette, header.PDF_FIX_POINTER_ACCESS, image.PDF_FIX_POINTER_ACCESS)) {
                throw new GeneralException.create("Problem creating picture for printing: " + UNRESOLVED.SysErrorMessage(UNRESOLVED.GetLastError))
            }
            printResult = UNRESOLVED.StretchDIBits(UNRESOLVED.Printer.canvas.handle, drawRect.Left, drawRect.Top, drawRect.Right - drawRect.Left, drawRect.Bottom - drawRect.Top, 0, 0, bitmap.Width, bitmap.Height, image, delphi_compatability.TBitmapInfo(header.PDF_FIX_POINTER_ACCESS), delphi_compatability.DIB_RGB_COLORS, delphi_compatability.SRCCOPY)
            if (printResult === UNRESOLVED.GDI_ERROR) {
                throw new GeneralException.create("Problem printing picture: " + UNRESOLVED.SysErrorMessage(UNRESOLVED.GetLastError))
            }
        } finally {
            UNRESOLVED.GlobalUnlock(imageHandle)
        }
    } finally {
        UNRESOLVED.GlobalFree(imageHandle)
    }
}


export class PdBitmap {
    PdBitmap.prototype = new TBitmap()
    PdBitmap.prototype.constructor = PdBitmap
    
    //not overriden because not based on streamable object
    //subclassed to get at protected streaming functions!
    streamUsingFiler(filer: PdFiler): void {
        if (filer.isReading()) {
            this.ReadData(filer.stream)
        } else if (filer.isWriting()) {
            this.WriteData(filer.stream)
        }
    }
    
}

export class PdPaintBoxWithPalette {
    PdPaintBoxWithPalette.prototype = new TPaintBox()
    PdPaintBoxWithPalette.prototype.constructor = PdPaintBoxWithPalette
    
    GetPalette(): HPALETTE {
        let result = new HPALETTE()
        result = umain.MainForm.paletteImage.Picture.Bitmap.Palette
        return result
    }
    
}

