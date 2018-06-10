import { short, float, int } from "./common"

export enum FieldType {
    kFieldUndefined = 0,
    kFieldFloat = 1,
    kFieldSmallint = 2,
    kFieldColor = 3,
    kFieldBoolean = 4,
    kFieldThreeDObject = 5,
    kFieldEnumeratedList = 6,
    kFieldHeader = 7,
    kFieldLongint = 8,
}

export enum IndexType {
    kIndexTypeUndefined = 0,
    kIndexTypeNone = 1,
    kIndexTypeSCurve = 3,
}

export enum TransferType {
    kTransferTypeUndefined = 0,
    kTransferTypeMFD = 1,
    kTransferTypeGetSetSCurve = 2,
    kTransferTypeObject3D = 3,
}

// TOOD: Should kNotArray go with FieldType?
export const kNotArray = -1

// FieldType 
//note: the longint type is NOT for use for parameters (in param panels or breeding).
//     if you want to use a longint for a parameter, you have to
//     update the breeding method and the method that creates param panels. the smallint panel will not
//     work correctly with a longint as it is now (but you could subclass it if you need one).
// IndexType - for arrays 
// transferType - how data is transferred to and from model object 
//mfd is short for MoveFieldData
export class PdParameter {
    fieldNumber: short = 0
    fieldID: string = ""
    name: string = ""
    fieldType: short = 0
    indexType: short = 0
    unitSet: short = 0
    unitModel: short = 0
    unitMetric: short = 0
    unitEnglish: short = 0
    lowerBoundOriginal: float = 0.0
    upperBoundOriginal: float = 0.0
    defaultValueStringOriginal: string = ""
    cannotOverride: boolean = false
    isOverridden: boolean = false
    lowerBoundOverride: float = 0.0
    upperBoundOverride: float = 0.0
    defaultValueStringOverride: string = ""
    regrow: boolean = false
    readOnly: boolean = false
    accessString: string = ""
    transferType: short = 0
    hint: string = ""
    valueHasBeenReadForCurrentPlant: boolean = false
    collapsed: boolean = false
    originalSectionName: string = ""
    
    //must be whole string to allow for tdos
    // v2.1
    // ---------------------------------------------------------- PdParameter 
    constructor() {
        this.collapsed = true
    }
    
    make(aFieldNumber: short, aFieldID: string, aName: string, aFieldType: short, anIndexType: short, aUnitSet: short, aUnitModel: short, aUnitMetric: short, aUnitEnglish: short, aLowerBound: float, anUpperBound: float, aDefaultValueString: string, aRegrow: boolean, aReadOnly: boolean, anAccessString: string, aTransferType: short, aHint: string): PdParameter {
        this.fieldNumber = aFieldNumber
        // TODO: Are these strign limites for fieldID and name and accessString still needed?
        this.fieldID = aFieldID.substring(0, 80)
        this.name = aName.substring(0, 80)
        this.fieldType = aFieldType
        // v2.0 headers can have hints
        this.hint = aHint
        if (this.fieldType === FieldType.kFieldHeader) {
            return this
        }
        this.indexType = anIndexType
        this.unitSet = aUnitSet
        this.unitModel = aUnitModel
        this.unitMetric = aUnitMetric
        this.unitEnglish = aUnitEnglish
        this.lowerBoundOriginal = aLowerBound
        this.upperBoundOriginal = anUpperBound
        this.defaultValueStringOriginal = aDefaultValueString
        this.regrow = aRegrow
        this.readOnly = aReadOnly
        this.accessString = anAccessString.substring(0, 80)
        this.transferType = aTransferType
        // hint := aHint;
        return this
    }
    
    indexCount(): int {
        let result = 0
        result = 1
        switch (this.indexType) {
            case IndexType.kIndexTypeUndefined:
                result = 1
                break
            case IndexType.kIndexTypeNone:
                result = 1
                break
            case IndexType.kIndexTypeSCurve:
                result = 4
                break
            default:
                throw new Error("Problem: Unexpected index type in method PdParameter.indexCount.")
        }
        return result
    }
    
    getName(): string {
        return this.name
    }
    
    setName(newName: string): void {
        this.name = newName.substring(0, 80)
    }
    
    lowerBound(): float {
        let result = 0.0
        if ((!this.cannotOverride) && (this.isOverridden)) {
            result = this.lowerBoundOverride
        } else {
            result = this.lowerBoundOriginal
        }
        return result
    }
    
    upperBound(): float {
        let result = 0.0
        if ((!this.cannotOverride) && (this.isOverridden)) {
            result = this.upperBoundOverride
        } else {
            result = this.upperBoundOriginal
        }
        return result
    }
    
    defaultValueString(): string {
        let result = ""
        if ((!this.cannotOverride) && (this.isOverridden)) {
            result = this.defaultValueStringOverride
        } else {
            result = this.defaultValueStringOriginal
        }
        return result
    }
    
    getHint(): string {
        return this.hint
    }
    
}
