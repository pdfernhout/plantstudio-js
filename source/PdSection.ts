import { short } from "./common";

// const
const kMaxSectionItems = 200

// v2.0 increased
export class PdSection {
    numSectionItems: short = 0
    sectionItems: short[] = Array(kMaxSectionItems + 1)
    name: string = ""
    showInParametersWindow: boolean = false
    expanded: boolean = false
    isOrthogonal: boolean = false
    
    // v2.1
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
