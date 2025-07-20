// unit upp_scv

import * as m from "mithril"
import { ColorDefs, float, int, intround } from "./common"
import { FieldType, TransferType } from "./PdParameter"
import { PdParameterPanel } from "./PdParameterPanel"
import { TransferDirection } from "./PdPlant"
import { TRect } from "./TRect"
import { TPoint } from "./TPoint"
import { calcSCurveCoeffsWithResult, SCurveStructure, scurveWithResult } from "./SCurveStructure"
import { convertColor } from "./KfDrawingSurface"
import { domain } from "./PdDomain"
import { PdChangeRealValueCommand } from "./updcom"
import { intMax } from "./umath"

// from conversion_common import *
// import usliders
// import udebug
// import udomain
// import usupport
// import uunits
// import umath
// import updcom
// import umain
// import uppanel
// import uparams
// import uplant
// import delphi_compatability

// const
const kItemPoint1 = 1
const kItemPoint2 = 2
const kItemX1 = 3
const kItemY1 = 4
const kItemX2 = 5
const kItemY2 = 6
const kItemSCurveUnitText = 7

// var
let gRecursing: boolean

export class PdSCurveParameterPanel extends PdParameterPanel {
    editEnabled: boolean = false
    draggingPoint: boolean = false
    currentValues: float[] = Array(4)
    minXValue: float = 0.0
    maxXValue: float = 0.0
    belowZero: boolean = false
    currentUnitIndex: int = 0
    graphRect: TRect = new TRect()
    pointRects: TRect[] = Array(2)
    valueRects: TRect[] = Array(4)
    unitTextRect: TRect = new TRect()
    
    // ----------------------------------------------------------------------------- initialize 
    initialize(): void {
        let temp: float
        
        // this.OnMouseDown = this.doMouseDown
        // this.OnMouseMove = this.doMouseMove
        // this.OnMouseUp = this.doMouseUp
        // this.OnKeyDown = this.doKeyDown
        this.draggingPoint = false
        this.currentUnitIndex = 0
        if (domain.options.useMetricUnits) {
            this.currentUnitIndex = this.param.unitMetric
        } else {
            this.currentUnitIndex = this.param.unitEnglish
        }
        this.minXValue = this.param.lowerBound()
        this.maxXValue = this.param.upperBound()
        this.belowZero = false
        if ((this.minXValue < 0.0)) {
            temp = Math.abs(this.maxXValue)
            this.maxXValue = Math.abs(this.minXValue)
            this.minXValue = temp
            this.belowZero = true
        }
    }
    
    // // ------------------------------------------------------------------------ mouse and key 
    // doMouseDown(sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
    //     let i: int
        
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseDown.call(this, sender, Button, Shift, X, Y)
    //     if (!this.editEnabled) {
    //         return
    //     }
    //     thePoint = Point(X, Y)
    //     for (i = 0; i <= 1; i++) {
    //         if (delphi_compatability.PtInRect(this.pointRects[i], thePoint)) {
    //             this.selectedItemIndex = kItemPoint1 + i
    //             this.draggingPoint = true
    //             // should be only point rect 
    //             this.Invalidate()
    //         }
    //     }
    //     if (!this.Focused()) {
    //         this.SetFocus()
    //     }
    // }
    
    // doMouseMove(sender: TObject, Shift: TShiftState, X: int, Y: int): void {
    //     let i: int
    //     let index: int
    //     let saveValues: float[] /* 3 + 1 */
    //     let failed: boolean
    //     let points: TPoint[] /* 1 + 1 */
        
    //     if (!this.draggingPoint) {
    //         return
    //     }
    //     if (!this.editEnabled) {
    //         return
    //     }
    //     for (i = 0; i <= 3; i++) {
    //         saveValues[i] = this.currentValues[i]
    //     }
    //     index = this.selectedItemIndex - kItemPoint1
    //     // do nothing - to prevent repetitive messages if problem 
    //     try {
    //         points[index] = point(X, Y)
    //         if (index === 0) {
    //             // set other point 
    //             points[1] = this.pointFromXY(this.currentValues[2], this.currentValues[3])
    //         } else {
    //             points[0] = this.pointFromXY(this.currentValues[0], this.currentValues[1])
    //         }
    //         this.keepPointInGraphRect(points[index])
    //         this.keepPointsFromCrossing(points[0], points[1], index)
    //         this.currentValues[index * 2] = this.xValueFromPointPosition(points[index])
    //         this.currentValues[index * 2 + 1] = this.yValueFromPointPosition(points[index])
    //         failed = this.drawSCurve(false, failed)
    //         if (failed) {
    //             for (i = 0; i <= 3; i++) {
    //                 this.currentValues[i] = saveValues[i]
    //             }
    //         }
    //         // whole 
    //         this.Invalidate()
    //     } catch (e) {
    //         // pass
    //     }
    // }
    
    // doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
    //     let i: int
        
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseUp.call(this, Sender, Button, Shift, X, Y)
    //     thePoint = Point(X, Y)
    //     for (i = 0; i <= 1; i++) {
    //         if ((delphi_compatability.PtInRect(this.pointRects[i], thePoint)) && (this.editEnabled)) {
    //             if (this.draggingPoint) {
    //                 this.draggingPoint = false
    //                 this.setPointAfterMouseUp(i, X, Y)
    //                 this.Invalidate()
    //                 return
    //             }
    //         }
    //     }
    //     if (this.draggingPoint) {
    //         this.draggingPoint = false
    //     }
    //     for (i = 0; i <= 3; i++) {
    //         if ((delphi_compatability.PtInRect(this.valueRects[i], thePoint)) && (this.editEnabled)) {
    //             this.selectedItemIndex = i + kItemX1
    //             this.Invalidate()
    //             if (delphi_compatability.TShiftStateEnum.ssShift in Shift) {
    //                 this.adjustAllValuesAtOnce()
    //             } else {
    //                 this.adjustValue()
    //             }
    //             return
    //         }
    //     }
    //     if (delphi_compatability.PtInRect(this.unitTextRect, thePoint)) {
    //         // can still do this if disabled 
    //         this.selectedItemIndex = kItemSCurveUnitText
    //         this.Invalidate()
    //         this.selectNextUnitInSet(delphi_compatability.TShiftStateEnum.ssShift in Shift)
    //     }
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     let increment: int
    //     let index: int
        
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     increment = 2
    //     if (key === delphi_compatability.VK_RETURN) {
    //         switch (this.selectedItemIndex) {
    //             case kItemX1:
    //                 if (delphi_compatability.TShiftStateEnum.ssShift in shift) {
    //                     this.adjustAllValuesAtOnce()
    //                 } else {
    //                     this.adjustValue()
    //                 }
    //                 break
    //             case kItemY1:
    //                 if (delphi_compatability.TShiftStateEnum.ssShift in shift) {
    //                     this.adjustAllValuesAtOnce()
    //                 } else {
    //                     this.adjustValue()
    //                 }
    //                 break
    //             case kItemX2:
    //                 if (delphi_compatability.TShiftStateEnum.ssShift in shift) {
    //                     this.adjustAllValuesAtOnce()
    //                 } else {
    //                     this.adjustValue()
    //                 }
    //                 break
    //             case kItemY2:
    //                 if (delphi_compatability.TShiftStateEnum.ssShift in shift) {
    //                     this.adjustAllValuesAtOnce()
    //                 } else {
    //                     this.adjustValue()
    //                 }
    //                 break
    //             case kItemSCurveUnitText:
    //                 this.selectNextUnitInSet(delphi_compatability.TShiftStateEnum.ssShift in shift)
    //                 break
    //         }
    //     } else if ((this.selectedItemIndex === kItemPoint1) || (this.selectedItemIndex === kItemPoint2)) {
    //         index = this.selectedItemIndex - kItemPoint1
    //         switch (key) {
    //             case delphi_compatability.VK_LEFT:
    //                 this.adjustValueByPixels(index, -increment, 0)
    //                 break
    //             case delphi_compatability.VK_RIGHT:
    //                 this.adjustValueByPixels(index, increment, 0)
    //                 break
    //             case delphi_compatability.VK_DOWN:
    //                 this.adjustValueByPixels(index, 0, increment)
    //                 break
    //             case delphi_compatability.VK_UP:
    //                 this.adjustValueByPixels(index, 0, -increment)
    //                 break
    //         }
    //     }
    //     return key
    // }
    
    // // --------------------------------------------------------- functions called by mouse and key 
    // adjustValue(): void {
    //     let newString: ansistring
    //     let oldString: string
    //     let nameString: string
    //     let prompt: string
    //     let currentUnitString: string
    //     let newValue: float
    //     let oldValue: float
    //     let valueInCurrentUnit: float
    //     let index: int
    //     let failed: boolean
    //     let points: TPoint[] /* 1 + 1 */
        
    //     if (this.selectedItemIndex < kItemX1) {
    //         return
    //     }
    //     index = this.selectedItemIndex - kItemX1
    //     oldValue = this.currentValues[index]
    //     nameString = UNRESOLVED.copy(this.Caption, 1, 30)
    //     currentUnitString = uunits.UnitStringForEnum(this.param.unitSet, this.currentUnitIndex)
    //     if (len(nameString) === 30) {
    //         nameString = nameString + "..."
    //     }
    //     if (!odd(index)) {
    //         // x 
    //         valueInCurrentUnit = this.toCurrentUnit(this.currentValues[index])
    //         newString = usupport.digitValueString(valueInCurrentUnit)
    //         // y 
    //         // don't convert y value - is always 0-1 
    //     } else {
    //         valueInCurrentUnit = this.currentValues[index]
    //         newString = FloatToStrF(valueInCurrentUnit, UNRESOLVED.ffFixed, 7, 2)
    //     }
    //     oldString = newString
    //     prompt = "Type a new value."
    //     if (InputQuery("Enter value", prompt, newString)) {
    //         if ((newString !== oldString) && (usupport.boundForString(newString, this.param.fieldType, newValue))) {
    //             if (!odd(index)) {
    //                 this.currentValues[index] = this.toPlantUnit(newValue)
    //             } else {
    //                 this.currentValues[index] = newValue
    //             }
    //             points[0] = this.pointFromXY(this.currentValues[0], this.currentValues[1])
    //             points[1] = this.pointFromXY(this.currentValues[2], this.currentValues[3])
    //             this.keepPointInGraphRect(points[(index - 1) / 2])
    //             this.keepPointsFromCrossing(points[0], points[1], (index - 1) / 2)
    //             failed = this.drawSCurve(false, failed)
    //             if (failed) {
    //                 this.currentValues[index] = oldValue
    //                 ShowMessage("Invalid value.")
    //             } else {
    //                 // don't create change point command here, because only one float is changed 
    //                 umain.MainForm.doCommand(updcom.PdChangeRealValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValues[index], this.param.fieldNumber, index, this.param.regrow))
    //                 this.Invalidate()
    //             }
    //         }
    //     }
    // }
    
