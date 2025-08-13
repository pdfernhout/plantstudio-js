// unit Ustats

import * as m from "mithril"
import { ColorDefs, float, int, IntToStr, short } from "./common"
import { PdPlant } from "./PdPlant"
import { PdPlantStatistics, Statistics } from "./PdTraverser"
import { TRect } from "./TRect"
import { digitValueString } from "./usupport"
import { domain } from "./PdDomain"
import { convertColor } from "./KfDrawingSurface"

const kLive = 0
const kDead = 1
const kBothLiveAndDead = 2

export class PdStatsPanel {
    plant: PdPlant | null = null
    statistics: PdPlantStatistics = new PdPlantStatistics()
    graphRect: TRect = new TRect()
    percentRect: TRect = new TRect()
    labelRects: TRect[] = Array(Statistics.kStatisticsPartTypeLast + 1)
    maxLabelWidth: short = 0
    
    getHint(): string {
        if (domain.options.showLongHintsForButtons) {
            return "This is a chart of parts of the plant showing counts and percent of total biomass taken up by" + 
            " each plant part. You can't change anything here; it is for display only." + 
            " See the help system for details."
        } else {
            return "Parts of the plant showing counts and percent of total biomass"
        }
    }
    
    collapseOrExpand(y: int): void {
        // do nothing 
    }
    
    updatePlant(newPlant: PdPlant): void {
        if (this.plant !== newPlant) {
            this.plant = newPlant
            this.updateCurrentValue()
        }
    }
    
    updatePlantValues(): void {
        this.updateCurrentValue()
        // NOT refresh 
        // TOD PDF: Fix or remove: this.Repaint()
    }
    
    updateCurrentValue(): void {
        this.statistics.zeroAllFields()
        // TOD PDF: Fix or remove: this.Enabled = false
        if (this.plant === null) {
            return
        }
        this.plant.getPlantStatistics(this.statistics)
        // TOD PDF: Fix or remove: this.Enabled = true
        this.updateDisplay()
    }
    
    updateDisplay(): void {
        if (this.plant === null) {
            return
        }
    }

