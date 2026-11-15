import * as o from "ospec"
import { PdDomain, domain } from "../source/PdDomain"
import { PdPlant } from "../source/PdPlant"
import { PdPlantPart } from "../source/PdPlantPart"
import { KfTurtle } from "../source/KfTurtle"
import { KfDrawingSurfaceForOBJ, ExportFormats } from "../source/U3dexport"
import { TRect } from "../source/TRect"

o.spec("plant exports", () => {
    o.beforeEach(() => { PdDomain.createDefault() })

    o("shares a curved stem's end ring with the next segment", () => {
        const turtle = new KfTurtle()
        turtle.createFor3DOutput(ExportFormats.kOBJ, "stem.obj")
        turtle.writingTo = ExportFormats.kOBJ
        const part = Object.create(PdPlantPart.prototype) as PdPlantPart
        part.plant = { turtle } as PdPlant
        const surface = turtle.fileExportSurface() as KfDrawingSurfaceForOBJ
        surface.startFile()
        surface.startPlant("Stem", 0)
        surface.startStemSegment("Stem", "Stem", 0, 1, 1)
        const firstEnd = part.write3DExportLine(0, 10, 2, 2, 0)
        turtle.rotateZ(10)
        part.write3DExportLine(0, 10, 2, 2, 1, firstEnd)
        surface.endStemSegment()
        surface.endFile()
        const vertices = surface.fileContents().split("\n")
            .filter(line => line.startsWith("v ")).map(line => line.split(" ").slice(1).map(Number))
        o(vertices.length).equals(20)
        o(vertices.every(point => point.every(Number.isFinite))).equals(true)
        o(vertices.slice(5, 10)).deepEquals(vertices.slice(10, 15))
        o(surface.fileContents().split("\n").filter(line => line.startsWith("f ")).length).equals(20)
    })

    o("writes each OBJ material once, including the last material", () => {
        const surface = new KfDrawingSurfaceForOBJ("plant.obj")
        surface.options.writeColors = true
        surface.startFile()
        surface.startColor(0x00FF00, "Leaf")
        surface.startColor(0x00FF00, "Leaf")
        surface.startColor(0xFF0000, "Flower")
        surface.endFile()
        const files = surface.exportedFiles()
        o(files.map(file => file.fileName)).deepEquals(["plant.obj", "plant.mtl"])
        const materials = files[1].contents as string
        o(materials.match(/^newmtl /gm)?.length).equals(2)
        o(materials.includes("newmtl Flower\n")).equals(true)
        o(materials.includes("Kd 0.0 1.0 0.0\n")).equals(true)
    })

    o("filters hidden and unselected plants and restores the rendering turtle", () => {
        const calls: string[] = []
        const oldTurtle = new KfTurtle()
        function plant(name: string, hidden: boolean): PdPlant {
            return {
                hidden,
                turtle: oldTurtle,
                boundsRect_pixels: () => new TRect(1, 1, 20, 20),
                saveToGlobal3DOutputFile(_index: number, _translate: boolean, _rect: TRect, _type: number, turtle: KfTurtle) {
                    this.turtle = turtle
                    calls.push(name)
                },
            } as PdPlant
        }
        const chosen = plant("chosen", false)
        const hidden = plant("hidden", true)
        const unselected = plant("unselected", false)
        domain.plantManager.plants = [chosen, hidden, unselected]
        domain.plantManager.write3DOutputFileToFileName([chosen, hidden], true, true, "plant.obj", ExportFormats.kOBJ)
        o(calls).deepEquals(["chosen"])
        o(chosen.turtle).equals(oldTurtle)
        chosen.saveToGlobal3DOutputFile = () => { chosen.turtle = null; throw new Error("export failed") }
        let message = ""
        try {
            domain.plantManager.write3DOutputFileToFileName([chosen], true, true, "plant.obj", ExportFormats.kOBJ)
        } catch (error: any) { message = error.message }
        o(message).equals("export failed")
        o(chosen.turtle).equals(oldTurtle)
    })
})
