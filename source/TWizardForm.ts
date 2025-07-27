// unit uwizard

import * as m from "mithril"
import { AssignFile, CloseFile, Reset } from "./common"
import { CompoundLeafStyle, FloralPart, Gender, LeafArrangement, PdPlant } from "./PdPlant"
import { darkerColor } from "./usupport"

// from conversion_common import *
// import ubmpsupport
// import umain
// import ucursor
// import updcom
// import utravers
// import usupport
// import uturtle
// import udomain
// import ubitmap
// import utdo
// import ucollect
// import updform
// import uplant
// import delphi_compatability

// const
// const kMeristem_AlternateOrOpposite = 1
// const kMeristem_BranchIndex = 2
// const kMeristem_SecondaryBranching = 3
// const kMeristem_BranchAngle = 4
// const kInternode_Curviness = 5
// const kInternode_Length = 6
// const kLeaves_Scale = 7
// const kLeaves_PetioleLength = 8
// const kLeaves_Angle = 9
// const kLeaflets_Number = 10
// const kLeaflets_Shape = 11
// const kLeaflets_Spread = 12
// const kFlowers_NumPetals = 13
// const kFlowers_Scale = 14
// const kInflorDraw_NumFlowers = 15
// const kInflorDraw_Shape = 16
// const kInflorPlace_NumApical = 17
// const kInflorPlace_NumAxillary = 18
// const kInflorPlace_ApicalStalkLength = 19
// const kInflorPlace_AxillaryStalkLength = 20
// const kFruit_NumSections = 21
// const kFruit_Scale = 22
// const kInternode_Thickness = 23
// const kInflorDraw_Thickness = 24


// const
// const kStart = 0
// const kMeristems = 1
// const kInternodes = 2
// const kLeaves = 3
// const kCompoundLeaves = 4
// const kInflorescencesPlacement = 5
// const kInflorescences = 6
// const kFlowers = 7
// const kFruit = 8
// const kFinish = 9
// const kLastPanel = 9
// const kReloadVariables = true
// const kDontReloadVariables = false


// const
const kPreviewSize = 110

type PageSpec = {
    id: string
    title: string
    image: string
    icon: string
    iconDisabled?: string
    topText: string
    bottomText?: string
    type: "page"
}

type ChoiceSpec = {
    id: string
    options: string[]
    values: any[]
    getValue?: (plant: PdPlant) => any
    setValue: (plant: PdPlant, value: any, form: TWizardForm) => void
    initialValue: string
    label: string
    type?: "tdo" | "color"
}

const templateSpec: ChoiceSpec = {
    id: "",
    options: [],
    values: [],
    setValue: (plant: PdPlant, value: any) => plant.age = value,
    initialValue: "",
    label: ""
}

function hasNoInflorescences(plant: PdPlant) {
    return plant.pGeneral.numApicalInflors === 0 && plant.pGeneral.numAxillaryInflors === 0
}

function adjustAgeAtWhichFloweringStarts(plant: PdPlant) {
    if (hasNoInflorescences(plant)) {
        // if no flowers, set age to allocate at max
        plant.pGeneral.ageAtWhichFloweringStarts = plant.pGeneral.ageAtMaturity + 1
    } else {
        plant.pGeneral.ageAtWhichFloweringStarts = Math.round(plant.pGeneral.ageAtMaturity * 0.6)
    }
}

function adjustFlowersForChanges(plant: PdPlant, numFlowers: number, inflorShape: string): void {
    // TODO: Maybe needs to handle the case of no flowers better?
    // Originally just exited, presumably leaving all defaults as-is:
    // if (hasNoInflorescences(plant)) {
    //     return
    // }
    plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = numFlowers
    plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 0
    plant.pInflor[Gender.kGenderFemale].numBranches = 0

    if (inflorShape === "spike") {
        // shape 
        plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = numFlowers
        plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 0
        plant.pInflor[Gender.kGenderFemale].numBranches = 0
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 1
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 30
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 10
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = true
    } else if (inflorShape === "raceme") {
        plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = numFlowers
        plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 0
        plant.pInflor[Gender.kGenderFemale].numBranches = 0
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 20
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 45
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 10
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = true
    } else if (inflorShape === "panicle") {
        switch (numFlowers) {
            case 1:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 1
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 0
                plant.pInflor[Gender.kGenderFemale].numBranches = 0
                break
            case 2:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 0
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 1
                plant.pInflor[Gender.kGenderFemale].numBranches = 2
                break
            case 3:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 1
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 1
                plant.pInflor[Gender.kGenderFemale].numBranches = 2
                break
            case 5:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 1
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 2
                plant.pInflor[Gender.kGenderFemale].numBranches = 2
                break
            case 10:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 1
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 3
                plant.pInflor[Gender.kGenderFemale].numBranches = 3
                break
            case 20:
                plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 4
                plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 4
                plant.pInflor[Gender.kGenderFemale].numBranches = 4
                break
        }
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 15
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 30
        plant.pInflor[Gender.kGenderFemale].branchAngle = 35
        plant.pInflor[Gender.kGenderFemale].branchesAreAlternate = true
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 7
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = true
    } else if (inflorShape === "umbel") {
        plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 0
        plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 1
        plant.pInflor[Gender.kGenderFemale].numBranches = numFlowers
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 20
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 20
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 0.0
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = true
    } else if (inflorShape === "cluster") {
        plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = 0
        plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 1
        plant.pInflor[Gender.kGenderFemale].numBranches = numFlowers
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = true
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 3
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 1
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 25
    } else if (inflorShape === "head") {
        plant.pInflor[Gender.kGenderFemale].numFlowersOnMainBranch = numFlowers
        plant.pInflor[Gender.kGenderFemale].numFlowersPerBranch = 0
        plant.pInflor[Gender.kGenderFemale].numBranches = 0
        plant.pInflor[Gender.kGenderFemale].pedicelLength_mm = 10
        plant.pInflor[Gender.kGenderFemale].pedicelAngle = 0
        plant.pInflor[Gender.kGenderFemale].internodeLength_mm = 10
        plant.pInflor[Gender.kGenderFemale].isHead = true
        plant.pInflor[Gender.kGenderFemale].flowersSpiralOnStem = false
    } else {
        throw new Error("Unexpected inflorShape: " + inflorShape)
    }
}

const commonColors = {
    aqua: "#00FFFF",
    black: "#000000",
    blue: "#0000FF",
    fuchsia: "#FF00FF",
    gray: "#808080",
    green: "#008000",
    lime: "#00FF00",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    purple: "#800080",
    red: "#FF0000",
    silver: "#C0C0C0",
    teal: "#008080",
    white: "#FFFFFF",
    yellow: "#FFFF00",
}

function CssHexColorToNumber(cssColor: string) {
    return parseInt(cssColor.substring(5,7) + cssColor.substring(3,5) + cssColor.substring(1,3), 16);
}

