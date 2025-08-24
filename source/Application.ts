import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"
import { TBreederForm } from "./TBreederForm"
import { TTimeSeriesForm } from "./TTimeSeriesForm"
import { setActiveForm } from "./FormHolder"
import { resetDroppedDownMenuId } from "./menu"
import { TWaitForm } from "./TWaitForm"
import { TDebugForm } from "./TDebugForm"
import { ModalInputView } from "./ModalInputView"
import { TWizardFormDisplayingPlant } from "./TWizardForm"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

const Application = { 
    view: () => m("div.overflow-auto.h-100.relative", {
            onclick: (event: any) => {
                resetDroppedDownMenuId()
            },
        },
        m(ModalInputView),
        m(TWaitForm),
        m(TMainForm),
        m(TBreederForm),
        m(TTimeSeriesForm),
        m(TWizardFormDisplayingPlant),
        m(TDebugForm),
    )
}

setActiveForm("MainForm")

m.mount(document.body, Application)
m.redraw()