    // adjustAllValuesAtOnce(): void {
    //     let newString: ansistring
    //     let oldString: string
    //     let prompt: string
    //     let i: int
    //     let failed: boolean
    //     let points: TPoint[] /* 1 + 1 */
    //     let oldValues: SCurveStructure
    //     let valuesInCurrentUnit: SCurveStructure
    //     let newValues: SCurveStructure
        
    //     if (this.selectedItemIndex < kItemX1) {
    //         return
    //     }
    //     oldValues.x1 = this.currentValues[0]
    //     oldValues.y1 = this.currentValues[1]
    //     oldValues.x2 = this.currentValues[2]
    //     oldValues.y2 = this.currentValues[3]
    //     valuesInCurrentUnit = oldValues
    //     valuesInCurrentUnit.x1 = this.toCurrentUnit(oldValues.x1)
    //     valuesInCurrentUnit.x2 = this.toCurrentUnit(oldValues.x2)
    //     newString = usupport.digitValueString(valuesInCurrentUnit.x1) + " " + usupport.digitValueString(valuesInCurrentUnit.y1) + " " + usupport.digitValueString(valuesInCurrentUnit.x2) + " " + usupport.digitValueString(valuesInCurrentUnit.y2)
    //     oldString = newString
    //     prompt = "Edit these four s curve values."
    //     if (InputQuery("Enter value", prompt, newString)) {
    //         if ((newString !== oldString)) {
    //             try {
    //                 newValues = umath.stringToSCurve(newString)
    //                 this.currentValues[0] = newValues.x1
    //                 this.currentValues[1] = newValues.y1
    //                 this.currentValues[2] = newValues.x2
    //                 this.currentValues[3] = newValues.y2
    //             } catch (e) {
    //                 failed = true
    //             }
    //             if (!failed) {
    //                 points[0] = this.pointFromXY(this.currentValues[0], this.currentValues[1])
    //                 points[1] = this.pointFromXY(this.currentValues[2], this.currentValues[3])
    //                 for (i = 0; i <= 1; i++) {
    //                     this.keepPointInGraphRect(points[i])
    //                     this.keepPointsFromCrossing(points[0], points[1], 1)
    //                 }
    //                 failed = this.drawSCurve(false, failed)
    //             }
    //             if (failed) {
    //                 this.currentValues[0] = oldValues.x1
    //                 this.currentValues[1] = oldValues.y1
    //                 this.currentValues[2] = oldValues.x2
    //                 this.currentValues[3] = oldValues.y2
    //                 ShowMessage("Invalid value.")
    //             } else {
    //                 // don't create change point command here, because only one float is changed 
    //                 umain.MainForm.doCommand(updcom.PdChangeSCurvePointValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValues[0], this.currentValues[1], this.param.fieldNumber, 0, this.param.regrow))
    //                 umain.MainForm.doCommand(updcom.PdChangeSCurvePointValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValues[2], this.currentValues[3], this.param.fieldNumber, 1, this.param.regrow))
    //                 this.Invalidate()
    //             }
    //         }
    //     }
    // }
    
    // adjustValueByPixels(index: int, xChange: int, yChange: int): void {
    //     let points: TPoint[] /* 1 + 1 */
    //     let oldX: float
    //     let oldY: float
    //     let failed: boolean
    //     let xIndex: int
    //     let yIndex: int
        
    //     xIndex = index * 2
    //     yIndex = index * 2 + 1
    //     oldX = this.currentValues[xIndex]
    //     oldY = this.currentValues[yIndex]
    //     points[0] = this.pointFromXY(this.currentValues[0], this.currentValues[1])
    //     points[1] = this.pointFromXY(this.currentValues[2], this.currentValues[3])
    //     points[index].X = points[index].X + xChange
    //     points[index].Y = points[index].Y + yChange
    //     this.keepPointInGraphRect(points[index])
    //     this.keepPointsFromCrossing(points[0], points[1], index)
    //     failed = this.drawSCurve(false, failed)
    //     if (failed) {
    //         this.currentValues[xIndex] = oldX
    //         this.currentValues[yIndex] = oldY
    //     } else {
    //         this.currentValues[xIndex] = this.xValueFromPointPosition(points[index])
    //         this.currentValues[yIndex] = this.yValueFromPointPosition(points[index])
    //         umain.MainForm.doCommand(updcom.PdChangeSCurvePointValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValues[xIndex], this.currentValues[yIndex], this.param.fieldNumber, index, this.param.regrow))
    //         this.Invalidate()
    //     }
    // }
    
