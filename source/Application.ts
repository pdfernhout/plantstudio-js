import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"
import { TBreederForm } from "./TBreederForm"
import { TTimeSeriesForm } from "./TTimeSeriesForm"
import { setActiveForm } from "./FormHolder"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

const Application = { 
    view: () => m("div.overflow-auto.h-100",
        m(TMainForm),
        m(TBreederForm),
        m(TTimeSeriesForm),
    )
}

setActiveForm("MainForm")

m.mount(document.body, Application)
m.redraw()
