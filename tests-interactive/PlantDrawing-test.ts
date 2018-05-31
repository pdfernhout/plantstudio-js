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

let yAngle = 0

const drawingSurface = new KfDrawingSurface(null)

const turtle = new KfTurtle()
turtle.drawingSurface = drawingSurface

function initDrawingSurface() {
    drawingSurface.backColor = 255
    drawingSurface.foreColor = 255 * 256
    drawingSurface.circleColor = 128 * 256 * 256
    drawingSurface.lineColor = 255 * 256 * 256
    drawingSurface.lineWidth = 1.0
    drawingSurface.drawingLines = true
    drawingSurface.circlePointRadius = 2
    drawingSurface.circlingPoints = true
}

function drawWithTurtle() {
    const rect = new TRect(50, 50, 150, 150)
    turtle.drawTrianglesFromBoundsRect(rect)
    drawingSurface.backColor = 128
    drawingSurface.foreColor = 128 * 256
    turtle.xyz(300, 300, 0)
    turtle.moveInPixelsAndRecord(100)
    turtle.rotateZ(64);
    turtle.moveInPixelsAndRecord(100)
    turtle.rotateZ(64);
    turtle.moveInPixelsAndRecord(100)
    turtle.drawTriangleFromIndexes(1, 2, 3, 0)
}

function drawWithTDO() {
    const exampleTDOMemo = `start 3D object
    Name=Tutorial leaf
    Point=0 0 0
    Point=-7 -75 8
    Point=1 -77 6
    Point=-8 -117 6
    Point=1 -119 4
    Point=2 -179 2
    Point=10 -117 6
    Point=9 -75 7
    Triangle=1 2 3
    Triangle=2 4 3
    Triangle=4 5 3
    Triangle=4 6 5
    Triangle=5 6 7
    Triangle=3 5 7
    Triangle=3 7 8
    Triangle=3 8 1
end 3D object`.split("\n")

    const tdo = new KfObject3D()
    tdo.readFromMemo(exampleTDOMemo, 0)

    turtle.drawOptions.draw3DObjects = true
    turtle.xyz(300, 300, 0)
    turtle.rotateY(yAngle)
    tdo.draw(turtle, 1.0, "test", "test", 0, 0)
}

function drawPlant() {
    const plant = new PdPlant()
    turtle.xyz(300, 300, 0)
    plant.draw()
}

function redrawEverything() {
    initDrawingSurface()
    turtle.reset()
    drawingSurface.recordingStart()
    // drawWithTurtle()
    // drawWithTDO()
    drawPlant()
    drawingSurface.recordingStop()
    drawingSurface.recordingDraw()
}

redrawEverything()

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

                drawingSurface.pane = context
                drawingSurface.recordingDraw()
                console.log("drawingSurface", drawingSurface)               
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
