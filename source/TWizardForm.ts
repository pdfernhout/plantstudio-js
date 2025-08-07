// unit uwizard

import * as m from "mithril"
import { AssignFile, CloseFile, imageDir, Reset } from "./common"
import { CompoundLeafStyle, FloralPart, Gender, LeafArrangement, PdPlant } from "./PdPlant"
import { darkerColor, messageForExceptionType } from "./usupport"
import { domain } from "./PdDomain"
import { KfObject3D } from "./KfObject3D"
import { KfTurtle } from "./KfTurtle"
import { incrementNumPlantsCreatedThisSession } from "./updcom"

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

type PageSpec = {
    id: string
    disabled?: (id: string, plant: PdPlant, form: TWizardForm) => boolean
    title: string
    image: string
    icon: string
    iconDisabled?: string
    topText: string
    bottomView?: (plant: PdPlant, form: TWizardForm) => any
    type: "page"
}

type ChoiceSpec = {
    id: string
    disabled?: (id: string, plant: PdPlant, form: TWizardForm) => boolean
    options: string[]
    values: any[]
    getValue?: (plant: PdPlant) => any
    setValue: (plant: PdPlant, value: any, form: TWizardForm) => void
    initialValue: string
    label: string
    type?: "tdo" | "color"
}

const pageAndChoiceSpecs: (PageSpec | ChoiceSpec)[] = [
    {
        id: "page1",
        title: "Start",
        image: "WizardForm_startPicture.png",
        icon: "WizardForm_startPageImage.png",
        topText: "Welcome to the Plant Wizard! " +
            "This wizard will help you create a new plant by asking you some simple questions. " +
            "Here are about 25 questions based on the most important of the 400 or so parameters that define a plant. " +
            "For each question, click on one of the big buttons under the question to make your choice.",
        // "Note: If you are using the wizard for the first time, we recommend turning on the 'Long Button Hints'. Each wizard question has a hint.",
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["branch"] === "none",
        options: ["no", "yes"],
        values: [false, true],
        setValue: (plant: PdPlant, value: any) => plant.pMeristem.secondaryBranchingIsAllowed = value,
        initialValue: "no",
        label: "Should secondary branching (off branches) occur?"
    },
    {
        id: "branchAngle",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["branch"] === "none",
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
        type: "page"
    },

    {
        id: "leafTdos",
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            if (value) {
                plant.pLeaf.leafTdoParams.object3D.copyFrom(value)
            }
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["leafletsNumber"] === "one (simple)",
        options: ["pinnate", "palmate"],
        values: [CompoundLeafStyle.kCompoundLeafPinnate, CompoundLeafStyle.kCompoundLeafPalmate],
        setValue: (plant: PdPlant, value: any) => plant.pLeaf.compoundPinnateOrPalmate = value,
        initialValue: "pinnate",
        label: "What shape should the compound leaves take?"
    },
    {
        id: "leafletSpacing",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["leafletsNumber"] === "one (simple)",
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
        topText: "An inflorescence holds flowers and fruits on a plant. Since most plants have hermaphroditic flowers (with both male and female parts), the wizard creates only primary (female or hermaphroditic) flowers. ",
        bottomView: () => m("div",
            m("div",
                m("img", {src: imageDir + "WizardForm_apicalInflorExtraImage.png", alt: "Apical infloresences example" }), 
                "Apical inflorescences are at the ends (apexes) of plant stems."
            ),
            m("div",
                m("img", {src: imageDir + "WizardForm_axillaryInflorExtraImage.png", alt: "Axillary infloresences example" }),
                "Axillary inflorescences are in the angles between leaf and stem (axils)."
            )
        ),
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["apicalInflors"] === "none",
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["axillaryInflors"] === "none",
        options: ["very short", "short", "medium", "long", "very long"],
        values: [1, 5, 10, 15, 40],
        setValue: (plant: PdPlant, value: any) => plant.pInflor[Gender.kGenderFemale].peduncleLength_mm = value,
        initialValue: "medium",
        label: "How long should their axillary (lateral) stems be?"
    },

    ///////////////////////////////////

    {
        id: "page7",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        title: "Inflorescences", // "Inflorescence drawing"
        image: "",
        icon: "WizardForm_inflorDrawPageImage.png",
        iconDisabled: "WizardForm_inflorDrawPageImageDisabled.png",
        topText: "Inflorescences can have a large variety of shapes, a few of which are shown here. We extend the true meaning of \"inflorescence\" a bit to use an inflorescence when there is only one flower. ",
        type: "page"
    },

    {
        id: "inflorFlowers",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: ["one", "two", "three", "five", "ten", "twenty"],
        values: [1, 2, 3, 5, 10, 20],
        setValue: (plant: PdPlant, value: any, form: TWizardForm) => {
            form.inflorFlowers = value
            adjustFlowersForChanges(plant, form.inflorFlowers, form.inflorShape)
        },
        initialValue: "one", // If you change this, you mist also change form.inflorFlowers initializer
        label: "How many flowers should each inflorescence have?"
    },
    {
        id: "inflorShape",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) =>  hasNoInflorescences(plant) || form.wizardChoices["inflorFlowers"] === "one",
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: ["very thin", "thin", "medium", "thick", "very thick"],
        values: [0.5, 1, 2, 3, 10],
        setValue: (plant: PdPlant, value: any) => plant.pInflor[Gender.kGenderFemale].internodeWidth_mm = value,
        initialValue: "medium",
        label: "How thick should each inflorescence stem be?"
    },

    ///////////////////////////////////

    {
        id: "page8",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        title: "Flowers",
        image: "",
        icon: "WizardForm_flowersPageImage.png",
        iconDisabled: "WizardForm_flowersPageImageDisabled.png",
        topText: "Like leaves, flowers are drawn using a 3D object. But here the 3D object represents only one petal of the flower. A number of petals is drawn rotated around a center to produce what looks like a flower.",
        type: "page"
    },

    {
        id: "petalTdos",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            // TODO: FIXME for setting TDO
            // tdo = this.tdoForIndex(this.petalTdosDraw.Selection.left)
            // if ((tdo !== null) && (this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D !== null)) {
            //     // cfk first petals again
            //     this.plant.pFlower[Gender.kGenderFemale].tdoParams[uplant.kFirstPetals].object3D.copyFrom(tdo)
            // }
            if (value) {
                plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].object3D.copyFrom(value)
            }
        },
        initialValue: "",
        label: "What 3D object should be used for a flower petal?",
        type: "tdo"
    },
    {
        id: "petals",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: ["one", "three", "four", "five", "ten"],
        values: [1, 3, 4, 5, 10],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].repetitions = value,
        initialValue: "five",
        label: "How many flower petals should a flower have?"
    },
    {
        id: "petalScale",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: ["tiny", "small", "medium", "large", "huge"],
        values: [4, 10, 20, 30, 60],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].tdoParams[FloralPart.kFirstPetals].scaleAtFullSize = value,
        initialValue: "medium",
        label: "How big should a flower petal be drawn?"
    },
    {
        id: "petalColor",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
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
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        title: "Fruits",
        image: "",
        icon: "WizardForm_fruitsPageImage.png",
        iconDisabled: "WizardForm_fruitsPageImageDisabled.png",
        topText: "Fruits are drawn like flowers, but with a portion of the fruit (a \"fruit section\") rotated around instead of a petal. For many plants you will not be interested in the fruit, so you can turn fruits off entirely.",
        type: "page"
    },

    {
        id: "showFruits",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => hasNoInflorescences(plant),
        options: ["no", "yes"],
        values: [200, 3],
        setValue: (plant: PdPlant, value: any) => plant.pFlower[Gender.kGenderFemale].minDaysBeforeSettingFruit = value,
        initialValue: "no",
        label: "Do you want to see fruits on your plant?"
    },
    {
        id: "fruitTdo",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["showFruits"] === "no" || hasNoInflorescences(plant),
        options: [],
        values: [],
        setValue: (plant: PdPlant, value: any) => {
            // TODO: FIXME for TDOs
            // tdo = this.tdoForIndex(this.sectionTdosDraw.Selection.left)
            // if ((tdo !== null) && (this.plant.pFruit.tdoParams.object3D !== null)) {
            //     this.plant.pFruit.tdoParams.object3D.copyFrom(tdo)
            // }
            if (value) {
                plant.pFruit.tdoParams.object3D.copyFrom(value)
            }
        },
        initialValue: "",
        label: "What 3D object should be used to draw each fruit section?",
        type: "tdo"
    },
    {
        id: "fruitSections",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["showFruits"] === "no" || hasNoInflorescences(plant),
        options: ["one", "three", "four", "five", "ten"],
        values: [1, 3, 4, 5, 10],
        setValue: (plant: PdPlant, value: any) => plant.pFruit.tdoParams.repetitions = value,
        initialValue: "one",
        label: "How many fruit sections should be used to draw the fruit?"
    },
    {
        id: "fruitScale",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["showFruits"] === "no" || hasNoInflorescences(plant),
        options: ["tiny", "small", "medium", "large", "huge"],
        values: [4, 10, 20, 30, 60],
        setValue: (plant: PdPlant, value: any) => plant.pFruit.tdoParams.scaleAtFullSize = value,
        initialValue: "medium",
        label: "How big should fruit sections be drawn?"
    },
    {
        id: "fruitColor",
        disabled: (id: string, plant: PdPlant, form: TWizardForm) => form.wizardChoices["showFruits"] === "no" || hasNoInflorescences(plant),
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
        title: "Finish",
        image: "",
        icon: "WizardForm_finishPageImage.png",
        topText: "Congratulations! " +
            "You have finished designing your new plant. You can name your new plant here, or just keep this name. " +
            "Now click Finish to place your plant in the main window, or click Cancel to stop without creating a plant. " +
            "Once your plant is made, you can fine-tune the parameters that define your plant in the Parameters panel in the main window. ",
        bottomView: (plant: PdPlant, form: TWizardForm) => m("div",
            "Plant name: ",
            m("input", { 
                value: plant.name, 
                oninput: (event: any) => plant.name = event.target.value 
            })
        ),
        type: "page"
    },

    // TODO: Plant preview pane / previewPanel / 213 x 251

    // TODO: Plant name edit field / newPlantName

    // TODO: Randomize button / caption("&Randomize") / randomizePlantClick

    // TODO: Rotate left and right buttons / turnLeftClick / turnRightClick
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

