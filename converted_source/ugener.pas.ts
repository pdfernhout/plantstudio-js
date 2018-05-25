// unit Ugener

from conversion_common import *
import usupport
import utdo
import umath
import udomain
import ucollect
import uplant
import delphi_compatability


export class PdGeneration {
    firstParent: PdPlant = new PdPlant()
    secondParent: PdPlant = new PdPlant()
    selectedPlants: TList = new TList()
    plants: TListCollection = new TListCollection()
    
    // --------------------------------------------------------------------------------- PdGeneration 
    create(): void {
        TObject.prototype.create.call(this)
        this.plants = ucollect.TListCollection().Create()
        this.selectedPlants = delphi_compatability.TList().Create()
    }
    
    destroy(): void {
        this.plants.free
        this.plants = null
        this.selectedPlants.free
        this.selectedPlants = null
        TObject.prototype.destroy.call(this)
    }
    
    createWithParents(parentOne: PdPlant, parentTwo: PdPlant, fractionOfMaxAge: float): void {
        let newPlant: PdPlant
        
        // note: this is only used right now in the PdBreedFromParentsCommand command, so some things might not
        //    fit other situations. if you need to use it somewhere else, check that you want to do everything that
        //    is done here. 
        this.create()
        if (parentOne !== null) {
            newPlant = uplant.PdPlant().create()
            if (newPlant === null) {
            }
            parentOne.copyTo(newPlant)
            // v2.0
            newPlant.removeAllAmendments()
            newPlant.setAge(intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge))
            this.plants.Add(newPlant)
            this.firstParent = newPlant
            if (this.plants.IndexOf(parentOne) >= 0) {
                // only select parent if this is being done from the breeder and you have the parents already 
                this.selectedPlants.Add(this.firstParent)
            }
        }
        if (parentTwo !== null) {
            newPlant = uplant.PdPlant().create()
            if (newPlant === null) {
            }
            parentTwo.copyTo(newPlant)
            // v2.0
            newPlant.removeAllAmendments()
            newPlant.setAge(intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge))
            this.plants.Add(newPlant)
            this.secondParent = newPlant
            if (this.plants.IndexOf(parentTwo) >= 0) {
                // only select parent if this is being done from the breeder and you have the parents already 
                this.selectedPlants.Add(this.secondParent)
            }
        }
    }
    
    selectPlant(aPlant: PdPlant, shift: boolean): void {
        if (shift) {
            this.selectedPlants.Add(aPlant)
        } else {
            this.selectedPlants.Clear()
            this.selectedPlants.Add(aPlant)
        }
    }
    
    deselectAllPlants(): void {
        this.selectedPlants.Clear()
    }
    
    firstSelectedPlant(): PdPlant {
        let result = new PdPlant()
        result = null
        if (this.selectedPlants.Count > 0) {
            result = uplant.PdPlant(this.selectedPlants.Items[0])
        }
        return result
    }
    
    secondSelectedPlant(): PdPlant {
        let result = new PdPlant()
        result = null
        if (this.selectedPlants.Count > 1) {
            result = uplant.PdPlant(this.selectedPlants.Items[1])
        }
        return result
    }
    
    breedFromParents(aFirstParent: PdPlant, aSecondParent: PdPlant, fractionOfMaxAge: float): void {
        let newPlant: PdPlant
        let i: short
        let newAge: short
        let fileNameWithPath: string
        let newTdo: KfObject3D
        let inputFile: TextFile
        let tdos: TListCollection
        let localOptions: BreedingAndTimeSeriesOptionsStructure
        
        this.firstParent = aFirstParent
        if (this.firstParent === null) {
            return
        }
        if (udomain.domain === null) {
            return
        }
        this.secondParent = aSecondParent
        this.plants.clear()
        this.selectedPlants.Clear()
        tdos = null
        if ((udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary) && (!udomain.domain.checkForExistingDefaultTdoLibrary())) {
            MessageDialog("Because you didn't choose a 3D object library, the breeder won't be able" + chr(13) + "to randomly choose 3D objects for your breeding offspring." + chr(13) + chr(13) + "You can choose a library later by choosing Custom from the Variation menu" + chr(13) + "and choosing a 3D object library there.", mtWarning, {mbOK, }, 0)
        }
        try {
            if (udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary) {
                tdos = ucollect.TListCollection().Create()
                fileNameWithPath = udomain.domain.defaultTdoLibraryFileName
                if (!FileExists(fileNameWithPath)) {
                    udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary = false
                } else {
                    // cfk note: is it really ok to read the whole tdo file each time? 
                    AssignFile(inputFile, fileNameWithPath)
                    try {
                        // v1.5
                        usupport.setDecimalSeparator()
                        Reset(inputFile)
                        while (!UNRESOLVED.eof(inputFile)) {
                            newTdo = utdo.KfObject3D().create()
                            newTdo.readFromFileStream(inputFile, utdo.kInTdoLibrary)
                            tdos.Add(newTdo)
                        }
                    } finally {
                        CloseFile(inputFile)
                    }
                }
            }
            for (i = 0; i <= udomain.domain.breedingAndTimeSeriesOptions.plantsPerGeneration - 1; i++) {
                newPlant = uplant.PdPlant().create()
                this.plants.Add(newPlant)
                newPlant.reset()
                if (udomain.domain.breedingAndTimeSeriesOptions.variationType !== udomain.kBreederVariationNoNumeric) {
                    newPlant.randomize()
                }
                this.setLocalOptionsToDomainOptions(localOptions)
                newPlant.useBreedingOptionsAndPlantsToSetParameters(localOptions, this.firstParent, this.secondParent, tdos)
                newAge = intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge)
                newPlant.setAge(umath.intMin(newAge, newPlant.pGeneral.ageAtMaturity))
                // v2.0 plants take rotation angles from first parent
                newPlant.xRotation = this.firstParent.xRotation
                newPlant.yRotation = this.firstParent.yRotation
                newPlant.zRotation = this.firstParent.zRotation
            }
        } finally {
            tdos.free
        }
    }
    
    setLocalOptionsToDomainOptions(localOptions: BreedingAndTimeSeriesOptionsStructure): void {
        raise "method setLocalOptionsToDomainOptions had assigned to var parameter localOptions not added to return -- fixup manually"
        let i: short
        
        for (i = 0; i <= uplant.kMaxBreedingSections; i++) {
            // defaults
            localOptions.firstPlantWeights[i] = 50
        }
        localOptions.getNonNumericalParametersFrom = uplant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        // copy (done separate from low/med/custom) v2.0
        localOptions.mutateAndBlendColorValues = udomain.domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        localOptions.chooseTdosRandomlyFromCurrentLibrary = udomain.domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        switch (udomain.domain.breedingAndTimeSeriesOptions.variationType) {
            case udomain.kBreederVariationLow:
                for (i = 0; i <= uplant.kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = udomain.kLowMutation
                }
                break
            case udomain.kBreederVariationMedium:
                for (i = 0; i <= uplant.kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = udomain.kMediumMutation
                }
                break
            case udomain.kBreederVariationHigh:
                for (i = 0; i <= uplant.kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = udomain.kHighMutation
                }
                break
            case udomain.kBreederVariationCustom:
                localOptions = udomain.domain.breedingAndTimeSeriesOptions
                break
            case udomain.kBreederVariationNoNumeric:
                for (i = 0; i <= uplant.kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = udomain.kNoMutation
                }
                break
    }
    
    plantForIndex(index: short): PdPlant {
        let result = new PdPlant()
        result = null
        if (index < 0) {
            return result
        }
        if (index > this.plants.Count - 1) {
            return result
        }
        if (this.plants.Items[index] === null) {
            return result
        }
        result = uplant.PdPlant(this.plants.Items[index])
        return result
    }
    
    replacePlant(oldPlant: PdPlant, newPlant: PdPlant): void {
        let oldPlantIndex: short
        
        // no freeing should be going on here 
        oldPlantIndex = this.plants.IndexOf(oldPlant)
        this.plants.Remove(oldPlant)
        if (oldPlantIndex >= 0) {
            this.plants.Insert(oldPlantIndex, newPlant)
        } else {
            this.plants.Add(newPlant)
        }
        newPlant.previewCacheUpToDate = false
        // do the same for the selectedPlants list 
        oldPlantIndex = this.selectedPlants.IndexOf(oldPlant)
        if (oldPlantIndex >= 0) {
            this.selectedPlants.Remove(oldPlant)
            this.selectedPlants.Insert(oldPlantIndex, newPlant)
        }
    }
    
}

