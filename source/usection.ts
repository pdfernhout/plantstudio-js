// unit Usection

from conversion_common import *
import udebug
import udomain
import uparams
import ucollect
import delphi_compatability

// const
const kMaxSectionItems = 200



// v2.0 increased
export class PdSection {
    numSectionItems: short = 0
    sectionItems: short[] /* kMaxSectionItems + 1 */ = Array(kMaxSectionItems + 1)
    name: string = ""
    showInParametersWindow: boolean = false
    expanded: boolean = false
    isOrthogonal: boolean = false
    
    // v2.1
    // ----------------------------------------------------------------- PdSection 
    addSectionItem(newSectionItem: short): void {
        this.numSectionItems += 1
        this.sectionItems[this.numSectionItems - 1] = newSectionItem
    }
    
    getName(): string {
        let result = ""
        result = this.name
        return result
    }
    
    setName(newName: string): void {
        this.name = newName
    }
    
}

export class PdSectionManager {
    sections: TListCollection = new TListCollection()
    orthogonalSections: TListCollection = new TListCollection()
    
    // ----------------------------------------------------------------- PdSectionManager 
    create(): void {
        TObject.prototype.create.call(this)
        this.sections = ucollect.TListCollection().Create()
        // v2.1
        this.orthogonalSections = ucollect.TListCollection().Create()
    }
    
    destroy(): void {
        this.sections.free
        this.sections = null
        // v2.1
        this.orthogonalSections.free
        this.orthogonalSections = null
        TObject.prototype.destroy.call(this)
    }
    
    addSection(aName: string): PdSection {
        let result = new PdSection()
        let section: PdSection
        
        section = PdSection.create
        section.name = aName
        this.sections.Add(section)
        result = section
        return result
    }
    
    // v2.1
    addOrthogonalSection(aName: string): PdSection {
        let result = new PdSection()
        let section: PdSection
        let i: short
        
        section = PdSection.create
        section.name = aName
        this.orthogonalSections.Add(section)
        // put in one header param so they can easily open and close all the items
        //header type
        udomain.domain.parameterManager.addParameterForSection(section.name, "", uparams.PdParameter().make(1000 + this.orthogonalSections.Count, "header", section.name, 7, 0, 0, 0, 0, 0, 0.00000000, 0.00000000, "", false, false, "", 0, "These parameters can also be found in other (main) sections, but you may want to look at together here."))
        result = section
        return result
    }
    
    sectionForName(aName: string): PdSection {
        let result = new PdSection()
        let i: short
        let section: PdSection
        
        result = null
        if (this.sections.Count > 0) {
            for (i = 0; i <= this.sections.Count - 1; i++) {
                section = PdSection(this.sections.Items[i])
                if (aName === section.name) {
                    result = section
                    return result
                }
            }
        }
        if (this.orthogonalSections.Count > 0) {
            for (i = 0; i <= this.orthogonalSections.Count - 1; i++) {
                // v2.1
                section = PdSection(this.orthogonalSections.Items[i])
                if (aName === section.name) {
                    result = section
                    return result
                }
            }
        }
        return result
    }
    
    // v2.1 override changed to use section and parameter name
    parameterForSectionAndName(aSectionName: string, aParameterName: string): PdParameter {
        let result = new PdParameter()
        let i: short
        let j: short
        let fieldNumber: short
        let section: PdSection
        let parameter: PdParameter
        
        result = null
        if (aSectionName === "") {
            // a stab at backward compatibility - if no section name, try to find param anyway
            parameter = null
            parameter = udomain.domain.parameterManager.parameterForName(aParameterName)
            if (parameter !== null) {
                result = parameter
                return result
            }
        } else if (this.sections.Count > 0) {
            for (i = 0; i <= this.sections.Count - 1; i++) {
                section = PdSection(this.sections.Items[i])
                if (aSectionName === section.name) {
                    for (j = 0; j <= section.numSectionItems - 1; j++) {
                        fieldNumber = section.sectionItems[j]
                        parameter = null
                        parameter = udomain.domain.parameterManager.parameterForFieldNumber(fieldNumber)
                        if ((parameter !== null) && (parameter.name === aParameterName)) {
                            result = parameter
                            return result
                        }
                    }
                }
            }
        }
        return result
    }
    
}

