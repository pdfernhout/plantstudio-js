import * as o from "ospec"
import { unzipSync } from "fflate"
import { prepareDownload } from "../source/FileDownload"

o.spec("export downloads", () => {
    o("keeps binary output unchanged", async () => {
        const bytes = new Uint8Array([0, 255, 128, 13, 10])
        const download = prepareDownload([{ fileName: "plant.3ds", contents: bytes }])
        o(download.fileName).equals("plant.3ds")
        o(Array.from(new Uint8Array(await download.blob.arrayBuffer()))).deepEquals(Array.from(bytes))
    })

    o("keeps OBJ and material files together with their referenced names", async () => {
        const download = prepareDownload([
            { fileName: "plant.obj", contents: "mtllib plant.mtl\nusemtl Leaf\n" },
            { fileName: "plant.mtl", contents: "newmtl Leaf\nKd 0 1 0\n" },
        ])
        const files = unzipSync(new Uint8Array(await download.blob.arrayBuffer()))
        o(download.fileName).equals("plant.zip")
        o(download.blob.type).equals("application/zip")
        o(Object.keys(files)).deepEquals(["plant.obj", "plant.mtl"])
        o(new TextDecoder().decode(files["plant.mtl"])).equals("newmtl Leaf\nKd 0 1 0\n")
    })

    o("rejects empty exports instead of downloading an empty file", () => {
        let message = ""
        try { prepareDownload([]) } catch (error: any) { message = error.message }
        o(message).equals("No plants to export with these options.")
    })
})