const choiceSpecs: (PageSpec | ChoiceSpec)[] = [
    {
        id: "page1",
        title: "Start",
        image: "WizardForm_startPicture.png",
        icon: "WizardForm_startPageImage.png",
        topText: "Welcome to the Plant Wizard! " +
            "This wizard will help you create a new plant by asking you some simple questions. " +
            "These 10 panels contain about 25 questions based on the most important of the 400 or so parameters that define a plant. " +
            "Click the Next button to start, or click Cancel to stop. Once you start, you can click the Back button to go back and change your choices, or you can click Cancel at any time. ",
        bottomText: "For each question, click on one of the big buttons under the question to make your choice.",
        // bottomText: "Note: If you are using the wizard for the first time, we recommend turning on the 'Long Button Hints'. Each wizard question has a hint.",
        type: "page"
    },

    ///////////////////////////////////

    {
        id: "page2",
        title: "Meristems",
        image: "",
        icon: "WizardForm_meristemsPageImage.png",
        topText: "Meristems are buds from which leaves and branches grow. Where they develop and what they produce has a big effect on plant shape. Meristems form at the growing ends of plant stems (apexes) and in the angles between leaf and stem (axils).",
        type: "page"
    },

    {
        id: "leaves",
        options: ["alternate", "opposite"],
        values: [LeafArrangement.kArrangementAlternate, LeafArrangement.kArrangementOpposite],
        setValue: (plant: PdPlant, value: any) =>  plant.pMeristem.branchingAndLeafArrangement = value,
        initialValue: "alternate",
        label: "How should leaves and branches be arranged?"
    },
    {
        id: "branch",
        options: ["none", "little", "medium", "lot"],
        values: [0, 10, 30, 80],
        setValue: (plant: PdPlant, value: any) => plant.pMeristem.branchingIndex = value,
        initialValue: "medium",
        label: "How much should the plant branch?"
    },
    {
        id: "secondaryBranching",
        options: ["no", "yes"],
        values: [false, true],
        setValue: (plant: PdPlant, value: any) => plant.pMeristem.secondaryBranchingIsAllowed = value,
        initialValue: "no",
        label: "Should secondary branching (off branches) occur?"
    },
    {
        id: "branchAngle",
        options: ["small", "medium", "large"],
        values: [20, 40, 60],
        setValue: (plant: PdPlant, value: any) => plant.pMeristem.branchingAngle = value,
        initialValue: "medium",
        label: "What angle should branches make with the stem?"
    },

    ///////////////////////////////////

    {
        id: "page3",
        title: "Internodes",
        image: "",
        icon: "WizardForm_internodesPageImage.png",
        topText: "Internodes are portions of plant stem between leaves. They determine how tall or short, straight or viney, and stiff or flexible a plant will be.",
        bottomText: "",
        type: "page"
    },

    {
        id: "curviness",
        options: ["none", "little", "some", "very"],
        values: [[0, 0], [10, 5], [30, 10], [50, 20]],
        setValue: (plant: PdPlant, value: any) => {
            plant.pInternode.curvingIndex = value[0]
            plant.pInternode.firstInternodeCurvingIndex = value[1]
        },
        initialValue: "some",
        label: "How curvy should the plant stem be?"
    },
    {
        id: "internodeWidth",
        options: ["very thin", "thin", "medium", "thick", "very thick"],
        values: [0.5, 1, 2, 3, 10],
        setValue: (plant: PdPlant, value: any) => plant.pInternode.widthAtOptimalFinalBiomassAndExpansion_mm = value,
        initialValue: "medium",
        label: "How thick should internodes be?"
    },
    {
        id: "internodes",
        options: ["very short", "short", "medium", "long", "very long"],
        values: [1, 10, 15, 25, 50],
        setValue: (plant: PdPlant, value: any) => plant.pInternode.lengthAtOptimalFinalBiomassAndExpansion_mm = value,
        initialValue: "medium",
        label: "How long should internodes be?"
    },

    ///////////////////////////////////

    {
        id: "page4",
        title: "Leaves",
        image: "",
        icon: "WizardForm_leavesPageImage.png",
        topText: "PlantStudio draws leaves using a \"3D object\" that represents a 3D leaf shape. The 3D object is drawn bigger as the leaf grows. Leaves are connected to the plant by a stalk called a petiole.",
        bottomText: "",
        type: "page"
    },

    {
        id: "leafTdos",
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            // TODO: FIXME for TDOs
            // plant.pLeaf.leafTdoParams.object3D.copyFrom(value),
        },
        initialValue: "",
        label: "What 3D object should be used to draw leaves?",
        type: "tdo"
    },
    {
        id: "leafScale",
        options: ["tiny", "small", "medium", "large", "huge"],
        values: [5, 20, 40, 60, 100],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.leafTdoParams.scaleAtFullSize = value,
        initialValue: "medium",
        label: "How big should a full-sized leaf be drawn?"
    },
    {
        id: "petiole",
        options: ["very short", "short", "medium", "long", "very long"],
        values: [1, 10, 20, 30, 60],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.petioleLengthAtOptimalBiomass_mm = value,
        initialValue: "medium",
        label: "How long should the petiole (leaf stalk) be?"
    },
    {
        id: "leafAngle",
        options: ["small", "medium", "large"],
        values: [20, 40, 60],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.petioleAngle = value,
        initialValue: "medium",
        label: "What angle should each leaf make with the stem?"
    },

    ///////////////////////////////////

    {
        id: "page5",
        title: "Compound leaves",
        image: "",
        icon: "WizardForm_compoundLeavesPageImage.png",
        topText: "A compound leaf is a leaf made up of two or more small parts called leaflets. The leaflets look like small whole leaves, but they always fit together in the same pattern for all the leaves on the plant (usually). A leaf without leaflets is a simple leaf.",
        bottomText: "",
        type: "page"
    },

    {
        id: "leafletsNumber",
        options: ["one (simple)", "three", "four", "five", "seven"],
        values: [1, 3, 4, 5, 7],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.compoundNumLeaflets = value,
        initialValue: "one (simple)",
        label: "How many leaflets should make up each leaf?"
    },
    {
        id: "leafletsShape",
        options: ["pinnate", "palmate"],
        values: [CompoundLeafStyle.kCompoundLeafPinnate, CompoundLeafStyle.kCompoundLeafPalmate],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.compoundPinnateOrPalmate = value,
        initialValue: "pinnate",
        label: "What shape should the compound leaves take?"
    },
    {
        id: "leafletSpacing",
        options: ["close", "medium", "far"],
        values: [10.0, 30.0, 50.0],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.compoundRachisToPetioleRatio = value,
        initialValue: "medium",
        label: "How spread out should the leaflets be?"
    },

    ///////////////////////////////////

    {
        id: "page6",
        title: "Inflorescence placement",
        image: "",
        icon: "WizardForm_inflorPlacePageImage.png",
        topText: "An inflorescence holds flowers and fruits on a plant. Since most plants have hermaphroditic flowers (with both male and female parts), the wizard creates only primary (female or hermaphroditic) flowers. " +
            "IMAGE:source/resources/WizardForm_apicalInflorExtraImage.png " + 
            "Apical inflorescences are at the ends (apexes) of plant stems. " +
            "IMAGE:source/resources/WizardForm_axillaryInflorExtraImage.png " + 
            "Axillary inflorescences are in the angles between leaf and stem (axils).",
        bottomText: "",
        type: "page"
    },

    {
        id: "apicalInflors",
        options: ["none", "one", "two", "three", "five"],
        values: [0, 1, 2, 3, 5],
        setValue: (plant: PdPlant, value: any) => {
            plant.pGeneral.numApicalInflors = value
            adjustAgeAtWhichFloweringStarts(plant)
        },
        initialValue: "one",
        label: "How many apical inflorescences should there be?"
    },
    {
        id: "apicalStalk",
        options: ["very short", "short", "medium", "long", "very long"],
        values: [1, 10, 30, 50, 100],
        setValue: (plant: PdPlant, value: any) => plant.pInflor[Gender.kGenderFemale].terminalStalkLength_mm = value,
        initialValue: "medium",
        label: "How long should their apical (primary) stems be?"
    },
    {
        id: "axillaryInflors",
        options: ["none", "three", "five", "ten", "twenty"],
        values: [0, 3, 5, 10, 20],
        setValue: (plant: PdPlant, value: any) => {
            plant.pGeneral.numAxillaryInflors = value
            adjustAgeAtWhichFloweringStarts(plant)
        },
        initialValue: "none",
        label: "How many axillary inflorescences should there be?"
    },
    {
        id: "axillaryStalk",
        options: ["very short", "short", "medium", "long", "very long"],
        values: [1, 5, 10, 15, 40],
        setValue: (plant: PdPlant, value: any) => plant.pInflor[Gender.kGenderFemale].peduncleLength_mm = value,
        initialValue: "medium",
        label: "How long should their axillary (lateral) stems be?"
    },

    ///////////////////////////////////

    {
        id: "page7",
        title: "Inflorescences", // "Inflorescence drawing"
        image: "",
        icon: "WizardForm_inflorDrawPageImage.png",
        iconDisabled: "WizardForm_inflorDrawPageImageDisabled.png",
        topText: "Inflorescences can have a large variety of shapes, a few of which are shown here. We extend the true meaning of \"inflorescence\" a bit to use an inflorescence when there is only one flower. ",
        bottomText: "",
        type: "page"
    },

    {
        id: "inflorFlowers",
        options: ["none", "one", "two", "three", "five", "ten", "twenty"],
        values: [0, 1, 2, 3, 5, 10, 20],
        setValue: (plant: PdPlant, value: any, form: TWizardForm) => {
            form.inflorFlowers = value
            adjustFlowersForChanges(plant, form.inflorFlowers, form.inflorShape)
        },
        initialValue: "three", // If you change this, you mist also change form.inflorFlowers initializer
        label: "How many flowers should each inflorescence have?"
    },
    {
        id: "inflorShape",
        options: ["spike", "raceme", "panicle", "umbel", "cluster", "head"],
        values: ["spike", "raceme", "panicle", "umbel", "cluster", "head"],
        setValue: (plant: PdPlant, value: any, form: TWizardForm) => {
            form.inflorShape = value
            adjustFlowersForChanges(plant, form.inflorFlowers, form.inflorShape)
        },
        initialValue: "spike", // If you change this, you mist also change form.inflorShape initializer
        label: "What shape should each inflorescence have?"
    },
    {
        id: "inflorWidth",
        options: ["very thin", "thin", "medium", "thick", "very thick"],
        values: [0.5, 1, 2, 3, 10],
        setValue: (plant: PdPlant, value: any) => plant.pInflor[Gender.kGenderFemale].internodeWidth_mm = value,
        initialValue: "medium",
        label: "How thick should each inflorescence stem be?"
    },

    ///////////////////////////////////

    {
        id: "page8",
        title: "Flowers",
        image: "",
        icon: "WizardForm_flowersPageImage.png",
        iconDisabled: "WizardForm_flowersPageImageDisabled.png",
        topText: "Like leaves, flowers are drawn using a 3D object. But here the 3D object represents only one petal of the flower. A number of petals is drawn rotated around a center to produce what looks like a flower.",
        bottomText: "",
        type: "page"
    },

    {
        id: "petalTdos",
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            // TODO: FIXME for setting TDO
            // tdo = this.tdoForIndex(this.petalTdosDraw.Selection.left)
            // if ((tdo !== null) && (this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D !== null)) {
            //     // cfk first petals again
            //     this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D.copyFrom(tdo)
            // }
        },
        initialValue: "",
        label: "What 3D object should be used for a flower petal?",
        type: "tdo"
    },
    {
        id: "petals",
        options: ["one", "three", "four", "five", "ten"],
        values: [1, 3, 4, 5, 10],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].repetitions = value,
        initialValue: "five",
        label: "How many flower petals should a flower have?"
    },
    {
        id: "petalScale",
        options: ["tiny", "small", "medium", "large", "huge"],
        values: [4, 10, 20, 30, 60],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].scaleAtFullSize = value,
        initialValue: "medium",
        label: "How big should a flower petal be drawn?"
    },
    {
        id: "petalColor",
        options: Object.keys(commonColors),
        values: Object.values(commonColors),
        setValue: (plant: PdPlant, value: any) => {
            plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].faceColor = CssHexColorToNumber(value)
            plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].backfaceColor = darkerColor(plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].faceColor)
            plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kBud].faceColor = plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].faceColor
            plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kBud].backfaceColor = plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].backfaceColor
        },
        initialValue: "blue",
        label: "What color should flowers be drawn?",
        type: "color"
    },

    ///////////////////////////////////

    {
        id: "page9",
        title: "Fruits",
        image: "",
        icon: "WizardForm_fruitsPageImage.png",
        iconDisabled: "WizardForm_fruitsPageImageDisabled.png",
        topText: "Fruits are drawn like flowers, but with a portion of the fruit (a \"fruit section\") rotated around instead of a petal. For many plants you will not be interested in the fruit, so you can turn fruits off entirely.",
        bottomText: "",
        type: "page"
    },

    {
        id: "showFruits",
        options: ["no", "yes"],
        values: [200, 3],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].minDaysBeforeSettingFruit = value,
        initialValue: "no",
        label: "Do you want to see fruits on your plant?"
    },
    {
        id: "fruitTdo",
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            // TODO: FIXME for TDOs
            // tdo = this.tdoForIndex(this.sectionTdosDraw.Selection.left)
            // if ((tdo !== null) && (this.plant.pFruit.tdoParams.object3D !== null)) {
            //     this.plant.pFruit.tdoParams.object3D.copyFrom(tdo)
            // }
        },
        initialValue: "",
        label: "What 3D object should be used to draw each fruit section?",
        type: "tdo"
    },
    {
        id: "fruitSections",
        options: ["one", "three", "four", "five", "ten"],
        values: [1, 3, 4, 5, 10],
        setValue: (plant: PdPlant, value: any) => plant.pFruit.tdoParams.repetitions = value,
        initialValue: "one",
        label: "How many fruit sections should be used to draw the fruit?"
    },
    {
        id: "fruitScale",
        options: ["tiny", "small", "medium", "large", "huge"],
        values: [4, 10, 20, 30, 60],
        setValue: (plant: PdPlant, value: any) => plant.pFruit.tdoParams.scaleAtFullSize = value,
        initialValue: "medium",
        label: "How big should fruit sections be drawn?"
    },
    {
        id: "fruitColor",
        options: Object.keys(commonColors),
        values: Object.values(commonColors),
        setValue: (plant: PdPlant, value: any) => {
            plant.pFruit.tdoParams.faceColor = CssHexColorToNumber(value)
            plant.pFruit.tdoParams.backfaceColor = darkerColor(plant.pFruit.tdoParams.faceColor)
            plant.pFruit.tdoParams.alternateFaceColor = plant.pFruit.tdoParams.faceColor
            plant.pFruit.tdoParams.alternateBackfaceColor = plant.pFruit.tdoParams.backfaceColor
        },
        initialValue: "red",
        label: "What color should fruits be drawn?",
        type: "color"
    },

    // TODO: Maybe need extra conditional where if not flowers should turn off fruit

    ///////////////////////////////////

    {
        id: "page10",
        title: "Finish / Preview",
        image: "",
        icon: "WizardForm_finishPageImage.png",
        topText: "Congratulations! " +
            "You have finished designing your new plant. You can name your new plant here, or just keep this name. " +
            "Now click Finish to place your plant in the main window, or click Cancel to stop without creating a plant, or click Back to change your choices. " +
            "You can also click on the pictures below to return to any of the wizard panels. " +
            "Once your plant is made, you can fine-tune the parameters that define your plant in the Parameters panel in the main window. ",
        bottomText: "",
        type: "page"
    },

    // TODO: Plant preview pane / previewPanel / 213 x 251

    // TODO: Plant name edit field / newPlantName

    // TODO: Randomize button / caption("&Randomize") / randomizePlantClick

    // TODO: Rotate left and right buttons / turnLeftClick / turnRightClick

    // TODO: wizardNotebook / wizardNotebookPageChanged
]

