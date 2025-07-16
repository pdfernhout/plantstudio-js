// Test with: npm run test-interactive

import * as m from "mithril"
import { PdPlant } from "../source/PdPlant"
import { PdDomain, domain } from "../source/PdDomain"
import { PdPlantDrawingAmendment } from "../source/PdPlantDrawingAmendment";
import { ColorDefs } from "../source/common";
import { PdPlantManager } from "../source/PdPlantManager";
import { PdSmallintParameterPanel } from "../source/PdSmallintParameterPanel";

PdDomain.createDefault()

let plant: PdPlant | null = null
const amendment = new PdPlantDrawingAmendment()

// Turn off posed color for now
domain.options.selectedPosedColor = ColorDefs.clGreen
domain.options.nonHiddenPosedColor = ColorDefs.clGreen

let plantAge = 90
let zoom = 10

const plantFileNames: string[] = [] 
let selectedPlantFileIndex = 0

const plantManager = new PdPlantManager()
let loadedPlants = false
let selectedPlantIndex = 0

const plantPath = "../plants/"

async function fetchPlantFileNames() {
    const response = await fetch(plantPath)
    if (!response.ok) {
        alert("Problem loading plants index")
        return
    }
    // Kludgy way to get list of plant file names
    // Assumes testing with: npm run test-interactive
    const fileContents = await response.text()
    const parser = new DOMParser();
    const doc = parser.parseFromString(fileContents, "text/html")
    const links = doc.querySelectorAll("a")
    for (let link of links) {
        const parts = link.href.split("/")
        const fileName = parts[parts.length - 1]
        if (fileName.endsWith(".pla")) {
            plantFileNames.push(decodeURIComponent(fileName))
        }
    }
    loadPlants(plantFileNames[0])
}

async function selectPlantFile(plantFileIndex: number) {
    loadPlants(plantFileNames[plantFileIndex])
}

async function loadPlants(fileName: string) {
    // const response = await fetch("../plants/test.pla")
    const response = await fetch(plantPath + fileName)
    if (!response.ok) {
        alert("Problem loading plant file")
        return
    }
    const fileContents = await response.text()
    plantManager.loadPlantsFromFile("UNUSED", false,  fileContents)
    loadedPlants = true
    selectedPlantIndex = 0
    createPlant(selectedPlantIndex)
}

async function createPlant(plantIndex: number) {
    const plantTemplate = plantManager.plantForIndex(plantIndex)
    if (!plantTemplate) {
        alert("Could not load plant from plant file")
        throw new Error("Could not load plant from plant file");
    }
    plant = plantManager.copyFromPlant(plantTemplate)
    plantManager.plants.pop()

    // const plant = new PdPlant()
    // plant.defaultAllParameters()
    plant.basePoint_mm.x = 400
    plant.basePoint_mm.y = 450
    plant.drawingScale_PixelsPerMm = zoom / 10

    amendment.partID = plant.firstPhytomer!.partID
    amendment.addRotations = true
    plant.addAmendment(amendment)
    // plant.firstPhytomer!.amendment = amendment

    m.redraw()
}

function growPlant() {
    if (!plant) return
    
    if (plant.age > plantAge) plant.reset()
    // Grow the plant a bit
    for (let i = plant.age; i < plantAge; i++) {
        plant.nextDay()
    }
}

growPlant()

function randomize() {
    if (plant) plant.randomize()
}

const MyComponent = { 
    view: () => m("div.ma2.flex.flex-row",
        m("div",
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
            m("div.mb2", "Library: ",
                !plantFileNames.length && "Loading..",
                plantFileNames.length && m("select",
                    {
                        onchange: (event: any) => {
                            selectedPlantFileIndex = event.target.value
                            selectPlantFile(selectedPlantFileIndex)
                        }
                    },
                    plantFileNames.map((plantFileName, index) =>
                        m("option", {
                            value: index,
                            selected: (index === selectedPlantFileIndex ? "selected" : undefined),
                        }, plantFileName.split(".")[0])
                    )
                ),
            ),
            m("div.mb2", "Plant: ",
                !loadedPlants && "Loading..",
                loadedPlants && m("select",
                    {
                        onchange: (event: any) => {
                            selectedPlantIndex = event.target.value
                            createPlant(selectedPlantIndex)
                        }
                    },
                    plantManager.plants.map((plant, index) =>
                        m("option", {
                            value: index,
                            selected: (index === selectedPlantIndex ? "selected" : undefined),
                        }, plant.name)
                    )
                ),
            ),
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
            m("input[type=range].ml4", { min: 0, max: 300, value: plantAge, oninput: (event: any) => {
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
            m("button", { onclick: randomize } , "Randomize"),
        ),
        plant && m("div.ba.pa1.flex-grow.w-100",
            "PANELS",
            m(PdSmallintParameterPanel, {
                plant: plant,
                param: domain.parameterManager.parameterForName("Age at which flowering starts")
            }),
            m(PdSmallintParameterPanel, {
                plant: plant,
                param: domain.parameterManager.parameterForName("Age at which flowering starts")
            }),
            m(PdSmallintParameterPanel, {
                plant: plant,
                param: domain.parameterManager.parameterForName("Minimum days for meristem to create")
            }),
            m(PdSmallintParameterPanel, {
                plant: plant,
                param: domain.parameterManager.parameterForName("Maximum days for meristem to create")
            })
        )
    )
}

fetchPlantFileNames()
// loadPlants("../plants/New version 2 plants.pla")

m.mount(document.body, MyComponent)
m.redraw()
