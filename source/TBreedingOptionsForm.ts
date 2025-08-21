// unit Ubrdopt

from conversion_common import *
import ucursor
import updcom
import ucommand
import usupport
import usection
import umain
import uwinsliders
import updform
import udomain
import ubrstrat
import uplant
import delphi_compatability

// const
const kBetweenGap = 4
const kMaxPlantNameLength = 20



export class TBreedingOptionsForm {
    ok: TButton = new TButton()
    cancel: TButton = new TButton()
    upImage: TImage = new TImage()
    downImage: TImage = new TImage()
    breedingOptions: TTabbedNotebook = new TTabbedNotebook()
    treatColorsAsNumbers: TCheckBox = new TCheckBox()
    chooseTdosRandomly: TCheckBox = new TCheckBox()
    currentTdoLibraryFileName: TEdit = new TEdit()
    weightLabel: TLabel = new TLabel()
    weightAmountLabel: TLabel = new TLabel()
    weightZero: TLabel = new TLabel()
    weightSlider: KfWinSlider = new KfWinSlider()
    weightOneHundred: TLabel = new TLabel()
    weightSelectAll: TButton = new TButton()
    weightSelectNone: TButton = new TButton()
    weightSections: TListBox = new TListBox()
    mutationLabel: TLabel = new TLabel()
    mutationAmountLabel: TLabel = new TLabel()
    mutationZero: TLabel = new TLabel()
    mutationSlider: KfWinSlider = new KfWinSlider()
    mutationOneHundred: TLabel = new TLabel()
    mutationSections: TListBox = new TListBox()
    mutationSelectAll: TButton = new TButton()
    mutationSelectNone: TButton = new TButton()
    nonNumericLabel: TLabel = new TLabel()
    firstPlantIfEqualLabel: TLabel = new TLabel()
    alwaysCopyFromFirstPlant: TRadioButton = new TRadioButton()
    alwaysCopyFromSecondPlant: TRadioButton = new TRadioButton()
    copyRandomlyBasedOnWeights: TRadioButton = new TRadioButton()
    copyBasedOnWeightsIfEqualFirstPlant: TRadioButton = new TRadioButton()
    copyBasedOnWeightsIfEqualSecondPlant: TRadioButton = new TRadioButton()
    copyBasedOnWeightsIfEqualChooseRandomly: TRadioButton = new TRadioButton()
    helpButton: TSpeedButton = new TSpeedButton()
    mutationShowSections: TSpeedButton = new TSpeedButton()
    weightShowSections: TSpeedButton = new TSpeedButton()
    changeTdoLibrary: TSpeedButton = new TSpeedButton()
    GroupBox1: TGroupBox = new TGroupBox()
    Label4: TLabel = new TLabel()
    Label1: TLabel = new TLabel()
    Label2: TLabel = new TLabel()
    thumbnailWidth: TSpinEdit = new TSpinEdit()
    thumbnailHeight: TSpinEdit = new TSpinEdit()
    GroupBox2: TGroupBox = new TGroupBox()
    Label3: TLabel = new TLabel()
    plantsPerGeneration: TSpinEdit = new TSpinEdit()
    Label6: TLabel = new TLabel()
    maxGenerations: TSpinEdit = new TSpinEdit()
    Label8: TLabel = new TLabel()
    Label7: TLabel = new TLabel()
    percentMaxAge: TSpinEdit = new TSpinEdit()
    maxPartsPerPlant_thousands: TSpinEdit = new TSpinEdit()
    Label9: TLabel = new TLabel()
    GroupBox3: TGroupBox = new TGroupBox()
    numTimeSeriesStages: TSpinEdit = new TSpinEdit()
    Label5: TLabel = new TLabel()
    updateTimeSeriesPlantsOnParameterChange: TCheckBox = new TCheckBox()
    options: BreedingAndTimeSeriesOptionsStructure = new BreedingAndTimeSeriesOptionsStructure()
    domainOptions: DomainOptionsStructure = new DomainOptionsStructure()
    draggingMutationSlider: boolean = false
    draggingWeightSlider: boolean = false
    mutationSectionsOpen: boolean = false
    weightSectionsOpen: boolean = false
    TBreedingOptionsForm.prototype = new PdForm()
    TBreedingOptionsForm.prototype.constructor = TBreedingOptionsForm
    
