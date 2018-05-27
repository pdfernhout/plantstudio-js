// unit Uclasses

from conversion_common import *
import ufiler
import delphi_compatability

// const
const kTNil = 14501
const kPdStreamableObject = 14502
const kPdPlant = 14503
const kPdPlantPart = 14505
const kPdInternode = 14506
const kPdLeaf = 14507
const kPdMeristem = 14508
const kPdInflorescence = 14509
const kPdFlowerFruit = 14510
const kKfObject3D = 14511
const kKfIndexTriangle = 14512
const KPdRandom = 14513
const kPdBreedingStrategy = 14514
const kPdPlantDrawingAmendment = 14515


// kPdDayPlant = 14504;
function CreateStreamableObjectFromClassAndVersionInformation(cvir: PdClassAndVersionInformationRecord): PdStreamableObject {
    let result = new PdStreamableObject()
    switch (cvir.classNumber) {
        case kTNil:
            result = null
            break
        case kPdStreamableObject:
            throw new GeneralException.create("Problem: Should not stream PdStreamableObject abstract class " + IntToStr(cvir.classNumber))
            break
        default:
            throw new GeneralException.create("Problem: Unknown class " + IntToStr(cvir.classNumber))
            result = null
            break
    }
    return result
}


