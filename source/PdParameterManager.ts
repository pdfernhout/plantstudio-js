// unit Uparams

import { short, float, int, long, IntToStr, compareTextIgnoreCase } from "./common"
import { domain } from "./PdDomain"
import { CreateParameters, CreateParameters_SecondHalf } from "./umakepm"
import { PdParameter, FieldType, IndexType } from "./PdParameter"

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
            case FieldType.kFieldUndefined:
                result = "Undefined"
                break
            case FieldType.kFieldFloat:
                result = "Single"
                break
            case FieldType.kFieldSmallint:
                result = "Smallint"
                break
            case FieldType.kFieldColor:
                result = "Color"
                break
            case FieldType.kFieldBoolean:
                result = "Boolean"
                break
            case FieldType.kFieldThreeDObject:
                result = "3D object"
                break
            case FieldType.kFieldEnumeratedList:
                result = "List of choices"
                break
            case FieldType.kFieldLongint:
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
            case IndexType.kIndexTypeUndefined:
                result = "Undefined"
                break
            case IndexType.kIndexTypeNone:
                result = "None"
                break
            case IndexType.kIndexTypeSCurve:
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
        CreateParameters(this)
    }
    
}