    //$R *.DFM
    // ---------------------------------------------------------------------------------------- create/destroy 
    FormCreate(Sender: TObject): void {
        this.breedingOptions.pageIndex = 0
        this.mutationSections.Visible = false
        this.mutationSelectAll.Visible = false
        this.mutationSelectNone.Visible = false
        this.weightSections.Visible = false
        this.weightSelectAll.Visible = false
        this.weightSelectNone.Visible = false
        this.loadSectionsIntoListBoxes()
        this.currentTdoLibraryFileName.Text = udomain.domain.defaultTdoLibraryFileName
        this.currentTdoLibraryFileName.SelStart = len(this.currentTdoLibraryFileName.Text)
    }
    
    initializeWithBreedingAndTimeSeriesOptionsAndDomainOptions(anOptions: BreedingAndTimeSeriesOptionsStructure, aDomainOptions: DomainOptionsStructure): void {
        this.options = anOptions
        this.domainOptions = aDomainOptions
        this.updateComponentsFromOptions()
    }
    
    // ------------------------------------------------------------------------------- buttons 
    okClick(Sender: TObject): void {
        this.ModalResult = mrOK
    }
    
    cancelClick(Sender: TObject): void {
        this.ModalResult = mrCancel
    }
    
    // ---------------------------------------------------------------------------- reading breeding options 
    updateComponentsFromOptions(): void {
        this.mutationSections.Invalidate()
        this.weightSections.Invalidate()
        this.mutationSectionsClick(this)
        this.weightSectionsClick(this)
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
            case ubrstrat.kFromFirstPlant:
                result = this.alwaysCopyFromFirstPlant
                break
            case ubrstrat.kFromSecondPlant:
                result = this.alwaysCopyFromSecondPlant
                break
            case ubrstrat.kFromProbabilityBasedOnWeightsForSection:
                result = this.copyRandomlyBasedOnWeights
                break
            case ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant:
                result = this.copyBasedOnWeightsIfEqualFirstPlant
                break
            case ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant:
                result = this.copyBasedOnWeightsIfEqualSecondPlant
                break
            case ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly:
                result = this.copyBasedOnWeightsIfEqualChooseRandomly
                break
        }
        return result
    }
    
    choiceIndexForRadioButton(radio: TRadioButton): short {
        let result = 0
        result = 0
        if (radio === this.alwaysCopyFromFirstPlant) {
            result = ubrstrat.kFromFirstPlant
        } else if (radio === this.alwaysCopyFromSecondPlant) {
            result = ubrstrat.kFromSecondPlant
        } else if (radio === this.copyRandomlyBasedOnWeights) {
            result = ubrstrat.kFromProbabilityBasedOnWeightsForSection
        } else if (radio === this.copyBasedOnWeightsIfEqualFirstPlant) {
            result = ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualFirstPlant
        } else if (radio === this.copyBasedOnWeightsIfEqualSecondPlant) {
            result = ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualSecondPlant
        } else if (radio === this.copyBasedOnWeightsIfEqualChooseRandomly) {
            result = ubrstrat.kFromPlantWithGreaterWeightForSectionIfEqualChooseRandomly
        }
        return result
    }
    
    // ------------------------------------------------------------ changing breeding strategy 
    mutationSliderMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if ((this.firstSelectedIndex(this.mutationSections) >= 0) || (!this.mutationSectionsOpen)) {
            this.draggingMutationSlider = true
        }
    }
    
    mutationSliderMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        if (this.draggingMutationSlider) {
            this.mutationAmountLabel.Caption = IntToStr(this.mutationSlider.CurrentValue) + "%"
            this.updateMutationOrWeightFromSlider(ubrstrat.kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        }
    }
    
    mutationSliderMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.draggingMutationSlider = false
        this.updateMutationOrWeightFromSlider(ubrstrat.kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
    }
    
    mutationSliderKeyUp(Sender: TObject, Key: byte, Shift: TShiftState): void {
        this.updateMutationOrWeightFromSlider(ubrstrat.kMutation, this.mutationSectionsOpen, this.mutationSections, this.mutationSlider)
        return Key
    }
    
    weightSliderMouseDown(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        if ((this.firstSelectedIndex(this.weightSections) >= 0) || (!this.weightSectionsOpen)) {
            this.draggingWeightSlider = true
        }
    }
    
    weightSliderMouseMove(Sender: TObject, Shift: TShiftState, X: int, Y: int): void {
        if (this.draggingWeightSlider) {
            this.weightAmountLabel.Caption = IntToStr(this.weightSlider.CurrentValue) + "%"
        }
    }
    
    weightSliderMouseUp(Sender: TObject, Button: TMouseButton, Shift: TShiftState, X: int, Y: int): void {
        this.draggingWeightSlider = false
        this.updateMutationOrWeightFromSlider(ubrstrat.kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
    }
    
    weightSliderKeyUp(Sender: TObject, Key: byte, Shift: TShiftState): void {
        this.updateMutationOrWeightFromSlider(ubrstrat.kWeight, this.weightSectionsOpen, this.weightSections, this.weightSlider)
        return Key
    }
    
    updateMutationOrWeightFromSlider(which: short, isOpen: boolean, aListBox: TListBox, aSlider: KfWinSlider): void {
        let i: short
        
        if (aListBox.Items.Count > 0) {
            for (i = 0; i <= aListBox.Items.Count - 1; i++) {
                if (aListBox.Selected[i] || (!isOpen)) {
                    if (which === ubrstrat.kMutation) {
                        this.options.mutationStrengths[i] = aSlider.CurrentValue
                    } else {
                        this.options.firstPlantWeights[i] = aSlider.CurrentValue
                    }
                }
            }
        }
        aListBox.Invalidate()
    }
    
    alwaysCopyFromFirstPlantClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    alwaysCopyFromSecondPlantClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyRandomlyBasedOnWeightsClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualFirstPlantClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualSecondPlantClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    copyBasedOnWeightsIfEqualChooseRandomlyClick(Sender: TObject): void {
        this.updateOptionsForNonNumericChoice()
    }
    
    updateOptionsForNonNumericChoice(): void {
        let i: short
        let radio: TRadioButton
        
        if (this.breedingOptions.controlCount > 0) {
            for (i = 1; i <= this.breedingOptions.controlCount - 1; i++) {
                if ((this.breedingOptions.controls[i] instanceof delphi_compatability.TRadioButton)) {
                    // this will work so long as there are no other radio buttons on the notebook
                    radio = (this.breedingOptions.controls[i])
                    if (radio.Checked) {
                        this.options.getNonNumericalParametersFrom = this.choiceIndexForRadioButton(radio)
                    }
                    break
                }
            }
        }
    }
    
    treatColorsAsNumbersClick(Sender: TObject): void {
        this.options.mutateAndBlendColorValues = this.treatColorsAsNumbers.Checked
    }
    
    chooseTdosRandomlyClick(Sender: TObject): void {
        this.options.chooseTdosRandomlyFromCurrentLibrary = this.chooseTdosRandomly.Checked
    }
    
    // ------------------------------------------------------------------ sections list boxes 
    loadSectionsIntoListBoxes(): void {
        let section: PdSection
        let i: short
        
        if ((udomain.domain === null) || (udomain.domain.sectionManager === null)) {
            return
        }
        this.mutationSections.Clear()
        this.weightSections.Clear()
        if (udomain.domain.sectionManager.sections.Count > 0) {
            for (i = 0; i <= udomain.domain.sectionManager.sections.Count - 1; i++) {
                section = usection.PdSection(udomain.domain.sectionManager.sections.Items[i])
                if (section.showInParametersWindow) {
                    this.mutationSections.Items.AddObject(section.getName(), section)
                    this.weightSections.Items.AddObject(section.getName(), section)
                }
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
        let sectionsListBox: TListBox
        let section: PdSection
        let selected: boolean
        let cText: char[] /* 255 + 1 */
        
        if (delphi_compatability.Application.terminated) {
            return
        }
        sectionsListBox = Control
        if (sectionsListBox === null) {
            return
        }
        if ((sectionsListBox.Items.Count <= 0) || (index < 0) || (index > sectionsListBox.Items.Count - 1)) {
            return
        }
        selected = (delphi_compatability.TOwnerDrawStateType.odSelected in State)
        // set up section pointer 
        section = sectionsListBox.Items.Objects[index]
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
        if (sectionsListBox === this.mutationSections) {
            UNRESOLVED.strPCopy(cText, section.getName() + " " + IntToStr(this.options.mutationStrengths[index]) + "%")
        } else {
            UNRESOLVED.strPCopy(cText, section.getName() + " " + IntToStr(this.options.firstPlantWeights[index]) + "/" + IntToStr(100 - this.options.firstPlantWeights[index]))
        }
        // margin for text 
        Rect.left = Rect.left + 2
        UNRESOLVED.winprocs.drawText(sectionsListBox.Canvas.Handle, cText, len(cText), Rect, delphi_compatability.DT_LEFT)
    }
    
    mutationSectionsClick(Sender: TObject): void {
        this.updateSliderForSelectedSections(ubrstrat.kMutation, this.mutationSectionsOpen, this.mutationSlider, this.mutationSections, this.mutationAmountLabel)
    }
    
    weightSectionsClick(Sender: TObject): void {
        this.updateSliderForSelectedSections(ubrstrat.kWeight, this.weightSectionsOpen, this.weightSlider, this.weightSections, this.weightAmountLabel)
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
            if (which === ubrstrat.kMutation) {
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
    
    firstSelectedIndex(aListBox: TListBox): short {
        let result = 0
        let i: short
        
        result = -1
        if (aListBox.Items.Count <= 0) {
            return result
        }
        if (aListBox.SelCount < 1) {
            return result
        }
        for (i = 0; i <= aListBox.Items.Count - 1; i++) {
            if (aListBox.Selected[i]) {
                result = i
                return result
            }
        }
        return result
    }
    
    mutationShowSectionsClick(Sender: TObject): void {
        this.mutationSectionsOpen = !this.mutationSectionsOpen
        if (this.mutationSectionsOpen) {
            this.mutationShowSections.Glyph = this.upImage.Picture.Bitmap
            this.mutationSections.Visible = true
            this.mutationSelectAll.Visible = true
            this.mutationSelectNone.Visible = true
            // select all 
            this.mutationSelectAllClick(this)
            this.mutationSectionsClick(this)
        } else {
            this.mutationSections.Visible = false
            this.mutationSelectAll.Visible = false
            this.mutationSelectNone.Visible = false
            this.mutationShowSections.Glyph = this.downImage.Picture.Bitmap
            this.mutationSectionsClick(this)
        }
        this.mutationSections.Visible = this.mutationSectionsOpen
    }
    
    weightShowSectionsClick(Sender: TObject): void {
        this.weightSectionsOpen = !this.weightSectionsOpen
        if (this.weightSectionsOpen) {
            this.weightShowSections.Glyph = this.upImage.Picture.Bitmap
            this.weightSections.Visible = true
            this.weightSelectAll.Visible = true
            this.weightSelectNone.Visible = true
            // select all 
            this.weightSelectAllClick(this)
            this.weightSectionsClick(this)
        } else {
            this.weightSections.Visible = false
            this.weightSelectAll.Visible = false
            this.weightSelectNone.Visible = false
            this.weightShowSections.Glyph = this.downImage.Picture.Bitmap
            this.weightSectionsClick(this)
        }
        this.weightSections.Visible = this.weightSectionsOpen
    }
    
    mutationSelectAllClick(Sender: TObject): void {
        let i: short
        
        if (this.mutationSections.Items.Count > 0) {
            for (i = 0; i <= this.mutationSections.Items.Count - 1; i++) {
                this.mutationSections.Selected[i] = true
            }
        }
    }
    
    mutationSelectNoneClick(Sender: TObject): void {
        let i: short
        
        if (this.mutationSections.Items.Count > 0) {
            for (i = 0; i <= this.mutationSections.Items.Count - 1; i++) {
                this.mutationSections.Selected[i] = false
            }
        }
    }
    
    weightSelectAllClick(Sender: TObject): void {
        let i: short
        
        if (this.weightSections.Items.Count > 0) {
            for (i = 0; i <= this.weightSections.Items.Count - 1; i++) {
                this.weightSections.Selected[i] = true
            }
        }
    }
    
    weightSelectNoneClick(Sender: TObject): void {
        let i: short
        
        if (this.weightSections.Items.Count > 0) {
            for (i = 0; i <= this.weightSections.Items.Count - 1; i++) {
                this.weightSections.Selected[i] = false
            }
        }
    }
    
    changeTdoLibraryClick(Sender: TObject): void {
        let fileNameWithPath: string
        
        fileNameWithPath = usupport.getFileOpenInfo(usupport.kFileTypeTdo, udomain.domain.defaultTdoLibraryFileName, "Choose a 3D object library (tdo) file")
        if (fileNameWithPath === "") {
            return
        }
        this.currentTdoLibraryFileName.Text = fileNameWithPath
        udomain.domain.defaultTdoLibraryFileName = this.currentTdoLibraryFileName.Text
        this.currentTdoLibraryFileName.SelStart = len(this.currentTdoLibraryFileName.Text)
    }
    
    helpButtonClick(Sender: TObject): void {
        delphi_compatability.Application.HelpJump("Changing_breeding_options")
    }
    
    plantsPerGenerationChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.plantsPerGeneration
        try {
            this.options.plantsPerGeneration = this.plantsPerGeneration.Value
        } catch (e) {
            this.options.plantsPerGeneration = oldValue
        }
    }
    
    thumbnailWidthChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.thumbnailWidth
        try {
            this.options.thumbnailWidth = this.thumbnailWidth.Value
        } catch (e) {
            this.options.thumbnailWidth = oldValue
        }
    }
    
    thumbnailHeightChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.thumbnailHeight
        try {
            this.options.thumbnailHeight = this.thumbnailHeight.Value
        } catch (e) {
            this.options.thumbnailHeight = oldValue
        }
    }
    
    maxGenerationsChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.maxGenerations
        try {
            this.options.maxGenerations = this.maxGenerations.Value
        } catch (e) {
            this.options.maxGenerations = oldValue
        }
    }
    
    numTimeSeriesStagesChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.numTimeSeriesStages
        try {
            this.options.numTimeSeriesStages = this.numTimeSeriesStages.Value
        } catch (e) {
            this.options.numTimeSeriesStages = oldValue
        }
    }
    
    percentMaxAgeChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.options.percentMaxAge
        try {
            this.options.percentMaxAge = this.percentMaxAge.Value
        } catch (e) {
            this.options.percentMaxAge = oldValue
        }
    }
    
    maxPartsPerPlant_thousandsChange(Sender: TObject): void {
        let oldValue: short
        
        oldValue = this.domainOptions.maxPartsPerPlant_thousands
        try {
            this.domainOptions.maxPartsPerPlant_thousands = this.maxPartsPerPlant_thousands.Value
        } catch (e) {
            this.domainOptions.maxPartsPerPlant_thousands = oldValue
        }
    }
    
    updateTimeSeriesPlantsOnParameterChangeClick(Sender: TObject): void {
        this.domainOptions.updateTimeSeriesPlantsOnParameterChange = this.updateTimeSeriesPlantsOnParameterChange.Checked
    }
    
}