    // selectNextUnitInSet(shift: boolean): void {
    //     if (shift) {
    //         // no layer or derivation for this - s curve cannot be layer or absolute/relative 
    //         this.currentUnitIndex = uunits.GetPreviousUnitEnumInUnitSet(this.param.unitSet, this.currentUnitIndex)
    //     } else {
    //         this.currentUnitIndex = uunits.GetNextUnitEnumInUnitSet(this.param.unitSet, this.currentUnitIndex)
    //     }
    //     this.updateDisplay()
    // }
    
    // setPointAfterMouseUp(index: int, x: int, y: int): void {
    //     let xIndex: int
    //     let yIndex: int
    //     let thePoint: TPoint
        
    //     this.selectedItemIndex = kItemPoint1 + index
    //     thePoint = point(x, y)
    //     xIndex = index * 2
    //     yIndex = index * 2 + 1
    //     this.currentValues[xIndex] = this.xValueFromPointPosition(thePoint)
    //     this.currentValues[yIndex] = this.yValueFromPointPosition(thePoint)
    //     // change x and y values 
    //     umain.MainForm.doCommand(updcom.PdChangeSCurvePointValueCommand().createCommandWithListOfPlants(umain.MainForm.selectedPlants, this.currentValues[xIndex], this.currentValues[yIndex], this.param.fieldNumber, index, this.param.regrow))
    // }
    
    keepPointInGraphRect(point: TPoint): void {
        if (point.X < this.graphRect.Left) {
            point.X = this.graphRect.Left
        }
        if (point.X > this.graphRect.Right) {
            point.X = this.graphRect.Right
        }
        if (point.Y < this.graphRect.Top) {
            point.Y = this.graphRect.Top
        }
        if (point.Y > this.graphRect.Bottom) {
            point.Y = this.graphRect.Bottom
        }
    }
    
    keepPointsFromCrossing(point0: TPoint, point1: TPoint, movingPoint: int): void {
        let closestPoint: TPoint
        let proportion: float
        let minDifference: float
        
        proportion = 0.01
        minDifference = (this.maxXValue - this.minXValue) * proportion
        closestPoint = this.pointFromXY(minDifference, 0)
        closestPoint.X = intMax(1, closestPoint.X - this.graphRect.Left)
        if (movingPoint === 0) {
            if (point0.X > point1.X - closestPoint.X) {
                point0.X = point1.X - closestPoint.X
            }
        } else {
            if (point1.X < point0.X + closestPoint.X) {
                point1.X = point0.X + closestPoint.X
            }
        }
    }
    