/* Other buttons:
caption("&Help") helpButtonClick
caption("&Defaults") defaultChoicesClick
caption("&3D Objects...") changeTdoLibraryClick
progressDrawGrid  ColCount: "10", progressDrawGridDrawCell progressDrawGridSelectCell
caption("< &Back") backClick
caption("&Next >") nextClick
caption("&Cancel") cancelClick
*/

// group indexes 
export class TWizardForm {
    // wizardNotebook: TNotebook = new TNotebook()
    // cancel: TButton = new TButton()
    // back: TButton = new TButton()
    // next: TButton = new TButton()
    // panelMeristemsLabel: TLabel = new TLabel()
    // panelInternodesLabel: TLabel = new TLabel()
    // panelLeavesLabel: TLabel = new TLabel()
    // panelInflorDrawingLabel: TLabel = new TLabel()
    // branchingLabel: TLabel = new TLabel()
    // leavesAlternateOppositeLabel: TLabel = new TLabel()
    // branchAngleLabel: TLabel = new TLabel()
    // secondaryBranchingLabel: TLabel = new TLabel()
    // curvinessLabel: TLabel = new TLabel()
    // internodeLengthLabel: TLabel = new TLabel()
    // leafTdosLabel: TLabel = new TLabel()
    // leafScaleLabel: TLabel = new TLabel()
    // leafAngleLabel: TLabel = new TLabel()
    // petioleLengthLabel: TLabel = new TLabel()
    // finishLabelFirst: TLabel = new TLabel()
    // newPlantName: TEdit = new TEdit()
    // finishLabelSecond: TLabel = new TLabel()
    // finishLabelThird: TLabel = new TLabel()
    // panelFinishLabel: TLabel = new TLabel()
    // panelStartLabel: TLabel = new TLabel()
    // introLabelThird: TLabel = new TLabel()
    // panelFlowersLabel: TLabel = new TLabel()
    // petalTdosLabel: TLabel = new TLabel()
    // petalScaleLabel: TLabel = new TLabel()
    // petalsNumberLabel: TLabel = new TLabel()
    // fruitTdoLabel: TLabel = new TLabel()
    // fruitSectionsNumberLabel: TLabel = new TLabel()
    // fruitScaleLabel: TLabel = new TLabel()
    // panelFruitsLabel: TLabel = new TLabel()
    // inflorFlowersLabel: TLabel = new TLabel()
    // inflorShapeLabel: TLabel = new TLabel()
    // panelInflorPlacementLabel: TLabel = new TLabel()
    // apicalInflorsNumberLabel: TLabel = new TLabel()
    // axillaryInflorsNumberLabel: TLabel = new TLabel()
    // apicalStalkLabel: TLabel = new TLabel()
    // axillaryStalkLabel: TLabel = new TLabel()
    // introLabelFirst: TLabel = new TLabel()
    // apicalInflorExtraImage: TImage = new TImage()
    // axillaryInflorExtraImage: TImage = new TImage()
    // previewPanel: TPanel = new TPanel()

    // arrowLeavesAlternateOpposite: TImage = new TImage()
    // arrowBranching: TImage = new TImage()
    // arrowSecondaryBranching: TImage = new TImage()
    // arrowBranchAngle: TImage = new TImage()
    // arrowCurviness: TImage = new TImage()
    // arrowInternodeLength: TImage = new TImage()
    // arrowLeafScale: TImage = new TImage()

    // arrowLeafAngle: TImage = new TImage()

    // arrowPetioleLength: TImage = new TImage()

    // arrowLeafTdos: TImage = new TImage()

