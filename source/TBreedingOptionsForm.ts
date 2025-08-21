// unit Ubrdopt
import * as m from "mithril"
import { domain, DomainOptionsStructure } from "./PdDomain"
import { BreedingAndTimeSeriesOptionsStructure, FromPlant, kMutation, kWeight } from "./PdPlant"
import { byte, caption, HelpJump, int, IntToStr, short, StrToIntRange } from "./common"
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
        return JSON.stringify(this.options) !== JSON.stringify(domain.breedingAndTimeSeriesOptions) &&
            JSON.stringify(this.domainOptions) !== JSON.stringify(domain.options)
    }
    
    // ---------------------------------------------------------------------------- reading breeding options 
    updateComponentsFromOptions(): void {
        // TOD PDF: Fix or remove: this.mutationSections.Invalidate()
        // TOD PDF: Fix or remove: this.weightSections.Invalidate()
        this.mutationSectionsClick()
        this.weightSectionsClick()
        if (this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom) !== null) {
            this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom).Checked = true
        }
        // TOD PDF: Fix or remove: this.treatColorsAsNumbers.Checked = this.options.mutateAndBlendColorValues
        // TOD PDF: Fix or remove: this.chooseTdosRandomly.Checked = this.options.chooseTdosRandomlyFromCurrentLibrary
        // v2.0
        // TOD PDF: Fix or remove: this.plantsPerGeneration.Value = this.options.plantsPerGeneration
        // TOD PDF: Fix or remove: this.thumbnailWidth.Value = this.options.thumbnailWidth
        // TOD PDF: Fix or remove: this.thumbnailHeight.Value = this.options.thumbnailHeight
        // TOD PDF: Fix or remove: this.maxGenerations.Value = this.options.maxGenerations
        // TOD PDF: Fix or remove: this.numTimeSeriesStages.Value = this.options.numTimeSeriesStages
        // TOD PDF: Fix or remove: this.percentMaxAge.Value = this.options.percentMaxAge
        // v2.0 domain options moved from main options dialog
        // TOD PDF: Fix or remove: this.maxPartsPerPlant_thousands.Value = this.domainOptions.maxPartsPerPlant_thousands
        // TOD PDF: Fix or remove: this.updateTimeSeriesPlantsOnParameterChange.Checked = this.domainOptions.updateTimeSeriesPlantsOnParameterChange
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
    mutationSliderMouseDown(): void {
        if ((this.firstSelectedIndex(this.mutationSections) >= 0) || (!this.mutationSectionsOpen)) {
            this.draggingMutationSlider = true
        }
    }
    
    mutationSliderMouseMove(): void {
        if (this.draggingMutationSlider) {
            // TOD PDF: Fix or remove: this.mutationAmountLabel.Caption = IntToStr(this.mutationSlider.CurrentValue) + "%"
            // TOD PDF: Fix or remove: this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        }
    }
    
    mutationSliderMouseUp(): void {
        this.draggingMutationSlider = false
        // TOD PDF: Fix or remove: this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
    }
    
    mutationSliderKeyUp(Key: byte, Shift: TShiftState): byte {
        // TOD PDF: Fix or remove: this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        return Key
    }
    
    weightSliderMouseDown(): void {
        if ((this.firstSelectedIndex(this.weightSections) >= 0) || (!this.weightSectionsOpen)) {
            this.draggingWeightSlider = true
        }
    }
    
    weightSliderMouseMove(): void {
        if (this.draggingWeightSlider) {
            // TOD PDF: Fix or remove: this.weightAmountLabel.Caption = IntToStr(this.weightSlider.CurrentValue) + "%"
        }
    }
    
    weightSliderMouseUp(): void {
        this.draggingWeightSlider = false
        // TOD PDF: Fix or remove: this.updateMutationOrWeightFromSlider(kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
    }
    
    weightSliderKeyUp(Key: byte, Shift: TShiftState): byte {
        // TOD PDF: Fix or remove: this.updateMutationOrWeightFromSlider(kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
        return Key
    }
    
    updateMutationOrWeightFromSlider(which: short, isOpen: boolean, aListBox: SectionWrapper[], aSlider: KfWinSlider): void {
        if (aListBox.length > 0) {
            for (let i = 0; i <= aListBox.length - 1; i++) {
                if (aListBox[i].selected || (!isOpen)) {
                    if (which === kMutation) {
                        this.options.mutationStrengths[i] = aSlider.CurrentValue
                    } else {
                        this.options.firstPlantWeights[i] = aSlider.CurrentValue
                    }
                }
            }
        }
        // TOD PDF: Fix or remove: aListBox.Invalidate()
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
    
    mutationSectionsClick(): void {
        // TOD PDF: Fix or remove: this.updateSliderForSelectedSections(kMutation, this.mutationSectionsOpen, this.mutationSlider, this.mutationSections, this.mutationAmountLabel)
    }
    
    weightSectionsClick(): void {
        // TOD PDF: Fix or remove: this.updateSliderForSelectedSections(kWeight, this.weightSectionsOpen, this.weightSlider, this.weightSections, this.weightAmountLabel)
    }
    
    updateSliderForSelectedSections(which: short, isOpen: boolean, aSlider: KfWinSlider, aListBox: SectionWrapper[], aLabel: TLabel): void {
        let firstSelectedIndex: short
        
        if (isOpen) {
            firstSelectedIndex = this.firstSelectedIndex(aListBox)
        } else {
            firstSelectedIndex = 0
        }
        aSlider.Enabled = (firstSelectedIndex >= 0) || (!isOpen)
        if (firstSelectedIndex >= 0) {
            if (which === kMutation) {
                aSlider.CurrentValue = this.options.mutationStrengths[firstSelectedIndex]
            } else {
                aSlider.CurrentValue = this.options.firstPlantWeights[firstSelectedIndex]
            }
        } else {
            aSlider.CurrentValue = 0
        }
        aLabel.Caption = IntToStr(aSlider.CurrentValue) + "%"
        aLabel.Enabled = aSlider.Enabled
        aSlider.Invalidate()
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
            // TOD PDF: Fix or remove: this.mutationShowSections.Glyph = this.upImage.Picture.Bitmap
            // TOD PDF: Fix or remove: this.mutationSections.Visible = true
            // TOD PDF: Fix or remove: this.mutationSelectAll.Visible = true
            // TOD PDF: Fix or remove: this.mutationSelectNone.Visible = true
            // select all 
            this.mutationSelectAllClick()
            this.mutationSectionsClick()
        } else {
            // TOD PDF: Fix or remove: this.mutationSections.Visible = false
            // TOD PDF: Fix or remove: this.mutationSelectAll.Visible = false
            // TOD PDF: Fix or remove: this.mutationSelectNone.Visible = false
            // TOD PDF: Fix or remove: this.mutationShowSections.Glyph = this.downImage.Picture.Bitmap
            this.mutationSectionsClick()
        }
        // TOD PDF: Fix or remove: this.mutationSections.Visible = this.mutationSectionsOpen
    }
    
    weightShowSectionsClick(): void {
        this.weightSectionsOpen = !this.weightSectionsOpen
        if (this.weightSectionsOpen) {
            // TOD PDF: Fix or remove: this.weightShowSections.Glyph = this.upImage.Picture.Bitmap
            // TOD PDF: Fix or remove: this.weightSections.Visible = true
            // TOD PDF: Fix or remove: this.weightSelectAll.Visible = true
            // TOD PDF: Fix or remove: this.weightSelectNone.Visible = true
            // select all 
            this.weightSelectAllClick()
            this.weightSectionsClick()
        } else {
            // TOD PDF: Fix or remove: this.weightSections.Visible = false
            // TOD PDF: Fix or remove: this.weightSelectAll.Visible = false
            // TOD PDF: Fix or remove: this.weightSelectNone.Visible = false
            // TOD PDF: Fix or remove: this.weightShowSections.Glyph = this.downImage.Picture.Bitmap
            this.weightSectionsClick()
        }
        // TOD PDF: Fix or remove: this.weightSections.Visible = this.weightSectionsOpen
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
            this.options.plantsPerGeneration = StrToIntRange(event.target.value, 1, 10)
        } catch (e) {
            this.options.plantsPerGeneration = oldValue
        }
    }
    
    thumbnailWidthChange(event: any): void {
        const oldValue = this.options.thumbnailWidth
        try {
            this.options.thumbnailWidth = StrToIntRange(event.target.value, 1, 256)
        } catch (e) {
            this.options.thumbnailWidth = oldValue
        }
    }
    
    thumbnailHeightChange(event: any): void {
        const oldValue = this.options.thumbnailHeight
        try {
            this.options.thumbnailHeight = StrToIntRange(event.target.value, 1, 256)
        } catch (e) {
            this.options.thumbnailHeight = oldValue
        }
    }
    
    maxGenerationsChange(event: any): void {
        const oldValue = this.options.maxGenerations
        try {
            this.options.maxGenerations = StrToIntRange(event.target.value, 1, 256)
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
            {
            // Top: "263",
            // Left: "320",
            // Height: "0",
            // Width: "0",
            // BorderIcons: "[biSystemMenu]",
            // BorderStyle: "bsDialog",
            // Caption: "Breeding and Time Series Options",
            // ClientHeight: "330",
            // ClientWidth: "418",
            // Font.Charset: "DEFAULT_CHARSET",
            // Font.Color: "clWindowText",
            // Font.Height: "-11",
            // Font.Name: "Arial",
            // Font.Style: "[]",
            // Position: "poScreenCenter",
            // Scaled: "False",
            // OnCreate: "FormCreate",
            // PixelsPerInch: "96",
            // TextHeight: "14",
            },
            m("div.TTabbedNotebook.breedingOptions.TTabbedNotebook.overflow-auto",
                {
                    style: { height: "90%" }
                    // Top: "0",
                    // Left: "0",
                    // Height: "330",
                    // Width: "351",
                    // Align: "alLeft",
                    // TabFont.Charset: "DEFAULT_CHARSET",
                    // TabFont.Color: "clBlack",
                    // TabFont.Height: "-11",
                    // TabFont.Name: "Arial",
                    // TabFont.Style: "[]",
                    // TabOrder: "0",
                },
                m("TTabPage.page1.TTabPage",
                    {
                        // Top: "25",
                        // Left: "4",
                        // Height: "0",
                        // Width: "0",
                    },
                    "General",
                    m("TGroupBox.GroupBox1.TGroupBox",
                        {
                            // Top: "4",
                            // Left: "4",
                            // Height: "71",
                            // Width: "334",
                            // TabOrder: "0",
                        },
                        " Breeder and time series window ",
                        m("div.Label4.TLabel",
                            {
                                // Top: "19",
                                // Left: "10",
                                // Height: "14",
                                // Width: "114",
                            },
                            "Size of plant thumbnails",
                        ),
                        m("Group.Group.g00000039",
                            m("TSpinEdit.thumbnailWidth.TSpinEdit",
                                {
                                    // Top: "39",
                                    // Left: "29",
                                    // Height: "23",
                                    // Width: "53",
                                    // Increment: "5",
                                    // MaxValue: "200",
                                    // MinValue: "30",
                                    // TabOrder: "0",
                                    // Value: "30",
                                    // OnChange: "thumbnailWidthChange",
                                },
                            ),
                            m("TSpinEdit.thumbnailHeight.TSpinEdit",
                                {
                                    // Top: "39",
                                    // Left: "171",
                                    // Height: "23",
                                    // Width: "53",
                                    // Increment: "5",
                                    // MaxValue: "200",
                                    // MinValue: "30",
                                    // TabOrder: "1",
                                    // Value: "30",
                                    // OnChange: "thumbnailHeightChange",
                                },
                            ),
                        ),
                        m("Group.Group.g00000043",
                            m("div.Label1.TLabel",
                                {
                                    // Top: "43",
                                    // Left: "89",
                                    // Height: "14",
                                    // Width: "72",
                                    // FocusControl: "thumbnailWidth",
                                },
                                caption("&width (30-200)"),
                            ),
                            m("div.Label2.TLabel",
                                {
                                    // Top: "43",
                                    // Left: "231",
                                    // Height: "14",
                                    // Width: "74",
                                    // FocusControl: "thumbnailHeight",
                                },
                                caption("&height (30-200)"),
                            ),
                        ),
                    ),
                    m("TGroupBox.GroupBox2.TGroupBox",
                        {
                            // Top: "78",
                            // Left: "4",
                            // Height: "144",
                            // Width: "334",
                            // TabOrder: "1",
                        },
                        " Breeder ",
                        m("TSpinEdit.plantsPerGeneration.TSpinEdit",
                            {
                                // Top: "20",
                                // Left: "10",
                                // Height: "23",
                                // Width: "51",
                                // MaxValue: "100",
                                // MinValue: "1",
                                // TabOrder: "0",
                                // Value: "5",
                                // OnChange: "plantsPerGenerationChange",
                            },
                        ),
                        m("div.Label3.TLabel",
                            {
                                // Top: "24",
                                // Left: "68",
                                // Height: "14",
                                // Width: "187",
                                // FocusControl: "plantsPerGeneration",
                            },
                            caption("Plants to &create per generation (1-100)"),
                        ),
                        m("TSpinEdit.maxGenerations.TSpinEdit",
                            {
                                // Top: "49",
                                // Left: "10",
                                // Height: "23",
                                // Width: "51",
                                // Increment: "10",
                                // MaxValue: "500",
                                // MinValue: "20",
                                // TabOrder: "1",
                                // Value: "50",
                                // OnChange: "maxGenerationsChange",
                            },
                        ),
                        m("div.Label6.TLabel",
                            {
                                // Top: "53",
                                // Left: "68",
                                // Height: "14",
                                // Width: "190",
                                // FocusControl: "maxGenerations",
                            },
                            caption("&Maximum breeder generations (20-500)"),
                        ),
                        m("div.Label8.TLabel",
                            {
                                // Top: "67",
                                // Left: "79",
                                // Height: "14",
                                // Width: "157",
                                // FocusControl: "maxGenerations",
                            },
                            "(to avoid running out of memory)",
                        ),
                        m("TSpinEdit.percentMaxAge.TSpinEdit",
                            {
                                // Top: "83",
                                // Left: "10",
                                // Height: "23",
                                // Width: "51",
                                // MaxValue: "100",
                                // MinValue: "1",
                                // TabOrder: "2",
                                // Value: "100",
                                // OnChange: "percentMaxAgeChange",
                            },
                        ),
                        m("div.Label7.TLabel",
                            {
                                // Top: "87",
                                // Left: "68",
                                // Height: "14",
                                // Width: "202",
                                // FocusControl: "percentMaxAge",
                            },
                            caption("&Age of breeder plants (as % of maximum)"),
                        ),
                        m("TSpinEdit.maxPartsPerPlant_thousands.TSpinEdit",
                            {
                                // Top: "113",
                                // Left: "10",
                                // Height: "23",
                                // Width: "51",
                                // MaxValue: "100",
                                // MinValue: "1",
                                // TabOrder: "3",
                                // Value: "1",
                                // OnChange: "maxPartsPerPlant_thousandsChange",
                            },
                        ),
                        m("div.Label9.TLabel",
                            {
                                // Top: "117",
                                // Left: "68",
                                // Height: "14",
                                // Width: "245",
                                // FocusControl: "maxPartsPerPlant_thousands",
                            },
                            caption("Ma&ximum parts per breeder plant (1-100 thousand)"),
                        ),
                    ),
                    m("TGroupBox.GroupBox3.TGroupBox",
                        {
                            // Top: "226",
                            // Left: "4",
                            // Height: "69",
                            // Width: "334",
                            // TabOrder: "2",
                        },
                        " Time series ",
                        m("TSpinEdit.numTimeSeriesStages.TSpinEdit",
                            {
                                // Top: "17",
                                // Left: "10",
                                // Height: "23",
                                // Width: "51",
                                // MaxValue: "100",
                                // MinValue: "1",
                                // TabOrder: "0",
                                // Value: "5",
                                // OnChange: "numTimeSeriesStagesChange",
                            },
                        ),
                        m("div.Label5.TLabel",
                            {
                                // Top: "22",
                                // Left: "68",
                                // Height: "14",
                                // Width: "116",
                                // FocusControl: "numTimeSeriesStages",
                            },
                            caption("&Stages to show (1-100)"),
                        ),
                        m("label.checkbox-inline.updateTimeSeriesPlantsOnParameterChange.TCheckBox", m("input[type=checkbox]",
                            {
                                onclick: (event: any) => this.updateTimeSeriesPlantsOnParameterChangeClick(event),
                                // Top: "46",
                                // Left: "10",
                                // Height: "17",
                                // Width: "267",
                                // TabOrder: "1",
                            },),
                            caption("Update &time series when change plant parameter"),
                        ),
                    ),
                ),
                m("TTabPage.page2.TTabPage",
                    {
                        // Top: "25",
                        // Left: "4",
                        // Height: "0",
                        // Width: "0",
                    },
                    "Mutation",
                    m("div.mutationLabel.TLabel",
                        {
                            // Top: "12",
                            // Left: "8",
                            // Height: "14",
                            // Width: "223",
                            // FocusControl: "mutationSlider",
                        },
                        caption("&Mutation strength (as percent of mean values)"),
                    ),
                    m("Group.Group.g00000032",
                        m("div.mutationAmountLabel.TLabel",
                            {
                                // Top: "32",
                                // Left: "8",
                                // Height: "14",
                                // Width: "22",
                            },
                            "50%",
                        ),
                        m("div.mutationZero.TLabel",
                            {
                                // Top: "32",
                                // Left: "48",
                                // Height: "14",
                                // Width: "6",
                                // Font.Charset: "DEFAULT_CHARSET",
                                // Font.Color: "clWindowText",
                                // Font.Height: "-11",
                                // Font.Name: "Arial",
                                // Font.Style: "[]",
                                // ParentFont: "False",
                            },
                            "0",
                        ),
                        m("KfWinSlider.mutationSlider.KfWinSlider",
                            {
                                // Top: "32",
                                // Left: "60",
                                // Height: "13",
                                // Width: "233",
                                // OnMouseDown: "mutationSliderMouseDown",
                                // OnMouseMove: "mutationSliderMouseMove",
                                // OnMouseUp: "mutationSliderMouseUp",
                                // OnKeyUp: "mutationSliderKeyUp",
                                // CurrentValue: "0",
                            },
                        ),
                        m("div.mutationOneHundred.TLabel",
                            {
                                // Top: "32",
                                // Left: "294",
                                // Height: "14",
                                // Width: "18",
                                // Font.Charset: "DEFAULT_CHARSET",
                                // Font.Color: "clWindowText",
                                // Font.Height: "-11",
                                // Font.Name: "Arial",
                                // Font.Style: "[]",
                                // ParentFont: "False",
                            },
                            "100",
                        ),
                    ),
                    m("Group.Group.g00000058",
                        m("button.mutationShowSections.TSpeedButton",
                            {
                                onclick: () => this.mutationShowSectionsClick(),
                                // Top: "58",
                                // Left: "10",
                                // Height: "24",
                                // Width: "79",
                                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888808888888888888800088888888888800800888888888800888008888888800888880088888800888888800888800888888888008880888888888880888888888888888888888888888888888888888888888888888888888888888888",
                            },
                            caption("&Sections"),
                        ),
                        m("TListBox.mutationSections.TListBox",
                            {
                                onclick: () => this.mutationSectionsClick(),
                                // Top: "58",
                                // Left: "95",
                                // Height: "240",
                                // Width: "230",
                                // ItemHeight: "16",
                                // Items.Strings: ["General: 50%","Meristems: 50%","Internodes: 50%","Leaves: 50%","First leaves: 50%","Flowers (F): 50%","Flowers (M): 50%","Inflorescences (F): 50%","Inflorescences (M): 50%","Fruit: 50%","Root top: 50%"],
                                // MultiSelect: "True",
                                // Style: "lbOwnerDrawFixed",
                                // TabOrder: "1",
                                // OnDrawItem: "mutationSectionsDrawItem",
                            },
                        ),
                    ),
                    m("button.mutationSelectAll.TButton",
                        {
                            onclick: () => this.mutationSelectAllClick(),
                            // Top: "94",
                            // Left: "10",
                            // Height: "24",
                            // Width: "80",
                            // TabOrder: "2",
                        },
                        caption("Select &all"),
                    ),
                    m("button.mutationSelectNone.TButton",
                        {
                            onclick: () => this.mutationSelectNoneClick(),
                            // Top: "122",
                            // Left: "10",
                            // Height: "24",
                            // Width: "80",
                            // TabOrder: "3",
                        },
                        caption("Select &none"),
                    ),
                ),
                m("TTabPage.page3.TTabPage",
                    {
                        // Top: "25",
                        // Left: "4",
                        // Height: "0",
                        // Width: "0",
                    },
                    "Blending",
                    m("div.weightLabel.TLabel",
                        {
                            // Top: "12",
                            // Left: "9",
                            // Height: "14",
                            // Width: "143",
                            // FocusControl: "weightSlider",
                        },
                        caption("Relative &weight of first parent"),
                    ),
                    m("Group.Group.g00000032",
                        m("div.weightAmountLabel.TLabel",
                            {
                                // Top: "32",
                                // Left: "11",
                                // Height: "14",
                                // Width: "22",
                            },
                            "50%",
                        ),
                        m("div.weightZero.TLabel",
                            {
                                // Top: "32",
                                // Left: "46",
                                // Height: "14",
                                // Width: "6",
                                // Font.Charset: "DEFAULT_CHARSET",
                                // Font.Color: "clWindowText",
                                // Font.Height: "-11",
                                // Font.Name: "Arial",
                                // Font.Style: "[]",
                                // ParentFont: "False",
                            },
                            "0",
                        ),
                        m("div.weightOneHundred.TLabel",
                            {
                                // Top: "32",
                                // Left: "290",
                                // Height: "14",
                                // Width: "18",
                                // Font.Charset: "DEFAULT_CHARSET",
                                // Font.Color: "clWindowText",
                                // Font.Height: "-11",
                                // Font.Name: "Arial",
                                // Font.Style: "[]",
                                // ParentFont: "False",
                            },
                            "100",
                        ),
                    ),
                    m("KfWinSlider.weightSlider.KfWinSlider",
                        {
                            // Top: "35",
                            // Left: "56",
                            // Height: "9",
                            // Width: "229",
                            // OnMouseDown: "weightSliderMouseDown",
                            // OnMouseMove: "weightSliderMouseMove",
                            // OnMouseUp: "weightSliderMouseUp",
                            // OnKeyUp: "weightSliderKeyUp",
                            // CurrentValue: "0",
                        },
                    ),
                    m("Group.Group.g00000059",
                        m("button.weightShowSections.TSpeedButton",
                            {
                                onclick: () => this.weightShowSectionsClick(),
                                // Top: "59",
                                // Left: "10",
                                // Height: "24",
                                // Width: "81",
                                // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888808888888888888800088888888888800800888888888800888008888888800888880088888800888888800888800888888888008880888888888880888888888888888888888888888888888888888888888888888888888888888888",
                            },
                            caption("&Sections"),
                        ),
                        m("TListBox.weightSections.TListBox",
                            {
                                onclick: () => this.weightSectionsClick(),
                                // Top: "59",
                                // Left: "95",
                                // Height: "240",
                                // Width: "230",
                                // ItemHeight: "16",
                                // Items.Strings: ["General: 50%","Meristems: 50%","Internodes: 50%","Leaves: 50%","First leaves: 50%","Flowers (F): 50%","Flowers (M): 50%","Inflorescences (F): 50%","Inflorescences (M): 50%","Fruit: 50%","Root top: 50%"],
                                // MultiSelect: "True",
                                // Style: "lbOwnerDrawFixed",
                                // TabOrder: "1",
                                // OnDrawItem: "weightSectionsDrawItem",
                            },
                        ),
                    ),
                    m("button.weightSelectAll.TButton",
                        {
                            onclick: () => this.weightSelectAllClick(),
                            // Top: "95",
                            // Left: "10",
                            // Height: "24",
                            // Width: "80",
                            // TabOrder: "2",
                        },
                        caption("Select &all"),
                    ),
                    m("button.weightSelectNone.TButton",
                        {
                            onclick: () => this.weightSelectNoneClick(),
                            // Top: "123",
                            // Left: "10",
                            // Height: "24",
                            // Width: "80",
                            // TabOrder: "3",
                        },
                        caption("Select &none"),
                    ),
                ),
                m("TTabPage.page4.TTabPage",
                    {
                        // Top: "25",
                        // Left: "4",
                        // Height: "0",
                        // Width: "0",
                    },
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
                ),
                m("TTabPage.page5.TTabPage",
                    {
                        // Top: "25",
                        // Left: "4",
                        // Height: "0",
                        // Width: "0",
                    },
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
                            // Top: "80",
                            // Left: "257",
                            // Height: "24",
                            // Width: "84",
                            // Glyph.Data: "F6000000424DF6000000000000007600000028000000100000001000000001000400000000008000000000000000000000001000000010000000000000000000800000800000008080008000000080008000808000007F7F7F00BFBFBF000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF0080888888888888888088888888888888808800000800800880000BBB0888888880880BB00888888880888008888888888088888888888888808800000800800880000BBB0888888880880BB0088888888088800888888888808888888888888800000800800088880BBB0888888888880BB00888888888888008888888888888",
                        },
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
                ),
            ),
            m("div.bottom.mt2",
                { style:  { bottom: 0 }},
                m("button.ok.TButton",
                    {
                        onclick: () => this.okClick(),
                        disabled: !this.optionsChanged()
                        // Top: "4",
                        // Left: "356",
                        // Height: "21",
                        // Width: "60",
                        // Default: "True",
                        // TabOrder: "1",
                    },
                    "OK",
                ),
                m("button.cancel.TButton.ml2",
                    {
                        onclick: () => this.cancelClick(),
                        // Top: "27",
                        // Left: "356",
                        // Height: "21",
                        // Width: "60",
                        // Cancel: "True",
                        // TabOrder: "2",
                    },
                    "Cancel",
                ),
                m("button.helpButton.TSpeedButton.ml2",
                    {
                        onclick: () => this.helpButtonClick(),
                        // Top: "63",
                        // Left: "356",
                        // Height: "25",
                        // Width: "60",
                        // Glyph.Data: "F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00888888888888888888888888888888888888880C08888888888888CCC88888888888880C0888888888888888888888888888888C888888888888888C088888888888888CC888888888888888CC888888888800880CC888888888CC880CC888888888CC080CC8888888888CCCCC888888888888CCC88888888888888888888888",
                    },
                    caption("&Help"),
                ),
                m("img.downImage.TImage",
                    {
                        // Top: "92",
                        // Left: "452",
                        // Height: "16",
                        // Width: "16",
                        // AutoSize: "True",
                        // Picture.Data: "07544269746D6170F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888888888808888888888888800088888888888800800888888888800888008888888800888880088888800888888800888800888888888008880888888888880888888888888888888888888888888888888888888888888888888888888888888",
                        // Visible: "False",
                    },
                ),
                m("img.upImage.TImage",
                    {
                        // Top: "116",
                        // Left: "452",
                        // Height: "16",
                        // Width: "16",
                        // AutoSize: "True",
                        // Picture.Data: "07544269746D6170F6000000424DF60000000000000076000000280000001000000010000000010004000000000080000000000000000000000010000000100000000000000000008000008000000080800080000000800080008080000080808000C0C0C0000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF008888888888888888888888888888888888888888888888888888888888888888808888888888808880088888888800888800888888800888888008888800888888880088800888888888800800888888888888000888888888888880888888888888888888888888888888888888888888888888888888888888888888888888",
                        // Visible: "False",
                    },
                ),
            ),
        )
    }

    oninit(vnode: any) {
        this.close = vnode.attrs.close
        this.options = JSON.parse(JSON.stringify(domain.breedingAndTimeSeriesOptions))
        this.domainOptions = JSON.parse(JSON.stringify(domain.options))
        this.updateComponentsFromOptions()
    }
}
