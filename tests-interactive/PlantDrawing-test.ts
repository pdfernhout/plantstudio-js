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
plant.basePoint_mm.x = 300
plant.basePoint_mm.y = 300
const ammendment = new PdPlantDrawingAmendment()
ammendment.partID = plant.firstPhytomer!.partID
ammendment.addRotations = true
plant.addAmendment(ammendment)

// Grow the plant a bit
for (let i = 0; i < 90; i++) {
    plant.nextDay()
}



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
                ammendment.xRotation += 4
            }
        }),
        m("div", { style: "user-select: none" }, "Click canvas to rotate leaf"),
        m("input[type=range]", { min: 0, max: 256, value: ammendment.xRotation, oninput: (event: any) => {
            // console.log("slider", event, event.target.value)
            ammendment.xRotation = parseInt(event.target.value)
        }})
    )
}

m.mount(document.body, MyComponent)
m.redraw()
