import * as o from "ospec"
import { ColorDefs } from "../source/common"
import { PdDomain, domain } from "../source/PdDomain"
import { KfPoint3D } from "../source/KfPoint3D"
import { KfTriangle } from "../source/KfTriangle"
import { KfTurtle } from "../source/KfTurtle"
import {
    ExportFormats,
    Axis,
    KfDrawingSurfaceFor3DS,
    KfDrawingSurfaceForDXF,
    KfDrawingSurfaceForLWO,
    KfDrawingSurfaceForOBJ,
    KfDrawingSurfaceForPOV,
    KfDrawingSurfaceForVRML,
} from "../source/U3dexport"

function configureExports(): void {
    PdDomain.createDefault()
    for (let i = ExportFormats.kDXF; i <= ExportFormats.k3DExportTypeLast; i++) {
        const options = domain.exportOptionsFor3D[i]
        options.overallScalingFactor_pct = 100
        options.lengthOfShortName = 16
        options.layeringOption = 0
        options.writeColors = false
        options.vrml_version = 1
    }
}

function triangle(): KfTriangle {
    const result = new KfTriangle()
    result.points[0].setXYZ(1, 2, 3)
    result.points[1].setXYZ(4, 5, 6)
    result.points[2].setXYZ(-1, 8, 9)
    return result
}

function addBufferedTriangle(surface: KfDrawingSurfaceFor3DS | KfDrawingSurfaceForOBJ | KfDrawingSurfaceForVRML): void {
    const shape = triangle()
    surface.startVerticesAndTriangles()
    surface.addPoint(shape.points[0])
    surface.addPoint(shape.points[1])
    surface.addPoint(shape.points[2])
    surface.addTriangle(0, 1, 2)
    surface.endVerticesAndTriangles()
}

interface Chunk {
    id: number
    start: number
    end: number
}

// Parse container boundaries rather than searching for byte signatures that
// might occur inside a coordinate or a name.
function threeDSChunks(bytes: Uint8Array, start = 0, end = bytes.length): Chunk[] {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const chunks: Chunk[] = []
    let offset = start
    while (offset < end) {
        if (offset + 6 > end) throw new Error("Truncated 3DS header")
        const id = view.getUint16(offset, true)
        const length = view.getUint32(offset + 2, true)
        if (length < 6 || offset + length > end) throw new Error("Invalid 3DS chunk length")
        const chunk = { id, start: offset + 6, end: offset + length }
        chunks.push(chunk)
        let children = chunk.start
        if (id === 0x4000) {
            while (children < chunk.end && bytes[children] !== 0) children++
            if (children === chunk.end) throw new Error("Unterminated 3DS object name")
            children++
        }
        if ([0x4D4D, 0x3D3D, 0x4000, 0x4100].includes(id)) {
            chunks.push(...threeDSChunks(bytes, children, chunk.end))
        }
        offset = chunk.end
    }
    return chunks
}

