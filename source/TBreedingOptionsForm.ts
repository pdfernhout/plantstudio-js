// unit Ubrdopt
import * as m from "mithril"
import { domain, DomainOptionsStructure } from "./PdDomain"
import { BreedingAndTimeSeriesOptionsStructure, FromPlant, kMutation, kWeight } from "./PdPlant"
import { byte, caption, HelpJump, imageDir, int, IntToStr, short, StrToIntRange } from "./common"
import { PdSection } from "./PdSection"
import { len } from "./usupport"
import { unfinished } from "./temporary"
import { TRect } from "./TRect"

// from conversion_common import *
// import ucursor
// import updcom
// import ucommand
// import usupport
// import usection
// import umain
// import uwinsliders
// import updform
// import udomain
// import ubrstrat
// import uplant
// import delphi_compatability

// TOD PDF: used to get to compile
type TWinControl = any
type TOwnerDrawState = any
type KfWinSlider = any
type TLabel = any
type TRadioButton = any
type TShiftState = any

const kBetweenGap = 4
const kMaxPlantNameLength = 20

type SectionWrapper = {
    name: string
    section: PdSection
    selected: boolean
}

type TabType = "General" | "Mutation" | "Blending" | "Non-numeric" | "Colors and 3D objects"
const tabs: TabType[] = ["General", "Mutation", "Blending", "Non-numeric", "Colors and 3D objects"]

export class TBreedingOptionsForm {
    // ok: TButton = new TButton()
    // cancel: TButton = new TButton()
    // upImage: TImage = new TImage()
    // downImage: TImage = new TImage()
    breedingOptions = { pageIndex: 0 } // TTabbedNotebook = new TTabbedNotebook()
    // treatColorsAsNumbers: TCheckBox = new TCheckBox()
    // chooseTdosRandomly: TCheckBox = new TCheckBox()
    // currentTdoLibraryFileName: TEdit = new TEdit()
    // weightLabel: TLabel = new TLabel()
    // weightAmountLabel: TLabel = new TLabel()
    // weightZero: TLabel = new TLabel()
    // weightSlider: KfWinSlider = new KfWinSlider()
    // weightOneHundred: TLabel = new TLabel()
    // weightSelectAll: TButton = new TButton()
    // weightSelectNone: TButton = new TButton()
    weightSections: SectionWrapper[] = []
    // mutationLabel: TLabel = new TLabel()
    // mutationAmountLabel: TLabel = new TLabel()
    // mutationZero: TLabel = new TLabel()
    // mutationSlider: KfWinSlider = new KfWinSlider()
    // mutationOneHundred: TLabel = new TLabel()
    mutationSections: SectionWrapper[] = []
    // mutationSelectAll: TButton = new TButton()
    // mutationSelectNone: TButton = new TButton()
    // nonNumericLabel: TLabel = new TLabel()
    // firstPlantIfEqualLabel: TLabel = new TLabel()
    // alwaysCopyFromFirstPlant: TRadioButton = new TRadioButton()
    // alwaysCopyFromSecondPlant: TRadioButton = new TRadioButton()
    // copyRandomlyBasedOnWeights: TRadioButton = new TRadioButton()
    // copyBasedOnWeightsIfEqualFirstPlant: TRadioButton = new TRadioButton()
    // copyBasedOnWeightsIfEqualSecondPlant: TRadioButton = new TRadioButton()
    // copyBasedOnWeightsIfEqualChooseRandomly: TRadioButton = new TRadioButton()
    // helpButton: TSpeedButton = new TSpeedButton()
    // mutationShowSections: TSpeedButton = new TSpeedButton()
    // weightShowSections: TSpeedButton = new TSpeedButton()
    // changeTdoLibrary: TSpeedButton = new TSpeedButton()
    // GroupBox1: TGroupBox = new TGroupBox()
    // Label4: TLabel = new TLabel()
    // Label1: TLabel = new TLabel()
    // Label2: TLabel = new TLabel()
    // thumbnailWidth: TSpinEdit = new TSpinEdit()
    // thumbnailHeight: TSpinEdit = new TSpinEdit()
    // GroupBox2: TGroupBox = new TGroupBox()
    // Label3: TLabel = new TLabel()
    // plantsPerGeneration: TSpinEdit = new TSpinEdit()
    // Label6: TLabel = new TLabel()
    // maxGenerations: TSpinEdit = new TSpinEdit()
    // Label8: TLabel = new TLabel()
    // Label7: TLabel = new TLabel()
    // percentMaxAge: TSpinEdit = new TSpinEdit()
    // maxPartsPerPlant_thousands: TSpinEdit = new TSpinEdit()
    // Label9: TLabel = new TLabel()
    // GroupBox3: TGroupBox = new TGroupBox()
    // numTimeSeriesStages: TSpinEdit = new TSpinEdit()
    // Label5: TLabel = new TLabel()
    // updateTimeSeriesPlantsOnParameterChange: TCheckBox = new TCheckBox()
    options: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    domainOptions: DomainOptionsStructure = new DomainOptionsStructure()
    draggingMutationSlider: boolean = false
    draggingWeightSlider: boolean = false
    mutationSectionsOpen: boolean = false
    weightSectionsOpen: boolean = false

