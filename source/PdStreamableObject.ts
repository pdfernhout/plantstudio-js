// PdStreamableObject split from PdFiler / ufiler

import { PdClassAndVersionInformationRecord, PdFiler } from "./PdFiler";
import { long, TMemoryStream, IntToStr, TFileStream } from "./common";
import { ClassId } from "./uclasses";

export class PdStreamableObject {
    
    // TODO: Decide what to do about instanceSize -- otherwise size estimates are too small
    get instanceSize() {
        return 100
    }

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
        memoryStream.Seek(0, TFileStream.soFromBeginning)
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
