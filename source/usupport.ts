import { float, StrToFloat, int, byte, long, compareTextIgnoreCase, short, readln, TextFile, StrToIntDef, TColorRef, ord, intround, getBValue, getRValue, getGValue, double } from "./common"
import { DebugPrint } from "./temporary"
import { KfStringStream } from "./KfStringStream"
import { intMax, max, min, intMin } from "./umath"

// unit Usupport

// var
// TODO: Use or remove: let iniFileChanged: boolean
// TODO: Use or remove: let gVersionName: string

// const
// TODO: Use or remove kMaxEvaluationTime_hours
const kMaxEvaluationTime_hours = 10

// record
export class SinglePoint {
    x: float
    y: float
    reservedZ: float

    constructor(x = 0.0, y = 0.0) {
        this.x = x
        this.y = y
    }
}

// TODO: Fix boundForString stub from usupport
export function boundForString(boundString: string, fieldType: int): [number, boolean] {
    return [StrToFloat(boundString), true]
}

// TODO: Fix messageForExceptionType stub from usupport
export function messageForExceptionType(e: Error, methodName: string): void {
    console.log("Exception", e);
    DebugPrint("Exception in " + methodName + " with " + e)
}

// TODO: Fix support_rgb from usupport
export function support_rgb(r: byte, g: byte, b: byte): long {
    return (r << 16) + (g << 8) + b
}

// record
export interface SaveFileNamesStructure {
    fileType: short
    tempFile: string
    newFile: string
    backupFile: string
    writingWasSuccessful: boolean
}

// const
export enum FileType {
    kFileTypeAny = 0,
    kFileTypePlant = 1,
    kFileTypeTabbedText = 2,
    kFileTypeStrategy = 3,
    kFileTypeIni = 4,
    kFileTypeExceptionList = 5,
    kFileTypeBitmap = 6,
    kFileTypeTdo = 7,
    kFileTypeDXF = 8,
    kFileTypeINC = 9,
    kFileType3DS = 10,
    kFileTypeProgramInfo = 11,
    kFileTypeJPEG = 12,
    kFileTypeOBJ = 13,
    kFileTypeMTL = 14,
    kFileTypeVRML = 15,
    kFileTypeLWO = 16,
}

const kWritingWasSuccessful = true
const kWritingFailed = false

const kNoSuggestedFile = ""
const kAskForFileName = true
const kDontAskForFileName = false


// const
const kMinSingle = -3.4e38
const kMaxSingle = 3.4e38


// const
const kIncludeAllFiles = true
const kDontIncludeAllFiles = false

/*

// don't like using constants for these, but can't find any functions that provide them 
export function rotateEncodeBy7(aString: string): string {
    let result = ""
    let i: int
    let letter: char
    
    result = ""
    for (i = 0; i <= len(aString) - 1; i++) {
        letter = aString[i + 1]
        result = result + chr((ord(letter) + 1) % 256)
    }
    return result
}

export function hexEncode(aString: string): string {
    let result = ""
    let i: int
    let letter: char
    
    result = ""
    for (i = 0; i <= len(aString) - 1; i++) {
        // ((i+4) mod length(aString))
        letter = aString[i + 1]
        result = result + chr(ord("A") + (ord(letter) / 32))
        result = result + chr(ord("A") + (ord(letter) % 32))
    }
    return result
}

export function hexUnencode(encodedString: string): string {
    let result = ""
    let i: int
    let letter: char
    let value: int
    
    result = ""
    value = 0
    for (i = 0; i <= len(encodedString) - 1; i++) {
        letter = encodedString[i + 1]
        if (i % 2 === 0) {
            value = (ord(letter) - ord("A")) * 32
        } else {
            value = value + (ord(letter) - ord("A"))
            result = result + chr(value)
        }
    }
    return result
}

*/

export function strToFloatWithCommaCheck(aString: string): double {
    let result = 0.0
    if (found(",", aString)) {
        aString = replaceCommasWithPeriods(aString)
    }
    result = StrToFloat(aString)
    return result
}

/*

export function makeEnterWorkAsTab(form: TForm, activeControl: TControl, key: char): void {
    if (form === null) {
        // this is to make enter work as tab in edit boxes on the form 
        return key
    }
    if (activeControl === null) {
        return key
    }
    if (!((activeControl instanceof delphi_compatability.TEdit) || (activeControl instanceof delphi_compatability.TComboBox) || (activeControl instanceof delphi_compatability.TSpinEdit))) {
        return key
    }
    if (key === Character(13)) {
        key = Character(0)
        //next control
        UNRESOLVED.sendMessage(form.Handle, UNRESOLVED.Wm_NextDlgCtl, 0, 0)
    }
    return key
}

export function bitsPerPixelForColorType(colorType: TPixelFormat): short {
    let result = 0
    let screenDC: HDC
    
    // default to max
    result = 32
    switch (colorType) {
        case delphi_compatability.TPixelFormat.pfDevice:
            screenDC = UNRESOLVED.GetDC(0)
            try {
                result = (UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.BITSPIXEL) * UNRESOLVED.GetDeviceCaps(screenDC, delphi_compatability.PLANES))
            } finally {
                UNRESOLVED.ReleaseDC(0, screenDC)
            }
            break
        case delphi_compatability.TPixelFormat.pf1bit:
            result = 1
            break
        case delphi_compatability.TPixelFormat.pf4bit:
            result = 4
            break
        case delphi_compatability.TPixelFormat.pf8bit:
            result = 8
            break
        case delphi_compatability.TPixelFormat.pf15bit:
            result = 15
            break
        case delphi_compatability.TPixelFormat.pf16bit:
            result = 16
            break
        case delphi_compatability.TPixelFormat.pf24bit:
            result = 24
            break
        case delphi_compatability.TPixelFormat.pf32bit:
            result = 32
            break
        case delphi_compatability.TPixelFormat.pfCustom:
            // just use largest
            result = 32
            break
    }
    return result
}

*/