    // arrowPetalTdos: TImage = new TImage()
    // arrowPetalsNumber: TImage = new TImage()
    // arrowPetalScale: TImage = new TImage()
    // arrowInflorFlowers: TImage = new TImage()
    // arrowInflorShape: TImage = new TImage()

    // arrowApicalInflorsNumber: TImage = new TImage()

    // arrowAxillaryInflorsNumber: TImage = new TImage()

    // arrowApicalStalk: TImage = new TImage()
    // arrowAxillaryStalk: TImage = new TImage()

    // arrowFruitTdo: TImage = new TImage()
    // arrowFruitSectionsNumber: TImage = new TImage()
    // arrowFruitScale: TImage = new TImage()

    // introLabelSecond: TLabel = new TLabel()
    // panelCompoundLeavesLabel: TLabel = new TLabel()
    // arrowLeaflets: TImage = new TImage()
    // leafletsLabel: TLabel = new TLabel()
    // leafletsShapeLabel: TLabel = new TLabel()
    // arrowLeafletsShape: TImage = new TImage()

    // arrowLeafletsSpacing: TImage = new TImage()
    // leafletSpacingLabel: TLabel = new TLabel()

    // leafTdosDraw: TDrawGrid = new TDrawGrid()
    // petalTdosDraw: TDrawGrid = new TDrawGrid()
    // sectionTdosDraw: TDrawGrid = new TDrawGrid()

    // defaultChoices: TButton = new TButton()
    // arrowInternodeWidth: TImage = new TImage()
    // internodeWidthLabel: TLabel = new TLabel()

    // arrowInflorThickness: TImage = new TImage()
    // inflorThicknessLabel: TLabel = new TLabel()

    // arrowPetalColor: TImage = new TImage()
    // petalColorLabel: TLabel = new TLabel()
    // petalColor: TPanel = new TPanel()
    // fruitColorLabel: TLabel = new TLabel()

    // fruitColor: TPanel = new TPanel()

    // arrowFruitColor: TImage = new TImage()
    // hiddenPicturesPanel: TPanel = new TPanel()
    // startPageImage: TImage = new TImage()
    // meristemsPageImage: TImage = new TImage()
    // internodesPageImage: TImage = new TImage()
    // leavesPageImage: TImage = new TImage()
    // compoundLeavesPageImage: TImage = new TImage()
    // flowersPageImage: TImage = new TImage()
    // inflorDrawPageImage: TImage = new TImage()
    // inflorPlacePageImage: TImage = new TImage()
    // fruitsPageImage: TImage = new TImage()
    // finishPageImage: TImage = new TImage()
    // fruitColorExplainLabel: TLabel = new TLabel()
    // flowerColorExplainLabel: TLabel = new TLabel()
    // arrowShowFruits: TImage = new TImage()
    // showFruitsLabel: TLabel = new TLabel()

    // previewLabel: TLabel = new TLabel()

    // randomizePlant: TButton = new TButton()

    // inflorDrawPageImageDisabled: TImage = new TImage()
    // flowersPageImageDisabled: TImage = new TImage()
    // fruitsPageImageDisabled: TImage = new TImage()

    // bottomBevel: TBevel = new TBevel()
    // longHintsSuggestionLabel: TLabel = new TLabel()
    // Label1: TLabel = new TLabel()
    // Label2: TLabel = new TLabel()
    // Label3: TLabel = new TLabel()
    // Label4: TLabel = new TLabel()
    // Label5: TLabel = new TLabel()
    // Label6: TLabel = new TLabel()
    // Label7: TLabel = new TLabel()
    // Label8: TLabel = new TLabel()
    // Label9: TLabel = new TLabel()
    // Label10: TLabel = new TLabel()
    // progressDrawGrid: TDrawGrid = new TDrawGrid()
    // Label11: TLabel = new TLabel()
    // Label12: TLabel = new TLabel()

    // helpButton: TSpeedButton = new TSpeedButton()

    // changeTdoLibrary: TSpeedButton = new TSpeedButton()

    // sectionTdoSelectedLabel: TLabel = new TLabel()
    // petalTdoSelectedLabel: TLabel = new TLabel()
    // leafTdoSelectedLabel: TLabel = new TLabel()
    // startPicture: TImage = new TImage()

    plant: PdPlant = new PdPlant()
    // tdos: TListCollection = new TListCollection()
    // plantHasInflorescences: boolean = false
    // tdoSelectionChanged: boolean = false
    // askedToSaveOptions: boolean = false

    wizardChoices: { [id: string] : string } = {}

    // Need to store some flower choices in form as they are used to calculate ingterdependent things in plant 
    inflorFlowers: number = 3
    inflorShape: string = "spike"

    constructor() {
        const plant = this.plant
        plant.defaultAllParameters()
        plant.basePoint_mm.x = 200
        plant.basePoint_mm.y = 300
        plant.age = 90
        this.defaultAllChoices()
        plant.regrow()
    }

    // previewPaintBox: PdPaintBoxWithPalette = new PdPaintBoxWithPalette()
    // TWizardForm.prototype = new PdForm()
    // TWizardForm.prototype.constructor = TWizardForm
    
    // //$R *.DFM
    // // panels 
    // // -------------------------------------------------------------------------------------------- creation/destruction 
    // create(AOwner: TComponent): void {
    //     let i: short
        
    //     PdForm.prototype.create.call(this, AOwner)
    //     this.leafTdoSelectedLabel.Caption = ""
    //     this.petalTdoSelectedLabel.Caption = ""
    //     this.sectionTdoSelectedLabel.Caption = ""
    //     this.previewPaintBox = ubitmap.PdPaintBoxWithPalette().Create(this)
    //     this.previewPaintBox.Parent = this.previewPanel
    //     this.previewPaintBox.Align = delphi_compatability.TAlign.alClient
    //     this.previewPaintBox.OnPaint = this.previewPaintBoxPaint
    //     // initialize default plant 
    //     this.plant = uplant.PdPlant().create()
    //     this.plant.defaultAllParameters()
    //     this.plant.setName("New plant " + IntToStr(updcom.numPlantsCreatedThisSession + 1))
    //     updcom.numPlantsCreatedThisSession += 1
    //     this.newPlantName.Text = this.plant.getName()
    //     // initialize tdos 
    //     this.tdos = ucollect.TListCollection().Create()
    //     this.readTdosFromFile()
    //     if (udomain.domain !== null) {
    //         for (i = 1; i <= udomain.kMaxWizardQuestions; i++) {
    //             // load info from domain on choices 
    //             this.setDownButtonForGroupIndexFromName(i, udomain.domain.options.wizardChoices[i])
    //         }
    //     }
    //     if (udomain.domain.options.wizardShowFruit) {
    //         // handle radio button choice separately 
    //         this.showFruitsYes.Checked = true
    //     } else {
    //         this.showFruitsNo.Checked = true
    //     }
    //     // colors are handled separately 
    //     this.petalColor.Color = udomain.domain.options.wizardColors[1]
    //     this.fruitColor.Color = udomain.domain.options.wizardColors[2]
    //     if (!this.selectFirstTdoInDrawGridWithStringInName(this.leafTdosDraw, udomain.domain.options.wizardTdoNames[1])) {
    //         // tdo choices are handled separately - if not found use defaults by type 
    //         this.selectFirstTdoInDrawGridWithStringInName(this.leafTdosDraw, "leaf")
    //     }
    //     if (!this.selectFirstTdoInDrawGridWithStringInName(this.petalTdosDraw, udomain.domain.options.wizardTdoNames[2])) {
    //         this.selectFirstTdoInDrawGridWithStringInName(this.petalTdosDraw, "petal")
    //     }
    //     if (!this.selectFirstTdoInDrawGridWithStringInName(this.sectionTdosDraw, udomain.domain.options.wizardTdoNames[3])) {
    //         this.selectFirstTdoInDrawGridWithStringInName(this.sectionTdosDraw, "section")
    //     }
    //     this.updateForButtonInteractions()
    // }
    
    // FormCreate(Sender: TObject): void {
    //     this.startPicture.Picture.Bitmap.Palette = UNRESOLVED.CopyPalette(umain.MainForm.paletteImage.Picture.Bitmap.Palette)
    //     this.wizardNotebook.Invalidate()
    //     // assumes there is no border
    //     this.progressDrawGrid.DefaultColWidth = this.progressDrawGrid.Width / this.progressDrawGrid.ColCount
    //     this.progressDrawGrid.Width = this.progressDrawGrid.DefaultColWidth * this.progressDrawGrid.ColCount
    //     this.progressDrawGrid.DefaultRowHeight = this.progressDrawGrid.Height
    //     this.setPageIndex(0)
    //     this.updateProgress()
    // }
    
    // destroy(): void {
    //     this.plant.free
    //     this.plant = null
    //     this.tdos.free
    //     this.tdos = null
    //     PdForm.prototype.destroy.call(this)
    // }
    
