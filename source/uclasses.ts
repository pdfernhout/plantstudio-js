// unit Uclasses

import { PdClassAndVersionInformationRecord, PdStreamableObject } from "./temporary";

// const
export enum ClassId {
    kTNil = 14501,
    kPdStreamableObject = 14502,
    kPdPlant = 14503,
    kPdPlantPart = 14505,
    kPdInternode = 14506,
    kPdLeaf = 14507,
    kPdMeristem = 14508,
    kPdInflorescence = 14509,
    kPdFlowerFruit = 14510,
    kKfObject3D = 14511,
    kKfIndexTriangle = 14512,
    KPdRandom = 14513,
    kPdBreedingStrategy = 14514,
    kPdPlantDrawingAmendment = 14515,
}

// kPdDayPlant = 14504;
function CreateStreamableObjectFromClassAndVersionInformation(cvir: PdClassAndVersionInformationRecord): PdStreamableObject | null {
    switch (cvir.classNumber) {
        case ClassId.kTNil:
            return null
        case ClassId.kPdStreamableObject:
            throw new Error("Problem: Should not stream PdStreamableObject abstract class " + cvir.classNumber)
        default:
            throw new Error("Problem: Unknown class " + cvir.classNumber)
    }
    // TODO: This function seems incomplete if actually had a real object -- return new PdStreamableObject()
}


