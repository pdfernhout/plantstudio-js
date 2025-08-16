// unit ucustdrw

import * as m from "mithril"
import { caption } from "./common"

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
        return m("CustomDrawOptionsForm.TCustomDrawOptionsForm",
        {
        // Top: "244",
        // Left: "618",
        // Height: "0",
        // Width: "0",
        // BorderStyle: "bsDialog",
        // Caption: "Custom Draw Options",
        // ClientHeight: "217",
        // ClientWidth: "290",
        // Font.Charset: "DEFAULT_CHARSET",
        // Font.Color: "clWindowText",
        // Font.Height: "-11",
        // Font.Name: "Arial",
        // Font.Style: "[]",
        // KeyPreview: "True",
        // Position: "poScreenCenter",
        // Scaled: "False",
        // OnActivate: "FormActivate",
        // OnKeyPress: "FormKeyPress",
        // PixelsPerInch: "96",
        // TextHeight: "14",
        },
        m("Group.Group.g00000004",
            m("TGroupBox.GroupBox3.TGroupBox",
                {
                    // Top: "4",
                    // Left: "4",
                    // Height: "72",
                    // Width: "219",
                    // TabOrder: "2",
                },
                "Drawing",
                m("label.checkbox-inline.drawStems.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "15",
                        // Left: "8",
                        // Height: "17",
                        // Width: "97",
                        // TabOrder: "0",
                    },),
                    caption("Draw &stems"),
                ),
                m("label.checkbox-inline.draw3DObjects.TCheckBox", m("input[type=checkbox]",
                    {
                        onclick: draw3DObjectsClick,
                        // Top: "32",
                        // Left: "8",
                        // Height: "17",
                        // Width: "117",
                        // TabOrder: "1",
                    },),
                    caption("Draw &3D objects"),
                ),
                m("label.checkbox-inline.draw3DObjectsAsBoundingRectsOnly.TCheckBox", m("input[type=checkbox]",
                    {
                        // Top: "49",
                        // Left: "8",
                        // Height: "17",
                        // Width: "203",
                        // TabOrder: "2",
                    },),
                    caption("Draw 3D object &bounding boxes only"),
                ),
            ),
            m("button.Close.TButton",
                {
                    onclick: CloseClick,
                    // Top: "4",
                    // Left: "228",
                    // Height: "21",
                    // Width: "60",
                    // TabOrder: "3",
                },
                caption("&OK"),
            ),
        ),
        m("button.cancel.TButton",
            {
                onclick: cancelClick,
                // Top: "27",
                // Left: "228",
                // Height: "21",
                // Width: "60",
                // Cancel: "True",
                // TabOrder: "4",
            },
            caption("&Cancel"),
        ),
        m("button.helpButton.TSpeedButton",
            {
                onclick: helpButtonClick,
                // Top: "63",
                // Left: "227",
                // Height: "25",
                // Width: "61",
                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
            },
            caption("&Help"),
        ),
        m("TGroupBox.GroupBox2.TGroupBox",
            {
                // Top: "76",
                // Left: "4",
                // Height: "81",
                // Width: "219",
                // TabOrder: "1",
            },
            "Filling",
            m("label.checkbox-inline.fillPolygons.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: fillPolygonsClick,
                    // Top: "16",
                    // Left: "10",
                    // Height: "17",
                    // Width: "97",
                    // TabOrder: "0",
                },),
                caption("Fill &polygons"),
            ),
            m("label.checkbox-inline.drawLinesBetweenPolygons.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: drawLinesBetweenPolygonsClick,
                    // Top: "32",
                    // Left: "10",
                    // Height: "17",
                    // Width: "167",
                    // TabOrder: "1",
                },),
                caption("Draw &lines between polygons"),
            ),
            m("TSpinEdit.lineContrastIndex.TSpinEdit",
                {
                    // Top: "51",
                    // Left: "10",
                    // Height: "22",
                    // Width: "40",
                    // MaxValue: "10",
                    // MinValue: "0",
                    // TabOrder: "2",
                    // Value: "10",
                },
            ),
            m("div.lineContrastIndexLabel.TLabel",
                {
                    // Top: "54",
                    // Left: "55",
                    // Height: "14",
                    // Width: "125",
                    // FocusControl: "lineContrastIndex",
                },
                caption("Line &contrast index (0-10)"),
            ),
        ),
        m("TGroupBox.GroupBox1.TGroupBox",
            {
                // Top: "158",
                // Left: "4",
                // Height: "55",
                // Width: "219",
                // TabOrder: "0",
            },
            "Sorting",
            m("label.checkbox-inline.sortPolygons.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: sortPolygonsClick,
                    // Top: "14",
                    // Left: "10",
                    // Height: "17",
                    // Width: "97",
                    // TabOrder: "0",
                },),
                caption("So&rt polygons"),
            ),
            m("label.checkbox-inline.sortTdosAsOneItem.TCheckBox", m("input[type=checkbox]",
                {
                    // Top: "32",
                    // Left: "10",
                    // Height: "17",
                    // Width: "157",
                    // TabOrder: "1",
                },),
                caption("Sort 3D objects as o&ne item"),
            ),
        ),
    )}
 
}

function CloseClick() { console.log("CloseClick") }

function cancelClick() { console.log("cancelClick") }

function draw3DObjectsClick() { console.log("draw3DObjectsClick") }

function drawLinesBetweenPolygonsClick() { console.log("drawLinesBetweenPolygonsClick") }

function fillPolygonsClick() { console.log("fillPolygonsClick") }

function helpButtonClick() { console.log("helpButtonClick") }

function sortPolygonsClick() { console.log("sortPolygonsClick") }

//
//procedure TOptionsForm.drawWithOpenGLClick(Sender: TObject);
//  begin
//  //drawLinesBetweenPolygons.enabled := (fillPolygons.checked) and (not drawWithOpenGL.checked);
//  //sortPolygons.enabled := not drawWithOpenGL.checked;
//  end;
//
