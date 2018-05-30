export type float = number
export type double = number
export type long = number
export type int = number
export type short = number
export type byte = number
export type TColor = number
export type TColorRef = number
export type TMemo = string[]

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
    clYellow: 0x00FFFF,
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

export function StrToFloat(value: string) {
    return parseFloat(value)
}

export function FloatToStr(value: float) {
    return "" + value
}

export function arrayRemove(theArray: Array<any>, item: any) {
    const index = theArray.indexOf(item)
    if (index !== -1) {
        theArray.splice(index, 1)
    }
}

export function compareTextIgnoreCase(a: string, b: string): boolean {
    return a.toUpperCase() === b.toUpperCase()
}

export function StrToIntDef(value: string, defaultValue: number) {
    const result = parseInt(value, 10)
    if (isNaN(result)) { return defaultValue }
    return result
}

export function StrToInt(value: string) {
    // TODO: Maybe should handle NaN case here?
    return parseInt(value, 10)
}

export function MessageDialog(text: string, ignore1: any, ignore2: any, ignore3: any) {
    alert(text)
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
