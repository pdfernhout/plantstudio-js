// PdFiler was unit Ufiler

import { TRect } from "./TRect"
import { short, long, byte, float, double, TColor, TColorRef, IntToStr, TMemoryStream, TFileStream } from "./common"
import { TPoint } from "./TPoint"
import { ClassId } from "./uclasses";
import { SinglePoint } from "./usupport";

//  For every streamable object,
//  	Set class number to constant from uclasses.
//    Increment version number if change streamed structure (watch out for base class streaming changes!).
//    Increment addition number if add new field and older program versions can ignore it and you can default it.
//      In addition case, check additions number in streamDataWithFiler.
//      When create new version, you should usually reset additions to zero and
//      	remove additions testing code in streaming.

// record
export class PdClassAndVersionInformationRecord {
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
    stream: TFileStream
    mode: PdFilerMode
    bytesStreamed: long = 0

    // TODO: Maybe fixup TFileStream so has TStream superclass and is defined that way here?
    constructor(aStream: TFileStream) {
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
        return this.mode === PdFilerMode.filerModeReading
    }
    
    isWriting(): boolean {
        return this.mode === PdFilerMode.filerModeWriting
    }
    
    isCounting(): boolean {
        return this.mode === PdFilerMode.filerModeCounting
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
        aBoolean = this.streamBytes(aBoolean, 1)
        return aBoolean
    }
    
    streamSmallint(aSmallint: short): short {
        aSmallint = this.streamBytes(aSmallint, 2)
        return aSmallint
    }
    
    streamLongint(aLongint: long): long {
        aLongint = this.streamBytes(aLongint, 4)
        return aLongint
    }
    
    streamByte(aByte: byte): void {
        aByte = this.streamBytes(aByte, 1)
        return aByte
    }
    
    streamSingle(aSingle: float): float {
        aSingle = this.streamBytes(aSingle, 4)
        return aSingle
    }
    
    streamSinglePoint(aPoint: SinglePoint): void {
        aPoint.x = this.streamSingle(aPoint.x)
        aPoint.y = this.streamSingle(aPoint.x)
    }
    
    streamRect(aRect: TRect): void {
        aRect.Left = this.streamSmallint(aRect.Left)
        aRect.Top = this.streamSmallint(aRect.Top)
        aRect.Right = this.streamSmallint(aRect.Right)
        aRect.Bottom = this.streamSmallint(aRect.Bottom)
    }

    streamColorRef(aColorRef: TColorRef): void {
        aColorRef = this.streamBytes(aColorRef, 4)
    }
    
    // class level streaming
    save(fileName: string, objectToSave: PdStreamableObject): void {
        const fileStream = new TFileStream(fileName, TFileStream.fmOpenWrite | TFileStream.fmCreate)
        const filer = new PdFiler(fileStream)
        filer.setToWritingMode()
        objectToSave.streamUsingFiler(filer)
    }
    
    // class save/load functions
    load(fileName: string, objectToLoad: PdStreamableObject): void {
        const fileStream = new TFileStream(fileName, TFileStream.fmOpenRead)
        const filer = new PdFiler(fileStream)
        filer.setToReadingMode()
        objectToLoad.streamUsingFiler(filer)
    }
    
    getStreamPosition(): long {
        return this.stream.Position
    }
    
    setStreamPosition(position: long): void {
        this.stream.position = position
    }
    
}

export class PdStreamableObject {
    
