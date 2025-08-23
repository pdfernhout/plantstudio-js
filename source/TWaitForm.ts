// unit Uwait

import * as m from "mithril"
import { imageDir } from "./common"

let debugWait = false
let waitMessage = ""

// The wait messages will not display unless a redraw happens like from a wait on a promise
export function startWaitMessage(aString: string) {
    waitMessage = aString
    if (debugWait) console.log("startWaitMessage", aString)
}

export function stopWaitMessage() {
    waitMessage = ""
    if (debugWait) console.log("stopWaitMessage")
}

export class TWaitForm {
    view() {
        // A parent div must have ".relative" class
        return m("div.WaitForm.TWaitForm.ba.bw2.b--black.bg-white.pa2.ma2.orange.absolute.flex.items-center.flex-row", 
            { style: {
                left: "50%",
                top: "25%",
                transform: "translate(-50%, 0)",
                zIndex: 10,
                display: (waitMessage ? "block" : "none")
            }},
            m("img.mr1", { src: imageDir + "WaitForm_Image1.png" }),
            waitMessage
        )
    } 
}