    // // -------------------------------------------------------------------------------------------- *tdos 
    // hintForTdosDrawGridAtPoint(aComponent: TComponent, aPoint: TPoint, cursorRect: TRect): string {
    //     raise "method hintForTdosDrawGridAtPoint had assigned to var parameter cursorRect not added to return -- fixup manually"
    //     let result = ""
    //     let grid: TDrawGrid
    //     let col: int
    //     let row: int
    //     let tdo: KfObject3D
        
    //     result = ""
    //     if ((aComponent === null) || (!(aComponent instanceof delphi_compatability.TDrawGrid))) {
    //         return result
    //     }
    //     grid = aComponent
    //     col, row = grid.MouseToCell(aPoint.X, aPoint.Y, col, row)
    //     if (grid === this.progressDrawGrid) {
    //         switch (col) {
    //             case kStart:
    //                 result = "start"
    //                 break
    //             case kMeristems:
    //                 result = "meristems"
    //                 break
    //             case kInternodes:
    //                 result = "internodes"
    //                 break
    //             case kLeaves:
    //                 result = "leaves"
    //                 break
    //             case kCompoundLeaves:
    //                 result = "compound leaves"
    //                 break
    //             case kFlowers:
    //                 result = "flowers"
    //                 break
    //             case kInflorescences:
    //                 result = "inflorescence drawing"
    //                 break
    //             case kInflorescencesPlacement:
    //                 result = "inflorescence placement"
    //                 break
    //             case kFruit:
    //                 result = "fruit"
    //                 break
    //             case kFinish:
    //                 result = "finish"
    //                 break
    //         }
    //     } else {
    //         tdo = this.tdoForIndex(col)
    //         if (tdo === null) {
    //             return result
    //         }
    //         result = tdo.getName()
    //     }
    //     // change hint if cursor moves out of the current item's rectangle 
    //     cursorRect = grid.CellRect(col, row)
    //     return result
    // }
    
    // changeTdoLibraryClick(Sender: TObject): void {
    //     this.loadNewTdoLibrary()
    //     this.leafTdosDraw.Invalidate()
    //     this.petalTdosDraw.Invalidate()
    //     this.sectionTdosDraw.Invalidate()
    // }
    
    // loadNewTdoLibrary(): void {
    //     let fileNameWithPath: string
        
    //     fileNameWithPath = usupport.getFileOpenInfo(usupport.kFileTypeTdo, udomain.domain.defaultTdoLibraryFileName, "Choose a 3D object library (tdo) file")
    //     if (fileNameWithPath === "") {
    //         return
    //     }
    //     udomain.domain.defaultTdoLibraryFileName = fileNameWithPath
    //     this.readTdosFromFile()
    // }
    
    // readTdosFromFile(): void {
    //     let newTdo: KfObject3D
    //     let inputFile: TextFile
        
    //     this.tdos.clear()
    //     if (udomain.domain === null) {
    //         return
    //     }
    //     if (!udomain.domain.checkForExistingDefaultTdoLibrary()) {
    //         MessageDialog("Because you didn't choose a 3D object library, you will only" + chr(13) + "be able to use a default 3D object on your new plant." + chr(13) + chr(13) + "You can also choose a 3D object library" + chr(13) + "by clicking the 3D Objects button in the wizard.", mtWarning, {mbOK, }, 0)
    //         return
    //     }
    //     AssignFile(inputFile, udomain.domain.defaultTdoLibraryFileName)
    //     try {
    //         // v1.5
    //         usupport.setDecimalSeparator()
    //         Reset(inputFile)
    //         while (!UNRESOLVED.eof(inputFile)) {
    //             newTdo = utdo.KfObject3D().create()
    //             newTdo.readFromFileStream(inputFile, utdo.kInTdoLibrary)
    //             this.tdos.Add(newTdo)
    //         }
    //     } finally {
    //         CloseFile(inputFile)
    //         this.leafTdosDraw.ColCount = this.tdos.Count
    //         this.petalTdosDraw.ColCount = this.tdos.Count
    //         this.sectionTdosDraw.ColCount = this.tdos.Count
    //     }
    // }
    
    // tdoForIndex(index: short): KfObject3D {
    //     let result = new KfObject3D()
    //     result = null
    //     if ((index >= 0) && (index <= this.tdos.Count - 1)) {
    //         result = utdo.KfObject3D(this.tdos.Items[index])
    //     }
    //     return result
    // }
    
    // leafTdosDrawDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
    //     this.drawCellInTdoDrawGrid(this.leafTdosDraw, Col, UNRESOLVED.gdSelected in State, Rect)
    // }
    
    // petalTdosDrawDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
    //     this.drawCellInTdoDrawGrid(this.petalTdosDraw, Col, UNRESOLVED.gdSelected in State, Rect)
    // }
    
    // sectionTdosDrawDrawCell(Sender: TObject, Col: int, Row: int, Rect: TRect, State: TGridDrawState): void {
    //     this.drawCellInTdoDrawGrid(this.sectionTdosDraw, Col, UNRESOLVED.gdSelected in State, Rect)
    // }
    
    // drawCellInTdoDrawGrid(grid: TDrawGrid, column: short, selected: boolean, rect: TRect): void {
    //     let tdo: KfObject3d
    //     let turtle: KfTurtle
    //     let bestPoint: TPoint
        
    //     if (!selected) {
    //         grid.Canvas.Brush.Color = delphi_compatability.clWhite
    //         grid.Canvas.Font.Color = UNRESOLVED.clBtnText
    //     } else {
    //         grid.Canvas.Brush.Color = UNRESOLVED.clHighlight
    //         grid.Canvas.Font.Color = UNRESOLVED.clHighlightText
    //     }
    //     grid.Canvas.FillRect(Rect)
    //     tdo = null
    //     tdo = this.tdoForIndex(column)
    //     if (tdo === null) {
    //         return
    //     }
    //     // draw tdo 
    //     turtle = uturtle.KfTurtle.defaultStartUsing()
    //     try {
    //         turtle.drawingSurface.pane = grid.Canvas
    //         turtle.setDrawOptionsForDrawingTdoOnly()
    //         // must be after pane and draw options set 
    //         turtle.reset()
    //         bestPoint = tdo.bestPointForDrawingAtScale(turtle, Point(Rect.left, Rect.top), Point(usupport.rWidth(Rect), usupport.rHeight(Rect)), 0.2)
    //         turtle.xyz(bestPoint.X, bestPoint.Y, 0)
    //         //turtle.xyz(rect.left + (rect.right - rect.left) div 2, rect.bottom - 5, 0);
    //         turtle.drawingSurface.recordingStart()
    //         //15);
    //         tdo.draw(turtle, 0.2, "", "", 0, 0)
    //         turtle.drawingSurface.recordingStop()
    //         turtle.drawingSurface.recordingDraw()
    //         turtle.drawingSurface.clearTriangles()
    //     } finally {
    //         uturtle.KfTurtle.defaultStopUsing()
    //     }
    // }
    
    // // ---------------------------------------------------------------------------------------- interactions 
    // updateForButtonInteractions(): void {
    //     let hadInflors: boolean
        
