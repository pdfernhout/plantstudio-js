import { zipSync } from "fflate"
import type { ExportedFile } from "./U3dexport"

export function prepareDownload(files: ExportedFile[]): { fileName: string, blob: Blob } {
    if (files.length === 0) throw new Error("No plants to export with these options.")
    if (files.length === 1) {
        const file = files[0]
        const type = typeof file.contents === "string" ? "text/plain;charset=utf-8" : "application/octet-stream"
        return { fileName: file.fileName, blob: new Blob([file.contents as BlobPart], { type }) }
    }
    const entries: { [name: string]: Uint8Array } = {}
    for (const file of files) {
        entries[file.fileName] = typeof file.contents === "string"
            ? new TextEncoder().encode(file.contents)
            : file.contents
    }
    return {
        fileName: files[0].fileName.replace(/\.[^.]+$/, "") + ".zip",
        blob: new Blob([zipSync(entries, { level: 0 }) as BlobPart], { type: "application/zip" }),
    }
}

export function downloadFiles(files: ExportedFile[]): void {
    const { fileName, blob } = prepareDownload(files)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    try {
        anchor.click()
    } finally {
        anchor.remove()
        // Leave the URL alive while the browser starts reading the download.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
}
