export type float = number
export type double = number
export type long = number
export type int = number
export type short = number
export type byte = number
export type TColor = number
export type TColorRef = number

export function intround(x: number) {
    return Math.round(x)
}

export const ColorDefs = {
    clBlack: 0x000000,
    clBlue: 0x0000FF,
    clGray: 0x808080,
    clGreen: 0x00FF00,
    clRed: 0xFF0000,
    clSilver: 0xC0C0C0
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

export function MessageDialog(text: string, ignore1: any, ignore2: any, ignore3: any) {
    alert(text)
}

export function ShowMessage(text: string) {
    alert(text)
}

export class TextFile {
    lines: string[] = []
}
