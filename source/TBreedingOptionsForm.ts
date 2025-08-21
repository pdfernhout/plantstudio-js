// unit Ubrdopt
import * as m from "mithril"
import { domain, DomainOptionsStructure } from "./PdDomain"
import { BreedingAndTimeSeriesOptionsStructure, FromPlant, kMutation, kWeight } from "./PdPlant"
import { HelpJump, IntToStr, short } from "./common"
import { PdSection } from "./PdSection"
import { len } from "./usupport"

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
    // breedingOptions: TTabbedNotebook = new TTabbedNotebook()
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
    
    initializeWithBreedingAndTimeSeriesOptionsAndDomainOptions(anOptions: BreedingAndTimeSeriesOptionsStructure, aDomainOptions: DomainOptionsStructure): void {
        this.options = anOptions
        this.domainOptions = aDomainOptions
        this.updateComponentsFromOptions()
    }
    
    // ------------------------------------------------------------------------------- buttons 
    okClick(): void {
        this.ModalResult = mrOK
    }
    
    cancelClick(): void {
        this.ModalResult = mrCancel
    }
    
    // ---------------------------------------------------------------------------- reading breeding options 
    updateComponentsFromOptions(): void {
        this.mutationSections.Invalidate()
        this.weightSections.Invalidate()
        this.mutationSectionsClick()
        this.weightSectionsClick()
        if (this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom) !== null) {
            this.radioButtonForChoiceIndex(this.options.getNonNumericalParametersFrom).Checked = true
        }
        this.treatColorsAsNumbers.Checked = this.options.mutateAndBlendColorValues
        this.chooseTdosRandomly.Checked = this.options.chooseTdosRandomlyFromCurrentLibrary
        // v2.0
        this.plantsPerGeneration.Value = this.options.plantsPerGeneration
        this.thumbnailWidth.Value = this.options.thumbnailWidth
        this.thumbnailHeight.Value = this.options.thumbnailHeight
        this.maxGenerations.Value = this.options.maxGenerations
        this.numTimeSeriesStages.Value = this.options.numTimeSeriesStages
        this.percentMaxAge.Value = this.options.percentMaxAge
        // v2.0 domain options moved from main options dialog
        this.maxPartsPerPlant_thousands.Value = this.domainOptions.maxPartsPerPlant_thousands
        this.updateTimeSeriesPlantsOnParameterChange.Checked = this.domainOptions.updateTimeSeriesPlantsOnParameterChange
    }
    
    radioButtonForChoiceIndex(index: short): TRadioButton {
        let result = new TRadioButton()
        result = null
        switch (index) {
            case FromPlant.kFromFirstPlant:
                result = this.alwaysCopyFromFirstPlant
                break
            case FromPlant.kFromSecondPlant:
                result = this.alwaysCopyFromSecondPlant
                break
            case FromPlant.kFromProbabilityBasedOnWeightsForSection:
                result = this.copyRandomlyBasedOnWeights
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant:
                result = this.copyBasedOnWeightsIfEqualFirstPlant
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant:
                result = this.copyBasedOnWeightsIfEqualSecondPlant
                break
            case FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly:
                result = this.copyBasedOnWeightsIfEqualChooseRandomly
                break
        }
        return result
    }
    
    choiceIndexForRadioButton(radio: TRadioButton): short {
        let result = 0
        result = 0
        if (radio === this.alwaysCopyFromFirstPlant) {
            result = FromPlant.kFromFirstPlant
        } else if (radio === this.alwaysCopyFromSecondPlant) {
            result = FromPlant.kFromSecondPlant
        } else if (radio === this.copyRandomlyBasedOnWeights) {
            result = FromPlant.kFromProbabilityBasedOnWeightsForSection
        } else if (radio === this.copyBasedOnWeightsIfEqualFirstPlant) {
            result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant
        } else if (radio === this.copyBasedOnWeightsIfEqualSecondPlant) {
            result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant
        } else if (radio === this.copyBasedOnWeightsIfEqualChooseRandomly) {
            result = FromPlant.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        }
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
            this.mutationAmountLabel.Caption = IntToStr(this.mutationSlider.CurrentValue) + "%"
            this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        }
    }
    
    mutationSliderMouseUp(): void {
        this.draggingMutationSlider = false
        this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
    }
    
    mutationSliderKeyUp(Key: byte, Shift: TShiftState): void {
        this.updateMutationOrWeightFromSlider(kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        return Key
    }
    
    weightSliderMouseDown(): void {
        if ((this.firstSelectedIndex(this.weightSections) >= 0) || (!this.weightSectionsOpen)) {
            this.draggingWeightSlider = true
        }
    }
    
    weightSliderMouseMove(): void {
        if (this.draggingWeightSlider) {
            this.weightAmountLabel.Caption = IntToStr(this.weightSlider.CurrentValue) + "%"
        }
    }
    
    weightSliderMouseUp(): void {
        this.draggingWeightSlider = false
        this.updateMutationOrWeightFromSlider(kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
    }
    
    weightSliderKeyUp(Key: byte, Shift: TShiftState): void {
        this.updateMutationOrWeightFromSlider(kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
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
        aListBox.Invalidate()
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
        if (this.breedingOptions.controlCount > 0) {
            for (let i = 1; i <= this.breedingOptions.controlCount - 1; i++) {
                if ((this.breedingOptions.controls[i] instanceof delphi_compatability.TRadioButton)) {
                    // this will work so long as there are no other radio buttons on the notebook
                    const radio: TRadioButton = (this.breedingOptions.controls[i])
                    if (radio.Checked) {
                        this.options.getNonNumericalParametersFrom = this.choiceIndexForRadioButton(radio)
                    }
                    break
                }
            }
        }
    }
    
    treatColorsAsNumbersClick(): void {
        this.options.mutateAndBlendColorValues = this.treatColorsAsNumbers.Checked
    }
    
    chooseTdosRandomlyClick(): void {
        this.options.chooseTdosRandomlyFromCurrentLibrary = this.chooseTdosRandomly.Checked
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
        if (delphi_compatability.Application.terminated) {
            return
        }
        const sectionsListBox: SectionWrapper[] = Control
        if (sectionsListBox === null) {
            return
        }
        if ((sectionsListBox.length <= 0) || (index < 0) || (index > sectionsListBox.length - 1)) {
            return
        }
        const selected: boolean = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // set up section pointer 
        const section: PdSection = sectionsListBox[index].section
        if (section === null) {
            return
        }
        sectionsListBox.Canvas.Font = sectionsListBox.Font
        if (selected) {
            sectionsListBox.Canvas.Brush.Color = UNRESOLVED.clHighlight
            sectionsListBox.Canvas.Font.Color = UNRESOLVED.clHighlightText
        } else {
            sectionsListBox.Canvas.Brush.Color = sectionsListBox.Color
            sectionsListBox.Canvas.Font.Color = UNRESOLVED.clBtnText
        }
        sectionsListBox.Canvas.FillRect(Rect)
        let cText: string
        if (sectionsListBox === this.mutationSections) {
            cText = section.getName() + " " + IntToStr(this.options.mutationStrengths[index]) + "%"
        } else {
            cText = section.getName() + " " + IntToStr(this.options.firstPlantWeights[index]) + "/" + IntToStr(100 - this.options.firstPlantWeights[index])
        }
        // margin for text 
        Rect.left = Rect.left + 2
        UNRESOLVED.winprocs.drawText(sectionsListBox.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
    }
    
    mutationSectionsClick(): void {
        this.updateSliderForSelectedSections(kMutation, this.mutationSectionsOpen, this.mutationSlider, this.mutationSections, this.mutationAmountLabel)
    }
    
    weightSectionsClick(): void {
        this.updateSliderForSelectedSections(kWeight, this.weightSectionsOpen, this.weightSlider, this.weightSections, this.weightAmountLabel)
    }
    
    updateSliderForSelectedSections(which: short, isOpen: boolean, aSlider: KfWinSlider, aListBox: TListBox, aLabel: TLabel): void {
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
            this.mutationShowSections.Glyph = this.upImage.Picture.Bitmap
            this.mutationSections.Visible = true
            this.mutationSelectAll.Visible = true
            this.mutationSelectNone.Visible = true
            // select all 
            this.mutationSelectAllClick()
            this.mutationSectionsClick()
        } else {
            this.mutationSections.Visible = false
            this.mutationSelectAll.Visible = false
            this.mutationSelectNone.Visible = false
            this.mutationShowSections.Glyph = this.downImage.Picture.Bitmap
            this.mutationSectionsClick()
        }
        this.mutationSections.Visible = this.mutationSectionsOpen
    }
    
    weightShowSectionsClick(): void {
        this.weightSectionsOpen = !this.weightSectionsOpen
        if (this.weightSectionsOpen) {
            this.weightShowSections.Glyph = this.upImage.Picture.Bitmap
            this.weightSections.Visible = true
            this.weightSelectAll.Visible = true
            this.weightSelectNone.Visible = true
            // select all 
            this.weightSelectAllClick()
            this.weightSectionsClick()
        } else {
            this.weightSections.Visible = false
            this.weightSelectAll.Visible = false
            this.weightSelectNone.Visible = false
            this.weightShowSections.Glyph = this.downImage.Picture.Bitmap
            this.weightSectionsClick()
        }
        this.weightSections.Visible = this.weightSectionsOpen
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
        const fileNameWithPat: stringh = usupport.getFileOpenInfo(usupport.kFileTypeTdo, domain.defaultTdoLibraryFileName, "Choose a 3D object library (tdo) file")
        if (fileNameWithPath === "") {
            return
        }
        this.currentTdoLibraryFileName.Text = fileNameWithPath
        domain.defaultTdoLibraryFileName = this.currentTdoLibraryFileName.Text
        this.currentTdoLibraryFileName.SelStart = len(this.currentTdoLibraryFileName.Text)
    }
    
    helpButtonClick(): void {
        HelpJump("Changing_breeding_options")
    }
    
    plantsPerGenerationChange(): void {
        const oldValue = this.options.plantsPerGeneration
        try {
            this.options.plantsPerGeneration = this.plantsPerGeneration.Value
        } catch (e) {
            this.options.plantsPerGeneration = oldValue
        }
    }
    
    thumbnailWidthChange(): void {
        const oldValue = this.options.thumbnailWidth
        try {
            this.options.thumbnailWidth = this.thumbnailWidth.Value
        } catch (e) {
            this.options.thumbnailWidth = oldValue
        }
    }
    
    thumbnailHeightChange(): void {
        const oldValue = this.options.thumbnailHeight
        try {
            this.options.thumbnailHeight = this.thumbnailHeight.Value
        } catch (e) {
            this.options.thumbnailHeight = oldValue
        }
    }
    
    maxGenerationsChange(): void {
        const oldValue = this.options.maxGenerations
        try {
            this.options.maxGenerations = this.maxGenerations.Value
        } catch (e) {
            this.options.maxGenerations = oldValue
        }
    }
    
    numTimeSeriesStagesChange(): void {
        const oldValue = this.options.numTimeSeriesStages
        try {
            this.options.numTimeSeriesStages = this.numTimeSeriesStages.Value
        } catch (e) {
            this.options.numTimeSeriesStages = oldValue
        }
    }
    
    percentMaxAgeChange(): void {
        const oldValue = this.options.percentMaxAge
        try {
            this.options.percentMaxAge = this.percentMaxAge.Value
        } catch (e) {
            this.options.percentMaxAge = oldValue
        }
    }
    
    maxPartsPerPlant_thousandsChange(): void {
        const oldValue = this.domainOptions.maxPartsPerPlant_thousands
        try {
            this.domainOptions.maxPartsPerPlant_thousands = this.maxPartsPerPlant_thousands.Value
        } catch (e) {
            this.domainOptions.maxPartsPerPlant_thousands = oldValue
        }
    }
    
    updateTimeSeriesPlantsOnParameterChangeClick(): void {
        this.domainOptions.updateTimeSeriesPlantsOnParameterChange = this.updateTimeSeriesPlantsOnParameterChange.Checked
    }
    
}

