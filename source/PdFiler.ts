// PdFiler was unit Ufiler

import { TRect } from "./TRect"
import { short, long, byte, float, double, TColor, TColorRef } from "./common"
import { TPoint } from "./TPoint"

//  For every streamable object,
//  	Set class number to constant from uclasses.
//    Increment version number if change streamed structure (watch out for base class streaming changes!).
//    Increment addition number if add new field and older program versions can ignore it and you can default it.
//      In addition case, check additions number in streamDataWithFiler.
//      When create new version, you should usually reset additions to zero and
//      	remove additions testing code in streaming.

// record
export interface PdClassAndVersionInformationRecord {
    classNumber: short
    versionNumber: short
    additionNumber: short
}

export enum PdFilerMode { filerModeReading, filerModeWriting, filerModeCounting }

// const
const kMinWidthOnScreen = 40
const kMinHeightOnScreen = 20

// global functions 

/*
function StreamFormPositionInfoWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord, form: TForm): void {
    let tempBoundsRect: TRect
    let tempVisible: boolean
    let tempWindowState: TWindowState
    
    if (filer === null) {
        return
    }
    if (form === null) {
        return
    }
    if (filer.isReading()) {
        form.Visible = false
    }
    if (filer.isReading()) {
        filer.streamRect(tempBoundsRect)
        if (tempBoundsRect.Left > delphi_compatability.Screen.Width - kMinWidthOnScreen) {
            // keep window on screen - left corner of title bar 
            tempBoundsRect.Left = delphi_compatability.Screen.Width - kMinWidthOnScreen
        }
        if (tempBoundsRect.Top > delphi_compatability.Screen.Height - kMinHeightOnScreen) {
            tempBoundsRect.Top = delphi_compatability.Screen.Height - kMinHeightOnScreen
        }
        form.Position = delphi_compatability.TPosition.poDesigned
        form.SetBounds(tempBoundsRect.Left, tempBoundsRect.Top, tempBoundsRect.Right - tempBoundsRect.Left, tempBoundsRect.Bottom - tempBoundsRect.Top)
    } else {
        tempBoundsRect = form.BoundsRect
        filer.streamRect(tempBoundsRect)
    }
    if (filer.isReading()) {
        tempVisible = filer.streamBoolean(tempVisible)
        filer.streamWindowState(tempWindowState)
        form.WindowState = tempWindowState
        // make visible last 
        form.Visible = tempVisible
    } else {
        tempVisible = form.Visible
        tempVisible = filer.streamBoolean(tempVisible)
        tempWindowState = form.WindowState
        filer.streamWindowState(tempWindowState)
    }
}

function StreamComboBoxItemIndexWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord, comboBox: TComboBox): void {
    let tempItemIndex: long
    
    if (filer.isReading()) {
        tempItemIndex = -1
        tempItemIndex = filer.streamLongint(tempItemIndex)
        if ((comboBox.Items.Count > 0) && (tempItemIndex >= 0) && (tempItemIndex <= comboBox.Items.Count - 1)) {
            comboBox.ItemIndex = tempItemIndex
        }
    } else {
        tempItemIndex = comboBox.ItemIndex
        tempItemIndex = filer.streamLongint(tempItemIndex)
    }
}

function StreamComboBoxItemIndexToTempVarWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord, comboBox: TComboBox, saveIndex: long): void {
    let tempItemIndex: long
    
    if (filer.isReading()) {
        tempItemIndex = -1
        tempItemIndex = filer.streamLongint(tempItemIndex)
        saveIndex = tempItemIndex
    } else {
        tempItemIndex = comboBox.ItemIndex
        tempItemIndex = filer.streamLongint(tempItemIndex)
    }
    return saveIndex
}
*/

export class PdFiler {
    stream: TStream = new TStream()
    mode: PdFilerMode
    bytesStreamed: long = 0
    resourceProvider: TObject = new TObject()
    
    // an object that can be used to look up shared resource references
    createWithStream(aStream: TStream): void {
        this.stream = aStream
        if (this.stream === null) {
            this.setToCountingMode()
        }
        // should test type of stream to auomatically set reading or writing mode
    }
    
    setToReadingMode(): void {
        this.mode = PdFilerMode.filerModeReading
        this.bytesStreamed = 0
        if (this.stream === null) {
            // was LoadStr( )
            throw new delphi_compatability.EReadError.create(UNRESOLVED.SReadError)
        }
    }
    
