import * as m from "mithril"
import { TMainForm } from "../source/TMainForm"
import { PdDomain, domain } from "../source/PdDomain"
import { TBreederForm } from "./TBreederForm"
import { TTimeSeriesForm } from "./TTimeSeriesForm"
import { setActiveForm } from "./FormHolder"
import { resetDroppedDownMenuId } from "./menu"
import { imageDir } from "./common"

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

let waitMessage = ""

// In practice, the wait messages will not display unless a redraw happens like due to a wait on a promise
export function startWaitMessage(aString: string) {
    waitMessage = aString
    // console.log("startWaitMessage", aString)
}

export function stopWaitMessage() {
    waitMessage = ""
    // console.log("stopWaitMessage")
}

const Application = { 
    view: () => m("div.overflow-auto.h-100.relative", {
            onclick: (event: any) => {
                resetDroppedDownMenuId()
            },
        },
        m("div.ba.bw2.b--black.bg-white.pa2.ma2.orange.absolute.flex.items-center.flex-row" + (waitMessage ? "" : ".dn"), 
            { style: {
                left: "50%",
                top: "25%",
                transform: "translate(-50%, 0)",
                zIndex: 10,
            }
        },
            m("img.mr1", { src: imageDir + "WaitForm_Image1.png"}),
            waitMessage
        ),
        m(TMainForm),
        m(TBreederForm),
        m(TTimeSeriesForm),
    )
}

setActiveForm("MainForm")

m.mount(document.body, Application)
m.redraw()
