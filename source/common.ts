export type float = number
export type double = number
export type long = number
export type int = number
export type short = number
export type byte = number
export type TColor = number
export type TColorRef = number
export type TMemo = string[]

export const imageDir = "../source/resources/"

export function intround(x: number) {
    return Math.round(x)
}

export const ColorDefs = {
    clAqua: 0xFFFF00,
    clBlack: 0x000000,
    clBlue: 0x0000FF,
    clFuchsia: 0xFF00FF,
    clGray: 0x808080,
    clGreen: 0x008000,
    clLime: 0x00FF00,
    clOlive: 0x008080,
    clPurple: 0x800080,
    clRed: 0xFF0000,
    clSilver: 0xC0C0C0,
    clTeal: 0x808000,
    clWhite: 0xFFFFFF,
    clYellow: 0x00FFFF,
    clBtnShadow: 0x808080, // gray
    clBtnText: 0x000000, // black
    clBtnFace: 0x0000FF, // blue
}

export function getRValue(value: TColorRef) {
    return (value >> 16) & 255
}

export function getGValue(value: TColorRef) {
    return (value >> 8) & 255
}

export function getBValue(value: TColorRef) {
    return value & 255
}

export function IntToStr(value: int) {
    return "" + value
}

export function StrToFloat(value: string): float {
    return parseFloat(value)
}

export function StrToFloatRange(value: string, low: number, high: number) {
    let result = parseFloat(value)
    if (isNaN(result)) { return low }
    if (result < low) result = low
    if (result > high) result = high
    return result
}

export function FloatToStr(value: float) {
    return "" + value
}

export const ffFixed = true
export function FloatToStrF(value: float, fixed: boolean, p1: Number, fractionDigits: number) {
    return "" + value.toFixed(fractionDigits)
}

export function arrayRemove(theArray: Array<any>, item: any) {
    const index = theArray.indexOf(item)
    if (index !== -1) {
        theArray.splice(index, 1)
    }
}

export function arrayInsert(theArray: Array<any>, index: number, item: any) {
    theArray.splice(index, 0, item)
}

export function arraySwap(theArray: Array<any>, indexA: number, indexB: number) {
    const temp = theArray[indexA]
    theArray[indexA] = theArray[indexB]
    theArray[indexB] = temp
}

export function compareTextIgnoreCase(a: string, b: string): boolean {
    return a.toUpperCase() === b.toUpperCase()
}

export function isInTextIgnoreCase(a: string, b: string): boolean {
    return b.toUpperCase().includes(a.toUpperCase())
}

export function StrToIntDef(value: string, defaultValue: number) {
    const result = parseInt(value, 10)
    if (isNaN(result)) { return defaultValue }
    return result
}

export function StrToIntRange(value: string, low: number, high: number) {
    let result = parseInt(value, 10)
    if (isNaN(result)) { return low }
    if (result < low) result = low
    if (result > high) result = high
    return result
}

export function StrToIntRangeDef(value: string, low: number, high: number, theDefault: number) {
    let result = parseInt(value, 10)
    if (isNaN(result)) { return theDefault }
    if (result < low) result = low
    if (result > high) result = high
    return result
}

export function StrToInt(value: string) {
    // TODO: Maybe should handle NaN case here?
    return parseInt(value, 10)
}

export const mtConfirmation = 1
export const mbYesNoCancel = 2
export const mbYesNo = 3
export function MessageDialog(text: string, type: any, buttons: any, ignore3: any): any {
    if (type === mtConfirmation) {
        return confirm(text)
    }
    alert(text)
    return 0
}

export function ShowMessage(text: string) {
    alert(text)
}

export class TextFile {
    contents = ""
    position = 0
    // TODO: Maybe don't need fileName in TextFile?
    fileName = ""
}

export function write(file: TextFile, text: string) {
    file.contents = file.contents + text
    file.position = file.contents.length
}

export function writeln(file: TextFile, line: string = "") {
    // TODO: Maybe change writeln line ending depending on platform?
    file.contents = file.contents + line + "\n"
    file.position = file.contents.length
}

export function eof(file: TextFile) {
    return file.position >= file.contents.length
}

export function readln(file: TextFile) {
    // TODO: Very inefficient readln
    let result = ""
    while (file.position < file.contents.length) {
        const nextCharacter = file.contents[file.position++]
        if (nextCharacter === "\r") {
            if (file.contents[file.position] === "\n") {
                file.position++
            }
            return result
        }
        if (nextCharacter === "\n") {
            return result
        }
        result += nextCharacter
    }
    return result
}

export function AssignFile(file: TextFile, fileName: string, fileContents: string = "") {
    file.fileName = fileName
    file.contents = fileContents
}

export function Rewrite(file: TextFile) {
    file.contents = ""
    file.position = 0
}

