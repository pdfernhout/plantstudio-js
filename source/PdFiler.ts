// PdFiler was unit Ufiler

import { TRect } from "./TRect"
import { short, long, byte, float, TColorRef, TFileStream } from "./common"
import { SinglePoint } from "./usupport";
import { PdStreamableObject } from "./PdStreamableObject";

//  For every streamable object,
//  	Set class number to constant from uclasses.
//    Increment version number if change streamed structure (watch out for base class streaming changes!).
//    Increment addition number if add new field and older program versions can ignore it and you can default it.
//      In addition case, check additions number in streamDataWithFiler.
//      When create new version, you should usually reset additions to zero and
//      	remove additions testing code in streaming.

// record
export class PdClassAndVersionInformationRecord {
    classNumber: short = 0
    versionNumber: short = 0
    additionNumber: short = 0
}

export enum PdFilerMode { filerModeReading, filerModeWriting, filerModeCounting }

// const
const kMinWidthOnScreen = 40
const kMinHeightOnScreen = 20

// global functions 

const littleEndian = true

// TODO: EFFICIENCY: This is terribly ineffienct with so much buffer allocation
export class PdFiler {
    stream: TFileStream
    mode: PdFilerMode = 0
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
    private streamBytes(bytes: ArrayBuffer, size: long): void {
        const view = new Uint8ClampedArray(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                const bytesRead = this.stream.ReadBytes(size)
                if (bytesRead.length !== size) {
                    throw new Error("Missing bytes read in streamBytes")
                }
                for (let i = 0; i < size; i++) {
                    view[i] = bytesRead[i]
                }
                break
            case PdFilerMode.filerModeWriting:
                const bytesToWrite: byte[] = []
                for (let i = 0; i < size; i++) {
                    bytesToWrite.push(view[i])
                }          
                this.stream.WriteBuffer(bytesToWrite, size)
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + size
                break
        }
    }
    
    streamClassAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = this.streamSmallint(cvir.classNumber)
        cvir.versionNumber = this.streamSmallint(cvir.versionNumber)
        cvir.additionNumber = this.streamSmallint(cvir.additionNumber)
    }
    
    // TODO: IMPORTANT: Problem handling non-ASCII characters
    streamShortString(aString: string): string {
        let result = aString
        let stringLength
        const bytes = new ArrayBuffer(256)
        const view = new Uint8ClampedArray(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 1)
                stringLength = view[0]
                this.streamBytes(bytes, stringLength)
                result = ""
                for (let i = 0; i < stringLength; i++) {
                    result = result + String.fromCharCode(view[i])
                }
                break
            case PdFilerMode.filerModeWriting:
                stringLength = aString.length
                view[0] = stringLength
                for (let i = 0; i < stringLength; i++) {
                    // TODO: Will munge characetr if out of ASCII range
                    view[i + 1] = aString.charCodeAt(i)
                }
                this.streamBytes(bytes, aString.length + 1)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, aString.length + 1)
                break
        }
        return result
    }
    
    streamBoolean(aBoolean: boolean): boolean {
        let result = aBoolean
        const bytes = new ArrayBuffer(1)
        const view = new Uint8ClampedArray(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 1)
                result = view[0] ? true : false
                break
            case PdFilerMode.filerModeWriting:
                view[0] = aBoolean ? 1 : 0
                this.streamBytes(bytes, 1)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, 1)
                break
        }
        return result
    }
    
    streamSmallint(aSmallint: short): short {
        let result = aSmallint
        const bytes = new ArrayBuffer(2)
        const view = new DataView(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 2)
                result = view.getInt16(0, littleEndian)
                break
            case PdFilerMode.filerModeWriting:
                view.setInt16(0, aSmallint, littleEndian)
                this.streamBytes(bytes, 2)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, 2)
                break
        }
        return result
    }
    
    streamLongint(aLongint: long): long {
        let result = aLongint
        const bytes = new ArrayBuffer(4)
        const view = new DataView(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 4)
                result = view.getInt32(0, littleEndian)
                break
            case PdFilerMode.filerModeWriting:
                view.setInt32(0, aLongint, littleEndian)
                this.streamBytes(bytes, 4)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, 4)
                break
        }
        return result
    }
    
    streamByte(aByte: byte): byte {
        let result = aByte
        const bytes = new ArrayBuffer(1)
        const view = new Uint8ClampedArray(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 1)
                result = view[0]
                break
            case PdFilerMode.filerModeWriting:
                view[0] = aByte
                this.streamBytes(bytes, 1)
                break
            case PdFilerMode.filerModeCounting:
                this.bytesStreamed = this.bytesStreamed + 1
                break
        }
        return result
    }
    
    streamSingle(aSingle: float): float {
        let result = aSingle
        const bytes = new ArrayBuffer(4)
        const view = new DataView(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 4)
                result = view.getFloat32(0, littleEndian)
                break
            case PdFilerMode.filerModeWriting:
                view.setFloat32(0, aSingle, littleEndian)
                this.streamBytes(bytes, 4)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, 4)
                break
        }
        return result
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

    streamColorRef(aColorRef: TColorRef): TColorRef {
        let result = aColorRef
        const bytes = new ArrayBuffer(4)
        const view = new DataView(bytes)
        switch (this.mode) {
            case PdFilerMode.filerModeReading:
                this.streamBytes(bytes, 4)
                result = view.getUint32(0, littleEndian)
                break
            case PdFilerMode.filerModeWriting:
                view.setUint32(0, aColorRef, littleEndian)
                this.streamBytes(bytes, 4)
                break
            case PdFilerMode.filerModeCounting:
                this.streamBytes(bytes, 4)
                break
        }
        return result
    }
    
    // class level streaming
    static save(fileName: string, objectToSave: PdStreamableObject): void {
        const fileStream = new TFileStream(fileName, TFileStream.fmOpenWrite | TFileStream.fmCreate)
        const filer = new PdFiler(fileStream)
        filer.setToWritingMode()
        objectToSave.streamUsingFiler(filer)
    }
    
    // class save/load functions
    static async load(fileName: string, objectToLoad: PdStreamableObject): Promise<void> {
        const fileStream = new TFileStream(fileName, TFileStream.fmOpenRead)
        await fileStream.loaded
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
