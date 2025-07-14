import * as m from "mithril"
// import { KfDrawingSurface } from "../source/KfDrawingSurface"
// import { TPoint } from "../source/TPoint"
// import { KfPoint3D } from "../source/KfPoint3D"
// import { KfTurtle } from "../source/KfTurtle"
// import { TRect } from "../source/TRect"
// import { KfObject3D } from "../source/KfObject3D"
import { PdPlant } from "../source/PdPlant"
import { PdDomain, domain } from "../source/PdDomain"
import { PdPlantDrawingAmendment } from "../source/PdPlantDrawingAmendment";
import { ColorDefs } from "../source/common";
import { PdPlantManager } from "../source/PdPlantManager";
// import { PdFiler } from "../source/PdFiler";

PdDomain.createDefault()

let plant: PdPlant | null = null
const amendment = new PdPlantDrawingAmendment()

async function createPlant() {
    // PdFiler.load("test.pla", plant)
    // plant.readLineAndTdoFromPlantFile()
    const plantManager = new PdPlantManager()
    const response = await fetch("data/test.pla")
    if (!response.ok) {
        alert("Problem loading plant file")
        return
    }
    const fileContents = await response.text()
    plantManager.loadPlantsFromFile("test.pla", false,  fileContents)
    const plantTemplate = plantManager.plantForIndex(0)
    if (!plantTemplate) {
        alert("Could not load plant from plant file")
        throw new Error("Could not load plant from plant file");
    }
    plant = plantManager.copyFromPlant(plantTemplate)

    // const plant = new PdPlant()
    // plant.defaultAllParameters()
    plant.basePoint_mm.x = 400
    plant.basePoint_mm.y = 450

    amendment.partID = plant.firstPhytomer!.partID
    amendment.addRotations = true
    plant.addAmendment(amendment)
    m.redraw()
}

// Turn off posed color for now
domain.options.selectedPosedColor = ColorDefs.clGreen
domain.options.nonHiddenPosedColor = ColorDefs.clGreen

let plantAge = 90
let zoom = 10

function growPlant() {
    if (!plant) return
    
    plant.reset()
    // Grow the plant a bit
    for (let i = 0; i < plantAge; i++) {
        plant.nextDay()
    }
}

growPlant()

// plant.firstPhytomer!.amendment = amendment

function randomize() {
    if (plant) plant.randomize()
}

const MyComponent = { 
    view: () => m("div.ma2", 
        m("canvas.ba", {
            width: 800,
            height: 500,
            onupdate(vnode: m.VnodeDOM) {
                const canvas = <HTMLCanvasElement>vnode.dom

                // Clear the canvas
                canvas.width = canvas.width

                const context = canvas.getContext("2d")
                if (!context) return

                if (plant) plant.drawOn(context)
            },
            onclick: () => {
                console.log("onclick")
                amendment.xRotation = (amendment.xRotation + 4) % 360
            }
        }),
        m("div", { style: "user-select: none" }, "Click canvas to rotate leaf"),
        m("br"),
        "Rotation",
        m("input[type=range].ml2", { min: 0, max: 360, value: amendment.xRotation, oninput: (event: any) => {
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
        m("span.ml2", plantAge),
        m("br"),
        m("br"),
        "Zoom",
        m("input[type=range].ml4", { min: 1, max: 100, value: zoom, oninput: (event: any) => {
            // console.log("slider", event, event.target.value)
            zoom = parseInt(event.target.value)
            if (plant) plant.drawingScale_PixelsPerMm = zoom / 10
        }}),
        m("span.ml2", zoom),
        m("br"),
        m("br"),
        m("button", { onclick: randomize } , "Randomize")
    )
}

createPlant()

m.mount(document.body, MyComponent)
m.redraw()
