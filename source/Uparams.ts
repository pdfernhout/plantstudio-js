import { short, float, int, long, IntToStr, compareTextIgnoreCase } from "./common";
import { domain } from "./PdDomain";

// unit Uparams

/* TODO: Remove unused imports
from conversion_common import *
import udomain
import umakepm
import uunits
import usection
import usupport
import uexcept
import ucollect
import delphi_compatability
*/

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
        if (this.fieldType === kFieldHeader) {
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

export class PdParameterManager {
    parameters: PdParameter[] = []
    
    addParameter(newParameter: PdParameter): void {
        if (newParameter !== null) {
            this.parameters.push(newParameter)
        }
    }
    
    addParameterForSection(sectionName: string, orthogonalSectionName: string, newParameter: PdParameter): void {
        let section = domain.sectionManager.sectionForName(sectionName)
        if (section === null) {
            section = domain.sectionManager.addSection(sectionName)
            // the 'no section' section is hidden from the parameters window but we still want the section for writing out 
            section.showInParametersWindow = !compareTextIgnoreCase(sectionName, "(no section)")
        }
        this.addParameter(newParameter)
        // TODO: superfluous test -- section can't be null at this point
        if (section !== null) {
            newParameter.originalSectionName = sectionName
            section.addSectionItem(newParameter.fieldNumber)
        }
        // v2.1 orthogonal sections
        // limitation - each param can only have one orthogonal section specified
        // if want to add more later, use delimiter and parse
        orthogonalSectionName = orthogonalSectionName.trim()
        if (orthogonalSectionName !== "") {
            let orthogonalSection = domain.sectionManager.sectionForName(orthogonalSectionName)
            if (orthogonalSection === null) {
                orthogonalSection = domain.sectionManager.addOrthogonalSection(orthogonalSectionName)
                orthogonalSection.showInParametersWindow = true
                orthogonalSection.isOrthogonal = true
            }
            // TODO: superfluous test -- orthogonalSection can't be null at this point
            if (orthogonalSection !== null) {
                orthogonalSection.addSectionItem(newParameter.fieldNumber)
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
        }
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
        }
        return result
    }
    
    parameterForIndex(index: long): PdParameter {
        return this.parameters[index]
    }
    
    clearParameters(): void {
        this.parameters = []
    }
    
    setAllReadFlagsToFalse(): void {
        if (this.parameters.length > 0) {
            for (let i = 0; i < this.parameters.length; i++) {
                this.parameters[i].valueHasBeenReadForCurrentPlant = false
            }
        }
    }
    
    parameterForFieldNumber(fieldNumber: long): PdParameter {
        if (this.parameters.length > 0) {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i]
                if (fieldNumber === parameter.fieldNumber) {
                    return parameter
                }
            }
        }
        throw new Error("Problem: Parameter not found for field number " + IntToStr(fieldNumber) + " in method PdParameterManager.parameterForFieldNumber.")
    }
    
    parameterForFieldID(fieldID: string): PdParameter {
        if (this.parameters.length > 0) {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i]
                if (compareTextIgnoreCase(fieldID.trim(), parameter.fieldID.trim())) {
                    return parameter
                }
            }
        }
        throw new Error("Problem: Parameter not found for field ID " + fieldID + " in method PdParameterManager.parameterForFieldID.")
    }
    
    parameterForName(name: string): PdParameter {
        if (this.parameters.length > 0) {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i]
                if (compareTextIgnoreCase(name.trim(), parameter.name.trim())) {
                    return parameter
                }
            }
        }
        throw new Error("Problem: Parameter not found for name " + name + " in method PdParameterManager.parameterForName.")
    }
    
    parameterIndexForFieldNumber(fieldNumber: long): int {
        if (this.parameters.length > 0) {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i]
                if (fieldNumber === parameter.fieldNumber) {
                    return i
                }
            }
        }
        throw new Error("Problem: Parameter index not found for field number " + IntToStr(fieldNumber) + " in method PdParameterManager.parameterIndexForFieldNumber.")
    }
    
    parameterIndexForFieldID(fieldID: string): int {
        if (this.parameters.length > 0) {
            for (let i = 0; i <= this.parameters.length; i++) {
                const parameter = this.parameters[i]
                if (compareTextIgnoreCase(fieldID.trim(), parameter.fieldID.trim())) {
                    return i
                }
            }
        }
        throw new Error("Problem: Parameter index not found for field ID " + fieldID + " in method PdParameterManager.parameterIndexForFieldID.")
    }
    
    makeParameters(): void {
        umakepm.CreateParameters(this)
        umakepm.CreateParameters_SecondHalf(this)
    }
    
}