    close: ((options: TBreedingOptionsForm | null) => void) | null = null

        
    currentTab: TabType = "General"

    setCurrentTab(tab: TabType) {
        this.currentTab = tab
    }
    
    //$R *.DFM
    // ---------------------------------------------------------------------------------------- create/destroy 
    // FormCreate(): void {
    //     this.breedingOptions.pageIndex = 0
    //     this.mutationSections.Visible = false
    //     this.mutationSelectAll.Visible = false
    //     this.mutationSelectNone.Visible = false
    //     this.weightSections.Visible = false
    //     this.weightSelectAll.Visible = false
    //     this.weightSelectNone.Visible = false
    //     this.loadSectionsIntoListBoxes()
    //     this.currentTdoLibraryFileName.Text = domain.defaultTdoLibraryFileName
    //     this.currentTdoLibraryFileName.SelStart = len(this.currentTdoLibraryFileName.Text)
    // }
    
    // ------------------------------------------------------------------------------- buttons 
    okClick() {
        this.close!(this.optionsChanged() ? this : null)
    }

    cancelClick() {
        this.close!(null)
    }

    optionsChanged(): boolean {
        return JSON.stringify(this.options) !== JSON.stringify(domain.breedingAndTimeSeriesOptions) ||
            JSON.stringify(this.domainOptions) !== JSON.stringify(domain.options)
    }
    
