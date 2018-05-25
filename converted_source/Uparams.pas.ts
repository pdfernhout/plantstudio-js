// unit Uparams

from conversion_common import *
import udomain
import umakepm
import uunits
import usection
import usupport
import uexcept
import ucollect
import delphi_compatability

// const
const kFieldUndefined = 0
const kFieldFloat = 1
const kFieldSmallint = 2
const kFieldColor = 3
const kFieldBoolean = 4
const kFieldThreeDObject = 5
const kFieldEnumeratedList = 6
const kFieldHeader = 7
const kFieldLongint = 8
const kIndexTypeUndefined = 0
const kIndexTypeNone = 1
const kIndexTypeSCurve = 3
const kTransferTypeUndefined = 0
const kTransferTypeMFD = 1
const kTransferTypeGetSetSCurve = 2
const kTransferTypeObject3D = 3
const kNotArray = -1



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
    create(): void {
        this.collapsed = true
    }
    
    make(aFieldNumber: short, aFieldID: string, aName: string, aFieldType: short, anIndexType: short, aUnitSet: short, aUnitModel: short, aUnitMetric: short, aUnitEnglish: short, aLowerBound: float, anUpperBound: float, aDefaultValueString: string, aRegrow: boolean, aReadOnly: boolean, anAccessString: string, aTransferType: short, aHint: string): void {
        this.create()
        this.fieldNumber = aFieldNumber
        this.fieldID = UNRESOLVED.copy(aFieldID, 1, 80)
        this.name = UNRESOLVED.copy(aName, 1, 80)
        this.fieldType = aFieldType
        // v2.0 headers can have hints
        this.hint = aHint
        if (this.fieldType === kFieldHeader) {
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
        this.accessString = UNRESOLVED.copy(anAccessString, 1, 80)
        this.transferType = aTransferType
        //hint := aHint;
    }
    
    indexCount(): int {
        let result = 0
        result = 1
        switch (this.indexType) {
            case kIndexTypeUndefined:
                result = 1
                break
            case kIndexTypeNone:
                result = 1
                break
            case kIndexTypeSCurve:
                result = 4
                break
            default:
                throw new GeneralException.create("Problem: Unexpected index type in method PdParameter.indexCount.")
                break
        return result
    }
    
    getName(): string {
        let result = ""
        result = this.name
        return result
    }
    
    setName(newName: string): void {
        this.name = UNRESOLVED.copy(newName, 1, 80)
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
        let result = ""
        result = this.hint
        return result
    }
    
}

export class PdParameterManager {
    parameters: TListCollection = new TListCollection()
    
    // ---------------------------------------------------- PdParameterManager 
    create(): void {
        TObject.prototype.create.call(this)
        this.parameters = ucollect.TListCollection().Create()
    }
    
    destroy(): void {
        this.parameters.free
        this.parameters = null
        TObject.prototype.destroy.call(this)
    }
    
    addParameter(newParameter: PdParameter): void {
        if (newParameter !== null) {
            this.parameters.Add(newParameter)
        }
    }
    
    addParameterForSection(sectionName: string, orthogonalSectionName: string, newParameter: PdParameter): void {
        let section: PdSection
        
        section = null
        section = udomain.domain.sectionManager.sectionForName(sectionName)
        if (section === null) {
            section = udomain.domain.sectionManager.addSection(sectionName)
            // the 'no section' section is hidden from the parameters window but we still want the section for writing out 
            section.showInParametersWindow = !(uppercase(sectionName) === uppercase("(no section)"))
        }
        this.addParameter(newParameter)
        if (section !== null) {
            newParameter.originalSectionName = sectionName
            section.addSectionItem(newParameter.fieldNumber)
        }
        // v2.1 orthogonal sections
        // limitation - each param can only have one orthogonal section specified
        // if want to add more later, use delimiter and parse
        orthogonalSectionName = trim(orthogonalSectionName)
        if (orthogonalSectionName !== "") {
            section = null
            section = udomain.domain.sectionManager.sectionForName(orthogonalSectionName)
            if (section === null) {
                section = udomain.domain.sectionManager.addOrthogonalSection(orthogonalSectionName)
                section.showInParametersWindow = true
                section.isOrthogonal = true
            }
            if (section !== null) {
                section.addSectionItem(newParameter.fieldNumber)
            }
        }
    }
    
    fieldTypeName(fieldType: int): string {
        let result = ""
        switch (fieldType) {
            case kFieldUndefined:
                result = "Undefined"
                break
            case kFieldFloat:
                result = "Single"
                break
            case kFieldSmallint:
                result = "Smallint"
                break
            case kFieldColor:
                result = "Color"
                break
            case kFieldBoolean:
                result = "Boolean"
                break
            case kFieldThreeDObject:
                result = "3D object"
                break
            case kFieldEnumeratedList:
                result = "List of choices"
                break
            case kFieldLongint:
                result = "Longint"
                break
            default:
                result = "not in list"
                break
        return result
    }
    
    indexTypeName(indexType: int): string {
        let result = ""
        switch (indexType) {
            case kIndexTypeUndefined:
                result = "Undefined"
                break
            case kIndexTypeNone:
                result = "None"
                break
            case kIndexTypeSCurve:
                result = "S curve"
                break
            default:
                result = "not in list"
                break
        return result
    }
    
    parameterForIndex(index: long): PdParameter {
        let result = new PdParameter()
        result = this.parameters.Items[index]
        return result
    }
    
    clearParameters(): void {
        this.parameters.clear()
    }
    
    setAllReadFlagsToFalse(): void {
        let i: short
        
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                PdParameter(this.parameters.Items[i]).valueHasBeenReadForCurrentPlant = false
            }
        }
    }
    
    parameterForFieldNumber(fieldNumber: long): PdParameter {
        let result = new PdParameter()
        let i: short
        let parameter: PdParameter
        
        result = null
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                parameter = PdParameter(this.parameters.Items[i])
                if (fieldNumber === parameter.fieldNumber) {
                    result = parameter
                    return result
                }
            }
        }
        throw new GeneralException.create("Problem: Parameter not found for field number " + IntToStr(fieldNumber) + " in method PdParameterManager.parameterForFieldNumber.")
        return result
    }
    
    parameterForFieldID(fieldID: string): PdParameter {
        let result = new PdParameter()
        let i: short
        let parameter: PdParameter
        
        result = null
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                parameter = PdParameter(this.parameters.Items[i])
                if (trim(uppercase(fieldID)) === trim(uppercase(parameter.fieldID))) {
                    result = parameter
                    return result
                }
            }
        }
        throw new GeneralException.create("Problem: Parameter not found for field ID " + fieldID + " in method PdParameterManager.parameterForFieldID.")
        return result
    }
    
    parameterForName(name: string): PdParameter {
        let result = new PdParameter()
        let i: short
        let parameter: PdParameter
        
        result = null
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                parameter = PdParameter(this.parameters.Items[i])
                if (trim(uppercase(name)) === trim(uppercase(parameter.name))) {
                    result = parameter
                    return result
                }
            }
        }
        throw new GeneralException.create("Problem: Parameter not found for name " + name + " in method PdParameterManager.parameterForName.")
        return result
    }
    
    parameterIndexForFieldNumber(fieldNumber: long): int {
        let result = 0
        let i: short
        let parameter: PdParameter
        
        result = 0
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                parameter = PdParameter(this.parameters.Items[i])
                if (fieldNumber === parameter.fieldNumber) {
                    result = i
                    return result
                }
            }
        }
        throw new GeneralException.create("Problem: Parameter index not found for field number " + IntToStr(fieldNumber) + " in method PdParameterManager.parameterIndexForFieldNumber.")
        return result
    }
    
    parameterIndexForFieldID(fieldID: string): int {
        let result = 0
        let i: short
        let parameter: PdParameter
        
        result = 0
        if (this.parameters.Count > 0) {
            for (i = 0; i <= this.parameters.Count - 1; i++) {
                parameter = PdParameter(this.parameters.Items[i])
                if (trim(uppercase(fieldID)) === trim(uppercase(parameter.fieldID))) {
                    result = i
                    return result
                }
            }
        }
        throw new GeneralException.create("Problem: Parameter index not found for field ID " + fieldID + " in method PdParameterManager.parameterIndexForFieldID.")
        return result
    }
    
    makeParameters(): void {
        umakepm.CreateParameters(this)
        umakepm.CreateParameters_SecondHalf(this)
    }
    
}