    // PdStreamableObject
    // use for auto creating classes when type not known
    // use for checking if structure has changed
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdStreamableObject
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
        if (cvirRead.classNumber !== cvirClass.classNumber) {
            throw new Error("Problem reading file for field with size: " + size + ". This file may be corrupt. (Expected class " + IntToStr(cvirClass.classNumber) + " read class " + IntToStr(cvirRead.classNumber) + ")")
            // filer.setStreamPosition(filer.getStreamPosition + size)
            // return false 
        }
        if (cvirRead.versionNumber !== cvirClass.versionNumber) {
            // assuming that later can read earlier or will issue error
            // if caller wants to recover -- can manually create object and read size bytes
            throw new Error("Problem reading file for field with size: " + size + ". This file is of a different version than the program. (Class " + IntToStr(cvirClass.classNumber) + " version " + IntToStr(cvirClass.versionNumber) + " cannot read version " + IntToStr(cvirRead.versionNumber) + ")")
            // filer.setStreamPosition(filer.getStreamPosition + size);
            // return false
        }
        return true
    }
    
    // stream out class ref num which can be used for loading
    streamUsingFiler(filer: PdFiler): void {
        let cvirClass: PdClassAndVersionInformationRecord = new PdClassAndVersionInformationRecord()
        let cvirRead: PdClassAndVersionInformationRecord = new PdClassAndVersionInformationRecord()
        
        this.classAndVersionInformation(cvirClass)
        if (filer.isWriting()) {
            filer.streamClassAndVersionInformation(cvirClass)
            let theSize: long = -1
            const sizePosition = filer.getStreamPosition()
            theSize = filer.streamLongint(theSize)
            const startPosition = filer.getStreamPosition()
            this.streamDataWithFiler(filer, cvirClass)
            const endPosition = filer.getStreamPosition()
            filer.setStreamPosition(sizePosition)
            // size does not include itself or object header
            theSize = endPosition - startPosition
            theSize = filer.streamLongint(theSize)
            filer.setStreamPosition(endPosition)
        } else if (filer.isReading()) {
            filer.streamClassAndVersionInformation(cvirRead)
            let theSize: long = 0
            theSize = filer.streamLongint(theSize)
            const startPosition = filer.getStreamPosition()
            if (this.verifyClassAndVersionInformation(filer, theSize, cvirRead, cvirClass)) {
                this.streamDataWithFiler(filer, cvirRead)
            }
            const endPosition = filer.getStreamPosition()
            if (endPosition < startPosition + theSize) {
                // handle if haven't read everything due to additions or other version handling...
                filer.setStreamPosition(startPosition + theSize)
            } else if (endPosition > startPosition + theSize) {
                throw new Error("Problem reading file: Read past the end of class " + IntToStr(cvirRead.classNumber) + " ver " + IntToStr(cvirRead.versionNumber) + " add " + IntToStr(cvirRead.additionNumber))
            }
        }
    }
    
    // sublasses that include references to other subcomponent objects should instantiate them in an override of this constructor
    constructor() {
        // Does nothing
    }
    
    // don't forget to use override in subclasses!
    // copy this object to another. This uses a memory stream rather than
    // field by field copies. This is done because it is easier to maintain
    // (especially for complex objects like the drawing plant). Otherwise
    // every change to an objects fields would necessitate maintaining a copy
    // function. This is slightly less efficient than field by field,
    // however presumeably copy won't be called that often so the speed difference
    // (double the time or more?) will not be noticed. Note that this can fail
    // if there is no memory for the stream or filer or any subobjects in
    // the copy
    // when using this for plants, be careful to set the soil patch
    // in the copy to something desireable before calling
    copyTo(newCopy: PdStreamableObject): void {
        if (this.constructor !== newCopy.constructor) {
            throw new Error("Problem: copyTo can only be used with objects of identical class types; in method PdStreamableObject.copyTo.")
        }
        const memoryStream = new TMemoryStream()
        const filer = new PdFiler(memoryStream)
        filer.setToWritingMode()
        this.streamUsingFiler(filer)
        // move to start of stream
        memoryStream.Seek(0, 0)
        filer.setToReadingMode()
        newCopy.streamUsingFiler(filer)
    }
    
    countSize(): long {
        const memoryStream = new TMemoryStream()
        const filer = new PdFiler(memoryStream)
        filer.setToCountingMode()
        this.streamUsingFiler(filer)
        return filer.bytesStreamed
    }
    
}