    // // ------------------------------------------------------------------------------- updating 
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     if ((this.plant === null) || (this.readOnly)) {
    //         this.editEnabled = false
    //     } else {
    //         this.editEnabled = true
    //     }
    // }
    
    // updatePlantValues(): void {
    //     let i: int
    //     let oldValues: float[] /* 3 + 1 */
    //     let changed: boolean
        
    //     if (this.plant === null) {
    //         return
    //     }
    //     if (this.param.collapsed) {
    //         return
    //     }
    //     for (i = 0; i <= 3; i++) {
    //         oldValues[i] = this.currentValues[i]
    //     }
    //     this.updateCurrentValue(-1)
    //     changed = false
    //     for (i = 0; i <= 3; i++) {
    //         if (oldValues[i] !== this.currentValues[i]) {
    //             changed = true
    //             break
    //         }
    //     }
    //     if (changed) {
    //         this.updateDisplay()
    //         this.Invalidate()
    //     }
    // }
    
    updateCurrentValue(aFieldIndex: int): void {
        if ((this.plant !== null) && (this.param.fieldType === FieldType.kFieldFloat)) {
            if (aFieldIndex !== -1) {
                this.currentValues[aFieldIndex] = this.plant.transferField(TransferDirection.kGetField, this.currentValues[aFieldIndex], this.param.fieldNumber, FieldType.kFieldFloat, aFieldIndex, false, null)
            } else {
                for (let i = 0; i <= 3; i++) {
                    this.currentValues[i] = this.plant.transferField(TransferDirection.kGetField, this.currentValues[i], this.param.fieldNumber, FieldType.kFieldFloat, i, false, null)
                }
            }
            if (this.currentValues[0] < this.minXValue) {
                this.minXValue = this.currentValues[0]
            }
            if (this.currentValues[2] > this.maxXValue) {
                this.maxXValue = this.currentValues[2]
            }
        } else {
            this.editEnabled = false
        }
    }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldFloat)) {
    //         this.Invalidate()
    //     } else {
    //         this.editEnabled = false
    //     }
    // }
    
    // // ----------------------------------------------------------------------------------------- painting 
    // paint(): void {
    //     let minYTextRect: TRect
    //     let maxYTextRect: TRect
    //     let minXTextRect: TRect
    //     let maxXTextRect: TRect
    //     let pointTextRect: TRect
    //     let maxXValueInCurrentUnit: float
    //     let minXValueInCurrentUnit: float
    //     let minXString: string
    //     let maxXString: string
    //     let minYString: string
    //     let maxYString: string
    //     let currentUnitString: string
    //     let currentValuesInCurrentUnit: float[] /* 3 + 1 */
    //     let valueStrings: string[] /* 3 + 1 */
    //     let i: int
    //     let xPos: int
    //     let totalWidth: int
    //     let thePoint: TPoint
    //     let failed: boolean
        
    //     try {
    //         if (delphi_compatability.Application.terminated) {
    //             return
    //         }
    //         PdParameterPanel.prototype.paint.call(this)
    //         if (this.param.collapsed) {
    //             return
    //         }
    //         if (gRecursing) {
    //             // errorMessage('PdSCurveParameterPanel.Paint: recursion in paint method'); 
    //             gRecursing = false
    //             return
    //         }
    //         gRecursing = true
    //         // convert bounds and values from plant to current unit ( don't convert Y value) 
    //         // this is only for writing strings; use plant unit for drawing points 
    //         minXValueInCurrentUnit = this.toCurrentUnit(this.minXValue)
    //         if (!this.belowZero) {
    //             maxXValueInCurrentUnit = this.toCurrentUnit(this.maxXValue)
    //             currentValuesInCurrentUnit[0] = this.toCurrentUnit(this.currentValues[0])
    //             currentValuesInCurrentUnit[2] = this.toCurrentUnit(this.currentValues[2])
    //         } else {
    //             maxXValueInCurrentUnit = this.toCurrentUnit(-this.maxXValue)
    //             currentValuesInCurrentUnit[0] = this.toCurrentUnit(-this.currentValues[0])
    //             currentValuesInCurrentUnit[2] = this.toCurrentUnit(-this.currentValues[2])
    //         }
    //         currentValuesInCurrentUnit[1] = this.currentValues[1]
    //         currentValuesInCurrentUnit[3] = this.currentValues[3]
    //         // strings to write for number 
    //         minXString = usupport.digitValueString(minXValueInCurrentUnit)
    //         maxXString = usupport.digitValueString(maxXValueInCurrentUnit)
    //         minYString = "0.0"
    //         maxYString = "1.0"
    //         currentUnitString = uunits.UnitStringForEnum(this.param.unitSet, this.currentUnitIndex)
    //         for (i = 0; i <= 3; i++) {
    //             if ((i === 0) || (i === 2)) {
    //                 valueStrings[i] = this.stringForIndex(i) + " " + usupport.digitValueString(currentValuesInCurrentUnit[i])
    //             } else {
    //                 valueStrings[i] = this.stringForIndex(i) + " " + FloatToStrF(currentValuesInCurrentUnit[i], UNRESOLVED.ffFixed, 7, 2)
    //             }
    //         }
    //         // calculate all rectangles to draw text, points 
    //         this.graphRect.Left = uppanel.kLeftRightGap + this.Canvas.TextWidth(minYString) + udebug.kBetweenGap
    //         this.graphRect.Right = this.ClientWidth - uppanel.kLeftRightGap * 2
    //         this.graphRect.Top = this.collapsedHeight()
    //         this.graphRect.Bottom = this.Height - this.textHeight * 2 - udebug.kBetweenGap - uppanel.kTopBottomGap * 2
    //         minXTextRect.Left = this.graphRect.Left
    //         minXTextRect.Right = minXTextRect.Left + this.Canvas.TextWidth(minXString)
    //         minXTextRect.Top = this.graphRect.Bottom + 1
    //         minXTextRect.Bottom = minXTextRect.Top + this.textHeight
    //         maxXTextRect.Right = this.graphRect.Right
    //         maxXTextRect.Left = maxXTextRect.Right - this.Canvas.TextWidth(maxXString)
    //         maxXTextRect.Top = minXTextRect.Top
    //         maxXTextRect.Bottom = maxXTextRect.Top + this.textHeight
    //         minYTextRect.Left = this.graphRect.Left - this.Canvas.TextWidth(maxYString) - udebug.kBetweenGap
    //         minYTextRect.Right = this.graphRect.Left - 1
    //         minYTextRect.Top = this.graphRect.Bottom - this.textHeight
    //         minYTextRect.Bottom = this.graphRect.Bottom
    //         maxYTextRect.Left = this.graphRect.Left - this.Canvas.TextWidth(maxYString) - udebug.kBetweenGap
    //         maxYTextRect.Right = this.graphRect.Left - 1
    //         maxYTextRect.Top = this.graphRect.Top
    //         maxYTextRect.Bottom = maxYTextRect.Top + this.textHeight
    //         for (i = 0; i <= 1; i++) {
    //             thePoint = this.pointFromXY(this.currentValues[i * 2], this.currentValues[i * 2 + 1])
    //             this.pointRects[i].Left = thePoint.X - usliders.kSliderDraggerHeight / 2
    //             this.pointRects[i].Right = this.pointRects[i].Left + usliders.kSliderDraggerHeight
    //             this.pointRects[i].Top = thePoint.Y - usliders.kSliderDraggerHeight / 2
    //             this.pointRects[i].Bottom = this.pointRects[i].Top + usliders.kSliderDraggerHeight
    //         }
    //         // center point value texts 
    //         totalWidth = 0
    //         //  for i := 0 to 3 do totalWidth := totalWidth + canvas.textWidth(valueStrings[i]);
    //         //  totalWidth := totalWidth + kBetweenGap * 3;
    //         //  xPos := self.left + self.width div 2 - totalWidth div 2;  
    //         xPos = this.graphRect.Left
    //         for (i = 0; i <= 3; i++) {
    //             this.valueRects[i].Left = xPos
    //             this.valueRects[i].Right = this.valueRects[i].Left + this.Canvas.TextWidth(valueStrings[i])
    //             this.valueRects[i].Top = minXTextRect.Bottom + uppanel.kLeftRightGap / 2
    //             this.valueRects[i].Bottom = this.valueRects[i].Top + this.textHeight
    //             xPos = xPos + (this.valueRects[i].Right - this.valueRects[i].Left) + uppanel.kLeftRightGap
    //         }
    //         // center unit text 
    //         this.unitTextRect.Left = this.graphRect.Left + (this.graphRect.Right - this.graphRect.Left) / 2 - this.Canvas.TextWidth(currentUnitString) / 2
    //         this.unitTextRect.Right = this.unitTextRect.Left + this.Canvas.TextWidth(currentUnitString)
    //         this.unitTextRect.Top = minXTextRect.Top
    //         this.unitTextRect.Bottom = this.unitTextRect.Top + this.textHeight
    //         if (this.editEnabled) {
    //             // finally, draw all text 
    //             // draw lines black if enabled, else gray 
    //             this.Canvas.Pen.Color = UNRESOLVED.clBtnText
    //         } else {
    //             this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //         }
    //         // draw axes 
    //         this.Canvas.MoveTo(this.graphRect.Left, this.graphRect.Top)
    //         this.Canvas.LineTo(this.graphRect.Left, this.graphRect.Bottom)
    //         this.Canvas.LineTo(this.graphRect.Right, this.graphRect.Bottom)
    //         // draw axis labels 
    //         this.drawText(minYString, minYTextRect, false, false, true)
    //         this.drawText(maxYString, maxYTextRect, false, false, true)
    //         this.drawText(minXString, minXTextRect, false, false, true)
    //         this.drawText(maxXString, maxXTextRect, false, false, true)
    //         for (i = 0; i <= 3; i++) {
    //             // draw value texts 
    //             this.drawText(valueStrings[i], this.valueRects[i], true, (this.editEnabled) && (i === this.selectedItemIndex - kItemX1), false)
    //         }
    //         // draw unit string 
    //         this.drawText(currentUnitString, this.unitTextRect, true, (this.editEnabled) && (this.selectedItemIndex === kItemSCurveUnitText), false)
    //         for (i = 0; i <= 1; i++) {
    //             // draw point rectangles and labels (labels first because brush color will affect them 
    //             // first put text at lower right of point 
    //             pointTextRect = Rect(this.pointRects[i].Right + 5, this.pointRects[i].Top, this.pointRects[i].Right + 5 + this.Canvas.TextWidth(IntToStr(i + 1)), this.pointRects[i].Top + this.textHeight)
    //             if (pointTextRect.Right >= this.graphRect.Right) {
    //                 // adjust point text rectangle if could not be seen 
    //                 delphi_compatability.OffsetRect(pointTextRect, -20, 0)
    //             }
    //             if (pointTextRect.Bottom >= this.graphRect.Bottom) {
    //                 delphi_compatability.OffsetRect(pointTextRect, 0, -10)
    //             }
    //             this.drawText(IntToStr(i + 1), pointTextRect, false, false, false)
    //         }
    //         // draw curve 
    //         failed = this.drawSCurve(true, failed)
    //         if (!failed) {
    //             for (i = 0; i <= 1; i++) {
    //                 // draw points 
    //                 usliders.KfDrawButton(this.Canvas, this.pointRects[i], (this.selectedItemIndex === kItemPoint1 + i), this.editEnabled)
    //             }
    //         }
    //     } finally {
    //         gRecursing = false
    //     }
    // }
    
    drawSCurve(context: CanvasRenderingContext2D, draw: boolean): boolean {
        let thisPoint: TPoint
        let curve: SCurveStructure = new SCurveStructure()
        let numPoints: int
        
        let failed = true
        if (this.plant === null) {
            return failed
        }
        numPoints = 100
        // assumes that zero does NOT fall between x1 and x2, though one of these could be zero 
        curve.x1 = this.currentValues[0]
        curve.y1 = this.currentValues[1]
        curve.x2 = this.currentValues[2]
        curve.y2 = this.currentValues[3]
        if (draw) {
            // TEST
            // context.fillStyle = "rgb(200 0 0)"
            // context.fillRect(0, 0, 300, 300)
            // context.fillStyle = "rgb(0 0 200)"
            // context.fillRect(10, 10, 280, 280)

            context.fillStyle = "rgb(200 0 0)"
            const point1 = this.pointFromXY(curve.x1, curve.y1)
            context.fillRect(point1.X - 5, point1.Y - 5, 10, 10)
            const point2 = this.pointFromXY(curve.x2, curve.y2)
            context.fillRect(point2.X - 5, point2.Y - 5, 10, 10)

            context.fillStyle = convertColor(ColorDefs.clBtnShadow)
            context.beginPath()
        }
        try {
            failed = calcSCurveCoeffsWithResult(curve, failed)
            if (failed) {
                return failed
            }
            for (let i = 0; i <= numPoints - 1; i++) {
                // delphi 2.0 wants this 
                let x = 0.0
                let y = 0.0
                try {
                    x =  + (1.0 * i / numPoints) * (this.maxXValue - this.minXValue)
                } catch (e) {
                    return failed
                }
                [y, failed] = scurveWithResult(x, curve.c1, curve.c2)
                if (failed) {
                    return failed
                }
                if (draw) {
                    thisPoint = this.pointFromXY(x, y)
                    if (i === 0) {
                        context.moveTo(thisPoint.X, thisPoint.Y)
                    } else {
                        context.lineTo(thisPoint.X, thisPoint.Y)
                    }
                }
            }
        } catch (e) {
            return failed
        }
        if (draw) {
            context.strokeStyle = convertColor(ColorDefs.clBtnShadow)
            context.stroke()
        }
        failed = false
        return failed
    }
    
    // maxWidth(): int {
    //     let result = 0
    //     result = uppanel.kLeftRightGap * 2 + umath.intMax(this.labelWidth, uppanel.kEditMaxWidth)
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let minAllowed: int
        
    //     // cfk note: commented out part of this because it is estimating too wide, don't know why 
    //     //+ kLeftRightGap * 3
    //     minAllowed = uppanel.kLeftRightGap * 2 + umath.intMax(this.longestLabelWordWidth, this.formTextWidth("0.0") + udebug.kBetweenGap + this.formTextWidth("x2 0.00") * 4 + uppanel.kLeftRightGap)
    //     if (requestedWidth > minAllowed) {
    //         result = -1
    //     } else {
    //         result = minAllowed
    //     }
    //     return result
    // }
    
    // uncollapsedHeight(): int {
    //     let result = 0
    //     result = this.collapsedHeight() + uppanel.kGraphHeight + this.textHeight * 3 + udebug.kBetweenGap * 2 + uppanel.kTopBottomGap
    //     return result
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.editEnabled)) {
    //         result = kItemSCurveUnitText
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // // ---------------------------------------------------------------------------- utilities 
    // toPlantUnit(value: float): float {
    //     let result = 0.0
    //     result = uunits.Convert(this.param.unitSet, this.currentUnitIndex, this.param.unitModel, value)
    //     return result
    // }
    
    // toCurrentUnit(value: float): float {
    //     let result = 0.0
    //     result = uunits.Convert(this.param.unitSet, this.param.unitModel, this.currentUnitIndex, value)
    //     return result
    // }
    
    // xValueFromPointPosition(aPoint: TPoint): float {
    //     let result = 0.0
    //     result = this.minXValue + (this.maxXValue - this.minXValue) * (aPoint.X - this.graphRect.Left) / (this.graphRect.Right - this.graphRect.Left)
    //     return result
    // }
    
    // yValueFromPointPosition(aPoint: TPoint): float {
    //     let result = 0.0
    //     result = 1.0 - (aPoint.Y - this.graphRect.Top) / (this.graphRect.Bottom - this.graphRect.Top)
    //     return result
    // }
    
    pointFromXY(x: float, y: float): TPoint {
        let result = new TPoint()
        result.X = this.graphRect.Left + intround(((x - this.minXValue) / (this.maxXValue - this.minXValue)) * (this.graphRect.Right - this.graphRect.Left))
        result.Y = this.graphRect.Top + intround((1.0 - y) * (this.graphRect.Bottom - this.graphRect.Top))
        return result
    }
    
    // stringForIndex(index: int): string {
    //     let result = ""
    //     switch (index) {
    //         case 0:
    //             result = "x1"
    //             break
    //         case 1:
    //             result = "y1"
    //             break
    //         case 2:
    //             result = "x2"
    //             break
    //         case 3:
    //             result = "y2"
    //             break
    //     }
    //     return result
    // }
    
    // checkPlantValuesAgainstSoftBounds(aFieldIndex: int): boolean {
    //     let result = false
    //     let i: int
        
    //     result = false
    //     if (aFieldIndex !== -1) {
    //         result = this.checkOneValueAgainstSoftBounds(aFieldIndex)
    //     } else {
    //         for (i = 0; i <= 3; i++) {
    //             if (this.checkOneValueAgainstSoftBounds(i)) {
    //                 result = true
    //             }
    //         }
    //     }
    //     return result
    // }
    
    // checkOneValueAgainstSoftBounds(i: int): boolean {
    //     let result = false
    //     let oldValue: float
    //     let bound: float
        
    //     oldValue = this.currentValues[i]
    //     bound = this.boundForIndex(i, true)
    //     if (this.currentValues[i] < bound) {
    //         bound = this.currentValues[i]
    //     }
    //     bound = this.boundForIndex(i, false)
    //     if (this.currentValues[i] > bound) {
    //         bound = this.currentValues[i]
    //     }
    //     result = (this.currentValues[i] !== oldValue)
    //     return result
    // }
    
    // boundForIndex(index: int, isMinimum: boolean): float {
    //     let result = 0.0
    //     result = 0.0
    //     switch (index) {
    //         case 0:
    //             if (isMinimum) {
    //                 // x 
    //                 result = this.minXValue
    //             } else {
    //                 result = this.maxXValue
    //             }
    //             break
    //         case 2:
    //             if (isMinimum) {
    //                 // x 
    //                 result = this.minXValue
    //             } else {
    //                 result = this.maxXValue
    //             }
    //             break
    //         case 1:
    //             if (isMinimum) {
    //                 // y 
    //                 result = 0.0
    //             } else {
    //                 result = 1.0
    //             }
    //             break
    //         case 3:
    //             if (isMinimum) {
    //                 // y 
    //                 result = 0.0
    //             } else {
    //                 result = 1.0
    //             }
    //             break
    //     }
    //     return result
    // }

    oninit(vnode: any) {
        super.oninit(vnode)
        this.initialize()
        this.graphRect.Left = 0
        this.graphRect.Right = 300
        this.graphRect.Top = 0
        this.graphRect.Bottom = 300
    }
    
    view() {
        this.updateCurrentValue(-1)
        const self = this
        return this.viewFrame(
            m("div", 
                m("canvas", {
                    style: { height: "300px", width: "300px" },
                    oncreate(vnode: m.VnodeDOM) {
                        console.log("oncreate for canvas")
                        const canvas = <HTMLCanvasElement>vnode.dom
                        canvas.width = 300
                        canvas.height = 300

                        const context = canvas.getContext("2d")
                        if (!context) return

                        self.drawSCurve(context, true)
                    },
                    onupdate(vnode: m.VnodeDOM) {
                        console.log("onupdate for canvas")
                        const canvas = <HTMLCanvasElement>vnode.dom

                        // Clear the canvas
                        canvas.width = canvas.width

                        const context = canvas.getContext("2d")
                        if (!context) return

                        self.drawSCurve(context, true)
                    }
                }),
                this.currentValues.map((value, index) => {
                    return m("div",
                        ["x1", "y1", "x2", "y2"][index] + "",
                        m("input", {
                            value: value.toFixed(2),
                            onchange: (event: any) => {
                                // TODO: PDF temp for testing
                                this.currentValues[index] = parseFloat(event.target.value)

                                // const points = Array(2)
                                // points[0] = this.pointFromXY(this.currentValues[0], this.currentValues[1])
                                // points[1] = this.pointFromXY(this.currentValues[2], this.currentValues[3])
                                // for (let i = 0; i <= 1; i++) {
                                //     this.keepPointInGraphRect(points[i])
                                //     this.keepPointsFromCrossing(points[0], points[1], 1)
                                // }

                                new PdChangeRealValueCommand([this.plant], this.currentValues[index], this.param.fieldNumber, index, this.param.regrow).doCommand()
                            }
                        })
                    )
                })
            )
        )
    }
}

