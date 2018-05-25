// unit Udxfclr

from conversion_common import *
import u3dexport
import uturtle
import updform
import delphi_compatability

// const
const kBetweenGap = 4



export class TChooseDXFColorForm {
    colorsDrawGrid: TDrawGrid = new TDrawGrid()
    Close: TButton = new TButton()
    cancel: TButton = new TButton()
    color: TColorRef = new TColorRef()
    colorIndex: short = 0
    TChooseDXFColorForm.prototype = new PdForm()
    TChooseDXFColorForm.prototype.constructor = TChooseDXFColorForm
    
    //$R *.DFM
    FormActivate(Sender: TObject): void {
        let sRect: TGridRect
        
        // change to do rows also when there are more numbers 
        this.colorsDrawGrid.ColCount = u3dexport.kLastDxfColorIndex + 1
        this.colorsDrawGrid.SetBounds(kBetweenGap, kBetweenGap, this.colorsDrawGrid.Width, this.colorsDrawGrid.Height)
        this.colorsDrawGrid.ClientWidth = this.colorsDrawGrid.CellRect(this.colorsDrawGrid.ColCount - 1, 0).Right
        this.ClientWidth = this.colorsDrawGrid.Width + this.Close.Width + kBetweenGap * 3
        this.Close.Left = this.ClientWidth - this.Close.Width - kBetweenGap
        this.cancel.Left = this.Close.Left
        sRect.left = this.colorIndex
        sRect.right = this.colorIndex
        sRect.top = 0
        sRect.bottom = 0
        this.colorsDrawGrid.Selection = sRect
    }
    
    CloseClick(Sender: TObject): void {
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    colorsDrawGridDblClick(Sender: TObject): void {
        this.CloseClick(this)
    }
    
    colorsDrawGridSelectCell(Sender: TObject, Col: long, Row: long, CanSelect: boolean): void {
        this.color = u3dexport.dxfColors[Col]
        this.colorIndex = Col
        return CanSelect
    }
    
    colorsDrawGridDrawCell(Sender: TObject, Col: long, Row: long, Rect: TRect, State: TGridDrawState): void {
        this.colorsDrawGrid.Canvas.Brush.Color = u3dexport.dxfColors[Col]
        this.colorsDrawGrid.Canvas.FillRect(Rect)
        if ((UNRESOLVED.gdSelected in State)) {
            this.colorsDrawGrid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
            this.colorsDrawGrid.Canvas.Pen.Color = delphi_compatability.clBlack
            //FIX unresolved WITH expression: Rect
            this.colorsDrawGrid.Canvas.Rectangle(this.Left, this.Top, UNRESOLVED.right, UNRESOLVED.bottom)
        }
    }
    
}

