// PdGeneration was unit Ugener

import { PdPlant, BreedingAndTimeSeriesOptionsStructure, kMaxBreedingSections, FromPlant } from "./PdPlant"
import { intround, short, TextFile, float, arrayRemove, arrayInsert, MessageDialog, eof } from "./common"
import { KfObject3D } from "./KfObject3D"
import { domain, BreederVariation, MutationRate } from "./PdDomain"
import { intMin } from "./umath"

export class PdGeneration {
    firstParent: PdPlant = new PdPlant()
    secondParent: PdPlant = new PdPlant()
    selectedPlants: PdPlant[] = []
    plants: PdPlant[] = []
    
    constructor(parentOne: PdPlant, parentTwo: PdPlant, fractionOfMaxAge: float): void {
        let newPlant: PdPlant
        
        // note: this is only used right now in the PdBreedFromParentsCommand command, so some things might not
        //    fit other situations. if you need to use it somewhere else, check that you want to do everything that
        //    is done here. 
        if (parentOne !== null) {
            newPlant = new PdPlant()
            if (newPlant === null) {
            }
            parentOne.copyTo(newPlant)
            // v2.0
            newPlant.removeAllAmendments()
            newPlant.setAge(intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge))
            this.plants.push(newPlant)
            this.firstParent = newPlant
            if (this.plants.indexOf(parentOne) >= 0) {
                // only select parent if this is being done from the breeder and you have the parents already 
                this.selectedPlants.push(this.firstParent)
            }
        }
        if (parentTwo !== null) {
            newPlant = new PdPlant()
            if (newPlant === null) {
            }
            parentTwo.copyTo(newPlant)
            // v2.0
            newPlant.removeAllAmendments()
            newPlant.setAge(intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge))
            this.plants.push(newPlant)
            this.secondParent = newPlant
            if (this.plants.indexOf(parentTwo) >= 0) {
                // only select parent if this is being done from the breeder and you have the parents already 
                this.selectedPlants.push(this.secondParent)
            }
        }
    }
    
    selectPlant(aPlant: PdPlant, shift: boolean): void {
        if (shift) {
            this.selectedPlants.push(aPlant)
        } else {
            this.selectedPlants.length = 0
            this.selectedPlants.push(aPlant)
        }
    }
    
    deselectAllPlants(): void {
        this.selectedPlants.length = 0
    }
    
    firstSelectedPlant(): PdPlant | null {
        if (this.selectedPlants.length > 0) {
            return this.selectedPlants[0]
        }
        return null
    }
    
    secondSelectedPlant(): PdPlant | null {
        if (this.selectedPlants.length > 1) {
            return this.selectedPlants[1]
        }
        return null
    }
    
    breedFromParents(aFirstParent: PdPlant, aSecondParent: PdPlant, fractionOfMaxAge: float): void {
        let inputFile: TextFile

        this.firstParent = aFirstParent
        if (this.firstParent === null) {
            return
        }
        
        if (domain === null) {
            return
        }

        this.secondParent = aSecondParent
        this.plants.length = 0
        this.selectedPlants.length = 0

        if ((domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary) && (!domain.checkForExistingDefaultTdoLibrary())) {
            // TODO: Fix MessageDialog parameters
            MessageDialog("Because you didn't choose a 3D object library, the breeder won't be able\nto randomly choose 3D objects for your breeding offspring.\n\nYou can choose a library later by choosing Custom from the Variation menu\nand choosing a 3D object library there.", "mtWarning", {mbOK: true, }, 0)
        }

        const tdos: KfObject3D[] = []

        if (domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary) {
            /* TODO implement random TDO choice in breedFromParents
            const fileNameWithPath = domain.defaultTdoLibraryFileName
            if (!FileExists(fileNameWithPath)) {
                domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary = false
            } else {
                // TODO: cfk note: is it really ok to read the whole tdo file each time? 
                AssignFile(inputFile, fileNameWithPath)
                try {
                    Reset(inputFile)
                    while (!eof(inputFile)) {
                        const newTdo = new KfObject3D()
                        newTdo.readFromFileStream(inputFile, utdo.kInTdoLibrary)
                        tdos.push(newTdo)
                    }
                } finally {
                    CloseFile(inputFile)
                }
            }
            */
        }
        for (let i = 0; i <= domain.breedingAndTimeSeriesOptions.plantsPerGeneration - 1; i++) {
            const newPlant = new PdPlant()
            this.plants.push(newPlant)
            newPlant.reset()
            if (domain.breedingAndTimeSeriesOptions.variationType !== BreederVariation.kBreederVariationNoNumeric) {
                newPlant.randomize()
            }
            const localOptions: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
            this.setLocalOptionsFromDomainOptions(localOptions)
            newPlant.useBreedingOptionsAndPlantsToSetParameters(localOptions, this.firstParent, this.secondParent, tdos)
            const newAge: short = intround(newPlant.pGeneral.ageAtMaturity * fractionOfMaxAge)
            newPlant.setAge(intMin(newAge, newPlant.pGeneral.ageAtMaturity))
            // v2.0 plants take rotation angles from first parent
            newPlant.xRotation = this.firstParent.xRotation
            newPlant.yRotation = this.firstParent.yRotation
            newPlant.zRotation = this.firstParent.zRotation
        }
    }
    
    setLocalOptionsFromDomainOptions(localOptions: BreedingAndTimeSeriesOptionsStructure): void {
        for (let i = 0; i <= kMaxBreedingSections; i++) {
            // defaults
            localOptions.firstPlantWeights[i] = 50
        }
        localOptions.getNonNumericalParametersFrom = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        // copy (done separate from low/med/custom) v2.0
        localOptions.mutateAndBlendColorValues = domain.breedingAndTimeSeriesOptions.mutateAndBlendColorValues
        localOptions.chooseTdosRandomlyFromCurrentLibrary = domain.breedingAndTimeSeriesOptions.chooseTdosRandomlyFromCurrentLibrary
        switch (domain.breedingAndTimeSeriesOptions.variationType) {
            case BreederVariation.kBreederVariationLow:
                for (let i = 0; i <= kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = MutationRate.kLowMutation
                }
                break
            case BreederVariation.kBreederVariationMedium:
                for (let i = 0; i <= kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = MutationRate.kMediumMutation
                }
                break
            case BreederVariation.kBreederVariationHigh:
                for (let i = 0; i <= kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = MutationRate.kHighMutation
                }
                break
            case BreederVariation.kBreederVariationCustom:
                domain.breedingAndTimeSeriesOptions.copyTo(localOptions)
                break
            case BreederVariation.kBreederVariationNoNumeric:
                for (let i = 0; i <= kMaxBreedingSections; i++) {
                    localOptions.mutationStrengths[i] = MutationRate.kNoMutation
                }
                break
        }
    }
    
    plantForIndex(index: short): PdPlant | null {
        if (index < 0) {
            return null
        }
        if (index > this.plants.length - 1) {
            return null
        }
        if (this.plants[index] === null) {
            return null
        }
        return this.plants[index]
    }
    
    replacePlant(oldPlant: PdPlant, newPlant: PdPlant): void {
        // no freeing should be going on here 
        let oldPlantIndex = this.plants.indexOf(oldPlant)
        arrayRemove(this.plants, oldPlant)
        if (oldPlantIndex >= 0) {
            arrayInsert(this.plants, oldPlantIndex, newPlant)
        } else {
            this.plants.push(newPlant)
        }
        newPlant.previewCacheUpToDate = false
        // do the same for the selectedPlants list 
        oldPlantIndex = this.selectedPlants.indexOf(oldPlant)
        if (oldPlantIndex >= 0) {
            arrayRemove(this.selectedPlants, oldPlant)
            arrayInsert(this.selectedPlants, oldPlantIndex, newPlant)
        }
    }
    
}