//, extraCharToCarryOver
export function tolerantReadln(aFile: TextFile): string {
    const aString = readln(aFile)
    return aString
}

/*

// text handling 
// CFK unfinished - was trying to deal with text files that have irregular line endings
// such as CR but not LF or just LF
// did not finish - not often found
// got files from user frank salinas as test cases - look at these (in PS longterm) if look at this again later
//  var aChar: char;
//
//  aString := '';
//  aChar := chr(32);
//  // chr(26) is returned if read reaches eof
//  while (not eof(aFile)) and (not (aChar in [#0, #10, #13, #26])) do
//    begin
//    read(aFile, aChar);
//    if not (aChar in [#0, #10, #13, #26]) then
//      aString := aString + aChar
//    else
//      begin
//      read(aFile, aChar);
//      if not (aChar in [#0, #10, #13, #26]) then
//        extraCharToCarryOver := '' + aChar;
//      end;
//    end;
//
//  aChar := chr(32);
//  aString := '';
//  while not eof(aFile) do
//    begin
//    read(aFile, aChar);
//    if not (aChar in [#0, #10, #13, #26]) then
//      result := result + aChar
//    else
//      begin
//      if (aChar = chr(13)) and not eof(aFile) then
//        begin
//        read(theTextFile, aChar);
//        if aChar <> chr(10) then
//          raise Exception.create('Problem in file input');
//        end;
//      break;
//      end;
//    end;
//
//
//  end;
//  
//
//  Start := BufPtr;
//  while not (BufPtr^ in [#13, #26]) do Inc(BufPtr);
//  SetString(S, Start, Integer(BufPtr - Start));
//  if BufPtr^ = #13 then Inc(BufPtr);
//  if BufPtr^ = #10 then Inc(BufPtr);
//  Result := BufPtr;
//  
//
//    aChar := chr(0);
//  result := '';
//  while not eof(theTextFile) do
//    begin
//    read(theTextFile, aChar);
//    if (aChar <> kTextFilerDelimiter) and (aChar <> chr(9)) and (aChar <> chr(10)) and (aChar <> chr(13)) then
//      result := result + aChar
//    else
//      begin
//      if (aChar = chr(13)) and not eof(theTextFile) then
//        begin
//        read(theTextFile, aChar);
//        if aChar <> chr(10) then
//          raise Exception.create('Problem in file input');
//        end;
//      break;
//      end;
//    end;
//  atEndOfFile := eof(theTextFile);
//
// ------------------------------------------------------------------------ text handling 
export function limitString(aString: string, maxChars: short): string {
    let result = ""
    result = aString
    if (len(aString) > maxChars) {
        result = UNRESOLVED.copy(aString, 1, maxChars - 3) + "..."
    }
    return result
}

*/

export function replacePunctuationWithUnderscores(aString: string): string {
    let lowerCaseString: string
    let isAlpha: boolean
    
    let result = ""
    lowerCaseString = aString.toLowerCase()
    if (aString.length > 0) {
        for (let i = 1; i <= aString.length; i++) {
            isAlpha = (ord(lowerCaseString[i]) >= ord("a")) && (ord(lowerCaseString[i]) <= ord("z")) || (ord(lowerCaseString[i]) >= ord("0")) && (ord(lowerCaseString[i]) <= ord("9"))
            if (isAlpha) {
                result = result + aString[i]
            } else {
                result = result + "_"
            }
        }
    }
    return result
}

export function replaceCommasWithPeriods(aString: string): string {
    let result = ""
    if (aString.length > 0) {
        for (let i = 1; i <= aString.length; i++) {
            const isComma = aString[i] === ","
            if (!isComma) {
                result = result + aString[i]
            } else {
                result = result + "."
            }
        }
    }
    return result
}

export function found(substring: string, fullString: string): boolean {
    return fullString.includes(substring)
}

