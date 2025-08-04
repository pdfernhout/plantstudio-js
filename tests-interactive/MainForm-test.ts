import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

const MyComponent = { 
    view: () => m("div.overflow-auto.h-100",
        m(TMainForm)
    )
}

m.mount(document.body, MyComponent)
m.redraw()
