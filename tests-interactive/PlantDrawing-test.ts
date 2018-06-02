import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"
import { KfPoint3D } from "../source/KfPoint3D"
import { KfTurtle } from "../source/KfTurtle"
import { TRect } from "../source/TRect"
import { KfObject3D } from "../source/KfObject3D"
import { PdPlant } from "../source/PdPlant"
import { PdDomain } from "../source/PdDomain"
import { PdPlantDrawingAmendment } from "../source/PdPlantDrawingAmendment";
import { ColorDefs } from "../source/common";

PdDomain.createDefault()
const plant = new PdPlant()
plant.defaultAllParameters()
plant.basePoint_mm.x = 250
plant.basePoint_mm.y = 400
const amendment = new PdPlantDrawingAmendment()
amendment.partID = plant.firstPhytomer!.partID
amendment.addRotations = true
amendment.faceColor = ColorDefs.clGreen
amendment.backfaceColor = ColorDefs.clGreen
amendment.lineColor = ColorDefs.clGreen
plant.addAmendment(amendment)

let plantAge = 90

function growPlant() {
    plant.reset()
    // Grow the plant a bit
    for (let i = 0; i < plantAge; i++) {
        plant.nextDay()
    }
}

growPlant()

// plant.firstPhytomer!.amendment = amendment

const MyComponent = { 
    view: () => m("div", 
        m("canvas.ba", {
            width: 500,
            height: 500,
            onupdate(vnode: m.VnodeDOM) {
                const canvas = <HTMLCanvasElement>vnode.dom

                // Clear the canvas
                canvas.width = canvas.width

                const context = canvas.getContext("2d")
                if (!context) return

                plant.drawOn(context)
            },
            onclick: () => {
                console.log("onclick")
                amendment.xRotation += 4
            }
        }),
        m("div", { style: "user-select: none" }, "Click canvas to rotate leaf"),
        m("br"),
        "Rotation",
        m("input[type=range].ml2", { min: 0, max: 365, value: amendment.xRotation, oninput: (event: any) => {
            // console.log("slider", event, event.target.value)
            amendment.xRotation = parseInt(event.target.value)
        }}),
        m("span.ml2", amendment.xRotation),
        m("br"),
        m("br"),
        "Age",
        m("input[type=range].ml4", { min: 0, max: 100, value: plantAge, oninput: (event: any) => {
            // console.log("slider", event, event.target.value)
            plantAge = parseInt(event.target.value)
            growPlant()
        }}),
        m("span.ml2", plantAge)
    )
}

m.mount(document.body, MyComponent)
m.redraw()
