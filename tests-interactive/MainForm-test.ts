import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"
import { setActiveForm } from "../source/FormHolder"
import { ModalInputView } from "../source/ModalInputView"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

const MyComponent = { 
    view: () => m("div.overflow-auto.h-100",
        m(ModalInputView),
        m(TMainForm)
    )
}

setActiveForm("MainForm")

m.mount(document.body, MyComponent)
m.redraw()
