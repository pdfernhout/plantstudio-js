// unit Ustats

import * as m from "mithril"
import { ColorDefs, float, int, intround, IntToStr, long, short } from "./common"
import { PdPlant } from "./PdPlant"
import { PdPlantStatistics, Statistics } from "./PdTraverser"
import { TRect } from "./TRect"
import { digitValueString, len, Rect } from "./usupport"
import { domain } from "./PdDomain"
import { intMax } from "./umath"
import { convertColor } from "./KfDrawingSurface"

// from conversion_common import *
// import ubmpsupport
// import udomain
// import umath
// import usupport
// import utravers
// import uppanel
// import uplant
// import delphi_compatability

const kLive = 0
const kDead = 1
const kBothLiveAndDead = 2

const kMinGraphWidth = 50

export class PdStatsPanel {
    plant: PdPlant | null = null
    // TOD PDF: Fix or remove: drawBitmap: TBitmap = new TBitmap()
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
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     result = uppanel.kItemNone
    //     return result
    // }
    
    // collapsedHeight(): int {
    //     let result = 0
    //     result = this.textHeight + uppanel.kTopBottomGap
    //     return result
    // }
    
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
        // TOD PDF: FIx or remove: this.Invalidate()
    }
    
    // resizeElements(): void {
    //     let fullRect: TRect
        
    //     if (this.textHeight === 0) {
    //         this.calculateTextDimensions()
    //     }
    //     if (this.maxLabelWidth === 0) {
    //         this.paint()
    //     }
    //     fullRect = Rect(0, 0, kMinGraphWidth + this.maxLabelWidth + uppanel.kLeftRightGap * 2 + uppanel.kBetweenGap, (this.numNonZeroPlantParts() + 2) * this.textHeight + uppanel.kTopBottomGap * 2 + uppanel.kBetweenGap * 2)
    //     this.ClientHeight = intMax(0, intMax(usupport.rHeight(fullRect), this.Parent.ClientHeight))
    //     this.ClientWidth = intMax(0, intMax(usupport.rWidth(fullRect), this.Parent.ClientWidth))
    //     try {
    //         this.drawBitmap.Width = this.ClientWidth
    //         this.drawBitmap.Height = this.ClientHeight
    //     } catch (e) {
    //         this.drawBitmap.Width = 1
    //         this.drawBitmap.Height = 1
    //     }
    //     this.updateDisplay()
    // }
    
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
    
    // paint(): void {
    //     let fullRect: TRect
    //     let minRect: TRect = new TRect()
    //     let maxRect: TRect
    //     let minText: string
    //     let maxText: string
    //     let percentText: string
    //     let i: short
    //     let partType: short
    //     let topPos: short
    //     let labelTexts: string[] = Array(Statistics.kStatisticsPartTypeLast + 1)
    //     let hasStuff: boolean
        
    //     fullRect = this.GetClientRect()
    //     this.Canvas.Font = this.Font
    //     if (this.textHeight === 0) {
    //         this.calculateTextDimensions()
    //     }
    //     if (this.plant !== null) {
    //         // v2.0 + ' (% of total)'
    //         percentText = "Statistics for " + this.plant.getName()
    //     } else {
    //         // v2.0
    //         percentText = "(no plants selected)"
    //     }
    //     this.percentRect.Top = fullRect.Top + uppanel.kTopBottomGap
    //     this.percentRect.Bottom = this.percentRect.Top + this.textHeight
    //     this.percentRect.Left = fullRect.Left + uppanel.kLeftRightGap
    //     // v2.0 bold font
    //     this.Canvas.Font.Style = {UNRESOLVED.fsBold, }
    //     this.percentRect.Right = this.percentRect.Left + this.Canvas.TextWidth(percentText)
    //     this.Canvas.Font.Style = {}
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         labelTexts[i] = this.labelStringForPartTypeIndex(i)
    //     }
    //     topPos = this.percentRect.Bottom + uppanel.kBetweenGap
    //     this.maxLabelWidth = 0
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         this.labelRects[i] = Rect(0, 0, 0, 0)
    //     }
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         this.labelRects[i].Left = uppanel.kLeftRightGap
    //         this.labelRects[i].Right = this.labelRects[i].Left + this.Canvas.TextWidth(labelTexts[i])
    //         if (this.labelRects[i].Right - this.labelRects[i].Left > this.maxLabelWidth) {
    //             this.maxLabelWidth = this.labelRects[i].Right - this.labelRects[i].Left
    //         }
    //         this.labelRects[i].Top = topPos
    //         if (labelTexts[i] === "") {
    //             this.labelRects[i].Bottom = this.labelRects[i].Top
    //         } else {
    //             this.labelRects[i].Bottom = this.labelRects[i].Top + this.textHeight
    //         }
    //         topPos = topPos + (this.labelRects[i].Bottom - this.labelRects[i].Top)
    //         if (this.labelRects[i].Right - this.labelRects[i].Left > this.maxLabelWidth) {
    //             this.maxLabelWidth = this.labelRects[i].Right - this.labelRects[i].Left
    //         }
    //     }
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         // set all label widths equal to largest, so can right-justify them 
    //         this.labelRects[i].Right = this.labelRects[i].Left + this.maxLabelWidth
    //     }
    //     this.graphRect.Left = uppanel.kLeftRightGap + this.maxLabelWidth + uppanel.kBetweenGap
    //     this.graphRect.Right = fullRect.Right - uppanel.kLeftRightGap
    //     this.graphRect.Top = this.percentRect.Bottom + uppanel.kBetweenGap
    //     this.graphRect.Bottom = fullRect.Bottom - uppanel.kTopBottomGap - this.textHeight - uppanel.kBetweenGap
    //     minText = "0"
    //     minRect.Left = this.graphRect.Left
    //     minRect.Right = minRect.Left + this.Canvas.TextWidth(minText)
    //     minRect.Top = this.graphRect.Bottom
    //     minRect.Bottom = minRect.Top + this.textHeight
    //     maxText = "100 %"
    //     maxRect = minRect.copy()
    //     maxRect.Right = this.graphRect.Right
    //     maxRect.Left = maxRect.Right - this.Canvas.TextWidth(maxText)
    //     this.drawBitmap.Canvas.Brush.Color = ColorDefs.clBtnFace
    //     // v1.4
    //     this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBtnFace
    //     this.drawBitmap.Canvas.Rectangle(0, 0, this.drawBitmap.Width, this.drawBitmap.Height)
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         if (this.labelRects[i].Bottom <= this.graphRect.Bottom) {
    //             partType = this.partTypeForIndex(i)
    //             hasStuff = (this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType] > 0) || (this.statistics.count[partType] > 0)
    //             this.drawTextLabel(labelTexts[i], this.labelRects[i], hasStuff, false, false)
    //         }
    //     }
    //     if (this.plant !== null) {
    //         this.drawGraph()
    //     }
    //     this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    //     if (this.plant !== null) {
    //         this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBtnText
    //     } else {
    //         this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBtnFace
    //     }
    //     this.drawBitmap.Canvas.Rectangle(this.graphRect.Left, this.graphRect.Top, this.graphRect.Right, this.graphRect.Bottom)
    //     // v2.0 top label in bold
    //     this.Canvas.Font.Style = {UNRESOLVED.fsBold, }
    //     this.drawTextLabel(percentText, this.percentRect, (this.plant !== null), false, false)
    //     this.Canvas.Font.Style = {}
    //     if (this.plant !== null) {
    //         this.drawTextLabel(minText, minRect, true, false, false)
    //         this.drawTextLabel(maxText, maxRect, true, false, false)
    //     }
    //     if (this.drawBitmap.Width > 0) {
    //         ubmpsupport.copyBitmapToCanvasWithGlobalPalette(this.drawBitmap, this.Canvas, Rect(0, 0, 0, 0))
    //     }
    // }
    
    // drawTextLabel(text: string, drawRect: TRect, active: boolean, drawLine: boolean, drawBox: boolean): void {
    //     if (text !== "") {
    //         this.drawBitmap.Canvas.Font = this.Font
    //         if (active) {
    //             this.drawBitmap.Canvas.Font.Color = ColorDefs.clBtnText
    //         } else {
    //             this.drawBitmap.Canvas.Font.Color = ColorDefs.clBtnShadow
    //         }
    //         // changed DT_LEFT to DT_RIGHT to right-justify labels; ok because nothing else matters here 
    //         UNRESOLVED.winprocs.drawText(this.drawBitmap.Canvas.Handle, text, len(text), drawRect, delphi_compatability.DT_RIGHT)
    //     }
    //     if (drawLine) {
    //         this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBtnShadow
    //         this.drawBitmap.Canvas.MoveTo(drawRect.Left, drawRect.Bottom - 2)
    //         this.drawBitmap.Canvas.LineTo(drawRect.Right, drawRect.Bottom - 2)
    //     }
    //     if (drawBox) {
    //         this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBtnShadow
    //         this.drawBitmap.Canvas.MoveTo(drawRect.Right + 2, drawRect.Top)
    //         this.drawBitmap.Canvas.LineTo(drawRect.Left - 2, drawRect.Top)
    //         this.drawBitmap.Canvas.LineTo(drawRect.Left - 2, drawRect.Bottom - 2)
    //         this.drawBitmap.Canvas.LineTo(drawRect.Right + 2, drawRect.Bottom - 2)
    //         this.drawBitmap.Canvas.LineTo(drawRect.Right + 2, drawRect.Top)
    //     }
    // }
    
    // drawGraph(): void {
    //     let i: long
    //     let partType: long
        
    //     this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
    //     this.drawBitmap.Canvas.Pen.Color = ColorDefs.clBlack
    //     this.drawBitmap.Canvas.Pen.Width = 1
    //     this.drawBitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
    //     for (i = 0; i <= Statistics.kStatisticsPartTypeLast; i++) {
    //         if (this.labelRects[i].Bottom <= this.graphRect.Bottom) {
    //             partType = this.partTypeForIndex(i)
    //             // first draw all biomass 
    //             this.drawBitmap.Canvas.Brush.Color = ColorDefs.clBlack
    //             this.drawBar(i, this.displayPercentForPartType(partType, kDead))
    //             // next draw only live biomass 
    //             this.drawBitmap.Canvas.Brush.Color = ColorDefs.clLime
    //             this.drawBar(i, this.displayPercentForPartType(partType, kLive))
    //         }
    //     }
    //     this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    // }
    
    // drawBar(index: int, amount_pctMPB: float): void {
    //     let distance: long
    //     let drawRect: TRect
        
    //     distance = this.graphRect.Left + intround(amount_pctMPB / 100.0 * (this.graphRect.Right - this.graphRect.Left))
    //     drawRect = Rect(this.graphRect.Left, this.labelRects[index].Top, distance, this.labelRects[index].Bottom)
    //     this.drawBitmap.Canvas.Rectangle(drawRect.Left, drawRect.Top, drawRect.Right, drawRect.Bottom)
    // }
    
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
                    m("div.w-50.tr", label),
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
        return m("div", graphLines)
    }

    view(vnode: any) {
        this.plant = vnode.attrs.plant
        // TODO PDF: Optimize calculating statistics repeatedly if possible
        this.updatePlantValues()
        return m("div.ba.pa1", this.viewGraph(), m("div.mt1.f7", this.getHint()))
    }
    
}

