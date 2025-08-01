import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"

const MyComponent = { 
    view: () => m("div",
        m(TMainForm)
    )
}

m.mount(document.body, MyComponent)
m.redraw()