/*

export function trimQuotesFromFirstAndLast(theString: string): string {
    let result = ""
    result = theString
    if (len(result) <= 0) {
        return result
    }
    if (result[1] === "\"") {
        result = UNRESOLVED.copy(result, 2, len(result) - 1)
    }
    if (result[len(result)] === "\"") {
        UNRESOLVED.setLength(result, len(result) - 1)
    }
    return result
}

export function capitalize(aString: string): string {
    let result = ""
    result = ""
    if (len(aString) <= 0) {
        return result
    }
    if (len(aString) === 1) {
        result = uppercase(aString)
    } else {
        result = uppercase(UNRESOLVED.copy(aString, 1, 1)) + UNRESOLVED.copy(aString, 2, len(aString) - 1)
    }
    return result
}

export function readUntilTab(theFile: textFile): string {
    let result = ""
    let aChar: char
    
    aChar = chr(0)
    result = ""
    while (!UNRESOLVED.eof(theFile)) {
        UNRESOLVED.read(theFile, aChar)
        if ((aChar !== chr(9)) && (aChar !== chr(10)) && (aChar !== chr(13))) {
            result = result + aChar
        } else {
            if ((aChar === chr(13)) && !UNRESOLVED.eof(theFile)) {
                UNRESOLVED.read(theFile, aChar)
                if (aChar !== chr(10)) {
                    throw new GeneralException.create("Problem: Something unexpected in file input.")
                }
            }
            break
        }
    }
    if ((UNRESOLVED.copy(result, 1, 1) === "\"") && (UNRESOLVED.copy(result, len(result), 1) === "\"")) {
        // remove quotes placed by spreadsheet around string if it has a comma in it 
        //if (result[1] = '"') and (result[length(result)] = '"') then 
        result = UNRESOLVED.copy(result, 2, len(result) - 2)
    }
    return result
}

export function readShortStringToTab(fileRef: TextFile): string {
    let result = ""
    let temp: string
    
    temp = readUntilTab(fileRef)
    result = UNRESOLVED.copy(temp, 1, 80)
    return result
}

export function readSmallintToTab(fileRef: TextFile): short {
    let result = 0
    let ignore: string
    
    result = 0
    UNRESOLVED.read(fileRef, result)
    ignore = readUntilTab(fileRef)
    return result
}

export function readSingleToTab(fileRef: TextFile): float {
    let result = 0.0
    let temp: string
    
    result = 0.0
    temp = readUntilTab(fileRef)
    // boundForString returns false if unsuccessful, but not doing anything with result yet 
    result = boundForString(temp, uparams.kFieldFloat, result)
    return result
}

export function readBooleanToTab(fileRef: TextFile): boolean {
    let result = false
    let booleanString: string
    
    booleanString = readUntilTab(fileRef)
    if ((uppercase(booleanString) === "TRUE")) {
        result = true
    } else if ((uppercase(booleanString) === "FALSE")) {
        result = false
    } else {
        throw new GeneralException.create("Problem: Improper file format for boolean; found: " + booleanString)
    }
    return result
}

export function boundForString(boundString: string, fieldType: int, number: FIX_MISSING_ARG_TYPE): boolean {
    raise "method boundForString with preexisting function result had var parameters added to return -- fixup manually"
    let result = false
    let piTimesTwo: float
    
    //returns whether conversion was successful
    result = true
    if ((boundString === "MIN") || (boundString === "FLT_MIN")) {
        if (fieldType === uparams.kFieldFloat) {
            number = kMinSingle
        } else {
            number = -32768
        }
    } else if ((boundString === "MAX") || (boundString === "FLT_MAX")) {
        if (fieldType === uparams.kFieldFloat) {
            number = kMaxSingle
        } else {
            number = 32767
        }
    } else if ((boundString === "PI*2") && (fieldType === uparams.kFieldFloat)) {
        piTimesTwo = UNRESOLVED.pi * 2.0
        number = piTimesTwo
    } else if (boundString === "") {
        if (fieldType === uparams.kFieldFloat) {
            number = 0.0
        } else {
            number = 0
        }
    } else {
        try {
            if (fieldType === uparams.kFieldFloat) {
                number = StrToFloat(boundString)
            } else {
                number = StrToInt(boundString)
            }
        } catch (EConvertError e) {
            result = false
            if (fieldType === uparams.kFieldFloat) {
                number = 0.0
            } else {
                number = 0
            }
        }
    }
    return result, number
}

*/

// TODO: Could simplify users of trimLeftAndRight to just use trim
export function trimLeftAndRight(theString: string): string {
    return theString.trim()
}

export function stringUpTo(aString: string, aDelimiter: string): string {
    if (aString.length === 0) {
        return ""
    }
    const delimiterPos = aString.indexOf(aDelimiter)
    let result = ""
    if (delimiterPos === -1) {
        result = aString
    } else if (delimiterPos === 0) {
        result = ""
    } else {
        result = aString.substring(0, delimiterPos)
    }
    return result
}

export function stringBeyond(aString: string, aDelimiter: string): string {
    if (aString.length === 0) {
        return ""
    }
    const delimiterPos = aString.indexOf(aDelimiter)
    let result = ""
    // TODO: Logic here seems problemtaitcal if deleimiter is missing -- maybe want to return empty string?
    if (delimiterPos === -1) {
        result = aString
    } else if (delimiterPos === aString.length - 1) {
        result = ""
    } else {
        result = aString.substring(delimiterPos + aDelimiter.length)
    }
    return result
}

/*

export function stringBetween(startString: string, endString: string, wholeString: string): string {
    let result = ""
    result = stringUpTo(stringBeyond(trim(wholeString), startString), endString)
    return result
}

// didn't use, don't know if works
//function listOfStringsBetweenDelimiters(aString, aDelimiter: string): TStrings;
//  var token: string;
//  begin
//  result := TStrings.create; // caller must free this
//  while length(aString) > 0 do
//    begin
//    token := stringUpTo(aString, aDelimiter);
//    aString := stringBeyond(aString, aDelimiter);
//    result.add(token);
//    end;
//  end;
//

*/

export function boolToStr(value: boolean): string {
    let result = ""
    if (value) {
        result = "true"
    } else {
        result = "false"
    }
    return result
}

export function strToBool(booleanString: string): boolean {
    let result = false
    if (booleanString === "") {
        return result
    }
    if (compareTextIgnoreCase(booleanString, "TRUE")) {
        result = true
    } else if (compareTextIgnoreCase(booleanString, "FALSE")) {
        result = false
    }
    return result
}

