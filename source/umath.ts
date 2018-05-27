// unit umath

import { float, int, double, FloatToStr } from "./common";
import { ifError } from "assert";
import { TPoint } from "./TPoint";
import { KfStringStream } from "./KfStringStream";
import { DebugPrint, digitValueString, boundForString, kFieldFloat } from "./temporary";

/* TODO: Remove unnedded imports
from conversion_common import *
import uparams
import usstream
import udebug
import uunits
import usupport
import delphi_compatability
*/

// record
export class SCurveStructure {
    x1: float
    y1: float
    x2: float
    y2: float
    c1: float
    c2: float
}

// const
const kPi = 3.141596
const kLowestFloatAboveZero = 10e-12
const kLowestQuantityFloat = 10e-6


// const
const kGetField = 0
const kSetField = 1


// returns zero for convenience
// these consts are really defined in uplant.pas but we don't want to include it - keep current
// error message - returns zero for convenience
function ErrorMessage(errorString: string): float {
    let result = 0.0
    result = 0.0
    DebugPrint(errorString)
    return result
}

// ---------------------------------------------------------------------------------------------- math functions 
function sqr(x: float): float {
    let result = 0.0
    result = x * x
    return result
}

// TODO: optimize min and max to use existing Math functions

export function min(a: float, b: float): float {
    let result = 0.0
    if (a < b) {
        result = a
    } else {
        result = b
    }
    return result
}

export function max(a: float, b: float): float {
    let result = 0.0
    if (a > b) {
        result = a
    } else {
        result = b
    }
    return result
}

export function intMin(a: int, b: int): int {
    let result = 0
    if (a < b) {
        result = a
    } else {
        result = b
    }
    return result
}

export function intMax(a: int, b: int): int {
    let result = 0
    if (a > b) {
        result = a
    } else {
        result = b
    }
    return result
}

// RE-RAISES EXCEPTION 
function pow(number: double, exponent: double): double {
    let result = 0.0
    try {
        result = safeExp(exponent * safeLn(number))
    } catch (e) {
        ErrorMessage("Invalid number for power function: " + FloatToStr(number) + " to the power " + FloatToStr(exponent))
        result = 1.0
        throw new Error("Exception in umath")
    }
    return result
}

// this function is needed to get around a bug in the development environment: if a negative
// number is raised to a non-integer power, an exception should be raised but the environment
// instead crashes. 
// RE-RAISES EXCEPTION 
export function power(number: double, exponent: double): double {
    let result = 0.0
    try {
        if ((number > 0.0)) {
            result = pow(number, exponent)
        } else if ((number === 0.0)) {
            if (exponent === 0.0) {
                result = 1.0
                throw new Error("Problem: Zero raised to zero power.")
            } else {
                result = 0.0
            }
        } else {
            result = 0.0
            throw new Error("Problem: Negative number to non-integer power: " + FloatToStr(number) + " to " + FloatToStr(exponent))
        }
    } catch (e) {
        result = ErrorMessage("Problem: Uncaught error in power function: " + FloatToStr(number) + " to " + FloatToStr(exponent))
        throw new Error("Exception in umath")
    }
    return result
}

// RE-RAISES EXCEPTION 
function tan(x: double): double {
    let result = 0.0
    try {
        result = Math.sin(x) / Math.cos(x)
    } catch (e) {
        result = ErrorMessage("Uncaught error in tangent function: " + FloatToStr(x))
        throw new Error("Exception in umath")
    }
    return result
}

// RE-RAISES EXCEPTION 
function arcCos(x: double): double {
    let result = 0.0
    try {
        // this was in the Delphi help but doesn't seem to work 
        // result := arcTan(sqrt(1.0 - sqr(x)) / x); 
        // from Smalltalk/V 
        result = kPi / 2.0 - arcSin(x)
    } catch (e) {
        result = ErrorMessage("Invalid number for arcCos: " + FloatToStr(x))
        throw new Error("Exception in umath")
    }
    return result
}

// RE-RAISES EXCEPTION 
function arcSin(x: double): double {
    let result = 0.0
    try {
        result = Math.atan(x / Math.sqrt(1.0 - sqr(x)))
    } catch (e) {
        result = ErrorMessage("Invalid number for arcSin: " + FloatToStr(x))
        throw new Error("Exception in umath")
    }
    return result
}

// const
const oneOverNaturalLogOfTen = 0.434294481


// RE-RAISES EXCEPTION 
// uses notion that logN(x) = ln(x) / ln(N) 
function log10(x: double): double {
    let result = 0.0
    try {
        if (x > 0.0) {
            result = oneOverNaturalLogOfTen * safeLn(x)
        } else {
            result = -1
            throw new Error("Problem: Tried to take log (base 10) of zero or negative number.")
        }
    } catch (e) {
        result = ErrorMessage("Problem: Invalid number for log (base 10): " + FloatToStr(x) + ".")
        throw new Error("Exception in umath")
    }
    return result
}

