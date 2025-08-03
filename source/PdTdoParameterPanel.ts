// unit upp_tdo

import * as m from "mithril"
import { float, int } from "./common"
import { KfObject3D } from "./KfObject3D"
import { PdParameterPanel } from "./PdParameterPanel"
import { TPoint } from "./TPoint"
import { TRect } from "./TRect"
import { FieldType, kNotArray } from "./PdParameter"
import { TransferDirection } from "./PdPlant"
import { KfTurtle } from "./KfTurtle"
import { customModal, modalPrompt, setModalCallback } from "./ModalInputView"
import { domain } from "./PdDomain"
import { viewSelect } from "./menu"
import { messageForExceptionType } from "./usupport"

// from conversion_common import *
// import ubmpsupport
// import upicktdo
// import utdoedit
// import udebug
// import udomain
// import usupport
// import uunits
// import umath
// import updcom
// import uturtle
// import utdo
// import uppanel
// import uparams
// import uplant
// import delphi_compatability

// const
const kItemFileName = 1
const kItemTdo = 2
const kItemTurnLeft = 3
const kItemTurnRight = 4
const kItemEnlarge = 5
const kItemReduce = 6
const kTdoSize = 64

//<
//>
//+
//-
export class PdTdoParameterPanel extends PdParameterPanel {
    tdo: KfObject3D = new KfObject3D()
    fileNameRect: TRect = new TRect()
    tdoRect: TRect = new TRect()
    turnLeftRect: TRect = new TRect()
    turnRightRect: TRect = new TRect()
    enlargeRect: TRect = new TRect()
    reduceRect: TRect = new TRect()
    rotateAngle: int = 0
    scale: float = 0.2
    position: TPoint = new TPoint()
    editEnabled: boolean = false
    movingTdo: boolean = false
    moveStart: TPoint = new TPoint()
    moveStartPosition: TPoint = new TPoint()
    
    // create(anOwner: TComponent): void {
    //     PdParameterPanel.prototype.create.call(this, anOwner)
    //     this.tdo = utdo.KfObject3D().create()
    // }
    
    // destroy(): void {
    //     this.tdo.free
    //     this.tdo = null
    // }
    
    initialize(): void {
        this.rotateAngle = 0
        this.scale = 0.2
        this.position = new TPoint(0, 0)
        this.movingTdo = false
    }
    
    // updateEnabling(): void {
    //     PdParameterPanel.prototype.updateEnabling.call(this)
    //     if ((this.plant === null) || (this.readOnly)) {
    //         this.editEnabled = false
    //     } else {
    //         this.editEnabled = true
    //     }
    // }
    
    // updatePlantValues(): void {
    //     // this won't ever be changed by the simulation, so don't respond 
    // }
    
    updateCurrentValue(aFieldIndex: int): void {
        if ((this.plant !== null) && (this.param.fieldType === FieldType.kFieldThreeDObject)) {
            this.tdo = this.plant.transferField(TransferDirection.kGetField, this.tdo, this.param.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, false, null)
            this.recenterTdo()
        } else {
            this.editEnabled = false
        }
    }
    
    // updateDisplay(): void {
    //     if ((this.plant !== null) && (this.param.fieldType === uparams.kFieldThreeDObject)) {
    //         this.Invalidate()
    //     } else {
    //         this.editEnabled = false
    //     }
    // }
    
    // doMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
    //     // must always call this first because it sets the focus 
    //     PdParameterPanel.prototype.doMouseDown.call(this, Sender, Button, Shift, X, Y)
    //     if ((this.editEnabled)) {
    //         thePoint = Point(X, Y)
    //         if (delphi_compatability.PtInRect(this.tdoRect, thePoint) && (delphi_compatability.TShiftStateEnum.ssCtrl in Shift)) {
    //             //(button = mbRight) then
    //             this.movingTdo = true
    //             this.moveStart = thePoint
    //             this.moveStartPosition = this.position
    //         }
    //     }
    // }
    
    // doMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
    //     if (this.movingTdo) {
    //         this.position.X = this.moveStartPosition.X + (X - this.moveStart.X)
    //         this.position.Y = this.moveStartPosition.Y + (Y - this.moveStart.Y)
    //         this.Invalidate()
    //     }
    // }
    
    // doMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     let thePoint: TPoint
    //     PdParameterPanel.prototype.doMouseUp.call(this, Sender, Button, Shift, X, Y)
    //     if ((this.editEnabled)) {
    //         thePoint = Point(X, Y)
    //         if (delphi_compatability.PtInRect(this.fileNameRect, thePoint)) {
    //             this.selectedItemIndex = kItemFileName
    //             this.pickTdo()
    //         } else if (delphi_compatability.PtInRect(this.tdoRect, thePoint)) {
    //             this.selectedItemIndex = kItemTdo
    //             if (this.movingTdo) {
    //                 this.movingTdo = false
    //                 this.position.X = this.moveStartPosition.X + (X - this.moveStart.X)
    //                 this.position.Y = this.moveStartPosition.Y + (Y - this.moveStart.Y)
    //                 this.moveStart = point(0, 0)
    //                 this.Invalidate()
    //             } else if (Button === delphi_compatability.TMouseButton.mbLeft) {
    //                 this.pickTdo()
    //             }
    //         } else if (delphi_compatability.PtInRect(this.turnLeftRect, thePoint)) {
    //             this.selectedItemIndex = kItemTurnLeft
    //             this.rotateAngle = this.rotateAngle + 10
    //         } else if (delphi_compatability.PtInRect(this.turnRightRect, thePoint)) {
    //             this.selectedItemIndex = kItemTurnRight
    //             this.rotateAngle = this.rotateAngle - 10
    //         } else if (delphi_compatability.PtInRect(this.enlargeRect, thePoint)) {
    //             this.selectedItemIndex = kItemEnlarge
    //             this.scale = this.scale + 0.1
    //             this.recenterTdo()
    //         } else if (delphi_compatability.PtInRect(this.reduceRect, thePoint)) {
    //             this.selectedItemIndex = kItemReduce
    //             this.scale = this.scale - 0.1
    //             this.recenterTdo()
    //         }
    //         this.Invalidate()
    //     }
    // }
    
    // doKeyDown(sender: TObject, key: byte, shift: TShiftState): void {
    //     PdParameterPanel.prototype.doKeyDown.call(this, sender, key, shift)
    //     if ((key === delphi_compatability.VK_RETURN) && (this.editEnabled)) {
    //         switch (this.selectedItemIndex) {
    //             case kItemFileName:
    //                 this.pickTdo()
    //                 break
    //             case kItemTdo:
    //                 this.pickTdo()
    //                 break
    //         }
    //     }
    //     return key
    // }
    
    // pickTdo(): void {
    //     let tdoPicker: TPickTdoForm
    //     let plantName: string
        
    //     if ((this.tdo === null) || (this.plant === null) || (this.param === null)) {
    //         return
    //     }
    //     tdoPicker = upicktdo.TPickTdoForm().create(this)
    //     if (tdoPicker === null) {
    //         throw new Error("Problem: Could not create 3D object chooser window.")
    //     }
    //     try {
    //         plantName = this.plant.getName()
    //         if (tdoPicker.initializeWithTdoParameterAndPlantName(this.tdo, this.param, plantName)) {
    //             // if false, user canceled picking a 3D object library
    //             tdoPicker.ShowModal()
    //         }
    //     } finally {
    //         tdoPicker.free
    //         tdoPicker = null
    //     }
    // }
    
    // maxWidth(): int {
    //     let result = 0
    //     result = umath.intMax(uppanel.kLeftRightGap * 2 + this.labelWidth, uppanel.kLeftRightGap + this.formTextWidth("wwwwwwww.www") + uppanel.kLeftRightGap + kTdoSize + uppanel.kLeftRightGap)
    //     return result
    // }
    
    // minWidth(requestedWidth: int): int {
    //     let result = 0
    //     let minAllowed: int
        
    //     minAllowed = uppanel.kLeftRightGap * 2 + umath.intMax(this.longestLabelWordWidth, this.formTextWidth("wwwwwwww.www") + utdoedit.kBetweenGap + kTdoSize)
    //     if (requestedWidth > minAllowed) {
    //         result = -1
    //     } else {
    //         result = minAllowed
    //     }
    //     return result
    // }
    
    // uncollapsedHeight(): int {
    //     let result = 0
    //     result = this.collapsedHeight() + kTdoSize + utdoedit.kBetweenGap + this.textHeight + uppanel.kTopBottomGap * 3
    //     return result
    // }
    
    // maxSelectedItemIndex(): int {
    //     let result = 0
    //     if ((!this.param.collapsed) && (this.editEnabled)) {
    //         result = kItemReduce
    //     } else {
    //         result = uppanel.kItemLabel
    //     }
    //     return result
    // }
    
    // resizeElements(): void {
    //     // do nothing 
    // }
    