    setToWritingMode(): void {
        this.mode = PdFilerMode.filerModeWriting
        this.bytesStreamed = 0
        if (this.stream === null) {
            // was LoadStr( )
            throw new delphi_compatability.EWriteError.create(UNRESOLVED.SWriteError)
        }
    }
    
    setToCountingMode(): void {
        this.mode = PdFilerMode.filerModeCounting
        this.bytesStreamed = 0
    }
    
    isReading(): boolean {
        let result = false
        result = this.mode === PdFilerMode.filerModeReading
        return result
    }
    
    isWriting(): boolean {
        let result = false
        result = this.mode === PdFilerMode.filerModeWriting
        return result
    }
    
    isCounting(): boolean {
        let result = false
        result = this.mode === PdFilerMode.filerModeCounting
        return result
    }
    
    // simple types
    // simple types
    streamBytes(bytes: FIX_MISSING_ARG_TYPE, size: long): void {
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                bytes = this.stream.read(bytes, size)
                break
            case PdFilerMode.filerModeWriting:
                this.stream.write(bytes, size)
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + size
                break
        }
        return bytes
    }
    
    streamClassAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                cvir = this.stream.read(cvir, FIX_sizeof(PdClassAndVersionInformationRecord))
                break
            case PdFilerMode.filerModeWriting:
                this.stream.write(cvir, FIX_sizeof(PdClassAndVersionInformationRecord))
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + FIX_sizeof(PdClassAndVersionInformationRecord)
                break
        }
    }
    
    streamShortString(aString: string): void {
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                aString[0] = this.streamBytes(aString[0], 1)
                aString[1] = this.streamBytes(aString[1], ord(aString[0]))
                break
            case PdFilerMode.filerModeWriting:
                aString = this.streamBytes(aString, aString.length + 1)
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + aString.length + 1
                break
        }
        return aString
    }
    
    streamAnsiString(aString: ansistring): void {
        let theLength: long
        
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                // make sure write out extra zero at end
                theLength = this.streamLongint(theLength)
                UNRESOLVED.setlength(aString, theLength)
                if (theLength > 0) {
                    aString.PDF_FIX_POINTER_ACCESS = this.streamBytes(aString.PDF_FIX_POINTER_ACCESS, theLength + 1)
                }
                break
            case PdFilerMode.filerModeWriting:
                theLength = aString.length
                theLength = this.streamLongint(theLength)
                if (theLength > 0) {
                    aString.PDF_FIX_POINTER_ACCESS = this.streamBytes(aString.PDF_FIX_POINTER_ACCESS, theLength + 1)
                }
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + aString.length + 1
                break
        }
    }
    
    // maybe problem in 32 bits - depends how big a string string alloc can return
    // need to stream "aPChar^" not just "aPChar".  The first is the array,
    // the second is just the space occupied by the pointer - and is a bug
    streamPChar(aPChar: "UNFINISHED_FIX_THIS_PCHAR_INIT"): void {
        let stringLength: long
        
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                if (aPChar !== null) {
                    UNRESOLVED.StrDispose(aPChar)
                    aPChar = null
                }
                stringLength = this.streamBytes(stringLength, FIX_sizeof(longint))
                if (stringLength > 0) {
                    aPChar = UNRESOLVED.StrAlloc(stringLength)
                    if (aPChar === null) {
                        throw new GeneralException.create("Problem: Out of memory.")
                    }
                    aPChar.PDF_FIX_POINTER_ACCESS = this.streamBytes(aPChar.PDF_FIX_POINTER_ACCESS, stringLength)
                }
                break
            case PdFilerMode.filerModeWriting:
                if (aPChar === null) {
                    stringLength = 0
                } else {
                    stringLength = len(aPChar) + 1
                }
                stringLength = this.streamBytes(stringLength, FIX_sizeof(longint))
                if (stringLength > 0) {
                    aPChar.PDF_FIX_POINTER_ACCESS = this.streamBytes(aPChar.PDF_FIX_POINTER_ACCESS, stringLength)
                }
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + FIX_sizeof(longint) + len(aPChar) + 1
                break
        }
        return aPChar
    }
    
    streamChar(aChar: char): void {
        aChar = this.streamBytes(aChar, FIX_sizeof(char))
        return aChar
    }
    
    streamBoolean(aBoolean: boolean): void {
        aBoolean = this.streamBytes(aBoolean, FIX_sizeof(boolean))
        return aBoolean
    }
    
    streamByteBool(aByteBool: bytebool): void {
        aByteBool = this.streamBytes(aByteBool, FIX_sizeof(UNRESOLVED.bytebool))
    }
    
    streamWordBool(aWordBool: wordbool): void {
        aWordBool = this.streamBytes(aWordBool, FIX_sizeof(UNRESOLVED.wordbool))
    }
    
    streamLongBool(aLongBool: longbool): void {
        aLongBool = this.streamBytes(aLongBool, FIX_sizeof(UNRESOLVED.longbool))
    }
    
    streamShortint(aShortint: short): void {
        aShortint = this.streamBytes(aShortint, FIX_sizeof(shortint))
        return aShortint
    }
    
    streamSmallint(aSmallint: short): void {
        aSmallint = this.streamBytes(aSmallint, FIX_sizeof(smallint))
        return aSmallint
    }
    
    streamLongint(aLongint: long): void {
        aLongint = this.streamBytes(aLongint, FIX_sizeof(longint))
        return aLongint
    }
    
    streamByte(aByte: byte): void {
        aByte = this.streamBytes(aByte, FIX_sizeof(byte))
        return aByte
    }
    
    streamWord(aWord: byte): void {
        aWord = this.streamBytes(aWord, FIX_sizeof(word))
        return aWord
    }
    
    streamReal(aReal: float): void {
        aReal = this.streamBytes(aReal, FIX_sizeof(real))
        return aReal
    }
    
    streamSingle(aSingle: float): void {
        aSingle = this.streamBytes(aSingle, FIX_sizeof(single))
        return aSingle
    }
    
    streamSingleArray(anArray: float[]): void {
        // var i: integer;
        anArray = this.streamBytes(anArray, FIX_sizeof(anArray))
        // if this doesn't work, use loop
        // for i := 0 to high(anArray) do self.streamSingle(anArray[i]);
        return anArray
    }
    
    streamBooleanArray(anArray: boolean[]): void {
        anArray = this.streamBytes(anArray, FIX_sizeof(anArray))
        return anArray
    }
    
    streamDouble(aDouble: double): void {
        aDouble = this.streamBytes(aDouble, FIX_sizeof(double))
        return aDouble
    }
    
    streamExtended(anExtended: double): void {
        anExtended = this.streamBytes(anExtended, FIX_sizeof(extended))
        return anExtended
    }
    
    streamComp(aComp: "UNFINISHED_FIX_THIS_COMP_INIT"): void {
        aComp = this.streamBytes(aComp, FIX_sizeof(comp))
        return aComp
    }
    
    // common types
    // common types
    // win 32 defines these to be made of longints, so just stream smalls..
    streamPoint(aPoint: TPoint): void {
        raise "method streamPoint had assigned to var parameter aPoint not added to return -- fixup manually"
        let x: short
        let y: short
        
        if (this.isReading()) {
            x = this.streamSmallint(x)
            y = this.streamSmallint(y)
            aPoint.X = x
            aPoint.Y = y
        } else {
            x = aPoint.X
            y = aPoint.Y
            x = this.streamSmallint(x)
            y = this.streamSmallint(y)
        }
    }
    
    streamSinglePoint(aPoint: SinglePoint): void {
        raise "method streamSinglePoint had assigned to var parameter aPoint not added to return -- fixup manually"
        let x: float
        let y: float
        
        if (this.isReading()) {
            x = this.streamSingle(x)
            y = this.streamSingle(y)
            aPoint = usupport.setSinglePoint(x, y)
        } else {
            x = aPoint.x
            y = aPoint.y
            x = this.streamSingle(x)
            y = this.streamSingle(y)
        }
    }
    
    streamRect(aRect: TRect): void {
        raise "method streamRect had assigned to var parameter aRect not added to return -- fixup manually"
        let top: short
        let left: short
        let bottom: short
        let right: short
        
        if (this.isReading()) {
            left = this.streamSmallint(left)
            top = this.streamSmallint(top)
            right = this.streamSmallint(right)
            bottom = this.streamSmallint(bottom)
            aRect = Rect(left, top, right, bottom)
        } else {
            left = aRect.Left
            top = aRect.Top
            right = aRect.Right
            bottom = aRect.Bottom
            left = this.streamSmallint(left)
            top = this.streamSmallint(top)
            right = this.streamSmallint(right)
            bottom = this.streamSmallint(bottom)
        }
    }
    
    // streams 32 bit locations
    streamBigPoint(aPoint: TPoint): void {
        aPoint = this.streamBytes(aPoint, FIX_sizeof(delphi_compatability.TPoint))
    }
    
    // streams 32 bit locations
    streamBigRect(aRect: TRect): void {
        aRect = this.streamBytes(aRect, FIX_sizeof(delphi_compatability.TRect))
    }
    
    streamColor(aColor: TColor): void {
        aColor = this.streamBytes(aColor, FIX_sizeof(delphi_compatability.TColor))
    }
    
    streamColorRef(aColorRef: TColorRef): void {
        aColorRef = this.streamBytes(aColorRef, FIX_sizeof(delphi_compatability.TColorRef))
    }
    
    streamRGB(aRGB: long): void {
        aRGB = this.streamBytes(aRGB, FIX_sizeof(longint))
        return aRGB
    }
    
    streamPenStyle(aPenStyle: TPenStyle): void {
        aPenStyle = this.streamBytes(aPenStyle, FIX_sizeof(delphi_compatability.TPenStyle))
    }
    
    streamWindowState(aWindowState: TWindowState): void {
        aWindowState = this.streamBytes(aWindowState, FIX_sizeof(UNRESOLVED.TWindowState))
    }
    
    // this function assumes the objects in the string list are nil or are
    // StreamableObject subclasses and are listed in the CreateStreamableObject function
    streamStringList(aStringList: TStringList): void {
        let theCount: long
        let i: long
        let aStreamableObject: PdStreamableObject
        let theString: string
        
        if (this.isWriting()) {
            theCount = aStringList.Count
            theCount = this.streamLongint(theCount)
            if (theCount > 0) {
                for (i = 0; i <= theCount - 1; i++) {
                    theString = aStringList.Strings[i]
                    // could stream ansi ? - won't work in gsim
                    theString = this.streamShortString(theString)
                    aStreamableObject = aStringList.Objects[i]
                    this.streamOrCreateObject(aStreamableObject)
                }
            }
        } else if (this.isReading()) {
            aStringList.Clear()
            theCount = this.streamLongint(theCount)
            if (theCount > 0) {
                for (i = 0; i <= theCount - 1; i++) {
                    // could stream ansi ? - won't work in gsim
                    theString = this.streamShortString(theString)
                    aStringList.Add(theString)
                    // needs to be nil when passed to next call for a read
                    aStreamableObject = null
                    this.streamOrCreateObject(aStreamableObject)
                    if (aStreamableObject !== null) {
                        aStringList.Objects[i] = aStreamableObject
                    }
                }
            }
        }
    }
    
    streamListOfLongints(aList: TList): void {
        let theCount: long
        let i: long
        let theValue: long
        
        if (this.isWriting()) {
            theCount = aList.Count
            theCount = this.streamLongint(theCount)
            if (theCount > 0) {
                for (i = 0; i <= theCount - 1; i++) {
                    theValue = aList.Items[i]
                    theValue = this.streamLongint(theValue)
                }
            }
        } else if (this.isReading()) {
            aList.Clear()
            theCount = this.streamLongint(theCount)
            if (theCount > 0) {
                for (i = 0; i <= theCount - 1; i++) {
                    theValue = this.streamLongint(theValue)
                    aList.Add(UNRESOLVED.Pointer(theValue))
                }
            }
        }
    }
    
    streamCursor(aCursor: TCursor): void {
        aCursor = this.streamBytes(aCursor, FIX_sizeof(delphi_compatability.TCursor))
    }
    
    // uses memory stream which is somewhat inefficient because
    // of the double copying and memory allocation.
    // TIcon cannot be written mre easily because of
    // private fields which would need to be accessed for size and data.
    // Unfortunately TIcon only provides ways to read and write assuming
    // the whole stream is made of the icon
    // copy from is also inefficient because it allocates a buffer -
    // probably could copy more directly from one stream to another
    // since one is a memory stream and is already in memory
    streamIcon(anIcon: TIcon): void {
        let memoryStream: TMemoryStream
        let iconSize: long
        
        memoryStream = delphi_compatability.TMemoryStream.create
        if (this.isReading()) {
            iconSize = this.streamLongint(iconSize)
            // put icon in memory stream
            memoryStream.CopyFrom(this.stream, iconSize)
            memoryStream.Position = 0
            anIcon.LoadFromStream(memoryStream)
        } else if (this.isWriting()) {
            anIcon.SaveToStream(memoryStream)
            memoryStream.Position = 0
            iconSize = memoryStream.Size
            iconSize = this.streamLongint(iconSize)
            // put memory stream in other stream
            this.stream.CopyFrom(memoryStream, iconSize)
        }
        memoryStream.free
    }
    
    // class level streaming
    save(fileName: string, objectToSave: PdStreamableObject): void {
        let fileStream: TFileStream
        let filer: PdFiler
        
        fileStream = delphi_compatability.TFileStream().Create(fileName, delphi_compatability.fmOpenWrite || delphi_compatability.fmCreate)
        try {
            filer = PdFiler().createWithStream(fileStream)
            filer.setToWritingMode()
            try {
                objectToSave.streamUsingFiler(filer)
            } finally {
                filer.free
            }
        } finally {
            fileStream.free
        }
    }
    
    // class save/load functions
    load(fileName: string, objectToLoad: PdStreamableObject): void {
        let fileStream: TFileStream
        let filer: PdFiler
        
        fileStream = delphi_compatability.TFileStream().Create(fileName, delphi_compatability.fmOpenRead)
        try {
            filer = PdFiler().createWithStream(fileStream)
            filer.setToReadingMode()
            try {
                objectToLoad.streamUsingFiler(filer)
            } finally {
                filer.free
            }
        } finally {
            fileStream.free
        }
    }
    
    relativize(filename: string): string {
        let result = ""
        let path: string
        let currentDirectory: string
        let exeDirectory: string
        
        result = filename
        path = ExtractFilePath(filename)
        currentDirectory = ExtractFilePath(ExpandFileName("junk.tmp"))
        exeDirectory = ExtractFilePath(delphi_compatability.Application.exeName)
        if ((UNRESOLVED.CompareText(currentDirectory, UNRESOLVED.copy(path, 1, len(currentDirectory))) === 0)) {
            result = UNRESOLVED.copy(filename, len(currentDirectory) + 1, 256)
        } else if ((UNRESOLVED.CompareText(exeDirectory, UNRESOLVED.copy(path, 1, len(exeDirectory))) === 0)) {
            result = UNRESOLVED.copy(filename, len(exeDirectory) + 1, 256)
            if (FileExists(currentDirectory + result)) {
                // don't relativize if file is also in current directory
                result = filename
            }
        }
        return result
    }
    
    streamNilObject(): void {
        let cvir: PdClassAndVersionInformationRecord
        
        cvir.classNumber = uclasses.kTNil
        cvir.versionNumber = 0
        this.streamClassAndVersionInformation(cvir)
    }
    
    streamOrCreateObject(anObject: PdStreamableObject): void {
        raise "method streamOrCreateObject had assigned to var parameter anObject not added to return -- fixup manually"
        let cvir: PdClassAndVersionInformationRecord
        let oldPosition: long
        
        if ((this.isReading()) && (anObject !== null)) {
            throw new GeneralException.create("Problem: Argument should be nil if reading; in method PdFiler.streamOrCreateObject.")
        }
        if (this.isWriting()) {
            if (anObject === null) {
                this.streamNilObject()
            } else {
                anObject.streamUsingFiler(this)
            }
        } else if (this.isReading()) {
            oldPosition = this.getStreamPosition()
            this.streamClassAndVersionInformation(cvir)
            anObject = uclasses.CreateStreamableObjectFromClassAndVersionInformation(cvir)
            if (anObject !== null) {
                // reset the stream because object will reread its information
                this.setStreamPosition(oldPosition)
                anObject.streamUsingFiler(this)
            }
        }
    }
    
    getStreamPosition(): long {
        let result = 0
        result = this.stream.Position
        return result
    }
    
    setStreamPosition(position: long): void {
        this.stream.Position = position
    }
    
}

