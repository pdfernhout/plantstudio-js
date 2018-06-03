// PdFiler was unit Ufiler

import { TRect } from "./TRect"
import { short, long, byte, float, double, TColor, TColorRef, IntToStr } from "./common"
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
            throw new Error("SReadError")
        }
    }
    
    setToWritingMode(): void {
        this.mode = PdFilerMode.filerModeWriting
        this.bytesStreamed = 0
        if (this.stream === null) {
            // was LoadStr( )
            throw new Error("SWriteError")
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
    
    streamBoolean(aBoolean: boolean): void {
        aBoolean = this.streamBytes(aBoolean, FIX_sizeof(boolean))
        return aBoolean
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
    
    streamSingle(aSingle: float): void {
        aSingle = this.streamBytes(aSingle, FIX_sizeof(single))
        return aSingle
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

    streamRect(aColorRef: TColorRef): void {
        aColorRef = this.streamBytes(aColorRef, FIX_sizeof(delphi_compatability.TColorRef))
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
        throw new Error("Problem: Subclass should override; in method PdStreamableObject.classAndVersionInformation.")
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
            throw new Error("Problem reading file at: " + size + ". This file may be corrupt. (Expected class " + IntToStr(cvirClass.classNumber) + " read class " + IntToStr(cvirRead.classNumber) + ")")
            // filer.setStreamPosition(filer.getStreamPosition + size);
            //  	result := false;
            //    exit;  
        }
        if (cvirRead.versionNumber !== cvirClass.versionNumber) {
            // assuming that later can read earlier or will issue error
            // if caller wants to recover - can manually create object and read size bytes
            throw new Error("Problem reading file at: " + size + ". This file is of a different version than the program. (Class " + IntToStr(cvirClass.classNumber) + " version " + IntToStr(cvirClass.versionNumber) + " cannot read version " + IntToStr(cvirRead.versionNumber) + ")")
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
                throw new Error("Problem reading file: Read past the end of class " + IntToStr(cvirRead.classNumber) + " ver " + IntToStr(cvirRead.versionNumber) + " add " + IntToStr(cvirRead.additionNumber))
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
            throw new Error("Problem: copyTo can only be used with objects of identical class types; in method PdStreamableObject.copyTo.")
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