/*

export function messageForExceptionType(e: Exception, methodName: string): void {
    let errorString: string
    
    if (e === null) {
        return
    }
    if (e instanceof UNRESOLVED.EZeroDivide) {
        errorString = "Problem: Floating-point divide by zero error in method " + methodName + "."
    } else if (e instanceof UNRESOLVED.EDivByZero) {
        errorString = "Problem: Integer divide by zero in method " + methodName + "."
    } else if (e instanceof UNRESOLVED.EInvalidOp) {
        errorString = "Problem: Invalid floating-point operation in method " + methodName + "."
    } else if (e instanceof UNRESOLVED.EOverFlow) {
        errorString = "Problem: Floating-point overflow in method " + methodName + "."
    } else if (e instanceof UNRESOLVED.EUnderFlow) {
        errorString = "Problem: Floating-point underflow in method " + methodName + "."
    } else {
        errorString = "Problem in method " + methodName + "."
    }
    errorString = errorString + chr(13) + chr(13) + e.message
    ErrorMessage(errorString)
}

*/

// float to text conversion 
 
export function removeTrailingZeros(theString: string): string {
    let result = theString
    while ((result.length > 1) && (result[result.length - 1] === "0") && (result[result.length - 2] !== ".")) {
        result = result.substring(0, result.length - 1)
    }
    return result
}

export function shortenLongNonZeroDigitsAfterDecimal(theString: string, maxDigits: int): string {
    let result = theString
    const pointPos = result.indexOf(".")
    if (pointPos !== 0) {
        let firstNonZeroDigit = pointPos + 1
        while ((firstNonZeroDigit < theString.length) && (theString[firstNonZeroDigit] === "0")) {
            firstNonZeroDigit += 1
        }
        if (firstNonZeroDigit < theString.length) {
            const digitsToGetRidOf = theString.length - firstNonZeroDigit + 1 - maxDigits
            if (digitsToGetRidOf > 0) {
                result = result.substring(0, theString.length - digitsToGetRidOf)
            }
        }
    }
    return result
}

export function digitValueString(value: float): string {
    let result = ""
    result = removeTrailingZeros(shortenLongNonZeroDigitsAfterDecimal("" + value.toFixed(8), 2))
    return result
}

export function valueString(value: float): string {
    let result = ""
    result = removeTrailingZeros(shortenLongNonZeroDigitsAfterDecimal("" + value.toFixed(8), 4))
    return result
}

/*

// graphics 
// ---------------------------------------------------------------------------- graphics 
export function clientRectToScreenRect(handle: HWnd, clientRect: TRect): TRect {
    let result = new TRect()
    let p1: TPoint
    let p2: TPoint
    
    p1 = point(clientRect.Left, clientRect.Top)
    UNRESOLVED.clientToScreen(handle, p1)
    p2 = point(clientRect.Right, clientRect.Bottom)
    UNRESOLVED.clientToScreen(handle, p2)
    result = Rect(p1.X, p1.Y, p2.X, p2.Y)
    return result
}

export function support_rgb(R: byte, G: byte, B: byte): long {
    let result = 0
    //var screenDC: HDC;
    //result := RGB(r, g, b);  
    //try
    //  screenDC := GetDC(0);
    //  result := GetNearestColor(screenDC, PALETTERGB(r, g, b));
    //finally
    //   releaseDC(0, screenDC);
    //end;
    result = UNRESOLVED.PALETTERGB(R, G, B)
    return result
}

export function combineRects(rect1: TRect, rect2: TRect): TRect {
    let result = new TRect()
    result.Left = intMin(rect1.Left, rect2.Left)
    result.Right = intMax(rect1.Right, rect2.Right)
    result.Top = intMin(rect1.Top, rect2.Top)
    result.Bottom = intMax(rect1.Bottom, rect2.Bottom)
    return result
}

export function addRectToBoundsRect(boundsRect: TRect, newRect: TRect): void {
    if ((boundsRect.Left === 0) && (boundsRect.Right === 0) && (boundsRect.Top === 0) && (boundsRect.Bottom === 0)) {
        // on first rect entered, initialize bounds rect
        boundsRect.Left = newRect.Left
        boundsRect.Right = newRect.Right
        boundsRect.Top = newRect.Top
        boundsRect.Bottom = newRect.Bottom
    } else {
        if (newRect.Left < boundsRect.Left) {
            // deal with possibility of rectangle being flipped, so left > right or top > bottom
            // expand rectangle to include left side x
            boundsRect.Left = newRect.Left
        } else if (newRect.Left > boundsRect.Right) {
            boundsRect.Right = newRect.Left
        }
        if (newRect.Right < boundsRect.Left) {
            // expand rectangle to include right side x
            boundsRect.Left = newRect.Right
        } else if (newRect.Right > boundsRect.Right) {
            boundsRect.Right = newRect.Right
        }
        if (newRect.Top < boundsRect.Top) {
            // expand rectangle to include top y
            boundsRect.Top = newRect.Top
        } else if (newRect.Top > boundsRect.Bottom) {
            boundsRect.Bottom = newRect.Top
        }
        if (newRect.Bottom < boundsRect.Top) {
            // expand rectangle to include bottom y
            boundsRect.Top = newRect.Bottom
        } else if (newRect.Bottom > boundsRect.Bottom) {
            boundsRect.Bottom = newRect.Bottom
        }
    }
}

export function rWidth(rect: TRect): int {
    let result = 0
    result = Rect.right - Rect.left
    return result
}

export function rHeight(rect: TRect): int {
    let result = 0
    result = Rect.bottom - Rect.top
    return result
}

export function zeroRect(rect: TRect): boolean {
    let result = false
    //FIX unresolved WITH expression: Rect
    result = (UNRESOLVED.left === 0) && (UNRESOLVED.top === 0) && (UNRESOLVED.right === 0) && (UNRESOLVED.bottom === 0)
    return result
}

export function rectsAreIdentical(oneRect: TRect, twoRect: TRect): boolean {
    let result = false
    result = (oneRect.Top === twoRect.Top) && (oneRect.Bottom === twoRect.Bottom) && (oneRect.Left === twoRect.Left) && (oneRect.Right === twoRect.Right)
    return result
}

export function rectToString(aRect: TRect): string {
    let result = ""
    result = IntToStr(aRect.Left) + " " + IntToStr(aRect.Top) + " " + IntToStr(aRect.Right) + " " + IntToStr(aRect.Bottom)
    return result
}

export function stringToRect(aString: string): TRect {
    let result = new TRect()
    let stream: KfStringStream
    
    result = Rect(0, 0, 0, 0)
    stream = usstream.KfStringStream.create
    try {
        stream.onStringSeparator(aString, " ")
        result.Left = StrToIntDef(stream.nextToken(), 0)
        result.Top = StrToIntDef(stream.nextToken(), 0)
        result.Right = StrToIntDef(stream.nextToken(), 0)
        result.Bottom = StrToIntDef(stream.nextToken(), 0)
    } finally {
        stream.free
    }
    return result
}

export function pointToString(aPoint: TPoint): string {
    let result = ""
    result = IntToStr(aPoint.X) + "  " + IntToStr(aPoint.Y)
    return result
}

export function stringToPoint(aString: string): TPoint {
    let result = new TPoint()
    let stream: KfStringStream
    
    result = point(0, 0)
    stream = usstream.KfStringStream.create
    try {
        stream.onStringSeparator(aString, " ")
        result.X = StrToIntDef(stream.nextToken(), 0)
        result.Y = StrToIntDef(stream.nextToken(), 0)
    } finally {
        stream.free
    }
    return result
}

export function setSinglePoint(x: float, y: float): SinglePoint {
    let result = new SinglePoint()
    result.x = x
    result.y = y
    return result
}

export function singlePointToString(aPoint: SinglePoint): string {
    let result = ""
    result = digitValueString(aPoint.x) + "  " + digitValueString(aPoint.y)
    return result
}

export function stringToSinglePoint(aString: string): SinglePoint {
    let result = new SinglePoint()
    let stream: KfStringStream
    let token: string
    
    result = setSinglePoint(0, 0)
    stream = usstream.KfStringStream.create
    try {
        stream.onStringSeparator(aString, " ")
        token = stream.nextToken()
        if (UNRESOLVED.pos(".", token) === 0) {
            // if it was written as an integer, deal with that
            result.x = StrToIntDef(token, 0)
        } else {
            try {
                result.x = StrToFloat(token)
            } catch (e) {
                result.x = 0.0
            }
        }
        token = stream.nextToken()
        if (UNRESOLVED.pos(".", token) === 0) {
            result.y = StrToIntDef(token, 0)
        } else {
            try {
                result.y = StrToFloat(token)
            } catch (e) {
                result.y = 0.0
            }
        }
    } finally {
        stream.free
    }
    return result
}

export function colorToRGBString(color: TColorRef): string {
    let result = ""
    result = IntToStr(getRValue(color)) + " " + IntToStr(getGValue(color)) + " " + IntToStr(getBValue(color))
    return result
}

*/

