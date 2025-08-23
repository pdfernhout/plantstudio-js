// unit Ubrstrat

from conversion_common import *
import usupport
import uclasses
import usstream
import ufiler
import delphi_compatability

// const
const kMutation = 0
const kWeight = 1
const kMaxBreedingSections = 30
const kFromFirstPlant = 0
const kFromSecondPlant = 1
const kFromProbabilityBasedOnWeightsForSection = 2
const kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant = 3
const kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant = 4
const kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly = 5



export class PdBreedingStrategy {
    mutationStrengths: short[] /* kMaxBreedingSections + 1 */ = Array(kMaxBreedingSections + 1)
    firstPlantWeights: short[] /* kMaxBreedingSections + 1 */ = Array(kMaxBreedingSections + 1)
    getNonNumericalParametersFrom: short = 0
    mutateAndBlendColorValues: boolean = false
    chooseTdosRandomlyFromCurrentLibrary: boolean = false
    PdBreedingStrategy.prototype = new PdStreamableObject()
    PdBreedingStrategy.prototype.constructor = PdBreedingStrategy
    
    create(): void {
        let i: short
        
        for (i = 0; i <= kMaxBreedingSections - 1; i++) {
            // defaults 
            // mutationStrengths default to zero 
            this.firstPlantWeights[i] = 50
        }
        this.getNonNumericalParametersFrom = kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        this.mutateAndBlendColorValues = true
        this.chooseTdosRandomlyFromCurrentLibrary = true
    }
    
    readFromFile(aFileName: string): void {
        let inputFile: TextFile
        let inputLine: string
        let lineType: string
        let stream: KfStringStream
        let i: short
        
        AssignFile(inputFile, aFileName)
        stream = null
        try {
            Reset(inputFile)
            stream = usstream.KfStringStream.create
            UNRESOLVED.readln(inputFile, inputLine)
            if (UNRESOLVED.pos("STRATEGY", uppercase(inputLine)) <= 0) {
                throw new GeneralException.create("Improper format for breeding strategy file")
            }
            while (!UNRESOLVED.eof(inputFile)) {
                UNRESOLVED.readln(inputFile, inputLine)
                stream.onStringSeparator(inputLine, "=")
                lineType = stream.nextToken()
                stream.spaceSeparator()
                if (UNRESOLVED.pos("NUMERIC", uppercase(lineType)) > 0) {
                    this.getNonNumericalParametersFrom = StrToIntDef(stream.nextToken(), kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly)
                } else if (UNRESOLVED.pos("MUTATION", uppercase(lineType)) > 0) {
                    for (i = 0; i <= kMaxBreedingSections - 1; i++) {
                        this.mutationStrengths[i] = StrToIntDef(stream.nextToken(), 0)
                    }
                } else if (UNRESOLVED.pos("WEIGHT", uppercase(lineType)) > 0) {
                    for (i = 0; i <= kMaxBreedingSections - 1; i++) {
                        this.firstPlantWeights[i] = StrToIntDef(stream.nextToken(), 50)
                    }
                } else if (UNRESOLVED.pos("COLORS", uppercase(lineType)) > 0) {
                    this.mutateAndBlendColorValues = usupport.strToBool(stream.nextToken())
                } else if (UNRESOLVED.pos("3D OBJECTS", uppercase(lineType)) > 0) {
                    this.chooseTdosRandomlyFromCurrentLibrary = usupport.strToBool(stream.nextToken())
                } else {
                    break
                }
            }
        } finally {
            stream.free
            CloseFile(inputFile)
        }
    }
    
    writeToFile(aFileName: string): void {
        let outputFile: TextFile
        let i: short
        
        AssignFile(outputFile, aFileName)
        try {
            Rewrite(outputFile)
            writeln(outputFile, "[Breeding strategy]")
            write(outputFile, "Mutations=")
            for (i = 0; i <= kMaxBreedingSections - 1; i++) {
                write(outputFile, IntToStr(this.mutationStrengths[i]) + " ")
            }
            writeln(outputFile)
            write(outputFile, "Weights=")
            for (i = 0; i <= kMaxBreedingSections - 1; i++) {
                write(outputFile, IntToStr(this.firstPlantWeights[i]) + " ")
            }
            writeln(outputFile)
            writeln(outputFile, "Non-numeric=" + IntToStr(this.getNonNumericalParametersFrom))
            writeln(outputFile, "Vary colors=" + usupport.boolToStr(this.mutateAndBlendColorValues))
            writeln(outputFile, "Vary 3D objects=" + usupport.boolToStr(this.chooseTdosRandomlyFromCurrentLibrary))
        } finally {
            CloseFile(outputFile)
        }
    }
    
    // ------------------------------------------------------------------------- data transfer for binary copy 
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = uclasses.kPdBreedingStrategy
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        let i: short
        
        PdStreamableObject.prototype.streamDataWithFiler.call(this, filer, cvir)
        this.getNonNumericalParametersFrom = filer.streamSmallint(this.getNonNumericalParametersFrom)
        this.mutateAndBlendColorValues = filer.streamBoolean(this.mutateAndBlendColorValues)
        this.chooseTdosRandomlyFromCurrentLibrary = filer.streamBoolean(this.chooseTdosRandomlyFromCurrentLibrary)
        for (i = 0; i <= kMaxBreedingSections - 1; i++) {
            this.mutationStrengths[i] = filer.streamSmallint(this.mutationStrengths[i])
        }
        for (i = 0; i <= kMaxBreedingSections - 1; i++) {
            this.firstPlantWeights[i] = filer.streamSmallint(this.firstPlantWeights[i])
        }
    }
    
}

