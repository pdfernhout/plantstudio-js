// PdPlantDrawingAmendment was unit uamendmt

import { long, float, TColorRef, short, IntToStr, intround, StrToIntDef, TextFile, StrToInt, writeln, TMemo, compareTextIgnoreCase, eof, readln } from "./common"
import { PdStreamableObject, PdClassAndVersionInformationRecord, PdFiler } from "./temporary"
import { ClassId } from "./uclasses"
import { support_rgb, strToBool, boolToStr, stringBeyond, stringUpTo } from "./usupport"

// const
export const kStartAmendmentString = "start posing change"
export const kEndAmendmentString = "end posing change"

export class PdPlantDrawingAmendment extends PdStreamableObject {
    partID: long = 0
    typeOfPart: string = ""
    hide: boolean = false
    changeColors: boolean = false
    propagateColors: boolean = false
    faceColor: TColorRef = support_rgb(50, 200, 50)
    backfaceColor: TColorRef = support_rgb(20, 150, 20)
    lineColor: TColorRef = support_rgb(40, 100, 40)
    addRotations: boolean = false
    xRotation: float = 0.0
    yRotation: float = 0.0
    zRotation: float = 0.0
    multiplyScale: boolean = false
    propagateScale: boolean = false
    scaleMultiplier_pct: short = 0
    lengthMultiplier_pct: short = 0
    widthMultiplier_pct: short = 0
    applyAtAge: short = 0

    readFromTextFile(inputFile: TextFile): void {
        let inputLine: string = ""
        
        while (!eof(inputFile)) {
            // plant reads start line; just continue from there
            const inputLine = readln(inputFile)
            if (inputLine.trim() === "") {
                continue
            }
            const varName = stringUpTo(inputLine, "=")
            const varValue = stringBeyond(inputLine, "=")
            if (!this.setField(varName, varValue)) {
                break
            }
        }
        if (!compareTextIgnoreCase(kEndAmendmentString, inputLine)) {
            throw new Error("Problem: Expected end of posing change.")
        }
    }
    
    readFromMemo(aMemo: TMemo, readingMemoLine: long): number {
        let inputLine: string = ""
        while (readingMemoLine < aMemo.length) {
            // plant reads start line; just continue from there
            inputLine = aMemo[readingMemoLine]
            if (inputLine.trim() === "") {
                continue
            }
            const varName = stringUpTo(inputLine, "=")
            const varValue = stringBeyond(inputLine, "=")
            if (!this.setField(varName, varValue)) {
                break
            }
            readingMemoLine += 1
        }
        if (!compareTextIgnoreCase(kEndAmendmentString, inputLine)) {
            throw new Error("Problem: Expected end of posing change.")
        }
        return readingMemoLine
    }
    
    setField(varName: string, varValue: string): boolean {
        let result = false
        result = true
        if (varName.includes("part number")) {
            // how deal with problem?
            this.partID = StrToIntDef(varValue, 0)
        } else if (varName.includes("part type")) {
            this.typeOfPart = varValue
        } else if (varName.includes("hide")) {
            this.hide = strToBool(varValue)
        } else if (varName.includes("change colors")) {
            // read these for possible backward compatibility later, but don't do anything with them
            // self.changeColors := strToBool(varValue)
            result = true
        } else if (varName.includes("propagate colors up stem")) {
            // self.propagateColors := strToBool(varValue)
            result = true
        } else if (varName.includes("front face color")) {
            // self.faceColor := strToIntDef(varValue, 0)
            result = true
        } else if (varName.includes("back face color")) {
            // self.backfaceColor := strToIntDef(varValue, 0)
            result = true
        } else if (varName.includes("line color")) {
            // self.lineColor := strToIntDef(varValue, 0)
            result = true
        } else if (varName.includes("rotate")) {
            this.addRotations = strToBool(varValue)
        } else if (varName.includes("x rotation")) {
            this.xRotation = StrToInt(varValue) * 1.0
        } else if (varName.includes("y rotation")) {
            this.yRotation = StrToInt(varValue) * 1.0
        } else if (varName.includes("z rotation")) {
            this.zRotation = StrToInt(varValue) * 1.0
        } else if (varName.includes("change scale")) {
            this.multiplyScale = strToBool(varValue)
        } else if (varName.includes("propagate scale change up stem")) {
            this.propagateScale = strToBool(varValue)
        } else if (varName.includes("3d object scale multiplier")) {
            this.scaleMultiplier_pct = StrToIntDef(varValue, 100)
        } else if (varName.includes("line length multiplier")) {
            this.lengthMultiplier_pct = StrToIntDef(varValue, 100)
        } else if (varName.includes("line width multiplier")) {
            this.widthMultiplier_pct = StrToIntDef(varValue, 100)
        } else if (varName.includes("apply at age")) {
            // read these for possible backward compatibility later, but don't do anything with them
            // self.applyAtAge := strToIntDef(varValue, 0)
            result = true
        } else {
            result = false
        }
        return result
    }
    