// TODO: Need to add hints

// group indexes 
export class TWizardForm {
    
    // randomizePlant: TButton = new TButton()

    // longHintsSuggestionLabel: TLabel = new TLabel()

    // helpButton: TSpeedButton = new TSpeedButton()

    // changeTdoLibrary: TSpeedButton = new TSpeedButton()

    plant: PdPlant = new PdPlant()

    // tdos: TListCollection = new TListCollection()
    // tdoSelectionChanged: boolean = false
    // askedToSaveOptions: boolean = false

    wizardChoices: { [id: string] : string } = {}

    // Need to store some flower choices in form as they are used to calculate ingterdependent things in plant 
    inflorFlowers: number = 1
    inflorShape: string = "spike"
    setPlantCallback: ((plant: PdPlant) => void) | undefined = undefined

    constructor() {
        const plant = this.plant
        plant.defaultAllParameters()
        plant.basePoint_mm.x = 200
        plant.basePoint_mm.y = 300
        plant.age = 90
        plant.setName("New plant " + (incrementNumPlantsCreatedThisSession()))
        this.defaultAllChoices()
        plant.regrow()
    }

    // //$R *.DFM
    // // panels 
    // // -------------------------------------------------------------------------------------------- creation/destruction 
    // create(AOwner: TComponent): void {
    //     let i: short
        
