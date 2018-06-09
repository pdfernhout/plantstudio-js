import { TRect } from "./TRect"

export interface TGridDrawState {
    gdFocused: boolean
    gdSelected: boolean
}

export class TDrawGrid {
    RowCount = 1
    ColCount = 1
    DefaultColWidth = 40
    DefaultRowHeight = 40
    ColWidths: number[] = [40]

    Canvas: any = null
    Font: any = null
    Handle: TRect = new TRect()
    
    Invalidate() {}
    Update() {}
    BeginDrag(something: boolean) {}
    MouseToCell(x: number, y: number) { return [0, 0] }
    CellRect(x: number, y: number) { return new TRect() }
}