    //     // do all of these at once, because then you can do them after loading options at startup
    //     //    (it doesn't take very long) 
    //     // meristems 
    //     this.arrowSecondaryBranching.Visible = !this.branchNone.Down
    //     this.secondaryBranchingLabel.Enabled = !this.branchNone.Down
    //     this.secondaryBranchingYes.Enabled = !this.branchNone.Down
    //     this.secondaryBranchingNo.Enabled = !this.branchNone.Down
    //     this.arrowBranchAngle.Visible = !this.branchNone.Down
    //     this.branchAngleLabel.Enabled = !this.branchNone.Down
    //     this.branchAngleSmall.Enabled = !this.branchNone.Down
    //     this.branchAngleMedium.Enabled = !this.branchNone.Down
    //     this.branchAngleLarge.Enabled = !this.branchNone.Down
    //     // internodes 
    //     // leaves 
    //     // compound leaves 
    //     this.arrowLeafletsShape.Visible = !this.leafletsOne.Down
    //     this.leafletsShapeLabel.Enabled = !this.leafletsOne.Down
    //     this.leafletsPinnate.Enabled = !this.leafletsOne.Down
    //     this.leafletsPalmate.Enabled = !this.leafletsOne.Down
    //     this.arrowLeafletsSpacing.Visible = !this.leafletsOne.Down
    //     this.leafletSpacingLabel.Enabled = !this.leafletsOne.Down
    //     this.leafletSpacingClose.Enabled = !this.leafletsOne.Down
    //     this.leafletSpacingMedium.Enabled = !this.leafletsOne.Down
    //     this.leafletSpacingFar.Enabled = !this.leafletsOne.Down
    //     // inflor placement 
    //     hadInflors = this.plantHasInflorescences
    //     this.plantHasInflorescences = (!this.apicalInflorsNone.Down) || (!this.axillaryInflorsNone.Down)
    //     if (hadInflors !== this.plantHasInflorescences) {
    //         this.progressDrawGrid.Invalidate()
    //     }
    //     this.arrowApicalStalk.Visible = !this.apicalInflorsNone.Down
    //     this.apicalStalkLabel.Enabled = !this.apicalInflorsNone.Down
    //     this.apicalStalkVeryShort.Enabled = !this.apicalInflorsNone.Down
    //     this.apicalStalkShort.Enabled = !this.apicalInflorsNone.Down
    //     this.apicalStalkMedium.Enabled = !this.apicalInflorsNone.Down
    //     this.apicalStalkLong.Enabled = !this.apicalInflorsNone.Down
    //     this.apicalStalkVeryLong.Enabled = !this.apicalInflorsNone.Down
    //     this.arrowAxillaryStalk.Visible = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkLabel.Enabled = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkVeryShort.Enabled = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkShort.Enabled = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkMedium.Enabled = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkLong.Enabled = !this.axillaryInflorsNone.Down
    //     this.axillaryStalkVeryLong.Enabled = !this.axillaryInflorsNone.Down
    //     // inflor drawing 
    //     this.arrowInflorShape.Visible = !this.inflorFlowersOne.Down
    //     this.inflorShapeLabel.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapeSpike.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapeRaceme.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapePanicle.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapeUmbel.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapeCluster.Enabled = !this.inflorFlowersOne.Down
    //     this.inflorShapeHead.Enabled = !this.inflorFlowersOne.Down
    //     // flowers 
    //     // fruit 
    //     this.arrowFruitTdo.Visible = !this.showFruitsNo.Checked
    //     this.fruitTdoLabel.Enabled = !this.showFruitsNo.Checked
    //     this.sectionTdosDraw.Visible = !this.showFruitsNo.Checked
    //     this.sectionTdoSelectedLabel.Visible = !this.showFruitsNo.Checked
    //     this.arrowFruitSectionsNumber.Visible = !this.showFruitsNo.Checked
    //     this.fruitSectionsNumberLabel.Enabled = !this.showFruitsNo.Checked
    //     this.fruitSectionsOne.Enabled = !this.showFruitsNo.Checked
    //     this.fruitSectionsThree.Enabled = !this.showFruitsNo.Checked
    //     this.fruitSectionsFour.Enabled = !this.showFruitsNo.Checked
    //     this.fruitSectionsFive.Enabled = !this.showFruitsNo.Checked
    //     this.fruitSectionsTen.Enabled = !this.showFruitsNo.Checked
    //     this.arrowFruitScale.Visible = !this.showFruitsNo.Checked
    //     this.fruitScaleLabel.Enabled = !this.showFruitsNo.Checked
    //     this.fruitScaleTiny.Enabled = !this.showFruitsNo.Checked
    //     this.fruitScaleSmall.Enabled = !this.showFruitsNo.Checked
    //     this.fruitScaleMedium.Enabled = !this.showFruitsNo.Checked
    //     this.fruitScaleLarge.Enabled = !this.showFruitsNo.Checked
    //     this.fruitScaleHuge.Enabled = !this.showFruitsNo.Checked
    //     this.arrowFruitColor.Visible = !this.showFruitsNo.Checked
    //     this.fruitColorLabel.Enabled = !this.showFruitsNo.Checked
    //     this.fruitColor.Visible = !this.showFruitsNo.Checked
    //     this.fruitColorExplainLabel.Enabled = !this.showFruitsNo.Checked
    // }
    
    // branchNoneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // branchLittleClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // branchMediumClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // branchLotClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // leafletsOneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // leafletsThreeClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // leafletsFourClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // leafletsFiveClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // leafletsSevenClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersOneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersTwoClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersThreeClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersFiveClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersTenClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // inflorFlowersTwentyClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // apicalInflorsNoneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // apicalInflorsOneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // apicalInflorsTwoClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // apicalInflorsThreeClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // apicalInflorsFiveClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // axillaryInflorsNoneClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // axillaryInflorsThreeClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // axillaryInflorsFiveClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // axillaryInflorsTenClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // axillaryInflorsTwentyClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // showFruitsYesClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // showFruitsNoClick(Sender: TObject): void {
    //     this.updateForButtonInteractions()
    // }
    
    // // -------------------------------------------------------------------------------------------- transfer 
    // defaultChoicesClick(Sender: TObject): void {
    //     if (MessageDialog("Are you sure you want to set all the wizard choices to defaults?" + chr(13) + chr(13) + "This action is not undoable.", mtConfirmation, {mbYes, mbNo, }, 0) === delphi_compatability.IDNO) {
    //         return
    //     }
    //     this.setDownButtonForGroupIndexFromName(kMeristem_AlternateOrOpposite, "leavesAlternate")
    //     this.setDownButtonForGroupIndexFromName(kMeristem_BranchIndex, "branchNone")
    //     this.setDownButtonForGroupIndexFromName(kInternode_Curviness, "curvinessLittle")
    //     this.setDownButtonForGroupIndexFromName(kInternode_Length, "internodesMedium")
    //     this.setDownButtonForGroupIndexFromName(kInternode_Thickness, "internodeWidthThin")
    //     this.setDownButtonForGroupIndexFromName(kLeaves_Scale, "leafScaleMedium")
    //     this.setDownButtonForGroupIndexFromName(kLeaves_PetioleLength, "petioleMedium")
    //     this.setDownButtonForGroupIndexFromName(kLeaves_Angle, "leafAngleMedium")
    //     this.setDownButtonForGroupIndexFromName(kLeaflets_Number, "leafletsOne")
    //     this.setDownButtonForGroupIndexFromName(kInflorPlace_NumApical, "apicalInflorsNone")
    //     this.setDownButtonForGroupIndexFromName(kInflorPlace_NumAxillary, "axillaryInflorsNone")
    //     this.updateForButtonInteractions()
    //     if (this.wizardNotebook.PageIndex === kLastPanel) {
    //         this.drawPreview(kReloadVariables)
    //     }
    // }
    
    // selectFirstTdoInDrawGridWithStringInName(grid: TDrawGrid, aString: string): boolean {
    //     let result = false
    //     let indexToSelect: short
    //     let i: short
    //     let tdo: KfObject3D
    //     let gridRect: TGridRect
        
    //     // returns true if a tdo was selected 
    //     result = false
    //     indexToSelect = -1
    //     if (this.tdos.Count > 0) {
    //         for (i = 0; i <= this.tdos.Count - 1; i++) {
    //             tdo = utdo.KfObject3D(this.tdos.Items[i])
    //             if (tdo === null) {
    //                 return result
    //             }
    //             if (UNRESOLVED.pos(uppercase(aString), uppercase(tdo.getName())) > 0) {
    //                 indexToSelect = i
    //                 result = true
    //                 break
    //             }
    //         }
    //     }
    //     if (indexToSelect >= 0) {
    //         gridRect.left = indexToSelect
    //         gridRect.right = indexToSelect
    //         gridRect.top = 0
    //         gridRect.bottom = 0
    //         grid.Selection = gridRect
    //         grid.LeftCol = indexToSelect
    //         if (grid === this.leafTdosDraw) {
    //             this.showTdoNameInLabel(indexToSelect, this.leafTdoSelectedLabel)
    //         } else if (grid === this.petalTdosDraw) {
    //             this.showTdoNameInLabel(indexToSelect, this.petalTdoSelectedLabel)
    //         } else if (grid === this.sectionTdosDraw) {
    //             this.showTdoNameInLabel(indexToSelect, this.sectionTdoSelectedLabel)
    //         }
    //     }
    //     return result
    // }
    
    // setPlantVariables(): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.plant.defaultAllParameters()
    //     // set variables in plant based on options 
    //     this.finishForMeristems()
    //     this.finishForInternodes()
    //     this.finishForLeaves()
    //     this.finishForCompoundLeaves()
    //     this.finishForInflorescencePlacement()
    //     this.finishForInflorescences()
    //     this.finishForFlowers()
    //     this.finishForFruit()
    //     this.plant.setName(this.newPlantName.Text)
    //     this.plant.setAge(this.plant.pGeneral.ageAtMaturity)
    // }
    
    // saveOptionsToDomain(): void {
    //     let i: short
        
    //     for (i = 1; i <= udomain.kMaxWizardQuestions; i++) {
    //         udomain.domain.options.wizardChoices[i] = this.downButtonNameForGroupIndex(i)
    //     }
    //     // handle radio button choice separately 
    //     udomain.domain.options.wizardShowFruit = this.showFruitsYes.Checked
    //     udomain.domain.options.wizardColors[1] = this.petalColor.Color
    //     udomain.domain.options.wizardColors[2] = this.fruitColor.Color
    //     if (this.plant.pLeaf.leafTdoParams.object3D !== null) {
    //         udomain.domain.options.wizardTdoNames[1] = this.plant.pLeaf.leafTdoParams.object3D.getName()
    //     }
    //     if (this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D !== null) {
    //         // cfk do first petal only in wizard, right?
    //         udomain.domain.options.wizardTdoNames[2] = this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D.getName()
    //     }
    //     if (this.plant.pFruit.tdoParams.object3D !== null) {
    //         udomain.domain.options.wizardTdoNames[3] = this.plant.pFruit.tdoParams.object3D.getName()
    //     }
    // }
    
