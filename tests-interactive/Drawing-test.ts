import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"
import { KfPoint3D } from "../source/temporary";

const drawingSurface = new KfDrawingSurface(null)
drawingSurface.backColor = 255
drawingSurface.foreColor = 255 * 256
drawingSurface.lineColor = 255 * 256 * 256
drawingSurface.recordingStart()
// drawing surface takes over ownership of triangle
const triangle = drawingSurface.allocateTriangle()
drawingSurface.lineWidth = 1.0
const p1 = new KfPoint3D()
p1.x = 0
p1.y = 0
p1.z = 0
const p2 = new KfPoint3D()
p2.x = 100
p2.y = 0
p2.z = 0
const p3 = new KfPoint3D()
p3.x = 50
p3.y = 100
p3.z = 0
triangle.points[0] = p2
triangle.points[1] = p1
triangle.points[2] = p3
triangle.plantPartID = 0
drawingSurface.drawLastTriangle()
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
                context.moveTo(0, 0)
                context.lineTo(300, 100)
                context.closePath()
                context.strokeStyle = "#00FFFF"
                context.stroke()
                */
                drawingSurface.pane = context
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