    // paint(): void {
    //     let rect: TRect
    //     PdParameterPanel.prototype.paint.call(this)
    //     if ((this.param.collapsed)) {
    //         this.drawExtraValueCaptionWithString(this.tdo.getName(), "")
    //         return
    //     }
    //     Rect = this.GetClientRect()
    //     this.tdoRect.Left = Rect.left + uppanel.kLeftRightGap
    //     this.tdoRect.Right = this.tdoRect.Left + kTdoSize
    //     this.tdoRect.Top = this.collapsedHeight() + uppanel.kTopBottomGap
    //     this.tdoRect.Bottom = this.tdoRect.Top + kTdoSize
    //     this.fileNameRect.Left = this.tdoRect.Right + uppanel.kLeftRightGap
    //     this.fileNameRect.Right = this.fileNameRect.Left + this.Canvas.TextWidth(this.tdo.getName())
    //     this.fileNameRect.Top = this.tdoRect.Top + kTdoSize / 2 - this.textHeight / 2
    //     this.fileNameRect.Bottom = this.fileNameRect.Top + this.textHeight
    //     this.turnLeftRect.Left = this.tdoRect.Left + (this.tdoRect.Right - this.tdoRect.Left) / 2 - (this.Canvas.TextWidth(">") * 4 + uppanel.kLeftRightGap * 3) / 2
    //     this.turnLeftRect.Right = this.turnLeftRect.Left + this.Canvas.TextWidth("<")
    //     this.turnLeftRect.Top = this.tdoRect.Bottom + utdoedit.kBetweenGap
    //     this.turnLeftRect.Bottom = this.turnLeftRect.Top + this.textHeight
    //     this.turnRightRect.Left = this.turnLeftRect.Right + uppanel.kLeftRightGap
    //     this.turnRightRect.Right = this.turnRightRect.Left + this.Canvas.TextWidth(">")
    //     this.turnRightRect.Top = this.turnLeftRect.Top
    //     this.turnRightRect.Bottom = this.turnRightRect.Top + this.textHeight
    //     this.enlargeRect.Left = this.turnRightRect.Right + uppanel.kLeftRightGap
    //     this.enlargeRect.Right = this.enlargeRect.Left + this.Canvas.TextWidth("+")
    //     this.enlargeRect.Top = this.turnLeftRect.Top
    //     this.enlargeRect.Bottom = this.enlargeRect.Top + this.textHeight
    //     this.reduceRect.Left = this.enlargeRect.Right + uppanel.kLeftRightGap
    //     this.reduceRect.Right = this.reduceRect.Left + this.Canvas.TextWidth("-")
    //     this.reduceRect.Top = this.turnLeftRect.Top
    //     this.reduceRect.Bottom = this.reduceRect.Top + this.textHeight
    //     if (this.plant !== null) {
    //         this.drawText(this.tdo.getName(), this.fileNameRect, true, (this.selectedItemIndex === kItemFileName) && (this.editEnabled), false)
    //     }
    //     this.drawText("<", this.turnLeftRect, true, this.selectedItemIndex === kItemTurnLeft, false)
    //     this.drawText(">", this.turnRightRect, true, this.selectedItemIndex === kItemTurnRight, false)
    //     this.drawText("+", this.enlargeRect, true, this.selectedItemIndex === kItemEnlarge, false)
    //     this.drawText("-", this.reduceRect, true, this.selectedItemIndex === kItemReduce, false)
    //     this.drawTdo()
    //     if ((this.selectedItemIndex !== kItemTdo)) {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnShadow
    //         this.Canvas.Pen.Width = 1
    //     } else {
    //         this.Canvas.Pen.Color = UNRESOLVED.clBtnText
    //         this.Canvas.Pen.Width = 3
    //     }
    //     this.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    //     this.Canvas.Pen.Width = 1
    //     this.Canvas.Rectangle(this.tdoRect.Left - 1, this.tdoRect.Top - 1, this.tdoRect.Right + 1, this.tdoRect.Bottom + 1)
    // }
    
    recenterTdo(): void { 
        if (this.plant === null) {
            return
        }
        if (this.tdo === null) {
            return
        }
        const turtle = KfTurtle.defaultStartUsing()
        try {
            turtle.drawingSurface.pane = null
            // must be after pane and draw options set 
            turtle.reset()
            this.position = this.tdo.bestPointForDrawingAtScale(turtle, new TPoint(0, 0), new TPoint(kTdoSize, kTdoSize), this.scale)
        } finally {
            KfTurtle.defaultStopUsing()
        }
    }
    