// not using
//procedure PdSCurveParameterPanel.checkPointsForFailure(var movingPoint: TPoint; var nonMovingPoint: TPoint);
//  var
//    failed: boolean;
//    distanceFromLeft, distanceFromRight, distanceFromTop, distanceFromBottom: integer;
//    distanceFromOtherPointX, smallestDistance, increment: integer;
//  begin
//  failed := true;
//  increment := 5;
//  while failed do
//    begin
//    failed := self.drawSCurve(false);
//    if failed then
//      begin
//      distanceFromLeft := movingPoint.x - graphRect.left;
//      distanceFromRight := graphRect.right - movingPoint.x;
//      distanceFromTop := movingPoint.y - graphRect.top;
//      distanceFromBottom := graphRect.bottom - movingPoint.y;
//      distanceFromOtherPointX := movingPoint.x - nonMovingPoint.x;
//      smallestDistance := intMin(distanceFromLeft, intMin(distanceFromRight,
//        intMin(distanceFromTop, intMin(distanceFromBottom, distanceFromOtherPointX))));
//      if smallestDistance = distanceFromLeft then movingPoint.x := movingPoint.x + increment
//      else if smallestDistance = distanceFromRight then movingPoint.x := movingPoint.x - increment
//      else if smallestDistance = distanceFromTop then movingPoint.y := movingPoint.y + increment
//      else if smallestDistance = distanceFromBottom then movingPoint.y := movingPoint.y - increment
//      else if smallestDistance = distanceFromOtherPointX then
//        if distanceFromOtherPointX > 0 then
//          movingPoint.x := movingPoint.x + increment
//        else
//          movingPoint.x := movingPoint.x - increment;
//      end;
//    end;
//  end;
//
