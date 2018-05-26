import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"
import { KfPoint3D } from "../source/temporary";
import { KfTurtle } from "../source/KfTurtle";
import { TRect } from "../source/TRect";

const drawingSurface = new KfDrawingSurface(null)

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
    drawingSurface.recordingStart()
    // drawing surface takes over ownership of triangle
    const triangle = drawingSurface.allocateTriangle()
    triangle.points[0] = p1
    triangle.points[1] = p2
    triangle.points[2] = p3
    triangle.plantPartID = 0
    drawingSurface.drawLastTriangle()
    drawingSurface.recordingStop()
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
    drawingSurface.circlePointRadius = 5
    drawingSurface.circlingPoints = true
    const rect = new TRect(50, 50, 150, 150)
    drawingSurface.recordingStart()
    turtle.drawTrianglesFromBoundsRect(rect)
    drawingSurface.recordingStop()
}

drawWithTurtle()

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
            // onclick: () => mapDrawer.scroll.X -= 20,
        }),
    )
}

m.mount(document.body, MyComponent)
m.redraw()