export function Reset(file: TextFile) {
    file.position = 0
}

export function CloseFile(file: TextFile) {
    // No Op
}

export function ExtractFileName(fileName: string) {
    const lastSlash = fileName.lastIndexOf("/")
    if (lastSlash !== -1) fileName = fileName.substring(lastSlash + 1)
    const lastDot = fileName.lastIndexOf(".")
    if (lastSlash !== -1) fileName = fileName.substring(0, lastDot)
    return fileName
}

export function ExtractFilePath(fileName: string) {
    const lastSlash = fileName.lastIndexOf("/")
    if (lastSlash !== -1) return fileName.substring(0, lastSlash + 1)
    return ""
}

export function ord(character: string) {
    return character.charCodeAt(0)
}

export function odd(value: number) {
    return (value % 2) == 1
}

const dataPath = "data/"
export class TFileStream {
    contents: Uint8Array = new Uint8Array(new Array())
    contentsLengthUsed = 0
    loaded: Promise<void> | null = null
    position = 0
    // TODO: Maybe don't need fileName in TFileStream?
    fileName = ""
    fileMode = 0

    static fmCreate = 1
    static fmOpenWrite = 2
    static fmOpenRead = 4
    static fmShareExclusive = 8

    static soFromBeginning = 1
    static soFromCurrent = 2
    static soFromEnd = 3

    constructor(fileName: string, fileMode: number) {
        this.fileName = fileName
        this.fileMode = fileMode
        if (fileMode === TFileStream.fmOpenRead) {
            this.loadFile(fileName)
        } else {
            // TODO: Sloppy coding to have big array to avoid resizing
            this.contents = new Uint8Array(new Array(1000000))
        }
    }

    async loadFile(fileName: string) {
        this.loaded = new Promise<void>(async (resolve, reject) => {
            const response = await fetch(dataPath + fileName)
            if (response.ok) {
                this.contents = new Uint8Array(await response.arrayBuffer())
                this.contentsLengthUsed = this.contents.length
                resolve()
            } else {
                reject(new Error("Problem reading file: " + fileName + " : : " + response.statusText))
            }
        }).catch(e => {
            alert("error loading file: " + fileName + " :: " + e)
            console.log("error loading: " + fileName, e)
            // toast("Something went wrong loading " + fileName + " from the server")
            // m.redraw()
        })
    }

    WriteBuffer(buffer: number | number[], length: number) {
        if (Array.isArray(buffer)) {
            for (let i = 0; i < Math.min(buffer.length, length); i++) {
                if (this.position >= this.contents.length) {
                    throw new Error("Writing past end of file: " + this.position + " >= " + this.contents.length)
                }
                this.contents[this.position++] = buffer[i] & 255
                this.contentsLengthUsed = Math.max(this.contentsLengthUsed, this.position)
            } 
        } else {
            if (this.position >= this.contents.length) {
                throw new Error("Writing past end of file: " + this.position + " >= " + this.contents.length)
            }
            this.contents[this.position++] = buffer & 255
            this.contentsLengthUsed =  Math.max(this.contentsLengthUsed, this.position)
        }
    }

    ReadBytes(length: number) {
        const result = []
        for (let i = 0; i < length; i++) {
            if (this.position >= this.contentsLengthUsed) {
                throw new Error("Reading past end of file: " + this.position + " >= " + this.contentsLengthUsed)
            }
            result.push(this.contents[this.position++])
        }
        return result;
    }

    get Position() {
        return this.position
    }

    get Size() {
        return this.contents.length
    }

    Seek(offset: number, origin: number) {
        if (origin === TFileStream.soFromBeginning) {
            this.position = offset
        } else if (origin === TFileStream.soFromCurrent) {
            this.position = this.position + offset
        } else if (origin === TFileStream.soFromEnd) {
            this.position = this.contents.length + offset
        } else {
            throw new Error("Unexpected Seek origin: " + origin)
        }
    }
}

export class TMemoryStream extends TFileStream {
    constructor() {
        super("", 0)
    }
}

export function caption(text: string | (() => string)) {
    // TODO: What should this do with ampersand?
    if (typeof text === "function") {
        text = text()
    }
    return text.replace("&", "")
}

export enum MouseButton {
    mbLeft = 0,
    mbRight = 2
}

export function HelpJump(section: string, url?: string) {
    console.log("Opening help for section: ", section)
    if (!url) {
        if (!section) {
            section = "index.htm"
        } else {
            const maxLength = "Breeding_plants_using_the_breede".length
            section = section.substring(0, maxLength)
            section = section.replaceAll("-", "")
            section = "plantstudio" + section + ".html"
        }
        url = "https://www.kurtz-fernhout.com/PlantStudio/help/" + section
    }
    window.open(url, "_blank")
}