    //     PdForm.prototype.create.call(this, AOwner)
    //     this.leafTdoSelectedLabel.Caption = ""
    //     this.petalTdoSelectedLabel.Caption = ""
    //     this.sectionTdoSelectedLabel.Caption = ""
    //     this.previewPaintBox = ubitmap.PdPaintBox().Create(this)
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
    //         cursor_startWait()
    //         // want nice drawing here, only case
    //         this.plant.useBestDrawingForPreview = true
    //         this.plant.drawPreviewIntoCache(Point(this.previewPaintBox.Width, this.previewPaintBox.Height), uplant.kDontConsiderDomainScale, umain.kDrawNow)
    //         this.plant.previewCache.Transparent = false
    //     } finally {
    //         cursor_stopWait()
    //     }
    //     this.previewPaintBox.Invalidate()
    // }
    
    // previewPaintBoxPaint(Sender: TObject): void {
    //     if ((this.plant !== null) && (this.plant.previewCache !== null)) {
    //         ubmpsupport.copyBitmapToCanvas(this.plant.previewCache, this.previewPaintBox.Canvas, Rect(0, 0, 0, 0))
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
    
    // helpButtonClick(Sender: TObject): void {
    //     delphi_compatability.Application.HelpJump("Making_a_new_plant_with_the_wizard")
    // }
    