o.spec("3D exporters", () => {
    o.beforeEach(configureExports)

    o("writes DXF geometry", () => {
        const surface = new KfDrawingSurfaceForDXF("test.dxf")
        surface.startFile()
        surface.startPlant("Test Plant", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        surface.basicDrawTriangle(triangle())
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        o(output.includes("3DFACE")).equals(true)
        o(output.endsWith("EOF\n")).equals(true)
    })

    o("writes POV geometry", () => {
        const surface = new KfDrawingSurfaceForPOV("test.inc")
        surface.startFile()
        surface.startPlant("Test Plant", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        surface.basicDrawTriangle(triangle())
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        o(output.includes("#declare Test_Plant = union")).equals(true)
        o(output.includes("triangle { <1.0, -2.0, 3.0>")).equals(true)
    })

    o("writes OBJ vertices and faces for 3D objects", () => {
        const surface = new KfDrawingSurfaceForOBJ("test.obj")
        surface.startFile()
        surface.startPlant("Test Plant", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        addBufferedTriangle(surface)
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        o(output.includes("v 1.0 -2.0 3.0")).equals(true)
        o(output.includes("f -3 -2 -1")).equals(true)
    })

    o("writes VRML 2 geometry", () => {
        const surface = new KfDrawingSurfaceForVRML("test.wrl")
        surface.startFile()
        surface.startPlant("Test Plant", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        addBufferedTriangle(surface)
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        o(output.startsWith("#VRML V2.0 utf8")).equals(true)
        o(output.includes("coordIndex [")).equals(true)
        o(output.includes("0, 1, 2, -1")).equals(true)
    })

    o("writes a valid-sized little-endian 3DS chunk", () => {
        const surface = new KfDrawingSurfaceFor3DS("test.3ds")
        surface.startFile()
        surface.startPlant("Test Plant", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        addBufferedTriangle(surface)
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        const view = new DataView(output.buffer, output.byteOffset, output.byteLength)
        o(view.getUint16(0, true)).equals(0x4D4D)
        o(view.getUint32(2, true)).equals(output.length)
        o(output.length > 40).equals(true)
        const chunks = threeDSChunks(output)
        const points = chunks.find(chunk => chunk.id === 0x4110)!
        const faces = chunks.find(chunk => chunk.id === 0x4120)!
        o(view.getUint16(points.start, true)).equals(3)
        o(points.end - points.start).equals(2 + 3 * 12)
        o([0, 1, 2].map(i => view.getFloat32(points.start + 2 + i * 4, true)))
            .deepEquals([1, 2, 3])
        o(view.getUint16(faces.start, true)).equals(1)
        o([0, 1, 2].map(i => view.getUint16(faces.start + 2 + i * 2, true)))
            .deepEquals([0, 1, 2])
    })

    o("writes a valid-sized big-endian LWO FORM", () => {
        const surface = new KfDrawingSurfaceForLWO("test.lwo")
        surface.startFile()
        const shape = triangle()
        surface.addPoint(new KfPoint3D(shape.points[0]))
        surface.addPoint(new KfPoint3D(shape.points[1]))
        surface.addPoint(new KfPoint3D(shape.points[2]))
        surface.addTriangle(0, 1, 2)
        surface.endFile()
        const output = surface.fileContents()
        const view = new DataView(output.buffer, output.byteOffset, output.byteLength)
        o(String.fromCharCode(...Array.from(output.slice(0, 4)))).equals("FORM")
        o(view.getUint32(4, false)).equals(output.length - 8)
        o(String.fromCharCode(...Array.from(output.slice(8, 12)))).equals("LWOB")
        let offset = 12
        const chunks: { [name: string]: { start: number, length: number } } = {}
        while (offset < output.length) {
            const name = String.fromCharCode(...Array.from(output.slice(offset, offset + 4)))
            const length = view.getUint32(offset + 4, false)
            if (offset + 8 + length > output.length) throw new Error("Invalid LWO chunk length")
            chunks[name] = { start: offset + 8, length }
            offset += 8 + length + length % 2
        }
        o(offset).equals(output.length)
        o(chunks.PNTS.length).equals(36)
        o([0, 1, 2].map(i => view.getFloat32(chunks.PNTS.start + i * 4, false)))
            .deepEquals([1, 2, 3])
        o(chunks.POLS.length).equals(10)
        o([0, 1, 2, 3, 4].map(i => view.getUint16(chunks.POLS.start + i * 2, false)))
            .deepEquals([3, 0, 1, 2, 1])
    })

    o("applies buffered coordinate scaling once and presses the requested axis", () => {
        domain.exportOptionsFor3D[ExportFormats.k3DS].overallScalingFactor_pct = 200
        domain.exportOptionsFor3D[ExportFormats.k3DS].pressPlants = true
        domain.exportOptionsFor3D[ExportFormats.k3DS].directionToPressPlants = Axis.kY
        const surface = new KfDrawingSurfaceFor3DS("scaled.3ds")
        surface.startFile()
        surface.startPlant("Scaled", 0)
        surface.start3DObject("Leaf", "Leaf", ColorDefs.clGreen, 3)
        addBufferedTriangle(surface)
        surface.end3DObject()
        surface.endPlant()
        surface.endFile()
        const output = surface.fileContents()
        const view = new DataView(output.buffer, output.byteOffset, output.byteLength)
        const points = threeDSChunks(output).find(chunk => chunk.id === 0x4110)!
        o([0, 1, 2].map(i => view.getFloat32(points.start + 2 + i * 4, true)))
            .deepEquals([2, 0, 6])
    })

    o("encodes words, dwords, and negative IEEE floats in each format's byte order", () => {
        for (const surface of [new KfDrawingSurfaceFor3DS("words.3ds"), new KfDrawingSurfaceForLWO("words.lwo")]) {
            surface.startFile()
            surface.writeWord(0x1234)
            surface.writeDword(0x89ABCDEF)
            surface.writeFloat(-1.5)
            const bytes = surface.fileContents().slice(-10)
            const expected = surface instanceof KfDrawingSurfaceFor3DS
                ? [0x34, 0x12, 0xEF, 0xCD, 0xAB, 0x89, 0, 0, 0xC0, 0xBF]
                : [0x12, 0x34, 0x89, 0xAB, 0xCD, 0xEF, 0xBF, 0xC0, 0, 0]
            o(Array.from(bytes)).deepEquals(expected)
        }
    })

    o("returns completed text and binary export contents through the turtle", () => {
        const turtle = new KfTurtle()
        turtle.createFor3DOutput(ExportFormats.kDXF, "turtle.dxf")
        turtle.start3DExportFile()
        turtle.end3DExportFile()
        o((turtle.exportedFileContents() as string).endsWith("EOF\n")).equals(true)
        turtle.createFor3DOutput(ExportFormats.k3DS, "turtle.3ds")
        turtle.start3DExportFile()
        turtle.end3DExportFile()
        const bytes = turtle.exportedFileContents() as Uint8Array
        o(threeDSChunks(bytes).map(chunk => chunk.id)).deepEquals([0x4D4D, 0x3D3D])
    })
})