export function rgbStringToColor(aString: string): TColorRef {
    // format is r g b 
    const stream = new KfStringStream(aString, " ")
    const r = StrToIntDef(stream.nextToken(), 0)
    const g = StrToIntDef(stream.nextToken(), 0)
    const b = StrToIntDef(stream.nextToken(), 0)
    return support_rgb(r, g, b)
}

// ---------------------------------------------------------------------------------- color functions 
export function blendColors(firstColor: TColorRef, secondColor: TColorRef, aStrength: float): TColorRef {
    // blend first color with second color,
    // weighting the second color by aStrength (0-1) and first color by (1 - aStrength).
    aStrength = max(0.0, min(1.0, aStrength))
    const r1: byte = intMax(0, intMin(255, getRValue(firstColor)))
    const g1: byte = intMax(0, intMin(255, getGValue(firstColor)))
    const b1: byte = intMax(0, intMin(255, getBValue(firstColor)))
    const r2: byte = intMax(0, intMin(255, getRValue(secondColor)))
    const g2: byte = intMax(0, intMin(255, getGValue(secondColor)))
    const b2: byte = intMax(0, intMin(255, getBValue(secondColor)))
    return support_rgb(intround(r1 * (1.0 - aStrength) + r2 * aStrength), intround(g1 * (1.0 - aStrength) + g2 * aStrength), intround(b1 * (1.0 - aStrength) + b2 * aStrength))
}

export function darkerColor(aColor: TColorRef): TColorRef {
    const r: byte = intMax(0, getRValue(aColor) - 10)
    const g: byte = intMax(0, getGValue(aColor) - 10)
    const b: byte = intMax(0, getBValue(aColor) - 10)
    const result: TColorRef = support_rgb(r, g, b)
    //result := support_rgb(GetRValue(aColor) div 2, GetGValue(aColor) div 2, GetBValue(aColor) div 2); 
    return result
}

export function darkerColorWithSubtraction(aColor: TColorRef, subtract: short): TColorRef {
    const r: byte = intMax(0, getRValue(aColor) - subtract)
    const g: byte = intMax(0, getGValue(aColor) - subtract)
    const b: byte = intMax(0, getBValue(aColor) - subtract)
    const result: TColorRef = support_rgb(r, g, b)
    //result := support_rgb(GetRValue(aColor) div 2, GetGValue(aColor) div 2, GetBValue(aColor) div 2); 
    return result
}

