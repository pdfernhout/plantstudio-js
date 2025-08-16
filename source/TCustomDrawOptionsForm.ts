// unit ucustdrw

import * as m from "mithril"
import { caption, HelpJump, imageDir, IntToStr, StrToIntRange } from "./common"
import { domain, DomainOptionsStructure } from "./PdDomain"

function captionMaybeDisabled(text: string, disabled: boolean) {
    return m("span" + (disabled ? ".gray" : ""), caption(text))
}

export class TCustomDrawOptionsForm {
    options: DomainOptionsStructure = new DomainOptionsStructure()
    close: ((options: DomainOptionsStructure | null) => void) | null = null

    optionsChanged(): boolean {
        return JSON.stringify(this.options) !== JSON.stringify(domain.options)
    }
    
    view(vnode: any) {
        return m("CustomDrawOptionsForm.TCustomDrawOptionsForm",
            m("div.f4", "Custom Draw Options"),
            m("div.GroupBox3.TGroupBox.mt2",
                m("div.b", "Drawing"),
                m("label.checkbox-inline.drawStems.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.drawStems,
                        onclick: (event: any) => this.options.drawStems = event.target.checked
                    }),
                    caption("Draw &stems"),
                ),
                m("label.checkbox-inline.draw3DObjects.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.draw3DObjects,
                        onclick: (event: any) => this.options.draw3DObjects = event.target.checked
                    }),
                    caption("Draw &3D objects"),
                ),
                m("label.checkbox-inline.draw3DObjectsAsBoundingRectsOnly.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.draw3DObjectsAsBoundingRectsOnly,
                        disabled: !this.options.draw3DObjects,
                        onclick: (event: any) => this.options.draw3DObjectsAsBoundingRectsOnly = event.target.checked
                    }),
                    captionMaybeDisabled("Draw 3D object &bounding boxes only", !this.options.draw3DObjects),
                ),
            ),
            m("div.GroupBox2.TGroupBox.mt2",
                m("div.b", "Filling"),
                m("label.checkbox-inline.fillPolygons.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.fillPolygons,
                        onclick: (event: any) => this.options.fillPolygons = event.target.checked
                    }),
                    caption("Fill &polygons"),
                ),
                m("label.checkbox-inline.drawLinesBetweenPolygons.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.drawLinesBetweenPolygons,
                        disabled: !this.options.fillPolygons, // and (not drawWithOpenGL.checked)
                        onclick: (event: any) => this.options.drawLinesBetweenPolygons = event.target.checked
                    }),
                    captionMaybeDisabled("Draw &lines between polygons", !this.options.fillPolygons),
                ),
                m("label.lineContrastIndexLabel.TLabel.db.mt1",
                    captionMaybeDisabled("Line &contrast index (0-10)", !this.options.drawLinesBetweenPolygons || !this.options.fillPolygons),
                    m("br"),
                    m("input[type=number].lineContrastIndex.TSpinEdit.mw3.ml1",
                        {
                            value: IntToStr(this.options.lineContrastIndex),
                            disabled: !this.options.drawLinesBetweenPolygons || !this.options.fillPolygons, // and (not drawWithOpenGL.checked)
                            onchange: (event: any) => this.options.lineContrastIndex = StrToIntRange(event.target.value, 0, 10),
                            step: 1,
                            min: "0",
                            max: "10"
                        },
                    ),
                ),
            ),
            m("div.GroupBox1.TGroupBox.mt2",
                m("div.b", "Sorting"),
                m("label.checkbox-inline.sortPolygons.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.sortPolygons,
                        // disabled: not drawWithOpenGL.checked
                        onclick: (event: any) => this.options.sortPolygons = event.target.checked
                    }),
                    caption("So&rt polygons"),
                ),
                m("label.checkbox-inline.sortTdosAsOneItem.TCheckBox.db.mt1", m("input[type=checkbox].mr1",
                    {
                        checked: this.options.sortTdosAsOneItem,
                        disabled: !this.options.sortPolygons,
                        onclick: (event: any) => this.options.sortTdosAsOneItem = event.target.checked
                    }),
                    captionMaybeDisabled("Sort 3D objects as o&ne item", !this.options.sortPolygons),
                ),
            ),
            m("div.mt2",
                m("button.OK.TButton",
                    {
                        onclick: () => this.okClick(),
                        disabled: !this.optionsChanged()
                    },
                    caption("&OK"),
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                    },
                    caption("&Cancel"),
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                    },
                    m("img.TImage",
                        {
                            src: imageDir + "CustomDrawOptionsForm_helpButton.png"
                        },
                    ),
                    caption("&Help"),
                ),
            )
        )
    }

    okClick() {
        this.close!(this.optionsChanged() ? this.options : null)
    }

    cancelClick() {
        this.close!(null)
    }

    helpButtonClick() { 
        HelpJump("Changing_the_drawing_speed")
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.options = JSON.parse(JSON.stringify(domain.options))
    }
}
