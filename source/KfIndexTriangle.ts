import { long } from "./common";
import { PdStreamableObject, PdClassAndVersionInformationRecord, PdFiler, FIX_sizeof } from "./temporary";

export class KfIndexTriangle extends PdStreamableObject {
    pointIndexes: long[] = [0, 0, 0]

    // TODO: Update references to KfIndexTriangle.createABC() now that this is not an alternative constructor
    createABC(a: long, b: long, c: long): KfIndexTriangle {
        this.pointIndexes[0] = a
        this.pointIndexes[1] = b
        this.pointIndexes[2] = c
        return this
    }
    
    flip(): void {
        const savePoint = this.pointIndexes[0]
        this.pointIndexes[0] = this.pointIndexes[2]
        this.pointIndexes[2] = savePoint
    }
    
    copyFrom(aTriangle: KfIndexTriangle): void {
        if (aTriangle === null) {
            return
        }
        this.pointIndexes[0] = aTriangle.pointIndexes[0]
        this.pointIndexes[1] = aTriangle.pointIndexes[1]
        this.pointIndexes[2] = aTriangle.pointIndexes[2]
    }
    
    classAndVersionInformation(cvir: PdClassAndVersionInformationRecord): void {
        cvir.classNumber = ClassId.kKfIndexTriangle
        cvir.versionNumber = 0
        cvir.additionNumber = 0
    }
    
    streamDataWithFiler(filer: PdFiler, cvir: PdClassAndVersionInformationRecord): void {
        super.streamDataWithFiler(filer, cvir)
        this.pointIndexes = filer.streamBytes(this.pointIndexes, FIX_sizeof(this.pointIndexes))
    }
    
}