    labelStringForPartTypeIndex(index: short): string {
        let result = ""
        let partType: short
        let hasStuff: boolean
        
        result = ""
        partType = this.partTypeForIndex(index)
        hasStuff = (this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType] > 0) || (this.statistics.count[partType] > 0)
        if (!hasStuff) {
            return result
        }
        if (this.statistics.count[partType] > 0) {
            result = IntToStr(this.statistics.count[partType]) + " "
        }
        result = result + this.nameForPartType(partType, this.statistics.count[partType] === 1)
        result = result + ": " + digitValueString(this.displayPercentForPartType(partType, kBothLiveAndDead)) + "%"
        return result
    }
    
    displayPercentForPartType(partType: short, livingDeadOrBoth: short): float {
        let result = 0.0
        let total_pctMPB: float
        
        result = 0.0
        total_pctMPB = this.statistics.liveBiomass_pctMPB[Statistics.kStatisticsPartTypeAllVegetative] + this.statistics.deadBiomass_pctMPB[Statistics.kStatisticsPartTypeAllVegetative] + this.statistics.liveBiomass_pctMPB[Statistics.kStatisticsPartTypeAllReproductive] + this.statistics.deadBiomass_pctMPB[Statistics.kStatisticsPartTypeAllReproductive]
        if (total_pctMPB === 0.0) {
            return result
        }
        switch (livingDeadOrBoth) {
            case kLive:
                result = this.statistics.liveBiomass_pctMPB[partType]
                break
            case kDead:
                result = this.statistics.deadBiomass_pctMPB[partType]
                break
            case kBothLiveAndDead:
                result = this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType]
                break
        }
        result = Math.min(100.0, Math.max(0.0, 100.0 * result / total_pctMPB))
        return result
    }
    
    numNonZeroPlantParts(): short {
        let result = 0
        let i: short
        let partType: short
        let hasStuff: boolean
        
        result = 0
        for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
            partType = this.partTypeForIndex(i)
            hasStuff = (this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType] > 0) || (this.statistics.count[partType] > 0)
            if (hasStuff) {
                result += 1
            }
        }
        return result
    }
    
    nameForPartType(partType: short, isSingular: boolean): string {
        let result = ""
        result = ""
        switch (partType) {
            case Statistics.kStatisticsPartTypeSeedlingLeaf:
                if (isSingular) {
                    result = "seedling leaf"
                } else {
                    result = "seedling leaves"
                }
                break
            case Statistics.kStatisticsPartTypeLeaf:
                if (isSingular) {
                    result = "leaf"
                } else {
                    result = "leaves"
                }
                break
            case Statistics.kStatisticsPartTypeFemaleInflorescence:
                if (isSingular) {
                    result = "primary inflorescence"
                } else {
                    result = "primary inflorescences"
                }
                break
            case Statistics.kStatisticsPartTypeMaleInflorescence:
                if (isSingular) {
                    result = "secondary inflorescence"
                } else {
                    result = "secondary inflorescences"
                }
                break
            case Statistics.kStatisticsPartTypeFemaleFlower:
                if (isSingular) {
                    result = "primary flower"
                } else {
                    result = "primary flowers"
                }
                break
            case Statistics.kStatisticsPartTypeFemaleFlowerBud:
                if (isSingular) {
                    result = "primary flower bud"
                } else {
                    result = "primary flower buds"
                }
                break
            case Statistics.kStatisticsPartTypeMaleFlower:
                if (isSingular) {
                    result = "secondary flower"
                } else {
                    result = "secondary flowers"
                }
                break
            case Statistics.kStatisticsPartTypeMaleFlowerBud:
                if (isSingular) {
                    result = "secondary flower bud"
                } else {
                    result = "secondary flower buds"
                }
                break
            case Statistics.kStatisticsPartTypeAxillaryBud:
                if (isSingular) {
                    result = "meristem"
                } else {
                    result = "meristems"
                }
                break
            case Statistics.kStatisticsPartTypeFruit:
                if (isSingular) {
                    result = "ripe fruit"
                } else {
                    result = "ripe fruits"
                }
                break
            case Statistics.kStatisticsPartTypeStem:
                if (isSingular) {
                    result = "stem internode"
                } else {
                    result = "stem internodes"
                }
                break
            case Statistics.kStatisticsPartTypeUnripeFruit:
                if (isSingular) {
                    result = "unripe fruit"
                } else {
                    result = "unripe fruits"
                }
                break
            case Statistics.kStatisticsPartTypeFallenFruit:
                if (isSingular) {
                    result = "fallen fruit"
                } else {
                    result = "fallen fruits"
                }
                break
            case Statistics.kStatisticsPartTypeUnallocatedNewVegetativeBiomass:
                result = "unallocated vegetative"
                break
            case Statistics.kStatisticsPartTypeUnremovedDeadVegetativeBiomass:
                result = "unremoved vegetative"
                break
            case Statistics.kStatisticsPartTypeUnallocatedNewReproductiveBiomass:
                result = "unallocated reproductive"
                break
            case Statistics.kStatisticsPartTypeUnremovedDeadReproductiveBiomass:
                result = "unremoved reproductive"
                break
            case Statistics.kStatisticsPartTypeFallenFlower:
                if (isSingular) {
                    result = "fallen flower"
                } else {
                    result = "fallen flowers"
                }
                break
            case Statistics.kStatisticsPartTypeAllVegetative:
                result = "vegetative parts"
                break
            case Statistics.kStatisticsPartTypeAllReproductive:
                result = "reproductive parts"
                break
            default:
                result = ""
                break
        }
        return result
    }
    
    partTypeForIndex(partType: short): short {
        let result = 0
        result = -1
        switch (partType) {
            case 0:
                result = Statistics.kStatisticsPartTypeAllVegetative
                break
            case 1:
                result = Statistics.kStatisticsPartTypeAllReproductive
                break
            case 2:
                result = Statistics.kStatisticsPartTypeAxillaryBud
                break
            case 3:
                result = Statistics.kStatisticsPartTypeStem
                break
            case 4:
                result = Statistics.kStatisticsPartTypeSeedlingLeaf
                break
            case 5:
                result = Statistics.kStatisticsPartTypeLeaf
                break
            case 6:
                result = Statistics.kStatisticsPartTypeFemaleInflorescence
                break
            case 7:
                result = Statistics.kStatisticsPartTypeFemaleFlowerBud
                break
            case 8:
                result = Statistics.kStatisticsPartTypeFemaleFlower
                break
            case 9:
                result = Statistics.kStatisticsPartTypeMaleInflorescence
                break
            case 10:
                result = Statistics.kStatisticsPartTypeMaleFlowerBud
                break
            case 11:
                result = Statistics.kStatisticsPartTypeMaleFlower
                break
            case 12:
                result = Statistics.kStatisticsPartTypeFallenFlower
                break
            case 13:
                result = Statistics.kStatisticsPartTypeUnripeFruit
                break
            case 14:
                result = Statistics.kStatisticsPartTypeFruit
                break
            case 15:
                result = Statistics.kStatisticsPartTypeFallenFruit
                break
            case 16:
                result = Statistics.kStatisticsPartTypeUnallocatedNewVegetativeBiomass
                break
            case 17:
                result = Statistics.kStatisticsPartTypeUnremovedDeadVegetativeBiomass
                break
            case 18:
                result = Statistics.kStatisticsPartTypeUnallocatedNewReproductiveBiomass
                break
            case 19:
                result = Statistics.kStatisticsPartTypeUnremovedDeadReproductiveBiomass
                break
            default:
                // called by paint method, so do not raise exception 
                result = 0
                break
        }
        return result
    }

    viewGraph() {
        const graphLines = []
        for (let i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
            const label = this.labelStringForPartTypeIndex(i)
            const partType = this.partTypeForIndex(i)
            const deadPercent = this.displayPercentForPartType(partType, kDead)
            const livePercent = this.displayPercentForPartType(partType, kLive)
            if (label) console.log("percent", deadPercent, livePercent) 
            if (label) graphLines.push(
                m("div.w-100.flex", 
                    m("div.w-50.tr.mr1", label),
                    m("div.w-50.flex", 
                        (deadPercent > 0) && m("div.ba", { 
                            title: this.nameForPartType(partType, this.statistics.count[partType] === 1) + " dead biomass: " + digitValueString(deadPercent) + "%",
                            style: { 
                                backgroundColor: convertColor(ColorDefs.clGray),
                                borderColor: "black",
                                width: "" + Math.floor(deadPercent) + "%",
                                height: "1rem",
                                title: "" + deadPercent + "%"
                            } 
                        } ),
                        (livePercent > 0) && m("div.ba", {
                            title: this.nameForPartType(partType, this.statistics.count[partType] === 1) + " live biomass: " + digitValueString(livePercent) + "%",
                            style: { 
                                backgroundColor: convertColor(ColorDefs.clLime),
                                borderColor: "black",
                                width: "" + Math.floor(livePercent) + "%",
                                height: "1rem"
                            } 
                        } )
                    )
                )
            )
        }
        return m("div.ba.pa1", graphLines)
    }

    view(vnode: any) {
        this.plant = vnode.attrs.plant
        // TODO PDF: Optimize calculating statistics repeatedly if possible
        this.updatePlantValues()
        return m("div.pa1", this.viewGraph(), m("div.mt1.f7", this.getHint()))
    }
    
}

