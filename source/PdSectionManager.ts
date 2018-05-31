// PdSectionManager was unit Usection

import { short } from "./common"
import { PdParameter } from "./PdParameter"
import { domain } from "./PdDomain"
import { PdSection } from "./PdSection"

export class PdSectionManager {
    sections: PdSection[] = []
    // v2.1
    orthogonalSections: PdSection[] = []
    
    addSection(aName: string): PdSection {
        const section = new PdSection()
        section.name = aName
        this.sections.push(section)
        return section
    }
    
    // v2.1
    addOrthogonalSection(aName: string): PdSection {
        const section = new PdSection()
        section.name = aName
        this.orthogonalSections.push(section)
        // put in one header param so they can easily open and close all the items
        // header type
        domain.parameterManager.addParameterForSection(
            section.name,
            "",
            new PdParameter().make(
                1000 + this.orthogonalSections.length,
                "header",
                section.name,
                7,
                0,
                0,
                0,
                0,
                0,
                0.00000000,
                0.00000000,
                "",
                false,
                false,
                "",
                0,
                "These parameters can also be found in other (main) sections, but you may want to look at them together here."
            )
        )
        return section
    }
    
    sectionForName(aName: string): PdSection | null {
        if (this.sections.length > 0) {
            for (let i = 0; i < this.sections.length; i++) {
                const section = this.sections[i]
                if (aName === section.name) {
                    return section
                }
            }
        }
        if (this.orthogonalSections.length > 0) {
            for (let i = 0; i < this.orthogonalSections.length; i++) {
                // v2.1
                const section = this.orthogonalSections[i]
                if (aName === section.name) {
                    return section
                }
            }
        }
        return null
    }
    
    // v2.1 override changed to use section and parameter name
    parameterForSectionAndName(aSectionName: string, aParameterName: string): PdParameter | null {
        if (aSectionName === "") {
            // a stab at backward compatibility - if no section name, try to find param anyway
            const parameter = domain.parameterManager.parameterForName(aParameterName)
            if (parameter !== null) {
                return parameter
            }
        } else if (this.sections.length > 0) {
            for (let i = 0; i < this.sections.length; i++) {
                const section = this.sections[i]
                if (aSectionName === section.name) {
                    for (let j = 0; j < section.numSectionItems; j++) {
                        const fieldNumber = section.sectionItems[j]
                        const parameter = domain.parameterManager.parameterForFieldNumber(fieldNumber)
                        if ((parameter !== null) && (parameter.name === aParameterName)) {
                            return parameter
                        }
                    }
                }
            }
        }
        return null
    }
    
}