export class PdStreamableObject {
    
    // PdStreamableObject
    // use for auto creating classes when type not known
    // use for checking if structure has changed
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = uclasses.kPdStreamableObject
        cvir.versionNumber = 0
        cvir.additionNumber = 0
        throw new GeneralException.create("Problem: Subclass should override; in method PdStreamableObject.classAndVersionInformation.")
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        // does nothing for this class - subclasses should override
    }
    
    // return true if should read data - false if this function read it
    // this fuction needs to be overriden if it will read the data instead of raising exception
    // exception handlers need to skip over data if desired
    // skip it code - filer.setStreamPosition(filer.getStreamPosition + size); - note this might fail
    // if size is some crazy number outside of stream.  The might not get nic error message...
    verifyClassAndVersionInformation(filer: PdFiler, size: long, cvirRead: PdClassAndVersionInformationRecord, cvirClass: PdClassAndVersionInformationRecord): boolean {
        let result = false
        if (cvirRead.classNumber !== cvirClass.classNumber) {
            throw new PdExceptionFilerUnexpectedClassNumber().createWithSizeAndMessage(size, "Problem reading file.  This file may be corrupt. (Expected class " + IntToStr(cvirClass.classNumber) + " read class " + IntToStr(cvirRead.classNumber) + ")")
            // filer.setStreamPosition(filer.getStreamPosition + size);
            //  	result := false;
            //    exit;  
        }
        if (cvirRead.versionNumber !== cvirClass.versionNumber) {
            // assuming that later can read earlier or will issue error
            // if caller wants to recover - can manually create object and read size bytes
            throw new PdExceptionFilerUnexpectedVersionNumber().createWithSizeAndMessage(size, "Problem reading file.  This file is of a different version than the program. (Class " + IntToStr(cvirClass.classNumber) + " version " + IntToStr(cvirClass.versionNumber) + " cannot read version " + IntToStr(cvirRead.versionNumber) + ")")
            // filer.setStreamPosition(filer.getStreamPosition + size);
            //  	result := false;
            //    exit;
        }
        result = true
        return result
    }
    
    // stream out class ref num which can be used for loading
    streamUsingFiler(filer: PdFiler): void {
        let theSize: long
        let endPosition: long
        let sizePosition: long
        let startPosition: long
        let cvirClass: PdClassAndVersionInformationRecord
        let cvirRead: PdClassAndVersionInformationRecord
        
        this.classAndVersionInformation(cvirClass)
        if (filer.isWriting()) {
            filer.streamClassAndVersionInformation(cvirClass)
            theSize = -1
            sizePosition = filer.getStreamPosition()
            theSize = filer.streamLongint(theSize)
            startPosition = filer.getStreamPosition()
            this.streamDataWithFiler(filer, cvirClass)
            endPosition = filer.getStreamPosition()
            filer.setStreamPosition(sizePosition)
            // size does not include itself or object header
            theSize = endPosition - startPosition
            theSize = filer.streamLongint(theSize)
            filer.setStreamPosition(endPosition)
        } else if (filer.isReading()) {
            filer.streamClassAndVersionInformation(cvirRead)
            theSize = filer.streamLongint(theSize)
            startPosition = filer.getStreamPosition()
            if (this.verifyClassAndVersionInformation(filer, theSize, cvirRead, cvirClass)) {
                this.streamDataWithFiler(filer, cvirRead)
            }
            endPosition = filer.getStreamPosition()
            if (endPosition < startPosition + theSize) {
                // handle if haven't read everything due to additions or other version handling...
                filer.setStreamPosition(startPosition + theSize)
            } else if (endPosition > startPosition + theSize) {
                throw new PdExceptionFilerReadPastEndOfObject.create("Problem reading file: Read past the end of class " + IntToStr(cvirRead.classNumber) + " ver " + IntToStr(cvirRead.versionNumber) + " add " + IntToStr(cvirRead.additionNumber))
            }
        }
    }
    
    // sublasses that include references to other subcomponent objects should instantiate them in an oveeride of this method
    // don't forget to use override in subclasses!
    create(): void {
        TObject.prototype.create.call(this)
    }
    
    // don't forget to use override in subclasses!
    // copy this object to another.  This uses a memory stream rather than
    // field by field copies.  This is done because it is easier to maintain
    // (especiallyf for complex objects like the drawing plant).  Otherwise
    // every change to an objects fields would necessitae maintaining a copy
    // function.  This is slightly less efficient than field by field,
    // however presumeably copy won't be called that often so the speed difference
    // (double the time or more?) will not be noticed.  Note that this can fail
    // if there is no memory for the stream or filer or any subobjects in
    // the copy
    // when using this for plants, be careful to set the soil patch
    // in the copy to something desireable before calling
    copyTo(newCopy: PdStreamableObject): void {
        let memoryStream: TMemoryStream
        let filer: PdFiler
        
        if (this.classType !== newCopy.classType) {
            throw new GeneralException.create("Problem: copyTo can only be used with objects of identical class types; in method PdStreamableObject.copyTo.")
        }
        memoryStream = delphi_compatability.TMemoryStream.create
        filer = PdFiler().createWithStream(memoryStream)
        filer.setToWritingMode()
        this.streamUsingFiler(filer)
        // move to start of stream
        memoryStream.Seek(0, 0)
        filer.setToReadingMode()
        newCopy.streamUsingFiler(filer)
        filer.free
        memoryStream.free
    }
    
    countSize(): long {
        let result = 0
        let memoryStream: TMemoryStream
        let filer: PdFiler
        
        memoryStream = delphi_compatability.TMemoryStream.create
        filer = PdFiler().createWithStream(memoryStream)
        filer.setToCountingMode()
        this.streamUsingFiler(filer)
        result = filer.bytesStreamed
        filer.free
        memoryStream.free
        return result
    }
    
}