    defaultAllChoices() {
        pageAndChoiceSpecs.forEach(spec => {
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
        this.plant.setAge(this.plant.pGeneral.ageAtMaturity)
    }

    viewPage(pageSpec: PageSpec) {
        const disabled = pageSpec.disabled && pageSpec.disabled(pageSpec.id, this.plant, this)
        const imageFileName = pageSpec.image ? imageDir + pageSpec.image : ""
        return m("div.bt.b5.mt2" + (disabled ? ".disabled" : ""),
            m("div.b.mt1.mb1.flex", m("img.mr1", { 
                src: imageDir + (disabled ? (pageSpec.iconDisabled || pageSpec.icon) : pageSpec.icon),
                width: "32px",
            }), pageSpec.title || "FIXME: " + pageSpec.id),
            imageFileName
                ? m("div.flex", 
                    m("img", { src: imageFileName, alt: "Picture of bouquet of plants"}), 
                    m("div.ml2", pageSpec.topText)
                )
                : m("div", pageSpec.topText),
            pageSpec.bottomView && m("div.pt2", pageSpec.bottomView(this.plant, this)),
        )
    }

    viewChoice(choiceSpec: ChoiceSpec) {
        if (choiceSpec.type === "tdo") {
            choiceSpec.options = domain.defaultTdoLibrary.map(tdo => tdo.name)
            choiceSpec.values = domain.defaultTdoLibrary.map(tdo => tdo)
        }
        const disabled = choiceSpec.disabled && choiceSpec.disabled(choiceSpec.id, this.plant, this)
        return m("div.mt2" + (disabled ? ".disabled" : ""),
            m("div.mb1", m("span.green" + (disabled ? ".hidden" : ""), "🞂 "), choiceSpec.label || "FIXME: " + choiceSpec.id),
            m("div.flex.f7.ml3.mw-100.overflow-auto", choiceSpec.options.map((option, optionIndex) => 
                m("div.ba.bw2.flex.flex-column.pt1" + ((!disabled && this.wizardChoices[choiceSpec.id] === option) ? ".b--green" : ".b--white"),
                    {
                        tabindex: !disabled ? "0" : "-1",
                        style: { backgroundColor: 
                            choiceSpec.type === "color" 
                                ? choiceSpec.values[optionIndex]
                                :  choiceSpec.type === "tdo"
                                    ? "white"
                                    : "#c0c0c0" 
                        },
                        onclick: () => {
                            this.wizardChoices[choiceSpec.id] = option
                            choiceSpec.setValue(this.plant, choiceSpec.values[optionIndex], this)
                            this.setPlantCallback!(this.plant)
                        },
                        onkeyup: (event: any) => {
                            if (event.keyCode === 13) {
                                this.wizardChoices[choiceSpec.id] = option
                                choiceSpec.setValue(this.plant, choiceSpec.values[optionIndex], this)
                                this.setPlantCallback!(this.plant) 
                            }
                            // TODO: Trying to use arrow keys to navigate within a row
                            // tabindex: (!disabled && this.wizardChoices[choiceSpec.id] === option) ? "0" : "-1",
                            // else if (event.keyCode === 37 || event.key === "ArrowLeft") {
                            //     this.wizardChoices[choiceSpec.id] = choiceSpec.options[(optionIndex - 1 + choiceSpec.options.length) % choiceSpec.options.length]
                            // } else if (event.keyCode === 39 || event.key === "ArrowRight") {
                            //     this.wizardChoices[choiceSpec.id] = choiceSpec.options[(optionIndex + 1) % choiceSpec.options.length]
                            // }
                        }
                    },
                    !choiceSpec.type && m("img.center", { src: fileForImage(choiceSpec.id, option), alt: option }),
                    choiceSpec.type === "color" && m("div.mt1.h1"),
                    choiceSpec.type === "tdo" && m("div.mt1", this.viewTdo(choiceSpec.values[optionIndex] as KfObject3D)),
                    m("span", { style: choiceSpec.type === "color" ? "background-color: white": undefined }, option)
                )
            )),
        )
    }

    updatePlant() {
        this.setPlantCallback && this.setPlantCallback(this.plant)
    }
    
    viewTdo(tdo: KfObject3D) {
        const self = this
        return m("canvas.ba", {
            style: { 
                height: "64px",
                width: "64px",
                minHeight: "64px",
                minWidth: "64px"
            },
            oncreate(vnode: m.VnodeDOM) {
                const canvas = <HTMLCanvasElement>vnode.dom
                canvas.width = 64
                canvas.height = 64
                const context = canvas.getContext("2d")
                if (!context) return
                self.drawTdo(tdo, context)
            },
            onupdate(vnode: m.VnodeDOM) {
                const canvas = <HTMLCanvasElement>vnode.dom
                // Clear the canvas
                canvas.width = canvas.width
                const context = canvas.getContext("2d")
                if (!context) return
                self.drawTdo(tdo, context)
            }
        })
    }

    drawTdo(tdo: KfObject3D, context: CanvasRenderingContext2D): void {
        const turtle = KfTurtle.defaultStartUsing()
        try {
            turtle.drawingSurface.pane = context
            turtle.setDrawOptionsForDrawingTdoOnly()
            // must be after pane and draw options set 
            turtle.reset()
            turtle.xyz(32, 54, 0)
            try {
                turtle.push()
                turtle.rotateY(0)
                turtle.drawingSurface.recordingStart()
                tdo.draw(turtle, 0.20, "", "", 0, 0)
                turtle.drawingSurface.recordingStop()
                turtle.drawingSurface.recordingDraw()
                turtle.drawingSurface.clearTriangles()
                turtle.pop()
            } catch (e: any) {
                messageForExceptionType(e, "TWizardForm.drawTdo")
            }
        } finally {
            KfTurtle.defaultStopUsing()
        }
    }

    oninit(vnode: any) {
        const plant = this.plant
        this.setPlantCallback = vnode.attrs.setPlant
        this.setPlantCallback!(plant)
    }

    view(vnode: any) {
        // const plant = this.plant
        // vnode.attrs.setPlant(plant)
        const self = this
        return m("div",
            "Plant Wizard",
            pageAndChoiceSpecs.map(spec => spec.type === "page"
                ? this.viewPage(spec)
                : this.viewChoice(spec)
            )
        )
    }
    
}

function fileForImage(id: string, option: string) {
    if (option === "one (simple)") { option = "one"}
    return imageDir + "WizardForm_" + id + option.split(" ").map(word => capitalize(word)).join("") + ".png"
}

function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}
