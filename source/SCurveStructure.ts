// SCurveStructure was in umath

import { digitValueString, boundForString } from "./usupport"
import { FieldType } from "./PdParameter"
import { int, double, float, FloatToStr } from "./common"
import { safeLn, safediv, safedivWithResult, safeLnWithResult, ErrorMessage, safeExp, safeExpWithResult } from "./umath"
import { KfStringStream } from "./KfStringStream"

// const
// these consts are really defined in uplant.pas but we don't want to include it - keep current
const kGetField = 0
const kSetField = 1

// record
export class SCurveStructure {
    x1: float
    y1: float
    x2: float
    y2: float
    c1: float
    c2: float
}

// s curves 
// RE-RAISES EXCEPTION 
// this function carries out a structure found in many EPIC equations. 
export function scurve(x: double, c1: double, c2: double): double {
    let result = 0.0
    let temp: double
    
    try {
        temp = c1 - c2 * x
        if (temp > 85.0) {
            temp = 85.0
            throw new Error("Problem: Exponent of number would have gone out of float range.")
        }
        result = safediv(x, x + safeExp(temp))
    } catch (e) {
        result = ErrorMessage("Problem in s curve: numbers are " + FloatToStr(x) + ", " + FloatToStr(c1) + ", and " + FloatToStr(c2))
        throw new Error("Exception in umath")
    }
    return result
}

// same as scurve but does not show an errorMessage or re-raise the exception; just returns whether it failed;
//  used inside paint methods where you don't want error dialogs popping up 
export function scurveWithResult(x: double, c1: double, c2: double): [double, boolean] {
    let failed = true
    let result = 0.0
    let temp = 0.0
    try {
        temp = c1 - c2 * x
        if (temp > 85.0) {
            return [result, failed]
        }
        [temp, failed] = safeExpWithResult(temp)
        if (failed) {
            return [result, failed]
        }
        [temp, failed] = safedivWithResult(x, x + temp)
        if (failed) {
            return [result, failed]
        }
    } catch (e) {
        return [result, failed]
    }
    failed = false
    result = temp
    return [result, failed]
}

// s curve params 
// RE-RAISES EXCEPTION 
// deal with zero s curve values by defaulting whole curve to hard-coded values
export function calcSCurveCoeffs(sCurve: SCurveStructure): void {
    let xx: double
    
    try {
        if ((sCurve.x1 <= 0.0) || (sCurve.y1 <= 0.0) || (sCurve.x2 <= 0.0) || (sCurve.y2 <= 0.0) || (sCurve.x1 >= 1.0) || (sCurve.y1 >= 1.0) || (sCurve.x2 >= 1.0) || (sCurve.y2 >= 1.0)) {
            // instead of raising exception, just hard-code whole curve to acceptable values
            // don't use Parameters.tab default in case that was read in wrong also
            sCurve.x1 = 0.25
            sCurve.y1 = 0.1
            sCurve.x2 = 0.65
            sCurve.y2 = 0.85
        }
        xx = safeLn(safediv(sCurve.x1, sCurve.y1) - sCurve.x1)
        sCurve.c2 = safediv((xx - safeLn(safediv(sCurve.x2, sCurve.y2) - sCurve.x2)), sCurve.x2 - sCurve.x1)
        sCurve.c1 = xx + sCurve.x1 * sCurve.c2
    } catch (e) {
        // set s curve to all acceptable values - safest 
        sCurve.x1 = 0.25
        sCurve.y1 = 0.1
        sCurve.x2 = 0.65
        sCurve.y2 = 0.85
        throw new Error("Exception in umath")
    }
}

// same as Utils_CalcSCurveCoeffs but does not show an errorMessage or re-raise the exception;
//  just returns whether it failed; used inside paint methods where you don't want error dialogs popping up 
export function calcSCurveCoeffsWithResult(sCurve: SCurveStructure): boolean {
    let quotientX1Y1: double
    let lnQuotientX1Y1MinusX1: double
    let quotientX2Y2: double
    let lnQuotientX2Y2MinusX2: double
    let c1temp: double
    let c2temp: double
    
    let failed = true
    try {
        [quotientX1Y1, failed] = safedivWithResult(sCurve.x1, sCurve.y1)
        if (failed) {
            return failed
        }
        [lnQuotientX1Y1MinusX1, failed] = safeLnWithResult(quotientX1Y1 - sCurve.x1)
        if (failed) {
            return failed
        }
        [quotientX2Y2, failed] = safedivWithResult(sCurve.x2, sCurve.y2)
        if (failed) {
            return failed
        }
        [lnQuotientX2Y2MinusX2, failed] = safeLnWithResult(quotientX2Y2 - sCurve.x2)
        if (failed) {
            return failed
        }
        [c2temp, failed] = safedivWithResult(lnQuotientX1Y1MinusX1 - lnQuotientX2Y2MinusX2, sCurve.x2 - sCurve.x1)
        if (failed) {
            return failed
        }
        c1temp = lnQuotientX1Y1MinusX1 + sCurve.x1 * c2temp
    } catch (e) {
        return failed
    }
    sCurve.c1 = c1temp
    sCurve.c2 = c2temp
    failed = false
    return failed
}

export function transferSCurveValue(direction: int, param: SCurveStructure, index: int, value: number): number {
    if (direction === kGetField) {
        switch (index) {
            case 0:
                value = param.x1
                break
            case 1:
                value = param.y1
                break
            case 2:
                value = param.x2
                break
            case 3:
                value = param.y2
                break
        }
    } else {
        switch (index) {
            case 0:
                // direction == kSetField 
                param.x1 = value
                break
            case 1:
                param.y1 = value
                break
            case 2:
                param.x2 = value
                break
            case 3:
                param.y2 = value
                break
        }
    }
    return value
}

export function stringToSCurve(aString: string): SCurveStructure {
    let result = new SCurveStructure()
    
    result.x1 = 0
    result.y1 = 0
    result.x2 = 0
    result.y2 = 0
    result.c1 = 0
    result.c2 = 0
    // format is x1 y1 x2 y2 
    const stream = new KfStringStream(aString, " ")
    let success
    ;[result.x1, success] = boundForString(stream.nextToken(), FieldType.kFieldFloat)
    ;[result.y1, success] = boundForString(stream.nextToken(), FieldType.kFieldFloat)
    ;[result.x2, success] = boundForString(stream.nextToken(), FieldType.kFieldFloat)
    ;[result.y2, success] = boundForString(stream.nextToken(), FieldType.kFieldFloat)

    return result
}

export function sCurveToString(sCurve: SCurveStructure): string {
    let result = ""
    result = digitValueString(sCurve.x1) + " " + digitValueString(sCurve.y1) + " " + digitValueString(sCurve.x2) + " " + digitValueString(sCurve.y2)
    return result
}