export class PdExceptionFiler {
    size: long = 0
    PdExceptionFiler.prototype = new Exception()
    PdExceptionFiler.prototype.constructor = PdExceptionFiler
    
    // PdFiler 
    createWithSizeAndMessage(theSize: long, theMessage: string): void {
        this.create(theMessage)
        this.size = theSize
    }
    
}

export class PdExceptionFilerUnexpectedClassNumber {
    PdExceptionFilerUnexpectedClassNumber.prototype = new PdExceptionFiler()
    PdExceptionFilerUnexpectedClassNumber.prototype.constructor = PdExceptionFilerUnexpectedClassNumber
    
}

export class PdExceptionFilerUnexpectedVersionNumber {
    PdExceptionFilerUnexpectedVersionNumber.prototype = new PdExceptionFiler()
    PdExceptionFilerUnexpectedVersionNumber.prototype.constructor = PdExceptionFilerUnexpectedVersionNumber
    
}

export class PdExceptionFilerReadPastEndOfObject {
    PdExceptionFilerReadPastEndOfObject.prototype = new PdExceptionFiler()
    PdExceptionFilerReadPastEndOfObject.prototype.constructor = PdExceptionFilerReadPastEndOfObject
    
}

//
// { when i switched to all 32-bit, i looked at this and it was all commented out and never used. so
//  i am taking it out. }
//    class procedure copyFile(Source, Dest: shortstring);
// class procedure PdFiler.copyFile(Source, Dest: shortstring);
// (*var
//  SourceHand, DestHand: Integer;
//  OpenBuf: TOFStruct;
// begin
//  { Place null-terminators at the end of the strings, so we can emulate a }
//  { PChar.  Note that (for safety) this will truncate a string if it is   }
//  { 255 characters long, but that's beyond the DOS filename limit anyway. }
//  { Open source file, and pass our psuedo-PChar as the filename }
//  SourceHand := LZOpenFile(pchar(Source), OpenBuf, of_Share_Deny_Write or of_Read);
//  { raise an exception on error }
//  if SourceHand = -1 then
//    raise EInOutError.Create('Error opening source file');
//  { Open destination file, and pass our psuedo-PChar as the filename }
//  DestHand := LZOpenFile(pchar(Dest), OpenBuf, of_Share_Exclusive or of_Write
//                         or of_Create);
//  { close source and raise exception on error }
//  if DestHand = -1 then begin
//    LZClose(SourceHand);
//    raise EInOutError.Create('Error opening destination file');
//  end;
//  try
//    { copy source to dest, raise exception on error }
//    if LZCopy(SourceHand, DestHand) < 0 then
//      raise EInOutError.Create('Error copying file');
//  finally
//    { whether or not an exception occurs, we need to close the files }
//    LZClose(SourceHand);
//    LZClose(DestHand);
//  end;
// end; 