    writeToTextFile(outputFile: TextFile): void {
        writeln(outputFile, kStartAmendmentString)
        writeln(outputFile, "  part number =" + IntToStr(this.partID))
        writeln(outputFile, "  part type =" + this.typeOfPart)
        writeln(outputFile, "  hide =" + boolToStr(this.hide))
        //
        //  writeln(outputFile, '  change colors =' + boolToStr(changeColors));
        //  writeln(outputFile, '  propagate colors up stem =' + boolToStr(propagateColors));
        //  writeln(outputFile, '  front face color =' + intToStr(faceColor));
        //  writeln(outputFile, '  back face color =' + intToStr(backfaceColor));
        //  writeln(outputFile, '  line color =' + intToStr(lineColor));
        //  
        writeln(outputFile, "  rotate =" + boolToStr(this.addRotations))
        writeln(outputFile, "  x rotation =" + IntToStr(intround(this.xRotation)))
        writeln(outputFile, "  y rotation =" + IntToStr(intround(this.yRotation)))
        writeln(outputFile, "  z rotation =" + IntToStr(intround(this.zRotation)))
        writeln(outputFile, "  change scale =" + boolToStr(this.multiplyScale))
        writeln(outputFile, "  propagate scale change up stem =" + boolToStr(this.propagateScale))
        writeln(outputFile, "  3d object scale multiplier =" + IntToStr(this.scaleMultiplier_pct))
        writeln(outputFile, "  line length multiplier =" + IntToStr(this.lengthMultiplier_pct))
        writeln(outputFile, "  line width multiplier =" + IntToStr(this.widthMultiplier_pct))
        //
        //  writeln(outputFile, '  apply at age =' + intToStr(applyAtAge));
        //  
        writeln(outputFile, kEndAmendmentString)
    }
    
    writeToMemo(aMemo: TMemo): void {
        aMemo.push(kStartAmendmentString)
        aMemo.push("  part number =" + IntToStr(this.partID))
        aMemo.push("  part type =" + this.typeOfPart)
        aMemo.push("  hide =" + boolToStr(this.hide))
        //
        //  aMemo.push('  change colors =' + boolToStr(changeColors));
        //  aMemo.push('  propagate colors up stem =' + boolToStr(propagateColors));
        //  aMemo.push('  front face color =' + intToStr(faceColor));
        //  aMemo.push('  back face color =' + intToStr(backfaceColor));
        //  aMemo.push('  line color =' + intToStr(lineColor));
        //  
        aMemo.push("  rotate =" + boolToStr(this.addRotations))
        aMemo.push("  x rotation =" + IntToStr(intround(this.xRotation)))
        aMemo.push("  y rotation =" + IntToStr(intround(this.yRotation)))
        aMemo.push("  z rotation =" + IntToStr(intround(this.zRotation)))
        aMemo.push("  change scale =" + boolToStr(this.multiplyScale))
        aMemo.push("  propagate scale change up stem =" + boolToStr(this.propagateScale))
        aMemo.push("  3d object scale multiplier =" + IntToStr(this.scaleMultiplier_pct))
        aMemo.push("  line length multiplier =" + IntToStr(this.lengthMultiplier_pct))
        aMemo.push("  line width multiplier =" + IntToStr(this.widthMultiplier_pct))
        //
        //  aMemo.push('  apply at age =' + intToStr(applyAtAge));
        //  
        aMemo.push(kEndAmendmentString)
    }
   
    getFullName(): string {
        let result = ""
        result = IntToStr(this.partID) + " (" + this.typeOfPart + ")"
        if (this.hide) {
            result = result + ", hidden"
        }
        if (this.changeColors) {
            result = result + ", colored"
        }
        if (this.addRotations) {
            result = result + ", rotated"
        }
        if (this.multiplyScale) {
            result = result + ", scaled"
        }
        if (this.applyAtAge !== 0) {
            result = result + " at age " + IntToStr(this.applyAtAge)
        }
        return result
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        this.partID = filer.streamLongint(this.partID)
        this.typeOfPart = filer.streamShortString(this.typeOfPart)
        this.hide = filer.streamBoolean(this.hide)
        this.changeColors = filer.streamBoolean(this.changeColors)
        this.propagateColors = filer.streamBoolean(this.propagateColors)
        filer.streamColorRef(this.faceColor)
        filer.streamColorRef(this.backfaceColor)
        filer.streamColorRef(this.lineColor)
        this.addRotations = filer.streamBoolean(this.addRotations)
        this.xRotation = filer.streamSingle(this.xRotation)
        this.yRotation = filer.streamSingle(this.yRotation)
        this.zRotation = filer.streamSingle(this.zRotation)
        this.multiplyScale = filer.streamBoolean(this.multiplyScale)
        this.propagateScale = filer.streamBoolean(this.propagateScale)
        this.scaleMultiplier_pct = filer.streamSmallint(this.scaleMultiplier_pct)
        this.lengthMultiplier_pct = filer.streamSmallint(this.lengthMultiplier_pct)
        this.widthMultiplier_pct = filer.streamSmallint(this.widthMultiplier_pct)
        this.applyAtAge = filer.streamSmallint(this.applyAtAge)
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kPdPlantDrawingAmendment
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
}

