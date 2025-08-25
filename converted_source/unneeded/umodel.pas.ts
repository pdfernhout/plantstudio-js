// unit Umodel

from conversion_common import *
import usupport
import uclasses
import delphi_compatability

// const
const kGetField = 0
const kSetField = 1
const kModelNameLength = 80



export class PdModel {
    name: string = ""
    wholeModelUpdateNeeded: boolean = false
    
    // --------------------------------------------------------------------- PdModel
    getName(): string {
        let result = ""
        result = this.name
        return result
    }
    
    setName(newName: string): void {
        this.name = UNRESOLVED.copy(newName, 1, kModelNameLength)
    }
    
    transferField(direction: int, value: FIX_MISSING_ARG_TYPE, fieldID: short, fieldType: short, updateList: TListCollection): void {
        //var
        //    oldSingle: single;
        //    oldInteger: integer; 
        // MOST SIMPLE CASE - JUST CALL directTransferField 
        //oldSingle := 0.0;
        //  oldInteger := 0;
        //  if d = kSetField then
        //    begin
        //    if ft = kFieldFloat then
        //      directTransferField(kGetField, oldSingle, fieldID, ft, index, deriveMethod, updateList)
        //    else if ft = kFieldInt then
        //      directTransferField(kGetField, oldInteger, fieldID, ft, index, deriveMethod, updateList);
        //    end; 
        value = this.directTransferField(direction, value, fieldID, fieldType, updateList)
        //case fieldID of
        //     add special cases here - special cases may use oldSingle or oldInteger values
        //    end;
        return value
    }
    
    directTransferField(direction: int, value: FIX_MISSING_ARG_TYPE, fieldID: short, fieldType: short, updateList: TListCollection): void {
        //do nothing - subclass can override
        return value
    }
    
    addToUpdateList(fieldID: int, updateList: TListCollection): void {
        let updateEvent: PdModelUpdateEvent
        
        if (updateList === null) {
            return
        }
        updateEvent = PdModelUpdateEvent.create
        updateEvent.model = this
        updateEvent.fieldID = fieldID
        updateList.add(updateEvent)
    }
    
    //may need to limit length of string copy?
    //MFD = MoveFieldData
    MFD(objectValue: FIX_MISSING_ARG_TYPE, value: FIX_MISSING_ARG_TYPE, fieldType: int, direction: int): void {
        if (direction === kGetField) {
            switch (fieldType) {
                case UNRESOLVED.kFieldFloat:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldInt:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldUnsignedLong:
                    //unsigned?
                    value = objectValue
                    break
                case UNRESOLVED.kFieldUnsignedChar:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldString:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldFileString:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldColor:
                    delphi_compatability.TColorRef(value) = delphi_compatability.TColorRef(objectValue)
                    break
                case UNRESOLVED.kFieldBoolean:
                    value = objectValue
                    break
                case UNRESOLVED.kFieldEnumeratedList:
                    value = objectValue
                    break
                default:
                    throw new GeneralException.create("Unsupported model transfer to field " + IntToStr(fieldType))
                    break
            }
        } else if (direction === kSetField) {
            switch (fieldType) {
                case UNRESOLVED.kFieldFloat:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldInt:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldUnsignedLong:
                    //unsigned?
                    objectValue = value
                    break
                case UNRESOLVED.kFieldUnsignedChar:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldString:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldFileString:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldColor:
                    delphi_compatability.TColorRef(objectValue) = delphi_compatability.TColorRef(value)
                    break
                case UNRESOLVED.kFieldBoolean:
                    objectValue = value
                    break
                case UNRESOLVED.kFieldEnumeratedList:
                    objectValue = value
                    break
                default:
                    throw new GeneralException.create("Unsupported model transfer to field " + IntToStr(fieldType))
                    break
            }
        }
        return objectValue, value
    }
    
}

export class PdModelUpdateEvent {
    model: PdModel = new PdModel()
    fieldID: int = 0
    fieldIndex: int = 0
    
}

