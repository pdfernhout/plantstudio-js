// unit Ustats

from conversion_common import *
import ubmpsupport
import udomain
import umath
import usupport
import utravers
import uppanel
import uplant
import delphi_compatability

// const
const kLive = 0
const kDead = 1
const kBothLiveAndDead = 2


// const
const kMinGraphWidth = 50



export class PdStatsPanel {
    drawBitmap: TBitmap = new TBitmap()
    statistics: PdPlantStatistics = new PdPlantStatistics()
    graphRect: TRect = new TRect()
    percentRect: TRect = new TRect()
    labelRects: TRect[] /* kStatisticsPartTypeLast + 1 */ = Array(kStatisticsPartTypeLast + 1)
    maxLabelWidth: short = 0
    PdStatsPanel.prototype = new PdParameterPanel()
    PdStatsPanel.prototype.constructor = PdStatsPanel
    
    create(anOwner: TComponent): void {
        PdParameterPanel.prototype.create.call(this, anOwner)
        this.plant = null
        this.PopupMenu = null
        this.drawBitmap = delphi_compatability.TBitmap().Create()
        this.statistics = utravers.PdPlantStatistics.create
        this.ParentFont = true
        this.OnMouseUp = this.doMouseUp
        this.OnKeyDown = this.doKeyDown
        this.TabStop = true
        this.Enabled = true
        this.selectedItemIndex = uppanel.kItemNone
        this.BevelInner = UNRESOLVED.bvNone
        this.BevelOuter = UNRESOLVED.bvNone
        this.updateHint()
    }
    
    updateHint(): void {
        if (udomain.domain.options.showLongHintsForButtons) {
            this.Hint = "Parts of the plant showing counts and percent of total biomass taken up by" + " each plant part. You can't change anything here; it is for display only." + " See the help system for details."
        } else {
            this.Hint = ""
        }
        this.ShowHint = true
    }
    
    destroy(): void {
        this.drawBitmap.free
        this.drawBitmap = null
        this.statistics.free
        this.statistics = null
        PdParameterPanel.prototype.destroy.call(this)
    }
    
    maxSelectedItemIndex(): int {
        let result = 0
        result = uppanel.kItemNone
        return result
    }
    
    collapsedHeight(): int {
        let result = 0
        result = this.textHeight + uppanel.kTopBottomGap
        return result
    }
    
    collapseOrExpand(y: int): void {
        // do nothing 
    }
    
    updatePlant(newPlant: PdPlant): void {
        if (this.plant !== newPlant) {
            this.plant = newPlant
            this.updateCurrentValue(0)
        }
    }
    
    updatePlantValues(): void {
        this.updateCurrentValue(0)
        // NOT refresh 
        this.Repaint()
    }
    
    updateCurrentValue(): void {
        this.statistics.zeroAllFields()
        this.Enabled = false
        if (this.plant === null) {
            return
        }
        this.plant.getPlantStatistics(this.statistics)
        this.Enabled = true
        this.updateDisplay()
    }
    
    updateDisplay(): void {
        if (this.plant === null) {
            return
        }
        this.Invalidate()
    }
    
    resizeElements(): void {
        let fullRect: TRect
        
        if (this.textHeight === 0) {
            this.calculateTextDimensions()
        }
        if (this.maxLabelWidth === 0) {
            this.paint()
        }
        fullRect = Rect(0, 0, kMinGraphWidth + this.maxLabelWidth + uppanel.kLeftRightGap * 2 + uppanel.kBetweenGap, (this.numNonZeroPlantParts() + 2) * this.textHeight + uppanel.kTopBottomGap * 2 + uppanel.kBetweenGap * 2)
        this.ClientHeight = umath.intMax(0, umath.intMax(usupport.rHeight(fullRect), this.Parent.ClientHeight))
        this.ClientWidth = umath.intMax(0, umath.intMax(usupport.rWidth(fullRect), this.Parent.ClientWidth))
        try {
            this.drawBitmap.Width = this.ClientWidth
            this.drawBitmap.Height = this.ClientHeight
        } catch (e) {
            this.drawBitmap.Width = 1
            this.drawBitmap.Height = 1
        }
        this.updateDisplay()
    }
    
    labelStringForPartType(index: short): string {
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
        result = result + ": " + usupport.digitValueString(this.displayPercentForPartType(partType, kBothLiveAndDead)) + "%"
        return result
    }
    
    displayPercentForPartType(partType: short, livingDeadOrBoth: short): float {
        let result = 0.0
        let total_pctMPB: float
        
        result = 0.0
        total_pctMPB = this.statistics.liveBiomass_pctMPB[utravers.kStatisticsPartTypeAllVegetative] + this.statistics.deadBiomass_pctMPB[utravers.kStatisticsPartTypeAllVegetative] + this.statistics.liveBiomass_pctMPB[utravers.kStatisticsPartTypeAllReproductive] + this.statistics.deadBiomass_pctMPB[utravers.kStatisticsPartTypeAllReproductive]
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
        result = umath.min(100.0, umath.max(0.0, 100.0 * result / total_pctMPB))
        return result
    }
    