    // ---------------------------------------------------------------------------- reading breeding options 
    updateComponentsFromOptions(): void {
        if (this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom) !== null) {
            this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom).Checked = true
        }
        // TOD PDF: Fix or remove: this.treatColorsAsNumbers.Checked = this.options.mutateAndBlendColorValues
        // TOD PDF: Fix or remove: this.chooseTdosRandomly.Checked = this.options.chooseTdosRandomlyFromCurrentLibrary
    }
    
    radioButtonForChoiceIndex(index: short): TRadioButton | null {
        let result = null
        switch (index) {
            case FromPlant.kFromFirstPlant:
                // TOD PDF: Fix or remove: result = this.alwaysCopyFromFirstPlant
                break
            case FromPlant.kFromSecondPlant:
                // TOD PDF: Fix or remove: result = this.alwaysCopyFromSecondPlant
                break
            case FromPlant.kFromProbabilityBasedOnWeightsForSection:
                // TOD PDF: Fix or remove: result = this.copyRandomlyBasedOnWeights
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant:
                // TOD PDF: Fix or remove: result = this.copyBasedOnWeightsIfEqualFirstPlant
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant:
                // TOD PDF: Fix or remove: result = this.copyBasedOnWeightsIfEqualSecondPlant
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly:
                // TOD PDF: Fix or remove: result = this.copyBasedOnWeightsIfEqualChooseRandomly
                break
        }
        return result
    }
    
    choiceIndexForRadioButton(radio: TRadioButton): short {
        let result = 0
        result = 0
        // TOD PDF: Fix or remove: 
        // if (radio === this.alwaysCopyFromFirstPlant) {
        //     result = FromPlant.kFromFirstPlant
        // } else if (radio === this.alwaysCopyFromSecondPlant) {
        //     result = FromPlant.kFromSecondPlant
        // } else if (radio === this.copyRandomlyBasedOnWeights) {
        //     result = FromPlant.kFromProbabilityBasedOnWeightsForSection
        // } else if (radio === this.copyBasedOnWeightsIfEqualFirstPlant) {
        //     result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant
        // } else if (radio === this.copyBasedOnWeightsIfEqualSecondPlant) {
        //     result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant
        // } else if (radio === this.copyBasedOnWeightsIfEqualChooseRandomly) {
        //     result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        // }
        return result
    }
    
    // ------------------------------------------------------------ changing breeding strategy 
    
    
    updateMutationOrWeightFromSlider(which: short, isOpen: boolean, aListBox: SectionWrapper[], aSliderValue: number): void {
        if (aListBox.length > 0) {
            for (let i = 0; i <= aListBox.length - 1; i++) {
                if (aListBox[i].selected || (!isOpen)) {
                    if (which === kMutation) {
                        this.options.mutationStrengths[i] = aSliderValue
                    } else {
                        this.options.firstPlantWeights[i] = aSliderValue
                    }
                }
            }
        }
    }
    
    alwaysCopyFromFirstPlantClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    alwaysCopyFromSecondPlantClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyRandomlyBasedOnWeightsClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualFirstPlantClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualSecondPlantClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualChooseRandomlyClick(): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    updateOptionsForNonNumericChoice(): void {
        // TOD PDF: Fix or remove: 
        // if (this.breedingOptions.controlCount > 0) {
        //     for (let i = 1; i <= this.breedingOptions.controlCount - 1; i++) {
        //         if ((this.breedingOptions.controls[i] instanceof delphi_compatability.TRadioButton)) {
        //             // this will work so long as there are no other radio buttons on the notebook
        //             const radio: TRadioButton = (this.breedingOptions.controls[i])
        //             if (radio.Checked) {
        //                 this.options.getNonNumericalParametersFrom = this.choiceIndexForRadioButton(radio)
        //             }
        //             break
        //         }
        //     }
        // }
    }
    
    treatColorsAsNumbersClick(): void {
        // TOD PDF: Fix or remove: this.options.mutateAndBlendColorValues = this.treatColorsAsNumbers.Checked
    }
    
    chooseTdosRandomlyClick(): void {
        // TOD PDF: Fix or remove: this.options.chooseTdosRandomlyFromCurrentLibrary = this.chooseTdosRandomly.Checked
    }
    
    // ------------------------------------------------------------------ sections list boxes 
    loadSectionsIntoListBoxes(): void {
        if ((domain === null) || (domain.sectionManager === null)) {
            return
        }
        this.mutationSections = []
        this.weightSections = []
        for (let i = 0; i <= domain.sectionManager.sections.length - 1; i++) {
            const section: PdSection = domain.sectionManager.sections[i]
            if (section.showInParametersWindow) {
                this.mutationSections.push({name: section.getName(), section, selected: false})
                this.weightSections.push({name: section.getName(), section, selected: false})
            }
        }
    }
    
    mutationSectionsDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        this.drawSectionsListBoxItem(Control, index, Rect, State)
    }
    
    weightSectionsDrawItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        this.drawSectionsListBoxItem(Control, index, Rect, State)
    }
    
    drawSectionsListBoxItem(Control: TWinControl, index: int, Rect: TRect, State: TOwnerDrawState): void {
        unfinished()
        // if (delphi_compatability.Application.terminated) {
        //     return
        // }
        // const sectionsListBox: SectionWrapper[] = Control
        // if (sectionsListBox === null) {
        //     return
        // }
        // if ((sectionsListBox.length <= 0) || (index < 0) || (index > sectionsListBox.length - 1)) {
        //     return
        // }
        // const selected: boolean = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // // set up section pointer 
        // const section: PdSection = sectionsListBox[index].section
        // if (section === null) {
        //     return
        // }
        // sectionsListBox.Canvas.Font = sectionsListBox.Font
        // if (selected) {
        //     sectionsListBox.Canvas.Brush.Color = UNRESOLVED.clHighlight
        //     sectionsListBox.Canvas.Font.Color = UNRESOLVED.clHighlightText
        // } else {
        //     sectionsListBox.Canvas.Brush.Color = sectionsListBox.Color
        //     sectionsListBox.Canvas.Font.Color = UNRESOLVED.clBtnText
        // }
        // sectionsListBox.Canvas.FillRect(Rect)
        // let cText: string
        // if (sectionsListBox === this.mutationSections) {
        //     cText = section.getName() + " " + IntToStr(this.options.mutationStrengths[index]) + "%"
        // } else {
        //     cText = section.getName() + " " + IntToStr(this.options.firstPlantWeights[index]) + "/" + IntToStr(100 - this.options.firstPlantWeights[index])
        // }
        // // margin for text 
        // Rect.left = Rect.left + 2
        // UNRESOLVED.winprocs.drawText(sectionsListBox.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
    }
    
    mutationSliderEnabled(): boolean {
        const isOpen = this.mutationSectionsOpen
        const aListBox = this.mutationSections

        let firstSelectedIndex: short
        if (isOpen) {
            firstSelectedIndex = this.firstSelectedIndex(aListBox)
        } else {
            firstSelectedIndex = 0
        }
        return (firstSelectedIndex >= 0) || (!isOpen)
    }

    mutationSliderValue(): any {
        return this.getSliderValueForSelectedSections(kMutation, this.mutationSectionsOpen, this.mutationSections)
    }

    mutationSliderChange(event: any): any {
        const currentValue = StrToIntRange(event.target.value, 0, 100)
        this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, currentValue)
    }

    weightSliderEnabled(): boolean {
        const isOpen = this.weightSectionsOpen
        const aListBox = this.weightSections

        let firstSelectedIndex: short
        if (isOpen) {
            firstSelectedIndex = this.firstSelectedIndex(aListBox)
        } else {
            firstSelectedIndex = 0
        }
        return (firstSelectedIndex >= 0) || (!isOpen)
    }

    weightSliderValue(): any {
        return this.getSliderValueForSelectedSections(kWeight, this.weightSectionsOpen, this.weightSections)
    }

    weightSliderChange(event: any): any {
        const currentValue = StrToIntRange(event.target.value, 0, 100)
        this.updateMutationOrWeightFromSlider(kWeight, this.weightSectionsOpen, this.weightSections, currentValue)
    }
    
    getSliderValueForSelectedSections(which: short, isOpen: boolean, aListBox: SectionWrapper[]): number {
        let firstSelectedIndex: short
        
        if (isOpen) {
            firstSelectedIndex = this.firstSelectedIndex(aListBox)
        } else {
            firstSelectedIndex = 0
        }
        let currentValue
        if (firstSelectedIndex >= 0) {
            if (which === kMutation) {
                currentValue = this.options.mutationStrengths[firstSelectedIndex]
            } else {
                currentValue = this.options.firstPlantWeights[firstSelectedIndex]
            }
        } else {
            currentValue = 0
        }
        return currentValue
    }
    
    firstSelectedIndex(aListBox: SectionWrapper[]): short {
        let result = -1
        if (aListBox.length <= 0) {
            return result
        }
        if (aListBox.filter(wrapper => wrapper.selected).length < 1) {
            return result
        }
        for (let i = 0; i <= aListBox.length - 1; i++) {
            if (aListBox[i].selected) {
                result = i
                return result
            }
        }
        return result
    }
    
    mutationShowSectionsClick(): void {
        this.mutationSectionsOpen = !this.mutationSectionsOpen
        if (this.mutationSectionsOpen) {
            this.mutationSelectAllClick()
        }
    }
    
    weightShowSectionsClick(): void {
        this.weightSectionsOpen = !this.weightSectionsOpen
        if (this.weightSectionsOpen) {
            this.weightSelectAllClick()
        }
    }
    
    mutationSelectAllClick(): void {
        for (let i = 0; i <= this.mutationSections.length - 1; i++) {
            this.mutationSections[i].selected = true
        }
    }
    
    mutationSelectNoneClick(): void {
        for (let i = 0; i <= this.mutationSections.length - 1; i++) {
            this.mutationSections[i].selected = false
        }
    }
    
    weightSelectAllClick(): void {
        for (let i = 0; i <= this.weightSections.length - 1; i++) {
            this.weightSections[i].selected = true
        }
    }
    
    weightSelectNoneClick(): void {
        for (let i = 0; i <= this.weightSections.length - 1; i++) {
            this.weightSections[i].selected = false
        }
    }
    
    changeTdoLibraryClick(): void {
        unfinished()
        // const fileNameWithPath: string = usupport.getFileOpenInfo(usupport.kFileTypeTdo, domain.defaultTdoLibraryFileName, "Choose a 3D object library (tdo) file")
        // if (fileNameWithPath === "") {
        //     return
        // }
        // this.currentTdoLibraryFileName.Text = fileNameWithPath
        // domain.defaultTdoLibraryFileName = this.currentTdoLibraryFileName.Text
        // this.currentTdoLibraryFileName.SelStart = len(this.currentTdoLibraryFileName.Text)
    }
    
    helpButtonClick(): void {
        HelpJump("Changing_breeding_variation") // Was: Changing_breeding_options
    }
    
    plantsPerGenerationChange(event: any): void {
        const oldValue = this.options.plantsPerGeneration
        try {
            this.options.plantsPerGeneration = StrToIntRange(event.target.value, 1, 100)
        } catch (e) {
            this.options.plantsPerGeneration = oldValue
        }
    }
    
    thumbnailWidthChange(event: any): void {
        const oldValue = this.options.thumbnailWidth
        try {
            this.options.thumbnailWidth = StrToIntRange(event.target.value, 30, 200)
        } catch (e) {
            this.options.thumbnailWidth = oldValue
        }
    }
    
    thumbnailHeightChange(event: any): void {
        const oldValue = this.options.thumbnailHeight
        try {
            this.options.thumbnailHeight = StrToIntRange(event.target.value, 30, 200)
        } catch (e) {
            this.options.thumbnailHeight = oldValue
        }
    }
    
    maxGenerationsChange(event: any): void {
        const oldValue = this.options.maxGenerations
        try {
            this.options.maxGenerations = StrToIntRange(event.target.value, 20, 500)
        } catch (e) {
            this.options.maxGenerations = oldValue
        }
    }
    
    numTimeSeriesStagesChange(event: any): void {
        const oldValue = this.options.numTimeSeriesStages
        try {
            this.options.numTimeSeriesStages = StrToIntRange(event.target.value, 1, 100)
        } catch (e) {
            this.options.numTimeSeriesStages = oldValue
        }
    }
    
    percentMaxAgeChange(event: any): void {
        const oldValue = this.options.percentMaxAge
        try {
            this.options.percentMaxAge = StrToIntRange(event.target.value, 1, 100)
        } catch (e) {
            this.options.percentMaxAge = oldValue
        }
    }
    
    maxPartsPerPlant_thousandsChange(event: any): void {
        const oldValue = this.domainOptions.maxPartsPerPlant_thousands
        try {
            this.domainOptions.maxPartsPerPlant_thousands = StrToIntRange(event.target.value, 1, 100)
        } catch (e) {
            this.domainOptions.maxPartsPerPlant_thousands = oldValue
        }
    }
    
    updateTimeSeriesPlantsOnParameterChangeClick(event: any): void {
        this.domainOptions.updateTimeSeriesPlantsOnParameterChange = event.target.checked
    }

    view() {
        return m("div.BreedingOptionsForm.TBreedingOptionsForm.h-100",
            m("div.TTabbedNotebook.breedingOptions.TTabbedNotebook",
                {
                    style: { height: "90%" }
                },
                m("div.b.f4.mb2", "Breeder and Time Series Options"),
                m("div.TTabSet.tabSet.TTabSet.mb2",
                    tabs.map(
                        tab => m("div.ml1.br--top.bl.bt.br.bw1.br2.dib.pa1" + (this.currentTab === tab ? ".bg-green" : ""), {
                            style: { minWidth: "4rem" },
                            onclick: () => this.setCurrentTab(tab)
                        }, tab)
                )),
                this.currentTab === "General" && this.viewPage1(),
                this.currentTab === "Mutation" && this.viewPage2(),
                this.currentTab === "Blending" && this.viewPage3(),
                this.currentTab === "Non-numeric" && this.viewPage4(),
                this.currentTab === "Colors and 3D objects" && this.viewPage5(),
            ),
            m("div.flex.items-center.mt2.absolute",
                { style: { bottom: "0.5rem" }},
                m("button.ok.TButton",
                    {
                        onclick: () => this.okClick(),
                        disabled: !this.optionsChanged()
                    },
                    "OK",
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                    },
                    "Cancel",
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                    },
                    m("img.TImage", { src: imageDir + "BreedingOptionsForm_helpButton.png" } ),
                    caption("&Help"),
                ),
            ),
        )
    }

    viewPage1(): m.Children {
        return m("TTabPage.page1.TTabPage",
            m("div.TGroupBox.GroupBox1.TGroupBox",
                m("Group.Group.g00000043",
                    m("div.Label1.TLabel",
                        caption("&Width of plant thumbnails (30-200)"),
                        m("br"),
                        m("input[type=number].mw3.ml1.thumbnailWidth.TSpinEdit",
                        {
                            value: IntToStr(this.options.thumbnailWidth),
                            onchange: (event: any) => this.thumbnailWidthChange(event),
                            step: 5,
                            min: "30",
                            max: "200"
                        },
                    ),
                    ),
                    m("div.Label2.TLabel",
                        caption("&Height of plant thumbnails (30-200)"),
                        m("br"),
                        m("input[type=number].mw3.ml1.thumbnailHeight.TSpinEdit",
                        {
                            value: IntToStr(this.options.thumbnailHeight),
                            onchange: (event: any) => this.thumbnailHeightChange(event),
                            step: 5,
                            min: "30",
                            max: "200"
                        },
                    ),
                    ),
                ),
            ),
            m("div.TGroupBox.GroupBox2.TGroupBox.mt2.bt",
                // " Breeder ",
                m("div.Label3.TLabel",
                    caption("Plants to &create per Breeder generation (1-100)"),
                    m("br"),
                    m("input[type=number].mw3.ml1.plantsPerGeneration.TSpinEdit",
                        {
                            value: IntToStr(this.options.plantsPerGeneration),
                            onchange: (event: any) => this.plantsPerGenerationChange(event),
                            step: 5,
                            min: "1",
                            max: "100"
                        },
                    ),
                ),
                m("div.Label6.TLabel",
                    caption("&Maximum Breeder generations (20-500)"),
                    m("br"),
                    m("input[type=number].mw3.ml1.maxGenerations.TSpinEdit",
                        {
                            value: IntToStr(this.options.maxGenerations),
                            onchange: (event: any) => this.maxGenerationsChange(event),
                            step: 10,
                            min: "20",
                            max: "500"
                        },
                    ),
                    // m("br"),
                    // "(to avoid running out of memory)",
                ),
                m("div.Label7.TLabel",
                    caption("&Age of Breeder plants (as % of maximum)"),
                    m("br"),
                    m("input[type=number].mw3.ml1.percentMaxAge.TSpinEdit",
                        {
                            value: IntToStr(this.options.percentMaxAge),
                            onchange: (event: any) => this.percentMaxAgeChange(event),
                            step: 1,
                            min: "1",
                            max: "100"
                        },
                    ),
                ),
                m("div.Label9.TLabel",
                    caption("Ma&ximum parts per Breeder plant (1-100 thousand)"),
                    m("br"),
                    m("input[type=number].mw3.ml1.maxPartsPerPlant_thousands.TSpinEdit",
                        {
                            value: IntToStr(this.domainOptions.maxPartsPerPlant_thousands),
                            onchange: (event: any) => this.maxPartsPerPlant_thousandsChange(event),
                            step: 1,
                            min: "1",
                            max: "100"
                        },
                    ),
                ),
            ),
            m("div.TGroupBox.GroupBox3.TGroupBox.mt2.bt",
                // " Time series ",
                m("div.Label5.TLabel",
                    caption("Time Series &stages to show(1-100)"),
                    m("br"),
                    m("input[type=number].mw3.ml1.numTimeSeriesStages.TSpinEdit",
                        {
                            value: IntToStr(this.options.numTimeSeriesStages),
                            onchange: (event: any) => this.numTimeSeriesStagesChange(event),
                            step: 1,
                            min: "1",
                            max: "100"
                        },
                ),
                ),
                m("label.checkbox-inline.updateTimeSeriesPlantsOnParameterChange.TCheckBox", m("input[type=checkbox]",
                    {
                        checked: this.domainOptions.updateTimeSeriesPlantsOnParameterChange,
                        onclick: (event: any) => this.updateTimeSeriesPlantsOnParameterChangeClick(event),
                    }),
                    caption("Update &Time Series when change plant parameter"),
                ),
            ),
        )
    }

    viewPage2(): m.Children {
        return m("TTabPage.page2.TTabPage",
            // "Mutation",
            m("div.mutationLabel.TLabel",
                caption("&Mutation strength (as percent of mean values)"),
                m("br"),
                "0",
                m("input[type=range].KfWinSlider.mutationSlider.KfWinSlider.ml1.mr1",
                    {
                        value: this.mutationSliderValue(),
                        onchange: (event: any) => this.mutationSliderChange(event),
                        min: 0,
                        max: 100,
                        disabled: !this.weightSliderEnabled()
                    },
                ),
                "100",
                m("br"),
                m("div.mutationAmountLabel.TLabel.ml4", IntToStr(this.mutationSliderValue()) + "%" )
            ),
            m("Group.Group.g00000058",
                m("button.mutationShowSections.TSpeedButton",
                    {
                        onclick: () => this.mutationShowSectionsClick(),
                    },
                    m("img.mr1", { src: imageDir + (this.mutationSectionsOpen ? "BreedingOptionsForm_downImage.png" : "BreedingOptionsForm_upImage.png" )}),
                    caption("&Sections"),
                ),
                this.mutationSectionsOpen && m("div.TListBox.mutationSections.TListBox.ba.pa1",
                    this.mutationSections.map((section, index) => m("div.ml2",
                        m("label",
                            m("input[type=checkbox]", {
                                checked: section.selected,
                                onchange: (event: any) => section.selected = event.target.checked
                            }),
                            m("span.ml1", section.name),
                            m("span.ml1", this.options.mutationStrengths[index] + "%")
                        )
                    ))
                ),
            ),
            this.mutationSectionsOpen && m("div",
                m("button.mutationSelectAll.TButton",
                    {
                        onclick: () => this.mutationSelectAllClick(),
                    },
                    caption("Select &all"),
                ),
                m("button.mutationSelectNone.TButton.ml2",
                    {
                        onclick: () => this.mutationSelectNoneClick(),
                    },
                    caption("Select &none"),
                ),
            ),
        )
    }

    viewPage3(): m.Children {
        return m("TTabPage.page3.TTabPage",
            // "Blending",
            m("div.weightLabel.TLabel",
                caption("Relative &weight of first parent"),
                m("br"),
                "0",
                m("input[type=range].KfWinSlider.weightSlider.KfWinSlider.ml1.mr1",
                    {
                        value: this.weightSliderValue(),
                        onchange: (event: any) => this.weightSliderChange(event),
                        min: 0,
                        max: 100,
                        disabled: !this.weightSliderEnabled()
                    },
                ),
                "100",
                m("br"),
                m("div.weightAmountLabel.TLabel.ml4", IntToStr(this.weightSliderValue()) + "%" )
            ),
            m("Group.Group.g00000059",
                m("button.weightShowSections.TSpeedButton",
                    {
                        onclick: () => this.weightShowSectionsClick(),
                    },
                    m("img.mr1", { src: imageDir + (this.weightSectionsOpen ? "BreedingOptionsForm_downImage.png" : "BreedingOptionsForm_upImage.png" )}),
                    caption("&Sections"),
                ),
                this.weightSectionsOpen && m("div.TListBox.weightSections.TListBox.ba.pa1",
                    this.weightSections.map((section, index) => m("div.ml2",
                        m("label",
                            m("input[type=checkbox]", {
                                checked: section.selected,
                                onchange: (event: any) => section.selected = event.target.checked
                            }),
                            m("span.ml1", section.name),
                            m("span.ml1", this.options.firstPlantWeights[index] + "%")
                        )
                    ))
                ),
            ),
            this.weightSectionsOpen && m("div",
                m("button.weightSelectAll.TButton",
                    {
                        onclick: () => this.weightSelectAllClick(),
                    },
                    caption("Select &all"),
                ),
                m("button.weightSelectNone.TButton.ml2",
                    {
                        onclick: () => this.weightSelectNoneClick(),
                    },
                    caption("Select &none"),
                ),
            ),
        )
    }

    viewPage4(): m.Children {
        return m("TTabPage.page4.TTabPage",
            "Non-numeric",
            m("div.nonNumericLabel.TLabel",
                {
                    // Top: "31",
                    // Left: "17",
                    // Height: "14",
                    // Width: "186",
                },
                " Where to get non-numeric parameters",
            ),
            m("input[type=radio].alwaysCopyFromFirstPlant.TRadioButton",
                {
                    onclick: () => this.alwaysCopyFromFirstPlantClick(),
                    // Top: "51",
                    // Left: "29",
                    // Height: "17",
                    // Width: "168",
                    // TabOrder: "0",
                },
                caption("get from &first parent"),
            ),
            m("input[type=radio].alwaysCopyFromSecondPlant.TRadioButton",
                {
                    onclick: () => this.alwaysCopyFromSecondPlantClick(),
                    // Top: "73",
                    // Left: "29",
                    // Height: "17",
                    // Width: "194",
                    // TabOrder: "1",
                },
                caption("get from &second parent"),
            ),
            m("input[type=radio].copyRandomlyBasedOnWeights.TRadioButton",
                {
                    onclick: () => this.copyRandomlyBasedOnWeightsClick(),
                    // Top: "95",
                    // Left: "29",
                    // Height: "17",
                    // Width: "258",
                    // Tag: "1",
                    // TabOrder: "2",
                },
                caption("choose randomly using &weights as probabilities"),
            ),
            m("div.firstPlantIfEqualLabel.TLabel",
                {
                    // Top: "117",
                    // Left: "29",
                    // Height: "14",
                    // Width: "212",
                },
                "get from parent with higher weight; if 50/50,",
            ),
            m("input[type=radio].copyBasedOnWeightsIfEqualFirstPlant.TRadioButton",
                {
                    onclick: () => this.copyBasedOnWeightsIfEqualFirstPlantClick(),
                    // Top: "139",
                    // Left: "49",
                    // Height: "17",
                    // Width: "237",
                    // TabOrder: "3",
                },
                caption("get from the f&irst parent"),
            ),
            m("input[type=radio].copyBasedOnWeightsIfEqualSecondPlant.TRadioButton",
                {
                    onclick: () => this.copyBasedOnWeightsIfEqualSecondPlantClick(),
                    // Top: "161",
                    // Left: "49",
                    // Height: "17",
                    // Width: "237",
                    // TabOrder: "4",
                },
                caption("get from the s&econd parent"),
            ),
            m("input[type=radio].copyBasedOnWeightsIfEqualChooseRandomly.TRadioButton",
                {
                    onclick: () => this.copyBasedOnWeightsIfEqualChooseRandomlyClick(),
                    // Top: "183",
                    // Left: "49",
                    // Height: "17",
                    // Width: "237",
                    // TabOrder: "5",
                },
                caption("choose &randomly"),
            ),
        )
    }

    viewPage5(): m.Children {
        return m("TTabPage.page5.TTabPage",
            "Colors and 3D objects",
            m("label.checkbox-inline.treatColorsAsNumbers.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: () => this.treatColorsAsNumbersClick(),
                    // Top: "31",
                    // Left: "15",
                    // Height: "17",
                    // Width: "218",
                    // TabOrder: "0",
                },),
                caption("mutate and blend &colors as numbers"),
            ),
            m("label.checkbox-inline.chooseTdosRandomly.TCheckBox", m("input[type=checkbox]",
                {
                    onclick: () => this.chooseTdosRandomlyClick(),
                    // Top: "61",
                    // Left: "15",
                    // Height: "17",
                    // Width: "258",
                    // TabOrder: "1",
                },),
                caption("choose 3D &objects randomly from current library"),
            ),
            m("button.changeTdoLibrary.TSpeedButton",
                {
                    onclick: () => this.changeTdoLibraryClick(),
                },
                m("img.TImage", { src: imageDir + "BreedingOptionsForm_changeTdoLibrary.png" } ),
                caption("&Change..."),
            ),
            m("input.currentTdoLibraryFileName.TEdit",
                {
                    // Top: "83",
                    // Left: "34",
                    // Height: "22",
                    // Width: "217",
                    // Color: "clBtnFace",
                    // ReadOnly: "True",
                    // TabOrder: "2",
                    // Text: "currentTdoLibraryFileName",
                },
            ),
        )
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.options = JSON.parse(JSON.stringify(domain.breedingAndTimeSeriesOptions))
        this.domainOptions = JSON.parse(JSON.stringify(domain.options))
        this.loadSectionsIntoListBoxes()
        this.updateComponentsFromOptions()
    }
}
