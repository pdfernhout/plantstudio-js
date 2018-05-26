export type float = number
export type long = number
export type int = number
export type short = number
export type byte = number
export type TColor = number

export function intround(x: number) {
    return Math.round(x)
}

export const ColorDefs = {
    clBlack: 0x000000,
    clBlue: 0x0000FF,
    clGray: 0x808080,
    clRed: 0xFF0000,
    clSilver: 0xC0C0C0
}

export function IntToStr(value: int) {
    return "" + value
}

export function StrToFloat(value: string) {
    return parseFloat(value)
}