// RE-RAISES EXCEPTION 
function safeLn(x: double): double {
    let result = 0.0
    if (x > 0.0) {
        try {
            result = Math.log(x)
        } catch (e) {
            ErrorMessage("Invalid number for natural log: " + FloatToStr(x))
            result = 1.0
            throw new Error("Exception in umath")
        }
    } else {
        throw new Error("Problem: Tried to take ln of zero or negative number: " + FloatToStr(x) + ".")
    }
    return result
}

// same as safeLn but does not show an errorMessage or re-raise the exception; just returns whether it failed;
//  used inside paint methods where you don't want error dialogs popping up 
function safeLnWithResult(x: double): [double, boolean] {
    // Second item in array (boolean) is whether it failed
    if (x <= 0.0) {
        return [0.0, true]
    }
    let temp = 0.0
    try {
        temp = Math.log(x)
    } catch (e) {
        return [1.0, true]
    }
    return [temp, false]
}

// RE-RAISES EXCEPTION 
function safeExp(x: double): double {
    let result = 0.0
    try {
        result = Math.exp(x)
    } catch (e) {
        result = ErrorMessage("Invalid number for exponential function: " + FloatToStr(x))
        throw new Error("Exception in umath")
    }
    return result
}

// same as safeExp but does not show an errorMessage or re-raise the exception; just returns whether it failed;
//  used inside paint methods where you don't want error dialogs popping up 
function safeExpWithResult(x: double): [double, boolean] {
    let temp = 0.0
    try {
        temp = Math.exp(x)
    } catch (e) {
        return [0.0, true]
    }
    return [temp, false]
}

// this function catches a divide by zero before it produces a not-a-number.
// this can happen because of an underflow, an error in the code, or an unexpected condition.
// this is a different approach than EPIC's which is basically to divide by the number plus a tiny float
// for all cases (like 1e-20 or 1e-10)
// RE-RAISES EXCEPTION 
function safediv(x: float, y: float): float {
    let result = 0.0
    try {
        if ((y !== 0.0)) {
            result = x / y
        } else {
            result = 0.0
            throw new Error("Problem: Divide by zero.")
        }
    } catch (e) {
        result = ErrorMessage("Problem: Unspecified problem with dividing " + FloatToStr(x) + " by " + FloatToStr(y) + ".")
        throw new Error("Exception in umath")
    }
    return result
}

// RE-RAISES EXCEPTION 
// same as safediv except that the user specifies what to return if the denominator is zero 
export function safedivExcept(x: float, y: float, exceptionResult: float): float {
    let result = 0.0
    try {
        if ((y !== 0.0)) {
            result = x / y
        } else {
            result = exceptionResult
        }
    } catch (e) {
        result = ErrorMessage("Problem in dividing " + FloatToStr(x) + " by " + FloatToStr(y))
        throw new Error("Exception in umath")
    }
    return result
}

// same as safediv but does not show an errorMessage or re-raise the exception; just returns whether it failed;
//  used inside paint methods where you don't want error dialogs popping up 
function safedivWithResult(x: float, y: float): [float, boolean] {
    let temp = 0.0
    if (y === 0.0) {
        return [0.0, true]
    }
    try {
        temp = x / y
    } catch (e) {
        return [0.0, true]
    }
    return [temp, false]
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
    if ((direction === kGetField)) {
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
    ;[result.x1, success] = boundForString(stream.nextToken(), kFieldFloat)
    ;[result.y1, success] = boundForString(stream.nextToken(), kFieldFloat)
    ;[result.x2, success] = boundForString(stream.nextToken(), kFieldFloat)
    ;[result.y2, success] = boundForString(stream.nextToken(), kFieldFloat)

    return result
}

export function sCurveToString(sCurve: SCurveStructure): string {
    let result = ""
    result = digitValueString(sCurve.x1) + " " + digitValueString(sCurve.y1) + " " + digitValueString(sCurve.x2) + " " + digitValueString(sCurve.y2)
    return result
}

// const
const kPlantProximityNeeded = 4


// graphics 
// CFK NOTE you may want to change this if you use this function
//  to actually click on plant parts 
// this is not being used to select plant parts, the drawing surface is doing it
export function pointsAreCloseEnough(point1: TPoint, point2: TPoint): boolean {
    let result = false
    result = (Math.abs(point1.X - point2.X) < kPlantProximityNeeded) && (Math.abs(point1.Y - point2.Y) < kPlantProximityNeeded)
    return result
}
