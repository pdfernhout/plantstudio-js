// unit Uclasses

import { PdClassAndVersionInformationRecord, PdStreamableObject } from "./temporary";

// const
export const kTNil = 14501
export const kPdStreamableObject = 14502
export const kPdPlant = 14503
export const kPdPlantPart = 14505
export const kPdInternode = 14506
export const kPdLeaf = 14507
export const kPdMeristem = 14508
export const kPdInflorescence = 14509
export const kPdFlowerFruit = 14510
export const kKfObject3D = 14511
export const kKfIndexTriangle = 14512
export const KPdRandom = 14513
export const kPdBreedingStrategy = 14514
export const kPdPlantDrawingAmendment = 14515

// kPdDayPlant = 14504;
function CreateStreamableObjectFromClassAndVersionInformation(cvir: PdClassAndVersionInformationRecord): PdStreamableObject | null {
    switch (cvir.classNumber) {
        case kTNil:
            return null
        case kPdStreamableObject:
            throw new Error("Problem: Should not stream PdStreamableObject abstract class " + cvir.classNumber)
        default:
            throw new Error("Problem: Unknown class " + cvir.classNumber)
    }
    // TODO: This function seems incomplete if actually had a real object -- return new PdStreamableObject()
}


