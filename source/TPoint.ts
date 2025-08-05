export class TPoint {
    X: number
    Y: number

    constructor(x = 0, y = 0) {
        this.X = Math.round(x)
        this.Y = Math.round(y)
    }

    copy(): TPoint {
        return new TPoint(this.X, this.Y)
    }

    scale(scale: number): TPoint {
        return new TPoint(this.X * scale, this.Y * scale)
    }
}
