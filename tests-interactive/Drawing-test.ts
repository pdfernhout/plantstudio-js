import * as m from "mithril"
import { KfDrawingSurface } from "../source/KfDrawingSurface"
import { TPoint } from "../source/TPoint"

const drawingSurface = new KfDrawingSurface(null)

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
                context.beginPath()
                context.moveTo(0, 0)
                context.lineTo(300, 100)
                context.closePath()
                context.strokeStyle = "#00FFFF"
                context.stroke()

                // TODO: Do something with drawingSurface here
                
            },
            // onclick: () => mapDrawer.scroll.X -= 20,
        }),
    )
}

m.mount(document.body, MyComponent)
m.redraw()
