import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"
import { KfPoint3D } from "../source/KfPoint3D"
import { KfTurtle } from "../source/KfTurtle"
import { TRect } from "../source/TRect"
import { KfObject3D } from "../source/KfObject3D"
import { PdPlant } from "../source/PdPlant"
import { PdDomain } from "../source/PdDomain"

PdDomain.createDefault()
const plant = new PdPlant()
plant.defaultAllParameters()
plant.basePoint_mm.x = 300
plant.basePoint_mm.y = 300

// Grow the plant a bit
for (let i = 0; i < 90; i++) {
    plant.nextDay()
}

let yAngle = 0

function initDrawingSurface(drawingSurface: KfDrawingSurface) {
    drawingSurface.backColor = 255
    drawingSurface.foreColor = 255 * 256
    drawingSurface.circleColor = 128 * 256 * 256
    drawingSurface.lineColor = 255 * 256 * 256
    drawingSurface.lineWidth = 1.0
    drawingSurface.drawingLines = true
    drawingSurface.circlePointRadius = 2
    drawingSurface.circlingPoints = true
}

function drawPlant() {
    plant.drawOn(null)
}

function redrawEverything() {
    let turtle = KfTurtle.defaultStartUsing()
    try {
        initDrawingSurface(turtle.drawingSurface)
        turtle.drawOptions.draw3DObjects = true
        turtle.drawOptions.sortPolygons = false
        turtle.drawingSurface.recordingStart()
    } finally {
        KfTurtle.defaultStopUsing()
    }
    drawPlant()
    turtle = KfTurtle.defaultStartUsing()
    try {
        turtle.drawingSurface.recordingStop()
        turtle.drawingSurface.recordingDraw()
    } finally {
        KfTurtle.defaultStopUsing()
    }
}

// redrawEverything()

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

                const turtle = KfTurtle.defaultStartUsing()
                initDrawingSurface(turtle.drawingSurface)
                try {
                    // turtle.drawingSurface.pane = context
                    // turtle.drawingSurface.recordingDraw()
                    console.log("drawingSurface", turtle.drawingSurface)    
                } finally {
                    KfTurtle.defaultStopUsing()
                }     
                plant.drawOn(context)      
            },
            onclick: () => {
                console.log("onclick")
                yAngle += 4
                redrawEverything()
            }
        }),
        m("div", { style: "user-select: none" }, "Click canvas to rotate leaf"),
        m("input[type=range]", { min: 0, max: 256, value: yAngle, oninput: (event: any) => {
            console.log("slider", event, event.target.value)
            yAngle = parseInt(event.target.value)
            redrawEverything()
        }})
    )
}

m.mount(document.body, MyComponent)
m.redraw()
