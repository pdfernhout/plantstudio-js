// unit ucustdrw

import * as m from "mithril"
import { viewCustomDrawOptionsForm } from "./TCustomDrawOptionsForm-view"

// from conversion_common import *
// import usupport
// import udomain
// import updform
// import delphi_compatability

// const
const kTransferLoad = 1
const kTransferSave = 2

export class TCustomDrawOptionsForm {
    // helpButton: TSpeedButton = new TSpeedButton()
    // Close: TButton = new TButton()
    // cancel: TButton = new TButton()
    // GroupBox1: TGroupBox = new TGroupBox()
    // sortPolygons: TCheckBox = new TCheckBox()
    // sortTdosAsOneItem: TCheckBox = new TCheckBox()
    // GroupBox2: TGroupBox = new TGroupBox()
    // lineContrastIndexLabel: TLabel = new TLabel()
    // fillPolygons: TCheckBox = new TCheckBox()
    // drawLinesBetweenPolygons: TCheckBox = new TCheckBox()
    // lineContrastIndex: TSpinEdit = new TSpinEdit()
    // GroupBox3: TGroupBox = new TGroupBox()
    // draw3DObjects: TCheckBox = new TCheckBox()
    // drawStems: TCheckBox = new TCheckBox()
    // draw3DObjectsAsBoundingRectsOnly: TCheckBox = new TCheckBox()
    // options: DomainOptionsStructure = new DomainOptionsStructure()
    // transferDirection: short = 0
    // optionsChanged: boolean = false
    
    // //$R *.DFM
    // FormActivate(Sender: TObject): void {
    //     this.transferDirection = kTransferLoad
    //     this.transferFields()
    //     // interactions
    //     this.drawLinesBetweenPolygons.Enabled = this.fillPolygons.Checked
    //     this.lineContrastIndex.Enabled = this.drawLinesBetweenPolygons.Enabled && this.drawLinesBetweenPolygons.Checked
    //     this.lineContrastIndexLabel.Enabled = this.lineContrastIndex.Enabled
    //     this.sortTdosAsOneItem.Enabled = this.sortPolygons.Checked
    //     this.draw3DObjectsAsBoundingRectsOnly.Enabled = this.draw3DObjects.Checked
    // }
    
    // CloseClick(Sender: TObject): void {
    //     this.transferDirection = kTransferSave
    //     this.transferFields()
    //     this.ModalResult = mrOK
    // }
    
    // cancelClick(Sender: TObject): void {
    //     this.ModalResult = mrCancel
    // }
    
    // transferFields(): void {
    //     this.options.drawStems = this.transferCheckBox(this.drawStems, this.options.drawStems)
    //     this.options.draw3DObjects = this.transferCheckBox(this.draw3DObjects, this.options.draw3DObjects)
    //     this.options.draw3DObjectsAsBoundingRectsOnly = this.transferCheckBox(this.draw3DObjectsAsBoundingRectsOnly, this.options.draw3DObjectsAsBoundingRectsOnly)
    //     this.options.fillPolygons = this.transferCheckBox(this.fillPolygons, this.options.fillPolygons)
    //     this.options.drawLinesBetweenPolygons = this.transferCheckBox(this.drawLinesBetweenPolygons, this.options.drawLinesBetweenPolygons)
    //     this.options.lineContrastIndex = this.transferSmallintSpinEditBox(this.lineContrastIndex, this.options.lineContrastIndex)
    //     this.options.sortPolygons = this.transferCheckBox(this.sortPolygons, this.options.sortPolygons)
    //     this.options.sortTdosAsOneItem = this.transferCheckBox(this.sortTdosAsOneItem, this.options.sortTdosAsOneItem)
    // }
    
    // transferCheckBox(checkBox: TCheckBox, value: boolean): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         checkBox.Checked = value
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== checkBox.Checked) {
    //             this.optionsChanged = true
    //         }
    //         value = checkBox.Checked
    //     }
    //     return value
    // }
    
    // transferSmallintSpinEditBox(editBox: TSpinEdit, value: short): void {
    //     if (this.transferDirection === kTransferLoad) {
    //         editBox.Text = IntToStr(value)
    //     } else if (this.transferDirection === kTransferSave) {
    //         if (value !== StrToIntDef(editBox.Text, 0)) {
    //             this.optionsChanged = true
    //         }
    //         value = StrToIntDef(editBox.Text, 0)
    //     }
    //     return value
    // }
    
    // draw3DObjectsClick(Sender: TObject): void {
    //     this.draw3DObjectsAsBoundingRectsOnly.Enabled = this.draw3DObjects.Checked
    // }
    
    // fillPolygonsClick(Sender: TObject): void {
    //     // and (not drawWithOpenGL.checked);
    //     this.drawLinesBetweenPolygons.Enabled = (this.fillPolygons.Checked)
    //     this.lineContrastIndex.Enabled = this.drawLinesBetweenPolygons.Enabled && this.drawLinesBetweenPolygons.Checked
    //     this.lineContrastIndexLabel.Enabled = this.lineContrastIndex.Enabled
    // }
    
    // drawLinesBetweenPolygonsClick(Sender: TObject): void {
    //     this.lineContrastIndex.Enabled = this.drawLinesBetweenPolygons.Enabled && this.drawLinesBetweenPolygons.Checked
    //     this.lineContrastIndexLabel.Enabled = this.lineContrastIndex.Enabled
    // }
    
    // sortPolygonsClick(Sender: TObject): void {
    //     this.sortTdosAsOneItem.Enabled = this.sortPolygons.Checked
    // }
    
    // helpButtonClick(Sender: TObject): void {
    //     delphi_compatability.Application.HelpJump("Changing_the_drawing_speed")
    // }
    
    // FormKeyPress(Sender: TObject, Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     return Key
    // }

    view(vnode: any) {
        return m("div",
            { onclick: () => vnode.attrs.close() },
            "TCustomDrawOptionsForm UNFINISHED",
            viewCustomDrawOptionsForm()
        )
    }
    
}

//
//procedure TOptionsForm.drawWithOpenGLClick(Sender: TObject);
//  begin
//  //drawLinesBetweenPolygons.enabled := (fillPolygons.checked) and (not drawWithOpenGL.checked);
//  //sortPolygons.enabled := not drawWithOpenGL.checked;
//  end;
//
