import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"
import { KfPoint3D } from "../source/KfPoint3D";
import { KfTurtle } from "../source/KfTurtle";
import { TRect } from "../source/TRect";
import { KfObject3D } from "../source/KfObject3D";

let yAngle = 0

const drawingSurface = new KfDrawingSurface(null)
drawingSurface.recordingStart()

function drawATriangle() {
    drawingSurface.backColor = 255
    drawingSurface.foreColor = 255 * 256
    drawingSurface.circleColor = 128 * 256 * 256
    drawingSurface.lineColor = 255 * 256 * 256
    drawingSurface.lineWidth = 1.0
    drawingSurface.drawingLines = true
    drawingSurface.circlePointRadius = 5
    drawingSurface.circlingPoints = true
    const p1 = new KfPoint3D()
    p1.x = 40
    p1.y = 40
    p1.z = 0
    const p2 = new KfPoint3D()
    p2.x = 140
    p2.y = 40
    p2.z = 0
    const p3 = new KfPoint3D()
    p3.x = 90
    p3.y = 140
    p3.z = 0
    // drawing surface takes over ownership of triangle
    const triangle = drawingSurface.allocateTriangle()
    triangle.points[0] = p1
    triangle.points[1] = p2
    triangle.points[2] = p3
    triangle.plantPartID = 0
    drawingSurface.drawLastTriangle()
}

// drawATriangle()

const turtle = new KfTurtle()
turtle.drawingSurface = drawingSurface

function drawWithTurtle() {
    drawingSurface.backColor = 255
    drawingSurface.foreColor = 255 * 256
    drawingSurface.circleColor = 128 * 256 * 256
    drawingSurface.lineColor = 255 * 256 * 256
    drawingSurface.lineWidth = 1.0
    drawingSurface.drawingLines = true
    drawingSurface.circlePointRadius = 2
    drawingSurface.circlingPoints = true
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

drawWithTurtle()

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
    turtle.rotateY(yAngle)
    tdo.draw(turtle, 1.0, "test", "test", 0, 0)
}

drawWithTDO()

drawingSurface.recordingStop()

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

                /*
                context.beginPath()
                context.arc(300, 300, 30, 0, 2 * Math.PI)
                context.stroke()
                */

                /*
                context.beginPath()
                context.moveTo(0, 0)
                context.lineTo(300, 100)
                context.closePath()
                context.strokeStyle = "#00FFFF"
                context.stroke()
                */
                drawingSurface.pane = context
                // drawATriangle()
                drawingSurface.recordingDraw()
                console.log("drawingSurface", drawingSurface)

                // TODO: Do something with drawingSurface here
                
            },
            onclick: () => {
                console.log("onclick")
                yAngle += 4
                turtle.reset()
                drawingSurface.recordingStart()
                drawWithTurtle()
                drawWithTDO()
                drawingSurface.recordingStop()
                drawingSurface.recordingDraw()
            }
        }),
        m("div", { style: "user-select: none" }, "Click canvas to rotate leaf"),
    )
}

m.mount(document.body, MyComponent)
m.redraw()
