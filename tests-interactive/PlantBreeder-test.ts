// Test with: npm run test-interactive

// For Plant Breeder test

import * as m from "mithril"
import { PdPlant } from "../source/PdPlant"
import { PdDomain, domain } from "../source/PdDomain"
import { PdPlantDrawingAmendment } from "../source/PdPlantDrawingAmendment";
import { ColorDefs } from "../source/common";
import { PdPlantManager } from "../source/PdPlantManager";
import { PdSmallintParameterPanel } from "../source/PdSmallintParameterPanel";
import { PdBooleanParameterPanel } from "../source/PdBooleanParameterPanel";
import { PdListParameterPanel } from "../source/PdListParameterPanel";
import { PdRealParameterPanel } from "../source/PdRealParameterPanel";
import { PdColorParameterPanel } from "../source/PdColorParameterPanel";
import { PdHeaderParameterPanel } from "../source/PdHeaderParameterPanel";
import { PdSCurveParameterPanel } from "../source/PdSCurveParameterPanel";
import { PdTdoParameterPanel } from "../source/PdTdoParameterPanel";
import { FieldType, IndexType, PdParameter } from "../source/PdParameter";
import { readTDOsFile } from "../source/KfObject3D";
import { ModalInputView } from "../source/ModalInputView";
import { TBreederForm } from "../source/TBreederForm";

PdDomain.createDefault()
domain.defaultTdoLibraryFileName = "../plants/3D object library.tdo"

async function fetchDefaultTDOLibrary() {
    domain.defaultTdoLibrary = await readTDOsFile(domain.defaultTdoLibraryFileName)
}

fetchDefaultTDOLibrary()

let plant: PdPlant | null = null
const amendment = new PdPlantDrawingAmendment()

// Turn off posed color for now
domain.options.selectedPosedColor = ColorDefs.clGreen
domain.options.nonHiddenPosedColor = ColorDefs.clGreen

let plantAge = 90
let zoom = 10

const plantManager = new PdPlantManager()
let loadedPlants = false
let selectedPlantIndex = 0

const plantPath = "../plants/"

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
    view: () => m("div.flex.flex-row.h-100",
        m(ModalInputView),
        m("div.pa2",
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
            m("div", { style: "user-select: none" }, "Click canvas to rotate plant"),
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
        plant && m("div.flex-grow.h-100.pa2.overflow-scroll",
            m("div", { key: plant.name },
                m("div.tc.ba", "Plant Breeder test"),
                m(TBreederForm, { testPlant: plant}),
            )
        )
    )
}

loadPlants("../plants/New version 2 plants.pla")

m.mount(document.body, MyComponent)
m.redraw()