    drawTdo(context: CanvasRenderingContext2D): void {
        // let bitmap: TBitmap
        
        if (this.plant === null) {
            return
        }
        if (this.tdo === null) {
            return
        }
        // // set up clipping bitmap 
        // bitmap = delphi_compatability.TBitmap().Create()
        // bitmap.Width = kTdoSize
        // bitmap.Height = kTdoSize
        // bitmap.Canvas.Brush.Color = delphi_compatability.clWhite
        // bitmap.Canvas.Rectangle(0, 0, bitmap.Width, bitmap.Height)
        // set up turtle 
        const turtle = KfTurtle.defaultStartUsing()
        try {
            turtle.drawingSurface.pane = context
            turtle.setDrawOptionsForDrawingTdoOnly()
            // must be after pane and draw options set 
            turtle.reset()
            turtle.xyz(this.position.X, this.position.Y, 0)
            try {
                turtle.push()
                turtle.rotateY(this.rotateAngle)
                turtle.drawingSurface.recordingStart()
                this.tdo.draw(turtle, this.scale, "", "", 0, 0)
                turtle.drawingSurface.recordingStop()
                turtle.drawingSurface.recordingDraw()
                turtle.drawingSurface.clearTriangles()
                turtle.pop()
            } catch (e: any) {
                messageForExceptionType(e, "PdTdoParameterPanel.drawTdo")
                // bitmap.free
            }
            // ubmpsupport.copyBitmapToCanvas(bitmap, this.Canvas, this.tdoRect)
        } finally {
            KfTurtle.defaultStopUsing()
            // bitmap.free
        }
    }

    async modalTDOChoice() {
        const oldTDO  = this.tdo
        const selections = domain.defaultTdoLibrary.map((tdo, index) => { return { label: tdo.name, tdo: tdo, value: "" + index}})
        let value = selections.find(selection => (selection.tdo === this.tdo || selection.tdo.name == this.tdo.name))?.value
        return customModal((resolve: any) => {
            return m("div",
                m("h3", "Choose TDO from library"),
                m("label",
                    "Type: ",
                    viewSelect(
                        selections, 
                        value, 
                        (newValue: string) => {
                            this.tdo = selections[parseInt(newValue)].tdo
                            this.plant.transferField(TransferDirection.kSetField, this.tdo, this.param.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, false, null)
                            value = newValue
                        })
                ),
                m("div.pa2", this.viewTDOCanvas()),
                m("div.ma2.flex.justify-end", 
                    m("button", { onclick: () => {
                        this.tdo = oldTDO
                        this.plant.transferField(TransferDirection.kSetField, this.tdo, this.param.fieldNumber, FieldType.kFieldThreeDObject, kNotArray, false, null)
                        resolve(false)}
                    }, "Cancel"),
                    m("button.ml2", { onclick: () => {
                        resolve(true)
                    }}, "OK")
                )
            )
        })
    }

    viewTDOCanvas() {
        const self = this
        return m("div.flex",
            m("canvas.ba", {
                style: { height: "64px", width: "64px" },
                oncreate(vnode: m.VnodeDOM) {
                    console.log("oncreate for canvas")
                    const canvas = <HTMLCanvasElement>vnode.dom
                    canvas.width = 64
                    canvas.height = 64
                    const context = canvas.getContext("2d")
                    if (!context) return
                    self.drawTdo(context)
                },
                onupdate(vnode: m.VnodeDOM) {
                    console.log("onupdate for canvas")
                    const canvas = <HTMLCanvasElement>vnode.dom
                    // Clear the canvas
                    canvas.width = canvas.width
                    const context = canvas.getContext("2d")
                    if (!context) return
                    self.drawTdo(context)
                }
            }),
            m("div.ml2.flex.flex.flex-column.f7.mt1",
                m("div",
                    m("button", {onclick: () => {this.rotateAngle = this.rotateAngle + 10}}, "<"),
                    m("button.ml1", {onclick: () => { this.rotateAngle = this.rotateAngle - 10}}, ">"),
                    m("button.ml2", {onclick: () => { this.initialize() }}, "reset"),
                ),
                m("div.mt1",
                    m("button", {onclick: () => {this.scale = this.scale + 0.1; this.recenterTdo()}}, "+"),
                    m("button.ml1", {onclick: () => {this.scale = this.scale - 0.1; this.recenterTdo()}}, "-"),
                )
            ),
        )
    }
    
    view() {
        this.updateCurrentValue(-1)
        return this.viewFrame(
            m("div.flex.flex-column",
                m("div", "TDO: ", this.tdo?.name),
                this.viewTDOCanvas(),
                m("button.mt1.w4", { onclick: () => {
                    this.modalTDOChoice().then(() => m.redraw())
                }},
                    "Choose TDO..."
                )
            )
        )
    }
}
