import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"
import { TBreederForm } from "./TBreederForm"
import { TTimeSeriesForm } from "./TTimeSeriesForm"
import { setActiveForm } from "./FormHolder"
import { resetDroppedDownMenuId } from "./menu"
import { TWaitForm } from "./TWaitForm"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

const Application = { 
    view: () => m("div.overflow-auto.h-100.relative", {
            onclick: (event: any) => {
                resetDroppedDownMenuId()
            },
        },
        m(TWaitForm),
        m(TMainForm),
        m(TBreederForm),
        m(TTimeSeriesForm),
    )
}

setActiveForm("MainForm")

m.mount(document.body, Application)
m.redraw()