    // optionsHaveChanged(): boolean {
    //     let result = false
    //     let i: short
    //     let downButtonName: string
        
    //     result = false
    //     for (i = 1; i <= udomain.kMaxWizardQuestions; i++) {
    //         downButtonName = this.downButtonNameForGroupIndex(i)
    //         if (udomain.domain.options.wizardChoices[i] !== "") {
    //             result = result || (udomain.domain.options.wizardChoices[i] !== downButtonName)
    //         }
    //     }
    //     result = result || (udomain.domain.options.wizardShowFruit !== this.showFruitsYes.Checked)
    //     result = result || (udomain.domain.options.wizardColors[1] !== this.petalColor.Color)
    //     result = result || (udomain.domain.options.wizardColors[2] !== this.fruitColor.Color)
    //     result = result || this.tdoSelectionChanged
    //     return result
    // }
    
    // setDownButtonForGroupIndexFromName(aGroupIndex: short, aName: string): void {
    //     let i: short
    //     let button: TSpeedButton
        
    //     if (aName === "") {
    //         return
    //     }
    //     if (this.ComponentCount > 0) {
    //         for (i = 0; i <= this.ComponentCount - 1; i++) {
    //             if (!(this.Components[i] instanceof delphi_compatability.TSpeedButton)) {
    //                 continue
    //             }
    //             button = this.Components[i]
    //             if (button.GroupIndex === aGroupIndex) {
    //                 if (button.Name === aName) {
    //                     // only one can be down, so can exit when one is down 
    //                     button.Down = true
    //                     return
    //                 }
    //             }
    //         }
    //     }
    // }
    
    // downButtonNameForGroupIndex(aGroupIndex: short): string {
    //     let result = ""
    //     let i: short
    //     let button: TSpeedButton
        
    //     result = ""
    //     if (this.ComponentCount > 0) {
    //         for (i = 0; i <= this.ComponentCount - 1; i++) {
    //             if (!(this.Components[i] instanceof delphi_compatability.TSpeedButton)) {
    //                 continue
    //             }
    //             button = this.Components[i]
    //             if ((button.GroupIndex === aGroupIndex) && (button.Enabled)) {
    //                 if (button.Down) {
    //                     // if not enabled, don't want to match
    //                     // only one can be down, so can exit when one is down 
    //                     result = button.Name
    //                     return result
    //                 }
    //             }
    //         }
    //     }
    //     return result
    // }
    
    // // ------------------------------------------------------------------------------------------- *preview 
    // drawPreview(reloadVariables: boolean): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     if (reloadVariables) {
    //         this.setPlantVariables()
    //     }
    //     try {
    //         // always update cache in case any params have changed 
    //         ucursor.cursor_startWait()
    //         // want nice drawing here, only case
    //         this.plant.useBestDrawingForPreview = true
    //         this.plant.drawPreviewIntoCache(Point(this.previewPaintBox.Width, this.previewPaintBox.Height), uplant.kDontConsiderDomainScale, umain.kDrawNow)
    //         this.plant.previewCache.Transparent = false
    //     } finally {
    //         ucursor.cursor_stopWait()
    //     }
    //     this.previewPaintBox.Invalidate()
    // }
    
    // previewPaintBoxPaint(Sender: TObject): void {
    //     if ((this.plant !== null) && (this.plant.previewCache !== null)) {
    //         ubmpsupport.copyBitmapToCanvasWithGlobalPalette(this.plant.previewCache, this.previewPaintBox.Canvas, Rect(0, 0, 0, 0))
    //     }
    // }
    
    // randomizePlantClick(Sender: TObject): void {
    //     this.plant.randomize()
    //     this.drawPreview(kDontReloadVariables)
    // }
    
    // turnLeftClick(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.plant.xRotation = this.plant.xRotation - 10
    //     if (this.plant.xRotation < -360) {
    //         this.plant.xRotation = 360
    //     }
    //     this.drawPreview(kDontReloadVariables)
    // }
    
    // turnRightClick(Sender: TObject): void {
    //     if (this.plant === null) {
    //         return
    //     }
    //     this.plant.xRotation = this.plant.xRotation + 10
    //     if (this.plant.xRotation > 360) {
    //         this.plant.xRotation = -360
    //     }
    //     this.drawPreview(kDontReloadVariables)
    // }
    
    // // -------------------------------------------------------------------------------------------- buttons/notebook 
    // setPageIndex(newIndex: short): void {
    //     this.wizardNotebook.PageIndex = newIndex
    // }
    
    // backClick(Sender: TObject): void {
    //     if (this.wizardNotebook.PageIndex > 0) {
    //         if (this.wizardNotebook.PageIndex === kFinish) {
    //             if (this.plantHasInflorescences) {
    //                 this.setPageIndex(kFruit)
    //             } else {
    //                 this.setPageIndex(kInflorescencesPlacement)
    //             }
    //         } else {
    //             this.setPageIndex(this.wizardNotebook.PageIndex - 1)
    //         }
    //     }
    //     this.updateProgress()
    // }
    
    // nextClick(Sender: TObject): void {
    //     if (this.wizardNotebook.PageIndex < kLastPanel) {
    //         if (this.wizardNotebook.PageIndex === kInflorescencesPlacement) {
    //             if (this.plantHasInflorescences) {
    //                 this.setPageIndex(kInflorescences)
    //             } else {
    //                 this.setPageIndex(kFinish)
    //             }
    //         } else {
    //             this.setPageIndex(this.wizardNotebook.PageIndex + 1)
    //         }
    //         this.updateProgress()
    //     } else {
    //         this.setPlantVariables()
    //         this.saveOptionsToDomain()
    //         this.plant.shrinkPreviewCache()
    //         this.ModalResult = mrOK
    //     }
    // }
    
    // cancelClick(Sender: TObject): void {
    //     this.ModalResult = mrCancel
    // }
    
    // FormClose(Sender: TObject, Action: TCloseAction): void {
    //     let response: int
        
    //     if ((this.optionsHaveChanged()) && (this.ModalResult === mrCancel)) {
    //         // same as cancel, but if they click cancel on dialog, we must change action
    //         response = MessageDialog("Do you want to save the changes you made" + chr(13) + "to the wizard options?", mtConfirmation, {mbYes, mbNo, mbCancel, }, 0)
    //         switch (response) {
    //             case delphi_compatability.IDYES:
    //                 this.saveOptionsToDomain()
    //                 Action = delphi_compatability.TCloseAction.caFree
    //                 break
    //             case delphi_compatability.IDNO:
    //                 Action = delphi_compatability.TCloseAction.caFree
    //                 break
    //             case delphi_compatability.IDCANCEL:
    //                 Action = delphi_compatability.TCloseAction.caNone
    //                 break
    //         }
    //     }
    // }
    
    // updateProgress(): void {
    //     this.progressDrawGrid.Invalidate()
    //     this.progressDrawGrid.Refresh()
    //     if (this.wizardNotebook.PageIndex === kLastPanel) {
    //         this.previewPaintBox.Visible = false
    //         delphi_compatability.Application.ProcessMessages()
    //         this.drawPreview(kReloadVariables)
    //         this.previewPaintBox.Visible = true
    //     }
    // }
    
    // progressDrawGridDrawCell(Sender: TObject, Col: long, Row: long, Rect: TRect, State: TGridDrawState): void {
    //     let bitmap: TBitmap
    //     let bitmapRect: TRect
        
    //     // need this to make bitmaps come on as transparent
    //     this.progressDrawGrid.Canvas.Brush.Color = UNRESOLVED.clBtnFace
    //     this.progressDrawGrid.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psClear
    //     this.progressDrawGrid.Canvas.FillRect(Rect)
    //     bitmap = this.bitmapForProgressPage(Col)
    //     bitmapRect.Left = Rect.left + usupport.rWidth(Rect) / 2 - bitmap.Width / 2
    //     bitmapRect.Right = bitmapRect.Left + bitmap.Width
    //     bitmapRect.Top = Rect.top + usupport.rHeight(Rect) / 2 - bitmap.Height / 2
    //     bitmapRect.Bottom = bitmapRect.Top + bitmap.Height
    //     if (bitmap !== null) {
    //         this.progressDrawGrid.Canvas.Draw(bitmapRect.Left, bitmapRect.Top, bitmap)
    //     }
    //     if (Col === this.wizardNotebook.PageIndex) {
    //         this.progressDrawGrid.Canvas.Pen.Color = delphi_compatability.clRed
    //         this.progressDrawGrid.Canvas.Pen.Style = delphi_compatability.TFPPenStyle.psSolid
    //         this.progressDrawGrid.Canvas.Brush.Style = delphi_compatability.TFPBrushStyle.bsClear
    //         //FIX unresolved WITH expression: Rect
    //         this.progressDrawGrid.Canvas.Rectangle(this.Left, this.Top, UNRESOLVED.right, UNRESOLVED.bottom)
    //     }
    // }
    