    numNonZeroPlantParts(): short {
        let result = 0
        let i: short
        let partType: short
        let hasStuff: boolean
        
        result = 0
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            partType = this.partTypeForIndex(i)
            hasStuff = (this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType] > 0) || (this.statistics.count[partType] > 0)
            if (hasStuff) {
                result += 1
            }
        }
        return result
    }
    
    paint(): void {
        let fullRect: TRect
        let minRect: TRect
        let maxRect: TRect
        let minText: string
        let maxText: string
        let percentText: string
        let i: short
        let partType: short
        let topPos: short
        let labelTexts: ansistring[] /* kStatisticsPartTypeLast + 1 */
        let hasStuff: boolean
        
        fullRect = this.GetClientRect()
        this.Canvas.Font = this.Font
        if (this.textHeight === 0) {
            this.calculateTextDimensions()
        }
        if (this.plant !== null) {
            // v2.0 + ' (% of total)'
            percentText = "Statistics for " + this.plant.getName()
        } else {
            // v2.0
            percentText = "(no plants selected)"
        }
        this.percentRect.Top = fullRect.Top + uppanel.kTopBottomGap
        this.percentRect.Bottom = this.percentRect.Top + this.textHeight
        this.percentRect.Left = fullRect.Left + uppanel.kLeftRightGap
        // v2.0 bold font
        this.Canvas.Font.Style = {UNRESOLVED.fsBold, }
        this.percentRect.Right = this.percentRect.Left + this.Canvas.TextWidth(percentText)
        this.Canvas.Font.Style = {}
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            labelTexts[i] = this.labelStringForPartType(i)
        }
        topPos = this.percentRect.Bottom + uppanel.kBetweenGap
        this.maxLabelWidth = 0
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            this.labelRects[i] = Rect(0, 0, 0, 0)
        }
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            this.labelRects[i].Left = uppanel.kLeftRightGap
            this.labelRects[i].Right = this.labelRects[i].Left + this.Canvas.TextWidth(labelTexts[i])
            if (this.labelRects[i].Right - this.labelRects[i].Left > this.maxLabelWidth) {
                this.maxLabelWidth = this.labelRects[i].Right - this.labelRects[i].Left
            }
            this.labelRects[i].Top = topPos
            if (labelTexts[i] === "") {
                this.labelRects[i].Bottom = this.labelRects[i].Top
            } else {
                this.labelRects[i].Bottom = this.labelRects[i].Top + this.textHeight
            }
            topPos = topPos + (this.labelRects[i].Bottom - this.labelRects[i].Top)
            if (this.labelRects[i].Right - this.labelRects[i].Left > this.maxLabelWidth) {
                this.maxLabelWidth = this.labelRects[i].Right - this.labelRects[i].Left
            }
        }
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            // set all label widths equal to largest, so can right-justify them 
            this.labelRects[i].Right = this.labelRects[i].Left + this.maxLabelWidth
        }
        this.graphRect.Left = uppanel.kLeftRightGap + this.maxLabelWidth + uppanel.kBetweenGap
        this.graphRect.Right = fullRect.Right - uppanel.kLeftRightGap
        this.graphRect.Top = this.percentRect.Bottom + uppanel.kBetweenGap
        this.graphRect.Bottom = fullRect.Bottom - uppanel.kTopBottomGap - this.textHeight - uppanel.kBetweenGap
        minText = "0"
        minRect.Left = this.graphRect.Left
        minRect.Right = minRect.Left + this.Canvas.TextWidth(minText)
        minRect.Top = this.graphRect.Bottom
        minRect.Bottom = minRect.Top + this.textHeight
        maxText = "100 %"
        maxRect = minRect
        maxRect.Right = this.graphRect.Right
        maxRect.Left = maxRect.Right - this.Canvas.TextWidth(maxText)
        this.drawBitmap.Canvas.Brush.Color = UNRESOLVED.clBtnFace
        // v1.4
        this.drawBitmap.Canvas.Pen.Color = UNRESOLVED.clBtnFace
        this.drawBitmap.Canvas.Rectangle(0, 0, this.drawBitmap.Width, this.drawBitmap.Height)
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            if (this.labelRects[i].Bottom <= this.graphRect.Bottom) {
                partType = this.partTypeForIndex(i)
                hasStuff = (this.statistics.liveBiomass_pctMPB[partType] + this.statistics.deadBiomass_pctMPB[partType] > 0) || (this.statistics.count[partType] > 0)
                this.drawTextLabel(labelTexts[i], this.labelRects[i], hasStuff, false, false)
            }
        }
        if (this.plant !== null) {
            this.drawGraph()
        }
        this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
        if (this.plant !== null) {
            this.drawBitmap.Canvas.Pen.Color = UNRESOLVED.clBtnText
        } else {
            this.drawBitmap.Canvas.Pen.Color = UNRESOLVED.clBtnFace
        }
        this.drawBitmap.Canvas.Rectangle(this.graphRect.Left, this.graphRect.Top, this.graphRect.Right, this.graphRect.Bottom)
        // v2.0 top label in bold
        this.Canvas.Font.Style = {UNRESOLVED.fsBold, }
        this.drawTextLabel(percentText, this.percentRect, (this.plant !== null), false, false)
        this.Canvas.Font.Style = {}
        if (this.plant !== null) {
            this.drawTextLabel(minText, minRect, true, false, false)
            this.drawTextLabel(maxText, maxRect, true, false, false)
        }
        if (this.drawBitmap.Width > 0) {
            ubmpsupport.copyBitmapToCanvasWithGlobalPalette(this.drawBitmap, this.Canvas, Rect(0, 0, 0, 0))
        }
    }
    
    drawTextLabel(text: string, drawRect: TRect, active: boolean, drawLine: boolean, drawBox: boolean): void {
        let cText: char[] /* 255 + 1 */
        
        if (text !== "") {
            this.drawBitmap.Canvas.Font = this.Font
            if (active) {
                this.drawBitmap.Canvas.Font.Color = UNRESOLVED.clBtnText
            } else {
                this.drawBitmap.Canvas.Font.Color = UNRESOLVED.clBtnShadow
            }
            UNRESOLVED.strPCopy(cText, text)
            // changed DT_LEFT to DT_RIGHT to right-justify labels; ok because nothing else matters here 
            UNRESOLVED.winprocs.drawText(this.drawBitmap.Canvas.Handle, cText, len(cText), drawRect, delphi_compatability.DT_RIGHT)
        }
        if (drawLine) {
            this.drawBitmap.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
            this.drawBitmap.Canvas.MoveTo(drawRect.Left, drawRect.Bottom - 2)
            this.drawBitmap.Canvas.LineTo(drawRect.Right, drawRect.Bottom - 2)
        }
        if (drawBox) {
            this.drawBitmap.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
            this.drawBitmap.Canvas.MoveTo(drawRect.Right + 2, drawRect.Top)
            this.drawBitmap.Canvas.LineTo(drawRect.Left - 2, drawRect.Top)
            this.drawBitmap.Canvas.LineTo(drawRect.Left - 2, drawRect.Bottom - 2)
            this.drawBitmap.Canvas.LineTo(drawRect.Right + 2, drawRect.Bottom - 2)
            this.drawBitmap.Canvas.LineTo(drawRect.Right + 2, drawRect.Top)
        }
    }
    
    drawGraph(): void {
        let i: long
        let partType: long
        
        this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsSolid
        this.drawBitmap.Canvas.Pen.Color = delphi_compatability.clBlack
        this.drawBitmap.Canvas.Pen.Width = 1
        this.drawBitmap.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
        for (i = 0; i <= utravers.kStatisticsPartTypeLast; i++) {
            if (this.labelRects[i].Bottom <= this.graphRect.Bottom) {
                partType = this.partTypeForIndex(i)
                // first draw all biomass 
                this.drawBitmap.Canvas.Brush.Color = delphi_compatability.clBlack
                this.drawBar(i, this.displayPercentForPartType(partType, kDead))
                // next draw only live biomass 
                this.drawBitmap.Canvas.Brush.Color = delphi_compatability.clLime
                this.drawBar(i, this.displayPercentForPartType(partType, kLive))
            }
        }
        this.drawBitmap.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    }
    
    drawBar(index: int, amount_pctMPB: float): void {
        let distance: long
        let drawRect: TRect
        
        distance = this.graphRect.Left + intround(amount_pctMPB / 100.0 * (this.graphRect.Right - this.graphRect.Left))
        drawRect = Rect(this.graphRect.Left, this.labelRects[index].Top, distance, this.labelRects[index].Bottom)
        this.drawBitmap.Canvas.Rectangle(drawRect.Left, drawRect.Top, drawRect.Right, drawRect.Bottom)
    }
    
    nameForPartType(partType: short, isSingular: boolean): string {
        let result = ""
        result = ""
        switch (partType) {
            case utravers.kStatisticsPartTypeSeedlingLeaf:
                if (isSingular) {
                    result = "seedling leaf"
                } else {
                    result = "seedling leaves"
                }
                break
            case utravers.kStatisticsPartTypeLeaf:
                if (isSingular) {
                    result = "leaf"
                } else {
                    result = "leaves"
                }
                break
            case utravers.kStatisticsPartTypeFemaleInflorescence:
                if (isSingular) {
                    result = "primary inflorescence"
                } else {
                    result = "primary inflorescences"
                }
                break
            case utravers.kStatisticsPartTypeMaleInflorescence:
                if (isSingular) {
                    result = "secondary inflorescence"
                } else {
                    result = "secondary inflorescences"
                }
                break
            case utravers.kStatisticsPartTypeFemaleFlower:
                if (isSingular) {
                    result = "primary flower"
                } else {
                    result = "primary flowers"
                }
                break
            case utravers.kStatisticsPartTypeFemaleFlowerBud:
                if (isSingular) {
                    result = "primary flower bud"
                } else {
                    result = "primary flower buds"
                }
                break
            case utravers.kStatisticsPartTypeMaleFlower:
                if (isSingular) {
                    result = "secondary flower"
                } else {
                    result = "secondary flowers"
                }
                break
            case utravers.kStatisticsPartTypeMaleFlowerBud:
                if (isSingular) {
                    result = "secondary flower bud"
                } else {
                    result = "secondary flower buds"
                }
                break
            case utravers.kStatisticsPartTypeAxillaryBud:
                if (isSingular) {
                    result = "meristem"
                } else {
                    result = "meristems"
                }
                break
            case utravers.kStatisticsPartTypeFruit:
                if (isSingular) {
                    result = "ripe fruit"
                } else {
                    result = "ripe fruits"
                }
                break
            case utravers.kStatisticsPartTypeStem:
                if (isSingular) {
                    result = "stem internode"
                } else {
                    result = "stem internodes"
                }
                break
            case utravers.kStatisticsPartTypeUnripeFruit:
                if (isSingular) {
                    result = "unripe fruit"
                } else {
                    result = "unripe fruits"
                }
                break
            case utravers.kStatisticsPartTypeFallenFruit:
                if (isSingular) {
                    result = "fallen fruit"
                } else {
                    result = "fallen fruits"
                }
                break
            case utravers.kStatisticsPartTypeUnallocatedNewVegetativeBiomass:
                result = "unallocated vegetative"
                break
            case utravers.kStatisticsPartTypeUnremovedDeadVegetativeBiomass:
                result = "unremoved vegetative"
                break
            case utravers.kStatisticsPartTypeUnallocatedNewReproductiveBiomass:
                result = "unallocated reproductive"
                break
            case utravers.kStatisticsPartTypeUnremovedDeadReproductiveBiomass:
                result = "unremoved reproductive"
                break
            case utravers.kStatisticsPartTypeFallenFlower:
                if (isSingular) {
                    result = "fallen flower"
                } else {
                    result = "fallen flowers"
                }
                break
            case utravers.kStatisticsPartTypeAllVegetative:
                result = "vegetative parts"
                break
            case utravers.kStatisticsPartTypeAllReproductive:
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
                result = utravers.kStatisticsPartTypeAllVegetative
                break
            case 1:
                result = utravers.kStatisticsPartTypeAllReproductive
                break
            case 2:
                result = utravers.kStatisticsPartTypeAxillaryBud
                break
            case 3:
                result = utravers.kStatisticsPartTypeStem
                break
            case 4:
                result = utravers.kStatisticsPartTypeSeedlingLeaf
                break
            case 5:
                result = utravers.kStatisticsPartTypeLeaf
                break
            case 6:
                result = utravers.kStatisticsPartTypeFemaleInflorescence
                break
            case 7:
                result = utravers.kStatisticsPartTypeFemaleFlowerBud
                break
            case 8:
                result = utravers.kStatisticsPartTypeFemaleFlower
                break
            case 9:
                result = utravers.kStatisticsPartTypeMaleInflorescence
                break
            case 10:
                result = utravers.kStatisticsPartTypeMaleFlowerBud
                break
            case 11:
                result = utravers.kStatisticsPartTypeMaleFlower
                break
            case 12:
                result = utravers.kStatisticsPartTypeFallenFlower
                break
            case 13:
                result = utravers.kStatisticsPartTypeUnripeFruit
                break
            case 14:
                result = utravers.kStatisticsPartTypeFruit
                break
            case 15:
                result = utravers.kStatisticsPartTypeFallenFruit
                break
            case 16:
                result = utravers.kStatisticsPartTypeUnallocatedNewVegetativeBiomass
                break
            case 17:
                result = utravers.kStatisticsPartTypeUnremovedDeadVegetativeBiomass
                break
            case 18:
                result = utravers.kStatisticsPartTypeUnallocatedNewReproductiveBiomass
                break
            case 19:
                result = utravers.kStatisticsPartTypeUnremovedDeadReproductiveBiomass
                break
            default:
                // called by paint method, so do not raise exception 
                result = 0
                break
        }
        return result
    }
    
}