export function lighterColor(aColor: TColorRef): TColorRef {
    const r: byte = intMin(255, intround(getRValue(aColor) * 1.5))
    const g: byte = intMin(255, intround(getGValue(aColor) * 1.5))
    const b: byte = intMin(255, intround(getBValue(aColor) * 1.5))
    const result: TColorRef = support_rgb(r, g, b)
    //result := support_rgb(GetRValue(aColor) div 2, GetGValue(aColor) div 2, GetBValue(aColor) div 2); 
    return result
}

/*

export function drawButton(aCanvas: TCanvas, aRect: TRect, selected: boolean, enabled: boolean): void {
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

export function draw3DButton(ACanvas: TCanvas, Client: TRect, Selected: boolean, Pressed: boolean): TRect {
    let result = new TRect()
    ACanvas.Brush.Color = delphi_compatability.clWindowFrame
    if (Selected) {
        ACanvas.FrameRect(Client)
        UNRESOLVED.InflateRect(Client, -1, -1)
    }
    if (!Pressed) {
        ACanvas.Frame3d(ACanvas, Client, UNRESOLVED.clBtnHighlight, UNRESOLVED.clBtnShadow, 2)
    } else {
        ACanvas.Pen.Color = UNRESOLVED.clBtnShadow
        ACanvas.Polyline({Point(Client.Left, Client.Bottom - 1), Point(Client.Left, Client.Top), Point(Client.Right, Client.Top), })
        Client = Rect(Client.Left + 3, Client.Top + 3, Client.Right - 1, Client.Bottom - 1)
    }
    ACanvas.Brush.Color = UNRESOLVED.clBtnFace
    ACanvas.FillRect(Client)
    result = Client
    return result
}

// combo and list box utilities 
// ---------------------------------------------------------------------------- combo and list box utilities 
export function currentObjectInComboBox(comboBox: TComboBox): TObject {
    let result = new TObject()
    if (comboBox.Items.Count === 0) {
        result = null
    } else if (comboBox.ItemIndex !== -1) {
        result = comboBox.Items.Objects[comboBox.ItemIndex]
    } else {
        result = null
    }
    return result
}

export function currentObjectInListBox(listBox: TListBox): TObject {
    let result = new TObject()
    if (listBox.Items.Count === 0) {
        result = null
    } else if (listBox.ItemIndex !== -1) {
        result = listBox.Items.Objects[listBox.ItemIndex]
    } else {
        result = null
    }
    return result
}

// file i/o 
// ---------------------------------------------------------------------------- file i/o 
export function makeFileNameFrom(aString: string): string {
    let result = ""
    let done: boolean
    let spacePos: short
    
    result = aString
    done = false
    while (!done) {
        spacePos = UNRESOLVED.pos(" ", result)
        done = (spacePos <= 0)
        if (!done) {
            UNRESOLVED.delete(result, spacePos, 1)
        }
    }
    return result
}

export function nameStringForFileType(fileType: short): string {
    let result = ""
    switch (fileType) {
        case kFileTypeAny:
            result = ""
            break
        case kFileTypePlant:
            result = "Plant"
            break
        case kFileTypeTabbedText:
            result = "Tabbed text"
            break
        case kFileTypeStrategy:
            result = "Strategy"
            break
        case kFileTypeIni:
            result = "Ini"
            break
        case kFileTypeExceptionList:
            result = "Exception list"
            break
        case kFileTypeBitmap:
            result = "Bitmap"
            break
        case kFileTypeTdo:
            result = "3D object"
            break
        case kFileTypeDXF:
            result = "DXF"
            break
        case kFileTypeINC:
            result = "POV Include file"
            break
        case kFileType3DS:
            result = "3DS"
            break
        case kFileTypeProgramInfo:
            result = "Program Info"
            break
        case kFileTypeJPEG:
            result = "JPEG"
            break
        case kFileTypeOBJ:
            result = "OBJ"
            break
        case kFileTypeMTL:
            result = "MTL"
            break
        case kFileTypeVRML:
            result = "VRML"
            break
        case kFileTypeLWO:
            result = "LWO"
            break
    }
    return result
}

export function extensionForFileType(fileType: short): string {
    let result = ""
    result = ""
    switch (fileType) {
        case kFileTypeAny:
            result = "*"
            break
        case kFileTypePlant:
            result = "pla"
            break
        case kFileTypeTabbedText:
            result = "tab"
            break
        case kFileTypeStrategy:
            result = "str"
            break
        case kFileTypeIni:
            result = "ini"
            break
        case kFileTypeExceptionList:
            result = "nex"
            break
        case kFileTypeBitmap:
            result = "bmp"
            break
        case kFileTypeTdo:
            result = "tdo"
            break
        case kFileTypeDXF:
            result = "dxf"
            break
        case kFileTypeINC:
            result = "inc"
            break
        case kFileType3DS:
            result = "3ds"
            break
        case kFileTypeProgramInfo:
            result = "txt"
            break
        case kFileTypeJPEG:
            result = "jpg"
            break
        case kFileTypeOBJ:
            result = "obj"
            break
        case kFileTypeMTL:
            result = "mtl"
            break
        case kFileTypeVRML:
            result = "wrl"
            break
        case kFileTypeLWO:
            result = "lwo"
            break
    }
    return result
}

export function filterStringForFileType(fileType: short, includeAllFiles: boolean): string {
    let result = ""
    let extension: string
    
    extension = extensionForFileType(fileType)
    if (fileType === kFileTypeAny) {
        result = "All files (*.*)|*.*"
    } else if (includeAllFiles) {
        result = nameStringForFileType(fileType) + " files (*." + extension + ")|*." + extension + "|All files (*.*)|*.*"
    } else {
        result = nameStringForFileType(fileType) + " files (*." + extension + ")|*." + extension
    }
    return result
}

export function getFileOpenInfo(fileType: short, suggestedFile: string, aTitle: string): string {
    let result = ""
    let fullSuggestedFileName: string
    let openDialog: TOpenDialog
    let nameString: string
    
    result = ""
    openDialog = delphi_compatability.TOpenDialog().Create(delphi_compatability.Application)
    try {
        if (suggestedFile === "") {
            openDialog.FileName = "*." + extensionForFileType(fileType)
        } else {
            fullSuggestedFileName = ExpandFileName(suggestedFile)
            // if directory does not exist, will leave as it was 
            openDialog.InitialDir = ExtractFilePath(fullSuggestedFileName)
            if (FileExists(fullSuggestedFileName)) {
                openDialog.FileName = ExtractFileName(fullSuggestedFileName)
            }
        }
        nameString = nameStringForFileType(fileType)
        if (len(aTitle) > 0) {
            openDialog.Title = aTitle
        } else if (nameString[1] in {"A", "E", "I", "O", "U", }) {
            openDialog.Title = "Choose an " + nameString + " file"
        } else {
            openDialog.Title = "Choose a " + nameString + " file"
        }
        openDialog.Filter = filterStringForFileType(fileType, kIncludeAllFiles)
        openDialog.DefaultExt = extensionForFileType(fileType)
        openDialog.Options = openDialog.Options + {delphi_compatability.TOpenOption.ofPathMustExist, delphi_compatability.TOpenOption.ofFileMustExist, delphi_compatability.TOpenOption.ofHideReadOnly, }
        if (openDialog.Execute()) {
            if ((delphi_compatability.TOpenOption.ofExtensionDifferent in openDialog.Options) && (fileType !== kFileTypeAny)) {
                ShowMessage("The file (" + openDialog.FileName + ") does not have the correct extension (" + openDialog.DefaultExt + ").")
                return result
            } else {
                result = openDialog.FileName
            }
        }
    } finally {
        openDialog.free
    }
    return result
}

export function fileNameIsOkayForSaving(suggestedFile: string): boolean {
    let result = false
    let fullSuggestedFileName: string
    
    result = false
    if (len(suggestedFile) === 0) {
        return result
    }
    fullSuggestedFileName = ExpandFileName(suggestedFile)
    if (!UNRESOLVED.directoryExists(ExtractFilePath(fullSuggestedFileName))) {
        // check if directory exists 
        ShowMessage("The directory " + ExtractFilePath(fullSuggestedFileName) + " does not exist.")
        return result
    }
    if (FileExists(fullSuggestedFileName) && UNRESOLVED.FileGetAttr(fullSuggestedFileName) && UNRESOLVED.faReadOnly) {
        // if file exists and is writable, it's ok because Save (not Save As) should not ask to rewrite 
        // if file exists but is read-only, quit  
        ShowMessage("The file " + fullSuggestedFileName + " exists and is read-only.")
        return result
    }
    result = true
    return result
}

export function getFileSaveInfo(fileType: short, askForFileName: boolean, suggestedFile: string, fileInfo: SaveFileNamesStructure): boolean {
    let result = false
    let saveDialog: TSaveDialog
    let tryBackupName: string
    let tryTempName: string
    let fullSuggestedFileName: string
    let prompt: string
    let extension: string
    let index: short
    let tempFileHandle: long
    let userAbortedSave: boolean
    
    fileInfo.fileType = fileType
    result = false
    userAbortedSave = false
    // default info 
    fileInfo.tempFile = ""
    fileInfo.newFile = ""
    fileInfo.backupFile = ""
    fileInfo.writingWasSuccessful = false
    if (!askForFileName) {
        // if this is a Save, try to set the file name from the suggestedFile given; if file name
        //    is invalid, set flag to move into Save As instead 
        askForFileName = !fileNameIsOkayForSaving(suggestedFile)
        if (!askForFileName) {
            fileInfo.newFile = ExpandFileName(suggestedFile)
        }
    }
    if (askForFileName) {
        // if this is a Save As, or if this is a Save and the file in suggestedFile is invalid,
        //    ask user for a file name 
        saveDialog = delphi_compatability.TSaveDialog().Create(delphi_compatability.Application)
        try {
            if (len(suggestedFile) > 0) {
                fullSuggestedFileName = ExpandFileName(suggestedFile)
                // if directory does not exist, will leave as it was 
                saveDialog.InitialDir = ExtractFilePath(fullSuggestedFileName)
                if (UNRESOLVED.directoryExists(ExtractFilePath(fullSuggestedFileName))) {
                    // don't check if file exists (because saving); check if dir exists 
                    saveDialog.FileName = ExtractFileName(fullSuggestedFileName)
                }
            }
            saveDialog.Filter = filterStringForFileType(fileType, kDontIncludeAllFiles)
            saveDialog.DefaultExt = extensionForFileType(fileType)
            saveDialog.Options = saveDialog.Options + {delphi_compatability.TOpenOption.ofPathMustExist, delphi_compatability.TOpenOption.ofOverwritePrompt, delphi_compatability.TOpenOption.ofHideReadOnly, delphi_compatability.TOpenOption.ofNoReadOnlyReturn, }
            userAbortedSave = !saveDialog.Execute()
            if (!userAbortedSave) {
                fileInfo.newFile = saveDialog.FileName
            }
        } finally {
            saveDialog.free
            saveDialog = null
        }
    }
    if (userAbortedSave) {
        return result
    }
    try {
        // set backup file name, check if read-only 
        // changed backup file extension to put tilde first because it is better to have all backup files sort together 
        // includes dot 
        extension = ExtractFileExt(fileInfo.newFile)
        extension = ".~" + UNRESOLVED.copy(extension, 2, 2)
    } catch (e) {
        extension = ".bak"
    }
    tryBackupName = ChangeFileExt(fileInfo.newFile, extension)
    if (FileExists(tryBackupName)) {
        if ((UNRESOLVED.fileGetAttr(tryBackupName) && UNRESOLVED.faReadOnly)) {
            prompt = "The backup file " + tryBackupName + " is read-only. Continue?"
            if (MessageDialog(prompt, mtConfirmation, {mbYes, mbNo, }, 0) !== mrYes) {
                return result
            }
        }
    } else {
        fileInfo.backupFile = tryBackupName
    }
    for (index = 100; index <= 999; index++) {
        // set temp file name 
        tryTempName = ChangeFileExt(fileInfo.newFile, "." + IntToStr(index))
        if (!FileExists(tryTempName)) {
            fileInfo.tempFile = tryTempName
            break
        }
    }
    if (fileInfo.tempFile === "") {
        // if can't find unused temp file, quit 
        ShowMessage("Could not create temporary file " + tryTempName + ".")
        return result
    }
    // test whether temp file can be created 
    tempFileHandle = UNRESOLVED.fileCreate(fileInfo.tempFile)
    if (tempFileHandle > 0) {
        UNRESOLVED.fileClose(tempFileHandle)
        if (!DeleteFile(fileInfo.tempFile)) {
            ShowMessage("Problem with temporary file " + fileInfo.tempFile + ".")
            return result
        }
    } else {
        ShowMessage("Could not write to temporary file " + fileInfo.tempFile + ".")
        return result
    }
    result = true
    return result
}

export function startFileSave(fileInfo: SaveFileNamesStructure): void {
    ucursor.cursor_startWait()
}

export function fileIsExportFile(fileType: short): boolean {
    let result = false
    result = false
    switch (fileType) {
        case kFileTypeBitmap:
            result = true
            break
        case kFileTypeDXF:
            result = true
            break
        case kFileTypeINC:
            result = true
            break
        case kFileType3DS:
            result = true
            break
        case kFileTypeJPEG:
            result = true
            break
        case kFileTypeOBJ:
            result = true
            break
        case kFileTypeVRML:
            result = true
            break
        case kFileTypeLWO:
            result = true
            break
    }
    return result
}

export function cleanUpAfterFileSave(fileInfo: SaveFileNamesStructure): void {
    let useBackup: boolean
    let renamingFailed: boolean
    let deletingFailed: boolean
    let prompt: string
    
    ucursor.cursor_stopWait()
    uwait.stopWaitMessage()
    useBackup = true
    if (!fileInfo.writingWasSuccessful) {
        //if couldn't write, then remove temp file and exit without warning
        DeleteFile(fileInfo.tempFile)
        return
    }
    if (fileInfo.backupFile !== "") {
        if (FileExists(fileInfo.backupFile)) {
            //remove backup file if exists from prior backup
            //try to delete backup file
            deletingFailed = !DeleteFile(fileInfo.backupFile)
            if (deletingFailed) {
                //couldn't delete backup file
                prompt = "Could not write backup file " + fileInfo.backupFile + ". Continue?"
                if (MessageDialog(prompt, mtConfirmation, {mbYes, mbNo, }, 0) !== mrYes) {
                    //user doesn't want to proceed - so cleanup temp file
                    DeleteFile(fileInfo.tempFile)
                    return
                } else {
                    useBackup = false
                }
            }
        }
    } else {
        useBackup = false
    }
    if (FileExists(fileInfo.newFile)) {
        if (useBackup) {
            //if original file exists make backup if requested...
            //rename old copy of new file to make backup
            renamingFailed = !RenameFile(fileInfo.newFile, fileInfo.backupFile)
            if (renamingFailed) {
                prompt = "Could not rename old file to backup file " + fileInfo.backupFile + ". Continue?"
                if (MessageDialog(prompt, mtConfirmation, {mbYes, mbNo, }, 0) !== mrYes) {
                    //user doesn't want to proceed - so cleanup temp file
                    DeleteFile(fileInfo.tempFile)
                    return
                } else {
                    useBackup = false
                }
            }
        }
        if (!useBackup) {
            //could not create backup file - so just delete old file instead of renaming
            deletingFailed = !DeleteFile(fileInfo.newFile)
            if (deletingFailed) {
                ShowMessage("Could not write file " + fileInfo.newFile)
                return
            }
        }
    }
    //rename temp file to newFile name
    renamingFailed = !RenameFile(fileInfo.tempFile, fileInfo.newFile)
    if (renamingFailed) {
        //clean up by removing temp file
        ShowMessage("Could not write file " + fileInfo.newFile + " from " + fileInfo.tempFile)
        DeleteFile(fileInfo.tempFile)
        return
    }
    if ((!udomain.domain.registered) && (fileInfo.writingWasSuccessful) && (fileIsExportFile(fileInfo.fileType))) {
        umain.MainForm.incrementUnregisteredExportCount()
    }
}

*/