    // bitmapForProgressPage(page: short): TBitmap {
    //     let result = new TBitmap()
    //     result = null
    //     switch (page) {
    //         case kStart:
    //             result = this.startPageImage.Picture.Bitmap
    //             break
    //         case kMeristems:
    //             result = this.meristemsPageImage.Picture.Bitmap
    //             break
    //         case kInternodes:
    //             result = this.internodesPageImage.Picture.Bitmap
    //             break
    //         case kLeaves:
    //             result = this.leavesPageImage.Picture.Bitmap
    //             break
    //         case kCompoundLeaves:
    //             result = this.compoundLeavesPageImage.Picture.Bitmap
    //             break
    //         case kInflorescencesPlacement:
    //             result = this.inflorPlacePageImage.Picture.Bitmap
    //             break
    //         case kInflorescences:
    //             if (this.plantHasInflorescences) {
    //                 result = this.inflorDrawPageImage.Picture.Bitmap
    //             } else {
    //                 result = this.inflorDrawPageImageDisabled.Picture.Bitmap
    //             }
    //             break
    //         case kFlowers:
    //             if (this.plantHasInflorescences) {
    //                 result = this.flowersPageImage.Picture.Bitmap
    //             } else {
    //                 result = this.flowersPageImageDisabled.Picture.Bitmap
    //             }
    //             break
    //         case kFruit:
    //             if (this.plantHasInflorescences) {
    //                 result = this.fruitsPageImage.Picture.Bitmap
    //             } else {
    //                 result = this.fruitsPageImageDisabled.Picture.Bitmap
    //             }
    //             break
    //         case kFinish:
    //             result = this.finishPageImage.Picture.Bitmap
    //             break
    //     }
    //     return result
    // }
    
    // progressDrawGridSelectCell(Sender: TObject, Col: long, Row: long, CanSelect: boolean): void {
    //     if (((Col === kInflorescences) || (Col === kFlowers) || (Col === kFruit)) && (!this.plantHasInflorescences)) {
    //         CanSelect = false
    //     } else {
    //         this.setPageIndex(Col)
    //         this.updateProgress()
    //     }
    //     return CanSelect
    // }
    
    // wizardNotebookPageChanged(Sender: TObject): void {
    //     switch (this.wizardNotebook.PageIndex) {
    //         case 0:
    //             this.back.Enabled = false
    //             this.next.Enabled = true
    //             this.next.Caption = "&Next >"
    //             break
    //         case kLastPanel:
    //             this.back.Enabled = true
    //             this.next.Caption = "&Finish"
    //             break
    //         default:
    //             this.back.Enabled = true
    //             this.next.Enabled = true
    //             this.next.Caption = "&Next >"
    //             break
    //     }
    // }
    
    // petalColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.petalColor.Color = udomain.domain.getColorUsingCustomColors(this.petalColor.Color)
    // }
    
    // fruitColorMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
    //     this.fruitColor.Color = udomain.domain.getColorUsingCustomColors(this.fruitColor.Color)
    // }
    
    // leafTdosDrawSelectCell(Sender: TObject, Col: int, Row: int, CanSelect: boolean): void {
    //     if ((Col !== this.leafTdosDraw.Selection.left)) {
    //         this.tdoSelectionChanged = true
    //         this.showTdoNameInLabel(Col, this.leafTdoSelectedLabel)
    //     }
    //     return CanSelect
    // }
    
    // petalTdosDrawSelectCell(Sender: TObject, Col: int, Row: int, CanSelect: boolean): void {
    //     if ((Col !== this.petalTdosDraw.Selection.left)) {
    //         this.tdoSelectionChanged = true
    //         this.showTdoNameInLabel(Col, this.petalTdoSelectedLabel)
    //     }
    //     return CanSelect
    // }
    
    // sectionTdosDrawSelectCell(Sender: TObject, Col: int, Row: int, CanSelect: boolean): void {
    //     if ((Col !== this.sectionTdosDraw.Selection.left)) {
    //         this.tdoSelectionChanged = true
    //         this.showTdoNameInLabel(Col, this.sectionTdoSelectedLabel)
    //     }
    //     return CanSelect
    // }
    
    // sectionTdosDrawMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
    //     //var col, row: integer;
    //     //sectionTdosDraw.mouseToCell(x, y, col, row);
    //     //if (col <> sectionTdosDraw.selection.left) then
    //     //  self.showTdoNameInLabel(col, sectionTdoSelectedLabel);
    // }
    
    // showTdoNameInLabel(index: short, aLabel: TLabel): void {
    //     let tdo: KfObject3D
        
    //     tdo = null
    //     if ((index >= 0) && (index <= this.tdos.Count - 1)) {
    //         tdo = utdo.KfObject3D(this.tdos.Items[index])
    //     }
    //     if (tdo !== null) {
    //         aLabel.Caption = tdo.getName()
    //     } else {
    //         aLabel.Caption = ""
    //     }
    // }
    
    // helpButtonClick(Sender: TObject): void {
    //     delphi_compatability.Application.HelpJump("Making_a_new_plant_with_the_wizard")
    // }
    
    // FormKeyPress(Sender: TObject, Key: char): void {
    //     Key = usupport.makeEnterWorkAsTab(this, this.ActiveControl, Key)
    //     return Key
    // }

    defaultAllChoices() {
        choiceSpecs.forEach(spec => {
            if (spec.type !== "page") {
                this.wizardChoices[spec.id] = spec.initialValue
                spec.setValue(this.plant, spec.values[spec.options.indexOf(spec.initialValue)], this)
                // TODO Development: Used to verify a mistake was not made in options not matching values
                if (spec.options.length !== spec.values.length) {
                    alert("options and values configuration error")
                    throw new Error("options and values configuration error")
                }
            }
        })
    }

    viewPage(pageSpec: PageSpec) {
        return m("div.bt.b5.mt2",
            m("div.b.mt1.mb1", pageSpec.title || "FIXME: " + pageSpec.id),
            m("div", pageSpec.topText),
            pageSpec.bottomText && m("div.pt2", pageSpec.bottomText),
        )
    }

    viewChoice(choiceSpec: ChoiceSpec) {
        return m("div.mt2",
            m("div.mb1", m("span.green", "🞂 "), choiceSpec.label || "FIXME: " + choiceSpec.id),
            // TODO: Should rethink as buttons or in some other way to make keyboard accessible
            m("div.flex.f7.ml3", choiceSpec.options.map((option, optionIndex) => 
                m("div.ba.bw2" + (this.wizardChoices[choiceSpec.id] === option ? ".b--black" : ".b--white"),
                    {
                        style: { backgroundColor: 
                            choiceSpec.type === "color" 
                                ? choiceSpec.values[optionIndex]
                                : "#c0c0c0" 
                        },
                        onclick: () => {
                            this.wizardChoices[choiceSpec.id] = option
                            choiceSpec.setValue(this.plant, choiceSpec.values[optionIndex], this)
                        }
                    },
                    choiceSpec.type !== "color" && m("img", { src: fileForImage(choiceSpec.id, option), alt: option }),
                    m("br"),
                    m("span", { style: choiceSpec.type === "color" ? "background-color: white": undefined }, option)
                )
            )),
            choiceSpec.type === "tdo" ? m("div.ba.ma1", "UNFINISHED TDO CHOOSER") : undefined,
        )
    }

    previewSize = 400

    view(vnode: any) {
        const plant = this.plant
        vnode.attrs.setPlant(plant)
        const self = this
        return m("div",
            "Plant Wizard",
            choiceSpecs.map(spec => spec.type === "page"
                ? this.viewPage(spec)
                : this.viewChoice(spec)
            ),
            // m("canvas.ba", {
            //     width: "" + self.previewSize + "px",
            //     height: "" + self.previewSize + "px",
            //     oncreate(vnode: m.VnodeDOM) {
            //         const canvas = <HTMLCanvasElement>vnode.dom
            //         canvas.width = self.previewSize
            //         canvas.height = self.previewSize
            //         const context = canvas.getContext("2d")
            //         if (!context) return
            //         plant.drawOn(context)
            //     },
            //     onupdate(vnode: m.VnodeDOM) {
            //         const canvas = <HTMLCanvasElement>vnode.dom
            //         // Clear the canvas
            //         canvas.width = canvas.width
            //         const context = canvas.getContext("2d")
            //         if (!context) return
            //         plant.drawOn(context)
            //     },
            // }),
        )
    }
    
}

function fileForImage(id: string, option: string) {
    if (option === "one (simple)") { option = "one"}
    return "../source/resources/WizardForm_" + id + option.split(" ").map(word => capitalize(word)).join("") + ".png"
}

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}
