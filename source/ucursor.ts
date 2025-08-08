// unit ucursor

export enum CursorMode {
    kCursorModeSelectDrag = 0,
    kCursorModeMagnify = 1,
    kCursorModeScroll = 2,
    kCursorModeRotate = 3,
    kCursorModePosingSelect = 4,
}

export enum Cursor {
    crDefault = 0,
    crMagMinus = 1,
    crMagPlus = 2,
    crScroll = 3,
    crRotate = 4,
    crDragPlant = 5,
    crAddTriangle = 6,
    crDeleteTriangle = 7,
    crFlipTriangle = 8,
    crDragPoint = 9,
    crDragTdo = 10,
    crPosingSelect = 11,
    crHourGlass = 12,
    crSizeNS = 13,
    crSizeWE = 14,
}

let waitState: number = 0
let currentCursor: Cursor = Cursor.crDefault

const debugCursor = false

export function basic_cursor_getCurrentCursorAsCSS() {
    switch (currentCursor) {
        case Cursor.crDefault: return "default" 
        case Cursor.crMagMinus: return "zoom-out"
        case Cursor.crMagPlus: return "zoom-in"
        case Cursor.crScroll: return "all-scroll"
        case Cursor.crRotate: return "default" // "FIXME"
        case Cursor.crDragPlant: return "grab"
        case Cursor.crAddTriangle: return "default" // "FIXME"
        case Cursor.crDeleteTriangle: return "default" // "FIXME"
        case Cursor.crFlipTriangle: return "default" // "FIXME"
        case Cursor.crDragPoint: return "grab"
        case Cursor.crDragTdo: return "grab"
        case Cursor.crPosingSelect: return "default" // "FIXME"
        case Cursor.crHourGlass: return "wait"
        case Cursor.crSizeNS: return "ns-resize"
        case Cursor.crSizeWE: return "ew-resize"
        default: throw new Error("Unexpected cursor: " + currentCursor)
    }
}

export function cursor_getCurrentCursorAsCSS() {
    const result = basic_cursor_getCurrentCursorAsCSS()
    if (debugCursor) console.log("cursor_getCurrentCursorAsCSS", currentCursor, result)
    return result
}

// export function cursor_initializeWait(): void {
//     waitState = 0
// }

export function cursor_startWait(): void {
    waitState += 1
    cursor_change(Cursor.crHourGlass)
}

export function cursor_startWaitIfNotWaiting(): void {
    if (waitState === 0) {
        cursor_startWait()
    }
}

export function cursor_stopWait(): void {
    if (waitState > 0) {
        waitState -= 1
        if (waitState === 0) {
            cursor_change(Cursor.crDefault)
        }
    }
}

export function cursor_change(newCursor: Cursor): boolean  {
    if (newCursor === currentCursor) return false
    if (debugCursor) console.log("cursor_change", newCursor)
    currentCursor = newCursor
    if (debugCursor) cursor_getCurrentCursorAsCSS()
    return true
}

// TODO PDF: load custom cursors somehow
// function cursor_loadCustomCursors(): void {
//     delphi_compatability.Screen.Cursors[crMagMinus] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "MAGMINUS")
//     delphi_compatability.Screen.Cursors[crMagPlus] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "MAGPLUS")
//     delphi_compatability.Screen.Cursors[crScroll] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "SCROLL")
//     delphi_compatability.Screen.Cursors[crRotate] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "ROTATE")
//     delphi_compatability.Screen.Cursors[crDragPlant] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "DRAGPLANT")
//     delphi_compatability.Screen.Cursors[crAddTriangle] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "ADDTRIANGLEPOINT")
//     delphi_compatability.Screen.Cursors[crDeleteTriangle] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "DELETETRIANGLE")
//     delphi_compatability.Screen.Cursors[crFlipTriangle] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "FLIPTRIANGLE")
//     delphi_compatability.Screen.Cursors[crDragPoint] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "DRAGPOINT")
//     delphi_compatability.Screen.Cursors[crDragTdo] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "DRAGTDO")
//     delphi_compatability.Screen.Cursors[crPosingSelect] = UNRESOLVED.LoadCursor(UNRESOLVED.HInstance, "POSINGSELECT")
// }
